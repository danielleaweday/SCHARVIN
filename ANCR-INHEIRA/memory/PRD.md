# SONGRIGHT™ — Product Requirements

## Original Problem Statement
Build SONGRIGHT™ — not another split sheet app, but the operating system for songwriting, creative ownership, publishing, collaboration, and rights management. Tagline: **Write. Own. Protect.** A flagship product inside the ANCR ecosystem. Ownership begins at creation, not after.

## Architecture
- **Backend:** FastAPI + MongoDB (motor) + JWT auth + Emergent Google Auth + Emergent Object Storage + Claude Sonnet 4.5 via `emergentintegrations`.
- **Frontend:** React 19 + React Router 7 + Shadcn UI + Tailwind + Cabinet Grotesk / Manrope / JetBrains Mono. Dark, editorial, Apple/Linear/Notion/Spotify inspired.

## User Personas
Songwriters · Producers · Artists · Composers · Engineers · Publishers · Managers · Attorneys · Labels · Universities · Studios · Writing Camps.

## Core Requirements (static)
1. Permanent RightPrint™ identity — reusable across sessions
2. Verified creative sessions with time-stamped contributions
3. AI-powered split suggestions with human approval flow
4. Split sheet + copyright-ready exports
5. Royalty rail (Vaulta™) infrastructure
6. Dark, premium, distinctive UI

## What's been implemented (2026-02-07 — MVP v1.0)
- Landing page with hero, features grid, "how it works", built-for list, CTA — Cabinet Grotesk display + amber accent
- Email/password auth (JWT + bcrypt) with seeded `test@songright.com / Test1234!`
- Emergent-managed Google OAuth (session cookie + fragment callback route)
- RightPrint™ profile editor (legal name, professional name, PRO, IPI, publisher, label, manager, attorney, disciplines, instruments, genres, biography, social)
- Dashboard with metrics, active sessions, finalized catalog, highlights
- Session creation with title/project/context/type + auto invite code
- Session detail with contribution timeline (vertical amber-glow track), collaborator list, splits panel
- Log contribution dialog (role, description, weight, lyrics)
- AI split suggestions via Claude Sonnet 4.5 (with rule-based fallback) — normalized to 100%
- Save splits + collaborator signature/approval flow → auto-finalize when all sign
- Printable split sheet route (`/sessions/:id/split-sheet`)
- Vaulta™ royalty placeholder page (earnings summary + works table + placeholder categories)
- Object storage upload endpoint + JWT-authenticated file download
- All UI has data-testid attributes; testing agent: 21/21 backend + 100% frontend flows passed

## Prioritized Backlog

### P0 (next)
- Real-time collaboration presence (WebSockets) inside a session
- Audio + voice memo uploads with waveform preview
- PDF generation server-side for split sheets (currently browser print)
- Invite via email / QR / NFC (currently invite code only)

### P1
- SONGRIGHT Intelligence™ v2 — duplicate metadata detection, publishing readiness score
- Publishing / copyright registration integrations (harry fox, ASCAP/BMI CWR)
- University Mode: faculty dashboards, capstone tracking
- Industry Mode: label/publisher admin roles
- Search + discover creators

### P2
- Vaulta™ real royalty streams (Stripe payouts, PRO API integrations)
- ANCRLAB sync of studio sessions
- Advanced permissions and public/private link sharing
- Native mobile app

## Test Credentials
- `test@songright.com / Test1234!` (auto-seeded on backend startup)
- File `/app/memory/test_credentials.md` is kept in sync

## Deferred to next iteration
- Wave real-time audio streaming
- Server-side PDF via Puppeteer/WeasyPrint
- Full universities & industry mode workflows
- Emergent-hosted signed PDF vault

## Studio Session Workspace (2026-02-07 — v1.1)
- New `/sessions/:id/studio` route: a Linear/Notion/Figma-caliber song workspace
- Left sidebar navigation (Dashboard, Songs, Studio, Sessions, Collaborators, Rights, Vaulta, Publishing, Analytics, Templates, Settings)
- Song header: title, genre, key, tempo, time signature, language, editable meta, Invite/Share/Export/Publish
- Collaborator cards with per-user assigned color, live-online dots, stats
- Three donut charts (recharts): Lyrics, Producer Credits, Composition — 100% total
- **Lyrics Editor** with sections (Verse 1, Pre-Chorus, Chorus, Verse 2, Bridge, Outro), each line color-coded to its author (left bar + dot + colored author metadata)
- **Session Timeline** — every event (session_created, collaborator_joined, lyric_line, identifier_generated…) with color-coded glow
- **Completion panel** — 11-step checklist (lyrics → release) with click-to-cycle status and a circular progress ring
- **SONGRIGHT Intelligence™** — Claude Sonnet 4.5-powered analysis: hit potential, commercial readiness, genre confidence, writing consistency, harmony suggestions, next task
- **Session Chat** — REST-polled messages with per-user colored avatars
- **Metrics tab** — Words, Characters, Sections, Versions, Studio Hours, Collaborators, Voice Notes, Files, Events, Contribs, Messages, Completion% + activity line chart
- **Rights & Publishing Locker tab** — Identifiers (ISRC/UPC/EAN/ISWC/Song ID) with server-side generators, Writers table, PROs (ASCAP/BMI/SESAC/SOCAN/PRS/GMR) with register flow, DSPs (Spotify/Apple/Amazon/YouTube/TikTok/Pandora/TIDAL/Deezer/Qobuz) with connect toggle, Copyright document generators, and a large **Release Readiness circular score** with gated Publish button

## Phase 2 Product Expansion (2026-02-07 — v1.2)
Delivered as polished vertical slices:

- **Creative Command Center (12 tabs)** — Overview, Lyrics, Melody, Chords, Arrangement, Voice Memos, Files, Collaborators, Chat, Rights, Publishing, Analytics
- **Overview tab**: Song Journey roadmap (10 milestones: Idea → Royalties) + Collaborators & donut charts + **Interactive Ownership Dashboard** with 6 lenses (Lyrics/Composition/Publishing/Master/Producer/Performance) + Session Timeline + Completion + AI Insights + Chat
- **Chords tab**: Auto-suggested progression based on song key with Roman numerals
- **Arrangement tab**: 10-section structure timeline with line-count per section
- **Collaborators tab**: Room grid (color-coded cards linking to Creator Passport) + **Global Collaboration Map** with animated SVG world grid, glowing nodes, connecting lines, city labels
- **Publishing Command Center**: 15-item command grid (ISRC/UPC/EAN/ISWC/Song ID/IPI/Publisher/PRO/Copyright/Mechanical/Neighboring/Metadata/DSP/Artwork/Marketing) + Release Calendar with 4-step path-to-release
- **Song DNA™** at `/sessions/:id/dna`: Immutable permanent history. Signature card (event count, version, session id). Filter chips per event type. Day-grouped timeline with 13 event types (Song Created, Voice Memo, Lyric Written, Melody, Arrangement, Collaborator Joined, Contribution, Split Modified, Version Saved, Identifier Generated, Publishing Submitted, DSP Delivered, Released, Royalty)
- **Creator Passport™** at `/creator/:user_id`: Public creator profile. Hero with photo/verified badge. Disciplines/Instruments/Genres. 4 stat cards. Tabs (Discography, Timeline, Team, Publishing). Discography grid links to each song.
- **Release Dashboard** at `/sessions/:id/release`: Total streams w/ growth signal. Performance/Mechanical/Sync/Neighboring revenue. Streaming line chart (30d). DSP share bars. Top cities bar chart. Playlists/Radio/TikTok/Shazam signals with growth call-out.

Backend added: `/creators/:id/discography`, `/creators/:id/timeline` endpoints.

## Test Credentials
- `test@songright.com` / `Test1234!` (auto-seeded on backend startup)

## Song Intelligence Report™ (2026-02-07 — v1.3)
Delivered at `/sessions/:id/intelligence` with public share links at `/report/:token`.

- **Cover page**: Big song title, 8-field metadata grid (Genre/Key/Tempo/Time Sig/Language/Mood/Duration/Explicit), 6 verification badges (Song DNA™/RightPrint™/Ownership/Publishing/ISRC/ISWC), circular Release Readiness score, event/line/word stats
- **Executive Summary** (Claude Sonnet 4.5): AI-generated ~250-word briefing + Release Recommendation ("HOLD/RELEASE" verdict) + scoreboard bars (Commercial/Streaming/Sync/Playlist potential)
- **Creative Team**: Verified contributor cards linking to Creator Passport, with lines/contribs/weight stats
- **Creative Journey**: Song Journey (10 milestones) + Milestone Contributors + Session Signature
- **Creative Evidence™** (the differentiator): Per-contributor big-stat cards (Lyric lines, Sections touched, Revisions, Contributions), section chips, contribution role counts, sample lines. Clear disclaimer that SONGRIGHT does not auto-determine ownership.
- **Ownership Summary**: 6-lens interactive dashboard
- **Publishing Package**: 15-item verification grid (ISRC/UPC/EAN/ISWC/Song ID/IPI/Publisher/PRO/Copyright/Mechanical/Neighboring/Metadata/Artwork/DSP/Marketing)
- **Commercial Readiness**: 7-axis radar chart (Streaming/Sync/Playlist/Radio/Global/Longevity/Audience) + Strengths + Improvements + Comparable records
- **Audience Intelligence** (Claude): Primary/Secondary audience, Top countries, Top cities, Priority DSPs with playlist references, Festival opportunities, Brand partnerships
- **Financial Forecast**: 8 revenue cards (Yr 1 streaming/publishing/performance/mechanical/neighboring/sync + 5yr/10yr projections) + 10-year revenue trajectory chart
- **Release Center**: 9-step go-to-market blueprint
- **Share dialog**: Audience-typed share links (label/publisher/manager/attorney/investor/sync), password protection, 30-day expiry, copy-to-clipboard
- **Public view-only report** at `/report/:token` — password gated, works without auth, safe for external stakeholders

Backend: `POST /sessions/:id/intelligence` (AI Claude Sonnet 4.5 + rule-based fallback), `POST /sessions/:id/share`, `GET /report/:token`.

## Connected Services & Integrations (2026-02-07 — v1.4)
Route: `/settings/integrations`. Widget on Studio Overview right rail.

- **90 integrations across 13 categories**: First-Party (ANCRLAB™, ANCRWAV™, CCDP™), Identity (Google/Apple/Microsoft/GitHub/LinkedIn/Magic Link/2FA/Passkeys), Cloud Storage (Google Drive/Dropbox/OneDrive/Box/iCloud/S3/Object Storage), Music Creation (10 DAWs: Ableton/Logic/Pro Tools/FL Studio/Cubase/Studio One/Reason/Reaper/BandLab/Soundtrap), Distribution (10 distributors: DistroKid/TuneCore/CD Baby/UnitedMasters/Symphonic/Too Lost/Stem/ONErpm/Orchard/AWAL), Streaming (10 DSPs: Spotify/Apple/Amazon/YouTube/TIDAL/Pandora/Deezer/Qobuz/Audiomack/Boomplay), PROs (8: ASCAP/BMI/SESAC/SOCAN/PRS/APRA AMCOS/SACEM/GMR), Publishing (7: Songtrust/Sentric/Kobalt/Downtown/Sony/UMPG/Warner Chappell), Rights (6: MLC/SoundExchange/Music Reports/ISRC Reg/UPC Services/DDEX), Finance (7: Vaulta/Stripe/PayPal/QuickBooks/Xero/Plaid/Square), Communication (6: Slack/Teams/Zoom/Google Meet/Discord/WhatsApp), Calendar (Google/Outlook/Apple), AI Providers (OpenAI/Anthropic/Gemini/Perplexity/Custom).
- Full permissions-based model: each service has its own permission list. Every permission is individually toggleable.
- Real backend persistence: `GET/PATCH /api/integrations` with `user_integrations` collection storing connection state, granted permissions, last_sync, audit_log (30 events retained).
- Search + 13-category filter chips.
- Manage dialog: connection status card, last sync, permission count, individual permission toggles, Data Sharing Summary, Activity History (audit log), Connect/Disconnect/Re-sync buttons.
- Studio Overview: right-rail widget showing X/90 active connections + 8 highlighted brand tiles.
- Profile page: CTA linking to Connected Services.

