# ANCRID — Functional Requirements

**App folder:** `ANCR-ANCRID`
**APPNAME:** `ANCRID`
**Derived from:** `backend/server.py` (1,216 lines), `frontend/src/**`
**Stack observed:** FastAPI + Motor/MongoDB; bcrypt + JWT (HS256) in httpOnly cookies; Emergent object storage; React + React Router + axios (`withCredentials`) + Sonner
**Date of extraction:** 2026-09-03

---

## 1. FUNCTIONAL REQUIREMENTS

### 1.1 Registration

**REQ-ANCRID-001**
**Given** a visitor on `/signup`
**When** the form renders
**Then** it collects `professional_name`, `email`, `password`, plus optional `role`, `institution` and `discipline`. Name, email and password are `required`; email is `type="email"` and password carries `minLength={6}`.

**REQ-ANCRID-002**
**Given** valid signup input
**When** `POST /api/auth/register` is called
**Then** the server lower-cases and trims the email, and rejects an address already in `users` with **400 `"Email already registered"`**.

**REQ-ANCRID-003**
**Given** a password shorter than 6 characters reaches the API
**When** Pydantic validates `RegisterInput`
**Then** FastAPI returns **422** with a validation detail array; the frontend renders it via `formatApiErrorDetail`, which joins each entry's `msg` with ` · `.

**REQ-ANCRID-004**
**Given** a new registration
**When** the handle is generated
**Then** `slugify_handle` strips all non-alphanumerics, lower-cases, truncates to 20 characters, and falls back to `creator{4-digit random}` when the result is empty. `unique_handle` then appends an incrementing integer until no `users` document holds that handle.

**REQ-ANCRID-005**
**Given** a new registration succeeds
**When** the user document is built
**Then** the password is bcrypt-hashed, `public_profile` defaults to `true`, and the `identity` sub-document is populated from `_demo_identity()` — after which only `ancrid_number` (`ANCRID-2026-{1000–9999}`) and `creator_passport_id` (`CPX-{1000–9999}-{first 4 chars of email, upper}`) are randomised.

**REQ-ANCRID-006**
**Given** any newly registered creator
**When** their identity is read back
**Then** they inherit the **entire demo identity verbatim** — including `verification_status: "Verified"`, four `verified_badges` (Government ID, Student, Creator, Institutional Affiliation), `portfolio_score: 87`, `creative_reputation_score: 91`, `professional_readiness_score: 78`, a fixed biography, mission, pronouns, location, languages and social links. **No verification of any kind is performed before these are granted.**

**REQ-ANCRID-007**
**Given** registration succeeds
**When** the response is returned
**Then** access and refresh cookies are set, the scrubbed user is returned (with `_id` renamed to `id` and `password_hash` removed), the UI toasts `"Your ANCRID has been issued"` and the user is signed in immediately — **there is no email verification step**.

### 1.2 Login, session and logout

**REQ-ANCRID-008**
**Given** the login page at `/login`
**When** it renders
**Then** email and password are **pre-populated with the hard-coded demo credentials** `aaron@ancr.io` / `ancrid2026`. Both fields are `required`.

**REQ-ANCRID-009**
**Given** submitted credentials
**When** `POST /api/auth/login` executes
**Then** the email is lower-cased and trimmed; an unknown email **or** a wrong password both raise **401 `"Invalid email or password"`** (indistinguishable to the caller).

**REQ-ANCRID-010**
**Given** a successful login or registration
**When** cookies are set
**Then** `access_token` (TTL 1 day, `ACCESS_TTL_MIN = 1440`) and `refresh_token` (TTL 30 days) are written as `httponly=True, secure=True, samesite="none", path="/"`.

**REQ-ANCRID-011**
**Given** a login attempt is in flight
**When** `loading` is true
**Then** the submit button is `disabled` at 60% opacity; on failure the error is rendered inline via `formatApiErrorDetail` and no navigation occurs.

**REQ-ANCRID-012**
**Given** any protected endpoint
**When** `get_current_user` runs
**Then** it reads the `access_token` cookie **first**, and falls back to an `Authorization: Bearer <token>` header if the cookie is absent. With neither it raises **401 `"Not authenticated"`**.

**REQ-ANCRID-013**
**Given** a token is presented
**When** it is decoded
**Then** a `type` other than `"access"` raises **401 `"Invalid token type"`**; an expired token raises **401 `"Token expired"`**; any other JWT error raises **401 `"Invalid token"`**; and a valid token whose `sub` matches no user raises **401 `"User not found"`**.

**REQ-ANCRID-014**
**Given** the app mounts
**When** `AuthProvider` calls `GET /api/auth/me`
**Then** success sets the user; failure sets `user = false`. `ProtectedRoute` renders `Verifying identity…` (`data-testid="auth-loading"`) while `checking` is true **or** `user === null`, and redirects to `/login` once `user` is falsy.

**REQ-ANCRID-015**
**Given** an authenticated user
**When** they log out
**Then** `POST /api/auth/logout` (itself auth-guarded) clears both cookies server-side and the client sets `user = false`. A network failure on logout is swallowed by an empty `catch` and the client still signs out locally.

**REQ-ANCRID-016**
**Given** a valid `refresh_token` cookie
**When** `POST /api/auth/refresh` is called
**Then** a fresh access cookie is issued and `{"ok": true}` returned. A missing cookie raises **401 `"No refresh token"`**; a non-refresh `type` raises **401 `"Invalid refresh type"`**; an unknown `sub` raises **401 `"User not found"`**.

**REQ-ANCRID-017**
**Given** the refresh endpoint exists
**When** the frontend encounters a 401
**Then** **it never calls `/auth/refresh`** — there is no axios response interceptor and no retry. An expired access token simply drops the user to `/login` despite a valid 30-day refresh cookie being present.

**REQ-ANCRID-018**
**Given** a refresh token is issued
**When** the user logs out
**Then** the cookie is deleted but **the token itself is never invalidated server-side** — there is no revocation list or token version.

