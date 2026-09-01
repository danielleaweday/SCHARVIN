"""VIEARTA Lifestyle module — nutrition, mindfulness, movement.

Follows the safety and language rules from the product brief:
* educational, not medical
* no shame, no ranking, no competition
* rule-based recommendations only
* replaceable integration layer for future verified food-data provider
"""
from __future__ import annotations

import os
import re
import uuid
import httpx
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal, Dict, Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

# db and auth are imported lazily from server to avoid circular import at import time.
def _new_id() -> str: return str(uuid.uuid4())
def _now() -> str: return datetime.now(timezone.utc).isoformat()
def _today() -> str: return datetime.now(timezone.utc).date().isoformat()


# =============================================================================
# Seed catalogs
# =============================================================================

# ------- Foods (per 100 g / ml unless noted; educational estimates) -----------
FOOD_LIBRARY: List[Dict[str, Any]] = [
    # id, name, category, unit, ref_serving_g, kcal, protein, carbs, fat, fiber
    {"id": "f_oats", "name": "Rolled oats", "category": "grain", "unit": "g", "ref": 40, "kcal": 380, "protein": 13, "carbs": 68, "fat": 6.5, "fiber": 10},
    {"id": "f_eggs", "name": "Egg, whole", "category": "protein", "unit": "each", "ref": 50, "kcal": 143, "protein": 12.6, "carbs": 0.7, "fat": 9.5, "fiber": 0},
    {"id": "f_banana", "name": "Banana", "category": "fruit", "unit": "each", "ref": 120, "kcal": 89, "protein": 1.1, "carbs": 23, "fat": 0.3, "fiber": 2.6},
    {"id": "f_almondbutter", "name": "Almond butter", "category": "fat", "unit": "g", "ref": 15, "kcal": 614, "protein": 21, "carbs": 19, "fat": 55, "fiber": 10},
    {"id": "f_chicken", "name": "Chicken breast, grilled", "category": "protein", "unit": "g", "ref": 120, "kcal": 165, "protein": 31, "carbs": 0, "fat": 3.6, "fiber": 0},
    {"id": "f_rice", "name": "Brown rice, cooked", "category": "grain", "unit": "g", "ref": 150, "kcal": 123, "protein": 2.7, "carbs": 26, "fat": 1, "fiber": 1.8},
    {"id": "f_broccoli", "name": "Broccoli, steamed", "category": "veg", "unit": "g", "ref": 100, "kcal": 55, "protein": 3.7, "carbs": 11, "fat": 0.6, "fiber": 2.6},
    {"id": "f_salmon", "name": "Salmon, baked", "category": "protein", "unit": "g", "ref": 120, "kcal": 208, "protein": 22, "carbs": 0, "fat": 13, "fiber": 0},
    {"id": "f_sweetpotato", "name": "Sweet potato, baked", "category": "veg", "unit": "g", "ref": 150, "kcal": 90, "protein": 2, "carbs": 21, "fat": 0.1, "fiber": 3.3},
    {"id": "f_avocado", "name": "Avocado", "category": "fat", "unit": "g", "ref": 80, "kcal": 160, "protein": 2, "carbs": 9, "fat": 15, "fiber": 7},
    {"id": "f_greekyog", "name": "Greek yogurt, plain", "category": "protein", "unit": "g", "ref": 170, "kcal": 59, "protein": 10, "carbs": 3.6, "fat": 0.4, "fiber": 0},
    {"id": "f_berries", "name": "Mixed berries", "category": "fruit", "unit": "g", "ref": 80, "kcal": 43, "protein": 0.7, "carbs": 10, "fat": 0.3, "fiber": 2.4},
    {"id": "f_toast", "name": "Whole-grain toast", "category": "grain", "unit": "slice", "ref": 40, "kcal": 240, "protein": 11, "carbs": 41, "fat": 3.5, "fiber": 6},
    {"id": "f_peanutb", "name": "Peanut butter", "category": "fat", "unit": "g", "ref": 15, "kcal": 588, "protein": 25, "carbs": 20, "fat": 50, "fiber": 6},
    {"id": "f_tofu", "name": "Tofu, firm", "category": "protein", "unit": "g", "ref": 120, "kcal": 144, "protein": 17, "carbs": 3, "fat": 8, "fiber": 2},
    {"id": "f_lentils", "name": "Lentils, cooked", "category": "protein", "unit": "g", "ref": 150, "kcal": 116, "protein": 9, "carbs": 20, "fat": 0.4, "fiber": 8},
    {"id": "f_apple", "name": "Apple", "category": "fruit", "unit": "each", "ref": 150, "kcal": 52, "protein": 0.3, "carbs": 14, "fat": 0.2, "fiber": 2.4},
    {"id": "f_nuts", "name": "Mixed nuts", "category": "fat", "unit": "g", "ref": 30, "kcal": 607, "protein": 20, "carbs": 21, "fat": 54, "fiber": 7},
    {"id": "f_pasta", "name": "Whole wheat pasta, cooked", "category": "grain", "unit": "g", "ref": 150, "kcal": 124, "protein": 5, "carbs": 25, "fat": 1.1, "fiber": 3.9},
    {"id": "f_cheese", "name": "Cheddar cheese", "category": "protein", "unit": "g", "ref": 30, "kcal": 402, "protein": 25, "carbs": 1.3, "fat": 33, "fiber": 0},
    {"id": "f_smoothie", "name": "Berry protein smoothie", "category": "meal", "unit": "cup", "ref": 300, "kcal": 90, "protein": 8, "carbs": 12, "fat": 1.5, "fiber": 3},
    {"id": "f_stirfry", "name": "Chicken veg stir-fry", "category": "meal", "unit": "bowl", "ref": 400, "kcal": 125, "protein": 12, "carbs": 12, "fat": 3.5, "fiber": 2.5},
    {"id": "f_energybar", "name": "Oat energy bar", "category": "snack", "unit": "each", "ref": 55, "kcal": 380, "protein": 10, "carbs": 55, "fat": 12, "fiber": 5},
    {"id": "f_water", "name": "Water", "category": "beverage", "unit": "ml", "ref": 250, "kcal": 0, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0},
    {"id": "f_tea", "name": "Herbal tea", "category": "beverage", "unit": "cup", "ref": 240, "kcal": 2, "protein": 0, "carbs": 0.5, "fat": 0, "fiber": 0},
    {"id": "f_coffee", "name": "Black coffee", "category": "beverage", "unit": "cup", "ref": 240, "kcal": 2, "protein": 0.3, "carbs": 0, "fat": 0, "fiber": 0},
]


