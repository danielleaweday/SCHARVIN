# ANCRD™ — PRD & Build Log

## Original Problem Statement
Build ANCRD™ — the official global professional social network of the Contemporary Creative Development Program (CCDP), part of the ANCR™ Ecosystem. Private, verified, invitation-only network for CCDP students, faculty, mentors, alumni, industry professionals. LinkedIn × Instagram × Discord × Behance × university campus network for creative professionals. Every user authenticated via ANCRID™, every interaction tied to verified identity. Central communication hub connecting to ANCRA, ANCRLAB, ANCRSync, COHEIR, INHEIRA, Vaulta, ANCRMEDIA, ANCRLaunch, ANCRID.

## Architecture
- **Backend**: FastAPI + MongoDB (Motor async). JWT auth (bcrypt hashing). Auto-seed on startup.
- **AIAH AI**: Claude Sonnet 4.5 via Emergent Universal Key with streaming (SSE-style plain-text stream).
- **Frontend**: React 19 + React Router 7 + Tailwind + Shadcn primitives + Leaflet/react-leaflet (CartoDB dark tiles).
- **Design**: Premium dark cinematic, Cabinet Grotesk / Satoshi / JetBrains Mono, glassmorphism, ANCRD brand gradient (blue→magenta→orange), ANCR blue accent, grain overlay.

## User Personas
1. **Student / Alumni** — Portfolio, discovery, collaboration
2. **Faculty / Professor / Mentor** — Mentorship, feedback, community moderation
3. **Industry Partner / Recruiter / Label / Publisher / Investor** — Opportunity posting, talent discovery
4. **Institution Administrator / Moderator** — Analytics, moderation, community management

## What's Been Implemented (v1.0 — 2026-02)

### Backend (`/app/backend/`)
- `POST /api/auth/login`, `GET /api/auth/me` — JWT auth
- `GET /api/users`, `GET /api/users/{id}`, `POST /api/users/{id}/follow`
- `GET/POST /api/posts`, `POST /api/posts/{id}/react`, `POST /api/posts/{id}/comment`
- `GET /api/communities`, `POST /api/communities/{id}/join`
- `GET /api/events`, `POST /api/events/{id}/rsvp`
- `GET /api/opportunities`, `POST /api/opportunities/{id}/apply`
- `GET /api/marketplace`, `POST /api/marketplace/{id}/book`
- `GET /api/messages/threads`, `GET /api/messages/{tid}`, `POST /api/messages`
- `GET /api/institutions`, `GET /api/notifications`, `GET /api/admin/stats`
- `POST /api/aiah/ask` — Claude Sonnet 4.5 streaming
- Seed script (`seed_data.py`): 49 users, 60 posts, 12 communities, 18 events, 12 opportunities, 12 marketplace listings, 12 institutions, 12 notifications, 6 threads, plus messages.

### Frontend (`/app/frontend/src/`)
- Ecosystem sidebar with all 10 modules + ANCRD app nav
- Login page — cinematic hero with ANCRD brand logo + gradient CTA
- Feed page — composer + posts + 4 reaction types + comments + suggested creators + hashtags
- Profile page — banner, avatar, Creator Passport meter, skills, achievements, ecosystem activity, follow/message/collaborate
- Global Discovery — Leaflet dark map with cyan creator pins + gold institution pins + animated collaboration polylines + filters
- Communities, Events, Opportunities, Marketplace, Messages, Notifications, Admin pages
- AIAH panel — floating streaming chat with Claude Sonnet 4.5
- Ecosystem footer with all 10 modules, status pills, brand tagline
- Ecosystem module placeholder pages (ANCRA / ANCRLAB / ANCRSync / COHEIR / INHEIRA / Vaulta / ANCRMEDIA / ANCRLaunch / ANCRID)

## Testing (2026-02-09)
- Backend: 100% pass (17/17 endpoints incl. AIAH streaming)
- Frontend: 100% pass (all 12 critical flows)

## Prioritized Backlog

### P0 — Next Priorities
- Real-time WebSockets for messages, typing indicators, read receipts
- Voice notes + file sharing in messages
- Music/podcast embeds in feed (SoundCloud, Spotify, Apple Music oEmbed)
- Rich profile portfolio grid (media items with player)
- Object storage integration for actual uploads (currently seeded URLs)

### P1
- Real ANCRID SSO handoff (currently mocked as local JWT — architecturally identical shape)
- Community-scoped feeds (posts filtered by community membership)
- Announcement channels + pinned messages
- Event live-streams via ANCRMEDIA link
- AIAH weekly digest scheduled job

### P2 / Polish
- Global search across users/posts/communities/opportunities
- Notification real-time push
- Admin moderation queue with actions
- Analytics dashboards (engagement over time, per-institution)
- Mobile responsive polish for map + messages

## A–Z Build Inventory (v1.0)
- Auth (JWT + bcrypt) ✅
- Backend Models & API ✅
- Communities ✅
- Discovery Map (Leaflet dark) ✅
- Events + RSVP ✅
- Feed + Reactions + Comments ✅
- Global Sidebar (Ecosystem nav) ✅
- Hashtags in posts ✅
- Institutions directory ✅
- JWT session management ✅
- Marketplace + Booking ✅
- Notifications ✅
- Opportunities + Apply ✅
- Profile (Creator Passport, portfolio score, achievements) ✅
- Reactions (Like / Applaud / Celebrate / Insightful) ✅
- Seed Data (realistic CCDP identities) ✅
- Threaded Messaging (DM) ✅
- UI (Cabinet Grotesk + Satoshi + JetBrains Mono, glass, grain, ANCRD gradient) ✅
- Verified badges + verification levels ✅
- World Map with animated collab lines ✅
- ANCR Ecosystem footer + brand marks ✅
- AIAH (Claude Sonnet 4.5 streaming) ✅

## Handoff to Aaron
- Replace demo seed users with real CCDP verified members (all schemas already match)
- Add ANCRID production SSO — swap `/api/auth/login` for token issuer callback
- Wire object storage for real portfolio/media uploads
- Enable WebSockets for live messaging
- Configure production Mongo cluster + backup + retention
