# ANCRD — Functional Requirements

**App folder:** `ANCR-ANCRD1.2`
**APPNAME:** `ANCRD`
**Derived from:** `backend/server.py`, `backend/seed_data.py`, `frontend/src/**`
**Stack observed:** FastAPI + Motor/MongoDB, JWT (HS256) + bcrypt; React + React Router + axios + Sonner
**Date of extraction:** 2026-09-03

---

## 1. FUNCTIONAL REQUIREMENTS

### 1.1 Authentication & session

**REQ-ANCRD-001**
**Given** an unauthenticated visitor
**When** they navigate to any route other than `/login`
**Then** the `Protected` wrapper renders `Loading ANCRD…` while `AuthContext` resolves, and once `loading` is false with no `user` it redirects to `/login` via `<Navigate replace>`.

**REQ-ANCRD-002**
**Given** the application mounts
**When** `AuthProvider`'s effect runs and `localStorage["ancrd_token"]` is absent
**Then** `loading` is set false immediately and no `/auth/me` request is issued.

**REQ-ANCRD-003**
**Given** a token exists in localStorage
**When** the provider calls `GET /api/auth/me`
**Then** a success sets the user; **any** failure removes `ancrd_token` from localStorage, leaving the visitor unauthenticated.

**REQ-ANCRD-004**
**Given** the login form at `/login`
**When** it renders
**Then** the email and password fields are **pre-populated with the hard-coded demo credentials** `aaron@ancrd.io` / `ancrd2026`, and the same pair is additionally printed on screen in a "Demo Credentials" panel.

**REQ-ANCRD-005**
**Given** the login form
**When** either field is empty and the user submits
**Then** the browser blocks submission — both inputs carry `required`, and the email input is `type="email"` so the browser also enforces address format. No server call is made.

**REQ-ANCRD-006**
**Given** valid credentials are submitted
**When** `POST /api/auth/login` succeeds
**Then** the returned token is written to `localStorage["ancrd_token"]`, the user is set in context, a success toast `"Welcome to ANCRD"` is shown and the router navigates to `/feed`.

**REQ-ANCRD-007**
**Given** the login request is in flight
**When** `busy` is true
**Then** the submit button is `disabled` and its label changes from `Enter ANCRD` to `Verifying…`.

**REQ-ANCRD-008**
**Given** credentials that do not match
**When** the server responds
**Then** `POST /api/auth/login` raises **401 `"Invalid credentials"`** for both an unknown email and a wrong password (the two cases are indistinguishable to the client), and the UI shows the toast `"Invalid credentials"`.

**REQ-ANCRD-009**
**Given** a successful login
**When** the response is built
**Then** the server strips `_id` and `password` from the user object and returns `{token, user}`. The token is a JWT signed HS256 with `{"sub": user_id, "exp": now + 30 days}`.

**REQ-ANCRD-010**
**Given** an authenticated user already in session
**When** they navigate to `/login`
**Then** the page redirects to `/feed` via `<Navigate replace>`.

**REQ-ANCRD-011**
**Given** any outgoing request from the frontend
**When** the axios request interceptor runs
**Then** if `localStorage["ancrd_token"]` is present it is attached as `Authorization: Bearer <token>`.

**REQ-ANCRD-012**
**Given** any API response with status 401
**When** the axios response interceptor runs
**Then** the token is removed from localStorage and, unless already on `/login`, the browser is hard-navigated to `/login` via `window.location.href`.

**REQ-ANCRD-013**
**Given** a protected endpoint is called with no `Authorization` header
**When** `current_user` executes
**Then** it raises **401 `"Not authenticated"`** (`HTTPBearer(auto_error=False)` yields `None` credentials).

**REQ-ANCRD-014**
**Given** a protected endpoint is called with a malformed, expired or wrongly-signed token
**When** `jwt.decode` raises `PyJWTError`
**Then** the server raises **401 `"Invalid token"`**.

**REQ-ANCRD-015**
**Given** a structurally valid token whose `sub` no longer matches a user document
**When** the lookup returns nothing
**Then** the server raises **401 `"Invalid token"`**.

**REQ-ANCRD-016**
**Given** an authenticated user
**When** they click the sidebar logout control (`data-testid="logout-btn"`)
**Then** the token is removed from localStorage, the user is cleared and the browser hard-navigates to `/login`. **No server-side logout, revocation or token blacklist exists** — the issued JWT remains valid for its full 30-day lifetime.

**REQ-ANCRD-017**
**Given** the deployed application
**When** a visitor attempts to create an account
**Then** **no registration path exists** — there is no signup route, no signup page and no `POST /api/auth/register` endpoint. Accounts exist only via the seed.

**REQ-ANCRD-018**
**Given** a user who has forgotten their password
**When** they look for a recovery flow
**Then** **none exists** — there is no password reset, change-password or email-verification endpoint or page.

### 1.2 Shell & navigation

**REQ-ANCRD-019**
**Given** any authenticated page
**When** `AppShell` renders
**Then** it mounts `EcosystemSidebar` (fixed 280px, hidden below `lg`), the page content, and — when the `right` prop is supplied — the AIAH panel plus a floating trigger (`data-testid="aiah-fab"`).

