"""COHEIR™ Pydantic models — canonical shapes for MongoDB documents & API responses."""
from __future__ import annotations
from datetime import datetime, timezone
from typing import List, Optional, Literal, Dict, Any
import uuid

from pydantic import BaseModel, Field, EmailStr, ConfigDict


# ─────────────────────────────────────────────────────────────────────────────
# Base
# ─────────────────────────────────────────────────────────────────────────────

def _uuid() -> str:
    return uuid.uuid4().hex


def _now() -> datetime:
    return datetime.now(timezone.utc)


class BaseDoc(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    id: str = Field(default_factory=_uuid)
    created_at: datetime = Field(default_factory=_now)


# ─────────────────────────────────────────────────────────────────────────────
# Users, Auth, Sessions
# ─────────────────────────────────────────────────────────────────────────────

Role = Literal[
    "student", "faculty", "adjunct_faculty", "department_chair", "advisor",
    "mentor", "artist", "songwriter", "producer", "engineer",
    "creative_director", "attorney", "publisher", "manager", "agent",
    "employer", "entrepreneur", "guest_lecturer", "researcher",
    "institution_admin", "university_partner", "ancr_admin",
]


class User(BaseDoc):
    user_id: str = Field(default_factory=lambda: f"user_{uuid.uuid4().hex[:12]}")
    email: EmailStr
    name: str
    picture: Optional[str] = None
    ancrid: str = Field(default_factory=lambda: f"ANCRID-{uuid.uuid4().hex[:10].upper()}")
    role: Role = "student"
    roles: List[Role] = Field(default_factory=list)
    verified: bool = False
    institution: Optional[str] = None
    institution_id: Optional[str] = None
    title: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    # Auth
    provider: Literal["emergent_google", "password"] = "password"
    password_hash: Optional[str] = None
    # Professional profile fields (populated for professionals; safe empty for students)
    company: Optional[str] = None
    disciplines: List[str] = Field(default_factory=list)
    expertise: List[str] = Field(default_factory=list)
    awards: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    industries: List[str] = Field(default_factory=list)
    years_experience: Optional[int] = None
    availability: Optional[str] = None
    mentorship_philosophy: Optional[str] = None
    teaching_interests: List[str] = Field(default_factory=list)
    portfolio_links: List[Dict[str, str]] = Field(default_factory=list)
    professional_links: List[Dict[str, str]] = Field(default_factory=list)
    credits: List[Dict[str, Any]] = Field(default_factory=list)
    career_history: List[Dict[str, Any]] = Field(default_factory=list)
    current_projects: List[Dict[str, Any]] = Field(default_factory=list)
    # Student-specific fields
    graduation_year: Optional[int] = None
    program: Optional[str] = None
    cohort_id: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    goals: List[str] = Field(default_factory=list)
    achievements: List[Dict[str, Any]] = Field(default_factory=list)
    career_readiness: Optional[int] = None  # 0-100
    mentor_ids: List[str] = Field(default_factory=list)
    is_alumni: bool = False
    alumni_class: Optional[int] = None
    alumni_role: Optional[str] = None  # current professional role after graduation


class UserPublic(BaseModel):
    """User data safe to expose over API (no password_hash)."""
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    ancrid: str
    role: Role
    roles: List[Role] = []
    verified: bool = False
    institution: Optional[str] = None
    title: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    company: Optional[str] = None
    disciplines: List[str] = []
    expertise: List[str] = []
    awards: List[str] = []
    certifications: List[str] = []
    languages: List[str] = []
    industries: List[str] = []
    years_experience: Optional[int] = None
    availability: Optional[str] = None
    mentorship_philosophy: Optional[str] = None
    teaching_interests: List[str] = []
    portfolio_links: List[Dict[str, str]] = []
    professional_links: List[Dict[str, str]] = []
    credits: List[Dict[str, Any]] = []
    career_history: List[Dict[str, Any]] = []
    current_projects: List[Dict[str, Any]] = []
    graduation_year: Optional[int] = None
    program: Optional[str] = None
    cohort_id: Optional[str] = None
    skills: List[str] = []
    goals: List[str] = []
    achievements: List[Dict[str, Any]] = []
    career_readiness: Optional[int] = None
    mentor_ids: List[str] = []
    is_alumni: bool = False
    alumni_class: Optional[int] = None
    alumni_role: Optional[str] = None


class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uuid)
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=_now)


# ─────────────────────────────────────────────────────────────────────────────
# Domain models
# ─────────────────────────────────────────────────────────────────────────────

class Cohort(BaseDoc):
    name: str
    discipline: str
    program: str
    institution: str
    year: int
    description: str
    faculty_lead_id: Optional[str] = None
    mentor_ids: List[str] = Field(default_factory=list)
    student_ids: List[str] = Field(default_factory=list)
    cover_image: Optional[str] = None
    status: Literal["active", "archived", "upcoming"] = "active"


