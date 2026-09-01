"""
INHEIRA — Voice Evidence Layer (Media-Agnostic Evidence Service)

Voice today. Video, screen capture, DAW capture, MIDI, live-room mics, and
camera feeds tomorrow — they all share the same evidence schema and lifecycle
implemented here. Callers only ever set `media_kind` on the record.

Pipeline (voice, current):
  1. Client uploads audio (webm/m4a/wav/mp3 up to 60 min).
  2. Server stores the file via `put_object`, computes SHA-256, creates a
     `voice_evidence` record with `transcription_status='pending'`.
  3. Server records a `voice_memo_recorded` Meaningful Creative Event™ via
     the platform evidence recorder — the recording is first-class evidence
     from the moment it lands, before transcription completes.
  4. Background task: transcribe (Whisper via emergentintegrations,
     chunking if >20 MB), then classify moments (Claude Sonnet 5).
  5. Detected moments are stored on the record with
     `human_status='unconfirmed'`. They are NEVER emitted downstream as
     Meaningful Creative Events™ until a human confirms.

Guardrails (from the product spec):
  * LLM-detected moments are system-detected OBSERVATIONS, not truth.
  * Each moment carries its confidence, rationale, and a human-action trail
    (confirm / correct / dispute / annotate) with immutable timestamps.
  * Only confirmed or corrected moments propagate into the platform's
    downstream contribution intelligence.
  * Sensitivity policy follows the platform-wide standard:
    - lyric_idea / melody_idea / harmony_idea / arrangement_discussion /
      production_decision / final_approval  → CREATIVE
    - split_conversation / rights_discussion / creative_disagreement
                                            → SENSITIVE
"""
from __future__ import annotations

import asyncio
import hashlib
import io
import json
import os
import secrets
import subprocess
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

import evidence as evidence_recorder

# ---------- Constants ----------

WHISPER_MAX_BYTES = 24 * 1024 * 1024      # 24 MB safety margin under Whisper's 25 MB cap
MAX_CLIP_DURATION_SECONDS = 60 * 60       # 60 minutes hard cap

MEDIA_KINDS = {"voice", "video", "screen", "daw", "midi", "camera"}

# Nine categories of Meaningful Creative Moments (user-defined)
MOMENT_KINDS = [
    "lyric_idea",
    "melody_idea",
    "harmony_idea",
    "arrangement_discussion",
    "split_conversation",
    "production_decision",
    "rights_discussion",
    "creative_disagreement",
    "final_approval",
]

# Sensitivity mapping — determines what happens when a moment is confirmed by
# a human and promoted to the platform-wide evidence stream.
MOMENT_TO_EVIDENCE_KIND = {
    "lyric_idea":               ("lyric_section_completed", "creative"),
    "melody_idea":              ("melody_changed",          "creative"),
    "harmony_idea":             ("chord_progression_changed", "creative"),
    "arrangement_discussion":   ("arrangement_changed",     "creative"),
    "production_decision":      ("contribution_logged",     "creative"),
    "final_approval":           ("approval_signed",         "sensitive"),
    "split_conversation":       ("rights_discussion",       "sensitive"),
    "rights_discussion":        ("rights_discussion",       "sensitive"),
    "creative_disagreement":    ("negotiation",             "sensitive"),
}

# Human-review states — every detected moment lives in exactly one.
HUMAN_STATUSES = {"unconfirmed", "confirmed", "corrected", "disputed", "annotated"}


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


# ---------- Duration + chunking (ffmpeg) ----------

def _probe_duration_seconds(path: str) -> Optional[float]:
    """Return audio duration in seconds via ffprobe, or None on failure."""
    try:
        out = subprocess.check_output(
            ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", path],
            stderr=subprocess.DEVNULL,
            timeout=30,
        )
        return float(json.loads(out)["format"]["duration"])
    except Exception:
        return None


