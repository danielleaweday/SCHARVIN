"""Pydantic models for ANCRLaunch™.

Schemas mirror the ANCR ecosystem — the same shapes live services will
return. Every persistent id is a UUID string (never ObjectId) so JSON
serialization is trivial.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

ROLES = Literal[
    "student",
    "graduate",
    "faculty",
    "career_services",
    "employer",
    "recruiter",
    "industry_partner",
    "administrator",
]


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _uuid() -> str:
    return str(uuid.uuid4())


class ANCRIDUser(BaseModel):
    """ANCRID™ identity record consumed by every module."""
    model_config = ConfigDict(extra="ignore")

    ancrid: str = Field(default_factory=lambda: f"ANCR-{uuid.uuid4().hex[:10].upper()}")
    email: EmailStr
    full_name: str
    role: ROLES
    password_hash: str
    discipline: Optional[str] = None
    institution: Optional[str] = None
    country: Optional[str] = None
    graduation_year: Optional[int] = None
    biography: Optional[str] = None
    avatar_url: Optional[str] = None
    company: Optional[str] = None
    verified: bool = True
    created_at: str = Field(default_factory=_now)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    token: str
    user: Dict[str, Any]


class ResumeSection(BaseModel):
    id: str = Field(default_factory=_uuid)
    heading: str
    body: str


class Resume(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uuid)
    ancrid: str
    professional_summary: str = ""
    career_objective: str = ""
    skills: List[str] = Field(default_factory=list)
    employment: List[Dict[str, Any]] = Field(default_factory=list)
    education: List[Dict[str, Any]] = Field(default_factory=list)
    awards: List[Dict[str, Any]] = Field(default_factory=list)
    updated_at: str = Field(default_factory=_now)


class ResumeUpdate(BaseModel):
    professional_summary: Optional[str] = None
    career_objective: Optional[str] = None
    skills: Optional[List[str]] = None
    employment: Optional[List[Dict[str, Any]]] = None
    education: Optional[List[Dict[str, Any]]] = None
    awards: Optional[List[Dict[str, Any]]] = None


class Opportunity(BaseModel):
    """Unified schema for jobs, internships, auditions, and projects."""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uuid)
    kind: Literal["job", "internship", "audition", "project"]
    category: str
    title: str
    employer: str
    employer_id: Optional[str] = None
    location: str
    country: str
    remote: bool = False
    compensation: Optional[str] = None
    discipline: str
    summary: str
    tags: List[str] = Field(default_factory=list)
    posted_at: str = Field(default_factory=_now)
    closes_at: Optional[str] = None
    featured: bool = False


class Employer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uuid)
    ancrid: Optional[str] = None
    name: str
    industry: str
    country: str
    website: Optional[str] = None
    logo: Optional[str] = None
    about: str = ""
    verified: bool = True


class Application(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uuid)
    ancrid: str
    opportunity_id: str
    opportunity_title: str
    employer: str
    stage: Literal["applied", "interview", "offer", "accepted", "declined", "archived"] = "applied"
    note: str = ""
    applied_at: str = Field(default_factory=_now)
    updated_at: str = Field(default_factory=_now)


class ApplicationCreate(BaseModel):
    opportunity_id: str
    note: str = ""


class ApplicationStageUpdate(BaseModel):
    stage: Literal["applied", "interview", "offer", "accepted", "declined", "archived"]


class Interview(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uuid)
    ancrid: str
    application_id: Optional[str] = None
    employer: str
    role: str
    when: str
    meeting_link: str = ""
    prep_notes: str = ""
    follow_up: str = ""
    status: Literal["scheduled", "completed", "cancelled"] = "scheduled"


class GraduateOutcome(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uuid)
    ancrid: str
    creator_name: str
    institution: str
    discipline: str
    outcome_type: Literal[
        "employment",
        "publishing_deal",
        "management",
        "graduate_school",
        "entrepreneurship",
        "touring",
        "creative_business",
    ]
    headline: str
    detail: str
    year: int


class CoachMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uuid)
    session_id: str
    ancrid: str
    role: Literal["user", "assistant"]
    content: str
    created_at: str = Field(default_factory=_now)


class CoachSendRequest(BaseModel):
    session_id: Optional[str] = None
    message: str


class CandidateFilter(BaseModel):
    discipline: Optional[str] = None
    country: Optional[str] = None
    institution: Optional[str] = None
    graduation_year: Optional[int] = None
    min_readiness: Optional[int] = None
    availability: Optional[str] = None
