# INHEIRA — Application Navigation & Ownership Audit (2026-02-08)

Second-priority pass ordered by the user before any new intelligence work.
Goal: every clickable element in the app either navigates somewhere real,
opens a real modal / detail view, performs an action, or is no longer
presented as clickable. Sibling ecosystem modules (ANCRID, Vaulta, and
future modules) are also framed correctly — INHEIRA no longer presents
them as if it owns them.

---

## PART 1 — Module Ownership Correction

**Architectural change:** introduced a centralised **Module Registry**
(`/app/frontend/src/lib/moduleRegistry.js`) and an ecosystem chrome:

- `MODULES` registers every ANCR product with `module_id · display_name ·
  tagline · owning_product · route_prefix · external_url · icon ·
  availability · nav · permissions · color`. Live today: INHEIRA, ANCRID,
  Vaulta. Registered as `coming_soon` and non-clickable in the ecosystem
  drawer: CYNAIAH, ANCRSYNC, ANCRVIEW, ANCRMEDIA, ANCRWAV, ANCRSHOP.
- `moduleHref(id, subpath)` resolves URLs. When any module later ships
  standalone, its row gains an `external_url` and every cross-reference in
  the UI automatically points there. No page code changes.
- `moduleForPath(pathname)` finds which module owns the current URL.
- **`<ModuleFrame>`** wraps ANCRID (`/creator/:id`) and Vaulta (`/vaulta`)
  routes with a top-of-page ownership eyebrow (`/ ANCR · ANCRID` or `/ ANCR
  · Vaulta`) and a "Return to INHEIRA" link. The user always knows which
  module of the ecosystem they are inside.
- **`<EcosystemMenu>`** replaces the raw Passport / Vaulta / RightPrint
  links in the primary nav. Primary nav now contains **INHEIRA's own
  surfaces only** — Home · Rooms · Sessions · Profile — plus an Ecosystem
  drawer that lists sibling modules with honest availability chips.

## PART 2 — Interaction Audit Matrix

Notation: ✅ working · ❌ dead (fixed) · ⚠ placeholder (retained but honest)
· 🔀 wrong-module framing (fixed) · 🚫 removed (no destination, no longer
appears clickable).

### Nav (top bar)
| Source · Element | Prior state | Destination | Action |
| ---------------- | ----------- | ----------- | ------ |
| Nav · Home           | ✅ | /dashboard | kept |
| Nav · Rooms          | ✅ | /writing-rooms | kept |
| Nav · Sessions       | ✅ | /sessions | kept |
| Nav · **Passport**   | 🔀 | /creator/:id | **removed from primary nav; now in Ecosystem drawer with ANCRID framing** |
| Nav · **Vaulta**     | 🔀 | /vaulta | **removed from primary nav; now in Ecosystem drawer** |
| Nav · **RightPrint** | 🔀 (RightPrint isn't a page — it's a concept) | /profile | **renamed to "Profile"** |
| Nav · Ecosystem menu | — | opens EcosystemMenu | **new** |
| Nav · Sign out       | ✅ | logout + / | kept |

### Ecosystem Menu
| Element | State | Destination |
| ------- | ----- | ----------- |
| INHEIRA               | ✅ non-clickable (you are here) | — |
| ANCRID                | ✅ | /creator/:user_id |
| Vaulta                | ✅ | /vaulta |
| CYNAIAH               | ⚠ disabled · coming soon | — |
| ANCRSYNC              | ⚠ disabled · coming soon | — |
| ANCRVIEW              | ⚠ disabled · coming soon | — |
| ANCRMEDIA             | ⚠ disabled · coming soon | — |
| ANCRWAV               | ⚠ disabled · coming soon | — |
| ANCRSHOP              | ⚠ disabled · coming soon | — |

### ANCRID (Creator DNA page — /creator/:id)
| Element | Prior state | Action |
| ------- | ----------- | ------ |
| Header eyebrow      | 🔀 said "CREATOR DNA™" without module ownership | **now reads "ANCRID · CREATOR DNA™"** |
| ModuleFrame ribbon  | — | **added: "/ ANCR · ANCRID · Return to INHEIRA"** |
| Chapter · ecosystem identity mentions Vaulta™ / ANCRLAB™ / CCDP | ✅ correct as descriptive prose | kept |

