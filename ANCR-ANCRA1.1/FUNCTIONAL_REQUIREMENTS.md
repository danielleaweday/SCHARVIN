# ANCRA — Functional Requirements

**App folder:** `ANCR-ANCRA1.1`
**APPNAME:** `ANCRA`
**Derived from:** `backend/server.py`, `backend/seed_data.py`, `frontend/src/**`
**Stack observed:** FastAPI + Motor/MongoDB backend; React 18 + React Router v6 + SWR + Tailwind frontend
**Date of extraction:** 2026-09-03

---

## 1. FUNCTIONAL REQUIREMENTS

> Extracted from source only. Where a control exists in the UI but has no handler and issues no
> request, that is recorded as the observed behaviour rather than assumed intent. See Section 4.

### 1.1 Platform & API contract

**REQ-ANCRA-001**
**Given** the backend is running
**When** any client calls an endpoint
**Then** every route is served under the `/api` prefix via an `APIRouter(prefix="/api")`, and `GET /api/` returns `{"platform": "ANCRA v2.0", "tagline": "Creative Learning Operating System™"}`.

**REQ-ANCRA-002**
**Given** the FastAPI application starts
**When** the `startup` event fires
**Then** `seed_db()` runs over 17 collections (`students`, `faculty`, `journeys`, `experiences`, `lessons`, `assignments`, `capstones`, `songs`, `teams`, `calendar`, `messages`, `achievements`, `sessions`, `reviews`, `cohorts`, `hubs`, `portfolio_items`) and inserts seed documents **only where `count_documents({}) == 0`**, making the seed idempotent. `chat_sessions` is explicitly skipped.

**REQ-ANCRA-003**
**Given** any successful read endpoint
**When** documents are returned
**Then** the Mongo `_id` field is projected out (`{"_id": 0}`) so it never reaches the client.

**REQ-ANCRA-004**
**Given** a browser on a different origin
**When** it calls the API
**Then** CORS allows credentials, all methods and all headers, with origins read from the `CORS_ORIGINS` env var (default `*`).

**REQ-ANCRA-005**
**Given** any API endpoint in this application
**When** it is called without credentials, token or session
**Then** the request succeeds — **no authentication, authorisation or role enforcement exists on any route**. The `role` query parameter on `/api/me` and the `role` field in the AIAH payload are unauthenticated client-supplied hints only.

**REQ-ANCRA-006**
**Given** the frontend issues an HTTP request
**When** the request exceeds 25,000 ms
**Then** the axios instance aborts it (`timeout: 25000`). No global error UI is bound to this; SWR-driven pages remain in their loading state.

### 1.2 Entry, shell and navigation

**REQ-ANCRA-007**
**Given** a user navigates to `/welcome`
**When** the Landing page renders
**Then** it renders outside the application shell and exposes a single entry control (`data-testid="enter-ancra"`) linking into the application.

**REQ-ANCRA-008**
**Given** a user navigates to any route inside the `ShellLayout` element
**When** the page renders
**Then** `AppShell` wraps it with `EcosystemNav` (left), `TopBar` (top), the floating `AIAHDock`, and a `CommandPalette` whose open state is held in `AppShell`.

**REQ-ANCRA-009**
**Given** the shell is rendered
**When** the user clicks the TopBar search control (`data-testid="topbar-search"`)
**Then** `onOpenPalette()` fires and the Command Palette opens.

**REQ-ANCRA-010**
**Given** the shell is rendered
**When** the user clicks the avatar (`data-testid="topbar-avatar"`)
**Then** the router navigates to `/settings`.

**REQ-ANCRA-011**
**Given** the shell is rendered
**When** the user clicks the notification bell (`data-testid="topbar-bell"`)
**Then** no handler is bound — no navigation, no request, no state change occurs.

**REQ-ANCRA-012**
**Given** a user navigates to `/module/{name}` where `name` is not one of `ANCRLAB`, `ANCRSync`, `COHEIR`, `INHEIRA`, `ANCRID`
**When** the route resolves
**Then** the `ComingSoon` module page renders (catch-all `/module/:name`).

### 1.3 Role / persona switching

**REQ-ANCRA-013**
**Given** the application mounts
**When** `RoleProvider` initialises
**Then** the active role is read from `localStorage["ancra_role"]`, defaulting to `"student"` when absent.

**REQ-ANCRA-014**
**Given** the role changes by any means
**When** the `useEffect` in `RoleProvider` runs
**Then** the new role is written to `localStorage["ancra_role"]` and persists across reloads.

**REQ-ANCRA-015**
**Given** the TopBar role switcher (`data-testid="role-switcher"`)
**When** the user clicks `role-student` or `role-faculty`
**Then** `setRole` updates context and the active button receives the selected style.

**REQ-ANCRA-016**
**Given** the user is on `/settings`
**When** they click `settings-student` or `settings-faculty`
**Then** the same `setRole` call is made; the buttons render primary/ghost according to the current role.

**REQ-ANCRA-017**
**Given** the user navigates to `/` or `/dashboard`
**When** `RoleGate` evaluates
**Then** a `faculty` role redirects to `/faculty` (`<Navigate replace>`); any other role renders the Student Dashboard.

**REQ-ANCRA-018**
**Given** a client calls `GET /api/me?role=faculty`
**When** the handler executes
**Then** it returns `{"role": "faculty", "profile": <first faculty doc with is_active true>}`; for any other `role` value (including the default `"student"`) it returns the first `is_active` student. **No 404 is raised when no active document exists** — the profile is returned as `null` after `clean()`.

### 1.4 Command palette

**REQ-ANCRA-019**
**Given** the Command Palette is closed
**When** it is opened via the TopBar search control
**Then** the query string resets to empty and the cursor resets to index 0.

