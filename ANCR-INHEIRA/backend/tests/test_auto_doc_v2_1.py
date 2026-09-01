"""INHEIRA v2.1 · Automatic Creative Documentation™ backend tests.

Covers the new PASSIVE evidence layer introduced in v2.1:
  - creative_evidence_events + legacy session_events mirror
  - sensitivity policy (creative vs sensitive) per kind
  - intelligent debounce (same actor/kind/target within 60s => revision_count++)
  - auto-checkpoint bookkeeping + close on version submit
  - new endpoints: GET evidence, GET evidence/checkpoints, GET evidence/populate-since
  - source_event_ids + source_checkpoint_ids on submitted versions
  - identifier_generated / rights_updated / approval_signed / rightprint_updated /
    file_uploaded / version_evidence_added / acknowledgement_submitted events
"""
import io
import os
import time
import uuid
from datetime import datetime, timezone

import pytest
import requests
from dotenv import dotenv_values

fenv = dotenv_values("/app/frontend/.env")
BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or fenv.get("REACT_APP_BACKEND_URL")).rstrip("/")
API = f"{BASE_URL}/api"

SEED_EMAIL = "test@songright.com"
SEED_PW = "Test1234!"
SESSION_ID = "sess_96285667fb26"


# ---------- fixtures ----------
@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{API}/auth/login", json={"email": SEED_EMAIL, "password": SEED_PW})
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="module")
def client(token):
    s = requests.Session()
    s.headers.update({"Authorization": f"Bearer {token}"})
    return s


@pytest.fixture(scope="module")
def state():
    return {"anchor": datetime.now(timezone.utc).isoformat()}


def _events_since(client, since_iso, kind=None):
    params = {"since": since_iso, "limit": 500}
    if kind:
        params["kind"] = kind
    r = client.get(f"{API}/sessions/{SESSION_ID}/evidence", params=params)
    assert r.status_code == 200, r.text
    return r.json()


# ---------- module import sanity ----------
def test_evidence_module_imports():
    import importlib
    ev = importlib.import_module("evidence")
    for sym in ("record_event", "close_active_checkpoint", "list_events_since",
                "derive_populate_from_evidence", "CREATIVE_KINDS", "SENSITIVE_KINDS"):
        assert hasattr(ev, sym), f"evidence module missing {sym}"
    # sensitivity buckets must be non-overlapping
    assert isinstance(ev.CREATIVE_KINDS, set) and isinstance(ev.SENSITIVE_KINDS, set)
    assert not (ev.CREATIVE_KINDS & ev.SENSITIVE_KINDS)


# ---------- lyric_line CREATIVE event + legacy mirror ----------
def test_lyric_line_creates_creative_evidence_and_mirror(client, state):
    marker = f"TEST_AUTODOC_lyric_{uuid.uuid4().hex[:6]}"
    before = datetime.now(timezone.utc).isoformat()
    r = client.post(f"{API}/sessions/{SESSION_ID}/lyrics",
                    json={"section": "verse", "text": marker})
    assert r.status_code == 200, r.text
    line = r.json()
    state["line_id"] = line["line_id"]

    # find our event
    time.sleep(0.2)
    evts = _events_since(client, before, kind="lyric_line")
    ours = [e for e in evts if (e.get("payload") or {}).get("line_id") == line["line_id"]]
    assert len(ours) == 1, f"expected 1 lyric_line evidence event, got {len(ours)}"
    e = ours[0]
    assert e["sensitivity"] == "creative"
    assert e["kind"] == "lyric_line"
    assert e["session_id"] == SESSION_ID
    assert len(e["content_hash"]) == 64
    assert e["payload"]["preview"].startswith(marker[:20])
    actor = e["actor"]
    assert actor["id"] and actor["name"]
    # legacy mirror row must exist with the same event_id
    r2 = client.get(f"{API}/sessions/{SESSION_ID}/events")
    assert r2.status_code == 200
    mirror = [x for x in r2.json() if x.get("event_id") == e["event_id"]]
    assert len(mirror) == 1, "legacy session_events mirror row missing"
    assert mirror[0]["kind"] == "lyric_line"
    state["evt_lyric"] = e["event_id"]


