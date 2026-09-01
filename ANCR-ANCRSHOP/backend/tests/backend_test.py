"""ANCRSHOP backend regression tests.
Covers: health, auth/RBAC, catalog, cart quote+coupons, wishlist, orders,
Stripe checkout (session creation), AIAH concierge, admin CRUD.
"""
import os
import re
import uuid
from pathlib import Path

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL missing")
BASE_URL = base_url.rstrip("/")


# --------- Fixtures ---------
@pytest.fixture(scope="session")
def creds():
    content = Path("/app/memory/test_credentials.md").read_text()
    def grab(section):
        # find "Email:" and "Password:" after section header
        block = content.split(section, 1)[1]
        e = re.search(r"Email[^\S\n]*:\s*`?([^\s`]+)`?", block).group(1)
        p = re.search(r"Password[^\S\n]*:\s*`?([^\s`]+)`?", block).group(1)
        return {"email": e, "password": p}
    return {"admin": grab("## Admin"), "demo": grab("## Demo Customer")}


@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _login_session(email, password):
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": password}, timeout=20)
    assert r.status_code == 200, f"login failed {r.status_code} {r.text[:200]}"
    return s


@pytest.fixture(scope="session")
def admin_session(creds):
    return _login_session(creds["admin"]["email"], creds["admin"]["password"])


@pytest.fixture(scope="session")
def demo_session(creds):
    return _login_session(creds["demo"]["email"], creds["demo"]["password"])


# --------- Health ---------
class TestHealth:
    def test_root(self, api):
        r = api.get(f"{BASE_URL}/api/")
        assert r.status_code == 200
        assert r.json().get("status") == "ok"


# --------- Auth & RBAC ---------
class TestAuth:
    def test_login_admin(self, api, creds):
        r = api.post(f"{BASE_URL}/api/auth/login", json=creds["admin"])
        assert r.status_code == 200
        d = r.json()
        assert d["email"] == creds["admin"]["email"]
        assert d["role"] in ("admin", "superadmin")
        assert "access_token" in r.cookies

    def test_login_demo(self, api, creds):
        r = api.post(f"{BASE_URL}/api/auth/login", json=creds["demo"])
        assert r.status_code == 200
        assert r.json()["role"] == "creator"

    def test_login_bad_password(self, api, creds):
        r = api.post(f"{BASE_URL}/api/auth/login",
                     json={"email": creds["demo"]["email"], "password": "wrong"})
        assert r.status_code in (401, 429)

    def test_me_requires_auth(self, api):
        r = requests.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 401

    def test_me_with_session(self, demo_session, creds):
        r = demo_session.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 200
        assert r.json()["email"] == creds["demo"]["email"]

    def test_register_and_logout(self, api):
        email = f"TEST_user_{uuid.uuid4().hex[:8]}@example.com"
        s = requests.Session()
        r = s.post(f"{BASE_URL}/api/auth/register",
                   json={"email": email, "password": "Passw0rd!", "name": "Test User"})
        assert r.status_code == 200, r.text
        assert r.json()["email"] == email
        # duplicate
        r2 = s.post(f"{BASE_URL}/api/auth/register",
                    json={"email": email, "password": "Passw0rd!", "name": "Dup"})
        assert r2.status_code == 400
        # cannot self-elevate to admin
        email2 = f"TEST_user_{uuid.uuid4().hex[:8]}@example.com"
        r3 = requests.post(f"{BASE_URL}/api/auth/register",
                           json={"email": email2, "password": "Passw0rd!", "name": "X", "role": "admin"})
        assert r3.status_code == 200
        assert r3.json()["role"] == "customer"
        # logout
        assert s.post(f"{BASE_URL}/api/auth/logout").status_code == 200

    def test_admin_rbac(self, demo_session):
        r = demo_session.get(f"{BASE_URL}/api/admin/stats")
        assert r.status_code == 403


