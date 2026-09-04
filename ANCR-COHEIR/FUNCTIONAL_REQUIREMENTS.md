# COHEIR — Functional Requirements

**App folder:** `ANCR-COHEIR`
**APPNAME:** `COHEIR`
**Derived from:** `backend/{server,auth,routes,uploads,share_kits,providers,analytics,aiah,models,seed_data}.py`, `frontend/src/**`
**Stack observed:** FastAPI (modular routers, lifespan) + Motor/MongoDB; bcrypt + opaque session tokens in httpOnly cookies; Emergent object storage; Claude Sonnet 4.5; React + React Router + axios
**Date of extraction:** 2026-09-03

---

## 1. FUNCTIONAL REQUIREMENTS

### 1.1 Startup & platform

**REQ-COHEIR-001**
**Given** the application starts
**When** the `lifespan` context opens
**Then** a Mongo client is attached to `app.state`, and if `users` is empty the full demo dataset from `build_all()` is inserted collection by collection.

**REQ-COHEIR-002**
**Given** startup completes
**When** indexes are created
**Then** unique indexes are placed on `users.user_id`, `users.email`, `user_sessions.session_token` and `share_kits.slug`, and object storage is warmed via `init_storage()`.

**REQ-COHEIR-003**
**Given** `GET /api/` or `GET /api/healthz`
**When** called
**Then** they return `{"app": "COHEIR™", "tagline": "Lead. Mentor. Develop. Launch."}` and `{"ok": true}` respectively, both unauthenticated.

**REQ-COHEIR-004**
**Given** the CORS middleware
**When** configured
**Then** origins come from `CORS_ORIGINS` (default `*`) with credentials allowed.

### 1.2 Authentication — three flows

**REQ-COHEIR-005**
**Given** `POST /auth/register`
**When** the email is already present
**Then** it raises **409 `"Email already registered"`**; otherwise a user is created with `provider: "password"`, `verified: false`, a bcrypt hash, and a caller-supplied `role` defaulting to `"student"`.

**REQ-COHEIR-006**
**Given** a registration payload
**When** `role` is supplied
**Then** it is validated only against the `Role` type in `models.py` — **there is no exclusion of privileged roles**, so a registrant may self-assign any role the type permits, including administrative ones.

**REQ-COHEIR-007**
**Given** `POST /auth/login`
**When** it runs
**Then** an unknown email or wrong password both raise **401 `"Invalid credentials"`**; success mints an opaque token `cohst_<48 url-safe bytes>`, persists it to `user_sessions` with a 7-day expiry, sets the httpOnly cookie **and returns the same token in the JSON body** as `session_token`.

**REQ-COHEIR-008**
**Given** the session cookie is set
**When** `_set_cookie` runs
**Then** it is `httponly, secure, samesite=none, path=/` with a 7-day max-age, named `coheir_session`.

**REQ-COHEIR-009**
**Given** `POST /auth/emergent` with a `session_id`
**When** it runs
**Then** the id is exchanged at `https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data` via an `X-Session-ID` header; a non-200 raises **401 `"Invalid Emergent session"`** and a payload without an email raises **400 `"Emergent payload missing email"`**.

**REQ-COHEIR-010**
**Given** a valid Emergent exchange
**When** the email is not yet known
**Then** a user is created with `provider: "emergent_google"`, `verified: true` and role `"student"`; when it is known, `picture` is refreshed and `verified` is forced to `true`. A COHEIR session is then issued.

**REQ-COHEIR-011**
**Given** `POST /auth/demo` with a `user_id` **or** an `email`
**When** it runs
**Then** it looks the user up and — **with no password, no token and no authentication of any kind** — mints a full 7-day session for that account and sets the cookie. Neither identifier raises **400 `"Provide user_id or email"`**; an unmatched lookup raises **404 `"Demo user not found"`**.

**REQ-COHEIR-012**
**Given** `POST /auth/demo`
**When** the supplied email belongs to a faculty, department chair, institution administrator or any other privileged seeded account
**Then** **the session is issued for that account.** The endpoint applies no allow-list, no role restriction and no environment guard, so it grants unauthenticated impersonation of every user in the database. The frontend calls it from the login page.

**REQ-COHEIR-013**
**Given** any protected endpoint
**When** `current_user` runs
**Then** it reads the `coheir_session` cookie, falling back to an `Authorization: Bearer` header; a missing token raises **401 `"Not authenticated"`**, an unknown or expired session **401 `"Session expired"`**, and a session whose user no longer exists **401 `"User not found"`**.

**REQ-COHEIR-014**
**Given** a session is validated
**When** `_get_session` checks expiry
**Then** a naive `expires_at` is coerced to UTC before comparison, and an expired row returns `None` — **but the row is never deleted**, so `user_sessions` grows without bound and expired sessions are never reaped.

**REQ-COHEIR-015**
**Given** `POST /auth/logout`
**When** called
**Then** the session row for the presented cookie is deleted and the cookie cleared. **The endpoint has no auth dependency** — calling it without a cookie is a silent no-op returning `{"ok": true}`.

**REQ-COHEIR-016**
**Given** `require_role(*roles)`
**When** it evaluates
**Then** it unions the user's primary `role` with their `roles` array and requires a non-empty intersection with the allowed set, raising **403 `"Insufficient role"`** otherwise.

**REQ-COHEIR-017**
**Given** the `require_role` helper exists
**When** the route modules are inspected
**Then** **it is not applied to a single endpoint.** Every domain, upload, analytics, provider and AIAH route depends on plain `current_user`, so any authenticated user — including a student — reaches all of them.