**REQ-ANCRA-020**
**Given** the palette opens
**When** its SWR hooks activate (all keyed on `open ? path : null`)
**Then** it lazily fetches seven datasets: `/student/dashboard`, `/student/journeys`, `/student/assignments`, `/student/songs`, `/student/calendar`, `/student/portfolio`, `/faculty/students`. While closed, none of these requests are issued.

**REQ-ANCRA-021**
**Given** the palette is open with results
**When** the user types in the search input
**Then** the item list is filtered client-side by the query and regrouped into the fixed group order (`ai`, `navigation`, `courses`, `lessons`, `students`, `faculty`, `songs`, `inheira`, `ancrlab`, `ancrsync`, `portfolio`, `calendar`, `assignments`, `files`, `settings`, `help`); groups with no matches are omitted, and the cursor resets to 0 on every query change.

**REQ-ANCRA-022**
**Given** the palette is open
**When** the user presses `ArrowDown` / `ArrowUp`
**Then** the cursor moves within the flattened result list, clamped to `[0, length-1]`.

**REQ-ANCRA-023**
**Given** the palette is open with a cursor position
**When** the user presses `Enter`
**Then** the item at the cursor is executed: an AI action navigates to `/companion`; an item with `action` starting `role:` switches the active role; an item with a `to` value navigates there and closes the palette.

**REQ-ANCRA-024**
**Given** the palette is open
**When** the user presses `Escape`
**Then** `onClose()` fires and the palette closes.

**REQ-ANCRA-025**
**Given** the palette result set
**When** it is assembled
**Then** it mixes live API results with **hard-coded in-file catalogues** that have no backend source: `INHEIRA_PROJECTS`, `ANCRLAB_SESSIONS`, `ANCRSYNC_COLLABS`, `FILES`, `SETTINGS`, `HELP`, `AI_ACTIONS`, `ECOSYSTEM_NAV`.

### 1.5 AIAH intelligence layer

**REQ-ANCRA-026**
**Given** any shell route
**When** the user clicks the floating dock button (`data-testid="aiah-dock"`)
**Then** the AIAH panel slides in/out by toggling `open`; `aiah-close` closes it.

**REQ-ANCRA-027**
**Given** the AIAH panel is open with no messages
**When** the empty state renders
**Then** four suggestion buttons are shown; the first is derived from the current `pathname` and `role` (faculty variants for `/faculty/curriculum`, `/faculty/approvals`, `/faculty/analytics`, `/faculty`; student variants for `/lesson`, `/song`, `/hub`; otherwise a default), and the fourth differs by role.

**REQ-ANCRA-028**
**Given** the AIAH composer
**When** the input is empty or a stream is in progress
**Then** the send button is `disabled` and rendered at 30% opacity, and `send()` returns early on a blank/whitespace message or while `streaming` is true.

**REQ-ANCRA-029**
**Given** the AIAH composer has text
**When** the user presses `Enter` or clicks send (`data-testid="aiah-send"`)
**Then** the input clears, a user message and an empty assistant message are appended, `streaming` is set true, and `POST /api/aiah/stream` is issued with `{session_id, message, role, context: {page: pathname}}`.

**REQ-ANCRA-030**
**Given** a streaming response is being read
**When** each SSE `data:` line carrying a `delta` arrives
**Then** the delta is appended to the content of the last assistant message, producing token-by-token rendering.

**REQ-ANCRA-031**
**Given** a stream is in progress
**When** the assistant message content is still empty
**Then** a spinner with the label `thinking` is displayed in place of the message body.

**REQ-ANCRA-032**
**Given** the fetch or stream read throws
**When** the `catch` block executes
**Then** the last assistant message is replaced with the literal string `"AIAH is offline. Try again in a moment."` and `streaming` is cleared in `finally`.

**REQ-ANCRA-033**
**Given** `POST /api/aiah/stream` is called
**When** `EMERGENT_LLM_KEY` is not set in the environment
**Then** the server raises `HTTPException(500, "AIAH not configured")` before any streaming begins.

**REQ-ANCRA-034**
**Given** a valid AIAH request with a `context` object
**When** the system prompt is assembled
**Then** the context is JSON-serialised and **truncated to the first 2000 characters**, appended to `AIAH_SYSTEM` along with `Active role: {ROLE}`.

**REQ-ANCRA-035**
**Given** a valid AIAH request
**When** the handler runs
**Then** the user turn is persisted to `chat_sessions` by `$push` with `upsert=True` **before** the model is called, so the user message survives a failed generation.

**REQ-ANCRA-036**
**Given** a stream completes normally
**When** `StreamDone` is received
**Then** the concatenated assistant text is `$push`ed to the same `chat_sessions` document and a final `data: {"done": true}` event is emitted.

**REQ-ANCRA-037**
**Given** an exception is raised inside the generator
**When** it is caught
**Then** the error is logged and a `data: {"error": "<message>"}` SSE event is emitted; the response status remains 200 because headers were already sent.

**REQ-ANCRA-038**
**Given** the SSE response is constructed
**When** headers are set
**Then** `Cache-Control: no-cache`, `X-Accel-Buffering: no` and `Connection: keep-alive` are sent with media type `text/event-stream`.

**REQ-ANCRA-039**
**Given** a client calls `GET /api/aiah/history/{session_id}`
**When** no document exists for that session
**Then** the endpoint returns `{"session_id": <id>, "messages": []}` rather than a 404.

**REQ-ANCRA-040**
**Given** the AIAH dock or the `/companion` page mounts
**When** the session id is generated
**Then** it is a fresh random value held in a `useRef`/`useState` (`"aiah_" + random`, `"aiah_dedicated_" + random`) — **conversation history is not restored on reload**, and the `GET /api/aiah/history/{id}` endpoint is never called by the frontend.

