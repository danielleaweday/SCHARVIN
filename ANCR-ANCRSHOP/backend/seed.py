"""Seeds the ANCRSHOP catalog: departments, brands, products, collections."""
import random
from datetime import datetime, timezone, timedelta
from db import db

random.seed(42)

# 19 primary marketplaces / departments
DEPARTMENTS = [
    ("official-ancr-collections", "Official ANCR Collections", "Wear the ecosystem", "Shirt", "a"),
    ("ccdp-student-store", "CCDP Student Store", "Everything for the creative campus", "GraduationCap", "b"),
    ("creator-essentials", "Creator Essentials", "Daily tools of the craft", "PenTool", "c"),
    ("artist-merchandise", "Artist Merchandise", "Support the artists you love", "Disc3", "a"),
    ("educational-resources", "Educational Resources", "Learn, study, master", "BookOpen", "b"),
    ("studio-production", "Studio & Production", "Pro audio & production gear", "Mic", "c"),
    ("instruments", "Instruments", "Play your part", "Guitar", "a"),
    ("cameras-film", "Cameras & Film", "Capture in motion", "Camera", "b"),
    ("audio-equipment", "Audio Equipment", "Sound, engineered", "Headphones", "c"),
    ("software-marketplace", "Software Marketplace", "Creative software & licenses", "Monitor", "a"),
    ("office-studio-furniture", "Office & Studio Furniture", "Build your space", "Armchair", "b"),
    ("school-supplies", "School Supplies", "Stock up for the semester", "Backpack", "c"),
    ("wellness-viearta", "Wellness by VIEARTA", "Create in balance", "Heart", "a"),
    ("books-publications", "Books & Publications", "Read to rise", "Library", "b"),
    ("graduation-store", "Graduation Store", "Celebrate the milestone", "GraduationCap", "c"),
    ("print-production-services", "Print & Production Services", "Bring ideas to print", "Printer", "a"),
    ("partner-brands", "Partner Brands", "Curated partner labels", "Award", "b"),
    ("marketplace", "Marketplace", "Creator-made, ecosystem-approved", "Store", "c"),
    ("digital-products", "Digital Products", "Instant creative downloads", "Download", "a"),
]

# Ecosystem sub-brands
ANCR_BRANDS = [
    ("ccdp", "CCDP™", "Creative College of Digital Production"),
    ("ancr", "ANCR™", "The ecosystem, distilled"),
    ("cynaiah", "CYNAIAH™", "Bold. Elevated. Unmistakable"),
    ("ancrlab", "ANCRLAB™", "Where experiments become products"),
    ("ancrsync", "ANCRSYNC™", "Move in sync"),
    ("ancrview", "ANCRVIEW™", "See differently"),
    ("ancrwav", "ANCRWAV™", "Feel the frequency"),
    ("viearta", "VIEARTA™", "Wellness for creators"),
    ("vaulta", "VAULTA™", "Secure the vision"),
    ("coheir", "COHEIR™", "Inherit the future"),
    ("inheira", "INHEIRA™", "Legacy, reimagined"),
]

PARTNER_BRANDS = [
    ("sonaris", "Sonaris Audio", "Studio microphones & interfaces"),
    ("lumira", "Lumira Optics", "Cinema lenses & lighting"),
    ("kestrel", "Kestrel Instruments", "Guitars, keys & strings"),
    ("northpeak", "Northpeak", "Studio & office furniture"),
    ("orbital", "Orbital Software", "Creative software suites"),
    ("papergrid", "Papergrid", "Notebooks & stationery"),
]

ADJ = ["Signature", "Heritage", "Essential", "Pro", "Studio", "Field", "Classic",
       "Everyday", "Limited", "Core", "Flagship", "Editorial"]