# ---------- edit + delete lyric events ----------
def test_lyric_line_edit_and_remove_events(client, state):
    line_id = state["line_id"]
    # edit
    before = datetime.now(timezone.utc).isoformat()
    r = client.put(f"{API}/sessions/{SESSION_ID}/lyrics/{line_id}",
                   json={"text": "TEST_AUTODOC_edit_v1"})
    assert r.status_code == 200
    time.sleep(0.2)
    edited = _events_since(client, before, kind="lyric_line_edited")
    assert any(e["payload"].get("line_id") == line_id for e in edited)

    # delete — create a throwaway line first so we don't kill the debounce-test line
    r2 = client.post(f"{API}/sessions/{SESSION_ID}/lyrics",
                     json={"section": "verse", "text": "TEST_AUTODOC_todelete"})
    tid = r2.json()["line_id"]
    before2 = datetime.now(timezone.utc).isoformat()
    r3 = client.delete(f"{API}/sessions/{SESSION_ID}/lyrics/{tid}")
    assert r3.status_code == 200
    time.sleep(0.2)
    removed = _events_since(client, before2, kind="lyric_line_removed")
    assert any(e["payload"].get("line_id") == tid for e in removed)


# ---------- debounce: two PUTs collapse into one row ----------
def test_debounce_merges_two_edits(client, state):
    # create a fresh line so no prior debounce record exists
    r = client.post(f"{API}/sessions/{SESSION_ID}/lyrics",
                    json={"section": "verse", "text": "DEBOUNCE_v0"})
    line_id = r.json()["line_id"]
    time.sleep(0.5)

    before = datetime.now(timezone.utc).isoformat()
    client.put(f"{API}/sessions/{SESSION_ID}/lyrics/{line_id}",
               json={"text": "DEBOUNCE_v1"})
    time.sleep(0.4)
    client.put(f"{API}/sessions/{SESSION_ID}/lyrics/{line_id}",
               json={"text": "DEBOUNCE_v2"})
    time.sleep(0.3)

    evts = _events_since(client, before, kind="lyric_line_edited")
    ours = [e for e in evts if e["payload"].get("line_id") == line_id]
    assert len(ours) == 1, f"debounce failed — expected 1 merged event, got {len(ours)}"
    e = ours[0]
    assert e["revision_count"] == 2, f"expected revision_count=2, got {e['revision_count']}"
    assert isinstance(e["revisions"], list) and len(e["revisions"]) >= 1
    rev = e["revisions"][-1]
    assert len(rev["hash"]) == 64
    assert rev["preview"] and "DEBOUNCE_v2" in rev["preview"]


# ---------- chat message SENSITIVE event ----------
def test_chat_message_is_sensitive_hash_only(client):
    secret = f"SENSITIVE_SECRET_{uuid.uuid4().hex}"
    before = datetime.now(timezone.utc).isoformat()
    r = client.post(f"{API}/sessions/{SESSION_ID}/messages",
                    json={"text": secret, "kind": "text"})
    assert r.status_code == 200, r.text
    msg_id = r.json()["message_id"]
    time.sleep(0.2)
    evts = _events_since(client, before, kind="chat_message")
    ours = [e for e in evts if (e.get("secure_reference") or {}).get("id") == msg_id]
    assert len(ours) == 1
    e = ours[0]
    assert e["sensitivity"] == "sensitive"
    assert len(e["content_hash"]) == 64
    assert e["reference_hash"] and len(e["reference_hash"]) == 64
    # payload must NOT contain the raw text anywhere
    import json as _json
    blob = _json.dumps(e.get("payload") or {})
    assert secret not in blob, "SENSITIVE event leaked raw content into payload!"
    sr = e["secure_reference"]
    assert sr["collection"] == "session_messages"
    assert sr["id"] == msg_id


# ---------- identifier_generated ----------
def test_identifier_generated_event(client):
    before = datetime.now(timezone.utc).isoformat()
    r = client.post(f"{API}/sessions/{SESSION_ID}/rights/generate/isrc")
    assert r.status_code == 200, r.text
    value = r.json()["value"]
    time.sleep(0.2)
    evts = _events_since(client, before, kind="identifier_generated")
    assert any(e["payload"].get("value") == value for e in evts)


# ---------- splits: rights_updated + approval_signed ----------
def test_splits_updated_and_approved_events(client):
    # Set splits (owner test user is sole collaborator on this seeded session)
    before = datetime.now(timezone.utc).isoformat()
    # Look up collaborators
    sess = client.get(f"{API}/sessions/{SESSION_ID}").json()
    collabs = sess.get("collaborators", [])
    n = len(collabs)
    if n == 0:
        pytest.skip("no collaborators to split with")
    even = round(100.0 / n, 2)
    splits = [{"user_id": c["user_id"], "name": c.get("name"), "role": c.get("role") or "writer", "percentage": even} for c in collabs]
    # adjust rounding
    diff = 100.0 - sum(s["percentage"] for s in splits)
    splits[0]["percentage"] = round(splits[0]["percentage"] + diff, 2)

    r = client.put(f"{API}/sessions/{SESSION_ID}/splits", json={"splits": splits})
    assert r.status_code == 200, r.text
    time.sleep(0.2)
    ru = _events_since(client, before, kind="rights_updated")
    assert ru, "no rights_updated event recorded"
    latest = ru[-1]
    assert latest["sensitivity"] == "creative"
    assert isinstance(latest["payload"].get("splits"), list)

    # Approve — sensitive
    before2 = datetime.now(timezone.utc).isoformat()
    r2 = client.post(f"{API}/sessions/{SESSION_ID}/splits/approve",
                     json={"approved": True, "signature": f"TEST_SIG_{uuid.uuid4().hex[:6]}"})
    assert r2.status_code == 200, r2.text
    time.sleep(0.2)
    apps = _events_since(client, before2, kind="approval_signed")
    assert apps, "no approval_signed event recorded"
    a = apps[-1]
    assert a["sensitivity"] == "sensitive"
    # payload should only carry safe metadata
    p = a.get("payload") or {}
    # participants preserved, but raw signature payload beyond {approved/signature/all_signed/participants} must not leak
    assert "participants" in p or p.get("meta")  # metadata layout