### 1.3 Directory, students and supervision

**REQ-COHEIR-018**
**Given** `GET /professionals`
**When** called
**Then** users are filtered to the 18-role `PROFESSIONAL_ROLES` set, narrowed by exact `role`, `disciplines` membership, a case-insensitive `location` regex, and a `q` regex across name, title, company, expertise and disciplines. `limit` defaults to 60. **`q` and `location` are not escaped.**

**REQ-COHEIR-019**
**Given** `GET /professionals/featured`
**When** called
**Then** it returns up to 6 **verified** users whose role is producer, songwriter, engineer, creative_director, attorney or publisher.

**REQ-COHEIR-020**
**Given** `GET /professionals/{user_id}`
**When** called
**Then** it returns **any user document** minus `password_hash` — the lookup is not constrained to professional roles, so a student's full record is returned through this route. An unknown id raises **404 `"Professional not found"`**.

**REQ-COHEIR-021**
**Given** `GET /students`
**When** any authenticated user calls it
**Then** all students are returned, filterable by `cohort_id`, `program` and a `q` regex across name, program, skills and location. **No role check applies** — a student can enumerate every other student.

**REQ-COHEIR-022**
**Given** `GET /students/{user_id}`
**When** any authenticated user calls it
**Then** the student is returned **with their 30 most recent professional reviews and recommendations attached**. This is the most sensitive read in the application and it is available to every signed-in account, including other students.

**REQ-COHEIR-023**
**Given** `GET /supervision/mine`
**When** called
**Then** it returns up to 50 students whose `mentor_ids` contains the caller — the one endpoint that is genuinely scoped to the caller's relationships.

### 1.4 Cohorts, sessions and calendar

**REQ-COHEIR-024**
**Given** `GET /cohorts` or `GET /cohorts/{id}`
**When** called
**Then** cohorts are returned to any authenticated user with no membership check.

**REQ-COHEIR-025**
**Given** `GET /sessions`
**When** called
**Then** sessions are filtered by optional `kind` and `cohort_id`, sorted by `start` ascending, capped by `limit` (default 60). **The declared `upcoming` boolean parameter is accepted and never used** — the filter is dead.

**REQ-COHEIR-026**
**Given** `GET /sessions/upcoming`
**When** called
**Then** it returns up to 6 sessions whose status is `scheduled` or `live`, sorted by start.

**REQ-COHEIR-027**
**Given** `GET /sessions/{id}`
**When** called
**Then** an unknown id raises **404 `"Session not found"`**; otherwise the session is returned with its attendee user documents hydrated (up to 200).

**REQ-COHEIR-028**
**Given** the sessions feature
**When** a user tries to book, schedule, join, cancel or attend one
**Then** **no such endpoint exists.** Sessions are seed-only: there is no create, update, RSVP, attendance or recording capability, and no calendar write.

**REQ-COHEIR-029**
**Given** `GET /calendar`
**When** called
**Then** all `calendar_events` are returned sorted by start, capped at 200, unscoped to the caller.

### 1.5 Reviews and recommendations

**REQ-COHEIR-030**
**Given** `POST /reviews`
**When** any authenticated user calls it
**Then** a review is created against the supplied `student_id` with the caller as reviewer, carrying `scores` (an unvalidated free-form dict), `comments`, `recommendations`, `growth_plan` and an optional `session_id`.

**REQ-COHEIR-031**
**Given** a review is created
**When** the handler completes
**Then** a notification is written for the student — `kind: "feedback"`, title `"New review from {name}"`, body `"Your ANCRID™ has been updated with a new Professional Review."`, link `/reviews`. **No ANCRID record is actually updated** — the message describes an integration that does not exist.

**REQ-COHEIR-032**
**Given** `POST /reviews`
**When** the caller is a student
**Then** **the review is still created.** There is no role check, no verification that the reviewer supervises the student, and no check that `student_id` refers to an existing user — a review can be filed against an arbitrary id by anyone signed in.

**REQ-COHEIR-033**
**Given** `POST /recommendations`
**When** called
**Then** a recommendation is created with the caller as recommender, carrying `for_type`, `target` and `narrative`. The same three absent checks as REQ-COHEIR-032 apply.

**REQ-COHEIR-034**
**Given** `GET /reviews` or `GET /recommendations`
**When** called with an optional `student_id`
**Then** matching records are returned — and **with no `student_id` supplied, every review and recommendation for every student is returned** (capped at 100) to any authenticated caller.

**REQ-COHEIR-035**
**Given** a review or recommendation exists
**When** the author wishes to amend or withdraw it
**Then** **no update or delete endpoint exists**, and no version history is kept.

### 1.6 Opportunities, teams, resources, notifications

**REQ-COHEIR-036**
**Given** `GET /opportunities`
**When** called with an optional `kind`
**Then** opportunities are returned newest-first, capped at 100.

**REQ-COHEIR-037**
**Given** `POST /opportunities/apply`
**When** called
**Then** the caller's id is `$addToSet`ed into the opportunity's `applicant_ids` and `{"ok": true}` returned. **No existence check is performed**, so an unknown `opportunity_id` silently no-ops and still reports success. There is no withdraw path and no notification to the poster.

**REQ-COHEIR-038**
**Given** `GET /creative-teams` and `GET /creative-teams/{id}`
**When** called
**Then** teams are returned to any authenticated user; an unknown id raises 404. **There is no create, join or leave capability.**

