# VIERATA — Functional Requirements

**App folder:** `ANCR-VIERATA`
**APPNAME:** `VIERATA` *(the product itself is branded **VIEARTA™** — see the naming note below)*
**Derived from:** `backend/{server,lifestyle,programs,viea}.py` (3,171 lines, 105 routes), `frontend/src/**`
**Stack observed:** FastAPI + Motor/MongoDB; bcrypt + JWT (HS256) bearer; Claude via Emergent key; Open Food Facts + ZXing barcode; React + React Router + axios
**Date of extraction:** 2026-09-03

> **Naming.** The folder is `ANCR-VIERATA`; every source file, the FastAPI title (`VIEARTA API`), the specification and the UI use **VIEARTA™**. `VIERATA` and `VIEARTA` are transpositions of one another. Requirement ids use `REQ-VIERATA-###` per the folder-derived naming instruction, but the product name is VIEARTA.

---

## 1. FUNCTIONAL REQUIREMENTS

### 1.1 Authentication

**REQ-VIERATA-001**
**Given** `POST /api/auth/register`
**When** the email already exists
**Then** it raises **400 `"Email already registered"`**; otherwise a user is created with a bcrypt hash, a generated `ANCRID-{4 hex, upper}` identifier, **role fixed to `"student"`** and `is_demo: false`.

**REQ-VIERATA-002**
**Given** a registration payload
**When** the role is considered
**Then** **`role` is not accepted from the request body at all** — it is hard-coded to `"student"` in the handler. Public self-registration cannot produce an admin, unlike VAULTA, COHEIR and ANCRMEDIA.

**REQ-VIERATA-003**
**Given** registration input
**When** validated
**Then** `RegisterIn` requires a valid email, a password, first and last name, and an optional discipline defaulting to `"Creator"`. **There is no password strength rule and no rate limiting.**

**REQ-VIERATA-004**
**Given** `POST /api/auth/login`
**When** the email is unknown or the password wrong
**Then** both raise **401 `"Invalid email or password"`** — no user enumeration.

**REQ-VIERATA-005**
**Given** a successful authentication
**When** the token is minted
**Then** the JWT carries `sub`, `email`, `iat`, `exp` at **7 days** and `type: "access"`, signed HS256.

**REQ-VIERATA-006**
**Given** a protected endpoint
**When** `get_current_user` runs
**Then** the `Authorization: Bearer` header is read first, falling back to an `access_token` cookie; a missing token raises **401 `"Not authenticated"`**, expiry **401 `"Token expired"`**, any other JWT error **401 `"Invalid token"`**, and an unknown `sub` **401 `"User not found"`**. **The user document is re-read on every request**, so a role change takes effect immediately.

**REQ-VIERATA-007**
**Given** `POST /api/auth/logout`
**When** called
**Then** it requires authentication and returns `{"ok": true}`. **No token is invalidated server-side** — logout is client-side only.

**REQ-VIERATA-008**
**Given** the application
**When** a user looks for account recovery
**Then** **there is no password reset, password change or email verification.**

### 1.2 Role enforcement

**REQ-VIERATA-009**
**Given** `require_admin`
**When** it evaluates
**Then** a user whose `role` is not exactly `"admin"` raises **403 `"Admin only"`**.

**REQ-VIERATA-010**
**Given** the administrative surfaces
**When** they are inspected
**Then** `require_admin` **is applied** to student listing, aggregate analytics, consented reflections, media create/update/delete, circle join-URL configuration, and playlist create/update/delete/add/remove — **14 endpoints in total**. This is the only application in the workspace whose role helper is both implemented and consistently wired.

**REQ-VIERATA-011**
**Given** every non-admin endpoint across `lifestyle.py` (36 routes) and `programs.py` (54 routes)
**When** they are called
**Then** each depends on `get_current_user` and scopes its queries to `user["id"]` — a consistent per-user isolation pattern.

### 1.3 Daily check-in

**REQ-VIERATA-012**
**Given** `POST /api/checkins`
**When** called
**Then** the document is **upserted on `{user_id, date}`**, enforcing **one check-in per user per day**; a second submission for the same date overwrites rather than duplicating.

