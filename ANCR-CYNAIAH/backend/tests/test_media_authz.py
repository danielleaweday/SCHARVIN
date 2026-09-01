"""Iteration 13 — media endpoint auth hardening.

Covers:
  - GET /api/finish/video/{filename}
  - GET /api/generated/{filename}
  - GET /api/music-audio/{filename}

Verifies 401 (no token), 401 (bad token), 404 (unknown file w/ good token),
ownership scoping (owner 200 / stranger 404 / assigned faculty 200), and
path-traversal guards.
"""
import io
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip()
                break
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"

STUDENT_EMAIL = "student@cynaiah.demo"
FACULTY_EMAIL = "faculty@cynaiah.demo"
PASSWORD = "Cynaiah2026!"
NEON = "proj-mv-neon-heart"


# ------------ fixtures ------------
@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


def _login(s, email, password):
    r = s.post(f"{API}/auth/login", json={"email": email, "password": password}, timeout=30)
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture(scope="module")
def student_token(s):
    return _login(s, STUDENT_EMAIL, PASSWORD)


@pytest.fixture(scope="module")
def faculty_token(s):
    return _login(s, FACULTY_EMAIL, PASSWORD)


@pytest.fixture(scope="module")
def stranger_token(s):
    # Register a fresh 2nd student
    email = f"stranger_{uuid.uuid4().hex[:8]}@example.com"
    r = s.post(
        f"{API}/auth/register",
        json={"email": email, "password": "SecTest2026!", "name": "Stranger", "role": "student"},
        timeout=30,
    )
    assert r.status_code in (200, 201), r.text
    body = r.json()
    tok = body.get("access_token")
    if not tok:
        tok = _login(s, email, "SecTest2026!")
    return tok


def _h(tok):
    return {"Authorization": f"Bearer {tok}", "Content-Type": "application/json"}


# ------------ seed: upload a dummy video ------------
@pytest.fixture(scope="module")
def uploaded_version(s, student_token):
    # Create a fresh version for Neon Heart
    r = s.post(
        f"{API}/projects/{NEON}/finish/version",
        headers=_h(student_token),
        json={"title": f"TEST authz v{uuid.uuid4().hex[:6]}", "stage": "rough_cut"},
        timeout=30,
    )
    assert r.status_code == 200, r.text
    version = r.json()
    version_id = version["id"]

    # Upload dummy mp4 bytes (no encoder required — server just stores it)
    files = {"file": ("test.mp4", io.BytesIO(b"\x00\x00\x00\x18ftypmp42dummy-bytes"), "video/mp4")}
    up = requests.post(
        f"{API}/finish/version/{version_id}/upload",
        headers={"Authorization": f"Bearer {student_token}"},
        files=files,
        timeout=60,
    )
    assert up.status_code == 200, up.text
    updated = up.json()
    assert updated["video_url"].startswith("/api/finish/video/")
    filename = updated["video_url"].split("/")[-1]
    return {"version_id": version_id, "filename": filename}


# ------------ 1. Unauthenticated requests ------------
def test_video_no_auth_returns_401(s, uploaded_version):
    r = s.get(f"{API}/finish/video/{uploaded_version['filename']}", timeout=15)
    assert r.status_code == 401, r.text


def test_generated_no_auth_returns_401(s):
    r = s.get(f"{API}/generated/nonexistent.png", timeout=15)
    assert r.status_code == 401


def test_music_audio_no_auth_returns_401(s):
    r = s.get(f"{API}/music-audio/nonexistent.mp3", timeout=15)
    assert r.status_code == 401


# ------------ 2. Malformed / garbage tokens ------------
@pytest.mark.parametrize(
    "path",
    ["finish/video/x.mp4", "generated/x.png", "music-audio/x.mp3"],
)
def test_garbage_bearer_returns_401(s, path):
    r = s.get(
        f"{API}/{path}",
        headers={"Authorization": "Bearer this.is.not.a.jwt"},
        timeout=15,
    )
    assert r.status_code == 401
    body = r.text.lower()
    assert "invalid token" in body or "malformed" in body