# Product blueprints per department: (name, category, price_low, price_high, icon, digital, brand_pool)
BLUEPRINTS = {
    "official-ancr-collections": [
        ("Heavyweight Hoodie", "Hoodies", 88, 128, "Shirt", False, "ancr"),
        ("Oversized Tee", "T-Shirts", 42, 58, "Shirt", False, "ancr"),
        ("Boxy Crewneck", "Crewnecks", 78, 110, "Shirt", False, "ancr"),
        ("Selvedge Denim", "Denim", 148, 210, "Shirt", False, "ancr"),
        ("Technical Jacket", "Jackets", 210, 340, "Shirt", False, "ancr"),
        ("Fleece Joggers", "Joggers", 78, 98, "Shirt", False, "ancr"),
        ("Embroidered Cap", "Hats", 38, 48, "Shirt", False, "ancr"),
        ("Ribbed Beanie", "Beanies", 32, 42, "Shirt", False, "ancr"),
        ("Canvas Tote", "Bags", 34, 44, "Shirt", False, "ancr"),
        ("Utility Backpack", "Backpacks", 128, 168, "Backpack", False, "ancr"),
        ("Insulated Tumbler", "Drinkware", 32, 44, "Coffee", False, "ancr"),
        ("Leather Phone Case", "Accessories", 38, 52, "Smartphone", False, "ancr"),
        ("Felt Laptop Sleeve", "Accessories", 48, 68, "Laptop", False, "ancr"),
    ],
    "ccdp-student-store": [
        ("Campus Hoodie", "Student Apparel", 72, 92, "GraduationCap", False, "ccdp"),
        ("Orientation Kit", "Kits", 88, 118, "Package", False, "ccdp"),
        ("Class Supply Pack", "Supplies", 44, 64, "Package", False, "ccdp"),
        ("Semester Course Pack", "Course Packs", 128, 168, "BookOpen", False, "ccdp"),
        ("Creative Planner", "Planners", 34, 44, "Notebook", False, "ccdp"),
        ("Student Starter Bundle", "Bundles", 148, 198, "Package", False, "ccdp"),
        ("Welcome Kit", "Kits", 58, 78, "Package", False, "ccdp"),
        ("Faculty Crewneck", "Faculty", 74, 94, "Shirt", False, "ccdp"),
    ],
    "creator-essentials": [
        ("Layflat Journal", "Journals", 26, 38, "Notebook", False, "papergrid"),
        ("Grid Notebook Set", "Notebooks", 22, 32, "Notebook", False, "papergrid"),
        ("Precision Pen Trio", "Pens", 24, 34, "PenTool", False, "papergrid"),
        ("Hardbound Sketchbook", "Sketchbooks", 28, 40, "Notebook", False, "papergrid"),
        ("Desk Whiteboard", "Whiteboards", 48, 72, "Presentation", False, "papergrid"),
        ("Modular Desk Tray", "Desk", 38, 58, "Package", False, "northpeak"),
        ("Cable Organizer Set", "Organization", 24, 34, "Cable", False, "northpeak"),
        ("Travel Tech Pouch", "Travel", 42, 58, "Briefcase", False, "northpeak"),
    ],
    "artist-merchandise": [
        ("Tour Hoodie", "Apparel", 78, 98, "Disc3", False, "ancrwav"),
        ("180g Vinyl LP", "Vinyl", 34, 44, "Disc3", False, "ancrwav"),
        ("Deluxe CD", "CDs", 18, 26, "Disc3", False, "ancrwav"),
        ("Screenprint Poster", "Posters", 28, 42, "Image", False, "ancrwav"),
        ("Signed Collectible", "Collectibles", 88, 148, "Star", False, "ancrwav"),
        ("Fan Bundle", "Bundles", 98, 148, "Package", False, "ancrwav"),
        ("Limited Zine", "Books", 22, 32, "BookOpen", False, "ancrwav"),
    ],
    "educational-resources": [
        ("CCDP Textbook", "Textbooks", 68, 98, "BookOpen", False, "ccdp"),
        ("Printed Curriculum", "Curriculum", 58, 88, "BookOpen", False, "ccdp"),
        ("Skills Workbook", "Workbooks", 28, 38, "BookOpen", False, "ccdp"),
        ("Business of Creativity", "Business Books", 26, 34, "Library", False, "coheir"),
        ("Digital Course: Mixing", "Digital Courses", 89, 149, "Monitor", True, "ancrwav"),
        ("Certification Prep", "Certification", 129, 199, "Award", True, "ccdp"),
        ("Study Guide Set", "Study Guides", 24, 38, "BookOpen", False, "ccdp"),
    ],
    "studio-production": [
        ("Condenser Microphone", "Microphones", 149, 399, "Mic", False, "sonaris"),
        ("USB Audio Interface", "Interfaces", 179, 449, "Sliders", False, "sonaris"),
        ("Studio Headphones", "Headphones", 129, 299, "Headphones", False, "sonaris"),
        ("Nearfield Monitors", "Monitors", 249, 599, "Speaker", False, "sonaris"),
        ("Compact Mixer", "Mixers", 199, 449, "Sliders", False, "sonaris"),
        ("MIDI Keyboard Controller", "MIDI", 129, 349, "Piano", False, "sonaris"),
        ("Podcast Bundle", "Podcast", 299, 499, "Mic", False, "sonaris"),
        ("Streaming Kit", "Streaming", 249, 429, "Video", False, "sonaris"),
    ],
    "instruments": [
        ("Electric Guitar", "Guitars", 449, 1299, "Guitar", False, "kestrel"),
        ("Bass Guitar", "Basses", 499, 1199, "Guitar", False, "kestrel"),
        ("Acoustic Drum Kit", "Drums", 699, 1899, "Drum", False, "kestrel"),
        ("Digital Keyboard", "Keyboards", 399, 999, "Piano", False, "kestrel"),
        ("Upright Piano", "Pianos", 2499, 4999, "Piano", False, "kestrel"),
        ("String Set", "Strings", 12, 28, "Music", False, "kestrel"),
        ("Trumpet", "Brass", 349, 899, "Music", False, "kestrel"),
        ("Clarinet", "Woodwinds", 299, 699, "Music", False, "kestrel"),
    ],
    "cameras-film": [
        ("Cinema Camera", "Cinema", 1899, 4999, "Camera", False, "lumira"),
        ("Mirrorless Body", "Mirrorless", 999, 2499, "Camera", False, "lumira"),
        ("DSLR Body", "DSLR", 699, 1699, "Camera", False, "lumira"),
        ("Prime Lens 35mm", "Lenses", 399, 1299, "Aperture", False, "lumira"),
        ("LED Panel Light", "Lighting", 179, 549, "Lightbulb", False, "lumira"),
        ("3-Axis Gimbal", "Gimbals", 249, 649, "Move", False, "lumira"),
        ("Carbon Tripod", "Tripods", 149, 399, "Camera", False, "lumira"),
        ("CFexpress Card", "Storage", 89, 249, "HardDrive", False, "lumira"),
    ],
    "audio-equipment": [
        ("Wireless Headphones", "Headphones", 149, 349, "Headphones", False, "ancrwav"),
        ("In-Ear Monitors", "IEMs", 99, 299, "Headphones", False, "ancrwav"),
        ("Portable Speaker", "Speakers", 129, 299, "Speaker", False, "ancrwav"),
        ("Field Recorder", "Recorders", 179, 399, "Mic", False, "sonaris"),
        ("XLR Cable Pack", "Cables", 24, 44, "Cable", False, "sonaris"),
        ("Acoustic Isolation Shield", "Accessories", 79, 149, "Shield", False, "sonaris"),
    ],
    "software-marketplace": [
        ("DAW Studio License", "DAWs", 199, 599, "Monitor", True, "orbital"),
        ("Video Editor Pro", "Video Editing", 149, 399, "Video", True, "orbital"),
        ("Design Suite License", "Graphic Design", 129, 349, "Palette", True, "orbital"),
        ("AI Creative Toolkit", "AI Software", 99, 299, "Sparkles", True, "ancrlab"),
        ("Orchestral Sample Library", "Sample Libraries", 149, 449, "Music", True, "ancrwav"),
        ("Mixing Plugin Bundle", "Plugins", 99, 299, "Sliders", True, "ancrwav"),
        ("Editorial Font Family", "Fonts", 49, 129, "Type", True, "orbital"),
        ("Template Megapack", "Templates", 39, 99, "LayoutTemplate", True, "orbital"),
        ("Cloud Storage 2TB", "Cloud Storage", 59, 119, "Cloud", True, "vaulta"),
    ],
    "office-studio-furniture": [
        ("Producer Studio Desk", "Studio Desks", 449, 899, "Armchair", False, "northpeak"),
        ("Editing Workstation Desk", "Editing Desks", 499, 999, "Armchair", False, "northpeak"),
        ("Electric Standing Desk", "Standing Desks", 399, 799, "Armchair", False, "northpeak"),
        ("Ergonomic Office Chair", "Office Chairs", 299, 699, "Armchair", False, "northpeak"),
        ("Studio Stool", "Studio Chairs", 149, 299, "Armchair", False, "northpeak"),
        ("Modular Shelving Unit", "Shelving", 199, 449, "Package", False, "northpeak"),
        ("Acoustic Panel Set", "Acoustic Panels", 129, 299, "Shield", False, "northpeak"),
        ("Ambient Desk Lamp", "Lighting", 79, 149, "Lightbulb", False, "northpeak"),
    ],
    "school-supplies": [
        ("Everyday Backpack", "Backpacks", 68, 98, "Backpack", False, "ccdp"),
        ("Notebook 5-Pack", "Notebooks", 22, 32, "Notebook", False, "papergrid"),
        ("Highlighter Set", "Writing", 12, 22, "PenTool", False, "papergrid"),
        ("Scientific Calculator", "Electronics", 24, 44, "Calculator", False, "orbital"),
        ("Document Folder Set", "Organization", 18, 28, "Folder", False, "papergrid"),
        ("Laptop Charger", "Electronics", 34, 54, "Plug", False, "orbital"),
    ],
    "wellness-viearta": [
        ("Focus Blend Tea", "Wellness", 22, 32, "Heart", False, "viearta"),
        ("Blue-Light Glasses", "Eyewear", 68, 98, "Glasses", False, "viearta"),
        ("Studio Yoga Mat", "Fitness", 58, 88, "Heart", False, "viearta"),
        ("Aromatherapy Diffuser", "Wellness", 48, 78, "Wind", False, "viearta"),
        ("Recovery Journal", "Mindfulness", 24, 34, "Notebook", False, "viearta"),
        ("Ergonomic Wrist Rest", "Comfort", 28, 42, "Heart", False, "viearta"),
    ],
    "books-publications": [
        ("The Creator Economy", "Business", 24, 34, "Library", False, "coheir"),
        ("Leadership for Makers", "Leadership", 26, 36, "Library", False, "coheir"),
        ("Sound Design Handbook", "Creative", 34, 48, "BookOpen", False, "ancrwav"),
        ("Cinematography Foundations", "Creative", 38, 52, "BookOpen", False, "ancrview"),
        ("The ANCR Manifesto", "Publications", 28, 42, "BookOpen", False, "ancr"),
        ("Design Systems Annual", "Publications", 44, 64, "Library", False, "orbital"),
    ],
    "graduation-store": [
        ("Graduation Cap", "Caps", 24, 38, "GraduationCap", False, "ccdp"),
        ("Ceremonial Gown", "Gowns", 68, 98, "GraduationCap", False, "ccdp"),
        ("Honors Stole", "Stoles", 34, 54, "Award", False, "ccdp"),
        ("Diploma Frame", "Frames", 48, 88, "Image", False, "ccdp"),
        ("Alumni Crewneck", "Alumni", 72, 92, "Shirt", False, "ccdp"),
        ("Graduation Gift Set", "Gifts", 88, 148, "Gift", False, "ccdp"),
        ("Photography Package", "Photography", 149, 299, "Camera", False, "ancrview"),
    ],
    "print-production-services": [
        ("Business Cards (500)", "Business Cards", 39, 69, "CreditCard", False, "ancrlab"),
        ("Event Flyers (250)", "Flyers", 49, 89, "FileText", False, "ancrlab"),
        ("Large Format Poster", "Posters", 29, 79, "Image", False, "ancrlab"),
        ("Vinyl Banner", "Banners", 59, 149, "Flag", False, "ancrlab"),
        ("Die-Cut Stickers (100)", "Stickers", 24, 49, "Sticker", False, "ancrlab"),
        ("Custom Apparel Printing", "Apparel Printing", 79, 199, "Shirt", False, "ancrlab"),
        ("Softcover Book Printing", "Books", 99, 299, "BookOpen", False, "ancrlab"),
    ],
    "partner-brands": [
        ("Sonaris Signature Mic", "Audio", 249, 549, "Mic", False, "sonaris"),
        ("Lumira Cine Prime", "Optics", 899, 1899, "Aperture", False, "lumira"),
        ("Kestrel Studio Guitar", "Instruments", 649, 1499, "Guitar", False, "kestrel"),
        ("Northpeak Pro Desk", "Furniture", 599, 999, "Armchair", False, "northpeak"),
        ("Orbital Creative Cloud", "Software", 199, 499, "Cloud", True, "orbital"),
    ],
    "marketplace": [
        ("Indie Beat Pack", "Beats", 29, 79, "Music", True, "seller"),
        ("Cinematic LUT Pack", "LUTs", 24, 59, "Aperture", True, "seller"),
        ("Lightroom Preset Pack", "Presets", 19, 49, "Palette", True, "seller"),
        ("Original Sample Pack", "Sample Packs", 24, 69, "Music", True, "seller"),
        ("Photography Print", "Photography", 39, 129, "Image", False, "seller"),
        ("Creator Consulting Hour", "Services", 99, 249, "Users", True, "seller"),
        ("Creator Course", "Courses", 79, 199, "Monitor", True, "seller"),
        ("Handmade Apparel Drop", "Apparel", 48, 98, "Shirt", False, "seller"),
    ],
    "digital-products": [
        ("Producer Sample Vault", "Sample Packs", 39, 89, "Music", True, "ancrwav"),
        ("Motion Graphics Pack", "Templates", 29, 79, "Video", True, "ancrview"),
        ("Brand Kit Template", "Templates", 24, 59, "Palette", True, "orbital"),
        ("Social Media Preset Pack", "Presets", 19, 39, "Sparkles", True, "ancrlab"),
        ("Ebook: Launch Your Label", "Ebooks", 14, 29, "BookOpen", True, "coheir"),
        ("Notion Creator OS", "Templates", 29, 49, "LayoutTemplate", True, "orbital"),
    ],
}