### 1.3 Identity, Passport and record surfaces

**REQ-ANCRID-019**
**Given** an authenticated user opens `/app`
**When** the index route resolves
**Then** it redirects to `/app/overview` inside `DashboardLayout`.

**REQ-ANCRID-020**
**Given** `/app/overview` mounts
**When** `GET /api/ancrid/overview` returns
**Then** it supplies the user's own five profile fields and their stored `identity`, plus **three module-level constants**: the full 9-entry `DEMO_ECOSYSTEM`, the last 4 `DEMO_TIMELINE` entries, and the first 3 `DEMO_AI_INSIGHTS`.

**REQ-ANCRID-021**
**Given** `/app/identity` mounts
**When** `GET /api/ancrid/identity` returns
**Then** it returns the user's own `professional_name`, `email`, `role`, `institution`, `discipline` and their persisted `identity` object.

**REQ-ANCRID-022**
**Given** the Settings form
**When** the user saves
**Then** `PATCH /api/ancrid/identity` maps each supplied `ProfileUpdate` field to `identity.{field}` and `$set`s it, **skipping any field whose value is `None`**; the refreshed user is returned and a `"Identity updated"` toast is shown. This is the **only genuinely per-user persisted record surface in the application**.

**REQ-ANCRID-023**
**Given** a `ProfileUpdate` field is explicitly set to `null` to clear it
**When** the handler filters on `if v is not None`
**Then** the clear is silently discarded — **a populated identity field cannot be emptied through the API**.

**REQ-ANCRID-024**
**Given** an authenticated user opens `/app/portfolio`, `/app/timeline`, `/app/passport`, `/app/collaborations`, `/app/skills`, `/app/education`, `/app/history`, `/app/achievements`, `/app/credentials`, `/app/connected` or the journey view
**When** each corresponding `GET /api/ancrid/{resource}` runs
**Then** it returns a **module-level Python constant** (`DEMO_PORTFOLIO`, `DEMO_TIMELINE` reversed, `DEMO_PASSPORT`, `DEMO_COLLABORATIONS`, `DEMO_SKILLS`, `DEMO_EDUCATION`, `DEMO_HISTORY`, `DEMO_ACHIEVEMENTS`, `DEMO_CREDENTIALS`, `DEMO_ECOSYSTEM`, `DEMO_JOURNEY`). **Every one of these endpoints ignores the authenticated user entirely** — the parameter is bound as `_user` and never read — so all creators see identical records.

**REQ-ANCRID-025**
**Given** `GET /api/ancrid/ai/insights`
**When** it runs
**Then** it returns the 7-entry `DEMO_AI_INSIGHTS` constant. **No model is invoked and no user data is analysed** — there is no LLM integration anywhere in this application.

**REQ-ANCRID-026**
**Given** `/app/network` mounts with query, discipline and country state
**When** `GET /api/ancrid/network` is called with those params
**Then** the server filters the 6-entry `DEMO_NETWORK` constant: `q` case-insensitively across name, role, institution and skills; `discipline` and `country` by exact match, with the literal `"All"` treated as no filter.

### 1.4 File upload

**REQ-ANCRID-027**
**Given** the Settings page headshot/banner pickers
**When** a file is chosen
**Then** `POST /api/files/upload` is called as multipart; the button is `disabled` while uploading and the input's value is reset in `finally` so the same file can be re-picked.

**REQ-ANCRID-028**
**Given** an upload whose content type is not one of `image/jpeg`, `image/png`, `image/webp`, `image/gif`
**When** the handler checks `ALLOWED_MIME`
**Then** it raises **400 `"Only image uploads are supported (png, jpg, webp, gif)"`**.

**REQ-ANCRID-029**
**Given** an upload larger than 8 MiB
**When** the size is checked after read
**Then** it raises **400 `"File exceeds 8MB limit"`**. The file is fully read into memory before the check.

**REQ-ANCRID-030**
**Given** a valid image
**When** it is stored
**Then** it is written to `{APP_NAME}/uploads/{user_id}/{uuid}.{ext}` in Emergent object storage, a `files` record is inserted (`file_id`, `user_id`, `storage_path`, `content_type`, `size`, `original_filename`, `created_at`, `is_deleted: false`), and `{id, url: "/api/files/{id}", content_type, size}` is returned.

**REQ-ANCRID-031**
**Given** the storage backend rejects the write or is unreachable
**When** `put_object` raises
**Then** the handler logs the exception and raises **502 `"Storage upload failed: {error}"`** — **the underlying exception text is echoed to the client**.

**REQ-ANCRID-032**
**Given** `EMERGENT_LLM_KEY` is not set
**When** `init_storage` runs
**Then** it logs `"EMERGENT_LLM_KEY missing — storage disabled"`, returns `None`, and every upload then fails as a 502 via REQ-ANCRID-031.

**REQ-ANCRID-033**
**Given** `GET /api/files/{file_id}`
**When** it is called
**Then** it serves the bytes with `Cache-Control: public, max-age=31536000, immutable`, returning **404 `"File not found"`** for an unknown or soft-deleted id and **502 `"Storage read failed"`** if storage errors. **This endpoint has no authentication** — any file uploaded by any creator is publicly retrievable by its UUID.

**REQ-ANCRID-034**
**Given** an uploaded file
**When** the user wants to remove it
**Then** **no delete endpoint exists.** `is_deleted` is written as `false` at insert and never updated.

**REQ-ANCRID-035**
**Given** a successful upload
**When** the response returns
**Then** the UI toasts `"{label} uploaded"` — but the returned URL is **not** written into `identity.headshot_url` / `identity.banner_url` by the upload itself; persisting it depends on the separate Settings save (REQ-ANCRID-022).

### 1.5 Public creator page

