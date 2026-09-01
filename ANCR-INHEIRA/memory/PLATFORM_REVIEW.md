# INHEIRA™ — Platform Review v1.0
**Date:** 2026-02-08
**Status:** End-of-Phase-4 audit — no code changes made during this review.
**Purpose:** Walk every surface end-to-end, evaluate against the complete INHEIRA vision, identify remaining refinements before we begin the next generation of platform capabilities.

---

## Method
Every route in `App.js` was visited under an authenticated session (`test@songright.com`) with the same 1920×1080 viewport that a creator would use on a workstation. Each surface was scored against 5 criteria drawn directly from the user's directive:

1. **Vision Gap** — anything from the original INHEIRA vision that is still missing on this surface
2. **Connection Gap** — experiences that still feel disconnected from adjacent surfaces
3. **Elevation Opportunity** — workflows that should be unified or elevated
4. **Cinematic Bar** — how close the surface is to the "documentary / recording studio" bar
5. **Public↔App Continuity** — how continuous this surface feels with the public Landing film

Score = 🟢 Meets the bar · 🟡 Close, small refinements needed · 🔴 Still SaaS-shaped

---

## Surface-by-surface audit

### 🟢 `/` — Landing (public film)
Baseline for the entire vision. 12 cinematic chapters, gradient headlines, Chapter I–X flow, "Powered by ANCR™" footer. This is the reference the app is measured against.

### 🟢 `/auth` — Sign-in / Register
Split-screen: left panel carries "Where creativity becomes legacy" belief statement + INHEIRA mark + "Powered by ANCR". Right panel: cinematic sign-in with Google + email/password. **Feels like Landing.** No refinement needed.

### 🟢 `/dashboard` — Creator Home (Phase 1)
6 cinematic chapters (Life of a Song strip · Writing Rooms Live · Active Sessions · Evidence + Intelligence Pulse · Passport + Release Path · Finalized works). Belief-line hero. Powered by ANCR footer. **Full parity with Landing.** No refinement needed.

### 🟢 `/sessions/:id/studio` — Studio Session (Phase 2)
Cinematic hero with STAGE XX badge, gradient title, identity-color collaborator strip, persistent Life of a Song 10-node spine, two-tier Chapter Nav (Idea · Write · Record · Collaborate · Release), persistent Session Pulse Rail (Intelligence + Evidence). All 12 tabs preserved. **Full studio feel.** No refinement needed.

### 🟢 `/creator/:id` — Creator DNA™ (Phase 3)
15-chapter cinematic scroll — Identity · 10 Dimensions (radar) · Life of the Creator · Creative Evidence™ · Creative Provenance™ · Writing Rooms · Collaboration Network (SVG graph) · Catalog · Publishing · Commercial · Awards · Mentorship · Ecosystem · Career Insights · ANCR Identity. Sticky Chapter Index rail. Identity-color persistence. **Crown jewel achieved.** No refinement needed.

### 🟢 `/sessions/:id/release` — Continuous Release Path (Phase 4)
11-stage documentary — Creative Evidence™ · RightsPrint™ · Ownership · Split Sheet · Publishing · Vaulta™ · Song Intelligence™ · Commercial Readiness · Release Readiness · Distribution · Life of a Song™. Documentary photography backdrops. Sticky stage index. Final "Ready when the creator is ready" gradient closer. **Mission control achieved.** No refinement needed.

### 🟢 `/writing-rooms` — Writing Rooms
6 rooms (Atlanta, Nashville, London, Lagos, Tokyo, Kingston) with live REC indicators, identity-color collaborator avatars, canonical cast legend. Matches the cinematic bar.

### 🟡 `/sessions` — Sessions list — **REFINEMENT NEEDED**
- Cinematic gradient headline "Every session, verified." ✓
- Chapter eyebrow ✓
- Nav unified ✓
- **Vision gaps:**
  - Session cards don't show which **Life of a Song stage** each song is at (stage indicator missing)
  - No **collaborator identity-color chips** on cards
  - No **Creative Evidence™ signal** (last activity / event count)
  - Grammar bug: `1 COLLABORATORS` — should be singular
