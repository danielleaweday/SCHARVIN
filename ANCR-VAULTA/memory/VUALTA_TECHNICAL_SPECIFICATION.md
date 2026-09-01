# VUALTA™ — Production Technical Specification

**Module:** Vualta — The Financial Operating System of the ANCR Ecosystem
**Version:** 1.0
**Status:** Feature Complete (Product Design). Engineering hardening pending.
**Last updated:** 2026-02-09
**Owner:** Aaron Ancrum (CTO, ANCR)
**Author of spec:** Vualta engineering (handoff document)

> This document is the single-source-of-truth for maintaining, extending, or re-implementing Vualta. It is written for senior engineers. Any ambiguity should default to the code in `/app/backend` and `/app/frontend`.

---

## 1. Executive Overview

### 1.1 Purpose
Vualta is the **financial operating system for creators** — an executive command deck that unifies income, expenses, budgets, royalties, publishing, contracts, invoices, taxes, business entity management, funding, project P&L, and executive reporting into a single application. It is designed to accompany a creator from their first day at CCDP through an entire professional career.

Positioning (locked in product):
> "Not a banking app. Not QuickBooks. Not Mint. A professional financial operating system designed specifically for creators — Bloomberg Terminal + Stripe Dashboard + Ramp + Linear."

### 1.2 Business Objective
- Own the financial layer of the ANCR ecosystem.
- Convert creators from consumer finance tools (Mint / Rocket Money) into a professional-grade platform where publishing splits, royalty registries, contracts, and grant pipelines are first-class citizens.
- Create the data plane that other ANCR modules (INHEIRA, ANCRLAB, COHEIR, ANCRA) read from and write to.

### 1.3 User Personas (10 roles)
| Role | Primary use case |
|---|---|
| Student | CCDP student tracking scholarships, teaching income, entry-level expenses |
| Faculty | Manage teaching income, publishing reports, W-2 |
| **Artist** | Primary persona: full financial control — royalties, contracts, tours, taxes, business |
| Manager | View/manage a roster of artists' finances |
| Accountant | Tax preparation, exports, deductions, 1099/W-2 tracking |
| Attorney | Contracts library, e-sign management, compliance |
| Publisher | Publishing catalog, royalty statements, registration |
| Institution | Scholarship management, awards, compliance |
| Employer | Payroll access, 1099 management, contractor payments |
| Administrator | Full system access, user management |

### 1.4 Success Criteria
- **Adoption**: 100% of ANCRA / CCDP cohorts activate a Vualta account within 30 days of onboarding.
- **Data density**: Median artist has ≥ 12 months of transactions, ≥ 3 registered PROs, ≥ 5 signed contracts within 90 days.
- **AIAH engagement**: 40% weekly active rate on the AI Financial Advisor.
- **Retention**: 85% 90-day retention for Artist role; 70% for Student role.
- **Product SLO**: p95 API latency < 400ms; frontend LCP < 2s on mid-tier mobile.

---

## 2. Product Requirements Document (PRD)

### 2.1 Functional Requirements (F-# = functional)
**F-1 Auth**
- Email + password registration and login for all 10 roles.
- JWT-based session with httpOnly cookies (access + refresh).
- Session must survive full-page refresh and 24h idle.

**F-2 Overview Dashboard**
- Live KPIs: Net Worth, Cash Available, Monthly Revenue, Projected Income, Outstanding Invoices, Royalties Pending, Publishing Income, Business Health Score, Tax Readiness.
- 12-month income vs expense area chart.
- Recent transactions (last 8) and upcoming payments (next 6).
- AIAH insight signals (4 rotating).

**F-3 Income & Expenses**
- 20+ income categories, 30+ expense categories.
- Category-level aggregations (amount + percent of total).
- Pie chart (income) and bar chart (expenses).
- Full ledger table with date, category, subcategory, client, description, amount.

**F-4 Budget Planner**
- Named budgets across 9 types: Monthly, Tour, Album, Project, Film, Writing Camp, Grant, Department, Savings.
- Progress visualization with over-budget alerts.
- Total allocated, spent, remaining KPIs.

**F-5 Royalties Command Center**
- Registry cards for ASCAP, BMI, SESAC, SoundExchange, MLC, Harry Fox.
- 3-quarter forecast with growth trend.
- Missing-statement AI signals.
- Full statement ledger.

**F-6 Publishing Center (INHEIRA sync)**
- Song registry with title, writers, splits, publisher, PRO, ISWC, ISRC, UPC, registration/distribution/release status, ownership verification, certificate status.

**F-7 Contracts Library**
- 10+ contract types with title, counterparty, value, status (Draft / Pending Signature / Signed), signed date, expiration date.
- Expiration alerts (< 90 days).

**F-8 Invoice Center**
- Create, list, and status-track invoices (Paid / Pending / Late / Recurring).
- Auto-generated invoice number `VLT-YYYYMM-XXXXXX`.
- Line items and notes support.

**F-9 Tax Center**
- Quarterly estimated payments (Q1–Q4) with status.
- Deductions by category.
- Tax forms tracking (1099, W-2, K-1).
- Tax Readiness Score (0–100).

**F-10 Business Dashboard**
- Legal entities (LLC / Corporation / DBA / Nonprofit) with EIN, state, status.
- Licenses, insurance policies, bank accounts, credit cards, business credit score.
- Compliance calendar with due dates.

**F-11 Grant & Funding Center™** (V1.0)
- 30 curated opportunities across 16 categories.
- Application tracker (In Progress / Submitted / Awarded / Rejected) with win rate.
- Upcoming deadlines dashboard (next 120 days).
- AI Match Score per opportunity.
- Category filter chips + organization search.

**F-12 Tour Profitability & Project P&L™** (V1.0)
- Executive financial model per project (Tour / Album / EP / Single / Film / Festival / Writing Camp / Conference / Workshop / Residency).
- Full P&L: Gross Revenue, Total Expenses, Net Profit, Profit Margin, ROI.
- Cumulative Revenue vs Cost timeline with break-even line.
- Per-show and per-traveler metrics.
- Risk analysis with severity + mitigation.
- AI Business Strategist recommendations.
- Tour Health Score (0–100).

**F-13 Reports**
- P&L, Cash Flow (monthly series), Balance Sheet.
- PDF and Excel export buttons (currently stubs — see §13).

**F-14 Secure Vault**
- AES-256 metadata for encrypted document storage (13 categories).
- Search + category grouping.

**F-15 AIAH (AI Financial Advisor)**
- Claude Sonnet 4.5 via Emergent Universal LLM key.
- SSE streaming with live financial context grounding.
- 6 suggested prompts + free-form chat.

**F-16 Ecosystem Integration Panel**
- 10 mock-connected modules (ANCRID, INHEIRA, COHEIR, ANCRLAB, ANCRSync, ANCRA, ANCRLaunch, ANCRVIEW, ANCRWAV, Passport) with tagline + status.

**F-17 Settings**
- Profile, role-based permission display, security (2FA, encryption, session, Passport sync).

