# ANCR Ecosystem Architecture Specification v1.0

**Purpose:** Master architectural reference for how every ANCR module communicates, shares identity, exchanges data, and fits into the platform. Companion to the individual module specs (`ANCRMEDIA_Technical_Specification_v1.0.md`, etc.).
**Owner:** CTO
**Status:** Living document — updated as new modules ship.

---

## 1. Ecosystem Overview

The ANCR Ecosystem is a network of purpose-built applications that share **one identity, one design language, and one data spine**. Each module has a distinct product identity while inheriting ANCR ecosystem primitives.

| Module | Domain | Status |
|---|---|---|
| **ANCRID™** | Verified identity, permissions, creative passport | Spec pending — MUST ship before others reach production |
| **ANCRA™** | The Academy (courses, cohorts) | Not started |
| **ANCRLAB™** | Creation tools (DAW/NLE surfaces) | Not started |
| **ANCRSync™** | Collaboration rooms (writing camps, sessions) | Not started |
| **COHEIR™** | Professional network / faculty & mentorship | Spec next |
| **INHEIRA™** | Publishing (rights, splits, ISRC issuance) | Not started |
| **Vaulta™** | Finance, royalties, revenue | Not started |
| **ANCRMEDIA™** | Global media network (audio + video) | **V1 shipped** |
| **ANCRLaunch™** | Careers, launches, industry pipeline | Not started |

### 1.1 Branding Hierarchy
- **ANCR** is the ecosystem (parent brand). Appears only as endorsement (`Powered by the ANCR Ecosystem` / `Part of the ANCR Ecosystem`).
- **Module logos** (ANCRMEDIA, COHEIR, ANCRLAB, …) are the product identity users interact with.
- The ecosystem supports the module; it never visually competes with it.

---

## 2. Shared Design Language

Enforced across every module.

- **Palette:** Obsidian black `#0B0B0D` base; ecosystem accent gradient `#0052FF → #7000FF → #FF6B00`; per-module micro-accents (ANCRWAV cools blue/violet, ANCRVIEW warms amber/magenta, etc.).
- **Typography:** Cabinet Grotesk (display) + Satoshi (body).
- **Surface:** Glassmorphism (`backdrop-blur 24px`), 1px rgba white borders, premium shadows.
- **Motion:** Framer Motion for React; CSS animations for ambient gradient washes.
- **Icons:** Lucide React. No emoji for UI icons.
- **Layout:** Cinematic hero → editorial imagery → 11+ content shelves.
- **Ecosystem Sidebar:** Identical 10-module rail on every module (68px width, tooltips, active marker, module short mark).
- **Footer:** `Part of the ANCR Ecosystem` on every authenticated screen.

---

## 3. Identity Architecture — ANCRID

ANCRID is the **sole identity provider** for the entire ecosystem. No module may mint its own users in production.

### 3.1 Ownership
| Concept | Owner |
|---|---|
| User account | ANCRID |
| Email, password, MFA | ANCRID |
| Role (student / faculty / administrator / artist_in_residence / industry_partner) | ANCRID |
| Institution affiliation | ANCRID |
| Verification status | ANCRID |
| Creative Passport (bio, discipline, cohort, portfolio index) | ANCRID |
| Handle | ANCRID (`creator_id`) |
| Module-specific state (library, watch position, upload metadata) | Consuming module |

### 3.2 Auth Flow (Production)
```
Browser → ancrid.ancr.com/login
  → ANCRID mints session cookie on .ancr.com (root domain)
  → Browser follows redirect to intended module (e.g. ancrmedia.ancr.com)
  → Module's middleware verifies ANCRID JWT via ANCRID's public key
  → Module hydrates local session state (never storing password_hash)
```

All modules share the `.ancr.com` cookie domain. Session revocation at ANCRID cascades to every module.

### 3.3 Interim (V1) Auth
Until ANCRID ships, each module runs a local `users` collection with the same schema (see ANCRMEDIA spec §4.1). Migration path is one-way and non-breaking: swap the `get_current_user` dependency to an ANCRID verifier; leave every downstream consumer untouched. `users.creator_id` is the stable bridge field.

