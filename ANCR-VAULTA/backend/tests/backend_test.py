"""Vaulta backend end-to-end API tests."""
import os
import pytest
import requests

BASE = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/")
# Prefer external URL if reachable, fallback local
try:
    r = requests.get(f"{BASE}/api/auth/me", timeout=5)
except Exception:
    BASE = "http://localhost:8001"

ARTIST = {"email": "artist@vaulta.io", "password": "Vaulta2026!"}
ADMIN = {"email": "admin@vaulta.io", "password": "Vaulta2026!"}


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    r = s.post(f"{BASE}/api/auth/login", json=ARTIST, timeout=15)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    assert data["email"] == ARTIST["email"]
    assert data["role"] == "Artist"
    assert "access_token" in s.cookies
    return s


# ---------- AUTH ----------
def test_login_invalid_password():
    r = requests.post(f"{BASE}/api/auth/login",
                      json={"email": ARTIST["email"], "password": "wrong"}, timeout=10)
    assert r.status_code == 401


def test_login_valid_returns_user_and_cookie():
    s = requests.Session()
    r = s.post(f"{BASE}/api/auth/login", json=ARTIST, timeout=10)
    assert r.status_code == 200
    j = r.json()
    assert j["email"] == ARTIST["email"]
    assert "access_token" in s.cookies
    assert "refresh_token" in s.cookies


def test_auth_me_with_cookie(session):
    r = session.get(f"{BASE}/api/auth/me", timeout=10)
    assert r.status_code == 200
    assert r.json()["email"] == ARTIST["email"]


def test_protected_requires_auth():
    r = requests.get(f"{BASE}/api/dashboard/overview", timeout=10)
    assert r.status_code == 401


def test_register_and_logout():
    import uuid
    s = requests.Session()
    email = f"TEST_{uuid.uuid4().hex[:8]}@vaulta.io"
    r = s.post(f"{BASE}/api/auth/register",
               json={"email": email, "password": "Testing123!", "name": "Test User", "role": "Artist"}, timeout=10)
    assert r.status_code == 200, r.text
    assert "access_token" in s.cookies
    r2 = s.get(f"{BASE}/api/auth/me", timeout=10)
    assert r2.status_code == 200
    r3 = s.post(f"{BASE}/api/auth/logout", timeout=10)
    assert r3.status_code == 200


# ---------- DASHBOARD ----------
def test_dashboard_overview_shape(session):
    r = session.get(f"{BASE}/api/dashboard/overview", timeout=15)
    assert r.status_code == 200
    d = r.json()
    for k in ["net_worth", "cash_available", "monthly_revenue", "chart",
              "recent_transactions", "upcoming_payments", "business_health_score", "tax_readiness"]:
        assert k in d, f"missing {k}"
    assert isinstance(d["chart"], list)
    assert isinstance(d["recent_transactions"], list)


# ---------- TRANSACTIONS ----------
def test_transactions_crud(session):
    r = session.get(f"{BASE}/api/transactions", timeout=10)
    assert r.status_code == 200
    assert isinstance(r.json(), list)

    payload = {"type": "income", "category": "TEST", "amount": 100.0,
               "date": "2026-01-15", "description": "TEST_tx"}
    cr = session.post(f"{BASE}/api/transactions", json=payload, timeout=10)
    assert cr.status_code == 200
    tid = cr.json()["id"]
    dr = session.delete(f"{BASE}/api/transactions/{tid}", timeout=10)
    assert dr.status_code == 200


def test_income_summary(session):
    r = session.get(f"{BASE}/api/income/summary", timeout=10)
    assert r.status_code == 200
    j = r.json()
    assert "total" in j and "by_category" in j and "items" in j
    if j["by_category"]:
        assert "pct" in j["by_category"][0]


def test_expenses_summary(session):
    r = session.get(f"{BASE}/api/expenses/summary", timeout=10)
    assert r.status_code == 200
    j = r.json()
    assert set(["total", "by_category", "items"]).issubset(j.keys())


# ---------- ROYALTIES ----------
def test_royalties(session):
    r = session.get(f"{BASE}/api/royalties", timeout=10)
    assert r.status_code == 200
    j = r.json()
    for k in ["total_paid", "total_pending", "by_pro", "items"]:
        assert k in j
    if j["by_pro"]:
        assert "pending" in j["by_pro"][0]
        assert "count" in j["by_pro"][0]


