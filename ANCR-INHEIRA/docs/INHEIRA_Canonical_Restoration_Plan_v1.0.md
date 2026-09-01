# INHEIRA™ — Canonical Restoration Plan v1.0

**Document owner:** Product + Platform Engineering
**Audience:** CTO, every engineer working on INHEIRA, future session agents
**Status:** Canonical · directive
**Created:** 2026-02-07
**Directive from user (verbatim):**
> "Restore the complete canonical INHEIRA product by incorporating every approved product specification, workflow, module, screen, interaction, feature, experience, prompt, and architectural decision created throughout the entire design process. The current application represents only part of the vision. Do not simplify. Do not remove. Do not substitute generic SaaS experiences where original INHEIRA experiences have already been designed. Build from all approved INHEIRA specifications, not just the most recent ones."

---

## 1. Restoration Principle

The current application implements a subset of the approved INHEIRA vision. The public landing page already reflects the complete vision. **The internal application must now reflect that same vision — end to end.**

This is a **restoration + augmentation** engagement:
1. **Restore** every previously-approved module, screen, interaction, and workflow.
2. **Augment** with the four architecture layers approved during the research + validation phase (Creative Evidence™, Creative Provenance™, Creator DNA™, Creative Interpretation Framework™) and the CEI/CIF concept vocabulary (Creative Influence™, Evidence Confidence™, Creative Narratives™, Creative Intent™, Contribution Classification™, Musical Contribution Intelligence™).
3. **Preserve** every existing working surface. Nothing is removed. Nothing is substituted with generic SaaS.

---

## 2. Current State (2026-02-07)

### 2.1 Already implemented and shipping
| Surface | Location | Status |
|---|---|---|
| Landing page (11 chapters) | `/` | Complete, canonical |
| Auth (register / login / Google OAuth) | `/auth` | Complete |
| Dashboard | `/dashboard` | Complete |
| Sessions list + create | `/sessions`, `/sessions/new` | Complete |
| Session detail (legacy) | `/sessions/:id` | Complete |
| **Studio Workspace** (12 tabs) | `/sessions/:id/studio` | Complete — Overview, Lyrics, Melody, Chords, Arrangement, Voice Memos, Files, Collaborators, Chat, Rights, Publishing, Analytics |
| Song DNA™ timeline | `/sessions/:id/dna` | Complete |
| Release Dashboard | `/sessions/:id/release` | Complete |
| Song Intelligence Report™ | `/sessions/:id/intelligence` | Complete (+ AI report + share links) |
| Public shared report | `/report/:token` | Complete |
| Split Sheet PDF | `/sessions/:id/split-sheet` | Complete |
| Creator Passport™ | `/creator/:user_id` | Complete |
| Connected Services (90 integrations) | `/settings/integrations` | Complete (mocked OAuth) |
| Vaulta™ | `/vaulta` | UI placeholder |
| Profile | `/profile` | Complete (RightPrint editor) |
| Sample creator on Landing | Landing Chapter VI | Danielle Stephens |

### 2.2 Approved but NOT yet implemented in the internal app
These experiences were approved during the design process, appear in the public landing narrative, but do not yet exist as internal routes:

| # | Experience | Priority |
|---|---|---|
| M-1 | **Writing Rooms** — persistent multi-collaborator writing environments; distinct from single-session Studio; support for camps across cities | P0 |
| M-2 | **Whiteboards** — collaborative visual brainstorming inside a session (idea walls, mood boards, references, structural sketches) | P0 |
| M-3 | **Session Replay** — time-scrubbed playback of every event across a session (Song DNA™ as an interactive timeline, not just a list) | P0 |
| M-4 | **Version History** — dedicated version-management UI (parallel to Studio; not the same as Song DNA™) | P0 |
| M-5 | **Session Intelligence™** — real-time in-session insights (distinct from post-session Song Intelligence™). Live pace, momentum, collaborator activity, motif detection, breakthrough moments | P0 |
| M-6 | **Commercial Intelligence** — dedicated commercial-lens view of Song Intelligence™ (streaming forecasts, sync eligibility, publishing readiness, DSP mapping) surfaced as its own destination | P1 |
| M-7 | **Ownership Dashboard as a first-class module** — currently a Studio tab; canonical spec elevates it to a full destination with cross-song portfolio views | P1 |
| M-8 | **Life of a Song™ as an interactive per-song destination** — currently rendered on Landing Chapter IX; missing inside the app as a per-song destination for logged-in users | P0 |
| M-9 | **RightPrint™ as a first-class module** — currently embedded in Profile; canonical spec surfaces it as a dedicated identity destination with verification badges, cross-session portability, professional credentials | P1 |
| M-10 | **ANCRID™** — federated identity provider (currently local INHEIRA JWTs) | P2 (v1.6 federation) |

