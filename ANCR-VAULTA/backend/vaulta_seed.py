"""Rich demo seed data for Vaulta™. Populates a plausible artist showcase."""
import uuid
import random
from datetime import datetime, timezone, timedelta

DEMO_USERS = {
    "Student":     {"email": "student@vaulta.io",     "name": "Jordan Wells"},
    "Faculty":     {"email": "faculty@vaulta.io",     "name": "Dr. Renee Blackwood"},
    "Artist":      {"email": "artist@vaulta.io",      "name": "Kai Marlow"},
    "Manager":     {"email": "manager@vaulta.io",     "name": "Simone Delacroix"},
    "Accountant":  {"email": "accountant@vaulta.io",  "name": "Marcus Levin CPA"},
    "Attorney":    {"email": "attorney@vaulta.io",    "name": "Priya Ramanathan Esq."},
    "Publisher":   {"email": "publisher@vaulta.io",   "name": "Atlas Row Publishing"},
    "Institution": {"email": "institution@vaulta.io", "name": "Berklee Continuing Education"},
    "Employer":    {"email": "employer@vaulta.io",    "name": "Sable Row Records"},
}

INCOME_CATEGORIES = [
    ("Streaming Revenue",   "Spotify",         [2400, 6800]),
    ("Streaming Revenue",   "Apple Music",     [1200, 4200]),
    ("Streaming Revenue",   "Tidal",           [420, 1400]),
    ("Streaming Revenue",   "Amazon Music",    [380, 1200]),
    ("Publishing",          "Sync Fee",        [3500, 24000]),
    ("Publishing",          "Mechanical",      [800, 3400]),
    ("Performance Fees",    "Concert",         [4500, 22000]),
    ("Performance Fees",    "Festival",        [8000, 35000]),
    ("Performance Fees",    "Private Event",   [3500, 12000]),
    ("Producer Fees",       "Track Production", [2000, 9500]),
    ("Session Work",        "Studio Session",  [500, 2200]),
    ("Teaching",            "Berklee Guest Class", [800, 2500]),
    ("Teaching",            "Masterclass",     [1200, 4000]),
    ("Merchandise",         "Tour Merch",      [1200, 8400]),
    ("Merchandise",         "Vinyl Sales",     [600, 3200]),
    ("Licensing",           "Film License",    [5000, 40000]),
    ("Synchronization",     "Netflix Sync",    [8500, 32000]),
    ("Brand Deals",         "Fender Partnership", [6000, 15000]),
    ("Sponsorships",        "Ableton Sponsor", [4000, 10000]),
    ("Grants",              "NYSCA Grant",     [7500, 25000]),
    ("Scholarships",        "ANCRA Scholarship", [3000, 12000]),
    ("Crowdfunding",        "Patreon",         [800, 3200]),
    ("Investments",         "Dividend",        [200, 1400]),
    ("Passive Income",      "Royalty Advance", [4000, 16000]),
    ("Neighboring Rights",  "SoundExchange",   [900, 4200]),
]

EXPENSE_CATEGORIES = [
    ("Travel",         "Uber / Lyft",       [40, 320]),
    ("Hotels",         "Marriott",          [180, 720]),
    ("Hotels",         "Airbnb",            [140, 560]),
    ("Flights",        "Delta",             [380, 1400]),
    ("Flights",        "United",            [420, 1600]),
    ("Rental Cars",    "Hertz",             [120, 480]),
    ("Equipment",      "Sweetwater",        [220, 3800]),
    ("Equipment",      "B&H Photo",         [340, 5200]),
    ("Studio Time",    "Electric Lady",     [400, 2200]),
    ("Studio Time",    "Jungle City",       [350, 1900]),
    ("Marketing",      "Meta Ads",          [200, 1800]),
    ("Marketing",      "TikTok Ads",        [150, 1200]),
    ("Advertising",    "Google Ads",        [120, 900]),
    ("Payroll",        "Tour Musician",     [1500, 4200]),
    ("Assistants",     "Personal Assistant", [800, 2400]),
    ("Management",     "Manager Commission", [1200, 6800]),
    ("Attorney",       "Legal Fees",        [400, 2800]),
    ("Accounting",     "CPA Retainer",      [350, 1400]),
    ("Subscriptions",  "Splice",            [12, 40]),
    ("Subscriptions",  "Adobe Creative",    [55, 90]),
    ("Subscriptions",  "Notion Team",       [24, 60]),
    ("Insurance",      "Instrument Insurance", [80, 220]),
    ("Insurance",      "Liability",         [110, 320]),
    ("Education",      "Berklee Course",    [340, 1400]),
    ("Meals",          "Post-show Dinner",  [45, 240]),
    ("Meals",          "Business Lunch",    [30, 180]),
    ("Office",         "WeWork",            [180, 420]),
    ("Utilities",      "Studio Internet",   [80, 140]),
    ("Software",       "Pro Tools",         [30, 300]),
    ("Software",       "Ableton Live",      [0, 240]),
    ("Production",     "Mixing Engineer",   [600, 2800]),
    ("Production",     "Mastering",         [180, 700]),
    ("Video",          "Music Video Prod.", [1200, 8400]),
    ("Photography",    "Press Shoot",       [400, 2400]),
    ("Wardrobe",       "Stylist",           [280, 1400]),
    ("Miscellaneous",  "Studio Snacks",     [15, 90]),
]

