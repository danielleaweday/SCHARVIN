# COHEIR™ — Version 1.0 Build Inventory (Handoff Document)

**Module**: COHEIR™ — The Industry Leadership Network
**Ecosystem**: ANCR / Contemporary Creative Development Program (CCDP)
**Version**: 1.0
**Status**: ✅ Production-ready for the ANCR staging environment (all in-scope features shipped; external-credential integrations are architected as pluggable placeholders)
**Tagline**: Lead. Mentor. Develop. Launch.
**Prepared for**: Aaron / ANCR CTO

---

## 1. Vision & Positioning

COHEIR™ is the **professional relationship layer of the ANCR ecosystem** — not a mentor directory, not a school app, not a social network. It is the operating system where verified industry leaders and educators actively teach, supervise, produce, review, recommend and launch creators.

Design principle honored throughout: **Every relationship established during CCDP continues into the creator's professional career through ANCRID™.** COHEIR™ is a career-long network, not a temporary student platform.

---

## 2. Roles (23 total)

Every role is a first-class citizen of the ANCRID™ identity model:

| Role | Description |
|---|---|
| `student` | CCDP student under active supervision |
| `faculty` | Teaching faculty |
| `adjunct_faculty` | Industry-embedded faculty |
| `department_chair` | Chair of a department (Songwriting, Production, etc.) |
| `advisor` | Academic advisor |
| `mentor` | General industry mentor |
| `artist` | Recording / performing artist |
| `songwriter` | Songwriter / topline writer |
| `producer` | Music producer |
| `engineer` | Recording / mix / mastering engineer |
| `creative_director` | Creative director / A&R |
| `attorney` | Entertainment attorney |
| `publisher` | Music publisher |
| `manager` | Artist manager |
| `agent` | Booking / talent agent |
| `employer` | Company / label recruiting talent |
| `entrepreneur` | Founder / entrepreneur |
| `guest_lecturer` | One-off guest speaker |
| `researcher` | Academic researcher |
| `institution_admin` | University / conservatory administrator |
| `university_partner` | Partner-institution rep |
| `ancr_admin` | ANCR ecosystem administrator |

A user may hold **multiple secondary roles** via `roles: List[Role]` (e.g. a producer who is also a mentor and adjunct faculty).

---

## 3. Pages (30 total)

### Public (no auth)
1. `/` — **Landing** — cinematic hero, marquee, four pillars, ecosystem strip, footer.
2. `/login` — **Login/Register** — email/password, Emergent Google SSO, 6 one-click demo accounts.
3. `/p/:slug` — **Public Share** — cinematic press-kit render of a Share Kit (no auth).

### Authenticated App Shell (sidebar + top bar)
4. `/dashboard` — **Dashboard** — hero, stat row, upcoming sessions, featured mentors, AIAH panel, opportunities, reviews, cohorts, how-it-works.
5. `/directory` — **Industry Directory** — search + role filter, grouped by role.
6. `/profile/:userId` — **Professional Profile (flagship)** — press-kit hero, verified badge, ANCRID, credits, awards, career history, current projects, ecosystem strip, "Share Profile" button.
7. `/students` — **Student Supervision** — My Supervised / All Students scopes, search.
8. `/students/:userId` — **Student Detail** — ANCRID quick-view, ANCRLAB/ANCRSync/INHEIRA panels, reviews, recommendations, Publish Professional Review form (9 sliders + 3 textareas).
9. `/alumni` — **Alumni Network** — lifelong relationship principle, alumni + network cards.
10. `/sessions` — **Industry Sessions** — kind filters, session cards with live status.
11. `/sessions/:sessionId` — **Session Detail** — attendee roster, Connect Meeting Provider link.
12. `/cohorts` — **Cohorts** — 6 seeded cohorts.
13. `/cohorts/:cohortId` — **Cohort Detail** — mentors + students.
14. `/reviews` — **Reviews** — 9-category evaluation grids.
15. `/opportunities` — **Opportunities** — kind filters, Apply flow.
16. `/recommendations` — **Recommendations** — verified references.
17. `/teams` — **Creative Teams** — ANCRSync workspaces.
18. `/portfolio` — **Portfolio Uploads** — drag-drop, 6 categories, 3 visibility tiers, 12 file formats.
19. `/share-kits` — **Share Kits** — 7 kit types, create, preview, copy, revoke.
20. `/analytics` — **Institution Analytics** — 12 Recharts dashboards.
21. `/integrations` — **Integrations** — 7 video + 5 calendar providers, Connect flow.
22. `/calendar` — **Calendar** — grouped-by-day events.
23. `/messages` — **Conversations** — thread list + live send.
24. `/library` — **Resource Library** — templates, contracts, masterclass videos.
25. `/aiah` — **AIAH** — 4 presets + prompt editor + recent insights.
26. `/ancrid` — **ANCRID™ Passport** — 6 ecosystem tiles verified.
27. `/institution` — **Institution Dashboard** — 8 headline metrics + programs.
28. `/employer` — **Employer Portal** — student search + Request Interview.
29. `/settings` — **Settings** — 25 third-party integration placeholder chips.
30. `AuthCallback` — invisible Emergent-SSO exchange handler.

