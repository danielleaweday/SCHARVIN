"""Release-2 backend tests: forgot/reset password, admin tracking_number,
fulfillment enum validation, welcome email non-blocking, register 409."""
import os
import uuid
import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL", "")).rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "danielle@aweday.org"
ADMIN_PASSWORD = "QnCggaMbqI4PjUl8XiisRrhW"


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{API}/auth/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="module")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="module")
def registered_customer():
    email = f"test_rel2_{uuid.uuid4().hex[:8]}@example.com"
    password = "Password123!"
    r = requests.post(f"{API}/store/auth/register",
                      json={"name": "TEST Rel2", "email": email, "password": password}, timeout=15)
    assert r.status_code == 200, r.text
    d = r.json()
    assert "token" in d and "user" in d and d["user"].get("email") == email
    return {"email": email, "password": password, "token": d["token"]}


# ---------- Register / welcome email (skipped Resend) ----------
def test_register_returns_token_and_user_welcome_email_non_blocking(registered_customer):
    # If welcome email raised, the register call would have 500'd. Fixture asserts 200.
    assert registered_customer["token"]
    assert registered_customer["email"]


def test_register_duplicate_returns_409(registered_customer):
    r = requests.post(f"{API}/store/auth/register",
                      json={"name": "dup", "email": registered_customer["email"], "password": "Password123!"},
                      timeout=15)
    assert r.status_code == 409, r.text


# ---------- Forgot / Reset ----------
def test_forgot_returns_ok_for_existing_email(registered_customer):
    r = requests.post(f"{API}/store/auth/forgot",
                      json={"email": registered_customer["email"], "origin_url": BASE_URL},
                      timeout=15)
    assert r.status_code == 200, r.text
    assert r.json() == {"ok": True}


def test_forgot_returns_ok_for_unknown_email():
    # Must NOT leak whether the account exists.
    r = requests.post(f"{API}/store/auth/forgot",
                      json={"email": f"noone_{uuid.uuid4().hex[:8]}@example.com", "origin_url": BASE_URL},
                      timeout=15)
    assert r.status_code == 200
    assert r.json() == {"ok": True}


def test_reset_with_bad_token_returns_400(registered_customer):
    r = requests.post(f"{API}/store/auth/reset",
                      json={"email": registered_customer["email"],
                            "token": "badtoken_" + uuid.uuid4().hex,
                            "password": "NewPassword123!"},
                      timeout=15)
    assert r.status_code == 400, r.text


def test_reset_with_missing_fields_returns_422():
    r = requests.post(f"{API}/store/auth/reset", json={"email": "someone@example.com"}, timeout=15)
    assert r.status_code == 422


# ---------- Admin PATCH: tracking_number + fulfillment enum ----------
def _make_pending_order():
    """Create a pending order via guest checkout so admin PATCH has a target."""
    payload = {
        "items": [{"productId": "ccdp-hoodie", "size": "M", "quantity": 1}],
        "origin_url": BASE_URL,
        "email": f"guest_{uuid.uuid4().hex[:8]}@example.com",
    }
    r = requests.post(f"{API}/store/checkout", json=payload, timeout=20)
    assert r.status_code == 200, r.text
    return r.json()["order_id"]


def test_admin_patch_persists_shipped_and_tracking(admin_headers):
    order_id = _make_pending_order()
    tracking = f"1Z999{uuid.uuid4().hex[:8].upper()}"
    r = requests.patch(f"{API}/store/admin/orders/{order_id}",
                       headers=admin_headers,
                       json={"fulfillment_status": "shipped", "tracking_number": tracking},
                       timeout=15)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["fulfillment_status"] == "shipped"
    assert body["tracking_number"] == tracking

    # Verify persistence via admin list.
    lst = requests.get(f"{API}/store/admin/orders", headers=admin_headers, timeout=15)
    assert lst.status_code == 200
    match = next((o for o in lst.json()["orders"] if o["order_id"] == order_id), None)
    assert match is not None
    assert match["fulfillment_status"] == "shipped"
    assert match["tracking_number"] == tracking


def test_admin_patch_invalid_fulfillment_returns_422(admin_headers):
    order_id = _make_pending_order()
    r = requests.patch(f"{API}/store/admin/orders/{order_id}",
                       headers=admin_headers,
                       json={"fulfillment_status": "in_production"},
                       timeout=15)
    assert r.status_code == 422, r.text


def test_admin_patch_all_valid_statuses(admin_headers):
    order_id = _make_pending_order()
    for st in ["unfulfilled", "processing", "shipped", "delivered", "cancelled"]:
        r = requests.patch(f"{API}/store/admin/orders/{order_id}",
                           headers=admin_headers,
                           json={"fulfillment_status": st},
                           timeout=15)
        assert r.status_code == 200, f"{st}: {r.text}"
        assert r.json()["fulfillment_status"] == st


def test_admin_patch_unknown_order_returns_404(admin_headers):
    r = requests.patch(f"{API}/store/admin/orders/ord_doesnotexist",
                       headers=admin_headers,
                       json={"fulfillment_status": "shipped", "tracking_number": "TN123"},
                       timeout=15)
    assert r.status_code == 404


# ---------- Admin orders shape ----------
def test_admin_orders_shape(admin_headers):
    r = requests.get(f"{API}/store/admin/orders", headers=admin_headers, timeout=15)
    assert r.status_code == 200
    d = r.json()
    for k in ("orders", "total", "paidCount", "revenue"):
        assert k in d, f"missing {k}"
    assert isinstance(d["orders"], list)
    assert isinstance(d["total"], int)
    assert isinstance(d["paidCount"], int)
    assert isinstance(d["revenue"], (int, float))
