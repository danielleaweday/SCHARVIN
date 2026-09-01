"""COHEIR™ interchangeable meeting/calendar provider registry.

Provider integrations are architected as pluggable adapters so any of the
supported providers can be swapped in without changing session/calendar code:

Video providers: zoom, google_meet, microsoft_teams, cisco_webex, riverside,
streamyard, ancr_video.

Calendar providers: google, outlook, apple, calendly, university.

In v1 all providers are surfaced with beautiful "Connect" placeholder cards.
Once the user provides API keys via environment or an admin flow, the adapter
implementation can be swapped in and the rest of the system remains unchanged.
"""
from __future__ import annotations
import os
import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from auth import current_user
from models import UserPublic

router = APIRouter(prefix="/providers", tags=["providers"])


VIDEO_PROVIDERS = [
    {"id": "zoom", "name": "Zoom",
     "description": "Server-to-Server OAuth. Programmatic meeting creation & recording.",
     "env_vars": ["ZOOM_ACCOUNT_ID", "ZOOM_CLIENT_ID", "ZOOM_CLIENT_SECRET"], "color": "#2D8CFF"},
    {"id": "google_meet", "name": "Google Meet",
     "description": "Meetings auto-created via Google Calendar events.",
     "env_vars": ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"], "color": "#00897B"},
    {"id": "microsoft_teams", "name": "Microsoft Teams",
     "description": "MS Graph API. Enterprise-grade for institution rollouts.",
     "env_vars": ["MS_TENANT_ID", "MS_CLIENT_ID", "MS_CLIENT_SECRET"], "color": "#6264A7"},
    {"id": "cisco_webex", "name": "Cisco Webex",
     "description": "Higher-ed friendly video conferencing.",
     "env_vars": ["WEBEX_CLIENT_ID", "WEBEX_CLIENT_SECRET"], "color": "#00BCEB"},
    {"id": "riverside", "name": "Riverside",
     "description": "Studio-grade recording for masterclasses & podcasts.",
     "env_vars": ["RIVERSIDE_API_KEY"], "color": "#4C1D95"},
    {"id": "streamyard", "name": "StreamYard",
     "description": "Multi-destination live streaming for showcases & panels.",
     "env_vars": ["STREAMYARD_API_KEY"], "color": "#F97316"},
    {"id": "ancr_video", "name": "ANCR Video™",
     "description": "Coming soon. Native ANCR video engine with ANCRSync integration.",
     "env_vars": [], "color": "#00F0FF", "future": True},
]

CALENDAR_PROVIDERS = [
    {"id": "google", "name": "Google Calendar",
     "description": "Two-way sync with a user's Google Calendar.",
     "env_vars": ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"], "color": "#4285F4"},
    {"id": "outlook", "name": "Outlook Calendar",
     "description": "Enterprise Microsoft 365 calendar sync.",
     "env_vars": ["MS_TENANT_ID", "MS_CLIENT_ID", "MS_CLIENT_SECRET"], "color": "#0078D4"},
    {"id": "apple", "name": "Apple Calendar",
     "description": "CalDAV-based sync via app-specific passwords.",
     "env_vars": ["APPLE_CALDAV_URL"], "color": "#A2AAAD"},
    {"id": "calendly", "name": "Calendly",
     "description": "Popular booking layer for professionals.",
     "env_vars": ["CALENDLY_API_KEY"], "color": "#006BFF"},
    {"id": "university", "name": "University Scheduling",
     "description": "Institution-specific scheduling (Ellucian, PeopleSoft, etc.).",
     "env_vars": ["UNIVERSITY_SIS_URL", "UNIVERSITY_SIS_KEY"], "color": "#8B5CF6", "future": True},
]


def _is_connected(env_vars: list[str]) -> bool:
    return all(os.environ.get(v) for v in env_vars) if env_vars else False


@router.get("/video")
async def list_video_providers(user: UserPublic = Depends(current_user)):
    return [
        {**p, "connected": _is_connected(p["env_vars"])}
        for p in VIDEO_PROVIDERS
    ]


@router.get("/calendar")
async def list_calendar_providers(user: UserPublic = Depends(current_user)):
    return [
        {**p, "connected": _is_connected(p["env_vars"])}
        for p in CALENDAR_PROVIDERS
    ]


class ConnectionRequest(BaseModel):
    provider_id: str
    kind: str  # "video" | "calendar"
    email_note: Optional[str] = None


@router.post("/request-connection")
async def request_connection(body: ConnectionRequest, request: Request,
                             user: UserPublic = Depends(current_user)):
    """Log a connection request. In v1 this notifies the ANCR admin to provision credentials."""
    db = request.app.state.db
    doc = {
        "id": uuid.uuid4().hex,
        "user_id": user.user_id,
        "user_name": user.name,
        "provider_id": body.provider_id,
        "kind": body.kind,
        "note": body.email_note,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.provider_requests.insert_one(doc.copy())
    doc.pop("_id", None)
    return doc


class ProviderPreference(BaseModel):
    video_provider: Optional[str] = None
    calendar_provider: Optional[str] = None


@router.post("/preferences")
async def set_preferences(body: ProviderPreference, request: Request,
                          user: UserPublic = Depends(current_user)):
    db = request.app.state.db
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if updates:
        await db.users.update_one({"user_id": user.user_id}, {"$set": {"provider_prefs": updates}})
    return {"ok": True, "prefs": updates}
