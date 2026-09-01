"""Iteration 9 — Admin bootstrap hardening tests.

Covers:
  - GET /api/environment public posture signal (demo mode, no secret leak)
  - Demo mode WARN log emitted at seed time + login works with demo admin
  - Production mode + demo credentials → refusal (ERROR log, no user)
  - Production mode + real strong credentials → new platform_admin created
  - Production mode without env vars → no user, INFO log
  - Idempotency: second _ensure_admin_user call is a no-op
  - Regression: elevated-registration via demo admin token still works
"""
from __future__ import annotations

import asyncio
import logging
import os
import sys
import uuid
from pathlib import Path

import pytest
import requests
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

BACKEND_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BACKEND_DIR / ".env")
sys.path.insert(0, str(BACKEND_DIR))

# Resolve BASE_URL from frontend .env (public URL)
BASE_URL = None
fe_env = BACKEND_DIR.parent / "frontend" / ".env"
if fe_env.exists():
    for line in fe_env.read_text().splitlines():
        if line.startswith("REACT_APP_BACKEND_URL="):
            BASE_URL = line.split("=", 1)[1].strip().strip('"').rstrip("/")
            break
assert BASE_URL, "REACT_APP_BACKEND_URL not found"

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]

from seed_data import (  # noqa: E402
    _ensure_admin_user,
    DEMO_ADMIN_EMAIL,
    DEMO_ADMIN_PASSWORD,
)
from auth import verify_password  # noqa: E402


