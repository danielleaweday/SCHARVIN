# ANCRA™ Technical Specification v1.0

**Document:** `ANCRA-TS-1.0`
**Module role:** Creative Learning Operating System™ (LMS-alternative) for the CCDP
**Status:** v1.0 design complete · demo-runnable
**Last updated:** Feb 2026

---

## 1. Executive Overview

### 1.1 Purpose
ANCRA™ is the Learning Experience Platform of the ANCR ecosystem. It orchestrates every learning experience (Studio Experiences™, Lessons, Master Sessions™, Capstones™, 30 Song Progress™), surfaces contextual intelligence through AIAH, and provides the Faculty Command Center for authoring, reviewing, and analytics.

### 1.2 Business objective
Replace generic LMS platforms (Canvas, Blackboard, Moodle) with a category-defining "Creative Learning Operating System" that positions the CCDP as the most premium creative-arts educational experience in higher ed.

### 1.3 User personas
- **Student** (primary demo: Maya Ellis, Cohort 07)
- **Faculty / Artist in Residence** (primary demo: Prof. Terrence Bloom)
- **Executive in Residence** (Ivy Marsh)
- **Adjunct Professor** (Lucas Neri)
- **Administrator** (out-of-scope for v1.0)

### 1.4 Success criteria
- A student can navigate their entire semester (dashboard → journey → experience → lesson → assignment → peer review → portfolio) without ever leaving the ANCRA shell.
- Faculty can compose a Studio Experience™ from scratch in under 30 minutes using the drag-and-drop builders + AI Course Builder.
- AIAH streams contextual guidance on every page.
- The ecosystem membership is visible on every homepage via the Ecosystem Launcher.

---

## 2. Product Requirements (PRD)

### 2.1 Functional requirements
- Cinematic learning surface (video lessons with chapters, resources, ecosystem outs).
- Studio Experience™ catalog (filterable) with rich tiles.
- Learning Journey™ (6-phase visual timeline).
- 30 Song Progress™ tracker (7-status pipeline: locked → writing → demo → recorded → mixed → mastered → released).
- Capstones™ with advisor + industry reviewer.
- Assignments (kanban board · not_started · in_progress · submitted).
- Peer Reviews (received / to review / given tabs).
- Creative Teams.
- Messages inbox.
- Calendar / today's schedule.
- Achievements + Creator Passport™ view.
- Graduation Dashboard.
- Faculty Command Center: cohort analytics, approvals queue, live critiques, industry sessions.
- Faculty Builders: Studio Experience Builder, Curriculum Builder, Lesson Builder, Assignment Builder, AI Course Builder.
- Faculty Grading (signed rubric assessment) + Rubrics library.
- Global Command Palette (Cmd/Ctrl+K).
- AIAH intelligence dock (streaming, contextual) + dedicated AI Companion page.
- Ecosystem Launcher chip strip on every homepage.

### 2.2 User stories (selected)
- *As a student*, I want a cinematic dashboard so I feel proud of my creative journey.
- *As a student*, I want AIAH to tell me exactly which 3 songs to finish next.
- *As faculty*, I want to drag-and-drop assemble a 12-week Studio Experience.
- *As faculty*, I want a signed-rubric grading surface where every score is tied to a criterion.
- *As faculty*, I want AIAH to draft feedback I can edit before returning to the student.

### 2.3 Permissions
| Action | Student | Faculty | Admin |
|--------|:-------:|:-------:|:-----:|
| View own dashboard | ✓ | – | ✓ |
| View Command Center | – | ✓ | ✓ |
| Submit assignment | ✓ | – | ✓ |
| Grade submission | – | ✓ | ✓ |
| Publish Studio Experience™ | – | ✓ | ✓ |
| Access AIAH | ✓ | ✓ | ✓ |
| Impersonate | – | – | ✓ |

### 2.4 Workflows
1. **Lesson → assignment → grade → return** (student ↔ faculty)
2. **Studio Experience™ authoring** (Faculty → Builder → publish → cohort enrollment)
3. **Portfolio Panel** (student submits → panel reviews → signed to ANCRID)
4. **30 Song Progress™** (writing → demo → recorded → mixed → mastered → released; publisher inquiries route to INHEIRA)

