"""VIEARTA™ backend — Creative Health, Wellness & Human Performance."""

from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import logging
import uuid
from datetime import datetime, timezone, timedelta, date
from typing import List, Optional, Literal

import bcrypt
import jwt
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict

from lifestyle import build_lifestyle_router, seed_lifestyle_demo
from programs import build_programs_router, seed_programs_demo
from viea import build_viea_router

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="VIEARTA API", version="1.0.0")
api = APIRouter(prefix="/api")

JWT_ALG = "HS256"
JWT_EXP_MINUTES = 60 * 24 * 7  # 7 days for demo simplicity


def _jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False


def create_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=JWT_EXP_MINUTES),
        "iat": datetime.now(timezone.utc),
        "type": "access",
    }
    return jwt.encode(payload, _jwt_secret(), algorithm=JWT_ALG)


async def get_current_user(request: Request) -> dict:
    auth_header = request.headers.get("Authorization", "")
    token = None
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
    if not token:
        token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, _jwt_secret(), algorithms=[JWT_ALG])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class UserPublic(BaseModel):
    id: str
    email: EmailStr
    first_name: str
    last_name: str
    discipline: str
    ancrid: str
    role: Literal["student", "admin"] = "student"
    is_demo: bool = False


class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    discipline: str = "Creator"


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    token: str
    user: UserPublic


ScaleType = Literal[1, 2, 3, 4, 5]


class ArrivingCheckIn(BaseModel):
    body: ScaleType
    mind: ScaleType
    energy: ScaleType
    creative_capacity: ScaleType
    performance_readiness: ScaleType
    note: Optional[str] = None


class WellnessSnapshot(BaseModel):
    energy_level: ScaleType
    sleep_hours: float = Field(ge=0, le=16)
    hydration_glasses: int = Field(ge=0, le=20)
    stress_level: ScaleType
    body_discomfort: ScaleType
    mood: ScaleType
    voice_condition: Optional[ScaleType] = None
    hearing_condition: Optional[ScaleType] = None
    creative_workload: ScaleType


CreativeDemand = Literal[
    "class", "writing", "studio", "rehearsal", "live_performance",
    "audition", "shoot", "editing", "travel", "rest", "other",
]


class CheckInIn(BaseModel):
    date: str  # YYYY-MM-DD
    arriving: ArrivingCheckIn
    snapshot: WellnessSnapshot
    creative_demand: List[CreativeDemand] = []


class CheckInOut(CheckInIn):
    id: str
    user_id: str
    created_at: str


class EventOut(BaseModel):
    id: str
    title: str
    kind: str  # performance | session | circle | workshop | office_hours
    starts_at: str  # ISO
    location: Optional[str] = None


class LessonProgress(BaseModel):
    id: str
    pathway: str
    title: str
    progress: int  # 0-100
    total_lessons: int
    completed_lessons: int


class Recommendation(BaseModel):
    id: str
    title: str
    body: str
    category: str  # vocal | hearing | posture | hydration | breath | focus | recovery | sleep
    duration_minutes: int


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _new_id() -> str:
    return str(uuid.uuid4())


def _today_str() -> str:
    return datetime.now(timezone.utc).date().isoformat()


def _user_public(u: dict) -> dict:
    return {
        "id": u["id"],
        "email": u["email"],
        "first_name": u["first_name"],
        "last_name": u["last_name"],
        "discipline": u["discipline"],
        "ancrid": u["ancrid"],
        "role": u.get("role", "student"),
        "is_demo": u.get("is_demo", False),
    }


