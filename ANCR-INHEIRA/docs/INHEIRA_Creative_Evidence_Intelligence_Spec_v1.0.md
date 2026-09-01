# INHEIRA™ · Creative Evidence Intelligence™ — Feature Specification v1.0

**Document owner:** Engineering
**Audience:** CTO, senior engineers, MIR consultants, legal review, product design
**Parent module:** INHEIRA (see `INHEIRA_Technical_Specification_v1.0.md`)
**Status:** Canonical design · not yet implemented
**Created:** 2026-02-07
**Supersedes:** *INHEIRA Musical Contribution Intelligence™ Spec v1.0* (retired 2026-02-07)
**Related platform principle:** `ANCR_Creative_Provenance_Platform_Spec_v1.0.md` — CEI is INHEIRA's canonical implementation of Creative Provenance™ for songwriting and musical works. Every CEI ledger entry, Verified Contribution Agreement, and version submission publishes a provenance node into the ecosystem-wide Creative Provenance Graph™.

---

## 1. Purpose

**Creative Evidence Intelligence™ (CEI)** is a **human-first documentation and evidence system**. It preserves, analyzes, and visualizes how songs evolve through collaboration.

CEI is **not** an artificial intelligence songwriting system.
- It does **not** compose music.
- It does **not** replace musicians.
- It does **not** determine legal ownership.

Its sole purpose is to faithfully preserve the creative history of a song and provide transparent, evidence-based documentation of every meaningful musical contribution made by human creators.

CEI extends INHEIRA's existing **Creative Evidence™**, **Life of a Song™**, **Ownership Dashboard™**, **Song Intelligence™**, and **Session Intelligence™** systems.

---

## 2. Creator First™ Philosophy — Non-Negotiable Principles

Every feature in CEI must reinforce these:

1. **Technology should never replace the artist.** Technology should preserve the artist.
2. **Technology should document creativity.** Technology should never become the creator.
3. **Human creators are always the source of creativity.** Technology only documents and organizes evidence.
4. **Every creative artifact is preserved.** Nothing is ever overwritten.
5. **Every revision is immutable.**
6. **Every contribution is transparent and traceable.** Every conclusion links back to recorded evidence.
7. **The complete creative journey of every song remains permanently verifiable.**

CEI is **the historian, archivist, and evidence keeper** for human creativity.

### 2.1 Baseline Clarification (canonical statement — must appear in every CEI UI surface that shows the 100% baseline)

> *A baseline contributor beginning at 100% represents 100% of the documented creative material contained in that baseline version being analyzed. It does not represent 100% legal ownership of the composition, publishing, master or any other right.*

This statement is the load-bearing legal firewall of Creative Evidence Intelligence™. It must be rendered adjacent to every "100%" figure in:
- The Studio "Musical Evolution" tab (the first version submission modal)
- The Compare Versions tab
- The Ownership Dashboard "Composition (CEI)" lens
- The Song Intelligence Report™ Creative Evidence™ block
- The Public Report (`/report/:token`) view-only surface
- Any PDF or file export that surfaces CEI percentages
- The Human Review panel described in §13

Any UI surface that displays a CEI percentage without either this statement or the shorter Ownership Separation disclaimer (§14) is a regression.

---

## 3. Primary Goal

Build the world's most comprehensive system for documenting the complete musical evolution of a song while ensuring every contributor receives transparent, evidence-based recognition for their creative work.

For every song, CEI preserves:
- who contributed
- what they contributed
- when they contributed
- how the song changed
- why the change occurred
- supporting evidence
- complete revision history

---

## 4. Supported Contribution Methods

Musicians may contribute using any of:
- Live studio performances
- Writing room sessions
- Instrument stems
- DAW session exports
- MIDI · MusicXML
- Audio recordings
- Sheet music · lead sheets · chord charts
- Individual instrument recordings

**No musician should ever be required to understand notation software.** CEI adapts to the musician — never the reverse.

---

## 5. Creative Evidence Capture™

Every session automatically records:

