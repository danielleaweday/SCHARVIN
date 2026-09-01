"""Cyna — the CYNAIAH in-app AI mentor.

- Warm, mature female mentor voice.
- Advisory only — proposes edits, never applies them without student approval.
- Project-aware: injects a compact digest of the current project when one is
  selected so answers cite the student's actual work.
- Persisted sessions + messages per user (append-only history — same immutable
  posture as the faculty review log).
- Small action-executor: draft_script, add_finishing_note, add_shot. Each
  proposal is a `proposed_actions` array the frontend renders as `Approve`
  buttons — nothing runs until the student confirms.
"""
from __future__ import annotations

import json
import logging
import re
from datetime import datetime, timezone
from typing import Optional

from emergentintegrations.llm.chat import LlmChat, UserMessage

import ai_service

log = logging.getLogger("cynaiah.cyna")

SYSTEM_PROMPT = (
    "You are Cyna, the in-app mentor for the CYNAIAH School of Film, Visual "
    "Storytelling & Emerging Media. Speak with a warm, mature female voice — "
    "the way a trusted senior director speaks to a first-year student they "
    "believe in.\n\n"
    "Core principles (never break these):\n"
    "1. ADVISORY ONLY. You never rewrite, delete, or change the student's work "
    "   directly. You propose — the student approves.\n"
    "2. CITE SOURCES. When you read the student's project data, say what you "
    "   looked at ('from your Neon Heart treatment…', 'I noticed Scene 2 has "
    "   only one shot…'). Never invent facts about their project.\n"
    "3. HUMBLE COACH TONE. Ask questions. Offer options. Never lecture.\n"
    "4. RESPECT THE FACULTY. If the student is asking for something a faculty "
    "   member has commented on, surface the faculty note first before your own.\n"
    "5. NO POLITICS, NO PII HARVESTING, NO NSFW.\n\n"
    "PROPOSED ACTIONS\n"
    "When (and only when) the student explicitly asks you to draft or add "
    "something on their behalf, end your response with a JSON block wrapped in "
    "```json … ``` fences with the shape:\n"
    "  {\"proposed_actions\": [\n"
    "    {\"kind\": \"draft_script\", \"title\": \"...\", \"content\": \"...\", \"script_kind\": \"treatment|logline|screenplay|shotlist\"},\n"
    "    {\"kind\": \"add_finishing_note\", \"category\": \"color|sound|vfx|general\", \"body\": \"...\"},\n"
    "    {\"kind\": \"add_shot\", \"scene_id\": \"...\", \"description\": \"...\", \"shot_size\": \"WS|MS|CU|ECU\", \"camera_move\": \"static|pan|dolly|handheld\"}\n"
    "  ]}\n"
    "Only include a `proposed_actions` block when the student asked you to draft/add. "
    "Never in casual Q&A. Never fabricate the JSON if there is no action to propose."
)


async def build_project_digest(db, project_id: str, user_id: str) -> Optional[str]:
    """Compact snapshot of the current project so answers can cite real work."""
    project = await db.projects.find_one({"id": project_id, "owner_id": user_id}, {"_id": 0})
    if not project:
        return None
    treatments = await db.script_documents.find(
        {"project_id": project_id, "kind": {"$in": ["treatment", "logline"]}},
        {"_id": 0, "kind": 1, "title": 1, "content": 1},
    ).to_list(3)
    characters = await db.characters.find(
        {"project_id": project_id}, {"_id": 0, "name": 1, "age": 1}
    ).to_list(20)
    scenes = await db.prod_scenes.find({"project_id": project_id}, {"_id": 0, "id": 1, "number": 1, "title": 1}).to_list(50)
    shot_count = await db.prod_shots.count_documents({"project_id": project_id})
    rights = await db.rights_records.count_documents({"project_id": project_id})

    lines = [f"PROJECT: {project.get('title')} ({(project.get('type') or '').replace('_',' ')})"]
    if project.get("visual_style"):
        lines.append(f"Visual style: {project.get('visual_style')}")
    if project.get("story_concept"):
        lines.append(f"Concept: {project.get('story_concept')[:400]}")
    for t in treatments:
        lines.append(f"[{t.get('kind','doc')}] {t.get('title','')}: {(t.get('content') or '')[:500]}")
    if characters:
        lines.append(
            "Characters: "
            + ", ".join(f"{c['name']}" + (f" ({c['age']})" if c.get("age") else "") for c in characters)
        )
    if scenes:
        lines.append(
            f"Scenes ({len(scenes)}): "
            + "; ".join(f"SC{s.get('number','?')} id={s.get('id')} — {s.get('title','')}" for s in scenes)
        )
    lines.append(f"Shots on record: {shot_count}. Rights records: {rights}.")
    return "\n".join(lines)


ACTION_KINDS = {"draft_script", "add_finishing_note", "add_shot"}


def parse_proposed_actions(text: str) -> tuple[str, list[dict]]:
    """Split assistant text into (message_without_json, proposed_actions).

    Never raises — a malformed JSON block just yields no actions and the
    original text is returned untouched.
    """
    if not text:
        return "", []
    match = re.search(r"```json\s*(\{[\s\S]*?\})\s*```", text, flags=re.IGNORECASE)
    if not match:
        return text.strip(), []
    try:
        parsed = json.loads(match.group(1))
    except Exception:
        return text.strip(), []
    actions = parsed.get("proposed_actions") or []
    if not isinstance(actions, list):
        return text.strip(), []
    cleaned = [a for a in actions if isinstance(a, dict) and a.get("kind") in ACTION_KINDS]
    body = (text[: match.start()] + text[match.end():]).strip()
    return body or text.strip(), cleaned


async def chat_turn(
    history: list[dict],
    student_message: str,
    project_digest: Optional[str] = None,
) -> tuple[str, list[dict]]:
    """Send the running history + new user message to Claude and return
    (visible_text, proposed_actions).
    """
    session_id = f"cyna-{datetime.now(timezone.utc).timestamp()}"
    chat = LlmChat(
        api_key=ai_service._api_key(),
        session_id=session_id,
        system_message=SYSTEM_PROMPT,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")

    context_intro = None
    if project_digest:
        context_intro = f"CURRENT PROJECT CONTEXT (read-only):\n{project_digest}"

    # Emergent LlmChat is a single-shot request; encode the prior history + intro
    # into a compact user message so Claude has the conversation context.
    convo = []
    if context_intro:
        convo.append(context_intro)
    for m in history[-12:]:
        role = "Student" if m.get("role") == "user" else "Cyna"
        convo.append(f"{role}: {m.get('content','').strip()}")
    convo.append(f"Student: {student_message.strip()}")
    convo.append("Cyna:")
    prompt = "\n\n".join(convo)

    raw = await chat.send_message(UserMessage(text=prompt))
    text = raw if isinstance(raw, str) else str(raw)
    return parse_proposed_actions(text)
