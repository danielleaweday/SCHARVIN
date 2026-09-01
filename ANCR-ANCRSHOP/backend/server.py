from dotenv import load_dotenv
from pathlib import Path
load_dotenv(Path(__file__).parent / ".env")

import os
import logging
from fastapi import FastAPI, APIRouter
from starlette.middleware.cors import CORSMiddleware

from db import db
import auth as auth_mod
import catalog as catalog_mod
import commerce as commerce_mod
import payments as payments_mod
import aiah as aiah_mod
import admin as admin_mod
from seed import seed_catalog, refresh_campaigns

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("ancrshop")

app = FastAPI(title="ANCRSHOP API")

health = APIRouter(prefix="/api")


@health.get("/")
async def root():
    return {"message": "ANCRSHOP API online", "status": "ok"}


app.include_router(health)
app.include_router(auth_mod.router)
app.include_router(catalog_mod.router)
app.include_router(commerce_mod.router)
app.include_router(payments_mod.router)
app.include_router(aiah_mod.router)
app.include_router(admin_mod.router)

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.products.create_index("slug", unique=True)
    await db.products.create_index("department")
    await db.orders.create_index("order_number", unique=True)
    await auth_mod.seed_admin()
    await seed_catalog()
    await refresh_campaigns()
    logger.info("ANCRSHOP startup complete")


@app.on_event("shutdown")
async def shutdown():
    from db import client
    client.close()