## Release Candidate 1 — Sign-Off (2026-02-07 — v1.5-rc1)

**Status:** ✅ READY FOR PUBLIC BETA

Feature freeze in effect. RC1 production readiness pass completed and validated by the frontend testing agent (iteration_3.json).

### Issues Fixed in RC1
- **P1 — Clipboard crash on Song Intelligence Share dialog**: `navigator.clipboard.writeText` was surfacing an uncaught `NotAllowedError` in preview/headless environments. Introduced `/app/frontend/src/lib/clipboard.js` (`copyToClipboard()` helper with textarea/`execCommand` fallback returning `{ok}`) and rewired all 5 call sites (SongIntelligence share dialog, SongIntelligence link Copy button, StudioSession invite Copy, StudioSession share-link Copy, SessionDetail invite Copy).
- **P1 — Dead sidebar links in Studio workspace**: Removed 5 non-navigable placeholder items (Collaborators, Rights Center, Publishing, Analytics, Templates — all duplicates of top-level Studio tabs). Sidebar now has 9 real routes: Dashboard, Songs, Studio, Song DNA, Release, Intelligence, Vaulta, Integrations, Settings.
- **P2 — New session redirect**: `NewSession.jsx` now navigates to `/sessions/:id/studio` after creation (workspace-first), instead of the older session-detail page.
- **RC1 polish**: Webpack ESLint clean (0 warnings, 1 targeted `react-hooks/exhaustive-deps` suppression documented). ARIA labels on interactive icon buttons. ErrorBoundary catches component failures without white-screen. Mobile Studio sidebar toggle with hamburger.

### Known Non-Blocking Limitations (documented for post-RC1)
- Mobile Studio tab-strip reports 527px `scrollWidth` at 375px viewport. The container is already `overflow-x-auto`; visual scroll is contained and the layout is legible. Follow-up: wrap in `max-w-full` clipping.
- `StudioSession.jsx` remains 1635 lines. Not a functional issue; refactor into `/components/studio/*` deferred to v1.6.
- Connected Services OAuth flows are UI/state-only. Real 3rd-party OAuth is deferred to post-beta (P0 backlog).
- Server-side PDF generation for split sheets is deferred (browser print works).

### Test Report Ledger
- `/app/test_reports/iteration_1.json` — initial full-app pass
- `/app/test_reports/iteration_2.json` — first RC1 pass (3 findings)
- `/app/test_reports/iteration_3.json` — RC1 retest, 0 uncaught page errors, all fixes verified

### Post-RC1 Focus (per user direction — no new builds)
1. User testing with songwriters/producers/publishers/A&R
2. Product deck + demo video
3. Landing page + waitlist
4. Design-partner / pilot conversations


## INHEIRA™ Rebrand (2026-02-07 — v2.0)

Complete visual + messaging evolution from SONGRIGHT™ → INHEIRA™. All routes, backend endpoints, database schemas, and workflows preserved — this is a brand-layer refresh, not a rebuild.

### Positioning shift
- **Old:** operating system for songwriting, creative ownership, publishing, collaboration, and rights management. Tagline: "Write. Own. Protect."
- **New:** the operating system for **creative ownership and legacy**. Positioned across Creation → Documentation → Ownership → Evidence → Publishing → Protection → Commercial Intelligence → Legacy. Tagline: **"From Creation to Legacy."** Belief line: **"Where Creativity Becomes Legacy."**

### Visual system
- Palette: midnight navy `#04040a` → pure black hero, cool cobalt (`sky-200`, `blue-300`), soft indigo (`indigo-100`, `indigo-300`), platinum lavender (`violet-200`), platinum white typography. Gold/amber removed.
- Tailwind sweep: every `amber-*` class replaced with `violet-*`; every raw `#F59E0B`/`#FBBF24`/`#D97706` swapped for the softer violet palette; `rgba(245,158,11,*)` → `rgba(139,92,246,*)`.
- New INHEIRA logo asset (`4ga63df1_ChatGPT Image Jul 6, 2026, 07_50_48 PM.png`) with celestial arc, stylized N monogram, and wordmark.
- Logo rendering: `mask-image` radial gradient feathers the PNG's black background into the page — the logo floats without a visible rectangle.
- Hero: near-empty, headline-first (belief becomes emotional entry point), then the logo demoted below the message, then one supporting sentence, then CTAs, then "Powered by ANCR™". A single intentional star as the "creative spark" replaces the earlier scattered starfield.

### Copy changes
- Landing hero H1: **Where Creativity / Becomes Legacy.**
- Landing supporting: "Every idea. Every collaborator. Every contribution. Documented from creation to ownership, publishing, release, and legacy."
- Story section under `#story`: full "belief" narrative from user brief.
- Primary CTA: `Begin Creating` (was `Claim your RightPrint` / `Start with SONGRIGHT`).
- Auth left panel: "Where creativity / becomes / **legacy.**" replacing "Write. Own. Protect."
- SplitSheet footer, Nav CTA, Landing footer, ErrorBoundary, App.js NotFound, Dashboard highlight, SessionDetail toast, PublicReport footer — all now read INHEIRA.

### Preserved feature names (per brief)
Song DNA™, Song Intelligence™, Creator Passport™, RightPrint™, Creative Evidence™, Vaulta™, ANCRLAB™, ANCRWAV™, ANCR™, CCDP™ — untouched.

### Product metadata
- `<title>` → `INHEIRA™ — From Creation to Legacy`
- Favicon + apple-touch-icon → INHEIRA logo asset URL
- OpenGraph + Twitter meta tags → INHEIRA branded (image, title, description)
- `public/manifest.json` rewritten with INHEIRA short_name + icons + theme_color `#04040a`

### Not user-visible (intentionally left)
- `localStorage.getItem('songright_token')` — renaming would sign every existing user out. Internal key only.
- `test@songright.com` seed account — kept for test continuity (documented in `test_credentials.md`).
- `src/constants/testIds/songright.js` — module filename is a test-automation identifier, not visible to users.

### Files touched (highlights)
- `frontend/src/components/BrandLogos.jsx` — renamed to `InheiraMark` with feathered mask
- `frontend/src/pages/Landing.jsx` — new belief-first hero + Story section + CTA rewrite
- `frontend/src/pages/AuthPage.jsx` — new welcome + gradient headline
- `frontend/src/components/Nav.jsx` — CTA label
- `frontend/public/index.html` — title, meta, OG, favicon
- `frontend/public/manifest.json` — created fresh with INHEIRA identity
- Global sed across `src/**/*.{js,jsx}` (excluding shadcn UI) — amber→violet + SONGRIGHT→INHEIRA


## Homepage Documentary Rebuild (2026-02-07 — v2.1)

Restructured the landing page to feel 50% premium software · 50% music documentary per user brief. Removed the previous enterprise "features grid / how-it-works / built-for" structure and replaced with 9 storytelling sections that alternate real INHEIRA product mockups with editorial cinematic photography.

### New homepage flow
1. **Hero** — celestial, minimal (kept from v2.0 refinement pass)
2. **The Belief** — narrative intro (kept, condensed context)
3. **The Studio** — full INHEIRA workspace mockup: live session bar, color-coded collaborators (Danielle/Cam/Jimmie in pink/indigo/sky), color-coded lyric lines, split donut (50/40/10), session timeline, voice memo scrubber, chat message, progress bars. Headline: "Every great creation begins differently."
4. **The Creative Moment** — full-width cinematic piano photo. Headline: "Where ideas become records."
5. **Writing Camps** — horizontal-scroll card set for Chicago · Atlanta · Nashville · Los Angeles · London · Accra · Lagos · Kingston · Tokyo. Footer: "Built inside INHEIRA."
6. **Studio Sessions** — 4-photo cinematic strip (Producer/Console, Vocal/Tracking, Beat/MPC, Guitar/Late Night). Headline: "From the first idea to the final mix."
7. **Creative Evidence™** — Danielle/Cam/Jimmie ownership bars + locked lyrics with per-line color highlights and creator initials on the right. "Immutable" badge. Headline: "Every contribution becomes evidence."
8. **Creator Passport™** — full profile mockup: hero band with lyric-writing photo, avatar with verified badge, 4 stat cards (Songs 47, Collaborators 128, Publishing Songtrust, Verified Since 2023), recent discography list.
9. **Intelligence Layer** — Song Intelligence™ dashboard mockup: 87/72/64 scores (Commercial / Release Ready / Sync), Priority DSP + Top Audience + 10Y Forecast + Publishing cells, executive summary paragraph.
10. **Publishing Command Center** — Release Readiness 83% progress bar + 12-item grid (ISRC/UPC/ISWC/IPI/Publisher/PRO/Mechanical/Copyright/Metadata/Artwork/DSPs/Marketing) + "Publish when ready" CTA.
11. **Legacy** — full-viewport cinematic image ("MUSIC IS LIFE" neon), gradient headline "What you create today should still matter tomorrow.", Begin Creating CTA + Powered by ANCR™.
12. **Powered by ANCR** section + Footer (kept from v2.0).

### Product mockups (built entirely in React, no external images)
All mockup sections are fully composed React components — real, styled INHEIRA UI that visitors can trust reflects the actual product. `StudioMockupCard`, `SplitDonut` (SVG donut with per-collaborator arcs), `LyricLine`, `TimelineEvent`, `ProgressRow`, `PassportStat`, `ScoreCell`, `IntelStat`, `PublishingCell` — all defined in-file under Landing.jsx.

### Photography strategy (placeholder-quality)
- Curated dark-editorial Unsplash imagery selected for documentary tone (piano, mixing console, vocal booth, MPC, guitar in low light, neon "MUSIC IS LIFE", city aerials for camps).
- **All images marked as placeholders in-code with a TODO comment** — commissioned photography should replace these before public launch. Recommended shoots: writing camps in Nashville/Lagos/Tokyo, real session captures, multi-generational creator portraits, A24-style cinematography.

### Copy highlights
- Section headlines are punchy and belief-driven, not feature-driven.
- Removed the generic feature grid and "how-it-works" 4-step marketing pattern.
- Every section has a documentary-style monospaced small caption ("/ 03 · THE CREATIVE MOMENT") that reinforces the editorial tone.

### Non-functional guarantees
- All routes, APIs, database schemas, and authenticated flows untouched.
- Webpack compiles clean, ESLint clean.
- Studio workspace, Song Intelligence, Publishing, Creator Passport all still work exactly as before — the homepage just now previews them accurately.

### Post-launch content follow-ups
- Commission the 9 writing-camp shoots.
- Commission the 4 studio sessions strip (producer, vocal, MPC, guitar).
- Commission the Legacy multi-generation portrait.
- Update `Landing.jsx` image constants (`IMG_STUDIO_CONSOLE`, `IMG_PIANO_SESSION`, `IMG_LYRIC_WRITING`, `IMG_VOCAL_BOOTH`, `IMG_GUITAR_LATE`, `IMG_MPC_HANDS`, `IMG_LEGACY_PORTRAIT`, `CAMPS[*].img`) to point at commissioned assets.


## Homepage Cinematic Chapter Pass (2026-02-07 — v2.2)

Reframed the homepage from a documentary tour into a **film-style chapter arc** — every section now answers a specific question about the life of a song. Removed the long belief poem and replaced it with a single manifesto line. Added the flagship **Life of a Song** timeline section.

