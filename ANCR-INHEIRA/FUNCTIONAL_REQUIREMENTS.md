# INHEIRA — Functional Requirements

**App folder:** `ANCR-INHEIRA`
**APPNAME:** `INHEIRA`
**Derived from:** `backend/{server,evidence,media_evidence,mci,comparison}.py` (3,714 lines, 60 routes), `frontend/src/**`
**Stack observed:** FastAPI + Motor/MongoDB; bcrypt + JWT (HS256) bearer **and** Emergent session cookies; Claude Sonnet 4.5; Emergent object storage; React + React Router + axios
**Date of extraction:** 2026-09-03

---

## 1. FUNCTIONAL REQUIREMENTS

### 1.1 Authentication

**REQ-INHEIRA-001**
**Given** `POST /api/auth/register`
**When** the email already exists
**Then** it raises **400 `"Email already registered"`**; otherwise a user is created with a `user_` + 12-hex id, a bcrypt hash, `auth_provider: "password"` and `verification_status: "unverified"`, and a JWT is returned.

**REQ-INHEIRA-002**
**Given** registration input
**When** it is validated
**Then** only the `UserRegister` model applies — **there is no password strength rule, no minimum length and no rate limiting on registration**.

**REQ-INHEIRA-003**
**Given** `POST /api/auth/login`
**When** the email is unknown, the account has no `password_hash`, or the password is wrong
**Then** all three raise **401 `"Invalid credentials"`** — no user enumeration. **There is no brute-force lockout of any kind.**

**REQ-INHEIRA-004**
**Given** a successful login or registration
**When** the token is minted
**Then** `create_jwt` produces `{"user_id", "exp"}` signed HS256 with a **7-day** default lifetime.

**REQ-INHEIRA-005**
**Given** `POST /api/auth/session` with an `X-Session-ID` header or a `session_id` body field
**When** it runs
**Then** the id is exchanged at the Emergent OAuth session-data endpoint; a non-200 raises **401 `"Invalid session"`** and a missing id **400 `"Missing session_id"`**.

**REQ-INHEIRA-006**
**Given** a valid Emergent exchange
**When** the email is new
**Then** a user is created with `auth_provider: "google"` and **`verification_status: "verified"`** — Google authentication alone confers verified status. An existing user has their name and picture refreshed.

**REQ-INHEIRA-007**
**Given** an Emergent session is established
**When** the session is persisted
**Then** the **Emergent-supplied `session_token` is stored verbatim** in `user_sessions` with a 7-day `expires_at`, and set as an httpOnly, secure, `samesite=none` cookie.

**REQ-INHEIRA-008**
**Given** a request carrying a `session_token` **cookie**
**When** `get_current_user` resolves it
**Then** the session is looked up, `expires_at` is normalised to UTC and **compared against now** — an expired cookie session falls through.

**REQ-INHEIRA-009**
**Given** a request carrying a session token in the **`Authorization: Bearer` header** instead of the cookie
**When** `get_current_user` reaches the session-token fallback
**Then** the session row is looked up and the user returned **with no expiry check at all**. A session token presented as a bearer header therefore **remains valid indefinitely**, including after the cookie path would have rejected it and after `POST /auth/logout` has run on a different device.

**REQ-INHEIRA-010**
**Given** no valid cookie, JWT or session token
**When** resolution completes
**Then** it raises **401 `"Not authenticated"`**.

**REQ-INHEIRA-011**
**Given** `POST /api/auth/logout`
**When** called
**Then** the session row for the presented cookie is deleted and the cookie cleared. **JWTs are unaffected** — a password-login token survives logout for its full 7 days, and the endpoint has no auth dependency.

**REQ-INHEIRA-012**
**Given** the application
**When** a user looks for account recovery or role management
**Then** **there is no password reset, no password change, no email verification and no role field of any kind** — every account has identical privileges.

### 1.2 Profile and discovery

**REQ-INHEIRA-013**
**Given** `PUT /api/profile/me`
**When** called
**Then** the caller's own profile is updated (disciplines, instruments, genres, social links).

**REQ-INHEIRA-014**
**Given** `GET /api/profile/{user_id}`
**When** called by any authenticated user
**Then** that user's profile is returned with `password_hash` stripped.

**REQ-INHEIRA-015**
**Given** `GET /api/creators/{user_id}/discography` or `/timeline`
**When** called
**Then** every session where that user is a collaborator is returned, including the caller's own per-session evidence view. **No relationship check applies** — any authenticated user can enumerate any creator's full session history.

**REQ-INHEIRA-016**
**Given** `GET /api/discover/creators`
**When** called
**Then** creators are returned for discovery browsing.

