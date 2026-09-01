# COHEIR™ — PRD (v1.1)

## Vision
COHEIR™ is the Industry Leadership Network of the ANCR ecosystem and the Contemporary Creative Development Program (CCDP). It is the **professional relationship layer of the ANCR ecosystem** — a lifelong network where verified faculty, executives, artists, producers, engineers, songwriters, creative directors, entertainment attorneys, publishers, managers, employers and institutional partners teach, mentor, supervise, evaluate, produce, recommend and launch creators.

**Every relationship established during CCDP continues after graduation through ANCRID™.** COHEIR™ is not a school app — it is the career-long professional network of the ANCR ecosystem.

Tagline: **Lead. Mentor. Develop. Launch.**

## Architecture (v1.1)

### Backend (FastAPI + MongoDB + Motor)
- `server.py` — mounts /api routers, seeds DB, initializes object storage.
- `models.py` — Pydantic models (User now includes is_alumni / alumni_class / alumni_role).
- `auth.py` — dual auth: JWT-style session tokens + Emergent Google SSO + demo login.
- `routes.py` — 30+ core domain endpoints.
- `aiah.py` — AIAH via emergentintegrations LlmChat + Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`).
- `uploads.py` — portfolio uploads via Emergent Object Storage (mp3/wav/aiff/flac/mp4/mov/pdf/docx/pptx/xlsx/images/zip up to 50MB).
- `share_kits.py` — revocable, expirable public share links in 7 kinds (public_portfolio, student_profile, booking_profile, professional_resume, press_kit, institution_review, private_review).
- `providers.py` — interchangeable video providers (Zoom, Google Meet, MS Teams, Cisco Webex, Riverside, StreamYard, ANCR Video) & calendar providers (Google, Outlook, Apple, Calendly, University).
- `analytics.py` — 12 institution dashboards.
- `seed_data.py` — 24 fictional premium industry personas (incl. 2 seeded alumni: Jordan Blake CCDP '24, Priya Desai CCDP '23).

### Frontend (React 19 + React Router 6 + Tailwind + shadcn/ui + Motion + Sonner + Recharts)
- Dark obsidian theme. Electric blue → violet → orange gradient accents.
- Cabinet Grotesk headlines, Satoshi body, JetBrains Mono labels.
- Actual COHEIR interlocking-C logo (SVG) + CCDP mark used throughout.
- 26 pages: Landing, Login, Dashboard, Directory, ProfessionalProfile, StudentSupervision, StudentDetail, Sessions, SessionDetail, Cohorts, CohortDetail, Reviews, Opportunities, Recommendations, CreativeTeams, **Portfolio, ShareKits, Analytics (12 charts), Integrations, Alumni, PublicShare (/p/:slug)**, Calendar, Messages, Library, AIAH, ANCRID, Institution, Employer, Settings.

## Implemented (v1.1 — 2026-02-08)
- ✅ Actual COHEIR logo integrated (SVG interlocking-C monogram with orange/white wordmark)
- ✅ Portfolio uploads via Emergent Object Storage (12 file formats, 50MB, categories, private/shared/public visibility)
- ✅ Share Kits: 7 revocable kinds with expiry (7d/30d/90d/1y/never), audited view counts, permissions inherit from ANCRID™
- ✅ Public /p/{slug} share view (no auth) with cinematic press-kit layout
- ✅ Interchangeable meeting providers architecture (7 video, 5 calendar) — future-proofed for any provider swap
- ✅ 12 Institution Analytics dashboards with Recharts (Mentor Engagement, Student Engagement, Creative Output, Portfolio Completion, Industry Participation, Session Attendance, Review Activity, Career Readiness, Graduation Readiness, Placement, Employer Activity, Alumni Engagement)
- ✅ Alumni Network page — lifelong relationship principle
- ✅ "Share Profile" button on Professional Profile

## Testing
- Backend: **39/39 pytest tests pass** (27 regression + 12 new for uploads/share-kits/providers/analytics/alumni).
- Frontend: All new flows verified. No critical or minor issues.
- Reports: `/app/test_reports/iteration_1.json`, `/app/test_reports/iteration_2.json`.

## Backlog / Next Iteration
- **P0** — Wire real Zoom Server-to-Server OAuth (needs ZOOM_ACCOUNT_ID/CLIENT_ID/CLIENT_SECRET).
- **P0** — Wire real Google Calendar API (needs GOOGLE_CLIENT_ID/CLIENT_SECRET distinct from Emergent SSO).
- **P1** — Async httpx for object storage (currently sync `requests`).
- **P1** — Real-time messaging via websockets.
- **P2** — Employer paid tier + interview scheduling (Stripe).
- **P2** — Verifiable ANCRID claim export (W3C VC / OpenBadges format).

## Test Credentials
See `/app/memory/test_credentials.md` — all seeded accounts use password `demo1234`.
Two new alumni accounts: alumni.jordan.blake@coheir.industry, alumni.priya.desai@coheir.industry.
