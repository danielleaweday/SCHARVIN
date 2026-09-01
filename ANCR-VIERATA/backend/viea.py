"""Viea — VIEARTA AI wellness assistant. Uses Claude Sonnet 5 via Emergent LLM key."""
from __future__ import annotations
import os
import re
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from emergentintegrations.llm.chat import LlmChat, UserMessage

VIEA_SYSTEM_PROMPT = """You are Viea, VIEARTA's supportive AI wellness assistant for CCDP creators (vocalists, musicians, producers, dancers, actors, filmmakers, content creators).

RULES YOU MUST ALWAYS FOLLOW:
- You are EDUCATIONAL, never medical, therapeutic, nutrition-clinical, or emergency care. State this whenever the user asks for diagnosis, treatment, prescriptions, calorie targets to lose/gain weight, or exercise programming for injuries or conditions.
- Never diagnose conditions or promise health outcomes.
- Never provide specific calorie or macro targets for weight loss/gain, restrictive eating advice, extreme exercise programming, or drug/supplement dosing. Suggest a registered dietitian, physician, or licensed therapist.
- Never shame, rank, or compare users. No "you should have" or "failed".
- If a user describes severe pain, injury, breathing difficulty, chest pain, suicidal thoughts, self-harm, eating disorder behaviors, pregnancy questions, substance emergencies, or any crisis — GENTLY PAUSE, acknowledge them, and direct them to emergency services (988 US Suicide & Crisis Lifeline; 911 or local emergency for danger) AND the VIEARTA Support page.
- Ground answers in the user's context: creative discipline, energy, sleep, hydration, upcoming performances.
- Keep replies warm, concise, and practical. Prefer one small, kind next step.
- When suggesting tools, name the VIEARTA page: Daily Check-In, Lifestyle → Nutrition/Mindfulness/Movement, Learning, Performance, Recovery, Wellness Circle, My Progress.
- Never invent VIEARTA features that don't exist. Never claim to book appointments or contact anyone.
- Never share, reference, or invent other users' data. Only speak to the current student.
- Use inclusive, adult, non-competitive language.

TAGLINE: Live Well · Perform Well · Create Forever."""

CRISIS_RE = re.compile(
    r"\b(suicid|kill myself|kill me|end my life|end it all|self[- ]?harm|hurt(?:ing)? myself|"
    r"harm(?:ing)? myself|can'?t breathe|chest pain|overdose|od'?ing|emergenc(y|ies)|anaphylax|"
    r"stroke|heart attack|purging|starv(?:e|ing)|not eaten (?:in )?days)\b",
    re.IGNORECASE,
)

CRISIS_FOOTER = (
    "\n\n— If you're in immediate danger, please call or text **988** (US Suicide & Crisis Lifeline) "
    "or dial **911** (or your local emergency number). You can also open the VIEARTA **Support** page for "
    "professional resources. I'm here to sit with you, but a human professional can meet you where you are right now."
)

MEDICAL_ADVICE_RE = re.compile(
    r"\b(diagnos|prescription|prescribe|treat(?:ment)? for|is this (?:an?|the) (?:disorder|disease|condition)|"
    r"how many calories to lose|lose \d+ ?(?:lbs|kg|pounds)|extreme diet|starvation diet)\b",
    re.IGNORECASE,
)

MEDICAL_FOOTER = (
    "\n\n— That's a question for a qualified professional. In VIEARTA, open **Support** for a curated list "
    "of physicians, therapists, dietitians, and vocal specialists. I can support the day around it, but the "
    "answer itself should come from someone credentialed to give it."
)


class VieaMessageIn(BaseModel):
    text: str = Field(min_length=1, max_length=4000)


def _new_id() -> str: return str(uuid.uuid4())
def _now() -> str: return datetime.now(timezone.utc).isoformat()


def build_viea_router(db, get_current_user):
    r = APIRouter(prefix="/api/viea")

    @r.get("/history")
    async def history(user: dict = Depends(get_current_user)):
        cur = db.viearta_viea_messages.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", 1).limit(100)
        return {"items": await cur.to_list(100)}

    @r.delete("/history")
    async def clear_history(user: dict = Depends(get_current_user)):
        await db.viearta_viea_messages.delete_many({"user_id": user["id"]})
        return {"ok": True}

    @r.post("/message")
    async def send(payload: VieaMessageIn, user: dict = Depends(get_current_user)):
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            raise HTTPException(500, "Viea is temporarily unavailable — LLM key missing")

        # Persist user turn
        session_id = f"viea-{user['id']}"
        await db.viearta_viea_messages.insert_one({
            "id": _new_id(), "user_id": user["id"],
            "role": "user", "text": payload.text,
            "created_at": _now(),
        })

        personalized = (
            VIEA_SYSTEM_PROMPT
            + f"\n\nCurrent student: {user['first_name']} · {user.get('discipline', 'Creator')} · ANCRID {user.get('ancrid', 'unknown')}."
        )

        chat = LlmChat(api_key=api_key, session_id=session_id, system_message=personalized).with_model("anthropic", "claude-sonnet-5")

        try:
            reply = await chat.send_message(UserMessage(text=payload.text))
        except Exception as e:
            raise HTTPException(502, f"Viea couldn't respond just now: {e}")

        text = reply if isinstance(reply, str) else str(reply)

        # Server-side safety: append professional-referral footer for crisis / medical-advice inputs,
        # regardless of what the model produced. Belt-and-suspenders over the system prompt.
        is_crisis = bool(CRISIS_RE.search(payload.text))
        is_medical = bool(MEDICAL_ADVICE_RE.search(payload.text))
        if is_crisis and CRISIS_FOOTER.strip() not in text:
            text = text.rstrip() + CRISIS_FOOTER
        elif is_medical and MEDICAL_FOOTER.strip() not in text:
            text = text.rstrip() + MEDICAL_FOOTER

        doc = {
            "id": _new_id(), "user_id": user["id"],
            "role": "assistant", "text": text,
            "created_at": _now(),
            "flags": {"crisis": is_crisis, "medical": is_medical},
        }
        await db.viearta_viea_messages.insert_one(doc)
        doc.pop("_id", None)
        return doc

    return r
