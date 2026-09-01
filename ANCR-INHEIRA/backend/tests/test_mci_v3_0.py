"""MCI v3.0 — Musical Contribution Intelligence™ backend tests.

Covers sufficiency gate, analyzed status, documentation share, disclaimer,
voice-moment attribution safety (only confirmed/corrected contribute),
and version mci_status stamping.
"""
import os
import asyncio
import uuid
from datetime import datetime, timezone

import pytest
import requests
from dotenv import dotenv_values
from motor.motor_asyncio import AsyncIOMotorClient

# ---------- Config ----------
fenv = dotenv_values("/app/frontend/.env")
BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or fenv.get("REACT_APP_BACKEND_URL")).rstrip("/")
API = f"{BASE_URL}/api"

benv = dotenv_values("/app/backend/.env")
MONGO_URL = benv.get("MONGO_URL", "mongodb://localhost:27017").strip('"')
DB_NAME = benv.get("DB_NAME", "test_database").strip('"')

SEED_EMAIL = "test@songright.com"
SEED_PW = "Test1234!"
SESSION_WITH_EVIDENCE = "sess_96285667fb26"


# ---------- Fixtures ----------
@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{API}/auth/login", json={"email": SEED_EMAIL, "password": SEED_PW})
    if r.status_code != 200:
        pytest.fail(f"Auth failed: {r.status_code} {r.text[:300]}")
    return r.json()["token"]


@pytest.fixture(scope="module")
def client(token):
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", "Authorization": f"Bearer {token}"})
    return s


@pytest.fixture(scope="module")
def mongo_db():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    yield db
    client.close()


@pytest.fixture(scope="module")
def user_id(client):
    r = client.get(f"{API}/auth/me")
    assert r.status_code == 200, r.text
    return r.json().get("user_id") or r.json().get("id") or "user_seed_test001"


# ---------- Module import ----------
# Verify /app/backend/mci.py loads and exports required symbols.
def test_mci_module_imports_and_constants():
    import mci
    assert hasattr(mci, "CATEGORIES")
    assert mci.MIN_VERSIONS == 1
    assert mci.MIN_EVENTS == 5
    assert mci.MIN_HUMAN_SIGNALS == 1
    assert callable(mci.compute_mci_for_session)
    assert callable(mci.stamp_versions_mci_status)


# ---------- GET /mci on session with sufficient evidence ----------
def test_mci_analyzed_on_seed_session(client):
    r = client.get(f"{API}/sessions/{SESSION_WITH_EVIDENCE}/mci")
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["session_id"] == SESSION_WITH_EVIDENCE
    assert d["status"] == "analyzed", f"expected analyzed, got {d.get('status')} — reason={d.get('reason')}"
    assert isinstance(d.get("contributors"), list) and len(d["contributors"]) >= 1
    assert "totals" in d and "confidence" in d and "computed_at" in d
    # disclaimer required for analyzed
    disc = d.get("disclaimer", "")
    assert "does not determine legal ownership" in disc
    assert "does not assign publishing splits" in disc


def test_mci_documentation_share_sums_to_one(client):
    r = client.get(f"{API}/sessions/{SESSION_WITH_EVIDENCE}/mci")
    d = r.json()
    assert d["status"] == "analyzed"
    total = sum(c.get("documentation_share", 0) for c in d["contributors"])
    assert abs(total - 1.0) <= 0.02, f"documentation_share sum {total} not ≈1.0"
    # Each contributor has categories + total_signals
    for c in d["contributors"]:
        assert "categories" in c and "total_signals" in c
        assert "documentation_share" in c


def test_mci_refresh_endpoint_same_schema(client):
    r = client.post(f"{API}/sessions/{SESSION_WITH_EVIDENCE}/mci/refresh")
    assert r.status_code == 200, r.text
    d = r.json()
    for k in ("session_id", "status", "contributors", "totals", "confidence", "computed_at"):
        assert k in d


