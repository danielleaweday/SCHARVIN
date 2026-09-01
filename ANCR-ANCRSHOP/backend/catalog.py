from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
from db import db, serialize, serialize_list
from auth import get_optional_user, get_current_user

router = APIRouter(prefix="/api", tags=["catalog"])


@router.get("/departments")
async def list_departments():
    return serialize_list(await db.departments.find().sort("name", 1).to_list(100))


@router.get("/brands")
async def list_brands():
    return serialize_list(await db.brands.find().to_list(100))


@router.get("/campaigns")
async def list_campaigns():
    return serialize_list(await db.campaigns.find().sort("order", 1).to_list(50))


@router.get("/collections")
async def list_collections(featured: Optional[bool] = None):
    q = {}
    if featured is not None:
        q["featured"] = featured
    return serialize_list(await db.collections_c.find(q).to_list(50))


@router.get("/collections/{slug}")
async def get_collection(slug: str):
    col = await db.collections_c.find_one({"slug": slug})
    if not col:
        raise HTTPException(404, "Collection not found")
    col = serialize(col)
    prods = await db.products.find({"slug": {"$in": col.get("product_slugs", [])}, "active": True}).to_list(100)
    col["products"] = serialize_list(prods)
    return col


@router.get("/products")
async def list_products(
    department: Optional[str] = None,
    brand: Optional[str] = None,
    category: Optional[str] = None,
    badge: Optional[str] = None,
    q: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    is_digital: Optional[bool] = None,
    in_stock: Optional[bool] = None,
    sort: str = "featured",
    page: int = 1,
    limit: int = 24,
):
    query = {"active": True}
    if department:
        query["department"] = department
    if brand:
        query["brand_key"] = brand
    if category:
        query["category"] = category
    if badge:
        query["badges"] = badge
    if is_digital is not None:
        query["is_digital"] = is_digital
    if in_stock:
        query["stock"] = {"$gt": 0}
    if min_price is not None or max_price is not None:
        pr = {}
        if min_price is not None:
            pr["$gte"] = min_price
        if max_price is not None:
            pr["$lte"] = max_price
        query["price"] = pr
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"brand": {"$regex": q, "$options": "i"}},
            {"category": {"$regex": q, "$options": "i"}},
            {"tags": {"$regex": q, "$options": "i"}},
            {"department_name": {"$regex": q, "$options": "i"}},
        ]
    sort_map = {
        "featured": [("sold_count", -1)],
        "newest": [("created_at", -1)],
        "price-asc": [("price", 1)],
        "price-desc": [("price", -1)],
        "rating": [("rating", -1)],
        "trending": [("sold_count", -1)],
    }
    total = await db.products.count_documents(query)
    cursor = db.products.find(query).sort(sort_map.get(sort, sort_map["featured"]))
    cursor = cursor.skip((page - 1) * limit).limit(limit)
    items = serialize_list(await cursor.to_list(limit))
    return {"items": items, "total": total, "page": page, "limit": limit,
            "pages": (total + limit - 1) // limit}


@router.get("/products/facets")
async def product_facets(department: Optional[str] = None):
    match = {"active": True}
    if department:
        match["department"] = department
    cats = await db.products.distinct("category", match)
    brands = await db.products.distinct("brand", match)
    return {"categories": sorted(cats), "brands": sorted(brands)}


@router.get("/products/{slug}")
async def get_product(slug: str, user=Depends(get_optional_user)):
    p = await db.products.find_one({"slug": slug})
    if not p:
        raise HTTPException(404, "Product not found")
    prod = serialize(p)
    reviews = await db.reviews.find({"product_slug": slug}).sort("created_at", -1).to_list(50)
    prod["reviews"] = serialize_list(reviews)
    related = await db.products.find(
        {"department": prod["department"], "slug": {"$ne": slug}, "active": True}
    ).limit(4).to_list(4)
    prod["related"] = serialize_list(related)
    return prod


class ReviewReq(BaseModel):
    rating: int
    title: str
    body: str


@router.post("/products/{slug}/reviews")
async def add_review(slug: str, body: ReviewReq, user=Depends(get_current_user)):
    p = await db.products.find_one({"slug": slug})
    if not p:
        raise HTTPException(404, "Product not found")
    doc = {
        "product_slug": slug, "user_id": user["id"], "user_name": user["name"],
        "rating": max(1, min(5, body.rating)), "title": body.title, "body": body.body,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.reviews.insert_one(doc)
    all_r = await db.reviews.find({"product_slug": slug}).to_list(1000)
    avg = round(sum(r["rating"] for r in all_r) / len(all_r), 1)
    await db.products.update_one({"slug": slug},
                                 {"$set": {"rating": avg, "review_count": p.get("review_count", 0) + 1}})
    return serialize(doc)


@router.get("/recommendations")
async def recommendations(user=Depends(get_optional_user), limit: int = 8):
    pipeline = [{"$match": {"active": True}}, {"$sample": {"size": limit}}]
    items = await db.products.aggregate(pipeline).to_list(limit)
    return serialize_list(items)
