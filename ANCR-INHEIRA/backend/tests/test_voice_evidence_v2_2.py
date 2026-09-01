"""INHEIRA v2.2 - Voice Evidence Layer backend tests.

Covers:
  - Backend imports & constants (media_evidence module surface).
  - Voice upload: multipart with duration/location/speakers; response schema.
  - Immediate emission of voice_memo_recorded event at upload time.
  - Whisper transcription completes + Claude Sonnet 5 classification produces
    detected_moments in the 9 MOMENT_KINDS with the required schema.
  - Guardrail: unconfirmed detected moments DO NOT emit downstream events.
  - Review flows: confirmed / corrected / disputed / annotated + 400/404.
  - Sensitivity mapping: sensitive kinds use secure_reference and don't leak
    raw excerpts into the emitted evidence payload.
  - list/get/audio endpoints + access control (no-session-access => 403).
  - Speaker add. Reclassify preserves reviewed moments + de-dupes.
  - _split_audio_if_needed fast-path unit test.
"""
import io
import json
import os
import subprocess
import time
from pathlib import Path

import pytest
import requests
from dotenv import dotenv_values

fenv = dotenv_values("/app/frontend/.env")
BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or fenv.get("REACT_APP_BACKEND_URL")).rstrip("/")
API = f"{BASE_URL}/api"

SEED_EMAIL = "test@songright.com"
SEED_PW = "Test1234!"
SESSION_ID = "sess_96285667fb26"

SPOKEN_TEXT = ("I think the bridge should modulate up a whole step. "
               "Let's give writer 50 percent and producer 30 percent. "
               "I approve this version.")


@pytest.fixture(scope="module")
def spoken_mp3(tmp_path_factory):
    d = tmp_path_factory.mktemp("voice")
    wav = d / "spoken.wav"
    mp3 = d / "spoken.mp3"
    subprocess.check_call(
        ["espeak-ng", "-v", "en+f3", "-s", "140", "-w", str(wav), SPOKEN_TEXT],
        stderr=subprocess.DEVNULL,
    )
    subprocess.check_call(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), str(mp3)],
        stderr=subprocess.DEVNULL,
    )
    assert mp3.exists() and mp3.stat().st_size > 1000
    return mp3


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{API}/auth/login", json={"email": SEED_EMAIL, "password": SEED_PW})
    if r.status_code != 200:
        pytest.fail(f"Auth failed: {r.status_code} {r.text[:400]}")
    return r.json()["token"]


@pytest.fixture(scope="module")
def client(token):
    s = requests.Session()
    s.headers.update({"Authorization": f"Bearer {token}"})
    return s


# --------------- module surface ---------------
class TestModuleSurface:
    def test_media_evidence_imports(self):
        import sys
        sys.path.insert(0, "/app/backend")
        import media_evidence
        for name in ("process_recording", "promote_moment_to_evidence",
                     "MOMENT_KINDS", "MOMENT_TO_EVIDENCE_KIND", "HUMAN_STATUSES",
                     "_split_audio_if_needed"):
            assert hasattr(media_evidence, name), f"missing {name}"
        assert set(media_evidence.HUMAN_STATUSES) == {
            "unconfirmed", "confirmed", "corrected", "disputed", "annotated"
        }
        assert len(media_evidence.MOMENT_KINDS) == 9

    def test_server_imports_asyncio_and_pydub_reachable(self):
        import sys
        sys.path.insert(0, "/app/backend")
        import server
        assert hasattr(server, "asyncio")
        # media_evidence import triggers pydub availability
        import media_evidence  # noqa

    def test_split_fast_path(self, spoken_mp3):
        import sys
        sys.path.insert(0, "/app/backend")
        import media_evidence
        chunks = media_evidence._split_audio_if_needed(str(spoken_mp3), spoken_mp3.stat().st_size)
        assert chunks == [(str(spoken_mp3), 0.0)]


# --------------- upload + immediate event ---------------
@pytest.fixture(scope="module")
def uploaded(client, spoken_mp3):
    with open(spoken_mp3, "rb") as fh:
        files = {"file": ("spoken.mp3", fh, "audio/mpeg")}
        data = {"duration_sec": "8", "location": "TEST_studio_A"}
        r = client.post(f"{API}/sessions/{SESSION_ID}/voice", files=files, data=data)
    assert r.status_code == 200, r.text
    return r.json()


