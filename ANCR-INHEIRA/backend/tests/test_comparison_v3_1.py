"""
INHEIRA v3.1 — Comparison Engine tests.

Covers:
  * Happy path: full comparison payload shape
  * Determinism & a/b ordering by created_at
  * Error cases: unknown session, unknown version, missing params, cross-user 403/404
  * Between-events window (strict > a.created_at and <= b.created_at)
  * Guardrail: disclaimer + no inferred splits/ownership
  * Lineage relationship values
  * Regression sweep on MCI / versions / evidence events / voice
"""
import os
import re
import uuid
from pathlib import Path

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")).rstrip("/")

SESSION_ID = "sess_96285667fb26"
VER_A = "ver_eebac44b33f1"  # Baseline v1 (earlier)
VER_B = "ver_5a40bd309888"  # Bridge rewrite take 3 (later)


# ---------- fixtures ----------
@pytest.fixture(scope="module")
def credentials():
    txt = Path("/app/memory/test_credentials.md").read_text()
    email = re.search(r"Email:\s*(\S+)", txt).group(1)
    password = re.search(r"Password:\s*(\S+)", txt).group(1)
    return {"email": email, "password": password}


@pytest.fixture(scope="module")
def auth_token(credentials):
    r = requests.post(f"{BASE_URL}/api/auth/login", json=credentials, timeout=30)
    if r.status_code != 200:
        pytest.fail(f"Auth failed: {r.status_code} {r.text[:300]}")
    return r.json()["token"]


@pytest.fixture(scope="module")
def client(auth_token):
    s = requests.Session()
    s.headers.update({"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"})
    return s


# ---------- Comparison Engine ----------
class TestComparisonHappyPath:
    def test_full_shape_and_keys(self, client):
        r = client.get(
            f"{BASE_URL}/api/sessions/{SESSION_ID}/comparison",
            params={"a": VER_A, "b": VER_B},
            timeout=60,
        )
        assert r.status_code == 200, r.text
        d = r.json()

        top = {
            "session_id", "a", "b", "lineage", "metadata", "prose",
            "decisions", "participants", "environment", "evidence_artifacts",
            "acknowledgements", "voice_evidence", "between_events",
            "between_event_count", "mci", "disclaimer", "computed_at",
        }
        assert top.issubset(d.keys()), f"missing: {top - set(d.keys())}"

        # Lineage
        for k in ("relationship", "a_parent", "b_parent", "a_children", "b_children"):
            assert k in d["lineage"]
        assert d["lineage"]["relationship"] in (
            "a_is_parent_of_b", "b_is_parent_of_a", "siblings", "unrelated",
        )

        # metadata scalar diffs
        for k in ("title", "purpose", "moment_at", "location", "writing_room", "submitter"):
            assert set(d["metadata"][k].keys()) == {"a", "b", "equal"}

        # prose
        for k in ("objectives", "what_changed", "why_changed", "ai_session_summary"):
            assert set(d["prose"][k].keys()) == {"a", "b", "equal"}

        # decisions list-diff shape
        for k in ("decisions_reached", "decisions_deferred", "open_questions",
                  "disagreements", "rights_discussions"):
            assert {"added", "removed", "unchanged", "a", "b"}.issubset(d["decisions"][k].keys())

        # participants
        for k in ("added", "removed", "in_both"):
            assert isinstance(d["participants"][k], list)

        # evidence artifacts
        for k in ("added", "removed", "in_both", "counts_a", "counts_b"):
            assert k in d["evidence_artifacts"]

        # acknowledgements
        for k in ("added", "removed", "in_both"):
            assert k in d["acknowledgements"]

        # between events
        assert isinstance(d["between_events"], list)
        assert d["between_event_count"] == len(d["between_events"])

        # mci reference
        assert d["mci"]["session_id"] == SESSION_ID
        assert "read_via" in d["mci"]
        assert d["mci"]["read_via"].endswith(f"/api/sessions/{SESSION_ID}/mci")

        # disclaimer
        disc = d["disclaimer"]
        assert isinstance(disc, str) and disc
        assert "documentation and analysis tool" in disc.lower()
        assert "does not determine legal ownership" in disc.lower()
        assert "does not assign publishing splits" in disc.lower()

        # computed_at ISO
        assert "T" in d["computed_at"]

    def test_between_events_window_bounds(self, client):
        r = client.get(
            f"{BASE_URL}/api/sessions/{SESSION_ID}/comparison",
            params={"a": VER_A, "b": VER_B}, timeout=30,
        ).json()
        a_ts = r["a"]["created_at"]
        b_ts = r["b"]["created_at"]
        for e in r["between_events"]:
            assert e["created_at"] > a_ts, e
            assert e["created_at"] <= b_ts, e

    def test_guardrail_no_splits_or_ownership(self, client):
        r = client.get(
            f"{BASE_URL}/api/sessions/{SESSION_ID}/comparison",
            params={"a": VER_A, "b": VER_B}, timeout=30,
        ).text.lower()
        forbidden = ["publishing_split", "ownership_percentage", "contribution_weight",
                     "inferred_split", "ownership_share"]
        for tok in forbidden:
            assert tok not in r, f"comparison payload contains forbidden token {tok}"


