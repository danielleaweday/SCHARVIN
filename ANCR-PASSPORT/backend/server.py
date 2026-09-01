from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import json
import asyncio
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime, timezone
import uuid

from emergentintegrations.llm.chat import LlmChat, UserMessage

import seed_data as SEED
import music_data as MUSIC

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

app = FastAPI(title="ANCR Passport API")
api = APIRouter(prefix="/api")
logger = logging.getLogger("ancr_passport")
logging.basicConfig(level=logging.INFO)

UID = "maya"

def now_iso():
    return datetime.now(timezone.utc).isoformat()

def new_id():
    return str(uuid.uuid4())


# ---------- Seed ----------
async def seed():
    # Static content: always refresh
    await db.destinations.delete_many({})
    await db.destinations.insert_many([{**d} for d in SEED.DESTINATIONS])
    await db.courses.delete_many({})
    await db.courses.insert_many([{**c} for c in SEED.COURSES])
    await db.network.delete_many({})
    await db.network.insert_many([{**n} for n in SEED.NETWORK])

    # User document (upsert once)
    if not await db.users.find_one({"id": UID}):
        await db.users.insert_one({**SEED.DEMO_USER})

    # Trips (seed once)
    if await db.trips.count_documents({}) == 0:
        await db.trips.insert_many([{**t} for t in SEED.TRIPS])

    # Checklist items (seed once, add ids)
    if await db.checklist.count_documents({}) == 0:
        items = [{**it, "id": new_id(), "user_id": UID} for it in SEED.CHECKLIST_ITEMS]
        await db.checklist.insert_many(items)

    # Classroom (single doc)
    if not await db.classroom.find_one({"id": "main"}):
        await db.classroom.insert_one({"id": "main", **SEED.CLASSROOM})


@app.on_event("startup")
async def on_start():
    await seed()


def clean(doc):
    if doc and "_id" in doc:
        doc.pop("_id")
    return doc


# ---------- Meta / user ----------
@api.get("/")
async def root():
    return {"app": "ANCR Passport", "status": "ok"}

@api.get("/me")
async def get_me():
    user = clean(await db.users.find_one({"id": UID}))
    return user

class RoleUpdate(BaseModel):
    role: str

@api.put("/me/role")
async def set_role(body: RoleUpdate):
    await db.users.update_one({"id": UID}, {"$set": {"role": body.role}})
    return clean(await db.users.find_one({"id": UID}))


# ---------- Dashboard ----------
@api.get("/dashboard")
async def dashboard():
    user = clean(await db.users.find_one({"id": UID}))
    trip = clean(await db.trips.find_one({"id": "tokyo-creative-exchange"}))
    checklist = await db.checklist.find({"user_id": UID}).to_list(1000)
    total = len(checklist)
    done = len([c for c in checklist if c.get("done")])
    required_actions = [c["title"] for c in checklist if not c.get("done") and c.get("priority") in ("urgent", "required")][:4]
    readiness = {
        "passport": 100, "visa": 40, "cultural": 60,
        "language": 45, "health_safety": 55, "professional": 80,
    }
    overall = round(sum(readiness.values()) / len(readiness))
    insight = SEED.CULTURAL_INSIGHTS[0]
    courses = await db.courses.find().to_list(100)
    continue_learning = []
    jp = next((c for c in courses if c["id"] == "creative-collaboration-japan"), None)
    if jp:
        for l in jp["lessons"][:3]:
            continue_learning.append({"course_id": jp["id"], "lesson_id": l["id"], "title": l["title"], "minutes": l["minutes"]})
    return {
        "user": user,
        "greeting": f"Good morning, {user['first_name']}. Where will your creativity take you next?",
        "upcoming": {
            "trip_id": trip["id"], "destination": trip["destination"], "purpose": trip["purpose"],
            "start_date": trip["start_date"], "end_date": trip["end_date"],
            "readiness": trip["readiness"], "required_actions": required_actions, "cover": trip["cover"],
        },
        "readiness": {**readiness, "overall": overall, "checklist_done": done, "checklist_total": total},
        "continue_learning": continue_learning,
        "insight": insight,
        "alerts": [{
            "level": "demo", "title": "Demonstration Travel Alert",
            "body": "This is a clearly labeled demonstration alert. ANCR Passport does not display live government warnings in this build.",
            "disclaimer": SEED.DISCLAIMER,
        }],
    }


