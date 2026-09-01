from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId
from db import db, serialize, serialize_list
from auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats")
async def stats(admin=Depends(require_admin)):
    orders = await db.orders.find({"payment_status": "paid"}).to_list(5000)
    revenue = round(sum(o.get("total", 0) for o in orders), 2)
    total_orders = await db.orders.count_documents({})
    paid_orders = len(orders)
    customers = await db.users.count_documents({})
    products = await db.products.count_documents({})
    low_stock = await db.products.count_documents({"stock": {"$lte": 8, "$gt": 0}})
    out_stock = await db.products.count_documents({"stock": 0})
    # revenue by department
    dept_rev = {}
    for o in orders:
        for it in o.get("items", []):
            d = it.get("department", "other")
            dept_rev[d] = dept_rev.get(d, 0) + it.get("line_total", 0)
    top_depts = sorted(dept_rev.items(), key=lambda x: -x[1])[:6]
    # recent orders
    recent = await db.orders.find().sort("created_at", -1).limit(8).to_list(8)
    return {
        "revenue": revenue, "total_orders": total_orders, "paid_orders": paid_orders,
        "customers": customers, "products": products, "low_stock": low_stock,
        "out_of_stock": out_stock,
        "aov": round(revenue / paid_orders, 2) if paid_orders else 0,
        "top_departments": [{"department": d, "revenue": round(r, 2)} for d, r in top_depts],
        "recent_orders": serialize_list(recent),
    }


@router.get("/products")
async def admin_products(q: Optional[str] = None, page: int = 1, limit: int = 30, admin=Depends(require_admin)):
    query = {}
    if q:
        query["name"] = {"$regex": q, "$options": "i"}
    total = await db.products.count_documents(query)
    items = await db.products.find(query).sort("created_at", -1).skip((page - 1) * limit).limit(limit).to_list(limit)
    return {"items": serialize_list(items), "total": total, "pages": (total + limit - 1) // limit, "page": page}


class ProductUpsert(BaseModel):
    name: str
    subtitle: Optional[str] = ""
    description: Optional[str] = ""
    brand: str = "ANCR"
    brand_key: str = "ancr"
    department: str
    department_name: Optional[str] = ""
    category: str = "General"
    price: float
    compare_at_price: Optional[float] = None
    stock: int = 100
    is_digital: bool = False
    icon: str = "Package"
    accent: str = "a"
    badges: List[str] = []
    active: bool = True


def _slugify(s):
    return "".join(c if c.isalnum() else "-" for c in s.lower()).strip("-")


@router.post("/products")
async def create_product(body: ProductUpsert, admin=Depends(require_admin)):
    doc = body.model_dump()
    doc["slug"] = _slugify(body.name) + "-" + ObjectId().binary.hex()[:6]
    doc["currency"] = "usd"
    doc["rating"] = 5.0
    doc["review_count"] = 0
    doc["variants"] = []
    doc["vendor_id"] = "ancr-official"
    doc["vendor_name"] = body.brand
    doc["features"] = ["Added by ANCR admin"]
    doc["specs"] = {"SKU": doc["slug"].upper()[:16]}
    doc["tags"] = [body.category.lower(), body.brand.lower()]
    doc["low_stock_threshold"] = 8
    doc["sold_count"] = 0
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    res = await db.products.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    return serialize(doc)


@router.put("/products/{product_id}")
async def update_product(product_id: str, body: dict, admin=Depends(require_admin)):
    body.pop("id", None)
    body.pop("_id", None)
    await db.products.update_one({"_id": ObjectId(product_id)}, {"$set": body})
    p = await db.products.find_one({"_id": ObjectId(product_id)})
    if not p:
        raise HTTPException(404, "Product not found")
    return serialize(p)


@router.delete("/products/{product_id}")
async def delete_product(product_id: str, admin=Depends(require_admin)):
    await db.products.delete_one({"_id": ObjectId(product_id)})
    return {"ok": True}


@router.get("/orders")
async def admin_orders(status: Optional[str] = None, admin=Depends(require_admin)):
    q = {}
    if status:
        q["fulfillment_status"] = status
    orders = await db.orders.find(q).sort("created_at", -1).limit(200).to_list(200)
    return serialize_list(orders)


@router.put("/orders/{order_number}/fulfill")
async def fulfill_order(order_number: str, body: dict, admin=Depends(require_admin)):
    status = body.get("fulfillment_status", "fulfilled")
    await db.orders.update_one({"order_number": order_number},
                               {"$set": {"fulfillment_status": status,
                                         "updated_at": datetime.now(timezone.utc).isoformat()}})
    o = await db.orders.find_one({"order_number": order_number})
    if not o:
        raise HTTPException(404, "Order not found")
    return serialize(o)


@router.get("/coupons")
async def admin_coupons(admin=Depends(require_admin)):
    return serialize_list(await db.coupons.find().to_list(100))


class CouponReq(BaseModel):
    code: str
    type: str = "percent"
    value: float
    active: bool = True
    min_order: float = 0
    description: Optional[str] = ""


@router.post("/coupons")
async def create_coupon(body: CouponReq, admin=Depends(require_admin)):
    doc = body.model_dump()
    doc["code"] = doc["code"].upper()
    if await db.coupons.find_one({"code": doc["code"]}):
        raise HTTPException(400, "Coupon code already exists")
    res = await db.coupons.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    return serialize(doc)


@router.delete("/coupons/{coupon_id}")
async def delete_coupon(coupon_id: str, admin=Depends(require_admin)):
    await db.coupons.delete_one({"_id": ObjectId(coupon_id)})
    return {"ok": True}


@router.get("/customers")
async def admin_customers(admin=Depends(require_admin)):
    users = await db.users.find().sort("created_at", -1).limit(200).to_list(200)
    out = []
    for u in users:
        uu = serialize(u)
        uu["order_count"] = await db.orders.count_documents({"user_id": uu["id"], "payment_status": "paid"})
        out.append(uu)
    return out
