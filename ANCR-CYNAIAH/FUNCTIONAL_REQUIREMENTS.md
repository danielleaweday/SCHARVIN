# CYNAIAH — Functional Requirements

**App folder:** `ANCR-CYNAIAH`
**APPNAME:** `CYNAIAH`
**Derived from:** `backend/{server,auth,models,ai_service,cyna_service,ancr_notifications,callsheet_pdf,seed_data}.py` (4,877 lines, 87 routes), `frontend/src/**`
**Stack observed:** FastAPI + Motor/MongoDB; bcrypt + JWT (HS256) bearer; Claude + Gemini via Emergent key; local filesystem media; React + React Router + axios
**Date of extraction:** 2026-09-03

> **Note on this application.** CYNAIAH is materially more hardened than the other twelve apps in this workspace: ownership guards on every nested resource, registration role-escalation blocking, password strength rules, persisted brute-force protection, an admin-gated seed endpoint, an environment-posture endpoint, and 222 backend tests with a recorded all-green run. Its specification is also unusually accurate about what is and is not built, including flagging its own media-token weakness as a P0. Findings below are correspondingly fewer and narrower than elsewhere.

---

## 1. FUNCTIONAL REQUIREMENTS

### 1.1 Platform & environment posture

**REQ-CYNAIAH-001**
**Given** `GET /api/` or `GET /api/health`
**When** called
**Then** they return `{"service": "CYNAIAH", "tagline": "Vision | Story | Impact", "version": "0.1.0"}` and `{"status": "ok"}`, both unauthenticated.

**REQ-CYNAIAH-002**
**Given** `GET /api/environment`
**When** called unauthenticated
**Then** it returns only non-secret posture flags: `env` (from `CYNAIAH_ENV`, default `demo`), `is_demo`, `demo_admin_active` (true only when not production **and** the derived demo-admin account exists) and `admin_bootstrap_via_env` (true only when `ADMIN_PASSWORD` is set **and** env is production). No credential or secret is exposed.

**REQ-CYNAIAH-003**
**Given** `POST /api/seed`
**When** the caller's role is not `platform_admin`
**Then** it raises **403 `"platform_admin required to reseed"`**; an anonymous caller is rejected earlier with **401** by the token dependency. An authorised call runs the idempotent `ensure_seed(db)`.

**REQ-CYNAIAH-004**
**Given** `POST /api/auth/login`
**When** it begins
**Then** `ensure_seed(db)` runs inline so the demo dataset always exists, independently of the protected seed endpoint.

**REQ-CYNAIAH-005**
**Given** any document returned to a client
**When** it is serialised
**Then** `_id` is stripped and `password_hash` is projected out at every user query site.

### 1.2 Authentication

**REQ-CYNAIAH-006**
**Given** `POST /api/auth/register`
**When** the requested `role` is outside `{student, faculty, mentor, collaborator, institutional_admin, platform_admin}`
**Then** it raises **400 `"Invalid role"`**.

**REQ-CYNAIAH-007**
**Given** a registration for a role outside `{student, collaborator}`
**When** no bearer token accompanies the request
**Then** it raises **403 `"Elevated roles require an admin session"`**; with an invalid token, **401 `"Invalid token"`**; with a valid token whose role is not `institutional_admin` or `platform_admin`, **403 `"Only admins can create elevated accounts"`**.

**REQ-CYNAIAH-008**
**Given** a password
**When** `_validate_password_strength` runs
**Then** it must be at least **8 characters** (**400 `"Password must be at least 8 characters"`**), contain at least one letter (**400 `"Password must contain at least one letter"`**) and at least one digit (**400 `"Password must contain at least one number"`**).

**REQ-CYNAIAH-009**
**Given** a duplicate email
**When** registration proceeds past validation
**Then** it raises **400 `"Email already registered"`**. Emails are lower-cased on both write and read.

**REQ-CYNAIAH-010**
**Given** `POST /api/auth/login`
**When** it runs
**Then** `_ensure_can_pre_login` is consulted **before the password check**, so a locked identifier receives **429** without revealing whether the email exists.

**REQ-CYNAIAH-011**
**Given** the brute-force counter
**When** a login is attempted
**Then** the key is `{first x-forwarded-for hop or client host}:{lower-cased email}`; failures increment a persisted `login_attempts` document; **8 attempts** within a **300-second** window trigger **429 `"Too many failed attempts. Try again in a few minutes."`**; a failure older than the window resets the counter; and a successful login **deletes** the record.

**REQ-CYNAIAH-012**
**Given** invalid credentials
**When** the response is built
**Then** an unknown email and a wrong password both return **401 `"Invalid credentials"`** — no user enumeration.

