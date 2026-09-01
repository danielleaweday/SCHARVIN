"""CCDP institutional lead-capture: storage + branded transactional email (Resend)."""
import os
import csv
import io
import uuid
import asyncio
import logging
import time
from datetime import datetime, timezone
from typing import Optional

import resend
from fastapi import APIRouter, Request, HTTPException, Depends, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr, Field, field_validator

import google_sheets
from auth import get_current_admin

logger = logging.getLogger("ccdp.inquiries")

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "").strip()
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "Danielle Stephens McMillan <danielle@aweday.org>").strip()
INQUIRY_RECIPIENT = os.environ.get("INQUIRY_RECIPIENT", "awe@aweday.org").strip()
SCHEDULING_URL = os.environ.get("SCHEDULING_URL", "").strip()

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

router = APIRouter(prefix="/api")

# ---- naive in-memory rate limiting (per IP) ----
_RATE: dict[str, list[float]] = {}
_RATE_WINDOW = 900  # 15 min
_RATE_MAX = 6


def _rate_limited(ip: str) -> bool:
    now = time.time()
    hits = [t for t in _RATE.get(ip, []) if now - t < _RATE_WINDOW]
    hits.append(now)
    _RATE[ip] = hits
    return len(hits) > _RATE_MAX


class InquiryCreate(BaseModel):
    firstName: str = Field(min_length=1, max_length=80)
    lastName: str = Field(min_length=1, max_length=80)
    organization: str = Field(min_length=1, max_length=160)
    jobTitle: str = Field(min_length=1, max_length=120)
    organizationType: str = Field(min_length=1, max_length=60)
    email: EmailStr
    phone: Optional[str] = Field(default="", max_length=40)
    website: Optional[str] = Field(default="", max_length=200)
    areaOfInterest: str = Field(min_length=1, max_length=120)
    message: str = Field(min_length=1, max_length=4000)
    source: str = Field(default="general", max_length=60)
    requestedDeck: bool = False
    # honeypot — must stay empty
    company: Optional[str] = ""

    @field_validator("firstName", "lastName", "organization", "jobTitle", "message")
    @classmethod
    def _strip(cls, v: str) -> str:
        return v.strip()


RESPONSE_TIME = "Our team will respond within 1&ndash;2 business days."


def _field_row(label: str, value: str) -> str:
    if not value:
        value = "&mdash;"
    return (
        f'<tr>'
        f'<td style="padding:10px 16px;border-bottom:1px solid #ececec;color:#6b7280;'
        f'font-size:12px;text-transform:uppercase;letter-spacing:.06em;width:180px;'
        f'vertical-align:top;">{label}</td>'
        f'<td style="padding:10px 16px;border-bottom:1px solid #ececec;color:#111827;'
        f'font-size:15px;vertical-align:top;">{value}</td>'
        f'</tr>'
    )


def _shell(inner: str) -> str:
    return (
        '<div style="margin:0;padding:0;background:#0b0b0f;">'
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" '
        'style="background:#0b0b0f;padding:32px 0;font-family:Helvetica,Arial,sans-serif;">'
        '<tr><td align="center">'
        '<table role="presentation" width="600" cellpadding="0" cellspacing="0" '
        'style="width:600px;max-width:92%;background:#ffffff;border-radius:16px;overflow:hidden;">'
        '<tr><td style="background:linear-gradient(90deg,#2e7bff,#7a3ff2 55%,#e0349e);'
        'padding:22px 32px;">'
        '<span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:.5px;">CCDP</span>'
        '<span style="color:rgba(255,255,255,.85);font-size:12px;display:block;margin-top:2px;'
        'letter-spacing:.12em;text-transform:uppercase;">Contemporary Creative Development Program</span>'
        '</td></tr>'
        f'{inner}'
        '<tr><td style="padding:20px 32px;background:#f7f7f9;color:#9ca3af;font-size:11px;line-height:1.6;">'
        '&copy; ' + str(datetime.now().year) + ' Contemporary Creative Development Program. All rights reserved.'
        '</td></tr>'
        '</table></td></tr></table></div>'
    )


def internal_email_html(d: InquiryCreate, inquiry_id: str, submitted: str) -> str:
    rows = "".join([
        _field_row("Name", f"{d.firstName} {d.lastName}"),
        _field_row("Organization", d.organization),
        _field_row("Organization Type", d.organizationType),
        _field_row("Job Title", d.jobTitle),
        _field_row("Email", f'<a href="mailto:{d.email}" style="color:#2e7bff;">{d.email}</a>'),
        _field_row("Phone", d.phone or ""),
        _field_row("Website", d.website or ""),
        _field_row("Area of Interest", d.areaOfInterest),
        _field_row("Requested Deck", "Yes" if d.requestedDeck else "No"),
        _field_row("Source CTA", d.source),
        _field_row("Message", d.message.replace("\n", "<br/>")),
        _field_row("Submitted", submitted),
        _field_row("Inquiry ID", inquiry_id),
    ])
    inner = (
        '<tr><td style="padding:28px 32px 8px;">'
        '<h1 style="margin:0;color:#111827;font-size:20px;">New Partnership Inquiry</h1>'
        '<p style="margin:8px 0 0;color:#6b7280;font-size:14px;">'
        'A new inquiry was submitted through the CCDP institutional platform.</p>'
        '</td></tr>'
        '<tr><td style="padding:12px 20px 28px;">'
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" '
        'style="border:1px solid #ececec;border-radius:12px;overflow:hidden;">'
        f'{rows}</table></td></tr>'
    )
    return _shell(inner)


