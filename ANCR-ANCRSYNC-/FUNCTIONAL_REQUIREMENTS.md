# ANCRSYNC — Functional Requirements

**App folder:** `ANCR-ANCRSYNC-`
**APPNAME:** `ANCRSYNC` *(derived from the folder name as instructed)*
**Derived from:** `backend/{server,auth,ecosystem,scoring,coach,models,seed}.py`, `frontend/src/**`
**Stack observed:** FastAPI + Motor/MongoDB; bcrypt + JWT (HS256) bearer tokens; React + React Router + axios
**Date of extraction:** 2026-09-03

> ### Identity notice — read before using this document
> The folder is named `ANCR-ANCRSYNC-` and the spec PDFs inside it are the **ANCRSync™ collaboration** specification. **The code in this folder is not ANCRSync.** Every source file identifies itself as **ANCRLaunch™** — `FastAPI(title="ANCRLaunch API")`, the module docstring "ANCRLaunch™ — Career placement and professional transition platform", the logger `ancrlaunch`, the JWT audience `ANCRLaunch`, the seeded demo domain `@ancrlaunch.demo` and the tagline "Learn. Graduate. Launch."
> The implemented product is **career placement**: readiness scoring, resumes, opportunities, applications, interviews, employer talent search and graduate outcomes. There is **no collaboration, workspace, writing room, studio room or messaging capability anywhere in this codebase**.
> Requirement IDs use `REQ-ANCRSYNC-###` per the naming instruction. Section 3 compares the code against **both** the ANCRSync spec found in this folder **and** the ANCRLaunch spec found at the workspace root, because only the latter describes what was actually built.

---

## 1. FUNCTIONAL REQUIREMENTS

### 1.1 Platform, seeding and identity

**REQ-ANCRSYNC-001**
**Given** the application starts
**When** the `startup` handler runs
**Then** `seed_all(db)` executes **only if `users` is empty**, making startup seeding idempotent.

**REQ-ANCRSYNC-002**
**Given** the seed runs
**When** accounts are created
**Then** **eight demo accounts** are created, one per role, all on `@ancrlaunch.demo`: `student`, `graduate`, `faculty`, `career` (`career_services`), `employer`, `recruiter`, `industry` (`industry_partner`) and `admin` (`administrator`), sharing a single demo password.

**REQ-ANCRSYNC-003**
**Given** `GET /api/`
**When** called
**Then** it returns `{"service": "ANCRLaunch", "version": "1.0.0", "tagline": "Learn. Graduate. Launch."}` unauthenticated.

**REQ-ANCRSYNC-004**
**Given** `GET /api/health`
**When** called
**Then** it issues a Mongo `ping` and returns `{"ok": true, "time": <iso>}`; a database failure surfaces as a 500 rather than a structured health payload.

**REQ-ANCRSYNC-005**
**Given** the CORS middleware
**When** configured
**Then** origins come from `CORS_ORIGINS` (default `*`) with credentials allowed and all headers exposed.

**REQ-ANCRSYNC-006**
**Given** any user document is returned
**When** `_safe_user` runs
**Then** `password_hash` and `_id` are stripped.

### 1.2 Authentication and roles

**REQ-ANCRSYNC-007**
**Given** `POST /api/auth/login`
**When** it runs
**Then** it first looks up the lower-cased email and, failing that, **retries with the email exactly as submitted** — so an account seeded with mixed case remains reachable. An unknown email or a wrong password both raise **401 `"Invalid ANCRID credentials"`**.

**REQ-ANCRSYNC-008**
**Given** a successful login
**When** the token is minted
**Then** the JWT carries `sub` = the user's **`ancrid`** (not a database id), plus `role`, `email`, `iat`, `exp`, **`iss: "ANCRID"`** and **`aud: "ANCRLaunch"`**, and expires after `JWT_EXPIRE_HOURS` (default **168 hours / 7 days**).

**REQ-ANCRSYNC-009**
**Given** a token is presented
**When** `decode_token` runs
**Then** it validates the signature **and** enforces `audience="ANCRLaunch"` and `issuer="ANCRID"`; expiry raises **401 `"Session expired"`** and any other JWT error **401 `"Invalid ANCRID token"`**.

**REQ-ANCRSYNC-010**
**Given** a protected endpoint
**When** no bearer credential is supplied
**Then** it raises **401 `"Missing ANCRID token"`** (`HTTPBearer(auto_error=False)`).

**REQ-ANCRSYNC-011**
**Given** a decoded token
**When** `get_current_ancrid` returns
**Then** it returns `{ancrid, role, email}` **taken entirely from the token claims** — the user document is not re-read, so a role changed in the database does not take effect until the 7-day token expires.

**REQ-ANCRSYNC-012**
**Given** an endpoint wrapped in `require_roles(...)`
**When** the token's role is not in the allowed set
**Then** it raises **403 `"Insufficient ANCRID permissions"`**.

**REQ-ANCRSYNC-013**
**Given** `GET /api/auth/me`
**When** called
**Then** the user is looked up by `ancrid`; a token whose subject no longer exists raises **404 `"ANCRID identity not found"`**.

