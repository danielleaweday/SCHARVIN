"""AIAH — AI Leadership Intelligence layer for COHEIR™.
Wraps Claude Sonnet 4.5 via emergentintegrations. Falls back to a deterministic
mock output if the LLM call fails, so the demo never breaks.
"""
from __future__ import annotations
import os
import uuid
import logging
from typing import Optional
from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel

from auth import current_user
from models import UserPublic, AIInsight

log = logging.getLogger("aiah")

router = APIRouter(prefix="/aiah", tags=["aiah"])

SYSTEM_PROMPT = """You are AIAH — the AI Leadership Intelligence assistant embedded in COHEIR™, the Industry Leadership Network of the ANCR ecosystem (CCDP).

You assist faculty and verified industry professionals (producers, engineers, songwriters, creative directors, entertainment attorneys, publishers, managers, employers). You never replace professional judgement.

Your voice: precise, cinematic, executive, warm but exacting. Reference the ANCR ecosystem naturally (ANCRID™, ANCRLAB™, ANCRSync™, INHEIRA™, Vaulta™, ANCRLaunch™). Avoid clichés and generic advice.

Always structure output as concise markdown with headings and short bullet lists. Include at the end a short "Suggested Action Items" section with 3–5 bullets. Never fabricate specific student data — reason only from what the user includes in the prompt."""


class AIRequest(BaseModel):
    kind: str  # portfolio_gap | meeting_summary | mentor_match | career_readiness | action_items | growth_trend | freeform
    prompt: str
    subject_ids: list[str] = []
    context: str = "dashboard"


async def _call_claude(prompt: str) -> str:
    """Invoke Claude Sonnet 4.5 via emergentintegrations. Robust to failures."""
    key = os.environ.get("EMERGENT_LLM_KEY")
    if not key:
        return _fallback(prompt)
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        session_id = f"aiah-{uuid.uuid4().hex[:10]}"
        chat = LlmChat(
            api_key=key,
            session_id=session_id,
            system_message=SYSTEM_PROMPT,
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        msg = UserMessage(text=prompt)
        resp = await chat.send_message(msg)
        return str(resp)
    except Exception as e:  # pragma: no cover
        log.exception("Claude call failed: %s", e)
        return _fallback(prompt)


def _fallback(prompt: str) -> str:
    """Deterministic offline output so the demo remains usable when the LLM key is unavailable."""
    return (
        "## AIAH Insight\n"
        "AIAH is currently generating a deterministic response because the live model is offline. "
        "The full Claude Sonnet 4.5 pipeline is wired and will resume automatically.\n\n"
        "**Signals detected**\n"
        "- Portfolio velocity trending up over the last 30 days on ANCRLAB™.\n"
        "- Peer collaboration density on ANCRSync™ within top quartile of the cohort.\n"
        "- Publishing readiness elevated per INHEIRA™ metadata coverage.\n\n"
        "**Suggested Action Items**\n"
        "- Schedule a portfolio review this week.\n"
        "- Assign a mixing engineer mentor for the current EP arc.\n"
        "- Nominate for the next Writing Camp cohort.\n"
        "- Recommend a residency opportunity via ANCRLaunch™.\n"
        "- Log a Professional Review to update ANCRID™.\n"
    )


@router.post("/generate")
async def generate(body: AIRequest, request: Request, user: UserPublic = Depends(current_user)):
    db = request.app.state.db
    output = await _call_claude(body.prompt)
    insight = AIInsight(
        user_id=user.user_id,
        context=body.context,
        kind=body.kind,
        prompt=body.prompt,
        output=output,
        subject_ids=body.subject_ids,
    )
    doc = insight.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.ai_insights.insert_one(doc.copy())
    doc.pop("_id", None)
    return {"insight": doc, "output": output}


@router.get("/recent")
async def recent(request: Request, user: UserPublic = Depends(current_user)):
    db = request.app.state.db
    cursor = db.ai_insights.find(
        {"user_id": user.user_id}, {"_id": 0}
    ).sort("created_at", -1).limit(10)
    return await cursor.to_list(10)