# ---------------------------------------------------------------------------
# Recommendation engine (rule-based, structured for future AI personalization)
# ---------------------------------------------------------------------------
REC_LIBRARY = {
    "vocal_warmup": Recommendation(
        id="vocal_warmup",
        title="Five-minute vocal warm-up",
        body="A gentle lip-trill and sirens sequence to open the voice and reduce tension before your session.",
        category="vocal",
        duration_minutes=5,
    ),
    "hearing_protection": Recommendation(
        id="hearing_protection",
        title="Hearing protection reminder",
        body="Keep monitors below 85 dB when possible and take a five-minute silence break every hour in the studio.",
        category="hearing",
        duration_minutes=1,
    ),
    "studio_posture": Recommendation(
        id="studio_posture",
        title="Studio posture reset",
        body="Roll your shoulders back, lengthen the neck, and reset the jaw. Small resets protect long sessions.",
        category="posture",
        duration_minutes=3,
    ),
    "hydration_prep": Recommendation(
        id="hydration_prep",
        title="Hydration preparation",
        body="Have room-temperature water within reach. Hydration supports vocal fold and cognitive performance.",
        category="hydration",
        duration_minutes=2,
    ),
    "pre_perf_breath": Recommendation(
        id="pre_perf_breath",
        title="Pre-performance breathing",
        body="Four-in / six-out box breathing for two minutes to steady the nervous system before you step up.",
        category="breath",
        duration_minutes=2,
    ),
    "creative_focus": Recommendation(
        id="creative_focus",
        title="Creative focus reset",
        body="Close your eyes, take three long exhales, then name one thing you want the next hour to feel like.",
        category="focus",
        duration_minutes=3,
    ),
    "post_rehearsal": Recommendation(
        id="post_rehearsal",
        title="Post-rehearsal recovery",
        body="Ten minutes of gentle neck, shoulder and hip mobility to release the physical load of the session.",
        category="recovery",
        duration_minutes=10,
    ),
    "sleep_prep": Recommendation(
        id="sleep_prep",
        title="Sleep preparation",
        body="Dim screens, warm lighting, and a slow body scan. Recovery is where tomorrow's performance is built.",
        category="sleep",
        duration_minutes=15,
    ),
    "mind_pause": Recommendation(
        id="mind_pause",
        title="Two-minute mind pause",
        body="A short pause between tasks helps the mind reset. Watch your breath without changing it.",
        category="focus",
        duration_minutes=2,
    ),
    "gentle_move": Recommendation(
        id="gentle_move",
        title="Gentle movement break",
        body="Stand up, walk for two minutes, roll the wrists and ankles. Small movement keeps the system open.",
        category="posture",
        duration_minutes=3,
    ),
}


def build_recommendations(check_in: Optional[dict], demand: List[str], discipline: str) -> List[dict]:
    """Rule-based recommendation service. Structured so an AI layer can wrap this later."""
    picks: List[str] = []

    d = set(demand or [])
    disc = (discipline or "").lower()

    # Demand-based
    if "live_performance" in d or "audition" in d:
        picks += ["pre_perf_breath", "vocal_warmup", "hydration_prep"]
    if "studio" in d:
        picks += ["hearing_protection", "studio_posture"]
    if "rehearsal" in d:
        picks += ["vocal_warmup", "post_rehearsal"]
    if "writing" in d or "editing" in d:
        picks += ["creative_focus", "gentle_move"]
    if "shoot" in d:
        picks += ["hydration_prep", "studio_posture"]
    if "class" in d:
        picks += ["creative_focus"]
    if "travel" in d:
        picks += ["hydration_prep", "gentle_move"]
    if "rest" in d:
        picks += ["sleep_prep", "mind_pause"]

    # Check-in based
    if check_in:
        snap = check_in.get("snapshot", {})
        arriving = check_in.get("arriving", {})
        if snap.get("stress_level", 0) >= 4 or arriving.get("mind", 5) <= 2:
            picks += ["mind_pause", "creative_focus"]
        if snap.get("sleep_hours", 8) < 6:
            picks += ["sleep_prep"]
        if snap.get("hydration_glasses", 0) < 3:
            picks += ["hydration_prep"]
        if snap.get("body_discomfort", 0) >= 4 or arriving.get("body", 5) <= 2:
            picks += ["studio_posture", "gentle_move", "post_rehearsal"]
        if arriving.get("energy", 5) <= 2:
            picks += ["gentle_move"]
        if snap.get("voice_condition") and snap["voice_condition"] <= 3:
            picks += ["vocal_warmup", "hydration_prep"]

    # Discipline-based defaults
    if any(k in disc for k in ["voc", "singer", "song"]):
        picks += ["vocal_warmup"]
    if any(k in disc for k in ["produc", "engineer"]):
        picks += ["hearing_protection"]
    if any(k in disc for k in ["danc"]):
        picks += ["gentle_move", "post_rehearsal"]

    if not picks:
        picks = ["creative_focus", "hydration_prep", "sleep_prep"]

    # Dedupe preserving order, take three
    seen = set()
    ordered = []
    for p in picks:
        if p in seen or p not in REC_LIBRARY:
            continue
        seen.add(p)
        ordered.append(p)
        if len(ordered) == 3:
            break

    while len(ordered) < 3:
        for k in REC_LIBRARY:
            if k not in seen:
                seen.add(k)
                ordered.append(k)
                break
        if len(ordered) >= 3:
            break

    return [REC_LIBRARY[k].model_dump() for k in ordered]


