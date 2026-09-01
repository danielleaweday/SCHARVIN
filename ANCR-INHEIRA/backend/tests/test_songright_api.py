"""SONGRIGHT backend API tests (pytest)."""
import os
import uuid
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://ownership-os-1.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

SEED_EMAIL = "test@songright.com"
SEED_PW = "Test1234!"


@pytest.fixture(scope="session")
def session_state():
    return {}


@pytest.fixture(scope="session")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


# ---------- Root / health ----------
def test_root(s):
    r = s.get(f"{API}/")
    assert r.status_code == 200
    data = r.json()
    assert data.get("app") in ("SONGRIGHT", "INHEIRA")


# ---------- Auth ----------
def test_login_seeded(s, session_state):
    r = s.post(f"{API}/auth/login", json={"email": SEED_EMAIL, "password": SEED_PW})
    assert r.status_code == 200, r.text
    data = r.json()
    assert "token" in data and data["user"]["email"] == SEED_EMAIL
    session_state["owner_token"] = data["token"]
    session_state["owner_user_id"] = data["user"]["user_id"]


def test_login_invalid(s):
    r = s.post(f"{API}/auth/login", json={"email": SEED_EMAIL, "password": "wrong"})
    assert r.status_code == 401


def test_register_new_user(s, session_state):
    email = f"test_{uuid.uuid4().hex[:8]}@songright.com"
    r = s.post(f"{API}/auth/register", json={"email": email, "password": "Passw0rd!", "name": "Test Collab"})
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["user"]["email"] == email.lower()
    session_state["collab_token"] = data["token"]
    session_state["collab_user_id"] = data["user"]["user_id"]
    session_state["collab_email"] = email


def test_register_duplicate(s, session_state):
    r = s.post(f"{API}/auth/register", json={"email": SEED_EMAIL, "password": "x", "name": "x"})
    assert r.status_code == 400


def test_auth_me(s, session_state):
    r = s.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {session_state['owner_token']}"})
    assert r.status_code == 200
    assert r.json()["email"] == SEED_EMAIL


def test_auth_me_no_token(s):
    r = s.get(f"{API}/auth/me")
    assert r.status_code == 401


# ---------- Profile ----------
def test_profile_update_and_persist(s, session_state):
    tok = session_state["owner_token"]
    payload = {"professional_name": "Skyline Writer", "pro": "BMI", "ipi_number": "1234567890"}
    r = s.put(f"{API}/profile/me", json=payload, headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["professional_name"] == "Skyline Writer"
    assert data["pro"] == "BMI"
    assert data["ipi_number"] == "1234567890"
    # verify persist
    r2 = s.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {tok}"})
    assert r2.json()["professional_name"] == "Skyline Writer"


# ---------- Sessions ----------
def test_create_session(s, session_state):
    tok = session_state["owner_token"]
    r = s.post(f"{API}/sessions", json={"title": "TEST_Skyline", "context": "industry"}, headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["title"] == "TEST_Skyline"
    assert "session_id" in data and "invite_code" in data
    assert data["owner_id"] == session_state["owner_user_id"]
    session_state["session_id"] = data["session_id"]
    session_state["invite_code"] = data["invite_code"]


def test_list_sessions(s, session_state):
    tok = session_state["owner_token"]
    r = s.get(f"{API}/sessions", headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 200
    ids = [d["session_id"] for d in r.json()]
    assert session_state["session_id"] in ids


def test_get_session(s, session_state):
    tok = session_state["owner_token"]
    r = s.get(f"{API}/sessions/{session_state['session_id']}", headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 200
    assert r.json()["session_id"] == session_state["session_id"]


def test_collab_join_by_code(s, session_state):
    tok = session_state["collab_token"]
    r = s.post(f"{API}/sessions/join-by-code/{session_state['invite_code']}", headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 200
    data = r.json()
    collab_ids = [c["user_id"] for c in data["collaborators"]]
    assert session_state["collab_user_id"] in collab_ids


# ---------- Contributions ----------
def test_add_contribution_owner(s, session_state):
    tok = session_state["owner_token"]
    r = s.post(
        f"{API}/sessions/{session_state['session_id']}/contributions",
        json={"role": "Lyrics", "description": "Wrote hook and verse 1", "weight": 2.0},
        headers={"Authorization": f"Bearer {tok}"},
    )
    assert r.status_code == 200, r.text
    assert r.json()["role"] == "Lyrics"


def test_add_contribution_collab(s, session_state):
    tok = session_state["collab_token"]
    r = s.post(
        f"{API}/sessions/{session_state['session_id']}/contributions",
        json={"role": "Melody", "description": "Composed melody", "weight": 1.0},
        headers={"Authorization": f"Bearer {tok}"},
    )
    assert r.status_code == 200, r.text


def test_list_contributions(s, session_state):
    tok = session_state["owner_token"]
    r = s.get(f"{API}/sessions/{session_state['session_id']}/contributions", headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 200
    assert len(r.json()) >= 2


# ---------- Splits ----------
def test_suggest_splits(s, session_state):
    tok = session_state["owner_token"]
    r = s.post(f"{API}/sessions/{session_state['session_id']}/splits/suggest", headers={"Authorization": f"Bearer {tok}"}, timeout=90)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "splits" in data
    total = sum(float(x["percentage"]) for x in data["splits"])
    assert abs(total - 100.0) < 1.0
    session_state["proposed_splits"] = data["splits"]
    session_state["splits_source"] = data.get("source")


def test_set_splits(s, session_state):
    tok = session_state["owner_token"]
    splits = session_state["proposed_splits"]
    # ensure required fields
    payload = {"splits": [{"user_id": x["user_id"], "name": x["name"], "role": x.get("role", "Contributor"), "percentage": x["percentage"]} for x in splits]}
    r = s.put(f"{API}/sessions/{session_state['session_id']}/splits", json=payload, headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 200, r.text
    assert r.json()["splits_status"] == "proposed"


def test_approve_splits_owner(s, session_state):
    tok = session_state["owner_token"]
    r = s.post(
        f"{API}/sessions/{session_state['session_id']}/splits/approve",
        json={"approved": True, "signature": "Test Creator"},
        headers={"Authorization": f"Bearer {tok}"},
    )
    assert r.status_code == 200
    # not finalized until all sign
    assert r.json()["splits_status"] in ("proposed", "finalized")


def test_approve_splits_collab_finalizes(s, session_state):
    tok = session_state["collab_token"]
    r = s.post(
        f"{API}/sessions/{session_state['session_id']}/splits/approve",
        json={"approved": True, "signature": "Test Collab"},
        headers={"Authorization": f"Bearer {tok}"},
    )
    assert r.status_code == 200
    assert r.json()["splits_status"] == "finalized"


# ---------- Royalties ----------
def test_royalties(s, session_state):
    tok = session_state["owner_token"]
    r = s.get(f"{API}/royalties", headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 200
    data = r.json()
    assert "works" in data and "total_earnings" in data
    work_ids = [w["session_id"] for w in data["works"]]
    assert session_state["session_id"] in work_ids


def test_logout(s, session_state):
    tok = session_state["owner_token"]
    r = s.post(f"{API}/auth/logout", headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 200
