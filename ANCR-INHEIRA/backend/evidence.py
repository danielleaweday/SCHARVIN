"""
INHEIRA — Automatic Creative Documentation™ · Platform-Wide Evidence Recorder

This module is the single source of truth for how EVERY creative action across
the entire ANCR platform becomes permanent Creative Evidence™. It implements
the platform-wide evidence standard the user codified:

  * Creative works (lyrics, melodies, chords, arrangements, voice memos, stems,
    notation, files) → store the COMPLETE evidence.
  * Sensitive communications (chat, AI prompts, rights discussions, legal
    conversations, negotiations) → store metadata + participants + timestamp +
    cryptographic hash + secure reference only. The original content stays in
    its native, permission-controlled collection.

Every record is cryptographically linked so the platform can always prove that
something existed, when it existed, who participated, and whether it has been
altered — without unnecessarily exposing private content. Evidence is always
verifiable, but only viewable by authorized participants.

Downstream systems (Creative Evidence Intelligence™, Creative Provenance™,
Musical Contribution Intelligence™, audits, disputes, future legal workflows)
all consume from this stream. Nothing else in the codebase should insert into
`creative_evidence_events` directly.

Design notes:
  * Storage: `creative_evidence_events` collection. Legacy `session_events`
    receives a lightweight mirror row per event so the existing Timeline / Song
    DNA / Studio pulse rail keep working with zero migration.
  * Auto-checkpoint bundling: every meaningful event may close/open a
    background "working memory" checkpoint (`evidence_checkpoints`). These are
    NOT versions — they are candidate bundles a creator can later promote into
    an official Creative Evidence™ version.
  * Rate & intent guard: intelligent debounce. Two identical events by the
    same actor within `DEBOUNCE_SECONDS` on the same target are collapsed into
    a single `revision_count`-incremented event, so keystroke-level firing
    doesn't drown the record.
"""
from __future__ import annotations

import hashlib
import json
import secrets
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional, Set

# ---------- Sensitivity policy ----------
# Every kind must be classified. Unknown kinds default to "sensitive" (fail-safe).
CREATIVE_KINDS: Set[str] = {
    # session lifecycle
    "session_created",
    "session_meta_updated",
    "collaborator_joined",
    "collaborator_left",
    # lyric / composition
    "lyric_line",
    "lyric_line_edited",
    "lyric_line_removed",
    "lyric_section_completed",
    # musical
    "melody_recorded",
    "melody_changed",
    "chord_progression_changed",
    "arrangement_changed",
    # media
    "voice_memo_recorded",
    "file_uploaded",
    "whiteboard_edited",
    # authorship
    "contribution_logged",
    "version_submitted",
    "version_evidence_added",
    "milestone_reached",
    # identifiers / rights (metadata only, not sensitive negotiations)
    "identifier_generated",
    "rights_updated",
    "rightprint_updated",
    # publishing
    "publishing_registered",
    "dsp_connected",
    "released",
}

SENSITIVE_KINDS: Set[str] = {
    "chat_message",              # private chat content
    "ai_interaction",            # AI prompt/response — user-generated content is CREATIVE, prompts may be sensitive; we hash the exchange
    "ai_generation_accepted",    # explicit accept of an AI output; content itself is preserved on the artifact, this event is just an audit trail
    "rights_discussion",         # rights / ownership conversation
    "negotiation",               # commercial negotiation
    "approval_signed",           # split approval / signature — contains identifying info
    "acknowledgement_submitted", # metadata-only mirror of an acknowledgement (the record itself lives in creative_acknowledgements)
    "share_link_created",        # who shared with whom
}

ALL_KINDS: Set[str] = CREATIVE_KINDS | SENSITIVE_KINDS

# Intelligent-debounce window: two same-actor / same-kind / same-target events
# within this window are treated as ONE continuous creative act.
DEBOUNCE_SECONDS = 60

# Auto-checkpoint policy — silent working memory. The creator sees these only
# if they open the "Populate from evidence" flow.
CHECKPOINT_MAX_EVENTS = 25          # close after N events accumulate
CHECKPOINT_MAX_MINUTES = 60         # or after N minutes elapsed


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _canonical_hash(payload: Dict[str, Any]) -> str:
    """
    Cryptographic hash of the canonical (sorted-keys) JSON of the payload.
    Two events with the same content produce the same hash — enabling
    dedup / integrity verification / cross-reference across the platform.
    """
    canonical = json.dumps(payload, sort_keys=True, default=str, ensure_ascii=False)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def _reference_hash(ref: Optional[Dict[str, Any]]) -> Optional[str]:
    """Hash a secure-reference payload — used to prove the original exists."""
    if not ref:
        return None
    return _canonical_hash(ref)


