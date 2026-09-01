# INHEIRA v1.0 — Architecture Snapshot

## Runtime topology
```
┌─────────────────────────────────────────────────────────────────┐
│                   Public HTTPS (Kubernetes ingress)             │
└───────┬──────────────────────────────────────────┬──────────────┘
        │ /                                        │ /api/*
        ▼                                          ▼
   ┌─────────────┐                          ┌─────────────────┐
   │  Frontend   │                          │    Backend      │
   │  (React 19) │                          │  (FastAPI)      │
   │  Port 3000  │                          │  Port 8001      │
   └─────────────┘                          └────────┬────────┘
                                                     │
                                            ┌────────┴────────┐
                                            │    MongoDB      │
                                            │  (motor async)  │
                                            └─────────────────┘
                                                     ▲
                                            ┌────────┴────────┐
                                            │ Emergent LLM    │
                                            │ Universal Key   │
                                            │ (Claude Sonnet) │
                                            └─────────────────┘
```
- Both processes managed by supervisor with hot reload.
- All `/api/*` requests route to backend port 8001; everything else to frontend port 3000 (Kubernetes ingress rule).
- No custom server — dev preview and production use the same routing.

## Frontend architecture
- **Framework:** React 19 with React Router 7
- **Build tool:** Create React App (via craco for tailwind)
- **State:** local hooks + React context (`AuthContext`)
- **Data fetching:** axios (via `lib/api.js`) with automatic bearer-token injection
- **Styling:** Tailwind CSS + Shadcn UI components (Radix primitives underneath)
- **Charts:** Recharts (Radar, Line, Bar) — used on Creator DNA, Release Path, Vaulta, Song Intelligence
- **Notifications:** Sonner
- **Icons:** Lucide React (0.516)
- **Cinematic component library:** `/components/cinematic/` — CinematicHero · LifeSpine · ChapterBand · IdentityStrip · ANCRFooter · EmptyBlock · ChapterAnchor
- **Test-ID registry:** `/constants/testIds/` per surface

## Backend architecture
- **Framework:** FastAPI 0.110 (async)
- **Auth:** JWT (PyJWT 2.10) + bcrypt password hashing + user_sessions table
- **DB driver:** Motor 3.3 (async wrapper over PyMongo)
- **LLM:** Emergent Universal LLM key → Claude Sonnet 4.5 via `emergentintegrations==0.2.0`
- **Server file:** `/app/backend/server.py` (monolithic — ~1,400 lines · 40 endpoints)
- **Router prefix:** All routes mounted on `/api` via `api_router`

## Data model philosophy
- Every ID is a string UUID / short code (never raw `ObjectId`)
- Every datetime is stored as ISO string (never `datetime.utcnow()`)
- Every field nullable in the DB is nullable in the API payload
- Server-assigned collaborator `color` guarantees identity color persistence across surfaces
- Event ledger (`session_events`) is append-only — no updates or deletes to preserve Creative Evidence™ immutability

## Rendering philosophy
1. **Black-first canvas** — every page starts on `bg-black`
2. **Chapter-based information architecture** — every non-trivial surface reads as a numbered chapter scroll
3. **Persistent context bars** — Life of a Song™ spine + identity color strip appear across most surfaces
4. **Sticky right-rail indexes** — Creator DNA (15 chapters), Release Path (11 stages)
5. **Documentary photography** — subtle bg-image layers with `linear-gradient(180deg, rgba(0,0,0,0.72), rgba(0,0,0,0.92))` overlay
6. **Cinematic gradient headlines** — `from-white via-indigo-100 to-violet-200 bg-clip-text text-transparent`
7. **Monospace metadata pattern** — `/ CHAPTER {N} · {NAME}` eyebrows in `text-[10px] uppercase tracking-[0.4em]`

## Identity system
Every creator carries a permanent `ancr_XXXX` ID that:
- Never changes
- Determines their deterministic identity color (via `colorForAncrId`)
- References the same creator across INHEIRA · Vaulta · ANCRLAB · ANCRMEDIA · CCDP · COHEIR (per ANCR Ecosystem Architecture spec)

## Deployment
- Kubernetes cluster (preview + production identical)
- Environment variables via `.env` files (backend + frontend), never hardcoded
- Supervisor manages both processes with hot reload
- All URLs / ports / secrets come from env vars — missing config fails fast

## Third-party posture
- **In use:** Emergent LLM key (Claude Sonnet 4.5), Emergent Google OAuth
- **Catalogued in Connected Services (90 total), not yet wired to live income:** all major PROs, DSPs, distributors, publishers, cloud storage, communication, calendar, finance, AI providers

## Freeze compatibility surface
- All 40 API endpoints and all 45 test IDs referenced in constants remain stable in v1.0.
- Frontend backwards-compat: localstorage token key is still `songright_token` (intentional, preserves user sessions across the rebrand).
- Backend backwards-compat: nothing has renamed a collection or field between phases.

## Known constraints (informational, not blockers)
- StudioSession.jsx is monolithic (~1,700 lines) — a future refactor into per-chapter modules would make maintenance easier
- Song Intelligence report is compute-heavy on first render (Claude call ~10-15s) — cached in DB after first generate
- Vaulta rail data is illustrative until PRO / distributor API keys are wired in v2+