**REQ-ANCRSYNC-014**
**Given** `GET /api/auth/demo-accounts`
**When** called
**Then** it returns **every user's** email, role, full name, discipline, institution and avatar — up to 50 records — **with no authentication**. The login page fetches this to render one-click demo sign-in tiles.

**REQ-ANCRSYNC-015**
**Given** the authentication design
**When** the application is inspected
**Then** there is **no registration, logout, refresh or password-change endpoint**. Accounts exist only via the seed, and a token remains valid for its full 7 days with no server-side revocation.

**REQ-ANCRSYNC-016**
**Given** the frontend
**When** it stores the token
**Then** it is held in the browser (not an httpOnly cookie) and attached as an `Authorization: Bearer` header by the axios client.

### 1.3 Assembled portfolio (ecosystem consumption)

**REQ-ANCRSYNC-017**
**Given** `GET /api/portfolio`
**When** called
**Then** `Ecosystem.assemble_portfolio` composes a portfolio **on the fly, storing nothing**, from fourteen sources: identity, biography, projects, collaborations, media, publishing, creator passport, booking packet, travel readiness, reputation, faculty recommendations, industry recommendations, transcript and sync opportunities.

**REQ-ANCRSYNC-018**
**Given** the ecosystem providers
**When** they resolve
**Then** each reads a **prefixed collection inside ANCRLaunch's own MongoDB**: `ancrid_users`, `ancra_transcripts`, `ancra_recommendations`, `ancrlab_projects`, `ancrlab_collaborations`, `ancrsync_opportunities`, `coheir_recommendations`, `coheir_reputation`, `inheira_publishing`, `vaulta_passports`, `ancrmedia_releases`, `ancrd_booking_packets`, `ancrd_travel`. **No outbound HTTP call is made to any module.** The class docstring states this explicitly: "For demonstration, providers return seeded data from Mongo collections prefixed with the ecosystem name … To go live, swap `SeededProvider` for a `LiveHttpProvider`."

**REQ-ANCRSYNC-019**
**Given** `GET /api/portfolio/{ancrid}`
**When** any authenticated user calls it with another creator's ANCRID
**Then** **the full portfolio is returned with no authorisation check** — identity, publishing, booking packet, travel readiness and reputation. Only a valid token is required; role is not consulted.

**REQ-ANCRSYNC-020**
**Given** an ANCRID with no seeded records
**When** the portfolio is assembled
**Then** identity defaults to `{}` and every list to empty — **no 404 is raised for an unknown ANCRID**.

### 1.4 Career Readiness scoring

**REQ-ANCRSYNC-021**
**Given** `GET /api/readiness`
**When** it runs
**Then** the portfolio is assembled, resume completion is computed, interview readiness is derived, and `compute_readiness` returns `{overall, tier, components, weights}`.

**REQ-ANCRSYNC-022**
**Given** resume completion is computed
**When** `_resume_completion` runs
**Then** it is the percentage of six fields that are truthy — `professional_summary`, `career_objective`, `skills`, `employment`, `education`, `awards` — so each field is worth ~16.7 points regardless of content quality or length. A missing resume scores 0.

**REQ-ANCRSYNC-023**
**Given** interview readiness is computed
**When** it is derived
**Then** it is `min(100, 40 + interview_count × 20)` — **a floor of 40 with no interviews at all**, reaching 100 at three interviews.

**REQ-ANCRSYNC-024**
**Given** the ten sub-scores
**When** they are computed
**Then** each is a hard-coded linear formula clamped to 0–100: portfolio `30 + projects×12 + (10 if passport)`, publishing `20 + works×18`, creative `25 + media×15`, collaboration `20 + collabs×14`, faculty `30 + recs×25`, industry `20 + recs×22`, reputation = the stored score, business `30 + (25 if booking) + (20 if publishing)`, plus resume completion and interview readiness.

**REQ-ANCRSYNC-025**
**Given** a creator with **no** ecosystem records at all
**When** readiness is computed
**Then** the non-zero constants alone produce a floor: portfolio 30, publishing 20, creative 25, collaboration 20, faculty 30, industry 20, business 30, interview 40 — yielding an overall score around **24 with an entirely empty record**, tiered as `Building Foundation`.

**REQ-ANCRSYNC-026**
**Given** the weighted composite
**When** it is summed
**Then** the weights are portfolio 0.18, industry 0.11, publishing 0.10, creative 0.10, reputation 0.10, resume 0.10, faculty 0.09, collaboration 0.08, interview 0.08, business 0.06 — **totalling exactly 1.00**.

**REQ-ANCRSYNC-027**
**Given** an overall score
**When** the tier is assigned
**Then** ≥85 is `"Launch Ready"`, ≥70 `"Interview Ready"`, ≥55 `"Portfolio Ready"`, ≥40 `"Emerging"`, otherwise `"Building Foundation"`.

**REQ-ANCRSYNC-028**
**Given** `GET /api/readiness/{ancrid}`
**When** any authenticated user calls it
**Then** another creator's readiness score and full component breakdown are returned **with no role check**.

### 1.5 Resume