def _run(coro):
    """Run a coroutine on a fresh event loop; creates new Motor client per call."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


async def _with_scratch_db(suffix, fn):
    client = AsyncIOMotorClient(MONGO_URL)
    scratch_name = f"{DB_NAME}_iter9_{suffix}"
    try:
        result = await fn(client[scratch_name])
        return result
    finally:
        await client.drop_database(scratch_name)
        client.close()


# ---------- /api/environment ----------

class TestEnvironmentEndpoint:
    def test_environment_no_auth_returns_posture(self):
        r = requests.get(f"{BASE_URL}/api/environment", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert data["env"] == "demo"
        assert data["is_demo"] is True
        assert data["demo_admin_active"] is True
        assert data["admin_bootstrap_via_env"] is False

    def test_environment_only_has_documented_keys(self):
        r = requests.get(f"{BASE_URL}/api/environment", timeout=10)
        data = r.json()
        assert set(data.keys()) == {
            "env",
            "is_demo",
            "demo_admin_active",
            "admin_bootstrap_via_env",
        }

    def test_environment_leaks_no_secrets(self):
        r = requests.get(f"{BASE_URL}/api/environment", timeout=10)
        body = r.text.lower()
        for forbidden in [
            "cynaiah2026",
            "jwt_secret",
            "password",
            "admin_email",
            "sk-emergent",
            "mongodb",
        ]:
            assert forbidden not in body, f"Leak of {forbidden!r} in /environment"


# ---------- Demo mode contract ----------

class TestDemoModeContract:
    def test_demo_admin_login_succeeds(self):
        r = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": DEMO_ADMIN_EMAIL, "password": DEMO_ADMIN_PASSWORD},
            timeout=15,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["user"]["role"] == "platform_admin"
        assert data["user"]["email"] == DEMO_ADMIN_EMAIL

    def test_demo_warning_log_emitted_on_seed(self, monkeypatch, caplog):
        """Force a fresh demo-admin seed against a scratch DB and assert WARN."""

        async def _run_it(scratch_db):
            with caplog.at_level(logging.WARNING, logger="cynaiah"):
                await _ensure_admin_user(scratch_db)
            joined = " ".join(rec.message for rec in caplog.records)
            assert "demo mode — seeding admin@cynaiah.demo" in joined, (
                f"Expected demo-mode WARN log, got: {joined!r}"
            )
            # And demo admin must exist in scratch db
            user = await scratch_db.users.find_one({"email": DEMO_ADMIN_EMAIL})
            assert user is not None

        monkeypatch.setenv("CYNAIAH_ENV", "demo")
        monkeypatch.delenv("ADMIN_EMAIL", raising=False)
        monkeypatch.delenv("ADMIN_PASSWORD", raising=False)
        _run(_with_scratch_db("demo_warn", _run_it))


# ---------- Production mode with _ensure_admin_user (direct) ----------

class TestProductionRefusesDemoCreds:
    def test_prod_with_demo_creds_refused(self, monkeypatch, caplog):
        async def _run_it(scratch_db):
            with caplog.at_level(logging.ERROR, logger="cynaiah"):
                await _ensure_admin_user(scratch_db)
            count = await scratch_db.users.count_documents({})
            assert count == 0, "Refused prod bootstrap must not insert any user"
            joined = " ".join(rec.message for rec in caplog.records).lower()
            assert "refusing to bootstrap admin in production" in joined, (
                f"Expected refusal error log, got: {joined!r}"
            )

        monkeypatch.setenv("CYNAIAH_ENV", "production")
        monkeypatch.setenv("ADMIN_EMAIL", DEMO_ADMIN_EMAIL)
        monkeypatch.setenv("ADMIN_PASSWORD", DEMO_ADMIN_PASSWORD)
        _run(_with_scratch_db("prod_demo_refuse", _run_it))


class TestProductionRealBootstrap:
    def test_prod_with_real_creds_creates_admin(self, monkeypatch):
        async def _run_it(scratch_db):
            await _ensure_admin_user(scratch_db)

            user = await scratch_db.users.find_one({"email": "ops@example.com"})
            assert user is not None, "Prod bootstrap should have created admin"
            assert user["role"] == "platform_admin"
            assert user["name"] == "Ops Admin"
            assert user["id"] != "demo-admin-001"
            assert verify_password("OpsStrong!2026", user["password_hash"])

            # Idempotency — second call must not duplicate
            await _ensure_admin_user(scratch_db)
            count = await scratch_db.users.count_documents({"email": "ops@example.com"})
            assert count == 1

        monkeypatch.setenv("CYNAIAH_ENV", "production")
        monkeypatch.setenv("ADMIN_EMAIL", "ops@example.com")
        monkeypatch.setenv("ADMIN_PASSWORD", "OpsStrong!2026")
        monkeypatch.setenv("ADMIN_NAME", "Ops Admin")
        _run(_with_scratch_db("prod_real", _run_it))


class TestProductionMissingEnvVars:
    def test_prod_no_env_vars_skips_bootstrap(self, monkeypatch, caplog):
        async def _run_it(scratch_db):
            with caplog.at_level(logging.INFO, logger="cynaiah"):
                await _ensure_admin_user(scratch_db)
            count = await scratch_db.users.count_documents({})
            assert count == 0, "No admin should be created in prod without env"
            joined = " ".join(rec.message for rec in caplog.records).lower()
            assert (
                "admin bootstrap skipped" in joined
                or "no admin_email" in joined
            ), f"Expected info log about skipped bootstrap; got: {joined!r}"

        monkeypatch.setenv("CYNAIAH_ENV", "production")
        monkeypatch.delenv("ADMIN_EMAIL", raising=False)
        monkeypatch.delenv("ADMIN_PASSWORD", raising=False)
        _run(_with_scratch_db("prod_missing", _run_it))


class TestDemoModeIdempotency:
    def test_demo_mode_idempotent(self, monkeypatch):
        async def _run_it(scratch_db):
            await _ensure_admin_user(scratch_db)
            await _ensure_admin_user(scratch_db)
            count = await scratch_db.users.count_documents({"email": DEMO_ADMIN_EMAIL})
            assert count == 1, "Demo admin must be seeded exactly once"
            user = await scratch_db.users.find_one({"email": DEMO_ADMIN_EMAIL})
            assert user["id"] == "demo-admin-001"
            assert user["role"] == "platform_admin"
            assert verify_password(DEMO_ADMIN_PASSWORD, user["password_hash"])

        monkeypatch.setenv("CYNAIAH_ENV", "demo")
        monkeypatch.delenv("ADMIN_EMAIL", raising=False)
        monkeypatch.delenv("ADMIN_PASSWORD", raising=False)
        _run(_with_scratch_db("demo_idem", _run_it))


# ---------- Regression: elevated registration path ----------

class TestElevatedRegistrationRegression:
    def _login_admin(self):
        r = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": DEMO_ADMIN_EMAIL, "password": DEMO_ADMIN_PASSWORD},
            timeout=15,
        )
        assert r.status_code == 200, r.text
        return r.json()["access_token"]

    def test_register_faculty_with_admin_token_succeeds(self):
        token = self._login_admin()
        email = f"test_iter9_faculty_{uuid.uuid4().hex[:8]}@example.com"
        try:
            r = requests.post(
                f"{BASE_URL}/api/auth/register",
                headers={"Authorization": f"Bearer {token}"},
                json={
                    "email": email,
                    "password": "FacultyStr0ng!Pass",
                    "name": "Iter9 Faculty",
                    "role": "faculty",
                },
                timeout=15,
            )
            assert r.status_code == 200, r.text
            assert r.json()["user"]["role"] == "faculty"
        finally:
            async def _cleanup():
                client = AsyncIOMotorClient(MONGO_URL)
                await client[DB_NAME].users.delete_one({"email": email})
                client.close()
            _run(_cleanup())

    def test_register_faculty_without_token_forbidden(self):
        email = f"test_iter9_denied_{uuid.uuid4().hex[:8]}@example.com"
        r = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": email,
                "password": "FacultyStr0ng!Pass",
                "name": "Denied",
                "role": "faculty",
            },
            timeout=15,
        )
        assert r.status_code == 403
