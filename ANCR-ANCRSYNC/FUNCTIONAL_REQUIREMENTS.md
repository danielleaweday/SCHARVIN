# ANCRSync — Functional Requirements

**App folder:** `ANCR-ANCRSYNC`
**APPNAME:** `ANCRSYNC`
**Derived from:** `backend/server.py` (1,211 lines, 51 routes), `frontend/src/**` (21 pages)
**Stack observed:** FastAPI + Motor/MongoDB; bcrypt + JWT (HS256) bearer; Claude Sonnet 4.5; LiveKit WebRTC; React + React Router + axios
**Date of extraction:** 2026-09-04

> ### Identity notice — two folders, one name
> This workspace contains **two** folders whose names differ only by a trailing hyphen:
> - **`ANCR-ANCRSYNC`** (this folder) — `FastAPI(title="ANCRSync API")`, with workspaces, studios, shared sessions, channels, presence and LiveKit. **This is the genuine ANCRSync collaboration product.**
> - **`ANCR-ANCRSYNC-`** (trailing hyphen) — audited separately; its code is actually **ANCRLaunch** (career placement, readiness scoring, employer search) and contains no collaboration features at all.
>
> The **ANCRSync product specification PDF currently sits in the wrong folder** — it is filed under `ANCR-ANCRSYNC-/` alongside the ANCRLaunch code. This audit compares this folder's code against that specification, which is the correct pairing.
>
> **Requirement-ID collision:** the `ANCR-ANCRSYNC-` audit used the prefix `REQ-ANCRSYNC-###` per folder-derived naming, but documents ANCRLaunch behaviour. This document uses `REQ-ANCRSYNC-###` for the product that actually owns the name. The other document's identifiers should be renumbered to `REQ-ANCRLAUNCH-###`. See Q1.

---

## 1. FUNCTIONAL REQUIREMENTS

### 1.1 Authentication and identity

**REQ-ANCRSYNC-001**
**Given** `POST /api/auth/signup`
**When** the email already exists
**Then** it raises **400 `"Email already registered"`**; otherwise a user is created with a bcrypt hash, a deterministic avatar colour selected by name length, and resolved geographic coordinates, and a Creative Passport entry is logged.

**REQ-ANCRSYNC-002**
**Given** signup input
**When** it is validated
**Then** `SignupIn` requires name, a valid email and a password, with `role` defaulting to `"Creator"` and `discipline` to `"Multidisciplinary"`. **There is no password strength rule, no rate limiting and no email verification.**

**REQ-ANCRSYNC-003**
**Given** a signup payload containing `role`
**When** the document is written
**Then** the value is stored verbatim — **any role is self-assignable at registration**, including Faculty and Mentor.

**REQ-ANCRSYNC-004**
**Given** `POST /api/auth/login`
**When** the email is unknown or the password wrong
**Then** both raise **401 `"Invalid credentials"`** — no user enumeration.

**REQ-ANCRSYNC-005**
**Given** a token is minted
**When** `create_token` runs
**Then** it carries `sub`, `iat` and `exp` at **30 days**, signed HS256.

**REQ-ANCRSYNC-006**
**Given** the application starts
**When** `JWT_SECRET` is read
**Then** it falls back to the literal string **`'dev-secret'`** when the environment variable is absent. A deployment missing that variable signs every session token with a publicly-known value, allowing anyone to forge a token for any user.

**REQ-ANCRSYNC-007**
**Given** any protected endpoint
**When** `get_current_user` runs
**Then** a missing credential raises **401 `"Not authenticated"`**, a JWT error **401 `"Invalid token"`**, and an unknown `sub` **401 `"User not found"`**. The user document is re-read on every request.

**REQ-ANCRSYNC-008**
**Given** `POST /api/ancrid/federated`
**When** it is called
**Then** it accepts `{source, email, display_name?, role?, discipline?, city?, country?}` and **requires no authentication of any kind**. If a user with that email exists it returns a valid 30-day token for that account. If none exists it creates one with a random password and returns a token.

**REQ-ANCRSYNC-009**
**Given** the federated endpoint
**When** an arbitrary caller supplies an existing user's email address
**Then** **they receive a working session token for that user.** There is no shared secret, no signature from the claimed source system, no allow-list of source values, and no verification that the caller controls the address. This is a complete authentication bypass for every account in the system.

