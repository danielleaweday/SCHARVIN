"""CCDP × ANCR store — branded transactional email (Resend).

Gated on RESEND_API_KEY: if the key is absent, sends are skipped gracefully (the flow
never breaks) and auto-activate the moment the key is added. Reuses the same Resend
account/sender as the institutional inquiry emails.
"""
import os
import asyncio
import logging
from datetime import datetime

import resend

logger = logging.getLogger("ccdp.store.email")

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "").strip()
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "CCDP powered by ANCR <awe@aweday.org>").strip()
REPLY_TO = os.environ.get("INQUIRY_RECIPIENT", "awe@aweday.org").strip()

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY


def is_enabled() -> bool:
    return bool(RESEND_API_KEY)


def _money(n) -> str:
    try:
        return "${:,.2f}".format(float(n or 0))
    except Exception:
        return "$0.00"


def _shell(inner: str) -> str:
    return (
        '<div style="margin:0;padding:0;background:#0a0a0b;">'
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" '
        'style="background:#0a0a0b;padding:32px 0;font-family:Helvetica,Arial,sans-serif;">'
        '<tr><td align="center">'
        '<table role="presentation" width="600" cellpadding="0" cellspacing="0" '
        'style="width:600px;max-width:92%;background:#141417;border-radius:18px;overflow:hidden;'
        'border:1px solid rgba(255,255,255,.08);">'
        '<tr><td style="background:linear-gradient(90deg,#2e7bff,#7a3ff2 50%,#e0349e 78%,#f5a524);'
        'padding:24px 32px;">'
        '<span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:.5px;">CCDP</span>'
        '<span style="color:rgba(255,255,255,.9);font-size:12px;display:block;margin-top:3px;'
        'letter-spacing:.14em;text-transform:uppercase;">Powered by ANCR</span>'
        '</td></tr>'
        f'{inner}'
        '<tr><td style="padding:22px 32px;background:#0f0f12;color:#8a8a92;font-size:12px;line-height:1.7;">'
        '<a href="https://ccdpbyancr.com" style="color:#9ab6ff;text-decoration:none;">CCDPbyANCR.com</a>'
        '&nbsp;&nbsp;·&nbsp;&nbsp;'
        '<a href="https://aweday.org" style="color:#9ab6ff;text-decoration:none;">AweDay.org</a>'
        '&nbsp;&nbsp;·&nbsp;&nbsp;'
        '<a href="mailto:awe@aweday.org" style="color:#9ab6ff;text-decoration:none;">awe@aweday.org</a>'
        '<br/><span style="color:#5a5a62;">&copy; ' + str(datetime.now().year) +
        ' Awe Day Creative Arts, Inc. · CCDP powered by ANCR. All rights reserved.</span>'
        '</td></tr>'
        '</table></td></tr></table></div>'
    )


def _lead(title: str, body: str) -> str:
    return (
        '<tr><td style="padding:30px 32px 6px;">'
        f'<h1 style="margin:0;color:#f4f1ea;font-size:22px;">{title}</h1></td></tr>'
        f'<tr><td style="padding:8px 32px 6px;color:#c9c6bf;font-size:15px;line-height:1.7;">{body}</td></tr>'
    )


def _order_rows(order: dict) -> str:
    rows = ""
    for it in order.get("items", []):
        rows += (
            '<tr>'
            f'<td style="padding:10px 0;color:#e7e4dd;font-size:14px;">{it.get("name","")}'
            f'<span style="color:#8a8a92;"> · {it.get("size","")} × {it.get("quantity",1)}</span></td>'
            f'<td style="padding:10px 0;color:#e7e4dd;font-size:14px;text-align:right;">'
            f'{_money(it.get("unitPrice",0)*it.get("quantity",1))}</td>'
            '</tr>'
        )
    total = order.get("amount_total") or order.get("amount_subtotal") or 0
    rows += (
        '<tr><td colspan="2" style="border-top:1px solid rgba(255,255,255,.1);padding-top:12px;"></td></tr>'
        '<tr>'
        '<td style="color:#f4f1ea;font-size:15px;font-weight:700;">Total</td>'
        f'<td style="color:#f4f1ea;font-size:15px;font-weight:700;text-align:right;">{_money(total)}</td>'
        '</tr>'
    )
    return (
        '<tr><td style="padding:14px 32px 26px;">'
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">'
        f'{rows}</table></td></tr>'
    )


