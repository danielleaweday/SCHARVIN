"""ANCRMEDIA™ Backend — Global Creative Network of CCDP."""
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import re
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, Query
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field

from seed_data import build_seed

# ---------- DB ----------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_ALGORITHM = "HS256"


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


# ---------- AUTH UTILS ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=6),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=30),
        "type": "refresh",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def _serialize_user(user: dict) -> dict:
    out = {k: v for k, v in user.items() if k not in ("password_hash", "_id")}
    out["id"] = str(user.get("_id")) if user.get("_id") is not None else user.get("id")
    return out


async def get_current_user_optional(request: Request) -> Optional[dict]:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        return None
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            return None
        user = await db.users.find_one({"email": payload.get("email")})
        if not user:
            return None
        return _serialize_user(user)
    except jwt.PyJWTError:
        return None


async def get_current_user(request: Request) -> dict:
    user = await get_current_user_optional(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


def set_auth_cookies(response: Response, access: str, refresh: str) -> None:
    response.set_cookie("access_token", access, httponly=True, secure=True, samesite="none", max_age=6 * 3600, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=True, samesite="none", max_age=30 * 86400, path="/")


# ---------- MODELS ----------
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1)
    institution_id: Optional[str] = None
    discipline: Optional[str] = None
    role: Optional[str] = "student"


class LoginIn(BaseModel):
    email: EmailStr
    password: str


# ---------- APP ----------
app = FastAPI(title="ANCRMEDIA API")
api = APIRouter(prefix="/api")


