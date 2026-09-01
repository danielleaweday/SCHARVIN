"""Iteration 7 — security hardening tests for the auth layer.

Covers:
  - Password strength floor on /api/auth/register
  - Role-escalation gate (public callers can only self-assign student/collaborator)
  - Admin-token allows creating elevated roles (faculty, etc.)
  - Non-admin token cannot create elevated accounts
  - /api/seed requires platform_admin
  - Login brute-force lockout (8 fails → 429), per-identifier isolation
  - Legitimate login clears counter
  - No user-enumeration in login error messages
  - Existing bcrypt hashes remain valid for seeded creds
"""
from __future__ import annotations

import asyncio
import os
import uuid
from pathlib import Path

import pytest
import requests
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# Load backend env for direct DB access (fast-forward lockouts between tests)
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if os.environ.get("REACT_APP_BACKEND_URL") else None
if not BASE_URL:
    # Fallback: read from frontend/.env
    fe_env = Path(__file__).resolve().parents[2] / "frontend" / ".env"
    if fe_env.exists():
        for line in fe_env.read_text().splitlines():
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().strip('"').rstrip("/")
                break
assert BASE_URL, "REACT_APP_BACKEND_URL not found"

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]

TEST_EMAIL_DOMAIN = "cynaiah-test.example.com"
STUDENT_EMAIL = "student@cynaiah.demo"
FACULTY_EMAIL = "faculty@cynaiah.demo"
ADMIN_EMAIL = "admin@cynaiah.demo"
DEMO_PASSWORD = "Cynaiah2026!"


# ---------- fixtures ----------
@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def db():
    client = AsyncIOMotorClient(MONGO_URL)
    return client[DB_NAME]


async def _reset_login_attempts(db, email: str | None = None):
    if email:
        await db.login_attempts.delete_many({"identifier": {"$regex": f":{email.lower()}$"}})
    else:
        await db.login_attempts.delete_many({})


@pytest.fixture(autouse=True)
def clear_lockouts(db):
    """Clear login_attempts before every test so lockouts don't bleed across."""
    asyncio.get_event_loop().run_until_complete(_reset_login_attempts(db))
    yield


def _login(api, email, password):
    return api.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": password})


@pytest.fixture(scope="module")
def admin_token(api):
    # Ensure demo seed exists via a login attempt with correct creds
    r = _login(api, ADMIN_EMAIL, DEMO_PASSWORD)
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    return r.json()["access_token"]


@pytest.fixture(scope="module")
def student_token(api):
    r = _login(api, STUDENT_EMAIL, DEMO_PASSWORD)
    assert r.status_code == 200, f"student login failed: {r.status_code} {r.text}"
    return r.json()["access_token"]


# ---------- password strength ----------
class TestPasswordStrength:
    def _reg(self, api, password, role="student", **extra):
        return api.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": f"TEST_pw_{uuid.uuid4().hex[:8]}@cynaiah-test.example.com",
                "password": password,
                "name": "PW Test",
                "role": role,
                **extra,
            },
        )

    def test_too_short(self, api):
        r = self._reg(api, "short")
        assert r.status_code == 400, r.text
        assert "at least 8" in r.text.lower()

    def test_no_letter(self, api):
        r = self._reg(api, "12345678")
        assert r.status_code == 400
        assert "letter" in r.text.lower()

    def test_no_digit(self, api):
        r = self._reg(api, "abcdefgh")
        assert r.status_code == 400
        assert "number" in r.text.lower() or "digit" in r.text.lower()

    def test_valid_password_registers(self, api):
        r = self._reg(api, "Cynaiah2026!")
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["user"]["role"] == "student"
        assert data["access_token"]


# ---------- role escalation ----------
class TestRoleEscalation:
    def _reg(self, api, role, token=None):
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        return api.post(
            f"{BASE_URL}/api/auth/register",
            headers=headers,
            json={
                "email": f"TEST_role_{role}_{uuid.uuid4().hex[:8]}@cynaiah-test.example.com",
                "password": "Cynaiah2026!",
                "name": f"Test {role}",
                "role": role,
            },
        )

    @pytest.mark.parametrize("role", ["faculty", "mentor", "institutional_admin", "platform_admin"])
    def test_public_blocked_for_elevated_role(self, api, role):
        r = self._reg(api, role)
        assert r.status_code == 403, f"expected 403 got {r.status_code}: {r.text}"
        detail = r.text.lower()
        assert "admin" in detail or "elevated" in detail

    @pytest.mark.parametrize("role", ["student", "collaborator"])
    def test_public_allowed_for_self_register_roles(self, api, role):
        r = self._reg(api, role)
        assert r.status_code == 200, r.text
        assert r.json()["user"]["role"] == role

    def test_admin_can_create_faculty(self, api, admin_token):
        r = self._reg(api, "faculty", token=admin_token)
        assert r.status_code == 200, r.text
        assert r.json()["user"]["role"] == "faculty"

    def test_student_token_cannot_create_faculty(self, api, student_token):
        r = self._reg(api, "faculty", token=student_token)
        assert r.status_code == 403, r.text