**REQ-CYNAIAH-013**
**Given** a successful authentication
**When** the token is minted
**Then** the JWT carries `sub`, `email`, `role`, `iss: "cynaiah"`, `iat` and `exp` at **14 days** (`JWT_EXPIRES_HOURS = 24 * 14`). A code comment records that `iss` becomes `"ancrid"` when SSO is swapped in.

**REQ-CYNAIAH-014**
**Given** a protected endpoint
**When** `get_current_user_id` runs
**Then** a missing credential raises **401 `"Missing bearer token"`**, a JWT error **401 `"Invalid token: {exception}"`** — **echoing the underlying PyJWT message to the client** — and a token without `sub` **401 `"Malformed token"`**.

**REQ-CYNAIAH-015**
**Given** `require_faculty`
**When** it evaluates
**Then** it permits roles `{"faculty", "admin", "mentor"}`. **`"admin"` is not a member of `VALID_ROLES`** — the registered admin roles are `institutional_admin` and `platform_admin` — so **neither administrator role passes this gate**, and no account can hold the `"admin"` role it names.

**REQ-CYNAIAH-016**
**Given** the authentication design
**When** the application is inspected
**Then** there is **no logout, refresh, password-change or password-reset endpoint**, and no server-side revocation — a 14-day token remains valid for its full life.

### 1.3 Ownership and access control

**REQ-CYNAIAH-017**
**Given** any project-scoped read or write
**When** the query is built
**Then** it is constrained by `{"id": project_id, "owner_id": user_id}` — a pattern applied consistently across projects, scripts, assets, characters, storyboard frames, cues, rights, music, production records and finish records. Changing an id in the URL yields 404 rather than another student's data.

**REQ-CYNAIAH-018**
**Given** `_assert_project_owner`
**When** the project does not exist **or** is not owned by the caller
**Then** the same error is returned for both cases, so project existence is not disclosed.

**REQ-CYNAIAH-019**
**Given** a nested resource such as a character, cue or storyboard frame
**When** it is created against a `project_id`
**Then** the parent project is verified as owned by the caller first, and referenced child ids (for example `character_ids` on a frame) are re-queried with `owner_id` before use — **an id alone is never sufficient authorisation**.

**REQ-CYNAIAH-020**
**Given** `_media_project_check`
**When** it evaluates access to a project's media
**Then** it permits the project owner, **or** a user with a matching `assignments` row (`project_id` + `faculty_id`), and otherwise raises **404** rather than 403 so the file's existence is not leaked.

**REQ-CYNAIAH-021**
**Given** `require_faculty`-gated routes
**When** a student calls one
**Then** it raises **403 `"Faculty role required"`**.

### 1.4 Media serving

**REQ-CYNAIAH-022**
**Given** `GET /api/generated/{filename}` or `/api/music-audio/{filename}`
**When** the filename contains anything other than alphanumerics, `_`, `-` or `.`
**Then** it raises **400 `"Invalid filename"`**, blocking path traversal.

**REQ-CYNAIAH-023**
**Given** `GET /api/finish/video/{filename}`
**When** the filename contains `/` or `..`
**Then** it raises **400 `"Invalid filename"`**. This check is narrower than the alphanumeric filter used by the other two media routes.

**REQ-CYNAIAH-024**
**Given** any media request
**When** `_authenticate_media` runs
**Then** it accepts a bearer header **or a `?token=<jwt>` query parameter**, because HTML5 `<img>`, `<audio>` and `<video>` cannot set headers. The token is the caller's ordinary 14-day JWT — nothing new is minted — so **a full-lifetime session credential is placed into URLs, browser history, server logs and referrer headers**. The specification records this as a P0 remediation item.

**REQ-CYNAIAH-025**
**Given** a generated image request
**When** ownership is resolved
**Then** the filename is matched against `assets.url` and then `storyboard_frames.image_url` to find a linked project, and `_media_project_check` is applied. **A file with no matching database record is served to any authenticated user** — documented in-code as covering "one-off AI test renders" that "aren't tied to a project".

**REQ-CYNAIAH-026**
**Given** a music-audio request
**When** ownership is resolved
**Then** the same pattern applies via `music_tracks.music_url`; a track row without a `project_id` likewise bypasses the project check.

**REQ-CYNAIAH-027**
**Given** a finish-video request
**When** ownership is resolved
**Then** the version id is parsed from the filename stem, the `edit_versions` row is required (**404** otherwise), and `_media_project_check` is applied — the strictest of the three media paths, with no unlinked-file fallback.

### 1.5 Projects, scripts and assets

