"""ANCRLaunch™ — Career placement and professional transition platform.

Part of the ANCR™ Ecosystem. Consumes verified data from every module and
assembles it into a professional career center. No duplication.
"""
from __future__ import annotations

import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from fastapi import APIRouter, Depends, FastAPI, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorClient
from starlette.middleware.cors import CORSMiddleware

from auth import (
    create_token,
    get_current_ancrid,
    hash_password,
    require_roles,
    verify_password,
)
from coach import stream_reply, summarize_context
from ecosystem import Ecosystem
from models import (
    ApplicationCreate,
    ApplicationStageUpdate,
    CoachSendRequest,
    LoginRequest,
    LoginResponse,
    ResumeUpdate,
)
from scoring import compute_readiness
from seed import seed_all

# ------------------------------------------------------------------ setup
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
mongo = AsyncIOMotorClient(MONGO_URL)
db = mongo[DB_NAME]
ecosystem = Ecosystem(db)

app = FastAPI(title="ANCRLaunch API", version="1.0.0")
api = APIRouter(prefix="/api")

logger = logging.getLogger("ancrlaunch")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _new_id() -> str:
    return str(uuid.uuid4())


def _safe_user(doc: Dict[str, Any]) -> Dict[str, Any]:
    return {k: v for k, v in doc.items() if k not in ("password_hash", "_id")}


# ------------------------------------------------------------------ health
@api.get("/")
async def root():
    return {"service": "ANCRLaunch", "version": "1.0.0", "tagline": "Learn. Graduate. Launch."}


@api.get("/health")
async def health():
    await db.command("ping")
    return {"ok": True, "time": _now_iso()}


# ------------------------------------------------------------------ auth
@api.post("/auth/login", response_model=LoginResponse)
async def login(body: LoginRequest):
    user = await db.users.find_one({"email": body.email.lower()}, {"_id": 0})
    if not user:
        user = await db.users.find_one({"email": body.email}, {"_id": 0})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid ANCRID credentials")
    token = create_token(user["ancrid"], user["role"], user["email"])
    return LoginResponse(token=token, user=_safe_user(user))


@api.get("/auth/me")
async def me(current=Depends(get_current_ancrid)):
    user = await db.users.find_one({"ancrid": current["ancrid"]}, {"_id": 0})
    if not user:
        raise HTTPException(404, "ANCRID identity not found")
    return _safe_user(user)


@api.get("/auth/demo-accounts")
async def demo_accounts():
    users = await db.users.find({}, {"_id": 0}).to_list(50)
    return [
        {
            "email": u["email"],
            "role": u["role"],
            "full_name": u["full_name"],
            "discipline": u.get("discipline"),
            "institution": u.get("institution"),
            "avatar_url": u.get("avatar_url"),
        }
        for u in users
    ]


# ------------------------------------------------------------------ portfolio (assembled)
@api.get("/portfolio")
async def get_own_portfolio(current=Depends(get_current_ancrid)):
    return await ecosystem.assemble_portfolio(current["ancrid"])


@api.get("/portfolio/{ancrid}")
async def get_portfolio(ancrid: str, current=Depends(get_current_ancrid)):
    return await ecosystem.assemble_portfolio(ancrid)


# ------------------------------------------------------------------ readiness
def _resume_completion(resume: Optional[Dict[str, Any]]) -> int:
    if not resume:
        return 0
    fields = [
        bool(resume.get("professional_summary")),
        bool(resume.get("career_objective")),
        bool(resume.get("skills")),
        bool(resume.get("employment")),
        bool(resume.get("education")),
        bool(resume.get("awards")),
    ]
    return int(round(sum(fields) / len(fields) * 100))


async def _readiness_for(ancrid: str) -> Dict[str, Any]:
    portfolio = await ecosystem.assemble_portfolio(ancrid)
    resume = await db.resumes.find_one({"ancrid": ancrid}, {"_id": 0})
    completion = _resume_completion(resume)
    interviews = await db.interviews.count_documents({"ancrid": ancrid})
    interview_ready = min(100, 40 + interviews * 20)
    return compute_readiness(portfolio, completion, interview_ready)


@api.get("/readiness")
async def readiness(current=Depends(get_current_ancrid)):
    return await _readiness_for(current["ancrid"])


@api.get("/readiness/{ancrid}")
async def readiness_for(ancrid: str, current=Depends(get_current_ancrid)):
    return await _readiness_for(ancrid)


