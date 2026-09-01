"""Focused verification for iteration_4:
FIX 1: /api/learning/current returns programs.py shape (with next_lesson_id, pathway_id)
FIX 2: GET /api/consent returns full shape after partial PUT (merged defaults)
"""
import os
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip()
BASE_URL = BASE_URL.rstrip("/")


@pytest.fixture(scope="module")
def student_session():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "jaylen@viearta.demo", "password": "demo123"
    })
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    token = r.json()["token"]
    s = requests.Session()
    s.headers.update({"Authorization": f"Bearer {token}"})
    return s


def test_learning_current_shape(student_session):
    r = student_session.get(f"{BASE_URL}/api/learning/current")
    assert r.status_code == 200, f"Got {r.status_code}: {r.text}"
    data = r.json()
    print("learning/current keys:", list(data.keys()))
    print("learning/current data:", data)
    # Programs.py implementation keys
    required = ["id", "pathway", "title", "progress", "total_lessons",
                "completed_lessons", "next_lesson_id", "pathway_id"]
    missing = [k for k in required if k not in data]
    assert not missing, f"Missing keys from programs.py shape: {missing}"
    # Legacy stub key should NOT be present
    assert "is_current" not in data, "Response still contains legacy 'is_current' key"


def test_consent_partial_put_merges_defaults(student_session):
    # PUT partial payload
    r = student_session.put(f"{BASE_URL}/api/consent",
                            json={"share_habits_with_mentor": True})
    assert r.status_code in (200, 204), f"PUT failed: {r.status_code} {r.text}"

    # GET must return full shape
    r = student_session.get(f"{BASE_URL}/api/consent")
    assert r.status_code == 200, f"GET failed: {r.status_code} {r.text}"
    data = r.json()
    print("consent GET data:", data)

    required = ["share_wellness_with_mentor",
                "share_reflections_with_mentor",
                "share_habits_with_mentor"]
    for k in required:
        assert k in data, f"Missing key: {k}"

    assert data["share_habits_with_mentor"] is True
    assert data["share_wellness_with_mentor"] is False, "Default False not merged"
    assert data["share_reflections_with_mentor"] is False, "Default False not merged"

    # Restore to false for clean state
    r = student_session.put(f"{BASE_URL}/api/consent", json={
        "share_habits_with_mentor": False,
        "share_wellness_with_mentor": False,
        "share_reflections_with_mentor": False,
    })
    assert r.status_code in (200, 204)
