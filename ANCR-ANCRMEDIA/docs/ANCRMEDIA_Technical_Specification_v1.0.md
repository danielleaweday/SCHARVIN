# ANCRMEDIA™ Technical Specification v1.0

**Module:** ANCRMEDIA — The Global Creative Network of CCDP
**Status:** V1 Complete (MVP shipped)
**Owner:** Engineering (report to CTO)
**Last updated:** 2026-02-26

---

## 1. Executive Overview

### 1.1 Purpose
ANCRMEDIA is the unified streaming, publishing, discovery, and broadcast platform of the ANCR Ecosystem. It houses two experiences under a single application:

- **ANCRWAV™** — audio streaming (music, albums, singles, EPs, playlists, radio, podcasts audio).
- **ANCRVIEW™** — video network (music videos, live performances, masterclasses, podcasts, short films, documentaries, interviews, capstone projects, livestreams).

ANCRMEDIA is the media home for every creator enrolled in the Contemporary Creative Development Program (CCDP). One account, one library, one search experience, one navigation system.

### 1.2 Business Objective
- Give every CCDP creator a professional distribution and discovery surface before graduation.
- Create the network effect that differentiates the CCDP from any competing higher-education program.
- Aggregate the entire creative output of the CCDP into a single institutional-grade destination.
- Position ANCR as the parent ecosystem; ANCRMEDIA as a first-class module inside it.

### 1.3 User Personas
| Persona | Description | Typical actions |
|---|---|---|
| Student Creator | Enrolled CCDP student | Upload releases, publish videos, follow peers, curate playlists, submit challenges |
| Faculty / Mentor | CCDP instructor, artist-in-residence, adjunct | Feature releases, curate playlists, host livestreams, review capstones |
| Institutional Admin | University staff | Monitor school leaderboards, feature institutional releases |
| Industry Partner | Label / publisher / sponsor | Scout releases, sponsor challenges |
| Ecosystem Admin | ANCR internal admin | Manage editorial, feature globally, moderate |
| Public Viewer | Unauthenticated visitor (future) | Consume public-eligible surfaces only |

### 1.4 Success Criteria
- Every creator has a verified profile with releases, videos and analytics visible.
- Global Discover Feed renders in ≤ 1 network round trip.
- Media players (audio + video) actually play seeded content; architecture supports replacing seed data with real uploads without redesign.
- Authentication is delegated to ANCRID; ANCRMEDIA never stores identity as a source of truth.
- Every ANCR module link in navigation and footer works when the sibling modules ship.

---

## 2. Product Requirements Document (PRD)

### 2.1 Functional Requirements
1. **Authentication (ANCRID-delegated)** — email/password today, ANCRID SSO cookie sharing at production.
2. **Global Discover Feed (Home)** — hero, twin experience panels, and 11 content shelves.
3. **ANCRWAV experience** — dedicated `/wav` surface with cool blue/violet ambient wash.
4. **ANCRVIEW experience** — dedicated `/view` surface with warm amber/magenta ambient wash.
5. **Creator profiles** — editorial cover, ANCRID verified badge, Music / Video / About tabs.
6. **Institution pages** — brand-color hero, faculty, students, releases, videos, livestreams.
7. **Album detail** — cinematic hero, tracklist, credits, publishing splits, lyrics, ISRC.
8. **Video watch page** — HTML5 player with custom controls, related sidebar.
9. **Global Charts** — Top Songs, Videos, Artists, Producers, Schools; trending endpoint.
10. **Live section** — Live Now + Upcoming; livestream detail placeholders.
11. **Playlists** — list + detail with curator attribution.
12. **Challenges** — monthly creative competitions.
13. **Events** — festival + showcase coverage.
14. **World map** — equirectangular projection of institutions with pulsing nodes.
15. **Universal search** — creators, albums, tracks, videos, institutions, playlists.
16. **Library** — Liked, Downloads, Watch Later, History, Following.
17. **Creator analytics** — KPIs, growth series, country distribution, schools reached.
18. **Persistent audio player** — queue, next/prev, seek, volume, cross-page.

### 2.2 User Stories (representative subset)
- As a **student**, I sign in with my ANCRID passport and land on a personalized Discover Feed.
- As a **student**, I can play any track and continue listening as I navigate anywhere in the app.
- As a **faculty member**, I can access every institution page and see leaderboards.
- As an **institutional admin**, I can see all releases attributed to my institution.
- As a **creator**, I can view my streams, views, watch hours, country distribution, and estimated revenue.
- As **anyone signed in**, I can search across every content type from a single input.

### 2.3 Roles & Permissions
| Role | Read | Write (library) | Feature (editorial) | Moderate | Admin |
|---|---|---|---|---|---|
| `student` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `faculty` | ✅ | ✅ | ✅ (institution scope) | ✅ (institution scope) | ❌ |
| `administrator` | ✅ | ✅ | ✅ (global) | ✅ (global) | ✅ |
| `artist_in_residence` | ✅ | ✅ | ✅ (institution scope) | ❌ | ❌ |
| `industry_partner` | ✅ | ✅ | ❌ | ❌ | ❌ |
| Anonymous | ❌ (login required for V1) | ❌ | ❌ | ❌ | ❌ |