**REQ-CYNAIAH-028**
**Given** `GET /api/projects`
**When** called
**Then** only the caller's own projects are returned; `POST /api/projects` stamps `owner_id` and `owner_name` from the authenticated user, so ownership cannot be forged through the payload.

**REQ-CYNAIAH-029**
**Given** `PATCH` or `DELETE /api/projects/{id}`
**When** called
**Then** the operation is scoped to the caller's ownership and a non-match yields 404.

**REQ-CYNAIAH-030**
**Given** `PATCH /api/scripts/{id}`
**When** it succeeds
**Then** the document's `version` is `$inc`ed by 1 alongside the update — script revisions are counted.

**REQ-CYNAIAH-031**
**Given** the project model
**When** a project is created through the Create wizard
**Then** it may be one of twelve types (music video, lyric video, visualizer, short film, documentary, commercial, branded content, animation, CGI scene, social campaign, live visuals, custom).

### 1.6 Story Lab, characters and storyboard

**REQ-CYNAIAH-032**
**Given** `POST /api/ai/script`
**When** called
**Then** Claude drafts screenplay, treatment, logline, shot-list or storyboard-beat content, and the result is stored against the caller as owner.

**REQ-CYNAIAH-033**
**Given** `POST /api/characters`
**When** a character is created
**Then** it records age, hair, skin tone, eye colour, wardrobe, visual style and locked details, scoped to the caller.

**REQ-CYNAIAH-034**
**Given** `POST /api/characters/{id}/generate-reference`
**When** called
**Then** the character is loaded with an ownership constraint and a reference image is generated, using Gemini provider-native reference conditioning via `ImageContent`. The specification is explicit that this is **not** a trained LoRA.

**REQ-CYNAIAH-035**
**Given** `POST /api/characters/{id}/continuity-diff`
**When** called
**Then** Claude vision compares two frames across face, hair, skin tone, wardrobe, age, proportions and visual style, returning possible drift and questions. **It is advisory — no frame is altered and the student decides.**

**REQ-CYNAIAH-036**
**Given** `POST /api/storyboard-frames/{id}/reorder`
**When** called
**Then** the frame is loaded with an ownership constraint and sibling frames are re-queried scoped to the same owner and project before reordering.

### 1.7 Sync Studio and music

**REQ-CYNAIAH-037**
**Given** `POST /api/projects/{id}/music/upload`
**When** called
**Then** the project ownership is checked and the audio file is written to the backend's local `uploaded_audio` directory. Accepted formats per the specification are MP3, WAV, M4A, OGG and FLAC.

**REQ-CYNAIAH-038**
**Given** `POST /api/projects/{id}/autopilot/suggest-cues`
**When** called
**Then** Claude returns musical section suggestions. **Suggestions remain pending until the student accepts them individually or as a group** — they are never applied automatically.

**REQ-CYNAIAH-039**
**Given** the Sync Studio
**When** the student exports a rough cut
**Then** a `cynaiah.rough-cut.v1` JSON manifest is produced. **MP4 rendering is not implemented** and is listed as deferred.

### 1.8 Production Studio

**REQ-CYNAIAH-040**
**Given** `POST /api/projects/{id}/production/{kind}`
**When** called
**Then** `kind` is resolved against the nine-entry `PROD_COLLS` map (`crew`, `location`, `equipment`, `scene`, `shot`, `callsheet`, `budget`, `note`, `release`), the project ownership is verified, and the record is stamped with `owner_id`.

**REQ-CYNAIAH-041**
**Given** `PATCH` or `DELETE /api/production/{kind}/{item_id}`
**When** called
**Then** the operation is scoped to the caller's ownership of the record.

**REQ-CYNAIAH-042**
**Given** `POST /api/projects/{id}/production/coverage-coach`
**When** called
**Then** Claude returns possibly-missing coverage, questions and compliments. **It is advisory; the director makes the final call.**

**REQ-CYNAIAH-043**
**Given** `GET /api/production/callsheet/{id}/pdf`
**When** called
**Then** a one-page A4 PDF is rendered containing the project header, crew and call times, scenes, top shots, locations, weather and notes.

### 1.9 Faculty reviews

**REQ-CYNAIAH-044**
**Given** `POST /api/faculty/projects/{id}/reviews`
**When** called
**Then** the route is faculty-gated and the reviewer must hold an `assignments` row linking them to the project.

**REQ-CYNAIAH-045**
**Given** a review is written
**When** it is stored
**Then** it is an **append-only event**. A correction creates a new row and links the prior one through `superseded_by`; **the original content and creation time are never overwritten**, and superseded entries remain visible.

**REQ-CYNAIAH-046**
**Given** the review model
**When** a review is created
**Then** it is one of five kinds: `written`, `time_coded`, `coverage_response`, `rubric`, `status` (milestone).

