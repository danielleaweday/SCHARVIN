# INHEIRA v1.0 — Canonical File Structure
Generated 2026-02-08 · immediately after the freeze.

```
/app/
├── backend/
│   ├── .env                          # MONGO_URL, DB_NAME, JWT_SECRET, EMERGENT_LLM_KEY
│   ├── requirements.txt              # 28 pinned deps
│   └── server.py                     # ~1400 lines — 40 endpoints
│
├── frontend/
│   ├── .env                          # REACT_APP_BACKEND_URL
│   ├── package.json                  # 60 deps (React 19 + Radix + Recharts + Framer + Lucide)
│   ├── craco.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── jsconfig.json
│   ├── public/
│   └── src/
│       ├── App.js                    # 18 routes
│       ├── index.js
│       ├── index.css                 # global styles + font imports
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── constants/
│       │   └── testIds/              # per-surface test-ID registries
│       ├── lib/                      # 6 shared libraries
│       │   ├── api.js
│       │   ├── clipboard.js
│       │   ├── collaboratorColors.js # identity color palette + CANONICAL_CAST
│       │   ├── integrationsCatalog.js
│       │   ├── lifeOfSong.js         # 10-stage arc + STUDIO_CHAPTERS + inferSessionStage
│       │   └── utils.js
│       ├── components/
│       │   ├── Nav.jsx
│       │   ├── BrandLogos.jsx
│       │   ├── ErrorBoundary.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── SongJourney.jsx
│       │   ├── OwnershipDashboard.jsx
│       │   ├── GlobalCollaborationMap.jsx
│       │   ├── ConnectedServicesWidget.jsx
│       │   ├── cinematic/            # SHARED CINEMATIC PRIMITIVES
│       │   │   └── index.jsx         # CinematicHero, LifeSpine, ChapterBand, IdentityStrip, ANCRFooter, EmptyBlock, ChapterAnchor
│       │   └── ui/                   # 45 Shadcn/Radix primitives
│       └── pages/                    # 18 top-level pages
│           ├── Landing.jsx
│           ├── AuthPage.jsx
│           ├── AuthCallback.jsx
│           ├── PublicReport.jsx
│           ├── Dashboard.jsx          # Phase 1 — Creator Home
│           ├── Sessions.jsx           # P0+P1 elevated
│           ├── NewSession.jsx         # P0+P1 elevated
│           ├── SessionDetail.jsx      # <Navigate> redirect stub
│           ├── StudioSession.jsx      # Phase 2 — 12-tab cinematic studio
│           ├── SongDNA.jsx            # re-shelled
│           ├── ReleaseDashboard.jsx   # Phase 4 — 11-stage Release Path
│           ├── SongIntelligence.jsx
│           ├── SplitSheet.jsx
│           ├── CreatorPassport.jsx    # Phase 3 — 15-chapter Creator DNA
│           ├── WritingRooms.jsx
│           ├── Vaulta.jsx             # P0+P1 elevated
│           ├── ConnectedServices.jsx
│           └── Profile.jsx            # P0+P1 elevated with 6 cinematic chapters
│
├── docs/                             # 8 engineering specification documents
│   ├── ANCR_Ecosystem_Architecture_v1.0.md
│   ├── ANCR_Creator_DNA_Platform_Spec_v1.0.md
│   ├── ANCR_Creative_Provenance_Platform_Spec_v1.0.md
│   ├── INHEIRA_Creative_Evidence_Intelligence_Spec_v1.0.md
│   ├── INHEIRA_Creative_Interpretation_Framework_Spec_v1.0.md
│   ├── INHEIRA_Canonical_Restoration_Plan_v1.0.md
│   ├── INHEIRA_Technical_Specification_v1.0.md
│   └── README.md
│
├── memory/
│   ├── PRD.md                        # complete phase history
│   ├── PLATFORM_REVIEW.md            # end-of-Phase-4 audit
│   ├── test_credentials.md
│   └── v1.0/                         # ← THIS SNAPSHOT
│       ├── SNAPSHOT.md               # top-level index
│       ├── ROUTES.md
│       ├── COMPONENTS.md
│       ├── SCHEMA.md
│       ├── API.md
│       ├── DESIGN_SYSTEM.md
│       ├── FEATURES.md
│       ├── FILE_STRUCTURE.md
│       ├── DEPENDENCIES.md
│       ├── CHANGELOG.md
│       ├── ARCHITECTURE.md
│       ├── DOCS_INDEX.md
│       └── screenshots/
│
├── test_reports/
│   ├── iteration_3.json              # pre-Phase-1 baseline
│   ├── iteration_4.json              # first freeze audit
│   ├── iteration_5.json              # freeze retest
│   └── iteration_6.json              # freeze GREEN (100%)
│
└── (git repo)                        # tag: inheira-v1.0
```

## Key sizes (approximate)
| Area | Lines |
|---|---|
| `backend/server.py` | ~1,400 |
| `frontend/src/pages/StudioSession.jsx` | ~1,700 |
| `frontend/src/pages/Landing.jsx` | ~900 |
| `frontend/src/pages/CreatorPassport.jsx` | ~700 |
| `frontend/src/pages/ReleaseDashboard.jsx` | ~660 |
| `frontend/src/pages/Dashboard.jsx` | ~640 |
| `frontend/src/pages/SongIntelligence.jsx` | ~840 |
| `frontend/src/pages/Profile.jsx` | ~300 |
| Total pages | 18 |
| Total shared components | 8 (excluding UI primitives) |
| Total UI primitives | 45 |
| Total routes | 18 (17 rendered + 1 fallback) |
| Total API endpoints | 40 |
| Total MongoDB collections | 9 |
| Total engineering specs (`/app/docs/`) | 8 |
