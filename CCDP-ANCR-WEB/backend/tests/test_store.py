"""CCDP × ANCR store backend tests: catalog, customer auth, wishlist, addresses,
checkout (guest + logged in), order status, customer orders, admin orders."""
import os
import uuid
import pytest
import requests
from pathlib import Path
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL", "")).rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "danielle@aweday.org"
ADMIN_PASSWORD = "QnCggaMbqI4PjUl8XiisRrhW"


# ---------- fixtures ----------
@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="module")
def customer():
    email = f"test_cust_{uuid.uuid4().hex[:8]}@example.com"
    password = "Password123!"
    name = "TEST Customer"
    r = requests.post(f"{API}/store/auth/register",
                      json={"name": name, "email": email, "password": password}, timeout=15)
    assert r.status_code == 200, r.text
    d = r.json()
    assert "token" in d and "user" in d
    return {"email": email, "password": password, "name": name,
            "token": d["token"], "user": d["user"]}


@pytest.fixture(scope="module")
def cust_headers(customer):
    return {"Authorization": f"Bearer {customer['token']}"}


# ---------- catalog ----------
def test_catalog_shape():
    r = requests.get(f"{API}/store/catalog", timeout=15)
    assert r.status_code == 200
    d = r.json()
    for k in ("collections", "products", "types"):
        assert k in d, f"missing {k}"
    assert len(d["collections"]) == 10, f"expected 10 collections, got {len(d['collections'])}"
    assert len(d["products"]) == 96, f"expected 96 products, got {len(d['products'])}"
    assert len(d["types"]) == 12, f"expected 12 types, got {len(d['types'])}"
    # Verify required collection slugs exist
    names = {c.get("name") for c in d["collections"]}
    assert "THE RLMG" in names or any("RLMG" in (n or "") for n in names)
    assert any("RENSSNCE" in (n or "") or "Nu " in (n or "") for n in names)
    # Products carry required fields
    p = d["products"][0]
    for k in ("id", "name", "price", "sizes", "image", "collectionName", "type"):
        assert k in p


# ---------- auth ----------
def test_register_login_me(customer):
    # login with same credentials
    r = requests.post(f"{API}/store/auth/login",
                      json={"email": customer["email"], "password": customer["password"]}, timeout=15)
    assert r.status_code == 200, r.text
    tok = r.json()["token"]
    # me
    m = requests.get(f"{API}/store/auth/me", headers={"Authorization": f"Bearer {tok}"}, timeout=15)
    assert m.status_code == 200
    user = m.json()["user"]
    assert user["email"] == customer["email"]
    # user object should not contain _id or password_hash
    assert "_id" not in user
    assert "password_hash" not in user


def test_register_duplicate_rejected(customer):
    r = requests.post(f"{API}/store/auth/register",
                      json={"name": "dup", "email": customer["email"], "password": "Password123!"},
                      timeout=15)
    assert r.status_code == 409


def test_login_wrong_password(customer):
    r = requests.post(f"{API}/store/auth/login",
                      json={"email": customer["email"], "password": "wrong-password!!"}, timeout=15)
    assert r.status_code == 401


def test_register_short_password():
    r = requests.post(f"{API}/store/auth/register",
                      json={"name": "x", "email": f"t_{uuid.uuid4().hex[:6]}@example.com", "password": "short"},
                      timeout=15)
    assert r.status_code == 422


def test_me_requires_auth():
    r = requests.get(f"{API}/store/auth/me", timeout=15)
    assert r.status_code == 401


# ---------- profile ----------
def test_update_profile(cust_headers):
    r = requests.put(f"{API}/store/account", json={"name": "TEST Updated"},
                     headers=cust_headers, timeout=15)
    assert r.status_code == 200
    assert r.json().get("name") == "TEST Updated"
    m = requests.get(f"{API}/store/auth/me", headers=cust_headers, timeout=15)
    assert m.json()["user"]["name"] == "TEST Updated"


