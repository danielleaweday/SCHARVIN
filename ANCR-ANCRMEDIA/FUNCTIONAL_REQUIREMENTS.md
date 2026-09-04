# ANCRMEDIA — Functional Requirements

**App folder:** `ANCR-ANCRMEDIA`
**APPNAME:** `ANCRMEDIA`
**Derived from:** `backend/server.py` (771 lines), `backend/seed_data.py`, `frontend/src/**`
**Stack observed:** FastAPI + Motor/MongoDB; bcrypt + JWT (HS256) in httpOnly cookies; React + React Router + axios + HTML5 `Audio` player
**Date of extraction:** 2026-09-03

---

## 1. FUNCTIONAL REQUIREMENTS

### 1.1 Seeding & platform

**REQ-ANCRMEDIA-001**
**Given** the application starts
**When** `ensure_seeded()` runs on the `startup` event
**Then** each of eleven content collections (`institutions`, `creators`, `albums`, `tracks`, `videos`, `podcasts`, `livestreams`, `playlists`, `challenges`, `events`) is populated **only when empty**, making content seeding idempotent.

**REQ-ANCRMEDIA-002**
**Given** seeding runs
**When** indexes are created
**Then** unique indexes are placed on `users.email` and `creators.handle`, and non-unique indexes on `creators.institution_id`, `tracks.album_id`, `tracks.artist_id`, `videos.artist_id` and `albums.artist_id`.

**REQ-ANCRMEDIA-003**
**Given** seeding runs
**When** demo users are provisioned
**Then** seven accounts are upserted: an administrator from `ADMIN_EMAIL`/`ADMIN_PASSWORD` (defaulting to `admin@ancrmedia.com` / `AdminPass2026!`), five students (`maya@`, `kenji@`, `zara@`, `luca@`, `noah@ancrmedia.com`, all `Creator2026!`) and one faculty member (`prof.hayes@ancrmedia.com`, `Faculty2026!`), each linked to a matching `creators` record by `creator_id`.

**REQ-ANCRMEDIA-004**
**Given** a demo user already exists
**When** the upsert runs
**Then** the account is left untouched **except** for the administrator: if the configured admin password no longer verifies, its `password_hash` is **silently reset** to the configured value on every startup.

**REQ-ANCRMEDIA-005**
**Given** seeding raises any exception
**When** `_startup` catches it
**Then** the error is logged and **the application starts anyway** in a partially- or un-seeded state.

**REQ-ANCRMEDIA-006**
**Given** any response containing a document
**When** `clean()` runs
**Then** both `_id` and `password_hash` are removed before serialisation.

**REQ-ANCRMEDIA-007**
**Given** `GET /api/` is called
**When** it responds
**Then** it returns `{"service": "ANCRMEDIA", "version": "1.0.0"}` without authentication.

### 1.2 Authentication

**REQ-ANCRMEDIA-008**
**Given** a visitor on `/register`
**When** the page mounts
**Then** `GET /api/institutions` populates an institution selector; a failure is swallowed by `.catch(() => {})` and the selector is left empty.

**REQ-ANCRMEDIA-009**
**Given** registration input
**When** `RegisterIn` validates
**Then** `email` must be a valid address, `password` must be at least 6 characters and `name` at least 1; `institution_id`, `discipline` and `role` are optional, with `role` defaulting to `"student"`. Violations return **422**.

**REQ-ANCRMEDIA-010**
**Given** a duplicate email
**When** `POST /api/auth/register` checks
**Then** it raises **400 `"Email already registered"`**. The email is lower-cased and trimmed first.

**REQ-ANCRMEDIA-011**
**Given** a successful registration
**When** the user is created
**Then** `creator_id` and `avatar` are set to `None` — **a self-registered account is never linked to a creator record**, and no mechanism exists to link one later.

**REQ-ANCRMEDIA-012**
**Given** registration succeeds
**When** the response is built
**Then** auth cookies are set **and** the access token is additionally returned in the JSON body as `access_token`, duplicating a credential that the httpOnly cookie was designed to keep out of JavaScript's reach.

**REQ-ANCRMEDIA-013**
**Given** a registrant supplies `role: "administrator"` or `role: "faculty"` in the request body
**When** the handler builds the document
**Then** the value is stored verbatim — **role is self-assigned at registration with no validation or approval**.

**REQ-ANCRMEDIA-014**
**Given** login credentials
**When** `POST /api/auth/login` runs
**Then** an unknown email or wrong password both raise **401 `"Invalid credentials"`**; success sets both cookies and returns the serialised user plus `access_token`.

**REQ-ANCRMEDIA-015**
**Given** cookies are issued
**When** `set_auth_cookies` runs
**Then** `access_token` is `httponly, secure, samesite=none` with a **6-hour** max-age and `refresh_token` with a **30-day** max-age, both scoped to `/`.

