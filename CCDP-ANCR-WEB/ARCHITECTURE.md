# CCDP Institutional Platform — System Architecture

This document describes the frontend, backend, database, authentication, email flow,
CRM flow, and lead-capture process.

---

## 1. Overview

The CCDP platform is a two-tier web application:

- **Frontend** — a React single-page application (SPA). Public marketing/institutional
  site + a private admin CRM dashboard. Static assets served by Nginx.
- **Backend** — a FastAPI service exposing a JSON API under `/api`. Persists data to
  MongoDB and integrates (optionally) with Resend (email) and Google Sheets.
- **MongoDB** — primary datastore for inquiries (leads) and admin accounts.

All backend routes are namespaced under `/api`. The reverse proxy routes `/api/*`
to the backend and all other paths to the SPA (with `index.html` fallback for client-side routing).

---

## 2. Frontend

- **Framework:** React + React Router, Tailwind CSS, shadcn/ui components, framer-motion.
- **Key pages/routes:**
  - `/` Home, `/ecosystem`, `/platform`, `/resources` — public institutional content.
  - `/admin/login` — admin authentication.
  - `/admin/inquiries` — protected CRM dashboard.
- **Central content:** `src/lib/content.js` holds ecosystem modules, branches, leadership,
  CTAs, and brand asset paths (no invented data — placeholders are explicit).
- **Inquiry system:**
  - `context/InquiryProvider.jsx` exposes `openInquiry(intent)` / `openBriefing()` and
    fetches `/api/config` (scheduling URL) at load.
  - `components/InquiryDialog.jsx` — one shared, validated (zod + react-hook-form) form
    used by every CTA and by each gated resource. Intents map a CTA to a title + default
    "area of interest" + deck/resource flags.
- **Admin auth:** `context/AdminAuth.jsx` stores a JWT in `localStorage`
  (`ccdp_admin_token`) and attaches it as `Authorization: Bearer <token>` on admin API calls.
- **Config:** `REACT_APP_BACKEND_URL` (build-time) determines the API base
  (`${REACT_APP_BACKEND_URL}/api`).

---

## 3. Backend

- **Framework:** FastAPI (ASGI, served by uvicorn), Motor (async MongoDB driver).
- **Modules:**
  - `server.py` — app bootstrap, CORS, logging, health check, router registration,
    startup (admin seed + index creation).
  - `inquiries.py` — public lead capture + admin CRM endpoints + branded email templates.
  - `auth.py` — bcrypt password hashing, JWT issue/verify, admin seeding, login lockout.
  - `google_sheets.py` — service-account Sheets upsert (gated).
- **Endpoints:**
  | Method | Path | Auth | Purpose |
  |---|---|---|---|
  | GET | `/api/health` | – | Liveness probe. |
  | GET | `/api/config` | – | Returns `{schedulingUrl, emailEnabled}`. |
  | POST | `/api/inquiries` | – | Create/update a lead; send emails; sync to Sheets. |
  | POST | `/api/auth/login` | – | Admin login → JWT. |
  | GET | `/api/auth/me` | Bearer | Current admin. |
  | GET | `/api/admin/inquiries` | Bearer | List with filters + status counts. |
  | PATCH | `/api/admin/inquiries/{id}` | Bearer | Update CRM fields; re-sync to Sheets. |
  | GET | `/api/admin/inquiries/export` | Bearer | CSV export (respects filters). |

---

## 4. Data model (MongoDB)

### `inquiries` (leads — CRM-agnostic; maps cleanly to HubSpot/Salesforce/Airtable)
| Field | Type | Notes |
|---|---|---|
| `id` | string (UUID) | Inquiry ID / primary key. |
| `created_at` | ISO string | Date submitted. |
| `updated_at` | ISO string | Last modification. |
| `organization` | string | |
| `firstName`, `lastName` | string | Contact name. |
| `jobTitle` | string | |
| `email` | string | Unique lead key (submissions upsert by email). |
| `phone`, `website` | string | Optional. |
| `organizationType` | string | University / Foundation / Investor / Employer / Government / Nonprofit / Other. |
| `areaOfInterest` | string | Executive Briefing / Partnership / Investment / Degree Program / Technology Platform / General Inquiry. |
| `message` | string | |
| `source` | string | CTA / resource that originated the lead. |
| `requestedDeck` | bool | Whether materials were requested. |
| `status` | string | New / Contacted / Meeting Scheduled / Proposal Sent / Closed. |
| `assignedTo` | string | Team member. |
| `internalNotes` | string | Private notes. |
| `lastContactedDate` | date (YYYY-MM-DD) | |
| `nextFollowUpDate` | date (YYYY-MM-DD) | |
| `email_status` | string | sent / skipped / failed / pending. |
| `ip` | string | Origin IP (rate limiting / audit). |