# ---------- Destinations ----------
@api.get("/destinations")
async def list_destinations(q: Optional[str] = None):
    dests = await db.destinations.find().to_list(100)
    saved = await db.saved_destinations.find({"user_id": UID}).to_list(100)
    saved_ids = {s["destination_id"] for s in saved}
    out = []
    for d in dests:
        clean(d)
        if q:
            hay = f"{d['country']} {' '.join(d['major_cities'])} {d['region']}".lower()
            if q.lower() not in hay:
                continue
        out.append({"id": d["id"], "country": d["country"], "flag": d["flag"], "region": d["region"],
                    "tagline": d["tagline"], "thumb": d["thumb"], "hero": d["hero"],
                    "match_score": d["match_score"], "featured": d.get("featured", False),
                    "languages": d["languages"], "currency": d["currency"],
                    "saved": d["id"] in saved_ids})
    return out

@api.get("/destinations/{dest_id}")
async def get_destination(dest_id: str):
    d = clean(await db.destinations.find_one({"id": dest_id}))
    if not d:
        raise HTTPException(404, "Destination not found")
    saved = await db.saved_destinations.find_one({"user_id": UID, "destination_id": dest_id})
    d["saved"] = bool(saved)
    d["disclaimer"] = SEED.DISCLAIMER
    return d

@api.post("/destinations/{dest_id}/save")
async def toggle_save(dest_id: str):
    existing = await db.saved_destinations.find_one({"user_id": UID, "destination_id": dest_id})
    if existing:
        await db.saved_destinations.delete_one({"_id": existing["_id"]})
        return {"saved": False}
    await db.saved_destinations.insert_one({"id": new_id(), "user_id": UID, "destination_id": dest_id, "saved_at": now_iso()})
    return {"saved": True}

@api.get("/saved-destinations")
async def saved_destinations():
    saved = await db.saved_destinations.find({"user_id": UID}).to_list(100)
    ids = [s["destination_id"] for s in saved]
    dests = await db.destinations.find({"id": {"$in": ids}}).to_list(100)
    return [{"id": d["id"], "country": d["country"], "flag": d["flag"], "thumb": d["thumb"], "tagline": d["tagline"]} for d in [clean(x) for x in dests]]


# ---------- Courses ----------
@api.get("/courses")
async def list_courses():
    courses = await db.courses.find().to_list(100)
    progress = await db.course_progress.find({"user_id": UID}).to_list(100)
    pmap = {p["course_id"]: p for p in progress}
    out = []
    for c in courses:
        clean(c)
        p = pmap.get(c["id"])
        completed = len(p["completed_lessons"]) if p else 0
        out.append({"id": c["id"], "title": c["title"], "category": c["category"], "level": c["level"],
                    "estimated_minutes": c["estimated_minutes"], "cover": c["cover"], "overview": c["overview"],
                    "badge": c["badge"], "lessons_total": len(c["lessons"]),
                    "lessons_done": completed,
                    "percent": round(completed / len(c["lessons"]) * 100) if c["lessons"] else 0,
                    "certificate": bool(p and p.get("certificate"))})
    return {"courses": out, "categories": SEED.CATEGORIES}

@api.get("/courses/{course_id}")
async def get_course(course_id: str):
    c = clean(await db.courses.find_one({"id": course_id}))
    if not c:
        raise HTTPException(404, "Course not found")
    p = clean(await db.course_progress.find_one({"user_id": UID, "course_id": course_id}))
    c["progress"] = p or {"completed_lessons": [], "certificate": False, "badge_earned": False}
    return c

class LessonComplete(BaseModel):
    lesson_id: str

