# INHEIRA v1.0 — Dependency Inventory

## Backend — `backend/requirements.txt` (28 packages)
```
fastapi==0.110.1
uvicorn==0.25.0
boto3>=1.34.129
requests-oauthlib>=2.0.0
cryptography>=42.0.8
python-dotenv>=1.0.1
pymongo==4.6.3
pydantic>=2.6.4
email-validator>=2.2.0
pyjwt>=2.10.1
bcrypt==4.1.3
passlib>=1.7.4
tzdata>=2024.2
motor==3.3.1
pytest>=8.0.0
pytest-xdist>=3.6.0
black>=24.1.1
isort>=5.13.2
flake8>=7.0.0
mypy>=1.8.0
python-jose>=3.3.0
requests>=2.31.0
pandas>=2.2.0
numpy>=1.26.0
python-multipart>=0.0.9
jq>=1.6.0
typer>=0.9.0
emergentintegrations==0.2.0
```

## Frontend runtime — `frontend/package.json` (~60 packages)
### Core
- `react@19.0.0` + `react-dom@19.0.0`
- `react-router-dom@7.15.0`
- `react-scripts@5.0.1` (via craco)
- `axios@1.16.0`

### UI framework
- `tailwindcss` + `tailwindcss-animate@1.0.7`
- `tailwind-merge@3.2.0`
- `class-variance-authority@0.7.1`
- `clsx@2.1.1`

### Shadcn / Radix primitives (30+ `@radix-ui/*` packages)
- accordion, alert-dialog, aspect-ratio, avatar, checkbox, collapsible, context-menu, dialog, dropdown-menu, hover-card, label, menubar, navigation-menu, popover, progress, radio-group, scroll-area, select, separator, slider, slot, switch, tabs, toast, toggle, toggle-group, tooltip

### Data / charts
- `recharts@3.6.0` (radar, line, bar, pie)
- `@tanstack/react-query@5.56.2`
- `swr@2.3.8`
- `zod@3.24.4`
- `react-hook-form@7.56.2` + `@hookform/resolvers@5.0.1`

### Motion / interaction
- `framer-motion@11.18.0`
- `embla-carousel-react@8.6.0`
- `react-resizable-panels@3.0.1`
- `vaul@1.1.2`
- `cmdk@1.1.1`

### Icons
- `lucide-react@0.516.0`

### Dates
- `date-fns@4.1.0`
- `dayjs@1.11.13`
- `react-day-picker@8.10.1`

### Notifications
- `sonner@2.0.3`

### Theming / OTP / misc
- `next-themes@0.4.6`
- `input-otp@1.4.2`
- `lodash@4.18.1`

## Third-party services used at v1.0
- **Emergent LLM Key** → Claude Sonnet 4.5 (`emergentintegrations==0.2.0`)
- **Emergent-managed Google OAuth** (`/api/auth/session` endpoint)
- **MongoDB** (via `motor` + `pymongo`)

## Third-party services catalogued (not wired to live income yet)
90 integrations listed in Connected Services, including: Stripe, ASCAP/BMI/SESAC/SOCAN/PRS/APRA/SACEM/GMR, DistroKid/TuneCore/CD Baby/UnitedMasters/Symphonic/Too Lost/Stem/ONErpm/Orchard/AWAL, Spotify/Apple Music/Amazon/YouTube/TIDAL/Pandora/Deezer/Qobuz/Audiomack/Boomplay, Songtrust/Sentric/Kobalt/Downtown/Sony/UMPG/Warner Chappell, MLC/SoundExchange, and more.

## Node / Python runtime
- Frontend: Node 18+ / Yarn (package.json enforces via `react-scripts@5.0.1`)
- Backend: Python 3.11+ (FastAPI 0.110 + Motor 3.3)

## Environment variables — protected
| Variable | Where | Purpose |
|---|---|---|
| `MONGO_URL` | `backend/.env` | MongoDB connection string |
| `DB_NAME` | `backend/.env` | Database name |
| `JWT_SECRET` | `backend/.env` | JWT signing secret |
| `EMERGENT_LLM_KEY` | `backend/.env` | Universal LLM key |
| `REACT_APP_BACKEND_URL` | `frontend/.env` | Public backend base URL |
