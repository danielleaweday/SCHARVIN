# INHEIRA™ Comparison Engine · v3.1 · SNAPSHOT
**Frozen milestone — 2026-02-08**

The Comparison Engine is the last capability shipped before the v3.1 lock.
Everything below is verified by `testing_agent` iteration_15 (16/16 backend
pytests + full frontend acceptance).

---

## What it is
Side-by-side documentary comparison of any two documented versions in the
same session. Every statement in the response is traceable back to real
Creative Evidence™ — no inference, no invention.

## Non-negotiable guardrails (verified)
- Every diff entry cites its source `evidence_id` / `artifact_id` / `ack_id`.
- Undocumented changes are **never** surfaced — silence returns
  "no documented change".
- The engine is a **documentation & analysis tool**. It does NOT determine
  legal ownership and does NOT assign publishing splits. Amber disclaimer
  rendered on every open sheet, verified via `data-testid="comparison-disclaimer"`.
- MCI is referenced (session-level), never recomputed per-version.
- Response ordering is deterministic: the earlier `created_at` is always
  presented as `a`, so swapping the query params produces the same output.

## API surface
| Method | Path | Description |
|---|---|---|
| GET | `/api/sessions/{session_id}/comparison?a=<ver_a>&b=<ver_b>` | Full comparison payload |

**Response keys**: `session_id`, `a`, `b`, `lineage`, `metadata`, `prose`,
`decisions`, `participants`, `environment`, `evidence_artifacts`,
`acknowledgements`, `voice_evidence`, `between_events`, `between_event_count`,
`mci`, `disclaimer`, `computed_at`.

**Lineage values** (fixed vocabulary): `a_is_parent_of_b`, `b_is_parent_of_a`,
`siblings`, `unrelated`.

**Between-window semantics**: `created_at > a.created_at AND
created_at <= b.created_at` against `creative_evidence_events`. Verified
by pytest.

## Files
- Backend engine: `/app/backend/comparison.py`
- Backend route: `/app/backend/server.py` (lines 1939-1955)
- Frontend sheet: `/app/frontend/src/components/studio/evolution/VersionComparisonSheet.jsx`
- Frontend picker: `/app/frontend/src/components/studio/EvolutionTab.jsx` (lines 200-260)
- Tests: `/app/backend/tests/test_comparison_v3_1.py` (16 cases, all pass)
- Pytest report: `/app/test_reports/pytest/comparison_v3_1.xml`

## Test IDs (frozen)
- `comparison-picker` — the two-select + button strip in Documentary view
- `compare-a`, `compare-b`, `compare-run` — the three interactive controls
- `version-comparison-sheet` — the Radix Sheet content
- `comparison-disclaimer` — the amber legal disclaimer at the bottom

## UI sections (rendered in this exact order)
1. METADATA (title / purpose / moment_at / location / writing_room / submitter)
2. WHAT & WHY (objectives / what_changed / why_changed / ai_session_summary)
3. DECISIONS · QUESTIONS · DISAGREEMENTS · RIGHTS
4. PARTICIPANTS · RIGHTPRINT™ IDENTITIES
5. EVIDENCE ARTIFACTS
6. ACKNOWLEDGEMENTS
7. BETWEEN-WINDOW (up to 200 events shown, timestamps + kind + label)
8. VOICE EVIDENCE (recordings linked per version)
9. MCI · SESSION-LEVEL ANALYSIS (reference only)
10. INTEGRITY (each version's cryptographic hash)
11. Amber disclaimer

## Regression coverage (v3.1 hold-the-line)
- CEI · Automatic Creative Documentation · Voice Evidence · MCI regression
  suite (72 pytests from iterations 8-14) all still pass.
- Voice recordings endpoint canonicalised as `GET /api/sessions/{sid}/voice`
  in the tests.
- Evidence event creation endpoint canonicalised as
  `POST /api/sessions/{sid}/events` in the tests.

## Known non-blocking notes (from the testing agent review)
- ~~Radix a11y warning: `DialogContent` should carry a `DialogTitle`~~ · **RESOLVED
  in the v3.1.1 follow-up pass.** `VersionComparisonSheet` now wraps a Radix
  `SheetTitle` + `SheetDescription` inside `<VisuallyHidden.Root>`. Verified
  in iteration_16: zero Radix a11y console warnings during the full flow. The
  accessible name dynamically reads *"Comparing &lt;A title&gt; with &lt;B title&gt;"*
  once evidence loads.
- ~~`VersionComparisonSheet.jsx` swallows fetch errors silently.~~ · **RESOLVED
  in the v3.1.1 follow-up pass.** 404 / 422 / 403 / generic failures now:
  (a) render a Sonner toast (top-right) with a status-aware title, and
  (b) render an inline error block inside the sheet with
  `data-testid="comparison-error"` / `comparison-error-title` /
  `comparison-error-description`. The amber legal disclaimer is only shown
  on success; the error block replaces the sections when the fetch fails.
  Verified in iteration_16 (404 + 422 intercepts + post-error re-open).

## v3.1.1 verification (iteration_16)
- Backend: 16/16 comparison pytests still pass (contract unchanged).
- Frontend: 5/5 targeted acceptance checks pass — happy path, a11y wiring,
  404 error path, 422 error path, post-error re-open regression.
- No new issues surfaced. Two cosmetic nit-only comments recorded (404
  title/description duplication when backend `detail` matches the title;
  toast title+description a11y concatenation). Neither is user-visible and
  neither is being fixed inside v3.1 per the STOP directive.

## What v3.1 is
A clean, tested, recoverable milestone with the Comparison Engine layered
on top of CEI + Automatic Creative Documentation + Voice Evidence + MCI.
No new UI paradigms introduced. No existing surfaces disturbed.

## What v3.1 is NOT
- Not a whiteboards feature.
- Not a session replay.
- Not Live Session Intelligence™.
- Not a visual refinement pass.

All of the above remain in the backlog, gated on explicit user approval.

## Restoration
```bash
# v3.1 boundary — Comparison Engine ships green
git log --oneline | head -20    # locate the v3.1 commit
```

**Do not begin any additional feature work until the user explicitly
directs the next layer.**
