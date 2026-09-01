# ANCRMEDIA™ — The Global Creative Network of CCDP

## Original problem statement
Build ANCRMEDIA™, the global media and discovery network of the ANCR Ecosystem — the official streaming, publishing, discovery, and broadcast platform for every creator enrolled in the Contemporary Creative Development Program (CCDP). Every student, regardless of institution, becomes part of one connected global creative community. Two unified experiences: **ANCRWAV™** (audio) and **ANCRVIEW™** (video). Includes World map, School Communities, Creator Pages, Discover, Global Charts, Creative Challenges, Live, Analytics, and Ecosystem sidebar identical to every ANCR module.

## Architecture
- **Frontend**: React 19, React Router 7, Tailwind, Recharts, Framer Motion, Lucide icons, Sonner toasts. Cabinet Grotesk + Satoshi via Fontshare CDN. Obsidian black + Electric Blue/Violet/Orange gradient design language.
- **Backend**: FastAPI + Motor (async MongoDB). JWT auth via httpOnly secure cookies + Authorization Bearer fallback. All routes prefixed `/api`. Rich seeded catalog on startup.
- **Auth**: Bcrypt password hashing, 6h access token, 30d refresh token. ANCRID™-styled identity envelope with `creator_id` linking users to their creator profile.
- **Media**: Royalty-free audio (SoundHelix mp3), royalty-free video (Google gtv-videos-bucket). Persistent bottom audio player + inline HTML5 video watch player.

## User personas
- **Student creators** across CCDP institutions worldwide (primary users).
- **Faculty / mentors / artists in residence** — curate playlists, host livestreams, review capstones.
- **Institutional administrators** — see student output, feature releases.

## Core requirements (static)
- Two unified experiences: ANCRWAV (audio), ANCRVIEW (video).
- Global CCDP identity via ANCRID (single source of truth).
- World map of institutions + creators.
- School Communities pages, Creator profiles, Discover, Trending/Charts, Live, Analytics, Library.
- Creative Challenges + Playlists + Events.
- Ecosystem sidebar with all 10 ANCR modules.
- Production-ready architecture: swap seeded content with real uploads without redesign.

## What's been implemented (v1 — Feb 26)
- ✅ Auth flow (JWT + cookies + demo accounts).
- ✅ Rich seed: 16 institutions across 9 countries, ~90 creators, 40 albums, ~200 tracks (real audio), ~25 videos (real video), 10 podcasts, 15 playlists, 8 livestreams, 6 challenges, 8 events.
- ✅ Persistent ANCRWAV bottom bar with real playback, queue, next/prev, seek, volume.
- ✅ ANCRVIEW watch page with custom video player.
- ✅ Home cinematic hero + Live-now grid + Trending tracks + New releases + World map preview + Videos + Playlists + Challenge CTA.
- ✅ Interactive World Map (equirectangular projection, glowing pulsing nodes, hover info card).
- ✅ Schools list + Institution detail (faculty, students, releases, videos, livestreams).
- ✅ Creator profile pages (editorial cover, floating glass profile card, Music/Video/About tabs, ANCRID verified badge).
- ✅ Album detail (cinematic blurred hero, tracklist, credits, publishing splits, lyrics).
- ✅ Discover, Trending (5 chart tabs), New Releases, Videos (kind filter), Live, Playlists (list + detail), Genres (list + detail), Creators (institution/discipline/country filters), Albums, Podcasts.
- ✅ Search across creators/tracks/albums/videos/institutions/playlists.
- ✅ Library (like/save/watch-later toggles).
- ✅ Analytics dashboard (KPIs, 12-week growth line chart, top-country pie chart, schools-reached bar chart).
- ✅ Ecosystem sidebar with 10 ANCR modules (ANCRA, ANCRLAB, ANCRSync, COHEIR, INHEIRA, Vaulta, ANCRMEDIA active, ANCRLaunch, ANCRID + Home).
- ✅ 36/37 backend tests passing (100% after zara seed fix).

## Prioritized backlog

### P1 (next sprint)
- Real-time livestreaming (currently premium UI placeholders with real video URLs).
- Follow / subscribe flows persisted with counts propagation.
- Comments + captions on videos.
- Continue watching state (per-user watch position).
- Full AI-powered recommendations (currently rule-based popularity mix).

### P2
- Faculty curation UI (create/edit playlists, feature releases).
- Creator dashboard for uploads (INHEIRA / ANCRLAB export API integration).
- Vaulta financial dashboards (streaming revenue, publishing splits payout).
- Push notifications, email digests.
- Institution leaderboards (weekly/monthly).

### P3
- Mobile app polish and PWA install.
- Multi-language captions & lyrics.
- Merch storefront integration (ANCRLaunch tie-in).
- COHEIR mentorship threading on creator pages.

## Key files
- `/app/backend/server.py` — FastAPI app, auth, all content endpoints.
- `/app/backend/seed_data.py` — deterministic seed generator.
- `/app/frontend/src/App.js` — routes.
- `/app/frontend/src/components/{EcosystemSidebar,ANCRMediaNav,TopBar,AudioPlayerBar,Layout,WorldMap,MediaCards}.jsx`
- `/app/frontend/src/context/{AuthContext,PlayerContext}.jsx`
- `/app/frontend/src/pages/*.jsx`
- `/app/memory/test_credentials.md` — demo accounts.
