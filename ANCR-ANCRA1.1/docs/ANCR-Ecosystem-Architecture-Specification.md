# ANCR Ecosystem Architecture Specification

**Document:** `ANCR-ECO-ARCH-1.0`
**Owner:** CTO
**Status:** v1.0 · Design-complete · Engineering in progress
**Last updated:** Feb 2026

---

## 1. Executive Overview

### 1.1 Purpose
The ANCR ecosystem is a family of ten interoperable products serving the Contemporary Creative Development Program (CCDP) and the creator economy. This document defines the **shared architecture**, **authentication model**, **cross-module contracts**, and **integration events** that let every module operate as one platform.

### 1.2 Business objective
Establish a single "creative operating system" that carries a creator's identity, work, splits, mentorship, finances, and career readiness across every stage of their journey — from student to working professional.

### 1.3 Ecosystem modules (10)
| Slug | Name | Role | Status |
|------|------|------|--------|
| `ancra` | ANCRA™ | Learning Experience Platform (LMS) | v1.0 spec complete |
| `ancrlab` | ANCRLAB™ | Creative studio · rooms · DAW | v1.0 spec complete |
| `ancrsync` | ANCRSync™ | Collaboration · writing rooms | v1.0 spec complete |
| `coheir` | COHEIR™ | Mentorship · industry professionals | v1.0 spec complete |
| `inheira` | INHEIRA™ | Songs · splits · publishing | v1.0 spec complete |
| `ancrid` | ANCRID™ | Creator identity · Passport™ | v1.0 spec complete |
| `vaulta` | Vaulta™ | Royalties · finance | Coming soon (spec only) |
| `ancrlaunch` | ANCRLaunch™ | Career · placement | Coming soon (spec only) |
| `ancrview` | ANCRVIEW™ | Video · masterclasses | Coming soon (spec only) |
| `ancrwav` | ANCRWAV™ | Releases · streaming | Coming soon (spec only) |

### 1.4 Success criteria
- A student can move seamlessly from one module to another via new-tab launches while feeling "still inside ANCR."
- Every module reads the same identity from ANCRID™.
- Every module writes back to ANCRID™ Portfolio Score, Skills, and Booking Packet™.
- One command palette searches the entire ecosystem.
- One AIAH intelligence layer reasons across every module.

---

## 2. Product Requirements (Ecosystem-wide)

### 2.1 Functional requirements
- **Single sign-on** — one login (via ANCRID™) unlocks every module.
- **Shared identity** — every module reads/writes to a canonical `Creator` record.
- **Event bus** — modules publish domain events (e.g., `song.mastered`) and subscribe to others (e.g., `song.mastered` triggers `inheira.split_prompt`).
- **Cross-module launcher** — a persistent "ANCR Ecosystem" launcher on every module homepage.
- **Universal command palette** — Cmd/Ctrl+K searches every module's index.
- **AIAH intelligence layer** — a shared LLM service (Claude Sonnet 4.5 via Emergent Universal Key) with context from all modules.

### 2.2 User personas
- **Student** — moves through learning + creative + collaborative + identity modules.
- **Faculty / Artist in Residence / Executive in Residence / Adjunct** — operates COHEIR, ANCRA Faculty view, reviews INHEIRA credits.
- **Industry Professional** — restricted COHEIR access, ANCRVIEW live sessions.
- **Administrator** — cohort management, permissions, cross-module audit.

