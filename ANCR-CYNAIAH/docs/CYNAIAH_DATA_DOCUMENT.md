# CYNAIAH™ — Comprehensive Technical Data Document

**Version**: 0.2.0 (Production Studio milestone)
**Date**: 2026-02-14
**Repo root**: `/app`
**Preview URL**: `https://vision-impact-lab.preview.emergentagent.com`

---

## 1. Executive Summary

CYNAIAH™ is a cinematic, dark-first, full-stack creative platform for the **School of Film, Visual Storytelling & Emerging Media** — the film/visual-production arm of the **ANCR ecosystem**. It combines a film-school LMS, a project workspace, an AI Visual Lab, a music-sync studio, a physical Production Studio, and a rights-and-credits ledger into a single premium interface.

The MVP ships **11 first-priority experiences fully wired** — the Production Studio (with an advisory AI Coverage Coach and one-page PDF call sheets) is now live — and 8 additional destinations remain scaffolded with meaningful structural previews so navigation is complete end-to-end.

- **Tagline**: Vision | Story | Impact
- **Backend**: FastAPI + MongoDB
- **Frontend**: React 19 + Tailwind + shadcn/ui
- **Auth**: Temporary JWT (structured for future ANCRID SSO swap)
- **AI**: Claude Sonnet 4.5 (script + Coverage Coach + Continuity Diff) + Gemini Nano Banana (image + character consistency) via Emergent Universal LLM Key
- **Physical-production PDF**: `reportlab` A4 one-pager for daily call sheets
- **Tests**: iteration 1 — 33/33 backend passing (real AI). iteration 2 — 5/5 Production Studio & Coverage Coach tests passing, plus full frontend Playwright verification.

---

## 2. Design & Brand System

### 2.1 Brand assets

| Asset | Path | Use |
|---|---|---|
| Full CYNAIAH logo (crescent + wordmark + tagline, transparent bg) | `/app/frontend/public/brand/cynaiah-logo.png` | Login, Register, marketing |
| CYNAIAH mark only (crescent + spark) | `/app/frontend/public/brand/cynaiah-mark.png` | Sidebar header, favicon-scale usage |
| ANCR ecosystem mark | `/app/frontend/public/brand/ancr-logo.png` | "Powered by ANCR" lockups |

All logos are the official uploaded artwork — cropped and dark-background-transparentized only. No redraws, no replacements.

### 2.2 Color system (Tailwind `cynaiah.*` namespace)

| Token | Hex | Meaning |
|---|---|---|
| `cynaiah.void` | `#030303` | Deep cinematic background |
| `cynaiah.base` | `#0A0A0C` | Cards, primary surfaces |
| `cynaiah.elev` | `#121216` | Elevated glass panels |
| `cynaiah.line` | `rgba(255,255,255,0.06)` | Borders |
| `cynaiah.violet` | `#6D28D9` | Deep violet accent |
| `cynaiah.blue` | `#2563EB` | Electric blue accent |
| `cynaiah.cyan` | `#06B6D4` | Cyan accent (primary highlight) |
| `cynaiah.magenta` | `#DB2777` | Magenta accent |
| `cynaiah.orange` | `#F97316` | Warm orange (feedback, notifications) |
| `cynaiah.gold` | `#D4AF37` | Restrained gold (rights/awards) |

The primary CTA gradient (`.cyn-btn-primary` / `.cyn-bg-gradient`) travels cyan → violet → magenta → orange — a direct reading of the CYNAIAH logo palette.

### 2.3 Typography

Loaded via Google Fonts in `/app/frontend/public/index.html`:

- **Outfit** — headings (`font-heading`, `.font-heading`) — modern, cinematic
- **Manrope** — body (`font-body`, default) — readable, editorial
- **JetBrains Mono** — monospaced (timestamps, prompts, technical labels)

### 2.4 Ambient design language

Reusable primitives (`/app/frontend/src/index.css`):

- `.glass` / `.glass-strong` — backdrop-blur glass panels with subtle inset highlight and shadow
- `.glass-hover` — cyan glow on hover
- `.cyn-hero-glow` — animated multi-radial ambient light (violet + cyan + orange beams)
- `.cyn-noise` — subtle SVG-noise grain overlay via `::before`
- `.lift` — translate-Y + border/glow lift on hover
- `.cyn-text-gradient` / `.cyn-bg-gradient` — brand color travel
- `.cyn-btn-primary` / `.cyn-btn-ghost` — CTA and ghost buttons
- `.cyn-divider` — horizontal fading line
- `.status-dot` + `animate-pulse-soft` — live-status indicators
- `animate-beam-drift`, `animate-fade-up` — subtle motion

### 2.5 Responsive behavior

- Desktop-first at 1440–1920px; layout collapses cleanly to a single column below `md`.
- The 264 px sidebar is fixed on desktop and has its own scroll for long nav.
- Main content area uses independent vertical scroll (`.custom-scrollbar` for a slim aesthetic scrollbar).

---

## 3. Architecture

### 3.1 High-level

```
┌───────────────────────────────────────────────────────────────┐
│                     React 19 SPA (port 3000)                  │
│  - React Router 7  - shadcn/ui  - sonner - lucide-react       │
│  - AuthContext (JWT in localStorage) → axios interceptor      │
└──────────────────────────────┬────────────────────────────────┘
                               │ REACT_APP_BACKEND_URL/api/*
                               ▼
┌───────────────────────────────────────────────────────────────┐
│              FastAPI (uvicorn, 0.0.0.0:8001)                  │
│  - JWT (PyJWT + bcrypt)  - Pydantic v2 models                 │
│  - Motor async Mongo client                                   │
│  - emergentintegrations (Claude + Gemini)                     │
└──────────────────────────────┬────────────────────────────────┘
                               ▼
                       MongoDB (motor)
                     [db=$DB_NAME collections]
```

