# ANCRD™ — Full Technical Scope (v1.0)

_Global Professional Network of the Contemporary Creative Development Program · Part of the ANCR™ Ecosystem_

---

## 1. Product Positioning
ANCRD™ is a **private, verified, invitation-only** professional network for the CCDP community — students, alumni, faculty, mentors, industry partners, and institutions. It is the **central communication hub** of the ANCR™ Ecosystem: authentication and identity flow in from ANCRID™, and activity from every other module (ANCRA™, ANCRLAB™, ANCRSync™, COHEIR™, INHEIRA™, Vaulta™, ANCRMEDIA™, ANCRLaunch™) surfaces here.

- **Product masthead:** ANCRD™ · Global Creator Network
- **Positioning line:** _One identity. Ten modules. The future of creative careers._
- **Version:** 1.0 (production-ready architecture, seeded demonstration data)

---

## 2. Architecture Overview

| Layer | Technology |
|---|---|
| Frontend | React 19 · React Router 7 · Tailwind CSS · Shadcn/UI · Sonner toasts · Lucide icons · Axios |
| Interactive Map | Leaflet 1.9 + react-leaflet 5 · CartoDB dark tiles (no API key) |
| Streaming AI | Fetch + `ReadableStream` reader for token-by-token AIAH output |
| Backend | FastAPI · Uvicorn · Motor async MongoDB driver · Pydantic v2 |
| Database | MongoDB (Motor async) — collections: users, posts, communities, events, opportunities, marketplace, notifications, threads, messages, institutions, bookings |
| Auth | JWT (HS256, 30-day) · bcrypt password hashing |
| AI | **Claude Sonnet 4.5** (`anthropic/claude-sonnet-4-5-20250929`) via `emergentintegrations` (Emergent Universal LLM Key) — real-time streaming |
| Design System | Cabinet Grotesk (display) · Satoshi (body) · JetBrains Mono (mono) · glassmorphism · grain overlay · brand gradient (blue → purple → magenta → orange) |
| Routing | `/api/*` prefix on every backend route (Kubernetes ingress) |
| Env | `MONGO_URL`, `DB_NAME`, `JWT_SECRET`, `EMERGENT_LLM_KEY`, `CORS_ORIGINS`, `REACT_APP_BACKEND_URL` |

**Data flow:** Frontend → `REACT_APP_BACKEND_URL/api/*` → FastAPI → Motor → MongoDB. AIAH endpoint returns `StreamingResponse` (text/plain); frontend consumes token-by-token.

---

## 3. Repository Layout

```
/app
├── backend/
│   ├── server.py          # FastAPI app: 25+ routes, JWT, AIAH streaming
│   ├── seed_data.py       # Realistic CCDP seed: 49 users, 60 posts, 12 institutions
│   ├── requirements.txt   # emergentintegrations, motor, pyjwt, bcrypt, fastapi
│   └── .env               # MONGO_URL, DB_NAME, JWT_SECRET, EMERGENT_LLM_KEY
│
├── frontend/
│   └── src/
│       ├── App.js                        # Routes + AuthProvider + Toaster
│       ├── App.css / index.css           # Theme, glass, grain, Leaflet dark tweaks
│       ├── context/AuthContext.js        # useAuth() hook + JWT localStorage
│       ├── lib/api.js                    # Axios instance + interceptors + timeAgo
│       ├── components/
│       │   ├── ui/                       # Shadcn primitives
│       │   └── ancrd/
│       │       ├── AppShell.jsx          # Sidebar + main + AIAH FAB + footer
│       │       ├── EcosystemSidebar.jsx  # 10 ecosystem modules + 10 app nav
│       │       ├── EcosystemFooter.jsx   # Brand footer w/ status pills
│       │       ├── AiahPanel.jsx         # Claude 4.5 streaming chat drawer
│       │       ├── BrandLogo.jsx         # ANCRD_LOGO asset + AncrMark SVG
│       │       └── PageHeader.jsx        # Consistent masthead across pages
│       └── pages/
│           ├── LoginPage.jsx
│           ├── FeedPage.jsx              # "The Signal"
│           ├── NetworkPage.jsx           # Grid of verified members
│           ├── CommunitiesPage.jsx       # Collaborations index
│           ├── CollaborationDetailPage.jsx  # Scoped feed per community
│           ├── ProfilePage.jsx           # Creator Passport + portfolio
│           ├── DiscoverPage.jsx          # Global Discovery map
│           ├── InstitutionsPage.jsx      # CCDP partner institutions
│           ├── MessagesPage.jsx
│           ├── EventsPage.jsx
│           ├── OpportunitiesPage.jsx
│           ├── MarketplacePage.jsx
│           ├── NotificationsPage.jsx
│           ├── AdminPage.jsx
│           └── EcosystemModulePage.jsx   # Placeholder for the 9 sibling modules
│
└── memory/
    ├── PRD.md
    ├── test_credentials.md
    └── TECH_SCOPE.md      # (this file)
```

