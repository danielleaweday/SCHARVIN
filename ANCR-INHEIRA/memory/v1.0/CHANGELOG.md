# INHEIRA v1.0 — Complete Changelog

Every change committed to reach the v1.0 baseline, in order.

---

## Pre-Phase-1 (SONGRIGHT era)
- Initial MVP built as **SONGRIGHT™**: FastAPI backend + React frontend + MongoDB
- Core features: sessions, contributions, split sheets, invite codes, chat, ISRC/UPC generators, Vaulta rail placeholder, Connected Services (90 integrations catalogued), Creator Passport read view, Song Intelligence report (Claude Sonnet 4.5), password-gated public share, PRO registration surface
- Aesthetic: dark theme with **violet-500 accent** — the SONGRIGHT purple

---

## Rebrand → INHEIRA
- Complete platform rebrand from **SONGRIGHT™** to **INHEIRA™**
- Landing page rebuilt as a 12-chapter cinematic documentary (Hero · Belief · Studio · Creative Moment · Writing Camps · Sessions · Creative Evidence · Creator Passport · Song Intelligence · Publishing Command Center · Life of a Song · Legacy)
- 8 canonical engineering specifications authored in `/app/docs/` (Ecosystem Architecture, Technical Spec, CEI, Creative Interpretation Framework, Creator DNA, Creative Provenance, Restoration Plan, README)
- Identity color system introduced (`lib/collaboratorColors.js`) with per-`ancr_id` deterministic palette
- First `WritingRooms.jsx` premium page built

---

## Phase 1 — Creator Home & Global Shell
**Directive:** *The inside of INHEIRA must feel like the public website. No new features — only unification.*
- Dashboard rewritten as **Creator Home** with 6 cinematic chapters (Life of a Song strip · Writing Rooms Live · Active Sessions · Creative Evidence + Intelligence Pulse · Passport + Release Path · Finalized works)
- Nav updated with Passport link
- Persistent identity color system extended platform-wide
- Bug fixes: `NaN%` on Life-of-Song progress bars, `NaN` in Intelligence Pulse aggregation

## Phase 2 — Studio Session as One Continuous Studio
**Directive:** *Every session should feel like walking into a premium recording studio, not navigating software.*
- Cinematic Chapter TopBar replacing the flat top strip: gradient headline, `STAGE XX · <name>` badge, identity-color collaborator strip, action buttons preserved
- **Persistent Life of a Song™ 10-node spine** — visible on every tab of every session
- **Two-tier Chapter Nav** (5 chapters × 12 tabs preserved): Idea · Write · Record · Collaborate · Release
- **Persistent Session Pulse Rail** — Song Intelligence™ + Creative Evidence™ chips on every tab
- Shared `lifeOfSong.js` library extracted (`LIFE_STAGES`, `STUDIO_CHAPTERS`, `inferSessionStage`, `chapterForTab`, `stageMeta`)

## Phase 3 — Creator DNA™ · Living Permanent Creative Identity
**Directive:** *If someone wanted to understand this creator's entire creative life, where would they go?* → Creator DNA™
- Creator Passport fully elevated into the living Creator DNA™ record
- **15 cinematic chapters** — Identity · 10 Growth Dimensions (radar) · Life of the Creator · Creative Evidence™ · Creative Provenance™ · Writing Rooms · Collaboration Network (SVG graph) · Songs & Credits · Publishing & Rights · Commercial Milestones · Awards · Mentors & Mentees · Ecosystem · Career Insights · ANCR Ecosystem Identity
- Sticky Chapter Index right rail (xl+)
- Deterministic `deriveDNA()` engine computes 10 growth dimensions from documented evidence
- Bug fix: EcosystemPanel icon prop case mismatch that tripped ErrorBoundary

## Phase 4 — Continuous Release Path · Mission Control
**Directive:** *The Release Path should feel like the final chapter of a documentary, not a checklist.*
- Release Dashboard rebuilt as the creator's mission control — **11 cinematic stages**: Creative Evidence™ · RightsPrint™ · Ownership · Split Sheet · Publishing · Vaulta™ · Song Intelligence™ · Commercial Readiness · Release Readiness · Distribution · Life of a Song™
- Persistent hero with song identity + collaborator strip + Life of a Song spine + Release Readiness %
- Sticky Stage Index right rail (11 stages)
- Documentary photography backdrops on Publishing/Vaulta/Intelligence/Distribution/Life stages
- Every stage cross-links to the underlying existing route (Song DNA, Split Sheet, Vaulta, Intelligence Report)

---

## Full Platform Review (`memory/PLATFORM_REVIEW.md`)
End-of-Phase-4 audit produced a prioritized backlog of 7 remaining surfaces needing elevation.