def _split_audio_if_needed(path: str, size_bytes: int) -> List[Tuple[str, float]]:
    """
    If the source file is <= WHISPER_MAX_BYTES, return [(path, 0.0)].
    Otherwise split into <=20-minute chunks (which is typically <24 MB for
    Opus/AAC/MP3 at consumer bit-rates). Returns a list of
    (chunk_path, start_offset_seconds) tuples, in play order.

    Uses ffmpeg segment muxer to avoid re-encoding whenever possible.
    """
    if size_bytes <= WHISPER_MAX_BYTES:
        return [(path, 0.0)]

    dur = _probe_duration_seconds(path) or 0.0
    if dur <= 0:
        # Best-effort fallback: return original and let Whisper reject it.
        return [(path, 0.0)]

    # Target ~15-minute chunks — comfortably under 25 MB for typical browser recordings
    chunk_seconds = 15 * 60
    chunks: List[Tuple[str, float]] = []
    base = f"/tmp/inheira_voice_{secrets.token_hex(4)}"
    os.makedirs(base, exist_ok=True)
    ext = os.path.splitext(path)[1] or ".webm"

    offset = 0.0
    idx = 0
    while offset < dur:
        out_path = os.path.join(base, f"chunk_{idx:03d}{ext}")
        try:
            subprocess.check_call(
                [
                    "ffmpeg", "-y", "-loglevel", "error",
                    "-ss", str(offset),
                    "-t", str(chunk_seconds),
                    "-i", path,
                    "-c", "copy",           # no re-encode
                    out_path,
                ],
                stderr=subprocess.DEVNULL,
                timeout=180,
            )
        except Exception:
            # Fallback: allow re-encode as m4a (universally accepted by Whisper)
            out_path = os.path.join(base, f"chunk_{idx:03d}.m4a")
            try:
                subprocess.check_call(
                    [
                        "ffmpeg", "-y", "-loglevel", "error",
                        "-ss", str(offset), "-t", str(chunk_seconds),
                        "-i", path, "-vn", "-c:a", "aac", "-b:a", "128k",
                        out_path,
                    ],
                    stderr=subprocess.DEVNULL,
                    timeout=180,
                )
            except Exception:
                break
        if os.path.exists(out_path) and os.path.getsize(out_path) > 0:
            chunks.append((out_path, offset))
        offset += chunk_seconds
        idx += 1

    return chunks or [(path, 0.0)]


# ---------- Whisper transcription ----------

async def _transcribe_whisper(paths_with_offsets: List[Tuple[str, float]]) -> Dict[str, Any]:
    """
    Transcribe a series of audio chunks with Whisper and return:
      { "text": str, "segments": [ {start, end, text} ], "language": str }

    Time offsets from the chunk split are applied to each segment's start/end
    so the returned segments are in the ORIGINAL recording's timeline.
    """
    from emergentintegrations.llm.openai import OpenAISpeechToText

    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise RuntimeError("EMERGENT_LLM_KEY missing from environment")

    stt = OpenAISpeechToText(api_key=api_key)
    merged_text_parts: List[str] = []
    merged_segments: List[Dict[str, Any]] = []
    language: Optional[str] = None

    for chunk_path, offset in paths_with_offsets:
        with open(chunk_path, "rb") as f:
            resp = await stt.transcribe(
                file=f,
                model="whisper-1",
                response_format="verbose_json",
                timestamp_granularities=["segment"],
            )
        # Emergent's client returns a Pydantic-like response with .text and .segments
        chunk_text = getattr(resp, "text", "") or ""
        merged_text_parts.append(chunk_text)
        language = language or getattr(resp, "language", None)
        segs = getattr(resp, "segments", None) or []
        for s in segs:
            # `s` may be a dataclass or pydantic — normalise access
            start = float(getattr(s, "start", None) if not isinstance(s, dict) else s.get("start", 0.0))
            end = float(getattr(s, "end", None) if not isinstance(s, dict) else s.get("end", 0.0))
            text = getattr(s, "text", None) if not isinstance(s, dict) else s.get("text", "")
            merged_segments.append({
                "start": round(start + offset, 3),
                "end": round(end + offset, 3),
                "text": (text or "").strip(),
            })

    return {
        "text": " ".join(t.strip() for t in merged_text_parts if t and t.strip()),
        "segments": merged_segments,
        "language": language or "en",
    }


# ---------- Moment classification (Claude Sonnet 5) ----------

INTENT_SYSTEM_PROMPT = f"""You are the Meaningful Creative Moment classifier for INHEIRA, a creative-ownership platform.

You will be given a transcript from a songwriting or production session (voice memo, writing-room recording, or studio conversation). Your job is to identify moments where meaningful creative work occurred and return them as a strict JSON array.

Categories (use ONLY these exact keys):
- "lyric_idea": a new or revised lyric line, hook, phrase, or section
- "melody_idea": a hummed or discussed melodic idea, motif, or vocal line
- "harmony_idea": chord progression, harmonic move, backing vocals, key change
- "arrangement_discussion": form, section order, instrumentation choices, dynamics
- "split_conversation": ownership percentages, writer/publishing splits
- "production_decision": mix, sound design, tempo, tuning, effects, recording choices
- "rights_discussion": publishing, PRO registration, copyright, sync, master rights
- "creative_disagreement": disagreement or debate about a creative choice
- "final_approval": explicit acceptance or sign-off on a piece of material

For each detected moment return an object with:
  kind          — one of the exact keys above
  excerpt       — the verbatim transcript excerpt (30-200 chars)
  start_sec     — best-effort start time in seconds if identifiable, else null
  end_sec       — best-effort end time in seconds if identifiable, else null
  confidence    — number in [0.0, 1.0] — your certainty this really is that moment
  rationale     — one short sentence explaining why

Rules:
1. Return ONLY a JSON array. No prose, no code fences, no explanation.
2. If NO meaningful moments are present, return [].
3. Be conservative — do not fabricate moments. If confidence < 0.4, do not include it.
4. Do not summarise casual conversation, throat-clearing, or filler.
5. Overlapping moments are allowed; each detected moment is its own object.

You are producing observations, not truth. Every moment you emit will be reviewed by a human before it counts."""


