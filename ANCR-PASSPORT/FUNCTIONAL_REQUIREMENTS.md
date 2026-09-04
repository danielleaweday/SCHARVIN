# PASSPORT — Functional Requirements

**App folder:** `ANCR-PASSPORT`
**APPNAME:** `PASSPORT`
**Derived from:** `backend/{server,seed_data,music_data}.py` (1,721 lines, 46 routes), `frontend/src/**`
**Stack observed:** FastAPI + Motor/MongoDB; **no authentication**; Claude via Emergent key; React + React Router + axios + TanStack Query
**Date of extraction:** 2026-09-03

> **Naming.** This is **ANCR Passport™** — the global creative-mobility and cultural-intelligence product. It is a distinct product from **Creator Passport™**, the verified professional record owned by ANCRID. The two are separate concerns that share a word; `docs/ANCR_ECOSYSTEM_OVERVIEW.md` records this as an open naming conflict.

---

## 1. FUNCTIONAL REQUIREMENTS

### 1.1 Identity model

**REQ-PASSPORT-001**
**Given** the backend module loads
**When** `UID = "maya"` is evaluated
**Then** a single hard-coded user identifier is bound at import time. **Every one of the 46 endpoints operates as that user.**

**REQ-PASSPORT-002**
**Given** any request to any endpoint
**When** it is handled
**Then** **no authentication is performed** — there is no login, no token, no session, no cookie, no `Depends` dependency and no `Authorization` header handling anywhere in the application. Every route is anonymously callable.

**REQ-PASSPORT-003**
**Given** `GET /api/me`
**When** called
**Then** the seeded Maya user document is returned regardless of caller.

**REQ-PASSPORT-004**
**Given** `PUT /api/me/role`
**When** called with a `role`
**Then** the value is written to the single Maya user document and the updated user returned. **This is unauthenticated role switching** — the specification describes it as a demonstration affordance.

**REQ-PASSPORT-005**
**Given** every user-scoped collection query
**When** it is built
**Then** it filters on `{"user_id": UID}` — a consistent scoping pattern that would become correct once `UID` is replaced by a session-derived identity, but which today resolves to one shared account.

### 1.2 Seeding

**REQ-PASSPORT-006**
**Given** the application starts
**When** `seed()` runs on the `startup` event
**Then** `destinations`, `courses` and `network` are **deleted and re-inserted on every boot** — static content is always refreshed and any runtime modification to them is discarded.

**REQ-PASSPORT-007**
**Given** the same seed run
**When** user-scoped collections are considered
**Then** the Maya user, `trips`, `checklist` items and the single `classroom` document are inserted **only if absent** — user progress survives a restart while static content does not.

### 1.3 Dashboard, destinations and saved items

**REQ-PASSPORT-008**
**Given** `GET /api/dashboard`
**When** called
**Then** it composes the user, checklist progress, and related trip and readiness data into one payload.

**REQ-PASSPORT-009**
**Given** `GET /api/destinations`
**When** called
**Then** all destinations are returned, each annotated with whether it appears in the user's saved list.

**REQ-PASSPORT-010**
**Given** `GET /api/destinations/{dest_id}`
**When** the id is unknown
**Then** it raises **404 `"Destination not found"`**; otherwise the destination is returned with its saved state.

**REQ-PASSPORT-011**
**Given** `POST /api/destinations/{dest_id}/save`
**When** called
**Then** it **toggles**: an existing save is removed, otherwise one is inserted with a timestamp. The destination id is not validated against an existing destination on the save path.

### 1.4 Culture School

**REQ-PASSPORT-012**
**Given** `GET /api/courses`
**When** called
**Then** all courses are returned with the user's progress attached.

**REQ-PASSPORT-013**
**Given** `GET /api/courses/{course_id}`
**When** the id is unknown
**Then** it raises **404 `"Course not found"`**.

**REQ-PASSPORT-014**
**Given** `POST /api/courses/{course_id}/complete-lesson`
**When** the supplied `lesson_id` is not among that course's lessons
**Then** it raises **400 `"Unknown lesson for this course"`** — the lesson is validated against the parent course.