**REQ-ANCRSYNC-029**
**Given** `GET /api/resume`
**When** the caller has no stored resume
**Then** one is **created on first read**, seeded from the assembled portfolio: `professional_summary` from the identity biography, an education entry built from institution, discipline and graduation year when an institution is present, and empty skills, employment and awards. The document is inserted before returning.

**REQ-ANCRSYNC-030**
**Given** a resume is returned
**When** it is serialised
**Then** a computed `completion` percentage is attached (REQ-ANCRSYNC-022).

**REQ-ANCRSYNC-031**
**Given** `PUT /api/resume`
**When** it runs
**Then** only fields that are not `None` are `$set`, `updated_at` is stamped, and the document is **upserted** — so a PUT before any GET creates the resume. **A field cannot be cleared by sending `null`.**

**REQ-ANCRSYNC-032**
**Given** the resume feature
**When** the user looks for an export
**Then** **no PDF or document generation exists** — the resume is a JSON record with no rendering, download or share path.

### 1.6 Opportunities and applications

**REQ-ANCRSYNC-033**
**Given** `GET /api/opportunities`
**When** called
**Then** it filters on exact `kind`, `category`, `country` and `remote`, and `q` becomes a case-insensitive `$regex` across `title`, `employer` and `summary`. **`q` is not escaped**, so regex metacharacters are interpreted as pattern syntax. Results are capped at 500 with no pagination.

**REQ-ANCRSYNC-034**
**Given** the frontend routes
**When** `/jobs`, `/internships`, `/auditions` or `/projects` is opened
**Then** each renders the same `OpportunityList` component with a fixed `kind` prop, driving the `kind` filter.

**REQ-ANCRSYNC-035**
**Given** `GET /api/opportunities/{id}`
**When** the id is unknown
**Then** it raises **404 `"Opportunity not found"`**.

**REQ-ANCRSYNC-036**
**Given** `POST /api/applications`
**When** the referenced opportunity does not exist
**Then** it raises **404 `"Opportunity not found"`**; when the caller has already applied to it, **409 `"Already applied to this opportunity"`**.

**REQ-ANCRSYNC-037**
**Given** a valid application
**When** it is created
**Then** the document snapshots `opportunity_title` and `employer` alongside the id, starts at stage `"applied"`, carries the optional `note`, and stamps `applied_at` and `updated_at`.

**REQ-ANCRSYNC-038**
**Given** the opportunity list UI
**When** the user clicks apply
**Then** `POST /api/applications` is called with only `{opportunity_id}` — **no note, resume reference or document is attached**, despite `note` being accepted by the API.

**REQ-ANCRSYNC-039**
**Given** `PATCH /api/applications/{id}`
**When** it runs
**Then** the lookup is scoped to `{id, ancrid: caller}`, so another creator's application returns **404 `"Application not found"`**; otherwise `stage` is set and `updated_at` refreshed.

**REQ-ANCRSYNC-040**
**Given** an application stage is updated
**When** the new stage is validated
**Then** validation is whatever `ApplicationStageUpdate` declares in `models.py`; **the handler itself performs no transition check** — any allowed value can be set from any current stage, including backwards, and **no status history is recorded** (only the latest `stage` and `updated_at` are stored).

**REQ-ANCRSYNC-041**
**Given** an application is created or advanced
**When** the employer is considered
**Then** **nothing is delivered to them** — there is no employer-facing application inbox, no notification and no endpoint that returns applications by opportunity or employer. Applications are visible only to the applicant.

**REQ-ANCRSYNC-042**
**Given** `GET /api/applications`
**When** called
**Then** the caller's applications are returned, sorted by `updated_at` descending, capped at 500.

### 1.7 Interviews and outcomes

**REQ-ANCRSYNC-043**
**Given** `GET /api/interviews`
**When** called
**Then** the caller's interviews are returned sorted by `when` ascending, capped at 200. **There is no endpoint to create, reschedule or cancel an interview** — the collection is seed-only, yet its count feeds the readiness score (REQ-ANCRSYNC-023).

**REQ-ANCRSYNC-044**
**Given** `GET /api/graduate-outcomes`
**When** called
**Then** **all** outcomes are returned (up to 500) with a count keyed by `outcome_type` and a total. The data is not scoped to the caller, their institution or their cohort — every authenticated user sees every graduate's outcome record.

### 1.8 Employer network

**REQ-ANCRSYNC-045**
**Given** `GET /api/employers`
**When** any authenticated user calls it
**Then** all employers are returned, capped at 200, with no role restriction.

**REQ-ANCRSYNC-046**
**Given** `GET /api/employers/candidates`
**When** the caller's role is not one of `employer`, `recruiter`, `industry_partner`, `career_services`, `administrator`, `faculty`
**Then** it raises **403 `"Insufficient ANCRID permissions"`**. This is the **only genuinely role-gated read surface in the application**.

**REQ-ANCRSYNC-047**
**Given** an authorised candidate search
**When** it runs
**Then** it selects users whose role is `student` or `graduate`, filtering by case-insensitive `discipline` and `institution` regexes and exact `country` and `graduation_year`.

