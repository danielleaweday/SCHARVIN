"""Realistic CCDP seed data for ANCRA v2.0 — Contemporary Creative Development Program."""
from datetime import datetime, timezone, timedelta
import uuid


def _id() -> str:
    return str(uuid.uuid4())


def _now():
    return datetime.now(timezone.utc).isoformat()


# ------------------------------------------------------------
# STUDENT + FACULTY personas
# ------------------------------------------------------------
STUDENT_ID = "stu_maya_ellis"
FACULTY_ID = "fac_terrence_bloom"

_STUDENTS = [
    {
        "id": STUDENT_ID, "is_active": True,
        "name": "Maya Ellis", "handle": "@mayaellis",
        "cohort": "Fall 2025 · Cohort 07",
        "concentration": "Songwriting & Production",
        "year": "Sophomore",
        "portfolio_score": 87,
        "graduation_readiness": 74,
        "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
        "location": "Atlanta, GA",
        "join_date": "2024-08-19",
    },
    {"id": "stu_jordan_kai", "is_active": False, "name": "Jordan Kai", "cohort": "Fall 2025 · Cohort 07",
     "concentration": "Production", "portfolio_score": 82, "graduation_readiness": 68,
     "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop"},
    {"id": "stu_ava_reyes", "is_active": False, "name": "Ava Reyes", "cohort": "Fall 2025 · Cohort 07",
     "concentration": "Songwriting", "portfolio_score": 91, "graduation_readiness": 88,
     "avatar": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop"},
    {"id": "stu_dre_walker", "is_active": False, "name": "Dre Walker", "cohort": "Spring 2025 · Cohort 06",
     "concentration": "Performance", "portfolio_score": 79, "graduation_readiness": 71,
     "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"},
    {"id": "stu_lena_park", "is_active": False, "name": "Lena Park", "cohort": "Fall 2025 · Cohort 07",
     "concentration": "Songwriting & Publishing", "portfolio_score": 84, "graduation_readiness": 79,
     "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop"},
    {"id": "stu_noah_king", "is_active": False, "name": "Noah King", "cohort": "Spring 2025 · Cohort 06",
     "concentration": "Production & Engineering", "portfolio_score": 88, "graduation_readiness": 82,
     "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop"},
]

_FACULTY = [
    {
        "id": FACULTY_ID, "is_active": True,
        "name": "Prof. Terrence Bloom",
        "title": "Studio Director · Artist in Residence",
        "specialization": "Songwriting Architecture · Publishing",
        "avatar": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop",
        "credits": ["Multi-platinum producer", "3× Grammy nominee", "20 yr industry"],
        "office_hours": "Tue · Thu 14:00–16:00",
    },
    {"id": "fac_ivy_marsh", "is_active": False, "name": "Ivy Marsh", "title": "Executive in Residence",
     "specialization": "A&R · Label Strategy", "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop"},
    {"id": "fac_lucas_neri", "is_active": False, "name": "Lucas Neri", "title": "Adjunct · Producer",
     "specialization": "Sound Design · Mix Engineering", "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop"},
]


# ------------------------------------------------------------
# STUDIO EXPERIENCES™ (formerly "courses")
# ------------------------------------------------------------
_EXPERIENCES = [
    {
        "id": "exp_songwriting_arch", "active": True,
        "title": "Songwriting Architecture",
        "kind": "Studio Experience™",
        "tag": "SIGNATURE · SEMESTER 3",
        "faculty": "Prof. Terrence Bloom",
        "duration": "12 weeks",
        "progress": 68,
        "cover": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600&h=900&fit=crop",
        "description": "Deconstruct commercial and canonical songs to reverse-engineer their emotional architecture. Weekly build sessions in ANCRLAB™ culminate in an INHEIRA™ registered original.",
        "cohort_size": 18,
        "next_session": "Today · 14:00 · Studio B",
    },
    {
        "id": "exp_production_lab", "active": True,
        "title": "Production Lab · Vol. II",
        "kind": "Creative Lab™",
        "tag": "SEMESTER 3",
        "faculty": "Lucas Neri",
        "duration": "10 weeks",
        "progress": 42,
        "cover": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1600&h=900&fit=crop",
        "description": "Modern production techniques across genre. Weekly stem drops in ANCRLAB™; peer mixdown review in ANCRSync™.",
        "cohort_size": 22,
    },
    {
        "id": "exp_industry_negotiate", "active": True,
        "title": "The Deal Room",
        "kind": "Industry Experience™",
        "tag": "MASTER SESSION",
        "faculty": "Ivy Marsh",
        "duration": "6 weeks",
        "progress": 12,
        "cover": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600&h=900&fit=crop",
        "description": "Negotiation, publishing, and label deal structure taught by working executives. Live mock deal sessions. Vaulta™ integration for royalty modeling.",
        "cohort_size": 30,
    },
    {
        "id": "exp_performance_stage", "active": True,
        "title": "Stagecraft · The Performing Voice",
        "kind": "Professional Studio™",
        "tag": "SEMESTER 3",
        "faculty": "Prof. Terrence Bloom",
        "duration": "8 weeks",
        "progress": 55,
        "cover": "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1600&h=900&fit=crop",
        "description": "From studio to stage. Movement, breath, mic technique, and live-audience psychology, filmed for ANCRVIEW™.",
        "cohort_size": 16,
    },
    {
        "id": "exp_portfolio_review", "active": True,
        "title": "Portfolio Experience™ · Mid-Term Panels",
        "kind": "Portfolio Experience™",
        "tag": "COHORT 07",
        "faculty": "Panel of 4",
        "duration": "2 weeks",
        "progress": 20,
        "cover": "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600&h=900&fit=crop",
        "description": "Live portfolio critique with faculty and industry panel. Reviewed work automatically syncs to ANCRID™ Creator Passport.",
        "cohort_size": 24,
    },
    {
        "id": "exp_collab_room", "active": True,
        "title": "Writing Rooms · Guest Session",
        "kind": "Collaborative Experience™",
        "tag": "WEEK 6",
        "faculty": "Ivy Marsh + Guests",
        "duration": "1 week intensive",
        "progress": 90,
        "cover": "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1600&h=900&fit=crop",
        "description": "Cross-cohort ANCRSync™ writing rooms. Split ownership auto-registered in INHEIRA™.",
        "cohort_size": 40,
    },
]


# ------------------------------------------------------------
# LESSONS (belong to experiences)
# ------------------------------------------------------------
_LESSONS = [
    {
        "id": "les_song_01", "experience_id": "exp_songwriting_arch",
        "title": "The First Eight Bars", "chapter": "01",
        "duration": "24 min",
        "kind": "video",
        "video_poster": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1920&h=1080&fit=crop",
        "instructor": "Prof. Terrence Bloom",
        "summary": "Why the first eight bars carry the emotional contract of the entire record.",
        "chapters": [
            {"t": "00:00", "title": "Opening — The Emotional Contract"},
            {"t": "04:12", "title": "Case Study · 'Landslide'"},
            {"t": "09:44", "title": "Case Study · Frank Ocean"},
            {"t": "14:20", "title": "Melodic Kernel"},
            {"t": "19:05", "title": "Studio Exercise Brief"},
        ],
        "resources": [
            {"title": "Score PDF · Landslide reduction", "kind": "pdf"},
            {"title": "Ableton stem pack", "kind": "ancrlab", "module": "ANCRLAB"},
            {"title": "Register your first eight in INHEIRA", "kind": "inheira", "module": "INHEIRA"},
        ],
        "next_actions": [
            {"label": "Open in ANCRLAB", "module": "ANCRLAB"},
            {"label": "Save to INHEIRA", "module": "INHEIRA"},
            {"label": "Book review · COHEIR", "module": "COHEIR"},
        ],
    },
    {
        "id": "les_song_02", "experience_id": "exp_songwriting_arch",
        "title": "The Prosody of the Chorus", "chapter": "02",
        "duration": "31 min", "kind": "video",
        "video_poster": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&h=1080&fit=crop",
        "instructor": "Prof. Terrence Bloom",
        "summary": "How vowel shape and syllable stress become the melodic hook.",
    },
    {
        "id": "les_prod_01", "experience_id": "exp_production_lab",
        "title": "Sound Design · Building Your Palette", "chapter": "01",
        "duration": "38 min", "kind": "ancrlab_session",
        "video_poster": "https://images.unsplash.com/photo-1574517947730-55cb23e608c2?w=1920&h=1080&fit=crop",
        "instructor": "Lucas Neri",
    },
    {
        "id": "les_deal_01", "experience_id": "exp_industry_negotiate",
        "title": "The Anatomy of a Publishing Deal", "chapter": "01",
        "duration": "45 min", "kind": "master_session",
        "video_poster": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920&h=1080&fit=crop",
        "instructor": "Ivy Marsh",
    },
]


# ------------------------------------------------------------
# 30 SONG PROGRESS — CCDP's signature capstone tracker
# ------------------------------------------------------------
_SONG_STATES = [
    ("released", 6),   # 6 songs released
    ("mastered", 3),   # 3 mastered
    ("mixed", 4),
    ("recorded", 5),
    ("demo", 4),
    ("writing", 3),
    ("locked", 5),     # locked/not started
]

_SONG_TITLES = [
    "Northern Static", "Half-Light Room", "Cathedral in July", "Blue Hour",
    "Say Less", "Trellis", "Softwater", "Meridian", "Kite String",
    "Every Small Rebellion", "Static Bloom", "Undertow", "Motor City Sundown",
    "Paperskin", "Salt & Ember", "The Fever Dream", "Low Country",
    "Neon Genesis", "Petrichor", "The Long Way Home", "Ghost Note",
    "Analog Heart", "Crossfade", "The Understudy", "Sunday Radio",
    "Vespers", "Halogen", "Terminal", "Marlow's Song", "Coda",
]


def _build_songs():
    songs = []
    idx = 0
    for status, count in _SONG_STATES:
        for _ in range(count):
            songs.append({
                "id": f"song_{idx+1:02d}",
                "student_id": STUDENT_ID,
                "number": idx + 1,
                "title": _SONG_TITLES[idx],
                "status": status,
                "co_writers": ["Ava Reyes"] if idx % 4 == 0 else [],
                "inheira_registered": status in ("mixed", "mastered", "released"),
                "vaulta_royalty_active": status == "released",
            })
            idx += 1
    return songs


# ------------------------------------------------------------
# JOURNEY (student's learning arc)
# ------------------------------------------------------------
_JOURNEYS = [
    {
        "id": "jrn_maya_fall25", "student_id": STUDENT_ID,
        "title": "Learning Journey™ · Fall 2025",
        "phase": "Semester 3 · Concentration Deepening",
        "milestones": [
            {"label": "Foundations", "done": True, "date": "May 2024"},
            {"label": "Studio Fluency", "done": True, "date": "Dec 2024"},
            {"label": "Concentration", "done": False, "current": True, "date": "In progress"},
            {"label": "Mid-Program Portfolio Review", "done": False, "date": "Feb 2026"},
            {"label": "Capstone Development", "done": False, "date": "Fall 2026"},
            {"label": "Industry Placement · ANCRLaunch™", "done": False, "date": "Spring 2027"},
        ],
        "progress": 41,
    }
]


# ------------------------------------------------------------
# ASSIGNMENTS + CAPSTONES + PORTFOLIO
# ------------------------------------------------------------
_ASSIGNMENTS = [
    {"id": _id(), "title": "First Eight — melodic sketch", "experience": "Songwriting Architecture",
     "kind": "recording", "due": "Feb 14", "status": "in_progress", "priority": "high"},
    {"id": _id(), "title": "Sound Design palette — 12 patches", "experience": "Production Lab · Vol. II",
     "kind": "ancrlab", "due": "Feb 16", "status": "not_started", "priority": "medium"},
    {"id": _id(), "title": "Publishing deal breakdown (peer)", "experience": "The Deal Room",
     "kind": "writing", "due": "Feb 19", "status": "in_progress", "priority": "medium"},
    {"id": _id(), "title": "Mid-term portfolio 3 tracks", "experience": "Portfolio Review",
     "kind": "portfolio", "due": "Feb 24", "status": "not_started", "priority": "high"},
    {"id": _id(), "title": "Writing Room · Session 3", "experience": "Writing Rooms",
     "kind": "collaboration", "due": "Feb 11", "status": "submitted", "priority": "low"},
    {"id": _id(), "title": "Stage rehearsal · block A", "experience": "Stagecraft",
     "kind": "performance", "due": "Feb 21", "status": "in_progress", "priority": "medium"},
]

_CAPSTONES = [
    {
        "id": "cap_ep_debut", "student_id": STUDENT_ID,
        "title": "Debut EP · 5 originals",
        "phase": "Development · Track 3 of 5",
        "advisor": "Prof. Terrence Bloom",
        "industry_reviewer": "Ivy Marsh",
        "progress": 42,
        "linked_songs": 5,
        "linked_module": "INHEIRA",
        "cover": "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&h=800&fit=crop",
    },
    {
        "id": "cap_publish_thesis", "student_id": STUDENT_ID,
        "title": "Publishing Thesis — Split Logic in Modern Songwriting",
        "phase": "Research",
        "advisor": "Ivy Marsh",
        "progress": 18,
        "cover": "https://images.unsplash.com/photo-1524169358666-79f22534bc6e?w=1200&h=800&fit=crop",
    },
]

_PORTFOLIO = [
    {"id": _id(), "title": "Cathedral in July", "kind": "master", "score": 92, "reviewer": "T. Bloom",
     "cover": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=800&fit=crop"},
    {"id": _id(), "title": "Half-Light Room", "kind": "master", "score": 89, "reviewer": "L. Neri",
     "cover": "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&h=800&fit=crop"},
    {"id": _id(), "title": "Say Less", "kind": "mix", "score": 84, "reviewer": "T. Bloom",
     "cover": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=800&fit=crop"},
    {"id": _id(), "title": "Live from Studio B", "kind": "performance", "score": 91, "reviewer": "Panel",
     "cover": "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=800&fit=crop"},
]


# ------------------------------------------------------------
# CALENDAR + SESSIONS + TEAMS + MESSAGES + ACHIEVEMENTS
# ------------------------------------------------------------
_TODAY = datetime.now(timezone.utc).date()


def _cal():
    events = [
        {"id": _id(), "student_id": STUDENT_ID, "today": True, "date": _TODAY.isoformat(),
         "start": "09:30", "end": "10:15", "title": "Studio B · Vocal capture",
         "kind": "studio", "location": "Studio B", "module": "ANCRLAB"},
        {"id": _id(), "student_id": STUDENT_ID, "today": True, "date": _TODAY.isoformat(),
         "start": "11:00", "end": "12:30", "title": "Songwriting Architecture · Lecture 02",
         "kind": "lecture", "location": "Cinema Hall", "module": "ANCRA"},
        {"id": _id(), "student_id": STUDENT_ID, "today": True, "date": _TODAY.isoformat(),
         "start": "14:00", "end": "16:00", "title": "Writing Room · Ava + Lena",
         "kind": "collab", "location": "ANCRSync", "module": "ANCRSync"},
        {"id": _id(), "student_id": STUDENT_ID, "today": True, "date": _TODAY.isoformat(),
         "start": "17:00", "end": "18:00", "title": "Mentor 1:1 · Prof. Bloom",
         "kind": "mentor", "location": "COHEIR", "module": "COHEIR"},
    ]
    for i in range(1, 14):
        d = _TODAY + timedelta(days=i)
        events.append({"id": _id(), "student_id": STUDENT_ID, "today": False, "date": d.isoformat(),
                       "start": "10:00", "end": "11:30",
                       "title": ["Production Lab", "The Deal Room", "Stagecraft",
                                "Peer Critique", "Guest Master Session · Grammy Winner",
                                "Writing Room", "Mid-Term Panel Prep"][i % 7],
                       "kind": ["lecture", "industry", "performance", "peer", "master", "collab", "review"][i % 7],
                       "module": ["ANCRA", "COHEIR", "ANCRA", "ANCRSync", "ANCRVIEW", "ANCRSync", "COHEIR"][i % 7]})
    return events


_SESSIONS = [
    {"id": _id(), "upcoming": True, "title": "Master Session · Sylvia Massy on Sonic Risk",
     "when": "Thu · 15:00", "guest": "Sylvia Massy", "kind": "master",
     "cover": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=700&fit=crop"},
    {"id": _id(), "upcoming": True, "title": "A&R Panel · Live Signing Decisions",
     "when": "Fri · 11:00", "guest": "Ivy Marsh + Panel of 3", "kind": "industry",
     "cover": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=700&fit=crop"},
    {"id": _id(), "upcoming": True, "title": "Live Critique · Cohort 07 Portfolio",
     "when": "Mon · 10:00", "guest": "Faculty Panel", "kind": "critique",
     "cover": "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&h=700&fit=crop"},
]

_TEAMS = [
    {"id": "team_nightshift", "name": "Nightshift", "kind": "Writing Room",
     "members": ["Maya Ellis", "Ava Reyes", "Lena Park"],
     "active_project": "Cathedral in July · v3",
     "module_link": "ANCRSync",
     "avatar": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop"},
    {"id": "team_lowfi", "name": "Lo-Fi Society", "kind": "Production Collective",
     "members": ["Maya Ellis", "Noah King", "Dre Walker", "+2"],
     "active_project": "Compilation EP · Winter",
     "module_link": "ANCRLAB",
     "avatar": "https://images.unsplash.com/photo-1574517947730-55cb23e608c2?w=400&h=400&fit=crop"},
]

_MESSAGES = [
    {"id": _id(), "from": "Prof. Terrence Bloom", "kind": "faculty",
     "preview": "Loved the melodic kernel in your v3. Let's tighten prosody in the chorus…",
     "when": "12m", "unread": True,
     "avatar": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop"},
    {"id": _id(), "from": "Ivy Marsh", "kind": "industry",
     "preview": "Bringing three publishers to Friday's panel. Have a 90-sec pitch ready.",
     "when": "1h", "unread": True,
     "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop"},
    {"id": _id(), "from": "Ava Reyes · Nightshift", "kind": "team",
     "preview": "Uploaded my top-line on the bridge. Take a listen when you get a sec.",
     "when": "3h", "unread": False,
     "avatar": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"},
    {"id": _id(), "from": "AIAH", "kind": "aiah",
     "preview": "Two songs sit at 'demo' for 3+ weeks. Want me to schedule a working session?",
     "when": "5h", "unread": False,
     "avatar": None},
]

_ACHIEVEMENTS = [
    {"id": _id(), "student_id": STUDENT_ID, "title": "First INHEIRA™ Registration", "when": "Oct 2024",
     "kind": "milestone"},
    {"id": _id(), "student_id": STUDENT_ID, "title": "Portfolio Score 85+", "when": "Dec 2024", "kind": "score"},
    {"id": _id(), "student_id": STUDENT_ID, "title": "5 Songs Released via ANCRWAV™", "when": "Jan 2026",
     "kind": "release"},
    {"id": _id(), "student_id": STUDENT_ID, "title": "Cohort Mentor · Peer Recognition", "when": "Nov 2025",
     "kind": "community"},
    {"id": _id(), "student_id": STUDENT_ID, "title": "First Vaulta™ Royalty Payout", "when": "Dec 2025",
     "kind": "financial"},
    {"id": _id(), "student_id": STUDENT_ID, "title": "Industry Panel Selection · A&R", "when": "Feb 2026",
     "kind": "industry"},
]


# ------------------------------------------------------------
# COHORTS + REVIEWS (faculty side)
# ------------------------------------------------------------
_COHORTS = [
    {"id": "co_fall25_07", "name": "Fall 2025 · Cohort 07", "students": 24,
     "concentration_mix": "Songwriting 42% · Production 33% · Performance 25%",
     "avg_score": 84, "graduation_ready": 8, "at_risk": 2},
    {"id": "co_spring25_06", "name": "Spring 2025 · Cohort 06", "students": 22,
     "avg_score": 87, "graduation_ready": 14, "at_risk": 1},
    {"id": "co_fall24_05", "name": "Fall 2024 · Cohort 05", "students": 26,
     "avg_score": 89, "graduation_ready": 22, "at_risk": 0},
]

_REVIEWS = [
    {"id": _id(), "student": "Maya Ellis", "kind": "Portfolio Review", "experience": "Songwriting Architecture",
     "status": "pending", "needs_approval": True, "submitted": "2h ago", "priority": "high",
     "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"},
    {"id": _id(), "student": "Ava Reyes", "kind": "Live Critique Prep", "experience": "Portfolio Panels",
     "status": "pending", "needs_approval": True, "submitted": "4h ago", "priority": "high",
     "avatar": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"},
    {"id": _id(), "student": "Noah King", "kind": "Capstone Milestone", "experience": "Debut Album",
     "status": "pending", "needs_approval": False, "submitted": "1d", "priority": "medium",
     "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop"},
    {"id": _id(), "student": "Lena Park", "kind": "Industry Session Recommendation", "experience": "The Deal Room",
     "status": "pending", "needs_approval": True, "submitted": "5h ago", "priority": "medium",
     "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop"},
    {"id": _id(), "student": "Dre Walker", "kind": "Stagecraft Assessment", "experience": "Stagecraft",
     "status": "pending", "needs_approval": False, "submitted": "8h", "priority": "low",
     "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"},
]


# ------------------------------------------------------------
# ECOSYSTEM HUB DATA — one per module
# ------------------------------------------------------------
def _hub(module, title, headline, activity, metrics, cta_module):
    return {
        "id": _id(), "module": module.lower(), "title": title, "headline": headline,
        "activity": activity, "metrics": metrics, "cta_module": cta_module,
    }


_HUBS = [
    _hub("ANCRLAB", "ANCRLAB™",
         "3 active studio projects · 2 sessions today",
         [
             {"when": "42m ago", "text": "Uploaded Cathedral in July · Master v3 stems", "kind": "upload"},
             {"when": "3h ago", "text": "Studio A booked · Vocal capture with Ava", "kind": "studio"},
             {"when": "yesterday", "text": "Sound Design palette · 8/12 patches", "kind": "progress"},
         ],
         [{"label": "Active Projects", "value": "3"},
          {"label": "Studio Hours (mo)", "value": "42h"},
          {"label": "Collaborators", "value": "6"},
          {"label": "AI Suggestions", "value": "2 new"}],
         "ANCRLAB"),
    _hub("ANCRSync", "ANCRSync™",
         "2 writing rooms live · 4 pending teammates",
         [
             {"when": "18m ago", "text": "Ava uploaded top-line stem · bridge", "kind": "collab"},
             {"when": "2h ago", "text": "Nightshift session scheduled Thu 14:00", "kind": "session"},
             {"when": "1d ago", "text": "Lo-Fi Society added Noah King", "kind": "team"},
         ],
         [{"label": "Writing Rooms", "value": "2 active"},
          {"label": "Teams", "value": "2"},
          {"label": "Unread", "value": "4"},
          {"label": "Sessions week", "value": "5"}],
         "ANCRSync"),
    _hub("INHEIRA", "INHEIRA™",
         "13 songs registered · 2 pending publishing verification",
         [
             {"when": "12h ago", "text": "'Cathedral in July' — split verified 60/40 Ellis/Reyes", "kind": "split"},
             {"when": "2d ago", "text": "'Say Less' — copyright certificate issued", "kind": "copyright"},
             {"when": "3d ago", "text": "'Half-Light Room' — publisher inquiry (Kobalt)", "kind": "inquiry"},
         ],
         [{"label": "Songs Registered", "value": "13/30"},
          {"label": "Publishing Ready", "value": "6"},
          {"label": "Splits Pending", "value": "2"},
          {"label": "Inquiries", "value": "1 new"}],
         "INHEIRA"),
    _hub("COHEIR", "COHEIR™",
         "2 mentor sessions this week · 3 industry recommendations waiting",
         [
             {"when": "1h ago", "text": "Prof. Bloom left feedback on 'The First Eight'", "kind": "feedback"},
             {"when": "yesterday", "text": "Recommendation letter drafted · A&R placement", "kind": "letter"},
             {"when": "2d ago", "text": "Booked office hours Thu 17:00", "kind": "booking"},
         ],
         [{"label": "Active Mentors", "value": "2"},
          {"label": "Office Hours", "value": "Thu · Sat"},
          {"label": "Feedback Waiting", "value": "1"},
          {"label": "Recommendations", "value": "3"}],
         "COHEIR"),
    _hub("Vaulta", "Vaulta™",
         "1st royalty payout received · 3 budget assignments open",
         [
             {"when": "5d ago", "text": "ANCRWAV™ royalty · $214.30 · streaming Q4", "kind": "royalty"},
             {"when": "1w ago", "text": "Publishing advance modeled · $12k scenario", "kind": "model"},
             {"when": "2w ago", "text": "Producer credit · Noah King contract signed", "kind": "contract"},
         ],
         [{"label": "YTD Royalties", "value": "$1,204"},
          {"label": "Open Budgets", "value": "3"},
          {"label": "Financial Score", "value": "72"},
          {"label": "Assignments", "value": "3"}],
         "Vaulta"),
    _hub("ANCRLaunch", "ANCRLaunch™",
         "Graduation readiness 74% · 2 employer viewings this week",
         [
             {"when": "8h ago", "text": "Sony Publishing viewed your ANCRID™ profile", "kind": "view"},
             {"when": "2d ago", "text": "Resume auto-updated with 'Cathedral in July' release", "kind": "resume"},
             {"when": "5d ago", "text": "Career readiness assessment · 74%", "kind": "assessment"},
         ],
         [{"label": "Grad Readiness", "value": "74%"},
          {"label": "Employer Views", "value": "12"},
          {"label": "Portfolio Score", "value": "87"},
          {"label": "Opportunities", "value": "4"}],
         "ANCRLaunch"),
    _hub("ANCRID", "ANCRID™",
         "Identity verified · Booking Packet™ ready to send",
         [
             {"when": "3h ago", "text": "Portfolio score increased +2 to 87", "kind": "score"},
             {"when": "1d ago", "text": "Creator Mobility™ · US, EU, UK cleared", "kind": "mobility"},
             {"when": "3d ago", "text": "Professional Booking Packet™ v2 finalized", "kind": "packet"},
         ],
         [{"label": "Portfolio Score", "value": "87"},
          {"label": "Skills Verified", "value": "24"},
          {"label": "Booking Packet", "value": "v2"},
          {"label": "Creator Mobility", "value": "US · EU · UK"}],
         "ANCRID"),
    _hub("ANCRVIEW", "ANCRVIEW™",
         "6 masterclasses watched · 3 recommended for you",
         [
             {"when": "2d ago", "text": "Watched · Sylvia Massy on sonic risk", "kind": "watch"},
             {"when": "4d ago", "text": "New showcase · Cohort 07 mid-term panels", "kind": "showcase"},
             {"when": "6d ago", "text": "Live stream · A&R Panel Session (recorded)", "kind": "live"},
         ],
         [{"label": "Watched", "value": "6"},
          {"label": "Recommended", "value": "3 new"},
          {"label": "Live Sessions", "value": "2 upcoming"},
          {"label": "Watchtime", "value": "8h · mo"}],
         "ANCRVIEW"),
    _hub("ANCRWAV", "ANCRWAV™",
         "6 releases · streaming across major DSPs",
         [
             {"when": "1d ago", "text": "'Cathedral in July' · 2,412 streams this week", "kind": "stream"},
             {"when": "1w ago", "text": "Playlist · 'Emerging CCDP' added 'Say Less'", "kind": "playlist"},
             {"when": "2w ago", "text": "'Blue Hour' released to Spotify + Apple Music", "kind": "release"},
         ],
         [{"label": "Releases", "value": "6"},
          {"label": "Monthly Listeners", "value": "3,241"},
          {"label": "Playlists", "value": "8"},
          {"label": "YTD Streams", "value": "48.2k"}],
         "ANCRWAV"),
]


# ------------------------------------------------------------
# Public API
# ------------------------------------------------------------
def build_seed():
    return {
        "students": _STUDENTS,
        "faculty": _FACULTY,
        "experiences": _EXPERIENCES,
        "lessons": _LESSONS,
        "journeys": _JOURNEYS,
        "assignments": _ASSIGNMENTS,
        "capstones": _CAPSTONES,
        "portfolio_items": _PORTFOLIO,
        "songs": _build_songs(),
        "calendar": _cal(),
        "sessions": _SESSIONS,
        "teams": _TEAMS,
        "messages": _MESSAGES,
        "achievements": _ACHIEVEMENTS,
        "cohorts": _COHORTS,
        "reviews": _REVIEWS,
        "hubs": _HUBS,
    }