# ------------------------------------------------------------------ resume
@api.get("/resume")
async def get_resume(current=Depends(get_current_ancrid)):
    resume = await db.resumes.find_one({"ancrid": current["ancrid"]}, {"_id": 0})
    if not resume:
        portfolio = await ecosystem.assemble_portfolio(current["ancrid"])
        identity = portfolio.get("identity") or {}
        resume = {
            "id": _new_id(),
            "ancrid": current["ancrid"],
            "professional_summary": identity.get("biography", ""),
            "career_objective": "",
            "skills": [],
            "employment": [],
            "education": [
                {"institution": identity.get("institution"), "credential": identity.get("discipline"), "year": identity.get("graduation_year")}
            ] if identity.get("institution") else [],
            "awards": [],
            "updated_at": _now_iso(),
        }
        await db.resumes.insert_one(dict(resume))
    resume["completion"] = _resume_completion(resume)
    return resume


@api.put("/resume")
async def update_resume(body: ResumeUpdate, current=Depends(get_current_ancrid)):
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    updates["updated_at"] = _now_iso()
    await db.resumes.update_one({"ancrid": current["ancrid"]}, {"$set": updates}, upsert=True)
    resume = await db.resumes.find_one({"ancrid": current["ancrid"]}, {"_id": 0})
    resume["completion"] = _resume_completion(resume)
    return resume


# ------------------------------------------------------------------ opportunities
@api.get("/opportunities")
async def list_opportunities(
    kind: Optional[str] = None,
    category: Optional[str] = None,
    country: Optional[str] = None,
    remote: Optional[bool] = None,
    q: Optional[str] = None,
    current=Depends(get_current_ancrid),
):
    query: Dict[str, Any] = {}
    if kind:
        query["kind"] = kind
    if category:
        query["category"] = category
    if country:
        query["country"] = country
    if remote is not None:
        query["remote"] = remote
    if q:
        query["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"employer": {"$regex": q, "$options": "i"}},
            {"summary": {"$regex": q, "$options": "i"}},
        ]
    return await db.opportunities.find(query, {"_id": 0}).to_list(500)


@api.get("/opportunities/{opp_id}")
async def get_opportunity(opp_id: str, current=Depends(get_current_ancrid)):
    opp = await db.opportunities.find_one({"id": opp_id}, {"_id": 0})
    if not opp:
        raise HTTPException(404, "Opportunity not found")
    return opp


# ------------------------------------------------------------------ employer network
@api.get("/employers")
async def list_employers(current=Depends(get_current_ancrid)):
    return await db.employers.find({}, {"_id": 0}).to_list(200)


@api.get("/employers/candidates")
async def search_candidates(
    discipline: Optional[str] = None,
    country: Optional[str] = None,
    institution: Optional[str] = None,
    graduation_year: Optional[int] = None,
    min_readiness: Optional[int] = None,
    current=Depends(require_roles(
        "employer", "recruiter", "industry_partner",
        "career_services", "administrator", "faculty",
    )),
):
    q: Dict[str, Any] = {"role": {"$in": ["student", "graduate"]}}
    if discipline:
        q["discipline"] = {"$regex": discipline, "$options": "i"}
    if country:
        q["country"] = country
    if institution:
        q["institution"] = {"$regex": institution, "$options": "i"}
    if graduation_year:
        q["graduation_year"] = graduation_year

    users = await db.users.find(q, {"_id": 0, "password_hash": 0}).to_list(200)
    results = []
    for u in users:
        rscore = await _readiness_for(u["ancrid"])
        if min_readiness and rscore["overall"] < min_readiness:
            continue
        rep = await db.coheir_reputation.find_one({"ancrid": u["ancrid"]}, {"_id": 0})
        results.append({
            **u,
            "readiness_overall": rscore["overall"],
            "readiness_tier": rscore["tier"],
            "reputation_score": (rep or {}).get("score", 0),
        })
    results.sort(key=lambda r: r["readiness_overall"], reverse=True)
    return results


# ------------------------------------------------------------------ applications
@api.get("/applications")
async def list_applications(current=Depends(get_current_ancrid)):
    apps = await db.applications.find({"ancrid": current["ancrid"]}, {"_id": 0}).to_list(500)
    apps.sort(key=lambda a: a.get("updated_at", ""), reverse=True)
    return apps


@api.post("/applications")
async def create_application(body: ApplicationCreate, current=Depends(get_current_ancrid)):
    opp = await db.opportunities.find_one({"id": body.opportunity_id}, {"_id": 0})
    if not opp:
        raise HTTPException(404, "Opportunity not found")
    existing = await db.applications.find_one({"ancrid": current["ancrid"], "opportunity_id": body.opportunity_id})
    if existing:
        raise HTTPException(409, "Already applied to this opportunity")
    doc = {
        "id": _new_id(),
        "ancrid": current["ancrid"],
        "opportunity_id": opp["id"],
        "opportunity_title": opp["title"],
        "employer": opp["employer"],
        "stage": "applied",
        "note": body.note,
        "applied_at": _now_iso(),
        "updated_at": _now_iso(),
    }
    await db.applications.insert_one(dict(doc))
    return doc


