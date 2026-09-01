from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
import jwt
import bcrypt
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']
JWT_SECRET = os.environ['JWT_SECRET']
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="ANCRD - Global Professional Network of CCDP")
api = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ancrd")

# ---------------- Auth Helpers ----------------
def hash_pw(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_pw(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False

def make_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=30)}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

async def current_user(creds: HTTPAuthorizationCredentials = Depends(security)):
    if not creds:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=["HS256"])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password": 0})
        if not user:
            raise HTTPException(401, "Invalid token")
        return user
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid token")

# ---------------- Models ----------------
class LoginBody(BaseModel):
    email: EmailStr
    password: str

class PostCreate(BaseModel):
    content: str
    media_url: Optional[str] = None
    kind: str = "text"  # text, image, video, music, achievement, event
    hashtags: List[str] = []
    community_id: Optional[str] = None

class ReactionBody(BaseModel):
    reaction: str  # like, applaud, celebrate, insightful, save

class CommentBody(BaseModel):
    content: str

class MessageBody(BaseModel):
    to_user_id: str
    content: str

class AIAHBody(BaseModel):
    prompt: str
    context: Optional[str] = None

# ---------------- Auth Endpoints ----------------
@api.post("/auth/login")
async def login(body: LoginBody):
    user = await db.users.find_one({"email": body.email.lower()})
    if not user or not verify_pw(body.password, user.get("password", "")):
        raise HTTPException(401, "Invalid credentials")
    token = make_token(user["id"])
    user.pop("_id", None)
    user.pop("password", None)
    return {"token": token, "user": user}

@api.get("/auth/me")
async def me(user=Depends(current_user)):
    return user

# ---------------- Users / Profiles ----------------
@api.get("/users")
async def list_users(user=Depends(current_user)):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(500)
    return users

@api.get("/users/{user_id}")
async def get_user(user_id: str, user=Depends(current_user)):
    u = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not u:
        raise HTTPException(404, "User not found")
    return u

@api.post("/users/{user_id}/follow")
async def follow_user(user_id: str, user=Depends(current_user)):
    if user_id == user["id"]:
        raise HTTPException(400, "Cannot follow yourself")
    await db.users.update_one({"id": user["id"]}, {"$addToSet": {"following": user_id}})
    await db.users.update_one({"id": user_id}, {"$addToSet": {"followers": user["id"]}})
    return {"ok": True}

# ---------------- Feed / Posts ----------------
@api.get("/posts")
async def feed(user=Depends(current_user)):
    posts = await db.posts.find({"community_id": {"$in": [None]}}, {"_id": 0}).sort("created_at", -1).to_list(200)
    # if nothing tagged as global, fall back to all
    if not posts:
        posts = await db.posts.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    author_ids = list({p["author_id"] for p in posts})
    authors = await db.users.find({"id": {"$in": author_ids}}, {"_id": 0, "password": 0}).to_list(500)
    amap = {a["id"]: a for a in authors}
    for p in posts:
        p["author"] = amap.get(p["author_id"])
    return posts