**REQ-ANCRD-020**
**Given** the sidebar renders
**When** the ecosystem section is displayed
**Then** it lists **10 modules** — ANCRD, ANCRA, ANCRLAB, ANCRSync, COHEIR, INHEIRA, Vaulta, ANCRMEDIA, ANCRLaunch, ANCRID — each as an in-app `NavLink` (`nav-eco-{label}`). Every link resolves to a route **inside this application**; no external navigation occurs.

**REQ-ANCRD-021**
**Given** the sidebar renders
**When** the application section is displayed
**Then** it lists 9 destinations: The Signal (`/feed`), Network, Collaborations, Opportunities, Events, Institutions, Discover, Messages, Notifications — plus a profile link to `/profile/{user.id}`.

**REQ-ANCRD-022**
**Given** a user navigates to one of `/ancra`, `/ancrlab`, `/ancrsync`, `/coheir`, `/inheira`, `/vaulta`, `/ancrmedia`, `/ancrlaunch`, `/ancrid`
**When** `EcosystemModulePage` renders
**Then** it displays a **static placeholder** built from an in-file `MODULES` constant (name, tagline, four "stream" labels) and a link back to `/feed`. No request is made to any module and no real activity is surfaced.

**REQ-ANCRD-023**
**Given** a user navigates to `/`
**When** the route resolves
**Then** it redirects to `/feed`.

**REQ-ANCRD-024**
**Given** the routes `/collaborations` and `/communities`
**When** either resolves
**Then** both render the same `CommunitiesPage`; likewise `/collaborations/:id` and `/communities/:id` both render `CollaborationDetailPage`.

### 1.3 Feed (The Signal)

**REQ-ANCRD-025**
**Given** an authenticated user opens `/feed`
**When** the page mounts
**Then** `GET /api/posts` returns up to 200 posts sorted by `created_at` descending, with each post's `author` hydrated from a single batched user lookup; `GET /api/users` is also called and the first 5 results are rendered as suggested creators.

**REQ-ANCRD-026**
**Given** the feed query runs server-side
**When** it executes
**Then** it first selects posts where `community_id` is `null` (`{"$in": [None]}`); **if that yields zero posts it falls back to returning every post regardless of community**, so community-scoped posts can appear in the global feed.

**REQ-ANCRD-027**
**Given** the composer on the feed
**When** the user submits with content that is empty or whitespace-only
**Then** `create()` returns early after `content.trim()` — no request is issued and no toast is shown.

**REQ-ANCRD-028**
**Given** the composer contains text
**When** the user submits
**Then** `POST /api/posts` is called with `{content, kind: "text"}`; the server creates a post with a generated UUID, the caller as `author_id`, empty `reactions` and `comments`, and an ISO-8601 UTC `created_at`. The composer clears, the feed reloads and a `"Posted"` toast appears.

**REQ-ANCRD-029**
**Given** the `PostCreate` model
**When** a post is created
**Then** `media_url`, `hashtags` and `community_id` are accepted by the API but **the feed composer never sends them** — it only sends `content` and a hard-coded `kind: "text"`. The six documented kinds (`text, image, video, music, achievement, event`) are not selectable in the UI.

**REQ-ANCRD-030**
**Given** a post in the feed
**When** the user clicks a reaction control
**Then** `POST /api/posts/{id}/react` toggles membership: if the caller's id is already in `reactions.{reaction}` it is `$pull`ed, otherwise `$addToSet`ed. The feed then reloads.

**REQ-ANCRD-031**
**Given** a reaction is posted against an id that does not exist
**When** the handler looks up the post
**Then** it raises **404 `"Post not found"`**.

**REQ-ANCRD-032**
**Given** the `ReactionBody` model
**When** a reaction is submitted
**Then** `reaction` is an unconstrained free-text string used directly to build the Mongo field path `reactions.{value}` — **no allow-list validates it against the documented set** (`like, applaud, celebrate, insightful, save`).

**REQ-ANCRD-033**
**Given** a post card
**When** the user clicks the comment toggle (`comment-toggle-{id}`)
**Then** the comment list and comment form expand or collapse via local state.

**REQ-ANCRD-034**
**Given** the comment form
**When** the user submits empty or whitespace-only text
**Then** `submitComment()` returns early — no request is issued.

**REQ-ANCRD-035**
**Given** valid comment text
**When** `POST /api/posts/{id}/comment` is called
**Then** the server `$push`es a comment carrying a UUID, the caller's id, name and avatar, the content and a UTC timestamp, returns the comment object, and the UI shows a `"Comment added"` toast and reloads.

**REQ-ANCRD-036**
**Given** a comment is posted against a post id that does not exist
**When** the handler runs
**Then** **no existence check is performed** — `update_one` matches nothing, the write is a silent no-op, and the API still returns 200 with the constructed comment object. The client cannot distinguish this from success.

**REQ-ANCRD-037**
**Given** any post or comment
**When** the author wishes to change or remove it
**Then** **no edit or delete endpoint exists** for posts or comments.

### 1.4 Profiles & following

**REQ-ANCRD-038**
**Given** a user opens `/profile/{id}`
**When** the page mounts
**Then** `GET /api/users/{id}` returns the profile with `_id` and `password` projected out; an unknown id raises **404 `"User not found"`**.

