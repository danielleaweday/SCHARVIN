# VAULTA — Functional Requirements

**App folder:** `ANCR-VAULTA`
**APPNAME:** `VAULTA`
**Derived from:** `backend/{server,vaulta_v2,vaulta_aiah,vaulta_seed}.py` (1,605 lines, 35+ routes), `frontend/src/**`
**Stack observed:** FastAPI + Motor/MongoDB; bcrypt + JWT (HS256) in cookies; Claude Sonnet 4.5 streaming; React + React Router + axios
**Date of extraction:** 2026-09-03

> **Context.** Vaulta is specified as "the **financial system of record** for the ANCR ecosystem" (§13). The findings below should be read against that standard — the same behaviour that is a minor demo shortcut in a media app is a material issue in a system of record for money.

---

## 1. FUNCTIONAL REQUIREMENTS

### 1.1 Startup and seeding

**REQ-VAULTA-001**
**Given** the application starts
**When** the `startup` handler runs
**Then** a unique index is created on `users.email`, a compound index on `transactions` (`owner_id`, `date` descending), single indexes on `owner_id` for invoices, contracts, budgets, royalties, songs and vault documents, and one on `funding_opportunities.category`.

**REQ-VAULTA-002**
**Given** `seed_users_and_data()` runs
**When** the admin is provisioned
**Then** `ADMIN_EMAIL` and `ADMIN_PASSWORD` are read with `os.environ[...]` — **both are mandatory and the application fails to start without them**. The admin is created only if absent, with role `Administrator`.

**REQ-VAULTA-003**
**Given** the demo roles are seeded
**When** each is provisioned
**Then** every `DEMO_USERS` entry is created with the **shared hard-coded password `"Vaulta2026!"`**, one account per role, skipping any that already exist.

**REQ-VAULTA-004**
**Given** the Artist demo account exists
**When** seeding continues
**Then** rich financial data is seeded against the Artist's `owner_id` **only if no transaction already exists for them**, and grants and projects are seeded idempotently.

### 1.2 Authentication

**REQ-VAULTA-005**
**Given** `POST /api/auth/register`
**When** the requested `role` is outside `VAULTA_ROLES`
**Then** it silently becomes `"Artist"`. `VAULTA_ROLES` is `{Student, Faculty, Artist, Manager, Accountant, Attorney, Publisher, Administrator, Employer, Institution}` — **`Administrator` is a member, and nothing prevents a public registrant from self-assigning it**.

**REQ-VAULTA-006**
**Given** registration input
**When** validated
**Then** `email` must be a valid address and `password` at least 6 characters (`Field(min_length=6)`); a duplicate email raises **400 `"Email already registered"`**.

**REQ-VAULTA-007**
**Given** `POST /api/auth/login`
**When** it runs
**Then** an unknown email or wrong password both raise **401 `"Invalid email or password"`**. **There is no rate limiting or lockout of any kind on this financial application.**

**REQ-VAULTA-008**
**Given** auth cookies are set
**When** `set_auth_cookies` runs
**Then** both are `httponly=True` but **`secure=False`** with **`samesite="lax"`** — the only application in this workspace that does not set the `Secure` flag, so the cookies are transmissible over plain HTTP.

**REQ-VAULTA-009**
**Given** a protected endpoint
**When** `get_current_user` runs
**Then** the `access_token` cookie is read, falling back to an `Authorization: Bearer` header; a missing token raises **401 `"Not authenticated"`**, a non-access `type` **401 `"Invalid token type"`**, an unknown `sub` **401 `"User not found"`**, expiry **401 `"Token expired"`** and any other JWT error **401 `"Invalid token"`**.

**REQ-VAULTA-010**
**Given** `POST /api/auth/refresh`
**When** it succeeds
**Then** a new access token is minted and **`set_auth_cookies` is called with the *existing* refresh token**, so the refresh cookie's max-age is reset on every refresh — a sliding session with no absolute lifetime.

**REQ-VAULTA-011**
**Given** `POST /api/auth/logout`
**When** called
**Then** both cookies are cleared. **The endpoint has no auth dependency and no token is invalidated server-side.**