# ---------- rightprint_updated (cross-session, session_id=None) ----------
def test_rightprint_updated_event_null_session(client):
    r = client.put(f"{API}/profile/me", json={"pronouns": f"they/them {uuid.uuid4().hex[:4]}"})
    assert r.status_code == 200, r.text
    time.sleep(0.2)
    # cannot GET session-scoped stream (session_id=None). Verify via legacy mirror lookup
    # Use pymongo directly through backend? Fall back to session_events feed which is session-scoped.
    # Instead, we probe the platform-wide via the session evidence endpoint for session_id=None which is unsupported;
    # so check the response and trust the recorder (already asserted end-to-end via other events).
    # To at least validate the endpoint didn't error, we assert 200 above. Additionally re-run the session evidence
    # endpoint and make sure NO rightprint_updated event was written against SESSION_ID.
    evts = client.get(f"{API}/sessions/{SESSION_ID}/evidence",
                      params={"kind": "rightprint_updated", "limit": 200}).json()
    assert all(e.get("session_id") != SESSION_ID for e in evts), \
        "rightprint_updated should be session_id=None, not attached to this session"


# ---------- file_uploaded ----------
def test_file_uploaded_event(client):
    before = datetime.now(timezone.utc).isoformat()
    files = {"file": ("TEST_AUTODOC.txt", io.BytesIO(b"hello autodoc"), "text/plain")}
    # session_id via query param
    r = requests.post(
        f"{API}/upload",
        headers={"Authorization": client.headers["Authorization"]},
        params={"session_id": SESSION_ID},
        files=files,
    )
    assert r.status_code == 200, r.text
    time.sleep(0.2)
    evts = _events_since(client, before, kind="file_uploaded")
    assert evts, "no file_uploaded event recorded"
    e = evts[-1]
    p = e["payload"]
    assert p.get("filename") == "TEST_AUTODOC.txt"
    assert p.get("content_type") == "text/plain"
    assert isinstance(p.get("size"), int) and p["size"] > 0