# --------- Catalog ---------
class TestCatalog:
    def test_departments_19(self, api):
        r = api.get(f"{BASE_URL}/api/departments")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 19, f"expected >=19 departments got {len(data)}"

    def test_products_list_and_filter(self, api):
        r = api.get(f"{BASE_URL}/api/products?limit=5")
        assert r.status_code == 200
        d = r.json()
        assert "items" in d and len(d["items"]) > 0
        # sort
        r2 = api.get(f"{BASE_URL}/api/products?sort=price-asc&limit=5")
        prices = [p["price"] for p in r2.json()["items"]]
        assert prices == sorted(prices)
        # search
        r3 = api.get(f"{BASE_URL}/api/products?q=photo&limit=5")
        assert r3.status_code == 200

    def test_product_detail(self, api):
        item = api.get(f"{BASE_URL}/api/products?limit=1").json()["items"][0]
        r = api.get(f"{BASE_URL}/api/products/{item['slug']}")
        assert r.status_code == 200
        d = r.json()
        assert d["slug"] == item["slug"]
        assert "related" in d and "reviews" in d

    def test_collections_campaigns_recs(self, api):
        for path in ("/api/collections", "/api/campaigns", "/api/recommendations"):
            r = api.get(f"{BASE_URL}{path}")
            assert r.status_code == 200

    def test_add_review_requires_auth(self, api, demo_session):
        slug = api.get(f"{BASE_URL}/api/products?limit=1").json()["items"][0]["slug"]
        r = requests.post(f"{BASE_URL}/api/products/{slug}/reviews",
                          json={"rating": 5, "title": "t", "body": "b"})
        assert r.status_code == 401
        r2 = demo_session.post(f"{BASE_URL}/api/products/{slug}/reviews",
                               json={"rating": 5, "title": "TEST review", "body": "Great"})
        assert r2.status_code == 200
        assert r2.json()["rating"] == 5