### Chapter arc (each section = one question)
- **A Belief** (manifesto pause): *Technology should never replace the artist. It should remove every obstacle between the artist and their work.* Full-bleed centered pause between the hero and the product story.
- **Chapter I · Where do ideas begin?** — The Studio
- **Chapter II · The Moment / When ideas come alive** — Where ideas become records (cinematic)
- **Chapter III · Who creates with me?** — Writing Camps · Worldwide
- **Chapter IV · How does a song become itself?** — Sessions
- **Chapter V · How do we protect it?** — Creative Evidence™
- **Chapter VI · Who are you, as a creator?** — Creator Passport™
- **Chapter VII · How do we understand it?** — Song Intelligence™
- **Chapter VIII · How do we release it?** — Publishing
- **Chapter IX · What is the life of a song?** — **Life of a Song** (new flagship section)
- **Chapter X · How does it outlive us?** — Legacy

### Chapter IX — Life of a Song (new)
A vertical timeline with glowing-node spine and alternating left/right cards, walking through the ten stages of one real record:
1. **11:42 PM · Chicago · Bedroom** — A voice memo.
2. **The next morning · Zoom · Nashville / LA** — Lyrics.
3. **Three days later · Studio · Atlanta** — A room full of creators.
4. **Week two · The mix room** — Mix. Master.
5. **Before release · INHEIRA Intelligence™** — Understood.
6. **Release day · 10 DSPs · Worldwide** — Published.
7. **Month one · Spotify Editorial** — Playlisted.
8. **Year one · Global** — 100 million streams.
9. **Two years later · The Grammys** — Song of the Year.
10. **Forever · INHEIRA Vaulta™** — Legacy.

Headline: *One song. Every step. Preserved.* This section explains **the life of a song**, not a feature list — as the user framed it, "not explaining software. Explaining a song's life."

### Language / positioning
- Every "mockup"-adjacent phrasing removed from user-visible copy — sections are now labeled simply *The Studio, Creator Passport, Song Intelligence, Publishing*.
- Each chapter header shows CHAPTER {N} · QUESTION as the primary eyebrow line, with the product name as a secondary subtitle. Film-title-sequence rhythm.

### Files touched
- `frontend/src/pages/Landing.jsx` — belief section replaced with manifesto pause; all 9 chapter headers rewritten with question framing; new `LifeOfASongSection` + `SongLifeStep` components + `SONG_LIFE` step data (~130 new lines).

### Deferred (with user acknowledgment)
- **Demo Mode** — `/demo` public read-only session preview so visitors can explore a real Studio + Song Intelligence + Publishing without signing up. Confirmed as the top-priority next feature build. Not tackled in this pass to keep the current session focused on homepage narrative.
- Commissioned photography for camps / sessions / legacy portrait — still on the follow-up list. Placeholders documented in `Landing.jsx` header comment.


## Engineering Docs Delivered (2026-02-07)

Two production engineering documents shipped for the CTO / future engineers:

- **`/app/docs/INHEIRA_Technical_Specification_v1.0.md`** — 16-section production spec covering executive overview, PRD, technical architecture, database schema, API documentation, UI spec, component inventory, business rules, ANCR ecosystem integration, security, testing, deployment, readiness checklist, engineering roadmap, ADRs, and CTO handoff notes.
- **`/app/docs/INHEIRA_Creative_Evidence_Intelligence_Spec_v1.0.md`** — canonical spec for **Creative Evidence Intelligence™** (CEI). Human-first documentation & evidence system built on the Creator First™ philosophy. Preserves how songs evolve through collaboration by documenting who contributed what, when, and how the song changed. Every version is immutable Creative Evidence™; original human artifacts (audio, MIDI, DAW files) are always preserved unaltered. The Creative Comparison Engine™ classifies changes as retained · added · modified · replaced · reharmonized · rearranged · expanded · removed; Musical Idea Analysis™ evaluates melody, harmony, rhythm, arrangement, motifs, and phrase structure (not just note counts). Three-phase roadmap: structured-input (8–10 wks) → performance-derived audio/stems (5–6 mos) → real-time + cross-session. Enforces strict Documented Creative Contribution vs Agreed Legal Ownership separation. Supersedes the earlier "Musical Contribution Intelligence™" draft, which has been retired.

### Feature backlog (updated priority)
| P | Feature | Status |
|---|---|---|
| P0 | Demo Mode — public read-only `/demo` session | Spec pending; agreed as next build (Session 4) |
| P0 | Creative Evidence Intelligence™ · Phase 1 (structured input: MusicXML · MIDI · sheet music · lead sheet · chord chart · tab · DAW export) | Full canonical spec shipped in `/app/docs`; awaiting build kickoff |
| P1 | Rate limiting + Sentry-style error monitoring | Pending |
| P1 | Backend unit test suite in `/app/backend/tests` | Pending |
| P1 | Split `StudioSession.jsx` into `/components/studio/*` | Pending |
| P2 | Commissioned photography swap on Landing | Pending |
| P2 | Chapter-reveal scroll animations on Landing | Pending |
| P3 | Creative Evidence Intelligence™ · Phase 2 (performance-derived: audio · stems · live studio) | Spec-only; 5–6 month research + engineering effort |
| P3 | Creative Evidence Intelligence™ · Phase 3 (cross-session attribution · real-time · streaming Session Intelligence™) | Spec-only |


## ANCR Ecosystem Architecture — Master Doc Shipped (2026-02-07)

`/app/docs/ANCR_Ecosystem_Architecture_v1.0.md` — the canonical platform-architecture reference for the entire ANCR ecosystem. 18 sections. Establishes:

- System-of-record ownership matrix for every module (ANCRID, INHEIRA, ANCRA, ANCRLAB, ANCRSYNC, Vaulta, COHEIR, ANCRMEDIA, ANCRLaunch, CCDP).
- Reference model — cross-module data always flows by canonical ID, never by copy.
- Federated identity (ANCRID · OIDC · RS256 JWTs).
- Async event bus (ANCRA · Kafka-compatible · canonical event catalog).
- Creative Evidence™ flow — CEI ledger lives only in INHEIRA; all downstream modules reference by `session_id`/`song_id`/`ledger_entry_id`.
- Legal firewall as an ecosystem-wide invariant (Documented Creative Contribution ≠ Agreed Legal Ownership).
- PII-per-module isolation policy (SOC 2 / PCI / GDPR posture).
- **10 architectural conflicts** discovered with the current INHEIRA implementation, all documented with resolution paths — none blocking Demo Mode or CEI Phase 1.

CEI spec updated with the canonical Baseline Clarification callout (§2.1) — must appear on every UI surface that shows a 100% baseline.

### Engineering doc set now complete
- `/app/docs/INHEIRA_Technical_Specification_v1.0.md`
- `/app/docs/INHEIRA_Creative_Evidence_Intelligence_Spec_v1.0.md`
- `/app/docs/ANCR_Ecosystem_Architecture_v1.0.md`

Next: pause for user review of the architecture summary + conflicts, then proceed to Demo Mode build, then CEI Phase 1.


## Creative Provenance™ — Platform Principle Codified (2026-02-07)

`/app/docs/ANCR_Creative_Provenance_Platform_Spec_v1.0.md` — new canonical specification establishing Creative Provenance™ as a permanent ecosystem-wide **architectural principle**, not a feature or module.

- Distinction locked in: **Creative Evidence™ records events; Creative Provenance™ connects every event into one continuously verifiable history.**
- Every current and future ANCR module inherits the obligation to publish provenance nodes and consume provenance references.
- Provenance node schema, `/api/provenance/*` service surface, module-by-module publishing + consumption responsibilities, AI responsibilities (documents/connects/indexes — never invents), legal principle (documents who/what/when — does not determine ownership/copyright/royalties), and 4-phase implementation plan (Phase 0 inside INHEIRA → Phase 1 platform extraction → Phase 2 cross-module publishing → Phase 3 provenance-driven visualizations).
- Ecosystem doc updated: new §8A codifies the principle, plus **ADR-E9** (inheritance by every module) and **ADR-E10** (append-only graph, ecosystem-wide).
- CEI + INHEIRA specs updated with cross-references. CEI is INHEIRA's canonical implementation of Creative Provenance™ for songwriting and musical works.
- `/app/docs/README.md` created — engineering docs index with reading order and doc-relationship diagram for new engineer onboarding.

### Current engineering doc set (5 documents)
1. `ANCR_Ecosystem_Architecture_v1.0.md`
2. `ANCR_Creative_Provenance_Platform_Spec_v1.0.md`
3. `INHEIRA_Technical_Specification_v1.0.md`
4. `INHEIRA_Creative_Evidence_Intelligence_Spec_v1.0.md`
5. `README.md`

### Implementation impact on the queued plan
- **Demo Mode** (next build) is unaffected — no provenance publishing required for a read-only public preview.
- **CEI Phase 1** now MUST publish Creative Provenance™ nodes at every write inside INHEIRA (part of Phase 0 of the Creative Provenance rollout). Adds a `provenance_nodes` collection inside INHEIRA's DB and thin wrapper functions. Zero new external dependencies at Phase 0.


## Creator DNA™ — Third Platform Principle Codified (2026-02-07)

`/app/docs/ANCR_Creator_DNA_Platform_Spec_v1.0.md` — canonical spec establishing **Creator DNA™** as the third layer of the ANCR platform stack.

**The three-layer stack, now complete:**
- **Creative Evidence™** records events (per event)
- **Creative Provenance™** connects events into immutable chains (per artifact)
- **Creator DNA™** connects every provenance chain into the lifelong story of the creator (per creator, per lifetime)

Creator DNA™ answers: *"Who has this creator become over the course of their creative life?"*

### What the spec establishes
- Creator DNA™ is **derived** from Creative Provenance™. No module owns it. No module queries raw application data to enrich it. DNA subscribes to `provenance.node.created` events via ANCRA.
- **Ten growth dimensions:** Creative, Technical, Leadership, Business, Educational, Commercial, Collaboration, Innovation, Mentorship, Legacy. Absolute trajectories — never rankings.
- **Creator Relationship Graph™:** every documented relationship (Mentored By, Collaborated With, Produced By, Published By, Inspired, Student Of, Faculty, etc.) is backed by a Provenance node. No evidence, no relationship.
- **Data model:** three append-only derived collections (`creator_dna_projections`, `creator_relationships`, `creator_timeline_entries`). Fully recomputable from Provenance.
- **API surface:** `/api/creator-dna/*` — full DNA read, timeline, dimensions, relationships, per-pair edges, natural-language search, rebuild (admin), export, audit.
- **Privacy controls:** per-milestone visibility (public/industry/private), per-relationship hiding, contested-edge flagging, GDPR anonymization (never deletion).
- **AI rules:** may document/connect/index/summarize/visualize; may never invent history, relationships, collaborations, influence, or ownership. Confidence < 0.5 forces human review.
- **Legal firewall:** DNA does not determine ownership, royalties, contracts, or a creator's "value." The platform never publishes rankings.
- **4-phase rollout:** Phase 0 inside INHEIRA (Creator Passport becomes the first DNA UI) → Phase 1 platform extraction → Phase 2 cross-module enrichment → Phase 3 natural-language search + public visualization.

### Ecosystem doc updated
- New §8B codifies the three-layer stack + Creator DNA principle inline.
- **ADR-E11** added: Creator DNA™ is a derived view over Creative Provenance™, inherited by every module. Deterministic algorithms, no per-module DNA store.
- Companion-doc list at top of ecosystem doc now includes Creator DNA spec.

### README.md updated (docs index)
Now reflects the complete three-layer stack with a canonical table and relationship diagram. Reading order for new engineers: Ecosystem → Provenance → Creator DNA → INHEIRA → CEI.