COLORS = ["Onyx", "Bone", "Slate", "Cobalt", "Sand", "Forest", "Oxblood"]
SIZES = ["XS", "S", "M", "L", "XL", "XXL"]
APPAREL_CATS = {"Hoodies", "T-Shirts", "Crewnecks", "Denim", "Jackets", "Joggers",
                "Student Apparel", "Apparel", "Faculty", "Alumni", "Apparel Printing"}


def _slugify(s):
    return "".join(c if c.isalnum() else "-" for c in s.lower()).strip("-").replace("--", "-")


def build_products():
    brand_map = {b[0]: b[1] for b in (ANCR_BRANDS + PARTNER_BRANDS)}
    brand_map["seller"] = "CCDP Creator"
    products = []
    accent_cycle = ["a", "b", "c"]
    for dept_slug, dept_name, _, _, _ in DEPARTMENTS:
        for i, (name, cat, low, high, icon, digital, brand_key) in enumerate(BLUEPRINTS.get(dept_slug, [])):
            adj = ADJ[(i + hash(dept_slug)) % len(ADJ)]
            brand_name = brand_map.get(brand_key, "ANCR")
            full_name = f"{adj} {name}"
            slug = _slugify(f"{brand_key}-{name}-{dept_slug[:6]}-{i}")
            price = round(random.uniform(low, high), 0) - 0.01 + 0.0
            price = round(random.uniform(low, high))
            price = float(round(price)) - 0.01
            compare = round(price * random.choice([1.0, 1.15, 1.25, 1.3]) + 0.99, 2) if random.random() > 0.4 else None
            rating = round(random.uniform(4.2, 5.0), 1)
            reviews = random.randint(8, 640)
            badges = []
            if random.random() > 0.75:
                badges.append("New")
            if random.random() > 0.72:
                badges.append("Trending")
            if random.random() > 0.8:
                badges.append("Creator Pick")
            if dept_slug in ("official-ancr-collections", "artist-merchandise") and random.random() > 0.85:
                badges.append("Limited Drop")
            variants = []
            if cat in APPAREL_CATS:
                variants.append({"type": "Size", "options": SIZES[:random.randint(4, 6)]})
                variants.append({"type": "Color", "options": random.sample(COLORS, random.randint(2, 4))})
            elif cat in ("Hats", "Beanies"):
                variants.append({"type": "Color", "options": random.sample(COLORS, 3)})
            features = [
                f"Designed by {brand_name}",
                "Educational & member pricing eligible" if digital or dept_slug in ("studio-production", "instruments", "cameras-film", "software-marketplace") else "Ships from ANCR fulfillment",
                "Backed by ANCR quality standards",
            ]
            products.append({
                "slug": slug,
                "name": full_name,
                "subtitle": f"{brand_name} · {cat}",
                "description": f"{full_name} from {brand_name}. Part of the {dept_name} within the ANCR ecosystem — engineered for creators who demand more from every tool they touch.",
                "brand": brand_name,
                "brand_key": brand_key,
                "department": dept_slug,
                "department_name": dept_name,
                "category": cat,
                "price": max(price, 4.99),
                "compare_at_price": compare,
                "currency": "usd",
                "rating": rating,
                "review_count": reviews,
                "badges": badges,
                "variants": variants,
                "stock": 0 if random.random() > 0.95 else random.randint(3, 250),
                "low_stock_threshold": 8,
                "is_digital": digital,
                "vendor_id": "ancr-official" if brand_key != "seller" else f"creator-{i%5}",
                "vendor_name": brand_name if brand_key != "seller" else "CCDP Creator Studio",
                "icon": icon,
                "accent": accent_cycle[i % 3],
                "features": features,
                "specs": {"SKU": slug.upper()[:16], "Fulfillment": "Digital delivery" if digital else "Standard shipping"},
                "tags": [cat.lower(), brand_name.lower().replace("™", ""), dept_name.lower()],
                "active": True,
                "created_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(0, 90))).isoformat(),
                "sold_count": random.randint(0, 900),
            })
    return products


