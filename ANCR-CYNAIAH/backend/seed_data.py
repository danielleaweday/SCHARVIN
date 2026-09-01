"""Idempotent demo seed for CYNAIAH — rich, alive, testable."""
from __future__ import annotations

import math
import random
from typing import Any

from auth import hash_password
from models import _now_iso, _uid


DEMO_STUDENT_EMAIL = "student@cynaiah.demo"
DEMO_STUDENT_PASSWORD = "Cynaiah2026!"
DEMO_FACULTY_EMAIL = "faculty@cynaiah.demo"
DEMO_FACULTY_PASSWORD = "Cynaiah2026!"
DEMO_ADMIN_EMAIL = "admin@cynaiah.demo"
DEMO_ADMIN_PASSWORD = "Cynaiah2026!"


IMG = {
    "hero_cinematic": "https://images.pexels.com/photos/10395639/pexels-photo-10395639.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "music_video_sync": "https://images.unsplash.com/photo-1506512420485-a28339abb3b9?crop=entropy&cs=srgb&fm=jpg&w=940&q=80",
    "ai_visual_lab": "https://images.unsplash.com/photo-1614471131724-d57b15e45173?crop=entropy&cs=srgb&fm=jpg&w=940&q=80",
    "cgi_environment": "https://images.unsplash.com/photo-1519608487953-e999c86e7455?crop=entropy&cs=srgb&fm=jpg&w=940&q=80",
    "character_portrait": "https://images.unsplash.com/photo-1568038479111-87bf80659645?crop=entropy&cs=srgb&fm=jpg&w=940&q=80",
    "storyboard_mood": "https://images.unsplash.com/photo-1607276159787-9ef4db5c0d0b?crop=entropy&cs=srgb&fm=jpg&w=940&q=80",
    "commercial": "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?crop=entropy&cs=srgb&fm=jpg&w=940&q=80",
    "documentary": "https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?crop=entropy&cs=srgb&fm=jpg&w=940&q=80",
    "animation": "https://images.unsplash.com/photo-1633613286848-e6f43bbafb8d?crop=entropy&cs=srgb&fm=jpg&w=940&q=80",
    "concert_visuals": "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?crop=entropy&cs=srgb&fm=jpg&w=940&q=80",
    "faculty_avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
    "student_avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    # Storyboard frame refs — cinematic stills
    "sb_rain_alley": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=940",
    "sb_neon_singer": "https://images.unsplash.com/photo-1571266028243-e1f6cbf3edf0?w=940",
    "sb_subway": "https://images.unsplash.com/photo-1519638399535-1b036603ac77?w=940",
    "sb_rooftop": "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=940",
    "sb_close_face": "https://images.unsplash.com/photo-1596079890744-c1a0462d0975?w=940",
    "sb_hands_tape": "https://images.unsplash.com/photo-1519925610903-381054cc2a1c?w=940",
    "sb_boat_dawn": "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=940",
    "sb_fisherman": "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=940",
    "sb_horizon": "https://images.unsplash.com/photo-1439405326854-014607f694d7?w=940",
    "sb_dock": "https://images.unsplash.com/photo-1508615070457-7baeba4003ab?w=940",
    "mood_arcology": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=940",
    "mood_fog": "https://images.unsplash.com/photo-1544819679-57b3b6f2c88b?w=940",
    "mood_vinyl": "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=940",
    "mood_editorial": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=940",
    "mood_watercolor": "https://images.unsplash.com/photo-1517816428104-797678c7cf0d?w=940",
    "mood_lantern": "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=940",
}


def _waveform(seconds: float = 180.0, samples: int = 240) -> list[float]:
    random.seed(int(seconds))
    return [
        round(
            (0.35 + 0.5 * abs(math.sin(i / 8.0)) + 0.15 * random.random()) * 0.9,
            3,
        )
        for i in range(samples)
    ]