**REQ-ANCRD-039**
**Given** a profile is displayed
**When** the user clicks Follow (`data-testid="follow-btn"`)
**Then** `POST /api/users/{id}/follow` `$addToSet`s the target into the caller's `following` and the caller into the target's `followers`, and a toast `"Following {name}"` is shown.

**REQ-ANCRD-040**
**Given** a user attempts to follow their own profile
**When** the handler compares ids
**Then** it raises **400 `"Cannot follow yourself"`**.

**REQ-ANCRD-041**
**Given** a user is already following someone
**When** they click Follow again
**Then** `$addToSet` makes the write idempotent, but the button label does not change and the same success toast is shown — **the UI never reflects follow state**.

**REQ-ANCRD-042**
**Given** a user wishes to stop following someone
**When** they look for the control
**Then** **no unfollow endpoint or control exists.** Following is one-way and irreversible through the application.

**REQ-ANCRD-043**
**Given** a follow target id that matches no user
**When** the handler runs
**Then** **no existence check is performed** — both `update_one` calls no-op and the endpoint returns `{"ok": true}`.

**REQ-ANCRD-044**
**Given** a signed-in user
**When** they wish to edit their own profile
**Then** **no profile update endpoint or edit UI exists** — bio, skills, avatar, disciplines and availability are only settable via the seed.

### 1.5 Network & discovery

**REQ-ANCRD-045**
**Given** a user opens `/network`
**When** the page mounts
**Then** `GET /api/users` loads up to 500 users and the list is filtered **entirely client-side** by a free-text query (`network-search`), a role selection and a discipline selection.

**REQ-ANCRD-046**
**Given** a user opens `/discover`
**When** the page mounts
**Then** both `GET /api/users` and `GET /api/institutions` are loaded and rendered on a map surface, filtered client-side by query (`map-search`), country, discipline and role.

**REQ-ANCRD-047**
**Given** either directory page
**When** the dataset exceeds the server's 500-document cap
**Then** results beyond the cap are silently unavailable — there is no pagination, cursor or total count on `GET /api/users`.

### 1.6 Communities / collaborations

**REQ-ANCRD-048**
**Given** a user opens `/communities` or `/collaborations`
**When** the page mounts
**Then** `GET /api/communities` returns up to 200 communities.

**REQ-ANCRD-049**
**Given** a community card
**When** the user clicks Join
**Then** `POST /api/communities/{id}/join` `$addToSet`s the caller into `members`, a `"Joined collaboration"` toast is shown and the list reloads. The click handler calls `e.stopPropagation()` so the card's own navigation does not fire.

**REQ-ANCRD-050**
**Given** a user opens `/communities/{id}` or `/collaborations/{id}`
**When** the page mounts
**Then** `GET /api/communities/{id}` returns the community with `member_profiles` hydrated (up to 200) and a computed `is_member` boolean, and `GET /api/communities/{id}/posts` returns that community's posts with authors hydrated. An unknown id raises **404 `"Community not found"`**.

**REQ-ANCRD-051**
**Given** the community detail page
**When** the user clicks the membership toggle
**Then** if `is_member` is true `POST /api/communities/{id}/leave` `$pull`s them and toasts `"Left {name}"`; otherwise `POST .../join` `$addToSet`s them and toasts `"Joined {name}"`. Both then reload the community.

**REQ-ANCRD-052**
**Given** a join or leave call against a community id that does not exist
**When** the handler runs
**Then** **no existence check is performed** — the write no-ops and `{"ok": true}` is returned.

**REQ-ANCRD-053**
**Given** the community composer
**When** the user posts
**Then** `POST /api/posts` is called with `{content, kind: "text", community_id: id}` and a toast `"Posted to {name}"` is shown.

**REQ-ANCRD-054**
**Given** the community composer or post list
**When** a non-member views the page
**Then** **no membership check gates posting or reading** — any authenticated user may post into and read any community regardless of `is_member`.

### 1.7 Messaging

**REQ-ANCRD-055**
**Given** a user opens `/messages`
**When** the page mounts
**Then** `GET /api/messages/threads` returns threads where `members` contains the caller, sorted by `updated_at` descending, each hydrated with an `other` party object; the first thread is auto-selected when none is active.

**REQ-ANCRD-056**
**Given** a thread is selected
**When** the effect runs
**Then** `GET /api/messages/{thread_id}` returns up to 500 messages sorted by `created_at` ascending.

**REQ-ANCRD-057**
**Given** `GET /api/messages/{thread_id}`
**When** the handler executes
**Then** it filters **only** on `thread_id` — **it never verifies that the caller is a member of that thread.** Any authenticated user who knows or guesses a thread id can read that conversation in full.

**REQ-ANCRD-058**
**Given** the message composer
**When** the user submits empty text, or when no thread is active
**Then** `send()` returns early — no request is issued.

**REQ-ANCRD-059**
**Given** valid message text and an active thread
**When** `POST /api/messages` is called with `{to_user_id, content}`
**Then** the server looks for an existing `kind: "dm"` thread containing both parties; if none exists it creates one with a UUID and both members, otherwise it updates `updated_at` and `last_message`. It then inserts the message and returns it. The composer clears and the thread reloads.