### 3.2 Environment variables

`/app/backend/.env`:
```
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="*"
EMERGENT_LLM_KEY=sk-emergent-9E56bEc3c17852e14A
JWT_SECRET=cynaiah_ancr_ecosystem_jwt_secret_dev_only
JWT_ALG=HS256
```

`/app/frontend/.env`:
```
REACT_APP_BACKEND_URL=https://vision-impact-lab.preview.emergentagent.com
```

Nothing is hardcoded in code — all creds/URLs come from env.

### 3.3 Deployment / process model

- Supervisor manages `backend` (uvicorn) and `frontend` (CRA dev server) — do not restart on regular code changes; hot reload is on.
- Static logo assets served from `/app/frontend/public/brand/`.
- AI-generated images written to `/app/backend/generated_images/` and served via `GET /api/generated/{filename}`.

---

## 4. Backend

### 4.1 File map

| File | Lines | Responsibility |
|---|---|---|
| `/app/backend/server.py` | ~1260 | FastAPI app, routes (auth, projects, story lab, sync studio, rights, learn, portfolio, characters, production studio, coverage coach, callsheet PDF), DB wiring, startup seed, mount |
| `/app/backend/models.py` | ~230 | Pydantic v2 models + enums + `_uid`, `_now_iso` |
| `/app/backend/auth.py` | ~55 | `hash_password` / `verify_password` / `create_access_token` / `get_current_user_id` |
| `/app/backend/ai_service.py` | ~340 | Claude script gen + Gemini Nano Banana image gen + character-reference conditioning + Sync Autopilot + Continuity Diff (modular, key-swappable) |
| `/app/backend/callsheet_pdf.py` | ~180 | `reportlab` A4 one-page call-sheet renderer (header, call info, crew, scenes, shots, locations, weather, notes) |
| `/app/backend/seed_data.py` | ~360 | Idempotent demo data (users, projects, courses, cues, rights, portfolio, characters, production…) |
| `/app/backend/requirements.txt` | — | Pinned Python deps incl. `emergentintegrations`, `pyjwt`, `bcrypt`, `motor`, `reportlab` |

### 4.2 Authentication

- **Algorithm**: HS256 (env-driven), 14-day expiry
- **Password hashing**: bcrypt
- **Claims**: `sub` (user id), `email`, `role`, `iss=cynaiah`, `iat`, `exp`
- **Extraction**: FastAPI dependency `get_current_user_id` reads the `Authorization: Bearer …` header (`HTTPBearer`), decodes, returns `sub`.
- **ANCRID readiness**: The `iss` claim namespace and the isolated `auth.py` module mean swapping to ANCRID SSO is a **provider swap**, not a code rewrite. `create_access_token` becomes a token-verification-only path, and `get_current_user_id` swaps its `jwt.decode` for the ANCRID JWKS-based verifier without touching route handlers.

### 4.3 MongoDB collections

All ids are UUIDv4 strings (never Mongo `ObjectId`), all timestamps ISO 8601 UTC. No `_id` is ever returned (stripped via projections).

| Collection | Purpose | Key fields |
|---|---|---|
| `users` | Auth + profile | `id`, `email` (unique), `name`, `role`, `avatar_url`, `bio`, `program`, `focus_areas[]`, `password_hash`, `created_at` |
| `projects` | Creative projects | `id`, `owner_id`, `title`, `type`, `status`, `progress`, `objective`, `audience`, `format`, `visual_style`, `music_selection`, `story_concept`, `production_approach`, `ai_workflow`, `budget`, `timeline`, `disclosure_notes`, `thumbnail_url`, `collaborators[]`, `tags[]`, `created_at`, `updated_at` |
| `script_documents` | Story Lab docs | `id`, `project_id`, `owner_id`, `title`, `content`, `kind`, `version`, `created_at`, `updated_at` |
| `assets` | Media assets | `id`, `project_id`, `owner_id`, `name`, `type`, `url`, `source` (uploaded/ai_generated/library), `prompt`, `provider`, `tags[]`, `created_at` |
| `music_tracks` | Sync Studio track meta | `id`, `project_id`, `title`, `artist`, `duration_seconds`, `ownership`, `composers[]`, `publishers[]`, `waveform[]` (0..1 floats) |
| `sync_cues` | Sync markers | `id`, `project_id`, `timestamp`, `label`, `type` (beat/cut/lyric/emotion/transition/scene), `notes` |
| `rights_records` | Rights & credits | `id`, `project_id`, `contributor_name`, `role`, `ownership_type` (owner/contributor/licensor/ai_tool), `ai_disclosure`, `consent_recorded`, `licensing_notes`, `commercial_use` |
| `courses` | Learn catalog | `id`, `title`, `category`, `description`, `thumbnail_url`, `lessons_count`, `duration_hours`, `level`, `instructor` |
| `enrollments` | Student ↔ course | `id`, `user_id`, `course_id`, `progress`, `status`, `started_at` |
| `portfolio` | Curated reel | `id`, `user_id`, `project_id`, `title`, `category`, `thumbnail_url`, `description`, `featured`, `created_at` |
| `feedback` | Faculty/mentor notes | `id`, `project_id`, `author_name`, `author_role`, `message`, `created_at` |
| `notifications` | Bell popover | `id`, `user_id`, `message`, `type`, `read`, `created_at` |
| `calendar_events` | Home + Calendar | `id`, `user_id`, `project_id`, `title`, `date`, `kind` |
| `characters` | Story-Lab locked characters (Nano Banana refs) | `id`, `project_id`, `owner_id`, `name`, `age`, `identity_prompt`, `reference_image_urls[]`, `visual_style`, `created_at` |
| `prod_crew` | Cast & crew | `id`, `project_id`, `name`, `role`, `department`, `call_time`, `email` |
| `prod_locations` | Locations + release status | `id`, `project_id`, `name`, `address`, `hours`, `release_status` (signed/pending) |
| `prod_equipments` | Equipment list + day rates | `id`, `project_id`, `name`, `category`, `quantity`, `vendor`, `day_rate` |
| `prod_scenes` | Scenes for a project | `id`, `project_id`, `number`, `title`, `location`, `description` |
| `prod_shots` | Shots for a scene | `id`, `project_id`, `scene_id`, `number`, `shot_size`, `camera_move`, `description`, `status` (planned/scheduled/in_progress/shot/wrapped) |
| `prod_callsheets` | One-page daily call sheets | `id`, `project_id`, `date`, `call_time`, `location`, `weather`, `notes` |
| `prod_budget` | Budget line items | `id`, `project_id`, `line`, `category`, `vendor`, `amount`, `spent` |
| `prod_notes` | Daily journal | `id`, `project_id`, `date`, `author`, `message` |
| `prod_releases` | Release forms (talent/model/location) | `id`, `project_id`, `party`, `kind`, `status`, `notes` |