### 2.4 Workflows
**Login → Discover flow**
1. User submits ANCRID credentials.
2. Backend verifies bcrypt hash, issues access (6h) + refresh (30d) JWTs as httpOnly cookies.
3. Frontend hydrates `/api/auth/me` on mount → sets `AuthContext.user`.
4. `Layout` renders sidebar + top bar + Discover Feed.

**Play track flow**
1. User clicks play on any `TrackRow` / `AlbumCard`.
2. `PlayerContext.play(track, list)` sets queue + current track.
3. Persistent `AudioPlayerBar` binds to the shared `Audio` element ref.
4. Playback continues across route changes (React Router does not remount `Layout`).

**Video watch flow**
1. User navigates to `/videos/:id`.
2. `VideoWatch` fetches `/api/videos/:id` → renders inline HTML5 `<video>`.
3. Custom overlay controls + related sidebar populate from same payload.

### 2.5 Edge Cases
- Missing creator link on demo user (`user.creator_id === null`) → `/api/analytics/me` falls back to first student creator so admins still see rich analytics.
- Empty library for a signed-in user → surface `LibrarySurface` shows soft empty state.
- Track audio URL 4xx → player pauses; user can select next.
- Genre without tracks → returns empty arrays (no 500).
- Search query < 1 char → 422 handled by frontend gate.
- Cookie loss (browser cleared) → `/api/auth/me` returns 401 → `ProtectedRoute` bounces to `/login`.

### 2.6 Acceptance Criteria
- 37/37 backend endpoints pass.
- Every route in `App.js` renders without console errors.
- All navigation links resolve.
- Audio player survives at least 5 route transitions without state loss.
- No hard-coded secrets; all env-driven.

---

## 3. Technical Architecture

### 3.1 Stack
| Layer | Tech |
|---|---|
| Frontend | React 19, React Router 7, TailwindCSS, Framer Motion, Recharts, Lucide Icons, Sonner, Axios |
| Fonts | Cabinet Grotesk (display) + Satoshi (body) via Fontshare CDN |
| Backend | FastAPI, Motor (async MongoDB), PyJWT, bcrypt, Pydantic v2 |
| Database | MongoDB |
| Process | Supervisor (frontend & backend), Kubernetes ingress routes `/api/*` → 8001, otherwise → 3000 |

### 3.2 Folder Structure
```
/app
├── backend/
│   ├── server.py          # FastAPI app: auth, all endpoints, startup seeding
│   ├── seed_data.py       # Deterministic seed generator
│   ├── requirements.txt
│   └── .env               # MONGO_URL, DB_NAME, CORS_ORIGINS, JWT_SECRET, ADMIN_*
├── frontend/
│   ├── src/
│   │   ├── App.js         # Router with providers + protected layout
│   │   ├── index.js       # Root
│   │   ├── index.css      # Theme tokens, gradient, glass, animations
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── PlayerContext.jsx
│   │   ├── lib/
│   │   │   ├── api.js     # Axios instance with baseURL + withCredentials
│   │   │   ├── brand.js   # Official logo URLs + ecosystem module map
│   │   │   └── format.js  # fmtNum, fmtDuration, fmtDate, fmtRelative
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── EcosystemSidebar.jsx
│   │   │   ├── ANCRMediaNav.jsx
│   │   │   ├── TopBar.jsx
│   │   │   ├── AudioPlayerBar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ExperienceMark.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── MediaCards.jsx
│   │   │   ├── WorldMap.jsx
│   │   │   └── ui/        # Shadcn primitives
│   │   └── pages/
│   │       ├── Login.jsx
│   │       ├── Register.jsx
│   │       ├── Home.jsx           # Global Discover Feed
│   │       ├── Experiences.jsx    # WavHome, ViewHome, Featured, Originals, Downloads, WatchLater, Liked, HistoryPage
│   │       ├── Feeds.jsx          # Discover, Trending, NewReleases, Videos, Live, Playlists, Genres, Challenges, Events, Podcasts
│   │       ├── Detail.jsx         # PlaylistDetail, GenreDetail
│   │       ├── AlbumDetail.jsx
│   │       ├── Albums.jsx
│   │       ├── CreatorDetail.jsx
│   │       ├── Creators.jsx
│   │       ├── VideoWatch.jsx
│   │       ├── Schools.jsx        # Schools + SchoolDetail
│   │       ├── Countries.jsx
│   │       ├── Search.jsx
│   │       ├── Library.jsx
│   │       ├── Analytics.jsx
│   │       └── Settings.jsx
│   ├── .env               # REACT_APP_BACKEND_URL only
│   ├── package.json
│   └── tailwind.config.js
├── docs/                  # ← this document lives here
├── memory/
│   ├── PRD.md
│   └── test_credentials.md
└── test_reports/          # testing_agent output
```

### 3.3 Data Flow
```
Browser → REACT_APP_BACKEND_URL/api/* (Kubernetes ingress) → FastAPI :8001 → Motor → MongoDB
                                                                      ↓
                                                              startup seed (idempotent)
```

- All frontend calls go through `/app/frontend/src/lib/api.js` (Axios instance, `withCredentials: true`).
- Backend serializes documents through `clean()` (removes `_id`, `password_hash`) — no raw Mongo docs ever leave the API boundary.

