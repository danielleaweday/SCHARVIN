from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import io
import re
import uuid
import logging
import secrets
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
import requests
from bson import ObjectId
from fastapi import APIRouter, Depends, FastAPI, File, HTTPException, Query, Request, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field

# ---------- Config ----------
JWT_ALGORITHM = "HS256"
ACCESS_TTL_MIN = 60 * 24  # 1 day for demo comfort
REFRESH_TTL_DAYS = 30


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


# ---------- Mongo ----------
mongo_url = os.environ["MONGO_URL"]
mongo_client = AsyncIOMotorClient(mongo_url)
db = mongo_client[os.environ["DB_NAME"]]

# ---------- App ----------
app = FastAPI(title="ANCRID API")
api_router = APIRouter(prefix="/api")
auth_router = APIRouter(prefix="/api/auth", tags=["auth"])
ancrid_router = APIRouter(prefix="/api/ancrid", tags=["ancrid"])
public_router = APIRouter(prefix="/api/public", tags=["public"])
sso_router = APIRouter(prefix="/api/sso", tags=["sso"])
files_router = APIRouter(prefix="/api/files", tags=["files"])
mobility_router = APIRouter(prefix="/api/mobility", tags=["mobility"])

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("ancrid")


# ---------- Object Storage ----------
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = os.environ.get("APP_NAME", "ancrid")
_storage_key: Optional[str] = None


def init_storage() -> Optional[str]:
    global _storage_key
    if _storage_key:
        return _storage_key
    if not EMERGENT_KEY:
        logger.warning("EMERGENT_LLM_KEY missing — storage disabled")
        return None
    try:
        r = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
        r.raise_for_status()
        _storage_key = r.json()["storage_key"]
        logger.info("Object storage initialised")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
        _storage_key = None
    return _storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    if not key:
        raise RuntimeError("Storage not initialised")
    r = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data,
        timeout=120,
    )
    r.raise_for_status()
    return r.json()


def get_object(path: str):
    key = init_storage()
    if not key:
        raise RuntimeError("Storage not initialised")
    r = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    r.raise_for_status()
    return r.content, r.headers.get("Content-Type", "application/octet-stream")


ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MIME_EXT = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif"}


# ---------- Helpers ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TTL_MIN),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=REFRESH_TTL_DAYS),
        "type": "refresh",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, access: str, refresh: str) -> None:
    response.set_cookie(
        key="access_token",
        value=access,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=ACCESS_TTL_MIN * 60,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=REFRESH_TTL_DAYS * 24 * 3600,
        path="/",
    )


def clear_auth_cookies(response: Response) -> None:
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")