### 1.3 Sessions (Writing Rooms)

**REQ-INHEIRA-017**
**Given** `POST /api/sessions`
**When** a session is created
**Then** the caller becomes `owner_id` and the first collaborator with an assigned colour, an `invite_code` is generated, and a `session_created` evidence event is recorded.

**REQ-INHEIRA-018**
**Given** `GET /api/sessions`
**When** called
**Then** only sessions where the caller appears in `collaborators` are returned — correctly scoped.

**REQ-INHEIRA-019**
**Given** `GET /api/sessions/{session_id}`
**When** any authenticated user calls it with a session id
**Then** **the full session document is returned with no membership check** — including `collaborators`, `splits`, `splits_status` and `signatures`. The list endpoint is scoped; the detail endpoint is not.

**REQ-INHEIRA-020**
**Given** `POST /api/sessions/{session_id}/join`
**When** any authenticated user calls it
**Then** **they are added as a collaborator with role `"Collaborator"`**, with no invitation, no approval and no owner consent. A `collaborator_joined` evidence event is recorded.

**REQ-INHEIRA-021**
**Given** a user has joined via REQ-INHEIRA-020
**When** splits are subsequently proposed
**Then** they are counted among the collaborators whose signature is required to finalise (REQ-INHEIRA-039) — **so an uninvited joiner can block finalisation of a rights agreement**, and appears in the evidence record as a participant.

**REQ-INHEIRA-022**
**Given** `POST /api/sessions/join-by-code/{invite_code}`
**When** called
**Then** the session is resolved by upper-cased invite code (**404 `"Invalid invite code"`** if unmatched) and `join_session` is delegated to.

**REQ-INHEIRA-023**
**Given** `PATCH /api/sessions/{session_id}`
**When** called
**Then** the caller must be a collaborator, raising **403 `"Not a collaborator"`** otherwise.

### 1.4 Lyrics

**REQ-INHEIRA-024**
**Given** `POST /api/sessions/{session_id}/lyrics`
**When** called
**Then** collaborator membership **is** enforced (**403 `"Not a collaborator"`**); the line is stored with the author's id, name and assigned colour, and a `lyric_line` evidence event is recorded with a 140-character preview.

**REQ-INHEIRA-025**
**Given** `PUT /api/sessions/{session_id}/lyrics/{line_id}`
**When** called
**Then** the line is looked up by `{line_id, session_id}` and updated. **Neither collaborator membership nor line authorship is checked** — any authenticated user can rewrite any lyric line in any session, and the `lyric_line_edited` evidence event will attribute the edit to them as though they were a participant.

**REQ-INHEIRA-026**
**Given** `DELETE /api/sessions/{session_id}/lyrics/{line_id}`
**When** called
**Then** the line is deleted with the same absent checks as REQ-INHEIRA-025.

**REQ-INHEIRA-027**
**Given** `GET /api/sessions/{session_id}/lyrics`
**When** called
**Then** up to 2,000 lines are returned with **no membership check**.

### 1.5 Events, messages and contributions

**REQ-INHEIRA-028**
**Given** `POST /api/sessions/{session_id}/events`
**When** called
**Then** the session must exist; a timeline event is recorded.

**REQ-INHEIRA-029**
**Given** `POST /api/sessions/{session_id}/messages`
**When** called
**Then** collaborator membership **is** enforced (**403**); `GET .../messages` returns the thread.

**REQ-INHEIRA-030**
**Given** `POST /api/sessions/{session_id}/contributions`
**When** called
**Then** collaborator membership **is** enforced (**403 `"Not a collaborator"`**); the contribution records role, description and a numeric `weight`.

**REQ-INHEIRA-031**
**Given** `GET /api/sessions/{session_id}/contributions`
**When** called
**Then** contributions are returned — the read has **no membership check** while the write does.

### 1.6 Splits and rights

**REQ-INHEIRA-032**
**Given** `POST /api/sessions/{session_id}/splits/suggest`
**When** called
**Then** a rule-based baseline is computed from contribution count and weight per collaborator, and — when `EMERGENT_LLM_KEY` is set and contributions exist — Claude Sonnet 4.5 is asked for splits as strict JSON.

**REQ-INHEIRA-033**
**Given** the model response
**When** it is parsed
**Then** the first `{` to the last `}` is extracted and JSON-decoded. **Any exception is caught and logged as a warning**, silently falling back to the rule-based baseline; the response's `source` field (`"ai"` or `"rule"`) and `confidence` (0.85 or 0.6) are the only signal to the caller that the model was not used.