### 2.2 User Stories (high-signal subset)
1. As an **Artist**, I sign in and see my true net worth, monthly revenue, and 3 highest-value insights within 3 seconds.
2. As an **Artist**, I create an invoice for a $18,500 sync deal in under 20 seconds and email a payable link.
3. As an **Artist**, I ask AIAH "Should I file quarterly taxes now?" and receive a grounded answer with specific dollar amounts within 5 seconds.
4. As an **Artist**, I open the Grant Center and see 8 opportunities with ≥ 85% AI Match Score sorted by deadline.
5. As an **Artist**, I open the Obsidian Hours Tour and see the exact stop where the tour breaks even.
6. As an **Accountant**, I export a client's P&L and quarterly tax summary in one click.
7. As a **Student**, I see only what my permission scope allows and cannot access an artist's contracts.
8. As an **Administrator**, I onboard a new institution and can review the compliance calendar.

### 2.3 Permissions & Roles
Handled at API layer via `get_current_user` → `owner_id_for(user)`. In V1.0 non-Artist roles read the Artist showcase dataset. Production must replace with the real permission model in §10.4.

Documented UI permissions live in `/app/frontend/src/pages/Settings.jsx` under `PERMISSIONS`.

### 2.4 Workflows (canonical)
- **Login → Dashboard**: `/login` → POST `/api/auth/login` → cookies set → redirect to `/`.
- **Create invoice**: Invoices page → "New Invoice" → modal → POST `/api/invoices` → list refresh.
- **AIAH question**: chat page → POST `/api/aiah/chat` (SSE) → text deltas stream → session persists via `session_id`.
- **Open project P&L**: `/projects` → click card → `/projects/:pid` → GET `/api/projects/{pid}` → render.

### 2.5 Edge Cases
- Empty seed data for new users → all endpoints return empty lists / zeroed KPIs safely.
- Missing PRO statement → `royalties_by_pro` returns 0 amount / 0 pending; UI shows "Missing statement" AIAH signal.
- AIAH stream failure → UI displays "AIAH is unavailable right now. Please retry in a moment."
- Invoice with `null` due_date → rejected by Pydantic validation (422).
- Recharts container zero-height on first mount → `min-height` fixed in glass card (documented in iteration_1 minor).

### 2.6 Acceptance Criteria (V1.0 sign-off)
- All 17 functional requirements implemented and tested end-to-end.
- 29/29 backend tests + 100% frontend test pass (see iteration_2 report).
- Zero critical or minor blocking issues.
- All ecosystem integrations at minimum show `Connected` state with rich seed data.

---

## 3. Technical Architecture

### 3.1 Frontend Architecture
- **Framework**: React 19 (functional + hooks).
- **Router**: `react-router-dom` v7 with `BrowserRouter`.
- **Styling**: Tailwind CSS + Tailwind CSS variables + custom design tokens in `/app/frontend/src/index.css`.
- **UI kit**: shadcn/ui (`/app/frontend/src/components/ui/*`) — used primarily for `Toaster` (Sonner).
- **Charts**: Recharts.
- **Icons**: `lucide-react`.
- **Fonts**: Cabinet Grotesk (display) + Satoshi (body) via Fontshare CDN.
- **HTTP**: `axios` with `withCredentials: true` for cookie-based auth.
- **State**: React Context for `AuthContext`; per-page `useState` for local UI + `useEffect` for data fetch. Deliberately no Redux / Zustand.

### 3.2 Backend Architecture
- **Framework**: FastAPI (async).
- **Server**: Uvicorn (managed by supervisord in-container).
- **DB driver**: Motor (async MongoDB).
- **Auth**: `bcrypt` + `PyJWT` HS256, cookies.
- **AI**: `emergentintegrations` library → Claude Sonnet 4.5 via Emergent Universal LLM key.
- **Runtime**: Python 3.11+.

### 3.3 Folder Structure
```
/app
├── backend/
│   ├── server.py               # main FastAPI app: routes, auth, dashboard, transactions, etc.
│   ├── vaulta_seed.py          # rich demo data for artist showcase (500+ txns)
│   ├── vaulta_v2.py            # grants + projects seed data + V1.0 features
│   ├── vaulta_aiah.py          # AIAH streaming (Claude Sonnet 4.5)
│   ├── requirements.txt        # Python deps
│   ├── .env                    # MONGO_URL, DB_NAME, JWT_SECRET, EMERGENT_LLM_KEY, ADMIN_*
│   └── tests/
│       └── backend_test.py     # pytest suite (29 tests)
├── frontend/
│   ├── public/
│   │   ├── vualta-logo.png     # official Vualta logo
│   │   └── ancr-logo.png       # official ANCR logo
│   ├── src/
│   │   ├── App.js              # routes + AuthProvider
│   │   ├── index.js / .css     # entry + design tokens + fonts
│   │   ├── lib/api.js          # axios client + formatters
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── components/
│   │   │   ├── Layout.jsx      # sidebar + topbar shell
│   │   │   ├── VaultaLogo.jsx  # VaultaLogo + AncrLogo image components
│   │   │   ├── primitives.jsx  # KPICard, GlassCard, SectionHeader, PageHeader, StatusPill
│   │   │   └── ui/             # shadcn primitives
│   │   └── pages/
│   │       ├── LoginPage.jsx
│   │       ├── Dashboard.jsx
│   │       ├── Income.jsx
│   │       ├── Expenses.jsx
│   │       ├── Budget.jsx
│   │       ├── Royalties.jsx
│   │       ├── Publishing.jsx
│   │       ├── Contracts.jsx
│   │       ├── Invoices.jsx
│   │       ├── Taxes.jsx
│   │       ├── Business.jsx
│   │       ├── Funding.jsx         # Grant & Funding Center
│   │       ├── Projects.jsx        # Tour P&L list
│   │       ├── ProjectDetail.jsx   # deep P&L view
│   │       ├── Reports.jsx
│   │       ├── Vault.jsx
│   │       ├── Settings.jsx
│   │       ├── AIAH.jsx
│   │       └── Ecosystem.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   ├── craco.config.js         # `@` alias → src
│   └── .env                    # REACT_APP_BACKEND_URL
└── memory/
    ├── PRD.md
    ├── test_credentials.md
    └── VUALTA_TECHNICAL_SPECIFICATION.md   # this file
```

### 3.4 Data Flow
```
Browser (React 19)
   │
   │  fetch(API/*) with credentials: 'include'
   ▼
Kubernetes Ingress
   │  /api/* → backend:8001
   │  /*     → frontend:3000
   ▼
FastAPI (server.py)
   │  Depends(get_current_user) → JWT decode from cookie
   ▼
Motor (Async MongoDB) ─▶ vaulta_db (collections in §4)
   │
   │  Optionally invoke AIAH:
   ▼
Emergent Universal LLM Key → Anthropic Claude Sonnet 4.5
   │  streaming SSE deltas
   ▼
Browser (AIAH page renders incremental text)
```

### 3.5 State Management
- **Global**: `AuthContext` (user object, login, register, logout, refresh).
- **Local per page**: `useState` + `useEffect` for data fetching.
- **No caching layer** (SWR / React Query) — pages refetch on mount by design (data is small; simplicity wins in V1.0).