**REQ-VIERATA-013**
**Given** a check-in
**When** it is stored
**Then** it captures an `arriving` block (energy, body, mind on a 1–5 scale), a `snapshot` block (stress level, sleep hours, hydration glasses, body discomfort, voice condition) and a `creative_demand` list.

**REQ-VIERATA-014**
**Given** `GET /api/checkins/today`
**When** no check-in exists for today
**Then** it returns **`null`** rather than a 404 — the client distinguishes "not yet checked in" from an error.

**REQ-VIERATA-015**
**Given** `GET /api/checkins/week`
**When** called
**Then** the caller's trailing week of check-ins is returned, scoped to their own `user_id`.

### 1.4 Recommendations

**REQ-VIERATA-016**
**Given** `GET /api/recommendations`
**When** it runs
**Then** `build_recommendations` selects from a fixed `REC_LIBRARY` using **deterministic rules only** — no model is invoked. The docstring notes it is "structured so an AI layer can wrap this later".

**REQ-VIERATA-017**
**Given** the creative-demand signals
**When** they are evaluated
**Then** `live_performance`/`audition` add breath, vocal warm-up and hydration; `studio` adds hearing protection and posture; `rehearsal` adds warm-up and recovery; `writing`/`editing` add focus and movement; `shoot` adds hydration and posture; `class` adds focus; `travel` adds hydration and movement; `rest` adds sleep prep and a mind pause.

**REQ-VIERATA-018**
**Given** a check-in exists
**When** its values are evaluated
**Then** stress ≥ 4 **or** arriving mind ≤ 2 adds a mind pause and focus; sleep < 6 hours adds sleep prep; hydration < 3 glasses adds hydration; body discomfort ≥ 4 **or** arriving body ≤ 2 adds posture, movement and recovery; arriving energy ≤ 2 adds movement; and voice condition ≤ 3 adds vocal warm-up and hydration.

**REQ-VIERATA-019**
**Given** the discipline string
**When** it is matched
**Then** vocal/singer/song adds a vocal warm-up, produce/engineer adds hearing protection, and dance adds movement and recovery.

**REQ-VIERATA-020**
**Given** the candidate list
**When** it is finalised
**Then** duplicates are removed preserving order, the result is truncated to **exactly three**, and if fewer than three were selected the library is walked to backfill. An empty selection falls back to focus, hydration and sleep prep — **the endpoint always returns three recommendations and never an empty list**.

**REQ-VIERATA-021**
**Given** the recommendation output
**When** it is returned
**Then** each carries a title, body, category and `duration_minutes`. **No recommendation diagnoses, scores or ranks the user** — consistent with the product's non-competitive principle.

### 1.5 Consent and privacy

**REQ-VIERATA-022**
**Given** `GET /api/consent`
**When** called
**Then** the caller's own consent document is returned.

**REQ-VIERATA-023**
**Given** `PUT /api/consent`
**When** called
**Then** non-null fields are merged over the existing document and upserted, scoped to the caller. **A consent flag cannot be cleared by sending null** — only by sending `false`.

**REQ-VIERATA-024**
**Given** a demo user is seeded
**When** consent is initialised
**Then** all three flags — `share_wellness_with_mentor`, `share_reflections_with_mentor`, `share_habits_with_mentor` — are set to **`False`**, under an in-code comment reading "Default consent (student privacy first)".

**REQ-VIERATA-025**
**Given** `GET /api/admin/aggregate`
**When** an admin calls it
**Then** it computes seven-day averages for energy, stress and sleep across all check-ins, plus per-discipline averages with an `n` count, and returns `students_active` as a **distinct user count**. The docstring states "No PII returned" and the response carries the literal notice `"Aggregate view. No individual data is exposed."`

**REQ-VIERATA-026**
**Given** the aggregate response
**When** it is inspected
**Then** **no user id, name, email or ANCRID appears in it** — only discipline labels, averages and counts. The per-discipline bucket for a discipline with a single student would nonetheless reveal that student's exact averages; **no minimum-cohort suppression is applied**.

**REQ-VIERATA-027**
**Given** `GET /api/admin/consented-reflections`
**When** an admin calls it
**Then** it first queries `viearta_consent` for `share_reflections_with_mentor: True`, and **only** the resulting user ids are used to fetch nutrition reflections, affirmation reflections and journal entries. A student who has not opted in contributes nothing, and an empty consent set returns an empty list without querying any reflection collection.