### 4.4 API surface

All routes prefixed with `/api`. Bearer JWT required unless noted.

#### System
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/` | ❌ | Service metadata + tagline |
| GET | `/api/health` | ❌ | Liveness probe |
| POST | `/api/seed` | ❌ | Idempotent demo seed (returns demo creds) |
| GET | `/api/generated/{filename}` | ❌ | Serves AI-generated PNGs |

#### Auth
| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/api/auth/register` | `UserCreate` | `TokenResponse` (JWT + `UserPublic`) |
| POST | `/api/auth/login` | `LoginPayload {email,password}` | `TokenResponse` — auto-triggers `ensure_seed` |
| GET | `/api/auth/me` | — | `UserPublic` |

#### Dashboard
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/dashboard/summary` | Aggregate: user, counts, active/recent projects, courses+progress, upcoming events, notifications, recent feedback, portfolio preview |

#### Projects
| Method | Path | Notes |
|---|---|---|
| GET | `/api/projects` | Query: `type`, `status`, `q` (title contains) |
| POST | `/api/projects` | `ProjectCreate` — default thumbnail chosen per type |
| GET | `/api/projects/{id}` | Owner-scoped |
| PATCH | `/api/projects/{id}` | Partial `ProjectUpdate`, bumps `updated_at` |
| DELETE | `/api/projects/{id}` | Cascade-lite: also removes scripts, rights, cues, music, assets |

#### Scripts (Story Lab)
| Method | Path | Notes |
|---|---|---|
| GET | `/api/projects/{id}/scripts` | Owner-scoped |
| POST | `/api/scripts` | `ScriptCreate` |
| PATCH | `/api/scripts/{id}` | Increments `version` |
| DELETE | `/api/scripts/{id}` | Owner check |

#### Sync Studio
| Method | Path | Notes |
|---|---|---|
| GET | `/api/projects/{id}/music` | Returns seeded track or a synthesized default so studio is never empty |
| GET | `/api/projects/{id}/cues` | Sorted by `timestamp` |
| POST | `/api/cues` | `SyncCueCreate` |
| DELETE | `/api/cues/{id}` | — |

#### Rights & Credits
| Method | Path |
|---|---|
| GET | `/api/projects/{id}/rights` |
| POST | `/api/rights` |
| DELETE | `/api/rights/{id}` |

#### Learn
| Method | Path | Notes |
|---|---|---|
| GET | `/api/courses` | 6 seeded pathways |
| GET | `/api/enrollments` | Joined with `course` |
| POST | `/api/enrollments` | Idempotent — returns existing if enrolled |

#### Portfolio
| Method | Path |
|---|---|
| GET | `/api/portfolio` |
| POST | `/api/portfolio` |
| PATCH | `/api/portfolio/{id}` |
| DELETE | `/api/portfolio/{id}` |

#### Notifications, Feedback, Calendar, Assets
| Method | Path |
|---|---|
| GET | `/api/notifications` |
| POST | `/api/notifications/{id}/read` |
| GET | `/api/projects/{id}/feedback` |
| GET | `/api/calendar` |
| GET | `/api/assets` (optional `project_id`) |

#### Production Studio
Nine physical-production collections managed through one dynamic-`kind` handler plus dedicated advisory endpoints. `kind` ∈ `crew | location | equipment | scene | shot | callsheet | budget | note | release`.

| Method | Path | Notes |
|---|---|---|
| GET | `/api/projects/{project_id}/production/overview` | Returns `{project, crews[], locations[], equipments[], scenes[], shots[], callsheets[], budgets[], notes[], releases[], stats}` — one call powers the whole page |
| POST | `/api/projects/{project_id}/production/{kind}` | Create item of `kind`. `_id`, `project_id`, `owner_id`, `created_at` are server-set |
| PATCH | `/api/production/{kind}/{item_id}` | Owner-scoped partial update (used e.g. to change shot status inline) |
| DELETE | `/api/production/{kind}/{item_id}` | Owner-scoped remove |
| POST | `/api/projects/{project_id}/production/coverage-coach` | **Advisory only.** Claude Sonnet 4.5 reviews scenes + shots and returns `{provider, scenes:[{scene_number, scene_title, possibly_missing[], questions_for_student[], compliments[]}], note}`. Never rewrites the plan — asks questions. Requires ≥1 scene and ≥1 shot (else 400) |
| GET | `/api/production/callsheet/{callsheet_id}/pdf` | Renders a one-page A4 PDF (via `reportlab`) with project header, call info, crew (with call times), scenes on the day, top-10 shots, locations, weather, notes. Returns `application/pdf` with `Content-Disposition: attachment` |

Route ordering matters: `/coverage-coach` **must** be defined above the dynamic `/{kind}` route in `server.py` or FastAPI will match `kind="coverage-coach"` first (regression tracked by pytest).

#### Character Consistency (Nano Banana)
| Method | Path | Notes |
|---|---|---|
| GET | `/api/projects/{id}/characters` | Owner-scoped |
| POST | `/api/characters` | Locks a character with identity prompt + reference images |
| POST | `/api/characters/{id}/references` | Upload reference frames (multipart) |
| POST | `/api/characters/{id}/generate-frame` | Nano Banana image gen conditioned on locked identity + references |
| POST | `/api/characters/{id}/continuity-diff` | Claude vision compares two frames and returns a structured, humble drift report — `{summary, confidence, differences[], questions_for_student[]}`. Advisory: the student decides |

#### AI
| Method | Path | Model | Body | Response |
|---|---|---|---|---|
| POST | `/api/ai/script` | Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`) | `{prompt, kind, tone, project_id?}` | `{content, kind, saved_script?, provider}` |
| POST | `/api/ai/image` | Gemini Nano Banana (`gemini-3.1-flash-image-preview`) | `{prompt, style, save_as_asset, project_id?}` | `{filename, url, mime_type, prompt, provider, saved_asset?}` |
| POST | `/api/ai/autopilot` | Claude Sonnet 4.5 | `{project_id}` | Generates Sync Studio cue suggestions from the music track + treatment |
| POST | `/api/projects/{id}/music/upload` | — (multipart) | `file` | Persists uploaded audio + regenerates waveform for real playback |