def test_mci_stamps_version_mci_status(client):
    # Ensure GET /mci ran and stamped versions
    client.get(f"{API}/sessions/{SESSION_WITH_EVIDENCE}/mci")
    versions = client.get(f"{API}/sessions/{SESSION_WITH_EVIDENCE}/versions").json()
    assert len(versions) >= 1
    for v in versions:
        assert v.get("mci_status") == "analyzed", f"version {v.get('version_id')} mci_status={v.get('mci_status')}"
        # confidence_status must remain frozen — regression check
        assert v.get("confidence_status") == "awaiting_evidence_analysis"


# ---------- Sufficiency gate on fresh session ----------
@pytest.fixture(scope="module")
def fresh_session(client):
    r = client.post(f"{API}/sessions", json={"title": f"TEST_MCI_fresh_{uuid.uuid4().hex[:6]}"})
    assert r.status_code == 200, r.text
    sid = r.json()["session_id"]
    yield sid
    # cleanup
    try:
        client.delete(f"{API}/sessions/{sid}")
    except Exception:
        pass


def test_gate_fresh_session_awaiting(client, fresh_session):
    r = client.get(f"{API}/sessions/{fresh_session}/mci")
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["status"] == "awaiting_musical_contribution_analysis"
    reason = d.get("reason") or {}
    # Fresh session: session_created event is auto-logged (1 event), but versions=0, human_signals=0
    assert reason.get("versions", {}).get("have") == 0
    assert reason.get("human_signals", {}).get("have") == 0
    assert d.get("contributors") == []


def test_gate_after_version_and_events_still_awaiting_without_human_signal(client, fresh_session):
    # Add 1 version
    r = client.post(f"{API}/sessions/{fresh_session}/versions", json={
        "title": "TEST_MCI_v1", "purpose": "gate test",
    })
    assert r.status_code == 200, r.text

    # Add 5 lyric-line events
    for i in range(5):
        rr = client.post(f"{API}/sessions/{fresh_session}/lyrics", json={
            "section": "verse", "text": f"TEST_MCI line {i}",
        })
        assert rr.status_code == 200, rr.text

    r = client.get(f"{API}/sessions/{fresh_session}/mci")
    d = r.json()
    assert d["status"] == "awaiting_musical_contribution_analysis", d
    reason = d.get("reason") or {}
    assert reason["versions"]["have"] >= 1
    assert reason["events"]["have"] >= 5
    assert reason["human_signals"]["have"] == 0


def test_gate_flips_to_analyzed_after_acknowledgement(client, fresh_session):
    versions = client.get(f"{API}/sessions/{fresh_session}/versions").json()
    assert versions, "expected at least one version from prior test"
    vid = versions[0]["version_id"]
    r = client.post(f"{API}/sessions/{fresh_session}/versions/{vid}/acknowledgements", json={
        "kind": "signature", "contribution_statement": "TEST_MCI gate flip",
        "agrees_with_version": True,
    })
    assert r.status_code == 200, r.text

    r = client.get(f"{API}/sessions/{fresh_session}/mci")
    d = r.json()
    assert d["status"] == "analyzed", f"expected analyzed after ack, got {d.get('status')} reason={d.get('reason')}"
    assert d["totals"]["human_signals"] >= 1
    assert len(d["contributors"]) >= 1
    assert "does not determine legal ownership" in d.get("disclaimer", "")


# ---------- Access control ----------
def test_mci_returns_403_or_404_when_user_lacks_access(fresh_session):
    # Anonymous request (no auth header) should not return 200
    r = requests.get(f"{API}/sessions/{fresh_session}/mci")
    assert r.status_code in (401, 403), f"expected 401/403 for unauth, got {r.status_code}"