class TestUpload:
    def test_upload_response_schema(self, uploaded):
        d = uploaded
        assert d["recording_id"].startswith("rec_")
        assert d["media_kind"] == "voice"
        assert d["size_bytes"] > 1000
        assert len(d["content_hash"]) == 64
        assert d["transcription_status"] == "pending"
        assert d["moments_status"] == "pending"
        assert d["voice_memo_event_id"].startswith("evt_")
        assert isinstance(d.get("rightprint_identities_present"), list)

    def test_voice_memo_event_exists_immediately(self, client, uploaded):
        # Query evidence stream right after upload — before transcription completes.
        r = client.get(f"{API}/sessions/{SESSION_ID}/evidence",
                       params={"kind": "voice_memo_recorded", "limit": 50})
        assert r.status_code == 200, r.text
        rows = r.json()
        match = [e for e in rows if e.get("payload", {}).get("recording_id") == uploaded["recording_id"]]
        assert match, "voice_memo_recorded event missing at upload time"
        ev = match[0]
        assert ev["sensitivity"] == "creative"
        assert ev["payload"]["sha256"] == uploaded["content_hash"]
        assert ev["event_id"] == uploaded["voice_memo_event_id"]


# --------------- pipeline completes ---------------
@pytest.fixture(scope="module")
def transcribed(client, uploaded):
    rid = uploaded["recording_id"]
    deadline = time.time() + 120
    last = None
    while time.time() < deadline:
        r = client.get(f"{API}/voice/{rid}")
        assert r.status_code == 200, r.text
        last = r.json()
        if last.get("transcription_status") == "done" and last.get("moments_status") in ("done", "failed"):
            break
        time.sleep(5)
    # Guardrail snapshot (must be captured BEFORE any review test runs, since
    # pytest-xdist may schedule review-flow tests in the same worker earlier).
    ev = client.get(f"{API}/sessions/{SESSION_ID}/evidence",
                    params={"kind": "chord_progression_changed", "limit": 500}).json()
    voice_derived = [e for e in ev
                     if (e.get("payload") or {}).get("source") == "voice_evidence"
                     and (e.get("payload") or {}).get("recording_id") == rid]
    last["__guardrail_voice_derived_before_review"] = voice_derived
    return last


class TestPipeline:
    def test_transcription_done(self, transcribed):
        assert transcribed["transcription_status"] == "done", transcribed
        assert transcribed.get("transcript"), "empty transcript"
        assert isinstance(transcribed.get("segments"), list) and len(transcribed["segments"]) > 0
        assert transcribed.get("language") == "en" or transcribed.get("language")

    def test_moments_done_with_valid_schema(self, transcribed):
        import sys; sys.path.insert(0, "/app/backend")
        import media_evidence
        assert transcribed["moments_status"] == "done", transcribed
        moments = transcribed.get("detected_moments") or []
        assert len(moments) > 0, "expected at least one detected moment"
        for m in moments:
            assert m["moment_id"].startswith("mom_")
            assert m["kind"] in media_evidence.MOMENT_KINDS
            assert isinstance(m.get("excerpt"), str) and m["excerpt"]
            assert 0.0 <= float(m["confidence"]) <= 1.0
            assert m["human_status"] == "unconfirmed"
            assert m["human_action_by"] is None
            assert m["human_action_at"] is None
            assert m["human_correction"] is None
            assert m["human_note"] is None
            assert m.get("detected_at")

    def test_playback_url(self, client, transcribed):
        rid = transcribed["recording_id"]
        assert transcribed["playback_url"] == f"/api/voice/{rid}/audio"
        r = client.get(f"{API}/voice/{rid}/audio")
        assert r.status_code == 200
        assert r.headers.get("content-type", "").startswith("audio")
        assert len(r.content) > 1000


class TestGuardrail:
    def test_no_downstream_event_before_review(self, transcribed):
        # Snapshot captured inside the `transcribed` fixture, guaranteed pre-review.
        assert transcribed["__guardrail_voice_derived_before_review"] == [], \
            "voice-derived downstream event emitted before human review"


# --------------- review flows ---------------
def _pick(moments, kind):
    return next((m for m in moments if m["kind"] == kind), None)