Indexes: `id`, `email`.

### `admins`
| Field | Type |
|---|---|
| `email` (unique) | string |
| `name` | string |
| `password_hash` | bcrypt string |
| `role` | `"admin"` |

### `login_attempts`
Transient per-`ip:email` counters for brute-force lockout.

---

## 5. Authentication flow

1. Admin is seeded on startup from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (password bcrypt-hashed;
   updated if the env password changes). No credentials are committed to code.
2. `POST /api/auth/login` verifies bcrypt hash → returns a signed **JWT** (HS256,
   `JWT_SECRET`, 12h expiry). Repeated failures per `ip:email` lock out for 15 min.
3. The SPA stores the token and sends `Authorization: Bearer <token>` to admin routes.
4. `get_current_admin` dependency validates the token (signature, expiry, role) and
   guards every `/api/admin/*` route. Invalid/expired → `401`.

---

## 6. Lead-capture flow

```
Visitor clicks a CTA / requests a resource
   └─► InquiryDialog (client-side validation, honeypot field)
         └─► POST /api/inquiries
               ├─ honeypot filled?  → silently accept (no store) [bot]
               ├─ rate limit (6 / 15 min per IP) exceeded? → 429
               ├─ validate (Pydantic + EmailStr)
               ├─ upsert by email into `inquiries` (new lead or update)
               ├─ send internal notification email (Resend, if configured)
               ├─ send confirmation email to submitter (Resend, if configured)
               └─ async upsert row to Google Sheet (if configured)
         └─► success screen ("we'll respond within 1–2 business days")
```

Emails and Sheets are **best-effort and gated**: if unconfigured or failing, the lead
is still stored and the API returns success (`email_status` records the outcome).

---

## 7. Email flow (Resend)

Triggered on every stored inquiry (when `RESEND_API_KEY` is set):
- **Internal notification** → `INQUIRY_RECIPIENT`, subject
  `New CCDP Partnership Inquiry — {organization}`, all fields in an executive HTML layout.
- **Confirmation** → the submitter, subject `Thank You for Contacting CCDP`,
  branded template with a 1–2 business-day response note, deck note if requested, and
  Danielle Stephens McMillan's signature. `reply_to` is set to the internal recipient.

Sending runs in a worker thread (`asyncio.to_thread`) so it never blocks the request.

---

## 8. CRM flow (admin)

1. Admin logs in at `/admin/inquiries`.
2. Dashboard loads leads via `GET /api/admin/inquiries` with optional filters
   (search, status, institution type, date range) and status counts.
3. Selecting a lead opens a detail editor to update **status**, **assigned team member**,
   **internal notes**, **last contacted**, and **next follow-up** — persisted via `PATCH`,
   and re-synced to Google Sheets.
4. "Mark follow-up complete" sets last-contacted = today and clears the next follow-up.
5. Export filtered results or all leads to **CSV**. Email links (`mailto:`) and the
   scheduling link are available inline.

The data model is intentionally CRM-agnostic so a future connector (HubSpot, Salesforce,
Airtable, etc.) can map these fields without schema changes.

---

## 9. Security summary

- Secrets and admin credentials come **only** from environment variables.
- Passwords hashed with **bcrypt**; sessions are short-lived signed **JWTs**.
- Brute-force lockout on login; honeypot + IP rate limiting on public submissions.
- CORS restricted via `CORS_ORIGINS`; HTTPS required in production.
- No third-party keys or secrets are stored in the codebase or committed env files.