**REQ-INHEIRA-034**
**Given** suggested splits
**When** they are normalised
**Then** if the total deviates from 100 by more than 0.5, every percentage is multiplied by `100 / total` and rounded to 2 decimals. **A deviation of 0.5 or less is left uncorrected**, so a suggestion totalling 99.6 is returned as-is.

**REQ-INHEIRA-035**
**Given** a split suggestion
**When** it is returned
**Then** **nothing is persisted** — the suggestion is advisory and the owner must explicitly set splits to record them.

**REQ-INHEIRA-036**
**Given** `PUT /api/sessions/{session_id}/splits`
**When** the caller is not `owner_id`
**Then** it raises **403 `"Only owner can set splits"`** — the tightest control in the application.

**REQ-INHEIRA-037**
**Given** proposed splits
**When** they are validated
**Then** the total must be within 0.5 of 100, otherwise **400 `"Splits must sum to 100 (got {total})"`**.

**REQ-INHEIRA-038**
**Given** splits are set
**When** the write completes
**Then** `splits_status` becomes `"proposed"`, **`signatures` is reset to `{}`** — so re-proposing invalidates every prior signature — and a `rights_updated` evidence event is recorded.

**REQ-INHEIRA-039**
**Given** `POST /api/sessions/{session_id}/splits/approve`
**When** called
**Then** the caller must be a collaborator (**403 `"Not a collaborator"`**) and splits must already be proposed (**400 `"No splits proposed yet"`**); their signature, approval boolean and timestamp are recorded, and `splits_status` becomes `"finalized"` **only when every collaborator has signed with `approved: true`**.

**REQ-INHEIRA-040**
**Given** an approval is recorded
**When** the evidence event is written
**Then** it is an `approval_signed` event carrying the approval flag, the signature string, the all-signed flag and the participant list, plus a `secure_reference` pointing at `sessions.{id}.signatures` rather than duplicating the sensitive value.

**REQ-INHEIRA-041**
**Given** all collaborators have signed
**When** finalisation completes
**Then** a `milestone_reached` evidence event is recorded and — **only if no royalty record already exists for the session** — a `royalties` document is seeded with the finalised splits and zeroed income fields.

**REQ-INHEIRA-042**
**Given** a signature is provided
**When** it is stored
**Then** it is the caller-supplied `signature` string or their display name. **There is no cryptographic signature, no identity assertion beyond the session, and no immutability guarantee on the `signatures` map** — a subsequent `PUT /splits` clears it entirely (REQ-INHEIRA-038).

**REQ-INHEIRA-043**
**Given** `GET /api/royalties`
**When** called
**Then** only finalised sessions where the caller is a collaborator are aggregated. Income fields are seeded at zero and **no endpoint ever writes a non-zero royalty figure** — there is no ingestion path.

**REQ-INHEIRA-044**
**Given** `POST /api/sessions/{session_id}/rights/generate/{kind}`
**When** called
**Then** a rights document of the requested kind is generated for the session.

### 1.7 Creative Evidence

**REQ-INHEIRA-045**
**Given** any material action — session creation, collaborator join, lyric write/edit/remove, file upload, rights update, approval, milestone
**When** it completes
**Then** `evidence_recorder.record_event` writes an event carrying kind, session, actor id, actor name, actor colour, a human-readable label, a payload and an optional `secure_reference`.

**REQ-INHEIRA-046**
**Given** `GET /api/sessions/{session_id}/evidence`
**When** called
**Then** the event stream is returned. **No membership check applies.**

**REQ-INHEIRA-047**
**Given** `GET /api/sessions/{session_id}/evidence/checkpoints`
**When** called
**Then** evidence checkpoints are returned; `evidence/populate-since` backfills events from a point in time.

**REQ-INHEIRA-048**
**Given** `GET /api/creator/evidence`
**When** called
**Then** the caller's cross-session evidence record is assembled.

### 1.8 Versions, acknowledgements, MCI and comparison

**REQ-INHEIRA-049**
**Given** `POST /api/sessions/{session_id}/versions`
**When** called
**Then** the caller must be the owner **or** a collaborator, raising **403 `"Not a collaborator on this session"`** otherwise; a version is recorded with the submitter's collaborator entry.

**REQ-INHEIRA-050**
**Given** `POST /api/sessions/{id}/versions/{version_id}/evidence` and `/acknowledgements`
**When** called
**Then** evidence is attached to a version and collaborator acknowledgements are recorded against it.

**REQ-INHEIRA-051**
**Given** `GET /api/sessions/{session_id}/mci` and `POST .../mci/refresh`
**When** called
**Then** the Musical Contribution Index is read or recomputed for the session.