**REQ-ANCRD-060**
**Given** a message is sent to a `to_user_id` that matches no user
**When** the handler runs
**Then** **no existence check is performed** — a thread is created against the non-existent id and the message is stored.

**REQ-ANCRD-061**
**Given** the messaging surface
**When** the user looks for group conversations, file sharing, read receipts or typing indicators
**Then** **none exist.** Only 1:1 `kind: "dm"` threads are creatable, and message delivery is poll-on-send only — there is no WebSocket, SSE or polling refresh, so an inbound message appears only after the recipient sends or reselects a thread.

### 1.8 Events, opportunities, marketplace

**REQ-ANCRD-062**
**Given** a user opens `/events`
**When** the page mounts
**Then** `GET /api/events` returns up to 200 events sorted by `date` ascending.

**REQ-ANCRD-063**
**Given** an event card
**When** the user clicks RSVP (`rsvp-{id}`)
**Then** `POST /api/events/{id}/rsvp` `$addToSet`s the caller into `attendees`, a `"RSVP confirmed"` toast is shown and the list reloads. **There is no un-RSVP endpoint, no capacity check and no existence check on the event id.**

**REQ-ANCRD-064**
**Given** a user opens `/opportunities`
**When** the page mounts
**Then** `GET /api/opportunities` returns up to 200 opportunities; clicking a `kind` chip (`opp-filter-{kind}`) filters the list client-side, and the `All` chip clears the filter.

**REQ-ANCRD-065**
**Given** an opportunity
**When** the user clicks Apply (`apply-{id}`)
**Then** `POST /api/opportunities/{id}/apply` `$addToSet`s the caller into `applicants`, toasts `"Application submitted"` and reloads. **The application carries no cover note, attachment or portfolio reference — only the user id.** There is no withdraw endpoint and no existence check.

**REQ-ANCRD-066**
**Given** a user has already applied
**When** they click Apply again
**Then** `$addToSet` makes it idempotent but the button and toast are unchanged — **applied state is never reflected in the UI**.

**REQ-ANCRD-067**
**Given** a user opens `/marketplace`
**When** the page mounts
**Then** `GET /api/marketplace` returns up to 200 listings.

**REQ-ANCRD-068**
**Given** a listing
**When** the user clicks Book (`book-{id}`)
**Then** `POST /api/marketplace/{id}/book` verifies the listing exists (**404 `"Not found"` otherwise**), inserts a booking with a UUID, the caller as `client_id`, the listing's `provider_id`, a timestamp and `status: "pending"`, and returns it. A `"Booking request sent"` toast is shown.

**REQ-ANCRD-069**
**Given** a booking has been created
**When** either party wishes to view, accept, decline or cancel it
**Then** **no such capability exists** — `bookings` is written but never read. There is no endpoint that returns bookings, no status transition and no notification to the provider.

### 1.9 Notifications

**REQ-ANCRD-070**
**Given** a user opens `/notifications`
**When** the page mounts
**Then** `GET /api/notifications` returns up to 100 notifications scoped to `user_id` and sorted by `created_at` descending.

**REQ-ANCRD-071**
**Given** notifications are displayed
**When** the user reads them
**Then** **there is no mark-as-read, dismiss or unread-count capability** — notifications are read-only and are never generated by any application action (follow, comment, RSVP, booking and message all write no notification).

### 1.10 Institutions

**REQ-ANCRD-072**
**Given** a user opens `/institutions`
**When** the page mounts
**Then** `GET /api/institutions` returns up to 200 institutions.

**REQ-ANCRD-073**
**Given** a user opens `/institutions/{id}`
**When** the page mounts
**Then** `GET /api/institutions/{id}` returns a composite payload: the institution, its members bucketed by role into `students` / `faculty` / `alumni` / `admins`, a feed of up to 60 posts authored by its members, `releases` (posts of kind `music` or `achievement`, capped at 12), events matching `host_institution == institution.name`, the 6 most recent opportunities, a `leaderboard` of the top 8 members by `portfolio_score`, `departments` from `inst.programs`, and a `counts` object. An unknown id raises **404 `"Institution not found"`**.

**REQ-ANCRD-074**
**Given** the institution role bucketing
**When** `by_role` runs
**Then** faculty is matched against the literal set `Faculty`, `Professor`, `Adjunct Professor`, `Artist in Residence`, `Executive in Residence`; admins against `Institution Administrator`, `Administrator`. **A member whose role string falls outside every bucket is counted in `members` but appears in no list.**

**REQ-ANCRD-075**
**Given** institution events are selected
**When** the query runs
**Then** it matches on `host_institution` equal to the institution's **name string**, not its id — renaming an institution silently detaches its events.

**REQ-ANCRD-076**
**Given** a user opens `/institutions/{id}/dashboard`
**When** the page mounts
**Then** `GET /api/institutions/{id}/dashboard` returns counts, `career_readiness` (the mean `portfolio_score` across all members, rounded), `placement_rate`, `graduation_by_year`, a community-membership `collaborations.total`, and the top 5 faculty and students by portfolio score.