- **Connection gaps:**
  - No cross-link to **Writing Rooms** where sessions may be happening
  - No cross-link to Creator DNA for each collaborator
- **Palette drift:**
  - "Join" button + `# INVITECODE` accent = **violet** — inconsistent with cool cobalt/indigo/sky palette established in Phase 1–4

### 🟡 `/vaulta` — Vaulta royalty rail — **REFINEMENT NEEDED**
- Cinematic gradient headline "Every work, every stream, **every dollar**." ✓
- 4 revenue tiles (Performance/Mechanical/Sync/Neighboring) ✓
- Works table ✓
- **Palette drift:** "every dollar." + "100.00%" + "66.67%" all in **violet** — should switch to indigo/sky
- **Vision gaps:**
  - Works table doesn't show **Life of a Song stage** per work
  - No **identity-color chips** per work
  - No **10-year revenue forecast chart** (currently only in Song Intelligence)
  - No aggregated **payout timeline** ("Next PRO distribution: ~90 days")

### 🟡 `/profile` — RightPrint™ — **REFINEMENT NEEDED**
- Cinematic DAW-screen hero photo ✓
- Chapter eyebrow "RIGHTPRINT · VERIFIED" ✓
- Gradient headline "Skyline UI" ✓
- Sectioned form (Identity · Basic · Publishing · Team) ✓
- Connected Services sidebar CTA ✓
- **Vision gaps:**
  - Feels like a **settings form** after the hero — body doesn't sustain the cinematic vibe
  - **No cross-link to Creator DNA™** — RightPrint IS the foundation of DNA and users should be able to jump into their living DNA from here
  - **No DNA-impact preview** — filling PRO/IPI/publisher should visibly grow the Business/Legacy dimensions
  - **Avatar is empty gray circle** — should carry identity color glow like every other surface
- **Palette drift:** section eyebrows in violet

### 🟡 `/sessions/:id` — Session Detail (small workspace) — **REFINEMENT NEEDED**
This is the "compact" workspace before the full Studio takes over. It has contribution log + splits panel + timeline but predates Phase 2 conventions.
- **Vision gaps:**
  - No **Life of a Song spine**
  - No **persistent identity-color strip**
  - No **Session Pulse Rail** (Intelligence + Evidence)
- **Connection gaps:**
  - Should visually flow into the full Studio, not feel like a separate page
- **Recommended:** Redirect `/sessions/:id` → `/sessions/:id/studio` OR wrap it in the Phase-2 cinematic hero so the two are indistinguishable

### 🟡 `/sessions/:id/dna` — Song DNA™ — **REFINEMENT NEEDED**
- Immutable event feed ✓
- 13 event types (color-coded) ✓
- Day-grouped timeline ✓
- **Vision gaps:**
  - **No cinematic hero** (like the other Phase 1-4 pages)
  - **No Life of a Song spine** at the top
  - Predates the Phase-2 pattern
- **Connection gaps:** Doesn't cross-link back to Studio / Release Path with the same rhythm
- Should be re-shelled to match Phase-2 aesthetic (same top-bar cinematic hero + spine)

### 🟡 `/sessions/:id/split-sheet` — Split Sheet — **MINIMAL REFINEMENT**
This is intentionally a printable document — different rules apply. But it still has:
- **Palette drift:** violet section eyebrows
- **Missing:** collaborator identity-color chip on signature cards
- **Missing:** small cross-link to Release Path (since this is invoked from Stage IV of the Release Path)

### 🟡 `/sessions/:id/intelligence` — Song Intelligence Report — **MODEST REFINEMENT**
This is a full-length AI-generated report. Cinematic already, but pre-Phase-1 palette.
- **Palette drift:** likely violet accents on cover badges (need re-check)
- **Vision gap:** No Life of a Song spine at top
- **Elevation opportunity:** Chapter numbering to match the Landing/Creator DNA/Release Path convention

### 🟡 `/settings/integrations` — Connected Services — **MINIMAL REFINEMENT**
Actually one of the best pages already — 90 integrations across 13 categories with permission chips.
- **Palette drift:** "ALL" filter chip highlighted in violet
- **Vision gap:** No cross-link back to Creator DNA (integrations shape the ANCR identity chapter)
- Otherwise: solid