**REQ-ANCRID-036**
**Given** a visitor navigates to `/@{handle}`
**When** `App`'s catch-all `HandleOrFallback` matches a path starting `/@`
**Then** `PublicCreator` renders and fetches the public projection. A path matching neither `/@…` nor `/packet/…` redirects to `/`.

**REQ-ANCRID-037**
**Given** `GET /api/public/creator/{handle}`
**When** it runs
**Then** it matches on the lower-cased handle **and** `public_profile != false`, returning **404 `"Creator not found"`** otherwise — so a creator with `public_profile: false` is indistinguishable from one that does not exist. **This endpoint requires no authentication.**

**REQ-ANCRID-038**
**Given** a public creator page loads
**When** the projection is built
**Then** it exposes handle, professional name, role, institution, discipline and a whitelisted identity subset (ANCRID number, Creator Passport id, verification status, badges, location, languages, biography, mission, headshot, banner, website, social links, member since, and all three scores). Email, password hash and every non-whitelisted identity field are excluded.

**REQ-ANCRID-039**
**Given** any public creator page
**When** the record surfaces are attached
**Then** `portfolio`, `timeline` (6 most recent), `journey`, `achievements`, `skills` (names only) and `credentials` come from the **same module constants for every creator** — the code comments this as "Demo record surfaces". Two different public profiles are therefore identical below the identity header.

**REQ-ANCRID-040**
**Given** the public fetch fails
**When** the catch runs
**Then** the page renders `"Identity not found"`.

**REQ-ANCRID-041**
**Given** the Overview or Settings page
**When** the user clicks the copy-link control (`passport-copy-link`)
**Then** the public creator URL is copied to the clipboard and a `"Public link copied"` / `"Public creator link copied"` toast is shown.

### 1.6 Ecosystem SSO

**REQ-ANCRID-042**
**Given** `/app/sso` mounts
**When** it loads
**Then** `GET /api/sso/clients` returns the **9 registered clients** — ANCRA, ANCRLAB, ANCRSync, INHEIRA, Vaulta, Passport, ANCRLaunch, ANCRVIEW, ANCRWAV — each with `name`, `purpose` and a space-delimited `scope`; and `GET /api/sso/grants` returns the caller's 50 most recent grants.

**REQ-ANCRID-043**
**Given** a client is selected
**When** `POST /api/sso/authorize` is called
**Then** an unknown `client_id` raises **400 `"Unknown client_id"`**; otherwise a JWT is minted with `iss: "ancrid"`, `aud: {client_id}`, `sub`, `iat`, `exp` (**5 minutes**, `SSO_TTL_MIN = 5`), `type: "sso"`, the client's `scope`, and identity claims (`ancrid`, `handle`, `email`, `name`, `role`, `institution`, `verified`). A `sso_grants` record is written and the token returned with `token_type: "Bearer"` and `expires_in: 300`.

**REQ-ANCRID-044**
**Given** authorization succeeds
**When** the UI updates
**Then** a `"Handshake with {name} authorised"` toast is shown and the grants list is reloaded; a failure toasts `"Authorization failed"`.

**REQ-ANCRID-045**
**Given** `POST /api/sso/authorize` is called without a session
**When** the dependency runs
**Then** it raises **401** — authorization requires an authenticated ANCRID user.

**REQ-ANCRID-046**
**Given** `POST /api/sso/verify` with a token
**When** it decodes
**Then** it returns `{"ok": true, "claims": {...}}`; an expired token raises **401 `"SSO token expired"`**, an invalid one **401 `"Invalid SSO token"`**, and a valid token whose `type` is not `"sso"` raises **401 `"Not an SSO token"`**.

**REQ-ANCRID-047**
**Given** the verify endpoint
**When** it decodes
**Then** it passes `options={"verify_aud": False}` — **audience is not checked**, so a token minted for ANCRA verifies successfully when presented as Vaulta's. The code comments this as a deliberate demo simplification.

**REQ-ANCRID-048**
**Given** the verify endpoint
**When** it validates the signature
**Then** it uses **the same `JWT_SECRET` as ANCRID's own session tokens** — verification is symmetric and requires the shared secret. There is no RS256 keypair and **no JWKS endpoint**.

**REQ-ANCRID-049**
**Given** `POST /api/sso/verify`
**When** it is called
**Then** it has **no authentication dependency** — any caller holding a token may verify it, which is the intended partner-service behaviour.

**REQ-ANCRID-050**
**Given** an SSO grant has been issued
**When** the creator wants to revoke it
**Then** **no revocation endpoint exists.** `sso_grants` is written and listed but never deleted or invalidated; the 5-minute TTL is the only expiry mechanism.

### 1.7 Creator Mobility

**REQ-ANCRID-051**
**Given** `/app/mobility` mounts
**When** it loads
**Then** `GET /api/mobility/profile` and `GET /api/mobility/booking-packets` are fetched, both with errors swallowed by empty `.catch(() => {})` — a failure leaves the page in its null state with no message.

**REQ-ANCRID-052**
**Given** the mobility page has data
**When** the user clicks a section tab (`mobility-tab-{key}`)
**Then** one of 12 panels renders: personal, programs, preferences, dietary, medical, emergency, team, booking, riders, documents, history, calendar.

**REQ-ANCRID-053**
**Given** `GET /api/mobility/profile`
**When** it runs
**Then** it returns the module-level `DEMO_MOBILITY` constant unconditionally — the authenticated user is bound as `_user` and never read.

**REQ-ANCRID-054**
**Given** `PATCH /api/mobility/profile` with `{section, data}`
**When** the section is not one of `personal`, `preferences`, `dietary`, `medical`, `emergency`, `team`, `booking`, `riders`, `permissions`
**Then** it raises **400 `"Unknown section '{section}'"`**; otherwise it `$set`s `mobility.{section}` on the user document and returns `{"ok": true, "section": ...}`.

**REQ-ANCRID-055**
**Given** a mobility section has been successfully patched
**When** the profile is read back via `GET /api/mobility/profile`
**Then** **the saved data is never returned.** The GET serves the static constant and nothing in the application ever reads `user.mobility`. Mobility edits are written to the database and are invisible everywhere, including in generated Booking Packets.

