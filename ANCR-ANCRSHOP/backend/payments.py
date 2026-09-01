import os
import uuid
import stripe
from bson import ObjectId
from datetime import datetime, timezone
from fastapi import APIRouter, Request, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from db import db
from auth import get_optional_user
from commerce import price_cart, CartItem

router = APIRouter(prefix="/api", tags=["payments"])

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY") or "sk_test_emergent"
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")


class CheckoutReq(BaseModel):
    items: List[CartItem]
    coupon_code: Optional[str] = None
    origin_url: str
    email: Optional[str] = None
    shipping_name: Optional[str] = None


def _order_number():
    return "ANCR-" + uuid.uuid4().hex[:8].upper()


@router.post("/payments/checkout")
async def create_checkout(body: CheckoutReq, user=Depends(get_optional_user)):
    quote = await price_cart([i.model_dump() for i in body.items], body.coupon_code)
    if not quote["lines"]:
        raise HTTPException(400, "Your cart is empty")

    order_number = _order_number()
    # Build Stripe line items from server-validated prices
    line_items = []
    for l in quote["lines"]:
        line_items.append({
            "price_data": {
                "currency": "usd",
                "product_data": {"name": f"{l['brand']} — {l['name']}"[:127]},
                "unit_amount": int(round(l["price"] * 100)),
            },
            "quantity": l["quantity"],
        })
    # Fold shipping/tax/discount into adjustment lines so the Stripe total matches our quote
    if quote["shipping"] > 0:
        line_items.append({"price_data": {"currency": "usd", "product_data": {"name": "Shipping"},
                                          "unit_amount": int(round(quote["shipping"] * 100))}, "quantity": 1})
    if quote["tax"] > 0:
        line_items.append({"price_data": {"currency": "usd", "product_data": {"name": "Estimated Tax"},
                                          "unit_amount": int(round(quote["tax"] * 100))}, "quantity": 1})

    kwargs = dict(
        line_items=line_items,
        mode="payment",
        success_url=f"{body.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{body.origin_url}/payment/cancel",
        metadata={"order_number": order_number, "user_id": (user or {}).get("id", "guest"),
                  "coupon": body.coupon_code or ""},
    )
    if quote["discount"] > 0:
        try:
            coupon = stripe.Coupon.create(amount_off=int(round(quote["discount"] * 100)), currency="usd", duration="once")
            kwargs["discounts"] = [{"coupon": coupon.id}]
        except Exception:
            pass
    try:
        session = stripe.checkout.Session.create(**kwargs)
    except stripe.error.StripeError as e:
        raise HTTPException(500, f"Payment error: {str(e)}")

    now = datetime.now(timezone.utc).isoformat()
    await db.orders.insert_one({
        "order_number": order_number,
        "user_id": (user or {}).get("id"),
        "email": body.email or (user or {}).get("email"),
        "shipping_name": body.shipping_name,
        "items": quote["lines"],
        "subtotal": quote["subtotal"], "discount": quote["discount"],
        "coupon": quote["coupon"], "shipping": quote["shipping"],
        "tax": quote["tax"], "total": quote["total"],
        "status": "pending", "payment_status": "pending", "fulfillment_status": "unfulfilled",
        "session_id": session.id, "created_at": now, "updated_at": now,
    })
    await db.payment_transactions.insert_one({
        "session_id": session.id, "order_number": order_number,
        "user_id": (user or {}).get("id"), "amount": quote["total"], "currency": "usd",
        "status": "initiated", "payment_status": "pending",
        "created_at": now, "updated_at": now,
    })
    return {"checkout_url": session.url, "session_id": session.id, "order_number": order_number}


async def _mark_paid(session_id, pi=None):
    now = datetime.now(timezone.utc).isoformat()
    res = await db.orders.update_one(
        {"session_id": session_id, "payment_status": {"$ne": "paid"}},
        {"$set": {"status": "confirmed", "payment_status": "paid",
                  "stripe_payment_intent_id": pi, "updated_at": now}})
    await db.payment_transactions.update_one(
        {"session_id": session_id, "payment_status": {"$ne": "paid"}},
        {"$set": {"status": "completed", "payment_status": "paid", "updated_at": now}})
    if res.modified_count:
        order = await db.orders.find_one({"session_id": session_id})
        if order and order.get("user_id"):
            pts = int(order.get("total", 0))
            await db.users.update_one({"_id": ObjectId(order["user_id"])},
                                      {"$inc": {"loyalty_points": pts}})


@router.get("/payments/status/{session_id}")
async def payment_status(session_id: str):
    rec = await db.payment_transactions.find_one({"session_id": session_id})
    if not rec:
        raise HTTPException(404, "Transaction not found")
    if rec.get("payment_status") != "paid":
        try:
            s = stripe.checkout.Session.retrieve(session_id)
            if s.payment_status == "paid" or s.status == "complete":
                await _mark_paid(session_id, s.payment_intent)
                rec = await db.payment_transactions.find_one({"session_id": session_id})
        except stripe.error.StripeError:
            pass
    return {"session_id": rec["session_id"], "status": rec["status"],
            "payment_status": rec["payment_status"], "order_number": rec.get("order_number")}


@router.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
    except Exception:
        raise HTTPException(400, "Invalid signature")
    obj, t = event["data"]["object"], event["type"]
    if t == "checkout.session.completed":
        await _mark_paid(obj["id"], obj.get("payment_intent"))
    elif t == "checkout.session.expired":
        now = datetime.now(timezone.utc).isoformat()
        await db.orders.update_one({"session_id": obj["id"]},
                                   {"$set": {"status": "expired", "payment_status": "expired", "updated_at": now}})
    return {"status": "ok"}