**REQ-ANCRSYNC-010**
**Given** `GET /api/auth/me`
**When** called
**Then** the caller's own user document is returned with `password_hash` projected out.

**REQ-ANCRSYNC-011**
**Given** the application
**When** a user looks for account management
**Then** **there is no logout, no token revocation, no password reset and no password change.** A 30-day token remains valid for its full life.

### 1.2 Workspaces

**REQ-ANCRSYNC-012**
**Given** `GET /api/workspaces`
**When** called
**Then** only workspaces whose `members` array contains the caller are returned, newest first — correctly scoped.

**REQ-ANCRSYNC-013**
**Given** `POST /api/workspaces`
**When** a workspace is created
**Then** the caller becomes `owner_id` and the sole member, four default milestones are seeded (Kickoff marked done, then First Draft, Review, Delivery), and a Creative Passport project entry is logged.

**REQ-ANCRSYNC-014**
**Given** `GET /api/workspaces/{ws_id}`
**When** any authenticated user calls it with any workspace id
**Then** **the full workspace is returned with no membership check** — tasks, comments, milestones and asset list included. The list endpoint is scoped; the detail endpoint is not.

**REQ-ANCRSYNC-015**
**Given** `POST /api/workspaces/{ws_id}/tasks`
**When** called
**Then** a task is appended with the caller's name as default assignee. **Membership is not checked** — any authenticated user can add tasks to any workspace. An unknown id raises **404 `"Workspace not found"`**.

**REQ-ANCRSYNC-016**
**Given** `POST /api/workspaces/{ws_id}/tasks/{task_id}/toggle`
**When** called
**Then** the task's status flips between `done` and `todo`. **Membership is not checked.** A task id that matches nothing silently succeeds with `{"ok": true}`.

**REQ-ANCRSYNC-017**
**Given** `POST /api/workspaces/{ws_id}/comments`
**When** called
**Then** a comment is appended carrying the author's id, name and avatar colour. **Membership is not checked** — any authenticated user can post into any workspace's comment thread.

**REQ-ANCRSYNC-018**
**Given** the workspace model
**When** a member is added or removed
**Then** **no endpoint exists to invite, add or remove a member.** A workspace permanently has exactly one member — its creator — so the collaboration product's core unit cannot actually be shared.

### 1.3 Studios and shared sessions

**REQ-ANCRSYNC-019**
**Given** `GET /api/studios`
**When** the collection is empty
**Then** ten default studios are seeded on first read — Songwriting, Recording, Production, Film, Animation, Photography, Podcast, Brand, Creative Strategy and Innovation — each with a name, description and an `activity` value of Live, Idle or Scheduled.

**REQ-ANCRSYNC-020**
**Given** a studio's `activity` value
**When** it is displayed
**Then** it is a **fixed seeded string**, not a live occupancy signal. A studio labelled "Live" is not necessarily occupied.

**REQ-ANCRSYNC-021**
**Given** `POST /api/studios/{studio_id}/join`
**When** called
**Then** a Creative Passport entry is logged and `{"ok": true}` returned. **No membership, capacity or occupancy state is recorded** — joining a studio changes nothing server-side.

**REQ-ANCRSYNC-022**
**Given** `GET /api/sessions`
**When** any authenticated user calls it
**Then** **every session in the database is returned**, sorted by start time — not filtered to the caller's own sessions, invitations or workspaces.

**REQ-ANCRSYNC-023**
**Given** `POST /api/sessions`
**When** a session is created
**Then** it records title, optional workspace and studio, start time, duration, an `invitees` list, the host, status `"scheduled"`, and empty `recording_summary` and `action_items`.

**REQ-ANCRSYNC-024**
**Given** `POST /api/sessions/{sid}/join`
**When** any authenticated user calls it
**Then** a Passport collaboration entry is logged and `{"ok": true}` returned. **The `invitees` list is never consulted** — anyone may join any session, and no attendance record is stored.

### 1.4 Real-time collaboration (LiveKit)

**REQ-ANCRSYNC-025**
**Given** `GET /api/livekit/config`
**When** called **without authentication**
**Then** it returns `{enabled, url}`, where `enabled` is true only when `LIVEKIT_URL`, `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` are all present. The server URL is disclosed to unauthenticated callers.

**REQ-ANCRSYNC-026**
**Given** `POST /api/livekit/token`
**When** LiveKit is not configured
**Then** it raises **501** with a message naming the three required environment variables.