**REQ-CYNAIAH-047**
**Given** `GET /api/rubric/competencies`
**When** called
**Then** it returns the fixed six-competency rubric — Story, Direction, Cinematography, Sound & Music, AI Ethics & Rights, Craft — each scored 1–5.

**REQ-CYNAIAH-048**
**Given** a storyboard frame feedback review
**When** it is submitted
**Then** the backend **forces `frame_feedback` to target `storyboard_frame`** and **rejects a frame belonging to another project**. Only the project owner and assigned faculty may read; only assigned faculty may post.

**REQ-CYNAIAH-049**
**Given** `GET /api/projects/{id}/reviews` or `/api/student/reviews-summary`
**When** called by a student
**Then** only reviews for projects they own are returned.

### 1.10 Notifications and the ANCR envelope

**REQ-CYNAIAH-050**
**Given** a review event
**When** a notification is dispatched
**Then** it is authored in a canonical envelope — `event_type`, `actor`, `recipient`, `subject`, `payload`, `deep_link`, `channels` (`in_app` delivered, `ancr_bus` pending), `ancr_ready`, `ancr_emitted_at`, `created_at` — designed for a future ANCR bus.

**REQ-CYNAIAH-051**
**Given** `ANCR_NOTIFICATIONS_ENABLED`
**When** it is not `"true"` (the default)
**Then** only the in-app channel is delivered; the `ancr_bus` channel remains `pending` and **no external bus is contacted**. No sink implementation is registered.

**REQ-CYNAIAH-052**
**Given** notification dispatch fails
**When** the exception propagates
**Then** the caller wraps it so **the immutable review insert is never blocked** — notifications are fire-and-log.

**REQ-CYNAIAH-053**
**Given** `GET /api/notifications/link-registry`
**When** called
**Then** the canonical set of deep-link patterns is returned, each with a `path_pattern` and `required_query` list; `POST /api/notifications/resolve-link` validates a link against that registry so every emitted link maps to a real route.

**REQ-CYNAIAH-054**
**Given** `POST /api/notifications/{id}/read` or `/read-all`
**When** called
**Then** the update is scoped to the caller — cross-owner mark-read attempts change nothing.

**REQ-CYNAIAH-055**
**Given** the frontend TopBar
**When** it is mounted
**Then** it polls every 15 seconds and on window focus, showing an unread count and navigating to the exact review, frame or timestamp on click.

### 1.11 Rights, Edit & Finish, and the delivery gate

**REQ-CYNAIAH-056**
**Given** `POST /api/rights`
**When** a rights record is created
**Then** it captures the contributor, ownership tag, consent status and AI disclosure, scoped to the caller's project.

**REQ-CYNAIAH-057**
**Given** `POST /api/finish/version/{id}/upload`
**When** a version video is uploaded
**Then** MP4, MOV and WebM are accepted up to 250 MB, written to the local upload root, and served back only through the authenticated `/api/finish/video/{filename}` route.

**REQ-CYNAIAH-058**
**Given** the version model
**When** a version is staged
**Then** it moves through `rough_cut → fine_cut → picture_lock → final`.

**REQ-CYNAIAH-059**
**Given** `_final_gate_report`
**When** it evaluates a project
**Then** approval is blocked unless: at least one rights record exists **and every one has `consent_recorded: true`**; **all** accessibility checklist items are done; and **all** delivery checklist items are done. Each failure produces a specific human-readable blocker string.

**REQ-CYNAIAH-060**
**Given** `POST /api/finish/version/{id}/approve` for a `final` version
**When** the gate reports blockers
**Then** approval is refused. This is the strongest domain-integrity control in the workspace: **a deliverable cannot be signed off while consent or accessibility is incomplete.**

**REQ-CYNAIAH-061**
**Given** a faculty approval
**When** it is recorded
**Then** it is **mirrored into the immutable review history**, so the approval decision is part of the append-only evidence trail.

### 1.12 Learn, portfolio and CYNA assistant

**REQ-CYNAIAH-062**
**Given** `GET /api/courses` and `POST /api/enrollments`
**When** called
**Then** six seeded pathways (Foundations, Directing, Emerging Media, Production, Post, Rights) are listed and the caller can enrol; enrolment progress is scoped to the caller.

**REQ-CYNAIAH-063**
**Given** `POST /api/portfolio` and `PATCH /api/portfolio/{id}`
**When** called
**Then** portfolio items are created and feature-toggled scoped to the caller.

**REQ-CYNAIAH-064**
**Given** the Showcase surface
**When** the student uses the ANCRVIEW handoff
**Then** **the CTA is present but publishing is not implemented** — no external call is made.