### 2.3 Roles & permission matrix (summary)
| Role | ANCRA | ANCRLAB | ANCRSync | COHEIR | INHEIRA | ANCRID | Vaulta | Launch | View | Wav |
|------|-------|---------|----------|--------|---------|--------|--------|--------|------|-----|
| Student | R/W | R/W | R/W | R (mentor-only) | R/W (own) | R/W (own) | R (own) | R (own) | R | R/W (own) |
| Faculty | R/W | R (student's) | R (student's) | R/W | R (student's) | R | R (student's) | R (student's) | R/W | R |
| Industry Pro | R | – | – | R/W (own sessions) | R (introduced) | R (booking packet) | – | R (student's) | R/W | R |
| Admin | R/W | R/W | R/W | R/W | R/W | R/W | R/W | R/W | R/W | R/W |

---

## 3. Technical Architecture (ecosystem)

### 3.1 High-level topology
```
                     ┌───────────────────────────────────┐
                     │        ANCRID™ Identity           │
                     │   (single source of truth for     │
                     │  Creator, Skills, Score, Roles)   │
                     └───────────────┬───────────────────┘
                                     │  JWT · OIDC
        ┌──────────┬──────────┬──────┴──────┬──────────┬──────────┐
        │          │          │             │          │          │
    ┌───▼──┐  ┌────▼───┐  ┌───▼────┐   ┌────▼────┐ ┌──▼─────┐ ┌──▼─────┐
    │ANCRA │  │ANCRLAB │  │ANCRSync│   │  COHEIR │ │INHEIRA │ │Vaulta  │
    └──┬───┘  └────┬───┘  └───┬────┘   └────┬────┘ └────┬───┘ └───┬────┘
       │           │          │             │           │         │
       └───────────┴──────────┴──────┬──────┴───────────┴─────────┘
                                     │
                          ┌──────────▼──────────┐
                          │  ANCR Event Bus     │  (NATS / Kafka)
                          │  song.mastered      │
                          │  review.signed      │
                          │  royalty.received   │
                          │  passport.updated   │
                          └──────────┬──────────┘
                                     │
                          ┌──────────▼──────────┐
                          │  AIAH Intelligence  │  (Claude Sonnet 4.5)
                          │  reads all events   │
                          └─────────────────────┘
```

### 3.2 Frontend architecture
- **Framework:** React 18 · CRACO · Tailwind · Shadcn UI.
- **Routing:** React Router v6 with per-module top-level route (`/module/{name}`).
- **Shell:** `ModuleShell` — a standardized chrome (left nav + top bar + footer) reused by every module for visual continuity.
- **Design language:** `/frontend/src/index.css` — Playfair Display + JetBrains Mono + Instrument Sans; dark cinematic palette with per-module accent colors.
- **State:** SWR for server cache; module-local React state; no Redux (kept simple for MVP).

### 3.3 Backend architecture
- **Language/runtime:** Python 3.11 · FastAPI · Uvicorn.
- **Database:** MongoDB (Motor async driver). One database per environment; per-module collection namespace (`ancra.*`, `ancrid.*`, `inheira.*`).
- **Auth:** ANCRID service issues JWT (RS256). All other services verify via ANCRID public key.
- **AIAH LLM:** Emergent Universal Key → `anthropic/claude-sonnet-4-5-20250929`.
- **Event bus:** NATS JetStream (target). Currently prototype: direct MongoDB writes.
- **API contract:** All routes prefixed `/api/`. OpenAPI schema per module.

### 3.4 Cross-module data flow (example: song publishing)
```
1. Student masters song in ANCRLAB™
   → POST /api/ancrlab/projects/{id}/master
   → emits song.mastered

2. INHEIRA™ subscribes to song.mastered
   → creates draft SplitAgreement
   → prompts co-writers via ANCRSync

3. Co-writers confirm splits in ANCRSync™
   → INHEIRA emits split.verified
   → issues Copyright Certificate

4. Vaulta™ subscribes to split.verified
   → activates royalty channel

5. ANCRWAV™ receives release payload
   → distributes to DSPs

6. ANCRID™ subscribes to passport.updated
   → recomputes Portfolio Score
   → refreshes Booking Packet™

7. ANCRA™ subscribes to passport.updated
   → surfaces new achievement + updates 30 Song Progress™
```

### 3.5 Authentication flow
1. User authenticates against **ANCRID™** (OIDC).
2. ANCRID issues an **access JWT** (15m) and a **refresh token** (7d, HttpOnly cookie).
3. Access JWT payload: `sub`, `role[]`, `cohort`, `mobility[]`, `ancrid_score`, `iat`, `exp`.
4. Every other module verifies the JWT against ANCRID's public JWKS endpoint.
5. Role checks are enforced at each module's API gateway.

### 3.6 Error handling & logging
- Consistent error envelope: `{ code, message, module, correlation_id, hint }`.
- Correlation ID propagated via `x-ancr-corr` header for cross-module tracing.
- Logs shipped to a central logging cluster (target: OpenSearch); JSON structured.
- Sentry for frontend exceptions per module.

---

## 4. Ecosystem-wide Data Contracts

### 4.1 Canonical Creator (owned by ANCRID)
```
Creator {
  id: string (uuid, ancrid)
  handle: string (unique)
  display_name: string
  avatar_url: string
  cohort_id: string?
  concentrations: string[]
  portfolio_score: number
  graduation_readiness: number
  skills_verified: string[]
  mobility: string[]   // ["US","EU","UK"]
  roles: string[]      // ["student", "faculty", "adjunct"]
  booking_packet_version: string
  created_at, updated_at
}
```

### 4.2 Canonical Song (owned by INHEIRA)
```
Song {
  id, ancrid_owner, title, status, splits[{ ancrid, pct }],
  inheira_registered: bool, copyright_certificate_id: string?,
  linked_projects: string[] // ANCRLAB project ids
}
```

### 4.3 Event schema (envelope)
```
{
  "event": "song.mastered",
  "occurred_at": "2026-02-11T10:22:31Z",
  "actor_ancrid": "stu_maya_ellis",
  "correlation_id": "corr_...",
  "payload": { ... }
}
```

### 4.4 Event catalog (v1)
| Event | Emitter | Consumers |
|-------|---------|-----------|
| `session.completed` | ANCRA | ANCRID (skill+score) |
| `assignment.submitted` | ANCRA | COHEIR, ANCRID |
| `song.mastered` | ANCRLAB | INHEIRA, ANCRA (30 Song™) |
| `split.verified` | INHEIRA | Vaulta, ANCRID |
| `royalty.received` | ANCRWAV | Vaulta |
| `review.signed` | COHEIR | ANCRID, ANCRA |
| `booking_packet.sent` | ANCRID | ANCRLaunch |
| `passport.updated` | ANCRID | All modules |

---

## 5. Ecosystem Security Model
- **Root of trust:** ANCRID public key (`/well-known/jwks.json`).
- **Zero-trust between modules** — every service verifies JWT; no shared secrets.
- **Data ownership** — a creator's data belongs to their `ancrid`; other modules hold a foreign key only.
- **Right to be forgotten** — an ANCRID delete cascades soft-tombstones through the event bus.
- **Audit log** — every cross-module read/write emits an `access.audit` event stored 12 months.

---

## 6. Testing (ecosystem-level)
- **Contract tests** per module (Pact / schema check against event catalog).
- **Cross-module integration tests** in a shared staging env (`songwriting → mastering → publishing → royalty` happy path).
- **Load target:** 5k concurrent students, 500 concurrent DAW sessions.

---

## 7. Deployment (ecosystem)
- **Environments:** `local` · `staging.ancr.dev` · `ancr.io` (prod).
- **Deploy unit:** each module ships as an independent container (Docker), exposed behind a K8s Ingress.
- **Rollout:** blue/green per module. Event bus is the coupling point — schema must be backward compatible.
- **Secrets:** Vault (HashiCorp) or AWS Secrets Manager. Never in `.env` in production.

---

## 8. Roadmap
| Phase | Modules live | Auth | Persistence |
|-------|--------------|------|-------------|
| **v1.0** (now) | ANCRA end-to-end demo; 5 module prototypes; 4 previews | seeded single-persona | MongoDB seed only |
| **v1.5** | ANCRID SSO live; ANCRA + ANCRID production | JWT + refresh | full persistence |
| **v2.0** | ANCRLAB · ANCRSync · INHEIRA · COHEIR production | full RBAC | event bus live |
| **v2.5** | Vaulta + ANCRWAV | payments · royalty flow | double-entry ledger |
| **v3.0** | ANCRLaunch + ANCRVIEW | enterprise features | full data warehouse |

---

## 9. ADR — Ecosystem-level decisions
| # | Decision | Reason |
|---|----------|--------|
| E-1 | ANCRID is source of truth for identity | one place to change identity; other modules hold FK only |
| E-2 | Every module is an independent service | independent release cadence; blast-radius control |
| E-3 | Event bus (async) for cross-module state | avoids tight coupling; reprocessable |
| E-4 | New-tab launches between modules (v1) | preserves session state; investors see distinct products |
| E-5 | Single-tenant Mongo per environment for v1; multi-tenant later | fast to ship; multi-tenant added when needed |
| E-6 | AIAH is a shared service, not per-module | one context graph across the ecosystem |
| E-7 | Playfair Display + JetBrains Mono + Instrument Sans | distinctive editorial + technical hybrid; not AI-slop Inter |

---

## 10. Handoff notes for the CTO
- The Emergent build is a **product specification prototype** — end-to-end functional in appearance, mocked where noted, ready to be re-implemented by engineering.
- **Integration debt sequence for v1.5:** stand up ANCRID service first → migrate ANCRA to use ANCRID SSO → then per-module.
- **Do not** carry over the current MongoDB seed logic — build proper migrations from day one.
- **Event bus** is the highest-risk item to under-engineer; invest early.
- The single biggest cross-module contract to lock down first: `Creator.portfolio_score` computation. Every module reads and no one currently owns it besides ANCRID.
