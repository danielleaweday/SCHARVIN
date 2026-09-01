"""COHEIR™ — Domain API routes."""
from __future__ import annotations
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from auth import current_user
from models import UserPublic

router = APIRouter(tags=["domain"])


# ─────────────────────────────────────────────────────────────────────────────
# Directory & Professionals
# ─────────────────────────────────────────────────────────────────────────────

PROFESSIONAL_ROLES = {
    "faculty", "adjunct_faculty", "department_chair", "advisor",
    "mentor", "artist", "songwriter", "producer", "engineer",
    "creative_director", "attorney", "publisher", "manager", "agent",
    "employer", "entrepreneur", "guest_lecturer", "researcher",
}


@router.get("/professionals")
async def list_professionals(
    request: Request,
    q: Optional[str] = None,
    discipline: Optional[str] = None,
    role: Optional[str] = None,
    location: Optional[str] = None,
    limit: int = 60,
    user: UserPublic = Depends(current_user),
):
    db = request.app.state.db
    query: dict = {"role": {"$in": list(PROFESSIONAL_ROLES)}}
    if role:
        query["role"] = role
    if discipline:
        query["disciplines"] = {"$in": [discipline]}
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"title": {"$regex": q, "$options": "i"}},
            {"company": {"$regex": q, "$options": "i"}},
            {"expertise": {"$regex": q, "$options": "i"}},
            {"disciplines": {"$regex": q, "$options": "i"}},
        ]
    docs = await db.users.find(query, {"_id": 0, "password_hash": 0}).limit(limit).to_list(limit)
    return docs


@router.get("/professionals/featured")
async def featured_professionals(request: Request, limit: int = 6,
                                 user: UserPublic = Depends(current_user)):
    db = request.app.state.db
    docs = await db.users.find(
        {"role": {"$in": ["producer", "songwriter", "engineer", "creative_director", "attorney", "publisher"]},
         "verified": True},
        {"_id": 0, "password_hash": 0},
    ).limit(limit).to_list(limit)
    return docs


@router.get("/professionals/{user_id}")
async def get_professional(user_id: str, request: Request,
                           user: UserPublic = Depends(current_user)):
    db = request.app.state.db
    doc = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Professional not found")
    return doc


# ─────────────────────────────────────────────────────────────────────────────
# Students & Supervision
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/students")
async def list_students(
    request: Request,
    q: Optional[str] = None,
    cohort_id: Optional[str] = None,
    program: Optional[str] = None,
    limit: int = 60,
    user: UserPublic = Depends(current_user),
):
    db = request.app.state.db
    query: dict = {"role": "student"}
    if cohort_id:
        query["cohort_id"] = cohort_id
    if program:
        query["program"] = program
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"program": {"$regex": q, "$options": "i"}},
            {"skills": {"$regex": q, "$options": "i"}},
            {"location": {"$regex": q, "$options": "i"}},
        ]
    docs = await db.users.find(query, {"_id": 0, "password_hash": 0}).limit(limit).to_list(limit)
    return docs