**REQ-ANCRSYNC-048**
**Given** candidates are matched
**When** results are assembled
**Then** **a full readiness computation runs per candidate** — each of which assembles that candidate's entire portfolio across 13 collection reads — then `min_readiness` is applied as a post-filter and results are sorted by readiness descending. A 200-candidate result therefore issues on the order of 2,800 database queries in one request.

**REQ-ANCRSYNC-049**
**Given** the candidate response
**When** it is built
**Then** each row is the **entire user document minus `password_hash`**, plus `readiness_overall`, `readiness_tier` and `reputation_score`. Whatever else the user record holds — email, country, graduation year and any other seeded field — is disclosed to every authorised searcher.

**REQ-ANCRSYNC-050**
**Given** a candidate is searched or viewed
**When** the candidate checks their own account
**Then** **there is no record of it** — no view log, no employer-interest event and no notification.

### 1.9 Career dashboard

**REQ-ANCRSYNC-051**
**Given** `GET /api/dashboard`
**When** called
**Then** it returns readiness, portfolio completion, resume status, a publishing summary, professional reputation, application counts by stage with the 5 most recent, the next 5 scheduled interviews, 6 recommended opportunities, 6 recent opportunities, employer interest and a career timeline — all assembled in one request.

**REQ-ANCRSYNC-052**
**Given** recommended opportunities are selected
**When** they are ranked
**Then** 20 opportunities are loaded and sorted by a **boolean**: whether the creator's discipline string appears anywhere in the opportunity's discipline plus summary. Ties keep their original order, so the ranking is effectively "discipline match first, arbitrary thereafter" — there is no scoring, no readiness matching and no personalisation beyond that single substring test.

**REQ-ANCRSYNC-053**
**Given** the career timeline is built
**When** it is assembled
**Then** events are drawn from portfolio records, applications and interviews, sorted by date descending and **truncated to 12 entries**.

**REQ-ANCRSYNC-054**
**Given** the dashboard request fails
**When** the page handles it
**Then** the error is swallowed by `.catch(() => {})` and the page remains in its loading state with no message.

### 1.10 AIAH career coach

**REQ-ANCRSYNC-055**
**Given** `POST /api/coach/stream`
**When** called
**Then** a session id is generated if absent, the **user turn is persisted before the model is called**, the portfolio and readiness are assembled and summarised into an ecosystem context block, and an SSE stream begins.

**REQ-ANCRSYNC-056**
**Given** the SSE stream
**When** it emits
**Then** it first sends `event: session` with the session id, then `data:` frames per chunk, then `event: done` / `[DONE]` in a `finally` block. A model exception emits `event: error` with the exception text.

**REQ-ANCRSYNC-057**
**Given** a chunk is emitted
**When** it is framed
**Then** carriage returns are stripped and newlines are replaced with the literal two-character sequence `\n` to keep each chunk on a single SSE line — the client must reverse this substitution to restore line breaks.

**REQ-ANCRSYNC-058**
**Given** the stream ends for any reason
**When** the `finally` block runs
**Then** the accumulated assistant text is persisted **only if non-empty**, so a stream that failed before producing any output leaves the user turn stored with no reply.

**REQ-ANCRSYNC-059**
**Given** the coach is configured
**When** the model client is built
**Then** it uses `anthropic / claude-sonnet-4-5-20250929` via the Emergent key, with a provider constant the docstring notes is swappable.

**REQ-ANCRSYNC-060**
**Given** `EMERGENT_LLM_KEY` is unset
**When** a coach request is made
**Then** the key defaults to an empty string and the failure surfaces only as an `event: error` frame — there is **no configuration pre-check**.

**REQ-ANCRSYNC-061**
**Given** `GET /api/coach/messages?session_id=…`
**When** called
**Then** messages are returned for `{ancrid: caller, session_id}` sorted by `created_at` — correctly scoped, so another creator's session cannot be read. `session_id` is a **required** query parameter; omitting it returns 422.

**REQ-ANCRSYNC-062**
**Given** `GET /api/coach/sessions`
**When** called
**Then** an aggregation groups the caller's messages by session, taking the last content as an 80-character preview plus its timestamp and message count, sorted newest first and capped at 25.

### 1.11 Administration

**REQ-ANCRSYNC-063**
**Given** `POST /api/admin/seed`
**When** called
**Then** it requires role `administrator` and re-runs `seed_all(db)`, returning `{seeded: true, at}`. **Unlike the startup seed this is unconditional** — it re-runs regardless of existing data.

**REQ-ANCRSYNC-064**
**Given** `GET /api/admin/stats`
**When** called
**Then** it requires role `administrator` or `career_services` and returns document counts for users, opportunities, applications, interviews, employers and graduate outcomes.

**REQ-ANCRSYNC-065**
**Given** the frontend route table
**When** it is read
**Then** there is **no admin page** — `/settings` exists but neither admin endpoint is called by any frontend file. Both are reachable by API only.

**REQ-ANCRSYNC-066**
**Given** any unmatched route
**When** the router resolves
**Then** it redirects to `/dashboard`; `/` does the same.

---

## 2. TEST COVERAGE