### 3.6 API Architecture
- All routes prefixed with `/api` for Kubernetes ingress routing.
- Every non-auth route depends on `get_current_user`.
- Response format: pure JSON. Never returns `_id`. All IDs are UUID4 strings stored in the `id` field.
- Streaming responses (AIAH) use SSE with `text/event-stream` and JSON payloads per event.

### 3.7 Authentication Flow
```
1. POST /api/auth/login {email, password}
2. Backend: bcrypt.checkpw → generate JWT access (24h) + refresh (30d)
3. Backend: Set-Cookie access_token / refresh_token (httpOnly, samesite=lax, path=/)
4. Frontend: axios has withCredentials=true → cookies attach on subsequent calls
5. GET /api/auth/me → decode access_token → return user (minus password_hash)
6. POST /api/auth/refresh → refresh_token verified → new access_token
7. POST /api/auth/logout → clear cookies
```

### 3.8 Authorization Model
- Role stored on JWT payload and on `users` doc.
- `get_current_user` returns user without password hash.
- `owner_id_for(user)` — helper to route reads to the correct dataset (Artist demo dataset for non-Artist roles in V1.0). **Production must replace** with:
  - Owner-scoped queries (`owner_id == user.id`) for personal data.
  - Explicit role-based ACLs (RBAC) for shared modules (Manager viewing artist, Accountant viewing client).
  - A `permissions` collection or a policy engine (e.g., Cerbos, Casbin).

### 3.9 Error Handling
- Structured `HTTPException(status, detail)` for known errors.
- Pydantic validation errors → 422 with detail array.
- Frontend `formatApiErrorDetail(detail)` handles string / array / object shapes uniformly.
- Toasts via Sonner for user-visible failures.
- Unexpected errors bubble to Uvicorn traceback; production must send to Sentry / equivalent (see §10.7).

### 3.10 Logging
- Backend uses Python `logging` at INFO level. Startup logs seed events. Uvicorn writes access logs to stdout.
- Frontend: no dedicated logger; production should route via a browser exception tracker.
- Log locations in-container:
  - `/var/log/supervisor/backend.err.log`
  - `/var/log/supervisor/backend.out.log`
  - `/var/log/supervisor/frontend.err.log`
  - `/var/log/supervisor/frontend.out.log`

---

## 4. Database Schema

Database: `vaulta_db` (MongoDB). All documents use `id` (UUID4 string), never `_id`.

### 4.1 `users`
| Field | Type | Notes |
|---|---|---|
| id | string (uuid4) | primary key |
| email | string | **unique index** (lowercased) |
| password_hash | string | bcrypt |
| name | string | display name |
| role | string enum | one of the 10 roles |
| created_at | ISO 8601 string | UTC |

Indexes: `email` unique.

### 4.2 `transactions`
| Field | Type | Notes |
|---|---|---|
| id | uuid4 | |
| owner_id | uuid4 | FK → users.id |
| type | enum | `income` or `expense` |
| category | string | e.g., "Streaming Revenue", "Travel" |
| subcategory | string | e.g., "Spotify", "Uber / Lyft" |
| amount | number | positive, USD |
| currency | string | default "USD" |
| date | ISO date string | YYYY-MM-DD |
| description | string | |
| client | string | vendor/client name |
| tags | array of string | |
| created_at | ISO 8601 string | |

Indexes: `[(owner_id, 1), (date, -1)]`.

### 4.3 `invoices`
| Field | Type | Notes |
|---|---|---|
| id | uuid4 | |
| owner_id | uuid4 | |
| invoice_number | string | `VLT-YYYYMM-XXXXXX` |
| client_name | string | required |
| client_email | string | optional, email |
| amount | number | USD |
| currency | string | |
| due_date | ISO date | required |
| status | enum | Paid / Pending / Late / Recurring |
| line_items | array | `[{description, qty, rate, total}]` |
| notes | string | |
| created_at | ISO 8601 | |

Indexes: `owner_id`.

### 4.4 `contracts`
| Field | Type | Notes |
|---|---|---|
| id | uuid4 | |
| owner_id | uuid4 | |
| title | string | |
| type | string | 10+ contract types |
| counterparty | string | |
| value | number | USD |
| currency | string | |
| status | enum | Draft / Pending Signature / Signed / Expired |
| signed_date | ISO date | nullable |
| expiration_date | ISO date | nullable |
| notes | string | |
| created_at | ISO 8601 | |

Indexes: `owner_id`.

### 4.5 `budgets`
| Field | Type | Notes |
|---|---|---|
| id | uuid4 | |
| owner_id | uuid4 | |
| name | string | |
| type | enum | Monthly / Tour / Album / Project / Film / Writing Camp / Grant / Department / Savings |
| total_amount | number | |
| spent | number | |
| currency | string | |
| period_start | ISO date | nullable |
| period_end | ISO date | nullable |
| notes | string | |

Indexes: `owner_id`.

### 4.6 `royalties`
| Field | Type | Notes |
|---|---|---|
| id | uuid4 | |
| owner_id | uuid4 | |
| pro | enum | ASCAP / BMI / SESAC / SoundExchange / MLC / Harry Fox |
| type | enum | Performance / Mechanical / Digital Neighboring |
| amount | number | |
| period | string | YYYY-MM |
| status | enum | Paid / Pending |
| song | string | |
| date | ISO date | |

Indexes: `owner_id`.

### 4.7 `songs`
| Field | Type | Notes |
|---|---|---|
| id | uuid4 | |
| owner_id | uuid4 | |
| title | string | |
| writers | string | comma-separated |
| splits | array of string | e.g., ["Kai 50%", "Nia 50%"] |
| publisher | string | |
| pro | enum | as above |
| iswc | string | ISO 15707 identifier |
| isrc | string | ISO 3901 identifier |
| upc | string | UPC-12 |
| registration_status | enum | Registered / Pending |
| ownership_verified | boolean | |
| certificate_status | enum | Issued / Pending |
| distribution_status | enum | Live / Pending |
| release_status | enum | Released / Unreleased |

Indexes: `owner_id`.

### 4.8 `vault_docs`
| Field | Type | Notes |
|---|---|---|
| id | uuid4 | |
| owner_id | uuid4 | |
| name | string | |
| category | enum | 13 categories (Tax Returns, Contracts, Identification, Insurance, etc.) |
| size_kb | integer | |
| encrypted | boolean | always true |
| tags | array of string | |
| notes | string | |
| uploaded_at | ISO 8601 | |

Indexes: `owner_id`.

### 4.9 `grant_opportunities` (global — not per user)
| Field | Type | Notes |
|---|---|---|
| id | uuid4 | |
| name | string | |
| organization | string | |
| category | enum | 16 categories |
| subcategory | string | |
| amount | number | max award |
| deadline | string | ISO date or "Rolling" / "By nomination" |
| eligibility | string | free-form |
| location | string | |
| difficulty_score | int 0–100 | |
| estimated_hours | int | application time |
| ai_match_score | int 0–100 | |
| documents_required | array of string | |
| previous_winners | array of string | |
| notes | string | |
| funding_type | enum | Grant / Fellowship / Residency / Scholarship / Award / Competition / Accelerator / Venture / Angel / Crowdfunding / Pitch |

Indexes: `category`.

