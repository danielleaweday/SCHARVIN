"""Seed realistic light demo data for ANCRLaunch™.

Creates one professionally designed account per role with a shared demo
password, and populates the seeded ecosystem providers (ANCRID, ANCRLAB,
INHEIRA, Vaulta, ANCRMEDIA, ANCRD, ANCRA, COHEIR, ANCRSync) with light
but rich data.
"""
from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone

from auth import hash_password
from models import _now


DEMO_PASSWORD = os.environ.get("DEMO_PASSWORD", "ancrlaunch2026")


def _iso(days_from_now: int) -> str:
    return (datetime.now(timezone.utc) + timedelta(days=days_from_now)).isoformat()


DEMO_USERS = [
    {
        "ancrid": "ANCR-STU00001A",
        "email": "student@ancrlaunch.demo",
        "full_name": "Maya Okafor",
        "role": "student",
        "discipline": "Contemporary Composition",
        "institution": "Berklee College of Music",
        "country": "United States",
        "graduation_year": 2026,
        "biography": "Composer and producer exploring the intersection of West African polyrhythms and orchestral scoring. CCDP verified.",
        "avatar_url": "https://images.pexels.com/photos/28446973/pexels-photo-28446973.jpeg",
    },
    {
        "ancrid": "ANCR-GRD00002B",
        "email": "graduate@ancrlaunch.demo",
        "full_name": "Elena Voss",
        "role": "graduate",
        "discipline": "Film Scoring",
        "institution": "Royal College of Music",
        "country": "United Kingdom",
        "graduation_year": 2025,
        "biography": "Emmy-shortlisted film composer. Recently placed sync on two feature films through ANCRSync™.",
        "avatar_url": "https://images.pexels.com/photos/37148345/pexels-photo-37148345.jpeg",
    },
    {
        "ancrid": "ANCR-FAC00003C",
        "email": "faculty@ancrlaunch.demo",
        "full_name": "Prof. Julian Hart",
        "role": "faculty",
        "discipline": "Performance Studies",
        "institution": "Juilliard School",
        "country": "United States",
        "graduation_year": None,
        "biography": "Professor of Performance Studies. Faculty ambassador for the ANCR ecosystem.",
        "avatar_url": None,
    },
    {
        "ancrid": "ANCR-CAR00004D",
        "email": "career@ancrlaunch.demo",
        "full_name": "Nadia Ferreira",
        "role": "career_services",
        "discipline": None,
        "institution": "Berklee Career Center",
        "country": "United States",
        "graduation_year": None,
        "biography": "Director of Career Services. Manages placement across five CCDP partner institutions.",
        "avatar_url": None,
    },
    {
        "ancrid": "ANCR-EMP00005E",
        "email": "employer@ancrlaunch.demo",
        "full_name": "Marcus Reid",
        "role": "employer",
        "discipline": None,
        "institution": None,
        "country": "United States",
        "graduation_year": None,
        "biography": "Head of A&R at Meridian Records. Verified ANCR employer.",
        "avatar_url": None,
        "company": "Meridian Records",
    },
    {
        "ancrid": "ANCR-REC00006F",
        "email": "recruiter@ancrlaunch.demo",
        "full_name": "Sofia Kaneko",
        "role": "recruiter",
        "discipline": None,
        "institution": None,
        "country": "Japan",
        "graduation_year": None,
        "biography": "Senior talent partner at Aurora Creative Group.",
        "avatar_url": None,
        "company": "Aurora Creative Group",
    },
    {
        "ancrid": "ANCR-IND00007G",
        "email": "industry@ancrlaunch.demo",
        "full_name": "David Ashford",
        "role": "industry_partner",
        "discipline": None,
        "institution": None,
        "country": "United Kingdom",
        "graduation_year": None,
        "biography": "Managing director, Northlight Publishing. ANCR industry partner.",
        "avatar_url": None,
        "company": "Northlight Publishing",
    },
    {
        "ancrid": "ANCR-ADM00008H",
        "email": "admin@ancrlaunch.demo",
        "full_name": "Amina Zell",
        "role": "administrator",
        "discipline": None,
        "institution": "ANCR™ Ecosystem",
        "country": "Global",
        "graduation_year": None,
        "biography": "ANCRLaunch platform administrator.",
        "avatar_url": None,
    },
]


