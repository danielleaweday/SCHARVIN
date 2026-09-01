# INHEIRA™ — Technical Specification v1.0

**Document owner:** Engineering
**Audience:** CTO, senior engineers, future maintainers, external auditors
**Status:** Release Candidate 1 (RC1) validated · 2026-02-07
**Repository:** monorepo — `/app/backend` (FastAPI) · `/app/frontend` (React) · `/app/memory` (product docs) · `/app/docs` (engineering docs)
**Related platform principles:**
- `ANCR_Ecosystem_Architecture_v1.0.md` — system-of-record ownership across the ANCR ecosystem
- `ANCR_Creative_Provenance_Platform_Spec_v1.0.md` — Creative Provenance™ as an ecosystem-wide architectural principle. INHEIRA is the canonical system of record for Creative Evidence™ and provenance related to songwriting and musical works.

---

## 1. Executive Overview

### 1.1 Purpose
INHEIRA™ is the operating system for **creative ownership and legacy** — a full-stack SaaS product that captures every creative contribution (lyrics, melodies, production, voice memos, revisions) at the moment it happens, produces AI-observed split proposals that require human signature, generates rights-ready exports, and preserves a permanent, verifiable history of every session and creator.

### 1.2 Business objective
Own the top-of-funnel creative record for the music industry. Every finalized session becomes a permanent Song Intelligence Report™ tied to verified Creator Passports™, publishable to publishers, PROs, DSPs, and label A&R teams. Downstream, sessions feed the ANCR ecosystem's royalty rail (Vaulta™) and cross-module intelligence.

### 1.3 User personas
| Persona | Primary use |
|---|---|
| Songwriter / Topliner | Log lyrics, claim contributions, sign splits |
| Producer | Track production contributions, upload voice memos, run splits |
| Recording artist | Own the master-level narrative, sign as performer |
| Composer / Instrumentalist | Log melody, chord, instrumentation contributions |
| Engineer | Log mix / master milestones, upload assets |
| Publisher / Sub-publisher | Read Song Intelligence Report™, register catalog |
| Manager / A&R | Consume shared reports, monitor creator activity |
| Attorney | Review split sheet, verify signatures, audit trail |
| Label | Discover creators, evaluate readiness, prepare release |
| University (CCDP) | Faculty oversee student sessions, students build portfolios |

### 1.4 Success criteria (RC1 sign-off)
- All 12 Studio tabs render and persist state
- AI split suggestions return valid 100%-normalized proposals
- Song Intelligence Report™ generates a public share link that renders view-only without auth
- Zero uncaught runtime errors across the full protected-route flow (verified iteration_3.json)
- Mobile 375px viewport: no horizontal page scroll on primary flows
- Public marketing landing renders the 11-chapter narrative with zero broken assets
- Backend `/api/*` endpoints return < 500 ms p95 under seeded data
- Auth: JWT + bcrypt + Emergent Google OAuth all functional

---

## 2. Product Requirements Document (PRD)

### 2.1 Functional requirements
1. **Identity (RightPrint™)** — one permanent verified creator profile per human, reusable across every session.
2. **Session creation** — any authenticated user can create a session with title, project, context, type; system assigns invite code.
3. **Lyric capture** — sectioned editor (Verse, Pre-Chorus, Chorus, Bridge, Outro, etc.). Every line is time-stamped and author-colored.
4. **Voice memos & files** — upload audio and generic files via presigned or JWT-authenticated endpoints; stored in Emergent Object Storage.
5. **Collaborator management** — invite by code; each collaborator gets a stable color; contributions tie back to `user_id`.
6. **AI split suggestions** — Claude Sonnet 4.5 observes lyrics + contributions and proposes writer splits, normalized to 100%; rule-based fallback if AI unreachable.
7. **Human approval flow** — every collaborator must explicitly sign; session auto-finalizes when all signatures collected.
8. **Split sheet & copyright** — printable route renders full split sheet with signatures for PRO / copyright registration.
9. **Song Intelligence Report™** — AI-generated pitch report (Executive Summary + Audience Intelligence + Financial Forecast) with public share links (audience-typed, optional password, 30-day TTL).
10. **Creator Passport™** — public profile with discography, verified credentials, professional network.
11. **Publishing Command Center** — 15-item pre-release grid (ISRC/UPC/ISWC/IPI/Publisher/PRO/etc.) + release readiness score.
12. **Connected Services** — 90 integrations across 13 categories with permission-toggled connection state.
13. **Vaulta™ royalty rail** — informational placeholder (v1.0); real payout rail deferred.
14. **Song DNA™** — immutable per-session event history with 13 event types.
15. **Public reports** — `/report/:token` view-only route, no auth required.

### 2.2 Primary user stories
- *As a songwriter*, I can start a session and invite two collaborators; every line I write is colored to me automatically.
- *As a collaborator*, I can log a contribution with role + weight and see my share reflected in the live split donut.
- *As a session owner*, I can request AI split suggestions and either accept them or edit before circulating for signatures.
- *As all collaborators*, we can each sign the splits; the session auto-finalizes on the last signature.
- *As a session owner*, I can generate a Song Intelligence Report™ and share a password-protected link with a publisher.
- *As a publisher*, I can open a `/report/:token` link without any INHEIRA account and read the entire report view-only.
- *As a creator*, I can toggle 90 third-party integrations with individual permissions and see an audit log of every change.

