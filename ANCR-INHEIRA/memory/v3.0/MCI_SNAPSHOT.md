# INHEIRA v3.0 — Musical Contribution Intelligence™ · SNAPSHOT

**Frozen**: 2026-02-08
**Status**: STABLE MILESTONE — do not modify without a new user directive.

Musical Contribution Intelligence™ analyses every piece of documented evidence
the platform has captured for a session (Creative Evidence™ events, version
submissions, acknowledgements, confirmed voice moments, and version lineage)
and returns an analytical picture of *documented musical contributions* per
contributor.

---

## Non-negotiable guardrails (all enforced + tested)

1. **MCI analyses documented musical contributions ONLY.**
2. **MCI does NOT determine legal ownership.**
3. **MCI does NOT assign publishing splits.**
4. **`mci_status` remains `awaiting_musical_contribution_analysis`** until the
   sufficiency gate is met.
5. **Sufficiency gate** — analysis runs only when ALL of:
     - `≥ 1` submitted version
     - `≥ 5` documented Creative Evidence™ events
     - `≥ 1` human-in-the-loop signal (acknowledgement OR confirmed/corrected
       voice moment)
6. **Attribution safety** — only voice moments with `human_status ∈
   {confirmed, corrected}` contribute to a contributor's attribution.
   Disputed / annotated / unconfirmed moments count only as sufficiency-gate
   human signals, never as attribution.
7. **Disclaimer is always visible** whenever contribution numbers are shown.

---

## Architecture (compute-on-demand · no background jobs · no new evidence created)

**Backend module: `/app/backend/mci.py`**
- `CATEGORIES` — mapping of contribution categories to the platform evidence
  kinds that support them (lyric, melody, harmony, arrangement, production,
  identifier, acknowledgement, voice_moment).
- `MIN_VERSIONS=1 · MIN_EVENTS=5 · MIN_HUMAN_SIGNALS=1` — sufficiency
  thresholds, deliberately conservative.
- `compute_mci_for_session(db, session_id)` — reads every input from the
  existing collections (`creative_versions`, `creative_evidence_events`,
  `creative_acknowledgements`, `voice_evidence`), tallies signals per
  contributor, computes a `documentation_share` (documentation-density
  measure, NOT ownership), and returns the analytical payload with a
  `confidence` tier + disclaimer.
- `stamp_versions_mci_status(db, session_id, status)` — updates every
  version's `mci_status` string so consumers see the resolved analytical
  state. Does not mutate any other version field.

**Endpoints (server.py)**
- `GET  /api/sessions/{sid}/mci`         — run analysis, return payload
- `POST /api/sessions/{sid}/mci/refresh` — re-run analysis on demand

**Frontend**
- `/app/frontend/src/components/studio/evolution/MciAnalysisPanel.jsx` —
  the single new UI surface. Consumes both endpoints, renders either the
  awaiting sufficiency-gate view (data-testid `mci-panel-awaiting`) or the
  analyzed view (data-testid `mci-panel-analyzed`), and always shows the
  legal-ownership disclaimer (data-testid `mci-disclaimer`).
- Mounted inside `VersionDetailSheet` as a new Section between CONTINUITY
  and INTEGRITY. No new tabs, no new pages, no new nav.

---

## What MCI reports per contributor

- Identity (name, RightPrint™ id, color)
- `total_signals` — count of documented signals attributable to them
- `documentation_share` — this contributor's signals ÷ total signals across
  the session. **Documentation-density measure. NOT an ownership share.**
- `categories` — signals broken down by contribution category, with a
  bounded list of `evidence_ids` per category so the record can always be
  traced back to the underlying evidence.

## What MCI reports overall

- `status` — `analyzed` · `awaiting_musical_contribution_analysis`
- `reason` (awaiting only) — per-threshold shortfall (`have` / `need`)
- `totals` — events · versions · acknowledgements · voice_records ·
  human_signals · total_signals
- `confidence` — tier + label (high · moderate · baseline · insufficient)
- `disclaimer` — persistent legal-ownership disclaimer
- `computed_at` — ISO timestamp

---

## Testing (testing_agent iteration_14 · 2026-02-08)

- **Backend: 100% — 72/72 pytest cases pass** across all four suites:
  - `test_mci_v3_0.py` — 11 new MCI cases (sufficiency gate; analyzed state
    on sess_96285667fb26; documentation_share sums to ≈1.0; disclaimer
    contains 'does not determine legal ownership' AND 'does not assign
    publishing splits'; stamp_versions_mci_status flips every version's
    mci_status; confidence_status stays frozen; voice-moment attribution
    safety — only confirmed/corrected contribute to attribution; disputed
    counts only as human signal; 401 when unauthenticated)
  - `test_cei_v2.py` — 26 CEI Phase 1 regression cases pass
  - `test_auto_doc_v2_1.py` — 16 Automatic Creative Documentation cases pass
  - `test_voice_evidence_v2_2.py` — 19 Voice Evidence cases pass (2 skipped
    are environment-dependent)
- **Frontend: 100%** — MCI section renders inside VersionDetailSheet with
  contributor cards, category chips, documentation_share %, refresh button,
  and disclaimer. All existing flows unchanged.

---

## Post-recovery verification (2026-02-08 · this session)

After a mid-build credit pause the user asked me to verify no Voice Evidence
code was damaged before continuing. Verified:
- Backend running ✓
- `/creator/evidence` exists exactly once ✓
- `SpeakerTag`, `MomentReview`, all voice endpoints, transcription pipeline
  fully intact ✓
- All 72 tests (CEI + Auto-Doc + Voice Evidence + MCI) still pass ✓

---

## Files added under this layer

- `backend/mci.py`
- `backend/tests/test_mci_v3_0.py`
- `frontend/src/components/studio/evolution/MciAnalysisPanel.jsx`

## Files touched (surgical)

- `backend/server.py` — 2 new endpoints + import of `mci_engine`
- `frontend/src/components/studio/evolution/VersionDetailSheet.jsx` — one
  new Section inserted before INTEGRITY

---

## STOP · Stable milestone

Do not start Comparison Engine or any new feature without an explicit user
directive on top of this snapshot.

Next-in-queue (when the user resumes):
1. Comparison Engine (compare *documented* versions side by side)
2. Voice Evidence in Version Detail (attach specific voice records to a
   version's dossier so the recording plays inline)
3. `/ecosystem` marketing landing (deferred)
