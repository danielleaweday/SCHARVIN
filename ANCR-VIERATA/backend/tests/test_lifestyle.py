"""VIEARTA Lifestyle backend tests (iteration_2)."""
import os
import uuid
import pytest
import requests
from datetime import datetime, timezone, timedelta

with open("/app/frontend/.env") as f:
    for line in f:
        if line.startswith("REACT_APP_BACKEND_URL="):
            BASE_URL = line.split("=", 1)[1].strip().rstrip("/")

DEMO_EMAIL = "jaylen@viearta.demo"
DEMO_PASSWORD = "demo123"


@pytest.fixture(scope="session")
def demo_token():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PASSWORD})
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="session")
def H(demo_token):
    return {"Authorization": f"Bearer {demo_token}"}


@pytest.fixture(scope="session")
def other_token():
    """Register a second user for privacy tests."""
    email = f"test_other_{uuid.uuid4().hex[:8]}@example.com"
    r = requests.post(f"{BASE_URL}/api/auth/register", json={
        "email": email, "password": "testpass123",
        "first_name": "Test", "last_name": "Other", "discipline": "Vocalist",
    })
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="session")
def H2(other_token):
    return {"Authorization": f"Bearer {other_token}"}


TODAY = datetime.now(timezone.utc).date().isoformat()
YESTERDAY = (datetime.now(timezone.utc).date() - timedelta(days=1)).isoformat()


# ---------------- 401 protection ----------------
def test_lifestyle_requires_auth():
    for ep in ["/api/lifestyle/foods", "/api/lifestyle/meals", "/api/lifestyle/targets",
               "/api/lifestyle/affirmations", "/api/lifestyle/mindfulness/activities",
               "/api/lifestyle/movement/activities", "/api/lifestyle/summary",
               "/api/lifestyle/nutrition/today"]:
        r = requests.get(f"{BASE_URL}{ep}")
        assert r.status_code == 401, f"{ep} -> {r.status_code}"


# ---------------- Foods ----------------
def test_foods_library(H):
    r = requests.get(f"{BASE_URL}/api/lifestyle/foods", headers=H)
    assert r.status_code == 200
    d = r.json()
    assert "library" in d and len(d["library"]) > 0
    assert "custom" in d


def test_foods_query_filter(H):
    r = requests.get(f"{BASE_URL}/api/lifestyle/foods?q=oat", headers=H)
    assert r.status_code == 200
    names = [f["name"].lower() for f in r.json()["library"]]
    assert all("oat" in n for n in names) and len(names) >= 1


def test_custom_food_scoped(H, H2):
    payload = {"name": "TEST_customfood", "kcal": 100, "protein": 5, "carbs": 10, "fat": 3, "fiber": 1}
    r = requests.post(f"{BASE_URL}/api/lifestyle/foods/custom", json=payload, headers=H)
    assert r.status_code == 200
    # User 1 sees it
    r1 = requests.get(f"{BASE_URL}/api/lifestyle/foods?q=TEST_customfood", headers=H)
    assert any(c["name"] == "TEST_customfood" for c in r1.json()["custom"])
    # User 2 does not
    r2 = requests.get(f"{BASE_URL}/api/lifestyle/foods?q=TEST_customfood", headers=H2)
    assert not any(c.get("name") == "TEST_customfood" for c in r2.json()["custom"])


# ---------------- Meals ----------------
def test_meal_totals(H):
    payload = {
        "date": TODAY, "meal_type": "snack",
        "items": [
            {"name": "A", "grams": 100, "kcal": 100, "protein": 10, "carbs": 20, "fat": 5, "fiber": 3},
            {"name": "B", "grams": 50, "kcal": 50, "protein": 5, "carbs": 10, "fat": 2, "fiber": 1},
        ],
    }
    r = requests.post(f"{BASE_URL}/api/lifestyle/meals", json=payload, headers=H)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["totals"]["kcal"] == 150
    assert d["totals"]["protein"] == 15
    assert d["totals"]["carbs"] == 30
    assert d["totals"]["fat"] == 7
    assert d["totals"]["fiber"] == 4
    # Delete it
    dr = requests.delete(f"{BASE_URL}/api/lifestyle/meals/{d['id']}", headers=H)
    assert dr.status_code == 200