`kind` for script gen: `screenplay | treatment | logline | shotlist | storyboard_beats`. Each has a bespoke `_kind_instructions` prompt inside `ai_service.py`.

### 4.5 AI service internals (`ai_service.py`)

- Instantiates `LlmChat` with a new `session_id` per call (stateless generations).
- `SCRIPT_SYSTEM` is a strict system prompt that: writes cinematic prose, refuses to impersonate humans, always discloses AI assistance, and outputs industry format (no markdown fences).
- Image gen uses `.with_params(modalities=["image","text"])` and `send_message_multimodal_response`. Result base64 → decoded → saved as `cynaiah_{uuid}.png` in `GENERATED_DIR`.
- Provider constants (`AI_TEXT_PROVIDER`, `AI_TEXT_MODEL`, `AI_IMAGE_PROVIDER`, `AI_IMAGE_MODEL`) sit at the top of the file — swap them once when moving off the Emergent key.

### 4.6 Seed data (`seed_data.py`)

Runs on startup and on every `/auth/login` (idempotent — no-op if `student@cynaiah.demo` exists).

Creates:
- 2 users — Aria Okafor (student) + Prof. Idris Bello (faculty)
- **6 projects** across every core CYNAIAH modality:
  - "Neon Heart" (music video, in production, hybrid AI)
  - "The Blue Hour" (short film, preproduction, traditional)
  - "Atlas City" (CGI scene, concept, AI-assisted)
  - "Ancestor Voices" (documentary, post-production)
  - "HEIRWEAR — Autumn Campaign" (commercial, in review)
  - "Lantern Lake" (2D animation, in production)
- 5 rights records for Neon Heart (director/artist/DP + Nano Banana + Claude AI disclosures)
- 1 music track ("Neon Heart" by Nova K.) with a synthesized 260-sample waveform + 9 sync cues covering all cue types
- 2 script documents (treatment + logline)
- 4 mood-board assets
- 6 courses spanning Foundations / Directing / Emerging Media / Production / Post / Rights
- 4 enrollments with varied progress
- 2 pieces of faculty/mentor feedback
- 4 notifications (1 read, 3 unread)
- 4 calendar events
- 3 portfolio items (2 featured, 1 WIP)

### 4.7 Backend test suite

- Location: `/app/backend/tests/test_cynaiah_backend.py` (33 core tests) + `/app/backend/tests/test_production_studio.py` (5 Production Studio tests)
- Framework: pytest, real HTTP calls against `REACT_APP_BACKEND_URL`
- **Result**: **iteration 1** — 33/33 passing (real Claude Sonnet 4.5 script gen + real Gemini Nano Banana image gen with file fetch verification). **iteration 2** — 5/5 Production Studio + Coverage Coach passing (route-shadowing regression guard, callsheet PDF magic-byte verification, empty-project 400, no-token 401, Claude advisory schema).
- Reports: `/app/test_reports/iteration_1.json`, `/app/test_reports/iteration_2.json`

Known minor hardening items (documented in the report, deferred by design):
- Nested project GETs (`music`/`cues`/`rights`/`feedback`) skip a project-ownership check
- `DELETE /cues` and `DELETE /rights` skip an ownership check
- `PATCH /scripts` accepts arbitrary dict (no dedicated `ScriptUpdate`)
- `/api/generated/{filename}` is public

These are **P0 for the ANCRID SSO cutover** and tracked in the PRD backlog.