ROYALTY_SOURCES = [
    ("ASCAP",         "Performance",        [420, 3200]),
    ("BMI",           "Performance",        [380, 2800]),
    ("SESAC",         "Performance",        [220, 1600]),
    ("SoundExchange", "Digital Neighboring", [340, 2200]),
    ("MLC",           "Mechanical",         [280, 1800]),
    ("Harry Fox",     "Mechanical",         [220, 1400]),
]

SONGS = [
    ("Obsidian Hours",       "Kai Marlow, Nia Whitfield",     ["Kai 50%", "Nia 50%"], "Atlas Row", "ASCAP"),
    ("Cathedral of Static",  "Kai Marlow",                    ["Kai 100%"],            "Atlas Row", "ASCAP"),
    ("Violet Divide",        "Kai Marlow, Diego Ortiz",       ["Kai 60%", "Diego 40%"], "Atlas Row", "BMI"),
    ("Neon Chapel",          "Kai Marlow, Simone Ali",        ["Kai 50%", "Simone 50%"], "Sony/ATV", "ASCAP"),
    ("Long Way to Alaska",   "Kai Marlow",                    ["Kai 100%"],            "Atlas Row", "ASCAP"),
    ("Blue Room, Yellow Sun","Kai Marlow, Prod: Reef",        ["Kai 70%", "Reef 30%"], "Atlas Row", "BMI"),
    ("Grand Central 3AM",    "Kai Marlow",                    ["Kai 100%"],            "Atlas Row", "ASCAP"),
    ("Feather + Iron",       "Kai Marlow, Ari Kite",          ["Kai 50%", "Ari 50%"],  "Warner Chappell", "SESAC"),
    ("Hymn for the Overnight","Kai Marlow",                   ["Kai 100%"],            "Atlas Row", "ASCAP"),
    ("Coastal Static",       "Kai Marlow, Prod: Reef",        ["Kai 65%", "Reef 35%"], "Atlas Row", "BMI"),
    ("Room 402",             "Kai Marlow",                    ["Kai 100%"],            "Atlas Row", "ASCAP"),
    ("Ballad of the Unlit",  "Kai Marlow, Simone Ali",        ["Kai 55%", "Simone 45%"], "Sony/ATV", "ASCAP"),
]

CONTRACTS = [
    ("Recording Agreement — Sable Row Records", "Recording Agreement", "Sable Row Records", 240000, "Signed", "2024-06-14", "2028-06-14"),
    ("Publishing Admin — Atlas Row",            "Publishing Agreement", "Atlas Row Publishing", 85000, "Signed", "2023-11-02", "2026-11-02"),
    ("Sync License — Netflix S2",               "Licensing",           "Netflix, Inc.",       32000, "Signed", "2025-09-11", "2027-09-11"),
    ("Producer Agreement — Reef Ortiz",         "Producer Agreement",  "Reef Ortiz",           7500, "Signed", "2025-02-18", "2026-02-18"),
    ("Session Agreement — Electric Lady",       "Session Agreement",   "Electric Lady Studios", 4200, "Signed", "2025-08-04", "2026-08-04"),
    ("Management Agreement — Simone D.",        "Management Agreement","Simone Delacroix",    60000, "Signed", "2023-04-01", "2026-04-01"),
    ("Performance Contract — Panorama Fest",    "Performance Contract","Panorama Festival",   28000, "Signed", "2025-06-20", "2025-07-25"),
    ("NDA — A24 Sync",                          "NDA",                 "A24 Films",               0, "Signed", "2025-10-01", "2027-10-01"),
    ("Endorsement — Fender",                    "Endorsement",         "Fender Musical Instruments", 22000, "Pending Signature", None, "2026-12-31"),
    ("Internship Placement — Berklee",          "Internship",          "Berklee College of Music", 4800, "Signed", "2025-01-15", "2025-05-15"),
]