---

## 4. Backend API — Complete Endpoint Inventory

All routes prefixed with `/api`.

### 4.1 Auth
| Method | Path | Description |
|---|---|---|
| POST | `/auth/login` | Email + password → returns `{ token, user }` |
| GET | `/auth/me` | Current user from `Authorization: Bearer <jwt>` |

### 4.2 Users / Profiles
| Method | Path | Description |
|---|---|---|
| GET | `/users` | List all verified members |
| GET | `/users/{id}` | Single profile |
| POST | `/users/{id}/follow` | Add to follower/following graph |

### 4.3 Feed / Posts
| Method | Path | Description |
|---|---|---|
| GET | `/posts` | Global feed (unscoped posts + author hydrated) |
| POST | `/posts` | Create post (`content`, `kind`, `hashtags`, optional `community_id`) |
| POST | `/posts/{id}/react` | Toggle reaction (`like`, `applaud`, `celebrate`, `insightful`) |
| POST | `/posts/{id}/comment` | Append comment |

### 4.4 Collaborations (Communities)
| Method | Path | Description |
|---|---|---|
| GET | `/communities` | List all |
| GET | `/communities/{id}` | Detail with **hydrated member profiles** + `is_member` flag |
| GET | `/communities/{id}/posts` | **Community-scoped feed** with authors hydrated |
| POST | `/communities/{id}/join` | Join |
| POST | `/communities/{id}/leave` | Leave |

### 4.5 Events / Opportunities / Marketplace
| Method | Path | Description |
|---|---|---|
| GET / POST | `/events`, `/events/{id}/rsvp` | Events + attendee list |
| GET / POST | `/opportunities`, `/opportunities/{id}/apply` | Opportunities + applicants |
| GET / POST | `/marketplace`, `/marketplace/{id}/book` | Services + booking record |

### 4.6 Messaging
| Method | Path | Description |
|---|---|---|
| GET | `/messages/threads` | User's DM threads with `other` party hydrated |
| GET | `/messages/{thread_id}` | Full message history |
| POST | `/messages` | Send DM; auto-creates thread on first message |

### 4.7 Ecosystem / Notifications / Admin
| Method | Path | Description |
|---|---|---|
| GET | `/institutions` | 12 CCDP partner institutions (with lat/lng, students, faculty, programs) |
| GET | `/notifications` | Notification feed for current user |
| GET | `/admin/stats` | Global counts for admin dashboard |

### 4.8 AIAH™ AI
| Method | Path | Description |
|---|---|---|
| POST | `/aiah/ask` | **Streaming plain-text response** from Claude Sonnet 4.5. System prompt embeds current user + a live directory of ~60 CCDP creators so recommendations reference real network members. |

### 4.9 Seed
| Method | Path | Description |
|---|---|---|
| POST | `/seed` | Manual re-seed (idempotent — wipes + re-inserts all demo data) |

---

## 5. Data Model (MongoDB)

### 5.1 `users`
```
id, email, password (bcrypt), name, role, institution, institution_id, avatar,
banner, verified, verification_level (Silver|Gold|Platinum), bio,
disciplines[], skills[], location, city, country, lat, lng, languages[],
degree_program, graduation_year, cohort, genre, instrument, availability,
portfolio_score, followers[], following[], achievements[], social{}, created_at
```

### 5.2 `posts`
```
id, author_id, content, media_url, kind (text|image|video|music|achievement|event),
hashtags[], community_id (nullable → global feed vs. scoped),
reactions{ like[], applaud[], celebrate[], insightful[] },
comments[{ id, author_id, author_name, avatar, content, created_at }],
created_at
```

### 5.3 `communities`
```
id, name, category, banner, description, members[], created_at
```

### 5.4 `events`
```
id, title, kind, banner, date, location, host_institution, description, attendees[]
```

