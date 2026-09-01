# INHEIRA v1.0 — Feature Inventory

## Public film
- **Landing** — 12-chapter cinematic documentary: Hero · The Belief · Chapter I The Studio · Chapter II The Creative Moment · Chapter III Writing Camps (9 cities) · Chapter IV Sessions · Chapter V Creative Evidence™ · Chapter VI Creator Passport™ · Chapter VII Song Intelligence™ · Chapter VIII Publishing Command Center · Chapter IX Life of a Song (10-stage vertical timeline) · Chapter X Legacy

## Authentication
- Email/password sign-up + login (bcrypt + JWT)
- Emergent-managed Google OAuth (one-tap)
- Password reset flow
- Protected routes + auth guard
- Test account: `test@songright.com` / `Test1234!` (auto-seeded)

## Creator Home (`/dashboard`) — Phase 1
- Cinematic hero with belief-line personalized to creator
- 4-tile metric strip (RightPrint status · Songs · Collaborators · Est. Earnings)
- **Chapter I** — Life of a Song™ strip · each active song plotted on the 10-stage arc with identity-color chips
- **Chapter II** — Writing Rooms Live — 4 cities center-stage
- **Chapter III** — Active Sessions — cinematic cards with Life of a Song mini-bar per song
- **Chapter IV** — Creative Evidence™ live feed (2/3) + Song Intelligence™ Pulse (1/3)
- **Chapter V** — Creator Passport™ preview (2/3) + Continuous Release Path preview (1/3)
- **Chapter VI** — Finalized works catalog
- ANCR footer + Powered by ANCR signature

## Sessions list (`/sessions`) — elevated
- Cinematic hero "Every session, verified."
- "Begin a new session" primary CTA + Writing Rooms cross-link
- Join by invite code panel
- Chapter I "Sessions in progress" — cinematic cards with:
  - Life of a Song stage badge (`Stage 01/10`)
  - Life of a Song mini-progress-bar per card
  - Identity-color collaborator chip stack
  - Proper singular / plural grammar (`1 creator` / `N creators`)

## New Session (`/sessions/new`) — elevated
- "STAGE 01 · IDEA" badge
- Cinematic "Where every song begins" hero
- Life of a Song spine highlighted at Stage 1
- Chapter I "Name the moment" form (title / working title / project / location / date / type / context)

## Studio Session (`/sessions/:id/studio`) — Phase 2
- Cinematic hero with `STAGE XX · <name>` badge, gradient title, identity-color collaborator strip
- **Persistent Life of a Song™ spine** (10 nodes) — current stage lit
- **Two-tier Chapter Nav** — 5 chapters (Idea · Write · Record · Collaborate · Release) → 12 sub-tabs
- **Persistent Session Pulse Rail** — Song Intelligence™ (Commercial/Release/Sync) + Creative Evidence™ live event chips
- Action buttons: Invite (with code), Share, **Intelligence Report™**, Export split sheet, Publish (gated on Release Readiness = 100%)

### Studio tabs preserved
1. **Overview** — Song Journey (10 milestones), Interactive Ownership Dashboard (6 lenses), Session Timeline, Completion checklist, AI Insights, Chat
2. **Lyrics** — sectioned editor with per-line author color coding
3. **Melody** · **Chords** (auto-suggested Roman numerals in song key) · **Arrangement** (10-section structure)
4. **Voice Memos** · **Files** · **Collaborators** (Global Collaboration Map) · **Chat**
5. **Rights** — ISRC / UPC / EAN / ISWC / Song ID generators, writers table, PRO registration, Copyright docs, Release Readiness score, gated Publish button
6. **Publishing** — 15-item command grid + Release Calendar
7. **Analytics** — words, sections, versions, hours, activity chart

## Song DNA (`/sessions/:id/dna`) — re-shelled
- Cinematic hero: `SONG DNA™ · IMMUTABLE HISTORY · {ID}` eyebrow + gradient title
- Identity-color collaborator strip
- Persistent Life of a Song spine
- "Continue to Release Path" cross-link
- 13-event-type filter chips + day-grouped timeline
- Immutable append-only ledger