### Impact on the queued plan
- **Demo Mode** (next build) — unaffected. Read-only preview needs no DNA computation.
- **CEI Phase 1** — will publish Provenance nodes at every write (already planned). Creator DNA Phase 0 rides for free: the same nodes automatically enrich local DNA collections inside INHEIRA. The existing **Creator Passport™** page becomes the Phase-0 DNA UI with **no data migration** — the passport is already a projection of Song DNA™ events, which will now be Provenance nodes.
- Zero new external dependencies at Phase 0 for either Provenance or DNA.

### Current engineering doc set (6 documents in `/app/docs/`)
1. `README.md`
2. `ANCR_Ecosystem_Architecture_v1.0.md`
3. `ANCR_Creative_Provenance_Platform_Spec_v1.0.md`
4. `ANCR_Creator_DNA_Platform_Spec_v1.0.md`
5. `INHEIRA_Technical_Specification_v1.0.md`
6. `INHEIRA_Creative_Evidence_Intelligence_Spec_v1.0.md`


## Creative Interpretation Framework™ — Final Canonical Spec (2026-02-07)

`/app/docs/INHEIRA_Creative_Interpretation_Framework_Spec_v1.0.md` — the **final** canonical specification of the design phase. CIF is the philosophy layer over every data layer, enforced as an executable shared service.

### The complete four-layer platform stack

| Layer | Purpose | Grain |
|---|---|---|
| Creative Evidence™ | Records events | Per event |
| Creative Provenance™ | Connects events into immutable chains | Per artifact |
| Creator DNA™ | Connects chains into lifetime creator stories | Per creator |
| **Creative Interpretation Framework™** | Governs how any of the above is interpreted and rendered to a human | Every render path, ecosystem-wide |

### The Ten Principles (executable, non-bypassable)
1. Document Before Interpretation
2. Separate Evidence from Interpretation
3. Creative Influence™ (qualitative, never a percentage)
4. Contribution Classification™ (fixed vocabulary, never overwritten)
5. Evidence Confidence™ (High / Medium / Low / Unknown)
6. Creative Intent™ (only when the contributor supplies it — never inferred)
7. Creative Narratives™ (grounded LLM only, cites `provenance_id`)
8. Preserve Rejected Creativity™
9. Human Review Always Wins™ (Original + Human Decisions + Final Agreement — all preserved)
10. Legal Firewall™ (no ownership statements, no split-as-fact, ever)

### API surface
`/api/cif/*` — `interpret` · `narrative` · `classify` · `confidence` · `validate` (firewall) · `decisions` · `interpretations`. `POST /cif/validate` is called by every module before every user-facing render of creative evidence. New modules cannot ship to production without a signed CIF Integration Checklist.

### Ecosystem doc updated
- New §8C codifies the philosophy layer inline in the master architecture doc.
- **ADR-E12** added: CIF governs every render of creative evidence. Non-bypassable.

### `/app/docs/README.md` refreshed
Complete four-layer stack + all 12 ecosystem ADRs listed + design phase declared closed.

### Design phase status: CLOSED
Per the user's explicit direction: *"That is a complete conceptual architecture. From here, the greatest value will come from building and refining these systems rather than introducing additional foundational concepts."*

### Current engineering doc set (7 documents in `/app/docs/`)
1. `README.md`
2. `ANCR_Ecosystem_Architecture_v1.0.md`
3. `ANCR_Creative_Provenance_Platform_Spec_v1.0.md`
4. `ANCR_Creator_DNA_Platform_Spec_v1.0.md`
5. `INHEIRA_Creative_Interpretation_Framework_Spec_v1.0.md`
6. `INHEIRA_Technical_Specification_v1.0.md`
7. `INHEIRA_Creative_Evidence_Intelligence_Spec_v1.0.md`

### From here — execution only
1. **Demo Mode** — public read-only `/demo` session for design-partner conversations.
2. **CEI Phase 1 + Provenance Phase 0 + Creator DNA Phase 0 + CIF Phase 0** — all four rides on the same write paths inside INHEIRA, no external dependencies at Phase 0.
3. **Platform extraction** — when the second module (Vaulta or ANCRID) ships, the shared services (Provenance, DNA, CIF) migrate out of INHEIRA into the platform layer.

## Phase 1 — Creator Home & Global Shell (2026-02-07 — v2.3)

Kickoff of the Experience Integration mandate: *the inside of INHEIRA must feel like the public website — no new features, only unification.*

### What shipped
- **Dashboard rewritten as "Creator Home"** — chapter-based, cinematic, mirrors Landing's aesthetic (black-first, gradient text headlines, `/ CHAPTER · EYEBROW` monospace labels).
- **Six chapter sections**, each surfacing a previously buried capability:
  - **Chapter I · Life of a Song™** — 10-stage spine with every active song plotted (Idea → Legacy) with color-coded collaborator avatars and stage progress bar.
  - **Chapter II · Writing Rooms · Live now** — 4 rooms surfaced center-stage from Dashboard (previously buried under `/writing-rooms`).
  - **Chapter III · Active Sessions** — cinematic session cards with Life of a Song mini-bar per song, identity-color collaborator chips.
  - **Chapter IV · Creative Evidence™ · Live feed** + **Song Intelligence™ Pulse** — evidence surfaced platform-wide (not just inside the Intelligence report), pulse aggregated across active sessions.
  - **Chapter V · Creator Passport™** + **Continuous Release Path** — passport preview with 4 stats + identity-color hero, release path with 5 steps (Rights → Split Sheet → Publishing → Vaulta → Release).
  - **Chapter VI · Finalized works** — cinematic catalog.
- **Nav updated** — added first-class `Passport` link (`/creator/:user_id`); renamed Dashboard→Home, Writing Rooms→Rooms for cleaner rhythm.
- **Persistent identity colors** — `colorForAncrId` now applied on every collaborator surface across Dashboard.

### Fixed during smoke test
- `NaN%` on Life of a Song progress bars (sessions without `completion` field).
- `NaN` in Song Intelligence Pulse aggregation.

### Test IDs preserved
- `DASHBOARD.root`, `DASHBOARD.createSessionBtn`, `DASHBOARD.activeSessions`, `DASHBOARD.catalog`, `DASHBOARD.rightprint`, `DASHBOARD.royaltyCard` — all still present for regression tests.

### Files touched
- `frontend/src/pages/Dashboard.jsx` — full rewrite (~630 lines)
- `frontend/src/components/Nav.jsx` — added Passport link, renamed labels

### Awaiting user sign-off before Phase 2 begins
Phase 2 target: **Studio Session as One Continuous Studio** — chapter-flow layout, persistent Creative Evidence rail, inline Song Intelligence widget, Life of a Song spine, persistent identity colors on all session surfaces.


## Phase 2 — Studio Session as One Continuous Studio (2026-02-07 — v2.4)

**Approved direction.** Every session now feels like walking into a premium recording studio, not navigating software. Zero functionality removed — every one of the 12 existing tabs preserved, just visually and organizationally unified.

### What shipped

**Cinematic Chapter-style TopBar** (replaces the old flat top strip):
- Black-first backdrop with dual radial glow (indigo + sky) mirroring Landing/Creator Home
- `STUDIO SESSION · LIVE` eyebrow with pulsing emerald dot + monospaced session ID + `STAGE XX · <name>` from Life of a Song™
- Gradient headline (white → indigo-100 → violet-200) — matches Landing hero
- Meta chips + "Edit meta" link
- **Persistent identity-color collaborator strip** — up to 6 avatars with each collaborator's identity color + count ("N creators in the room")
- Action buttons: Invite, Share, Intelligence Report™, Export, Publish — all preserved with same testids
- **Persistent Life of a Song™ spine** — 10-node visual timeline shown at the bottom of the top bar; current stage lit up in white, past stages in indigo, future stages dimmed

**Two-tier Chapter Nav** (replaces the 12-tab flat list):
- **Tier 1 — Chapters**: `/ CHAPTERS  01 IDEA  02 WRITE  03 RECORD  04 COLLABORATE  05 RELEASE`. Clicking a chapter jumps to its first tab.
- **Tier 2 — Sub-tabs**: shows only the current chapter's tabs (Write chapter → Lyrics/Melody/Chords/Arrangement, Release chapter → Rights/Publishing/Analytics, etc.). Every `TabsTrigger` testid preserved (`CCC.lyrics`, `STUDIO.tabRights`, etc.).
- Chapter buttons carry `data-testid="studio-chapter-{key}"` for testing.

**Persistent Session Pulse Rail** (new — visible on every tab):
- **Song Intelligence™** chips: Commercial · Release · Sync — small numeric + gradient mini-bar
- **Creative Evidence™** rolling strip: last 3 session events shown as color-coded chips (identity color + event kind + label preview)
- Runs on the same 10-second polling as the rest of the Studio

### Shared lifecycle library (extracted for DRY)
- `frontend/src/lib/lifeOfSong.js` — `LIFE_STAGES` (10-stage arc), `STUDIO_CHAPTERS` (5-chapter mapping), `inferSessionStage(s)`, `chapterForTab(tab)`, `stageMeta(idx)`. Used by both Dashboard (Creator Home) and StudioSession — the two surfaces now share one source of truth for a song's lifecycle.

### Files touched
- `frontend/src/pages/StudioSession.jsx` — TopBar rewrite + ChapterNav + SessionPulseRail + LifeSpine additions
- `frontend/src/lib/lifeOfSong.js` — new shared lifecycle module

### Preserved (as promised — no functionality removed)
- All 12 Studio tabs and their content components (OverviewTab, LyricsEditor, ChordsTab, ArrangementTab, PlaceholderTab, CollaboratorsTab, ChatPanel, RightsCenter, PublishingCommandCenter, MetricsView)
- All test IDs (`STUDIO.*`, `CCC.*`, `RELEASE_IDS.*`, `DNA_IDS.*`)
- StudioSidebar (Songs / Studio / Song DNA / Release / Intelligence / Vaulta / Integrations / Settings)
- Per-collaborator server-assigned hex color continues to drive lyric line colors, timeline glows, chat avatars, contribution attributions

### Awaiting user sign-off before Phase 3 begins
Phase 3 target: **Creator Passport™ → Living Creator DNA™ experience** — elevate the existing Passport page with the 10 growth dimensions (Creative · Technical · Leadership · Business · Educational · Commercial · Collaboration · Innovation · Mentorship · Legacy), Creator Relationship Graph, and Writing Rooms cross-links.


## Phase 3 — Creator DNA™ · Living Permanent Creative Identity (2026-02-07 — v2.5)

**Approved as a crown jewel.** The Creator Passport page has been fully elevated into the **living Creator DNA™ record** — the permanent home of a creator's entire creative life. This is not a profile. It is a legacy record.

### The question the page now answers
> "If someone wanted to understand this creator's entire creative life, where would they go?"
> **→ Creator DNA™.**

### The 15-chapter cinematic scroll (all live in `/creator/:id`)