---

## 4. Shared Data Model

Cross-module entities and their canonical owners.

| Entity | Owner | Consumers | Sync |
|---|---|---|---|
| `users` | ANCRID | All | Push on create/update via `identity.updated` event |
| `institutions` | ANCRID | All | Push on create/update via `institution.updated` event |
| `creators` | ANCRID | All | Derived from `users` where `role` in `student\|faculty\|artist_in_residence` |
| `releases` | INHEIRA | ANCRMEDIA, Vaulta, COHEIR | Push on publish via `release.published` |
| `livestreams` | ANCRMEDIA | ANCRSync, COHEIR | Push on start/end |
| `stream_events` | ANCRMEDIA | Vaulta, ANCRA | Push per play |
| `royalty_accruals` | Vaulta | ANCRMEDIA (analytics) | Pull via `GET /analytics/me` |
| `courses` | ANCRA | ANCRMEDIA, COHEIR | Push on enrollment |
| `writing_rooms` | ANCRSync | ANCRMEDIA (release attribution), INHEIRA (split entry) | Push on close |
| `assets` (audio, video, mixes, masters) | ANCRLAB | ANCRMEDIA, INHEIRA | Push on export |

Modules denormalize the fields they need for read speed (e.g. `albums.institution_name`) and refresh on relevant events.

---

## 5. Event Bus

All cross-module communication is event-driven. No synchronous cross-module HTTP calls in production.

### 5.1 Transport
- Recommendation: **NATS JetStream** (lightweight, at-least-once, subject-based). Kafka is acceptable if ops already runs it.
- Every event is JSON, versioned via a `schema_version` field.
- Every event carries an `ancrid_actor_id`, a `timestamp` (RFC 3339 UTC), and an `idempotency_key`.

### 5.2 Canonical Event Catalog
| Event | Publisher | Subscribers |
|---|---|---|
| `identity.created` | ANCRID | All modules |
| `identity.updated` | ANCRID | All |
| `identity.verified` | ANCRID | ANCRMEDIA (flip `verified: true`), COHEIR |
| `institution.updated` | ANCRID | All |
| `enrollment.updated` | ANCRA | ANCRMEDIA, COHEIR |
| `writing_room.closed` | ANCRSync | ANCRMEDIA (create release page), INHEIRA (open split sheet) |
| `asset.exported` | ANCRLAB | ANCRMEDIA (draft release), INHEIRA (rights intake) |
| `release.published` | INHEIRA | ANCRMEDIA (Home Featured), Vaulta (revenue tracking) |
| `stream.played` | ANCRMEDIA | Vaulta (royalty accrual), ANCRA (personalization) |
| `livestream.started` | ANCRMEDIA | ANCRSync (co-watch), COHEIR (faculty pin) |
| `royalty.accrued` | Vaulta | ANCRMEDIA (analytics dashboard) |
| `career.opportunity.matched` | ANCRLaunch | ANCRMEDIA (creator inbox), COHEIR |

### 5.3 Delivery Guarantees
- At-least-once per subject.
- Consumers MUST be idempotent (deduplicate by `idempotency_key`).
- Dead-letter queue per module for events that fail 5 consecutive retries.

---

## 6. API Contract Between Modules

Cross-module reads (when required synchronously) go through documented HTTP contracts, always authenticated with a service-to-service JWT signed by ANCRID.

| Consumer → Producer | Endpoint | Purpose |
|---|---|---|
| ANCRMEDIA → ANCRID | `GET /identity/{ancrid_id}` | Fetch verified identity + role + institution |
| ANCRMEDIA → INHEIRA | `POST /releases` | Draft-to-publish handoff |
| Vaulta → ANCRMEDIA | `GET /analytics/creator/{id}` (Phase 2) | Consolidated stream telemetry |
| COHEIR → ANCRMEDIA | `POST /editorial/feature` | Faculty features a release/video |
| ANCRLaunch → ANCRMEDIA | `GET /creators/{id}` | Public creator card for scout view |