### 4.10 `grant_applications`
| Field | Type | Notes |
|---|---|---|
| id | uuid4 | |
| owner_id | uuid4 | |
| opportunity_name | string | (v1: name; v2 should be FK to `grant_opportunities.id`) |
| status | enum | In Progress / Submitted / Awarded / Rejected |
| submitted_date | ISO date | nullable |
| decision_date | ISO date | nullable |
| amount_awarded | number | nullable |
| progress | int 0–100 | |
| notes | string | |

Indexes: `owner_id`.

### 4.11 `projects` (Tour Profitability & Project P&L)
| Field | Type | Notes |
|---|---|---|
| id | uuid4 | |
| owner_id | uuid4 | |
| name | string | |
| type | enum | Tour / Album / EP / Single / Film / Festival / Writing Camp / Conference / Workshop / Residency |
| status | enum | Planned / Active / Complete / Cancelled |
| start_date | ISO date | |
| end_date | ISO date | |
| location | string | |
| shows | int | count of dates (tour) |
| capacity_avg | int | avg venue capacity |
| ticket_price_avg | number | |
| revenue | object | `{ "Ticket Sales": 540000, ... }` |
| expenses | object | `{ "Flights": 42000, ... }` |
| milestones | array of object | `[{date, city, revenue, cost, status}]` |
| risks | array of object | `[{risk, severity, mitigation}]` |
| notes | string | |

Indexes: none required in V1.0; add `owner_id` in production.

### 4.12 `funding_opportunities` (legacy, still populated for backward compat)
Preserved from iteration_1. Superseded by `grant_opportunities` in V1.0. Safe to drop after migration.

---

## 5. API Documentation

Base URL: `${REACT_APP_BACKEND_URL}/api`.
All routes require valid `access_token` cookie unless otherwise noted.
All errors follow `{"detail": "..."}` or Pydantic `[{"loc","msg","type"}...]`.

Legend: 🔓 = public, 🔒 = auth required.

### 5.1 Auth

#### 🔓 POST `/auth/register`
Register a new user.
- **Body**: `{email: EmailStr, password: string(min=6), name: string, role: enum}`
- **200**: `{id, email, name, role}` — cookies set.
- **400**: email already registered.

#### 🔓 POST `/auth/login`
- **Body**: `{email, password}`
- **200**: user object, cookies set.
- **401**: invalid credentials.

#### 🔒 GET `/auth/me` → user object

#### 🔒 POST `/auth/logout` → `{ok: true}` clears cookies.

#### POST `/auth/refresh`
Requires `refresh_token` cookie. Returns new `access_token`. 401 if missing/invalid.

### 5.2 Dashboard

#### 🔒 GET `/dashboard/overview`
Returns:
```json
{
  "net_worth": 1088920,
  "cash_available": 1076920,
  "monthly_revenue": 0,
  "monthly_expense": 0,
  "projected_income": 0,
  "outstanding_invoices": 69800,
  "royalties_pending": 19896,
  "publishing_income": 82300,
  "business_health_score": 85,
  "tax_readiness": 72,
  "income_total": 1101120,
  "expense_total": 54700,
  "chart": [{"month": "2025-06", "income": 12345, "expense": 6789}, ...],
  "recent_transactions": [ ...8 ],
  "upcoming_payments": [ ...6 ]
}
```

### 5.3 Transactions
- **GET `/transactions?type=income|expense`** → array.
- **POST `/transactions`** → single doc. Body: `TransactionIn`.
- **DELETE `/transactions/{id}`** → `{ok: true}`.

### 5.4 Summaries
- **GET `/income/summary`** → `{total, by_category:[{category,amount,pct}], items}`
- **GET `/expenses/summary`** → same shape.

### 5.5 Royalties
- **GET `/royalties`** → `{total_paid, total_pending, estimated_next_quarter, by_pro:[{pro,amount,count,pending}], items}`

### 5.6 Publishing
- **GET `/publishing/songs`** → array of songs.

### 5.7 Contracts
- **GET `/contracts`** → array.
- **POST `/contracts`** → single doc. Body: `ContractIn`.

### 5.8 Invoices
- **GET `/invoices`** → array.
- **POST `/invoices`** → single doc; auto-generates `invoice_number`.
- **PATCH `/invoices/{id}/status`** → `{ok:true}`. Body: `{status}`.

### 5.9 Budgets
- **GET `/budgets`** → array.
- **POST `/budgets`** → single doc.

### 5.10 Taxes
- **GET `/taxes/overview`** → quarterly payments, deductions_by_category, forms, taxable_income, estimated_tax, tax_readiness_score.

### 5.11 Business
- **GET `/business/profile`** → static profile with entities, licenses, bank_accounts, credit_cards, credit_score, insurance, compliance.
- V1.0: hardcoded server-side (see §13, engineering task).

### 5.12 Grant & Funding Center

#### 🔒 GET `/grants/opportunities?category=`
Returns `{opportunities: [...], categories: [...]}`.

#### 🔒 GET `/grants/applications` → array (per-user).

#### 🔒 GET `/grants/summary`
Returns:
```json
{
  "total_secured": 52000,
  "total_pipeline": 252000,
  "in_progress_count": 6,
  "submitted_count": 1,
  "awarded_count": 3,
  "rejected_count": 2,
  "win_rate": 60.0,
  "upcoming_deadlines": [ ...opps within 120d ],
  "recent_awards": [ ...awarded apps ],
  "in_progress": [ ... ],
  "submitted": [ ... ]
}
```

### 5.13 Projects

#### 🔒 GET `/projects` → array with computed P&L per project.

#### 🔒 GET `/projects/{pid}` → single project with:
```json
{
  "id": "...", "name": "...", "type": "Tour", "status": "Active",
  "total_revenue": 968400,
  "total_expense": 698000,
  "net_profit": 270400,
  "profit_margin": 27.9,
  "roi": 38.7,
  "revenue_per_show": 53800,
  "cost_per_traveler": 9600,
  "break_even_show": 4,
  "health_score": 85,
  "timeline": [{"date": "...", "city": "...", "revenue": 58200, "cost": 34400, "status": "Confirmed", "cumulative_revenue": 58200, "cumulative_cost": 34400, "cumulative_net": 23800}],
  "risks": [{"risk": "...", "severity": "Medium", "mitigation": "..."}]
}
```
- **404** if project not found.

#### 🔒 POST `/projects` → creates project. Body: `ProjectIn`.

### 5.14 Reports
- **GET `/reports/pnl`** → `{income:[{category,amount}], expense:[...], total_income, total_expense, net_profit}`
- **GET `/reports/cashflow`** → `{series:[{month, income, expense, net}]}`

### 5.15 Vault
- **GET `/vault/documents`** → array.
- **POST `/vault/documents`** → single doc. Body: `VaultDocIn`.

### 5.16 Ecosystem
- **GET `/ecosystem/status`** → 10 hardcoded ecosystem module states.

### 5.17 AIAH

#### 🔒 POST `/aiah/chat`
- **Body**: `{message: string, session_id?: string}`
- **Response**: `Content-Type: text/event-stream`. Each event:
  ```
  data: {"delta": "text..."}
  data: {"done": true, "session_id": "..."}
  data: {"error": "..."}
  ```