**REQ-ANCRID-056**
**Given** the mobility `documents` section
**When** it renders
**Then** it lists six document descriptors (passport, two visas, licence, insurance, invitation letter) with `private` flags — **these are labels only. No document is stored, uploaded, downloaded or linked to the file service.**

**REQ-ANCRID-057**
**Given** the `personal` section
**When** it renders
**Then** the passport number and insurance number arrive **already masked in the constant** (`P•••••2245`, `BC••••••4402`). A `_mask()` helper exists in the backend but is **not applied to any live value** — it is unreferenced.

**REQ-ANCRID-058**
**Given** `GET /api/mobility/travel-suggestions`
**When** it runs
**Then** it returns the 6 static entries of `DEMO_MOBILITY["ai_travel_suggestions"]`. **No model is invoked.**

**REQ-ANCRID-059**
**Given** the mobility `permissions` map
**When** it is read
**Then** it declares four visibility tiers (`public`, `team`, `booking_only`, `private`) listing field names. **These are declarative only** — the sole enforcement of them anywhere is the Booking Packet projection (REQ-ANCRID-062), which uses its own hard-coded field lists rather than this map.

### 1.8 Professional Booking Packet

**REQ-ANCRID-060**
**Given** the mobility Packet tab
**When** the user generates a packet
**Then** `POST /api/mobility/booking-packet` is called with `{include_sections?, permission_level?, include_emergency}`.

**REQ-ANCRID-061**
**Given** a `permission_level` outside `public`, `booking_only`, `team`
**When** the handler validates
**Then** it raises **400 `"permission_level must be one of ['booking_only', 'public', 'team']"`**. Omitting the field defaults to `booking_only`.

**REQ-ANCRID-062**
**Given** a valid packet request
**When** the projection is built
**Then** `booking_only` and `team` produce the **identical** payload: trimmed personal details (preferred name, nationality, passport expiration, visas), preferences, dietary, riders, a 7-key team subset, a 5-key booking subset, airlines, hotels and rentals. `public` collapses to preferences plus dietary restrictions only. `include_emergency: true` adds the emergency contacts block at any level.

**REQ-ANCRID-063**
**Given** the `team` and `booking_only` levels resolve to the same fields
**When** a packet is shared
**Then** the three-tier model documented in the spec is effectively **two tiers** — `team` grants no additional visibility over `booking_only`.

**REQ-ANCRID-064**
**Given** the `PacketRequest` model accepts `include_sections`
**When** the handler runs
**Then** **the field is never read** — section selection has no effect on the generated packet.

**REQ-ANCRID-065**
**Given** a packet is created
**When** it is stored
**Then** a `secrets.token_urlsafe(12)` token is generated, the **fully-rendered payload is snapshotted** into `booking_packets` alongside `user_id`, `issued_at`, `expires_at` (**30 days**, `PACKET_TTL_DAYS = 30`), `permission_level` and `include_emergency`, and `{token, url: "/packet/{token}", permission_level, expires_at}` is returned.

**REQ-ANCRID-066**
**Given** the packet payload is a snapshot
**When** the creator later updates their identity or mobility data
**Then** **already-issued packets do not change** — they continue serving the values captured at issue time.

**REQ-ANCRID-067**
**Given** the packet payload is assembled
**When** portfolio and achievements are attached
**Then** they come from the `DEMO_PORTFOLIO` and `DEMO_ACHIEVEMENTS[:4]` constants, and the mobility block from `DEMO_MOBILITY` — so **every creator's packet contains the same portfolio, achievements and travel data** regardless of what they saved.

**REQ-ANCRID-068**
**Given** `GET /api/mobility/booking-packets`
**When** it runs
**Then** it returns the caller's 50 most recent packets sorted by `issued_at` descending, with `payload` projected out so the list view does not carry the sensitive body.

**REQ-ANCRID-069**
**Given** `DELETE /api/mobility/booking-packet/{token}`
**When** it runs
**Then** the delete is scoped to `{token, user_id: caller}`, so a creator cannot revoke another creator's packet; a zero delete count raises **404 `"Packet not found"`**.

**REQ-ANCRID-070**
**Given** a visitor opens `/packet/{token}`
**When** `HandleOrFallback` matches the prefix and `GET /api/public/packet/{token}` is called
**Then** an unknown or revoked token returns **404 `"Packet not found or revoked"`**; a packet past `expires_at` returns **410 `"Packet expired"`**; otherwise the stored payload is returned. **No authentication is required** — the token is the only credential.

**REQ-ANCRID-071**
**Given** a stored packet whose `expires_at` is missing or unparseable
**When** the expiry check raises `KeyError` or `ValueError`
**Then** the exception is swallowed by `except (KeyError, ValueError): pass` and **the packet is served as though valid**.

**REQ-ANCRID-072**
**Given** the packet fetch fails
**When** the catch runs
**Then** the page displays the server's `detail` string, or `"Packet not found"` when none is present.

### 1.9 Platform

**REQ-ANCRID-073**
**Given** `GET /api/`
**When** called
**Then** it returns `{"service": "ANCRID", "tagline": "Your Creative Identity. Everywhere.", "status": "ok"}` with no auth.

**REQ-ANCRID-074**
**Given** the CORS middleware
**When** it is configured
**Then** `allow_origins` is the **single value** of `FRONTEND_URL` (default `http://localhost:3000`) with `allow_credentials=True` — a genuine single-origin allow-list, required because auth rides on cookies.

**REQ-ANCRID-075**
**Given** the backend boots
**When** environment is read
**Then** `MONGO_URL`, `DB_NAME` and `JWT_SECRET` are mandatory; `EMERGENT_LLM_KEY`, `APP_NAME` and `FRONTEND_URL` are optional with defaults.