### 2.3 Approved research-phase architecture NOT yet implemented
The four platform layers + CEI/CIF vocabulary from the canonical spec set (`/app/docs/`) are fully designed but not implemented:

| Layer | Approved spec | Implementation status |
|---|---|---|
| Creative Evidence™ (per-event) | `INHEIRA_Creative_Evidence_Intelligence_Spec_v1.0.md` | 0% — needs new collections + write paths in every Studio interaction |
| Creative Provenance™ (per-artifact chain) | `ANCR_Creative_Provenance_Platform_Spec_v1.0.md` | 0% — needs `provenance_nodes` collection + wrappers on every write |
| Creator DNA™ (per-creator lifetime graph) | `ANCR_Creator_DNA_Platform_Spec_v1.0.md` | 0% — needs derived collections + Creator Passport becomes DNA UI |
| Creative Interpretation Framework™ | `INHEIRA_Creative_Interpretation_Framework_Spec_v1.0.md` | 0% — needs shared library + every render passes `/cif/validate` |
| Creative Evidence Intelligence™ (CEI Phase 1) | Companion spec | 0% — musical version ingestion + comparison engine + ledger |
| CEI concept vocabulary | Same spec | 0% — Creative Influence™, Evidence Confidence™, Creative Narratives™, Creative Intent™, Contribution Classification™, MCI |

---

## 3. Restoration Execution Order

Sequenced so each tranche ships a coherent, testable increment. Every tranche results in an internal app that visibly closes the gap between the public promise and the internal experience.

### Tranche A — Structural restoration (top-level routes + navigation)
**Goal:** Every canonical destination has a real route and appears in the app's navigation.
1. Add routes: `/writing-rooms`, `/writing-rooms/:room_id`, `/sessions/:id/whiteboard`, `/sessions/:id/replay`, `/sessions/:id/versions`, `/sessions/:id/session-intelligence`, `/sessions/:id/life`, `/commercial-intelligence`, `/rightprint`.
2. Wire Nav.jsx + Studio sidebar to include the new destinations grouped canonically.
3. Every new page renders a **canonical premium shell** (dark editorial aesthetic, chapter framing, real data-driven or well-styled placeholder content) — NEVER a "coming soon" or generic SaaS stub.

### Tranche B — Writing Rooms (M-1)
**Goal:** Persistent multi-collaborator writing environments, distinct from single-session Studio, supporting writing camps across cities.
- List view: rooms grouped by camp / city / team; each room card shows active participants, current work-in-progress, and last activity.
- Room detail: shared lyrics workspace, shared voice memos, shared whiteboard, participant roster, timeline. Supports multi-session outputs (one room can generate many songs).
- Backend: new `writing_rooms` collection; endpoints `/api/writing-rooms/*`.
- Integrates with existing sessions — creating a session inside a room links them via `room_id`.

### Tranche C — Session Replay + Version History + Whiteboards (M-2, M-3, M-4)
- **Session Replay** — timeline scrubber over Song DNA™ events. Playhead reveals lyric state, contribution state, collaborator activity at any past moment.
- **Version History** — per-session and per-song version list with diff view (integrates with CEI comparison later).
- **Whiteboards** — collaborative canvas (initially: rich-text idea wall + image/reference embeds; later: real-time drawing when WebSockets land).