**REQ-COHEIR-039**
**Given** `GET /resources`
**When** called with an optional `kind`
**Then** resources are returned newest-first, capped at 100, unscoped.

**REQ-COHEIR-040**
**Given** `GET /notifications`
**When** called
**Then** the caller's own notifications are returned newest-first, capped at 50 — correctly scoped.

**REQ-COHEIR-041**
**Given** `POST /notifications/{id}/read`
**When** called
**Then** the update is scoped to `{id, user_id: caller}` and `{"ok": true}` is returned whether or not anything matched.

### 1.7 Messaging

**REQ-COHEIR-042**
**Given** `GET /threads`
**When** called
**Then** it returns threads whose `participant_ids` contains the caller, sorted by `last_at` descending — correctly scoped.

**REQ-COHEIR-043**
**Given** `GET /threads/all`
**When** any authenticated user calls it
**Then** **every thread in the database is returned regardless of participation** (capped at 50), including `last_message` previews of conversations the caller is not part of.

**REQ-COHEIR-044**
**Given** `GET /threads/{thread_id}/messages`
**When** called
**Then** up to 500 messages are returned filtered **only on `thread_id`** — **participation is never checked**, so any authenticated user who has a thread id (obtainable from `/threads/all`) can read that conversation in full.

**REQ-COHEIR-045**
**Given** `POST /threads/messages`
**When** called
**Then** a message is inserted with the caller as sender and the thread's `last_message` and `last_at` are updated. **Neither thread existence nor participation is checked**, so a message can be posted into any thread, or into a thread id that does not exist.

**REQ-COHEIR-046**
**Given** the messaging surface
**When** a user looks for real-time delivery
**Then** there is **no WebSocket, SSE or polling refresh** — an inbound message appears only when the recipient reloads or reselects a thread.

### 1.8 Portfolio uploads

**REQ-COHEIR-047**
**Given** `POST /uploads` as multipart
**When** the file extension is not in the `ALLOWED` map
**Then** it raises **415 `"Unsupported file type: .{ext}"`**; a file over the 50 MB cap raises **413 `"File exceeds 50MB limit"`**. The file is fully read into memory before the size check.

**REQ-COHEIR-048**
**Given** a valid upload
**When** it is stored
**Then** it is written to `{APP_NAME}/portfolio/{user_id}/{uuid}.{ext}` in Emergent object storage and a `portfolio_files` record is inserted carrying owner, filename, content type, size, category, title, description, `visibility` and `is_deleted: false`.

**REQ-COHEIR-049**
**Given** the `visibility` form field
**When** it is validated
**Then** any value outside `private`, `shared`, `public` **silently becomes `private`** rather than erroring. `category` is **not** validated against `VIEW_CATEGORIES` at all — that constant is declared and never used.

**REQ-COHEIR-050**
**Given** `GET /uploads/mine`
**When** called
**Then** the caller's non-deleted files are returned newest-first, capped at 200.

**REQ-COHEIR-051**
**Given** `GET /uploads/user/{user_id}`
**When** called
**Then** only that user's `public` or `shared` files are returned — private files are correctly excluded. **`shared` is not scoped to a cohort or relationship**, so it behaves identically to public for every authenticated caller.

**REQ-COHEIR-052**
**Given** `GET /uploads/file/{id}/download`
**When** the file's visibility is `public`
**Then** **the bytes are served with no authentication at all**.

**REQ-COHEIR-053**
**Given** a non-public file download
**When** authentication is checked
**Then** a token is taken from the `coheir_session` cookie, **an `?auth=` query parameter**, or a bearer header; a missing token raises **401 `"Not authenticated"`** and an unknown session **401 `"Session expired"`**.

**REQ-COHEIR-054**
**Given** a valid session is presented for a non-public download
**When** the handler proceeds
**Then** **it verifies only that the session exists — never that the session's user owns the file or was granted access.** Any authenticated user can download any other user's `private` file given its id. The `?auth=` query form additionally places a live 7-day session token in URLs, browser history and referrer headers.

**REQ-COHEIR-055**
**Given** `PATCH /uploads/file/{id}`
**When** called
**Then** the lookup is scoped to `{id, user_id: caller}`, so another user's file raises **404**; supplied non-null fields among title, description, category and visibility are `$set`. **The new `visibility` is not validated here**, unlike at upload.

**REQ-COHEIR-056**
**Given** `DELETE /uploads/file/{id}`
**When** called
**Then** the file is **soft-deleted** (`is_deleted: true`) scoped to the caller; a non-match raises **404**. The stored object is never removed from object storage.

### 1.9 Share Kits

**REQ-COHEIR-057**
**Given** `POST /share/kits`
**When** the `kind` is not one of the seven known kinds
**Then** it raises **400 `"Unknown kit kind"`**; an unknown `subject_user_id` raises **404 `"Subject user not found"`**.

**REQ-COHEIR-058**
**Given** a kit request
**When** authorisation is evaluated
**Then** generation is permitted if the caller is the subject, or the caller's role is `ancr_admin`/`institution_admin`, or the third compound clause holds; otherwise **403 `"Not allowed to create this kit"`**.

**REQ-COHEIR-059**
**Given** the third authorisation clause
**When** Python evaluates it
**Then** operator precedence makes it `(A and B) or C`, where `C` is `user.user_id in subject.mentor_ids` **standing alone**. The `kind in ("institution_review", "private_review")` restriction therefore does **not** constrain `C` — a mentor of the subject can generate **any** kit kind, including `press_kit` and `booking_profile`.

