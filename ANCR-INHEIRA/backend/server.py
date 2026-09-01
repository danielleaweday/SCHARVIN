"""SONGRIGHT™ backend — creative ownership infrastructure."""
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, Query, UploadFile, File, Form, Response, Request, Cookie
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import secrets
import hashlib
import jwt
import bcrypt
import requests as http_requests
import json
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta

import evidence as evidence_recorder
import media_evidence
import mci as mci_engine
import comparison as comparison_engine
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET"]
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
APP_NAME = os.environ.get("APP_NAME", "songright")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="SONGRIGHT API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


# ---------- Object Storage ----------
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
_storage_key: Optional[str] = None


def init_storage() -> Optional[str]:
    global _storage_key
    if _storage_key:
        return _storage_key
    if not EMERGENT_LLM_KEY:
        return None
    try:
        resp = http_requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_LLM_KEY}, timeout=30)
        resp.raise_for_status()
        _storage_key = resp.json()["storage_key"]
        return _storage_key
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
        return None


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    if not key:
        raise HTTPException(status_code=500, detail="Storage not initialized")
    resp = http_requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data,
        timeout=120,
    )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str) -> tuple:
    key = init_storage()
    if not key:
        raise HTTPException(status_code=500, detail="Storage not initialized")
    resp = http_requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


# ---------- Models ----------
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    legal_name: Optional[str] = None
    professional_name: Optional[str] = None
    phone: Optional[str] = None
    country: Optional[str] = None
    pro: Optional[str] = None
    ipi_number: Optional[str] = None
    publisher: Optional[str] = None
    publishing_split: Optional[float] = None
    label: Optional[str] = None
    manager: Optional[str] = None
    attorney: Optional[str] = None
    website: Optional[str] = None
    social_links: Dict[str, str] = Field(default_factory=dict)
    disciplines: List[str] = Field(default_factory=list)
    instruments: List[str] = Field(default_factory=list)
    genres: List[str] = Field(default_factory=list)
    biography: Optional[str] = None
    verification_status: str = "unverified"
    created_at: Optional[str] = None


class ProfileUpdate(BaseModel):
    legal_name: Optional[str] = None
    professional_name: Optional[str] = None
    phone: Optional[str] = None
    country: Optional[str] = None
    pro: Optional[str] = None
    ipi_number: Optional[str] = None
    publisher: Optional[str] = None
    publishing_split: Optional[float] = None
    label: Optional[str] = None
    manager: Optional[str] = None
    attorney: Optional[str] = None
    website: Optional[str] = None
    social_links: Optional[Dict[str, str]] = None
    disciplines: Optional[List[str]] = None
    instruments: Optional[List[str]] = None
    genres: Optional[List[str]] = None
    biography: Optional[str] = None
    picture: Optional[str] = None


class SessionCreate(BaseModel):
    title: str
    working_title: Optional[str] = None
    project: Optional[str] = None
    album: Optional[str] = None
    location: Optional[str] = None
    session_type: str = "private"
    date: Optional[str] = None
    context: str = "industry"  # industry | university | writing_camp | studio


class SessionPatch(BaseModel):
    title: Optional[str] = None
    working_title: Optional[str] = None
    song_meta: Optional[Dict[str, Any]] = None
    completion: Optional[Dict[str, str]] = None
    rights: Optional[Dict[str, Any]] = None
    status: Optional[str] = None


class LyricLineCreate(BaseModel):
    section: str
    text: str


class LyricLineUpdate(BaseModel):
    text: str


class EventCreate(BaseModel):
    kind: str  # e.g. lyric_line, contribution, arrangement, note
    label: str
    meta: Optional[Dict[str, Any]] = None


class MessageCreate(BaseModel):
    text: str
    kind: str = "text"  # text | voice | idea | pin


class ContributionCreate(BaseModel):
    role: str  # Lyrics, Melody, Harmony, Production, etc.
    description: str
    weight: Optional[float] = 1.0
    audio_url: Optional[str] = None
    lyrics_content: Optional[str] = None


class SplitEntry(BaseModel):
    user_id: str
    name: str
    role: str
    percentage: float
    publisher: Optional[str] = None
    pro: Optional[str] = None
    ipi: Optional[str] = None


class SplitApproval(BaseModel):
    approved: bool
    signature: Optional[str] = None


class SplitsProposal(BaseModel):
    splits: List[SplitEntry]


# ---------- Auth helpers ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_jwt(user_id: str, days: int = 7) -> str:
    exp = datetime.now(timezone.utc) + timedelta(days=days)
    payload = {"user_id": user_id, "exp": int(exp.timestamp())}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def decode_jwt(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload.get("user_id")
    except Exception:
        return None


async def get_current_user(
    request: Request,
    authorization: Optional[str] = Header(None),
    session_token: Optional[str] = Cookie(None),
) -> dict:
    token = None
    # Emergent session token via cookie
    if session_token:
        # Check user_sessions
        session_doc = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
        if session_doc:
            expires_at = session_doc.get("expires_at")
            if isinstance(expires_at, str):
                expires_at = datetime.fromisoformat(expires_at)
            if expires_at and expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if expires_at and expires_at >= datetime.now(timezone.utc):
                user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0, "password_hash": 0})
                if user_doc:
                    return user_doc

    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:]

    # Also allow session token via Authorization header
    if token:
        # Try JWT first
        user_id = decode_jwt(token)
        if user_id:
            user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
            if user_doc:
                return user_doc
        # Try session token
        session_doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
        if session_doc:
            user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0, "password_hash": 0})
            if user_doc:
                return user_doc

    raise HTTPException(status_code=401, detail="Not authenticated")


def user_to_public(doc: dict) -> dict:
    doc.pop("password_hash", None)
    doc.pop("_id", None)
    return doc


# ---------- Auth endpoints ----------
@api_router.post("/auth/register")
async def register(payload: UserRegister):
    existing = await db.users.find_one({"email": payload.email.lower()}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    now_iso = datetime.now(timezone.utc).isoformat()
    user_doc = {
        "user_id": user_id,
        "email": payload.email.lower(),
        "name": payload.name,
        "password_hash": hash_password(payload.password),
        "picture": None,
        "auth_provider": "password",
        "verification_status": "unverified",
        "disciplines": [],
        "instruments": [],
        "genres": [],
        "social_links": {},
        "created_at": now_iso,
    }
    await db.users.insert_one(user_doc)
    token = create_jwt(user_id)
    return {"token": token, "user": user_to_public(user_doc)}


@api_router.post("/auth/login")
async def login(payload: UserLogin):
    user_doc = await db.users.find_one({"email": payload.email.lower()}, {"_id": 0})
    if not user_doc or not user_doc.get("password_hash"):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(payload.password, user_doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_jwt(user_doc["user_id"])
    return {"token": token, "user": user_to_public(dict(user_doc))}


@api_router.post("/auth/session")
async def emergent_session(request: Request, response: Response):
    """Exchange Emergent session_id for a session_token."""
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        body = await request.json()
        session_id = body.get("session_id") if body else None
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session_id")

    resp = http_requests.get(
        "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
        headers={"X-Session-ID": session_id},
        timeout=15,
    )
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session")
    data = resp.json()
    email = data["email"].lower()
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        # update picture/name
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": data.get("name", existing.get("name")), "picture": data.get("picture")}},
        )
        user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": data.get("name", email.split("@")[0]),
            "picture": data.get("picture"),
            "auth_provider": "google",
            "verification_status": "verified",
            "disciplines": [],
            "instruments": [],
            "genres": [],
            "social_links": {},
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.users.insert_one(user_doc)

    session_token = data["session_token"]
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one(
        {
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": expires_at.isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
    )
    response.set_cookie(
        "session_token",
        session_token,
        max_age=7 * 24 * 60 * 60,
        path="/",
        httponly=True,
        secure=True,
        samesite="none",
    )
    return {"token": session_token, "user": user_to_public(dict(user_doc))}


@api_router.get("/auth/me")
async def auth_me(user: dict = Depends(get_current_user)):
    return user_to_public(user)


@api_router.post("/auth/logout")
async def logout(response: Response, session_token: Optional[str] = Cookie(None)):
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie("session_token", path="/")
    return {"ok": True}


# ---------- Profile ----------
@api_router.put("/profile/me")
async def update_profile(payload: ProfileUpdate, user: dict = Depends(get_current_user)):
    update = {k: v for k, v in payload.dict(exclude_unset=True).items() if v is not None}
    if update:
        await db.users.update_one({"user_id": user["user_id"]}, {"$set": update})
        # RightsPrint™ update — permanent Creative Evidence™ across every session.
        await evidence_recorder.record_event(
            db, kind="rightprint_updated", session_id=None, actor_id=user["user_id"],
            actor_name=user.get("name"),
            label=f"{user.get('name')} updated their RightsPrint™",
            payload={"changed_fields": list(update.keys())},
        )
    updated = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0, "password_hash": 0})
    return user_to_public(updated)


@api_router.get("/profile/{user_id}")
async def get_profile(user_id: str):
    doc = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")
    return user_to_public(doc)


@api_router.get("/creators/{user_id}/discography")
async def creator_discography(user_id: str):
    docs = await db.sessions.find(
        {"collaborators.user_id": user_id}, {"_id": 0}
    ).sort("created_at", -1).to_list(500)
    # Slim payload
    out = []
    for s in docs:
        my = next((c for c in s.get("collaborators", []) if c["user_id"] == user_id), None)
        out.append({
            "session_id": s["session_id"],
            "title": s.get("title"),
            "working_title": s.get("working_title"),
            "project": s.get("project"),
            "date": s.get("date"),
            "song_meta": s.get("song_meta", {}),
            "status": s.get("splits_status", "draft"),
            "collaborators": [{"user_id": c["user_id"], "name": c.get("name"), "color": c.get("color")} for c in s.get("collaborators", [])],
            "my_role": my.get("role") if my else None,
            "my_color": my.get("color") if my else "#F59E0B",
        })
    return out


