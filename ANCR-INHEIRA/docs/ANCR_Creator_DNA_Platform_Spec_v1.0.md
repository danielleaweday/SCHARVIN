# ANCR™ Ecosystem — Creator DNA™ Platform Specification v1.0

**Document owner:** Platform Engineering
**Audience:** CTO, platform architects, every module engineering lead, product design, legal review
**Status:** Canonical · establishes Creator DNA™ as a permanent ecosystem-wide architectural principle
**Created:** 2026-02-07
**Companion documents:**
- `ANCR_Ecosystem_Architecture_v1.0.md`
- `ANCR_Creative_Provenance_Platform_Spec_v1.0.md`
- `INHEIRA_Technical_Specification_v1.0.md`
- `INHEIRA_Creative_Evidence_Intelligence_Spec_v1.0.md`

---

## 1. What Creator DNA™ Is — and Is Not

### 1.1 It is not
- A feature.
- A module.
- Another profile page.
- Another database of user records.
- A ranking or scoring system.
- Something a creator manually curates.

### 1.2 It is
- **A permanent architectural principle of the ANCR™ Ecosystem.**
- **The permanent, evolving identity graph that documents the complete creative life of every creator.**
- **A derived view over Creative Provenance™ — Creator DNA™ never stores raw creative data; it consumes Provenance nodes and projects them onto a lifelong creator narrative.**
- **Inherited automatically by every current and future ANCR module.**

### 1.3 The three-layer platform stack

| Layer | Purpose | Grain |
|---|---|---|
| **Creative Evidence™** | Records **events** — what happened, by whom, with what supporting artifact | Per event |
| **Creative Provenance™** | Connects every event into an **immutable chain of history per artifact** | Per artifact |
| **Creator DNA™** | Connects every provenance chain into the **lifelong story of the creator** | Per creator, per lifetime |

Creator DNA™ answers the single question:
> **Who has this creator become over the course of their creative life?**

---

## 2. Core Philosophy

**Technology should never define a creator. Technology should faithfully preserve the creator's journey.**

Every project. Every lesson. Every collaboration. Every breakthrough. Every failure. Every revision. Every contribution. Every milestone. Every legacy.

Creator DNA™ becomes the **living historical record of a creator's evolution.**

---

## 3. Creator DNA Graph™

Each creator receives exactly one permanent Creator DNA Graph™ that continuously evolves throughout their lifetime.

### 3.1 How the graph grows
- **Automatically.** The graph is never manually built.
- **From Creative Provenance™ nodes.** Every provenance node emitted by any module becomes an enrichment signal.
- **No duplication.** Nothing entered twice. Nothing copied. Everything connected.

### 3.2 What the graph reveals
The Creator DNA Graph™ must be able to answer:

- Who is this creator?
- How has their creative voice evolved?
- What types of work do they consistently create?
- Which ideas repeatedly appear throughout their career?
- Which collaborators have shaped their journey?
- Whom have they mentored?
- Who influenced them?
- Which disciplines have they mastered?
- Which innovations originated from them?
- Which creative breakthroughs changed their direction?
- Which projects became commercially successful?
- Which projects remained experimental?
- What is their complete creative legacy?

**Every answer must trace back to documented evidence through the Creative Provenance™ chain.**

---

## 4. Creator Timeline™

Every creator has a permanent Creator Timeline™ spanning their lifetime.

Canonical milestones (non-exhaustive — new milestone types can be introduced without schema break):

```
First Idea
   │
   ▼
First Song
   │
   ▼
First Recording
   │
   ▼
First Collaboration
   │
   ▼
First Performance
   │
   ▼
First Release
   │
   ▼
First Publishing Registration
   │
   ▼
First Award
   │
   ▼
First Student Mentored
   │
   ▼
First Business Created
   │
   ▼
First Film · First Book · First Patent
   │
   ▼
Major Career Milestones
   │
   ▼
Legacy Archive™
```

The timeline **never closes** — it continues expanding for the creator's entire lifetime and into the Legacy Archive™ maintained by COHEIR™ after their passing.

---

## 5. Automatic Data Sources

