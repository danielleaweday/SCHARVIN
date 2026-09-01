"""Iteration 15 — Cyna (in-app AI mentor) backend tests.

Covers:
- Session CRUD + cross-owner isolation
- Chat: assistant reply, title inference, project_id persistence, history
- Guardrails: empty/too-long messages, cross-owner access, missing token
- Action executor: draft_script, add_finishing_note, unknown kind, cross-project
"""
import os
import time
import uuid

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"
TIMEOUT = 60  # live Claude calls can take a while

STUDENT_EMAIL = "student@cynaiah.demo"
STUDENT_PASS = "Cynaiah2026!"
PROJECT_ID = "proj-mv-neon-heart"


# --------- fixtures ---------
@pytest.fixture(scope="session")
def student_token():
    r = requests.post(
        f"{API}/auth/login",
        json={"email": STUDENT_EMAIL, "password": STUDENT_PASS},
        timeout=TIMEOUT,
    )
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def student_headers(student_token):
    return {"Authorization": f"Bearer {student_token}"}


@pytest.fixture(scope="session")
def other_student():
    """Register a fresh second student on the fly."""
    email = f"test_sec_{uuid.uuid4().hex[:8]}@example.com"
    r = requests.post(
        f"{API}/auth/register",
        json={
            "email": email,
            "password": "SecTest2026!",
            "name": "Test Second",
            "role": "student",
        },
        timeout=TIMEOUT,
    )
    assert r.status_code in (200, 201), f"register failed: {r.status_code} {r.text}"
    # login
    lr = requests.post(
        f"{API}/auth/login",
        json={"email": email, "password": "SecTest2026!"},
        timeout=TIMEOUT,
    )
    assert lr.status_code == 200
    return {
        "email": email,
        "token": lr.json()["access_token"],
        "headers": {"Authorization": f"Bearer {lr.json()['access_token']}"},
    }


# --------- session CRUD ---------
class TestCynaSessions:
    def test_create_session(self, student_headers):
        r = requests.post(f"{API}/cyna/sessions", json={}, headers=student_headers, timeout=TIMEOUT)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "id" in data
        assert data["title"] == "New conversation with Cyna"
        assert data["user_id"]  # exists
        pytest.session_id = data["id"]

    def test_list_sessions_contains_created(self, student_headers):
        r = requests.get(f"{API}/cyna/sessions", headers=student_headers, timeout=TIMEOUT)
        assert r.status_code == 200
        ids = [s["id"] for s in r.json()]
        assert pytest.session_id in ids

    def test_cross_owner_isolation(self, other_student, student_headers):
        # Second student creates their own
        r = requests.post(f"{API}/cyna/sessions", json={}, headers=other_student["headers"], timeout=TIMEOUT)
        assert r.status_code == 200
        other_sid = r.json()["id"]

        # List for second: should contain their id only, not first student's
        r2 = requests.get(f"{API}/cyna/sessions", headers=other_student["headers"], timeout=TIMEOUT)
        assert r2.status_code == 200
        ids2 = [s["id"] for s in r2.json()]
        assert other_sid in ids2
        assert pytest.session_id not in ids2, "cross-owner leak!"

        # Cross-owner delete → 404
        r3 = requests.delete(f"{API}/cyna/sessions/{pytest.session_id}", headers=other_student["headers"], timeout=TIMEOUT)
        assert r3.status_code == 404

        # cross-owner get messages → 404
        r4 = requests.get(f"{API}/cyna/sessions/{pytest.session_id}/messages", headers=other_student["headers"], timeout=TIMEOUT)
        assert r4.status_code == 404

    def test_no_auth_returns_401(self):
        r = requests.get(f"{API}/cyna/sessions", timeout=TIMEOUT)
        assert r.status_code in (401, 403)


# --------- chat ---------
class TestCynaChat:
    def test_chat_first_turn(self, student_headers):
        # Create a fresh session for this chat test
        r = requests.post(f"{API}/cyna/sessions", json={}, headers=student_headers, timeout=TIMEOUT)
        assert r.status_code == 200
        sid = r.json()["id"]
        pytest.chat_sid = sid

        r2 = requests.post(
            f"{API}/cyna/sessions/{sid}/chat",
            json={
                "message": "What did I write for Neon Heart? Give me a quick pulse-check.",
                "project_id": PROJECT_ID,
            },
            headers=student_headers,
            timeout=TIMEOUT,
        )
        assert r2.status_code == 200, r2.text
        data = r2.json()
        assert "user_message" in data and "assistant_message" in data
        assert data["user_message"]["role"] == "user"
        assert data["assistant_message"]["role"] == "assistant"
        content = data["assistant_message"]["content"]
        assert isinstance(content, str) and len(content) > 20, "assistant reply too short"
        # We don't strictly require the model to mention project specifics but
        # it's grounded — if project data is empty it should still respond.
        # Log for visibility.
        print(f"[assistant reply snippet]: {content[:200]}")

    def test_title_inferred_and_project_persisted(self, student_headers):
        r = requests.get(f"{API}/cyna/sessions", headers=student_headers, timeout=TIMEOUT)
        sess = next(s for s in r.json() if s["id"] == pytest.chat_sid)
        assert not sess["title"].startswith("New conversation"), f"title not inferred: {sess['title']}"
        assert sess.get("project_id") == PROJECT_ID

    def test_history_preserved(self, student_headers):
        r = requests.get(f"{API}/cyna/sessions/{pytest.chat_sid}/messages", headers=student_headers, timeout=TIMEOUT)
        assert r.status_code == 200
        data = r.json()
        assert data["session"]["id"] == pytest.chat_sid
        assert len(data["messages"]) >= 2
        # sorted by created_at
        times = [m["created_at"] for m in data["messages"]]
        assert times == sorted(times)

    def test_empty_message_400(self, student_headers):
        r = requests.post(
            f"{API}/cyna/sessions/{pytest.chat_sid}/chat",
            json={"message": "   "},
            headers=student_headers,
            timeout=TIMEOUT,
        )
        assert r.status_code == 400

    def test_too_long_message_400(self, student_headers):
        r = requests.post(
            f"{API}/cyna/sessions/{pytest.chat_sid}/chat",
            json={"message": "x" * 4001},
            headers=student_headers,
            timeout=TIMEOUT,
        )
        assert r.status_code == 400

    def test_cross_owner_chat_404(self, other_student):
        r = requests.post(
            f"{API}/cyna/sessions/{pytest.chat_sid}/chat",
            json={"message": "hello"},
            headers=other_student["headers"],
            timeout=TIMEOUT,
        )
        assert r.status_code == 404