**REQ-ANCRSYNC-027**
**Given** LiveKit is configured
**When** an authenticated user requests a token
**Then** an access token is minted with `room_join`, `can_subscribe`, and `can_publish` taken from the request body, scoped to the room name **supplied by the caller**, with a 6-hour TTL.

**REQ-ANCRSYNC-028**
**Given** the token request
**When** the room name is validated
**Then** **it is not.** The caller names any room and receives a publish-capable token for it. There is no check that the room corresponds to a session they were invited to, a studio they belong to, or a workspace they are a member of. Any authenticated user can join and broadcast into any live room, including private sessions in progress.

**REQ-ANCRSYNC-029**
**Given** the token request
**When** `identity` is supplied
**Then** the caller-provided value is used verbatim as the LiveKit participant identity, defaulting to `user-{id}`. **A caller may present themselves in the room under another identity string.**

### 1.5 Shared creation surface

**REQ-ANCRSYNC-030**
**Given** `GET /api/creation/{ws_id}`
**When** no creation document exists
**Then** one is **created on first read**, seeded with an empty lyric sheet, a default arrangement, a fixed four-bar chord progression, and two whiteboard notes containing invented content (a Bon Iver reference and a production suggestion).

**REQ-ANCRSYNC-031**
**Given** `POST /api/creation/{ws_id}`
**When** `kind` is not one of `lyrics`, `arrangement`, `chords`, `whiteboard`
**Then** it raises **400 `"Invalid kind"`**; otherwise the named field is overwritten wholesale and the document upserted. **Membership is not checked.**

**REQ-ANCRSYNC-032**
**Given** two users editing the same field
**When** both save
**Then** **the last write wins silently.** There is no locking, no merge, no revision history and no conflict detection on the shared creative surface.

**REQ-ANCRSYNC-033**
**Given** the shared creation surface
**When** one user edits
**Then** **no other participant is notified.** There is no WebSocket, no SSE and no polling — the collaborative editor only reflects another person's changes after a manual refetch.

### 1.6 Shared assets

**REQ-ANCRSYNC-034**
**Given** `GET /api/assets/{ws_id}`
**When** the workspace has no assets
**Then** **four fabricated asset records are written to the database on first read** — `Aurora_hook_v3.wav`, `Aurora_lyrics.docx`, `Aurora_stems.zip` and `Cover_reference.jpg`, with invented sizes and version numbers, attributed to the calling user as uploader.

**REQ-ANCRSYNC-035**
**Given** `POST /api/assets`
**When** called
**Then** a metadata record is stored — name, kind, a **size string**, a version label and uploader name. **No file is transferred.** There is no upload endpoint, no storage backend and no download path anywhere in the application.

**REQ-ANCRSYNC-036**
**Given** an asset carries a `version` field
**When** a new version is added
**Then** it is an independent record with a free-text label. **There is no version lineage, no supersession and no revision history.**

### 1.7 Messaging

**REQ-ANCRSYNC-037**
**Given** `GET /api/channels`
**When** the collection is empty
**Then** four default channels are seeded: `# announcements`, `# songwriters`, `# producers`, `# aurora-ep`.

**REQ-ANCRSYNC-038**
**Given** `GET /api/channels`
**When** any authenticated user calls it
**Then** **every channel is returned regardless of membership.** The `ChannelIn` model accepts a `members` list, but the read path never filters on it.

**REQ-ANCRSYNC-039**
**Given** `GET /api/messages/{channel_id}` and `POST /api/messages`
**When** called
**Then** messages are read and posted **with no membership check on the channel**, including channels of kind `announcement`.

**REQ-ANCRSYNC-040**
**Given** the messaging surface
**When** a user looks for file sharing, reactions, read receipts or direct messages
**Then** **none exist.** `kind` accepts `dm` as a value but no direct-message pairing logic is implemented. Delivery is store-and-refetch with no real-time transport.

### 1.8 Mentorship, communities, reviews

**REQ-ANCRSYNC-041**
**Given** `GET /api/mentors` and `POST /api/mentors/request`
**When** called
**Then** a mentor list is returned and a request recorded, logging a Passport entry. **There is no acceptance, decline or scheduling step** — a request has no lifecycle and the mentor is never notified.