---

## 5. Frontend

### 5.1 File map (application code, not shadcn/ui primitives)

```
/app/frontend/src/
├── App.js                          # Router + AuthProvider + Toaster
├── App.css                         # (empty legacy)
├── index.css                       # Global cinematic utilities
├── index.js                        # ReactDOM.createRoot
├── constants/
│   └── testIds.js                  # TID map (data-testid strings)
├── context/
│   └── AuthContext.jsx             # Provider + useAuth hook
├── lib/
│   ├── api.js                      # axios instance, token, resolveAssetUrl
│   └── constants.js                # PROJECT_TYPES / STATUSES / ROLES
├── components/
│   └── cynaiah/
│       ├── AppShell.jsx            # Sidebar + <Outlet /> gate
│       ├── Sidebar.jsx             # 20-item navigation + user + Powered-by
│       ├── TopBar.jsx              # Title + search + notifications popover
│       ├── Brand.jsx               # CynaiahMark, CynaiahLogoLarge, AncrMark, PoweredByAncr
│       └── ProjectCard.jsx         # Cinematic project tile
└── pages/
    ├── Login.jsx                   # Split-hero cinematic login
    ├── Register.jsx                # Glass-modal register with role select
    ├── Home.jsx                    # Studio dashboard (hero + stats + strips)
    ├── Projects.jsx                # Filterable project grid
    ├── ProjectDetail.jsx           # Project hero + brief + quick links + rights snapshot
    ├── Create.jsx                  # 4-step Create wizard (12 project types)
    ├── StoryLab.jsx                # Docs list + editor + Claude AI panel + Storyboard/Treatment builder + Character locker
    ├── AIVisualLab.jsx             # Gemini Nano Banana generator + 12 integration-ready tools
    ├── SyncStudio.jsx              # Waveform + real <audio> playback + cue markers + Sync Autopilot + Rough-cut preview
    ├── ProductionStudio.jsx        # 9-tab physical production hub + Coverage Coach + Call Sheet PDF export
    ├── RightsCredits.jsx           # Contributors + clearance checklist
    ├── Learn.jsx                   # Enrolled + catalog
    ├── Portfolio.jsx               # Featured/add-from-project
    ├── Showcase.jsx                # Public reel view + ANCRVIEW handoff
    └── ComingSoon.jsx              # Structural preview for scaffolded pages
```

### 5.2 Routing (all inside `AppShell` gate except `/auth/*`)

| Path | Component | Category |
|---|---|---|
| `/auth/login` | `Login` | Public |
| `/auth/register` | `Register` | Public |
| `/` | `Home` | Fully wired |
| `/learn` | `Learn` | Fully wired |
| `/create` | `Create` | Fully wired |
| `/projects` | `Projects` | Fully wired |
| `/projects/:id` | `ProjectDetail` | Fully wired |
| `/story-lab` | `StoryLab` | Fully wired |
| `/ai-visual-lab` | `AIVisualLab` | Fully wired |
| `/sync-studio` | `SyncStudio` | Fully wired |
| `/rights-credits` | `RightsCredits` | Fully wired |
| `/portfolio` | `Portfolio` | Fully wired |
| `/showcase` | `Showcase` | Fully wired |
| `/production-studio` | `ProductionStudio` | Fully wired |
| `/edit-finish` | `ComingSoon` | Structural preview |
| `/assets` | `ComingSoon` | Structural preview |
| `/collaborators` | `ComingSoon` | Structural preview |
| `/reviews` | `ComingSoon` | Structural preview |
| `/opportunities` | `ComingSoon` | Structural preview |
| `/calendar` | `ComingSoon` | Structural preview |
| `/messages` | `ComingSoon` | Structural preview |
| `/settings` | `ComingSoon` | Structural preview |
| `*` | Redirect to `/` | — |

### 5.3 Auth flow

1. On app boot, `AuthProvider` reads `cynaiah_token` from `localStorage` and calls `GET /api/auth/me`.
2. `AppShell` shows a full-screen loader until `loading=false`, then redirects to `/auth/login` if no user.
3. `Login.jsx` calls `login(email, password)` from `useAuth` — which stores the JWT and loads user.
4. axios interceptor auto-attaches `Bearer` on every request and force-logouts on any 401.
5. Logout clears token and hard-redirects to `/auth/login`.

### 5.4 Global test-id map

Central catalog at `/app/frontend/src/constants/testIds.js`. Every interactive element (buttons, inputs, cards, nav items, popovers) uses a stable `data-testid`. Naming is kebab-case, function-oriented. Sample:

- `login-email-input`, `login-password-input`, `login-submit-btn`, `demo-fill-btn`
- `quick-create-btn`, `continue-project-btn`
- `nav-home` … `nav-settings` (20 items)
- `project-card`, `project-search-input`, `project-filter-type`, `project-filter-status`, `project-detail-view`
- `create-type-{value}` (per project type), `create-title-input`, `create-step-next`, `create-step-back`, `create-submit-btn`
- `script-editor-textarea`, `script-save-btn`, `script-ai-generate-btn`, `script-ai-prompt-input`, `script-kind-select`
- `ai-image-prompt`, `ai-image-style`, `ai-image-generate-btn`, `ai-image-result`
- `sync-cue-add-btn`, `sync-cue-label-input`, `sync-cue-type-select`, `sync-waveform`
- `rights-add-btn`, `rights-contributor-input`
- `portfolio-feature-toggle`

### 5.5 Page walk-through