**Test assets found**
- `backend/tests/backend_test.py` (244 lines) — 16 test functions with role-scoped token fixtures.
- `test_result.md` — protocol boilerplate only, data section empty.
- **No frontend tests.**

| Requirement | Covered | Evidence / gap |
|---|---|---|
| REQ-ANCRSYNC-001, 002 | **Partial** | `test_demo_accounts` asserts the seeded accounts are listed; idempotency and the per-role set are not individually pinned |
| REQ-ANCRSYNC-003 | **No** | Root metadata untested |
| REQ-ANCRSYNC-004 | **Yes** | `test_health` |
| REQ-ANCRSYNC-005, 006 | **No** | CORS and scrubbing untested |
| REQ-ANCRSYNC-007 | **Partial** | `test_login_wrong_password` asserts 401; the mixed-case email retry is untested |
| REQ-ANCRSYNC-008, 009 | **Partial** | Every authenticated test exercises a valid token implicitly; **the `aud`/`iss` enforcement is never asserted** — no test presents a token with a wrong audience |
| REQ-ANCRSYNC-010 | **No** | The missing-token 401 is not asserted |
| REQ-ANCRSYNC-011 | **No** | That the role comes from the token rather than the database is untested |
| REQ-ANCRSYNC-012 | **Yes** | `test_candidates_forbidden_for_student` asserts 403 |
| REQ-ANCRSYNC-013 | **Yes** | `test_auth_me` |
| REQ-ANCRSYNC-014 | **Yes** | `test_demo_accounts` — though it asserts the endpoint works rather than questioning that it is unauthenticated |
| REQ-ANCRSYNC-015 | **No** | Absent registration/logout/refresh — nothing to test |
| REQ-ANCRSYNC-016 | **No** | Frontend only |
| REQ-ANCRSYNC-017, 018 | **Yes** | `test_portfolio_assembled` asserts the composed shape |
| REQ-ANCRSYNC-019 | **No** | **Cross-creator portfolio access is never tested** — no test fetches another ANCRID's portfolio to confirm or challenge that it is permitted |
| REQ-ANCRSYNC-020 | **No** | The unknown-ANCRID empty response is untested |
| REQ-ANCRSYNC-021 | **Yes** | `test_readiness` asserts the response shape |
| REQ-ANCRSYNC-022 – 027 | **Partial** | `test_readiness` checks structure and bounds; **not one of the ten formulas, the empty-record floor, the weight total or the five tier thresholds is asserted**. The scoring engine is the product's core differentiator and is effectively untested |
| REQ-ANCRSYNC-028 | **No** | Cross-creator readiness access untested |
| REQ-ANCRSYNC-029 – 031 | **Yes** | `test_resume_get_and_put` covers first-read creation, update and completion |
| REQ-ANCRSYNC-032 | **No** | No export to test |
| REQ-ANCRSYNC-033 | **Yes** | `test_opportunities_filters`. The unescaped `q` regex is not tested |
| REQ-ANCRSYNC-034 | **No** | Frontend only |
| REQ-ANCRSYNC-035 | **No** | The opportunity 404 branch is untested |
| REQ-ANCRSYNC-036, 037, 039, 042 | **Yes** | `test_application_lifecycle` covers create, the 409 duplicate and a stage patch |
| REQ-ANCRSYNC-038 | **No** | Frontend only |
| REQ-ANCRSYNC-040 | **No** | Stage transition validity and the absent status history are untested |
| REQ-ANCRSYNC-041 | **No** | The absent employer inbox is untested |
| REQ-ANCRSYNC-043 | **Yes** | `test_interviews` (uses both student and graduate tokens) |
| REQ-ANCRSYNC-044 | **Yes** | `test_graduate_outcomes` asserts the stats envelope — but not that the data is unscoped |
| REQ-ANCRSYNC-045 | **Yes** | `test_employers_list` |
| REQ-ANCRSYNC-046, 047 | **Yes** | `test_candidates_forbidden_for_student` (403) and `test_candidates_for_employer` (200) |
| REQ-ANCRSYNC-048 | **No** | **The N+1 readiness computation per candidate is untested and unmeasured** |
| REQ-ANCRSYNC-049 | **No** | That the full user document is disclosed is untested |
| REQ-ANCRSYNC-050 | **No** | No view logging to test |
| REQ-ANCRSYNC-051 | **Yes** | `test_dashboard` asserts the composite keys |
| REQ-ANCRSYNC-052, 053 | **No** | The boolean recommendation sort and the 12-event timeline cap are untested |
| REQ-ANCRSYNC-054 | **No** | Frontend only |
| REQ-ANCRSYNC-055 – 058 | **Partial** | `test_coach_stream` asserts a stream is produced; **the `\n` escaping, the error frame and the empty-reply skip are not asserted** |
| REQ-ANCRSYNC-059, 060 | **No** | Provider config and the missing-key path untested |
| REQ-ANCRSYNC-061, 062 | **No** | **Neither coach history nor the sessions aggregation is tested**, including the correct per-creator scoping |
| REQ-ANCRSYNC-063, 064 | **No** | **Neither admin endpoint is tested** — including that `/admin/seed` re-seeds unconditionally |
| REQ-ANCRSYNC-065, 066 | **No** | Frontend only |