### 🟡 `/vaulta` (already covered above)

### 🟡 `/sessions/new` — New Session — **NEEDS VISUAL RE-SHELL**
Predates the Phase-2 conventions. Form-driven. Missing cinematic hero, missing Life of a Song context ("this new session becomes Stage 1 · Idea").

### 🟢 `/report/:token` — Public Report
External stakeholder read-only view of the Intelligence Report. Password-gated. Presented cleanly — meets the bar.

---

## Cross-cutting observations

### 1. Palette drift is the #1 remaining inconsistency
**Phase 1–4 established** a cool cobalt / indigo / sky / violet-100 palette (`#818cf8`, `#38bdf8`, gradient white→indigo-100→violet-200). **Pre-Phase-1 surfaces** (Sessions list, Vaulta, Profile, Sessions/new, Split Sheet, Intelligence Report, Session Detail, Song DNA) still use the older **violet-500 accent** (`#8b5cf6`) inherited from the SONGRIGHT era.

This is the single fastest way to reinforce "the inside of INHEIRA feels like the public website." A palette pass would touch ~7 files and take a single ship.

### 2. Life of a Song™ spine is missing from ~5 legacy pages
Phase 1–4 established the persistent 10-stage spine as INHEIRA's signature. It appears on: Dashboard, Studio Session, Release Path. It is **missing** from: Sessions list, Session Detail, Song DNA, Split Sheet, Intelligence Report, Vaulta works table, New Session.

Elevating the spine to a **shared component** and dropping it onto these pages would complete the "the creator always knows where they are in the journey" promise.

### 3. Identity colors are inconsistent on legacy pages
Established on: Dashboard, Studio Session, Creator DNA, Release Path, Writing Rooms.
Missing on: Sessions list cards, Split Sheet signature cards, Vaulta works rows, Session Detail, Song DNA event rows (partial — uses per-event color but not per-collaborator).

### 4. Cross-linking is one-way in places
Creator DNA links to sessions ✓. Release Path links back to Studio + Split Sheet + Intelligence + Vaulta ✓. But **RightPrint doesn't link forward to Creator DNA**, **Vaulta doesn't link back to originating sessions**, **Sessions list doesn't link into Writing Rooms**.

### 5. Session Detail is now redundant
With the Studio Session doing everything the old Session Detail did (and more), `/sessions/:id` is an orphan. Two safe options:
- Redirect it to `/sessions/:id/studio`
- Turn it into a lightweight "session summary card" surface for quick glances

### 6. The public website has one thing the app doesn't
The **Chapter IX · Life of a Song** on Landing shows a 10-stage vertical timeline of a single hypothetical song's journey from bedroom idea → Grammy → legacy. The app's Life of a Song spine shows the *current* stage, but never shows the full *narrative arc* of a specific song. **This is the one narrative element Landing has that isn't yet inside the app.** Consider adding a "Life of this Song" film mode inside Studio or Release Path.

### 7. No creator sees empty states the same way
Empty state copy is inconsistent — some say "Awaiting first move…", some show italic "Not documented yet", some show large "The story is just beginning". A pass to align empty states around the same voice ("Every ___ becomes permanent evidence the moment it's documented") would tighten the identity.

---

## Prioritized refinement backlog (before next-gen features)

### P0 · Palette Unification (½ day)
Sweep every legacy surface, replace violet-500 accents with the Phase 1–4 cool palette. Files: `Sessions.jsx`, `Vaulta.jsx`, `Profile.jsx`, `NewSession.jsx`, `SplitSheet.jsx`, `SongIntelligence.jsx`, `SongDNA.jsx`, `ConnectedServices.jsx`, `SessionDetail.jsx`.

### P0 · Extract shared cinematic components (½ day)
- `<LifeSpine />` (currently duplicated in Dashboard + Studio + Release Path)
- `<ChapterBand />` (currently duplicated in Creator DNA + Release Path)
- `<CinematicHero />` (currently duplicated across 4 pages)

Once extracted, drop them onto Sessions list, Session Detail, Song DNA, Vaulta, Split Sheet.