#### Home (Studio dashboard)
- **Top bar**: subtitle "Welcome back, {first_name}", title "Studio dashboard", + notifications popover, search, "New project" CTA
- **Cinematic hero**: full-bleed photograph + `cyn-hero-glow` animated beams + `cyn-noise` grain. Two CTAs (start / continue), plus "Open AI Visual Lab"
- **4 stat cards**: Active productions / Courses in progress / Portfolio items / Unread notifications
- **Active productions**: 6 large `ProjectCard` tiles with status pill, type pill, progress bar, collab count, timeline
- **Courses column** (xl:col-span-2): 4 enrolled courses with thumbnails, category, level, progress bars
- **Upcoming panel**: 5 next calendar items with date & title
- **Recent feedback panel**: 3 latest faculty/mentor comments
- **Portfolio strip**: 4 items with hover-scale cinematic thumbnails
- Consumes `GET /api/dashboard/summary` in one round-trip

#### Projects
- 4-column filterable grid (title search + type + status)
- Empty state offers "start a new one"

#### Create (guided wizard)
- **Step 0**: 12 project-type tiles — Music Video / Lyric Video / Visualizer / Short Film / Documentary / Commercial / Branded Content / Animation / CGI Scene / Social Campaign / Live Visuals / Custom
- **Step 1** (Concept): title, objective, story concept
- **Step 2** (Audience & format): audience, format/platform, visual style (8 chip presets + free text), music selection
- **Step 3** (Approach): production approach, AI workflow (traditional / hybrid / AI-assisted), disclosure notes
- **Step 4** (Logistics): budget, timeline
- Progress bar + back/next with disabled-state validation

#### ProjectDetail
- Hero uses project thumbnail + `bg-gradient-to-t` fade
- Status pill (color-coded per `STATUS_TONE`), 12 brief fields displayed in a 2-col dl
- Live status changer (Select) — PATCH persists immediately
- Progress bar
- Quick-link tiles: Story Lab / AI Visual Lab / Sync Studio / Rights & Credits
- Right rail: Story documents / Rights snapshot / Feedback / Delete

#### Story Lab
- 3-column: **document list** (per project) / **editor** (title + kind select + save + delete) / **AI writing partner**
- AI panel labeled "Claude Sonnet 4.5 · script co-writer"; user picks kind + writes brief → Claude call → result populates editor and (if a project is selected) auto-persists as a new script
- Editor is monospaced with generous line-height for screenplay comfort

#### AI Visual Lab
- **Main generator card** with a "LIVE" badge, prompt textarea, 8 style chip presets, Generate CTA
- **Result panel** (empty state → loader → generated frame + provider/style/asset info + gold ethics reminder)
- **Recent renders** rail (thumbnails re-selectable)
- **Character Consistency (Nano Banana)** — Story Lab surfaces a per-project character locker where the student uploads reference frames, writes the identity prompt (age, wardrobe, hair, features), and each generated storyboard frame is conditioned on those references via Gemini Nano Banana `ImageContent`. The **Continuity Diff** endpoint (Claude vision, `POST /api/characters/{id}/continuity-diff`) compares two frames and returns a humble drift report (`summary`, `confidence`, `differences[]`, `questions_for_student[]`) — advisory only, student decides.
- **AI ethics on-set** panel (4 rules)
- **12 integration-ready tool tiles** clearly labeled `Integration-ready`: text-to-video, image-to-image, character consistency, CGI environments, color & lighting, inpainting/extension, voice & dialogue, style transfer, upscaling & restoration, music-responsive visuals, render queue, export management

#### Sync Studio
- Track card: cover, ownership badge, title, artist, timecode `M:SS / M:SS`, cue count, play/pause
- **Waveform**: gradient bars (cyan → violet → magenta), opacity drops after playhead. Cue markers overlaid with label pills colored by type. Playhead is a glowing cyan line. Clicking anywhere on the strip scrubs.
- Playback engine: `requestAnimationFrame` loop, coupled to a real `<audio>` element so uploaded/seeded tracks play with cue markers ticking in sync. **Sync Autopilot** button asks Claude to propose additional cues from the track and treatment; results are staged (never auto-applied).
- **Rough-cut preview**: cross-faded storyboard frames advance with the audio for a Sync-Studio "watch-through".
- **Music upload** (`POST /api/projects/{id}/music/upload`) accepts an MP3/WAV, replaces the seeded synthesized track, and regenerates the waveform.
- **Cue creator** (label + type + Add at current playhead) + gold "log rights before INHEIRA submission" reminder
- **Cue sheet**: timecode, colored type tag, label, Go button (jumps playhead), delete

#### Production Studio (`/production-studio`)
- Header project dropdown auto-selects the first music-video project (`Neon Heart` in the seed).
- **9-tab pill nav**: Overview · Cast & Crew · Scenes & Shots · Locations · Equipment · Call Sheets · Budget · Daily Notes · Releases.
- **Overview**: 8 stat cards (crew / locations / equipment / scenes / shots total / scheduled / completed / call sheets) + a full-width budget bar (spent vs. planned).
- **Cast & Crew, Locations, Equipment, Releases, Notes**: `QuickAdd` inline forms + auto-refreshing table with inline delete.
- **Scenes & Shots**: nested — one card per scene, editable-status shots (planned → scheduled → in_progress → shot → wrapped), per-scene "Add shot" quick form. Every shot deletion is confirmed.
- **Coverage Coach** panel sits at the top of the Scenes tab with an amber advisory pill and the exact copy _"the director makes the final call."_ Pressing `Run Coverage Coach` (`data-testid coverage-coach-run-btn`) calls Claude Sonnet 4.5 via `POST /api/projects/{id}/production/coverage-coach`; results render per-scene with three colored bands: `Possibly missing` (orange), `Questions for you` (cyan), `What already works` (emerald). Disabled with a helper message when there are 0 scenes or 0 shots.
- **Call Sheets**: per-row `PDF` button (`data-testid callsheet-download-pdf-<id>`) calls `GET /api/production/callsheet/{id}/pdf`, receives the `application/pdf` blob, and downloads a filename derived from the project title + shoot date. The generated PDF (via `reportlab`) is one A4 page with header, call info, crew (with call times), scenes for the day, top-10 shots, locations, weather, and notes.
- **Budget**: summary bar (planned / spent / gradient progress) + line-item table with the same `QuickAdd` pattern.