- **Model**: `anthropic/claude-sonnet-4-5-20250929` via `EMERGENT_LLM_KEY`.
- Grounded with `dashboard_overview` context.

### 5.18 Example — full login + protected call
```bash
API_URL=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)
curl -s -c /tmp/c.txt -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"artist@vaulta.io","password":"Vaulta2026!"}'
curl -s -b /tmp/c.txt "$API_URL/api/dashboard/overview"
```

---

## 6. UI Specification

### 6.1 Global Shell
- **Sidebar**: 260px fixed, obsidian black, Vualta logo top, ANCR logo bottom. Two sections: Command (14 nav items) + Systems (AIAH, Ecosystem, Settings). User card with role + logout.
- **Topbar**: 64px sticky, backdrop-blur, live indicator, search hint (⌘K stubbed), bell.
- **Main content**: `max-w-[1680px]`, `px-6 lg:px-10 py-8 lg:py-10`.
- **Design tokens** in `/app/frontend/src/index.css`: `--obsidian-*`, `--vaulta-blue/violet/orange`, `--text-*`, `--border-*`, `--radius`.
- **Grain overlay** via SVG noise, opacity 0.035.
- **Gradient bar** (`.gradient-bar`): `linear-gradient(90deg, #00f0ff 0%, #8b5cf6 50%, #ff5f1f 100%)`.

### 6.2 Pages (behavior)

#### Login (`/login`)
- Hero (`hidden lg:flex`): Vualta logo (large), gradient headline, marketing paragraph, 3 stat tiles.
- Right: glass form (Sign In / Register toggle). Below: "Instant Role Preview" grid — 9 quick-login buttons.
- **Loading**: spinner replaces submit label.
- **Error**: inline `#f97316` text below form.
- **Empty**: N/A.

#### Dashboard (`/`)
- 3 rows: 5 KPIs, 4 KPIs, 2-column chart + AIAH insights, 2-column recent txns + upcoming payments.
- **Loading**: `text-white/40 text-sm "Loading terminal…"`.
- **Empty**: chart still renders with zeros; KPIs display $0.

#### Income / Expenses
- 4 KPIs + pie/bar chart + category breakdown + full ledger table.
- **Empty**: "Loading income streams…" until data arrives.

#### Budget
- 4 KPIs + card grid. Type badge + progress bar (over-budget triggers orange).

#### Royalties
- 4 KPIs + PRO registry grid + 3-quarter forecast + AIAH signal.

#### Publishing
- 4 KPIs + full song table with ISWC/ISRC/UPC.

#### Contracts
- 4 KPIs + table with type-colored labels.

#### Invoices
- 4 KPIs + list + Create modal (Sonner toast on success).

#### Taxes
- 4 KPIs + quarterly cards + tax forms + top deductions.

#### Business
- 4 KPIs + entities + banking + licenses/insurance/compliance grids.

#### Grants & Funding (`/funding`)
- 6 KPIs + Upcoming Deadlines (grid of 4 cards) + Applications table + AI Funding Advisor + Filter chips + Search + Opportunities grid.

#### Projects (`/projects`)
- 4 KPIs + 2-column card grid. Each card links to `/projects/:id`.

#### ProjectDetail (`/projects/:id`)
- Header + 6 KPIs + Cumulative Chart + Revenue Pie + Expense Bar + per-show KPIs + Milestones table + Risks + AI Strategist.

#### Reports
- 4 KPIs + Cash Flow chart + P&L breakdown (2 columns) + Balance Sheet (3 columns).

#### Vault
- 4 KPIs + search + card grid (13 categories with color tone).

#### AIAH (`/aiah`)
- 3-col layout: chat panel (h-640) + suggested prompts. SSE-driven text deltas append to last assistant message.

#### Ecosystem
- 10 ecosystem cards + Passport unified record panel.

#### Settings
- Profile + Permissions + Security cards.

### 6.3 Responsive Behavior
- Sidebar hidden on `< lg (1024px)`. Topbar shows Vualta logo instead.
- KPI grids collapse: 5-col → 2-col at md.
- Charts use `ResponsiveContainer` from Recharts.
- Search input hides its right ⌘K hint at `< md`.

### 6.4 Empty / Loading / Error States
- Loading: single-line text (`text-white/40 text-sm`).
- Empty: same single-line pattern.
- Error: Sonner toast (top-right) + inline error text where relevant.

### 6.5 Accessibility
- All interactive elements have `data-testid`.
- Focus ring uses cyan outline (`outline-color: rgba(0,240,255,0.6)`).
- Color contrast: white text on obsidian bg ≥ 15:1 (AAA).
- Table markup uses semantic `<table><thead><tbody>`.
- **Known gap**: no ARIA labels on decorative gradient bars; icons lack `aria-label` in some places. Address in prod hardening.

---

## 7. Component Inventory

### 7.1 `components/VaultaLogo.jsx`
| Component | Purpose | Props | State |
|---|---|---|---|
| `VaultaLogo` | Renders official Vualta logo image with inversion filter | `className`, `size` ("default"\|"large") | none |
| `VaultaMark` | SVG-only V mark (fallback / small usage) | `className` | none |
| `AncrLogo` | ANCR logo image (dark theme native) | `className` | none |
| `AncrLogoTiny` | Compact ANCR logo | `className` | none |

### 7.2 `components/Layout.jsx`
Sidebar + topbar shell. Consumes `useAuth()`. `<Outlet />` for nested routes. No props.

### 7.3 `components/primitives.jsx`
| Component | Purpose | Props |
|---|---|---|
| `GlassCard` | Glass panel wrapper | `children`, `className`, `hover`, `testid` |
| `KPICard` | KPI tile with accent bar | `label`, `value`, `sub`, `accent` (blue\|violet\|orange\|green\|grad), `trend`, `testid`, `compact` |
| `SectionHeader` | Kicker + title | `title`, `kicker`, `action`, `className` |
| `PageHeader` | Large page title | `title`, `subtitle`, `kicker`, `right` |
| `Pill` | Rounded badge | `children`, `tone`, `className` |
| `StatusPill` | Auto-maps `status` string to tone | `status` |

### 7.4 `context/AuthContext.jsx`
`AuthProvider` wraps app. Exposes `{user, error, login, register, logout, refresh}` via `useAuth()`.
- `user`: `null` (loading), `false` (anonymous), or user object.

### 7.5 `lib/api.js`
- Default export: axios instance (`withCredentials: true`, `baseURL: API`).
- Named exports: `API`, `formatMoney`, `formatCompactMoney`, `formatDate`, `formatApiErrorDetail`.

### 7.6 Page components
Each `pages/*.jsx` is a default export function. Fetches its own data via `useEffect`. Renders using primitives + Recharts + lucide-react.

### 7.7 Reusability
- **High**: `GlassCard`, `KPICard`, `SectionHeader`, `PageHeader`, `StatusPill`.
- **Medium**: `VaultaLogo`, `AncrLogo`.
- **Low (page-specific)**: `ProjectDetail`, `Dashboard` (large composites).

---

## 8. Business Rules

### 8.1 Permissions
- Every authenticated route requires a valid `access_token` cookie.
- Ownership: `POST` writes always attach `owner_id = user.id`. Reads use `owner_id_for(user)` — see §3.8.

