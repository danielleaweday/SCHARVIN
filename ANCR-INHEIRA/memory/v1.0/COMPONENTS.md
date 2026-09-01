# INHEIRA v1.0 — Component Inventory

## Pages (`frontend/src/pages/`) — 18 files
| File | Purpose | Frozen state |
|---|---|---|
| `Landing.jsx` | Public 12-chapter cinematic film | ✅ v1.0 |
| `AuthPage.jsx` | Split-screen sign-in / register + Google OAuth | ✅ v1.0 |
| `AuthCallback.jsx` | Emergent Google OAuth callback handler | ✅ v1.0 |
| `PublicReport.jsx` | Password-gated Song Intelligence report share | ✅ v1.0 |
| `Dashboard.jsx` | **Creator Home** (Phase 1) — 6 chapters | ✅ v1.0 |
| `Sessions.jsx` | Sessions list (P0+P1 elevation) | ✅ v1.0 |
| `NewSession.jsx` | Cinematic new-session flow (P0+P1) | ✅ v1.0 |
| `SessionDetail.jsx` | Redirect stub → studio | ✅ v1.0 |
| `StudioSession.jsx` | **12-tab Studio** (Phase 2) — cinematic chapter nav | ✅ v1.0 |
| `SongDNA.jsx` | Immutable per-song event history (re-shelled) | ✅ v1.0 |
| `ReleaseDashboard.jsx` | **11-stage Continuous Release Path** (Phase 4) | ✅ v1.0 |
| `SongIntelligence.jsx` | Claude-generated intelligence report | ✅ v1.0 |
| `SplitSheet.jsx` | Printable ownership contract | ✅ v1.0 |
| `CreatorPassport.jsx` | **15-chapter Creator DNA™** (Phase 3) | ✅ v1.0 |
| `WritingRooms.jsx` | 6 worldwide writing rooms | ✅ v1.0 |
| `Vaulta.jsx` | Royalty rail + 10-year forecast (P0+P1) | ✅ v1.0 |
| `ConnectedServices.jsx` | 90-integration hub | ✅ v1.0 |
| `Profile.jsx` | **RightPrint™** — 6 cinematic chapters (P0+P1) | ✅ v1.0 |

## Shared cinematic components (`frontend/src/components/cinematic/`)
Single source of truth extracted during the P0+P1 pass:
- `CinematicHero` — black-first, gradient headline, dual radial glow, optional slots
- `LifeSpine` — persistent 10-node Life-of-a-Song spine (mobile scrollable)
- `ChapterBand` — numbered chapter section with optional photography backdrop
- `IdentityStrip` — collaborator identity-color avatar strip
- `ANCRFooter` — signature closer
- `EmptyBlock` — unified empty-state voice
- `ChapterAnchor` — sticky-nav anchor helper

## Custom components (`frontend/src/components/`)
| File | Purpose |
|---|---|
| `Nav.jsx` | Persistent top nav (Home / Rooms / Sessions / Passport / Vaulta / RightPrint) |
| `BrandLogos.jsx` | InheiraMark + ANCR logo lockups |
| `ErrorBoundary.jsx` | Global error catch |
| `ProtectedRoute.jsx` | Auth guard |
| `SongJourney.jsx` | 10-milestone song timeline (Studio Overview) |
| `OwnershipDashboard.jsx` | 6-lens ownership panel |
| `GlobalCollaborationMap.jsx` | SVG world grid with glowing nodes |
| `ConnectedServicesWidget.jsx` | Studio sidebar integrations widget |

## Shadcn UI primitives (`frontend/src/components/ui/`) — 45 files
Full Shadcn/Radix component library — accordion, alert, avatar, badge, button, calendar, card, carousel, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, skeleton, slider, sonner, switch, table, tabs, textarea, toast, toaster, toggle, toggle-group, tooltip, aspect-ratio, breadcrumb.

## Shared libraries (`frontend/src/lib/`)
| File | Purpose |
|---|---|
| `api.js` | Axios client with token injection |
| `clipboard.js` | Cross-browser copy-to-clipboard |
| `collaboratorColors.js` | Identity palette + `colorForAncrId` + `CANONICAL_CAST` |
| `integrationsCatalog.js` | 90-integration static catalog |
| `lifeOfSong.js` | 10-stage arc + `STUDIO_CHAPTERS` + `inferSessionStage` + `stageMeta` |
| `utils.js` | Tailwind `cn` helper |

## Test ID registry (`frontend/src/constants/testIds*`)
Central test-ID registry powering QA hooks across every surface (DASHBOARD, SESSION_UI, STUDIO, CCC, RELEASE, VAULTA, PASSPORT, PROFILE_UI, DNA, NAV, etc.).
