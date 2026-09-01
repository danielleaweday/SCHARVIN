"""Google Sheets live backup via a service account. Gracefully no-ops until configured."""
import os
import json
import asyncio
import logging

logger = logging.getLogger("ccdp.sheets")

SHEET_ID = os.environ.get("GOOGLE_SHEET_ID", "").strip()
SHEET_TAB = os.environ.get("GOOGLE_SHEET_TAB", "Inquiries").strip() or "Inquiries"
_SA_RAW = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON", "").strip()
_SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

HEADERS = [
    "Inquiry ID", "Date Submitted", "Organization", "Contact Name", "Job Title",
    "Email", "Phone", "Institution Type", "Interest Type", "Requested Deck",
    "Source", "Message", "Status", "Assigned To", "Internal Notes",
    "Last Contacted", "Next Follow Up",
]


def is_configured() -> bool:
    return bool(SHEET_ID and _SA_RAW)


def _row(doc: dict) -> list:
    return [
        doc.get("id", ""), doc.get("created_at", ""), doc.get("organization", ""),
        f'{doc.get("firstName","")} {doc.get("lastName","")}'.strip(), doc.get("jobTitle", ""),
        doc.get("email", ""), doc.get("phone", ""), doc.get("organizationType", ""),
        doc.get("areaOfInterest", ""), "Yes" if doc.get("requestedDeck") else "No",
        doc.get("source", ""), doc.get("message", ""), doc.get("status", "New"),
        doc.get("assignedTo", ""), doc.get("internalNotes", ""),
        doc.get("lastContactedDate", "") or "", doc.get("nextFollowUpDate", "") or "",
    ]


def _service():
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    info = json.loads(_SA_RAW)
    creds = service_account.Credentials.from_service_account_info(info, scopes=_SCOPES)
    return build("sheets", "v4", credentials=creds, cache_discovery=False)


def _ensure_headers(svc):
    got = svc.spreadsheets().values().get(
        spreadsheetId=SHEET_ID, range=f"{SHEET_TAB}!A1:Q1").execute()
    if not got.get("values"):
        svc.spreadsheets().values().update(
            spreadsheetId=SHEET_ID, range=f"{SHEET_TAB}!A1",
            valueInputOption="RAW", body={"values": [HEADERS]}).execute()


def _find_row(svc, inquiry_id: str):
    got = svc.spreadsheets().values().get(
        spreadsheetId=SHEET_ID, range=f"{SHEET_TAB}!A2:A").execute()
    for i, r in enumerate(got.get("values", []), start=2):
        if r and r[0] == inquiry_id:
            return i
    return None


def _upsert_sync(doc: dict):
    svc = _service()
    _ensure_headers(svc)
    row = _row(doc)
    existing = _find_row(svc, doc.get("id", ""))
    if existing:
        svc.spreadsheets().values().update(
            spreadsheetId=SHEET_ID, range=f"{SHEET_TAB}!A{existing}",
            valueInputOption="RAW", body={"values": [row]}).execute()
    else:
        svc.spreadsheets().values().append(
            spreadsheetId=SHEET_ID, range=f"{SHEET_TAB}!A1",
            valueInputOption="RAW", insertDataOption="INSERT_ROWS",
            body={"values": [row]}).execute()


async def upsert(doc: dict) -> bool:
    if not is_configured():
        return False
    try:
        await asyncio.to_thread(_upsert_sync, doc)
        return True
    except Exception as e:  # noqa: BLE001
        logger.error("Google Sheets sync failed: %s", e)
        return False