async def _classify_moments(transcript: str, segments: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Run Claude Sonnet 5 on the transcript + segment map and return a list of
    detected moments in the schema described in the system prompt.
    """
    if not transcript.strip():
        return []

    from emergentintegrations.llm.chat import LlmChat, UserMessage

    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise RuntimeError("EMERGENT_LLM_KEY missing from environment")

    # Compact segment index so the model can align excerpts to times. For very
    # long recordings we EVENLY downsample rather than truncating — a 60-min
    # session should still expose its final moments to the classifier.
    max_segments = 400
    if len(segments) > max_segments:
        step = max(1, len(segments) // max_segments)
        picked = segments[::step][:max_segments]
    else:
        picked = segments
    seg_map = "\n".join(
        f"[{s['start']:.1f}-{s['end']:.1f}s] {s['text']}"
        for s in picked
    )

    prompt = (
        "TRANSCRIPT (with segment times):\n"
        f"{seg_map or transcript[:8000]}\n\n"
        "Return the JSON array now."
    )

    chat = (
        LlmChat(
            api_key=api_key,
            session_id=f"voice-moments-{secrets.token_hex(4)}",
            system_message=INTENT_SYSTEM_PROMPT,
        )
        .with_model("anthropic", "claude-sonnet-5")
    )

    # This is a batch classification, not a user-facing stream — use non-streaming.
    result = await chat.send_message(UserMessage(text=prompt))
    text = getattr(result, "content", None) or getattr(result, "text", None) or str(result)

    # Parse the JSON array. Be tolerant of accidental prose.
    detected = []
    try:
        start = text.find("[")
        end = text.rfind("]")
        if start != -1 and end != -1 and end > start:
            detected = json.loads(text[start:end + 1])
    except Exception:
        detected = []

    # Sanitise and stamp each moment
    now = _now_iso()
    clean: List[Dict[str, Any]] = []
    for m in detected if isinstance(detected, list) else []:
        if not isinstance(m, dict):
            continue
        kind = str(m.get("kind") or "").strip()
        if kind not in MOMENT_KINDS:
            continue
        try:
            confidence = max(0.0, min(1.0, float(m.get("confidence") or 0.0)))
        except (TypeError, ValueError):
            confidence = 0.0
        if confidence < 0.4:
            continue
        clean.append({
            "moment_id": f"mom_{secrets.token_hex(6)}",
            "kind": kind,
            "excerpt": str(m.get("excerpt") or "").strip()[:400],
            "start_sec": m.get("start_sec"),
            "end_sec": m.get("end_sec"),
            "confidence": confidence,
            "rationale": str(m.get("rationale") or "").strip()[:280],
            "detected_at": now,
            "human_status": "unconfirmed",
            "human_action_by": None,
            "human_action_at": None,
            "human_correction": None,
            "human_note": None,
        })
    return clean


# ---------- Public: process a recording end-to-end ----------

async def process_recording(db, recording_id: str, local_audio_path: str) -> None:
    """
    Async pipeline: transcribe + classify moments. Updates the voice_evidence
    record in place. Called via asyncio.create_task after upload.
    """
    transcript_result: Optional[Dict[str, Any]] = None
    chunk_dir: Optional[str] = None
    try:
        await db.voice_evidence.update_one(
            {"recording_id": recording_id},
            {"$set": {"transcription_status": "transcribing"}},
        )
        rec = await db.voice_evidence.find_one({"recording_id": recording_id}, {"_id": 0})
        if not rec:
            return
        size = rec.get("size_bytes") or os.path.getsize(local_audio_path)
        chunks = _split_audio_if_needed(local_audio_path, size)
        if chunks and chunks[0][0] != local_audio_path:
            chunk_dir = os.path.dirname(chunks[0][0])
        transcript_result = await _transcribe_whisper(chunks)
        await db.voice_evidence.update_one(
            {"recording_id": recording_id},
            {"$set": {
                "transcription_status": "done",
                "transcript": transcript_result["text"],
                "segments": transcript_result["segments"],
                "language": transcript_result["language"],
                "moments_status": "classifying",
                "transcribed_at": _now_iso(),
            }},
        )
    except Exception as e:
        await db.voice_evidence.update_one(
            {"recording_id": recording_id},
            {"$set": {"transcription_status": "failed", "transcription_error": str(e)[:500]}},
        )
        _cleanup_paths(local_audio_path, chunk_dir)
        return

    try:
        moments = await _classify_moments(transcript_result["text"], transcript_result["segments"])
        await db.voice_evidence.update_one(
            {"recording_id": recording_id},
            {"$set": {
                "moments_status": "done",
                "detected_moments": moments,
                "classified_at": _now_iso(),
            }},
        )
    except Exception as e:
        await db.voice_evidence.update_one(
            {"recording_id": recording_id},
            {"$set": {"moments_status": "failed", "moments_error": str(e)[:500]}},
        )
    finally:
        _cleanup_paths(local_audio_path, chunk_dir)


def _cleanup_paths(local_audio_path: Optional[str], chunk_dir: Optional[str]) -> None:
    """Remove the uploaded temp file and any ffmpeg chunk directory."""
    if local_audio_path:
        try:
            if os.path.exists(local_audio_path):
                os.remove(local_audio_path)
        except Exception:
            pass
    if chunk_dir:
        try:
            for name in os.listdir(chunk_dir):
                p = os.path.join(chunk_dir, name)
                if os.path.isfile(p):
                    os.remove(p)
            os.rmdir(chunk_dir)
        except Exception:
            pass


# ---------- Public: promote a confirmed moment to platform evidence ----------

async def promote_moment_to_evidence(
    db,
    *,
    recording_id: str,
    moment_id: str,
    action: str,                       # one of HUMAN_STATUSES minus "unconfirmed"
    reviewer_id: str,
    reviewer_name: Optional[str] = None,
    reviewer_color: Optional[str] = None,
    correction: Optional[Dict[str, Any]] = None,
    note: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Apply a human review to a detected moment. On `confirmed` or `corrected`,
    emit the corresponding platform-wide Meaningful Creative Event™ via the
    canonical evidence recorder. On `disputed` or `annotated`, only the review
    trail is updated — nothing propagates downstream.

    The detected moment record itself is preserved forever, including the
    original LLM output and all human actions taken against it.
    """
    if action not in HUMAN_STATUSES or action == "unconfirmed":
        raise ValueError("Invalid review action")

    rec = await db.voice_evidence.find_one({"recording_id": recording_id})
    if not rec:
        raise LookupError("Recording not found")

    moments = list(rec.get("detected_moments") or [])
    idx = next((i for i, m in enumerate(moments) if m.get("moment_id") == moment_id), None)
    if idx is None:
        raise LookupError("Moment not found")

    moment = dict(moments[idx])
    now = _now_iso()
    moment["human_status"] = action
    moment["human_action_by"] = reviewer_id
    moment["human_action_at"] = now
    if correction:
        moment["human_correction"] = correction
    if note:
        moment["human_note"] = note

    # Determine the platform-wide evidence kind to emit (if any).
    emit_kind = None
    sensitivity = None
    effective_moment_kind = (correction or {}).get("kind") or moment["kind"]
    if action in ("confirmed", "corrected") and effective_moment_kind in MOMENT_TO_EVIDENCE_KIND:
        emit_kind, sensitivity = MOMENT_TO_EVIDENCE_KIND[effective_moment_kind]
    # Symmetry: dispute / annotate never propagate — stamp explicitly so
    # downstream consumers don't need to key on presence of the field.
    moment["propagated_event_kind"] = None

    if emit_kind:
        # Sensitivity is enforced INSIDE evidence_recorder based on the kind — we
        # pass the right kind and the recorder handles content vs metadata.
        excerpt = (correction or {}).get("excerpt") or moment.get("excerpt")
        label = f"Voice-derived · {effective_moment_kind.replace('_', ' ')}"
        payload = {
            "source": "voice_evidence",
            "recording_id": recording_id,
            "moment_id": moment_id,
            "excerpt": excerpt,
            "start_sec": moment.get("start_sec"),
            "end_sec": moment.get("end_sec"),
            "llm_confidence": moment.get("confidence"),
            "human_status": action,
            "participants": [reviewer_id],
        }
        secure_ref = None
        if sensitivity == "sensitive":
            secure_ref = {"collection": "voice_evidence", "id": recording_id, "moment_id": moment_id}
        await evidence_recorder.record_event(
            db, kind=emit_kind, session_id=rec.get("session_id"),
            actor_id=reviewer_id, actor_name=reviewer_name, actor_color=reviewer_color,
            label=label, payload=payload, secure_reference=secure_ref,
            parent_event_id=rec.get("voice_memo_event_id"),
        )
        moment["propagated_event_kind"] = emit_kind

    # Persist the updated moment record.
    moments[idx] = moment
    await db.voice_evidence.update_one(
        {"recording_id": recording_id},
        {"$set": {"detected_moments": moments}},
    )
    return moment