**REQ-INHEIRA-052**
**Given** `GET /api/sessions/{session_id}/comparison`
**When** called
**Then** a comparison analysis is returned for the session.

### 1.9 Voice evidence

**REQ-INHEIRA-053**
**Given** `POST /api/sessions/{session_id}/voice`
**When** called
**Then** a voice recording is submitted against the session with the caller's collaborator entry as submitter, and analysed into speaker-attributed moments.

**REQ-INHEIRA-054**
**Given** `GET /api/voice/{recording_id}` and `/audio`
**When** called
**Then** the recording metadata and audio bytes are returned.

**REQ-INHEIRA-055**
**Given** `POST /api/voice/{recording_id}/speakers`, `/moments/{moment_id}/review` and `/reclassify`
**When** called
**Then** speaker labels can be assigned, individual moments reviewed and the recording reclassified — **human review of machine attribution, with the human decision recorded**.

### 1.10 Song Intelligence and insights

**REQ-INHEIRA-056**
**Given** `POST /api/sessions/{session_id}/insights`
**When** called
**Then** session insights are generated, including a most-active-contributor computation derived from recorded activity.

**REQ-INHEIRA-057**
**Given** `POST /api/sessions/{session_id}/intelligence`
**When** called
**Then** the Song Intelligence report is generated for the session.

### 1.11 Sharing and public reports

**REQ-INHEIRA-058**
**Given** `POST /api/sessions/{session_id}/share`
**When** called
**Then** collaborator membership **is** enforced (**403**); a 32-hex token is generated with a caller-specified `ttl_days`, an `audience` label and an optional `password`.

**REQ-INHEIRA-059**
**Given** a share link is created
**When** the password is stored
**Then** it is written to `share_links.password` **in plaintext** and later compared with a plain `!=` — no hashing and no constant-time comparison.

**REQ-INHEIRA-060**
**Given** `GET /api/report/{token}`
**When** called with no authentication
**Then** an unknown token raises **404 `"Link not found"`**, an expired link **410 `"Link expired"`**, and a password-protected link without the matching `password` query parameter **401 `"Password required"`**.

**REQ-INHEIRA-061**
**Given** a valid public report request
**When** the payload is built
**Then** it returns **the entire session document** — including `splits`, `splits_status`, `signatures` and every collaborator — plus per-collaborator evidence, the lyric line count and the last 50 timeline events.

**REQ-INHEIRA-062**
**Given** the share link carries an `audience` value
**When** the report is assembled
**Then** **`audience` is stored, echoed back and never used to filter anything** — a link created for any audience returns the identical full payload, including the signature record.

### 1.12 Files and integrations

**REQ-INHEIRA-063**
**Given** `POST /api/upload`
**When** called
**Then** the file is written to `{APP_NAME}/uploads/{user_id}/{uuid}.{ext}` in object storage and a `files` record is created. **There is no MIME allow-list and no size limit** — any file type of any size is accepted.

**REQ-INHEIRA-064**
**Given** an upload supplies a `session_id`
**When** it completes
**Then** a `file_uploaded` evidence event is recorded against that session — **without checking that the uploader is a collaborator on it**.

**REQ-INHEIRA-065**
**Given** `GET /api/files/{path:path}`
**When** called
**Then** the record is looked up by storage path and the bytes returned to **any authenticated user** — **ownership is never checked**, so any file is retrievable by anyone who knows or guesses its path. The path includes the owner's `user_id` and a UUID.

**REQ-INHEIRA-066**
**Given** `GET /api/integrations`, `GET /api/integrations/{id}` and `PATCH /api/integrations/{id}`
**When** called
**Then** integration records can be listed, read and toggled (`connected`, `permissions`). **No external service is contacted** — these are local flags.

---

## 2. TEST COVERAGE

**Test assets found** — 6 suites totalling **102 test functions**, plus 6 recorded pytest XML reports.

| Suite | Tests | Focus |
|---|---|---|
| `test_songright_api.py` | 21 | Core API — auth, sessions, lyrics, contributions, splits |
| `test_voice_evidence_v2_2.py` | 21 | Voice recordings, speakers, moment review |
| `test_cei_v2.py` | 17 | Creative Evidence Intelligence |
| `test_auto_doc_v2_1.py` | 16 | Auto-documentation, checkpoints, version evidence |
| `test_comparison_v3_1.py` | 16 | Comparison analysis |
| `test_mci_v3_0.py` | 11 | Musical Contribution Index |

**Recorded runs**