# ---------- addresses ----------
def test_addresses_crud(cust_headers):
    # empty initially
    r = requests.get(f"{API}/store/addresses", headers=cust_headers, timeout=15)
    assert r.status_code == 200
    initial = r.json()["addresses"]

    addr = {"label": "Home", "line1": "123 Test St", "city": "Chicago",
            "state": "IL", "postalCode": "60601", "country": "US"}
    r = requests.post(f"{API}/store/addresses", json=addr, headers=cust_headers, timeout=15)
    assert r.status_code == 200
    addrs = r.json()["addresses"]
    assert len(addrs) == len(initial) + 1
    aid = addrs[-1]["id"]
    assert addrs[-1]["city"] == "Chicago"

    # persist across GET
    r2 = requests.get(f"{API}/store/addresses", headers=cust_headers, timeout=15)
    assert any(a["id"] == aid for a in r2.json()["addresses"])

    # delete
    d = requests.delete(f"{API}/store/addresses/{aid}", headers=cust_headers, timeout=15)
    assert d.status_code == 200
    assert not any(a["id"] == aid for a in d.json()["addresses"])


def test_addresses_require_auth():
    r = requests.get(f"{API}/store/addresses", timeout=15)
    assert r.status_code == 401


# ---------- wishlist ----------
def test_wishlist_toggle(cust_headers):
    cat = requests.get(f"{API}/store/catalog", timeout=15).json()
    pid = cat["products"][0]["id"]

    r = requests.post(f"{API}/store/wishlist/{pid}", headers=cust_headers, timeout=15)
    assert r.status_code == 200
    assert pid in r.json()["wishlist"]

    r = requests.post(f"{API}/store/wishlist/{pid}", headers=cust_headers, timeout=15)
    assert r.status_code == 200
    assert pid not in r.json()["wishlist"]


def test_wishlist_unknown_product(cust_headers):
    r = requests.post(f"{API}/store/wishlist/nope-xyz", headers=cust_headers, timeout=15)
    assert r.status_code == 404


# ---------- checkout ----------
def _first_product():
    d = requests.get(f"{API}/store/catalog", timeout=15).json()
    return d["products"][0]


def test_guest_checkout_creates_pending_order():
    p = _first_product()
    size = p["sizes"][0]
    body = {"items": [{"productId": p["id"], "size": size, "quantity": 1}],
            "origin_url": BASE_URL, "email": f"guest_{uuid.uuid4().hex[:6]}@example.com"}
    r = requests.post(f"{API}/store/checkout", json=body, timeout=30)
    assert r.status_code == 200, r.text
    d = r.json()
    for k in ("checkout_url", "session_id", "order_id"):
        assert k in d and d[k]
    assert d["checkout_url"].startswith("https://checkout.stripe.com") or "stripe" in d["checkout_url"]

    # status - pending pre-payment
    s = requests.get(f"{API}/store/checkout/status/{d['session_id']}", timeout=15)
    assert s.status_code == 200
    sd = s.json()
    assert sd["payment_status"] in ("pending", "unpaid", None)


def test_logged_in_checkout_attaches_user_id(customer, cust_headers):
    p = _first_product()
    body = {"items": [{"productId": p["id"], "size": p["sizes"][0], "quantity": 2}],
            "origin_url": BASE_URL}
    r = requests.post(f"{API}/store/checkout", json=body, headers=cust_headers, timeout=30)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["checkout_url"] and d["session_id"] and d["order_id"]

    s = requests.get(f"{API}/store/checkout/status/{d['session_id']}", timeout=15)
    assert s.status_code == 200
    order = s.json().get("order") or {}
    assert order.get("user_id") == customer["user"].get("user_id")


def test_checkout_empty_cart_rejected():
    r = requests.post(f"{API}/store/checkout",
                      json={"items": [], "origin_url": BASE_URL}, timeout=15)
    assert r.status_code == 400