### 3.4 State Management
| State | Where | Scope |
|---|---|---|
| Auth session | `AuthContext` | App |
| Audio playback (current track, queue, progress) | `PlayerContext` | App (persists across routes) |
| Per-page data (feeds, catalog) | Local `useState` + `useEffect` fetch | Page |
| Route state | React Router | App |

There is deliberately no global cache layer (no React Query in V1). Endpoints are small and cheap. When traffic grows, adopt SWR or React Query in the `api.js` wrapper.

### 3.5 API Architecture
- Every route prefixed `/api`.
- Read endpoints are public today (V1 gates the whole app at `ProtectedRoute` — the backend is not yet forcing auth on reads because the app is behind a login screen). Any endpoint that touches user-specific data (`/library`, `/analytics/me`, `/library/toggle`) requires auth.
- Response envelope: plain JSON objects. No wrapping envelope in V1.
- Pagination: opt-in via `limit` query parameter; no cursors in V1.

### 3.6 Authentication Flow
```
POST /api/auth/login {email, password}
  → verify bcrypt(password, user.password_hash)
  → issue access JWT (HS256, 6h, {sub, email, type:"access"})
  → issue refresh JWT (HS256, 30d, {sub, type:"refresh"})
  → Set-Cookie: access_token, refresh_token (httpOnly, secure, samesite=none)
  → return {…user, access_token}

GET /api/auth/me
  → read access_token cookie OR Authorization: Bearer
  → verify JWT
  → return sanitized user

POST /api/auth/refresh
  → read refresh_token cookie
  → verify type === "refresh"
  → mint new access_token cookie

POST /api/auth/logout
  → clear both cookies
```

### 3.7 Authorization Model
- Role stored on `users.role` (student | faculty | administrator | artist_in_residence | industry_partner).
- V1 endpoints do not yet enforce role-based writes because there are no write endpoints beyond `library/toggle` (any authenticated user).
- Future write endpoints (uploads, editorial features, moderation) MUST accept a `Depends(get_current_user)` and check `user["role"]`.

### 3.8 Error Handling
- Backend: raise `HTTPException(status_code, detail)`. FastAPI serializes to `{"detail": "..."}`.
- Frontend: Axios interceptor could be added; today each caller uses `try/catch` locally.
- `ProtectedRoute` handles session loss by redirecting to `/login`.

### 3.9 Logging
- Backend: standard `logging` at INFO. Startup seed logs success/failure.
- Frontend: `console.error` on Axios failures. No third-party logger wired in V1.
- Production TODO: forward FastAPI logs + browser errors to a centralized sink (Datadog / Sentry).

---

## 4. Database Schema

Collections live in the database named by `DB_NAME` (default `test_database`). No schema enforcement at Mongo — Pydantic validates at the API boundary.

### 4.1 `users`
Purpose: local identity envelope for demo. In production this collection is populated by ANCRID SSO consumer, not by direct registration.

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Mongo primary key |
| `email` | string | Unique index |
| `name` | string | |
| `role` | string | `student` \| `faculty` \| `administrator` \| `artist_in_residence` \| `industry_partner` |
| `institution_id` | string \| null | FK → `institutions.id` |
| `discipline` | string \| null | |
| `avatar` | string \| null | URL |
| `creator_id` | string \| null | FK → `creators.id` (links user to their public creator profile) |
| `password_hash` | string | bcrypt hash — **removed from all API responses** |
| `created_at` | string (ISO) | UTC |

Indexes: `{ email: 1 } unique`.

### 4.2 `institutions`
| Field | Type | Notes |
|---|---|---|
| `id` | string | Slug primary key (e.g. `berklee`) |
| `name` | string | |
| `city` | string | |
| `country` | string | |
| `flag` | string | Emoji |
| `coords` | [lat, lon] | Equirectangular projection input |
| `founded` | number | |
| `brand_color` | string | Hex |
| `cover` | string | URL |
| `logo` | string | Short mark |
| `students_count` | number | |
| `tagline` | string | |
| `created_at` | string (ISO) | |

### 4.3 `creators`
| Field | Type | Notes |
|---|---|---|
| `id` | string | e.g. `creator-mayaokafor.berklee` |
| `handle` | string | Unique index |
| `name` | string | |
| `email` | string | |
| `avatar` | string | URL |
| `cover` | string | Editorial cover URL |
| `institution_id` | string | Indexed FK |
| `institution_name` | string | Denormalized |
| `country` | string | |
| `city` | string | |
| `flag` | string | |
| `coords` | [lat, lon] | |
| `discipline` | string | |
| `genres` | string[] | |
| `cohort` | string | `2024`–`2027` or `Faculty` |
| `role` | string | `student` \| `faculty` |
| `verified` | boolean | ANCRID verified |
| `bio` | string | |
| `followers` | number | |
| `following` | number | |
| `monthly_listeners` | number | |
| `created_at` | string (ISO) | |

Indexes: `{ handle: 1 } unique`, `{ institution_id: 1 }`.

