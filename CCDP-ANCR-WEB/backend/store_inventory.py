"""CCDP × ANCR store — admin-managed inventory.

Variant-level (SKU) stock on top of the code-defined catalog. Designed to stay compatible
with future fulfillment sync (Printful/Printify): every sellable variant has a stable SKU,
and `trackInventory` can be toggled per variant so externally-fulfilled items can ignore
local stock without code changes.

- Variant doc (`store_inventory`): sku (unique), productId, size, color, stock,
  lowStockThreshold, trackInventory, active, updated_at.
- Product-level hide (`store_product_meta`): productId, active. A product is hidden from
  the storefront when active=False OR every one of its variants is unavailable.
"""
import logging
from datetime import datetime, timezone

import store_catalog as catalog

logger = logging.getLogger("ccdp.store.inventory")

DEFAULT_STOCK = 50
DEFAULT_LOW = 5
DEFAULT_COLOR = "Default"


def sku_for(product_id: str, size: str, color: str = DEFAULT_COLOR) -> str:
    base = f"{product_id}-{size}".replace(" ", "").upper()
    if color and color != DEFAULT_COLOR:
        base += f"-{color.replace(' ', '').upper()}"
    return base


async def seed(db):
    """Idempotently ensure one inventory doc per catalog product×size. Never overwrites stock."""
    existing = set()
    async for d in db.store_inventory.find({}, {"sku": 1, "_id": 0}):
        existing.add(d["sku"])
    to_insert = []
    now = datetime.now(timezone.utc).isoformat()
    for p in catalog.PRODUCTS:
        for size in p["sizes"]:
            sku = sku_for(p["id"], size)
            if sku in existing:
                continue
            to_insert.append({
                "sku": sku, "productId": p["id"], "size": size, "color": DEFAULT_COLOR,
                "stock": DEFAULT_STOCK, "lowStockThreshold": DEFAULT_LOW,
                "trackInventory": True, "active": True, "updated_at": now,
            })
    if to_insert:
        await db.store_inventory.insert_many(to_insert)
        logger.info("Seeded %d inventory variants", len(to_insert))


def _variant_available(v: dict) -> bool:
    if not v.get("active", True):
        return False
    if not v.get("trackInventory", True):
        return True
    return (v.get("stock", 0) or 0) > 0


async def _load_maps(db):
    inv = {}
    async for v in db.store_inventory.find({}, {"_id": 0}):
        inv.setdefault(v["productId"], {})[v["size"]] = v
    meta = {}
    async for m in db.store_product_meta.find({}, {"_id": 0}):
        meta[m["productId"]] = m
    return inv, meta


async def enrich_catalog(db):
    """Public catalog with per-product variants + availability. Hidden products excluded."""
    inv, meta = await _load_maps(db)
    payload = catalog.catalog_payload()
    out = []
    for p in payload["products"]:
        if meta.get(p["id"], {}).get("active", True) is False:
            continue  # product hidden by admin
        variants = []
        for size in p["sizes"]:
            v = inv.get(p["id"], {}).get(size, {"stock": DEFAULT_STOCK, "trackInventory": True, "active": True, "lowStockThreshold": DEFAULT_LOW})
            avail = _variant_available(v)
            variants.append({
                "size": size, "sku": v.get("sku", sku_for(p["id"], size)),
                "stock": v.get("stock", 0), "trackInventory": v.get("trackInventory", True),
                "available": avail,
                "lowStock": bool(v.get("trackInventory", True) and 0 < (v.get("stock", 0) or 0) <= v.get("lowStockThreshold", DEFAULT_LOW)),
            })
        soldOut = all(not vv["available"] for vv in variants)
        out.append({**p, "variants": variants, "soldOut": soldOut, "available": not soldOut})
    payload["products"] = out
    return payload


async def check_availability(db, items):
    """items: list of {productId,size,quantity}. Returns error string or None."""
    for it in items:
        v = await db.store_inventory.find_one({"productId": it["productId"], "size": it["size"]}, {"_id": 0})
        if v is None:
            continue  # not tracked (shouldn't happen post-seed) → allow
        if not v.get("active", True):
            return f"This item is no longer available."
        if v.get("trackInventory", True) and (v.get("stock", 0) or 0) < it["quantity"]:
            return f"Only {v.get('stock', 0)} left of one of your items."
    return None