**REQ-CYNAIAH-065**
**Given** `POST /api/cyna/sessions/{id}/chat`
**When** called
**Then** the CYNA assistant responds within a session scoped to the caller; sessions can be listed, created and deleted.

**REQ-CYNAIAH-066**
**Given** `POST /api/cyna/actions/execute`
**When** called
**Then** an assistant-proposed action is executed against the caller's own data, subject to the same ownership constraints as the direct endpoints.

---

## 2. TEST COVERAGE

**Test assets found** — 12 suites totalling **200 test functions**, plus **20 recorded pytest XML reports** spanning iterations 2 through 15.

| Suite | Tests |
|---|---|
| `test_security_authz.py` | 26 (40 with parametrisation) |
| `test_cynaiah_backend.py` | 26 (33 in run) |
| `test_media_authz.py` | 22 (28 in run) |
| `test_ancr_envelope.py` | 20 (28 in run) |
| `test_security_auth.py` | 20 (28 in run, classed) |
| `test_review_notifications.py` | 18 (22 in run) |
| `test_cyna.py` | 17 |
| `test_faculty_reviews.py` | 13 |
| `test_admin_bootstrap.py` | 11 (classed) |
| `test_frame_feedback.py` | 10 (12 in run) |
| `test_production_studio.py` | 5 |
| `test_edit_finish_iteration14.py` | 2 |

**Recorded run history** (`test_reports/pytest/*.xml`) — the most complete evidence trail in the workspace:

| Report | Tests | Failures | Timestamp |
|---|---|---|---|
| `iteration_2.xml` | 5 | 0 | 2026-07-31 02:29 |
| `pytest_results.xml` | 33 | 0 | 2026-07-31 00:51 |
| `security_authz.xml` | 40 | 0 | 2026-07-31 18:31 |
| `review_notifications.xml` | 22 | 0 | 2026-07-31 18:46 |
| `iter3_faculty.xml` | 13 | 0 | 2026-07-31 18:00 |
| `ancr_envelope.xml` | 28 | **1** | 2026-07-31 18:58 |
| `iter6_full.xml` | 90 | **1** | 2026-07-31 18:59 |
| `iter7_regression.xml` | 90 | 0 | 2026-07-31 19:15 |
| `iter8_regression.xml` | 90 | 0 | 2026-07-31 19:18 |
| `iter9_regression.xml` | 118 | 0 | 2026-07-31 19:29 |
| `iter10_all.xml` | 192 | **7** | 2026-07-31 19:43 |
| `iteration_10_1.xml` | 192 | **4** | 2026-07-31 19:51 |
| `iteration_10_1_final.xml` | 192 | **3** | 2026-07-31 19:54 |
| `pytest_results_iter12.xml` | 192 | 0 | 2026-07-31 19:58 |
| `iteration_13.xml` | 220 | **3** | 2026-07-31 20:18 |
| **`iteration_14.xml`** | **222** | **0** | **2026-07-31 20:34** |
| **`iteration_15_cyna.xml`** | **17** | **0** | **2026-08-01 00:19** |

**The latest full run is green: 222 tests, 0 failures, 0 errors.** Earlier failures were transient and resolved within the same session — the pattern shows failures appearing, being fixed, and a clean regression following. The specification's claim of "222/222 backend tests" is **supported by the artefact**, which is not true of the equivalent claims in ANCRD or ANCRSHOP.