Creator DNA™ consumes Creative Provenance™ nodes from every module. **It never queries raw application data.**

| Module | Contribution to Creator DNA™ |
|---|---|
| **INHEIRA™** | Creative Evidence™ · Creative Provenance™ nodes · Song Evolution™ · Creative Contribution Ledger™ · Verified Contribution Agreements |
| **ANCRLAB™** | Studio sessions · Recording history · Production activity |
| **ANCRSYNC™** | Licensing · Placements · Synchronization history |
| **Vaulta™** | Royalty history · Income history · Business growth |
| **ANCRMEDIA™** | Published releases · Editorial features · Media coverage |
| **ANCRLaunch™** | Career development · Portfolio growth · Industry placement |
| **COHEIR™** | Mentorship · Estate planning · Legacy transfers |
| **ANCRA™** (formerly CCDP context) | Academic history · Assignments · Faculty reviews · Portfolio development |
| **ANCRID™** | Identity verification · Permissions · Professional credentials |

Every provenance node whose `creator_id` matches (as author, contributor, mentor, reviewer, publisher, licensor, teacher, student, or party to an agreement) is projected into the creator's DNA graph automatically.

---

## 6. Creator DNA Dimensions

Every creator is tracked across ten **growth dimensions**. These are **visualizations of long-term development**, not rankings.

| Dimension | Signals it captures (from Creative Provenance™) |
|---|---|
| **Creative Growth** | Volume + diversity of original creative output (songs, arrangements, lyrics, motifs, works) |
| **Technical Growth** | Depth + variety of technical disciplines mastered (production, engineering, arrangement, instrumentation) |
| **Leadership Growth** | Session ownership · project leadership · team formation |
| **Business Growth** | Vaulta royalty streams · publishing deals · sync placements · companies founded |
| **Educational Growth** | Coursework · faculty assessments · portfolio milestones · certifications |
| **Commercial Growth** | Release count · streams · sync value · Vaulta lifetime income |
| **Collaboration Growth** | Unique collaborators · session diversity · cross-module partnerships |
| **Innovation Growth** | First-of-kind motifs · original arrangements · new disciplines entered |
| **Mentorship Growth** | Students mentored · faculty roles · attributed influence from other creators' DNA graphs |
| **Legacy Growth** | Enduring works still generating royalties · works archived · estate designations · references from other creators' timelines |

Dimensions are **absolute, not competitive.** No creator is ranked against another. Each dimension is expressed as a personal trajectory over time.

---

## 7. Creator Relationship Graph™

Creator DNA™ documents relationships — a living network of creative connections across the entire ecosystem.

Relationship types (extensible; new kinds can be added without breaking the schema):

- **Mentored By** / **Mentors**
- **Collaborated With**
- **Produced By** / **Produced**
- **Managed By** / **Managed**
- **Published By** / **Published**
- **Inspired** / **Influenced**
- **Student Of** / **Faculty**
- **Creative Teams**
- **Companies Founded** / **Organizations Joined**
- **Projects Shared**
- **Signed With** / **Represented By**

Every edge in the Creator Relationship Graph™ is **backed by a Creative Provenance™ node.** A relationship without evidence is not a relationship — it does not exist in the graph.

