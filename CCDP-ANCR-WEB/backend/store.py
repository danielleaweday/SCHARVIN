"""CCDP × ANCR merchandise store: customer accounts, catalog, Stripe checkout, orders.

- Customer auth: email/password (bcrypt + JWT) and Google Sign-In (Emergent Auth).
  Both issue our own customer JWT (Bearer) so the storefront uses one mechanism.
- Guest checkout supported (no account required).
- Fulfillment is provider-agnostic: orders are stored with line items + shipping so a
  print provider (e.g. Printful) can be wired in later without touching the storefront.
"""
import os
import uuid
import asyncio
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Literal

import jwt
import bcrypt
import httpx
import stripe
from fastapi import APIRouter, Request, HTTPException, Depends, Query
from pydantic import BaseModel, EmailStr, Field

import store_catalog as catalog
import store_email
import store_inventory
from auth import get_current_admin

logger = logging.getLogger("ccdp.store")

JWT_ALGORITHM = "HS256"
CUSTOMER_TTL_DAYS = 7
EMERGENT_SESSION_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY") or "sk_test_emergent"
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")

router = APIRouter(prefix="/api/store")
webhook_router = APIRouter(prefix="/api")


def _secret() -> str:
    return os.environ["JWT_SECRET"]


def _hash(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def _verify(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False


def _customer_token(user_id: str, email: str, name: str) -> str:
    payload = {
        "sub": user_id, "user_id": user_id, "email": email, "name": name,
        "role": "customer", "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(days=CUSTOMER_TTL_DAYS),
    }
    return jwt.encode(payload, _secret(), algorithm=JWT_ALGORITHM)


def _decode_customer(request: Request) -> Optional[dict]:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    try:
        payload = jwt.decode(auth[7:], _secret(), algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        return None
    if payload.get("role") != "customer":
        return None
    return {"user_id": payload.get("user_id"), "email": payload.get("email"), "name": payload.get("name")}


def get_current_customer(request: Request) -> dict:
    cust = _decode_customer(request)
    if not cust:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return cust


# ---------- Models ----------
class RegisterBody(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginBody(BaseModel):
    email: EmailStr
    password: str


class GoogleBody(BaseModel):
    session_id: str = Field(min_length=1, max_length=512)


class WaitlistBody(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr


class ForgotBody(BaseModel):
    email: EmailStr
    origin_url: str = Field(min_length=1, max_length=400)


class ResetBody(BaseModel):
    email: EmailStr
    token: str = Field(min_length=10, max_length=200)
    password: str = Field(min_length=8, max_length=128)


class ProfileBody(BaseModel):
    name: Optional[str] = Field(default=None, max_length=80)
    emailPrefs: Optional[bool] = None


class Address(BaseModel):
    label: Optional[str] = Field(default="", max_length=60)
    line1: str = Field(min_length=1, max_length=160)
    line2: Optional[str] = Field(default="", max_length=160)
    city: str = Field(min_length=1, max_length=80)
    state: Optional[str] = Field(default="", max_length=80)
    postalCode: str = Field(min_length=1, max_length=20)
    country: str = Field(min_length=2, max_length=2)


class CartItem(BaseModel):
    productId: str
    size: str = "One Size"
    quantity: int = Field(1, ge=1, le=25)


class CheckoutBody(BaseModel):
    items: List[CartItem]
    origin_url: str = Field(min_length=1, max_length=400)
    email: Optional[EmailStr] = None  # guest email


def register_store_routes(db):
    customers = db.store_customers
    orders = db.store_orders
    payments = db.payment_transactions

    async def _public_customer(user_id: str) -> dict:
        c = await customers.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
        return c or {}

    # ============ CATALOG ============
    @router.get("/catalog")
    async def get_catalog():
        return await store_inventory.enrich_catalog(db)

    # ============ WAITLIST (ANCR Shop preview) ============
    @router.post("/waitlist")
    async def join_waitlist(body: WaitlistBody):
        email = body.email.lower().strip()
        now = datetime.now(timezone.utc).isoformat()
        await db.store_waitlist.update_one(
            {"email": email},
            {"$set": {"email": email, "name": body.name.strip(), "updated_at": now},
             "$setOnInsert": {"created_at": now, "source": "ancr_shop"}},
            upsert=True,
        )
        asyncio.create_task(store_email.send(
            email, "You're on the ANCR Shop waitlist", store_email.waitlist_html(body.name.strip())))
        return {"ok": True}

    @router.get("/admin/waitlist")
    async def admin_waitlist(admin: dict = Depends(get_current_admin),
                             limit: int = Query(500, ge=1, le=2000), skip: int = Query(0, ge=0)):
        docs = await db.store_waitlist.find({}, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
        total = await db.store_waitlist.count_documents({})
        return {"signups": docs, "total": total}

    # ============ AUTH ============
    @router.post("/auth/register")
    async def register(body: RegisterBody):
        email = body.email.lower().strip()
        if await customers.find_one({"email": email}):
            raise HTTPException(status_code=409, detail="An account with this email already exists.")
        user_id = f"cust_{uuid.uuid4().hex[:12]}"
        await customers.insert_one({
            "user_id": user_id, "email": email, "name": body.name.strip(),
            "password_hash": _hash(body.password), "provider": "email",
            "picture": "", "emailPrefs": True, "addresses": [], "wishlist": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        token = _customer_token(user_id, email, body.name.strip())
        asyncio.create_task(store_email.send(email, "Welcome to CCDP powered by ANCR", store_email.welcome_html(body.name.strip())))
        return {"token": token, "user": await _public_customer(user_id)}

    @router.post("/auth/login")
    async def login(body: LoginBody):
        email = body.email.lower().strip()
        c = await customers.find_one({"email": email})
        if not c or not c.get("password_hash") or not _verify(body.password, c["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        token = _customer_token(c["user_id"], email, c.get("name", ""))
        return {"token": token, "user": await _public_customer(c["user_id"])}

    @router.post("/auth/google")
    async def google_auth(body: GoogleBody):
        # Exchange the Emergent session_id for verified profile data (server-side only).
        try:
            async with httpx.AsyncClient(timeout=15) as http:
                r = await http.get(EMERGENT_SESSION_URL, headers={"X-Session-ID": body.session_id})
            if r.status_code != 200:
                raise HTTPException(status_code=401, detail="Google sign-in failed")
            data = r.json()
        except HTTPException:
            raise
        except Exception as e:  # noqa: BLE001
            logger.error("Emergent session exchange failed: %s", e)
            raise HTTPException(status_code=502, detail="Google sign-in temporarily unavailable")

        email = (data.get("email") or "").lower().strip()
        if not email:
            raise HTTPException(status_code=401, detail="Google sign-in failed")
        existing = await customers.find_one({"email": email})
        if existing:
            user_id = existing["user_id"]
            await customers.update_one({"user_id": user_id}, {"$set": {
                "name": data.get("name") or existing.get("name", ""),
                "picture": data.get("picture") or existing.get("picture", ""),
            }})
        else:
            user_id = f"cust_{uuid.uuid4().hex[:12]}"
            await customers.insert_one({
                "user_id": user_id, "email": email, "name": data.get("name", ""),
                "password_hash": "", "provider": "google", "picture": data.get("picture", ""),
                "emailPrefs": True, "addresses": [], "wishlist": [],
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
        token = _customer_token(user_id, email, data.get("name", ""))
        return {"token": token, "user": await _public_customer(user_id)}

    @router.get("/auth/me")
    async def me(cust: dict = Depends(get_current_customer)):
        return {"user": await _public_customer(cust["user_id"])}

    @router.post("/auth/forgot")
    async def forgot_password(body: ForgotBody):
        # Always return ok (don't leak whether an account exists).
        email = body.email.lower().strip()
        c = await customers.find_one({"email": email})
        if c and c.get("provider") == "email":
            raw = uuid.uuid4().hex + uuid.uuid4().hex
            await db.store_password_resets.delete_many({"email": email})
            await db.store_password_resets.insert_one({
                "email": email, "token_hash": _hash(raw),
                "expires_at": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat(),
            })
            reset_url = f"{body.origin_url}/store/reset?token={raw}&email={email}"
            asyncio.create_task(store_email.send(email, "Reset your CCDP powered by ANCR password",
                store_email.password_reset_html(reset_url)))
        return {"ok": True}

    @router.post("/auth/reset")
    async def reset_password(body: ResetBody):
        email = body.email.lower().strip()
        rec = await db.store_password_resets.find_one({"email": email})
        if not rec or not _verify(body.token, rec["token_hash"]):
            raise HTTPException(status_code=400, detail="Invalid or expired reset link.")
        expires = datetime.fromisoformat(rec["expires_at"])
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        if expires < datetime.now(timezone.utc):
            await db.store_password_resets.delete_many({"email": email})
            raise HTTPException(status_code=400, detail="This reset link has expired.")
        await customers.update_one({"email": email}, {"$set": {"password_hash": _hash(body.password)}})
        await db.store_password_resets.delete_many({"email": email})
        return {"ok": True}

    # ============ PROFILE / ADDRESSES / WISHLIST ============
    @router.put("/account")
    async def update_account(body: ProfileBody, cust: dict = Depends(get_current_customer)):
        updates = {k: v for k, v in body.model_dump().items() if v is not None}
        if updates:
            await customers.update_one({"user_id": cust["user_id"]}, {"$set": updates})
        return await _public_customer(cust["user_id"])

    @router.get("/addresses")
    async def list_addresses(cust: dict = Depends(get_current_customer)):
        c = await _public_customer(cust["user_id"])
        return {"addresses": c.get("addresses", [])}

    @router.post("/addresses")
    async def add_address(body: Address, cust: dict = Depends(get_current_customer)):
        addr = {"id": f"addr_{uuid.uuid4().hex[:8]}", **body.model_dump()}
        await customers.update_one({"user_id": cust["user_id"]}, {"$push": {"addresses": addr}})
        c = await _public_customer(cust["user_id"])
        return {"addresses": c.get("addresses", [])}

    @router.delete("/addresses/{address_id}")
    async def delete_address(address_id: str, cust: dict = Depends(get_current_customer)):
        await customers.update_one({"user_id": cust["user_id"]}, {"$pull": {"addresses": {"id": address_id}}})
        c = await _public_customer(cust["user_id"])
        return {"addresses": c.get("addresses", [])}

    @router.get("/wishlist")
    async def get_wishlist(cust: dict = Depends(get_current_customer)):
        c = await _public_customer(cust["user_id"])
        return {"wishlist": c.get("wishlist", [])}

    @router.post("/wishlist/{product_id}")
    async def toggle_wishlist(product_id: str, cust: dict = Depends(get_current_customer)):
        if product_id not in catalog.PRODUCT_BY_ID:
            raise HTTPException(status_code=404, detail="Product not found")
        c = await _public_customer(cust["user_id"])
        wl = c.get("wishlist", [])
        if product_id in wl:
            await customers.update_one({"user_id": cust["user_id"]}, {"$pull": {"wishlist": product_id}})
        else:
            await customers.update_one({"user_id": cust["user_id"]}, {"$addToSet": {"wishlist": product_id}})
        c = await _public_customer(cust["user_id"])
        return {"wishlist": c.get("wishlist", [])}

    # ============ CHECKOUT ============
    @router.post("/checkout")
    async def checkout(body: CheckoutBody, request: Request):
        if not body.items:
            raise HTTPException(status_code=400, detail="Your cart is empty")

        cust = _decode_customer(request)
        line_items = []
        order_items = []
        amount_total = 0.0
        for it in body.items:
            product = catalog.PRODUCT_BY_ID.get(it.productId)
            if not product:
                raise HTTPException(status_code=400, detail=f"Unknown product: {it.productId}")
            if it.size not in product["sizes"]:
                raise HTTPException(status_code=400, detail=f"Invalid size for {product['name']}")
            unit = float(product["price"])
            amount_total += unit * it.quantity
            line_items.append({
                "quantity": it.quantity,
                "price_data": {
                    "currency": "usd",
                    "unit_amount": int(round(unit * 100)),
                    "tax_behavior": "exclusive",
                    "product_data": {
                        "name": f"{product['name']} — {it.size}" if it.size != "One Size" else product["name"],
                        "images": [product["image"]],
                        "tax_code": catalog.PHYSICAL_TAX_CODE,
                        "metadata": {"product_id": product["id"], "size": it.size},
                    },
                },
            })
            order_items.append({
                "productId": product["id"], "name": product["name"], "collection": product["collectionName"],
                "type": product["type"], "size": it.size, "quantity": it.quantity,
                "unitPrice": unit, "image": product["image"],
            })

        order_id = f"ord_{uuid.uuid4().hex[:12]}"
        # Prevent overselling for inventory-tracked variants.
        avail_err = await store_inventory.check_availability(
            db, [{"productId": it.productId, "size": it.size, "quantity": it.quantity} for it in body.items])
        if avail_err:
            raise HTTPException(status_code=409, detail=avail_err)
        email = (cust["email"] if cust else (body.email or None))
        common = dict(
            mode="payment",
            success_url=f"{body.origin_url}/store/order/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{body.origin_url}/store/cart",
            line_items=line_items,
            shipping_address_collection={"allowed_countries": catalog.SHIP_COUNTRIES},
            phone_number_collection={"enabled": True},
            metadata={"order_id": order_id, "user_id": (cust["user_id"] if cust else "")},
        )
        if email:
            common["customer_email"] = email
        # Try with automatic tax; gracefully fall back if the sandbox can't calculate it.
        try:
            session = stripe.checkout.Session.create(
                **common, automatic_tax={"enabled": True}, billing_address_collection="required")
        except stripe.error.StripeError as e:
            logger.warning("automatic_tax checkout failed (%s) — retrying without tax", e)
            session = stripe.checkout.Session.create(**common)

        now = datetime.now(timezone.utc)
        await orders.insert_one({
            "order_id": order_id, "session_id": session.id,
            "user_id": (cust["user_id"] if cust else None), "email": email,
            "items": order_items, "amount_subtotal": round(amount_total, 2), "currency": "usd",
            "status": "pending", "payment_status": "pending", "fulfillment_status": "unfulfilled",
            "shipping": None, "provider": "stripe",
            "created_at": now.isoformat(), "updated_at": now.isoformat(),
        })
        await payments.insert_one({
            "session_id": session.id, "order_id": order_id, "amount": round(amount_total, 2),
            "currency": "usd", "status": "initiated", "payment_status": "pending",
            "created_at": now, "updated_at": now,
        })
        return {"checkout_url": session.url, "session_id": session.id, "order_id": order_id}

    async def _sync_paid(session_id: str):
        """Mark order + payment paid (idempotent) and capture shipping details."""
        try:
            s = stripe.checkout.Session.retrieve(session_id, expand=["customer_details"])
        except stripe.error.StripeError:
            return
        if s.payment_status == "paid" or s.status == "complete":
            now = datetime.now(timezone.utc)
            details = s.get("customer_details") or {}
            shipping = None
            coll = s.get("collected_information") or {}
            ship = (coll.get("shipping_details") if coll else None) or s.get("shipping_details")
            if ship:
                shipping = {"name": ship.get("name"), "address": ship.get("address")}
            await payments.update_one(
                {"session_id": session_id, "payment_status": {"$ne": "paid"}},
                {"$set": {"status": "completed", "payment_status": "paid",
                          "stripe_payment_intent_id": s.get("payment_intent"), "updated_at": now}})
            await orders.update_one(
                {"session_id": session_id, "payment_status": {"$ne": "paid"}},
                {"$set": {"status": "paid", "payment_status": "paid",
                          "amount_total": (s.get("amount_total") or 0) / 100.0,
                          "email": s.get("customer_email") or details.get("email"),
                          "shipping": shipping, "updated_at": now.isoformat()}})
            # Send the order confirmation + receipt exactly once (on the first paid transition).
            paid_order = await orders.find_one({"session_id": session_id, "email_status": {"$ne": "sent"}}, {"_id": 0})
            if paid_order and paid_order.get("payment_status") == "paid":
                await orders.update_one({"session_id": session_id}, {"$set": {"email_status": "sent"}})
                # Decrement inventory once, on the first paid transition.
                await store_inventory.decrement(db, [
                    {"productId": it["productId"], "size": it["size"], "quantity": it["quantity"]}
                    for it in paid_order.get("items", [])])
                if paid_order.get("email"):
                    asyncio.create_task(store_email.send(
                        paid_order["email"], f"Your CCDP powered by ANCR order {paid_order['order_id']}",
                        store_email.order_confirmation_html(paid_order)))

    @router.get("/checkout/status/{session_id}")
    async def checkout_status(session_id: str):
        order = await orders.find_one({"session_id": session_id}, {"_id": 0})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        if order.get("payment_status") != "paid":
            await _sync_paid(session_id)
            order = await orders.find_one({"session_id": session_id}, {"_id": 0})
        return {"payment_status": order.get("payment_status"), "status": order.get("status"), "order": order}

    # ============ CUSTOMER ORDERS ============
    @router.get("/orders")
    async def my_orders(cust: dict = Depends(get_current_customer)):
        docs = await orders.find(
            {"user_id": cust["user_id"], "payment_status": "paid"}, {"_id": 0}
        ).sort("created_at", -1).to_list(length=200)
        return {"orders": docs}

    @router.get("/orders/{order_id}")
    async def my_order(order_id: str, cust: dict = Depends(get_current_customer)):
        doc = await orders.find_one({"order_id": order_id, "user_id": cust["user_id"]}, {"_id": 0})
        if not doc:
            raise HTTPException(status_code=404, detail="Order not found")
        return doc

    # ============ ADMIN ORDERS ============
    @router.get("/admin/orders")
    async def admin_orders(admin: dict = Depends(get_current_admin),
                           status: Optional[str] = None,
                           limit: int = Query(200, ge=1, le=500), skip: int = Query(0, ge=0)):
        q = {}
        if status:
            q["status"] = status
        docs = await orders.find(q, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
        total = await orders.count_documents({})
        paid = await orders.count_documents({"payment_status": "paid"})
        revenue_docs = await orders.find({"payment_status": "paid"}, {"amount_total": 1, "amount_subtotal": 1, "_id": 0}).to_list(length=5000)
        revenue = round(sum((d.get("amount_total") or d.get("amount_subtotal") or 0) for d in revenue_docs), 2)
        return {"orders": docs, "total": total, "paidCount": paid, "revenue": revenue}

    class OrderStatusBody(BaseModel):
        fulfillment_status: Literal["unfulfilled", "processing", "shipped", "delivered", "cancelled"]
        tracking_number: Optional[str] = Field(default=None, max_length=100)

    @router.patch("/admin/orders/{order_id}")
    async def admin_update_order(order_id: str, body: OrderStatusBody, admin: dict = Depends(get_current_admin)):
        updates = {"fulfillment_status": body.fulfillment_status,
                   "updated_at": datetime.now(timezone.utc).isoformat()}
        if body.tracking_number is not None:
            updates["tracking_number"] = body.tracking_number
        res = await orders.update_one({"order_id": order_id}, {"$set": updates})
        if res.matched_count == 0:
            raise HTTPException(status_code=404, detail="Order not found")
        doc = await orders.find_one({"order_id": order_id}, {"_id": 0})
        # Notify the customer on meaningful fulfillment transitions.
        to = doc.get("email")
        if to:
            st = body.fulfillment_status
            if st == "shipped":
                asyncio.create_task(store_email.send(to, f"Your order {order_id} has shipped",
                    store_email.shipping_html(doc, doc.get("tracking_number") or "")))
            elif st == "delivered":
                asyncio.create_task(store_email.send(to, f"Your order {order_id} was delivered",
                    store_email.delivery_html(doc)))
            elif st in ("processing", "cancelled"):
                asyncio.create_task(store_email.send(to, f"Order {order_id} update",
                    store_email.status_html(doc, st)))
        return doc

    # ============ STRIPE WEBHOOK ============
    @webhook_router.post("/stripe/webhook")
    async def stripe_webhook(request: Request):
        payload = await request.body()
        sig = request.headers.get("stripe-signature", "")
        try:
            event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
        except stripe.error.SignatureVerificationError:
            raise HTTPException(status_code=400, detail="Invalid signature")
        obj, t = event["data"]["object"], event["type"]
        now = datetime.now(timezone.utc)
        if t in ("checkout.session.completed", "checkout.session.async_payment_succeeded"):
            await _sync_paid(obj["id"])
        elif t in ("checkout.session.async_payment_failed", "checkout.session.expired"):
            st = "failed" if "failed" in t else "expired"
            await payments.update_one({"session_id": obj["id"]},
                {"$set": {"status": st, "payment_status": st, "updated_at": now}})
            await orders.update_one({"session_id": obj["id"]},
                {"$set": {"status": st, "payment_status": st, "updated_at": now.isoformat()}})
        return {"status": "ok"}

    store_inventory.register_inventory_routes(db, router, get_current_admin)
    return router, webhook_router
