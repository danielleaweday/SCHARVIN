# ANCR Ecosystem — Architecture Specification v1.0

**Document owner:** Platform Engineering
**Audience:** CTO, platform architects, module engineering leads, security review, external auditors
**Status:** Canonical · establishes system-of-record ownership across every ANCR module
**Created:** 2026-02-07
**Companion documents:**
- `INHEIRA_Technical_Specification_v1.0.md`
- `INHEIRA_Creative_Evidence_Intelligence_Spec_v1.0.md`
- `ANCR_Creative_Provenance_Platform_Spec_v1.0.md`
- `ANCR_Creator_DNA_Platform_Spec_v1.0.md`
- `INHEIRA_Creative_Interpretation_Framework_Spec_v1.0.md`
- *(future)* `ANCRID_Technical_Specification_v1.0.md`, `ANCRSYNC_Technical_Specification_v1.0.md`, `COHEIR_Technical_Specification_v1.0.md`, `Vaulta_Technical_Specification_v1.0.md`, `ANCRLAB_Technical_Specification_v1.0.md`, `ANCRMEDIA_Technical_Specification_v1.0.md`, `ANCRLaunch_Technical_Specification_v1.0.md`, `ANCRA_Technical_Specification_v1.0.md`

---

## 1. Executive Overview

### 1.1 Purpose
The ANCR ecosystem is a **federation of purpose-specific modules** that share identity, creative evidence, and rights data through a well-defined set of contracts. Every module is a **canonical system of record** for a bounded slice of the platform. Cross-module data flows by **reference**, not by copy.

This document establishes:
- Which module owns which canonical data.
- The reference model that lets other modules use that data without duplicating it.
- The federated identity model (ANCRID) that unifies authentication.
- The async event bus (ANCRA) that carries state changes across modules.
- The path of Creative Evidence™ as it moves from studio → catalog → royalty → estate.

### 1.2 Ecosystem principles

1. **One system of record per canonical entity.** No entity is authoritatively stored in more than one module.
2. **Cross-module references use canonical IDs.** Every ID crosses module boundaries unchanged.
3. **Creative artifacts are never duplicated.** Downstream modules reference the INHEIRA-owned artifact by URI + hash; they do not copy the bytes.
4. **Identity is federated through ANCRID.** A creator is one human, one `ancr_id`, across every module.
5. **State changes are broadcast, not polled.** Modules react to ANCRA events; they never scrape another module's database.
6. **Legal firewall is honored everywhere.** *Documented Creative Contribution* (CEI) is distinct from *Agreed Legal Ownership*. Only *Agreed Legal Ownership* drives royalty distribution or estate planning.
7. **Every module is independently deployable.** Coupled contracts, not coupled deployments.
8. **PII stays with the module that natively needs it.** Sensitive fields (SSN, tax ID, heir information) are stored only in the single module authorized to process them.

### 1.3 Ecosystem block diagram
```
                          ┌──────────────────────────────────┐
                          │            ANCRID                │
                          │  federated identity + SSO        │
                          │  canonical: users, ancr_id       │
                          └───────────────┬──────────────────┘
                                          │  JWT / OIDC
    ┌─────────────────┬───────────────────┼───────────────────┬─────────────────┐
    ▼                 ▼                   ▼                   ▼                 ▼
┌──────────┐   ┌────────────┐   ┌───────────────┐   ┌────────────────┐   ┌────────────┐
│  ANCRLAB │──▶│  INHEIRA   │──▶│   ANCRSYNC    │──▶│    Vaulta      │──▶│  COHEIR    │
│ physical │   │ creative   │   │ sync catalog  │   │ royalty rail   │   │ estate +   │
│ studios  │   │ record     │   │ + placement   │   │ + payouts      │   │ heirs      │
│          │   │ (sessions, │   │               │   │                │   │            │
│          │   │  CEI, RP,  │   │               │   │                │   │            │
│          │   │  Song ID)  │   │               │   │                │   │            │
└──────────┘   └────┬───────┘   └───────────────┘   └────────────────┘   └────────────┘
                    │  events + Creative Evidence™ refs
                    ▼
              ┌────────────┐         ┌──────────────┐         ┌──────────────┐
              │  ANCRMEDIA │         │  ANCRLaunch  │         │    CCDP      │
              │ editorial  │         │ marketing +  │         │ university   │
              │ + creator  │         │ launch camps │         │ + capstone   │
              │ profiles   │         │              │         │              │
              └────────────┘         └──────────────┘         └──────────────┘
                                          │
                                          ▼
                            ┌────────────────────────────┐
                            │           ANCRA            │
                            │  event bus · analytics     │
                            │  every module publishes    │
                            └────────────────────────────┘
```

---

## 2. Module Inventory & System-of-Record Ownership

Each row states the module's canonical responsibility and the canonical entities it owns.

| Module | Canonical responsibility | Canonical entities owned |
|---|---|---|
| **ANCRID** | Federated identity, authentication, authorization tokens | `ancr_id`, `identity`, `credentials`, `oauth_grants`, `sessions_token`, `roles` |
| **INHEIRA** | Creative record — sessions, lyrics, splits, Creative Evidence™, Song Intelligence™, Publishing readiness | `session`, `lyric_line`, `event` (Song DNA™), `contribution`, `creative_version`, `creative_contribution_ledger` entry, `verified_contribution_agreement`, `share_link`, `song_intelligence_report`, `song_id`, `iswc`, `isrc`, `upc` |
| **ANCRA** | Analytics events + platform-wide observability | `event_log`, `metric`, `funnel`, `retention_cohort` |
| **ANCRLAB** | Physical studio sessions, room bookings, hardware capture | `studio_room`, `booking`, `capture_session`, `hardware_manifest`, `stem_file_ref` |
| **ANCRSYNC** | Sync licensing catalog, film/TV/ad placements | `sync_listing`, `licensor_offer`, `sync_deal`, `motif_index` (reference) |
| **Vaulta™** | Royalty rail, payout ledger, PRO/mechanical/streaming aggregation | `royalty_stream`, `payout`, `distribution_rule`, `payee_bank_account` |
| **COHEIR™** | Estate planning, heirs, ownership resolution, beneficiary designations | `estate_record`, `heir_designation`, `beneficiary_pct`, `inheritance_trigger` |
| **ANCRMEDIA** | Editorial creator profiles, press kits, publication content | `editorial_profile`, `feature_article`, `press_kit`, `interview_transcript` |
| **ANCRLaunch** | Marketing campaigns, waitlists, launch camps, campaign analytics | `campaign`, `campaign_asset`, `waitlist_entry`, `attribution` |
| **CCDP** | Collegiate Creative Development Program — student portfolios + faculty oversight | `institution`, `program`, `cohort`, `student_portfolio_ref` (references INHEIRA) |

