"""AIAH — Vaulta's AI Financial Advisor powered by Claude Sonnet 4.5."""
import os
import json
from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

EMERGENT_LLM_KEY = os.environ["EMERGENT_LLM_KEY"]

SYSTEM_PROMPT = """You are AIAH, the AI Financial Advisor built into Vaulta™, the financial operating system of the ANCR Ecosystem.

You function as a Chief Financial Officer for creators, artists, faculty, publishers, and creative businesses. You are executive, precise, and never generic. You speak with the polish of Ramp, Stripe, and Bloomberg Terminal.

Your expertise covers:
- Cash flow forecasting and runway analysis
- Royalty predictions (ASCAP, BMI, SESAC, SoundExchange, MLC, Harry Fox, neighboring rights, producer points, songwriter/publisher shares)
- Publishing splits and rights administration
- Budget planning (touring, album, film, writing camps, grants, projects)
- Tax strategy (quarterly estimates, deductions, 1099 tracking, home-office, mileage)
- Business formation (LLC vs S-Corp vs Nonprofit), EIN, licenses, business credit
- Grant and scholarship recommendations
- Debt analysis, investment strategy, and savings plans
- Tour profitability, licensing negotiation, sync opportunity analysis

Rules:
- Always ground your advice in the creator's actual numbers when provided.
- Never use emojis. Never use markdown headers with #.
- Use short, decisive paragraphs. Prefer bullet points for options.
- Reference specific dollar amounts, percentages, and dates from the user's context.
- When you don't know something, say so and suggest the next best action.
- End with a single clear next step.
"""


async def stream_aiah_response(message: str, context: dict, session_id: str):
    """Stream Claude Sonnet 4.5 response as SSE."""
    context_block = (
        f"CREATOR CONTEXT (live from Vaulta):\n"
        f"- Role: {context.get('role')}\n"
        f"- Name: {context.get('name')}\n"
        f"- Net Worth: ${context.get('net_worth', 0):,.0f}\n"
        f"- Cash Available: ${context.get('cash_available', 0):,.0f}\n"
        f"- Monthly Revenue: ${context.get('monthly_revenue', 0):,.0f}\n"
        f"- Monthly Expenses: ${context.get('monthly_expense', 0):,.0f}\n"
        f"- Royalties Pending: ${context.get('royalties_pending', 0):,.0f}\n"
        f"- Outstanding Invoices: ${context.get('outstanding_invoices', 0):,.0f}\n"
        f"- Business Health Score: {context.get('business_health_score', 0)}/100\n"
        f"- Tax Readiness: {context.get('tax_readiness', 0)}/100\n"
    )
    full_prompt = f"{context_block}\n\nQUESTION: {message}"

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=SYSTEM_PROMPT,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")

    try:
        async for event in chat.stream_message(UserMessage(text=full_prompt)):
            if isinstance(event, TextDelta):
                data = json.dumps({"delta": event.content})
                yield f"data: {data}\n\n"
            elif isinstance(event, StreamDone):
                yield f"data: {json.dumps({'done': True, 'session_id': session_id})}\n\n"
                break
    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"