def test_meals_filter_by_date(H):
    r = requests.get(f"{BASE_URL}/api/lifestyle/meals?date={TODAY}", headers=H)
    assert r.status_code == 200
    for m in r.json()["items"]:
        assert m["date"] == TODAY


def test_meal_duplicate(H):
    # Create meal for yesterday
    p = {"date": YESTERDAY, "meal_type": "snack",
         "items": [{"name": "TEST_dup", "grams": 50, "kcal": 60}]}
    src = requests.post(f"{BASE_URL}/api/lifestyle/meals", json=p, headers=H).json()
    dup = requests.post(f"{BASE_URL}/api/lifestyle/meals/duplicate/{src['id']}", headers=H)
    assert dup.status_code == 200
    d = dup.json()
    assert d["date"] == TODAY
    assert d["id"] != src["id"]
    requests.delete(f"{BASE_URL}/api/lifestyle/meals/{src['id']}", headers=H)
    requests.delete(f"{BASE_URL}/api/lifestyle/meals/{d['id']}", headers=H)


def test_meal_copy_yesterday(H):
    # Ensure at least 1 meal yesterday
    requests.post(f"{BASE_URL}/api/lifestyle/meals", json={
        "date": YESTERDAY, "meal_type": "snack",
        "items": [{"name": "TEST_cy", "grams": 50, "kcal": 60}],
    }, headers=H)
    r = requests.post(f"{BASE_URL}/api/lifestyle/meals/copy-yesterday", headers=H)
    assert r.status_code == 200
    assert r.json()["copied"] >= 1


# ---------------- Saved meals ----------------
def test_saved_meals_crud(H):
    p = {"name": "TEST_savedmeal", "meal_type": "snack",
         "items": [{"name": "X", "grams": 100, "kcal": 200, "protein": 10, "carbs": 20, "fat": 5, "fiber": 2}]}
    r = requests.post(f"{BASE_URL}/api/lifestyle/saved-meals", json=p, headers=H)
    assert r.status_code == 200
    sid = r.json()["id"]
    lst = requests.get(f"{BASE_URL}/api/lifestyle/saved-meals", headers=H).json()
    assert any(x["id"] == sid for x in lst["items"])
    d = requests.delete(f"{BASE_URL}/api/lifestyle/saved-meals/{sid}", headers=H)
    assert d.status_code == 200


# ---------------- Hydration ----------------
def test_hydration_sum(H):
    before = requests.get(f"{BASE_URL}/api/lifestyle/nutrition/today", headers=H).json()["water_ml"]
    requests.post(f"{BASE_URL}/api/lifestyle/hydration", json={"date": TODAY, "ml": 250}, headers=H)
    after = requests.get(f"{BASE_URL}/api/lifestyle/nutrition/today", headers=H).json()["water_ml"]
    assert after == before + 250


# ---------------- Targets ----------------
def test_targets_default_and_put(H2):
    # Fresh user -> defaults
    r = requests.get(f"{BASE_URL}/api/lifestyle/targets", headers=H2)
    assert r.status_code == 200
    d = r.json()
    assert d.get("is_default") is True
    assert d["calories"] == 2400
    # Put valid
    p = {"calories": 2500, "protein_g": 140, "carbs_g": 300, "fat_g": 80, "fiber_g": 30, "water_ml": 2500, "objective": "everyday_energy"}
    r2 = requests.put(f"{BASE_URL}/api/lifestyle/targets", json=p, headers=H2)
    assert r2.status_code == 200
    r3 = requests.get(f"{BASE_URL}/api/lifestyle/targets", headers=H2).json()
    assert r3["calories"] == 2500 and r3.get("is_default") is False


def test_targets_reject_unsafe(H2):
    for bad in [{"calories": 800, "protein_g": 140, "carbs_g": 300, "fat_g": 80, "fiber_g": 30, "water_ml": 2500},
                {"calories": 7000, "protein_g": 140, "carbs_g": 300, "fat_g": 80, "fiber_g": 30, "water_ml": 2500}]:
        r = requests.put(f"{BASE_URL}/api/lifestyle/targets", json=bad, headers=H2)
        assert r.status_code in (400, 422)