**Summary:** 66 requirements. **17 Yes**, **8 Partial**, **41 No**. The suite covers the happy path of every major flow and one role-permission boundary, which is more than most apps here. The two conspicuous holes are the **readiness scoring engine** — the product's core claim, structurally tested but numerically unverified — and **cross-creator access** on `/portfolio/{ancrid}` and `/readiness/{ancrid}`, which no test probes in either direction.

---

## 3. SPEC GAP ANALYSIS

**Specs in this folder:** `ANCRSync_Product_Specification_v1_0 (1) (1).pdf` (9 pp., "Module 4 of 10"), `ANCRSYNC_Workflow.pdf`.
**Spec that actually describes this code, located at workspace root:** `ANCRLaunch_Product_Specification_v1_0 (1) (1).pdf` (9 pp., "Module 10 of 10"), plus `ANCRLAUNCH_Workflow.pdf`.

### (a-i) The ANCRSync specification in this folder — nothing in it is implemented

The folder's own specification describes a real-time creative collaboration platform. **None of it exists in this codebase.** Recording it item by item would be misleading, because this is not a partial implementation — it is a different product. The ANCRSync spec's eleven owned capabilities are:

| ANCRSync spec §05 "Owns" | Implemented here |
|---|---|
| Creative Workspaces™ (shared projects, tasks, milestones, comments, assets, version history) | **No** |
| Shared Studios™ (9 discipline studios) | **No** |
| Shared Sessions™ (scheduling, invitations, time-zone awareness, attendance, notes, recordings) | **No** |
| Writing Rooms™ (real-time lyrics, shared chords, arrangements, voice notes, timeline) | **No** |
| Studio Room™ (video, audio, screen share, recording, waiting room, presenter mode, live chat, auto transcription, AI summary) | **No** |
| Creative Review™ (waveform review, timestamp comments, approval tracking) | **No** |
| Team Collaboration | **No** |
| Messaging | **No** |
| Communities™ | **No** |
| Global Discovery™ / Global Pulse™ / Global Map | **No** |
| Shared Assets, Collaboration Analytics | **No** |

The ANCRSync spec's 15-item primary navigation (Workspaces, Discover, Global Map, Mentorship, Shared Studios, Shared Sessions, Writing Rooms, Messages, Communities, Creative Passport™, AI Intelligence, Notifications …) has **zero overlap** with the implemented navigation (Dashboard, Readiness, Portfolio, Resume, Jobs, Internships, Auditions, Projects, Employer Network, Applications, Interviews, Graduate Outcomes, Coach, Settings).

**This is the single most consequential finding in this folder.** It matches the conflict already recorded in `docs/ANCR_ECOSYSTEM_OVERVIEW.md` §"Conflicts that need an explicit product decision", item 1, which recommends renaming the repository to `ANCR-ANCRLAUNCH` and creating a separate home for the real collaboration product.

### (a-ii) Specified in the ANCRLaunch spec (root) but NOT implemented

