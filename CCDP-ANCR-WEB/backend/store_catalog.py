"""CCDP × ANCR merchandise store — server-side source of truth for the catalog and pricing.

All prices are defined here (never trusted from the client). The catalog is exposed
read-only to the storefront and used to build Stripe Checkout line items server-side.
Product imagery is premium generated brand-aesthetic mockups (no official logos on merch).
"""

APPAREL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"]
ONE_SIZE = ["One Size"]

# Per product-type: display label, USD price (float), mockup image, available sizes, category.
TYPE_META = {
    "tshirt":   {"label": "T-Shirt",     "price": 34.0,  "sizes": APPAREL_SIZES, "category": "Apparel",
                 "image": "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/7b0edadd9896a1de9211d8729abccb6cff7b6cc1cce93ea553a6ee87ad12c84c.jpeg"},
    "hoodie":   {"label": "Hoodie",      "price": 68.0,  "sizes": APPAREL_SIZES, "category": "Apparel",
                 "image": "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/56483573c31ea309b87b8449bff40eae86f9deea1c57a198d7de47ea9b2b6446.jpeg"},
    "crewneck": {"label": "Crewneck",    "price": 62.0,  "sizes": APPAREL_SIZES, "category": "Apparel",
                 "image": "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/570c3d0f4efc3e873b6be0d10670d7619249daf224c7d8513da7711964f29818.jpeg"},
    "joggers":  {"label": "Joggers",     "price": 58.0,  "sizes": APPAREL_SIZES, "category": "Apparel",
                 "image": "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/5fbb4650a44004ccf0baa489883951604db336fe091f0d2b0e80fdd86a981382.jpeg"},
    "denim":    {"label": "Denim Jacket","price": 98.0,  "sizes": APPAREL_SIZES, "category": "Outerwear",
                 "image": "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/5078921c1adda1d0c79cede58ed7f39d34fb505bbd18b8398a719212e83d8064.jpeg"},
    "jacket":   {"label": "Coach Jacket","price": 110.0, "sizes": APPAREL_SIZES, "category": "Outerwear",
                 "image": "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/8f1156ac504e3bddd68dd4890c9321aec515ee222aea9c1327372bda340cc7a3.jpeg"},
    "hat":      {"label": "Cap",         "price": 32.0,  "sizes": ONE_SIZE, "category": "Accessories",
                 "image": "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/de8bae9ed37852ca798fe22e1494afe8a1bd63385098082b396cb28f40293bd3.jpeg"},
    "tote":     {"label": "Tote Bag",    "price": 28.0,  "sizes": ONE_SIZE, "category": "Accessories",
                 "image": "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/a5dd9ac965d31a7ded8ff49b726ae575741cffbebbad494e55e7553e329fd12f.jpeg"},
    "backpack": {"label": "Backpack",    "price": 78.0,  "sizes": ONE_SIZE, "category": "Accessories",
                 "image": "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/458437424ce4a2b2942f5c480777d32b0c5406ba799a638360ffa94a83cf6500.jpeg"},
    "bottle":   {"label": "Water Bottle","price": 30.0,  "sizes": ONE_SIZE, "category": "Accessories",
                 "image": "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/8fe43200c84fa60328f88940ae63a3863b1a9ae5af83dc7b4fa398ed7d29c261.jpeg"},
    "stickers": {"label": "Sticker Pack","price": 12.0,  "sizes": ONE_SIZE, "category": "Accessories",
                 "image": "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/8ef0fb7ac20f2e95fb58cabca32e74fca70f3e3b39b48521a386128a455dea7a.jpeg"},
    "notebook": {"label": "Notebook",    "price": 22.0,  "sizes": ONE_SIZE, "category": "Accessories",
                 "image": "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/9251f3aa94edf38e942309fd87e6eca379549adef6e5719c5aa52b6c7fd96b29.jpeg"},
}