@api.post("/courses/{course_id}/complete-lesson")
async def complete_lesson(course_id: str, body: LessonComplete):
    course = await db.courses.find_one({"id": course_id})
    if not course:
        raise HTTPException(404, "Course not found")
    p = await db.course_progress.find_one({"user_id": UID, "course_id": course_id})
    if not p:
        p = {"id": new_id(), "user_id": UID, "course_id": course_id, "completed_lessons": [], "certificate": False, "badge_earned": False}
        await db.course_progress.insert_one(p)
    valid_ids = {l["id"] for l in course["lessons"]}
    if body.lesson_id not in valid_ids:
        raise HTTPException(400, "Unknown lesson for this course")
    completed = set(p["completed_lessons"]) & valid_ids
    completed.add(body.lesson_id)
    completed = list(completed)
    all_done = valid_ids.issubset(set(completed))
    update = {"completed_lessons": completed}
    if all_done:
        update["certificate"] = True
        update["badge_earned"] = True
        # award badge
        if not await db.badges.find_one({"user_id": UID, "course_id": course_id}):
            await db.badges.insert_one({"id": new_id(), "user_id": UID, "course_id": course_id,
                                        "label": course["badge"], "earned_at": now_iso(),
                                        "destination_id": course.get("destination_id")})
    await db.course_progress.update_one({"user_id": UID, "course_id": course_id}, {"$set": update})
    return {"completed_lessons": completed, "certificate": all_done, "badge_earned": all_done,
            "percent": round(len(completed) / len(course["lessons"]) * 100)}


# ---------- Translator (AI) ----------
class TranslateReq(BaseModel):
    text: str
    source_lang: str = "English"
    target_lang: str = "Japanese"
    mode: str = "conversation"  # conversation | creative

class LyricReq(BaseModel):
    lyrics: str
    source_lang: str = "English"
    target_lang: str = "Japanese"
    purpose: str = "Literal Translation"  # Literal Translation | Cultural Interpretation | Performance-Ready Adaptation

async def llm_json(system: str, prompt: str):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(503, "AI is not configured on this server.")
    try:
        chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=new_id(), system_message=system).with_model("anthropic", "claude-sonnet-4-6")
        resp = await asyncio.wait_for(chat.send_message(UserMessage(text=prompt)), timeout=55)
    except asyncio.TimeoutError:
        raise HTTPException(504, "The AI took too long to respond. Please try again.")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"LLM error: {e}")
        raise HTTPException(503, "AI service is temporarily unavailable. Please try again shortly.")
    txt = resp.strip()
    if txt.startswith("```"):
        txt = txt.split("```")[1]
        if txt.startswith("json"):
            txt = txt[4:]
    txt = txt.strip()
    try:
        return json.loads(txt)
    except Exception:
        start, end = txt.find("{"), txt.rfind("}")
        if start >= 0 and end > start:
            return json.loads(txt[start:end + 1])
        raise HTTPException(502, "Translation service returned unexpected format")

@api.post("/translate")
async def translate(body: TranslateReq):
    system = ("You are an expert multilingual translator and cultural consultant for creative professionals "
              "(musicians, filmmakers, dancers). Return ONLY valid JSON.")
    prompt = (f"Translate the following from {body.source_lang} to {body.target_lang}.\n"
              f"Text: \"{body.text}\"\n"
              "Return JSON with keys: translated (string), pronunciation (romanized/phonetic guide string), "
              "literal_note (short string explaining nuance or idioms if any), "
              "formality (one of: casual, neutral, formal).")
    data = await llm_json(system, prompt)
    result = {"id": new_id(), "text": body.text, "source_lang": body.source_lang,
              "target_lang": body.target_lang, "mode": body.mode, **data, "created_at": now_iso()}
    await db.translations.insert_one({**result, "user_id": UID})
    return clean(result)

