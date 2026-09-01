# VIEARTA™ — Product Requirements Document

## Original Problem Statement
Build VIEARTA™ — Creative Health, Wellness & Human Performance app for CCDP creators (vocalists, musicians, producers, songwriters, dancers, actors, filmmakers, content creators, creative entrepreneurs). Internal app inside the CCDP educational experience, powered by ANCR. Live Well • Perform Well • Create Forever.

## User Personas
- **Primary:** CCDP student-creator (Jaylen Rivers demo — Artist • Producer • Songwriter, ANCRID-7G8X)
- **Secondary:** VIEARTA program mentor
- **Staff:** VIEARTA program admin (aggregate anonymized patterns + consent-shared reflections only)
- **Future:** ANCR SSO users authenticated via ANCRID

## Architecture
- **Backend:** FastAPI + MongoDB (motor), JWT (bearer), bcrypt, three router modules (auth+dashboard in server.py, lifestyle.py, programs.py)
- **Frontend:** React 19 + react-router-dom v7, Tailwind, Shadcn, Recharts, Sonner, Lucide, Cormorant Garamond + Outfit
- **Design:** Deep black cinematic glassmorphism with ambient teal/purple/rose/orange/gold glows. Official uploaded VIEARTA artwork preserved via `<Logo>` component (variants: full, mark, header).

## Implemented (through iteration 5, 2026-02)
### Iteration 1 — MVP
- JWT auth, Jaylen demo user seed, Home dashboard (welcome, arriving check-in, wellness snapshot, creative demand, rule-based recommendations, weekly pattern, continue learning, upcoming events, quick access), full Daily Check-In page.

### Iteration 2 — Lifestyle
- Lifestyle hub (Nutrition, Mindfulness, Movement)
- Nutrition: meal logger with 26 seeded foods, macro math, saved meals, hydration, targets + safe educational estimator (refuses under-18/pregnancy/eating-disorder/chronic condition), daily reflection
- Mindfulness: 63 curated affirmations across 15 themes, daily rotation, favorites + private reflections; 10 mindfulness practices with real pause/resume/reset timers
- Movement: 17 activities, rule-based Movement for Today, browse+filters, timer, intensity+note, quick-log, personal routines
- Daily Affirmation card on Home
- Functional My Progress with wellness + nutrition merged charts

### Iteration 3 — Programs (deep dive)
- **My Wellness** — user habits with streak + 14-day dot history, private journal with mood, rhythms chart (7/30/90 days) with observation lines (correlation-based, framed as observations not causes), consent settings
- **Learning** — 4 pathways × 3 lessons (12 total): Vocal Longevity, Studio Health, Performance Preparation, Creative Recovery. Every lesson has content + linked tool + reflection prompt. **Real-life credit = participation (tool launched) + reflection saved** — never body/macro targets.
- **Performance** — 4 ritual templates (Show-Day, Audition, Studio Session, Rehearsal) that chain mindfulness + movement + affirmation with a stepper + real timers per step + completion logging
- **Recovery Center** — 5 recovery sessions (Post-Show, Tour, Studio, Dancer Recovery Day, Creative Block Reset) with stepper + timers
- **Wellness Circle** — 4 seeded circles with RSVP + capacity + `by_discipline` breakdown + attendee first-names visible after RSVP; capacity enforcement
- **Support & Resources** — 8 curated resources (program, mentor, nutrition, mental health, medical, accessibility, crisis, disclaimer) + message form
- **Consent/Privacy** — three toggles (wellness, reflections, habits), default false; enforced across admin endpoints
- **Staff/Admin dashboard** — aggregate anonymized 7-day patterns, by-discipline breakdown, consent-shared reflections list only (never PII of non-consenting students)
- **ANCR SSO stub** — `/api/auth/ancr/status` documents the handshake shape; ready for ANCR to activate

### Iteration 4 — Fixes
- Removed duplicate `/learning/current` legacy handler
- `GET /api/consent` now merges default False values on read for a stable response shape after partial PUTs