Relationships are **not symmetric by default.** "A collaborated with B" is recorded on both sides only when the underlying provenance node lists both creators as contributors. "A influenced B" may be recorded from a single provenance node (e.g., B publicly credits A in a Verified Contribution Agreement's `context_notes` or in an ANCRMEDIA interview) without A necessarily having a reciprocal edge.

---

## 8. Data Model

Creator DNA™ stores only **derived projections + connective metadata.** The underlying facts always live in the Creative Provenance™ graph.

### 8.1 `creator_dna_projections` (append-only derived collection)
| Field | Type |
|---|---|
| `projection_id` | string PK (`dna_<hex14>`) |
| `ancr_id` | string FK → ANCRID |
| `computed_at` | ISO |
| `source_provenance_id` | string FK → `provenance_nodes` |
| `dimension` | enum (10 growth dimensions above) |
| `milestone_kind` | string (e.g., `first_song`, `first_award`, `first_mentored_student`) — nullable |
| `delta` | numeric | growth contribution weight |
| `evidence_snapshot` | object | minimal projection payload for UI reads |

Never mutated. Every projection references the exact `provenance_id` that produced it, so the graph can be recomputed from Provenance at any time.

### 8.2 `creator_relationships` (append-only derived collection)
| Field | Type |
|---|---|
| `edge_id` | string PK (`rel_<hex14>`) |
| `subject_ancr_id` | string FK |
| `object_ancr_id` | string FK |
| `relationship_kind` | enum (see §7) |
| `source_provenance_id` | string FK — the evidence that justifies the edge |
| `first_observed_at` | ISO |
| `last_reinforced_at` | ISO — updated by appending a new record, never mutated |
| `strength` | float 0–1 · derived from co-occurrence count and recency |

### 8.3 `creator_timeline_entries` (append-only derived collection)
| Field | Type |
|---|---|
| `entry_id` | string PK (`ctl_<hex14>`) |
| `ancr_id` | string FK |
| `milestone_kind` | string |
| `label` | string — human-readable, e.g., "First release" |
| `at` | ISO |
| `source_provenance_id` | string FK |
| `visibility` | enum: `public` \| `industry` \| `private` — defaults `private` |

The creator controls per-entry visibility through the Privacy Controls (§13).

### 8.4 Recomputation guarantee
Every Creator DNA collection is **fully derivable from the Creative Provenance graph.** Wiping the DNA collections and rebuilding from Provenance must produce byte-identical projections (deterministic algorithms). This guarantee is the ecosystem's defense against DNA divergence.

---

## 9. Search Capabilities

Creator DNA™ supports natural-language exploration. Example queries the platform must answer:

- Show every collaboration between Creator A and Creator B.
- Show how this creator's songwriting evolved over ten years.
- Show every project that introduced a new musical style.
- Show every creator influenced by this creator.
- Show every innovation originating from this creator.
- Trace the complete creative journey of this creator from their first documented work to today.
- Show every creator this creator has mentored.
- Show every song this creator co-wrote that later reached a Vaulta royalty threshold of $X.
- Show every session this creator participated in during 2023.

Every answer must be derived from documented Creative Provenance™ nodes. **Inference without evidence is not permitted.**

Under the hood: natural-language queries are translated into structured graph traversals over the DNA + Provenance stores. The LLM only translates intent; it never fabricates results. Any generated summary must be accompanied by the underlying `provenance_id` refs so the user can inspect the raw evidence.

---

## 10. AI Responsibilities Inside Creator DNA™

### 10.1 AI may
- Document, connect, index, summarize, visualize
- Discover relationships (only when supported by ≥ 1 provenance node)
- Generate timelines from provenance data
- Surface patterns across a creator's history

### 10.2 AI must never
- Invent history
- Invent relationships
- Invent collaborations
- Invent influence
- Invent ownership
- Rank creators against each other
- Score creators on subjective merit
- Suggest a creator's "value"

### 10.3 When evidence is insufficient
The platform requires human verification. AI-inferred edges with `strength < 0.5` are flagged `human_verification_status = unverified` and are hidden from public views until reviewed.

---

## 11. Platform Integration — Inheritance by Every Module

Creator DNA™ is inherited automatically, following the same pattern as Creative Provenance™:

1. **Every module publishes Creative Provenance™ nodes** for every creative act (see `ANCR_Creative_Provenance_Platform_Spec_v1.0.md`).
2. **Creator DNA™ consumes those provenance nodes** — asynchronously, via ANCRA events.
3. **No module owns Creator DNA™.** No module reads or writes to another module's raw data to enrich DNA.
4. **No module maintains its own creator-history collection.** Every creator-history projection is served by the Creator DNA API.

### 11.1 The consumption path
```
Any module writes a Creative Provenance™ node
      │
      ▼
ANCRA emits `provenance.node.created`
      │
      ▼
Creator DNA service subscribes
      │
      ▼
For each `creator_id` referenced in the node:
   - Append to creator_dna_projections
   - Append/reinforce relationships in creator_relationships
   - Append milestone entries in creator_timeline_entries (if applicable)
   - Recompute dimension trajectories (idempotent)
```

### 11.2 Never queries raw application data
The Creator DNA service **does not** call `/api/inheira/sessions` or `/api/vaulta/royalties` directly. It reads only:
- The Creative Provenance™ graph (source of truth)
- ANCRID (for identity resolution + verification status)

This is the load-bearing architectural discipline that keeps DNA free from divergence.

---

## 12. Creator DNA API — `/api/creator-dna/*`

Platform service. Hosted alongside ANCRID, ANCRA, and Creative Provenance™.

### 12.1 Endpoints

| Method | Route | Purpose |
|---|---|---|
| GET | `/creator-dna/{ancr_id}` | Full DNA projection (dimensions, timeline summary, top relationships) |
| GET | `/creator-dna/{ancr_id}/timeline` | Full lifetime timeline; supports `?since=` and `?until=` |
| GET | `/creator-dna/{ancr_id}/dimensions` | Ten-dimension growth trajectory |
| GET | `/creator-dna/{ancr_id}/relationships` | Full relationship graph for this creator (paginated) |
| GET | `/creator-dna/{ancr_id}/relationships/{other_ancr_id}` | Every documented edge between two creators |
| GET | `/creator-dna/{ancr_id}/timeline/{milestone_kind}` | All entries of a given milestone kind |
| POST | `/creator-dna/search` | Body: `{query, filters?}` — natural-language search returning results grounded in `provenance_id` refs |
| POST | `/creator-dna/{ancr_id}/rebuild` | Admin-only. Wipes and rebuilds this creator's DNA from Provenance. Must produce identical output. |
| GET | `/creator-dna/{ancr_id}/export` | Export the creator's full DNA graph as JSON-LD (subject to Privacy Controls §13) |
| GET | `/creator-dna/{ancr_id}/audit` | Full audit trail — who has read this DNA and when |

### 12.2 Authorization
- Full read requires the creator's consent OR industry role (verified publisher, verified label, verified attorney representing the creator) OR a valid share token issued by the creator.
- Public read is scoped to the creator's opted-in public projection.
- Rebuild is platform-admin only, gated by MFA and a change-control ticket.

### 12.3 Latency SLOs
- Single-creator DNA read: p95 < 200 ms
- Timeline read: p95 < 300 ms
- Natural-language search: p95 < 1.5 s (LLM in the path)

---

## 13. Privacy Controls

Every creator owns their DNA graph and its visibility.

- **Per-milestone visibility** — every timeline entry can be `public`, `industry` (verified industry roles only), or `private` (creator only + explicit grants).
- **Per-relationship visibility** — a creator can hide a specific relationship edge from public projections. The underlying provenance node is preserved; only the projection is redacted.
- **Contested edges** — if Creator A appears as "mentored by" Creator B and A disputes it, A can flag the edge. Both A and B are notified; the edge is marked `contested` until reviewed. The underlying provenance is never altered.
- **Right to be forgotten (GDPR)** — deletion request anonymizes `ancr_id` in the DNA graph to `REDACTED` but does not remove nodes or edges (consistent with ADR-E8 and ADR-E10). Documented in the ecosystem privacy policy.

---

## 14. Legal Principle

Creator DNA™ **DOES document:**
- The creator's evolving creative life
- Documented milestones + relationships + dimensions
- All supported by Creative Provenance™ evidence

Creator DNA™ **DOES NOT determine:**
- Ownership · copyright · publishing percentages · royalties · contracts
- A creator's "value" or "worth" — the platform never publishes rankings
- Legal standing in disputes — DNA data may be presented as **evidence for negotiation** but is not automatically admissible as legal proof

Persistent disclaimer, rendered wherever DNA data appears in a UI or export:
> *Creator DNA™ is a documented view of a creator's evolving creative life, built from evidence recorded across the ANCR ecosystem. It does not determine ownership, copyright, or any commercial or legal outcome.*

---

## 15. Engineering Principle

Codified as ecosystem ADR-E11 (added to `ANCR_Ecosystem_Architecture_v1.0.md §16`):

**ADR-E11 · Creator DNA™ is a derived view over Creative Provenance™, inherited by every module**
- No module owns Creator DNA™.
- Every module publishes Creative Provenance™ nodes (per ADR-E9); Creator DNA™ consumes those nodes.
- No module queries another module's raw data to enrich Creator DNA™.
- Creator DNA™ collections must be fully recomputable from the Provenance graph. Deterministic algorithms only.
- New-module admission to production requires the same Provenance Compliance Checklist that ADR-E9 enforces; DNA enrichment is automatic once Provenance is emitted.

---

## 16. Implementation Phases

### Phase 0 — Local DNA inside INHEIRA (concurrent with CEI Phase 1 · Creative Provenance Phase 0)
- Introduce `creator_dna_projections`, `creator_relationships`, `creator_timeline_entries` collections inside INHEIRA's database.
- Every INHEIRA-local Creative Provenance™ write also enriches the local DNA collections.
- Local `/api/inheira/creator-dna/*` endpoints serve creator-level projections from INHEIRA's provenance data.
- The Creator Passport™ UI (existing INHEIRA page) becomes a Phase-0 view of Creator DNA™ — no data migration needed.

### Phase 1 — Platform Creator DNA service
- Extract DNA collections into a standalone platform service.
- Wire the service to consume ANCRA `provenance.node.created` events across all modules.
- Migrate INHEIRA to be a consumer of the platform DNA API for creator-level views (Creator Passport™ reads from `/api/creator-dna/*`).

### Phase 2 — Cross-module enrichment
- As each module ships (Vaulta, ANCRSYNC, COHEIR, ANCRLAB, ANCRMEDIA, ANCRLaunch, CCDP), the DNA graph automatically absorbs their provenance events.
- Dimensions (Commercial, Educational, Legacy) begin filling in as the modules that supply their signals come online.

### Phase 3 — Natural-language search + visualization
- Ship the `POST /api/creator-dna/search` endpoint with grounded LLM.
- Timeline visualization polished for public creator profiles.
- Relationship graph explorer becomes a public product surface (opt-in).

---

## 17. Relationship to Existing Specs

| Existing artifact | Under Creator DNA™ becomes |
|---|---|
| INHEIRA Creator Passport™ | The primary UI surface that renders a creator's DNA projection at Phase 0. Extended in Phase 1 with cross-module dimensions. |
| INHEIRA discography endpoint (`/api/creators/{user_id}/discography`) | Superseded at Phase 1 by `/api/creator-dna/{ancr_id}/timeline?filter=released_songs`. Legacy endpoint remains as a thin passthrough during migration. |
| Song Intelligence Report™ "Creator context" block | At Phase 2, sources creator context from Creator DNA API instead of computing it inline. |
| Landing page "Chapter VI · Creator Passport™" | The section becomes a live, real-creator DNA projection at Phase 3 (opt-in creators surfaced on the marketing site). |
| CEI Verified Contribution Agreements | Feed the `creator_relationships` collection with `collaborated_with` edges automatically. |

**No existing artifact is deleted.** Creator DNA™ *envelops* existing creator-facing views — every current profile page becomes a projection of the graph.

---

## 18. Long-Term Vision

Years from now, someone should be able to ask:

- *Show me the complete creative evolution of this creator.*
- *Trace every major contribution they made.*
- *Show every person they influenced.*
- *Show every project they helped build.*
- *Show how one idea evolved across decades.*
- *Show the complete history of a creative movement from its first recorded concept to global impact.*

The answer comes from **Creative Evidence™**, connected through **Creative Provenance™**, and revealed through **Creator DNA™.**

A creator's legacy should never depend on memory. It should be preserved through documented evidence.

---

## 19. Creator First™ Closing Principle

> Every creator deserves more than a portfolio.
> Every creator deserves a documented creative life.
> Every contribution deserves to be remembered.
> Every relationship deserves context.
> Every milestone deserves preservation.

**Creator DNA™ becomes the permanent, living history of every creator within the ANCR™ ecosystem — ensuring that a creator's legacy is preserved through evidence, connected through provenance, and discoverable for generations to come.**

---

*End of Creator DNA™ Platform Specification v1.0.*
