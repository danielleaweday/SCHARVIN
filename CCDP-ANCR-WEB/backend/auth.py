"""Admin authentication: bcrypt + JWT (Bearer). Single/few admins seeded from env."""
import os
import jwt
import bcrypt
import logging
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Request, HTTPException, Depends
from pydantic import BaseModel, EmailStr

logger = logging.getLogger("ccdp.auth")

JWT_ALGORITHM = "HS256"
TOKEN_TTL_HOURS = 12
_LOCK_MAX = 5
_LOCK_WINDOW = 900  # 15 min

auth_router = APIRouter(prefix="/api/auth")


def _secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False


def create_token(email: str, name: str) -> str:
    payload = {
        "sub": email, "email": email, "name": name, "role": "admin",
        "exp": datetime.now(timezone.utc) + timedelta(hours=TOKEN_TTL_HOURS),
        "type": "access",
    }
    return jwt.encode(payload, _secret(), algorithm=JWT_ALGORITHM)


class LoginBody(BaseModel):
    email: EmailStr
    password: str


async def seed_admin(db):
    email = os.environ.get("ADMIN_EMAIL", "").strip().lower()
    password = os.environ.get("ADMIN_PASSWORD", "").strip()
    if not email or not password:
        logger.warning("ADMIN_EMAIL/ADMIN_PASSWORD not set — no admin seeded")
        return
    existing = await db.admins.find_one({"email": email})
    if existing is None:
        await db.admins.insert_one({
            "email": email, "name": os.environ.get("ADMIN_NAME", "CCDP Admin"),
            "password_hash": hash_password(password), "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Seeded admin %s", email)
    elif not verify_password(password, existing["password_hash"]):
        await db.admins.update_one({"email": email},
                                   {"$set": {"password_hash": hash_password(password)}})
        logger.info("Updated admin password for %s", email)


def get_current_admin(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth[7:]
    try:
        payload = jwt.decode(token, _secret(), algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    return {"email": payload.get("email"), "name": payload.get("name")}


def register_auth_routes(db):
    @auth_router.post("/login")
    async def login(body: LoginBody, request: Request):
        email = body.email.lower().strip()
        ip = request.headers.get("x-forwarded-for", "").split(",")[0].strip() or (
            request.client.host if request.client else "unknown")
        ident = f"{ip}:{email}"
        now = datetime.now(timezone.utc)

        rec = await db.login_attempts.find_one({"identifier": ident})
        if rec and rec.get("count", 0) >= _LOCK_MAX:
            locked_at = datetime.fromisoformat(rec["last"])
            if (now - locked_at).total_seconds() < _LOCK_WINDOW:
                raise HTTPException(status_code=429, detail="Too many attempts. Try again in a few minutes.")

        admin = await db.admins.find_one({"email": email})
        if not admin or not verify_password(body.password, admin["password_hash"]):
            await db.login_attempts.update_one(
                {"identifier": ident},
                {"$inc": {"count": 1}, "$set": {"last": now.isoformat()}}, upsert=True)
            raise HTTPException(status_code=401, detail="Invalid email or password")

        await db.login_attempts.delete_one({"identifier": ident})
        token = create_token(email, admin.get("name", "Admin"))
        return {"token": token, "user": {"email": email, "name": admin.get("name", "Admin")}}

    @auth_router.get("/me")
    async def me(admin: dict = Depends(get_current_admin)):
        return {"user": admin}

    return auth_router