### 5.5 `opportunities`
```
id, title, kind, company, location, compensation, description, deadline,
applicants[], created_at
```

### 5.6 `marketplace`
```
id, title, category, provider_id, provider_name, provider_avatar, price,
availability, rating, reviews, description, created_at
```

### 5.7 `threads` / `messages`
```
threads:  id, kind (dm|group), members[], created_at, updated_at, last_message
messages: id, thread_id, from_user_id, to_user_id, content, created_at
```

### 5.8 `institutions`
```
id, name, city, country, lat, lng, students, faculty, programs[]
```

### 5.9 `notifications`, `bookings`
Standard CRUD collections.

---

## 6. Seeded Demonstration Data

- **49 users** — 1 primary demo + 48 procedurally generated across 12 institutions, 14 disciplines, 14 roles, 10 languages, 10 genres
- **12 institutions** with real geographic coordinates: Berklee (Boston), RCA (London), Parsons (NYC), Tokyo Univ. of the Arts, Lagos Creative Academy, Berlin School of Sound, Korea Nat'l Univ. of Arts (Seoul), ECA-USP (São Paulo), Whistling Woods (Mumbai), OCAD (Toronto), Beaux-Arts (Paris), AIM (Sydney)
- **60 posts** — ~55% scoped to a matching-discipline community, ~45% global feed
- **12 collaborations** covering songwriters, producers, film composers, engineers, photographers, designers, plus identity groups (Women in Music, Black Creatives, Latin Creatives, Faith & Creativity) and wellness
- **18 events** (Masterclasses, Writing Camps, Showcases, Portfolio Reviews, Industry Panels, Guest Lectures, Live Streams, Networking Mixers, Hackathons, Concerts, Film Premieres, Graduations)
- **12 opportunities** (Sync, Internships, Fellowships, Publishing, Scholarships, Full-time Jobs, Grants, Auditions, Residencies, Volunteer)
- **12 marketplace listings** (mixing, mastering, topline, beats, session piano, photography, video/color, string arrangement, music direction, lessons, consulting, design)
- **12 notifications** for the primary demo user across 8 notification types
- **6 DM threads** with 3–8 realistic messages each

**Demo credentials:** `aaron@ancrd.io` / `ancrd2026` (all seeded creators share the password for demo purposes).

---

## 7. Frontend Experiences (Pages)

### 7.1 Sidebar Navigation
- **Ecosystem modules (10):** ANCRD, ANCRA, ANCRLAB, ANCRSync, COHEIR, INHEIRA, Vaulta, ANCRMEDIA, ANCRLaunch, ANCRID
- **ANCRD app nav (10):** The Signal, Network, Collaborations, Opportunities, Events, Institutions, Discover, Messages, Notifications, Profile
- Persistent **ANCRD logo** at top, **Part of the ANCR™ Ecosystem** tag, user card, and Sign out

### 7.2 The Signal (`/feed`)
Product masthead ANCRD™ · Global Creator Network + section kicker _"The Signal · Verified activity across the CCDP global network."_
- Composer with text/media/music/video affordances → creates post via `POST /api/posts`
- Post cards: author link, reactions (4 types + counters), expandable comments with reply composer, hashtags in brand-orange, media, bookmark/share
- Right rail: Suggested Creators + Trending Hashtags

### 7.3 Network (`/network`)
Grid of all verified members with search + role filter + discipline filter, editorial banner-topped cards, verified badge glyph, links to full profile.

### 7.4 Collaborations (`/collaborations`)
Card grid of all 12 collaborations. Each card is clickable → detail page.
Inline **Join** button on the card + **Open →** affordance.

### 7.5 **Collaboration Detail (`/collaborations/:id`) — NEW**
- Cinematic banner with community name, category, member count
- **Scoped composer**: "Post to Songwriters Collective" — only creates posts with `community_id = id`; non-members see a "Members only" prompt with Join CTA
- **Community-scoped feed**: fetched from `/api/communities/{id}/posts` — same reaction/comment mechanics as global feed
- Right rail: About, Members/Posts stat cards, full **Members** roster (scrollable) linking to profiles
- Join/Leave toggle in the header + "All Collaborations" back link

### 7.6 Profile (`/profile/:id`)
Cinematic banner + avatar, verification badge + level, disciplines, follow/message/collaborate buttons, **Creator Passport score** (0–100 gradient meter), skills, achievements, per-module ecosystem activity strip.