def build_collections(products):
    by_dept = {}
    for p in products:
        by_dept.setdefault(p["department"], []).append(p["slug"])
    def pick(pred, n):
        pool = [p["slug"] for p in products if pred(p)]
        random.shuffle(pool)
        return pool[:n]
    return [
        {"slug": "new-arrivals", "title": "New Arrivals", "subtitle": "Fresh into the ecosystem",
         "type": "collection", "accent": "a", "featured": True,
         "product_slugs": pick(lambda p: "New" in p["badges"], 12) or pick(lambda p: True, 12)},
        {"slug": "trending-now", "title": "Trending Now", "subtitle": "What creators are buying this week",
         "type": "collection", "accent": "b", "featured": True,
         "product_slugs": pick(lambda p: "Trending" in p["badges"], 12) or pick(lambda p: p["sold_count"] > 400, 12)},
        {"slug": "creator-picks", "title": "Creator Picks", "subtitle": "Curated by verified ANCR creators",
         "type": "collection", "accent": "c", "featured": True,
         "product_slugs": pick(lambda p: "Creator Pick" in p["badges"], 12) or pick(lambda p: True, 12)},
        {"slug": "limited-drops", "title": "Limited Drops", "subtitle": "Here today. Archived tomorrow.",
         "type": "drop", "accent": "a", "featured": True,
         "product_slugs": pick(lambda p: "Limited Drop" in p["badges"], 8) or pick(lambda p: p["department"] == "artist-merchandise", 8)},
        {"slug": "start-your-studio", "title": "Start Your Studio", "subtitle": "The complete home-studio starting line",
         "type": "gift-guide", "accent": "b", "featured": True,
         "product_slugs": pick(lambda p: p["department"] in ("studio-production", "audio-equipment", "office-studio-furniture"), 10)},
        {"slug": "campus-ready", "title": "Campus Ready", "subtitle": "Everything for the CCDP semester ahead",
         "type": "gift-guide", "accent": "c", "featured": True,
         "product_slugs": pick(lambda p: p["department"] in ("ccdp-student-store", "school-supplies", "educational-resources"), 10)},
        {"slug": "gift-guide", "title": "The Creator Gift Guide", "subtitle": "Give the tools of the craft",
         "type": "gift-guide", "accent": "a", "featured": False,
         "product_slugs": pick(lambda p: p["price"] < 100, 12)},
    ]


