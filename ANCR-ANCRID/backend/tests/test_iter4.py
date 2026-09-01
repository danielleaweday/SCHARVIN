"""Iteration 4: Creator Mobility + Booking Packet"""
import os
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://digital-identity-128.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "aaron@ancr.io"
ADMIN_PASSWORD = "ancrid2026"


@pytest.fixture(scope="module")
def auth_session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    return s


# --- Mobility profile ---
def test_mobility_profile_unauth():
    r = requests.get(f"{BASE_URL}/api/mobility/profile")
    assert r.status_code == 401


def test_mobility_profile_keys(auth_session):
    r = auth_session.get(f"{BASE_URL}/api/mobility/profile")
    assert r.status_code == 200
    d = r.json()
    for k in ("personal", "airlines", "hotels", "rentals", "preferences", "dietary",
              "medical", "emergency", "team", "booking", "riders", "documents",
              "global_history", "calendar", "ai_travel_suggestions", "permissions"):
        assert k in d, f"missing key {k}"
    assert len(d["airlines"]) >= 3
    assert len(d["hotels"]) >= 3
    assert d["personal"]["passport_number_masked"].startswith("P")
    assert d["personal"]["tsa_precheck"] == "TT1234567"
    assert d["personal"]["global_entry"] == "GE9876543"
    visas = d["personal"]["visas"]
    countries = [v["country"] for v in visas]
    assert "United Kingdom" in countries
    assert "Schengen Area" in countries


def test_mobility_patch_valid(auth_session):
    r = auth_session.patch(f"{BASE_URL}/api/mobility/profile",
                           json={"section": "preferences", "data": {"cabin": "First"}})
    assert r.status_code == 200
    assert r.json().get("ok") is True
    # Follow-up GET (note: GET returns shared DEMO; persistence-to-user store is deferred)
    r2 = auth_session.get(f"{BASE_URL}/api/mobility/profile")
    assert r2.status_code == 200


def test_mobility_patch_invalid_section(auth_session):
    r = auth_session.patch(f"{BASE_URL}/api/mobility/profile",
                           json={"section": "not_a_section", "data": {}})
    assert r.status_code == 400


def test_travel_suggestions(auth_session):
    r = auth_session.get(f"{BASE_URL}/api/mobility/travel-suggestions")
    assert r.status_code == 200
    items = r.json()["items"]
    assert len(items) >= 5
    assert all("title" in i and "reason" in i for i in items)


# --- Booking Packet ---
def test_packet_create_unauth():
    r = requests.post(f"{BASE_URL}/api/mobility/booking-packet",
                      json={"permission_level": "booking_only"})
    assert r.status_code == 401


def test_packet_create_and_public_fetch(auth_session):
    r = auth_session.post(f"{BASE_URL}/api/mobility/booking-packet",
                          json={"permission_level": "booking_only", "include_emergency": False})
    assert r.status_code == 200
    d = r.json()
    for k in ("token", "url", "permission_level", "expires_at"):
        assert k in d
    assert d["url"] == f"/packet/{d['token']}"
    assert d["permission_level"] == "booking_only"

    # public fetch (no auth)
    token = d["token"]
    pr = requests.get(f"{BASE_URL}/api/public/packet/{token}")
    assert pr.status_code == 200
    pd = pr.json()
    for k in ("creator", "portfolio", "achievements", "mobility",
              "permission_level", "issued_at", "expires_at"):
        assert k in pd
    # emergency omitted
    assert "emergency" not in pd["mobility"]

    # cleanup
    auth_session.delete(f"{BASE_URL}/api/mobility/booking-packet/{token}")


def test_packet_public_invalid_token():
    r = requests.get(f"{BASE_URL}/api/public/packet/not-a-real-token-xyz")
    assert r.status_code == 404


def test_packet_include_emergency_true(auth_session):
    r = auth_session.post(f"{BASE_URL}/api/mobility/booking-packet",
                          json={"permission_level": "booking_only", "include_emergency": True})
    assert r.status_code == 200
    token = r.json()["token"]
    pr = requests.get(f"{BASE_URL}/api/public/packet/{token}")
    assert pr.status_code == 200
    mobility = pr.json()["mobility"]
    assert "emergency" in mobility
    assert isinstance(mobility["emergency"], list)
    assert len(mobility["emergency"]) >= 1
    auth_session.delete(f"{BASE_URL}/api/mobility/booking-packet/{token}")


def test_packet_public_permission_minimal(auth_session):
    r = auth_session.post(f"{BASE_URL}/api/mobility/booking-packet",
                          json={"permission_level": "public", "include_emergency": False})
    assert r.status_code == 200
    token = r.json()["token"]
    pr = requests.get(f"{BASE_URL}/api/public/packet/{token}")
    assert pr.status_code == 200
    mobility = pr.json()["mobility"]
    # only preferences + dietary.restrictions
    assert "preferences" in mobility
    assert "dietary" in mobility
    assert list(mobility["dietary"].keys()) == ["restrictions"]
    assert "team" not in mobility
    assert "booking" not in mobility
    assert "riders" not in mobility
    auth_session.delete(f"{BASE_URL}/api/mobility/booking-packet/{token}")


def test_list_and_revoke_packet(auth_session):
    # create
    r = auth_session.post(f"{BASE_URL}/api/mobility/booking-packet",
                          json={"permission_level": "team"})
    token = r.json()["token"]
    # list
    lr = auth_session.get(f"{BASE_URL}/api/mobility/booking-packets")
    assert lr.status_code == 200
    items = lr.json()["items"]
    tokens = [i["token"] for i in items]
    assert token in tokens
    # metadata only (no payload)
    for it in items:
        assert "payload" not in it
    # revoke
    dr = auth_session.delete(f"{BASE_URL}/api/mobility/booking-packet/{token}")
    assert dr.status_code == 200
    # public GET -> 404
    pr = requests.get(f"{BASE_URL}/api/public/packet/{token}")
    assert pr.status_code == 404


# --- Regression ---
def test_regression_login():
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200


def test_regression_public_creator():
    r = requests.get(f"{BASE_URL}/api/public/creator/aaron")
    assert r.status_code == 200
    assert "identity" in r.json()


def test_regression_journey(auth_session):
    r = auth_session.get(f"{BASE_URL}/api/ancrid/journey")
    assert r.status_code == 200
    assert len(r.json()["chapters"]) == 4


def test_regression_sso_clients(auth_session):
    r = auth_session.get(f"{BASE_URL}/api/sso/clients")
    assert r.status_code == 200
    assert len(r.json()["items"]) >= 9