| Requirement area | Covered | Evidence / gap |
|---|---|---|
| REQ-CYNAIAH-001, 002 | **Yes** | `TestEnvironmentEndpoint` (3 tests) asserts the posture flags |
| REQ-CYNAIAH-003 | **Yes** | `TestSeedGuard` (3 tests) asserts anonymous 401, non-admin 403, admin 200 |
| REQ-CYNAIAH-004 | **Partial** | Implicit in every login-based fixture; not asserted directly |
| REQ-CYNAIAH-005 | **Partial** | No response has ever leaked a hash in a passing run, but it is not asserted as a property |
| REQ-CYNAIAH-006, 007 | **Yes** | `TestRoleEscalation` (8 tests) and `TestElevatedRegistrationRegression` (2) |
| REQ-CYNAIAH-008 | **Yes** | `TestPasswordStrength` (4 tests) |
| REQ-CYNAIAH-009 | **Yes** | Covered in `test_cynaiah_backend` registration cases |
| REQ-CYNAIAH-010 – 012 | **Yes** | `TestBruteForceLockout` (3 tests) and `TestAuthRegression` (8). Note `iteration_13.xml` recorded a lockout flake (`assert 401 == 429`) that is green in `iteration_14` |
| REQ-CYNAIAH-013 | **Partial** | Tokens are exercised everywhere; the 14-day TTL and `iss` claim are not asserted |
| REQ-CYNAIAH-014 | **Partial** | The 401 paths are covered; **that the PyJWT exception text is echoed to the client is not challenged** |
| REQ-CYNAIAH-015 | **No** | **The `require_faculty` role-set mismatch is untested.** No test attempts a faculty-gated route as `institutional_admin` or `platform_admin`, which is why the dead `"admin"` value survives |
| REQ-CYNAIAH-016 | **No** | Absent logout/refresh/revocation — nothing to test |
| REQ-CYNAIAH-017 – 021 | **Yes** | `test_security_authz.py` (40 in run) is dedicated to cross-owner isolation across projects, characters, audio, rights, budgets, reviews and production records |
| REQ-CYNAIAH-022, 023 | **Partial** | `test_media_authz.py` (28 in run) covers media access; **filename-sanitisation edge cases are not separately asserted**, and the two different filters (alphanumeric vs `/`-and-`..`) are not compared |
| REQ-CYNAIAH-024 | **Yes** | `test_media_authz.py` exercises the `?token=` path — it verifies the mechanism works rather than challenging its exposure, which the spec itself flags as P0 |
| REQ-CYNAIAH-025, 026 | **No** | **The unlinked-file fallback is untested** — no test serves a generated file with no database record to a non-owner |
| REQ-CYNAIAH-027 | **Yes** | Covered by `test_edit_finish_iteration14` and media authz |
| REQ-CYNAIAH-028 – 031 | **Yes** | `test_cynaiah_backend` project CRUD plus authz suite |
| REQ-CYNAIAH-032 – 036 | **Partial** | Story Lab and character endpoints are exercised; **continuity-diff and reference generation are not asserted for output correctness**, only for access control |
| REQ-CYNAIAH-037 – 039 | **Partial** | `test_cynaiah_backend` covers music defaults (a 404 flake in `iteration_10_1` is green by `iteration_14`); the autopilot pending-until-accepted rule is not directly asserted |
| REQ-CYNAIAH-040 – 043 | **Yes** | `test_production_studio.py` (5 tests) plus authz coverage |
| REQ-CYNAIAH-044 – 047 | **Yes** | `test_faculty_reviews.py` (13 tests) covers assignment gating, append-only supersession and the rubric |
| REQ-CYNAIAH-048 | **Yes** | `test_frame_feedback.py` (12 in run) covers the forced target and cross-project rejection |
| REQ-CYNAIAH-049 | **Yes** | Authz suite |
| REQ-CYNAIAH-050 – 054 | **Yes** | `test_ancr_envelope.py` (28 in run) and `test_review_notifications.py` (22 in run) cover the envelope shape, link registry and scoped mark-read. Note `ancr_envelope.xml` recorded a missing-`deep_link` failure that is green by `iteration_14` |
| REQ-CYNAIAH-055 | **No** | Frontend polling untested by pytest (the spec cites Playwright verification, whose artefacts are not in this folder) |
| REQ-CYNAIAH-056 – 058 | **Yes** | `test_edit_finish_iteration14` and authz suite |
| REQ-CYNAIAH-059, 060 | **Yes** | `test_edit_finish_iteration14` asserts the final gate blocks on incomplete consent and checklists — the single most important behavioural test in this application |
| REQ-CYNAIAH-061 | **Partial** | Approval mirroring into review history is exercised; the immutability of the mirrored row is not separately asserted |
| REQ-CYNAIAH-062, 063 | **Partial** | Courses, enrolment and portfolio are covered by `test_cynaiah_backend` |
| REQ-CYNAIAH-064 | **No** | The absent ANCRVIEW publishing has nothing to test |
| REQ-CYNAIAH-065, 066 | **Yes** | `test_cyna.py` (17 tests), all green in `iteration_15_cyna.xml` |

**Summary:** 66 requirements. **36 Yes**, **17 Partial**, **13 No**. This is the best-tested application in the workspace by a wide margin, with dedicated suites for authentication hardening, cross-owner authorisation and media authorisation — the three areas every other app leaves untested. The residual gaps are narrow: the `require_faculty` role-set mismatch (REQ-CYNAIAH-015) and the unlinked-media fallback (REQ-CYNAIAH-025).

---

## 3. SPEC GAP ANALYSIS

**Specs compared:** `CYNAIAH_Product_Technical_Specification (1).pdf` (19 pp., "Version 1.0 — July 31, 2026", prepared for the COO), `CYNAIAH_Workflow (1).pdf`, `docs/CYNAIAH_DATA_DOCUMENT.md`, `memory/PRD.md`.