def build_campaigns():
    return [
        {"slug": "ancr-flagship", "title": "Built for the culture. Designed for what's next.",
         "eyebrow": "ANCR Flagship · Discover. Develop. Deploy.", "cta": "Shop ANCR Collections",
         "cta_link": "/shop/official-ancr-collections",
         "body": "The official ANCR apparel line — premium heavyweight fits engineered for the ones who create the future.",
         "image": "/brand/campaign-c.jpg", "accent": "a", "order": 1},
        {"slug": "season-of-creation", "title": "The Season of Creation",
         "eyebrow": "CCDP × ANCR", "cta": "Shop CCDP Student Store",
         "cta_link": "/shop/ccdp-student-store",
         "body": "Contemporary Creative Development Program apparel. Create. Collaborate. Develop. Propel.",
         "image": "/brand/campaign-a.jpg", "accent": "b", "order": 2},
        {"slug": "ancr-universe", "title": "The ANCR Universe",
         "eyebrow": "Details That Matter", "cta": "Explore the collection",
         "cta_link": "/shop/official-ancr-collections",
         "body": "Premium embroidery, custom hardware, signature interior prints and reflective graphics. ANCR is more than a brand — it's a movement.",
         "image": "/brand/campaign-b.jpg", "accent": "c", "order": 3},
        {"slug": "the-sound-series", "title": "ANCRWAV™ · ANCRMEDIA™ · ANCRVIEW™",
         "eyebrow": "The Sound Series", "cta": "Enter the drop",
         "cta_link": "/collections/limited-drops",
         "body": "Where music lives. See beyond. Share impact. Artist merch and audio-first apparel from the ANCR media brands.",
         "image": "/brand/campaign-d.jpg", "accent": "a", "order": 4},
        {"slug": "viearta-wellness", "title": "Wear your wellness. Live your VIEARTA.",
         "eyebrow": "Wellness by VIEARTA™", "cta": "Shop VIEARTA",
         "cta_link": "/shop/wellness-viearta",
         "body": "Creative health, wellness & human performance. Premium performance apparel — built for more than the workout.",
         "image": "/brand/campaign-viearta.png", "accent": "c", "order": 5},
        {"slug": "cynaiah-denim", "title": "Vision. Story. Impact.",
         "eyebrow": "CYNAIAH™ Denim Collection", "cta": "Shop the collection",
         "cta_link": "/shop/official-ancr-collections",
         "body": "Cinematic by design. Timeless by intent. Elevated denim crafted for creators — this isn't just denim, this is CYNAIAH.",
         "image": "/brand/campaign-cynaiah.png", "accent": "b", "order": 6},
        {"slug": "ancrlab-collection", "title": "Where creators become.",
         "eyebrow": "ANCRLAB™ — Designed for what's next", "cta": "Explore ANCRLAB",
         "cta_link": "/shop/official-ancr-collections",
         "body": "Create with purpose. Build with vision. Leave your mark. The experimental line where ideas become product.",
         "image": "/brand/campaign-ancrlab.jpg", "accent": "a", "order": 7},
        {"slug": "ancrid-collection", "title": "Built different. Connected forever.",
         "eyebrow": "ANCRID — One ID. All access.", "cta": "Join the movement",
         "cta_link": "/shop/official-ancr-collections",
         "body": "The universal identity layer, expressed in denim. Every piece represents identity, purpose and impact.",
         "image": "/brand/campaign-ancrid.jpg", "accent": "b", "order": 8},
    ]