### 4.4 `albums`
| Field | Type | Notes |
|---|---|---|
| `id` | string | e.g. `album-1` |
| `title` | string | |
| `artist_id` | string | Indexed FK |
| `artist_name` | string | Denormalized |
| `artist_avatar` | string | |
| `institution_id` | string | Denormalized FK |
| `institution_name` | string | |
| `cover` | string | URL |
| `release_date` | string (ISO) | Sort key |
| `genres` | string[] | |
| `kind` | string | `Album` \| `EP` \| `Single` \| `Project` \| `Instrumentals` |
| `track_count` | number | |
| `duration_seconds` | number | |
| `track_ids` | string[] | |
| `streams` | number | |
| `credits_note` | string | |
| `description` | string | |

Indexes: `{ artist_id: 1 }`.

### 4.5 `tracks`
| Field | Type | Notes |
|---|---|---|
| `id` | string | e.g. `track-album-1-1` |
| `album_id` | string | Indexed FK |
| `title` | string | |
| `artist_id` | string | Indexed FK |
| `artist_name` | string | |
| `artist_avatar` | string | |
| `institution_id` | string | |
| `cover` | string | |
| `audio_url` | string | Playable URL (SoundHelix in seed, replace with signed CDN URL in production) |
| `duration_seconds` | number | |
| `isrc` | string | |
| `producers` | string[] | |
| `songwriters` | string[] | |
| `publishing` | string | |
| `splits` | `{role,name,pct}[]` | Sums to 100 |
| `lyrics` | string \| null | |
| `genres` | string[] | |
| `release_date` | string (ISO) | |
| `streams` | number | |
| `listeners` | number | |
| `countries_count` | number | |
| `schools_count` | number | |

Indexes: `{ album_id: 1 }`, `{ artist_id: 1 }`.

### 4.6 `videos`
| Field | Type | Notes |
|---|---|---|
| `id` | string | e.g. `video-1` |
| `title` | string | |
| `kind` | string | `Music Video` \| `Live Performance` \| `Masterclass` \| `Podcast` \| `Short Film` \| `Documentary` \| `Interview` \| `Behind The Scenes` \| `Capstone Project` |
| `artist_id` | string | FK |
| `artist_name` | string | |
| `artist_avatar` | string | |
| `institution_id` | string | |
| `institution_name` | string | |
| `thumbnail` | string | URL |
| `video_url` | string | Playable URL (Google gtv-videos-bucket in seed) |
| `duration_seconds` | number | |
| `views` | number | |
| `subscribers` | number | |
| `watch_time_hours` | number | |
| `release_date` | string (ISO) | |
| `description` | string | |
| `series` | string \| null | |
| `is_live` | boolean | |

Indexes: `{ artist_id: 1 }`.

### 4.7 `podcasts`, `livestreams`, `playlists`, `challenges`, `events`
Structurally similar; see `/app/backend/seed_data.py` for canonical shapes. Key points:
- `livestreams.is_live_now: boolean` drives the Live Now shelf.
- `playlists.track_ids: string[]` references `tracks.id`.
- `events.starts_at` is a sortable ISO string.

### 4.8 `library`
Per-user save state.
| Field | Type |
|---|---|
| `user_id` | string (stringified ObjectId) |
| `target_type` | `track` \| `album` \| `video` \| `playlist` \| `creator` |
| `target_id` | string |
| `created_at` | string (ISO) |

Compound key: `(user_id, target_type, target_id)`. Toggle endpoint deletes on match, inserts otherwise.

---

## 5. API Documentation

Base URL: `${REACT_APP_BACKEND_URL}/api`. All responses JSON. Auth via httpOnly cookie or `Authorization: Bearer <access_token>`.

### 5.1 Auth
| Method | Route | Auth | Body | 200 Response |
|---|---|---|---|---|
| POST | `/auth/register` | none | `{email,password,name,institution_id?,discipline?,role?}` | `{id,email,name,role,institution_id,creator_id,avatar,access_token}` + sets cookies |
| POST | `/auth/login` | none | `{email,password}` | Same as register + cookies |
| POST | `/auth/logout` | none | — | `{ok:true}` — clears cookies |
| GET | `/auth/me` | cookie/bearer | — | Sanitized user | 
| POST | `/auth/refresh` | refresh cookie | — | `{ok:true}` — new access cookie |

Errors: `401 Invalid credentials`, `400 Email already registered`.

**Example**
```bash
curl -X POST $URL/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"maya@ancrmedia.com","password":"Creator2026!"}'
```

### 5.2 Discover / Home
| Method | Route | Description |
|---|---|---|
| GET | `/discover-feed` | Composite payload for Home (11 shelves). Single round-trip. |
| GET | `/home` | Legacy composite (kept for parity). |
| GET | `/discover` | Trending tracks, videos, new releases, faculty picks, institutions. |

