"""ANCRLaunch backend regression tests."""
import os
import time
import uuid
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://career-launch-147.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"
DEMO_PW = "ancrlaunch2026"


# ---------- fixtures ----------
@pytest.fixture(scope="session")
def student_token():
    r = requests.post(f"{API}/auth/login", json={"email": "student@ancrlaunch.demo", "password": DEMO_PW}, timeout=30)
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="session")
def employer_token():
    r = requests.post(f"{API}/auth/login", json={"email": "employer@ancrlaunch.demo", "password": DEMO_PW}, timeout=30)
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="session")
def graduate_token():
    r = requests.post(f"{API}/auth/login", json={"email": "graduate@ancrlaunch.demo", "password": DEMO_PW}, timeout=30)
    assert r.status_code == 200, r.text
    return r.json()["token"]


def _h(tok):
    return {"Authorization": f"Bearer {tok}", "Content-Type": "application/json"}


# ---------- health & auth ----------
def test_health():
    r = requests.get(f"{API}/health", timeout=15)
    assert r.status_code == 200
    assert r.json()["ok"] is True


def test_demo_accounts():
    r = requests.get(f"{API}/auth/demo-accounts", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) == 8, f"expected 8 seeded accounts, got {len(data)}"
    roles = {u["role"] for u in data}
    assert {"student", "graduate", "faculty", "career_services", "employer",
            "recruiter", "industry_partner", "administrator"}.issubset(roles)


def test_login_wrong_password():
    r = requests.post(f"{API}/auth/login", json={"email": "student@ancrlaunch.demo", "password": "bad"}, timeout=15)
    assert r.status_code == 401


