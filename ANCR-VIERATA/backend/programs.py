"""VIEARTA Programs module — Learning, Performance, Recovery, Circles, Support,
Wellness, Admin, Consent. All routers registered under /api/*.

Content is educational and supportive — never medical claims, never shaming."""
from __future__ import annotations

import os
import re
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal, Dict, Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field


def _new_id() -> str: return str(uuid.uuid4())
def _now() -> str: return datetime.now(timezone.utc).isoformat()
def _today() -> str: return datetime.now(timezone.utc).date().isoformat()


# ============================================================================
# CONTENT — LEARNING PATHWAYS + LESSONS
# ============================================================================
# Each lesson.linked_tool routes to a real tool with a query hint.
# tool.kind ∈ nutrition | mindfulness | movement | checkin | performance | recovery
PATHWAYS: List[Dict[str, Any]] = [
    {
        "id": "pw_vocal", "title": "Vocal Longevity",
        "summary": "Care for the instrument that carries your voice for the whole career.",
        "category": "voice", "for_disciplines": ["Vocalist", "Songwriter", "Actor"],
        "lessons": [
            {"id": "ls_vocal_hydro", "order": 1, "title": "Hydration and the Vocal Folds",
             "estimated_minutes": 6,
             "content": "Vocal folds vibrate hundreds of times per second. A well-hydrated system moves easily and recovers faster.\n\n**Practice**\n- Sip room-temperature water throughout the day.\n- Avoid drying agents right before a session (excess caffeine, alcohol).\n- Notice how your voice feels *thirty minutes* after your first big drink.\n\nHydration is not a fix for injury. If your voice hurts, rest and consult a qualified professional.",
             "linked_tool": {"kind": "nutrition", "hint": "log_water"},
             "reflection_prompt": "Which two hydration cues can you build into tomorrow?"},
            {"id": "ls_vocal_warm", "order": 2, "title": "A Simple Daily Warm-Up",
             "estimated_minutes": 7,
             "content": "Warming up is not performance. It is greeting the instrument.\n\n**Steps**\n1. Two minutes of relaxed body movement.\n2. Lip trills across a small pitch range.\n3. Straw phonation — 60 seconds.\n4. Slow humming glides.\n5. One clean spoken phrase you love.",
             "linked_tool": {"kind": "movement", "hint": "mv_vocal"},
             "reflection_prompt": "How did your voice feel after this warm-up vs. before?"},
            {"id": "ls_vocal_rest", "order": 3, "title": "Vocal Rest Is Part of the Practice",
             "estimated_minutes": 5,
             "content": "Silence is not lost time. It is repair.\n\n**Practice**\n- Schedule at least one meaningful vocal-rest window per week.\n- Silent hangs — texting instead of chatting, tea instead of talking — count.\n- Track how rest days sit next to your best-sounding sessions.",
             "linked_tool": {"kind": "mindfulness", "hint": "mf_screen"},
             "reflection_prompt": "When will you take your next 30-minute vocal rest?"},
        ],
    },
    {
        "id": "pw_studio", "title": "Studio Health",
        "summary": "Protect your ears, your posture and your focus during long sessions.",
        "category": "hearing", "for_disciplines": ["Producer", "Engineer", "Musician"],
        "lessons": [
            {"id": "ls_studio_hear", "order": 1, "title": "Hearing Protection Fundamentals",
             "estimated_minutes": 6,
             "content": "Your ears are irreplaceable. Volume damage adds up quietly.\n\n**Guidelines**\n- Below 85 dB when possible.\n- Take a 5-minute silence break every hour.\n- Reference at low volume more often than you reference loud.\n- Musician-grade earplugs are not a compromise — they are a career choice.",
             "linked_tool": {"kind": "mindfulness", "hint": "mf_studio_break"},
             "reflection_prompt": "What is one boundary you will hold in the next studio session?"},
            {"id": "ls_studio_pos", "order": 2, "title": "Studio Ergonomics",
             "estimated_minutes": 5,
             "content": "A neutral spine is a longer career. Screens at eye height, monitors at ear height, feet flat, elbows at ~90°.\n\n**Micro-reset (every 45 min)**\n- Stand, roll shoulders, lengthen the neck.\n- Look 20 feet away for 20 seconds.\n- Sip water and return.",
             "linked_tool": {"kind": "movement", "hint": "mv_chair"},
             "reflection_prompt": "Where will you place a small note that reminds you to reset?"},
            {"id": "ls_studio_focus", "order": 3, "title": "Deep Work Without Burnout",
             "estimated_minutes": 5,
             "content": "The best sessions are protected. Not longer — protected.\n\n**Practice**\n- Name the single outcome for the block.\n- Set a visible timer.\n- One thing at a time. Slack can wait 50 minutes.\n- End with a small win, on purpose.",
             "linked_tool": {"kind": "mindfulness", "hint": "mf_focus_5"},
             "reflection_prompt": "What outcome will you protect first tomorrow?"},
        ],
    },
    {
        "id": "pw_perf", "title": "Performance Preparation",
        "summary": "Show up ready — steady body, present mind, prepared voice.",
        "category": "performance", "for_disciplines": ["Vocalist", "Musician", "Dancer", "Actor"],
        "lessons": [
            {"id": "ls_perf_fuel", "order": 1, "title": "Fueling on Performance Day",
             "estimated_minutes": 6,
             "content": "Performance-day nutrition supports steadiness — not spikes.\n\n**Practice**\n- Eat a familiar meal 2–3 hours before.\n- Hydrate steadily; avoid new supplements on show day.\n- Pack a small pre-set snack for backstage.\n\nThis is educational, not medical. If you follow a professional plan, follow it.",
             "linked_tool": {"kind": "nutrition", "hint": "meal_type=pre_performance"},
             "reflection_prompt": "What is your reliable pre-show meal?"},
            {"id": "ls_perf_breath", "order": 2, "title": "Pre-Show Nervous System Reset",
             "estimated_minutes": 4,
             "content": "Nervousness is not the enemy. It is energy that needs a shape.\n\n**Practice — box breathing**\n4 in, 4 hold, 4 out, 4 hold, for two minutes. Feet planted. Jaw loose. One phrase in your head that reminds you why you love this.",
             "linked_tool": {"kind": "mindfulness", "hint": "mf_pre_perf"},
             "reflection_prompt": "Which phrase steadies you before you step up?"},
            {"id": "ls_perf_warm", "order": 3, "title": "Warm-Up as a Ritual",
             "estimated_minutes": 6,
             "content": "A ritual is a repeatable order of small acts. It becomes home.\n\n**A sample ritual**\n1. Two-minute reset.\n2. Vocal warm-up (or instrument-specific).\n3. Mobility routine for your discipline.\n4. Hydration check.\n5. A single sentence spoken to yourself.",
             "linked_tool": {"kind": "performance", "hint": "start_ritual"},
             "reflection_prompt": "Write your own six-step performance ritual."},
        ],
    },
    {
        "id": "pw_recov", "title": "Creative Recovery",
        "summary": "The night after the show is where next month's work is quietly built.",
        "category": "recovery", "for_disciplines": ["Vocalist", "Musician", "Dancer", "Actor", "Filmmaker"],
        "lessons": [
            {"id": "ls_rec_sleep", "order": 1, "title": "Sleep Architecture for Late-Night Sessions",
             "estimated_minutes": 7,
             "content": "Sleep is not passive. It is when learning consolidates and the body rebuilds.\n\n**Practice**\n- Cool room, dim light, screens down 30 minutes prior.\n- After a late show, protect the *following* morning, not the same night.\n- A short body scan slows the internal traffic.",
             "linked_tool": {"kind": "mindfulness", "hint": "mf_sleep"},
             "reflection_prompt": "Which one sleep signal will you honor this week?"},
            {"id": "ls_rec_cooldown", "order": 2, "title": "Post-Performance Cooldown",
             "estimated_minutes": 6,
             "content": "A short cool-down helps the nervous system return home.\n\n**Practice**\n- 2 minutes walking, slowing down.\n- 3 minutes of gentle mobility.\n- 2 minutes of long exhales.\n- One reflection: something that went well, something you learned.",
             "linked_tool": {"kind": "movement", "hint": "mv_post_perf"},
             "reflection_prompt": "What was your recent one-thing-that-went-well?"},
            {"id": "ls_rec_meal", "order": 3, "title": "Recovery Meals",
             "estimated_minutes": 5,
             "content": "Recovery meals are not restrictive. They are supportive.\n\n**Practice**\n- Balanced plate: protein + slow carb + veg + fluids.\n- Warm foods often feel steadying after big output.\n- Log one recovery meal after your next performance and note how you feel two hours later.",
             "linked_tool": {"kind": "nutrition", "hint": "meal_type=post_performance"},
             "reflection_prompt": "What does a recovery meal look like *for you*?"},
        ],
    },
]

