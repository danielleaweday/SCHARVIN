# ANCRID Interactive Navigation & Click-Flow Specification

## Context

The functional-requirements audits (already complete for all 13 apps) captured *what the backend does* — routes, auth boundaries, spec gaps. They do not capture *what a user clicks and what happens next*, which is what a developer actually needs to wire a page correctly. The user asked for a second, complementary document type: a compact, diagram-first click-flow specification, visually matching `ANCRID_Master_Workflow.pdf`, describing intended self-hosted behavior rather than the current Emergent-coupled implementation. ANCRID is the pilot; once its structure and visual system are approved, the same method applies to the other 12 apps.

This plan covers **ANCRID only** — one document, ~12-18 pages, PDF, matching the existing Master Workflow's visual grammar exactly.

## Source material already confirmed

- **Visual grammar**, extracted directly from `ANCRID_Master_Workflow.pdf` via PyMuPDF: 843×1191pt (tabloid landscape), obsidian backgrounds (`#0a0d14`, `#12141c`, `#171b28`, `#1f2433`), electric blue `#2e6bff` / `#2978ff`, violet `#8a4fff`, orange `#ff6b00`, off-white text `#e8edf2`, Liberation Sans (regular/bold/italic). Layout pattern: stacked vertical boxes joined by arrows, a module grid, a repeated "CLICK X → OPENS / NO LOGIN / HOME" micro-flow, and bordered callout panels (PRINCIPLE / ENGINEERING RULE / RECOMMENDATION) that I'll reuse as `DECISION REQUIRED` / `DEAD CONTROL` panels. No green/red in the source — I'll extend the palette with a success green and failure red that sit harmoniously with the existing blue/violet/orange (not primary colors, used only for outcome states as the user specified).
- **Page inventory**, confirmed via `ls`/`wc -l` on `ANCR-ANCRID/frontend/src/pages/`: 20 pages, 3,187 lines total. Seven pages are near-identical thin read-only record lists (Credentials 32 lines, History 33, Achievements 40, Collaborations 43, Skills 48, Passport 49, Education 52) — confirms the user's instinct that these collapse into **one reusable record-list flow** rather than seven diagrams. Two pages are large outliers needing dedicated treatment: Mobility (631 lines, 12 tabbed sections) and PublicCreator (384 lines).
- **Backend contract**, already fully mapped in `ANCR-ANCRID/FUNCTIONAL_REQUIREMENTS.md` (100 requirements, 28 spec gaps, 19 flags) — I have route-by-route behavior, error codes, and every known dead-control/spec-gap already enumerated. This feeds the "controls that currently do nothing or need a decision" section directly, without re-deriving it.
- **Granular control inventory** (exact button labels, wiring, dead controls, loading/empty/error states per page): complete, returned by the Explore agent against the full `frontend/src/` tree. Key findings that reshape the document below:
  - The shell is actually `Sidebar.jsx` + `DashboardLayout.jsx` (no separate `TopBar`/`AppShell` exist). Sidebar has **16 nav items** in a fixed order — the Master Navigation Flow board must show all 16, not a simplified subset.
  - **4 confirmed dead controls** (button rendered, zero onClick handler): Overview's per-insight action pill, Portfolio's "Open" button, Network's "View" button, Mobility's per-AI-suggestion action pill in the Booking Packet tab's sibling panel. These go into the appendix by name, not as a vague category.
  - **9 of 20 pages are pure read-only display with zero interactive controls** beyond an optional external link: Identity, Passport, Collaborations, Skills, Education, History, Achievements, Credentials, ConnectedApps. This is thinner than line-count alone suggested and pushes the "record-list pattern" board toward fewer, denser diagrams rather than one per page.
  - **No page uses the codebase's own `Dialog`/`AlertDialog` components.** The only confirm-style interaction anywhere is a native browser `window.confirm()` in Mobility's "Revoke Packet" action — worth one explicit callout since the user asked specifically about modal actions.
  - **Most list-page API calls have zero error handling** — not even a silent catch; a failed fetch produces an unhandled rejection and a silently empty list, with no user-facing error state anywhere in those 9 pages. This becomes one shared callout panel referenced from the record-list board rather than repeated 9 times.
  - Two pages (`PublicCreator`, `BookingPacket`) bypass the shared `api` instance entirely and call the backend with raw axios/string-interpolated URLs — a real Observed-vs-Intended note for the appendix.

