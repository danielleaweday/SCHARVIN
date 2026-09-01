"""COHEIR™ rich seed data.
Populates the demo ecosystem with fictional but premium-feeling professionals,
students, cohorts, sessions, opportunities, recommendations, reviews, creative
teams, calendar events, resources, threads, messages and notifications.
"""
from __future__ import annotations
import uuid
import random
from datetime import datetime, timezone, timedelta
from typing import Any

from models import (
    User, Cohort, Session_, Review, Opportunity, Recommendation,
    CreativeTeam, CalendarEvent, Message, Thread, Resource, Notification,
    Institution,
)
from auth import hash_password


def _iso(dt: datetime) -> str:
    return dt.isoformat()


def _now() -> datetime:
    return datetime.now(timezone.utc)


AVATARS = {
    "producer_1": "https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=400&auto=format&fit=crop&q=80",
    "producer_2": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    "songwriter_1": "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&auto=format&fit=crop&q=80",
    "songwriter_2": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80",
    "engineer_1": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
    "engineer_2": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    "attorney_1": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80",
    "publisher_1": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
    "director_1": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    "director_2": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
    "faculty_1": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80",
    "faculty_2": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
    "manager_1": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
    "employer_1": "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&auto=format&fit=crop&q=80",
    "student_1": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
    "student_2": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80",
    "student_3": "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&auto=format&fit=crop&q=80",
    "student_4": "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&auto=format&fit=crop&q=80",
    "student_5": "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=400&auto=format&fit=crop&q=80",
    "student_6": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
    "student_7": "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&auto=format&fit=crop&q=80",
    "student_8": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
}

COVERS = {
    "studio": "https://images.pexels.com/photos/10933688/pexels-photo-10933688.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "team": "https://images.unsplash.com/photo-1691491918178-8a2e68b44919?w=1200&auto=format&fit=crop&q=80",
    "producer": "https://images.pexels.com/photos/5749192/pexels-photo-5749192.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "creative": "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&auto=format&fit=crop&q=80",
    "film": "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&auto=format&fit=crop&q=80",
    "publishing": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&auto=format&fit=crop&q=80",
    "writing": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&auto=format&fit=crop&q=80",
    "photo": "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&auto=format&fit=crop&q=80",
}


def _mk_user(**kw) -> dict:
    u = User(**kw)
    doc = u.model_dump()
    doc["created_at"] = _iso(doc["created_at"])
    return doc


