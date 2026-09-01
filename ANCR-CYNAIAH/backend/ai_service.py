"""AI providers - modular so keys/providers can be swapped later.

Uses emergentintegrations with EMERGENT_LLM_KEY today.
- Text: Anthropic claude-sonnet-4-5-20250929
- Image: Gemini nano-banana (gemini-3.1-flash-image-preview) with native
  character-reference support (NOT LoRA — this uses the provider's own
  multimodal image-conditioning capability).
"""
from __future__ import annotations

import base64
import json
import os
import re
import uuid
from pathlib import Path
from typing import List, Optional

import httpx
from emergentintegrations.llm.chat import (
    ImageContent,
    LlmChat,
    UserMessage,
)


AI_TEXT_PROVIDER = "anthropic"
AI_TEXT_MODEL = "claude-sonnet-4-5-20250929"
AI_IMAGE_PROVIDER = "gemini"
AI_IMAGE_MODEL = "gemini-3.1-flash-image-preview"

GENERATED_DIR = Path(__file__).parent / "generated_images"
GENERATED_DIR.mkdir(parents=True, exist_ok=True)


def _api_key() -> str:
    key = os.environ.get("EMERGENT_LLM_KEY")
    if not key:
        raise RuntimeError("EMERGENT_LLM_KEY not configured")
    return key


SCRIPT_SYSTEM = (
    "You are CYNAIAH's cinematic writing partner - a senior film-school mentor "
    "trained in screenwriting, treatments, music-video direction, and commercial "
    "storyboarding. You write with restraint, imagery, and craft. You NEVER pretend "
    "to be human, and you always disclose AI assistance when asked. Output plain "
    "text in industry format (no markdown code fences)."
)


def _kind_instructions(kind: str) -> str:
    return {
        "screenplay": (
            "Write a short screenplay scene in standard industry format: "
            "SLUGLINE, ACTION, CHARACTER, DIALOGUE. Keep it under 2 pages."
        ),
        "treatment": (
            "Write a cinematic treatment of 250-400 words. Vivid imagery. "
            "Include: opening image, protagonist, world, tension, key visual "
            "motifs, sonic palette, and emotional arc."
        ),
        "logline": (
            "Write ONE strong logline (max 40 words) then 3 alternative angles."
        ),
        "shotlist": (
            "Write a shot list of 8-12 shots. Format each as: "
            "#N | SHOT SIZE | CAMERA MOVEMENT | SUBJECT | ACTION | NOTE."
        ),
        "storyboard_beats": (
            "Write 6 storyboard beats. Format each as: BEAT N - <one-line visual>."
        ),
    }.get(kind, "Write a short cinematic treatment (250 words).")


async def generate_script(
    prompt: str, kind: str = "screenplay", tone: Optional[str] = "cinematic"
) -> str:
    """Generate script/treatment/logline text via Claude Sonnet 4.5."""
    session_id = f"cynaiah-script-{uuid.uuid4()}"
    chat = LlmChat(
        api_key=_api_key(),
        session_id=session_id,
        system_message=SCRIPT_SYSTEM,
    ).with_model(AI_TEXT_PROVIDER, AI_TEXT_MODEL)

    user_prompt = (
        f"{_kind_instructions(kind)}\n\n"
        f"Tone / style: {tone or 'cinematic'}.\n"
        f"Creative brief from the student:\n{prompt}\n\n"
        f"Return only the requested document. No preamble."
    )
    result = await chat.send_message(UserMessage(text=user_prompt))
    return result if isinstance(result, str) else str(result)


# ---------- reference-image download helper ----------
async def _url_to_image_content(url: str) -> Optional[ImageContent]:
    """Download an image URL and return an ImageContent for character reference.

    If the URL is a locally-served generated image (/api/generated/...), read
    from disk directly. External URLs are fetched with httpx.
    """
    try:
        if url.startswith("/api/generated/"):
            filename = url.rsplit("/", 1)[-1]
            path = GENERATED_DIR / filename
            if not path.exists():
                return None
            data = path.read_bytes()
        else:
            async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
                resp = await client.get(url)
                if resp.status_code != 200:
                    return None
                data = resp.content
        b64 = base64.b64encode(data).decode("utf-8")
        return ImageContent(image_base64=b64)
    except Exception:
        return None


def _character_identity_block(character: dict) -> str:
    """Compact identity descriptor injected alongside reference images."""
    fields = [
        ("Name", character.get("name")),
        ("Role", character.get("role_in_story")),
        ("Age", character.get("age")),
        ("Gender presentation", character.get("gender")),
        ("Hair", character.get("hair")),
        ("Skin tone", character.get("skin_tone")),
        ("Eye color", character.get("eye_color")),
        ("Wardrobe", character.get("wardrobe")),
        ("Visual style", character.get("visual_style")),
        ("Locked details", character.get("locked_details")),
    ]
    lines = [f"- {label}: {value}" for label, value in fields if value]
    desc = character.get("description")
    if desc:
        lines.append(f"- Description: {desc}")
    return "\n".join(lines) if lines else ""