### Tranche D — Session Intelligence™ (M-5)
**Goal:** Real-time in-session insights, distinct from post-session Song Intelligence™.
- Live pace + momentum indicators
- Active-contributor heatmap
- Motif detection during the session (feeds Creative Provenance™ later)
- Breakthrough-moment markers
- Session pacing recommendations

### Tranche E — Life of a Song™ (M-8), Commercial Intelligence (M-6), Ownership Dashboard elevation (M-7), RightPrint™ elevation (M-9)
- Life of a Song per-song destination — the interactive version of the Landing Chapter IX timeline for authenticated users.
- Commercial Intelligence — dedicated commercial-lens destination; also becomes a subsection of Song Intelligence Report™.
- Ownership Dashboard as top-level destination with portfolio views across all a creator's songs.
- RightPrint™ as top-level identity destination.

### Tranche F — Platform stack Phase 0 (concurrent with all Tranches above)
Every write path introduced in Tranches A–E must publish:
1. A Creative Evidence™ record (extends existing `events` collection).
2. A Creative Provenance™ node (new `provenance_nodes` collection).
3. Automatic Creator DNA™ enrichment (async projection into new derived collections).
4. Pass through `/api/cif/validate` before render.

This is **not a separate tranche** — it is a discipline applied to every new write path added across A–E.

### Tranche G — CEI Phase 1 (Musical Contribution Intelligence™)
- MusicXML / MIDI / sheet-music / chord-chart ingest into `structured_documentation`.
- Creative Comparison Engine™ with the full change taxonomy.
- Creative Contribution Ledger™ (immutable append-only).
- Verified Contribution Agreements (VCAs) with sync to `sessions.splits` (resolves conflict C-9 from the ecosystem doc).
- Studio Musical Evolution + Compare Versions tabs.
- Ownership Dashboard "Composition (CEI)" lens.
- Every CEI render passes through CIF (Contribution Classification™, Evidence Confidence™, Creative Influence™, Creative Narratives™, Creative Intent™).

### Tranche H — Demo Mode (originally queued after Tranche A)
Public `/demo` route — read-only preview of a real INHEIRA session with all restored surfaces. Once Tranches A–D land, Demo Mode showcases them all without sign-in.

### Tranche I — ANCRID federation, Vaulta payments, real Connected Services OAuth
The v1.6+ platform-extraction milestones from `ANCR_Ecosystem_Architecture_v1.0.md`.

---

## 4. Non-Negotiable Restoration Rules

1. **Do not simplify.** If a spec calls for a particular interaction, build the interaction — do not substitute a lighter alternative.
2. **Do not remove.** Every currently-working surface remains working throughout every tranche.
3. **Do not substitute.** Where an INHEIRA-specific experience is designed (e.g., Writing Rooms, Session Intelligence), do not fall back to a generic SaaS pattern.
4. **Every render passes CIF.** From Tranche A onward, every new user-facing render of creative-evidence-adjacent data validates against the Creative Interpretation Framework™.
5. **Every write publishes Provenance.** From Tranche A onward, every new write path emits a Creative Provenance™ node.
6. **The public website is the reference for aesthetic and copy.** Internal pages inherit the same editorial dark palette, chapter framing, `font-mono-metadata` micro-labels, indigo/sky/lavender accent, celestial-arc motifs.

---

## 5. Cross-Reference Map — Spec to Surface

Every canonical spec maps to specific product surfaces so nothing is orphaned:

