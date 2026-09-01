"""Iter 22 — Inventory (variant/SKU) backend tests.

Covers:
- GET /api/store/catalog enrichment (variants, soldOut, available, lowStock)
- Admin GET /api/store/admin/inventory (stats, filters, auth)
- Admin PATCH /api/store/admin/inventory/{sku} (stock, delta, threshold, active, 404)
- Admin PATCH /api/store/admin/products/{id} (hide/restore, 404)
- Oversell 409 on POST /api/store/checkout
Cleans up: restores any stocks set to 0 and re-activates any hidden product.
"""
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

# SKUs we mutate — restored in module teardown.
SKU_HOODIE_L = "CCDP-HOODIE-L"
SKU_HOODIE_M = "CCDP-HOODIE-M"
SKU_HAT_ONE = "CCDP-HAT-ONESIZE"

_MUTATED_SKUS = set()
_HIDDEN_PRODUCTS = set()


@pytest.fixture(scope="module")
def admin_headers():
    r = requests.post(f"{API}/auth/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['token']}"}


def _patch_sku(headers, sku, body):
    _MUTATED_SKUS.add(sku)
    return requests.patch(f"{API}/store/admin/inventory/{sku}", headers=headers, json=body, timeout=15)


def _patch_product(headers, pid, active):
    if not active:
        _HIDDEN_PRODUCTS.add(pid)
    return requests.patch(f"{API}/store/admin/products/{pid}", headers=headers, json={"active": active}, timeout=15)


@pytest.fixture(scope="module", autouse=True)
def _cleanup(admin_headers):
    yield
    # Restore stocks
    for sku in list(_MUTATED_SKUS):
        try:
            requests.patch(f"{API}/store/admin/inventory/{sku}",
                           headers=admin_headers,
                           json={"stock": 50, "lowStockThreshold": 5,
                                 "trackInventory": True, "active": True},
                           timeout=15)
        except Exception:
            pass
    # Re-activate any hidden products
    for pid in list(_HIDDEN_PRODUCTS):
        try:
            requests.patch(f"{API}/store/admin/products/{pid}",
                           headers=admin_headers, json={"active": True}, timeout=15)
        except Exception:
            pass


