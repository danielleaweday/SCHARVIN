"""Iteration 2: public creator pages, file uploads, SSO handshake."""
import io
import os
import struct
import time
import zlib
import pytest
import requests
import jwt

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://digital-identity-128.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "aaron@ancr.io"
ADMIN_PASSWORD = "ancrid2026"

# Load JWT secret from backend .env for token decode verification
JWT_SECRET = None
with open("/app/backend/.env") as f:
    for line in f:
        if line.startswith("JWT_SECRET="):
            JWT_SECRET = line.split("=", 1)[1].strip().strip('"')


def _tiny_png() -> bytes:
    # Minimal valid 1x1 PNG
    sig = b"\x89PNG\r\n\x1a\n"
    def chunk(t, d):
        return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xffffffff)
    ihdr = struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0)
    raw = b"\x00\xff\x00\x00"
    idat = zlib.compress(raw)
    return sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")


@pytest.fixture(scope="module")
def auth_session():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200
    return s


# ---------- Public creator page ----------
def test_public_creator_aaron():
    r = requests.get(f"{BASE_URL}/api/public/creator/aaron")
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["professional_name"] == "Aaron Ellington"
    assert d["handle"] == "aaron"
    assert d["identity"]["ancrid_number"] == "ANCRID-2026-0001"
    assert d["identity"]["creator_passport_id"] == "CPX-8842-INHR"
    assert isinstance(d["portfolio"], list) and len(d["portfolio"]) > 0
    assert isinstance(d["timeline"], list) and len(d["timeline"]) > 0
    assert isinstance(d["skills"], list) and len(d["skills"]) > 0
    assert isinstance(d["credentials"], list) and len(d["credentials"]) > 0


def test_public_creator_unknown_returns_404():
    r = requests.get(f"{BASE_URL}/api/public/creator/nonexistent_xyz_123")
    assert r.status_code == 404


# ---------- File uploads ----------
def test_upload_unauth_401():
    files = {"file": ("t.png", _tiny_png(), "image/png")}
    r = requests.post(f"{BASE_URL}/api/files/upload", files=files)
    assert r.status_code == 401


def test_upload_reject_non_image(auth_session):
    files = {"file": ("bad.txt", b"hello", "text/plain")}
    r = auth_session.post(f"{BASE_URL}/api/files/upload", files=files)
    assert r.status_code == 400


def test_upload_reject_oversize(auth_session):
    # 9MB fake png data
    data = b"\x89PNG\r\n\x1a\n" + b"0" * (9 * 1024 * 1024)
    files = {"file": ("big.png", data, "image/png")}
    r = auth_session.post(f"{BASE_URL}/api/files/upload", files=files)
    assert r.status_code == 400


def test_upload_and_fetch(auth_session):
    png = _tiny_png()
    files = {"file": ("t.png", png, "image/png")}
    r = auth_session.post(f"{BASE_URL}/api/files/upload", files=files)
    assert r.status_code == 200, r.text
    d = r.json()
    assert set(d.keys()) >= {"id", "url", "content_type", "size"}
    assert d["content_type"] == "image/png"
    assert d["url"].startswith("/api/files/")
    # Fetch back
    fr = requests.get(f"{BASE_URL}/api/files/{d['id']}")
    assert fr.status_code == 200
    assert fr.headers.get("content-type", "").startswith("image/png")
    assert len(fr.content) > 0


# ---------- SSO ----------
def test_sso_clients_list():
    r = requests.get(f"{BASE_URL}/api/sso/clients")
    assert r.status_code == 200
    items = r.json()["items"]
    ids = {i["client_id"] for i in items}
    expected = {"ANCRA", "ANCRLAB", "ANCRSync", "INHEIRA", "Vaulta", "Passport",
                "ANCRLaunch", "ANCRVIEW", "ANCRWAV"}
    assert ids == expected
    for it in items:
        assert it["name"] and it["purpose"] and it["scope"]


def test_sso_authorize_and_verify(auth_session):
    r = auth_session.post(f"{BASE_URL}/api/sso/authorize", json={"client_id": "ANCRLAB"})
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["token_type"] == "Bearer"
    assert d["client_id"] == "ANCRLAB"
    assert d["expires_in"] > 0
    assert d["scope"]
    token = d["id_token"]
    # Decode with JWT secret
    claims = jwt.decode(token, JWT_SECRET, algorithms=["HS256"], options={"verify_aud": False})
    assert claims["iss"] == "ancrid"
    assert claims["aud"] == "ANCRLAB"
    assert claims["type"] == "sso"
    assert claims["handle"] == "aaron"
    assert claims["email"] == ADMIN_EMAIL
    assert claims["verified"] is True
    assert claims["ancrid"]

    # Verify endpoint
    v = requests.post(f"{BASE_URL}/api/sso/verify", json={"token": token})
    assert v.status_code == 200
    vd = v.json()
    assert vd["ok"] is True
    assert vd["claims"]["aud"] == "ANCRLAB"


def test_sso_verify_invalid():
    r = requests.post(f"{BASE_URL}/api/sso/verify", json={"token": "not.a.token"})
    assert r.status_code == 401


def test_sso_authorize_unauth():
    r = requests.post(f"{BASE_URL}/api/sso/authorize", json={"client_id": "ANCRLAB"})
    assert r.status_code == 401


def test_sso_authorize_unknown_client(auth_session):
    r = auth_session.post(f"{BASE_URL}/api/sso/authorize", json={"client_id": "NOPE"})
    assert r.status_code == 400


# ---------- Regression: signup returns unique handle & ANCRID ----------
def test_signup_returns_handle_and_ancrid():
    ts = int(time.time() * 1000)
    email = f"test_h_{ts}@ancr.io"
    r = requests.post(f"{BASE_URL}/api/auth/register", json={
        "email": email, "password": "testpass123",
        "professional_name": f"Test User {ts}",
    })
    assert r.status_code == 200, r.text
    d = r.json()
    assert d.get("handle")
    assert d["handle"] != "aaron"
    assert d["identity"]["ancrid_number"].startswith("ANCRID-2026-")