**Deliberately non-canonical:** Every module reads other modules' canonical entities by reference; no module duplicates another's canonical data.

---

## 3. Canonical Identifier Model

Every entity has a globally unique ID that is stable across every module. IDs never mutate.

| ID | Owner | Format | Notes |
|---|---|---|---|
| `ancr_id` | ANCRID | `ancr_<hex14>` | The single canonical identity of a human across every module. Replaces INHEIRA's current `user_id` at v1.6 federation. |
| `session_id` | INHEIRA | `sess_<hex12>` | Creative session. Referenced by ANCRSYNC, Vaulta, COHEIR, CCDP. |
| `song_id` | INHEIRA | `song_<hex12>` | The finalized composition. Emerges when a session locks its Split Sheet. Downstream modules key by `song_id`. |
| `iswc` | INHEIRA (assignment authority) | `T-000.000.000-0` | Only assigned when Publishing Command Center registers the work. |
| `isrc` | INHEIRA (assignment authority) | `USRC00000000` | Assigned at recording-level. |
| `upc` / `ean` | INHEIRA | 12/13 digits | Release-level identifiers. |
| `capture_id` | ANCRLAB | `cap_<hex12>` | A physical-room capture (multi-stem take). |
| `sync_listing_id` | ANCRSYNC | `sync_<hex12>` | A catalog listing offered for sync. |
| `royalty_stream_id` | Vaulta | `rev_<hex12>` | A single royalty inflow. |
| `estate_record_id` | COHEIR | `est_<hex12>` | Estate + heir ledger anchor for a work. |
| `event_id` | Module that emits | prefix by module (`inh_evt_`, `lab_evt_`, `sync_evt_`, etc.) | Every event on ANCRA carries its origin prefix. |

**Do not remap.** Under no circumstances is an ID rewritten as it crosses a module boundary. Modules that need a shorter local key MAY store a local index that references the canonical ID; they MUST NOT invent a new authoritative ID for the same entity.

---

## 4. Data Boundaries — What Each Module May and May Not Store

The reference model is only enforceable if every module obeys strict data boundaries. This section is normative.

### 4.1 ANCRID
- **May store:** email, hashed password, OAuth grants, verified identity documents (PRO number, IPI), MFA secrets, active session tokens.
- **May not store:** any creative artifact, session content, royalty amounts, estate designations, campaign attribution.

### 4.2 INHEIRA
- **May store:** session content (lyrics, chords, arrangement, uploads), Song DNA™ events, Creative Evidence™ (all versions), CEI ledger entries, Verified Contribution Agreements, Song Intelligence Reports™, Publishing readiness metadata, ISWC/ISRC/UPC assignments, share tokens.
- **May not store:** authentication credentials (delegated to ANCRID), payout bank details (Vaulta), heir/beneficiary data (COHEIR), campaign attribution (ANCRLaunch), tax IDs.
- **RightPrint** stays in INHEIRA (composed of professional identity: PRO, IPI, publisher, disciplines). The pure identity primitives (legal name, email, phone) federate to ANCRID at v1.6.

### 4.3 ANCRLAB
- **May store:** room bookings, hardware manifests, stem capture file references, capture start/end timestamps.
- **May not store:** the composition itself, split sheets, ownership designations. ANCRLAB emits an `ancrlab.capture.completed` event; INHEIRA responds by creating a corresponding session.

### 4.4 ANCRSYNC
- **May store:** sync listings, licensor offers, licensor contacts, deal terms, sync-royalty splits (mirroring `agreed_legal_ownership` for the sync side only), motif-fingerprint indices (as references — not the underlying `structured_documentation`).
- **May not store:** the composition's raw creative content or CEI ledger. Sync matching queries INHEIRA by `song_id`.

### 4.5 Vaulta™
- **May store:** royalty inflow ledger, payout schedules, payee bank details, distribution rules keyed by `song_id` + `ancr_id`, PRO/DSP/mechanical aggregation.
- **May not store:** creative content, session history, heir designations. Vaulta receives `Agreed Legal Ownership` from INHEIRA and uses it as the distribution basis.

### 4.6 COHEIR™
- **May store:** estate anchors per `song_id`, heir designations, beneficiary percentages, inheritance triggers, legal will references.
- **May not store:** creative content, royalty payouts (queries Vaulta by `song_id` + `ancr_id`), authentication credentials.

### 4.7 ANCRMEDIA
- **May store:** editorial content, curated profiles, press kits, interviews.
- **May not store:** private session content, unpublished lyrics, split percentages.

### 4.8 ANCRLaunch
- **May store:** campaign definitions, campaign assets, waitlist entries, attribution data.
- **May not store:** any private creator data beyond `ancr_id`.

### 4.9 CCDP
- **May store:** institution/cohort/faculty metadata, capstone-project references, student portfolio pointers (all references, not copies).
- **May not store:** the actual creative content. CCDP is a directory / mentorship layer over INHEIRA.

---

## 5. Cross-Module Reference Model

### 5.1 Reference discipline
When Module A needs data owned by Module B, it stores **only the canonical ID** and reads live from Module B via the read API.

