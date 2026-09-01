"""CYNAIAH backend — FastAPI + MongoDB.

All routes prefixed with /api. Structured for future ANCRID SSO swap.
"""
from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

import jwt
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, FastAPI, File, Form, HTTPException, Query, Request, UploadFile, status
from fastapi.responses import FileResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from motor.motor_asyncio import AsyncIOMotorClient
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# JWT config (mirrors auth.py) — used for the admin-credentials-check path in
# /auth/register so we don't add a second dependency on the auth module.
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALG = os.environ.get("JWT_ALG", "HS256")

from auth import (  # noqa: E402
    create_access_token,
    get_current_user_claims,
    get_current_user_id,
    hash_password,
    require_faculty,
    verify_password,
)

import ancr_notifications as ancr  # noqa: E402
from ancr_notifications import (  # noqa: E402
    ANCR_NOTIFICATIONS_ENABLED,
    AncrBusSink,
    Dispatcher,
    LocalBellSink,
    REVIEW_KIND_TO_EVENT,
    resolve_deep_link,
)

# Lazy dispatcher — constructed on first use so we can attach the DB insert fn.
_notification_dispatcher: Optional[Dispatcher] = None


def _get_notification_dispatcher() -> Dispatcher:
    global _notification_dispatcher
    if _notification_dispatcher is None:
        async def _insert(doc: dict) -> None:
            await db.notifications.insert_one(doc)

        _notification_dispatcher = Dispatcher(
            sinks=[
                LocalBellSink(insert_fn=_insert),
                AncrBusSink(enabled=ANCR_NOTIFICATIONS_ENABLED),
            ]
        )
    return _notification_dispatcher
from models import (  # noqa: E402
    APPROVAL_STATUSES,
    Asset,
    CalendarEvent,
    Caption,
    CharacterProfile,
    CharacterProfileCreate,
    CharacterProfileUpdate,
    CharacterReferenceGen,
    Checklist,
    Course,
    CreditLine,
    DEFAULT_ACCESSIBILITY_ITEMS,
    DEFAULT_DELIVERY_ITEMS,
    EDIT_STAGES,
    EditVersion,
    Enrollment,
    Feedback,
    FinishingNote,
    ImageGenRequest,
    LoginPayload,
    MusicTrack,
    MusicTrackUpsert,
    Notification,
    PortfolioItem,
    Project,
    ProjectCreate,
    ProjectUpdate,
    RightsRecord,
    ScriptCreate,
    ScriptDocument,
    ScriptGenRequest,
    StoryboardFrame,
    StoryboardFrameCreate,
    StoryboardFrameUpdate,
    SyncCue,
    SyncCueCreate,
    SyncCueUpdate,
    TokenResponse,
    UserCreate,
    UserDB,
    UserPublic,
    _now_iso,
    _uid,
)
from seed_data import (  # noqa: E402
    DEMO_STUDENT_EMAIL,
    DEMO_STUDENT_PASSWORD,
    ensure_seed,
)
import ai_service  # noqa: E402
from callsheet_pdf import render_call_sheet_pdf  # noqa: E402
from fastapi.responses import Response  # noqa: E402

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s :: %(message)s")
logger = logging.getLogger("cynaiah")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="CYNAIAH API", version="0.1.0")
api = APIRouter(prefix="/api")


# ---------- helpers ----------
def _strip(doc: Optional[dict]) -> Optional[dict]:
    if doc is None:
        return None
    doc.pop("_id", None)
    return doc


async def _load_user_public(user_id: str) -> UserPublic:
    doc = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not doc:
        raise HTTPException(404, "User not found")
    return UserPublic(**doc)


# ---------- system ----------
@api.get("/")
async def root():
    return {"service": "CYNAIAH", "tagline": "Vision | Story | Impact", "version": "0.1.0"}


@api.get("/health")
async def health():
    return {"status": "ok"}


@api.get("/environment")
async def environment():
    """Public safety-signal for consumers: is this instance in demo or production?

    Exposes ONLY non-sensitive posture — no credentials, no secrets. The frontend
    and downstream integrations use this to badge demo instances so the well-
    known demo admin credentials never get mistaken for a real prod deployment.
    """
    env = (os.environ.get("CYNAIAH_ENV") or "demo").lower()
    admin_password_env = os.environ.get("ADMIN_PASSWORD")
    demo_admin_exists = await db.users.find_one({"email": DEMO_STUDENT_EMAIL.replace("student", "admin")}) is not None
    return {
        "env": env,
        "is_demo": env != "production",
        "demo_admin_active": env != "production" and demo_admin_exists,
        "admin_bootstrap_via_env": bool(admin_password_env and env == "production"),
    }


@api.post("/seed")
async def seed(claims: dict = Depends(get_current_user_claims)):
    """Idempotent — populates demo user, projects, courses, assets.

    Hardened: only a platform_admin session may trigger this. Login/register
    still call `ensure_seed(db)` inline so the demo user always exists — this
    endpoint is only needed for manual reseed by an admin.
    """
    if claims.get("role") != "platform_admin":
        raise HTTPException(403, "platform_admin required to reseed")
    result = await ensure_seed(db)
    return {**result, "demo_email": DEMO_STUDENT_EMAIL, "demo_password": DEMO_STUDENT_PASSWORD}


# ---------- auth ----------
# Which roles a *public* caller may self-assign at registration. Every other
# role must be minted by an admin.
PUBLIC_SELF_REGISTER_ROLES = {"student", "collaborator"}
ADMIN_ROLES = {"institutional_admin", "platform_admin"}
VALID_ROLES = {
    "student", "faculty", "mentor", "collaborator",
    "institutional_admin", "platform_admin",
}
_PASSWORD_MIN_LEN = 8


def _validate_password_strength(password: str) -> None:
    """Reject obviously weak passwords with a clean 400 that surfaces as a
    single readable string in the frontend's existing error handler.
    """
    if not isinstance(password, str) or len(password) < _PASSWORD_MIN_LEN:
        raise HTTPException(400, f"Password must be at least {_PASSWORD_MIN_LEN} characters")
    if not any(c.isalpha() for c in password):
        raise HTTPException(400, "Password must contain at least one letter")
    if not any(c.isdigit() for c in password):
        raise HTTPException(400, "Password must contain at least one number")


# ---- Brute-force protection (persisted in MongoDB so it survives reloads) ----
_MAX_LOGIN_ATTEMPTS = 8
_LOGIN_WINDOW_SECONDS = 300  # 5 minutes


def _login_key(request: Request, email: str) -> str:
    """Combine IP + email so an attacker can't lock out a victim by guessing
    from many IPs, and a single IP guessing many emails is still throttled
    per-email.
    """
    ip = (request.headers.get("x-forwarded-for") or (request.client.host if request.client else "") or "").split(",")[0].strip()
    return f"{ip or 'unknown'}:{email.lower()}"


async def _check_and_record_login_attempt(request: Request, email: str, success: bool) -> None:
    key = _login_key(request, email)
    now_utc = datetime.now(timezone.utc)
    doc = await db.login_attempts.find_one({"identifier": key})

    # If the last failure was outside the window, reset.
    if doc:
        try:
            last = datetime.fromisoformat(doc.get("last_at").replace("Z", "+00:00"))
        except Exception:
            last = now_utc
        if (now_utc - last).total_seconds() > _LOGIN_WINDOW_SECONDS:
            doc = None

    if success:
        # Clear counter on successful login.
        await db.login_attempts.delete_one({"identifier": key})
        return

    if doc and doc.get("count", 0) >= _MAX_LOGIN_ATTEMPTS:
        raise HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS,
            f"Too many failed attempts. Try again in a few minutes.",
        )

    await db.login_attempts.update_one(
        {"identifier": key},
        {
            "$inc": {"count": 1},
            "$set": {"last_at": now_utc.isoformat()},
            "$setOnInsert": {"first_at": now_utc.isoformat(), "identifier": key},
        },
        upsert=True,
    )


async def _ensure_can_pre_login(request: Request, email: str) -> None:
    """Called BEFORE the password check so a locked identifier gets 429 without
    revealing whether the email exists.
    """
    key = _login_key(request, email)
    doc = await db.login_attempts.find_one({"identifier": key})
    if not doc:
        return
    try:
        last = datetime.fromisoformat(doc.get("last_at").replace("Z", "+00:00"))
    except Exception:
        return
    within_window = (datetime.now(timezone.utc) - last).total_seconds() <= _LOGIN_WINDOW_SECONDS
    if within_window and doc.get("count", 0) >= _MAX_LOGIN_ATTEMPTS:
        raise HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS,
            "Too many failed attempts. Try again in a few minutes.",
        )


@api.post("/auth/register", response_model=TokenResponse)
async def register(
    payload: UserCreate,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
):
    """Public registration is hardened against role escalation.

    - Anonymous callers may self-register ONLY as `student` or `collaborator`
    - Every other role requires an existing `platform_admin` or
      `institutional_admin` bearer token
    - Passwords must satisfy `_validate_password_strength`
    """
    if payload.role not in VALID_ROLES:
        raise HTTPException(400, "Invalid role")
    _validate_password_strength(payload.password)

    if payload.role not in PUBLIC_SELF_REGISTER_ROLES:
        # Elevated role — require an admin session.
        if credentials is None or not credentials.credentials:
            raise HTTPException(403, "Elevated roles require an admin session")
        try:
            claims = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALG])
        except jwt.PyJWTError:
            raise HTTPException(401, "Invalid token")
        if claims.get("role") not in ADMIN_ROLES:
            raise HTTPException(403, "Only admins can create elevated accounts")

    existing = await db.users.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(400, "Email already registered")

    user = UserDB(
        email=payload.email.lower(),
        name=payload.name,
        role=payload.role,
        avatar_url=payload.avatar_url,
        bio=payload.bio,
        program=payload.program,
        focus_areas=payload.focus_areas,
        password_hash=hash_password(payload.password),
    )
    await db.users.insert_one(user.model_dump())
    token = create_access_token(user.id, user.email, user.role)
    return TokenResponse(access_token=token, user=UserPublic(**user.model_dump(exclude={"password_hash"})))


@api.post("/auth/login", response_model=TokenResponse)
async def login(payload: LoginPayload, request: Request):
    # Ensure demo seed exists so demo credentials always work
    await ensure_seed(db)
    email = payload.email.lower()
    # Rate-limit BEFORE the password check so we don't reveal existence.
    await _ensure_can_pre_login(request, email)

    doc = await db.users.find_one({"email": email}, {"_id": 0})
    if not doc or not verify_password(payload.password, doc["password_hash"]):
        await _check_and_record_login_attempt(request, email, success=False)
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")

    await _check_and_record_login_attempt(request, email, success=True)
    token = create_access_token(doc["id"], doc["email"], doc["role"])
    user_public = UserPublic(**{k: v for k, v in doc.items() if k != "password_hash"})
    return TokenResponse(access_token=token, user=user_public)


@api.get("/auth/me", response_model=UserPublic)
async def me(user_id: str = Depends(get_current_user_id)):
    return await _load_user_public(user_id)