def scrub_user(doc: dict) -> dict:
    doc = dict(doc)
    doc["id"] = str(doc.pop("_id"))
    doc.pop("password_hash", None)
    return doc


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return scrub_user(user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------- Pydantic ----------
class RegisterInput(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    professional_name: str
    role: Optional[str] = "Creator"
    institution: Optional[str] = "ANCR Academy"
    discipline: Optional[str] = "Multi-Disciplinary"


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class ProfileUpdate(BaseModel):
    professional_name: Optional[str] = None
    pronouns: Optional[str] = None
    location: Optional[str] = None
    languages: Optional[List[str]] = None
    disciplines: Optional[List[str]] = None
    biography: Optional[str] = None
    mission: Optional[str] = None
    headshot_url: Optional[str] = None
    banner_url: Optional[str] = None
    website: Optional[str] = None
    social_links: Optional[dict] = None


# ---------- Seed data (rich creator identity) ----------
def _demo_identity(user_id: str, email: str, name: str) -> dict:
    return {
        "ancrid_number": "ANCRID-2026-0001",
        "creator_passport_id": "CPX-8842-INHR",
        "verification_status": "Verified",
        "verified_badges": ["Government ID", "Student", "Creator", "Institutional Affiliation"],
        "institution": "ANCR Academy — CCDP",
        "role": "Student · Songwriter · Producer",
        "discipline": "Music · Film · Creative Direction",
        "location": "Los Angeles, CA · Lagos, NG",
        "languages": ["English", "Yoruba", "French"],
        "member_since": "2024-09-01",
        "current_status": "In Session — INHEIRA · The Amber Room EP",
        "profile_completion": 92,
        "portfolio_score": 87,
        "creative_reputation_score": 91,
        "professional_readiness_score": 78,
        "headshot_url": "https://images.unsplash.com/photo-1759853900346-8d1ee0af7ca8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w7NTY2NzZ8MHwxfHNlYXJjaHwzfHxjaW5lbWF0aWMlMjBmaWxtJTIwc2V0JTIwZGFya3xlbnwwfHx8fDE3ODMzMzc4NDN8MA&ixlib=rb-4.1.0&q=85",
        "banner_url": "https://images.unsplash.com/photo-1580529352977-df08012d92b0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGVsZWN0cmljJTIwYmx1ZSUyMG9yYW5nZSUyMDNkfGVufDB8fHx8MTc4MzQ2MzI3MXww&ixlib=rb-4.1.0&q=85",
        "pronouns": "they/them",
        "biography": "Multi-hyphenate creator working across music, film, and creative direction. Building a body of work that lives at the intersection of memory, place, and machine — one verified project at a time.",
        "mission": "To document a generation of creators through owned, verified work that outlives the platforms it was made on.",
        "website": "https://ancr.io",
        "social_links": {
            "instagram": "@ancr.creator",
            "x": "@ancr_creator",
            "linkedin": "in/ancr-creator",
        },
    }


DEMO_PORTFOLIO = [
    {"id": "p1", "title": "The Amber Room EP", "medium": "Music", "role": "Songwriter · Producer", "year": 2026,
     "cover": "https://images.unsplash.com/photo-1610716632318-acfc6a85d1ed?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODh8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMHByb2R1Y2VyJTIwc3R1ZGlvJTIwZGFya3xlbnwwfHx8fDE3ODM0NjMyNzB8MA&ixlib=rb-4.1.0&q=85",
     "verified": True, "connected_app": "INHEIRA"},
    {"id": "p2", "title": "Salt & Signal (Short Film)", "medium": "Film", "role": "Writer · Director", "year": 2025,
     "cover": "https://images.unsplash.com/photo-1572283046480-e990be92d301?crop=entropy&cs=srgb&fm=jpg&ixid=M3w7NTY2NzZ8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjBmaWxtJTIwc2V0JTIwZGFya3xlbnwwfHx8fDE3ODMzMzc4NDN8MA&ixlib=rb-4.1.0&q=85",
     "verified": True, "connected_app": "ANCRLAB"},
    {"id": "p3", "title": "Marrakech Sessions", "medium": "Photography", "role": "Photographer", "year": 2025,
     "cover": "https://images.unsplash.com/photo-1655931546417-18e16c015812?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODh8MHwxfHNlYXJjaHw0fHxtdXNpYyUyMHByb2R1Y2VyJTIwc3R1ZGlvJTIwZGFya3xlbnwwfHx8fDE3ODM0NjMyNzB8MA&ixlib=rb-4.1.0&q=85",
     "verified": True, "connected_app": "Passport"},
    {"id": "p4", "title": "Field Notes — Vol. II", "medium": "Writing", "role": "Author", "year": 2025,
     "cover": "https://images.unsplash.com/photo-1580529352988-5236c86b9439?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHwyfHxhYnN0cmFjdCUyMGVsZWN0cmljJTIwYmx1ZSUyMG9yYW5nZSUyMDNkfGVufDB8fHx8MTc4MzQ2MzI3MXww&ixlib=rb-4.1.0&q=85",
     "verified": False, "connected_app": "ANCRA"},
]

DEMO_TIMELINE = [
    {"date": "2024-09-01", "title": "Accepted into CCDP", "app": "ANCRA", "type": "milestone"},
    {"date": "2024-10-14", "title": "First Recording Session — Studio B", "app": "ANCRLAB", "type": "session"},
    {"date": "2024-12-02", "title": "Collaboration Started: Nia Okafor", "app": "ANCRSync", "type": "collab"},
    {"date": "2025-02-18", "title": "Salt & Signal — Film Released", "app": "ANCRA", "type": "release"},
    {"date": "2025-05-06", "title": "Marrakech Residency — Selected", "app": "Passport", "type": "residency"},
    {"date": "2025-08-22", "title": "Composition Certification", "app": "ANCRA", "type": "certification"},
    {"date": "2025-11-11", "title": "Publishing Split Registered", "app": "Vaulta", "type": "financial"},
    {"date": "2026-01-15", "title": "The Amber Room EP — Writing Camp", "app": "INHEIRA", "type": "camp"},
]

DEMO_COLLABORATIONS = [
    {"collaborator": "Nia Okafor", "project": "The Amber Room EP", "role": "Co-writer", "contribution": "Topline & lyrics",
     "date": "2025-01-08", "institution": "ANCR Academy", "verified": True, "app": "INHEIRA"},
    {"collaborator": "Ravi Menon", "project": "Salt & Signal", "role": "Cinematographer", "contribution": "Photography & color",
     "date": "2024-11-20", "institution": "USC Cinematic Arts", "verified": True, "app": "ANCRLAB"},
    {"collaborator": "Ines Delacroix", "project": "Marrakech Sessions", "role": "Creative Director", "contribution": "Direction & wardrobe",
     "date": "2025-05-14", "institution": "École 42", "verified": True, "app": "ANCRSync"},
    {"collaborator": "Jules Amir", "project": "Field Notes Vol. II", "role": "Editor", "contribution": "Manuscript editing",
     "date": "2025-07-02", "institution": "Independent", "verified": False, "app": "ANCRA"},
]

DEMO_PASSPORT = {
    "countries": ["United States", "Nigeria", "Morocco", "France", "United Kingdom", "Japan"],
    "entries": [
        {"country": "Morocco", "city": "Marrakech", "purpose": "Creative Residency", "date": "2025-05",
         "project": "Marrakech Sessions", "app": "Passport"},
        {"country": "France", "city": "Paris", "purpose": "Writing Camp", "date": "2025-09",
         "project": "The Amber Room EP", "app": "INHEIRA"},
        {"country": "Japan", "city": "Tokyo", "purpose": "Study Abroad", "date": "2024-06",
         "project": "Sound Design Intensive", "app": "ANCRA"},
        {"country": "United Kingdom", "city": "London", "purpose": "Tour", "date": "2025-11",
         "project": "The Amber Room — Live", "app": "ANCRLaunch"},
        {"country": "Nigeria", "city": "Lagos", "purpose": "Exchange", "date": "2025-03",
         "project": "Afrobeats & Diaspora Series", "app": "ANCRSync"},
    ],
}

DEMO_SKILLS = [
    {"name": "Songwriting", "level": "Expert", "experience_years": 6, "projects": 24, "verified_by": "ANCR Academy", "evidence": "The Amber Room EP"},
    {"name": "Composition", "level": "Advanced", "experience_years": 5, "projects": 18, "verified_by": "ANCRLAB", "evidence": "Salt & Signal Score"},
    {"name": "Production", "level": "Expert", "experience_years": 7, "projects": 31, "verified_by": "INHEIRA", "evidence": "Multiple releases"},
    {"name": "Audio Engineering", "level": "Advanced", "experience_years": 4, "projects": 15, "verified_by": "ANCRLAB", "evidence": "Studio B Sessions"},
    {"name": "Mixing", "level": "Advanced", "experience_years": 4, "projects": 12, "verified_by": "ANCRLAB", "evidence": ""},
    {"name": "Photography", "level": "Intermediate", "experience_years": 3, "projects": 9, "verified_by": "Passport", "evidence": "Marrakech Sessions"},
    {"name": "Creative Direction", "level": "Advanced", "experience_years": 5, "projects": 11, "verified_by": "ANCRSync", "evidence": ""},
    {"name": "AI Tools", "level": "Expert", "experience_years": 3, "projects": 7, "verified_by": "ANCR Academy", "evidence": "AIAH Fellow"},
    {"name": "Copyright & Publishing", "level": "Advanced", "experience_years": 2, "projects": 6, "verified_by": "Vaulta", "evidence": ""},
    {"name": "Leadership", "level": "Intermediate", "experience_years": 3, "projects": 4, "verified_by": "ANCR Academy", "evidence": ""},
]

DEMO_EDUCATION = [
    {"institution": "ANCR Academy — CCDP", "degree": "Creator's Certified Diploma Program", "years": "2024 – Present",
     "courses": ["Songwriting I & II", "Music Business", "Cinematic Storytelling", "Creator Rights & IP", "AI-Assisted Production"],
     "mentors": ["Aaron E.", "Nia Okafor"], "capstone": "The Amber Room EP"},
    {"institution": "USC Thornton (Exchange)", "degree": "Songwriting Intensive", "years": "2025",
     "courses": ["Advanced Topline", "Score for Picture"], "mentors": ["Prof. Karen Ramos"], "capstone": ""},
]

DEMO_HISTORY = [
    {"role": "Recording Artist", "organization": "INHEIRA Records", "type": "Employment", "years": "2025 – Present"},
    {"role": "Session Musician", "organization": "Independent", "type": "Freelance", "years": "2023 – Present"},
    {"role": "Teaching Assistant", "organization": "ANCR Academy", "type": "Teaching", "years": "2025 – Present"},
    {"role": "Speaker", "organization": "Africa Rising Summit", "type": "Speaking", "years": "2025"},
    {"role": "Volunteer", "organization": "MusiCares", "type": "Service", "years": "2024 – Present"},
]

DEMO_ACHIEVEMENTS = [
    {"title": "ANCR Creator of the Semester", "issuer": "ANCR Academy", "year": 2025, "type": "Award"},
    {"title": "Rising Voices Scholarship", "issuer": "The Recording Academy", "year": 2024, "type": "Scholarship"},
    {"title": "AIAH Fellowship", "issuer": "ANCR × AIAH", "year": 2025, "type": "Fellowship"},
    {"title": "Best Original Score — Salt & Signal", "issuer": "LA Shorts Fest", "year": 2025, "type": "Competition"},
    {"title": "Certified Producer — Advanced", "issuer": "ANCRLAB", "year": 2025, "type": "Certification"},
    {"title": "Featured Release — The Amber Room EP", "issuer": "INHEIRA", "year": 2026, "type": "Release"},
]

DEMO_CREDENTIALS = [
    {"name": "Government ID Verification", "status": "Verified", "issuer": "ANCRID Trust", "date": "2024-09-05"},
    {"name": "Student Verification — CCDP", "status": "Verified", "issuer": "ANCR Academy", "date": "2024-09-10"},
    {"name": "Creator Verification", "status": "Verified", "issuer": "ANCRID", "date": "2025-01-14"},
    {"name": "Industry Verification", "status": "Verified", "issuer": "Recording Academy", "date": "2024-12-02"},
    {"name": "Institutional Affiliation", "status": "Verified", "issuer": "ANCR Academy", "date": "2024-09-01"},
    {"name": "Publishing License", "status": "Active", "issuer": "ASCAP", "date": "2025-02-11"},
]

DEMO_ECOSYSTEM = [
    {"code": "ANCRA", "name": "ANCRA™", "purpose": "Academy & Learning", "status": "connected", "last_activity": "2h ago", "recent": "Certification earned: Composition"},
    {"code": "ANCRLAB", "name": "ANCRLAB™", "purpose": "Recording & Production Lab", "status": "connected", "last_activity": "In Session", "recent": "Studio B — Amber Room takes"},
    {"code": "ANCRSync", "name": "ANCRSync™", "purpose": "Collaboration Workspaces", "status": "connected", "last_activity": "Yesterday", "recent": "3 new collaborators"},
    {"code": "INHEIRA", "name": "INHEIRA™", "purpose": "Songs, Splits & Releases", "status": "connected", "last_activity": "4d ago", "recent": "The Amber Room EP — draft locked"},
    {"code": "Vaulta", "name": "Vaulta™", "purpose": "Financial & IP Vault", "status": "connected", "last_activity": "1w ago", "recent": "Publishing split registered"},
    {"code": "Passport", "name": "Passport™", "purpose": "Global Mobility & Residencies", "status": "connected", "last_activity": "3w ago", "recent": "Marrakech Residency"},
    {"code": "ANCRLaunch", "name": "ANCRLaunch™", "purpose": "Careers & Placements", "status": "connected", "last_activity": "Today", "recent": "New opportunity match"},
    {"code": "ANCRVIEW", "name": "ANCRVIEW™", "purpose": "Portfolio Review", "status": "idle", "last_activity": "Never", "recent": "Awaiting first review"},
    {"code": "ANCRWAV", "name": "ANCRWAV™", "purpose": "Audio Discovery", "status": "idle", "last_activity": "—", "recent": "Not yet connected"},
]

DEMO_AI_INSIGHTS = [
    {"category": "Portfolio Gap", "title": "Add one visual work to your Passport", "reason": "Your Marrakech Sessions haven't been surfaced in Portfolio. Verified visual work strengthens creative reputation by ~7%.", "action": "Publish to Portfolio"},
    {"category": "Suggested Collaborator", "title": "Amara Bello — Composer, Berklee", "reason": "Overlap in cinematic scoring + shared availability window in April 2026.", "action": "Open ANCRSync"},
    {"category": "Mentor Match", "title": "Producer J. Sinclair", "reason": "3 mutual credits, aligned discipline (production/mixing). Accepting 2 mentees this quarter.", "action": "Request Mentorship"},
    {"category": "Missing Skill", "title": "Add 'Sync Licensing' to your skill graph", "reason": "Your recent Salt & Signal placement makes this credible. Verifiable via ANCRA.", "action": "Verify Skill"},
    {"category": "Career Opportunity", "title": "A&R Assistant — Def Jam (LA)", "reason": "Your ANCRLaunch readiness score qualifies. Deadline in 12 days.", "action": "View in ANCRLaunch"},
    {"category": "Scholarship", "title": "AIAH Continuation Grant — Cycle 4", "reason": "You are eligible based on Fellowship status and current GPA.", "action": "Apply"},
    {"category": "Industry Opportunity", "title": "Speaking slot — Africa Rising Summit 2026", "reason": "Your 2025 talk received a 4.8/5 rating. Speaker committee recommended you.", "action": "Confirm"},
]

DEMO_NETWORK = [
    {"name": "Nia Okafor", "role": "Songwriter", "institution": "Berklee", "country": "USA", "discipline": "Music", "skills": ["Topline", "Lyricism"], "grad_year": 2027, "available": True, "verified": True, "avatar": "https://images.unsplash.com/photo-1610716632318-acfc6a85d1ed?crop=entropy&cs=srgb&fm=jpg&q=80&w=400"},
    {"name": "Ravi Menon", "role": "Cinematographer", "institution": "USC Cinematic Arts", "country": "USA", "discipline": "Film", "skills": ["Cinematography", "Color"], "grad_year": 2026, "available": False, "verified": True, "avatar": "https://images.unsplash.com/photo-1759853900346-8d1ee0af7ca8?crop=entropy&cs=srgb&fm=jpg&q=80&w=400"},
    {"name": "Ines Delacroix", "role": "Creative Director", "institution": "École 42", "country": "France", "discipline": "Direction", "skills": ["Creative Direction", "Wardrobe"], "grad_year": 2025, "available": True, "verified": True, "avatar": "https://images.unsplash.com/photo-1572283046480-e990be92d301?crop=entropy&cs=srgb&fm=jpg&q=80&w=400"},
    {"name": "Amara Bello", "role": "Composer", "institution": "Berklee", "country": "USA", "discipline": "Music", "skills": ["Score", "Orchestration"], "grad_year": 2026, "available": True, "verified": True, "avatar": "https://images.unsplash.com/photo-1655931546417-18e16c015812?crop=entropy&cs=srgb&fm=jpg&q=80&w=400"},
    {"name": "Jules Amir", "role": "Editor", "institution": "Independent", "country": "Morocco", "discipline": "Writing", "skills": ["Editing", "Prose"], "grad_year": None, "available": True, "verified": False, "avatar": "https://images.unsplash.com/photo-1580529352988-5236c86b9439?crop=entropy&cs=srgb&fm=jpg&q=80&w=400"},
    {"name": "Karen Ramos", "role": "Faculty", "institution": "USC Thornton", "country": "USA", "discipline": "Music", "skills": ["Teaching", "Songwriting"], "grad_year": None, "available": False, "verified": True, "avatar": "https://images.unsplash.com/photo-1580529352977-df08012d92b0?crop=entropy&cs=srgb&fm=jpg&q=80&w=400"},
]


# ---------- Auth routes ----------
def slugify_handle(base: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "", (base or "").lower())
    return s[:20] or f"creator{secrets.randbelow(9999):04d}"


async def unique_handle(base: str) -> str:
    handle = slugify_handle(base)
    candidate = handle
    n = 0
    while await db.users.find_one({"handle": candidate}):
        n += 1
        candidate = f"{handle}{n}"
    return candidate


@auth_router.post("/register")
async def register(body: RegisterInput, response: Response):
    email = body.email.lower().strip()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    now = datetime.now(timezone.utc).isoformat()
    handle = await unique_handle(body.professional_name or email.split("@")[0])
    doc = {
        "email": email,
        "handle": handle,
        "password_hash": hash_password(body.password),
        "professional_name": body.professional_name,
        "role": body.role or "Creator",
        "institution": body.institution or "ANCR Academy",
        "discipline": body.discipline or "Multi-Disciplinary",
        "created_at": now,
        "public_profile": True,
        "identity": _demo_identity("", email, body.professional_name),
    }
    doc["identity"]["ancrid_number"] = f"ANCRID-2026-{secrets.randbelow(9000) + 1000:04d}"
    doc["identity"]["creator_passport_id"] = f"CPX-{secrets.randbelow(9000) + 1000:04d}-{email[:4].upper()}"
    result = await db.users.insert_one(doc)
    user_id = str(result.inserted_id)
    access = create_access_token(user_id, email)
    refresh = create_refresh_token(user_id)
    set_auth_cookies(response, access, refresh)
    fresh = await db.users.find_one({"_id": result.inserted_id})
    return scrub_user(fresh)


@auth_router.post("/login")
async def login(body: LoginInput, response: Response):
    email = body.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user_id = str(user["_id"])
    access = create_access_token(user_id, email)
    refresh = create_refresh_token(user_id)
    set_auth_cookies(response, access, refresh)
    return scrub_user(user)


@auth_router.post("/logout")
async def logout(response: Response, _user: dict = Depends(get_current_user)):
    clear_auth_cookies(response)
    return {"ok": True}


@auth_router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    return user


@auth_router.post("/refresh")
async def refresh(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh type")
        user_id = payload["sub"]
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        access = create_access_token(user_id, user["email"])
        response.set_cookie("access_token", access, httponly=True, secure=True, samesite="none",
                            max_age=ACCESS_TTL_MIN * 60, path="/")
        return {"ok": True}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


# ---------- ANCRID routes ----------
@ancrid_router.get("/overview")
async def overview(user: dict = Depends(get_current_user)):
    identity = user.get("identity", {})
    return {
        "user": {
            "professional_name": user.get("professional_name"),
            "email": user.get("email"),
            "role": user.get("role"),
            "institution": user.get("institution"),
            "discipline": user.get("discipline"),
        },
        "identity": identity,
        "ecosystem": DEMO_ECOSYSTEM,
        "recent_timeline": DEMO_TIMELINE[-4:],
        "ai_insights": DEMO_AI_INSIGHTS[:3],
    }


@ancrid_router.get("/identity")
async def identity(user: dict = Depends(get_current_user)):
    return {"user": {k: user.get(k) for k in ("professional_name", "email", "role", "institution", "discipline")},
            "identity": user.get("identity", {})}


@ancrid_router.patch("/identity")
async def update_identity(body: ProfileUpdate, user: dict = Depends(get_current_user)):
    updates = {f"identity.{k}": v for k, v in body.model_dump(exclude_unset=True).items() if v is not None}
    if updates:
        await db.users.update_one({"_id": ObjectId(user["id"])}, {"$set": updates})
    fresh = await db.users.find_one({"_id": ObjectId(user["id"])})
    return scrub_user(fresh)


@ancrid_router.get("/portfolio")
async def portfolio(_user: dict = Depends(get_current_user)):
    return {"items": DEMO_PORTFOLIO}


@ancrid_router.get("/timeline")
async def timeline(_user: dict = Depends(get_current_user)):
    return {"items": list(reversed(DEMO_TIMELINE))}


@ancrid_router.get("/passport")
async def passport(_user: dict = Depends(get_current_user)):
    return DEMO_PASSPORT


@ancrid_router.get("/collaborations")
async def collaborations(_user: dict = Depends(get_current_user)):
    return {"items": DEMO_COLLABORATIONS}


@ancrid_router.get("/skills")
async def skills(_user: dict = Depends(get_current_user)):
    return {"items": DEMO_SKILLS}


@ancrid_router.get("/education")
async def education(_user: dict = Depends(get_current_user)):
    return {"items": DEMO_EDUCATION}


@ancrid_router.get("/history")
async def history(_user: dict = Depends(get_current_user)):
    return {"items": DEMO_HISTORY}


@ancrid_router.get("/achievements")
async def achievements(_user: dict = Depends(get_current_user)):
    return {"items": DEMO_ACHIEVEMENTS}


@ancrid_router.get("/credentials")
async def credentials(_user: dict = Depends(get_current_user)):
    return {"items": DEMO_CREDENTIALS}


@ancrid_router.get("/ecosystem")
async def ecosystem(_user: dict = Depends(get_current_user)):
    return {"items": DEMO_ECOSYSTEM}


@ancrid_router.get("/ai/insights")
async def ai_insights(_user: dict = Depends(get_current_user)):
    return {"items": DEMO_AI_INSIGHTS}


# ---------- Creator Journey (chapters) ----------
DEMO_JOURNEY = {
    "creator": {"name": "Aaron Ellington", "handle": "aaron", "started": "2024-09-01"},
    "chapters": [
        {
            "code": "FOUNDATION",
            "title": "Foundation",
            "subtitle": "Student · Craft under supervision",
            "period": "2024 — 2025",
            "opening": "The identity begins the day a creator commits to the craft in a room with mentors, tools, and other creators.",
            "hero_image": "https://images.unsplash.com/photo-1580529352977-df08012d92b0?crop=entropy&cs=srgb&fm=jpg&q=80&w=1600",
            "tint": "#00e5ff",
            "milestones": [
                {"date": "2024-09-01", "title": "Accepted into CCDP", "app": "ANCRA", "kind": "milestone"},
                {"date": "2024-10-14", "title": "First recording session — Studio B", "app": "ANCRLAB", "kind": "session"},
                {"date": "2024-11-20", "title": "Cinematography credit — Salt & Signal", "app": "ANCRLAB", "kind": "credit"},
                {"date": "2024-12-02", "title": "First verified collaboration — Nia Okafor", "app": "ANCRSync", "kind": "collab"},
            ],
            "gains": ["Songwriting I & II", "Studio etiquette", "Score for picture"],
            "quote": "The first year isn't about being good yet — it's about becoming recordable.",
        },
        {
            "code": "EMERGING",
            "title": "Emerging Practice",
            "subtitle": "First releases · First recognition",
            "period": "2025",
            "opening": "The work leaves the classroom. A film premieres. A song ships. A stamp arrives from a country you had never seen.",
            "hero_image": "https://images.unsplash.com/photo-1572283046480-e990be92d301?crop=entropy&cs=srgb&fm=jpg&q=80&w=1600",
            "tint": "#8a2be2",
            "milestones": [
                {"date": "2025-02-18", "title": "Salt & Signal — public release", "app": "ANCRA", "kind": "release"},
                {"date": "2025-03-10", "title": "Rising Voices Scholarship awarded", "app": "ANCRA", "kind": "award"},
                {"date": "2025-05-06", "title": "Marrakech Residency — selected", "app": "Passport", "kind": "residency"},
                {"date": "2025-07-02", "title": "Field Notes Vol. II submitted", "app": "ANCRA", "kind": "publication"},
                {"date": "2025-08-22", "title": "Composition Certification earned", "app": "ANCRA", "kind": "certification"},
            ],
            "gains": ["Verified Creator badge", "First international project", "Certified Producer — Advanced"],
            "quote": "Emerging is the year the work stops belonging only to the studio.",
        },
        {
            "code": "PROFESSIONAL",
            "title": "Professional Career",
            "subtitle": "Owned catalogue · Signed collaborations",
            "period": "2025 — 2026",
            "opening": "Splits are signed. A publisher answers. The ecosystem starts writing on your behalf.",
            "hero_image": "https://images.unsplash.com/photo-1610716632318-acfc6a85d1ed?crop=entropy&cs=srgb&fm=jpg&q=80&w=1600",
            "tint": "#ff6d00",
            "milestones": [
                {"date": "2025-09-15", "title": "Writing camp — Paris", "app": "INHEIRA", "kind": "camp"},
                {"date": "2025-11-11", "title": "Publishing split registered", "app": "Vaulta", "kind": "financial"},
                {"date": "2025-11-24", "title": "Signed to INHEIRA Records", "app": "INHEIRA", "kind": "employment"},
                {"date": "2026-01-15", "title": "The Amber Room EP — writing camp locked", "app": "INHEIRA", "kind": "camp"},
                {"date": "2026-02-01", "title": "AIAH Fellowship — Cohort I", "app": "ANCRA", "kind": "fellowship"},
            ],
            "gains": ["Verified publishing", "First institutional signing", "AIAH Fellow"],
            "quote": "This is the chapter where an identity earns rights, not just credit.",
        },
        {
            "code": "MASTERY",
            "title": "Mastery & Legacy",
            "subtitle": "Mentor · Speaker · Faculty · Founder",
            "period": "2026 — future",
            "opening": "The record you write here writes for the next creator. The ANCRID begins to teach.",
            "hero_image": "https://images.unsplash.com/photo-1655931546417-18e16c015812?crop=entropy&cs=srgb&fm=jpg&q=80&w=1600",
            "tint": "#00e5ff",
            "milestones": [
                {"date": "2026-03-01", "title": "Africa Rising Summit — headline speaker (confirmed)", "app": "ANCRLaunch", "kind": "speaking", "future": True},
                {"date": "2026-05-10", "title": "The Amber Room EP — global release", "app": "INHEIRA", "kind": "release", "future": True},
                {"date": "2026-09-01", "title": "Adjunct Faculty — ANCR Academy", "app": "ANCRA", "kind": "teaching", "future": True},
                {"date": "2027-01-01", "title": "First mentee onboarded via ANCRSync", "app": "ANCRSync", "kind": "mentorship", "future": True},
            ],
            "gains": ["Mentorship record", "Institutional teaching credit", "Verified speaker"],
            "quote": "Mastery is when your ANCRID starts opening rooms for other people.",
        },
    ],
}


@ancrid_router.get("/journey")
async def journey(_user: dict = Depends(get_current_user)):
    return DEMO_JOURNEY


@ancrid_router.get("/network")
async def network(_user: dict = Depends(get_current_user), q: Optional[str] = None,
                  discipline: Optional[str] = None, country: Optional[str] = None):
    items = DEMO_NETWORK
    if q:
        ql = q.lower()
        items = [i for i in items if ql in i["name"].lower() or ql in i["role"].lower()
                 or ql in i["institution"].lower() or any(ql in s.lower() for s in i["skills"])]
    if discipline and discipline != "All":
        items = [i for i in items if i["discipline"] == discipline]
    if country and country != "All":
        items = [i for i in items if i["country"] == country]
    return {"items": items}


# ---------- Files / Uploads ----------
class UploadResponse(BaseModel):
    id: str
    url: str
    content_type: str
    size: int


@files_router.post("/upload")
async def upload_file(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    ct = (file.content_type or "").lower()
    if ct not in ALLOWED_MIME:
        raise HTTPException(status_code=400, detail="Only image uploads are supported (png, jpg, webp, gif)")
    data = await file.read()
    if len(data) > 8 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File exceeds 8MB limit")
    ext = MIME_EXT.get(ct, "bin")
    file_id = str(uuid.uuid4())
    path = f"{APP_NAME}/uploads/{user['id']}/{file_id}.{ext}"
    try:
        result = put_object(path, data, ct)
    except Exception as e:
        logger.exception("Upload failed")
        raise HTTPException(status_code=502, detail=f"Storage upload failed: {e}")

    record = {
        "file_id": file_id,
        "user_id": user["id"],
        "storage_path": result["path"],
        "content_type": ct,
        "size": result.get("size") or len(data),
        "original_filename": file.filename,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "is_deleted": False,
    }
    await db.files.insert_one(record)
    return {
        "id": file_id,
        "url": f"/api/files/{file_id}",
        "content_type": ct,
        "size": record["size"],
    }


@files_router.get("/{file_id}")
async def serve_file(file_id: str):
    rec = await db.files.find_one({"file_id": file_id, "is_deleted": False})
    if not rec:
        raise HTTPException(status_code=404, detail="File not found")
    try:
        data, _ct = get_object(rec["storage_path"])
    except Exception:
        raise HTTPException(status_code=502, detail="Storage read failed")
    return StreamingResponse(io.BytesIO(data), media_type=rec.get("content_type", "application/octet-stream"),
                             headers={"Cache-Control": "public, max-age=31536000, immutable"})


# ---------- Public Creator Pages ----------
def _public_projection(u: dict) -> dict:
    i = u.get("identity", {}) or {}
    return {
        "handle": u.get("handle"),
        "professional_name": u.get("professional_name"),
        "role": u.get("role"),
        "institution": u.get("institution"),
        "discipline": u.get("discipline"),
        "identity": {
            "ancrid_number": i.get("ancrid_number"),
            "creator_passport_id": i.get("creator_passport_id"),
            "verification_status": i.get("verification_status"),
            "verified_badges": i.get("verified_badges", []),
            "location": i.get("location"),
            "languages": i.get("languages", []),
            "biography": i.get("biography"),
            "mission": i.get("mission"),
            "headshot_url": i.get("headshot_url"),
            "banner_url": i.get("banner_url"),
            "website": i.get("website"),
            "social_links": i.get("social_links", {}),
            "member_since": i.get("member_since"),
            "portfolio_score": i.get("portfolio_score"),
            "creative_reputation_score": i.get("creative_reputation_score"),
            "professional_readiness_score": i.get("professional_readiness_score"),
        },
        # Demo record surfaces (in a real ecosystem these are read from ANCR modules)
        "portfolio": DEMO_PORTFOLIO,
        "timeline": list(reversed(DEMO_TIMELINE))[:6],
        "journey": DEMO_JOURNEY["chapters"],
        "achievements": DEMO_ACHIEVEMENTS,
        "skills": [s["name"] for s in DEMO_SKILLS],
        "credentials": DEMO_CREDENTIALS,
    }


@public_router.get("/creator/{handle}")
async def public_creator(handle: str):
    u = await db.users.find_one({"handle": handle.lower(), "public_profile": {"$ne": False}})
    if not u:
        raise HTTPException(status_code=404, detail="Creator not found")
    return _public_projection(u)


# ---------- Ecosystem SSO ----------
SSO_CLIENTS = {
    "ANCRA":      {"name": "ANCRA™",      "purpose": "Academy & Learning",           "scope": "identity portfolio education"},
    "ANCRLAB":    {"name": "ANCRLAB™",    "purpose": "Recording & Production Lab",   "scope": "identity portfolio skills"},
    "ANCRSync":   {"name": "ANCRSync™",   "purpose": "Collaboration Workspaces",     "scope": "identity network collaborations"},
    "INHEIRA":    {"name": "INHEIRA™",    "purpose": "Songs, Splits & Releases",     "scope": "identity portfolio"},
    "Vaulta":     {"name": "Vaulta™",     "purpose": "Financial & IP Vault",         "scope": "identity credentials"},
    "Passport":   {"name": "Passport™",   "purpose": "Global Mobility & Residencies","scope": "identity passport"},
    "ANCRLaunch": {"name": "ANCRLaunch™", "purpose": "Careers & Placements",         "scope": "identity portfolio history"},
    "ANCRVIEW":   {"name": "ANCRVIEW™",   "purpose": "Portfolio Review",             "scope": "identity portfolio"},
    "ANCRWAV":    {"name": "ANCRWAV™",    "purpose": "Audio Discovery",              "scope": "identity portfolio"},
}
SSO_TTL_MIN = 5


class SSOAuthorize(BaseModel):
    client_id: str


class SSOVerify(BaseModel):
    token: str


@sso_router.get("/clients")
async def sso_clients():
    return {"items": [{"client_id": k, **v} for k, v in SSO_CLIENTS.items()]}


@sso_router.post("/authorize")
async def sso_authorize(body: SSOAuthorize, user: dict = Depends(get_current_user)):
    if body.client_id not in SSO_CLIENTS:
        raise HTTPException(status_code=400, detail="Unknown client_id")
    client = SSO_CLIENTS[body.client_id]
    now = datetime.now(timezone.utc)
    identity = user.get("identity", {}) or {}
    payload = {
        "iss": "ancrid",
        "aud": body.client_id,
        "sub": user["id"],
        "iat": now,
        "exp": now + timedelta(minutes=SSO_TTL_MIN),
        "type": "sso",
        "scope": client["scope"],
        "ancrid": identity.get("ancrid_number"),
        "handle": user.get("handle"),
        "email": user.get("email"),
        "name": user.get("professional_name"),
        "role": user.get("role"),
        "institution": user.get("institution"),
        "verified": identity.get("verification_status") == "Verified",
    }
    token = jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)
    await db.sso_grants.insert_one({
        "grant_id": str(uuid.uuid4()),
        "user_id": user["id"],
        "client_id": body.client_id,
        "issued_at": now.isoformat(),
        "expires_at": (now + timedelta(minutes=SSO_TTL_MIN)).isoformat(),
    })
    return {
        "id_token": token,
        "token_type": "Bearer",
        "expires_in": SSO_TTL_MIN * 60,
        "client_id": body.client_id,
        "client_name": client["name"],
        "scope": client["scope"],
    }


@sso_router.post("/verify")
async def sso_verify(body: SSOVerify):
    try:
        # Partner apps validate the id_token. We accept any client audience here for the demo.
        claims = jwt.decode(body.token, get_jwt_secret(), algorithms=[JWT_ALGORITHM],
                            options={"verify_aud": False})
        if claims.get("type") != "sso":
            raise HTTPException(status_code=401, detail="Not an SSO token")
        return {"ok": True, "claims": claims}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="SSO token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid SSO token")


@sso_router.get("/grants")
async def sso_grants(user: dict = Depends(get_current_user)):
    docs = await db.sso_grants.find({"user_id": user["id"]}, {"_id": 0}).sort("issued_at", -1).to_list(50)
    return {"items": docs}


# ---------- Creator Mobility ----------
def _mask(s: Optional[str], keep: int = 4) -> str:
    if not s:
        return ""
    if len(s) <= keep:
        return "•" * len(s)
    return "•" * (len(s) - keep) + s[-keep:]


DEMO_MOBILITY = {
    "personal": {
        "preferred_name": "Aaron",
        "legal_name": "Aaron J. Ellington",
        "date_of_birth": "1998-04-12",
        "nationality": "United States",
        "citizenships": ["United States"],
        "passport_number_masked": "P•••••2245",
        "passport_expiration": "2031-06-14",
        "tsa_precheck": "TT1234567",
        "global_entry": "GE9876543",
        "known_traveler_number": "KTN0022110",
        "visas": [
            {"country": "United Kingdom", "type": "Tier 5 (Creative Worker)", "expires": "2027-03-01"},
            {"country": "Schengen Area", "type": "Business", "expires": "2028-09-12"},
        ],
    },
    "airlines": [
        {"airline": "United",        "number": "UA1234567", "status": "1K",       "alliance": "Star Alliance"},
        {"airline": "Delta",         "number": "DL9987654", "status": "Platinum", "alliance": "SkyTeam"},
        {"airline": "British Airways","number": "BA55221",  "status": "Silver",   "alliance": "oneworld"},
        {"airline": "Emirates",      "number": "EK330017",  "status": "Gold",     "alliance": "—"},
    ],
    "hotels": [
        {"program": "Marriott Bonvoy", "number": "MB55321",   "status": "Titanium"},
        {"program": "Hilton Honors",   "number": "HH8892211", "status": "Diamond"},
        {"program": "World of Hyatt",  "number": "WH557712",  "status": "Globalist"},
        {"program": "IHG One Rewards", "number": "IHG113244", "status": "Platinum"},
    ],
    "rentals": [
        {"company": "Hertz",     "number": "H55831",  "status": "President's Circle"},
        {"company": "National",  "number": "NL22984", "status": "Emerald Aisle"},
    ],
    "preferences": {
        "seat": "Window · Exit Row",
        "cabin": "Business",
        "home_airport": "LAX",
        "airlines": ["United", "Delta", "British Airways"],
        "hotel_brands": ["Marriott", "Hyatt"],
        "rental": "Hertz",
        "ground_transport": ["Uber Black", "Black Car"],
    },
    "dietary": {
        "restrictions": ["Gluten Free", "Nut Allergy"],
        "meal_preferences": "Prefers light meals on late flights",
        "favorites": ["Sushi", "Ramen", "Sourdough"],
        "avoid": ["Shellfish", "Peanuts"],
    },
    "medical": {
        "conditions": "—",
        "medications": "—",
        "mobility": "None",
        "accessibility": "None",
        "physician": "Dr. Karen Ho — Cedars-Sinai",
        "insurance_provider": "Blue Cross California",
        "insurance_number_masked": "BC••••••4402",
    },
    "emergency": [
        {"name": "Sasha Ellington", "relation": "Sibling",   "phone": "+1-310-555-0128", "email": "sasha@ancr.io"},
        {"name": "Dr. Karen Ho",    "relation": "Physician", "phone": "+1-310-555-9944", "email": "kho@cedars.io"},
    ],
    "team": {
        "manager":       {"name": "Nora Reyes",    "phone": "+1-310-555-0201", "email": "nora@brackenmgmt.co"},
        "tour_manager":  {"name": "Kwame Idris",   "phone": "+44-20-7555-0033","email": "kwame@ancrlaunch.io"},
        "attorney":      {"name": "Preston Vance", "phone": "+1-212-555-0102", "email": "pv@vance.legal"},
        "merch_manager": {"name": "Cass Vidal",    "phone": "+1-323-555-0071", "email": "cass@merch.co"},
        "production":    {"name": "Junior Park",   "phone": "+1-213-555-0114", "email": "jr@stage.io"},
        "foh":           {"name": "Marcus Silva",  "phone": "+1-323-555-0055"},
        "monitors":      {"name": "Emi Tanaka",    "phone": "+1-323-555-0066"},
        "band":  ["Ravi M — Guitar", "Solveig N — Drums", "Fen A — Keys"],
        "crew":  ["Backline: Diego P.", "Lighting: Tomás R.", "Wardrobe: Ana C."],
    },
    "booking": {
        "agent":       {"name": "Corinne Rowe · CAA", "phone": "+1-424-555-0192", "email": "crowe@caa.co"},
        "management":  "Bracken Management",
        "label":       "INHEIRA Records",
        "publisher":   "ANCR Publishing",
        "fee_range":   "private",
        "travel_buyout": "Preferred (all-in)",
    },
    "riders": {
        "hospitality": "1x greenroom, still water (room temp), fresh fruit, tea kettle, no dairy in room.",
        "technical":   "Yamaha CP88, Fender Rhodes preferred; 2x SM7B; 4x IEM belt packs; stereo DI x 2.",
        "stage_plot":  "—",
        "input_list":  "24-channel input list on file (advance from production).",
        "advance_notes": "Provide advance no later than 21 days before show.",
    },
    "documents": [
        {"id": "passport",  "name": "Passport (encrypted)", "type": "passport",  "private": True},
        {"id": "visa_uk",   "name": "Visa — UK Tier 5",     "type": "visa",      "private": False},
        {"id": "visa_sch",  "name": "Visa — Schengen",      "type": "visa",      "private": False},
        {"id": "license",   "name": "Driver's License",     "type": "license",   "private": True},
        {"id": "insurance", "name": "Travel Insurance",     "type": "insurance", "private": True},
        {"id": "letter",    "name": "Invitation Letter — Africa Rising", "type": "letter", "private": False},
    ],
    "global_history": {
        "countries": ["United States", "Nigeria", "Morocco", "France", "United Kingdom", "Japan", "South Africa"],
        "festivals": ["LA Shorts Fest 2025", "Afropunk 2025"],
        "tours": ["Amber Room — Live (UK, Sept 2025)"],
        "writing_camps": ["Paris 2025", "Lagos 2025"],
        "residencies": ["Marrakech 2025"],
        "conferences": ["Africa Rising Summit 2025"],
        "study_abroad": ["Tokyo — Sound Design Intensive 2024"],
        "collaborations": 14,
    },
    "calendar": [
        {"date": "2026-03-14", "event": "Africa Rising Summit — Headline",   "city": "Cape Town",   "kind": "speaking"},
        {"date": "2026-04-02", "event": "Amber Room — Studio A",              "city": "Los Angeles", "kind": "session"},
        {"date": "2026-05-10", "event": "EP Release Party",                   "city": "New York",    "kind": "performance"},
        {"date": "2026-06-01", "event": "Writing Camp",                       "city": "Paris",       "kind": "camp"},
        {"date": "2026-07-19", "event": "Amber Room — European Tour Opener",  "city": "London",      "kind": "performance"},
    ],
    "ai_travel_suggestions": [
        {"title": "Renew UK visa now",
         "reason": "Expires in 91 days. Africa Rising Summit follows a UK layover — a lapsed visa breaks the routing.",
         "action": "Start renewal"},
        {"title": "Best route: LAX → CPT via LHR",
         "reason": "Business award available on United for 88k miles + $412. Matches your Star Alliance 1K.",
         "action": "Hold pricing"},
        {"title": "Time-zone prep — Cape Town (UTC+2)",
         "reason": "Shift bedtime -1hr/day for 3 days before departure to protect voice at soundcheck.",
         "action": "Add to schedule"},
        {"title": "Packing list — Cape Town, mid-March",
         "reason": "Southern-hemisphere autumn: 12–22°C. Pack one performance blazer and layered mids.",
         "action": "Generate list"},
        {"title": "3 GF-friendly restaurants near your hotel",
         "reason": "Curated for your dietary profile within 1km of the Radisson Cape Town.",
         "action": "View list"},
        {"title": "Passport expiration alert",
         "reason": "Expires 2031-06-14. Some countries require 6-month validity. Currently safe.",
         "action": "Dismiss for 6 months"},
    ],
    "permissions": {
        "public":       ["country", "languages", "travel_availability"],
        "team":         ["manager", "agent", "tour_manager", "attorney"],
        "booking_only": ["passport_expiration", "hotel_preferences", "travel_preferences",
                         "dietary", "technical_rider", "hospitality_rider", "team_contacts"],
        "private":      ["medical", "emergency", "insurance", "government_ids", "financial"],
    },
}


class MobilityUpdate(BaseModel):
    section: str
    data: dict


@mobility_router.get("/profile")
async def mobility_profile(_user: dict = Depends(get_current_user)):
    return DEMO_MOBILITY


@mobility_router.patch("/profile")
async def mobility_profile_update(body: MobilityUpdate, user: dict = Depends(get_current_user)):
    allowed = {"personal", "preferences", "dietary", "medical",
               "emergency", "team", "booking", "riders", "permissions"}
    if body.section not in allowed:
        raise HTTPException(status_code=400, detail=f"Unknown section '{body.section}'")
    key = f"mobility.{body.section}"
    await db.users.update_one({"_id": ObjectId(user["id"])}, {"$set": {key: body.data}})
    return {"ok": True, "section": body.section}


@mobility_router.get("/travel-suggestions")
async def mobility_suggestions(_user: dict = Depends(get_current_user)):
    return {"items": DEMO_MOBILITY["ai_travel_suggestions"]}


class PacketRequest(BaseModel):
    include_sections: Optional[List[str]] = None    # e.g. ["biography","travel","riders","team"]
    permission_level: Optional[str] = "booking_only"  # booking_only | team | public
    include_emergency: bool = False


PACKET_TTL_DAYS = 30
_ALLOWED_LEVELS = {"public", "booking_only", "team"}


def _projection_for_level(level: str, include_emergency: bool) -> dict:
    """Filter DEMO_MOBILITY according to permission level."""
    m = DEMO_MOBILITY
    base = {
        "personal": {
            "preferred_name": m["personal"]["preferred_name"],
            "nationality": m["personal"]["nationality"],
            "passport_expiration": m["personal"]["passport_expiration"],
            "visas": m["personal"]["visas"],
        },
        "preferences": m["preferences"],
        "dietary": m["dietary"],
        "riders": m["riders"],
        "team": {k: v for k, v in m["team"].items() if k in ("manager", "tour_manager", "production", "foh", "monitors", "band", "crew")},
        "booking": {k: v for k, v in m["booking"].items() if k in ("agent", "management", "label", "publisher", "travel_buyout")},
        "airlines": m["airlines"],
        "hotels": m["hotels"],
        "rentals": m["rentals"],
    }
    if include_emergency:
        base["emergency"] = m["emergency"]
    if level == "public":
        base = {"preferences": m["preferences"], "dietary": {"restrictions": m["dietary"]["restrictions"]}}
    return base


@mobility_router.post("/booking-packet")
async def create_booking_packet(body: PacketRequest, user: dict = Depends(get_current_user)):
    level = body.permission_level or "booking_only"
    if level not in _ALLOWED_LEVELS:
        raise HTTPException(status_code=400, detail=f"permission_level must be one of {sorted(_ALLOWED_LEVELS)}")
    token = secrets.token_urlsafe(12)
    now = datetime.now(timezone.utc)
    identity = user.get("identity", {}) or {}
    packet_body = {
        "creator": {
            "name": user.get("professional_name"),
            "handle": user.get("handle"),
            "role": user.get("role"),
            "institution": user.get("institution"),
            "ancrid_number": identity.get("ancrid_number"),
            "creator_passport_id": identity.get("creator_passport_id"),
            "headshot_url": identity.get("headshot_url"),
            "banner_url": identity.get("banner_url"),
            "biography": identity.get("biography"),
            "mission": identity.get("mission"),
            "website": identity.get("website"),
            "social_links": identity.get("social_links", {}),
            "location": identity.get("location"),
            "verification_status": identity.get("verification_status"),
        },
        "portfolio": DEMO_PORTFOLIO,
        "achievements": DEMO_ACHIEVEMENTS[:4],
        "mobility": _projection_for_level(level, body.include_emergency),
        "permission_level": level,
        "issued_at": now.isoformat(),
        "expires_at": (now + timedelta(days=PACKET_TTL_DAYS)).isoformat(),
    }
    await db.booking_packets.insert_one({
        "token": token,
        "user_id": user["id"],
        "issued_at": now.isoformat(),
        "expires_at": (now + timedelta(days=PACKET_TTL_DAYS)).isoformat(),
        "permission_level": level,
        "include_emergency": bool(body.include_emergency),
        "payload": packet_body,
    })
    return {
        "token": token,
        "url": f"/packet/{token}",
        "permission_level": level,
        "expires_at": (now + timedelta(days=PACKET_TTL_DAYS)).isoformat(),
    }


@mobility_router.get("/booking-packets")
async def list_packets(user: dict = Depends(get_current_user)):
    docs = await db.booking_packets.find(
        {"user_id": user["id"]}, {"_id": 0, "payload": 0}
    ).sort("issued_at", -1).to_list(50)
    return {"items": docs}


@mobility_router.delete("/booking-packet/{token}")
async def revoke_packet(token: str, user: dict = Depends(get_current_user)):
    r = await db.booking_packets.delete_one({"token": token, "user_id": user["id"]})
    if r.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Packet not found")
    return {"ok": True}


@public_router.get("/packet/{token}")
async def public_packet(token: str):
    rec = await db.booking_packets.find_one({"token": token}, {"_id": 0})
    if not rec:
        raise HTTPException(status_code=404, detail="Packet not found or revoked")
    # Check expiry
    try:
        expires = datetime.fromisoformat(rec["expires_at"])
        if datetime.now(timezone.utc) > expires:
            raise HTTPException(status_code=410, detail="Packet expired")
    except (KeyError, ValueError):
        pass
    return rec["payload"]


# ---------- Public ----------
@api_router.get("/")
async def root():
    return {"service": "ANCRID", "tagline": "Your Creative Identity. Everywhere.", "status": "ok"}


# ---------- Wire ----------
app.include_router(api_router)
app.include_router(auth_router)
app.include_router(ancrid_router)
app.include_router(files_router)
app.include_router(public_router)
app.include_router(sso_router)
app.include_router(mobility_router)

_allowed_origin = os.environ.get("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[_allowed_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Seed ----------
async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        handle = await unique_handle("aaron")
        doc = {
            "email": admin_email,
            "handle": handle,
            "password_hash": hash_password(admin_password),
            "professional_name": "Aaron Ellington",
            "role": "Founder · Songwriter · Producer",
            "institution": "ANCR Academy — CCDP",
            "discipline": "Music · Film · Creative Direction",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "public_profile": True,
            "identity": _demo_identity("", admin_email, "Aaron Ellington"),
        }
        await db.users.insert_one(doc)
        logger.info(f"Seeded admin user: {admin_email} (@{handle})")
    else:
        updates = {}
        if not verify_password(admin_password, existing["password_hash"]):
            updates["password_hash"] = hash_password(admin_password)
        if not existing.get("handle"):
            updates["handle"] = await unique_handle("aaron")
        if existing.get("public_profile") is None:
            updates["public_profile"] = True
        if updates:
            await db.users.update_one({"email": admin_email}, {"$set": updates})
            logger.info(f"Admin refreshed: {admin_email} ({list(updates.keys())})")


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("handle", unique=True, sparse=True)
    await db.files.create_index("file_id", unique=True)
    init_storage()
    await seed_admin()


@app.on_event("shutdown")
async def on_shutdown():
    mongo_client.close()
