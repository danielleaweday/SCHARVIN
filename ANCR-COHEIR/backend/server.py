"""COHEIR™ FastAPI server."""
from __future__ import annotations
import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from auth import router as auth_router
from aiah import router as aiah_router
from routes import router as domain_router
from uploads import router as uploads_router, init_storage
from share_kits import router as share_router
from providers import router as providers_router
from analytics import router as analytics_router
from seed_data import build_all

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
log = logging.getLogger("coheir")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]


@asynccontextmanager
async def lifespan(app: FastAPI):
    client = AsyncIOMotorClient(MONGO_URL)
    app.state.mongo_client = client
    app.state.db = client[DB_NAME]

    # Seed if empty
    users_count = await app.state.db.users.count_documents({})
    if users_count == 0:
        log.info("Seeding COHEIR demo dataset…")
        data = build_all()
        for coll, docs in data.items():
            if docs:
                await app.state.db[coll].insert_many([{**d} for d in docs])
        log.info("Seed complete: users=%d, cohorts=%d, sessions=%d",
                 len(data["users"]), len(data["cohorts"]), len(data["sessions"]))

    # helpful indexes
    await app.state.db.users.create_index("user_id", unique=True)
    await app.state.db.users.create_index("email", unique=True)
    await app.state.db.user_sessions.create_index("session_token", unique=True)
    await app.state.db.share_kits.create_index("slug", unique=True)

    # Warm object storage
    init_storage()

    yield
    client.close()


app = FastAPI(title="COHEIR™ API", lifespan=lifespan)

api = APIRouter(prefix="/api")


@api.get("/")
async def root():
    return {"app": "COHEIR™", "tagline": "Lead. Mentor. Develop. Launch."}


@api.get("/healthz")
async def healthz():
    return {"ok": True}


api.include_router(auth_router)
api.include_router(aiah_router)
api.include_router(domain_router)
api.include_router(uploads_router)
api.include_router(share_router)
api.include_router(providers_router)
api.include_router(analytics_router)

app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