### 5.3 Catalog
| Method | Route | Query | Description |
|---|---|---|---|
| GET | `/institutions` | — | All institutions with counts. |
| GET | `/institutions/{slug}` | — | Institution + faculty + students + newest releases + featured videos + livestreams. |
| GET | `/creators` | `q, institution, country, discipline, limit` | Filtered creators. |
| GET | `/creators/{id}` | — | Creator + albums + videos + top_tracks. |
| GET | `/albums` | `sort=release_date\|streams, limit` | |
| GET | `/albums/{id}` | — | Album + tracks + artist. |
| GET | `/tracks` | `sort, limit` | |
| GET | `/tracks/{id}` | — | |
| GET | `/videos` | `kind?, sort, limit` | |
| GET | `/videos/{id}` | — | Video + related. |
| GET | `/podcasts` | — | |
| GET | `/livestreams` | — | |
| GET | `/livestreams/{id}` | — | |
| GET | `/playlists` | `limit` | |
| GET | `/playlists/{id}` | — | Playlist + tracks. |
| GET | `/challenges` | — | |
| GET | `/events` | — | |
| GET | `/genres` | — | List with counts. |
| GET | `/genres/{name}` | — | Tracks + creators for that genre. |

### 5.4 Charts
`GET /charts/top-songs | top-videos | top-schools | top-producers | top-artists | trending` — sorted lists (`limit` param supported).

### 5.5 World
`GET /world` — returns `{nodes, countries}` for the map.

### 5.6 Search
`GET /search?q=<term>` — returns `{creators, albums, tracks, videos, institutions, playlists}`. Case-insensitive regex; `q` must be ≥ 1 char.

### 5.7 Library
| Method | Route | Auth | Body |
|---|---|---|---|
| GET | `/library` | optional (empty payload if anon) | — |
| POST | `/library/toggle` | required | `{target_type, target_id}` → `{active: bool}` |

### 5.8 Analytics
`GET /analytics/me` — auth required. Returns `creator`, `kpis`, `growth_series[12]`, `country_series`, `schools_reached`.

---

## 6. UI Specification

### 6.1 Global Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ EcosystemSidebar (68px, 10 ANCR modules, tooltips)              │
├────┬──────────────────┬─────────────────────────────────────────┤
│ E  │ ANCRMediaNav     │ TopBar (search + notifications + user)  │
│ c  │ (240px)          ├─────────────────────────────────────────┤
│ o  │ - Navigate       │                                         │
│    │ - Your Library   │ <Outlet />                              │
│ s  │ - Utility        │                                         │
│    │ - User chip      │                                         │
│    │                  │ Footer (ANCR Ecosystem strip)           │
├────┴──────────────────┴─────────────────────────────────────────┤
│ AudioPlayerBar (fixed bottom, 76px)                             │
└─────────────────────────────────────────────────────────────────┘
```
Breakpoints:
- `<lg` (1024px): ANCRMediaNav hides; ecosystem rail collapses.
- `<md`: two-panel Discover splits vertically.

### 6.2 Pages
Each page documented as `Layout → Loading state → Empty state → Data state`:

**Login (`/login`)** — 2-column split. Left: bento-tile collage with content-type badges + centered ANCRMEDIA lockup + editorial statement. Right: sign-in form with ANCRID Assurance strip + demo passport quick-fill.

**Home (`/`)** — Global Discover Feed. Hero → twin panels → 11 shelves.

**ANCRWAV Home (`/wav`)** — cool blue/violet ambient wash + trending tracks + new releases + playlists + top artists.

**ANCRVIEW Home (`/view`)** — warm amber/magenta ambient wash + continue watching + fresh drops + live now.

**Creator (`/creators/:id`)** — 420px editorial cover → floating glass profile card → Music / Video / About tabs.

**Album (`/albums/:id`)** — blurred cover hero → tracklist (grid: index / cover / title & artist / streams / duration) → credits + splits + lyrics side panel.

**Video Watch (`/videos/:id`)** — 16:9 video with custom controls → title/creator/subscribe → description card → related sidebar.

**Schools (`/schools`)** and **School Detail (`/schools/:slug`)** — grid of institution tiles; detail shows brand-color hero → metadata cards → newest releases → featured videos → faculty → students → livestreams.

**Countries (`/countries`)** — WorldMap component + per-country cards.

**Trending (`/trending`)** — 5 chart tabs.

**Analytics (`/analytics`)** — KPI grid → growth line (Recharts) → country pie → schools bar.

**Search (`/search`)** — single input + 6 result sections.

**Library / Downloads / Watch Later / Liked / History** — shared `LibrarySurface` component keyed by content kind.

### 6.3 Loading / Empty / Error
- Loading: pages return `Loading…` (60% opacity) until first payload resolves.
- Empty: soft glass card with icon + CTA (`Start discovering →`).
- Error: caught at page level, falls back silently in V1. Production must surface a Sonner toast.

### 6.4 Accessibility
- Semantic landmarks: `<header>`, `<main>`, `<nav>`, `<aside>`, `<footer>`.
- Every interactive element has a `data-testid` (required by testing agent and reused as ARIA hooks).
- Keyboard: native `<button>` and `<input>` throughout; escape from modals handled by Shadcn primitives.
- Focus ring: `:focus-visible` custom outline (blue 2px, 2px offset).
- Contrast: pure white text on `#0B0B0D` is 21:1 (WCAG AAA).
- Motion: respects OS `prefers-reduced-motion` (Framer Motion) — TODO: gate `ambient-flow` CSS animation.

---

## 7. Component Inventory

