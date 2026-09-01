"""ANCRA v2.0 backend integration tests."""
import os
import json
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL") or open("/app/frontend/.env").read().split("REACT_APP_BACKEND_URL=")[1].split("\n")[0].strip()
API = BASE_URL.rstrip("/") + "/api"


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


# --- Meta ---
def test_root(s):
    r = s.get(f"{API}/")
    assert r.status_code == 200
    data = r.json()
    assert data.get("platform") == "ANCRA v2.0"
    assert "tagline" in data


# --- Student endpoints ---
def test_student_dashboard(s):
    r = s.get(f"{API}/student/dashboard")
    assert r.status_code == 200
    d = r.json()
    for key in ["student", "journey", "schedule", "songs", "capstones",
                "experiences", "sessions", "achievements"]:
        assert key in d, f"missing {key}"
    assert d["student"] is not None
    assert len(d["songs"]) == 30, f"expected 30 songs got {len(d['songs'])}"


def test_student_journeys(s):
    r = s.get(f"{API}/student/journeys")
    assert r.status_code == 200
    assert isinstance(r.json().get("experiences"), list)


def test_student_experience(s):
    r = s.get(f"{API}/student/experience/exp_songwriting_arch")
    assert r.status_code == 200
    d = r.json()
    assert d["experience"]["id"] == "exp_songwriting_arch"
    assert isinstance(d["lessons"], list)
    assert len(d["lessons"]) > 0


def test_student_experience_404(s):
    r = s.get(f"{API}/student/experience/nope")
    assert r.status_code == 404


def test_student_lesson(s):
    r = s.get(f"{API}/student/lesson/les_song_01")
    assert r.status_code == 200
    d = r.json()
    assert d["id"] == "les_song_01"
    # chapters and resources expected
    assert "chapters" in d or "resources" in d


def test_student_songs_30(s):
    r = s.get(f"{API}/student/songs")
    assert r.status_code == 200
    songs = r.json()["songs"]
    assert len(songs) == 30
    statuses = {sg.get("status") for sg in songs}
    # verify variety
    assert len(statuses) >= 5


@pytest.mark.parametrize("path", [
    "assignments", "capstones", "portfolio", "teams",
    "messages", "calendar", "achievements",
])
def test_student_lists(s, path):
    r = s.get(f"{API}/student/{path}")
    assert r.status_code == 200
    d = r.json()
    assert isinstance(d, dict)
    # at least one array key
    assert any(isinstance(v, list) for v in d.values())


# --- Faculty endpoints ---
def test_faculty_dashboard(s):
    r = s.get(f"{API}/faculty/dashboard")
    assert r.status_code == 200
    d = r.json()
    for key in ["faculty", "cohorts", "reviews_pending",
                "sessions_upcoming", "approvals", "stats"]:
        assert key in d
    stats = d["stats"]
    for k in ["total_students", "active_reviews", "cohorts",
              "avg_portfolio_score", "graduation_ready", "at_risk"]:
        assert k in stats


def test_faculty_students(s):
    r = s.get(f"{API}/faculty/students")
    assert r.status_code == 200
    st = r.json()["students"]
    assert len(st) >= 6, f"expected 6+ students got {len(st)}"


def test_faculty_reviews(s):
    r = s.get(f"{API}/faculty/reviews")
    assert r.status_code == 200
    assert isinstance(r.json()["reviews"], list)


def test_faculty_curriculum(s):
    r = s.get(f"{API}/faculty/curriculum")
    assert r.status_code == 200
    assert isinstance(r.json()["experiences"], list)


def test_faculty_analytics(s):
    r = s.get(f"{API}/faculty/analytics")
    assert r.status_code == 200
    d = r.json()
    assert isinstance(d["engagement"], list)
    assert isinstance(d["portfolio_score"], list)
    assert "industry_participation" in d
    assert "capstone_readiness" in d
    assert "graduation_readiness" in d


def test_faculty_cohorts(s):
    r = s.get(f"{API}/faculty/cohorts")
    assert r.status_code == 200
    coh = r.json()["cohorts"]
    assert len(coh) == 3, f"expected 3 cohorts got {len(coh)}"


# --- Ecosystem hubs ---
@pytest.mark.parametrize("module", [
    "ancrlab", "ancrsync", "coheir", "inheira", "vaulta",
    "ancrlaunch", "ancrview", "ancrwav", "ancrid",
])
def test_ecosystem_hub(s, module):
    r = s.get(f"{API}/ecosystem/{module}")
    assert r.status_code == 200, f"{module} -> {r.status_code}: {r.text[:200]}"
    d = r.json()
    assert d.get("module") == module


# --- AIAH streaming ---
def test_aiah_stream_and_history(s):
    payload = {
        "session_id": "TEST_session_pytest_01",
        "message": "In one sentence, describe how ANCRA helps a songwriter.",
        "role": "student",
        "context": {"page": "dashboard"},
    }
    with s.post(f"{API}/aiah/stream", json=payload, stream=True, timeout=60) as r:
        assert r.status_code == 200
        assert "text/event-stream" in r.headers.get("content-type", "")
        deltas = []
        done = False
        err = None
        for raw in r.iter_lines():
            if not raw:
                continue
            line = raw.decode()
            if not line.startswith("data: "):
                continue
            try:
                obj = json.loads(line[6:])
            except Exception:
                continue
            if "delta" in obj:
                deltas.append(obj["delta"])
            if obj.get("done"):
                done = True
                break
            if "error" in obj:
                err = obj["error"]
                break
        assert err is None, f"AIAH error: {err}"
        assert done, "no done event"
        assert len(deltas) > 0, "no delta chunks"
        assert len("".join(deltas)) > 10

    # history persistence
    r = s.get(f"{API}/aiah/history/TEST_session_pytest_01")
    assert r.status_code == 200
    d = r.json()
    msgs = d.get("messages", [])
    assert len(msgs) >= 2
    roles = [m["role"] for m in msgs]
    assert "user" in roles and "assistant" in roles