**REQ-VAULTA-012**
**Given** the application
**When** a user looks for account recovery
**Then** **there is no password reset, password change or email verification.**

### 1.3 The data-ownership rule

**REQ-VAULTA-013**
**Given** any data endpoint
**When** it resolves whose records to read
**Then** it calls `owner_id_for(user)`, which returns **the caller's own id only when their role is exactly `"Artist"`**; for **every other role** it looks up the first user with role `Artist` and returns **that user's id**.

**REQ-VAULTA-014**
**Given** a user registered with any role other than `Artist` — Student, Faculty, Manager, Accountant, Attorney, Publisher, Administrator, Employer or Institution
**When** they call any financial endpoint
**Then** **they are served the demo Artist's complete financial records**: transactions, income and expense summaries, royalties, songs, contracts, invoices, budgets, tax overview, P&L, cash flow, vault documents, grants, projects and funding applications. The in-code comment states this is intentional — *"Every non-artist demo role reads from the artist showcase dataset."*

**REQ-VAULTA-015**
**Given** a non-Artist user creates a record
**When** the write executes
**Then** it is stamped with the **Artist's** `owner_id` (the same `owner_id_for` result), so a Student or Accountant writing a transaction, invoice, contract, budget or vault document **writes it into the Artist's books**.

**REQ-VAULTA-016**
**Given** a user self-registers
**When** no role is supplied
**Then** the default is `"Artist"`, so they receive their own empty dataset. **A registrant who names any other role reads and writes the demo Artist's finances** (REQ-VAULTA-005, 014, 015).

### 1.4 Transactions, income and expenses

**REQ-VAULTA-017**
**Given** `GET /api/transactions`
**When** called with an optional `type`
**Then** transactions for the resolved owner are returned, filtered by type when supplied.

**REQ-VAULTA-018**
**Given** `POST /api/transactions`
**When** called
**Then** a transaction is created against the resolved owner with type, amount, category and date.

**REQ-VAULTA-019**
**Given** `DELETE /api/transactions/{tid}`
**When** called
**Then** the transaction is deleted scoped to the resolved owner — **which for a non-Artist caller means they can delete the Artist's transactions** (REQ-VAULTA-014).

**REQ-VAULTA-020**
**Given** `GET /api/income/summary` or `/api/expenses/summary`
**When** called
**Then** the resolved owner's transactions are aggregated by category and period into totals.

### 1.5 Royalties, publishing, contracts, invoices, budgets

**REQ-VAULTA-021**
**Given** `GET /api/royalties`
**When** called
**Then** royalty records for the resolved owner are returned. **No ingestion endpoint exists** — royalties are seeded only, and nothing consumes data from INHEIRA or ANCRMEDIA.

**REQ-VAULTA-022**
**Given** `GET /api/publishing/songs`
**When** called
**Then** song records for the resolved owner are returned from Vaulta's **own** `songs` collection.

**REQ-VAULTA-023**
**Given** `GET` and `POST /api/contracts`
**When** called
**Then** contracts are listed and created for the resolved owner. **There is no digital signature, no PDF generation and no counterparty flow** — a contract is a metadata row.

**REQ-VAULTA-024**
**Given** `GET` and `POST /api/invoices`
**When** called
**Then** invoices are listed and created for the resolved owner.

**REQ-VAULTA-025**
**Given** `PATCH /api/invoices/{iid}/status`
**When** called
**Then** the status is set from an untyped `Dict[str, str]` body. **The value is not validated against any enum**, so any string becomes an invoice status. There is no payment capture, no reminder and no ageing calculation.

**REQ-VAULTA-026**
**Given** `GET` and `POST /api/budgets`
**When** called
**Then** budgets are listed and created for the resolved owner.

### 1.6 Tax Center

**REQ-VAULTA-027**
**Given** `GET /api/taxes/overview`
**When** called
**Then** income and deductions are summed from the resolved owner's transactions, `taxable_income` is `max(0, income - deductions)`, and `estimated_tax` is **`taxable_income × 0.24`** — a single hard-coded rate with no brackets, no jurisdiction, no filing status and no self-employment component.

