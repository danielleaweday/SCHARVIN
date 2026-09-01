"""Iteration 7 tests: Media Playlists, Circle Join URL, ANCR platform status."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Try reading from frontend/.env
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                    break
    except Exception:
        pass

API = f"{BASE_URL}/api"


def _login(email, password):
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": password}, timeout=15)
    assert r.status_code == 200, f"login {email} failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="module")
def admin_token():
    return _login("admin@viearta.demo", "admin123")


@pytest.fixture(scope="module")
def student_token():
    return _login("jaylen@viearta.demo", "demo123")


def _h(tok):
    return {"Authorization": f"Bearer {tok}", "Content-Type": "application/json"}


# ---------------- Playlists ----------------
class TestPlaylists:
    created_ids = []

    def test_list_playlists_initial(self, student_token):
        r = requests.get(f"{API}/media/playlists", headers=_h(student_token))
        assert r.status_code == 200
        assert "items" in r.json()

    def test_student_create_forbidden(self, student_token):
        r = requests.post(f"{API}/media/playlists", headers=_h(student_token),
                          json={"title": "TEST_student_pl", "category": "movement"})
        assert r.status_code == 403

    def test_admin_create(self, admin_token):
        r = requests.post(f"{API}/media/playlists", headers=_h(admin_token),
                          json={"title": "TEST_pl_1", "category": "movement",
                                "description": "test", "media_ids": []})
        assert r.status_code == 200
        data = r.json()
        assert data["title"] == "TEST_pl_1"
        assert data["category"] == "movement"
        assert data["media_count"] == 0
        assert data["media"] == []
        TestPlaylists.created_ids.append(data["id"])

    def test_get_playlist_detail(self, student_token):
        pid = TestPlaylists.created_ids[0]
        r = requests.get(f"{API}/media/playlists/{pid}", headers=_h(student_token))
        assert r.status_code == 200
        d = r.json()
        assert d["id"] == pid
        assert isinstance(d["media"], list)
        assert "media_count" in d

    def test_filter_by_category(self, admin_token, student_token):
        # create one in different category
        r = requests.post(f"{API}/media/playlists", headers=_h(admin_token),
                          json={"title": "TEST_pl_lesson", "category": "lesson"})
        assert r.status_code == 200
        TestPlaylists.created_ids.append(r.json()["id"])
        r = requests.get(f"{API}/media/playlists?category=movement", headers=_h(student_token))
        assert r.status_code == 200
        cats = {p["category"] for p in r.json()["items"]}
        assert cats == {"movement"} or "lesson" not in cats

    def test_student_update_forbidden(self, student_token):
        pid = TestPlaylists.created_ids[0]
        r = requests.put(f"{API}/media/playlists/{pid}", headers=_h(student_token),
                         json={"title": "hack", "category": "movement"})
        assert r.status_code == 403

    def test_admin_update(self, admin_token):
        pid = TestPlaylists.created_ids[0]
        r = requests.put(f"{API}/media/playlists/{pid}", headers=_h(admin_token),
                         json={"title": "TEST_pl_1_upd", "category": "movement",
                               "description": "updated"})
        assert r.status_code == 200
        assert r.json()["title"] == "TEST_pl_1_upd"

    def test_add_media_idempotent(self, admin_token):
        # need to create a media item first
        m = requests.post(f"{API}/media", headers=_h(admin_token),
                          json={"title": "TEST_pl_media", "url": "https://youtu.be/dQw4w9WgXcQ",
                                "media_type": "video", "category": "movement"})
        assert m.status_code == 200
        media_id = m.json()["id"]
        pid = TestPlaylists.created_ids[0]
        r1 = requests.post(f"{API}/media/playlists/{pid}/add", headers=_h(admin_token),
                           json={"media_id": media_id})
        assert r1.status_code == 200
        assert r1.json()["media_count"] == 1
        # add again -> idempotent
        r2 = requests.post(f"{API}/media/playlists/{pid}/add", headers=_h(admin_token),
                           json={"media_id": media_id})
        assert r2.status_code == 200
        assert r2.json()["media_count"] == 1
        # remove
        r3 = requests.post(f"{API}/media/playlists/{pid}/remove", headers=_h(admin_token),
                           json={"media_id": media_id})
        assert r3.status_code == 200
        assert r3.json()["media_count"] == 0
        # cleanup media
        requests.delete(f"{API}/media/{media_id}", headers=_h(admin_token))

    def test_student_delete_forbidden(self, student_token):
        pid = TestPlaylists.created_ids[0]
        r = requests.delete(f"{API}/media/playlists/{pid}", headers=_h(student_token))
        assert r.status_code == 403

    def test_zz_admin_delete_cleanup(self, admin_token):
        for pid in TestPlaylists.created_ids:
            r = requests.delete(f"{API}/media/playlists/{pid}", headers=_h(admin_token))
            assert r.status_code == 200
        # verify 404
        r = requests.get(f"{API}/media/playlists/{TestPlaylists.created_ids[0]}",
                         headers=_h(admin_token))
        assert r.status_code == 404

    def test_requires_auth(self):
        r = requests.get(f"{API}/media/playlists")
        assert r.status_code in (401, 403)


# ---------------- Circle join URL ----------------
class TestCircleJoinUrl:
    def test_set_and_clear(self, admin_token, student_token):
        circles = requests.get(f"{API}/circles", headers=_h(admin_token)).json()["items"]
        assert circles
        cid = circles[0]["id"]
        # student forbidden
        r = requests.put(f"{API}/circles/{cid}/join-url", headers=_h(student_token),
                         json={"join_url": "https://ancrsync.example/room1"})
        assert r.status_code == 403
        # admin sets
        r = requests.put(f"{API}/circles/{cid}/join-url", headers=_h(admin_token),
                         json={"join_url": "https://ancrsync.example/room1"})
        assert r.status_code == 200
        assert r.json().get("join_url") == "https://ancrsync.example/room1"
        # GET reflects
        detail = requests.get(f"{API}/circles/{cid}", headers=_h(student_token)).json()
        assert detail.get("join_url") == "https://ancrsync.example/room1"
        # clear
        r = requests.put(f"{API}/circles/{cid}/join-url", headers=_h(admin_token),
                         json={"join_url": None})
        assert r.status_code == 200
        assert r.json().get("join_url") is None


# ---------------- ANCR platform status ----------------
class TestAncrStatus:
    def test_shape(self, student_token):
        r = requests.get(f"{API}/ancr/status", headers=_h(student_token))
        assert r.status_code == 200
        d = r.json()
        for key in ("sso", "notifications", "video_rooms", "media_storage"):
            assert key in d, f"missing {key}"
            assert "provider" in d[key]
            assert "enabled" in d[key]
            assert "description" in d[key]


# ---------------- Regression light ----------------
class TestRegression:
    def test_pathways(self, student_token):
        r = requests.get(f"{API}/learning/pathways", headers=_h(student_token))
        assert r.status_code == 200
    def test_circles_list(self, student_token):
        r = requests.get(f"{API}/circles", headers=_h(student_token))
        assert r.status_code == 200
    def test_media_list(self, student_token):
        r = requests.get(f"{API}/media", headers=_h(student_token))
        assert r.status_code == 200
    def test_support(self, student_token):
        r = requests.get(f"{API}/support/resources", headers=_h(student_token))
        assert r.status_code == 200
    def test_consent(self, student_token):
        r = requests.get(f"{API}/consent", headers=_h(student_token))
        assert r.status_code == 200
