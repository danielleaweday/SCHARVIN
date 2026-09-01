# CYNAIAH™ — PRD

## Original Problem Statement
Build CYNAIAH™ — School of Film, Visual Storytelling & Emerging Media. Cinematic, futuristic, premium platform inside the ANCR ecosystem for students & professional creators to develop music videos, films, animation, CGI, AI-assisted visuals, and sync-ready visual projects. Tagline: **Vision | Story | Impact**.

## Architecture
- **Backend**: FastAPI + MongoDB (motor). All routes prefixed with `/api`. JWT auth via `pyjwt` + `bcrypt`. Structured for future ANCRID SSO swap (JWT `iss=cynaiah` today → `ancrid` later).
- **Frontend**: React 19 + React Router 7, Tailwind + shadcn/ui, sonner toasts, lucide-react icons. Dark-only cinematic theme with `Outfit` + `Manrope` fonts.
- **AI Integrations** (Emergent Universal LLM Key, swappable):
  - Text scripts → **Claude Sonnet 4.5** (`claude-sonnet-4-5-20250929`) via `emergentintegrations`
  - Text-to-image → **Gemini Nano Banana** (`gemini-3.1-flash-image-preview`)
- **Assets**: Official CYNAIAH + ANCR logos stored at `/app/frontend/public/brand/`. AI images at `/app/backend/generated_images/`, served via `/api/generated/{filename}`.
- **Seed**: Idempotent demo data (Aria Okafor student + faculty + 6 projects + 6 courses + music/cues/rights/portfolio) auto-runs on backend startup and on every login.

## Users / Personas
1. **Student Creator** (primary, seeded as Aria Okafor)
2. **Faculty Member** (seeded as Prof. Idris Bello)
3. **Mentor / Industry Professional**
4. **Project Collaborator**
5. **Institutional Admin**
6. **Platform Admin**

## Core Requirements (Static)
- Cinematic dark theme, brand-honest logo usage
- Role-based auth, temporary until ANCRID SSO
- Real AI (script + image) with clearly labeled integration-ready panels for the rest
- Rights, ethics, and AI disclosure baked into every project
- Structured pathways to ANCR ecosystem apps (ANCRLAB, INHEIRA, ANCRVIEW, etc.)