| # | Chapter | What lives here |
|---|---|---|
| I | Permanent Creative Identity | Gradient hero, identity-color avatar with radial glow, ANCRID · VERIFIED badges, disciplines/instruments/genres, 5-stat passport strip |
| II | The 10 Growth Dimensions | Radar chart (Creative · Technical · Leadership · Business · Educational · Commercial · Collaboration · Innovation · Mentorship · Legacy) + 10 dimension cards with absolute values (never rankings) |
| III | Life of the Creator | Year-grouped immutable timeline; every event with color-coded dot, event kind, and date |
| IV | Creative Evidence™ · History | Every documented moment of contribution, time-stamped, color-coded per session |
| V | Creative Provenance™ · History | Horizontal connected-node chain visualization with `#HASH` refs and identity-color glow |
| VI | Writing Rooms | Rooms this creator has stepped into (Atlanta / Nashville / London), role + last-visit |
| VII | Collaboration Network | SVG radial relationship graph — creator centered, collaborators around, edges colored by identity |
| VIII | Songs, Sessions & Verified Credits | Cinematic catalog cards showing role, color, genre, status |
| IX | Publishing & Rights | PRO · IPI · Publisher · Label · Manager · Attorney · Publishing split · Website |
| X | Commercial Milestones | Total streams · Est. earnings · Finalized works · Sync placements |
| XI | Awards & Certifications | Auto-earned achievements (First creation, First finalized work, Network builder, Catalog milestone, 100K streams) |
| XII | Mentors & Mentees | Two-panel section referencing the Creator DNA™ spec — every mentor relationship must be Provenance-backed |
| XIII | Ecosystem | Every org connected to this identity (label / publisher / studio / university / manager / attorney) |
| XIV | Career Insights | Dominant dimension · Growth pace · Network reach · Commercial signal |
| XV | ANCR Ecosystem Identity | `ancr_XXXX` permanent identifier · 6 modules (INHEIRA / Vaulta / ANCRLAB / ANCRMEDIA / CCDP / COHEIR) with Active/Ready status · Federated identity live indicator |

### Persistent UX signatures
- **Sticky Chapter Index** on the right rail (xl+) — 15 numbered chapters, one-click anchor navigation
- **Identity color** used consistently — hero avatar glow, radar chart fill, chapter I eyebrow, timeline dots, network graph center
- **Cinematic scroll** — every chapter uses the same `/ CHAPTER {N}` eyebrow + gradient headline + rich subtitle pattern as Landing / Creator Home / Studio Session

### Derived-data engine (deterministic)
`deriveDNA(profile, discography, timeline)` — a single pure function computes:
- 10 dimension values (0-100 absolute scale, derived from documented evidence)
- collaborator map with per-user song counts
- verified credit count, "grew since" year, estimated streams, estimated earnings
- event-kind counts fed into dimension math
This is Phase-0 of the Creator DNA spec — the same nodes will one day migrate to platform-level derivation.

### Preserved
- All existing API calls (`/profile/:id`, `/creators/:id/discography`, `/creators/:id/timeline`) — no backend changes required
- All existing test IDs (`PASSPORT.root`, `PASSPORT.header`, `PASSPORT.tab`, `PASSPORT.discography`, `PASSPORT.timeline`)
- All existing profile fields still surface where they belong (PRO, IPI, publisher, label, manager, attorney, disciplines, instruments, genres, biography, country, website)

### Bug fix during smoke test
- `EcosystemPanel` was passing `Icon: X` (uppercase) but `TeamRow` destructures `icon: Icon` (lowercase). Component resolved to undefined → ErrorBoundary tripped. Fixed by renaming to lowercase `icon:` throughout the panel.

### Files touched
- `frontend/src/pages/CreatorPassport.jsx` — full rewrite (~700 lines)

### Awaiting user sign-off before Phase 4 begins
Phase 4 target: **Continuous Release Path** — merge Rights + Split Sheet + Publishing + Vaulta + Release Dashboard into one continuous flow with persistent step indicator (Rights → Split Sheet → Publishing → Vaulta → Release).


## Phase 4 — Continuous Release Path · Mission Control (2026-02-08 — v2.6)

**Approved with expanded scope.** The Release Dashboard has been rebuilt as **the creator's mission control** — the final chapter of the song's documentary. Not a checklist. Not a dashboard. A cinematic 11-stage journey from completion to the world.

### The 11 stages (single scroll, `/sessions/:id/release`)

| # | Stage | Documentary title | Surfaces |
|---|---|---|---|
| I | Creative Evidence™ | *Every contribution documented forever.* | Immutable ledger (recent 12 events, identity-color dots) + right-rail stats + shortcuts to Song DNA + Studio |
| II | RightsPrint™ | *Every creator, verified.* | Verified creator cards w/ identity-color radial glow · ANCRID · PRO · IPI · "RightsPrint Verified" badge |
| III | Ownership | *Six lenses. One story.* | Lyrics · Composition · Publishing · Master · Producer · Performance — each with color-coded % bars |
| IV | Split Sheet | *Every signature. Every percentage. Locked.* | Signed writers with % + green tick · Export panel (Copyright PDF / Publisher CWR / PRO submission / Label deliver) · Open split sheet CTA |
| V | Publishing | *Ready for every registry on earth.* | 15-item grid (ISRC/UPC/EAN/ISWC/Song ID/IPI/Publisher/PRO/Copyright/Mechanical/Neighboring/Metadata/Artwork/DSP/Marketing) · **publishing-room bg photography** |
| VI | Vaulta™ | *The royalty rail is live.* | Performance · Mechanical · Sync · Neighboring revenue with hints (ASCAP/BMI/SESAC etc.) · **vault-room bg photography** · Open Vaulta CTA |
| VII | Song Intelligence™ | *The record, understood.* | Commercial / Release-ready / Sync tiles + Executive Summary · **studio bg photography** · Full report CTA |
| VIII | Commercial Readiness | *Seven axes. One verdict.* | Recharts radar (Streaming · Sync · Playlist · Radio · Global · Longevity · Audience) + side bars per axis |
| IX | Release Readiness | *The final gate.* | Massive % counter + completion task grid (Check/Circle/Pulse states) + gated Publish button |
| X | Distribution | *Every DSP. Every store. Everywhere.* | 10 DSPs + 5 distributors with Connected pulses · **release-day bg photography** |
| XI | Life of a Song™ | *The world hears it.* | 30-day streaming line chart · Top-cities bar chart · Playlists/Radio/TikTok/Shazam signals · **legacy bg photography** |

### Persistent UX signatures (every stage carries them all)
- Song identity (title gradient, meta chips, session ID) — persistent hero
- **Life of a Song™ spine** — 10-node timeline visible at hero, current stage highlighted white
- **Collaborator identity strip** — up to 8 identity-color avatars + verified count
- **Release readiness counter** — big 0-100% displayed persistently
- Every stage shows `/ STAGE {N} · {name}` eyebrow + gradient headline + inspirational subtitle (documentary tone)
- Every stage cross-links to the deeper existing surface (Song DNA, Studio, Split Sheet, Vaulta, Intelligence Report) — nothing is duplicated, everything is connected

### Sticky Stage Index (right rail, xl+)
- 11 stages numbered, one-click anchor navigation — creator can jump to any stage instantly

### Documentary photography
- Six commissioned-photo placeholders: mastering, publishing meeting, vault, studio intelligence, distribution/release day, legacy — used as subtle 14%-opacity background layers with black gradient overlay. Ready to swap for licensed shots.

### Preserved
- Every existing route (`/sessions/:id/split-sheet`, `/sessions/:id/intelligence`, `/vaulta`, `/sessions/:id/studio`, `/sessions/:id/dna`) still works — the Release Path connects to them, doesn't replace them
- All existing test IDs (`RELEASE.root`, `RELEASE.streams`, `RELEASE.revenue`)
- API calls unchanged (`/sessions/:id`, `/sessions/:id/events`)

### Files touched
- `frontend/src/pages/ReleaseDashboard.jsx` — full rewrite (~660 lines)

## Refinement Pass P0 + P1 — Product Unification (2026-02-08 — v2.7)

**Approved directive.** After the platform review, we consolidated the whole product. Every legacy surface now feels like it was designed the same day as Phase 1–4.

### P0 · Shared cinematic components (new module)
`frontend/src/components/cinematic/index.jsx` — single source of truth:
- `<CinematicHero />` · black-first, gradient headline, dual radial glow, optional avatar rail, optional extra top/bottom slots
- `<LifeSpine currentStage={n} />` · the 10-node persistent spine (used across Dashboard, Studio, Release Path, and now Sessions, Song DNA, New Session, and more)
- `<ChapterBand num eyebrow title subtitle right bgImg />` · numbered chapter section with optional photography backdrop
- `<IdentityStrip collaborators size />` · reusable identity-color avatar strip
- `<ANCRFooter left right />` · signature closer
- `<EmptyBlock title hint />` · unified empty-state voice
- `<ChapterAnchor id />` · sticky-nav anchor helper

### P0 · Palette Unification (full sweep)
Every `violet-*` accent and `#8b5cf6` hex from the pre-Phase-1 SONGRIGHT era replaced with the cool Phase 1–4 palette (`indigo-400` / `indigo-300` / `#818cf8`). 9 files touched via automated sed pass. Zero remaining violet references anywhere in the app.

### P1 · Legacy page elevations
| Surface | Before | After |
|---|---|---|
| **Sessions list** (`/sessions`) | Simple grid, no Life-of-Song context, "1 COLLABORATORS" grammar bug, violet Join accent | Full CinematicHero, "Every session, verified." gradient, "Or enter a writing room" cross-link, Chapter I band "Sessions in progress" with total/finalized counts, cinematic cards with Life-of-Song mini-bar per session, identity-color chips, singular/plural grammar fixed |
| **Song DNA** (`/sessions/:id/dna`) | Basic header + timeline | CinematicHero with `SONG DNA™ · IMMUTABLE HISTORY · {ID}` eyebrow, identity-color collaborator strip, persistent LifeSpine, "Continue to Release Path" cross-link, kept all 13 event-type filters and day-grouped timeline |
| **RightPrint / Profile** (`/profile`) | DAW-photo hero + form fields | 6 numbered chapters — I Who you are · II How you get paid · III Who is with you · IV What you do · V Your story · VI Where creators find you. Each chapter has its own cinematic scenery backdrop, DNA-impact hint ("Business dimension" / "Creative dimension" / etc.), and cross-linked "Open your Creator DNA™" primary CTA. **User's uploaded portrait installed as profile picture** with identity-color glow ring |
| **Vaulta** (`/vaulta`) | 4-tile revenue + table | CinematicHero with "Estimated earnings" + "Next payout ~90 days" chip, Chapter I "Where the dollars come from" (4 rights including GMR), Chapter II "On the rail forever" with Life-of-Song stage per work + identity-color chips per work + click-through to Release Path, Chapter III "Your rail, projected" 10-year forecast Recharts line, illustrative-rail transparency note |
| **New Session** (`/sessions/new`) | Form-only | CinematicHero "Where every song begins." · "STAGE 01 · IDEA" badge · LifeSpine highlighted at Stage 1 · cinematic Chapter I "Begin the record" form with dark-glass inputs |
| **Session Detail** (`/sessions/:id`) | Orphaned pre-Phase-2 workspace | Retired — now `<Navigate to="/sessions/:id/studio" replace />` — the full Studio absorbs everything |
| **Split Sheet / Intelligence Report / Connected Services** | Violet accents | Palette-swept to cool palette |

### Identity color persistence
Every legacy surface now uses `colorForAncrId` or the server-assigned `c.color` to render collaborator identity across avatars, chips, dots, and cursor markers.

### Cross-linking (bidirectional)
- Profile → Creator DNA (primary CTA on hero)
- Profile → Connected Services (secondary CTA)
- Vaulta works → Release Path (per-work click-through)
- Vaulta → Sessions list (top-right link)
- Song DNA → Release Path (top-right link)
- Sessions list → Writing Rooms (hero subtitle link)
- Sessions list → Studio (every card)

### Files touched
- `frontend/src/components/cinematic/index.jsx` (new)
- `frontend/src/pages/Sessions.jsx` (rewritten)
- `frontend/src/pages/SessionDetail.jsx` (replaced with Navigate)
- `frontend/src/pages/NewSession.jsx` (rewritten)
- `frontend/src/pages/SongDNA.jsx` (re-shelled)
- `frontend/src/pages/Profile.jsx` (rewritten with 6 chapter scenes + user portrait)
- `frontend/src/pages/Vaulta.jsx` (rewritten)
- `frontend/src/pages/SplitSheet.jsx` (palette-swept)
- `frontend/src/pages/SongIntelligence.jsx` (palette-swept)
- `frontend/src/pages/ConnectedServices.jsx` (palette-swept)