@api.patch("/applications/{app_id}")
async def update_application(app_id: str, body: ApplicationStageUpdate, current=Depends(get_current_ancrid)):
    app_doc = await db.applications.find_one({"id": app_id, "ancrid": current["ancrid"]}, {"_id": 0})
    if not app_doc:
        raise HTTPException(404, "Application not found")
    await db.applications.update_one(
        {"id": app_id},
        {"$set": {"stage": body.stage, "updated_at": _now_iso()}},
    )
    app_doc.update({"stage": body.stage, "updated_at": _now_iso()})
    return app_doc


# ------------------------------------------------------------------ interviews
@api.get("/interviews")
async def list_interviews(current=Depends(get_current_ancrid)):
    items = await db.interviews.find({"ancrid": current["ancrid"]}, {"_id": 0}).to_list(200)
    items.sort(key=lambda i: i.get("when", ""))
    return items


# ------------------------------------------------------------------ graduate outcomes
@api.get("/graduate-outcomes")
async def list_outcomes(current=Depends(get_current_ancrid)):
    outcomes = await db.graduate_outcomes.find({}, {"_id": 0}).to_list(500)
    stats: Dict[str, int] = {}
    for o in outcomes:
        stats[o["outcome_type"]] = stats.get(o["outcome_type"], 0) + 1
    return {"outcomes": outcomes, "stats": stats, "total": len(outcomes)}


# ------------------------------------------------------------------ dashboard
def _portfolio_completion(portfolio: Dict[str, Any]) -> int:
    checks = [
        bool(portfolio.get("biography")),
        bool(portfolio.get("projects")),
        bool(portfolio.get("media")),
        bool(portfolio.get("publishing")),
        bool(portfolio.get("creator_passport")),
        bool(portfolio.get("booking_packet")),
        bool(portfolio.get("faculty_recommendations")),
        bool(portfolio.get("industry_recommendations")),
    ]
    return int(round(sum(checks) / len(checks) * 100))


def _count_by(items: List[Dict[str, Any]], key: str) -> Dict[str, int]:
    out: Dict[str, int] = {}
    for i in items:
        v = i.get(key, "unknown")
        out[v] = out.get(v, 0) + 1
    return out


async def _employer_interest(ancrid: str) -> List[Dict[str, Any]]:
    apps = await db.applications.find(
        {"ancrid": ancrid, "stage": {"$in": ["interview", "offer"]}}, {"_id": 0}
    ).to_list(50)
    return [{"employer": a["employer"], "role": a["opportunity_title"], "stage": a["stage"]} for a in apps]


def _career_timeline(portfolio, applications, interviews):
    events = []
    for p in portfolio.get("projects") or []:
        events.append({"date": str(p.get("year")), "kind": "project", "label": p.get("title")})
    for m in portfolio.get("media") or []:
        events.append({"date": str(m.get("year")), "kind": "release", "label": m.get("title")})
    for a in applications:
        events.append({"date": a.get("applied_at", "")[:10], "kind": "application", "label": f"Applied — {a['opportunity_title']}"})
    for i in interviews:
        events.append({"date": (i.get("when") or "")[:10], "kind": "interview", "label": f"{i['role']} @ {i['employer']}"})
    events.sort(key=lambda e: e["date"], reverse=True)
    return events[:12]


@api.get("/dashboard")
async def dashboard(current=Depends(get_current_ancrid)):
    ancrid = current["ancrid"]
    portfolio = await ecosystem.assemble_portfolio(ancrid)
    rscore = await _readiness_for(ancrid)
    resume = await db.resumes.find_one({"ancrid": ancrid}, {"_id": 0})
    applications = await db.applications.find({"ancrid": ancrid}, {"_id": 0}).to_list(200)
    interviews = await db.interviews.find({"ancrid": ancrid}, {"_id": 0}).to_list(50)
    recent_opps = await db.opportunities.find({}, {"_id": 0}).sort("posted_at", -1).to_list(6)
    recommended = await db.opportunities.find({}, {"_id": 0}).to_list(20)
    disc = ((portfolio.get("identity") or {}).get("discipline") or "").lower()
    recommended.sort(
        key=lambda o: (disc in (o.get("discipline", "").lower() + " " + o.get("summary", "").lower())),
        reverse=True,
    )
    return {
        "readiness": rscore,
        "portfolio_completion": _portfolio_completion(portfolio),
        "resume": {
            "exists": bool(resume),
            "completion": _resume_completion(resume),
            "updated_at": (resume or {}).get("updated_at"),
        },
        "publishing_summary": {
            "works": len(portfolio.get("publishing") or []),
            "releases": len(portfolio.get("media") or []),
        },
        "professional_reputation": portfolio.get("reputation") or {},
        "applications": {
            "total": len(applications),
            "by_stage": _count_by(applications, "stage"),
            "recent": sorted(applications, key=lambda a: a.get("updated_at", ""), reverse=True)[:5],
        },
        "upcoming_interviews": sorted(
            [i for i in interviews if i.get("status") == "scheduled"],
            key=lambda i: i.get("when", ""),
        )[:5],
        "recommended_opportunities": recommended[:6],
        "recent_opportunities": recent_opps,
        "employer_interest": await _employer_interest(ancrid),
        "career_timeline": _career_timeline(portfolio, applications, interviews),
    }