**REQ-VAULTA-028**
**Given** the quarterly schedule is returned
**When** it is built
**Then** four quarters each receive **exactly 25% of the estimated tax**, with **hard-coded due dates** (Apr 15, Jun 15, Sep 15, Jan 15) and **hard-coded statuses** (`Paid`, `Paid`, `Pending`, `Upcoming`) that are unrelated to any payment record.

**REQ-VAULTA-029**
**Given** the tax overview
**When** it is returned
**Then** `tax_readiness_score` is the **hard-coded integer 72** for every user, and the `forms` array is a **hard-coded list** claiming 6 × 1099-NEC "Received", 3 × 1099-MISC "Received", 1 × W-2 "Received" and 1 × K-1 "Pending" — **no form is stored, uploaded or tracked anywhere in the application**.

**REQ-VAULTA-030**
**Given** deductions by category
**When** computed
**Then** these **are** derived from real transaction data, sorted descending — the one genuinely computed element of the tax overview.

### 1.7 Business Center

**REQ-VAULTA-031**
**Given** `GET /api/business/profile`
**When** called by **any** authenticated user
**Then** it returns a **wholly hard-coded fictitious business profile** identical for every caller: three entities with EINs (`88-4127934`, `92-7418205`), three licences with expiry dates, **three bank accounts with balances** ($84,210.11, $42,800.00, $128,200.55), **two credit cards with balances and limits**, a **credit score of 792**, two insurance policies with premiums, and three compliance deadlines.

**REQ-VAULTA-032**
**Given** the business profile
**When** a user attempts to edit it
**Then** **there is no write endpoint** — the entire Business Center is a static literal in the handler.

### 1.8 Reports and Vault

**REQ-VAULTA-033**
**Given** `GET /api/reports/pnl` and `/api/reports/cashflow`
**When** called
**Then** both are computed from the resolved owner's real transaction data. **There is no export** — no PDF, no Excel, no CSV.

**REQ-VAULTA-034**
**Given** `GET` and `POST /api/vault/documents`
**When** called
**Then** vault documents are listed and created for the resolved owner. **Only metadata is stored** — there is no file upload, no object storage, no encryption at rest and no download. The specification names the module "Secure Vault™ — Encrypted storage".

### 1.9 Grants, funding and projects

**REQ-VAULTA-035**
**Given** `GET /api/funding/opportunities` and `/api/grants/opportunities`
**When** called
**Then** seeded opportunities are returned along with the resolved owner's applications; an empty opportunity collection returns empty lists rather than erroring.

**REQ-VAULTA-036**
**Given** the grants endpoints
**When** applications and summaries are read
**Then** they are scoped to the resolved owner (REQ-VAULTA-013).

**REQ-VAULTA-037**
**Given** the projects endpoints
**When** a project is listed, read or created
**Then** it is scoped to the resolved owner; an unknown project id returns a 404.

### 1.10 Ecosystem status

**REQ-VAULTA-038**
**Given** `GET /api/ecosystem/status`
**When** called
**Then** it returns **ten modules — ANCRID, INHEIRA, COHEIR, ANCRLAB, ANCRSync, ANCRA, ANCRLaunch, ANCRVIEW, ANCRWAV, Passport — every one hard-coded with `"status": "Connected"`** and a specific fabricated detail string: *"Identity verified · Passport level 3"*, *"42 registered songs · 18 with sync clearance"*, *"$28K in awarded scholarships"*, *"2 placements · $12,400 paid YTD"*, *"Views 4.2M · RPM $3.12"*, *"23 trips · $41,220 expensed"*.

**REQ-VAULTA-039**
**Given** the ecosystem status response
**When** it is compared against the codebase
**Then** **no integration exists.** The backend makes no outbound HTTP call to any module. Every "Connected" status and every figure in the detail strings is a literal in the handler.

### 1.11 AIAH financial advisor