#### Rights & Credits
- **Contributor list**: name, ownership tag colored per type, consent check, AI disclosure pill, licensing notes
- **Add-contributor form**: name/role/ownership/consent/AI disclosure/licensing notes
- **Clearance checklist** (8 items) — client-side ticks with strikethrough
- Bottom hint routes toward INHEIRA rights review

#### Learn
- **In progress row** first with resumable course cards + progress bars
- **Full catalog** (6 courses) with enroll CTAs; enrolled shows "Enrolled · X%" + Open

#### Portfolio
- Featured/unfeatured grid, Star toggle per card, delete
- "Available to add" rail lists all projects not yet in portfolio with an Add button that infers a display category from the project type

#### Showcase
- Cinematic hero using first featured item + "Publish to ANCRVIEW (coming)" CTA
- Grid of the remaining reel
- Footer lockup: "Powered by ANCR" + "Completed work will publish to ANCRVIEW and be credited via ANCRID"

#### ComingSoon (9 destinations)
- Consistent premium scaffold: badge, title, description, bulleted "what you'll find here", CTAs back into working workflows
- Each destination has its own subtitle + 4-line description matching the original problem statement

### 5.6 Sidebar navigation (20 items across 5 groups)

- **Studio**: Home · Learn · Create · Projects
- **Labs**: Story Lab · AI Visual Lab · Production Studio · Edit & Finish · Sync Studio
- **Assets & Sync**: Assets · Collaborators · Reviews · Rights & Credits
- **Network**: Showcase · Opportunities · Portfolio
- **Platform**: Calendar · Messages · Settings

Top of sidebar: CYNAIAH mark + wordmark + tagline.
Middle CTAs: **Quick Create** (primary gradient) and **Continue Project** (ghost).
Bottom: user avatar, name, role, logout icon, "Powered by [ANCR]" lockup.

---

## 6. Rights, Ethics & AI Transparency

The application is opinionated about disclosure and consent — this is a **product feature**, not documentation:

1. Every project stores an explicit `disclosure_notes` field from the wizard.
2. Rights records support a first-class `ownership_type = ai_tool` with an `ai_disclosure` string that renders as a distinct magenta pill.
3. AI Visual Lab shows an "AI ethics on-set" panel and a gold reminder on every generated frame.
4. Sync Studio surfaces ownership + a nudge to log rights before INHEIRA submission.
5. Rights & Credits has a Clearance Checklist mapping directly to the problem-statement requirements (contributor credits, music/visual ownership, releases, licensing, AI tools, consent, commercial restrictions).

The seed data models the pattern: **Gemini Nano Banana** and **Claude Sonnet 4.5** are listed as `ai_tool` contributors on the "Neon Heart" project with proper disclosures.

---

## 7. ANCR ecosystem integration path

The MVP is **structured for**, not merely **compatible with**, the ANCR ecosystem:

| ANCR component | Today in CYNAIAH | Future integration point |
|---|---|---|
| **ANCRID** | JWT with `iss=cynaiah` + isolated `auth.py` | Swap `get_current_user_id` to verify ANCRID JWKS tokens; user records already carry `id`, `email`, `role`, `program`, `focus_areas` |
| **ANCRA** | User has `program` field + Learn structure | Enrollments and courses collections are already the right shape |
| **ANCRLAB** | Music tracks carry `ownership`, `composers[]`, `publishers[]` and are stored per-project | Add an import endpoint that pulls tracks from ANCRLAB by id |
| **INHEIRA** | Rights records with `ai_disclosure`, `consent`, licensing notes + clearance checklist | Add `POST /api/inheira/submit` that bundles all rights + AI disclosures into an INHEIRA-ready payload |
| **ANCRVIEW** | Showcase publishes CTA visible | Add "Publish" endpoint that hands off portfolio items |
| **COHEIR** | Feedback records have `author_role` incl. `mentor` | Add mentorship messaging + review invitations |
| **ANCRLaunch / SOVREIGN** | Opportunities structural page | Wire jobs/festivals API |
| **Vaulta** | Projects carry `budget` | Add per-project ledger of transactions |
| **ANCRSync** | Collaborators list is a first-class field | Add realtime presence + comments |
| **ANCRD** | Public showcase already has grid | Add follow/discovery layer |

---

## 8. Test credentials

Stored in `/app/memory/test_credentials.md`.

| Email | Password | Role |
|---|---|---|
| `student@cynaiah.demo` | `Cynaiah2026!` | student (Aria Okafor) |
| `faculty@cynaiah.demo` | `Cynaiah2026!` | faculty (Prof. Idris Bello) |

Auto-seeded on backend startup and on every `POST /api/auth/login`.

---

## 9. Running & operating

### 9.1 Services (supervisor-managed, do not restart on code changes)