| Spec | Primary surfaces it drives |
|---|---|
| `INHEIRA_Technical_Specification_v1.0.md` | Every route + collection + endpoint currently shipping; adds M-1 through M-9 in Tranches B–E |
| `INHEIRA_Creative_Evidence_Intelligence_Spec_v1.0.md` | Studio "Musical Evolution" + "Compare Versions" tabs; Ownership Dashboard "Composition (CEI)" lens; Song Intelligence Report™ Creative Evidence™ block (Tranche G) |
| `ANCR_Creative_Provenance_Platform_Spec_v1.0.md` | New `provenance_nodes` collection + write-path wrappers (Tranche F, applied everywhere) |
| `ANCR_Creator_DNA_Platform_Spec_v1.0.md` | Creator Passport™ becomes DNA UI at Phase 0; ten growth dimensions surface as a new Passport tab (Tranche F + E) |
| `INHEIRA_Creative_Interpretation_Framework_Spec_v1.0.md` | Shared library used by every render surface across every tranche; `/cif/validate` firewall on every user-facing render |
| `ANCR_Ecosystem_Architecture_v1.0.md` | Governs identifier model, cross-module contracts, federation timeline; enforced from Tranche I onward |

---

## 6. Sequencing Rationale

**Why Tranche A first (structural restoration):** without visible routes + nav entries, every subsequent tranche's work is invisible. Users need to see the app matches the public promise before deep implementation lands.

**Why Tranche F applies to A–E, not as its own step:** the platform stack (Evidence → Provenance → DNA → CIF) is not a feature to build separately. It is a *discipline* applied to every write path. Retrofitting it later is exponentially more expensive than baking it in from Tranche A.

**Why CEI Phase 1 (Tranche G) after the structural restoration:** CEI depends on the musical-content ingest pipeline being non-trivial. The structural pieces (Musical Evolution tab surface, Compare Versions layout, Ownership Dashboard elevation) must exist first for CEI's outputs to have a home.

**Why Demo Mode (Tranche H) lands after Tranches A–D:** Demo Mode showcases the app. It is dramatically more compelling once Writing Rooms, Session Replay, and Session Intelligence™ exist. Delaying it prevents a "partial demo" that undersells the vision.

---

## 7. Success Criteria for "Complete Canonical Experience"

The restoration is complete when:
- Every module named in Section 2.2 (M-1 through M-10) has a real route, real navigation entry, and canonical premium implementation.
- Every write path publishes a Creative Provenance™ node.
- Every user-facing render passes `/cif/validate`.
- Creator DNA™ is derivable for every user from the Provenance graph.
- Every experience the public landing page promises exists inside the app for authenticated users.
- No user sees a "coming soon" placeholder or a generic SaaS substitute anywhere in the canonical experience.

---

## 8. What This Plan Does Not Contain

- Implementation code. (That lives in the app; each Tranche is a session or program of sessions.)
- Detailed UX mockups for each new module. (Each Tranche produces those in flight, guided by the public landing's aesthetic language.)
- Timeline estimates. (Deferred to CTO scheduling once the CTO-facing engineering docs are consumed.)

---

## 9. Immediate Next Actions

The next agent session (or the continuation of this one, when context permits) should:

1. Begin **Tranche A** — add the missing top-level routes and navigation entries.
2. Ship canonical premium shells for each new page. Copy pattern + aesthetic directly from the public landing sections that promise the same experience.
3. From Tranche A onward, apply the Tranche F discipline on every new write path.
4. Do not attempt more than one Tranche per session — each Tranche is significant.
5. Update this plan as tranches complete; add a "Completed" column to Section 3.

---

## 10. Anti-Pattern Log

The following patterns violate the restoration directive and must be avoided:

- Building a "unified experience" that quietly drops previously-approved features.
- Substituting a Shadcn out-of-the-box pattern where INHEIRA's canonical experience is already designed.
- Deferring platform-stack (Evidence / Provenance / DNA / CIF) publishing to "a later phase" once new write paths ship — this creates permanent retrofit debt.
- Building any new destination page without matching the public landing's editorial aesthetic (dark palette, chapter framing, mono-metadata micro-labels, indigo/sky/lavender accent, celestial motifs).
- Introducing a new architectural concept during restoration — the design phase is closed. All architecture is in the seven canonical docs.

---

*End of INHEIRA Canonical Restoration Plan v1.0.*
*This document supersedes any conflicting priorities from prior finish summaries. The restoration directive from the user takes precedence over the earlier "Option D: c → a → b" sequencing — that sequencing is folded into Tranche H of this plan.*