**REQ-COHEIR-060**
**Given** clause `B` of the same expression
**When** it is read
**Then** it tests `body.subject_user_id in subject.mentor_ids` — **whether the subject is their own mentor**, which is never true in the seeded data. Clause B is effectively dead code; the parameter it was presumably meant to test is `user.user_id`.

**REQ-COHEIR-061**
**Given** an authorised kit
**When** it is created
**Then** a `secrets.token_urlsafe(12)` slug is generated, `expires_at` is set only when `expires_days` is supplied (**otherwise the link never expires**), `revoked` starts false and `views` at 0.

**REQ-COHEIR-062**
**Given** the `fields` parameter
**When** a kit is created
**Then** any caller-supplied field names are **unioned onto the preset whitelist**, so a kit creator can widen the projection beyond the preset — including for a subject who is not themselves (REQ-COHEIR-059).

**REQ-COHEIR-063**
**Given** `GET /share/public/{slug}`
**When** called with **no authentication**
**Then** a missing or revoked kit raises **404 `"Share link not available"`**, an expired kit **410 `"Share link expired"`**, and otherwise the subject is returned filtered through the kind's field preset, with `views` incremented.

**REQ-COHEIR-064**
**Given** the public projection
**When** `_filter_fields` runs
**Then** the base query already excludes `password_hash`, `email` and `mentor_ids`, and the preset then keeps only whitelisted keys — a genuine two-stage field-level control, and the strongest privacy mechanism in this application.

**REQ-COHEIR-065**
**Given** a kit of kind `student_profile` or `institution_review`
**When** the public view is assembled
**Then** **all of that student's reviews and recommendations are attached** (up to 50 each) and served to anyone holding the link, unauthenticated.

**REQ-COHEIR-066**
**Given** a kit of kind `public_portfolio`, `student_profile`, `press_kit` or `booking_profile`
**When** the public view is assembled
**Then** the subject's `public` and `shared` portfolio files are attached — so `shared` files reach the open internet through a share link.

**REQ-COHEIR-067**
**Given** `GET /share/kits/mine`
**When** called
**Then** kits are returned where the caller is either the subject **or** the creator, newest-first, capped at 100.

**REQ-COHEIR-068**
**Given** `POST /share/kits/{id}/revoke`
**When** called
**Then** it is permitted for the subject, the creator, or an `ancr_admin`; otherwise **403 `"Not allowed"`**. An unknown id raises **404 `"Kit not found"`**. Revocation is a flag — the slug is not rotated.

### 1.10 Integrations

**REQ-COHEIR-069**
**Given** `GET /providers/video` or `/providers/calendar`
**When** called
**Then** each provider is returned with a computed `connected` boolean that is true **only if every environment variable it declares is present**. An empty `env_vars` list yields `false`.

**REQ-COHEIR-070**
**Given** the provider integrations
**When** a user attempts to actually connect one
**Then** **no OAuth flow, token exchange or API call exists.** `POST /providers/request-connection` merely writes a `provider_requests` row with `status: "pending"` and returns it — the documented behaviour is that an ANCR admin provisions credentials manually.

**REQ-COHEIR-071**
**Given** `POST /providers/preferences`
**When** called
**Then** non-null `video_provider` / `calendar_provider` values are `$set` onto the caller's `provider_prefs`. **No endpoint ever reads `provider_prefs`.**

### 1.11 AIAH

**REQ-COHEIR-072**
**Given** `POST /aiah/generate`
**When** `EMERGENT_LLM_KEY` is absent, or the model call raises for any reason
**Then** `_fallback()` returns a **fixed markdown block** and the response is still 200. The fallback text states "AIAH is currently generating a deterministic response because the live model is offline" and lists invented signals — portfolio velocity on ANCRLAB, collaboration density on ANCRSync, publishing readiness per INHEIRA — **none of which is computed from any data**.

**REQ-COHEIR-073**
**Given** a successful model call
**When** it runs
**Then** it uses `anthropic / claude-sonnet-4-5-20250929` with a fresh random session id per request — **no conversation continuity**.

**REQ-COHEIR-074**
**Given** any generation
**When** it completes
**Then** an `ai_insights` record is stored with the caller, context, kind, prompt and output, and `GET /aiah/recent` returns the caller's 10 most recent — correctly scoped.

**REQ-COHEIR-075**
**Given** the AIAH system prompt
**When** it is composed
**Then** it instructs the model to "never fabricate specific student data — reason only from what the user includes in the prompt". **No ecosystem context is injected server-side**, so the model sees only the free-text prompt the caller typed.

### 1.12 Analytics

**REQ-COHEIR-076**
**Given** `GET /analytics/institution`
**When** any authenticated user calls it
**Then** it loads up to 1,000 students, 1,000 professionals, 200 cohorts, 500 sessions, 500 reviews, 500 recommendations, 500 opportunities and 2,000 portfolio files **into memory in a single request** and computes derived views.

**REQ-COHEIR-077**
**Given** mentor engagement is computed
**When** it is scored
**Then** each professional's score is the count of reviews authored plus recommendations authored plus sessions hosted — an unweighted tally — and the top 10 are returned.

**REQ-COHEIR-078**
**Given** `GET /institution/overview`
**When** any authenticated user calls it
**Then** institution-wide counts (students, faculty, mentors, cohorts, upcoming sessions, open opportunities, reviews logged, recommendations) and the distinct programme list are returned with **no role restriction**.

### 1.13 Dashboard and frontend surfaces

