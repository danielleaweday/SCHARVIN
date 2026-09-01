"""ANCRA™ v2.0 — Creative Learning Operating System
FastAPI backend serving the ANCR ecosystem with AIAH (Claude Sonnet 4.5) streaming.
"""
from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import json
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import asyncio

from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

from seed_data import build_seed

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

app = FastAPI(title="ANCRA v2.0 API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
log = logging.getLogger("ancra")


# ============================================================
# Seed
# ============================================================
COLLECTIONS = [
    "students", "faculty", "journeys", "experiences", "lessons",
    "assignments", "capstones", "songs", "teams", "calendar",
    "messages", "achievements", "sessions", "reviews", "cohorts",
    "hubs", "portfolio_items", "chat_sessions",
]


async def seed_db():
    """Idempotent seed — only inserts if collection is empty."""
    data = build_seed()
    for name in COLLECTIONS:
        if name == "chat_sessions":
            continue
        docs = data.get(name, [])
        if not docs:
            continue
        existing = await db[name].count_documents({})
        if existing == 0:
            await db[name].insert_many(docs)
            log.info(f"seeded {len(docs)} into {name}")


@app.on_event("startup")
async def startup():
    await seed_db()


@app.on_event("shutdown")
async def shutdown():
    client.close()


# ============================================================
# Helpers
# ============================================================
def clean(doc: Optional[dict]) -> Optional[dict]:
    if doc is None:
        return None
    doc.pop("_id", None)
    return doc


async def list_col(name: str, query: Optional[dict] = None, limit: int = 500) -> List[dict]:
    q = query or {}
    docs = await db[name].find(q, {"_id": 0}).to_list(limit)
    return docs


# ============================================================
# Meta
# ============================================================
@api.get("/")
async def root():
    return {"platform": "ANCRA v2.0", "tagline": "Creative Learning Operating System™"}


@api.get("/me")
async def me(role: str = "student"):
    """Return the active persona based on role query param."""
    if role == "faculty":
        f = await db.faculty.find_one({"is_active": True}, {"_id": 0})
        return {"role": "faculty", "profile": clean(f)}
    s = await db.students.find_one({"is_active": True}, {"_id": 0})
    return {"role": "student", "profile": clean(s)}


# ============================================================
# Student endpoints
# ============================================================
@api.get("/student/dashboard")
async def student_dashboard():
    student = await db.students.find_one({"is_active": True}, {"_id": 0})
    journey = await db.journeys.find_one({"student_id": student["id"]}, {"_id": 0})
    schedule = await list_col("calendar", {"student_id": student["id"], "today": True}, 20)
    songs = await list_col("songs", {"student_id": student["id"]}, 30)
    capstones = await list_col("capstones", {"student_id": student["id"]})
    experiences = await list_col("experiences", {"active": True}, 4)
    sessions = await list_col("sessions", {"upcoming": True}, 4)
    achievements = await list_col("achievements", {"student_id": student["id"]}, 6)
    return {
        "student": student,
        "journey": journey,
        "schedule": schedule,
        "songs": songs,
        "capstones": capstones,
        "experiences": experiences,
        "sessions": sessions,
        "achievements": achievements,
    }


@api.get("/student/journeys")
async def student_journeys():
    experiences = await list_col("experiences")
    return {"experiences": experiences}


@api.get("/student/experience/{exp_id}")
async def student_experience(exp_id: str):
    exp = await db.experiences.find_one({"id": exp_id}, {"_id": 0})
    if not exp:
        raise HTTPException(404, "experience not found")
    lessons = await list_col("lessons", {"experience_id": exp_id})
    return {"experience": exp, "lessons": lessons}


@api.get("/student/lesson/{lesson_id}")
async def student_lesson(lesson_id: str):
    lesson = await db.lessons.find_one({"id": lesson_id}, {"_id": 0})
    if not lesson:
        raise HTTPException(404, "lesson not found")
    return lesson


@api.get("/student/assignments")
async def student_assignments():
    return {"assignments": await list_col("assignments")}


@api.get("/student/capstones")
async def student_capstones():
    return {"capstones": await list_col("capstones")}


@api.get("/student/songs")
async def student_songs():
    return {"songs": await list_col("songs")}


@api.get("/student/portfolio")
async def student_portfolio():
    return {"items": await list_col("portfolio_items")}


@api.get("/student/teams")
async def student_teams():
    return {"teams": await list_col("teams")}


@api.get("/student/messages")
async def student_messages():
    return {"messages": await list_col("messages")}


@api.get("/student/calendar")
async def student_calendar():
    return {"events": await list_col("calendar")}


@api.get("/student/achievements")
async def student_achievements():
    return {"achievements": await list_col("achievements")}


# ============================================================
# Faculty endpoints
# ============================================================
@api.get("/faculty/dashboard")
async def faculty_dashboard():
    faculty = await db.faculty.find_one({"is_active": True}, {"_id": 0})
    students = await list_col("students", limit=40)
    cohorts = await list_col("cohorts")
    reviews = await list_col("reviews", {"status": "pending"}, 20)
    sessions = await list_col("sessions", {"upcoming": True}, 8)
    approvals = await list_col("reviews", {"needs_approval": True}, 10)
    return {
        "faculty": faculty,
        "students": students,
        "cohorts": cohorts,
        "reviews_pending": reviews,
        "sessions_upcoming": sessions,
        "approvals": approvals,
        "stats": {
            "total_students": len(students),
            "active_reviews": len(reviews),
            "cohorts": len(cohorts),
            "avg_portfolio_score": 87,
            "graduation_ready": 12,
            "at_risk": 3,
        },
    }


@api.get("/faculty/students")
async def faculty_students():
    return {"students": await list_col("students")}


@api.get("/faculty/reviews")
async def faculty_reviews():
    return {"reviews": await list_col("reviews")}


@api.get("/faculty/cohorts")
async def faculty_cohorts():
    return {"cohorts": await list_col("cohorts")}


@api.get("/faculty/curriculum")
async def faculty_curriculum():
    experiences = await list_col("experiences")
    return {"experiences": experiences, "modules": []}


@api.get("/faculty/analytics")
async def faculty_analytics():
    return {
        "engagement": [
            {"week": "W1", "value": 62}, {"week": "W2", "value": 71},
            {"week": "W3", "value": 78}, {"week": "W4", "value": 84},
            {"week": "W5", "value": 88}, {"week": "W6", "value": 91},
            {"week": "W7", "value": 87}, {"week": "W8", "value": 93},
        ],
        "portfolio_score": [
            {"month": "Sep", "value": 71}, {"month": "Oct", "value": 76},
            {"month": "Nov", "value": 82}, {"month": "Dec", "value": 85},
            {"month": "Jan", "value": 87},
        ],
        "industry_participation": 74,
        "capstone_readiness": 68,
        "graduation_readiness": 81,
    }


# ============================================================
# Ecosystem hubs
# ============================================================
@api.get("/ecosystem/{module}")
async def ecosystem_hub(module: str):
    hub = await db.hubs.find_one({"module": module.lower()}, {"_id": 0})
    if not hub:
        raise HTTPException(404, f"hub {module} not found")
    return hub


@api.get("/ecosystem")
async def ecosystem_all():
    return {"hubs": await list_col("hubs")}


# ============================================================
# AIAH — Claude Sonnet 4.5 streaming companion
# ============================================================
class AIAHRequest(BaseModel):
    session_id: str
    message: str
    context: Optional[Dict[str, Any]] = None
    role: str = "student"


AIAH_SYSTEM = """You are AIAH, the intelligence layer of the ANCR ecosystem — an integrated AI companion inside ANCRA™, the Creative Learning Operating System for the Contemporary Creative Development Program (CCDP).

You are NOT a generic assistant. You are contextual, actionable, and always connected to the user's educational journey. You know about:
- ANCRA™ (learning experiences, lessons, capstones, portfolio, 30 Song Progress)
- ANCRLAB™ (creative projects, studio sessions, DAW activity)
- ANCRSync™ (collaboration, writing rooms, teams)
- INHEIRA™ (songs, ownership splits, publishing, copyright)
- COHEIR™ (mentors, industry sessions, feedback, recommendations)
- Vaulta™ (royalties, budgets, financial literacy)
- ANCRLaunch™ (career, graduation readiness, placement)
- ANCRID™ (identity, portfolio score, Creator Mobility™, Booking Packet)
- ANCRVIEW™ (masterclasses, showcases) and ANCRWAV™ (releases, streaming)

Tone: Cinematic, thoughtful, warm-but-precise. Never sycophantic. Never generic.
Format: Short paragraphs. PLAIN TEXT ONLY — never use markdown syntax (no **bold**, no *italics*, no # headers, no bullet lists). Reference specific ecosystem modules by name with the ™ symbol when relevant. Always end with a concrete next step.

If the user is FACULTY, tailor guidance toward student review, curriculum design, cohort analytics, and industry connections. If STUDENT, focus on creative growth, portfolio, collaboration, and career readiness.
"""


@api.post("/aiah/stream")
async def aiah_stream(req: AIAHRequest):
    """Server-sent events endpoint streaming AIAH tokens."""
    if not EMERGENT_LLM_KEY:
        raise HTTPException(500, "AIAH not configured")

    ctx_text = ""
    if req.context:
        ctx_text = "\n\nCURRENT CONTEXT:\n" + json.dumps(req.context, indent=2)[:2000]

    system = AIAH_SYSTEM + f"\n\nActive role: {req.role.upper()}." + ctx_text

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=req.session_id,
        system_message=system,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")

    # persist user turn
    await db.chat_sessions.update_one(
        {"session_id": req.session_id},
        {"$push": {"messages": {"role": "user", "content": req.message}}},
        upsert=True,
    )

    async def event_gen():
        buf = []
        try:
            async for ev in chat.stream_message(UserMessage(text=req.message)):
                if isinstance(ev, TextDelta):
                    buf.append(ev.content)
                    yield f"data: {json.dumps({'delta': ev.content})}\n\n"
                elif isinstance(ev, StreamDone):
                    break
            final = "".join(buf)
            await db.chat_sessions.update_one(
                {"session_id": req.session_id},
                {"$push": {"messages": {"role": "assistant", "content": final}}},
            )
            yield f"data: {json.dumps({'done': True})}\n\n"
        except Exception as e:
            log.exception("AIAH stream error")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        event_gen(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no", "Connection": "keep-alive"},
    )


@api.get("/aiah/history/{session_id}")
async def aiah_history(session_id: str):
    doc = await db.chat_sessions.find_one({"session_id": session_id}, {"_id": 0})
    return doc or {"session_id": session_id, "messages": []}


# ============================================================
# mount
# ============================================================
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
