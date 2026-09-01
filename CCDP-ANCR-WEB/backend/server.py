from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Logging (configurable; INFO by default, set LOG_LEVEL=WARNING in production)
logging.basicConfig(
    level=getattr(logging, os.environ.get('LOG_LEVEL', 'INFO').upper(), logging.INFO),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger("ccdp")

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="CCDP Institutional Platform API")
api_router = APIRouter(prefix="/api")


@api_router.get("/health")
async def health():
    return {"status": "ok"}


# Feature routers
from inquiries import register_inquiry_routes
from auth import register_auth_routes, seed_admin
from store import register_store_routes
import store_inventory

app.include_router(register_inquiry_routes(db))
app.include_router(register_auth_routes(db))
_store_router, _store_webhook_router = register_store_routes(db)
app.include_router(_store_router)
app.include_router(_store_webhook_router)
app.include_router(api_router)


@app.on_event("startup")
async def _startup():
    await seed_admin(db)
    await db.inquiries.create_index("id")
    await db.inquiries.create_index("email")
    await db.admins.create_index("email", unique=True)
    await db.store_customers.create_index("email", unique=True)
    await db.store_customers.create_index("user_id", unique=True)
    await db.store_orders.create_index("order_id", unique=True)
    await db.store_orders.create_index("session_id")
    await db.store_orders.create_index("user_id")
    await db.store_inventory.create_index("sku", unique=True)
    await db.store_inventory.create_index("productId")
    await store_inventory.seed(db)


@app.on_event("shutdown")
async def _shutdown():
    client.close()


app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