### 8.2 Visibility
- Non-Artist roles in V1.0 read Artist demo data (documented showcase behavior).
- Production must scope reads by `owner_id` and optionally by ACL grants.

### 8.3 Security
- Passwords bcrypt-hashed with `bcrypt.gensalt()` (12 rounds default).
- JWT signed with `HS256`. Secret from `JWT_SECRET` env.
- Cookies: `httpOnly=true`, `samesite=lax`, `secure=false` (V1.0 through proxy). **Production**: `secure=true`, `samesite=none`.
- Vault documents flagged `encrypted=true` metadata; actual encryption is a §13 engineering task.

### 8.4 Validation (server-side, Pydantic)
- `RegisterIn.password` min length 6.
- `RegisterIn.email` must be a valid email.
- `TransactionIn`, `InvoiceIn`, `ContractIn`, `BudgetIn`, `VaultDocIn`, `ProjectIn` enforce required fields and typed values.
- Roles outside the 10-role set fall back to `Artist` on register.

### 8.5 Workflow Logic
- **Invoice number**: generated at creation as `VLT-YYYYMM-XXXXXX`.
- **Project P&L**: recomputed on every read via `_compute_pnl` — deterministic given the stored revenue/expenses/milestones/risks.
- **Break-even**: index of first milestone where cumulative revenue ≥ total_expense.
- **Health score composite** (Projects):
  - Base 50
  - +25/+15/+8/-15 based on profit margin band
  - +10 if `status == "Active"`
  - -8 per High-severity risk
  - Clamped to [0, 100].
- **Win rate** (Grants): `awarded / (awarded + rejected) * 100`.
- **Upcoming deadlines** (Grants): opportunities not yet applied to, deadline within 120 days, excluded if `deadline == "Rolling"` or `"By nomination"`.

---

## 9. ANCR Ecosystem Integration

V1.0 uses **realistic mock data**. Production must implement authenticated inter-module APIs. Below is the target integration surface per module.

### 9.1 ANCRID (Identity Provider)
- **Direction**: ANCRID → Vualta.
- **Contract**: OIDC / OAuth2 authorization code flow. ANCRID issues signed JWT with `sub`, `role`, `passport_level`.
- **Vualta action**: replace local `/auth/*` with ANCRID validation; keep local users table but reconcile via `ancrid_id`.
- **Shared data**: identity assertion, passport level.
- **V1.0 mock**: `/api/ecosystem/status` returns `Identity verified · Passport level 3`.

### 9.2 ANCRA (Institutional Programs)
- **Direction**: bidirectional.
- **Contract**: REST `/ancra/programs/{user_id}`, `/ancra/scholarships/{user_id}`.
- **Shared data**: scholarship awards, tuition status, CCDP milestones. Feeds Vualta grant applications with pre-verified eligibility.
- **V1.0 mock**: `"$28K in awarded scholarships"`.

### 9.3 ANCRLAB (Project Budgets)
- **Direction**: ANCRLAB → Vualta (project budget sync); Vualta → ANCRLAB (actuals).
- **Contract**: REST `POST /vualta/projects` when a new ANCRLAB project is created; webhook back on budget consumption.
- **Shared data**: project name, budget, spend, milestones.
- **V1.0 mock**: `"3 active budgets · $184K tracked"`.

### 9.4 ANCRSync (Collaborative Expenses)
- **Direction**: ANCRSync → Vualta.
- **Contract**: `POST /vualta/transactions/shared` — creates shared expense records with split percentages.
- **Shared data**: split invoices, expense allocations across collaborators.
- **V1.0 mock**: `"5 collaborators · 12 shared invoices"`.

### 9.5 COHEIR (Mentorship)
- **Direction**: COHEIR → Vualta (context only).
- **Contract**: `GET /coheir/mentor/{user_id}` returns current mentor.
- **Shared data**: mentor name, sessions count. Displayed as ecosystem signal.
- **V1.0 mock**: `"Mentor: Nia Whitfield · 6 sessions logged"`.

### 9.6 INHEIRA (Publishing / Rights)
- **Direction**: INHEIRA → Vualta (registered songs); Vualta → INHEIRA (royalty attribution back).
- **Contract**: `GET /inheira/songs/{owner_id}` populates `songs` collection. Webhook on new registration.
- **Shared data**: title, writers, splits, publisher, PRO, ISWC, ISRC, UPC, registration status.
- **V1.0 mock**: 12 seeded songs; ecosystem shows `"42 registered songs · 18 with sync clearance"`.

### 9.7 Vualta (self)
- **Consumer of other modules; source of truth for finance.**
- Publishes events: `invoice.created`, `contract.signed`, `royalty.received`, `project.updated`, `grant.awarded`.

### 9.8 ANCRMEDIA (a.k.a. ANCRVIEW / ANCRWAV)
- **Direction**: ANCRMEDIA → Vualta.
- **Contract**: `GET /ancrmedia/streaming/{user_id}` returns streaming royalty totals per platform.
- **Shared data**: RPM, view/stream counts, platform-level revenue.
- **V1.0 mock**: `"Views 4.2M · RPM $3.12"` (ANCRVIEW); `"Spotify · Apple · Tidal · Amazon"` (ANCRWAV).

### 9.9 ANCRLaunch (Internships & Placement)
- **Direction**: ANCRLaunch → Vualta.
- **Contract**: `POST /vualta/transactions` — internship stipend inflows.
- **Shared data**: placements count, income to date.
- **V1.0 mock**: `"2 placements · $12,400 paid YTD"`.

### 9.10 Passport (Unified Financial Record)
- **Direction**: Vualta ↔ Passport.
- **Contract**: Vualta emits a signed "financial passport" (Net Worth, PRO count, contracts count, business entities). Passport aggregates across the ecosystem.
- **V1.0 mock**: `"23 trips · $41,220 expensed"` (from Passport travel sync).

### Cross-cutting
- **Auth**: all inter-module calls should carry ANCRID-issued service tokens (JWT with `aud=vualta`).
- **Event bus**: recommended pub/sub (NATS / Kafka / SNS) with the events listed above.
- **Data ownership**: each module owns its domain. Vualta owns finance. INHEIRA owns rights. ANCRID owns identity. No cross-writes to another module's DB.

---

## 10. Security Specification

### 10.1 Authentication
- Bcrypt password hashing (12 rounds default).
- JWT HS256 with `JWT_SECRET`. Payload: `{sub, email, role, exp, type}`. `type ∈ {access, refresh}`.
- Access TTL: 24h. Refresh TTL: 30d.
- Cookies: `httpOnly=true`, `samesite=lax`, `secure=false` (V1.0). **Production** must set `secure=true`, `samesite=none` and use `SameSite=Strict` where possible.

### 10.2 Authorization
- Every non-auth route depends on `get_current_user`.
- V1.0 route-level auth. **Production**: introduce object-level ACLs.

### 10.3 Role-Based Access
- 10 roles enumerated. Role stored in JWT (fast reads) and DB (source of truth). Frontend shows permissions per role in Settings.
- **Production**: implement `PERMISSIONS` matrix in code and enforce per-route.