**REQ-ANCRD-077**
**Given** `placement_rate` is computed
**When** the handler runs
**Then** it is derived as the percentage of alumni whose **`portfolio_score >= 70`** — a hard-coded proxy threshold. **No placement, employment or outcome record exists anywhere in the data model.**

**REQ-ANCRD-078**
**Given** either institution endpoint
**When** any authenticated user calls it
**Then** it succeeds — **no check restricts institution dashboards to that institution's administrators or members.**

### 1.11 Employer / talent search

**REQ-ANCRD-079**
**Given** a user opens `/employer`
**When** the page mounts
**Then** `POST /api/employer/search` runs with the current filter state and `GET /api/employer/saved` loads the saved list.

**REQ-ANCRD-080**
**Given** the employer search body
**When** it is evaluated server-side
**Then** all seven filters are applied **in memory over up to 500 users**: `q` (case-insensitive substring of `name + bio`), exact `role`, `discipline` membership, exact `availability`, exact `country`, `skill` membership, and `min_portfolio` as a `>=` threshold. Results are sorted by `portfolio_score` descending, and the response returns the **full match `count`** alongside only the **first 80** results.

**REQ-ANCRD-081**
**Given** a search returns no matches
**When** the results area renders
**Then** the message `"No candidates match. Loosen filters to expand the pool."` is displayed.

**REQ-ANCRD-082**
**Given** a candidate card
**When** the user clicks the save control
**Then** if already saved, `DELETE /api/employer/saved/{id}` `$pull`s the id and toasts `"Removed {name}"`; otherwise `POST /api/employer/saved/{id}` `$addToSet`s it and toasts `"Saved {name}"`. The saved list then reloads.

**REQ-ANCRD-083**
**Given** the employer surface
**When** any authenticated user navigates to `/employer`
**Then** it renders and all four employer endpoints succeed — **no role check restricts talent search to employer or recruiter accounts.** Any student can search and save every other creator.

**REQ-ANCRD-084**
**Given** the minimum-portfolio filter
**When** the page first mounts
**Then** it defaults to **60**, so the initial result set silently excludes every creator scoring below that.

### 1.12 Admin

**REQ-ANCRD-085**
**Given** a user opens `/admin`
**When** the page mounts
**Then** `GET /api/admin/stats` returns document counts for `users`, `posts`, `communities`, `events`, `opportunities`, `marketplace` and `institutions`.

**REQ-ANCRD-086**
**Given** the admin route and endpoint
**When** any authenticated user reaches them
**Then** both succeed — **no role check of any kind guards `/admin` or `GET /api/admin/stats`.** The route is not linked from the sidebar but is directly reachable.

**REQ-ANCRD-087**
**Given** the admin surface
**When** the user looks for moderation capability
**Then** **none exists** — no user suspension, post removal, community moderation or report queue.

### 1.13 AIAH

**REQ-ANCRD-088**
**Given** a page that passes the `right` prop to `AppShell`
**When** the user clicks the AIAH trigger (`aiah-fab`)
**Then** the panel opens with a fixed greeting message already in the transcript and four suggestion prompts.

**REQ-ANCRD-089**
**Given** the AIAH composer
**When** the prompt is empty/whitespace or a stream is already running
**Then** `ask()` returns early.

**REQ-ANCRD-090**
**Given** a prompt is submitted
**When** `POST /api/aiah/ask` is called
**Then** the request carries the bearer token read directly from localStorage, and the response is consumed as a **plain-text `ReadableStream`** — accumulated chunks progressively replace the content of the last assistant message.

**REQ-ANCRD-091**
**Given** the AIAH request reaches the server
**When** the system prompt is assembled
**Then** the server loads **all users (up to 500)** and injects the **first 60** into the prompt as a directory line containing each creator's name, role, institution, disciplines and location, together with the calling user's own profile.

**REQ-ANCRD-092**
**Given** the model stream raises
**When** the generator catches the exception
**Then** it **yields the error text inline into the response body** as `[AIAH is temporarily unavailable: <first 120 chars>]` — the HTTP status remains 200 and the client renders the message as assistant content.

**REQ-ANCRD-093**
**Given** the frontend fetch itself fails
**When** the `catch` block runs
**Then** the last assistant message is replaced with `"AIAH is temporarily unavailable."` and `streaming` is cleared in `finally`.

**REQ-ANCRD-094**
**Given** an AIAH conversation
**When** the panel is closed and reopened, or the page reloads
**Then** the transcript resets to the initial greeting — **no conversation is persisted server-side and no history endpoint exists.** The `LlmChat` session id is `aiah-{user_id}`, so per-user continuity depends entirely on the provider's own session handling.

**REQ-ANCRD-095**
**Given** `EMERGENT_LLM_KEY` is unset
**When** an AIAH request is made
**Then** the key defaults to an empty string and the failure surfaces only through the inline error path in REQ-ANCRD-092 — **there is no configuration pre-check**.

### 1.14 Seeding & platform

**REQ-ANCRD-096**
**Given** the application starts
**When** the `startup` event fires
**Then** `run_seed(db)` executes **only if `users` is empty**, making startup seeding idempotent.