@pytest.mark.parametrize(
    "path",
    ["finish/video/x.mp4", "generated/x.png", "music-audio/x.mp3"],
)
def test_garbage_query_token_returns_401(s, path):
    r = s.get(f"{API}/{path}?token=garbage", timeout=15)
    assert r.status_code == 401


# ------------ 3. Valid token but non-existent file → 404 ------------
def test_video_valid_token_missing_file_404(s, student_token):
    r = s.get(f"{API}/finish/video/does-not-exist.mp4", headers=_h(student_token), timeout=15)
    assert r.status_code == 404


def test_generated_valid_token_missing_file_404(s, student_token):
    r = s.get(f"{API}/generated/does-not-exist.png", headers=_h(student_token), timeout=15)
    assert r.status_code == 404


def test_music_audio_valid_token_missing_file_404(s, student_token):
    r = s.get(f"{API}/music-audio/does-not-exist.mp3", headers=_h(student_token), timeout=15)
    assert r.status_code == 404


# ------------ 4. Owner can fetch via bearer AND query token ------------
def test_video_owner_bearer_200(s, student_token, uploaded_version):
    r = s.get(
        f"{API}/finish/video/{uploaded_version['filename']}",
        headers={"Authorization": f"Bearer {student_token}"},
        timeout=30,
    )
    assert r.status_code == 200, r.text
    assert r.headers.get("content-type", "").startswith("video/")


def test_video_owner_query_token_200(s, student_token, uploaded_version):
    r = s.get(
        f"{API}/finish/video/{uploaded_version['filename']}?token={student_token}",
        timeout=30,
    )
    assert r.status_code == 200
    assert r.headers.get("content-type", "").startswith("video/")


# ------------ 5. Ownership: stranger student MUST get 404 ------------
def test_video_stranger_bearer_404(s, stranger_token, uploaded_version):
    r = s.get(
        f"{API}/finish/video/{uploaded_version['filename']}",
        headers=_h(stranger_token),
        timeout=15,
    )
    assert r.status_code == 404
    # Also verify no body leak
    assert b"ftyp" not in r.content


def test_video_stranger_query_token_404(s, stranger_token, uploaded_version):
    r = s.get(
        f"{API}/finish/video/{uploaded_version['filename']}?token={stranger_token}",
        timeout=15,
    )
    assert r.status_code == 404


# ------------ 6. Assigned faculty can fetch ------------
def test_video_faculty_query_token_200(s, faculty_token, uploaded_version):
    r = s.get(
        f"{API}/finish/video/{uploaded_version['filename']}?token={faculty_token}",
        timeout=30,
    )
    assert r.status_code == 200


# ------------ 7. Ownership on /generated (AI image saved as project asset) ------------
@pytest.fixture(scope="module")
def neon_frame_filename(s, student_token):
    # Self-seed: POST /api/ai/image with project_id → saved as asset,
    # image lands on disk at GENERATED_DIR/<filename> AND creates a db.assets row
    # tying that filename to project_id (via file_path regex match).
    r = s.post(
        f"{API}/ai/image",
        headers=_h(student_token),
        json={
            "prompt": "TEST authz seed — moody neon alley concept",
            "save_as_asset": True,
            "project_id": NEON,
        },
        timeout=180,
    )
    if r.status_code != 200:
        pytest.skip(f"/ai/image seed failed: {r.status_code} {r.text[:200]}")
    body = r.json()
    fn = body.get("filename") or (body.get("url") or "").split("/")[-1]
    if not fn:
        pytest.skip("ai/image returned no filename")
    return fn


def test_generated_owner_200(s, student_token, neon_frame_filename):
    r = s.get(f"{API}/generated/{neon_frame_filename}", headers=_h(student_token), timeout=30)
    assert r.status_code == 200
    assert r.headers.get("content-type", "").startswith("image/")


def test_generated_stranger_404(s, stranger_token, neon_frame_filename):
    r = s.get(f"{API}/generated/{neon_frame_filename}", headers=_h(stranger_token), timeout=15)
    assert r.status_code == 404


def test_generated_faculty_200(s, faculty_token, neon_frame_filename):
    r = s.get(
        f"{API}/generated/{neon_frame_filename}?token={faculty_token}",
        timeout=30,
    )
    assert r.status_code == 200