@api.post("/translate/lyrics")
async def translate_lyrics(body: LyricReq):
    system = ("You are an expert song translator and cultural consultant. You translate lyrics for creative "
              "professionals with deep sensitivity to idiom, metaphor, singability and cultural appropriateness. "
              "Return ONLY valid JSON.")
    prompt = (f"Translate these lyrics from {body.source_lang} to {body.target_lang}.\n"
              f"Translation purpose: {body.purpose}.\n"
              f"Lyrics:\n\"\"\"\n{body.lyrics}\n\"\"\"\n\n"
              "Return JSON with keys: "
              "translated (the translated lyrics as a string with line breaks), "
              "pronunciation (phonetic/romanized guide string), "
              "idioms (array of {phrase, explanation} for idioms/metaphors/slang/cultural references), "
              "flags (array of strings noting any language that may be offensive, misleading, or culturally inappropriate; empty array if none), "
              "syllables (object with keys 'source' and 'target' giving approximate total syllable counts as integers), "
              "phrasing_note (short string comparing phrasing/singability).")
    data = await llm_json(system, prompt)
    result = {"id": new_id(), "lyrics": body.lyrics, "source_lang": body.source_lang,
              "target_lang": body.target_lang, "purpose": body.purpose, **data, "created_at": now_iso(),
              "review_notice": ("AI-assisted translations should be reviewed by a fluent speaker or qualified "
                                "cultural consultant before commercial release or public performance.")}
    return result

class SavePhrase(BaseModel):
    original: str
    translated: str
    source_lang: str
    target_lang: str
    pronunciation: Optional[str] = None
    project: Optional[str] = None

@api.get("/phrases")
async def get_phrases():
    rows = await db.phrases.find({"user_id": UID}).sort("created_at", -1).to_list(200)
    return [clean(r) for r in rows]

@api.post("/phrases")
async def save_phrase(body: SavePhrase):
    doc = {"id": new_id(), "user_id": UID, **body.model_dump(), "created_at": now_iso()}
    await db.phrases.insert_one(dict(doc))
    return clean(doc)

@api.delete("/phrases/{phrase_id}")
async def delete_phrase(phrase_id: str):
    await db.phrases.delete_one({"user_id": UID, "id": phrase_id})
    return {"deleted": True}

@api.get("/creative-phrases")
async def creative_phrases(q: Optional[str] = None):
    phrases = [
        {"category": "Music", "text": "Let's take it from the second chorus."},
        {"category": "Music", "text": "Can we lower the key?"},
        {"category": "Music", "text": "Give me more reverb on the vocal."},
        {"category": "Music", "text": "Who owns the master recording?"},
        {"category": "Film", "text": "The camera will move after the cue."},
        {"category": "Film", "text": "Quiet on set, please."},
        {"category": "Dance", "text": "Let's mark it before we run it full out."},
        {"category": "Theatre", "text": "Take it from the top of the scene."},
        {"category": "Fashion", "text": "We need one more fitting before the show."},
        {"category": "Production", "text": "What time is load-in?"},
        {"category": "Business", "text": "Can you send the contract for review?"},
        {"category": "Business", "text": "What are the terms for the licensing rights?"},
    ]
    if q:
        phrases = [p for p in phrases if q.lower() in p["text"].lower() or q.lower() in p["category"].lower()]
    return phrases


# ---------- Checklist ----------
@api.get("/checklist")
async def get_checklist(discipline: Optional[str] = None):
    user = await db.users.find_one({"id": UID})
    disc = discipline or user.get("discipline", "Musician")
    rows = await db.checklist.find({"user_id": UID}).to_list(1000)
    items = [clean(r) for r in rows if r.get("discipline") is None or r.get("discipline") == disc]
    total = len(items)
    done = len([i for i in items if i["done"]])
    return {"items": items, "categories": SEED.CHECKLIST_CATEGORIES, "disciplines": SEED.DISCIPLINES,
            "discipline": disc, "percent": round(done / total * 100) if total else 0,
            "done": done, "total": total, "disclaimer": SEED.DISCLAIMER}

class ChecklistPatch(BaseModel):
    done: Optional[bool] = None
    due_date: Optional[str] = None
    reminder: Optional[bool] = None
    document: Optional[str] = None

@api.patch("/checklist/{item_id}")
async def patch_checklist(item_id: str, body: ChecklistPatch):
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    await db.checklist.update_one({"user_id": UID, "id": item_id}, {"$set": update})
    return clean(await db.checklist.find_one({"user_id": UID, "id": item_id}))