**REQ-ANCRA-041**
**Given** the user navigates to `/companion`
**When** the dedicated AI Companion page renders
**Then** it provides its own message list, composer (`aiah-page-input`, `aiah-page-send`) and themed prompt starters (`aiah-theme-{id}`) that call the same `send()` streaming path.

### 1.6 Student — dashboard

**REQ-ANCRA-042**
**Given** a student opens `/` or `/dashboard`
**When** the page mounts
**Then** SWR fetches `GET /api/student/dashboard`, which returns the active student, their journey, today's calendar entries (`today: true`, limit 20), up to 30 songs, capstones, 4 active experiences, 4 upcoming sessions and 6 achievements in one aggregate response.

**REQ-ANCRA-043**
**Given** the dashboard request has not resolved
**When** `data` is undefined
**Then** a `SkeletonHero` placeholder renders instead of the dashboard.

**REQ-ANCRA-044**
**Given** the dashboard has loaded
**When** the 30 Song Progress™ tile renders
**Then** the completed count is computed client-side as `released + mastered + mixed`, and each song renders a cell whose opacity is mapped from its `status` (`released` → solid white through `locked` → 4% white), with a `title` tooltip of `"{number}. {title} — {status}"`.

**REQ-ANCRA-045**
**Given** the dashboard has loaded
**When** the user clicks an experience tile
**Then** the router navigates to `/experience/{exp.id}`.

**REQ-ANCRA-046**
**Given** an upcoming session card is rendered on the dashboard
**When** the user clicks **RSVP** or **Add to Calendar**
**Then** no handler is bound — no request is issued and no state changes.

**REQ-ANCRA-047**
**Given** the dashboard has loaded
**When** the user clicks the journey, calendar, portfolio, 30-song, all-experiences or capstone links
**Then** the router navigates to `/journey`, `/calendar`, `/portfolio`, `/thirty-song`, `/journey` and `/capstones` respectively.

**REQ-ANCRA-048**
**Given** the dashboard renders
**When** the Portfolio Score tile displays
**Then** the score bar width is `student.portfolio_score`% and the delta label is the **hard-coded literal** `"+2 this week"`, not a computed value.

### 1.7 Student — learning journey, experience, lesson

**REQ-ANCRA-049**
**Given** a student opens `/journey`
**When** the page mounts
**Then** `GET /api/student/journeys` is fetched and all experiences are rendered as tiles.

**REQ-ANCRA-050**
**Given** the journey page has loaded
**When** the user clicks a kind filter (`data-testid="filter-{kind}"`)
**Then** the tile list is filtered client-side to that `kind`; the `all` filter shows every experience. The filter set is derived from the distinct `kind` values in the response.

**REQ-ANCRA-051**
**Given** a filter yields no experiences
**When** the list renders
**Then** the message `"No experiences match this filter."` is displayed.

**REQ-ANCRA-052**
**Given** a user opens `/experience/{id}`
**When** the page mounts
**Then** `GET /api/student/experience/{id}` returns `{experience, lessons}`; if no experience matches the id the server raises **404 `"experience not found"`**.

**REQ-ANCRA-053**
**Given** the experience page has loaded and lessons exist
**When** the user clicks the start control
**Then** the router navigates to `/lesson/{lessons[0].id}`. If the lessons array is empty the click is a no-op (guarded by `lessons?.[0] &&`).

**REQ-ANCRA-054**
**Given** a user opens `/lesson/{id}`
**When** the page mounts
**Then** `GET /api/student/lesson/{id}` returns the lesson document; a missing id raises **404 `"lesson not found"`**. Until the response resolves the literal `"Loading lesson…"` is displayed.

**REQ-ANCRA-055**
**Given** the lesson player is not playing
**When** the user clicks the play overlay (`data-testid="lesson-play"`)
**Then** `playing` becomes true, the poster image scales and the transport bar appears. Clicking pause sets `playing` false. **This is local component state only — no media element is mounted and no playback position is persisted.**

**REQ-ANCRA-056**
**Given** the lesson has chapters
**When** the user clicks a chapter row (`data-testid="chapter-{i}"`)
**Then** `currentChapter` is set to that index, the row is highlighted, and the transport progress bar width is computed as `(currentChapter + 1) * 18`% — a display heuristic unrelated to real media duration.

**REQ-ANCRA-057**
**Given** the lesson response has no `chapters` array or an empty one
**When** the chapters panel renders
**Then** `"No chapter data yet."` is displayed.

**REQ-ANCRA-058**
**Given** the lesson toolbar renders
**When** the user clicks **Bookmark**, **Discussion** or **Share**
**Then** no handler is bound — no request is issued and no state changes.

**REQ-ANCRA-059**
**Given** the lesson page renders
**When** the user clicks **Open in ANCRLAB™**
**Then** the router navigates in-app to `/hub/ANCRLAB`.

**REQ-ANCRA-060**
**Given** the lesson document contains `next_actions`
**When** the section renders
**Then** each action renders a link to `/hub/{a.module}` labelled with `a.label`; the section is omitted entirely when `next_actions` is absent.

**REQ-ANCRA-061**
**Given** the lesson document has no `summary`
**When** the "The Idea" section renders
**Then** a hard-coded fallback paragraph is displayed in its place.

### 1.8 Student — list and record views

**REQ-ANCRA-062**
**Given** a student opens `/assignments`, `/capstones`, `/thirty-song`, `/portfolio`, `/teams`, `/calendar` or `/achievements`
**When** each page mounts
**Then** it fetches its corresponding endpoint (`/api/student/assignments`, `/capstones`, `/songs`, `/portfolio`, `/teams`, `/calendar`, `/achievements`) and renders the returned collection. Each returns **all** documents in the collection up to a 500-document cap — none are scoped to the active student.

