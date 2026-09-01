"""COHEIR™ Share Kits — professionals & alumni generate revocable share links.

Kinds: public_portfolio, student_profile, booking_profile, professional_resume,
press_kit, institution_review, private_review.

Each kit inherits permissions from ANCRID™ and can be revoked at any time.
"""
from __future__ import annotations
import uuid
import secrets
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, ConfigDict

from auth import current_user
from models import UserPublic

router = APIRouter(prefix="/share", tags=["share"])


KIND_LABELS = {
    "public_portfolio": "Public Portfolio",
    "student_profile": "Student Profile",
    "booking_profile": "Booking Profile",
    "professional_resume": "Professional Resume",
    "press_kit": "Press Kit",
    "institution_review": "Institution Review",
    "private_review": "Private Review",
}


class CreateKitBody(BaseModel):
    subject_user_id: str
    kind: str
    label: Optional[str] = None
    expires_days: Optional[int] = None  # None = never expires
    fields: List[str] = []  # optional whitelist override


@router.post("/kits")
async def create_kit(body: CreateKitBody, request: Request,
                     user: UserPublic = Depends(current_user)):
    if body.kind not in KIND_LABELS:
        raise HTTPException(status_code=400, detail="Unknown kit kind")
    db = request.app.state.db
    subject = await db.users.find_one(
        {"user_id": body.subject_user_id}, {"_id": 0, "password_hash": 0})
    if not subject:
        raise HTTPException(status_code=404, detail="Subject user not found")

    # Only the subject themself OR an ancr_admin/institution_admin can generate kits for a user.
    # Professionals can generate an "institution_review" or "private_review" about a student they supervise.
    can_generate = (
        user.user_id == body.subject_user_id
        or user.role in ("ancr_admin", "institution_admin")
        or (body.kind in ("institution_review", "private_review") and body.subject_user_id in (subject.get("mentor_ids") or [])
            or user.user_id in (subject.get("mentor_ids") or []))
    )
    # Also allow self-share always
    if body.subject_user_id == user.user_id:
        can_generate = True
    if not can_generate:
        raise HTTPException(status_code=403, detail="Not allowed to create this kit")

    slug = secrets.token_urlsafe(12)
    now = datetime.now(timezone.utc)
    expires_at = None
    if body.expires_days:
        from datetime import timedelta
        expires_at = (now + timedelta(days=body.expires_days)).isoformat()

    kit = {
        "id": uuid.uuid4().hex,
        "slug": slug,
        "kind": body.kind,
        "subject_user_id": body.subject_user_id,
        "subject_ancrid": subject.get("ancrid"),
        "created_by_id": user.user_id,
        "created_by_name": user.name,
        "label": body.label or KIND_LABELS[body.kind],
        "fields": body.fields or [],
        "revoked": False,
        "views": 0,
        "expires_at": expires_at,
        "created_at": now.isoformat(),
    }
    await db.share_kits.insert_one(kit.copy())
    kit.pop("_id", None)
    return kit


@router.get("/kits/mine")
async def my_kits(request: Request, user: UserPublic = Depends(current_user)):
    db = request.app.state.db
    cursor = db.share_kits.find(
        {"$or": [{"subject_user_id": user.user_id}, {"created_by_id": user.user_id}]},
        {"_id": 0},
    ).sort("created_at", -1)
    return await cursor.to_list(100)


@router.post("/kits/{kit_id}/revoke")
async def revoke_kit(kit_id: str, request: Request,
                     user: UserPublic = Depends(current_user)):
    db = request.app.state.db
    kit = await db.share_kits.find_one({"id": kit_id})
    if not kit:
        raise HTTPException(status_code=404, detail="Kit not found")
    if kit["subject_user_id"] != user.user_id and kit["created_by_id"] != user.user_id and user.role not in ("ancr_admin",):
        raise HTTPException(status_code=403, detail="Not allowed")
    await db.share_kits.update_one({"id": kit_id}, {"$set": {"revoked": True}})
    return {"ok": True}


# Public view (no auth)
@router.get("/public/{slug}")
async def public_view(slug: str, request: Request):
    db = request.app.state.db
    kit = await db.share_kits.find_one({"slug": slug}, {"_id": 0})
    if not kit or kit.get("revoked"):
        raise HTTPException(status_code=404, detail="Share link not available")
    if kit.get("expires_at"):
        from datetime import datetime as _dt
        exp = _dt.fromisoformat(kit["expires_at"])
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if exp < datetime.now(timezone.utc):
            raise HTTPException(status_code=410, detail="Share link expired")

    subject = await db.users.find_one(
        {"user_id": kit["subject_user_id"]},
        {"_id": 0, "password_hash": 0, "email": 0, "mentor_ids": 0},
    )
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    kind = kit["kind"]
    view = _filter_fields(subject, kind, kit.get("fields") or [])

    # increment view count (fire-and-forget style)
    await db.share_kits.update_one({"slug": slug}, {"$inc": {"views": 1}})

    # Extra bundles
    if kind in ("public_portfolio", "student_profile", "press_kit", "booking_profile"):
        pf = await db.portfolio_files.find(
            {"user_id": subject["user_id"], "is_deleted": False, "visibility": {"$in": ["public", "shared"]}},
            {"_id": 0},
        ).sort("created_at", -1).to_list(100)
        view["portfolio_files"] = pf
    if kind in ("student_profile", "institution_review"):
        reviews = await db.reviews.find({"student_id": subject["user_id"]}, {"_id": 0}).to_list(50)
        recs = await db.recommendations.find({"student_id": subject["user_id"]}, {"_id": 0}).to_list(50)
        view["reviews"] = reviews
        view["recommendations"] = recs

    return {
        "kit": {k: v for k, v in kit.items() if k not in ("subject_user_id",)},
        "kind_label": KIND_LABELS[kind],
        "subject": view,
    }


def _filter_fields(subject: dict, kind: str, extra_fields: List[str]) -> dict:
    """Apply kind-specific field whitelist. Fields inherit from ANCRID™."""
    common = {"user_id", "ancrid", "name", "picture", "verified", "location", "role", "title", "company"}
    presets = {
        "public_portfolio": common | {"disciplines", "expertise", "portfolio_links", "current_projects", "credits", "awards", "bio"},
        "student_profile":  common | {"program", "graduation_year", "skills", "goals", "career_readiness", "cohort_id", "institution", "achievements"},
        "booking_profile":  common | {"availability", "disciplines", "expertise", "languages", "industries", "credits", "portfolio_links", "years_experience"},
        "professional_resume": common | {"career_history", "credits", "awards", "certifications", "languages", "industries", "years_experience", "expertise", "bio"},
        "press_kit":        common | {"bio", "awards", "credits", "current_projects", "portfolio_links", "professional_links", "disciplines"},
        "institution_review": common | {"program", "institution", "graduation_year", "career_readiness", "achievements", "skills"},
        "private_review":   common | {"program", "institution", "career_readiness", "achievements", "skills", "goals"},
    }
    keep = presets.get(kind, common)
    if extra_fields:
        keep = keep | set(extra_fields)
    return {k: v for k, v in subject.items() if k in keep}