LESSONS_INDEX = {ls["id"]: (pw, ls) for pw in PATHWAYS for ls in pw["lessons"]}


# ============================================================================
# CONTENT — PERFORMANCE RITUALS (chainable)
# ============================================================================
RITUAL_TEMPLATES: List[Dict[str, Any]] = [
    {"id": "rt_show", "title": "Show-Day Ritual", "for": "live_performance", "total_minutes": 18,
     "summary": "A calm, complete pre-show flow.",
     "steps": [
         {"kind": "mindfulness", "ref": "mf_pre_perf", "note": "Steady the nervous system."},
         {"kind": "movement", "ref": "mv_vocal", "note": "Open the ribs and voice."},
         {"kind": "movement", "ref": "mv_pre_perf", "note": "Wake the full body."},
         {"kind": "nutrition", "ref": "hydration", "note": "Sip water. Not too much."},
         {"kind": "affirmation", "ref": "af_013", "note": "One phrase for the stage."},
     ]},
    {"id": "rt_audition", "title": "Audition Ritual", "for": "audition", "total_minutes": 14,
     "summary": "Quick, honest preparation for a high-stakes room.",
     "steps": [
         {"kind": "mindfulness", "ref": "mf_reset_2", "note": "Two-minute reset."},
         {"kind": "mindfulness", "ref": "mf_pre_perf", "note": "Box breathing."},
         {"kind": "movement", "ref": "mv_neck", "note": "Release the shoulders."},
         {"kind": "affirmation", "ref": "af_028", "note": "Trust your preparation."},
     ]},
    {"id": "rt_studio", "title": "Studio Session Warm-Up", "for": "studio", "total_minutes": 12,
     "summary": "Set the room and the instrument.",
     "steps": [
         {"kind": "movement", "ref": "mv_chair", "note": "Reset the posture."},
         {"kind": "movement", "ref": "mv_wrist", "note": "Wake the hands."},
         {"kind": "mindfulness", "ref": "mf_focus_5", "note": "Choose one outcome."},
         {"kind": "affirmation", "ref": "af_007", "note": "Full, undivided care."},
     ]},
    {"id": "rt_rehearsal", "title": "Rehearsal Warm-Up", "for": "rehearsal", "total_minutes": 15,
     "summary": "Move together with a steady body and mind.",
     "steps": [
         {"kind": "movement", "ref": "mv_pre_reh", "note": "Prepare the body."},
         {"kind": "movement", "ref": "mv_vocal", "note": "Vocal & breath."},
         {"kind": "mindfulness", "ref": "mf_reset_2", "note": "Arrive on purpose."},
     ]},
]


# ============================================================================
# CONTENT — RECOVERY SESSIONS (chainable)
# ============================================================================
RECOVERY_SESSIONS: List[Dict[str, Any]] = [
    {"id": "rc_post_show", "title": "Post-Show Recovery", "for": "live_performance", "total_minutes": 16,
     "summary": "Return home in body and mind after a performance.",
     "steps": [
         {"kind": "movement", "ref": "mv_post_perf", "note": "Cool the body down."},
         {"kind": "mindfulness", "ref": "mf_post_perf", "note": "Decompress the mind."},
         {"kind": "nutrition", "ref": "meal_type=post_performance", "note": "Recovery meal."},
     ]},
    {"id": "rc_tour", "title": "Tour / Travel Recovery", "for": "travel", "total_minutes": 14,
     "summary": "A day-of-travel routine to keep the body moving.",
     "steps": [
         {"kind": "movement", "ref": "mv_travel", "note": "Move fluids and joints."},
         {"kind": "mindfulness", "ref": "mf_ground_10", "note": "Return to yourself."},
         {"kind": "nutrition", "ref": "hydration", "note": "Extra hydration on travel days."},
     ]},
    {"id": "rc_studio", "title": "Long Studio Recovery", "for": "studio", "total_minutes": 12,
     "summary": "Undo the shape of a long session.",
     "steps": [
         {"kind": "movement", "ref": "mv_back_hip", "note": "Open back & hips."},
         {"kind": "mindfulness", "ref": "mf_screen", "note": "Rest the eyes and mind."},
     ]},
    {"id": "rc_dancer", "title": "Dancer Recovery Day", "for": "rest", "total_minutes": 18,
     "summary": "Gentle work on days meant for restoration.",
     "steps": [
         {"kind": "movement", "ref": "mv_recovery", "note": "Restorative movement."},
         {"kind": "mindfulness", "ref": "mf_sleep", "note": "Set the stage for sleep."},
     ]},
    {"id": "rc_creative", "title": "Creative Block Reset", "for": "writing", "total_minutes": 10,
     "summary": "Move the mind out of a stuck loop.",
     "steps": [
         {"kind": "movement", "ref": "mv_full", "note": "Change the state of the body."},
         {"kind": "mindfulness", "ref": "mf_block", "note": "One new small question."},
     ]},
]


# ============================================================================
# CONTENT — WELLNESS CIRCLES (seed)
# ============================================================================
CIRCLE_TEMPLATES: List[Dict[str, Any]] = [
    {"id": "wc_vocalists", "title": "Vocal Health for Producers & Vocalists",
     "focus": "Vocal Longevity", "for_disciplines": ["Vocalist", "Producer", "Songwriter"],
     "capacity": 12, "duration_minutes": 60,
     "description": "A small group conversation on protecting the voice through studio-heavy weeks."},
    {"id": "wc_performers", "title": "Pre-Show Rituals",
     "focus": "Performance Preparation", "for_disciplines": ["Vocalist", "Dancer", "Actor", "Musician"],
     "capacity": 15, "duration_minutes": 60,
     "description": "Share and refine a ritual you can lean on."},
    {"id": "wc_recovery", "title": "Creative Recovery Circle",
     "focus": "Creative Recovery", "for_disciplines": ["Any"],
     "capacity": 20, "duration_minutes": 75,
     "description": "Sleep, rest, and returning to the work after a big output."},
    {"id": "wc_boundaries", "title": "Boundaries & Sustainability",
     "focus": "Sustainable Creativity", "for_disciplines": ["Any"],
     "capacity": 18, "duration_minutes": 60,
     "description": "Building a career you can still love in ten years."},
]


# ============================================================================
# CONTENT — SUPPORT RESOURCES
# ============================================================================
SUPPORT_RESOURCES: List[Dict[str, Any]] = [
    {"id": "sr_ccdp", "title": "CCDP Program Support",
     "kind": "program", "url": "#ccdp-support",
     "description": "Reach the CCDP program team for academic and program questions."},
    {"id": "sr_mentor", "title": "Book Office Hours with a Mentor",
     "kind": "mentor", "url": "#book-mentor",
     "description": "Weekly office hours across each creative discipline."},
    {"id": "sr_nutrition", "title": "Qualified Nutrition Professional",
     "kind": "nutrition", "url": "#nutrition-pro",
     "description": "For personalized nutrition guidance beyond educational estimates."},
    {"id": "sr_mental", "title": "Mental Health Support",
     "kind": "mental_health", "url": "#mental-health",
     "description": "Confidential support with a licensed mental-health professional."},
    {"id": "sr_medical", "title": "Medical Care",
     "kind": "medical", "url": "#medical",
     "description": "For symptoms, injuries, or concerns that need medical attention."},
    {"id": "sr_access", "title": "Accessibility Services",
     "kind": "accessibility", "url": "#accessibility",
     "description": "Request accommodations for classes, rehearsals or performances."},
    {"id": "sr_crisis", "title": "Crisis Support",
     "kind": "crisis", "url": "#crisis",
     "description": "If you are in crisis, please reach out to your local emergency services or a crisis line right away."},
    {"id": "sr_disclaim", "title": "VIEARTA Educational Disclaimer",
     "kind": "disclaimer", "url": "#disclaimer",
     "description": "VIEARTA is educational — not a medical or therapeutic service. Add professional care as you need it."},
]