| Signal | Source |
|---|---|
| Contributor identity | ANCRID™ (via existing `users.user_id` today; federated to `ancr_id` in v1.6) |
| Instrument | Session participant metadata |
| Session | `session_id` |
| Timestamp | UTC ISO on every ingest |
| Uploaded files | Emergent Object Storage |
| Recordings | Audio/stems into Object Storage |
| Edits | Every lyric line / arrangement change |
| Revisions | Every version file |
| Comments | Studio chat + Song DNA™ events |
| Arrangement changes | Structural updates |
| Version history | `creative_versions` collection |
| Collaborator activity | Presence + contribution logs |

**Every revision becomes immutable Creative Evidence™.**

---

## 6. Automatic Musical Documentation

When a musician contributes through performance rather than written notation, CEI **automatically generates structured musical documentation for internal comparison purposes**.

Critical framing:
> This documentation exists only to preserve creative evidence.
> It is **never** presented as replacing the musician's work.
> The original human performance is **always** preserved unaltered.

Whenever technically feasible, CEI converts performances into:
- Structured notes · measures · phrases
- Chord information · harmonic movement
- Rhythm · time signatures · tempo
- Arrangement structure · section boundaries
- Instrument mapping · orchestration

The generated documentation is stored **alongside** the original recording, never in place of it. Every reference in the ledger points to both:
- `original_performance_file_id` (the immutable human artifact)
- `structured_documentation_id` (the derived comparison document)

---

## 7. Data Model

Additions to the MongoDB schema. Human-readable IDs consistent with the existing convention.

### 7.1 `creative_versions` (new collection)
| Field | Type | Notes |
|---|---|---|
| `version_id` | string PK | `cev_<hex12>` |
| `session_id` | string FK | → `sessions` |
| `version_number` | int | monotonically increasing per session |
| `contributor_id` | string FK | → `users.user_id` (future `ancr_id`) |
| `submitted_at` | ISO | |
| `source_type` | enum | `live_performance` \| `writing_room` \| `stem` \| `daw_export` \| `midi` \| `musicxml` \| `audio_recording` \| `sheet_music` \| `lead_sheet` \| `chord_chart` \| `individual_recording` |
| `original_file_id` | string FK | → `files` (raw human artifact, immutable) |
| `structured_documentation` | object \| null | Canonical machine-readable form — see §7.2. Null when the format cannot be structured yet; the version still counts as evidence. |
| `is_baseline` | bool | true for version 1 |
| `parent_version_id` | string \| null | previous version compared against |
| `comparison_summary` | object | see §7.4 |
| `contributor_notes` | string | plain-text context from the contributor |
| `documentation_confidence` | float 0–1 | how confident CEI is in the auto-generated structured documentation |

**Indexes:** `(session_id, version_number)` unique, `contributor_id`.

### 7.2 `structured_documentation` — canonical schema
Format-agnostic. Every ingested contribution normalized to:
```json
{
  "meta": { "key": "E minor", "tempo": 124, "time_signature": "4/4", "duration_ms": 224000 },
  "sections": [
    { "name": "Intro",    "start_measure": 1,  "end_measure": 8 },
    { "name": "Verse 1",  "start_measure": 9,  "end_measure": 24 },
    { "name": "Chorus",   "start_measure": 25, "end_measure": 40 }
  ],
  "instruments": [
    { "instrument": "bass", "measures": [ { "index": 1, "notes": [...], "chord_symbols": ["Em"] } ] }
  ],
  "chord_progression": [ { "measure": 1, "beat": 1, "chord": "Em", "voicing_hash": "..." } ],
  "motifs": [ { "motif_id": "m01", "measures_present": [12, 18, 34], "type": "melodic" } ],
  "form": ["Intro", "Verse 1", "Pre-Chorus", "Chorus", "Verse 2", "Bridge", "Outro"]
}
```

Motifs are surfaced explicitly to enable §9 **Musical Idea Analysis™**.

### 7.3 `creative_contribution_ledger` (new collection · immutable, append-only)
| Field | Type |
|---|---|
| `entry_id` | string PK (`ccl_<hex14>`) |
| `session_id` | string FK |
| `version_id` | string FK → `creative_versions` |
| `contributor_id` | string FK |
| `contribution_kind` | enum: `original_baseline` \| `arrangement` \| `reharmonization` \| `voicing` \| `melody` \| `counter_melody` \| `bassline` \| `rhythm` \| `motif_introduced` \| `motif_developed` \| `section_added` \| `section_replaced` \| `structural_change` |
| `documented_pct_before` | float | Prior documented creative contribution % |
| `documented_pct_after` | float | New documented creative contribution % |
| `section_scope` | string \| null | e.g., "Chorus" — evidence-limited attribution |
| `measure_range` | [int, int] \| null | narrow scope |
| `confidence` | float 0–1 | |
| `evidence_refs` | array | `[{version_id, region_hash, file_id, comment_id?, event_id?}]` |
| `created_at` | ISO | |