# ---------------------------------------------------------------------------
# Auth routes
# ---------------------------------------------------------------------------
@api.post("/auth/register", response_model=AuthResponse)
async def register(payload: RegisterIn):
    email = payload.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = {
        "id": _new_id(),
        "email": email,
        "password_hash": hash_password(payload.password),
        "first_name": payload.first_name,
        "last_name": payload.last_name,
        "discipline": payload.discipline,
        "ancrid": f"ANCRID-{uuid.uuid4().hex[:4].upper()}",
        "role": "student",
        "is_demo": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user)
    token = create_token(user["id"], user["email"])
    return {"token": token, "user": _user_public(user)}


@api.post("/auth/login", response_model=AuthResponse)
async def login(payload: LoginIn):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(user["id"], user["email"])
    return {"token": token, "user": _user_public(user)}


@api.get("/auth/me", response_model=UserPublic)
async def me(user: dict = Depends(get_current_user)):
    return _user_public(user)


@api.post("/auth/logout")
async def logout(user: dict = Depends(get_current_user)):
    return {"ok": True}


# ---------------------------------------------------------------------------
# Check-in routes
# ---------------------------------------------------------------------------
@api.post("/checkins", response_model=CheckInOut)
async def create_checkin(payload: CheckInIn, user: dict = Depends(get_current_user)):
    doc = {
        "id": _new_id(),
        "user_id": user["id"],
        "date": payload.date,
        "arriving": payload.arriving.model_dump(),
        "snapshot": payload.snapshot.model_dump(),
        "creative_demand": payload.creative_demand,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    # Upsert by (user_id, date) — one check-in per day
    await db.checkins.update_one(
        {"user_id": user["id"], "date": payload.date},
        {"$set": doc},
        upsert=True,
    )
    saved = await db.checkins.find_one({"user_id": user["id"], "date": payload.date}, {"_id": 0})
    return saved


@api.get("/checkins/today")
async def checkin_today(user: dict = Depends(get_current_user)):
    doc = await db.checkins.find_one(
        {"user_id": user["id"], "date": _today_str()}, {"_id": 0}
    )
    return doc  # may be null


@api.get("/checkins/week")
async def checkin_week(user: dict = Depends(get_current_user)):
    today = datetime.now(timezone.utc).date()
    start = (today - timedelta(days=6)).isoformat()
    cur = db.checkins.find(
        {"user_id": user["id"], "date": {"$gte": start}}, {"_id": 0}
    ).sort("date", 1)
    docs = await cur.to_list(length=14)

    # Fill 7-day series
    by_date = {d["date"]: d for d in docs}
    series = []
    for i in range(6, -1, -1):
        day = (today - timedelta(days=i)).isoformat()
        d = by_date.get(day)
        if d:
            snap = d.get("snapshot", {})
            arriving = d.get("arriving", {})
            series.append({
                "date": day,
                "energy": snap.get("energy_level"),
                "stress": snap.get("stress_level"),
                "sleep": snap.get("sleep_hours"),
                "discomfort": snap.get("body_discomfort"),
                "creative_workload": snap.get("creative_workload"),
                "mind": arriving.get("mind"),
            })
        else:
            series.append({
                "date": day,
                "energy": None, "stress": None, "sleep": None,
                "discomfort": None, "creative_workload": None, "mind": None,
            })
    return {"series": series, "raw": docs}


# ---------------------------------------------------------------------------
# Dashboard support
# ---------------------------------------------------------------------------
@api.get("/recommendations")
async def recommendations(user: dict = Depends(get_current_user)):
    check_in = await db.checkins.find_one(
        {"user_id": user["id"], "date": _today_str()}, {"_id": 0}
    )
    demand = check_in.get("creative_demand", []) if check_in else []
    recs = build_recommendations(check_in, demand, user.get("discipline", ""))
    return {"items": recs, "personalized": bool(check_in)}


@api.get("/events/upcoming")
async def upcoming(user: dict = Depends(get_current_user)):
    cur = db.events.find(
        {"user_id": user["id"], "starts_at": {"$gte": datetime.now(timezone.utc).isoformat()}},
        {"_id": 0},
    ).sort("starts_at", 1).limit(6)
    return {"items": await cur.to_list(length=6)}


# /learning/current is now provided by programs.py (real pathway progress)


@api.get("/learning/summary")
async def learning_summary(user: dict = Depends(get_current_user)):
    completed = await db.learning.count_documents({"user_id": user["id"], "progress": 100})
    active = await db.learning.count_documents({"user_id": user["id"], "is_current": True})
    return {"completed_lessons": completed, "active_pathways": active}


@api.get("/rotating-message")
async def rotating_message():
    messages = [
        "Your craft is a long practice. Today is one honest chapter.",
        "Small, kind choices protect the artist you are becoming.",
        "Care for the instrument. The instrument is you.",
        "Every rehearsal counts — and so does every rest.",
        "The work is patient. So are you.",
        "Steady rhythm creates room for surprising ideas.",
        "Show up gently. That is enough today.",
    ]
    idx = datetime.now(timezone.utc).timetuple().tm_yday % len(messages)
    return {"message": messages[idx]}


@api.get("/")
async def root():
    return {"app": "VIEARTA", "tagline": "Live Well • Perform Well • Create Forever"}


# ---------------------------------------------------------------------------
# Seed demo data
# ---------------------------------------------------------------------------
async def _seed():
    admin_email = os.environ["ADMIN_EMAIL"].lower()
    admin_password = os.environ["ADMIN_PASSWORD"]
    demo_email = os.environ["DEMO_EMAIL"].lower()
    demo_password = os.environ["DEMO_PASSWORD"]

    # Admin
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": _new_id(),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "first_name": "VIEARTA",
            "last_name": "Admin",
            "discipline": "Program Lead",
            "ancrid": "ANCRID-ADMIN",
            "role": "admin",
            "is_demo": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    else:
        # keep password in sync with env
        if not verify_password(admin_password, existing["password_hash"]):
            await db.users.update_one(
                {"email": admin_email},
                {"$set": {"password_hash": hash_password(admin_password)}},
            )

    # Demo user Jaylen Rivers
    existing = await db.users.find_one({"email": demo_email})
    if not existing:
        user_id = _new_id()
        await db.users.insert_one({
            "id": user_id,
            "email": demo_email,
            "password_hash": hash_password(demo_password),
            "first_name": "Jaylen",
            "last_name": "Rivers",
            "discipline": "Artist • Producer • Songwriter",
            "ancrid": "ANCRID-7G8X",
            "role": "student",
            "is_demo": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    else:
        user_id = existing["id"]
        if not verify_password(demo_password, existing["password_hash"]):
            await db.users.update_one(
                {"email": demo_email},
                {"$set": {"password_hash": hash_password(demo_password)}},
            )

    # 7 days of check-ins
    today = datetime.now(timezone.utc).date()
    demo_days = [
        # (body, mind, energy, creative_capacity, performance_readiness,
        #  energy_level, sleep_hours, hydration, stress, discomfort, mood, voice, hearing, creative_workload, demand, note)
        (4, 4, 4, 4, 4, 4, 7.5, 6, 2, 2, 4, 4, 4, 3, ["studio"], "Solid session, felt in the pocket."),
        (3, 3, 3, 3, 3, 3, 6.0, 4, 3, 3, 3, 3, 3, 4, ["writing", "studio"], "Long day — pushed through."),
        (3, 4, 3, 4, 3, 3, 6.5, 5, 3, 2, 4, 4, 4, 3, ["writing"], "Lyrics started clicking."),
        (4, 4, 4, 4, 4, 4, 7.0, 6, 2, 2, 4, 4, 4, 3, ["rehearsal"], "Band is locking in."),
        (2, 3, 2, 3, 2, 2, 5.0, 3, 4, 3, 3, 3, 3, 4, ["studio", "editing"], "Ears felt full — took breaks."),
        (4, 4, 4, 5, 4, 4, 7.5, 7, 2, 1, 5, 4, 5, 3, ["rest"], "Recovery day paid off."),
        (5, 4, 4, 5, 5, 4, 8.0, 7, 2, 1, 5, 5, 5, 3, ["rehearsal", "studio"], "Feeling ready for the show."),
    ]
    for i, day in enumerate(demo_days):
        d = (today - timedelta(days=6 - i)).isoformat()
        (b, m, e, cc, pr, el, sh, hy, st, dc, mo, vc, hc, cw, demand, note) = day
        doc = {
            "id": _new_id(),
            "user_id": user_id,
            "date": d,
            "arriving": {
                "body": b, "mind": m, "energy": e,
                "creative_capacity": cc, "performance_readiness": pr,
                "note": note,
            },
            "snapshot": {
                "energy_level": el, "sleep_hours": sh, "hydration_glasses": hy,
                "stress_level": st, "body_discomfort": dc, "mood": mo,
                "voice_condition": vc, "hearing_condition": hc,
                "creative_workload": cw,
            },
            "creative_demand": demand,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.checkins.update_one(
            {"user_id": user_id, "date": d}, {"$set": doc}, upsert=True
        )

    # Upcoming events
    now = datetime.now(timezone.utc)
    events = [
        {
            "id": _new_id(), "user_id": user_id,
            "title": "Live performance — Awe Day Showcase",
            "kind": "performance",
            "starts_at": (now + timedelta(days=3, hours=2)).isoformat(),
            "location": "Awe Day Main Stage",
        },
        {
            "id": _new_id(), "user_id": user_id,
            "title": "Recording session — new single",
            "kind": "session",
            "starts_at": (now + timedelta(days=1, hours=5)).isoformat(),
            "location": "Studio B",
        },
        {
            "id": _new_id(), "user_id": user_id,
            "title": "Wellness Circle — Vocal Health for Producers",
            "kind": "circle",
            "starts_at": (now + timedelta(days=2, hours=1)).isoformat(),
            "location": "VIEARTA Circle Room",
        },
        {
            "id": _new_id(), "user_id": user_id,
            "title": "CCDP Workshop — Studio Ergonomics",
            "kind": "workshop",
            "starts_at": (now + timedelta(days=5, hours=3)).isoformat(),
            "location": "CCDP Lab",
        },
    ]
    await db.events.delete_many({"user_id": user_id})
    if events:
        await db.events.insert_many(events)

    # Learning
    lessons = [
        {"id": _new_id(), "user_id": user_id, "pathway": "Vocal Longevity",
         "title": "Hydration and the Vocal Folds", "progress": 100,
         "total_lessons": 6, "completed_lessons": 6, "is_current": False},
        {"id": _new_id(), "user_id": user_id, "pathway": "Studio Health",
         "title": "Hearing Protection Fundamentals", "progress": 100,
         "total_lessons": 5, "completed_lessons": 5, "is_current": False},
        {"id": _new_id(), "user_id": user_id, "pathway": "Performance Prep",
         "title": "Pre-Show Nervous System Reset", "progress": 100,
         "total_lessons": 4, "completed_lessons": 4, "is_current": False},
        {"id": _new_id(), "user_id": user_id, "pathway": "Creative Recovery",
         "title": "Sleep Architecture for Late-Night Sessions", "progress": 45,
         "total_lessons": 8, "completed_lessons": 3, "is_current": True},
    ]
    await db.learning.delete_many({"user_id": user_id})
    if lessons:
        await db.learning.insert_many(lessons)

    # Log credentials for reference
    logger.info("Seed complete. Demo login: %s / %s", demo_email, demo_password)

    # Seed lifestyle demo data
    try:
        await seed_lifestyle_demo(db, user_id)
    except Exception as e:
        logger.warning("Lifestyle seed skipped: %s", e)

    # Seed programs demo data (circles, habits, journal, lesson progress, consent)
    try:
        await seed_programs_demo(db, user_id)
    except Exception as e:
        logger.warning("Programs seed skipped: %s", e)


# ---------------------------------------------------------------------------
# App wiring
# ---------------------------------------------------------------------------
app.include_router(api)
app.include_router(build_lifestyle_router(db, get_current_user))
app.include_router(build_programs_router(db, get_current_user))
app.include_router(build_viea_router(db, get_current_user))

app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("viearta")


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.checkins.create_index([("user_id", 1), ("date", 1)], unique=True)
    await db.events.create_index([("user_id", 1), ("starts_at", 1)])
    await db.learning.create_index([("user_id", 1)])
    await _seed()


@app.on_event("shutdown")
async def on_shutdown():
    client.close()