**REQ-ANCRSYNC-042**
**Given** `GET /api/communities` and `POST /api/communities/{cid}/join`
**When** called
**Then** communities are listed and joins recorded. **There is no leave endpoint.**

**REQ-ANCRSYNC-043**
**Given** `POST /api/reviews` and `GET /api/reviews/{ws_id}`
**When** called
**Then** a creative review is stored against a workspace and read back. **Membership is not checked on either path.**

**REQ-ANCRSYNC-044**
**Given** `POST /api/feedback`
**When** called
**Then** feedback is recorded with a `kind` of `comment`, `approval`, `change_request` or `voice`. **The `voice` kind stores no audio** — there is no recording or upload capability — and `approval` sets no state on the target.

### 1.9 Presence and discovery

**REQ-ANCRSYNC-045**
**Given** `GET /api/presence`
**When** called
**Then** up to 20 users are returned each with an `activity` label, colour and a "minutes ago" value. **Every one of these is synthesised** — the activity is selected by `md5(user_id) % len(templates)` and the elapsed time is `md5(user_id) % 45 + 1`.

**REQ-ANCRSYNC-046**
**Given** the presence values are derived from a hash of the user id
**When** the endpoint is polled repeatedly
**Then** each user's "activity" and "since" never change. **This is not presence** — no session, heartbeat or connection state is tracked anywhere. The Global Pulse surface presents these fixed values as live collaborator activity.

**REQ-ANCRSYNC-047**
**Given** `GET /api/discover`
**When** called
**Then** the response concatenates **fabricated `SAMPLE_CREATORS` entries with real registered users**, presented in one undifferentiated list with no marker distinguishing them.

**REQ-ANCRSYNC-048**
**Given** the sample creators are returned
**When** ids are assigned
**Then** each receives `new_id()` **generated fresh on every request**, so a sample creator's identifier changes between calls and cannot be linked, bookmarked or acted upon.

**REQ-ANCRSYNC-049**
**Given** a real user appears in discovery
**When** their record is built
**Then** `city` is populated from `u.get("country")` — **a field-mapping error placing the country value in the city field** — and `experience` is hard-coded to 1.

### 1.10 Ecosystem integrations

**REQ-ANCRSYNC-050**
**Given** `GET /api/ancrid/verify`
**When** called
**Then** it returns an aggregated cross-product identity payload. Workspace, session and passport counts are **real** (computed from this database). Everything else is **fabricated**: Vaulta reports a balance of `1284.50` and pending royalties of `342.80`, ANCRLAB reports `24` tracks, ANCRLaunch `2` releases and `1` campaign, ANCRA `3` active and `12` completed courses — all literals, with `status: "active"` hard-coded.

**REQ-ANCRSYNC-051**
**Given** the verify payload
**When** `verified` is set
**Then** it is the literal `True` for every caller, and the ANCRID is derived locally as `ANCR-{first 8 chars of local user id, uppercased}` — **not issued by or checked against ANCRID.**

**REQ-ANCRSYNC-052**
**Given** `POST /api/inheira/sync/{ws_id}` and `GET /api/inheira/sync/{ws_id}`
**When** called
**Then** a synchronisation record is written and read locally. The in-code section header labels this **"Deep INHEIRA™ Integration (mock)"** — no outbound call is made to INHEIRA.

**REQ-ANCRSYNC-053**
**Given** `GET /api/ancrlab/{ws_id}` and `POST /api/ancrlab/{ws_id}/track`
**When** called
**Then** a multitrack mixer state is returned and per-track mute, solo and volume changes are persisted locally. **No DAW and no ANCRLAB service is contacted.**

### 1.11 AI and Creative Passport

**REQ-ANCRSYNC-054**
**Given** `POST /api/ai/chat`
**When** `EMERGENT_LLM_KEY` is absent
**Then** it raises **500 `"LLM key not configured"`** — an explicit pre-check with no fabricated fallback.

**REQ-ANCRSYNC-055**
**Given** an AI request
**When** the system prompt is selected
**Then** `context` chooses among five prompts — `summary`, `action_items`, `recommend`, `skill_match`, `general` — and the model used is `anthropic / claude-sonnet-4-5-20250929`. An unrecognised context falls back to `general`.

**REQ-ANCRSYNC-056**
**Given** the AI request
**When** the prompt is assembled
**Then** **only the caller's free-text prompt is sent.** No workspace, session, task or collaborator context is injected server-side, so "summarise this session" has no session data to work from.