# ---------- SEED ----------
async def ensure_seeded():
    """Seed content collections if empty; always upsert demo users."""
    seed = build_seed()

    if await db.institutions.count_documents({}) == 0:
        await db.institutions.insert_many(seed["institutions"])
    if await db.creators.count_documents({}) == 0:
        await db.creators.insert_many(seed["creators"])
    if await db.albums.count_documents({}) == 0:
        await db.albums.insert_many(seed["albums"])
    if await db.tracks.count_documents({}) == 0:
        await db.tracks.insert_many(seed["tracks"])
    if await db.videos.count_documents({}) == 0:
        await db.videos.insert_many(seed["videos"])
    if await db.podcasts.count_documents({}) == 0:
        await db.podcasts.insert_many(seed["podcasts"])
    if await db.livestreams.count_documents({}) == 0:
        await db.livestreams.insert_many(seed["livestreams"])
    if await db.playlists.count_documents({}) == 0:
        await db.playlists.insert_many(seed["playlists"])
    if await db.challenges.count_documents({}) == 0:
        await db.challenges.insert_many(seed["challenges"])
    if await db.events.count_documents({}) == 0:
        await db.events.insert_many(seed["events"])

    await db.users.create_index("email", unique=True)
    await db.creators.create_index("handle", unique=True)
    await db.creators.create_index("institution_id")
    await db.tracks.create_index("album_id")
    await db.tracks.create_index("artist_id")
    await db.videos.create_index("artist_id")
    await db.albums.create_index("artist_id")

    demo_users = [
        {"email": os.environ.get("ADMIN_EMAIL", "admin@ancrmedia.com"),
         "password": os.environ.get("ADMIN_PASSWORD", "AdminPass2026!"),
         "name": "ANCR Admin", "role": "administrator",
         "institution_id": None, "avatar": None, "creator_id": None},
    ]
    for email in ["maya@ancrmedia.com", "kenji@ancrmedia.com", "zara@ancrmedia.com",
                  "luca@ancrmedia.com", "noah@ancrmedia.com"]:
        creator = await db.creators.find_one({"email": email})
        if creator:
            demo_users.append({
                "email": email,
                "password": "Creator2026!",
                "name": creator["name"],
                "role": "student",
                "institution_id": creator["institution_id"],
                "avatar": creator["avatar"],
                "creator_id": creator["id"],
            })

    for email in ["prof.hayes@ancrmedia.com"]:
        creator = await db.creators.find_one({"email": email})
        if creator:
            demo_users.append({
                "email": email,
                "password": "Faculty2026!",
                "name": creator["name"],
                "role": "faculty",
                "institution_id": creator["institution_id"],
                "avatar": creator["avatar"],
                "creator_id": creator["id"],
            })

    for u in demo_users:
        password = u.pop("password")
        existing = await db.users.find_one({"email": u["email"]})
        if not existing:
            await db.users.insert_one({
                **u,
                "password_hash": hash_password(password),
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
        else:
            if u["role"] == "administrator" and not verify_password(password, existing["password_hash"]):
                await db.users.update_one({"email": u["email"]}, {"$set": {"password_hash": hash_password(password)}})


@app.on_event("startup")
async def _startup():
    try:
        await ensure_seeded()
        logging.info("ANCRMEDIA seed complete.")
    except Exception as e:  # noqa
        logging.exception("Seed failed: %s", e)


# ---------- AUTH ROUTES ----------
@api.post("/auth/register")
async def register(payload: RegisterIn, response: Response):
    email = payload.email.lower().strip()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    doc = {
        "email": email,
        "name": payload.name,
        "role": payload.role or "student",
        "institution_id": payload.institution_id,
        "discipline": payload.discipline,
        "avatar": None,
        "creator_id": None,
        "password_hash": hash_password(payload.password),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    res = await db.users.insert_one(doc)
    user_id = str(res.inserted_id)
    access = create_access_token(user_id, email)
    refresh = create_refresh_token(user_id)
    set_auth_cookies(response, access, refresh)
    return {**_serialize_user({**doc, "_id": res.inserted_id}), "access_token": access}


@api.post("/auth/login")
async def login(payload: LoginIn, response: Response):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user_id = str(user["_id"])
    access = create_access_token(user_id, email)
    refresh = create_refresh_token(user_id)
    set_auth_cookies(response, access, refresh)
    return {**_serialize_user(user), "access_token": access}


@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"ok": True}


@api.get("/auth/me")
async def me(request: Request):
    user = await get_current_user_optional(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


@api.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh")
    user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    access = create_access_token(str(user["_id"]), user["email"])
    response.set_cookie("access_token", access, httponly=True, secure=True, samesite="none", max_age=6 * 3600, path="/")
    return {"ok": True}


# ---------- HELPERS ----------
def clean(doc):
    if not doc:
        return doc
    doc.pop("_id", None)
    doc.pop("password_hash", None)
    return doc


def clean_all(docs):
    return [clean(d) for d in docs]


# ---------- INSTITUTIONS ----------
@api.get("/institutions")
async def list_institutions():
    docs = await db.institutions.find({}).to_list(500)
    for d in docs:
        d["creator_count"] = await db.creators.count_documents({"institution_id": d["id"]})
        d["release_count"] = await db.albums.count_documents({"institution_id": d["id"]})
    return clean_all(docs)


@api.get("/institutions/{slug}")
async def get_institution(slug: str):
    inst = await db.institutions.find_one({"id": slug})
    if not inst:
        raise HTTPException(404, "Institution not found")
    creators = await db.creators.find({"institution_id": slug}).to_list(200)
    albums = await db.albums.find({"institution_id": slug}).sort("release_date", -1).to_list(50)
    videos = await db.videos.find({"institution_id": slug}).sort("release_date", -1).to_list(50)
    lives = await db.livestreams.find({"institution_id": slug}).to_list(20)
    faculty = [c for c in creators if c.get("role") == "faculty"]
    students = [c for c in creators if c.get("role") != "faculty"]
    return {
        "institution": clean(inst),
        "faculty": clean_all(faculty),
        "students": clean_all(students),
        "newest_releases": clean_all(albums[:12]),
        "featured_videos": clean_all(videos[:8]),
        "livestreams": clean_all(lives),
    }


# ---------- CREATORS ----------
@api.get("/creators")
async def list_creators(
    q: Optional[str] = None,
    institution: Optional[str] = None,
    country: Optional[str] = None,
    discipline: Optional[str] = None,
    limit: int = 60,
):
    query = {}
    if institution:
        query["institution_id"] = institution
    if country:
        query["country"] = country
    if discipline:
        query["discipline"] = discipline
    if q:
        query["$or"] = [
            {"name": {"$regex": re.escape(q), "$options": "i"}},
            {"handle": {"$regex": re.escape(q), "$options": "i"}},
        ]
    docs = await db.creators.find(query).limit(limit).to_list(limit)
    return clean_all(docs)


@api.get("/creators/{creator_id}")
async def get_creator(creator_id: str):
    c = await db.creators.find_one({"id": creator_id})
    if not c:
        raise HTTPException(404, "Creator not found")
    albums = await db.albums.find({"artist_id": creator_id}).sort("release_date", -1).to_list(50)
    videos = await db.videos.find({"artist_id": creator_id}).sort("release_date", -1).to_list(50)
    top_tracks = await db.tracks.find({"artist_id": creator_id}).sort("streams", -1).to_list(20)
    return {
        "creator": clean(c),
        "albums": clean_all(albums),
        "videos": clean_all(videos),
        "top_tracks": clean_all(top_tracks),
    }


# ---------- ALBUMS ----------
@api.get("/albums")
async def list_albums(limit: int = 40, sort: str = "release_date"):
    sort_field = "streams" if sort == "streams" else "release_date"
    docs = await db.albums.find({}).sort(sort_field, -1).limit(limit).to_list(limit)
    return clean_all(docs)


@api.get("/albums/{album_id}")
async def get_album(album_id: str):
    album = await db.albums.find_one({"id": album_id})
    if not album:
        raise HTTPException(404, "Album not found")
    tracks = await db.tracks.find({"album_id": album_id}).to_list(50)
    artist = await db.creators.find_one({"id": album["artist_id"]})
    return {"album": clean(album), "tracks": clean_all(tracks), "artist": clean(artist)}


# ---------- TRACKS ----------
@api.get("/tracks")
async def list_tracks(limit: int = 50, sort: str = "streams"):
    sort_field = "streams" if sort == "streams" else "release_date"
    docs = await db.tracks.find({}).sort(sort_field, -1).limit(limit).to_list(limit)
    return clean_all(docs)


@api.get("/tracks/{track_id}")
async def get_track(track_id: str):
    t = await db.tracks.find_one({"id": track_id})
    if not t:
        raise HTTPException(404, "Track not found")
    return clean(t)


# ---------- VIDEOS ----------
@api.get("/videos")
async def list_videos(kind: Optional[str] = None, limit: int = 40, sort: str = "views"):
    query = {}
    if kind:
        query["kind"] = kind
    sort_field = "views" if sort == "views" else "release_date"
    docs = await db.videos.find(query).sort(sort_field, -1).limit(limit).to_list(limit)
    return clean_all(docs)


@api.get("/videos/{video_id}")
async def get_video(video_id: str):
    v = await db.videos.find_one({"id": video_id})
    if not v:
        raise HTTPException(404, "Video not found")
    related = await db.videos.find({"id": {"$ne": video_id}}).sort("views", -1).limit(12).to_list(12)
    return {"video": clean(v), "related": clean_all(related)}


# ---------- PODCASTS ----------
@api.get("/podcasts")
async def list_podcasts():
    docs = await db.podcasts.find({}).to_list(60)
    return clean_all(docs)


# ---------- LIVESTREAMS ----------
@api.get("/livestreams")
async def list_livestreams():
    docs = await db.livestreams.find({}).to_list(60)
    return clean_all(docs)


@api.get("/livestreams/{live_id}")
async def get_livestream(live_id: str):
    d = await db.livestreams.find_one({"id": live_id})
    if not d:
        raise HTTPException(404, "Not found")
    return clean(d)


# ---------- PLAYLISTS ----------
@api.get("/playlists")
async def list_playlists(limit: int = 40):
    docs = await db.playlists.find({}).limit(limit).to_list(limit)
    return clean_all(docs)


@api.get("/playlists/{pid}")
async def get_playlist(pid: str):
    pl = await db.playlists.find_one({"id": pid})
    if not pl:
        raise HTTPException(404, "Not found")
    tracks = await db.tracks.find({"id": {"$in": pl.get("track_ids", [])}}).to_list(200)
    return {"playlist": clean(pl), "tracks": clean_all(tracks)}


# ---------- CHALLENGES ----------
@api.get("/challenges")
async def list_challenges():
    docs = await db.challenges.find({}).to_list(50)
    return clean_all(docs)


# ---------- EVENTS ----------
@api.get("/events")
async def list_events():
    docs = await db.events.find({}).to_list(50)
    return clean_all(docs)


# ---------- CHARTS ----------
@api.get("/charts/top-songs")
async def chart_top_songs(limit: int = 20):
    docs = await db.tracks.find({}).sort("streams", -1).limit(limit).to_list(limit)
    return clean_all(docs)


@api.get("/charts/top-videos")
async def chart_top_videos(limit: int = 20):
    docs = await db.videos.find({}).sort("views", -1).limit(limit).to_list(limit)
    return clean_all(docs)


@api.get("/charts/top-schools")
async def chart_top_schools():
    schools = await db.institutions.find({}).to_list(50)
    for s in schools:
        agg = await db.tracks.aggregate([
            {"$match": {"institution_id": s["id"]}},
            {"$group": {"_id": None, "streams": {"$sum": "$streams"}, "listeners": {"$sum": "$listeners"}}},
        ]).to_list(1)
        s["total_streams"] = agg[0]["streams"] if agg else 0
        s["total_listeners"] = agg[0]["listeners"] if agg else 0
        s["creator_count"] = await db.creators.count_documents({"institution_id": s["id"]})
    schools.sort(key=lambda x: x["total_streams"], reverse=True)
    return clean_all(schools)


@api.get("/charts/top-producers")
async def chart_top_producers(limit: int = 20):
    docs = await db.creators.find({"discipline": {"$in": ["Producer", "Beatmaker"]}}).sort("monthly_listeners", -1).limit(limit).to_list(limit)
    return clean_all(docs)


@api.get("/charts/top-artists")
async def chart_top_artists(limit: int = 20):
    docs = await db.creators.find({"role": "student"}).sort("monthly_listeners", -1).limit(limit).to_list(limit)
    return clean_all(docs)


@api.get("/charts/trending")
async def chart_trending():
    tracks = await db.tracks.find({}).sort("release_date", -1).limit(60).to_list(60)
    tracks.sort(key=lambda t: t["streams"], reverse=True)
    return clean_all(tracks[:20])


# ---------- DISCOVER & HOME ----------
@api.get("/discover")
async def discover():
    trending_tracks = await db.tracks.find({}).sort("streams", -1).limit(12).to_list(12)
    trending_videos = await db.videos.find({}).sort("views", -1).limit(8).to_list(8)
    new_releases = await db.albums.find({}).sort("release_date", -1).limit(10).to_list(10)
    faculty_picks = await db.playlists.find({"kind": "faculty"}).to_list(6)
    institutions = await db.institutions.find({}).limit(12).to_list(12)
    return {
        "trending_tracks": clean_all(trending_tracks),
        "trending_videos": clean_all(trending_videos),
        "new_releases": clean_all(new_releases),
        "faculty_picks": clean_all(faculty_picks),
        "institutions": clean_all(institutions),
    }


@api.get("/discover-feed")
async def discover_feed():
    """Rich Global Discover Feed shelves for the ANCRMEDIA home screen."""
    now = datetime.now(timezone.utc)
    live_now = await db.livestreams.find({"is_live_now": True}).to_list(10)
    upcoming_live = await db.livestreams.find({"is_live_now": False}).sort("starts_at", 1).to_list(8)
    trending_tracks = await db.tracks.find({}).sort("streams", -1).limit(12).to_list(12)
    new_releases = await db.albums.find({}).sort("release_date", -1).limit(10).to_list(10)
    latest_videos = await db.videos.find({}).sort("release_date", -1).limit(10).to_list(10)
    masterclasses = await db.videos.find({"kind": "Masterclass"}).limit(8).to_list(8)
    documentaries = await db.videos.find({"kind": {"$in": ["Documentary", "Short Film"]}}).limit(8).to_list(8)
    students = await db.creators.find({"role": "student"}).sort("monthly_listeners", -1).limit(6).to_list(6)
    faculty = await db.creators.find({"role": "faculty"}).limit(4).to_list(4)
    events = await db.events.find({}).sort("starts_at", 1).to_list(8)
    playlists = await db.playlists.find({}).limit(6).to_list(6)
    # Recommended = mix top-streamed tracks + trending videos (AIAH placeholder)
    recommended_tracks = await db.tracks.find({}).sort("streams", -1).skip(6).limit(6).to_list(6)
    recommended_videos = await db.videos.find({}).sort("views", -1).skip(4).limit(4).to_list(4)
    return {
        "hero_album": clean((await db.albums.find({}).sort("streams", -1).limit(1).to_list(1))[0]) if await db.albums.count_documents({}) else None,
        "live_now": clean_all(live_now),
        "upcoming_live": clean_all(upcoming_live),
        "trending_tracks": clean_all(trending_tracks),
        "new_releases": clean_all(new_releases),
        "latest_videos": clean_all(latest_videos),
        "masterclasses": clean_all(masterclasses),
        "documentaries": clean_all(documentaries),
        "student_spotlights": clean_all(students),
        "faculty_features": clean_all(faculty),
        "events": clean_all(events),
        "playlists": clean_all(playlists),
        "recommended_tracks": clean_all(recommended_tracks),
        "recommended_videos": clean_all(recommended_videos),
    }


@api.get("/home")
async def home_feed():
    hero_album = await db.albums.find({}).sort("streams", -1).limit(1).to_list(1)
    new_releases = await db.albums.find({}).sort("release_date", -1).limit(12).to_list(12)
    trending_tracks = await db.tracks.find({}).sort("streams", -1).limit(10).to_list(10)
    live_now = await db.livestreams.find({"is_live_now": True}).to_list(10)
    upcoming_live = await db.livestreams.find({"is_live_now": False}).limit(6).to_list(6)
    videos = await db.videos.find({}).sort("release_date", -1).limit(8).to_list(8)
    playlists = await db.playlists.find({}).limit(6).to_list(6)
    challenge = await db.challenges.find({}).limit(1).to_list(1)
    return {
        "hero_album": clean(hero_album[0]) if hero_album else None,
        "new_releases": clean_all(new_releases),
        "trending_tracks": clean_all(trending_tracks),
        "live_now": clean_all(live_now),
        "upcoming_live": clean_all(upcoming_live),
        "videos": clean_all(videos),
        "playlists": clean_all(playlists),
        "featured_challenge": clean(challenge[0]) if challenge else None,
    }


# ---------- WORLD MAP ----------
@api.get("/world")
async def world_map():
    institutions = await db.institutions.find({}).to_list(100)
    nodes = []
    for i in institutions:
        creator_count = await db.creators.count_documents({"institution_id": i["id"]})
        release_count = await db.albums.count_documents({"institution_id": i["id"]})
        nodes.append({
            "id": i["id"],
            "name": i["name"],
            "city": i["city"],
            "country": i["country"],
            "flag": i["flag"],
            "coords": i["coords"],
            "creators": creator_count,
            "releases": release_count,
        })
    countries = {}
    for n in nodes:
        c = n["country"]
        if c not in countries:
            countries[c] = {"country": c, "flag": n["flag"], "creators": 0, "releases": 0, "cities": set()}
        countries[c]["creators"] += n["creators"]
        countries[c]["releases"] += n["releases"]
        countries[c]["cities"].add(n["city"])
    for c in countries.values():
        c["cities"] = sorted(list(c["cities"]))
    return {"nodes": nodes, "countries": list(countries.values())}


# ---------- GENRES ----------
@api.get("/genres")
async def list_genres():
    from seed_data import GENRES
    out = []
    for g in GENRES:
        count = await db.tracks.count_documents({"genres": g})
        out.append({"name": g, "track_count": count})
    return out


@api.get("/genres/{name}")
async def get_genre(name: str):
    tracks = await db.tracks.find({"genres": name}).sort("streams", -1).limit(30).to_list(30)
    creators_ids = list({t["artist_id"] for t in tracks})
    creators = await db.creators.find({"id": {"$in": creators_ids}}).to_list(60)
    return {"name": name, "tracks": clean_all(tracks), "creators": clean_all(creators)}


# ---------- SEARCH ----------
@api.get("/search")
async def search(q: str = Query(min_length=1)):
    rx = {"$regex": re.escape(q), "$options": "i"}
    creators = await db.creators.find({"$or": [{"name": rx}, {"handle": rx}]}).limit(10).to_list(10)
    albums = await db.albums.find({"title": rx}).limit(10).to_list(10)
    tracks = await db.tracks.find({"title": rx}).limit(10).to_list(10)
    videos = await db.videos.find({"title": rx}).limit(10).to_list(10)
    institutions = await db.institutions.find({"$or": [{"name": rx}, {"city": rx}, {"country": rx}]}).limit(10).to_list(10)
    playlists = await db.playlists.find({"title": rx}).limit(10).to_list(10)
    return {
        "creators": clean_all(creators),
        "albums": clean_all(albums),
        "tracks": clean_all(tracks),
        "videos": clean_all(videos),
        "institutions": clean_all(institutions),
        "playlists": clean_all(playlists),
    }


# ---------- LIBRARY ----------
class TargetIn(BaseModel):
    target_type: str
    target_id: str


@api.post("/library/toggle")
async def toggle_library(payload: TargetIn, user: dict = Depends(get_current_user)):
    key = {"user_id": user["id"], "target_type": payload.target_type, "target_id": payload.target_id}
    existing = await db.library.find_one(key)
    if existing:
        await db.library.delete_one(key)
        return {"active": False}
    await db.library.insert_one({**key, "created_at": datetime.now(timezone.utc).isoformat()})
    return {"active": True}


@api.get("/library")
async def get_library(request: Request):
    user = await get_current_user_optional(request)
    if not user:
        return {"tracks": [], "albums": [], "videos": [], "playlists": [], "creators": []}
    items = await db.library.find({"user_id": user["id"]}).to_list(500)

    def ids(t):
        return [i["target_id"] for i in items if i["target_type"] == t]

    tracks = await db.tracks.find({"id": {"$in": ids("track")}}).to_list(200)
    albums = await db.albums.find({"id": {"$in": ids("album")}}).to_list(200)
    videos = await db.videos.find({"id": {"$in": ids("video")}}).to_list(200)
    playlists = await db.playlists.find({"id": {"$in": ids("playlist")}}).to_list(200)
    creators = await db.creators.find({"id": {"$in": ids("creator")}}).to_list(200)
    return {
        "tracks": clean_all(tracks),
        "albums": clean_all(albums),
        "videos": clean_all(videos),
        "playlists": clean_all(playlists),
        "creators": clean_all(creators),
    }


# ---------- ANALYTICS ----------
@api.get("/analytics/me")
async def analytics_me(user: dict = Depends(get_current_user)):
    creator_id = user.get("creator_id")
    if not creator_id:
        creator = await db.creators.find_one({"role": "student"})
        creator_id = creator["id"] if creator else None
    if not creator_id:
        raise HTTPException(404, "No creator linked")
    creator = await db.creators.find_one({"id": creator_id})
    tracks = await db.tracks.find({"artist_id": creator_id}).to_list(200)
    videos = await db.videos.find({"artist_id": creator_id}).to_list(200)
    total_streams = sum(t.get("streams", 0) for t in tracks)
    total_listeners = sum(t.get("listeners", 0) for t in tracks)
    total_views = sum(v.get("views", 0) for v in videos)
    total_watch = sum(v.get("watch_time_hours", 0) for v in videos)
    import math
    base = max(total_streams // 24, 400)
    series = []
    for i in range(12):
        val = int(base * (1 + 0.08 * i) * (1 + 0.15 * math.sin(i / 2.0)))
        series.append({"week": f"W{i+1}", "streams": val, "views": val // 3})
    countries = ["USA", "UK", "Japan", "Brazil", "Nigeria", "Kenya", "Jamaica", "Canada", "Australia", "Germany", "France", "Mexico"]
    country_series = [{"country": c, "streams": int(base * (1 + i * 0.2) / 8) + 400} for i, c in enumerate(countries)]
    schools_reached = [{"name": s["name"], "streams": int(total_streams / 10 + s["students_count"])} for s in (await db.institutions.find({}).limit(8).to_list(8))]
    return {
        "creator": clean(creator),
        "kpis": {
            "streams": total_streams,
            "listeners": total_listeners,
            "views": total_views,
            "watch_hours": total_watch,
            "followers": creator.get("followers", 0),
            "revenue_estimate_usd": int(total_streams * 0.0038 + total_views * 0.0021),
        },
        "growth_series": series,
        "country_series": country_series,
        "schools_reached": schools_reached,
    }


@api.get("/")
async def root():
    return {"service": "ANCRMEDIA", "version": "1.0.0"}


app.include_router(api)

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origin_regex=".*",
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")


@app.on_event("shutdown")
async def shutdown():
    client.close()