### 2.3 Permissions & roles
| Role | Scope |
|---|---|
| **Anonymous** | Landing, `/report/:token` (view-only), auth pages |
| **Authenticated** | All private routes, own sessions + shared sessions |
| **Session owner** | Full edit on the session; can invite; can finalize |
| **Session collaborator** | Read + write contributions, lyrics, chat, splits (once invited) |
| **Public share reader** | Read-only pitch report via token; password-gated if configured |
| **System / seed** | Backend-only; auto-seeds `test@songright.com` on startup |

RBAC is enforced at the FastAPI dependency layer via `Depends(get_current_user)` + per-session ownership checks (owner or collaborator).

### 2.4 Workflows
**Session lifecycle:** `draft` → `in-progress` → `ready-to-publish` → `published`
**Split lifecycle:** `open` → `proposed (AI or manual)` → `pending signatures` → `finalized`
**Share link lifecycle:** `active` → `expired (30 days default)` or `revoked`

### 2.5 Edge cases
- Bogus session id in URL → toast + redirect to `/sessions` (ErrorBoundary catches unhandled).
- Bogus share token → clean "Link not found" page (never crash).
- Clipboard `writeText` permission denied (headless/preview) → `copyToClipboard` helper falls back to `execCommand('copy')` via hidden textarea; toast reflects success/failure.
- AI provider unreachable → rule-based split fallback with same schema.
- Simultaneous split edits → last-write-wins on save; signatures invalidate on split mutation.

### 2.6 Acceptance criteria
See `/app/test_reports/iteration_1.json`, `iteration_2.json`, `iteration_3.json` for the authoritative test ledger. RC1 sign-off recorded in `PRD.md` section "Release Candidate 1 — Sign-Off".

---

## 3. Technical Architecture

### 3.1 Stack
- **Frontend:** React 19, React Router 7, Tailwind CSS, Shadcn UI, Recharts, Lucide, Sonner (toast), Framer-adjacent CSS animations. Bundler: react-scripts (Webpack 5).
- **Backend:** FastAPI, Motor (async MongoDB driver), python-jose (JWT), passlib[bcrypt], emergentintegrations (Claude Sonnet 4.5 client + Emergent Object Storage).
- **Database:** MongoDB (single logical DB, name from `DB_NAME`).
- **Auth:** JWT + bcrypt for email/password; Emergent-managed Google OAuth for social login.
- **Storage:** Emergent Object Storage for uploads.
- **AI:** Claude Sonnet 4.5 via `emergentintegrations` (universal Emergent LLM key).
- **Hosting:** Kubernetes container, Nginx ingress routes `/api/*` → backend:8001, `/*` → frontend:3000. Supervisor manages both processes.

### 3.2 Repository layout
```
/app
├── backend/
│   ├── server.py                 # single FastAPI module — all routes and models
│   ├── requirements.txt
│   └── .env                      # MONGO_URL, DB_NAME, JWT_SECRET, EMERGENT_LLM_KEY, EMERGENT_OS_BUCKET
├── frontend/
│   ├── package.json
│   ├── public/
│   │   ├── index.html            # INHEIRA meta + favicon
│   │   └── manifest.json
│   └── src/
│       ├── App.js                # Router, ErrorBoundary, Toaster
│       ├── context/AuthContext.jsx
│       ├── lib/api.js            # Axios instance + token interceptor
│       ├── lib/clipboard.js      # safe writeText helper
│       ├── lib/integrationsCatalog.js
│       ├── constants/testIds/    # data-testid manifests
│       ├── components/
│       │   ├── BrandLogos.jsx    # InheiraMark, AncrMark
│       │   ├── ErrorBoundary.jsx
│       │   ├── Nav.jsx
│       │   ├── SongJourney.jsx
│       │   ├── OwnershipDashboard.jsx
│       │   ├── GlobalCollaborationMap.jsx
│       │   ├── ConnectedServicesWidget.jsx
│       │   └── ui/               # Shadcn primitives
│       └── pages/
│           ├── Landing.jsx       # 11-chapter cinematic homepage
│           ├── AuthPage.jsx
│           ├── Dashboard.jsx
│           ├── Sessions.jsx
│           ├── NewSession.jsx
│           ├── SessionDetail.jsx
│           ├── StudioSession.jsx # monolithic 12-tab workspace
│           ├── SongDNA.jsx
│           ├── ReleaseDashboard.jsx
│           ├── SongIntelligence.jsx
│           ├── PublicReport.jsx  # /report/:token
│           ├── CreatorPassport.jsx
│           ├── ConnectedServices.jsx
│           ├── Profile.jsx
│           ├── Vaulta.jsx
│           └── SplitSheet.jsx
├── docs/
│   ├── INHEIRA_Technical_Specification_v1.0.md   # this file
│   └── ANCR_Ecosystem_Architecture_v1.0.md
├── memory/
│   ├── PRD.md
│   └── test_credentials.md
└── test_reports/
    ├── iteration_1.json
    ├── iteration_2.json
    └── iteration_3.json
```

### 3.3 Data flow
1. Browser → `REACT_APP_BACKEND_URL/api/*` → Nginx → FastAPI (:8001).
2. FastAPI validates JWT via `get_current_user` dependency (or accepts Google session cookie for OAuth flows).
3. Motor async client reads/writes MongoDB.
4. AI calls: FastAPI → `emergentintegrations` client → Claude Sonnet 4.5 → normalized JSON back to caller.
5. Object storage: uploads go through `POST /api/upload` (multipart) → Emergent Object Storage → returns a JWT-authenticated `/api/files/{path}` URL.