**REQ-ANCRSYNC-057**
**Given** `POST /api/sessions/{sid}/ai-summary`
**When** called
**Then** the model is asked to **"Produce a realistic session summary"** from only the session's title, duration and host name. The result is written to `recording_summary` and the session status set to `"completed"`.

**REQ-ANCRSYNC-058**
**Given** no recording, transcript or notes exist for the session
**When** the summary is generated and stored
**Then** **the output is invented by the model and persisted as a record of what occurred**, including "creative decisions" and "one blocker" that the prompt explicitly requests. It is presented in the UI as the session's summary.

**REQ-ANCRSYNC-059**
**Given** a material action occurs — signup, workspace creation, session scheduling or joining, studio join, mentor request
**When** it completes
**Then** `log_passport` writes a Creative Passport entry with `verified: True` **set unconditionally on every entry**, regardless of whether anything was verified.

**REQ-ANCRSYNC-060**
**Given** `GET /api/passport`
**When** called
**Then** the caller's own Passport entries are returned — correctly scoped.

**REQ-ANCRSYNC-061**
**Given** `GET /api/dashboard`
**When** called
**Then** it returns the caller's workspace and session counts, four of each, four studios, their Passport count and six recent entries. Workspaces and sessions are correctly scoped to the caller.

---

## 2. TEST COVERAGE

**Test assets found**
- `backend/tests/backend_test.py` — 180 lines, **15 test functions**.
- `test_reports/pytest/pytest_results.xml` — **15 tests, 0 failures, 0 errors**, 11.232s, timestamped 2026-07-07T02:18:23Z.
- `test_reports/iteration_1.json` — single iteration record.
- `test_result.md` — protocol boilerplate only, data section empty.
- **No frontend tests.**

| Requirement | Covered | Evidence / gap |
|---|---|---|
| REQ-ANCRSYNC-001 | **Yes** | `test_signup_duplicate` asserts the 400 |
| REQ-ANCRSYNC-002, 003 | **No** | **Self-assignable role, absent password policy and absent rate limiting are untested** |
| REQ-ANCRSYNC-004 | **Yes** | `test_login_success` and `test_login_bad` |
| REQ-ANCRSYNC-005, 006 | **No** | **The `dev-secret` fallback is untested** — no test asserts a secret is configured |
| REQ-ANCRSYNC-007 | **Yes** | `test_me` and `test_me_unauth` |
| REQ-ANCRSYNC-008, 009 | **No** | **`/ancrid/federated` has no test at all.** The authentication bypass is entirely unexercised |
| REQ-ANCRSYNC-010 | **Yes** | `test_me` |
| REQ-ANCRSYNC-011 | **No** | Absent logout/revocation — nothing to test |
| REQ-ANCRSYNC-012, 013 | **Yes** | `test_create_and_list` covers creation and scoped listing |
| REQ-ANCRSYNC-014 – 017 | **No** | **No test attempts to read or write another user's workspace.** Every workspace authorisation gap is untested |
| REQ-ANCRSYNC-018 | **No** | The absence of member management is untested |
| REQ-ANCRSYNC-019 | **Yes** | `test_list_seeds` asserts the ten default studios |
| REQ-ANCRSYNC-020, 021 | **Partial** | `test_join` asserts the join succeeds; that it records nothing is not challenged |
| REQ-ANCRSYNC-022 – 024 | **Partial** | `test_create_and_get` covers session creation and read; **that listing is unscoped and invitees are ignored is untested** |
| REQ-ANCRSYNC-025 – 029 | **No** | **The entire LiveKit path is untested**, including the arbitrary-room grant and caller-supplied identity |
| REQ-ANCRSYNC-030 – 033 | **No** | Shared creation, its read-side seeding, last-write-wins and the absence of real-time are untested |
| REQ-ANCRSYNC-034 – 036 | **No** | **Asset auto-seeding on read is untested**, as is the absence of file transfer |
| REQ-ANCRSYNC-037 – 040 | **No** | Channels and messaging are entirely untested |
| REQ-ANCRSYNC-041 – 044 | **No** | Mentorship, communities, reviews and feedback are untested |
| REQ-ANCRSYNC-045, 046 | **No** | **That presence is a hash-derived fabrication is untested** |
| REQ-ANCRSYNC-047 – 049 | **Partial** | `test_global_creators` asserts a list returns; **the mixing of fabricated and real records, unstable ids and the city/country mapping error are not detected** |
| REQ-ANCRSYNC-050, 051 | **No** | **`/ancrid/verify` and its fabricated cross-product figures are untested** |
| REQ-ANCRSYNC-052, 053 | **No** | INHEIRA and ANCRLAB mock integrations are untested |
| REQ-ANCRSYNC-054, 055 | **Yes** | `test_ai_chat` asserts a response |
| REQ-ANCRSYNC-056 | **No** | The absence of injected context is untested |
| REQ-ANCRSYNC-057, 058 | **Partial** | `test_ai_summary` asserts a summary is produced and stored — **it does not challenge that the content is invented** |
| REQ-ANCRSYNC-059 | **No** | The unconditional `verified: True` is untested |
| REQ-ANCRSYNC-060, 061 | **Yes** | `test_passport` and `test_dashboard` |

