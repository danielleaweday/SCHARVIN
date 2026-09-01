"""ANCRSync backend API tests - covers auth, workspaces, studios, sessions, passport, AI."""
import os
import uuid
import time
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://creative-sync-14.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def user_ctx():
    email = f"qa+{uuid.uuid4().hex[:8]}@ancrsync.co"
    pwd = "Test1234!"
    r = requests.post(f"{API}/auth/signup", json={
        "name": "QA Tester", "email": email, "password": pwd,
        "role": "Songwriter", "discipline": "Music", "country": "US"
    }, timeout=30)
    assert r.status_code == 200, f"signup failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and "user" in data
    return {"email": email, "password": pwd, "token": data["token"], "user": data["user"]}


@pytest.fixture(scope="session")
def auth_headers(user_ctx):
    return {"Authorization": f"Bearer {user_ctx['token']}", "Content-Type": "application/json"}


# ---- Auth ----
class TestAuth:
    def test_root(self):
        r = requests.get(f"{API}/", timeout=10)
        assert r.status_code == 200
        assert r.json().get("service") == "ANCRSync"

    def test_signup_duplicate(self, user_ctx):
        r = requests.post(f"{API}/auth/signup", json={
            "name": "dup", "email": user_ctx["email"], "password": "x",
        }, timeout=15)
        assert r.status_code == 400

    def test_login_success(self, user_ctx):
        r = requests.post(f"{API}/auth/login", json={
            "email": user_ctx["email"], "password": user_ctx["password"]
        }, timeout=15)
        assert r.status_code == 200
        assert "token" in r.json()

    def test_login_bad(self, user_ctx):
        r = requests.post(f"{API}/auth/login", json={
            "email": user_ctx["email"], "password": "wrong"
        }, timeout=15)
        assert r.status_code == 401

    def test_me(self, auth_headers, user_ctx):
        r = requests.get(f"{API}/auth/me", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert r.json()["email"] == user_ctx["email"]

    def test_me_unauth(self):
        r = requests.get(f"{API}/auth/me", timeout=10)
        assert r.status_code == 401


# ---- Workspaces ----
class TestWorkspaces:
    def test_create_and_list(self, auth_headers):
        r = requests.post(f"{API}/workspaces", headers=auth_headers, json={
            "name": "TEST_WS", "description": "d", "discipline": "Music"
        }, timeout=15)
        assert r.status_code == 200
        ws = r.json()
        assert ws["name"] == "TEST_WS"
        wid = ws["id"]

        g = requests.get(f"{API}/workspaces/{wid}", headers=auth_headers, timeout=15)
        assert g.status_code == 200
        assert g.json()["id"] == wid

        # task
        t = requests.post(f"{API}/workspaces/{wid}/tasks", headers=auth_headers, json={"title": "task1"}, timeout=15)
        assert t.status_code == 200
        tid = t.json()["id"]

        tog = requests.post(f"{API}/workspaces/{wid}/tasks/{tid}/toggle", headers=auth_headers, timeout=15)
        assert tog.status_code == 200

        c = requests.post(f"{API}/workspaces/{wid}/comments", headers=auth_headers, json={"body": "hello"}, timeout=15)
        assert c.status_code == 200
        assert c.json()["body"] == "hello"

        lst = requests.get(f"{API}/workspaces", headers=auth_headers, timeout=15)
        assert lst.status_code == 200
        assert any(w["id"] == wid for w in lst.json())


# ---- Studios ----
class TestStudios:
    def test_list_seeds(self, auth_headers):
        r = requests.get(f"{API}/studios", headers=auth_headers, timeout=20)
        assert r.status_code == 200
        studios = r.json()
        assert len(studios) >= 10
        kinds = {s["kind"] for s in studios}
        assert {"Songwriting", "Recording", "Production", "Film", "Animation",
                "Photography", "Podcast", "Brand", "Creative Strategy", "Innovation"}.issubset(kinds)

    def test_join(self, auth_headers):
        r = requests.get(f"{API}/studios", headers=auth_headers, timeout=15)
        sid = r.json()[0]["id"]
        j = requests.post(f"{API}/studios/{sid}/join", headers=auth_headers, timeout=15)
        assert j.status_code == 200


# ---- Sessions ----
class TestSessions:
    def test_create_and_get(self, auth_headers):
        r = requests.post(f"{API}/sessions", headers=auth_headers, json={
            "title": "TEST_Session", "start_time": "2026-01-15T10:00:00Z", "duration_minutes": 30, "invitees": []
        }, timeout=15)
        assert r.status_code == 200
        sid = r.json()["id"]

        g = requests.get(f"{API}/sessions/{sid}", headers=auth_headers, timeout=15)
        assert g.status_code == 200
        assert g.json()["title"] == "TEST_Session"

        j = requests.post(f"{API}/sessions/{sid}/join", headers=auth_headers, timeout=15)
        assert j.status_code == 200

    def test_ai_summary(self, auth_headers):
        r = requests.post(f"{API}/sessions", headers=auth_headers, json={
            "title": "TEST_AISession", "start_time": "2026-01-15T10:00:00Z", "duration_minutes": 30
        }, timeout=15)
        sid = r.json()["id"]
        s = requests.post(f"{API}/sessions/{sid}/ai-summary", headers=auth_headers, timeout=90)
        assert s.status_code == 200, f"ai-summary failed: {s.status_code} {s.text[:300]}"
        assert len(s.json().get("summary", "")) > 20


# ---- Passport ----
class TestPassport:
    def test_passport(self, auth_headers):
        r = requests.get(f"{API}/passport", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert "entries" in data and "stats" in data
        assert data["stats"]["total"] >= 1  # at least signup achievement


# ---- Global ----
class TestGlobal:
    def test_global_creators(self, auth_headers):
        r = requests.get(f"{API}/global/creators", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert len(d["sample"]) >= 10


# ---- AI Chat ----
class TestAI:
    def test_ai_chat(self, auth_headers):
        r = requests.post(f"{API}/ai/chat", headers=auth_headers, json={
            "prompt": "Give me one creative next step in 10 words.",
            "context": "recommend"
        }, timeout=90)
        assert r.status_code == 200, f"ai/chat failed: {r.status_code} {r.text[:300]}"
        assert len(r.json().get("response", "")) > 5


# ---- Dashboard ----
class TestDashboard:
    def test_dashboard(self, auth_headers):
        r = requests.get(f"{API}/dashboard", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        d = r.json()
        for k in ["workspaces_count", "sessions_count", "studios", "passport_count", "recent_activity"]:
            assert k in d