## Implemented (through 2026-02-16)
- ✅ Auth · Home dashboard · Create wizard · Projects · Project Command Center
- ✅ Story Lab (Documents · Storyboard · Treatment · Characters)
- ✅ AI Visual Lab (Gemini Nano Banana + provider-native character consistency)
- ✅ Sync Studio (waveform · cue thumbnails · storyboard-from-music · attach dialog · Sync Autopilot · Rough Cut Preview · **audio upload**)
- ✅ **Production Studio** (fully functional): tabs for Overview · Cast & Crew · Scenes & Shots · Locations · Equipment · Call Sheets · Budget · Daily Notes · Releases with inline editors, status dropdowns per shot, and live budget progress
- ✅ **Coverage Coach (advisory-only)** — Claude Sonnet 4.5 reviews scenes + shots and returns `possibly_missing`, `questions_for_student`, `compliments` per scene. Advisory pill and copy `the director makes the final call.` UI at top of Scenes tab. Route ordered above `/{kind}` handler with regression guard.
- ✅ **Call Sheet PDF export** — one-page A4 PDF (via `reportlab`) with project header, crew (with call times), scenes, top-10 shots, locations, weather, notes. Per-row `PDF` button on Call Sheets tab.
- ✅ **Faculty / Reviews layer** — role-gated `/faculty` dashboard, deep-dive review workspace, and student `/reviews` inbox. Explicit `assignments` collection links Prof. Idris Bello → all 6 of Aria's projects. **Append-only, immutable event log**: every written note, time-coded note (Rough Cut only), coverage response, rubric score, and milestone status change is a new row that can never be silently overwritten. Superseded rubrics point at their replacement via `superseded_by` and stay visible with a strike-through. Fixed MVP rubric — Story · Direction · Cinematography · Sound & Music · AI Ethics & Rights · Craft — scored 1–5. Milestone statuses: open · revision_requested · approved · final (locked). COHEIR mentor review shown as structural placeholder — the log is ready for it.
- ✅ **Authorization hardening pass** — 2026-02-16 — `_assert_project_owner(project_id, user_id)` single-source choke-point applied to every nested-read and mutation across scripts, sync studio (music/cues), rights, feedback, characters, storyboard-frames, and AI save-as-asset paths. Cross-owner attempts now return **404** (never leak project existence). All 40 pytest AuthZ tests pass. Ownership check pattern: read the target document, extract its `project_id`, then assert the caller owns that project — for DELETE/PATCH of nested items like `/cues/{id}` and `/rights/{id}` this catches ID-guessing attacks.
- ✅ **Auth-layer hardening pass** — 2026-02-18 — closed the three remaining auth-layer holes flagged pre-launch: (1) role escalation via `POST /api/auth/register` — public callers may only self-assign `student` or `collaborator`; every elevated role requires a bearer token belonging to `institutional_admin` or `platform_admin`. (2) `POST /api/seed` is now platform_admin-gated (401 anon → 403 non-admin → 200 admin). (3) `POST /api/auth/login` now has MongoDB-persisted brute-force protection: 8 failed attempts per `{ip}:{email}` in 5 min triggers a clear 429; per-identifier isolation prevents victim-lockout from other IPs; a successful login clears the counter. Password strength floor (≥8 chars, at least one letter AND one digit) returned as a clean 400 with a plain-string detail so the frontend's existing error handler surfaces it as-is. No user enumeration — wrong password on valid email and wrong email both return the identical 'Invalid credentials'. Verified 118/118 backend tests (28 new + 90 regression across iterations 4/5/6/7).
- ✅ **Admin bootstrap hardening (production-safe)** — 2026-02-19 — `_ensure_admin_user` now respects `CYNAIAH_ENV`. In `demo` (default) it seeds `admin@cynaiah.demo / Cynaiah2026!` and emits a loud WARN in the backend log so operators can never miss it. In `production` it never seeds the demo admin; instead it reads `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` from env and refuses to bootstrap if the password matches the demo default (ERROR log). Public `GET /api/environment` returns `{env, is_demo, demo_admin_active, admin_bootstrap_via_env}` — no secrets leaked — so any consumer or future UI can clearly label demo instances. Idempotent, drift-free. Verified 11/11 new tests + 118/118 regression = 129/129 total pytest cases green.
- ✅ **Storyboard Frame Feedback** — 2026-02-20 — faculty can pin an immutable note to a specific storyboard frame from `/faculty/projects/:id` → Storyboard tab. Per-frame composer with data-testids `faculty-frame-note-btn-<id>` / `faculty-frame-note-input-<id>` / `faculty-frame-note-submit-<id>`. Backend enforces `kind='frame_feedback'`, `target_type='storyboard_frame'`, frame must exist on the target project (cross-project id smuggling blocked with 404). Every post spawns a review notification for the student with a new deep_link pattern `/story-lab?project=<pid>&frame=<fid>` (registered as `storyboard.frame` in the ANCR link registry, bringing the total to 6). Clicking it takes the student to Story Lab with the correct project auto-selected, Storyboard tab active, target frame highlighted with a cyan ring + `N notes` gold badge, and a `Faculty notes on this frame` panel in the right rail. Full immutable-history semantics: supersedes chain preserves old rows and marks them with `superseded_by`; nothing is mutated or deleted. Only assigned faculty may post; only the project owner or the assigned faculty may read. Verified 12/12 new tests + 192/192 total backend + 100% frontend Playwright.
- ✅ **Media endpoint auth hardening** — new 2026-02-21 — `GET /api/finish/video/<f>`, `GET /api/generated/<f>`, `GET /api/music-audio/<f>` now all require authentication (401 without a token) and enforce project-ownership scoping (project owner OR assigned faculty; strangers get 404, never a 200 + body leak). New helper `_authenticate_media(request)` accepts either an `Authorization: Bearer` header OR a `?token=<jwt>` query param — needed because HTML5 `<img>/<audio>/<video>` cannot attach headers. `_media_project_check(user_id, project_id)` centralises the owner-or-assigned-faculty rule. Testing agent caught + fixed TWO one-line field-name typos in the initial ownership queries (`assets.file_path` → `assets.url`, `music_tracks.audio_url` → `music_tracks.music_url`) that would have silently defeated the check — now regression-guarded by 28 new tests in `test_media_authz.py`. Path-traversal guards intact. Verified 220/220 backend pytest cases pass.
- ✅ **Edit & Finish workspace (full wiring)** — new 2026-02-22 — the final major CYNAIAH-native workspace is now live at `/edit-finish`. Five tabs: **Versions** (rough_cut → fine_cut → picture_lock → final timeline, per-version video upload with MP4/MOV/WebM & 250 MB cap, faculty approval status pills, inline `<video>` player), **Captions & A11y** (SRT/VTT log + 7-item accessibility checklist), **Credits** (opening + closing sections with role/name/notes), **Finishing Notes** (color/sound/vfx/general buckets with resolve toggle), **Delivery** (8-item checklist + live final-approval gate). Backend enforces the **rights-clearance + accessibility + delivery gate** on any final-stage version — blocked with the specific list of blockers until every rights record has `consent_recorded=true` AND both checklists are fully green; every approval is mirrored into the append-only faculty review log. Frontend `resolveAssetUrl` now automatically appends `?token=<jwt>` for every `/api/generated/`, `/api/music-audio/`, `/api/finish/video/` URL so HTML5 `<img>/<audio>/<video>` all authenticate transparently. Verified 222/222 backend pytest + 100% frontend Playwright, zero critical or minor issues.
- ✅ **Cyna — the in-app AI mentor** — new 2026-02-23 — warm, mature female mentor voice powered by Claude Sonnet 4.5 via the Emergent LLM key. Available two ways: a **floating gold-glow bubble** on every authenticated page (bottom-right, opens a slide-in panel) AND a dedicated `/cyna` workspace with a conversations rail + persisted per-user sessions. **Project-aware** — every reply includes a compact digest of the selected project (treatment, characters, scenes/shots, rights counts) so Cyna cites the student's actual work rather than inventing. **Advisory + propose-then-approve** — general Q&A returns text only; when the student explicitly asks Cyna to draft/add, Cyna emits a `proposed_actions` JSON block that the frontend renders as gold-bordered `Approve` cards; nothing runs until the student confirms via `POST /api/cyna/actions/execute` (whitelisted kinds: `draft_script`, `add_finishing_note`, `add_shot`). **Persistence** — `db.cyna_sessions` + `db.cyna_messages` per-user, session title auto-inferred from the first user turn, cross-owner isolation enforced (a second student never sees Aria's sessions). Verified 17/17 new tests + 239/239 total backend + 100% frontend Playwright.
- ✅ **Review Notifications** — 2026-02-17 — every faculty review event (written, time_coded, coverage_response, rubric, status) spawns a bell notification for the project owner with per-kind human copy, `author_name`, `project_title`, and a `deep_link` in the form `/reviews?project=<pid>&review=<rid>`. Fire-and-log side-effect — if the notification insert fails, the immutable review still lands (log stays source of truth). TopBar polls every 15s + on window focus. Clicking a notification marks it read, navigates to the deep link, and highlights + scrolls the exact review row with a cyan ring. `Mark all read` bulk-clears unread. Home dashboard KPI stays in sync via a `cynaiah:notifications-changed` event. **Immutable-history guarantee verified**: no field of any existing review is mutated by the notification path; supersedes still only marks the old row.
- ✅ **ANCR-integration-ready notifications** — 2026-02-17 — every review notification now carries a full canonical envelope (`event_type`, `actor` with `ancrid: null`, `recipient`, `subject`, `payload`, `channels`, `ancr_ready`, `ancr_emitted_at`) inside the same doc the bell popover reads. New adapter module `ancr_notifications.py` with `LocalBellSink` + `AncrBusSink` + `Dispatcher`. `ANCR_NOTIFICATIONS_ENABLED` env flag currently `false` → ancr_bus channel status = `not_configured`. Public link registry at `GET /api/notifications/link-registry`; `POST /api/notifications/resolve-link` verifies any deep_link; `GET /api/notifications/{id}/envelope` returns the full outbound-ready payload. Popover shows a subtle gold `ANCR-ready` badge. Refuses to emit an unregistered deep_link. Verified 28/28 envelope tests + full regression.
- ✅ **Character Continuity Diff** (Claude Sonnet 4.5 vision): compare two references and produce a report of possible drift by category (face/hair/skin_tone/wardrobe/age/proportions/visual_style) with severity + questions for the student. Student always makes the final call.
- ✅ **Real Song Playback**: per-project audio upload endpoint stores files in `/app/backend/uploaded_audio/` served at `/api/music-audio/{filename}`. Rough Cut player picks up the audio automatically. ANCRLAB integration is prepared but NOT falsely labeled as live.
- ✅ Rights & Credits · Learn · Portfolio · Showcase
- ✅ Rich seed: 6 projects · 2 users · 6 mentor assignments · 5 immutable review events on Neon Heart · 2 character profiles · 11 storyboard frames · 9 sync cues (7 with visuals) · 4 scripts · 18 mood-board assets · 9 rights records · 6 courses · 5 feedback · 7 notifications · 7 events · 7 crew · 3 locations · 4 equipment · 3 scenes · 6 shots · 2 call sheets · 6 budget lines · 2 daily notes · 3 releases
- ✅ Backend endpoints for characters CRUD · continuity-diff · autopilot · storyboard frames · music upsert/upload · production overview + generic CRUD across 9 production collections · coverage-coach · callsheet PDF · faculty dashboard · faculty project view · append-only reviews · student reviews-summary · rubric competencies