**REQ-ANCRA-063**
**Given** a student opens `/messages`
**When** the page mounts
**Then** `GET /api/student/messages` is fetched and thread `0` is selected by default.

**REQ-ANCRA-064**
**Given** the messages page has loaded
**When** the user clicks a thread in the list
**Then** `active` is set to that index and the conversation pane re-renders.

**REQ-ANCRA-065**
**Given** the messages composer contains text
**When** the user clicks **Send**
**Then** no handler is bound — the textarea is uncontrolled, no request is issued and no message is appended.

**REQ-ANCRA-066**
**Given** a student opens `/peer-reviews`
**When** the page mounts
**Then** the `received` tab is active; clicking `peer-tab-{received|to-review|given}` switches the rendered list.

**REQ-ANCRA-067**
**Given** the peer-review list renders
**When** the user clicks **Listen**, **Reply**, thumbs-up, thumbs-down or **Review** (`open-review-{id}`)
**Then** no handler is bound — no request is issued and no state changes.

**REQ-ANCRA-068**
**Given** a student opens `/portfolio-builder`
**When** the page mounts
**Then** the selection is initialised to the hard-coded array `["a1","a3","a4","a2"]`; clicking a work toggles its membership in that local selection.

**REQ-ANCRA-069**
**Given** the portfolio builder has a selection
**When** the user clicks **Save & Sign**, **Preview** or **Insert 'Every Small Rebellion'**
**Then** no handler is bound — the selection is never persisted.

**REQ-ANCRA-070**
**Given** a student opens `/passport`, `/graduation`, `/progress` or `/projects`
**When** each page renders
**Then** it renders as a static presentation surface: no `useState`, no `useEffect`, no `onClick` handler and no API request in any of these four files.

### 1.9 Faculty — command centre and analytics

**REQ-ANCRA-071**
**Given** a faculty user opens `/faculty`
**When** the page mounts
**Then** `GET /api/faculty/dashboard` returns the active faculty record, up to 40 students, all cohorts, up to 20 reviews with `status: "pending"`, up to 8 upcoming sessions, up to 10 reviews with `needs_approval: true`, and a `stats` object.

**REQ-ANCRA-072**
**Given** the faculty dashboard `stats` object is built
**When** it is returned
**Then** `total_students`, `active_reviews` and `cohorts` are computed from the query results, while `avg_portfolio_score` (87), `graduation_ready` (12) and `at_risk` (3) are **hard-coded server-side literals**.

**REQ-ANCRA-073**
**Given** a faculty user opens `/faculty/students`, `/faculty/reviews` or `/faculty/cohorts`
**When** each page mounts
**Then** it fetches `/api/faculty/students`, `/api/faculty/reviews` or `/api/faculty/cohorts` respectively and renders the full collection.

**REQ-ANCRA-074**
**Given** a faculty user opens `/faculty/analytics`
**When** the page mounts
**Then** `GET /api/faculty/analytics` returns a **fully hard-coded payload**: an 8-point weekly engagement series, a 5-point monthly portfolio series, and the scalars `industry_participation: 74`, `capstone_readiness: 68`, `graduation_readiness: 81`. No values are derived from stored data.

**REQ-ANCRA-075**
**Given** a faculty user opens `/faculty/curriculum`
**When** the page mounts
**Then** `GET /api/faculty/curriculum` returns `{experiences, modules: []}` — the `modules` array is always empty. The canvas state is initialised from an in-file `INITIAL_CANVAS` constant, not from the response.

**REQ-ANCRA-076**
**Given** the curriculum builder canvas
**When** the user drags a block
**Then** `dragging`/`canvas` local state updates; the **Add block** control has no handler and the arrangement is never persisted.

**REQ-ANCRA-077**
**Given** a faculty user opens `/faculty/approvals`
**When** the page renders
**Then** it renders as a static surface — no `useState`, no `onClick` and no API request in the file.

### 1.10 Faculty — authoring tools

**REQ-ANCRA-078**
**Given** a faculty user opens `/faculty/lesson-builder`
**When** the page renders
**Then** the title, subtitle and chapter fields are **uncontrolled inputs with `defaultValue`** seeded from in-file constants; edits live only in the DOM.

**REQ-ANCRA-079**
**Given** the lesson builder has edits
**When** the user clicks **Publish to Studio Experience™**, **Upload**, **Add** (chapter), a content block (`add-block-*`) or **Run AIAH assist**
**Then** no handler is bound to any of these controls — nothing is saved, uploaded, added or sent to AIAH.

**REQ-ANCRA-080**
**Given** a faculty user opens `/faculty/assignment-builder`
**When** they click an assignment kind
**Then** `kind` local state updates and the selected chip is highlighted. The title/brief fields are uncontrolled `defaultValue` inputs.

**REQ-ANCRA-081**
**Given** the assignment builder
**When** the user clicks **Assign to cohort** or **Open in Rubrics**
**Then** no handler is bound — no assignment is created and no navigation occurs.

**REQ-ANCRA-082**
**Given** a faculty user opens `/faculty/ai-course-builder`
**When** they edit the brief (`data-testid="course-brief"`) and click **Compose draft** (`data-testid="course-generate"`)
**Then** `generate()` sets `running` true and, after a **hard-coded 1400 ms `setTimeout`**, sets `running` false and `generated` true. The rendered week-by-week plan is a static in-file constant. **No AIAH or LLM request is made and the prompt text is never sent anywhere.**

**REQ-ANCRA-083**
**Given** the AI course builder output
**When** the user clicks **Send to Builder**
**Then** no handler is bound.