---

## 4. Backend Modules & API Endpoints

### File Structure
```
/app/backend/
├── server.py         — FastAPI app, lifespan, /api mount, CORS
├── auth.py           — dual auth + session tokens
├── models.py         — 15 Pydantic document models
├── routes.py         — 30+ domain endpoints
├── aiah.py           — Claude Sonnet 4.5 wrapper + fallback
├── uploads.py        — portfolio object storage
├── share_kits.py     — share-kit engine (7 kinds)
├── providers.py      — interchangeable provider registry
├── analytics.py      — 12 institution dashboards
├── seed_data.py      — rich demo dataset builder
└── tests/            — pytest suites
```

### Endpoint Catalog (54 endpoints, all `/api`-prefixed)

**Auth (7)**
- `POST /auth/register` · `POST /auth/login` · `POST /auth/emergent` · `POST /auth/demo` · `POST /auth/logout` · `GET /auth/me`

**Directory & Professionals (3)**
- `GET /professionals?q,discipline,role,location,limit` · `GET /professionals/featured` · `GET /professionals/{user_id}`

**Students & Supervision (3)**
- `GET /students?q,cohort_id,program` · `GET /students/{user_id}` · `GET /supervision/mine`

**Cohorts (2)** — `GET /cohorts` · `GET /cohorts/{cohort_id}` (hydrated with mentors + students)

**Sessions (3)** — `GET /sessions?kind,cohort_id` · `GET /sessions/upcoming` · `GET /sessions/{id}` (hydrated with attendees)

**Reviews (2)** — `GET /reviews?student_id` · `POST /reviews` (writes to ANCRID + fires a notification)

**Opportunities (2)** — `GET /opportunities?kind` · `POST /opportunities/apply`

**Recommendations (2)** — `GET /recommendations?student_id` · `POST /recommendations`

**Creative Teams (2)** — `GET /creative-teams` · `GET /creative-teams/{id}`

**Calendar (1)** — `GET /calendar`

**Messaging (4)** — `GET /threads` · `GET /threads/all` · `GET /threads/{id}/messages` · `POST /threads/messages`

**Resources (1)** — `GET /resources?kind`

**Notifications (2)** — `GET /notifications` · `POST /notifications/{id}/read`

**Dashboard & Institution Overview (2)** — `GET /dashboard/overview` · `GET /institution/overview`

**AIAH (2)** — `POST /aiah/generate` · `GET /aiah/recent`

**Portfolio Uploads (5)** — `POST /uploads` · `GET /uploads/mine` · `GET /uploads/user/{id}` · `GET /uploads/file/{id}/download` · `PATCH /uploads/file/{id}` · `DELETE /uploads/file/{id}`

**Share Kits (4)** — `POST /share/kits` · `GET /share/kits/mine` · `POST /share/kits/{id}/revoke` · `GET /share/public/{slug}` (no auth)

**Providers (4)** — `GET /providers/video` · `GET /providers/calendar` · `POST /providers/request-connection` · `POST /providers/preferences`

**Analytics (1)** — `GET /analytics/institution`

**Health (2)** — `GET /api/` · `GET /api/healthz`

---

## 5. Data Models (15)