OPPORTUNITIES = [
    # Jobs
    {"kind": "job", "category": "Creative Jobs", "title": "Staff Composer", "employer": "Meridian Records", "location": "Los Angeles", "country": "United States", "remote": False, "compensation": "$95,000 – $125,000", "discipline": "Composition", "summary": "Compose original works for Meridian's film and streaming catalog. Verified ANCR employer.", "tags": ["orchestral", "film", "in-house"], "featured": True},
    {"kind": "job", "category": "Teaching Positions", "title": "Adjunct Faculty — Music Theory", "employer": "Berklee College of Music", "location": "Boston", "country": "United States", "remote": False, "compensation": "$68,000", "discipline": "Music Theory", "summary": "Teach undergraduate theory sequence. Requires MM or DMA.", "tags": ["academic", "teaching"]},
    {"kind": "job", "category": "Touring Positions", "title": "Music Director — World Tour", "employer": "Aurora Creative Group", "location": "Global", "country": "United Kingdom", "remote": False, "compensation": "£1,800/week + per diem", "discipline": "Performance", "summary": "Music director for an 18-month international arena tour.", "tags": ["touring", "MD", "arena"]},
    {"kind": "job", "category": "Remote Opportunities", "title": "Remote Sync Producer", "employer": "Northlight Publishing", "location": "Remote", "country": "United Kingdom", "remote": True, "compensation": "£55,000", "discipline": "Sync / Publishing", "summary": "Curate and pitch catalog for film and advertising sync placements.", "tags": ["sync", "remote", "publishing"], "featured": True},
    {"kind": "job", "category": "Studio Jobs", "title": "Senior Recording Engineer", "employer": "Halcyon Studios", "location": "Nashville", "country": "United States", "remote": False, "compensation": "$85,000", "discipline": "Engineering", "summary": "Lead engineer for A-list sessions in a Neve 88R room.", "tags": ["engineering", "studio"]},
    {"kind": "job", "category": "Media Jobs", "title": "Music Supervisor", "employer": "Prism Media", "location": "New York", "country": "United States", "remote": False, "compensation": "$110,000", "discipline": "Music Supervision", "summary": "Supervise music for scripted originals.", "tags": ["supervision", "media"]},
    {"kind": "job", "category": "Publishing", "title": "A&R — Publishing", "employer": "Northlight Publishing", "location": "London", "country": "United Kingdom", "remote": False, "compensation": "£72,000", "discipline": "Publishing", "summary": "Sign and develop songwriters across pop and cinematic.", "tags": ["A&R", "publishing"]},
    {"kind": "job", "category": "Labels", "title": "Label Manager", "employer": "Meridian Records", "location": "Los Angeles", "country": "United States", "remote": False, "compensation": "$115,000", "discipline": "Label Operations", "summary": "Own artist P&L, marketing, and creative pipeline.", "tags": ["label", "operations"]},

    # Internships
    {"kind": "internship", "category": "Music", "title": "A&R Internship", "employer": "Meridian Records", "location": "Los Angeles", "country": "United States", "remote": False, "compensation": "$22/hr", "discipline": "A&R", "summary": "Summer 2026 A&R internship.", "tags": ["a&r", "summer"]},
    {"kind": "internship", "category": "Film", "title": "Film Scoring Internship", "employer": "Remote Control Productions", "location": "Santa Monica", "country": "United States", "remote": False, "compensation": "$25/hr", "discipline": "Composition", "summary": "Work alongside Emmy-winning composers.", "tags": ["scoring", "film"]},
    {"kind": "internship", "category": "Publishing", "title": "Publishing Operations Intern", "employer": "Northlight Publishing", "location": "London", "country": "United Kingdom", "remote": True, "compensation": "£15/hr", "discipline": "Publishing", "summary": "Support catalog administration and sync research.", "tags": ["publishing", "remote"]},
    {"kind": "internship", "category": "Media", "title": "Music Supervision Intern", "employer": "Prism Media", "location": "New York", "country": "United States", "remote": False, "compensation": "$22/hr", "discipline": "Supervision", "summary": "Support music supervision for streaming originals.", "tags": ["supervision", "media"]},

    # Auditions
    {"kind": "audition", "category": "Broadway", "title": "Lead Vocalist — Broadway Revival", "employer": "The Palace Theatre", "location": "New York", "country": "United States", "remote": False, "compensation": "Equity scale", "discipline": "Performance", "summary": "Casting lead vocalist for an original Broadway revival.", "tags": ["broadway", "vocal"], "featured": True},
    {"kind": "audition", "category": "Tours", "title": "Bassist — International Arena Tour", "employer": "Aurora Creative Group", "location": "Global", "country": "United Kingdom", "remote": False, "compensation": "£1,600/week", "discipline": "Performance", "summary": "Auditioning bassists for a Grammy-winning artist's 2026 tour.", "tags": ["touring", "bass"]},
    {"kind": "audition", "category": "Film", "title": "Session Vocalist — Feature Film", "employer": "Meridian Records", "location": "Los Angeles", "country": "United States", "remote": False, "compensation": "AFM scale + royalties", "discipline": "Performance", "summary": "Featured vocals for an A24 feature score.", "tags": ["session", "vocal"]},
    {"kind": "audition", "category": "Voiceover", "title": "Voiceover — Streaming Series", "employer": "Prism Media", "location": "Remote", "country": "United States", "remote": True, "compensation": "SAG scale", "discipline": "Voice", "summary": "Voiceover casting for animated streaming series.", "tags": ["VO", "remote"]},

    # Projects
    {"kind": "project", "category": "Writing Camps", "title": "Nashville Writing Camp — Feb 2026", "employer": "Northlight Publishing", "location": "Nashville", "country": "United States", "remote": False, "compensation": "Advance + splits", "discipline": "Songwriting", "summary": "Invitation-only writing camp with major-label artists.", "tags": ["camp", "songwriting"]},
    {"kind": "project", "category": "Film Scores", "title": "Independent Feature Score", "employer": "Halcyon Studios", "location": "Los Angeles", "country": "United States", "remote": False, "compensation": "$40,000 flat", "discipline": "Composition", "summary": "Score an independent feature premiering at Sundance 2027.", "tags": ["scoring", "film"]},
    {"kind": "project", "category": "Sync Opportunities", "title": "Sync Brief — Global Automotive Campaign", "employer": "Aurora Creative Group", "location": "Global", "country": "Japan", "remote": True, "compensation": "$25,000 + backend", "discipline": "Sync", "summary": "Sync opportunity for cinematic, hopeful, orchestral track.", "tags": ["sync", "brief"], "featured": True},
]


