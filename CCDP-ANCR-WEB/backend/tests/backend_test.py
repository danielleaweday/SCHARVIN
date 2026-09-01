"""CCDP CRM backend integration tests."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/") or "https://studio-ancr.preview.emergentagent.com"
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "danielle@aweday.org"
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "QnCggaMbqI4PjUl8XiisRrhW")


@pytest.fixture(scope="session")
def token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and data["user"]["email"] == ADMIN_EMAIL
    return data["token"]


@pytest.fixture
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


def _payload(email=None, **overrides):
    p = {
        "firstName": "Test",
        "lastName": "User",
        "organization": "TEST_ Org",
        "jobTitle": "Director",
        "organizationType": "University",
        "email": email or f"test_{uuid.uuid4().hex[:8]}@example.com",
        "phone": "555-1234",
        "website": "https://example.com",
        "areaOfInterest": "Degree Program",
        "message": "Hello from backend test",
        "source": "backend_test",
        "requestedDeck": True,
    }
    p.update(overrides)
    return p


# ---- Config
def test_config_endpoint():
    r = requests.get(f"{API}/config", timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "schedulingUrl" in d and "emailEnabled" in d
    assert d["emailEnabled"] is False


# ---- Public inquiry
def test_create_inquiry_success():
    p = _payload()
    r = requests.post(f"{API}/inquiries", json=p, timeout=20)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["status"] == "success"
    assert d["requestedDeck"] is True
    assert d["id"]


def test_honeypot_no_store(token):
    email = f"test_honey_{uuid.uuid4().hex[:8]}@example.com"
    p = _payload(email=email, company="I am a bot")
    r = requests.post(f"{API}/inquiries", json=p, timeout=15)
    assert r.status_code == 200
    assert r.json()["id"] == "ok"
    # Verify not stored
    admin = requests.get(f"{API}/admin/inquiries", params={"search": email},
                        headers={"Authorization": f"Bearer {token}"}, timeout=15)
    assert admin.status_code == 200
    items = [i for i in admin.json()["inquiries"] if i["email"] == email]
    assert len(items) == 0


def test_invalid_email_rejected():
    p = _payload(email="not-an-email")
    r = requests.post(f"{API}/inquiries", json=p, timeout=15)
    assert r.status_code == 422


def test_missing_required_fields():
    r = requests.post(f"{API}/inquiries", json={"email": "a@b.com"}, timeout=15)
    assert r.status_code == 422


def test_upsert_by_email(auth_headers):
    email = f"test_upsert_{uuid.uuid4().hex[:8]}@example.com"
    r1 = requests.post(f"{API}/inquiries", json=_payload(email=email, organization="TEST_ Org A"), timeout=20)
    assert r1.status_code == 200
    id1 = r1.json()["id"]
    r2 = requests.post(f"{API}/inquiries", json=_payload(email=email, organization="TEST_ Org B"), timeout=20)
    assert r2.status_code == 200
    id2 = r2.json()["id"]
    assert id1 == id2, "Should upsert with same id"

    listing = requests.get(f"{API}/admin/inquiries", params={"search": email}, headers=auth_headers, timeout=15)
    items = [i for i in listing.json()["inquiries"] if i["email"] == email]
    assert len(items) == 1
    assert items[0]["organization"] == "TEST_ Org B"


# ---- Auth
def test_login_wrong_password():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong-password-xyz"}, timeout=15)
    assert r.status_code == 401


def test_admin_requires_auth():
    r = requests.get(f"{API}/admin/inquiries", timeout=15)
    assert r.status_code == 401


def test_admin_list_ok(auth_headers):
    r = requests.get(f"{API}/admin/inquiries", headers=auth_headers, timeout=15)
    assert r.status_code == 200
    d = r.json()
    for k in ["inquiries", "total", "byStatus", "statuses", "sheetsEnabled"]:
        assert k in d
    assert d["sheetsEnabled"] is False
    assert isinstance(d["statuses"], list) and "New" in d["statuses"]


# ---- PATCH
def test_patch_updates_persist(auth_headers):
    email = f"test_patch_{uuid.uuid4().hex[:8]}@example.com"
    cr = requests.post(f"{API}/inquiries", json=_payload(email=email), timeout=20)
    inquiry_id = cr.json()["id"]

    updates = {
        "status": "Contacted",
        "assignedTo": "Danielle",
        "internalNotes": "Called them",
        "lastContactedDate": "2026-01-10",
        "nextFollowUpDate": "2026-01-20",
    }
    r = requests.patch(f"{API}/admin/inquiries/{inquiry_id}", json=updates, headers=auth_headers, timeout=15)
    assert r.status_code == 200, r.text
    doc = r.json()
    for k, v in updates.items():
        assert doc[k] == v

    # Re-fetch to confirm persistence
    listing = requests.get(f"{API}/admin/inquiries", params={"search": email}, headers=auth_headers, timeout=15)
    match = next((i for i in listing.json()["inquiries"] if i["id"] == inquiry_id), None)
    assert match is not None
    for k, v in updates.items():
        assert match[k] == v


def test_patch_404_for_missing_id(auth_headers):
    r = requests.patch(f"{API}/admin/inquiries/nonexistent-id-xxx",
                      json={"status": "Contacted"}, headers=auth_headers, timeout=15)
    assert r.status_code == 404


# ---- Export CSV
def test_export_csv(auth_headers):
    r = requests.get(f"{API}/admin/inquiries/export", headers=auth_headers, timeout=20)
    assert r.status_code == 200
    assert "text/csv" in r.headers.get("content-type", "")
    text = r.text
    header = text.split("\n", 1)[0]
    for col in ["Inquiry ID", "Date Submitted", "Organization"]:
        assert col in header, f"missing col {col} in {header}"


def test_export_filtered(auth_headers):
    r = requests.get(f"{API}/admin/inquiries/export", params={"status": "New"},
                    headers=auth_headers, timeout=20)
    assert r.status_code == 200
    assert "text/csv" in r.headers.get("content-type", "")
