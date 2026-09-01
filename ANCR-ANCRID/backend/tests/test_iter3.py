"""Iteration 3: Creator Journey endpoint + public projection includes journey."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://digital-identity-128.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "aaron@ancr.io"
ADMIN_PASSWORD = "ancrid2026"

EXPECTED_CODES = ["FOUNDATION", "EMERGING", "PROFESSIONAL", "MASTERY"]


@pytest.fixture(scope="module")
def auth_session():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    return s


def test_journey_unauth_401():
    r = requests.get(f"{BASE_URL}/api/ancrid/journey")
    assert r.status_code == 401


def test_journey_shape(auth_session):
    r = auth_session.get(f"{BASE_URL}/api/ancrid/journey")
    assert r.status_code == 200, r.text
    d = r.json()
    assert "creator" in d and "chapters" in d
    chapters = d["chapters"]
    assert len(chapters) == 4
    codes = [c["code"] for c in chapters]
    assert codes == EXPECTED_CODES
    for c in chapters:
        for key in ("title", "subtitle", "period", "opening", "hero_image", "tint", "milestones", "gains", "quote"):
            assert key in c, f"Missing {key} in {c['code']}"
        assert len(c["milestones"]) >= 3
        assert isinstance(c["gains"], list) and len(c["gains"]) >= 1
        assert all(isinstance(g, str) for g in c["gains"])


def test_public_creator_includes_journey():
    r = requests.get(f"{BASE_URL}/api/public/creator/aaron")
    assert r.status_code == 200
    d = r.json()
    assert "journey" in d
    assert len(d["journey"]) == 4
    codes = [c["code"] for c in d["journey"]]
    assert codes == EXPECTED_CODES


# ---------- Regression: overview + all ancrid endpoints still 200 ----------
def test_overview_9_ecosystem(auth_session):
    r = auth_session.get(f"{BASE_URL}/api/ancrid/overview")
    assert r.status_code == 200
    d = r.json()
    assert len(d["ecosystem"]) == 9
    # creative_reputation_score should be 91 for Creative Impact dial
    assert d["identity"]["creative_reputation_score"] == 91


@pytest.mark.parametrize("path", [
    "/api/ancrid/portfolio", "/api/ancrid/timeline", "/api/ancrid/passport",
    "/api/ancrid/collaborations", "/api/ancrid/skills", "/api/ancrid/education",
    "/api/ancrid/history", "/api/ancrid/achievements", "/api/ancrid/credentials",
])
def test_ancrid_endpoints_200(auth_session, path):
    r = auth_session.get(f"{BASE_URL}{path}")
    assert r.status_code == 200, f"{path}: {r.text}"


# ---------- SSO regression ----------
def test_sso_clients_still_9():
    r = requests.get(f"{BASE_URL}/api/sso/clients")
    assert r.status_code == 200
    assert len(r.json()["items"]) == 9