class TestReviewFlows:
    def test_review_unknown_action_400(self, client, transcribed):
        rid = transcribed["recording_id"]
        mid = transcribed["detected_moments"][0]["moment_id"]
        r = client.post(f"{API}/voice/{rid}/moments/{mid}/review",
                        json={"action": "bogus"})
        assert r.status_code == 400, r.text

    def test_review_unknown_moment_404(self, client, transcribed):
        rid = transcribed["recording_id"]
        r = client.post(f"{API}/voice/{rid}/moments/mom_nonexistent/review",
                        json={"action": "confirmed"})
        assert r.status_code == 404, r.text

    def test_confirm_harmony_emits_chord_progression_changed(self, client, transcribed):
        rid = transcribed["recording_id"]
        moments = transcribed["detected_moments"]
        target = _pick(moments, "harmony_idea")
        if not target:
            pytest.skip("no harmony_idea moment detected")
        r = client.post(f"{API}/voice/{rid}/moments/{target['moment_id']}/review",
                        json={"action": "confirmed"})
        assert r.status_code == 200, r.text
        m = r.json()
        assert m["human_status"] == "confirmed"
        assert m["propagated_event_kind"] == "chord_progression_changed"
        # Verify a fresh evidence event exists
        rr = client.get(f"{API}/sessions/{SESSION_ID}/evidence",
                        params={"kind": "chord_progression_changed", "limit": 200})
        assert rr.status_code == 200
        matches = [e for e in rr.json()
                   if (e.get("payload") or {}).get("recording_id") == rid
                   and (e.get("payload") or {}).get("moment_id") == target["moment_id"]]
        assert matches, "downstream event not emitted after confirm"
        ev = matches[0]
        assert ev["sensitivity"] == "creative"
        assert ev["payload"]["source"] == "voice_evidence"
        assert ev.get("parent_event_id") == transcribed["voice_memo_event_id"]

    def test_dispute_rights_no_downstream(self, client, transcribed):
        rid = transcribed["recording_id"]
        target = _pick(transcribed["detected_moments"], "rights_discussion") \
                 or _pick(transcribed["detected_moments"], "split_conversation")
        if not target:
            pytest.skip("no rights/split moment detected")
        # Snapshot rights_discussion events before
        r0 = client.get(f"{API}/sessions/{SESSION_ID}/evidence",
                        params={"kind": "rights_discussion", "limit": 500}).json()
        pre_ids = {e["event_id"] for e in r0}
        r = client.post(f"{API}/voice/{rid}/moments/{target['moment_id']}/review",
                        json={"action": "disputed", "note": "Not actually a split discussion"})
        assert r.status_code == 200, r.text
        m = r.json()
        assert m["human_status"] == "disputed"
        assert m["human_note"] == "Not actually a split discussion"
        assert "propagated_event_kind" not in m or m.get("propagated_event_kind") is None
        r1 = client.get(f"{API}/sessions/{SESSION_ID}/evidence",
                        params={"kind": "rights_discussion", "limit": 500}).json()
        new = [e for e in r1 if e["event_id"] not in pre_ids
               and (e.get("secure_reference") or {}).get("moment_id") == target["moment_id"]]
        assert not new, "downstream rights_discussion emitted on dispute"

    def test_final_approval_confirm_is_sensitive_and_hides_excerpt(self, client, transcribed):
        rid = transcribed["recording_id"]
        r0 = client.get(f"{API}/voice/{rid}").json()
        target = next((m for m in r0["detected_moments"]
                       if m["kind"] == "final_approval" and m["human_status"] == "unconfirmed"), None)
        if not target:
            pytest.skip("no unconfirmed final_approval moment")
        excerpt = target["excerpt"]
        r = client.post(f"{API}/voice/{rid}/moments/{target['moment_id']}/review",
                        json={"action": "confirmed"})
        assert r.status_code == 200, r.text
        assert r.json()["propagated_event_kind"] == "approval_signed"
        rr = client.get(f"{API}/sessions/{SESSION_ID}/evidence",
                        params={"kind": "approval_signed", "limit": 200}).json()
        matches = [e for e in rr
                   if (e.get("secure_reference") or {}).get("moment_id") == target["moment_id"]]
        assert matches, "approval_signed event not emitted (no matching secure_reference)"
        ev = matches[0]
        assert ev["sensitivity"] == "sensitive"
        assert ev.get("secure_reference"), "sensitive event missing secure_reference"
        assert ev["secure_reference"].get("collection") == "voice_evidence"
        payload_str = json.dumps(ev.get("payload") or {})
        assert excerpt not in payload_str, "raw excerpt leaked into sensitive payload"

    def test_annotate_no_downstream(self, client, transcribed):
        rid = transcribed["recording_id"]
        # find any still-unconfirmed non-final_approval moment (final_approval is reserved
        # for the sensitivity test which needs it as an unconfirmed target)
        r0 = client.get(f"{API}/voice/{rid}").json()
        cand = next((m for m in r0["detected_moments"]
                     if m["human_status"] == "unconfirmed" and m["kind"] != "final_approval"), None)
        if not cand:
            pytest.skip("no unconfirmed moment left")
        r = client.post(f"{API}/voice/{rid}/moments/{cand['moment_id']}/review",
                        json={"action": "annotated", "note": "Context: this was hypothetical"})
        assert r.status_code == 200, r.text
        m = r.json()
        assert m["human_status"] == "annotated"
        assert m["human_note"] == "Context: this was hypothetical"

    def test_correct_maps_to_new_kind(self, client, transcribed):
        rid = transcribed["recording_id"]
        r0 = client.get(f"{API}/voice/{rid}").json()
        # Prefer a non-final_approval unconfirmed moment
        cand = next((m for m in r0["detected_moments"]
                     if m["human_status"] == "unconfirmed" and m["kind"] != "final_approval"), None)
        if not cand:
            cand = next((m for m in r0["detected_moments"] if m["human_status"] == "unconfirmed"), None)
        if not cand:
            pytest.skip("no unconfirmed moment left to correct")
        r = client.post(f"{API}/voice/{rid}/moments/{cand['moment_id']}/review",
                        json={"action": "corrected",
                              "correction": {"kind": "melody_idea", "excerpt": "Corrected excerpt"}})
        assert r.status_code == 200, r.text
        m = r.json()
        assert m["human_status"] == "corrected"
        assert m["propagated_event_kind"] == "melody_changed"
        assert (m.get("human_correction") or {}).get("kind") == "melody_idea"


