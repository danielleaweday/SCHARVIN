"""COHEIR™ v1.1 backend tests — uploads, share kits, providers, analytics, alumni."""
import io
import os
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"

STUDENT = {"email": "danielle.mcmillan@ccdp.edu", "password": "demo1234"}
ADMIN = {"email": "admin.president@ccdp.edu", "password": "demo1234"}


def _login(email, password):
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": email, "password": password}, timeout=15)
    assert r.status_code == 200, r.text
    tok = r.json()["session_token"]
    s.headers.update({"Authorization": f"Bearer {tok}"})
    return s, r.json()["user"]


@pytest.fixture(scope="module")
def student_client():
    return _login(**STUDENT)


@pytest.fixture(scope="module")
def admin_client():
    return _login(**ADMIN)


# ── Providers ─────────────────────────────────────────────────────────
def test_video_providers(student_client):
    s, _ = student_client
    r = s.get(f"{API}/providers/video", timeout=15)
    assert r.status_code == 200
    providers = r.json()
    assert isinstance(providers, list)
    assert len(providers) == 7
    ids = {p["id"] for p in providers}
    assert ids == {"zoom", "google_meet", "microsoft_teams", "cisco_webex",
                   "riverside", "streamyard", "ancr_video"}
    for p in providers:
        assert "connected" in p
        assert "name" in p


def test_calendar_providers(student_client):
    s, _ = student_client
    r = s.get(f"{API}/providers/calendar", timeout=15)
    assert r.status_code == 200
    providers = r.json()
    assert len(providers) == 5
    ids = {p["id"] for p in providers}
    assert ids == {"google", "outlook", "apple", "calendly", "university"}


def test_provider_request_connection(student_client):
    s, _ = student_client
    r = s.post(f"{API}/providers/request-connection",
               json={"provider_id": "zoom", "kind": "video", "email_note": "TEST_ note"},
               timeout=15)
    assert r.status_code == 200
    body = r.json()
    assert body["provider_id"] == "zoom"
    assert body["status"] == "pending"


# ── Uploads ────────────────────────────────────────────────────────────
def test_upload_rejects_txt(student_client):
    s, _ = student_client
    files = {"file": ("test.txt", b"hello world", "text/plain")}
    r = s.post(f"{API}/uploads", files=files, data={"category": "document", "visibility": "private"}, timeout=30)
    assert r.status_code == 415


def test_upload_png_or_503(student_client):
    """Accepts a valid image OR returns 503 if storage unavailable."""
    s, _ = student_client
    # minimal 1x1 png bytes
    png = (b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
           b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xf8"
           b"\xcf\xc0\x00\x00\x00\x03\x00\x01^\xf3*:\x00\x00\x00\x00IEND\xaeB`\x82")
    files = {"file": ("smoke.png", png, "image/png")}
    r = s.post(f"{API}/uploads", files=files, data={"category": "artwork", "visibility": "public"}, timeout=60)
    assert r.status_code in (200, 503), r.text
    if r.status_code == 200:
        body = r.json()
        assert body["extension"] == "png"
        assert "id" in body and "storage_path" in body
        # cleanup — soft delete
        s.delete(f"{API}/uploads/file/{body['id']}", timeout=15)


def test_uploads_mine(student_client):
    s, _ = student_client
    r = s.get(f"{API}/uploads/mine", timeout=15)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


# ── Share Kits ─────────────────────────────────────────────────────────
def test_create_share_kit_self(student_client):
    s, user = student_client
    r = s.post(f"{API}/share/kits",
               json={"subject_user_id": user["user_id"], "kind": "student_profile",
                     "expires_days": 30},
               timeout=15)
    assert r.status_code == 200, r.text
    kit = r.json()
    assert "slug" in kit and "id" in kit
    assert kit["kind"] == "student_profile"
    assert kit["revoked"] is False

    slug = kit["slug"]
    kit_id = kit["id"]

    # Public view WITHOUT auth
    anon = requests.Session()
    pub = anon.get(f"{API}/share/public/{slug}", timeout=15)
    assert pub.status_code == 200, pub.text
    body = pub.json()
    assert body["subject"]["user_id"] == user["user_id"]
    assert body["kind_label"]

    # kits/mine lists it
    m = s.get(f"{API}/share/kits/mine", timeout=15)
    assert m.status_code == 200
    assert any(k["id"] == kit_id for k in m.json())

    # revoke
    rev = s.post(f"{API}/share/kits/{kit_id}/revoke", timeout=15)
    assert rev.status_code == 200

    # public now 404
    pub2 = anon.get(f"{API}/share/public/{slug}", timeout=15)
    assert pub2.status_code == 404


def test_share_kit_bad_kind(student_client):
    s, user = student_client
    r = s.post(f"{API}/share/kits",
               json={"subject_user_id": user["user_id"], "kind": "invalid_kind"},
               timeout=15)
    assert r.status_code == 400


def test_share_public_nonexistent():
    r = requests.get(f"{API}/share/public/nonexistent-slug-xyz-999", timeout=15)
    assert r.status_code == 404


def test_share_public_no_auth_required():
    """Ensure the public endpoint doesn't require auth (even if slug unknown, still 404 not 401)."""
    r = requests.get(f"{API}/share/public/creator-launch-20", timeout=15)
    assert r.status_code in (200, 404), r.text


# ── Analytics ──────────────────────────────────────────────────────────
def test_institution_analytics(admin_client):
    s, _ = admin_client
    r = s.get(f"{API}/analytics/institution", timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    expected_keys = {
        "mentor_engagement", "student_engagement", "creative_output",
        "portfolio_completion", "industry_participation", "session_attendance",
        "review_activity", "career_readiness", "graduation_readiness",
        "placement", "employer_activity", "alumni_engagement", "totals",
    }
    assert expected_keys.issubset(data.keys()), f"missing: {expected_keys - set(data.keys())}"

    totals = data["totals"]
    for k in ("students", "professionals", "cohorts", "sessions", "reviews",
              "recommendations", "opportunities", "portfolio_files"):
        assert k in totals
    assert totals["students"] > 0
    assert totals["professionals"] > 0


# ── Alumni ─────────────────────────────────────────────────────────────
def test_alumni_in_professionals(student_client):
    s, _ = student_client
    r = s.get(f"{API}/professionals", timeout=15)
    assert r.status_code == 200
    pros = r.json()
    names = {p["name"] for p in pros}
    # Jordan Blake and Priya Desai should be in the seeded professionals list
    assert "Jordan Blake" in names or any(p.get("is_alumni") for p in pros)