**REQ-ANCRA-084**
**Given** a faculty user opens `/faculty/rubrics`
**When** they click a rubric in the list
**Then** `active` local state changes and that rubric's criteria render. Criterion name, weight and description are uncontrolled `defaultValue` fields.

**REQ-ANCRA-085**
**Given** the rubrics editor
**When** the user clicks **New Rubric**, **Add criterion** or **Insert**
**Then** no handler is bound — no rubric or criterion is created and no edit is persisted.

**REQ-ANCRA-086**
**Given** a faculty user opens `/faculty/grading`
**When** they click a submission in the queue
**Then** `active` local state changes and that submission's detail renders. The submission list is an in-file `SUBMISSIONS` constant, not an API response.

**REQ-ANCRA-087**
**Given** the grading feedback textarea (uncontrolled, `defaultValue` pre-filled)
**When** the user clicks **Sign & Return** or **Use as starting point**
**Then** no handler is bound — no grade, feedback or signature is recorded.

**REQ-ANCRA-088**
**Given** a faculty user opens `/faculty/experience-builder` or `/faculty/teams`
**When** each page renders
**Then** it renders as a static surface — no `useState`, no `onClick` and no API request in either file.

### 1.11 Ecosystem hubs and launcher

**REQ-ANCRA-089**
**Given** a user opens `/hub/{module}`
**When** the page mounts
**Then** `GET /api/ecosystem/{module}` is fetched; the server lower-cases the path parameter and matches on `hubs.module`. An unmatched module raises **404 `"hub {module} not found"`**.

**REQ-ANCRA-090**
**Given** a hub has loaded
**When** the user clicks the continue control (`hub-continue-{module}`), the launch control (`hub-launch-{module}`) or the footer CTA (`hub-launch-cta-{module}`)
**Then** `openModule(hub.cta_module)` is called, which opens the module's route in a **new browser tab** via `window.open(route, "_blank", "noopener,noreferrer")`.

**REQ-ANCRA-091**
**Given** a hub renders its AIAH insight card
**When** the user clicks **Act on this** or **Dismiss**
**Then** no handler is bound — no request is issued and the card is not dismissed.

**REQ-ANCRA-092**
**Given** any page rendering `EcosystemLauncher`
**When** the grid renders
**Then** all 10 modules from `MODULE_ORDER` are shown with their brand colour swatch; the module matching the `current` prop renders as a non-clickable `div` labelled `you are here`, and every other module renders as a `button` labelled `open` or `coming soon` according to its `real` flag.

**REQ-ANCRA-093**
**Given** the launcher grid
**When** the user clicks a module that is not `current`
**Then** `openModule(name)` opens that module's route in a new tab — **including for modules whose `real` flag is `false`** (`Vaulta`, `ANCRLaunch`, `ANCRVIEW`, `ANCRWAV`), which resolve to the `ComingSoon` page. The `coming soon` label does not disable the control.

**REQ-ANCRA-094**
**Given** a user opens `/hub/COHEIR`
**When** the route resolves
**Then** the dedicated `COHEIRSuite` renders instead of the generic hub (its route is declared before `/hub/:module`), defaulting to the `sessions` tab.

**REQ-ANCRA-095**
**Given** the COHEIR suite is open
**When** the user clicks a tab (`coheir-tab-{id}`)
**Then** `tab` local state changes and the corresponding panel renders.

**REQ-ANCRA-096**
**Given** the COHEIR suite office-hours panel
**When** the user clicks a time slot (`slot-*`), **RSVP**, or the ANCRVIEW recording link
**Then** no handler is bound — no booking or RSVP is recorded.

**REQ-ANCRA-097**
**Given** a client calls `GET /api/ecosystem`
**When** the handler runs
**Then** all hub documents are returned as `{"hubs": [...]}`. This endpoint is not called by any frontend file.

---

## 2. TEST COVERAGE

**Test assets found**
- `backend/tests/backend_test.py` — pytest + `requests` integration suite against a live server (35 test cases including parametrised expansions).
- `tests/__init__.py` — empty package marker, no tests.
- `test_result.md` — **contains only the boilerplate testing-protocol header. The data section below the `END - Testing Protocol` marker is empty: no task entries, no status history, no agent communication, no recorded run.**
- **No frontend tests of any kind** — no `*.test.*`, `*.spec.*` or `__tests__` directory exists outside `node_modules`.
- No `auth_testing.md` in this app.