**Never updated. Never deleted.** Historical percentages are preserved for every version.

**Indexes:** `(session_id, created_at)`, `contributor_id`.

### 7.4 `comparison_summary` (embedded in `creative_versions`)
```json
{
  "compared_to_version": 2,
  "regions": [
    {
      "section": "Verse 1", "instrument": "piano",
      "changes": [
        { "kind": "added",         "measures": [12, 13, 14, 15] },
        { "kind": "reharmonized",  "measures": [16, 17],   "prev_chords": ["Em","G"], "next_chords": ["Em7","Cmaj9"] },
        { "kind": "replaced",      "measures": [18, 19, 20] },
        { "kind": "retained",      "measures": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] }
      ]
    }
  ],
  "documented_contribution_delta": {
    "user_marcus":   { "before": 100.0, "after": 82.0 },
    "user_danielle": { "before": 0.0,   "after": 18.0 }
  }
}
```

Change taxonomy per user brief: `retained · added · modified · removed · replaced · reharmonized · rearranged · expanded`.

### 7.5 `verified_contribution_agreements` (new collection)
Human-adjudicated agreements. Both CEI's documented contribution and the collaborators' agreement are preserved. **Never overwrites the ledger.**

| Field | Type |
|---|---|
| `agreement_id` | string PK (`vca_<hex>`) |
| `session_id` | string FK |
| `contributor_id` | string FK |
| `documented_creative_contribution_pct` | float | Snapshot from ledger at time of agreement |
| `agreed_legal_ownership_pct` | float \| null | Set by collaborators (may differ) |
| `disposition` | enum: `approved` \| `modified` \| `disputed` \| `context_added` \| `pending_review` |
| `context_notes` | string | Human explanation |
| `signed_by` | array `[{user_id, signed_at, signature}]` |
| `linked_ledger_entries` | array of `entry_id`s |
| `created_at`, `updated_at` | ISO |

### 7.6 Extensions to existing collections
- **`sessions`** — new fields:
  - `cei_enabled: bool` (default false)
  - `cei_current_scores`: `{[user_id]: {whole_song_pct, sections: {[section]: pct}}}` — denormalized snapshot for UI reads.
  - `cei_lineage`: ordered array of `version_id`s.
- **`events` (Song DNA™)** — new event kinds:
  - `cev_submitted`
  - `cei_evidence_recalculated`
  - `vca_signed`
  - `motif_detected`

---

## 8. Creative Comparison Engine™

Whenever a new version is saved, CEI compares it against the previous verified version and produces a `comparison_summary`.

### 8.1 Comparison unit
`(section, instrument, measure)` triples. Every measure gets a voicing-aware hash. Rhythm and chord progressions are hashed independently to support per-dimension change detection.

### 8.2 Change classification
| Kind | Definition |
|---|---|
| `retained` | Measure hash matches previous version |
| `added` | New measure not present in prior version |
| `modified` | Same index, different hash, ≥ 20% material overlap |
| `replaced` | Same index, different hash, < 20% overlap |
| `reharmonized` | Chord progression changed while melody/rhythm retained |
| `rearranged` | Same material moved to a different section |
| `expanded` | Existing section grown by inserted measures |
| `removed` | Measure existed prior, absent now |
| `derived` | Motif hash matches an earlier motif under transformation (transpose · retrograde · augment · invert) |

