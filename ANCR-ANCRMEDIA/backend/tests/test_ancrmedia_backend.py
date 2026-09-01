"""ANCRMEDIA backend API tests."""
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://global-studio-4.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


# ---------- Fixtures ----------
@pytest.fixture(scope="session")
def s():
    """Anonymous session."""
    return requests.Session()


@pytest.fixture(scope="session")
def admin_session():
    sess = requests.Session()
    r = sess.post(f"{API}/auth/login", json={"email": "admin@ancrmedia.com", "password": "AdminPass2026!"})
    assert r.status_code == 200, r.text
    return sess


@pytest.fixture(scope="session")
def maya_session():
    sess = requests.Session()
    r = sess.post(f"{API}/auth/login", json={"email": "maya@ancrmedia.com", "password": "Creator2026!"})
    assert r.status_code == 200, r.text
    return sess


# ---------- Health ----------
def test_health(s):
    r = s.get(f"{API}/")
    assert r.status_code == 200
    d = r.json()
    assert d.get("service") == "ANCRMEDIA"
    assert "version" in d


# ---------- Auth ----------
def test_register_new_user_and_me(s):
    email = f"TEST_user_{uuid.uuid4().hex[:8]}@ancrmedia.com"
    sess = requests.Session()
    r = sess.post(f"{API}/auth/register", json={
        "email": email, "password": "TestPass2026!", "name": "Test User"
    })
    assert r.status_code in (200, 201), r.text
    data = r.json()
    assert "user" in data or "email" in data
    user = data.get("user", data)
    assert user.get("email") == email.lower()
    # cookies should be set
    assert len(sess.cookies) > 0, "No cookies set after register"
    # /me
    r2 = sess.get(f"{API}/auth/me")
    assert r2.status_code == 200, r2.text
    me = r2.json()
    me_user = me.get("user", me)
    assert me_user.get("email") == email.lower()


def test_login_maya_has_creator_id(s):
    sess = requests.Session()
    r = sess.post(f"{API}/auth/login", json={"email": "maya@ancrmedia.com", "password": "Creator2026!"})
    assert r.status_code == 200, r.text
    d = r.json()
    user = d.get("user", d)
    assert user.get("creator_id"), f"creator_id missing: {user}"


def test_login_admin_role(s):
    sess = requests.Session()
    r = sess.post(f"{API}/auth/login", json={"email": "admin@ancrmedia.com", "password": "AdminPass2026!"})
    assert r.status_code == 200, r.text
    d = r.json()
    user = d.get("user", d)
    assert user.get("role") == "administrator"


def test_login_wrong_password(s):
    r = s.post(f"{API}/auth/login", json={"email": "admin@ancrmedia.com", "password": "WRONG_PW_xyz"})
    assert r.status_code == 401


def test_me_without_cookies_401(s):
    r = requests.get(f"{API}/auth/me")
    assert r.status_code == 401


def test_logout_clears_cookies():
    sess = requests.Session()
    r = sess.post(f"{API}/auth/login", json={"email": "noah@ancrmedia.com", "password": "Creator2026!"})
    assert r.status_code == 200
    r2 = sess.post(f"{API}/auth/logout")
    assert r2.status_code in (200, 204)
    # New session, no cookies
    r3 = requests.get(f"{API}/auth/me")
    assert r3.status_code == 401


# ---------- Home / Discover ----------
def test_home(s):
    r = s.get(f"{API}/home")
    assert r.status_code == 200, r.text
    d = r.json()
    assert d.get("hero_album")
    assert len(d.get("new_releases", [])) >= 10
    assert len(d.get("trending_tracks", [])) >= 10
    for key in ["live_now", "videos", "playlists", "featured_challenge"]:
        assert key in d, f"missing {key}"


def test_discover(s):
    r = s.get(f"{API}/discover")
    assert r.status_code == 200
    d = r.json()
    for key in ["trending_tracks", "trending_videos", "new_releases", "faculty_picks", "institutions"]:
        assert key in d, f"missing {key}"


# ---------- Institutions ----------
def test_institutions_list(s):
    r = s.get(f"{API}/institutions")
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    assert len(items) == 16, f"expected 16, got {len(items)}"
    for it in items:
        assert "creator_count" in it
        assert "release_count" in it