### Vaulta (/vaulta)
| Element | Prior state | Action |
| ------- | ----------- | ------ |
| Header eyebrow      | 🔀 said "VAULTA™" without module ownership | **now reads "VAULTA · ROYALTY INFRASTRUCTURE" under ModuleFrame chrome** |
| ModuleFrame ribbon  | — | **added** |
| Work row `<Link>`   | ✅ → /sessions/:id/release | kept |
| 10-year forecast    | ✅ read-only chart | kept |

### Studio Session (/sessions/:id/studio)
| Element | Prior state | Action |
| ------- | ----------- | ------ |
| Top bar · Invite      | ✅ copies invite code | kept |
| Top bar · Share       | ✅ copies URL | kept |
| Top bar · Intelligence Report™ | ✅ → /intelligence | kept |
| Top bar · Export      | ✅ → /split-sheet | kept |
| Top bar · **Publish** | ❌ no onClick | **wired → /sessions/:id/release** |
| Chords tab · progression cards | ⚠ hover state but no click by design | kept (hover kept as visual affordance only) |
| Chords tab · **Roman-numeral degrees** | ❌ cursor-pointer + hover but no onClick | **removed cursor-pointer + hover implication (static reference)** |
| Arrangement tab · section rows | ❌ hover implied editable but no onClick, copy said "click to edit (coming next)" | **removed hover state + updated copy: "Live reordering lands with the next release"** |
| Files tab · **Upload** | ❌ button styled active but no onClick | **disabled + relabelled "Upload · coming soon"** |
| Collab tab · **Invite** button | ❌ no onClick | **replaced with a directive line pointing users to the top-of-studio Invite button (single canonical action)** |
| Ready-for-release · **Publish** | ❌ no onClick even at score=100 | **wired → /sessions/:id/release** |
| Chapter-flow tabs (WRITE / RECORD / etc.) | ✅ set stage state | kept |
| Voice Booth / Version Modal / Ack / Add Evidence — all wired via testing_agent verified in v2.2 | ✅ | kept |

### Creator Home (/dashboard)
Scanned; every session card, writing-room card, and voice event uses `<Link>` with a real destination. No dead affordances found.

### Sessions List (/sessions)
Scanned; every row is a `<Link>` to `/sessions/:id/studio`.

### Release Dashboard (/sessions/:id/release)
Existing wiring preserved; no new interactions added under this audit.

### Song Intelligence / Public Report
Existing wiring preserved; every action button already routes.

---

## PART 3 — Files touched

- `frontend/src/lib/moduleRegistry.js` (new)
- `frontend/src/components/ModuleFrame.jsx` (new)
- `frontend/src/components/EcosystemMenu.jsx` (new)
- `frontend/src/components/Nav.jsx` (removed Passport/Vaulta/RightPrint primary links; added EcosystemMenu; renamed to Profile)
- `frontend/src/App.js` (ANCRID + Vaulta routes wrapped in ModuleFrame)
- `frontend/src/pages/CreatorPassport.jsx` (eyebrow re-framed as ANCRID · Creator DNA™)
- `frontend/src/pages/Vaulta.jsx` (eyebrow re-framed)
- `frontend/src/pages/StudioSession.jsx` (2× Publish buttons wired; chord-degree cursor removed; arrangement hover removed; Files upload disabled; Invite button in Collab tab removed in favor of canonical top-of-studio Invite)

## PART 4 — Explicitly removed interactions (to be restored when the underlying feature ships)

- **Collab tab · "Invite" button** — removed; canonical Invite lives at top of studio. Restore only when we build a full "invite by email / by URL / role assignment" panel.
- **Chords tab · Roman-numeral degrees clickability** — removed; restore when the chord editor ships (spec: "Chord editor coming next").
- **Arrangement tab · section-row hover states** — removed; restore when drag-to-reorder + click-to-edit ships.
- **Files tab · Upload button active styling** — replaced with an honest disabled state; the /api/upload endpoint already exists and is used by Voice Booth + Add Evidence. Restore when a dedicated Files-tab UI ships.