# ============================================================================
# CONTENT — HABIT PRESETS
# ============================================================================
HABIT_PRESETS: List[Dict[str, Any]] = [
    {"key": "morning_water", "title": "Morning water", "cadence": "daily"},
    {"key": "vocal_warmup", "title": "Vocal warm-up", "cadence": "daily"},
    {"key": "screen_break", "title": "Screen break every hour", "cadence": "daily"},
    {"key": "sleep_target", "title": "In bed by target time", "cadence": "daily"},
    {"key": "movement_15", "title": "15 min of movement", "cadence": "daily"},
    {"key": "reflection_journal", "title": "Reflection journal", "cadence": "daily"},
    {"key": "rest_day", "title": "One protected rest day", "cadence": "weekly"},
    {"key": "circle_attendance", "title": "Attend one Wellness Circle", "cadence": "weekly"},
]


# ============================================================================
# MODELS
# ============================================================================
class LessonReadIn(BaseModel):
    lesson_id: str


class LessonReflectIn(BaseModel):
    lesson_id: str
    reflection: str = Field(min_length=1, max_length=4000)


class LessonToolLaunchIn(BaseModel):
    lesson_id: str


class RitualCompleteIn(BaseModel):
    ritual_id: str
    note: Optional[str] = None


class RecoveryCompleteIn(BaseModel):
    session_id: str
    note: Optional[str] = None


class CircleRSVPIn(BaseModel):
    circle_id: str


class SupportMessageIn(BaseModel):
    subject: str = Field(min_length=2, max_length=140)
    body: str = Field(min_length=2, max_length=4000)
    resource_id: Optional[str] = None


class HabitCreateIn(BaseModel):
    title: str
    cadence: Literal["daily", "weekly"] = "daily"


class HabitLogIn(BaseModel):
    habit_id: str


class JournalIn(BaseModel):
    body: str = Field(min_length=1, max_length=6000)
    mood: Optional[int] = Field(default=None, ge=1, le=5)


class ConsentIn(BaseModel):
    share_wellness_with_mentor: Optional[bool] = None
    share_reflections_with_mentor: Optional[bool] = None
    share_habits_with_mentor: Optional[bool] = None


# ---------- Media & Circle chat models ----------
MediaCategory = Literal["lesson", "movement", "circle", "workshop", "general"]
MediaType = Literal["video", "audio"]


class MediaItemIn(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1200)
    url: str = Field(min_length=6, max_length=1000)
    media_type: MediaType = "video"
    category: MediaCategory = "general"
    tags: List[str] = []
    linked_lesson_id: Optional[str] = None
    linked_movement_id: Optional[str] = None
    linked_circle_id: Optional[str] = None
    duration_seconds: Optional[int] = Field(default=None, ge=0, le=60 * 60 * 6)
    thumbnail_url: Optional[str] = None


class CircleMessageIn(BaseModel):
    body: str = Field(min_length=1, max_length=2000)
    kind: Literal["pre", "post", "general"] = "general"


class MediaPlaylistIn(BaseModel):
    title: str = Field(min_length=2, max_length=140)
    description: Optional[str] = Field(default=None, max_length=1200)
    category: MediaCategory = "general"
    media_ids: List[str] = []


class PlaylistMediaOp(BaseModel):
    media_id: str


class CircleJoinUrlIn(BaseModel):
    join_url: Optional[str] = Field(default=None, max_length=1000)

    @classmethod
    def _validate_scheme(cls, v: Optional[str]) -> Optional[str]:
        if not v: return None
        s = v.strip()
        if not s: return None
        low = s.lower()
        # Reject dangerous schemes; only allow https:// (or http:// for local dev)
        if low.startswith("javascript:") or low.startswith("data:") or low.startswith("vbscript:") or low.startswith("file:"):
            raise ValueError("Only https:// URLs are allowed for the join link.")
        if not (low.startswith("https://") or low.startswith("http://")):
            raise ValueError("Join URL must start with https:// (or http:// for local development).")
        return s

    def model_post_init(self, __context):
        self.join_url = self._validate_scheme(self.join_url)