def test_institution_berklee(s):
    r = s.get(f"{API}/institutions/berklee")
    assert r.status_code == 200, r.text
    d = r.json()
    for key in ["institution", "faculty", "students", "newest_releases", "featured_videos", "livestreams"]:
        assert key in d, f"missing {key}"


# ---------- Creators ----------
def test_creators_filters(s):
    r_all = s.get(f"{API}/creators")
    assert r_all.status_code == 200
    all_creators = r_all.json()
    assert len(all_creators) > 0
    total = len(all_creators)

    r_q = s.get(f"{API}/creators", params={"q": "Maya"})
    assert r_q.status_code == 200
    assert 0 < len(r_q.json()) <= total

    r_inst = s.get(f"{API}/creators", params={"institution": "berklee"})
    assert r_inst.status_code == 200
    inst_res = r_inst.json()
    assert 0 < len(inst_res) < total

    # discipline filter
    disc = all_creators[0].get("discipline")
    if disc:
        r_d = s.get(f"{API}/creators", params={"discipline": disc})
        assert r_d.status_code == 200
        assert len(r_d.json()) > 0

    # country filter
    country = all_creators[0].get("country")
    if country:
        r_c = s.get(f"{API}/creators", params={"country": country})
        assert r_c.status_code == 200
        assert len(r_c.json()) > 0


def test_creator_detail(s):
    r_all = s.get(f"{API}/creators").json()
    cid = r_all[0]["id"]
    r = s.get(f"{API}/creators/{cid}")
    assert r.status_code == 200
    d = r.json()
    for key in ["creator", "albums", "videos", "top_tracks"]:
        assert key in d


# ---------- Albums ----------
def test_albums_sort_release_date(s):
    r = s.get(f"{API}/albums")
    assert r.status_code == 200
    items = r.json()
    assert len(items) > 0
    dates = [x.get("release_date") for x in items if x.get("release_date")]
    assert dates == sorted(dates, reverse=True), "not sorted desc by release_date"


def test_albums_sort_streams(s):
    r = s.get(f"{API}/albums", params={"sort": "streams"})
    assert r.status_code == 200
    items = r.json()
    streams = [x.get("streams", 0) for x in items]
    assert streams == sorted(streams, reverse=True), "not sorted desc by streams"


def test_album_detail_album_1(s):
    r = s.get(f"{API}/albums/album-1")
    assert r.status_code == 200, r.text
    d = r.json()
    assert d.get("album")
    assert d.get("artist")
    tracks = d.get("tracks", [])
    assert len(tracks) > 0
    for t in tracks:
        assert t.get("audio_url", "").startswith("https"), f"bad audio_url: {t.get('audio_url')}"


# ---------- Tracks ----------
def test_tracks_have_audio(s):
    r = s.get(f"{API}/tracks")
    assert r.status_code == 200
    items = r.json()
    assert len(items) > 0
    for t in items[:20]:
        assert t.get("audio_url"), "missing audio_url"


# ---------- Videos ----------
def test_videos_and_filter(s):
    r = s.get(f"{API}/videos")
    assert r.status_code == 200
    items = r.json()
    assert len(items) > 0
    for v in items[:5]:
        url = v.get("video_url", "")
        assert "gtv-videos-bucket" in url or url.startswith("https"), f"bad video_url: {url}"

    r2 = s.get(f"{API}/videos", params={"kind": "Masterclass"})
    assert r2.status_code == 200
    filtered = r2.json()
    # if any exist, they should all be masterclass
    if filtered:
        assert len(filtered) <= len(items)


def test_video_detail(s):
    items = s.get(f"{API}/videos").json()
    vid = items[0]["id"]
    r = s.get(f"{API}/videos/{vid}")
    assert r.status_code == 200
    d = r.json()
    assert d.get("video")
    assert "related" in d


# ---------- Livestreams ----------
def test_livestreams(s):
    r = s.get(f"{API}/livestreams")
    assert r.status_code == 200
    items = r.json()
    assert len(items) > 0
    assert any(x.get("is_live_now") for x in items), "no live streams currently live"


# ---------- Playlists ----------
def test_playlists(s):
    r = s.get(f"{API}/playlists")
    assert r.status_code == 200
    items = r.json()
    assert len(items) > 0
    pid = items[0]["id"]
    r2 = s.get(f"{API}/playlists/{pid}")
    assert r2.status_code == 200
    d = r2.json()
    assert "tracks" in d and isinstance(d["tracks"], list)