**REQ-VAULTA-040**
**Given** the AIAH module loads
**When** `EMERGENT_LLM_KEY` is read
**Then** it uses `os.environ["EMERGENT_LLM_KEY"]` — **mandatory at import**, so the application fails to start without it.

**REQ-VAULTA-041**
**Given** `POST /api/aiah/chat`
**When** called
**Then** a financial context block is assembled from the resolved owner's live figures — role, name, net worth, cash available, monthly revenue, monthly expense, royalties pending, outstanding invoices, business health score and tax readiness — prepended to the question, and the response is streamed as SSE from `anthropic / claude-sonnet-4-5-20250929`.

**REQ-VAULTA-042**
**Given** the AIAH system prompt
**When** it is composed
**Then** it positions the model as a **Chief Financial Officer** covering cash-flow forecasting, royalty predictions across named PROs, publishing splits, tax strategy, **business formation (LLC vs S-Corp vs Nonprofit)**, debt analysis and **investment strategy** — and instructs it to "Always ground your advice in the creator's actual numbers".

**REQ-VAULTA-043**
**Given** a non-Artist user asks AIAH a question
**When** the context block is built
**Then** it is populated from the **demo Artist's** figures (REQ-VAULTA-013), so the model gives that user tax and investment guidance grounded in someone else's finances while addressing them by their own name and role.

**REQ-VAULTA-044**
**Given** the AIAH response
**When** it is returned
**Then** **there is no disclaimer** stating that the output is not professional financial, tax or legal advice, and none appears in the system prompt.

---

## 2. TEST COVERAGE

**Test assets found**
- `backend/tests/backend_test.py` — **29 test functions**.
- `test_reports/pytest/pytest_results.xml` — **29 tests, 0 failures**, 2026-07-09 02:40. A clean recorded run.
- `test_result.md` — protocol boilerplate only.
- **No frontend tests.**

| Requirement | Covered | Evidence / gap |
|---|---|---|
| REQ-VAULTA-001 | **No** | Index creation untested |
| REQ-VAULTA-002 – 004 | **Partial** | Seeded logins succeed in fixtures; the mandatory-env behaviour and seed idempotency are not asserted |
| REQ-VAULTA-005 | **No** | **Self-assignment of `Administrator` at registration is untested** — `test_register_and_logout` does not attempt a privileged role |
| REQ-VAULTA-006 | **Partial** | `test_register_and_logout` covers the happy path; the duplicate 400 and the 6-character minimum are not asserted |
| REQ-VAULTA-007 | **Yes** | `test_login_invalid_password` (401) and `test_login_valid_returns_user_and_cookie`. The absence of rate limiting is untested |
| REQ-VAULTA-008 | **No** | **That cookies are set with `secure=False` is never asserted** |
| REQ-VAULTA-009 | **Yes** | `test_protected_requires_auth` and `test_auth_me_with_cookie` |
| REQ-VAULTA-010 – 012 | **No** | Refresh sliding-window behaviour, unauthenticated logout and absent recovery are untested |
| REQ-VAULTA-013 – 016 | **No** | **The central `owner_id_for` behaviour is entirely untested.** Every test runs against a single `session` fixture; **no test logs in as two different roles and compares the data returned.** This is why the cross-role data exposure is not surfaced by a green suite |
| REQ-VAULTA-017 – 019 | **Yes** | `test_transactions_crud` covers create, list and delete |
| REQ-VAULTA-020 | **Yes** | `test_income_summary` and `test_expenses_summary` |
| REQ-VAULTA-021 | **Yes** | `test_royalties` asserts the shape — not that no ingestion path exists |
| REQ-VAULTA-022 – 024 | **Yes** | `test_songs`, `test_contracts`, `test_invoices_list_and_create` |
| REQ-VAULTA-025 | **No** | **The unvalidated invoice-status patch is untested** |
| REQ-VAULTA-026 | **Yes** | `test_budgets` |
| REQ-VAULTA-027 – 030 | **Partial** | `test_taxes` asserts the response shape; **none of the hard-coded values — the 24% rate, the 72 readiness score, the four fabricated form counts, the fixed quarterly statuses — is challenged** |
| REQ-VAULTA-031, 032 | **Partial** | `test_business_profile` asserts the payload returns; **that it is identical for every user and entirely fictitious is not** |
| REQ-VAULTA-033 | **Yes** | `test_pnl` and `test_cashflow`. Absent export is untested |
| REQ-VAULTA-034 | **Yes** | `test_vault` covers list and create — of metadata only |
| REQ-VAULTA-035 – 037 | **Yes** | `test_funding`, `test_grants_opportunities`, `test_grants_applications`, `test_grants_summary`, `test_projects_list`, `test_project_detail`, `test_project_create`, `test_project_not_found` — the grants and projects subsystem is the best-covered area |
| REQ-VAULTA-038, 039 | **Partial** | `test_ecosystem` asserts ten entries return; **it does not challenge that all ten claim "Connected" while no integration exists** |
| REQ-VAULTA-040 – 044 | **Partial** | `test_aiah_stream` asserts a stream is produced; the context assembly, the cross-role context leak (043) and the absent disclaimer are untested |