**REQ-VIERATA-028**
**Given** the consented-reflections response
**When** identities are attached
**Then** only `first_name`, `ancrid` and `discipline` are included — **not email, not last name**.

**REQ-VIERATA-029**
**Given** `GET /api/admin/students`
**When** an admin calls it
**Then** all student users are returned with `password_hash` projected out. **This is the one admin surface that returns per-student records rather than aggregates**, and it is not gated on consent.

### 1.6 Wellness Circles

**REQ-VIERATA-030**
**Given** a circle's messages or attendees
**When** a non-admin without an RSVP attempts to view or post
**Then** it raises **403 `"RSVP required to view or post in this circle"`** — an admin bypasses this check.

**REQ-VIERATA-031**
**Given** the attendee list
**When** it is rendered
**Then** attendees are shown only when the caller is a member **or** an admin.

**REQ-VIERATA-032**
**Given** a circle message deletion
**When** the caller is neither the message author nor an admin
**Then** it raises **403 `"Not your message"`**.

**REQ-VIERATA-033**
**Given** `PUT` on a circle join URL
**When** called
**Then** it requires admin, and the supplied URL is validated against an allowed scheme before storage.

### 1.7 Lifestyle modules

**REQ-VIERATA-034**
**Given** the lifestyle router (36 routes)
**When** its surfaces are used
**Then** they cover nutrition and meal logging, macro tracking, hydration, mindfulness, affirmations with optional reflections, movement, and a barcode lookup — each scoped to the caller.

**REQ-VIERATA-035**
**Given** the barcode lookup
**When** it runs
**Then** it queries the **public Open Food Facts API with no key**, and decoding is performed client-side by ZXing.

**REQ-VIERATA-036**
**Given** the nutrition surfaces
**When** they present information
**Then** per the product principle they are educational — **the specification prohibits calorie or macro targets for weight loss or gain**, and the Viea assistant enforces the same rule at the model boundary (REQ-VIERATA-040).

### 1.8 Programs modules

**REQ-VIERATA-037**
**Given** the programs router (54 routes)
**When** its surfaces are used
**Then** they cover My Wellness, Learning pathways and lessons, Performance, Recovery, Wellness Circles, Support messaging, journal entries, habits, media library, playlists and the admin views — each scoped to the caller or gated on admin.

**REQ-VIERATA-038**
**Given** `GET`/`POST /api/support/messages`
**When** called
**Then** a student can send to and read their own support thread; the specification assigns escalation ownership to the institution.

### 1.9 Viea AI assistant

**REQ-VIERATA-039**
**Given** `POST /api/viea/message`
**When** `EMERGENT_LLM_KEY` is absent
**Then** it raises **500 `"Viea is temporarily unavailable — LLM key missing"`** — an explicit configuration pre-check with no fabricated fallback.

**REQ-VIERATA-040**
**Given** the Viea system prompt
**When** it is composed
**Then** it enforces: educational only, never medical, therapeutic, nutrition-clinical or emergency care; never diagnose or promise outcomes; **never provide calorie or macro targets for weight change, restrictive eating advice, extreme exercise programming or supplement dosing**; never shame, rank or compare users; route crisis language to 988 and 911 plus the Support page; **never invent VIEARTA features**; **never share, reference or invent other users' data**.

**REQ-VIERATA-041**
**Given** a message is sent
**When** the request is handled
**Then** the **user turn is persisted before the model is called**, the session id is `viea-{user_id}` (per-user continuity), and the prompt is personalised with the caller's first name, discipline and ANCRID only.

**REQ-VIERATA-042**
**Given** the user's input text
**When** it is evaluated **server-side**
**Then** `CRISIS_RE` matches suicidal ideation, self-harm, breathing difficulty, chest pain, overdose, anaphylaxis, stroke, heart attack, purging and starvation language, and `MEDICAL_ADVICE_RE` matches diagnosis, prescription, treatment and weight-loss-calorie requests.

**REQ-VIERATA-043**
**Given** a crisis match
**When** the reply is assembled
**Then** the **crisis footer is appended regardless of what the model produced** — 988, 911 and the Support page — unless already present. A medical match appends the professional-referral footer instead. The in-code comment describes this as "belt-and-suspenders over the system prompt": **the safety routing does not depend on model compliance.**