EMPLOYERS = [
    {"name": "Meridian Records", "industry": "Record Label", "country": "United States", "website": "https://meridian.example", "about": "Boutique label with a cinematic catalog. Verified ANCR employer."},
    {"name": "Northlight Publishing", "industry": "Publishing", "country": "United Kingdom", "website": "https://northlight.example", "about": "Global publisher building the next generation of writers."},
    {"name": "Aurora Creative Group", "industry": "Talent Agency", "country": "Japan", "website": "https://aurora.example", "about": "International creative agency representing performers and MDs."},
    {"name": "Halcyon Studios", "industry": "Recording Studio", "country": "United States", "website": "https://halcyon.example", "about": "Neve 88R flagship room in Nashville."},
    {"name": "Prism Media", "industry": "Media & Streaming", "country": "United States", "website": "https://prism.example", "about": "Streaming originals studio."},
]


GRADUATE_OUTCOMES = [
    {"creator_name": "Ada Lam", "institution": "Berklee College of Music", "discipline": "Composition", "outcome_type": "employment", "headline": "Staff composer at Meridian Records", "detail": "Placed via ANCRLaunch™ four weeks after graduation.", "year": 2025},
    {"creator_name": "Ravi Patel", "institution": "Royal College of Music", "discipline": "Performance", "outcome_type": "touring", "headline": "MD, world arena tour", "detail": "Signed a 2-year touring contract through Aurora Creative Group.", "year": 2025},
    {"creator_name": "Sunny Choi", "institution": "Juilliard School", "discipline": "Voice", "outcome_type": "publishing_deal", "headline": "Publishing deal, Northlight Publishing", "detail": "Multi-territory publishing agreement.", "year": 2024},
    {"creator_name": "Ben Ortega", "institution": "Berklee College of Music", "discipline": "Songwriting", "outcome_type": "management", "headline": "Signed to Sable Management", "detail": "Full-service artist management.", "year": 2025},
    {"creator_name": "Freya Nilsen", "institution": "Royal College of Music", "discipline": "Composition", "outcome_type": "graduate_school", "headline": "MPhil, University of Oxford", "detail": "Full scholarship for music research.", "year": 2024},
    {"creator_name": "Kojo Mensah", "institution": "Berklee College of Music", "discipline": "Production", "outcome_type": "entrepreneurship", "headline": "Founded Kojo Sound Studio", "detail": "Creative business launched via ANCR business formation guidance.", "year": 2025},
    {"creator_name": "Isabela Ruiz", "institution": "Juilliard School", "discipline": "Broadway", "outcome_type": "employment", "headline": "Broadway ensemble, The Palace Theatre", "detail": "Cast in a revival production.", "year": 2025},
]