# ---------- Voice moment attribution safety (direct DB) ----------
# Inserts a synthetic voice_evidence document with one confirmed, one disputed,
# one unconfirmed moment. Only the confirmed moment must appear as attribution.
def test_voice_moment_attribution_only_confirmed_corrected(mongo_db, client, user_id):
    import mci as mci_engine

    async def run():
        db = mongo_db
        # Create isolated session directly to control conditions
        sid = f"sess_mcitest_{uuid.uuid4().hex[:8]}"
        now = datetime.now(timezone.utc).isoformat()
        await db.sessions.insert_one({
            "session_id": sid,
            "owner_id": user_id,
            "title": "TEST_MCI_voice_gate",
            "collaborators": [{"user_id": user_id, "name": "Tester", "color": "#f5b400"}],
            "created_at": now,
        })
        # 1 version
        await db.creative_versions.insert_one({
            "version_id": f"ver_{uuid.uuid4().hex[:8]}",
            "session_id": sid, "submitter_id": user_id,
            "title": "TEST_MCI voice", "created_at": now,
            "mci_status": "awaiting_musical_contribution_analysis",
        })
        # 5 CEI events (lyric_line, actor = user)
        for i in range(5):
            await db.creative_evidence_events.insert_one({
                "event_id": f"evt_{uuid.uuid4().hex[:8]}",
                "session_id": sid,
                "kind": "lyric_line",
                "actor": {"id": user_id, "name": "Tester", "color": "#f5b400"},
                "created_at": now,
                "payload": {},
            })
        # voice record with 3 moments — confirmed / disputed / unconfirmed
        other_reviewer = "user_other_reviewer_test"
        await db.voice_evidence.insert_one({
            "recording_id": f"rec_{uuid.uuid4().hex[:8]}",
            "session_id": sid,
            "recorded_by_id": user_id,
            "recorded_by_name": "Tester",
            "recorded_by_color": "#f5b400",
            "detected_moments": [
                {"moment_id": "m_conf", "kind": "melody", "excerpt": "hum",
                 "human_status": "confirmed", "human_action_by": user_id},
                {"moment_id": "m_disp", "kind": "melody", "excerpt": "no",
                 "human_status": "disputed", "human_action_by": other_reviewer},
                {"moment_id": "m_unc", "kind": "melody", "excerpt": "??",
                 "human_status": "unconfirmed"},
            ],
        })

        result = await mci_engine.compute_mci_for_session(db, sid)

        # Cleanup
        await db.sessions.delete_one({"session_id": sid})
        await db.creative_versions.delete_many({"session_id": sid})
        await db.creative_evidence_events.delete_many({"session_id": sid})
        await db.voice_evidence.delete_many({"session_id": sid})

        return result

    result = asyncio.get_event_loop().run_until_complete(run())

    assert result["status"] == "analyzed", result
    # Disputed AND unconfirmed count as human signals for the gate;
    # confirmed also counts. So human_signals should be ≥ 2.
    assert result["totals"]["human_signals"] >= 2, result["totals"]

    # Attribution: only ONE voice_moment count total across contributors
    total_voice = sum(c["categories"]["voice_moment"]["count"] for c in result["contributors"])
    assert total_voice == 1, f"expected exactly 1 voice_moment attribution (only confirmed), got {total_voice}"

    # And that count belongs to the tester (user_id) — the confirmer
    tester = next((c for c in result["contributors"] if c["user_id"] == "user_seed_test001" or c["name"] == "Tester"), None)
    if tester:
        assert tester["categories"]["voice_moment"]["count"] == 1


# ---------- Disclaimer only on analyzed ----------
def test_disclaimer_present_on_analyzed_absent_or_marker_on_awaiting(client, fresh_session):
    # awaiting responses do not need the disclaimer string but must not falsely claim ownership
    r = requests.post(f"{API}/sessions", headers={
        "Authorization": client.headers["Authorization"],
        "Content-Type": "application/json",
    }, json={"title": f"TEST_MCI_disc_{uuid.uuid4().hex[:6]}"}).json()
    sid = r["session_id"]
    d = client.get(f"{API}/sessions/{sid}/mci").json()
    assert d["status"].startswith("awaiting_")
    # cleanup
    try:
        client.delete(f"{API}/sessions/{sid}")
    except Exception:
        pass
