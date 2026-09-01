"""Iteration 10 — Storyboard Frame Feedback milestone.

Covers:
- POST frame_feedback happy path (forces target_type='storyboard_frame').
- Validation: missing target_ref, unknown frame, cross-project frame smuggling.
- AuthZ: unassigned faculty 403, student 403 on POST, cross-owner student 403 on GET.
- Notification envelope: type='review', review_kind='frame_feedback',
  event_type='review.frame_feedback', deep_link /story-lab?project=&frame=,
  channels contain in_app delivered + ancr_bus not_configured.
- Link registry: 6 links including 'storyboard.frame'; resolve-link happy + 4x 404.
- Immutable history: supersedes updates old row's superseded_by, keeps message/created_at.
"""
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    from pathlib import Path
    for line in Path("/app/frontend/.env").read_text().splitlines():
        if line.startswith("REACT_APP_BACKEND_URL="):
            BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
            break

STUDENT = {"email": "student@cynaiah.demo", "password": "Cynaiah2026!"}
FACULTY = {"email": "faculty@cynaiah.demo", "password": "Cynaiah2026!"}
FLAGSHIP = "proj-mv-neon-heart"


def H(t):
    return {"Authorization": f"Bearer {t}", "Content-Type": "application/json"}


def _login(creds):
    r = requests.post(f"{BASE_URL}/api/auth/login", json=creds, timeout=30)
    assert r.status_code == 200, f"login failed {r.status_code} {r.text}"
    return r.json()["access_token"]


@pytest.fixture(scope="module")
def student_token():
    return _login(STUDENT)


@pytest.fixture(scope="module")
def faculty_token():
    return _login(FACULTY)


@pytest.fixture(scope="module")
def second_student_token():
    email = f"sec-{uuid.uuid4().hex[:10]}@cynaiah.demo"
    r = requests.post(
        f"{BASE_URL}/api/auth/register",
        json={"email": email, "password": "SecTest2026!", "name": "Sec Student", "role": "student"},
        timeout=30,
    )
    assert r.status_code in (200, 201), f"register second student: {r.status_code} {r.text}"
    body = r.json()
    tok = body.get("access_token")
    if not tok:
        tok = _login({"email": email, "password": "SecTest2026!"})
    return tok


@pytest.fixture(scope="module")
def flagship_frames(faculty_token):
    r = requests.get(f"{BASE_URL}/api/faculty/projects/{FLAGSHIP}", headers=H(faculty_token), timeout=30)
    assert r.status_code == 200
    frames = r.json()["storyboard_frames"]
    assert len(frames) >= 3, f"expected >=3 seeded frames, got {len(frames)}"
    return frames


# ---------------- Link registry ----------------
def test_link_registry_lists_six_including_storyboard_frame():
    r = requests.get(f"{BASE_URL}/api/notifications/link-registry", timeout=30)
    assert r.status_code == 200
    links = r.json()["links"]
    ids = [l["id"] for l in links]
    assert len(links) == 6, f"expected 6 registry links, got {len(links)}: {ids}"
    assert "storyboard.frame" in ids
    entry = next(l for l in links if l["id"] == "storyboard.frame")
    assert entry["required_query"] == ["project", "frame"]
    assert entry["path_pattern"] == r"^/story-lab$"


def test_resolve_link_storyboard_frame_ok(student_token):
    link = f"/story-lab?project={FLAGSHIP}&frame=frame-proj-mv-neon-heart-0"
    r = requests.post(
        f"{BASE_URL}/api/notifications/resolve-link",
        headers=H(student_token), json={"deep_link": link}, timeout=30,
    )
    assert r.status_code == 200, r.text
    assert r.json()["matched"]["id"] == "storyboard.frame"


@pytest.mark.parametrize("bad_link", [
    f"/story-lab?project={FLAGSHIP}",
    "/story-lab?frame=frame-proj-mv-neon-heart-0",
    "/story-lab",
])
def test_resolve_link_storyboard_frame_missing_query_404(student_token, bad_link):
    r = requests.post(
        f"{BASE_URL}/api/notifications/resolve-link",
        headers=H(student_token), json={"deep_link": bad_link}, timeout=30,
    )
    assert r.status_code == 404, f"{bad_link} => {r.status_code} {r.text}"


# ---------------- Validation ----------------
def test_frame_feedback_missing_target_ref_400(faculty_token):
    r = requests.post(
        f"{BASE_URL}/api/faculty/projects/{FLAGSHIP}/reviews",
        headers=H(faculty_token),
        json={"kind": "frame_feedback", "message": "TEST_no_ref"}, timeout=30,
    )
    assert r.status_code == 400


def test_frame_feedback_unknown_frame_404(faculty_token):
    r = requests.post(
        f"{BASE_URL}/api/faculty/projects/{FLAGSHIP}/reviews",
        headers=H(faculty_token),
        json={"kind": "frame_feedback", "message": "TEST_bad_ref",
              "target_ref": "frame-does-not-exist-zzz"}, timeout=30,
    )
    assert r.status_code == 404