**Summary:** 44 requirements. **17 Yes**, **9 Partial**, **18 No**. The suite is green and covers CRUD across every module, which is real value. Its structural blind spot is that **every test authenticates as one role**, so the `owner_id_for` cross-role behaviour — the most consequential thing this application does — is never exercised.

---

## 3. SPEC GAP ANALYSIS

**Specs compared:** `Vaulta_Product_Specification_v1_0 (3) (1).pdf` (11 pp., canonical, "Module 7 of 10"), `VAULTA_WORKFLOW.pdf`, `memory/VUALTA_TECHNICAL_SPECIFICATION.md`, `memory/PRD.md`.

### (a) Specified but NOT implemented in code

| # | Spec source | Requirement | Code state |
|---|---|---|---|
| G1 | §10 Authentication | **"Vaulta™ uses ANCRID™ exclusively. No independent login. Permissions and identity are inherited from ANCRID™."** | A complete local identity store with bcrypt, self-service registration including self-assignable `Administrator`, and locally-minted JWTs (REQ-VAULTA-005 – 012). |
| G2 | §13 Engineering Notes | "Financial records should be **permission-aware** and securely encrypted." | Permissions are inverted: `owner_id_for` deliberately serves **one user's complete financial records to every other role** (REQ-VAULTA-013 – 016). Nothing is encrypted at rest, and cookies are not even marked `Secure` (REQ-VAULTA-008). |
| G3 | §07 **Secure Vault™** — "**Encrypted storage** for tax returns, contracts, receipts, business documents, insurance, licences, certificates, estate planning, emergency documents, IP documents, trademark and copyright records" | Metadata rows only. **No file upload, no storage, no encryption, no download** (REQ-VAULTA-034). |
| G4 | Roadmap **P0** | Secure Vault Storage · **Digital Signatures** · **PDF Generation** · **Excel Export** · Grant Database · **Royalty Engine** | Of six P0 items, only the grant database exists. There is no signature, no PDF, no export and **no royalty engine** — royalties are seeded rows with no calculation (REQ-VAULTA-021). |
| G5 | Roadmap **P1** | Stripe Connect · **Plaid Integration** · Banking APIs · **Live Financial Synchronization** · **Tax Automation** · Funding Intelligence | None implemented. Bank balances and credit-card figures are literals (REQ-VAULTA-031). |
| G6 | §09 Module Integrations (9 modules) | Consume scholarships from ANCRA, project budgets from ANCRLAB, shared expenses from ANCRSync, grant recommendations from COHEIR, **royalties from INHEIRA**, **streaming revenue from ANCRMEDIA**, milestones from ANCRD, career data from ANCRLaunch | **No outbound call exists.** `/api/ecosystem/status` nonetheless reports all ten as "Connected" with fabricated figures (REQ-VAULTA-038, 039). |
| G7 | §13 | "**Publishing ownership remains within INHEIRA™.**" | Vaulta holds its own `songs` collection and a Publishing Finance surface (REQ-VAULTA-022). Note the mirror-image conflict: INHEIRA holds its own `royalties` collection, which §13 assigns to Vaulta. **Both modules duplicate what the other is supposed to own.** |
| G8 | §07 Tax Center | Quarterly estimates, deductions, **1099 tracking**, home-office, mileage | Only category deductions are real (REQ-VAULTA-030). The rate is a flat 24%, the readiness score is the literal 72, the quarterly statuses are fixed, and the 1099/W-2/K-1 counts are fabricated (REQ-VAULTA-027 – 029). |
| G9 | §07 Business Center | Entities, licences, banking, credit, insurance, compliance | Entirely hard-coded and read-only, identical for every user (REQ-VAULTA-031, 032). |
| G10 | §07 Contract Center | Contract lifecycle | Metadata rows with no signature, counterparty or document (REQ-VAULTA-023). |
| G11 | §07 Invoice Center | Invoice lifecycle | No payment capture, no reminders, no ageing; status is an unvalidated free string (REQ-VAULTA-025). |
| G12 | §07 Financial Analytics™ | Cash Flow · Revenue Growth · Business Health · Grant Success · Tax Readiness · Expense Trends · Project Profitability · **Financial Forecasting** | P&L and cash flow are real; **forecasting does not exist**, and business health and tax readiness are constants. |
| G13 | §12 Future Roadmap | Creator Credit Score™, AI Tax Filing Assistant, banking integrations, investment portfolio, retirement and estate planning, multi-currency | None implemented — correctly scoped as future. Note the hard-coded **credit score of 792** in the Business Center pre-empts "Creator Credit Score™" with a fabricated value. |