# ============================================================================
# Router factory
# ============================================================================
def build_programs_router(db, get_current_user):
    r = APIRouter(prefix="/api")

    async def require_admin(user: dict = Depends(get_current_user)):
        if user.get("role") != "admin":
            raise HTTPException(403, "Admin only")
        return user

    # ---------- LEARNING ----------
    async def _progress_for_user(user_id: str) -> Dict[str, Dict[str, Any]]:
        cur = db.viearta_lesson_progress.find({"user_id": user_id}, {"_id": 0})
        docs = await cur.to_list(500)
        return {d["lesson_id"]: d for d in docs}

    def _lesson_public(ls: Dict[str, Any], prog: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        return {
            **ls,
            "status": (prog or {}).get("status", "not_started"),
            "reflection": (prog or {}).get("reflection"),
            "credit_earned": bool((prog or {}).get("credit_earned")),
            "read_at": (prog or {}).get("read_at"),
            "tool_launched_at": (prog or {}).get("tool_launched_at"),
            "reflected_at": (prog or {}).get("reflected_at"),
        }

    def _pathway_public(pw: Dict[str, Any], progress: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        lessons = [_lesson_public(ls, progress.get(ls["id"])) for ls in pw["lessons"]]
        completed = sum(1 for l in lessons if l["credit_earned"])
        return {**pw, "lessons": lessons, "completed_lessons": completed,
                "total_lessons": len(lessons),
                "progress": round(100 * completed / max(len(lessons), 1))}

    @r.get("/learning/pathways")
    async def learning_pathways(user: dict = Depends(get_current_user)):
        prog = await _progress_for_user(user["id"])
        return {"items": [_pathway_public(pw, prog) for pw in PATHWAYS]}

    @r.get("/learning/pathways/{pathway_id}")
    async def learning_pathway(pathway_id: str, user: dict = Depends(get_current_user)):
        pw = next((p for p in PATHWAYS if p["id"] == pathway_id), None)
        if not pw: raise HTTPException(404, "Pathway not found")
        prog = await _progress_for_user(user["id"])
        return _pathway_public(pw, prog)

    @r.get("/learning/lessons/{lesson_id}")
    async def learning_lesson(lesson_id: str, user: dict = Depends(get_current_user)):
        pair = LESSONS_INDEX.get(lesson_id)
        if not pair: raise HTTPException(404, "Lesson not found")
        pw, ls = pair
        prog = await db.viearta_lesson_progress.find_one(
            {"user_id": user["id"], "lesson_id": lesson_id}, {"_id": 0})
        return {"pathway": {"id": pw["id"], "title": pw["title"]},
                **_lesson_public(ls, prog)}

    async def _touch_progress(user_id: str, lesson_id: str, patch: Dict[str, Any]):
        await db.viearta_lesson_progress.update_one(
            {"user_id": user_id, "lesson_id": lesson_id},
            {"$set": {**patch, "user_id": user_id, "lesson_id": lesson_id, "updated_at": _now()},
             "$setOnInsert": {"id": _new_id(), "created_at": _now()}},
            upsert=True,
        )

    @r.post("/learning/lessons/read")
    async def lesson_read(payload: LessonReadIn, user: dict = Depends(get_current_user)):
        if payload.lesson_id not in LESSONS_INDEX:
            raise HTTPException(404, "Lesson not found")
        existing = await db.viearta_lesson_progress.find_one(
            {"user_id": user["id"], "lesson_id": payload.lesson_id}, {"_id": 0})
        new_status = existing.get("status") if existing and existing.get("status") in ("tool_launched", "reflected", "completed") else "read"
        await _touch_progress(user["id"], payload.lesson_id,
                              {"status": new_status, "read_at": _now()})
        return {"ok": True, "status": new_status}

    @r.post("/learning/lessons/launch")
    async def lesson_launch(payload: LessonToolLaunchIn, user: dict = Depends(get_current_user)):
        if payload.lesson_id not in LESSONS_INDEX:
            raise HTTPException(404, "Lesson not found")
        existing = await db.viearta_lesson_progress.find_one(
            {"user_id": user["id"], "lesson_id": payload.lesson_id}, {"_id": 0})
        new_status = "reflected" if existing and existing.get("reflection") else "tool_launched"
        await _touch_progress(user["id"], payload.lesson_id,
                              {"status": new_status, "tool_launched_at": _now()})
        return {"ok": True, "status": new_status}

    @r.post("/learning/lessons/reflect")
    async def lesson_reflect(payload: LessonReflectIn, user: dict = Depends(get_current_user)):
        if payload.lesson_id not in LESSONS_INDEX:
            raise HTTPException(404, "Lesson not found")
        existing = await db.viearta_lesson_progress.find_one(
            {"user_id": user["id"], "lesson_id": payload.lesson_id}, {"_id": 0}) or {}
        # Real-life credit = participation + reflection (both required, per policy).
        credit = bool(existing.get("tool_launched_at")) and len(payload.reflection.strip()) >= 1
        patch = {
            "reflection": payload.reflection.strip(),
            "reflected_at": _now(),
            "status": "completed" if credit else "reflected",
            "credit_earned": credit,
        }
        await _touch_progress(user["id"], payload.lesson_id, patch)
        return {"ok": True, "credit_earned": credit, "status": patch["status"]}

    @r.get("/learning/credits")
    async def learning_credits(user: dict = Depends(get_current_user)):
        cur = db.viearta_lesson_progress.find(
            {"user_id": user["id"], "credit_earned": True}, {"_id": 0})
        credits = await cur.to_list(500)
        # Attach lesson titles
        enriched = []
        for c in credits:
            pair = LESSONS_INDEX.get(c["lesson_id"])
            if not pair: continue
            pw, ls = pair
            enriched.append({
                **c, "pathway_id": pw["id"], "pathway_title": pw["title"],
                "lesson_title": ls["title"],
            })
        return {"items": enriched, "total": len(enriched)}

    @r.get("/learning/current")
    async def learning_current_override(user: dict = Depends(get_current_user)):
        """Latest active pathway with the next unread lesson (replaces the seed stub)."""
        prog = await _progress_for_user(user["id"])
        for pw in PATHWAYS:
            for ls in pw["lessons"]:
                st = prog.get(ls["id"], {}).get("status", "not_started")
                if st != "completed":
                    return {
                        "id": ls["id"], "pathway": pw["title"], "title": ls["title"],
                        "progress": round(100 * sum(1 for l in pw["lessons"] if prog.get(l["id"], {}).get("credit_earned")) / len(pw["lessons"])),
                        "total_lessons": len(pw["lessons"]),
                        "completed_lessons": sum(1 for l in pw["lessons"] if prog.get(l["id"], {}).get("credit_earned")),
                        "next_lesson_id": ls["id"], "pathway_id": pw["id"],
                    }
        return None

    # ---------- PERFORMANCE RITUALS ----------
    @r.get("/performance/rituals")
    async def rituals(user: dict = Depends(get_current_user)):
        custom = await db.viearta_rituals.find({"user_id": user["id"]}, {"_id": 0}).to_list(50)
        recent = await db.viearta_ritual_completions.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).limit(10).to_list(10)
        return {"templates": RITUAL_TEMPLATES, "custom": custom, "recent": recent}

    @r.post("/performance/rituals")
    async def create_ritual(payload: dict, user: dict = Depends(get_current_user)):
        doc = {
            "id": _new_id(), "user_id": user["id"], "created_at": _now(),
            "title": payload.get("title", "My ritual"),
            "for": payload.get("for", "custom"),
            "steps": payload.get("steps", []),
            "total_minutes": payload.get("total_minutes", 10),
            "summary": payload.get("summary", ""),
        }
        await db.viearta_rituals.insert_one(doc)
        doc.pop("_id", None)
        return doc

    @r.post("/performance/rituals/complete")
    async def ritual_complete(payload: RitualCompleteIn, user: dict = Depends(get_current_user)):
        doc = {"id": _new_id(), "user_id": user["id"], "ritual_id": payload.ritual_id,
               "note": payload.note, "date": _today(), "created_at": _now()}
        await db.viearta_ritual_completions.insert_one(doc)
        doc.pop("_id", None)
        return doc

    # ---------- RECOVERY ----------
    @r.get("/recovery/sessions")
    async def recovery_sessions(user: dict = Depends(get_current_user)):
        recent = await db.viearta_recovery_completions.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).limit(10).to_list(10)
        return {"templates": RECOVERY_SESSIONS, "recent": recent}

    @r.post("/recovery/sessions/complete")
    async def recovery_complete(payload: RecoveryCompleteIn, user: dict = Depends(get_current_user)):
        doc = {"id": _new_id(), "user_id": user["id"], "session_id": payload.session_id,
               "note": payload.note, "date": _today(), "created_at": _now()}
        await db.viearta_recovery_completions.insert_one(doc)
        doc.pop("_id", None)
        return doc

    # ---------- CIRCLES ----------
    @r.get("/circles")
    async def list_circles(user: dict = Depends(get_current_user)):
        now = datetime.now(timezone.utc)
        instances_cur = db.viearta_circle_instances.find({}, {"_id": 0})
        instances = await instances_cur.to_list(50)
        # Attach counts & user rsvp state + light per-discipline breakdown (privacy-preserving)
        result = []
        for ci in instances:
            rsvp_docs = await db.viearta_circle_rsvps.find({"circle_instance_id": ci["id"]}, {"_id": 0}).to_list(200)
            user_ids = [r["user_id"] for r in rsvp_docs]
            users = []
            if user_ids:
                users = await db.users.find({"id": {"$in": user_ids}}, {"_id": 0, "first_name": 1, "discipline": 1, "id": 1}).to_list(200)
            by_disc: Dict[str, int] = {}
            attendees_public = []
            for u in users:
                d = u.get("discipline") or "Creator"
                by_disc[d] = by_disc.get(d, 0) + 1
                # public attendee card = first name only + discipline (no email/ANCRID)
                attendees_public.append({"first_name": u["first_name"], "discipline": d})
            mine = any(r["user_id"] == user["id"] for r in rsvp_docs)
            result.append({
                **ci,
                "rsvp_count": len(rsvp_docs),
                "spots_left": max(0, ci.get("capacity", 20) - len(rsvp_docs)),
                "by_discipline": by_disc,
                "attendees": attendees_public,
                "my_rsvp": mine,
            })
        # Sort by starts_at ascending
        result.sort(key=lambda x: x.get("starts_at", ""))
        return {"items": result}

    @r.post("/circles/rsvp")
    async def circle_rsvp(payload: CircleRSVPIn, user: dict = Depends(get_current_user)):
        ci = await db.viearta_circle_instances.find_one({"id": payload.circle_id}, {"_id": 0})
        if not ci: raise HTTPException(404, "Circle not found")
        existing = await db.viearta_circle_rsvps.find_one(
            {"circle_instance_id": payload.circle_id, "user_id": user["id"]})
        if existing:
            await db.viearta_circle_rsvps.delete_one(
                {"circle_instance_id": payload.circle_id, "user_id": user["id"]})
            return {"rsvp": False}
        rsvp_count = await db.viearta_circle_rsvps.count_documents({"circle_instance_id": payload.circle_id})
        if rsvp_count >= ci.get("capacity", 20):
            raise HTTPException(400, "This circle is full")
        await db.viearta_circle_rsvps.insert_one({
            "id": _new_id(), "user_id": user["id"],
            "circle_instance_id": payload.circle_id, "created_at": _now(),
        })
        return {"rsvp": True}

    @r.get("/circles/mine")
    async def my_circles(user: dict = Depends(get_current_user)):
        rsvps = await db.viearta_circle_rsvps.find({"user_id": user["id"]}, {"_id": 0}).to_list(50)
        ids = [r["circle_instance_id"] for r in rsvps]
        if not ids: return {"items": []}
        cis = await db.viearta_circle_instances.find({"id": {"$in": ids}}, {"_id": 0}).to_list(50)
        cis.sort(key=lambda x: x.get("starts_at", ""))
        return {"items": cis}

    # ---------- SUPPORT ----------
    @r.get("/support/resources")
    async def support_resources(user: dict = Depends(get_current_user)):
        return {"items": SUPPORT_RESOURCES}

    @r.post("/support/messages")
    async def support_message(payload: SupportMessageIn, user: dict = Depends(get_current_user)):
        doc = {"id": _new_id(), "user_id": user["id"],
               "subject": payload.subject, "body": payload.body,
               "resource_id": payload.resource_id, "status": "received",
               "created_at": _now()}
        await db.viearta_support_messages.insert_one(doc)
        doc.pop("_id", None)
        return doc

    @r.get("/support/messages")
    async def my_support_messages(user: dict = Depends(get_current_user)):
        cur = db.viearta_support_messages.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).limit(20)
        return {"items": await cur.to_list(20)}

    # ---------- WELLNESS (habits + journal + rhythms) ----------
    @r.get("/wellness/habits")
    async def get_habits(user: dict = Depends(get_current_user)):
        habits = await db.viearta_habits.find({"user_id": user["id"]}, {"_id": 0}).to_list(50)
        today = _today()
        window = [(datetime.now(timezone.utc).date() - timedelta(days=i)).isoformat() for i in range(0, 14)]
        for h in habits:
            logs = await db.viearta_habit_logs.find({"user_id": user["id"], "habit_id": h["id"]}, {"_id": 0}).to_list(200)
            log_days = {l["date"] for l in logs}
            # simple current streak (consecutive days from today)
            streak = 0
            for i in range(0, 60):
                d = (datetime.now(timezone.utc).date() - timedelta(days=i)).isoformat()
                if d in log_days: streak += 1
                else: break
            h["completed_today"] = today in log_days
            h["streak"] = streak
            h["last_14"] = [d in log_days for d in reversed(window)]
        return {"items": habits, "presets": HABIT_PRESETS}

    @r.post("/wellness/habits")
    async def create_habit(payload: HabitCreateIn, user: dict = Depends(get_current_user)):
        doc = {"id": _new_id(), "user_id": user["id"],
               "title": payload.title, "cadence": payload.cadence,
               "created_at": _now()}
        await db.viearta_habits.insert_one(doc)
        doc.pop("_id", None)
        return doc

    @r.delete("/wellness/habits/{habit_id}")
    async def delete_habit(habit_id: str, user: dict = Depends(get_current_user)):
        await db.viearta_habits.delete_one({"id": habit_id, "user_id": user["id"]})
        await db.viearta_habit_logs.delete_many({"habit_id": habit_id, "user_id": user["id"]})
        return {"ok": True}

    @r.post("/wellness/habits/log")
    async def log_habit(payload: HabitLogIn, user: dict = Depends(get_current_user)):
        habit = await db.viearta_habits.find_one({"id": payload.habit_id, "user_id": user["id"]})
        if not habit: raise HTTPException(404, "Habit not found")
        today = _today()
        existing = await db.viearta_habit_logs.find_one({"habit_id": payload.habit_id, "user_id": user["id"], "date": today})
        if existing:
            await db.viearta_habit_logs.delete_one({"habit_id": payload.habit_id, "user_id": user["id"], "date": today})
            return {"logged": False}
        await db.viearta_habit_logs.insert_one({
            "id": _new_id(), "habit_id": payload.habit_id, "user_id": user["id"],
            "date": today, "at": _now(),
        })
        return {"logged": True}

    @r.get("/wellness/journal")
    async def get_journal(user: dict = Depends(get_current_user)):
        cur = db.viearta_journal.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).limit(30)
        return {"items": await cur.to_list(30)}

    @r.post("/wellness/journal")
    async def add_journal(payload: JournalIn, user: dict = Depends(get_current_user)):
        doc = {"id": _new_id(), "user_id": user["id"],
               "body": payload.body.strip(), "mood": payload.mood,
               "date": _today(), "created_at": _now()}
        await db.viearta_journal.insert_one(doc)
        doc.pop("_id", None)
        return doc

    @r.delete("/wellness/journal/{entry_id}")
    async def del_journal(entry_id: str, user: dict = Depends(get_current_user)):
        await db.viearta_journal.delete_one({"id": entry_id, "user_id": user["id"]})
        return {"ok": True}

    @r.get("/wellness/rhythms")
    async def wellness_rhythms(days: int = 30, user: dict = Depends(get_current_user)):
        days = max(7, min(days, 90))
        today_dt = datetime.now(timezone.utc).date()
        start = (today_dt - timedelta(days=days - 1)).isoformat()

        checkins = await db.checkins.find({"user_id": user["id"], "date": {"$gte": start}}, {"_id": 0}).to_list(200)
        meals = await db.viearta_meals.find({"user_id": user["id"], "date": {"$gte": start}}, {"_id": 0}).to_list(400)
        hyd = await db.viearta_hydration.find({"user_id": user["id"], "date": {"$gte": start}}, {"_id": 0}).to_list(400)

        by_date: Dict[str, Dict[str, Any]] = {}
        for c in checkins:
            snap = c.get("snapshot", {})
            by_date[c["date"]] = {
                "date": c["date"],
                "energy": snap.get("energy_level"),
                "stress": snap.get("stress_level"),
                "sleep": snap.get("sleep_hours"),
                "mood": snap.get("mood"),
                "kcal": 0, "protein": 0, "water_ml": 0,
            }
        for m in meals:
            d = by_date.setdefault(m["date"], {"date": m["date"], "energy": None, "stress": None, "sleep": None, "mood": None, "kcal": 0, "protein": 0, "water_ml": 0})
            d["kcal"] += float(m.get("totals", {}).get("kcal", 0) or 0)
            d["protein"] += float(m.get("totals", {}).get("protein", 0) or 0)
        for w in hyd:
            d = by_date.setdefault(w["date"], {"date": w["date"], "energy": None, "stress": None, "sleep": None, "mood": None, "kcal": 0, "protein": 0, "water_ml": 0})
            d["water_ml"] += int(w.get("ml", 0) or 0)

        series = []
        for i in range(days - 1, -1, -1):
            d = (today_dt - timedelta(days=i)).isoformat()
            row = by_date.get(d) or {"date": d, "energy": None, "stress": None, "sleep": None, "mood": None, "kcal": 0, "protein": 0, "water_ml": 0}
            row["kcal"] = round(row["kcal"], 1)
            row["protein"] = round(row["protein"], 1)
            series.append(row)

        # Simple observations (not causes):
        def _corr_pearson(xs, ys):
            pairs = [(x, y) for x, y in zip(xs, ys) if x is not None and y is not None]
            if len(pairs) < 4: return None
            n = len(pairs); mx = sum(p[0] for p in pairs) / n; my = sum(p[1] for p in pairs) / n
            num = sum((p[0] - mx) * (p[1] - my) for p in pairs)
            den_x = (sum((p[0] - mx) ** 2 for p in pairs)) ** 0.5
            den_y = (sum((p[1] - my) ** 2 for p in pairs)) ** 0.5
            if den_x == 0 or den_y == 0: return None
            return round(num / (den_x * den_y), 2)

        energies = [r["energy"] for r in series]
        sleeps = [r["sleep"] for r in series]
        waters = [r["water_ml"] or None for r in series]
        stresses = [r["stress"] for r in series]
        observations = []
        r1 = _corr_pearson(sleeps, energies)
        if r1 is not None and r1 > 0.35:
            observations.append("Higher sleep hours tended to sit next to higher energy this window.")
        elif r1 is not None and r1 < -0.35:
            observations.append("Sleep and energy moved in different directions this window — worth a look.")
        r2 = _corr_pearson(waters, energies)
        if r2 is not None and r2 > 0.35:
            observations.append("Higher hydration days tended to sit next to higher energy.")
        r3 = _corr_pearson(stresses, energies)
        if r3 is not None and r3 < -0.35:
            observations.append("Higher stress tended to sit next to lower energy.")
        if not observations:
            observations.append("Not enough consistent data yet to note a pattern — keep gently checking in.")

        return {"days": days, "series": series, "observations": observations}

    # ---------- CONSENT ----------
    @r.get("/consent")
    async def get_consent(user: dict = Depends(get_current_user)):
        doc = await db.viearta_consent.find_one({"user_id": user["id"]}, {"_id": 0})
        defaults = {
            "user_id": user["id"],
            "share_wellness_with_mentor": False,
            "share_reflections_with_mentor": False,
            "share_habits_with_mentor": False,
        }
        if not doc:
            return defaults
        # Always merge defaults so response shape is stable after partial PUTs.
        return {**defaults, **doc}

    @r.put("/consent")
    async def put_consent(payload: ConsentIn, user: dict = Depends(get_current_user)):
        existing = await db.viearta_consent.find_one({"user_id": user["id"]}, {"_id": 0}) or {"user_id": user["id"]}
        patch = {k: v for k, v in payload.model_dump().items() if v is not None}
        new = {**existing, **patch, "user_id": user["id"], "updated_at": _now()}
        await db.viearta_consent.update_one({"user_id": user["id"]}, {"$set": new}, upsert=True)
        return new

    # ---------- ADMIN / STAFF ----------
    @r.get("/admin/students")
    async def admin_students(user: dict = Depends(require_admin)):
        cur = db.users.find({"role": "student"}, {"_id": 0, "password_hash": 0})
        users = await cur.to_list(500)
        return {"items": users, "total": len(users)}

    @r.get("/admin/aggregate")
    async def admin_aggregate(user: dict = Depends(require_admin)):
        """Aggregate anonymized patterns across all students. No PII returned."""
        today_dt = datetime.now(timezone.utc).date()
        start = (today_dt - timedelta(days=6)).isoformat()

        checkins = await db.checkins.find({"date": {"$gte": start}}, {"_id": 0}).to_list(2000)
        if not checkins:
            return {"days": 7, "students_active": 0, "avg_energy": None,
                    "avg_stress": None, "avg_sleep": None, "by_discipline": {}}

        # Aggregate per discipline, without exposing individual data
        by_disc: Dict[str, Dict[str, float]] = {}
        user_ids = list({c["user_id"] for c in checkins})
        users = await db.users.find({"id": {"$in": user_ids}}, {"_id": 0}).to_list(500)
        udisc = {u["id"]: (u.get("discipline") or "Other") for u in users}

        totals = {"energy": 0.0, "stress": 0.0, "sleep": 0.0, "count": 0}
        for c in checkins:
            snap = c.get("snapshot", {})
            totals["energy"] += snap.get("energy_level", 0) or 0
            totals["stress"] += snap.get("stress_level", 0) or 0
            totals["sleep"] += snap.get("sleep_hours", 0) or 0
            totals["count"] += 1

            d = udisc.get(c["user_id"], "Other")
            row = by_disc.setdefault(d, {"energy": 0.0, "stress": 0.0, "sleep": 0.0, "count": 0.0})
            row["energy"] += snap.get("energy_level", 0) or 0
            row["stress"] += snap.get("stress_level", 0) or 0
            row["sleep"] += snap.get("sleep_hours", 0) or 0
            row["count"] += 1

        def _avg(t):
            n = max(t["count"], 1)
            return {k: round(v / n, 2) for k, v in t.items() if k != "count"} | {"n": int(t["count"])}

        return {
            "days": 7,
            "students_active": len({c["user_id"] for c in checkins}),
            **_avg(totals),
            "by_discipline": {k: _avg(v) for k, v in by_disc.items()},
            "notice": "Aggregate view. No individual data is exposed.",
        }

    @r.get("/admin/consented-reflections")
    async def admin_consented(user: dict = Depends(require_admin)):
        """Only reflections from students who explicitly consented to share."""
        cur = db.viearta_consent.find({"share_reflections_with_mentor": True}, {"_id": 0})
        consents = await cur.to_list(500)
        ok_ids = [c["user_id"] for c in consents]
        if not ok_ids: return {"items": []}

        users = await db.users.find({"id": {"$in": ok_ids}}, {"_id": 0}).to_list(500)
        uname = {u["id"]: {"first_name": u["first_name"], "ancrid": u["ancrid"],
                          "discipline": u.get("discipline", "")} for u in users}

        # Aggregate: nutrition reflections + affirmation reflections + journal entries
        n_ref = await db.viearta_nutrition_reflections.find({"user_id": {"$in": ok_ids}}, {"_id": 0}).sort("created_at", -1).limit(200).to_list(200)
        a_ref = await db.viearta_affirmation_favs.find({"user_id": {"$in": ok_ids}, "reflection": {"$ne": None}}, {"_id": 0}).sort("created_at", -1).limit(200).to_list(200)
        j_ref = await db.viearta_journal.find({"user_id": {"$in": ok_ids}}, {"_id": 0}).sort("created_at", -1).limit(200).to_list(200)

        items = []
        for r_ in n_ref:
            items.append({"kind": "nutrition_reflection", "student": uname.get(r_["user_id"]),
                          "date": r_.get("date"), "created_at": r_.get("created_at"),
                          "text": r_.get("tomorrow_intention") or r_.get("affected_focus") or "(no note)"})
        for r_ in a_ref:
            items.append({"kind": "affirmation_reflection", "student": uname.get(r_["user_id"]),
                          "date": r_.get("created_at", "")[:10], "created_at": r_.get("created_at"),
                          "text": r_.get("reflection")})
        for r_ in j_ref:
            items.append({"kind": "journal", "student": uname.get(r_["user_id"]),
                          "date": r_.get("date"), "created_at": r_.get("created_at"),
                          "text": r_.get("body")})
        items.sort(key=lambda x: x.get("created_at") or "", reverse=True)
        return {"items": items[:100]}

    # ---------- ANCR SSO STUB ----------
    @r.get("/auth/ancr/status")
    async def ancr_status():
        return {
            "enabled": False,
            "message": "ANCR single sign-on will activate when the CCDP-ANCR handshake is configured. VIEARTA is ready to accept an ANCRID and identity payload from ANCR.",
            "expected_payload_shape": {
                "ancrid": "ANCRID-XXXX",
                "email": "student@ccdp.studio",
                "first_name": "First",
                "last_name": "Last",
                "discipline": "Artist • Producer • Songwriter",
                "signed_by_ancr": "<jwt-or-signed-token>",
            },
        }

    # ---------- MEDIA LIBRARY ----------
    def _detect_source(url: str) -> str:
        u = (url or "").lower()
        if "youtube.com" in u or "youtu.be" in u: return "youtube"
        if "vimeo.com" in u: return "vimeo"
        if u.endswith(".mp4") or u.endswith(".webm") or u.endswith(".mov"): return "direct_video"
        if u.endswith(".mp3") or u.endswith(".ogg") or u.endswith(".wav") or u.endswith(".m4a"): return "direct_audio"
        return "other"

    def _media_public(doc: dict) -> dict:
        return {**doc, "source": _detect_source(doc.get("url", ""))}

    @r.get("/media")
    async def list_media(
        category: Optional[str] = None,
        tag: Optional[str] = None,
        q: Optional[str] = None,
        user: dict = Depends(get_current_user),
    ):
        query: Dict[str, Any] = {}
        if category: query["category"] = category
        if tag: query["tags"] = tag
        if q:
            safe_q = re.escape(q)
            query["$or"] = [
                {"title": {"$regex": safe_q, "$options": "i"}},
                {"description": {"$regex": safe_q, "$options": "i"}},
            ]
        cur = db.viearta_media.find(query, {"_id": 0}).sort("created_at", -1)
        items = await cur.to_list(200)
        return {"items": [_media_public(d) for d in items]}

    @r.get("/media/for-lesson/{lesson_id}")
    async def media_for_lesson(lesson_id: str, user: dict = Depends(get_current_user)):
        cur = db.viearta_media.find({"linked_lesson_id": lesson_id}, {"_id": 0}).sort("created_at", -1)
        return {"items": [_media_public(d) for d in await cur.to_list(50)]}

    @r.get("/media/for-movement/{activity_id}")
    async def media_for_movement(activity_id: str, user: dict = Depends(get_current_user)):
        cur = db.viearta_media.find({"linked_movement_id": activity_id}, {"_id": 0}).sort("created_at", -1)
        return {"items": [_media_public(d) for d in await cur.to_list(50)]}

    @r.get("/media/for-circle/{circle_id}")
    async def media_for_circle(circle_id: str, user: dict = Depends(get_current_user)):
        cur = db.viearta_media.find(
            {"$or": [{"linked_circle_id": circle_id}, {"category": "workshop", "tags": circle_id}]},
            {"_id": 0}
        ).sort("created_at", -1)
        return {"items": [_media_public(d) for d in await cur.to_list(50)]}

    @r.get("/media/workshops")
    async def media_workshops(user: dict = Depends(get_current_user)):
        cur = db.viearta_media.find({"category": {"$in": ["workshop", "circle"]}}, {"_id": 0}).sort("created_at", -1)
        return {"items": [_media_public(d) for d in await cur.to_list(100)]}

    @r.post("/media")
    async def create_media(payload: MediaItemIn, user: dict = Depends(require_admin)):
        doc = {
            "id": _new_id(), "created_by": user["id"], "created_at": _now(),
            **payload.model_dump(),
        }
        await db.viearta_media.insert_one(doc)
        return _media_public({k: v for k, v in doc.items() if k != "_id"})

    @r.put("/media/{media_id}")
    async def update_media(media_id: str, payload: MediaItemIn, user: dict = Depends(require_admin)):
        res = await db.viearta_media.update_one(
            {"id": media_id},
            {"$set": {**payload.model_dump(), "updated_at": _now()}},
        )
        if not res.matched_count:
            raise HTTPException(404, "Media not found")
        doc = await db.viearta_media.find_one({"id": media_id}, {"_id": 0})
        return _media_public(doc)

    @r.delete("/media/{media_id}")
    async def delete_media(media_id: str, user: dict = Depends(require_admin)):
        res = await db.viearta_media.delete_one({"id": media_id})
        if not res.deleted_count:
            raise HTTPException(404, "Media not found")
        return {"ok": True}

    # ---------- CIRCLE CHAT ----------
    async def _require_circle_membership(user_id: str, circle_id: str, role: str) -> dict:
        ci = await db.viearta_circle_instances.find_one({"id": circle_id}, {"_id": 0})
        if not ci: raise HTTPException(404, "Circle not found")
        if role == "admin": return ci
        rsvp = await db.viearta_circle_rsvps.find_one({"user_id": user_id, "circle_instance_id": circle_id})
        if not rsvp:
            raise HTTPException(403, "RSVP required to view or post in this circle")
        return ci

    @r.get("/circles/{circle_id}")
    async def circle_detail(circle_id: str, user: dict = Depends(get_current_user)):
        ci = await db.viearta_circle_instances.find_one({"id": circle_id}, {"_id": 0})
        if not ci: raise HTTPException(404, "Circle not found")
        rsvps = await db.viearta_circle_rsvps.find({"circle_instance_id": circle_id}, {"_id": 0}).to_list(200)
        user_ids = [r["user_id"] for r in rsvps]
        users = []
        if user_ids:
            users = await db.users.find({"id": {"$in": user_ids}}, {"_id": 0, "first_name": 1, "discipline": 1, "id": 1}).to_list(200)
        by_disc: Dict[str, int] = {}
        attendees = []
        for u in users:
            d = u.get("discipline") or "Creator"
            by_disc[d] = by_disc.get(d, 0) + 1
            attendees.append({"user_id": u["id"], "first_name": u["first_name"], "discipline": d})
        mine = any(r["user_id"] == user["id"] for r in rsvps)
        # Only show attendee list to RSVPed members or admin
        show_attendees = mine or user.get("role") == "admin"
        return {
            **ci,
            "rsvp_count": len(rsvps),
            "spots_left": max(0, ci.get("capacity", 20) - len(rsvps)),
            "by_discipline": by_disc,
            "attendees": attendees if show_attendees else [],
            "my_rsvp": mine,
        }

    @r.get("/circles/{circle_id}/messages")
    async def list_messages(circle_id: str, user: dict = Depends(get_current_user)):
        await _require_circle_membership(user["id"], circle_id, user.get("role", "student"))
        cur = db.viearta_circle_messages.find({"circle_instance_id": circle_id}, {"_id": 0}).sort("created_at", 1)
        return {"items": await cur.to_list(500)}

    @r.post("/circles/{circle_id}/messages")
    async def post_message(circle_id: str, payload: CircleMessageIn, user: dict = Depends(get_current_user)):
        await _require_circle_membership(user["id"], circle_id, user.get("role", "student"))
        doc = {
            "id": _new_id(),
            "circle_instance_id": circle_id,
            "user_id": user["id"],
            "first_name": user["first_name"],
            "discipline": user.get("discipline", "Creator"),
            "ancrid": user.get("ancrid"),
            "body": payload.body.strip(),
            "kind": payload.kind,
            "created_at": _now(),
        }
        await db.viearta_circle_messages.insert_one(doc)
        doc.pop("_id", None)
        return doc

    @r.delete("/circles/messages/{message_id}")
    async def delete_message(message_id: str, user: dict = Depends(get_current_user)):
        # Own message OR admin
        msg = await db.viearta_circle_messages.find_one({"id": message_id}, {"_id": 0})
        if not msg: raise HTTPException(404, "Message not found")
        if msg["user_id"] != user["id"] and user.get("role") != "admin":
            raise HTTPException(403, "Not your message")
        await db.viearta_circle_messages.delete_one({"id": message_id})
        return {"ok": True}

    # ---------- CIRCLE JOIN URL (ANCRSYNC handoff) ----------
    @r.put("/circles/{circle_id}/join-url")
    async def set_circle_join_url(circle_id: str, payload: CircleJoinUrlIn, user: dict = Depends(require_admin)):
        res = await db.viearta_circle_instances.update_one(
            {"id": circle_id},
            {"$set": {"join_url": payload.join_url, "join_url_updated_at": _now()}},
        )
        if not res.matched_count:
            raise HTTPException(404, "Circle not found")
        doc = await db.viearta_circle_instances.find_one({"id": circle_id}, {"_id": 0})
        return doc

    # ---------- MEDIA PLAYLISTS ----------
    async def _playlist_public(pl: dict) -> dict:
        media_ids = pl.get("media_ids", []) or []
        if media_ids:
            media_docs = await db.viearta_media.find({"id": {"$in": media_ids}}, {"_id": 0}).to_list(200)
            by_id = {m["id"]: _media_public(m) for m in media_docs}
            resolved = [by_id[mid] for mid in media_ids if mid in by_id]
        else:
            resolved = []
        return {**pl, "media": resolved, "media_count": len(resolved)}

    @r.get("/media/playlists")
    async def list_playlists(category: Optional[str] = None, user: dict = Depends(get_current_user)):
        query: Dict[str, Any] = {}
        if category: query["category"] = category
        cur = db.viearta_playlists.find(query, {"_id": 0}).sort("created_at", -1)
        pls = await cur.to_list(100)
        return {"items": [await _playlist_public(p) for p in pls]}

    @r.get("/media/playlists/{playlist_id}")
    async def get_playlist(playlist_id: str, user: dict = Depends(get_current_user)):
        pl = await db.viearta_playlists.find_one({"id": playlist_id}, {"_id": 0})
        if not pl: raise HTTPException(404, "Playlist not found")
        return await _playlist_public(pl)

    @r.post("/media/playlists")
    async def create_playlist(payload: MediaPlaylistIn, user: dict = Depends(require_admin)):
        doc = {
            "id": _new_id(), "created_by": user["id"], "created_at": _now(),
            **payload.model_dump(),
        }
        await db.viearta_playlists.insert_one(doc)
        return await _playlist_public({k: v for k, v in doc.items() if k != "_id"})

    @r.put("/media/playlists/{playlist_id}")
    async def update_playlist(playlist_id: str, payload: MediaPlaylistIn, user: dict = Depends(require_admin)):
        res = await db.viearta_playlists.update_one(
            {"id": playlist_id},
            {"$set": {**payload.model_dump(), "updated_at": _now()}},
        )
        if not res.matched_count:
            raise HTTPException(404, "Playlist not found")
        pl = await db.viearta_playlists.find_one({"id": playlist_id}, {"_id": 0})
        return await _playlist_public(pl)

    @r.delete("/media/playlists/{playlist_id}")
    async def delete_playlist(playlist_id: str, user: dict = Depends(require_admin)):
        res = await db.viearta_playlists.delete_one({"id": playlist_id})
        if not res.deleted_count:
            raise HTTPException(404, "Playlist not found")
        return {"ok": True}

    @r.post("/media/playlists/{playlist_id}/add")
    async def playlist_add(playlist_id: str, payload: PlaylistMediaOp, user: dict = Depends(require_admin)):
        media = await db.viearta_media.find_one({"id": payload.media_id}, {"_id": 0})
        if not media: raise HTTPException(404, "Media not found")
        pl = await db.viearta_playlists.find_one({"id": playlist_id}, {"_id": 0})
        if not pl: raise HTTPException(404, "Playlist not found")
        ids = list(dict.fromkeys([*(pl.get("media_ids") or []), payload.media_id]))
        await db.viearta_playlists.update_one(
            {"id": playlist_id}, {"$set": {"media_ids": ids, "updated_at": _now()}})
        pl = await db.viearta_playlists.find_one({"id": playlist_id}, {"_id": 0})
        return await _playlist_public(pl)

    @r.post("/media/playlists/{playlist_id}/remove")
    async def playlist_remove(playlist_id: str, payload: PlaylistMediaOp, user: dict = Depends(require_admin)):
        pl = await db.viearta_playlists.find_one({"id": playlist_id}, {"_id": 0})
        if not pl: raise HTTPException(404, "Playlist not found")
        ids = [m for m in (pl.get("media_ids") or []) if m != payload.media_id]
        await db.viearta_playlists.update_one(
            {"id": playlist_id}, {"$set": {"media_ids": ids, "updated_at": _now()}})
        pl = await db.viearta_playlists.find_one({"id": playlist_id}, {"_id": 0})
        return await _playlist_public(pl)

    # ---------- ANCR PLATFORM STATUS (all handoffs in one place) ----------
    @r.get("/ancr/status")
    async def ancr_platform_status():
        """
        VIEARTA lives inside the ANCR ecosystem. These services are provided by
        ANCR, not built inside VIEARTA. This endpoint documents each handoff.
        """
        return {
            "sso": {
                "provider": "ANCR",
                "enabled": False,
                "description": "Single sign-on and ANCRID identity — activate the handshake at /api/auth/ancr/status.",
            },
            "notifications": {
                "provider": "ANCR notification system",
                "enabled": False,
                "description": "Circle reminders, chat alerts, lesson credit prompts and reflection nudges are delivered through ANCR's shared notification layer rather than a VIEARTA-only engine.",
                "vieata_hook": "VIEARTA emits event payloads (event_type, user_ancrid, resource_ref, message) that the ANCR layer consumes.",
            },
            "video_rooms": {
                "provider": "ANCRSYNC",
                "enabled": False,
                "description": "Circle meeting rooms, attendance, recording, transcripts and summaries are provided by ANCRSYNC. VIEARTA only stores an admin-provided join_url and renders a 'Join Circle' button.",
                "vieata_hook": "Admin sets join_url via PUT /api/circles/{id}/join-url",
            },
            "media_storage": {
                "provider": "Shared ANCR media-storage service",
                "enabled": False,
                "description": "Secure MP4/MP3 storage is shared across VIEARTA, CYNAIAH, ANCRLAB and other apps. VIEARTA accepts URLs today; when the shared service is live, admins can point media URLs at it.",
            },
        }

    return r