**REQ-ANCRD-097**
**Given** the endpoint `POST /api/seed`
**When** it is called
**Then** it runs `run_seed(db)` and returns the result — **it has no `Depends(current_user)` and is therefore completely unauthenticated.** It is the only write endpoint in the application without auth.

**REQ-ANCRD-098**
**Given** any response containing user documents
**When** it is serialised
**Then** `_id` and `password` are projected out at every query site.

**REQ-ANCRD-099**
**Given** a browser on another origin
**When** it calls the API
**Then** CORS allows credentials, all methods and all headers, with origins from `CORS_ORIGINS` (default `*`).

**REQ-ANCRD-100**
**Given** the backend boots
**When** environment is read
**Then** `MONGO_URL`, `DB_NAME` and `JWT_SECRET` are required (`os.environ[...]` raises `KeyError` at import if absent) while `EMERGENT_LLM_KEY` is optional, defaulting to `""`.

---

## 2. TEST COVERAGE

**Test assets found**
- `backend/pytest.ini` — pytest-xdist configuration only (`-n 2 --dist loadscope`). **No test files exist for it to run.**
- `tests/__init__.py` — empty package marker.
- `test_result.md` — 102 lines, **entirely the boilerplate protocol header. The data section is empty: no task entries, no status history, no recorded run.**
- **No backend test file exists.** `find . -name "*.py"` outside `node_modules` returns only `seed_data.py`, `server.py` and the empty `tests/__init__.py`.
- **No frontend tests exist** — no `*.test.*`, `*.spec.*` or `__tests__`.

**Contradiction to record:** `memory/PRD.md` states under "Testing (2026-02-09)" that **"Backend: 100% pass (17/17 endpoints incl. AIAH streaming)"** and **"Frontend: 100% pass (all 12 critical flows)"**. **No artefact in the repository supports either claim** — no test file, no runner output, no populated `test_result.md`. This claim should not be relied on.

| Requirement | Covered | Evidence / gap |
|---|---|---|
| REQ-ANCRD-001 … REQ-ANCRD-100 | **No** (all 100) | No executable test of any kind exists in this application. |

**Summary:** 100 requirements. **0 Yes**, **0 Partial**, **100 No**. This is the only app so far with a fully-functioning write path and zero automated verification of it — including the two authorisation defects at REQ-ANCRD-057 and REQ-ANCRD-097.

---

## 3. SPEC GAP ANALYSIS

**Specs compared:** `ANCRD_Product_Specification_v1.0 (1) (1).pdf` (10 pp., canonical, "Module 9 of 10"), `ANCRD_Master_Flow.pdf` (3 pp., ecosystem SSO blueprint), `memory/PRD.md`, `memory/TECH_SCOPE.md`.

### (a) Specified but NOT implemented in code