# ---------- PUBLISHING ----------
def test_songs(session):
    r = session.get(f"{BASE}/api/publishing/songs", timeout=10)
    assert r.status_code == 200
    songs = r.json()
    assert isinstance(songs, list)
    if songs:
        s0 = songs[0]
        for k in ["iswc", "isrc", "pro", "publisher", "splits"]:
            assert k in s0, f"song missing {k}"


# ---------- CONTRACTS ----------
def test_contracts(session):
    r = session.get(f"{BASE}/api/contracts", timeout=10)
    assert r.status_code == 200
    lst = r.json()
    assert isinstance(lst, list)
    if lst:
        for k in ["title", "type", "counterparty", "value", "status"]:
            assert k in lst[0]


# ---------- INVOICES ----------
def test_invoices_list_and_create(session):
    r = session.get(f"{BASE}/api/invoices", timeout=10)
    assert r.status_code == 200
    cr = session.post(f"{BASE}/api/invoices", json={
        "client_name": "TEST_Client", "amount": 500.0, "due_date": "2026-02-15"
    }, timeout=10)
    assert cr.status_code == 200
    inv = cr.json()
    assert inv["invoice_number"].startswith("VLT-")


# ---------- BUDGETS ----------
def test_budgets(session):
    r = session.get(f"{BASE}/api/budgets", timeout=10)
    assert r.status_code == 200
    cr = session.post(f"{BASE}/api/budgets", json={
        "name": "TEST_Budget", "type": "Monthly", "total_amount": 1000
    }, timeout=10)
    assert cr.status_code == 200


# ---------- TAXES ----------
def test_taxes(session):
    r = session.get(f"{BASE}/api/taxes/overview", timeout=10)
    assert r.status_code == 200
    j = r.json()
    for k in ["quarterly_payments", "deductions_by_category", "forms", "taxable_income", "estimated_tax"]:
        assert k in j


# ---------- BUSINESS ----------
def test_business_profile(session):
    r = session.get(f"{BASE}/api/business/profile", timeout=10)
    assert r.status_code == 200
    j = r.json()
    for k in ["entities", "licenses", "bank_accounts", "credit_cards", "insurance", "compliance"]:
        assert k in j


# ---------- FUNDING ----------
def test_funding(session):
    r = session.get(f"{BASE}/api/funding/opportunities", timeout=10)
    assert r.status_code == 200
    j = r.json()
    # returns dict {opportunities, applications} or empty dict
    assert "opportunities" in j
    if j["opportunities"]:
        o = j["opportunities"][0]
        for k in ["name", "category", "amount", "deadline"]:
            assert k in o, f"missing {k}"


# ---------- REPORTS ----------
def test_pnl(session):
    r = session.get(f"{BASE}/api/reports/pnl", timeout=10)
    assert r.status_code == 200
    j = r.json()
    for k in ["income", "expense", "total_income", "total_expense", "net_profit"]:
        assert k in j


def test_cashflow(session):
    r = session.get(f"{BASE}/api/reports/cashflow", timeout=10)
    assert r.status_code == 200
    j = r.json()
    assert "series" in j and isinstance(j["series"], list)
    if j["series"]:
        s = j["series"][0]
        for k in ["month", "income", "expense", "net"]:
            assert k in s


# ---------- VAULT ----------
def test_vault(session):
    r = session.get(f"{BASE}/api/vault/documents", timeout=10)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


# ---------- ECOSYSTEM ----------
def test_ecosystem(session):
    r = session.get(f"{BASE}/api/ecosystem/status", timeout=10)
    assert r.status_code == 200
    lst = r.json()
    assert isinstance(lst, list)
    assert len(lst) == 10
    names = [x["name"] for x in lst]
    assert "ANCRID" in names and "INHEIRA" in names


# ---------- AIAH STREAM ----------
def test_aiah_stream(session):
    with session.post(f"{BASE}/api/aiah/chat",
                      json={"message": "Give me one budgeting tip in 10 words."},
                      stream=True, timeout=60) as r:
        assert r.status_code == 200
        got_delta = False
        chunks = 0
        for line in r.iter_lines(decode_unicode=True):
            if not line:
                continue
            chunks += 1
            if "delta" in line.lower() or "data:" in line.lower():
                got_delta = True
            if chunks > 200:
                break
        assert chunks > 0, "no stream chunks"
        assert got_delta, "no delta events found in stream"