### 3.4 State management
- **Frontend:** Pure React `useState` / `useEffect` / `useMemo`. No Redux, Zustand, or global store beyond `AuthContext`.
- **Auth state:** `AuthContext` holds `user` + `token`; `token` persisted to `localStorage` under key `songright_token` (legacy identifier, invisible to users — kept for backward compat during the INHEIRA rebrand so existing sessions don't sign out).
- **Realtime state:** 10-second polling in Studio for events + messages (WebSockets deferred to v1.6).

### 3.5 API architecture
All API routes are prefixed `/api` and mounted under a single `api_router = APIRouter(prefix="/api")` in `server.py`. FastAPI auto-generates OpenAPI at `/api/openapi.json`.

### 3.6 Authentication flow
**Email / password:**
1. `POST /api/auth/register {email, password, name}` → bcrypt hash → user document → JWT.
2. `POST /api/auth/login {email, password}` → verify hash → JWT.
3. Frontend stores JWT in `localStorage`, injected into every Axios request via `Authorization: Bearer <token>`.

**Emergent Google OAuth:**
1. User clicks Continue with Google → redirect to Emergent Google Auth.
2. On callback, Emergent posts a `session_id` fragment to `/auth?session=...`.
3. Frontend calls `POST /api/auth/session {session_id}` → backend exchanges via Emergent → returns INHEIRA JWT.

### 3.7 Authorization model
- Every private route uses `Depends(get_current_user)`.
- Per-resource checks (session-scoped) verify `owner_id == user.user_id or user.user_id in collaborators`.
- Public share reports (`GET /api/report/:token`) do not require auth; the token is the capability.

### 3.8 Error handling
- Backend raises `HTTPException` with structured `detail`.
- Frontend Axios interceptor surfaces `error.response.data.detail` via Sonner toasts.
- Uncaught React errors caught by top-level `ErrorBoundary` → branded fallback screen with technical details in a `<details>` block.

### 3.9 Logging
- Backend: `logging.getLogger(__name__)` at INFO level; supervisor captures to `/var/log/supervisor/backend.*.log`.
- Frontend: `console.error` on ErrorBoundary catches; production console cleaned of debug logs.
- Audit log: `user_integrations` collection stores the last 30 events per user per integration (see §4).

---

## 4. Database Schema

All collections are in a single MongoDB database. IDs use human-readable prefixes (`user_`, `sess_`, `line_`, `event_`, etc.) plus a random hex suffix.

### 4.1 `users`
| Field | Type | Notes |
|---|---|---|
| `user_id` | string (PK) | `user_<hex12>` |
| `email` | string, unique | lowercased on write |
| `password_hash` | string | bcrypt; null for OAuth-only users |
| `name` | string | display name |
| `picture` | string \| null | URL |
| `auth_provider` | enum | `password` \| `google` |
| `role` | enum | `creator` (default) \| `admin` |
| `credits` | int | reserved for future paid features |
| `rightprint` | object | see §4.1.1 |
| `verification` | object | `{verified: bool, since: ISO}` |
| `created_at` | ISO datetime | `datetime.now(timezone.utc)` |

**Indexes:** `email` (unique), `user_id` (unique)

#### 4.1.1 `rightprint` sub-document
`legal_name, professional_name, pro (ASCAP/BMI/SESAC/SOCAN/PRS/GMR), ipi, publisher, label, manager, attorney, disciplines[], instruments[], genres[], biography, social{}`.

### 4.2 `sessions`
| Field | Type | Notes |
|---|---|---|
| `session_id` | string (PK) | `sess_<hex12>` |
| `title` | string | |
| `project` | string | |
| `owner_id` | string | FK → `users.user_id` |
| `invite_code` | string, unique | 8-char base32 |
| `session_type` | string | e.g., `writing_session` |
| `context` | string | |
| `song_meta` | object | `{genre, key, tempo, time_signature, language, status, mood, duration, explicit}` |
| `collaborators` | array | `[{user_id, name, role, color, online, added_at}]` |
| `completion` | object | `{lyrics, melody, arrangement, production, mix, master, artwork, metadata, publishing, dsp_delivery, release}` — each `not_started` \| `in_progress` \| `complete` \| `incomplete` \| `locked` |
| `splits` | array | `[{user_id, name, role, publisher, pro, ipi, percentage}]` |
| `signatures` | map | `{[user_id]: {approved: bool, signed_at: ISO, signature: string}}` |
| `splits_status` | enum | `open` \| `proposed` \| `pending_signatures` \| `finalized` |
| `song_intelligence` | object \| null | Cached AI report payload |
| `share_links` | array | see §4.6 |
| `identifiers` | object | `{isrc, upc, ean, iswc, song_id, ...}` |
| `created_at`, `updated_at` | ISO datetime | |

**Indexes:** `session_id` (unique), `owner_id`, `collaborators.user_id`, `invite_code` (unique)

### 4.3 `lyric_lines`
| Field | Type |
|---|---|
| `line_id` | string PK (`line_<hex10>`) |
| `session_id` | string FK |
| `section` | string (Verse 1, Chorus, etc.) |
| `text` | string |
| `author_id` | string FK → users |
| `color` | hex string |
| `created_at` | ISO |
| `version` | int |

**Indexes:** `session_id + section`, `author_id`

### 4.4 `events` (Song DNA™)
| Field | Type |
|---|---|
| `event_id` | string PK |
| `session_id` | string FK |
| `kind` | enum (13 types: `song_created`, `voice_memo`, `lyric_written`, `melody`, `arrangement`, `collaborator_joined`, `contribution`, `split_modified`, `version_saved`, `identifier_generated`, `publishing_submitted`, `dsp_delivered`, `released`, `royalty`) |
| `who` | string FK → users |
| `label` | string |
| `meta` | object |
| `color` | hex |
| `created_at` | ISO |

**Indexes:** `session_id + created_at`

### 4.5 `messages`, `contributions`
- **`messages`:** `{message_id, session_id, user_id, name, color, text, created_at}` — Studio chat.
- **`contributions`:** `{contribution_id, session_id, user_id, role, description, weight, lyrics_snippet, created_at}` — weighted contribution log used by AI split proposer.

### 4.6 `share_links` (embedded in `sessions`)
`{token, audience (label|publisher|manager|attorney|investor|sync), password_hash?, expires_at, created_at, revoked?}`

### 4.7 `user_integrations`
| Field | Type |
|---|---|
| `user_id` | string FK |
| `integration_id` | string | e.g., `spotify`, `distrokid`, `ascap` |
| `connected` | bool |
| `permissions` | map `{[permission_key]: bool}` |
| `last_sync` | ISO \| null |
| `audit_log` | array (max 30) | `[{ts, action, meta}]` |

**Indexes:** `(user_id, integration_id)` compound unique.

### 4.8 `files`
Uploaded assets are stored in Emergent Object Storage; a lightweight `files` collection stores `{file_id, session_id, user_id, original_name, mime, size, path, created_at}` for lookup.

---

## 5. API Documentation

All endpoints prefixed `/api`. All authenticated endpoints require `Authorization: Bearer <JWT>` unless noted.

### 5.1 Auth
| Method | Route | Auth | Body | Returns |
|---|---|---|---|---|
| POST | `/auth/register` | none | `{email, password, name}` | `{token, user}` |
| POST | `/auth/login` | none | `{email, password}` | `{token, user}` |
| POST | `/auth/session` | none | `{session_id}` (from Emergent Google) | `{token, user}` |
| GET | `/auth/me` | ✓ | — | `{user}` |
| POST | `/auth/logout` | ✓ | — | `{ok: true}` |

**Error contract:** `401 {detail: "invalid credentials"}`, `409 {detail: "email already registered"}`.

### 5.2 Profile / Creators
| Method | Route | Auth | Notes |
|---|---|---|---|
| PUT | `/profile/me` | ✓ | Update RightPrint fields |
| GET | `/profile/{user_id}` | ✓ | Full profile |
| GET | `/creators/{user_id}/discography` | ✓ | Song list with role + splits |
| GET | `/creators/{user_id}/timeline` | ✓ | Recent activity |

### 5.3 Sessions (core)
| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/sessions` | ✓ | Create session |
| GET | `/sessions` | ✓ | List user's sessions |
| GET | `/sessions/{session_id}` | ✓ | Session detail |
| PATCH | `/sessions/{session_id}` | ✓ (owner or collab) | Partial update: `song_meta`, `completion`, `identifiers` |
| POST | `/sessions/{session_id}/join` | ✓ | Join by session id (owner-approved) |
| POST | `/sessions/join-by-code/{invite_code}` | ✓ | Join by invite code |

### 5.4 Lyrics
| Method | Route | Body |
|---|---|---|
| POST | `/sessions/{id}/lyrics` | `{section, text}` |
| PUT | `/sessions/{id}/lyrics/{line_id}` | `{text}` |
| DELETE | `/sessions/{id}/lyrics/{line_id}` | — |
| GET | `/sessions/{id}/lyrics` | — |

### 5.5 Events & messages
- `POST/GET /sessions/{id}/events` — Song DNA™ events
- `POST/GET /sessions/{id}/messages` — Studio chat

### 5.6 Contributions & splits
- `POST/GET /sessions/{id}/contributions`
- `POST /sessions/{id}/splits/suggest` — returns `{source: "ai"|"rule", entries: [...]}`, always normalized to 100%
- `PUT /sessions/{id}/splits` — commit split entries
- `POST /sessions/{id}/splits/approve` — `{approved: bool, signature: string}`; auto-finalizes when every collaborator has signed

### 5.7 Rights & intelligence
- `POST /sessions/{id}/rights/generate/{kind}` — server-side identifier generators (`isrc`, `upc`, `ean`, `iswc`, `song_id`)
- `POST /sessions/{id}/insights` — Studio Intelligence widget (lightweight)
- `POST /sessions/{id}/intelligence` — full Song Intelligence Report™ (Claude Sonnet 4.5, cached on session)

### 5.8 Sharing (public reports)
- `POST /sessions/{id}/share` — `{audience, password?, ttl_days=30}` → `{token}`
- `GET /report/{token}` — **no auth required**; returns the full report payload or `403` if password required, or `404` if expired/revoked

### 5.9 Object storage
- `POST /upload` (multipart) — auth ✓ — returns `{file_id, path}`
- `GET /files/{path}` — auth ✓ — streams file

### 5.10 Integrations
- `GET /integrations` — list connections for current user
- `GET /integrations/{integration_id}` — single connection
- `PATCH /integrations/{integration_id}` — `{connected?, permissions?}` → also appends to audit log

### 5.11 Royalties
- `GET /royalties` — Vaulta™ placeholder payload (aggregated forecast + works table)

### 5.12 Example
```bash
API=$REACT_APP_BACKEND_URL
TOKEN=$(curl -s -X POST $API/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"test@songright.com","password":"Test1234!"}' | jq -r .token)

curl -s -X POST $API/api/sessions -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"title":"Skyline","project":"Album v2","context":"Writing","session_type":"writing_session"}'
```

---

## 6. UI Specification

### 6.1 Route map
| Path | Auth | Component | Purpose |
|---|---|---|---|
| `/` | public | `Landing` | 11-chapter cinematic homepage |
| `/auth` | public | `AuthPage` | Sign in / register / Google OAuth |
| `/dashboard` | ✓ | `Dashboard` | Overview + active sessions + highlights |
| `/sessions` | ✓ | `Sessions` | All sessions + join by code |
| `/sessions/new` | ✓ | `NewSession` | Create session |
| `/sessions/:id` | ✓ | `SessionDetail` | Classic session view (legacy) |
| `/sessions/:id/studio` | ✓ | `StudioSession` | 12-tab workspace |
| `/sessions/:id/dna` | ✓ | `SongDNA` | Immutable event timeline |
| `/sessions/:id/release` | ✓ | `ReleaseDashboard` | Streaming/analytics |
| `/sessions/:id/intelligence` | ✓ | `SongIntelligence` | Pitch report + share |
| `/sessions/:id/split-sheet` | ✓ | `SplitSheet` | Printable PDF-style split sheet |
| `/creator/:user_id` | ✓ | `CreatorPassport` | Public creator profile |
| `/settings/integrations` | ✓ | `ConnectedServices` | 90 integrations |
| `/vaulta` | ✓ | `Vaulta` | Royalty rail placeholder |
| `/profile` | ✓ | `Profile` | Edit RightPrint |
| `/report/:token` | **public** | `PublicReport` | View-only shared report |

### 6.2 Studio workspace (12 tabs)
`Overview · Lyrics · Melody · Chords · Arrangement · Voice Memos · Files · Collaborators · Chat · Rights · Publishing · Analytics`. Tab state stored in URL hash on future revision; currently in-memory via `Tabs` component.

### 6.3 Empty / loading / error states
- Loading: `font-mono-metadata text-xs uppercase tracking-[0.3em]` spinner text ("Loading Studio Session…").
- Empty: mono-labelled empty cards with helpful CTA (e.g., "No sessions yet — start writing").
- Error: `ErrorBoundary` renders branded fallback + `<details>` with technical trace.

### 6.4 Responsive
- Desktop-first design at 1440×900.
- Mobile breakpoint 375×812 verified — Studio sidebar collapses behind a hamburger; horizontal scroll contained in `overflow-x-auto` tab strips.

### 6.5 Accessibility
- All interactive icon-only buttons carry `aria-label`.
- Keyboard focus visible on all form inputs and sidebar links.
- Colors chosen with WCAG AA contrast on `#04040a` / `bg-black` surfaces (audit pending for AAA on the softer indigo/sky text on lighter surfaces).
- `ErrorBoundary` announces failure via visible headline + text; screen-reader safe.

