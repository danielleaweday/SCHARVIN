# CEI Phase 1 — Kickoff Plan
**Status:** v2.0 first build · scoped 2026-02-08

## Non-negotiables (from spec §2)
1. CEI documents; it never composes.
2. Every revision is immutable — nothing is ever overwritten.
3. Every "100% baseline" figure must render the Baseline Clarification (spec §2.1) adjacent.
4. Every conclusion must link back to recorded evidence.

## Phase 1 scope (minimum viable Creative Evidence™ ledger + version submission)
1. **New collection** `creative_versions` — append-only ledger of session version submissions
   - Fields: `version_id`, `session_id`, `submitter_id`, `submitter_name`, `submitter_color`, `label`, `notes`, `artifact_urls[]`, `created_at`
2. **Backend endpoints**
   - `POST /api/sessions/:id/versions` — submit a new version (writes an immutable row + logs a `version_submitted` session_event)
   - `GET /api/sessions/:id/versions` — list all versions chronologically
3. **Studio surface** — add an **"Evolution"** sub-tab under the **Write** chapter (preserves all existing 12 tabs; this is the 13th)
   - Cinematic panel showing every version as an identity-color node on a vertical timeline
   - Baseline Clarification disclaimer permanently rendered
   - "Submit new version" CTA + modal with label + notes + file drop
4. **Test IDs** — `evolution-tab`, `evolution-submit-btn`, `evolution-baseline-clarification`, `evolution-version-{version_id}`

## Deferred to Phase 2 (spec §5–§13)
- Automatic musical documentation (MIDI/MusicXML transcription of performances)
- Version comparison engine (baseline 100% → delta contribution scoring)
- Human Review panel
- Verified Contribution Agreement flow
- Object-storage ingestion for audio stems, DAW exports, sheet music
- Publishing to the ecosystem-wide Creative Provenance Graph™

## Deferred to Phase 3 (spec §14+)
- Ownership Dashboard "Composition (CEI)" lens
- Song Intelligence Report™ CEI block
- Public Report CEI surface
- PDF exports carrying baseline disclaimer

## Guardrails
- CEI never modifies the frozen v1.0 experience. All new work lives in additive routes / tabs / collections.
- Every UI surface that displays a "100%" carries the Baseline Clarification without exception (spec §2.1).