async def ensure_seed(db) -> dict:
    """Populate demo data if missing. Idempotent."""
    existing = await db.users.find_one({"email": DEMO_STUDENT_EMAIL})
    if existing:
        # Additive top-ups for later features (safe to re-run).
        await _ensure_faculty_reviews_seed(db, existing["id"])
        await _ensure_admin_user(db)
        return {"status": "already_seeded", "student_id": existing["id"]}

    now = _now_iso()

    # ---- Users ----
    student = {
        "id": "demo-student-001",
        "email": DEMO_STUDENT_EMAIL,
        "password_hash": hash_password(DEMO_STUDENT_PASSWORD),
        "name": "Aria Okafor",
        "role": "student",
        "avatar_url": IMG["student_avatar"],
        "bio": "Music-video director & emerging-media artist. Focused on AI-assisted cinematography.",
        "program": "BFA in Visual Storytelling & Emerging Media",
        "focus_areas": ["Music Video Direction", "AI Visual Media", "CGI Environments"],
        "created_at": now,
    }
    faculty = {
        "id": "demo-faculty-001",
        "email": DEMO_FACULTY_EMAIL,
        "password_hash": hash_password(DEMO_FACULTY_PASSWORD),
        "name": "Prof. Idris Bello",
        "role": "faculty",
        "avatar_url": IMG["faculty_avatar"],
        "bio": "Cinematographer, mentor, and CYNAIAH faculty lead for Music-Video Direction.",
        "program": "Faculty",
        "focus_areas": ["Cinematography", "Directing"],
        "created_at": now,
    }
    await db.users.insert_many([student, faculty])
    sid = student["id"]

    # ---- Projects ----
    projects = [
        {
            "id": "proj-mv-neon-heart",
            "owner_id": sid,
            "owner_name": student["name"],
            "title": "Neon Heart",
            "type": "music_video",
            "objective": "A neon-lit music video exploring longing and city solitude.",
            "audience": "18-34, global streaming audience",
            "format": "16:9 / Vertical companion cut",
            "visual_style": "Cyberpunk noir, wet streets, magenta + cyan neons",
            "music_selection": "Original song by ANCRLAB collaborator Nova K.",
            "story_concept": "A lone singer wanders a rain-slick city searching for a lost love.",
            "production_approach": "Hybrid: practical location + AI-generated inserts",
            "ai_workflow": "hybrid",
            "budget": 4800.0,
            "timeline": "6 weeks",
            "disclosure_notes": "AI used for background plates and mood boards only.",
            "thumbnail_url": IMG["music_video_sync"],
            "status": "production",
            "progress": 62,
            "collaborators": ["Nova K. (Artist)", "Sam L. (DP)", "Prof. Idris Bello", "Kai R. (Producer)"],
            "tags": ["music-video", "neon", "cyberpunk"],
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": "proj-short-blue-hour",
            "owner_id": sid,
            "owner_name": student["name"],
            "title": "The Blue Hour",
            "type": "short_film",
            "objective": "A 10-minute short about a fisherman's last morning.",
            "audience": "Festival circuit",
            "format": "2.39:1 anamorphic",
            "visual_style": "Naturalistic, cool blues, long lenses",
            "music_selection": "Original score commission",
            "story_concept": "An aging fisherman confronts change on his final day at sea.",
            "production_approach": "Traditional location shoot",
            "ai_workflow": "traditional",
            "budget": 12000.0,
            "timeline": "3 months",
            "disclosure_notes": "No AI-generated final footage. AI used for previz only.",
            "thumbnail_url": IMG["hero_cinematic"],
            "status": "preproduction",
            "progress": 28,
            "collaborators": ["Prof. Idris Bello", "Kai R. (Producer)", "Yuki S. (1st AD)"],
            "tags": ["short-film", "drama", "festival"],
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": "proj-cgi-atlas-city",
            "owner_id": sid,
            "owner_name": student["name"],
            "title": "Atlas City",
            "type": "cgi_scene",
            "objective": "Concept a CGI environment for a virtual production stage.",
            "audience": "Industry portfolio",
            "format": "Real-time engine",
            "visual_style": "Vertical arcology, gold light, volumetric fog",
            "music_selection": "Ambient bed",
            "story_concept": "An overgrown mega-city at civilizational dusk.",
            "production_approach": "AI-assisted concept + Unreal virtual set",
            "ai_workflow": "ai_assisted",
            "budget": 2200.0,
            "timeline": "4 weeks",
            "disclosure_notes": "All environments AI-generated as concept art.",
            "thumbnail_url": IMG["cgi_environment"],
            "status": "concept",
            "progress": 14,
            "collaborators": ["Solo"],
            "tags": ["cgi", "worldbuilding", "virtual-production"],
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": "proj-doc-ancestor-voices",
            "owner_id": sid,
            "owner_name": student["name"],
            "title": "Ancestor Voices",
            "type": "documentary",
            "objective": "Portrait of three West-African vinyl-record archivists.",
            "audience": "Streaming platforms, cultural institutions",
            "format": "16:9 documentary",
            "visual_style": "Warm, archival, hand-held with tripod interviews",
            "music_selection": "Licensed archive recordings",
            "story_concept": "Music as memory, protest, and lineage.",
            "production_approach": "Traditional documentary",
            "ai_workflow": "traditional",
            "budget": 9500.0,
            "timeline": "5 months",
            "disclosure_notes": "AI transcription only. No AI-generated media.",
            "thumbnail_url": IMG["documentary"],
            "status": "post_production",
            "progress": 78,
            "collaborators": ["Ada M. (Editor)", "Prof. Idris Bello", "Kwame T. (Sound)"],
            "tags": ["documentary", "culture", "music"],
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": "proj-ad-heirwear",
            "owner_id": sid,
            "owner_name": student["name"],
            "title": "HEIRWEAR — Autumn Campaign",
            "type": "commercial",
            "objective": "60-second brand film for an emerging fashion label.",
            "audience": "18-30, style-conscious",
            "format": "16:9 hero + 9:16 social cutdowns",
            "visual_style": "Editorial fashion, warm oranges, gold rim light",
            "music_selection": "Licensed indie track",
            "story_concept": "Craftsmanship as inheritance.",
            "production_approach": "Studio + location, one shoot day",
            "ai_workflow": "hybrid",
            "budget": 6800.0,
            "timeline": "3 weeks",
            "disclosure_notes": "AI used for previz storyboards; no AI-generated final footage.",
            "thumbnail_url": IMG["commercial"],
            "status": "review",
            "progress": 91,
            "collaborators": ["Chi E. (Stylist)", "Kai R. (Producer)", "HEIRWEAR Studio"],
            "tags": ["commercial", "fashion", "brand"],
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": "proj-anim-lantern-lake",
            "owner_id": sid,
            "owner_name": student["name"],
            "title": "Lantern Lake",
            "type": "animation",
            "objective": "2D animated short for children about courage.",
            "audience": "Family",
            "format": "16:9 2D animation",
            "visual_style": "Watercolor, warm-cool contrast",
            "music_selection": "Original score",
            "story_concept": "A shy child lights a lantern for the lake spirits.",
            "production_approach": "Traditional 2D pipeline",
            "ai_workflow": "hybrid",
            "budget": 5400.0,
            "timeline": "10 weeks",
            "disclosure_notes": "AI used for background pre-paints.",
            "thumbnail_url": IMG["animation"],
            "status": "production",
            "progress": 45,
            "collaborators": ["Yuki S. (Animator)", "Mei H. (BG Painter)"],
            "tags": ["animation", "2d", "family"],
            "created_at": now,
            "updated_at": now,
        },
    ]
    await db.projects.insert_many(projects)

    # ---- Rights records (Neon Heart + HEIRWEAR + Ancestor Voices) ----
    rights = []
    for i, (pid, name, role, otype, ai_disc, lic) in enumerate(
        [
            ("proj-mv-neon-heart", "Aria Okafor", "Director", "owner", None, "Chain of title on file."),
            ("proj-mv-neon-heart", "Nova K.", "Recording Artist", "licensor", None, "Master use license, ANCRLAB."),
            ("proj-mv-neon-heart", "Sam L.", "Director of Photography", "contributor", None, "Work-for-hire agreement."),
            ("proj-mv-neon-heart", "Gemini Nano Banana", "AI Visual Tool", "ai_tool", "Background plates generated via text-to-image AI.", "AI-tool disclosure logged."),
            ("proj-mv-neon-heart", "Claude Sonnet 4.5", "AI Writing Assistant", "ai_tool", "Treatment refined with AI script assistance.", "AI-tool disclosure logged."),
            ("proj-ad-heirwear", "HEIRWEAR Studio", "Brand", "licensor", None, "MSA on file; commercial use granted."),
            ("proj-ad-heirwear", "Aria Okafor", "Director", "owner", None, "Chain of title on file."),
            ("proj-doc-ancestor-voices", "Ada M.", "Editor", "contributor", None, "Work-for-hire agreement."),
            ("proj-doc-ancestor-voices", "Kwame T.", "Sound Designer", "contributor", None, "Work-for-hire agreement."),
        ]
    ):
        rights.append(
            {
                "id": f"rt-{i}",
                "project_id": pid,
                "contributor_name": name,
                "role": role,
                "ownership_type": otype,
                "ai_disclosure": ai_disc,
                "consent_recorded": True,
                "licensing_notes": lic,
                "commercial_use": True,
                "created_at": now,
            }
        )
    await db.rights_records.insert_many(rights)

    # ---- Music track + Sync cues ----
    music = {
        "id": "music-neon-heart",
        "project_id": "proj-mv-neon-heart",
        "title": "Neon Heart",
        "artist": "Nova K.",
        "duration_seconds": 198.0,
        "ownership": "original",
        "composers": ["Nova K.", "Aria Okafor"],
        "publishers": ["ANCRLAB Publishing"],
        "waveform": _waveform(198.0, 260),
        "music_url": None,  # student uploads or links from ANCRLAB via Sync Studio
        "created_at": now,
    }
    await db.music_tracks.insert_one(music)

    # ---- Assets (mood board + storyboard refs) ----
    assets = [
        # Neon Heart mood board
        ("asset-nh-1", "proj-mv-neon-heart", "Neon reference — alley", IMG["cgi_environment"], "library", ["mood-board"]),
        ("asset-nh-2", "proj-mv-neon-heart", "Character key — Nova", IMG["character_portrait"], "library", ["mood-board", "character"]),
        ("asset-nh-3", "proj-mv-neon-heart", "Concert visuals ref", IMG["concert_visuals"], "library", ["mood-board"]),
        ("asset-nh-4", "proj-mv-neon-heart", "Storyboard mood", IMG["storyboard_mood"], "library", ["mood-board"]),
        ("asset-nh-5", "proj-mv-neon-heart", "Rain-slick alley plate", IMG["sb_rain_alley"], "library", ["mood-board", "location"]),
        ("asset-nh-6", "proj-mv-neon-heart", "Neon singer reference", IMG["sb_neon_singer"], "library", ["mood-board"]),
        ("asset-nh-7", "proj-mv-neon-heart", "Subway car ref", IMG["sb_subway"], "library", ["mood-board", "location"]),
        ("asset-nh-8", "proj-mv-neon-heart", "Rooftop wide", IMG["sb_rooftop"], "library", ["mood-board", "location"]),
        # Blue Hour mood board
        ("asset-bh-1", "proj-short-blue-hour", "Boat at dawn ref", IMG["sb_boat_dawn"], "library", ["mood-board"]),
        ("asset-bh-2", "proj-short-blue-hour", "Fisherman portrait ref", IMG["sb_fisherman"], "library", ["mood-board", "character"]),
        ("asset-bh-3", "proj-short-blue-hour", "Horizon line", IMG["sb_horizon"], "library", ["mood-board"]),
        ("asset-bh-4", "proj-short-blue-hour", "Dock ref", IMG["sb_dock"], "library", ["mood-board", "location"]),
        # Atlas City mood board
        ("asset-ac-1", "proj-cgi-atlas-city", "Arcology reference", IMG["mood_arcology"], "library", ["mood-board"]),
        ("asset-ac-2", "proj-cgi-atlas-city", "Volumetric fog", IMG["mood_fog"], "library", ["mood-board"]),
        # Ancestor Voices
        ("asset-av-1", "proj-doc-ancestor-voices", "Vinyl archive", IMG["mood_vinyl"], "library", ["mood-board"]),
        # HEIRWEAR
        ("asset-hw-1", "proj-ad-heirwear", "Editorial ref", IMG["mood_editorial"], "library", ["mood-board"]),
        # Lantern Lake
        ("asset-ll-1", "proj-anim-lantern-lake", "Watercolor palette", IMG["mood_watercolor"], "library", ["mood-board"]),
        ("asset-ll-2", "proj-anim-lantern-lake", "Lantern ref", IMG["mood_lantern"], "library", ["mood-board"]),
    ]
    await db.assets.insert_many(
        [
            {
                "id": aid,
                "project_id": pid,
                "owner_id": sid,
                "name": name,
                "type": "image",
                "url": url,
                "source": source,
                "prompt": None,
                "provider": None,
                "tags": tags,
                "created_at": now,
            }
            for aid, pid, name, url, source, tags in assets
        ]
    )

    # ---- Sync cues with visual attachments ----
    cues_seed = [
        (0.0, "Intro — rain on empty street", "scene", "asset-nh-5", IMG["sb_rain_alley"]),
        (8.4, "First lyric — 'the city knows my name'", "lyric", "asset-nh-2", IMG["character_portrait"]),
        (16.2, "Cut to close-up under signage", "cut", "asset-nh-6", IMG["sb_neon_singer"]),
        (32.8, "Beat drop — neon flare", "beat", "asset-nh-1", IMG["cgi_environment"]),
        (48.0, "Emotional turn — memory flash", "emotion", None, None),
        (64.5, "Chorus — wide shot rooftop", "scene", "asset-nh-8", IMG["sb_rooftop"]),
        (96.0, "Bridge transition — jump cut", "transition", None, None),
        (128.0, "Second chorus — subway", "scene", "asset-nh-7", IMG["sb_subway"]),
        (160.0, "Outro — lantern lights", "emotion", "asset-nh-4", IMG["storyboard_mood"]),
    ]
    await db.sync_cues.insert_many(
        [
            {
                "id": f"cue-{i}",
                "project_id": "proj-mv-neon-heart",
                "timestamp": t,
                "label": l,
                "type": tp,
                "notes": None,
                "asset_id": aid,
                "asset_url": aurl,
            }
            for i, (t, l, tp, aid, aurl) in enumerate(cues_seed)
        ]
    )

    # ---- Storyboard frames ----
    frames_seed = [
        # Neon Heart storyboard
        ("proj-mv-neon-heart", 0, IMG["sb_rain_alley"], "OPEN — Rain slicks the empty avenue.", "EWS"),
        ("proj-mv-neon-heart", 1, IMG["sb_neon_singer"], "Nova walks past a shuttered noodle bar.", "WS"),
        ("proj-mv-neon-heart", 2, IMG["character_portrait"], "Close on Nova — she looks up.", "CU"),
        ("proj-mv-neon-heart", 3, IMG["cgi_environment"], "Beat drop — neon flare washes the alley.", "MS"),
        ("proj-mv-neon-heart", 4, IMG["sb_subway"], "Subway car — she catches her reflection.", "MCU"),
        ("proj-mv-neon-heart", 5, IMG["sb_rooftop"], "Rooftop chorus — city breathes below.", "EWS"),
        ("proj-mv-neon-heart", 6, IMG["storyboard_mood"], "Outro — lantern lights dim to gold.", "MS"),
        # Blue Hour storyboard
        ("proj-short-blue-hour", 0, IMG["sb_boat_dawn"], "Boat pushes off before sunrise.", "WS"),
        ("proj-short-blue-hour", 1, IMG["sb_fisherman"], "Fisherman's weathered hands on the wheel.", "insert"),
        ("proj-short-blue-hour", 2, IMG["sb_horizon"], "Horizon line — the sea is quiet.", "EWS"),
        ("proj-short-blue-hour", 3, IMG["sb_dock"], "Return to dock — daughter watches.", "MS"),
    ]
    await db.storyboard_frames.insert_many(
        [
            {
                "id": f"frame-{pid}-{order}",
                "project_id": pid,
                "owner_id": sid,
                "order": order,
                "image_url": url,
                "caption": caption,
                "shot_type": shot,
                "notes": None,
                "source": "library",
                "prompt": None,
                "provider": None,
                "created_at": now,
            }
            for pid, order, url, caption, shot in frames_seed
        ]
    )

    # ---- Character reference profiles ----
    characters = [
        {
            "id": "char-nova-k",
            "project_id": "proj-mv-neon-heart",
            "owner_id": sid,
            "name": "Nova K.",
            "role_in_story": "Protagonist — singer wandering the city",
            "description": "Introspective, guarded, poetic. Reads as a young artist who left home too fast.",
            "age": "mid-20s",
            "gender": "Female",
            "hair": "Shoulder-length dark hair with soft waves and a subtle magenta rinse",
            "skin_tone": "Warm brown",
            "eye_color": "Deep brown",
            "wardrobe": "Wine-red belted trench coat, cream turtleneck, dark jeans, worn leather ankle boots",
            "visual_style": "Neon-noir; wet-street reflections; anamorphic close-ups; magenta + cyan key light",
            "locked_details": "Small silver hoop earrings; a vintage tape recorder always in her left coat pocket",
            "reference_image_urls": [
                IMG["character_portrait"],
                IMG["sb_neon_singer"],
            ],
            "notes": "Never appears smiling openly. Always framed with negative space above her head.",
            "created_at": now,
        },
        {
            "id": "char-samson",
            "project_id": "proj-short-blue-hour",
            "owner_id": sid,
            "name": "Samson",
            "role_in_story": "Retiring fisherman",
            "description": "Grizzled, quiet, hands like weathered rope. A man who has already made his peace.",
            "age": "68",
            "gender": "Male",
            "hair": "Short, iron-grey, sun-thinned on top",
            "skin_tone": "Deep brown, sun-worn",
            "eye_color": "Warm brown",
            "wardrobe": "Faded blue fisherman's jacket, canvas trousers, well-oiled rubber boots",
            "visual_style": "Naturalistic dawn light, 2.39:1 anamorphic, cool blues into warm gold",
            "locked_details": "Wooden compass on a leather cord around his neck; small scar over his left eyebrow",
            "reference_image_urls": [IMG["sb_fisherman"]],
            "notes": "Never speaks unnecessarily. Framing favors his hands and the horizon.",
            "created_at": now,
        },
    ]
    await db.characters.insert_many(characters)

    # ---- Production Studio (Neon Heart) ----
    await db.prod_crew.insert_many(
        [
            {"id": _uid(), "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "name": "Aria Okafor", "role": "Director", "department": "Direction", "email": DEMO_STUDENT_EMAIL, "phone": None, "call_time": "18:00", "notes": "Lead — call from base camp."},
            {"id": _uid(), "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "name": "Sam L.", "role": "Director of Photography", "department": "Camera", "email": "sam.l@studio.demo", "phone": None, "call_time": "17:30", "notes": "Bring anamorphic set."},
            {"id": _uid(), "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "name": "Kai R.", "role": "Producer", "department": "Production", "email": "kai.r@studio.demo", "phone": None, "call_time": "17:00", "notes": None},
            {"id": _uid(), "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "name": "Nova K.", "role": "Recording Artist / Talent", "department": "Talent", "email": None, "phone": None, "call_time": "18:30", "notes": "Wardrobe: wine-red trench."},
            {"id": _uid(), "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "name": "Chi E.", "role": "Stylist", "department": "Wardrobe", "email": None, "phone": None, "call_time": "17:30", "notes": None},
            {"id": _uid(), "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "name": "Mo T.", "role": "Gaffer", "department": "Lighting", "email": None, "phone": None, "call_time": "17:00", "notes": None},
            {"id": _uid(), "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "name": "Ada M.", "role": "Editor", "department": "Post", "email": None, "phone": None, "call_time": None, "notes": "Not on set — for post pull only."},
        ]
    )
    await db.prod_locations.insert_many(
        [
            {"id": _uid(), "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "name": "Old Chinatown Alley", "address": "Corner of Elm & 3rd", "hours": "20:00 – 05:00", "release_status": "signed", "notes": "Sprinklers available. Neon signage practical."},
            {"id": _uid(), "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "name": "Line 4 Subway Car (decommissioned)", "address": "Rail-Yard Studio B", "hours": "09:00 – 22:00", "release_status": "pending", "notes": "Booked via Rail-Yard. Signed release pending."},
            {"id": _uid(), "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "name": "Empire Rooftop", "address": "24th & Grand, roof access", "hours": "17:00 – 23:00", "release_status": "signed", "notes": "Rain machine footprint OK; safety line required."},
        ]
    )
    await db.prod_equipment.insert_many(
        [
            {"id": _uid(), "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "name": "ARRI Alexa Mini LF", "category": "Camera", "quantity": 1, "vendor": "Panavision Rentals", "day_rate": 950, "notes": "3-day rental."},
            {"id": _uid(), "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "name": "Cooke Anamorphic /i set", "category": "Lenses", "quantity": 1, "vendor": "Panavision Rentals", "day_rate": 620, "notes": "32/40/50/75/100."},
            {"id": _uid(), "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "name": "Rain machine", "category": "SFX", "quantity": 1, "vendor": "Effekt House", "day_rate": 400, "notes": "One night, alley + rooftop."},
            {"id": _uid(), "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "name": "Aputure 600d Pro (x4)", "category": "Lighting", "quantity": 4, "vendor": "In-house", "day_rate": 0, "notes": "Owned."},
        ]
    )
    scene_ids = [_uid() for _ in range(3)]
    await db.prod_scenes.insert_many(
        [
            {"id": scene_ids[0], "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "number": "1", "title": "Alley — Intro", "location": "Old Chinatown Alley", "description": "Rain-slick avenue; Nova walks past shuttered noodle bar.", "status": "prepped"},
            {"id": scene_ids[1], "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "number": "2", "title": "Subway — Memory", "location": "Line 4 Subway Car", "description": "Nova sees her reflection.", "status": "planned"},
            {"id": scene_ids[2], "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "number": "3", "title": "Rooftop — Chorus", "location": "Empire Rooftop", "description": "Wide chorus. City breathes below.", "status": "planned"},
        ]
    )
    await db.prod_shots.insert_many(
        [
            {"id": _uid(), "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "scene_id": scene_ids[0], "number": "1A", "shot_size": "EWS", "camera_move": "dolly-in", "description": "Empty avenue, rain, neon flicker", "status": "shot"},
            {"id": _uid(), "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "scene_id": scene_ids[0], "number": "1B", "shot_size": "WS", "camera_move": "handheld", "description": "Nova walks past shuttered noodle bar", "status": "shot"},
            {"id": _uid(), "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "scene_id": scene_ids[0], "number": "1C", "shot_size": "CU", "camera_move": "locked", "description": "Tape recorder in pocket", "status": "scheduled"},
            {"id": _uid(), "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "scene_id": scene_ids[1], "number": "2A", "shot_size": "MCU", "camera_move": "steadicam", "description": "Subway car — reflection", "status": "planned"},
            {"id": _uid(), "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "scene_id": scene_ids[2], "number": "3A", "shot_size": "EWS", "camera_move": "drone", "description": "Rooftop chorus wide", "status": "planned"},
            {"id": _uid(), "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "scene_id": scene_ids[2], "number": "3B", "shot_size": "CU", "camera_move": "locked", "description": "Nova to camera — final verse", "status": "planned"},
        ]
    )
    await db.prod_callsheets.insert_many(
        [
            {"id": _uid(), "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "date": "2026-02-14", "location": "Old Chinatown Alley", "call_time": "17:00", "weather": "Light rain (natural + machine)", "sunrise": "07:14", "sunset": "17:52", "notes": "Bring reflective vests. Safety brief at 17:15."},
            {"id": _uid(), "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "date": "2026-02-15", "location": "Empire Rooftop", "call_time": "16:30", "weather": "Clear, 8°C", "sunrise": "07:12", "sunset": "17:54", "notes": "Rooftop safety line required."},
        ]
    )
    await db.prod_budget.insert_many(
        [
            {"id": _uid(), "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "line": "Camera package (3 days)", "category": "Equipment", "amount": 2850, "spent": 2850, "vendor": "Panavision Rentals"},
            {"id": _uid(), "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "line": "Anamorphic lens set (3 days)", "category": "Equipment", "amount": 1860, "spent": 1860, "vendor": "Panavision Rentals"},
            {"id": _uid(), "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "line": "Rain machine + operator (1 night)", "category": "SFX", "amount": 400, "spent": 400, "vendor": "Effekt House"},
            {"id": _uid(), "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "line": "Location fees", "category": "Locations", "amount": 900, "spent": 600, "vendor": "Rail-Yard + rooftop"},
            {"id": _uid(), "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "line": "Wardrobe + styling", "category": "Wardrobe", "amount": 480, "spent": 240, "vendor": "Chi E."},
            {"id": _uid(), "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "line": "Catering (2 shoot days)", "category": "Craft", "amount": 320, "spent": 0, "vendor": None},
        ]
    )
    await db.prod_notes.insert_many(
        [
            {"id": _uid(), "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "date": "2026-02-14", "author": "Aria Okafor", "message": "Night 1 wrapped. Alley plates locked. Nova's coat needed rewax after rain machine — Chi handled on-set."},
            {"id": _uid(), "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "date": "2026-02-14", "author": "Sam L.", "message": "50mm anamorphic breathes on rack focus; keep pulls short. Great chromatic aberration at wide-open."},
        ]
    )
    await db.prod_releases.insert_many(
        [
            {"id": _uid(), "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "party": "Old Chinatown Alley — landlord", "kind": "location", "status": "signed", "notes": "Signed 2026-01-28."},
            {"id": _uid(), "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "party": "Rail-Yard Studio B", "kind": "location", "status": "pending", "notes": "Awaiting insurance rider."},
            {"id": _uid(), "project_id": "proj-mv-neon-heart", "owner_id": sid, "created_at": now, "party": "Nova K.", "kind": "talent", "status": "signed", "notes": "Recording + likeness release."},
        ]
    )

    # ---- Scripts (treatments + logline + shotlist) ----
    scripts = [
        {
            "id": "script-neon-heart-treatment",
            "project_id": "proj-mv-neon-heart",
            "owner_id": sid,
            "title": "Neon Heart — Treatment v2",
            "kind": "treatment",
            "content": (
                "## OPENING IMAGE\n"
                "Rain slicks the empty avenue. A single figure in a wine-red coat walks past a shuttered noodle bar, "
                "magenta and cyan neons bleeding across the puddles.\n\n"
                "## PROTAGONIST\n"
                "NOVA, mid-20s, a singer who left home for the city. She carries a small tape recorder, a keepsake "
                "from her grandmother.\n\n"
                "## WORLD\n"
                "A near-future megalopolis, half analog, half generated. Signage flickers between languages. "
                "Weather is engineered.\n\n"
                "## TENSION\n"
                "Nova is searching for someone she can no longer name. Each street corner triggers a memory rendered "
                "as a lucid AI dream.\n\n"
                "## MOTIFS\n"
                "Reflections, tape hiss, rain, gold light through steam.\n\n"
                "## SONIC PALETTE\n"
                "Analog synths, breathy vocals, a distant subway horn.\n\n"
                "## ARC\n"
                "She stops running. Turns to face the city. Sings the last verse looking straight into the camera "
                "as neon dims to gold."
            ),
            "version": 2,
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": "script-neon-heart-shotlist",
            "project_id": "proj-mv-neon-heart",
            "owner_id": sid,
            "title": "Neon Heart — Shot List v1",
            "kind": "shotlist",
            "content": (
                "#1 | EWS | dolly-in | Empty avenue | rain, neon signage flickers | anamorphic\n"
                "#2 | WS | handheld | Nova walking | past shuttered noodle bar | 35mm\n"
                "#3 | MCU | steadicam | Nova's face | rain drops, tape recorder in pocket | 50mm\n"
                "#4 | CU | locked | Tape recorder | grandmother's initials engraved | 100mm macro\n"
                "#5 | INSERT | locked | Puddle reflection | neon signs blur | wide\n"
                "#6 | MS | crane up | Alleyway | Nova stops, looks up | 35mm\n"
                "#7 | EWS | drone | Rooftop | chorus wide, city breathes below | wide\n"
                "#8 | MCU | steadicam | Subway car | Nova sees her reflection | 50mm\n"
                "#9 | CU | locked | Nova to camera | final verse, gold light | 85mm\n"
            ),
            "version": 1,
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": "script-blue-hour-logline",
            "project_id": "proj-short-blue-hour",
            "owner_id": sid,
            "title": "The Blue Hour — Logline",
            "kind": "logline",
            "content": (
                "On the last morning of a fifty-year career, an aging fisherman must decide whether to teach his "
                "estranged daughter to keep the sea in her blood — or let the tide finally take his family trade "
                "with him."
            ),
            "version": 1,
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": "script-blue-hour-treatment",
            "project_id": "proj-short-blue-hour",
            "owner_id": sid,
            "title": "The Blue Hour — Treatment v1",
            "kind": "treatment",
            "content": (
                "## OPENING IMAGE\n"
                "Cold blue pre-dawn light. A small fishing boat pushes off from a wooden dock, sail canvas snapping.\n\n"
                "## PROTAGONIST\n"
                "SAMSON, 68, a fisherman with hands like weathered rope.\n\n"
                "## WORLD\n"
                "A West-African coastal village where the sea has fed six generations of one family.\n\n"
                "## TENSION\n"
                "Today is Samson's last day out. His daughter AMARA, 34, an accountant in the city, has come home "
                "to convince him to sell the boat.\n\n"
                "## MOTIFS\n"
                "The compass, salt on skin, the horizon.\n\n"
                "## ARC\n"
                "By the time the sun sets, Samson doesn't teach Amara to fish. He teaches her to look at the water "
                "the way he does."
            ),
            "version": 1,
            "created_at": now,
            "updated_at": now,
        },
    ]
    await db.script_documents.insert_many(scripts)

    # ---- Courses & enrollments ----
    courses = [
        {"id": "course-visual-storytelling", "title": "Visual Storytelling Foundations", "category": "Foundations", "description": "The grammar of visual language: framing, blocking, rhythm, and subtext.", "thumbnail_url": IMG["storyboard_mood"], "lessons_count": 14, "duration_hours": 22.0, "level": "Foundations", "instructor": "Prof. Idris Bello"},
        {"id": "course-mv-direction", "title": "Music Video Direction", "category": "Directing", "description": "From concept to release: sync, style, and the artist's world.", "thumbnail_url": IMG["music_video_sync"], "lessons_count": 12, "duration_hours": 18.0, "level": "Intermediate", "instructor": "Prof. Idris Bello"},
        {"id": "course-genai-visual", "title": "Generative AI for Visual Media", "category": "Emerging Media", "description": "Text-to-image, character consistency, disclosure, and ethics.", "thumbnail_url": IMG["ai_visual_lab"], "lessons_count": 10, "duration_hours": 15.0, "level": "Intermediate", "instructor": "Dr. Lin Wu"},
        {"id": "course-cgi-vp", "title": "CGI and Virtual Production", "category": "Production", "description": "Real-time engines, LED walls, and hybrid pipelines.", "thumbnail_url": IMG["cgi_environment"], "lessons_count": 12, "duration_hours": 20.0, "level": "Advanced", "instructor": "Maya Okonkwo"},
        {"id": "course-editing-post", "title": "Editing and Postproduction", "category": "Post", "description": "Cut, color, sound, and the invisible craft of finishing.", "thumbnail_url": IMG["hero_cinematic"], "lessons_count": 14, "duration_hours": 24.0, "level": "Intermediate", "instructor": "Prof. Idris Bello"},
        {"id": "course-rights-ethics", "title": "Entertainment Law, Rights, and AI Ethics", "category": "Rights", "description": "Ownership, licensing, chain of title, consent, and disclosure.", "thumbnail_url": IMG["documentary"], "lessons_count": 8, "duration_hours": 12.0, "level": "Foundations", "instructor": "Adaeze Nwosu, Esq."},
    ]
    await db.courses.insert_many(courses)

    enrollments = [
        {"id": f"enr-{i}", "user_id": sid, "course_id": c["id"], "progress": p, "status": s, "started_at": now}
        for i, (c, p, s) in enumerate(
            [
                (courses[0], 92, "in_progress"),
                (courses[1], 68, "in_progress"),
                (courses[2], 44, "in_progress"),
                (courses[5], 30, "in_progress"),
            ]
        )
    ]
    await db.enrollments.insert_many(enrollments)

    # ---- Feedback ----
    feedback = [
        {"id": "fb-1", "project_id": "proj-mv-neon-heart", "author_name": "Prof. Idris Bello", "author_role": "faculty", "message": "Love the wet-streets palette. Push the chorus wider — let the city breathe.", "created_at": now},
        {"id": "fb-2", "project_id": "proj-ad-heirwear", "author_name": "Kai R.", "author_role": "mentor", "message": "Board is tight. Consider a 6-second vertical cutdown for launch day.", "created_at": now},
        {"id": "fb-3", "project_id": "proj-mv-neon-heart", "author_name": "Nova K.", "author_role": "collaborator", "message": "Bridge feels rushed — can we hold on the rooftop chorus one full 8-count longer?", "created_at": now},
        {"id": "fb-4", "project_id": "proj-short-blue-hour", "author_name": "Prof. Idris Bello", "author_role": "faculty", "message": "Treatment is beautiful. Please attach a shot list before greenlight.", "created_at": now},
        {"id": "fb-5", "project_id": "proj-doc-ancestor-voices", "author_name": "Ada M.", "author_role": "collaborator", "message": "New assembly is at 42 min. I think we can lose the 3rd interviewee's B-story.", "created_at": now},
    ]
    await db.feedback.insert_many(feedback)

    # ---- Notifications ----
    # Static demo notifications for the bell popover. The three notifications
    # that reference specific review events carry the same ANCR-shaped envelope
    # produced by the runtime pipeline, so `every notification with a deep_link
    # resolves via the link registry` holds universally.
    def _rev_note(nid: str, review_id: str, kind: str, project_id: str, project_title: str, message: str, read: bool = False, status_value=None):
        deep_link = f"/reviews?project={project_id}&review={review_id}"
        return {
            "id": nid,
            "user_id": sid,
            "message": message,
            "type": "review",
            "read": read,
            "project_id": project_id,
            "project_title": project_title,
            "review_id": review_id,
            "review_kind": kind,
            "review_status_value": status_value,
            "author_name": "Prof. Idris Bello",
            "deep_link": deep_link,
            "event_type": f"review.{kind}",
            "actor": {"user_id": "demo-faculty-001", "name": "Prof. Idris Bello", "ancrid": None},
            "recipient": {"user_id": sid, "ancrid": None},
            "subject": {"kind": "project", "id": project_id, "title": project_title},
            "payload": {"review_id": review_id, "kind": kind, "status_value": status_value},
            "ancr_ready": True,
            "ancr_emitted_at": None,
            "channels": [
                {"name": "in_app", "status": "delivered", "delivered_at": now, "detail": None},
                {"name": "ancr_bus", "status": "not_configured", "delivered_at": None, "detail": "ANCR_NOTIFICATIONS_ENABLED is false. Envelope kept locally as ANCR-ready."},
            ],
            "created_at": now,
        }

    notes = [
        _rev_note("n-1", "rev-nh-1", "written", "proj-mv-neon-heart", "Neon Heart",
                  "Prof. Idris Bello left you a written note on Neon Heart."),
        {"id": "n-2", "user_id": sid, "message": "Assignment due Friday: Music Video Direction — Cue Sheet.", "type": "assignment", "read": False, "created_at": now},
        {"id": "n-3", "user_id": sid, "message": "Kai R. invited you to collaborate on 'HEIRWEAR — Autumn Campaign'.", "type": "invite", "read": True, "created_at": now},
        {"id": "n-4", "user_id": sid, "message": "Rights checklist incomplete on 'Ancestor Voices'.", "type": "info", "read": False, "created_at": now},
        _rev_note("n-5", "rev-nh-2", "time_coded", "proj-mv-neon-heart", "Neon Heart",
                  "Prof. Idris Bello left a note at 0:42 on Neon Heart."),
        {"id": "n-6", "user_id": sid, "message": "Render queue: 4 AI Visual Lab frames finished.", "type": "render", "read": False, "created_at": now},
        _rev_note("n-7", "rev-nh-5", "status", "proj-mv-neon-heart", "Neon Heart",
                  "Prof. Idris Bello set Neon Heart's status to “revision requested”.",
                  read=True, status_value="revision_requested"),
    ]
    await db.notifications.insert_many(notes)

    # ---- Calendar events ----
    events = [
        {"id": "ev-1", "user_id": sid, "project_id": "proj-mv-neon-heart", "title": "Neon Heart — night shoot", "date": "2026-02-14", "kind": "shoot"},
        {"id": "ev-2", "user_id": sid, "project_id": "proj-ad-heirwear", "title": "HEIRWEAR — client review", "date": "2026-02-18", "kind": "review"},
        {"id": "ev-3", "user_id": sid, "project_id": None, "title": "Music Video Direction — Lecture 07", "date": "2026-02-20", "kind": "class"},
        {"id": "ev-4", "user_id": sid, "project_id": "proj-doc-ancestor-voices", "title": "Final cut lock", "date": "2026-02-27", "kind": "deadline"},
        {"id": "ev-5", "user_id": sid, "project_id": "proj-short-blue-hour", "title": "Blue Hour — location scout (coast)", "date": "2026-03-03", "kind": "shoot"},
        {"id": "ev-6", "user_id": sid, "project_id": "proj-mv-neon-heart", "title": "Neon Heart — rough cut screening", "date": "2026-03-08", "kind": "review"},
        {"id": "ev-7", "user_id": sid, "project_id": None, "title": "Generative AI for Visual Media — Lecture 05", "date": "2026-03-11", "kind": "class"},
    ]
    await db.calendar_events.insert_many(events)

    # ---- Portfolio items ----
    portfolio = [
        {"id": "p-1", "user_id": sid, "project_id": "proj-ad-heirwear", "title": "HEIRWEAR — Autumn", "category": "Commercial", "thumbnail_url": IMG["commercial"], "description": "60-second brand film. Editorial fashion.", "featured": True, "created_at": now},
        {"id": "p-2", "user_id": sid, "project_id": "proj-doc-ancestor-voices", "title": "Ancestor Voices", "category": "Documentary", "thumbnail_url": IMG["documentary"], "description": "Portrait of three vinyl archivists.", "featured": True, "created_at": now},
        {"id": "p-3", "user_id": sid, "project_id": "proj-mv-neon-heart", "title": "Neon Heart (WIP)", "category": "Music Video", "thumbnail_url": IMG["music_video_sync"], "description": "Neon-noir music video for Nova K.", "featured": False, "created_at": now},
    ]
    await db.portfolio.insert_many(portfolio)

    # ---- Faculty ↔ student assignments + immutable feedback log ----
    await _ensure_faculty_reviews_seed(db, sid)
    await _ensure_admin_user(db)

    return {"status": "seeded", "student_id": sid}


async def _ensure_admin_user(db) -> None:
    """Idempotent admin bootstrap — hardened for production.

    Rules
    -----
    - `CYNAIAH_ENV=demo` (default) → seed the demo admin
      `admin@cynaiah.demo / Cynaiah2026!` only if it doesn't already exist.
      A loud WARN is logged so operators know demo credentials are live.
    - `CYNAIAH_ENV=production` → NEVER seed the demo admin. If
      `ADMIN_EMAIL` and `ADMIN_PASSWORD` are both provided via env, seed that
      admin once (idempotent). If the provided password matches the demo
      default, refuse to seed — production must never share the demo secret.
    - This is the ONLY path that creates a platform_admin. Public
      `/api/auth/register` cannot mint elevated roles (verified in
      iteration 7/8 security suite).
    """
    import logging
    import os
    log = logging.getLogger("cynaiah")

    env = (os.environ.get("CYNAIAH_ENV") or "demo").lower()
    admin_email_env = os.environ.get("ADMIN_EMAIL")
    admin_password_env = os.environ.get("ADMIN_PASSWORD")
    admin_name_env = os.environ.get("ADMIN_NAME", "CYNAIAH Admin")

    # Choose which admin credentials to bootstrap, following the mode above.
    if env == "production":
        if not admin_email_env or not admin_password_env:
            log.info(
                "cynaiah.security :: production mode — no ADMIN_EMAIL/ADMIN_PASSWORD "
                "provided, admin bootstrap skipped. Provision a platform_admin via "
                "your ops workflow before public exposure."
            )
            return
        if admin_password_env == DEMO_ADMIN_PASSWORD or admin_email_env == DEMO_ADMIN_EMAIL:
            log.error(
                "cynaiah.security :: refusing to bootstrap admin in production "
                "with the DEMO password/email. Set a strong, unique "
                "ADMIN_EMAIL + ADMIN_PASSWORD via env before deploying."
            )
            return
        target_email = admin_email_env.lower()
        target_password = admin_password_env
        target_name = admin_name_env
    else:
        # Demo mode. Env overrides win if provided; otherwise fall back to the
        # documented demo credentials.
        target_email = (admin_email_env or DEMO_ADMIN_EMAIL).lower()
        target_password = admin_password_env or DEMO_ADMIN_PASSWORD
        target_name = admin_name_env or "CYNAIAH Admin"
        if not admin_email_env and not admin_password_env:
            log.warning(
                "cynaiah.security :: demo mode — seeding admin@cynaiah.demo with "
                "the documented demo password. Do NOT run in this mode publicly. "
                "Set CYNAIAH_ENV=production + ADMIN_EMAIL + ADMIN_PASSWORD for real deployments."
            )

    existing = await db.users.find_one({"email": target_email})
    if existing:
        return
    admin = {
        "id": _uid() if target_email != DEMO_ADMIN_EMAIL else "demo-admin-001",
        "email": target_email,
        "password_hash": hash_password(target_password),
        "name": target_name,
        "role": "platform_admin",
        "avatar_url": IMG["faculty_avatar"],
        "bio": "Platform administrator seat used for security-hardened operations.",
        "program": None,
        "focus_areas": [],
        "created_at": _now_iso(),
    }
    await db.users.insert_one(admin)


async def _ensure_faculty_reviews_seed(db, student_id: str) -> None:
    """Additive, idempotent seed for the Faculty/Reviews layer.

    - Links Prof. Idris Bello to every project owned by the demo student
    - Adds a realistic sample of append-only feedback events on the flagship project (Neon Heart)
    """
    faculty_id = "demo-faculty-001"
    # Assignments — one per project the student owns
    projects = await db.projects.find({"owner_id": student_id}, {"_id": 0}).to_list(200)
    now = _now_iso()
    for p in projects:
        await db.assignments.update_one(
            {"faculty_id": faculty_id, "project_id": p["id"]},
            {
                "$setOnInsert": {
                    "id": f"asg-{p['id']}",
                    "faculty_id": faculty_id,
                    "student_id": student_id,
                    "project_id": p["id"],
                    "note": "Assigned mentor for the CYNAIAH BFA cohort.",
                    "created_at": now,
                }
            },
            upsert=True,
        )

    # Sample immutable feedback on Neon Heart (the flagship music-video project)
    flagship = "proj-mv-neon-heart"
    exists = await db.faculty_reviews.find_one({"project_id": flagship, "kind": "status"})
    if exists:
        return

    sample = [
        {
            "id": "rev-nh-1",
            "project_id": flagship,
            "faculty_id": faculty_id,
            "kind": "written",
            "message": "Strong opening — the neon reflections carry the mood. Push the DP to hold the master a beat longer before cutting to Nova's face; you'll earn the close-up.",
            "timestamp_seconds": None,
            "target_ref": None,
            "target_type": None,
            "rubric_scores": None,
            "status_value": None,
            "supersedes": None,
            "superseded_by": None,
            "created_at": "2026-02-06T14:12:00+00:00",
        },
        {
            "id": "rev-nh-2",
            "project_id": flagship,
            "faculty_id": faculty_id,
            "kind": "time_coded",
            "message": "Cue this transition to the second downbeat — the current cut lands slightly early against the vocal.",
            "timestamp_seconds": 42.0,
            "target_ref": "sync-studio",
            "target_type": "rough_cut",
            "rubric_scores": None,
            "status_value": None,
            "supersedes": None,
            "superseded_by": None,
            "created_at": "2026-02-08T10:30:00+00:00",
        },
        {
            "id": "rev-nh-3",
            "project_id": flagship,
            "faculty_id": faculty_id,
            "kind": "coverage_response",
            "message": "Agree with the coach on the missing insert of the tape recorder — audiences need one clean beat with the object before Scene 2. Not a note, just a nudge.",
            "timestamp_seconds": None,
            "target_ref": "1",
            "target_type": "coverage_scene",
            "rubric_scores": None,
            "status_value": None,
            "supersedes": None,
            "superseded_by": None,
            "created_at": "2026-02-09T09:00:00+00:00",
        },
        {
            "id": "rev-nh-4",
            "project_id": flagship,
            "faculty_id": faculty_id,
            "kind": "rubric",
            "message": "Solid mid-production benchmark. Cinematography leading the pack; sound design still catching up.",
            "timestamp_seconds": None,
            "target_ref": None,
            "target_type": None,
            "rubric_scores": {
                "story": 4,
                "direction": 4,
                "cinematography": 5,
                "sound_music": 3,
                "ai_ethics_rights": 5,
                "craft": 4,
            },
            "status_value": None,
            "supersedes": None,
            "superseded_by": None,
            "created_at": "2026-02-10T16:45:00+00:00",
        },
        {
            "id": "rev-nh-5",
            "project_id": flagship,
            "faculty_id": faculty_id,
            "kind": "status",
            "message": "Ready to lock picture once the tape-recorder insert lands and Scene 2's audio is re-timed.",
            "timestamp_seconds": None,
            "target_ref": None,
            "target_type": None,
            "rubric_scores": None,
            "status_value": "revision_requested",
            "supersedes": None,
            "superseded_by": None,
            "created_at": "2026-02-11T12:00:00+00:00",
        },
    ]
    await db.faculty_reviews.insert_many(sample)