| # | Spec source | Requirement | Code state |
|---|---|---|---|
| G1 | ANCRLaunch §10 Authentication | **"ANCRLaunch™ uses ANCRID™ exclusively. No independent login."** | A local `users` collection with bcrypt hashes and locally-minted JWTs. The token is **dressed as an ANCRID token** — `iss: "ANCRID"`, `aud: "ANCRLaunch"`, error strings reading "Invalid ANCRID credentials" and "Missing ANCRID token" — but it is issued and verified entirely by this service using its own secret (REQ-ANCRSYNC-008, 009). The shape is right; the issuer is not. |
| G2 | ANCRLaunch §09; §12 "Portfolio assets are referenced from their source modules rather than duplicated" | Nine named module integrations | The provider abstraction is correct and clean, but every provider reads a locally-seeded prefixed collection in ANCRLaunch's own database (REQ-ANCRSYNC-018). No module is contacted. The code documents this honestly as a demonstration stand-in. |
| G3 | ANCRLaunch §07 Career Readiness™ **Levels** | Building Foundation · **Emerging Professional** · **Industry Ready** · Launch Ready — **four** levels | The code implements **five**: `Building Foundation`, `Emerging`, `Portfolio Ready`, `Interview Ready`, `Launch Ready` (REQ-ANCRSYNC-027). Neither "Emerging Professional" nor "Industry Ready" appears; two unspecified tiers were added. |
| G4 | ANCRLaunch §07 Applications™ | Stages: Applied · Interview · Offer · Accepted · Declined · Archived. Includes **Notes**, **Documents**, **Deadlines**, **Status History**, **Interview Schedule** | Only a single current `stage` and `updated_at` are stored. **No status history, no documents, no deadlines** (REQ-ANCRSYNC-040), and the UI never sends the `note` the API accepts (REQ-ANCRSYNC-038). |
| G5 | ANCRLaunch §07 Employer Portal™ | Verified employers can Search Talent, Filter Candidates, **Review Portfolios**, and (per the roadmap) manage a pipeline | Candidate search and filtering exist and are correctly role-gated (REQ-ANCRSYNC-046). There is **no employer application inbox, no shortlist, no contact path and no employer-side pipeline** (REQ-ANCRSYNC-041). Employers cannot act on an application at all. |
| G6 | ANCRLaunch §07 Career Analytics™ | Readiness Score · **Placement Rate** · **Interview Rate** · **Employer Interest** · **Portfolio Views** · **Resume Downloads** · **Opportunity Activity** · Career Growth | Only the readiness score exists. There is **no view, download or activity tracking of any kind** (REQ-ANCRSYNC-050), and `/analytics` is not a route. `employer_interest` appears as a dashboard key but nothing records employer behaviour. |
| G7 | ANCRLaunch §06 Primary Navigation (13 items) | Home · Career Dashboard · Career Readiness™ · Portfolio · Resume · Applications · Opportunities · Employers · **Recruiters** · Graduate Outcomes · **Career Timeline** · **Analytics** · Settings | **Recruiters**, **Career Timeline** and **Analytics** have no route. The timeline exists only as a dashboard sub-section (REQ-ANCRSYNC-053). |
| G8 | ANCRLaunch §07 Opportunities™ | Ten kinds — Employment, Internships, **Touring**, Auditions, Creative Projects, **Publishing**, **Graduate Programs**, **Entrepreneurship**, **Fellowships**, **Residencies** | The UI surfaces four (`job`, `internship`, `audition`, `project`). The API accepts any `kind` string, so the other six are storable but unreachable from the interface. |
| G9 | ANCRLaunch §07 Opportunities™ Filters | Country · Remote · Discipline · **Compensation** · Employer · **Experience** · **Availability** | Country, remote and a text `q` exist; `discipline` is not a filter parameter (only `category`). **Compensation, experience and availability filters are absent.** |
| G10 | ANCRLaunch §08 AIAH™ (9 capabilities) | Resume Reviews · Interview Coaching · Salary Guidance · Career Planning · Portfolio Reviews · Personal Branding · Opportunity Matching · Career Roadmaps · **30/60/90-Day Launch Plans** | The system prompt names eight of these, so the model may address them conversationally, but **none has a structured surface, action or artefact**. AIAH cannot edit a resume, schedule a mock interview or generate a launch plan document. |
| G11 | ANCRLaunch Roadmap **P1** | **Resume/PDF generation** · **Interview scheduling** · **Notifications** | None exists (REQ-ANCRSYNC-032, 043). Interviews are seed-only yet drive readiness scoring; there is no notification mechanism anywhere in the application. |
| G12 | ANCRLaunch Roadmap **P2** | Institution analytics · Placement reporting · Employer CRM · AI hiring insights | None exists. `/graduate-outcomes` returns raw records with a type tally (REQ-ANCRSYNC-044) but no institution scoping or placement reporting. |
| G13 | ANCRLaunch §12 | "**Employer access must be role-based and permission-aware**" | Partially met. `/employers/candidates` is correctly gated (REQ-ANCRSYNC-046), but `/portfolio/{ancrid}` and `/readiness/{ancrid}` expose any creator's full assembled portfolio and score to **any authenticated user regardless of role** (REQ-ANCRSYNC-019, 028), which is a wider disclosure than the gated search it sits beside. |

### (b) Implemented but NOT mentioned in either spec

| # | Code feature | Spec status |
|---|---|---|
| E1 | **`GET /api/auth/demo-accounts`** — an unauthenticated endpoint returning every user's email, role, name, discipline, institution and avatar (REQ-ANCRSYNC-014). | Unspecified. It is a demo convenience that enumerates the entire user directory to anonymous callers. |
| E2 | **Five readiness tiers with specific thresholds** and **ten weighted sub-scores with hard-coded linear formulas** (REQ-ANCRSYNC-024 – 027). | The spec names ten *measures* and four *levels* but supplies no formula, no weight and no threshold. The entire numeric model is an unspecified engineering invention — and it is the number the whole product is built around. |
| E3 | **A non-zero readiness floor.** A creator with no records at all still scores ≈24 because eight of the ten sub-scores have non-zero constants (REQ-ANCRSYNC-025). | Unspecified, and it undercuts the spec's "careers are launched on verified proof" premise — the score is non-zero before any proof exists. |
| E4 | **Resume auto-creation on first read**, seeded from the portfolio identity (REQ-ANCRSYNC-029). | Unspecified. It means `GET` has a write side effect. |
| E5 | **`POST /api/admin/seed`** — an unconditional re-seed available to administrators (REQ-ANCRSYNC-063). | Unspecified. Unlike the guarded startup seed, it overwrites regardless of existing data. |
| E6 | **SSE newline escaping** — chunks have `\n` replaced with a literal backslash-n and the client must reverse it (REQ-ANCRSYNC-057). | An undocumented wire-format contract between this backend and its own frontend. |
| E7 | **7-day bearer tokens with no logout, refresh or revocation** (REQ-ANCRSYNC-015). | Unspecified. Combined with role-in-token (REQ-ANCRSYNC-011), a revoked or downgraded role stays live for up to a week. |
| E8 | **`ancrsync_opportunities` as a sync-licensing provider** inside the portfolio assembler. | The ANCRSync spec defines ANCRSync as *collaboration*, not sync licensing. `docs/ANCR_ECOSYSTEM_OVERVIEW.md` §"Conflicts" item 3 records exactly this ambiguity; this code takes the licensing reading. |
| E9 | **`vaulta_passports` supplies the Creator Passport** and **`ancrd_booking_packets` supplies the Booking Packet**. | Both specs assign **Creator Passport™** and **Booking Packet™** to **ANCRID™** (ANCRID spec §16 states they "belong to ANCRID™"). This code sources them from Vaulta and ANCRD instead — a three-way ownership disagreement. |