**REQ-PASSPORT-015**
**Given** a valid lesson completion
**When** progress is updated
**Then** the stored completed set is **intersected with the course's current valid lesson ids** before the new one is added, so lessons removed from a course during a reseed drop out of progress rather than inflating it.

**REQ-PASSPORT-016**
**Given** every lesson in a course is complete
**When** the update runs
**Then** `certificate` and `badge_earned` are set true and a `badges` record is inserted — **guarded so a badge is awarded only once per course**. The response returns the completion percentage.

### 1.5 Travel readiness checklist

**REQ-PASSPORT-017**
**Given** `GET /api/checklist`
**When** called with an optional `discipline`
**Then** items are filtered to those with **no discipline** or a matching one, defaulting to the user's own discipline; the response includes the item list, categories, discipline options, a completion percentage, done and total counts, and a disclaimer.

**REQ-PASSPORT-018**
**Given** the checklist has no items after filtering
**When** the percentage is computed
**Then** it is 0 rather than raising a division error.

**REQ-PASSPORT-019**
**Given** `PATCH /api/checklist/{item_id}`
**When** called
**Then** non-null fields among `done`, `due_date`, `reminder` and `document` are `$set`. **A field cannot be cleared by sending null**, and an unknown item id silently no-ops before returning `null`.

### 1.6 Translation (AI)

**REQ-PASSPORT-020**
**Given** any AI endpoint
**When** `EMERGENT_LLM_KEY` is absent
**Then** `llm_json` raises **503 `"AI is not configured on this server."`** — an explicit configuration pre-check, unlike most apps in this workspace.

**REQ-PASSPORT-021**
**Given** an AI call is made
**When** it runs
**Then** it is wrapped in `asyncio.wait_for` with a **55-second** timeout; a timeout raises **504 `"The AI took too long to respond. Please try again."`** and any other exception is logged and raised as **503 `"AI service is temporarily unavailable. Please try again shortly."`**. **No fabricated fallback content is ever returned** — a failure is reported as a failure.