# ---------- dashboard ----------
@api.get("/dashboard/summary")
async def dashboard_summary(user_id: str = Depends(get_current_user_id)):
    user = await _load_user_public(user_id)
    projects = await db.projects.find({"owner_id": user_id}, {"_id": 0}).to_list(200)
    enrollments = await db.enrollments.find({"user_id": user_id}, {"_id": 0}).to_list(200)
    course_ids = [e["course_id"] for e in enrollments]
    courses = await db.courses.find({"id": {"$in": course_ids}}, {"_id": 0}).to_list(200) if course_ids else []
    events = (
        await db.calendar_events.find({"user_id": user_id}, {"_id": 0}).sort("date", 1).to_list(50)
    )
    notifications = (
        await db.notifications.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(20)
    )
    project_ids = [p["id"] for p in projects]
    feedback = (
        await db.feedback.find({"project_id": {"$in": project_ids}}, {"_id": 0}).sort("created_at", -1).to_list(20)
        if project_ids
        else []
    )
    portfolio = await db.portfolio.find({"user_id": user_id}, {"_id": 0}).to_list(50)
    active = [p for p in projects if p["status"] not in {"completed", "archived"}]

    return {
        "user": user.model_dump(),
        "counts": {
            "active_projects": len(active),
            "total_projects": len(projects),
            "courses_in_progress": len([e for e in enrollments if e["status"] == "in_progress"]),
            "portfolio_items": len(portfolio),
            "unread_notifications": len([n for n in notifications if not n["read"]]),
        },
        "active_projects": active[:6],
        "recent_projects": sorted(projects, key=lambda p: p["updated_at"], reverse=True)[:6],
        "courses": [
            {**c, "progress": next((e["progress"] for e in enrollments if e["course_id"] == c["id"]), 0)}
            for c in courses
        ],
        "upcoming_events": events[:8],
        "notifications": notifications[:8],
        "recent_feedback": feedback[:5],
        "portfolio_preview": portfolio[:4],
    }