---

## 4. UNCLEAR / NEEDS INPUT

**Q1 — The folder name, the specs inside it, and the code are three different things.**
The directory is `ANCR-ANCRSYNC-`, the PDFs inside are the ANCRSync collaboration spec, and the code is ANCRLaunch. Confirm the rename to `ANCR-ANCRLAUNCH`, and confirm the ANCRSync PDFs should move to a new home for the collaboration product. Until that decision is made, `[APPNAME]` for this folder is genuinely ambiguous — I used `ANCRSYNC` from the folder name as instructed, but every requirement above describes ANCRLaunch behaviour.

**Q2 — Readiness tiers disagree with the spec.**
The spec defines four levels (Building Foundation, Emerging Professional, Industry Ready, Launch Ready); the code implements five with different names (G3). Which set is canonical, and what are the intended thresholds?

**Q3 — The readiness formulas are unspecified.**
Ten sub-scores, their coefficients and their weights are pure engineering invention (E2), and this number is the product's central claim. Who owns the model, and should the coefficients be configuration rather than code?

**Q4 — A creator with no record scores ~24.**
Eight sub-scores have non-zero constants, so an empty portfolio is not a zero score (E3, REQ-ANCRSYNC-025). Is a non-zero floor intended (an encouragement design), or should an unproven creator score 0?

**Q5 — Interview readiness has a floor of 40 with zero interviews.**
`min(100, 40 + interviews × 20)` (REQ-ANCRSYNC-023), and interviews cannot be created through the application at all (REQ-ANCRSYNC-043). Should interview readiness derive from something the creator can actually influence?

**Q6 — Anyone can read anyone's portfolio and readiness.**
`/portfolio/{ancrid}` and `/readiness/{ancrid}` require only a valid token, with no role check (REQ-ANCRSYNC-019, 028) — while the candidate search beside them is properly gated. Is the open access intended, and if not should it use the same role set as `/employers/candidates`?

**Q7 — Applications are invisible to employers.**
There is no employer inbox, no notification and no endpoint returning applications by opportunity (REQ-ANCRSYNC-041, G5). What is the intended employer workflow, and does the application go anywhere outside this system?

**Q8 — No status history on applications.**
Only the latest stage is kept, and any stage can be set from any other (REQ-ANCRSYNC-040, G4). Should transitions be constrained and appended to a history array?

**Q9 — `/employers/candidates` is O(candidates × 13 queries).**
Each candidate triggers a full portfolio assembly to compute readiness, then `min_readiness` filters afterwards (REQ-ANCRSYNC-048). Should readiness be materialised and refreshed on change, and should the filter be applied before scoring?

**Q10 — Candidate search returns the whole user document.**
Minus only `password_hash` (REQ-ANCRSYNC-049). Which fields should employers see, and should the candidate know they were searched (REQ-ANCRSYNC-050)?

**Q11 — `/auth/demo-accounts` is unauthenticated.**
It enumerates every user with email and institution (E1, REQ-ANCRSYNC-014). Should it be removed before any shared deployment, or gated behind an environment flag?

**Q12 — Role lives in the token for 7 days.**
`get_current_ancrid` never re-reads the user, and there is no logout, refresh or revocation (REQ-ANCRSYNC-011, 015, E7). Should the role be re-checked per request, and what is the intended revocation path?

**Q13 — Who owns Creator Passport and Booking Packet?**
This code sources them from `vaulta_passports` and `ancrd_booking_packets`, while the ANCRID specification states both belong to ANCRID (E9). Which module is authoritative?

**Q14 — Is ANCRSync collaboration or sync licensing?**
`ancrsync_opportunities` is consumed as sync-licensing placements (E8), contradicting the collaboration spec sitting in the same folder. This is the same conflict recorded in the ecosystem overview; a decision is needed before the real ANCRSync is built.

**Q15 — Opportunity kinds and filters.**
Six of ten specified kinds are unreachable from the UI, and the compensation, experience and availability filters do not exist (G8, G9). Which are in scope for v1?

**Q16 — Resume has no export.**
The spec's P1 roadmap names resume/PDF generation (G11). Is that in scope here, or does document rendering belong to another service?

**Q17 — Coach SSE escaping.**
The `\n`-to-literal substitution (REQ-ANCRSYNC-057, E6) is an undocumented contract. Should the stream use JSON-framed data lines like the other AIAH surfaces in the workspace, for consistency?