**REQ-ANCRMEDIA-016**
**Given** a request carrying credentials
**When** `get_current_user_optional` runs
**Then** it reads the `access_token` cookie first and falls back to an `Authorization: Bearer` header. **Any failure — missing token, wrong `type`, expired signature, unknown user — returns `None` rather than raising**, so optional-auth endpoints degrade silently.

**REQ-ANCRMEDIA-017**
**Given** a valid access token
**When** the user is resolved
**Then** the lookup is performed on **`{"email": payload["email"]}`**, not on the token's `sub` id. The `sub` claim is never used for identification on the access path.

**REQ-ANCRMEDIA-018**
**Given** `GET /api/auth/me`
**When** no valid credential is present
**Then** it raises **401 `"Not authenticated"`**.

**REQ-ANCRMEDIA-019**
**Given** `POST /api/auth/logout`
**When** it is called
**Then** both cookies are deleted and `{"ok": true}` returned. **The endpoint has no authentication dependency** — it is callable anonymously — and the tokens themselves are never invalidated server-side.

**REQ-ANCRMEDIA-020**
**Given** `POST /api/auth/refresh`
**When** it runs
**Then** a missing cookie raises **401 `"No refresh token"`**, a non-refresh `type` or malformed token raises **401 `"Invalid refresh"`**, and an unknown `sub` raises **401 `"User not found"`**; success issues a new 6-hour access cookie and returns `{"ok": true}`.

**REQ-ANCRMEDIA-021**
**Given** the refresh endpoint exists
**When** the frontend receives a 401
**Then** **it never calls `/auth/refresh`** — there is no axios interceptor and no retry, so a session ends after 6 hours despite a valid 30-day refresh cookie.

**REQ-ANCRMEDIA-022**
**Given** the app mounts
**When** `AuthProvider` calls `GET /api/auth/me`
**Then** `user` moves from `undefined` (loading) to the profile or to `null` (anonymous), and `loading` clears in `finally`. `ProtectedRoute` gates every route except `/login` and `/register`.

### 1.3 Media playback

**REQ-ANCRMEDIA-023**
**Given** the application mounts
**When** `PlayerProvider` initialises
**Then** a single HTML5 `Audio` element is created in a ref and five listeners are bound — `timeupdate` → progress, `loadedmetadata` → duration, `ended` → next track, `play`/`pause` → playing state — and removed on unmount.