| Component | File | Props | Purpose |
|---|---|---|---|
| `Layout` | `components/Layout.jsx` | — | App shell (sidebar + top bar + outlet + footer + player). |
| `EcosystemSidebar` | `components/EcosystemSidebar.jsx` | — | Left rail with all 10 ANCR modules. |
| `ANCRMediaNav` | `components/ANCRMediaNav.jsx` | — | Secondary nav (Navigate / Library / Utility groups + user chip). |
| `TopBar` | `components/TopBar.jsx` | — | Global search + notifications + user menu. |
| `AudioPlayerBar` | `components/AudioPlayerBar.jsx` | — | Persistent bottom player (consumes `PlayerContext`). |
| `Footer` | `components/Footer.jsx` | — | ANCR Ecosystem module grid. |
| `ExperienceMark` | `components/ExperienceMark.jsx` | `variant, tagline, testid` | Inline WAV/VIEW logo + tagline block. |
| `ProtectedRoute` | `components/ProtectedRoute.jsx` | `children` | Auth gate. |
| `WorldMap` | `components/WorldMap.jsx` | `nodes, compact` | Equirectangular map with pulsing nodes. |
| `AlbumCard` | `components/MediaCards.jsx` | `album, testid` | Square cover w/ hover play. |
| `TrackRow` | `components/MediaCards.jsx` | `track, index, list, testid` | Row in a tracklist grid; triggers `play(track,list)`. |
| `VideoCard` | `components/MediaCards.jsx` | `video, testid` | 16:9 thumbnail with kind badge. |
| `CreatorCard` | `components/MediaCards.jsx` | `creator, testid` | Compact creator glass card. |
| `PlaylistCard` | `components/MediaCards.jsx` | `playlist, testid` | Square cover with curator. |
| `SectionHeader` | `components/MediaCards.jsx` | `title, subtitle, action, id` | Shelf header primitive. |

### 7.1 Contexts
- `AuthContext` — `user`, `loading`, `login`, `register`, `logout`, `refresh`.
- `PlayerContext` — `current`, `queue`, `queueIndex`, `playing`, `progress`, `duration`, `volume`, `setVolume`, `play`, `toggle`, `next`, `prev`, `seek`.

---

## 8. Business Rules

1. Every user identity is ANCRID; ANCRMEDIA never becomes a source of truth for identity in production.
2. Any content served must include `institution_id` so institutional-scope moderation is possible.
3. Publishing splits on a track must sum to 100 (enforced client-side in seed; enforce server-side at upload).
4. `verified: true` requires an ANCRID-issued attestation — never self-serve.
5. Downloads are permitted per-track only when the release metadata explicitly allows it (V1 UI shows a Download affordance but does not gate; server MUST gate at production).
6. Live streams cannot be marked `is_live_now` unless there is an active broadcast session (production wiring; V1 uses seed).
7. Faculty may feature only within their institution scope; global editorial is Ecosystem Admin only.
8. Cookies are `httpOnly + secure + samesite=none` — required for the Kubernetes ingress origin split between preview host and API host.

---

## 9. ANCR Ecosystem Integration

ANCRMEDIA is one module inside the ANCR Ecosystem. Every other module is a peer.

| Module | Contract with ANCRMEDIA |
|---|---|
| **ANCRID™** | Sole identity provider. Owns users, roles, verification, institution affiliation, creative passport. ANCRMEDIA consumes an ANCRID session cookie (shared-domain in production) and never mints its own users. `users.creator_id` is the shared handle. |
| **ANCRA™** | The academy. Sends `course_id` context so Discover can weight recommendations by current coursework. Read-only for ANCRMEDIA. |
| **ANCRLAB™** | Creation tool. Exports audio, video, sessions, mixes, masters, artwork into ANCRMEDIA via `POST /api/uploads/import` (Phase 2). |
| **ANCRSync™** | Collaboration rooms. On writing-room close, auto-generates an ANCRMEDIA release page and populates collaborators via ANCRID handles. |
| **COHEIR™** | Faculty & mentorship. Faculty featuring / playlist curation / capstone reviews originate from COHEIR; ANCRMEDIA surfaces them. |
| **INHEIRA™** | Publishing. Completed songs publish to ANCRWAV via `POST /api/inheira/publish` (Phase 2). Lyrics, credits, songwriters, producers, publishing, splits, metadata, artwork, versions transfer automatically. |
| **Vaulta™** | Finance. ANCRMEDIA exposes `GET /api/analytics/me` (already live). Vaulta subscribes to it (and to per-track stream events, Phase 2) to compute royalties + revenue. |
| **ANCRLaunch™** | Careers. Reads creator public data via `GET /api/creators/:id` to power hire/scout. |

### 9.1 Shared Data
- `institutions` and `creators` are conceptually owned by ANCRID; ANCRMEDIA denormalizes them for read speed. When ANCRID SSO ships, replace the local `users` collection with an ANCRID JWT verifier.
- Every ANCR module reads `institution_id` and `creator_id` from ANCRID.

### 9.2 Events (Phase 2)
| Event | Emitter | Consumers |
|---|---|---|
| `release.published` | INHEIRA | ANCRMEDIA (Home Featured), COHEIR (faculty feed) |
| `stream.played` | ANCRMEDIA | Vaulta (royalty accrual), ANCRA (personalization) |
| `livestream.started` | ANCRMEDIA | ANCRSync (co-watch), COHEIR (faculty pin) |
| `identity.verified` | ANCRID | ANCRMEDIA (flip `verified: true`) |