**REQ-ANCRID-076**
**Given** the axios client
**When** any request is made
**Then** it sends `withCredentials: true` so the httpOnly cookies are attached cross-origin; **no bearer token is ever stored client-side.**

**REQ-ANCRID-077**
**Given** the application has no seed routine
**When** it starts
**Then** **no startup seeding occurs** — there is no `@app.on_event("startup")` handler. The `aaron@ancr.io` account referenced by the login form, `auth_testing.md` and every test fixture must be created out-of-band via `/api/auth/register`.

---

## 2. TEST COVERAGE

**Test assets found**
- `backend/tests/backend_test.py` (169 lines) — root, login (invalid + success + cookies), `/auth/me`, unauth block, parametrised ANCRID endpoints, overview shape, network search and discipline filter, identity PATCH persistence, signup (new + duplicate), refresh, logout.
- `backend/tests/test_iter2.py` (166 lines) — public creator (found + 404), upload (401 unauth, 400 non-image, 400 oversize, success + fetch), SSO clients list, authorize + verify round-trip, verify invalid, authorize unauth, authorize unknown client, signup handle/ANCRID shape.
- `backend/tests/test_iter3.py` (77 lines) — journey unauth + shape, public creator includes journey, overview 9-module ecosystem, parametrised endpoint 200s, SSO clients count.
- `backend/tests/test_iter4.py` (182 lines) — mobility profile unauth + key shape, PATCH valid + invalid section, travel suggestions, packet create unauth, create + public fetch, invalid token, `include_emergency`, minimal public permission, list + revoke, plus four regression tests.
- `auth_testing.md` — a manual curl playbook covering login, `/auth/me`, protected overview, register and logout. Not automated.
- `test_result.md` — 102 lines, **protocol boilerplate only; the data section is empty**.
- **No frontend tests of any kind.**

| Requirement | Covered | Evidence / gap |
|---|---|---|
| REQ-ANCRID-001 | **No** | Form-level required/minLength attributes untested |
| REQ-ANCRID-002 | **Yes** | `test_signup_duplicate_email` asserts 400 |
| REQ-ANCRID-003 | **No** | The 422 path and `formatApiErrorDetail` rendering are untested |
| REQ-ANCRID-004 | **Partial** | `test_signup_returns_handle_and_ancrid` asserts a handle is returned; the collision-suffix loop and empty-slug fallback are not exercised |
| REQ-ANCRID-005 | **Partial** | Same test asserts ANCRID number shape; `public_profile` default and bcrypt hashing are not asserted |
| REQ-ANCRID-006 | **No** | That every registrant inherits `verification_status: "Verified"` is never asserted or challenged |
| REQ-ANCRID-007 | **Yes** | `test_signup_new_user` asserts 200 and the returned shape |
| REQ-ANCRID-008 | **No** | Frontend only |
| REQ-ANCRID-009 | **Yes** | `test_login_invalid` asserts 401 |
| REQ-ANCRID-010 | **Yes** | `test_login_success_sets_cookies` asserts cookies are set |
| REQ-ANCRID-011 | **No** | Frontend only |
| REQ-ANCRID-012 | **Partial** | `test_unauth_blocked` covers the no-credential 401; **the Bearer-header fallback path is never tested** |
| REQ-ANCRID-013 | **Partial** | Generic 401s are asserted; the four distinct detail messages (`Invalid token type`, `Token expired`, `Invalid token`, `User not found`) are not individually verified |
| REQ-ANCRID-014, 015 | **Partial** | `test_logout_clears_cookies` covers the server side; the client-side `ProtectedRoute` states are untested |
| REQ-ANCRID-016 | **Yes** | `test_refresh_token` asserts 200 |
| REQ-ANCRID-017 | **No** | The absence of a refresh interceptor is a frontend gap with no test |
| REQ-ANCRID-018 | **No** | No revocation test (nothing to test) |
| REQ-ANCRID-019 | **No** | Frontend routing |
| REQ-ANCRID-020 | **Yes** | `test_overview_shape` and `test_overview_9_ecosystem` |
| REQ-ANCRID-021 | **Yes** | Parametrised `test_ancrid_endpoint` |
| REQ-ANCRID-022 | **Yes** | `test_identity_patch_persists` asserts the write survives a re-read |
| REQ-ANCRID-023 | **No** | The `None`-skip behaviour (cannot clear a field) is never exercised |
| REQ-ANCRID-024 | **Partial** | All endpoints are asserted to return 200 across three test files; **that they return identical constants for every user is never asserted** — no test registers a second user and compares |
| REQ-ANCRID-025 | **Partial** | 200 asserted; the absence of real analysis is not |
| REQ-ANCRID-026 | **Yes** | `test_network_search` and `test_network_filter_discipline` |
| REQ-ANCRID-027 | **No** | Frontend only |
| REQ-ANCRID-028 | **Yes** | `test_upload_reject_non_image` asserts 400 |
| REQ-ANCRID-029 | **Yes** | `test_upload_reject_oversize` asserts 400 |
| REQ-ANCRID-030 | **Yes** | `test_upload_and_fetch` asserts upload then retrieval |
| REQ-ANCRID-031, 032 | **No** | Storage-failure and missing-key paths untested |
| REQ-ANCRID-033 | **Partial** | Fetch-after-upload is covered; **that the fetch requires no authentication is never asserted as a property** |
| REQ-ANCRID-034 | **No** | No delete to test |
| REQ-ANCRID-035 | **No** | Frontend only |
| REQ-ANCRID-036 | **No** | Frontend routing |
| REQ-ANCRID-037 | **Yes** | `test_public_creator_aaron` and `test_public_creator_unknown_returns_404`. The `public_profile: false` branch is **not** covered |
| REQ-ANCRID-038 | **Yes** | `test_public_creator_aaron` asserts the projection shape |
| REQ-ANCRID-039 | **Partial** | `test_public_creator_includes_journey` confirms the constants are attached but treats that as correct |
| REQ-ANCRID-040, 041 | **No** | Frontend only |
| REQ-ANCRID-042 | **Yes** | `test_sso_clients_list` and `test_sso_clients_still_9` |
| REQ-ANCRID-043 | **Yes** | `test_sso_authorize_and_verify` |
| REQ-ANCRID-044 | **No** | Frontend only |
| REQ-ANCRID-045 | **Yes** | `test_sso_authorize_unauth` asserts 401 |
| REQ-ANCRID-046 | **Partial** | `test_sso_verify_invalid` asserts 401; the expired-token and wrong-`type` branches are not separately covered |
| REQ-ANCRID-047 | **No** | **The audience bypass is never tested** — no test mints a token for one client and verifies it as another |
| REQ-ANCRID-048, 049 | **No** | Symmetric-secret design and the unauthenticated verify endpoint are untested as properties |
| REQ-ANCRID-050 | **No** | No revocation to test |
| REQ-ANCRID-051, 052 | **No** | Frontend only |
| REQ-ANCRID-053 | **Partial** | `test_mobility_profile_keys` asserts the shape; that it ignores the user is not asserted |
| REQ-ANCRID-054 | **Yes** | `test_mobility_patch_valid` (200) and `test_mobility_patch_invalid_section` (400) |
| REQ-ANCRID-055 | **No** | **The central mobility defect is untested.** `test_mobility_patch_valid` asserts the PATCH returns 200 but never re-reads the profile to confirm the change is visible — which is precisely why the read-back gap survived |
| REQ-ANCRID-056, 057 | **No** | Documents and masking untested |
| REQ-ANCRID-058 | **Yes** | `test_travel_suggestions` |
| REQ-ANCRID-059 | **No** | Permission map is never asserted against actual enforcement |
| REQ-ANCRID-060 | **No** | Frontend only |
| REQ-ANCRID-061 | **Partial** | Valid levels are exercised; **the 400 on an invalid `permission_level` is not tested** |
| REQ-ANCRID-062 | **Yes** | `test_packet_public_permission_minimal` and `test_packet_include_emergency_true` |
| REQ-ANCRID-063 | **No** | That `team` and `booking_only` are identical is never asserted or challenged |
| REQ-ANCRID-064 | **No** | The ignored `include_sections` field is untested |
| REQ-ANCRID-065 | **Yes** | `test_packet_create_and_public_fetch` |
| REQ-ANCRID-066 | **No** | Snapshot-staleness untested |
| REQ-ANCRID-067 | **No** | Constant-sourced packet content untested |
| REQ-ANCRID-068, 069 | **Yes** | `test_list_and_revoke_packet` |
| REQ-ANCRID-070 | **Partial** | 404 covered by `test_packet_public_invalid_token`; **the 410 expiry branch is not tested** (it would need a backdated record) |
| REQ-ANCRID-071 | **No** | The swallow-and-serve fallback on a malformed `expires_at` is untested |
| REQ-ANCRID-072 | **No** | Frontend only |
| REQ-ANCRID-073 | **Yes** | `test_root` |
| REQ-ANCRID-074, 075, 076, 077 | **No** | CORS, env requirements, cookie transport and the absent seed are untested |

