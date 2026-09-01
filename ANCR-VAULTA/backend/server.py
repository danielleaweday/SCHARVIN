"""
Vaulta™ — The Financial Operating System of the ANCR Ecosystem.
FastAPI backend with JWT auth, MongoDB, and Claude Sonnet 4.5 for AIAH.
"""
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import logging
import uuid
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Any, Dict

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

from vaulta_seed import seed_demo_data, DEMO_USERS
from vaulta_aiah import stream_aiah_response
from vaulta_v2 import seed_grants_and_projects

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
ACCESS_TTL_MIN = 60 * 24  # 1 day for demo comfort
REFRESH_TTL_DAYS = 30

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Vaulta API", version="1.0.0")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
log = logging.getLogger("vaulta")

# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False

def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id, "email": email, "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TTL_MIN),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=REFRESH_TTL_DAYS),
        "type": "refresh",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def set_auth_cookies(response: Response, access: str, refresh: str) -> None:
    response.set_cookie("access_token", access, httponly=True, secure=False,
                        samesite="lax", max_age=ACCESS_TTL_MIN * 60, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=False,
                        samesite="lax", max_age=REFRESH_TTL_DAYS * 86400, path="/")

def clear_auth_cookies(response: Response) -> None:
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")

async def get_current_user(request: Request) -> Dict[str, Any]:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(401, "Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(401, "User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")

# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
VAULTA_ROLES = {
    "Student", "Faculty", "Artist", "Manager", "Accountant",
    "Attorney", "Publisher", "Administrator", "Employer", "Institution",
}

class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str
    role: str = "Artist"

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class TransactionIn(BaseModel):
    type: str  # income | expense
    category: str
    subcategory: Optional[str] = None
    amount: float
    currency: str = "USD"
    date: str
    description: Optional[str] = None
    client: Optional[str] = None
    tags: List[str] = []

class InvoiceIn(BaseModel):
    client_name: str
    client_email: Optional[str] = None
    amount: float
    currency: str = "USD"
    due_date: str
    status: str = "Pending"
    line_items: List[Dict[str, Any]] = []
    notes: Optional[str] = None

class ContractIn(BaseModel):
    title: str
    type: str
    counterparty: str
    value: float
    currency: str = "USD"
    status: str = "Draft"
    signed_date: Optional[str] = None
    expiration_date: Optional[str] = None
    notes: Optional[str] = None

class BudgetIn(BaseModel):
    name: str
    type: str  # Monthly | Tour | Album | Project | Film | Writing Camp | Grant | Department | Savings
    total_amount: float
    spent: float = 0
    currency: str = "USD"
    period_start: Optional[str] = None
    period_end: Optional[str] = None
    notes: Optional[str] = None

class VaultDocIn(BaseModel):
    name: str
    category: str
    size_kb: int = 0
    tags: List[str] = []
    notes: Optional[str] = None

class AIAHMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------
@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.transactions.create_index([("owner_id", 1), ("date", -1)])
    await db.invoices.create_index("owner_id")
    await db.contracts.create_index("owner_id")
    await db.budgets.create_index("owner_id")
    await db.royalties.create_index("owner_id")
    await db.songs.create_index("owner_id")
    await db.vault_docs.create_index("owner_id")
    await db.funding_opportunities.create_index("category")

    # Seed admin + demo users
    await seed_users_and_data()
    log.info("Vaulta backend ready.")

async def seed_users_and_data():
    demo_password = "Vaulta2026!"
    seeded_user_ids = {}

    admin_email = os.environ["ADMIN_EMAIL"]
    admin_pw = os.environ["ADMIN_PASSWORD"]
    existing_admin = await db.users.find_one({"email": admin_email})
    if not existing_admin:
        admin_id = str(uuid.uuid4())
        await db.users.insert_one({
            "id": admin_id, "email": admin_email,
            "password_hash": hash_password(admin_pw),
            "name": "Aaron Ancrum", "role": "Administrator",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        seeded_user_ids["Administrator"] = admin_id

    for role, meta in DEMO_USERS.items():
        existing = await db.users.find_one({"email": meta["email"]})
        if existing:
            seeded_user_ids[role] = existing["id"]
            continue
        uid = str(uuid.uuid4())
        await db.users.insert_one({
            "id": uid, "email": meta["email"],
            "password_hash": hash_password(demo_password),
            "name": meta["name"], "role": role,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        seeded_user_ids[role] = uid

    # Seed rich data for the Artist demo (primary showcase)
    artist_id = seeded_user_ids.get("Artist")
    if artist_id:
        already = await db.transactions.find_one({"owner_id": artist_id})
        if not already:
            await seed_demo_data(db, artist_id)
            log.info("Seeded artist demo data.")
        # V2: grants + projects (idempotent)
        await seed_grants_and_projects(db, artist_id)
        log.info("Seeded grants & projects.")

# ---------------------------------------------------------------------------
# Auth routes
# ---------------------------------------------------------------------------
@api.post("/auth/register")
async def register(payload: RegisterIn, response: Response):
    role = payload.role if payload.role in VAULTA_ROLES else "Artist"
    email = payload.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(400, "Email already registered")
    uid = str(uuid.uuid4())
    doc = {
        "id": uid, "email": email, "name": payload.name,
        "password_hash": hash_password(payload.password),
        "role": role,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)
    access = create_access_token(uid, email, role)
    refresh = create_refresh_token(uid)
    set_auth_cookies(response, access, refresh)
    return {"id": uid, "email": email, "name": payload.name, "role": role}

@api.post("/auth/login")
async def login(payload: LoginIn, response: Response):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(401, "Invalid email or password")
    access = create_access_token(user["id"], email, user["role"])
    refresh = create_refresh_token(user["id"])
    set_auth_cookies(response, access, refresh)
    return {"id": user["id"], "email": email, "name": user["name"], "role": user["role"]}

@api.post("/auth/logout")
async def logout(response: Response):
    clear_auth_cookies(response)
    return {"ok": True}

@api.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return user

@api.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(401, "No refresh token")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(401, "Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]})
        if not user:
            raise HTTPException(401, "User not found")
        access = create_access_token(user["id"], user["email"], user["role"])
        set_auth_cookies(response, access, token)
        return {"ok": True}
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid refresh token")

# ---------------------------------------------------------------------------
# Data helpers
# ---------------------------------------------------------------------------
async def owner_id_for(user: dict) -> str:
    """Every non-artist demo role reads from the artist showcase dataset."""
    if user["role"] == "Artist":
        return user["id"]
    artist = await db.users.find_one({"role": "Artist"})
    return artist["id"] if artist else user["id"]

def strip_id(doc):
    if doc and "_id" in doc:
        doc.pop("_id", None)
    return doc

# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------
@api.get("/dashboard/overview")
async def dashboard_overview(user=Depends(get_current_user)):
    oid = await owner_id_for(user)
    txns = await db.transactions.find({"owner_id": oid}, {"_id": 0}).to_list(5000)
    invoices = await db.invoices.find({"owner_id": oid}, {"_id": 0}).to_list(1000)
    royalties = await db.royalties.find({"owner_id": oid}, {"_id": 0}).to_list(1000)

    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1).isoformat()[:10]

    income_total = sum(t["amount"] for t in txns if t["type"] == "income")
    expense_total = sum(t["amount"] for t in txns if t["type"] == "expense")
    monthly_income = sum(t["amount"] for t in txns if t["type"] == "income" and t["date"] >= month_start)
    monthly_expense = sum(t["amount"] for t in txns if t["type"] == "expense" and t["date"] >= month_start)

    outstanding = sum(i["amount"] for i in invoices if i["status"] in ("Pending", "Late"))
    royalties_pending = sum(r["amount"] for r in royalties if r["status"] == "Pending")
    publishing_income = sum(t["amount"] for t in txns if t.get("category") == "Publishing" and t["type"] == "income")

    net_worth = income_total - expense_total + 42500  # includes cash + investments
    cash_available = max(0, net_worth - 12000)

    # Business health = normalized composite
    health = min(100, int(50 + (monthly_income - monthly_expense) / 200))
    tax_readiness = 72

    # Chart: 12-month income vs expense
    monthly = {}
    for t in txns:
        key = t["date"][:7]
        monthly.setdefault(key, {"income": 0, "expense": 0})
        monthly[key][t["type"]] += t["amount"]
    chart = [{"month": k, **v} for k, v in sorted(monthly.items())[-12:]]

    # Recent transactions
    recent = sorted(txns, key=lambda x: x["date"], reverse=True)[:8]

    upcoming_payments = [
        {"name": i["client_name"], "amount": i["amount"], "due_date": i["due_date"], "type": "Invoice"}
        for i in invoices if i["status"] == "Pending"
    ][:6]

    return {
        "net_worth": net_worth,
        "cash_available": cash_available,
        "monthly_revenue": monthly_income,
        "monthly_expense": monthly_expense,
        "projected_income": int(monthly_income * 1.18),
        "outstanding_invoices": outstanding,
        "royalties_pending": royalties_pending,
        "publishing_income": publishing_income,
        "business_health_score": health,
        "tax_readiness": tax_readiness,
        "income_total": income_total,
        "expense_total": expense_total,
        "chart": chart,
        "recent_transactions": recent,
        "upcoming_payments": upcoming_payments,
    }

# ---------------------------------------------------------------------------
# Transactions (Income + Expenses share this collection)
# ---------------------------------------------------------------------------
@api.get("/transactions")
async def list_transactions(type: Optional[str] = None, user=Depends(get_current_user)):
    oid = await owner_id_for(user)
    q = {"owner_id": oid}
    if type:
        q["type"] = type
    items = await db.transactions.find(q, {"_id": 0}).sort("date", -1).to_list(2000)
    return items

@api.post("/transactions")
async def create_transaction(payload: TransactionIn, user=Depends(get_current_user)):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["owner_id"] = user["id"]
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.transactions.insert_one(doc)
    strip_id(doc)
    return doc

@api.delete("/transactions/{tid}")
async def delete_transaction(tid: str, user=Depends(get_current_user)):
    await db.transactions.delete_one({"id": tid, "owner_id": user["id"]})
    return {"ok": True}

@api.get("/income/summary")
async def income_summary(user=Depends(get_current_user)):
    oid = await owner_id_for(user)
    items = await db.transactions.find({"owner_id": oid, "type": "income"}, {"_id": 0}).to_list(5000)
    by_cat = {}
    for i in items:
        by_cat.setdefault(i["category"], 0)
        by_cat[i["category"]] += i["amount"]
    total = sum(by_cat.values())
    breakdown = [{"category": k, "amount": v, "pct": round((v / total * 100), 1) if total else 0}
                 for k, v in sorted(by_cat.items(), key=lambda x: -x[1])]
    return {"total": total, "by_category": breakdown, "items": items}

@api.get("/expenses/summary")
async def expenses_summary(user=Depends(get_current_user)):
    oid = await owner_id_for(user)
    items = await db.transactions.find({"owner_id": oid, "type": "expense"}, {"_id": 0}).to_list(5000)
    by_cat = {}
    for i in items:
        by_cat.setdefault(i["category"], 0)
        by_cat[i["category"]] += i["amount"]
    total = sum(by_cat.values())
    breakdown = [{"category": k, "amount": v, "pct": round((v / total * 100), 1) if total else 0}
                 for k, v in sorted(by_cat.items(), key=lambda x: -x[1])]
    return {"total": total, "by_category": breakdown, "items": items}

# ---------------------------------------------------------------------------
# Royalties
# ---------------------------------------------------------------------------
@api.get("/royalties")
async def list_royalties(user=Depends(get_current_user)):
    oid = await owner_id_for(user)
    items = await db.royalties.find({"owner_id": oid}, {"_id": 0}).to_list(1000)

    # Group by PRO
    by_pro = {}
    for r in items:
        by_pro.setdefault(r["pro"], {"pro": r["pro"], "amount": 0, "count": 0, "pending": 0})
        by_pro[r["pro"]]["amount"] += r["amount"]
        by_pro[r["pro"]]["count"] += 1
        if r["status"] == "Pending":
            by_pro[r["pro"]]["pending"] += r["amount"]

    total_paid = sum(r["amount"] for r in items if r["status"] == "Paid")
    total_pending = sum(r["amount"] for r in items if r["status"] == "Pending")
    estimated_next = int(total_pending * 0.9)

    return {
        "total_paid": total_paid,
        "total_pending": total_pending,
        "estimated_next_quarter": estimated_next,
        "by_pro": list(by_pro.values()),
        "items": items,
    }

# ---------------------------------------------------------------------------
# Publishing (Songs)
# ---------------------------------------------------------------------------
@api.get("/publishing/songs")
async def list_songs(user=Depends(get_current_user)):
    oid = await owner_id_for(user)
    items = await db.songs.find({"owner_id": oid}, {"_id": 0}).to_list(1000)
    return items

# ---------------------------------------------------------------------------
# Contracts
# ---------------------------------------------------------------------------
@api.get("/contracts")
async def list_contracts(user=Depends(get_current_user)):
    oid = await owner_id_for(user)
    items = await db.contracts.find({"owner_id": oid}, {"_id": 0}).to_list(1000)
    return items

@api.post("/contracts")
async def create_contract(payload: ContractIn, user=Depends(get_current_user)):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["owner_id"] = user["id"]
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.contracts.insert_one(doc)
    strip_id(doc)
    return doc

# ---------------------------------------------------------------------------
# Invoices
# ---------------------------------------------------------------------------
@api.get("/invoices")
async def list_invoices(user=Depends(get_current_user)):
    oid = await owner_id_for(user)
    items = await db.invoices.find({"owner_id": oid}, {"_id": 0}).to_list(1000)
    return items

@api.post("/invoices")
async def create_invoice(payload: InvoiceIn, user=Depends(get_current_user)):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["invoice_number"] = f"VLT-{datetime.now(timezone.utc).strftime('%Y%m')}-{str(uuid.uuid4())[:6].upper()}"
    doc["owner_id"] = user["id"]
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.invoices.insert_one(doc)
    strip_id(doc)
    return doc

@api.patch("/invoices/{iid}/status")
async def update_invoice_status(iid: str, body: Dict[str, str], user=Depends(get_current_user)):
    await db.invoices.update_one({"id": iid}, {"$set": {"status": body.get("status", "Pending")}})
    return {"ok": True}

# ---------------------------------------------------------------------------
# Budgets
# ---------------------------------------------------------------------------
@api.get("/budgets")
async def list_budgets(user=Depends(get_current_user)):
    oid = await owner_id_for(user)
    items = await db.budgets.find({"owner_id": oid}, {"_id": 0}).to_list(1000)
    return items

@api.post("/budgets")
async def create_budget(payload: BudgetIn, user=Depends(get_current_user)):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["owner_id"] = user["id"]
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.budgets.insert_one(doc)
    strip_id(doc)
    return doc

# ---------------------------------------------------------------------------
# Taxes
# ---------------------------------------------------------------------------
@api.get("/taxes/overview")
async def taxes_overview(user=Depends(get_current_user)):
    oid = await owner_id_for(user)
    txns = await db.transactions.find({"owner_id": oid}, {"_id": 0}).to_list(5000)
    income = sum(t["amount"] for t in txns if t["type"] == "income")
    deductions = sum(t["amount"] for t in txns if t["type"] == "expense")
    taxable_income = max(0, income - deductions)
    est_tax = int(taxable_income * 0.24)
    quarters = [
        {"quarter": "Q1", "due": "Apr 15", "amount": int(est_tax * 0.25), "status": "Paid"},
        {"quarter": "Q2", "due": "Jun 15", "amount": int(est_tax * 0.25), "status": "Paid"},
        {"quarter": "Q3", "due": "Sep 15", "amount": int(est_tax * 0.25), "status": "Pending"},
        {"quarter": "Q4", "due": "Jan 15", "amount": int(est_tax * 0.25), "status": "Upcoming"},
    ]
    deductions_by_cat = {}
    for t in txns:
        if t["type"] == "expense":
            deductions_by_cat.setdefault(t["category"], 0)
            deductions_by_cat[t["category"]] += t["amount"]

    return {
        "total_income": income,
        "total_deductions": deductions,
        "taxable_income": taxable_income,
        "estimated_tax": est_tax,
        "tax_readiness_score": 72,
        "quarterly_payments": quarters,
        "deductions_by_category": [{"category": k, "amount": v} for k, v in sorted(deductions_by_cat.items(), key=lambda x: -x[1])],
        "forms": [
            {"form": "1099-NEC", "count": 6, "status": "Received"},
            {"form": "1099-MISC", "count": 3, "status": "Received"},
            {"form": "W-2", "count": 1, "status": "Received"},
            {"form": "K-1", "count": 1, "status": "Pending"},
        ],
    }

# ---------------------------------------------------------------------------
# Business
# ---------------------------------------------------------------------------
@api.get("/business/profile")
async def business_profile(user=Depends(get_current_user)):
    return {
        "entities": [
            {"name": "Sable Row Music LLC", "type": "LLC", "state": "Delaware",
             "ein": "88-4127934", "status": "Active", "formed": "2022-08-14"},
            {"name": "Sable Row Publishing", "type": "DBA", "state": "Delaware",
             "ein": "—", "status": "Active", "formed": "2023-02-01"},
            {"name": "The Ancrum Foundation", "type": "Nonprofit 501(c)(3)",
             "state": "New York", "ein": "92-7418205", "status": "Active", "formed": "2024-01-11"},
        ],
        "licenses": [
            {"name": "NY Business Certificate", "expires": "2027-08-14", "status": "Active"},
            {"name": "ASCAP Publisher License", "expires": "2026-12-31", "status": "Active"},
            {"name": "Music Publishers Membership", "expires": "2026-06-30", "status": "Active"},
        ],
        "bank_accounts": [
            {"bank": "Mercury", "name": "Sable Row — Operating", "type": "Checking", "balance": 84210.11},
            {"bank": "Mercury", "name": "Sable Row — Tax Reserve", "type": "Savings", "balance": 42800.00},
            {"bank": "Chase for Business", "name": "Foundation Grants", "type": "Checking", "balance": 128200.55},
        ],
        "credit_cards": [
            {"issuer": "Amex Business Platinum", "last4": "1004", "balance": 8432.10, "limit": 40000},
            {"issuer": "Ramp Corporate", "last4": "8871", "balance": 2140.55, "limit": 25000},
        ],
        "credit_score": 792,
        "insurance": [
            {"policy": "General Liability", "carrier": "Hiscox", "premium": 1400, "status": "Active"},
            {"policy": "Instrument & Gear", "carrier": "Clarion", "premium": 890, "status": "Active"},
        ],
        "compliance": [
            {"item": "Annual Report — Sable Row LLC", "due": "2026-06-30", "status": "Upcoming"},
            {"item": "Foundation 990 Filing", "due": "2026-05-15", "status": "In Prep"},
            {"item": "State Franchise Tax", "due": "2026-03-01", "status": "Upcoming"},
        ],
    }

# ---------------------------------------------------------------------------
# Funding
# ---------------------------------------------------------------------------
@api.get("/funding/opportunities")
async def funding_opps(user=Depends(get_current_user)):
    items = await db.funding_opportunities.find({}, {"_id": 0}).to_list(500)
    if not items:
        return {"opportunities": [], "applications": []}
    oid = await owner_id_for(user)
    apps = await db.funding_applications.find({"owner_id": oid}, {"_id": 0}).to_list(500)
    return {"opportunities": items, "applications": apps}

# ---------------------------------------------------------------------------
# Reports
# ---------------------------------------------------------------------------
@api.get("/reports/pnl")
async def pnl_report(user=Depends(get_current_user)):
    oid = await owner_id_for(user)
    txns = await db.transactions.find({"owner_id": oid}, {"_id": 0}).to_list(5000)
    income_by_cat = {}
    expense_by_cat = {}
    for t in txns:
        target = income_by_cat if t["type"] == "income" else expense_by_cat
        target.setdefault(t["category"], 0)
        target[t["category"]] += t["amount"]
    total_income = sum(income_by_cat.values())
    total_expense = sum(expense_by_cat.values())
    return {
        "income": [{"category": k, "amount": v} for k, v in sorted(income_by_cat.items(), key=lambda x: -x[1])],
        "expense": [{"category": k, "amount": v} for k, v in sorted(expense_by_cat.items(), key=lambda x: -x[1])],
        "total_income": total_income,
        "total_expense": total_expense,
        "net_profit": total_income - total_expense,
    }

@api.get("/reports/cashflow")
async def cashflow_report(user=Depends(get_current_user)):
    oid = await owner_id_for(user)
    txns = await db.transactions.find({"owner_id": oid}, {"_id": 0}).to_list(5000)
    monthly = {}
    for t in txns:
        key = t["date"][:7]
        monthly.setdefault(key, {"income": 0, "expense": 0})
        monthly[key][t["type"]] += t["amount"]
    series = [{"month": k, **v, "net": v["income"] - v["expense"]} for k, v in sorted(monthly.items())]
    return {"series": series}

# ---------------------------------------------------------------------------
# Vault
# ---------------------------------------------------------------------------
@api.get("/vault/documents")
async def list_vault(user=Depends(get_current_user)):
    oid = await owner_id_for(user)
    return await db.vault_docs.find({"owner_id": oid}, {"_id": 0}).to_list(500)

@api.post("/vault/documents")
async def create_vault(payload: VaultDocIn, user=Depends(get_current_user)):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["owner_id"] = user["id"]
    doc["uploaded_at"] = datetime.now(timezone.utc).isoformat()
    doc["encrypted"] = True
    await db.vault_docs.insert_one(doc)
    strip_id(doc)
    return doc

# ---------------------------------------------------------------------------
# Ecosystem Integrations
# ---------------------------------------------------------------------------
@api.get("/ecosystem/status")
async def ecosystem_status(user=Depends(get_current_user)):
    return [
        {"name": "ANCRID", "tagline": "Verified Creator Identity", "status": "Connected", "detail": "Identity verified · Passport level 3"},
        {"name": "INHEIRA", "tagline": "Publishing & Splits Registry", "status": "Connected", "detail": "42 registered songs · 18 with sync clearance"},
        {"name": "COHEIR", "tagline": "Mentorship Network", "status": "Connected", "detail": "Mentor: Nia Whitfield · 6 sessions logged"},
        {"name": "ANCRLAB", "tagline": "Project Budgets", "status": "Connected", "detail": "3 active budgets · $184K tracked"},
        {"name": "ANCRSync", "tagline": "Collaborative Expenses", "status": "Connected", "detail": "5 collaborators · 12 shared invoices"},
        {"name": "ANCRA", "tagline": "Tuition & Scholarships", "status": "Connected", "detail": "$28K in awarded scholarships"},
        {"name": "ANCRLaunch", "tagline": "Internship Income", "status": "Connected", "detail": "2 placements · $12,400 paid YTD"},
        {"name": "ANCRVIEW", "tagline": "Monetization Analytics", "status": "Connected", "detail": "Views 4.2M · RPM $3.12"},
        {"name": "ANCRWAV", "tagline": "Streaming Royalties", "status": "Connected", "detail": "Spotify · Apple · Tidal · Amazon"},
        {"name": "Passport", "tagline": "Travel Expense Sync", "status": "Connected", "detail": "23 trips · $41,220 expensed"},
    ]

# ---------------------------------------------------------------------------
# AIAH — AI Financial Advisor (Claude Sonnet 4.5)
# ---------------------------------------------------------------------------
@api.post("/aiah/chat")
async def aiah_chat(payload: AIAHMessage, user=Depends(get_current_user)):
    # Build lightweight financial context for the model
    ov = await dashboard_overview(user)
    context = {
        "role": user["role"],
        "name": user["name"],
        "net_worth": ov["net_worth"],
        "cash_available": ov["cash_available"],
        "monthly_revenue": ov["monthly_revenue"],
        "monthly_expense": ov["monthly_expense"],
        "royalties_pending": ov["royalties_pending"],
        "outstanding_invoices": ov["outstanding_invoices"],
        "business_health_score": ov["business_health_score"],
        "tax_readiness": ov["tax_readiness"],
    }
    session_id = payload.session_id or str(uuid.uuid4())
    return StreamingResponse(
        stream_aiah_response(payload.message, context, session_id),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )

# ---------------------------------------------------------------------------
# Grants & Funding Center (V1.0)
# ---------------------------------------------------------------------------
@api.get("/grants/opportunities")
async def list_grant_opportunities(category: Optional[str] = None, user=Depends(get_current_user)):
    q = {}
    if category:
        q["category"] = category
    items = await db.grant_opportunities.find(q, {"_id": 0}).to_list(500)
    # Group by category for filtering UI
    categories = sorted(list({i["category"] for i in items}))
    return {"opportunities": items, "categories": categories}

@api.get("/grants/applications")
async def list_grant_applications(user=Depends(get_current_user)):
    oid = await owner_id_for(user)
    items = await db.grant_applications.find({"owner_id": oid}, {"_id": 0}).to_list(500)
    return items

@api.get("/grants/summary")
async def grants_summary(user=Depends(get_current_user)):
    oid = await owner_id_for(user)
    apps = await db.grant_applications.find({"owner_id": oid}, {"_id": 0}).to_list(500)
    opps = await db.grant_opportunities.find({}, {"_id": 0}).to_list(500)

    total_secured = sum((a.get("amount_awarded") or 0) for a in apps if a["status"] == "Awarded")
    in_progress = [a for a in apps if a["status"] == "In Progress"]
    submitted = [a for a in apps if a["status"] == "Submitted"]
    awarded = [a for a in apps if a["status"] == "Awarded"]
    rejected = [a for a in apps if a["status"] == "Rejected"]
    win_rate = (len(awarded) / (len(awarded) + len(rejected)) * 100) if (awarded or rejected) else 0

    # Upcoming deadlines: opportunities with deadlines in next 90 days, not yet applied
    applied_names = {a["opportunity_name"] for a in apps}
    upcoming = []
    for o in opps:
        if o["name"] in applied_names or o["deadline"] == "Rolling" or o["deadline"] == "By nomination":
            continue
        try:
            d = datetime.strptime(o["deadline"], "%Y-%m-%d")
            days = (d - datetime.now()).days
            if 0 <= days <= 120:
                o2 = dict(o)
                o2["days_until"] = days
                upcoming.append(o2)
        except Exception:
            pass
    upcoming.sort(key=lambda x: x["days_until"])

    return {
        "total_secured": total_secured,
        "total_pipeline": sum(o["amount"] for o in opps if o["name"] in {a["opportunity_name"] for a in in_progress + submitted}),
        "in_progress_count": len(in_progress),
        "submitted_count": len(submitted),
        "awarded_count": len(awarded),
        "rejected_count": len(rejected),
        "win_rate": round(win_rate, 1),
        "upcoming_deadlines": upcoming[:8],
        "recent_awards": awarded,
        "in_progress": in_progress,
        "submitted": submitted,
    }

# ---------------------------------------------------------------------------
# Projects (Tour Profitability & Project P&L)
# ---------------------------------------------------------------------------
def _compute_pnl(project: dict) -> dict:
    revenue = project.get("revenue", {})
    expenses = project.get("expenses", {})
    total_revenue = sum(revenue.values())
    total_expense = sum(expenses.values())
    net_profit = total_revenue - total_expense
    margin = (net_profit / total_revenue * 100) if total_revenue else 0
    roi = (net_profit / total_expense * 100) if total_expense else 0

    shows = project.get("shows", 0)
    rev_per_show = total_revenue / shows if shows else 0
    # break-even = when cumulative revenue >= total expense
    milestones = project.get("milestones", [])
    cum_rev, cum_cost, break_even_index = 0, 0, None
    timeline = []
    for i, m in enumerate(milestones):
        cum_rev += m.get("revenue", 0)
        cum_cost += m.get("cost", 0)
        timeline.append({**m, "cumulative_revenue": cum_rev, "cumulative_cost": cum_cost, "cumulative_net": cum_rev - cum_cost})
        if break_even_index is None and cum_rev >= total_expense:
            break_even_index = i

    # Tour Health Score composite
    health = 50
    if margin > 25:
        health += 25
    elif margin > 15:
        health += 15
    elif margin > 5:
        health += 8
    else:
        health -= 15
    if project.get("status") == "Active":
        health += 10
    high_risk = sum(1 for r in project.get("risks", []) if r["severity"] == "High")
    health -= high_risk * 8
    health = max(0, min(100, health))

    return {
        **project,
        "total_revenue": total_revenue,
        "total_expense": total_expense,
        "net_profit": net_profit,
        "profit_margin": round(margin, 1),
        "roi": round(roi, 1),
        "revenue_per_show": rev_per_show,
        "cost_per_traveler": (expenses.get("Flights", 0) + expenses.get("Hotels", 0) + expenses.get("Per Diem", 0) + expenses.get("Ground Transport", 0)) / max(1, shows) if shows else 0,
        "break_even_show": break_even_index,
        "timeline": timeline,
        "health_score": health,
    }

@api.get("/projects")
async def list_projects(user=Depends(get_current_user)):
    oid = await owner_id_for(user)
    items = await db.projects.find({"owner_id": oid}, {"_id": 0}).to_list(200)
    return [_compute_pnl(p) for p in items]

@api.get("/projects/{pid}")
async def get_project(pid: str, user=Depends(get_current_user)):
    oid = await owner_id_for(user)
    p = await db.projects.find_one({"id": pid, "owner_id": oid}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Project not found")
    return _compute_pnl(p)

class ProjectIn(BaseModel):
    name: str
    type: str
    status: str = "Planned"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    location: Optional[str] = None
    shows: int = 0
    capacity_avg: int = 0
    ticket_price_avg: float = 0
    revenue: Dict[str, float] = {}
    expenses: Dict[str, float] = {}
    milestones: List[Dict[str, Any]] = []
    risks: List[Dict[str, Any]] = []
    notes: Optional[str] = None

@api.post("/projects")
async def create_project(payload: ProjectIn, user=Depends(get_current_user)):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["owner_id"] = user["id"]
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.projects.insert_one(doc)
    strip_id(doc)
    return _compute_pnl(doc)

# ---------------------------------------------------------------------------
# Wire up router + CORS
# ---------------------------------------------------------------------------
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown():
    client.close()