def _classify_sensitivity(kind: str) -> str:
    if kind in CREATIVE_KINDS:
        return "creative"
    if kind in SENSITIVE_KINDS:
        return "sensitive"
    return "sensitive"  # fail-safe


def _content_preview(payload: Dict[str, Any]) -> Optional[str]:
    """
    Extract a short human-readable preview for creative events. Kept small
    (<=140 chars). Never populated for sensitive kinds.
    """
    for key in ("preview", "text", "content", "label", "summary"):
        v = payload.get(key)
        if isinstance(v, str) and v:
            return v[:140]
    return None


async def record_event(
    db,
    *,
    kind: str,
    session_id: Optional[str] = None,
    song_id: Optional[str] = None,
    writing_room_id: Optional[str] = None,
    actor_id: str,
    actor_name: Optional[str] = None,
    actor_color: Optional[str] = None,
    actor_rightprint_id: Optional[str] = None,
    payload: Optional[Dict[str, Any]] = None,
    secure_reference: Optional[Dict[str, Any]] = None,
    label: Optional[str] = None,
    references: Optional[List[str]] = None,
    parent_event_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Record a Meaningful Creative Event™ into the platform's evidence stream.

    Args:
        db: motor async DB handle.
        kind: one of ALL_KINDS. Unknown kinds are recorded as sensitive.
        session_id / song_id / writing_room_id: contextual anchors (any subset).
        actor_id: user_id (never None — every action has an actor).
        actor_name/color/rightprint_id: denormalized identity for fast UI.
        payload: event data. For creative events it is stored in full. For
            sensitive events, the payload is dropped in favor of the hash +
            a small metadata subset (`participants`, `label`, `preview` if
            explicitly whitelisted by the caller).
        secure_reference: for sensitive events, a small pointer (collection +
            id + optional revision) proving the original content exists in its
            native permission-controlled collection.
        label: short human-readable label surfaced on the Live stream.
        references: other event_ids this event descends from / responds to.
        parent_event_id: direct predecessor (revision/edit chains).

    Returns:
        The persisted event document (without _id).
    """
    if kind not in ALL_KINDS:
        # allow but classify as sensitive — never silently drop the signal.
        sensitivity = "sensitive"
    else:
        sensitivity = _classify_sensitivity(kind)

    payload = dict(payload or {})
    now = _now_iso()
    event_id = f"evt_{secrets.token_hex(6)}"

    # Debounce: if the exact same actor+kind+target arrived within
    # DEBOUNCE_SECONDS, we merge revisions instead of writing a new row.
    # NOTE: `section` is a coarse grouping and MUST NOT be used as a dedup
    # target on its own — two independent lyric lines in the same verse would
    # get collapsed. Require an explicit line/artifact/target id.
    dedup_target = payload.get("target_id") or payload.get("line_id")
    if dedup_target:
        threshold_iso = (datetime.now(timezone.utc) - timedelta(seconds=DEBOUNCE_SECONDS)).isoformat()
        prior = await db.creative_evidence_events.find_one(
            {
                "session_id": session_id,
                "actor.id": actor_id,
                "kind": kind,
                "dedup_target": dedup_target,
                "created_at": {"$gte": threshold_iso},
            },
            sort=[("created_at", -1)],
        )
        if prior:
            new_revision = (prior.get("revision_count", 1) or 1) + 1
            # Preserve ORIGINAL payload for creative kinds; append the latest to `revisions[]`.
            new_hash = _canonical_hash(payload) if sensitivity == "creative" else _canonical_hash(payload)
            update = {
                "$set": {
                    "last_revised_at": now,
                    "current_hash": new_hash,
                    "revision_count": new_revision,
                },
                "$push": {
                    "revisions": {
                        "revision_id": f"rev_{secrets.token_hex(4)}",
                        "at": now,
                        "hash": new_hash,
                        # For creative kinds we keep a tiny preview so the diff can be reconstructed.
                        # For sensitive kinds we keep the hash only.
                        "preview": _content_preview(payload) if sensitivity == "creative" else None,
                    }
                },
            }
            await db.creative_evidence_events.update_one({"event_id": prior["event_id"]}, update)
            # Legacy mirror stays as-is (session_events is an idempotent surface — one row per meaningful act).
            merged = await db.creative_evidence_events.find_one({"event_id": prior["event_id"]}, {"_id": 0})
            return merged or prior

    # New event
    if sensitivity == "creative":
        stored_payload = payload
    else:
        # Sensitive: strip content, keep whitelisted metadata + a preview only
        # when the caller explicitly opts in via payload["_preview_ok"] = True.
        preview_ok = bool(payload.pop("_preview_ok", False))
        stored_payload = {
            "participants": payload.get("participants"),
            "label": label,
            "preview": _content_preview(payload) if preview_ok else None,
            # keep any explicit metadata subset the caller marked safe
            "meta": payload.get("meta"),
        }

    content_hash = _canonical_hash(payload)
    reference_hash = _reference_hash(secure_reference)

    doc = {
        "event_id": event_id,
        "kind": kind,
        "sensitivity": sensitivity,
        "session_id": session_id,
        "song_id": song_id,
        "writing_room_id": writing_room_id,
        "actor": {
            "id": actor_id,
            "name": actor_name,
            "color": actor_color,
            "rightprint_id": actor_rightprint_id,
        },
        "label": label,
        "payload": stored_payload,
        "secure_reference": secure_reference,   # small pointer to native store
        "content_hash": content_hash,           # proves original content was seen
        "reference_hash": reference_hash,       # proves the pointer's integrity
        "references": references or [],
        "parent_event_id": parent_event_id,
        "dedup_target": dedup_target,
        "revision_count": 1,
        "revisions": [],
        "created_at": now,
        "last_revised_at": now,
    }
    await db.creative_evidence_events.insert_one(doc)

    # Legacy mirror — keeps every existing UI (session timeline, Song DNA,
    # Studio Pulse rail) working with zero migration.
    await db.session_events.insert_one({
        "event_id": event_id,
        "session_id": session_id,
        "user_id": actor_id,
        "user_name": actor_name,
        "color": actor_color,
        "kind": kind,
        "label": label,
        "meta": stored_payload,
        "sensitivity": sensitivity,
        "created_at": now,
    })

    # Silent auto-checkpoint bookkeeping
    if session_id:
        await _maybe_close_checkpoint(db, session_id=session_id, actor_id=actor_id)

    doc.pop("_id", None)
    return doc


# ---------- Auto-checkpoint (silent working memory) ----------

async def _maybe_close_checkpoint(db, *, session_id: str, actor_id: str) -> None:
    """
    Silent background bundling. Checkpoints exist so the creator can later
    "Populate from evidence" without losing anything. They are NEVER shown on
    the public Musical Evolution timeline until they are promoted into an
    official version.
    """
    open_ck = await db.evidence_checkpoints.find_one(
        {"session_id": session_id, "status": "open"},
        sort=[("opened_at", -1)],
    )
    now_dt = datetime.now(timezone.utc)
    if open_ck is None:
        # Open a new checkpoint on this event.
        await db.evidence_checkpoints.insert_one({
            "checkpoint_id": f"ckp_{secrets.token_hex(6)}",
            "session_id": session_id,
            "status": "open",
            "opened_at": now_dt.isoformat(),
            "closed_at": None,
            "event_count": 1,
            "actor_ids": [actor_id],
        })
        return

    opened_at = open_ck.get("opened_at")
    try:
        opened_dt = datetime.fromisoformat(opened_at.replace("Z", "+00:00")) if opened_at else now_dt
    except Exception:
        opened_dt = now_dt
    elapsed_min = (now_dt - opened_dt).total_seconds() / 60.0
    new_count = (open_ck.get("event_count", 0) or 0) + 1

    should_close = (
        new_count >= CHECKPOINT_MAX_EVENTS or elapsed_min >= CHECKPOINT_MAX_MINUTES
    )

    if should_close:
        await db.evidence_checkpoints.update_one(
            {"checkpoint_id": open_ck["checkpoint_id"]},
            {
                "$set": {"status": "closed", "closed_at": now_dt.isoformat(), "event_count": new_count},
                "$addToSet": {"actor_ids": actor_id},
            },
        )
        # A new checkpoint opens on the next event.
    else:
        await db.evidence_checkpoints.update_one(
            {"checkpoint_id": open_ck["checkpoint_id"]},
            {"$set": {"event_count": new_count}, "$addToSet": {"actor_ids": actor_id}},
        )


async def close_active_checkpoint(db, *, session_id: str) -> Optional[Dict[str, Any]]:
    """Called when a version is submitted — seals the working-memory bundle
    so it can be referenced from the new version's `source_checkpoint_ids`."""
    open_ck = await db.evidence_checkpoints.find_one(
        {"session_id": session_id, "status": "open"},
        sort=[("opened_at", -1)],
    )
    if not open_ck:
        return None
    await db.evidence_checkpoints.update_one(
        {"checkpoint_id": open_ck["checkpoint_id"]},
        {"$set": {"status": "closed", "closed_at": _now_iso()}},
    )
    open_ck.pop("_id", None)
    open_ck["status"] = "closed"
    open_ck["closed_at"] = _now_iso()
    return open_ck


async def list_events_since(
    db,
    *,
    session_id: str,
    since: Optional[str] = None,
    kinds: Optional[List[str]] = None,
    limit: int = 500,
) -> List[Dict[str, Any]]:
    q: Dict[str, Any] = {"session_id": session_id}
    if since:
        q["created_at"] = {"$gt": since}
    if kinds:
        q["kind"] = {"$in": kinds}
    return await db.creative_evidence_events.find(q, {"_id": 0}).sort("created_at", 1).to_list(limit)


async def derive_populate_from_evidence(
    db,
    *,
    session_id: str,
    since_iso: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Given a session and an optional "since" timestamp, derive the auto-populate
    payload for the Document Version modal:

      * participants     — unique actors observed since `since_iso`
      * what_changed[]   — bullets summarising each meaningful evidence kind
      * decisions_reached[] — approvals / milestones
      * open_questions[] — unresolved rights_discussion / negotiation heads
      * source_event_ids — all events that contributed to this bundle
      * source_checkpoint_ids — closed checkpoints entirely inside the window
    """
    events = await list_events_since(db, session_id=session_id, since=since_iso, limit=2000)

    participants_map: Dict[str, Dict[str, Any]] = {}
    what_changed: List[str] = []
    decisions_reached: List[str] = []
    open_questions: List[str] = []
    event_ids: List[str] = []

    # Human-readable summaries per kind
    KIND_SUMMARY = {
        "lyric_line":               "New lyric line written",
        "lyric_line_edited":        "Lyric line revised",
        "lyric_line_removed":       "Lyric line removed",
        "lyric_section_completed":  "Lyric section completed",
        "melody_recorded":          "Melody recorded",
        "melody_changed":           "Melody revised",
        "chord_progression_changed":"Chord progression changed",
        "arrangement_changed":      "Arrangement adjusted",
        "voice_memo_recorded":      "Voice memo captured",
        "file_uploaded":            "File attached to the session",
        "whiteboard_edited":        "Whiteboard updated",
        "contribution_logged":      "Contribution logged",
        "identifier_generated":     "Identifier generated",
        "rights_updated":           "Rights record updated",
        "publishing_registered":    "Publishing registration completed",
        "dsp_connected":            "DSP connected",
        "released":                 "Song released",
        "collaborator_joined":      "Collaborator joined",
        "collaborator_left":        "Collaborator left",
    }

    counts: Dict[str, int] = {}
    for e in events:
        event_ids.append(e["event_id"])
        a = e.get("actor") or {}
        aid = a.get("id")
        if aid and aid not in participants_map:
            participants_map[aid] = {
                "name": a.get("name") or "Unknown",
                "user_id": aid,
                "color": a.get("color"),
                "rightprint_id": a.get("rightprint_id"),
                "role": None,
            }
        kind = e.get("kind")
        counts[kind] = counts.get(kind, 0) + 1
        if kind == "approval_signed":
            decisions_reached.append(f"{a.get('name') or 'Someone'} signed off on the current material.")
        elif kind in ("rights_discussion", "negotiation"):
            if e.get("label"):
                open_questions.append(e["label"])

    for kind, n in counts.items():
        if kind in KIND_SUMMARY:
            what_changed.append(f"{KIND_SUMMARY[kind]} · ×{n}" if n > 1 else KIND_SUMMARY[kind])

    # Checkpoints entirely inside the window
    ckp_q: Dict[str, Any] = {"session_id": session_id, "status": "closed"}
    if since_iso:
        ckp_q["opened_at"] = {"$gte": since_iso}
    checkpoints = await db.evidence_checkpoints.find(ckp_q, {"_id": 0}).sort("opened_at", 1).to_list(200)

    return {
        "participants": list(participants_map.values()),
        "what_changed": what_changed,
        "decisions_reached": decisions_reached,
        "open_questions": open_questions,
        "source_event_ids": event_ids,
        "source_checkpoint_ids": [c["checkpoint_id"] for c in checkpoints],
        "counts": counts,
        "total_events": len(events),
    }
