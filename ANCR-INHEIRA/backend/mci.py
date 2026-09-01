"""
INHEIRA — Musical Contribution Intelligence™ (MCI)

MCI reads every piece of documented evidence the platform has captured for a
session — Creative Evidence™ events, version submissions, acknowledgements,
confirmed voice moments, and version lineage — and produces an analytical
picture of *documented musical contributions* per contributor.

Non-negotiable guardrails (from the product spec):
  • MCI ESTIMATES documented musical contributions only.
  • MCI does NOT determine legal ownership.
  • MCI does NOT assign publishing splits.
  • MCI is an evidence-supported ANALYTICAL engine — not a legal engine.
  • `mci_status` remains 'awaiting_musical_contribution_analysis' until a
    session accumulates enough documented evidence to be analysed.
  • Every attribution surfaces the evidence that supports it so a human can
    verify or dispute the picture.

Nothing here creates new evidence. Nothing here mutates a version's content.
When analysis completes, only the analyzed version's `mci_status` string
flips from awaiting → 'analyzed' (or 'insufficient_evidence' when there's
not enough documented material).

Sufficiency gate — the analysis runs ONLY when all of the following hold:
  1. session has ≥ 1 submitted version
  2. session has ≥ 5 documented Creative Evidence™ events
  3. session has ≥ 1 human review signal (acknowledgement OR confirmed
     voice moment) — never analyse without a human being in the loop
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

# Contribution categories MCI reports on. These are ANALYSIS surfaces, not
# ownership buckets — every entry maps to specific documented evidence kinds.
CATEGORIES = {
    "lyric":       {"label": "Lyric", "sources": ["lyric_line", "lyric_line_edited", "lyric_section_completed"]},
    "melody":      {"label": "Melody", "sources": ["melody_recorded", "melody_changed"]},
    "harmony":     {"label": "Harmony", "sources": ["chord_progression_changed"]},
    "arrangement": {"label": "Arrangement", "sources": ["arrangement_changed"]},
    "production":  {"label": "Production", "sources": ["contribution_logged", "voice_memo_recorded", "file_uploaded"]},
    "identifier":  {"label": "Identifier / rights records", "sources": ["identifier_generated", "rights_updated"]},
    "acknowledgement": {"label": "Documented acknowledgements", "sources": []},   # populated separately
    "voice_moment":    {"label": "Confirmed voice moments",    "sources": []},    # populated separately
}

# Sufficiency thresholds — deliberately conservative to avoid analysing thin
# records. Documented in the module header.
MIN_VERSIONS = 1
MIN_EVENTS = 5
MIN_HUMAN_SIGNALS = 1

# Confidence tiers based on documentation depth. NEVER used as an ownership
# score — they describe how much evidence the analysis is standing on.
def _confidence_tier(total_signals: int, human_signals: int) -> Dict[str, Any]:
    if total_signals >= 40 and human_signals >= 5:
        return {"tier": "high", "label": "High documentation coverage"}
    if total_signals >= 15 and human_signals >= 2:
        return {"tier": "moderate", "label": "Moderate documentation coverage"}
    if total_signals >= MIN_EVENTS and human_signals >= MIN_HUMAN_SIGNALS:
        return {"tier": "baseline", "label": "Baseline documentation coverage"}
    return {"tier": "insufficient", "label": "Insufficient documentation for MCI"}


async def _load_inputs(db, session_id: str) -> Dict[str, Any]:
    versions = await db.creative_versions.find({"session_id": session_id}, {"_id": 0}).sort("created_at", 1).to_list(500)
    events = await db.creative_evidence_events.find({"session_id": session_id}, {"_id": 0}).sort("created_at", 1).to_list(5000)
    ack_docs = await db.creative_acknowledgements.find({"session_id": session_id}, {"_id": 0}).to_list(2000)
    voice_docs = await db.voice_evidence.find({"session_id": session_id}, {"_id": 0}).to_list(500)
    session = await db.sessions.find_one({"session_id": session_id}, {"_id": 0}) or {}
    return {
        "versions": versions, "events": events, "acks": ack_docs,
        "voice_records": voice_docs, "session": session,
    }


def _human_signal_count(acks: List[dict], voice_records: List[dict]) -> int:
    """
    Documented human-in-the-loop signals. Only counts:
      • acknowledgements that were explicitly submitted (any kind)
      • voice moments a human has confirmed or corrected
    Disputed / annotated voice moments count as a signal too — they are
    also human-in-the-loop, just as evidence of pushback rather than
    endorsement.
    """
    n = len(acks)
    for r in voice_records:
        for m in (r.get("detected_moments") or []):
            if m.get("human_status") in ("confirmed", "corrected", "disputed", "annotated"):
                n += 1
    return n


def _contributor_from_actor(actor: dict) -> Dict[str, Any]:
    return {
        "user_id": actor.get("id"),
        "name": actor.get("name") or "Unknown",
        "color": actor.get("color"),
        "rightprint_id": actor.get("rightprint_id"),
    }


def _empty_categories() -> Dict[str, Any]:
    return {k: {"label": v["label"], "count": 0, "evidence_ids": []} for k, v in CATEGORIES.items()}


async def compute_mci_for_session(db, session_id: str) -> Dict[str, Any]:
    """
    Compute the MCI analysis for a session. Return an object shaped for the
    UI. Never mutates content. Never assigns ownership or splits.
    """
    now = datetime.now(timezone.utc).isoformat()
    inputs = await _load_inputs(db, session_id)
    versions = inputs["versions"]
    events = inputs["events"]
    acks = inputs["acks"]
    voice_records = inputs["voice_records"]

    version_count = len(versions)
    event_count = len(events)
    human_signals = _human_signal_count(acks, voice_records)

    # Sufficiency gate — mci_status remains "awaiting" if not enough evidence.
    if version_count < MIN_VERSIONS or event_count < MIN_EVENTS or human_signals < MIN_HUMAN_SIGNALS:
        return {
            "session_id": session_id,
            "status": "awaiting_musical_contribution_analysis",
            "reason": {
                "versions": {"have": version_count, "need": MIN_VERSIONS},
                "events": {"have": event_count, "need": MIN_EVENTS},
                "human_signals": {"have": human_signals, "need": MIN_HUMAN_SIGNALS},
            },
            "contributors": [],
            "totals": {"events": event_count, "versions": version_count, "acknowledgements": len(acks), "voice_records": len(voice_records), "human_signals": human_signals},
            "confidence": _confidence_tier(event_count, human_signals),
            "computed_at": now,
        }

    # ----- Aggregate signals per contributor -----
    kind_to_category = {}
    for cat_key, meta in CATEGORIES.items():
        for kind in meta["sources"]:
            kind_to_category[kind] = cat_key

    by_contributor: Dict[str, Dict[str, Any]] = {}

    def _ensure(actor_id: str, actor: dict) -> Dict[str, Any]:
        if actor_id in by_contributor:
            return by_contributor[actor_id]
        rec = _contributor_from_actor(actor)
        rec["categories"] = _empty_categories()
        rec["total_signals"] = 0
        by_contributor[actor_id] = rec
        return rec

    # Events → categories
    for e in events:
        actor = e.get("actor") or {}
        aid = actor.get("id")
        if not aid:
            continue
        kind = e.get("kind")
        cat = kind_to_category.get(kind)
        if not cat:
            continue
        rec = _ensure(aid, actor)
        rec["categories"][cat]["count"] += 1
        # Only keep small evidence lists to keep the payload manageable
        if len(rec["categories"][cat]["evidence_ids"]) < 20:
            rec["categories"][cat]["evidence_ids"].append(e.get("event_id"))
        rec["total_signals"] += 1

    # Acknowledgements — each submitted acknowledgement adds a signal to the
    # collaborator's "acknowledgement" bucket. Corrections/disputes still count
    # (they are documented human action), but their disposition is preserved
    # so the UI can render Confirmed vs Disputed separately.
    for a in acks:
        aid = a.get("collaborator_id")
        if not aid:
            continue
        rec = _ensure(aid, {"id": aid, "name": a.get("collaborator_name"), "color": a.get("collaborator_color")})
        rec["categories"]["acknowledgement"]["count"] += 1
        if len(rec["categories"]["acknowledgement"]["evidence_ids"]) < 20:
            rec["categories"]["acknowledgement"]["evidence_ids"].append(a.get("ack_id"))
        rec["total_signals"] += 1

    # Voice moments — ONLY human-confirmed or corrected moments count toward
    # attribution. Disputed / annotated / unconfirmed do not.
    for r in voice_records:
        for m in (r.get("detected_moments") or []):
            if m.get("human_status") not in ("confirmed", "corrected"):
                continue
            aid = m.get("human_action_by") or r.get("recorded_by_id")
            if not aid:
                continue
            rec = _ensure(aid, {"id": aid, "name": r.get("recorded_by_name"), "color": r.get("recorded_by_color")})
            rec["categories"]["voice_moment"]["count"] += 1
            if len(rec["categories"]["voice_moment"]["evidence_ids"]) < 20:
                rec["categories"]["voice_moment"]["evidence_ids"].append(m.get("moment_id"))
            rec["total_signals"] += 1

    # Sort contributors by total documented signals (deterministic ties by name).
    contributors = sorted(by_contributor.values(), key=lambda x: (-x["total_signals"], x["name"] or ""))

    # Compute a *documentation share* per contributor — the % of TOTAL SIGNALS
    # attributable to them. This is a documentation-density number, not an
    # ownership number, and the UI renders it under an explicit disclaimer.
    total_signals = sum(c["total_signals"] for c in contributors) or 1
    for c in contributors:
        c["documentation_share"] = round(c["total_signals"] / total_signals, 4)

    return {
        "session_id": session_id,
        "status": "analyzed",
        "contributors": contributors,
        "totals": {
            "events": event_count,
            "versions": version_count,
            "acknowledgements": len(acks),
            "voice_records": len(voice_records),
            "human_signals": human_signals,
            "total_signals": total_signals,
        },
        "confidence": _confidence_tier(event_count, human_signals),
        "disclaimer": (
            "MCI analyses documented musical contributions only. It does not "
            "determine legal ownership and does not assign publishing splits. "
            "Every attribution here can be reviewed, disputed, or annotated "
            "by the humans in the session."
        ),
        "computed_at": now,
    }


async def stamp_versions_mci_status(db, session_id: str, status: str) -> None:
    """
    Reflect the analysis outcome on every submitted version of the session so
    consumers reading the version doc see the resolved state. The version
    record itself is otherwise untouched.
    """
    await db.creative_versions.update_many(
        {"session_id": session_id},
        {"$set": {"mci_status": status}},
    )
