"""Career Readiness™ scoring engine.

All inputs come from the ecosystem (never duplicated inside ANCRLaunch).
Every sub-score is 0–100, and the overall Career Readiness Score is a
weighted composite.
"""
from __future__ import annotations

from typing import Any, Dict


def _clamp(v: float) -> int:
    return max(0, min(100, int(round(v))))


def compute_readiness(portfolio: Dict[str, Any], resume_completion: int, interview_ready: int) -> Dict[str, Any]:
    projects = portfolio.get("projects") or []
    collabs = portfolio.get("collaborations") or []
    media = portfolio.get("media") or []
    publishing = portfolio.get("publishing") or []
    faculty_recs = portfolio.get("faculty_recommendations") or []
    industry_recs = portfolio.get("industry_recommendations") or []
    reputation = (portfolio.get("reputation") or {}).get("score", 0)
    passport = portfolio.get("creator_passport") or {}
    booking = portfolio.get("booking_packet") or {}

    portfolio_score = _clamp(30 + len(projects) * 12 + (10 if passport else 0))
    publishing_score = _clamp(20 + len(publishing) * 18)
    creative_score = _clamp(25 + len(media) * 15)
    collab_score = _clamp(20 + len(collabs) * 14)
    faculty_score = _clamp(30 + len(faculty_recs) * 25)
    industry_score = _clamp(20 + len(industry_recs) * 22)
    reputation_score = _clamp(reputation)
    business_score = _clamp(30 + (25 if booking else 0) + (20 if publishing else 0))

    weights = {
        "portfolio": (portfolio_score, 0.18),
        "publishing": (publishing_score, 0.10),
        "creative_projects": (creative_score, 0.10),
        "collaboration": (collab_score, 0.08),
        "faculty": (faculty_score, 0.09),
        "industry": (industry_score, 0.11),
        "reputation": (reputation_score, 0.10),
        "resume": (resume_completion, 0.10),
        "interview": (interview_ready, 0.08),
        "business": (business_score, 0.06),
    }
    overall = _clamp(sum(v * w for (v, w) in weights.values()))

    def tier(score: int) -> str:
        if score >= 85:
            return "Launch Ready"
        if score >= 70:
            return "Interview Ready"
        if score >= 55:
            return "Portfolio Ready"
        if score >= 40:
            return "Emerging"
        return "Building Foundation"

    return {
        "overall": overall,
        "tier": tier(overall),
        "components": {k: v for k, (v, _) in weights.items()},
        "weights": {k: w for k, (_, w) in weights.items()},
    }