| # | Spec source | Requirement | Code state |
|---|---|---|---|
| G1 | Product Spec §11; Master Flow (entire document) | **"ANCRD™ uses ANCRID™ exclusively. No independent login. All permissions are inherited from ANCRID™."** The Master Flow devotes three pages to this being non-negotiable across the ecosystem. | ANCRD implements **its own complete independent login**: a `users` collection with bcrypt password hashes, `POST /api/auth/login`, and a locally-minted 30-day HS256 JWT. This is precisely the architecture both documents forbid. `memory/PRD.md` acknowledges it under P1 as "currently mocked as local JWT". |
| G2 | Master Flow p.2 "Single Sign-On Logic" | Open any module → **no login**; session and permissions exchanged through ANCRID | Every "module" link resolves to a static in-app placeholder page (REQ-ANCRD-022). There is no cross-module navigation, no token handoff and no session exchange. |
| G3 | Product Spec §13 Engineering Notes | **"Reputation™ should be calculated from verified ecosystem activity rather than manual user input."** | `ReputationBadge` renders 10 badge kinds from a static in-file map, driven by whatever strings the seed placed on the user document. **There is no reputation engine, no calculation, no verification source and no endpoint that awards or revokes a badge.** |
| G4 | Product Spec §06 Primary Navigation (14 items) | Home, Discover, Network, Messages, Communities, Marketplace, Events, **Jobs**, **Mentors**, Creator Feed, Creator Profile, Notifications, **Analytics**, **Settings** | **Jobs**, **Mentors**, **Analytics** and **Settings** have no route, no page and no endpoint. (`/opportunities` partially covers Jobs but is separately named.) |
| G5 | Product Spec §07 "Analytics" | Profile Views, Connection Growth, Community Engagement, Reputation Growth, Collaboration Activity, Portfolio Reach, Opportunity Activity | **Entirely absent.** No analytics page, no endpoint, and no view/impression tracking anywhere in the data model. |
| G6 | Product Spec §08 **ANCR Signal™** — described as "the discovery intelligence of ANCRD™ and **distinguishes it from a traditional social network**" | Recommended Collaborators, Trending Opportunities, Nearby Events, Suggested Communities, Relevant Releases, Mentor Recommendations, Industry Connections, Career Insights, **Personalized Feed Ranking** | **Not implemented.** The name "The Signal" is used as the sidebar label for `/feed`, but the feed is a flat reverse-chronological list (REQ-ANCRD-025) with no ranking, personalisation or recommendation. "Suggested creators" is `users.slice(0, 5)` — the first five records returned, unranked and unfiltered. This is the single largest functional gap against the spec. |
| G7 | Product Spec §07 "Messaging" | Group Conversations, File Sharing, Read Receipts, Collaboration Requests, Notifications | Only 1:1 DMs exist (REQ-ANCRD-061). No group threads, no attachments, no receipts, no collaboration-request type, and no notification is generated on message receipt. |
| G8 | Product Spec §07 "Creator Profile" | Creator Passport™, Portfolio, Credits, Collaborations, Skills, Experience, Verified Reputation™, Published Media, Professional Timeline | The profile renders only what the seed placed on the user document. **No module supplies any of it** — there is no Passport, portfolio, credits, media or timeline data source, and no endpoint fetches from ANCRLAB, INHEIRA, ANCRMEDIA or COHEIR. |
| G9 | Product Spec §05 "Consumes" — 8 named modules | ANCRID, ANCRLAB, ANCRSYNC, COHEIR, INHEIRA, VAULTA, ANCRMEDIA, ANCRLAUNCH | **Zero outbound integrations.** The backend makes no HTTP call to any other service. Every module surface is a static placeholder. |
| G10 | Product Spec §13 | "Publishing, media, and portfolio assets should be **referenced from their owning modules rather than duplicated**" | ANCRD stores `posts` of kind `music`/`achievement` locally and treats them as releases in the institution payload (REQ-ANCRD-073) — local duplication rather than reference. |
| G11 | Product Spec §13 | "Marketplace opportunities should be **permission-aware and role-based**" | No role gating anywhere. Any authenticated user can book any listing, apply to any opportunity, use the full employer talent search and open `/admin` (REQ-ANCRD-083, 086). |
| G12 | Product Spec §04 Primary Users (12 roles) | Students, Alumni, Faculty, AiR, EiR, Industry Mentors, Employers, Recruiters, Creative Entrepreneurs, Publishers, Managers, Institution Administrators | Role is a free-text string on the user document used only for display and client-side filtering. **It grants and restricts nothing.** |
| G13 | Product Spec §01, §02 | "**private, verified, invitation-only**" network of "**verified** identities" | There is no invitation mechanism, no verification workflow and no verified flag enforcement. Conversely there is no self-registration either (REQ-ANCRD-017), so the network is closed by absence of a signup route rather than by design. |
| G14 | Product Spec §09 AIAH (8 capabilities) | Connection Recommendations, Collaboration Suggestions, **Profile Optimization**, Networking Insights, Opportunity Matching, Community Recommendations, Career Suggestions, Professional Growth Insights | AIAH is a single general-purpose chat panel prompted with a 60-user directory (REQ-ANCRD-091). None of the eight capabilities has a dedicated surface, and AIAH is not embedded in the profile, opportunity or community flows. |
| G15 | Master Flow p.3 build note | "Define the **expiry and re-auth trigger** consistently across all modules" | The local JWT is 30 days with no refresh, no revocation and no server-side logout (REQ-ANCRD-016). |
| G16 | Product Spec §07 "Events" | Writing Camps, Masterclasses, Conferences, Showcases, Competitions, Livestreams, Networking Events | Events are seeded records with a single RSVP action (REQ-ANCRD-063). No event type model, no capacity, no cancellation and no un-RSVP. |

### (b) Implemented but NOT mentioned in the spec

| # | Code feature | Spec status |
|---|---|---|
| E1 | **Employer talent search** (`/employer`) — a seven-facet candidate search with saved-candidate shortlisting and four dedicated endpoints. | Employers and Recruiters are named as *users* in §04, but **no employer-facing search, shortlist or ATS surface is specified anywhere**. This is the largest unspecified feature in the app, and it exposes every creator's profile to every authenticated account (REQ-ANCRD-083). |
| E2 | **Institution home and institution dashboard** (`/institutions/:id`, `/institutions/:id/dashboard`) — composite institutional payloads with role bucketing, leaderboards, `career_readiness` and `placement_rate`. | §05 does not list institutional analytics among what ANCRD owns, and §13 states ANCRD "should never become the source of truth for … education, finance, or career data". `placement_rate` derived from a portfolio-score threshold (REQ-ANCRD-077) is exactly such a derivation. |
| E3 | **Leaderboards** — top members by `portfolio_score` on both institution surfaces. | Directly in tension with §01: "built around **verified accomplishments rather than popularity**". A ranked scoreboard is unspecified and arguably contrary to the stated philosophy. |
| E4 | **`POST /api/seed`** — an unauthenticated endpoint that reseeds the database. | Unspecified, and a live-environment hazard (REQ-ANCRD-097). |
| E5 | **`bookings` collection** — written by marketplace booking but never read by any endpoint. | The spec describes a Creator Marketplace but no booking lifecycle. The current implementation is a write-only dead end (REQ-ANCRD-069). |
| E6 | **Reaction vocabulary** of `like, applaud, celebrate, insightful, save` as a model comment, unvalidated at runtime. | §07 does not specify a reaction model at all. |
| E7 | **Leaflet dark-tile world map** on `/discover` with creator and institution pins and collaboration polylines (per `memory/PRD.md`). | §06 lists "Discover" as a nav item; a geographic map surface is not specified. |
| E8 | **`/collaborations` as an alias of `/communities`** with `CollaborationDetailPage` serving both. | The spec treats **Communities™** and **Collaboration History** (consumed from ANCRSYNC™) as distinct concepts. Merging them into one route pair conflates a community with a collaboration record. |
| E9 | **Hard-coded demo credentials pre-filled in the login form and printed on the page.** | Not a spec concept; incompatible with §01's "private, verified, invitation-only" positioning if deployed as-is. |