**Summary:** 77 requirements. **25 Yes**, **18 Partial**, **34 No**. This is by a wide margin the best-tested application in the workspace — 4 backend suites covering auth, uploads, SSO, mobility and packets, including negative paths. The gaps that matter most are the two the tests come closest to without catching: mobility read-back (REQ-ANCRID-055) and SSO audience verification (REQ-ANCRID-047). There is still **zero frontend coverage**.

---

## 3. SPEC GAP ANALYSIS

**Specs compared:** `ANCRID_Product_Specification_v1.0 (1) (1).pdf` (9 pp., canonical, "Module 1 of 10"), `ANCRID (Identity & SSO) PRD.pdf` (2 pp., revised 2026-09-03), `ANCRID_Master_Workflow.pdf` (3 pp.), `memory/PRD.md`, `auth_testing.md`.

### (a) Specified but NOT implemented in code

| # | Spec source | Requirement | Code state |
|---|---|---|---|
| G1 | Product Spec §12; Master Workflow p.1 | **Multi-Factor Authentication** — listed in §12 and shown as a step in the master workflow ("MFA · JWT · Session Created") | **Not implemented.** Login is email + password only. No TOTP, no recovery codes, no enrolment. |
| G2 | Product Spec §12 | **Role-Based Access Control** with distinct Institution, Faculty, Student, Employer and Administrator permission sets | `role` is a free-text string defaulting to `"Creator"`. **It gates nothing.** Every authenticated user reaches every endpoint identically. |
| G3 | Product Spec §16; PRD §02 | "ANCRID™ **stores references to ecosystem data** rather than duplicating ownership of records" — PRD adds "strictly read-by-reference / never copied" | ANCRID holds no references and makes **no outbound call to any module**. Portfolio, timeline, collaborations, skills, education, history, achievements, credentials and journey are all in-process Python constants (REQ-ANCRID-024). |
| G4 | Product Spec §16 | "**Public and private information must be field-level permission controlled**" | The only field-level control is the hard-coded `_public_projection` whitelist and the packet projection. The `DEMO_MOBILITY["permissions"]` map is declarative and enforced nowhere (REQ-ANCRID-059). There is no per-field visibility setting a creator can change. |
| G5 | Product Spec §09 **Reputation Engine™** — "calculated automatically from verified ecosystem activity rather than self-reporting" | 11 named reputation states | **No reputation engine exists.** Three scores (`portfolio_score` 87, `creative_reputation_score` 91, `professional_readiness_score` 78) are copied verbatim onto every new account from `_demo_identity()` and are never recomputed. None of the 11 named states appears in the code. |
| G6 | Product Spec §08 **Verification** — 14 verifiable item types, each receiving a badge, timestamp, institution source and verification authority | Identity, Institution, Faculty, Employment, Graduation, Credits, Publishing, Releases, Projects, Collaborations, Recommendations, Achievements, Portfolio, Professional History | **No verification workflow exists.** Every registrant is issued `verification_status: "Verified"` plus four badges at signup with no check (REQ-ANCRID-006). The `DEMO_CREDENTIALS` constant carries issuer and date strings but no verification authority, no timestamp of record and no revocation. |
| G7 | Product Spec §06 Identity Platform (18 fields) | Includes **Legal Name**, **Degrees**, **Graduation Year**, **Countries**, **QR Code**, **Digital Identity Card** | Legal name exists only inside the mobility constant, never on the user record. Degrees, graduation year and countries are absent. **QR Code and Digital Identity Card are not implemented at all.** |
| G8 | Product Spec §07 Creator Passport™ (22 elements) | Includes **Professional Summary**, **Credits**, **Publishing**, **Media**, **Recommendations**, **Availability**, **Resume**, **Press Kit** | None of these eight exists as a field, endpoint or surface. The remaining elements are the demo constants of G3. |
| G9 | Product Spec §10 Creator Mobility™ | **Stage Plot** and **Input List** as first-class sections | `riders.stage_plot` is the literal string `"—"` and `input_list` is a prose note. Neither is a structured or uploadable artefact. |
| G10 | Product Spec §10; §11 | **Documents** section of Creator Mobility, and document-backed booking packets | Documents are six label-only descriptors with no storage, upload or download (REQ-ANCRID-056). The file service exists but is wired only to Settings images. |
| G11 | Product Spec §14 AIAH™ Integration — 9 capabilities | Identity Insights, Verification Assistance, Profile Completion, Career Readiness, Travel Suggestions, Permission Recommendations, Resume Optimization, Professional Growth, Opportunity Readiness | **There is no LLM integration in this application at all.** `EMERGENT_LLM_KEY` is used solely to authenticate to object storage. "AI insights" and "AI travel suggestions" are static lists (REQ-ANCRID-025, 058). |
| G12 | Master Workflow p.2–3; Product Spec §12 | Every module opens with **no login**; "Every module simply checks: is there a valid ANCRID session? If YES — open. If NO — redirect to ANCRID." | ANCRID **issues** SSO tokens correctly, but no module consumes them. There is no redirect-back flow, no `redirect_uri`, no authorization-code exchange and no session propagation — `POST /api/sso/authorize` returns a token to the ANCRID UI itself, which displays it. |
| G13 | Master Workflow p.3 recommendation | Add a dedicated **ANCR™ Home (Ecosystem Hub)** immediately after login as the launch point | Not implemented. Login lands on `/app/overview`; `/app/connected` lists module *statuses* from a constant but launches nothing. |
| G14 | PRD §04 | "**All write transactions must publish corresponding events to the central Event Spine**" | **No event is published anywhere.** There is no outbox, no publisher and no event model. |
| G15 | PRD §04 | "REST API backends must expose **unified success/error models**" | Errors are ad-hoc `HTTPException(status, detail)` strings; successes vary between `{items: [...]}`, bare objects, `{ok: true}` and raw constants. There is no envelope, correlation id or error code. |
| G16 | PRD §06 | "Enforce secure SSL communication. **Mask and securely sign high-sensitivity parameters** (… legal identities). Comply with GDPR, FERPA, HIPAA." | Medical data, emergency contacts, passport details and insurance numbers are served in the clear from a constant. The `_mask()` helper is defined and **never called** (REQ-ANCRID-057). There is no consent record, no data-subject export/erase path and no audit log. |
| G17 | Product Spec §12 | **Session Management** | No session store, no active-device list, no revocation, no "sign out everywhere" (REQ-ANCRID-018, 050). |
| G18 | Product Spec §16 | "Every creator receives **one permanent ANCRID™**" | `ancrid_number` is `ANCRID-2026-{randbelow(9000)+1000}` — a 4-digit random with **no uniqueness check**, drawn from a 9,000-value space. Collisions are expected at scale (≈50% probability by ~112 registrations). |