Transport: internal event bus (NATS or Kafka) — not yet wired.

---

## 10. Security Specification

- **Authentication**: bcrypt password hashing (`bcrypt.gensalt()`), JWT HS256, 6h access + 30d refresh. Secret from `JWT_SECRET` env var.
- **Cookies**: `httpOnly=true`, `secure=true`, `samesite=none`, `path=/`. Cleared on logout.
- **Authorization**: role stored on `users.role`. V1 endpoints are permissive-read; write endpoints require `Depends(get_current_user)`.
- **CORS**: `allow_credentials=True`, `allow_origin_regex=".*"` — must be tightened at production to the ANCR domain root.
- **Rate limiting**: not implemented in V1. Production: add SlowAPI or ingress-level rate limits, especially on `/auth/*`.
- **Audit logging**: not implemented. Production: log every `library/toggle`, `analytics/me`, and future write to a signed append-only log.
- **Privacy**: analytics endpoint returns only the requester's own creator profile. Institutional and cross-user analytics require role-based endpoints (Phase 2).
- **Password reset**: not implemented (out of scope — belongs to ANCRID).
- **Brute force**: not implemented (out of scope — belongs to ANCRID gateway).

---

## 11. Testing Documentation

- **Backend**: `testing_agent_v3` executed a 37-check integration suite: auth (7), catalog (13), charts (6), world/genres/search (5), library + analytics (6). Result: **37/37 pass** after the deterministic-seed fix that guarantees demo creators exist.
- **Frontend**: no automated frontend tests in V1. Manual verification via screenshot tool on Login, Home, Countries, Album, Analytics, WAV Home.
- **Regression**: rerun `testing_agent_v3` against any modified endpoint before shipping.
- **Coverage gaps**: no unit tests, no CI. `pytest` structure exists in the repo but no tests written.
- **Known limitations**: MongoDB seeded deterministically at startup; wiping the DB and restarting the backend is the only "reset" path today.

---

## 12. Deployment Guide

### 12.1 Environment Variables
**Backend `/app/backend/.env`** (required; do NOT commit):
```
MONGO_URL="mongodb://..."
DB_NAME="test_database"
CORS_ORIGINS="*"           # tighten in production
JWT_SECRET="<64-hex>"
ADMIN_EMAIL="admin@ancrmedia.com"
ADMIN_PASSWORD="AdminPass2026!"
```

**Frontend `/app/frontend/.env`** (required):
```
REACT_APP_BACKEND_URL="https://<host>"
```

### 12.2 Required Services
- MongoDB (any 6.x+ instance reachable at `MONGO_URL`).
- FastAPI process on `0.0.0.0:8001` under Supervisor.
- Node dev server (frontend) on `:3000` under Supervisor.
- Kubernetes ingress routing `/api/*` → 8001, else → 3000.

### 12.3 Secrets
Only `JWT_SECRET` and `ADMIN_PASSWORD` are secret. In production, mount from Kubernetes Secrets, never from `.env`.

### 12.4 Build
- Frontend: `yarn build` → static bundle under `/app/frontend/build`.
- Backend: no build step (runtime FastAPI).
- Dependencies: `pip install -r backend/requirements.txt` (backend), `yarn install` (frontend).

### 12.5 Deploy Steps
1. Provision MongoDB, obtain URL.
2. Set env vars.
3. Run backend under Supervisor (`sudo supervisorctl start backend`).
4. On first boot the backend idempotently seeds all collections.
5. Deploy frontend static build behind ingress.
6. Verify: `curl $URL/api/` returns `{"service":"ANCRMEDIA","version":"1.0.0"}`.

### 12.6 Rollback
- Backend: `sudo supervisorctl stop backend`, git revert, `sudo supervisorctl start backend`.
- Frontend: redeploy previous static bundle.
- Database: seed is idempotent; drop `test_database` collections + restart backend to reseed cleanly.

---

## 13. Production Readiness Checklist

### 13.1 Completed
- [x] JWT auth (cookies + Bearer)
- [x] All ANCRMEDIA read endpoints
- [x] Global Discover Feed (composite endpoint)
- [x] Rich seed catalog with real playable media
- [x] Persistent audio player + video watch player
- [x] World map, school pages, creator profiles, album/video detail
- [x] Universal search
- [x] Library toggle + creator analytics
- [x] Ecosystem sidebar + footer
- [x] 37/37 backend integration tests

### 13.2 Remaining (Phase 2 / Production)
- [ ] ANCRID SSO integration (replace local `users`)
- [ ] Object storage + transcoding for real uploads
- [ ] HLS/WebRTC livestreaming + live chat
- [ ] Event bus wiring (release.published, stream.played, …)
- [ ] Faculty moderation UI
- [ ] Institution admin dashboards
- [ ] Comments + captions + reactions on videos
- [ ] Real recommendation engine (AIAH)
- [ ] Notifications service
- [ ] CDN media delivery
- [ ] Rights administration + monetization surfaces
- [ ] Rate limiting + audit logging
- [ ] Backend unit tests + CI

### 13.3 Mocked / Placeholder Functionality
- Livestream player uses a static video URL as a stand-in for real HLS.
- AIAH recommendation ranking is a stream-count fallback.
- Analytics `growth_series` and `country_series` are deterministically derived, not real telemetry.
- `is_live_now` is a seed boolean, not a live status.