### (b) Implemented but NOT mentioned in the spec

| # | Code feature | Spec status |
|---|---|---|
| E1 | **`owner_id_for` — every non-Artist role reads and writes the demo Artist's financial records** (REQ-VAULTA-013 – 016). | Unspecified. §05 lists thirteen distinct user types and §13 requires permission-aware records; this function does the opposite of both. It is the single most consequential undocumented behaviour in the workspace, because the data it exposes is financial. |
| E2 | **Ten hard-coded "Connected" integration statuses with fabricated figures** (REQ-VAULTA-038). | Unspecified. Presenting integration status as live, with specific dollar amounts, when nothing is connected is a materially misleading surface in a financial product. |
| E3 | **A complete fictitious business profile** including EINs, bank balances, credit-card balances and a credit score, served identically to every user (REQ-VAULTA-031). | Unspecified. Bank and credit data are Roadmap P1 items; here they appear as apparently-real figures. |
| E4 | **Hard-coded tax constants** — 24% rate, readiness 72, fixed quarterly statuses, fabricated 1099/W-2/K-1 counts (REQ-VAULTA-027 – 029). | Unspecified. Tax automation is a P1 item; these values render as computed output. |
| E5 | **AIAH positioned as a CFO** giving tax strategy, business-formation and investment guidance **with no disclaimer** (REQ-VAULTA-042, 044). | §08 lists AIAH capabilities including "Investment Guidance" and "Tax Planning" but specifies no disclaimer, no scope limit and no human-review requirement. |
| E6 | **Cookies without the `Secure` flag** (REQ-VAULTA-008). | Unspecified, and inconsistent with every other app in the workspace. |
| E7 | **Self-assignable `Administrator` role at public registration** (REQ-VAULTA-005). | Unspecified. |
| E8 | **Refresh reissues the refresh cookie**, producing an indefinitely sliding session (REQ-VAULTA-010). | Unspecified. |

---

## 4. UNCLEAR / NEEDS INPUT

**Q1 — Every non-Artist role reads and writes the demo Artist's finances.**
`owner_id_for` returns the Artist's `owner_id` for all nine other roles (REQ-VAULTA-013 – 016). A user registering as Accountant, Attorney, Employer or Institution sees the Artist's transactions, royalties, contracts, invoices, tax position and vault, **and any record they create is written into the Artist's books** — including a `DELETE` on the Artist's transactions. The in-code comment frames this as a showcase device. I have not changed it. What is the intended model — genuine per-user data, an explicit read-only advisor role with consent, or a demo-only switch gated on an environment flag?