Example: ANCRSYNC storing a sync listing for a work.
```json
// stored in ANCRSYNC only
{
  "sync_listing_id": "sync_a1b2...",
  "song_id":         "song_c3d4...",   // reference — owner is INHEIRA
  "primary_contributors": [             // references only
    { "ancr_id": "ancr_e5f6..." }
  ],
  "listing_notes":   "Coming-of-age drama, mid-tempo indie",
  "created_at":      "2026-..."
}
```
ANCRSYNC does NOT copy the song title, lyric snippet, or the split. It calls `GET /inheira/api/songs/{song_id}/public-facts` at render time.

### 5.2 Read pattern (synchronous)
Every module exposes a `/public-facts` or `/private-facts` view that lets other modules read a well-defined non-PII projection.

```
GET /inheira/api/songs/{song_id}/public-facts       # no auth · title, work status, iswc, primary contributor names
GET /inheira/api/songs/{song_id}/rights-facts       # module-to-module auth · agreed_legal_ownership per ancr_id
GET /coheir/api/estates/{song_id}                   # module-to-module auth · heir designations
GET /vaulta/api/royalties/{song_id}                 # module-to-module auth · payout summary
```

### 5.3 Write pattern (asynchronous · via ANCRA)
Modules never call each other's write endpoints for state that another module owns. State changes are broadcast via ANCRA events; interested modules subscribe.

Example: INHEIRA finalizes a Split Sheet, emitting a `song.rights.finalized` event.
- Vaulta subscribes → initializes a royalty distribution rule keyed to `song_id`.
- COHEIR subscribes → creates an estate anchor with default beneficiary rules.
- ANCRSYNC subscribes → adds the song to the sync-eligible catalog if `sync_potential ≥ 60`.

Modules never mutate `sessions.splits` in INHEIRA. INHEIRA is the sole writer.

### 5.4 Idempotency and versioning
- Every published event carries an `event_id` and a monotonically increasing `event_seq` per emitter.
- Consumers store the last-processed `event_seq` per emitter to prevent duplicate processing.
- Payload schema is versioned via `event_type_version`; consumers must accept new fields and ignore unknowns.

---

## 6. Federated Identity — ANCRID

### 6.1 Model
- Every human has exactly one `ancr_id`.
- ANCRID exposes standard OIDC endpoints (`/authorize`, `/token`, `/userinfo`, `/jwks.json`, `/.well-known/openid-configuration`).
- Modules validate JWTs by fetching `/jwks.json`; no shared secret.
- Access tokens are JWT (RS256), 30-minute exp, refresh token 30-day exp.
- ID tokens include `ancr_id`, `email`, `name`, `verified_disciplines[]`, `roles[]`.

### 6.2 Migration path from current INHEIRA JWTs
INHEIRA currently issues its own HS256 JWTs. Migration to ANCRID federation is a v1.6 project:
1. **Coexistence phase** — INHEIRA accepts both current INHEIRA JWT and ANCRID JWT. Both map to the same internal `user_id` via a new `identity_map` table.
2. **Cutover phase** — INHEIRA login screen redirects to ANCRID hosted login. New tokens are ANCRID-issued.
3. **Legacy retirement** — INHEIRA stops issuing its own tokens. `identity_map` is retained for auditability; `user_id` is aliased to `ancr_id` in every future write.

### 6.3 Role model
Roles are ecosystem-wide, defined at ANCRID:
- `creator` (default) · `verified_creator` · `institution_admin` (CCDP) · `industry_reader` (publisher/A&R) · `attorney` · `admin` · `platform_admin`.

Each module MAY define finer-grained module-local permissions on top.

---

## 7. ANCRA — Event Bus & Analytics

### 7.1 Transport
- Managed message broker (Kafka-compatible; e.g., Redpanda or Confluent Cloud in production).
- Topics are per-emitter: `inheira.*`, `ancrlab.*`, `ancrsync.*`, `vaulta.*`, `coheir.*`, `ancrmedia.*`, `ancrlaunch.*`, `ccdp.*`, `ancrid.*`.
- Every event carries `{event_id, event_type, event_type_version, event_seq, emitter, emitted_at, payload}`.

### 7.2 Canonical event catalog (selected)
| Event type | Emitter | Payload key fields | Consumers |
|---|---|---|---|
| `ancrid.user.registered` | ANCRID | `ancr_id, email` | INHEIRA (create RightPrint stub) |
| `ancrid.user.verified` | ANCRID | `ancr_id, verified_disciplines[]` | INHEIRA, ANCRSYNC |
| `ancrlab.capture.completed` | ANCRLAB | `capture_id, ancr_id[], stems[]` | INHEIRA (create session; ingest stems as CEI evidence) |
| `inheira.session.created` | INHEIRA | `session_id, owner_ancr_id` | ANCRA |
| `inheira.creative_evidence.recorded` | INHEIRA | `session_id, version_id, contributor_ancr_id, ledger_entry_id, confidence` | CEI internal · ANCRA |
| `inheira.song.rights.finalized` | INHEIRA | `song_id, session_id, agreed_legal_ownership: [{ancr_id, pct, role}], iswc, isrc, upc` | Vaulta, COHEIR, ANCRSYNC |
| `inheira.report.shared` | INHEIRA | `session_id, token, audience` | ANCRA |
| `ancrsync.deal.executed` | ANCRSYNC | `sync_deal_id, song_id, licensee, total_amount` | Vaulta |
| `vaulta.royalty.received` | Vaulta | `royalty_stream_id, song_id, amount, source` | ANCRA, COHEIR (for estate view) |
| `coheir.heir.designated` | COHEIR | `estate_record_id, ancr_id (decedent), heirs[]` | Vaulta (redirect future payouts) |
| `ccdp.portfolio.updated` | CCDP | `student_ancr_id, portfolio_refs[]` | ANCRMEDIA |
| `ancrlaunch.waitlist.joined` | ANCRLaunch | `email, campaign_id, ancr_id?` | ANCRA |

### 7.3 Consumer contract
- Consumers process events **at-least-once**. Idempotency is the consumer's responsibility.
- Consumers store `(emitter, event_seq)` cursor.
- Retention: 30 days for replay-friendly recovery.