def test_targets_estimate_blocks(H):
    # Under 18
    r = requests.post(f"{BASE_URL}/api/lifestyle/targets/estimate", json={"age": 16, "activity": "moderate"}, headers=H)
    assert r.status_code == 200 and r.json()["blocked"] is True
    # Pregnancy
    r2 = requests.post(f"{BASE_URL}/api/lifestyle/targets/estimate", json={"age": 25, "pregnancy": True}, headers=H)
    assert r2.json()["blocked"] is True
    # Eating disorder
    r3 = requests.post(f"{BASE_URL}/api/lifestyle/targets/estimate", json={"age": 25, "eating_disorder": True}, headers=H)
    assert r3.json()["blocked"] is True
    # Chronic condition
    r4 = requests.post(f"{BASE_URL}/api/lifestyle/targets/estimate", json={"age": 25, "chronic_condition": True}, headers=H)
    assert r4.json()["blocked"] is True


def test_targets_estimate_valid(H):
    r = requests.post(f"{BASE_URL}/api/lifestyle/targets/estimate", json={
        "age": 25, "activity": "moderate", "discipline": "Producer",
        "objective": "support_performance_preparation",
    }, headers=H)
    assert r.status_code == 200
    d = r.json()
    assert d["blocked"] is False
    est = d["estimate"]
    for k in ["calories", "protein_g", "carbs_g", "fat_g", "fiber_g", "water_ml"]:
        assert est[k] > 0
    assert "disclaimer" in d


# ---------------- Nutrition today ----------------
def test_nutrition_today_shape(H):
    r = requests.get(f"{BASE_URL}/api/lifestyle/nutrition/today", headers=H)
    assert r.status_code == 200
    d = r.json()
    for k in ["meals", "totals", "water_ml", "targets"]:
        assert k in d


def test_nutrition_reflection_upsert(H):
    p = {"date": TODAY, "nourished": 4, "energy_steadiness": 3, "affected_focus": "TEST_focus", "tomorrow_intention": "TEST_tom"}
    r = requests.post(f"{BASE_URL}/api/lifestyle/nutrition/reflection", json=p, headers=H)
    assert r.status_code == 200
    # Upsert - second call updates
    p["nourished"] = 5
    r2 = requests.post(f"{BASE_URL}/api/lifestyle/nutrition/reflection", json=p, headers=H)
    assert r2.status_code == 200
    g = requests.get(f"{BASE_URL}/api/lifestyle/nutrition/reflection?date={TODAY}", headers=H).json()
    assert g["nourished"] == 5


# ---------------- Affirmations ----------------
def test_affirmations_list(H):
    r = requests.get(f"{BASE_URL}/api/lifestyle/affirmations", headers=H)
    assert r.status_code == 200
    d = r.json()
    assert d["total"] == 63
    assert len(d["themes"]) >= 10


def test_affirmations_filter(H):
    r = requests.get(f"{BASE_URL}/api/lifestyle/affirmations?theme=rest", headers=H).json()
    assert all(a["theme"] == "rest" for a in r["items"])
    r2 = requests.get(f"{BASE_URL}/api/lifestyle/affirmations?q=voice", headers=H).json()
    assert len(r2["items"]) >= 1


def test_affirmations_today(H):
    r = requests.get(f"{BASE_URL}/api/lifestyle/affirmations/today", headers=H)
    assert r.status_code == 200
    d = r.json()
    assert "id" in d and "text" in d and "theme" in d and "favorited" in d


def test_affirmation_toggle_and_reflection(H2):
    aid = "af_010"
    r1 = requests.post(f"{BASE_URL}/api/lifestyle/affirmations/{aid}/favorite", headers=H2)
    assert r1.json()["favorited"] is True
    # Save reflection
    r2 = requests.post(f"{BASE_URL}/api/lifestyle/affirmations/reflection", json={"affirmation_id": aid, "note": "TEST_ref"}, headers=H2)
    assert r2.status_code == 200
    favs = requests.get(f"{BASE_URL}/api/lifestyle/affirmations/favorites", headers=H2).json()
    assert any(f["id"] == aid and f["reflection"] == "TEST_ref" for f in favs["items"])
    # Toggle off
    r3 = requests.post(f"{BASE_URL}/api/lifestyle/affirmations/{aid}/favorite", headers=H2)
    assert r3.json()["favorited"] is False