> The specification uses an explicit four-state status vocabulary — **OPERATIONAL**, **DEMO-DEPENDENT**, **INTEGRATION-READY**, **DEFERRED** — and applies it honestly. Most items below are therefore gaps the specification **already declares**, not undisclosed ones. That is the opposite of the pattern in every other app in this workspace, and it is worth stating plainly.

### (a) Specified but NOT implemented in code

| # | Spec source | Requirement | Code state | Spec's own label |
|---|---|---|---|---|
| G1 | §2.3 Integration map; §5.2 P0 | **ANCRID SSO**, upstream role provisioning, institution membership, session revocation, MFA | Local JWT with `iss: "cynaiah"`; no SSO client, no revocation, no MFA (REQ-CYNAIAH-013, 016) | **Declared** INTEGRATION-READY / P0 gate |
| G2 | §5.2 P0 | **Media authentication** — "replace full JWT query parameter with short-lived signed media access or secure cookie" | `?token=<full 14-day JWT>` remains the mechanism (REQ-CYNAIAH-024) | **Declared** P0 — the spec identifies this exact weakness |
| G3 | §5.2 P0 | **Durable media storage** — encrypted object storage with malware scanning and retention | Audio and video are written to local backend directories (`uploaded_audio`, `UPLOAD_ROOT`, `GENERATED_DIR`) (REQ-CYNAIAH-037, 057) | **Declared** DEMO-DEPENDENT / P0 |
| G4 | §5.2 P0 | **Secrets and AI accounts** — organisation-owned keys, remove dependence on the Emergent Universal Key | All model access flows through `EMERGENT_LLM_KEY` | **Declared** P0 |
| G5 | §5.2 P0 | **Deployment and recovery** — CI/CD, logging, monitoring, alerting, backups, tested restore | None present in this folder | **Declared** P0 |
| G6 | §2.3; §3.11 | **INHEIRA** rights export and clearance contract | Rights records exist locally with INHEIRA-ready shape; no outbound call | **Declared** INTEGRATION-READY |
| G7 | §2.3; §3.13 | **ANCRVIEW** publishing | Handoff CTA only; no publishing (REQ-CYNAIAH-064) | **Declared** DEFERRED |
| G8 | §2.3 | **COHEIR** external mentor review | Placeholder only | **Declared** "wait for the COHEIR API/spec" |
| G9 | §2.3; §3.7 | **ANCRLAB** as the audio/media source | Local upload and playback; ANCRLAB wiring prepared but not live | **Declared** INTEGRATION-READY |
| G10 | §2.2; §3.12 | **ANCRA/CCDP** should own courses, cohorts, assignments and institutional administration | CYNAIAH holds its own `courses` and `enrollments` (REQ-CYNAIAH-062) | **Declared** "should come from ANCRA/CCDP rather than being duplicated" |
| G11 | §3.7 | Animatic **MP4 export** | JSON manifest only (REQ-CYNAIAH-039) | **Declared** DEFERRED |
| G12 | §3.6 | Twelve external AI-tool tiles | Interface placeholders | **Declared** placeholders |
| G13 | §5.2 P1 | Student privacy (FERPA assessment, retention, deletion, exports, guardian rules), independent WCAG audit, security audit, device matrix, institutional admin model | None present | **Declared** P1 gates |
| G14 | Deferred list | Text-to-video, real-time WebSocket presence, student/faculty reply threads, automated continuity sequence checking, call-sheet email, advanced institutional analytics | None present | **Declared** DEFERRED |

**Undeclared gaps** — items the specification asserts as OPERATIONAL that the code does not fully support:

| # | Spec claim | Code state |
|---|---|---|
| U1 | §3.1: "Role-gated faculty and administrative routes return 403 to unauthorized users." | `require_faculty` admits `{"faculty", "admin", "mentor"}`, but `"admin"` is not a valid role and the two real admin roles (`institutional_admin`, `platform_admin`) are **excluded** (REQ-CYNAIAH-015). An institutional administrator is 403'd from faculty routes — the opposite of the intended hierarchy. |
| U2 | §4.3: "Nested record IDs must be verified against the parent project; an ID alone is never sufficient authorization." | Holds throughout **except** on generated images and music audio, where a file with no linked database record is served to any authenticated caller (REQ-CYNAIAH-025, 026). |

### (b) Implemented but NOT mentioned in the spec