### (b) Implemented but NOT mentioned in the spec

| # | Code feature | Spec status |
|---|---|---|
| E1 | **Public creator page at `/@{handle}`** with generated unique handles, a `public_profile` flag and an unauthenticated JSON projection. | §06 lists "Public URL" as an identity field but specifies no handle namespace, no slug rules, no collision policy and no public page behaviour. |
| E2 | **Booking-packet snapshotting.** The rendered payload is frozen into the database at issue time, so later identity edits never reach an issued packet (REQ-ANCRID-066). | §11 requires packets to be "Revocable, Time-limited, Secure" but says nothing about whether they are live views or snapshots. The chosen semantics are a significant product decision made implicitly in code. |
| E3 | **`ANCRID_Master_Workflow` names 11+ modules; the SSO client registry has 9** — and includes **ANCRVIEW™** and **ANCRWAV™**, which appear in neither the ANCRID product spec §13 (9 modules, incl. ANCRMEDIA™ and ANCRD™) nor the workflow's module list. | §13 names ANCRMEDIA™ and ANCRD™; the SSO registry omits both and substitutes ANCRVIEW/ANCRWAV. The registries disagree. |
| E4 | **Emergent object-storage integration** with a 4-type MIME allow-list, an 8 MiB cap, per-user path namespacing and immutable public caching. | No storage, upload or media-handling requirement appears in the spec. |
| E5 | **Unauthenticated file serving** at `/api/files/{uuid}` with a one-year immutable cache (REQ-ANCRID-033). | Contradicts §16's field-level permission requirement — an uploaded image is world-readable by URL with no expiry. |
| E6 | **A `journey` model** of chaptered career stages with future-dated milestones, gains and a quote, served at `/api/ancrid/journey` and embedded in every public profile. | Appears nowhere in the spec. §07 names a "Professional Timeline", which is a separate endpoint. |
| E7 | **`DEMO_NETWORK` creator directory** with search and filters at `/app/network`. | §13 assigns the professional network and discovery to **ANCRD™**. A directory inside ANCRID duplicates that ownership. |
| E8 | **Hard-coded demo credentials pre-filled on the login form**, and the same pair published in `auth_testing.md`. | Not a spec concept. |
| E9 | **`sso_grants` audit collection** — written on every authorize and listed at `/api/sso/grants`. | A reasonable implementation of implied consent history, but the spec defines no grant model, retention or revocation semantics (REQ-ANCRID-050). |
| E10 | **`include_sections` field** on `PacketRequest`, accepted and silently ignored (REQ-ANCRID-064). | Unspecified and non-functional. |