---

## 7. Component Inventory

### 7.1 Top-level shared components
| Component | Purpose | Key props |
|---|---|---|
| `Nav` | Global top navigation + user avatar | (uses `AuthContext`) |
| `InheiraMark` / `AncrMark` | Brand logos with feathered mask + soft glow | `className` |
| `ErrorBoundary` | Catches uncaught React errors | children |
| `SongJourney` | 10-milestone roadmap (Idea → Royalties) | `session`, `events` |
| `OwnershipDashboard` | 6-lens interactive donut/bar view | `session`, `contribs` |
| `GlobalCollaborationMap` | Animated SVG world grid with node glow | `collaborators` |
| `ConnectedServicesWidget` | Studio right-rail integrations tile | `stats` |

### 7.2 Landing-only components (`Landing.jsx`)
`StudioMockupCard, SplitDonut (SVG donut), LyricLine, TimelineEvent, ProgressRow, PassportStat, ScoreCell, IntelStat, PublishingCell, SongLifeStep`. All defined inline in `Landing.jsx` to keep the marketing surface self-contained.

### 7.3 Utility libraries
| File | Purpose |
|---|---|
| `lib/api.js` | Axios instance, base URL, JWT token interceptor, `setToken()` |
| `lib/clipboard.js` | `copyToClipboard()` with textarea/`execCommand` fallback |
| `lib/integrationsCatalog.js` | Static catalog of 90 integrations across 13 categories |
| `constants/testIds/` | Every `data-testid` used across the app (LANDING, NAV, AUTH_UI, STUDIO, CCC, DNA, RELEASE, PITCH, SESSION_UI) |