Each is a Pydantic model with UUID id, timezone-aware `datetime`, permission-friendly field sets:

1. **User** (23 sub-fields; incl. `is_alumni`, `alumni_class`, `alumni_role`, `provider_prefs`)
2. **UserPublic** (safe API projection; no `password_hash`)
3. **UserSession** (cookie/bearer session)
4. **Cohort** (mentor_ids, student_ids, faculty_lead_id, program, discipline)
5. **Session** (kind × 12, host + co-hosts, attendees, status, tags, cover)
6. **Review** (9-category scores + 3 narrative fields)
7. **Opportunity** (kind × 13, applicant_ids, deadline)
8. **Recommendation** (12 for_type values, verified boolean)
9. **CreativeTeam** (members with roles + ANCRSync workspace ref)
10. **CalendarEvent** (11 kind values, attendees)
11. **Thread** + **Message** (direct / group / announcement)
12. **Resource** (10 kinds, access levels)
13. **Notification** (kind-tagged with link)
14. **AIInsight** (context, kind, prompt, output, subject_ids)
15. **Institution** (short_code, programs, verified)

Additional collections without a formal Pydantic model:
- **portfolio_files** (uploads metadata)
- **share_kits** (revocable public links)
- **provider_requests** (connection request log)

---

## 6. Features & Workflows (A–Z)

### Authentication & Identity
- **Dual auth**: JWT-style session cookie (`coheir_session`, httpOnly, SameSite=None, Secure) + Bearer fallback in `Authorization` header.
- **Emergent Google SSO** exchange (`POST /auth/emergent` with `session_id` from callback hash).
- **Instant demo login** (6 role buttons; no password).
- **Registration** with 10 role choices.
- **ANCRID™ single sign-on identity** — one identity across ANCRA™, ANCRLAB™, ANCRSync™, INHEIRA™, Vaulta™, ANCRLaunch™, COHEIR™.
- **Session lifecycle**: 7-day TTL, indexed unique, auto-cleared on logout.

### Professional Profile (flagship)
- Cinematic hero with press-kit vibe
- Verified badge (ANCRID) with cyan glow
- Availability + Mentorship Philosophy pull-quote
- Disciplines / Expertise / Industries / Teaching Interests chip clouds
- Selected Credits table (title, artist, role, year, label)
- Awards list + Certifications
- Career History timeline
- Current Projects cards
- Portfolio + Professional Links
- Ecosystem Presence strip (6 tiles)
- Actions: **Request Mentorship**, **Message**, **Book a Session**, **Share Profile**

### Student Supervision Surface
- Read-only view of the student's ANCRID quick-view (ANCRLAB, ANCRSync, INHEIRA panels)
- Career readiness gauge (0–100 with gradient bar)
- Verified reviews list with 9-category score grid
- Recommendations list
- Publish Professional Review workflow (9 sliders + Comments/Recommendations/Growth Plan textareas → writes to ANCRID + fires student notification)
- Direct message

### Cohorts Workflow
- Browse 6 disciplines: Songwriting, Music Production, Film Scoring, Creative Business, Publishing, Artist Development
- Faculty lead + industry mentor roster + student roster
- Deep-link to any member profile

### Industry Sessions Workflow
- 12 session kinds: masterclass, writing_camp, studio_session, portfolio_review, office_hours, panel, guest_lecture, career_coaching, research, executive_conversation, artist_development, critique
- Live status indicator
- Attendee list + RSVP / Join Live
- Connect Meeting Provider link → /integrations

### Reviews Workflow
- Read: 9-category grid + narrative fields
- Write: multi-slider form
- Every published review → **permanently updates ANCRID™** + notification to student

### Opportunities Workflow
- 13 opportunity kinds (internship, employment, session_work, tour, artist_development, film_project, research_project, residency, publishing, scholarship, assistant, freelance, speaking)
- Kind filter chips
- Apply (adds to `applicant_ids`)

### Recommendations Workflow
- 12 target types (job, publishing, label, manager, studio, festival, competition, graduate_program, creative_project, industry_award, speaking, general)
- Verified attestation from a professional writes to ANCRID

### Creative Teams
- Multi-role team roster (Songwriter, Producer, Engineer, Photographer, Videographer, Creative Director, Manager, Designer, Students, Faculty, Mentors)
- ANCRSync workspace ref (`ANCRSync://...`)