# ---------- Challenges / Events ----------
def test_challenges(s):
    r = s.get(f"{API}/challenges")
    assert r.status_code == 200
    assert len(r.json()) >= 6


def test_events(s):
    r = s.get(f"{API}/events")
    assert r.status_code == 200
    assert len(r.json()) > 0


# ---------- Charts ----------
@pytest.mark.parametrize("path", [
    "top-songs", "top-videos", "top-schools", "top-producers", "top-artists", "trending"
])
def test_charts(s, path):
    r = s.get(f"{API}/charts/{path}")
    assert r.status_code == 200, f"{path}: {r.text}"
    items = r.json()
    assert isinstance(items, list)
    assert len(items) > 0


# ---------- World ----------
def test_world(s):
    r = s.get(f"{API}/world")
    assert r.status_code == 200
    d = r.json()
    nodes = d.get("nodes", [])
    assert len(nodes) == 16
    assert "countries" in d
    for n in nodes:
        assert n.get("coords") or (n.get("lat") is not None and n.get("lng") is not None)
        assert "creators" in n or "creator_count" in n
        assert "releases" in n or "release_count" in n


# ---------- Genres ----------
def test_genres(s):
    r = s.get(f"{API}/genres")
    assert r.status_code == 200
    assert len(r.json()) > 0
    r2 = s.get(f"{API}/genres/Hip-Hop")
    assert r2.status_code == 200
    d = r2.json()
    assert "tracks" in d and "creators" in d


# ---------- Search ----------
def test_search(s):
    r = s.get(f"{API}/search", params={"q": "berklee"})
    assert r.status_code == 200
    d = r.json()
    for key in ["creators", "albums", "tracks", "videos", "institutions", "playlists"]:
        assert key in d, f"missing {key}"


# ---------- Library ----------
def test_library_no_auth_empty(s):
    r = requests.get(f"{API}/library")
    assert r.status_code == 200
    d = r.json()
    # Should be dict of empty arrays
    for v in d.values():
        if isinstance(v, list):
            assert v == []


def test_library_toggle_requires_auth():
    r = requests.post(f"{API}/library/toggle", json={"target_type": "track", "target_id": "track-1"})
    assert r.status_code == 401


def test_library_toggle_and_list(maya_session):
    # get a track
    import random as _r
    tracks = requests.get(f"{API}/tracks").json()
    tid = _r.choice(tracks[:50])["id"]
    r1 = maya_session.post(f"{API}/library/toggle", json={"target_type": "track", "target_id": tid})
    assert r1.status_code == 200, r1.text
    first = r1.json().get("active")
    r2 = maya_session.post(f"{API}/library/toggle", json={"target_type": "track", "target_id": tid})
    assert r2.status_code == 200
    second = r2.json().get("active")
    assert first != second, f"toggle didn't invert: {first} -> {second}"
    # Ensure track is in library (toggle to on if currently off)
    if second is False:
        r3 = maya_session.post(f"{API}/library/toggle", json={"target_type": "track", "target_id": tid})
        assert r3.json().get("active") is True

    lib = maya_session.get(f"{API}/library").json()
    tracks_lib = lib.get("tracks", [])
    ids = [t.get("id") for t in tracks_lib]
    assert tid in ids, f"toggled track not in library: {ids}"


# ---------- Analytics ----------
def test_analytics_me(maya_session):
    r = maya_session.get(f"{API}/analytics/me")
    assert r.status_code == 200, r.text
    d = r.json()
    for key in ["creator", "kpis", "growth_series", "country_series", "schools_reached"]:
        assert key in d, f"missing {key}"
    assert len(d["growth_series"]) == 12


# ---------- Credentials file ----------
def test_credentials_all_valid():
    creds = [
        ("admin@ancrmedia.com", "AdminPass2026!"),
        ("maya@ancrmedia.com", "Creator2026!"),
        ("kenji@ancrmedia.com", "Creator2026!"),
        ("zara@ancrmedia.com", "Creator2026!"),
        ("luca@ancrmedia.com", "Creator2026!"),
        ("noah@ancrmedia.com", "Creator2026!"),
        ("prof.hayes@ancrmedia.com", "Faculty2026!"),
    ]
    for email, pw in creds:
        r = requests.post(f"{API}/auth/login", json={"email": email, "password": pw})
        assert r.status_code == 200, f"{email} login failed: {r.status_code} {r.text}"