# ------- Affirmations (60+) ---------------------------------------------------
AFFIRMATIONS: List[Dict[str, str]] = [
    {"id": "af_001", "theme": "creative_identity", "text": "My creativity does not require me to abandon my well-being."},
    {"id": "af_002", "theme": "rest", "text": "Rest supports the work I am becoming capable of creating."},
    {"id": "af_003", "theme": "patience", "text": "I can prepare thoroughly without demanding perfection from myself."},
    {"id": "af_004", "theme": "resilience", "text": "One difficult moment does not define my creative future."},
    {"id": "af_005", "theme": "boundaries", "text": "My boundaries protect the quality of my life and my work."},
    {"id": "af_006", "theme": "confidence", "text": "I am allowed to take up space in the rooms I have earned."},
    {"id": "af_007", "theme": "focus", "text": "This moment of work deserves my full, undivided care."},
    {"id": "af_008", "theme": "consistency", "text": "Small, steady work is what turns a talent into a craft."},
    {"id": "af_009", "theme": "self_respect", "text": "I do not have to earn my worth by overworking."},
    {"id": "af_010", "theme": "courage", "text": "I can be nervous and prepared at the same time."},
    {"id": "af_011", "theme": "rejection", "text": "A no in one room is not a no from every room."},
    {"id": "af_012", "theme": "collaboration", "text": "I bring my whole self, and I leave room for others to do the same."},
    {"id": "af_013", "theme": "performance_readiness", "text": "My preparation gives me the freedom to be present on stage."},
    {"id": "af_014", "theme": "recovery", "text": "Slowing down today makes room for stronger work tomorrow."},
    {"id": "af_015", "theme": "sustainable_creativity", "text": "The pace I set is the career I build."},
    {"id": "af_016", "theme": "creative_identity", "text": "My voice, in every sense, is worth protecting."},
    {"id": "af_017", "theme": "confidence", "text": "I have shown up before, and I know how to show up again."},
    {"id": "af_018", "theme": "focus", "text": "I do not need to do everything today — only the next honest step."},
    {"id": "af_019", "theme": "patience", "text": "My timeline is my own. I trust its shape."},
    {"id": "af_020", "theme": "boundaries", "text": "Saying no to noise is saying yes to my craft."},
    {"id": "af_021", "theme": "resilience", "text": "I can hold both discomfort and hope in the same day."},
    {"id": "af_022", "theme": "rest", "text": "Sleep is part of my creative practice."},
    {"id": "af_023", "theme": "collaboration", "text": "Great work rarely happens alone. I welcome good company."},
    {"id": "af_024", "theme": "self_respect", "text": "I speak to myself the way I would speak to a friend I love."},
    {"id": "af_025", "theme": "courage", "text": "I choose to try, even when the outcome is not guaranteed."},
    {"id": "af_026", "theme": "rejection", "text": "Feedback is data. It is not the shape of my worth."},
    {"id": "af_027", "theme": "creative_identity", "text": "There is room in this industry for the artist I actually am."},
    {"id": "af_028", "theme": "confidence", "text": "I have prepared. I can trust the preparation."},
    {"id": "af_029", "theme": "focus", "text": "I let the important thing be important."},
    {"id": "af_030", "theme": "patience", "text": "Skill grows quietly. I do not need proof every day."},
    {"id": "af_031", "theme": "boundaries", "text": "I can be generous with my art and careful with my energy."},
    {"id": "af_032", "theme": "resilience", "text": "I have made it through every day so far. Today can be a next one."},
    {"id": "af_033", "theme": "rest", "text": "A well-rested artist makes braver choices."},
    {"id": "af_034", "theme": "collaboration", "text": "I trust the people who protect the room with me."},
    {"id": "af_035", "theme": "self_respect", "text": "I am allowed to change my mind, my sound, and my direction."},
    {"id": "af_036", "theme": "courage", "text": "Nervous is not the same as unprepared."},
    {"id": "af_037", "theme": "rejection", "text": "The work I love making is still worth making."},
    {"id": "af_038", "theme": "creative_identity", "text": "My taste is a compass I can learn to trust."},
    {"id": "af_039", "theme": "confidence", "text": "I do not need to shrink to fit someone's small imagination."},
    {"id": "af_040", "theme": "focus", "text": "One clear intention is worth more than a busy hour."},
    {"id": "af_041", "theme": "patience", "text": "There is no version of this work that is not built slowly."},
    {"id": "af_042", "theme": "boundaries", "text": "I am the caretaker of my instrument."},
    {"id": "af_043", "theme": "resilience", "text": "I can be tired and still capable of care."},
    {"id": "af_044", "theme": "rest", "text": "Time off is not time lost."},
    {"id": "af_045", "theme": "collaboration", "text": "Asking for help is a professional skill."},
    {"id": "af_046", "theme": "self_respect", "text": "My health is not a distraction from my art. It is part of it."},
    {"id": "af_047", "theme": "courage", "text": "I am willing to be a beginner again if the craft calls for it."},
    {"id": "af_048", "theme": "rejection", "text": "I am allowed to grieve a no. I am also allowed to keep going."},
    {"id": "af_049", "theme": "creative_identity", "text": "The world does not need a copy of anyone. It needs me, made well."},
    {"id": "af_050", "theme": "confidence", "text": "I already know more than the version of me who started."},
    {"id": "af_051", "theme": "focus", "text": "I return, gently, to what I said I would do."},
    {"id": "af_052", "theme": "patience", "text": "I let the work be as long as the work needs."},
    {"id": "af_053", "theme": "boundaries", "text": "I do not owe an explanation for taking care of my well-being."},
    {"id": "af_054", "theme": "resilience", "text": "I trust my ability to adjust when something changes."},
    {"id": "af_055", "theme": "rest", "text": "The pause between notes is part of the music."},
    {"id": "af_056", "theme": "collaboration", "text": "I make the room around me a better place to work."},
    {"id": "af_057", "theme": "self_respect", "text": "My value is not tied to my most recent output."},
    {"id": "af_058", "theme": "courage", "text": "I keep the promises I make to my future self."},
    {"id": "af_059", "theme": "rejection", "text": "The right rooms will recognize me. I keep my craft ready."},
    {"id": "af_060", "theme": "sustainable_creativity", "text": "I create in a way that I can still be creating in ten years."},
    {"id": "af_061", "theme": "performance_readiness", "text": "I have done the work. Now I let the work show up."},
    {"id": "af_062", "theme": "recovery", "text": "Recovery is where tomorrow's performance is quietly built."},
    {"id": "af_063", "theme": "creative_identity", "text": "I am both artist and human, and both deserve care today."},
]

AFFIRMATION_THEMES = sorted({a["theme"] for a in AFFIRMATIONS})


# ------- Mindfulness activities ----------------------------------------------
MINDFULNESS_ACTIVITIES: List[Dict[str, Any]] = [
    {"id": "mf_reset_2", "title": "Two-minute reset", "category": "two_minute_reset", "duration_seconds": 120,
     "purpose": "A short mental clearing between two things — before a session, meeting, or task.",
     "steps": ["Sit or stand comfortably.", "Take three long exhales.", "Notice five things you can see.", "Name one thing you want the next few minutes to feel like."]},
    {"id": "mf_focus_5", "title": "Five-minute focus", "category": "five_minute_focus", "duration_seconds": 300,
     "purpose": "Prepare the mind to enter one task with steady attention.",
     "steps": ["Close browser tabs you don't need.", "Write the single outcome you want.", "Breathe in for four, out for six, for one minute.", "Begin the task and stay for the timer."]},
    {"id": "mf_ground_10", "title": "Ten-minute grounding", "category": "ten_minute_grounding", "duration_seconds": 600,
     "purpose": "Return to yourself after a busy or scattered stretch of the day.",
     "steps": ["Feet on the floor, shoulders soft.", "Name five things you see, four you hear, three you feel, two you smell, one you taste.", "Take slow breaths for the rest of the time."]},
    {"id": "mf_pre_perf", "title": "Pre-performance calm", "category": "pre_performance_calm", "duration_seconds": 240,
     "purpose": "Steady the nervous system before you step up.",
     "steps": ["Feet planted. Jaw loose.", "Box breathing: 4 in, 4 hold, 4 out, 4 hold — for two minutes.", "Say to yourself: 'I have prepared. I am here.'"]},
    {"id": "mf_post_perf", "title": "Post-performance decompression", "category": "post_performance_decompression", "duration_seconds": 360,
     "purpose": "Release the adrenaline and return to a resting state.",
     "steps": ["Sit in a quiet place.", "Long exhales, twice as long as the inhales.", "Notice the body cooling down.", "Name one thing that went well and one thing you learned."]},
    {"id": "mf_block", "title": "Creative-block reset", "category": "creative_block_reset", "duration_seconds": 300,
     "purpose": "Move the mind out of a stuck loop and back into curiosity.",
     "steps": ["Stand up, walk two minutes.", "Change the room you are in.", "Write for two minutes with no goal.", "Return with one new small question."]},
    {"id": "mf_rejection", "title": "Rejection recovery", "category": "rejection_recovery", "duration_seconds": 360,
     "purpose": "Move through a hard 'no' without abandoning yourself.",
     "steps": ["Acknowledge how it feels — no fixing yet.", "Name one thing you learned.", "Name one thing that is still true about your craft.", "Choose the next kind action."]},
    {"id": "mf_sleep", "title": "Sleep transition", "category": "sleep_transition", "duration_seconds": 480,
     "purpose": "Lower the lights and the mind before rest.",
     "steps": ["Dim screens and lights.", "Body scan from head to feet.", "Let each breath out get a little slower.", "Set tomorrow's first step, then release it."]},
    {"id": "mf_studio_break", "title": "Studio break", "category": "studio_break", "duration_seconds": 180,
     "purpose": "A short protective pause during long studio sessions.",
     "steps": ["Step away from the desk.", "Look at something far — a window, a hallway.", "Roll shoulders and jaw.", "Sip water before returning."]},
    {"id": "mf_screen", "title": "Screen break", "category": "screen_break", "duration_seconds": 120,
     "purpose": "Ease eye strain and mental fatigue from screens.",
     "steps": ["Look at a point 20 feet away for 20 seconds.", "Blink slowly ten times.", "Stretch the fingers and wrists.", "Return with a clearer view."]},
]