## Document structure (12-18 pages)

1. **Cover** — full-bleed, matches Master Workflow cover treatment (title block, doc-control header, principle statement)
2. **Master Navigation Flow** (1 page) — the full ANCRID click-map at a glance: entry → auth → shell → every top-level destination, as one diagram, extending the existing Master Workflow rather than replacing it
3. **Authentication & SSO board** (2-3 pages) — Login, Signup, Emergent-OAuth-replaced-with-ANCRID-native flow, session expiry/refresh, logout, SSO authorize/verify handshake — each as a shape-flow with success/failure/cancel branches
4. **Identity & Settings board** (1-2 pages) — Overview, Identity, Settings/profile-edit, avatar/banner upload lifecycle
5. **Record-list pattern board** (1-2 pages) — ONE reusable flow covering Portfolio, Timeline, Passport, Collaborations, Skills, Education, History, Achievements, Credentials, with a small table noting what varies per page (empty-state copy, whether an action exists)
6. **Connected Apps / Network board** (1 page) — ecosystem module launcher clicks, network directory/search
7. **Mobility board** (2-3 pages) — the 12-tab structure, given its size and complexity relative to everything else
8. **Public Creator / Booking Packet board** (2 pages) — public unauthenticated view, packet generation/permission-level selection/revocation
9. **Click-action register** (1-2 pages) — compact table of every minor control not already covered in a diagram (toggles, copy-link buttons, etc.)
10. **Decision-required / dead-control appendix** (1 page) — pulled directly from the existing `FUNCTIONAL_REQUIREMENTS.md` flags (e.g., dead `include_sections` field, silent no-ops on unknown ids, mobility save/read mismatch), reformatted as the callout-panel style

Every flow is classified inline using the four-way system already agreed: **Intended** (blue) / **Observed** (as-built, only noted where it diverges) / **Decision required** (orange) / **Proposed** (violet, dashed).

## Method (matches the proven roadmap-PDF pipeline)

1. Control inventory is in hand (see above) — no further research needed before writing.
2. Author each board as hand-written inline SVG inside an HTML file — same approach used for the roadmap document's Figures 1-3, not a diagramming library. **No ASCII-art arrows or typed box-drawing characters anywhere** (confirmed with the user) — every box is a real `<rect>` with rounded corners, every connector a thin `<path>`/`<line>` with a proper arrowhead marker, every label real `<text>`, all sized small and compact per the user's "small connected shapes rather than oversized process diagrams" direction.
3. Split into `_cover.html` (full-bleed, `@page margin:0`) and `_body.html` (normal margins), following the exact fix already proven for full-bleed + body pagination.
4. Render both through headless Chrome, merge with `pymupdf.insert_pdf()`.
5. Verify no orphan pages (<600 characters), verify diagram labels aren't clipped at page edges — both were real defects last time and the fix pattern is known.
6. Output: `ANCR-ANCRID/ANCRID_Click_Flow_Specification.pdf`, plus the source `.html` files (and inline SVG) left in place as the editable diagram source, per the user's request that diagrams remain editable.

## Emergent → vendor-neutral vocabulary map (applied throughout)

| As implemented | As documented |
|---|---|
| Emergent session cookie / `?token=` query param | Authenticated ANCRID session |
| Emergent object storage (`integrations.emergentagent.com`) | Approved media storage service *(flagged: no such service exists yet — Decision Required, not silently assumed)* |
| `EMERGENT_LLM_KEY` / Claude via emergentintegrations | Configured AI service |
| Hard-coded demo credentials pre-filled on login | *(omitted from the intended-flow diagrams entirely — noted once in the appendix as an Observed-only behavior)* |

## Verification

- Open the rendered PDF and visually diff page 1 against the existing `ANCRID_Master_Workflow.pdf` cover for palette/type consistency.
- Confirm every page has >600 characters (no orphans) and no diagram label is clipped, same checks used last time.
- Cross-check the decision-required appendix against `FUNCTIONAL_REQUIREMENTS.md`'s Section 4 (19 flags) to confirm nothing already known was missed or silently promoted to "intended."
- Confirm page count lands in the 12-18 range the user specified before finalizing.