# ---------- Templates ----------
def welcome_html(name: str) -> str:
    inner = _lead(
        f"Welcome, {name or 'creator'}.",
        "Your CCDP powered by ANCR store account is ready. Explore the collections, save your "
        "favorites, and track every order in one place.",
    ) + (
        '<tr><td style="padding:10px 32px 30px;">'
        '<a href="https://ccdpbyancr.com" style="display:inline-block;background:linear-gradient(90deg,#2e7bff,#7a3ff2,#e0349e);'
        'color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 26px;border-radius:999px;">Browse the Store</a>'
        '</td></tr>'
    )
    return _shell(inner)


def order_confirmation_html(order: dict) -> str:
    name = (order.get("shipping") or {}).get("name") or "there"
    inner = _lead(
        "Thank you for your order!",
        f"Hi {name}, we've received your order <strong>{order.get('order_id','')}</strong> and payment. "
        "Here's your receipt — we'll email you again when it ships.",
    ) + _order_rows(order)
    return _shell(inner)


def shipping_html(order: dict, tracking: str) -> str:
    track_block = ""
    if tracking:
        track_block = (
            '<tr><td style="padding:0 32px 8px;color:#c9c6bf;font-size:14px;">'
            f'Tracking number: <strong style="color:#f4f1ea;">{tracking}</strong></td></tr>'
        )
    inner = _lead(
        "Your order is on its way.",
        f"Good news — order <strong>{order.get('order_id','')}</strong> has shipped.",
    ) + track_block + _order_rows(order)
    return _shell(inner)


def delivery_html(order: dict) -> str:
    inner = _lead(
        "Your order has been delivered.",
        f"Order <strong>{order.get('order_id','')}</strong> has been delivered. We hope you love it — "
        "share it with #CCDPbyANCR.",
    )
    return _shell(inner)


def status_html(order: dict, status: str) -> str:
    inner = _lead(
        "Order status update.",
        f"Your order <strong>{order.get('order_id','')}</strong> status is now "
        f"<strong style=\"color:#f4f1ea;\">{status}</strong>.",
    )
    return _shell(inner)


def waitlist_html(name: str) -> str:
    inner = _lead(
        f"You're on the list, {name or 'creator'}.",
        "Thank you for joining the ANCR Shop waitlist. You'll be among the first to know when our "
        "inaugural collections launch — with exclusive releases, limited editions, and early access.",
    ) + (
        '<tr><td style="padding:10px 32px 30px;">'
        '<a href="https://ccdpbyancr.com" style="display:inline-block;background:linear-gradient(90deg,#2e7bff,#7a3ff2,#e0349e);'
        'color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 26px;border-radius:999px;">Explore the Ecosystem</a>'
        '</td></tr>'
    )
    return _shell(inner)


def password_reset_html(reset_url: str) -> str:
    inner = _lead(
        "Reset your password.",
        "We received a request to reset your CCDP powered by ANCR store password. "
        "This link expires in 60 minutes. If you didn't request this, you can safely ignore it.",
    ) + (
        '<tr><td style="padding:10px 32px 30px;">'
        f'<a href="{reset_url}" style="display:inline-block;background:linear-gradient(90deg,#2e7bff,#7a3ff2,#e0349e);'
        'color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 26px;border-radius:999px;">Reset Password</a>'
        '</td></tr>'
    )
    return _shell(inner)


async def send(to: str, subject: str, html: str):
    if not RESEND_API_KEY:
        logger.info("RESEND_API_KEY not set — skipping store email to %s (%s)", to, subject)
        return None
    params = {"from": SENDER_EMAIL, "to": [to], "subject": subject, "html": html, "reply_to": REPLY_TO}
    try:
        res = await asyncio.to_thread(resend.Emails.send, params)
        return res.get("id") if isinstance(res, dict) else None
    except Exception as e:  # noqa: BLE001
        logger.error("Store email send failed to %s: %s", to, e)
        return None