async def decrement(db, items):
    """Decrement stock for paid items (never below 0). Called once per order on first paid."""
    now = datetime.now(timezone.utc).isoformat()
    for it in items:
        await db.store_inventory.update_one(
            {"productId": it["productId"], "size": it["size"], "trackInventory": True,
             "stock": {"$gte": it["quantity"]}},
            {"$inc": {"stock": -it["quantity"]}, "$set": {"updated_at": now}},
        )


def register_inventory_routes(db, router, admin_dep):
    from fastapi import Depends, HTTPException, Query
    from pydantic import BaseModel, Field
    from typing import Optional

    @router.get("/admin/inventory")
    async def admin_inventory(admin: dict = Depends(admin_dep),
                              collection: Optional[str] = None,
                              lowOnly: bool = False,
                              search: Optional[str] = None):
        by_id = catalog.PRODUCT_BY_ID
        rows = []
        low = 0
        sold = 0
        async for v in db.store_inventory.find({}, {"_id": 0}).sort("productId", 1):
            p = by_id.get(v["productId"])
            if not p:
                continue
            is_low = v.get("trackInventory", True) and 0 < (v.get("stock", 0) or 0) <= v.get("lowStockThreshold", DEFAULT_LOW)
            is_sold = v.get("active", True) and v.get("trackInventory", True) and (v.get("stock", 0) or 0) == 0
            if is_low:
                low += 1
            if is_sold:
                sold += 1
            if collection and p["collectionId"] != collection:
                continue
            if lowOnly and not is_low:
                continue
            if search and search.lower() not in (p["name"].lower() + " " + v["sku"].lower()):
                continue
            rows.append({**v, "productName": p["name"], "collectionName": p["collectionName"],
                         "image": p["image"], "lowStock": is_low, "soldOut": is_sold})
        total = await db.store_inventory.count_documents({})
        return {"variants": rows, "totalSkus": total, "lowStockCount": low, "soldOutCount": sold,
                "collections": catalog.COLLECTIONS}

    class InvUpdate(BaseModel):
        stock: Optional[int] = Field(default=None, ge=0, le=1000000)
        delta: Optional[int] = None
        lowStockThreshold: Optional[int] = Field(default=None, ge=0, le=100000)
        trackInventory: Optional[bool] = None
        active: Optional[bool] = None

    @router.patch("/admin/inventory/{sku}")
    async def update_inventory(sku: str, body: InvUpdate, admin: dict = Depends(admin_dep)):
        v = await db.store_inventory.find_one({"sku": sku})
        if not v:
            raise HTTPException(status_code=404, detail="SKU not found")
        updates = {"updated_at": datetime.now(timezone.utc).isoformat()}
        if body.stock is not None:
            updates["stock"] = body.stock
        elif body.delta is not None:
            updates["stock"] = max(0, (v.get("stock", 0) or 0) + body.delta)
        if body.lowStockThreshold is not None:
            updates["lowStockThreshold"] = body.lowStockThreshold
        if body.trackInventory is not None:
            updates["trackInventory"] = body.trackInventory
        if body.active is not None:
            updates["active"] = body.active
        await db.store_inventory.update_one({"sku": sku}, {"$set": updates})
        return await db.store_inventory.find_one({"sku": sku}, {"_id": 0})

    class ProductMeta(BaseModel):
        active: bool

    @router.patch("/admin/products/{product_id}")
    async def update_product_meta(product_id: str, body: ProductMeta, admin: dict = Depends(admin_dep)):
        if product_id not in catalog.PRODUCT_BY_ID:
            raise HTTPException(status_code=404, detail="Product not found")
        await db.store_product_meta.update_one(
            {"productId": product_id},
            {"$set": {"productId": product_id, "active": body.active,
                      "updated_at": datetime.now(timezone.utc).isoformat()}}, upsert=True)
        return {"productId": product_id, "active": body.active}

    return router