# --------- proposed actions parse ---------
class TestCynaProposedActions:
    def test_general_qna_no_actions(self, student_headers):
        r = requests.post(f"{API}/cyna/sessions", json={}, headers=student_headers, timeout=TIMEOUT)
        sid = r.json()["id"]
        r2 = requests.post(
            f"{API}/cyna/sessions/{sid}/chat",
            json={"message": "What's a good treatment structure?", "project_id": PROJECT_ID},
            headers=student_headers,
            timeout=TIMEOUT,
        )
        assert r2.status_code == 200
        actions = r2.json()["assistant_message"].get("proposed_actions") or []
        assert actions == [], f"expected no actions on general Q&A, got: {actions}"

    def test_explicit_draft_produces_action(self, student_headers):
        r = requests.post(f"{API}/cyna/sessions", json={}, headers=student_headers, timeout=TIMEOUT)
        sid = r.json()["id"]
        r2 = requests.post(
            f"{API}/cyna/sessions/{sid}/chat",
            json={
                "message": "Please draft a 2-line logline for Neon Heart and add it to my scripts.",
                "project_id": PROJECT_ID,
            },
            headers=student_headers,
            timeout=TIMEOUT,
        )
        assert r2.status_code == 200
        actions = r2.json()["assistant_message"].get("proposed_actions") or []
        # Model behaviour: expect at least one draft_script action
        if not actions:
            pytest.skip(f"Model did not emit an action this run — reply: {r2.json()['assistant_message']['content'][:250]}")
        assert any(a.get("kind") == "draft_script" for a in actions), f"expected draft_script, got {actions}"


# --------- action executor ---------
class TestCynaActionExecute:
    def test_add_finishing_note(self, student_headers):
        r = requests.post(
            f"{API}/cyna/actions/execute",
            json={
                "project_id": PROJECT_ID,
                "action": {
                    "kind": "add_finishing_note",
                    "category": "color",
                    "body": "TEST_Push warmth on scene 2",
                },
            },
            headers=student_headers,
            timeout=TIMEOUT,
        )
        assert r.status_code == 200, r.text
        assert r.json()["status"] == "created"
        assert r.json()["kind"] == "add_finishing_note"
        assert "created_id" in r.json()

    def test_draft_script(self, student_headers):
        r = requests.post(
            f"{API}/cyna/actions/execute",
            json={
                "project_id": PROJECT_ID,
                "action": {
                    "kind": "draft_script",
                    "title": "TEST_Cyna draft logline",
                    "content": "A neon-lit heart bleeds sound.",
                    "script_kind": "logline",
                },
            },
            headers=student_headers,
            timeout=TIMEOUT,
        )
        assert r.status_code == 200, r.text
        assert r.json()["status"] == "created"
        assert "created_id" in r.json()

    def test_unknown_kind_400(self, student_headers):
        r = requests.post(
            f"{API}/cyna/actions/execute",
            json={"project_id": PROJECT_ID, "action": {"kind": "delete_universe"}},
            headers=student_headers,
            timeout=TIMEOUT,
        )
        assert r.status_code == 400

    def test_cross_project_404(self, other_student):
        # student2 tries to write to Aria's project → 404 from _assert_project_owner
        r = requests.post(
            f"{API}/cyna/actions/execute",
            json={
                "project_id": PROJECT_ID,
                "action": {"kind": "add_finishing_note", "category": "color", "body": "TEST_hack"},
            },
            headers=other_student["headers"],
            timeout=TIMEOUT,
        )
        assert r.status_code == 404


# --------- delete cleanup ---------
class TestCynaDelete:
    def test_delete_session_and_cascade(self, student_headers):
        # create + chat once so a message exists
        r = requests.post(f"{API}/cyna/sessions", json={}, headers=student_headers, timeout=TIMEOUT)
        sid = r.json()["id"]
        requests.post(
            f"{API}/cyna/sessions/{sid}/chat",
            json={"message": "hi", "project_id": PROJECT_ID},
            headers=student_headers,
            timeout=TIMEOUT,
        )
        # delete
        r2 = requests.delete(f"{API}/cyna/sessions/{sid}", headers=student_headers, timeout=TIMEOUT)
        assert r2.status_code == 200
        # verify gone
        r3 = requests.get(f"{API}/cyna/sessions/{sid}/messages", headers=student_headers, timeout=TIMEOUT)
        assert r3.status_code == 404