**REQ-VIERATA-044**
**Given** the stored assistant message
**When** it is written
**Then** it carries a `flags` object recording `{crisis, medical}` — the safety classification is retained as an auditable record.

**REQ-VIERATA-045**
**Given** the model call raises
**When** the exception is caught
**Then** it raises **502 `"Viea couldn't respond just now: {error}"`** — a genuine error rather than fabricated wellness content. **The exception text is echoed to the client.**

**REQ-VIERATA-046**
**Given** `GET /api/viea/history`
**When** called
**Then** up to 100 of the caller's own messages are returned in chronological order, scoped to `user_id`.

**REQ-VIERATA-047**
**Given** `DELETE /api/viea/history`
**When** called
**Then** **all of the caller's own Viea messages are deleted** — a user-initiated erasure path for the most sensitive conversational data in the application.

**REQ-VIERATA-048**
**Given** the model client
**When** it is constructed
**Then** it uses `.with_model("anthropic", "claude-sonnet-5")` — the module docstring reads "Uses Claude Sonnet 5 via Emergent LLM key". **This differs from every other application in the workspace**, which use `claude-sonnet-4-5-20250929` (or `claude-sonnet-4-6` in ANCR Passport).

**REQ-VIERATA-049**
**Given** the message input
**When** validated
**Then** `VieaMessageIn.text` requires 1–4,000 characters, bounding both empty submissions and prompt size.

### 1.10 Platform

**REQ-VIERATA-050**
**Given** `GET /api/rotating-message`, `/api/events/upcoming` and `/api/learning/summary`
**When** called
**Then** each returns dashboard support content scoped to the caller where applicable.

**REQ-VIERATA-051**
**Given** `GET /api/ancr/status`
**When** called
**Then** it documents the ANCR integration boundary for SSO, notifications, video rooms and shared media storage. **The specification labels ANCR SSO "Stubbed / future activation"** — the endpoint describes the contract rather than reporting a live connection.

---

## 2. TEST COVERAGE

**Test assets found** — 9 suites totalling **119 test functions**, plus **10 recorded pytest XML reports**.

| Suite | Tests |
|---|---|
| `test_programs.py` | 30 |
| `test_lifestyle.py` | 29 |
| `test_iteration7.py` | 18 |
| `backend_test.py` | 12 |
| `test_media_chat.py` | 9 |
| `test_viea.py` | 9 |
| `test_join_url_scheme.py` | 6 |
| `test_regex_fix.py` | 4 |
| `test_focused_fixes.py` | 2 |

**Recorded runs — every one green**

| Report | Tests | Failures | Timestamp |
|---|---|---|---|
| `pytest_results.xml` | 12 | 0 | 2026-07-31 19:32 |
| `lifestyle_results.xml` | 41 | 0 | 2026-07-31 20:38 |
| `programs_results.xml` | 47 | 0 | 2026-07-31 22:27 |
| `iteration_4.xml` | 90 | 0 | 2026-07-31 22:33 |
| `iteration_5_media.xml` | 13 | 0 | 2026-07-31 22:52 |
| `iteration_5_full.xml` | 103 | 0 | 2026-07-31 22:52 |
| `iteration_6.xml` | 107 | 0 | 2026-07-31 23:00 |
| `iteration_7.xml` | 18 | 0 | 2026-07-31 23:45 |
| `iteration_8.xml` | 135 | 0 | 2026-07-31 23:51 |
| **`iteration_9.xml`** | **144** | **0** | **2026-08-01 00:07** |

**144/144 passing, with no failure recorded in any of the ten runs.** The specification's claim of "144/144 backend tests passing" is **supported by the artefact**. Only CYNAIAH (222) has a larger green suite.

