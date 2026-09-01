"""CYNAIAH iteration-4 AuthZ regression suite.

Guarantees that nested project resources (music/cues/rights/feedback/scripts/
characters/storyboard-frames) and their POST/PATCH/DELETE endpoints all go
through _assert_project_owner. A *second* student created dynamically must NOT
be able to read or mutate the demo-student's seeded project proj-mv-neon-heart.
The design choice is 404 (not 403) to avoid leaking existence; we accept both.
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip()
                break
API = f"{BASE_URL.rstrip('/')}/api"

DEMO_STUDENT = ("student@cynaiah.demo", "Cynaiah2026!")
DEMO_FACULTY = ("faculty@cynaiah.demo", "Cynaiah2026!")
DEMO_PROJECT = "proj-mv-neon-heart"

FORBIDDEN = (403, 404)  # both acceptable, 404 preferred


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


def _login(s, email, pw):
    r = s.post(f"{API}/auth/login", json={"email": email, "password": pw}, timeout=30)
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


def _hdr(tok):
    return {"Authorization": f"Bearer {tok}", "Content-Type": "application/json"}


@pytest.fixture(scope="module")
def student_tok(s):
    return _login(s, *DEMO_STUDENT)


@pytest.fixture(scope="module")
def faculty_tok(s):
    return _login(s, *DEMO_FACULTY)


@pytest.fixture(scope="module")
def attacker_tok(s):
    email = f"sectest+{uuid.uuid4().hex[:10]}@cynaiah.demo"
    r = s.post(
        f"{API}/auth/register",
        json={"email": email, "password": "SecTest2026!", "name": "Sec Tester", "role": "student"},
        timeout=30,
    )
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture(scope="module")
def seeded_cue_id(s, student_tok):
    r = s.get(f"{API}/projects/{DEMO_PROJECT}/cues", headers=_hdr(student_tok), timeout=15)
    assert r.status_code == 200
    cues = r.json()
    assert len(cues) >= 1
    return cues[0]["id"]


@pytest.fixture(scope="module")
def seeded_right_id(s, student_tok):
    r = s.get(f"{API}/projects/{DEMO_PROJECT}/rights", headers=_hdr(student_tok), timeout=15)
    assert r.status_code == 200
    rights = r.json()
    assert len(rights) >= 1
    return rights[0]["id"]


# ---------------- 1. Cross-owner GETs are blocked ----------------
@pytest.mark.parametrize("sub", ["music", "cues", "rights", "feedback"])
def test_cross_owner_get_nested_blocked(s, attacker_tok, sub):
    r = s.get(f"{API}/projects/{DEMO_PROJECT}/{sub}", headers=_hdr(attacker_tok), timeout=15)
    assert r.status_code in FORBIDDEN, f"GET /{sub} leaked: {r.status_code} {r.text[:200]}"


# ---------------- 2. Cross-owner POSTs are blocked ----------------
def test_cross_owner_post_cues_blocked(s, attacker_tok):
    r = s.post(
        f"{API}/cues",
        headers=_hdr(attacker_tok),
        json={"project_id": DEMO_PROJECT, "timestamp": 1.0, "label": "ATTACK", "type": "beat"},
        timeout=15,
    )
    assert r.status_code in FORBIDDEN


def test_cross_owner_post_rights_blocked(s, attacker_tok):
    r = s.post(
        f"{API}/rights",
        headers=_hdr(attacker_tok),
        json={
            "project_id": DEMO_PROJECT,
            "contributor_name": "ATTACK",
            "role": "extra",
            "ownership_type": "contributor",
            "consent_recorded": True,
            "commercial_use": True,
        },
        timeout=15,
    )
    assert r.status_code in FORBIDDEN


def test_cross_owner_post_scripts_blocked(s, attacker_tok):
    r = s.post(
        f"{API}/scripts",
        headers=_hdr(attacker_tok),
        json={"project_id": DEMO_PROJECT, "title": "ATTACK", "content": "bad"},
        timeout=15,
    )
    assert r.status_code in FORBIDDEN


def test_cross_owner_post_characters_blocked(s, attacker_tok):
    r = s.post(
        f"{API}/characters",
        headers=_hdr(attacker_tok),
        json={"project_id": DEMO_PROJECT, "name": "ATTACK", "description": "x"},
        timeout=15,
    )
    assert r.status_code in FORBIDDEN


def test_cross_owner_post_storyboard_frames_blocked(s, attacker_tok):
    r = s.post(
        f"{API}/storyboard-frames",
        headers=_hdr(attacker_tok),
        json={"project_id": DEMO_PROJECT, "order": 999, "description": "ATTACK"},
        timeout=15,
    )
    assert r.status_code in FORBIDDEN


# ---------------- 3. Cross-owner PATCH / DELETE on seeded child ids ----------------
def test_cross_owner_patch_cue_blocked(s, attacker_tok, seeded_cue_id):
    r = s.patch(
        f"{API}/cues/{seeded_cue_id}",
        headers=_hdr(attacker_tok),
        json={"label": "PWNED"},
        timeout=15,
    )
    assert r.status_code in FORBIDDEN


def test_cross_owner_delete_cue_blocked(s, attacker_tok, seeded_cue_id):
    r = s.delete(f"{API}/cues/{seeded_cue_id}", headers=_hdr(attacker_tok), timeout=15)
    assert r.status_code in FORBIDDEN


def test_cross_owner_delete_right_blocked(s, attacker_tok, seeded_right_id):
    r = s.delete(f"{API}/rights/{seeded_right_id}", headers=_hdr(attacker_tok), timeout=15)
    assert r.status_code in FORBIDDEN


# ---------------- 4. AI endpoints reject cross-owner project_id ----------------
def test_cross_owner_ai_script_no_save(s, attacker_tok):
    """AI script with victim's project_id must not save into victim's project."""
    r = s.post(
        f"{API}/ai/script",
        headers=_hdr(attacker_tok),
        json={"kind": "logline", "prompt": "quick test", "project_id": DEMO_PROJECT},
        timeout=90,
    )
    # Either 404 outright OR 200 with saved_script=None
    if r.status_code == 200:
        d = r.json()
        assert d.get("saved_script") is None, "attacker managed to save script into victim project!"
    else:
        assert r.status_code in FORBIDDEN, r.text


def test_cross_owner_ai_image_no_save(s, attacker_tok):
    """AI image save_as_asset with victim's project_id must not save asset."""
    r = s.post(
        f"{API}/ai/image",
        headers=_hdr(attacker_tok),
        json={"prompt": "test", "save_as_asset": True, "project_id": DEMO_PROJECT},
        timeout=120,
    )
    if r.status_code == 200:
        d = r.json()
        assert d.get("saved_asset") is None, "attacker managed to save asset into victim project!"
    else:
        assert r.status_code in FORBIDDEN, r.text


