"""CYNAIAH backend test suite — full API coverage."""
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    # Fallback to frontend/.env
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip()
                break
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"

STUDENT_EMAIL = "student@cynaiah.demo"
STUDENT_PASSWORD = "Cynaiah2026!"
FACULTY_EMAIL = "faculty@cynaiah.demo"
FACULTY_PASSWORD = "Cynaiah2026!"


# -------- fixtures --------
@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def student_token(session):
    r = session.post(f"{API}/auth/login", json={"email": STUDENT_EMAIL, "password": STUDENT_PASSWORD}, timeout=30)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def student_headers(student_token):
    return {"Authorization": f"Bearer {student_token}", "Content-Type": "application/json"}


# -------- system --------
def test_root(session):
    r = session.get(f"{API}/", timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["service"] == "CYNAIAH"
    assert "version" in d and "tagline" in d


def test_health(session):
    r = session.get(f"{API}/health", timeout=15)
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_seed_idempotent(session):
    # /api/seed is admin-guarded (iteration 9). Authenticate as platform_admin.
    admin = session.post(
        f"{API}/auth/login",
        json={"email": "admin@cynaiah.demo", "password": "Cynaiah2026!"},
        timeout=15,
    )
    assert admin.status_code == 200, f"admin login failed: {admin.text}"
    admin_headers = {"Authorization": f"Bearer {admin.json()['access_token']}"}
    r1 = session.post(f"{API}/seed", headers=admin_headers, timeout=30)
    assert r1.status_code == 200, r1.text
    d1 = r1.json()
    assert d1["demo_email"] == STUDENT_EMAIL
    assert d1["demo_password"] == STUDENT_PASSWORD
    r2 = session.post(f"{API}/seed", headers=admin_headers, timeout=30)
    assert r2.status_code == 200
    assert r2.json()["status"] == "already_seeded"


# -------- auth --------
def test_login_demo_student(session):
    r = session.post(f"{API}/auth/login", json={"email": STUDENT_EMAIL, "password": STUDENT_PASSWORD}, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["access_token"]
    assert d["user"]["email"] == STUDENT_EMAIL
    assert d["user"]["role"] == "student"


def test_login_demo_faculty(session):
    r = session.post(f"{API}/auth/login", json={"email": FACULTY_EMAIL, "password": FACULTY_PASSWORD}, timeout=15)
    assert r.status_code == 200
    assert r.json()["user"]["role"] == "faculty"


def test_login_invalid(session):
    r = session.post(f"{API}/auth/login", json={"email": STUDENT_EMAIL, "password": "wrong"}, timeout=15)
    assert r.status_code == 401


def test_register_and_duplicate(session):
    email = f"test_{uuid.uuid4().hex[:8]}@cynaiah.demo"
    payload = {"email": email, "password": "TestPass123!", "name": "Test User", "role": "student"}
    r = session.post(f"{API}/auth/register", json=payload, timeout=15)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["access_token"]
    assert d["user"]["email"] == email
    # duplicate
    r2 = session.post(f"{API}/auth/register", json=payload, timeout=15)
    assert r2.status_code == 400


def test_register_invalid_role(session):
    email = f"test_{uuid.uuid4().hex[:8]}@cynaiah.demo"
    r = session.post(f"{API}/auth/register", json={"email": email, "password": "x", "name": "n", "role": "hacker"}, timeout=15)
    assert r.status_code == 400


def test_me_ok(session, student_headers):
    r = session.get(f"{API}/auth/me", headers=student_headers, timeout=15)
    assert r.status_code == 200
    assert r.json()["email"] == STUDENT_EMAIL


def test_me_no_token(session):
    r = session.get(f"{API}/auth/me", timeout=15)
    assert r.status_code == 401


def test_me_invalid_token(session):
    r = session.get(f"{API}/auth/me", headers={"Authorization": "Bearer garbage"}, timeout=15)
    assert r.status_code == 401


# -------- dashboard --------
def test_dashboard_summary(session, student_headers):
    r = session.get(f"{API}/dashboard/summary", headers=student_headers, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["user"]["email"] == STUDENT_EMAIL
    assert len(d["active_projects"]) > 0 or len(d["recent_projects"]) > 0
    assert len(d["courses"]) > 0
    assert len(d["notifications"]) > 0
    assert len(d["upcoming_events"]) > 0
    assert len(d["recent_feedback"]) > 0
    assert d["counts"]["total_projects"] > 0


# -------- projects CRUD --------
def test_projects_list_and_filter(session, student_headers):
    r = session.get(f"{API}/projects", headers=student_headers, timeout=15)
    assert r.status_code == 200
    projects = r.json()
    assert len(projects) >= 6
    # filter by type
    r2 = session.get(f"{API}/projects?type=music_video", headers=student_headers, timeout=15)
    assert r2.status_code == 200
    assert all(p["type"] == "music_video" for p in r2.json())
    # filter by status
    r3 = session.get(f"{API}/projects?status=production", headers=student_headers, timeout=15)
    assert r3.status_code == 200
    assert all(p["status"] == "production" for p in r3.json())
    # search q
    r4 = session.get(f"{API}/projects?q=Neon", headers=student_headers, timeout=15)
    assert r4.status_code == 200
    assert len(r4.json()) >= 1


def test_project_crud_and_cascade(session, student_headers):
    # create
    payload = {"title": "TEST_Project", "type": "short_film"}
    r = session.post(f"{API}/projects", headers=student_headers, json=payload, timeout=15)
    assert r.status_code == 200
    proj = r.json()
    pid = proj["id"]
    assert proj["thumbnail_url"]  # default assigned
    # get
    r = session.get(f"{API}/projects/{pid}", headers=student_headers, timeout=15)
    assert r.status_code == 200
    # patch
    r = session.patch(f"{API}/projects/{pid}", headers=student_headers, json={"status": "production", "progress": 50, "title": "TEST_Project_Updated"}, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["status"] == "production"
    assert d["progress"] == 50
    assert d["title"] == "TEST_Project_Updated"
    # create child script for cascade check
    sr = session.post(f"{API}/scripts", headers=student_headers, json={"project_id": pid, "title": "TEST_script", "content": "hi"}, timeout=15)
    assert sr.status_code == 200
    # delete cascade
    r = session.delete(f"{API}/projects/{pid}", headers=student_headers, timeout=15)
    assert r.status_code == 200
    # verify gone
    r = session.get(f"{API}/projects/{pid}", headers=student_headers, timeout=15)
    assert r.status_code == 404
    # verify scripts cascaded
    rs = session.get(f"{API}/projects/{pid}/scripts", headers=student_headers, timeout=15)
    assert rs.status_code == 200
    assert rs.json() == []


# -------- scripts --------
def test_scripts_flow(session, student_headers):
    pid = "proj-mv-neon-heart"
    # list
    r = session.get(f"{API}/projects/{pid}/scripts", headers=student_headers, timeout=15)
    assert r.status_code == 200
    # create
    r = session.post(f"{API}/scripts", headers=student_headers, json={"project_id": pid, "title": "TEST_S", "content": "v1"}, timeout=15)
    assert r.status_code == 200
    sid = r.json()["id"]
    v1 = r.json()["version"]
    # patch
    r = session.patch(f"{API}/scripts/{sid}", headers=student_headers, json={"content": "v2", "title": "TEST_S2"}, timeout=15)
    assert r.status_code == 200
    assert r.json()["content"] == "v2"
    assert r.json()["version"] == v1 + 1
    # delete
    r = session.delete(f"{API}/scripts/{sid}", headers=student_headers, timeout=15)
    assert r.status_code == 200


# -------- sync studio --------
def test_music_default_and_seeded(session, student_headers):
    # seeded
    r = session.get(f"{API}/projects/proj-mv-neon-heart/music", headers=student_headers, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["title"] == "Neon Heart"
    assert len(d["waveform"]) > 0
    # synthesized default
    # nonexistent project → 404 (iteration 4 authZ hardening: no leak of
    # project existence, no cross-owner reads). The synthesized default is
    # still returned for real projects that have no seeded music track.
    r = session.get(f"{API}/projects/nonexistent-pid/music", headers=student_headers, timeout=15)
    assert r.status_code == 404


def test_cues_flow(session, student_headers):
    pid = "proj-mv-neon-heart"
    r = session.get(f"{API}/projects/{pid}/cues", headers=student_headers, timeout=15)
    assert r.status_code == 200
    cues = r.json()
    assert len(cues) > 0
    # sorted
    ts = [c["timestamp"] for c in cues]
    assert ts == sorted(ts)
    # create
    r = session.post(f"{API}/cues", headers=student_headers, json={"project_id": pid, "timestamp": 999.9, "label": "TEST_cue", "type": "beat"}, timeout=15)
    assert r.status_code == 200
    cid = r.json()["id"]
    # delete
    r = session.delete(f"{API}/cues/{cid}", headers=student_headers, timeout=15)
    assert r.status_code == 200


# -------- rights --------
def test_rights_flow(session, student_headers):
    pid = "proj-mv-neon-heart"
    r = session.get(f"{API}/projects/{pid}/rights", headers=student_headers, timeout=15)
    assert r.status_code == 200
    assert len(r.json()) > 0
    # create
    r = session.post(f"{API}/rights", headers=student_headers, json={
        "project_id": pid, "contributor_name": "TEST_C", "role": "extra",
        "ownership_type": "contributor", "consent_recorded": True, "commercial_use": True
    }, timeout=15)
    assert r.status_code == 200
    rid = r.json()["id"]
    r = session.delete(f"{API}/rights/{rid}", headers=student_headers, timeout=15)
    assert r.status_code == 200


# -------- learning --------
def test_courses_list(session, student_headers):
    r = session.get(f"{API}/courses", headers=student_headers, timeout=15)
    assert r.status_code == 200
    assert len(r.json()) == 6


def test_enrollments_and_idempotent_enroll(session, student_headers):
    r = session.get(f"{API}/enrollments", headers=student_headers, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert len(data) > 0
    assert data[0]["course"] is not None
    # idempotent enroll on already-enrolled
    course_id = data[0]["enrollment"]["course_id"]
    r = session.post(f"{API}/enrollments", headers=student_headers, json={"course_id": course_id}, timeout=15)
    assert r.status_code == 200
    # new enroll
    r = session.post(f"{API}/enrollments", headers=student_headers, json={"course_id": "course-cgi-vp"}, timeout=15)
    assert r.status_code == 200


# -------- portfolio --------
def test_portfolio_flow(session, student_headers):
    r = session.get(f"{API}/portfolio", headers=student_headers, timeout=15)
    assert r.status_code == 200
    assert len(r.json()) > 0
    # add
    r = session.post(f"{API}/portfolio", headers=student_headers, json={
        "user_id": "x", "project_id": "proj-mv-neon-heart", "title": "TEST_P",
        "category": "Music Video", "thumbnail_url": "https://example.com/x.jpg"
    }, timeout=15)
    assert r.status_code == 200
    iid = r.json()["id"]
    # patch featured
    r = session.patch(f"{API}/portfolio/{iid}", headers=student_headers, json={"featured": True}, timeout=15)
    assert r.status_code == 200
    assert r.json()["featured"] is True
    # delete
    r = session.delete(f"{API}/portfolio/{iid}", headers=student_headers, timeout=15)
    assert r.status_code == 200


# -------- notifications --------
def test_notifications_flow(session, student_headers):
    r = session.get(f"{API}/notifications", headers=student_headers, timeout=15)
    assert r.status_code == 200
    notes = r.json()
    assert len(notes) > 0
    nid = notes[0]["id"]
    r = session.post(f"{API}/notifications/{nid}/read", headers=student_headers, timeout=15)
    assert r.status_code == 200


# -------- authorization --------
@pytest.mark.parametrize("path", [
    "/auth/me", "/dashboard/summary", "/projects", "/courses",
    "/enrollments", "/portfolio", "/notifications", "/calendar",
])
def test_protected_endpoints_require_auth(session, path):
    r = session.get(f"{API}{path}", timeout=15)
    assert r.status_code == 401, f"{path} did not return 401 (got {r.status_code})"


# -------- AI (real providers) --------
def test_ai_script_logline(session, student_headers):
    payload = {"kind": "logline", "prompt": "A student filmmaker discovers her AI collaborator can dream.", "tone": "cinematic"}
    r = session.post(f"{API}/ai/script", headers=student_headers, json=payload, timeout=90)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["content"] and len(d["content"]) > 10
    assert d["saved_script"] is None
    assert "anthropic" in d["provider"]


def test_ai_script_saved(session, student_headers):
    payload = {"kind": "logline", "prompt": "A neon-lit chase through Lagos.", "project_id": "proj-mv-neon-heart"}
    r = session.post(f"{API}/ai/script", headers=student_headers, json=payload, timeout=90)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["saved_script"] is not None
    assert d["saved_script"]["project_id"] == "proj-mv-neon-heart"


def test_ai_image(session, student_headers):
    payload = {"prompt": "A rain-slick neon alley at midnight, wine-red coat figure", "save_as_asset": True, "project_id": "proj-mv-neon-heart"}
    r = session.post(f"{API}/ai/image", headers=student_headers, json=payload, timeout=120)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["url"].startswith("/api/generated/")
    assert d["saved_asset"] is not None
    # fetch file
    filename = d["filename"]
    r2 = session.get(f"{API}/generated/{filename}", headers=student_headers, timeout=30)
    assert r2.status_code == 200
    assert r2.headers.get("content-type", "").startswith("image/")
    assert len(r2.content) > 500