# ---------- Trips ----------
@api.get("/trips")
async def list_trips():
    trips = await db.trips.find().to_list(100)
    out = []
    for t in trips:
        clean(t)
        d = await db.destinations.find_one({"id": t["destination_id"]})
        out.append({"id": t["id"], "title": t["title"], "destination": t["destination"], "purpose": t["purpose"],
                    "start_date": t["start_date"], "end_date": t["end_date"], "travel_type": t["travel_type"],
                    "status": t["status"], "readiness": t["readiness"], "cover": t["cover"],
                    "group": t.get("group")})
    return out

@api.get("/trips/{trip_id}")
async def get_trip(trip_id: str):
    t = clean(await db.trips.find_one({"id": trip_id}))
    if not t:
        raise HTTPException(404, "Trip not found")
    return t


# ---------- Trip Mode ----------
@api.get("/trip-mode")
async def trip_mode():
    t = clean(await db.trips.find_one({"id": "tokyo-creative-exchange"}))
    d = clean(await db.destinations.find_one({"id": t["destination_id"]}))
    return {
        "destination": t["destination"], "timezone": d["timezones"][0],
        "essential_phrases": [
            {"text": "Konnichiwa", "meaning": "Hello"},
            {"text": "Arigatō gozaimasu", "meaning": "Thank you"},
            {"text": "Sumimasen", "meaning": "Excuse me / Sorry"},
            {"text": "Eigo o hanasemasu ka?", "meaning": "Do you speak English?"},
            {"text": "Toire wa doko desu ka?", "meaning": "Where is the restroom?"},
        ],
        "itinerary": t["itinerary"],
        "emergency_numbers": d["emergency_numbers"],
        "embassy": d["embassy"],
        "currency": d["currency"],
        "cultural_reminder": "Silence on trains is expected, and it's polite to bow slightly when greeting.",
        "help_options": SEED.SAFETY["help_options"],
        "disclaimer": "Demonstration only — pressing help buttons does NOT contact real emergency services.",
    }


# ---------- Safety ----------
@api.get("/safety")
async def safety():
    t = clean(await db.trips.find_one({"id": "tokyo-creative-exchange"}))
    d = clean(await db.destinations.find_one({"id": t["destination_id"]}))
    user = await db.users.find_one({"id": UID})
    settings = await db.settings.find_one({"user_id": UID}) or {}
    return {
        "emergency_numbers": d["emergency_numbers"],
        "embassy": d["embassy"],
        "trusted_contacts": SEED.SAFETY["trusted_contacts"],
        "emergency_contacts": user.get("emergency_contacts", []),
        "help_options": SEED.SAFETY["help_options"],
        "resources": SEED.SAFETY["resources"],
        "location_sharing": settings.get("location_sharing", False),
        "disclaimer": "Demonstration only — this build does not contact real emergency services and does not fabricate live warnings.",
    }

class LocationShare(BaseModel):
    enabled: bool

@api.put("/safety/location-sharing")
async def set_location(body: LocationShare):
    await db.settings.update_one({"user_id": UID}, {"$set": {"user_id": UID, "location_sharing": body.enabled}}, upsert=True)
    return {"location_sharing": body.enabled}


# ---------- Networking ----------
@api.get("/network")
async def network(type: Optional[str] = None, q: Optional[str] = None):
    rows = await db.network.find().to_list(200)
    out = []
    for r in rows:
        clean(r)
        if type and type != "All" and r["type"] != type:
            continue
        if q:
            hay = f"{r['name']} {r['city']} {r['country']} {' '.join(r['genres'])} {r['role']}".lower()
            if q.lower() not in hay:
                continue
        out.append(r)
    connections = await db.connections.find({"user_id": UID}).to_list(100)
    cids = {c["network_id"] for c in connections}
    for r in out:
        r["connected"] = r["id"] in cids
    return out