| Report | Tests | Failures | Timestamp |
|---|---|---|---|
| `cei_v2_results.xml` | 26 | 0 | 2026-08-08 02:12 |
| `auto_doc_v2_1_results.xml` | 42 | 0 | 2026-08-08 02:37 |
| `voice_evidence_v2_2_results.xml` | 21 | 0 | 2026-08-08 03:08 |
| **`pytest_results.xml`** | **84** | **3** | **2026-08-08 03:41** |
| `mci_v3_0.xml` | 11 | 0 | 2026-08-08 17:42 |
| `comparison_v3_1.xml` | 16 | 0 | 2026-08-08 19:48 |

> ### Recorded failures — carried forward
> The **broadest run** (`pytest_results.xml`, 84 tests) records **three failures**, all in `tests.test_auto_doc_v2_1`:
> - `test_checkpoints_and_close_on_version_submit` — `AssertionError: no open checkpoint found — auto-checkpoint bookkeeping failed` (`assert []`)
> - `test_version_evidence_added_event` — `KeyError: 'vid'`
> - `test_acknowledgement_submitted_event` — `KeyError: 'vid'`
>
> Notably `auto_doc_v2_1_results.xml` — a **narrower, earlier** run of the same suite — passed 42/42 at 02:37, and the failures appear only in the broader 03:41 run. That pattern points at cross-suite state contamination rather than a defect in the feature itself: the checkpoint bookkeeping and the `vid` key both depend on prior fixture state that the wider run apparently disturbs. **Neither reading has been verified here** — the suite has not been re-run. The two later runs (MCI, comparison) are green but do not cover `auto_doc`, so **the last evidence for version checkpointing and acknowledgement events is failing.**

| Requirement | Covered | Evidence / gap |
|---|---|---|
| REQ-INHEIRA-001, 003, 004 | **Yes** | `test_songright_api` covers register, login and token issue |
| REQ-INHEIRA-002 | **No** | Absent password rules and rate limiting are untested |
| REQ-INHEIRA-005 – 007 | **No** | **The Emergent session flow is entirely untested** — it cannot be exercised without a live Emergent session |
| REQ-INHEIRA-008 | **No** | Cookie-session expiry untested |
| REQ-INHEIRA-009 | **No** | **The unchecked bearer-session-token path is untested** — the exact gap a test would have caught |
| REQ-INHEIRA-010 | **Partial** | 401 paths exercised generically |
| REQ-INHEIRA-011, 012 | **No** | Logout semantics and the absence of roles are untested |
| REQ-INHEIRA-013 – 016 | **Partial** | Profile update is covered; **cross-creator discography access is not challenged** |
| REQ-INHEIRA-017, 018 | **Yes** | `test_songright_api` session creation and scoped listing |
| REQ-INHEIRA-019 | **No** | **That session detail has no membership check is untested** |
| REQ-INHEIRA-020, 021 | **Partial** | Join is exercised as a positive flow; **that any user can join any session, and thereby gate a rights agreement, is never challenged** |
| REQ-INHEIRA-022, 023 | **Yes** | Invite-code join and the patch 403 are covered |
| REQ-INHEIRA-024 | **Yes** | Lyric creation and its 403 are covered |
| REQ-INHEIRA-025 – 027 | **No** | **The unguarded edit, delete and list paths are untested** |
| REQ-INHEIRA-028 – 031 | **Partial** | Contribution creation and its 403 are covered; the unguarded read is not |
| REQ-INHEIRA-032 – 035 | **Partial** | `test_songright_api` exercises suggestion; **the normalisation tolerance, the silent AI fallback and the `source` signal are not asserted** |
| REQ-INHEIRA-036, 037 | **Yes** | Owner-only 403 and the sum-to-100 400 are covered |
| REQ-INHEIRA-038 | **Partial** | Status transition is covered; **that re-proposing wipes signatures is not asserted** |
| REQ-INHEIRA-039, 041 | **Yes** | The all-must-sign finalisation and royalty seeding are covered |
| REQ-INHEIRA-040 | **Yes** | `test_cei_v2` covers approval evidence with secure references |
| REQ-INHEIRA-042 | **No** | Signature immutability is untested — and absent |
| REQ-INHEIRA-043, 044 | **Partial** | Royalty listing is covered; the absent ingestion path is not surfaced |
| REQ-INHEIRA-045 – 048 | **Yes** | `test_cei_v2` (26 in run) covers the evidence recorder comprehensively |
| REQ-INHEIRA-049 | **Yes** | Version submission and its 403 are covered |
| REQ-INHEIRA-050 | **Failing** | `test_version_evidence_added_event` and `test_acknowledgement_submitted_event` both fail with `KeyError: 'vid'` in the broad run |
| REQ-INHEIRA-047, 050 (checkpoints) | **Failing** | `test_checkpoints_and_close_on_version_submit` fails with "no open checkpoint found" in the broad run |
| REQ-INHEIRA-051 | **Yes** | `test_mci_v3_0.py` — 11/11 green |
| REQ-INHEIRA-052 | **Yes** | `test_comparison_v3_1.py` — 16/16 green |
| REQ-INHEIRA-053 – 055 | **Yes** | `test_voice_evidence_v2_2.py` — 21/21 green, including speaker assignment and moment review |
| REQ-INHEIRA-056, 057 | **Partial** | Insight generation is exercised; output correctness is not asserted |
| REQ-INHEIRA-058 | **Yes** | Share creation and its 403 are covered |
| REQ-INHEIRA-059 | **No** | **Plaintext password storage is untested** |
| REQ-INHEIRA-060 | **Partial** | The 404 and expiry paths are covered; the password branch is not |
| REQ-INHEIRA-061, 062 | **No** | **That the public report returns signatures and ignores `audience` is untested** |
| REQ-INHEIRA-063 – 065 | **No** | **Upload validation and file-download ownership are entirely untested** |
| REQ-INHEIRA-066 | **Partial** | Integration toggles are exercised as local state |

