"""VIEARTA Iteration 5 tests: Media Library + Circle Chat."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")

STUDENT = ("jaylen@viearta.demo", "demo123")
ADMIN = ("admin@viearta.demo", "admin123")


def _login(email, pw):
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": pw})
    assert r.status_code == 200, f"login failed for {email}: {r.status_code} {r.text}"
    return r.json()["token"], r.json()["user"]


@pytest.fixture(scope="module")
def student():
    t, u = _login(*STUDENT)
    return {"token": t, "user": u, "h": {"Authorization": f"Bearer {t}"}}


@pytest.fixture(scope="module")
def admin():
    t, u = _login(*ADMIN)
    return {"token": t, "user": u, "h": {"Authorization": f"Bearer {t}"}}


@pytest.fixture(scope="module")
def clean_media(admin):
    """Delete any TEST_ items after tests."""
    created = []
    yield created
    for mid in created:
        requests.delete(f"{BASE_URL}/api/media/{mid}", headers=admin["h"])


# ---------------- Auth guards ----------------
def test_media_requires_auth():
    for ep in ["/api/media", "/api/media/workshops", "/api/media/for-lesson/x",
               "/api/media/for-movement/x", "/api/media/for-circle/x"]:
        r = requests.get(f"{BASE_URL}{ep}")
        assert r.status_code == 401, f"{ep} expected 401, got {r.status_code}"


def test_media_post_requires_admin(student):
    r = requests.post(f"{BASE_URL}/api/media",
                      json={"title": "TEST_x", "url": "https://youtube.com/watch?v=abc"},
                      headers=student["h"])
    assert r.status_code == 403


# ---------------- Source detection ----------------
@pytest.mark.parametrize("url,expected", [
    ("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "youtube"),
    ("https://youtu.be/abc", "youtube"),
    ("https://vimeo.com/12345", "vimeo"),
    ("https://cdn.example.com/clip.mp4", "direct_video"),
    ("https://cdn.example.com/song.mp3", "direct_audio"),
])
def test_media_source_detection(admin, clean_media, url, expected):
    payload = {"title": f"TEST_{expected}", "url": url,
               "media_type": "audio" if expected == "direct_audio" else "video",
               "category": "general"}
    r = requests.post(f"{BASE_URL}/api/media", json=payload, headers=admin["h"])
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["source"] == expected
    assert d["url"] == url
    assert "id" in d
    clean_media.append(d["id"])


# ---------------- CRUD + filters ----------------
def test_media_crud_and_filters(admin, student, clean_media):
    # Initial list
    r = requests.get(f"{BASE_URL}/api/media", headers=student["h"])
    assert r.status_code == 200
    assert "items" in r.json()

    # Create movement-linked YouTube
    tag_id = f"tst_{uuid.uuid4().hex[:6]}"
    payload = {
        "title": "TEST_warmup_movement", "url": "https://youtube.com/watch?v=warmupX",
        "media_type": "video", "category": "movement",
        "tags": [tag_id, "warmup"],
        "linked_movement_id": "mv_vocal",
        "linked_lesson_id": "ls_vocal_hydro",
        "description": "TEST warmup vocal video",
    }
    r = requests.post(f"{BASE_URL}/api/media", json=payload, headers=admin["h"])
    assert r.status_code == 200
    mid = r.json()["id"]
    clean_media.append(mid)
    assert r.json()["source"] == "youtube"

    # Filter by category
    r = requests.get(f"{BASE_URL}/api/media?category=movement", headers=student["h"])
    assert r.status_code == 200
    assert any(x["id"] == mid for x in r.json()["items"])

    # Filter by tag
    r = requests.get(f"{BASE_URL}/api/media?tag={tag_id}", headers=student["h"])
    assert r.status_code == 200
    ids = [x["id"] for x in r.json()["items"]]
    assert mid in ids and all(tag_id in x["tags"] for x in r.json()["items"])

    # Filter by q
    r = requests.get(f"{BASE_URL}/api/media?q=warmup", headers=student["h"])
    assert r.status_code == 200
    assert any(x["id"] == mid for x in r.json()["items"])

    # for-lesson
    r = requests.get(f"{BASE_URL}/api/media/for-lesson/ls_vocal_hydro", headers=student["h"])
    assert r.status_code == 200
    assert all(x.get("linked_lesson_id") == "ls_vocal_hydro" for x in r.json()["items"])
    assert any(x["id"] == mid for x in r.json()["items"])

    # for-movement
    r = requests.get(f"{BASE_URL}/api/media/for-movement/mv_vocal", headers=student["h"])
    assert r.status_code == 200
    assert all(x.get("linked_movement_id") == "mv_vocal" for x in r.json()["items"])
    assert any(x["id"] == mid for x in r.json()["items"])

    # PUT as student -> 403
    r = requests.put(f"{BASE_URL}/api/media/{mid}",
                     json={**payload, "title": "TEST_changed"}, headers=student["h"])
    assert r.status_code == 403

    # PUT as admin
    r = requests.put(f"{BASE_URL}/api/media/{mid}",
                     json={**payload, "title": "TEST_changed", "url": "https://vimeo.com/999"},
                     headers=admin["h"])
    assert r.status_code == 200
    assert r.json()["title"] == "TEST_changed"
    assert r.json()["source"] == "vimeo"

    # DELETE as student -> 403
    r = requests.delete(f"{BASE_URL}/api/media/{mid}", headers=student["h"])
    assert r.status_code == 403

    # DELETE as admin
    r = requests.delete(f"{BASE_URL}/api/media/{mid}", headers=admin["h"])
    assert r.status_code == 200
    clean_media.remove(mid)


def test_media_for_circle_and_workshops(admin, student, clean_media):
    # Find a real circle id
    r = requests.get(f"{BASE_URL}/api/circles", headers=student["h"])
    assert r.status_code == 200
    circles = r.json()["items"]
    assert circles, "expected seeded circles"
    circle_id = circles[0]["id"]

    # Linked via linked_circle_id, category=circle
    p1 = {"title": "TEST_circle_direct", "url": "https://youtu.be/aaa",
          "category": "circle", "linked_circle_id": circle_id}
    r = requests.post(f"{BASE_URL}/api/media", json=p1, headers=admin["h"])
    assert r.status_code == 200
    id1 = r.json()["id"]
    clean_media.append(id1)

    # Linked via tag with category=workshop
    p2 = {"title": "TEST_circle_workshop", "url": "https://youtu.be/bbb",
          "category": "workshop", "tags": [circle_id]}
    r = requests.post(f"{BASE_URL}/api/media", json=p2, headers=admin["h"])
    assert r.status_code == 200
    id2 = r.json()["id"]
    clean_media.append(id2)

    r = requests.get(f"{BASE_URL}/api/media/for-circle/{circle_id}", headers=student["h"])
    assert r.status_code == 200
    ids = [x["id"] for x in r.json()["items"]]
    assert id1 in ids and id2 in ids

    r = requests.get(f"{BASE_URL}/api/media/workshops", headers=student["h"])
    assert r.status_code == 200
    ids = [x["id"] for x in r.json()["items"]]
    assert id2 in ids
    for x in r.json()["items"]:
        assert x["category"] in ("workshop", "circle")


# ---------------- Circle detail & chat ----------------
@pytest.fixture(scope="module")
def circle_ids(student):
    r = requests.get(f"{BASE_URL}/api/circles", headers=student["h"])
    assert r.status_code == 200
    items = r.json()["items"]
    assert items, "need seeded circles"
    return [c["id"] for c in items]


def test_circle_detail_shape(student, circle_ids):
    cid = circle_ids[0]
    r = requests.get(f"{BASE_URL}/api/circles/{cid}", headers=student["h"])
    assert r.status_code == 200
    d = r.json()
    for k in ["id", "rsvp_count", "spots_left", "by_discipline", "attendees", "my_rsvp"]:
        assert k in d


def test_chat_requires_rsvp_and_flow(student, admin, circle_ids):
    # Use a circle that student hopefully hasn't RSVPed to. Try each.
    non_rsvp_cid = None
    for cid in circle_ids:
        r = requests.get(f"{BASE_URL}/api/circles/{cid}", headers=student["h"])
        if r.status_code == 200 and not r.json().get("my_rsvp"):
            non_rsvp_cid = cid
            break
    # If none, cancel RSVP on one via toggle
    if non_rsvp_cid is None:
        cid = circle_ids[0]
        r = requests.post(f"{BASE_URL}/api/circles/rsvp",
                          json={"circle_id": cid}, headers=student["h"])
        # After toggle, verify
        r = requests.get(f"{BASE_URL}/api/circles/{cid}", headers=student["h"])
        if not r.json().get("my_rsvp"):
            non_rsvp_cid = cid

    assert non_rsvp_cid, "could not find a non-RSVPed circle"

    # Non-RSVPed student cannot list messages
    r = requests.get(f"{BASE_URL}/api/circles/{non_rsvp_cid}/messages", headers=student["h"])
    assert r.status_code == 403

    # Non-RSVPed student cannot post
    r = requests.post(f"{BASE_URL}/api/circles/{non_rsvp_cid}/messages",
                      json={"body": "TEST_hi", "kind": "pre"}, headers=student["h"])
    assert r.status_code == 403

    # 401 unauth
    r = requests.get(f"{BASE_URL}/api/circles/{non_rsvp_cid}/messages")
    assert r.status_code == 401

    # RSVP and try again
    r = requests.post(f"{BASE_URL}/api/circles/rsvp",
                      json={"circle_id": non_rsvp_cid}, headers=student["h"])
    assert r.status_code == 200

    # Detail should now show attendees list (student is RSVPed)
    r = requests.get(f"{BASE_URL}/api/circles/{non_rsvp_cid}", headers=student["h"])
    assert r.status_code == 200
    detail = r.json()
    assert detail["my_rsvp"] is True
    assert isinstance(detail["attendees"], list)
    assert len(detail["attendees"]) >= 1

    # List messages ok
    r = requests.get(f"{BASE_URL}/api/circles/{non_rsvp_cid}/messages", headers=student["h"])
    assert r.status_code == 200
    assert "items" in r.json()

    # Post with each kind
    posted_ids = {}
    for kind in ["pre", "general", "post"]:
        r = requests.post(f"{BASE_URL}/api/circles/{non_rsvp_cid}/messages",
                          json={"body": f"TEST_{kind}_msg", "kind": kind}, headers=student["h"])
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["kind"] == kind
        assert d["body"] == f"TEST_{kind}_msg"
        assert "id" in d and "user_id" in d
        assert "_id" not in d
        posted_ids[kind] = d["id"]

    # Admin posts a message
    r = requests.post(f"{BASE_URL}/api/circles/{non_rsvp_cid}/messages",
                      json={"body": "TEST_admin_msg", "kind": "general"}, headers=admin["h"])
    assert r.status_code == 200
    admin_msg_id = r.json()["id"]

    # Student cannot delete admin's message
    r = requests.delete(f"{BASE_URL}/api/circles/messages/{admin_msg_id}", headers=student["h"])
    assert r.status_code == 403

    # Student deletes own message
    r = requests.delete(f"{BASE_URL}/api/circles/messages/{posted_ids['pre']}", headers=student["h"])
    assert r.status_code == 200

    # Admin can delete any (student's remaining msg)
    r = requests.delete(f"{BASE_URL}/api/circles/messages/{posted_ids['general']}", headers=admin["h"])
    assert r.status_code == 200

    # Cleanup remaining
    for mid in [posted_ids['post'], admin_msg_id]:
        requests.delete(f"{BASE_URL}/api/circles/messages/{mid}", headers=admin["h"])


def test_circle_detail_hides_attendees_for_non_rsvp(student, admin, circle_ids):
    # Create a fresh scenario: use admin viewing a circle where admin has not RSVPed?
    # Admin should always see attendees per code. Test student on non-RSVPed instead.
    # First find/create non-RSVPed for student.
    non_rsvp_cid = None
    for cid in circle_ids:
        r = requests.get(f"{BASE_URL}/api/circles/{cid}", headers=student["h"])
        if r.status_code == 200 and not r.json().get("my_rsvp"):
            non_rsvp_cid = cid
            break
    if non_rsvp_cid is None:
        pytest.skip("student is RSVPed to all circles")
    r = requests.get(f"{BASE_URL}/api/circles/{non_rsvp_cid}", headers=student["h"])
    assert r.status_code == 200
    assert r.json()["attendees"] == []


def test_circle_messages_delete_404(admin):
    r = requests.delete(f"{BASE_URL}/api/circles/messages/nonexistent_xyz", headers=admin["h"])
    assert r.status_code == 404