class TestSensitivityMapping:
    def test_placeholder(self):
        # Real sensitivity check runs inside TestReviewFlows.test_final_approval_confirm_is_sensitive_and_hides_excerpt
        pass# --------------- list + speakers + reclassify + access control ---------------
class TestListSpeakersReclassify:
    def test_list_sorted_newest_first(self, client, uploaded):
        r = client.get(f"{API}/sessions/{SESSION_ID}/voice")
        assert r.status_code == 200
        docs = r.json()
        assert any(d["recording_id"] == uploaded["recording_id"] for d in docs)
        # sorted desc by created_at
        ts = [d.get("created_at") for d in docs if d.get("created_at")]
        assert ts == sorted(ts, reverse=True)

    def test_add_speaker(self, client, uploaded):
        rid = uploaded["recording_id"]
        r = client.post(f"{API}/voice/{rid}/speakers",
                        json={"name": "Session Guest", "role": "vocalist"})
        assert r.status_code == 200, r.text
        rec = client.get(f"{API}/voice/{rid}").json()
        assert any(s.get("name") == "Session Guest" for s in rec.get("additional_speakers", []))

    def test_reclassify_preserves_reviewed(self, client, transcribed):
        rid = transcribed["recording_id"]
        # snapshot reviewed moments
        pre = client.get(f"{API}/voice/{rid}").json()["detected_moments"]
        reviewed_ids = {m["moment_id"] for m in pre if m["human_status"] != "unconfirmed"}
        r = client.post(f"{API}/voice/{rid}/reclassify")
        assert r.status_code == 200, r.text
        post = client.get(f"{API}/voice/{rid}").json()["detected_moments"]
        post_ids = {m["moment_id"] for m in post}
        assert reviewed_ids.issubset(post_ids), "reclassify dropped reviewed moments"
        # Also verify de-dupe: no two moments have same (kind, excerpt)
        seen = set()
        dupes = 0
        for m in post:
            key = (m["kind"], (m.get("excerpt") or "").strip())
            if key in seen:
                dupes += 1
            seen.add(key)
        assert dupes == 0, "reclassify introduced duplicate (kind, excerpt) moments"


class TestAccessControl:
    def test_stranger_403_on_audio(self, uploaded):
        # Create a fresh user + login
        import secrets
        email = f"TEST_stranger_{secrets.token_hex(4)}@example.com"
        pw = "Test1234!"
        rr = requests.post(f"{API}/auth/register",
                           json={"email": email, "password": pw, "name": "Stranger"})
        if rr.status_code not in (200, 201):
            pytest.skip(f"cannot register stranger: {rr.status_code} {rr.text[:200]}")
        token = rr.json().get("token") or requests.post(
            f"{API}/auth/login", json={"email": email, "password": pw}).json().get("token")
        assert token
        s = requests.Session()
        s.headers.update({"Authorization": f"Bearer {token}"})
        rid = uploaded["recording_id"]
        r = s.get(f"{API}/voice/{rid}/audio")
        assert r.status_code == 403, f"expected 403, got {r.status_code}"
        r2 = s.get(f"{API}/voice/{rid}")
        assert r2.status_code == 403
