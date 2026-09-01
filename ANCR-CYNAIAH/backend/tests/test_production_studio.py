"""Tests for Coverage Coach + Call Sheet PDF endpoints (iteration 2)."""
import os
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/") or open("/app/frontend/.env").read().split("REACT_APP_BACKEND_URL=")[1].split()[0].strip()
API = f"{BASE_URL}/api"

STUDENT = {"email": "student@cynaiah.demo", "password": "Cynaiah2026!"}
SEEDED_PROJECT = "proj-mv-neon-heart"


@pytest.fixture(scope="module")
def token():
    # Ensure seed
    requests.post(f"{API}/seed", timeout=30)
    r = requests.post(f"{API}/auth/login", json=STUDENT, timeout=30)
    assert r.status_code == 200, r.text
    j = r.json()
    return j.get("access_token") or j.get("token")


@pytest.fixture(scope="module")
def auth(token):
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="module")
def overview(auth):
    r = requests.get(f"{API}/projects/{SEEDED_PROJECT}/production/overview", headers=auth, timeout=30)
    assert r.status_code == 200, r.text
    return r.json()


# ---------- Coverage Coach ----------

def test_coverage_coach_requires_auth():
    r = requests.post(f"{API}/projects/{SEEDED_PROJECT}/production/coverage-coach", timeout=15)
    assert r.status_code in (401, 403), f"expected 401/403 got {r.status_code}: {r.text}"


def test_coverage_coach_returns_advisory(auth):
    # No body needed - route shadowing bug verification
    r = requests.post(
        f"{API}/projects/{SEEDED_PROJECT}/production/coverage-coach",
        headers=auth,
        timeout=90,
    )
    assert r.status_code == 200, f"expected 200 got {r.status_code}: {r.text[:400]}"
    data = r.json()
    assert "provider" in data
    assert "scenes" in data and isinstance(data["scenes"], list)
    assert "note" in data
    assert "advisory" in data["note"].lower() or "director" in data["note"].lower()
    # scene shape
    assert len(data["scenes"]) >= 1
    s0 = data["scenes"][0]
    for f in ("scene_number", "scene_title", "possibly_missing", "questions_for_student", "compliments"):
        assert f in s0, f"missing field {f} in scene: {s0}"


def test_coverage_coach_empty_project_returns_400(auth):
    # Create an empty project
    proj = requests.post(
        f"{API}/projects",
        headers=auth,
        json={"title": "TEST_empty_cov", "type": "short_film"},
        timeout=15,
    )
    assert proj.status_code == 200, proj.text
    pid = proj.json()["id"]
    try:
        r = requests.post(f"{API}/projects/{pid}/production/coverage-coach", headers=auth, timeout=30)
        assert r.status_code == 400, f"expected 400 got {r.status_code}: {r.text[:300]}"
    finally:
        requests.delete(f"{API}/projects/{pid}", headers=auth, timeout=15)


# ---------- Call Sheet PDF ----------

def test_callsheet_pdf_download(auth, overview):
    callsheets = overview.get("callsheets", [])
    assert callsheets, "seeded project should have callsheets"
    cs_id = callsheets[0]["id"]
    r = requests.get(f"{API}/production/callsheet/{cs_id}/pdf", headers=auth, timeout=30)
    assert r.status_code == 200, r.text[:300]
    assert r.headers.get("content-type", "").startswith("application/pdf"), r.headers
    assert "attachment" in r.headers.get("content-disposition", "").lower()
    assert r.content[:5] == b"%PDF-", f"body not PDF: {r.content[:20]}"


def test_callsheet_pdf_requires_auth(overview):
    cs_id = overview["callsheets"][0]["id"]
    r = requests.get(f"{API}/production/callsheet/{cs_id}/pdf", timeout=15)
    assert r.status_code in (401, 403)