**Summary:** 61 requirements. **10 Yes**, **6 Partial**, **45 No**. The recorded run is green, but the suite covers only happy paths on nine endpoints out of 51. It contains **no authorisation test of any kind** — nothing attempts to access another user's workspace, session, channel or LiveKit room, which is why every access-control finding in this document sits outside its reach.

---

## 3. SPEC GAP ANALYSIS

**Spec compared:** `ANCRSync_Product_Specification_v1_0 (1) (1).pdf` (9 pp., canonical, "Module 4 of 10") — **currently filed in the `ANCR-ANCRSYNC-` folder**, alongside the ANCRLaunch code rather than this one.

### (a) Specified but NOT implemented in code

| # | Spec source | Requirement | Code state |
|---|---|---|---|
| G1 | §10 Authentication | **"ANCRSync™ uses ANCRID™ exclusively. No independent login. Permissions and identity are inherited from ANCRID™."** | A complete local identity store — signup, login, bcrypt, locally-minted 30-day JWTs — **plus** an unauthenticated `/ancrid/federated` endpoint that issues tokens for arbitrary email addresses (REQ-ANCRSYNC-008, 009). This is further from the requirement than any other module audited. |
| G2 | §07 Creative Workspaces™ | Shared Projects · Tasks · Milestones · Comments · Shared Assets · AI Suggestions · Creative Reviews · **Version History** | Tasks, milestones, comments and reviews exist. **Version history does not** (REQ-ANCRSYNC-036). More fundamentally, workspaces **cannot be shared** — there is no way to add a second member (REQ-ANCRSYNC-018), so the shared-project premise does not function. |
| G3 | §07 Studio Room™ | Video Conferencing · Audio · Screen Sharing · **Recording** · **Waiting Room** · **Presenter Mode** · Live Chat · **Auto Transcription** · AI Session Summary | LiveKit provides video, audio and screen sharing. **Recording, waiting room, presenter mode and auto-transcription are all absent.** The AI Session Summary exists but summarises nothing real (REQ-ANCRSYNC-058). |
| G4 | §07 Shared Sessions™ | Global Scheduling · Invitations · **Time Zone Awareness** · **Attendance** · Session Notes · AI Summaries · Whiteboards · **Recording History** | Sessions can be created with an `invitees` list, but **invitations are never delivered or enforced** (REQ-ANCRSYNC-024), **attendance is not recorded**, there is no time-zone handling, and no recording history. |
| G5 | §07 Writing Rooms™ | **Real-Time Lyrics** · Shared Chords · Shared Arrangements · **Voice Notes** · Comments · Creative Timeline | The lyrics, chords and arrangement surfaces exist but are **not real-time** (REQ-ANCRSYNC-033) and have no conflict handling (REQ-ANCRSYNC-032). Voice notes are not implemented — the `voice` feedback kind stores no audio (REQ-ANCRSYNC-044). |
| G6 | §07 Creative Review™ | Waveform Review · **Timestamp Comments** · Asset Review · Reviewer Identity · Audio Review · Video Review · **Approval Tracking** | A flat review record exists. **There is no waveform, no timestamped comment anchoring, and no approval state** — an `approval` feedback kind is stored but sets nothing (REQ-ANCRSYNC-044). |
| G7 | §07 Messaging™ | Direct Messages · Group Channels · **File Sharing** · Collaboration Requests · **Reactions** · Announcements · **Read Receipts** | Group channels exist and are unscoped. **Direct messages, file sharing, reactions and read receipts are all absent** (REQ-ANCRSYNC-040). |
| G8 | §07 Collaboration Analytics™ | Active Projects · Team Participation · **Collaboration Hours** · Session Activity · Workspace Growth · Community Engagement · Global Participation | **Entirely absent.** No analytics endpoint or surface exists. Collaboration hours cannot be computed because attendance is never recorded (G4). |
| G9 | §09 Module Integrations (9 modules) | Consume identity from ANCRID, learning teams from ANCRA, projects and DAW from ANCRLAB, mentorship from COHEIR, publishing from INHEIRA, budgets from VAULTA, releases from ANCRMEDIA, networking from ANCRD, collaboration history to ANCRLAUNCH | **No outbound call is made to any module.** The INHEIRA integration is labelled "(mock)" in the source; ANCRLAB is a local mixer; `/ancrid/verify` returns fabricated figures (REQ-ANCRSYNC-050). |
| G10 | §07 Global Discovery™ / Global Pulse™ | Worldwide Creator Activity · Live Institution Activity · Active Collaborations · Recent Sessions · **Global Time Zones** · Passport Activity | The Global Pulse surface is driven by **hash-derived fabricated presence** (REQ-ANCRSYNC-045, 046). Discovery mixes invented creators with real users (REQ-ANCRSYNC-047). |
| G11 | §07 Shared Studios™ | Nine discipline studios with real occupancy | Ten studios are seeded with **fixed activity labels** that do not reflect occupancy (REQ-ANCRSYNC-020), and joining records nothing (REQ-ANCRSYNC-021). |