def confirmation_email_html(d: InquiryCreate) -> str:
    deck_block = ""
    if d.requestedDeck:
        deck_block = (
            '<tr><td style="padding:0 32px 8px;">'
            '<div style="background:#f4f0ff;border:1px solid #e4d8ff;border-radius:12px;'
            'padding:16px 18px;color:#4a2a8a;font-size:14px;line-height:1.6;">'
            '<strong>About the Partnership Deck.</strong> Because our institutional materials '
            'are customized for prospective partners, investors, and higher education institutions, '
            'the Partnership Deck will be shared directly following our review of your inquiry.'
            '</div></td></tr>'
        )
    inner = (
        '<tr><td style="padding:30px 32px 6px;">'
        f'<h1 style="margin:0;color:#111827;font-size:22px;">Thank you, {d.firstName}.</h1>'
        '</td></tr>'
        '<tr><td style="padding:8px 32px 4px;color:#374151;font-size:15px;line-height:1.7;">'
        'Thank you for your interest in the Contemporary Creative Development Program. '
        f'We have received your inquiry regarding <strong>{d.areaOfInterest}</strong> '
        f'on behalf of <strong>{d.organization}</strong>.'
        '</td></tr>'
        f'<tr><td style="padding:8px 32px 8px;color:#374151;font-size:15px;line-height:1.7;">{RESPONSE_TIME}</td></tr>'
        f'{deck_block}'
        '<tr><td style="padding:18px 32px 30px;border-top:1px solid #ececec;">'
        '<p style="margin:0;color:#111827;font-size:15px;font-weight:700;">Danielle Stephens McMillan</p>'
        '<p style="margin:2px 0 0;color:#6b7280;font-size:13px;">Founder &amp; Executive Director</p>'
        '<p style="margin:2px 0 0;color:#6b7280;font-size:13px;">Contemporary Creative Development Program</p>'
        '<p style="margin:6px 0 0;font-size:13px;">'
        '<a href="mailto:danielle@aweday.org" style="color:#2e7bff;">danielle@aweday.org</a></p>'
        '</td></tr>'
    )
    return _shell(inner)


async def _send(to: str, subject: str, html: str) -> Optional[str]:
    if not RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set — skipping email to %s (%s)", to, subject)
        return None
    params = {"from": SENDER_EMAIL, "to": [to], "subject": subject, "html": html}
    if to != INQUIRY_RECIPIENT:
        params["reply_to"] = INQUIRY_RECIPIENT
    try:
        res = await asyncio.to_thread(resend.Emails.send, params)
        return res.get("id") if isinstance(res, dict) else None
    except Exception as e:  # noqa: BLE001
        logger.error("Resend send failed to %s: %s", to, e)
        return None


