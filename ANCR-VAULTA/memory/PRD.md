# Vaulta™ — Product Requirements Document

## Original Problem Statement
Build Vaulta™, the financial operating system of the ANCR Ecosystem — the complete financial command center for creators from CCDP student to professional career. Not a banking app. Not QuickBooks. Not Mint. Every module financial lives inside Vaulta.

## Vision Anchor
> "Vaulta is a professional financial operating system designed specifically for creators, creative entrepreneurs, faculty, and creative businesses. Every screen should feel executive, institutional, and enterprise-grade — Bloomberg Terminal + Stripe Dashboard + Ramp + Linear, not Mint or Rocket Money."

## Design Language (locked)
- Obsidian black canvas (#050505 base)
- Glassmorphism (18–24px backdrop blur)
- Electric Blue → Violet → Orange gradient accents (#00f0ff → #8b5cf6 → #ff5f1f)
- Cabinet Grotesk (display) + Satoshi (body)
- Left ecosystem sidebar, ANCR wordmark bottom
- Zero emojis, cinematic motion throughout

## Roles Supported
Student · Faculty · Artist · Manager · Accountant · Attorney · Publisher · Institution · Employer · Administrator (JWT auth, httpOnly cookies)

## Architecture
- **Backend**: FastAPI + Motor/MongoDB, JWT (access 24h / refresh 30d in httpOnly cookies), bcrypt password hashing
- **Frontend**: React 19 + React Router 7 + Recharts + shadcn/ui + Sonner
- **AIAH**: Claude Sonnet 4.5 via Emergent Universal LLM Key, SSE streaming, grounded in live user financial context
- **Ecosystem integrations**: ANCRID · INHEIRA · COHEIR · ANCRLAB · ANCRSync · ANCRA · ANCRLaunch · ANCRVIEW · ANCRWAV · Passport (mock realistic)

## Implemented (2026-02-09)
- Full JWT auth: register, login, logout, /me, refresh — with 9 seeded demo roles
- **Dashboard/Overview**: Net Worth, Cash, Monthly Revenue, Projected, Outstanding Invoices, Royalties Pending, Publishing Income, Business Health Score, Tax Readiness, 12-mo Cash Flow chart, AIAH insight signals, recent transactions, upcoming payments
- **Income** (20+ categories: performance, streaming, publishing, sync, brand deals, grants, etc.) with pie mix + ledger
- **Expenses** (30+ categories: travel, hotels, studio, marketing, payroll, wardrobe, etc.) with bar chart + ledger
- **Budget**: Monthly, Tour, Album, Project, Film, Writing Camp, Grant, Department, Savings + progress cards
- **Royalties Command Center**: ASCAP · BMI · SESAC · SoundExchange · MLC · Harry Fox + 3-quarter forecast + missing-statement AI signals
- **Publishing Center**: songs from INHEIRA with writers, splits, publisher, PRO, ISWC, ISRC, UPC, registration/distribution status
- **Contracts Library**: 10+ types with status pills
- **Invoice Center**: create/list, status pills, auto invoice number
- **Tax Center**: quarterly payments, deductions by category, tax forms, tax readiness score
- **Business Dashboard**: LLC/DBA/Nonprofit entities, EIN, licenses, insurance, banks, credit cards, business credit score, compliance calendar
- **Reports**: P&L, Cash Flow chart, Balance Sheet, PDF/Excel buttons
- **Secure Vault**: AES-256 encrypted document library with search
- **AIAH**: Claude Sonnet 4.5 CFO advisor, streaming SSE responses grounded in live user context
- **Ecosystem**: 10 ANCR integrations with connected status + Passport unified record
- **Settings**: profile, role-based permissions, security

## V1.0 Completion (2026-02-09)
- **Grant & Funding Center™**: 30 curated opportunities across 16 categories (National/State/International grants, Scholarships, Fellowships, Residencies, Incubators, Accelerators, Competitions, Pitch, Venture, Angel, Foundation, Nonprofit, Music industry, Crowdfunding). Full application tracker (In Progress / Submitted / Awarded / Rejected) with win-rate and total secured KPIs. AI Funding Advisor with AI Match Score, upcoming deadlines dashboard, filter chips + search.
- **Tour Profitability & Project P&L™**: 5 seeded executive financial models (Tour, Album, Film, Writing Camp, Festival) with full P&L computation, Cumulative Revenue vs Cost timeline, break-even calculator, per-show/per-traveler metrics, milestone table with daily financial snapshot, risk analysis w/ severity + mitigation, AI Business Strategist recommendations, Tour Health Score composite.
- **Real Vualta + ANCR logos** integrated across login hero, sidebar, and ecosystem footer.
- Rich seeded demo data: 500+ transactions, 12 songs, 10 contracts, 10 invoices, 10 budgets, 30 grants, 12 applications, 5 project P&L models, 14 vault docs.

## Testing
- iteration_1: 22/22 backend + 15/15 frontend routes ✅
- iteration_2: 29/29 backend + 100% frontend ✅ (no critical or minor issues)

## V1.0 Feature Complete — Engineering Backlog (handed to ANCR dev team)
Everything below is engineering implementation work, not product design:
- Live file uploads to Vault (object storage integration)
- PDF/Excel export generation (reportlab / openpyxl)
- E-signature integration on Contracts
- Payment processing (Stripe Connect for invoicing)
- Live banking APIs (Plaid / Mercury)
- Live ecosystem APIs (ANCRID, INHEIRA, COHEIR, ANCRA, ANCRLAB, ANCRSync, ANCRLaunch, ANCRVIEW, ANCRWAV, Passport)
- Production infrastructure (SSL, secure cookies cross-site, multi-region MongoDB, monitoring)
- Real permission model (currently non-Artist roles read Artist demo data for showcase)
- Router splitting (server.py → per-resource routers)