### 2.5 Edge cases
- Empty cohorts (Faculty view must render gracefully).
- Student without any submissions (Grading list handles empty state).
- AIAH offline (dock + companion degrade to "AIAH is offline" copy).
- Slow lesson video (skeleton + progressive load).

### 2.6 Acceptance criteria
- All 30 backend endpoints return within 250 ms (p95) against seeded data.
- All routes render without console errors in Chrome/Firefox/Safari.
- Every interactive element has a `data-testid`.
- Cmd/Ctrl+K opens the palette from any route.

---

## 3. Technical Architecture

### 3.1 Frontend
- React 18, React Router v6, SWR, Tailwind, Shadcn UI, Lucide icons.
- Path alias `@/` → `/frontend/src`.
- Route-based code-splitting (via lazy imports; deferred to Phase 2).
- Global providers: `RoleProvider` (persisted in localStorage for demo), `Toaster`.

### 3.2 Backend
- FastAPI + Motor (async Mongo driver).
- Single file `server.py` for v1.0 (split by domain in v1.5).
- Startup hook seeds MongoDB idempotently from `seed_data.py`.
- CORS: `*` in dev.

### 3.3 Folder structure
```
/app
├── backend/
│   ├── server.py                # FastAPI app + all routes
│   ├── seed_data.py             # idempotent seed
│   ├── requirements.txt
│   └── .env                     # MONGO_URL, DB_NAME, EMERGENT_LLM_KEY
├── frontend/
│   ├── public/
│   │   ├── ancra-logo.png       # brand asset
│   │   └── ancr-logo.png        # parent ecosystem
│   └── src/
│       ├── App.js               # router
│       ├── index.css            # design tokens
│       ├── lib/
│       │   ├── api.js           # axios client
│       │   └── modules.js       # ecosystem registry
│       ├── context/RoleContext.jsx
│       ├── components/
│       │   ├── brand/AncraLogo.jsx, AncrLogo.jsx
│       │   ├── common/Primitives.jsx
│       │   ├── ecosystem/EcosystemLauncher.jsx
│       │   ├── shell/AppShell.jsx, EcosystemNav.jsx, TopBar.jsx, AIAHDock.jsx, CommandPalette.jsx, ModuleShell.jsx
│       │   └── ui/              # shadcn primitives
│       └── pages/
│           ├── Landing.jsx, Library.jsx, Settings.jsx
│           ├── student/         # 17 screens
│           ├── faculty/         # 14 screens
│           ├── hubs/            # EcosystemHub + COHEIRSuite
│           └── modules/         # ANCRLAB, ANCRSync, COHEIR, INHEIRA, ANCRID, ComingSoon
└── docs/                        # THIS SPEC and siblings
```