**REQ-PASSPORT-022**
**Given** a model response
**When** it is parsed
**Then** a leading ``` fence and `json` label are stripped, `json.loads` is attempted, and on failure the first `{` to last `}` substring is retried; if that also fails it raises **502 `"Translation service returned unexpected format"`**.

**REQ-PASSPORT-023**
**Given** the model client is constructed
**When** the model is selected
**Then** it is `.with_model("anthropic", "claude-sonnet-4-6")` — **a different model string from every other application in this workspace**, which use `claude-sonnet-4-5-20250929`.

**REQ-PASSPORT-024**
**Given** `POST /api/translate`
**When** called
**Then** the model returns `translated`, `pronunciation`, `literal_note` and `formality` (casual/neutral/formal); the result is **persisted to `translations`** against the user and returned.

**REQ-PASSPORT-025**
**Given** `POST /api/translate/lyrics`
**When** called
**Then** the model returns the translation, a pronunciation guide, an `idioms` array of `{phrase, explanation}`, a **`flags` array noting language that may be offensive, misleading or culturally inappropriate**, approximate source and target syllable counts, and a phrasing/singability note.

**REQ-PASSPORT-026**
**Given** a lyric translation is returned
**When** the payload is assembled
**Then** a fixed `review_notice` is attached stating that AI-assisted translations should be reviewed by a fluent speaker or qualified cultural consultant before commercial release or public performance. Lyric translations are **not** persisted, unlike conversation translations.

**REQ-PASSPORT-027**
**Given** `GET`, `POST` and `DELETE /api/phrases`
**When** called
**Then** the user's saved phrase book is listed newest-first, added to, and deleted from.

### 1.7 Trips, Trip Mode and Safety

**REQ-PASSPORT-028**
**Given** `GET /api/trips` and `/trips/{trip_id}`
**When** called
**Then** trips are listed and read. **All trips are returned regardless of `user_id`** — the trips collection is not user-scoped on read.

**REQ-PASSPORT-029**
**Given** `GET /api/trip-mode`
**When** called
**Then** it returns data for the **hard-coded trip id `"tokyo-creative-exchange"`** — timezone, five essential phrases embedded as literals in the handler, itinerary, emergency numbers, embassy, currency, a cultural reminder and help options. **The trip is not selected by the user.**

**REQ-PASSPORT-030**
**Given** the Trip Mode payload
**When** it is returned
**Then** it carries the literal disclaimer `"Demonstration only — pressing help buttons does NOT contact real emergency services."`

**REQ-PASSPORT-031**
**Given** `GET /api/safety`
**When** called
**Then** it returns emergency numbers, embassy details, trusted contacts, the user's emergency contacts, help options, resources and the current location-sharing setting — again scoped to the hard-coded Tokyo trip — with the disclaimer `"Demonstration only — this build does not contact real emergency services and does not fabricate live warnings."`

**REQ-PASSPORT-032**
**Given** `PUT /api/safety/location-sharing`
**When** called
**Then** the boolean is upserted onto the user's settings and echoed back. **It defaults to `False`** when no setting exists, so location sharing is off until explicitly enabled — matching the specification's acceptance criterion.

**REQ-PASSPORT-033**
**Given** location sharing is enabled
**When** the setting is stored
**Then** **only the flag is recorded** — no consent record, no timestamp, no audit entry and no actual location data. There is no revocation log.

### 1.8 Network, journal and passport profile

**REQ-PASSPORT-034**
**Given** `GET /api/network`
**When** called with optional `type` and `q`
**Then** entries are filtered in Python — `type` by exact match with `"All"` treated as no filter, and `q` as a case-insensitive substring across name, city, country, genres and role — and each is annotated with the user's `connected` state.

**REQ-PASSPORT-035**
**Given** `POST /api/network/{network_id}/connect`
**When** called
**Then** it **toggles** the connection, returning `{"connected": true|false}`. The network id is not validated.

**REQ-PASSPORT-036**
**Given** `GET`, `POST` and `DELETE /api/journal`
**When** called
**Then** journal entries are listed newest-first, created with title, body, optional location, mood and trip id, and deleted scoped to the user.

**REQ-PASSPORT-037**
**Given** `GET /api/passport`
**When** called
**Then** the user profile is returned with earned badges hydrated against their courses.

**REQ-PASSPORT-038**
**Given** the `/documents` frontend route
**When** it renders
**Then** it presents document placeholders. **There is no document upload, storage or OCR endpoint in the backend** — the specification labels OCR as a simulated interface and a production backlog item.

### 1.9 Global Classroom

**REQ-PASSPORT-039**
**Given** `GET /api/classroom`
**When** called
**Then** the single seeded classroom document is returned.

**REQ-PASSPORT-040**
**Given** `POST /api/classroom/assignments`
**When** called
**Then** an assignment is added. **There is no faculty role check** — the caller is always Maya (REQ-PASSPORT-001), so the specification's faculty/student separation cannot be enforced.

**REQ-PASSPORT-041**
**Given** `GET /api/notifications`
**When** called
**Then** notifications are returned. **No action generates one** — the collection is read-only and seeded.

### 1.10 Global Music Compass

**REQ-PASSPORT-042**
**Given** `GET /api/music/overview`
**When** called
**Then** it returns a **stewardship notice**, an **audio notice** and the tradition count — the cultural-sensitivity framing is served before any content.

**REQ-PASSPORT-043**
**Given** `GET /api/music/traditions` and `/traditions/{tid}`
**When** called
**Then** tradition summaries or a full tradition are returned; an unknown id raises **404 `"Tradition not found"`**. Every single-tradition response re-attaches the stewardship and audio notices.

**REQ-PASSPORT-044**
**Given** `POST /api/music/compare`
**When** either tradition id is unknown
**Then** it raises **404 `"Tradition not found"`**; otherwise the model is prompted with an explicit instruction to **"Never claim two traditions are equivalent"** and to **"Emphasize where comparisons break down."**

**REQ-PASSPORT-045**
**Given** a comparison request
**When** the prompt is built
**Then** the model must return eleven keys — familiar concepts, similar-but-different pairs with notes, new vocabulary, pitch/tuning, rhythm/time, improvisation, rehearsal communication, ensemble hierarchy, listening, common mistakes and questions to ask — each string capped at 24 words and each array at 4 items. The stewardship notice is re-attached to the result.

**REQ-PASSPORT-046**
**Given** `POST /api/music/session-translate`
**When** called with an optional `tradition`
**Then** the tradition name is injected into the prompt as collaboration context, and the model returns the translation, transliteration, pronunciation, **`music_meaning`**, **`cultural_context`**, **`potential_misunderstanding`** and a **`respectful_alternative`** — a materially richer contract than the general translator.

**REQ-PASSPORT-047**
**Given** `GET /api/music/session-phrases`
**When** called with an optional `q`
**Then** the seeded rehearsal-phrase set is filtered by text or category substring.

**REQ-PASSPORT-048**
**Given** `GET /api/music/rhythms`, `/instruments`, `/comparisons`, `/classroom` and `/pathways/{pid}`
**When** called
**Then** each returns seeded reference content; rhythms re-attach the audio notice.

**REQ-PASSPORT-049**
**Given** `POST /api/music/rehearsal-plan`
**When** called
**Then** the model generates a plan from destination, tradition, discipline, role, engagement and optional repertoire, collaborators and dates.

**REQ-PASSPORT-050**
**Given** `POST /api/music/knowledge-translate`
**When** called
**Then** a musical instruction is translated into the idiom of a target tradition.

---

## 2. TEST COVERAGE

**Test assets found**
- `backend/tests/backend_test.py` — **46 test functions**.
- `test_reports/pytest/pytest_results.xml` — 46 tests, **6 failures**, 2026-08-19 17:57.
- `test_reports/pytest/pytest_results_it3.xml` — **46 tests, 0 failures**, 2026-08-19 19:48.
- `test_result.md` — protocol boilerplate only.
- **No frontend tests.**

> **Recorded run history.** The earlier run failed six tests, all with `500 Internal Server Error`: `test_translate_conversation`, `test_translate_lyrics`, `test_compare`, `test_session_translate`, `test_rehearsal_plan` and `test_knowledge_translate` — **every AI-backed endpoint**. The later run, two hours after, is **fully green at 46/46**. The failure signature (a uniform 500 across exactly the LLM routes, with no other test affected) is consistent with a transient provider or key problem rather than a code defect, and the subsequent green run supports that reading. **This has not been re-verified here.** The current `llm_json` helper raises 503/504 rather than 500 for provider failures, so a recurrence would now surface differently.

| Requirement | Covered | Evidence / gap |
|---|---|---|
| REQ-PASSPORT-001 – 005 | **Partial** | Every test calls unauthenticated and passes, which demonstrates the absence of auth; **it is never asserted as intended behaviour**, and role switching is not tested |
| REQ-PASSPORT-006, 007 | **Partial** | Data-returning tests imply seeding ran; **the destructive refresh of `destinations`/`courses`/`network` on every boot is not asserted** |
| REQ-PASSPORT-008 – 010 | **Yes** | Dashboard and destination listing/detail are covered, including the 404 |
| REQ-PASSPORT-011 | **Yes** | The save toggle is exercised |
| REQ-PASSPORT-012 – 016 | **Yes** | Course listing, detail, the 404, the invalid-lesson 400 and completion-to-badge are covered — the strongest domain coverage in this app |
| REQ-PASSPORT-017 – 019 | **Yes** | Checklist read with discipline filtering and patch are covered |
| REQ-PASSPORT-020 | **No** | **The missing-key 503 path is untested** |
| REQ-PASSPORT-021, 022 | **No** | Timeout, provider-failure and malformed-JSON branches are untested — and these are exactly the paths the earlier run tripped over |
| REQ-PASSPORT-023 | **No** | The model string is never asserted |
| REQ-PASSPORT-024 – 026 | **Yes** (green in `it3`) | `test_translate_conversation` and `test_translate_lyrics` — **both failed in the first run** |
| REQ-PASSPORT-027 | **Yes** | Phrase save/list/delete covered |
| REQ-PASSPORT-028 – 030 | **Partial** | Trips and trip-mode are exercised; **that trips are unscoped and trip-mode is hard-coded to one id is not challenged** |
| REQ-PASSPORT-031 – 033 | **Partial** | Safety read and the location-sharing toggle are covered; **the absent consent record is not** |
| REQ-PASSPORT-034 – 037 | **Yes** | Network filtering and toggle, journal CRUD, and the passport profile are covered |
| REQ-PASSPORT-038 | **No** | No document endpoint to test |
| REQ-PASSPORT-039 – 041 | **Partial** | Classroom read and assignment creation are covered; **the absent faculty check is not** |
| REQ-PASSPORT-042 – 048 | **Yes** (green in `it3`) | Music overview, traditions, the 404, comparisons, session phrases, rhythms and instruments are covered. `test_compare` and `test_session_translate` **failed in the first run** |
| REQ-PASSPORT-049, 050 | **Yes** (green in `it3`) | `test_rehearsal_plan` and `test_knowledge_translate` — **both failed in the first run** |

**Summary:** 50 requirements. **26 Yes**, **12 Partial**, **12 No**. Coverage of the deterministic domain logic — courses, badges, checklist, journal, network, phrases — is genuinely good, including negative paths. The gaps are the AI error branches (503/504/502), which is notable given those are precisely the endpoints that failed in the first recorded run.

---

## 3. SPEC GAP ANALYSIS

**Specs compared:** `ANCR_Passport_Product_Technical_Specification.pdf` (28 pp., v1.0, 2026-08-19, "Engineering Source of Truth"), `ANCR_Passport_Workflow_Reference.pdf`, `memory/PRD.md`.

> This specification is the most rigorous in the workspace. It carries a revision history with named approvers, a seven-status **Product-Readiness Matrix**, an explicit **Section 26 Demonstration Versus Production Status** listing what is legitimately simulated, and a **Section 27 Known Backlog**. It states plainly: *"The current prototype must not be labeled production-ready simply because it renders and its demonstration APIs respond."* Almost every gap below is therefore **declared by the specification**, not undisclosed.

### (a) Specified but NOT implemented in code

| # | Spec source | Requirement | Code state | Spec's own label |
|---|---|---|---|---|
| G1 | §8 ANCRID relationship; §18 | "Consumes session; **never presents its own login in production**"; real ANCRID SSO, RBAC, session management, account recovery | `UID = "maya"`, no auth of any kind (REQ-PASSPORT-001, 002) | **Declared** — §26 lists "Simulated ANCRID user" as appropriate for demonstration |
| G2 | §10 User Roles (8 roles) | Individual Creative, Professional, Team/Tour Manager, Student, Faculty, Program Administrator, Group Manager, Governance Reviewer, each with distinct permissions | A single free-text `role` string on one user, settable by an unauthenticated PUT, enforcing nothing (REQ-PASSPORT-004, 040) | **Declared** — "The demonstration supports role switching; production enforces role-based access control" |
| G3 | §18 Sensitive Data | "Sensitive-field masking; **no full passport numbers on general screens**" | No document storage exists at all, so nothing is stored to mask (REQ-PASSPORT-038) | **Declared** — Documents at "Designed → Demonstration Functional (masked demo data)" |
| G4 | §18 Consent & Retention | Consent records, data-retention rules, deletion, **location-sharing consent**, emergency-data permissions | Location sharing is a bare boolean with no consent record, timestamp or audit (REQ-PASSPORT-033) | **Partially declared** — §24 requires location sharing be "off by default, consent-based, revocable, **and logged**". Off-by-default and revocable hold; **consent-based and logged do not.** |
| G5 | §27 Backlog | Real OCR; authoritative legal, visa, health and safety feeds; live emergency and consular data; live events; maps and geolocation | None present; destination legal/health/safety content is seeded static data | **Declared** DEFERRED |
| G6 | §27 Backlog | Subscription billing; institutional tenant separation; production monitoring; security validation; formal accessibility audit | None present | **Declared** DEFERRED |
| G7 | §27 Backlog | **Practitioner and scholar review workflow**; reviewed and licensed musical audio | No review workflow exists. The stewardship and audio notices are served (REQ-PASSPORT-042) but there is no governance-reviewer role or content-classification path | **Declared** DEFERRED |
| G8 | §9 Dual Access Model | Two entry environments — ANCRA-embedded and commercial standalone — sharing one core, with student progress returned to ANCRA | **Neither entry path exists.** There is no ANCRA launch, no progress return and no subscription tier distinction | **Declared** — no ANCRA integration is claimed as built |
| G9 | §19 Accessibility | WCAG 2.2 AA alignment; keyboard navigation, focus, screen-reader labelling, contrast, reduced motion, captions, ARIA | Not assessable from the backend; **no accessibility test exists in either tier** | **Declared** — formal audit is a backlog item |
| G10 | §24 Acceptance — Culture School | "**Both required courses** load, track progress, and issue a certificate and country badge on completion" | Course completion, certificate and badge award are implemented and tested (REQ-PASSPORT-016). The count of "required" courses is not enforced anywhere | Partially met |
| G11 | §24 Acceptance — Translator | "**All four modes** return output; camera mode is labeled demonstration until real OCR is connected" | Two translation endpoints exist (conversation and lyrics) plus two music-specific ones. **There is no camera/OCR mode at all**, so it cannot carry the required label | Partially declared |

**Undeclared gaps** — behaviour the specification does not account for:

| # | Spec claim | Code state |
|---|---|---|
| U1 | §24 Acceptance — Safety: location sharing must be "consent-based … **and logged**" | The toggle writes a boolean with no consent artefact and no log entry (REQ-PASSPORT-033). Off-by-default and revocability are met; the other two criteria are not. |
| U2 | §25: "The database … is seeded with demonstration data on startup" | The seed **deletes and re-inserts** `destinations`, `courses` and `network` on every boot (REQ-PASSPORT-006). Any edit to that content — including a governance reviewer's classification, were one added — is destroyed on restart. |
| U3 | Trip Mode is presented as a general capability | The endpoint is hard-coded to `trip_id = "tokyo-creative-exchange"` and embeds five Japanese phrases as literals in the handler (REQ-PASSPORT-029). It cannot serve any other trip. |

### (b) Implemented but NOT mentioned in the spec

| # | Code feature | Spec status |
|---|---|---|
| E1 | **Lyric translation `flags` array** — the model is asked to flag language that may be offensive, misleading or culturally inappropriate (REQ-PASSPORT-025). | Not specified. It is a thoughtful safety affordance for a cultural-intelligence product and deserves to be in the spec. |
| E2 | **Syllable counting and singability comparison** on lyric translation (REQ-PASSPORT-025). | Not specified; a genuinely useful capability for performing musicians. |
| E3 | **The comparison prompt's anti-equivalence instruction** — "Never claim two traditions are equivalent … Emphasize where comparisons break down" (REQ-PASSPORT-044). | §13 requires the six required distinctions, but this specific guardrail against false equivalence is a prompt-level design decision not recorded in the spec. |
| E4 | **`respectful_alternative` and `potential_misunderstanding`** on music session translation (REQ-PASSPORT-046). | Not specified; among the strongest cultural-sensitivity features in the build. |
| E5 | **Explicit AI failure semantics** — 503 when unconfigured, 504 on a 55-second timeout, 502 on unparseable output, and **never a fabricated fallback** (REQ-PASSPORT-020 – 022). | Unspecified, and notably better than the fabricated-fallback pattern used by COHEIR and ANCRSHOP. Worth writing into the spec as a standard. |
| E6 | **Model string `claude-sonnet-4-6`** (REQ-PASSPORT-023), differing from every other app in the workspace. | Unspecified. §17 covers AI architecture but names no model version. |
| E7 | **Conversation translations are persisted; lyric translations are not** (REQ-PASSPORT-024 vs 026). | Unspecified asymmetry. |
| E8 | **Trips are returned unscoped** while every other user collection is scoped (REQ-PASSPORT-028). | Unspecified inconsistency. |

---

## 4. UNCLEAR / NEEDS INPUT

**Q1 — Location sharing is not consent-based or logged.**
§24 requires it to be "off by default, consent-based, revocable, and logged" (U1). Off-by-default and revocable hold; the toggle writes a bare boolean with no consent artefact and no audit entry (REQ-PASSPORT-033). What should a consent record contain, and where should the log live? This is the one acceptance criterion in the spec that the code silently misses.

**Q2 — The startup seed destroys static content on every boot.**
`destinations`, `courses` and `network` are deleted and re-inserted each time (REQ-PASSPORT-006, U2). Once a governance-reviewer workflow exists (G7), any classification applied to that content would be lost on restart. Should the refresh become an upsert keyed on id?

**Q3 — Trip Mode serves exactly one trip.**
It is hard-coded to `"tokyo-creative-exchange"` with five Japanese phrases inline in the handler (REQ-PASSPORT-029, U3). Should it take a trip id, and where should per-destination essential phrases come from — the destination record, or the translator?

**Q4 — Trips are not user-scoped.**
`GET /api/trips` returns every trip while every other collection filters on `user_id` (REQ-PASSPORT-028, E8). Intentional for the single-user demo, or an oversight that will matter once identity is real?

**Q5 — Which model string is correct?**
This app requests `claude-sonnet-4-6`; the other eleven AI-enabled apps in this workspace request `claude-sonnet-4-5-20250929`, and ANCRSHOP requests an OpenAI model (REQ-PASSPORT-023, E6). I have reported the literal strings without judging validity. Which is intended, and should the ecosystem pin one model per environment?

**Q6 — Camera / OCR mode.**
§24 requires the translator's camera mode to be "labeled demonstration until real OCR is connected" (G11), but no camera mode exists in the backend at all. Is it present in the frontend as a stub, and does it carry the required label?

**Q7 — Faculty assignment creation has no role check.**
`POST /api/classroom/assignments` is callable by anyone as Maya (REQ-PASSPORT-040). Once ANCRID arrives, which of the eight specified roles may create assignments, and should Program Administrator differ from Faculty?

**Q8 — Notifications are never generated.**
The collection is seeded and read-only (REQ-PASSPORT-041). Which events should produce one — checklist deadlines, assignment due dates, visa expiry, trip start?

**Q9 — Documents module has no backend.**
The `/documents` route renders but no upload, storage or retrieval endpoint exists (REQ-PASSPORT-038, G3). Given §18 forbids real passport and medical data until production controls are verified, should the module stay display-only until then — and should it carry an on-screen warning to that effect?

**Q10 — Checklist fields cannot be cleared.**
`PATCH` skips nulls, so a due date or attached document cannot be removed (REQ-PASSPORT-019). Should empty string clear, or should explicit nulls be accepted?

**Q11 — AI error semantics as an ecosystem standard.**
This app fails loudly (503/504/502) and never fabricates content (E5), unlike COHEIR and ANCRSHOP which return invented text on failure. Should this pattern be adopted across the ecosystem, and written into the shared specification?

**Q12 — The 2026-08-19 AI test failures.**
Six tests — every LLM-backed endpoint — failed with a uniform 500 in the first run and passed two hours later (see §2). The current `llm_json` would surface a provider failure as 503, not 500, which suggests the helper may have changed since. Was the 500 a provider outage, a key problem, or a code path that has since been fixed? A re-run would settle it.

**Q13 — ANCR Passport versus Creator Passport.**
Two distinct products share the word "Passport" — this travel product, and ANCRID's verified professional record (`/api/passport` here returns the travel profile). The ecosystem overview flags this as an open naming conflict. Which name changes, and does this app's `/api/passport` route need renaming to avoid colliding with an ANCRID endpoint of the same shape?
