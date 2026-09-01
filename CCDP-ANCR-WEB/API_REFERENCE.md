# CCDP Platform — API Reference

Base URL: `https://<your-domain>/api`
Auth: admin routes require `Authorization: Bearer <JWT>` (obtained from `/api/auth/login`).
All request/response bodies are JSON unless noted.

---

## Public endpoints

### GET /api/health
Liveness probe.
- **200** → `{ "status": "ok" }`

### GET /api/config
Public runtime config for the frontend.
- **200** → `{ "schedulingUrl": "<url or ''>", "emailEnabled": <bool> }`

### POST /api/inquiries
Create or update a lead (upsert by email). Sends notification + confirmation emails
(if Resend configured) and syncs to Google Sheets (if configured). Neither is required
for success.

Request body:
| Field | Type | Required | Notes |
|---|---|---|---|
| `firstName` | string | ✅ | |
| `lastName` | string | ✅ | |
| `organization` | string | ✅ | |
| `jobTitle` | string | ✅ | |
| `organizationType` | string | ✅ | University / Foundation / Investor / Employer / Government / Nonprofit / Other |
| `email` | string(email) | ✅ | Lead key (upsert). |
| `phone` | string | – | |
| `website` | string | – | |
| `areaOfInterest` | string | ✅ | Executive Briefing / Partnership / Investment / Degree Program / Technology Platform / General Inquiry |
| `message` | string | ✅ | |
| `source` | string | – | Originating CTA/resource (e.g. `deck`, `res_brief`). |
| `requestedDeck` | bool | – | |
| `company` | string | – | **Honeypot** — must be empty. If filled, request is silently accepted and NOT stored. |

Responses:
- **200** → `{ "status": "success", "id": "<uuid>", "requestedDeck": <bool> }`
- **422** → validation error (bad/missing fields, invalid email)
- **429** → rate limited (more than 6 submissions / 15 min per IP)

---

## Authentication

### POST /api/auth/login
Request: `{ "email": "<admin email>", "password": "<password>" }`
- **200** → `{ "token": "<JWT>", "user": { "email", "name" } }`
- **401** → invalid email or password
- **429** → too many attempts (5 fails / 15 min per ip+email; 15-min lockout)

JWT: HS256, 12-hour expiry, signed with `JWT_SECRET`. Send as `Authorization: Bearer <token>`.

### GET /api/auth/me
Requires Bearer. Returns `{ "user": { "email", "name" } }`. **401** if missing/expired/invalid.

---

## Admin endpoints (Bearer required)

All return **401** without a valid admin token.

### GET /api/admin/inquiries
Query params (all optional): `search`, `status`, `institutionType`, `date_from` (YYYY-MM-DD),
`date_to` (YYYY-MM-DD).
- **200** →
```json
{
  "inquiries": [ { /* full inquiry doc, see DATABASE.md */ } ],
  "total": 0,
  "byStatus": { "New": 0, "Contacted": 0, "Meeting Scheduled": 0, "Proposal Sent": 0, "Closed": 0 },
  "statuses": ["New","Contacted","Meeting Scheduled","Proposal Sent","Closed"],
  "sheetsEnabled": false
}
```

### PATCH /api/admin/inquiries/{id}
Update CRM fields. Body (any subset): `status`, `assignedTo`, `internalNotes`,
`lastContactedDate` (YYYY-MM-DD), `nextFollowUpDate` (YYYY-MM-DD).
- **200** → the updated inquiry document (also re-synced to Google Sheets if configured)
- **400** → no fields provided
- **404** → not found

### GET /api/admin/inquiries/export
Same query params as the list endpoint. Streams a CSV attachment
(`ccdp-inquiries-YYYYMMDD.csv`) with a header row and one row per lead.

---

## Error shape
FastAPI errors return `{ "detail": "<message>" }` (or a validation array for 422).

## cURL examples
```bash
BASE="https://your-domain.com"

# Submit a lead
curl -X POST "$BASE/api/inquiries" -H "Content-Type: application/json" -d '{
  "firstName":"Jane","lastName":"Doe","organization":"State University",
  "jobTitle":"Provost","organizationType":"University","email":"jane@uni.edu",
  "areaOfInterest":"Partnership","message":"Exploring a partnership."}'

# Log in and list inquiries
TOKEN=$(curl -s -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"admin@your-domain.com","password":"***"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")
curl "$BASE/api/admin/inquiries?status=New" -H "Authorization: Bearer $TOKEN"
```