### 10.4 Session Management
- Cookies handle sessions. No server-side session store in V1.0.
- **Production**: consider a Redis-backed refresh token revocation list.

### 10.5 JWT / Cookies
- Secret rotation: NOT implemented. Add a `kid` header + JWKS in production.
- Refresh token reuse detection: NOT implemented.

### 10.6 Encryption
- In-transit: TLS at the ingress (production).
- At-rest: MongoDB Atlas encryption-at-rest recommended.
- **Vault**: metadata flag only in V1.0. Production must integrate AES-256 file storage (see §13).

### 10.7 Rate Limiting
- NOT implemented in V1.0.
- **Production**: apply an ingress-level rate limiter (Nginx / Cloudflare) with per-IP and per-user quotas. Suggested: 60 rpm anonymous, 600 rpm authenticated, 5 rpm for `/auth/login`.

### 10.8 Audit Logging
- Application logs only (Uvicorn access + `log.info` in `startup`). No audit trail.
- **Production**: append-only `audit_events` collection with actor, action, target, timestamp, ip, user_agent. Hook into every write endpoint.

### 10.9 Privacy Controls
- Personally identifiable data lives only in `users`.
- No third-party analytics wired.
- **Production**: GDPR / CCPA data export + deletion endpoints (`GET /me/export`, `DELETE /me`).

---

## 11. Testing Documentation

### 11.1 Coverage
| Layer | Framework | Files | Result |
|---|---|---|---|
| Backend | pytest | `/app/backend/tests/backend_test.py` | 29/29 pass |
| Frontend | Playwright (via testing agent) | ephemeral scripts, verified during iteration_1 / iteration_2 | 100% pass |

### 11.2 Unit Tests
Currently absent — backend uses black-box functional tests via TestClient. Add unit tests for:
- `_compute_pnl` (deterministic given input).
- `hash_password` / `verify_password`.
- JWT create/decode.
- `owner_id_for` (once permission model lands).

### 11.3 Integration Tests
- All 29 pytest cases in `backend_test.py` cover cross-collection reads and writes.
- Coverage areas: auth, dashboard, transactions CRUD, summaries, royalties, publishing, contracts, invoices, budgets, taxes, business, grants (opps/apps/summary), projects (list/detail/create/404), reports, vault, ecosystem, AIAH SSE stream.

### 11.4 Regression Suite
- Re-runs of `backend_test.py` are the primary regression harness.
- Frontend regression executed by testing agent Playwright scripts (login, sidebar nav, module load, invoice creation, AIAH streaming).

### 11.5 Test Coverage Report
- No `coverage.py` invoked in V1.0.
- **Production**: add `pytest --cov=backend --cov-report=xml` and gate CI ≥ 80%.

### 11.6 Known Limitations
- Frontend has no dedicated unit tests (React Testing Library not wired).
- No accessibility (axe-core) tests.
- No load tests.

---

## 12. Deployment Guide

### 12.1 Environment Variables

**Backend (`/app/backend/.env`)**
| Var | Required | Example |
|---|---|---|
| `MONGO_URL` | ✅ | `mongodb://localhost:27017` |
| `DB_NAME` | ✅ | `vaulta_db` |
| `CORS_ORIGINS` | ✅ | `*` |
| `JWT_SECRET` | ✅ | 64-char hex string |
| `ADMIN_EMAIL` | ✅ | `admin@vaulta.io` |
| `ADMIN_PASSWORD` | ✅ | strong password |
| `EMERGENT_LLM_KEY` | ✅ | key from Emergent for Claude Sonnet |

**Frontend (`/app/frontend/.env`)**
| Var | Required | Example |
|---|---|---|
| `REACT_APP_BACKEND_URL` | ✅ | `https://vualta.example.com` (no trailing `/api`) |

### 12.2 Required Services
- MongoDB (Atlas M10+ recommended in prod, replica set enabled).
- Emergent Universal LLM Key (Anthropic Claude Sonnet 4.5).
- Object storage (S3 / GCS) — engineering task for Vault.
- Optional: Redis (rate limiting + refresh token revocation).

### 12.3 Secrets
- Store in a secret manager (AWS Secrets Manager / Google Secret Manager / Vault by HashiCorp). Never commit `.env`.
- Rotate `JWT_SECRET` on a documented cadence (quarterly).

### 12.4 Build Process
**Backend**
```bash
cd /app/backend
pip install -r requirements.txt
```

**Frontend**
```bash
cd /app/frontend
yarn install
yarn build           # outputs /app/frontend/build
```

### 12.5 Deployment Steps (production target)
1. Provision MongoDB cluster; create `vaulta_db`.
2. Deploy backend behind an ingress (Nginx / ALB) with TLS.
3. Configure secrets manager for backend env.
4. Deploy frontend static build to CDN / S3+CloudFront.
5. Run one-off seed script (or omit for prod; V1.0 seed is dev-only).
6. Smoke-test: `curl <backend>/api/auth/login` and confirm cookie flow.

### 12.6 Rollback Process
1. Backend: previous container image is retained; `kubectl rollout undo deployment/vualta-backend`.
2. Frontend: revert CDN origin to previous build hash.
3. Database: point-in-time restore from MongoDB Atlas.
4. Announce rollback in `#eng-incidents`.

---

## 13. Production Readiness Checklist

### 13.1 Completed ✅
- Full JWT auth (register / login / logout / me / refresh).
- All 17 functional requirements (F-1 through F-17).
- 29 backend tests pass; frontend routes verified.
- Rich seeded demo data for showcase.
- Design system + typography + logos integrated.

### 13.2 Remaining Work (Engineering) 🚧
- File storage for Vault (S3 / GCS + AES-256).
- PDF export in Reports (`reportlab`) and Excel (`openpyxl`).
- E-signature integration in Contracts (DocuSign / Dropbox Sign / HelloSign).
- Payment processing in Invoices (Stripe Connect).
- Live banking APIs (Plaid or Mercury) for transactions.
- Live ecosystem APIs (see §9).
- Real permission model (RBAC + object-level ACLs).
- Rate limiting.
- Audit logging.
- Full test coverage (unit + a11y + load).
- Router splitting: `server.py` → per-resource routers.
- CORS + cookies hardening for cross-site production.
- Secret rotation (`kid` header + JWKS).
- Refresh token revocation (Redis).
- Sentry / OpenTelemetry integration.

### 13.3 Mocked Functionality
- `/api/business/profile` — hardcoded server-side (see §5.11).
- `/api/ecosystem/status` — hardcoded 10 ecosystem states.
- Vault `encrypted=true` flag — no actual encryption.
- AI Funding Advisor signals — hand-authored fixture in Funding page.
- Dashboard AIAH insight bullets — hand-authored fixture.

### 13.4 Technical Debt
- `server.py` is ~900 lines; split into routers.
- `owner_id_for(user)` reroutes non-Artist reads to Artist data — showcase-only behavior; must be removed.
- `_compute_pnl` returns full stored doc including raw milestones/risks — trim before public API stabilization.
- `grants_summary` iterates `apps` multiple times; extract sets once.
- Dashboard AIAH insights and Funding page advisor signals are static; wire to Claude Sonnet 4.5.