class Session_(BaseDoc):
    title: str
    kind: Literal[
        "masterclass", "writing_camp", "studio_session", "portfolio_review",
        "office_hours", "critique", "panel", "guest_lecture", "career_coaching",
        "research", "executive_conversation", "artist_development",
    ]
    description: str
    host_id: str
    host_name: str
    co_host_ids: List[str] = Field(default_factory=list)
    cohort_id: Optional[str] = None
    start: datetime
    duration_minutes: int = 60
    location: str = "Virtual"
    meeting_url: Optional[str] = None
    capacity: int = 25
    attendee_ids: List[str] = Field(default_factory=list)
    cover_image: Optional[str] = None
    status: Literal["scheduled", "live", "completed", "cancelled"] = "scheduled"
    tags: List[str] = Field(default_factory=list)


class Review(BaseDoc):
    student_id: str
    reviewer_id: str
    reviewer_name: str
    session_id: Optional[str] = None
    project_id: Optional[str] = None
    scores: Dict[str, int]  # keys: creative_growth, technical_ability, professionalism, communication, leadership, collaboration, innovation, entrepreneurship, industry_readiness (1-10)
    comments: str
    recommendations: str
    growth_plan: str
    published: bool = True


class Opportunity(BaseDoc):
    title: str
    posted_by_id: str
    posted_by_name: str
    company: str
    kind: Literal[
        "internship", "employment", "session_work", "tour", "artist_development",
        "film_project", "research_project", "residency", "publishing",
        "scholarship", "assistant", "freelance", "speaking",
    ]
    description: str
    location: str
    compensation: Optional[str] = None
    deadline: Optional[datetime] = None
    disciplines: List[str] = Field(default_factory=list)
    applicant_ids: List[str] = Field(default_factory=list)
    status: Literal["open", "closed", "filled"] = "open"


class Recommendation(BaseDoc):
    student_id: str
    recommender_id: str
    recommender_name: str
    for_type: Literal[
        "job", "publishing", "label", "manager", "studio", "festival",
        "competition", "graduate_program", "creative_project", "industry_award",
        "speaking",
    ]
    target: str
    narrative: str
    verified: bool = True


class CreativeTeam(BaseDoc):
    name: str
    project: str
    lead_id: str
    lead_name: str
    members: List[Dict[str, Any]]  # [{user_id, name, role, avatar}]
    cohort_id: Optional[str] = None
    description: str
    ancrsync_workspace: Optional[str] = None
    cover_image: Optional[str] = None
    status: Literal["active", "shipped", "archived"] = "active"


class CalendarEvent(BaseDoc):
    title: str
    owner_id: str
    kind: Literal[
        "office_hours", "studio_session", "writing_camp", "creative_review",
        "portfolio_review", "industry_meeting", "capstone", "conference",
        "creative_event", "student_check_in", "institutional_event",
    ]
    start: datetime
    end: datetime
    location: str = "Virtual"
    attendees: List[str] = Field(default_factory=list)
    session_id: Optional[str] = None
    notes: Optional[str] = None


class Message(BaseDoc):
    thread_id: str
    sender_id: str
    sender_name: str
    body: str
    kind: Literal["direct", "group", "announcement", "thread"] = "direct"


class Thread(BaseDoc):
    title: str
    participant_ids: List[str]
    kind: Literal["direct", "group", "announcement"] = "direct"
    last_message: Optional[str] = None
    last_at: datetime = Field(default_factory=_now)


class Resource(BaseDoc):
    title: str
    kind: Literal[
        "template", "contract", "pdf", "video", "masterclass", "course_material",
        "slides", "download", "reference", "exercise",
    ]
    description: str
    uploaded_by_id: str
    uploaded_by_name: str
    url: Optional[str] = None
    cover_image: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    access: Literal["public", "cohort", "private"] = "public"


class Notification(BaseDoc):
    user_id: str
    kind: str  # assignment, portfolio_review, meeting_invite, feedback, opportunity_match, session, recommendation, milestone, event
    title: str
    body: str
    link: Optional[str] = None
    read: bool = False


class AIInsight(BaseDoc):
    user_id: str
    context: str  # e.g. "dashboard", "student_supervision"
    kind: str  # e.g. "portfolio_gap", "matching", "action_items"
    prompt: str
    output: str
    subject_ids: List[str] = Field(default_factory=list)


class Institution(BaseDoc):
    name: str
    short_code: str
    country: str
    programs: List[str] = Field(default_factory=list)
    verified: bool = True
    logo: Optional[str] = None