def test_jaylen_seeded_favorites(H):
    r = requests.get(f"{BASE_URL}/api/lifestyle/affirmations/favorites", headers=H).json()
    items = r["items"]
    assert len(items) >= 2
    aids = {i["id"] for i in items}
    assert "af_002" in aids and "af_013" in aids
    for i in items:
        if i["id"] in ("af_002", "af_013"):
            assert i.get("reflection")


# ---------------- Mindfulness ----------------
def test_mindfulness_list(H):
    r = requests.get(f"{BASE_URL}/api/lifestyle/mindfulness/activities", headers=H).json()
    assert len(r["items"]) == 10
    for a in r["items"]:
        assert "steps" in a and "purpose" in a and "duration_seconds" in a


def test_mindfulness_complete(H2):
    r = requests.post(f"{BASE_URL}/api/lifestyle/mindfulness/complete",
                      json={"activity_id": "mf_reset_2", "duration_seconds": 120, "reflection": "TEST_mf"},
                      headers=H2)
    assert r.status_code == 200
    lst = requests.get(f"{BASE_URL}/api/lifestyle/mindfulness/completions", headers=H2).json()
    assert any(x.get("reflection") == "TEST_mf" for x in lst["items"])


# ---------------- Movement ----------------
def test_movement_list(H):
    r = requests.get(f"{BASE_URL}/api/lifestyle/movement/activities", headers=H).json()
    assert len(r["items"]) == 17


def test_movement_today_personalized(H):
    r = requests.get(f"{BASE_URL}/api/lifestyle/movement/today", headers=H).json()
    assert "activity" in r and r["activity"].get("id", "").startswith("mv_")
    # Jaylen has today's check-in via seed
    assert r["personalized"] is True


def test_movement_complete(H2):
    r = requests.post(f"{BASE_URL}/api/lifestyle/movement/complete",
                      json={"custom_name": "TEST_walk", "duration_seconds": 600, "intensity": 2},
                      headers=H2)
    assert r.status_code == 200


# ---------------- Routines ----------------
def test_routines_crud(H2):
    r = requests.post(f"{BASE_URL}/api/lifestyle/routines",
                      json={"name": "TEST_routine", "activity_ids": ["mv_chair", "mv_neck"]}, headers=H2)
    assert r.status_code == 200
    rid = r.json()["id"]
    lst = requests.get(f"{BASE_URL}/api/lifestyle/routines", headers=H2).json()
    assert any(x["id"] == rid for x in lst["items"])
    d = requests.delete(f"{BASE_URL}/api/lifestyle/routines/{rid}", headers=H2)
    assert d.status_code == 200


# ---------------- Summary ----------------
def test_lifestyle_summary(H):
    r = requests.get(f"{BASE_URL}/api/lifestyle/summary", headers=H).json()
    assert len(r["series"]) == 7
    for s in r["series"]:
        for k in ["kcal", "protein", "carbs", "fat", "fiber", "water_ml"]:
            assert k in s
    assert r["mindfulness_sessions"] >= 3
    assert r["movement_minutes"] >= 20
    assert r["affirmations_saved"] >= 2


# ---------------- Privacy ----------------
def test_privacy_meals_scope(H, H2):
    # H1 creates a meal
    p = {"date": TODAY, "meal_type": "snack",
         "items": [{"name": "TEST_priv", "grams": 10, "kcal": 10}]}
    m = requests.post(f"{BASE_URL}/api/lifestyle/meals", json=p, headers=H).json()
    # H2 lists meals
    lst = requests.get(f"{BASE_URL}/api/lifestyle/meals?date={TODAY}", headers=H2).json()
    assert not any(x["id"] == m["id"] for x in lst["items"])
    # cleanup
    requests.delete(f"{BASE_URL}/api/lifestyle/meals/{m['id']}", headers=H)
