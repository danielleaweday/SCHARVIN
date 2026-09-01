"""CEI v2.0 · Creative Evidence Intelligence backend tests."""
import os
import pytest
import requests
from dotenv import dotenv_values

fenv = dotenv_values("/app/frontend/.env")
BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or fenv.get("REACT_APP_BACKEND_URL")).rstrip("/")
API = f"{BASE_URL}/api"

SEED_EMAIL = "test@songright.com"
SEED_PW = "Test1234!"
SESSION_ID = "sess_96285667fb26"


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{API}/auth/login", json={"email": SEED_EMAIL, "password": SEED_PW})
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="module")
def client(token):
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", "Authorization": f"Bearer {token}"})
    return s


@pytest.fixture(scope="module")
def state():
    return {}


# ---------- POST full CEI version ----------
def test_post_full_creative_version(client, state):
    payload = {
        "title": "TEST_CEI_v2_full_moment",
        "purpose": "Testing complete creative evidence capture",
        "moment_at": "2026-07-01T12:00:00Z",
        "location": "Studio A",
        "writing_room": "Room 1",
        "participants": [{"name": "Test Creator", "role": "writer", "rightprint_id": "rp_test"}],
        "objectives": "Nail the chorus",
        "what_changed": "Rewrote bridge",
        "why_changed": "Emotional lift needed",
        "decisions_reached": ["Keep the key of G"],
        "decisions_deferred": ["Final mix later"],
        "open_questions": ["Does the bridge land?"],
        "disagreements": [],
        "rights_discussions": ["50/50 split"],
        "environment": {"daw": "Logic Pro", "software_versions": ["11.0"], "hardware": ["SM7B"], "instruments": ["Guitar"]},
        "links": {"sessions": [], "writing_rooms": [], "projects": []},
        "ai_session_summary": "AI: strong pop-country ballad take.",
    }
    r = client.post(f"{API}/sessions/{SESSION_ID}/versions", json=payload)
    assert r.status_code == 200, r.text
    v = r.json()
    assert v["confidence_status"] == "awaiting_evidence_analysis"
    assert v["mci_status"] == "awaiting_musical_contribution_analysis"
    assert len(v["integrity_hash"]) == 64
    assert v["evidence_artifacts"] == []
    assert v["acknowledgements"] == []
    assert "completeness" in v and v["completeness"]["ratio"] <= 1.0
    assert v["title"] == "TEST_CEI_v2_full_moment"
    state["v1"] = v["version_id"]


def test_post_legacy_label_notes(client, state):
    payload = {"label": "TEST_CEI_legacy_shape", "notes": "legacy notes"}
    r = client.post(f"{API}/sessions/{SESSION_ID}/versions", json=payload)
    assert r.status_code == 200, r.text
    v = r.json()
    assert v["title"] == "TEST_CEI_legacy_shape"
    assert v["confidence_status"] == "awaiting_evidence_analysis"
    state["v_legacy"] = v["version_id"]


def test_post_rejects_empty_title(client):
    r = client.post(f"{API}/sessions/{SESSION_ID}/versions", json={"notes": "nothing"})
    assert r.status_code == 400


def test_post_with_parent_backfills_child(client, state):
    payload = {"title": "TEST_CEI_child_of_v1", "parent_version_id": state["v1"]}
    r = client.post(f"{API}/sessions/{SESSION_ID}/versions", json=payload)
    assert r.status_code == 200, r.text
    child_id = r.json()["version_id"]
    state["child"] = child_id
    # GET parent and verify backfill
    parent = client.get(f"{API}/sessions/{SESSION_ID}/versions/{state['v1']}").json()
    assert child_id in parent["child_version_ids"]


def test_post_unknown_parent_returns_400(client):
    r = client.post(f"{API}/sessions/{SESSION_ID}/versions", json={"title": "TEST_bad_parent", "parent_version_id": "ver_doesnotexist"})
    assert r.status_code == 400


# ---------- GET list & single ----------
def test_get_list_hydrated(client, state):
    r = client.get(f"{API}/sessions/{SESSION_ID}/versions")
    assert r.status_code == 200
    versions = r.json()
    assert len(versions) >= 2
    for v in versions:
        assert "evidence_artifacts" in v
        assert "acknowledgements" in v
        assert "artifact_counts" in v
        assert "completeness" in v
        assert v["confidence_status"] == "awaiting_evidence_analysis"
        assert v["mci_status"] in ("awaiting_musical_contribution_analysis", "analyzed")