# ---------- seed guard ----------
class TestSeedGuard:
    def test_seed_no_token_401(self, api):
        r = api.post(f"{BASE_URL}/api/seed")
        assert r.status_code == 401, r.text

    def test_seed_student_token_403(self, api, student_token):
        r = api.post(
            f"{BASE_URL}/api/seed",
            headers={"Authorization": f"Bearer {student_token}"},
        )
        assert r.status_code == 403, r.text

    def test_seed_admin_token_200(self, api, admin_token):
        r = api.post(
            f"{BASE_URL}/api/seed",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert "demo_email" in data


# ---------- login brute force ----------
class TestBruteForceLockout:
    def test_lockout_after_8_fails(self, api, db):
        asyncio.get_event_loop().run_until_complete(_reset_login_attempts(db, STUDENT_EMAIL))
        # 8 failed attempts
        for i in range(8):
            r = _login(api, STUDENT_EMAIL, "WrongPassword123!")
            assert r.status_code == 401, f"attempt {i+1}: {r.status_code} {r.text}"
        # 9th attempt with wrong password → 429
        r = _login(api, STUDENT_EMAIL, "WrongPassword123!")
        assert r.status_code == 429, r.text
        assert "try again" in r.text.lower()
        # Even correct password → still 429 within window
        r = _login(api, STUDENT_EMAIL, DEMO_PASSWORD)
        assert r.status_code == 429, r.text

    def test_lockout_is_per_identifier(self, api, db):
        # Force lockout on student
        asyncio.get_event_loop().run_until_complete(_reset_login_attempts(db))
        for _ in range(9):
            _login(api, STUDENT_EMAIL, "WrongPassword123!")
        r = _login(api, STUDENT_EMAIL, DEMO_PASSWORD)
        assert r.status_code == 429
        # Faculty and admin still work from same IP
        r_f = _login(api, FACULTY_EMAIL, DEMO_PASSWORD)
        assert r_f.status_code == 200, r_f.text
        r_a = _login(api, ADMIN_EMAIL, DEMO_PASSWORD)
        assert r_a.status_code == 200, r_a.text

    def test_lockout_clears_after_reset_and_next_login_success(self, api, db):
        # Lock out
        for _ in range(9):
            _login(api, STUDENT_EMAIL, "WrongPassword123!")
        # Fast-forward: manually clear
        asyncio.get_event_loop().run_until_complete(_reset_login_attempts(db, STUDENT_EMAIL))
        # Next legitimate login succeeds
        r = _login(api, STUDENT_EMAIL, DEMO_PASSWORD)
        assert r.status_code == 200, r.text
        # A fresh failed attempt starts a new counter (not immediate 429)
        r = _login(api, STUDENT_EMAIL, "WrongPassword123!")
        assert r.status_code == 401, r.text


# ---------- existing behaviour preserved ----------
class TestAuthRegression:
    @pytest.mark.parametrize("email", [STUDENT_EMAIL, FACULTY_EMAIL, ADMIN_EMAIL])
    def test_seeded_login_still_works(self, api, email):
        r = _login(api, email, DEMO_PASSWORD)
        assert r.status_code == 200, r.text
        assert r.json()["user"]["email"] == email

    @pytest.mark.parametrize("email,expected_role", [
        (STUDENT_EMAIL, "student"),
        (FACULTY_EMAIL, "faculty"),
        (ADMIN_EMAIL, "platform_admin"),
    ])
    def test_me_endpoint_works(self, api, email, expected_role):
        tok = _login(api, email, DEMO_PASSWORD).json()["access_token"]
        r = api.get(f"{BASE_URL}/api/auth/me", headers={"Authorization": f"Bearer {tok}"})
        assert r.status_code == 200
        assert r.json()["role"] == expected_role

    def test_wrong_password_valid_email_no_leak(self, api):
        r = _login(api, STUDENT_EMAIL, "WrongPassword123!")
        assert r.status_code == 401
        body = r.json()
        detail = (body.get("detail") or "").lower()
        assert detail == "invalid credentials"
        # No role or email leaked
        assert "student" not in detail
        assert STUDENT_EMAIL.split("@")[0] not in detail

    def test_wrong_email_same_detail_no_enumeration(self, api):
        r_valid = _login(api, STUDENT_EMAIL, "WrongPassword123!")
        r_unknown = _login(api, f"nope_{uuid.uuid4().hex}@cynaiah-test.example.com", "WrongPassword123!")
        assert r_valid.status_code == r_unknown.status_code == 401
        assert r_valid.json().get("detail") == r_unknown.json().get("detail") == "Invalid credentials"


# ---------- ANCR regression (light) ----------
class TestAncrRegression:
    def test_link_registry(self, api, student_token):
        r = api.get(
            f"{BASE_URL}/api/notifications/link-registry",
            headers={"Authorization": f"Bearer {student_token}"},
        )
        # Public route per code — no auth required, but header shouldn't hurt
        assert r.status_code == 200, r.text
        data = r.json()
        assert len(data["links"]) == 6
        assert len(data["event_types"]) == 6

    def test_resolve_link_unknown_404(self, api, student_token):
        r = api.post(
            f"{BASE_URL}/api/notifications/resolve-link",
            headers={"Authorization": f"Bearer {student_token}"},
            json={"deep_link": "/totally/made/up"},
        )
        assert r.status_code == 404