# ============================================================================
# SEED (idempotent)
# ============================================================================
async def seed_programs_demo(db, demo_user_id: str):
    # Circle instances (schedule 3 upcoming for the demo)
    now = datetime.now(timezone.utc)
    await db.viearta_circle_instances.delete_many({})
    instances = []
    schedule = [
        ("wc_vocalists", now + timedelta(days=2, hours=1), "VIEARTA Circle Room · Studio B"),
        ("wc_performers", now + timedelta(days=4, hours=2), "VIEARTA Circle Room · Main"),
        ("wc_recovery", now + timedelta(days=7, hours=3), "VIEARTA Circle Room · Studio A"),
        ("wc_boundaries", now + timedelta(days=10, hours=1), "VIEARTA Circle Room · Main"),
    ]
    for tpl_id, when, loc in schedule:
        tpl = next(t for t in CIRCLE_TEMPLATES if t["id"] == tpl_id)
        instances.append({
            "id": _new_id(), "template_id": tpl_id,
            "title": tpl["title"], "focus": tpl["focus"],
            "for_disciplines": tpl["for_disciplines"],
            "capacity": tpl["capacity"], "duration_minutes": tpl["duration_minutes"],
            "description": tpl["description"],
            "starts_at": when.isoformat(),
            "location": loc,
            "created_at": now.isoformat(),
        })
    if instances:
        await db.viearta_circle_instances.insert_many(instances)

    # RSVP Jaylen to the first two circles
    await db.viearta_circle_rsvps.delete_many({"user_id": demo_user_id})
    for ci in instances[:2]:
        await db.viearta_circle_rsvps.insert_one({
            "id": _new_id(), "user_id": demo_user_id,
            "circle_instance_id": ci["id"], "created_at": now.isoformat(),
        })

    # Seed a few habits for Jaylen (idempotent)
    existing_habits = await db.viearta_habits.count_documents({"user_id": demo_user_id})
    if existing_habits == 0:
        seeded_habits = [
            {"title": "Vocal warm-up", "cadence": "daily"},
            {"title": "Morning water", "cadence": "daily"},
            {"title": "One protected rest day", "cadence": "weekly"},
        ]
        habit_ids = []
        for h in seeded_habits:
            hid = _new_id()
            habit_ids.append(hid)
            await db.viearta_habits.insert_one({
                "id": hid, "user_id": demo_user_id, "title": h["title"],
                "cadence": h["cadence"], "created_at": now.isoformat(),
            })
        # Log first two habits for last 5 days
        for hid in habit_ids[:2]:
            for i in range(5):
                d = (now.date() - timedelta(days=i)).isoformat()
                await db.viearta_habit_logs.insert_one({
                    "id": _new_id(), "habit_id": hid, "user_id": demo_user_id,
                    "date": d, "at": (now - timedelta(days=i)).isoformat(),
                })

    # A journal entry
    if await db.viearta_journal.count_documents({"user_id": demo_user_id}) == 0:
        await db.viearta_journal.insert_one({
            "id": _new_id(), "user_id": demo_user_id,
            "body": "Rehearsal locked in today. Voice felt warm, band is listening. Sleep tonight is the whole game.",
            "mood": 4, "date": now.date().isoformat(), "created_at": now.isoformat(),
        })

    # A pre-seeded lesson progress: one lesson completed, one in-flight
    existing_prog = await db.viearta_lesson_progress.count_documents({"user_id": demo_user_id})
    if existing_prog == 0:
        # Completed: hydration
        await db.viearta_lesson_progress.insert_one({
            "id": _new_id(), "user_id": demo_user_id,
            "lesson_id": "ls_vocal_hydro",
            "status": "completed",
            "read_at": now.isoformat(),
            "tool_launched_at": now.isoformat(),
            "reflected_at": now.isoformat(),
            "reflection": "Sipping room-temp water before every take. My voice thanks me.",
            "credit_earned": True,
            "created_at": now.isoformat(), "updated_at": now.isoformat(),
        })
        # Tool-launched but not reflected
        await db.viearta_lesson_progress.insert_one({
            "id": _new_id(), "user_id": demo_user_id,
            "lesson_id": "ls_studio_pos",
            "status": "tool_launched",
            "read_at": now.isoformat(), "tool_launched_at": now.isoformat(),
            "reflection": None, "credit_earned": False,
            "created_at": now.isoformat(), "updated_at": now.isoformat(),
        })

    # Default consent (student privacy first)
    existing_consent = await db.viearta_consent.find_one({"user_id": demo_user_id})
    if not existing_consent:
        await db.viearta_consent.insert_one({
            "user_id": demo_user_id,
            "share_wellness_with_mentor": False,
            "share_reflections_with_mentor": False,
            "share_habits_with_mentor": False,
            "updated_at": now.isoformat(),
        })