ANCRLAB_PROJECTS = {
    "ANCR-STU00001A": [
        {"title": "Sable Suites", "kind": "orchestral", "year": 2025, "role": "Composer", "collaborators": ["Ada Lam"]},
        {"title": "Rhythms of Enugu", "kind": "polyrhythmic study", "year": 2024, "role": "Composer / Producer"},
        {"title": "Northlight Sessions Vol. 3", "kind": "songwriting camp", "year": 2025, "role": "Writer"},
    ],
    "ANCR-GRD00002B": [
        {"title": "Silverwood", "kind": "feature score", "year": 2025, "role": "Composer"},
        {"title": "Long Winter", "kind": "short film score", "year": 2024, "role": "Composer"},
    ],
}

ANCRLAB_COLLABS = {
    "ANCR-STU00001A": [
        {"partner": "Ada Lam", "project": "Sable Suites", "year": 2025},
        {"partner": "Meridian Records", "project": "Northlight Sessions Vol. 3", "year": 2025},
    ],
    "ANCR-GRD00002B": [
        {"partner": "Halcyon Studios", "project": "Silverwood", "year": 2025},
    ],
}

ANCRMEDIA_RELEASES = {
    "ANCR-STU00001A": [
        {"title": "Sable Suites — I", "medium": "single", "year": 2025, "label": "Independent"},
        {"title": "Rhythms of Enugu", "medium": "EP", "year": 2024, "label": "Independent"},
    ],
    "ANCR-GRD00002B": [
        {"title": "Silverwood (Original Motion Picture Soundtrack)", "medium": "album", "year": 2025, "label": "Meridian Records"},
    ],
}

INHEIRA_PUBLISHING = {
    "ANCR-STU00001A": [
        {"work": "Sable Suites — I", "society": "ASCAP", "share": 100, "status": "registered"},
    ],
    "ANCR-GRD00002B": [
        {"work": "Silverwood", "society": "PRS", "share": 100, "status": "registered"},
        {"work": "Long Winter", "society": "PRS", "share": 50, "status": "registered"},
    ],
}

VAULTA_PASSPORTS = {
    "ANCR-STU00001A": {"passport_id": "VLTA-88134", "verified_credentials": ["CCDP Verified", "Berklee Enrolled", "ANCRLAB Contributor"], "issued": "2024-09-01"},
    "ANCR-GRD00002B": {"passport_id": "VLTA-91277", "verified_credentials": ["CCDP Verified", "RCM Alumna", "ANCRMEDIA Artist", "ANCRSync Placed"], "issued": "2023-06-15"},
}

ANCRD_BOOKING = {
    "ANCR-STU00001A": {"available_from": "2026-06-01", "regions": ["North America", "West Africa"], "fee_range": "$3,500 – $7,500", "tech_rider": "on file"},
    "ANCR-GRD00002B": {"available_from": "2026-03-15", "regions": ["Europe", "North America"], "fee_range": "£5,000 – £12,000", "tech_rider": "on file"},
}