### (b) Implemented but NOT mentioned in the spec

| # | Code feature | Spec status |
|---|---|---|
| E1 | **`POST /ancrid/federated`** — unauthenticated token issuance for any email address (REQ-ANCRSYNC-008, 009). | Unspecified. §10 requires identity to be *inherited from* ANCRID; this endpoint instead *mints* ANCRSync sessions on an unverified claim, which is the inverse of the requirement and the most severe access-control finding across all thirteen applications audited. |
| E2 | **`JWT_SECRET` defaulting to `'dev-secret'`** (REQ-ANCRSYNC-006). | Unspecified. Every other audited module requires the secret via `os.environ[...]` and fails to start without it. |
| E3 | **LiveKit integration** with caller-chosen room and identity (REQ-ANCRSYNC-027 – 029). | §07 specifies a Studio Room with video conferencing; the token model, room-naming scheme and authorisation rules are unspecified, and as built there are none. |
| E4 | **Read endpoints with write side effects** — `/studios`, `/channels`, `/creation/{ws_id}` and `/assets/{ws_id}` all seed records into the database on first GET (REQ-ANCRSYNC-019, 030, 034, 037). | Unspecified. The asset seeding is the most consequential: it invents four named files, with sizes, attributed to the calling user as uploader. |
| E5 | **AI-generated session summaries stored as records of fact** (REQ-ANCRSYNC-057, 058). | §07 lists "AI Summaries" as a Shared Sessions capability, but presumes a recording or transcript to summarise. Generating a plausible summary from a title alone, and persisting it as the session record, is an unspecified and materially misleading behaviour. |
| E6 | **`verified: True` written unconditionally on every Creative Passport entry** (REQ-ANCRSYNC-059). | §07 positions Creative Evidence and Passport activity as verified collaboration history feeding ANCRLAUNCH. Marking every entry verified with no verification undermines that contract at the source. |
| E7 | **Fabricated cross-product figures in `/ancrid/verify`** — Vaulta balance, royalties, ANCRLAB track count, ANCRA course counts (REQ-ANCRSYNC-050). | Unspecified, and the same pattern flagged in VAULTA's `/ecosystem/status`. Presents financial figures the module has no authority over. |
| E8 | **`SAMPLE_CREATORS` mixed into live discovery results with per-request ids** (REQ-ANCRSYNC-047, 048). | Unspecified. |

---

## 4. UNCLEAR / NEEDS INPUT

**Q1 — Two folders, one product name.**
`ANCR-ANCRSYNC` (this folder) is the real ANCRSync; `ANCR-ANCRSYNC-` contains ANCRLaunch code, and the ANCRSync specification PDF is filed there. Three corrections are needed: rename `ANCR-ANCRSYNC-` to `ANCR-ANCRLAUNCH`, move the ANCRSync spec PDF into this folder, and renumber that document's `REQ-ANCRSYNC-###` identifiers to `REQ-ANCRLAUNCH-###`. I have not renamed anything.

