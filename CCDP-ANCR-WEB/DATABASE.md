# CCDP Platform — Database Documentation

Engine: **MongoDB**. Driver: **Motor** (async). Database name: `DB_NAME` (env).
IDs are application-generated UUID strings (field `id`), not Mongo `_id`, so records are
portable to any external CRM without exposing BSON ObjectIds. Timestamps are ISO-8601 strings (UTC).

Indexes are created automatically on startup (`server.py`):
`inquiries.id`, `inquiries.email`, and a unique index on `admins.email`.

---

## Collection: `inquiries` (leads / CRM records)

| Field | Type | Description |
|---|---|---|
| `id` | string (UUID) | Inquiry ID — primary application key. |
| `created_at` | ISO string | Date/time submitted (UTC). |
| `updated_at` | ISO string | Last update (present after edits). |
| `organization` | string | Organization / institution name. |
| `firstName` | string | Contact first name. |
| `lastName` | string | Contact last name. |
| `jobTitle` | string | Contact title. |
| `email` | string | Contact email. **Upsert key** (repeat submissions update the same lead). |
| `phone` | string | Optional. |
| `website` | string | Optional. |
| `organizationType` | string | University / Foundation / Investor / Employer / Government / Nonprofit / Other. |
| `areaOfInterest` | string | Executive Briefing / Partnership / Investment / Degree Program / Technology Platform / General Inquiry. |
| `message` | string | Free-text message. |
| `source` | string | Originating CTA/resource key. |
| `requestedDeck` | bool | Whether the Partnership Deck was requested. |
| `status` | string | Pipeline stage: New / Contacted / Meeting Scheduled / Proposal Sent / Closed. |
| `assignedTo` | string | Assigned team member. |
| `internalNotes` | string | Private team notes. |
| `lastContactedDate` | string (YYYY-MM-DD) or null | |
| `nextFollowUpDate` | string (YYYY-MM-DD) or null | |
| `email_status` | string | `sent` / `skipped` (Resend not configured) / `failed` / `pending`. |
| `internal_email_id` | string or null | Resend id of the internal notification. |
| `confirmation_email_id` | string or null | Resend id of the submitter confirmation. |
| `ip` | string | Submitter IP (rate limiting / audit). |

**CRM mapping:** these fields map directly to standard CRM contact/lead objects
(HubSpot, Salesforce, Airtable). A future connector can read this collection (or the
Google Sheet mirror) without any schema change.

Example document:
```json
{
  "id": "a1b2c3d4-...",
  "created_at": "2026-07-05T14:02:11.123456+00:00",
  "organization": "State University",
  "firstName": "Jane", "lastName": "Doe", "jobTitle": "Provost",
  "email": "jane@uni.edu", "phone": "", "website": "",
  "organizationType": "University", "areaOfInterest": "Partnership",
  "message": "Exploring a partnership.", "source": "partnership",
  "requestedDeck": false,
  "status": "New", "assignedTo": "", "internalNotes": "",
  "lastContactedDate": null, "nextFollowUpDate": null,
  "email_status": "skipped", "ip": "203.0.113.4"
}
```

---

## Collection: `admins`

| Field | Type | Description |
|---|---|---|
| `email` | string (unique) | Login email. |
| `name` | string | Display name. |
| `password_hash` | string | bcrypt hash (never plaintext). |
| `role` | string | `"admin"`. |
| `created_at` | ISO string | |

Seeded/updated on startup from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Add more admins by
inserting documents with a bcrypt hash (see ADMIN_GUIDE.md).

## Collection: `login_attempts`

Transient brute-force counters keyed by `identifier` (`"<ip>:<email>"`), with `count`
and `last` (ISO). Safe to clear at any time.

---

## Backups
- **Dump:** `mongodump --uri "$MONGO_URL" --gzip --archive=/backups/ccdp-$(date +%F).gz`
- **Restore:** `mongorestore --uri "$MONGO_URL" --gzip --archive=/backups/ccdp-YYYY-MM-DD.gz`
- Schedule daily via cron; retain ≥30 days; store off-server; test restores periodically.
- The Google Sheet (when enabled) is a live, human-readable secondary mirror of `inquiries`.
