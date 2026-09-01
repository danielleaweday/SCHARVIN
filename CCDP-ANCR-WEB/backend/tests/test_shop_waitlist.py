"""ANCR Shop waitlist backend tests: POST /api/store/waitlist + GET /api/store/admin/waitlist"""
import os
import re
import uuid
from pathlib import Path

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")).rstrip("/")


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def credentials():
    content = Path("/app/memory/test_credentials.md").read_text()
    email = re.search(r"Email:\s*(\S+)", content).group(1)
    pw = re.search(r"Password:\s*(\S+)", content).group(1)
    return {"email": email, "password": pw}


@pytest.fixture(scope="module")
def admin_token(client, credentials):
    r = client.post(f"{BASE_URL}/api/auth/login", json=credentials)
    if r.status_code != 200:
        pytest.fail(f"Admin login failed: {r.status_code} {r.text[:300]}")
    return r.json()["access_token"] if "access_token" in r.json() else r.json().get("token")


@pytest.fixture(scope="module")
def test_email():
    # Server lowercases emails; keep local part lowercase to match.
    return f"test_waitlist_{uuid.uuid4().hex[:8]}@example.com"


class TestWaitlist:
    def test_join_waitlist_success(self, client, test_email):
        r = client.post(f"{BASE_URL}/api/store/waitlist",
                        json={"name": "TEST User", "email": test_email})
        assert r.status_code == 200, r.text
        assert r.json() == {"ok": True}

    def test_join_waitlist_upsert_no_duplicates(self, client, test_email, admin_token):
        # Submit same email twice with different name
        r = client.post(f"{BASE_URL}/api/store/waitlist",
                        json={"name": "TEST User Updated", "email": test_email})
        assert r.status_code == 200
        # Verify in admin
        r = client.get(f"{BASE_URL}/api/store/admin/waitlist",
                       headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 200
        data = r.json()
        matching = [s for s in data["signups"] if s["email"] == test_email]
        assert len(matching) == 1, f"Expected 1 entry, got {len(matching)}"
        assert matching[0]["name"] == "TEST User Updated"

    def test_join_waitlist_invalid_email(self, client):
        r = client.post(f"{BASE_URL}/api/store/waitlist",
                        json={"name": "x", "email": "not-an-email"})
        assert r.status_code == 422

    def test_join_waitlist_missing_name(self, client):
        r = client.post(f"{BASE_URL}/api/store/waitlist",
                        json={"name": "", "email": "someone@example.com"})
        assert r.status_code == 422

    def test_admin_waitlist_requires_auth(self, client):
        r = client.get(f"{BASE_URL}/api/store/admin/waitlist")
        assert r.status_code in (401, 403), f"Expected 401/403, got {r.status_code}"

    def test_admin_waitlist_returns_signup(self, client, admin_token, test_email):
        r = client.get(f"{BASE_URL}/api/store/admin/waitlist",
                       headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 200
        data = r.json()
        assert "signups" in data and "total" in data
        assert isinstance(data["total"], int)
        emails = [s["email"] for s in data["signups"]]
        assert test_email in emails


@pytest.fixture(scope="module", autouse=True)
def cleanup(client, admin_token, test_email):
    yield
    # No delete endpoint; leave TEST_ prefixed entries. Best-effort documented.
