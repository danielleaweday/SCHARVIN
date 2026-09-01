"""Seed realistic CCDP demo data for ANCRD."""
import bcrypt
import uuid
from datetime import datetime, timezone, timedelta
import random

def hp(pw):
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def now_iso():
    return datetime.now(timezone.utc).isoformat()

def ago(days):
    return (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()

def future(days):
    return (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()

PORTRAITS = [
    "https://images.unsplash.com/photo-1768818653161-0ad28dede131?crop=entropy&cs=srgb&fm=jpg&w=600&q=85",
    "https://images.unsplash.com/photo-1762287830628-9c61389fb67f?crop=entropy&cs=srgb&fm=jpg&w=600&q=85",
    "https://images.unsplash.com/photo-1584940121396-17ed95a72c29?crop=entropy&cs=srgb&fm=jpg&w=600&q=85",
    "https://images.unsplash.com/photo-1758390851239-e5c27f50cfd3?crop=entropy&cs=srgb&fm=jpg&w=600&q=85",
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?crop=entropy&cs=srgb&fm=jpg&w=600&q=85",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?crop=entropy&cs=srgb&fm=jpg&w=600&q=85",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=srgb&fm=jpg&w=600&q=85",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=srgb&fm=jpg&w=600&q=85",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=srgb&fm=jpg&w=600&q=85",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=srgb&fm=jpg&w=600&q=85",
    "https://images.unsplash.com/photo-1552058544-f2b08422138a?crop=entropy&cs=srgb&fm=jpg&w=600&q=85",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?crop=entropy&cs=srgb&fm=jpg&w=600&q=85",
]

BANNERS = [
    "https://images.unsplash.com/photo-1770062421988-7929b4748e29?crop=entropy&cs=srgb&fm=jpg&w=1600&q=85",
    "https://images.unsplash.com/photo-1674049349346-0929e96a9d5f?crop=entropy&cs=srgb&fm=jpg&w=1600&q=85",
    "https://images.unsplash.com/photo-1619105181839-23d24bba46ee?crop=entropy&cs=srgb&fm=jpg&w=1600&q=85",
    "https://images.unsplash.com/photo-1671519821564-ced7e41ee7ae?crop=entropy&cs=srgb&fm=jpg&w=1600&q=85",
]

INSTITUTIONS = [
    {"id": "inst-berklee", "name": "Berklee College of Music", "city": "Boston", "country": "USA", "lat": 42.3467, "lng": -71.0870},
    {"id": "inst-rca", "name": "Royal College of Art", "city": "London", "country": "UK", "lat": 51.5017, "lng": -0.1794},
    {"id": "inst-parsons", "name": "Parsons School of Design", "city": "New York", "country": "USA", "lat": 40.7359, "lng": -73.9911},
    {"id": "inst-tokyo", "name": "Tokyo University of the Arts", "city": "Tokyo", "country": "Japan", "lat": 35.7157, "lng": 139.7756},
    {"id": "inst-lagos", "name": "Lagos Creative Academy", "city": "Lagos", "country": "Nigeria", "lat": 6.5244, "lng": 3.3792},
    {"id": "inst-berlin", "name": "Berlin School of Sound", "city": "Berlin", "country": "Germany", "lat": 52.5200, "lng": 13.4050},
    {"id": "inst-seoul", "name": "Korea National University of Arts", "city": "Seoul", "country": "South Korea", "lat": 37.5665, "lng": 126.9780},
    {"id": "inst-saopaulo", "name": "Escola de Comunicações e Artes USP", "city": "São Paulo", "country": "Brazil", "lat": -23.5505, "lng": -46.6333},
    {"id": "inst-mumbai", "name": "Whistling Woods International", "city": "Mumbai", "country": "India", "lat": 19.0760, "lng": 72.8777},
    {"id": "inst-toronto", "name": "OCAD University", "city": "Toronto", "country": "Canada", "lat": 43.6532, "lng": -79.3832},
    {"id": "inst-paris", "name": "École nationale supérieure des Beaux-Arts", "city": "Paris", "country": "France", "lat": 48.8566, "lng": 2.3522},
    {"id": "inst-sydney", "name": "AIM Sydney", "city": "Sydney", "country": "Australia", "lat": -33.8688, "lng": 151.2093},
]

ROLES = ["Student", "Alumni", "Faculty", "Professor", "Mentor", "Artist in Residence",
         "Industry Partner", "Executive in Residence", "Recruiter", "Label Representative",
         "Publisher", "Investor", "Moderator", "Institution Administrator"]

DISCIPLINES = ["Songwriting", "Music Production", "Film Composition", "Audio Engineering",
               "Photography", "Graphic Design", "Animation", "Dance", "Fashion", "Publishing",
               "Cinematography", "Sound Design", "Visual Art", "Creative Direction"]

FIRST = ["Amara", "Kenji", "Sofia", "Marcus", "Priya", "Léa", "Diego", "Aisha",
         "Yuki", "Tomás", "Zoe", "Rohan", "Nia", "Sebastián", "Ingrid", "Jae",
         "Olamide", "Chiara", "Malik", "Fatima", "Julian", "Anya", "Kwame", "Rin",
         "Elena", "Noor", "Idris", "Camila", "Theo", "Sana"]

LAST = ["Okafor", "Tanaka", "Reyes", "Bennett", "Sharma", "Moreau", "Silva", "Khan",
        "Nakamura", "Costa", "Ellis", "Kapoor", "Adebayo", "Rivera", "Lindqvist", "Park",
        "Adeleke", "Ricci", "Johnson", "Al-Farsi", "Wolfe", "Volkov", "Mensah", "Sato",
        "Petrova", "Haddad", "Osei", "Vargas", "Beaumont", "Aziz"]

BIOS = [
    "Cross-cultural songwriter blending West-African rhythms with jazz harmony.",
    "Producer/engineer building sonic architectures for the next generation of alt-R&B.",
    "Film composer scoring narrative shorts and interactive experiences.",
    "Photographer documenting the quiet moments between the frames.",
    "Interdisciplinary artist exploring identity, memory, and diaspora through sound.",
    "Vocalist, writer, and producer. Signed to independent catalog. CCDP alum.",
    "Sound designer for immersive installations and interactive media.",
    "Creative technologist crafting real-time performance systems.",
]

SKILLS_POOL = ["Logic Pro", "Pro Tools", "Ableton Live", "Mixing", "Mastering", "Vocal Production",
               "Topline", "Piano", "Guitar", "Songwriting", "String Arrangement",
               "Photography", "Color Grading", "DaVinci Resolve", "Photoshop", "Illustrator",
               "Blender", "Cinema 4D", "Live Sound", "Broadcasting"]

REPUTATION_POOL = [
    ("verified-collaborator", "Verified Collaborator"),
    ("reliable", "Reliable"),
    ("top-contributor", "Top Contributor"),
    ("faculty-recommended", "Faculty Recommended"),
    ("industry-recommended", "Industry Recommended"),
    ("creative-leader", "Creative Leader"),
    ("writing-camp-veteran", "Writing Camp Veteran"),
    ("community-builder", "Community Builder"),
    ("challenge-winner", "Challenge Winner"),
    ("top-mentor", "Top Mentor"),
]

TIMELINE_TEMPLATES = [
    ("writing-camp", "Writing Camp — {}", ["CCDP Nashville '25", "Berlin Sound Lab", "Lagos Camp '24", "Seoul Session"]),
    ("release", "Released \"{}\"", ["Chromatic Skies", "After Hours", "Diaspora", "Amber Light", "Cascade", "Static"]),
    ("performance", "Performed at {}", ["SXSW", "Sofar Sounds London", "Elsewhere Brooklyn", "Fuji Rock", "Afro Nation"]),
    ("tour", "{} Tour", ["European", "US East Coast", "West Africa", "Asia Pacific", "Latin America"]),
    ("publishing", "Signed publishing with {}", ["Kobalt", "Warner Chappell", "Sony ATV", "BMG", "Concord"]),
    ("award", "Awarded {}", ["ANCR Rising Star", "ASCAP Foundation Grant", "BMI Songwriter Award", "Grammy Camp Selection"]),
    ("collaboration", "Collaborated with {}", ["a Berklee cohort", "an INHEIRA producer", "a COHEIR mentor", "a CCDP alum"]),
    ("residency", "Residency at {}", ["Funkhaus Berlin", "Red Bull Studios", "Rockwood NYC", "Abbey Road Institute"]),
]

async def run_seed(db):
    # wipe
    for coll in ["users", "posts", "communities", "events", "opportunities",
                 "marketplace", "notifications", "threads", "messages",
                 "institutions", "bookings"]:
        await db[coll].delete_many({})

    # institutions
    for inst in INSTITUTIONS:
        inst["students"] = random.randint(80, 420)
        inst["faculty"] = random.randint(20, 90)
        inst["programs"] = random.sample(DISCIPLINES, k=random.randint(4, 8))
    await db.institutions.insert_many([{**i} for i in INSTITUTIONS])

    # users
    users = []
    demo_email = "aaron@ancrd.io"
    demo = {
        "id": str(uuid.uuid4()),
        "email": demo_email,
        "password": hp("ancrd2026"),
        "name": "Aaron Sterling",
        "role": "Institution Administrator",
        "institution": "Berklee College of Music",
        "institution_id": "inst-berklee",
        "avatar": PORTRAITS[1],
        "banner": BANNERS[0],
        "verified": True,
        "verification_level": "Platinum",
        "bio": "Founder of the ANCR Ecosystem. Building the future of creative professional networks.",
        "disciplines": ["Creative Direction", "Music Production", "Songwriting"],
        "skills": ["Leadership", "A&R", "Production", "Songwriting"],
        "location": "Boston, USA",
        "city": "Boston",
        "country": "USA",
        "lat": 42.3467,
        "lng": -71.0870,
        "languages": ["English", "Spanish"],
        "degree_program": "MFA Contemporary Creative Development",
        "graduation_year": 2019,
        "cohort": "CCDP-2019",
        "genre": "Alt-R&B",
        "instrument": "Piano",
        "availability": "Selective",
        "portfolio_score": 96,
        "followers": [],
        "following": [],
        "achievements": ["ANCR Founder Award 2025", "Berklee Honor Roll"],
        "social": {"instagram": "aaron.ancrd", "website": "ancr.io"},
        "reputation": [
            {"kind": "creative-leader", "label": "Creative Leader", "earned_at": ago(300)},
            {"kind": "top-mentor", "label": "Top Mentor", "earned_at": ago(200)},
            {"kind": "community-builder", "label": "Community Builder", "earned_at": ago(150)},
            {"kind": "verified-collaborator", "label": "Verified Collaborator", "earned_at": ago(100)},
            {"kind": "industry-recommended", "label": "Industry Recommended", "earned_at": ago(50)},
        ],
        "timeline": [
            {"kind": "award", "title": "Founded the ANCR Ecosystem", "date": ago(700), "verified": True},
            {"kind": "publishing", "title": "Launched INHEIRA publishing suite", "date": ago(500), "verified": True},
            {"kind": "residency", "title": "Executive in Residence, Berklee", "date": ago(400), "verified": True},
            {"kind": "collaboration", "title": "Partnered with 12 CCDP institutions", "date": ago(300), "verified": True},
            {"kind": "award", "title": "ANCR Founder Award 2025", "date": ago(120), "verified": True},
            {"kind": "release", "title": "Released the CCDP program worldwide", "date": ago(30), "verified": True},
        ],
        "saved_candidates": [],
        "created_at": now_iso(),
    }
    users.append(demo)

    for i in range(48):
        inst = random.choice(INSTITUTIONS)
        first = random.choice(FIRST); last = random.choice(LAST)
        name = f"{first} {last}"
        role = random.choice(ROLES)
        disciplines = random.sample(DISCIPLINES, k=random.randint(1, 3))
        # small jitter around city
        lat = inst["lat"] + random.uniform(-0.4, 0.4)
        lng = inst["lng"] + random.uniform(-0.4, 0.4)
        u = {
            "id": str(uuid.uuid4()),
            "email": f"{first.lower()}.{last.lower()}{i}@ccdp.edu",
            "password": hp("ancrd2026"),
            "name": name,
            "role": role,
            "institution": inst["name"],
            "institution_id": inst["id"],
            "avatar": PORTRAITS[i % len(PORTRAITS)],
            "banner": BANNERS[i % len(BANNERS)],
            "verified": True,
            "verification_level": random.choice(["Silver", "Gold", "Platinum"]),
            "bio": random.choice(BIOS),
            "disciplines": disciplines,
            "skills": random.sample(SKILLS_POOL, k=random.randint(3, 7)),
            "location": f"{inst['city']}, {inst['country']}",
            "city": inst["city"],
            "country": inst["country"],
            "lat": lat,
            "lng": lng,
            "languages": random.sample(["English", "Spanish", "French", "Japanese", "Portuguese",
                                        "Korean", "Yoruba", "German", "Hindi", "Mandarin"], k=2),
            "degree_program": random.choice(["BFA Music", "MFA Composition", "MA Sound Design",
                                              "BFA Film", "MA Creative Development"]),
            "graduation_year": random.choice([2020, 2021, 2022, 2023, 2024, 2025, 2026]),
            "cohort": f"CCDP-{random.choice([2022, 2023, 2024, 2025])}",
            "genre": random.choice(["Alt-R&B", "Jazz", "Electronic", "Hip-Hop", "Classical",
                                    "Ambient", "Pop", "Film Score", "Latin", "Afrobeats"]),
            "instrument": random.choice(["Piano", "Guitar", "Voice", "Drums", "Synth",
                                          "Bass", "Strings", "Percussion", "None"]),
            "availability": random.choice(["Open", "Booking", "Selective", "Unavailable"]),
            "portfolio_score": random.randint(58, 98),
            "followers": [],
            "following": [],
            "achievements": random.sample(["Dean's List", "Grammy Camp Alum", "SXSW Selected Artist",
                                            "Sundance Fellow", "Berklee Honor", "ANCR Rising Star"],
                                           k=random.randint(1, 3)),
            "social": {"instagram": f"{first.lower()}.creates", "website": ""},
            "reputation": [
                {"kind": k, "label": lbl, "earned_at": ago(random.randint(30, 400))}
                for (k, lbl) in random.sample(REPUTATION_POOL, k=random.randint(2, 5))
            ],
            "timeline": (lambda: [
                (lambda t: {
                    "kind": t[0],
                    "title": t[1].format(random.choice(t[2])),
                    "date": ago(random.randint(20, 900)),
                    "verified": True,
                })(random.choice(TIMELINE_TEMPLATES))
                for _ in range(random.randint(4, 8))
            ])(),
            "saved_candidates": [],
            "created_at": ago(random.randint(30, 500)),
        }
        users.append(u)

    await db.users.insert_many(users)
    user_ids = [u["id"] for u in users]

    # communities
    community_specs = [
        ("Songwriters Collective", "Songwriting", BANNERS[0]),
        ("Music Producers Guild", "Music Production", BANNERS[1]),
        ("Film Composers Room", "Film Composition", BANNERS[2]),
        ("Audio Engineers Lab", "Audio Engineering", BANNERS[3]),
        ("Photographers Circle", "Photography", BANNERS[0]),
        ("Graphic Design Studio", "Graphic Design", BANNERS[1]),
        ("Women in Music", "Community", BANNERS[2]),
        ("Black Creatives Global", "Community", BANNERS[3]),
        ("Latin Creatives", "Community", BANNERS[0]),
        ("Creative Wellness", "Wellness", BANNERS[1]),
        ("Publishing & Sync Talk", "Publishing", BANNERS[2]),
        ("Faith & Creativity", "Community", BANNERS[3]),
    ]
    communities = []
    for i, (name, cat, banner) in enumerate(community_specs):
        c = {
            "id": f"comm-{i}",
            "name": name,
            "category": cat,
            "banner": banner,
            "description": f"A private ANCRD community for {name.lower()}. Verified CCDP members only.",
            "members": random.sample(user_ids, k=random.randint(15, 30)),
            "created_at": ago(random.randint(60, 400)),
        }
        communities.append(c)
    await db.communities.insert_many(communities)

    # posts
    post_templates = [
        {"kind": "achievement", "content": "Just wrapped my final Writing Camp session at CCDP. Six songs cut, three sync placements pitched. Grateful for this cohort.", "hashtags": ["#WritingCamp", "#CCDP"]},
        {"kind": "text", "content": "Anyone in Berlin next week? Looking for a vocalist for a session at Studio 7. Alt-R&B / Neo-Soul vibe.", "hashtags": ["#Collaboration", "#Berlin"]},
        {"kind": "image", "content": "New editorial cover shot for the label's Spring campaign. Shot on medium format, natural window light.", "media_url": BANNERS[0], "hashtags": ["#Photography", "#Editorial"]},
        {"kind": "music", "content": "New single drops Friday. Produced entirely at ANCRLAB with the CCDP Advanced Production cohort.", "hashtags": ["#NewMusic", "#ANCRLAB"]},
        {"kind": "video", "content": "Behind-the-scenes from yesterday's Masterclass with the Executive in Residence. Full session dropping on ANCRMEDIA next week.", "media_url": BANNERS[1], "hashtags": ["#Masterclass"]},
        {"kind": "text", "content": "Officially registered my first three songs with INHEIRA. The split sheet workflow is a dream. This is the future of publishing.", "hashtags": ["#INHEIRA", "#Publishing"]},
        {"kind": "event", "content": "Portfolio Review Day is Thursday. Bringing 4 finished projects and 2 works-in-progress. Nervous but ready.", "hashtags": ["#PortfolioReview"]},
        {"kind": "achievement", "content": "Just received Sync Licensing placement on an A24 short film via COHEIR. Endless gratitude to my mentor.", "hashtags": ["#Sync", "#COHEIR"]},
        {"kind": "text", "content": "The AIAH weekly digest matched me with two producers in Seoul and one in Lagos. Setting up intros this week.", "hashtags": ["#AIAH"]},
        {"kind": "image", "content": "Studio session yesterday. Twelve hours, one song, endless coffee.", "media_url": BANNERS[2], "hashtags": ["#Studio"]},
    ]
    posts = []
    for i in range(60):
        t = random.choice(post_templates)
        author = random.choice(users)
        # ~55% of posts scoped to a community (based on author's disciplines when possible)
        community_id = None
        if random.random() < 0.55 and communities:
            # prefer communities that match author's disciplines
            matches = [c for c in communities if c["category"] in (author.get("disciplines") or [])]
            pick = random.choice(matches) if matches else random.choice(communities)
            community_id = pick["id"]
        p = {
            "id": str(uuid.uuid4()),
            "author_id": author["id"],
            "content": t["content"],
            "media_url": t.get("media_url"),
            "kind": t["kind"],
            "hashtags": t.get("hashtags", []),
            "community_id": community_id,
            "reactions": {
                "like": random.sample(user_ids, k=random.randint(2, 25)),
                "applaud": random.sample(user_ids, k=random.randint(1, 15)),
                "celebrate": random.sample(user_ids, k=random.randint(0, 8)),
                "insightful": random.sample(user_ids, k=random.randint(0, 6)),
            },
            "comments": [],
            "created_at": ago(random.randint(0, 30)),
        }
        # add a couple comments
        for _ in range(random.randint(0, 3)):
            commenter = random.choice(users)
            p["comments"].append({
                "id": str(uuid.uuid4()),
                "author_id": commenter["id"],
                "author_name": commenter["name"],
                "avatar": commenter["avatar"],
                "content": random.choice([
                    "This is fire. Congratulations.",
                    "Would love to link when you're back in the city.",
                    "Mentor energy right here.",
                    "The CCDP class of 2025 is unstoppable.",
                    "Inspired. Bookmarking this.",
                ]),
                "created_at": ago(random.randint(0, 10)),
            })
        posts.append(p)
    await db.posts.insert_many(posts)

    # events
    event_types = ["Masterclass", "Writing Camp", "Showcase", "Listening Session",
                   "Portfolio Review", "Industry Panel", "Guest Lecture", "Live Stream",
                   "Graduation", "Networking Mixer", "Creative Challenge", "Hackathon",
                   "Workshop", "Open Mic", "Concert", "Film Premiere"]
    events = []
    for i in range(18):
        et = random.choice(event_types)
        inst = random.choice(INSTITUTIONS)
        events.append({
            "id": f"evt-{i}",
            "title": f"{et}: {random.choice(['Sync Licensing 101', 'Voice as Instrument', 'From Demo to Master', 'Storytelling in Sound', 'Editorial Portrait Lighting', 'Score to Picture'])}",
            "kind": et,
            "banner": BANNERS[i % len(BANNERS)],
            "date": future(random.randint(1, 60)),
            "location": f"{inst['city']}, {inst['country']}",
            "host_institution": inst["name"],
            "description": "An invitation-only session for verified CCDP members. Streamed live on ANCRMEDIA.",
            "attendees": random.sample(user_ids, k=random.randint(10, 40)),
        })
    await db.events.insert_many(events)

    # opportunities
    opp_specs = [
        ("Sync Placement — A24 Short Film", "Sync Licensing", "Netflix / A24"),
        ("Summer Internship — Warner Chappell", "Internship", "Warner Chappell Music"),
        ("Songwriter Fellowship 2026", "Fellowship", "CCDP Foundation"),
        ("Session Guitarist — European Tour", "Tour Opportunity", "MGMT Collective"),
        ("Publishing Deal — Neo-Soul", "Publishing Deal", "Kobalt"),
        ("Graduate Scholarship — Berklee", "Scholarship", "Berklee College of Music"),
        ("Full-Time Producer Role", "Job", "Sony Music"),
        ("Grant — Emerging Composers", "Grant", "ASCAP Foundation"),
        ("Audition — Broadway Musical", "Audition", "Lincoln Center"),
        ("Creative Director — Fashion Campaign", "Job", "Kering Group"),
        ("Residency — Berlin Studio", "Residency", "Funkhaus Berlin"),
        ("Volunteer — Global Youth Music Fest", "Volunteer", "UNESCO"),
    ]
    opportunities = []
    for i, (title, kind, company) in enumerate(opp_specs):
        opportunities.append({
            "id": f"opp-{i}",
            "title": title,
            "kind": kind,
            "company": company,
            "location": random.choice(["Remote", "New York", "London", "Los Angeles", "Berlin", "Tokyo"]),
            "compensation": random.choice(["$5,000", "$50–75k", "$1,500/wk", "Equity", "Stipend"]),
            "description": f"Selected candidates will be verified through ANCRID and matched via AIAH.",
            "deadline": future(random.randint(7, 45)),
            "applicants": random.sample(user_ids, k=random.randint(2, 20)),
            "created_at": ago(random.randint(1, 20)),
        })
    await db.opportunities.insert_many(opportunities)

    # marketplace
    services = [
        ("Vocal Mixing", "Mixing", "$450/song"),
        ("Mastering — Stereo", "Mastering", "$180/song"),
        ("Topline Writing", "Songwriting", "$800/session"),
        ("Beat Production", "Production", "$1,200/beat"),
        ("Session Piano", "Session Work", "$300/hr"),
        ("Editorial Photography", "Photography", "$1,500/day"),
        ("Video Editing / Color", "Video Editing", "$95/hr"),
        ("String Arrangement", "Arranging", "$650/song"),
        ("Music Direction — Live", "Music Direction", "$2,500/show"),
        ("Vocal Lessons", "Lessons", "$120/hr"),
        ("Creative Consulting", "Consulting", "$250/hr"),
        ("Album Art & Layout", "Graphic Design", "$900/project"),
    ]
    marketplace = []
    for i, (name, cat, price) in enumerate(services):
        prov = random.choice(users)
        marketplace.append({
            "id": f"mkt-{i}",
            "title": name,
            "category": cat,
            "provider_id": prov["id"],
            "provider_name": prov["name"],
            "provider_avatar": prov["avatar"],
            "price": price,
            "availability": random.choice(["Open", "Booking Fast", "Waitlist"]),
            "rating": round(random.uniform(4.5, 5.0), 1),
            "reviews": random.randint(6, 84),
            "description": f"{name} by verified CCDP creator. All work delivered through ANCRLAB.",
            "created_at": ago(random.randint(5, 200)),
        })
    await db.marketplace.insert_many(marketplace)

    # notifications for demo user
    notif_kinds = [
        ("like", "Amara Okafor applauded your post"),
        ("comment", "Kenji Tanaka commented on your update"),
        ("follow", "Sofia Reyes started following you"),
        ("mention", "You were mentioned by Diego Silva"),
        ("event", "Reminder: Portfolio Review Day is tomorrow"),
        ("opportunity", "AIAH matched you with a new Sync Licensing opportunity"),
        ("mentor", "Your mentor left new feedback on ANCRLAB"),
        ("achievement", "Priya Sharma reached Platinum Verification"),
    ]
    notifs = []
    for i in range(12):
        k, txt = random.choice(notif_kinds)
        notifs.append({
            "id": str(uuid.uuid4()),
            "user_id": demo["id"],
            "kind": k,
            "text": txt,
            "read": random.choice([False, False, True]),
            "created_at": ago(random.randint(0, 14)),
        })
    await db.notifications.insert_many(notifs)

    # threads and messages (a few for demo)
    for other in random.sample([u for u in users if u["id"] != demo["id"]], k=6):
        tid = str(uuid.uuid4())
        await db.threads.insert_one({
            "id": tid,
            "kind": "dm",
            "members": [demo["id"], other["id"]],
            "created_at": ago(random.randint(2, 30)),
            "updated_at": ago(random.randint(0, 2)),
            "last_message": random.choice([
                "Let's set up a call this week.",
                "Sent you the stems. Let me know.",
                "Great meeting you at the mixer.",
                "The session moved to Studio B.",
            ]),
        })
        for _ in range(random.randint(3, 8)):
            sender = random.choice([demo["id"], other["id"]])
            recv = other["id"] if sender == demo["id"] else demo["id"]
            await db.messages.insert_one({
                "id": str(uuid.uuid4()),
                "thread_id": tid,
                "from_user_id": sender,
                "to_user_id": recv,
                "content": random.choice([
                    "Hey — really enjoyed your last drop.",
                    "Would love to collaborate on the sync brief.",
                    "Sending references now.",
                    "Studio locked for Friday 3pm.",
                    "Send stems in 44.1 please.",
                    "Yes — count me in.",
                ]),
                "created_at": ago(random.randint(0, 20)),
            })

    return {"ok": True, "users": len(users), "posts": len(posts),
            "communities": len(communities), "events": len(events),
            "opportunities": len(opportunities), "marketplace": len(marketplace),
            "institutions": len(INSTITUTIONS)}