**REQ-COHEIR-079**
**Given** `GET /dashboard/overview`
**When** called
**Then** it returns 4 upcoming sessions, 4 recent opportunities, 4 recent recommendations, 4 recent reviews, the caller's 4 most recent threads, up to 10 unread notifications, supervised students (only when the caller's role is not `student`), the caller's cohorts, and four institution-wide stats.

**REQ-COHEIR-080**
**Given** the dashboard's `recommendations` and `reviews` blocks
**When** they are queried
**Then** they are **not filtered by the caller at all** — the four most recent reviews and recommendations for any student in the institution appear on every user's dashboard, including students'.

**REQ-COHEIR-081**
**Given** the frontend route table
**When** it is read
**Then** 26 authenticated routes render inside `AppShell`, plus a public landing page, a login page and `/p/:slug` for public share kits. An unmatched path redirects to `/`.

**REQ-COHEIR-082**
**Given** the login page
**When** it renders
**Then** it offers password login, registration, Emergent OAuth via `/auth/emergent`, **and one-click demo sign-in that calls `POST /auth/demo` with an email** (REQ-COHEIR-011).

---

## 2. TEST COVERAGE

**Test assets found**
- `backend/tests/backend_test.py` — 27 tests across auth, directory, students, cohorts, sessions, reviews, opportunities, recommendations, teams, calendar, resources, messaging, dashboard, institution overview, AIAH and notifications.
- `backend/tests/test_v11.py` — 12 tests across providers, uploads, share kits and analytics.
- `test_reports/pytest/pytest_results.xml` — **a recorded run: 27 tests, 0 failures, 0 errors, 17.283 s, timestamped 2026-07-08T18:58:53Z.** This is the only clean recorded run in the workspace.
- `test_result.md` — protocol boilerplate only.
- **No frontend tests.**

| Requirement | Covered | Evidence / gap |
|---|---|---|
| REQ-COHEIR-001, 002 | **Partial** | Data-returning tests imply the seed ran; indexes untested |
| REQ-COHEIR-003 | **Yes** | `test_healthz` |
| REQ-COHEIR-004 | **No** | CORS untested |
| REQ-COHEIR-005 | **No** | **Registration is not tested at all** — neither the happy path nor the 409 |
| REQ-COHEIR-006 | **No** | **Self-assigned role at registration is untested** |
| REQ-COHEIR-007 | **Yes** | `test_login_success` and `test_login_bad_creds` |
| REQ-COHEIR-008 | **No** | Cookie flags untested |
| REQ-COHEIR-009 | **Partial** | `test_emergent_bad_session` asserts the 401; the success path cannot be tested without a live Emergent session |
| REQ-COHEIR-010 | **No** | Emergent user creation/refresh untested |
| REQ-COHEIR-011 | **Yes** | `test_demo_login` asserts it works |
| REQ-COHEIR-012 | **No** | **That `/auth/demo` grants unauthenticated impersonation of privileged accounts is never tested or challenged.** The existing test confirms the endpoint functions, which is precisely the concern |
| REQ-COHEIR-013 | **Yes** | `test_auth_me`; the three distinct 401 details are not individually verified |
| REQ-COHEIR-014, 015 | **No** | Expired-session retention and unauthenticated logout untested |
| REQ-COHEIR-016 | **No** | `require_role` has no test because no route uses it |
| REQ-COHEIR-017 | **No** | **That every route falls back to plain `current_user` is untested** |
| REQ-COHEIR-018 – 020 | **Yes** | `test_professionals`, `test_professionals_featured`, `test_professional_by_id` |
| REQ-COHEIR-021 | **Partial** | `test_students_list` runs as a **producer**; **no test attempts it as a student**, so the absent role check is unverified |
| REQ-COHEIR-022 | **Partial** | `test_student_detail` takes both a producer and a student fixture and asserts the payload; it does not challenge that reviews and recommendations reach a peer student |
| REQ-COHEIR-023 | **Yes** | `test_supervision_mine` |
| REQ-COHEIR-024 | **Yes** | `test_cohorts` |
| REQ-COHEIR-025 | **Partial** | `test_sessions` covers the list; **the dead `upcoming` parameter is not detected** |
| REQ-COHEIR-026, 027 | **Yes** | `test_sessions_upcoming`; the 404 branch is untested |
| REQ-COHEIR-028, 029 | **Partial** | `test_calendar` passes; the absence of any session write path is not surfaced |
| REQ-COHEIR-030, 031 | **Yes** | `test_review_create` asserts creation |
| REQ-COHEIR-032 | **No** | **That a student can author a review is untested** — `test_review_create` uses a producer fixture |
| REQ-COHEIR-033 | **Partial** | `test_recommendations` covers the list; creation and its absent checks are untested |
| REQ-COHEIR-034 | **Yes** | `test_reviews_list` — asserts the unscoped list works rather than questioning it |
| REQ-COHEIR-035 | **No** | No update/delete to test |
| REQ-COHEIR-036 | **Yes** | `test_opportunities` |
| REQ-COHEIR-037 | **Partial** | Apply is exercised; **the silent no-op on an unknown id is untested** |
| REQ-COHEIR-038, 039 | **Yes** | `test_creative_teams`, `test_resources` |
| REQ-COHEIR-040, 041 | **Yes** | `test_notifications` |
| REQ-COHEIR-042, 045 | **Yes** | `test_threads_and_message` covers listing and posting |
| REQ-COHEIR-043, 044 | **No** | **Neither `/threads/all` nor cross-thread message reading is tested** — the two widest disclosures in the messaging layer |
| REQ-COHEIR-046 | **No** | Absent real-time delivery untested |
| REQ-COHEIR-047 | **Yes** | `test_upload_rejects_txt` asserts 415 |
| REQ-COHEIR-048 | **Partial** | `test_upload_png_or_503` accepts **either** success or a storage failure, so it passes whether or not storage works |
| REQ-COHEIR-049 | **No** | Visibility coercion and the unused `VIEW_CATEGORIES` are untested |
| REQ-COHEIR-050 | **Yes** | `test_uploads_mine` |
| REQ-COHEIR-051 – 054 | **No** | **The download endpoint has no test at all**, including the ownership gap at REQ-COHEIR-054 and the `?auth=` token-in-URL path |
| REQ-COHEIR-055, 056 | **No** | Patch and soft-delete untested |
| REQ-COHEIR-057 | **Yes** | `test_share_kit_bad_kind` asserts 400 |
| REQ-COHEIR-058 | **Partial** | `test_create_share_kit_self` covers the self-share path only |
| REQ-COHEIR-059, 060 | **No** | **The precedence bug and the dead clause are untested** — no test creates a kit as a mentor for a subject |
| REQ-COHEIR-061, 062 | **No** | Never-expiring default and caller-supplied `fields` widening are untested |
| REQ-COHEIR-063 | **Yes** | `test_share_public_no_auth_required` and `test_share_public_nonexistent`. The 410 expiry branch is untested |
| REQ-COHEIR-064 | **Partial** | The projection is exercised via the self-share test; the preset whitelists are not asserted field by field |
| REQ-COHEIR-065, 066 | **No** | That reviews, recommendations and `shared` files reach an unauthenticated link is untested |
| REQ-COHEIR-067, 068 | **No** | Kit listing and revocation are untested |
| REQ-COHEIR-069 | **Yes** | `test_video_providers`, `test_calendar_providers` |
| REQ-COHEIR-070 | **Yes** | `test_provider_request_connection` |
| REQ-COHEIR-071 | **No** | Preferences are written and never read; untested |
| REQ-COHEIR-072 | **Partial** | `test_aiah_generate` asserts a 200 with output — **which the deterministic fallback also satisfies**, so the test passes whether or not the model was reached |
| REQ-COHEIR-073 – 075 | **No** | Model selection, insight storage scoping and the absent context injection are untested |
| REQ-COHEIR-076, 077 | **Partial** | `test_institution_analytics` runs as admin and asserts shape; the unrestricted access and the in-memory load are not challenged |
| REQ-COHEIR-078 | **Yes** | `test_institution_overview` — again as admin, so the absent role check is unverified |
| REQ-COHEIR-079 | **Yes** | `test_dashboard_overview` |
| REQ-COHEIR-080 | **No** | **That every user's dashboard shows other students' reviews is untested** |
| REQ-COHEIR-081, 082 | **No** | Frontend only |