### Iteration 5 — Viea AI + Welcome Tour hardening (2026-02-01)
- **Welcome Tour**: Back button on steps 2–3, ESC to close, ArrowLeft/Right keyboard nav, `role="dialog" aria-modal`, body-scroll lock while open, tour marked seen per-user in localStorage so it never reopens.
- **Viea chat UX**: Rebuilt optimistic-message reconciliation. Each user message now carries `status: pending|sent|failed` with a per-message "Sending…" indicator, red-bordered failed bubble, and inline Retry button. No duplicate optimistic messages. Reload persists conversation via `/api/viea/history`.
- **Viea offline & guardrails**: `navigator.onLine` disables input and shows a WifiOff banner. 4000-char client cap. Client-side crisis-language detection surfaces a persistent amber crisis banner routing to 988/911 and the Support page.
- **Viea server safety net**: `viea.py` now flags crisis + medical-advice patterns server-side and always appends a professional-referral footer (988/911 for crisis; "see Support" for medical/nutrition-clinical asks), regardless of what the model produced. Response includes `flags: { crisis, medical }`.
- **Privacy**: Verified `/api/viea/history` is strictly scoped by `user_id` — admins cannot read student threads, unauthenticated requests → 401.
- **Testing**: Screenshot-based E2E verified all 15 acceptance checks (tour flow desktop + mobile, Viea send/receive, failure/retry, offline, crisis + medical footer, session privacy).

### Iteration 6 — Barcode scanner for Nutrition (2026-02-01)
- **Backend**: `GET /api/lifestyle/nutrition/scan/{barcode}` proxies Open Food Facts (public API, no key), normalizes to our per-100g food shape. Handles 400 (invalid format), 404 (not found), 502 (upstream). Supports EAN-13/8, UPC-A/E, ITF (6–14 digits).
- **Frontend**: `BarcodeScanner.jsx` modal with dual mode (Camera via `@zxing/browser` targeting rear camera when available, or Manual entry). Product card renders image + per-100g nutriments; user adjusts serving grams and meal type; live macro preview; one-tap "Add to today" via existing `/api/lifestyle/meals`.
- **Graceful fallbacks**: If camera permission is denied or no device is detected, shows a clear "Enter code instead" CTA. Not-found barcodes show an amber banner steering the user to Log Meal manual entry.
- **Tested**: End-to-end verified with real barcode (Nutella 3017620422003) → logged; not-found path; input validation.

### Iteration 7 — Scan history / recent scans (2026-02-01)
- **Backend**: Scan endpoint now upserts to `viearta_scans` (per-user) with `count`, `first_scanned_at`, `last_scanned_at`. New endpoints: `GET /api/lifestyle/nutrition/scans/recent?limit=8` (sorted by last_scanned_at desc) and `DELETE /api/lifestyle/nutrition/scans/{barcode}`. History write is best-effort — never blocks the scan response.
- **Frontend**: `BarcodeScanner` shows a horizontal "Recent scans · tap to re-log" strip on open. Each chip: product image, name, kcal/100g. **One-tap** populates the product card from cached history (no OFF round-trip), letting students log a favourite in one click after adjusting grams. Hover reveals a trash-icon to remove the item from history. List refreshes after every successful log.
- **Verified E2E**: Seeded scans → chips render → new scan promotes to first position → one-tap re-log → per-chip delete.

## Test Coverage
- iter1: 100% backend + frontend critical flows
- iter2: 41/41 backend, 100% frontend
- iter3: 88/88 backend, 100% frontend across all 9 nav flows + admin + protected routes + mobile
- iter4: 90/90 backend (regressions + focused verifications)

## Prioritized Backlog
### P1
- Videos + real audio content when VIEARTA content is ready
- ANCR SSO integration (activate the handshake described in `/api/auth/ancr/status`)
- AI-personalized recommendations (Claude/Gemini via Emergent LLM key) layered on top of `build_recommendations` and `pick_movement_of_day`
- Optional institutional spiritual/faith-based reflection pathway (opt-in)

### P2
- Split programs.py into per-domain modules (mirror lifestyle split)
- Concurrency guard for circle RSVP capacity (atomic $inc)
- Email/push reminders (Resend) for check-ins, circles, and lesson credit gates
- Refresh token flow, brute-force protection
- Mentor-facing tools (student-consented views)

## Credentials (see /app/memory/test_credentials.md)
- Demo: `jaylen@viearta.demo` / `demo123`
- Admin: `admin@viearta.demo` / `admin123`