| Requirement | Covered | Evidence / gap |
|---|---|---|
| REQ-VIERATA-001, 004, 005 | **Yes** | `backend_test.py` covers register, duplicate rejection, login and the 401 |
| REQ-VIERATA-002 | **Partial** | Registration is exercised; **that `role` is ignored from the body is not asserted** — though the handler makes escalation impossible by construction |
| REQ-VIERATA-003 | **No** | Absent password rules and rate limiting are untested |
| REQ-VIERATA-006 | **Yes** | The specification records "JWT 401 enforcement" as a security regression suite; `backend_test.py` asserts protected-route 401s |
| REQ-VIERATA-007, 008 | **No** | Logout semantics and absent recovery are untested |
| REQ-VIERATA-009, 010 | **Yes** | The specification records consent gating and admin enforcement in the security regression set; `test_programs.py` covers admin 403s |
| REQ-VIERATA-011 | **Yes** | "cross-user privacy" is named as a security regression area, and `test_lifestyle.py` / `test_programs.py` exercise user scoping |
| REQ-VIERATA-012 – 015 | **Yes** | `backend_test.py` covers check-in upsert, today (including the null case) and week |
| REQ-VIERATA-016 – 021 | **Partial** | Recommendations are exercised for shape and the always-three guarantee; **the individual demand, check-in and discipline rules are not asserted branch by branch** |
| REQ-VIERATA-022 – 024 | **Yes** | `test_programs.py` covers consent read/write; the privacy-first defaults are seeded and exercised |
| REQ-VIERATA-025, 026 | **Yes** | `test_programs.py` covers the aggregate. **Small-cohort re-identification (026) is not tested** |
| REQ-VIERATA-027, 028 | **Yes** | Consent gating on reflections is explicitly named as a regression area and covered |
| REQ-VIERATA-029 | **Partial** | Admin student listing is covered; that it is not consent-gated is not challenged |
| REQ-VIERATA-030 – 032 | **Yes** | `test_programs.py` covers RSVP gating and message ownership |
| REQ-VIERATA-033 | **Yes** | `test_join_url_scheme.py` (6 tests) is dedicated to URL scheme validation |
| REQ-VIERATA-034 – 036 | **Yes** | `test_lifestyle.py` (29 tests) covers nutrition, macros, hydration, mindfulness, affirmations, movement and barcode |
| REQ-VIERATA-037, 038 | **Yes** | `test_programs.py` (30 tests) plus `test_media_chat.py` (9) |
| REQ-VIERATA-039 | **No** | The missing-key 500 path is untested |
| REQ-VIERATA-040 | **Partial** | Prompt content cannot be asserted directly; the specification notes AI safety routing is tested "independent of model wording" |
| REQ-VIERATA-041 | **Yes** | `test_viea.py` covers persistence and history |
| REQ-VIERATA-042, 043 | **Yes** | `test_regex_fix.py` (4 tests) and `test_viea.py` cover crisis and medical detection **and the deterministic footer append** — the release gate requires "AI safety routing passes deterministic tests independent of model wording" |
| REQ-VIERATA-044 | **Partial** | The flags object is written; its persistence is not separately asserted |
| REQ-VIERATA-045 | **No** | The 502 path and its echoed exception text are untested |
| REQ-VIERATA-046, 047 | **Yes** | `test_viea.py` covers history read and clear |
| REQ-VIERATA-048 | **No** | The model string is never asserted |
| REQ-VIERATA-049 | **Partial** | Input bounds are enforced by Pydantic; the 422 is not asserted |
| REQ-VIERATA-050, 051 | **Partial** | Dashboard endpoints are exercised; the ANCR status boundary is not asserted |

**Summary:** 51 requirements. **31 Yes**, **11 Partial**, **9 No**. Alongside CYNAIAH, this is the best-verified application in the workspace — and uniquely, its test suite covers the things that actually matter for its domain: cross-user privacy, consent gating, and **deterministic AI safety routing tested independently of model wording**.

---

## 3. SPEC GAP ANALYSIS

**Specs compared:** `VIEARTA_Product_Technical_Specification.pdf` (23 pp., v1.0 July 2026, "Feature-complete standalone application; integration-ready"), `VIEARTA_Workflow.pdf`, `memory/PRD.md`.

> Like CYNAIAH and ANCR Passport, this specification is candid about its own boundaries. §1.2 lists ANCR SSO as "Documented handshake; activation pending" and media object storage as "Future integration". §14 carries an explicit technical-debt table. Most gaps below are therefore declared.

### (a) Specified but NOT implemented in code