**Q2 — `POST /ancrid/federated` is an unauthenticated account takeover.**
Any caller can POST an existing user's email and receive a valid 30-day token for that account (REQ-ANCRSYNC-008, 009). There is no shared secret, no source signature and no allow-list. **This should be treated as the highest-priority item in this document.** What was the intended trust model — a signed assertion from the calling module, a pre-shared key per source, or removal of the endpoint pending real ANCRID SSO?

**Q3 — `JWT_SECRET` falls back to `'dev-secret'`.**
A deployment missing that variable signs all tokens with a known value (REQ-ANCRSYNC-006). Should this become a required environment variable that fails startup, matching every other module?

**Q4 — LiveKit tokens grant any room.**
The caller names the room and their own publish permission and identity (REQ-ANCRSYNC-027 – 029). For a video collaboration product this permits joining and broadcasting into any active private session. What binds a room to a session or workspace, and who may publish versus subscribe?

**Q5 — Workspaces cannot be shared.**
There is no endpoint to add a member (REQ-ANCRSYNC-018), so every workspace has exactly one member, while simultaneously **every** workspace is readable and writable by **any** authenticated user (REQ-ANCRSYNC-014 – 017). The permission model is inverted: the intended collaborators are excluded and everyone else is admitted. What is the intended invitation flow, and should all workspace routes enforce `members`?

**Q6 — Sessions ignore their invitee list.**
`invitees` is captured at creation and never consulted; listing returns every session in the system (REQ-ANCRSYNC-022, 024). Should sessions be visible only to host and invitees, and should joining be restricted to them?

**Q7 — Presence is fabricated.**
Activity labels and elapsed times are derived from `md5(user_id)` and never change (REQ-ANCRSYNC-045, 046). The Global Pulse surface presents them as live collaborator activity. Should real presence be implemented (heartbeat or LiveKit participant state), or should the surface be labelled until it can be?

**Q8 — AI session summaries invent the content they record.**
With no recording or transcript, the model is prompted to produce a "realistic" summary from a title, and the output is stored as the session's record and its status set to completed (REQ-ANCRSYNC-057, 058). Given these summaries feed the Creative Passport, which in turn is specified as verified collaboration history for ANCRLAUNCH, this propagates invented content into a career record. **Should summarisation be blocked until a transcript exists?**

**Q9 — Every Passport entry is marked verified.**
`verified: True` is unconditional (REQ-ANCRSYNC-059). What would actually constitute verification for a collaboration entry, and which entries should carry it?

**Q10 — GET endpoints that write.**
Four read endpoints seed records on first access (REQ-ANCRSYNC-019, 030, 034, 037). The asset seeding fabricates four named files attributed to the caller. Should these return empty states instead?

**Q11 — Assets store no files.**
Names, sizes and versions are metadata strings with no upload, storage or download (REQ-ANCRSYNC-035). Where should shared creative files actually live — ANCRLAB, an object store, or here?

**Q12 — No real-time transport.**
The shared creation surface, chat and whiteboard are all store-and-refetch with last-write-wins (REQ-ANCRSYNC-032, 033). For a product whose specification centres on real-time writing rooms, what is the intended mechanism — WebSocket, CRDT, or LiveKit data channels?

**Q13 — Channels are unscoped.**
Every channel including `# announcements` is readable and postable by any authenticated user, and the `members` field is accepted but never enforced (REQ-ANCRSYNC-038, 039). Who may post to an announcement channel?

**Q14 — Discovery mixes real and fabricated creators.**
`SAMPLE_CREATORS` are concatenated with real users, with ids regenerated per request and a city field populated from the country value (REQ-ANCRSYNC-047 – 049). Should sample data be removed, and is the city/country mapping a straightforward defect to fix?

**Q15 — `/ancrid/verify` reports figures it cannot know.**
Vaulta balances, royalty totals and course counts are literals (REQ-ANCRSYNC-050). Should the endpoint return only what this module can compute, with the rest marked unavailable until real integrations exist?

**Q16 — Mentor requests have no lifecycle.**
A request is logged and nothing follows — no notification, acceptance or scheduling (REQ-ANCRSYNC-041). What are the intended states?