### 7.4 Analytics store
ANCRA also aggregates every event into a long-term analytics store (BigQuery / ClickHouse). Read-only projections power internal dashboards.

---

## 8. Creative Evidence™ Flow Across the Ecosystem

Creative Evidence™ records events; **Creative Provenance™** (§8A) connects those events into one continuously verifiable history across the entire ecosystem. This section covers where Creative Evidence™ physically lives; §8A covers how the provenance chain envelops it.

Creative Evidence™ is **never duplicated** outside INHEIRA.

```
ANCRLAB capture (raw stems + take metadata)
        │
        │  ancrlab.capture.completed  (canonical stems remain in ANCRLAB object storage — INHEIRA holds only references)
        ▼
INHEIRA session (owner of session + Creative Evidence™)
        │
        │  Contributors submit versions → creative_versions collection
        │  Creative Comparison Engine™ produces ledger entries
        │  Human Review → Verified Contribution Agreements
        │
        │  inheira.creative_evidence.recorded (per version)
        │  inheira.song.rights.finalized      (when all VCAs signed)
        ▼
ANCRSYNC       ← reads motif hashes by song_id (motif_index only stores hashes, not the underlying structured_documentation)
Vaulta         ← reads agreed_legal_ownership by song_id, sets royalty distribution rule
COHEIR         ← reads agreed_legal_ownership by song_id, initializes estate anchor
```

### 8.1 Where Creative Evidence physically lives
- **Raw human artifacts** (audio, MIDI, MusicXML, DAW files): stored in the object storage bucket owned by the module that captured them.
  - ANCRLAB stems live in the ANCRLAB bucket. INHEIRA references them via a signed-URL contract.
  - Direct-uploaded artifacts (via INHEIRA session) live in the INHEIRA bucket.
- **Structured documentation** (canonical machine-readable form): lives in INHEIRA only. Downstream modules reference by `version_id`.
- **Creative Contribution Ledger™ entries**: live in INHEIRA only. Immutable. Referenced by ANCRSYNC/Vaulta/COHEIR via `ledger_entry_id`.

### 8.2 Legal firewall — ecosystem-wide invariant
- **Documented Creative Contribution** (CEI-calculated) is scoped to INHEIRA and its downstream reads. It is **never** a royalty distribution basis.
- **Agreed Legal Ownership** (from Verified Contribution Agreements) is the only field Vaulta and COHEIR consume for distribution.
- ANCRSYNC references Agreed Legal Ownership when a sync deal executes; sync-side royalty distribution follows Vaulta's rule for that `song_id`.
- Every module UI that surfaces contribution numbers must render the persistent disclaimer:
> *INHEIRA documents creativity — it does not determine legal ownership. Documented Creative Contribution is an evidence-based estimate. Agreed Legal Ownership is set by the collaborators.*

---

## 8A. Creative Provenance™ — Platform-Wide Architectural Principle

**Creative Provenance™ is not a feature, page, ledger, or module. It is a permanent architectural principle of the ANCR™ Ecosystem, inherited automatically by every current and future module.**

While **Creative Evidence™** records **what happened** (an event, a version, a signature, an upload), **Creative Provenance™** connects every event into **one continuously verifiable history** — the immutable chain of authorship that ties artifact → predecessor → successor → session → contributor → module → downstream consumer.

### 8A.1 Ecosystem-wide obligations
Every ANCR module — including every module built after this document is written — must:

1. **Publish** a provenance node for every creative artifact it creates or mutates, via the Creative Provenance API (§8A.3) or the ANCRA event `provenance.node.created`.
2. **Consume** provenance references when displaying or reasoning about any artifact originating outside its own boundary.
3. **Never duplicate** provenance history. Cross-module histories join at query time via the platform Creative Provenance service.
4. **Never invent** provenance retroactively. Backfilled nodes must be flagged `human_verification_status = unverified`.

### 8A.2 System-of-record for the graph
- **The Creative Provenance service** owns the graph itself (nodes + edges + verification metadata).
- **Individual modules** own the creative artifacts referenced by the graph.
- **INHEIRA™** remains the canonical system of record for Creative Evidence™ related to songwriting and musical works. Every other module references INHEIRA's evidence via provenance nodes.

### 8A.3 API surface
`/api/provenance/*` — full spec in `ANCR_Creative_Provenance_Platform_Spec_v1.0.md §8`. Endpoints for node creation, chain retrieval, cross-module song-graph queries, comparison, verification, search, resolve, export, timeline, visualization, and audit.

### 8A.4 Legal firewall — carried over from CEI and made ecosystem-wide
Creative Provenance™ **DOES document**: who, what, when, where, how, supporting evidence, verified history.
Creative Provenance™ **DOES NOT determine**: ownership, copyright, publishing percentages, royalties, contracts, split sheets.

Every visualization, export, and API response that renders provenance data must show the ecosystem-wide disclaimer defined in the platform spec §11.3.

### 8A.5 Where it lives
Platform infrastructure. Not owned by any content module. Deployed adjacent to ANCRID and ANCRA. Data stored in an append-only ledger DB (ImmuDB / QLDB / append-constrained Postgres).

### 8A.6 Companion document
Full canonical spec: `/app/docs/ANCR_Creative_Provenance_Platform_Spec_v1.0.md`

---


## 8B. Creator DNA™ — The Third Layer of the Platform Stack

**Creator DNA™ is not a feature, module, or profile page. It is a permanent architectural principle of the ANCR™ Ecosystem — the lifelong identity graph that documents the complete creative life of every creator.**

### 8B.1 The three-layer platform stack

| Layer | Purpose | Grain |
|---|---|---|
| **Creative Evidence™** | Records events — what happened | Per event |
| **Creative Provenance™** (§8A) | Connects events into an immutable chain of history per artifact | Per artifact |
| **Creator DNA™** | Connects every provenance chain into the lifelong story of the creator | Per creator, per lifetime |