# ------- Movement activities --------------------------------------------------
MOVEMENT_ACTIVITIES: List[Dict[str, Any]] = [
    {"id": "mv_am_mob", "title": "Morning mobility flow", "category": "morning_mobility", "duration_seconds": 480,
     "difficulty": "gentle", "equipment": "none", "target_areas": ["full_body"],
     "purpose": "Wake the body gently and prepare for a full day.",
     "steps": ["Neck rolls x8 each direction.", "Shoulder circles x10.", "Cat/cow x10.", "Standing side bends x8 each side.", "Hip circles x10 each direction."],
     "modifications": "Perform seated if standing is uncomfortable.", "safety": "Stop if anything feels sharp."},
    {"id": "mv_full", "title": "Full-body movement", "category": "full_body_movement", "duration_seconds": 900,
     "difficulty": "moderate", "equipment": "none", "target_areas": ["full_body"],
     "purpose": "A short whole-body routine when you want to move on a busy day.",
     "steps": ["Bodyweight squats 2×12.", "Push-ups (knees ok) 2×8.", "Reverse lunges 2×8 each side.", "Plank 2×30 sec.", "Slow spinal twists."],
     "modifications": "Reduce reps as needed. Use a chair for support."},
    {"id": "mv_beg_str", "title": "Beginner strength", "category": "beginner_strength", "duration_seconds": 900,
     "difficulty": "moderate", "equipment": "light_dumbbells_optional", "target_areas": ["full_body"],
     "purpose": "Build a foundation of strength for creative work.",
     "steps": ["Goblet squat 3×8.", "Row with dumbbell or band 3×10.", "Overhead press 3×8.", "Glute bridge 3×12."]},
    {"id": "mv_low_cardio", "title": "Low-impact cardio", "category": "low_impact_cardio", "duration_seconds": 1200,
     "difficulty": "gentle", "equipment": "none", "target_areas": ["heart", "legs"],
     "purpose": "Raise the heart rate without heavy joint impact.",
     "steps": ["Marching in place with arms 2 min.", "Side steps 2 min.", "Step ups on a low step 5 min.", "Cool-down walk 3 min."]},
    {"id": "mv_chair", "title": "Studio-chair reset", "category": "studio_chair_reset", "duration_seconds": 240,
     "difficulty": "gentle", "equipment": "chair", "target_areas": ["neck", "shoulders", "back", "hips"],
     "purpose": "A short reset during long studio sessions.",
     "steps": ["Seated spinal twist 30 sec each side.", "Seated forward fold 30 sec.", "Neck stretch each side 30 sec.", "Wrist circles 30 sec.", "Stand and reach up."]},
    {"id": "mv_neck", "title": "Neck and shoulder mobility", "category": "neck_shoulder_mobility", "duration_seconds": 300,
     "difficulty": "gentle", "equipment": "none", "target_areas": ["neck", "shoulders"],
     "purpose": "Release tension from hunching over an instrument, screen, or mixing desk.",
     "steps": ["Chin tucks x10.", "Ear-to-shoulder holds 20 sec each.", "Shoulder rolls 10 each way.", "Doorway chest opener 30 sec each side."]},
    {"id": "mv_wrist", "title": "Hands and wrist care", "category": "hands_wrist_care", "duration_seconds": 240,
     "difficulty": "gentle", "equipment": "none", "target_areas": ["hands", "wrists", "forearms"],
     "purpose": "Care for the hands that hold your craft.",
     "steps": ["Wrist circles 20 each direction.", "Finger fans x10.", "Prayer stretch 30 sec.", "Reverse prayer stretch 30 sec."]},
    {"id": "mv_back_hip", "title": "Back and hip mobility", "category": "back_hip_mobility", "duration_seconds": 360,
     "difficulty": "gentle", "equipment": "mat_optional", "target_areas": ["back", "hips"],
     "purpose": "Open a tight back and hips from long hours seated or standing.",
     "steps": ["Cat/cow 8 slow reps.", "World's greatest stretch 5 each side.", "Figure-4 stretch 45 sec each.", "Child's pose 60 sec."]},
    {"id": "mv_dance", "title": "Dancer conditioning", "category": "dance_performer_conditioning", "duration_seconds": 900,
     "difficulty": "moderate", "equipment": "none", "target_areas": ["legs", "core", "ankles"],
     "purpose": "Support the small stabilizers dancers use often.",
     "steps": ["Calf raises 3×15.", "Single-leg balance 30 sec each.", "Side leg raises 2×12 each.", "Bird-dog 3×8.", "Plank 3×30 sec."]},
    {"id": "mv_vocal", "title": "Vocalist posture and breathing", "category": "vocalist_posture_breathing", "duration_seconds": 360,
     "difficulty": "gentle", "equipment": "none", "target_areas": ["ribs", "diaphragm", "neck"],
     "purpose": "Open the ribs and support breath for the voice.",
     "steps": ["Standing rib expansion, hands on ribs, 10 breaths.", "Cactus-arm opener x10.", "Chin tucks x10.", "Straw phonation 60 sec.", "Slow humming 60 sec."]},
    {"id": "mv_musician", "title": "Musician mobility", "category": "musician_mobility", "duration_seconds": 360,
     "difficulty": "gentle", "equipment": "none", "target_areas": ["hands", "shoulders", "back"],
     "purpose": "Undo the shape of long practice sessions.",
     "steps": ["Wrist rolls x20.", "Finger extensor stretch 30 sec each.", "Chest opener 30 sec each side.", "Upper-back rotations x8 each side."]},
    {"id": "mv_editor", "title": "Producer / editor screen break", "category": "producer_editor_screen_break", "duration_seconds": 300,
     "difficulty": "gentle", "equipment": "none", "target_areas": ["eyes", "neck", "back"],
     "purpose": "A protective break for producers, editors, engineers.",
     "steps": ["20-20-20 eye rest.", "Neck stretch each side 30 sec.", "Stand, hinge, and reach floor.", "Roll shoulders x10.", "Hydrate."]},
    {"id": "mv_pre_reh", "title": "Pre-rehearsal preparation", "category": "pre_rehearsal_prep", "duration_seconds": 600,
     "difficulty": "moderate", "equipment": "none", "target_areas": ["full_body"],
     "purpose": "Prepare the body to work with intention.",
     "steps": ["Light cardio 2 min.", "Leg swings 10 each direction.", "Torso rotations 10 each.", "Dynamic lunges x10.", "Arm circles 10 each way."]},
    {"id": "mv_pre_perf", "title": "Pre-performance warm-up", "category": "pre_performance_warmup", "duration_seconds": 600,
     "difficulty": "moderate", "equipment": "none", "target_areas": ["full_body", "voice"],
     "purpose": "Wake the body and voice with focused intention.",
     "steps": ["Light cardio 2 min.", "Hip openers x10.", "Cactus arms x10.", "Straw phonation 60 sec.", "Two long exhales."]},
    {"id": "mv_post_perf", "title": "Post-performance cooldown", "category": "post_performance_cooldown", "duration_seconds": 600,
     "difficulty": "gentle", "equipment": "none", "target_areas": ["full_body"],
     "purpose": "Release the physical load of a show or rehearsal.",
     "steps": ["Walk 2 min.", "Standing forward fold 60 sec.", "Figure-4 stretch each side 45 sec.", "Child's pose 60 sec.", "Slow breathing 2 min."]},
    {"id": "mv_travel", "title": "Travel-day mobility", "category": "travel_day_mobility", "duration_seconds": 420,
     "difficulty": "gentle", "equipment": "none", "target_areas": ["hips", "back", "circulation"],
     "purpose": "Move fluids and open joints on long travel days.",
     "steps": ["Ankle pumps 20 each foot.", "Hip circles 10 each way.", "Standing side bends 8 each side.", "Neck stretch 30 sec each side.", "Walking 5 min if possible."]},
    {"id": "mv_recovery", "title": "Recovery-day movement", "category": "recovery_day_movement", "duration_seconds": 900,
     "difficulty": "gentle", "equipment": "mat_optional", "target_areas": ["full_body"],
     "purpose": "Gentle work on days meant for restoration.",
     "steps": ["Walking 5 min.", "Cat/cow 8 slow reps.", "Child's pose 60 sec.", "Supine twist 60 sec each side.", "Legs-up-the-wall 3 min."]},
]

