"""Iteration 14 — Edit & Finish flow: video upload + query-token media auth + final gate transitions.

Uses the flagship seeded project (`proj-mv-neon-heart`) for the gate test
because faculty is only assigned to Aria's 6 seeded projects. Snapshots
rights + checklist state at start and restores at teardown so we don't
break test_media_authz.py::test_faculty_final_approval_blocked_by_gate
which relies on the flagship gate being RED by default.
"""
import os
import uuid
import requests
import pytest

BASE = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE = line.split("=", 1)[1].strip()
BASE = BASE.rstrip("/")
API = f"{BASE}/api"

STUDENT = {"email": "student@cynaiah.demo", "password": "Cynaiah2026!"}
FACULTY = {"email": "faculty@cynaiah.demo", "password": "Cynaiah2026!"}
PROJECT = "proj-mv-neon-heart"


def _login(creds):
    r = requests.post(f"{API}/auth/login", json=creds)
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture(scope="module")
def student_token():
    return _login(STUDENT)


@pytest.fixture(scope="module")
def faculty_token():
    return _login(FACULTY)


def _auth(t):
    return {"Authorization": f"Bearer {t}"}


DUMMY_MP4 = (
    b"\x00\x00\x00\x20ftypisom\x00\x00\x02\x00isomiso2avc1mp41"
    + b"\x00" * 64
)


# -------- Test 1: video upload + query-token media auth end-to-end --------
def test_video_upload_and_query_token_media_auth(student_token):
    r = requests.post(
        f"{API}/projects/{PROJECT}/finish/version",
        headers=_auth(student_token),
        json={"title": f"TEST it14 upload {uuid.uuid4().hex[:6]}", "stage": "rough_cut"},
    )
    assert r.status_code in (200, 201), r.text
    vid = r.json()["id"]
    try:
        up = requests.post(
            f"{API}/finish/version/{vid}/upload",
            headers=_auth(student_token),
            files={"file": ("dummy.mp4", DUMMY_MP4, "video/mp4")},
        )
        assert up.status_code == 200, up.text
        video_url = up.json()["video_url"]
        assert video_url.startswith("/api/finish/video/")
        full = f"{BASE}{video_url}"

        # Without any auth -> 401
        assert requests.get(full).status_code == 401

        # ?token=<jwt> -> 200 (this is the frontend media auth path)
        r_qs = requests.get(f"{full}?token={student_token}")
        assert r_qs.status_code == 200, r_qs.text[:200]
        assert r_qs.headers.get("content-type", "").startswith("video/")

        # Bearer header still works
        assert requests.get(full, headers=_auth(student_token)).status_code == 200
    finally:
        requests.delete(f"{API}/finish/version/{vid}", headers=_auth(student_token))


# -------- Test 2: final approval gate — RED -> GREEN transition --------
def test_final_approval_gate_red_and_green(student_token, faculty_token):
    project_id = PROJECT

    # Snapshot
    rights_before = requests.get(
        f"{API}/projects/{project_id}/rights", headers=_auth(student_token)
    ).json()
    ov_before = requests.get(
        f"{API}/projects/{project_id}/finish/overview", headers=_auth(student_token)
    ).json()
    a_before = {i["key"]: i["done"] for i in ov_before["accessibility"]["items"]}
    d_before = {i["key"]: i["done"] for i in ov_before["delivery"]["items"]}
    rights_ids_to_delete = []
    versions_to_delete = []
    rights_backup = []

    try:
        # If any existing rights lack consent, delete them (backup for restore)
        for r in rights_before:
            if not r.get("consent_recorded"):
                rights_backup.append(r)
                requests.delete(f"{API}/rights/{r['id']}", headers=_auth(student_token))

        # Create a final-stage version
        v = requests.post(
            f"{API}/projects/{project_id}/finish/version",
            headers=_auth(student_token),
            json={"title": f"TEST it14 final {uuid.uuid4().hex[:6]}", "stage": "final"},
        )
        assert v.status_code in (200, 201), v.text
        vid = v.json()["id"]
        versions_to_delete.append(vid)

        # If not-all checklists are done, gate must be RED (blocked)
        not_all_a_done = not all(a_before.values())
        not_all_d_done = not all(d_before.values())
        if not_all_a_done or not_all_d_done:
            bad = requests.post(
                f"{API}/finish/version/{vid}/approve",
                headers=_auth(faculty_token),
                json={"approval_status": "approved", "message": "try"},
            )
            assert bad.status_code == 400, f"expected 400 blocked, got {bad.status_code}: {bad.text}"

        # Faculty rough_cut approval always works (no gate on non-final)
        rv = requests.post(
            f"{API}/projects/{project_id}/finish/version",
            headers=_auth(student_token),
            json={"title": f"TEST it14 rough {uuid.uuid4().hex[:6]}", "stage": "rough_cut"},
        )
        assert rv.status_code in (200, 201)
        rvid = rv.json()["id"]
        versions_to_delete.append(rvid)
        rok = requests.post(
            f"{API}/finish/version/{rvid}/approve",
            headers=_auth(faculty_token),
            json={"approval_status": "approved", "message": "LGTM"},
        )
        assert rok.status_code == 200, rok.text
        assert rok.json()["approval_status"] == "approved"

        # Clear gate: add rights + complete all checklists
        rr = requests.post(
            f"{API}/rights",
            headers=_auth(student_token),
            json={
                "project_id": project_id,
                "contributor_name": "TEST it14 Contributor",
                "role": "composer",
                "consent_recorded": True,
                "usage_terms": "royalty-free",
            },
        )
        assert rr.status_code in (200, 201), rr.text
        rights_ids_to_delete.append(rr.json()["id"])

        for kind, before_map in (("accessibility", a_before), ("delivery", d_before)):
            for key, was_done in before_map.items():
                if not was_done:
                    pr = requests.patch(
                        f"{API}/projects/{project_id}/finish/checklist/{kind}",
                        headers=_auth(student_token),
                        json={"key": key, "done": True},
                    )
                    assert pr.status_code == 200, pr.text

        # Gate now GREEN
        gate2 = requests.get(
            f"{API}/projects/{project_id}/finish/final-gate", headers=_auth(student_token)
        ).json()
        assert gate2["ok"] is True, gate2

        # Final approval succeeds
        ok = requests.post(
            f"{API}/finish/version/{vid}/approve",
            headers=_auth(faculty_token),
            json={"approval_status": "approved", "message": "Looks good"},
        )
        assert ok.status_code == 200, ok.text
        assert ok.json()["approval_status"] == "approved"
    finally:
        # Restore state
        for rid in rights_ids_to_delete:
            requests.delete(f"{API}/rights/{rid}", headers=_auth(student_token))
        for r in rights_backup:
            requests.post(
                f"{API}/rights",
                headers=_auth(student_token),
                json={
                    "project_id": r["project_id"],
                    "contributor_name": r.get("contributor_name", "restored"),
                    "role": r.get("role", "collaborator"),
                    "consent_recorded": r.get("consent_recorded", False),
                    "usage_terms": r.get("usage_terms", ""),
                },
            )
        # Reset checklist items to their pre-test done state
        for kind, before_map in (("accessibility", a_before), ("delivery", d_before)):
            for key, was_done in before_map.items():
                if not was_done:
                    requests.patch(
                        f"{API}/projects/{project_id}/finish/checklist/{kind}",
                        headers=_auth(student_token),
                        json={"key": key, "done": False},
                    )
        for vid in versions_to_delete:
            requests.delete(f"{API}/finish/version/{vid}", headers=_auth(student_token))