### 8.3 Attribution accrual
Attribution is **evidence-weighted, not divide-by-N**. For each triple, a material weight `w` is computed:
```
w = f(note_density, harmonic_novelty, rhythmic_novelty, motif_significance, section_prominence)
```
Contribution accrual:
```
weight(user) += w × kind_multiplier[change_kind]
```
Kind multipliers (initial defaults; theorist-tunable in `/app/backend/config/cei_weights.json`):
- `retained` → 0 (retained weight stays with prior contributor)
- `added` / `replaced` → 1.0
- `reharmonized` → 0.7
- `modified` → 0.5
- `expanded` → 0.4
- `derived` → 0.35
- `rearranged` → 0.25
- `removed` → 0 (subtracts from prior contributor's retained weight)

Final documented contribution:
```
documented_pct(user) = weight(user) / sum(weight(all users)) × 100
```
Computed **whole-song** and **per-section independently**. The two are not required to be equal.

---

## 9. Musical Idea Analysis™

CEI evaluates musical **ideas**, not just note counts. Analysis dimensions:

| Dimension | What it measures |
|---|---|
| **Melody** | Melodic contour, pitch centre, interval vocabulary, repetition/variation |
| **Harmony** | Chord vocabulary, harmonic rhythm, functional vs modal movement, reharmonization |
| **Rhythm** | Meter, sub-division, syncopation, groove |
| **Arrangement** | Instrument entry/exit, dynamics, texture density |
| **Structure** | Section order, section length, form archetype |
| **Orchestration** | Instrument selection, register distribution |
| **Instrumentation** | Additive vs substitutive part-writing |
| **Voicings** | Chord voicing complexity, voice-leading, doublings |
| **Transitions** | Section-to-section connective material |
| **Riffs** | Repeating short instrumental phrases |
| **Motifs** | Recurring melodic/rhythmic ideas |
| **Recurring themes** | Cross-section idea reappearance |
| **Musical phrases** | Phrase-length grouping, question-answer pairing |
| **Section development** | How a section evolves across versions |

Every dimension contributes to the material weight `w` in §8.3 with a configurable multiplier. Attribution is not simply "you added 4 measures" — it accounts for whether those 4 measures introduced a motif, reharmonized a chorus, or transitioned two sections.

---

## 10. Creative Contribution Ledger™

Permanent per-session ledger. Historical records are **never replaced**.

Example evolution:
```
Version 1 — 2026-01-14 · Studio · Atlanta
  Marcus      Original bass arrangement       Documented Creative Contribution   100%

Version 2 — 2026-01-18 · Piano session · LA
  Marcus      Retained bass arrangement       Documented Creative Contribution    82%
  Danielle    Piano voicings + reharmonized    Documented Creative Contribution    18%
                                                Chorus (mm. 33–36)

Version 3 — 2026-01-21 · Guitar overdub · Nashville
  Marcus      Retained bass arrangement                                            74%
  Danielle    Retained piano voicings                                              17%
  Chris       Rhythm guitar arrangement, Bridge motif                               9%
```

Every recalculation is a new immutable event in **Life of a Song™** and **Creative Evidence™**.

---

## 11. Song Evolution Timeline™ (extension of Life of a Song™)

Expand the existing Life of a Song™ (currently rendered on the Landing page and inside the Studio) with a **visual timeline** dedicated to musical evolution:

- Original Idea
- First Recording
- Session Contributions
- Arrangement Changes
- Section Additions
- Musical Revisions
- Approved Versions
- Final Master
- Publishing
- Release

Every timeline node deep-links to its supporting **Creative Evidence™** — the version file, the ledger entry, the audio stem, or the human comment that produced it.

---

## 12. Confidence & Transparency

Every CEI-generated analysis surfaces:
- The **documented evidence** (version files, ledger entries, comment refs)
- The **comparison summary** (which regions changed, how they were classified)
- A **confidence level** (0–1)
- The **supporting revisions** (previous version IDs)

**Never present undocumented conclusions.** Every conclusion must trace back to recorded evidence.

When `confidence < 0.5`, the UI defaults collaborators to **Request Review** rather than **Approve**.

---

## 13. Human Review Workflow

**CEI never makes final decisions.** It presents documented evidence.

Every recalculation surfaces a per-contributor panel:
```
┌── Creative Evidence — Danielle · Piano ────────────────────────────┐
│                                                                     │
│  Documented Creative Contribution:  18%   (confidence 0.82)         │
│                                                                     │
│  Evidence:                                                          │
│    · Added voicings in Verse 1, mm. 12–15                          │
│    · Reharmonized Chorus, mm. 33–36                                 │
│    · Motif "Cmaj9 → Am9" — introduced Version 2                    │
│                                                                     │
│  [ Approve ] [ Modify ] [ Dispute ] [ Add Context ] [ Request Review ] │
└─────────────────────────────────────────────────────────────────────┘
```

Actions:
- **Approve** → creates a `verified_contribution_agreements` entry with `disposition=approved` and `agreed_legal_ownership_pct = documented_creative_contribution_pct`.
- **Modify** → opens numeric editor; the VCA stores both values.
- **Dispute** → opens a session-scoped discussion thread; VCA held in `pending_review`.
- **Add Context** → attaches a human explanation; VCA disposition `context_added`.
- **Request Review** → notifies session owner + optional designated arbiter.

**The original documented evidence and the collaborators' final agreement both become permanent records.**

---

## 14. Ownership Separation — Legal Firewall

CEI documents **creativity**. It does **not** determine legal ownership.

The Ownership Dashboard™ presents two adjacent columns for every contributor:

| Contributor | Documented Creative Contribution | Agreed Legal Ownership |
|---|---|---|
| Marcus | 74% | Pending |
| Danielle | 17% | 15% |
| Chris | 9% | Pending |

Persistent disclaimer, rendered wherever CEI numbers appear (Ownership Dashboard, Song Intelligence Report™ Creative Evidence™ block, public share reports):

> *INHEIRA documents creativity — it does not determine legal ownership. Documented Creative Contribution is an evidence-based estimate. Agreed Legal Ownership is set by the collaborators.*

Two independent records are maintained forever:
1. **Documented Creative Contribution** (from CEI ledger)
2. **Agreed Legal Ownership** (from Verified Contribution Agreements)

The system informs ownership discussions — it does **not** replace them.

---

## 15. API Surface

All routes prefixed `/api/cei`. JWT + session-collaborator authorization enforced.

| Method | Route | Purpose |
|---|---|---|
| POST | `/cei/{session_id}/ingest` | Multipart upload · body: `{source_type, contributor_notes?, section_scope?}` · returns `{version_id, structured_documentation_id, confidence}` |
| GET | `/cei/{session_id}/versions` | Ordered list of every version |
| GET | `/cei/{session_id}/versions/{version_id}` | Full canonical documentation + original file reference |
| GET | `/cei/{session_id}/compare?from={v1}&to={v2}` | Comparison summary + weight delta |
| GET | `/cei/{session_id}/ledger` | Full immutable ledger |
| GET | `/cei/{session_id}/scores` | Current scores (whole-song + per-section) |
| GET | `/cei/{session_id}/timeline` | Song Evolution Timeline™ payload |
| POST | `/cei/{session_id}/agreement` | Create Verified Contribution Agreement · body: `{contributor_id, disposition, agreed_pct?, context_notes?}` |
| PATCH | `/cei/{session_id}/agreement/{agreement_id}/sign` | Signature: `{signature}` |
| GET | `/cei/{session_id}/agreements` | List all VCAs |

Errors follow the existing `HTTPException {detail}` contract.

---

## 16. UI Specification

### 16.1 New Studio tabs
Extend the 12-tab Studio to add:
- **Musical Evolution** — canonical rendered notation for the current version (OSMD / Verovio) alongside the original human recording. Play both together.
- **Compare Versions** — split-pane diff. Legend: retained · added · modified · replaced · reharmonized · rearranged · expanded · removed.

### 16.2 Ownership Dashboard extension
Add a **Composition (CEI)** lens next to the existing 6 lenses. Displays Documented Creative Contribution vs Agreed Legal Ownership side by side, section pills, and one-click drill into the change evidence.

### 16.3 Landing / Life of a Song
The existing Chapter IX "Life of a Song" timeline gains real ledger nodes once CEI is live — every version submission and every recalculation becomes a new node on the timeline (`Version 2 · +18% Danielle`).

### 16.4 Song Intelligence Report™ integration
The Creative Evidence™ block of the Song Intelligence Report™ gains:
- Version lineage (V1 → V2 → V3 …)
- Per-version bar chart of documented creative contribution
- Section-level heatmap (rows = contributors, columns = sections, cell shade = % of that section attributable)
- Persistent Ownership Separation disclaimer
- View-only in public shared reports; raw file paths never leak

---

## 17. Ecosystem Integration

| Module | CEI touchpoint |
|---|---|
| **Creative Evidence™** | CEI is the canonical writer to the Creative Evidence™ ledger. |
| **Life of a Song™** | Every version + recalculation becomes a timeline node. |
| **Song Intelligence™** | Report renders the Creative Contribution Ledger + Section heatmap. |
| **Ownership Dashboard™** | Adds Composition (CEI) lens; enforces the two-column Documented vs Agreed view. |
| **Rights Management™** | Verified Contribution Agreements feed the rights workflow. |
| **Session Intelligence™** | Emits real-time recalc events during live sessions. |
| **Writing Rooms™** | Multi-user version submissions during camp sessions. |
| **Publishing Command Center™** | Agreed Legal Ownership values populate publisher/PRO exports. |
| **ANCRSYNC™** | Motif hashes from `structured_documentation` feed sync-catalog matching. |
| **ANCRLAB™** | Studio-captured audio automatically becomes CEI evidence with `source_type=live_performance`. |
| **COHEIR™** | Verified Contribution Agreements feed COHEIR's estate-planning ledger. |
| **VAULTA™** | Agreed Legal Ownership (not Documented Contribution) drives royalty allocation. |
| **ANCRID™** | Every ledger entry references `ancr_id` once federation lands (`user_id` today). |

---

## 18. Ingestion Pipeline

```
Contribution upload ─▶ /api/cei/{session_id}/ingest ─▶ Normalizer
                                                              │
                     ┌────────────────────────────────────────┤
                     ▼                                        ▼
             Original artifact                       Structured documentation
             (immutable, never altered)              (canonical schema)
                     │                                        │
                     └────────────────┬───────────────────────┘
                                      ▼
                             Creative Comparison Engine™
                                      │
                              (vs previous version)
                                      │
                                      ▼
                             Musical Idea Analysis™
                                      │
                                      ▼
                              Attribution Scorer
                                      │
                                      ▼
                    creative_contribution_ledger (append)
                                      │
                                      ▼
                  sessions.cei_current_scores (denormalized)
                                      │
                                      ▼
                    events (Song DNA™) · cei_evidence_recalculated
                                      │
                                      ▼
                       Human Review panel surfaced to collaborators
```

---

## 19. Supported Formats — Phase 1

| Format | Parser | Notes |
|---|---|---|
| MusicXML | `music21` | Canonical target |
| MIDI · SMF | `mido` + `music21` | Timing quantized to 480 PPQ |
| DAW session export | Format-specific adapters (Ableton .als → MIDI/audio) | Best-effort; fall back to stem-level ingest |
| Instrument stems | Store + optionally auto-document (Phase 2 analysis) | Original always preserved |
| Audio recordings | Store + auto-document (Phase 2 pipeline) | See §22 |
| PDF sheet music | OMR (Audiveris) → MusicXML → music21 | Confidence flagged; `documentation_confidence < 0.75` |
| Chord chart | Custom text parser + music21 | Markdown-esque input accepted |
| Lead sheet | Custom parser + music21 | |
| Individual instrument recordings | Store + Phase 2 analysis | |

**No musician is ever required to submit notation.** Audio, stems, and DAW exports are first-class.

---

## 20. Success Criteria — Phase 1 Exit

- MusicXML + MIDI ingestion round-trips 100% of the canonical schema on a 50-song test corpus.
- Comparison Engine identifies `added / modified / replaced / removed / reharmonized` at ≥ 90% precision on a music-theorist-labelled ground truth of 20 version pairs.
- No CEI-calculated percentage ever moves into `agreed_legal_ownership_pct` without an explicit human signature stored in `verified_contribution_agreements`.
- Every recalculation appears in Song DNA™ within 60 seconds of ingest.
- Public share reports render the ledger view-only without any raw file leakage.
- Original human artifacts (audio, stems, DAW files) are always preserved unaltered — verified by hash comparison at read time.

---

## 21. Engineering Principles

CEI is built as a **modular service**. Future phases may improve analysis methods, but the core architecture must always preserve:

1. **Human creators are always the source of creativity.**
2. **Technology exists only to document and organize evidence.**
3. **Every creative artifact is preserved.**
4. **Every revision is immutable.**
5. **Every contribution is transparent and traceable.**
6. **Historical records are never overwritten.**
7. **The complete creative journey of every song remains permanently verifiable.**

Any implementation that violates these principles is a regression, regardless of performance or accuracy gains.

---

## 22. Roadmap

### Phase 1 · Structured-input CEI (target: 8–10 weeks)
1. Canonical `structured_documentation` schema + music21 ingestor for MusicXML + MIDI.
2. Creative Comparison Engine™ + baseline scorer.
3. `creative_versions` + `creative_contribution_ledger` + `verified_contribution_agreements` collections.
4. Studio "Musical Evolution" + "Compare Versions" tabs.
5. Ownership Dashboard "Composition (CEI)" lens.
6. Human Review Workflow (Approve · Modify · Dispute · Add Context · Request Review).
7. PDF-OMR (Audiveris) ingest.
8. Chord chart · lead sheet · tab ingest.
9. Song Intelligence Report™ integration.

### Phase 2 · Performance-derived CEI (target: additional 5–6 months)
For musicians who don't submit notation — the same engine, different evidence source.

```
audio / stem upload
     ▶ instrument classification
     ▶ musical event extraction (basic-pitch · MT3 · omnizart · Demucs stems)
     ▶ canonicalize to structured_documentation
     ▶ Creative Comparison Engine™ (reused from Phase 1)
     ▶ ledger append with source_type=live_performance | audio_recording
```

Phase 2 additions:
- Ambiguity flag — audio-derived documentation carries higher uncertainty; `documentation_confidence` typically 0.4–0.75. UI defaults to **Request Review**.
- Authorship-vs-performance discipline — the engine detects **new material** vs performance of existing material.
- Fingerprint alignment — new audio's musical events are compared against prior versions' rendered audio to catch performance-of-existing-part cases.

### Phase 3 · Cross-session and real-time CEI
- Cross-session motif attribution (a bass line invented in session A appears in session B — the original bassist retains attribution via `derived_from_session_id`).
- Real-time attribution during ANCRLAB sessions (streaming Comparison Engine).
- Reharmonization detection with music-theoretic weighting.
- Session Intelligence™ live contributor feedback.

---

## 23. Legal & Compliance Notes

- CEI-calculated percentages are shown alongside a persistent disclaimer separating them from legal ownership.
- Public share reports include the disclaimer in the Creative Evidence™ block.
- Verified Contribution Agreements are cryptographically signed (same signature model as existing split approvals) and stored append-only.
- The system never claims CEI outputs are admissible as legal proof of ownership; it presents them as **evidence for negotiation**.
- Original human artifacts (audio, MIDI, MusicXML, DAW files) are stored unaltered and hashed at ingest; hash mismatches on future reads are logged and surfaced.

---

## 24. Open Design Questions

1. **OMR quality floor** — Audiveris is best-in-class open source but confidence on complex jazz voicings is moderate. Should Phase 1 require MusicXML/MIDI-only for high-stakes sessions?
2. **Section prominence weighting** — chorus > verse feels correct commercially, but is defensibly not universal (through-composed works). Genre-configurable? Session-configurable?
3. **Section detection from unlabeled inputs** — MIDI files rarely carry section markers. Do we require the contributor to label sections, or auto-detect via harmonic segmentation?
4. **Cross-session attribution** — if a bass line invented in session A appears in session B by a different arranger, does the original bassist retain CEI attribution in session B? (Recommended: yes, with a `derived_from_session_id` back-reference — deferred to Phase 3.)
5. **Storage cost** — canonical `structured_documentation` for a 4-minute song ≈ 50–200 KB. At scale, may warrant compression or S3 offload; MongoDB inline is fine to ~10 TB.
6. **Real-time vs batch analysis** — should live studio sessions get streaming CEI, or is post-session recalculation sufficient? Recommended: batch in Phase 1/2, streaming in Phase 3.

---

## 25. Final Vision

Creative Evidence Intelligence™ becomes the foundation of INHEIRA's **Creator First™** philosophy — preserving the complete story of every song, documenting every meaningful contribution, and ensuring that human creativity remains at the center of every decision.

**This is not about building an AI songwriter.**
**This is about building the world's most trusted system of record for creative collaboration** — where technology serves as the historian, archivist, and evidence keeper for human creativity.

Every contribution deserves recognition.
Every creative decision deserves to be preserved.
Every creator deserves evidence they were there.

---

*End of Creative Evidence Intelligence™ Specification v1.0. Supersedes Musical Contribution Intelligence™ Spec v1.0.*