MOVEMENT_INTENSITY_MAP = {"gentle": 1, "moderate": 2, "vigorous": 3}


# ------- Rule-based movement recommendation ----------------------------------
def pick_movement_of_day(check_in: Optional[Dict[str, Any]], discipline: str, completed_ids: List[str]) -> Dict[str, Any]:
    disc = (discipline or "").lower()
    demand = set((check_in or {}).get("creative_demand", []))
    snap = (check_in or {}).get("snapshot", {})
    arriving = (check_in or {}).get("arriving", {})

    candidates: List[str] = []
    if "live_performance" in demand or "audition" in demand:
        candidates += ["mv_pre_perf"]
    if "rehearsal" in demand:
        candidates += ["mv_pre_reh"]
    if "studio" in demand or "editing" in demand:
        candidates += ["mv_chair", "mv_editor", "mv_neck"]
    if "shoot" in demand:
        candidates += ["mv_back_hip", "mv_neck"]
    if "travel" in demand:
        candidates += ["mv_travel"]
    if "rest" in demand:
        candidates += ["mv_recovery"]
    if snap.get("body_discomfort", 0) >= 4 or arriving.get("body", 5) <= 2:
        candidates += ["mv_back_hip", "mv_chair"]
    if snap.get("sleep_hours", 8) < 6 or arriving.get("energy", 5) <= 2:
        candidates += ["mv_recovery", "mv_chair"]

    if any(k in disc for k in ["voc", "singer", "song"]):
        candidates += ["mv_vocal"]
    if any(k in disc for k in ["produc", "engineer"]):
        candidates += ["mv_editor", "mv_wrist"]
    if "danc" in disc:
        candidates += ["mv_dance"]
    if any(k in disc for k in ["music", "instru"]):
        candidates += ["mv_musician", "mv_wrist"]

    if not candidates:
        candidates = ["mv_am_mob", "mv_full", "mv_low_cardio"]

    # Prefer ones not recently completed
    for c in candidates:
        if c not in completed_ids:
            return next(a for a in MOVEMENT_ACTIVITIES if a["id"] == c)
    return next(a for a in MOVEMENT_ACTIVITIES if a["id"] == candidates[0])


# =============================================================================
# API models
# =============================================================================
class MealItemIn(BaseModel):
    food_id: Optional[str] = None
    name: str
    grams: float = Field(gt=0)
    kcal: float = 0
    protein: float = 0
    carbs: float = 0
    fat: float = 0
    fiber: float = 0


MealType = Literal["breakfast", "lunch", "dinner", "snack", "pre_performance", "post_performance", "studio", "beverage"]


class MealIn(BaseModel):
    date: str
    time: Optional[str] = None
    meal_type: MealType
    items: List[MealItemIn]
    photo_url: Optional[str] = None
    note: Optional[str] = None
    felt_after: Optional[int] = Field(default=None, ge=1, le=5)


class NutritionTargetsIn(BaseModel):
    calories: int = Field(ge=1200, le=6000)
    protein_g: int = Field(ge=20, le=400)
    carbs_g: int = Field(ge=50, le=800)
    fat_g: int = Field(ge=15, le=300)
    fiber_g: int = Field(ge=10, le=100)
    water_ml: int = Field(ge=500, le=6000)
    objective: str = "everyday_energy"


class NutritionReflectionIn(BaseModel):
    date: str
    nourished: int = Field(ge=1, le=5)
    energy_steadiness: int = Field(ge=1, le=5)
    affected_focus: Optional[str] = None
    tomorrow_intention: Optional[str] = None


class CustomFoodIn(BaseModel):
    name: str
    category: Optional[str] = "custom"
    ref_grams: float = 100
    kcal: float = 0
    protein: float = 0
    carbs: float = 0
    fat: float = 0
    fiber: float = 0


class HydrationIn(BaseModel):
    date: str
    ml: int = Field(gt=0, le=2000)


class AffirmationReflectionIn(BaseModel):
    affirmation_id: str
    note: str


class MindfulnessCompletionIn(BaseModel):
    activity_id: str
    duration_seconds: int = Field(gt=0)
    reflection: Optional[str] = None


class MovementCompletionIn(BaseModel):
    activity_id: Optional[str] = None
    custom_name: Optional[str] = None
    duration_seconds: int = Field(gt=0)
    intensity: Optional[int] = Field(default=None, ge=1, le=5)
    note: Optional[str] = None


class RoutineIn(BaseModel):
    name: str
    activity_ids: List[str]


