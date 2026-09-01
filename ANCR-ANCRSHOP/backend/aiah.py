import os
import json
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from db import db, serialize_list
from auth import get_optional_user

router = APIRouter(prefix="/api/aiah", tags=["aiah"])

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")

SYSTEM = """You are AIAH, the AI shopping concierge for ANCRSHOP™, the premium Creator Commerce Platform inside the ANCR ecosystem.
You help creators, students, and artists find and bundle exactly what they need to learn, create, launch, and grow.
You are warm, concise, editorial, and expert — like a personal shopper at a luxury flagship store.

Behaviour:
- Understand the shopper's goal (e.g. "start a podcast under $1000", "first-semester film student", "$2000 home studio").
- Recommend real products ONLY from the provided catalog, using their exact "slug".
- Build complete, budget-aware bundles when asked. Explain the "why" briefly.
- If nothing fits, say so honestly and suggest the closest category.

You MUST respond with a single valid JSON object, no markdown, of the form:
{"reply": "<friendly 2-4 sentence response>", "recommendations": ["slug1","slug2",...], "bundle_note": "<optional short note about the bundle total or strategy or empty string>"}
Only include slugs that exist in the catalog. Recommend between 0 and 8 products."""


async def _catalog_context(limit=140):
    prods = await db.products.find({"active": True}, {
        "slug": 1, "name": 1, "brand": 1, "price": 1, "department_name": 1, "category": 1
    }).to_list(limit)
    lines = [f'{p["slug"]} | {p["name"]} | {p["brand"]} | ${p["price"]:.2f} | {p.get("department_name","")} | {p.get("category","")}'
             for p in prods]
    return "\n".join(lines)


class ChatReq(BaseModel):
    message: str
    session_id: Optional[str] = None
    history: Optional[List[dict]] = None


@router.post("/chat")
async def chat(body: ChatReq, user=Depends(get_optional_user)):
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    session_id = body.session_id or str(uuid.uuid4())
    catalog = await _catalog_context()
    hist = ""
    if body.history:
        for m in body.history[-6:]:
            hist += f'{m.get("role","user").upper()}: {m.get("content","")}\n'
    sys = f"{SYSTEM}\n\nCATALOG (slug | name | brand | price | department | category):\n{catalog}"
    if hist:
        sys += f"\n\nRECENT CONVERSATION:\n{hist}"

    reply_text, slugs, note = "I'm here to help you find the perfect gear.", [], ""
    try:
        chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=session_id, system_message=sys).with_model("openai", "gpt-5.4")
        raw = await chat.send_message(UserMessage(text=body.message))
        raw = raw.strip()
        if raw.startswith("```"):
            raw = raw.strip("`")
            if raw.startswith("json"):
                raw = raw[4:]
        data = json.loads(raw)
        reply_text = data.get("reply", reply_text)
        slugs = data.get("recommendations", []) or []
        note = data.get("bundle_note", "") or ""
    except Exception as e:
        reply_text = "I had trouble reaching my recommendation engine just now. Tell me your goal and budget and I'll try again."
        slugs = []

    products = []
    if slugs:
        prods = await db.products.find({"slug": {"$in": slugs}, "active": True}).to_list(20)
        by_slug = {p["slug"]: p for p in prods}
        ordered = [by_slug[s] for s in slugs if s in by_slug]
        products = serialize_list(ordered)

    await db.aiah_messages.insert_one({
        "session_id": session_id, "user_id": (user or {}).get("id"),
        "message": body.message, "reply": reply_text, "slugs": slugs,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"session_id": session_id, "reply": reply_text, "bundle_note": note, "products": products}