| Requirement | Covered | Evidence / gap |
|---|---|---|
| REQ-ANCRA-001 | **Yes** | `test_root` asserts status 200, `platform`, `tagline` |
| REQ-ANCRA-002 | **No** | Seed idempotency never asserted; no test re-runs startup |
| REQ-ANCRA-003 | **Partial** | `_id` absence never asserted directly, but JSON decoding of every response would fail on a raw ObjectId |
| REQ-ANCRA-004 | **No** | No CORS preflight test |
| REQ-ANCRA-005 | **Partial** | Every test calls unauthenticated and passes, which demonstrates the absence of auth but does not assert it as intended behaviour |
| REQ-ANCRA-006 | **No** | No timeout test |
| REQ-ANCRA-007–012 | **No** | No frontend tests |
| REQ-ANCRA-013–017 | **No** | No frontend tests |
| REQ-ANCRA-018 | **Partial** | `/api/me` is not called by any test; only the student/faculty dashboards are exercised |
| REQ-ANCRA-019–025 | **No** | No frontend tests |
| REQ-ANCRA-026–032 | **No** | Dock UI untested |
| REQ-ANCRA-033 | **No** | Missing-key 500 path never exercised |
| REQ-ANCRA-034 | **No** | Context truncation never asserted |
| REQ-ANCRA-035 | **Yes** | `test_aiah_stream_and_history` asserts `user` role present in persisted messages |
| REQ-ANCRA-036 | **Yes** | Same test asserts `done` event received and `assistant` role persisted |
| REQ-ANCRA-037 | **Partial** | Test asserts `err is None`; the error-emission path itself is never triggered |
| REQ-ANCRA-038 | **Partial** | `content-type: text/event-stream` asserted; the three cache/proxy headers are not |
| REQ-ANCRA-039 | **Partial** | History is read for a session that exists; the empty-session default shape is never asserted |
| REQ-ANCRA-040 | **No** | Frontend session lifecycle untested |
| REQ-ANCRA-041 | **No** | No frontend tests |
| REQ-ANCRA-042 | **Yes** | `test_student_dashboard` asserts all 8 keys, non-null student, and exactly 30 songs |
| REQ-ANCRA-043–048 | **No** | All UI-side |
| REQ-ANCRA-049 | **Yes** | `test_student_journeys` asserts `experiences` is a list |
| REQ-ANCRA-050, 051 | **No** | Client-side filtering untested |
| REQ-ANCRA-052 | **Yes** | `test_student_experience` (happy path, non-empty lessons) **and** `test_student_experience_404` |
| REQ-ANCRA-053 | **No** | UI-side |
| REQ-ANCRA-054 | **Partial** | `test_student_lesson` covers the happy path; **the 404 branch for a missing lesson is not tested** (unlike the experience 404) |
| REQ-ANCRA-055–061 | **No** | All UI-side |
| REQ-ANCRA-062 | **Yes** | `test_student_songs_30` (30 songs, ≥5 distinct statuses) and parametrised `test_student_lists` over all 7 list endpoints |
| REQ-ANCRA-063–070 | **No** | All UI-side |
| REQ-ANCRA-071, 072 | **Yes** | `test_faculty_dashboard` asserts all top-level keys and all 6 `stats` keys |
| REQ-ANCRA-073 | **Yes** | `test_faculty_students` (≥6), `test_faculty_reviews`, `test_faculty_cohorts` (exactly 3) |
| REQ-ANCRA-074 | **Yes** | `test_faculty_analytics` asserts both series and all 3 scalars |
| REQ-ANCRA-075 | **Partial** | `test_faculty_curriculum` asserts `experiences` is a list; the always-empty `modules` array is not asserted |
| REQ-ANCRA-076–088 | **No** | All UI-side; none of the authoring tools have any test |
| REQ-ANCRA-089 | **Yes** | `test_ecosystem_hub` parametrised over 9 modules asserting `module` echo. **The 404 branch is not tested** |
| REQ-ANCRA-090–096 | **No** | All UI-side |
| REQ-ANCRA-097 | **No** | `GET /api/ecosystem` is never called by tests or by the frontend |

**Summary:** 97 requirements. **20 Yes**, **9 Partial**, **68 No**. All backend GET endpoints and the AIAH streaming round-trip are covered. **Zero frontend coverage**, which means every one of the ~30 non-functional controls documented above would pass unnoticed.

---

## 3. SPEC GAP ANALYSIS

**Specs compared:** `ANCRA_Product_Specification_v1.0 (1) (1).pdf` (8 pp., canonical), `ANCRA_User_Flow.pdf` (3 pp.), `memory/PRD.md`, `docs/ANCRA-Technical-Specification.md`.

> Important context: `memory/PRD.md` explicitly scopes this build as a **design/UX specification prototype** and lists persistence, authentication and media pipelines as deliberate backlog. Items in 3(a) are therefore gaps against the **canonical product spec**, not necessarily defects against the PRD's own stated scope. Both readings are recorded.

### (a) Specified but NOT implemented in code

