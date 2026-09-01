"""COHEIR™ backend integration tests.

Tests all critical /api endpoints using the public REACT_APP_BACKEND_URL.
Uses bearer token from /auth/login response (session_token) for auth.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://creator-launch-20.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

STUDENT = {"email": "danielle.mcmillan@ccdp.edu", "password": "demo1234"}
PRODUCER = {"email": "cam.rivers@coheir.industry", "password": "demo1234"}
ADMIN = {"email": "admin.president@ccdp.edu", "password": "demo1234"}
EMPLOYER = {"email": "brand.hire@sonyhorizon.com", "password": "demo1234"}


def _login(email, password):
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": email, "password": password}, timeout=15)
    assert r.status_code == 200, f"login failed for {email}: {r.status_code} {r.text}"
    tok = r.json()["session_token"]
    s.headers.update({"Authorization": f"Bearer {tok}"})
    return s, r.json()["user"]


@pytest.fixture(scope="module")
def student_client():
    return _login(**STUDENT)


@pytest.fixture(scope="module")
def producer_client():
    return _login(**PRODUCER)


@pytest.fixture(scope="module")
def admin_client():
    return _login(**ADMIN)


@pytest.fixture(scope="module")
def employer_client():
    return _login(**EMPLOYER)


# ── Health ───────────────────────────────────────────────────────────────
def test_healthz():
    r = requests.get(f"{API}/healthz", timeout=10)
    assert r.status_code == 200
    assert r.json() == {"ok": True}


# ── Auth ─────────────────────────────────────────────────────────────────
def test_login_success():
    s, user = _login(**STUDENT)
    assert user["email"] == STUDENT["email"]
    assert user["role"] == "student"


def test_login_bad_creds():
    r = requests.post(f"{API}/auth/login", json={"email": STUDENT["email"], "password": "wrong"}, timeout=10)
    assert r.status_code == 401


def test_auth_me(student_client):
    s, _ = student_client
    r = s.get(f"{API}/auth/me", timeout=10)
    assert r.status_code == 200
    assert r.json()["email"] == STUDENT["email"]


def test_demo_login():
    r = requests.post(f"{API}/auth/demo", json={"email": STUDENT["email"]}, timeout=10)
    assert r.status_code == 200
    assert "session_token" in r.json()


def test_emergent_bad_session():
    r = requests.post(f"{API}/auth/emergent", json={"session_id": "fake_bogus_id"}, timeout=20)
    assert r.status_code == 401


# ── Directory ────────────────────────────────────────────────────────────
def test_professionals(student_client):
    s, _ = student_client
    r = s.get(f"{API}/professionals", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list) and len(data) > 0


def test_professionals_featured(student_client):
    s, _ = student_client
    r = s.get(f"{API}/professionals/featured", timeout=15)
    assert r.status_code == 200
    assert len(r.json()) > 0


def test_professional_by_id(student_client):
    s, _ = student_client
    lst = s.get(f"{API}/professionals", timeout=15).json()
    uid = lst[0]["user_id"]
    r = s.get(f"{API}/professionals/{uid}", timeout=15)
    assert r.status_code == 200
    assert r.json()["user_id"] == uid


# ── Students / Supervision ───────────────────────────────────────────────
def test_students_list(producer_client):
    s, _ = producer_client
    r = s.get(f"{API}/students", timeout=15)
    assert r.status_code == 200
    assert len(r.json()) > 0


def test_supervision_mine(producer_client):
    s, _ = producer_client
    r = s.get(f"{API}/supervision/mine", timeout=15)
    assert r.status_code == 200
    # cam.rivers should supervise Danielle per problem statement
    data = r.json()
    assert isinstance(data, list)


def test_student_detail(producer_client, student_client):
    s, _ = producer_client
    _, student = student_client
    r = s.get(f"{API}/students/{student['user_id']}", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "reviews" in data
    assert "recommendations" in data


# ── Cohorts ──────────────────────────────────────────────────────────────
def test_cohorts(student_client):
    s, _ = student_client
    r = s.get(f"{API}/cohorts", timeout=15)
    assert r.status_code == 200
    cohorts = r.json()
    assert len(cohorts) >= 6
    cid = cohorts[0]["id"]
    r2 = s.get(f"{API}/cohorts/{cid}", timeout=15)
    assert r2.status_code == 200
    assert "students" in r2.json() and "mentors" in r2.json()


# ── Sessions ─────────────────────────────────────────────────────────────
def test_sessions(student_client):
    s, _ = student_client
    r = s.get(f"{API}/sessions", timeout=15)
    assert r.status_code == 200
    sessions = r.json()
    assert len(sessions) >= 8
    sid = sessions[0]["id"]
    r2 = s.get(f"{API}/sessions/{sid}", timeout=15)
    assert r2.status_code == 200
    assert "attendees" in r2.json()


def test_sessions_upcoming(student_client):
    s, _ = student_client
    r = s.get(f"{API}/sessions/upcoming", timeout=15)
    assert r.status_code == 200


# ── Reviews ──────────────────────────────────────────────────────────────
def test_reviews_list(student_client):
    s, _ = student_client
    r = s.get(f"{API}/reviews", timeout=15)
    assert r.status_code == 200
    assert len(r.json()) >= 3


def test_review_create(producer_client, student_client):
    s, _ = producer_client
    _, student = student_client
    payload = {
        "student_id": student["user_id"],
        "scores": {"craft": 8, "collaboration": 9, "leadership": 7, "growth": 8,
                   "professionalism": 9, "creativity": 9, "consistency": 8,
                   "communication": 9, "resilience": 8},
        "comments": "TEST_ review comment",
        "recommendations": "TEST_ recommendation",
        "growth_plan": "TEST_ growth plan",
    }
    r = s.post(f"{API}/reviews", json=payload, timeout=15)
    assert r.status_code == 200
    body = r.json()
    assert body["student_id"] == student["user_id"]
    assert body["comments"] == "TEST_ review comment"


# ── Opportunities ────────────────────────────────────────────────────────
def test_opportunities(student_client):
    s, _ = student_client
    r = s.get(f"{API}/opportunities", timeout=15)
    assert r.status_code == 200
    opps = r.json()
    assert len(opps) >= 6
    r2 = s.post(f"{API}/opportunities/apply", json={"opportunity_id": opps[0]["id"]}, timeout=15)
    assert r2.status_code == 200
    assert r2.json()["ok"] is True


# ── Recommendations ──────────────────────────────────────────────────────
def test_recommendations(student_client):
    s, _ = student_client
    r = s.get(f"{API}/recommendations", timeout=15)
    assert r.status_code == 200
    assert len(r.json()) >= 3


# ── Teams / Calendar / Resources ─────────────────────────────────────────
def test_creative_teams(student_client):
    s, _ = student_client
    r = s.get(f"{API}/creative-teams", timeout=15)
    assert r.status_code == 200
    assert len(r.json()) >= 2


def test_calendar(student_client):
    s, _ = student_client
    r = s.get(f"{API}/calendar", timeout=15)
    assert r.status_code == 200
    assert len(r.json()) >= 5


def test_resources(student_client):
    s, _ = student_client
    r = s.get(f"{API}/resources", timeout=15)
    assert r.status_code == 200
    assert len(r.json()) >= 5


# ── Messaging ────────────────────────────────────────────────────────────
def test_threads_and_message(student_client):
    s, _ = student_client
    r = s.get(f"{API}/threads", timeout=15)
    assert r.status_code == 200
    threads = r.json()
    if not threads:
        # fallback: threads/all
        threads = s.get(f"{API}/threads/all", timeout=15).json()
    assert len(threads) >= 1
    tid = threads[0]["id"]
    msgs = s.get(f"{API}/threads/{tid}/messages", timeout=15)
    assert msgs.status_code == 200
    # send a message
    r2 = s.post(f"{API}/threads/messages", json={"thread_id": tid, "body": "TEST_ message body"}, timeout=15)
    assert r2.status_code == 200
    assert r2.json()["body"] == "TEST_ message body"


# ── Dashboard / Institution ──────────────────────────────────────────────
def test_dashboard_overview(student_client):
    s, _ = student_client
    r = s.get(f"{API}/dashboard/overview", timeout=15)
    assert r.status_code == 200
    data = r.json()
    stats = data["stats"]
    assert stats["industry_professionals"] > 0
    assert stats["expert_categories"] > 0
    assert stats["countries"] > 0
    assert stats["active_mentorships"] > 0


def test_institution_overview(admin_client):
    s, _ = admin_client
    r = s.get(f"{API}/institution/overview", timeout=15)
    assert r.status_code == 200
    stats = r.json()["stats"]
    assert stats["students"] > 0
    assert stats["cohorts"] > 0


# ── AIAH ─────────────────────────────────────────────────────────────────
def test_aiah_generate(student_client):
    s, _ = student_client
    r = s.post(f"{API}/aiah/generate",
               json={"kind": "career_readiness", "prompt": "Snapshot for Danielle",
                     "context": "dashboard", "subject_ids": []},
               timeout=60)
    assert r.status_code == 200, r.text
    data = r.json()
    # Response should contain markdown text
    assert any(k in data for k in ("output", "markdown", "text", "content", "result"))


# ── Notifications ────────────────────────────────────────────────────────
def test_notifications(student_client):
    s, _ = student_client
    r = s.get(f"{API}/notifications", timeout=15)
    assert r.status_code == 200