async def refresh_campaigns():
    await db.campaigns.delete_many({})
    await db.campaigns.insert_many(build_campaigns())


COUPONS = [
    {"code": "CREATOR10", "type": "percent", "value": 10, "active": True, "min_order": 0, "description": "10% off your first order"},
    {"code": "STUDENT15", "type": "percent", "value": 15, "active": True, "min_order": 50, "description": "15% student discount over $50"},
    {"code": "ANCR25", "type": "fixed", "value": 25, "active": True, "min_order": 150, "description": "$25 off orders over $150"},
]


async def seed_catalog(force=False):
    count = await db.products.count_documents({})
    if count > 0 and not force:
        return
    await db.products.delete_many({})
    await db.departments.delete_many({})
    await db.brands.delete_many({})
    await db.collections_c.delete_many({})
    await db.campaigns.delete_many({})
    await db.coupons.delete_many({})

    products = build_products()
    await db.products.insert_many(products)

    dept_counts = {}
    for p in products:
        dept_counts[p["department"]] = dept_counts.get(p["department"], 0) + 1
    depts = [{"slug": s, "name": n, "tagline": t, "icon": ic, "accent": ac, "product_count": dept_counts.get(s, 0)}
             for (s, n, t, ic, ac) in DEPARTMENTS]
    await db.departments.insert_many(depts)

    brands = [{"slug": s, "name": n, "tagline": t, "type": "ecosystem"} for (s, n, t) in ANCR_BRANDS]
    brands += [{"slug": s, "name": n, "tagline": t, "type": "partner"} for (s, n, t) in PARTNER_BRANDS]
    await db.brands.insert_many(brands)

    await db.collections_c.insert_many(build_collections(products))
    await db.campaigns.insert_many(build_campaigns())
    await db.coupons.insert_many(COUPONS)