def test_checkout_bad_product_rejected():
    r = requests.post(f"{API}/store/checkout",
                      json={"items": [{"productId": "bogus", "size": "M", "quantity": 1}],
                            "origin_url": BASE_URL}, timeout=15)
    assert r.status_code == 400


# ---------- customer orders ----------
def test_customer_orders_only_paid(cust_headers):
    r = requests.get(f"{API}/store/orders", headers=cust_headers, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "orders" in d
    # all returned orders must be paid
    for o in d["orders"]:
        assert o.get("payment_status") == "paid"


def test_customer_orders_requires_auth():
    r = requests.get(f"{API}/store/orders", timeout=15)
    assert r.status_code == 401


# ---------- admin orders ----------
def test_admin_orders_list(admin_token):
    h = {"Authorization": f"Bearer {admin_token}"}
    r = requests.get(f"{API}/store/admin/orders", headers=h, timeout=15)
    assert r.status_code == 200
    d = r.json()
    for k in ("orders", "total", "paidCount", "revenue"):
        assert k in d, f"missing {k}"
    assert isinstance(d["orders"], list)
    assert isinstance(d["total"], int)
    assert isinstance(d["paidCount"], int)
    # revenue is numeric
    assert isinstance(d["revenue"], (int, float))


def test_admin_orders_unauth_rejected():
    r = requests.get(f"{API}/store/admin/orders", timeout=15)
    assert r.status_code in (401, 403)


def test_admin_orders_customer_token_rejected(cust_headers):
    r = requests.get(f"{API}/store/admin/orders", headers=cust_headers, timeout=15)
    assert r.status_code in (401, 403)


def test_admin_patch_fulfillment(admin_token):
    # create an order to update via guest checkout
    p = _first_product()
    body = {"items": [{"productId": p["id"], "size": p["sizes"][0], "quantity": 1}],
            "origin_url": BASE_URL, "email": f"guest_{uuid.uuid4().hex[:6]}@example.com"}
    co = requests.post(f"{API}/store/checkout", json=body, timeout=30)
    assert co.status_code == 200
    order_id = co.json()["order_id"]

    h = {"Authorization": f"Bearer {admin_token}"}
    r = requests.patch(f"{API}/store/admin/orders/{order_id}",
                       json={"fulfillment_status": "in_production"},
                       headers=h, timeout=15)
    assert r.status_code == 200, r.text
    assert r.json().get("fulfillment_status") == "in_production"


def test_admin_patch_missing_order(admin_token):
    h = {"Authorization": f"Bearer {admin_token}"}
    r = requests.patch(f"{API}/store/admin/orders/ord_doesnotexist",
                       json={"fulfillment_status": "fulfilled"}, headers=h, timeout=15)
    assert r.status_code == 404


# ---------- regression: existing endpoints still work ----------
def test_regression_config_endpoint():
    r = requests.get(f"{API}/config", timeout=15)
    assert r.status_code == 200
    assert "schedulingUrl" in r.json()


def test_regression_public_inquiry():
    p = {
        "firstName": "Regression",
        "lastName": "Test",
        "organization": "TEST_ Store Regression",
        "jobTitle": "Director",
        "organizationType": "University",
        "email": f"test_reg_{uuid.uuid4().hex[:8]}@example.com",
        "phone": "555-0000",
        "areaOfInterest": "Degree Program",
        "message": "regression",
        "source": "backend_test",
        "requestedDeck": False,
    }
    r = requests.post(f"{API}/inquiries", json=p, timeout=20)
    assert r.status_code == 200, r.text
    assert r.json()["status"] == "success"


def test_regression_admin_inquiries(admin_token):
    r = requests.get(f"{API}/admin/inquiries",
                     headers={"Authorization": f"Bearer {admin_token}"}, timeout=15)
    assert r.status_code == 200
    d = r.json()
    for k in ("inquiries", "total", "byStatus", "statuses"):
        assert k in d