**Summary:** 66 requirements. **21 Yes**, **17 Partial**, **25 No**, **3 Failing** (the auto-doc checkpoint and version-event tests in the broadest recorded run). The evidence, MCI, comparison and voice subsystems are genuinely well tested — those four suites are the strongest part of this application. Access control is the systematic blind spot: every endpoint that *has* a membership check is tested, and no test probes the endpoints that lack one.

---

## 3. SPEC GAP ANALYSIS

**Specs compared:** `INHEIRA_Product_Specification_v1.0 (2) (1).pdf` (11 pp., canonical, "Module 6 of 10"), `INHEIRA_Workflow.pdf`, and seven `docs/*.md` specifications including `INHEIRA_Technical_Specification_v1.0.md`, `INHEIRA_Creative_Evidence_Intelligence_Spec_v1.0.md`, `INHEIRA_Creative_Interpretation_Framework_Spec_v1.0.md` and `INHEIRA_Canonical_Restoration_Plan_v1.0.md`.

### (a) Specified but NOT implemented in code

| # | Spec source | Requirement | Code state |
|---|---|---|---|
| G1 | §10 Authentication | **"INHEIRA™ uses ANCRID™ exclusively. No independent login. Permissions and identity are inherited from ANCRID™."** | INHEIRA implements **two independent identity providers** — local bcrypt/JWT and an Emergent Google exchange — with its own user store and session table. No ANCRID client exists. |
| G2 | §09 Module Integrations (9 modules) | Consume assignments from ANCRA, sessions from ANCRLAB, writing rooms from ANCRSync, mentorship from COHEIR, royalties from Vaulta, releases from ANCRMEDIA, reputation from ANCRD, readiness from ANCRLaunch | **No outbound integration exists.** `/api/integrations` toggles local boolean flags and contacts nothing (REQ-INHEIRA-066). |
| G3 | §07 **Publishing Command Center™** | Release Readiness · Metadata Validation · **ISRC** · **UPC** · **ISWC** · **IPI** · Publisher Information · **PRO Registration** · Artwork · Credits · Release Checklist · Distribution Readiness | **None of the industry identifier fields exists** — no ISRC, UPC, ISWC or IPI anywhere in the data model — and there is no PRO registration, metadata validation, artwork or release checklist. For a rights product this is the largest functional gap. |
| G4 | §07 **Rights Management™** | Publishing · Composition · Master · **Neighboring** · **Mechanical** · **Performance** · **Synchronization** rights · Licensing · Registration Status | Splits are a single undifferentiated percentage per collaborator (REQ-INHEIRA-036). **There is no separation of composition from master, no rights-type breakdown and no registration status.** The `royalties` seed has neighbouring/mechanical/sync income fields but nothing populates or apportions them. |
| G5 | §07 **Ownership Dashboard™** | Includes **Conflict Detection** and per-category tracking (lyrics, composition, publishing, master, producer credits, performance rights) | No conflict detection exists. Ownership is one flat split list. |
| G6 | §07 **Life of a Song™** — "the flagship experience of INHEIRA™" | A permanent visual timeline across 17 stages from Idea through Release, Playlist Placement, Performance History, Awards and **Legacy Archive™** | The session timeline records creative events well (REQ-INHEIRA-045), but **there is no stage model** — no demo, studio recording, production, mixing, mastering, distribution, release, playlist, performance or awards stage, and no Legacy Archive. |
| G7 | §07 Voice Memos™ | **Automatic Transcription** · Search · Version History | Voice recordings are analysed into speaker-attributed moments (REQ-INHEIRA-053), which is more sophisticated than the spec asks — but **there is no transcript search and no voice-memo version history**. |
| G8 | §07 Song Workspaces™ | Overview · Lyrics · **Melody** · **Chords** · **Arrangement** · Voice Memos · Files · Collaborators · Chat · Rights · Publishing · Analytics | **Melody, chords and arrangement have no model, endpoint or storage.** |
| G9 | §07 Writing Rooms™ | **Real-Time Collaboration** · Multiple Writers · Producer Participation · Voice Notes · Comments · Creative Timeline · Version History · Session Recording | There is **no real-time transport** — no WebSocket, SSE or polling. Lyrics and messages are store-and-reload, so "real-time collaboration" in a shared writing room does not function as specified. |
| G10 | §07 Song Analytics™ | Creative Activity · Collaboration · Publishing Status · Rights Status · Release Readiness · Portfolio Growth · Career Growth | No analytics surface exists. |
| G11 | §06 Primary Navigation (17 items) | Includes **My Songs**, **Publishing**, **Ownership**, **Creator Passport™**, **Analytics**, **Voice Memos**, **Settings** as distinct destinations | Several have no route; the Creator Passport page exists in the frontend but is not backed by any ANCRID data (G1). |
| G12 | §13 Engineering Notes | "**Financial records remain within Vaulta™.**" | INHEIRA writes and owns a `royalties` collection with performance, mechanical, sync and neighbouring income fields (REQ-INHEIRA-041, 043). |
| G13 | §12 Future Roadmap | Global Song Registry · Label & Publisher Portals · Music Supervisor Marketplace · AI Arrangement Studio · Royalty Forecast Engine · Sync Licensing Marketplace · Copyright Office Integrations · Smart Contract Support · Blockchain Verification · Legacy Archive™ · Creative Constitution™ · Catalog Intelligence™ | None implemented — correctly scoped as future. |