# ------------ 8. Ownership on /music-audio ------------
@pytest.fixture(scope="module")
def neon_music_filename(s, student_token):
    # Self-seed via /projects/{id}/music/upload (owner is demo-student-001)
    files = {"file": ("test.mp3", io.BytesIO(b"ID3\x03\x00\x00\x00\x00\x00\x00dummy-mp3"), "audio/mpeg")}
    up = requests.post(
        f"{API}/projects/{NEON}/music/upload",
        headers={"Authorization": f"Bearer {student_token}"},
        files=files,
        timeout=60,
    )
    if up.status_code != 200:
        pytest.skip(f"music upload seed failed: {up.status_code} {up.text[:200]}")
    body = up.json()
    url = body.get("music_url") or body.get("audio_url") or ""
    if not url.startswith("/api/music-audio/"):
        pytest.skip(f"music upload did not return a /api/music-audio/ url: {url}")
    return url.split("/")[-1]


def test_music_audio_owner_200(s, student_token, neon_music_filename):
    r = s.get(f"{API}/music-audio/{neon_music_filename}", headers=_h(student_token), timeout=30)
    assert r.status_code == 200


def test_music_audio_stranger_404(s, stranger_token, neon_music_filename):
    r = s.get(f"{API}/music-audio/{neon_music_filename}", headers=_h(stranger_token), timeout=15)
    assert r.status_code == 404


# ------------ 9. Path traversal guards ------------
@pytest.mark.parametrize(
    "path",
    [
        "generated/..%2F..%2Fetc%2Fpasswd",
        "music-audio/..%2Fsecret",
        "finish/video/..%2F..%2Fetc%2Fpasswd",
    ],
)
def test_path_traversal_blocked(s, student_token, path):
    # With auth, path-traversal guard should return 400 or 404, never 200
    r = s.get(f"{API}/{path}", headers=_h(student_token), timeout=15)
    assert r.status_code in (400, 401, 404), r.status_code
    # Never leak /etc/passwd content
    assert b"root:x:" not in r.content


# ------------ 10. Edit & Finish endpoint smoke ------------
def test_finish_version_create(s, student_token):
    r = s.post(
        f"{API}/projects/{NEON}/finish/version",
        headers=_h(student_token),
        json={"title": f"TEST smoke {uuid.uuid4().hex[:6]}", "stage": "rough_cut"},
        timeout=30,
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["stage"] == "rough_cut"
    assert body["project_id"] == NEON


def test_faculty_approve_rough_cut(s, student_token, faculty_token):
    # Create rough_cut version as student
    r = s.post(
        f"{API}/projects/{NEON}/finish/version",
        headers=_h(student_token),
        json={"title": f"TEST rough {uuid.uuid4().hex[:6]}", "stage": "rough_cut"},
        timeout=30,
    )
    assert r.status_code == 200, r.text
    vid = r.json()["id"]

    # Faculty approves — no gate on rough_cut
    ap = s.post(
        f"{API}/finish/version/{vid}/approve",
        headers=_h(faculty_token),
        json={"approval_status": "approved", "message": "LGTM"},
        timeout=30,
    )
    assert ap.status_code == 200, ap.text
    assert ap.json()["approval_status"] == "approved"


def test_faculty_final_approval_blocked_by_gate(s, student_token, faculty_token):
    # Create final-stage version — should trigger gate on approve
    r = s.post(
        f"{API}/projects/{NEON}/finish/version",
        headers=_h(student_token),
        json={"title": f"TEST final {uuid.uuid4().hex[:6]}", "stage": "final"},
        timeout=30,
    )
    assert r.status_code == 200, r.text
    vid = r.json()["id"]

    ap = s.post(
        f"{API}/finish/version/{vid}/approve",
        headers=_h(faculty_token),
        json={"approval_status": "approved", "message": "ship it"},
        timeout=30,
    )
    # Expected to be blocked because rights/accessibility/delivery likely incomplete
    assert ap.status_code == 400, f"expected 400, got {ap.status_code}: {ap.text}"
    assert "Final approval blocked" in ap.text
