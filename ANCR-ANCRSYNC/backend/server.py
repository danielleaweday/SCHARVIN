from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Any, Annotated
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']
JWT_SECRET = os.environ.get('JWT_SECRET', 'dev-secret')
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="ANCRSync API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("ancrsync")


# ---------------- Utilities ----------------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_id() -> str:
    return str(uuid.uuid4())


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False


def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(days=30),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


async def get_current_user(creds: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> dict:
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("sub")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def log_passport(user_id: str, kind: str, title: str, detail: str, meta: Optional[dict] = None):
    """Auto-record activity in Creative Passport."""
    doc = {
        "id": new_id(),
        "user_id": user_id,
        "kind": kind,  # collaboration | mentorship | project | studio | session | leadership | achievement
        "title": title,
        "detail": detail,
        "meta": meta or {},
        "verified": True,
        "created_at": now_iso(),
    }
    await db.passport_entries.insert_one(doc)


# ---------------- Models ----------------
class SignupIn(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "Creator"  # Student, Faculty, Mentor, Artist, Songwriter, Producer, etc.
    discipline: str = "Multidisciplinary"
    country: str = "Global"
    city: str = ""


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class WorkspaceIn(BaseModel):
    name: str
    description: str = ""
    discipline: str = "General"


class TaskIn(BaseModel):
    title: str
    assignee: str = ""
    due: str = ""
    status: str = "todo"


class CommentIn(BaseModel):
    body: str


class StudioIn(BaseModel):
    name: str
    kind: str  # Songwriting, Recording, Production, Film, Animation, Photography, Podcast, Brand, Creative Strategy, Innovation
    description: str = ""


class SessionIn(BaseModel):
    title: str
    workspace_id: Optional[str] = None
    studio_id: Optional[str] = None
    start_time: str
    duration_minutes: int = 60
    invitees: List[str] = []


class AIRequest(BaseModel):
    prompt: str
    context: str = "general"  # summary | recommend | skill_match | action_items
    session_id: Optional[str] = None


class FeedbackIn(BaseModel):
    workspace_id: str
    target: str  # e.g. asset name
    body: str
    kind: str = "comment"  # comment | approval | change_request | voice


# ---------------- Auth ----------------
@api_router.post("/auth/signup")
async def signup(data: SignupIn):
    existing = await db.users.find_one({"email": data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = new_id()
    # Note: resolve_geo is defined later; use inline fallback
    def _geo(city, country):
        c = (city or "").strip().lower()
        k = (country or "").strip().lower()
        # Return None here so we look up after resolve_geo is available at request time
        return c, k
    user_doc = {
        "id": user_id,
        "name": data.name,
        "email": data.email.lower(),
        "password_hash": hash_password(data.password),
        "role": data.role,
        "discipline": data.discipline,
        "country": data.country,
        "city": data.city,
        "avatar_color": ["#007AFF", "#F59E0B", "#10B981", "#EC4899", "#8B5CF6", "#EF4444"][len(data.name) % 6],
        "created_at": now_iso(),
    }
    # Resolve geo using module-level GEO_LOOKUP (defined in phase 3 block, always loaded)
    try:
        g = resolve_geo(data.city, data.country)
        user_doc.update({"lat": g["lat"], "lng": g["lng"], "flag": g["flag"]})
    except NameError:
        pass
    await db.users.insert_one(user_doc)
    await log_passport(user_id, "achievement", "Joined ANCRSync™", f"Onboarded as {data.role} in {data.discipline}")
    token = create_token(user_id)
    user_doc.pop("password_hash", None)
    user_doc.pop("_id", None)
    return {"token": token, "user": user_doc}


@api_router.post("/auth/login")
async def login(data: LoginIn):
    user = await db.users.find_one({"email": data.email.lower()})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(user["id"])
    user.pop("password_hash", None)
    user.pop("_id", None)
    return {"token": token, "user": user}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


# ---------------- Workspaces ----------------
@api_router.get("/workspaces")
async def list_workspaces(user: dict = Depends(get_current_user)):
    ws = await db.workspaces.find({"members": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return ws


@api_router.post("/workspaces")
async def create_workspace(data: WorkspaceIn, user: dict = Depends(get_current_user)):
    ws_id = new_id()
    doc = {
        "id": ws_id,
        "name": data.name,
        "description": data.description,
        "discipline": data.discipline,
        "owner_id": user["id"],
        "members": [user["id"]],
        "tasks": [],
        "milestones": [
            {"id": new_id(), "title": "Kickoff", "date": now_iso(), "done": True},
            {"id": new_id(), "title": "First Draft", "date": "", "done": False},
            {"id": new_id(), "title": "Review", "date": "", "done": False},
            {"id": new_id(), "title": "Delivery", "date": "", "done": False},
        ],
        "assets": [],
        "comments": [],
        "created_at": now_iso(),
    }
    await db.workspaces.insert_one(doc)
    await log_passport(user["id"], "project", f"Created workspace {data.name}", f"Discipline: {data.discipline}", {"workspace_id": ws_id})
    doc.pop("_id", None)
    return doc


@api_router.get("/workspaces/{ws_id}")
async def get_workspace(ws_id: str, user: dict = Depends(get_current_user)):
    ws = await db.workspaces.find_one({"id": ws_id}, {"_id": 0})
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return ws


@api_router.post("/workspaces/{ws_id}/tasks")
async def add_task(ws_id: str, data: TaskIn, user: dict = Depends(get_current_user)):
    task = {"id": new_id(), "title": data.title, "assignee": data.assignee or user["name"], "due": data.due, "status": data.status, "created_at": now_iso()}
    r = await db.workspaces.update_one({"id": ws_id}, {"$push": {"tasks": task}})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return task


@api_router.post("/workspaces/{ws_id}/tasks/{task_id}/toggle")
async def toggle_task(ws_id: str, task_id: str, user: dict = Depends(get_current_user)):
    ws = await db.workspaces.find_one({"id": ws_id})
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    new_tasks = []
    for t in ws.get("tasks", []):
        if t["id"] == task_id:
            t["status"] = "done" if t["status"] != "done" else "todo"
        new_tasks.append(t)
    await db.workspaces.update_one({"id": ws_id}, {"$set": {"tasks": new_tasks}})
    return {"ok": True}


@api_router.post("/workspaces/{ws_id}/comments")
async def add_comment(ws_id: str, data: CommentIn, user: dict = Depends(get_current_user)):
    c = {"id": new_id(), "body": data.body, "author_id": user["id"], "author_name": user["name"], "avatar_color": user.get("avatar_color", "#007AFF"), "created_at": now_iso()}
    r = await db.workspaces.update_one({"id": ws_id}, {"$push": {"comments": c}})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return c


# ---------------- Studios ----------------
DEFAULT_STUDIOS = [
    {"kind": "Songwriting", "name": "The Lyric Room", "desc": "Where hooks, verses, and choruses are born.", "activity": "Live"},
    {"kind": "Recording", "name": "Studio A · Vocal Booth", "desc": "Capture vocals and instruments in high fidelity.", "activity": "Idle"},
    {"kind": "Production", "name": "Beat Lab", "desc": "Arrange, layer, mix.", "activity": "Live"},
    {"kind": "Film", "name": "Frame One", "desc": "Screenplay, storyboard, and edits.", "activity": "Scheduled"},
    {"kind": "Animation", "name": "Keyframe", "desc": "Character rigs and motion.", "activity": "Live"},
    {"kind": "Photography", "name": "Aperture", "desc": "Editorial and commercial shoots.", "activity": "Idle"},
    {"kind": "Podcast", "name": "Longform", "desc": "Interviews and narrative shows.", "activity": "Scheduled"},
    {"kind": "Brand", "name": "Identity Lab", "desc": "Logos, systems, and voice.", "activity": "Live"},
    {"kind": "Creative Strategy", "name": "North Star", "desc": "Positioning, decks, and briefs.", "activity": "Idle"},
    {"kind": "Innovation", "name": "R&D Room", "desc": "Prototypes and experiments.", "activity": "Live"},
]


@api_router.get("/studios")
async def list_studios(user: dict = Depends(get_current_user)):
    studios = await db.studios.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    if not studios:
        # seed defaults
        docs = []
        for s in DEFAULT_STUDIOS:
            docs.append({
                "id": new_id(),
                "name": s["name"],
                "kind": s["kind"],
                "description": s["desc"],
                "activity": s["activity"],
                "member_count": 3 + (len(s["name"]) % 12),
                "owner_id": "system",
                "created_at": now_iso(),
            })
        await db.studios.insert_many(docs)
        studios = await db.studios.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return studios


@api_router.post("/studios")
async def create_studio(data: StudioIn, user: dict = Depends(get_current_user)):
    doc = {
        "id": new_id(),
        "name": data.name,
        "kind": data.kind,
        "description": data.description,
        "activity": "Live",
        "member_count": 1,
        "owner_id": user["id"],
        "created_at": now_iso(),
    }
    await db.studios.insert_one(doc)
    await log_passport(user["id"], "studio", f"Launched {data.name}", f"{data.kind} studio", {"studio_id": doc["id"]})
    doc.pop("_id", None)
    return doc


@api_router.post("/studios/{studio_id}/join")
async def join_studio(studio_id: str, user: dict = Depends(get_current_user)):
    studio = await db.studios.find_one({"id": studio_id})
    if not studio:
        raise HTTPException(status_code=404, detail="Studio not found")
    await db.studios.update_one({"id": studio_id}, {"$inc": {"member_count": 1}})
    await log_passport(user["id"], "collaboration", f"Joined {studio['name']}", f"{studio['kind']} studio")
    return {"ok": True}


# ---------------- Sessions ----------------
@api_router.get("/sessions")
async def list_sessions(user: dict = Depends(get_current_user)):
    items = await db.sessions.find({}, {"_id": 0}).sort("start_time", 1).to_list(200)
    return items


@api_router.post("/sessions")
async def create_session(data: SessionIn, user: dict = Depends(get_current_user)):
    doc = {
        "id": new_id(),
        "title": data.title,
        "workspace_id": data.workspace_id,
        "studio_id": data.studio_id,
        "start_time": data.start_time,
        "duration_minutes": data.duration_minutes,
        "invitees": data.invitees,
        "host_id": user["id"],
        "host_name": user["name"],
        "status": "scheduled",
        "recording_summary": "",
        "action_items": [],
        "created_at": now_iso(),
    }
    await db.sessions.insert_one(doc)
    await log_passport(user["id"], "session", f"Scheduled session · {data.title}", "Shared Session", {"session_id": doc["id"]})
    doc.pop("_id", None)
    return doc


@api_router.get("/sessions/{sid}")
async def get_session(sid: str, user: dict = Depends(get_current_user)):
    s = await db.sessions.find_one({"id": sid}, {"_id": 0})
    if not s:
        raise HTTPException(status_code=404, detail="Session not found")
    return s


@api_router.post("/sessions/{sid}/join")
async def join_session(sid: str, user: dict = Depends(get_current_user)):
    s = await db.sessions.find_one({"id": sid})
    if not s:
        raise HTTPException(status_code=404, detail="Session not found")
    await log_passport(user["id"], "collaboration", f"Joined session · {s['title']}", "Shared Session participation")
    return {"ok": True}


# ---------------- Feedback ----------------
@api_router.post("/feedback")
async def add_feedback(data: FeedbackIn, user: dict = Depends(get_current_user)):
    doc = {
        "id": new_id(),
        "workspace_id": data.workspace_id,
        "target": data.target,
        "body": data.body,
        "kind": data.kind,
        "author_id": user["id"],
        "author_name": user["name"],
        "created_at": now_iso(),
    }
    await db.feedback.insert_one(doc)
    return {**doc, "_id": None}


@api_router.get("/feedback/{workspace_id}")
async def list_feedback(workspace_id: str, user: dict = Depends(get_current_user)):
    items = await db.feedback.find({"workspace_id": workspace_id}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items


# ---------------- Creative Passport ----------------
@api_router.get("/passport")
async def my_passport(user: dict = Depends(get_current_user)):
    entries = await db.passport_entries.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(500)
    stats = {
        "collaborations": sum(1 for e in entries if e["kind"] == "collaboration"),
        "projects": sum(1 for e in entries if e["kind"] == "project"),
        "studios": sum(1 for e in entries if e["kind"] == "studio"),
        "sessions": sum(1 for e in entries if e["kind"] == "session"),
        "mentorship": sum(1 for e in entries if e["kind"] == "mentorship"),
        "achievements": sum(1 for e in entries if e["kind"] == "achievement"),
        "total": len(entries),
    }
    return {"user": user, "entries": entries, "stats": stats}


# ---------------- Global Collaboration ----------------
SAMPLE_CREATORS = [
    {"name": "Ayaan Rahman", "role": "Producer", "city": "Mumbai", "country": "IN", "lat": 19.076, "lng": 72.877, "discipline": "Music"},
    {"name": "Nia Okonkwo", "role": "Songwriter", "city": "Lagos", "country": "NG", "lat": 6.524, "lng": 3.379, "discipline": "Music"},
    {"name": "Lucas Ferreira", "role": "Filmmaker", "city": "São Paulo", "country": "BR", "lat": -23.55, "lng": -46.63, "discipline": "Film"},
    {"name": "Emma Larsen", "role": "Designer", "city": "Copenhagen", "country": "DK", "lat": 55.68, "lng": 12.57, "discipline": "Design"},
    {"name": "Kenji Watanabe", "role": "Animator", "city": "Tokyo", "country": "JP", "lat": 35.68, "lng": 139.69, "discipline": "Animation"},
    {"name": "Sofia Ramirez", "role": "Photographer", "city": "Mexico City", "country": "MX", "lat": 19.43, "lng": -99.13, "discipline": "Photography"},
    {"name": "Malik Johnson", "role": "Creative Director", "city": "New York", "country": "US", "lat": 40.71, "lng": -74.00, "discipline": "Brand"},
    {"name": "Chloé Martin", "role": "Producer", "city": "Paris", "country": "FR", "lat": 48.86, "lng": 2.35, "discipline": "Music"},
    {"name": "Zara Khan", "role": "Engineer", "city": "Karachi", "country": "PK", "lat": 24.86, "lng": 67.00, "discipline": "Audio"},
    {"name": "Alessandro Rossi", "role": "Innovation Lead", "city": "Milan", "country": "IT", "lat": 45.46, "lng": 9.19, "discipline": "Innovation"},
    {"name": "Ji-Woo Park", "role": "Songwriter", "city": "Seoul", "country": "KR", "lat": 37.57, "lng": 126.98, "discipline": "Music"},
    {"name": "Amelia Brooks", "role": "Faculty", "city": "London", "country": "UK", "lat": 51.51, "lng": -0.12, "discipline": "Education"},
]


@api_router.get("/global/creators")
async def global_creators(user: dict = Depends(get_current_user)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(500)
    # attach synthetic coords for real users by hashing country to a coord if unknown
    return {"sample": SAMPLE_CREATORS, "users": users}


# ---------------- AI Collaboration Intelligence ----------------
@api_router.post("/ai/chat")
async def ai_chat(data: AIRequest, user: dict = Depends(get_current_user)):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="LLM key not configured")
    system_prompts = {
        "summary": "You are ANCRSync AI. Summarize creative sessions crisply in 4-6 bullets. Focus on decisions, blockers, and next steps.",
        "action_items": "You are ANCRSync AI. Extract action items as a numbered list with clear owners and due dates when mentioned. Be concise.",
        "recommend": "You are ANCRSync AI, a creative collaboration coach. Suggest 3-5 tailored, concrete next actions for the creator. Use warm, sharp language.",
        "skill_match": "You are ANCRSync AI. Given a project brief, propose 3 collaborator archetypes with role, discipline, and why they fit. Format as short bullets.",
        "general": "You are ANCRSync AI, the intelligence layer of a Creative Collaboration Operating System. Be crisp, insightful, and helpful.",
    }
    system_message = system_prompts.get(data.context, system_prompts["general"])
    session_id = data.session_id or f"user-{user['id']}"
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=system_message,
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        response = await chat.send_message(UserMessage(text=data.prompt))
        return {"response": response, "context": data.context}
    except Exception as e:
        logger.exception("AI chat failed")
        raise HTTPException(status_code=500, detail=f"AI error: {e}")


@api_router.post("/sessions/{sid}/ai-summary")
async def ai_summarize_session(sid: str, user: dict = Depends(get_current_user)):
    s = await db.sessions.find_one({"id": sid})
    if not s:
        raise HTTPException(status_code=404, detail="Session not found")
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="LLM key not configured")
    prompt = f"Session title: {s['title']}. Duration: {s['duration_minutes']} min. Host: {s['host_name']}. Produce a realistic session summary with 4 bullets covering creative decisions, next steps, and one blocker."
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"session-{sid}",
            system_message="You are ANCRSync AI. Produce concise, professional session summaries in bullet points.",
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        response = await chat.send_message(UserMessage(text=prompt))
        await db.sessions.update_one({"id": sid}, {"$set": {"recording_summary": response, "status": "completed"}})
        return {"summary": response}
    except Exception as e:
        logger.exception("AI summary failed")
        raise HTTPException(status_code=500, detail=f"AI error: {e}")


# ---------------- Dashboard ----------------
@api_router.get("/dashboard")
async def dashboard(user: dict = Depends(get_current_user)):
    workspaces = await db.workspaces.find({"members": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(20)
    sessions = await db.sessions.find({"host_id": user["id"]}, {"_id": 0}).sort("start_time", 1).to_list(10)
    studios = await db.studios.find({}, {"_id": 0}).limit(4).to_list(4)
    passport_count = await db.passport_entries.count_documents({"user_id": user["id"]})
    recent = await db.passport_entries.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(6)
    return {
        "workspaces_count": len(workspaces),
        "sessions_count": len(sessions),
        "workspaces": workspaces[:4],
        "sessions": sessions[:4],
        "studios": studios,
        "passport_count": passport_count,
        "recent_activity": recent,
    }


@api_router.get("/")
async def root():
    return {"service": "ANCRSync", "status": "ok"}


# ============================================================
# PHASE 2 — Global Creative Collaboration Network
# ============================================================

# ---------------- Shared Creation™ ----------------
class CreationSaveIn(BaseModel):
    kind: str  # lyrics | arrangement | chords | whiteboard
    data: Any


DEFAULT_ARRANGEMENT = [
    {"id": new_id(), "section": "Intro", "bars": 4, "color": "#007AFF"},
    {"id": new_id(), "section": "Verse 1", "bars": 16, "color": "#10B981"},
    {"id": new_id(), "section": "Pre-Chorus", "bars": 8, "color": "#F59E0B"},
    {"id": new_id(), "section": "Chorus", "bars": 16, "color": "#EC4899"},
    {"id": new_id(), "section": "Verse 2", "bars": 16, "color": "#10B981"},
    {"id": new_id(), "section": "Chorus", "bars": 16, "color": "#EC4899"},
    {"id": new_id(), "section": "Bridge", "bars": 8, "color": "#8B5CF6"},
    {"id": new_id(), "section": "Outro", "bars": 8, "color": "#71717A"},
]


@api_router.get("/creation/{ws_id}")
async def get_creation(ws_id: str, user: dict = Depends(get_current_user)):
    doc = await db.creation.find_one({"workspace_id": ws_id}, {"_id": 0})
    if not doc:
        doc = {
            "workspace_id": ws_id,
            "lyrics": "",
            "arrangement": DEFAULT_ARRANGEMENT,
            "chords": "| Am | F | C | G |\n| Am | F | C | G |",
            "whiteboard": [
                {"id": new_id(), "kind": "note", "body": "Reference: Bon Iver — Holocene"},
                {"id": new_id(), "kind": "idea", "body": "Try half-time drop before final chorus"},
            ],
            "updated_at": now_iso(),
        }
        await db.creation.insert_one(doc)
        doc.pop("_id", None)
    return doc


@api_router.post("/creation/{ws_id}")
async def save_creation(ws_id: str, data: CreationSaveIn, user: dict = Depends(get_current_user)):
    if data.kind not in {"lyrics", "arrangement", "chords", "whiteboard"}:
        raise HTTPException(status_code=400, detail="Invalid kind")
    await db.creation.update_one(
        {"workspace_id": ws_id},
        {"$set": {data.kind: data.data, "updated_at": now_iso()}, "$setOnInsert": {"workspace_id": ws_id}},
        upsert=True,
    )
    return {"ok": True}


# ---------------- Shared Assets™ ----------------
class AssetIn(BaseModel):
    workspace_id: str
    name: str
    kind: str  # audio | stem | image | video | lyrics | pdf | project
    size: str = "—"
    version: str = "v1"


@api_router.get("/assets/{ws_id}")
async def list_assets(ws_id: str, user: dict = Depends(get_current_user)):
    items = await db.assets.find({"workspace_id": ws_id}, {"_id": 0}).sort("created_at", -1).to_list(200)
    if not items:
        seed = [
            {"name": "Aurora_hook_v3.wav", "kind": "audio", "size": "12.4 MB", "version": "v3"},
            {"name": "Aurora_lyrics.docx", "kind": "lyrics", "size": "24 KB", "version": "v2"},
            {"name": "Aurora_stems.zip", "kind": "stem", "size": "412 MB", "version": "v1"},
            {"name": "Cover_reference.jpg", "kind": "image", "size": "3.1 MB", "version": "v1"},
        ]
        for s in seed:
            await db.assets.insert_one({
                "id": new_id(),
                "workspace_id": ws_id,
                "uploaded_by": user["name"],
                "created_at": now_iso(),
                **s,
            })
        items = await db.assets.find({"workspace_id": ws_id}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return items


@api_router.post("/assets")
async def add_asset(data: AssetIn, user: dict = Depends(get_current_user)):
    doc = {
        "id": new_id(),
        "workspace_id": data.workspace_id,
        "name": data.name,
        "kind": data.kind,
        "size": data.size,
        "version": data.version,
        "uploaded_by": user["name"],
        "created_at": now_iso(),
    }
    await db.assets.insert_one(doc)
    doc.pop("_id", None)
    return doc


# ---------------- Communication Layer™ ----------------
class ChannelIn(BaseModel):
    name: str
    kind: str = "group"  # dm | group | studio | announcement
    members: List[str] = []


class MessageIn(BaseModel):
    channel_id: str
    body: str
    reply_to: Optional[str] = None


DEFAULT_CHANNELS = [
    {"name": "# announcements", "kind": "announcement", "topic": "Platform updates"},
    {"name": "# songwriters", "kind": "group", "topic": "Songwriting community"},
    {"name": "# producers", "kind": "group", "topic": "Producers talk shop"},
    {"name": "# aurora-ep", "kind": "group", "topic": "Aurora EP project chat"},
]


@api_router.get("/channels")
async def list_channels(user: dict = Depends(get_current_user)):
    chans = await db.channels.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    if not chans:
        for c in DEFAULT_CHANNELS:
            await db.channels.insert_one({
                "id": new_id(),
                "name": c["name"],
                "kind": c["kind"],
                "topic": c["topic"],
                "members": [],
                "created_at": now_iso(),
            })
        chans = await db.channels.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return chans


@api_router.post("/channels")
async def create_channel(data: ChannelIn, user: dict = Depends(get_current_user)):
    doc = {
        "id": new_id(),
        "name": data.name,
        "kind": data.kind,
        "topic": "",
        "members": data.members + [user["id"]],
        "created_at": now_iso(),
    }
    await db.channels.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.get("/messages/{channel_id}")
async def list_messages(channel_id: str, user: dict = Depends(get_current_user)):
    msgs = await db.messages.find({"channel_id": channel_id}, {"_id": 0}).sort("created_at", 1).to_list(500)
    return msgs


@api_router.post("/messages")
async def send_message(data: MessageIn, user: dict = Depends(get_current_user)):
    doc = {
        "id": new_id(),
        "channel_id": data.channel_id,
        "body": data.body,
        "reply_to": data.reply_to,
        "author_id": user["id"],
        "author_name": user["name"],
        "avatar_color": user.get("avatar_color", "#007AFF"),
        "reactions": {},
        "created_at": now_iso(),
    }
    await db.messages.insert_one(doc)
    doc.pop("_id", None)
    return doc


# ---------------- Mentorship™ ----------------
DEFAULT_MENTORS = [
    {"name": "Danielle Cho", "role": "Songwriter · Grammy Nom.", "discipline": "Music", "focus": "Topline & Melody", "rate": "Free · Faculty", "next": "Fri 3:00 PM"},
    {"name": "Aaron Miles", "role": "Producer · Multi-Platinum", "discipline": "Music", "focus": "Production & Mix", "rate": "$120 / hr", "next": "Tue 11:00 AM"},
    {"name": "Jimmie Lawson", "role": "A&R · Universal", "discipline": "Industry", "focus": "Career & Pitch", "rate": "By request", "next": "Wed 9:00 AM"},
    {"name": "Ashley Bennett", "role": "Faculty · Berklee", "discipline": "Education", "focus": "Portfolio Review", "rate": "Free · Office Hours", "next": "Thu 2:00 PM"},
    {"name": "Cam Rivera", "role": "Engineer · Abbey Road", "discipline": "Music", "focus": "Recording & Mix", "rate": "$95 / hr", "next": "Mon 4:00 PM"},
    {"name": "Sofia Lin", "role": "Creative Director", "discipline": "Brand", "focus": "Positioning & Story", "rate": "$150 / hr", "next": "Fri 10:00 AM"},
]


@api_router.get("/mentors")
async def list_mentors(user: dict = Depends(get_current_user)):
    docs = await db.mentors.find({}, {"_id": 0}).to_list(200)
    if not docs:
        for m in DEFAULT_MENTORS:
            await db.mentors.insert_one({"id": new_id(), "created_at": now_iso(), **m})
        docs = await db.mentors.find({}, {"_id": 0}).to_list(200)
    return docs


class MentorshipRequestIn(BaseModel):
    mentor_id: str
    kind: str  # office_hours | portfolio_review | coaching | masterclass
    note: str = ""


@api_router.post("/mentors/request")
async def request_mentor(data: MentorshipRequestIn, user: dict = Depends(get_current_user)):
    m = await db.mentors.find_one({"id": data.mentor_id})
    if not m:
        raise HTTPException(status_code=404, detail="Mentor not found")
    doc = {
        "id": new_id(),
        "mentor_id": data.mentor_id,
        "mentor_name": m["name"],
        "requester_id": user["id"],
        "requester_name": user["name"],
        "kind": data.kind,
        "note": data.note,
        "status": "pending",
        "created_at": now_iso(),
    }
    await db.mentor_requests.insert_one(doc)
    await log_passport(user["id"], "mentorship", f"Requested {data.kind.replace('_', ' ')} with {m['name']}", m["role"])
    doc.pop("_id", None)
    return doc


# ---------------- Communities™ ----------------
DEFAULT_COMMUNITIES = [
    {"name": "Songwriters", "kind": "Music", "members": 4210, "color": "#007AFF"},
    {"name": "Film", "kind": "Film", "members": 2180, "color": "#EC4899"},
    {"name": "Animation", "kind": "Animation", "members": 1540, "color": "#10B981"},
    {"name": "Photography", "kind": "Photography", "members": 1980, "color": "#F59E0B"},
    {"name": "Jazz", "kind": "Music", "members": 720, "color": "#8B5CF6"},
    {"name": "Gospel", "kind": "Music", "members": 640, "color": "#EF4444"},
    {"name": "Hip-Hop", "kind": "Music", "members": 3820, "color": "#F97316"},
    {"name": "EDM", "kind": "Music", "members": 2010, "color": "#06B6D4"},
    {"name": "Publishing", "kind": "Industry", "members": 890, "color": "#84CC16"},
    {"name": "Faculty", "kind": "Education", "members": 380, "color": "#FAFAFA"},
    {"name": "Alumni", "kind": "Education", "members": 1240, "color": "#A855F7"},
    {"name": "Women in Music", "kind": "Community", "members": 2470, "color": "#F472B6"},
    {"name": "Creative Entrepreneurs", "kind": "Industry", "members": 610, "color": "#22D3EE"},
    {"name": "Students", "kind": "Education", "members": 5320, "color": "#38BDF8"},
]


@api_router.get("/communities")
async def list_communities(user: dict = Depends(get_current_user)):
    docs = await db.communities.find({}, {"_id": 0}).to_list(200)
    if not docs:
        for c in DEFAULT_COMMUNITIES:
            await db.communities.insert_one({"id": new_id(), "created_at": now_iso(), **c})
        docs = await db.communities.find({}, {"_id": 0}).to_list(200)
    return docs


@api_router.post("/communities/{cid}/join")
async def join_community(cid: str, user: dict = Depends(get_current_user)):
    c = await db.communities.find_one({"id": cid})
    if not c:
        raise HTTPException(status_code=404, detail="Community not found")
    await log_passport(user["id"], "collaboration", f"Joined {c['name']} community", c["kind"])
    return {"ok": True}


# ---------------- Creative Review™ (timestamped) ----------------
class ReviewIn(BaseModel):
    workspace_id: str
    target: str  # asset id or name
    timestamp: float  # seconds
    body: str


@api_router.get("/reviews/{ws_id}")
async def list_reviews(ws_id: str, user: dict = Depends(get_current_user)):
    items = await db.reviews.find({"workspace_id": ws_id}, {"_id": 0}).sort("timestamp", 1).to_list(500)
    return items


@api_router.post("/reviews")
async def add_review(data: ReviewIn, user: dict = Depends(get_current_user)):
    doc = {
        "id": new_id(),
        "workspace_id": data.workspace_id,
        "target": data.target,
        "timestamp": data.timestamp,
        "body": data.body,
        "author_id": user["id"],
        "author_name": user["name"],
        "avatar_color": user.get("avatar_color", "#007AFF"),
        "created_at": now_iso(),
    }
    await db.reviews.insert_one(doc)
    doc.pop("_id", None)
    return doc


# ---------------- Live Presence™ ----------------
PRESENCE_TEMPLATES = [
    ("writing lyrics", "#007AFF"),
    ("mixing", "#F59E0B"),
    ("editing MIDI", "#10B981"),
    ("mentoring", "#8B5CF6"),
    ("in Studio A", "#EC4899"),
    ("reviewing edits", "#22D3EE"),
    ("recording vocals", "#EF4444"),
    ("arranging", "#84CC16"),
]


@api_router.get("/presence")
async def presence(user: dict = Depends(get_current_user)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).limit(20).to_list(20)
    live = []
    import hashlib
    for u in users:
        h = int(hashlib.md5(u["id"].encode()).hexdigest(), 16)
        activity, color = PRESENCE_TEMPLATES[h % len(PRESENCE_TEMPLATES)]
        live.append({
            "user_id": u["id"],
            "name": u["name"],
            "avatar_color": u.get("avatar_color", "#007AFF"),
            "activity": activity,
            "color": color,
            "since": (h % 45) + 1,  # minutes ago (deterministic)
        })
    return live


# ---------------- Creator Discovery™ ----------------
@api_router.get("/discover")
async def discover_creators(user: dict = Depends(get_current_user)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(500)
    combined = []
    for c in SAMPLE_CREATORS:
        combined.append({
            **c,
            "id": new_id(),
            "availability": "Available" if hash(c["name"]) % 3 else "Booked",
            "experience": (hash(c["name"]) % 15) + 1,
            "skills": [c["discipline"], c["role"]],
        })
    for u in users:
        combined.append({
            "id": u["id"],
            "name": u["name"],
            "role": u.get("role", "Creator"),
            "discipline": u.get("discipline", "Multidisciplinary"),
            "country": u.get("country", "Global"),
            "city": u.get("country", "Global"),
            "availability": "Available",
            "experience": 1,
            "skills": [u.get("discipline", "Music"), u.get("role", "Creator")],
        })
    return combined


# ---------------- Deep INHEIRA™ Integration (mock) ----------------
@api_router.post("/inheira/sync/{ws_id}")
async def inheira_sync(ws_id: str, user: dict = Depends(get_current_user)):
    ws = await db.workspaces.find_one({"id": ws_id})
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    # simulate ownership sync
    sync = {
        "workspace_id": ws_id,
        "status": "synced",
        "contributors": [user["name"]],
        "credits": [{"role": user.get("role", "Creator"), "name": user["name"], "share": 100}],
        "ownership_verified": True,
        "publishing": {"pro": "ASCAP", "publisher": "TBD"},
        "synced_at": now_iso(),
    }
    await db.inheira_sync.update_one({"workspace_id": ws_id}, {"$set": sync}, upsert=True)
    await log_passport(user["id"], "achievement", f"Synced {ws['name']} to INHEIRA™", "Ownership + credits captured")
    return sync


@api_router.get("/inheira/sync/{ws_id}")
async def get_inheira_sync(ws_id: str, user: dict = Depends(get_current_user)):
    doc = await db.inheira_sync.find_one({"workspace_id": ws_id}, {"_id": 0})
    if not doc:
        return {"workspace_id": ws_id, "status": "not_synced"}
    return doc


# ---------------- ANCRLAB™ (collaborative DAW mock) ----------------
DEFAULT_TRACKS = [
    {"name": "Vocal Lead", "color": "#007AFF", "muted": False, "solo": False, "volume": 78},
    {"name": "Vocal Harmony", "color": "#22D3EE", "muted": False, "solo": False, "volume": 62},
    {"name": "Piano", "color": "#F59E0B", "muted": False, "solo": False, "volume": 71},
    {"name": "Bass", "color": "#EC4899", "muted": False, "solo": False, "volume": 80},
    {"name": "Drums", "color": "#10B981", "muted": False, "solo": False, "volume": 84},
    {"name": "Synth Pad", "color": "#8B5CF6", "muted": True, "solo": False, "volume": 40},
]


@api_router.get("/ancrlab/{ws_id}")
async def get_ancrlab(ws_id: str, user: dict = Depends(get_current_user)):
    doc = await db.ancrlab.find_one({"workspace_id": ws_id}, {"_id": 0})
    if not doc:
        doc = {
            "workspace_id": ws_id,
            "tempo": 82,
            "key": "A minor",
            "signature": "4/4",
            "tracks": [{"id": new_id(), **t} for t in DEFAULT_TRACKS],
            "updated_at": now_iso(),
        }
        await db.ancrlab.insert_one(doc)
        doc.pop("_id", None)
    return doc


class TrackUpdateIn(BaseModel):
    track_id: str
    muted: Optional[bool] = None
    solo: Optional[bool] = None
    volume: Optional[int] = None


@api_router.post("/ancrlab/{ws_id}/track")
async def update_track(ws_id: str, data: TrackUpdateIn, user: dict = Depends(get_current_user)):
    doc = await db.ancrlab.find_one({"workspace_id": ws_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Not initialized")
    new_tracks = []
    for t in doc["tracks"]:
        if t["id"] == data.track_id:
            if data.muted is not None:
                t["muted"] = data.muted
            if data.solo is not None:
                t["solo"] = data.solo
            if data.volume is not None:
                t["volume"] = data.volume
        new_tracks.append(t)
    await db.ancrlab.update_one({"workspace_id": ws_id}, {"$set": {"tracks": new_tracks, "updated_at": now_iso()}})
    return {"ok": True}


app.include_router(api_router)


# ============================================================
# PHASE 3 — ANCRID Identity Layer + Global Geo + WebRTC + Federated SSO
# ============================================================

# ---------------- ANCRID Federated Identity ----------------

# City → (lat, lng, flag) lookup for real geo
GEO_LOOKUP = {
    "chicago": (41.88, -87.63, "🇺🇸"), "new york": (40.71, -74.0, "🇺🇸"),
    "los angeles": (34.05, -118.24, "🇺🇸"), "nashville": (36.16, -86.78, "🇺🇸"),
    "atlanta": (33.75, -84.39, "🇺🇸"), "miami": (25.76, -80.19, "🇺🇸"),
    "london": (51.51, -0.12, "🇬🇧"), "manchester": (53.48, -2.24, "🇬🇧"),
    "berlin": (52.52, 13.4, "🇩🇪"), "hamburg": (53.55, 9.99, "🇩🇪"),
    "paris": (48.86, 2.35, "🇫🇷"), "milan": (45.46, 9.19, "🇮🇹"),
    "rome": (41.9, 12.5, "🇮🇹"), "madrid": (40.42, -3.7, "🇪🇸"),
    "amsterdam": (52.37, 4.9, "🇳🇱"), "stockholm": (59.33, 18.06, "🇸🇪"),
    "copenhagen": (55.68, 12.57, "🇩🇰"), "dublin": (53.35, -6.26, "🇮🇪"),
    "toronto": (43.65, -79.38, "🇨🇦"), "montreal": (45.5, -73.57, "🇨🇦"),
    "vancouver": (49.28, -123.12, "🇨🇦"), "mexico city": (19.43, -99.13, "🇲🇽"),
    "são paulo": (-23.55, -46.63, "🇧🇷"), "sao paulo": (-23.55, -46.63, "🇧🇷"),
    "rio de janeiro": (-22.91, -43.17, "🇧🇷"), "buenos aires": (-34.6, -58.38, "🇦🇷"),
    "lagos": (6.52, 3.38, "🇳🇬"), "accra": (5.6, -0.19, "🇬🇭"),
    "johannesburg": (-26.2, 28.03, "🇿🇦"), "nairobi": (-1.29, 36.82, "🇰🇪"),
    "cairo": (30.04, 31.24, "🇪🇬"), "dubai": (25.2, 55.27, "🇦🇪"),
    "mumbai": (19.08, 72.88, "🇮🇳"), "delhi": (28.61, 77.21, "🇮🇳"),
    "bangalore": (12.97, 77.59, "🇮🇳"), "karachi": (24.86, 67.0, "🇵🇰"),
    "tokyo": (35.68, 139.69, "🇯🇵"), "osaka": (34.69, 135.5, "🇯🇵"),
    "seoul": (37.57, 126.98, "🇰🇷"), "beijing": (39.9, 116.4, "🇨🇳"),
    "shanghai": (31.23, 121.47, "🇨🇳"), "singapore": (1.35, 103.82, "🇸🇬"),
    "bangkok": (13.76, 100.5, "🇹🇭"), "manila": (14.6, 120.98, "🇵🇭"),
    "sydney": (-33.87, 151.21, "🇦🇺"), "melbourne": (-37.81, 144.96, "🇦🇺"),
    "auckland": (-36.85, 174.76, "🇳🇿"),
    # Country fallbacks
    "united states": (39.83, -98.58, "🇺🇸"), "us": (39.83, -98.58, "🇺🇸"),
    "united kingdom": (51.51, -0.12, "🇬🇧"), "uk": (51.51, -0.12, "🇬🇧"),
    "canada": (56.13, -106.35, "🇨🇦"), "mexico": (23.63, -102.55, "🇲🇽"),
    "brazil": (-14.24, -51.93, "🇧🇷"), "argentina": (-38.42, -63.62, "🇦🇷"),
    "germany": (51.17, 10.45, "🇩🇪"), "france": (46.23, 2.21, "🇫🇷"),
    "italy": (41.87, 12.57, "🇮🇹"), "spain": (40.46, -3.75, "🇪🇸"),
    "netherlands": (52.13, 5.29, "🇳🇱"), "nigeria": (9.08, 8.68, "🇳🇬"),
    "ghana": (7.95, -1.03, "🇬🇭"), "south africa": (-30.56, 22.94, "🇿🇦"),
    "kenya": (-0.02, 37.9, "🇰🇪"), "egypt": (26.82, 30.8, "🇪🇬"),
    "uae": (23.42, 53.85, "🇦🇪"), "india": (20.59, 78.96, "🇮🇳"),
    "japan": (36.2, 138.25, "🇯🇵"), "south korea": (35.9, 127.77, "🇰🇷"),
    "china": (35.86, 104.19, "🇨🇳"), "australia": (-25.27, 133.78, "🇦🇺"),
    "global": (0.0, 0.0, "🌍"),
}


def resolve_geo(city: str, country: str):
    if city:
        key = city.strip().lower()
        if key in GEO_LOOKUP:
            lat, lng, flag = GEO_LOOKUP[key]
            return {"city": city, "country": country, "lat": lat, "lng": lng, "flag": flag}
    if country:
        key = country.strip().lower()
        if key in GEO_LOOKUP:
            lat, lng, flag = GEO_LOOKUP[key]
            return {"city": city or country, "country": country, "lat": lat, "lng": lng, "flag": flag}
    return {"city": city or "Global", "country": country or "Global", "lat": 0.0, "lng": 0.0, "flag": "🌍"}


@api_router.get("/ancrid/verify")
async def ancrid_verify(user: dict = Depends(get_current_user)):
    """Returns cross-product identity payload aggregated from the ANCR ecosystem."""
    workspaces_count = await db.workspaces.count_documents({"members": user["id"]})
    passport_count = await db.passport_entries.count_documents({"user_id": user["id"]})
    sessions_count = await db.sessions.count_documents({"host_id": user["id"]})
    inheira_synced = await db.inheira_sync.count_documents({})
    geo = resolve_geo(user.get("city", ""), user.get("country", ""))
    return {
        "user": user,
        "ancrid": f"ANCR-{user['id'][:8].upper()}",
        "verified": True,
        "geo": geo,
        "products": {
            "ancrsync": {"workspaces": workspaces_count, "sessions": sessions_count, "status": "active"},
            "ancrlab": {"projects": max(workspaces_count, 3), "tracks": 24, "status": "active"},
            "inheira": {"works_registered": max(inheira_synced, 2), "credits": max(passport_count // 2, 4), "status": "active"},
            "vaulta": {"balance_usd": 1284.50, "royalties_pending": 342.80, "status": "active"},
            "ancrlaunch": {"releases": 2, "campaigns": 1, "status": "pending"},
            "ancra": {"courses_active": 3, "completed": 12, "status": "active"},
        },
        "passport_count": passport_count,
    }


class FederatedIn(BaseModel):
    source: str  # ancrlab | inheira | vaulta | ancrlaunch | ancra
    email: EmailStr
    display_name: Optional[str] = None
    role: Optional[str] = "Creator"
    discipline: Optional[str] = "Multidisciplinary"
    city: Optional[str] = ""
    country: Optional[str] = ""


@api_router.post("/ancrid/federated")
async def ancrid_federated(data: FederatedIn):
    """SSO endpoint — recognizes existing ANCRID or provisions a new one."""
    email = data.email.lower()
    user = await db.users.find_one({"email": email})
    if not user:
        user_id = new_id()
        geo = resolve_geo(data.city or "", data.country or "")
        user_doc = {
            "id": user_id,
            "name": data.display_name or email.split("@")[0].title(),
            "email": email,
            "password_hash": hash_password(new_id()),  # random — federated only
            "role": data.role or "Creator",
            "discipline": data.discipline or "Multidisciplinary",
            "country": data.country or geo["country"],
            "city": data.city or "",
            "lat": geo["lat"],
            "lng": geo["lng"],
            "flag": geo["flag"],
            "avatar_color": ["#007AFF", "#F59E0B", "#10B981", "#EC4899", "#8B5CF6", "#EF4444"][len(email) % 6],
            "federated_source": data.source,
            "created_at": now_iso(),
        }
        await db.users.insert_one(user_doc)
        await log_passport(user_id, "achievement", f"Joined via {data.source.upper()}™ federation", f"ANCRID SSO from {data.source}")
        user = user_doc
    token = create_token(user["id"])
    user.pop("password_hash", None)
    user.pop("_id", None)
    return {"token": token, "user": user, "source": data.source}


# ---------------- User Geo Update ----------------
class GeoIn(BaseModel):
    city: str = ""
    country: str = ""


@api_router.post("/me/geo")
async def update_geo(data: GeoIn, user: dict = Depends(get_current_user)):
    geo = resolve_geo(data.city, data.country)
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {
            "city": data.city,
            "country": data.country or geo["country"],
            "lat": geo["lat"],
            "lng": geo["lng"],
            "flag": geo["flag"],
        }},
    )
    return {"ok": True, "geo": geo}


# ---------------- LiveKit WebRTC ----------------
@api_router.get("/livekit/config")
async def livekit_config():
    """Public config so the frontend knows whether real WebRTC is available."""
    return {
        "enabled": bool(os.environ.get("LIVEKIT_URL") and os.environ.get("LIVEKIT_API_KEY") and os.environ.get("LIVEKIT_API_SECRET")),
        "url": os.environ.get("LIVEKIT_URL", ""),
    }


class LiveKitTokenIn(BaseModel):
    room: str
    identity: Optional[str] = None
    can_publish: bool = True


@api_router.post("/livekit/token")
async def livekit_token(data: LiveKitTokenIn, user: dict = Depends(get_current_user)):
    api_key = os.environ.get("LIVEKIT_API_KEY")
    api_secret = os.environ.get("LIVEKIT_API_SECRET")
    lk_url = os.environ.get("LIVEKIT_URL")
    if not (api_key and api_secret and lk_url):
        raise HTTPException(
            status_code=501,
            detail="LiveKit not configured. Set LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET in backend/.env",
        )
    from livekit import api as lk_api  # local import so app loads without livekit

    identity = data.identity or f"user-{user['id']}"
    at = (
        lk_api.AccessToken(api_key, api_secret)
        .with_identity(identity)
        .with_name(user["name"])
        .with_grants(
            lk_api.VideoGrants(
                room_join=True,
                room=data.room,
                can_publish=data.can_publish,
                can_subscribe=True,
            )
        )
        .with_ttl(timedelta(hours=6))
    )
    return {"token": at.to_jwt(), "url": lk_url, "room": data.room, "identity": identity}


# ---------------- Enrich existing endpoints with geo ----------------
@api_router.get("/global/creators/v2")
async def global_creators_v2(user: dict = Depends(get_current_user)):
    """Same as /global/creators but also includes each real user's resolved coordinates."""
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(500)
    enriched = []
    for u in users:
        if u.get("lat") is None or (u.get("lat") == 0.0 and u.get("lng") == 0.0):
            g = resolve_geo(u.get("city", ""), u.get("country", ""))
            u = {**u, **g}
        enriched.append({
            "name": u.get("name"),
            "role": u.get("role", "Creator"),
            "discipline": u.get("discipline", "Multidisciplinary"),
            "city": u.get("city") or u.get("country", "Global"),
            "country": u.get("country", "Global"),
            "flag": u.get("flag", "🌍"),
            "lat": u.get("lat", 0.0),
            "lng": u.get("lng", 0.0),
        })
    return {"sample": SAMPLE_CREATORS, "users": enriched}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