def build_users() -> list[dict]:
    users: list[dict] = []

    # ── Institutions (users of type institution_admin) & primary demo student ──
    users.append(_mk_user(
        email="danielle.mcmillan@ccdp.edu",
        name="Danielle McMillan",
        picture=AVATARS["student_1"],
        role="student",
        program="Songwriting & Artist Development",
        institution="CCDP — Contemporary Creative Development Program",
        cohort_id=None,
        graduation_year=2027,
        skills=["Songwriting", "Vocal Production", "Topline", "Piano", "Music Business"],
        goals=["Sign to a major publisher", "Score a feature film", "Ship debut EP via ANCRLAB™"],
        bio="Songwriter and producer building a genre-fluid discography. Currently working on debut EP 'Halo Country' with ANCRLAB™ stems and ANCRSync™ collaboration.",
        location="Nashville, TN",
        career_readiness=78,
        provider="password",
        password_hash=hash_password("demo1234"),
        verified=True,
        achievements=[
            {"title": "ANCRLAB™ Session of the Month — Nov 2025", "date": "2025-11-01"},
            {"title": "Nashville Rising Songwriter Showcase — Finalist", "date": "2025-09-14"},
        ],
    ))

    # ── Producer #1 — Grammy-caliber ──
    users.append(_mk_user(
        email="cam.rivers@coheir.industry",
        name="Cam Rivers",
        picture=AVATARS["producer_1"],
        role="producer",
        roles=["mentor", "adjunct_faculty"],
        title="Grammy-Winning Producer",
        company="Blackglass Recordings",
        verified=True,
        provider="password",
        password_hash=hash_password("demo1234"),
        location="Atlanta, GA",
        disciplines=["Music Production", "A&R", "Beatmaking"],
        expertise=["Trap", "R&B", "Hybrid Pop", "Hip-Hop"],
        awards=["Grammy — Best R&B Album (2023)", "BET Producer of the Year (2022)", "ASCAP Rhythm Award (2021)"],
        certifications=["Dolby Atmos Music Certified"],
        languages=["English", "Spanish"],
        industries=["Recorded Music", "Publishing", "Film Scoring"],
        years_experience=14,
        availability="Office Hours: Wednesdays 2–5 PM CST",
        mentorship_philosophy="Great records come from great decisions. My job is to teach you how to make them faster, with taste, and under pressure. You'll leave every session with a shipped record — not a note-filled notebook.",
        teaching_interests=["Advanced Beatmaking", "Vocal Comping", "Executive Producing"],
        portfolio_links=[
            {"label": "Selected Discography", "url": "https://open.spotify.com/artist"},
            {"label": "Producer Reel", "url": "https://vimeo.com/producerreel"},
        ],
        professional_links=[
            {"label": "IMDb", "url": "https://imdb.com/producer"},
            {"label": "LinkedIn", "url": "https://linkedin.com/producer"},
        ],
        credits=[
            {"title": "\"Amber Ceiling\"", "artist": "Kaya Vance", "role": "Producer, Mix", "year": 2024, "label": "Blackglass / RCA"},
            {"title": "\"Night Signal\"", "artist": "Miles Ono", "role": "Producer, Songwriter", "year": 2023, "label": "Def Jam"},
            {"title": "\"Cathedral, LA\"", "artist": "SVN", "role": "Producer", "year": 2023, "label": "Warner"},
            {"title": "\"Halo Country\" (upcoming)", "artist": "Danielle McMillan", "role": "Executive Producer", "year": 2026, "label": "CCDP / ANCRLAB™"},
        ],
        career_history=[
            {"role": "Founder / Producer", "company": "Blackglass Recordings", "years": "2019 — Present"},
            {"role": "Senior Producer", "company": "Sony Music Publishing", "years": "2015 — 2019"},
            {"role": "Staff Producer", "company": "Def Jam Recordings", "years": "2011 — 2015"},
        ],
        current_projects=[
            {"title": "Halo Country EP", "role": "Executive Producer", "collaborators": ["Danielle McMillan", "Serban Ghenea"], "status": "In session"},
            {"title": "Film Score — 'Hollowlight'", "role": "Composer", "collaborators": ["A24"], "status": "Pre-production"},
        ],
    ))

    # ── Songwriter #1 ──
    users.append(_mk_user(
        email="theron.thomas@coheir.industry",
        name="Theron Thomas",
        picture=AVATARS["songwriter_1"],
        role="songwriter",
        roles=["mentor"],
        title="Hit Songwriter",
        company="Thomas Publishing",
        verified=True,
        provider="password",
        password_hash=hash_password("demo1234"),
        location="Los Angeles, CA",
        disciplines=["Songwriting", "Topline", "Publishing"],
        expertise=["Pop", "R&B", "Country Crossover"],
        awards=["ASCAP Songwriter of the Year (2023)", "5× BMI Pop Award"],
        languages=["English"],
        industries=["Publishing", "Recorded Music"],
        years_experience=18,
        availability="Writing Camp co-lead — quarterly cohorts",
        mentorship_philosophy="A song is a decision. I coach students to defend every line and every rest.",
        teaching_interests=["Topline Writing", "Song Architecture", "Publishing Business"],
        credits=[
            {"title": "\"Halcyon\"", "artist": "Ivy Mackenzie", "role": "Co-writer", "year": 2024, "label": "Interscope"},
            {"title": "\"Southbound\"", "artist": "The Devon Sons", "role": "Writer", "year": 2023, "label": "Big Loud"},
        ],
        current_projects=[
            {"title": "CCDP Writing Camp — Spring '26", "role": "Camp Lead", "status": "Scheduled"},
        ],
    ))

    # ── A&R Executive ──
    users.append(_mk_user(
        email="vanessa.jones@coheir.industry",
        name="Vanessa Jones",
        picture=AVATARS["director_2"],
        role="creative_director",
        roles=["mentor", "employer"],
        title="A&R Director",
        company="Interscope Records",
        verified=True,
        provider="password",
        password_hash=hash_password("demo1234"),
        location="New York, NY",
        disciplines=["A&R", "Artist Development", "Strategy"],
        expertise=["Signing Strategy", "Brand Positioning", "Release Rollouts"],
        awards=["Billboard Women in Music — Executive of the Year (2024)"],
        languages=["English", "French"],
        industries=["Recorded Music", "Talent Development"],
        years_experience=12,
        availability="1:1 Career Coaching: Tuesdays 4 PM EST",
        mentorship_philosophy="I don't sign potential. I sign readiness. My mentorship builds readiness.",
        current_projects=[
            {"title": "Interscope Spring '26 Signing Slate", "role": "A&R Lead", "status": "Active"},
        ],
    ))

    # ── Label Executive Producer ──
    users.append(_mk_user(
        email="steve.stoute@coheir.industry",
        name="Steve Sinclair",
        picture=AVATARS["publisher_1"],
        role="employer",
        roles=["mentor"],
        title="Executive Producer",
        company="United Masters",
        verified=True,
        provider="password",
        password_hash=hash_password("demo1234"),
        location="New York, NY",
        disciplines=["Brand Strategy", "Marketing", "Leadership"],
        expertise=["Independent Distribution", "Brand Partnerships", "Sync"],
        awards=["Cannes Lions Grand Prix"],
        years_experience=22,
    ))

    # ── Mix/Master Engineer ──
    users.append(_mk_user(
        email="serban.ghenea@coheir.industry",
        name="Serban Ghenea",
        picture=AVATARS["engineer_1"],
        role="engineer",
        roles=["mentor", "adjunct_faculty"],
        title="Grammy-Winning Mix Engineer",
        company="MixStar Studios",
        verified=True,
        provider="password",
        password_hash=hash_password("demo1234"),
        location="Miami, FL",
        disciplines=["Mixing", "Mastering", "Audio Engineering"],
        expertise=["Immersive Audio", "Dolby Atmos", "Pop Mixing"],
        awards=["11× Grammy Winner", "Latin Grammy — Mix Engineer of the Year (2022)"],
        certifications=["Dolby Atmos Certified", "AES Fellow"],
        years_experience=25,
        availability="Portfolio Reviews: Thursdays 10 AM EST",
        mentorship_philosophy="Mixing is listening under pressure. I teach both.",
        credits=[
            {"title": "20+ Billboard #1 records", "role": "Mix Engineer", "year": 2024},
        ],
    ))

    # ── Entertainment Attorney ──
    users.append(_mk_user(
        email="dina.laporte@coheir.industry",
        name="Dina Laporte, Esq.",
        picture=AVATARS["attorney_1"],
        role="attorney",
        roles=["mentor", "guest_lecturer"],
        title="Entertainment Attorney, Partner",
        company="Laporte & Vance LLP",
        verified=True,
        provider="password",
        password_hash=hash_password("demo1234"),
        location="Los Angeles, CA",
        disciplines=["Publishing Law", "Recording Agreements", "IP"],
        expertise=["Split Sheets", "Master Recording Deals", "Producer Agreements"],
        years_experience=17,
        availability="Office Hours: Fridays 1–3 PM PT",
        mentorship_philosophy="If you don't understand your paper, you don't own your career.",
    ))

    # ── Publisher ──
    users.append(_mk_user(
        email="mateo.hollis@coheir.industry",
        name="Mateo Hollis",
        picture=AVATARS["publisher_1"],
        role="publisher",
        roles=["mentor"],
        title="VP, Creative — Music Publishing",
        company="Kobalt / AWAL",
        verified=True,
        provider="password",
        password_hash=hash_password("demo1234"),
        location="London, UK",
        disciplines=["Publishing", "Sync Licensing"],
        expertise=["International Rollouts", "Sync Placement", "Catalog Development"],
        years_experience=15,
    ))

    # ── Manager ──
    users.append(_mk_user(
        email="renata.oshea@coheir.industry",
        name="Renata O'Shea",
        picture=AVATARS["manager_1"],
        role="manager",
        roles=["mentor"],
        title="Artist Manager",
        company="Field Trip Management",
        verified=True,
        provider="password",
        password_hash=hash_password("demo1234"),
        location="Toronto, ON",
        disciplines=["Artist Management", "Career Strategy"],
        expertise=["Emerging Artist Development", "Touring", "Brand Deals"],
        years_experience=10,
    ))

    # ── Creative Director ──
    users.append(_mk_user(
        email="julien.park@coheir.industry",
        name="Julien Park",
        picture=AVATARS["director_1"],
        role="creative_director",
        roles=["mentor"],
        title="Creative Director",
        company="Park & Company",
        verified=True,
        provider="password",
        password_hash=hash_password("demo1234"),
        location="Brooklyn, NY",
        disciplines=["Creative Direction", "Visual Identity", "Music Visuals"],
        expertise=["Album Rollouts", "Live Show Design", "Merch Universes"],
        years_experience=13,
    ))

    # ── Faculty Chair ──
    users.append(_mk_user(
        email="aisha.brooks@ccdp.edu",
        name="Dr. Aisha Brooks",
        picture=AVATARS["faculty_1"],
        role="department_chair",
        roles=["faculty"],
        title="Chair, Contemporary Songwriting",
        company="CCDP",
        institution="CCDP — Contemporary Creative Development Program",
        verified=True,
        provider="password",
        password_hash=hash_password("demo1234"),
        location="Nashville, TN",
        disciplines=["Songwriting Pedagogy", "Curriculum"],
        expertise=["Contemporary Songwriting", "Vocal Production", "Publishing Business"],
        years_experience=20,
        availability="Advisor Hours: Mon/Wed 1–4 PM CST",
    ))

    # ── Faculty ──
    users.append(_mk_user(
        email="raul.varga@ccdp.edu",
        name="Prof. Raul Varga",
        picture=AVATARS["faculty_2"],
        role="faculty",
        title="Professor of Audio Engineering",
        company="CCDP",
        institution="CCDP — Contemporary Creative Development Program",
        verified=True,
        provider="password",
        password_hash=hash_password("demo1234"),
        location="Nashville, TN",
        disciplines=["Audio Engineering", "Signal Flow"],
        expertise=["Studio Design", "Analog Console Workflows"],
        years_experience=22,
    ))

    # ── Institution Admin ──
    users.append(_mk_user(
        email="admin.president@ccdp.edu",
        name="President Nia Halverson",
        picture=AVATARS["director_2"],
        role="institution_admin",
        title="President, CCDP",
        company="Contemporary Creative Development Program",
        institution="CCDP — Contemporary Creative Development Program",
        verified=True,
        provider="password",
        password_hash=hash_password("demo1234"),
        location="Nashville, TN",
    ))

    # ── Employer (Studio) ──
    users.append(_mk_user(
        email="brand.hire@sonyhorizon.com",
        name="Kai Odenkirk",
        picture=AVATARS["employer_1"],
        role="employer",
        title="Head of Talent",
        company="Sony Horizon Studios",
        verified=True,
        provider="password",
        password_hash=hash_password("demo1234"),
        location="Los Angeles, CA",
    ))

    # ── ANCR Admin ──
    users.append(_mk_user(
        email="admin@ancr.io",
        name="ANCR Systems Admin",
        picture=None,
        role="ancr_admin",
        title="Ecosystem Administrator",
        company="ANCR",
        verified=True,
        provider="password",
        password_hash=hash_password("demo1234"),
    ))

    # ── Additional students (cohort) ──
    student_profiles = [
        ("Ana Reyes", "student_2", "Music Production", "Los Angeles, CA", ["Trap", "R&B", "Sound Design"], 72),
        ("Marcus Doyle", "student_3", "Audio Engineering", "Nashville, TN", ["Mixing", "Analog Workflow"], 65),
        ("Yui Nakamura", "student_4", "Film Scoring", "Tokyo, JP", ["Orchestration", "Hybrid Score"], 81),
        ("Kwame Bakari", "student_5", "Artist Development", "Atlanta, GA", ["Performance", "Songwriting"], 69),
        ("Isla Fernandez", "student_6", "Creative Business", "Miami, FL", ["A&R Research", "Marketing"], 74),
        ("Nolan Price", "student_7", "Publishing", "London, UK", ["Copyright", "Sync"], 71),
        ("Sasha Petrova", "student_8", "Photography & Visuals", "Berlin, DE", ["Portrait", "Album Art"], 67),
    ]
    for name, avatar_key, program, location, skills, readiness in student_profiles:
        users.append(_mk_user(
            email=f"{name.lower().replace(' ', '.')}@ccdp.edu",
            name=name,
            picture=AVATARS[avatar_key],
            role="student",
            program=program,
            institution="CCDP — Contemporary Creative Development Program",
            graduation_year=random.choice([2026, 2027, 2028]),
            skills=skills,
            location=location,
            career_readiness=readiness,
            provider="password",
            password_hash=hash_password("demo1234"),
            verified=True,
        ))

    # ── Alumni (successful CCDP graduates now working in industry) ──
    users.append(_mk_user(
        email="alumni.jordan.blake@coheir.industry",
        name="Jordan Blake",
        picture=AVATARS["student_5"],
        role="artist",
        roles=["mentor"],
        title="Recording Artist · CCDP '24",
        company="Independent · Atlantic Records",
        institution="CCDP — Contemporary Creative Development Program",
        verified=True,
        provider="password",
        password_hash=hash_password("demo1234"),
        location="Atlanta, GA",
        disciplines=["Artist Development", "Songwriting", "Performance"],
        expertise=["Live Show", "Emerging Artist Development"],
        years_experience=3,
        is_alumni=True,
        alumni_class=2024,
        alumni_role="Signed Recording Artist",
        bio="CCDP '24 graduate. Signed with Atlantic Records six months after graduation via a COHEIR™ mentor introduction.",
    ))
    users.append(_mk_user(
        email="alumni.priya.desai@coheir.industry",
        name="Priya Desai",
        picture=AVATARS["student_6"],
        role="publisher",
        roles=["mentor"],
        title="A&R Coordinator · CCDP '23",
        company="Warner Chappell Music",
        institution="CCDP — Contemporary Creative Development Program",
        verified=True,
        provider="password",
        password_hash=hash_password("demo1234"),
        location="Los Angeles, CA",
        disciplines=["Publishing", "A&R"],
        expertise=["Sync Placement", "Songwriter Development"],
        years_experience=4,
        is_alumni=True,
        alumni_class=2023,
        alumni_role="A&R Coordinator",
        bio="CCDP '23 alum. Progressed from Publishing intern to A&R Coordinator at Warner Chappell within 18 months.",
    ))

    return users