### Calendar
- Aggregated events grouped by day, kind chips

### Messaging
- Direct + group + announcement threads
- Real-time send (persisted, updates thread last_message + last_at)

### Resource Library
- 10 resource kinds (template, contract, PDF, video, masterclass, course_material, slides, download, reference, exercise)

### Portfolio Uploads (NEW in v1.1)
- Drag-drop + click-to-browse
- 12 file formats: MP3, WAV, AIFF, FLAC, MP4, MOV, PDF, DOCX, PPTX, XLSX, images (JPG/PNG/WEBP/GIF/HEIC), ZIP
- 50 MB limit (architected larger)
- 6 categories × 3 visibility tiers (private / shared / public)
- Signed download endpoint (`?auth=` token param for `<audio>`/`<img>` tags)
- PATCH visibility on the fly
- Soft-delete

### Share Kits (NEW in v1.1)
- 7 kinds: **Public Portfolio, Student Profile, Booking Profile, Professional Resume, Press Kit, Institution Review, Private Review**
- Kind-specific field whitelist (permissions inherit from ANCRID™)
- Revocable + expirable (7d / 30d / 90d / 1y / never)
- View counter (audit trail)
- Public `/p/{slug}` page renders cinematic press-kit layout with **no auth required**
- Auto copy-to-clipboard on create

### AIAH (AI Leadership Intelligence)
- Real Claude Sonnet 4.5 via emergentintegrations (`anthropic`, `claude-sonnet-4-5-20250929`)
- 4 preset intents: Portfolio Gap Analysis, Career Readiness, Mentor Match, Meeting Summary
- Freeform prompt editor
- Deterministic fallback output if LLM is unavailable
- Persisted history per user (`/aiah/recent`)
- System prompt references ANCR ecosystem naturally; always emits "Suggested Action Items"

### Institution Analytics (NEW in v1.1) — 12 dashboards
1. **Mentor Engagement** (horizontal bars — reviews + recs + sessions hosted per pro)
2. **Student Engagement** (vertical bars — uploads + sessions + mentors)
3. **Creative Output** (bars — files per program)
4. **Portfolio Completion** (radial gauge — % students with ≥3 files)
5. **Industry Participation** (pie — sessions by role)
6. **Session Attendance** (dual bars — attendees + sessions per kind)
7. **Review Activity** (area chart — reviews per week, 8-week window)
8. **Career Readiness** (distribution buckets)
9. **Graduation Readiness** (by class year)
10. **Placement** (horizontal bars — recs by target org)
11. **Employer Activity** (dual bars — opportunities + applicants)
12. **Alumni Engagement** (6-month line chart)

### Interchangeable Providers Architecture (NEW in v1.1)
- **Video providers (7)**: Zoom (Server-to-Server OAuth), Google Meet, Microsoft Teams, Cisco Webex, Riverside, StreamYard, ANCR Video™ (future)
- **Calendar providers (5)**: Google Calendar, Outlook, Apple, Calendly, University Scheduling
- Registry-driven; connection status resolved by presence of required env vars
- `POST /providers/request-connection` logs a connection request routed to admin
- Session/calendar code is provider-agnostic — swap providers without touching upstream code

### Alumni Network (NEW in v1.1)
- Dedicated page + `is_alumni`, `alumni_class`, `alumni_role` on User model
- Seeded alumni: Jordan Blake (CCDP '24 → Signed with Atlantic), Priya Desai (CCDP '23 → Warner Chappell A&R Coordinator)
- Lifetime Relationship Principle prominently displayed

### Notifications
- 9 notification kinds (assignment, portfolio_review, meeting_invite, feedback, opportunity_match, session, recommendation, milestone, event)
- Unread count in top bar
- Mark-as-read endpoint