### (b) Implemented but NOT mentioned in the spec

| # | Code feature | Spec status |
|---|---|---|
| E1 | **Musical Contribution Index (MCI)** — a dedicated 245-line module with its own refresh endpoint and 11 tests. | Appears in `docs/*.md` but **not in the canonical Product Specification**. It is a substantial analytical subsystem absent from the canonical document. |
| E2 | **Comparison analysis** (`comparison.py`, 215 lines, 16 tests) — version-to-version creative comparison. | Not in the canonical spec. |
| E3 | **Voice evidence with speaker attribution and human moment review** (`media_evidence.py`, 517 lines, 21 tests) — speaker assignment, per-moment review and reclassification (REQ-INHEIRA-053 – 055). | §07 specifies Voice Memos with transcription; **speaker-attributed evidence with a human-review loop is a materially different and more ambitious capability**, and it is the strongest part of the build. |
| E4 | **Evidence checkpoints and `populate-since` backfill** (REQ-INHEIRA-047). | Not in the canonical spec; documented only in the CEI markdown spec. |
| E5 | **Public share reports with audience labels and passwords** (REQ-INHEIRA-058 – 062). | The spec names no sharing mechanism at all. The implementation exposes signatures and splits through an unauthenticated link. |
| E6 | **Open session join** — any authenticated user may join any session by id or invite code and become a signing collaborator (REQ-INHEIRA-020, 021). | Unspecified. For a rights product this is a consequential access decision made implicitly. |
| E7 | **AI-suggested splits with silent rule-based fallback** (REQ-INHEIRA-032 – 034). | §08 lists "Ownership Assistance" among AIAH capabilities but specifies no split-suggestion model, no normalisation rule and no confidence semantics. |
| E8 | **Emergent Google OAuth conferring `verification_status: "verified"`** (REQ-INHEIRA-006). | §10 forbids independent login; automatic verification from a consumer Google account is a further unspecified trust decision. |

---

## 4. UNCLEAR / NEEDS INPUT

**Q1 — Session-token expiry is not checked on the bearer path.**
`get_current_user` validates `expires_at` for cookie sessions but not when the same token arrives as `Authorization: Bearer` (REQ-INHEIRA-008 vs 009). A session token presented as a header is valid indefinitely. I have not changed this. Confirm the header path should apply the same expiry check.

**Q2 — Anyone can join any session and become a signing collaborator.**
`POST /sessions/{id}/join` requires only a session id and adds the caller to `collaborators` (REQ-INHEIRA-020). Once joined, their signature is required to finalise splits (REQ-INHEIRA-021), and they appear in the evidence record. Should joining require the invite code only, an owner approval, or an explicit invitation?