**Summary:** 82 requirements. **24 Yes**, **16 Partial**, **42 No**. COHEIR has the most tests in the workspace and the only recorded all-green run. The suite is broad but consistently uses privileged fixtures — producer and admin clients — for endpoints that have **no role check**, so it verifies that authorised users can do things without ever establishing that unauthorised ones cannot. Every access-control finding in this document sits in that blind spot.

---

## 3. SPEC GAP ANALYSIS

**Specs compared:** `COHEIR_Product_Specification_v1.0 (2) (1).pdf` (10 pp., canonical, "Module 5 of 10"), `COHEIR_Workflow.pdf`, `memory/COHEIR_Technical_Specification_v1.0.md`, `memory/COHEIR_V1_BUILD_INVENTORY.md`, `memory/PRD.md`.

### (a) Specified but NOT implemented in code

| # | Spec source | Requirement | Code state |
|---|---|---|---|
| G1 | §10 Authentication | **"COHEIR™ uses ANCRID™ exclusively. No independent login. Permissions and identity are inherited from ANCRID™."** | COHEIR implements **three independent login flows** — email/password with bcrypt, an Emergent Google exchange, and a passwordless demo endpoint — plus its own session store. No ANCRID client exists. This is the furthest any module in the workspace has gone from the ANCRID-exclusive requirement. |
| G2 | §13 Engineering Notes; Roadmap **P0** "**Role-Based Permissions**" | Role-based permissions as a P0 deliverable | `require_role` is implemented and **applied to zero endpoints** (REQ-COHEIR-017). Students can list students, read any student's reviews, author reviews and recommendations, read the institution analytics and open every thread. The P0 item is written but not wired. |
| G3 | §09 Module Integrations (9 modules) | Consume academic progress, projects, collaboration history, publishing, business readiness, media, reputation and career readiness | **No outbound integration exists.** Every collection is local and seeded. The review notification even tells the student "Your ANCRID™ has been updated" when nothing outside this database changed (REQ-COHEIR-031). |
| G4 | §13 | "**Session history should automatically create verified Creator Passport™ events.**" | No Passport event is ever emitted. There is also no way to complete a session — sessions are read-only seed data (REQ-COHEIR-028). |
| G5 | §07 Sessions™ | Meetings · Portfolio Reviews · Office Hours · Industry Conversations · Group Mentoring · **Calendar Integration** · **Attendance** · **Notes** · **Recording History** | Sessions can only be listed and read. **There is no booking, scheduling, attendance marking, note-taking or recording**, and no calendar write. |
| G6 | §07 Sessions™ Calendar Providers | Google Calendar · Microsoft Outlook · Apple Calendar · Calendly · University Calendars | Providers are listed with a `connected` flag derived from environment variables, but **no OAuth, token exchange or calendar API call exists** (REQ-COHEIR-070). Connection is a manually-provisioned request row. |
| G7 | §07 Mentorship™ | Mentor Discovery · **Office Hours** · **One-on-One Meetings** · **Group Mentoring** · **Long-Term Mentorship** · **Mentorship History** · **Progress Tracking** · **Mentor Notes** | Only discovery (the directory) and a static `mentor_ids` array exist. There is **no mentorship request, acceptance, history, progress record or private mentor note**. |
| G8 | §07 Portfolio Reviews™ | Portfolio Uploads · Faculty Reviews · Industry Reviews · **Audio Feedback** · **Video Feedback** · **Rubrics** · Comments · **Revision Requests** · **Version History** | Uploads and text reviews exist. **Audio and video feedback, rubrics, revision requests and version history are all absent** — `scores` is an unvalidated free-form dict standing in for a rubric (REQ-COHEIR-030). |
| G9 | §06 Primary Navigation (14 items) | Includes **Mentors**, **Faculty**, **Industry Leaders**, **Executives**, **Artists in Residence**, **Institutions**, **Employer Portal** as distinct destinations | The implementation collapses these into one `/directory` with role filters. `/employer` exists as a route; there is no employer-specific capability behind it. |
| G10 | §12 Future Roadmap; §13 Roadmap **P1** | **Live Messaging** · **AI Session Summaries** · Employer CRM · Institution Dashboards | Messaging is store-and-reload with no real-time transport (REQ-COHEIR-046). AI session summaries do not exist — AIAH has no session context (REQ-COHEIR-075). No employer CRM. |
| G11 | §08 AIAH™ (8 capabilities) | Mentor Recommendations · Career Guidance · Portfolio Reviews · **Meeting Summaries** · Networking Suggestions · Profile Optimization · Career Readiness Insights · Professional Growth Recommendations | AIAH is a single free-text prompt with a `kind` label that changes nothing server-side. **No capability has a structured surface**, and when the model is unreachable it emits fabricated ecosystem signals as though they were measured (REQ-COHEIR-072). |
| G12 | §13 Roadmap **P2** | W3C Verifiable Credentials · Open Badges · AI Mentor Matching · Enterprise Reporting | None implemented. |
| G13 | §07 Professional Directory™ | Browse by Industry · Institution · Country · Discipline · **Genre** · Role · **Experience** · **Availability** · **Verified Status** | Role, discipline, location and free text are filterable. **Genre, experience, availability and verified status are not filter parameters**, though `verified` and `availability` exist on the user model. |
| G14 | §05 "Single Source of Truth" | "It does not own creator identity, publishing, financial data, educational records, or **portfolio assets**." | COHEIR **stores portfolio files itself** in its own object-storage namespace with its own visibility model (REQ-COHEIR-048), rather than referencing ANCRLAB or ANCRMEDIA assets. |

