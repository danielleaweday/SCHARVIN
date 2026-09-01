# ANCRID™ — PRD & Delivery Log

## Original Problem Statement
Build a premium web application called ANCRID™ — the Identity Layer of the ANCR ecosystem.
Tagline: **Your Creative Identity. Everywhere.**
ANCRID is NOT a profile page. It is the secure, verified, lifelong digital identity that authenticates every ANCR application (ANCRA, ANCRLAB, ANCRSync, INHEIRA, Vaulta, Passport, ANCRLaunch, ANCRVIEW, ANCRWAV) and automatically writes verified data back to a creator's permanent record.

## User Choices (from clarification)
- Scope: full authenticated app + rich seeded demo data
- AI Intelligence: mocked for V1 (production-ready UI, no live LLM)
- Auth: JWT email/password (foundation for future SSO across ANCR modules)
- Media: URL-based / placeholder images (no object storage yet)
- Design: obsidian black + electric blue → violet → orange, glassmorphism, Cabinet Grotesk / Satoshi / JetBrains Mono, cinematic motion, no emojis
- Extra: mandatory "Ecosystem Status" panel at top of Dashboard reinforcing ANCRID as the foundation

## Architecture (2026-02-07)
- **Backend** — FastAPI + Motor + MongoDB, JWT via PyJWT + bcrypt, httpOnly cookies (SameSite=None; Secure), idempotent admin seed. All routes under `/api`.
- **Frontend** — React 19 + React Router 7, Tailwind + shadcn, sonner for toasts, lucide-react icons. AuthContext with `withCredentials`. Fonts via Fontshare + Google Fonts.

## Personas
- Student · Faculty · Mentor · Alumnus · Employer · Creative Professional — each authenticates through the same ANCRID and contributes/reads verified data.

## What's Implemented (v1.0 — 2026-02-07)
- Public **Landing** page — "One Identity. Every Experience." hero, ecosystem marquee, pillars, Passport preview card, live-feed panel, for-whom section
- **Auth** — Signup, Login (prefilled demo creds), Logout, Protected routes, `/api/auth/{register,login,logout,me,refresh}`
- **Dashboard sections** (all with seeded creator data):
  - Overview — Ecosystem Status panel (9 modules), Creator Passport card, 3 Score dials (Portfolio 87, Reputation 91, Readiness 78), AIAH insights, Recent Milestones
  - Identity — biography, mission, credentials on file, presence, languages, headshot/banner
  - Portfolio — filterable creative works with medium/verified badges & linked apps
  - Timeline — cinematic vertical ledger with app-tinted milestones
  - Passport — countries count, stamps, international activity
  - Collaborations — auto-generated collaborator ledger with linked ANCR modules
  - Skills — verified competencies with level/evidence
  - Education — institutions, courses, mentors, capstones
  - Professional History — employment, freelance, teaching, service
  - Achievements — awards, scholarships, fellowships, releases
  - Credentials — Gov ID / Student / Creator / Industry / Institutional verifications
  - Connected Apps — orbital ecosystem visualization + detailed module cards
  - Network — search creators by name/institution/skill/discipline/country
  - Settings — editable biography, mission, location, pronouns, website, headshot/banner
- Seeded demo creator: **aaron@ancr.io / ancrid2026** (Aaron Ellington, ANCRID-2026-0001, CPX-8842-INHR)

## Testing (iteration_1)
- Backend: 27/27 pytest passed
- Frontend: 100% of enumerated flows passed
- No blockers; testing agent notes are non-critical (extract seed data, tighten social_links schema — deferred)

## Prioritized Backlog

### Iteration 4 (2026-07-08) — Creator Mobility™ + Booking Packet™
- **Creator Mobility™ page** at `/app/mobility` — 15 tabs covering Personal Travel, Frequent Traveler Programs (Airlines / Hotels / Rentals), Preferences, Dietary, Medical, Emergency, Team & Touring, Booking, Riders, Documents, Global History, Calendar, mocked AI Travel Assistant, and Granular Permissions (Public / Team / Booking-Only / Private).
- **Professional Booking Packet™** — one-click generator that mints a signed, time-limited (30 days), permission-scoped, publicly shareable booking profile at `/packet/:token`. Includes ANCRID, bio, headshot, riders, travel prefs, airline/hotel/rental status, team contacts, portfolio, achievements. Revocable.
- Backend endpoints: `GET|PATCH /api/mobility/profile`, `GET /api/mobility/travel-suggestions`, `POST /api/mobility/booking-packet`, `GET /api/mobility/booking-packets`, `DELETE /api/mobility/booking-packet/:token`, `GET /api/public/packet/:token` (unauth).
- Server-side allowlist on `permission_level` (`public | booking_only | team`).
- Testing: 68/68 pytest passed (15 new iter4), 100% frontend flows passed.


- **P0** — none (v1 is functional end-to-end)
- **P1**
  - Wire the AIAH panel to a live LLM (Claude Sonnet 4.5 via Emergent Universal Key) with per-user context grounding
  - Object storage for headshot/banner/portfolio uploads (via Emergent object storage integration)
  - Public creator profile pages (`/@handle`) so ANCRIDs are shareable
  - Real ecosystem SSO handshake endpoints for other ANCR modules to verify a token issued by ANCRID
- **P2**
  - Password reset (forgot / reset via email)
  - Detailed portfolio work page (media embed, credits)
  - Certifications import from third-party issuers (Recording Academy, ASCAP, etc.)
  - Rate limiting + brute force lockout collection wiring
  - Admin analytics dashboard for institutions

## Deploy / Env
- Backend `.env` seeds: `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `FRONTEND_URL`, `MONGO_URL`, `DB_NAME`
- Frontend uses `REACT_APP_BACKEND_URL` for all API calls with `withCredentials: true`
