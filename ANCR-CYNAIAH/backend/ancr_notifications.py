"""ANCR-integration-ready notifications adapter.

Design goal
-----------
CYNAIAH ships with **local** in-app notifications today, but every notification
is authored in a canonical envelope shape that the future ANCR notification
bus can consume unchanged. When ANCR turns on, flip
`ANCR_NOTIFICATIONS_ENABLED=true` in the backend env and register an
`AncrBusSink` implementation — the rest of the app doesn't have to change.

The envelope
------------
    {
      "event_type": "review.written",
      "actor":     {"user_id": "...", "name": "...", "ancrid": null},
      "recipient": {"user_id": "...", "ancrid": null},
      "subject":   {"kind": "project", "id": "...", "title": "..."},
      "payload":   { ...event specific... },
      "deep_link": "/reviews?project=...&review=...",
      "channels": [
        {"name": "in_app",   "status": "delivered", "delivered_at": "..."},
        {"name": "ancr_bus", "status": "pending",   "delivered_at": null}
      ],
      "ancr_ready": true,
      "ancr_emitted_at": null,
      "created_at": "..."
    }

The single source of truth remains the immutable review row.  A dispatch
failure here never blocks the review insert (caller wraps this in try/except).

Link registry
-------------
All deep_link patterns emitted by CYNAIAH must appear in `LINK_REGISTRY`.
`resolve_deep_link` validates a link against the registry so ANCR (and the
tests) can be sure every link maps to a real route.
"""
from __future__ import annotations

import os
import re
from dataclasses import dataclass
from typing import Awaitable, Callable, Optional
from urllib.parse import parse_qs, urlparse

# ---------- Env flag ----------
ANCR_NOTIFICATIONS_ENABLED = (
    os.environ.get("ANCR_NOTIFICATIONS_ENABLED", "false").lower() == "true"
)

# ---------- Canonical event catalog ----------
EVENT_REVIEW_WRITTEN = "review.written"
EVENT_REVIEW_TIME_CODED = "review.time_coded"
EVENT_REVIEW_COVERAGE_RESPONSE = "review.coverage_response"
EVENT_REVIEW_RUBRIC = "review.rubric"
EVENT_REVIEW_STATUS = "review.status"
EVENT_REVIEW_FRAME_FEEDBACK = "review.frame_feedback"

REVIEW_KIND_TO_EVENT = {
    "written": EVENT_REVIEW_WRITTEN,
    "time_coded": EVENT_REVIEW_TIME_CODED,
    "coverage_response": EVENT_REVIEW_COVERAGE_RESPONSE,
    "rubric": EVENT_REVIEW_RUBRIC,
    "status": EVENT_REVIEW_STATUS,
    "frame_feedback": EVENT_REVIEW_FRAME_FEEDBACK,
}

# ---------- Deep-link registry ----------
# path_pattern is matched against the pathname (query is validated separately).
# required_query lists parameter names that must be present.
LINK_REGISTRY = [
    {
        "id": "reviews.event",
        "path_pattern": r"^/reviews$",
        "required_query": ["project", "review"],
        "description": "Student inbox scrolled + highlighted to a specific review event.",
    },
    {
        "id": "reviews.project",
        "path_pattern": r"^/reviews$",
        "required_query": ["project"],
        "description": "Student inbox opened to a specific project.",
    },
    {
        "id": "faculty.project",
        "path_pattern": r"^/faculty/projects/[a-zA-Z0-9_-]+$",
        "required_query": [],
        "description": "Faculty deep-dive review workspace for a specific project.",
    },
    {
        "id": "faculty.dashboard",
        "path_pattern": r"^/faculty$",
        "required_query": [],
        "description": "Faculty dashboard with the assigned productions grid.",
    },
    {
        "id": "project.command_center",
        "path_pattern": r"^/projects/[a-zA-Z0-9_-]+$",
        "required_query": [],
        "description": "Project command centre for the owning student.",
    },
    {
        "id": "storyboard.frame",
        "path_pattern": r"^/story-lab$",
        "required_query": ["project", "frame"],
        "description": "Story Lab opened to a project and scrolled to a specific storyboard frame with a highlight.",
    },
]


def resolve_deep_link(deep_link: str) -> Optional[dict]:
    """Return the matched registry entry, or None if the link is not registered."""
    if not deep_link or not isinstance(deep_link, str):
        return None
    if not deep_link.startswith("/"):
        return None
    parsed = urlparse(deep_link)
    path = parsed.path
    query = parse_qs(parsed.query)
    for entry in LINK_REGISTRY:
        if not re.match(entry["path_pattern"], path):
            continue
        missing = [k for k in entry["required_query"] if k not in query or not query[k]]
        if missing:
            continue
        return entry
    return None


# ---------- Sink protocol ----------
@dataclass
class ChannelResult:
    name: str
    status: str  # "delivered" | "pending" | "failed" | "not_configured"
    delivered_at: Optional[str] = None
    detail: Optional[str] = None

    def as_dict(self) -> dict:
        return {
            "name": self.name,
            "status": self.status,
            "delivered_at": self.delivered_at,
            "detail": self.detail,
        }


class LocalBellSink:
    """Writes the envelope to `db.notifications` so the in-app bell popover picks it up.

    Kept as a thin wrapper — the caller supplies the mongo insert function so
    we don't couple this module to the FastAPI app or the specific driver.
    """

    name = "in_app"

    def __init__(self, insert_fn: Callable[[dict], Awaitable[None]]):
        self._insert = insert_fn

    async def send(self, envelope: dict, notification_doc: dict) -> ChannelResult:
        await self._insert(notification_doc)
        return ChannelResult(
            name=self.name,
            status="delivered",
            delivered_at=notification_doc.get("created_at"),
        )


class AncrBusSink:
    """Placeholder for the external ANCR notification bus.

    When ANCR ships, replace `send` with a real HTTP/queue call. Until then we
    record the intent so tests and dashboards can see the pending outbound
    delivery. Never raises — a downstream outage must not block local delivery.
    """

    name = "ancr_bus"

    def __init__(self, enabled: bool):
        self.enabled = enabled

    async def send(self, envelope: dict, notification_doc: dict) -> ChannelResult:
        if not self.enabled:
            return ChannelResult(
                name=self.name,
                status="not_configured",
                delivered_at=None,
                detail="ANCR_NOTIFICATIONS_ENABLED is false. Envelope kept locally as ANCR-ready.",
            )
        # When wired, this would await an HTTP POST or queue publish.
        return ChannelResult(
            name=self.name,
            status="pending",
            delivered_at=None,
            detail="Queued for the ANCR notification bus.",
        )


class Dispatcher:
    def __init__(self, sinks: list):
        self.sinks = sinks

    async def dispatch(self, envelope: dict, notification_doc: dict) -> list[dict]:
        results: list[dict] = []
        for sink in self.sinks:
            try:
                res = await sink.send(envelope, notification_doc)
            except Exception as exc:  # noqa: BLE001
                res = ChannelResult(
                    name=getattr(sink, "name", "unknown"),
                    status="failed",
                    detail=str(exc)[:200],
                )
            results.append(res.as_dict())
        return results