@api.post("/posts")
async def create_post(body: PostCreate, user=Depends(current_user)):
    post = {
        "id": str(uuid.uuid4()),
        "author_id": user["id"],
        "content": body.content,
        "media_url": body.media_url,
        "kind": body.kind,
        "hashtags": body.hashtags,
        "community_id": body.community_id,
        "reactions": {},
        "comments": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.posts.insert_one(post)
    post.pop("_id", None)
    post["author"] = user
    return post

@api.post("/posts/{post_id}/react")
async def react(post_id: str, body: ReactionBody, user=Depends(current_user)):
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(404, "Post not found")
    key = f"reactions.{body.reaction}"
    reactions = post.get("reactions", {})
    users = reactions.get(body.reaction, [])
    if user["id"] in users:
        await db.posts.update_one({"id": post_id}, {"$pull": {key: user["id"]}})
    else:
        await db.posts.update_one({"id": post_id}, {"$addToSet": {key: user["id"]}})
    return {"ok": True}

@api.post("/posts/{post_id}/comment")
async def comment(post_id: str, body: CommentBody, user=Depends(current_user)):
    c = {
        "id": str(uuid.uuid4()),
        "author_id": user["id"],
        "author_name": user["name"],
        "avatar": user.get("avatar"),
        "content": body.content,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.posts.update_one({"id": post_id}, {"$push": {"comments": c}})
    return c

# ---------------- Communities ----------------
@api.get("/communities")
async def list_communities(user=Depends(current_user)):
    return await db.communities.find({}, {"_id": 0}).to_list(200)

@api.get("/communities/{cid}")
async def get_community(cid: str, user=Depends(current_user)):
    c = await db.communities.find_one({"id": cid}, {"_id": 0})
    if not c:
        raise HTTPException(404, "Community not found")
    # hydrate members (limit for perf)
    members = await db.users.find(
        {"id": {"$in": c.get("members", [])}},
        {"_id": 0, "password": 0}
    ).to_list(200)
    c["member_profiles"] = members
    c["is_member"] = user["id"] in c.get("members", [])
    return c

@api.get("/communities/{cid}/posts")
async def community_posts(cid: str, user=Depends(current_user)):
    posts = await db.posts.find({"community_id": cid}, {"_id": 0}).sort("created_at", -1).to_list(200)
    author_ids = list({p["author_id"] for p in posts})
    authors = await db.users.find({"id": {"$in": author_ids}}, {"_id": 0, "password": 0}).to_list(500)
    amap = {a["id"]: a for a in authors}
    for p in posts:
        p["author"] = amap.get(p["author_id"])
    return posts

@api.post("/communities/{cid}/join")
async def join_community(cid: str, user=Depends(current_user)):
    await db.communities.update_one({"id": cid}, {"$addToSet": {"members": user["id"]}})
    return {"ok": True}

@api.post("/communities/{cid}/leave")
async def leave_community(cid: str, user=Depends(current_user)):
    await db.communities.update_one({"id": cid}, {"$pull": {"members": user["id"]}})
    return {"ok": True}

# ---------------- Events ----------------
@api.get("/events")
async def list_events(user=Depends(current_user)):
    return await db.events.find({}, {"_id": 0}).sort("date", 1).to_list(200)

@api.post("/events/{eid}/rsvp")
async def rsvp(eid: str, user=Depends(current_user)):
    await db.events.update_one({"id": eid}, {"$addToSet": {"attendees": user["id"]}})
    return {"ok": True}

# ---------------- Opportunities ----------------
@api.get("/opportunities")
async def list_opportunities(user=Depends(current_user)):
    return await db.opportunities.find({}, {"_id": 0}).to_list(200)

@api.post("/opportunities/{oid}/apply")
async def apply_opp(oid: str, user=Depends(current_user)):
    await db.opportunities.update_one({"id": oid}, {"$addToSet": {"applicants": user["id"]}})
    return {"ok": True}

# ---------------- Marketplace ----------------
@api.get("/marketplace")
async def marketplace(user=Depends(current_user)):
    return await db.marketplace.find({}, {"_id": 0}).to_list(200)

@api.post("/marketplace/{lid}/book")
async def book(lid: str, user=Depends(current_user)):
    listing = await db.marketplace.find_one({"id": lid}, {"_id": 0})
    if not listing:
        raise HTTPException(404, "Not found")
    booking = {
        "id": str(uuid.uuid4()),
        "listing_id": lid,
        "client_id": user["id"],
        "provider_id": listing["provider_id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "pending",
    }
    await db.bookings.insert_one(booking)
    booking.pop("_id", None)
    return booking

# ---------------- Notifications ----------------
@api.get("/notifications")
async def notifications(user=Depends(current_user)):
    return await db.notifications.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)

# ---------------- Messages ----------------
@api.get("/messages/threads")
async def threads(user=Depends(current_user)):
    threads = await db.threads.find({"members": user["id"]}, {"_id": 0}).sort("updated_at", -1).to_list(100)
    # attach other party
    for t in threads:
        other = next((m for m in t["members"] if m != user["id"]), None)
        if other:
            u = await db.users.find_one({"id": other}, {"_id": 0, "password": 0})
            t["other"] = u
    return threads

@api.get("/messages/{thread_id}")
async def get_messages(thread_id: str, user=Depends(current_user)):
    return await db.messages.find({"thread_id": thread_id}, {"_id": 0}).sort("created_at", 1).to_list(500)

@api.post("/messages")
async def send_message(body: MessageBody, user=Depends(current_user)):
    thread = await db.threads.find_one({"members": {"$all": [user["id"], body.to_user_id]}, "kind": "dm"})
    now = datetime.now(timezone.utc).isoformat()
    if not thread:
        thread = {
            "id": str(uuid.uuid4()),
            "kind": "dm",
            "members": [user["id"], body.to_user_id],
            "created_at": now,
            "updated_at": now,
            "last_message": body.content,
        }
        await db.threads.insert_one(thread)
    else:
        await db.threads.update_one({"id": thread["id"]}, {"$set": {"updated_at": now, "last_message": body.content}})
    msg = {
        "id": str(uuid.uuid4()),
        "thread_id": thread["id"],
        "from_user_id": user["id"],
        "to_user_id": body.to_user_id,
        "content": body.content,
        "created_at": now,
    }
    await db.messages.insert_one(msg)
    msg.pop("_id", None)
    return msg

# ---------------- Institutions ----------------
@api.get("/institutions")
async def institutions(user=Depends(current_user)):
    return await db.institutions.find({}, {"_id": 0}).to_list(200)

@api.get("/institutions/{iid}")
async def institution_home(iid: str, user=Depends(current_user)):
    inst = await db.institutions.find_one({"id": iid}, {"_id": 0})
    if not inst:
        raise HTTPException(404, "Institution not found")

    members = await db.users.find(
        {"institution_id": iid}, {"_id": 0, "password": 0}
    ).to_list(500)

    def by_role(*roles):
        return [u for u in members if u.get("role") in roles]

    faculty = by_role("Faculty", "Professor", "Adjunct Professor",
                      "Artist in Residence", "Executive in Residence")
    students = by_role("Student")
    alumni = by_role("Alumni")
    admins = by_role("Institution Administrator", "Administrator")

    member_ids = [m["id"] for m in members]
    # feed = posts by anyone at this institution
    feed = await db.posts.find(
        {"author_id": {"$in": member_ids}}, {"_id": 0}
    ).sort("created_at", -1).to_list(60)
    amap = {m["id"]: m for m in members}
    for p in feed:
        p["author"] = amap.get(p["author_id"])

    releases = [p for p in feed if p.get("kind") in ("music", "achievement")][:12]
    events = await db.events.find(
        {"host_institution": inst["name"]}, {"_id": 0}
    ).sort("date", 1).to_list(30)
    opportunities = await db.opportunities.find(
        {}, {"_id": 0}
    ).sort("created_at", -1).to_list(6)

    # leaderboard — top by portfolio score at this institution
    leaderboard = sorted(members, key=lambda u: -(u.get("portfolio_score") or 0))[:8]

    return {
        "institution": inst,
        "students": students,
        "faculty": faculty,
        "alumni": alumni,
        "admins": admins,
        "feed": feed,
        "releases": releases,
        "events": events,
        "opportunities": opportunities,
        "leaderboard": leaderboard,
        "departments": inst.get("programs", []),
        "counts": {
            "students": len(students),
            "faculty": len(faculty),
            "alumni": len(alumni),
            "posts": len(feed),
            "releases": len(releases),
            "events": len(events),
        },
    }

@api.get("/institutions/{iid}/dashboard")
async def institution_dashboard(iid: str, user=Depends(current_user)):
    inst = await db.institutions.find_one({"id": iid}, {"_id": 0})
    if not inst:
        raise HTTPException(404, "Institution not found")

    members = await db.users.find(
        {"institution_id": iid}, {"_id": 0, "password": 0}
    ).to_list(500)
    member_ids = [m["id"] for m in members]

    students = [u for u in members if u.get("role") == "Student"]
    alumni = [u for u in members if u.get("role") == "Alumni"]
    faculty = [u for u in members if u.get("role") in
               ("Faculty", "Professor", "Adjunct Professor",
                "Artist in Residence", "Executive in Residence")]

    posts = await db.posts.find({"author_id": {"$in": member_ids}}).to_list(500)
    faculty_posts = [p for p in posts if p.get("author_id") in {f["id"] for f in faculty}]
    releases = [p for p in posts if p.get("kind") in ("music", "achievement")]

    grad_by_year = {}
    for u in members:
        y = u.get("graduation_year")
        if y:
            grad_by_year[str(y)] = grad_by_year.get(str(y), 0) + 1

    avg_portfolio = (
        round(sum(u.get("portfolio_score") or 0 for u in members) / max(1, len(members)))
        if members else 0
    )

    placed = [u for u in alumni if (u.get("portfolio_score") or 0) >= 70]

    return {
        "institution": inst,
        "counts": {
            "students": len(students),
            "faculty": len(faculty),
            "alumni": len(alumni),
            "total": len(members),
            "posts": len(posts),
            "faculty_posts": len(faculty_posts),
            "releases": len(releases),
        },
        "career_readiness": avg_portfolio,
        "placement_rate": round((len(placed) / max(1, len(alumni))) * 100) if alumni else 0,
        "graduation_by_year": sorted(grad_by_year.items()),
        "collaborations": {
            # count community memberships across institution
            "total": sum(
                1 for c in await db.communities.find({}, {"_id": 0}).to_list(200)
                for m in c.get("members", []) if m in set(member_ids)
            ),
        },
        "top_faculty": sorted(
            faculty, key=lambda u: -(u.get("portfolio_score") or 0)
        )[:5],
        "top_students": sorted(
            students, key=lambda u: -(u.get("portfolio_score") or 0)
        )[:5],
    }

# ---------------- Employer ----------------
class EmployerSearchBody(BaseModel):
    q: Optional[str] = None
    role: Optional[str] = None
    discipline: Optional[str] = None
    availability: Optional[str] = None
    country: Optional[str] = None
    skill: Optional[str] = None
    min_portfolio: Optional[int] = None

@api.post("/employer/search")
async def employer_search(body: EmployerSearchBody, user=Depends(current_user)):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(500)
    def matches(u):
        if body.q:
            hay = f"{u.get('name','')} {u.get('bio','')}".lower()
            if body.q.lower() not in hay:
                return False
        if body.role and u.get("role") != body.role: return False
        if body.discipline and body.discipline not in (u.get("disciplines") or []): return False
        if body.availability and u.get("availability") != body.availability: return False
        if body.country and u.get("country") != body.country: return False
        if body.skill and body.skill not in (u.get("skills") or []): return False
        if body.min_portfolio and (u.get("portfolio_score") or 0) < body.min_portfolio: return False
        return True
    filtered = [u for u in users if matches(u)]
    filtered.sort(key=lambda u: -(u.get("portfolio_score") or 0))
    return {"count": len(filtered), "results": filtered[:80]}

@api.get("/employer/saved")
async def employer_saved(user=Depends(current_user)):
    me = await db.users.find_one({"id": user["id"]})
    ids = me.get("saved_candidates", []) if me else []
    return await db.users.find(
        {"id": {"$in": ids}}, {"_id": 0, "password": 0}
    ).to_list(200)

@api.post("/employer/saved/{cid}")
async def employer_save(cid: str, user=Depends(current_user)):
    await db.users.update_one({"id": user["id"]}, {"$addToSet": {"saved_candidates": cid}})
    return {"ok": True}

@api.delete("/employer/saved/{cid}")
async def employer_unsave(cid: str, user=Depends(current_user)):
    await db.users.update_one({"id": user["id"]}, {"$pull": {"saved_candidates": cid}})
    return {"ok": True}

# ---------------- Admin ----------------
@api.get("/admin/stats")
async def admin_stats(user=Depends(current_user)):
    counts = {
        "users": await db.users.count_documents({}),
        "posts": await db.posts.count_documents({}),
        "communities": await db.communities.count_documents({}),
        "events": await db.events.count_documents({}),
        "opportunities": await db.opportunities.count_documents({}),
        "marketplace": await db.marketplace.count_documents({}),
        "institutions": await db.institutions.count_documents({}),
    }
    return counts

# ---------------- AIAH (Claude Sonnet 4.5) ----------------
@api.post("/aiah/ask")
async def aiah_ask(body: AIAHBody, user=Depends(current_user)):
    from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

    all_users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(500)
    directory = "\n".join([
        f"- {u['name']} — {u.get('role')} @ {u.get('institution')} — {', '.join(u.get('disciplines', []))} — {u.get('location')}"
        for u in all_users[:60]
    ])
    system = (
        "You are AIAH, the AI intelligence layer of the ANCR Ecosystem, embedded in ANCRD, "
        "the global professional network for CCDP creatives. You provide networking recommendations, "
        "mentor matches, collaboration suggestions, opportunity matching, and weekly insights. "
        "You speak with editorial precision, cinematic clarity, and warmth. Always reference specific "
        "creators from the directory when making recommendations. Keep responses concise (under 220 words) "
        "with clean structure. Never use emoji.\n\n"
        f"Current user: {user['name']} — {user.get('role')} @ {user.get('institution')} — "
        f"disciplines: {', '.join(user.get('disciplines', []))} — location: {user.get('location')}\n\n"
        f"CCDP Directory (sample):\n{directory}"
    )
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"aiah-{user['id']}",
        system_message=system,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")

    async def gen():
        try:
            async for ev in chat.stream_message(UserMessage(text=body.prompt)):
                if isinstance(ev, TextDelta):
                    yield ev.content
                elif isinstance(ev, StreamDone):
                    break
        except Exception as e:
            logger.exception("AIAH error")
            yield f"\n[AIAH is temporarily unavailable: {str(e)[:120]}]"

    return StreamingResponse(gen(), media_type="text/plain", headers={
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
    })

# ---------------- Seed ----------------
@api.post("/seed")
async def seed_endpoint():
    from seed_data import run_seed
    result = await run_seed(db)
    return result

app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    # Auto-seed if empty
    if await db.users.count_documents({}) == 0:
        from seed_data import run_seed
        await run_seed(db)
        logger.info("Seeded ANCRD demo data.")

@app.on_event("shutdown")
async def shutdown():
    client.close()