Creator DNA™ answers a single question:
> **Who has this creator become over the course of their creative life?**

### 8B.2 A derived view, not a new data source
Creator DNA™ is **fully derivable from the Creative Provenance™ graph.** No module owns Creator DNA. No module queries raw application data to enrich it. DNA consumes provenance nodes asynchronously via ANCRA and projects them onto per-creator collections that are recomputable at any time.

### 8B.3 Ten growth dimensions
Creative · Technical · Leadership · Business · Educational · Commercial · Collaboration · Innovation · Mentorship · Legacy. Each dimension is an **absolute** trajectory — never a competitive ranking.

### 8B.4 Creator Relationship Graph™
Documented relationships across the ecosystem (Mentored By · Mentors · Collaborated With · Produced By · Managed By · Published By · Inspired · Influenced · Student Of · Faculty · Companies Founded · Projects Shared). Every edge is backed by a Creative Provenance™ node — no evidence, no relationship.

### 8B.5 API surface
`/api/creator-dna/*` — full spec in `ANCR_Creator_DNA_Platform_Spec_v1.0.md §12`. Endpoints for DNA read, timeline, dimensions, relationships, per-pair edges, natural-language search, rebuild, export, and audit.

### 8B.6 Legal firewall
Creator DNA™ documents a creator's evolving creative life — it does not determine ownership, copyright, royalties, contracts, or a creator's "value." The platform never ranks creators against each other.

### 8B.7 Where it lives
Platform infrastructure adjacent to ANCRID, ANCRA, and Creative Provenance™. Never inside a content module.

### 8B.8 Companion document
Full canonical spec: `/app/docs/ANCR_Creator_DNA_Platform_Spec_v1.0.md`

---


## 8C. Creative Interpretation Framework™ — The Philosophy Layer

**The Creative Interpretation Framework™ (CIF) is the human-first decision framework that governs how every module in the ANCR ecosystem interprets and renders Creative Evidence™.** It is not a feature or a module. It is the philosophy and rules made executable — implemented as a shared platform service that every module consumes at render time.

### 8C.1 Where CIF sits in the stack
```
Creative Evidence™         records events
       │
       ▼
Creative Provenance™       connects events into immutable chains
       │
       ▼
Creator DNA™               connects chains into lifetime creator stories
       │
       ▼
Creative Interpretation    governs how any of the above is interpreted
Framework™                 and rendered to a human — the philosophy layer
                           over the data layers
```

### 8C.2 The Ten Principles (see companion spec for full detail)
1. **Document Before Interpretation** — never interpret undocumented events.
2. **Separate Evidence from Interpretation** — every insight has two visually distinct sections.
3. **Creative Influence™** — distinct from Contribution; qualitative scale only.
4. **Contribution Classification™** — fixed vocabulary, never overwritten.
5. **Evidence Confidence™** — High · Medium · Low · Unknown.
6. **Creative Intent™** — recorded only from the contributor; never inferred.
7. **Creative Narratives™** — grounded LLM, cites underlying `provenance_id` refs.
8. **Preserve Rejected Creativity™** — all rejected/experimental ideas remain searchable.
9. **Human Review Always Wins™** — Original + Human Decisions + Final Agreement stored side by side, forever.
10. **Legal Firewall™** — CIF never produces ownership statements or split proposals as fact.

### 8C.3 API surface
`/api/cif/*` — full spec in `INHEIRA_Creative_Interpretation_Framework_Spec_v1.0.md §6`. Includes `/cif/interpret`, `/cif/narrative`, `/cif/classify`, `/cif/confidence`, `/cif/validate` (the firewall), and `/cif/decisions`.

### 8C.4 Enforcement
Every user-facing render of creative evidence — across every module, now and in the future — must call `POST /cif/validate` before returning the payload to the client. Ownership statements, split proposals, and ungrounded narratives are rejected with `422 CIF_FIREWALL_VIOLATION`.

New modules cannot ship to production without a signed CIF Integration Checklist confirming every render path is covered.

### 8C.5 Companion document
Full canonical spec: `/app/docs/INHEIRA_Creative_Interpretation_Framework_Spec_v1.0.md`

---


## 9. Shared Services

Some infrastructure is shared across the ecosystem to avoid duplication.

| Service | Purpose | Ownership |
|---|---|---|
| **Object storage** | Raw human artifacts, stems, DAW exports, PDFs, artwork | Per-module bucket, single provider (Emergent Object Storage in dev/preview, S3 in production). Signed-URL contracts enable cross-module reads. |
| **LLM gateway** | Claude / GPT / Gemini access | Universal Emergent LLM key in dev/preview. Production migrates to per-module rate-limited API keys through a central gateway. |
| **Notifications** | Email, SMS, push | Central notification service; modules publish `notify.request` events. Emails/SMS providers (Resend, Twilio) are single-owned. |
| **Payments** | Stripe (creators + institutions) | Owned by Vaulta™. Other modules never call Stripe directly. |
| **Search** | Cross-module full-text search (creators, songs, institutions) | ANCRSYNC + INHEIRA feed a shared index (Meilisearch / Typesense). |
| **Feature flags** | Progressive rollouts | Central feature-flag service; every module reads flags at runtime. |

---

## 10. API Architecture

### 10.1 Route prefixing
Every module hosts its own API under a fixed prefix:
```
/api/inheira/*      → INHEIRA
/api/ancrid/*       → ANCRID  (also serves /.well-known/openid-configuration)
/api/ancra/*        → ANCRA
/api/ancrlab/*      → ANCRLAB
/api/ancrsync/*     → ANCRSYNC
/api/vaulta/*       → Vaulta
/api/coheir/*       → COHEIR
/api/ancrmedia/*    → ANCRMEDIA
/api/ancrlaunch/*   → ANCRLaunch
/api/ccdp/*         → CCDP
```
Ingress routes each prefix to the module's service.

**Migration note:** INHEIRA currently uses `/api/*` (no `inheira/` sub-prefix). The rename to `/api/inheira/*` is a v1.6 breaking change coordinated with the ANCRID federation cutover.

