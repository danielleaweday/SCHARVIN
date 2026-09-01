"""CYNAIAH iteration-5 — review notifications + immutable history.

Every faculty review event must spawn ONE bell notification for the project
owner (side-effect only) without ever mutating or deleting the append-only
faculty_reviews log.

Endpoints under test:
  POST /api/faculty/projects/{pid}/reviews   -> creates review + notification
  GET  /api/notifications                    -> owner-scoped list (sorted desc)
  POST /api/notifications/{id}/read          -> owner-only mark read
  POST /api/notifications/read-all           -> owner-only bulk mark
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
SEEDED_REVIEW_IDS = ["rev-nh-1", "rev-nh-2", "rev-nh-3", "rev-nh-4", "rev-nh-5"]


# ---------------- helpers / fixtures ----------------
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


def _get_notes(s, tok):
    r = s.get(f"{API}/notifications", headers=_hdr(tok), timeout=15)
    assert r.status_code == 200
    return r.json()


def _find_note_for_review(notes, review_id):
    return next((n for n in notes if n.get("review_id") == review_id), None)


# ---------------- 1. Baseline snapshot ----------------
def _list_reviews(s, tok):
    body = s.get(f"{API}/projects/{PROJECT}/reviews", headers=_hdr(tok), timeout=15).json()
    # Endpoint returns dict {reviews:[...], latest_status, latest_rubric, ...}
    return body["reviews"] if isinstance(body, dict) else body


@pytest.fixture(scope="module")
def baseline(s, student_tok):
    reviews = _list_reviews(s, student_tok)
    notes = _get_notes(s, student_tok)
    return {"reviews": reviews, "notes": notes}


def test_baseline_seeded_reviews_present(baseline):
    ids = {r["id"] for r in baseline["reviews"]}
    for sid in SEEDED_REVIEW_IDS:
        assert sid in ids, f"seeded review {sid} missing"


# ---------------- 2. Each of the 5 kinds creates review + notification ----------------
def _assert_note_shape(note, review_id, kind):
    assert note is not None, f"notification for review {review_id} not found"
    assert note["type"] == "review"
    assert note["read"] is False
    assert note["project_id"] == PROJECT
    assert note["review_id"] == review_id
    assert note["review_kind"] == kind
    assert note["author_name"] == "Prof. Idris Bello"
    assert note["deep_link"] == f"/reviews?project={PROJECT}&review={review_id}"
    assert note.get("project_title")


@pytest.fixture(scope="module")
def created_reviews(s, faculty_tok, student_tok, baseline):
    """Create one review of each kind and return dict[kind] = review."""
    payloads = {
        "written": {"kind": "written", "message": "TEST written note"},
        "time_coded": {"kind": "time_coded", "message": "TEST tc", "timestamp_seconds": 33},
        "coverage_response": {"kind": "coverage_response", "message": "TEST cov", "target_ref": "2", "target_type": "scene"},
        "rubric": {"kind": "rubric", "message": "TEST rubric",
                   "rubric_scores": {c: 4 for c in ["story", "craft", "originality", "collaboration", "reflection"]}},
        "status": {"kind": "status", "status_value": "approved", "message": "TEST status"},
    }
    out = {}
    for kind, pl in payloads.items():
        out[kind] = _post_review(s, faculty_tok, pl)
    return out


@pytest.mark.parametrize("kind", ["written", "time_coded", "coverage_response", "rubric", "status"])
def test_review_creates_notification(s, student_tok, created_reviews, kind):
    review = created_reviews[kind]
    notes = _get_notes(s, student_tok)
    note = _find_note_for_review(notes, review["id"])
    _assert_note_shape(note, review["id"], kind)


def test_notification_copy_written(s, student_tok, created_reviews):
    n = _find_note_for_review(_get_notes(s, student_tok), created_reviews["written"]["id"])
    assert "left you a written note" in n["message"]


def test_notification_copy_time_coded(s, student_tok, created_reviews):
    n = _find_note_for_review(_get_notes(s, student_tok), created_reviews["time_coded"]["id"])
    assert "0:33" in n["message"], f"expected 0:33 timestamp in copy, got: {n['message']}"


def test_notification_copy_coverage_response(s, student_tok, created_reviews):
    n = _find_note_for_review(_get_notes(s, student_tok), created_reviews["coverage_response"]["id"])
    assert "Scene 2" in n["message"], f"expected 'Scene 2' in copy, got: {n['message']}"


def test_notification_copy_rubric(s, student_tok, created_reviews):
    n = _find_note_for_review(_get_notes(s, student_tok), created_reviews["rubric"]["id"])
    assert "rubric" in n["message"].lower()


def test_notification_copy_status(s, student_tok, created_reviews):
    n = _find_note_for_review(_get_notes(s, student_tok), created_reviews["status"]["id"])
    msg = n["message"]
    assert "approved" in msg
    assert "status" in msg.lower() or "set" in msg.lower()
    assert "Neon Heart" in msg


# ---------------- 3. GET /notifications ordering + shape ----------------
def test_get_notifications_sorted_desc(s, student_tok, created_reviews):
    notes = _get_notes(s, student_tok)
    created_ats = [n["created_at"] for n in notes]
    assert created_ats == sorted(created_ats, reverse=True), "notifications not sorted desc by created_at"


def test_get_notifications_has_deep_links(s, student_tok, created_reviews):
    notes = _get_notes(s, student_tok)
    review_notes = [n for n in notes if n.get("type") == "review"]
    assert len(review_notes) >= 5
    for n in review_notes[:5]:
        assert n.get("deep_link", "").startswith("/reviews?project=")
        assert n.get("review_id")
        assert n.get("review_kind")
        assert n.get("author_name")


# ---------------- 4. Mark-as-read (owner only) ----------------
def test_mark_read_owner(s, student_tok, created_reviews):
    review = created_reviews["written"]
    notes = _get_notes(s, student_tok)
    note = _find_note_for_review(notes, review["id"])
    assert note["read"] is False
    r = s.post(f"{API}/notifications/{note['id']}/read", headers=_hdr(student_tok), timeout=15)
    assert r.status_code == 200
    assert r.json().get("ok") is True
    # verify
    notes2 = _get_notes(s, student_tok)
    note2 = next(n for n in notes2 if n["id"] == note["id"])
    assert note2["read"] is True


def test_mark_read_cross_owner_is_noop(s, student_tok, attacker_tok, created_reviews):
    """Attacker attempts to mark Aria's notification read — must not affect Aria's row."""
    review = created_reviews["time_coded"]
    aria_note = _find_note_for_review(_get_notes(s, student_tok), review["id"])
    assert aria_note["read"] is False
    r = s.post(
        f"{API}/notifications/{aria_note['id']}/read",
        headers=_hdr(attacker_tok),
        timeout=15,
    )
    # Endpoint returns {ok:true} regardless (idempotent no-op scoped by user_id),
    # so we assert the notification is still unread from Aria's perspective.
    assert r.status_code == 200
    aria_note2 = _find_note_for_review(_get_notes(s, student_tok), review["id"])
    assert aria_note2["read"] is False, "attacker managed to flip Aria's notification!"


# ---------------- 5. Mark-all-read ----------------
def test_mark_all_read(s, student_tok, created_reviews):
    # ensure at least one unread exists first (time_coded / coverage / rubric / status)
    notes = _get_notes(s, student_tok)
    unread = [n for n in notes if not n["read"]]
    assert len(unread) >= 1
    r = s.post(f"{API}/notifications/read-all", headers=_hdr(student_tok), timeout=15)
    assert r.status_code == 200
    body = r.json()
    assert body.get("ok") is True
    assert body.get("updated", 0) >= 1
    # verify all read now
    notes2 = _get_notes(s, student_tok)
    assert all(n["read"] for n in notes2), "some notifications still unread after read-all"


def test_mark_all_read_does_not_touch_others(s, student_tok, faculty_tok, attacker_tok):
    """Attacker calling read-all must not affect student's notifications, and vice versa.

    Create a fresh unread notification for student by posting a new review,
    then have the attacker call read-all — student's note must still be unread.
    """
    fresh = _post_review(s, faculty_tok, {"kind": "written", "message": "TEST isolation"})
    student_notes = _get_notes(s, student_tok)
    n = _find_note_for_review(student_notes, fresh["id"])
    assert n and n["read"] is False

    r = s.post(f"{API}/notifications/read-all", headers=_hdr(attacker_tok), timeout=15)
    assert r.status_code == 200
    # attacker had none → updated should be 0
    assert r.json().get("updated", 0) == 0

    student_notes2 = _get_notes(s, student_tok)
    n2 = _find_note_for_review(student_notes2, fresh["id"])
    assert n2["read"] is False, "attacker's read-all leaked to student!"


# ---------------- 6. Cross-owner GET does not leak ----------------
def test_cross_owner_get_notifications_isolated(s, attacker_tok, student_tok):
    attacker_notes = _get_notes(s, attacker_tok)
    student_notes = _get_notes(s, student_tok)
    student_ids = {n["id"] for n in student_notes}
    for an in attacker_notes:
        assert an["id"] not in student_ids, "attacker sees student's notification!"
        # Attacker's list should contain no notes for PROJECT (Aria's)
        assert an.get("project_id") != PROJECT or an.get("user_id") != "demo-student-001"


# ---------------- 7. IMMUTABLE HISTORY guarantee ----------------
def test_seeded_reviews_untouched_after_notifications(s, student_tok, created_reviews):
    """The 5 rev-nh-* seeded reviews must still exist with superseded_by=null."""
    reviews = _list_reviews(s, student_tok)
    by_id = {r["id"]: r for r in reviews}
    for sid in SEEDED_REVIEW_IDS:
        assert sid in by_id, f"seeded review {sid} was deleted!"
        # rev-nh-4 may become superseded by the rubric supersede test below,
        # so only check the ones we don't intentionally supersede here.
        if sid != "rev-nh-4":
            assert by_id[sid].get("superseded_by") in (None, ""), (
                f"seeded review {sid} unexpectedly superseded"
            )


def test_supersede_preserves_old_row(s, faculty_tok, student_tok):
    """POST a new rubric with supersedes=rev-nh-4 — old row must still exist
    with superseded_by set to the new id (never deleted)."""
    new_rubric = _post_review(
        s,
        faculty_tok,
        {
            "kind": "rubric",
            "message": "TEST supersede",
            "supersedes": "rev-nh-4",
            "rubric_scores": {c: 5 for c in ["story", "craft", "originality", "collaboration", "reflection"]},
        },
    )
    reviews = _list_reviews(s, student_tok)
    by_id = {r["id"]: r for r in reviews}
    assert "rev-nh-4" in by_id, "old rev-nh-4 row was deleted after supersede!"
    assert by_id["rev-nh-4"]["superseded_by"] == new_rubric["id"], (
        f"rev-nh-4.superseded_by should be {new_rubric['id']}, got {by_id['rev-nh-4'].get('superseded_by')}"
    )
    # New row exists and is not itself superseded
    assert new_rubric["id"] in by_id
    assert by_id[new_rubric["id"]].get("superseded_by") in (None, "")


def test_review_row_not_mutated_by_notification(s, faculty_tok, student_tok):
    """Sanity: message/created_at/kind of a fresh review are identical before
    and after the notification insertion side-effect."""
    created = _post_review(s, faculty_tok, {"kind": "written", "message": "TEST immutability check"})
    reviews = _list_reviews(s, student_tok)
    match = next((r for r in reviews if r["id"] == created["id"]), None)
    assert match is not None
    assert match["kind"] == created["kind"]
    assert match["message"] == created["message"]
    assert match["created_at"] == created["created_at"]
    assert match.get("superseded_by") in (None, "")


# ---------------- 8. Iteration-3 append-only regression ----------------
def test_reviews_endpoint_still_returns_seed_plus_new(s, student_tok, baseline):
    reviews = _list_reviews(s, student_tok)
    assert len(reviews) >= len(baseline["reviews"])
    # author populated (iteration-3) — join returns author.name
    with_author = [r for r in reviews if r.get("author") and r["author"].get("name")]
    assert len(with_author) >= 5
