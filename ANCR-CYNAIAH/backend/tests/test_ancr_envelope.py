"""CYNAIAH iteration-6 — ANCR-integration-ready notifications.

Verifies:
  * GET  /api/notifications/link-registry     — public, shape + entries + event_types.
  * POST /api/notifications/resolve-link      — resolves registered links, 404 on unregistered.
  * POST /api/faculty/projects/{pid}/reviews  — spawns ANCR-shaped envelope per kind.
  * GET  /api/notifications/{id}/envelope     — owner-only envelope readback.
  * Every deep_link on every notification in the caller's inbox resolves.
  * Envelope owner-only guard (cross-owner returns 404).
  * ANCR bus sink stays 'not_configured' while ANCR_NOTIFICATIONS_ENABLED=false.
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
PROJECT = "proj-mv-neon-heart"
PROJECT_TITLE = "Neon Heart"
STUDENT_ID = "demo-student-001"
FACULTY_ID = "demo-faculty-001"
FACULTY_NAME = "Prof. Idris Bello"

EXPECTED_LINK_IDS = {
    "reviews.event",
    "reviews.project",
    "faculty.project",
    "faculty.dashboard",
    "project.command_center",
    "storyboard.frame",
}
EXPECTED_EVENT_TYPES = {
    "review.coverage_response",
    "review.rubric",
    "review.status",
    "review.time_coded",
    "review.written",
    "review.frame_feedback",
}
KIND_TO_EVENT = {
    "written": "review.written",
    "time_coded": "review.time_coded",
    "coverage_response": "review.coverage_response",
    "rubric": "review.rubric",
    "status": "review.status",
}


# ---------------- fixtures ----------------
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


def _post_review(s, faculty_tok, payload):
    r = s.post(
        f"{API}/faculty/projects/{PROJECT}/reviews",
        headers=_hdr(faculty_tok),
        json=payload,
        timeout=30,
    )
    assert r.status_code == 200, r.text
    return r.json()


@pytest.fixture(scope="module")
def created_reviews(s, faculty_tok):
    payloads = {
        "written": {"kind": "written", "message": "ANCR test written"},
        "time_coded": {"kind": "time_coded", "message": "ANCR test tc", "timestamp_seconds": 42},
        "coverage_response": {"kind": "coverage_response", "message": "ANCR test cov", "target_ref": "3", "target_type": "scene"},
        "rubric": {"kind": "rubric", "message": "ANCR test rubric",
                   "rubric_scores": {c: 4 for c in ["story", "craft", "originality", "collaboration", "reflection"]}},
        "status": {"kind": "status", "status_value": "approved", "message": "ANCR test status"},
    }
    out = {}
    for kind, pl in payloads.items():
        out[kind] = _post_review(s, faculty_tok, pl)
    return out


# ---------------- 1. link-registry ----------------
def test_link_registry_public_no_auth(s):
    r = s.get(f"{API}/notifications/link-registry", timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["ancr_notifications_enabled"] is False
    assert isinstance(data["links"], list) and len(data["links"]) == 6
    ids = {e["id"] for e in data["links"]}
    assert ids == EXPECTED_LINK_IDS
    for entry in data["links"]:
        assert "path_pattern" in entry
        assert "required_query" in entry
        assert "description" in entry
    assert set(data["event_types"]) == EXPECTED_EVENT_TYPES


# ---------------- 2. resolve-link ----------------
def test_resolve_link_valid_event(s, student_tok):
    link = f"/reviews?project={PROJECT}&review=rev-nh-1"
    r = s.post(f"{API}/notifications/resolve-link", headers=_hdr(student_tok),
               json={"deep_link": link}, timeout=15)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["deep_link"] == link
    assert body["matched"]["id"] == "reviews.event"


def test_resolve_link_valid_project(s, student_tok):
    link = f"/reviews?project={PROJECT}"
    r = s.post(f"{API}/notifications/resolve-link", headers=_hdr(student_tok),
               json={"deep_link": link}, timeout=15)
    assert r.status_code == 200
    assert r.json()["matched"]["id"] == "reviews.project"


def test_resolve_link_faculty_project(s, student_tok):
    r = s.post(f"{API}/notifications/resolve-link", headers=_hdr(student_tok),
               json={"deep_link": f"/faculty/projects/{PROJECT}"}, timeout=15)
    assert r.status_code == 200
    assert r.json()["matched"]["id"] == "faculty.project"


def test_resolve_link_faculty_dashboard(s, student_tok):
    r = s.post(f"{API}/notifications/resolve-link", headers=_hdr(student_tok),
               json={"deep_link": "/faculty"}, timeout=15)
    assert r.status_code == 200
    assert r.json()["matched"]["id"] == "faculty.dashboard"


def test_resolve_link_project_command_center(s, student_tok):
    r = s.post(f"{API}/notifications/resolve-link", headers=_hdr(student_tok),
               json={"deep_link": f"/projects/{PROJECT}"}, timeout=15)
    assert r.status_code == 200
    assert r.json()["matched"]["id"] == "project.command_center"


@pytest.mark.parametrize("bad_link", [
    "/random/nowhere",
    "/reviews",  # missing required project param
    "/reviews?review=abc",  # missing project param
    "not-a-path",
    "",
])
def test_resolve_link_unregistered_returns_404(s, student_tok, bad_link):
    r = s.post(f"{API}/notifications/resolve-link", headers=_hdr(student_tok),
               json={"deep_link": bad_link}, timeout=15)
    assert r.status_code == 404, f"link '{bad_link}' should be unregistered, got {r.status_code}"


def test_resolve_link_requires_auth(s):
    r = s.post(f"{API}/notifications/resolve-link",
               json={"deep_link": f"/reviews?project={PROJECT}&review=x"}, timeout=15)
    assert r.status_code in (401, 403)


# ---------------- 3. envelope shape ----------------
@pytest.mark.parametrize("kind", ["written", "time_coded", "coverage_response", "rubric", "status"])
def test_envelope_shape_per_kind(s, student_tok, created_reviews, kind):
    review = created_reviews[kind]
    notes = s.get(f"{API}/notifications", headers=_hdr(student_tok), timeout=15).json()
    note = next((n for n in notes if n.get("review_id") == review["id"]), None)
    assert note is not None, f"notification for review {review['id']} not found"

    r = s.get(f"{API}/notifications/{note['id']}/envelope", headers=_hdr(student_tok), timeout=15)
    assert r.status_code == 200, r.text
    body = r.json()
    env = body["envelope"]

    assert env["event_type"] == KIND_TO_EVENT[kind]
    assert env["actor"] == {"user_id": FACULTY_ID, "name": FACULTY_NAME, "ancrid": None}
    assert env["recipient"]["user_id"] == STUDENT_ID
    assert env["recipient"]["ancrid"] is None
    assert env["subject"] == {"kind": "project", "id": PROJECT, "title": PROJECT_TITLE}
    assert env["payload"]["review_id"] == review["id"]
    assert env["payload"]["kind"] == kind
    assert env["ancr_ready"] is True
    assert env["ancr_emitted_at"] is None
    assert env["deep_link"] == f"/reviews?project={PROJECT}&review={review['id']}"

    # channels
    ch = body["channels"]
    assert isinstance(ch, list) and len(ch) == 2
    in_app = next((c for c in ch if c["name"] == "in_app"), None)
    ancr = next((c for c in ch if c["name"] == "ancr_bus"), None)
    assert in_app is not None and in_app["status"] == "delivered"
    assert in_app["delivered_at"] is not None
    assert ancr is not None and ancr["status"] == "not_configured"

    # link registry match
    assert body["link_registry_match"] is not None
    assert body["link_registry_match"]["id"] == "reviews.event"


def test_five_reviews_produce_five_notifications(s, student_tok, created_reviews):
    notes = s.get(f"{API}/notifications", headers=_hdr(student_tok), timeout=15).json()
    created_ids = {r["id"] for r in created_reviews.values()}
    matched = [n for n in notes if n.get("review_id") in created_ids]
    assert len(matched) == 5
    # each has ancr_ready
    for n in matched:
        assert n.get("ancr_ready") is True


# ---------------- 4. Envelope owner-only ----------------
def test_envelope_cross_owner_404(s, student_tok, attacker_tok, created_reviews):
    review = created_reviews["written"]
    notes = s.get(f"{API}/notifications", headers=_hdr(student_tok), timeout=15).json()
    note = next(n for n in notes if n.get("review_id") == review["id"])

    r = s.get(f"{API}/notifications/{note['id']}/envelope",
              headers=_hdr(attacker_tok), timeout=15)
    assert r.status_code == 404


def test_envelope_invalid_id_404(s, student_tok):
    r = s.get(f"{API}/notifications/does-not-exist/envelope",
              headers=_hdr(student_tok), timeout=15)
    assert r.status_code == 404


def test_envelope_requires_auth(s, student_tok, created_reviews):
    review = created_reviews["written"]
    notes = s.get(f"{API}/notifications", headers=_hdr(student_tok), timeout=15).json()
    note = next(n for n in notes if n.get("review_id") == review["id"])
    r = s.get(f"{API}/notifications/{note['id']}/envelope", timeout=15)
    assert r.status_code in (401, 403)


# ---------------- 5. EVERY link on EVERY notification resolves ----------------
def test_every_notification_link_resolves_for_student(s, student_tok, created_reviews):
    notes = s.get(f"{API}/notifications", headers=_hdr(student_tok), timeout=15).json()
    assert len(notes) >= 5
    failed = []
    missing_link = []
    for n in notes:
        link = n.get("deep_link")
        if not link:
            # Legacy pre-registry notifications (type != 'review') may have no deep_link.
            # Review notifications MUST have one.
            if n.get("type") == "review":
                missing_link.append(n.get("id"))
            continue
        r = s.post(f"{API}/notifications/resolve-link",
                   headers=_hdr(student_tok), json={"deep_link": link}, timeout=15)
        if r.status_code != 200:
            failed.append((n.get("id"), link, r.status_code))
    assert not failed, f"Unregistered notification links: {failed}"
    assert not missing_link, f"Review notifications missing deep_link: {missing_link}"


def test_every_notification_link_resolves_for_faculty(s, faculty_tok):
    """Faculty may or may not have notifications; if they do, all must resolve."""
    notes = s.get(f"{API}/notifications", headers=_hdr(faculty_tok), timeout=15).json()
    failed = []
    for n in notes:
        link = n.get("deep_link")
        if not link:
            continue  # legacy row without deep_link
        r = s.post(f"{API}/notifications/resolve-link",
                   headers=_hdr(faculty_tok), json={"deep_link": link}, timeout=15)
        if r.status_code != 200:
            failed.append((n.get("id"), link, r.status_code))
    assert not failed, f"Unregistered faculty notification links: {failed}"


# ---------------- 6. Live route sanity checks against link classes ----------------
def test_route_projects_reviews_owner_ok(s, student_tok):
    r = s.get(f"{API}/projects/{PROJECT}/reviews", headers=_hdr(student_tok), timeout=15)
    assert r.status_code == 200


def test_route_faculty_project_assigned_ok(s, faculty_tok):
    r = s.get(f"{API}/projects/{PROJECT}/reviews", headers=_hdr(faculty_tok), timeout=15)
    assert r.status_code == 200


def test_route_faculty_project_unassigned_forbidden_for_attacker(s, attacker_tok):
    r = s.get(f"{API}/projects/{PROJECT}/reviews", headers=_hdr(attacker_tok), timeout=15)
    # Non-owner, non-faculty -> 403 (or 404 if project hidden). Both are acceptable non-leak.
    assert r.status_code in (403, 404)


def test_route_project_command_center_owner_ok(s, student_tok):
    r = s.get(f"{API}/projects/{PROJECT}", headers=_hdr(student_tok), timeout=15)
    assert r.status_code == 200


# ---------------- 7. Regression — immutable history + seeded rows ----------------
def test_regression_seeded_reviews_preserved(s, student_tok):
    body = s.get(f"{API}/projects/{PROJECT}/reviews", headers=_hdr(student_tok), timeout=15).json()
    ids = {r["id"] for r in body["reviews"]}
    for sid in ["rev-nh-1", "rev-nh-2", "rev-nh-3", "rev-nh-4", "rev-nh-5"]:
        assert sid in ids, f"seeded review {sid} missing after ANCR suite"