### 7.4 Reusability guidelines
Landing sub-components (`SplitDonut`, `SongLifeStep`, etc.) are private to `Landing.jsx`. Reused product primitives (`SongJourney`, `OwnershipDashboard`) live in `/components/` and are consumed by both Studio and public report.

---

## 8. Business Rules

1. **Splits must always total 100%.** Backend normalizes AI/rule proposals; frontend validates on manual edits.
2. **Signatures invalidate on split mutation.** Editing the split table clears all signatures and moves status back to `pending_signatures`.
3. **Session auto-finalizes only when every listed collaborator has signed** — including the owner.
4. **Public reports are token-gated.** No `user_id` lookup is possible via the share endpoint; only the opaque token unlocks a session.
5. **Password-protected reports** hash the password server-side; the token URL alone returns `403` until the password is submitted.
6. **Share tokens expire at 30 days by default.** `ttl_days` is caller-configurable (max 90).
7. **INHEIRA does not automatically determine ownership.** All AI proposals require human signature. This disclaimer appears in the Song Intelligence Report™ Creative Evidence™ section.
8. **Integration state is per-user.** No user can see another user's connections or permissions.
9. **RightPrint (creator identity) is portable.** A single user profile is referenced across every session; changing IPI/publisher updates all future exports but does not retroactively alter finalized split sheets.
10. **Every event is append-only.** Song DNA™ never deletes; corrections are new events referencing the original.