| # | Spec source | Requirement | Code state | Spec's own label |
|---|---|---|---|---|
| G1 | §9 Integrations; §14 P1 | **ANCR SSO** — eliminate separate sign-in, map ANCRID claims to VIEARTA roles without duplicating identities | Local bcrypt/JWT with its own user store; `ancrid` is a locally generated `ANCRID-{4 hex}` string, not an ANCRID-issued identifier (REQ-VIERATA-001) | **Declared** "Stubbed / future activation", P1 |
| G2 | §9; §14 P1 | **Managed object storage** for direct MP4/MP3 uploads | URL-based media only; no upload endpoint | **Declared** "Future", P1 |
| G3 | §14 P1 | **Load real VIEARTA content** — replace written-only placeholders with owned or licensed media | Media items are URL references to placeholder content | **Declared** P1 |
| G4 | §14 P1 | **AI-personalised dashboard recommendations** layered on the deterministic rules | Recommendations are purely rule-based; no model is invoked (REQ-VIERATA-016) | **Declared** P1 — and the code is explicitly structured for it |
| G5 | §9 | **ANCR Notifications** — cross-app reminders and alerts | No notification generation or delivery exists | **Declared** "Documented handoff" |
| G6 | §9 | **ANCRSYNC** circle video-room launch | A validated join URL is stored and launched (REQ-VIERATA-033); no deeper integration | **Declared** "Partially integrated" |
| G7 | §3 Roles | **Program mentor** — "reserved role for future consented views and circle facilitation" | Only `student` and `admin` exist in the `UserPublic` role literal; there is no mentor role | **Declared** "Reserved role for future" |
| G8 | §13.1 Pre-Production | Rotate demo credentials, strong production JWT secret, approved CORS origins, **HTTPS-only cookies/token strategy** | Not present in this folder | **Declared** pre-production requirement |
| G9 | §13.1 | Privacy, accessibility, security and legal review for the actual institution and jurisdictions | Not present | **Declared** pre-production requirement |
| G10 | §13.1 | Confirm rights, **captions, transcripts and accessibility metadata** on approved media | The media model carries no caption, transcript or accessibility field | **Declared** pre-production requirement |

**Undeclared gaps:**

| # | Spec claim | Code state |
|---|---|---|
| U1 | §3 Roles — Program admin's **prohibited** access includes "private journals, unshared habits, meals, calorie totals, or AI conversations" | Correctly enforced for reflections and journals via consent gating (REQ-VIERATA-027). **However `GET /api/admin/students` returns full per-student user records with no consent gate** (REQ-VIERATA-029). That is roster data rather than wellness data, so it may be intended — but the spec's prohibition list does not address it either way. |
| U2 | §10 Privacy — "Aggregated **anonymized** patterns" | The aggregate returns no PII (REQ-VIERATA-025), but **per-discipline buckets have no minimum-cohort suppression** (REQ-VIERATA-026). A discipline with one active student exposes that student's exact seven-day averages under a discipline label the admin can trivially resolve. |
| U3 | §1.2 status table lists the model as a "Configured Claude model via emergentintegrations" | The code requests `claude-sonnet-5` (REQ-VIERATA-048) while eleven other apps in this workspace request `claude-sonnet-4-5-20250929` and ANCR Passport requests `claude-sonnet-4-6`. **No specification pins a version**, so the divergence is invisible to review. |

### (b) Implemented but NOT mentioned in the spec

| # | Code feature | Spec status |
|---|---|---|
| E1 | **Server-side crisis and medical-advice regex with unconditional footer append** (REQ-VIERATA-042, 043). | §10 requires that "crisis language receives immediate emergency and human-support routing" and §12.1 requires deterministic safety tests — but the **mechanism** (a server-side classifier that appends the footer regardless of model output) is an implementation decision not described in the spec. It is the strongest AI-safety pattern in this workspace and deserves to be written down as the ecosystem standard. |
| E2 | **`flags: {crisis, medical}` persisted on every assistant message** (REQ-VIERATA-044). | Unspecified. It creates an auditable record of safety classifications — valuable for an institution, and worth an explicit retention policy. |
| E3 | **`DELETE /api/viea/history`** — user-initiated erasure of all AI conversation data (REQ-VIERATA-047). | Unspecified. It is a genuine data-subject right implemented ahead of the privacy review §13.1 requires. |
| E4 | **Role hard-coded to `student` at registration** (REQ-VIERATA-002). | Unspecified, and notably safer than VAULTA, COHEIR and ANCRMEDIA, all of which accept a role from the request body. |
| E5 | **`build_recommendations` always returns exactly three** items with a backfill loop (REQ-VIERATA-020). | Unspecified. The always-three guarantee is a UI contract established in the backend. |
| E6 | **Consent defaults to all-false on seed** (REQ-VIERATA-024). | §2.2 states "Private by default" as a principle; the seeded implementation of it is not specified but correctly realises it. |