**Q2 — `Administrator` is self-assignable at registration.**
`VAULTA_ROLES` includes it and nothing excludes privileged roles from the public register path (REQ-VAULTA-005). Which roles may be self-selected, and which require provisioning? Note that role currently gates nothing except `owner_id_for`, so the immediate impact is data scope rather than privilege.

**Q3 — Cookies are set with `secure=False`.**
(REQ-VAULTA-008.) Every other app in the workspace sets `Secure`. Was this to support local HTTP development, and should it be environment-conditional?

**Q4 — Ten integrations report "Connected" with fabricated figures.**
`/api/ecosystem/status` claims 42 registered songs, $28K in scholarships, 4.2M views and $41,220 in travel expenses, all literals, while no integration exists (REQ-VAULTA-038, 039, E2). Should this endpoint report genuine status (`not_connected`), or carry an explicit demo badge? As written it tells a creator their financial data is synchronised with nine other systems when it is not.

**Q5 — The Business Center is entirely fictitious and read-only.**
EINs, three bank balances, two credit-card balances and a 792 credit score are hard-coded and identical for every user (REQ-VAULTA-031, E3). Is this a placeholder pending Plaid (Roadmap P1), and should it be visibly labelled as sample data until then?

**Q6 — Tax figures are largely constants.**
A flat 24% with no brackets or jurisdiction, a fixed readiness score of 72, fixed quarterly payment statuses, and fabricated 1099/W-2/K-1 counts (REQ-VAULTA-027 – 029, E4). Which of these should be computed, which removed, and should the Tax Center carry a "not tax advice" notice?

**Q7 — AIAH gives financial advice with no disclaimer.**
The system prompt casts it as a CFO covering tax strategy, entity selection and investment guidance, instructed to ground advice in the user's actual numbers (REQ-VAULTA-042, 044). For a non-Artist role those "actual numbers" belong to someone else (REQ-VAULTA-043). Should a disclaimer be added, should scope be narrowed, and should the context block be suppressed when it is not the caller's own data?

**Q8 — Secure Vault stores no files.**
The specification names it "Encrypted storage" for tax returns, contracts and IP documents; the code stores metadata only (REQ-VAULTA-034, G3). Where should documents live, and what encryption is required before real tax returns are accepted?

**Q9 — Who owns royalties, Vaulta or INHEIRA?**
§13 here assigns publishing ownership to INHEIRA and royalties to Vaulta; INHEIRA's §13 assigns financial records to Vaulta while its code writes a `royalties` collection. **Both applications currently hold both** (G7). Which is authoritative, and should the other consume a projection?

**Q10 — Invoice status is unvalidated.**
`PATCH /api/invoices/{id}/status` accepts any string from an untyped dict (REQ-VAULTA-025). What is the state machine, and should transitions be constrained?

**Q11 — No rate limiting on login.**
This is the financial application and it has none, while ANCRSHOP and CYNAIAH both do (REQ-VAULTA-007). Should the CYNAIAH pattern — 8 attempts per IP+email per 5 minutes, persisted, cleared on success — be adopted here?

**Q12 — Refresh has no absolute lifetime.**
Each refresh reissues the refresh cookie, so a session can be extended indefinitely (REQ-VAULTA-010, E8). Should there be a hard cap, and should logout revoke server-side?

**Q13 — Shared demo password.**
All nine demo role accounts share `"Vaulta2026!"` hard-coded in source (REQ-VAULTA-003). Should these be environment-driven like the admin credentials, which are correctly mandatory?

**Q14 — No export anywhere.**
Reports, invoices and contracts have no PDF, Excel or CSV output, all Roadmap P0 items (REQ-VAULTA-033, G4). Which is needed first for the demo — a P&L PDF or an invoice PDF?

**Q15 — Test fixtures use a single role.**
Every test authenticates as one session, which is why the `owner_id_for` behaviour is invisible to a green suite (§2). Should a cross-role isolation test be added — log in as two roles, assert their datasets differ — as the standing regression guard for Q1?