---

## 4. UNCLEAR / NEEDS INPUT

**Q1 — Mobility saves are invisible (likely defect).**
`PATCH /api/mobility/profile` persists to `user.mobility.{section}`, but `GET /api/mobility/profile` always returns the static `DEMO_MOBILITY` and nothing anywhere reads `user.mobility` (REQ-ANCRID-055). Booking packets are also built from the constant. I have not changed this. Confirm the GET should merge the user's saved sections over the defaults, and whether packets should then use the merged data.

**Q2 — Every registrant is issued "Verified" status.**
`_demo_identity()` grants `verification_status: "Verified"`, four verified badges and three scores to every new account with no check (REQ-ANCRID-006, G6). For a product whose entire premise is verified identity, what should a new unverified account actually look like, and what is the verification workflow?

**Q3 — ANCRID number uniqueness.**
`ANCRID-2026-{randbelow(9000)+1000}` has no uniqueness check against a 9,000-value space (G18), while `handle` **does** have a collision loop. Should the number use the same uniqueness treatment, a wider space, or a sequence?

**Q4 — SSO audience is not verified.**
`POST /api/sso/verify` passes `verify_aud: False` with an in-code comment that this is for the demo (REQ-ANCRID-047). Should verification enforce `aud`, and should partner modules verify locally against a JWKS (the spec implies asymmetric SSO) rather than calling back with the shared secret (REQ-ANCRID-048)?

**Q5 — SSO is issue-only; there is no consumption flow.**
There is no `redirect_uri`, no authorization code, no state parameter and no session hand-back (G12). What is the intended handoff — a signed redirect, a cookie on a shared parent domain, or a backchannel token exchange? This determines whether the 5-minute TTL is right.

**Q6 — File serving is unauthenticated and permanent.**
`GET /api/files/{uuid}` requires no auth and sets a one-year immutable cache; there is no delete (REQ-ANCRID-033, 034, E5). Should uploads be signed-URL gated, and should `is_deleted` be wired to an actual delete endpoint?

**Q7 — `team` and `booking_only` packets are identical.**
The projection returns the same fields for both levels (REQ-ANCRID-063). What should `team` additionally expose — attorney and merch manager contacts, private documents, emergency contacts by default?

**Q8 — `include_sections` is accepted and ignored.**
(REQ-ANCRID-064.) Should packet section selection be implemented, or the field removed from the model?

**Q9 — Packet snapshot vs live view.**
Issued packets freeze their payload (REQ-ANCRID-066, E2). Is that the intended contract — a stable document a promoter can rely on — or should a packet re-render live so corrections propagate? This is a product decision currently made implicitly.

**Q10 — Malformed `expires_at` serves the packet.**
The expiry check swallows `KeyError`/`ValueError` and serves the payload (REQ-ANCRID-071). Should an unparseable expiry fail closed instead?

**Q11 — Sensitive mobility data and compliance.**
Medical conditions, physician, insurance number, emergency contacts and passport details are served unmasked from a constant, and the `_mask()` helper is never called (REQ-ANCRID-057, G16). The PRD names GDPR, FERPA and HIPAA. Which of these fields may be stored at all, which require masking or encryption at rest, and is a consent record needed before a packet including emergency contacts can be issued?

**Q12 — Refresh token is never used by the client.**
A 30-day refresh cookie is issued and `/auth/refresh` works, but the frontend has no interceptor and drops the user to `/login` on any 401 (REQ-ANCRID-017). Should an interceptor retry once through refresh?

**Q13 — Identity fields cannot be cleared.**
`PATCH` skips `None` values, so a populated biography or website cannot be emptied (REQ-ANCRID-023). Should empty string mean "clear", or should the API accept explicit nulls?

**Q14 — Which module registry is canonical?**
Product Spec §13 names ANCRMEDIA™ and ANCRD™ among nine integrations; the SSO client registry omits both and lists ANCRVIEW™ and ANCRWAV™ instead; the Master Workflow names VIEARTA™ and CYNAIAH™ as well (E3). Which list should the SSO registry hold?

**Q15 — Role model.**
`role` is free text defaulting to `"Creator"` and enforces nothing, while §12 specifies five distinct permission sets (G2). What are the roles, what does each permit, and should role be assignable only by an institution administrator?

**Q16 — Demo constants and multi-tenancy.**
Eleven record endpoints and the entire public projection return identical constants for every creator (REQ-ANCRID-024, 039). Before ecosystem integration exists, should these be (a) left as-is for the demo, (b) moved into each user's document at registration so profiles at least differ, or (c) returned empty with an explicit "not yet connected" state?

**Q17 — No seed and no admin account.**
There is no startup seed (REQ-ANCRID-077), yet the login form, `auth_testing.md` and every test fixture assume `aaron@ancr.io` exists. How is that account expected to be created in a fresh environment?

**Q18 — Public profile discoverability.**
`public_profile: false` makes a creator return 404, indistinguishable from a non-existent handle (REQ-ANCRID-037). Intended for privacy, or should it return a "profile is private" state? There is also no UI control to toggle the flag.

**Q19 — Event Spine emissions.**
The PRD requires every write to publish an event (G14). Which writes here are event-worthy — identity updated, packet issued, packet revoked, SSO grant issued, file uploaded — and what is the envelope?