@api.post("/network/{network_id}/connect")
async def connect(network_id: str):
    existing = await db.connections.find_one({"user_id": UID, "network_id": network_id})
    if existing:
        await db.connections.delete_one({"_id": existing["_id"]})
        return {"connected": False}
    await db.connections.insert_one({"id": new_id(), "user_id": UID, "network_id": network_id, "at": now_iso()})
    return {"connected": True}


# ---------- Journal ----------
class JournalEntry(BaseModel):
    title: str
    body: str
    location: Optional[str] = None
    mood: Optional[str] = None
    trip_id: Optional[str] = None

@api.get("/journal")
async def get_journal():
    rows = await db.journal.find({"user_id": UID}).sort("created_at", -1).to_list(200)
    return [clean(r) for r in rows]

@api.post("/journal")
async def add_journal(body: JournalEntry):
    doc = {"id": new_id(), "user_id": UID, **body.model_dump(), "created_at": now_iso()}
    await db.journal.insert_one(dict(doc))
    return clean(doc)

@api.delete("/journal/{entry_id}")
async def del_journal(entry_id: str):
    await db.journal.delete_one({"user_id": UID, "id": entry_id})
    return {"deleted": True}


# ---------- Passport profile ----------
@api.get("/passport")
async def passport():
    user = clean(await db.users.find_one({"id": UID}))
    badges = [clean(b) for b in await db.badges.find({"user_id": UID}).to_list(100)]
    courses = await db.courses.find().to_list(100)
    cmap = {c["id"]: c for c in courses}
    progress = await db.course_progress.find({"user_id": UID}).to_list(100)
    completed_courses = [{"title": cmap[p["course_id"]]["title"], "certificate": p.get("certificate", False)}
                         for p in progress if p.get("certificate") and p["course_id"] in cmap]
    saved = await db.saved_destinations.find({"user_id": UID}).to_list(100)
    dests = await db.destinations.find({"id": {"$in": [s["destination_id"] for s in saved]}}).to_list(100)
    return {
        "user": user,
        "badges": [{"label": b["label"], "earned_at": b["earned_at"], "destination_id": b.get("destination_id")} for b in badges],
        "completed_courses": completed_courses,
        "saved_destinations": [{"country": d["country"], "flag": d["flag"], "id": d["id"]} for d in [clean(x) for x in dests]],
        "visa_records": [
            {"country": "Japan", "type": "Cultural Activities", "status": "In Progress", "masked": True},
        ],
        "international_experiences": [
            {"country": "Mexico", "purpose": "Music Workshop", "year": "2024"},
            {"country": "Canada", "purpose": "Festival Performance", "year": "2025"},
        ],
        "documents": [
            {"label": "Passport", "masked": user["passport_doc"]["number_masked"], "status": user["passport_doc"]["status"], "expires": user["passport_doc"]["expires"]},
            {"label": "Travel Insurance", "masked": "•••• 9932", "status": "Pending", "expires": "—"},
        ],
        "disclaimer": SEED.DISCLAIMER,
    }


# ---------- Global Classroom ----------
@api.get("/classroom")
async def classroom():
    c = clean(await db.classroom.find_one({"id": "main"}))
    return c

class AssignmentCreate(BaseModel):
    title: str
    destination_id: str
    due: str

@api.post("/classroom/assignments")
async def create_assignment(body: AssignmentCreate):
    d = await db.destinations.find_one({"id": body.destination_id})
    assignment = {"id": new_id(), "title": body.title, "destination_id": body.destination_id,
                  "due": body.due, "students_total": 0, "students_complete": 0,
                  "cover": d["thumb"] if d else "",
                  "components": [{"id": new_id(), "label": lbl, "done": False} for lbl in
                                 ["Cultural research", "Professional-conduct lesson", "Creative-industry overview",
                                  "Language preparation", "Travel checklist", "Reflection submission"]]}
    await db.classroom.update_one({"id": "main"}, {"$push": {"assignments": assignment}})
    return assignment


# ---------- Notifications ----------
@api.get("/notifications")
async def notifications():
    return [
        {"id": "1", "title": "Visa action needed", "body": "Determine the correct visa for your Tokyo collaboration.", "level": "urgent", "time": "2h ago"},
        {"id": "2", "title": "New cultural insight", "body": "Learn the meaning of 'itadakimasu'.", "level": "info", "time": "1d ago"},
    ]