INVOICES = [
    ("Panorama Festival",           "billing@panorama.io",        22000, "Paid",    -14),
    ("Fender Musical Instruments",  "ap@fender.com",              12000, "Paid",    -22),
    ("A24 Films",                   "sync@a24films.com",          18500, "Pending",  12),
    ("Netflix Music Licensing",     "sync@netflix.com",           32000, "Pending",  25),
    ("Ableton AG",                  "sponsors@ableton.com",        6000, "Late",    -8),
    ("Berklee College of Music",    "guests@berklee.edu",          2400, "Paid",    -35),
    ("Red Bull Studios",            "studios@redbull.com",         4500, "Pending",  9),
    ("Genesis Sound",               "billing@genesissound.com",    3200, "Recurring", 6),
    ("Marlow Merch (retail split)", "orders@sablerow.com",         5400, "Paid",    -3),
    ("Coliseum Records (sync)",     "clearance@coliseum.com",      8800, "Pending",  18),
]

BUDGETS = [
    ("Q1 2026 Monthly Budget",     "Monthly",       12000,  6820),
    ("Obsidian Hours Tour — East", "Tour",          140000, 92400),
    ("Album: 'The Overnight'",     "Album",         220000, 168200),
    ("Netflix Sync Delivery",      "Project",       35000, 12800),
    ("Short Film: 'Room 402'",     "Film",          55000, 28900),
    ("Writing Camp — Costa Rica",  "Writing Camp",  38000, 24100),
    ("NYSCA Grant Budget",         "Grant",         25000, 8200),
    ("Foundation — Ops Dept",      "Department",    72000, 41800),
    ("Emergency Fund",             "Savings",       50000, 32000),
    ("Tax Reserve 2026",           "Savings",       48000, 27400),
]

FUNDING_OPPS = [
    ("NYSCA Individual Artist Grant",   "Grant",       25000, "2026-04-15", "State support for NY-based artists.", "Recommended"),
    ("Berklee Popular Music Scholarship","Scholarship", 12000, "2026-05-01", "Merit-based ANCRA-aligned award.", "Recommended"),
    ("Sundance Composer Fellowship",    "Fellowship",  40000, "2026-06-30", "Composer fellowship + mentorship.", "Recommended"),
    ("Kickstarter Music Vertical",      "Crowdfunding", 60000, "Rolling",   "Fan-funded album production.", "Open"),
    ("Y Combinator W26 (creator OS)",   "Accelerator", 500000,"2026-03-15", "For creator-facing companies.", "Long shot"),
    ("ASCAP Foundation Grant",          "Grant",       15000, "2026-02-28", "Grant to emerging songwriters.", "Recommended"),
    ("Amazon Music Breakthrough",       "Competition", 30000, "2026-05-20", "Winner receives label services.", "Open"),
    ("MacDowell Fellowship",            "Fellowship",  22000, "2026-09-15", "Residency for composers.", "Recommended"),
]

VAULT_DOCS = [
    ("2024 Federal Tax Return",  "Tax Returns", 1240),
    ("2023 Federal Tax Return",  "Tax Returns", 1180),
    ("Sable Row LLC — Formation","Business Documents", 420),
    ("Foundation 501(c)(3) Determination","Business Documents", 380),
    ("Passport (Kai Marlow)",    "Identification", 220),
    ("Global Entry Card",        "Identification", 80),
    ("Netflix Sync Master",      "Contracts", 640),
    ("Recording Agreement — Sable Row","Contracts", 820),
    ("Instrument Insurance Policy","Insurance", 210),
    ("ASCAP Publisher Certificate","Certificates", 90),
    ("Estate Plan — Draft",      "Estate Planning", 340),
    ("Emergency Contacts + Wire Info","Emergency Documents", 40),
    ("Berklee Diploma",          "Certificates", 60),
    ("Guitar Center Receipt Bundle","Receipts", 30),
]


def _iso(days_ago: int) -> str:
    return (datetime.now(timezone.utc) - timedelta(days=days_ago)).isoformat()[:10]