class TestDeterminismAndOrdering:
    def test_repeat_call_equivalent(self, client):
        p = {"a": VER_A, "b": VER_B}
        r1 = client.get(f"{BASE_URL}/api/sessions/{SESSION_ID}/comparison", params=p, timeout=30).json()
        r2 = client.get(f"{BASE_URL}/api/sessions/{SESSION_ID}/comparison", params=p, timeout=30).json()
        for k in ("session_id", "a", "b", "lineage", "metadata", "prose",
                  "decisions", "participants", "evidence_artifacts",
                  "acknowledgements", "between_event_count", "mci", "disclaimer"):
            assert r1[k] == r2[k], f"non-deterministic key: {k}"

    def test_swap_ab_reordered_by_created_at(self, client):
        r1 = client.get(f"{BASE_URL}/api/sessions/{SESSION_ID}/comparison",
                        params={"a": VER_A, "b": VER_B}, timeout=30).json()
        r2 = client.get(f"{BASE_URL}/api/sessions/{SESSION_ID}/comparison",
                        params={"a": VER_B, "b": VER_A}, timeout=30).json()
        assert r1["a"]["version_id"] == r2["a"]["version_id"]
        assert r1["b"]["version_id"] == r2["b"]["version_id"]
        assert r1["a"]["created_at"] <= r1["b"]["created_at"]


class TestErrorCases:
    def test_unknown_session(self, client):
        r = client.get(f"{BASE_URL}/api/sessions/sess_does_not_exist/comparison",
                       params={"a": VER_A, "b": VER_B}, timeout=30)
        assert r.status_code in (403, 404), r.text

    def test_unknown_version(self, client):
        r = client.get(f"{BASE_URL}/api/sessions/{SESSION_ID}/comparison",
                       params={"a": VER_A, "b": "ver_nope_00000000"}, timeout=30)
        assert r.status_code == 404
        assert "Version not found" in r.text

    def test_missing_query_param_a(self, client):
        r = client.get(f"{BASE_URL}/api/sessions/{SESSION_ID}/comparison",
                       params={"b": VER_B}, timeout=30)
        assert r.status_code == 422

    def test_missing_query_param_b(self, client):
        r = client.get(f"{BASE_URL}/api/sessions/{SESSION_ID}/comparison",
                       params={"a": VER_A}, timeout=30)
        assert r.status_code == 422

    def test_cross_user_access_denied(self):
        # Create a fresh user
        email = f"test_cmp_{uuid.uuid4().hex[:8]}@example.com"
        reg = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email, "password": "Test1234!", "name": "TEST comparison other"
        }, timeout=30)
        assert reg.status_code == 200, reg.text
        token = reg.json()["token"]
        r = requests.get(
            f"{BASE_URL}/api/sessions/{SESSION_ID}/comparison",
            params={"a": VER_A, "b": VER_B},
            headers={"Authorization": f"Bearer {token}"},
            timeout=30,
        )
        assert r.status_code in (403, 404), r.text


class TestLineage:
    def test_relationship_value_valid(self, client):
        r = client.get(f"{BASE_URL}/api/sessions/{SESSION_ID}/comparison",
                       params={"a": VER_A, "b": VER_B}, timeout=30).json()
        assert r["lineage"]["relationship"] in (
            "a_is_parent_of_b", "b_is_parent_of_a", "siblings", "unrelated",
        )
        # a_children / b_children are lists
        assert isinstance(r["lineage"]["a_children"], list)
        assert isinstance(r["lineage"]["b_children"], list)


# ---------- Regression sweep ----------
class TestRegressionAdjacentModules:
    def test_mci_get(self, client):
        r = client.get(f"{BASE_URL}/api/sessions/{SESSION_ID}/mci", timeout=60)
        assert r.status_code == 200, r.text
        assert r.json().get("status") in ("analyzed", "partial", "awaiting_evidence",
                                          "awaiting_musical_contribution_analysis")

    def test_mci_refresh(self, client):
        r = client.post(f"{BASE_URL}/api/sessions/{SESSION_ID}/mci/refresh", timeout=60)
        assert r.status_code == 200, r.text
        assert "status" in r.json()

    def test_versions_list(self, client):
        r = client.get(f"{BASE_URL}/api/sessions/{SESSION_ID}/versions", timeout=30)
        assert r.status_code == 200
        data = r.json()
        versions = data if isinstance(data, list) else data.get("versions", [])
        # >= 2 for compare picker; happy if seeded with 57 but tolerate growth/shrink
        assert len(versions) >= 2

    def test_evidence_event_create_and_list(self, client):
        payload = {
            "kind": "note",
            "label": f"TEST_regression_{uuid.uuid4().hex[:6]}",
            "meta": {},
        }
        r = client.post(f"{BASE_URL}/api/sessions/{SESSION_ID}/events", json=payload, timeout=30)
        assert r.status_code in (200, 201), r.text
        body = r.json()
        assert body.get("event_id")

        lr = client.get(f"{BASE_URL}/api/sessions/{SESSION_ID}/events", timeout=30)
        assert lr.status_code == 200
        assert isinstance(lr.json(), list)

    def test_voice_recordings_list(self, client):
        r = client.get(f"{BASE_URL}/api/sessions/{SESSION_ID}/voice", timeout=30)
        assert r.status_code == 200, r.text
        assert isinstance(r.json(), (list, dict))