ANCRD_TRAVEL = {
    "ANCR-STU00001A": {"passport": "valid", "visas": ["US", "EU-Schengen"], "vaccinations": "current"},
    "ANCR-GRD00002B": {"passport": "valid", "visas": ["US O-1", "EU-Schengen"], "vaccinations": "current"},
}

COHEIR_REP = {
    "ANCR-STU00001A": {"score": 74, "endorsements": 12, "last_updated": "2026-01-12"},
    "ANCR-GRD00002B": {"score": 88, "endorsements": 27, "last_updated": "2026-01-20"},
}

COHEIR_INDUSTRY_RECS = {
    "ANCR-STU00001A": [
        {"from": "Marcus Reid — Meridian Records", "note": "Rare compositional voice. Ready for staff work.", "year": 2025},
    ],
    "ANCR-GRD00002B": [
        {"from": "David Ashford — Northlight Publishing", "note": "One of the strongest emerging film composers in Europe.", "year": 2025},
        {"from": "Sofia Kaneko — Aurora Creative Group", "note": "Immediate touring MD potential.", "year": 2025},
    ],
}

ANCRA_TRANSCRIPTS = {
    "ANCR-STU00001A": {"gpa": 3.87, "credits_completed": 108, "credits_required": 120, "standing": "Dean's List"},
    "ANCR-GRD00002B": {"gpa": 3.92, "credits_completed": 240, "credits_required": 240, "standing": "First-class Honours"},
}

ANCRA_FACULTY_RECS = {
    "ANCR-STU00001A": [
        {"from": "Prof. Julian Hart — Juilliard", "note": "Exceptional creative range and work ethic.", "year": 2025},
    ],
    "ANCR-GRD00002B": [
        {"from": "Dr. Elena Marchetti — RCM", "note": "Distinguished graduate. Career-ready.", "year": 2025},
        {"from": "Prof. Julian Hart — Juilliard", "note": "Guest studio ensemble collaboration — extraordinary.", "year": 2024},
    ],
}

ANCRSYNC_OPPS = {
    "ANCR-GRD00002B": [
        {"brief": "Automotive campaign — orchestral, hopeful", "status": "shortlisted", "year": 2026},
        {"brief": "Streaming series main title — cinematic", "status": "placed", "year": 2025},
    ],
}


