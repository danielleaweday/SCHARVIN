import os
import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL missing")
BASE_URL = base_url.rstrip("/")
API = f"{BASE_URL}/api"

AI_TIMEOUT = 180


@pytest.fixture(scope="session")
def c():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Meta / user / dashboard ----------
class TestCore:
    def test_root(self, c):
        r = c.get(f"{API}/", timeout=30)
        assert r.status_code == 200, r.text
        assert r.json()["status"] == "ok"

    def test_me(self, c):
        r = c.get(f"{API}/me", timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["first_name"] == "Maya"
        assert "_id" not in d
        assert d["passport_doc"]["number_masked"].startswith("•") or "•" in d["passport_doc"]["number_masked"]

    def test_dashboard(self, c):
        r = c.get(f"{API}/dashboard", timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "Maya" in d["greeting"]
        assert d["upcoming"]["trip_id"] == "tokyo-creative-exchange"
        assert d["upcoming"]["destination"]
        assert isinstance(d["readiness"]["overall"], int)
        assert len(d["continue_learning"]) == 3
        assert d["insight"]["title"] if isinstance(d["insight"], dict) else True
        assert d["alerts"][0]["level"] == "demo"

    def test_notifications(self, c):
        r = c.get(f"{API}/notifications", timeout=30)
        assert r.status_code == 200
        assert len(r.json()) >= 2


# ---------- Destinations ----------
class TestDestinations:
    def test_list(self, c):
        r = c.get(f"{API}/destinations", timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert len(d) >= 6
        ids = {x["id"] for x in d}
        for expected in ["japan", "ghana", "france", "brazil", "south-korea", "united-kingdom"]:
            assert expected in ids, f"missing {expected} in {ids}"
        assert all("_id" not in x for x in d)

    def test_search_filter(self, c):
        r = c.get(f"{API}/destinations", params={"q": "japan"}, timeout=30)
        assert r.status_code == 200
        assert [x["id"] for x in r.json()] == ["japan"]

    def test_japan_detail(self, c):
        r = c.get(f"{API}/destinations/japan", timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["country"] == "Japan"
        assert d["disclaimer"]
        assert d["emergency_numbers"]
        assert d["embassy"]
        assert isinstance(d["saved"], bool)

    def test_unknown_destination_404(self, c):
        r = c.get(f"{API}/destinations/atlantis", timeout=30)
        assert r.status_code == 404, r.text

    def test_save_toggle_and_persistence(self, c):
        # ensure starting from unsaved
        cur = c.get(f"{API}/destinations/japan", timeout=30).json()["saved"]
        if cur:
            c.post(f"{API}/destinations/japan/save", timeout=30)
        r = c.post(f"{API}/destinations/japan/save", timeout=30)
        assert r.status_code == 200 and r.json()["saved"] is True, r.text
        saved = c.get(f"{API}/saved-destinations", timeout=30).json()
        assert "japan" in [x["id"] for x in saved]
        assert c.get(f"{API}/destinations/japan", timeout=30).json()["saved"] is True
        # toggle off
        r = c.post(f"{API}/destinations/japan/save", timeout=30)
        assert r.json()["saved"] is False
        saved = c.get(f"{API}/saved-destinations", timeout=30).json()
        assert "japan" not in [x["id"] for x in saved]
        # restore saved state for UI demo
        c.post(f"{API}/destinations/japan/save", timeout=30)


# ---------- Courses ----------
COURSE = "creative-collaboration-japan"


@pytest.fixture()
def reset_course_progress():
    """Course progress persists in Mongo; reset so lesson-by-lesson assertions are deterministic."""
    from pymongo import MongoClient
    env = dotenv_values("/app/backend/.env")
    mongo_url = env.get("MONGO_URL")
    db_name = env.get("DB_NAME")
    if not mongo_url or not db_name:
        pytest.skip("MONGO_URL/DB_NAME missing from /app/backend/.env")
    cl = MongoClient(mongo_url)
    dbh = cl[db_name]
    dbh.course_progress.delete_many({"user_id": "maya", "course_id": COURSE})
    dbh.badges.delete_many({"user_id": "maya", "course_id": COURSE})
    yield
    cl.close()


class TestCourses:
    def test_list_courses(self, c):
        r = c.get(f"{API}/courses", timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["categories"]
        assert COURSE in [x["id"] for x in d["courses"]]

    def test_course_detail(self, c):
        r = c.get(f"{API}/courses/{COURSE}", timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert len(d["lessons"]) == 5, f"expected 5 lessons, got {len(d['lessons'])}"
        assert d["badge"]
        assert "progress" in d

    def test_unknown_course_404(self, c):
        r = c.get(f"{API}/courses/nope", timeout=30)
        assert r.status_code == 404

    def test_complete_all_lessons_awards_certificate_and_badge(self, c, reset_course_progress):
        lessons = c.get(f"{API}/courses/{COURSE}", timeout=30).json()["lessons"]
        last = None
        for i, l in enumerate(lessons):
            r = c.post(f"{API}/courses/{COURSE}/complete-lesson", json={"lesson_id": l["id"]}, timeout=30)
            assert r.status_code == 200, r.text
            last = r.json()
            if i < len(lessons) - 1:
                assert last["certificate"] is False, f"certificate awarded early at lesson {i+1}"
        assert last["certificate"] is True
        assert last["badge_earned"] is True
        assert last["percent"] == 100
        # persistence
        det = c.get(f"{API}/courses/{COURSE}", timeout=30).json()
        assert det["progress"]["certificate"] is True
        listed = next(x for x in c.get(f"{API}/courses", timeout=30).json()["courses"] if x["id"] == COURSE)
        assert listed["percent"] == 100 and listed["certificate"] is True
        # badge on passport
        p = c.get(f"{API}/passport", timeout=30).json()
        assert any(b["label"] == det["badge"] for b in p["badges"]), p["badges"]


# ---------- Translator (AI) ----------
class TestTranslator:
    def test_translate_conversation(self, c):
        r = c.post(f"{API}/translate", json={"text": "Let's take it from the second chorus.",
                                            "source_lang": "English", "target_lang": "Japanese"}, timeout=AI_TIMEOUT)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["translated"] and isinstance(d["translated"], str)
        assert d["pronunciation"]
        assert d["formality"] in ("casual", "neutral", "formal")
        assert "_id" not in d

    def test_translate_lyrics(self, c):
        r = c.post(f"{API}/translate/lyrics", json={
            "lyrics": "I was born in the rain, chasing dreams down an empty lane",
            "target_lang": "Japanese", "purpose": "Cultural Interpretation"}, timeout=AI_TIMEOUT)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["translated"]
        assert isinstance(d["idioms"], list)
        assert isinstance(d["flags"], list)
        assert isinstance(d["syllables"], dict) and "source" in d["syllables"] and "target" in d["syllables"]
        assert d["review_notice"]

    def test_phrase_crud(self, c):
        payload = {"original": "TEST_hello", "translated": "TEST_konnichiwa", "source_lang": "English",
                   "target_lang": "Japanese", "pronunciation": "kon-ni-chi-wa"}
        r = c.post(f"{API}/phrases", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        pid = r.json()["id"]
        assert r.json()["original"] == "TEST_hello"
        rows = c.get(f"{API}/phrases", timeout=30).json()
        assert pid in [x["id"] for x in rows]
        assert c.delete(f"{API}/phrases/{pid}", timeout=30).status_code == 200
        rows = c.get(f"{API}/phrases", timeout=30).json()
        assert pid not in [x["id"] for x in rows]

    def test_creative_phrases(self, c):
        r = c.get(f"{API}/creative-phrases", params={"q": "chorus"}, timeout=30)
        assert r.status_code == 200
        assert len(r.json()) >= 1


# ---------- Checklist ----------
class TestChecklist:
    def test_default_and_discipline_adaptive(self, c):
        base = c.get(f"{API}/checklist", timeout=30)
        assert base.status_code == 200, base.text
        b = base.json()
        assert b["items"] and b["categories"] and b["disciplines"]
        film = c.get(f"{API}/checklist", params={"discipline": "Filmmaker"}, timeout=30).json()
        assert film["discipline"] == "Filmmaker"
        assert {i["title"] for i in film["items"]} != {i["title"] for i in b["items"]}, \
            "Filmmaker checklist identical to default - not discipline adaptive"

    def test_patch_toggles_and_percent(self, c):
        data = c.get(f"{API}/checklist", timeout=30).json()
        item = next(i for i in data["items"] if not i["done"])
        before_done = data["done"]
        r = c.patch(f"{API}/checklist/{item['id']}", json={"done": True}, timeout=30)
        assert r.status_code == 200, r.text
        assert r.json()["done"] is True
        after = c.get(f"{API}/checklist", timeout=30).json()
        assert after["done"] == before_done + 1
        assert after["percent"] == round(after["done"] / after["total"] * 100)
        # revert
        rev = c.patch(f"{API}/checklist/{item['id']}", json={"done": False}, timeout=30)
        assert rev.status_code == 200
        assert rev.json()["done"] is False, "done=False ignored (falsy filtered out of update)"


# ---------- Trips / Trip mode / Safety ----------
class TestTrips:
    def test_list_trips(self, c):
        r = c.get(f"{API}/trips", timeout=30)
        assert r.status_code == 200, r.text
        assert "tokyo-creative-exchange" in [t["id"] for t in r.json()]

    def test_trip_detail(self, c):
        r = c.get(f"{API}/trips/tokyo-creative-exchange", timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["itinerary"]
        assert d["destination"]

    def test_trip_404(self, c):
        assert c.get(f"{API}/trips/nope", timeout=30).status_code == 404

    def test_trip_mode(self, c):
        r = c.get(f"{API}/trip-mode", timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert len(d["essential_phrases"]) == 5
        assert d["emergency_numbers"] and d["embassy"] and d["help_options"]
        assert "does NOT contact real emergency services" in d["disclaimer"]

    def test_safety_and_location_sharing(self, c):
        r = c.get(f"{API}/safety", timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["resources"] and d["help_options"]
        assert isinstance(d["location_sharing"], bool)
        assert c.put(f"{API}/safety/location-sharing", json={"enabled": True}, timeout=30).json()["location_sharing"] is True
        assert c.get(f"{API}/safety", timeout=30).json()["location_sharing"] is True
        assert c.put(f"{API}/safety/location-sharing", json={"enabled": False}, timeout=30).json()["location_sharing"] is False
        assert c.get(f"{API}/safety", timeout=30).json()["location_sharing"] is False


# ---------- Network ----------
class TestNetwork:
    def test_list_and_filters(self, c):
        r = c.get(f"{API}/network", timeout=30)
        assert r.status_code == 200, r.text
        rows = r.json()
        assert rows
        types = {x["type"] for x in rows}
        t = sorted(types)[0]
        filtered = c.get(f"{API}/network", params={"type": t}, timeout=30).json()
        assert filtered and all(x["type"] == t for x in filtered)
        q = c.get(f"{API}/network", params={"q": rows[0]["city"]}, timeout=30).json()
        assert q

    def test_connect_toggle(self, c):
        nid = c.get(f"{API}/network", timeout=30).json()[0]["id"]
        first = c.post(f"{API}/network/{nid}/connect", timeout=30).json()["connected"]
        rows = {x["id"]: x["connected"] for x in c.get(f"{API}/network", timeout=30).json()}
        assert rows[nid] is first
        second = c.post(f"{API}/network/{nid}/connect", timeout=30).json()["connected"]
        assert second is (not first)


# ---------- Journal ----------
class TestJournal:
    def test_crud(self, c):
        r = c.post(f"{API}/journal", json={"title": "TEST_entry", "body": "Tokyo notes",
                                          "location": "Tokyo", "mood": "Inspired"}, timeout=30)
        assert r.status_code == 200, r.text
        eid = r.json()["id"]
        assert r.json()["title"] == "TEST_entry"
        rows = c.get(f"{API}/journal", timeout=30).json()
        got = next((x for x in rows if x["id"] == eid), None)
        assert got and got["body"] == "Tokyo notes"
        assert c.delete(f"{API}/journal/{eid}", timeout=30).status_code == 200
        assert eid not in [x["id"] for x in c.get(f"{API}/journal", timeout=30).json()]


# ---------- Passport ----------
class TestPassport:
    def test_passport(self, c):
        r = c.get(f"{API}/passport", timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["user"]["first_name"] == "Maya"
        assert d["documents"][0]["masked"]
        assert "•" in d["documents"][0]["masked"]
        assert d["visa_records"][0]["masked"] is True
        assert isinstance(d["badges"], list)
        assert d["disclaimer"]


# ---------- Classroom ----------
class TestClassroom:
    def test_classroom(self, c):
        r = c.get(f"{API}/classroom", timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["assignments"] and d["roster"] and d["announcements"], list(d.keys())

    def test_create_assignment(self, c):
        r = c.post(f"{API}/classroom/assignments",
                   json={"title": "TEST_Assignment", "destination_id": "japan", "due": "2026-09-01"}, timeout=30)
        assert r.status_code == 200, r.text
        a = r.json()
        assert a["title"] == "TEST_Assignment"
        assert len(a["components"]) == 6
        assert a["cover"]
        listed = c.get(f"{API}/classroom", timeout=30).json()["assignments"]
        assert a["id"] in [x["id"] for x in listed]


# ---------- Music Compass (static) ----------
class TestMusicStatic:
    def test_overview(self, c):
        r = c.get(f"{API}/music/overview", timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["traditions_count"] == 9, d["traditions_count"]
        assert d["stewardship_notice"] and d["audio_notice"]

    def test_traditions(self, c):
        r = c.get(f"{API}/music/traditions", timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert len(d) == 9, len(d)
        assert all(x["permission_level"] for x in d)
        assert "hindustani" in [x["id"] for x in d]

    def test_tradition_detail(self, c):
        r = c.get(f"{API}/music/traditions/hindustani", timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        gov = d["gov"]
        for k in ("permission_level",):
            assert k in gov
        assert d["stewardship_notice"]
        assert d.get("pitch") or d.get("scales") or d.get("rhythm"), d.keys()

    def test_tradition_404(self, c):
        assert c.get(f"{API}/music/traditions/nope", timeout=30).status_code == 404

    def test_comparisons(self, c):
        r = c.get(f"{API}/music/comparisons", timeout=30)
        assert r.status_code == 200 and len(r.json()) >= 1

    def test_rhythms(self, c):
        r = c.get(f"{API}/music/rhythms", timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["rhythms"] and d["audio_notice"]

    def test_instruments(self, c):
        r = c.get(f"{API}/music/instruments", timeout=30)
        assert r.status_code == 200 and len(r.json()) >= 1

    def test_session_phrases(self, c):
        r = c.get(f"{API}/music/session-phrases", timeout=30)
        assert r.status_code == 200 and len(r.json()) >= 1

    def test_music_classroom(self, c):
        r = c.get(f"{API}/music/classroom", timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["pathway"] and d["tiers"] and d["demo_pathways"]

    def test_pathway(self, c):
        r = c.get(f"{API}/music/pathways/us-to-india", timeout=30)
        assert r.status_code == 200, r.text
        assert r.json()["id"] == "us-to-india"

    def test_pathway_404(self, c):
        assert c.get(f"{API}/music/pathways/nope", timeout=30).status_code == 404


# ---------- Music Compass (AI) ----------
class TestMusicAI:
    def test_compare(self, c):
        r = c.post(f"{API}/music/compare", json={"a": "american-jazz", "b": "hindustani"}, timeout=AI_TIMEOUT)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["a"]["id"] == "american-jazz" and d["b"]["id"] == "hindustani"
        for k in ["familiar_concepts", "similar_but_different", "new_vocabulary", "listening",
                  "common_mistakes", "questions_to_ask"]:
            assert isinstance(d[k], list) and d[k], f"{k} empty/invalid"
        for k in ["pitch_tuning", "rhythm_time", "improvisation", "rehearsal_communication", "ensemble_hierarchy"]:
            assert isinstance(d[k], str) and d[k], f"{k} empty/invalid"
        assert d["stewardship_notice"]

    def test_compare_404(self, c):
        r = c.post(f"{API}/music/compare", json={"a": "nope", "b": "hindustani"}, timeout=60)
        assert r.status_code == 404

    def test_session_translate(self, c):
        r = c.post(f"{API}/music/session-translate",
                   json={"text": "Can we take it from the top of the second section?",
                         "target_lang": "Japanese", "tradition": "gagaku"}, timeout=AI_TIMEOUT)
        assert r.status_code == 200, r.text
        d = r.json()
        for k in ["translated", "pronunciation", "music_meaning", "cultural_context", "potential_misunderstanding"]:
            assert d.get(k), f"{k} missing"

    def test_rehearsal_plan(self, c):
        r = c.post(f"{API}/music/rehearsal-plan", json={
            "destination": "India", "tradition": "hindustani", "discipline": "Musician",
            "role": "Guest soloist", "engagement": "Festival performance",
            "repertoire": "Original fusion set", "collaborators": "Local tabla and sarangi players"},
            timeout=AI_TIMEOUT)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["tradition"]["id"] == "hindustani"
        assert isinstance(d["readiness_checklist"], list) and d["readiness_checklist"]
        for k in ["musical_vocabulary", "listening", "director_questions", "rights_credit_questions",
                  "permission_questions", "language_practice"]:
            assert isinstance(d[k], list) and d[k], f"{k} empty"
        for k in ["pitch_tuning_prep", "rhythm_prep", "cultural_background", "rehearsal_etiquette",
                  "professional_conduct", "instrument_considerations"]:
            assert isinstance(d[k], str) and d[k], f"{k} empty"

    def test_knowledge_translate(self, c):
        r = c.post(f"{API}/music/knowledge-translate",
                   json={"instruction": "Play it more bluesy, bend the third",
                         "target_tradition": "hindustani"}, timeout=AI_TIMEOUT)
        assert r.status_code == 200, r.text
        d = r.json()
        for k in ["direct_reference", "approximate_comparison", "rehearsal_recommendation",
                  "cultural_context", "practitioner_verification_needed"]:
            assert isinstance(d[k], str) and d[k], f"{k} empty"
        for k in ["important_differences", "terminology_to_avoid", "questions_to_ask"]:
            assert isinstance(d[k], list), f"{k} not list"