### 13.5 Future Enhancements
- Multi-currency (FX rates + display currency preference).
- Investor Pack export ("Fundraising Snapshot" — signed URL to a specific project P&L).
- Live signed-URL sharing of any report.
- Mobile-native app (React Native + Expo).
- Voice commands via Whisper.
- Anomaly detection on cash flow (unusual expense spikes).

---

## 14. Engineering Roadmap

### 14.1 MVP Complete (V1.0)
All 17 functional requirements shipped; 29/29 backend, 100% frontend tests pass.

### 14.2 Phase 2 — Hardening
- Router splitting.
- Real permission model.
- Rate limiting.
- Audit logging.
- CORS + cookie hardening.
- Sentry + OpenTelemetry.

### 14.3 Phase 3 — Production Integrations
- Vault object storage + AES-256.
- Stripe Connect for invoices.
- Plaid / Mercury for banking.
- DocuSign for contracts.
- PDF / Excel exports.

### 14.4 Production Readiness
- Full CI/CD pipeline (build, test, security scan, deploy).
- 3-region deployment.
- Backup + restore drills.
- Runbooks for common incidents.
- SLA: 99.9% uptime.

### 14.5 Enterprise
- Institutional multi-tenant.
- White-label theming per institution.
- SSO (SAML / Okta / Azure AD).
- SOC 2 Type II certification.
- Data residency options (US / EU).

---

## 15. Architecture Decision Record (ADR)

### ADR-001 — MongoDB over Postgres
- **Context**: Vualta's domain has many optional / evolving fields (project revenue/expenses, ecosystem integration payloads, AIAH context blobs).
- **Decision**: MongoDB.
- **Rationale**: Schema flexibility, native JSON, Motor async driver, low friction.
- **Tradeoff**: Weaker joins; must denormalize (accepted).

### ADR-002 — JWT in httpOnly cookies vs Authorization header
- **Decision**: httpOnly cookies (access + refresh).
- **Rationale**: XSS-safe, works transparently with axios + browser, supports the SPA flow.
- **Tradeoff**: CSRF risk — mitigated with `SameSite=Lax` and (in production) `SameSite=None; Secure` + CSRF tokens on mutating routes.

### ADR-003 — Claude Sonnet 4.5 for AIAH
- **Decision**: `anthropic/claude-sonnet-4-5-20250929` via Emergent Universal LLM key.
- **Rationale**: Best-in-class reasoning for financial planning; streaming supported; no direct API key management.
- **Tradeoff**: Dependency on Emergent infra + Anthropic uptime.

### ADR-004 — No global state library (Redux / Zustand)
- **Decision**: React Context + per-page `useState`.
- **Rationale**: Data volume small; no cross-page cache required in V1.0.
- **Tradeoff**: Re-fetches on navigation; upgrade to React Query if latency budget breaks in production.

### ADR-005 — Seed on startup vs migration
- **Decision**: Idempotent seed on backend startup (dev/showcase).
- **Rationale**: One-container demo; no migration infrastructure required.
- **Tradeoff**: NOT SAFE for prod — must be gated behind a `SEED_ON_STARTUP` env flag before shipping.

### ADR-006 — Recharts over D3
- **Decision**: Recharts.
- **Rationale**: React-first API, faster to compose executive charts, gradient support.
- **Tradeoff**: Less flexibility for custom visualizations. Accepted.

### ADR-007 — Tailwind + design tokens (no shadcn-heavy usage)
- **Decision**: Tailwind CSS + CSS variables + minimal shadcn (only Sonner).
- **Rationale**: Bloomberg / Stripe / Linear aesthetic requires custom design language; shadcn defaults are too generic.
- **Tradeoff**: More CSS to maintain; documented in `index.css`.

### ADR-008 — Server-side aggregation on read
- **Decision**: Compute dashboard KPIs, P&L totals, break-even, and health scores server-side on every read.
- **Rationale**: Simpler client, guaranteed consistency, aggregations are cheap for current data volume.
- **Tradeoff**: Won't scale linearly beyond ~10k transactions per user. Introduce materialized views or aggregation cache in Phase 3.

### ADR-009 — Owner-remap for non-Artist demo roles
- **Decision**: `owner_id_for(user)` returns the Artist's `id` for any non-Artist role (showcase only).
- **Rationale**: Demo requires every role to see rich data.
- **Tradeoff**: Must be removed before any real user is onboarded. Documented in §10 and §13.

---

## 16. Handoff Notes for the CTO

**Status**: Vualta V1.0 is feature complete from a product design perspective. All 17 functional areas, both flagship V1.0 additions (Grant & Funding Center™, Tour Profitability & Project P&L™), the AIAH streaming layer, and the ANCR ecosystem panel are shipped, seeded, and tested (29/29 backend, 100% frontend).

**What you're inheriting**
- A single-container demo of the full product surface at `/app`.
- Documented data model (§4), API surface (§5), UI spec (§6), and integration contracts (§9).
- Two seed files (`vaulta_seed.py`, `vaulta_v2.py`) that populate the demo idempotently.
- Test suites at `/app/backend/tests/backend_test.py`.

**Outstanding engineering work (prioritized)**
1. **Router splitting** — `server.py` → per-resource routers. Low risk, high maintainability win.
2. **Real permission model** — remove `owner_id_for` remap, introduce ownership + ACL enforcement.
3. **Storage layer for Vault** — S3 / GCS + AES-256 + signed URLs.
4. **PDF / Excel exports** — `reportlab` + `openpyxl`. Ship as background jobs.
5. **Payment + banking integrations** — Stripe Connect, Plaid.
6. **E-signature** — DocuSign / Dropbox Sign.
7. **Live ecosystem APIs** — dependent on ANCRID, INHEIRA, ANCRLAB, COHEIR readiness.
8. **Production hardening** — rate limiting, audit logging, cookie/CORS tightening, Sentry, OpenTelemetry.
9. **Test coverage** — unit + a11y + load.

**Risks**
- **Demo-only seed on startup** — must be gated behind an env flag before deployment.
- **`owner_id_for` remap** — critical: must be removed. If accidentally shipped, any non-Artist user would see the Artist demo dataset.
- **Emergent LLM key** — single provider dependency for AIAH; add fallback (OpenAI GPT-5.2 or Gemini 3) with a provider switch.
- **CORS + cookies** — currently permissive for demo; must be locked down for cross-site production.

**Recommended next steps (30-day plan)**
- Week 1: Router splitting + real permission model + gate seeding.
- Week 2: Object storage for Vault, PDF/Excel export.
- Week 3: Stripe Connect + DocuSign integrations.
- Week 4: Rate limiting + audit logging + Sentry + CI coverage gate.

**Reference files**
- Backend entry: `/app/backend/server.py`
- Seed data: `/app/backend/vaulta_seed.py`, `/app/backend/vaulta_v2.py`
- AIAH: `/app/backend/vaulta_aiah.py`
- Frontend entry: `/app/frontend/src/App.js`
- Design tokens: `/app/frontend/src/index.css`
- Test suite: `/app/backend/tests/backend_test.py`
- PRD: `/app/memory/PRD.md`
- This spec: `/app/memory/VUALTA_TECHNICAL_SPECIFICATION.md`

---

*End of Vualta™ Technical Specification v1.0.*
