"""
INHEIRA — Comparison Engine

Side-by-side comparison of two documented versions of the same session.
Every statement produced here is traceable back to an existing evidence
record. Nothing is inferred, invented, estimated, or projected.

Non-negotiable guardrails (from the product spec):
  • Every diff entry cites its source evidence_id / artifact_id / ack_id.
  • Undocumented changes are NEVER surfaced — if there is no evidence, the
    diff simply says "no documented change".
  • The Comparison Engine is a documentation & analysis tool — never a
    legal determination engine. It does not estimate ownership. It does
    not assign publishing splits.
  • MCI analysis appears here as a reference to the shared session-level
    MCI result — the comparison engine does not recompute contribution.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _diff_scalar(a: Any, b: Any) -> Dict[str, Any]:
    return {"a": a, "b": b, "equal": (a or None) == (b or None)}


def _diff_list_of_strings(a: List[str], b: List[str]) -> Dict[str, Any]:
    """Ordered list diff: added, removed, unchanged (retained set order)."""
    a = list(a or [])
    b = list(b or [])
    sa, sb = set(a), set(b)
    return {
        "added": [x for x in b if x not in sa],
        "removed": [x for x in a if x not in sb],
        "unchanged": [x for x in a if x in sb],
        "a": a, "b": b,
    }


def _diff_participants(a: List[dict], b: List[dict]) -> Dict[str, Any]:
    """Compare participants by (rightprint_id or user_id or name)."""
    def key(p):
        return p.get("rightprint_id") or p.get("user_id") or (p.get("name") or "").lower()
    ka = {key(p): p for p in (a or [])}
    kb = {key(p): p for p in (b or [])}
    added = [kb[k] for k in kb.keys() - ka.keys()]
    removed = [ka[k] for k in ka.keys() - kb.keys()]
    both = [kb[k] for k in ka.keys() & kb.keys()]
    return {"added": added, "removed": removed, "in_both": both}


def _bucket_artifacts_by_kind(items: List[dict]) -> Dict[str, List[dict]]:
    out: Dict[str, List[dict]] = {}
    for it in (items or []):
        k = it.get("kind") or "other"
        out.setdefault(k, []).append(it)
    return out


def _diff_artifacts(a: List[dict], b: List[dict]) -> Dict[str, Any]:
    """Diff evidence artifacts by artifact_id. Every entry cites artifact_id."""
    def _id(x): return x.get("artifact_id")
    ida = {_id(x): x for x in (a or []) if _id(x)}
    idb = {_id(x): x for x in (b or []) if _id(x)}
    return {
        "added":     [idb[k] for k in idb.keys() - ida.keys()],
        "removed":   [ida[k] for k in ida.keys() - idb.keys()],
        "in_both":   [idb[k] for k in ida.keys() & idb.keys()],
        "counts_a": {k: len(v) for k, v in _bucket_artifacts_by_kind(a).items()},
        "counts_b": {k: len(v) for k, v in _bucket_artifacts_by_kind(b).items()},
    }


def _diff_acks(a: List[dict], b: List[dict]) -> Dict[str, Any]:
    """Diff acknowledgements by ack_id."""
    def _id(x): return x.get("ack_id")
    ida = {_id(x): x for x in (a or []) if _id(x)}
    idb = {_id(x): x for x in (b or []) if _id(x)}
    return {
        "added":   [idb[k] for k in idb.keys() - ida.keys()],
        "removed": [ida[k] for k in ida.keys() - idb.keys()],
        "in_both": [idb[k] for k in ida.keys() & idb.keys()],
    }


def _lineage_relationship(a: dict, b: dict) -> str:
    if a.get("version_id") == b.get("parent_version_id"): return "a_is_parent_of_b"
    if b.get("version_id") == a.get("parent_version_id"): return "b_is_parent_of_a"
    if a.get("parent_version_id") and a.get("parent_version_id") == b.get("parent_version_id"): return "siblings"
    return "unrelated"


async def _hydrate_version_for_compare(db, v: dict) -> dict:
    artifacts = await db.creative_evidence_artifacts.find(
        {"version_id": v["version_id"]}, {"_id": 0}
    ).sort("created_at", 1).to_list(500)
    acks = await db.creative_acknowledgements.find(
        {"version_id": v["version_id"]}, {"_id": 0}
    ).sort("created_at", 1).to_list(500)
    voice = await db.voice_evidence.find(
        {"session_id": v["session_id"], "linked_version_id": v["version_id"]}, {"_id": 0}
    ).sort("created_at", 1).to_list(200)
    v = dict(v)
    v["evidence_artifacts"] = artifacts
    v["acknowledgements"] = acks
    v["voice_evidence"] = voice
    return v


async def compare_versions(db, session_id: str, version_a_id: str, version_b_id: str) -> Dict[str, Any]:
    """Produce a full side-by-side comparison of two versions."""
    va = await db.creative_versions.find_one({"session_id": session_id, "version_id": version_a_id}, {"_id": 0})
    vb = await db.creative_versions.find_one({"session_id": session_id, "version_id": version_b_id}, {"_id": 0})
    if not va or not vb:
        return {"error": "Version not found"}
    va = await _hydrate_version_for_compare(db, va)
    vb = await _hydrate_version_for_compare(db, vb)

    # Ordered by creation for the between-window and lineage.
    if (va.get("created_at") or "") > (vb.get("created_at") or ""):
        va, vb = vb, va

    # Between-window: all documented events created strictly between the two
    # versions (inclusive of vb's event window). Traces back to real events.
    between = await db.creative_evidence_events.find(
        {
            "session_id": session_id,
            "created_at": {"$gt": va.get("created_at"), "$lte": vb.get("created_at")},
        },
        {"_id": 0},
    ).sort("created_at", 1).to_list(2000)

    metadata = {
        "title":       _diff_scalar(va.get("title") or va.get("label"), vb.get("title") or vb.get("label")),
        "purpose":     _diff_scalar(va.get("purpose"),      vb.get("purpose")),
        "moment_at":   _diff_scalar(va.get("moment_at"),    vb.get("moment_at")),
        "location":    _diff_scalar(va.get("location"),     vb.get("location")),
        "writing_room":_diff_scalar(va.get("writing_room"), vb.get("writing_room")),
        "submitter":   _diff_scalar(va.get("submitter_name"), vb.get("submitter_name")),
    }

    prose = {
        "objectives":   _diff_scalar(va.get("objectives"),   vb.get("objectives")),
        "what_changed": _diff_scalar(va.get("what_changed"), vb.get("what_changed")),
        "why_changed":  _diff_scalar(va.get("why_changed"),  vb.get("why_changed")),
        "ai_session_summary": _diff_scalar(va.get("ai_session_summary"), vb.get("ai_session_summary")),
    }

    decisions = {
        "decisions_reached":  _diff_list_of_strings(va.get("decisions_reached"),  vb.get("decisions_reached")),
        "decisions_deferred": _diff_list_of_strings(va.get("decisions_deferred"), vb.get("decisions_deferred")),
        "open_questions":     _diff_list_of_strings(va.get("open_questions"),     vb.get("open_questions")),
        "disagreements":      _diff_list_of_strings(va.get("disagreements"),      vb.get("disagreements")),
        "rights_discussions": _diff_list_of_strings(va.get("rights_discussions"), vb.get("rights_discussions")),
    }

    # Session-level MCI, presented alongside (never per-version — MCI reads
    # session-wide evidence and never recomputes per version here).
    mci_ref = {"session_id": session_id, "read_via": f"GET /api/sessions/{session_id}/mci"}

    return {
        "session_id": session_id,
        "a": {
            "version_id":       va.get("version_id"),
            "title":            va.get("title") or va.get("label"),
            "created_at":       va.get("created_at"),
            "integrity_hash":   va.get("integrity_hash"),
            "mci_status":       va.get("mci_status"),
            "confidence_status":va.get("confidence_status"),
        },
        "b": {
            "version_id":       vb.get("version_id"),
            "title":            vb.get("title") or vb.get("label"),
            "created_at":       vb.get("created_at"),
            "integrity_hash":   vb.get("integrity_hash"),
            "mci_status":       vb.get("mci_status"),
            "confidence_status":vb.get("confidence_status"),
        },
        "lineage": {
            "relationship": _lineage_relationship(va, vb),
            "a_parent": va.get("parent_version_id"),
            "b_parent": vb.get("parent_version_id"),
            "a_children": va.get("child_version_ids") or [],
            "b_children": vb.get("child_version_ids") or [],
        },
        "metadata":      metadata,
        "prose":         prose,
        "decisions":     decisions,
        "participants":  _diff_participants(va.get("participants"), vb.get("participants")),
        "environment": {
            "a": va.get("environment"),
            "b": vb.get("environment"),
        },
        "evidence_artifacts": _diff_artifacts(va.get("evidence_artifacts"), vb.get("evidence_artifacts")),
        "acknowledgements":   _diff_acks(va.get("acknowledgements"), vb.get("acknowledgements")),
        "voice_evidence": {
            "a": va.get("voice_evidence"),
            "b": vb.get("voice_evidence"),
        },
        "between_events": between,      # every documented event in the window
        "between_event_count": len(between),
        "mci": mci_ref,
        "disclaimer": (
            "The Comparison Engine is a documentation and analysis tool. Every "
            "statement above is traceable back to documented Creative Evidence™, "
            "Voice Evidence, acknowledgements, or version records. It does not "
            "determine legal ownership and does not assign publishing splits."
        ),
        "computed_at": _now_iso(),
    }