async def seed_all(db):
    """Idempotent seed — safe to run repeatedly. Wipes ANCRLaunch collections."""
    collections_to_reset = [
        "users",
        "resumes",
        "opportunities",
        "employers",
        "applications",
        "interviews",
        "graduate_outcomes",
        "coach_messages",
        "ancrid_users",
        "ancra_transcripts",
        "ancra_recommendations",
        "ancrlab_projects",
        "ancrlab_collaborations",
        "ancrsync_opportunities",
        "coheir_recommendations",
        "coheir_reputation",
        "inheira_publishing",
        "vaulta_passports",
        "ancrmedia_releases",
        "ancrd_booking_packets",
        "ancrd_travel",
    ]
    for c in collections_to_reset:
        await db[c].delete_many({})

    password_hash = hash_password(DEMO_PASSWORD)
    now = _now()

    # Users (ANCRID identities) — ANCRLaunch consumes these
    for u in DEMO_USERS:
        doc = {
            **u,
            "password_hash": password_hash,
            "verified": True,
            "created_at": now,
        }
        # ANCRLaunch user (auth)
        await db.users.insert_one({**doc})
        # ANCRID mirror (ecosystem provider)
        ancrid_doc = {k: v for k, v in doc.items() if k != "password_hash"}
        await db.ancrid_users.insert_one(ancrid_doc)

    # Ecosystem seeded data
    for ancrid, projects in ANCRLAB_PROJECTS.items():
        for p in projects:
            await db.ancrlab_projects.insert_one({"ancrid": ancrid, **p})
    for ancrid, collabs in ANCRLAB_COLLABS.items():
        for c in collabs:
            await db.ancrlab_collaborations.insert_one({"ancrid": ancrid, **c})
    for ancrid, releases in ANCRMEDIA_RELEASES.items():
        for r in releases:
            await db.ancrmedia_releases.insert_one({"ancrid": ancrid, **r})
    for ancrid, pub in INHEIRA_PUBLISHING.items():
        for p in pub:
            await db.inheira_publishing.insert_one({"ancrid": ancrid, **p})
    for ancrid, passport in VAULTA_PASSPORTS.items():
        await db.vaulta_passports.insert_one({"ancrid": ancrid, **passport})
    for ancrid, booking in ANCRD_BOOKING.items():
        await db.ancrd_booking_packets.insert_one({"ancrid": ancrid, **booking})
    for ancrid, travel in ANCRD_TRAVEL.items():
        await db.ancrd_travel.insert_one({"ancrid": ancrid, **travel})
    for ancrid, rep in COHEIR_REP.items():
        await db.coheir_reputation.insert_one({"ancrid": ancrid, **rep})
    for ancrid, recs in COHEIR_INDUSTRY_RECS.items():
        for r in recs:
            await db.coheir_recommendations.insert_one({"ancrid": ancrid, **r})
    for ancrid, transcript in ANCRA_TRANSCRIPTS.items():
        await db.ancra_transcripts.insert_one({"ancrid": ancrid, **transcript})
    for ancrid, recs in ANCRA_FACULTY_RECS.items():
        for r in recs:
            await db.ancra_recommendations.insert_one({"ancrid": ancrid, **r})
    for ancrid, opps in ANCRSYNC_OPPS.items():
        for o in opps:
            await db.ancrsync_opportunities.insert_one({"ancrid": ancrid, **o})

    # Employers
    import uuid as _u
    for e in EMPLOYERS:
        await db.employers.insert_one({"id": str(_u.uuid4()), "verified": True, **e})

    # Opportunities
    for o in OPPORTUNITIES:
        await db.opportunities.insert_one({"id": str(_u.uuid4()), "posted_at": now, **o})

    # Resume placeholder for student & graduate — auto-generated
    student = DEMO_USERS[0]
    grad = DEMO_USERS[1]
    for u in (student, grad):
        await db.resumes.insert_one({
            "id": str(_u.uuid4()),
            "ancrid": u["ancrid"],
            "professional_summary": f"{u['discipline']} artist, {u['institution']}. CCDP verified. Portfolio assembled via the ANCR ecosystem.",
            "career_objective": "Contribute to a world-class creative organization while continuing to expand a verified portfolio across projects, media, and publishing.",
            "skills": ["Composition", "Production", "Collaboration", "Music Theory", "Live Performance"],
            "employment": [],
            "education": [{"institution": u["institution"], "credential": u["discipline"], "year": u.get("graduation_year")}],
            "awards": [],
            "updated_at": now,
        })

    # A few sample applications for the student
    opps = await db.opportunities.find({}, {"_id": 0}).to_list(100)
    for i, opp in enumerate(opps[:4]):
        stage = ["applied", "interview", "offer", "applied"][i]
        await db.applications.insert_one({
            "id": str(_u.uuid4()),
            "ancrid": student["ancrid"],
            "opportunity_id": opp["id"],
            "opportunity_title": opp["title"],
            "employer": opp["employer"],
            "stage": stage,
            "note": "",
            "applied_at": now,
            "updated_at": now,
        })

    # Interviews
    await db.interviews.insert_one({
        "id": str(_u.uuid4()),
        "ancrid": student["ancrid"],
        "employer": "Meridian Records",
        "role": "Staff Composer",
        "when": _iso(3),
        "meeting_link": "https://meet.example/ancr-meridian",
        "prep_notes": "Bring three orchestral demos and Silverwood cue sheet.",
        "follow_up": "",
        "status": "scheduled",
    })
    await db.interviews.insert_one({
        "id": str(_u.uuid4()),
        "ancrid": grad["ancrid"],
        "employer": "Northlight Publishing",
        "role": "Sync Producer (Remote)",
        "when": _iso(6),
        "meeting_link": "https://meet.example/ancr-northlight",
        "prep_notes": "Prep 5-track sync reel curated for cinematic briefs.",
        "follow_up": "",
        "status": "scheduled",
    })

    # Graduate outcomes
    for g in GRADUATE_OUTCOMES:
        await db.graduate_outcomes.insert_one({"id": str(_u.uuid4()), "ancrid": f"ANCR-OUT-{g['creator_name'].split()[0].upper()}", **g})