**REQ-ANCRMEDIA-024**
**Given** a track card
**When** the user clicks play (`MediaCards`)
**Then** `play(track, list)` sets the queue to `list` (locating the track's index, defaulting to 0 when not found) or to a single-item queue when no list is given, sets `current`, assigns `audio.src = track.audio_url` and calls `play()`. **A rejected playback promise is swallowed by `.catch(() => {})`, so an unplayable or missing audio URL produces no error state and no user-visible message.**

**REQ-ANCRMEDIA-025**
**Given** a track is loaded
**When** the user clicks the transport toggle
**Then** playback pauses if playing and resumes if paused; the call returns early when no track is current.

**REQ-ANCRMEDIA-026**
**Given** a queue exists
**When** the user clicks next or previous, or a track ends
**Then** the index advances or retreats **with wraparound** (`(i + 1) % len`, `(i - 1 + len) % len`), so the queue loops indefinitely; there is no repeat or shuffle control.

**REQ-ANCRMEDIA-027**
**Given** the player bar
**When** the user scrubs
**Then** `seek(sec)` sets `audio.currentTime` and updates progress; the volume slider writes to state and an effect applies it to the audio element (default 0.85).

**REQ-ANCRMEDIA-028**
**Given** playback state
**When** the page is reloaded
**Then** **nothing is persisted** — queue, current track, position and volume all reset. No play event is recorded and no stream count is incremented anywhere in the application.

**REQ-ANCRMEDIA-029**
**Given** a video at `/videos/{id}`
**When** the watch page renders
**Then** `GET /api/videos/{id}` returns `{video, related}` where `related` is the 12 most-viewed videos excluding the current one. **There is no captions track, no continue-watching position and no view recording.**

### 1.4 Discovery, home and world

**REQ-ANCRMEDIA-030**
**Given** an authenticated user opens `/`
**When** Home mounts
**Then** `GET /api/discover-feed` returns fourteen shelves: `hero_album` (top-streamed, or `null` when no albums exist), `live_now`, `upcoming_live`, `trending_tracks`, `new_releases`, `latest_videos`, `masterclasses`, `documentaries`, `student_spotlights`, `faculty_features`, `events`, `playlists`, `recommended_tracks` and `recommended_videos`.

**REQ-ANCRMEDIA-031**
**Given** the "Recommended" shelves are built
**When** the query runs
**Then** `recommended_tracks` is the top-streamed tracks **skipping the first 6**, and `recommended_videos` the top-viewed **skipping the first 4** — an in-code comment labels this an "AIAH placeholder". **No personalisation, no user signal and no model are involved**; every user receives identical recommendations.

**REQ-ANCRMEDIA-032**
**Given** `GET /api/discover`
**When** it runs
**Then** it returns `trending_tracks` (12 by streams), `trending_videos` (8 by views), `new_releases` (10 by release date), `faculty_picks` (playlists where `kind == "faculty"`) and 12 institutions.

**REQ-ANCRMEDIA-033**
**Given** `GET /api/home`
**When** it runs
**Then** it returns a narrower shelf set including `featured_challenge` (the first challenge document). Both `/home` and `/discover-feed` exist and overlap substantially.

**REQ-ANCRMEDIA-034**
**Given** a user opens `/countries`
**When** `GET /api/world` runs
**Then** each institution becomes a node with `coords`, `flag`, live creator and release counts; nodes are then aggregated by country into totals plus a sorted distinct city list.

**REQ-ANCRMEDIA-035**
**Given** `GET /api/charts/trending`
**When** it runs
**Then** it takes the **60 most recent tracks by release date**, re-sorts that subset by streams in Python, and returns the top 20 — so a highly-streamed older track outside the newest 60 can never chart.

**REQ-ANCRMEDIA-036**
**Given** `GET /api/charts/top-schools`
**When** it runs
**Then** it aggregates `tracks` per institution to sum `streams` and `listeners`, adds a live creator count, and sorts descending by total streams. Institutions with no tracks receive zeroes.

**REQ-ANCRMEDIA-037**
**Given** `GET /api/charts/top-producers`
**When** it runs
**Then** it selects creators whose `discipline` is `"Producer"` or `"Beatmaker"`, sorted by `monthly_listeners`.

**REQ-ANCRMEDIA-038**
**Given** `GET /api/charts/top-artists`
**When** it runs
**Then** it selects creators with `role == "student"` only — **faculty creators can never appear on the artists chart**.

**REQ-ANCRMEDIA-039**
**Given** `GET /api/charts/top-songs` or `/charts/top-videos`
**When** called
**Then** tracks are sorted by `streams` and videos by `views`, both limited by a `limit` query parameter defaulting to 20.

### 1.5 Browse, detail and search

**REQ-ANCRMEDIA-040**
**Given** `GET /api/creators`
**When** called with any of `q`, `institution`, `country`, `discipline`
**Then** institution, country and discipline match exactly, and `q` is a **regex-escaped** case-insensitive match against `name` or `handle`. `limit` defaults to 60.

**REQ-ANCRMEDIA-041**
**Given** `GET /api/creators/{id}`
**When** called
**Then** an unknown id raises **404 `"Creator not found"`**; otherwise the creator is returned with their albums and videos (newest first, 50 each) and top 20 tracks by streams.

**REQ-ANCRMEDIA-042**
**Given** `GET /api/albums` or `/api/tracks`
**When** called with `sort`
**Then** albums accept `streams` or default to `release_date`; tracks accept `release_date` or default to `streams`. **Any unrecognised `sort` value silently falls back to the default rather than erroring.**

**REQ-ANCRMEDIA-043**
**Given** `GET /api/albums/{id}`
**When** called
**Then** an unknown id raises **404 `"Album not found"`**; otherwise `{album, tracks, artist}` is returned, where `artist` may be `null` if `artist_id` matches no creator.

**REQ-ANCRMEDIA-044**
**Given** `GET /api/videos`
**When** called with an optional `kind`
**Then** results are filtered by that kind and sorted by `views` (default) or `release_date`.

**REQ-ANCRMEDIA-045**
**Given** `GET /api/tracks/{id}`, `/videos/{id}`, `/livestreams/{id}` or `/playlists/{id}`
**When** the id is unknown
**Then** each raises 404 — `"Track not found"`, `"Video not found"`, `"Not found"` and `"Not found"` respectively.

**REQ-ANCRMEDIA-046**
**Given** `GET /api/playlists/{id}`
**When** it resolves
**Then** it returns the playlist with its tracks hydrated from `track_ids`. **The returned track order follows Mongo's natural order, not the order of `track_ids`** — playlist sequencing is not preserved.

**REQ-ANCRMEDIA-047**
**Given** `GET /api/institutions`
**When** called
**Then** every institution is returned with a live `creator_count` and `release_count` computed per document — one count query per institution per request.

**REQ-ANCRMEDIA-048**
**Given** `GET /api/institutions/{slug}`
**When** called
**Then** an unknown slug raises **404 `"Institution not found"`**; otherwise it returns the institution with creators split into `faculty` (role `"faculty"`) and `students` (everything else), the 12 newest albums, 8 featured videos and its livestreams.

**REQ-ANCRMEDIA-049**
**Given** `GET /api/genres`
**When** called
**Then** it imports the `GENRES` constant from `seed_data` and returns each name with a live `track_count`.

**REQ-ANCRMEDIA-050**
**Given** `GET /api/genres/{name}`
**When** called
**Then** it returns the top 30 tracks by streams carrying that genre plus their distinct creators. **An unknown genre returns 200 with empty lists rather than a 404.**

**REQ-ANCRMEDIA-051**
**Given** `GET /api/search`
**When** called
**Then** `q` is required with `min_length=1` (a missing or empty query returns **422**); the escaped term is matched case-insensitively against creator name/handle, album title, track title, video title, institution name/city/country and playlist title, capped at 10 results per category.

**REQ-ANCRMEDIA-052**
**Given** every browse, detail, chart, search, discovery and world endpoint above
**When** called without any credential
**Then** **all of them succeed** — none carries an authentication dependency. Only `/library/toggle`, `/analytics/me` and `/auth/me` require a session. The frontend's `ProtectedRoute` is therefore the sole barrier, and it is client-side only.

### 1.6 Library

**REQ-ANCRMEDIA-053**
**Given** `POST /api/library/toggle` with `{target_type, target_id}`
**When** an authenticated user calls it
**Then** an existing `library` row keyed on `{user_id, target_type, target_id}` is deleted and `{"active": false}` returned; otherwise a row is inserted with a timestamp and `{"active": true}` returned. Unauthenticated callers receive **401**.

**REQ-ANCRMEDIA-054**
**Given** the `TargetIn` model
**When** a request is validated
**Then** `target_type` is an unconstrained string — **no allow-list restricts it to the five types the read path understands** (`track`, `album`, `video`, `playlist`, `creator`), and `target_id` is never checked against an existing document.

**REQ-ANCRMEDIA-055**
**Given** `GET /api/library`
**When** the caller is unauthenticated
**Then** it returns `{"tracks": [], "albums": [], "videos": [], "playlists": [], "creators": []}` with status **200** rather than 401 — an anonymous visitor sees an empty library rather than an error.

**REQ-ANCRMEDIA-056**
**Given** an authenticated caller
**When** `GET /api/library` runs
**Then** up to 500 library rows are read and each of the five target types is hydrated into its own list (200 documents each).

**REQ-ANCRMEDIA-057**
**Given** the library feature exists server-side and is covered by tests
**When** the frontend is inspected
**Then** **no page or component ever calls `POST /api/library/toggle`.** The only `api.post` calls in the entire frontend are login, register and logout. There is therefore **no way for a user to add anything to their library through the UI**, and `/library`, `/following`, `/liked`, `/watch-later` and `/downloads` can only ever render empty.

### 1.7 Analytics

**REQ-ANCRMEDIA-058**
**Given** an authenticated user opens `/analytics`
**When** `GET /api/analytics/me` runs
**Then** it resolves the caller's `creator_id`; **if the account has none it silently substitutes the first creator in the database whose role is `"student"`** and reports that creator's figures as the caller's own. Only when no creator exists at all does it raise **404 `"No creator linked"`**.

**REQ-ANCRMEDIA-059**
**Given** a creator is resolved
**When** KPIs are computed
**Then** `streams`, `listeners`, `views` and `watch_hours` are summed from that creator's tracks and videos, `followers` is read from the creator document, and `revenue_estimate_usd` is computed as `streams × 0.0038 + views × 0.0021` — **hard-coded per-unit rates with no configuration and no currency handling**.

**REQ-ANCRMEDIA-060**
**Given** the growth series is built
**When** the 12 points are generated
**Then** each is `int(base × (1 + 0.08 × i) × (1 + 0.15 × sin(i / 2)))` where `base = max(total_streams // 24, 400)`, and `views` is that value divided by 3. **This is a synthesised curve, not historical data** — no time-series is stored anywhere.

**REQ-ANCRMEDIA-061**
**Given** the geographic breakdown is built
**When** `country_series` is produced
**Then** it iterates a **hard-coded 12-country list** and assigns each `int(base × (1 + i × 0.2) / 8) + 400` — the values are a function of list position, not of any real audience data.

**REQ-ANCRMEDIA-062**
**Given** `schools_reached` is built
**When** it is produced
**Then** each of the first 8 institutions receives `total_streams / 10 + students_count` — again derived, not measured.

**REQ-ANCRMEDIA-063**
**Given** the analytics page
**When** the request fails
**Then** an error flag is set via `.catch(() => setErr(true))` and an error state renders.

### 1.8 Navigation surfaces

**REQ-ANCRMEDIA-064**
**Given** the authenticated layout
**When** it renders
**Then** it mounts the ecosystem sidebar, the ANCRMEDIA nav, the top bar, the routed page and the persistent `AudioPlayerBar` (`data-testid="audio-player"`), so playback survives navigation between routes.

**REQ-ANCRMEDIA-065**
**Given** the route table
**When** it is read
**Then** several paths are aliases of the same component: `/channels` → `Videos`, `/collections` → `Playlists`, `/following` → `Library`. `/wav` and `/view` render distinct `WavHome` and `ViewHome` surfaces built from `/api/home` and `/api/discover`.

**REQ-ANCRMEDIA-066**
**Given** `/downloads`, `/watch-later`, `/liked` and `/history`
**When** each renders
**Then** they are backed by `GET /api/library` only (REQ-ANCRMEDIA-057). **There is no download capability, no watch-later list, no like action and no viewing-history record anywhere in the backend** — these four routes have no distinct data source.

---

## 2. TEST COVERAGE

**Test assets found**
- `backend/tests/test_ancrmedia_backend.py` (398 lines) — ~35 test functions plus parametrised expansions, run against a live server.
- `backend/tests/__init__.py` — empty.
- `test_result.md` — 102 lines, **protocol boilerplate only; data section empty**.
- **No frontend tests.**

| Requirement | Covered | Evidence / gap |
|---|---|---|
| REQ-ANCRMEDIA-001 | **Partial** | Content endpoints returning data implies seeding ran; idempotency is never re-exercised |
| REQ-ANCRMEDIA-002 | **No** | Index creation untested |
| REQ-ANCRMEDIA-003 | **Yes** | `test_credentials_all_valid` asserts every demo account logs in; `test_login_maya_has_creator_id` and `test_login_admin_role` assert linkage and role |
| REQ-ANCRMEDIA-004 | **No** | The admin password-reset-on-startup behaviour is untested |
| REQ-ANCRMEDIA-005 | **No** | Seed-failure tolerance untested |
| REQ-ANCRMEDIA-006 | **Partial** | Implicit — a leaked `_id` would break JSON decoding — but never asserted |
| REQ-ANCRMEDIA-007 | **Yes** | `test_health` |
| REQ-ANCRMEDIA-008 | **No** | Frontend only |
| REQ-ANCRMEDIA-009 | **No** | The 422 validation paths (short password, bad email, empty name) are untested |
| REQ-ANCRMEDIA-010 | **No** | **The duplicate-email 400 is not tested** |
| REQ-ANCRMEDIA-011 | **Partial** | `test_register_new_user_and_me` covers the happy path; that `creator_id` is `null` for self-registered users is not asserted |
| REQ-ANCRMEDIA-012 | **No** | The token echoed in the body is never asserted or challenged |
| REQ-ANCRMEDIA-013 | **No** | **Self-assigned `role` at registration is untested** — no test registers as `administrator` |
| REQ-ANCRMEDIA-014 | **Yes** | `test_login_wrong_password` (401) and the successful logins |
| REQ-ANCRMEDIA-015 | **Partial** | `test_logout_clears_cookies` implies cookies were set; TTLs and flags are not asserted |
| REQ-ANCRMEDIA-016, 017 | **No** | The silent-None behaviour and the email-based lookup are untested |
| REQ-ANCRMEDIA-018 | **Yes** | `test_me_without_cookies_401` |
| REQ-ANCRMEDIA-019 | **Partial** | `test_logout_clears_cookies` covers the clear; that logout needs no auth is not asserted |
| REQ-ANCRMEDIA-020 | **No** | **`/auth/refresh` is not tested at all** — none of its four branches |
| REQ-ANCRMEDIA-021, 022 | **No** | Frontend only |
| REQ-ANCRMEDIA-023 – 029 | **No** | The entire player is untested. `test_tracks_have_audio` asserts `audio_url` is present on track documents, which is the closest the suite comes |
| REQ-ANCRMEDIA-030 | **Partial** | `test_home` covers `/home`; **`/discover-feed` — the endpoint the actual Home page uses — is not tested** |
| REQ-ANCRMEDIA-031 | **No** | The skip-based "recommendation" is untested |
| REQ-ANCRMEDIA-032 | **Yes** | `test_discover` |
| REQ-ANCRMEDIA-033 | **Yes** | `test_home` |
| REQ-ANCRMEDIA-034 | **Yes** | `test_world` |
| REQ-ANCRMEDIA-035 – 039 | **Partial** | `test_charts` is parametrised over the chart paths asserting 200 and shape; **none of the ranking semantics is asserted** — not the trending 60-track window, not the students-only artists filter, not the producer discipline filter |
| REQ-ANCRMEDIA-040 | **Yes** | `test_creators_filters` exercises the filter combinations |
| REQ-ANCRMEDIA-041 | **Yes** | `test_creator_detail`. The 404 branch is **not** covered |
| REQ-ANCRMEDIA-042 | **Yes** | `test_albums_sort_release_date` and `test_albums_sort_streams`. The invalid-`sort` fallback is not tested |
| REQ-ANCRMEDIA-043 | **Yes** | `test_album_detail_album_1`. 404 not covered |
| REQ-ANCRMEDIA-044 | **Yes** | `test_videos_and_filter` |
| REQ-ANCRMEDIA-045 | **No** | **No 404 branch is tested for any detail endpoint in this application** |
| REQ-ANCRMEDIA-046 | **Partial** | `test_playlists` asserts playlists and tracks return; track ordering versus `track_ids` is not asserted |
| REQ-ANCRMEDIA-047 | **Yes** | `test_institutions_list` |
| REQ-ANCRMEDIA-048 | **Yes** | `test_institution_berklee` |
| REQ-ANCRMEDIA-049, 050 | **Yes** | `test_genres` |
| REQ-ANCRMEDIA-051 | **Yes** | `test_search`. The `min_length` 422 branch is not covered |
| REQ-ANCRMEDIA-052 | **Partial** | Most content tests call unauthenticated and pass, demonstrating the open surface, but it is never asserted as a property |
| REQ-ANCRMEDIA-053 | **Yes** | `test_library_toggle_and_list` covers add and remove |
| REQ-ANCRMEDIA-054 | **No** | The unvalidated `target_type` is untested |
| REQ-ANCRMEDIA-055 | **Yes** | `test_library_no_auth_empty` asserts the 200-with-empty-lists behaviour |
| REQ-ANCRMEDIA-056 | **Yes** | `test_library_toggle_and_list` |
| REQ-ANCRMEDIA-057 | **No** | **This is the gap the suite masks.** `test_library_toggle_requires_auth` and `test_library_toggle_and_list` prove the endpoint works, which is exactly why nobody noticed the frontend never calls it |
| REQ-ANCRMEDIA-058 | **Partial** | `test_analytics_me` runs as `maya`, who *has* a `creator_id`; **the silent fallback for an account without one is never exercised** |
| REQ-ANCRMEDIA-059 – 062 | **Partial** | `test_analytics_me` asserts the response shape; none of the four synthesised series is challenged as fabricated |
| REQ-ANCRMEDIA-063 – 066 | **No** | Frontend only |

**Summary:** 66 requirements. **21 Yes**, **13 Partial**, **32 No**. Backend read coverage is broad and the library round-trip is properly tested. The notable blind spots are `/auth/refresh` (untested entirely), every 404 detail branch, registration validation including self-assigned roles, and the client-side gap at REQ-ANCRMEDIA-057 that no backend test could catch.

---

## 3. SPEC GAP ANALYSIS

**Specs compared:** `ANCRMEDIA_Product_Specification_v1.0 (3) (1).pdf` (10 pp., canonical, "Module 8 of 10"), `ANCRMEDIA_Workflow (1).pdf` (3 pp.), `docs/ANCRMEDIA_Technical_Specification_v1.0.md`, `docs/ANCR_Ecosystem_Architecture_Specification_v1.0.md`, `memory/PRD.md`.

### (a) Specified but NOT implemented in code

| # | Spec source | Requirement | Code state |
|---|---|---|---|
| G1 | Product Spec §11; Workflow p.1 (opening principle) | **"ANCRMEDIA™ uses ANCRID™ exclusively. No independent login."** The workflow states the module "does not start with a login". | ANCRMEDIA implements a **complete independent identity store** — `users` collection, bcrypt hashes, `/auth/register`, `/auth/login`, its own JWT and its own cookies (REQ-ANCRMEDIA-008 – 022). This is the architecture both documents explicitly forbid. |
| G2 | Product Spec §05 "Consumes" — 9 modules; Workflow p.2 "no duplicate data, no duplicate identity, no duplicate publishing, no duplicate royalties" | Identity from ANCRID, publishing from INHEIRA, projects from ANCRLAB, collaboration from ANCRSync, revenue from Vaulta, networking from ANCRD, career from ANCRLaunch | **Zero integrations.** No outbound HTTP call exists. Creators, institutions, albums, tracks, videos and analytics are all local seeded collections. |
| G3 | Product Spec §14 Engineering Roadmap **P0** | Media Upload Service · Object Storage · Audio & Video **Transcoding** · **HLS Streaming** · CDN Delivery · **Protected Media APIs** | None implemented. There is **no upload endpoint of any kind**; `audio_url` and video sources are seeded strings played directly by an HTML5 `Audio` element (REQ-ANCRMEDIA-024). No transcoding, no HLS, no signed URLs, no access control on media. |
| G4 | Product Spec §14 Roadmap **P1** | Livestream Broadcasting · **Live Chat** · **Creator Uploads** · **Moderation Workflow** · Recommendation Engine · **Playlist Persistence** | Livestreams are read-only seeded records with an `is_live_now` boolean. No broadcast, chat, upload, moderation or user-created playlist exists. Playlists are seeded and immutable. |
| G5 | Product Spec §08 ANCRWAV™ | Waveform Player · **Queue** · **Lyrics** · **Credits** · **Publishing** · **Like** · **Save** · **Share** · Playlist Support | A queue exists (REQ-ANCRMEDIA-026). **Lyrics, credits, publishing metadata, like, save and share are entirely absent** — and the one save-adjacent capability that does exist server-side (`library/toggle`) is unreachable from the UI (REQ-ANCRMEDIA-057). There is no waveform rendering. |
| G6 | Product Spec §08 ANCRVIEW™ | Video Player · **Captions** · **Continue Watching** · Related Content · Creator Channels · Playlists · **Viewing History** | Only related content exists. **Captions, continue-watching and viewing history are absent** despite `/watch-later` and `/history` routes being present in the router (REQ-ANCRMEDIA-066). |
| G7 | Product Spec §08 Analytics™ | Streams · Views · Watch Time · **Audience Growth** · **Geographic Reach** · **Institution Reach** · **Engagement** · Revenue Estimates | Streams, views and watch time are summed from seeded document fields. **Audience growth, geographic reach and institution reach are mathematically synthesised from a sine curve and list position** (REQ-ANCRMEDIA-060 – 062). Engagement is absent. No playback event is ever recorded, so none of these can be real. |
| G8 | Product Spec §09 AIAH™ (8 capabilities) | Personalized Recommendations · Playlists · Creator Discovery · Institution Discovery · Collaboration Suggestions · Learning Recommendations · Trending Analysis · Media Insights | **There is no AI integration in this application.** The only "recommendation" is a `skip(6)` on the top-streamed query, labelled in-code as an "AIAH placeholder" (REQ-ANCRMEDIA-031). |
| G9 | Product Spec §08 Discover™ | Browse by Genre · Country · Institution · Discipline · **Instrument** · **Language** · Trending · Newest | Genre, country, institution and discipline exist as creator filters. **Instrument and Language have no field, filter or endpoint.** |
| G10 | Product Spec §08 Creator Channels™ | Biography · **Creator Passport™** · Music · Videos · **Podcasts** · **Livestreams** · **Collaborators** · **Publishing Credits** · **Portfolio** · **Upcoming Releases** | `/creators/{id}` returns only creator, albums, videos and top tracks (REQ-ANCRMEDIA-041). Passport, podcasts, livestreams, collaborators, credits, portfolio and upcoming releases are all missing — most because the source modules are not integrated (G2). |
| G11 | Product Spec §08 Institution Channels™ | Institution Profile · Programs · Faculty · Students · Releases · Livestreams · **Events** · Featured Creators · **Analytics** | `/institutions/{slug}` omits **events** and **analytics** for the institution (REQ-ANCRMEDIA-048), though both exist elsewhere in the app. |
| G12 | Product Spec §08 Creator Challenges™ | Six challenge types with submission | Challenges are a read-only seeded list. **There is no submission, entry, judging or winner mechanism.** |
| G13 | Product Spec §07 Primary Navigation | Home, Discover, Trending, Podcasts, **Channels**, Institutions, New Releases, Live, Playlists, Creators, Albums, Videos, Events, Challenges, Library, Analytics, Settings | All 17 have routes, but **Channels is an alias of `/videos`** rather than a channel surface (REQ-ANCRMEDIA-065), and Library is permanently empty (REQ-ANCRMEDIA-057). |
| G14 | Product Spec §10; §14 | "Publishing metadata is consumed from INHEIRA™"; "**Portfolio assets should be referenced rather than duplicated**" | Track and album metadata is stored locally with no ISRC, no rights, no credits and no external reference. |
| G15 | Ecosystem Architecture doc | Modules publish and consume domain events (`media.release_published`, `media.stream_aggregated`) | **No event is published or consumed.** No outbox, no bus, no publisher. |

### (b) Implemented but NOT mentioned in the spec

| # | Code feature | Spec status |
|---|---|---|
| E1 | **Full local authentication stack** — registration, login, refresh, logout, bcrypt, dual cookies, and `access_token` additionally returned in the response body (REQ-ANCRMEDIA-012). | §11 forbids an independent login outright. The body-echoed token is a further unspecified decision that weakens the httpOnly cookie design. |
| E2 | **Self-assigned role at registration** — `role` is accepted from the request body, so any registrant may claim `administrator` (REQ-ANCRMEDIA-013). | Unspecified and contrary to §11's inheritance of permissions from ANCRID. |
| E3 | **Administrator password reset on every startup** when the configured password no longer verifies (REQ-ANCRMEDIA-004). | Unspecified. It makes `ADMIN_PASSWORD` authoritative over any later change made through the database. |
| E4 | **`GET /api/analytics/me` falls back to an arbitrary creator** when the caller has no `creator_id`, presenting another creator's streams, listeners, followers and revenue as the caller's own (REQ-ANCRMEDIA-058). | Unspecified. Since self-registered users never receive a `creator_id` (REQ-ANCRMEDIA-011), this is the default path for every new account. |
| E5 | **Two overlapping home endpoints** — `/api/home` and `/api/discover-feed` — with different shelf sets, both live (REQ-ANCRMEDIA-030, 033). | The spec defines one Global Discover Feed™. |
| E6 | **`/wav` and `/view` as separate route surfaces** inside the app. | §06 describes ANCRWAV and ANCRVIEW as two experiences within ANCRMEDIA, but specifies that users "remain inside ANCRMEDIA while moving seamlessly between audio and video" — it does not define them as distinct destinations. |
| E7 | **Route aliases** `/channels` → Videos, `/collections` → Playlists, `/following` → Library (REQ-ANCRMEDIA-065). | Unspecified; three navigation labels resolve to two components. |
| E8 | **Hard-coded revenue rates** of `$0.0038` per stream and `$0.0021` per view (REQ-ANCRMEDIA-059). | §05 assigns revenue and royalties to **Vaulta™**; §14 states ANCRMEDIA "should never become the source of truth for … finance". Computing a dollar revenue estimate locally crosses that boundary. |
| E9 | **Entirely open content API** — every browse, chart, search, world and detail endpoint is unauthenticated (REQ-ANCRMEDIA-052). | §11 requires permissions inherited from ANCRID. The whole catalogue is currently public to anyone who can reach the API. |
| E10 | **`/downloads`, `/watch-later`, `/liked`, `/history` routes** with no backing feature (REQ-ANCRMEDIA-066). | Navigation surfaces for capabilities the spec lists but the backend does not implement. |

---

## 4. UNCLEAR / NEEDS INPUT

**Q1 — The library is unreachable from the UI.**
`POST /api/library/toggle` works and is tested, but no frontend file calls it, so `/library`, `/liked`, `/watch-later`, `/following` and `/downloads` can only render empty (REQ-ANCRMEDIA-057). I have not changed this. Which surfaces should get a save control, and should `liked` / `watch-later` / `downloads` be distinct `target_type` values on the same table or separate features?

**Q2 — Analytics falls back to someone else's data.**
An account without a `creator_id` — which is every self-registered account — is shown the first student creator's streams, followers and revenue as its own (REQ-ANCRMEDIA-058, E4). Should this 404 instead, show an empty state, or is there an intended account→creator linking flow that is missing (REQ-ANCRMEDIA-011)?

**Q3 — Role is self-assigned at registration.**
`role` is taken from the request body with no validation, so a registrant can claim `administrator` or `faculty` (REQ-ANCRMEDIA-013). Confirm this should be removed from the public payload. Note there is currently nothing in the app that checks `role`, so the immediate impact is limited to display.

**Q4 — Analytics numbers are synthesised.**
Growth, geography and institution reach are generated from a sine curve, a hard-coded country list and list position (REQ-ANCRMEDIA-060 – 062). No playback event is recorded anywhere. Should the demo keep illustrative figures, or should play events be captured so at least stream counts become real? And should the revenue estimate be removed given §05 assigns finance to Vaulta (E8)?

**Q5 — The whole catalogue is publicly readable.**
No content endpoint requires authentication (REQ-ANCRMEDIA-052); only the client-side `ProtectedRoute` gates access. Is the catalogue intended to be public, institution-scoped, or fully authenticated?

**Q6 — Two home endpoints.**
`/api/home` and `/api/discover-feed` overlap; the Home page uses the latter and `/wav` and `/view` use the former (E5). Should one be retired?

**Q7 — Playlist ordering is lost.**
`/playlists/{id}` hydrates tracks by `$in` on `track_ids`, so the returned order is Mongo's, not the playlist's (REQ-ANCRMEDIA-046). Should playlist order be preserved — and is user-created playlist persistence in scope (spec P1)?

**Q8 — Trending only considers the newest 60 tracks.**
`/charts/trending` windows to the 60 most recent releases before ranking by streams (REQ-ANCRMEDIA-035). Is that recency window intended, and what is the correct definition of trending — velocity over a period, or streams within a window?

**Q9 — Faculty are excluded from the artists chart.**
`/charts/top-artists` filters to `role == "student"` (REQ-ANCRMEDIA-038), while the spec's Global Discover Feed lists **Faculty Features** and **Student Spotlights** as separate shelves. Should faculty have their own chart, or should the artists chart include them?

**Q10 — Media hosting and protection.**
Audio and video are seeded URLs played directly with no signing, no transcoding and no expiry, and there is no upload path (G3). What is the intended media pipeline, and should playback require an authorised, time-limited URL?

**Q11 — `target_type` is unvalidated.**
Any string is accepted and stored, and unknown types are silently invisible on read (REQ-ANCRMEDIA-054). Should it be an enum, and should `target_id` be validated against the referenced collection?

**Q12 — Refresh is never used.**
Sessions die after 6 hours because the frontend has no refresh interceptor despite a working endpoint and a 30-day cookie (REQ-ANCRMEDIA-021). Should an interceptor be added?

**Q13 — Access token echoed in the response body.**
Login and register return `access_token` in JSON alongside the httpOnly cookie (REQ-ANCRMEDIA-012). Is a bearer-token client planned (mobile?), or should this be removed?

**Q14 — Admin password reset on startup.**
If the configured `ADMIN_PASSWORD` no longer matches, the stored hash is silently overwritten at every boot (REQ-ANCRMEDIA-004). Intended as a demo convenience, or should it be removed before any shared deployment?

**Q15 — Challenges have no entry mechanism.**
Six challenge types are specified; the code has a read-only list (G12). Is submission in scope, and if so does the artefact come from ANCRLAB or from a direct upload?

**Q16 — Instrument and Language facets.**
Both are specified Discover facets with no field or filter (G9). Should they be added to the creator and track models?