- `sudo supervisorctl status`
- `sudo supervisorctl restart backend` — only after `.env` changes or Python dep installs
- `sudo supervisorctl restart frontend` — only after `package.json` changes
- Logs: `/var/log/supervisor/backend.err.log`, `/var/log/supervisor/frontend.err.log`

### 9.2 Curl smoke test (uses external URL from `frontend/.env`)

```bash
API_URL=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)
TOKEN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"student@cynaiah.demo","password":"Cynaiah2026!"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['access_token'])")
curl -s "$API_URL/api/dashboard/summary" -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool | head -30
```

### 9.3 Reset demo data

Because seed is idempotent, to *reset* you must drop the demo user first. Example:
```bash
mongosh "$MONGO_URL" --quiet --eval "
  db = db.getSiblingDB('$DB_NAME');
  ['users','projects','script_documents','assets','music_tracks','sync_cues',
   'rights_records','courses','enrollments','portfolio','feedback',
   'notifications','calendar_events'].forEach(c => db[c].drop());
"
# Then hit /api/seed (or just log in again)
```

---

## 10. Testing summary

| Layer | Tool | Result |
|---|---|---|
| Backend (33 cases) | pytest against real HTTP + real Claude + real Gemini | **33/33 pass** |
| Frontend | Playwright smoke via screenshot tool | Login, Home, Projects, Sync Studio, AI Visual Lab, Story Lab all render cleanly |

Reports: `/app/test_reports/iteration_1.json`.

---

## 11. Known caveats

1. **AI generation endpoints are public-file-served** (`/api/generated/{filename}` has no auth). Fine for the MVP demo; harden when moving off Emergent key.
2. **Sync playback is a visual demo** — the waveform is data-driven but there is no real audio stream. Wire an audio element (or ANCRLAB stream) later.
3. **Nested project GETs** (music/cues/rights/feedback) do not check that the project belongs to the caller. Add `{"owner_id": user_id}` guard when multi-user launches.
4. **9 destinations are structural previews** — deliberately scaffolded to keep the first build focused; PRD backlog lists build order.
5. **Fonts are Google-hosted** — CSP/self-hosting adjustment needed for private-network institutional deploys.

---

## 12. File inventory (application code)

### Backend
```
/app/backend/server.py
/app/backend/models.py
/app/backend/auth.py
/app/backend/ai_service.py
/app/backend/seed_data.py
/app/backend/.env
/app/backend/requirements.txt
/app/backend/generated_images/            (created dynamically)
```

### Frontend — CYNAIAH-authored
```
/app/frontend/public/index.html
/app/frontend/public/brand/cynaiah-logo.png
/app/frontend/public/brand/cynaiah-mark.png
/app/frontend/public/brand/ancr-logo.png
/app/frontend/tailwind.config.js
/app/frontend/src/App.js
/app/frontend/src/App.css
/app/frontend/src/index.css
/app/frontend/src/constants/testIds.js
/app/frontend/src/context/AuthContext.jsx
/app/frontend/src/lib/api.js
/app/frontend/src/lib/constants.js
/app/frontend/src/components/cynaiah/AppShell.jsx
/app/frontend/src/components/cynaiah/Sidebar.jsx
/app/frontend/src/components/cynaiah/TopBar.jsx
/app/frontend/src/components/cynaiah/Brand.jsx
/app/frontend/src/components/cynaiah/ProjectCard.jsx
/app/frontend/src/pages/Login.jsx
/app/frontend/src/pages/Register.jsx
/app/frontend/src/pages/Home.jsx
/app/frontend/src/pages/Projects.jsx
/app/frontend/src/pages/ProjectDetail.jsx
/app/frontend/src/pages/Create.jsx
/app/frontend/src/pages/StoryLab.jsx
/app/frontend/src/pages/AIVisualLab.jsx
/app/frontend/src/pages/SyncStudio.jsx
/app/frontend/src/pages/RightsCredits.jsx
/app/frontend/src/pages/Learn.jsx
/app/frontend/src/pages/Portfolio.jsx
/app/frontend/src/pages/Showcase.jsx
/app/frontend/src/pages/ComingSoon.jsx
```

### Memory / docs
```
/app/memory/PRD.md
/app/memory/test_credentials.md
/app/docs/CYNAIAH_DATA_DOCUMENT.md   ← this file
/app/test_reports/iteration_1.json
```

### Assets (dynamic)
```
/app/backend/generated_images/*.png   ← AI-generated frames
```

---

## 13. Prioritized backlog (from PRD)

### P0 — before public/institutional launch
- ANCRID SSO cutover (replaces temporary JWT)
- Ownership guards on nested project resources and destructive endpoints

### P1 — next iteration
- Continuity Diff — surface a student-controlled "Check Sequence" button on the Storyboard/Production UI (endpoint already live at `POST /api/characters/{id}/continuity-diff`; keep advisory, never auto-run)
- Edit & Finish (timeline + version history + review links + delivery)
- Assets library (tags, filters, cross-project search)
- Collaborators & Messages (invites + threaded per-project comms)
- Real Calendar view (month grid + ICS)
- Faculty Reviews (time-coded notes, rubric grading)
- INHEIRA rights-review export
- ANCRLAB music picker inside Sync Studio (waiting on real API)

### P2 — enhancements
- Live collab (ANCRSync)
- Storyboard drag-and-drop with panel-to-panel AI consistency
- Additional live AI tools: text-to-video, character LoRAs, upscaling
- Institutional admin dashboard (cohorts, competencies, rubrics)
- ANCRVIEW publishing pipeline
- Portfolio reach analytics

---

*Document maintained alongside `/app/memory/PRD.md` — update both when scope or architecture changes.*