## Prioritized Backlog

### P0 (blockers before public launch)
- ANCRID SSO integration (replace temporary JWT); map `sub` to ANCRID identity
- ~~Add ownership checks on nested project resources~~ ✅ Closed 2026-02-16 (40/40 tests)

### P1 (next iteration)
- **COHEIR mentor integration** — swap the placeholder card for real external-mentor review calls once the spec ships (log is already immutable)
- **Continuity Diff "Check Sequence" button** on Storyboard/Production UI (endpoint live; keep student-controlled, never auto-run)
- Real Edit & Finish (timeline + review links + version history)
- Assets library with tag/filter/search across projects
- Messages & Collaborators (invite flow, threaded per-project comms)
- Real Calendar view (month grid + ICS export)
- Faculty/mentor Reviews with time-coded notes
- INHEIRA rights-review export (bundle all rights + AI disclosures)
- ANCRLAB music picker (real music-track import)

### P2 (nice-to-have)
- Live collab (ANCRSync-style shared workspace)
- Storyboard drag-and-drop with AI panel-to-panel consistency
- Additional AI providers: text-to-video, character-consistency LoRAs, upscaling
- Institutional admin dashboard (cohorts, competencies, grading rubrics)
- Video showcase publishing to ANCRVIEW
- Analytics on portfolio reach / opportunity conversion

## Test Credentials
Stored in `/app/memory/test_credentials.md`.