---

## 9. ANCR Ecosystem Integration

INHEIRA is the **creative record layer** of the ANCR ecosystem. Full ecosystem architecture is in `ANCR_Ecosystem_Architecture_v1.0.md`; the module-level touchpoints:

| Module | Integration surface | Status |
|---|---|---|
| **ANCRID** | Single sign-on identity provider. INHEIRA's `users.user_id` is expected to become `ancr_id` in v1.6. Currently INHEIRA issues its own JWTs; ANCRID federation is on the roadmap. | Planned |
| **ANCRA** | Analytics event bus — every Song DNA™ event will be mirrored to ANCRA for cross-module analytics. | Planned (event schema drafted) |
| **ANCRLAB** | Studio session sync — physical studio sessions initiated in ANCRLAB will spawn INHEIRA sessions via `POST /api/sessions`. | Planned |
| **ANCRSYNC** | Sync licensing channel — finalized sessions with `sync_potential ≥ 60` are pushed to ANCRSYNC catalog. | Planned |
| **COHEIR** | Ownership resolution + estate-planning layer — finalized split sheets flow to COHEIR for estate + beneficiary registration. | Planned |
| **Vaulta™** | Royalty rail — every finalized work registers an entry in Vaulta for royalty collection. Current implementation is a UI placeholder; real Stripe/PRO wire-up is v1.6 P0. | Placeholder (UI only) |
| **ANCRMEDIA** | Creator-facing editorial + press. Creator Passport is expected to feed ANCRMEDIA writer profiles. | Planned |
| **ANCRLaunch** | Launch/marketing campaign layer — Publishing Command Center's "Marketing" tile is the future ANCRLaunch integration point. | Planned |

Shared authentication (once federated): all ecosystem modules will consume ANCRID JWTs. Cross-module events will flow through ANCRA on a Kafka-style bus (schema TBD). Shared data: `ancr_id`, `session_id`, `song_id`, `iswc`, `isrc` are the primary keys that cross module boundaries.

---

## 10. Security Specification

- **Authentication:** JWT (HS256) signed with `JWT_SECRET`, 30-day exp. Emergent Google OAuth via `emergentintegrations` session exchange.
- **Password hashing:** bcrypt with default `passlib` cost.
- **Authorization:** FastAPI `Depends(get_current_user)` on every private route; per-resource ownership check inside handlers.
- **Session tokens:** Bearer token in `Authorization` header; `localStorage` on the frontend under `songright_token`.
- **Share tokens:** opaque 32-byte hex; optional bcrypt-hashed password; server-side TTL enforcement.
- **CSRF:** Not currently required — auth is Bearer-header-only, no cookies for JWT flows. Emergent OAuth uses a short-lived cookie only for the callback bounce.
- **Encryption at rest:** MongoDB Atlas / self-hosted TLS-configured cluster (production DB decision pending).
- **Encryption in transit:** HTTPS enforced by Kubernetes ingress.
- **Rate limiting:** Not yet implemented at the application layer; deferred to Nginx / ingress config for production launch.
- **Audit logging:** `user_integrations.audit_log` records last 30 connection events per integration per user (connect, disconnect, permission toggles, re-sync).
- **Privacy controls:** Public share reports never expose creator emails, IPI numbers, publisher contracts, or private notes — only the whitelisted report fields.
- **PII inventory:** email, name, IPI, PRO number, publisher name, manager name, attorney name, address (via RightPrint if user provides). All stored in a single collection (`users`) and never returned to non-owner API callers.

---

## 11. Testing Documentation

### 11.1 Test ledger
| File | Scope | Status |
|---|---|---|
| `/app/test_reports/iteration_1.json` | Initial full-app pass (21/21 backend, 100% frontend) | Pass |
| `/app/test_reports/iteration_2.json` | RC1 first pass | 3 issues surfaced (2×P1 + 1×P2) |
| `/app/test_reports/iteration_3.json` | RC1 retest | ✅ 100% RC1 checklist, 0 uncaught errors |

### 11.2 Test types
- **Backend integration:** curl-driven CI-friendly assertions on every route with seeded `test@songright.com`.
- **Frontend E2E:** Playwright-driven testing agent covering all 12 Studio tabs + auth + share flows on the live preview URL.
- **Lint:** ESLint (js) + Ruff/pyflakes (py) run on every fork boundary.
- **Smoke:** manual screenshot audit of hero + Studio Overview after every major refactor.

### 11.3 Known limitations
- No unit tests inside `/app/backend/tests` yet — recommended for v1.6.
- No dedicated Playwright suite committed to the repo; testing agent runs are stateless.
- Real-time collaboration presence not covered by tests (feature not yet built).

