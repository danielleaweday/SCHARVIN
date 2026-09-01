"""VIEARTA backend API tests."""
import os
import pytest
import requests
from datetime import datetime, timezone

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if os.environ.get("REACT_APP_BACKEND_URL") else None
if not BASE_URL:
    # Read from frontend .env
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")

DEMO_EMAIL = "jaylen@viearta.demo"
DEMO_PASSWORD = "demo123"


@pytest.fixture(scope="session")
def demo_token():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PASSWORD})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and "user" in data
    assert data["user"]["is_demo"] is True
    assert data["user"]["ancrid"] == "ANCRID-7G8X"
    return data["token"]


@pytest.fixture(scope="session")
def auth_headers(demo_token):
    return {"Authorization": f"Bearer {demo_token}"}


# Auth
def test_login_demo():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PASSWORD})
    assert r.status_code == 200
    d = r.json()
    assert d["user"]["email"] == DEMO_EMAIL
    assert d["user"]["is_demo"] is True
    assert d["user"]["ancrid"] == "ANCRID-7G8X"
    assert d["user"]["first_name"] == "Jaylen"


def test_login_invalid():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": DEMO_EMAIL, "password": "wrong"})
    assert r.status_code == 401


def test_me(auth_headers):
    r = requests.get(f"{BASE_URL}/api/auth/me", headers=auth_headers)
    assert r.status_code == 200
    d = r.json()
    assert d["ancrid"] == "ANCRID-7G8X"
    assert d["is_demo"] is True


def test_me_no_token():
    r = requests.get(f"{BASE_URL}/api/auth/me")
    assert r.status_code == 401


def test_checkins_today(auth_headers):
    # may be null or a doc depending on state
    r = requests.get(f"{BASE_URL}/api/checkins/today", headers=auth_headers)
    assert r.status_code == 200


def test_checkins_upsert(auth_headers):
    today = datetime.now(timezone.utc).date().isoformat()
    payload = {
        "date": today,
        "arriving": {"body": 4, "mind": 4, "energy": 4, "creative_capacity": 4, "performance_readiness": 4, "note": "TEST_note"},
        "snapshot": {"energy_level": 4, "sleep_hours": 7.5, "hydration_glasses": 6, "stress_level": 2, "body_discomfort": 2, "mood": 4, "voice_condition": 4, "hearing_condition": 4, "creative_workload": 3},
        "creative_demand": ["studio"],
    }
    r = requests.post(f"{BASE_URL}/api/checkins", json=payload, headers=auth_headers)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["date"] == today
    assert d["arriving"]["note"] == "TEST_note"

    # Upsert - update
    payload["arriving"]["note"] = "TEST_updated"
    r2 = requests.post(f"{BASE_URL}/api/checkins", json=payload, headers=auth_headers)
    assert r2.status_code == 200
    assert r2.json()["arriving"]["note"] == "TEST_updated"

    # GET today should return it
    r3 = requests.get(f"{BASE_URL}/api/checkins/today", headers=auth_headers)
    assert r3.status_code == 200
    assert r3.json()["arriving"]["note"] == "TEST_updated"


def test_checkins_week(auth_headers):
    r = requests.get(f"{BASE_URL}/api/checkins/week", headers=auth_headers)
    assert r.status_code == 200
    d = r.json()
    assert "series" in d
    assert len(d["series"]) == 7
    # Demo user should have data for all 7 days
    filled = [x for x in d["series"] if x["energy"] is not None]
    assert len(filled) >= 6, f"Expected ~7 filled days, got {len(filled)}"


def test_recommendations(auth_headers):
    r = requests.get(f"{BASE_URL}/api/recommendations", headers=auth_headers)
    assert r.status_code == 200
    d = r.json()
    assert len(d["items"]) == 3
    assert d["personalized"] is True
    for it in d["items"]:
        assert "title" in it and "body" in it and "category" in it and "duration_minutes" in it


def test_events_upcoming(auth_headers):
    r = requests.get(f"{BASE_URL}/api/events/upcoming", headers=auth_headers)
    assert r.status_code == 200
    d = r.json()
    assert len(d["items"]) == 4
    starts = [e["starts_at"] for e in d["items"]]
    assert starts == sorted(starts)


def test_learning_current(auth_headers):
    r = requests.get(f"{BASE_URL}/api/learning/current", headers=auth_headers)
    assert r.status_code == 200
    d = r.json()
    assert d is not None
    # After FIX 1 (iter_4): endpoint now served by programs.py, not legacy stub.
    # Validate new shape rather than legacy hardcoded values.
    for k in ["id", "pathway", "title", "progress", "total_lessons",
              "completed_lessons", "next_lesson_id", "pathway_id"]:
        assert k in d, f"Missing key {k} in learning/current response"
    assert isinstance(d["pathway"], str) and len(d["pathway"]) > 0
    assert isinstance(d["title"], str) and len(d["title"]) > 0
    assert isinstance(d["progress"], (int, float))


def test_rotating_message():
    r = requests.get(f"{BASE_URL}/api/rotating-message")
    assert r.status_code == 200
    assert isinstance(r.json()["message"], str)
    assert len(r.json()["message"]) > 0


def test_protected_401():
    for ep in ["/api/checkins/today", "/api/checkins/week", "/api/recommendations", "/api/events/upcoming", "/api/learning/current"]:
        r = requests.get(f"{BASE_URL}{ep}")
        assert r.status_code == 401, f"{ep} returned {r.status_code}"