### 7.7 Discover (`/discover`)
Leaflet dark map (CartoDB tiles), custom **cyan pulsing pins** for creators and **gold diamond pins** for institutions, animated cyan **collaboration polylines** connecting institutions, filters (country/discipline/role/search) and live result count, per-pin popup with quick "View Profile" link.

### 7.8 Institutions (`/institutions`)
Grid of all 12 CCDP partner institutions with student/faculty stats and program tags.

### 7.9 Messages (`/messages`)
Two-pane threads UI: threads list on left with other-party avatar/name/last-message/time, message history on right (bubble left/right by sender), send input.

### 7.10 Events, Opportunities, Marketplace, Notifications, Admin
- **Events**: card grid with kind label, date, location, RSVP action
- **Opportunities**: filterable by kind (Sync, Internship, Fellowship, etc.), rich row layout with company/location/compensation/deadline
- **Marketplace**: service listings with provider avatar, price, rating, availability, book action
- **Notifications**: pulse indicator + kind tag + relative time
- **Admin**: KPI cards (users, institutions, posts, communities, events, opportunities, marketplace) + moderation queue placeholder + 7-day engagement bar chart

### 7.11 Login (`/login`)
Split cinematic hero (large ANCRD logo asset) + minimal right-hand form with gradient "Enter ANCRD" CTA and demo credential card.

### 7.12 Ecosystem Module pages (`/ancra`, `/ancrlab`, etc.)
Placeholder cinematic pages listing the streams each sibling module surfaces into ANCRD. Ready for future deep integration.

### 7.13 AIAH™ Panel (FAB, all pages)
Floating orange-glow FAB → opens right drawer:
- System prompt injects the current user + a 60-creator directory
- Suggested prompts ("Who should I meet this week?", "Match me with a mentor for sync licensing", etc.)
- **True token-streaming** via `ReadableStream` — text appears live
- Powered by Claude Sonnet 4.5 through the Emergent Universal LLM Key

---

## 8. Design System

- **Colors:**
  - Base: `#050505` background, `#ffffff` foreground, white/10 borders
  - Brand gradient: `#4F46E5 → #A855F7 → #EC4899 → #F97316` (blue → purple → magenta → orange)
  - ANCR mark: `#3B82F6 → #60A5FA` (blue)
  - Cyan accent for map: `#00E5FF` · Gold for institutions: `#D4AF37`
- **Fonts:**
  - Cabinet Grotesk (weights 400/500/700/800) — headings, wordmarks
  - Satoshi (400/500/700) — body
  - JetBrains Mono (400/500/700) — kickers, labels, mono UI
- **Motifs:**
  - Glassmorphism (`.glass`, `.glass-elev`) with 20–24px backdrop blur
  - Full-screen SVG grain overlay
  - Editorial photography from Unsplash for banners
  - Staggered fade-in animations for lists
  - Custom pulsing map pins
  - Gradient hairline separators under page mastheads
  - `PageHeader` component ensures the ANCRD™ masthead + "Global Creator Network" subtitle appears on every page
- **Accessibility:**
  - All interactive elements carry `data-testid` attributes
  - Semantic HTML (`<article>`, `<nav>`, `<footer>`, `<header>`)
  - No dark text on dark backgrounds
  - Keyboard-navigable forms and links

---

## 9. Integrations

| Integration | Purpose | Status |
|---|---|---|
| **Claude Sonnet 4.5** (via Emergent Universal Key) | AIAH streaming assistant | ✅ Live |
| Leaflet + OpenStreetMap / CartoDB dark | Global Discovery map | ✅ Live |
| MongoDB (Motor) | Primary data store | ✅ Live |
| bcrypt + PyJWT | Auth | ✅ Live |
| Fontshare (Cabinet Grotesk, Satoshi) | Display + body fonts | ✅ Live |
| Google Fonts (JetBrains Mono) | Mono font | ✅ Live |

**Not yet integrated (roadmap):**
- ANCRID production SSO handoff (drop-in replacement for `/auth/login`)
- Object storage for real portfolio uploads (currently seeded URLs)
- WebSocket transport for realtime messages + typing indicators + read receipts
- oEmbed players (SoundCloud/Spotify/Apple Music) for `kind: "music"` posts
- Push notifications
- Email delivery (SendGrid/Resend) for invitations, digests, and event reminders

