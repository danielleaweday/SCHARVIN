# ANCRLaunch™ — PRD

**Tagline:** Learn. Graduate. Launch.

## Original Problem Statement
Build ANCRLaunch™, the career placement and professional transition platform of the ANCR™ Ecosystem. It is the final stage of the CCDP experience where verified students transition into professional careers. It must consume verified data from ANCRID™, ANCRA™, ANCRLAB™, ANCRSync™, COHEIR™, INHEIRA™, Vaulta™, ANCRMEDIA™, ANCRD™ (never duplicate them) and feel like an executive career center — not LinkedIn or Handshake.

## User Choices
- LLM: Claude Sonnet 4.5 via Emergent Universal LLM Key (swappable to Gemini / OpenAI)
- Ecosystem data: Seeded providers + integration abstraction layer ready to consume live ecosystem APIs
- Seed scope: Light
- Auth: JWT (ANCRID) with one demo account per role and shared password `ancrlaunch2026`

## Architecture
- **Backend**: FastAPI + Motor (MongoDB async). Every route under `/api`.
- **Frontend**: React 19 + Craco + Tailwind + Framer-motion patterns + Recharts-ready.
- **Auth**: JWT ANCRID tokens (issuer=ANCRID, audience=ANCRLaunch), bcrypt password hashes.
- **Ecosystem layer** (`backend/ecosystem.py`): `EcosystemProvider` base + one provider per service (ANCRID, ANCRA, ANCRLAB, ANCRSync, COHEIR, INHEIRA, Vaulta, ANCRMEDIA, ANCRD). Swap `SeededProvider` for `LiveHttpProvider` without touching callers.
- **Readiness engine** (`backend/scoring.py`): 10-signal composite (portfolio, publishing, creative_projects, collaboration, faculty, industry, reputation, resume, interview, business).
- **AIAH Career Coach** (`backend/coach.py`): `emergentintegrations.llm.chat.LlmChat` with `stream_message`, model `anthropic/claude-sonnet-4-5-20250929`. SSE via `text/event-stream`.
- **Seed** (`backend/seed.py`): idempotent, wipes and re-seeds on empty DB.

## Personas / Roles
Student · Graduate · Faculty · Career Services · Employer · Recruiter · Industry Partner · Administrator

## Demo Credentials
Shared password: **ancrlaunch2026**

| Role | Email |
|---|---|
| Student | student@ancrlaunch.demo |
| Graduate | graduate@ancrlaunch.demo |
| Faculty | faculty@ancrlaunch.demo |
| Career Services | career@ancrlaunch.demo |
| Employer | employer@ancrlaunch.demo |
| Recruiter | recruiter@ancrlaunch.demo |
| Industry Partner | industry@ancrlaunch.demo |
| Administrator | admin@ancrlaunch.demo |

## What's Been Implemented (2026-02-09)
- JWT ANCRID auth + demo-account picker on Login
- Career Dashboard (readiness ring, metrics, applications, upcoming interviews, recommended, timeline)
- Career Readiness™ page (10 weighted components)
- Portfolio (assembled from 9 ecosystem providers — no duplication)
- Resume auto-generated from ecosystem, editable, completion %
- Jobs / Internships / Auditions / Projects — editorial curated listings with filters
- Employer Network (verified employers + candidate search with role-gated access)
- Applications kanban (6 stages: applied → interview → offer → accepted / declined / archived)
- Interviews with prep notes, meeting links, follow-up
- Graduate Outcomes with statistics
- Career Coach (AIAH™) — SSE streaming from Claude Sonnet 4.5 via Emergent Key
- Settings — ANCRID identity + connected ecosystem services roster
- Obsidian black + gradient accent design + logo integrated (sidebar / login hero / footer / coach greeting / favicon)

## Backend Endpoints
- `GET /api/health`
- `POST /api/auth/login`, `GET /api/auth/me`, `GET /api/auth/demo-accounts`
- `GET /api/dashboard`
- `GET /api/readiness`, `GET /api/readiness/{ancrid}`
- `GET /api/portfolio`, `GET /api/portfolio/{ancrid}`
- `GET /api/resume`, `PUT /api/resume`
- `GET /api/opportunities` (filters: kind, category, country, remote, q), `GET /api/opportunities/{id}`
- `GET /api/employers`, `GET /api/employers/candidates` (role-gated)
- `GET /api/applications`, `POST /api/applications`, `PATCH /api/applications/{id}`
- `GET /api/interviews`
- `GET /api/graduate-outcomes`
- `POST /api/coach/stream` (SSE), `GET /api/coach/messages`, `GET /api/coach/sessions`
- `POST /api/admin/seed`, `GET /api/admin/stats`

## Production Handoff — Items to Complete Before Live
1. Replace `SeededProvider` for each ecosystem module with a `LiveHttpProvider` (identical async interface — no caller changes required).
2. Migrate deprecated `@app.on_event(startup)` to FastAPI lifespan handlers.
3. Add proper PDF export pipeline (Resume `Export PDF` currently placeholder — use WeasyPrint or headless Chrome).
4. Move `JWT_SECRET` and `EMERGENT_LLM_KEY` to a secrets manager.
5. Add rate limiting / IP throttling on `/api/auth/login` and `/api/coach/stream`.
6. Add `<ErrorBoundary>` per route (testing agent recommendation).
7. Wire real employer messaging + candidate save on the Employer Network (backend has `_employer_interest` scaffold).
8. Configure production CORS_ORIGINS list explicitly (currently `*`).
9. Backup / restore strategy for MongoDB collections listed in `seed.py`.

## Backlog (P1)
- Real-time notifications (Interview scheduled, Offer received)
- Employer-facing outbound reach-out flow
- Recruiter shortlists persisted to DB
- Salary benchmarks pulled from live labor data
- Institution-level admin dashboards (career_services role)

## Backlog (P2)
- AIAH persistent memory per user (currently per-session)
- Multi-language support (starting with FR / ES / JA)
- Calendar integration (ICS export, Google / Outlook sync)
- Public verified profile share links

## Test Credentials File
`/app/memory/test_credentials.md` — kept in sync.

## Tests
`/app/backend/tests/backend_test.py` — 16/16 pass (added by testing agent). Coverage: health, auth, JWT, dashboard, readiness, portfolio assembly, resume, opportunities filters, applications lifecycle, RBAC, coach SSE + persistence.