def build_all(now: datetime | None = None) -> dict[str, list[dict]]:
    now = now or _now()
    users = build_users()
    # index by role
    by_email = {u["email"]: u for u in users}
    danielle = by_email["danielle.mcmillan@ccdp.edu"]
    cam = by_email["cam.rivers@coheir.industry"]
    theron = by_email["theron.thomas@coheir.industry"]
    vanessa = by_email["vanessa.jones@coheir.industry"]
    serban = by_email["serban.ghenea@coheir.industry"]
    dina = by_email["dina.laporte@coheir.industry"]
    julien = by_email["julien.park@coheir.industry"]
    renata = by_email["renata.oshea@coheir.industry"]
    aisha = by_email["aisha.brooks@ccdp.edu"]
    mateo = by_email["mateo.hollis@coheir.industry"]
    steve = by_email["steve.stoute@coheir.industry"]
    raul = by_email["raul.varga@ccdp.edu"]
    kai = by_email["brand.hire@sonyhorizon.com"]

    students = [u for u in users if u["role"] == "student"]

    # attach mentors + cohort placeholders to Danielle
    danielle["mentor_ids"] = [cam["user_id"], theron["user_id"], vanessa["user_id"]]

    # ── Cohorts ──
    cohorts_raw = [
        Cohort(name="Songwriting — Spring '26", discipline="Songwriting", program="BFA Songwriting",
               institution="CCDP", year=2026,
               description="A twelve-week songwriting incubator with weekly Writing Camps led by verified hit writers and publishers.",
               faculty_lead_id=aisha["user_id"],
               mentor_ids=[theron["user_id"], vanessa["user_id"], mateo["user_id"]],
               student_ids=[s["user_id"] for s in students[:6]],
               cover_image=COVERS["writing"]),
        Cohort(name="Music Production — '26", discipline="Music Production", program="BFA Production",
               institution="CCDP", year=2026,
               description="Beat-first production cohort supervised by Grammy-winning producers and mix engineers.",
               faculty_lead_id=raul["user_id"],
               mentor_ids=[cam["user_id"], serban["user_id"]],
               student_ids=[s["user_id"] for s in students if s["program"] in ("Music Production", "Audio Engineering")],
               cover_image=COVERS["studio"]),
        Cohort(name="Film Scoring '26", discipline="Film", program="MFA Film Scoring",
               institution="CCDP", year=2026,
               description="Score-to-picture cohort in partnership with A24 mentors.",
               faculty_lead_id=raul["user_id"],
               mentor_ids=[cam["user_id"], julien["user_id"]],
               student_ids=[students[3]["user_id"]],
               cover_image=COVERS["film"]),
        Cohort(name="Creative Business '26", discipline="Creative Business", program="BFA Music Business",
               institution="CCDP", year=2026,
               description="A&R, publishing, and label strategy cohort — mentored by senior industry executives.",
               faculty_lead_id=aisha["user_id"],
               mentor_ids=[vanessa["user_id"], steve["user_id"], mateo["user_id"], dina["user_id"]],
               student_ids=[students[5]["user_id"], students[6]["user_id"]],
               cover_image=COVERS["team"]),
        Cohort(name="Publishing & Sync '26", discipline="Publishing", program="MFA Publishing",
               institution="CCDP", year=2026,
               description="Deep-dive publishing cohort covering copyright, sync licensing, and international rollouts.",
               faculty_lead_id=aisha["user_id"],
               mentor_ids=[mateo["user_id"], dina["user_id"]],
               student_ids=[students[6]["user_id"]],
               cover_image=COVERS["publishing"]),
        Cohort(name="Artist Development Lab '26", discipline="Artist Development", program="Certificate",
               institution="CCDP", year=2026,
               description="Twelve-week artist development lab: image, live performance, brand and rollout strategy.",
               faculty_lead_id=aisha["user_id"],
               mentor_ids=[vanessa["user_id"], julien["user_id"], renata["user_id"]],
               student_ids=[students[4]["user_id"], danielle["user_id"]],
               cover_image=COVERS["creative"]),
    ]
    cohorts = []
    for c in cohorts_raw:
        d = c.model_dump()
        d["created_at"] = _iso(d["created_at"])
        cohorts.append(d)

    # link Danielle's cohort
    danielle_cohort = cohorts[0]
    danielle["cohort_id"] = danielle_cohort["id"]
    danielle_cohort["student_ids"].append(danielle["user_id"])

    # ── Sessions ──
    sessions_raw = [
        Session_(title="Creative Career Coaching", kind="career_coaching",
                 description="Weekly 1:1 hours with Vanessa Jones for artists prepping their spring rollout.",
                 host_id=vanessa["user_id"], host_name=vanessa["name"],
                 start=now + timedelta(hours=3), duration_minutes=60,
                 attendee_ids=[danielle["user_id"]], location="Virtual — ANCRSync™",
                 cover_image=COVERS["team"], status="live", tags=["A&R", "Coaching"]),
        Session_(title="Inside the Studio: Vocal Comping Masterclass", kind="masterclass",
                 description="Serban Ghenea teaches decision-making at the vocal chain.",
                 host_id=serban["user_id"], host_name=serban["name"],
                 start=now + timedelta(days=1, hours=5), duration_minutes=90,
                 attendee_ids=[s["user_id"] for s in students[:4]], location="MixStar Studios / Live",
                 cover_image=COVERS["studio"], tags=["Mixing", "Vocals"]),
        Session_(title="A&R Insights: Signing Readiness", kind="panel",
                 description="Vanessa, Steve and Mateo unpack what makes a signable artist in 2026.",
                 host_id=vanessa["user_id"], host_name=vanessa["name"],
                 co_host_ids=[steve["user_id"], mateo["user_id"]],
                 start=now + timedelta(days=2, hours=2), duration_minutes=75,
                 attendee_ids=[s["user_id"] for s in students[:6]],
                 location="Virtual — ANCRSync™",
                 cover_image=COVERS["team"], tags=["A&R", "Panel"]),
        Session_(title="Writing Camp — Nashville Rooms", kind="writing_camp",
                 description="Three-day topline camp co-led by Theron Thomas and Dr. Aisha Brooks.",
                 host_id=theron["user_id"], host_name=theron["name"],
                 co_host_ids=[aisha["user_id"]],
                 start=now + timedelta(days=6), duration_minutes=180,
                 cohort_id=cohorts[0]["id"],
                 attendee_ids=[s["user_id"] for s in students[:3]] + [danielle["user_id"]],
                 location="Nashville, TN — Rooms 3, 4, 5",
                 cover_image=COVERS["writing"], tags=["Songwriting"]),
        Session_(title="Studio Session: Halo Country EP", kind="studio_session",
                 description="Cam Rivers and Danielle McMillan tracking vocals for EP single #2.",
                 host_id=cam["user_id"], host_name=cam["name"],
                 co_host_ids=[danielle["user_id"]],
                 start=now + timedelta(days=3, hours=7), duration_minutes=240,
                 attendee_ids=[danielle["user_id"]],
                 location="Blackglass Studio A, Atlanta",
                 cover_image=COVERS["producer"], tags=["Production", "Vocals"]),
        Session_(title="Executive Conversations: Entertainment Law Foundations", kind="guest_lecture",
                 description="Dina Laporte, Esq. walks students through split sheets and producer agreements.",
                 host_id=dina["user_id"], host_name=dina["name"],
                 start=now + timedelta(days=4, hours=4), duration_minutes=60,
                 attendee_ids=[s["user_id"] for s in students],
                 location="Virtual — ANCRSync™",
                 cover_image=COVERS["team"], tags=["Legal"]),
        Session_(title="Portfolio Review: Cohort Spring '26", kind="portfolio_review",
                 description="Rolling 90-minute portfolio reviews for the Songwriting cohort.",
                 host_id=theron["user_id"], host_name=theron["name"],
                 start=now + timedelta(days=5, hours=3), duration_minutes=90,
                 cohort_id=cohorts[0]["id"],
                 attendee_ids=[s["user_id"] for s in students[:5]] + [danielle["user_id"]],
                 location="Virtual — ANCRLAB™",
                 cover_image=COVERS["writing"], tags=["Review"]),
        Session_(title="Office Hours — Cam Rivers", kind="office_hours",
                 description="Open office hours: production critiques, career questions, session strategy.",
                 host_id=cam["user_id"], host_name=cam["name"],
                 start=now + timedelta(days=7, hours=3), duration_minutes=120,
                 attendee_ids=[s["user_id"] for s in students[:8]],
                 location="Virtual — ANCRSync™",
                 cover_image=COVERS["producer"], tags=["Office Hours"]),
    ]
    sessions = []
    for s in sessions_raw:
        d = s.model_dump()
        d["created_at"] = _iso(d["created_at"])
        d["start"] = _iso(d["start"])
        sessions.append(d)

    # ── Reviews ──
    reviews_raw = [
        Review(student_id=danielle["user_id"], reviewer_id=cam["user_id"], reviewer_name=cam["name"],
               scores={"creative_growth": 9, "technical_ability": 8, "professionalism": 9,
                       "communication": 8, "leadership": 7, "collaboration": 9,
                       "innovation": 9, "entrepreneurship": 8, "industry_readiness": 8},
               comments="Danielle demonstrates elite topline instincts and unusually mature production taste for her cohort year. Her ANCRLAB™ workflow is already at graduate level.",
               recommendations="Ready to enter the fall Writing Camp as a co-writer. Recommended for Interscope's A&R showcase.",
               growth_plan="Focus next 60 days on live performance and interview media training."),
        Review(student_id=students[0]["user_id"], reviewer_id=serban["user_id"], reviewer_name=serban["name"],
               scores={"creative_growth": 8, "technical_ability": 9, "professionalism": 8,
                       "communication": 7, "leadership": 6, "collaboration": 8,
                       "innovation": 8, "entrepreneurship": 6, "industry_readiness": 7},
               comments="Ana's mix decisions are increasingly confident. Excellent understanding of translation.",
               recommendations="Consider immersive audio elective; assign a mastering rotation.",
               growth_plan="Complete Atmos Music certification during Q2."),
        Review(student_id=students[3]["user_id"], reviewer_id=cam["user_id"], reviewer_name=cam["name"],
               scores={"creative_growth": 9, "technical_ability": 8, "professionalism": 9,
                       "communication": 9, "leadership": 9, "collaboration": 9,
                       "innovation": 8, "entrepreneurship": 9, "industry_readiness": 8},
               comments="Kwame is an artist first, technician second — and that's exactly right.",
               recommendations="Pair with Renata O'Shea for management pre-signing conversations.",
               growth_plan="Book two live shows and log takeaways in ANCRID™."),
    ]
    reviews = []
    for r in reviews_raw:
        d = r.model_dump()
        d["created_at"] = _iso(d["created_at"])
        reviews.append(d)

    # ── Opportunities ──
    opportunities_raw = [
        Opportunity(title="Interscope A&R Spring Showcase", posted_by_id=vanessa["user_id"],
                    posted_by_name=vanessa["name"], company="Interscope Records",
                    kind="artist_development",
                    description="Five slots for verified CCDP students to perform for the Interscope A&R team.",
                    location="Los Angeles, CA", disciplines=["Songwriting", "Artist Development"],
                    deadline=now + timedelta(days=14)),
        Opportunity(title="Session Vocalist — Halo Country EP", posted_by_id=cam["user_id"],
                    posted_by_name=cam["name"], company="Blackglass Recordings",
                    kind="session_work",
                    description="Vocalist for BG vocal stacks. Two-day paid session.",
                    location="Atlanta, GA", compensation="$1,200/day",
                    disciplines=["Vocal Production"],
                    deadline=now + timedelta(days=7)),
        Opportunity(title="Publishing Intern — Kobalt / AWAL", posted_by_id=mateo["user_id"],
                    posted_by_name=mateo["name"], company="Kobalt / AWAL",
                    kind="internship",
                    description="Summer publishing internship supporting the Sync & Catalog teams.",
                    location="London / Remote", compensation="Stipend + tuition credit",
                    disciplines=["Publishing", "Sync"],
                    deadline=now + timedelta(days=30)),
        Opportunity(title="Assistant Engineer — MixStar Studios", posted_by_id=serban["user_id"],
                    posted_by_name=serban["name"], company="MixStar Studios",
                    kind="assistant",
                    description="Twelve-week assistant engineer residency working directly under Serban Ghenea.",
                    location="Miami, FL", compensation="Paid residency",
                    disciplines=["Mixing", "Audio Engineering"],
                    deadline=now + timedelta(days=21)),
        Opportunity(title="Sony Horizon — Emerging Songwriter Grant", posted_by_id=kai["user_id"],
                    posted_by_name=kai["name"], company="Sony Horizon Studios",
                    kind="scholarship",
                    description="$25,000 grant + publishing consultation for emerging CCDP songwriters.",
                    location="Global — Remote", compensation="$25,000",
                    disciplines=["Songwriting"], deadline=now + timedelta(days=45)),
        Opportunity(title="Film Score Assistant — 'Hollowlight'", posted_by_id=cam["user_id"],
                    posted_by_name=cam["name"], company="A24 / Blackglass",
                    kind="film_project",
                    description="Score assistant on a feature film in pre-production.",
                    location="Los Angeles / Remote", compensation="Union scale",
                    disciplines=["Film Scoring", "Orchestration"],
                    deadline=now + timedelta(days=25)),
    ]
    opportunities = []
    for o in opportunities_raw:
        d = o.model_dump()
        d["created_at"] = _iso(d["created_at"])
        if d.get("deadline"):
            d["deadline"] = _iso(d["deadline"])
        opportunities.append(d)

    # ── Recommendations ──
    recs_raw = [
        Recommendation(student_id=danielle["user_id"], recommender_id=cam["user_id"], recommender_name=cam["name"],
                       for_type="publishing", target="Kobalt / AWAL",
                       narrative="Danielle McMillan is one of the most complete young songwriters I've worked with in ten years. She writes with intention, sings with authority, and ships. Fully recommend for a publishing conversation."),
        Recommendation(student_id=danielle["user_id"], recommender_id=vanessa["user_id"], recommender_name=vanessa["name"],
                       for_type="label", target="Interscope A&R Committee",
                       narrative="Signal to noise on Danielle is unusually clean. Recommended for our spring signing conversations."),
        Recommendation(student_id=students[3]["user_id"], recommender_id=renata["user_id"], recommender_name=renata["name"],
                       for_type="manager", target="Field Trip Management",
                       narrative="Kwame is stage-ready and disciplined. I am prepared to sign him after a 90-day development window."),
    ]
    recommendations = []
    for r in recs_raw:
        d = r.model_dump()
        d["created_at"] = _iso(d["created_at"])
        recommendations.append(d)

    # ── Creative Teams ──
    teams_raw = [
        CreativeTeam(name="Halo Country — EP Team", project="Halo Country EP",
                     lead_id=cam["user_id"], lead_name=cam["name"],
                     members=[
                         {"user_id": danielle["user_id"], "name": danielle["name"], "role": "Artist / Writer", "avatar": danielle["picture"]},
                         {"user_id": cam["user_id"], "name": cam["name"], "role": "Executive Producer", "avatar": cam["picture"]},
                         {"user_id": serban["user_id"], "name": serban["name"], "role": "Mix Engineer", "avatar": serban["picture"]},
                         {"user_id": julien["user_id"], "name": julien["name"], "role": "Creative Director", "avatar": julien["picture"]},
                         {"user_id": theron["user_id"], "name": theron["name"], "role": "Co-Writer", "avatar": theron["picture"]},
                     ],
                     description="EP development team supervising Danielle McMillan's debut EP.",
                     ancrsync_workspace="ANCRSync://halo-country",
                     cover_image=COVERS["studio"]),
        CreativeTeam(name="Cohort '26 A&R Roundtable", project="Cohort Signing Slate",
                     lead_id=vanessa["user_id"], lead_name=vanessa["name"],
                     members=[
                         {"user_id": vanessa["user_id"], "name": vanessa["name"], "role": "A&R Director", "avatar": vanessa["picture"]},
                         {"user_id": steve["user_id"], "name": steve["name"], "role": "Executive", "avatar": steve["picture"]},
                         {"user_id": mateo["user_id"], "name": mateo["name"], "role": "Publisher", "avatar": mateo["picture"]},
                     ],
                     description="Weekly A&R roundtable reviewing top cohort candidates for signing.",
                     ancrsync_workspace="ANCRSync://ar-roundtable",
                     cover_image=COVERS["team"]),
    ]
    teams = []
    for t in teams_raw:
        d = t.model_dump()
        d["created_at"] = _iso(d["created_at"])
        teams.append(d)

    # ── Calendar events ──
    events_raw = [
        CalendarEvent(title="Office Hours — Cam Rivers", owner_id=cam["user_id"], kind="office_hours",
                      start=now + timedelta(days=7, hours=3), end=now + timedelta(days=7, hours=5),
                      attendees=[s["user_id"] for s in students[:5]],
                      location="Virtual — ANCRSync™"),
        CalendarEvent(title="Portfolio Review — Danielle McMillan", owner_id=theron["user_id"],
                      kind="portfolio_review",
                      start=now + timedelta(days=2, hours=6), end=now + timedelta(days=2, hours=7),
                      attendees=[danielle["user_id"], theron["user_id"], vanessa["user_id"]]),
        CalendarEvent(title="Writing Camp — Nashville Rooms", owner_id=theron["user_id"], kind="writing_camp",
                      start=now + timedelta(days=6), end=now + timedelta(days=8),
                      attendees=[s["user_id"] for s in students[:3]] + [danielle["user_id"]],
                      location="Nashville, TN"),
        CalendarEvent(title="Studio Session — Halo Country", owner_id=cam["user_id"], kind="studio_session",
                      start=now + timedelta(days=3, hours=7), end=now + timedelta(days=3, hours=11),
                      attendees=[cam["user_id"], danielle["user_id"], serban["user_id"]],
                      location="Blackglass Studio A"),
        CalendarEvent(title="A&R Insights Panel", owner_id=vanessa["user_id"], kind="industry_meeting",
                      start=now + timedelta(days=2, hours=2), end=now + timedelta(days=2, hours=3, minutes=15),
                      attendees=[s["user_id"] for s in students],
                      location="Virtual — ANCRSync™"),
    ]
    events = []
    for e in events_raw:
        d = e.model_dump()
        d["created_at"] = _iso(d["created_at"])
        d["start"] = _iso(d["start"])
        d["end"] = _iso(d["end"])
        events.append(d)

    # ── Threads + Messages ──
    threads_raw = [
        Thread(title="Halo Country EP — Team", participant_ids=[cam["user_id"], danielle["user_id"], serban["user_id"], julien["user_id"]],
               kind="group", last_message="Uploaded new vocal comp to ANCRLAB™.",
               last_at=now - timedelta(minutes=42)),
        Thread(title="Cohort Spring '26 — Songwriting", participant_ids=[theron["user_id"], aisha["user_id"], danielle["user_id"]] + [s["user_id"] for s in students[:3]],
               kind="group", last_message="Camp rooms locked for Friday.", last_at=now - timedelta(hours=3)),
        Thread(title="Cam Rivers ↔ Danielle McMillan", participant_ids=[cam["user_id"], danielle["user_id"]],
               kind="direct", last_message="Great pass on the bridge — let's revisit tomorrow.",
               last_at=now - timedelta(minutes=6)),
        Thread(title="Vanessa Jones — Career Coaching", participant_ids=[vanessa["user_id"], danielle["user_id"]],
               kind="direct", last_message="Sending you the A&R rollout deck.", last_at=now - timedelta(hours=1)),
    ]
    threads = []
    thread_map: list[tuple[str, dict]] = []
    for t in threads_raw:
        d = t.model_dump()
        d["created_at"] = _iso(d["created_at"])
        d["last_at"] = _iso(d["last_at"])
        threads.append(d)
        thread_map.append((d["id"], d))

    # some messages
    messages = []
    demo_msgs = [
        (threads[2]["id"], cam, "Just uploaded a new vocal pass to ANCRLAB™. Take a listen and send timestamps."),
        (threads[2]["id"], danielle, "Listening now — the pre-chorus feels tighter. I'll comp another read tonight."),
        (threads[2]["id"], cam, "Great pass on the bridge — let's revisit tomorrow."),
        (threads[0]["id"], cam, "Uploaded new vocal comp to ANCRLAB™."),
        (threads[0]["id"], serban, "I'll get on the rough mix by Friday morning."),
        (threads[3]["id"], vanessa, "Sending you the A&R rollout deck."),
    ]
    for tid, u, body in demo_msgs:
        m = Message(thread_id=tid, sender_id=u["user_id"], sender_name=u["name"], body=body,
                    kind="direct")
        d = m.model_dump()
        d["created_at"] = _iso(d["created_at"])
        messages.append(d)

    # ── Resources ──
    resources_raw = [
        Resource(title="Split Sheet Template (2026)", kind="template",
                 description="COHEIR™ standard split sheet template reviewed by Laporte & Vance.",
                 uploaded_by_id=dina["user_id"], uploaded_by_name=dina["name"],
                 tags=["Legal", "Split Sheet"], cover_image=COVERS["publishing"]),
        Resource(title="Producer Agreement — Boilerplate", kind="contract",
                 description="Producer agreement boilerplate for CCDP-facilitated sessions.",
                 uploaded_by_id=dina["user_id"], uploaded_by_name=dina["name"],
                 tags=["Legal", "Producer"], cover_image=COVERS["publishing"]),
        Resource(title="Mixing Chain Reference Pack", kind="reference",
                 description="Serban Ghenea's signature reference chain settings and templates.",
                 uploaded_by_id=serban["user_id"], uploaded_by_name=serban["name"],
                 tags=["Mixing", "Templates"], cover_image=COVERS["studio"]),
        Resource(title="Topline Writing — Masterclass Video", kind="video",
                 description="Theron Thomas walks through his topline process on a live song.",
                 uploaded_by_id=theron["user_id"], uploaded_by_name=theron["name"],
                 tags=["Songwriting"], cover_image=COVERS["writing"]),
        Resource(title="A&R Signing Playbook", kind="pdf",
                 description="Vanessa Jones's playbook for readiness signals A&R teams look for.",
                 uploaded_by_id=vanessa["user_id"], uploaded_by_name=vanessa["name"],
                 tags=["A&R", "Strategy"], cover_image=COVERS["team"]),
    ]
    resources = []
    for r in resources_raw:
        d = r.model_dump()
        d["created_at"] = _iso(d["created_at"])
        resources.append(d)

    # ── Notifications for Danielle ──
    notifs_raw = [
        Notification(user_id=danielle["user_id"], kind="feedback", title="New review from Cam Rivers",
                     body="Cam Rivers published a new Professional Review on your portfolio.",
                     link="/reviews"),
        Notification(user_id=danielle["user_id"], kind="opportunity_match", title="Opportunity match: Interscope Spring Showcase",
                     body="Your profile matches the Interscope A&R Spring Showcase brief.",
                     link="/opportunities"),
        Notification(user_id=danielle["user_id"], kind="session", title="Live in 15 min — Career Coaching",
                     body="Vanessa Jones will be live for your 1:1 in 15 minutes.",
                     link="/sessions"),
        Notification(user_id=danielle["user_id"], kind="milestone", title="ANCRID™ credential added",
                     body="Recommendation from Vanessa Jones has been permanently added to your ANCRID™.",
                     link="/ancrid"),
    ]
    notifications = []
    for n in notifs_raw:
        d = n.model_dump()
        d["created_at"] = _iso(d["created_at"])
        notifications.append(d)

    # ── Institution ──
    institution = Institution(
        name="CCDP — Contemporary Creative Development Program",
        short_code="CCDP", country="United States",
        programs=["BFA Songwriting", "BFA Production", "BFA Music Business", "MFA Film Scoring", "MFA Publishing"],
        verified=True,
    ).model_dump()
    institution["created_at"] = _iso(institution["created_at"])

    return {
        "users": users,
        "cohorts": cohorts,
        "sessions": sessions,
        "reviews": reviews,
        "opportunities": opportunities,
        "recommendations": recommendations,
        "creative_teams": teams,
        "calendar_events": events,
        "threads": threads,
        "messages": messages,
        "resources": resources,
        "notifications": notifications,
        "institutions": [institution],
    }