## Refinement Pass P0 + P1 — Product Unification
**Directive:** *INHEIRA should now feel 100% intentional. There should be no visual clues that parts were built during different phases.*

### P0
- **Shared cinematic components module** created (`components/cinematic/index.jsx`) — `CinematicHero`, `LifeSpine`, `ChapterBand`, `IdentityStrip`, `ANCRFooter`, `EmptyBlock`, `ChapterAnchor`
- **Full palette sweep** — every `violet-*` accent replaced with cool indigo/sky palette across 9 legacy files

### P1
- **Sessions list** rewritten with CinematicHero + Life-of-Song mini-bar per card + identity-color chips + Writing Rooms cross-link + singular/plural grammar fix
- **Song DNA** re-shelled with cinematic hero + persistent LifeSpine + Release Path cross-link
- **RightPrint / Profile** rewritten as 6 cinematic chapters with studio scenery per chapter + DNA-impact hints + Creator DNA CTA + user's uploaded portrait installed as identity-color avatar
- **Vaulta** rewritten with cinematic hero + Next Payout ~90 days chip + Life-of-Song stage per work + identity-color chips per work + 10-year forecast Recharts line + click-through to Release Path
- **New Session** rewritten with cinematic hero + Stage 01 · Idea badge + LifeSpine highlighted
- **Session Detail** retired — now `<Navigate>` to Studio
- **Split Sheet / Intelligence / Connected Services** palette-swept

---

## Final Review & Freeze
Two rounds of targeted fixes to reach 100% freeze pass:

### Fixes (iteration_4 → iteration_5)
- Palette sweep round 2 across 15 additional files (StudioSession, SongIntelligence, AuthPage, PublicReport, Landing, Dashboard, ReleaseDashboard, App, collaboratorColors, 5 shared components)
- Life-of-Song 10-node strip wrapped in `overflow-x-auto` with `minWidth: 640` on Dashboard + shared `<LifeSpine />` + inline ReleaseSpine

### Fixes (iteration_5 → iteration_6)
- Added `min-w-0` to four Dashboard grid children (CSS Grid mobile shrink fix — resolves the last 109px mobile overflow)

### Freeze verification (iteration_6.json)
| Criterion | Result |
|---|---|
| Palette Freeze (no `violet-300/400/500/600`) | ✅ PASS |
| Mobile responsiveness (scrollWidth ≤ 400 at 375×812) | ✅ PASS (375 exact) |
| Studio Chapter Nav (4+3 sub-tabs) | ✅ PASS |
| No orphaned routes | ✅ PASS |
| Test IDs preserved | ✅ PASS |
| **Overall frontend pass rate** | **100%** |

---

## v1.0 Preservation Snapshot (this snapshot)
- Git tag `inheira-v1.0` created (points to commit `a9bfba7...`)
- Complete inventories authored under `memory/v1.0/`: SNAPSHOT · ROUTES · COMPONENTS · SCHEMA · API · DESIGN_SYSTEM · FEATURES · FILE_STRUCTURE · DEPENDENCIES · ARCHITECTURE · DOCS_INDEX · CHANGELOG (this file) · screenshots/
- Freeze declared. No further changes to core v1.0 without explicit approval.

---

## Metrics summary at v1.0
| Metric | Value |
|---|---|
| Pages | 18 |
| Routes | 18 (17 rendered + 1 fallback) |
| API endpoints | 40 |
| MongoDB collections | 9 |
| Shared cinematic components | 7 |
| Custom components | 8 |
| Shadcn UI primitives | 45 |
| Shared libraries | 6 |
| Engineering specs | 8 |
| Test iterations | 6 (iteration_6 = 100% pass) |
| Frontend deps | ~60 |
| Backend deps | 28 |
| Third-party integrations catalogued | 90 |
| Third-party integrations live | Emergent LLM (Claude Sonnet 4.5) + Emergent Google OAuth |

## What v1.0 does NOT yet have (unlocked for v2)
- Creative Evidence Intelligence™ (CEI) — spec exists at `/app/docs/`, no code
- Musical Contribution Intelligence™ — per-region scoring
- Whiteboards — collaborative canvas
- Session Replay — scrubbable timeline
- Version History — cinematic diff viewer
- Live Session Intelligence™ — real-time contribution pulse
- Real-time WebSockets (current chat + updates use polling)
- Server-side PDF generation (Split Sheet uses print)
- Audio waveform + voice memo uploads (files endpoint exists, waveform rendering doesn't)
- Live PRO / distributor / DSP data (Connected Services catalogued but not wired to live income)