All service-to-service JWTs:
- Issued by ANCRID.
- Signed with ANCR's ecosystem private key.
- `aud` field names the target module (e.g. `ancrmedia`).
- Short TTL (≤ 5 minutes).

---

## 7. Deployment Topology

Recommended production shape:

```
                       ┌──────────────────────┐
                       │  Cloudflare CDN      │
                       └──────────┬───────────┘
                                  │
                       ┌──────────▼───────────┐
                       │  Kubernetes ingress  │
                       │   .ancr.com root     │
                       └──────────┬───────────┘
                                  │
     ┌────────────┬───────────────┼─────────────┬────────────┐
     ▼            ▼               ▼             ▼            ▼
 ancrid       ancrmedia        coheir       inheira      vaulta
 (auth SoT)   (media)          (network)    (publishing) (finance)
     │            │               │             │            │
     └────────────┴─────► NATS JetStream ◄──────┴────────────┘
                                  │
                       ┌──────────▼───────────┐
                       │  MongoDB / Postgres  │
                       │  (per-module DBs)    │
                       └──────────────────────┘
                                  │
                       ┌──────────▼───────────┐
                       │  Object storage      │
                       │  (S3-compatible)     │
                       └──────────────────────┘
```

Each module owns its own database. Cross-module data flows only via events and documented HTTP contracts. No shared schemas.

---

## 8. Security & Compliance

- **Session cookies**: `httpOnly + secure + samesite=none`, cookie domain `.ancr.com`.
- **Rotation**: access JWT 6h, refresh JWT 30d, ANCRID rotation key monthly.
- **CORS**: whitelist ANCR-owned origins only (never `*` in production).
- **Rate limiting**: enforce at ingress (per-IP) + at ANCRID (per-user) on every write.
- **Audit log**: every write across every module is signed and appended to an ANCRID-controlled log.
- **PII**: only ANCRID stores raw email + password_hash. Every other module stores only `ancrid_id` + denormalized public fields.
- **Right to delete**: initiated at ANCRID; cascades to modules via `identity.deleted` event. Modules must anonymize or purge referenced records within 30 days.

---

## 9. Design System Sharing

- A single shared design library (`@ancr/ui`) is planned. Until then, primitives are duplicated per module — kept in sync via style-token JSON exported from ANCRID.
- Style tokens: color, font, spacing, radii, shadow, motion timing.
- Module-specific themes (e.g. ANCRWAV cool wash) override tokens with per-experience CSS variables.

---

## 10. Module Boundaries & Responsibilities

| Concern | Module |
|---|---|
| Who is this person? | ANCRID |
| What courses are they taking? | ANCRA |
| Where do they create? | ANCRLAB |
| Who are they creating with? | ANCRSync |
| Who mentors them? | COHEIR |
| Who owns what they made? | INHEIRA |
| Who paid them for it? | Vaulta |
| Where does the world see it? | ANCRMEDIA |
| Where does their career go next? | ANCRLaunch |

If a feature would blur two of these responsibilities, the correct answer is to add an event or an API contract — never to duplicate logic across modules.

---

## 11. Roadmap Alignment

| Milestone | Requires |
|---|---|
| **ANCRID V1** | Blocks production for every module. |
| **ANCRMEDIA V2** | ANCRID SSO, object storage + transcoding, HLS/WebRTC. |
| **COHEIR V1** | ANCRID V1, ANCRMEDIA V1 (already shipped). |
| **INHEIRA V1** | ANCRID V1, ANCRLAB V1. |
| **Vaulta V1** | INHEIRA V1, ANCRMEDIA stream events. |
| **Full ecosystem beta** | All of the above + event bus in production. |

---

## 12. Governance

- Every module MUST publish a module-specific technical specification (see `ANCRMEDIA_Technical_Specification_v1.0.md`).
- Every architectural change that crosses two modules requires a shared ADR added to this document.
- Every event catalog change is versioned and PR-reviewed by the CTO.
- Every module owns its own migrations, tests, and release cadence.

---

*End of ANCR Ecosystem Architecture Specification v1.0.*