# ---------------- 5. Positive path — owner still works ----------------
def test_owner_get_music(s, student_tok):
    r = s.get(f"{API}/projects/{DEMO_PROJECT}/music", headers=_hdr(student_tok), timeout=15)
    assert r.status_code == 200
    assert r.json()["title"] == "Neon Heart"


def test_owner_get_cues(s, student_tok):
    r = s.get(f"{API}/projects/{DEMO_PROJECT}/cues", headers=_hdr(student_tok), timeout=15)
    assert r.status_code == 200
    assert len(r.json()) >= 9


def test_owner_get_rights(s, student_tok):
    r = s.get(f"{API}/projects/{DEMO_PROJECT}/rights", headers=_hdr(student_tok), timeout=15)
    assert r.status_code == 200
    assert len(r.json()) >= 1


def test_owner_get_feedback(s, student_tok):
    r = s.get(f"{API}/projects/{DEMO_PROJECT}/feedback", headers=_hdr(student_tok), timeout=15)
    assert r.status_code == 200


def test_owner_post_cue_and_cleanup(s, student_tok):
    r = s.post(
        f"{API}/cues",
        headers=_hdr(student_tok),
        json={"project_id": DEMO_PROJECT, "timestamp": 888.8, "label": "TEST_owner_cue", "type": "beat"},
        timeout=15,
    )
    assert r.status_code == 200
    cid = r.json()["id"]
    r2 = s.delete(f"{API}/cues/{cid}", headers=_hdr(student_tok), timeout=15)
    assert r2.status_code == 200


def test_owner_post_right_and_cleanup(s, student_tok):
    r = s.post(
        f"{API}/rights",
        headers=_hdr(student_tok),
        json={
            "project_id": DEMO_PROJECT,
            "contributor_name": "TEST_owner_right",
            "role": "extra",
            "ownership_type": "contributor",
            "consent_recorded": True,
            "commercial_use": True,
        },
        timeout=15,
    )
    assert r.status_code == 200
    rid = r.json()["id"]
    r2 = s.delete(f"{API}/rights/{rid}", headers=_hdr(student_tok), timeout=15)
    assert r2.status_code == 200