# THE RLMG and Nu RENSSNCE spellings are intentional — do not "correct" them.
COLLECTIONS = [
    {"id": "ccdp",       "name": "CCDP",        "accent": "#7a3ff2", "tagline": "The flagship program collection.",
     "blurb": "Everyday essentials for the CCDP community — the program that unites creative education, technology, and industry."},
    {"id": "ancr",       "name": "ANCR",        "accent": "#2e7bff", "tagline": "The operating-system line.",
     "blurb": "Pieces inspired by ANCR — the operating system powering the CCDP creative ecosystem."},
    {"id": "cynaiah",    "name": "CYNAIAH",     "accent": "#e0349e", "tagline": "School of Film & Visual Storytelling.",
     "blurb": "Cinematic apparel and goods for storytellers, filmmakers, and visual creators."},
    {"id": "viearta",    "name": "VIEARTA",     "accent": "#06b6d4", "tagline": "Visual arts & design.",
     "blurb": "For visual artists and designers building across mediums and disciplines."},
    {"id": "coheir",     "name": "COHEIR",      "accent": "#f5a524", "tagline": "Ownership & legacy.",
     "blurb": "Wear the story of ownership, inheritance, and building creative legacy."},
    {"id": "ancrlab",    "name": "ANCRLAB",     "accent": "#22c55e", "tagline": "Where creators build.",
     "blurb": "Studio-ready gear for makers, experimenters, and builders in the lab."},
    {"id": "vaulta",     "name": "VAULTA",      "accent": "#eab308", "tagline": "Creative enterprise.",
     "blurb": "For the creative entrepreneur — build, own, and prosper."},
    {"id": "rlmg",       "name": "THE RLMG",    "accent": "#ff5c39", "tagline": "The Grateful Music movement.",
     "blurb": "The RLMG collection — a movement of gratitude, sound, and cultural momentum."},
    {"id": "nurenssnce", "name": "Nu RENSSNCE", "accent": "#a855f7", "tagline": "A new creative renaissance.",
     "blurb": "A new renaissance for creators — art, ideas, and reinvention."},
    {"id": "stout",      "name": "STOUT",       "accent": "#64748b", "tagline": "Everyday essentials.",
     "blurb": "Clean, durable everyday staples built to last."},
]

# Core lineup carried by every collection + premium pieces for flagship collections.
_CORE = ["tshirt", "hoodie", "crewneck", "hat", "tote", "bottle", "stickers", "notebook"]
_PREMIUM = ["joggers", "denim", "jacket", "backpack"]
_FLAGSHIP = {"ccdp", "ancr", "rlmg", "nurenssnce"}

_BLURBS = {
    "tshirt": "Premium heavyweight cotton tee with a soft hand-feel and a clean, structured fit.",
    "hoodie": "Heavyweight fleece pullover hoodie with a plush interior and relaxed silhouette.",
    "crewneck": "Classic fleece crewneck with a timeless drop-shoulder cut.",
    "joggers": "Tapered fleece joggers with ribbed cuffs and a refined everyday fit.",
    "denim": "Structured indigo denim jacket built for layering season after season.",
    "jacket": "Water-resistant coach jacket with a matte finish and snap closure.",
    "hat": "Structured six-panel cap with a curved brim and adjustable strap.",
    "tote": "Heavyweight natural canvas tote with reinforced handles.",
    "backpack": "Minimalist commuter backpack with a padded laptop sleeve.",
    "bottle": "Double-walled insulated stainless-steel bottle that keeps drinks cold for hours.",
    "stickers": "Assorted die-cut vinyl sticker pack in the CCDP spectrum palette.",
    "notebook": "Hardcover dotted notebook with an elastic band and premium paper.",
}


def _build_products():
    products = []
    for col in COLLECTIONS:
        types = _CORE + (_PREMIUM if col["id"] in _FLAGSHIP else [])
        for t in types:
            meta = TYPE_META[t]
            products.append({
                "id": f"{col['id']}-{t}",
                "collectionId": col["id"],
                "collectionName": col["name"],
                "accent": col["accent"],
                "type": t,
                "typeLabel": meta["label"],
                "category": meta["category"],
                "name": f"{col['name']} {meta['label']}",
                "price": meta["price"],
                "image": meta["image"],
                "sizes": meta["sizes"],
                "blurb": _BLURBS[t],
            })
    return products


PRODUCTS = _build_products()
PRODUCT_BY_ID = {p["id"]: p for p in PRODUCTS}

# Physical goods → general tangible-goods tax code (used with Stripe automatic tax).
PHYSICAL_TAX_CODE = "txcd_99999999"

# Countries the store ships to (Stripe Checkout shipping address collection).
SHIP_COUNTRIES = ["US", "CA", "GB", "AU", "IE", "NZ", "FR", "DE", "NL", "ES", "IT", "SE", "NO", "DK", "FI", "BE", "AT", "CH", "PT", "JP", "SG"]


def catalog_payload():
    return {
        "collections": COLLECTIONS,
        "products": PRODUCTS,
        "types": [{"id": k, **{kk: vv for kk, vv in v.items() if kk != "image"}, "image": v["image"]} for k, v in TYPE_META.items()],
    }