### 10.2 Module-to-module authentication
- Modules authenticate to each other via **service accounts** issued by ANCRID.
- Service-account JWTs include `svc:<module>` and `aud:<target_module>`.
- Every module rejects service-account tokens missing correct `aud`.

### 10.3 Rate limiting
- Per-module rate limits at ingress (Nginx / Envoy).
- Cross-module traffic has separate, generous quota to prevent internal-loop backpressure.

### 10.4 Error contract
All modules share the FastAPI-style error contract:
```json
{ "detail": "human readable", "code": "MODULE.ERROR_CODE", "correlation_id": "req_..." }
```

### 10.5 Correlation IDs
Every inbound request receives a `correlation_id`. It propagates on every downstream call and every emitted event, enabling end-to-end tracing.

---

## 11. Deployment Topology

### 11.1 Preview / dev (current state, 2026-02-07)
- Single Kubernetes cluster.
- INHEIRA is currently the **only** module deployed. Backend at `:8001`, frontend at `:3000`, MongoDB local.
- Other modules exist only as specification documents.

### 11.2 Production (target)
- One Kubernetes cluster per environment (dev, staging, prod).
- Each module = 1+ Deployment + Service. Ingress routes by `/api/<module>/*`.
- Each module owns its own database (recommended: MongoDB per module; Vaulta may prefer Postgres for double-entry ledger semantics).
- Shared services (object storage, message broker, LLM gateway, notification, search index, feature flags) run in the same cluster or in a shared platform account.

### 11.3 Rollback
Every module deploys independently. A module rollback does **not** affect other modules unless the event schema version regresses; schema-version compatibility rules protect against that (see §5.4).

---

## 12. Security & Compliance Model

### 12.1 Authentication
- All user authentication goes through ANCRID (target state).
- Modules never see raw passwords; they receive short-lived JWTs.

### 12.2 Authorization
- Role-based checks at every module boundary.
- Per-resource ownership enforced in each module (e.g., session-collaborator check in INHEIRA).

### 12.3 Encryption
- TLS everywhere (ingress + intra-cluster mTLS in production).
- At rest: managed DB encryption; object storage server-side encryption; sensitive PII (SSN, tax ID) additionally application-encrypted with per-tenant keys (COHEIR + Vaulta only).

### 12.4 Audit logging
- Every write to a sensitive collection emits an ANCRA `audit.*` event with actor, target, and correlation ID.
- Audit stream is retained ≥ 7 years for regulated modules (Vaulta, COHEIR).

### 12.5 PII inventory & isolation
| PII field | Owning module |
|---|---|
| Email, phone, legal name | ANCRID |
| Bank account, tax ID | Vaulta |
| Heir SSN, will documents | COHEIR |
| PRO / IPI / publisher affiliation | INHEIRA (RightPrint) |
| Student records | CCDP |

No module stores PII owned by another module. Access is via API on demand, never bulk-cached.

### 12.6 Regulatory scope
- **SOC 2 Type II** — all modules.
- **HIPAA-adjacent** protections for minor-artist data (CCDP).
- **PCI DSS** — Vaulta only (payments).
- **GDPR / CCPA** — ecosystem-wide; ANCRID hosts the canonical data-deletion request flow.

---

## 13. Data Deletion & Right to Be Forgotten

A creator's deletion request enters ANCRID and fans out.

```
User requests deletion at ANCRID
        │
        │  ancrid.user.deletion.requested (ancr_id)
        ▼
Each module receives the event and processes according to its policy:
  · ANCRID          → anonymize identity primitives; retain hash for audit
  · INHEIRA         → tombstone user_id references; preserve immutable ledger entries with "REDACTED" attribution
                       (CEI ledger is legally immutable — attribution is anonymized, entries are not deleted)
  · Vaulta          → freeze future payouts; retain historical records for tax/regulatory retention (7 yr)
  · COHEIR          → transfer estate control to designated heir per estate document
  · ANCRSYNC        → remove listings; retain historical deal records for legal retention
  · ANCRMEDIA       → un-publish editorial; retain if newsworthy public interest
  · ANCRLaunch      → purge attribution
  · CCDP            → per institutional retention policy
  · ANCRA           → keep anonymized event stream; delete linking identifiers
```

Complete deletion is impossible for immutable ledgers (CEI, Vaulta royalties, COHEIR estates) — these become **anonymized** rather than deleted, and this exception is disclosed in the ecosystem privacy policy.

---

## 14. Version Compatibility Strategy

- **Additive-only** for event payloads. Never remove or rename a field; add new fields.
- **Deprecation window** for API breaking changes: ≥ 6 months with `Sunset` HTTP header + explicit deprecation event.
- **Schema versions** carried on every event; consumers must handle N and N-1.
- **DB schema migrations** are backward-compatible for one release cycle before old columns/collections are dropped.

---

## 15. Roadmap for Ecosystem Federation

### Now (2026-Q1) — pre-federation
- INHEIRA is live as a standalone module using local JWTs and local MongoDB.
- Other modules exist only as specs.

### v1.6 (2026-Q2) — federation kickoff
- Deploy ANCRID (identity + SSO).
- INHEIRA cutover to accept ANCRID JWTs alongside local JWTs.
- Stand up ANCRA broker.
- INHEIRA begins publishing `inheira.session.created`, `inheira.creative_evidence.recorded`, `inheira.song.rights.finalized` events.

### v1.7 (2026-Q3) — first downstream module
- Deploy Vaulta™ as a real royalty rail (Stripe payouts).
- Vaulta subscribes to `inheira.song.rights.finalized` and initializes distribution rules.

### v1.8 (2026-Q4) — sync + estate
- Deploy ANCRSYNC (motif index + catalog).
- Deploy COHEIR (estate anchors + heir designations).

### v2.0 (2027) — full ecosystem
- ANCRLAB integrated with INHEIRA session auto-create.
- ANCRMEDIA + ANCRLaunch shipped.
- CCDP institutional launch.

---