---

## 4. UNCLEAR / NEEDS INPUT

**Q1 — Thread read authorisation (security).**
`GET /api/messages/{thread_id}` filters only on `thread_id` and never checks membership (REQ-ANCRD-057). Any authenticated user with a thread id can read the whole conversation. I have not changed this. Confirm it is a defect to fix rather than an intentional demo shortcut, and whether the fix should 403 or 404 on a non-member.

**Q2 — `POST /api/seed` is unauthenticated.**
It is the only unauthenticated write in the application and it reseeds the database (REQ-ANCRD-097). Should it be removed, moved behind an admin role, or gated on an environment flag?

**Q3 — Who is an employer?**
`/employer` and its four endpoints are open to every authenticated account (REQ-ANCRD-083), exposing all creator profiles with a seven-facet search. The spec names Employers and Recruiters as user types but specifies no such surface (E1). What is the intended access rule, and should candidates be able to see that they have been searched or saved?

**Q4 — `/admin` has no guard.**
The route is unlinked but directly reachable and its endpoint returns platform-wide counts to any authenticated user (REQ-ANCRD-086). Intended, or missing a role check?

**Q5 — Reputation™ source of truth.**
§13 requires reputation to be calculated from verified ecosystem activity (G3); the code renders badges from seeded strings with no engine. What are the award rules, which module is authoritative for each badge, and can a badge be revoked?

**Q6 — ANCR Signal™ scope.**
The spec's headline differentiator (G6) is absent. Is Signal in scope for this application, or is it a later ranking service? If in scope, what signals feed the ranking, given ANCRD holds no ecosystem data today?

**Q7 — Silent no-op writes.**
Comment (REQ-ANCRD-036), follow (043), community join/leave (052), RSVP (063), apply (065) and message send (060) all return success when the target id does not exist, because they omit an existence check. Should these become 404s, or is the permissive behaviour deliberate?

**Q8 — Unfollow, un-RSVP, withdraw application.**
None of the three inverse actions exists (REQ-ANCRD-042, 063, 065). Are these deliberate omissions for v1, or oversights?

**Q9 — Idempotent actions with no UI state.**
Follow, RSVP and Apply all re-issue successfully and show the same success toast whether or not the action was already taken (REQ-ANCRD-041, 066). Should the UI reflect existing state, and if so, which endpoint supplies it — the list payloads do not currently indicate the caller's own membership except on the single community detail route.

**Q10 — Feed fallback semantics.**
`GET /api/posts` falls back to returning **all** posts, including community-scoped ones, when no global post exists (REQ-ANCRD-026). Is that intended, or should an empty global feed stay empty?

**Q11 — Post kinds and media.**
The API accepts six `kind` values, `media_url` and `hashtags`, but the composer only ever sends `kind: "text"` (REQ-ANCRD-029). Which kinds should be authorable in the UI, and where do uploads go — `memory/PRD.md` lists object storage as an open P0 item.

**Q12 — Bookings have no lifecycle.**
`bookings` is written and never read (REQ-ANCRD-069). What are the intended states, who can transition them, and should the provider be notified?

**Q13 — Notifications are never generated.**
The collection is read-only and no action writes to it (REQ-ANCRD-071). Which events should produce a notification, and should generation be synchronous or event-driven?

**Q14 — Institution membership and `host_institution` by name.**
Events are joined to institutions by **name string** (REQ-ANCRD-075) and members by `institution_id`. Should events move to `institution_id`, and what should happen to a member whose `role` matches none of the hard-coded buckets (REQ-ANCRD-074)?

**Q15 — `placement_rate` proxy.**
Computed as the share of alumni with `portfolio_score >= 70` (REQ-ANCRD-077). No placement record exists. Should this figure be suppressed until ANCRLaunch supplies real outcomes, or is the proxy acceptable for demonstration — and if so, should the threshold be documented on screen?

**Q16 — ANCRID migration shape.**
`memory/PRD.md` says the local JWT is "architecturally identical shape" to the intended ANCRID token. Which claims will ANCRID actually issue, and should ANCRD retain a local `users` collection keyed by `ancrid` after migration, or hold only projections?

**Q17 — The PRD's testing claim.**
`memory/PRD.md` records 100% backend and frontend pass rates for a suite that does not exist in the repository. Was that suite deleted, was it run elsewhere, or should the claim be retracted? This affects how much of this application can be treated as verified.

**Q18 — Demo credentials in the login page.**
Email and password are pre-filled and additionally printed on screen (REQ-ANCRD-004). Should this remain for demonstration, and if so should it be conditional on a non-production environment flag?