def register_inquiry_routes(db):
    @router.get("/config")
    async def get_config():
        return {"schedulingUrl": SCHEDULING_URL, "emailEnabled": bool(RESEND_API_KEY)}

    @router.post("/inquiries")
    async def create_inquiry(payload: InquiryCreate, request: Request):
        # honeypot: silently accept bots without storing/emailing
        if payload.company:
            return {"status": "success", "id": "ok"}

        ip = (request.headers.get("x-forwarded-for", "").split(",")[0].strip()
              or (request.client.host if request.client else "unknown"))
        if _rate_limited(ip):
            raise HTTPException(status_code=429, detail="Too many requests. Please try again shortly.")

        inquiry_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        submitted = now.strftime("%b %d, %Y at %I:%M %p UTC")

        doc = payload.model_dump()
        doc.pop("company", None)
        doc["id"] = inquiry_id
        doc["created_at"] = now.isoformat()
        doc["ip"] = ip
        # CRM fields
        doc["status"] = "New"
        doc["assignedTo"] = ""
        doc["internalNotes"] = ""
        doc["lastContactedDate"] = None
        doc["nextFollowUpDate"] = None
        doc["email_status"] = "pending"

        # Upsert by email so repeat engagement updates the same lead (CRM behavior)
        existing = await db.inquiries.find_one({"email": payload.email})
        if existing:
            doc["id"] = existing["id"]
            doc["created_at"] = existing.get("created_at", now.isoformat())
            doc["status"] = existing.get("status", "New")
            doc["assignedTo"] = existing.get("assignedTo", "")
            doc["internalNotes"] = existing.get("internalNotes", "")
            doc["lastContactedDate"] = existing.get("lastContactedDate")
            doc["nextFollowUpDate"] = existing.get("nextFollowUpDate")
            doc["updated_at"] = now.isoformat()
            await db.inquiries.update_one({"id": existing["id"]}, {"$set": doc})
            inquiry_id = existing["id"]
        else:
            await db.inquiries.insert_one(doc)

        internal_id = await _send(
            INQUIRY_RECIPIENT,
            f"New CCDP Partnership Inquiry — {payload.organization}",
            internal_email_html(payload, inquiry_id, submitted),
        )
        confirm_id = await _send(
            payload.email,
            "Thank You for Contacting CCDP",
            confirmation_email_html(payload),
        )
        email_status = "sent" if (internal_id or confirm_id) else ("skipped" if not RESEND_API_KEY else "failed")
        await db.inquiries.update_one(
            {"id": inquiry_id},
            {"$set": {"email_status": email_status,
                      "internal_email_id": internal_id,
                      "confirmation_email_id": confirm_id}},
        )

        synced_doc = await db.inquiries.find_one({"id": inquiry_id}, {"_id": 0})
        if synced_doc:
            asyncio.create_task(google_sheets.upsert(synced_doc))

        return {"status": "success", "id": inquiry_id, "requestedDeck": payload.requestedDeck}

    # ---------- Admin CRM endpoints ----------
    STATUSES = ["New", "Contacted", "Meeting Scheduled", "Proposal Sent", "Closed"]

    async def _filtered(search, status, institutionType, date_from, date_to, limit=200, skip=0):
        q = {}
        if status:
            q["status"] = status
        if institutionType:
            q["organizationType"] = institutionType
        if search:
            rx = {"$regex": search, "$options": "i"}
            q["$or"] = [{"organization": rx}, {"firstName": rx}, {"lastName": rx}, {"email": rx}]
        if date_from or date_to:
            rng = {}
            if date_from:
                rng["$gte"] = date_from
            if date_to:
                rng["$lte"] = date_to + "T23:59:59"
            q["created_at"] = rng
        docs = await db.inquiries.find(q, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
        return docs

    @router.get("/admin/inquiries")
    async def admin_list(
        admin: dict = Depends(get_current_admin),
        search: Optional[str] = None,
        status: Optional[str] = None,
        institutionType: Optional[str] = None,
        date_from: Optional[str] = Query(None),
        date_to: Optional[str] = Query(None),
        limit: int = Query(200, ge=1, le=500),
        skip: int = Query(0, ge=0),
    ):
        docs = await _filtered(search, status, institutionType, date_from, date_to, limit=limit, skip=skip)
        total = await db.inquiries.count_documents({})
        by_status = {}
        for s in STATUSES:
            by_status[s] = await db.inquiries.count_documents({"status": s})
        return {"inquiries": docs, "total": total, "byStatus": by_status,
                "statuses": STATUSES, "sheetsEnabled": google_sheets.is_configured()}

    class InquiryUpdate(BaseModel):
        status: Optional[str] = None
        assignedTo: Optional[str] = None
        internalNotes: Optional[str] = None
        lastContactedDate: Optional[str] = None
        nextFollowUpDate: Optional[str] = None

    @router.patch("/admin/inquiries/{inquiry_id}")
    async def admin_update(inquiry_id: str, body: InquiryUpdate, admin: dict = Depends(get_current_admin)):
        updates = {k: v for k, v in body.model_dump().items() if v is not None}
        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")
        updates["updated_at"] = datetime.now(timezone.utc).isoformat()
        res = await db.inquiries.update_one({"id": inquiry_id}, {"$set": updates})
        if res.matched_count == 0:
            raise HTTPException(status_code=404, detail="Inquiry not found")
        doc = await db.inquiries.find_one({"id": inquiry_id}, {"_id": 0})
        asyncio.create_task(google_sheets.upsert(doc))
        return doc

    @router.get("/admin/inquiries/export")
    async def admin_export(
        admin: dict = Depends(get_current_admin),
        search: Optional[str] = None,
        status: Optional[str] = None,
        institutionType: Optional[str] = None,
        date_from: Optional[str] = Query(None),
        date_to: Optional[str] = Query(None),
    ):
        docs = await _filtered(search, status, institutionType, date_from, date_to, limit=5000)
        buf = io.StringIO()
        writer = csv.writer(buf)
        writer.writerow(google_sheets.HEADERS)
        for d in docs:
            writer.writerow([
                d.get("id", ""), d.get("created_at", ""), d.get("organization", ""),
                f'{d.get("firstName","")} {d.get("lastName","")}'.strip(), d.get("jobTitle", ""),
                d.get("email", ""), d.get("phone", ""), d.get("organizationType", ""),
                d.get("areaOfInterest", ""), "Yes" if d.get("requestedDeck") else "No",
                d.get("source", ""), d.get("message", ""), d.get("status", "New"),
                d.get("assignedTo", ""), d.get("internalNotes", ""),
                d.get("lastContactedDate") or "", d.get("nextFollowUpDate") or "",
            ])
        buf.seek(0)
        fname = f"ccdp-inquiries-{datetime.now().strftime('%Y%m%d')}.csv"
        return StreamingResponse(iter([buf.getvalue()]), media_type="text/csv",
                                 headers={"Content-Disposition": f"attachment; filename={fname}"})

    return router