### Awaiting user sign-off before Freeze + Next Generation
Once the final review passes, we freeze the core experience and begin:
- Creative Evidence Intelligence™
- Musical Contribution Intelligence™
- Whiteboards · Session Replay · Version History · Live Session Intelligence™


## Final Review & Freeze — INHEIRA v1.0 (2026-02-08 — v3.0)

**Testing agent full-platform QA pass complete.** After two rounds of targeted fixes, all 5 freeze criteria are GREEN and the core INHEIRA v1.0 experience is frozen.

### Freeze criteria (all PASS)
1. ✅ **Palette Freeze** — zero `violet-300/400/500/600` classes remain anywhere in the app (grepped across all files in `src/`). Only `violet-100` / `violet-200` shades survive — those are the intentional pearl-lavender gradient endpoint used on cinematic headlines (`from-white via-indigo-100 to-violet-200`).
2. ✅ **Mobile responsiveness** — `document.scrollWidth === 375` at 375×812 viewport on `/dashboard`. `/studio` and `/release` also pass.
3. ✅ **Studio Chapter Nav** — Write chapter renders 4 sub-tabs (Lyrics · Melody · Chords · Arrangement); Release chapter renders 3 (Rights · Publishing · Analytics). All under `[role=tab]` in the ChapterNav TabsList.
4. ✅ **No orphaned routes** — `/sessions/:id` correctly `<Navigate>`-redirects to `/sessions/:id/studio`.
5. ✅ **All test IDs resolve** — spot-checked `dashboard-root`, `dashboard-active-sessions`, `sessions-list-root`, `studio-song-title`, `studio-chapter-write`, `studio-chapter-release`, `passport-root`, `release-dashboard-root`, `vaulta-root`, `auth-submit-login`.

### Fixes applied during the freeze pass
- **Palette sweep round 2** — swept `StudioSession.jsx`, `SongIntelligence.jsx`, `AuthPage.jsx`, `PublicReport.jsx`, `Landing.jsx`, `Dashboard.jsx`, `ReleaseDashboard.jsx`, `App.js`, `collaboratorColors.js`, `ConnectedServicesWidget.jsx`, `OwnershipDashboard.jsx`, `GlobalCollaborationMap.jsx`, `ErrorBoundary.jsx`, `SongJourney.jsx`. 0 `violet-300+` classes remaining.
- **Life-of-Song 10-node strip** — the strip in Dashboard.jsx and the shared `<LifeSpine />` in `components/cinematic/index.jsx` + the inline `<ReleaseSpine />` in ReleaseDashboard.jsx are all now wrapped in `overflow-x-auto` with an inner `minWidth: 640` so the strip scrolls horizontally on mobile without forcing the whole page to scroll.
- **CSS Grid `min-w-0` fix** — added `min-w-0` to the four `lg:col-span-2` grid children on Dashboard.jsx (Chapter IV EvidenceFeed + PassportPreview blocks) so the grid can shrink below content min-width on mobile.

### Documented but NOT flagged as bugs
- Localstorage token key is still `songright_token` (internal, not user-facing). Kept for backward-compat of existing sessions. Migration to `inheira_token` would be cleaner but isn't blocking.
- Some absolutely-positioned decorative glow divs extend beyond the 375px viewport — they live inside `overflow-hidden` containers so they don't affect `document.scrollWidth`.

### FREEZE DECLARATION
> **INHEIRA v1.0 is FROZEN.**
> No further changes to the core experience without explicit user approval.
> All next-generation work begins from this baseline.

### Files touched in the final freeze pass
- `frontend/src/pages/StudioSession.jsx` (palette)
- `frontend/src/pages/SongIntelligence.jsx` (palette)
- `frontend/src/pages/AuthPage.jsx` (palette)
- `frontend/src/pages/PublicReport.jsx` (palette)
- `frontend/src/pages/Landing.jsx` (palette)
- `frontend/src/pages/Dashboard.jsx` (palette + LifeOfSongBoard overflow + 4× `min-w-0`)
- `frontend/src/pages/ReleaseDashboard.jsx` (palette + ReleaseSpine overflow)
- `frontend/src/App.js` (palette)
- `frontend/src/lib/collaboratorColors.js` (palette)
- `frontend/src/components/cinematic/index.jsx` (LifeSpine overflow)
- `frontend/src/components/ConnectedServicesWidget.jsx` (palette)
- `frontend/src/components/OwnershipDashboard.jsx` (palette)
- `frontend/src/components/GlobalCollaborationMap.jsx` (palette)
- `frontend/src/components/ErrorBoundary.jsx` (palette)
- `frontend/src/components/SongJourney.jsx` (palette)

### Next-generation roadmap unlocked
- **P0** · Creative Evidence Intelligence™ (CEI) — ingestion + comparison engine (spec at `/app/docs/INHEIRA_Creative_Evidence_Intelligence_Spec_v1.0.md`)
- **P0** · Musical Contribution Intelligence™ — per-region contribution scoring
- **P1** · Whiteboards — collaborative canvas
- **P1** · Session Replay — scrubbable session timeline
- **P1** · Version History — cinematic diff viewer
- **P1** · Live Session Intelligence™ — real-time contribution pulse


## v1.0 Preservation Snapshot (2026-02-08 — v3.1)

**Purpose:** Permanent restoration point. Documentation-only phase — no code changes to the frozen experience.

### Delivered
- ✅ **Git tag** `inheira-v1.0` at commit `a9bfba7...`
- ✅ **12 snapshot documents** under `/app/memory/v1.0/`:
  - `SNAPSHOT.md` (top-level index)
  - `ROUTES.md` (17 frontend + 40 backend routes)
  - `COMPONENTS.md` (18 pages + 8 custom + 45 UI + 7 cinematic primitives + 6 libraries)
  - `SCHEMA.md` (9 MongoDB collections with field types)
  - `API.md` (40 endpoints across 10 groups)
  - `DESIGN_SYSTEM.md` (palette + typography + patterns + freeze rule)
  - `FEATURES.md` (full feature inventory)
  - `FILE_STRUCTURE.md` (canonical tree)
  - `DEPENDENCIES.md` (frontend + backend package versions)
  - `ARCHITECTURE.md` (runtime topology)
  - `DOCS_INDEX.md` (index of all documentation)
  - `CHANGELOG.md` (complete phase-by-phase change history)
- ✅ **Screenshot archive** — 15 major surfaces captured (Landing · Auth · Creator Home · Sessions · New Session · Studio · Song DNA · Release Path · Song Intelligence · Split Sheet · Writing Rooms · Creator DNA · RightPrint · Vaulta · Connected Services)
- ✅ **User's uploaded portrait installed** as their permanent identity avatar via `PUT /api/profile/me` — propagates to Nav, RightPrint hero, Creator DNA identity chapter

### Testing agent verification (iteration_7.json)
- ✅ Login flow works, Nav shows uploaded portrait
- ✅ Portrait propagates through Profile hero + Creator DNA identity avatar
- ✅ 5/5 regression routes load without ErrorBoundary
- ✅ Violet freeze integrity holds — `Array.from(document.querySelectorAll('*')).filter(el => /violet-(300|400|500|600)/.test(el.className)).length === 0` on /dashboard
- **100% frontend pass rate maintained**

### Restoration commands
```bash
git checkout inheira-v1.0                # return to frozen baseline
git diff inheira-v1.0..HEAD              # compare any future work against v1.0
git checkout -b restore/v1.0 inheira-v1.0  # branch from v1.0
```

### v2.0 unlocked
The freeze is preserved. INHEIRA v2.0 begins now with **Creative Evidence Intelligence™ Phase 1** as the first build. All next-generation work happens from this permanent baseline; no changes to the frozen v1.0 experience without explicit approval.


## Final Visual Refinement — Creator Home Hero (2026-02-08 — v1.1)

**Approved directive.** Before v2.0 begins, one deliberate refinement to the Creator Home hero to make the emotional experience match the vision.

### What changed (Dashboard.jsx hero only)
- **Full-bleed cinematic recording-studio environment** replaces the previous understated hero. Vintage guitars on a wood-panelled wall + professional mixing console + Neve-style outboard racks + monitor displays showing waveforms + warm amber & purple cinematic lighting. The imagery is layered:
  - Layer 1 · Primary studio photograph (`object-cover`, `scale-105`)
  - Layer 2 · Blend-screen alternate scene for depth
  - Layer 3 · Two radial glows (indigo + sky) for INHEIRA identity color
  - Layer 4 · Fine dot-noise texture (`radial-gradient` at 3% opacity)
  - Layer 5 · Vertical + horizontal linear-gradient darkening for text legibility
- **Editorial eyebrow row** — `CREATOR HOME · LIVE / RIGHTPRINT · {status} · Chicago · {day, month, date}` with pulsing emerald dot
- **Signature tag** — `THE OPERATING SYSTEM FOR HUMAN CREATIVITY`
- **Massive gradient headline** — "Welcome back, {firstName}." at `text-8xl` on desktop with pearl-lavender gradient stop
- **Belief line** — "This is where great songs are created. Every idea, every collaborator, every contribution — documented from creation to legacy."
- **CTA pair** — Primary "Begin a new session" (white with shadow) + secondary "Enter a writing room" (glass panel with `backdrop-blur-2xl bg-white/[0.06] border-white/20`)
- **Floating glass metric strip** — 4 chips in `bg-white/[0.04] backdrop-blur-2xl border-white/10` with subtle diagonal gradient sheen: RightPrint · Songs in the room · Creators with you · Est. earnings
- **Full-height hero** — `min-h-[720px]` (mobile `calc(100vh-100px)`) so the environment dominates on entry

### Test IDs preserved
All 4 existing test IDs still present and functional:
- `DASHBOARD.root` on the hero section
- `DASHBOARD.createSessionBtn` on the primary CTA
- `DASHBOARD.rightprint` on the RightPrint glass tile
- `DASHBOARD.royaltyCard` on the Est. earnings tile

### What did NOT change
- All 6 chapters below the hero (Life of a Song strip · Writing Rooms Live · Active Sessions · Creative Evidence + Intelligence Pulse · Passport + Release Path · Finalized works)
- Every other page in the app
- API contracts, test IDs, MongoDB schema — untouched

### Files touched
- `frontend/src/pages/Dashboard.jsx` — only the hero section

### Notes for future photography swap
Currently sourced from curated Unsplash — noted as **TODO: swap with commissioned shots** matching the full brief (multiple songwriters collaborating + producer at console + Chicago floor-to-ceiling windows at night). The current photograph delivers the studio environment, gear, and lighting; commissioned photography with people-in-scene would complete the last 20% of the vision.




## CEI v2.0 — Full Evidence Record + Adaptive Documentary (2026-02-08 — v3.2)

**Approved direction from user:** Before building the comparison engine, each version must first become a *complete* Creative Evidence™ record — a permanent historical snapshot that could be revisited years later without relying on memory. Every architectural decision must support the full scope from day one, even if some upload/analysis features enable progressively.

### Backend — expanded schema + endpoints

**Endpoints (all under `/api/sessions/{session_id}/versions`)**
- `POST /` — create a full version record (see fields below)
- `GET /` — list versions with hydrated evidence + acknowledgements
- `GET /{version_id}` — single hydrated version
- `POST /{version_id}/evidence` — append an evidence artifact (any of 15 kinds)
- `POST /{version_id}/acknowledgements` — append immutable human testimony