async def seed_demo_data(db, owner_id: str):
    random.seed(42)
    now = datetime.now(timezone.utc)

    # ---- Transactions across 14 months
    txns = []
    for month_offset in range(14, 0, -1):
        base_date = now - timedelta(days=month_offset * 30)
        for cat, sub, rng in INCOME_CATEGORIES:
            if random.random() < 0.55:
                amt = random.randint(rng[0], rng[1])
                d = base_date - timedelta(days=random.randint(0, 27))
                txns.append({
                    "id": str(uuid.uuid4()), "owner_id": owner_id,
                    "type": "income", "category": cat, "subcategory": sub,
                    "amount": amt, "currency": "USD",
                    "date": d.isoformat()[:10],
                    "description": f"{sub} payout",
                    "client": sub, "tags": [], "created_at": now.isoformat(),
                })
        for cat, sub, rng in EXPENSE_CATEGORIES:
            if random.random() < 0.62:
                amt = random.randint(rng[0], rng[1])
                if amt == 0:
                    continue
                d = base_date - timedelta(days=random.randint(0, 27))
                txns.append({
                    "id": str(uuid.uuid4()), "owner_id": owner_id,
                    "type": "expense", "category": cat, "subcategory": sub,
                    "amount": amt, "currency": "USD",
                    "date": d.isoformat()[:10],
                    "description": sub, "client": sub,
                    "tags": [], "created_at": now.isoformat(),
                })
    await db.transactions.insert_many(txns)

    # ---- Royalties
    royalty_docs = []
    for month_offset in range(12, 0, -1):
        for pro, kind, rng in ROYALTY_SOURCES:
            if random.random() < 0.7:
                d = now - timedelta(days=month_offset * 30 + random.randint(0, 20))
                royalty_docs.append({
                    "id": str(uuid.uuid4()), "owner_id": owner_id,
                    "pro": pro, "type": kind,
                    "amount": random.randint(rng[0], rng[1]),
                    "period": d.isoformat()[:7],
                    "status": random.choice(["Paid", "Paid", "Paid", "Pending"]),
                    "song": random.choice(SONGS)[0],
                    "date": d.isoformat()[:10],
                    "created_at": now.isoformat(),
                })
    await db.royalties.insert_many(royalty_docs)

    # ---- Songs
    song_docs = []
    for title, writers, splits, publisher, pro in SONGS:
        song_docs.append({
            "id": str(uuid.uuid4()), "owner_id": owner_id,
            "title": title, "writers": writers, "splits": splits,
            "publisher": publisher, "pro": pro,
            "iswc": f"T-{random.randint(100000000, 999999999)}",
            "isrc": f"USSR1{random.randint(2200000, 2699999)}",
            "upc":  f"88997{random.randint(100000, 999999)}",
            "registration_status": random.choice(["Registered", "Registered", "Registered", "Pending"]),
            "ownership_verified": True,
            "certificate_status": "Issued",
            "distribution_status": "Live",
            "release_status": random.choice(["Released", "Released", "Released", "Unreleased"]),
            "created_at": now.isoformat(),
        })
    await db.songs.insert_many(song_docs)

    # ---- Contracts
    contract_docs = []
    for title, kind, cp, value, status, signed, expires in CONTRACTS:
        contract_docs.append({
            "id": str(uuid.uuid4()), "owner_id": owner_id,
            "title": title, "type": kind, "counterparty": cp,
            "value": value, "currency": "USD",
            "status": status, "signed_date": signed,
            "expiration_date": expires,
            "notes": "", "created_at": now.isoformat(),
        })
    await db.contracts.insert_many(contract_docs)

    # ---- Invoices
    invoice_docs = []
    for i, (client, email, amt, status, days) in enumerate(INVOICES):
        due = (now + timedelta(days=days)).isoformat()[:10]
        invoice_docs.append({
            "id": str(uuid.uuid4()), "owner_id": owner_id,
            "invoice_number": f"VLT-2026-{1000 + i:04d}",
            "client_name": client, "client_email": email,
            "amount": amt, "currency": "USD",
            "due_date": due, "status": status,
            "line_items": [
                {"description": f"Services — {client}", "qty": 1, "rate": amt, "total": amt},
            ],
            "notes": "", "created_at": now.isoformat(),
        })
    await db.invoices.insert_many(invoice_docs)

    # ---- Budgets
    budget_docs = []
    for name, kind, total, spent in BUDGETS:
        budget_docs.append({
            "id": str(uuid.uuid4()), "owner_id": owner_id,
            "name": name, "type": kind,
            "total_amount": total, "spent": spent,
            "currency": "USD",
            "period_start": _iso(90),
            "period_end": _iso(-90),
            "notes": "", "created_at": now.isoformat(),
        })
    await db.budgets.insert_many(budget_docs)

    # ---- Funding opportunities (global, not per user)
    funding_count = await db.funding_opportunities.count_documents({})
    if funding_count == 0:
        opp_docs = []
        for name, kind, amount, deadline, desc, tag in FUNDING_OPPS:
            opp_docs.append({
                "id": str(uuid.uuid4()),
                "name": name, "category": kind,
                "amount": amount, "deadline": deadline,
                "description": desc, "tag": tag,
                "created_at": now.isoformat(),
            })
        await db.funding_opportunities.insert_many(opp_docs)

    # ---- Vault documents
    vault_docs = []
    for name, cat, size in VAULT_DOCS:
        vault_docs.append({
            "id": str(uuid.uuid4()), "owner_id": owner_id,
            "name": name, "category": cat, "size_kb": size,
            "encrypted": True, "tags": [],
            "notes": "", "uploaded_at": now.isoformat(),
        })
    await db.vault_docs.insert_many(vault_docs)
