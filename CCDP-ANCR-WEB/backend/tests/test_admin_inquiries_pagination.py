"""Iteration 19: verify pagination on admin inquiries endpoints."""
import os
import uuid
import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")).rstrip("/")

ADMIN_EMAIL = "danielle@aweday.org"
ADMIN_PASSWORD = "QnCggaMbqI4PjUl8XiisRrhW"


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text[:300]}"
    data = r.json()
    tok = data.get("token") or data.get("access_token")
    assert tok, f"no token in response: {data}"
    return tok


@pytest.fixture(scope="module")
def headers(token):
    return {"Authorization": f"Bearer {token}"}


def test_admin_login():
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
    assert r.status_code == 200
    data = r.json()
    assert data.get("token") or data.get("access_token")


def test_admin_list_default_shape(headers):
    r = requests.get(f"{BASE_URL}/api/admin/inquiries", headers=headers, timeout=30)
    assert r.status_code == 200, r.text[:300]
    d = r.json()
    for k in ("inquiries", "total", "byStatus", "statuses", "sheetsEnabled"):
        assert k in d, f"missing key {k} in {list(d.keys())}"
    assert isinstance(d["inquiries"], list)
    assert isinstance(d["total"], int)
    assert isinstance(d["byStatus"], dict)
    assert isinstance(d["statuses"], list)
    assert isinstance(d["sheetsEnabled"], bool)
    assert len(d["inquiries"]) <= 200, "default limit should be 200"
    # sanity: total should be >= returned length
    assert d["total"] >= len(d["inquiries"])
    # sorted desc by created_at
    ca = [i.get("created_at", "") for i in d["inquiries"]]
    assert ca == sorted(ca, reverse=True), "inquiries must be sorted by created_at desc"


def test_admin_list_pagination(headers):
    r1 = requests.get(f"{BASE_URL}/api/admin/inquiries?limit=5", headers=headers, timeout=30)
    assert r1.status_code == 200, r1.text[:300]
    d1 = r1.json()
    assert len(d1["inquiries"]) <= 5

    r2 = requests.get(f"{BASE_URL}/api/admin/inquiries?limit=5&skip=5", headers=headers, timeout=30)
    assert r2.status_code == 200, r2.text[:300]
    d2 = r2.json()
    assert len(d2["inquiries"]) <= 5

    ids1 = {i["id"] for i in d1["inquiries"]}
    ids2 = {i["id"] for i in d2["inquiries"]}
    if d1["total"] > 5:
        assert ids1.isdisjoint(ids2), "page 2 must not overlap page 1"

    # sort order desc across combined
    combined = d1["inquiries"] + d2["inquiries"]
    ca = [i.get("created_at", "") for i in combined]
    assert ca == sorted(ca, reverse=True)


def test_admin_list_limit_bounds(headers):
    # over max should 422
    r = requests.get(f"{BASE_URL}/api/admin/inquiries?limit=501", headers=headers, timeout=30)
    assert r.status_code == 422
    r = requests.get(f"{BASE_URL}/api/admin/inquiries?limit=0", headers=headers, timeout=30)
    assert r.status_code == 422
    r = requests.get(f"{BASE_URL}/api/admin/inquiries?skip=-1", headers=headers, timeout=30)
    assert r.status_code == 422


def test_admin_list_filters(headers):
    r = requests.get(f"{BASE_URL}/api/admin/inquiries?status=New", headers=headers, timeout=30)
    assert r.status_code == 200
    for inq in r.json()["inquiries"]:
        assert inq["status"] == "New"

    r = requests.get(f"{BASE_URL}/api/admin/inquiries?search=aweday", headers=headers, timeout=30)
    assert r.status_code == 200
    assert isinstance(r.json()["inquiries"], list)


def _make_payload(tag: str):
    uid = uuid.uuid4().hex[:10]
    return {
        "firstName": "TEST",
        "lastName": tag,
        "organization": f"TEST Org {uid}",
        "jobTitle": "QA",
        "organizationType": "Higher Education",
        "email": f"qa-{uid}@example.com",
        "phone": "",
        "website": "",
        "areaOfInterest": "Partnerships",
        "message": f"pytest iteration 19 inquiry {uid}",
        "source": "pytest",
        "requestedDeck": False,
        "company": "",
    }


def test_public_inquiry_then_appears_in_admin(headers):
    payload = _make_payload("PagCheck")
    r = requests.post(f"{BASE_URL}/api/inquiries", json=payload, timeout=30)
    assert r.status_code == 200, r.text[:300]
    body = r.json()
    assert body.get("status") == "success"
    new_id = body.get("id")
    assert new_id

    # confirm it appears at the top of admin list
    r2 = requests.get(f"{BASE_URL}/api/admin/inquiries?limit=10", headers=headers, timeout=30)
    assert r2.status_code == 200
    ids = [i["id"] for i in r2.json()["inquiries"]]
    assert new_id in ids, f"new inquiry {new_id} not in top 10: {ids}"
    # top item should be our new inquiry (sorted desc)
    assert r2.json()["inquiries"][0]["id"] == new_id


def test_admin_patch_update(headers):
    # create then patch
    payload = _make_payload("Patch")
    r = requests.post(f"{BASE_URL}/api/inquiries", json=payload, timeout=30)
    assert r.status_code == 200
    inq_id = r.json()["id"]

    r2 = requests.patch(f"{BASE_URL}/api/admin/inquiries/{inq_id}",
                        headers=headers, json={"status": "Contacted"}, timeout=30)
    assert r2.status_code == 200, r2.text[:300]
    doc = r2.json()
    assert doc["status"] == "Contacted"
    assert doc["id"] == inq_id


def test_csv_export(headers):
    r = requests.get(f"{BASE_URL}/api/admin/inquiries/export", headers=headers, timeout=60)
    assert r.status_code == 200
    ctype = r.headers.get("Content-Type", "")
    assert "text/csv" in ctype, f"unexpected content-type: {ctype}"
    body = r.text
    lines = [l for l in body.splitlines() if l.strip()]
    assert len(lines) >= 1, "CSV must have header row"
    header = lines[0]
    # header row contains at least id + email columns
    assert "," in header
    # confirm at least one data row exists (should, given seeded inquiries)
    assert len(lines) >= 2, "CSV must have at least one data row"


def test_unauthenticated_admin_endpoints():
    r = requests.get(f"{BASE_URL}/api/admin/inquiries", timeout=30)
    assert r.status_code in (401, 403)
    r = requests.get(f"{BASE_URL}/api/admin/inquiries/export", timeout=30)
    assert r.status_code in (401, 403)
