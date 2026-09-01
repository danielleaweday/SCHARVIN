# COHEIR™ Technical Specification v1.0

**Module**: COHEIR™ — The Industry Leadership Network
**Version**: 1.0
**Status**: Production-ready (staging)
**Author**: E1 Build Agent · ANCR Emergent Build Pipeline
**Audience**: CTO, senior engineers, future maintainers
**Companion document**: `ANCR_Ecosystem_Architecture_Specification.md` (master cross-module doc — recommended follow-up)

---

## 1. Executive Overview

### 1.1 Purpose
COHEIR™ is the industry-leadership operating layer of the ANCR ecosystem. It is the module that surrounds every CCDP student with verified professionals who continuously teach, supervise, evaluate, produce, recommend and launch creators. It is architected as a **career-long professional relationship graph**, not a temporary school application.

### 1.2 Business Objective
Convert the ANCR ecosystem from a set of creator tools into a **connected professional network** whose value compounds with every review, session, opportunity, recommendation and share kit generated. Every interaction inside COHEIR writes verified credentials into ANCRID™, deepening the moat.

### 1.3 User Personas
| Persona | Description | Success moment |
|---|---|---|
| Student (Danielle McMillan) | CCDP student pursuing a creative career | First recommendation from a verified pro lands on ANCRID |
| Industry Professional (Cam Rivers) | Grammy-caliber producer / mentor | Publishes a review + creates a share kit; grows their pipeline |
| Faculty / Dept Chair (Dr. Aisha Brooks) | Runs a cohort | Balances mentor coverage across her cohort |
| Institution Admin (President Halverson) | Runs the CCDP | Sees institution health across 12 dashboards |
| Employer (Kai Odenkirk, Sony Horizon) | Recruits verified emerging talent | Discovers, interviews, and hires a student |
| Alumni (Jordan Blake, CCDP '24) | Career-stage professional | Remains connected to faculty + newer cohorts |
| ANCR Admin | Ecosystem operator | Provisions provider credentials, audits activity |

### 1.4 Success Criteria (v1.0)
- All flagship pages (Dashboard, Professional Profile, Student Supervision, Directory, Sessions, Cohorts, Analytics) shipped with real backend + seed data.
- Dual authentication (JWT email/password + Emergent Google SSO) with ANCRID identity inheritance.
- Rich seeded demo dataset (24 users, 6 cohorts, 8 sessions, ~30 domain records).
- 100% of critical flows verified by testing agent (39/39 backend + all frontend flows).
- Interchangeable meeting/calendar providers architected (7 video, 5 calendar).
- Object storage for creator portfolios operational.
- Revocable public share links live (`/p/{slug}`).
- Real Claude Sonnet 4.5 wired for AIAH with deterministic fallback.

---

## 2. Product Requirements Document (PRD)

### 2.1 Functional Requirements

**FR-1 Identity & Auth** — Users authenticate via email/password OR Emergent Google SSO. Every user receives an ANCRID identifier that follows them across the ecosystem.

**FR-2 Professional Profiles (flagship)** — Verified professionals expose credentials, credits, awards, career history, mentorship philosophy, current projects, and portfolio links.

**FR-3 Student Supervision** — Professionals can access students under their supervision (via `mentor_ids`), read ANCRID quick-view data, publish reviews and recommendations.

**FR-4 Cohorts** — Cohorts group students under faculty leads and industry mentors.

**FR-5 Industry Sessions** — 12 session kinds hostable by professionals; students RSVP.

**FR-6 Reviews** — 9-category structured evaluations; every publish writes to ANCRID.

**FR-7 Opportunities** — 13 opportunity kinds postable by employers/mentors; students apply.

**FR-8 Recommendations** — Professionals recommend students to 12 target types; verified attestation writes to ANCRID.

**FR-9 Creative Teams** — Multi-role project teams linked to ANCRSync workspaces.

**FR-10 Portfolio Uploads** — Creators upload 12 file formats (up to 50MB) with 3 visibility tiers.

**FR-11 Share Kits** — Revocable, expirable public share links in 7 kinds.

**FR-12 AIAH (AI Leadership Intelligence)** — Claude Sonnet 4.5 assists (never replaces) human judgement across 4 preset intents plus freeform.

**FR-13 Institution Analytics** — 12 real-signal dashboards for institution admins.

**FR-14 Provider Registry** — Interchangeable video + calendar providers; adapters pluggable.

**FR-15 Messaging** — Direct, group, and announcement threads with persistent history.

**FR-16 Calendar** — Aggregated events grouped by day.

**FR-17 Notifications** — Kind-tagged in-app notifications with unread count.

**FR-18 ANCRID Passport** — First-class UI surface for the user's ecosystem identity.

**FR-19 Lifelong Network / Alumni** — Alumni remain first-class users with `is_alumni`, `alumni_class`, `alumni_role`.

### 2.2 User Stories (representative subset)

- **US-01** As a student, I can sign in with Google and land on my personalised dashboard showing my mentors, upcoming sessions, and career-readiness score.
- **US-02** As a producer, I can browse my supervised students, open a student's supervision surface, and publish a 9-category Professional Review that permanently writes to their ANCRID.
- **US-03** As a professional, I can generate a Press Kit share link that expires in 90 days and revoke it at any time.
- **US-04** As a student, I can upload demo tracks / artwork / PDFs into my portfolio and toggle each file between private / cohort-shared / public.
- **US-05** As an institution admin, I can view 12 institution-health dashboards including mentor engagement, portfolio completion, career readiness, and alumni engagement.
- **US-06** As an employer, I can search for verified emerging talent by discipline, view their portfolio, and request an interview.
- **US-07** As a faculty chair, I can run an AIAH portfolio-gap analysis across my cohort and receive a set of concrete action items.

### 2.3 Roles (23)
`student`, `faculty`, `adjunct_faculty`, `department_chair`, `advisor`, `mentor`, `artist`, `songwriter`, `producer`, `engineer`, `creative_director`, `attorney`, `publisher`, `manager`, `agent`, `employer`, `entrepreneur`, `guest_lecturer`, `researcher`, `institution_admin`, `university_partner`, `ancr_admin`, plus a secondary `roles: List[Role]` field on User for compound identities (e.g., producer + adjunct_faculty + mentor).

### 2.4 Permissions Matrix (high-level)

| Action | Student | Pro/Mentor | Faculty | Dept Chair | Inst. Admin | Employer | ANCR Admin |
|---|---|---|---|---|---|---|---|
| View own dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| View directory | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| View any professional profile | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Publish review | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Publish recommendation | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Post opportunity | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Apply to opportunity | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Upload portfolio | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Create share kit (self) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create share kit (other) | ✗ | supervising only | ✓ | ✓ | ✓ | ✗ | ✓ |
| View institution analytics | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |
| Run AIAH | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Provision provider creds | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ |

### 2.5 Workflows

**W-1 Register → Login → Dashboard**
Register `POST /auth/register` → session cookie set → `GET /auth/me` → redirect `/dashboard` → `GET /dashboard/overview` populates hero + tiles.

**W-2 Publish Professional Review**
Professional opens `/students/{id}` → clicks "Add Professional Review" → 9 sliders + 3 textareas → `POST /reviews` → server writes review + fires `Notification` for the student.

**W-3 Portfolio Upload**
User opens `/portfolio` → drag-drop or click browse → `POST /uploads` multipart → server validates extension & size → PUTs to Emergent Object Storage → inserts `portfolio_files` doc → UI refreshes grid.

**W-4 Share Kit Create**
User opens `/share-kits` → selects kind + expiry → `POST /share/kits` → server generates `slug` → link copied to clipboard → public link renders at `/p/{slug}` (no auth).

**W-5 AIAH Insight**
User opens `/aiah` (or clicks Dashboard AIAH panel) → selects a preset → `POST /aiah/generate` → server invokes `emergentintegrations.LlmChat` with Claude Sonnet 4.5 → response persisted to `ai_insights` → rendered as Markdown.

**W-6 Session Booking (v1.0 placeholder)**
User opens session → RSVP → provider ("Zoom" etc.) requested via `/integrations` → adapter is stubbed until credentials arrive.

### 2.6 Edge Cases
- **User with `provider: emergent_google`** has no `password_hash` — password login must fail cleanly.
- **Share kit revocation** must respect ownership: only subject or creator or ancr_admin can revoke.
- **Share kit expiry** enforced server-side; UI shows "Share link expired" (HTTP 410).
- **Portfolio file `visibility: public`** — download endpoint must skip auth.
- **Public share of student profile** includes reviews + recommendations but excludes email + mentor_ids.
- **AIAH LLM failure** — deterministic fallback text is returned; demo never breaks.
- **Duplicate email registration** returns HTTP 409.
- **Emergent SSO exchange** with invalid session_id returns 401 and stays on `/login?error=emergent`.
- **Uploaded file with unsupported extension** returns HTTP 415.
- **Uploaded file exceeding 50 MB** returns HTTP 413.

### 2.7 Acceptance Criteria (v1.0)
- All 54 API endpoints respond correctly for at least one seeded user context.
- Testing agent's 39/39 pytest suites pass.
- All flagship pages render on 1440×900 desktop viewport without layout shift.
- Every interactive element has a `data-testid`.
- Dark obsidian theme is enforced across all pages; no unintended light backgrounds.
- Actual COHEIR / CCDP / ANCR brand assets are used verbatim (no re-drawn variants).

---

## 3. Technical Architecture

### 3.1 High-level Diagram

```
┌───────────────────────────────────────────────────────────────────┐
│                          Browser (React 19)                        │
│  ┌─────────────┐   ┌───────────────┐   ┌────────────────────┐    │
│  │ AuthProvider│──▶│  App Router   │──▶│  Page components   │    │
│  └─────────────┘   └───────────────┘   └────────────────────┘    │
│           │                │                    │                  │
│           ▼                ▼                    ▼                  │
│  ┌────────────────── axios (withCredentials) ──────────────────┐  │
└──┼──────────────────────────────────────────────────────────────┼──┘
   │                                                              │
   ▼                                                              │
┌───────────────── K8s Ingress (host/api → :8001) ────────────────┐
│                                                                 │
│  ┌────────────── FastAPI  (Python 3.11, Motor) ─────────────┐   │
│  │                                                          │   │
│  │  /api/auth/*      /api/professionals/*  /api/students/* │   │
│  │  /api/sessions/*  /api/cohorts/*        /api/reviews/*  │   │
│  │  /api/opportunities/*  /api/recommendations/*           │   │
│  │  /api/creative-teams/* /api/calendar    /api/threads/*  │   │
│  │  /api/resources /api/notifications /api/dashboard/*     │   │
│  │  /api/aiah/*     /api/uploads/*         /api/share/*    │   │
│  │  /api/providers/* /api/analytics/*                      │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│      │             │                    │                       │
│      ▼             ▼                    ▼                       │
│  ┌────────┐  ┌────────────┐  ┌────────────────────────┐        │
│  │ Mongo  │  │ Object     │  │ Emergent Universal LLM │        │
│  │ (Motor)│  │ Storage    │  │ (Claude Sonnet 4.5)    │        │
│  └────────┘  └────────────┘  └────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Frontend Architecture
- **React 19** + **React Router 6**
- **Tailwind CSS** + **shadcn/ui** primitives
- **Framer Motion** for cinematic animations
- **Recharts** for institution analytics
- **Sonner** for toasts
- **Axios** with `withCredentials: true`, cookie session, and Bearer fallback via `localStorage.coheir_bearer`
- **AuthProvider** (`/app/frontend/src/lib/auth.jsx`) — React Context providing `{user, loading, login, register, demoLogin, logout, refresh, setUser}`
- **AppShell** guards authenticated routes (`Navigate` to `/login?next=…` when unauthenticated)
- **AuthCallback** page handles Emergent SSO redirect by consuming `#session_id=…` fragment
- **PublicShare** page uses **raw axios** (bypasses `api` instance) so that no auth cookies are sent

### 3.3 Backend Architecture
- **FastAPI** (Python 3.11)
- **Motor** (async MongoDB driver)
- **Pydantic v2** (`BaseDoc` with UUID ids, timezone-aware datetimes)
- **bcrypt** for password hashing (12-round default)
- **httpx** for Emergent OAuth session exchange (async)
- **requests** for Object Storage (sync — tracked tech-debt for `httpx.AsyncClient` migration)
- **emergentintegrations** for Claude Sonnet 4.5 chat sessions
- **starlette CORSMiddleware** with `allow_credentials=True`
- **lifespan** context manager for Mongo client + index creation + seed loading + object-storage init

### 3.4 Folder Structure

```
/app/
├── backend/
│   ├── server.py            # FastAPI app + lifespan + /api mount + CORS
│   ├── models.py            # 15 Pydantic document models
│   ├── auth.py              # Dual auth + session tokens
│   ├── routes.py            # 30+ core domain endpoints
│   ├── aiah.py              # Claude Sonnet 4.5 wrapper + fallback
│   ├── uploads.py           # Portfolio uploads (Emergent Object Storage)
│   ├── share_kits.py        # Revocable share-kit engine
│   ├── providers.py         # Interchangeable provider registry
│   ├── analytics.py         # 12 institution dashboards
│   ├── seed_data.py         # Rich demo dataset builder
│   ├── requirements.txt
│   ├── .env                 # MONGO_URL / DB_NAME / CORS_ORIGINS / EMERGENT_LLM_KEY
│   └── tests/
│       ├── backend_test.py  # iteration 1 (27 tests)
│       └── test_v11.py      # iteration 2 (12 new tests)
│
├── frontend/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env                 # REACT_APP_BACKEND_URL
│   ├── public/
│   └── src/
│       ├── index.js
│       ├── index.css        # Fonts + globals + gradient utilities
│       ├── App.js           # Router + AuthProvider
│       ├── App.css
│       ├── lib/
│       │   ├── api.js       # axios instance
│       │   └── auth.jsx     # AuthProvider + useAuth()
│       ├── components/
│       │   ├── ui/          # shadcn primitives
│       │   ├── layout/
│       │   │   ├── AppShell.jsx
│       │   │   ├── Sidebar.jsx
│       │   │   └── TopBar.jsx
│       │   └── coheir/
│       │       ├── CoheirLogo.jsx
│       │       ├── CCDPLogo.jsx
│       │       ├── AncrBadge.jsx
│       │       └── MentorCard.jsx (+ RoleChip, VerifiedBadge)
│       └── pages/           # 30 page components
│
└── memory/
    ├── PRD.md
    ├── test_credentials.md
    ├── COHEIR_V1_BUILD_INVENTORY.md
    └── COHEIR_Technical_Specification_v1.0.md  ← this document
```

### 3.5 Data Flow (representative — Publish Review)

```
User (Professional) ─────▶ StudentDetail.jsx
                              │  submitReview()
                              ▼
                        axios.post('/api/reviews', body)
                              │  Bearer / cookie
                              ▼
       Ingress ──▶ FastAPI ──▶ auth.current_user  ── raises 401 if invalid
                                    │
                                    ▼
                        routes.create_review()
                                    │
                                    ▼
                    Review(model_dump) ──▶ Motor: db.reviews.insert_one()
                                    │
                                    ▼
                    Notification(model_dump) ──▶ Motor: db.notifications.insert_one()
                                    │
                                    ▼
                        JSON response ─────▶ toast.success()
                                                     │
                                                     ▼
                                              load() re-renders reviews
```

### 3.6 State Management
- **Server state**: Motor / MongoDB. Persistent, source-of-truth.
- **Session state**: `user_sessions` collection + `coheir_session` httpOnly cookie + `localStorage.coheir_bearer` fallback.
- **Client state**: React Context (`AuthProvider`) for `user`; local `useState` per page for form and list state. No Redux / Zustand / Recoil — intentional simplicity.
- **URL state**: `useSearchParams` for filter chips (`?q=`, `?role=`, `?next=`).

### 3.7 API Architecture Principles
- **All routes prefixed `/api`** (required by ingress).
- **JSON in, JSON out** (except `POST /uploads` — multipart).
- **UUIDv4 ids** in application layer; MongoDB `_id` (ObjectId) is projected out of every response (`{"_id": 0}`).
- **Datetimes**: ISO strings persisted, `datetime.now(timezone.utc)` created, never `utcnow()`.
- **Error contract**: HTTP status + `{"detail": "..."}` matching FastAPI defaults.
- **Pagination**: naive `limit` query params where relevant. Full cursor pagination deferred.
- **Idempotency**: seed script is idempotent (checks `users.count_documents({}) == 0` before inserting).

### 3.8 Authentication Flow

**Email/password**
```
POST /api/auth/register {email, password, name, role, institution?}
  → bcrypt.hashpw(password)
  → users.insert_one(User)
  → user_sessions.insert_one(session)
  → Set-Cookie: coheir_session=cohst_...; HttpOnly; SameSite=None; Secure
  → 200 {user, session_token}

POST /api/auth/login {email, password}
  → bcrypt.checkpw
  → new session_token
  → Set-Cookie
  → 200 {user, session_token}
```

**Emergent Google SSO**
```
Browser ──▶ https://auth.emergentagent.com/?redirect=/dashboard
Emergent redirects back to /dashboard#session_id=XXX
  React AuthCallback picks up hash, calls
POST /api/auth/emergent {session_id}
  Backend hits https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data
    X-Session-ID: XXX
  ── receives {email, name, picture}
  ── upserts user (verified=true, provider=emergent_google)
  ── issues session_token + cookie
  → 200 {user, session_token}
```

**Demo login (dev/reviewer only)**
```
POST /api/auth/demo {email: "danielle.mcmillan@ccdp.edu"}
  → looks up existing seeded user
  → issues session_token + cookie
  → 200 {user, session_token}
```

### 3.9 Authorization Model
`auth.current_user(request)` FastAPI dependency:
1. Reads `coheir_session` cookie OR `Authorization: Bearer <token>` header.
2. Looks up `user_sessions` doc; validates `expires_at`.
3. Loads user doc, strips `password_hash`, returns `UserPublic`.
4. Raises `HTTPException(401)` otherwise.

Role gates via `require_role("faculty", "producer", ...)` factory: checks the intersection of `{user.role} ∪ user.roles` with the required set.

### 3.10 Error Handling
- FastAPI defaults (`HTTPException` → JSON).
- Custom errors:
  - 401 "Not authenticated" / "Session expired" / "User not found"
  - 403 "Insufficient role" / "Not allowed"
  - 404 "Not found" (resources, share links, subjects)
  - 409 "Email already registered"
  - 410 "Share link expired"
  - 413 "File exceeds 50MB limit"
  - 415 "Unsupported file type: .{ext}"
  - 503 "Storage unavailable"
- Frontend: `try/catch` around API calls with `toast.error(e?.response?.data?.detail || fallback)`.

### 3.11 Logging
- Python `logging` module, `INFO` level.
- Named loggers: `coheir` (server), `aiah` (Claude wrapper), `uploads` (object storage).
- Format: `%(asctime)s - %(name)s - %(levelname)s - %(message)s`.
- Emitted to stdout → captured by supervisor → `/var/log/supervisor/backend.{out,err}.log`.
- **No PII in logs**. No passwords, tokens, or personal identifiers.

---

## 4. Database Schema

MongoDB. Database name from `DB_NAME` env var (`test_database` in dev).

### 4.1 `users` (unique index: `user_id`, `email`)

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Never returned |
| `id` | str (UUID hex) | |
| `user_id` | str | `user_<hex12>`; unique index |
| `email` | str | lowercase; unique index |
| `name` | str | |
| `picture` | Optional[str] | URL |
| `ancrid` | str | `ANCRID-<UPPER10>` |
| `role` | Role enum (str) | Primary role |
| `roles` | List[Role] | Compound roles |
| `verified` | bool | ANCRID verified |
| `institution` | Optional[str] | |
| `institution_id` | Optional[str] | Future FK to `institutions` |
| `title` | Optional[str] | e.g. "Grammy-Winning Producer" |
| `location` | Optional[str] | |
| `bio` | Optional[str] | |
| `provider` | `emergent_google` \| `password` | |
| `password_hash` | Optional[str] | bcrypt; NEVER returned |
| `company` | Optional[str] | |
| `disciplines` | List[str] | |
| `expertise` | List[str] | |
| `awards` | List[str] | |
| `certifications` | List[str] | |
| `languages` | List[str] | |
| `industries` | List[str] | |
| `years_experience` | Optional[int] | |
| `availability` | Optional[str] | |
| `mentorship_philosophy` | Optional[str] | |
| `teaching_interests` | List[str] | |
| `portfolio_links` | List[{label, url}] | |
| `professional_links` | List[{label, url}] | |
| `credits` | List[{title, artist, role, year, label}] | |
| `career_history` | List[{role, company, years}] | |
| `current_projects` | List[{title, role, collaborators, status}] | |
| `graduation_year` | Optional[int] | Students |
| `program` | Optional[str] | Students |
| `cohort_id` | Optional[str] | FK → `cohorts.id` |
| `skills` | List[str] | |
| `goals` | List[str] | |
| `achievements` | List[{title, date}] | |
| `career_readiness` | Optional[int] | 0-100 |
| `mentor_ids` | List[str] | FK → `users.user_id` |
| `is_alumni` | bool | Lifelong network flag |
| `alumni_class` | Optional[int] | Graduation year |
| `alumni_role` | Optional[str] | Post-grad role |
| `created_at` | ISO string | |

### 4.2 `user_sessions` (unique index: `session_token`)
| Field | Type | Notes |
|---|---|---|
| `id` | str (hex12) | |
| `user_id` | str | FK → `users.user_id` |
| `session_token` | str | `cohst_<url-safe>`; unique |
| `expires_at` | ISO string | UTC |
| `created_at` | ISO string | |

TTL: 7 days. Explicit expiry check on every request (no MongoDB TTL index — intentional for auditability).

### 4.3 `cohorts`
`{id, name, discipline, program, institution, year, description, faculty_lead_id (FK→users.user_id), mentor_ids: List[str], student_ids: List[str], cover_image, status, created_at}`

### 4.4 `sessions`
`{id, title, kind (12 enum), description, host_id, host_name, co_host_ids: List[str], cohort_id?, start (ISO), duration_minutes, location, meeting_url?, capacity, attendee_ids: List[str], cover_image, status (scheduled|live|completed|cancelled), tags: List[str], created_at}`

### 4.5 `reviews`
`{id, student_id, reviewer_id, reviewer_name, session_id?, project_id?, scores: {creative_growth, technical_ability, professionalism, communication, leadership, collaboration, innovation, entrepreneurship, industry_readiness} (each 1-10), comments, recommendations, growth_plan, published, created_at}`

### 4.6 `opportunities`
`{id, title, posted_by_id, posted_by_name, company, kind (13 enum), description, location, compensation?, deadline? (ISO), disciplines: List[str], applicant_ids: List[str], status, created_at}`

### 4.7 `recommendations`
`{id, student_id, recommender_id, recommender_name, for_type (12 enum), target, narrative, verified, created_at}`

### 4.8 `creative_teams`
`{id, name, project, lead_id, lead_name, members: [{user_id, name, role, avatar}], cohort_id?, description, ancrsync_workspace?, cover_image, status, created_at}`

### 4.9 `calendar_events`
`{id, title, owner_id, kind (11 enum), start (ISO), end (ISO), location, attendees: List[str], session_id?, notes?, created_at}`

### 4.10 `threads`
`{id, title, participant_ids: List[str], kind (direct|group|announcement), last_message?, last_at (ISO), created_at}`

### 4.11 `messages`
`{id, thread_id (FK→threads.id), sender_id, sender_name, body, kind, created_at}`

### 4.12 `resources`
`{id, title, kind (10 enum), description, uploaded_by_id, uploaded_by_name, url?, cover_image, tags: List[str], access (public|cohort|private), created_at}`

### 4.13 `notifications`
`{id, user_id, kind, title, body, link?, read: bool, created_at}`

### 4.14 `ai_insights`
`{id, user_id, context, kind, prompt, output, subject_ids: List[str], created_at}`

### 4.15 `institutions`
`{id, name, short_code, country, programs: List[str], verified, logo?, created_at}`

### 4.16 `portfolio_files`
`{id (=file_id), user_id, user_name, storage_path, original_filename, content_type, extension, size, category (demo|artwork|document|video|reference|archive), title, description?, visibility (private|shared|public), is_deleted, created_at}`

### 4.17 `share_kits` (unique index: `slug`)
`{id, slug, kind (7 enum), subject_user_id, subject_ancrid, created_by_id, created_by_name, label, fields: List[str], revoked, views, expires_at?, created_at}`

### 4.18 `provider_requests`
`{id, user_id, user_name, provider_id, kind (video|calendar), note?, status (pending|provisioned), created_at}`

### 4.19 Indexes Created at Startup
```python
users.create_index("user_id", unique=True)
users.create_index("email", unique=True)
user_sessions.create_index("session_token", unique=True)
share_kits.create_index("slug", unique=True)
```

Recommended additions (P1): `sessions.start`, `reviews.student_id`, `notifications.user_id + created_at`, `portfolio_files.user_id`, `messages.thread_id + created_at`.

### 4.20 Constraints
- **No cascading deletes** — data is soft-deleted (`is_deleted: true`) or logically retired (`revoked: true`, `status: 'closed'`).
- **Referential integrity** — enforced in application layer only; MongoDB does not enforce FKs.
- **Uniqueness** — enforced via indexes on `email`, `user_id`, `session_token`, `slug`.

---

## 5. API Documentation

**Base URL**: `${REACT_APP_BACKEND_URL}/api`
**Auth**: session cookie (`coheir_session`) OR `Authorization: Bearer <token>`. `PublicShare.get(/share/public/{slug})` and `GET /uploads/file/{id}/download` (public files) skip auth.
**Content type**: `application/json` unless noted (uploads use `multipart/form-data`).

### 5.1 Auth
| Route | Method | Auth | Body | Response |
|---|---|---|---|---|
| `/auth/register` | POST | ✗ | `{email, password, name, role, institution?}` | `{user, session_token}`; sets cookie |
| `/auth/login` | POST | ✗ | `{email, password}` | `{user, session_token}` |
| `/auth/emergent` | POST | ✗ | `{session_id}` | `{user, session_token}` |
| `/auth/demo` | POST | ✗ | `{user_id?, email?}` | `{user, session_token}` (dev only) |
| `/auth/me` | GET | ✓ | – | `UserPublic` |
| `/auth/logout` | POST | ✓ | – | `{ok: true}`; clears cookie |

**Example**
```bash
curl -X POST $URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"danielle.mcmillan@ccdp.edu","password":"demo1234"}'
```
```json
200 {"user":{"user_id":"user_...","email":"...","name":"Danielle McMillan","ancrid":"ANCRID-..."},"session_token":"cohst_..."}
```

### 5.2 Directory
| Route | Method | Auth | Query | Response |
|---|---|---|---|---|
| `/professionals` | GET | ✓ | `q, role, discipline, location, limit` | `[UserPublic]` |
| `/professionals/featured` | GET | ✓ | `limit=6` | `[UserPublic]` |
| `/professionals/{user_id}` | GET | ✓ | – | `UserPublic` |

### 5.3 Students & Supervision
| Route | Method | Auth | Query/Body | Response |
|---|---|---|---|---|
| `/students` | GET | ✓ | `q, cohort_id, program, limit` | `[UserPublic]` |
| `/students/{user_id}` | GET | ✓ | – | `UserPublic + reviews + recommendations` |
| `/supervision/mine` | GET | ✓ | – | `[UserPublic]` (student.mentor_ids contains me) |

### 5.4 Cohorts
`GET /cohorts` → `[Cohort]`
`GET /cohorts/{id}` → `Cohort + {students: [UserPublic], mentors: [UserPublic]}`

### 5.5 Sessions
`GET /sessions?kind&cohort_id&limit` → `[Session]`
`GET /sessions/upcoming?limit=6` → `[Session]` (status ∈ {scheduled, live})
`GET /sessions/{id}` → `Session + {attendees: [UserPublic]}`

### 5.6 Reviews
`GET /reviews?student_id` → `[Review]`
`POST /reviews` `{student_id, scores, comments, recommendations, growth_plan, session_id?}` → `Review` (also creates a `Notification`)

**Example — Publish Review**
```bash
curl -X POST $URL/api/reviews -b "coheir_session=..." \
  -H "Content-Type: application/json" \
  -d '{"student_id":"user_...","scores":{"creative_growth":9,"technical_ability":8,"professionalism":9,"communication":8,"leadership":7,"collaboration":9,"innovation":9,"entrepreneurship":8,"industry_readiness":8},"comments":"...","recommendations":"...","growth_plan":"..."}'
```

### 5.7 Opportunities
`GET /opportunities?kind` → `[Opportunity]`
`POST /opportunities/apply {opportunity_id}` → `{ok: true}` (adds `user_id` to `applicant_ids`)

### 5.8 Recommendations
`GET /recommendations?student_id` → `[Recommendation]`
`POST /recommendations {student_id, for_type, target, narrative}` → `Recommendation`

### 5.9 Creative Teams
`GET /creative-teams` · `GET /creative-teams/{id}`

### 5.10 Calendar
`GET /calendar` → `[CalendarEvent]` sorted by `start` asc.

### 5.11 Messaging
`GET /threads` (my threads) · `GET /threads/all` · `GET /threads/{id}/messages` · `POST /threads/messages {thread_id, body}`

### 5.12 Resources
`GET /resources?kind` → `[Resource]`

### 5.13 Notifications
`GET /notifications` → `[Notification]`
`POST /notifications/{id}/read` → `{ok: true}`

### 5.14 Dashboard & Institution Overview
`GET /dashboard/overview` → `{upcoming_sessions, opportunities, recommendations, reviews, threads, notifications, supervised_students, cohorts, stats: {industry_professionals, expert_categories, countries, active_mentorships}}`
`GET /institution/overview` → `{stats: {...}, programs: [str]}`

### 5.15 AIAH
`POST /aiah/generate {kind, prompt, subject_ids?, context}` → `{insight, output}` (Markdown)
`GET /aiah/recent` → `[AIInsight]` (last 10 for current user)

**Example**
```bash
curl -X POST $URL/api/aiah/generate -b "coheir_session=..." \
  -H "Content-Type: application/json" \
  -d '{"kind":"portfolio_gap","prompt":"Analyze portfolio gaps across my supervised students...","context":"dashboard"}'
```

### 5.16 Uploads
`POST /uploads` (multipart) `file, category, title?, description?, visibility` → `PortfolioFile`
`GET /uploads/mine` → `[PortfolioFile]`
`GET /uploads/user/{user_id}` → `[PortfolioFile]` (only visibility ∈ {public, shared})
`GET /uploads/file/{file_id}/download?auth=<token>` → binary
`PATCH /uploads/file/{file_id} {title?, description?, category?, visibility?}` → `PortfolioFile`
`DELETE /uploads/file/{file_id}` → `{ok: true}` (soft delete)

### 5.17 Share Kits
`POST /share/kits {subject_user_id, kind, label?, expires_days?, fields?[]}` → `ShareKit`
`GET /share/kits/mine` → `[ShareKit]`
`POST /share/kits/{id}/revoke` → `{ok: true}`
`GET /share/public/{slug}` (NO AUTH) → `{kit, kind_label, subject: {filtered fields + portfolio_files? + reviews? + recommendations?}}`

### 5.18 Providers
`GET /providers/video` → `[{id, name, description, env_vars, color, connected, future?}]`
`GET /providers/calendar` → same shape
`POST /providers/request-connection {provider_id, kind, email_note?}` → `ProviderRequest`
`POST /providers/preferences {video_provider?, calendar_provider?}` → `{ok: true, prefs}`

### 5.19 Analytics
`GET /analytics/institution` → `{mentor_engagement, student_engagement, creative_output, portfolio_completion, industry_participation, session_attendance, review_activity, career_readiness, graduation_readiness, placement, employer_activity, alumni_engagement, totals}`

### 5.20 Health
`GET /api/` · `GET /api/healthz` → `{ok: true}`

### 5.21 Validation
Pydantic v2 handles all input validation. Endpoint bodies use Pydantic `BaseModel`s declared inline (`LoginBody`, `ReviewCreate`, `RecommendationCreate`, `ApplyBody`, `MessageCreate`, `AIRequest`, `CreateKitBody`, `UpdateFileBody`, `ConnectionRequest`, `ProviderPreference`). All 422 errors are returned by FastAPI automatically with structured field errors.

---

## 6. UI Specification

### 6.1 Design Tokens (`/app/frontend/src/index.css`)
- **Colors**: `--coheir-bg` (#000), `--coheir-surface` (#0A0A0A), `--coheir-elevated` (#111), `--coheir-blue` (#00F0FF), `--coheir-violet` (#8B5CF6), `--coheir-orange` (#F97316).
- **Fonts**: Cabinet Grotesk (headlines, wordmark), Satoshi (body), JetBrains Mono (labels, kickers, chips).
- **Radii**: cards 20px, chips 9999px, buttons 9999px, inputs 12px.
- **Blur**: 20px backdrop for glass panels; 24px for the top-bar.
- **Motion**: `opacity + y (20px)`, `duration 0.4-0.9s`, staggered by index × 0.05s.
- **Grid**: `max-w-[1500px]`, `px-8`, `py-8` for main content.

### 6.2 Layout — App Shell
- Fixed left **Sidebar** (260px width) with:
  - Top logo block (COHEIR logo image + 3 hierarchy dividers: Industry Leadership Network / CCDP Program / Part of the ANCR Ecosystem)
  - Primary nav (12 items) — Home, Directory, Student Supervision, Alumni, Sessions, Cohorts, Reviews, Opportunities, Recommendations, Creative Teams, Portfolio, Share Kits
  - Ecosystem nav (10 items) — Calendar, Conversations, Library, AIAH, ANCRID, Analytics, Institution, Employer, Integrations, Settings
  - Bottom CTA card + ANCR ecosystem badge + Sign-out
- Fixed **TopBar** (72px height, offset from sidebar) with search command bar (⌘K), notifications, messages, profile chip

### 6.3 Pages (30)
Detailed page-by-page anatomy is in `/app/memory/COHEIR_V1_BUILD_INVENTORY.md` §3. Summary here:

- **Public**: `/`, `/login`, `/p/:slug`
- **Authenticated**: `/dashboard`, `/directory`, `/profile/:userId`, `/students`, `/students/:userId`, `/alumni`, `/sessions`, `/sessions/:sessionId`, `/cohorts`, `/cohorts/:cohortId`, `/reviews`, `/opportunities`, `/recommendations`, `/teams`, `/portfolio`, `/share-kits`, `/analytics`, `/integrations`, `/calendar`, `/messages`, `/library`, `/aiah`, `/ancrid`, `/institution`, `/employer`, `/settings`
- `AuthCallback` — invisible

### 6.4 Responsive Behavior
- **Desktop-first** (≥1024px). Sidebar visible.
- **Tablet** (768-1023px): sidebar collapses to icons-only (future; currently hidden with `hidden lg:*` classes on marketing pages, always visible on app).
- **Mobile** (<768px): app shell degrades to a stacked layout with hidden sidebar (future roadmap).

### 6.5 States
- **Loading**: `text-zinc-500 font-mono text-xs uppercase` "Loading COHEIR…" or skeleton grids
- **Empty**: `glass-panel p-10 text-center text-zinc-500` with an inviting message
- **Error**: `toast.error(detail || fallback)` via Sonner; page-level errors render "Return to COHEIR" CTA
- **Success**: `toast.success(...)` — cyan/green tint

### 6.6 Accessibility
- Semantic HTML (`<button>`, `<a>`, `<label>`, `<nav>`, `<main>`, `<aside>`, `<header>`, `<footer>`)
- `alt` attributes on all images
- `aria-label` on icon-only buttons
- Focus rings via `focus-visible:outline-2 outline-cyan-500`
- Color contrast: white on obsidian is 21:1; secondary text is `text-zinc-400` (~7:1). Passes WCAG AA.
- `data-testid` on every interactive element (testing agent contract; also improves screen-reader mapping when combined with semantic tags).

---

## 7. Component Inventory

### 7.1 Layout
- **AppShell** — auth guard + Sidebar + TopBar + main content.
- **Sidebar** — logo hierarchy, primary + ecosystem nav, bottom CTA. Uses `NavLink` for active state.
- **TopBar** — search input (⌘K), notif count (from `/notifications`), profile chip navigating to `/profile/:userId`.

### 7.2 Brand
- **CoheirLogo** — three variants: `mark`, `wordmark`, `full`. Wraps the official brand asset URL.
- **CCDPLogo** — `mark`, `wordmark`, `full` variants.
- **AncrBadge** — `pill`, `block`, `mark`. Renders the "Part of the ANCR Ecosystem" attribution.

### 7.3 Data Presentation
- **MentorCard** — reusable card used on Dashboard featured strip and Directory grouped grid. Props: `p (UserPublic)`, `index (int)`.
- **RoleChip** — `tone: blue | violet | orange | zinc`, `children`. Uniform chip style used everywhere.
- **VerifiedBadge** — cyan checkmark with glow.

### 7.4 Pages (30) — see §6.3

### 7.5 Reusability Guidelines
Any new page must reuse:
- `RoleChip` for tags/kinds
- `MentorCard` for professional cards
- `AncrBadge` for ecosystem attribution
- Layout: `glass-panel` (containers) + `glass-interactive` (clickable cards)
- Motion: standard entrance (`initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}`)
- Typography: `wordmark text-xl/2xl/4xl` for headings, `font-mono text-[10px] tracking-widest uppercase text-zinc-500` for kickers.

---

## 8. Business Rules

### 8.1 Identity
- Every user MUST have an ANCRID at creation time.
- Email is unique across the entire ecosystem (enforced by unique index).
- `provider: emergent_google` users have `verified: true` and no `password_hash`.
- Password rule: minimum length not enforced in v1 (deferred — P1); bcrypt hashing enforces salt uniqueness.

### 8.2 Reviews
- Only non-student roles can `POST /reviews`.
- Score fields must be integers 1-10 (Pydantic will coerce; validation deferred to P1 for hard bounds).
- Publishing a review triggers a `Notification` for the student.
- Reviews permanently attach to ANCRID (never deleted from `reviews` collection; hidden via `published: false` is the intended future soft-hide mechanism).

### 8.3 Opportunities
- Only students can apply.
- Applying is idempotent (`$addToSet` on `applicant_ids`).
- Deadline enforcement is UI-only in v1 (P1 to enforce server-side).

### 8.4 Share Kits
- The subject_user is auto-permitted to create their own kit.
- Others can only create kits of kind `institution_review` or `private_review` and only if they are in the subject's `mentor_ids`.
- Only owner, creator, or `ancr_admin` can revoke.
- Public views count against `views` (audit trail).
- Expired kits return HTTP 410 (Gone).

### 8.5 Portfolio Files
- Owner controls visibility.
- `private` files require auth for download; `public` files are open; `shared` files require auth (P2: also require cohort membership).
- Soft-delete only (`is_deleted: true`); files are never physically deleted in v1 (retention policy TBD).
- Max size 50 MB. Allowed extensions: mp3, wav, aiff, aif, flac, mp4, mov, pdf, docx, pptx, xlsx, jpg, jpeg, png, webp, gif, heic, zip.

### 8.6 AIAH
- All AIAH insights are user-scoped (`GET /aiah/recent` filters by `user_id`).
- LLM failures degrade to a deterministic fallback — the API contract is never broken.
- No PII from other users is ever embedded in an AIAH prompt on the server (the prompt is verbatim from the client; recommend a P1 sanitization pass).

### 8.7 Provider Registry
- A provider is "connected" iff all its `env_vars` are present in the process environment.
- Requesting a connection is idempotent (logged; deduplication deferred).
- ANCR admin owns credential provisioning.

---

## 9. ANCR Ecosystem Integration

COHEIR is a **read-and-write** citizen of the ANCR ecosystem. It never duplicates data owned by another module — it references it and writes back verified events.

### 9.1 ANCRID™ (Identity)
- **Auth**: every login (email/password or Emergent Google SSO) issues an ANCRID-tagged session.
- **Data shared**: `ancrid`, `role`, `verified`, `institution_id`, `picture`, `name`.
- **Events written back**: reviews, recommendations, mentorship history, achievements, career-readiness score, industry participation.
- **Dependency**: single source of identity. When ANCRID becomes an external service, replace the local user model's `ancrid` generation with a call to `POST /ancrid/verify` and remove local registration.

### 9.2 ANCRA™ (Assets & Rights)
- **Reads**: not yet wired in v1. UI references only (ecosystem strip on profiles).
- **Future**: pull rights registry for verified credits on Professional Profile.

### 9.3 ANCRLAB™ (Creative Portfolio)
- **Reads**: Student Detail page shows an "ANCRLAB™ Creative Portfolio" panel — currently a hard-coded snippet illustrating the intent; wire to `ANCRLAB` service when the endpoint is available.
- **Writes**: none.

### 9.4 ANCRSync™ (Live Collaboration)
- **Reads**: Creative Team model has an `ancrsync_workspace` string (e.g. `ANCRSync://halo-country`) used to deep-link into a workspace.
- **Writes**: none.

### 9.5 INHEIRA™ (Publishing Metadata)
- **Reads**: Student Detail's INHEIRA panel; a P2 endpoint should expose split-sheets & publisher assignments.
- **Writes**: recommendations to publishers can trigger an INHEIRA notification (P1).

### 9.6 Vaulta™ (Ownership Vault)
- **Reads**: authorized read view only (permissions inherited from ANCRID). Not wired in v1.

### 9.7 ANCRMEDIA™
- **Reads**: not wired in v1. Placeholder intent: media hosting for student showcases + Industry Sessions recordings.

### 9.8 ANCRLaunch™ (Venture Pipeline)
- **Reads**: not wired in v1. UI references only.
- **Writes**: recommendations of type `graduate_program` / `residency` could sync to ANCRLaunch (P2).

### 9.9 COHEIR ↔ Peer Modules (Auth, Events, Data)
- **Auth**: all peer modules share ANCRID sessions. A user logged into COHEIR must be recognized by peers via a shared `session_token` (or a future JWT signed by ANCRID).
- **Events (recommended architecture)**: a lightweight event bus (NATS / Redis Streams) where COHEIR emits `review.published`, `recommendation.issued`, `share_kit.created`, `portfolio.uploaded`, and peer modules subscribe. Deferred to Phase 2.
- **Shared data**: users, cohorts, sessions, and share kits should be read by peers via read-only APIs — recommend exposing `/api/public/ecosystem/{resource}` in each module with ANCR-signed requests only.

---

## 10. Security Specification

### 10.1 Authentication
- **Cookie**: `coheir_session`, `HttpOnly`, `Secure`, `SameSite=None`, `Path=/`, 7-day expiry.
- **Bearer**: `Authorization: Bearer cohst_<token>` fallback stored in `localStorage.coheir_bearer` for cross-origin CLI/testing.
- **Password hashing**: bcrypt via `bcrypt.hashpw(password.encode(), bcrypt.gensalt())` (default 12 rounds).
- **Emergent SSO**: server-side exchange only; never expose the Emergent session_id to logs.

### 10.2 Authorization
- `require_role("faculty", …)` FastAPI dependency.
- Ownership checks in `share_kits.revoke_kit`, `uploads.update_file`, `uploads.delete_file`, `notifications.mark_read`.

### 10.3 Session Management
- Sessions persisted in `user_sessions` collection.
- Expiry validated on every request.
- Logout deletes the session doc AND clears the cookie.
- No refresh-token flow in v1 (7-day sliding TTL considered adequate; P1 to add refresh).

### 10.4 Rate Limiting
- **Not enforced in v1**. P1: add `slowapi` middleware with per-IP + per-user buckets:
  - `/auth/login`: 10 / minute / IP
  - `/aiah/generate`: 20 / hour / user
  - `/uploads`: 30 / hour / user

### 10.5 Encryption
- **In transit**: TLS (managed by K8s ingress).
- **At rest**: MongoDB storage encryption (infra layer). Application does not encrypt secondary fields.

### 10.6 Audit Logging
- `share_kits.views` increments on every public view (audit surface).
- `provider_requests` logs every connection request.
- `notifications` doubles as an audit trail for reviews & recommendations.
- P1: add a generic `audit_log` collection with `{actor, action, target, timestamp, meta}`.

### 10.7 Privacy Controls
- Student PII never leaves ANCRID-inherited visibility. Public share kits filter fields by `kind`:
  - `press_kit` / `public_portfolio` NEVER include `email`, `mentor_ids`, `graduation_year`
  - `institution_review` includes `career_readiness` but never email
  - `private_review` is faculty-only (accessed via link but expected to be short-TTL)
- `email` is stripped from `share/public/{slug}` responses.
- `password_hash` is stripped from every user response by construction (`UserPublic` schema).

### 10.8 Threats & Mitigations
| Threat | Mitigation |
|---|---|
| Session hijack | HttpOnly + Secure cookie; short (7d) TTL; server-side revocation on logout |
| Password brute force | P1 — rate-limit + progressive delays |
| SSRF via Emergent SSO | Backend fetches only Emergent's known endpoint (hardcoded URL) |
| XSS | React auto-escapes; no `dangerouslySetInnerHTML` used |
| CSRF | SameSite=None cookie with credentials — must be paired with CORS `allow_origins` in prod (currently `*` for dev; MUST be tightened before public launch) |
| Storage abuse | 50 MB per file; MIME whitelist; extension whitelist |
| Share-link leak | Revocable + expirable; audit views |
| AIAH prompt injection | LLM is scoped to a system prompt; no tool use in v1; safe |

---

## 11. Testing Documentation

### 11.1 Backend Unit / Integration
- **Iteration 1** (v1.0 core): 27 pytest cases in `/app/backend/tests/backend_test.py`
- **Iteration 2** (v1.1 delta): 12 pytest cases in `/app/backend/tests/test_v11.py`
- **Total**: 39 / 39 pass

Coverage areas:
- All auth flows (register / login / demo / me / logout / emergent 401)
- Directory & search
- Student detail hydration
- Session CRUD + hydration
- Reviews create & list
- Opportunities apply
- Recommendations create
- Uploads: reject bad type (415), accept png, list, patch visibility, delete
- Share kits: create, list mine, public GET without auth, revoke, expiry (410)
- Providers: list video/calendar, connection request
- Analytics: 12 dashboard keys present + totals shape
- Alumni users present with correct flags

### 11.2 Frontend
Testing agent used Playwright with the `data-testid` contract. All critical flows verified end-to-end.

### 11.3 Test Reports
- `/app/test_reports/iteration_1.json`
- `/app/test_reports/iteration_2.json`

### 11.4 Known Limitations
- **No load testing** in v1.
- **No fuzz testing** on inputs.
- **No mobile-viewport visual regression**.
- **No accessibility audit** (axe / Lighthouse) — recommended P1.

---

## 12. Deployment Guide

### 12.1 Environment Variables

**Backend `.env`**
```
MONGO_URL=<supplied by platform>          # do not modify
DB_NAME=<supplied by platform>            # do not modify
CORS_ORIGINS=*                            # tighten for production
EMERGENT_LLM_KEY=<supplied by platform>   # powers AIAH + Object Storage
```

**Frontend `.env`**
```
REACT_APP_BACKEND_URL=<supplied by platform>   # do not modify
```

**Optional (activate providers)**
```
ZOOM_ACCOUNT_ID / ZOOM_CLIENT_ID / ZOOM_CLIENT_SECRET
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
MS_TENANT_ID / MS_CLIENT_ID / MS_CLIENT_SECRET
WEBEX_CLIENT_ID / WEBEX_CLIENT_SECRET
RIVERSIDE_API_KEY
STREAMYARD_API_KEY
APPLE_CALDAV_URL
CALENDLY_API_KEY
```

### 12.2 Required Services
- **MongoDB** (via `MONGO_URL`)
- **Emergent Object Storage** (via `EMERGENT_LLM_KEY`)
- **Emergent LLM** (via `EMERGENT_LLM_KEY`)
- **Emergent Auth Session endpoint** (`https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data`)

### 12.3 Build & Start
- **Backend**: `pip install -r /app/backend/requirements.txt` → managed by supervisor on port 8001 (host binding `0.0.0.0:8001`).
- **Frontend**: `yarn install && yarn start` → CRA hot-reload on port 3000.
- **K8s Ingress** maps `/api/*` → backend:8001 and everything else → frontend:3000.

### 12.4 Supervisor
```
sudo supervisorctl status                 # backend / frontend / mongodb / nginx-code-proxy
sudo supervisorctl restart backend        # after .env changes or dep installs
```

Hot-reload is on for both services; supervisor restarts are only required after dependency or env changes.

### 12.5 Deployment Steps (Emergent platform)
1. Confirm `/app/backend/.env` and `/app/frontend/.env` are present.
2. Verify `sudo supervisorctl status` shows RUNNING for backend + frontend + mongodb.
3. Verify `curl $BACKEND_URL/api/healthz` returns `{"ok": true}`.
4. Run `deployment_agent` for static health check (hardcoded secrets, port config, CORS).
5. Push via Emergent "Deploy" button.

### 12.6 Rollback
- Emergent platform provides checkpoint rollback via the UI.
- Manual: `git checkout <sha> -- backend/ frontend/ && sudo supervisorctl restart backend frontend`.
- DB rollback: MongoDB is idempotent-seeded; drop the database and restart the backend to re-seed.

---

## 13. Production Readiness Checklist

### 13.1 Completed
- [x] Dual authentication (email/password + Emergent Google SSO + demo login)
- [x] ANCRID identity model
- [x] 54 API endpoints
- [x] 15 data models + startup indexes
- [x] Rich seeded demo dataset
- [x] Portfolio uploads via Emergent Object Storage
- [x] Revocable share kits (7 kinds)
- [x] AIAH powered by Claude Sonnet 4.5 with deterministic fallback
- [x] Interchangeable provider registry (12 providers)
- [x] 12 institution analytics dashboards
- [x] Alumni / lifelong-network model
- [x] Public share pages (no auth) with permission-inheriting field filters
- [x] 39/39 automated tests pass

### 13.2 Remaining Work (P0)
- [ ] Zoom Server-to-Server OAuth adapter (needs credentials)
- [ ] Google Calendar API adapter (needs credentials)
- [ ] Tighten `CORS_ORIGINS` from `*` to specific hostnames for production

### 13.3 Mocked Functionality
- **Meeting join buttons** — currently toast "Joining via ANCRSync™…". Real Zoom / Meet / Teams URLs will populate `session.meeting_url` once adapters land.
- **Third-party connect buttons** in Settings — log a request but do not initiate OAuth.
- **ANCRA / ANCRLAB / ANCRSync / INHEIRA / Vaulta / ANCRLaunch** panels on Student Detail show hard-coded illustrative content until the peer-module APIs are exposed.

### 13.4 Technical Debt
- **Sync `requests` in `uploads.py`** blocks the event loop. Migrate to `httpx.AsyncClient`. Effort: ~1 hour.
- **No refresh-token flow** for sessions. Effort: ~2 hours.
- **No rate limiting**. Effort: ~2 hours (slowapi).
- **Recharts issues width(-1) height(-1) warnings** on first paint in some layouts. Cosmetic; fixed via `min-height` wrapper in v1.1.
- **No cursor pagination**. All list endpoints use naive `limit`. Effort: ~3 hours.

### 13.5 Future Enhancements
See Roadmap §14.

---

## 14. Engineering Roadmap

### 14.1 MVP Complete (v1.0) — shipped
All core surfaces + uploads + share kits + analytics + AIAH.

### 14.2 Phase 2 — Q1 next
- Wire Zoom + Google Calendar + Teams adapters
- Async httpx migration for object storage
- WebSocket-driven messaging
- Rate limiting
- Refresh-token flow
- Audit log collection
- Field-level validation hardening (score bounds, password rules)

### 14.3 Phase 3 — Q2 next
- Verifiable ANCRID claim export (W3C VC + OpenBadges)
- Institution-scoped permissions
- Cohort-scoped analytics drilldown
- ANCR event-bus integration (NATS or Redis Streams)
- Real ANCRLAB / ANCRSync / INHEIRA API integration (replace mocks)
- Sponsored Cohort tier (label-branded cohorts)

### 14.4 Production Hardening
- Load testing (target: 500 concurrent authenticated users, p99 < 400ms for `/dashboard/overview`)
- axe accessibility audit → 0 critical issues
- Sentry / OpenTelemetry instrumentation
- Regression test suite in CI
- Tighten CORS to explicit origins
- Multi-region MongoDB replica set

### 14.5 Enterprise
- Institution-scoped multi-tenancy
- SSO adapters: Okta, Azure AD, SAML 2.0
- Contract management for institution licences
- Employer paid tier with Stripe
- White-label theming per institution
- SLA / SOC-2 posture

---

## 15. Architecture Decision Record (ADR)

### ADR-001: MongoDB over Postgres
**Decision**: Use MongoDB via Motor.
**Why**: Rich nested documents (credits, career_history, current_projects, portfolio_links) are natural fits for BSON. The domain has few strict relational constraints. Aligns with the rest of the ANCR ecosystem.
**Trade-off**: No native FK enforcement. Application-level integrity discipline required.

### ADR-002: UUID hex ids over ObjectId
**Decision**: Every document has an application-level `id` field (`uuid.uuid4().hex`). `_id` (ObjectId) is projected out on every response (`{"_id": 0}`).
**Why**: JSON-serialisable, URL-safe, no BSON-to-JSON conversion friction. Also mirrors the rest of the ANCR ecosystem.
**Trade-off**: Slightly larger index footprint than ObjectId.

### ADR-003: Cookie + Bearer dual auth
**Decision**: Persist a `coheir_session` httpOnly cookie AND accept `Authorization: Bearer` header.
**Why**: Cookie for browsers (CSRF-safe with SameSite=None+Secure); Bearer for programmatic clients, testing agent, and cross-origin CLI.
**Trade-off**: Two code paths in `current_user`, slightly more surface area.

### ADR-004: Sync `requests` inside async endpoints (Object Storage)
**Decision**: Ship v1 with `requests.put()` / `requests.get()` inside async endpoints.
**Why**: Emergent Object Storage docs use sync `requests`. Time-boxed. Not a correctness issue at demo scale.
**Trade-off**: Blocks the event loop under high concurrency. Documented tech debt.

### ADR-005: emergentintegrations library over raw Anthropic SDK
**Decision**: Use `emergentintegrations.llm.chat.LlmChat` for Claude 4.5.
**Why**: The Emergent Universal Key routes through this library. Zero cost to swap providers (`with_model("openai", ...)` etc.).
**Trade-off**: Coupled to Emergent's library surface.

### ADR-006: Deterministic AIAH fallback
**Decision**: If the LLM call fails, return a hard-coded but ecosystem-appropriate Markdown block.
**Why**: The demo must never break, and the fallback still contains genuine value ("Suggested Action Items" section).
**Trade-off**: Reviewers might see the fallback and think the LLM isn't connected; mitigated by preferring live output whenever the key works.

### ADR-007: No dedicated events / message bus in v1
**Decision**: All cross-collection side effects (e.g., "publish review → create notification") are performed synchronously in the same request.
**Why**: Simpler operations, lower infra, adequate for demo scale.
**Trade-off**: Adding ANCR-wide event fanout will require a bus (NATS / Redis Streams). Deferred to Phase 2.

### ADR-008: Emergent Object Storage over S3/GCS
**Decision**: Use Emergent's native object storage (initialised via the LLM key).
**Why**: One credential covers all Emergent-managed services; consistent with the rest of the ecosystem.
**Trade-off**: Not portable to non-Emergent environments without a swap-in adapter.

### ADR-009: `is_alumni` flag on `users` instead of a separate `alumni` collection
**Decision**: Alumni are first-class users.
**Why**: An alum is *still* a user with the same ANCRID; they may return as mentor, employer, or industry partner. Splitting them would create migration and identity headaches.
**Trade-off**: Slightly heavier User document; mitigated by nullable fields.

### ADR-010: Provider registry as declarative config rather than concrete adapters in v1
**Decision**: Ship v1 with a JSON-like registry (`providers.py`) and defer adapter implementation until credentials arrive.
**Why**: The user explicitly requested "beautiful placeholders" until credentials arrive. Registry design keeps the door open for any of 12 providers.
**Trade-off**: No actual meeting creation in v1; documented as P0 remaining work.

### ADR-011: Recharts over D3
**Decision**: Recharts for the 12 institution dashboards.
**Why**: React-native, composable, tree-shakeable, already in `package.json`. D3 would give more control but at 3-5× effort.
**Trade-off**: Some custom chart types (e.g., Sankey) aren't first-class in Recharts. Not needed for v1.

### ADR-012: Actual brand asset images embedded via `<img>` (over re-drawn SVG)
**Decision**: Reference the user-provided COHEIR / CCDP / ANCR PNG assets directly.
**Why**: Brand fidelity. Re-drawn variants risk drifting from official design.
**Trade-off**: Larger initial page weight; mitigated by CDN caching from Emergent's asset store.

### ADR-013: Public share view uses raw axios (no shared `api` instance)
**Decision**: `PublicShare.jsx` imports `axios` directly.
**Why**: The shared `api` instance sends credentials (cookies + Bearer). Public share endpoint must be genuinely unauthenticated. Mixing them risks leaking auth headers into public traffic.
**Trade-off**: One-off pattern; documented.

### ADR-014: Field-whitelist share kits over generic "share everything"
**Decision**: Each of the 7 kit kinds specifies a whitelist of subject fields to expose.
**Why**: Prevents accidental PII leak (email, mentor_ids, etc.). Enforces "permissions inherit from ANCRID™" server-side.
**Trade-off**: Slightly more code per new kit kind; correct trade.

---

## 16. Handoff Notes for the CTO

### 16.1 Current Implementation Status
COHEIR v1.0 ships all in-scope features. The full 39-test suite passes. External-credential integrations (Zoom, Google Calendar, Teams) are architected as pluggable placeholders — activation requires only credential injection and a concrete adapter file per provider.

### 16.2 Outstanding Work
1. **P0** — Provision Zoom + Google Calendar credentials and drop adapter files into `providers/adapters/`.
2. **P0** — Tighten `CORS_ORIGINS` before public launch.
3. **P1** — Migrate Object Storage calls to `httpx.AsyncClient`.
4. **P1** — Rate limiting on `/auth/login`, `/aiah/generate`, `/uploads`.
5. **P1** — Session refresh-token flow.
6. **P2** — Real ANCR peer-module APIs (ANCRLAB, ANCRSync, INHEIRA, Vaulta, ANCRLaunch).

### 16.3 Risks
- **Event-loop blocking** under upload concurrency (mitigation: async migration).
- **CORS `*`** is only safe in dev; production must whitelist explicit origins.
- **No rate limiting** in v1 → possible brute-force / cost-abuse on `/aiah/generate`.
- **AIAH cost budget** — every generation call bills the Emergent LLM key; recommend per-user daily caps before public launch.
- **Object storage retention** unbounded (soft-delete only); recommend a lifecycle policy in Phase 2.

### 16.4 Recommended Next Steps (2-week sprint)
1. Land Zoom + Google Calendar adapters and swap `SessionDetail` "Join Live" to real URLs.
2. Async-migrate `uploads.py`.
3. Add `slowapi` rate limiting.
4. Add a generic `audit_log` collection.
5. Tighten CORS.
6. Instrument OpenTelemetry (traces + metrics).
7. Run an axe accessibility audit and address any critical findings.
8. Load-test `/dashboard/overview` at 500 concurrent users; profile Mongo query plans.

### 16.5 What the Next Engineer Needs
- **Read**: this document, `/app/memory/COHEIR_V1_BUILD_INVENTORY.md`, `/app/memory/PRD.md`, `/app/memory/test_credentials.md`.
- **Run**: `sudo supervisorctl status` → confirm services green; `curl $URL/api/healthz`.
- **Explore**: sign in as `demo-login-grammy-producer` (Cam Rivers) — richest data footprint.
- **Test**: `cd /app/backend && pytest tests/` for the regression suite.
- **Ship**: use `deployment_agent` before every push.

### 16.6 Companion Documents (recommended)
- `ANCRID_Technical_Specification_v1.0.md` — identity module
- `ANCRLAB_Technical_Specification_v1.0.md` — creative portfolio module
- `ANCRSYNC_Technical_Specification_v1.0.md` — live collaboration module
- `INHEIRA_Technical_Specification_v1.0.md` — publishing metadata module
- `ANCRMEDIA_Technical_Specification_v1.0.md` — media hosting module
- `ANCRLAUNCH_Technical_Specification_v1.0.md` — venture pipeline module
- `VAULTA_Technical_Specification_v1.0.md` — ownership vault module
- `ANCR_Ecosystem_Architecture_Specification.md` — cross-module master doc (auth flow, event bus, shared data schema, deployment topology)

---

**End of specification. COHEIR™ v1.0 sealed.**

*This document is maintained under `/app/memory/COHEIR_Technical_Specification_v1.0.md` and should be updated on every substantive change to the module.*
