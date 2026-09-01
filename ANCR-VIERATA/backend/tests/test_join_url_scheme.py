"""Test URL scheme validation on PUT /api/circles/{id}/join-url (iteration 8 hardening)."""
import os
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                break
API = f"{BASE_URL}/api"


def _login(email, password):
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    return r.json()["token"]


def _h(t):
    return {"Authorization": f"Bearer {t}"}


@pytest.fixture(scope="module")
def admin_token():
    return _login("admin@viearta.demo", "admin123")


@pytest.fixture(scope="module")
def circle_id(admin_token):
    r = requests.get(f"{API}/circles", headers=_h(admin_token))
    assert r.status_code == 200
    circles = r.json().get("items", [])
    assert circles, "no circles seeded"
    return circles[0]["id"]


@pytest.fixture(scope="module", autouse=True)
def _cleanup(admin_token, circle_id):
    yield
    # Clear join_url after test module runs
    requests.put(f"{API}/circles/{circle_id}/join-url",
                 headers=_h(admin_token), json={"join_url": None})


@pytest.mark.parametrize("bad_url", [
    "javascript:alert(1)",
    "data:text/html,evil",
    "vbscript:msgbox",
    "file:///etc/passwd",
    "JavaScript:alert(1)",  # case
])
def test_rejects_dangerous_schemes(admin_token, circle_id, bad_url):
    # First set a known-good value
    requests.put(f"{API}/circles/{circle_id}/join-url",
                 headers=_h(admin_token),
                 json={"join_url": "https://safe.example.com/room"})
    r = requests.put(f"{API}/circles/{circle_id}/join-url",
                     headers=_h(admin_token), json={"join_url": bad_url})
    assert r.status_code == 422, f"expected 422 for {bad_url}, got {r.status_code}: {r.text}"
    # Verify unchanged
    g = requests.get(f"{API}/circles/{circle_id}", headers=_h(admin_token))
    assert g.status_code == 200
    assert g.json().get("join_url") == "https://safe.example.com/room"


def test_accepts_https(admin_token, circle_id):
    url = "https://ancrsync.example.com/room/xyz"
    r = requests.put(f"{API}/circles/{circle_id}/join-url",
                     headers=_h(admin_token), json={"join_url": url})
    assert r.status_code == 200, r.text
    assert r.json().get("join_url") == url
    g = requests.get(f"{API}/circles/{circle_id}", headers=_h(admin_token))
    assert g.json().get("join_url") == url


def test_accepts_http(admin_token, circle_id):
    url = "http://localhost:8080/dev"
    r = requests.put(f"{API}/circles/{circle_id}/join-url",
                     headers=_h(admin_token), json={"join_url": url})
    assert r.status_code == 200, r.text


def test_null_clears(admin_token, circle_id):
    # Set then clear
    requests.put(f"{API}/circles/{circle_id}/join-url",
                 headers=_h(admin_token),
                 json={"join_url": "https://ancrsync.example.com/room/xyz"})
    r = requests.put(f"{API}/circles/{circle_id}/join-url",
                     headers=_h(admin_token), json={"join_url": None})
    assert r.status_code == 200, r.text
    assert r.json().get("join_url") is None
    g = requests.get(f"{API}/circles/{circle_id}", headers=_h(admin_token))
    assert g.json().get("join_url") in (None, "")


def test_empty_string_clears(admin_token, circle_id):
    r = requests.put(f"{API}/circles/{circle_id}/join-url",
                     headers=_h(admin_token), json={"join_url": ""})
    assert r.status_code == 200, r.text
    assert r.json().get("join_url") is None


def test_bare_hostname_rejected(admin_token, circle_id):
    r = requests.put(f"{API}/circles/{circle_id}/join-url",
                     headers=_h(admin_token), json={"join_url": "example.com/room"})
    assert r.status_code == 422, r.text