### 3.4 Data flow
`Component → SWR → axios (`@/lib/api`) → FastAPI (`/api/*`) → Mongo (via Motor)`.
AIAH bypasses SWR and uses `fetch` + SSE reader for streaming.

### 3.5 State management
- Server cache: SWR (auto-revalidate).
- Auth/role: `RoleContext` (localStorage; JWT in v1.5).
- Palette open: `useState` in `AppShell`.
- No global store; drilling avoided by using SWR keys.

### 3.6 API architecture
- REST + JSON. All routes prefixed `/api/`.
- Streaming: `POST /api/aiah/stream` returns `text/event-stream`.

### 3.7 Auth flow (v1.0 → v1.5)
- v1.0: single active persona chosen via `RoleContext` (no auth).
- v1.5: ANCRID SSO. JWT verified by FastAPI middleware; role claim gates `/api/faculty/*`.

### 3.8 Error handling & logging
- FastAPI raises `HTTPException`; frontend surfaces via `sonner` toast.
- Backend logging via `logging` (basic config) → stdout; captured by supervisor.
- Frontend: Sentry planned for Phase 2.

---

## 4. Database Schema (Mongo — v1.0 seeded)

All docs use a **string `id`** (uuid or slug) as the primary key. `_id` is projected out of responses.

### `students`
```
id: string          # e.g. "stu_maya_ellis"
is_active: bool
name, handle, cohort, concentration, year: string
portfolio_score: int (0-100)
graduation_readiness: int (0-100)
avatar, location, join_date: string
```
Index: `{is_active: 1}`.

### `faculty`
```
id, is_active, name, title, specialization, avatar, office_hours: string
credits: string[]
```

### `experiences` (Studio Experiences™)
```
id: string
title, kind, tag, faculty, duration, description, cover, next_session: string
progress: int (0-100)
cohort_size: int
active: bool
```

### `lessons`
```
id, experience_id, title, chapter, duration, kind, video_poster, instructor, summary: string
chapters: [{ t: string, title: string }]
resources: [{ title, kind, module: string }]
next_actions: [{ label, module: string }]
```
Index: `{experience_id: 1}`.

### `journeys`
```
id, student_id, title, phase: string
milestones: [{ label, done, current?, date }]
progress: int
```

### `assignments`
```
id, title, experience, kind, due, status, priority: string
```
Status: `not_started | in_progress | submitted`. Priority: `low | medium | high`.

### `capstones`
```
id, student_id, title, phase, advisor, industry_reviewer, cover, linked_module: string
progress: int
linked_songs: int
```

### `portfolio_items`
```
id, title, kind, reviewer, cover: string
score: int
```

### `songs` (student's 30 Song Progress™ pipeline)
```
id, student_id, title, status: string
number: int
co_writers: string[]
inheira_registered: bool
vaulta_royalty_active: bool
```
Status enum: `locked | writing | demo | recorded | mixed | mastered | released`.
Index: `{student_id: 1, number: 1}`.

### `calendar`
```
id, student_id, date, start, end, title, kind, location, module: string
today: bool
```
Index: `{student_id: 1, date: 1}`.

### `sessions` (Master Sessions™, Live Industry)
```
id, title, when, guest, kind, cover: string
upcoming: bool
```

### `teams`
```
id, name, kind, active_project, module_link, avatar: string
members: string[]
```

### `messages`
```
id, from, kind, preview, when, avatar: string
unread: bool
```

### `achievements`
```
id, student_id, title, when, kind: string
```

### `cohorts`
```
id, name, concentration_mix: string
students, avg_score, graduation_ready, at_risk: int
```

### `reviews`
```
id, student, kind, experience, status, submitted, priority, avatar: string
needs_approval: bool
```

### `hubs` (Ecosystem Hub summary)
```
id, module, title, headline, cta_module: string
activity: [{ when, text, kind }]
metrics: [{ label, value }]
```

### `chat_sessions` (AIAH)
```
session_id: string
messages: [{ role: "user"|"assistant", content: string }]
```

Constraints: all `id` values unique per collection; no cross-collection FK enforced in Mongo — enforced at app layer.

---

## 5. API Documentation

All endpoints are prefixed `/api`. Success = `200`. Errors follow FastAPI defaults (JSON `{ detail }`).

### 5.1 Meta
| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/` | GET | none | Platform metadata |
| `/me?role=student\|faculty` | GET | none (v1.0) | Active persona |

### 5.2 Student
| Route | Method | Response |
|-------|--------|----------|
| `/student/dashboard` | GET | `{student, journey, schedule, songs, capstones, experiences, sessions, achievements}` |
| `/student/journeys` | GET | `{experiences}` |
| `/student/experience/{exp_id}` | GET | `{experience, lessons}` |
| `/student/lesson/{lesson_id}` | GET | `Lesson` |
| `/student/assignments` | GET | `{assignments}` |
| `/student/capstones` | GET | `{capstones}` |
| `/student/songs` | GET | `{songs}` |
| `/student/portfolio` | GET | `{items}` |
| `/student/teams` | GET | `{teams}` |
| `/student/messages` | GET | `{messages}` |
| `/student/calendar` | GET | `{events}` |
| `/student/achievements` | GET | `{achievements}` |

### 5.3 Faculty
| Route | Method | Response |
|-------|--------|----------|
| `/faculty/dashboard` | GET | `{faculty, students, cohorts, reviews_pending, sessions_upcoming, approvals, stats}` |
| `/faculty/students` | GET | `{students}` |
| `/faculty/reviews` | GET | `{reviews}` |
| `/faculty/cohorts` | GET | `{cohorts}` |
| `/faculty/curriculum` | GET | `{experiences, modules}` |
| `/faculty/analytics` | GET | `{engagement[], portfolio_score[], industry_participation, capstone_readiness, graduation_readiness}` |

### 5.4 Ecosystem
| Route | Method | Response |
|-------|--------|----------|
| `/ecosystem` | GET | `{hubs}` |
| `/ecosystem/{module}` | GET | `Hub` (`ancrlab | ancrsync | coheir | inheira | vaulta | ancrlaunch | ancrview | ancrwav | ancrid`) |

### 5.5 AIAH — streaming
`POST /api/aiah/stream`
**Body:** `{ session_id: string, message: string, context?: object, role?: "student"|"faculty" }`
**Response:** `text/event-stream` — successive `data: {"delta": "…"}` chunks, terminated by `data: {"done": true}`.
**Auth:** none in v1.0; requires JWT in v1.5.
**Example**
```
POST /api/aiah/stream
{
  "session_id": "aiah_x9",
  "message": "Which 3 songs should I finish next?",
  "role": "student",
  "context": { "page": "/thirty-song" }
}
```

`GET /api/aiah/history/{session_id}` → `{ session_id, messages[] }`.

### 5.6 Error handling
`404 { detail: "experience not found" }`, `500 { detail: "AIAH not configured" }` if `EMERGENT_LLM_KEY` missing.

---

## 6. UI Specification

Every ANCRA page uses `AppShell` (left nav 248px, top bar 72px, film-grain overlay, ambient brand halos, AIAH dock, Command Palette).

### 6.1 Screens (30+)
See `/frontend/src/pages/` — every screen documented in `docs/UI-Inventory.md` (Phase 2 delivery). Key screens:
- **Dashboard** — 12-col grid: journey ring · schedule · portfolio + 30 Song grid; experiences; Master Sessions; Capstones; Achievements; Ecosystem Launcher.
- **Learning Journey™** — filterable tile catalog.
- **Studio Experience detail** — cinematic hero + lesson list + ecosystem outs.
- **Lesson Player** — video poster + chapters sidebar + resources + Open in ANCRLAB CTA + Continue-the-journey ecosystem cards.
- **30 Song Progress™** — pipeline stats + 30 song cards.
- **Faculty Command Center** — KPI row + Approvals + AIAH insight + Cohorts.
- **Grading** — waveform + rubric bars + AIAH feedback draft + notes.
- **AI Course Builder** — brief textarea + generated week composition.

### 6.2 Responsive
- Left nav collapses under `md`.
- Grids fall to single column under `md`.
- Cinematic hero heights reduce to `52vh` under `md`.

### 6.3 Loading / empty / error
- SWR loading → skeleton (dashboard) or `Loading…` mono line (leaf screens).
- Empty kanban column → `Empty` mono.
- API error → `sonner` toast; AIAH offline degrades gracefully.

### 6.4 Accessibility
- All interactive elements have `data-testid`.
- Focus ring: 1px white/40 outline.
- `alt` attribute on avatars/covers.
- Contrast ≥ WCAG AA on primary text.
- Keyboard: Palette responds to ↑↓↵esc; role switcher is focusable.

---

## 7. Component Inventory (React)

| Component | Purpose | Props |
|-----------|---------|-------|
| `AppShell` | Root layout for ANCRA (student + faculty) | `children` |
| `ModuleShell` | Root layout for standalone ecosystem modules | `current`, `children` |
| `EcosystemNav` | Left nav with ecosystem, workspace, utility sections | none |
| `TopBar` | Search, role switcher, notifications, avatar | `onOpenPalette` |
| `AIAHDock` | Floating streaming AIAH panel | none |
| `CommandPalette` | Global Cmd/Ctrl+K palette | `open`, `onClose` |
| `EcosystemLauncher` | 10-module chip strip | `current` |
| `AncraLogo` / `AncrLogo` | Brand marks | `className`, `variant` |
| `Section` | Consistent page header | `eyebrow`, `title`, `sub`, `right` |
| `ExperienceTile` | Cinematic Studio Experience™ card | `exp`, `onClick` |
| `ProgressRing` | Journey ring | `value`, `size`, `stroke`, `label`, `sub` |
| `StatCell` | Dense KPI cell | `label`, `value`, `hint`, `accent` |
| `Chip` | Tone-aware chip (default / accent / success / warn) | `children`, `tone` |
| Page components | See `pages/**/*.jsx` (30+) | route-scoped |

Reusability: `Section`, `StatCell`, `Chip`, `EcosystemLauncher`, and `ModuleShell` are the primary reused components. `AIAHDock` and `CommandPalette` are singletons.

---

## 8. Business Rules

- **Role switch is client-side only in v1.0** (localStorage). Post-SSO it becomes a claim on the JWT.
- **A student's `portfolio_score` is read-only from ANCRA** — computed and owned by ANCRID.
- **A `Song` can only reach `mastered` if it has been through `mixed`** (linear pipeline; skip prohibited).
- **`inheira_registered = true` implies at least one `song.status ∈ {mixed, mastered, released}`**.
- **Faculty cannot grade their own submissions** (enforced post-SSO).
- **Assignment `priority = high` surfaces in the Approvals sort** first.
- **AIAH must not leak markdown** — system prompt enforces plain text.
- **Command Palette** is always accessible — Cmd/Ctrl+K works even inside modal contexts (but respects Escape).

---

## 9. ANCR Ecosystem Integration (ANCRA-specific)

### 9.1 With **ANCRID™**
- Reads: `Creator` profile (name, handle, avatar, portfolio_score, graduation_readiness, mobility).
- Writes (via events): `session.completed`, `assignment.submitted`, `review.signed` → ANCRID recomputes score.

### 9.2 With **ANCRLAB™**
- Lesson "Open in ANCRLAB™" launches the studio session.
- Assignment kind `ancrlab` requires a submission uploaded through ANCRLAB.
- ANCRA receives `song.mastered` → increments 30 Song Progress™.

### 9.3 With **ANCRSync™**
- Assignment kind `collaboration` opens an ANCRSync writing room.
- ANCRSync emits `session.completed` back to ANCRA.

### 9.4 With **COHEIR™**
- Live Industry Sessions and Office Hours calendar events surface in ANCRA's `/calendar`.
- COHEIR emits `review.signed` → ANCRA renders in the Reviews / Approvals surfaces.

### 9.5 With **INHEIRA™**
- Lesson resources kind `inheira` link to registration flow.
- INHEIRA emits `split.verified` → ANCRA updates the linked song status.

### 9.6 With **Vaulta™**
- ANCRA surfaces `royalty.received` events as achievements.
- Faculty analytics pull anonymised income-participation stats from Vaulta.

### 9.7 With **ANCRLaunch™**
- Graduation Dashboard reads employer-viewing count and career readiness score.

### 9.8 With **ANCRVIEW™** and **ANCRWAV™**
- Master Session™ recordings live in ANCRVIEW.
- ANCRWAV releases update ANCRA achievements + Portfolio Progress.

---

## 10. Security Specification

- **Auth (v1.5+):** JWT (RS256) issued by ANCRID; verified by ANCRA middleware.
- **Authorization:** claim-based; `role ∈ {student, faculty, adjunct, air, eir, admin}`.
- **Session:** access 15m, refresh 7d (HttpOnly, SameSite=Lax, Secure).
- **Rate limits:** 60 rpm/user on read endpoints; 10 rpm on AIAH streaming per session; 100 rpm on write.
- **Encryption:** TLS 1.3 in transit; MongoDB at-rest encryption.
- **Audit log:** every faculty grading + approval action emits `access.audit`.
- **Privacy:** students can export their data (JSON) and request deletion (soft-delete tombstones).
- **AIAH:** prompts never contain PII beyond the active user's context; no cross-user leakage.

---

## 11. Testing Documentation

- **Backend tests** at `/app/backend/tests/backend_test.py` — 30/30 passing (see `test_reports/iteration_1.json`).
- **Frontend flows** verified via Playwright (test agent iteration 1).
- **Known limitations (v1.0):**
  - Single active persona per environment.
  - No pagination on collections > 500.
  - Curriculum Builder canvas is in-memory only.
  - Grading + Rubrics are visual mocks (no persistence).

---

## 12. Deployment Guide

### 12.1 Environment variables
Backend `.env`:
```
MONGO_URL="mongodb://…"
DB_NAME="…"
CORS_ORIGINS="*"
EMERGENT_LLM_KEY="sk-emergent-…"
```
Frontend `.env`:
```
REACT_APP_BACKEND_URL="https://…preview.emergentagent.com"
```

### 12.2 Required services
- MongoDB 6+ (Motor async driver).
- Emergent LLM proxy (Claude Sonnet 4.5).
- Static hosting for the React SPA.

### 12.3 Build
- Backend: `pip install -r requirements.txt && uvicorn server:app --host 0.0.0.0 --port 8001`.
- Frontend: `yarn install && yarn build` → static bundle.

### 12.4 Deploy
- Container image per service.
- K8s Ingress routes `/api/*` → backend, `/` → frontend.
- Rollback = redeploy prior tag (blue/green).

---

## 13. Production Readiness Checklist

**Completed**
- All 30+ screens are visually production-ready.
- Backend endpoints seeded and responding.
- AIAH streaming live (Claude Sonnet 4.5 via Emergent Universal Key).
- Command Palette global.
- Ecosystem Launcher on every homepage.
- Standardized ModuleShell across every module.

**Remaining engineering work**
- SSO via ANCRID + JWT enforcement on all routes.
- Persistence for Curriculum Builder, Rubrics, Grading submissions, AI Course Builder outputs.
- Event bus subscriptions (song.mastered, review.signed, passport.updated).
- Rate limiting, audit log, structured logs.
- Multi-tenant support.
- Real-time features (Writing Room presence, live critique streams).

**Mocked (declared)**
- `INHEIRA_PROJECTS`, `ANCRLAB_SESSIONS`, `ANCRSYNC_COLLABS`, `FILES` in Command Palette are static.
- Grading waveform is decorative.
- AI Course Builder "compose draft" is a fixed 6-block scaffold; production must call Claude for real generation.

**Technical debt**
- `server.py` is one file — split into routers by domain in v1.5.
- No pagination on list endpoints.
- CORS wildcard.
- Frontend routes list will benefit from lazy loading.

---

## 14. Engineering Roadmap

| Phase | Scope |
|-------|-------|
| **MVP (v1.0)** | Design-complete demo; single-persona; seeded Mongo; AIAH live |
| **Phase 2 (v1.5)** | ANCRID SSO + JWT; persistence for Builders + Grading; pagination; error boundaries |
| **Phase 3 (v2.0)** | Event bus; real-time Writing Rooms; live critique; ANCRLAB integration |
| **Production (v2.5)** | Rate limiting, audit, GDPR flows, multi-tenant |
| **Enterprise (v3.0)** | White-label per institution, SLA-backed AIAH, SCIM provisioning |

---

## 15. Architecture Decision Record

| # | Decision | Rationale |
|---|----------|-----------|
| A-1 | FastAPI + Motor + Mongo | Fast iteration, JSON-native, matches Emergent stack |
| A-2 | Emergent LLM Key for AIAH | Zero-config Claude Sonnet 4.5 access; no per-provider SDK |
| A-3 | SWR over Redux | Server-cache first; no client state graph needed in v1 |
| A-4 | Client-side role switch in v1 | Faster demo; JWT is the v1.5 path |
| A-5 | Single `server.py` in v1 | Optimises for read-through comprehension during design phase |
| A-6 | Custom command palette (no `cmdk`) | Zero dependency; full control over grouping and preview |
| A-7 | New-tab launches between modules | Preserves state; investors see distinct products |
| A-8 | Tailwind + hand-rolled tokens | Design velocity + type-safe hairlines/glass |
| A-9 | Playfair + JetBrains Mono + Instrument Sans | Distinctive editorial + technical hybrid; avoids "AI slop" fonts |

---

## 16. Handoff Notes for the CTO

- ANCRA is the **most complete** module in the ecosystem — treat it as the reference for shell/design/palette/AIAH integration.
- **Highest-value next step:** wire ANCRID SSO so role switching becomes real; every downstream Phase 2 item depends on it.
- **Do not migrate** the current MongoDB seed logic as-is — replace with proper migrations and per-tenant data model.
- **Watch for:** AIAH cost — every dashboard visit could tempt automatic prompt-per-view. Keep it on user-initiated request only.
- **Reference files:** `frontend/src/App.js` (route map), `backend/server.py` (endpoint map), `frontend/src/lib/modules.js` (ecosystem registry).