## 16. Architectural Decision Records (Ecosystem-level)

### ADR-E1 · One system of record per canonical entity
**Decision:** No entity may be authoritatively stored in more than one module.
**Why:** Prevents divergence. Simplifies audit. Enforces data ownership.

### ADR-E2 · Cross-module references, not copies
**Decision:** Downstream modules store canonical IDs and read live from the owning module.
**Why:** Eliminates duplication drift. Reduces PII sprawl. Enables the immutability guarantee for CEI ledger.

### ADR-E3 · ANCRID as federated identity provider (OIDC)
**Decision:** Single sign-on across modules via ANCRID.
**Why:** One human, one identity. Enables cross-module analytics and consistent authorization. Removes the current per-module login proliferation.

### ADR-E4 · Async state changes over Kafka-compatible event bus (ANCRA)
**Decision:** Modules communicate state changes via events, not by direct API writes to each other.
**Why:** Loose coupling. Enables independent deploys. Preserves audit trail. Supports at-least-once + idempotent consumer contracts.

### ADR-E5 · Creative Evidence™ never leaves INHEIRA
**Decision:** Raw creative artifacts, structured documentation, and the CEI ledger live only in INHEIRA. Every other module references them by ID.
**Why:** Legal firewall integrity. Ledger immutability. Prevents mis-attribution downstream.

### ADR-E6 · Legal firewall — CEI ≠ ownership
**Decision:** Documented Creative Contribution (CEI-calculated) is never a distribution basis. Only Agreed Legal Ownership (from Verified Contribution Agreements) drives Vaulta royalties and COHEIR estates.
**Why:** Legal defensibility. Aligns with the Creator First™ philosophy.

### ADR-E7 · PII stays with the module that natively needs it
**Decision:** Bank details in Vaulta only; heir SSN in COHEIR only; PRO/IPI in INHEIRA only; base identity in ANCRID.
**Why:** Minimizes blast radius. Simplifies compliance (SOC 2, PCI, GDPR).

### ADR-E8 · Immutable ledgers cannot be deleted, only anonymized
**Decision:** GDPR "right to be forgotten" anonymizes CEI attribution, Vaulta payouts, and COHEIR estates rather than deleting them.
**Why:** Legal retention obligations conflict with true deletion. Anonymization preserves auditability while removing the person from the record.

### ADR-E9 · Creative Provenance™ is a platform-wide architectural principle, inherited by every module
**Decision:** Every current and future ANCR module publishes provenance nodes to a shared Creative Provenance service (`/api/provenance/*`) for every creative artifact it creates or mutates. No module may duplicate another module's provenance history. Cross-module histories are joined at query time.
**Why:** Establishes one continuously verifiable chain of authorship across the ecosystem. Enforces the Creator First™ principle at the platform layer. Prevents divergent histories and audit gaps.
**Companion doc:** `ANCR_Creative_Provenance_Platform_Spec_v1.0.md`

### ADR-E10 · The Creative Provenance Graph is append-only across the entire ecosystem
**Decision:** No provenance node is ever mutated after creation. Only `next_nodes` and `referenced_by` are append-safe. GDPR anonymization redacts fields but never removes nodes or edges. The Creative Provenance data store is chosen to physically enforce append-only semantics (ImmuDB / QLDB / append-constrained Postgres).
**Why:** The chain's value is its immutability. Any mutable node opens legal-defensibility risk and violates Creator First™.

### ADR-E11 · Creator DNA™ is a derived view over Creative Provenance™, inherited by every module
**Decision:** No module owns Creator DNA™. Every module publishes Creative Provenance™ nodes (per ADR-E9); Creator DNA™ consumes those nodes asynchronously via ANCRA. DNA collections must be fully recomputable from the Provenance graph using deterministic algorithms. No module queries another module's raw data to enrich Creator DNA™.
**Why:** Prevents DNA divergence. Keeps the platform stack coherent: Evidence records events, Provenance connects them per artifact, DNA connects every provenance chain per creator over a lifetime.
**Companion doc:** `ANCR_Creator_DNA_Platform_Spec_v1.0.md`

### ADR-E12 · The Creative Interpretation Framework™ governs every render of creative evidence
**Decision:** No module renders creative-evidence UI payloads without passing them through `POST /cif/validate`. No module produces creative narratives without calling `POST /cif/narrative` (grounded LLM only). The Legal Firewall (CIF Principle 10) is enforced by the CIF service at render time — modules cannot bypass it. New-module admission to production requires both a Provenance Compliance Checklist (ADR-E9) and a CIF Integration Checklist.
**Why:** Turns the Creator First™ philosophy into executable, testable, non-bypassable rules. Prevents ownership language, split proposals rendered as fact, or ungrounded narratives from ever reaching a user across any module.
**Companion doc:** `INHEIRA_Creative_Interpretation_Framework_Spec_v1.0.md`




---

## 17. Architectural Conflicts Discovered During This Design Pass