async def generate_image(
    prompt: str,
    style: str = "cinematic film still",
    characters: Optional[List[dict]] = None,
) -> dict:
    """Generate image via Gemini Nano Banana with optional character references.

    When ``characters`` is provided, each character's reference images are
    downloaded and attached to the request via ImageContent so the provider
    can natively keep identity consistent. This is Gemini's supported
    character-conditioning mechanism, not a LoRA.
    """
    session_id = f"cynaiah-image-{uuid.uuid4()}"
    system_message = (
        "You are CYNAIAH's visual director. Generate cinematic, on-brief "
        "production stills, character concepts, environments, and storyboard "
        "frames. Emphasize depth, light, and story."
    )

    reference_images: list[ImageContent] = []
    identity_prompts: list[str] = []
    if characters:
        for ch in characters:
            block = _character_identity_block(ch)
            if block:
                identity_prompts.append(
                    f"CHARACTER — {ch.get('name','Unnamed')}\n{block}"
                )
            for url in (ch.get("reference_image_urls") or [])[:3]:  # cap to 3 refs per character
                img = await _url_to_image_content(url)
                if img is not None:
                    reference_images.append(img)

    styled_prompt_parts = [f"{prompt}."]
    if identity_prompts:
        styled_prompt_parts.append(
            "\nMAINTAIN CHARACTER IDENTITY across every generation using the "
            "attached reference image(s). Match facial features, hair, skin "
            "tone, wardrobe, and body proportions exactly. Do not restyle or "
            "de-age the person.\n"
            + "\n\n".join(identity_prompts)
        )
    styled_prompt_parts.append(
        f"\nStyle: {style}. Rich cinematic lighting, film-still quality, "
        "anamorphic depth, 16:9 composition."
    )
    styled_prompt = "\n".join(styled_prompt_parts)

    chat = (
        LlmChat(
            api_key=_api_key(),
            session_id=session_id,
            system_message=system_message,
        )
        .with_model(AI_IMAGE_PROVIDER, AI_IMAGE_MODEL)
        .with_params(modalities=["image", "text"])
    )

    text, images = await chat.send_message_multimodal_response(
        UserMessage(text=styled_prompt, file_contents=reference_images or None)
    )

    if not images:
        raise RuntimeError(
            f"No image returned from provider. Text response: "
            f"{text[:200] if text else 'empty'}"
        )

    img = images[0]
    filename = f"cynaiah_{uuid.uuid4().hex}.png"
    path = GENERATED_DIR / filename
    image_bytes = base64.b64decode(img["data"])
    with open(path, "wb") as f:
        f.write(image_bytes)

    return {
        "filename": filename,
        "url": f"/api/generated/{filename}",
        "mime_type": img.get("mime_type", "image/png"),
        "prompt": prompt,
        "provider": f"{AI_IMAGE_PROVIDER}:{AI_IMAGE_MODEL}",
        "character_reference_count": len(reference_images),
    }


# ---------- Sync Autopilot ----------
SYNC_AUTOPILOT_SYSTEM = (
    "You are a music-video director's assistant. Given a track's metadata and a "
    "project's visual style, propose musical section boundaries and sync cue "
    "placements. Return STRICT JSON. Never invent lyrics you weren't told about."
)


async def suggest_sync_cues(
    title: str,
    artist: str,
    duration_seconds: float,
    ownership: str,
    visual_style: Optional[str] = None,
    story_concept: Optional[str] = None,
) -> list[dict]:
    """Ask Claude to suggest 8-14 sync cues covering intro / verses / chorus /
    bridge / outro. Returns a list of dicts: [{timestamp, label, type, reason}].
    """
    session_id = f"cynaiah-autopilot-{uuid.uuid4()}"
    chat = LlmChat(
        api_key=_api_key(),
        session_id=session_id,
        system_message=SYNC_AUTOPILOT_SYSTEM,
    ).with_model(AI_TEXT_PROVIDER, AI_TEXT_MODEL)

    prompt = (
        f"Track: '{title}' by '{artist}'.\n"
        f"Ownership: {ownership}. Duration: {duration_seconds:.1f}s.\n"
        f"Visual style: {visual_style or '(not specified)'}\n"
        f"Story concept: {story_concept or '(not specified)'}\n\n"
        "Suggest 8-14 SYNC CUE MARKERS that a director would drop in a "
        "music-video edit. Cover the typical arc — intro, verse 1, pre-chorus, "
        "chorus, verse 2, bridge, chorus, outro. Each cue must be inside the "
        "track's duration.\n\n"
        "Return ONLY a JSON array — no prose, no markdown fences. Each element:\n"
        '{"timestamp": <seconds as float>, "label": "<short human label>", '
        '"type": "beat|cut|lyric|emotion|transition|scene", '
        '"reason": "<why this moment matters, 1 sentence>"}'
    )

    result = await chat.send_message(UserMessage(text=prompt))
    text = result if isinstance(result, str) else str(result)

    # Strip markdown fences if present
    text = re.sub(r"^```(?:json)?\s*", "", text.strip(), flags=re.IGNORECASE)
    text = re.sub(r"\s*```$", "", text.strip())

    try:
        parsed = json.loads(text)
    except Exception as exc:
        # try to find the JSON array with a regex fallback
        m = re.search(r"\[[\s\S]*\]", text)
        if not m:
            raise RuntimeError(f"Autopilot returned non-JSON: {text[:200]}") from exc
        parsed = json.loads(m.group(0))

    valid_types = {"beat", "cut", "lyric", "emotion", "transition", "scene"}
    cleaned: list[dict] = []
    for item in parsed:
        try:
            ts = float(item.get("timestamp"))
            if ts < 0 or ts > duration_seconds:
                continue
            t = str(item.get("type", "beat")).lower()
            if t not in valid_types:
                t = "beat"
            cleaned.append(
                {
                    "timestamp": round(ts, 2),
                    "label": str(item.get("label") or "").strip()[:120],
                    "type": t,
                    "reason": str(item.get("reason") or "").strip()[:200],
                }
            )
        except Exception:
            continue
    cleaned.sort(key=lambda x: x["timestamp"])
    return cleaned