# =============================================================================
# Router factory
# =============================================================================
def build_lifestyle_router(db, get_current_user):
    r = APIRouter(prefix="/api/lifestyle")

    # -------------------- FOODS ---------------------------------------------
    @r.get("/foods")
    async def foods(q: str = "", user: dict = Depends(get_current_user)):
        base = [f for f in FOOD_LIBRARY if q.lower() in f["name"].lower()] if q else FOOD_LIBRARY
        # Include user's custom foods
        cur = db.viearta_custom_foods.find({"user_id": user["id"]}, {"_id": 0})
        customs = await cur.to_list(200)
        if q:
            customs = [c for c in customs if q.lower() in c["name"].lower()]
        return {"library": base[:50], "custom": customs}

    @r.post("/foods/custom")
    async def create_custom_food(payload: CustomFoodIn, user: dict = Depends(get_current_user)):
        doc = {
            "id": _new_id(), "user_id": user["id"], "created_at": _now(),
            **payload.model_dump(),
        }
        await db.viearta_custom_foods.insert_one(doc)
        doc.pop("_id", None)
        return doc

    # -------------------- BARCODE LOOKUP (Open Food Facts) ------------------
    # Public API, no key required. We normalize to our per-100g food shape.
    _BARCODE_RE = re.compile(r"^\d{6,14}$")

    def _num(d: dict, *keys) -> float:
        for k in keys:
            v = d.get(k)
            if v is None: continue
            try:
                f = float(v)
                if f >= 0: return f
            except (TypeError, ValueError):
                pass
        return 0.0

    @r.get("/nutrition/scan/{barcode}")
    async def scan_barcode(barcode: str, user: dict = Depends(get_current_user)):
        code = barcode.strip()
        if not _BARCODE_RE.match(code):
            raise HTTPException(400, "Invalid barcode format")

        url = f"https://world.openfoodfacts.org/api/v2/product/{code}.json"
        try:
            async with httpx.AsyncClient(timeout=6.0, headers={"User-Agent": "VIEARTA/1.0 (support@viearta.app)"}) as client:
                resp = await client.get(url)
        except httpx.HTTPError as e:
            raise HTTPException(502, f"Food database unreachable: {e}")

        if resp.status_code != 200:
            raise HTTPException(502, "Food database error")

        payload = resp.json() or {}
        # OFF returns status=1 when found, 0 when not.
        if payload.get("status") != 1:
            raise HTTPException(404, "We couldn't find this item in the food database. Try Log meal to enter it manually.")

        p = payload.get("product") or {}
        n = p.get("nutriments") or {}

        # Per-100 g nutrients. Fall back to per-100 ml for liquids.
        kcal_100 = _num(n, "energy-kcal_100g", "energy-kcal_serving")
        if not kcal_100:
            # some products only give kJ — convert
            kj = _num(n, "energy_100g", "energy-kj_100g")
            if kj: kcal_100 = round(kj / 4.184, 1)

        # Best available product name
        name = (
            p.get("product_name")
            or p.get("product_name_en")
            or p.get("generic_name")
            or "Scanned item"
        )
        brand = (p.get("brands") or "").split(",")[0].strip() if p.get("brands") else ""
        display = f"{brand} · {name}".strip(" ·") if brand else name

        # Serving size (grams) if provided by OFF
        serving_g = _num(p, "serving_quantity")  # already in g/ml if present
        if not serving_g:
            # try to parse '30 g' / '250 ml' from serving_size
            ss = (p.get("serving_size") or "").lower()
            m = re.match(r"(\d+(?:\.\d+)?)\s*(g|ml)", ss)
            serving_g = float(m.group(1)) if m else 100.0

        food = {
            "id": f"barcode_{code}",
            "name": display[:120],
            "category": "packaged",
            "unit": "g",
            "ref": 100,
            "kcal": round(kcal_100, 1),
            "protein": round(_num(n, "proteins_100g"), 1),
            "carbs": round(_num(n, "carbohydrates_100g"), 1),
            "fat": round(_num(n, "fat_100g"), 1),
            "fiber": round(_num(n, "fiber_100g"), 1),
        }

        result = {
            "barcode": code,
            "found": True,
            "food": food,
            "suggested_grams": round(serving_g, 1),
            "brand": brand or None,
            "image_url": p.get("image_front_thumb_url") or p.get("image_thumb_url") or None,
            "source": "openfoodfacts",
        }

        # Persist to per-user scan history (upsert; increment count, bump last_scanned_at)
        try:
            await db.viearta_scans.update_one(
                {"user_id": user["id"], "barcode": code},
                {
                    "$set": {
                        "user_id": user["id"],
                        "barcode": code,
                        "food": food,
                        "suggested_grams": result["suggested_grams"],
                        "brand": result["brand"],
                        "image_url": result["image_url"],
                        "last_scanned_at": _now(),
                    },
                    "$inc": {"count": 1},
                    "$setOnInsert": {"id": _new_id(), "first_scanned_at": _now()},
                },
                upsert=True,
            )
        except Exception:
            # history is best-effort; never fail the scan
            pass

        return result

    @r.get("/nutrition/scans/recent")
    async def recent_scans(limit: int = 8, user: dict = Depends(get_current_user)):
        limit = max(1, min(int(limit or 8), 24))
        cur = db.viearta_scans.find(
            {"user_id": user["id"]}, {"_id": 0, "user_id": 0}
        ).sort("last_scanned_at", -1).limit(limit)
        items = await cur.to_list(limit)
        return {"items": items}

    @r.delete("/nutrition/scans/{barcode}")
    async def delete_scan(barcode: str, user: dict = Depends(get_current_user)):
        code = barcode.strip()
        if not _BARCODE_RE.match(code):
            raise HTTPException(400, "Invalid barcode format")
        res = await db.viearta_scans.delete_one({"user_id": user["id"], "barcode": code})
        return {"deleted": res.deleted_count}

    # -------------------- MEALS ---------------------------------------------
    def _totals(items: List[Dict[str, Any]]) -> Dict[str, float]:
        t = {"kcal": 0.0, "protein": 0.0, "carbs": 0.0, "fat": 0.0, "fiber": 0.0}
        for it in items:
            for k in t:
                t[k] += float(it.get(k, 0) or 0)
        return {k: round(v, 1) for k, v in t.items()}

    @r.post("/meals")
    async def create_meal(payload: MealIn, user: dict = Depends(get_current_user)):
        items = [i.model_dump() for i in payload.items]
        doc = {
            "id": _new_id(), "user_id": user["id"],
            "date": payload.date, "time": payload.time or _now(),
            "meal_type": payload.meal_type,
            "items": items, "totals": _totals(items),
            "photo_url": payload.photo_url, "note": payload.note,
            "felt_after": payload.felt_after,
            "created_at": _now(),
        }
        await db.viearta_meals.insert_one(doc)
        doc.pop("_id", None)
        return doc

    @r.delete("/meals/{meal_id}")
    async def delete_meal(meal_id: str, user: dict = Depends(get_current_user)):
        res = await db.viearta_meals.delete_one({"id": meal_id, "user_id": user["id"]})
        if not res.deleted_count:
            raise HTTPException(404, "Meal not found")
        return {"ok": True}

    @r.get("/meals")
    async def list_meals(date: Optional[str] = None, user: dict = Depends(get_current_user)):
        q: Dict[str, Any] = {"user_id": user["id"]}
        if date:
            q["date"] = date
        cur = db.viearta_meals.find(q, {"_id": 0}).sort("time", 1)
        return {"items": await cur.to_list(200)}

    @r.post("/meals/duplicate/{meal_id}")
    async def duplicate_meal(meal_id: str, user: dict = Depends(get_current_user)):
        src = await db.viearta_meals.find_one({"id": meal_id, "user_id": user["id"]}, {"_id": 0})
        if not src:
            raise HTTPException(404, "Not found")
        doc = {**src, "id": _new_id(), "date": _today(), "time": _now(), "created_at": _now()}
        await db.viearta_meals.insert_one(doc)
        doc.pop("_id", None)
        return doc

    @r.post("/meals/copy-yesterday")
    async def copy_yesterday(user: dict = Depends(get_current_user)):
        yesterday = (datetime.now(timezone.utc).date() - timedelta(days=1)).isoformat()
        cur = db.viearta_meals.find({"user_id": user["id"], "date": yesterday}, {"_id": 0})
        yesterday_meals = await cur.to_list(50)
        created = 0
        for m in yesterday_meals:
            doc = {**m, "id": _new_id(), "date": _today(), "time": _now(), "created_at": _now()}
            await db.viearta_meals.insert_one(doc)
            created += 1
        return {"copied": created}

    # -------------------- SAVED MEALS ---------------------------------------
    @r.post("/saved-meals")
    async def save_meal(payload: dict, user: dict = Depends(get_current_user)):
        doc = {
            "id": _new_id(), "user_id": user["id"], "created_at": _now(),
            "name": payload.get("name", "Saved meal"),
            "meal_type": payload.get("meal_type", "snack"),
            "items": payload.get("items", []),
            "totals": _totals(payload.get("items", [])),
        }
        await db.viearta_saved_meals.insert_one(doc)
        doc.pop("_id", None)
        return doc

    @r.get("/saved-meals")
    async def list_saved_meals(user: dict = Depends(get_current_user)):
        cur = db.viearta_saved_meals.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1)
        return {"items": await cur.to_list(50)}

    @r.delete("/saved-meals/{saved_id}")
    async def del_saved(saved_id: str, user: dict = Depends(get_current_user)):
        await db.viearta_saved_meals.delete_one({"id": saved_id, "user_id": user["id"]})
        return {"ok": True}

    # -------------------- HYDRATION -----------------------------------------
    @r.post("/hydration")
    async def log_water(payload: HydrationIn, user: dict = Depends(get_current_user)):
        await db.viearta_hydration.insert_one({
            "id": _new_id(), "user_id": user["id"],
            "date": payload.date, "ml": payload.ml, "at": _now(),
        })
        return {"ok": True}

    # -------------------- TARGETS -------------------------------------------
    DEFAULT_TARGETS = {
        "calories": 2400, "protein_g": 130, "carbs_g": 300, "fat_g": 75,
        "fiber_g": 30, "water_ml": 2500, "objective": "everyday_energy",
    }

    @r.get("/targets")
    async def get_targets(user: dict = Depends(get_current_user)):
        doc = await db.viearta_targets.find_one({"user_id": user["id"]}, {"_id": 0})
        return doc or {"user_id": user["id"], **DEFAULT_TARGETS, "is_default": True}

    @r.put("/targets")
    async def put_targets(payload: NutritionTargetsIn, user: dict = Depends(get_current_user)):
        doc = {"user_id": user["id"], **payload.model_dump(), "updated_at": _now(), "is_default": False}
        await db.viearta_targets.update_one({"user_id": user["id"]}, {"$set": doc}, upsert=True)
        return doc

    @r.post("/targets/estimate")
    async def estimate_targets(payload: dict, user: dict = Depends(get_current_user)):
        """Educational estimate — clearly not a medical prescription."""
        age = int(payload.get("age", 22))
        activity = payload.get("activity", "moderate")
        discipline = (payload.get("discipline", "") or "").lower()
        objective = payload.get("objective", "everyday_energy")
        restrictions = payload.get("restrictions", []) or []

        # Safety refusals: refer to a qualified professional
        if age < 18:
            return {"blocked": True, "reason": "For students under 18, we recommend meeting with a qualified nutrition professional to set targets together.", "estimate": None}
        if payload.get("pregnancy") or payload.get("eating_disorder") or payload.get("chronic_condition"):
            return {"blocked": True, "reason": "These circumstances deserve support from a qualified professional. VIEARTA does not generate targets in these cases.", "estimate": None}

        base = 2200
        base += 300 if activity == "high" else 0
        base -= 200 if activity == "low" else 0
        if any(k in discipline for k in ["danc", "actor"]):
            base += 200
        if objective == "support_demanding_schedule":
            base += 150
        if objective == "support_performance_preparation":
            base += 100
        if objective == "support_recovery":
            base += 50
        base = max(base, 1800)  # do not create restrictive targets

        protein_g = int(round(base * 0.25 / 4))
        fat_g = int(round(base * 0.30 / 9))
        carbs_g = int(round(base * 0.45 / 4))
        return {
            "blocked": False,
            "estimate": {
                "calories": int(base),
                "protein_g": protein_g,
                "carbs_g": carbs_g,
                "fat_g": fat_g,
                "fiber_g": 30,
                "water_ml": 2500,
                "objective": objective,
            },
            "disclaimer": "This is a general educational estimate — not a medical prescription. Adjust with a qualified professional if needed.",
        }

    # -------------------- NUTRITION TODAY -----------------------------------
    @r.get("/nutrition/today")
    async def nutrition_today(user: dict = Depends(get_current_user)):
        today = _today()
        meals = await db.viearta_meals.find({"user_id": user["id"], "date": today}, {"_id": 0}).to_list(50)
        totals = {"kcal": 0.0, "protein": 0.0, "carbs": 0.0, "fat": 0.0, "fiber": 0.0}
        for m in meals:
            for k in totals:
                totals[k] += float(m.get("totals", {}).get(k, 0) or 0)
        totals = {k: round(v, 1) for k, v in totals.items()}
        water_docs = await db.viearta_hydration.find({"user_id": user["id"], "date": today}, {"_id": 0}).to_list(50)
        water_ml = sum(int(w.get("ml", 0)) for w in water_docs)
        targets_doc = await db.viearta_targets.find_one({"user_id": user["id"]}, {"_id": 0}) or {"user_id": user["id"], **DEFAULT_TARGETS, "is_default": True}
        return {"date": today, "meals": meals, "totals": totals, "water_ml": water_ml, "targets": targets_doc}

    @r.post("/nutrition/reflection")
    async def save_reflection(payload: NutritionReflectionIn, user: dict = Depends(get_current_user)):
        doc = {"id": _new_id(), "user_id": user["id"], **payload.model_dump(), "created_at": _now()}
        await db.viearta_nutrition_reflections.update_one(
            {"user_id": user["id"], "date": payload.date},
            {"$set": doc}, upsert=True,
        )
        return doc

    @r.get("/nutrition/reflection")
    async def get_reflection(date: str, user: dict = Depends(get_current_user)):
        return await db.viearta_nutrition_reflections.find_one({"user_id": user["id"], "date": date}, {"_id": 0})

    # -------------------- AFFIRMATIONS --------------------------------------
    @r.get("/affirmations")
    async def list_affirmations(theme: Optional[str] = None, q: Optional[str] = None, user: dict = Depends(get_current_user)):
        items = AFFIRMATIONS
        if theme:
            items = [a for a in items if a["theme"] == theme]
        if q:
            ql = q.lower()
            items = [a for a in items if ql in a["text"].lower() or ql in a["theme"].lower()]
        favs = await db.viearta_affirmation_favs.find({"user_id": user["id"]}, {"_id": 0}).to_list(200)
        fav_ids = {f["affirmation_id"] for f in favs}
        result = [{**a, "favorited": a["id"] in fav_ids} for a in items]
        return {"items": result, "themes": AFFIRMATION_THEMES, "total": len(result)}

    @r.get("/affirmations/today")
    async def affirmation_today(user: dict = Depends(get_current_user)):
        # Deterministic rotation by day-of-year + user id length for variety.
        seed = datetime.now(timezone.utc).timetuple().tm_yday + (len(user["id"]) % 7)
        idx = seed % len(AFFIRMATIONS)
        fav = await db.viearta_affirmation_favs.find_one({"user_id": user["id"], "affirmation_id": AFFIRMATIONS[idx]["id"]})
        return {**AFFIRMATIONS[idx], "favorited": bool(fav)}

    @r.post("/affirmations/{aff_id}/favorite")
    async def toggle_favorite(aff_id: str, user: dict = Depends(get_current_user)):
        if not any(a["id"] == aff_id for a in AFFIRMATIONS):
            raise HTTPException(404, "Affirmation not found")
        existing = await db.viearta_affirmation_favs.find_one({"user_id": user["id"], "affirmation_id": aff_id})
        if existing:
            await db.viearta_affirmation_favs.delete_one({"user_id": user["id"], "affirmation_id": aff_id})
            return {"favorited": False}
        await db.viearta_affirmation_favs.insert_one({
            "id": _new_id(), "user_id": user["id"], "affirmation_id": aff_id, "reflection": None, "created_at": _now(),
        })
        return {"favorited": True}

    @r.post("/affirmations/reflection")
    async def save_affirmation_reflection(payload: AffirmationReflectionIn, user: dict = Depends(get_current_user)):
        await db.viearta_affirmation_favs.update_one(
            {"user_id": user["id"], "affirmation_id": payload.affirmation_id},
            {"$set": {"reflection": payload.note, "updated_at": _now()},
             "$setOnInsert": {"id": _new_id(), "user_id": user["id"], "affirmation_id": payload.affirmation_id, "created_at": _now()}},
            upsert=True,
        )
        return {"ok": True}

    @r.get("/affirmations/favorites")
    async def list_favorites(user: dict = Depends(get_current_user)):
        favs = await db.viearta_affirmation_favs.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)
        # Attach affirmation text
        by_id = {a["id"]: a for a in AFFIRMATIONS}
        merged = []
        for f in favs:
            a = by_id.get(f["affirmation_id"])
            if a:
                merged.append({**a, "favorited": True, "reflection": f.get("reflection"), "saved_at": f.get("created_at")})
        return {"items": merged}

    # -------------------- MINDFULNESS ---------------------------------------
    @r.get("/mindfulness/activities")
    async def list_mindfulness(user: dict = Depends(get_current_user)):
        return {"items": MINDFULNESS_ACTIVITIES}

    @r.post("/mindfulness/complete")
    async def complete_mindfulness(payload: MindfulnessCompletionIn, user: dict = Depends(get_current_user)):
        if not any(a["id"] == payload.activity_id for a in MINDFULNESS_ACTIVITIES):
            raise HTTPException(404, "Activity not found")
        doc = {"id": _new_id(), "user_id": user["id"], **payload.model_dump(),
               "date": _today(), "created_at": _now()}
        await db.viearta_mindfulness_completions.insert_one(doc)
        doc.pop("_id", None)
        return doc

    @r.get("/mindfulness/completions")
    async def mindfulness_completions(limit: int = 20, user: dict = Depends(get_current_user)):
        cur = db.viearta_mindfulness_completions.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).limit(limit)
        return {"items": await cur.to_list(limit)}

    # -------------------- MOVEMENT ------------------------------------------
    @r.get("/movement/activities")
    async def list_movement(user: dict = Depends(get_current_user)):
        return {"items": MOVEMENT_ACTIVITIES}

    @r.get("/movement/today")
    async def movement_today(user: dict = Depends(get_current_user)):
        check_in = await db.checkins.find_one({"user_id": user["id"], "date": _today()}, {"_id": 0})
        completed = await db.viearta_movement_completions.find(
            {"user_id": user["id"]}, {"_id": 0}
        ).sort("created_at", -1).limit(5).to_list(5)
        completed_ids = [c.get("activity_id") for c in completed if c.get("activity_id")]
        pick = pick_movement_of_day(check_in, user.get("discipline", ""), completed_ids)
        return {"activity": pick, "personalized": bool(check_in)}

    @r.post("/movement/complete")
    async def complete_movement(payload: MovementCompletionIn, user: dict = Depends(get_current_user)):
        doc = {"id": _new_id(), "user_id": user["id"], **payload.model_dump(),
               "date": _today(), "created_at": _now()}
        await db.viearta_movement_completions.insert_one(doc)
        doc.pop("_id", None)
        return doc

    @r.get("/movement/completions")
    async def movement_completions(limit: int = 20, user: dict = Depends(get_current_user)):
        cur = db.viearta_movement_completions.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).limit(limit)
        return {"items": await cur.to_list(limit)}

    # -------------------- ROUTINES ------------------------------------------
    @r.get("/routines")
    async def list_routines(user: dict = Depends(get_current_user)):
        cur = db.viearta_routines.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1)
        return {"items": await cur.to_list(50)}

    @r.post("/routines")
    async def create_routine(payload: RoutineIn, user: dict = Depends(get_current_user)):
        doc = {"id": _new_id(), "user_id": user["id"], **payload.model_dump(), "created_at": _now()}
        await db.viearta_routines.insert_one(doc)
        doc.pop("_id", None)
        return doc

    @r.delete("/routines/{routine_id}")
    async def delete_routine(routine_id: str, user: dict = Depends(get_current_user)):
        await db.viearta_routines.delete_one({"id": routine_id, "user_id": user["id"]})
        return {"ok": True}

    # -------------------- SUMMARY (for My Progress) -------------------------
    @r.get("/summary")
    async def lifestyle_summary(user: dict = Depends(get_current_user)):
        today_dt = datetime.now(timezone.utc).date()
        start = (today_dt - timedelta(days=6)).isoformat()

        meals = await db.viearta_meals.find({"user_id": user["id"], "date": {"$gte": start}}, {"_id": 0}).to_list(200)
        by_date: Dict[str, Dict[str, float]] = {}
        for m in meals:
            t = m.get("totals", {})
            d = by_date.setdefault(m["date"], {"kcal": 0.0, "protein": 0.0, "carbs": 0.0, "fat": 0.0, "fiber": 0.0})
            for k in d:
                d[k] += float(t.get(k, 0) or 0)

        water = await db.viearta_hydration.find({"user_id": user["id"], "date": {"$gte": start}}, {"_id": 0}).to_list(200)
        water_by_date: Dict[str, int] = {}
        for w in water:
            water_by_date[w["date"]] = water_by_date.get(w["date"], 0) + int(w.get("ml", 0))

        series = []
        for i in range(6, -1, -1):
            d = (today_dt - timedelta(days=i)).isoformat()
            b = by_date.get(d, {"kcal": 0, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0})
            series.append({
                "date": d,
                **{k: round(v, 1) for k, v in b.items()},
                "water_ml": water_by_date.get(d, 0),
            })

        mind = await db.viearta_mindfulness_completions.count_documents({"user_id": user["id"], "date": {"$gte": start}})
        move_docs = await db.viearta_movement_completions.find({"user_id": user["id"], "date": {"$gte": start}}, {"_id": 0}).to_list(200)
        move_minutes = round(sum(int(m.get("duration_seconds", 0)) for m in move_docs) / 60)
        favs_ct = await db.viearta_affirmation_favs.count_documents({"user_id": user["id"]})

        return {
            "series": series,
            "mindfulness_sessions": mind,
            "movement_minutes": move_minutes,
            "movement_completions": len(move_docs),
            "affirmations_saved": favs_ct,
        }

    return r