## Continuous Release Path (`/sessions/:id/release`) — Phase 4
Mission control 11-stage documentary:
1. **Creative Evidence™** — immutable ledger + shortcuts
2. **RightsPrint™** — verified creator cards with identity-color glow
3. **Ownership** — 6 lenses (Lyrics · Composition · Publishing · Master · Producer · Performance)
4. **Split Sheet** — signed writers + Copyright PDF / Publisher CWR / PRO submission / Label deliver export panel
5. **Publishing** — 15-item registry grid (ISRC/UPC/EAN/ISWC/Song ID/IPI/Publisher/PRO/Copyright/Mechanical/Neighboring/Metadata/Artwork/DSP/Marketing) + publishing-room photography
6. **Vaulta™** — Performance/Mechanical/Sync/Neighboring $ + vault-room photography
7. **Song Intelligence™** — 3 tiles + Executive Summary + studio photography
8. **Commercial Readiness** — 7-axis Recharts radar
9. **Release Readiness** — 100% counter + completion task grid + gated Publish
10. **Distribution** — 10 DSPs + 5 distributors + release-day photography
11. **Life of a Song™** — 30-day streaming line chart + top cities + playlists/radio/TikTok/Shazam signals + legacy photography

## Song Intelligence Report (`/sessions/:id/intelligence`)
- Cover — 8-field metadata + 6 verification badges + Release Readiness score
- **Claude Sonnet 4.5** Executive Summary + HOLD/RELEASE verdict + scoreboard
- Creative Team · Creative Journey · Creative Evidence™ · Ownership Summary
- Publishing Package · Commercial Readiness (7-axis) · Audience Intelligence · Financial Forecast (10-year) · Release Center (9-step)
- Password-gated share dialog (label / publisher / manager / attorney / investor / sync)

## Creator DNA™ (`/creator/:id`) — Phase 3
15-chapter living permanent identity record:
1. Permanent Creative Identity · 2. 10 Growth Dimensions (radar chart) · 3. Life of the Creator · 4. Creative Evidence™ · 5. Creative Provenance™ · 6. Writing Rooms · 7. Collaboration Network (SVG relationship graph) · 8. Songs & Verified Credits · 9. Publishing & Rights · 10. Commercial Milestones · 11. Awards · 12. Mentors & Mentees · 13. Ecosystem · 14. Career Insights · 15. ANCR Ecosystem Identity (`ancr_XXXX` + 6 modules)
- Sticky Chapter Index right rail (xl+)

## RightPrint™ (`/profile`) — 6 cinematic chapters
- Full-bleed mixing-console hero with user's identity-color avatar glow ring
- "Open your Creator DNA™" primary CTA
- Chapter I Who you are · II How you get paid · III Who is with you · IV What you do · V Your story · VI Where creators find you
- Each chapter has cinematic studio scenery backdrop + DNA-impact hint chip

## Vaulta™ (`/vaulta`) — royalty rail
- Cinematic hero "Every work, every stream, every dollar"
- Estimated Earnings + Next Payout ~90 days chip
- Chapter I Where the dollars come from (4 rights + GMR)
- Chapter II On the rail forever — works list with Life of a Song stage + identity-color chips per work + click-through to Release Path
- Chapter III Your rail, projected — 10-year forecast Recharts line

## Writing Rooms (`/writing-rooms`)
- 6 worldwide rooms (Atlanta · Nashville · London · Lagos · Tokyo · Kingston) with live REC indicators
- Identity-color collaborator avatars per room
- Canonical cast legend

## Connected Services (`/settings/integrations`)
- 90 integrations across 13 categories (First-Party · Identity · Cloud Storage · Music Creation (10 DAWs) · Distribution (10 distributors) · Streaming (10 DSPs) · PROs · Publishing · Rights · Finance · Communication · Calendar · AI Providers)
- Per-integration permission chips + audit log + Connect / Manage flow

## Public Report (`/report/:token`)
- Password-gated Song Intelligence Report share for external stakeholders

## Cross-cutting
- **Persistent Nav** — Home · Rooms · Sessions · Passport · Vaulta · RightPrint
- **Identity color persistence** across every collaborator surface via `colorForAncrId`
- **Life of a Song™ spine** on Dashboard · Studio · Release Path · Song DNA · Sessions cards · New Session
- **Sticky Chapter Index** on Creator DNA + Release Path
- **Consistent empty-state voice** via `<EmptyBlock />`
- **Deterministic identity system** — `ancr_XXXX` IDs travel across every module of the ANCR ecosystem