The following items conflict with the current INHEIRA implementation and MUST be resolved before or during federation. They are documented here as **known technical debt**, not blockers to Demo Mode or CEI Phase 1 (both operate inside INHEIRA's boundary).

### C-1 · Local JWT vs federated ANCRID JWT
- **Current state:** INHEIRA issues its own HS256 JWTs.
- **Target state:** ANCRID issues RS256 JWTs; INHEIRA validates via JWKs.
- **Resolution:** Coexistence phase at v1.6. Both token types accepted; `user_id` ↔ `ancr_id` mapped via a lightweight `identity_map` table. No user-facing sign-outs.

### C-2 · `user_id` vs `ancr_id`
- **Current state:** INHEIRA writes `user_id` on every collection.
- **Target state:** `ancr_id` is the canonical human identifier across the ecosystem.
- **Resolution:** At v1.6, add `ancr_id` field alongside `user_id`. Backfill via ANCRID user-migration. Retain `user_id` as an alias for auditability during a 2-release window, then drop.

### C-3 · Ownership of `song_id` vs `session_id`
- **Design intent:** A `song_id` (finalized composition) is distinct from a `session_id` (creative workspace). One song may span multiple sessions.
- **Current state:** INHEIRA treats `session_id` as the primary identifier at all layers, including Song Intelligence Report™ and Split Sheet. There is no `song_id` yet.
- **Resolution:** Introduce `song_id` at the Publishing Command Center step — assigned when the Split Sheet is signed by all collaborators. Downstream modules key by `song_id`. Sessions may aggregate under a shared `song_id` when a work is finalized across multiple sessions.
- **Impact for CEI Phase 1:** Not blocking. CEI operates at session scope. When multi-session works arrive (v1.7+), the CEI ledger will need cross-session attribution (already listed as Phase 3 of the CEI spec).

### C-4 · Vaulta drives royalty distribution — but Agreed Legal Ownership is set inside INHEIRA sessions
- **Design intent:** Vaulta reads Agreed Legal Ownership from INHEIRA.
- **Current state:** INHEIRA stores splits in `sessions.splits` (approved via signatures). This IS the source of Agreed Legal Ownership at RC1.
- **Resolution:** No conflict, but the naming needs alignment. At v1.6, `sessions.splits` → `sessions.agreed_legal_ownership` (with an alias for backward compat). CEI Phase 1 already introduces `verified_contribution_agreements.agreed_legal_ownership_pct` — merge this field so a single canonical source of Agreed Legal Ownership exists per song per contributor.
- **Action for CEI Phase 1 build:** Ensure the `verified_contribution_agreements` write path syncs to `sessions.splits` so downstream modules that read splits do not diverge.

### C-5 · Object storage — currently single bucket, target per-module
- **Current state:** All INHEIRA uploads go to one Emergent Object Storage bucket.
- **Target state:** Per-module buckets with signed-URL cross-reads.
- **Resolution:** Introduce a `bucket_owner` field on every file record at v1.6. New uploads default to the owning module's bucket. Existing files remain in the INHEIRA bucket indefinitely (immutable-by-policy).

### C-6 · ANCRLAB → INHEIRA session auto-create
- **Design intent:** `ancrlab.capture.completed` triggers INHEIRA session creation with stem references.
- **Current state:** ANCRLAB does not exist. INHEIRA sessions are manually created.
- **Resolution:** No action for RC1. When ANCRLAB ships (v2.0), INHEIRA subscribes to the event on ANCRA. The event contract in §7.2 is the authoritative interface.

### C-7 · Share tokens vs federated capability tokens
- **Current state:** INHEIRA share tokens are opaque, INHEIRA-issued, opt-in password-gated.
- **Design intent:** Capability tokens do NOT need to federate — they represent revocable read access, not identity.
- **Resolution:** No change needed. Share tokens remain INHEIRA-issued.

### C-8 · Legacy `localStorage.songright_token` and `test@songright.com`
- **Current state:** INHEIRA retains the legacy `songright_token` localStorage key and `test@songright.com` seeded account for RC1 test continuity.
- **Target state:** After ANCRID federation, tokens are managed by ANCRID's SDK; localStorage key becomes `ancrid_token` (or equivalent).
- **Resolution:** Deferred to v1.6 cutover. Non-blocking.

### C-9 · `sessions.splits` vs `verified_contribution_agreements` — potential dual-source truth
- **Risk:** If CEI Phase 1 writes to `verified_contribution_agreements` and legacy Studio flows continue writing to `sessions.splits`, Vaulta may see two divergent split tables.
- **Resolution (mandatory at CEI Phase 1 build):** The VCA write handler must also update `sessions.splits` in the same transaction. `sessions.splits` becomes the denormalized read-model; VCAs remain the immutable source of truth. Vaulta reads only `sessions.splits` until v1.7 when it can migrate to VCAs directly.

### C-10 · CEI ledger immutability vs GDPR deletion
- **Design intent:** CEI ledger is immutable.
- **Regulatory reality:** GDPR "right to be forgotten" requires user data removal.
- **Resolution:** ADR-E8 — anonymize attribution (`contributor_id` → `"REDACTED"`) while preserving the ledger structure and evidence. Disclosed in ecosystem privacy policy. Documented in CEI Phase 1 UI as "Anonymize my past contributions" (as opposed to "Delete").

---

## 18. Handoff Notes for the CTO

### 18.1 What this document establishes
- The **ownership matrix** for every canonical entity across the ecosystem.
- The **reference model** that prevents data duplication.
- The **event contract** (ANCRA) that carries state changes.
- The **legal firewall** (Documented Creative Contribution ≠ Agreed Legal Ownership) as an ecosystem-wide invariant.
- **10 architectural conflicts** with the current INHEIRA implementation, all resolvable, none blocking near-term work.

### 18.2 What's canonically NOT in this document
- Module-level implementation detail. Each module gets its own Technical Specification (INHEIRA is the first; ANCRID, ANCRSYNC, COHEIR, Vaulta, ANCRLAB, ANCRMEDIA, ANCRLaunch, CCDP, ANCRA to follow).
- Cost estimates. Each module's spec includes its own budget section.

### 18.3 Recommended reading order for a new platform engineer
1. This document (`ANCR_Ecosystem_Architecture_v1.0.md`)
2. `INHEIRA_Technical_Specification_v1.0.md`
3. `INHEIRA_Creative_Evidence_Intelligence_Spec_v1.0.md`
4. The forthcoming ANCRID / ANCRA specs (highest priority)
5. Then each module spec in the order it's likely to ship (Vaulta → ANCRSYNC → COHEIR → ANCRLAB → ANCRMEDIA → ANCRLaunch → CCDP)

### 18.4 What to do about the 10 conflicts
- **Non-blocking for CEI Phase 1:** C-3, C-6, C-7, C-8.
- **Must be addressed inside CEI Phase 1 build:** C-9 (dual-source truth in `sessions.splits` vs VCAs).
- **v1.6 federation project:** C-1, C-2, C-4, C-5, C-10.

---

*End of ANCR Ecosystem Architecture Specification v1.0.*