# ------------------------------------------------------------------ AIAH coach
@api.get("/coach/messages")
async def coach_history(session_id: str = Query(...), current=Depends(get_current_ancrid)):
    msgs = await db.coach_messages.find(
        {"ancrid": current["ancrid"], "session_id": session_id}, {"_id": 0}
    ).to_list(500)
    msgs.sort(key=lambda m: m["created_at"])
    return msgs


@api.get("/coach/sessions")
async def coach_sessions(current=Depends(get_current_ancrid)):
    pipeline = [
        {"$match": {"ancrid": current["ancrid"]}},
        {"$sort": {"created_at": 1}},
        {"$group": {
            "_id": "$session_id",
            "last": {"$last": "$content"},
            "when": {"$last": "$created_at"},
            "count": {"$sum": 1},
        }},
        {"$sort": {"when": -1}},
        {"$limit": 25},
    ]
    sessions = await db.coach_messages.aggregate(pipeline).to_list(25)
    return [{
        "session_id": s["_id"],
        "preview": (s.get("last") or "")[:80],
        "when": s["when"],
        "message_count": s["count"],
    } for s in sessions]


@api.post("/coach/stream")
async def coach_stream(body: CoachSendRequest, current=Depends(get_current_ancrid)):
    session_id = body.session_id or _new_id()
    ancrid = current["ancrid"]

    await db.coach_messages.insert_one({
        "id": _new_id(),
        "session_id": session_id,
        "ancrid": ancrid,
        "role": "user",
        "content": body.message,
        "created_at": _now_iso(),
    })

    portfolio = await ecosystem.assemble_portfolio(ancrid)
    rscore = await _readiness_for(ancrid)
    ctx = summarize_context(portfolio, rscore)

    async def event_gen():
        yield f"event: session\ndata: {session_id}\n\n"
        buf: List[str] = []
        try:
            async for chunk in stream_reply(session_id, body.message, ecosystem_context=ctx):
                if not chunk:
                    continue
                buf.append(chunk)
                safe = chunk.replace("\r", "").replace("\n", "\\n")
                yield f"data: {safe}\n\n"
        except Exception as exc:
            logger.exception("AIAH stream error: %s", exc)
            yield f"event: error\ndata: {str(exc)}\n\n"
        finally:
            full = "".join(buf).strip()
            if full:
                await db.coach_messages.insert_one({
                    "id": _new_id(),
                    "session_id": session_id,
                    "ancrid": ancrid,
                    "role": "assistant",
                    "content": full,
                    "created_at": _now_iso(),
                })
            yield "event: done\ndata: [DONE]\n\n"

    return StreamingResponse(
        event_gen(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# ------------------------------------------------------------------ admin / seed
@api.post("/admin/seed")
async def run_seed(current=Depends(require_roles("administrator"))):
    await seed_all(db)
    return {"seeded": True, "at": _now_iso()}


@api.get("/admin/stats")
async def admin_stats(current=Depends(require_roles("administrator", "career_services"))):
    return {
        "users": await db.users.count_documents({}),
        "opportunities": await db.opportunities.count_documents({}),
        "applications": await db.applications.count_documents({}),
        "interviews": await db.interviews.count_documents({}),
        "employers": await db.employers.count_documents({}),
        "graduate_outcomes": await db.graduate_outcomes.count_documents({}),
    }


# ------------------------------------------------------------------ boot
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    count = await db.users.count_documents({})
    if count == 0:
        logger.info("Seeding ANCRLaunch demonstration data...")
        await seed_all(db)
        logger.info("Seed complete.")


@app.on_event("shutdown")
async def on_shutdown():
    mongo.close()