def test_owner_post_script_and_cleanup(s, student_tok):
    r = s.post(
        f"{API}/scripts",
        headers=_hdr(student_tok),
        json={"project_id": DEMO_PROJECT, "title": "TEST_owner_script", "content": "ok"},
        timeout=15,
    )
    assert r.status_code == 200
    sid = r.json()["id"]
    r2 = s.delete(f"{API}/scripts/{sid}", headers=_hdr(student_tok), timeout=15)
    assert r2.status_code == 200


def test_owner_post_character(s, student_tok):
    r = s.post(
        f"{API}/characters",
        headers=_hdr(student_tok),
        json={"project_id": DEMO_PROJECT, "name": "TEST_char", "description": "x"},
        timeout=15,
    )
    assert r.status_code == 200


def test_owner_post_storyboard_frame(s, student_tok):
    r = s.post(
        f"{API}/storyboard-frames",
        headers=_hdr(student_tok),
        json={"project_id": DEMO_PROJECT, "order": 9999, "description": "TEST_frame"},
        timeout=15,
    )
    assert r.status_code == 200


# ---------------- 6. Data integrity — seeded cues untouched ----------------
def test_seeded_cues_unmodified(s, student_tok):
    r = s.get(f"{API}/projects/{DEMO_PROJECT}/cues", headers=_hdr(student_tok), timeout=15)
    assert r.status_code == 200
    cues = r.json()
    # Filter out any TEST_ cues (should be none if cleanup ran, but be safe)
    seeded = [c for c in cues if not c.get("label", "").startswith("TEST_") and not c.get("label", "").startswith("ATTACK")]
    assert len(seeded) >= 9, f"expected >=9 seeded cues, got {len(seeded)}"
    # ensure no ATTACK / PWNED label survived
    for c in cues:
        assert "PWNED" not in c.get("label", "")
        assert "ATTACK" not in c.get("label", "")


# ---------------- 7. Route-shadowing / iteration-2/3 regression ----------------
def test_coverage_coach_still_works(s, student_tok):
    r = s.post(
        f"{API}/projects/{DEMO_PROJECT}/production/coverage-coach",
        headers=_hdr(student_tok),
        json={"scene_description": "A brief cafe conversation between two friends about a secret."},
        timeout=120,
    )
    # 200 expected; if Claude flakes accept 502/504 but not 401/403/404
    assert r.status_code in (200, 502, 504), r.text[:300]


def test_faculty_dashboard_gate(s, student_tok, faculty_tok):
    r = s.get(f"{API}/faculty/dashboard", headers=_hdr(student_tok), timeout=15)
    assert r.status_code == 403
    r2 = s.get(f"{API}/faculty/dashboard", headers=_hdr(faculty_tok), timeout=15)
    assert r2.status_code == 200


def test_faculty_reviews_seeded(s, student_tok):
    r = s.get(f"{API}/projects/{DEMO_PROJECT}/reviews", headers=_hdr(student_tok), timeout=15)
    assert r.status_code == 200
    assert len(r.json()) >= 5


# ---------------- 8. No-token / bad-token ----------------
NO_TOKEN_PATHS = [
    ("GET", f"/projects/{DEMO_PROJECT}/music"),
    ("GET", f"/projects/{DEMO_PROJECT}/cues"),
    ("GET", f"/projects/{DEMO_PROJECT}/rights"),
    ("GET", f"/projects/{DEMO_PROJECT}/feedback"),
    ("POST", "/cues"),
    ("POST", "/rights"),
    ("POST", "/scripts"),
    ("POST", "/characters"),
    ("POST", "/storyboard-frames"),
    ("DELETE", "/cues/cue-1"),
    ("DELETE", "/rights/rt-1"),
    ("PATCH", "/cues/cue-1"),
]


@pytest.mark.parametrize("method,path", NO_TOKEN_PATHS)
def test_no_token_returns_401(s, method, path):
    r = s.request(method, f"{API}{path}", json={} if method != "GET" else None, timeout=15)
    assert r.status_code == 401, f"{method} {path} -> {r.status_code}"


def test_invalid_jwt_returns_401(s):
    r = s.get(f"{API}/auth/me", headers={"Authorization": "Bearer not.a.real.jwt"}, timeout=15)
    assert r.status_code == 401
    assert "Invalid token" in r.text or "invalid" in r.text.lower()
