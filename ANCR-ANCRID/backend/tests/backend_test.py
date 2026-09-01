"""Backend API test suite for ANCRID"""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://digital-identity-128.preview.emergentagent.com").rstrip("/")
# Fallback to frontend .env
if not BASE_URL:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")

ADMIN_EMAIL = "aaron@ancr.io"
ADMIN_PASSWORD = "ancrid2026"

ANCRID_ENDPOINTS = [
    "/overview", "/identity", "/portfolio", "/timeline", "/passport",
    "/collaborations", "/skills", "/education", "/history", "/achievements",
    "/credentials", "/ecosystem", "/ai/insights", "/network",
]


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def auth_session(session):
    r = session.post(f"{BASE_URL}/api/auth/login",
                     json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    return session


# --- Root / Health ---
def test_root(session):
    r = session.get(f"{BASE_URL}/api/")
    assert r.status_code == 200
    assert r.json().get("service") == "ANCRID"


# --- Auth ---
def test_login_invalid(session):
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": ADMIN_EMAIL, "password": "wrong"})
    assert r.status_code == 401


def test_login_success_sets_cookies(session):
    r = session.post(f"{BASE_URL}/api/auth/login",
                     json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == ADMIN_EMAIL
    assert "password_hash" not in data
    assert "_id" not in data
    assert "id" in data
    # cookies
    assert "access_token" in session.cookies or any(c.name == "access_token" for c in session.cookies)


def test_me(auth_session):
    r = auth_session.get(f"{BASE_URL}/api/auth/me")
    assert r.status_code == 200
    assert r.json()["email"] == ADMIN_EMAIL


def test_unauth_blocked():
    r = requests.get(f"{BASE_URL}/api/ancrid/overview")
    assert r.status_code == 401


@pytest.mark.parametrize("path", ANCRID_ENDPOINTS)
def test_ancrid_endpoint(auth_session, path):
    r = auth_session.get(f"{BASE_URL}/api/ancrid{path}")
    assert r.status_code == 200, f"{path} => {r.status_code} {r.text[:200]}"
    body = r.json()
    assert body is not None


def test_overview_shape(auth_session):
    r = auth_session.get(f"{BASE_URL}/api/ancrid/overview")
    data = r.json()
    assert len(data["ecosystem"]) == 9
    codes = {m["code"] for m in data["ecosystem"]}
    expected = {"ANCRA", "ANCRLAB", "ANCRSync", "INHEIRA", "Vaulta", "Passport",
                "ANCRLaunch", "ANCRVIEW", "ANCRWAV"}
    assert expected == codes
    connected = [m for m in data["ecosystem"] if m["status"] == "connected"]
    idle = [m for m in data["ecosystem"] if m["status"] == "idle"]
    assert len(connected) == 7 and len(idle) == 2
    assert len(data["ai_insights"]) >= 3
    assert data["identity"]["ancrid_number"]


def test_network_search(auth_session):
    r = auth_session.get(f"{BASE_URL}/api/ancrid/network", params={"q": "Nia"})
    assert r.status_code == 200
    items = r.json()["items"]
    assert len(items) >= 1
    assert any("Nia" in i["name"] for i in items)


def test_network_filter_discipline(auth_session):
    r = auth_session.get(f"{BASE_URL}/api/ancrid/network", params={"discipline": "Music"})
    items = r.json()["items"]
    assert all(i["discipline"] == "Music" for i in items)
    assert len(items) >= 1


def test_identity_patch_persists(auth_session):
    new_bio = f"TEST bio {int(time.time())}"
    r = auth_session.patch(f"{BASE_URL}/api/ancrid/identity",
                           json={"biography": new_bio})
    assert r.status_code == 200
    # Verify via GET
    r2 = auth_session.get(f"{BASE_URL}/api/ancrid/identity")
    assert r2.json()["identity"]["biography"] == new_bio


# --- Signup flow ---
def test_signup_new_user():
    ts = int(time.time())
    email = f"test_{ts}@ancr.io"
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/register", json={
        "email": email, "password": "testpass123",
        "professional_name": "Test Creator",
    })
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["email"] == email
    assert data["identity"]["ancrid_number"].startswith("ANCRID-2026-")
    # Cookies set — can hit protected endpoint
    r2 = s.get(f"{BASE_URL}/api/auth/me")
    assert r2.status_code == 200


def test_signup_duplicate_email():
    r = requests.post(f"{BASE_URL}/api/auth/register", json={
        "email": ADMIN_EMAIL, "password": "whatever123",
        "professional_name": "Dup",
    })
    assert r.status_code == 400


def test_refresh_token():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login",
               json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200
    r2 = s.post(f"{BASE_URL}/api/auth/refresh")
    assert r2.status_code == 200


def test_logout_clears_cookies():
    s = requests.Session()
    s.post(f"{BASE_URL}/api/auth/login",
           json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    r = s.post(f"{BASE_URL}/api/auth/logout")
    assert r.status_code == 200
    # After logout, /me should fail
    r2 = requests.get(f"{BASE_URL}/api/auth/me")
    assert r2.status_code == 401