@api_router.get("/creators/{user_id}/timeline")
async def creator_timeline(user_id: str):
    """Aggregate a career timeline from all sessions user has been part of."""
    docs = await db.sessions.find({"collaborators.user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(500)
    session_ids = [s["session_id"] for s in docs]
    events = await db.session_events.find({"session_id": {"$in": session_ids}, "user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return {"sessions": len(docs), "events": events[:200]}


# ---------- Sessions ----------
COLLAB_COLORS = ["#F59E0B", "#3B82F6", "#10B981", "#A855F7", "#EC4899", "#06B6D4", "#F43F5E", "#F97316"]
COMPLETION_DEFAULTS = {
    "lyrics": "not_started",
    "melody": "not_started",
    "arrangement": "not_started",
    "production": "not_started",
    "mix": "not_started",
    "master": "not_started",
    "artwork": "not_started",
    "metadata": "not_started",
    "publishing": "not_started",
    "distribution": "locked",
    "release": "locked",
}
RIGHTS_DEFAULTS = {
    "identifiers": {"isrc": "", "upc": "", "ean": "", "iswc": "", "song_id": ""},
    "pros": {"ASCAP": "unregistered", "BMI": "unregistered", "SESAC": "unregistered", "SOCAN": "unregistered", "PRS": "unregistered", "GMR": "unregistered"},
    "dsps": {"Spotify": "not_connected", "Apple Music": "not_connected", "Amazon Music": "not_connected", "YouTube Music": "not_connected", "TikTok": "not_connected", "Pandora": "not_connected", "TIDAL": "not_connected", "Deezer": "not_connected", "Qobuz": "not_connected"},
    "producer_splits": [],
    "documents": {},
}


def next_color(collaborators: List[dict]) -> str:
    used = {c.get("color") for c in collaborators}
    for c in COLLAB_COLORS:
        if c not in used:
            return c
    return COLLAB_COLORS[len(collaborators) % len(COLLAB_COLORS)]


@api_router.post("/sessions")
async def create_session(payload: SessionCreate, user: dict = Depends(get_current_user)):
    session_id = f"sess_{uuid.uuid4().hex[:12]}"
    invite_code = uuid.uuid4().hex[:8].upper()
    doc = {
        "session_id": session_id,
        "invite_code": invite_code,
        "owner_id": user["user_id"],
        "title": payload.title,
        "working_title": payload.working_title,
        "project": payload.project,
        "album": payload.album,
        "location": payload.location,
        "session_type": payload.session_type,
        "context": payload.context,
        "date": payload.date or datetime.now(timezone.utc).isoformat(),
        "status": "active",
        "collaborators": [
            {
                "user_id": user["user_id"],
                "name": user.get("name"),
                "picture": user.get("picture"),
                "role": "Owner",
                "color": COLLAB_COLORS[0],
                "joined_at": datetime.now(timezone.utc).isoformat(),
            }
        ],
        "splits": None,
        "splits_status": "draft",
        "signatures": {},
        "song_meta": {"genre": "", "key": "", "tempo": "", "time_signature": "4/4", "language": "English", "status": "Draft"},
        "completion": dict(COMPLETION_DEFAULTS),
        "rights": {**RIGHTS_DEFAULTS, "identifiers": dict(RIGHTS_DEFAULTS["identifiers"]), "pros": dict(RIGHTS_DEFAULTS["pros"]), "dsps": dict(RIGHTS_DEFAULTS["dsps"])},
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.sessions.insert_one(doc)
    # log creation event via the platform-wide evidence recorder.
    await evidence_recorder.record_event(
        db, kind="session_created", session_id=session_id, actor_id=user["user_id"],
        actor_name=user.get("name"), actor_color=COLLAB_COLORS[0],
        label=f"Session created by {user.get('name')}",
        payload={"title": payload.title, "project": payload.project, "location": payload.location},
    )
    doc.pop("_id", None)
    return doc


@api_router.patch("/sessions/{session_id}")
async def patch_session(session_id: str, payload: SessionPatch, user: dict = Depends(get_current_user)):
    doc = await db.sessions.find_one({"session_id": session_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Session not found")
    if not any(c["user_id"] == user["user_id"] for c in doc.get("collaborators", [])):
        raise HTTPException(status_code=403, detail="Not a collaborator")
    update = {}
    if payload.title is not None:
        update["title"] = payload.title
    if payload.working_title is not None:
        update["working_title"] = payload.working_title
    if payload.status is not None:
        update["status"] = payload.status
    if payload.song_meta is not None:
        merged = {**doc.get("song_meta", {}), **payload.song_meta}
        update["song_meta"] = merged
    if payload.completion is not None:
        merged = {**doc.get("completion", {}), **payload.completion}
        update["completion"] = merged
    if payload.rights is not None:
        current = doc.get("rights", {}) or {}
        # deep merge for nested dicts
        merged = {**current}
        for k, v in payload.rights.items():
            if isinstance(v, dict) and isinstance(current.get(k), dict):
                merged[k] = {**current[k], **v}
            else:
                merged[k] = v
        update["rights"] = merged
    if update:
        await db.sessions.update_one({"session_id": session_id}, {"$set": update})
    return await db.sessions.find_one({"session_id": session_id}, {"_id": 0})


@api_router.get("/sessions")
async def list_sessions(user: dict = Depends(get_current_user)):
    docs = await db.sessions.find(
        {"collaborators.user_id": user["user_id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(500)
    return docs


@api_router.get("/sessions/{session_id}")
async def get_session(session_id: str, user: dict = Depends(get_current_user)):
    doc = await db.sessions.find_one({"session_id": session_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Session not found")
    return doc


@api_router.post("/sessions/{session_id}/join")
async def join_session(session_id: str, user: dict = Depends(get_current_user)):
    doc = await db.sessions.find_one({"session_id": session_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Session not found")
    if any(c["user_id"] == user["user_id"] for c in doc.get("collaborators", [])):
        return doc
    color = next_color(doc.get("collaborators", []))
    entry = {
        "user_id": user["user_id"],
        "name": user.get("name"),
        "picture": user.get("picture"),
        "role": "Collaborator",
        "color": color,
        "joined_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.sessions.update_one({"session_id": session_id}, {"$push": {"collaborators": entry}})
    await evidence_recorder.record_event(
        db, kind="collaborator_joined", session_id=session_id, actor_id=user["user_id"],
        actor_name=user.get("name"), actor_color=color,
        label=f"{user.get('name')} joined the session",
        payload={"role": "Collaborator"},
    )
    return await db.sessions.find_one({"session_id": session_id}, {"_id": 0})


# ---------- Lyrics (line-level, with author color) ----------
def _collab_color(session_doc: dict, user_id: str) -> str:
    for c in session_doc.get("collaborators", []):
        if c["user_id"] == user_id:
            return c.get("color", "#F59E0B")
    return "#F59E0B"


@api_router.post("/sessions/{session_id}/lyrics")
async def add_lyric_line(session_id: str, payload: LyricLineCreate, user: dict = Depends(get_current_user)):
    session_doc = await db.sessions.find_one({"session_id": session_id}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=404, detail="Session not found")
    if not any(c["user_id"] == user["user_id"] for c in session_doc.get("collaborators", [])):
        raise HTTPException(status_code=403, detail="Not a collaborator")
    line = {
        "line_id": f"line_{uuid.uuid4().hex[:12]}",
        "session_id": session_id,
        "section": payload.section,
        "text": payload.text,
        "user_id": user["user_id"],
        "user_name": user.get("name"),
        "color": _collab_color(session_doc, user["user_id"]),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.lyric_lines.insert_one(line)
    await evidence_recorder.record_event(
        db, kind="lyric_line", session_id=session_id, actor_id=user["user_id"],
        actor_name=user.get("name"), actor_color=line["color"],
        label=f"{user.get('name')} wrote a line in {payload.section}",
        payload={"section": payload.section, "line_id": line["line_id"], "preview": payload.text[:140], "target_id": line["line_id"]},
    )
    line.pop("_id", None)
    return line


@api_router.put("/sessions/{session_id}/lyrics/{line_id}")
async def update_lyric_line(session_id: str, line_id: str, payload: LyricLineUpdate, user: dict = Depends(get_current_user)):
    doc = await db.lyric_lines.find_one({"line_id": line_id, "session_id": session_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Line not found")
    await db.lyric_lines.update_one({"line_id": line_id}, {"$set": {"text": payload.text}})
    session_doc = await db.sessions.find_one({"session_id": session_id}, {"_id": 0}) or {}
    await evidence_recorder.record_event(
        db, kind="lyric_line_edited", session_id=session_id, actor_id=user["user_id"],
        actor_name=user.get("name"), actor_color=_collab_color(session_doc, user["user_id"]),
        label=f"{user.get('name')} revised a lyric line",
        payload={"line_id": line_id, "section": doc.get("section"), "preview": payload.text[:140], "target_id": line_id},
    )
    return await db.lyric_lines.find_one({"line_id": line_id}, {"_id": 0})


@api_router.delete("/sessions/{session_id}/lyrics/{line_id}")
async def delete_lyric_line(session_id: str, line_id: str, user: dict = Depends(get_current_user)):
    doc = await db.lyric_lines.find_one({"line_id": line_id, "session_id": session_id}, {"_id": 0})
    await db.lyric_lines.delete_one({"line_id": line_id, "session_id": session_id})
    if doc:
        session_doc = await db.sessions.find_one({"session_id": session_id}, {"_id": 0}) or {}
        await evidence_recorder.record_event(
            db, kind="lyric_line_removed", session_id=session_id, actor_id=user["user_id"],
            actor_name=user.get("name"), actor_color=_collab_color(session_doc, user["user_id"]),
            label=f"{user.get('name')} removed a lyric line",
            payload={"line_id": line_id, "section": doc.get("section"), "preview": (doc.get("text") or "")[:140]},
        )
    return {"ok": True}


@api_router.get("/sessions/{session_id}/lyrics")
async def list_lyric_lines(session_id: str, user: dict = Depends(get_current_user)):
    docs = await db.lyric_lines.find({"session_id": session_id}, {"_id": 0}).sort("created_at", 1).to_list(2000)
    return docs


# ---------- Session Events (Timeline) ----------
@api_router.post("/sessions/{session_id}/events")
async def add_event(session_id: str, payload: EventCreate, user: dict = Depends(get_current_user)):
    session_doc = await db.sessions.find_one({"session_id": session_id}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=404, detail="Session not found")
    ev = {
        "event_id": f"evt_{uuid.uuid4().hex[:12]}",
        "session_id": session_id,
        "user_id": user["user_id"],
        "user_name": user.get("name"),
        "color": _collab_color(session_doc, user["user_id"]),
        "kind": payload.kind,
        "label": payload.label,
        "meta": payload.meta or {},
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.session_events.insert_one(ev)
    ev.pop("_id", None)
    return ev


@api_router.get("/sessions/{session_id}/events")
async def list_events(session_id: str, user: dict = Depends(get_current_user)):
    docs = await db.session_events.find({"session_id": session_id}, {"_id": 0}).sort("created_at", 1).to_list(2000)
    return docs


# ---------- Session Chat ----------
@api_router.post("/sessions/{session_id}/messages")
async def add_message(session_id: str, payload: MessageCreate, user: dict = Depends(get_current_user)):
    session_doc = await db.sessions.find_one({"session_id": session_id}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=404, detail="Session not found")
    msg = {
        "message_id": f"msg_{uuid.uuid4().hex[:12]}",
        "session_id": session_id,
        "user_id": user["user_id"],
        "user_name": user.get("name"),
        "color": _collab_color(session_doc, user["user_id"]),
        "kind": payload.kind,
        "text": payload.text,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.session_messages.insert_one(msg)
    # Sensitive: private chat content stays in `session_messages`. The evidence
    # ledger records only metadata + secure reference + cryptographic hash.
    await evidence_recorder.record_event(
        db, kind="chat_message", session_id=session_id, actor_id=user["user_id"],
        actor_name=user.get("name"), actor_color=msg["color"],
        label=f"{user.get('name')} sent a message",
        payload={"text": payload.text, "kind": payload.kind, "message_id": msg["message_id"], "participants": [c["user_id"] for c in session_doc.get("collaborators", [])]},
        secure_reference={"collection": "session_messages", "id": msg["message_id"]},
    )
    msg.pop("_id", None)
    return msg


@api_router.get("/sessions/{session_id}/messages")
async def list_messages(session_id: str, user: dict = Depends(get_current_user)):
    docs = await db.session_messages.find({"session_id": session_id}, {"_id": 0}).sort("created_at", 1).to_list(2000)
    return docs


# ---------- Rights: Identifier generators ----------
@api_router.post("/sessions/{session_id}/rights/generate/{kind}")
async def generate_identifier(session_id: str, kind: str, user: dict = Depends(get_current_user)):
    session_doc = await db.sessions.find_one({"session_id": session_id}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=404, detail="Session not found")
    kind = kind.lower()
    year = datetime.now(timezone.utc).year % 100
    rnd = uuid.uuid4().hex[:6].upper()
    values = {
        "isrc": f"US-SGR-{year:02d}-{rnd}",
        "upc": "".join([str((sum(int(x) for x in str(uuid.uuid4().int)[:11])) % 10)] + [str(uuid.uuid4().int)[i] for i in range(11)]),
        "ean": str(uuid.uuid4().int)[:13],
        "iswc": f"T-{uuid.uuid4().int % 1000000000:09d}-{uuid.uuid4().int % 10}",
        "song_id": f"SGR-{uuid.uuid4().hex[:10].upper()}",
    }
    if kind not in values:
        raise HTTPException(status_code=400, detail="Unsupported identifier kind")
    rights = session_doc.get("rights", {}) or {}
    identifiers = dict(rights.get("identifiers", {}))
    identifiers[kind] = values[kind]
    rights["identifiers"] = identifiers
    await db.sessions.update_one({"session_id": session_id}, {"$set": {"rights": rights}})
    await evidence_recorder.record_event(
        db, kind="identifier_generated", session_id=session_id, actor_id=user["user_id"],
        actor_name=user.get("name"), actor_color=_collab_color(session_doc, user["user_id"]),
        label=f"{kind.upper()} generated · {values[kind]}",
        payload={"kind": kind, "value": values[kind]},
    )
    return {"kind": kind, "value": values[kind], "rights": rights}


# ---------- Studio Insights (AI) ----------
@api_router.post("/sessions/{session_id}/insights")
async def studio_insights(session_id: str, user: dict = Depends(get_current_user)):
    session_doc = await db.sessions.find_one({"session_id": session_id}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=404, detail="Session not found")
    lines = await db.lyric_lines.find({"session_id": session_id}, {"_id": 0}).to_list(2000)
    contribs = await db.contributions.find({"session_id": session_id}, {"_id": 0}).to_list(1000)
    collaborators = session_doc.get("collaborators", [])

    # Rule-based baseline
    lines_by_user = {}
    for ln in lines:
        lines_by_user[ln["user_id"]] = lines_by_user.get(ln["user_id"], 0) + 1
    most_active_id = max(lines_by_user, key=lines_by_user.get) if lines_by_user else None
    most_active_name = next((c["name"] for c in collaborators if c["user_id"] == most_active_id), None) if most_active_id else "N/A"
    total_lines = len(lines) or 1
    fairness = round(min(lines_by_user.values()) / max(lines_by_user.values()), 2) if lines_by_user else 1.0
    completion = session_doc.get("completion", {}) or {}
    done = sum(1 for v in completion.values() if v == "complete")
    total = len(completion) or 1
    commercial_readiness = int((done / total) * 100)

    baseline = {
        "most_active_collaborator": most_active_name,
        "writing_balance": {c.get("name", c["user_id"]): round((lines_by_user.get(c["user_id"], 0) / total_lines) * 100, 1) for c in collaborators},
        "contribution_fairness": fairness,
        "commercial_readiness": commercial_readiness,
        "genre_confidence": 0.72,
        "hit_potential_score": 78,
        "writing_consistency": 0.81,
        "harmony_suggestions": "Try a modal interchange in the bridge for emotional lift.",
        "missing_metadata": [k for k, v in completion.items() if v not in ("complete",)][:5],
        "suggested_next_task": next((k for k, v in completion.items() if v == "in_progress"), None) or next((k for k, v in completion.items() if v == "not_started"), None),
    }

    # AI enhancement (Claude Sonnet 4.5)
    if EMERGENT_LLM_KEY and (lines or contribs):
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"insights-{session_id}-{uuid.uuid4().hex[:6]}",
                system_message=(
                    "You are SONGRIGHT Intelligence, an AI music A&R and publishing analyst. "
                    "Given a session (lyrics, contributions, collaborators), return STRICT JSON with keys: "
                    "hit_potential_score (0-100 int), genre_confidence (0-1 float), harmony_suggestions (short str), "
                    "commercial_readiness (0-100 int), suggested_next_task (short str), writing_consistency (0-1 float). "
                    "Nothing else."
                ),
            ).with_model("anthropic", "claude-sonnet-4-5-20250929")
            snippet = "\n".join([f"[{ln['section']}] {ln['user_name']}: {ln['text']}" for ln in lines[:60]])
            contrib_text = "\n".join([f"- {c['user_name']} ({c['role']}): {c['description']}" for c in contribs[:30]])
            prompt = f"Song: {session_doc.get('title')}\nGenre: {session_doc.get('song_meta',{}).get('genre','')}\n\nLyrics lines:\n{snippet}\n\nContributions:\n{contrib_text}"
            resp = await chat.send_message(UserMessage(text=prompt))
            text = resp if isinstance(resp, str) else str(resp)
            start, end = text.find("{"), text.rfind("}")
            if start != -1 and end != -1:
                parsed = json.loads(text[start:end + 1])
                for k in ["hit_potential_score", "genre_confidence", "harmony_suggestions", "commercial_readiness", "suggested_next_task", "writing_consistency"]:
                    if k in parsed:
                        baseline[k] = parsed[k]
        except Exception as e:
            logger.warning(f"AI insights failed: {e}")

    return baseline


# ---------- Song Intelligence Report ----------
class ShareLinkCreate(BaseModel):
    audience: str = "label"  # label | publisher | manager | attorney | investor
    password: Optional[str] = None
    ttl_days: int = 30


def _evidence_for_user(user_id: str, lines: list, contribs: list) -> dict:
    user_lines = [ln for ln in lines if ln["user_id"] == user_id]
    user_contribs = [c for c in contribs if c["user_id"] == user_id]
    by_section = {}
    for ln in user_lines:
        by_section[ln["section"]] = by_section.get(ln["section"], 0) + 1
    role_counts = {}
    for c in user_contribs:
        role_counts[c["role"]] = role_counts.get(c["role"], 0) + 1
    return {
        "lyric_lines": len(user_lines),
        "sections_touched": list(by_section.keys()),
        "revisions": sum(1 for ln in user_lines if len((ln.get("text") or "")) > 40),  # heuristic
        "role_counts": role_counts,
        "contributions": len(user_contribs),
        "total_weight": round(sum(c.get("weight", 1) for c in user_contribs), 2),
    }


@api_router.post("/sessions/{session_id}/intelligence")
async def song_intelligence(session_id: str, user: dict = Depends(get_current_user)):
    session_doc = await db.sessions.find_one({"session_id": session_id}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=404, detail="Session not found")

    lines = await db.lyric_lines.find({"session_id": session_id}, {"_id": 0}).to_list(2000)
    contribs = await db.contributions.find({"session_id": session_id}, {"_id": 0}).to_list(1000)
    events = await db.session_events.find({"session_id": session_id}, {"_id": 0}).sort("created_at", 1).to_list(2000)

    collaborators = session_doc.get("collaborators", [])
    evidence = {c["user_id"]: {
        "user_id": c["user_id"],
        "name": c.get("name"),
        "role": c.get("role"),
        "color": c.get("color"),
        **_evidence_for_user(c["user_id"], lines, contribs),
    } for c in collaborators}

    # Baseline analysis
    total_words = sum(len((ln.get("text") or "").split()) for ln in lines)
    completion = session_doc.get("completion", {}) or {}
    completed = sum(1 for v in completion.values() if v == "complete")
    total_checks = len(completion) or 1
    commercial_readiness = int((completed / total_checks) * 100)

    baseline = {
        "commercial_potential": 72,
        "genre_confidence": 0.76,
        "streaming_potential": 78,
        "sync_potential": 65,
        "playlist_potential": 74,
        "radio_potential": 61,
        "international_potential": 68,
        "catalog_longevity": 71,
        "audience_fit": 80,
        "strengths": [
            "Strong hook development in chorus sections",
            "Contribution weights are balanced across collaborators",
            "Publishing metadata largely complete",
        ],
        "improvements": [
            "Bridge section could use additional lyric development",
            "Consider completing artwork and marketing assets",
            "PRO registrations still pending",
        ],
        "comparable_records": [
            "Contemporary R&B pop with soul influences",
            "Mid-tempo alternative pop crossover",
        ],
        "primary_audience": "Ages 18–34, US urban centers, streaming-first listeners",
        "secondary_audience": "Ages 25–44, UK/Europe, playlist-driven listeners",
        "top_countries": ["United States", "United Kingdom", "Canada", "Nigeria", "Germany", "Australia"],
        "top_cities": ["Los Angeles", "London", "New York", "Toronto", "Lagos", "Atlanta"],
        "top_dsps": ["Spotify", "Apple Music", "YouTube Music", "TikTok"],
        "festival_opportunities": ["SXSW", "Afropunk", "Iceland Airwaves"],
        "brand_partnerships": ["Streetwear", "Beverage", "Beauty"],
        "executive_summary": (
            f"{session_doc.get('title')} is a {session_doc.get('song_meta', {}).get('genre') or 'contemporary'} record built by "
            f"{len(collaborators)} verified creators through {len(events)} time-stamped creative events. "
            f"With a {commercial_readiness}% publishing readiness score and clear ownership trails across all contributors, "
            f"the song is positioned for streaming-first distribution with meaningful sync and playlist potential."
        ),
        "release_recommendation": (
            "Complete artwork and PRO registrations, then distribute to Spotify, Apple Music and YouTube Music as the "
            "opening triangle with a 4-week pre-save campaign and playlist pitch to the top R&B/Alt curators."
        ),
    }

    # AI enhancement (Claude Sonnet 4.5)
    if EMERGENT_LLM_KEY and (lines or contribs):
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"intel-{session_id}-{uuid.uuid4().hex[:6]}",
                system_message=(
                    "You are SONGRIGHT Intelligence, an elite A&R + music industry analyst producing "
                    "executive-grade Song Intelligence Reports for labels, publishers and investors. "
                    "Return STRICT JSON with these keys ONLY: commercial_potential (int 0-100), genre_confidence (float 0-1), "
                    "streaming_potential (int), sync_potential (int), playlist_potential (int), radio_potential (int), "
                    "international_potential (int), catalog_longevity (int), audience_fit (int), "
                    "strengths (list of 3-5 short strings), improvements (list of 3-5 short strings), "
                    "comparable_records (list of 3 short strings), primary_audience (string), secondary_audience (string), "
                    "top_countries (list of 6 strings), top_cities (list of 6 strings), top_dsps (list of 4 strings), "
                    "festival_opportunities (list of 3 strings), brand_partnerships (list of 3 strings), "
                    "executive_summary (250-word string), release_recommendation (100-word string). Nothing else."
                ),
            ).with_model("anthropic", "claude-sonnet-4-5-20250929")

            snippet = "\n".join([f"[{ln['section']}] {ln['user_name']}: {ln['text']}" for ln in lines[:80]])
            contrib_text = "\n".join([f"- {c['user_name']} ({c['role']}, w={c.get('weight', 1)}): {c['description']}" for c in contribs[:40]])
            meta = session_doc.get("song_meta", {}) or {}
            collab_lines = "\n".join([f"- {c.get('name')} ({c.get('role')}) color={c.get('color')}" for c in collaborators])
            prompt = (
                f"Song: {session_doc.get('title')}\nGenre: {meta.get('genre','')}\nKey: {meta.get('key','')} · Tempo: {meta.get('tempo','')} BPM\n"
                f"Collaborators ({len(collaborators)}):\n{collab_lines}\n\n"
                f"Lyrics ({len(lines)} lines, {total_words} words):\n{snippet}\n\n"
                f"Contributions:\n{contrib_text}\n\n"
                f"Completion: {commercial_readiness}%. Produce the intelligence report."
            )
            resp = await chat.send_message(UserMessage(text=prompt))
            text = resp if isinstance(resp, str) else str(resp)
            start, end = text.find("{"), text.rfind("}")
            if start != -1 and end != -1:
                parsed = json.loads(text[start:end + 1])
                for k, v in parsed.items():
                    baseline[k] = v
        except Exception as e:
            logger.warning(f"AI intelligence failed: {e}")

    # Financial forecast (deterministic from song id, adjusted by readiness)
    seed_val = sum(ord(c) for c in session_id) % 1000
    base_streams_yr = 200_000 + seed_val * 500
    readiness_mult = 0.4 + (commercial_readiness / 100) * 0.6
    year_streams = int(base_streams_yr * readiness_mult)
    forecast = {
        "streaming_yr": year_streams,
        "revenue_yr": round(year_streams * 0.004, 2),
        "publishing_yr": round(year_streams * 0.0018, 2),
        "performance_yr": round(year_streams * 0.0011, 2),
        "mechanical_yr": round(year_streams * 0.0007, 2),
        "neighboring_yr": round(year_streams * 0.0003, 2),
        "sync_potential": round(1500 + seed_val * 15, 2),
        "catalog_value": round(year_streams * 0.02 * 5, 2),
        "five_year_projection": round(year_streams * 0.004 * 4.2, 2),
        "ten_year_projection": round(year_streams * 0.004 * 6.8, 2),
    }

    return {
        "session": {
            "session_id": session_doc["session_id"],
            "title": session_doc.get("title"),
            "working_title": session_doc.get("working_title"),
            "project": session_doc.get("project"),
            "song_meta": session_doc.get("song_meta", {}),
            "collaborators": collaborators,
            "completion": completion,
            "rights": session_doc.get("rights", {}),
            "splits_status": session_doc.get("splits_status", "draft"),
            "splits": session_doc.get("splits"),
            "created_at": session_doc.get("created_at"),
        },
        "stats": {
            "total_lines": len(lines),
            "total_words": total_words,
            "total_contribs": len(contribs),
            "total_events": len(events),
            "commercial_readiness": commercial_readiness,
        },
        "evidence": list(evidence.values()),
        "analysis": baseline,
        "forecast": forecast,
        "events_recent": events[-30:],
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


@api_router.post("/sessions/{session_id}/share")
async def create_share_link(session_id: str, payload: ShareLinkCreate, user: dict = Depends(get_current_user)):
    session_doc = await db.sessions.find_one({"session_id": session_id}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=404, detail="Session not found")
    if not any(c["user_id"] == user["user_id"] for c in session_doc.get("collaborators", [])):
        raise HTTPException(status_code=403, detail="Not a collaborator")
    token = uuid.uuid4().hex
    expires_at = datetime.now(timezone.utc) + timedelta(days=payload.ttl_days)
    await db.share_links.insert_one({
        "token": token,
        "session_id": session_id,
        "audience": payload.audience,
        "password": payload.password,
        "created_by": user["user_id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": expires_at.isoformat(),
    })
    return {"token": token, "audience": payload.audience, "expires_at": expires_at.isoformat()}


@api_router.get("/report/{token}")
async def public_report(token: str, password: Optional[str] = None):
    link = await db.share_links.find_one({"token": token}, {"_id": 0})
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    expires = link.get("expires_at")
    if isinstance(expires, str):
        expires_dt = datetime.fromisoformat(expires)
    else:
        expires_dt = expires
    if expires_dt.tzinfo is None:
        expires_dt = expires_dt.replace(tzinfo=timezone.utc)
    if expires_dt < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="Link expired")
    if link.get("password") and link.get("password") != password:
        raise HTTPException(status_code=401, detail="Password required")
    # inline a minimal, unauthenticated intelligence fetch (bypasses user dep)
    session_id = link["session_id"]
    session_doc = await db.sessions.find_one({"session_id": session_id}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=404, detail="Session not found")
    lines = await db.lyric_lines.find({"session_id": session_id}, {"_id": 0}).to_list(2000)
    contribs = await db.contributions.find({"session_id": session_id}, {"_id": 0}).to_list(1000)
    events = await db.session_events.find({"session_id": session_id}, {"_id": 0}).sort("created_at", 1).to_list(2000)
    collaborators = session_doc.get("collaborators", [])
    evidence = [{
        "user_id": c["user_id"], "name": c.get("name"), "role": c.get("role"), "color": c.get("color"),
        **_evidence_for_user(c["user_id"], lines, contribs),
    } for c in collaborators]
    return {
        "audience": link["audience"],
        "session": session_doc,
        "evidence": evidence,
        "lines_count": len(lines),
        "events": events[-50:],
    }


@api_router.post("/sessions/join-by-code/{invite_code}")
async def join_by_code(invite_code: str, user: dict = Depends(get_current_user)):
    doc = await db.sessions.find_one({"invite_code": invite_code.upper()}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Invalid invite code")
    return await join_session(doc["session_id"], user)


# ---------- Contributions ----------
@api_router.post("/sessions/{session_id}/contributions")
async def add_contribution(session_id: str, payload: ContributionCreate, user: dict = Depends(get_current_user)):
    session_doc = await db.sessions.find_one({"session_id": session_id}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=404, detail="Session not found")
    if not any(c["user_id"] == user["user_id"] for c in session_doc.get("collaborators", [])):
        raise HTTPException(status_code=403, detail="Not a collaborator")
    contrib_id = f"contrib_{uuid.uuid4().hex[:12]}"
    doc = {
        "contribution_id": contrib_id,
        "session_id": session_id,
        "user_id": user["user_id"],
        "user_name": user.get("name"),
        "role": payload.role,
        "description": payload.description,
        "weight": payload.weight or 1.0,
        "audio_url": payload.audio_url,
        "lyrics_content": payload.lyrics_content,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.contributions.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.get("/sessions/{session_id}/contributions")
async def list_contributions(session_id: str, user: dict = Depends(get_current_user)):
    docs = await db.contributions.find({"session_id": session_id}, {"_id": 0}).sort("created_at", 1).to_list(1000)
    return docs


# ---------- Splits ----------
def rule_based_splits(contributions: List[dict], collaborators: List[dict]) -> List[dict]:
    """Fallback splits based on contribution weight per collaborator."""
    if not collaborators:
        return []
    weights: Dict[str, float] = {}
    names: Dict[str, str] = {}
    for c in collaborators:
        weights[c["user_id"]] = 0.0
        names[c["user_id"]] = c.get("name", "Collaborator")
    for contrib in contributions:
        uid = contrib["user_id"]
        weights[uid] = weights.get(uid, 0.0) + float(contrib.get("weight", 1.0))
        if uid not in names:
            names[uid] = contrib.get("user_name", "Collaborator")
    total = sum(weights.values())
    if total == 0:
        # equal splits
        equal = round(100.0 / len(collaborators), 2)
        return [
            {"user_id": uid, "name": names.get(uid, "Collaborator"), "role": "Contributor", "percentage": equal}
            for uid in weights.keys()
        ]
    result = []
    for uid, w in weights.items():
        pct = round((w / total) * 100.0, 2)
        result.append({"user_id": uid, "name": names.get(uid, "Collaborator"), "role": "Contributor", "percentage": pct})
    # normalize to 100
    diff = round(100.0 - sum(x["percentage"] for x in result), 2)
    if result:
        result[0]["percentage"] = round(result[0]["percentage"] + diff, 2)
    return result


@api_router.post("/sessions/{session_id}/splits/suggest")
async def suggest_splits(session_id: str, user: dict = Depends(get_current_user)):
    session_doc = await db.sessions.find_one({"session_id": session_id}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=404, detail="Session not found")
    contributions = await db.contributions.find({"session_id": session_id}, {"_id": 0}).to_list(1000)
    collaborators = session_doc.get("collaborators", [])
    baseline = rule_based_splits(contributions, collaborators)

    # AI-powered analysis
    ai_reasoning = None
    ai_splits = None
    if EMERGENT_LLM_KEY and contributions:
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"splits-{session_id}",
                system_message=(
                    "You are SONGRIGHT Intelligence, an expert in music publishing and creative ownership. "
                    "Given collaborators and their contributions, propose fair songwriting/publishing splits. "
                    "Respond with STRICT JSON: {\"splits\":[{\"user_id\":str,\"name\":str,\"role\":str,\"percentage\":float}], \"reasoning\":str}. "
                    "Percentages must sum to exactly 100.0."
                ),
            ).with_model("anthropic", "claude-sonnet-4-5-20250929")

            collab_text = "\n".join([f"- {c.get('name')} (id={c['user_id']}, role={c.get('role')})" for c in collaborators])
            contrib_text = "\n".join(
                [f"- {c.get('user_name')} ({c['user_id']}): {c['role']} — {c['description']} (weight={c.get('weight',1.0)})" for c in contributions]
            )
            prompt = f"Session: {session_doc.get('title')}\n\nCollaborators:\n{collab_text}\n\nContributions:\n{contrib_text}\n\nSuggest fair splits."
            msg = UserMessage(text=prompt)
            resp = await chat.send_message(msg)
            text = resp if isinstance(resp, str) else str(resp)
            # find JSON
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end != -1:
                parsed = json.loads(text[start : end + 1])
                ai_splits = parsed.get("splits")
                ai_reasoning = parsed.get("reasoning")
        except Exception as e:
            logger.warning(f"AI splits failed: {e}")

    final_splits = ai_splits if ai_splits else baseline
    # normalize
    if final_splits:
        total = sum(float(s.get("percentage", 0)) for s in final_splits)
        if total > 0 and abs(total - 100.0) > 0.5:
            factor = 100.0 / total
            for s in final_splits:
                s["percentage"] = round(float(s["percentage"]) * factor, 2)

    return {
        "splits": final_splits,
        "reasoning": ai_reasoning or "Splits weighted by number and weight of contributions per collaborator.",
        "confidence": 0.85 if ai_splits else 0.6,
        "source": "ai" if ai_splits else "rule",
    }


@api_router.put("/sessions/{session_id}/splits")
async def set_splits(session_id: str, payload: SplitsProposal, user: dict = Depends(get_current_user)):
    session_doc = await db.sessions.find_one({"session_id": session_id}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=404, detail="Session not found")
    if session_doc["owner_id"] != user["user_id"]:
        raise HTTPException(status_code=403, detail="Only owner can set splits")
    splits = [s.dict() for s in payload.splits]
    total = sum(s["percentage"] for s in splits)
    if abs(total - 100.0) > 0.5:
        raise HTTPException(status_code=400, detail=f"Splits must sum to 100 (got {total})")
    await db.sessions.update_one(
        {"session_id": session_id},
        {"$set": {"splits": splits, "splits_status": "proposed", "signatures": {}}},
    )
    await evidence_recorder.record_event(
        db, kind="rights_updated", session_id=session_id, actor_id=user["user_id"],
        actor_name=user.get("name"), actor_color=_collab_color(session_doc, user["user_id"]),
        label=f"{user.get('name')} proposed splits",
        payload={"splits": splits, "total": total},
    )
    return await db.sessions.find_one({"session_id": session_id}, {"_id": 0})


@api_router.post("/sessions/{session_id}/splits/approve")
async def approve_splits(session_id: str, payload: SplitApproval, user: dict = Depends(get_current_user)):
    session_doc = await db.sessions.find_one({"session_id": session_id}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=404, detail="Session not found")
    if not any(c["user_id"] == user["user_id"] for c in session_doc.get("collaborators", [])):
        raise HTTPException(status_code=403, detail="Not a collaborator")
    if not session_doc.get("splits"):
        raise HTTPException(status_code=400, detail="No splits proposed yet")
    signature = payload.signature or user.get("name", "Signed")
    signatures = session_doc.get("signatures", {}) or {}
    signatures[user["user_id"]] = {
        "signature": signature,
        "approved": payload.approved,
        "signed_at": datetime.now(timezone.utc).isoformat(),
    }
    # check if all signed
    all_signed = all(uid in signatures and signatures[uid]["approved"] for uid in [c["user_id"] for c in session_doc.get("collaborators", [])])
    new_status = "finalized" if all_signed else "proposed"
    await db.sessions.update_one(
        {"session_id": session_id},
        {"$set": {"signatures": signatures, "splits_status": new_status}},
    )
    # Sensitive: approval carries identifying information — record hash + metadata.
    await evidence_recorder.record_event(
        db, kind="approval_signed", session_id=session_id, actor_id=user["user_id"],
        actor_name=user.get("name"), actor_color=_collab_color(session_doc, user["user_id"]),
        label=f"{user.get('name')} {'approved' if payload.approved else 'declined'} the splits",
        payload={"approved": payload.approved, "signature": signature, "all_signed": all_signed, "participants": [c['user_id'] for c in session_doc.get('collaborators', [])]},
        secure_reference={"collection": "sessions", "id": session_id, "field": "signatures"},
    )
    if all_signed:
        await evidence_recorder.record_event(
            db, kind="milestone_reached", session_id=session_id, actor_id=user["user_id"],
            actor_name=user.get("name"), actor_color=_collab_color(session_doc, user["user_id"]),
            label="Splits finalized — every collaborator signed.",
            payload={"milestone": "splits_finalized"},
        )
    # If finalized, seed a royalty record
    if all_signed and not await db.royalties.find_one({"session_id": session_id}, {"_id": 0}):
        await db.royalties.insert_one(
            {
                "royalty_id": f"roy_{uuid.uuid4().hex[:12]}",
                "session_id": session_id,
                "title": session_doc.get("title"),
                "splits": session_doc.get("splits", []),
                "streams": 0,
                "performance_income": 0.0,
                "mechanical_income": 0.0,
                "sync_income": 0.0,
                "neighboring_rights_income": 0.0,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        )
    return await db.sessions.find_one({"session_id": session_id}, {"_id": 0})


# ---------- Royalty Placeholder ----------
@api_router.get("/royalties")
async def list_royalties(user: dict = Depends(get_current_user)):
    # find sessions where user is a collaborator
    sess = await db.sessions.find(
        {"collaborators.user_id": user["user_id"], "splits_status": "finalized"}, {"_id": 0}
    ).to_list(1000)
    session_ids = [s["session_id"] for s in sess]
    if not session_ids:
        return {"works": [], "total_earnings": 0.0}
    royalties = await db.royalties.find({"session_id": {"$in": session_ids}}, {"_id": 0}).to_list(1000)
    works = []
    total = 0.0
    for r in royalties:
        # Compute user's share
        user_split = next((s for s in r.get("splits", []) if s.get("user_id") == user["user_id"]), None)
        pct = float(user_split["percentage"]) if user_split else 0.0
        gross = r.get("performance_income", 0.0) + r.get("mechanical_income", 0.0) + r.get("sync_income", 0.0) + r.get("neighboring_rights_income", 0.0)
        earnings = round(gross * pct / 100.0, 2)
        total += earnings
        works.append(
            {
                "royalty_id": r["royalty_id"],
                "session_id": r["session_id"],
                "title": r.get("title"),
                "percentage": pct,
                "earnings": earnings,
                "streams": r.get("streams", 0),
                "performance_income": r.get("performance_income", 0.0),
                "mechanical_income": r.get("mechanical_income", 0.0),
                "sync_income": r.get("sync_income", 0.0),
                "neighboring_rights_income": r.get("neighboring_rights_income", 0.0),
            }
        )
    return {"works": works, "total_earnings": round(total, 2)}


# ---------- File Upload ----------
@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...), session_id: Optional[str] = None, user: dict = Depends(get_current_user)):
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else "bin"
    path = f"{APP_NAME}/uploads/{user['user_id']}/{uuid.uuid4().hex}.{ext}"
    data = await file.read()
    result = put_object(path, data, file.content_type or "application/octet-stream")
    file_id = str(uuid.uuid4())
    await db.files.insert_one(
        {
            "id": file_id,
            "storage_path": result["path"],
            "original_filename": file.filename,
            "content_type": file.content_type,
            "size": result.get("size", len(data)),
            "user_id": user["user_id"],
            "session_id": session_id,
            "is_deleted": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
    )
    if session_id:
        session_doc = await db.sessions.find_one({"session_id": session_id}, {"_id": 0}) or {}
        await evidence_recorder.record_event(
            db, kind="file_uploaded", session_id=session_id, actor_id=user["user_id"],
            actor_name=user.get("name"), actor_color=_collab_color(session_doc, user["user_id"]),
            label=f"{user.get('name')} uploaded {file.filename}",
            payload={"filename": file.filename, "content_type": file.content_type, "size": result.get("size", len(data)), "storage_path": result["path"], "file_id": file_id},
        )
    return {"id": file_id, "path": result["path"], "size": result.get("size", len(data)), "content_type": file.content_type}


@api_router.get("/files/{path:path}")
async def download_file(path: str, user: dict = Depends(get_current_user)):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    data, content_type = get_object(path)
    return Response(content=data, media_type=record.get("content_type", content_type))


# ---------- Connected Services / Integrations ----------
class IntegrationPatch(BaseModel):
    connected: Optional[bool] = None
    permissions: Optional[Dict[str, bool]] = None


@api_router.get("/integrations")
async def list_integrations(user: dict = Depends(get_current_user)):
    docs = await db.user_integrations.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(500)
    return docs


@api_router.get("/integrations/{integration_id}")
async def get_integration(integration_id: str, user: dict = Depends(get_current_user)):
    doc = await db.user_integrations.find_one({"user_id": user["user_id"], "integration_id": integration_id}, {"_id": 0})
    return doc or {"integration_id": integration_id, "connected": False, "permissions": {}}


@api_router.patch("/integrations/{integration_id}")
async def upsert_integration(integration_id: str, payload: IntegrationPatch, user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    existing = await db.user_integrations.find_one({"user_id": user["user_id"], "integration_id": integration_id}, {"_id": 0})
    doc = existing or {
        "user_id": user["user_id"],
        "integration_id": integration_id,
        "connected": False,
        "permissions": {},
        "audit_log": [],
        "created_at": now,
    }
    updates = {}
    if payload.connected is not None and payload.connected != doc.get("connected"):
        updates["connected"] = payload.connected
        updates["last_sync"] = now if payload.connected else doc.get("last_sync")
        doc.setdefault("audit_log", []).append({
            "at": now, "action": "connected" if payload.connected else "disconnected"
        })
        updates["audit_log"] = doc["audit_log"][-30:]
    if payload.permissions is not None:
        merged = {**(doc.get("permissions") or {}), **payload.permissions}
        updates["permissions"] = merged
        doc.setdefault("audit_log", []).append({"at": now, "action": "permissions_updated", "meta": payload.permissions})
        updates["audit_log"] = doc["audit_log"][-30:]
    updates["updated_at"] = now

    if existing:
        await db.user_integrations.update_one(
            {"user_id": user["user_id"], "integration_id": integration_id}, {"$set": updates}
        )
    else:
        doc.update(updates)
        await db.user_integrations.insert_one(doc)

    result = await db.user_integrations.find_one({"user_id": user["user_id"], "integration_id": integration_id}, {"_id": 0})
    return result


@api_router.get("/discover/creators")
async def discover_creators():
    docs = await db.users.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).limit(24).to_list(24)
    return [user_to_public(d) for d in docs]


# ---------- CEI · Creative Evidence Intelligence™ · Phase 1 (Full Evidence Record) ----------
# Append-only ledger of session version submissions.
# Each version is a permanent historical snapshot — a complete Creative Evidence™ package.
# See /app/docs/INHEIRA_Creative_Evidence_Intelligence_Spec_v1.0.md
#
# ARCHITECTURAL PROMISES:
# 1. Nothing is ever overwritten. All records are immutable.
# 2. confidence_status & mci_status are NEVER computed here. They stay at literal
#    "awaiting_evidence_analysis" / "awaiting_musical_contribution_analysis" until
#    the CEI & MCI engines come online. Never user-editable, never estimated by field completeness.
# 3. Documentation completeness is a documentation metric, NOT a contribution score.
# 4. Every artifact & acknowledgement is captured architecturally now — even if
#    file-upload UI enables progressively — so the schema never has to change.

EVIDENCE_ARTIFACT_KINDS = {
    "rich_text", "voice_memo", "audio", "lyrics", "chord_chart", "lead_sheet",
    "midi", "musicxml", "daw_export", "stem", "mix", "image", "video",
    "screenshot", "cloud_link",
}

ACKNOWLEDGEMENT_KINDS = {
    "signature", "written", "audio", "video",
    "producer_note", "engineer_note", "witness", "ai_summary",
}


class ParticipantIn(BaseModel):
    name: str
    role: Optional[str] = None
    rightprint_id: Optional[str] = None
    user_id: Optional[str] = None
    color: Optional[str] = None


class EnvironmentIn(BaseModel):
    daw: Optional[str] = None
    software_versions: List[str] = Field(default_factory=list)
    hardware: List[str] = Field(default_factory=list)
    instruments: List[str] = Field(default_factory=list)


class VersionLinksIn(BaseModel):
    sessions: List[str] = Field(default_factory=list)
    writing_rooms: List[str] = Field(default_factory=list)
    projects: List[str] = Field(default_factory=list)


class CreativeVersionCreate(BaseModel):
    # LEGACY (kept for backward compat with v1 EvolutionTab)
    label: Optional[str] = None
    notes: Optional[str] = None
    artifact_urls: Optional[List[str]] = None
    # THE MOMENT
    title: Optional[str] = None
    purpose: Optional[str] = None
    moment_at: Optional[str] = None            # ISO date/time of the creative moment
    location: Optional[str] = None
    writing_room: Optional[str] = None
    # WHO
    participants: List[ParticipantIn] = Field(default_factory=list)
    # WHAT & WHY
    objectives: Optional[str] = None
    what_changed: Optional[str] = None
    why_changed: Optional[str] = None
    # DECISIONS
    decisions_reached: List[str] = Field(default_factory=list)
    decisions_deferred: List[str] = Field(default_factory=list)
    open_questions: List[str] = Field(default_factory=list)
    disagreements: List[str] = Field(default_factory=list)
    rights_discussions: List[str] = Field(default_factory=list)
    # CONTINUITY
    parent_version_id: Optional[str] = None
    # ENVIRONMENT
    environment: Optional[EnvironmentIn] = None
    # LINKS
    links: Optional[VersionLinksIn] = None
    # AI SESSION SUMMARY (may be attached later)
    ai_session_summary: Optional[str] = None
    # Auto-populate lineage — the passive evidence bundle this version was
    # created from. Both fields are optional and always additive.
    source_event_ids: List[str] = Field(default_factory=list)
    source_checkpoint_ids: List[str] = Field(default_factory=list)


class EvidenceArtifactCreate(BaseModel):
    kind: str                          # from EVIDENCE_ARTIFACT_KINDS
    title: str
    description: Optional[str] = None
    content: Optional[str] = None      # rich_text body / lyric body / etc
    file_url: Optional[str] = None     # populated once upload lands
    cloud_link_url: Optional[str] = None
    mime_type: Optional[str] = None
    size_bytes: Optional[int] = None
    hash: Optional[str] = None


class AcknowledgementCreate(BaseModel):
    role: Optional[str] = None                          # producer / engineer / writer / witness / contributor
    kind: str = "signature"                             # signature | written | audio | video | producer_note | engineer_note | witness | ai_summary
    contribution_statement: Optional[str] = None        # What did you contribute?
    observations: Optional[str] = None                  # What did you observe others contribute?
    agrees_with_version: Optional[bool] = None          # Do you agree this version accurately represents the work at this point in time?
    disputes: Optional[str] = None                      # Any disputes or concerns?
    media_url: Optional[str] = None
    on_behalf_of_name: Optional[str] = None             # if logging an ack for a non-user participant


def _compute_completeness(v: dict) -> dict:
    """
    Documentation completeness — measures ONLY how much of the record has been
    documented. This is NOT a contribution score, NOT a confidence score, and
    NOT MCI. It exists to help creators see which parts of the evidence they
    still need to capture.
    """
    checks = [
        bool(v.get("title") or v.get("label")),
        bool(v.get("purpose") or v.get("notes")),
        bool(v.get("moment_at")),
        bool(v.get("location") or v.get("writing_room")),
        bool(v.get("participants")),
        bool(v.get("objectives")),
        bool(v.get("what_changed")),
        bool(v.get("why_changed")),
        bool(v.get("decisions_reached")) or bool(v.get("decisions_deferred")),
        bool(v.get("open_questions")) or bool(v.get("disagreements")) or bool(v.get("rights_discussions")),
        bool(v.get("environment") and any((v["environment"] or {}).values())),
        bool(v.get("ai_session_summary")),
    ]
    filled = sum(1 for c in checks if c)
    return {"filled": filled, "total": len(checks), "ratio": round(filled / len(checks), 2)}


def _integrity_hash(record: dict) -> str:
    """SHA-256 hash of the canonical version record at moment of creation."""
    canonical_keys = [
        "version_id", "session_id", "submitter_id", "title", "purpose",
        "moment_at", "location", "writing_room", "participants",
        "objectives", "what_changed", "why_changed",
        "decisions_reached", "decisions_deferred", "open_questions",
        "disagreements", "rights_discussions", "parent_version_id",
        "environment", "links", "ai_session_summary", "created_at",
    ]
    payload = {k: record.get(k) for k in canonical_keys}
    return hashlib.sha256(json.dumps(payload, sort_keys=True, default=str).encode("utf-8")).hexdigest()


async def _hydrate_version(v: dict) -> dict:
    """Attach embedded artifact/acknowledgement counts + full lists + completeness."""
    v.pop("_id", None)
    artifacts = await db.creative_evidence_artifacts.find(
        {"version_id": v["version_id"]}, {"_id": 0}
    ).sort("created_at", 1).to_list(500)
    acks = await db.creative_acknowledgements.find(
        {"version_id": v["version_id"]}, {"_id": 0}
    ).sort("created_at", 1).to_list(500)
    v["evidence_artifacts"] = artifacts
    v["acknowledgements"] = acks
    v["artifact_counts"] = {}
    for a in artifacts:
        k = a.get("kind", "other")
        v["artifact_counts"][k] = v["artifact_counts"].get(k, 0) + 1
    v["completeness"] = _compute_completeness(v)
    # Never computed here — always in awaiting state until engines come online.
    v.setdefault("confidence_status", "awaiting_evidence_analysis")
    v.setdefault("mci_status", "awaiting_musical_contribution_analysis")
    return v


async def _assert_session_access(session_id: str, user: dict) -> dict:
    session = await db.sessions.find_one({"session_id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.get("owner_id") != user["user_id"] and not any(
        c.get("user_id") == user["user_id"] for c in session.get("collaborators", [])
    ):
        raise HTTPException(status_code=403, detail="Not a collaborator on this session")
    return session


@api_router.post("/sessions/{session_id}/versions")
async def submit_creative_version(session_id: str, payload: CreativeVersionCreate, user: dict = Depends(get_current_user)):
    session = await _assert_session_access(session_id, user)
    submitter = next((c for c in session.get("collaborators", []) if c.get("user_id") == user["user_id"]), None) or {}
    now = datetime.now(timezone.utc).isoformat()

    # Title accepts either the new `title` or the legacy `label` — one of them must exist.
    title = (payload.title or payload.label or "").strip()[:200]
    if not title:
        raise HTTPException(status_code=400, detail="Version title (or legacy label) is required")

    version_id = f"ver_{secrets.token_hex(6)}"

    # Validate parent (must exist within same session)
    if payload.parent_version_id:
        parent = await db.creative_versions.find_one({"version_id": payload.parent_version_id, "session_id": session_id})
        if not parent:
            raise HTTPException(status_code=400, detail="Parent version not found in this session")

    version = {
        "version_id": version_id,
        "session_id": session_id,
        "submitter_id": user["user_id"],
        "submitter_name": submitter.get("name") or user.get("name"),
        "submitter_color": submitter.get("color") or "#818cf8",

        # THE MOMENT
        "title": title,
        "label": title,  # keep legacy alias for backward-compatible clients
        "purpose": (payload.purpose or payload.notes or "").strip()[:2000] or None,
        "notes": (payload.notes or "").strip()[:2000] or None,  # legacy alias
        "moment_at": payload.moment_at or now,
        "location": (payload.location or "").strip()[:200] or None,
        "writing_room": (payload.writing_room or "").strip()[:200] or None,

        # WHO
        "participants": [p.model_dump() for p in payload.participants],

        # WHAT & WHY
        "objectives": (payload.objectives or "").strip()[:2000] or None,
        "what_changed": (payload.what_changed or "").strip()[:2000] or None,
        "why_changed": (payload.why_changed or "").strip()[:2000] or None,

        # DECISIONS
        "decisions_reached": [s.strip() for s in payload.decisions_reached if s.strip()],
        "decisions_deferred": [s.strip() for s in payload.decisions_deferred if s.strip()],
        "open_questions": [s.strip() for s in payload.open_questions if s.strip()],
        "disagreements": [s.strip() for s in payload.disagreements if s.strip()],
        "rights_discussions": [s.strip() for s in payload.rights_discussions if s.strip()],

        # CONTINUITY
        "parent_version_id": payload.parent_version_id,
        "child_version_ids": [],

        # ENVIRONMENT
        "environment": (payload.environment.model_dump() if payload.environment else None),

        # LINKS
        "links": (payload.links.model_dump() if payload.links else {"sessions": [], "writing_rooms": [], "projects": []}),

        # AI SUMMARY
        "ai_session_summary": (payload.ai_session_summary or "").strip() or None,

        # AUTOMATIC CREATIVE DOCUMENTATION™ lineage — the passive evidence
        # this version was promoted from. When the creator uses "Populate
        # from evidence", these arrays are filled from the events/checkpoints
        # returned by /evidence/populate-since.
        "source_event_ids": list(payload.source_event_ids or []),
        "source_checkpoint_ids": list(payload.source_checkpoint_ids or []),

        # STATUS — never computed here.
        "confidence_status": "awaiting_evidence_analysis",
        "mci_status": "awaiting_musical_contribution_analysis",

        # LEGACY
        "artifact_urls": payload.artifact_urls or [],

        "created_at": now,
    }
    version["integrity_hash"] = _integrity_hash(version)

    await db.creative_versions.insert_one(version)

    # Backfill parent's child pointer (this is the ONLY mutation allowed on prior versions — a lineage link, not content)
    if payload.parent_version_id:
        await db.creative_versions.update_one(
            {"version_id": payload.parent_version_id},
            {"$addToSet": {"child_version_ids": version_id}},
        )

    # Emit an evidence event so it surfaces on every downstream ledger.
    await evidence_recorder.record_event(
        db, kind="version_submitted", session_id=session_id,
        actor_id=user["user_id"], actor_name=version["submitter_name"],
        actor_color=version["submitter_color"],
        label=f"Version submitted · {title}",
        payload={
            "version_id": version_id,
            "parent_version_id": payload.parent_version_id,
            "source_event_count": len(version["source_event_ids"]),
            "source_checkpoint_count": len(version["source_checkpoint_ids"]),
        },
        references=version["source_event_ids"],
    )
    # Seal any currently-open auto-checkpoint — this version is now the
    # official milestone that supersedes the silent working memory bundle.
    await evidence_recorder.close_active_checkpoint(db, session_id=session_id)

    return await _hydrate_version(version)


@api_router.get("/sessions/{session_id}/versions")
async def list_creative_versions(session_id: str, user: dict = Depends(get_current_user)):
    await _assert_session_access(session_id, user)
    versions = await db.creative_versions.find({"session_id": session_id}, {"_id": 0}).sort("created_at", 1).to_list(500)
    return [await _hydrate_version(v) for v in versions]


@api_router.get("/sessions/{session_id}/versions/{version_id}")
async def get_creative_version(session_id: str, version_id: str, user: dict = Depends(get_current_user)):
    await _assert_session_access(session_id, user)
    v = await db.creative_versions.find_one({"version_id": version_id, "session_id": session_id}, {"_id": 0})
    if not v:
        raise HTTPException(status_code=404, detail="Version not found")
    return await _hydrate_version(v)


@api_router.post("/sessions/{session_id}/versions/{version_id}/evidence")
async def add_evidence_artifact(session_id: str, version_id: str, payload: EvidenceArtifactCreate, user: dict = Depends(get_current_user)):
    session = await _assert_session_access(session_id, user)
    v = await db.creative_versions.find_one({"version_id": version_id, "session_id": session_id})
    if not v:
        raise HTTPException(status_code=404, detail="Version not found")
    if payload.kind not in EVIDENCE_ARTIFACT_KINDS:
        raise HTTPException(status_code=400, detail=f"Unsupported evidence kind. Allowed: {sorted(EVIDENCE_ARTIFACT_KINDS)}")
    submitter = next((c for c in session.get("collaborators", []) if c.get("user_id") == user["user_id"]), None) or {}
    now = datetime.now(timezone.utc).isoformat()
    artifact = {
        "artifact_id": f"art_{secrets.token_hex(6)}",
        "version_id": version_id,
        "session_id": session_id,
        "kind": payload.kind,
        "title": payload.title.strip()[:200],
        "description": (payload.description or "").strip()[:2000] or None,
        "content": payload.content,
        "file_url": payload.file_url,
        "cloud_link_url": payload.cloud_link_url,
        "mime_type": payload.mime_type,
        "size_bytes": payload.size_bytes,
        "hash": payload.hash,
        "added_by_id": user["user_id"],
        "added_by_name": submitter.get("name") or user.get("name"),
        "added_by_color": submitter.get("color") or "#818cf8",
        "created_at": now,
    }
    await db.creative_evidence_artifacts.insert_one(artifact)
    await evidence_recorder.record_event(
        db, kind="version_evidence_added", session_id=session_id,
        actor_id=user["user_id"], actor_name=artifact["added_by_name"], actor_color=artifact["added_by_color"],
        label=f"Evidence added · {artifact['title']}",
        payload={"artifact_id": artifact["artifact_id"], "version_id": version_id, "evidence_kind": payload.kind, "preview": artifact.get("description") or artifact["title"]},
    )
    artifact.pop("_id", None)
    return artifact


@api_router.post("/sessions/{session_id}/versions/{version_id}/acknowledgements")
async def add_acknowledgement(session_id: str, version_id: str, payload: AcknowledgementCreate, user: dict = Depends(get_current_user)):
    session = await _assert_session_access(session_id, user)
    v = await db.creative_versions.find_one({"version_id": version_id, "session_id": session_id})
    if not v:
        raise HTTPException(status_code=404, detail="Version not found")
    if payload.kind not in ACKNOWLEDGEMENT_KINDS:
        raise HTTPException(status_code=400, detail=f"Unsupported acknowledgement kind. Allowed: {sorted(ACKNOWLEDGEMENT_KINDS)}")
    submitter = next((c for c in session.get("collaborators", []) if c.get("user_id") == user["user_id"]), None) or {}
    now = datetime.now(timezone.utc).isoformat()
    ack = {
        "ack_id": f"ack_{secrets.token_hex(6)}",
        "version_id": version_id,
        "session_id": session_id,
        "collaborator_id": user["user_id"],
        "collaborator_name": (payload.on_behalf_of_name or submitter.get("name") or user.get("name")),
        "collaborator_color": submitter.get("color") or "#818cf8",
        "on_behalf_of_name": payload.on_behalf_of_name,
        "role": payload.role,
        "kind": payload.kind,
        "contribution_statement": (payload.contribution_statement or "").strip() or None,
        "observations": (payload.observations or "").strip() or None,
        "agrees_with_version": payload.agrees_with_version,
        "disputes": (payload.disputes or "").strip() or None,
        "media_url": payload.media_url,
        "superseded_by": None,
        "created_at": now,
    }
    await db.creative_acknowledgements.insert_one(ack)
    # Sensitive: acknowledgement carries identifying testimony. Ledger keeps
    # metadata + secure reference; the full record stays in creative_acknowledgements.
    await evidence_recorder.record_event(
        db, kind="acknowledgement_submitted", session_id=session_id,
        actor_id=user["user_id"], actor_name=ack["collaborator_name"], actor_color=ack["collaborator_color"],
        label=f"Acknowledgement · {ack['collaborator_name']}",
        payload={"ack_id": ack["ack_id"], "version_id": version_id, "kind": payload.kind, "agrees_with_version": payload.agrees_with_version, "participants": [ack["collaborator_id"]]},
        secure_reference={"collection": "creative_acknowledgements", "id": ack["ack_id"]},
    )
    ack.pop("_id", None)
    return ack


# ---------- Automatic Creative Documentation™ · Evidence Stream ----------
# The passive evidence layer. Every write across the platform emits an event
# into `creative_evidence_events`. These endpoints let the UI (Live view,
# Document Version's "Populate from evidence" step, future comparison &
# MCI engines) read that stream.

@api_router.get("/sessions/{session_id}/evidence")
async def list_creative_evidence(
    session_id: str,
    since: Optional[str] = None,
    kind: Optional[str] = None,
    limit: int = 500,
    user: dict = Depends(get_current_user),
):
    await _assert_session_access(session_id, user)
    kinds = [k.strip() for k in kind.split(",")] if kind else None
    return await evidence_recorder.list_events_since(
        db, session_id=session_id, since=since, kinds=kinds, limit=max(1, min(limit, 2000)),
    )


@api_router.get("/sessions/{session_id}/evidence/checkpoints")
async def list_evidence_checkpoints(session_id: str, user: dict = Depends(get_current_user)):
    await _assert_session_access(session_id, user)
    docs = await db.evidence_checkpoints.find(
        {"session_id": session_id}, {"_id": 0}
    ).sort("opened_at", 1).to_list(500)
    return docs


@api_router.get("/sessions/{session_id}/evidence/populate-since")
async def populate_from_evidence(
    session_id: str,
    parent_version_id: Optional[str] = None,
    user: dict = Depends(get_current_user),
):
    """
    Return a derived auto-populate payload for the Document Version modal:
    participants, what_changed[], decisions_reached[], open_questions[],
    plus source_event_ids/source_checkpoint_ids that will be linked into the
    resulting version so nothing is ever lost from the record.
    """
    await _assert_session_access(session_id, user)
    since_iso: Optional[str] = None
    if parent_version_id:
        parent = await db.creative_versions.find_one(
            {"version_id": parent_version_id, "session_id": session_id}, {"_id": 0}
        )
        if not parent:
            raise HTTPException(status_code=404, detail="Parent version not found")
        since_iso = parent.get("created_at")
    else:
        # If no parent, fall back to the most recent version's created_at.
        latest = await db.creative_versions.find(
            {"session_id": session_id}, {"_id": 0}
        ).sort("created_at", -1).limit(1).to_list(1)
        if latest:
            since_iso = latest[0].get("created_at")
    return await evidence_recorder.derive_populate_from_evidence(
        db, session_id=session_id, since_iso=since_iso,
    )


# ---------- Musical Contribution Intelligence™ (MCI) ----------
# MCI reads every documented evidence signal (creative events, versions,
# acknowledgements, confirmed voice moments) and returns an ANALYTICAL
# picture of documented musical contributions per contributor.
# Non-negotiable guardrails enforced by /app/backend/mci.py:
#   • analyses documented contributions only
#   • does NOT determine legal ownership
#   • does NOT assign publishing splits
#   • sufficiency gate: mci_status stays 'awaiting_musical_contribution_analysis'
#     until enough documented evidence + at least one human-in-the-loop signal
#     exists

@api_router.get("/sessions/{session_id}/mci")
async def get_session_mci(session_id: str, user: dict = Depends(get_current_user)):
    await _assert_session_access(session_id, user)
    result = await mci_engine.compute_mci_for_session(db, session_id)
    # Reflect the outcome onto every version of the session so consumers
    # reading a version doc see the resolved analytical status.
    await mci_engine.stamp_versions_mci_status(db, session_id, result["status"])
    return result


@api_router.post("/sessions/{session_id}/mci/refresh")
async def refresh_session_mci(session_id: str, user: dict = Depends(get_current_user)):
    await _assert_session_access(session_id, user)
    result = await mci_engine.compute_mci_for_session(db, session_id)
    await mci_engine.stamp_versions_mci_status(db, session_id, result["status"])
    return result


# ---------- Comparison Engine ----------
# Side-by-side comparison of any two documented versions. Every statement in
# the response is traceable back to existing evidence — nothing inferred,
# nothing invented. See /app/backend/comparison.py for the diff logic.

@api_router.get("/sessions/{session_id}/comparison")
async def compare_two_versions(
    session_id: str,
    a: str = Query(..., description="First version_id"),
    b: str = Query(..., description="Second version_id"),
    user: dict = Depends(get_current_user),
):
    await _assert_session_access(session_id, user)
    result = await comparison_engine.compare_versions(db, session_id, a, b)
    if result.get("error"):
        raise HTTPException(status_code=404, detail=result["error"])
    return result


# ----- Voice Evidence Layer ----- (existing endpoints continue below)
# See /app/backend/media_evidence.py for the full pipeline (Whisper → Claude
# Sonnet 5 → human-review gate). Voice records are first-class Creative
# Evidence™ objects; the same schema will carry video/screen/DAW/MIDI/camera.

class SpeakerTag(BaseModel):
    name: str
    role: Optional[str] = None
    rightprint_id: Optional[str] = None
    user_id: Optional[str] = None


class MomentReview(BaseModel):
    action: str                                 # "confirmed" | "corrected" | "disputed" | "annotated"
    correction: Optional[Dict[str, Any]] = None # {kind?, excerpt?}
    note: Optional[str] = None


@api_router.post("/sessions/{session_id}/voice")
async def upload_voice_recording(
    session_id: str,
    file: UploadFile = File(...),
    duration_sec: Optional[float] = Form(None),
    linked_version_id: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    additional_speakers: Optional[str] = Form(None),  # JSON string
    user: dict = Depends(get_current_user),
):
    session = await _assert_session_access(session_id, user)
    if duration_sec is not None and duration_sec > media_evidence.MAX_CLIP_DURATION_SECONDS:
        raise HTTPException(status_code=400, detail=f"Recording exceeds max duration of {media_evidence.MAX_CLIP_DURATION_SECONDS // 60} min")

    # Read the entire body and persist to object storage.
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty audio upload")

    ext = (file.filename or "audio").rsplit(".", 1)[-1].lower() if "." in (file.filename or "") else "webm"
    storage_path = f"{APP_NAME}/voice/{session_id}/{uuid.uuid4().hex}.{ext}"
    put_object(storage_path, data, file.content_type or "audio/webm")
    audio_hash = hashlib.sha256(data).hexdigest()

    # Snapshot the current collaborator roster + RightPrint identities.
    collaborators = session.get("collaborators", []) or []
    submitter = next((c for c in collaborators if c.get("user_id") == user["user_id"]), {}) or {}
    rp_identities = []
    for c in collaborators:
        u = await db.users.find_one({"user_id": c.get("user_id")}, {"_id": 0, "user_id": 1, "name": 1, "legal_name": 1, "professional_name": 1, "pro": 1, "ipi_number": 1})
        if u:
            rp_identities.append(u)

    # Optional manually-tagged additional speakers
    extras: List[Dict[str, Any]] = []
    if additional_speakers:
        try:
            parsed = json.loads(additional_speakers)
            if isinstance(parsed, list):
                extras = [dict(x) for x in parsed if isinstance(x, dict)]
        except Exception:
            extras = []

    # Optional currently-open evidence checkpoint to bind this recording to
    open_ck = await db.evidence_checkpoints.find_one(
        {"session_id": session_id, "status": "open"}, sort=[("opened_at", -1)]
    )

    recording_id = f"rec_{secrets.token_hex(6)}"
    now = datetime.now(timezone.utc).isoformat()

    # Emit the FIRST-CLASS voice event immediately. Transcription/classification
    # augment the record over the next few seconds, but the recording is already
    # permanent Creative Evidence™.
    voice_event = await evidence_recorder.record_event(
        db, kind="voice_memo_recorded", session_id=session_id,
        actor_id=user["user_id"], actor_name=user.get("name"), actor_color=submitter.get("color") or "#818cf8",
        actor_rightprint_id=submitter.get("rightprint_id"),
        label=f"{user.get('name')} recorded a voice memo",
        payload={
            "recording_id": recording_id,
            "storage_path": storage_path,
            "mime_type": file.content_type,
            "size_bytes": len(data),
            "duration_sec": duration_sec,
            "sha256": audio_hash,
        },
    )

    doc = {
        "recording_id": recording_id,
        "media_kind": "voice",
        "session_id": session_id,
        "storage_path": storage_path,
        "mime_type": file.content_type or "audio/webm",
        "size_bytes": len(data),
        "duration_sec": duration_sec,
        "content_hash": audio_hash,
        # Who
        "recorded_by_id": user["user_id"],
        "recorded_by_name": user.get("name"),
        "recorded_by_color": submitter.get("color") or "#818cf8",
        "recorded_by_rightprint_id": submitter.get("rightprint_id"),
        "additional_speakers": extras,
        "location": location,
        # Linkage
        "linked_version_id": linked_version_id,
        "linked_checkpoint_id": (open_ck or {}).get("checkpoint_id"),
        "linked_contributors": [
            {"user_id": c.get("user_id"), "name": c.get("name"), "color": c.get("color")}
            for c in collaborators
        ],
        "rightprint_identities_present": rp_identities,
        # Pipeline
        "transcription_status": "pending",
        "transcript": None,
        "segments": [],
        "language": None,
        "moments_status": "pending",
        "detected_moments": [],
        "voice_memo_event_id": voice_event["event_id"],
        # Meta
        "created_at": now,
    }
    await db.voice_evidence.insert_one(doc)

    # Spawn the async transcription + classification pipeline. This uses
    # the same event loop — we intentionally do NOT block the upload response.
    tmp_path = f"/tmp/inheira_voice_{recording_id}.{ext}"
    with open(tmp_path, "wb") as fh:
        fh.write(data)
    asyncio.create_task(media_evidence.process_recording(db, recording_id, tmp_path))

    doc.pop("_id", None)
    return doc


@api_router.get("/sessions/{session_id}/voice")
async def list_voice_recordings(session_id: str, user: dict = Depends(get_current_user)):
    await _assert_session_access(session_id, user)
    docs = await db.voice_evidence.find({"session_id": session_id}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return docs


@api_router.get("/voice/{recording_id}")
async def get_voice_recording(recording_id: str, user: dict = Depends(get_current_user)):
    rec = await db.voice_evidence.find_one({"recording_id": recording_id}, {"_id": 0})
    if not rec:
        raise HTTPException(status_code=404, detail="Recording not found")
    await _assert_session_access(rec["session_id"], user)
    # Materialise a playback URL. We serve audio through an authenticated
    # endpoint so access control is respected on every playback request.
    rec["playback_url"] = f"/api/voice/{recording_id}/audio"
    return rec


@api_router.get("/voice/{recording_id}/audio")
async def stream_voice_recording(recording_id: str, user: dict = Depends(get_current_user)):
    rec = await db.voice_evidence.find_one({"recording_id": recording_id}, {"_id": 0})
    if not rec:
        raise HTTPException(status_code=404, detail="Recording not found")
    await _assert_session_access(rec["session_id"], user)
    data, content_type = get_object(rec["storage_path"])
    return Response(content=data, media_type=rec.get("mime_type") or content_type or "audio/webm")


@api_router.post("/voice/{recording_id}/speakers")
async def add_voice_speaker(recording_id: str, payload: SpeakerTag, user: dict = Depends(get_current_user)):
    rec = await db.voice_evidence.find_one({"recording_id": recording_id}, {"_id": 0})
    if not rec:
        raise HTTPException(status_code=404, detail="Recording not found")
    await _assert_session_access(rec["session_id"], user)
    entry = {**payload.model_dump(), "added_by": user["user_id"], "added_at": datetime.now(timezone.utc).isoformat()}
    await db.voice_evidence.update_one({"recording_id": recording_id}, {"$push": {"additional_speakers": entry}})
    return {"ok": True, "speaker": entry}


@api_router.post("/voice/{recording_id}/moments/{moment_id}/review")
async def review_voice_moment(recording_id: str, moment_id: str, payload: MomentReview, user: dict = Depends(get_current_user)):
    rec = await db.voice_evidence.find_one({"recording_id": recording_id})
    if not rec:
        raise HTTPException(status_code=404, detail="Recording not found")
    session = await _assert_session_access(rec["session_id"], user)
    submitter = next((c for c in session.get("collaborators", []) if c.get("user_id") == user["user_id"]), {}) or {}
    try:
        moment = await media_evidence.promote_moment_to_evidence(
            db,
            recording_id=recording_id, moment_id=moment_id, action=payload.action,
            reviewer_id=user["user_id"], reviewer_name=user.get("name"),
            reviewer_color=submitter.get("color") or "#818cf8",
            correction=payload.correction, note=payload.note,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return moment


@api_router.post("/voice/{recording_id}/reclassify")
async def reclassify_voice_moments(recording_id: str, user: dict = Depends(get_current_user)):
    """Re-run Claude Sonnet 5 on the transcript. Existing human-reviewed
    moments are PRESERVED; new detections are appended with human_status
    'unconfirmed'. Nothing is ever deleted from the record."""
    rec = await db.voice_evidence.find_one({"recording_id": recording_id})
    if not rec:
        raise HTTPException(status_code=404, detail="Recording not found")
    await _assert_session_access(rec["session_id"], user)
    if not rec.get("transcript"):
        raise HTTPException(status_code=400, detail="Recording has no transcript yet")
    fresh = await media_evidence._classify_moments(rec["transcript"], rec.get("segments") or [])
    existing = list(rec.get("detected_moments") or [])
    # De-dupe by excerpt+kind against existing detections
    seen = {(m.get("kind"), (m.get("excerpt") or "").strip()) for m in existing}
    added = [m for m in fresh if (m["kind"], m["excerpt"].strip()) not in seen]
    if added:
        await db.voice_evidence.update_one(
            {"recording_id": recording_id},
            {"$push": {"detected_moments": {"$each": added}}, "$set": {"moments_status": "done"}},
        )
    return {"added": len(added), "total": len(existing) + len(added)}


@api_router.get("/creator/evidence")
async def list_creator_evidence(
    since: Optional[str] = None,
    kind: Optional[str] = None,
    limit: int = 500,
    user: dict = Depends(get_current_user),
):
    """
    Creator-scoped audit stream — surfaces every Creative Evidence™ event
    where this user is the actor, INCLUDING cross-session events like
    rightprint_updated (session_id=None). Without this, cross-session
    passive evidence would be write-only. The record already exists in
    creative_evidence_events; this endpoint just gives an authorised
    reader a way to see their own trail.
    """
    q: Dict[str, Any] = {"actor.id": user["user_id"]}
    if since:
        q["created_at"] = {"$gt": since}
    if kind:
        kinds = [k.strip() for k in kind.split(",")]
        q["kind"] = {"$in": kinds}
    docs = await db.creative_evidence_events.find(q, {"_id": 0}).sort("created_at", -1).to_list(max(1, min(limit, 2000)))
    return docs


@api_router.get("/")
async def root():
    return {"app": "INHEIRA", "tagline": "Where creativity becomes legacy.", "version": "2.0.0-cei.1"}


# ---------- Startup ----------
@app.on_event("startup")
async def startup():
    init_storage()
    # seed a test user for testing
    existing = await db.users.find_one({"email": "test@songright.com"}, {"_id": 0})
    if not existing:
        await db.users.insert_one(
            {
                "user_id": "user_seed_test001",
                "email": "test@songright.com",
                "name": "Test Creator",
                "password_hash": hash_password("Test1234!"),
                "picture": None,
                "auth_provider": "password",
                "verification_status": "verified",
                "professional_name": "Test Creator",
                "pro": "ASCAP",
                "disciplines": ["Songwriter", "Producer"],
                "instruments": ["Vocals", "Piano"],
                "genres": ["Pop", "R&B"],
                "social_links": {},
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        )


@app.on_event("shutdown")
async def shutdown():
    client.close()


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