---

## Definition of done

- No button, card, or affordance in the app implies interactivity that
  doesn't work.
- Every ANCR ecosystem module is discoverable via one canonical entry
  point (Ecosystem menu) and clearly labelled with its owning product.
- INHEIRA never claims ownership of ANCRID or Vaulta content.
- All existing tests still pass (61/61 backend + frontend regression).


## Follow-up applied post-testing-agent review

The testing agent's critical code-review flagged one consistency gap: `StudioSession`'s left sidebar hard-coded the Vaulta URL, bypassing the Module Registry the audit was built around. Fixed:

- `frontend/src/pages/StudioSession.jsx` — Studio sidebar now sources Vaulta's URL via `moduleHref('vaulta')` and label via `getModule('vaulta').display_name`. The sidebar renderer respects `external_url` (falls back to `<a target="_blank">` if Vaulta ever ships standalone). Every future ecosystem-module link inside Studio should be added the same way.

Deferred (nice-to-have, not required by the ownership contract):
- `frontend/src/pages/ReleaseDashboard.jsx` still uses a raw `<Link to="/vaulta">` for the Vaulta stage band. This is functionally correct today (Vaulta is local) but a future consolidation pass should route it through `moduleHref` for symmetry.
- Other `/creator/:user_id` deep-links across Dashboard, Profile, WritingRooms, SongIntelligence, CreatorPassport are correct today and will be revisited only if / when ANCRID gains an `external_url`.

Backend regression status: 79/82 pass in a full parallel test run; 100% (61/61 in-scope) pass when files are run individually. The 3 flakes were identified inside `test_auto_doc_v2_1.py` and are shared-fixture / parallel-isolation issues — not behaviour changes. No backend code was touched in this pass.



## Cross-Module Symmetry Sweep · COMPLETE (2026-02-08)

The registry is now the true single source of navigation truth. Introduced
`<ModuleLink>` — the one call-site for every cross-module navigation. It
resolves the URL through `moduleHref` and automatically picks the right
element for the module's current state:

- **local module** (external_url null) → react-router `<Link>`
- **standalone module** (external_url set) → `<a target="_blank" rel="noreferrer">`
- **coming_soon module** → non-interactive `<span aria-disabled="true">`

Every cross-module deep-link in the app was migrated:

| File | Prior | Now |
| ---- | ----- | --- |
| `pages/Dashboard.jsx`         | `<Link to={\`/creator/${id}\`}>` | `<ModuleLink module="ancrid" subpath={\`/${id}\`}>` |
| `pages/Profile.jsx`           | same                             | ditto |
| `pages/WritingRooms.jsx`      | same                             | ditto |
| `pages/SongIntelligence.jsx`  | same                             | ditto |
| `pages/StudioSession.jsx`     | Collab-tab creator card `<Link>` | ditto (sidebar Vaulta already via moduleHref) |
| `pages/CreatorPassport.jsx`   | Related-collaborator `<Link>`    | ditto |
| `pages/ReleaseDashboard.jsx`  | `<Link to="/vaulta">`            | `<ModuleLink module="vaulta">` |
| `pages/Vaulta.jsx`            | self-fallback `to="/vaulta"`     | `to={moduleHref('vaulta') || '#'}` |

Grep verification (2026-02-08):
```
grep -rnE 'to="/vaulta"|to=`/creator/' /app/frontend/src   →   0 matches
```

The last symmetry polish: `ModuleLink`'s fail-soft `<span>` branches now
also explicitly forward `data-testid / title / onClick` for test
predictability.

**Testing status:** 100% frontend (6/6 cross-module paths + source
inspection). Backend suite unchanged — no backend code was touched in this
or the prior interaction pass.

**Architecture checkpoint:** the app is now on a clean routing +
product-boundary baseline. Ready for the next intelligence layer (MCI /
Comparison Engine) when the user chooses to resume that work.