# ================= GLOBAL MUSIC COMPASS =================
def _trad_summary(t):
    return {"id": t["id"], "name": t["name"], "short": t["short"], "region": t["region"],
            "community": t["community"], "hero": t["hero"], "context": t["context"],
            "permission_level": t["gov"]["permission_level"]}

@api.get("/music/overview")
async def music_overview():
    return {"stewardship_notice": MUSIC.STEWARDSHIP_NOTICE, "audio_notice": MUSIC.AUDIO_NOTICE,
            "traditions_count": len(MUSIC.TRADITIONS)}

@api.get("/music/traditions")
async def music_traditions():
    return [_trad_summary(t) for t in MUSIC.TRADITIONS]

@api.get("/music/traditions/{tid}")
async def music_tradition(tid: str):
    t = next((x for x in MUSIC.TRADITIONS if x["id"] == tid), None)
    if not t:
        raise HTTPException(404, "Tradition not found")
    return {**t, "stewardship_notice": MUSIC.STEWARDSHIP_NOTICE, "audio_notice": MUSIC.AUDIO_NOTICE}

@api.get("/music/comparisons")
async def music_comparisons():
    return MUSIC.COMPARISONS

class CompareReq(BaseModel):
    a: str
    b: str

@api.post("/music/compare")
async def music_compare(body: CompareReq):
    ta = next((x for x in MUSIC.TRADITIONS if x["id"] == body.a), None)
    tb = next((x for x in MUSIC.TRADITIONS if x["id"] == body.b), None)
    if not ta or not tb:
        raise HTTPException(404, "Tradition not found")
    system = ("You are an ethnomusicology-informed collaboration coach. Be precise and respectful. Never claim two "
              "traditions are equivalent. Return ONLY valid JSON.")
    prompt = (f"Compare these two music traditions for a musician from A collaborating in B.\n"
              f"A = {ta['name']}: {ta['context']}\nB = {tb['name']}: {tb['context']}\n"
              "Return JSON with keys: familiar_concepts (array), similar_but_different (array of {concept, note}), "
              "new_vocabulary (array), pitch_tuning (string), rhythm_time (string), improvisation (string), "
              "rehearsal_communication (string), ensemble_hierarchy (string), listening (array of strings), "
              "common_mistakes (array), questions_to_ask (array). Emphasize where comparisons break down. "
              "Respond with compact JSON only — each string 24 words or fewer; each array at most 4 short items.")
    data = await llm_json(system, prompt)
    return {"a": _trad_summary(ta), "b": _trad_summary(tb), **data, "stewardship_notice": MUSIC.STEWARDSHIP_NOTICE}

@api.get("/music/session-phrases")
async def music_session_phrases(q: Optional[str] = None):
    ph = MUSIC.SESSION_PHRASES
    if q:
        ph = [p for p in ph if q.lower() in p["text"].lower() or q.lower() in p["category"].lower()]
    return ph

class MusicSessionReq(BaseModel):
    text: str
    source_lang: str = "English"
    target_lang: str = "Japanese"
    tradition: Optional[str] = None

@api.post("/music/session-translate")
async def music_session_translate(body: MusicSessionReq):
    ctx = ""
    if body.tradition:
        t = next((x for x in MUSIC.TRADITIONS if x["id"] == body.tradition), None)
        if t:
            ctx = f" The collaboration involves the {t['name']} tradition."
    system = "You are a music-session translator and cultural consultant. Return ONLY valid JSON."
    prompt = (f"Translate this rehearsal/studio phrase from {body.source_lang} to {body.target_lang}.{ctx}\n"
              f"Phrase: \"{body.text}\"\n"
              "Return JSON with keys: translated (string), transliteration (string or null), pronunciation (string), "
              "music_meaning (string), cultural_context (string), potential_misunderstanding (string), "
              "respectful_alternative (string or null).")
    data = await llm_json(system, prompt)
    return {"text": body.text, "source_lang": body.source_lang, "target_lang": body.target_lang, **data}