### (b) Implemented but NOT mentioned in the spec

| # | Code feature | Spec status |
|---|---|---|
| E1 | **`POST /auth/demo`** — unauthenticated, passwordless session issuance for any user identified by email or id (REQ-COHEIR-011, 012). | Unspecified. Its docstring calls it "Instant demo login … Great for reviewers." It is the single widest access-control exposure found anywhere in this workspace, and it is wired into the login page. |
| E2 | **Emergent Google OAuth** as a second identity provider (REQ-COHEIR-009, 010). | §10 permits no independent login at all, let alone a third-party one. Note it force-sets `verified: true` on every Google-authenticated account without any verification of professional standing. |
| E3 | **`GET /threads/all`** — every thread in the institution returned to any authenticated user (REQ-COHEIR-043). | Unspecified. Combined with the unscoped message read (REQ-COHEIR-044) it makes all messaging readable by any account. |
| E4 | **`?auth=` query-parameter session tokens** on the download endpoint, documented in-code as being "for `<audio>`/`<img>` tags" (REQ-COHEIR-053). | Unspecified. It places a live 7-day credential into URLs, history and referrers. |
| E5 | **Session tokens returned in the JSON body** alongside the httpOnly cookie on all three login flows (REQ-COHEIR-007). | Unspecified, and it defeats the purpose of the httpOnly cookie. |
| E6 | **Caller-supplied `fields` widening** on share kits (REQ-COHEIR-062). | §07 specifies six fixed kit kinds with implied fixed projections; an arbitrary field allow-list extension is not specified. |
| E7 | **A seventh kit kind, `student_profile`**, which attaches all of a student's reviews and recommendations to an unauthenticated public link (REQ-COHEIR-065). | §07 lists six kinds: Public Portfolio, Professional Resume, Press Kit, Booking Profile, Institution Review, Private Review. `student_profile` is an addition, and it is the most disclosive of the seven. |
| E8 | **Share links that never expire by default** (REQ-COHEIR-061). | §07 names "Expiring Links" as a supported capability; the implementation makes expiry opt-in. |
| E9 | **A deterministic AIAH fallback that fabricates ecosystem signals** — portfolio velocity, collaboration density, publishing readiness — presented in the same format as real output (REQ-COHEIR-072). | Unspecified, and in tension with the system prompt's own instruction never to fabricate student data. |
| E10 | **`provider_prefs` written and never read** (REQ-COHEIR-071); **`VIEW_CATEGORIES` declared and never used** (REQ-COHEIR-049); **`upcoming` session parameter accepted and ignored** (REQ-COHEIR-025). | Three dead code paths, all unspecified. |