---

## 12. Deployment Guide

### 12.1 Environment variables
**Backend `/app/backend/.env`:**
```
MONGO_URL=<mongodb+srv://...>
DB_NAME=<db>
JWT_SECRET=<random 64-hex>
EMERGENT_LLM_KEY=<universal key>
EMERGENT_OS_BUCKET=<bucket>
```
**Frontend `/app/frontend/.env`:**
```
REACT_APP_BACKEND_URL=https://<preview-or-prod>.emergentagent.com
```

### 12.2 Required services
- MongoDB (single logical DB)
- Emergent Object Storage bucket
- Emergent LLM key
- (Prod) Kubernetes ingress + HTTPS cert + optional CDN in front of `/static`

### 12.3 Build
- Frontend: `yarn build` — CRA production bundle.
- Backend: no build step; Uvicorn runs `server.py`.

### 12.4 Deploy steps (Emergent platform)
1. Confirm `.env` values are present and secrets set.
2. `deployment_agent` runs a static check for hardcoded secrets / port issues / CORS / compile errors.
3. On pass, use the Emergent platform's Deploy action.

### 12.5 Rollback
Emergent platform's **Rollback** feature restores the codebase to any prior checkpoint at no cost. Do **not** attempt `git reset` in the container — direct users to the platform Rollback control.

---

## 13. Production Readiness Checklist

### ✅ Completed (RC1)
- Auth (JWT + bcrypt + Emergent Google OAuth) — verified
- All 12 Studio tabs render and persist — verified
- AI split suggestions (Claude 4.5) with rule-based fallback — verified
- Song Intelligence Report™ with password-gated public share — verified
- Creator Passport, Publishing Command Center, Release Dashboard, Vaulta placeholder, Connected Services (90/13) — verified
- Song DNA™ immutable timeline — verified
- INHEIRA rebrand across UI, meta, favicon, manifest, PDF split sheet, error boundary — verified
- Homepage: 11-chapter cinematic experience (Hero → Belief → Chapters I–X + Life of a Song + Legacy) — verified

### 🟡 Remaining before public beta
- Rate limiting (Nginx/ingress layer)
- Server-side PDF export (currently browser print)
- Real Stripe/PRO wire-up for Vaulta royalties
- Real 3rd-party OAuth for Connected Services (currently UI-only, state persisted)
- Real-time WebSocket collaboration presence
- Backend unit + regression test suite committed to repo
- Commissioned photography to replace Unsplash placeholders on Landing

### 🎭 Mocked functionality (flagged in code)
- Connected Services OAuth handshakes (state persists via `/api/integrations` only)
- Vaulta royalty streams (informational placeholder, no real payouts)
- DSP delivery / PRO registration confirmations (simulated)
- Landing photography (Unsplash placeholders documented in `Landing.jsx` header comment)

### 💳 Technical debt
- `StudioSession.jsx` is 1636 lines — should be split into `/components/studio/*` modules.
- `localStorage` key `songright_token` still references the pre-rebrand name (kept for continuity).
- `constants/testIds/songright.js` module filename retains legacy identifier (invisible to users).
- `test@songright.com` seed email retained for testing continuity.
- No global state library — pure `useState`/`useEffect`. Fine at current scale; may need Zustand/TanStack Query at 10× surface area.

---

## 14. Engineering Roadmap

### MVP Complete (v1.0 · RC1)
Full creative capture, splits, signatures, Song Intelligence, Creator Passport, Publishing UI, Connected Services UI, Song DNA™, Release Dashboard, Vaulta placeholder, Cinematic 11-chapter homepage.

### Phase 2 (v1.1–v1.5)
- **Demo Mode** — public read-only `/demo` route that drops visitors into a real INHEIRA session without sign-in. **Top-priority next feature.**
- Rate limiting + Sentry-style error monitoring
- Backend unit test suite (`/app/backend/tests`)
- Split `StudioSession.jsx` into `/components/studio/*`
- Chapter-reveal scroll animations on Landing (Framer Motion or CSS-only)
- Commissioned editorial photography

### Phase 3 (v1.6)
- WebSocket real-time collaboration (Yjs / Liveblocks / custom)
- Server-side PDF generation (WeasyPrint or Puppeteer)
- Real Stripe payouts for Vaulta™
- Real OAuth for top 10 Connected Services (Spotify, DistroKid, ASCAP, BMI, Songtrust, Google Drive, Dropbox, Slack, Google Calendar, Discord)
- Search + discovery (creators, songs, camps)

### Production (v2.0)
- ANCRID federation (single sign-on across ecosystem)
- ANCRA event bus wire-up
- COHEIR estate-planning integration
- ANCRSYNC catalog push for sync-eligible works
- Mobile native app (React Native or SwiftUI)

### Enterprise (v3.0)
- University Mode (faculty dashboards, capstone tracking, CCDP export)
- Industry Mode (label / publisher admin roles, bulk catalog operations)
- SOC 2 audit + HIPAA-adjacent controls for minor-artist protection
- White-label deployments for major publishers

---

## 15. Architecture Decision Records

### ADR-001 · Monolithic backend module
**Decision:** Keep all FastAPI routes in a single `server.py` for RC1.
**Why:** Faster iteration during the pre-launch phase, fewer import ceremony, single-file audit.
**Consequences:** File is ~1400 lines; splitting into `/backend/routes/*` is a v1.5 refactor.