# ---------- GRANTS & FUNDING V2 ----------
def test_grants_opportunities(session):
    r = session.get(f"{BASE}/api/grants/opportunities", timeout=10)
    assert r.status_code == 200
    j = r.json()
    assert "opportunities" in j and "categories" in j
    opps = j["opportunities"]
    assert len(opps) >= 25, f"expected 25+, got {len(opps)}"
    required = ["organization", "category", "amount", "deadline",
                "eligibility", "difficulty_score", "estimated_hours",
                "ai_match_score", "documents_required", "funding_type"]
    o = opps[0]
    for k in required:
        assert k in o, f"opportunity missing {k}"
    assert isinstance(j["categories"], list) and len(j["categories"]) > 0


def test_grants_applications(session):
    r = session.get(f"{BASE}/api/grants/applications", timeout=10)
    assert r.status_code == 200
    apps = r.json()
    assert isinstance(apps, list)
    if apps:
        statuses = {a["status"] for a in apps}
        # Should include multiple statuses
        assert statuses & {"Awarded", "In Progress", "Submitted", "Rejected"}
        assert "progress" in apps[0] or "progress_percentage" in apps[0] or any(
            "progress" in k for k in apps[0].keys())


def test_grants_summary(session):
    r = session.get(f"{BASE}/api/grants/summary", timeout=10)
    assert r.status_code == 200
    j = r.json()
    for k in ["total_secured", "total_pipeline", "in_progress_count",
              "submitted_count", "awarded_count", "rejected_count",
              "win_rate", "upcoming_deadlines"]:
        assert k in j, f"missing {k}"
    assert isinstance(j["upcoming_deadlines"], list)
    for d in j["upcoming_deadlines"]:
        assert "days_until" in d
        assert d["days_until"] <= 120


# ---------- PROJECTS ----------
def test_projects_list(session):
    r = session.get(f"{BASE}/api/projects", timeout=10)
    assert r.status_code == 200
    projs = r.json()
    assert isinstance(projs, list)
    assert len(projs) >= 5, f"expected 5+ projects, got {len(projs)}"
    for p in projs:
        for k in ["total_revenue", "total_expense", "net_profit",
                  "profit_margin", "roi", "health_score",
                  "revenue_per_show", "timeline"]:
            assert k in p, f"project missing {k}"
        if p["timeline"]:
            t0 = p["timeline"][0]
            for k in ["cumulative_revenue", "cumulative_cost", "cumulative_net"]:
                assert k in t0
    # types cover models
    types = {p.get("type") for p in projs}
    assert types & {"Tour", "Album", "Film", "Writing Camp", "Festival"}


def test_project_detail(session):
    r = session.get(f"{BASE}/api/projects", timeout=10)
    pid = r.json()[0]["id"]
    r2 = session.get(f"{BASE}/api/projects/{pid}", timeout=10)
    assert r2.status_code == 200
    p = r2.json()
    assert "break_even_show" in p
    assert p["id"] == pid


def test_project_create(session):
    payload = {
        "name": "TEST_Project",
        "type": "Tour",
        "shows": 5,
        "revenue": {"Tickets": 10000, "Merch": 2000},
        "expenses": {"Flights": 3000, "Hotels": 2000},
        "milestones": [
            {"name": "Show 1", "date": "2026-02-01", "revenue": 6000, "cost": 2500},
            {"name": "Show 2", "date": "2026-02-05", "revenue": 6000, "cost": 2500},
        ],
        "risks": [],
    }
    r = session.post(f"{BASE}/api/projects", json=payload, timeout=10)
    assert r.status_code == 200, r.text
    p = r.json()
    assert p["total_revenue"] == 12000
    assert p["total_expense"] == 5000
    assert p["net_profit"] == 7000
    assert p["timeline"][1]["cumulative_revenue"] == 12000


def test_project_not_found(session):
    r = session.get(f"{BASE}/api/projects/does-not-exist", timeout=10)
    assert r.status_code == 404

