"""Backend tests for CYNAIAH Faculty / Reviews layer (iteration 3)."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # frontend/.env fallback for pytest env
    from pathlib import Path
    for line in Path("/app/frontend/.env").read_text().splitlines():
        if line.startswith("REACT_APP_BACKEND_URL="):
            BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
            break

STUDENT = {"email": "student@cynaiah.demo", "password": "Cynaiah2026!"}
FACULTY = {"email": "faculty@cynaiah.demo", "password": "Cynaiah2026!"}
FLAGSHIP = "proj-mv-neon-heart"


def _login(creds):
    r = requests.post(f"{BASE_URL}/api/auth/login", json=creds, timeout=30)
    assert r.status_code == 200, f"login failed {r.status_code} {r.text}"
    tok = r.json().get("access_token") or r.json().get("token")
    assert tok
    return tok


@pytest.fixture(scope="module")
def student_token():
    return _login(STUDENT)


@pytest.fixture(scope="module")
def faculty_token():
    return _login(FACULTY)


def H(t):
    return {"Authorization": f"Bearer {t}", "Content-Type": "application/json"}


# ---------- Rubric ----------
def test_rubric_competencies_public():
    r = requests.get(f"{BASE_URL}/api/rubric/competencies", timeout=30)
    assert r.status_code == 200
    data = r.json()
    keys = [c["key"] for c in data["competencies"]]
    assert keys == ["story", "direction", "cinematography", "sound_music", "ai_ethics_rights", "craft"]
    assert data["scale"] == {"min": 1, "max": 5}


# ---------- Faculty auth gate ----------
def test_faculty_dashboard_student_forbidden(student_token):
    r = requests.get(f"{BASE_URL}/api/faculty/dashboard", headers=H(student_token), timeout=30)
    assert r.status_code == 403


def test_faculty_dashboard_faculty_ok(faculty_token):
    r = requests.get(f"{BASE_URL}/api/faculty/dashboard", headers=H(faculty_token), timeout=30)
    assert r.status_code == 200
    data = r.json()
    projects = data["projects"]
    assert len(projects) == 6, f"expected 6, got {len(projects)}"
    ids = [t["project"]["id"] for t in projects]
    assert FLAGSHIP in ids
    nh = next(t for t in projects if t["project"]["id"] == FLAGSHIP)
    assert nh["status"] in {"revision_requested", "approved", "final"}
    assert nh["review_count"] >= 5
    assert "open_count" in nh and "last_review_at" in nh


def test_faculty_project_view_student_forbidden(student_token):
    r = requests.get(f"{BASE_URL}/api/faculty/projects/{FLAGSHIP}", headers=H(student_token), timeout=30)
    assert r.status_code == 403


def test_faculty_project_view_ok(faculty_token):
    r = requests.get(f"{BASE_URL}/api/faculty/projects/{FLAGSHIP}", headers=H(faculty_token), timeout=30)
    assert r.status_code == 200
    d = r.json()
    for k in ["project", "student", "scripts", "storyboard_frames", "scenes", "shots",
              "music", "cues", "rights", "budget", "reviews", "latest_status", "latest_rubric", "rubric"]:
        assert k in d, f"missing {k}"
    assert d["latest_status"] in {"revision_requested", "approved", "final"}
    # reviews sorted desc
    created = [r["created_at"] for r in d["reviews"]]
    assert created == sorted(created, reverse=True)


def test_post_review_student_forbidden(student_token):
    r = requests.post(f"{BASE_URL}/api/faculty/projects/{FLAGSHIP}/reviews",
                      headers=H(student_token), json={"kind": "written", "message": "x"}, timeout=30)
    assert r.status_code == 403


# ---------- Append-only + supersedes ----------
def test_append_only_and_supersedes(faculty_token):
    # 1) insert new written
    r = requests.post(f"{BASE_URL}/api/faculty/projects/{FLAGSHIP}/reviews",
                      headers=H(faculty_token),
                      json={"kind": "written", "message": "TEST_append_only note"}, timeout=30)
    assert r.status_code == 200, r.text
    new_written = r.json()
    assert new_written["id"]

    # 2) Get existing rubric id
    proj = requests.get(f"{BASE_URL}/api/faculty/projects/{FLAGSHIP}",
                        headers=H(faculty_token), timeout=30).json()
    prev_rubric = next(rv for rv in proj["reviews"] if rv["kind"] == "rubric" and not rv.get("superseded_by"))
    prev_id = prev_rubric["id"]

    # 3) Post new rubric with supersedes
    payload = {
        "kind": "rubric",
        "message": "TEST_updated rubric",
        "rubric_scores": {"story": 5, "direction": 5, "cinematography": 5,
                          "sound_music": 4, "ai_ethics_rights": 5, "craft": 5},
        "supersedes": prev_id,
    }
    r = requests.post(f"{BASE_URL}/api/faculty/projects/{FLAGSHIP}/reviews",
                      headers=H(faculty_token), json=payload, timeout=30)
    assert r.status_code == 200, r.text
    new_rubric = r.json()

    # 4) Old row still exists AND has superseded_by set
    proj2 = requests.get(f"{BASE_URL}/api/faculty/projects/{FLAGSHIP}",
                         headers=H(faculty_token), timeout=30).json()
    ids = {rv["id"]: rv for rv in proj2["reviews"]}
    assert prev_id in ids, "previous rubric was deleted — MUST remain visible"
    assert ids[prev_id]["superseded_by"] == new_rubric["id"]
    assert new_rubric["id"] in ids


# ---------- Validation ----------
def test_rubric_missing_scores_400(faculty_token):
    r = requests.post(f"{BASE_URL}/api/faculty/projects/{FLAGSHIP}/reviews",
                      headers=H(faculty_token), json={"kind": "rubric", "message": "x"}, timeout=30)
    assert r.status_code == 400


def test_status_invalid_400(faculty_token):
    r = requests.post(f"{BASE_URL}/api/faculty/projects/{FLAGSHIP}/reviews",
                      headers=H(faculty_token),
                      json={"kind": "status", "status_value": "bogus"}, timeout=30)
    assert r.status_code == 400


def test_time_coded_missing_timestamp_400(faculty_token):
    r = requests.post(f"{BASE_URL}/api/faculty/projects/{FLAGSHIP}/reviews",
                      headers=H(faculty_token),
                      json={"kind": "time_coded", "message": "x"}, timeout=30)
    assert r.status_code == 400


# ---------- Project reviews visibility ----------
def test_project_reviews_student_owner(student_token):
    r = requests.get(f"{BASE_URL}/api/projects/{FLAGSHIP}/reviews", headers=H(student_token), timeout=30)
    assert r.status_code == 200
    d = r.json()
    assert len(d["reviews"]) >= 5
    for rv in d["reviews"]:
        assert rv.get("author") and rv["author"].get("name")


def test_project_reviews_faculty(faculty_token):
    r = requests.get(f"{BASE_URL}/api/projects/{FLAGSHIP}/reviews", headers=H(faculty_token), timeout=30)
    assert r.status_code == 200
    assert len(r.json()["reviews"]) >= 5


# ---------- Student inbox ----------
def test_student_reviews_summary(student_token):
    r = requests.get(f"{BASE_URL}/api/student/reviews-summary", headers=H(student_token), timeout=30)
    assert r.status_code == 200
    d = r.json()
    assert len(d["projects"]) == 6
    nh = next(p for p in d["projects"] if p["project"]["id"] == FLAGSHIP)
    assert nh["status"] in {"revision_requested", "approved", "final"}
    assert nh["review_count"] >= 5
    assert len(nh["reviews"]) <= 12
    assert isinstance(nh["latest_review_at"], str)