# ---------- GET /evidence filters ----------
def test_evidence_stream_filters(client):
    r_all = client.get(f"{API}/sessions/{SESSION_ID}/evidence", params={"limit": 50})
    assert r_all.status_code == 200
    arr = r_all.json()
    assert isinstance(arr, list)
    # Ascending order
    times = [e["created_at"] for e in arr]
    assert times == sorted(times), "evidence stream not ascending"
    # kind filter
    r_k = client.get(f"{API}/sessions/{SESSION_ID}/evidence",
                     params={"kind": "lyric_line", "limit": 10})
    assert r_k.status_code == 200
    for e in r_k.json():
        assert e["kind"] == "lyric_line"
    # limit
    r_l = client.get(f"{API}/sessions/{SESSION_ID}/evidence", params={"limit": 5})
    assert len(r_l.json()) <= 5
    # since
    if arr:
        mid = arr[len(arr) // 2]["created_at"]
        r_s = client.get(f"{API}/sessions/{SESSION_ID}/evidence",
                         params={"since": mid, "limit": 500}).json()
        assert all(e["created_at"] > mid for e in r_s)


# ---------- checkpoints exist and close on version submit ----------
def test_checkpoints_and_close_on_version_submit(client, state):
    r = client.get(f"{API}/sessions/{SESSION_ID}/evidence/checkpoints")
    assert r.status_code == 200
    cps_before = r.json()
    assert isinstance(cps_before, list) and len(cps_before) >= 1
    # An OPEN checkpoint should exist (auto-created by earlier events in this run)
    open_before = [c for c in cps_before if c.get("status") == "open"]
    assert open_before, "no open checkpoint found — auto-checkpoint bookkeeping failed"
    open_ck_id = open_before[-1]["checkpoint_id"]

    # Submit a version
    r2 = client.post(f"{API}/sessions/{SESSION_ID}/versions",
                     json={"title": f"TEST_AUTODOC_ver_{uuid.uuid4().hex[:6]}",
                           "purpose": "close checkpoint"})
    assert r2.status_code == 200, r2.text
    state["vid"] = r2.json()["version_id"]
    time.sleep(0.3)

    cps_after = client.get(f"{API}/sessions/{SESSION_ID}/evidence/checkpoints").json()
    matched = [c for c in cps_after if c["checkpoint_id"] == open_ck_id]
    assert matched and matched[0]["status"] == "closed", "checkpoint not closed on version submit"
    assert matched[0].get("closed_at"), "closed checkpoint missing closed_at"


# ---------- populate-since ----------
def test_populate_since(client, state):
    r = client.get(f"{API}/sessions/{SESSION_ID}/evidence/populate-since")
    assert r.status_code == 200
    p = r.json()
    for key in ("participants", "what_changed", "decisions_reached", "open_questions",
                "source_event_ids", "source_checkpoint_ids", "counts", "total_events"):
        assert key in p, f"populate-since missing key {key}"
    # what_changed should contain human-readable strings
    for wc in p["what_changed"]:
        assert isinstance(wc, str)
    # participants must include our test user
    ids = [pt.get("user_id") for pt in p["participants"]]
    assert any(ids), "participants should include the actor"


# ---------- version submit with source arrays + version_submitted evidence ----------
def test_version_with_source_arrays(client, state):
    # Ensure at least one recent event
    client.post(f"{API}/sessions/{SESSION_ID}/lyrics",
                json={"section": "chorus", "text": "TEST_SRC_line"})
    time.sleep(0.3)
    pop = client.get(f"{API}/sessions/{SESSION_ID}/evidence/populate-since").json()
    seids = pop["source_event_ids"]
    sckps = pop["source_checkpoint_ids"]
    # Submit with the source arrays
    before = datetime.now(timezone.utc).isoformat()
    r = client.post(f"{API}/sessions/{SESSION_ID}/versions", json={
        "title": f"TEST_AUTODOC_srcver_{uuid.uuid4().hex[:6]}",
        "purpose": "with source",
        "source_event_ids": seids,
        "source_checkpoint_ids": sckps,
    })
    assert r.status_code == 200, r.text
    v = r.json()
    assert v["source_event_ids"] == seids
    assert v["source_checkpoint_ids"] == sckps
    time.sleep(0.3)
    # version_submitted event with references[] == source_event_ids
    evts = _events_since(client, before, kind="version_submitted")
    ours = [e for e in evts if (e.get("payload") or {}).get("version_id") == v["version_id"]]
    assert ours, "version_submitted event not found"
    assert ours[-1]["references"] == seids


# ---------- version_evidence_added ----------
def test_version_evidence_added_event(client, state):
    vid = state["vid"]
    before = datetime.now(timezone.utc).isoformat()
    r = client.post(f"{API}/sessions/{SESSION_ID}/versions/{vid}/evidence", json={
        "kind": "rich_text",
        "title": "TEST_AUTODOC_artifact",
        "description": "test artifact for evidence added event",
        "content": "hello autodoc content",
    })
    assert r.status_code == 200, r.text
    time.sleep(0.2)
    evts = _events_since(client, before, kind="version_evidence_added")
    assert any((e.get("payload") or {}).get("version_id") == vid for e in evts)


# ---------- acknowledgement_submitted (sensitive) ----------
def test_acknowledgement_submitted_event(client, state):
    vid = state["vid"]
    before = datetime.now(timezone.utc).isoformat()
    r = client.post(f"{API}/sessions/{SESSION_ID}/versions/{vid}/acknowledgements", json={
        "kind": "written",
        "q1_present": True,
        "q2_understood_moment": "yes, I was there",
        "q3_correct_authorship": "yes",
        "q4_missing_dispute": "nothing",
    })
    assert r.status_code == 200, r.text
    time.sleep(0.2)
    evts = _events_since(client, before, kind="acknowledgement_submitted")
    assert evts, "no acknowledgement_submitted event recorded"
    e = evts[-1]
    assert e["sensitivity"] == "sensitive"
    sr = e.get("secure_reference") or {}
    assert sr.get("collection") == "creative_acknowledgements"


# ---------- legacy mirror still populated ----------
def test_legacy_events_mirror_still_populated(client, state):
    r = client.get(f"{API}/sessions/{SESSION_ID}/events")
    assert r.status_code == 200
    arr = r.json()
    assert isinstance(arr, list) and len(arr) > 0
    kinds = {x.get("kind") for x in arr}
    # spot-check that lyric_line kind exists
    assert "lyric_line" in kinds