@api.get("/music/rhythms")
async def music_rhythms():
    return {"rhythms": MUSIC.RHYTHMS, "audio_notice": MUSIC.AUDIO_NOTICE}

@api.get("/music/instruments")
async def music_instruments():
    return MUSIC.INSTRUMENTS

class RehearsalReq(BaseModel):
    destination: str
    tradition: str
    discipline: str
    role: str
    engagement: str
    repertoire: Optional[str] = ""
    collaborators: Optional[str] = ""
    rehearsal_date: Optional[str] = ""
    performance_date: Optional[str] = ""

@api.post("/music/rehearsal-plan")
async def music_rehearsal_plan(body: RehearsalReq):
    t = next((x for x in MUSIC.TRADITIONS if x["id"] == body.tradition), None)
    tname = t["name"] if t else body.tradition
    system = ("You are a cross-cultural music-preparation coach. Reciprocal and respectful — do not treat Western "
              "musicians as the default. Never claim traditions are equivalent. Return ONLY valid JSON.")
    prompt = (f"Create a preparation pathway for a {body.discipline} ({body.role}) preparing for a {body.engagement} "
              f"in {body.destination}, working within the {tname} tradition. "
              f"Repertoire: {body.repertoire or 'unspecified'}. Collaborators: {body.collaborators or 'unspecified'}.\n"
              "Return JSON with keys: musical_vocabulary (array), pitch_tuning_prep (string), rhythm_prep (string), "
              "cultural_background (string), rehearsal_etiquette (string), professional_conduct (string), "
              "listening (array), instrument_considerations (string), director_questions (array), "
              "rights_credit_questions (array), permission_questions (array), language_practice (array), "
              "readiness_checklist (array of strings). "
              "CRITICAL: respond FAST with compact JSON only, no preamble — each string 16 words or fewer; each array at most 3 short items.")
    data = await llm_json(system, prompt)
    return {"input": body.model_dump(), "tradition": _trad_summary(t) if t else None, **data,
            "stewardship_notice": MUSIC.STEWARDSHIP_NOTICE}

class KnowledgeReq(BaseModel):
    instruction: str
    target_tradition: str

@api.post("/music/knowledge-translate")
async def music_knowledge_translate(body: KnowledgeReq):
    t = next((x for x in MUSIC.TRADITIONS if x["id"] == body.target_tradition), None)
    tname = t["name"] if t else body.target_tradition
    system = ("You are a music-knowledge translator. Explain how a musical idea maps (or does not) into another "
              "tradition. Never claim exact equivalence. Return ONLY valid JSON.")
    prompt = (f"A musician wants to communicate this musical idea within the {tname} tradition:\n\"{body.instruction}\"\n"
              "Return JSON with keys: direct_reference (string), approximate_comparison (string), "
              "important_differences (array), rehearsal_recommendation (string), cultural_context (string), "
              "terminology_to_avoid (array), questions_to_ask (array), practitioner_verification_needed (string).")
    data = await llm_json(system, prompt)
    return {"instruction": body.instruction, "tradition": _trad_summary(t) if t else None, **data,
            "stewardship_notice": MUSIC.STEWARDSHIP_NOTICE}

@api.get("/music/classroom")
async def music_classroom():
    return {"pathway": MUSIC.CLASSROOM_PATHWAY, "tiers": MUSIC.ACCESS_TIERS,
            "demo_pathways": [{"id": p["id"], "title": p["title"], "tradition_id": p["tradition_id"], "cover": p["cover"]} for p in MUSIC.DEMO_PATHWAYS],
            "stewardship_notice": MUSIC.STEWARDSHIP_NOTICE}

@api.get("/music/pathways/{pid}")
async def music_pathway(pid: str):
    p = next((x for x in MUSIC.DEMO_PATHWAYS if x["id"] == pid), None)
    if not p:
        raise HTTPException(404, "Pathway not found")
    return {**p, "stewardship_notice": MUSIC.STEWARDSHIP_NOTICE}


app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown():
    client.close()