---

## 4. UNCLEAR / NEEDS INPUT

**Q1 — `POST /auth/demo` grants unauthenticated impersonation of any account.**
Supplying an email or `user_id` returns a full 7-day session for that user, with no password, no allow-list and no environment guard (REQ-COHEIR-011, 012, E1). It is called from the login page. I have not changed it. Should it be removed, restricted to an explicit demo-account allow-list, or gated behind a non-production environment flag?

**Q2 — `require_role` is implemented and used nowhere.**
The helper works, `Role` values exist on every user, and the spec names role-based permissions as a P0 deliverable — but not one route applies it (REQ-COHEIR-017, G2). Which endpoints need which roles? At minimum: student listing, student detail with reviews, review and recommendation authoring, institution analytics, and institution overview.

**Q3 — Any authenticated user can read any student's reviews and recommendations.**
`GET /students/{id}` attaches both (REQ-COHEIR-022), `GET /reviews` with no `student_id` returns all of them (REQ-COHEIR-034), and the dashboard shows the four most recent to everyone (REQ-COHEIR-080). Who should be able to read a professional review — the student, their mentors, faculty, the institution?

**Q4 — Messaging has no participation checks.**
`/threads/all` returns every thread, `/threads/{id}/messages` filters only on thread id, and posting checks neither existence nor membership (REQ-COHEIR-043, 044, 045). Should all three be scoped to `participant_ids`, and does `/threads/all` have a legitimate purpose?

**Q5 — Private file downloads check only that a session exists.**
`GET /uploads/file/{id}/download` verifies a valid session but never that the caller owns or was granted the file (REQ-COHEIR-054). Any authenticated user can fetch any private file by id. What is the intended access rule for `private` versus `shared`, and what does `shared` mean — cohort, mentors, or named recipients (REQ-COHEIR-051)?

**Q6 — Share-kit authorisation has an operator-precedence bug.**
`(A and B) or C` lets any mentor of the subject create **any** kit kind, and clause B tests `subject_user_id in subject.mentor_ids` — the subject being their own mentor — which is never true (REQ-COHEIR-059, 060). What was the intended rule? My reading is that it should be `user.user_id in subject.mentor_ids and body.kind in ("institution_review", "private_review")`, but I have not changed it.

**Q7 — Share links default to never expiring.**
`expires_days` is optional and `expires_at` stays null when omitted (REQ-COHEIR-061, E8). Should there be a default TTL, and should revocation rotate the slug rather than set a flag (REQ-COHEIR-068)?

**Q8 — `student_profile` kits publish reviews to the open internet.**
An unauthenticated link holder receives up to 50 reviews and 50 recommendations about the student (REQ-COHEIR-065, E7). Is that kind intended to be public, and should the student consent per kit?

**Q9 — Caller-supplied `fields` can widen a kit's projection.**
Including for a subject who is not the caller (REQ-COHEIR-062). Should `fields` narrow only, or be removed?

**Q10 — Reviews can be authored by anyone about anyone.**
No role check, no supervision check, no existence check on `student_id`, and no edit or delete afterwards (REQ-COHEIR-032, 035). What are the authoring rules, and should a review be amendable or retractable?

**Q11 — Registration allows self-assigned roles.**
`role` comes straight from the request body (REQ-COHEIR-006). Which roles may be self-selected, and which require institutional approval? Note the Emergent flow always assigns `student`, so the two paths disagree.

**Q12 — Session tokens are returned in the response body.**
All three login flows return `session_token` in JSON alongside the httpOnly cookie (REQ-COHEIR-007, E5), and the download endpoint accepts one as a query parameter (E4). Is a non-cookie client planned, or should both be removed?

**Q13 — The AIAH fallback fabricates ecosystem signals.**
When the model is unreachable it emits specific-sounding claims about ANCRLAB velocity and ANCRSync density that are computed from nothing (REQ-COHEIR-072, E9). Should the fallback state plainly that no analysis was performed, and should the response carry a flag so the UI can distinguish it?

**Q14 — Review notifications claim an ANCRID update that does not happen.**
The notification body reads "Your ANCRID™ has been updated with a new Professional Review" while nothing outside this database changes (REQ-COHEIR-031, G3). Should the copy change, or is this the first integration to build?

**Q15 — Sessions are read-only.**
The spec's central mentorship artefact cannot be booked, joined, attended, noted or recorded (REQ-COHEIR-028, G5), yet the spec also requires completed sessions to emit Creator Passport events (G4). What is the minimum session lifecycle for v1?

**Q16 — Expired sessions are never deleted.**
`_get_session` rejects them but leaves the rows (REQ-COHEIR-014). Should a TTL index be added to `user_sessions`?

**Q17 — Institution analytics loads ~5,700 documents per request.**
And is available to any authenticated user (REQ-COHEIR-076, 078). Should it be role-gated, and should the aggregation move into Mongo?

**Q18 — Dead code paths.**
`provider_prefs` is written and never read, `VIEW_CATEGORIES` is declared and unused, and the `upcoming` session parameter is accepted and ignored (E10). Should these be wired up or removed?

**Q19 — Portfolio assets live here, contrary to the spec.**
§05 states COHEIR does not own portfolio assets, but files are uploaded to and served from COHEIR's own storage (G14). Should uploads move to ANCRLAB or ANCRMEDIA with COHEIR holding references?
