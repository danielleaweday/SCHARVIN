from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
from db import db, serialize, serialize_list
from auth import get_current_user

router = APIRouter(prefix="/api", tags=["commerce"])


class CartItem(BaseModel):
    slug: str
    quantity: int = 1
    variant: Optional[dict] = None


async def price_cart(items: List[dict], coupon_code: Optional[str] = None):
    """Validate items against DB prices. Returns detailed lines + totals."""
    lines = []
    subtotal = 0.0
    for it in items:
        p = await db.products.find_one({"slug": it["slug"], "active": True})
        if not p:
            continue
        qty = max(1, int(it.get("quantity", 1)))
        line_total = round(p["price"] * qty, 2)
        subtotal += line_total
        lines.append({
            "slug": p["slug"], "name": p["name"], "brand": p["brand"],
            "price": p["price"], "quantity": qty, "line_total": line_total,
            "variant": it.get("variant"), "icon": p["icon"], "accent": p["accent"],
            "is_digital": p["is_digital"], "department": p["department"],
        })
    discount = 0.0
    coupon = None
    if coupon_code:
        c = await db.coupons.find_one({"code": coupon_code.upper(), "active": True})
        if c and subtotal >= c.get("min_order", 0):
            if c["type"] == "percent":
                discount = round(subtotal * c["value"] / 100, 2)
            else:
                discount = min(c["value"], subtotal)
            coupon = {"code": c["code"], "description": c.get("description", "")}
    has_physical = any(not l["is_digital"] for l in lines)
    shipping = 0.0 if (subtotal - discount) >= 150 or not has_physical else 9.99
    taxable = max(subtotal - discount, 0)
    tax = round(taxable * 0.08, 2)
    total = round(taxable + shipping + tax, 2)
    return {"lines": lines, "subtotal": round(subtotal, 2), "discount": discount,
            "coupon": coupon, "shipping": shipping, "tax": tax, "total": total,
            "item_count": sum(l["quantity"] for l in lines)}


class QuoteReq(BaseModel):
    items: List[CartItem]
    coupon_code: Optional[str] = None


@router.post("/cart/quote")
async def cart_quote(body: QuoteReq):
    return await price_cart([i.model_dump() for i in body.items], body.coupon_code)


@router.post("/coupons/validate")
async def validate_coupon(payload: dict):
    code = (payload.get("code") or "").upper()
    subtotal = float(payload.get("subtotal", 0))
    c = await db.coupons.find_one({"code": code, "active": True})
    if not c:
        raise HTTPException(404, "Invalid or expired code")
    if subtotal < c.get("min_order", 0):
        raise HTTPException(400, f"Requires a minimum order of ${c['min_order']:.0f}")
    return serialize(c)


# ---------- Wishlist ----------
@router.get("/wishlist")
async def get_wishlist(user=Depends(get_current_user)):
    doc = await db.wishlists.find_one({"user_id": user["id"]})
    slugs = doc.get("slugs", []) if doc else []
    prods = await db.products.find({"slug": {"$in": slugs}, "active": True}).to_list(200)
    return serialize_list(prods)


@router.post("/wishlist/{slug}")
async def toggle_wishlist(slug: str, user=Depends(get_current_user)):
    doc = await db.wishlists.find_one({"user_id": user["id"]})
    slugs = doc.get("slugs", []) if doc else []
    if slug in slugs:
        slugs.remove(slug)
        added = False
    else:
        slugs.append(slug)
        added = True
    await db.wishlists.update_one({"user_id": user["id"]},
                                  {"$set": {"user_id": user["id"], "slugs": slugs}}, upsert=True)
    return {"added": added, "slugs": slugs}


# ---------- Orders ----------
@router.get("/orders")
async def my_orders(user=Depends(get_current_user)):
    orders = await db.orders.find({"user_id": user["id"]}).sort("created_at", -1).to_list(100)
    return serialize_list(orders)


@router.get("/orders/{order_number}")
async def get_order(order_number: str, user=Depends(get_current_user)):
    o = await db.orders.find_one({"order_number": order_number, "user_id": user["id"]})
    if not o:
        raise HTTPException(404, "Order not found")
    return serialize(o)