### ADR-002 · No global frontend state manager
**Decision:** Use `useState` + `AuthContext` only.
**Why:** Current surface is small enough; adding Redux/Zustand would over-engineer.
**Trigger to revisit:** any feature that requires cross-page real-time sync (WebSockets).

### ADR-003 · JWT in `localStorage`
**Decision:** Store the JWT in `localStorage` instead of `HttpOnly` cookies.
**Why:** Simpler cross-origin story with the Kubernetes preview URLs; explicit Bearer auth.
**Risk:** XSS could exfiltrate the token. Mitigation: CSP + strict input escaping (React default) + no dangerouslySetInnerHTML anywhere in the app.

### ADR-004 · Emergent LLM Universal Key
**Decision:** Use `emergentintegrations` universal LLM key for Claude Sonnet 4.5, rather than Anthropic direct.
**Why:** One key across providers, built-in fallback, no direct billing dependency.

### ADR-005 · MongoDB single-database
**Decision:** Single database, no sharding, ObjectId-free (human-readable IDs).
**Why:** Simplifies exports, backups, and future migration to Postgres if needed.

### ADR-006 · Feathered PNG logo via CSS mask
**Decision:** Render the INHEIRA PNG with a `mask-image` radial gradient rather than commissioning an SVG.
**Why:** Preserves the celestial arc + wordmark exactly as the brand asset ships; blends into any dark background.
**Consequences:** Requires the page background to be `bg-black` (`#000`) or `#04040a` for perfect blending.

### ADR-007 · Rebrand-safe legacy identifiers
**Decision:** Keep `localStorage.songright_token`, `test@songright.com`, and `constants/testIds/songright.js` unchanged after the INHEIRA rebrand.
**Why:** Renaming would sign out every existing user, break test continuity, and force a testing-agent re-baseline. All three identifiers are invisible to end users.

### ADR-008 · Homepage narrative rebuild
**Decision:** Replace the SaaS features grid + how-it-works blocks with a 10-chapter narrative + Life of a Song timeline.
**Why:** Direct user feedback: "This shouldn't feel like SaaS marketing. It should feel like the life of a song."

---

## 16. Handoff Notes for the CTO

### Current implementation status
INHEIRA is at **Release Candidate 1** with the frontend testing agent green on the full checklist and zero uncaught runtime errors. The homepage was subsequently rebuilt from SaaS marketing into a 10-chapter cinematic narrative including a signature "Life of a Song" timeline. The INHEIRA brand identity replaced the earlier SONGRIGHT branding across the entire application.

### Outstanding work (priority order)
1. **Demo Mode** — public read-only `/demo` route so visitors experience a real session without sign-in. Highest expected conversion lift; roughly 1–2 days of work.
2. **Creative Evidence Intelligence™ (CEI)** — see companion spec `INHEIRA_Creative_Evidence_Intelligence_Spec_v1.0.md`. Human-first documentation & evidence system that measures documented creative contribution at the note/chord/section level. Phase 1 (structured input · 8–10 weeks) → Phase 2 (performance-derived · 5–6 months) → Phase 3 (cross-session + real-time). Kept strictly separate from legal ownership resolution.
3. **Rate limiting** at ingress. Required before public traffic.
3. **Backend unit test suite** committed to `/app/backend/tests`. Enables safe refactoring.
4. **Split `StudioSession.jsx` into modules** (1636 lines is a maintenance risk).
5. **Commissioned photography** to swap the Unsplash placeholders on Landing.
6. **Real 3rd-party OAuth** for the top 10 Connected Services (Spotify, DistroKid, ASCAP, BMI, Songtrust, Google Drive, Dropbox, Slack, Google Calendar, Discord).
7. **WebSocket real-time presence** to replace the 10-second polling in Studio.
8. **Server-side PDF** for split sheets (currently browser print).

### Risks
- **Vaulta™ placeholder** — the UI implies royalty rails that don't exist yet. Legal review required before enabling `/vaulta` in public beta with real-currency language.
- **Connected Services** — the UI implies OAuth-grade connections that are currently state-only. The "Powered by" language and permission toggles could mislead cautious enterprise buyers. Consider a "Preview" badge until v1.6.
- **`StudioSession.jsx` monolithic file** — every small bug fix has whole-file rebuild risk in reviewer diffs.
- **`localStorage`-based JWT** — XSS is the primary threat surface. Ensure CSP headers are configured on the production ingress.

### Recommended next steps (2-week sprint)
1. Week 1: Demo Mode + Sentry-style error monitoring + rate limiting + backend unit tests.
2. Week 2: `StudioSession.jsx` split + commissioned photography swap + landing chapter reveal animations + Vaulta legal-safe copy pass.

### Files a new engineer should read first
1. `/app/memory/PRD.md` — canonical product doc + changelog
2. `/app/backend/server.py` — the single backend module
3. `/app/frontend/src/App.js` — route map
4. `/app/frontend/src/pages/Landing.jsx` — the marketing narrative + all landing subcomponents
5. `/app/frontend/src/pages/StudioSession.jsx` — the 12-tab workspace
6. `/app/frontend/src/pages/SongIntelligence.jsx` — the AI report + public share dialog
7. `/app/frontend/src/lib/{api,clipboard,integrationsCatalog}.js` — shared utilities
8. `/app/test_reports/iteration_3.json` — the RC1 sign-off test report

---

*End of INHEIRA Technical Specification v1.0.*