def test_auth_me(student_token):
    r = requests.get(f"{API}/auth/me", headers=_h(student_token), timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "ancrid" in data
    assert data["email"] == "student@ancrlaunch.demo"
    assert data["role"] == "student"


# ---------- dashboard ----------
def test_dashboard(student_token):
    r = requests.get(f"{API}/dashboard", headers=_h(student_token), timeout=30)
    assert r.status_code == 200
    d = r.json()
    for k in ["readiness", "portfolio_completion", "resume", "applications",
              "upcoming_interviews", "recommended_opportunities", "career_timeline"]:
        assert k in d, f"missing {k}"
    assert "overall" in d["readiness"]
    assert "tier" in d["readiness"]


# ---------- readiness ----------
def test_readiness(student_token):
    r = requests.get(f"{API}/readiness", headers=_h(student_token), timeout=30)
    assert r.status_code == 200
    d = r.json()
    assert "overall" in d and "tier" in d
    assert "components" in d
    assert len(d["components"]) >= 10, f"expected >=10 components, got {len(d['components'])}"
    assert "weights" in d


# ---------- portfolio ----------
def test_portfolio_assembled(student_token):
    r = requests.get(f"{API}/portfolio", headers=_h(student_token), timeout=30)
    assert r.status_code == 200
    p = r.json()
    for k in ["identity", "projects", "media", "publishing", "creator_passport",
              "booking_packet", "reputation", "faculty_recommendations", "industry_recommendations"]:
        assert k in p, f"missing portfolio module {k}"


# ---------- resume ----------
def test_resume_get_and_put(student_token):
    r = requests.get(f"{API}/resume", headers=_h(student_token), timeout=15)
    assert r.status_code == 200
    resume = r.json()
    assert "completion" in resume
    before = resume["completion"]

    payload = {
        "professional_summary": "TEST_ Passionate multidisciplinary creator.",
        "career_objective": "TEST_ launch a launch career",
        "skills": ["Directing", "Screenwriting", "Producing"],
    }
    r2 = requests.put(f"{API}/resume", json=payload, headers=_h(student_token), timeout=15)
    assert r2.status_code == 200
    updated = r2.json()
    assert updated["professional_summary"] == payload["professional_summary"]
    assert updated["completion"] >= before


# ---------- opportunities ----------
def test_opportunities_filters(student_token):
    r = requests.get(f"{API}/opportunities?kind=job", headers=_h(student_token), timeout=15)
    assert r.status_code == 200
    jobs = r.json()
    assert len(jobs) >= 1
    assert all(o["kind"] == "job" for o in jobs)

    r2 = requests.get(f"{API}/opportunities?kind=job&remote=true", headers=_h(student_token), timeout=15)
    assert r2.status_code == 200


# ---------- applications ----------
def test_application_lifecycle(student_token):
    # find an opportunity not applied yet
    opps = requests.get(f"{API}/opportunities", headers=_h(student_token), timeout=15).json()
    existing = requests.get(f"{API}/applications", headers=_h(student_token), timeout=15).json()
    applied_ids = {a["opportunity_id"] for a in existing}
    candidate = next((o for o in opps if o["id"] not in applied_ids), None)
    assert candidate, "no un-applied opportunity available"

    r = requests.post(f"{API}/applications", json={"opportunity_id": candidate["id"], "note": "TEST_"},
                      headers=_h(student_token), timeout=15)
    assert r.status_code == 200, r.text
    app_doc = r.json()
    assert app_doc["stage"] == "applied"
    app_id = app_doc["id"]

    # duplicate -> 409
    r2 = requests.post(f"{API}/applications", json={"opportunity_id": candidate["id"]},
                       headers=_h(student_token), timeout=15)
    assert r2.status_code == 409

    # PATCH stage
    r3 = requests.patch(f"{API}/applications/{app_id}", json={"stage": "interview"},
                        headers=_h(student_token), timeout=15)
    assert r3.status_code == 200
    assert r3.json()["stage"] == "interview"


# ---------- interviews ----------
def test_interviews(student_token, graduate_token):
    for tok in [student_token, graduate_token]:
        r = requests.get(f"{API}/interviews", headers=_h(tok), timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ---------- graduate outcomes ----------
def test_graduate_outcomes(student_token):
    r = requests.get(f"{API}/graduate-outcomes", headers=_h(student_token), timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "outcomes" in d and "stats" in d and "total" in d
    assert d["total"] == len(d["outcomes"])


# ---------- employers ----------
def test_employers_list(student_token):
    r = requests.get(f"{API}/employers", headers=_h(student_token), timeout=15)
    assert r.status_code == 200
    assert len(r.json()) == 5


def test_candidates_forbidden_for_student(student_token):
    r = requests.get(f"{API}/employers/candidates", headers=_h(student_token), timeout=15)
    assert r.status_code == 403


def test_candidates_for_employer(employer_token):
    r = requests.get(f"{API}/employers/candidates", headers=_h(employer_token), timeout=45)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    if len(data) > 1:
        # sorted by readiness desc
        for a, b in zip(data, data[1:]):
            assert a["readiness_overall"] >= b["readiness_overall"]


# ---------- coach ----------
def test_coach_stream(student_token):
    r = requests.post(f"{API}/coach/stream",
                      json={"message": "In one sentence, what should I focus on?"},
                      headers=_h(student_token), timeout=90, stream=True)
    assert r.status_code == 200
    assert "text/event-stream" in r.headers.get("content-type", "")
    session_id = None
    data_chunks = 0
    saw_done = False
    saw_error = False
    for raw in r.iter_lines(decode_unicode=True):
        if raw is None:
            continue
        if raw.startswith("event: session"):
            pass
        elif raw.startswith("event: error"):
            saw_error = True
        elif raw.startswith("event: done"):
            saw_done = True
            break
        elif raw.startswith("data: "):
            val = raw[6:]
            if session_id is None and len(val) >= 8 and "-" in val:
                session_id = val
            else:
                data_chunks += 1
    r.close()
    assert not saw_error, "AIAH stream produced error event"
    assert session_id, "no session id emitted"
    assert data_chunks > 0, "no data chunks received"
    assert saw_done, "no done event"

    time.sleep(1.5)
    r2 = requests.get(f"{API}/coach/messages", params={"session_id": session_id},
                      headers=_h(student_token), timeout=15)
    assert r2.status_code == 200
    msgs = r2.json()
    roles = [m["role"] for m in msgs]
    assert "user" in roles
    assert "assistant" in roles