### Dashboard Overview
- Personalised hero
- Stat row (professionals, categories, countries, active mentorships)
- Upcoming sessions (with live status)
- Featured mentors carousel
- AIAH one-click insight
- Opportunities feed
- Reviews feed
- Cohorts under supervision (or student's cohort)
- How-COHEIR-works strip

---

## 7. Permission Layers

| Layer | Rule |
|---|---|
| Role-based | `require_role("faculty", "producer", ...)` FastAPI dependency for gated endpoints |
| Institution-based | `institution_id` on users → future scoped queries |
| ANCRID™ inheritance | Every Share Kit, Portfolio File, Review, Recommendation inherits its permission from the subject's ANCRID |
| Portfolio visibility | `private` / `shared` (cohort/mentors) / `public` |
| Share Kit revocability | Owner or ANCR admin can revoke; expiry enforced server-side |
| Review permissions | Only non-students can `POST /reviews`; reviews are cryptographically-adjacent to ANCRID (audit log) |
| Recommendation permissions | Only non-students; verified attestation |
| Public share access | `GET /share/public/{slug}` skips auth entirely; portfolio files also served if visibility ∈ {public, shared} |
| Audit trail | Every share view increments `views`; review + recommendation writes create Notification |

---

## 8. AI Capabilities (AIAH — Claude Sonnet 4.5)

- **Portfolio Gap Analysis** — reasoning across supervised students' ANCRLAB signals.
- **Career Readiness Snapshot** — synthesises ANCRID + INHEIRA + ANCRSync signals.
- **Mentor Match Recommendations** — matches students to professionals by discipline + trajectory.
- **Meeting Summaries + Action Items** — session note synthesis.
- **Student Growth Trends** (via freeform prompt)
- **Cohort Balancing** (via freeform prompt)
- **Follow-up Reminders** (via freeform prompt)
- **Executive Dashboard Insights** (via freeform prompt)

AIAH design principles:
- **Assists**, never replaces professional judgement.
- Every response is Markdown-structured and closes with a **Suggested Action Items** section (3–5 bullets).
- Never fabricates specific student data — reasons only from prompt inputs.
- Deterministic fallback when LLM is unavailable → demo never breaks.
- Session-scoped chat via emergentintegrations `LlmChat` (fresh session per call).

---

## 9. ANCR Ecosystem Integration Points

COHEIR™ is a **read-and-write** citizen of the ecosystem — it never duplicates.

**Reads from**
- **ANCRID™** — universal identity & verified credentials
- **ANCRA™** — assets & rights registry
- **ANCRLAB™** — creative portfolio (audio/video/artwork)
- **ANCRSync™** — live collaboration workspaces
- **INHEIRA™** — publishing metadata (splits, PROs, publishers)
- **Vaulta™** — ownership vault (authorized views only)
- **ANCRLaunch™** — venture pipeline

**Writes to**
- **ANCRID™** — Professional Reviews, Recommendations, Mentorship History, Achievements, Creative Milestones, Professional Experience, Career Readiness, Portfolio Evaluations, Industry Participation

Every UI surface references the ecosystem naturally (ecosystem strip on Profile, ANCRID passport page, Institution dashboard tiles, Public Share footer).

---

## 10. Third-Party Integrations

### Live / working
| Integration | Purpose | Credential source |
|---|---|---|
| Emergent Google Auth | SSO | Emergent-managed (no user creds) |
| Emergent LLM (Claude Sonnet 4.5) | AIAH | `EMERGENT_LLM_KEY` in `.env` |
| Emergent Object Storage | Portfolio uploads | `EMERGENT_LLM_KEY` (re-used to init) |

### Architected as pluggable placeholders (waiting on user creds)
| Integration | Requires |
|---|---|
| Zoom (Server-to-Server OAuth) | `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET` |
| Google Calendar API | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (distinct from SSO) |
| Microsoft Teams / Outlook | `MS_TENANT_ID`, `MS_CLIENT_ID`, `MS_CLIENT_SECRET` |
| Cisco Webex | `WEBEX_CLIENT_ID`, `WEBEX_CLIENT_SECRET` |
| Riverside | `RIVERSIDE_API_KEY` |
| StreamYard | `STREAMYARD_API_KEY` |
| Apple Calendar (CalDAV) | `APPLE_CALDAV_URL` |
| Calendly | `CALENDLY_API_KEY` |
| ANCR Video™ | Native — future |
| DocuSign / Adobe Sign / LinkedIn / Dropbox / Frame.io / Spotify / Apple Music / YouTube / Vimeo / ASCAP / BMI / SESAC / The MLC / SoundExchange / Songtrust / Disco | Surfaced as connection tiles in `/settings` |

Registry pattern is uniform: each provider is defined by `{id, name, description, env_vars, color, future?}`. `GET /providers/{kind}` resolves connection state by inspecting env vars. Once credentials arrive, the concrete adapter is dropped into `providers.py` — the rest of the system remains unchanged.

---

## 11. Seeded Demo Dataset

- **24 users** — 9 students (incl. flagship Danielle McMillan), 10 professionals (Grammy producer, hit songwriter, A&R director, mix engineer, entertainment attorney, publisher, manager, creative director, employer, faculty chair, faculty), 2 alumni (Jordan Blake '24, Priya Desai '23), 1 institution admin, 1 employer, 1 ANCR admin.
- **6 cohorts** — Songwriting Spring '26, Production '26, Film Scoring '26, Creative Business '26, Publishing & Sync '26, Artist Development Lab '26.
- **8 sessions** — Career Coaching (live), Vocal Comping Masterclass, A&R Insights Panel, Writing Camp Nashville Rooms, Halo Country EP Studio Session, Legal Foundations Guest Lecture, Portfolio Review, Office Hours.
- **3 professional reviews** — full 9-category scoring.
- **6 opportunities** — Interscope Showcase, Session Vocalist, Kobalt Intern, MixStar Assistant, Sony Horizon Grant, A24 Score Assistant.
- **3 recommendations** — Cam→Kobalt, Vanessa→Interscope, Renata→Field Trip.
- **2 creative teams** — Halo Country EP Team, Cohort '26 A&R Roundtable.
- **5 calendar events** — office hours, portfolio review, writing camp, studio session, panel.
- **4 threads** + **6 seed messages** (interconnected).
- **5 library resources** — split sheet, producer agreement, mixing chain pack, topline masterclass video, A&R playbook.
- **4 notifications** for the flagship student.
- **1 institution** — CCDP.

All data is **interconnected**: reviews reference actual students & professionals; opportunities have posters; recommendations name real target orgs; sessions have actual hosts & attendees; the flagship student's mentor_ids include Cam Rivers, Theron Thomas, Vanessa Jones; and the flagship EP appears in Cam's credits, in the Creative Team, in Sessions, and in Danielle's ANCRLAB quick-view.

---

## 12. Backend Capabilities Summary

- FastAPI (Python 3.11)
- Motor (async MongoDB)
- Pydantic v2 with `PyObjectId`-free UUID pattern (safer, JSON-native)
- `bcrypt` password hashing
- `httpx` async HTTP for Emergent SSO exchange
- `requests` sync HTTP for object storage (documented tech-debt item)
- Cookie + Bearer dual session
- CORS with credentials
- Startup seeding (idempotent — only if users collection is empty)
- Startup indexes: `users.user_id`, `users.email`, `user_sessions.session_token`, `share_kits.slug`
- Startup object-storage warm-init
- Lifespan-managed Mongo client cleanup

---

## 13. Frontend Capabilities Summary

- React 19 + React Router 6 + Vite-equivalent CRA hot reload
- Tailwind + shadcn/ui component library
- Framer Motion for cinematic transitions and staggered reveals
- Recharts for 12 institution dashboards
- Sonner for toasts
- Axios with `withCredentials` + Bearer interceptor + `localStorage` fallback
- 30 pages, ~2,500 LOC of app-level JSX
- Dark obsidian theme locked (no light-mode variants)
- Cabinet Grotesk / Satoshi / JetBrains Mono
- Custom SVG COHEIR interlocking-C logo + CCDP mark (crisp at any scale)
- Aurora hero backgrounds + grain texture
- Glass surfaces with 20px backdrop blur
- Uniform data-testid conventions (every interactive element)
- Emergent-standard SSO redirect flow (no hardcoded fallbacks)

---

## 14. Testing Results

| Iteration | Backend | Frontend | Notes |
|---|---|---|---|
| **Iteration 1** (v1.0 core) | **27 / 27 pass** | 100% critical flows | No blocking issues |
| **Iteration 2** (v1.1 delta — uploads, share kits, providers, analytics, alumni) | **39 / 39 pass** (27 regression + 12 new) | 100% critical flows | No critical or minor issues. One cosmetic Recharts width warning — resolved with min-height wrapper |

- Reports: `/app/test_reports/iteration_1.json`, `/app/test_reports/iteration_2.json`
- Test suites: `/app/backend/tests/backend_test.py`, `/app/backend/tests/test_v11.py`
- Test credentials: `/app/memory/test_credentials.md`

Testing agent's verbatim final verdict:
> *"COHEIR™ v1.1 fully verified. Backend: 39/39 pytest cases pass. Frontend: all new pages render with expected data-testids. Zero critical or minor issues."*

---

## 15. Deferred Features (post-1.0 backlog)

### P0 — Waiting on user credentials
- Zoom Server-to-Server OAuth adapter (needs 3 env vars)
- Google Calendar API adapter (needs 2 env vars)
- Microsoft Teams / Outlook adapter (needs 3 env vars)

### P1 — Architectural upgrades
- Replace sync `requests` in `uploads.py` with `httpx.AsyncClient` (event-loop friendly at scale)
- Real-time messaging via WebSockets (currently REST-polled)
- Websocket-driven notification badge
- Async streaming AIAH responses (SSE)

### P2 — Product depth
- Verifiable ANCRID claim export (W3C Verifiable Credentials / OpenBadges) for cross-ecosystem verification
- Employer paid tier + interview scheduling via Stripe
- Sponsored Cohort tier (label-branded cohorts)
- Multi-language localization (starting with Spanish, French, Japanese)
- Institution-scoped permissions (currently role-only)
- Cohort-scoped analytics drilldown
- Alumni "annual check-in" workflow
- ANCRSync live-workspace deep-linking (specific room joins)

### P3 — Ecosystem completeness
- INHEIRA publishing metadata write-back
- Vaulta authorized ownership views
- ANCRLaunch venture pipeline mirror
- ANCR Video™ native provider

---

## 16. Production Readiness Status

| Dimension | Status |
|---|---|
| **Core user flows** | ✅ 100% shipped |
| **Auth** | ✅ Dual (JWT + Emergent Google), architected for enterprise SSO |
| **Data model** | ✅ Stable, UUID-based, timezone-aware |
| **Permissions** | ✅ Role-based + ANCRID-inherited |
| **API contract** | ✅ 54 endpoints, all `/api`-prefixed |
| **Seeded demo** | ✅ Rich, interconnected, safe for reviewer walkthroughs |
| **Testing** | ✅ 39/39 pass, zero critical/minor bugs |
| **Design system** | ✅ Consistent with ANCRLAB / ANCRSync / INHEIRA / ANCRID |
| **Observability** | ⚠️ Logs only; no metrics endpoint (P1) |
| **Rate limiting** | ⚠️ Not enforced (P1) |
| **Backups** | ⚠️ Rely on infra layer (P1) |
| **External integrations** | 🟡 Placeholders architected; awaiting credentials |
| **Object storage** | ✅ Working via Emergent-managed backend |
| **AIAH** | ✅ Live Claude 4.5 + deterministic fallback |
| **Public share** | ✅ Live, revocable, expirable, audited |
| **Analytics** | ✅ 12 dashboards live |
| **Alumni** | ✅ Lifetime relationship principle seeded |

**Overall**: **Version 1.0 is production-ready for staging.** External-credential integrations activate the moment credentials arrive — no code refactor required.

---

## 17. CTO Implementation Notes (for Aaron)

1. **The provider registry is the single most important architectural decision.** All external video/calendar providers are defined declaratively in `providers.py`. When Zoom / Google Calendar / Teams credentials arrive, drop the concrete adapter into a `providers/adapters/` sub-package and register it — the rest of the system (Sessions, Calendar, SessionDetail UI) is provider-agnostic.

2. **AIAH is model-swappable.** `aiah.py` isolates the model string (`claude-sonnet-4-5-20250929`). Change one line to upgrade to Sonnet 5.x, Opus, or an ANCR-hosted model — the system prompt and application code are unchanged.

3. **Object storage is currently sync HTTP** (via `requests`). This is fine at demo scale but **should be migrated to `httpx.AsyncClient` before public launch** to avoid blocking the event loop under concurrent uploads. Tracked as P1 in the backlog. Estimated effort: 1 hour.

4. **Share Kits are the growth surface.** Every public `/p/{slug}` view is a potential network-acquisition moment. Recommend adding a "Verify your ANCRID™ to connect" CTA to the public share footer — this converts the sharing primitive into viral network growth.

5. **Alumni are first-class users, not archived records.** The `is_alumni` flag was chosen instead of a separate `alumni` collection so that alumni can seamlessly become mentors, employers, and industry partners without any data migration. This is the correct long-term architecture — do not split them.

6. **ANCRID™ is the single source of identity.** Every user record has `ancrid` in the format `ANCRID-XXXXXXXXXX`. When ANCRID is externalized into a standalone service, expose a `/ancrid/verify/{ancrid}` endpoint from that service and swap `share_kits.py` to call it for verification.

7. **Permissions are enforced at the endpoint layer**, not the UI layer. Every mutation endpoint (`POST /reviews`, `POST /share/kits`, `POST /aiah/generate`, `POST /uploads`, `PATCH`, `DELETE`) depends on `current_user`. UI hides some buttons role-wise but the server is the source of truth. No client-only checks anywhere.

8. **Seeding is idempotent** — the lifespan checks `users.count_documents({}) == 0` before seeding. To reset, drop the database. To re-seed different data, edit `seed_data.py` and restart.

9. **Frontend routing has one non-obvious rule**: `AuthProvider` skips `/auth/me` when `window.location.hash` includes `session_id=` so that the Emergent OAuth callback isn't intercepted. If you add another OAuth provider that also uses fragment identifiers, extend this check.

10. **Public share view uses raw `axios`** (not the shared `api` instance) so that no auth cookies are sent to the public endpoint. Keep this separation — mixing them would leak auth headers into public requests.

11. **All datetimes are ISO strings in Mongo** — never naive `datetime.utcnow()`. Always `datetime.now(timezone.utc).isoformat()`. Followed strictly throughout.

12. **The `/api` prefix is enforced by ingress.** Do not remove it. Do not add app-level routes at `/` — the ingress will not route them to the FastAPI backend.

13. **Design system is codified in `/app/design_guidelines.json`.** Any new page must consult that file before implementation. Cabinet Grotesk for headlines, Satoshi for body, JetBrains Mono for labels. Obsidian black backgrounds only. No light-mode variants.

14. **Emergent LLM key budget is a shared ecosystem resource.** AIAH is designed with a deterministic fallback specifically so demo traffic doesn't drain the budget. Consider adding a per-user rate limit before public launch (recommend 10 AIAH calls / user / day).

15. **Testing agent has full access to all data-testids.** Every interactive element and UX-critical element has a `data-testid`. Preserve this convention for every new feature — future testing agents rely on it.

---

## 18. Environment Variables

**Backend `.env`** (all required):
```
MONGO_URL=<supplied by platform>
DB_NAME=<supplied by platform>
CORS_ORIGINS=*
EMERGENT_LLM_KEY=<supplied by platform>
```

**Frontend `.env`** (already supplied):
```
REACT_APP_BACKEND_URL=<supplied by platform>
```

**Optional** (activate provider adapters when ready):
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

---

## 19. Handoff Checklist ✅

- [x] All Version 1.0 features implemented
- [x] All in-scope integrations wired or architected
- [x] 39/39 backend tests pass
- [x] 100% critical frontend flows verified
- [x] Rich seeded demo dataset (24 users, 6 cohorts, 8 sessions, etc.)
- [x] Complete API catalog documented
- [x] Complete permission model documented
- [x] Complete role model documented
- [x] Design language consistent with ANCRLAB / ANCRSync / INHEIRA / ANCRID
- [x] ANCRID™ ecosystem integration surfaces visible on every relevant page
- [x] Alumni & lifelong-network principle embedded in data model and UI
- [x] `/app/memory/test_credentials.md` up-to-date
- [x] `/app/memory/PRD.md` up-to-date
- [x] This document — `/app/memory/COHEIR_V1_BUILD_INVENTORY.md`

---

**End of document. Version 1.0 sealed and handed off.**