def test_get_single_ok(client, state):
    r = client.get(f"{API}/sessions/{SESSION_ID}/versions/{state['v1']}")
    assert r.status_code == 200
    assert r.json()["version_id"] == state["v1"]


def test_get_single_404(client):
    r = client.get(f"{API}/sessions/{SESSION_ID}/versions/ver_missing123")
    assert r.status_code == 404


def test_get_forbidden_session(client):
    r = client.get(f"{API}/sessions/sess_definitely_not_mine_zzz/versions")
    # 404 (session doesn't exist) or 403 (no access) both acceptable
    assert r.status_code in (403, 404)


# ---------- Evidence artifacts ----------
@pytest.mark.parametrize("kind,extra", [
    ("rich_text", {"content": "Some rich narrative"}),
    ("lyrics", {"content": "Verse 1 lyrics here"}),
    ("audio", {"file_url": "https://example.com/take1.wav", "mime_type": "audio/wav"}),
    ("cloud_link", {"cloud_link_url": "https://drive.google.com/file/xyz"}),
])
def test_add_evidence_kinds(client, state, kind, extra):
    payload = {"kind": kind, "title": f"TEST_{kind}_artifact", **extra}
    r = client.post(f"{API}/sessions/{SESSION_ID}/versions/{state['v1']}/evidence", json=payload)
    assert r.status_code == 200, r.text
    art = r.json()
    assert art["kind"] == kind
    assert art["artifact_id"].startswith("art_")


def test_add_evidence_unknown_kind_400(client, state):
    r = client.post(f"{API}/sessions/{SESSION_ID}/versions/{state['v1']}/evidence",
                    json={"kind": "not_a_real_kind", "title": "x"})
    assert r.status_code == 400


def test_version_get_shows_artifacts(client, state):
    v = client.get(f"{API}/sessions/{SESSION_ID}/versions/{state['v1']}").json()
    kinds = {a["kind"] for a in v["evidence_artifacts"]}
    assert {"rich_text", "lyrics", "audio", "cloud_link"}.issubset(kinds)


# ---------- Acknowledgements ----------
def test_add_acknowledgement_full(client, state):
    payload = {
        "kind": "signature",
        "role": "writer",
        "contribution_statement": "Wrote the bridge",
        "observations": "Producer added synth pad",
        "agrees_with_version": True,
        "disputes": None,
    }
    r = client.post(f"{API}/sessions/{SESSION_ID}/versions/{state['v1']}/acknowledgements", json=payload)
    assert r.status_code == 200, r.text
    ack = r.json()
    assert ack["ack_id"].startswith("ack_")
    assert ack["agrees_with_version"] is True


@pytest.mark.parametrize("kind", ["written", "audio", "video", "producer_note", "engineer_note", "witness", "ai_summary"])
def test_ack_all_kinds(client, state, kind):
    r = client.post(f"{API}/sessions/{SESSION_ID}/versions/{state['v1']}/acknowledgements",
                    json={"kind": kind, "contribution_statement": f"test {kind}"})
    assert r.status_code == 200, r.text


def test_ack_unknown_kind_400(client, state):
    r = client.post(f"{API}/sessions/{SESSION_ID}/versions/{state['v1']}/acknowledgements",
                    json={"kind": "invalid_kind"})
    assert r.status_code == 400


# ---------- Status remains frozen ----------
def test_status_frozen_after_full_documentation(client, state):
    v = client.get(f"{API}/sessions/{SESSION_ID}/versions/{state['v1']}").json()
    assert v["confidence_status"] == "awaiting_evidence_analysis"
    assert v["mci_status"] == "awaiting_musical_contribution_analysis"
    assert v["completeness"]["ratio"] <= 1.0
    assert len(v["evidence_artifacts"]) >= 4
    assert len(v["acknowledgements"]) >= 3


# ---------- Cleanup ----------
def test_cleanup(client, state):
    # Best-effort delete; append-only means no delete API, so just verify we can list.
    r = client.get(f"{API}/sessions/{SESSION_ID}/versions")
    assert r.status_code == 200