### P1 · Sessions List Elevation (½ day)
Add Life of a Song stage indicator per card · identity-color collaborator chips · fix `1 COLLABORATORS` grammar · cross-link to Writing Rooms.

### P1 · Song DNA Re-shell (½ day)
Wrap the existing event feed in the Phase-2 cinematic hero + Life of a Song spine + persistent Session Pulse Rail. Preserve all event logic.

### P1 · RightPrint ↔ Creator DNA Bridge (¼ day)
Add prominent "Open your Creator DNA™" CTA on RightPrint hero · add avatar identity color · add DNA-impact preview ("This field grows your Business dimension").

### P1 · Vaulta Elevation (½ day)
Add Life of a Song stage per work · identity-color chips · 10-year forecast chart · payout timeline.

### P2 · Session Detail Consolidation (¼ day)
Redirect `/sessions/:id` → `/sessions/:id/studio` (or wrap in Phase-2 shell).

### P2 · New Session Cinematic (¼ day)
Re-shell form in the cinematic hero + "You are creating Stage 01 · Idea" context.

### P2 · "Life of THIS Song" film mode (1 day)
Inside Studio (or a new Release Path stage), show the specific song's full 10-stage arc as an animated vertical timeline (like Landing Chapter IX, but data-driven from real events).

### P2 · Empty state voice pass (¼ day)
One writing pass to align empty state copy across ~15 locations to the shared voice.

---

## What's ALREADY complete against the original vision

The **75-80%** you estimated is now closer to **90%** after Phase 1–4:

- ✅ Creative Evidence™ — surfaced platform-wide (Dashboard feed, Studio pulse rail, Creator DNA Chapter IV, Release Path Stage I)
- ✅ Creative Provenance™ — Creator DNA Chapter V node chain
- ✅ Creator DNA™ — 15-chapter living identity record
- ✅ Creator Passport™ — foundation chapter of DNA
- ✅ Life of a Song™ — persistent 10-node spine across Dashboard, Studio, Release Path (missing on 5 legacy surfaces)
- ✅ Writing Rooms — dedicated page + Dashboard live tiles + Creator DNA chapter
- ✅ RightsPrint™ — Release Path Stage II + Profile foundation
- ✅ Ownership — Studio Rights tab + Release Path Stage III
- ✅ Split Sheet — dedicated printable + Release Path Stage IV
- ✅ Publishing — Studio Publishing tab + Release Path Stage V
- ✅ Vaulta™ — dedicated + Release Path Stage VI
- ✅ Song Intelligence™ — full report + Studio pulse rail + Release Path Stage VII + Dashboard aggregated pulse
- ✅ Commercial Readiness — Release Path Stage VIII (7-axis radar) + Song Intelligence report
- ✅ Release Readiness — Studio Rights + Release Path Stage IX
- ✅ Distribution — Release Path Stage X + Connected Services
- ✅ Awards & achievements — Creator DNA Chapter XI
- ✅ Mentorship — Creator DNA Chapter XII
- ✅ Ecosystem — Creator DNA Chapter XIII + Connected Services
- ✅ ANCR ecosystem identity — Creator DNA Chapter XV
- ✅ Global collaborator identity colors — established, applied on Phase 1–4 surfaces

## What's STILL to build (next generation, per your priority order)

- ⏳ Creative Evidence Intelligence™ — ingestion + comparison engine (spec exists, no code)
- ⏳ Musical Contribution Intelligence™ — contribution scoring by musical region (spec exists, no code)
- ⏳ Whiteboards — collaborative canvas (nothing built)
- ⏳ Session Replay — scrubbable session timeline (nothing built)
- ⏳ Version History — cinematic diff viewer (nothing built)
- ⏳ Live Session Intelligence — real-time contribution pulse (Dashboard aggregate exists, per-session live doesn't)

---

## Recommendation

Ship the **P0 batch** (palette unification + shared cinematic components) first — half a day, single deploy, immediately closes the "still feels SaaS-shaped in places" gap. Then ship the **P1 batch** in one iteration (Sessions list · Song DNA · RightPrint bridge · Vaulta) — one to two days.

At that point every surface will pass the "feels like walking from Landing into the studio" test. Only then begin **CEI Phase 1**.