| # | Spec source | Requirement | Code state |
|---|---|---|---|
| G1 | Product Spec §09 "Authentication"; User Flow AUTH stage | **"ANCRA™ uses ANCRID™ exclusively. No independent login. All permissions are inherited from ANCRID™."** | **No authentication of any kind.** No ANCRID client, no token verification, no login route, no permission checks. The persona is selected by an unauthenticated `role` query param and a `localStorage` value. |
| G2 | User Flow p.3 build note | "Confirm role-based permissioning is enforced **at the dashboard layer**, not just at sign-in" | No enforcement at any layer. `/api/faculty/*` is callable by anyone; `RoleGate` is a client-side redirect only. |
| G3 | Product Spec §04 "Primary Users" (8 roles) | Students, Faculty, Artists in Residence, Executives in Residence, Adjunct Faculty, Academic Advisors, Institution Administrators, COHEIR Industry Mentors | Only **2** roles exist (`student`, `faculty`). The User Flow's third branch, **Administrator**, has no route, no persona and no view. AiR/EiR/Adjunct appear only as display copy inside the COHEIR suite. |
| G4 | Product Spec §05 "Primary Navigation" | 14 named items | **Certificates**, **Community** and **Notifications** have no route, page or endpoint. The bell icon is decorative (REQ-ANCRA-011). |
| G5 | Product Spec §06 "Home Dashboard" | 15 named elements | Not present: **Learning Streak**, **Upcoming Deadlines**, **Recent Feedback**, **Certificates**, **Today's Collaborations**, **Upcoming Writing Camps**, **Office Hours**, **Recommended Mentors**, **Career Readiness™**. Implemented: semester, schedule, continue-learning, current projects, achievements, AIAH. |
| G6 | Product Spec §06 "Course Catalog" | Search + filters on institution, instructor, credits, discipline, difficulty, format | Only a single client-side **`kind`** filter exists on `/journey`. No search, no other facet, and no `/courses` route at all. |
| G7 | Product Spec §06 "Lesson Experience" | Video, Audio, Slides, Interactive Content, Downloads, **Notes**, **Bookmarks**, **Transcript**, Resources, **Discussions**, Assignments, Embedded AIAH | No media element is mounted (poster image only, REQ-ANCRA-055). **Notes, Transcript and Downloads are entirely absent.** Bookmark, Discussion and Share render as inert controls (REQ-ANCRA-058). |
| G8 | Product Spec §06 "Faculty Command Center" | Attendance, Announcements, Office Hours, **Student Risk Alerts**, **AI Student Risk Prediction**, **Course Health Analytics**, **Creative Progress Reports**, **Intervention Recommendations** | None implemented. `at_risk: 3` is a hard-coded integer in the dashboard stats (REQ-ANCRA-072) with no underlying risk model, alert or recommendation. |
| G9 | Product Spec §06 "Creative Projects" | Creation of 16 listed artefact types (songs, albums, videos, podcasts, films, performances, business plans, brand kits, campaigns, pitch decks, …) | **No creation capability exists anywhere in the application.** `/projects` is a static page (REQ-ANCRA-070) and the backend has no POST/PUT/PATCH/DELETE route other than the AIAH stream. |
| G10 | Product Spec §06; User Flow OUTPUT stage | "Completed work **automatically becomes** part of the creator's professional portfolio — no manual upload step" | No trigger, no completion event, no portfolio write path. `/api/student/portfolio` is a read of pre-seeded documents. |
| G11 | Product Spec §07 "AIAH Integration" | 13 capabilities incl. **Assignment Feedback**, **Rubric Assistance**, **Personalized Study Plans**, **Creative Skill Gap Analysis**, **Practice Exercises** | AIAH is a single general-purpose streaming chat. The in-page "AI helpers" claimed by `memory/PRD.md` on Lesson Builder, Rubrics, Grading, Portfolio Builder and Curriculum Builder are **inert buttons with no handler**; the AI Course Builder is a `setTimeout` simulation (REQ-ANCRA-082). |
| G12 | Product Spec §08 "Module Integrations" | Named integrations with ANCRID, ANCRLAB, ANCRSYNC, COHEIR, INHEIRA, VAULTA, PASSPORT, ANCRWAV, ANCRVIEW, ANCRD, ANCRLAUNCH | No integration exists. Every hub reads a locally seeded `hubs` document; every launch is a `window.open` to a route **inside this same application** (REQ-ANCRA-090). No outbound HTTP call is made to any module. |
| G13 | Product Spec §08 | **ANCRD™** (professional networking) is a named integration | Absent from `lib/modules.js` entirely — the 10-module launcher lists ANCRVIEW and ANCRWAV instead. |
| G14 | Product Spec §11 "Engineering Notes" | "Portfolio artifacts should be **referenced** from their owning modules rather than duplicated" | ANCRA holds its own `songs`, `portfolio_items`, `capstones` and `teams` collections locally, which is duplication rather than reference. |
| G15 | User Flow p.1 | Entry begins at **CCDP website / institutional access point** | No CCDP entry, referral or institutional access-point handling. `/welcome` is a self-contained landing page. |
| G16 | User Flow p.2 | Six ecosystem modules named, including **ANCRMEDIA™** | `lib/modules.js` has no ANCRMEDIA entry; it exposes ANCRVIEW and ANCRWAV as separate modules instead. |
| G17 | User Flow p.3 | "Portfolio state feeds **career-readiness and certification status**", handed off to ANCRLAUNCH | `graduation_readiness` is a static seeded field on the student document; `/graduation` is a static page; there is no certification model and no ANCRLaunch handoff. |
| G18 | Product Spec §10 "Design Language" | "Electric blue, violet, magenta, and **amber** accents" | The implemented ANCRA accent is `#E23A25` (red). The specified palette appears only as per-module swatch colours in `lib/modules.js`. **Low severity — flagged for confirmation, not correction.** |

### (b) Implemented but NOT mentioned in the spec

| # | Code feature | Spec status |
|---|---|---|
| E1 | **30 Song Progress™** — a 30-song status tracker with a 7-state lifecycle (`locked → writing → demo → recorded → mixed → mastered → released`), its own route, dashboard tile and heat grid, and an assertion in the test suite that exactly 30 songs exist. | Appears **nowhere** in the Product Specification or the User Flow. It is described in `memory/PRD.md` as "the signature CCDP capstone tracker". A signature feature of this size absent from the canonical spec is the single largest documentation gap. |
| E2 | **Universal Command Palette** with 16 result groups, keyboard navigation, and cross-module search over 7 live endpoints plus 8 hard-coded catalogues. | Not in §05 Primary Navigation or anywhere else in the spec. |
| E3 | **Ecosystem Launcher** chip strip and the 10-module `MODULES` registry with per-module brand colours and `real` flags. | The spec names module *integrations* but never specifies a launcher surface, a module registry or "coming soon" states. |
| E4 | **Dedicated AIAH page** at `/companion` with themed prompt starters and an ecosystem context panel, in addition to the global dock. | §07 describes AIAH as embedded throughout; a standalone destination page is not specified. |
| E5 | **`/hub/{module}` generic hub pages** — a full ANCRA-hosted landing surface per external module (hero, metrics, activity, related lessons, AIAH insight). | Not specified. The User Flow describes a direct "Launch Connected Modules" gateway, not an intermediate hosted hub. |
| E6 | **COHEIR Suite** (`/hub/COHEIR`) — a distinct tabbed workspace (live sessions, office-hours booking, mentor reviews, recommendations, critiques, residents) hosted inside ANCRA. | §08 assigns mentorship to COHEIR™ as a separate module. Building a COHEIR workspace inside ANCRA contradicts §11 ("ANCRA™ owns educational workflows only"). |
| E7 | **Peer Reviews** with received / to-review / given tabs. | Not named in §05 or §06. |
| E8 | **Portfolio Builder** (curated selection + "Save & Sign" composer). | §06 describes automatic portfolio population, not a manual curation surface — the two models are in tension. |
| E9 | **AI Course Builder**, **Studio Experience Builder**, **Curriculum Builder**, **Lesson Builder**, **Assignment Builder**, **Rubrics library** as six distinct faculty authoring destinations. | §06 lists "Rubrics" as one item within the Faculty Command Center. The other five authoring tools are unspecified. |
| E10 | **Creator Passport** page at `/passport` inside ANCRA. | §08 assigns identity and professional profile to ANCRID™. |
| E11 | **`GET /api/ecosystem`** (all hubs) endpoint. | Unspecified, and additionally dead code — not called by the frontend or the tests. |
| E12 | **`GET /api/me`** persona endpoint. | Unspecified, and additionally dead code — not called by any frontend file. |
| E13 | **Seeded demo personas** — Maya Ellis (student) and Prof. Terrence Bloom (faculty) as the only accounts, hard-wired via `is_active: true`. | Not a spec concept; the spec assumes ANCRID-issued accounts. |