---

## 10. Testing & Verification

- Backend endpoints validated with curl + Python parsing (all 25+ routes, including AIAH streaming)
- Testing subagent iteration 1: **100% pass** on both backend and frontend (17/17 backend flows, all 12 frontend flows including AIAH streaming, map filters, community join, post creation, reactions, RSVP, apply, book, DM send)
- Only LOW-priority cosmetic finding (FAB overlapping Emergent badge) — resolved by repositioning FAB
- Visual verification of new logo integration and Collaboration Detail page complete

---

## 11. What's Been Built Since Kickoff (Chronological)

1. **Initial MVP** — JWT auth, 25+ API endpoints, 49-user CCDP seed, 12 pages, Leaflet dark map with animated collab lines, streaming AIAH panel with Claude Sonnet 4.5
2. **Brand identity pass** — Custom ANCRD wordmark + orbital-ring SVG icon, `BrandLogo`/`AncrMark` components, full-page ANCRD gradient CTAs
3. **Ecosystem Footer** — All 10 modules linked, "Part of the ANCR™ Ecosystem" tagline, gradient hairline, status pills
4. **Nav & header restructure** — Sidebar restructured to the requested 10 destinations (The Signal, Network, Collaborations, Opportunities, Events, Institutions, Discover, Messages, Notifications, Profile). Feed page masthead changed to product identifier ANCRD™ + "Global Creator Network"; "The Signal" demoted to section kicker. New `PageHeader` component applied across every page for masthead consistency.
5. **Two new pages** — `NetworkPage` (searchable member directory with role + discipline filters) and `InstitutionsPage` (all CCDP partner institutions with stats + programs)
6. **Communities → Collaborations** — Thematic rename with `/collaborations` primary route (backward-compat `/communities` retained)
7. **Collaboration-scoped feeds (latest)** — New `CollaborationDetailPage` at `/collaborations/:id`, backend gained `community_id` on posts + `GET /communities/:id`, `GET /communities/:id/posts`, `POST /communities/:id/leave`. Seed distributes ~55% of posts across matching-discipline communities. Non-members see a members-only prompt; members get a scoped composer that posts only into that community. Full member roster surfaces in the right rail.
8. **Logo refresh (latest)** — Swapped to the new cleaner ANCRD logo asset (icon + wordmark composition) in the sidebar header and login hero. Backend re-seeded to activate the new endpoints.

---

## 12. Remaining Engineering (For Handoff to Aaron)

**P0 — Real-user readiness**
- Replace seeded users with real CCDP verified members (schemas already match; drop-in)
- Swap `/api/auth/login` for the ANCRID SSO callback
- Add object-storage integration for actual portfolio uploads (currently seeded URLs)

**P1 — Realtime + media**
- WebSocket transport for `/messages` (typing, read receipts, delivery)
- Voice notes + file sharing in messages
- oEmbed player for music/podcast posts (SoundCloud, Spotify, Apple Music)
- Push notifications (web push + email digest)

**P2 — Depth & polish**
- Global search across users/posts/collaborations/opportunities
- Institution-scoped landing pages (`/institutions/:id`)
- Admin moderation queue with real actions (delete post, warn user, remove from collab)
- Analytics dashboard (engagement time-series, per-institution breakdown, per-cohort activity)
- AIAH weekly digest job (scheduled) posting personalized recommendations into notifications
- Mobile responsive polish for map + messages

**Environment / Deployment**
- Production Mongo cluster + daily backups + retention policy
- CDN in front of `/api` and asset delivery
- Rate limiting on AIAH endpoint (per-user quota) to protect LLM budget
- Structured audit logging for admin actions

---

## 13. Considered Product Complete
The ANCRD™ v1.0 specification is complete as defined:
- Every experience listed in the original spec is present (Feed, Profiles, Communities, Discovery, Messaging, Events, Opportunities, Marketplace, Notifications, Admin, AIAH)
- Every ANCR Ecosystem module is represented in the sidebar and footer
- AIAH is live with Claude Sonnet 4.5 and streams responses
- The Discovery map is a **premium cinematic experience** (not a generic GIS map) with custom pins and animated collaboration polylines
- Design language matches the ANCR Design System (Cabinet Grotesk, Satoshi, JetBrains Mono, glass, brand gradient)
- Backend and frontend are architected for **drop-in real-user replacement** with no structural changes