# =============================================================================
# Seed demo lifestyle data
# =============================================================================
async def seed_lifestyle_demo(db, demo_user_id: str):
    now = datetime.now(timezone.utc)

    # ---- Nutrition targets
    await db.viearta_targets.update_one(
        {"user_id": demo_user_id},
        {"$set": {
            "user_id": demo_user_id,
            "calories": 2600, "protein_g": 150, "carbs_g": 320, "fat_g": 80,
            "fiber_g": 32, "water_ml": 2800, "objective": "support_demanding_schedule",
            "updated_at": now.isoformat(), "is_default": False,
        }}, upsert=True,
    )

    # Clear prior demo lifestyle entries to keep seed idempotent
    await db.viearta_meals.delete_many({"user_id": demo_user_id})
    await db.viearta_hydration.delete_many({"user_id": demo_user_id})
    await db.viearta_saved_meals.delete_many({"user_id": demo_user_id})
    await db.viearta_mindfulness_completions.delete_many({"user_id": demo_user_id})
    await db.viearta_movement_completions.delete_many({"user_id": demo_user_id})
    await db.viearta_routines.delete_many({"user_id": demo_user_id})
    await db.viearta_affirmation_favs.delete_many({"user_id": demo_user_id})
    await db.viearta_nutrition_reflections.delete_many({"user_id": demo_user_id})

    def food(fid, grams):
        f = next(x for x in FOOD_LIBRARY if x["id"] == fid)
        scale = grams / max(f["ref"], 1)
        return {
            "food_id": fid, "name": f["name"], "grams": grams,
            "kcal": round(f["kcal"] * (grams / 100), 1),
            "protein": round(f["protein"] * (grams / 100), 1),
            "carbs": round(f["carbs"] * (grams / 100), 1),
            "fat": round(f["fat"] * (grams / 100), 1),
            "fiber": round(f["fiber"] * (grams / 100), 1),
        }

    days = [
        {  # 2 days ago
            "date": (now.date() - timedelta(days=2)).isoformat(),
            "meals": [
                {"meal_type": "breakfast", "items": [food("f_oats", 60), food("f_berries", 80), food("f_almondbutter", 15)], "note": "Steady start", "felt_after": 4},
                {"meal_type": "lunch", "items": [food("f_chicken", 150), food("f_rice", 180), food("f_broccoli", 120)], "felt_after": 4},
                {"meal_type": "snack", "items": [food("f_apple", 150), food("f_peanutb", 20)], "felt_after": 3},
                {"meal_type": "dinner", "items": [food("f_salmon", 140), food("f_sweetpotato", 180), food("f_avocado", 60)], "felt_after": 5},
            ],
            "water": [400, 350, 500, 300],
        },
        {  # yesterday
            "date": (now.date() - timedelta(days=1)).isoformat(),
            "meals": [
                {"meal_type": "breakfast", "items": [food("f_greekyog", 200), food("f_berries", 80), food("f_nuts", 20)], "felt_after": 4},
                {"meal_type": "studio", "items": [food("f_energybar", 55), food("f_coffee", 240)], "note": "Fuel between takes"},
                {"meal_type": "lunch", "items": [food("f_stirfry", 400), food("f_rice", 150)], "felt_after": 4},
                {"meal_type": "dinner", "items": [food("f_pasta", 200), food("f_chicken", 120), food("f_broccoli", 100)], "felt_after": 5},
            ],
            "water": [300, 400, 500, 250, 500],
        },
        {  # today
            "date": now.date().isoformat(),
            "meals": [
                {"meal_type": "breakfast", "items": [food("f_eggs", 100), food("f_toast", 40), food("f_avocado", 60)], "felt_after": 4},
                {"meal_type": "pre_performance", "items": [food("f_smoothie", 300), food("f_banana", 120)], "note": "Pre-rehearsal fuel", "felt_after": 4},
            ],
            "water": [300, 250],
        },
    ]

    for day in days:
        for m in day["meals"]:
            totals = {"kcal": 0.0, "protein": 0.0, "carbs": 0.0, "fat": 0.0, "fiber": 0.0}
            for it in m["items"]:
                for k in totals:
                    totals[k] += float(it.get(k, 0) or 0)
            totals = {k: round(v, 1) for k, v in totals.items()}
            await db.viearta_meals.insert_one({
                "id": _new_id(), "user_id": demo_user_id,
                "date": day["date"], "time": now.isoformat(),
                "meal_type": m["meal_type"], "items": m["items"], "totals": totals,
                "photo_url": None, "note": m.get("note"), "felt_after": m.get("felt_after"),
                "created_at": now.isoformat(),
            })
        for ml in day["water"]:
            await db.viearta_hydration.insert_one({
                "id": _new_id(), "user_id": demo_user_id,
                "date": day["date"], "ml": ml, "at": now.isoformat(),
            })

    # Two saved meals
    saved = [
        {"name": "Studio breakfast", "meal_type": "breakfast", "items": [food("f_oats", 60), food("f_berries", 80), food("f_almondbutter", 15)]},
        {"name": "Rehearsal recovery bowl", "meal_type": "post_performance", "items": [food("f_chicken", 150), food("f_rice", 200), food("f_broccoli", 120)]},
    ]
    for s in saved:
        totals = {"kcal": 0.0, "protein": 0.0, "carbs": 0.0, "fat": 0.0, "fiber": 0.0}
        for it in s["items"]:
            for k in totals:
                totals[k] += float(it.get(k, 0) or 0)
        await db.viearta_saved_meals.insert_one({
            "id": _new_id(), "user_id": demo_user_id, "created_at": now.isoformat(),
            "name": s["name"], "meal_type": s["meal_type"], "items": s["items"],
            "totals": {k: round(v, 1) for k, v in totals.items()},
        })

    # Two favorite affirmations with reflections
    favs = [
        ("af_002", "Sleep really did shift my session yesterday. Keeping this one close."),
        ("af_013", "Reading before every soundcheck. Prep gives me the freedom to be present."),
    ]
    for aid, note in favs:
        await db.viearta_affirmation_favs.insert_one({
            "id": _new_id(), "user_id": demo_user_id,
            "affirmation_id": aid, "reflection": note, "created_at": now.isoformat(),
        })

    # Three mindfulness completions
    minds = ["mf_pre_perf", "mf_studio_break", "mf_reset_2"]
    for i, mid in enumerate(minds):
        act = next(a for a in MINDFULNESS_ACTIVITIES if a["id"] == mid)
        await db.viearta_mindfulness_completions.insert_one({
            "id": _new_id(), "user_id": demo_user_id,
            "activity_id": mid, "duration_seconds": act["duration_seconds"],
            "reflection": None,
            "date": (now.date() - timedelta(days=i)).isoformat(),
            "created_at": (now - timedelta(days=i, hours=1)).isoformat(),
        })

    # Four movement completions
    moves = [
        ("mv_chair", 240), ("mv_neck", 300), ("mv_vocal", 360), ("mv_pre_reh", 600),
    ]
    for i, (mid, dur) in enumerate(moves):
        await db.viearta_movement_completions.insert_one({
            "id": _new_id(), "user_id": demo_user_id,
            "activity_id": mid, "custom_name": None,
            "duration_seconds": dur, "intensity": 2 + (i % 2),
            "note": None,
            "date": (now.date() - timedelta(days=i)).isoformat(),
            "created_at": (now - timedelta(days=i, hours=2)).isoformat(),
        })

    # One personal routine
    await db.viearta_routines.insert_one({
        "id": _new_id(), "user_id": demo_user_id,
        "name": "Studio break routine",
        "activity_ids": ["mv_chair", "mv_neck", "mv_wrist"],
        "created_at": now.isoformat(),
    })

    # Reflection for today
    await db.viearta_nutrition_reflections.update_one(
        {"user_id": demo_user_id, "date": now.date().isoformat()},
        {"$set": {
            "id": _new_id(), "user_id": demo_user_id, "date": now.date().isoformat(),
            "nourished": 4, "energy_steadiness": 4,
            "affected_focus": "Pre-rehearsal smoothie kept me steady through vocal warm-ups.",
            "tomorrow_intention": "Bring water and a snack for the second half of studio.",
            "created_at": now.isoformat(),
        }}, upsert=True,
    )