**Q3 — Lyric edit and delete have no membership or authorship check.**
`PUT` and `DELETE /sessions/{id}/lyrics/{line_id}` are open to any authenticated user, and the resulting evidence event attributes the change to them (REQ-INHEIRA-025, 026). For a product whose premise is provable authorship, this is the most consequential gap. Should edits be restricted to the line's author, to collaborators, or to the owner?

**Q4 — Session detail, lyrics, contributions and evidence reads are unscoped.**
`GET /sessions/{id}`, `/lyrics`, `/contributions` and `/evidence` return full data to any authenticated caller while their write counterparts enforce membership (REQ-INHEIRA-019, 027, 031, 046). Is the asymmetry intentional, and what is the intended read boundary?

**Q5 — The public report ignores its own `audience` field.**
Every share link returns the full session including `splits` and `signatures` regardless of the audience it was created for (REQ-INHEIRA-061, 062). What should each audience see? A publisher link and an A&R link presumably should not both expose signed rights agreements.

**Q6 — Share-link passwords are stored and compared in plaintext.**
(REQ-INHEIRA-059.) Should they be hashed, and should the comparison be constant-time?

**Q7 — File downloads have no ownership check.**
`GET /api/files/{path}` serves any file to any authenticated user (REQ-INHEIRA-065), and uploads have no MIME or size validation (REQ-INHEIRA-063). What is the intended access rule — owner, session collaborators, or share-link holders?

**Q8 — Uploads can attach evidence to sessions the uploader is not on.**
Passing any `session_id` writes a `file_uploaded` evidence event against it (REQ-INHEIRA-064). Should the collaborator check from the lyric-write path apply here?

**Q9 — Signatures are erasable.**
Re-proposing splits resets `signatures` to `{}` (REQ-INHEIRA-038), and a signature is a caller-supplied free-text string with no cryptographic binding (REQ-INHEIRA-042). Is that the intended model — a fresh proposal invalidates all prior consent — and should prior signature rounds be preserved in the evidence trail rather than discarded?

**Q10 — Split normalisation tolerance.**
Suggestions within 0.5 of 100 are returned uncorrected (REQ-INHEIRA-034), while `PUT /splits` accepts the same tolerance (REQ-INHEIRA-037). A finalised agreement can therefore total 99.6%. Should the stored value be forced to exactly 100?

**Q11 — Silent AI fallback on split suggestions.**
A model or parse failure logs a warning and returns rule-based splits with `source: "rule"` and `confidence: 0.6` (REQ-INHEIRA-033). Does the UI surface that distinction to the user proposing a rights agreement? If not, a rule-based guess may be presented as AI analysis.

**Q12 — Rights types are not modelled.**
The spec requires composition, master, publishing, mechanical, performance, neighbouring and synchronisation rights to be tracked separately (G4); the code has one flat percentage. Which types must v1 distinguish, and does the split-approval flow need to run per rights type?

**Q13 — Industry identifiers are absent.**
No ISRC, UPC, ISWC or IPI field exists anywhere (G3). Are these in scope for this application, and which module registers a work with a PRO?

**Q14 — Royalty income has no ingestion path.**
`royalties` is seeded at zero on finalisation and never written again (REQ-INHEIRA-043), while §13 states financial records belong to Vaulta (G12). Should INHEIRA hold royalty records at all, or emit a `rights.splits_approved` event and let Vaulta own the ledger?

**Q15 — The three failing auto-doc tests.**
`test_checkpoints_and_close_on_version_submit`, `test_version_evidence_added_event` and `test_acknowledgement_submitted_event` fail in the 84-test run but pass in the isolated 42-test run of the same suite. Is this cross-suite state contamination in the fixtures, or a genuine defect in checkpoint bookkeeping? A re-run against the current checkout would settle it; I have not run one.

**Q16 — "Real-time" writing rooms are not real-time.**
The spec's Writing Rooms require real-time collaboration (G9); the implementation is store-and-reload with no transport. Is real-time in scope for v1, and if so does it belong here or in the ANCRSync collaboration service?

**Q17 — Google sign-in confers verified status.**
An Emergent Google exchange sets `verification_status: "verified"` with no further check (REQ-INHEIRA-006). What should "verified" mean in a rights context, and who is authoritative for it — presumably ANCRID?

**Q18 — No roles anywhere.**
The spec names 13 user types including publishers, A&R, attorneys and PRO administrators (§04), while the code has no role field at all (REQ-INHEIRA-012). Which of those need distinct permissions, particularly around viewing splits and signatures?