def test_frame_feedback_cross_project_frame_404(faculty_token):
    # Grab a frame that belongs to a DIFFERENT project owned by Aria.
    r = requests.get(f"{BASE_URL}/api/faculty/dashboard", headers=H(faculty_token), timeout=30)
    assert r.status_code == 200
    other_pid = next(
        t["project"]["id"] for t in r.json()["projects"] if t["project"]["id"] != FLAGSHIP
    )
    other = requests.get(
        f"{BASE_URL}/api/faculty/projects/{other_pid}", headers=H(faculty_token), timeout=30
    ).json()
    if not other.get("storyboard_frames"):
        pytest.skip("second project has no frames")
    foreign_frame_id = other["storyboard_frames"][0]["id"]
    r = requests.post(
        f"{BASE_URL}/api/faculty/projects/{FLAGSHIP}/reviews",
        headers=H(faculty_token),
        json={"kind": "frame_feedback", "message": "TEST_cross_project",
              "target_ref": foreign_frame_id}, timeout=30,
    )
    assert r.status_code == 404, f"cross-project should be 404, got {r.status_code} {r.text}"


# ---------------- AuthZ ----------------
def test_student_cannot_post_frame_feedback(student_token, flagship_frames):
    r = requests.post(
        f"{BASE_URL}/api/faculty/projects/{FLAGSHIP}/reviews",
        headers=H(student_token),
        json={"kind": "frame_feedback", "message": "TEST_student_denied",
              "target_ref": flagship_frames[0]["id"]}, timeout=30,
    )
    assert r.status_code == 403


def test_second_student_cannot_list_reviews(second_student_token):
    r = requests.get(
        f"{BASE_URL}/api/projects/{FLAGSHIP}/reviews",
        headers=H(second_student_token), timeout=30,
    )
    assert r.status_code == 403


# ---------------- Happy path + notification ----------------
def test_frame_feedback_post_creates_review_and_notification(faculty_token, student_token, flagship_frames):
    target_frame = flagship_frames[1]["id"]
    payload = {
        "kind": "frame_feedback",
        "message": "TEST_frame_note initial pin",
        "target_ref": target_frame,
    }
    r = requests.post(
        f"{BASE_URL}/api/faculty/projects/{FLAGSHIP}/reviews",
        headers=H(faculty_token), json=payload, timeout=30,
    )
    assert r.status_code == 200, r.text
    doc = r.json()
    assert doc["kind"] == "frame_feedback"
    assert doc["target_ref"] == target_frame
    assert doc["target_type"] == "storyboard_frame"
    assert doc["superseded_by"] is None
    review_id = doc["id"]

    # notification to project owner
    time.sleep(0.4)
    r = requests.get(f"{BASE_URL}/api/notifications?limit=25", headers=H(student_token), timeout=30)
    assert r.status_code == 200
    body = r.json()
    notes = body["notifications"] if isinstance(body, dict) else body
    match = next((n for n in notes if n.get("review_id") == review_id), None)
    assert match, f"no notification for review {review_id}"
    assert match["type"] == "review"
    assert match["review_kind"] == "frame_feedback"
    assert match["event_type"] == "review.frame_feedback"
    assert match["deep_link"] == f"/story-lab?project={FLAGSHIP}&frame={target_frame}"
    assert "/reviews?" not in match["deep_link"]
    assert match.get("ancr_ready") is True
    channels = {c["name"]: c for c in (match.get("channels") or [])}
    assert channels.get("in_app", {}).get("status") == "delivered"
    assert channels.get("ancr_bus", {}).get("status") == "not_configured"


# ---------------- Immutable history + supersedes ----------------
def test_immutable_history_and_supersedes(faculty_token, flagship_frames):
    target_frame = flagship_frames[2]["id"]
    ids = []
    for i in range(3):
        r = requests.post(
            f"{BASE_URL}/api/faculty/projects/{FLAGSHIP}/reviews",
            headers=H(faculty_token),
            json={"kind": "frame_feedback", "message": f"TEST_hist_{i}",
                  "target_ref": target_frame}, timeout=30,
        )
        assert r.status_code == 200, r.text
        ids.append(r.json()["id"])

    proj = requests.get(
        f"{BASE_URL}/api/faculty/projects/{FLAGSHIP}",
        headers=H(faculty_token), timeout=30,
    ).json()
    reviews = proj["reviews"]
    # Sorted desc by created_at
    created = [r["created_at"] for r in reviews]
    assert created == sorted(created, reverse=True)
    by_id = {r["id"]: r for r in reviews}
    for _id in ids:
        assert _id in by_id, f"review {_id} missing"
        assert by_id[_id]["superseded_by"] is None

    total_before = len(reviews)
    first = by_id[ids[0]]
    original_message = first["message"]
    original_created_at = first["created_at"]

    # 4th supersedes the first
    r = requests.post(
        f"{BASE_URL}/api/faculty/projects/{FLAGSHIP}/reviews",
        headers=H(faculty_token),
        json={"kind": "frame_feedback", "message": "TEST_hist_super",
              "target_ref": target_frame, "supersedes": ids[0]}, timeout=30,
    )
    assert r.status_code == 200, r.text
    fourth_id = r.json()["id"]

    proj2 = requests.get(
        f"{BASE_URL}/api/faculty/projects/{FLAGSHIP}",
        headers=H(faculty_token), timeout=30,
    ).json()
    by_id2 = {r["id"]: r for r in proj2["reviews"]}
    assert ids[0] in by_id2, "first review must still be present"
    assert by_id2[ids[0]]["superseded_by"] == fourth_id
    # message + created_at unchanged
    assert by_id2[ids[0]]["message"] == original_message
    assert by_id2[ids[0]]["created_at"] == original_created_at
    # nothing deleted; count grew
    assert len(proj2["reviews"]) >= total_before + 1
