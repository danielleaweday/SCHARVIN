"""Pydantic models & MongoDB helpers for CYNAIAH."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, List, Optional
import uuid

from pydantic import BaseModel, ConfigDict, EmailStr, Field


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _uid() -> str:
    return str(uuid.uuid4())


# ============ Users ============
ROLES = {
    "student",
    "faculty",
    "mentor",
    "collaborator",
    "institutional_admin",
    "platform_admin",
}


class UserBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    email: EmailStr
    name: str
    role: str = "student"
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    program: Optional[str] = "BFA in Visual Storytelling"
    focus_areas: List[str] = Field(default_factory=list)


class UserCreate(UserBase):
    password: str


class UserPublic(UserBase):
    id: str
    created_at: str


class UserDB(UserBase):
    id: str = Field(default_factory=_uid)
    password_hash: str
    created_at: str = Field(default_factory=_now_iso)


class LoginPayload(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


# ============ Projects ============
PROJECT_TYPES = [
    "music_video",
    "lyric_video",
    "visualizer",
    "short_film",
    "documentary",
    "commercial",
    "branded_content",
    "animation",
    "cgi_scene",
    "social_campaign",
    "live_visuals",
    "custom",
]

PROJECT_STATUSES = [
    "concept",
    "preproduction",
    "production",
    "post_production",
    "review",
    "rights_clearance",
    "completed",
    "archived",
]


class ProjectCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    title: str
    type: str
    objective: Optional[str] = None
    audience: Optional[str] = None
    format: Optional[str] = None
    visual_style: Optional[str] = None
    music_selection: Optional[str] = None
    story_concept: Optional[str] = None
    production_approach: Optional[str] = None
    ai_workflow: Optional[str] = "hybrid"  # traditional | ai_assisted | hybrid
    budget: Optional[float] = None
    timeline: Optional[str] = None
    disclosure_notes: Optional[str] = None
    thumbnail_url: Optional[str] = None


class Project(ProjectCreate):
    id: str = Field(default_factory=_uid)
    owner_id: str
    owner_name: Optional[str] = None
    status: str = "concept"
    progress: int = 0
    collaborators: List[str] = Field(default_factory=list)  # names/emails
    tags: List[str] = Field(default_factory=list)
    created_at: str = Field(default_factory=_now_iso)
    updated_at: str = Field(default_factory=_now_iso)


class ProjectUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    title: Optional[str] = None
    status: Optional[str] = None
    progress: Optional[int] = None
    thumbnail_url: Optional[str] = None
    story_concept: Optional[str] = None
    visual_style: Optional[str] = None
    music_selection: Optional[str] = None
    tags: Optional[List[str]] = None
    collaborators: Optional[List[str]] = None


# ============ Scripts / Story Lab ============
class ScriptDocument(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uid)
    project_id: str
    owner_id: str
    title: str
    content: str = ""
    kind: str = "screenplay"  # screenplay | treatment | logline | shotlist
    version: int = 1
    created_at: str = Field(default_factory=_now_iso)
    updated_at: str = Field(default_factory=_now_iso)


class ScriptCreate(BaseModel):
    project_id: str
    title: str
    content: str = ""
    kind: str = "screenplay"


# ============ Storyboards & Assets ============
class Asset(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uid)
    project_id: Optional[str] = None
    owner_id: str
    name: str
    type: str  # image | video | audio | document
    url: str
    source: str = "uploaded"  # uploaded | ai_generated | library
    prompt: Optional[str] = None
    provider: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    created_at: str = Field(default_factory=_now_iso)


# ============ Sync Studio ============
class SyncCue(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uid)
    project_id: str
    timestamp: float  # seconds
    label: str
    type: str = "beat"  # beat | cut | lyric | emotion | transition | scene
    notes: Optional[str] = None
    asset_id: Optional[str] = None
    asset_url: Optional[str] = None


class SyncCueCreate(BaseModel):
    project_id: str
    timestamp: float
    label: str
    type: str = "beat"
    notes: Optional[str] = None


class SyncCueUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    label: Optional[str] = None
    type: Optional[str] = None
    notes: Optional[str] = None
    asset_id: Optional[str] = None
    asset_url: Optional[str] = None
    timestamp: Optional[float] = None


class MusicTrackUpsert(BaseModel):
    model_config = ConfigDict(extra="ignore")
    title: Optional[str] = None
    artist: Optional[str] = None
    duration_seconds: Optional[float] = None
    ownership: Optional[str] = None
    composers: Optional[List[str]] = None
    publishers: Optional[List[str]] = None
    music_url: Optional[str] = None


class MusicTrack(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uid)
    project_id: str
    title: str
    artist: str
    duration_seconds: float = 180.0
    ownership: str = "original"  # original | commissioned | licensed | library
    composers: List[str] = Field(default_factory=list)
    publishers: List[str] = Field(default_factory=list)
    waveform: List[float] = Field(default_factory=list)  # 0..1 samples
    music_url: Optional[str] = None  # audio playback URL (real audio when available)
    created_at: str = Field(default_factory=_now_iso)


# ============ Rights & Credits ============
class RightsRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uid)
    project_id: str
    contributor_name: str
    role: str
    ownership_type: str = "contributor"  # owner | contributor | licensor | ai_tool
    ai_disclosure: Optional[str] = None
    consent_recorded: bool = False
    licensing_notes: Optional[str] = None
    commercial_use: bool = True
    created_at: str = Field(default_factory=_now_iso)


# ============ Learning ============
class Course(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uid)
    title: str
    category: str
    description: str
    thumbnail_url: str
    lessons_count: int = 12
    duration_hours: float = 20.0
    level: str = "Foundations"
    instructor: str = "CYNAIAH Faculty"


class Enrollment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uid)
    user_id: str
    course_id: str
    progress: int = 0
    status: str = "in_progress"  # in_progress | completed
    started_at: str = Field(default_factory=_now_iso)


# ============ Portfolio ============
class PortfolioItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uid)
    user_id: str
    project_id: str
    title: str
    category: str
    thumbnail_url: str
    description: Optional[str] = None
    featured: bool = False
    created_at: str = Field(default_factory=_now_iso)


# ============ Feedback & Notifications ============
class Feedback(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uid)
    project_id: str
    author_name: str
    author_role: str = "faculty"
    message: str
    created_at: str = Field(default_factory=_now_iso)


class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uid)
    user_id: str
    message: str
    type: str = "info"  # info | assignment | feedback | render | invite | review
    read: bool = False
    # Optional deep-link context — populated for review notifications so the
    # student can jump straight to the exact event in their Reviews inbox.
    project_id: Optional[str] = None
    project_title: Optional[str] = None
    review_id: Optional[str] = None
    review_kind: Optional[str] = None  # written | time_coded | coverage_response | rubric | status
    review_status_value: Optional[str] = None
    author_name: Optional[str] = None
    deep_link: Optional[str] = None  # e.g. "/reviews?project=<id>&review=<id>"
    created_at: str = Field(default_factory=_now_iso)
    # ---- ANCR-integration-ready envelope ----
    # These fields let the notification be replayed onto the ANCR notification
    # bus unchanged once the ANCRID/ANCR integration is live.
    event_type: Optional[str] = None
    actor: Optional[dict] = None       # {user_id, name, ancrid}
    recipient: Optional[dict] = None   # {user_id, ancrid}
    subject: Optional[dict] = None     # {kind, id, title}
    payload: Optional[dict] = None
    channels: Optional[List[dict]] = None  # [{name, status, delivered_at, detail}]
    ancr_ready: bool = True
    ancr_emitted_at: Optional[str] = None


class CalendarEvent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uid)
    user_id: str
    project_id: Optional[str] = None
    title: str
    date: str  # ISO
    kind: str = "deadline"  # deadline | shoot | review | class


# ============ AI ============
class ScriptGenRequest(BaseModel):
    project_id: Optional[str] = None
    kind: str = "screenplay"  # screenplay | treatment | logline | shotlist
    prompt: str
    tone: Optional[str] = "cinematic"


class ImageGenRequest(BaseModel):
    project_id: Optional[str] = None
    prompt: str
    style: Optional[str] = "cinematic film still"
    save_as_asset: bool = True
    tags: List[str] = Field(default_factory=list)  # e.g. ['mood-board']
    character_ids: List[str] = Field(default_factory=list)


# ============ Character Reference Profiles ============
# Provider-supported character-reference workflow (NOT LoRA).
# The user attaches one or more identity reference images to a character and
# specifies locked attributes (age, hair, skin tone, wardrobe, visual style).
# When generating imagery, the character's reference images + locked attributes
# are passed alongside the text prompt so the provider's own multimodal
# capabilities keep the identity consistent across shots.
class CharacterProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uid)
    project_id: str
    owner_id: str
    name: str
    role_in_story: Optional[str] = None
    description: Optional[str] = None
    age: Optional[str] = None
    gender: Optional[str] = None
    hair: Optional[str] = None
    skin_tone: Optional[str] = None
    eye_color: Optional[str] = None
    wardrobe: Optional[str] = None
    visual_style: Optional[str] = None
    locked_details: Optional[str] = None
    reference_image_urls: List[str] = Field(default_factory=list)
    notes: Optional[str] = None
    created_at: str = Field(default_factory=_now_iso)


class CharacterProfileCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    project_id: str
    name: str
    role_in_story: Optional[str] = None
    description: Optional[str] = None
    age: Optional[str] = None
    gender: Optional[str] = None
    hair: Optional[str] = None
    skin_tone: Optional[str] = None
    eye_color: Optional[str] = None
    wardrobe: Optional[str] = None
    visual_style: Optional[str] = None
    locked_details: Optional[str] = None
    reference_image_urls: List[str] = Field(default_factory=list)
    notes: Optional[str] = None


class CharacterProfileUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: Optional[str] = None
    role_in_story: Optional[str] = None
    description: Optional[str] = None
    age: Optional[str] = None
    gender: Optional[str] = None
    hair: Optional[str] = None
    skin_tone: Optional[str] = None
    eye_color: Optional[str] = None
    wardrobe: Optional[str] = None
    visual_style: Optional[str] = None
    locked_details: Optional[str] = None
    reference_image_urls: Optional[List[str]] = None
    notes: Optional[str] = None


class CharacterReferenceGen(BaseModel):
    """Generate a fresh reference image and attach it to the character."""
    prompt: Optional[str] = None  # if omitted, we build one from the profile
    style: str = "identity reference portrait, neutral lighting, clean background"


# ============ Storyboards ============
SHOT_TYPES = [
    "EWS",  # extreme wide
    "WS",   # wide
    "MS",   # medium
    "MCU",  # medium close-up
    "CU",   # close-up
    "ECU",  # extreme close-up
    "OTS",  # over-the-shoulder
    "POV",  # point-of-view
    "insert",
]


class StoryboardFrame(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uid)
    project_id: str
    owner_id: str
    order: int = 0
    image_url: Optional[str] = None
    caption: str = ""
    shot_type: str = "MS"
    notes: Optional[str] = None
    source: str = "uploaded"  # uploaded | ai_generated | library
    prompt: Optional[str] = None
    provider: Optional[str] = None
    created_at: str = Field(default_factory=_now_iso)


class StoryboardFrameCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    project_id: str
    caption: str = ""
    shot_type: str = "MS"
    notes: Optional[str] = None
    image_url: Optional[str] = None
    prompt: Optional[str] = None
    generate_with_ai: bool = False  # if True, prompt is used to generate an image
    style: Optional[str] = "cinematic storyboard frame"
    character_ids: List[str] = Field(default_factory=list)


class StoryboardFrameUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    caption: Optional[str] = None
    shot_type: Optional[str] = None
    notes: Optional[str] = None
    image_url: Optional[str] = None
    order: Optional[int] = None


# ==================================================================
#   Edit & Finish (rough cut → fine cut → picture lock → final)
# ==================================================================

EDIT_STAGES = ("rough_cut", "fine_cut", "picture_lock", "final")
APPROVAL_STATUSES = ("draft", "submitted", "changes_requested", "approved")


class EditVersion(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uid)
    project_id: str
    owner_id: str
    stage: str = "rough_cut"          # rough_cut | fine_cut | picture_lock | final
    version_number: int = 1           # monotonic per project
    title: str
    notes: Optional[str] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    duration_seconds: Optional[float] = None
    approval_status: str = "draft"    # draft | submitted | changes_requested | approved
    approval_message: Optional[str] = None
    approved_by: Optional[str] = None
    approved_at: Optional[str] = None
    superseded_by: Optional[str] = None
    created_at: str = Field(default_factory=_now_iso)


class FinishingNote(BaseModel):
    """Notes bucketed by discipline: color, sound, vfx, general."""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uid)
    project_id: str
    owner_id: str
    category: str = "general"        # color | sound | vfx | general
    body: str
    resolved: bool = False
    created_at: str = Field(default_factory=_now_iso)


class CreditLine(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uid)
    project_id: str
    owner_id: str
    section: str = "closing"          # opening | closing
    position: int = 0
    name: str
    role: str
    notes: Optional[str] = None


class Caption(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uid)
    project_id: str
    owner_id: str
    language: str = "en"
    filename: str
    url: str
    format: str = "srt"               # srt | vtt
    created_at: str = Field(default_factory=_now_iso)


class ChecklistItem(BaseModel):
    key: str
    label: str
    done: bool = False
    note: Optional[str] = None


DEFAULT_ACCESSIBILITY_ITEMS = [
    {"key": "captions_present", "label": "Captions (SRT or VTT) uploaded for every spoken word"},
    {"key": "captions_reviewed", "label": "Captions reviewed by a native speaker of each language"},
    {"key": "audio_description", "label": "Audio description track or on-screen description considered"},
    {"key": "color_contrast", "label": "Titles + credits meet WCAG contrast on target displays"},
    {"key": "flashing_check", "label": "No unmarked photosensitive/flashing content"},
    {"key": "safe_area", "label": "Titles and safety-critical content within action-safe area"},
    {"key": "loudness_check", "label": "Loudness normalised for delivery target (e.g., -23 LUFS)"},
]

DEFAULT_DELIVERY_ITEMS = [
    {"key": "final_master_prores", "label": "Final master exported (ProRes 422 HQ or equivalent)"},
    {"key": "final_master_h264", "label": "Distribution master exported (H.264 1080p)"},
    {"key": "poster_frame", "label": "Poster frame (JPEG, 1920×1080)"},
    {"key": "captions_burned_in", "label": "Burn-in caption master included where required"},
    {"key": "credits_locked", "label": "Opening + closing credits locked and spell-checked"},
    {"key": "rights_cleared", "label": "All rights records show consent recorded"},
    {"key": "faculty_approved", "label": "Faculty approval on the final version"},
    {"key": "portfolio_ready", "label": "Approved for the CYNAIAH student portfolio"},
]


class Checklist(BaseModel):
    """One doc per {project_id, kind}. kind ∈ accessibility | delivery."""
    model_config = ConfigDict(extra="ignore")
    project_id: str
    kind: str                          # accessibility | delivery
    items: List[dict] = Field(default_factory=list)
    updated_at: str = Field(default_factory=_now_iso)