---

## 4. UNCLEAR / NEEDS INPUT

**Q1 — Small-cohort re-identification in the admin aggregate.**
Per-discipline averages carry an `n` count but **no minimum-cohort suppression** (REQ-VIERATA-026, U2). If one dancer checked in this week, the "Dance" bucket is that student's exact energy, stress and sleep averages, labelled. Should buckets below a threshold (5? 10?) be suppressed or merged into "Other"?

**Q2 — `GET /api/admin/students` is not consent-gated.**
It returns full student records to any admin (REQ-VIERATA-029, U1). The spec's prohibition list covers journals, habits, meals, calories and AI conversations but is silent on roster data. Is a full student list appropriate for a program admin, and which fields should it carry?

**Q3 — Which Claude model?**
This app requests `claude-sonnet-5`; CYNAIAH, COHEIR, INHEIRA, ANCRA, ANCRD, ANCRSYNC and VAULTA request `claude-sonnet-4-5-20250929`; ANCR Passport requests `claude-sonnet-4-6`; ANCRSHOP requests an OpenAI model (REQ-VIERATA-048, U3). I have reported the literal strings without judging validity. Should the ecosystem pin one model per environment, and does the wellness-safety context warrant a specific choice?

**Q4 — Consent flags cannot be cleared with null.**
`PUT /api/consent` merges only non-null fields (REQ-VIERATA-023), so withdrawal requires sending `false` explicitly. Does the UI always send the full object? If it sends a partial patch omitting a flag, prior consent silently persists — which for a wellness product is the wrong failure direction.

**Q5 — Consent withdrawal is not retroactive.**
`GET /api/admin/consented-reflections` filters at read time, so withdrawing consent removes future access (REQ-VIERATA-027). But nothing records that an admin already read a reflection, and nothing notifies the student that their data was accessed. Should access be logged, and should students see who viewed what?

**Q6 — Viea history has no retention limit.**
Messages persist indefinitely with `crisis`/`medical` flags attached (REQ-VIERATA-044, 046). Manual erasure exists (REQ-VIERATA-047), but no automatic retention policy does. What is the retention period, and does a flagged crisis message warrant different handling — for example, institutional escalation or longer retention for duty-of-care reasons?

**Q7 — Crisis detection triggers a footer but no human escalation.**
`CRISIS_RE` appends emergency resources and stores a flag, but **no staff member is notified** (REQ-VIERATA-043, 044). §2.2 names "Human escalation" as a product principle and §13.2 assigns escalation practices to the program team. Should a flagged crisis message create a support-inbox entry or alert, and who owns the response-time expectation?

**Q8 — The 502 echoes the provider exception.**
`"Viea couldn't respond just now: {e}"` returns the raw error text (REQ-VIERATA-045). Should this be a generic message with the detail logged server-side?

**Q9 — No rate limiting on login.**
CYNAIAH and ANCRSHOP both implement lockout; this app has none (REQ-VIERATA-003). Given the data sensitivity, should CYNAIAH's pattern be adopted?

**Q10 — No password strength rule.**
Any password is accepted (REQ-VIERATA-003). CYNAIAH enforces 8 characters with a letter and a digit. Should that be adopted?

**Q11 — 7-day tokens with no revocation.**
Logout is client-side only (REQ-VIERATA-007). Should a shorter TTL plus refresh land before, or as part of, the ANCR SSO activation (G1)?

**Q12 — Product name: VIERATA or VIEARTA?**
The folder is `ANCR-VIERATA`; everything else is `VIEARTA`. The ecosystem overview lists it as VIERATA. Which spelling is canonical, and should the folder be renamed to match the product before deployment automation attaches to the current name — the same class of issue already recorded for `ANCR-ANCRSYNC-`?

**Q13 — Media accessibility metadata.**
§13.1 requires captions, transcripts and accessibility metadata on approved media, and the media model carries no such fields (G10). Should they be added now so content can be loaded correctly the first time?