**Version record fields** (server.py `CreativeVersionCreate` + persisted document):
- Identity — `version_id`, `session_id`, `submitter_id`, `submitter_name`, `submitter_color`
- The Moment — `title`, `purpose`, `moment_at`, `location`, `writing_room`
- Who — `participants[]` (name, role, `rightprint_id`, user_id, color)
- What & Why — `objectives`, `what_changed`, `why_changed`
- Decisions — `decisions_reached[]`, `decisions_deferred[]`, `open_questions[]`, `disagreements[]`, `rights_discussions[]`
- Continuity — `parent_version_id`, `child_version_ids[]` (auto-backfilled)
- Environment — `daw`, `software_versions[]`, `hardware[]`, `instruments[]`
- Links — `sessions[]`, `writing_rooms[]`, `projects[]`
- Narrative — `ai_session_summary`
- Status (never computed) — `confidence_status = "awaiting_evidence_analysis"`, `mci_status = "awaiting_musical_contribution_analysis"`
- Integrity — `integrity_hash` (SHA-256 of canonical record at creation)
- Legacy back-compat — `label`, `notes`, `artifact_urls[]`

**15 evidence artifact kinds** (schema accepts all now):
`rich_text · voice_memo · audio · lyrics · chord_chart · lead_sheet · midi · musicxml · daw_export · stem · mix · image · video · screenshot · cloud_link`

**8 acknowledgement kinds:**
`signature · written · audio · video · producer_note · engineer_note · witness · ai_summary`

Each acknowledgement captures the 4 mandatory questions: contribution / observations / agrees_with_version / disputes. Once submitted, immutable.

**Immutability guarantees**
- No PATCH/DELETE routes. Version content is frozen at creation. Only `child_version_ids` may be back-filled onto a parent when a child version is created (lineage link — not content).
- Every version sealed with a SHA-256 `integrity_hash` at creation.

**Non-computable status**
- `confidence_status` and `mci_status` NEVER computed or user-editable. They remain at their `awaiting_*` values until the CEI + MCI engines come online. Verified by testing agent even with fully filled records + 4 artifacts + 8 acknowledgements.

**Documentation completeness** — a documentation metric, NOT a contribution score. Returned as `{filled, total, ratio}` — no percentages of ownership or contribution.

### Frontend — adaptive documentary

**Container: `frontend/src/components/studio/EvolutionTab.jsx`**
- Cinematic hero: "Every moment. Every voice. Immutable. Forever."
- 4 live counters: versions · evidence artifacts · acknowledgements · contributors
- Baseline Clarification banner (spec §2.1)
- Permanent Confidence/MCI status cards showing awaiting states + educational copy
- **View switcher** with 4 modes (all render the same event model):
  - `documentary` — vertical narrative timeline (chapter-per-version)
  - `filmstrip` — horizontal cinema-reel with film perforations
  - `graph` — SVG evidence graph showing version lineage + participant edges
  - `session` — minute-by-minute merged stream of session events + version submissions

**Guided capture: `evolution/DocumentVersionModal.jsx`** — 8-step cinematic flow (The Moment → Who Was In The Room → The Objective → Decisions & Questions → Environment → Continuity → AI Session Summary → Immortalize) with progress ribbon, immutability notice, and analytical-status preview on the final step.

**Version detail: `evolution/VersionDetailSheet.jsx`** — side-sheet dossier with 9 sections (Moment · Participants · What & Why · Decisions · Evidence · Acknowledgements · AI Summary · Environment · Continuity · Integrity). Copy-hash button for SHA-256 verification. Add-evidence + Add-acknowledgement CTAs.

**Add evidence: `evolution/AddEvidenceSheet.jsx`** — supports all 15 kinds. Text-native (rich_text/lyrics/chord_chart/lead_sheet) uses in-line textarea. Cloud link uses URL input. All other kinds accept an external file URL now with direct object-store uploads enabling progressively — the schema is already ready.

**Acknowledgement: `evolution/AcknowledgeSheet.jsx`** — 4-question capture (contribution / observations / agrees / disputes) with kind selector for all 8 acknowledgement types.

**Shared taxonomy: `evolution/evidence.js`** — `EVIDENCE_KINDS`, `ACK_KINDS`, `ROLES`, `FAMILY_COLOR`, `completenessLabel()`.

### Testing
- **Backend**: 26/26 pytest cases in `/app/backend/tests/test_cei_v2.py` — full CRUD + immutability + confidence/mci frozen states + integrity hash + backwards-compat + parent-child lineage + rejection cases.
- **Frontend**: 100% of listed UI flows pass. Testing agent auto-fixed 1 clipboard bug (`navigator.clipboard.writeText` uncaught promise → wrapped in try/catch with fallback toast).
- **Accessibility**: Added VisuallyHidden `DialogTitle` to `DocumentVersionModal` to satisfy Radix a11y warnings.

### Files added / touched
- `backend/server.py` — CEI section rewritten (~354 lines: new models, endpoints, helpers)
- `backend/tests/test_cei_v2.py` — new pytest suite (204 lines, 26 cases)
- `frontend/src/components/studio/EvolutionTab.jsx` — rewritten (~255 lines)
- `frontend/src/components/studio/evolution/DocumentVersionModal.jsx` — new (365 lines)
- `frontend/src/components/studio/evolution/VersionDetailSheet.jsx` — new (380 lines)
- `frontend/src/components/studio/evolution/AcknowledgeSheet.jsx` — new (156 lines)
- `frontend/src/components/studio/evolution/AddEvidenceSheet.jsx` — new (132 lines)
- `frontend/src/components/studio/evolution/EvolutionTimelines.jsx` — new (343 lines)
- `frontend/src/components/studio/evolution/evidence.js` — new (60 lines)

### Deferred to next iteration (P1 backlog)
- Extract CEI routes from `server.py` into `/app/backend/routers/cei.py` (server.py is 1791 lines — exceeds guideline)
- Add pagination cap on `GET /versions` (currently `to_list(500)`)
- Optimize `_hydrate_version` N+1 (2 extra queries per version) into a single aggregation lookup
- Enable direct in-browser audio/video acknowledgement recording
- Direct object-store upload path in AddEvidenceSheet (schema is ready)
- **CEI Phase 2 — Comparison Engine** (compare *documented* versions, not just files) — waiting for user go-ahead
- **Musical Contribution Intelligence™ (MCI)** — the engine that will finally compute the `mci_status` field


## Automatic Creative Documentation™ v2.1 (2026-02-08 — v3.3)

**Approved shift**: INHEIRA is no longer a version control system. It's a creative operating system that documents itself in real time. Manual version submissions still exist as the *official* milestones, but the system has already been building the documentary before anyone clicks "Submit."

### Platform-wide evidence standard

**Module: `/app/backend/evidence.py`** — the single source of truth every write in the codebase routes through. Downstream systems (CEI, Creative Provenance™, MCI, audits, disputes, future legal workflows) all consume from this stream. Direct `session_events.insert_one` calls have been eliminated in favor of `record_event()`.

Per-kind sensitivity policy:
- **CREATIVE_KINDS** (lyric, melody, chord, arrangement, voice memo, stems, notation, files, session lifecycle, contribution, milestones, identifiers, rights records, RightsPrint, publishing, DSP, release) → **complete evidence stored**
- **SENSITIVE_KINDS** (chat, ai_interaction, rights_discussion, negotiation, approval_signed, acknowledgement_submitted, share_link_created) → **metadata + timestamp + participants + SHA-256 hash + secure_reference only**. Original content stays in its native permission-controlled collection.

Every event carries `content_hash` (SHA-256 of canonical payload) and, for sensitive events, `reference_hash` (SHA-256 of the secure pointer). Verifiable across the platform.

**Intelligent debounce**: two same-actor, same-kind, same-target events within `DEBOUNCE_SECONDS=60` merge into ONE event with `revision_count++` and a `revisions[]` array carrying the hash + preview of each revision. Target keys are explicit only — `target_id` or `line_id`. `section` is deliberately NOT a fallback (would collapse two distinct lines in the same verse).

**Auto-checkpoints** (`evidence_checkpoints` collection): silent background bundles that close after `CHECKPOINT_MAX_EVENTS=25` events or `CHECKPOINT_MAX_MINUTES=60`. They exist as *working memory* — never on the public Musical Evolution timeline. When a version is submitted, `close_active_checkpoint()` seals any open bundle so it can be referenced via the version's `source_checkpoint_ids`.

### Instrumented endpoints (server.py)

Wired through `evidence_recorder.record_event`:
- `session_created`, `collaborator_joined`
- `lyric_line`, `lyric_line_edited`, `lyric_line_removed` (PUT/DELETE endpoints newly emit)
- `chat_message` (SENSITIVE)
- `identifier_generated`
- `rights_updated` (splits proposal) + `approval_signed` (SENSITIVE) + `milestone_reached` on full signoff
- `file_uploaded` (upload endpoint now accepts optional `session_id`)
- `rightprint_updated` (session_id=None — cross-session)
- `version_submitted`, `version_evidence_added`, `acknowledgement_submitted`

### New endpoints
- `GET /api/sessions/{id}/evidence?since=&kind=&limit=` — session-scoped stream (ascending)
- `GET /api/sessions/{id}/evidence/checkpoints` — auto-checkpoint list
- `GET /api/sessions/{id}/evidence/populate-since?parent_version_id=` — derived payload for the Document Version modal (participants, what_changed[], decisions_reached[], open_questions[], source_event_ids[], source_checkpoint_ids[], counts, total_events)
- `GET /api/creator/evidence?since=&kind=&limit=` — creator-scoped audit stream (descending) — surfaces cross-session events like `rightprint_updated` that don't have a session_id

### Frontend
- **`LiveEvidenceStream.jsx`** — new view (data-testid `live-evidence-stream`); real-time polling at 8s; open-checkpoint badge; sensitivity-aware rendering (sensitive events show only a `hash-only` badge + sha256 line, never raw content)
- **`EvolutionTab.jsx`** — 5th view added at the top of the switcher: **Live** (default entry for empty sessions)
- **`DocumentVersionModal.jsx`** — Step 1 now leads with an AUTOMATIC CREATIVE DOCUMENTATION™ call-out and a `docver-populate-btn` that calls populate-since, merges participants, appends auto-summary bullets to `what_changed`, and stashes `source_event_ids`/`source_checkpoint_ids` for submission
- **`StudioSession.jsx`** top bar — subtle **Documenting** pulse (`studio-documenting-indicator`) signalling passive capture is on

### Testing
- **Backend**: 42/42 pytest cases (16 new in `/app/backend/tests/test_auto_doc_v2_1.py` + 26 regression from Phase 1). Legacy `session_events` mirror row verified for every new creative_evidence_events row.
- **Frontend**: 100% of listed UI flows pass. Populate-from-evidence flow verified end-to-end.

### Deferred / P1 backlog
- Extract routers from `server.py` (now 1976 lines) into `/app/backend/routers/{evidence,versions,rights,chat}.py`
- Cursor-based pagination on `/evidence` (current limit cap: 2000)
- Signed URLs for artifact `file_url` fields
- In-Browser Voice Recording (voice memo + spoken acknowledgement + auto-transcription + speaker ID + hashing)
- Comparison Engine (compare *documented* versions — foundation is now the passive record, not just isolated snapshots)
- Musical Contribution Intelligence™ (the engine that finally computes `mci_status`)


## Voice Evidence Layer v2.2 (2026-02-08 — v3.4 · SNAPSHOT)

**Frozen milestone.** See `/app/memory/v2.2/VOICE_EVIDENCE_LAYER_SNAPSHOT.md` for the full technical snapshot.

Every voice recording is now a first-class Creative Evidence™ object. Pipeline: upload → SHA-256 → immediate `voice_memo_recorded` platform event → asyncio-backgrounded Whisper transcription → Claude Sonnet 5 moment classification → human review gate → mapped platform-wide event on confirm/correct.

**System-detected moments are OBSERVATIONS, never truth.** Every moment starts at `human_status='unconfirmed'`; only a human's confirm/correct promotes it downstream. Sensitive moments (rights, splits, disagreements, final approvals) never expose their raw excerpt in downstream events — only metadata + secure_reference + hash.