@router.get("/students/{user_id}")
async def get_student(user_id: str, request: Request,
                      user: UserPublic = Depends(current_user)):
    db = request.app.state.db
    doc = await db.users.find_one({"user_id": user_id, "role": "student"},
                                  {"_id": 0, "password_hash": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Student not found")
    reviews = await db.reviews.find({"student_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(30)
    recs = await db.recommendations.find({"student_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(30)
    doc["reviews"] = reviews
    doc["recommendations"] = recs
    return doc


@router.get("/supervision/mine")
async def my_supervised_students(request: Request, user: UserPublic = Depends(current_user)):
    db = request.app.state.db
    # A student is "supervised" by a professional if the pro is in the student's mentor_ids
    # OR the pro leads a cohort/team that contains the student.
    docs = await db.users.find(
        {"role": "student", "mentor_ids": user.user_id},
        {"_id": 0, "password_hash": 0},
    ).to_list(50)
    return docs


# ─────────────────────────────────────────────────────────────────────────────
# Cohorts
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/cohorts")
async def list_cohorts(request: Request, user: UserPublic = Depends(current_user)):
    db = request.app.state.db
    return await db.cohorts.find({}, {"_id": 0}).sort("year", -1).to_list(60)


@router.get("/cohorts/{cohort_id}")
async def get_cohort(cohort_id: str, request: Request, user: UserPublic = Depends(current_user)):
    db = request.app.state.db
    doc = await db.cohorts.find_one({"id": cohort_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Cohort not found")
    # hydrate students + mentors
    students = await db.users.find(
        {"user_id": {"$in": doc.get("student_ids", [])}},
        {"_id": 0, "password_hash": 0}).to_list(200)
    mentors = await db.users.find(
        {"user_id": {"$in": doc.get("mentor_ids", [])}},
        {"_id": 0, "password_hash": 0}).to_list(50)
    doc["students"] = students
    doc["mentors"] = mentors
    return doc


# ─────────────────────────────────────────────────────────────────────────────
# Sessions
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/sessions")
async def list_sessions(
    request: Request,
    kind: Optional[str] = None,
    cohort_id: Optional[str] = None,
    upcoming: bool = False,
    limit: int = 60,
    user: UserPublic = Depends(current_user),
):
    db = request.app.state.db
    query: dict = {}
    if kind:
        query["kind"] = kind
    if cohort_id:
        query["cohort_id"] = cohort_id
    docs = await db.sessions.find(query, {"_id": 0}).sort("start", 1).limit(limit).to_list(limit)
    return docs


@router.get("/sessions/upcoming")
async def upcoming_sessions(request: Request, limit: int = 6,
                            user: UserPublic = Depends(current_user)):
    db = request.app.state.db
    docs = await db.sessions.find(
        {"status": {"$in": ["scheduled", "live"]}}, {"_id": 0},
    ).sort("start", 1).limit(limit).to_list(limit)
    return docs


@router.get("/sessions/{session_id}")
async def get_session(session_id: str, request: Request,
                      user: UserPublic = Depends(current_user)):
    db = request.app.state.db
    doc = await db.sessions.find_one({"id": session_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Session not found")
    attendees = await db.users.find(
        {"user_id": {"$in": doc.get("attendee_ids", [])}},
        {"_id": 0, "password_hash": 0}).to_list(200)
    doc["attendees"] = attendees
    return doc


# ─────────────────────────────────────────────────────────────────────────────
# Reviews
# ─────────────────────────────────────────────────────────────────────────────

class ReviewCreate(BaseModel):
    student_id: str
    scores: dict
    comments: str
    recommendations: str
    growth_plan: str
    session_id: Optional[str] = None


@router.get("/reviews")
async def list_reviews(request: Request, student_id: Optional[str] = None,
                       user: UserPublic = Depends(current_user)):
    db = request.app.state.db
    query = {}
    if student_id:
        query["student_id"] = student_id
    return await db.reviews.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)


@router.post("/reviews")
async def create_review(body: ReviewCreate, request: Request,
                        user: UserPublic = Depends(current_user)):
    db = request.app.state.db
    from models import Review
    r = Review(
        student_id=body.student_id, reviewer_id=user.user_id, reviewer_name=user.name,
        scores=body.scores, comments=body.comments, recommendations=body.recommendations,
        growth_plan=body.growth_plan, session_id=body.session_id,
    )
    doc = r.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.reviews.insert_one(doc.copy())
    doc.pop("_id", None)
    # Also drop a notification for the student
    from models import Notification
    n = Notification(
        user_id=body.student_id, kind="feedback",
        title=f"New review from {user.name}",
        body="Your ANCRID™ has been updated with a new Professional Review.",
        link="/reviews",
    ).model_dump()
    n["created_at"] = n["created_at"].isoformat()
    await db.notifications.insert_one(n.copy())
    return doc


# ─────────────────────────────────────────────────────────────────────────────
# Opportunities
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/opportunities")
async def list_opportunities(request: Request, kind: Optional[str] = None,
                             user: UserPublic = Depends(current_user)):
    db = request.app.state.db
    query = {}
    if kind:
        query["kind"] = kind
    return await db.opportunities.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)


class ApplyBody(BaseModel):
    opportunity_id: str


@router.post("/opportunities/apply")
async def apply_opportunity(body: ApplyBody, request: Request,
                            user: UserPublic = Depends(current_user)):
    db = request.app.state.db
    await db.opportunities.update_one(
        {"id": body.opportunity_id},
        {"$addToSet": {"applicant_ids": user.user_id}},
    )
    return {"ok": True}


# ─────────────────────────────────────────────────────────────────────────────
# Recommendations
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/recommendations")
async def list_recommendations(request: Request, student_id: Optional[str] = None,
                               user: UserPublic = Depends(current_user)):
    db = request.app.state.db
    query = {}
    if student_id:
        query["student_id"] = student_id
    return await db.recommendations.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)


class RecommendationCreate(BaseModel):
    student_id: str
    for_type: str
    target: str
    narrative: str


@router.post("/recommendations")
async def create_recommendation(body: RecommendationCreate, request: Request,
                                user: UserPublic = Depends(current_user)):
    db = request.app.state.db
    from models import Recommendation
    r = Recommendation(
        student_id=body.student_id, recommender_id=user.user_id,
        recommender_name=user.name, for_type=body.for_type, target=body.target,
        narrative=body.narrative,
    )
    doc = r.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.recommendations.insert_one(doc.copy())
    doc.pop("_id", None)
    return doc


# ─────────────────────────────────────────────────────────────────────────────
# Creative Teams
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/creative-teams")
async def list_teams(request: Request, user: UserPublic = Depends(current_user)):
    db = request.app.state.db
    return await db.creative_teams.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)


@router.get("/creative-teams/{team_id}")
async def get_team(team_id: str, request: Request, user: UserPublic = Depends(current_user)):
    db = request.app.state.db
    doc = await db.creative_teams.find_one({"id": team_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Team not found")
    return doc


# ─────────────────────────────────────────────────────────────────────────────
# Calendar
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/calendar")
async def list_calendar(request: Request, user: UserPublic = Depends(current_user)):
    db = request.app.state.db
    return await db.calendar_events.find({}, {"_id": 0}).sort("start", 1).to_list(200)


# ─────────────────────────────────────────────────────────────────────────────
# Messaging
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/threads")
async def list_threads(request: Request, user: UserPublic = Depends(current_user)):
    db = request.app.state.db
    return await db.threads.find(
        {"participant_ids": user.user_id}, {"_id": 0},
    ).sort("last_at", -1).to_list(50)


@router.get("/threads/all")
async def list_all_threads(request: Request, user: UserPublic = Depends(current_user)):
    db = request.app.state.db
    return await db.threads.find({}, {"_id": 0}).sort("last_at", -1).to_list(50)


@router.get("/threads/{thread_id}/messages")
async def list_messages(thread_id: str, request: Request,
                        user: UserPublic = Depends(current_user)):
    db = request.app.state.db
    return await db.messages.find({"thread_id": thread_id}, {"_id": 0}).sort("created_at", 1).to_list(500)


class MessageCreate(BaseModel):
    thread_id: str
    body: str


@router.post("/threads/messages")
async def create_message(body: MessageCreate, request: Request,
                         user: UserPublic = Depends(current_user)):
    db = request.app.state.db
    from models import Message
    m = Message(
        thread_id=body.thread_id, sender_id=user.user_id,
        sender_name=user.name, body=body.body, kind="direct",
    )
    doc = m.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.messages.insert_one(doc.copy())
    doc.pop("_id", None)
    from datetime import datetime, timezone
    await db.threads.update_one(
        {"id": body.thread_id},
        {"$set": {"last_message": body.body[:120],
                  "last_at": datetime.now(timezone.utc).isoformat()}},
    )
    return doc


# ─────────────────────────────────────────────────────────────────────────────
# Resources
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/resources")
async def list_resources(request: Request, kind: Optional[str] = None,
                         user: UserPublic = Depends(current_user)):
    db = request.app.state.db
    query = {}
    if kind:
        query["kind"] = kind
    return await db.resources.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)


# ─────────────────────────────────────────────────────────────────────────────
# Notifications
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/notifications")
async def list_notifications(request: Request, user: UserPublic = Depends(current_user)):
    db = request.app.state.db
    return await db.notifications.find(
        {"user_id": user.user_id}, {"_id": 0}).sort("created_at", -1).to_list(50)


@router.post("/notifications/{notif_id}/read")
async def mark_read(notif_id: str, request: Request, user: UserPublic = Depends(current_user)):
    db = request.app.state.db
    await db.notifications.update_one(
        {"id": notif_id, "user_id": user.user_id}, {"$set": {"read": True}})
    return {"ok": True}


# ─────────────────────────────────────────────────────────────────────────────
# Dashboard aggregate
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/dashboard/overview")
async def dashboard_overview(request: Request, user: UserPublic = Depends(current_user)):
    db = request.app.state.db
    upcoming = await db.sessions.find(
        {"status": {"$in": ["scheduled", "live"]}}, {"_id": 0},
    ).sort("start", 1).limit(4).to_list(4)
    opps = await db.opportunities.find({}, {"_id": 0}).sort("created_at", -1).limit(4).to_list(4)
    recs = await db.recommendations.find({}, {"_id": 0}).sort("created_at", -1).limit(4).to_list(4)
    reviews = await db.reviews.find({}, {"_id": 0}).sort("created_at", -1).limit(4).to_list(4)
    threads = await db.threads.find(
        {"participant_ids": user.user_id}, {"_id": 0},
    ).sort("last_at", -1).limit(4).to_list(4)
    notifs = await db.notifications.find(
        {"user_id": user.user_id, "read": False}, {"_id": 0},
    ).sort("created_at", -1).limit(10).to_list(10)

    # supervised (if pro)
    supervised = []
    if user.role != "student":
        supervised = await db.users.find(
            {"role": "student", "mentor_ids": user.user_id},
            {"_id": 0, "password_hash": 0}).limit(8).to_list(8)

    # cohorts (if pro is lead / member; else student's cohort)
    cohorts_q: dict = {}
    if user.role == "student":
        cohorts_q = {"student_ids": user.user_id}
    else:
        cohorts_q = {"$or": [{"mentor_ids": user.user_id}, {"faculty_lead_id": user.user_id}]}
    cohorts = await db.cohorts.find(cohorts_q, {"_id": 0}).limit(6).to_list(6)

    stats = {
        "industry_professionals": await db.users.count_documents({"role": {"$in": list(PROFESSIONAL_ROLES)}}),
        "expert_categories": len(await db.users.distinct("disciplines")),
        "countries": len({(u.get("location") or "").split(",")[-1].strip() for u in
                          await db.users.find({}, {"location": 1, "_id": 0}).to_list(500)
                          if u.get("location")}),
        "active_mentorships": await db.users.count_documents({"mentor_ids": {"$exists": True, "$not": {"$size": 0}}}),
    }

    return {
        "upcoming_sessions": upcoming,
        "opportunities": opps,
        "recommendations": recs,
        "reviews": reviews,
        "threads": threads,
        "notifications": notifs,
        "supervised_students": supervised,
        "cohorts": cohorts,
        "stats": stats,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Institution / Employer
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/institution/overview")
async def institution_overview(request: Request, user: UserPublic = Depends(current_user)):
    db = request.app.state.db
    stats = {
        "students": await db.users.count_documents({"role": "student"}),
        "faculty": await db.users.count_documents({"role": {"$in": ["faculty", "adjunct_faculty", "department_chair"]}}),
        "mentors": await db.users.count_documents({"role": {"$in": ["mentor", "producer", "engineer", "songwriter", "creative_director", "attorney", "publisher", "manager", "agent"]}}),
        "cohorts": await db.cohorts.count_documents({}),
        "sessions_upcoming": await db.sessions.count_documents({"status": {"$in": ["scheduled", "live"]}}),
        "opportunities_open": await db.opportunities.count_documents({"status": "open"}),
        "reviews_logged": await db.reviews.count_documents({}),
        "recommendations": await db.recommendations.count_documents({}),
    }
    programs = await db.cohorts.distinct("program")
    return {"stats": stats, "programs": programs}