| # | Code feature | Spec status |
|---|---|---|
| E1 | **`GET /api/notifications/link-registry`** and **`POST /api/notifications/resolve-link`** — a queryable registry of deep-link patterns with `required_query` validation (REQ-CYNAIAH-053). | §3.9 describes deep links landing on the right target, but the registry as a public contract endpoint is not specified. It is a genuinely useful integration surface. |
| E2 | **`GET /api/notifications/{id}/envelope`** — returns the canonical ANCR envelope for a single notification. | The envelope shape is documented in code; exposing it per-notification over HTTP is not in the spec. |
| E3 | **`POST /api/cyna/actions/execute`** — the assistant executing actions against the caller's data (REQ-CYNAIAH-066). | The CYNA assistant is not described in the specification's functional sections at all; it appears only as `iteration_15` test evidence. It is the newest subsystem and the least documented. |
| E4 | **`JWT_ALG` configurable via environment**, defaulting to HS256. | Unspecified; an environment-driven algorithm is a hardening consideration worth pinning. |
| E5 | **Login lockout keyed on the first `x-forwarded-for` hop** when present (REQ-CYNAIAH-011). | §3.1 specifies "eight attempts per IP/email identifier per five minutes" but not the header-trust decision, which matters behind a proxy that does not strip client-supplied values. |

---

## 4. UNCLEAR / NEEDS INPUT

**Q1 — `require_faculty` names a role that cannot exist, and excludes the two that do.**
The gate admits `{"faculty", "admin", "mentor"}`, but `VALID_ROLES` contains `institutional_admin` and `platform_admin` and no `"admin"` (REQ-CYNAIAH-015, U1). As written, no administrator can reach a faculty-gated route. Should the set become `{"faculty", "mentor", "institutional_admin", "platform_admin"}`, or should administrators be deliberately excluded from writing reviews? I have not changed it.

**Q2 — Generated media with no database record is served to any authenticated user.**
The in-code comment justifies this as covering "one-off AI test renders" not tied to a project (REQ-CYNAIAH-025, U2). Should unlinked renders instead be scoped to the generating user, given every render is produced by a known caller?

**Q3 — Two different filename filters on the three media routes.**
`/generated/` and `/music-audio/` require alphanumeric-plus-`._-`; `/finish/video/` only rejects `/` and `..` (REQ-CYNAIAH-022, 023). Should they be unified on the stricter filter?

**Q4 — The `?token=` media path.**
The specification already flags this as P0 and prescribes "short-lived signed media access or secure cookie" (G2). Which is preferred, and does the replacement need to work for `<video>` range requests? This is the one production blocker the code and spec agree on and neither has closed.

**Q5 — JWT error details are echoed to the client.**
`401 "Invalid token: {PyJWT exception}"` returns library-level detail (REQ-CYNAIAH-014). Should this be a generic message, with the detail logged server-side only?

**Q6 — 14-day tokens with no revocation.**
There is no logout, refresh or revocation endpoint (REQ-CYNAIAH-016), so a compromised token — including one leaked through a media URL (Q4) — stays valid for two weeks. Should a shorter TTL plus refresh land before, or as part of, the ANCRID migration?

**Q7 — `x-forwarded-for` is trusted for lockout keying.**
The first hop is taken verbatim (REQ-CYNAIAH-011, E5). Behind a proxy that does not strip client-supplied `x-forwarded-for`, an attacker can rotate the header to reset their own counter. Should the deployment guarantee header sanitisation, or should the key fall back to the socket peer?

**Q8 — Courses and enrolments are duplicated here.**
The specification says these should come from ANCRA/CCDP (G10), while the code owns them (REQ-CYNAIAH-062). Is the local Learn module intended to persist through integration as a CYNAIAH-native surface, or be replaced by an ANCRA projection?

**Q9 — The CYNA assistant is undocumented.**
`/api/cyna/*` including `actions/execute` appears in code and tests but in no specification section (E3). What actions may it execute, does any of them bypass a confirmation step, and should its scope be written into the spec before the pilot?

**Q10 — Notification bus sink.**
`ANCR_NOTIFICATIONS_ENABLED` exists with no `AncrBusSink` implementation registered (REQ-CYNAIAH-051). What is the bus contract, and who owns it? The spec's §08 asks exactly this question of the technical team.

**Q11 — Environment endpoint discloses demo posture publicly.**
`GET /api/environment` is unauthenticated by design (REQ-CYNAIAH-002) and reveals whether a demo admin is active. That is deliberate — it exists so demo instances are badged — but confirm it should stay unauthenticated in a school pilot.

**Q12 — Test evidence should be re-run.**
The specification itself instructs that "Earl's technical team should rerun the full suite from a clean checkout in its own environment and preserve the test report as handoff evidence" (§6.2). The 222/222 result in `iteration_14.xml` is dated 2026-07-31 and has not been re-run here. Is a fresh run against the current checkout needed before the audit?
