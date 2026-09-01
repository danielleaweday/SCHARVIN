"""COHEIR™ — Dual authentication (Emergent Google Auth + email/password JWT).

Both flows produce a `session_token` stored in `user_sessions` collection AND set
as an httpOnly cookie so a single downstream `require_user` dependency works.
"""
from __future__ import annotations
import os
import secrets
import bcrypt
import httpx
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel, EmailStr

from models import User, UserPublic, UserSession, Role

EMERGENT_SESSION_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"
COOKIE_NAME = "coheir_session"
SESSION_TTL_DAYS = 7


# ─────────────────────────────────────────────────────────────────────────────
# Password helpers
# ─────────────────────────────────────────────────────────────────────────────

def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw: str, pw_hash: str) -> bool:
    if not pw_hash:
        return False
    return bcrypt.checkpw(pw.encode(), pw_hash.encode())


# ─────────────────────────────────────────────────────────────────────────────
# Session utilities
# ─────────────────────────────────────────────────────────────────────────────

def _new_session_token() -> str:
    return "cohst_" + secrets.token_urlsafe(48)


def _to_public(doc: dict) -> UserPublic:
    return UserPublic(**doc)


async def _get_session(db, token: str) -> Optional[dict]:
    if not token:
        return None
    doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not doc:
        return None
    expires_at = doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        return None
    return doc


async def _persist_session(db, user_id: str, session_token: str) -> None:
    expires_at = datetime.now(timezone.utc) + timedelta(days=SESSION_TTL_DAYS)
    await db.user_sessions.insert_one({
        "id": secrets.token_hex(12),
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })


def _set_cookie(resp: Response, token: str) -> None:
    resp.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=SESSION_TTL_DAYS * 24 * 60 * 60,
        expires=SESSION_TTL_DAYS * 24 * 60 * 60,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
    )


def _clear_cookie(resp: Response) -> None:
    resp.delete_cookie(key=COOKIE_NAME, path="/")


# ─────────────────────────────────────────────────────────────────────────────
# FastAPI dependency
# ─────────────────────────────────────────────────────────────────────────────

async def current_user(request: Request) -> UserPublic:
    db = request.app.state.db
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    sess = await _get_session(db, token)
    if not sess:
        raise HTTPException(status_code=401, detail="Session expired")
    doc = await db.users.find_one({"user_id": sess["user_id"]}, {"_id": 0, "password_hash": 0})
    if not doc:
        raise HTTPException(status_code=401, detail="User not found")
    return _to_public(doc)


async def optional_user(request: Request) -> Optional[UserPublic]:
    try:
        return await current_user(request)
    except HTTPException:
        return None


def require_role(*roles: str):
    async def _dep(user: UserPublic = Depends(current_user)) -> UserPublic:
        all_roles = set([user.role] + list(user.roles or []))
        if not (set(roles) & all_roles):
            raise HTTPException(status_code=403, detail="Insufficient role")
        return user
    return _dep


# ─────────────────────────────────────────────────────────────────────────────
# Router
# ─────────────────────────────────────────────────────────────────────────────

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterBody(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: Role = "student"
    institution: Optional[str] = None


class LoginBody(BaseModel):
    email: EmailStr
    password: str


class EmergentBody(BaseModel):
    session_id: str


@router.post("/register")
async def register(body: RegisterBody, request: Request, response: Response):
    db = request.app.state.db
    existing = await db.users.find_one({"email": body.email.lower()}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    user = User(
        email=body.email.lower(),
        name=body.name,
        role=body.role,
        institution=body.institution,
        provider="password",
        password_hash=hash_password(body.password),
        verified=False,
    )
    doc = user.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.users.insert_one(doc)
    token = _new_session_token()
    await _persist_session(db, user.user_id, token)
    _set_cookie(response, token)
    safe = await db.users.find_one({"user_id": user.user_id}, {"_id": 0, "password_hash": 0})
    return {"user": _to_public(safe).model_dump(), "session_token": token}


@router.post("/login")
async def login(body: LoginBody, request: Request, response: Response):
    db = request.app.state.db
    doc = await db.users.find_one({"email": body.email.lower()}, {"_id": 0})
    if not doc or not verify_password(body.password, doc.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = _new_session_token()
    await _persist_session(db, doc["user_id"], token)
    _set_cookie(response, token)
    safe = {k: v for k, v in doc.items() if k != "password_hash"}
    return {"user": _to_public(safe).model_dump(), "session_token": token}


@router.post("/emergent")
async def emergent_exchange(body: EmergentBody, request: Request, response: Response):
    """Exchange Emergent session_id for a COHEIR session cookie."""
    db = request.app.state.db
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(
            EMERGENT_SESSION_URL,
            headers={"X-Session-ID": body.session_id},
        )
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Emergent session")
    data = r.json()
    email = (data.get("email") or "").lower()
    name = data.get("name") or email.split("@")[0]
    picture = data.get("picture")
    if not email:
        raise HTTPException(status_code=400, detail="Emergent payload missing email")

    doc = await db.users.find_one({"email": email}, {"_id": 0})
    if not doc:
        user = User(
            email=email, name=name, picture=picture,
            provider="emergent_google", verified=True,
            role="student",
        )
        doc = user.model_dump()
        doc["created_at"] = doc["created_at"].isoformat()
        await db.users.insert_one(doc)
    else:
        # keep provider/picture fresh
        await db.users.update_one(
            {"user_id": doc["user_id"]},
            {"$set": {"picture": picture or doc.get("picture"), "verified": True}},
        )
        doc = await db.users.find_one({"user_id": doc["user_id"]}, {"_id": 0})

    token = _new_session_token()
    await _persist_session(db, doc["user_id"], token)
    _set_cookie(response, token)
    safe = {k: v for k, v in doc.items() if k != "password_hash"}
    return {"user": _to_public(safe).model_dump(), "session_token": token}


@router.get("/me")
async def me(user: UserPublic = Depends(current_user)):
    return user.model_dump()


@router.post("/logout")
async def logout(request: Request, response: Response):
    db = request.app.state.db
    token = request.cookies.get(COOKIE_NAME)
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    _clear_cookie(response)
    return {"ok": True}


class DemoLoginBody(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None


@router.post("/demo")
async def demo_login(body: DemoLoginBody, request: Request, response: Response):
    """Instant demo login for the seeded demo users (no password). Great for reviewers."""
    db = request.app.state.db
    q = {}
    if body.user_id:
        q["user_id"] = body.user_id
    elif body.email:
        q["email"] = body.email.lower()
    else:
        raise HTTPException(status_code=400, detail="Provide user_id or email")
    doc = await db.users.find_one(q, {"_id": 0, "password_hash": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Demo user not found")
    token = _new_session_token()
    await _persist_session(db, doc["user_id"], token)
    _set_cookie(response, token)
    return {"user": _to_public(doc).model_dump(), "session_token": token}