# --------- Commerce (cart quote, coupons, wishlist, orders) ---------
class TestCommerce:
    def _two_items(self, api):
        items = api.get(f"{BASE_URL}/api/products?limit=2").json()["items"]
        return [{"slug": items[0]["slug"], "quantity": 2},
                {"slug": items[1]["slug"], "quantity": 1}]

    def test_cart_quote_no_coupon(self, api):
        items = self._two_items(api)
        r = api.post(f"{BASE_URL}/api/cart/quote", json={"items": items})
        assert r.status_code == 200
        d = r.json()
        assert d["item_count"] == 3
        assert d["subtotal"] > 0
        # tax ~8%
        taxable = d["subtotal"] - d["discount"]
        assert abs(d["tax"] - round(taxable * 0.08, 2)) < 0.05

    def test_cart_quote_coupon_creator10(self, api):
        items = self._two_items(api)
        r = api.post(f"{BASE_URL}/api/cart/quote",
                     json={"items": items, "coupon_code": "CREATOR10"})
        assert r.status_code == 200
        d = r.json()
        assert d["discount"] > 0
        assert d["coupon"] and d["coupon"]["code"] == "CREATOR10"
        assert abs(d["discount"] - round(d["subtotal"] * 0.1, 2)) < 0.05

    def test_validate_coupon(self, api):
        r = api.post(f"{BASE_URL}/api/coupons/validate",
                     json={"code": "CREATOR10", "subtotal": 100})
        assert r.status_code == 200
        r2 = api.post(f"{BASE_URL}/api/coupons/validate",
                      json={"code": "NOPE_NOPE", "subtotal": 100})
        assert r2.status_code == 404
        r3 = api.post(f"{BASE_URL}/api/coupons/validate",
                      json={"code": "ANCR25", "subtotal": 10})
        assert r3.status_code == 400

    def test_wishlist_toggle(self, api, demo_session):
        slug = api.get(f"{BASE_URL}/api/products?limit=1").json()["items"][0]["slug"]
        r = demo_session.post(f"{BASE_URL}/api/wishlist/{slug}")
        assert r.status_code == 200
        added_state = r.json()["added"]
        # GET wishlist
        w = demo_session.get(f"{BASE_URL}/api/wishlist")
        assert w.status_code == 200
        slugs_now = [p["slug"] for p in w.json()]
        assert (slug in slugs_now) == added_state
        # toggle back
        demo_session.post(f"{BASE_URL}/api/wishlist/{slug}")

    def test_orders_require_auth(self):
        r = requests.get(f"{BASE_URL}/api/orders")
        assert r.status_code == 401

    def test_my_orders_authenticated(self, demo_session):
        r = demo_session.get(f"{BASE_URL}/api/orders")
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# --------- Payments ---------
class TestPayments:
    def test_create_checkout_session(self, api):
        items = api.get(f"{BASE_URL}/api/products?limit=1").json()["items"]
        payload = {
            "items": [{"slug": items[0]["slug"], "quantity": 1}],
            "coupon_code": "CREATOR10",
            "origin_url": BASE_URL,
            "email": "TEST_buyer@example.com",
        }
        r = api.post(f"{BASE_URL}/api/payments/checkout", json=payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "checkout_url" in d and "checkout.stripe.com" in d["checkout_url"]
        assert d["order_number"].startswith("ANCR-")
        assert d["session_id"].startswith("cs_")
        # status endpoint
        s = api.get(f"{BASE_URL}/api/payments/status/{d['session_id']}")
        assert s.status_code == 200
        assert s.json()["payment_status"] in ("pending", "paid")

    def test_checkout_empty_cart(self, api):
        r = api.post(f"{BASE_URL}/api/payments/checkout",
                     json={"items": [], "origin_url": BASE_URL})
        assert r.status_code == 400


# --------- AIAH ---------
class TestAIAH:
    def test_chat_returns_reply(self, api):
        r = api.post(f"{BASE_URL}/api/aiah/chat",
                     json={"message": "I'm starting a podcast under $1000"}, timeout=90)
        assert r.status_code == 200
        d = r.json()
        assert "reply" in d and isinstance(d["reply"], str) and len(d["reply"]) > 0
        assert "products" in d and isinstance(d["products"], list)


# --------- Admin ---------
class TestAdmin:
    def test_stats(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/admin/stats")
        assert r.status_code == 200
        d = r.json()
        for k in ("revenue", "total_orders", "customers", "products", "low_stock"):
            assert k in d

    def test_product_crud(self, admin_session):
        payload = {"name": "TEST Admin Product", "department": "audio-equipment",
                   "department_name": "Audio Equipment", "category": "Testing", "price": 19.99, "stock": 5}
        r = admin_session.post(f"{BASE_URL}/api/admin/products", json=payload)
        assert r.status_code == 200, r.text
        p = r.json()
        pid = p["id"]
        assert p["name"] == payload["name"]
        # GET via public catalog (may not appear if not active but here active=True default)
        # Update stock
        u = admin_session.put(f"{BASE_URL}/api/admin/products/{pid}", json={"stock": 42})
        assert u.status_code == 200
        assert u.json()["stock"] == 42
        # verify persistence via public detail
        slug = u.json()["slug"]
        g = requests.get(f"{BASE_URL}/api/products/{slug}")
        assert g.status_code == 200 and g.json()["stock"] == 42
        # Delete
        d = admin_session.delete(f"{BASE_URL}/api/admin/products/{pid}")
        assert d.status_code == 200
        g2 = requests.get(f"{BASE_URL}/api/products/{slug}")
        assert g2.status_code == 404

    def test_coupon_crud(self, admin_session):
        code = f"TEST{uuid.uuid4().hex[:6].upper()}"
        r = admin_session.post(f"{BASE_URL}/api/admin/coupons",
                               json={"code": code, "type": "percent", "value": 5,
                                     "description": "TEST", "active": True})
        assert r.status_code == 200
        cid = r.json()["id"]
        lst = admin_session.get(f"{BASE_URL}/api/admin/coupons").json()
        assert any(c["code"] == code for c in lst)
        d = admin_session.delete(f"{BASE_URL}/api/admin/coupons/{cid}")
        assert d.status_code == 200

    def test_orders_and_customers(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/admin/orders")
        assert r.status_code == 200
        c = admin_session.get(f"{BASE_URL}/api/admin/customers")
        assert c.status_code == 200
        assert isinstance(c.json(), list)