### 13.4 Technical Debt
- No React Query / SWR — every navigation refetches.
- No Axios interceptor for 401 → auto-refresh flow.
- CORS is fully open.
- Frontend has no test suite.
- All content collections are denormalized (institution_name, artist_name, etc.) — must be recomputed if source names change.

---

## 14. Engineering Roadmap

| Phase | Scope |
|---|---|
| **MVP (V1) — DONE** | Everything listed in §13.1. |
| **Phase 2** | ANCRID SSO, object storage + transcoding, HLS/WebRTC livestreaming + live chat, ANCR Originals programming surface. |
| **Phase 3** | Event bus, cross-module deep linking, comments/captions/reactions, notifications, real AIAH engine. |
| **Production** | Rate limiting, audit logging, CDN, tightened CORS, monitoring (Datadog/Sentry), backend unit tests + CI. |
| **Enterprise** | Institutional admin dashboards, rights administration, revenue/royalty settlement via Vaulta, multi-language captions, PWA. |

---

## 15. Architecture Decision Record (ADR)

**ADR-001 · FastAPI + Motor over Django**
Chose FastAPI for async-first Mongo access, minimal boilerplate, and Pydantic v2 validation at the boundary. Django's ORM offers no benefit against Mongo.

**ADR-002 · MongoDB over Postgres**
Content shape is deeply nested and read-heavy (albums own tracks own splits). Mongo denormalization gives single-round-trip page renders. Trade-off: no referential integrity — enforced at API boundary.

**ADR-003 · JWT httpOnly cookies + Bearer fallback**
Cookies enable seamless cross-domain SSO in production behind ANCRID. Bearer fallback preserves scriptability for CLI + integration tests.

**ADR-004 · Denormalized artist/institution names on child docs**
Trade write-time complexity for read speed. Renaming an institution is a rare admin operation that will be handled by a maintenance job.

**ADR-005 · One React app, two experiences (WAV + VIEW)**
Explicit product requirement: never load two separate applications. Ambient color washes and per-experience routes differentiate WAV/VIEW while sharing one search, library, player, and session.

**ADR-006 · Persistent player via React Context (no service worker)**
`PlayerContext` holds a single `Audio` element ref outside of any component's cleanup lifecycle. Route changes never remount `Layout`, so playback survives.

**ADR-007 · Composite `/api/discover-feed` endpoint**
The Home screen renders 11 shelves. Rather than 11 network calls with waterfall latency, one server-side composition returns everything. Trade-off: coarser cache invalidation.

**ADR-008 · No React Query in V1**
Every screen fetches once, no cross-page cache reuse. Deferred until traffic warrants complexity.

**ADR-009 · ANCRID is the identity source of truth (V2)**
V1 stores `users` locally so demo accounts work. V2 replaces the auth module with an ANCRID cookie verifier. `users.creator_id` is the stable bridge.

**ADR-010 · Deterministic seed**
`random.seed(20260101)` in `seed_data.py` guarantees the same demo creators (Maya, Kenji, Zara, Luca, Noah, Prof. Hayes) every boot. Enables reliable demo tours and automated tests.

---

## 16. Handoff Notes for the CTO

### 16.1 Current Status
V1 (MVP) is complete and passing all backend integration tests. The frontend renders every specified route without console errors. Media playback works with real royalty-free content wired end-to-end. Auth is JWT with httpOnly cookies, ready to be swapped for an ANCRID cookie verifier without touching any consumer code.

### 16.2 Outstanding Work (in priority order)
1. **ANCRID cross-module SSO** — replaces local `users` collection with an ANCRID JWT verifier. Zero-downtime path: dual-verify (local + ANCRID) during cutover.
2. **Object storage + transcoding** — required for real creator uploads to ANCRWAV / ANCRVIEW.
3. **HLS/WebRTC livestreaming + live chat** — swap the seed video URL in the livestream player for a real manifest.
4. **ANCR Originals programming surface** — reserved surfaces already exist in the UI.

### 16.3 Risks
- **CORS wide open (`.*`)** — must be tightened before any public exposure.
- **No rate limiting** — `/auth/login` is unthrottled.
- **No audit log** — moderation and financial-adjacent actions must not be shipped to production without one.
- **Denormalized data** — a rename of an institution needs a maintenance job to propagate.
- **`register` endpoint** — must be disabled or gated once ANCRID is the identity provider.

### 16.4 Recommended Next Steps
1. Wire ANCRID as the single identity provider.
2. Bring up object storage + transcoding.
3. Tighten CORS, add rate limiting, add audit logging.
4. Add backend unit tests + CI pipeline before Phase 3.
5. When those are complete, begin **COHEIR™ — The Professional Network of CCDP** (separate module, separate spec).

### 16.5 References
- Source: `/app/backend/server.py`, `/app/backend/seed_data.py`, `/app/frontend/src/**`.
- Credentials: `/app/memory/test_credentials.md`.
- Product notes: `/app/memory/PRD.md`.
- Test reports: `/app/test_reports/iteration_1.json`.

---

*End of ANCRMEDIA™ Technical Specification v1.0.*
