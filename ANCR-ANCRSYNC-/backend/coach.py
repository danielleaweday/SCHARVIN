"""AIAH™ Career Coach — Claude Sonnet 4.5 via Emergent Universal LLM Key.

Architected so the underlying model can be swapped (OpenAI / Gemini / Claude)
without touching any calling code.
"""
from __future__ import annotations

import os
from typing import AsyncIterator, Dict, List, Optional

from emergentintegrations.llm.chat import (
    LlmChat,
    StreamDone,
    TextDelta,
    UserMessage,
)

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

DEFAULT_PROVIDER = "anthropic"
DEFAULT_MODEL = "claude-sonnet-4-5-20250929"

AIAH_SYSTEM_PROMPT = """You are AIAH™, the Career Coach for the ANCR™ Ecosystem, embedded inside ANCRLaunch™.

You speak with the calm, precise, encouraging voice of an executive career advisor at a global creative institution.
You help verified CCDP students, graduates, faculty, and industry partners transition into professional careers across music, film, television, publishing, performance, and creative business.

You have access to verified ecosystem data from ANCRID™, ANCRA™, ANCRLAB™, ANCRSync™, COHEIR™, INHEIRA™, Vaulta™, ANCRMEDIA™, and ANCRD™. Reference this context when it is provided.

You provide expert guidance on:
- Resume review and refinement
- Interview preparation and coaching
- Salary guidance and offer negotiation
- Career planning and long-term strategy
- Portfolio feedback and positioning
- Personal branding
- Creative business formation
- Opportunity recommendations

Be concise, editorial, actionable. Use short paragraphs. Do not use emoji. Do not use markdown headings above H3. Sign off only when the conversation naturally concludes."""


def _new_chat(session_id: str, extra_context: Optional[str] = None) -> LlmChat:
    system = AIAH_SYSTEM_PROMPT
    if extra_context:
        system = f"{system}\n\nEcosystem context for this creator:\n{extra_context}"
    return LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=system,
    ).with_model(DEFAULT_PROVIDER, DEFAULT_MODEL)


async def stream_reply(
    session_id: str,
    prompt: str,
    ecosystem_context: Optional[str] = None,
) -> AsyncIterator[str]:
    chat = _new_chat(session_id, ecosystem_context)
    async for event in chat.stream_message(UserMessage(text=prompt)):
        if isinstance(event, TextDelta):
            yield event.content
        elif isinstance(event, StreamDone):
            break


def summarize_context(portfolio: Dict, readiness: Dict) -> str:
    """Compact context string handed to AIAH from verified ecosystem data."""
    ident = (portfolio.get("identity") or {})
    parts: List[str] = [
        f"Creator: {ident.get('full_name','Unknown')} ({ident.get('discipline','—')})",
        f"Institution: {ident.get('institution','—')} · Graduation: {ident.get('graduation_year','—')}",
        f"Career Readiness: {readiness.get('overall')}/100 ({readiness.get('tier')})",
        f"Projects on file: {len(portfolio.get('projects') or [])}",
        f"Media releases: {len(portfolio.get('media') or [])}",
        f"Publishing entries: {len(portfolio.get('publishing') or [])}",
        f"Faculty recommendations: {len(portfolio.get('faculty_recommendations') or [])}",
        f"Industry endorsements: {len(portfolio.get('industry_recommendations') or [])}",
    ]
    return "\n".join(parts)