**Media-agnostic**: schema carries `media_kind` (voice today · video/screen/daw/midi/camera later) so the same architecture extends without rewrite.

**Verified**: 61 pytest cases pass (19 new + 42 regression). Real spoken audio E2E confirmed. Sensitivity redaction confirmed both in backend payloads and frontend UI (`hash-only` badge).

### Files
- `backend/media_evidence.py` (media-agnostic service)
- `backend/server.py` (voice endpoints)
- `backend/tests/test_voice_evidence_v2_2.py`
- `frontend/src/components/studio/evolution/VoiceBooth.jsx`
- `frontend/src/components/studio/evolution/VoiceEvidencePanel.jsx`
- `frontend/src/components/studio/EvolutionTab.jsx` (wired)

### Dependencies added
- `pydub==0.25.1` · `ffmpeg` (apt) · `espeak-ng` (apt)

### Next-in-queue (per user directive)
1. Musical Contribution Intelligence™
2. Comparison Engine

**Do NOT expand scope until user explicitly directs the next layer.**


## Navigation & Ownership Cleanliness Pass (2026-02-08 — v3.5)

**Ordered by the user before any further intelligence work.** No new features. Product cleanliness only.

### What changed
- **Module Registry** at `frontend/src/lib/moduleRegistry.js` is now the single source of truth for every ANCR product (INHEIRA, ANCRID, Vaulta live · CYNAIAH, ANCRSYNC, ANCRVIEW, ANCRMEDIA, ANCRWAV, ANCRSHOP registered as `coming_soon`). Each module carries `module_id, display_name, tagline, owning_product, route_prefix, external_url, icon, availability, nav, permissions, color`. When any module later ships standalone, only `external_url` changes here — the UI never changes.
- **`<ModuleFrame>`** — every non-INHEIRA route (ANCRID `/creator/:id`, Vaulta `/vaulta`) is wrapped in an ownership ribbon that names the module + owning product and offers a `Return to INHEIRA` link. Users always know which product they're inside.
- **`<EcosystemMenu>`** — primary nav is now INHEIRA-owned surfaces only (Home · Rooms · Sessions · Profile). Sibling modules live behind a dedicated Ecosystem drawer with honest availability chips. No fake "Open in ANCRID" tab-openers.
- **Passport / Vaulta / RightPrint** removed from primary nav. `/creator` and `/vaulta` routes still resolve locally today but are framed as sibling modules.
- **Dead-click sweep** (StudioSession):
  - Top-bar Publish → wired to `/sessions/:id/release`
  - Bottom `Ready for release` Publish → wired to `/sessions/:id/release`
  - Files-tab Upload → **disabled**, honestly labelled "Upload · coming soon"
  - Chords-tab Roman-numeral degrees → **removed cursor-pointer/hover** (static reference)
  - Arrangement-tab section rows → **removed hover-implies-editable** styles; copy updated
  - Collab-tab standalone Invite → **removed** (canonical Invite is the top-of-studio button)
- **Cross-module link consolidation** — StudioSession's left sidebar now sources the Vaulta href via `moduleHref('vaulta')` and label via `getModule('vaulta').display_name`, respecting `external_url` when set.

### Verification (testing_agent)
- iteration_11: Module Registry unit checks 25/25 · frontend 100% (Ecosystem menu · ModuleFrame · nav simplification · 5× dead-click fixes) · backend 96% in parallel run / 100% when files run individually (3 pre-existing test-isolation flakes in test_auto_doc_v2_1 — not introduced by this pass)
- iteration_12: follow-up moduleRegistry-consumption fix in StudioSidebar verified 100%

### Files touched
- `frontend/src/lib/moduleRegistry.js` (new)
- `frontend/src/components/ModuleFrame.jsx` (new)
- `frontend/src/components/EcosystemMenu.jsx` (new)
- `frontend/src/components/Nav.jsx`
- `frontend/src/App.js` (ModuleFrame wrapping)
- `frontend/src/pages/CreatorPassport.jsx` (eyebrow re-framed)
- `frontend/src/pages/Vaulta.jsx` (eyebrow re-framed)
- `frontend/src/pages/StudioSession.jsx` (dead-clicks fixed + sidebar Vaulta via registry)
- `/app/memory/NAVIGATION_AUDIT.md` (audit doc + follow-up)

### Deferred (documented in NAVIGATION_AUDIT.md)
- ReleaseDashboard's Vaulta stage `<Link>` still hard-codes `/vaulta` (functionally correct today; consolidate through moduleHref in a future symmetry pass)
- `/creator/:user_id` deep-links across Dashboard/Profile/WritingRooms/SongIntelligence/CreatorPassport are correct today and will be revisited only if ANCRID gains external_url
- 3 pre-existing test-isolation flakes in test_auto_doc_v2_1 when the suite runs in parallel


## Cross-Module Symmetry Sweep · COMPLETE (2026-02-08 — v3.6 · Architecture checkpoint)

Small final routing consolidation. The Module Registry is now the true single source of navigation truth.

**Delivered**
- New `<ModuleLink>` component (`frontend/src/components/ModuleLink.jsx`) — one call-site for every cross-module navigation. Automatically renders react-router `<Link>` for local modules, `<a target="_blank">` for standalone modules, and non-clickable `<span aria-disabled="true">` for coming_soon modules. Zero page-level code changes when a module later goes standalone.
- Migrated every cross-module deep-link across Dashboard, Profile, WritingRooms, SongIntelligence, StudioSession (Collab tab), CreatorPassport (related creators), ReleaseDashboard (Vaulta stage), and Vaulta (self-fallback via moduleHref).
- Zero raw `/creator/` or `/vaulta` string references remain in page code (only route definitions in App.js).

**Testing** — iteration_13 · 100% frontend · 6/6 cross-module click paths + source inspection · zero console errors. Backend untouched.

**Architecture checkpoint reached.** Ready for MCI / Comparison Engine when the user chooses to resume intelligence work.


## Musical Contribution Intelligence™ v3.0 (2026-02-08 — v3.7 · SNAPSHOT)

**Frozen milestone.** See `/app/memory/v3.0/MCI_SNAPSHOT.md` for the full snapshot.

MCI reads every existing piece of documented evidence — CEI versions, Automatic Creative Documentation events, Voice Evidence records, acknowledgements, version lineage — and returns an ANALYTICAL picture of documented musical contributions per contributor. All non-negotiable guardrails enforced: analyses only documented material; does NOT determine legal ownership; does NOT assign publishing splits; sufficiency gate (≥1 version + ≥5 events + ≥1 human-in-the-loop signal); only confirmed/corrected voice moments contribute to attribution; disclaimer always visible.

### Endpoints
- `GET /api/sessions/{sid}/mci` · `POST /api/sessions/{sid}/mci/refresh`

### Files
- `backend/mci.py` · `backend/tests/test_mci_v3_0.py` · `frontend/src/components/studio/evolution/MciAnalysisPanel.jsx`
- Touched: `backend/server.py` (2 endpoints), `frontend/src/components/studio/evolution/VersionDetailSheet.jsx` (one new Section)

### Verified (testing_agent iteration_14)
- **100% · 72/72 pytest cases** across CEI (26) + Auto-Doc (16) + Voice Evidence (19) + MCI (11)
- Frontend UI: mci-panel-analyzed, mci-panel-awaiting, mci-disclaimer, mci-refresh-btn all render correctly

### Post-recovery verification (this session)
Backend running; `/creator/evidence` exists exactly once; SpeakerTag / MomentReview / all voice endpoints + transcription pipeline intact; all 72 tests still pass.

### Next-in-queue (per user's stated order)
1. Comparison Engine ✅ shipped v3.1 (see below)
2. Voice Evidence in Version Detail
3. `/ecosystem` marketing landing (deferred earlier)

**Do NOT begin any of the above until the user explicitly directs the next layer.**


## Comparison Engine — v3.1 · MILESTONE LOCK (2026-02-08)

**Frozen milestone.** See `/app/memory/v3.1/COMPARISON_ENGINE_SNAPSHOT.md` for the full snapshot.

Side-by-side documentary comparison of any two documented versions in a session. Every diff entry traces back to real evidence (`evidence_id` / `artifact_id` / `ack_id`). Undocumented changes are never inferred — silence returns "no documented change". The engine is a documentation & analysis tool; it never determines legal ownership and never assigns publishing splits. MCI is referenced session-wide, never recomputed per-version. Deterministic ordering by `created_at` — swapping `a`/`b` in the query returns the same payload.

### Endpoint
- `GET /api/sessions/{sid}/comparison?a=<ver>&b=<ver>`

### Files
- Backend: `backend/comparison.py` · `backend/server.py` (lines 1939-1955) · `backend/tests/test_comparison_v3_1.py` (16 pytests, all pass)
- Frontend: `frontend/src/components/studio/evolution/VersionComparisonSheet.jsx` · `frontend/src/components/studio/EvolutionTab.jsx` (compare picker lines 200-260)

### Verified (testing_agent iteration_15)
- **Backend: 16/16 pytests PASS** — full payload shape, all top-level keys, lineage/metadata/prose/decisions/participants/artifacts/acks/voice/between/mci/disclaimer/computed_at, determinism (repeat call equivalent), a/b re-ordering on swap, error cases (unknown session 403/404, unknown version 404, missing params 422, cross-user 403/404), between-events window bounds, guardrail (disclaimer text + no ownership/splits/contribution tokens), regression sweep (MCI GET/refresh, versions list, event POST/GET, voice GET).
- **Frontend: 100%** — `comparison-picker` renders on Documentary view when versions.length ≥ 2; `compare-run` disabled when a===b, enabled when differ; sheet opens on click; all 10 sections render; `comparison-disclaimer` present with 3 required legal phrases; lineage + between-count pills in header; view switches (live/filmstrip/graph), Dashboard/Writing Rooms/Vaulta/SongDNA all still navigate ok.
- **Regression**: the CEI + Auto-Doc + Voice Evidence + MCI test suite (72 pytests from iterations 8-14) all still green.

### Non-blocking notes (do NOT fix inside v3.1)
- ~~Radix a11y warning: `DialogContent` on `VersionComparisonSheet` should carry a `DialogTitle`~~ · **RESOLVED in the v3.1.1 follow-up pass** — the sheet now renders a Radix `SheetTitle` + `SheetDescription` inside `<VisuallyHidden.Root>`. Zero Radix a11y console warnings during the full flow.
- ~~`VersionComparisonSheet` swallows fetch errors silently — renders "Comparison unavailable." on 404/422.~~ · **RESOLVED in the v3.1.1 follow-up pass** — 404/422/403/generic failures now fire a Sonner toast (top-right, status-aware title) AND render an inline error block inside the sheet (`comparison-error` / `comparison-error-title` / `comparison-error-description`).

### v3.1.1 follow-up verification (testing_agent iteration_16)
- Backend: 16/16 comparison pytests still pass (contract unchanged).
- Frontend: 5/5 targeted acceptance checks pass — happy path (all 10 sections + disclaimer), a11y wiring (zero Radix warnings, accessible name reads "Comparing <A title> with <B title>"), 404 error path (toast + inline block, no disclaimer), 422 error path, post-error re-open regression.
- Two cosmetic nit-only findings recorded but explicitly NOT fixed per the user's STOP directive: 404 title/description duplication when backend `detail` matches the title; toast a11y concatenation. Neither is user-visible.

### v3.1 status: LOCKED
Per user directive on 2026-02-08: *"I want a clean, tested, recoverable v3.1 milestone before anything else moves forward."* Backlog (Whiteboards · Session Replay · Live Session Intelligence™ · visual polish) all remain paused until the user explicitly directs the next layer.