# ---------- Catalog enrichment ----------
class TestCatalogEnrichment:
    def test_catalog_has_variants_soldout_available(self):
        r = requests.get(f"{API}/store/catalog", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert "products" in data and len(data["products"]) > 0
        p = data["products"][0]
        for key in ("variants", "soldOut", "available"):
            assert key in p, f"missing {key} on product"
        assert isinstance(p["variants"], list) and len(p["variants"]) > 0
        v = p["variants"][0]
        for key in ("size", "sku", "stock", "available", "lowStock"):
            assert key in v, f"missing {key} on variant"


# ---------- Admin inventory GET ----------
class TestAdminInventoryList:
    def test_requires_auth(self):
        r = requests.get(f"{API}/store/admin/inventory", timeout=15)
        assert r.status_code in (401, 403)

    def test_returns_expected_shape(self, admin_headers):
        r = requests.get(f"{API}/store/admin/inventory", headers=admin_headers, timeout=15)
        assert r.status_code == 200
        d = r.json()
        for k in ("variants", "totalSkus", "lowStockCount", "soldOutCount", "collections"):
            assert k in d
        assert isinstance(d["variants"], list)
        assert d["totalSkus"] >= 300  # ~306 expected
        assert isinstance(d["collections"], list)

    def test_collection_filter(self, admin_headers):
        r = requests.get(f"{API}/store/admin/inventory?collection=ccdp",
                         headers=admin_headers, timeout=15)
        assert r.status_code == 200
        rows = r.json()["variants"]
        assert len(rows) > 0
        # Some collections may be labeled differently — allow either collectionId in productId prefix
        # or collectionName present. Just assert non-empty for ccdp.

    def test_search_filter(self, admin_headers):
        r = requests.get(f"{API}/store/admin/inventory?search=hoodie",
                         headers=admin_headers, timeout=15)
        assert r.status_code == 200
        rows = r.json()["variants"]
        assert len(rows) > 0
        assert all("hoodie" in (row["productName"] + row["sku"]).lower() for row in rows)

    def test_low_only_filter(self, admin_headers):
        # Force one low-stock variant so filter has a definite hit
        resp = _patch_sku(admin_headers, SKU_HOODIE_M, {"stock": 3, "lowStockThreshold": 5})
        assert resp.status_code == 200
        r = requests.get(f"{API}/store/admin/inventory?lowOnly=true",
                         headers=admin_headers, timeout=15)
        assert r.status_code == 200
        rows = r.json()["variants"]
        assert any(row["sku"] == SKU_HOODIE_M for row in rows)
        assert all(row.get("lowStock") for row in rows)


# ---------- Admin inventory PATCH ----------
class TestAdminInventoryPatch:
    def test_set_stock_zero_soldout_in_catalog(self, admin_headers):
        r = _patch_sku(admin_headers, SKU_HOODIE_L, {"stock": 0})
        assert r.status_code == 200
        assert r.json()["stock"] == 0

        # Verify via catalog
        cat = requests.get(f"{API}/store/catalog", timeout=15).json()
        p = next(p for p in cat["products"] if p["id"] == "ccdp-hoodie")
        variant = next(v for v in p["variants"] if v["size"] == "L")
        assert variant["available"] is False
        assert variant["stock"] == 0

    def test_low_stock_flag(self, admin_headers):
        r = _patch_sku(admin_headers, SKU_HOODIE_M, {"stock": 3, "lowStockThreshold": 5})
        assert r.status_code == 200
        cat = requests.get(f"{API}/store/catalog", timeout=15).json()
        p = next(p for p in cat["products"] if p["id"] == "ccdp-hoodie")
        variant = next(v for v in p["variants"] if v["size"] == "M")
        assert variant["lowStock"] is True
        assert variant["available"] is True

    def test_delta_never_below_zero(self, admin_headers):
        # Set known stock, then apply a huge negative delta
        _patch_sku(admin_headers, SKU_HAT_ONE, {"stock": 5})
        r = _patch_sku(admin_headers, SKU_HAT_ONE, {"delta": -1000})
        assert r.status_code == 200
        assert r.json()["stock"] == 0

        # positive delta restores
        r = _patch_sku(admin_headers, SKU_HAT_ONE, {"delta": 20})
        assert r.status_code == 200
        assert r.json()["stock"] == 20

    def test_unknown_sku_returns_404(self, admin_headers):
        r = requests.patch(f"{API}/store/admin/inventory/DOES-NOT-EXIST-XYZ",
                           headers=admin_headers, json={"stock": 1}, timeout=15)
        assert r.status_code == 404


# ---------- Admin product hide ----------
class TestAdminProductHide:
    def test_hide_removes_from_catalog(self, admin_headers):
        r = _patch_product(admin_headers, "ccdp-hat", active=False)
        assert r.status_code == 200
        cat = requests.get(f"{API}/store/catalog", timeout=15).json()
        assert not any(p["id"] == "ccdp-hat" for p in cat["products"])

        # restore
        r2 = _patch_product(admin_headers, "ccdp-hat", active=True)
        assert r2.status_code == 200
        cat2 = requests.get(f"{API}/store/catalog", timeout=15).json()
        assert any(p["id"] == "ccdp-hat" for p in cat2["products"])

    def test_unknown_product_returns_404(self, admin_headers):
        r = requests.patch(f"{API}/store/admin/products/does-not-exist",
                           headers=admin_headers, json={"active": False}, timeout=15)
        assert r.status_code == 404


# ---------- Oversell prevention ----------
class TestOversell:
    def test_checkout_409_when_stock_zero(self, admin_headers):
        _patch_sku(admin_headers, SKU_HOODIE_L, {"stock": 0})
        payload = {
            "items": [{"productId": "ccdp-hoodie", "size": "L", "quantity": 1}],
            "origin_url": BASE_URL,
            "email": f"oversell_{uuid.uuid4().hex[:8]}@example.com",
        }
        r = requests.post(f"{API}/store/checkout", json=payload, timeout=20)
        assert r.status_code == 409, r.text
        # Should include a helpful message
        body = r.json()
        detail = body.get("detail") or body.get("message") or ""
        assert isinstance(detail, str) and len(detail) > 0

    def test_checkout_ok_for_stocked_variant(self, admin_headers):
        # Ensure XS in stock
        _patch_sku(admin_headers, "CCDP-HOODIE-XS", {"stock": 50})
        payload = {
            "items": [{"productId": "ccdp-hoodie", "size": "XS", "quantity": 1}],
            "origin_url": BASE_URL,
            "email": f"ok_{uuid.uuid4().hex[:8]}@example.com",
        }
        r = requests.post(f"{API}/store/checkout", json=payload, timeout=20)
        assert r.status_code == 200, r.text
        assert "checkout_url" in r.json()