---

## 4. UNCLEAR / NEEDS INPUT

Behaviour that cannot be determined from the code. **No behaviour has been invented to fill these.**

**Q1 — Inert controls: intended state or unfinished work?**
Roughly 30 controls render as fully-styled, enabled buttons with no handler (REQ-ANCRA-011, 046, 058, 065, 067, 069, 079, 081, 083, 085, 087, 091, 096). `memory/PRD.md` places persistence in the backlog, which explains *why* they do nothing — but not what they should do **now**. For the demo build, should these be (a) left as-is, (b) visibly disabled, (c) given a "coming soon" toast, or (d) hidden? The code expresses no preference and this materially affects how the prototype reads to an evaluator.

**Q2 — Which persistence surfaces are v1?**
The spec requires creation of 16 artefact types (G9) and the PRD defers all persistence. Both cannot be satisfied. Which of these, if any, must persist in the next build: assignment submission, grading + signature, rubric authoring, lesson authoring, portfolio curation, message send, RSVP/office-hours booking? The code contains no write path for any of them, so I cannot infer priority.

**Q3 — Data scoping model.**
`/api/student/assignments`, `/capstones`, `/songs`, `/portfolio`, `/teams`, `/messages`, `/calendar` and `/achievements` return **entire collections** with no student filter (REQ-ANCRA-062), while `/api/student/dashboard` *does* filter by `student_id`. Is the unscoped behaviour a deliberate single-seat demo simplification, or a defect that would leak other students' records once more than one student exists?

**Q4 — Lesson 404 asymmetry.**
`GET /api/student/experience/{id}` has an explicit 404 test; `GET /api/student/lesson/{id}` raises 404 in code but has no test. Was the missing test an oversight, or is the lesson route expected to behave differently (e.g. redirect to the parent experience)?

**Q5 — Media playback contract.**
`LessonPlayer` mounts no `<video>`/`<audio>` element; `playing` is local boolean state and the progress bar is `(chapter+1) * 18`% (REQ-ANCRA-055, 056). The spec requires video, audio, slides, transcript and downloads (G7). What is the intended media source and player — an embedded provider, ANCRVIEW, direct object storage? And should playback position persist per student?

**Q6 — "Automatically added to Portfolio" trigger.**
The User Flow itself raises this as an open item and the code implements no trigger (G10). Real-time on completion, or batch sync? And what constitutes "completion" — assignment submission, faculty sign-off, or capstone phase change?

**Q7 — Module launch target.**
`openModule()` opens the module's **in-app route** in a new tab (REQ-ANCRA-090), so launching ANCRLAB from ANCRA never leaves ANCRA. Should these become real cross-origin URLs to the deployed sibling applications, and if so, how is identity carried across the tab boundary given there is no auth (G1)?

**Q8 — "Coming soon" modules are still clickable.**
Vaulta, ANCRLaunch, ANCRVIEW and ANCRWAV are labelled `coming soon` but remain clickable and open the `ComingSoon` page (REQ-ANCRA-093). Intended, or should the `real: false` flag disable the control?

**Q9 — ANCRD vs ANCRVIEW/ANCRWAV, and ANCRMEDIA.**
The Product Spec §08 names **ANCRD™**; the User Flow names **ANCRMEDIA™**; `lib/modules.js` implements neither and lists **ANCRVIEW** and **ANCRWAV** as separate modules (G13, G16). Which registry is canonical? This affects the launcher, the command palette navigation group and the hub routes.

**Q10 — The `role` parameter's security model.**
`/api/me?role=faculty` and the AIAH `role` field are unauthenticated client input (REQ-ANCRA-005, 018). Once ANCRID is integrated, should these be removed entirely in favour of token claims, or retained as an override for administrators?

**Q11 — Faculty analytics data source.**
`/api/faculty/analytics` returns an entirely hard-coded payload, and three of six dashboard `stats` values are literals (REQ-ANCRA-072, 074). Should these be computed from the seeded collections for the demo, or do they remain illustrative until real telemetry exists?

**Q12 — `test_result.md` is empty.**
The file contains only the protocol boilerplate — no task entries, no status history, no recorded runs. Should it be populated for this app, or is `backend/tests/backend_test.py` the sole intended record?

**Q13 — Administrator role.**
The User Flow branches to three roles; the code implements two (G3). Is Administrator in scope for this application, or does it live in a different product (e.g. an institution console)?

**Q14 — AIAH conversation persistence.**
The backend persists every turn to `chat_sessions` and exposes `GET /api/aiah/history/{session_id}`, but the frontend generates a fresh random session id on every mount and never calls the history endpoint (REQ-ANCRA-040). Should conversations resume across reloads, and if so, what is the session key — per user, per route, or per browser session?