# ---------- projects ----------
async def _assert_project_owner(project_id: str, user_id: str) -> dict:
    """Return the project document only if `user_id` owns it. Raises 404 otherwise.

    Uses 404 (not 403) on purpose so we don't leak that a project exists to a
    non-owner. This is the single choke-point every nested resource must go
    through before reading or mutating child data.
    """
    doc = await db.projects.find_one({"id": project_id, "owner_id": user_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Project not found")
    return doc


def _authenticate_media(request: Request) -> str:
    """Authenticate a media request via either the `Authorization: Bearer` header
    or a `?token=<jwt>` query param.

    HTML5 <img>/<audio>/<video> tags can't attach an Authorization header, so we
    accept the same bearer token as a query param. The token is still the
    caller's normal short-lived JWT — nothing new is minted or persisted, so
    revoking a session revokes media access too.
    """
    token: Optional[str] = None
    header = request.headers.get("authorization") or request.headers.get("Authorization")
    if header and header.lower().startswith("bearer "):
        token = header.split(" ", 1)[1].strip()
    if not token:
        token = request.query_params.get("token")
    if not token:
        raise HTTPException(status_code=401, detail="Missing bearer token")
    try:
        claims = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=401, detail=f"Invalid token: {exc}") from exc
    sub = claims.get("sub")
    if not sub:
        raise HTTPException(status_code=401, detail="Malformed token")
    return sub


async def _media_project_check(user_id: str, project_id: str) -> None:
    """Allow the project owner OR any faculty assigned to the project. Anything
    else → 404 so we don't leak the file's existence.
    """
    owner_match = await db.projects.find_one(
        {"id": project_id, "owner_id": user_id}, {"_id": 0}
    )
    if owner_match:
        return
    assignment = await db.assignments.find_one(
        {"project_id": project_id, "faculty_id": user_id}, {"_id": 0}
    )
    if assignment:
        return
    raise HTTPException(status_code=404)


@api.get("/projects", response_model=List[Project])
async def list_projects(
    user_id: str = Depends(get_current_user_id),
    type: Optional[str] = None,
    status: Optional[str] = None,
    q: Optional[str] = None,
):
    query: dict = {"owner_id": user_id}
    if type:
        query["type"] = type
    if status:
        query["status"] = status
    if q:
        query["title"] = {"$regex": q, "$options": "i"}
    docs = await db.projects.find(query, {"_id": 0}).sort("updated_at", -1).to_list(500)
    return [Project(**d) for d in docs]


@api.post("/projects", response_model=Project)
async def create_project(payload: ProjectCreate, user_id: str = Depends(get_current_user_id)):
    user = await _load_user_public(user_id)
    project = Project(**payload.model_dump(), owner_id=user_id, owner_name=user.name)
    if not project.thumbnail_url:
        project.thumbnail_url = _default_thumb_for(project.type)
    await db.projects.insert_one(project.model_dump())
    return project


@api.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str, user_id: str = Depends(get_current_user_id)):
    doc = await db.projects.find_one({"id": project_id, "owner_id": user_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Project not found")
    return Project(**doc)


@api.patch("/projects/{project_id}", response_model=Project)
async def update_project(project_id: str, patch: ProjectUpdate, user_id: str = Depends(get_current_user_id)):
    update = {k: v for k, v in patch.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(400, "No fields to update")
    update["updated_at"] = _now_iso()
    await db.projects.update_one({"id": project_id, "owner_id": user_id}, {"$set": update})
    doc = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Project not found")
    return Project(**doc)


@api.delete("/projects/{project_id}")
async def delete_project(project_id: str, user_id: str = Depends(get_current_user_id)):
    res = await db.projects.delete_one({"id": project_id, "owner_id": user_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Project not found")
    # cascade lite
    await db.script_documents.delete_many({"project_id": project_id})
    await db.rights_records.delete_many({"project_id": project_id})
    await db.sync_cues.delete_many({"project_id": project_id})
    await db.music_tracks.delete_many({"project_id": project_id})
    await db.assets.delete_many({"project_id": project_id})
    return {"deleted": True}


def _default_thumb_for(project_type: str) -> str:
    m = {
        "music_video": "https://images.unsplash.com/photo-1506512420485-a28339abb3b9?w=940",
        "lyric_video": "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=940",
        "visualizer": "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=940",
        "short_film": "https://images.pexels.com/photos/10395639/pexels-photo-10395639.jpeg?w=940",
        "documentary": "https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?w=940",
        "commercial": "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=940",
        "branded_content": "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=940",
        "animation": "https://images.unsplash.com/photo-1633613286848-e6f43bbafb8d?w=940",
        "cgi_scene": "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=940",
        "social_campaign": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=940",
        "live_visuals": "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=940",
        "custom": "https://images.unsplash.com/photo-1607276159787-9ef4db5c0d0b?w=940",
    }
    return m.get(project_type, m["custom"])


# ---------- scripts ----------
@api.get("/projects/{project_id}/scripts", response_model=List[ScriptDocument])
async def list_scripts(project_id: str, user_id: str = Depends(get_current_user_id)):
    docs = await db.script_documents.find({"project_id": project_id, "owner_id": user_id}, {"_id": 0}).sort("updated_at", -1).to_list(200)
    return [ScriptDocument(**d) for d in docs]


@api.post("/scripts", response_model=ScriptDocument)
async def create_script(payload: ScriptCreate, user_id: str = Depends(get_current_user_id)):
    await _assert_project_owner(payload.project_id, user_id)
    script = ScriptDocument(
        project_id=payload.project_id,
        owner_id=user_id,
        title=payload.title,
        content=payload.content,
        kind=payload.kind,
    )
    await db.script_documents.insert_one(script.model_dump())
    return script


@api.patch("/scripts/{script_id}", response_model=ScriptDocument)
async def update_script(script_id: str, payload: dict, user_id: str = Depends(get_current_user_id)):
    update = {k: v for k, v in payload.items() if k in {"title", "content", "kind"}}
    update["updated_at"] = _now_iso()
    await db.script_documents.update_one({"id": script_id, "owner_id": user_id}, {"$set": update, "$inc": {"version": 1}})
    doc = await db.script_documents.find_one({"id": script_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Script not found")
    return ScriptDocument(**doc)


@api.delete("/scripts/{script_id}")
async def delete_script(script_id: str, user_id: str = Depends(get_current_user_id)):
    res = await db.script_documents.delete_one({"id": script_id, "owner_id": user_id})
    if res.deleted_count == 0:
        raise HTTPException(404)
    return {"deleted": True}


# ---------- assets ----------
@api.get("/assets", response_model=List[Asset])
async def list_assets(user_id: str = Depends(get_current_user_id), project_id: Optional[str] = None):
    q: dict = {"owner_id": user_id}
    if project_id:
        q["project_id"] = project_id
    docs = await db.assets.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [Asset(**d) for d in docs]


# ---------- sync studio ----------
@api.get("/projects/{project_id}/music", response_model=Optional[MusicTrack])
async def get_music(project_id: str, user_id: str = Depends(get_current_user_id)):
    await _assert_project_owner(project_id, user_id)
    doc = await db.music_tracks.find_one({"project_id": project_id}, {"_id": 0})
    if not doc:
        # return a synthetic default so the studio is never empty
        default = MusicTrack(
            project_id=project_id,
            title="Untitled Track",
            artist="Unassigned",
            duration_seconds=180.0,
            ownership="original",
            waveform=[abs((i % 40 - 20)) / 20 * 0.8 + 0.1 for i in range(200)],
        )
        return default
    return MusicTrack(**doc)


@api.get("/projects/{project_id}/cues", response_model=List[SyncCue])
async def list_cues(project_id: str, user_id: str = Depends(get_current_user_id)):
    await _assert_project_owner(project_id, user_id)
    docs = await db.sync_cues.find({"project_id": project_id}, {"_id": 0}).sort("timestamp", 1).to_list(500)
    return [SyncCue(**d) for d in docs]


@api.post("/cues", response_model=SyncCue)
async def create_cue(payload: SyncCueCreate, user_id: str = Depends(get_current_user_id)):
    await _assert_project_owner(payload.project_id, user_id)
    cue = SyncCue(**payload.model_dump())
    await db.sync_cues.insert_one(cue.model_dump())
    return cue


@api.patch("/cues/{cue_id}", response_model=SyncCue)
async def update_cue(cue_id: str, patch: SyncCueUpdate, user_id: str = Depends(get_current_user_id)):
    cue = await db.sync_cues.find_one({"id": cue_id}, {"_id": 0})
    if not cue:
        raise HTTPException(404, "Cue not found")
    await _assert_project_owner(cue["project_id"], user_id)
    update = {k: v for k, v in patch.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(400, "Nothing to update")
    await db.sync_cues.update_one({"id": cue_id}, {"$set": update})
    doc = await db.sync_cues.find_one({"id": cue_id}, {"_id": 0})
    return SyncCue(**doc)


@api.delete("/cues/{cue_id}")
async def delete_cue(cue_id: str, user_id: str = Depends(get_current_user_id)):
    cue = await db.sync_cues.find_one({"id": cue_id}, {"_id": 0})
    if not cue:
        raise HTTPException(404, "Cue not found")
    await _assert_project_owner(cue["project_id"], user_id)
    await db.sync_cues.delete_one({"id": cue_id})
    return {"deleted": True}


# ---------- rights ----------
@api.get("/projects/{project_id}/rights", response_model=List[RightsRecord])
async def list_rights(project_id: str, user_id: str = Depends(get_current_user_id)):
    await _assert_project_owner(project_id, user_id)
    docs = await db.rights_records.find({"project_id": project_id}, {"_id": 0}).sort("created_at", 1).to_list(500)
    return [RightsRecord(**d) for d in docs]


@api.post("/rights", response_model=RightsRecord)
async def create_rights(payload: RightsRecord, user_id: str = Depends(get_current_user_id)):
    await _assert_project_owner(payload.project_id, user_id)
    payload.id = payload.id or _uid()
    await db.rights_records.insert_one(payload.model_dump())
    return payload


@api.delete("/rights/{rights_id}")
async def delete_rights(rights_id: str, user_id: str = Depends(get_current_user_id)):
    record = await db.rights_records.find_one({"id": rights_id}, {"_id": 0})
    if not record:
        raise HTTPException(404, "Rights record not found")
    await _assert_project_owner(record["project_id"], user_id)
    await db.rights_records.delete_one({"id": rights_id})
    return {"deleted": True}


# ---------- learning ----------
@api.get("/courses", response_model=List[Course])
async def list_courses(user_id: str = Depends(get_current_user_id)):
    docs = await db.courses.find({}, {"_id": 0}).to_list(200)
    return [Course(**d) for d in docs]


@api.get("/enrollments")
async def list_enrollments(user_id: str = Depends(get_current_user_id)):
    docs = await db.enrollments.find({"user_id": user_id}, {"_id": 0}).to_list(200)
    course_ids = [d["course_id"] for d in docs]
    courses = await db.courses.find({"id": {"$in": course_ids}}, {"_id": 0}).to_list(200)
    course_by_id = {c["id"]: c for c in courses}
    return [
        {"enrollment": e, "course": course_by_id.get(e["course_id"])}
        for e in docs
    ]


@api.post("/enrollments")
async def enroll(payload: dict, user_id: str = Depends(get_current_user_id)):
    course_id = payload.get("course_id")
    if not course_id:
        raise HTTPException(400, "course_id required")
    existing = await db.enrollments.find_one({"user_id": user_id, "course_id": course_id})
    if existing:
        return _strip(existing)
    e = Enrollment(user_id=user_id, course_id=course_id)
    await db.enrollments.insert_one(e.model_dump())
    return e.model_dump()


# ---------- portfolio ----------
@api.get("/portfolio", response_model=List[PortfolioItem])
async def list_portfolio(user_id: str = Depends(get_current_user_id)):
    docs = await db.portfolio.find({"user_id": user_id}, {"_id": 0}).to_list(200)
    return [PortfolioItem(**d) for d in docs]


@api.post("/portfolio", response_model=PortfolioItem)
async def add_portfolio(payload: PortfolioItem, user_id: str = Depends(get_current_user_id)):
    payload.user_id = user_id
    payload.id = payload.id or _uid()
    await db.portfolio.insert_one(payload.model_dump())
    return payload


@api.patch("/portfolio/{item_id}", response_model=PortfolioItem)
async def update_portfolio(item_id: str, patch: dict, user_id: str = Depends(get_current_user_id)):
    upd = {k: v for k, v in patch.items() if k in {"featured", "title", "description", "category"}}
    await db.portfolio.update_one({"id": item_id, "user_id": user_id}, {"$set": upd})
    doc = await db.portfolio.find_one({"id": item_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404)
    return PortfolioItem(**doc)


@api.delete("/portfolio/{item_id}")
async def delete_portfolio(item_id: str, user_id: str = Depends(get_current_user_id)):
    res = await db.portfolio.delete_one({"id": item_id, "user_id": user_id})
    if res.deleted_count == 0:
        raise HTTPException(404)
    return {"deleted": True}


# ---------- notifications ----------
@api.get("/notifications", response_model=List[Notification])
async def list_notifications(user_id: str = Depends(get_current_user_id)):
    docs = await db.notifications.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return [Notification(**d) for d in docs]


@api.post("/notifications/{note_id}/read")
async def mark_read(note_id: str, user_id: str = Depends(get_current_user_id)):
    await db.notifications.update_one({"id": note_id, "user_id": user_id}, {"$set": {"read": True}})
    return {"ok": True}


@api.post("/notifications/read-all")
async def mark_all_read(user_id: str = Depends(get_current_user_id)):
    res = await db.notifications.update_many(
        {"user_id": user_id, "read": False}, {"$set": {"read": True}}
    )
    return {"ok": True, "updated": res.modified_count}


@api.get("/notifications/link-registry")
async def notifications_link_registry():
    """Public registry of every deep_link pattern CYNAIAH emits.

    The ANCR notification bus (and the test suite) can hit this endpoint to
    confirm that every notification's `deep_link` maps to a real, supported
    route in the app.
    """
    return {
        "ancr_notifications_enabled": ANCR_NOTIFICATIONS_ENABLED,
        "links": ancr.LINK_REGISTRY,
        "event_types": sorted(set(REVIEW_KIND_TO_EVENT.values())),
    }


@api.post("/notifications/resolve-link")
async def resolve_link(payload: dict, user_id: str = Depends(get_current_user_id)):
    """Return the registry entry a deep_link resolves to, or 404 if unregistered.

    Small utility endpoint used by the front-end and the tests to prove every
    link on record is reachable.
    """
    link = payload.get("deep_link")
    entry = resolve_deep_link(link)
    if entry is None:
        raise HTTPException(404, f"Unregistered deep_link: {link}")
    return {"deep_link": link, "matched": entry}


@api.get("/notifications/{note_id}/envelope")
async def notification_envelope(note_id: str, user_id: str = Depends(get_current_user_id)):
    """Owner-only view of the full ANCR envelope for a notification.

    Handy for demos and automated tests to prove the outbound shape is stable.
    """
    doc = await db.notifications.find_one({"id": note_id, "user_id": user_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Notification not found")
    return {
        "id": doc["id"],
        "envelope": {
            "event_type": doc.get("event_type"),
            "actor": doc.get("actor"),
            "recipient": doc.get("recipient"),
            "subject": doc.get("subject"),
            "payload": doc.get("payload"),
            "deep_link": doc.get("deep_link"),
            "ancr_ready": doc.get("ancr_ready", False),
            "ancr_emitted_at": doc.get("ancr_emitted_at"),
            "created_at": doc.get("created_at"),
        },
        "channels": doc.get("channels") or [],
        "link_registry_match": resolve_deep_link(doc.get("deep_link") or ""),
    }


# ---------- feedback ----------
@api.get("/projects/{project_id}/feedback", response_model=List[Feedback])
async def list_feedback(project_id: str, user_id: str = Depends(get_current_user_id)):
    await _assert_project_owner(project_id, user_id)
    docs = await db.feedback.find({"project_id": project_id}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return [Feedback(**d) for d in docs]


# ---------- calendar ----------
@api.get("/calendar", response_model=List[CalendarEvent])
async def list_calendar(user_id: str = Depends(get_current_user_id)):
    docs = await db.calendar_events.find({"user_id": user_id}, {"_id": 0}).sort("date", 1).to_list(200)
    return [CalendarEvent(**d) for d in docs]


# ---------- AI ----------
@api.post("/ai/script")
async def ai_script(req: ScriptGenRequest, user_id: str = Depends(get_current_user_id)):
    try:
        content = await ai_service.generate_script(req.prompt, kind=req.kind, tone=req.tone)
    except Exception as exc:
        logger.exception("AI script generation failed")
        raise HTTPException(502, f"AI provider error: {exc}") from exc

    saved = None
    if req.project_id:
        await _assert_project_owner(req.project_id, user_id)
        doc = ScriptDocument(
            project_id=req.project_id,
            owner_id=user_id,
            title=f"AI Draft — {req.kind}",
            content=content,
            kind=req.kind,
        )
        await db.script_documents.insert_one(doc.model_dump())
        saved = doc.model_dump()

    return {"content": content, "kind": req.kind, "saved_script": saved, "provider": f"{ai_service.AI_TEXT_PROVIDER}:{ai_service.AI_TEXT_MODEL}"}


@api.post("/ai/image")
async def ai_image(req: ImageGenRequest, user_id: str = Depends(get_current_user_id)):
    characters = []
    if req.character_ids:
        docs = await db.characters.find(
            {"id": {"$in": req.character_ids}, "owner_id": user_id}, {"_id": 0}
        ).to_list(20)
        characters = docs
    try:
        result = await ai_service.generate_image(
            req.prompt,
            style=req.style or "cinematic film still",
            characters=characters or None,
        )
    except Exception as exc:
        logger.exception("AI image generation failed")
        raise HTTPException(502, f"AI provider error: {exc}") from exc

    asset = None
    if req.save_as_asset:
        if req.project_id:
            await _assert_project_owner(req.project_id, user_id)
        tags = list(set(["ai-generated", *req.tags]))
        if characters:
            tags.append("character-locked")
        a = Asset(
            project_id=req.project_id,
            owner_id=user_id,
            name=req.prompt[:80] or "AI Generated",
            type="image",
            url=result["url"],
            source="ai_generated",
            prompt=req.prompt,
            provider=result["provider"],
            tags=tags,
        )
        await db.assets.insert_one(a.model_dump())
        asset = a.model_dump()

    return {**result, "saved_asset": asset}


# ---------- character reference profiles ----------
@api.get("/projects/{project_id}/characters", response_model=List[CharacterProfile])
async def list_characters(project_id: str, user_id: str = Depends(get_current_user_id)):
    docs = await db.characters.find(
        {"project_id": project_id, "owner_id": user_id}, {"_id": 0}
    ).sort("created_at", 1).to_list(200)
    return [CharacterProfile(**d) for d in docs]


@api.post("/characters", response_model=CharacterProfile)
async def create_character(
    payload: CharacterProfileCreate, user_id: str = Depends(get_current_user_id)
):
    await _assert_project_owner(payload.project_id, user_id)
    char = CharacterProfile(**payload.model_dump(), owner_id=user_id)
    await db.characters.insert_one(char.model_dump())
    return char


@api.patch("/characters/{character_id}", response_model=CharacterProfile)
async def update_character(
    character_id: str,
    patch: CharacterProfileUpdate,
    user_id: str = Depends(get_current_user_id),
):
    update = {k: v for k, v in patch.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(400, "Nothing to update")
    await db.characters.update_one(
        {"id": character_id, "owner_id": user_id}, {"$set": update}
    )
    doc = await db.characters.find_one({"id": character_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404)
    return CharacterProfile(**doc)


@api.delete("/characters/{character_id}")
async def delete_character(character_id: str, user_id: str = Depends(get_current_user_id)):
    res = await db.characters.delete_one({"id": character_id, "owner_id": user_id})
    if res.deleted_count == 0:
        raise HTTPException(404)
    return {"deleted": True}


@api.post("/characters/{character_id}/generate-reference", response_model=CharacterProfile)
async def generate_character_reference(
    character_id: str,
    payload: CharacterReferenceGen,
    user_id: str = Depends(get_current_user_id),
):
    char = await db.characters.find_one({"id": character_id, "owner_id": user_id}, {"_id": 0})
    if not char:
        raise HTTPException(404, "Character not found")

    # Build a portrait prompt from the profile if user didn't supply one
    if payload.prompt:
        prompt = payload.prompt
    else:
        bits = [f"portrait of {char.get('name','the character')}"]
        for k in ("age", "gender", "hair", "skin_tone", "eye_color", "wardrobe"):
            v = char.get(k)
            if v:
                bits.append(f"{k.replace('_',' ')}: {v}")
        if char.get("description"):
            bits.append(char["description"])
        prompt = ", ".join(bits) + ". Front-facing, natural expression, three-quarter view acceptable, neutral background."

    try:
        result = await ai_service.generate_image(prompt=prompt, style=payload.style)
    except Exception as exc:
        logger.exception("Character reference generation failed")
        raise HTTPException(502, f"AI provider error: {exc}") from exc

    refs = list(char.get("reference_image_urls") or []) + [result["url"]]
    await db.characters.update_one(
        {"id": character_id}, {"$set": {"reference_image_urls": refs}}
    )
    # also register as asset
    await db.assets.insert_one(
        Asset(
            project_id=char["project_id"],
            owner_id=user_id,
            name=f"{char['name']} — reference",
            type="image",
            url=result["url"],
            source="ai_generated",
            prompt=prompt,
            provider=result["provider"],
            tags=["character-reference", char["name"].lower()],
        ).model_dump()
    )
    doc = await db.characters.find_one({"id": character_id}, {"_id": 0})
    return CharacterProfile(**doc)


# ---------- sync autopilot ----------
@api.post("/projects/{project_id}/autopilot/suggest-cues")
async def autopilot_suggest_cues(project_id: str, user_id: str = Depends(get_current_user_id)):
    project = await db.projects.find_one({"id": project_id, "owner_id": user_id}, {"_id": 0})
    if not project:
        raise HTTPException(404, "Project not found")
    music = await db.music_tracks.find_one({"project_id": project_id}, {"_id": 0})
    if not music:
        raise HTTPException(400, "No music track attached to this project yet.")

    try:
        cues = await ai_service.suggest_sync_cues(
            title=music.get("title", "Untitled"),
            artist=music.get("artist", "Unknown"),
            duration_seconds=float(music.get("duration_seconds", 180.0)),
            ownership=music.get("ownership", "original"),
            visual_style=project.get("visual_style"),
            story_concept=project.get("story_concept"),
        )
    except Exception as exc:
        logger.exception("Autopilot failed")
        raise HTTPException(502, f"AI provider error: {exc}") from exc

    return {
        "provider": f"{ai_service.AI_TEXT_PROVIDER}:{ai_service.AI_TEXT_MODEL}",
        "duration_seconds": music.get("duration_seconds"),
        "count": len(cues),
        "cues": cues,
    }


# ---------- storyboards ----------
@api.get("/projects/{project_id}/storyboard-frames", response_model=List[StoryboardFrame])
async def list_storyboard_frames(project_id: str, user_id: str = Depends(get_current_user_id)):
    docs = (
        await db.storyboard_frames.find({"project_id": project_id, "owner_id": user_id}, {"_id": 0})
        .sort("order", 1)
        .to_list(500)
    )
    return [StoryboardFrame(**d) for d in docs]


@api.post("/storyboard-frames", response_model=StoryboardFrame)
async def create_storyboard_frame(
    payload: StoryboardFrameCreate, user_id: str = Depends(get_current_user_id)
):
    await _assert_project_owner(payload.project_id, user_id)
    # Compute next order
    highest = await db.storyboard_frames.find_one(
        {"project_id": payload.project_id, "owner_id": user_id},
        sort=[("order", -1)],
        projection={"_id": 0, "order": 1},
    )
    next_order = (highest["order"] + 1) if highest else 0

    image_url = payload.image_url
    provider = None
    source = "uploaded"
    if payload.generate_with_ai and payload.prompt:
        characters = []
        if payload.character_ids:
            characters = await db.characters.find(
                {"id": {"$in": payload.character_ids}, "owner_id": user_id}, {"_id": 0}
            ).to_list(20)
        try:
            result = await ai_service.generate_image(
                payload.prompt,
                style=payload.style or "cinematic storyboard frame",
                characters=characters or None,
            )
        except Exception as exc:
            logger.exception("Storyboard AI gen failed")
            raise HTTPException(502, f"AI provider error: {exc}") from exc
        image_url = result["url"]
        provider = result["provider"]
        source = "ai_generated"
        tags = ["ai-generated", "storyboard"]
        if characters:
            tags.append("character-locked")
        # Also register as an asset so it appears in mood board / assets library
        asset = Asset(
            project_id=payload.project_id,
            owner_id=user_id,
            name=(payload.caption or payload.prompt)[:80],
            type="image",
            url=image_url,
            source="ai_generated",
            prompt=payload.prompt,
            provider=provider,
            tags=tags,
        )
        await db.assets.insert_one(asset.model_dump())

    frame = StoryboardFrame(
        project_id=payload.project_id,
        owner_id=user_id,
        order=next_order,
        image_url=image_url,
        caption=payload.caption,
        shot_type=payload.shot_type,
        notes=payload.notes,
        source=source,
        prompt=payload.prompt if payload.generate_with_ai else None,
        provider=provider,
    )
    await db.storyboard_frames.insert_one(frame.model_dump())
    return frame


@api.patch("/storyboard-frames/{frame_id}", response_model=StoryboardFrame)
async def update_storyboard_frame(
    frame_id: str, patch: StoryboardFrameUpdate, user_id: str = Depends(get_current_user_id)
):
    update = {k: v for k, v in patch.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(400, "Nothing to update")
    await db.storyboard_frames.update_one(
        {"id": frame_id, "owner_id": user_id}, {"$set": update}
    )
    doc = await db.storyboard_frames.find_one({"id": frame_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404)
    return StoryboardFrame(**doc)


@api.delete("/storyboard-frames/{frame_id}")
async def delete_storyboard_frame(frame_id: str, user_id: str = Depends(get_current_user_id)):
    res = await db.storyboard_frames.delete_one({"id": frame_id, "owner_id": user_id})
    if res.deleted_count == 0:
        raise HTTPException(404)
    return {"deleted": True}


@api.post("/storyboard-frames/{frame_id}/reorder")
async def reorder_frames(
    frame_id: str, payload: dict, user_id: str = Depends(get_current_user_id)
):
    """payload = {"new_order": int}"""
    target = payload.get("new_order")
    if target is None:
        raise HTTPException(400, "new_order required")
    frame = await db.storyboard_frames.find_one({"id": frame_id, "owner_id": user_id})
    if not frame:
        raise HTTPException(404)
    frames = (
        await db.storyboard_frames.find(
            {"project_id": frame["project_id"], "owner_id": user_id}, {"_id": 0}
        )
        .sort("order", 1)
        .to_list(500)
    )
    ordered = [f for f in frames if f["id"] != frame_id]
    ordered.insert(max(0, min(int(target), len(ordered))), frame)
    for i, f in enumerate(ordered):
        await db.storyboard_frames.update_one({"id": f["id"]}, {"$set": {"order": i}})
    return {"ok": True, "count": len(ordered)}


@api.post("/projects/{project_id}/command-center")
async def project_command_center(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Aggregate everything needed by the Project Command Center view."""
    project = await db.projects.find_one({"id": project_id, "owner_id": user_id}, {"_id": 0})
    if not project:
        raise HTTPException(404, "Project not found")
    scripts = await db.script_documents.find({"project_id": project_id}, {"_id": 0}).sort("updated_at", -1).to_list(50)
    frames = await db.storyboard_frames.find({"project_id": project_id}, {"_id": 0}).sort("order", 1).to_list(200)
    assets = await db.assets.find({"project_id": project_id}, {"_id": 0}).sort("created_at", -1).to_list(200)
    rights = await db.rights_records.find({"project_id": project_id}, {"_id": 0}).to_list(100)
    feedback = await db.feedback.find({"project_id": project_id}, {"_id": 0}).sort("created_at", -1).to_list(20)
    cues = await db.sync_cues.find({"project_id": project_id}, {"_id": 0}).sort("timestamp", 1).to_list(200)
    music = await db.music_tracks.find_one({"project_id": project_id}, {"_id": 0})
    events = await db.calendar_events.find({"user_id": user_id, "project_id": project_id}, {"_id": 0}).sort("date", 1).to_list(50)
    return {
        "project": project,
        "scripts": scripts,
        "storyboard_frames": frames,
        "assets": assets,
        "mood_board": [a for a in assets if "mood-board" in (a.get("tags") or [])] or assets[:8],
        "rights": rights,
        "feedback": feedback,
        "sync_cues": cues,
        "music": music,
        "events": events,
        "counts": {
            "scripts": len(scripts),
            "frames": len(frames),
            "assets": len(assets),
            "rights": len(rights),
            "cues": len(cues),
            "collaborators": len(project.get("collaborators", [])),
        },
    }


@api.get("/generated/{filename}")
async def get_generated(filename: str, request: Request):
    # Safe path — allow only alnum/_/-/dot
    if not filename.replace("_", "").replace("-", "").replace(".", "").isalnum():
        raise HTTPException(400, "Invalid filename")
    user_id = _authenticate_media(request)
    path = ai_service.GENERATED_DIR / filename
    if not path.exists():
        raise HTTPException(404)
    # Ownership check: allow if the file appears in an asset/frame/character
    # record whose project is owned by the caller OR the caller is assigned
    # faculty. Files with no db record (e.g. one-off AI test renders) are
    # served to any authenticated user — they aren't tied to a project.
    linked_project_id = None
    asset = await db.assets.find_one({"url": {"$regex": filename}}, {"_id": 0, "project_id": 1})
    if not asset:
        frame = await db.storyboard_frames.find_one(
            {"image_url": {"$regex": filename}}, {"_id": 0, "project_id": 1}
        )
        if frame:
            linked_project_id = frame.get("project_id")
    else:
        linked_project_id = asset.get("project_id")
    if linked_project_id:
        await _media_project_check(user_id, linked_project_id)
    return FileResponse(path)


# ---------- music track upsert / audio upload ----------
UPLOADED_AUDIO_DIR = ROOT_DIR / "uploaded_audio"
UPLOADED_AUDIO_DIR.mkdir(parents=True, exist_ok=True)


@api.patch("/projects/{project_id}/music", response_model=MusicTrack)
async def upsert_music_track(
    project_id: str,
    payload: MusicTrackUpsert,
    user_id: str = Depends(get_current_user_id),
):
    """Set track metadata OR music_url pointing to an already-hosted file."""
    project = await db.projects.find_one({"id": project_id, "owner_id": user_id}, {"_id": 0})
    if not project:
        raise HTTPException(404, "Project not found")
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    existing = await db.music_tracks.find_one({"project_id": project_id}, {"_id": 0})
    if existing:
        if update:
            await db.music_tracks.update_one({"id": existing["id"]}, {"$set": update})
        doc = await db.music_tracks.find_one({"id": existing["id"]}, {"_id": 0})
        return MusicTrack(**doc)
    # create
    track = MusicTrack(
        project_id=project_id,
        title=update.get("title") or project.get("title") or "Untitled Track",
        artist=update.get("artist") or "Unassigned",
        duration_seconds=update.get("duration_seconds") or 180.0,
        ownership=update.get("ownership") or "original",
        composers=update.get("composers") or [],
        publishers=update.get("publishers") or [],
        music_url=update.get("music_url"),
        waveform=[abs((i % 40 - 20)) / 20 * 0.8 + 0.1 for i in range(200)],
    )
    await db.music_tracks.insert_one(track.model_dump())
    return track


@api.post("/projects/{project_id}/music/upload", response_model=MusicTrack)
async def upload_music_file(
    project_id: str,
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    artist: Optional[str] = Form(None),
    ownership: Optional[str] = Form(None),
    user_id: str = Depends(get_current_user_id),
):
    """Upload a music file (mp3/wav) securely and set it as the project's music track.

    Storage is local disk in the pod; when ANCRLAB is wired later this endpoint
    will proxy to the ANCRLAB media store. This endpoint does NOT claim any
    ANCRLAB integration is live today.
    """
    project = await db.projects.find_one({"id": project_id, "owner_id": user_id}, {"_id": 0})
    if not project:
        raise HTTPException(404, "Project not found")
    if not file.filename:
        raise HTTPException(400, "File required")
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in {".mp3", ".wav", ".m4a", ".ogg", ".flac"}:
        raise HTTPException(400, "Unsupported audio format")
    safe_name = f"{project_id}_{_uid()}{ext}"
    dest = UPLOADED_AUDIO_DIR / safe_name
    data = await file.read()
    dest.write_bytes(data)
    url = f"/api/music-audio/{safe_name}"

    # Upsert track with the URL
    existing = await db.music_tracks.find_one({"project_id": project_id}, {"_id": 0})
    upd: dict = {"music_url": url}
    if title:
        upd["title"] = title
    if artist:
        upd["artist"] = artist
    if ownership:
        upd["ownership"] = ownership
    if existing:
        await db.music_tracks.update_one({"id": existing["id"]}, {"$set": upd})
        doc = await db.music_tracks.find_one({"id": existing["id"]}, {"_id": 0})
        return MusicTrack(**doc)
    track = MusicTrack(
        project_id=project_id,
        title=title or project.get("title") or "Untitled Track",
        artist=artist or "Unassigned",
        duration_seconds=180.0,
        ownership=ownership or "original",
        music_url=url,
        waveform=[abs((i % 40 - 20)) / 20 * 0.8 + 0.1 for i in range(200)],
    )
    await db.music_tracks.insert_one(track.model_dump())
    return track


@api.get("/music-audio/{filename}")
async def get_music_audio(filename: str, request: Request):
    # Safe path — allow only alnum + _- .
    if not filename.replace("_", "").replace("-", "").replace(".", "").isalnum():
        raise HTTPException(400, "Invalid filename")
    user_id = _authenticate_media(request)
    path = UPLOADED_AUDIO_DIR / filename
    if not path.exists():
        raise HTTPException(404)
    track = await db.music_tracks.find_one(
        {"music_url": {"$regex": filename}}, {"_id": 0, "project_id": 1}
    )
    if track and track.get("project_id"):
        await _media_project_check(user_id, track["project_id"])
    return FileResponse(path, media_type="audio/mpeg")


# ---------- Production Studio ----------
PROD_COLLS = {
    "crew": "prod_crew",
    "location": "prod_locations",
    "equipment": "prod_equipment",
    "scene": "prod_scenes",
    "shot": "prod_shots",
    "callsheet": "prod_callsheets",
    "budget": "prod_budget",
    "note": "prod_notes",
    "release": "prod_releases",
}


@api.get("/projects/{project_id}/production/overview")
async def production_overview(project_id: str, user_id: str = Depends(get_current_user_id)):
    project = await db.projects.find_one({"id": project_id, "owner_id": user_id}, {"_id": 0})
    if not project:
        raise HTTPException(404, "Project not found")
    result: dict = {"project": project}
    for key, coll in PROD_COLLS.items():
        docs = await db[coll].find({"project_id": project_id}, {"_id": 0}).to_list(500)
        result[key + "s" if not key.endswith("s") else key] = docs
    # Aggregate progress stats
    shots = result.get("shots", [])
    scheduled = sum(1 for s in shots if s.get("status") in {"scheduled", "in_progress", "shot", "wrapped"})
    completed = sum(1 for s in shots if s.get("status") in {"shot", "wrapped"})
    budget = result.get("budgets", [])
    total_budget = sum(b.get("amount", 0) or 0 for b in budget)
    spent = sum(b.get("spent", 0) or 0 for b in budget)
    result["stats"] = {
        "crew_count": len(result.get("crews", [])),
        "locations": len(result.get("locations", [])),
        "equipment": len(result.get("equipments", [])),
        "scenes": len(result.get("scenes", [])),
        "shots_total": len(shots),
        "shots_scheduled": scheduled,
        "shots_completed": completed,
        "callsheets": len(result.get("callsheets", [])),
        "budget_total": total_budget,
        "budget_spent": spent,
    }
    return result


@api.post("/projects/{project_id}/production/coverage-coach")
async def coverage_coach(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Advisory coverage analysis. Suggests possible gaps — never rewrites the plan."""
    project = await db.projects.find_one({"id": project_id, "owner_id": user_id}, {"_id": 0})
    if not project:
        raise HTTPException(404)
    scenes = await db.prod_scenes.find({"project_id": project_id}, {"_id": 0}).to_list(200)
    shots = await db.prod_shots.find({"project_id": project_id}, {"_id": 0}).to_list(500)
    if not scenes or not shots:
        raise HTTPException(400, "Add scenes and shots in Production Studio first.")

    # Build compact scene digest for Claude
    scene_lines: list[str] = []
    for s in scenes:
        sh = [x for x in shots if x.get("scene_id") == s.get("id")]
        sh_str = "; ".join(
            f"#{x.get('number','?')} {x.get('shot_size','?')} {x.get('camera_move','')} — {x.get('description','')}"
            for x in sh
        ) or "(no shots)"
        scene_lines.append(
            f"SCENE {s.get('number','?')} — {s.get('title','?')} @ {s.get('location','—')}\n"
            f"Description: {s.get('description','')}\n"
            f"Shots ({len(sh)}): {sh_str}"
        )
    digest = "\n\n".join(scene_lines)

    from emergentintegrations.llm.chat import LlmChat, UserMessage
    chat = LlmChat(
        api_key=ai_service._api_key(),
        session_id=f"cynaiah-coverage-{_uid()}",
        system_message=(
            "You are a humble film-school coverage coach. You never rewrite the "
            "director's plan. You ADVISE by asking the student thoughtful "
            "questions about potentially-missing coverage."
        ),
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")

    prompt = (
        f"Project: {project.get('title')} ({(project.get('type') or '').replace('_',' ')}).\n"
        f"Visual style: {project.get('visual_style') or '—'}.\n"
        f"Story concept: {project.get('story_concept') or '—'}.\n\n"
        f"Current scene + shot plan:\n{digest}\n\n"
        f"For EACH scene, review coverage and return STRICT JSON — no markdown fences:\n"
        f'{{"scenes": [\n'
        f'  {{"scene_number": "<number>",\n'
        f'   "scene_title": "<title>",\n'
        f'   "possibly_missing": [{{"kind": "master|close-up|insert|cutaway|reverse|other", "note": "<one sentence>"}}],\n'
        f'   "questions_for_student": ["<open question>", ...],\n'
        f'   "compliments": ["<what already works>", ...]\n'
        f'  }}\n'
        f']}}\n\n'
        f"Be conservative. Never claim shots are 'wrong' — only suggest possibilities. "
        f"Match the visual style. If nothing is missing, return empty arrays but keep the scene entry."
    )

    text = await chat.send_message(UserMessage(text=prompt))
    raw = text if isinstance(text, str) else str(text)
    import re as _re, json as _json
    raw = _re.sub(r"^```(?:json)?\s*", "", raw.strip(), flags=_re.IGNORECASE)
    raw = _re.sub(r"\s*```$", "", raw.strip())
    try:
        parsed = _json.loads(raw)
    except Exception:
        m = _re.search(r"\{[\s\S]*\}", raw)
        if not m:
            raise HTTPException(502, "Coverage coach could not be parsed")
        parsed = _json.loads(m.group(0))

    return {
        "provider": "anthropic:claude-sonnet-4-5-20250929",
        "scenes": parsed.get("scenes", []),
        "note": "Advisory. The director makes the final call.",
    }


@api.post("/projects/{project_id}/production/{kind}")
async def prod_create(
    project_id: str,
    kind: str,
    payload: dict,
    user_id: str = Depends(get_current_user_id),
):
    if kind not in PROD_COLLS:
        raise HTTPException(400, f"Unknown kind: {kind}")
    project = await db.projects.find_one({"id": project_id, "owner_id": user_id}, {"_id": 0})
    if not project:
        raise HTTPException(404, "Project not found")
    doc = {
        "id": _uid(),
        "project_id": project_id,
        "owner_id": user_id,
        "created_at": _now_iso(),
        **{k: v for k, v in payload.items() if k not in {"id", "project_id", "owner_id", "created_at"}},
    }
    await db[PROD_COLLS[kind]].insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.patch("/production/{kind}/{item_id}")
async def prod_update(
    kind: str,
    item_id: str,
    payload: dict,
    user_id: str = Depends(get_current_user_id),
):
    if kind not in PROD_COLLS:
        raise HTTPException(400, "Unknown kind")
    update = {k: v for k, v in payload.items() if k not in {"id", "project_id", "owner_id", "created_at"}}
    if not update:
        raise HTTPException(400, "Nothing to update")
    await db[PROD_COLLS[kind]].update_one(
        {"id": item_id, "owner_id": user_id}, {"$set": update}
    )
    doc = await db[PROD_COLLS[kind]].find_one({"id": item_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404)
    return doc


@api.delete("/production/{kind}/{item_id}")
async def prod_delete(kind: str, item_id: str, user_id: str = Depends(get_current_user_id)):
    if kind not in PROD_COLLS:
        raise HTTPException(400, "Unknown kind")
    res = await db[PROD_COLLS[kind]].delete_one({"id": item_id, "owner_id": user_id})
    if res.deleted_count == 0:
        raise HTTPException(404)
    return {"deleted": True}


@api.get("/production/callsheet/{callsheet_id}/pdf")
async def callsheet_pdf(callsheet_id: str, user_id: str = Depends(get_current_user_id)):
    """Render a call sheet as a printable one-page A4 PDF."""
    cs = await db.prod_callsheets.find_one({"id": callsheet_id, "owner_id": user_id}, {"_id": 0})
    if not cs:
        raise HTTPException(404, "Call sheet not found")
    pid = cs["project_id"]
    project = await db.projects.find_one({"id": pid}, {"_id": 0}) or {"title": "Untitled"}
    crew = await db.prod_crew.find({"project_id": pid}, {"_id": 0}).to_list(200)
    scenes = await db.prod_scenes.find({"project_id": pid}, {"_id": 0}).to_list(200)
    shots = await db.prod_shots.find({"project_id": pid}, {"_id": 0}).to_list(500)
    locations = await db.prod_locations.find({"project_id": pid}, {"_id": 0}).to_list(200)
    # Highlight the location matching this call sheet
    if cs.get("location"):
        locations = [l for l in locations if l.get("name") == cs["location"]] or locations
    pdf_bytes = render_call_sheet_pdf(project, cs, crew, scenes, shots, locations)
    filename = f"CallSheet_{(project.get('title','project')).replace(' ','_')}_{cs.get('date','')}.pdf"
    return Response(
        pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ---------- Character Continuity Diff ----------
@api.post("/characters/{character_id}/continuity-diff")
async def continuity_diff(
    character_id: str, payload: dict, user_id: str = Depends(get_current_user_id)
):
    """Compare two frames of a character and describe likely identity drift.

    Body: {"image_a_url": "...", "image_b_url": "..."}. Returns a structured
    report — the STUDENT makes the final call. This is a coaching tool, not
    an automatic reject.
    """
    char = await db.characters.find_one({"id": character_id, "owner_id": user_id}, {"_id": 0})
    if not char:
        raise HTTPException(404, "Character not found")
    a = payload.get("image_a_url")
    b = payload.get("image_b_url")
    if not a or not b:
        raise HTTPException(400, "image_a_url and image_b_url required")

    from emergentintegrations.llm.chat import ImageContent, LlmChat, UserMessage

    img_a = await ai_service._url_to_image_content(a)
    img_b = await ai_service._url_to_image_content(b)
    if not img_a or not img_b:
        raise HTTPException(400, "Could not load one or both images")

    identity = ai_service._character_identity_block(char) or "(no locked details)"
    prompt = (
        f"You are a continuity supervisor helping a film student compare two frames "
        f"of the same character across a storyboard.\n\n"
        f"CHARACTER: {char.get('name')}\nLocked details:\n{identity}\n\n"
        f"Two attached images: (A) first frame, (B) second frame.\n\n"
        f"Return STRICT JSON — no markdown fences — with this shape:\n"
        f'{{"summary": "one-sentence overall verdict",\n'
        f' "confidence": "low|medium|high",\n'
        f' "differences": [{{"category": "face|hair|skin_tone|wardrobe|age|proportions|visual_style", "severity": "minor|notable|major", "detail": "one sentence"}}],\n'
        f' "questions_for_student": ["<question 1>", "<question 2>"]}}\n\n'
        f"Be conservative: flag POSSIBLE drift, do NOT claim you can be certain. "
        f"The student makes the final determination."
    )

    chat = LlmChat(
        api_key=ai_service._api_key(),
        session_id=f"cynaiah-diff-{_uid()}",
        system_message="You are a careful, humble film-school continuity supervisor. You suggest, never dictate.",
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")

    text = await chat.send_message(
        UserMessage(text=prompt, file_contents=[img_a, img_b])
    )
    import json as _json, re as _re
    raw = text if isinstance(text, str) else str(text)
    raw = _re.sub(r"^```(?:json)?\s*", "", raw.strip(), flags=_re.IGNORECASE)
    raw = _re.sub(r"\s*```$", "", raw.strip())
    try:
        report = _json.loads(raw)
    except Exception:
        m = _re.search(r"\{[\s\S]*\}", raw)
        if not m:
            raise HTTPException(502, "Could not parse continuity report")
        report = _json.loads(m.group(0))
    return {
        "character": {"id": char["id"], "name": char.get("name")},
        "image_a_url": a,
        "image_b_url": b,
        "report": report,
        "provider": "anthropic:claude-sonnet-4-5-20250929",
    }


# ---------- Faculty / Reviews (append-only history) ----------
RUBRIC_COMPETENCIES = [
    {"key": "story", "label": "Story"},
    {"key": "direction", "label": "Direction"},
    {"key": "cinematography", "label": "Cinematography"},
    {"key": "sound_music", "label": "Sound & Music"},
    {"key": "ai_ethics_rights", "label": "AI Ethics & Rights"},
    {"key": "craft", "label": "Craft"},
]
REVIEW_STATUSES = {"open", "revision_requested", "approved", "final"}
REVIEW_KINDS = {"written", "time_coded", "coverage_response", "rubric", "status", "frame_feedback"}


@api.get("/rubric/competencies")
async def rubric_competencies():
    """Public rubric definition for the MVP. Fixed 1-5 scale + optional comment."""
    return {"competencies": RUBRIC_COMPETENCIES, "scale": {"min": 1, "max": 5}}


async def _assert_faculty_can_view(project_id: str, faculty_id: str) -> dict:
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(404, "Project not found")
    assignment = await db.assignments.find_one(
        {"project_id": project_id, "faculty_id": faculty_id}, {"_id": 0}
    )
    if not assignment:
        raise HTTPException(403, "Not assigned to this project")
    return project


@api.get("/faculty/dashboard")
async def faculty_dashboard(claims: dict = Depends(require_faculty)):
    """List every project this faculty mentors, with student, status pill, and open review count."""
    faculty_id = claims["sub"]
    assignments = await db.assignments.find({"faculty_id": faculty_id}, {"_id": 0}).to_list(500)
    project_ids = [a["project_id"] for a in assignments]
    if not project_ids:
        return {"faculty_id": faculty_id, "assignments": [], "projects": []}

    projects = await db.projects.find({"id": {"$in": project_ids}}, {"_id": 0}).to_list(500)
    students = await db.users.find(
        {"id": {"$in": list({p.get("owner_id") for p in projects})}},
        {"_id": 0, "password_hash": 0},
    ).to_list(200)
    student_map = {u["id"]: u for u in students}

    # Latest status + open review count per project, from the immutable log
    tiles = []
    for p in projects:
        reviews = await db.faculty_reviews.find({"project_id": p["id"]}, {"_id": 0}).sort("created_at", -1).to_list(500)
        latest_status = next(
            (r for r in reviews if r.get("kind") == "status" and not r.get("superseded_by")),
            None,
        )
        status_value = (latest_status or {}).get("status_value", "open")
        # "Open" items = revisions still needed (i.e. latest status is revision_requested OR open)
        open_count = 1 if status_value in {"open", "revision_requested"} else 0
        tiles.append({
            "project": p,
            "student": student_map.get(p.get("owner_id"), {"id": p.get("owner_id"), "name": "Unknown"}),
            "status": status_value,
            "review_count": len([r for r in reviews if not r.get("superseded_by")]),
            "open_count": open_count,
            "last_review_at": reviews[0]["created_at"] if reviews else None,
        })
    tiles.sort(key=lambda t: t["last_review_at"] or "", reverse=True)
    return {"faculty_id": faculty_id, "projects": tiles}


@api.get("/faculty/projects/{project_id}")
async def faculty_project_view(project_id: str, claims: dict = Depends(require_faculty)):
    """Full read-only snapshot faculty needs to review: treatment, storyboard, shots, cues, rights, budget, reviews history."""
    faculty_id = claims["sub"]
    project = await _assert_faculty_can_view(project_id, faculty_id)
    student = await db.users.find_one(
        {"id": project.get("owner_id")}, {"_id": 0, "password_hash": 0}
    ) or {"id": project.get("owner_id"), "name": "Unknown"}
    scripts = await db.script_documents.find({"project_id": project_id}, {"_id": 0}).to_list(50)
    frames = await db.storyboard_frames.find({"project_id": project_id}, {"_id": 0}).sort("order", 1).to_list(200)
    scenes = await db.prod_scenes.find({"project_id": project_id}, {"_id": 0}).to_list(200)
    shots = await db.prod_shots.find({"project_id": project_id}, {"_id": 0}).to_list(500)
    music = await db.music_tracks.find_one({"project_id": project_id}, {"_id": 0})
    cues = await db.sync_cues.find({"project_id": project_id}, {"_id": 0}).sort("timestamp", 1).to_list(200)
    rights = await db.rights_records.find({"project_id": project_id}, {"_id": 0}).to_list(100)
    budget = await db.prod_budget.find({"project_id": project_id}, {"_id": 0}).to_list(200)
    reviews = await db.faculty_reviews.find({"project_id": project_id}, {"_id": 0}).sort("created_at", -1).to_list(500)

    # Compute the latest non-superseded status
    latest_status = next(
        (r for r in reviews if r.get("kind") == "status" and not r.get("superseded_by")), None
    )
    # Latest non-superseded rubric event
    latest_rubric = next(
        (r for r in reviews if r.get("kind") == "rubric" and not r.get("superseded_by")), None
    )

    return {
        "project": project,
        "student": student,
        "scripts": scripts,
        "storyboard_frames": frames,
        "scenes": scenes,
        "shots": shots,
        "music": music,
        "cues": cues,
        "rights": rights,
        "budget": budget,
        "reviews": reviews,
        "latest_status": (latest_status or {}).get("status_value", "open"),
        "latest_rubric": latest_rubric,
        "rubric": {"competencies": RUBRIC_COMPETENCIES, "scale": {"min": 1, "max": 5}},
    }


async def _record_review(project_id: str, faculty_id: str, payload: dict) -> dict:
    """Insert an append-only review event. Supersedes a previous review if `supersedes` is provided.

    Also spawns a notification for the project owner so nothing waits unseen.
    The immutable review row is inserted BEFORE the notification, and the
    notification failure never blocks the review — the log stays the source
    of truth even if delivery is degraded.
    """
    kind = payload.get("kind")
    if kind not in REVIEW_KINDS:
        raise HTTPException(400, f"Invalid review kind: {kind}")
    supersedes = payload.get("supersedes")
    doc = {
        "id": _uid(),
        "project_id": project_id,
        "faculty_id": faculty_id,
        "kind": kind,
        "message": (payload.get("message") or "").strip() or None,
        "timestamp_seconds": payload.get("timestamp_seconds"),
        "target_ref": payload.get("target_ref"),
        "target_type": payload.get("target_type"),
        "rubric_scores": payload.get("rubric_scores"),
        "status_value": payload.get("status_value"),
        "supersedes": supersedes,
        "superseded_by": None,
        "created_at": _now_iso(),
    }
    if kind == "time_coded" and doc["timestamp_seconds"] is None:
        raise HTTPException(400, "time_coded review requires timestamp_seconds")
    if kind == "status" and doc["status_value"] not in REVIEW_STATUSES:
        raise HTTPException(400, "status review requires a valid status_value")
    if kind == "rubric" and not isinstance(doc["rubric_scores"], dict):
        raise HTTPException(400, "rubric review requires rubric_scores object")
    if kind == "frame_feedback":
        if not doc.get("target_ref"):
            raise HTTPException(400, "frame_feedback requires target_ref (frame_id)")
        # Force the target_type so the shape is unambiguous downstream.
        doc["target_type"] = "storyboard_frame"
        frame = await db.storyboard_frames.find_one(
            {"id": doc["target_ref"], "project_id": project_id}, {"_id": 0}
        )
        if not frame:
            raise HTTPException(404, "Storyboard frame not found on this project")

    await db.faculty_reviews.insert_one(doc)
    doc.pop("_id", None)

    # Mark the previous one as superseded (still visible in history — never deleted)
    if supersedes:
        await db.faculty_reviews.update_one(
            {"id": supersedes, "project_id": project_id},
            {"$set": {"superseded_by": doc["id"]}},
        )

    # Fire-and-log notification to the student. Never blocks review insertion.
    try:
        await _spawn_review_notification(doc)
    except Exception:
        logger.exception("Review notification failed (review still recorded)")

    return doc


REVIEW_KIND_HEADLINE = {
    "written": "left you a written note",
    "time_coded": "left a time-coded note on your rough cut",
    "coverage_response": "responded to a Coverage Coach suggestion",
    "rubric": "posted a rubric evaluation",
    "status": "updated your milestone status",
    "frame_feedback": "pinned a note to a storyboard frame",
}


async def _spawn_review_notification(review: dict) -> None:
    """Emit a review event: builds the ANCR-shaped envelope, dispatches to
    every registered sink (local bell today, ANCR bus tomorrow), and persists
    the envelope alongside the local doc so the outbound state stays visible.
    """
    project = await db.projects.find_one({"id": review["project_id"]}, {"_id": 0})
    if not project:
        return
    faculty = await db.users.find_one({"id": review["faculty_id"]}, {"_id": 0}) or {}
    faculty_name = faculty.get("name") or "Your faculty mentor"
    project_title = project.get("title") or "your project"

    headline = REVIEW_KIND_HEADLINE.get(review["kind"], "left new feedback")
    message = f"{faculty_name} {headline} on {project_title}."
    if review["kind"] == "status" and review.get("status_value"):
        message = (
            f"{faculty_name} set {project_title}'s status to "
            f"“{review['status_value'].replace('_', ' ')}”."
        )
    if review["kind"] == "time_coded" and review.get("timestamp_seconds") is not None:
        m = int(review["timestamp_seconds"] // 60)
        s = int(review["timestamp_seconds"] % 60)
        message = f"{faculty_name} left a note at {m}:{s:02d} on {project_title}."
    if review["kind"] == "coverage_response" and review.get("target_ref"):
        message = (
            f"{faculty_name} weighed in on Coverage Coach — Scene {review['target_ref']} "
            f"of {project_title}."
        )
    if review["kind"] == "frame_feedback" and review.get("target_ref"):
        message = (
            f"{faculty_name} pinned a note to a storyboard frame on {project_title}."
        )

    # Frame feedback jumps straight to the frame in Story Lab; everything else
    # opens the Reviews inbox at the exact event.
    if review["kind"] == "frame_feedback" and review.get("target_ref"):
        deep_link = (
            f"/story-lab?project={review['project_id']}&frame={review['target_ref']}"
        )
    else:
        deep_link = f"/reviews?project={review['project_id']}&review={review['id']}"

    # Refuse to emit an unregistered deep_link — protects the ANCR contract.
    if resolve_deep_link(deep_link) is None:
        logger.error(
            "Refusing to emit notification with unregistered deep_link: %s", deep_link
        )
        return

    now = _now_iso()
    event_type = REVIEW_KIND_TO_EVENT.get(review["kind"], "review.unknown")

    envelope = {
        "event_type": event_type,
        "actor": {
            "user_id": review["faculty_id"],
            "name": faculty_name,
            "ancrid": None,  # populated once ANCRID SSO ships
        },
        "recipient": {
            "user_id": project.get("owner_id"),
            "ancrid": None,
        },
        "subject": {
            "kind": "project",
            "id": review["project_id"],
            "title": project_title,
        },
        "payload": {
            "review_id": review["id"],
            "kind": review["kind"],
            "message": review.get("message"),
            "timestamp_seconds": review.get("timestamp_seconds"),
            "target_ref": review.get("target_ref"),
            "target_type": review.get("target_type"),
            "rubric_scores": review.get("rubric_scores"),
            "status_value": review.get("status_value"),
            "supersedes": review.get("supersedes"),
        },
        "deep_link": deep_link,
        "ancr_ready": True,
        "ancr_emitted_at": None,
        "created_at": now,
    }

    # Local notification document (what the bell popover reads).
    note = {
        "id": _uid(),
        "user_id": project.get("owner_id"),
        "message": message,
        "type": "review",
        "read": False,
        "project_id": review["project_id"],
        "project_title": project_title,
        "review_id": review["id"],
        "review_kind": review["kind"],
        "review_status_value": review.get("status_value"),
        "author_name": faculty_name,
        "deep_link": deep_link,
        "created_at": now,
        # Envelope fields inlined so `GET /api/notifications` returns everything
        # ANCR would need without a second lookup.
        **{k: envelope[k] for k in ("event_type", "actor", "recipient", "subject", "payload", "ancr_ready", "ancr_emitted_at")},
    }

    channel_results = await _get_notification_dispatcher().dispatch(envelope, note)
    # Persist channel status onto the same document (LocalBellSink already
    # inserted it — this is a targeted update).
    await db.notifications.update_one(
        {"id": note["id"]}, {"$set": {"channels": channel_results}}
    )


@api.post("/faculty/projects/{project_id}/reviews")
async def create_review(
    project_id: str, payload: dict, claims: dict = Depends(require_faculty)
):
    faculty_id = claims["sub"]
    await _assert_faculty_can_view(project_id, faculty_id)
    return await _record_review(project_id, faculty_id, payload)


@api.get("/projects/{project_id}/reviews")
async def project_reviews(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Feedback timeline visible to the project owner AND any assigned faculty. Append-only, never overwritten."""
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(404, "Project not found")
    if project.get("owner_id") != user_id:
        assignment = await db.assignments.find_one(
            {"project_id": project_id, "faculty_id": user_id}, {"_id": 0}
        )
        if not assignment:
            raise HTTPException(403, "Not authorised to view feedback for this project")
    reviews = await db.faculty_reviews.find({"project_id": project_id}, {"_id": 0}).sort("created_at", -1).to_list(500)
    faculty_ids = list({r["faculty_id"] for r in reviews if r.get("faculty_id")})
    faculty = await db.users.find({"id": {"$in": faculty_ids}}, {"_id": 0, "password_hash": 0}).to_list(200)
    fac_map = {u["id"]: {"id": u["id"], "name": u.get("name"), "avatar_url": u.get("avatar_url")} for u in faculty}
    for r in reviews:
        r["author"] = fac_map.get(r.get("faculty_id"), {"id": r.get("faculty_id"), "name": "Faculty"})
    latest_status = next(
        (r for r in reviews if r.get("kind") == "status" and not r.get("superseded_by")), None
    )
    latest_rubric = next(
        (r for r in reviews if r.get("kind") == "rubric" and not r.get("superseded_by")), None
    )
    return {
        "project_id": project_id,
        "reviews": reviews,
        "latest_status": (latest_status or {}).get("status_value", "open"),
        "latest_rubric": latest_rubric,
        "rubric": {"competencies": RUBRIC_COMPETENCIES, "scale": {"min": 1, "max": 5}},
    }


@api.get("/student/reviews-summary")
async def student_reviews_summary(user_id: str = Depends(get_current_user_id)):
    """Reviews inbox for the currently-logged-in student across all their projects."""
    projects = await db.projects.find({"owner_id": user_id}, {"_id": 0}).to_list(200)
    project_ids = [p["id"] for p in projects]
    if not project_ids:
        return {"projects": []}
    reviews = await db.faculty_reviews.find({"project_id": {"$in": project_ids}}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    by_pid: dict = {}
    for r in reviews:
        by_pid.setdefault(r["project_id"], []).append(r)
    faculty_ids = list({r["faculty_id"] for r in reviews if r.get("faculty_id")})
    faculty = await db.users.find({"id": {"$in": faculty_ids}}, {"_id": 0, "password_hash": 0}).to_list(200)
    fac_map = {u["id"]: {"id": u["id"], "name": u.get("name"), "avatar_url": u.get("avatar_url")} for u in faculty}
    result = []
    for p in projects:
        pid_reviews = by_pid.get(p["id"], [])
        for r in pid_reviews:
            r["author"] = fac_map.get(r.get("faculty_id"), {"id": r.get("faculty_id"), "name": "Faculty"})
        latest_status = next(
            (r for r in pid_reviews if r.get("kind") == "status" and not r.get("superseded_by")), None
        )
        result.append({
            "project": p,
            "status": (latest_status or {}).get("status_value", "open"),
            "review_count": len([r for r in pid_reviews if not r.get("superseded_by")]),
            "latest_review_at": pid_reviews[0]["created_at"] if pid_reviews else None,
            "reviews": pid_reviews[:12],
        })
    result.sort(key=lambda x: x["latest_review_at"] or "", reverse=True)
    return {"projects": result}


async def _ensure_checklist(project_id: str, kind: str) -> dict:
    """Fetch a checklist, seeding it with defaults on first read."""
    doc = await db.finish_checklists.find_one({"project_id": project_id, "kind": kind}, {"_id": 0})
    if doc:
        return doc
    defaults = {
        "accessibility": DEFAULT_ACCESSIBILITY_ITEMS,
        "delivery": DEFAULT_DELIVERY_ITEMS,
    }.get(kind, [])
    doc = {
        "project_id": project_id,
        "kind": kind,
        "items": [{**x, "done": False, "note": None} for x in defaults],
        "updated_at": _now_iso(),
    }
    await db.finish_checklists.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.get("/projects/{project_id}/finish/overview")
async def finish_overview(project_id: str, user_id: str = Depends(get_current_user_id)):
    """One-shot payload the Edit & Finish page renders from."""
    project = await _assert_project_owner(project_id, user_id)
    versions = await db.edit_versions.find({"project_id": project_id}, {"_id": 0}).sort("created_at", -1).to_list(200)
    finishing_notes = await db.finishing_notes.find({"project_id": project_id}, {"_id": 0}).sort("created_at", -1).to_list(200)
    credits = await db.credits.find({"project_id": project_id}, {"_id": 0}).sort("position", 1).to_list(200)
    captions = await db.captions.find({"project_id": project_id}, {"_id": 0}).sort("created_at", 1).to_list(50)
    accessibility = await _ensure_checklist(project_id, "accessibility")
    delivery = await _ensure_checklist(project_id, "delivery")

    current = next((v for v in versions if not v.get("superseded_by")), versions[0] if versions else None)
    time_coded_reviews = []
    if current:
        time_coded_reviews = await db.faculty_reviews.find(
            {"project_id": project_id, "kind": "time_coded"}, {"_id": 0}
        ).sort("created_at", -1).to_list(200)

    return {
        "project": project,
        "versions": versions,
        "current_version": current,
        "finishing_notes": finishing_notes,
        "credits": credits,
        "captions": captions,
        "accessibility": accessibility,
        "delivery": delivery,
        "time_coded_reviews": time_coded_reviews,
        "stages": list(EDIT_STAGES),
        "approval_statuses": list(APPROVAL_STATUSES),
    }


# ---- CRUD dispatcher for the Edit & Finish workspace ----
_FINISH_KIND_TO_COLLECTION = {
    "version": "edit_versions",
    "note": "finishing_notes",
    "credit": "credits",
    "caption": "captions",
}


def _finish_model(kind: str):
    return {
        "version": EditVersion,
        "note": FinishingNote,
        "credit": CreditLine,
        "caption": Caption,
    }[kind]


@api.post("/projects/{project_id}/finish/{kind}")
async def finish_create(project_id: str, kind: str, payload: dict, user_id: str = Depends(get_current_user_id)):
    if kind not in _FINISH_KIND_TO_COLLECTION:
        raise HTTPException(400, f"Unknown finish kind: {kind}")
    await _assert_project_owner(project_id, user_id)
    payload = {**payload, "project_id": project_id, "owner_id": user_id}
    if kind == "version":
        existing_count = await db.edit_versions.count_documents({"project_id": project_id})
        payload.setdefault("version_number", existing_count + 1)
        payload.setdefault("stage", "rough_cut")
        if payload["stage"] not in EDIT_STAGES:
            raise HTTPException(400, f"Invalid stage; must be one of {EDIT_STAGES}")
    doc = _finish_model(kind)(**payload).model_dump()
    await db[_FINISH_KIND_TO_COLLECTION[kind]].insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.patch("/finish/{kind}/{item_id}")
async def finish_update(kind: str, item_id: str, patch: dict, user_id: str = Depends(get_current_user_id)):
    if kind not in _FINISH_KIND_TO_COLLECTION:
        raise HTTPException(400, "Unknown finish kind")
    coll = db[_FINISH_KIND_TO_COLLECTION[kind]]
    row = await coll.find_one({"id": item_id}, {"_id": 0})
    if not row:
        raise HTTPException(404, "Not found")
    await _assert_project_owner(row["project_id"], user_id)
    if kind == "version" and "stage" in patch and patch["stage"] not in EDIT_STAGES:
        raise HTTPException(400, f"Invalid stage; must be one of {EDIT_STAGES}")
    update = {k: v for k, v in patch.items() if k not in {"id", "project_id", "owner_id"}}
    await coll.update_one({"id": item_id}, {"$set": update})
    updated = await coll.find_one({"id": item_id}, {"_id": 0})
    return updated


@api.delete("/finish/{kind}/{item_id}")
async def finish_delete(kind: str, item_id: str, user_id: str = Depends(get_current_user_id)):
    if kind not in _FINISH_KIND_TO_COLLECTION:
        raise HTTPException(400, "Unknown finish kind")
    coll = db[_FINISH_KIND_TO_COLLECTION[kind]]
    row = await coll.find_one({"id": item_id}, {"_id": 0})
    if not row:
        raise HTTPException(404, "Not found")
    await _assert_project_owner(row["project_id"], user_id)
    await coll.delete_one({"id": item_id})
    return {"deleted": True}


# ---- Checklists ----
@api.patch("/projects/{project_id}/finish/checklist/{kind}")
async def update_checklist(
    project_id: str, kind: str, payload: dict, user_id: str = Depends(get_current_user_id)
):
    if kind not in {"accessibility", "delivery"}:
        raise HTTPException(400, "Unknown checklist kind")
    await _assert_project_owner(project_id, user_id)
    await _ensure_checklist(project_id, kind)  # ensure defaults exist
    key = payload.get("key")
    if not key:
        raise HTTPException(400, "key is required")
    done = bool(payload.get("done", False))
    note = payload.get("note")
    doc = await db.finish_checklists.find_one({"project_id": project_id, "kind": kind}, {"_id": 0})
    items = doc["items"]
    updated = False
    for it in items:
        if it["key"] == key:
            it["done"] = done
            if note is not None:
                it["note"] = note
            updated = True
            break
    if not updated:
        raise HTTPException(404, f"Checklist item {key} not found")
    await db.finish_checklists.update_one(
        {"project_id": project_id, "kind": kind},
        {"$set": {"items": items, "updated_at": _now_iso()}},
    )
    return {"project_id": project_id, "kind": kind, "items": items}


# ---- Video upload for a version ----
UPLOAD_ROOT = Path("/app/backend/uploaded_video")
UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)


@api.post("/finish/version/{version_id}/upload")
async def upload_version_video(
    version_id: str,
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
):
    version = await db.edit_versions.find_one({"id": version_id}, {"_id": 0})
    if not version:
        raise HTTPException(404, "Version not found")
    await _assert_project_owner(version["project_id"], user_id)
    if not file.filename:
        raise HTTPException(400, "Missing filename")
    ext = Path(file.filename).suffix.lower()
    if ext not in {".mp4", ".mov", ".webm"}:
        raise HTTPException(400, "Unsupported video type. Use MP4, MOV, or WebM.")
    safe_name = f"{version_id}{ext}"
    target = UPLOAD_ROOT / safe_name
    content = await file.read()
    if len(content) > 250 * 1024 * 1024:  # 250 MB cap
        raise HTTPException(400, "Video too large (limit 250 MB)")
    target.write_bytes(content)
    url = f"/api/finish/video/{safe_name}"
    await db.edit_versions.update_one(
        {"id": version_id}, {"$set": {"video_url": url, "duration_seconds": version.get("duration_seconds") or None}}
    )
    updated = await db.edit_versions.find_one({"id": version_id}, {"_id": 0})
    return updated


@api.get("/finish/video/{filename}")
async def get_finish_video(filename: str, request: Request):
    # Guard against path traversal — only allow the flat filename pattern used
    # by upload_version_video (uuid + ext).
    if "/" in filename or ".." in filename:
        raise HTTPException(400, "Invalid filename")
    user_id = _authenticate_media(request)
    p = UPLOAD_ROOT / filename
    if not p.exists():
        raise HTTPException(404)
    # Filename embeds the version_id (uuid + ext). Trust the DB lookup.
    version_id = filename.rsplit(".", 1)[0]
    version = await db.edit_versions.find_one({"id": version_id}, {"_id": 0, "project_id": 1})
    if not version:
        raise HTTPException(404)
    await _media_project_check(user_id, version["project_id"])
    ext = p.suffix.lower()
    media = {".mp4": "video/mp4", ".mov": "video/quicktime", ".webm": "video/webm"}.get(ext, "application/octet-stream")
    return FileResponse(p, media_type=media)


# ---- Approval gate: final version requires rights + checklists ----
async def _final_gate_report(project_id: str) -> dict:
    """Return the blockers preventing a `final` version approval."""
    rights = await db.rights_records.find({"project_id": project_id}, {"_id": 0}).to_list(200)
    rights_ok = bool(rights) and all(r.get("consent_recorded") for r in rights)
    accessibility = await _ensure_checklist(project_id, "accessibility")
    delivery = await _ensure_checklist(project_id, "delivery")
    accessibility_ok = all(x["done"] for x in accessibility["items"])
    delivery_ok = all(x["done"] for x in delivery["items"])
    blockers = []
    if not rights:
        blockers.append("No rights records logged. Add contributors + consent before final approval.")
    elif not rights_ok:
        blockers.append("Not every rights record has consent_recorded=true.")
    if not accessibility_ok:
        blockers.append("Accessibility checklist incomplete.")
    if not delivery_ok:
        blockers.append("Delivery checklist incomplete.")
    return {"ok": len(blockers) == 0, "blockers": blockers}


@api.get("/projects/{project_id}/finish/final-gate")
async def final_gate(project_id: str, user_id: str = Depends(get_current_user_id)):
    await _assert_project_owner(project_id, user_id)
    return await _final_gate_report(project_id)


@api.post("/finish/version/{version_id}/approve")
async def approve_version(
    version_id: str,
    payload: dict,
    claims: dict = Depends(require_faculty),
):
    """Faculty-only approval on a version. Enforces the rights-clearance +
    accessibility + delivery gate before allowing a `final` stage version to be
    approved. Every approval creates an append-only faculty review row too so
    the immutable history captures the decision.
    """
    faculty_id = claims["sub"]
    version = await db.edit_versions.find_one({"id": version_id}, {"_id": 0})
    if not version:
        raise HTTPException(404, "Version not found")
    await _assert_faculty_can_view(version["project_id"], faculty_id)

    new_status = payload.get("approval_status")
    if new_status not in APPROVAL_STATUSES:
        raise HTTPException(400, f"approval_status must be one of {APPROVAL_STATUSES}")

    if new_status == "approved" and version.get("stage") == "final":
        gate = await _final_gate_report(version["project_id"])
        if not gate["ok"]:
            raise HTTPException(
                400,
                "Final approval blocked: " + " · ".join(gate["blockers"]),
            )

    now = _now_iso()
    update = {
        "approval_status": new_status,
        "approval_message": (payload.get("message") or None),
        "approved_by": faculty_id if new_status == "approved" else version.get("approved_by"),
        "approved_at": now if new_status == "approved" else version.get("approved_at"),
    }
    await db.edit_versions.update_one({"id": version_id}, {"$set": update})

    # Mirror the decision into the append-only review log so the student's
    # inbox surfaces it alongside other faculty feedback.
    await _record_review(
        version["project_id"],
        faculty_id,
        {
            "kind": "status",
            "status_value": (
                "approved" if new_status == "approved"
                else "revision_requested" if new_status == "changes_requested"
                else "open"
            ),
            "message": f"Version v{version.get('version_number','?')} ({version.get('stage','')}): {payload.get('message') or new_status}",
        },
    )

    updated = await db.edit_versions.find_one({"id": version_id}, {"_id": 0})
    return updated


import cyna_service  # noqa: E402

# ---------- Cyna (in-app mentor) ----------
@api.get("/cyna/sessions")
async def cyna_list_sessions(user_id: str = Depends(get_current_user_id)):
    docs = await db.cyna_sessions.find({"user_id": user_id}, {"_id": 0}).sort("updated_at", -1).to_list(200)
    return docs


@api.post("/cyna/sessions")
async def cyna_create_session(payload: dict = None, user_id: str = Depends(get_current_user_id)):
    payload = payload or {}
    doc = {
        "id": _uid(),
        "user_id": user_id,
        "title": (payload.get("title") or "New conversation with Cyna").strip()[:120],
        "project_id": payload.get("project_id"),
        "created_at": _now_iso(),
        "updated_at": _now_iso(),
    }
    await db.cyna_sessions.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.delete("/cyna/sessions/{session_id}")
async def cyna_delete_session(session_id: str, user_id: str = Depends(get_current_user_id)):
    sess = await db.cyna_sessions.find_one({"id": session_id, "user_id": user_id}, {"_id": 0})
    if not sess:
        raise HTTPException(404)
    await db.cyna_sessions.delete_one({"id": session_id})
    await db.cyna_messages.delete_many({"session_id": session_id})
    return {"deleted": True}


@api.get("/cyna/sessions/{session_id}/messages")
async def cyna_list_messages(session_id: str, user_id: str = Depends(get_current_user_id)):
    sess = await db.cyna_sessions.find_one({"id": session_id, "user_id": user_id}, {"_id": 0})
    if not sess:
        raise HTTPException(404)
    msgs = await db.cyna_messages.find({"session_id": session_id}, {"_id": 0}).sort("created_at", 1).to_list(500)
    return {"session": sess, "messages": msgs}


@api.post("/cyna/sessions/{session_id}/chat")
async def cyna_chat(session_id: str, payload: dict, user_id: str = Depends(get_current_user_id)):
    sess = await db.cyna_sessions.find_one({"id": session_id, "user_id": user_id}, {"_id": 0})
    if not sess:
        raise HTTPException(404)
    content = (payload.get("message") or "").strip()
    if not content:
        raise HTTPException(400, "message is required")
    if len(content) > 4000:
        raise HTTPException(400, "message too long (limit 4000 chars)")

    project_id = payload.get("project_id") or sess.get("project_id")
    digest = None
    if project_id:
        digest = await cyna_service.build_project_digest(db, project_id, user_id)

    history = await db.cyna_messages.find({"session_id": session_id}, {"_id": 0}).sort("created_at", 1).to_list(500)

    user_msg = {
        "id": _uid(),
        "session_id": session_id,
        "user_id": user_id,
        "role": "user",
        "content": content,
        "created_at": _now_iso(),
    }
    await db.cyna_messages.insert_one(user_msg)

    try:
        text, actions = await cyna_service.chat_turn(history, content, digest)
    except Exception as exc:
        logger.exception("Cyna chat failed")
        raise HTTPException(502, f"Cyna is unavailable right now ({exc.__class__.__name__})") from exc

    assistant_msg = {
        "id": _uid(),
        "session_id": session_id,
        "user_id": user_id,
        "role": "assistant",
        "content": text,
        "proposed_actions": actions,
        "created_at": _now_iso(),
    }
    await db.cyna_messages.insert_one(assistant_msg)

    # Title inference on the first turn.
    updates: dict = {"updated_at": _now_iso()}
    if not history and sess.get("title", "").startswith("New conversation"):
        title = content[:60].strip()
        if len(content) > 60:
            title += "…"
        updates["title"] = title
    if project_id and not sess.get("project_id"):
        updates["project_id"] = project_id
    await db.cyna_sessions.update_one({"id": session_id}, {"$set": updates})

    user_msg.pop("_id", None)
    assistant_msg.pop("_id", None)
    return {"user_message": user_msg, "assistant_message": assistant_msg}


@api.post("/cyna/actions/execute")
async def cyna_execute_action(payload: dict, user_id: str = Depends(get_current_user_id)):
    """Apply a Cyna-proposed action after the student explicitly approves it."""
    action = payload.get("action") or {}
    project_id = payload.get("project_id")
    if not project_id or not action.get("kind"):
        raise HTTPException(400, "project_id and action.kind are required")
    await _assert_project_owner(project_id, user_id)
    kind = action["kind"]

    if kind == "draft_script":
        doc = ScriptDocument(
            project_id=project_id,
            owner_id=user_id,
            title=(action.get("title") or "Cyna draft")[:200],
            content=action.get("content") or "",
            kind=(action.get("script_kind") or "treatment"),
        )
        await db.script_documents.insert_one(doc.model_dump())
        return {"kind": kind, "created_id": doc.id, "status": "created"}

    if kind == "add_finishing_note":
        doc = {
            "id": _uid(),
            "project_id": project_id,
            "owner_id": user_id,
            "category": action.get("category") or "general",
            "body": action.get("body") or "",
            "resolved": False,
            "created_at": _now_iso(),
        }
        await db.finishing_notes.insert_one(doc)
        return {"kind": kind, "created_id": doc["id"], "status": "created"}

    if kind == "add_shot":
        scene_id = action.get("scene_id")
        if not scene_id:
            raise HTTPException(400, "add_shot requires scene_id")
        scene = await db.prod_scenes.find_one({"id": scene_id, "project_id": project_id}, {"_id": 0})
        if not scene:
            raise HTTPException(404, "Scene not found on this project")
        existing = await db.prod_shots.count_documents({"scene_id": scene_id})
        doc = {
            "id": _uid(),
            "project_id": project_id,
            "owner_id": user_id,
            "scene_id": scene_id,
            "number": existing + 1,
            "description": action.get("description") or "",
            "shot_size": action.get("shot_size") or "MS",
            "camera_move": action.get("camera_move") or "static",
            "status": "planned",
            "created_at": _now_iso(),
        }
        await db.prod_shots.insert_one(doc)
        return {"kind": kind, "created_id": doc["id"], "status": "created"}

    raise HTTPException(400, f"Unknown action kind: {kind}")


# ---------- mount ----------
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    try:
        result = await ensure_seed(db)
        logger.info("Seed result: %s", result)
    except Exception:
        logger.exception("Seed failed at startup")


@app.on_event("shutdown")
async def on_shutdown():
    client.close()
