# ANCR™ Ecosystem — Creative Provenance™ Platform Specification v1.0

**Document owner:** Platform Engineering
**Audience:** CTO, platform architects, every module engineering lead, security review, legal review
**Status:** Canonical · establishes Creative Provenance™ as a permanent ecosystem-wide architectural principle
**Created:** 2026-02-07
**Companion documents:**
- `ANCR_Ecosystem_Architecture_v1.0.md`
- `INHEIRA_Technical_Specification_v1.0.md`
- `INHEIRA_Creative_Evidence_Intelligence_Spec_v1.0.md`

---

## 1. What Creative Provenance™ Is — and Is Not

### 1.1 It is not
- A feature.
- A page.
- Another ledger.
- A module.
- A UI surface.
- A single service anyone owns.

### 1.2 It is
- **A permanent architectural principle of the ANCR™ Ecosystem.**
- **The immutable chain of authorship that connects every creative artifact throughout the entire ecosystem.**
- **A platform-wide capability inherited automatically by every current and future ANCR module.**

### 1.3 The distinction from Creative Evidence™
- **Creative Evidence™** records **events** — what happened, when, by whom, with what supporting artifact.
- **Creative Provenance™** connects every event into **one continuously verifiable history** — the chain that ties artifact → predecessor → successor → session → contributor → module → downstream consumer.

Every Creative Evidence™ record is a **node** in the Creative Provenance™ graph. The graph itself is the invisible foundation that ensures nothing meaningful in the creative process is ever lost, overwritten, or disconnected from its origin.

---

## 2. Core Principle

Every creative artifact — in every module, forever — must always be able to answer:

- **Where did this originate?**
- **Who first created it?**
- **When was it created?**
- **What evidence supports that creation?**
- **How has it changed?**
- **Who changed it?**
- **Why did it change?**
- **Which session created the change?**
- **Which version replaced the previous version?**
- **Which collaborators participated?**
- **Which modules reference this artifact?**
- **What legal decisions occurred afterward?**
- **What commercial lifecycle followed?**

**No creative artifact should ever exist inside the ANCR ecosystem without an explainable provenance chain.**

---

## 3. Scope — What Gets a Provenance Graph

Every creative object receives its own permanent Creative Provenance Graph™. Non-exhaustive:

- Songs · lyrics · melodies · chord progressions · arrangements
- Instrument performances · stems · MIDI · MusicXML · DAW sessions
- Producer notes · voice memos · comments · revisions
- Publishing metadata · split agreements · contracts · registrations
- Releases · sync deals · royalty streams · estate designations
- Editorial features · press kits · marketing assets
- Campaigns · waitlists · attribution records
- Studio captures · equipment manifests · hardware logs
- Educational portfolios · assignment lineage · faculty assessments
- Identity verifications · permission grants · authentication events

Every future artifact type introduced by any new ANCR module inherits the provenance requirement automatically.

---

## 4. Immutable Provenance Chain™

Every modification becomes a **new node** in the graph. **Nothing is ever overwritten. Nothing disappears. Everything remains traceable.**

Canonical example lifecycle:

```
Song Created
   │
   ▼
Voice Memo Recorded
   │
   ▼
Lyrics Added
   │
   ▼
Bass Arrangement Uploaded
   │
   ▼
Piano Reharmonized Chorus
   │
   ▼
Producer Rearranged Bridge
   │
   ▼
Strings Added
   │
   ▼
Mix Revision
   │
   ▼
Master Revision
   │
   ▼
Publishing Approved
   │
   ▼
Release
   │
   ▼
Performance History
   │
   ▼
Award
   │
   ▼
Legacy Archive™
```

**History expands. History is never replaced.**

Graph shape:
- Primary edges are **temporal** (`previous_node` / `next_node` linking one artifact's versions).
- Secondary edges are **relational** (`derives_from`, `references`, `signed_by`, `consumed_by`) that connect artifacts across modules.
- The graph is a **directed acyclic graph (DAG)**. Cycles are rejected at write time.

---

## 5. Provenance Node — Canonical Schema

Every node in the Creative Provenance Graph™ conforms to a single schema. Missing fields must be explicitly `null`, never absent.

```json
{
  "provenance_id":          "prov_<hex16>",
  "artifact_id":            "<module-prefixed ID>",
  "artifact_type":          "song | lyric_line | musical_version | contribution | split_sheet | share_token | sync_listing | royalty_stream | estate_record | ...",
  "song_id":                "song_<hex12> | null",
  "session_id":             "sess_<hex12> | null",
  "creator_id":             "ancr_<hex14>",
  "created_at":             "2026-02-07T00:00:00Z",
  "originating_module":     "inheira | ancrlab | ancrsync | vaulta | coheir | ancrmedia | ancrlaunch | ccdp | ancrid",

  "previous_node":          "prov_<hex16> | null",
  "next_nodes":             ["prov_<hex16>", "..."],
  "derived_from":           ["prov_<hex16>", "..."],
  "referenced_by":          ["prov_<hex16>", "..."],

  "evidence_refs": [
    {
      "kind": "audio | midi | musicxml | pdf | daw_session | image | video | text | signature | file | comment",
      "uri":  "signed-URL or artifact reference (never a copy of the bytes)",
      "sha256": "artifact hash at time of registration",
      "owning_module": "inheira | ancrlab | ...",
      "notes": "human-readable context, optional"
    }
  ],

  "creative_comparison_results": {
    "compared_to_provenance_id": "prov_<hex16> | null",
    "changes": [ { "kind": "added | modified | replaced | removed | reharmonized | rearranged | expanded | retained | derived", "region": "Chorus mm. 12-15", "confidence": 0.86 } ]
  },

  "reviewer_activity": [
    { "reviewer_ancr_id": "ancr_<hex14>", "action": "approved | modified | disputed | context_added | requested_review", "at": "ISO", "notes": "..." }
  ],
  "approval_state":         "pending | approved | modified | disputed | context_added",
  "digital_signature":      "base64-signature or null",
  "hash_verification":      { "algorithm": "sha256", "value": "...", "verified_at": "ISO" },

  "confidence_score":       0.86,
  "human_verification_status": "unverified | verified | dispute",

  "legal_status":           "not_applicable | evidence_only | pending_agreement | agreed | signed | registered",
  "commercial_status":      "not_applicable | in_progress | live | archived",

  "audit": {
    "correlation_id":       "req_<hex>",
    "actor_ancr_id":        "ancr_<hex14>",
    "ingested_at":          "ISO",
    "immutable":            true
  }
}
```

Field-level guarantees:
- `provenance_id` is globally unique across the entire ANCR ecosystem.
- `previous_node` is set once at write time and never mutated.
- `next_nodes` and `referenced_by` are **append-only** (adding a new pointer is allowed; removing is not).
- `evidence_refs[*].uri` points to the artifact in its owning module's bucket. **The bytes are never copied into the provenance store.**
- `hash_verification.value` is the SHA-256 of the referenced artifact at the moment of node creation. Any later mismatch is a critical audit event.

---

## 6. Legal Status vs Commercial Status vs Provenance

Three orthogonal dimensions. Every node carries all three:

| Dimension | Values | Meaning |
|---|---|---|
| **provenance** | (always present) | *what happened, who did it, when* |
| **legal_status** | `not_applicable · evidence_only · pending_agreement · agreed · signed · registered` | *human negotiation lifecycle* |
| **commercial_status** | `not_applicable · in_progress · live · archived` | *market lifecycle* |

Provenance advances **automatically** with every creative action.
Legal status advances **only through human signature**.
Commercial status advances **only through downstream module events** (Vaulta payouts, ANCRSYNC deals, releases).

**Advancing provenance never advances legal or commercial status.**

---

## 7. Platform Integration — Inheritance by Every Module

Creative Provenance™ is inherited automatically. **Every ANCR module — current and future — must:**

1. **Publish** a provenance node for every creative artifact it creates or mutates, via the Creative Provenance API (§8) or the ANCRA event `provenance.node.created`.
2. **Consume** provenance references when displaying or reasoning about any artifact originating outside its own boundary.
3. **Never duplicate** provenance history — reference by `provenance_id` only.
4. **Never invent** provenance retroactively. Backfilled nodes must carry `audit.ingested_at` distinct from `created_at` and be flagged `human_verification_status = unverified`.

### 7.1 Per-module publishing responsibilities

| Module | Provenance nodes it MUST publish |
|---|---|
| **INHEIRA™** | Song created · Voice memo · Lyric line · Musical version · Comparison result · Contribution · Ledger entry · Verified Contribution Agreement · Split sheet · Share token · Song Intelligence Report™ · Publishing identifier assignment · Release |
| **ANCRLAB™** | Studio capture · Stem uploaded · Room booking · Equipment manifest · Session start/end |
| **ANCRSYNC™** | Sync listing created · Deal opened · Deal executed · Placement |
| **Vaulta™** | Royalty stream received · Distribution rule set · Payout executed · Statement generated |
| **COHEIR™** | Estate anchor created · Heir designated · Beneficiary percentage set · Inheritance triggered |
| **ANCRMEDIA™** | Editorial published · Interview recorded · Press kit created |
| **ANCRLaunch™** | Campaign created · Asset published · Waitlist joined · Attribution recorded |
| **CCDP** | Portfolio entry added · Assignment submitted · Faculty assessment recorded |
| **ANCRID™** | Identity verified · Permission granted / revoked · Auth credential added |
| **ANCRA™** | Analytics events (mirrored for cross-module traceability) |

### 7.2 Per-module consumption responsibilities

| Module | Provenance references it MUST consume |
|---|---|
| **INHEIRA™** | Its own history + upstream ANCRLAB stems (via `derived_from`) |
| **ANCRSYNC™** | INHEIRA song provenance to prove authorship for licensees |
| **Vaulta™** | INHEIRA split-sheet provenance as the basis for distribution rules; ANCRSYNC deal provenance for sync royalties |
| **COHEIR™** | INHEIRA split-sheet provenance; Vaulta payout provenance for lifetime valuation |
| **ANCRMEDIA™** | Creator authorship provenance from INHEIRA when publishing editorial |
| **ANCRLaunch™** | Release provenance from INHEIRA for campaign context |
| **CCDP** | Student contribution provenance across all their INHEIRA sessions |
| **ANCRID™** | Its own verification history + cross-module role grants |

### 7.3 System-of-record principle (unchanged from Ecosystem Architecture ADR-E5)
> Creative artifacts remain in the bucket of the module that created them. The Creative Provenance Graph™ references artifacts by URI + hash. **The bytes are never duplicated across modules.**

INHEIRA™ remains the **canonical system of record for Creative Evidence™ and provenance related to songwriting and musical works.** Other modules publish provenance nodes for artifacts they own and reference INHEIRA nodes for artifacts INHEIRA owns.

---

## 8. Creative Provenance API — `/api/provenance/*`

A platform service. Hosted centrally, callable by every module. Authenticated via ANCRID service accounts.

### 8.1 Endpoints

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/provenance/nodes` | Create a provenance node — called by any module immediately after committing the artifact locally |
| GET | `/api/provenance/nodes/{provenance_id}` | Fetch a single node |
| GET | `/api/provenance/chain/{artifact_id}` | Return the full temporal chain for an artifact (V1 → V2 → V3 …) |
| GET | `/api/provenance/graph/{song_id}` | Return the complete Creative Provenance Graph™ for a song, spanning every module |
| POST | `/api/provenance/compare` | Body: `{from_provenance_id, to_provenance_id}` — returns comparison result (change kinds + region + confidence) |
| GET | `/api/provenance/verify/{provenance_id}` | Recomputes evidence hashes and returns a verification report (`verified: bool` + mismatches) |
| GET | `/api/provenance/search` | Search by creator, module, date range, artifact type, legal status, commercial status |
| POST | `/api/provenance/resolve` | Body: `{refs: [{module, artifact_id}]}` — batch lookup |
| GET | `/api/provenance/export/{song_id}` | Export the full graph as JSON-LD, human-signable |
| GET | `/api/provenance/timeline/{artifact_id}` | Timeline projection ready for UI rendering |
| GET | `/api/provenance/graph/{song_id}/visualization` | Graph payload optimized for visualization libraries (nodes + edges + module colors) |
| GET | `/api/provenance/audit/{provenance_id}` | Full audit trail for a node (who read it, who referenced it, when) |

### 8.2 Write contract
- Every write is idempotent by `provenance_id`. Modules generate the ID client-side (`prov_<hex16>`).
- Retries are safe.
- `previous_node` must resolve to an existing node OR be `null` for a root creation.
- Cyclic references are rejected with `409 CYCLE_DETECTED`.

### 8.3 Read authorization
- Public read is scoped to **non-sensitive projections** (`GET /api/provenance/graph/{song_id}/public`) — same policy as INHEIRA's public share tokens.
- Full read requires a valid ANCRID access token with the appropriate role scope.

### 8.4 Latency SLOs
- Node write: p95 < 100 ms.
- Chain read (single artifact): p95 < 150 ms.
- Full song graph: p95 < 500 ms (may span 8+ modules).

---

## 9. Provenance Visualization

Every creative artifact ships with a visual provenance timeline. Users **navigate a living creative history** — not browse files.

Supported views (all queryable at `/api/provenance/timeline/{artifact_id}` with `?view=` param):

- **Version Evolution** — the temporal spine of an artifact's revisions.
- **Creative Contributors** — nodes grouped by contributor with color coding.
- **Session Timeline** — nodes grouped by originating session.
- **Evidence Timeline** — nodes with their attached evidence artifacts (audio waveforms, MIDI thumbnails, PDF previews).
- **Publishing Timeline** — nodes involved in identifier assignment, PRO registration, DSP delivery.
- **Commercial Timeline** — nodes with `commercial_status ≠ not_applicable`.
- **Legal Timeline** — nodes with `legal_status ≠ not_applicable`, showing agreement lifecycle.
- **Portfolio Timeline** — every artifact touched by a given `ancr_id`.

**Nothing should feel like browsing files. Everything should feel like navigating a living creative history.**

The Landing page's **Life of a Song™** section (Chapter IX) is the public-facing manifestation of Portfolio Timeline for a single song. Once Creative Provenance™ ships, that timeline will be **generated live from the provenance graph** for real INHEIRA songs (opt-in).

---

## 10. AI Responsibilities Inside Creative Provenance™

AI never invents provenance.

**AI may only:**
- Document
- Connect
- Index
- Summarize
- Compare
- Visualize

Whenever AI confidence falls below the engineering threshold (default `< 0.5`), the platform requires **human review** before the node's `human_verification_status` may advance from `unverified` to `verified`.

Every AI-assisted node carries:
- `confidence_score` (0–1)
- Explicit `originating_module: <module>` (never `originating_module: ai`)
- `human_verification_status = unverified` until a human signs off

This is a **non-negotiable Creator First™ invariant.**

---

## 11. Legal Principle — What Creative Provenance™ Does and Does Not Determine

### 11.1 Creative Provenance™ DOES NOT determine
- Ownership
- Copyright
- Publishing percentages
- Royalties
- Contracts
- Split sheets

### 11.2 Creative Provenance™ DOES document
- Who
- What
- When
- Where
- How
- Supporting evidence
- Verified history

### 11.3 Persistent disclaimer
Every visualization, export, and API response that projects a provenance graph must include the disclaimer:

> *Creative Provenance™ documents the verifiable history of a creative work. It does not determine legal ownership, copyright, publishing percentages, royalties, or any contractual outcome. Legal and commercial decisions remain solely with the human collaborators.*

Downstream modules that render provenance data (ANCRSYNC, Vaulta, COHEIR, ANCRMEDIA) must render this disclaimer in every UI surface that surfaces provenance information.

---

## 12. Engineering Principle — Inheritance and Non-Duplication

Codified as ecosystem ADR-E9 (see also `ANCR_Ecosystem_Architecture_v1.0.md §16`):

**ADR-E9 · Creative Provenance™ is inherited by every module**
- Every current ANCR module publishes provenance nodes for every creative artifact it creates or mutates.
- Every future ANCR module inherits the same obligation automatically. New-module admission to production requires a signed Provenance Compliance Checklist.
- No module may duplicate another module's provenance history. Cross-module histories are joined at query time via the Creative Provenance API.
- Any module found duplicating provenance history is quarantined until reconciled.

**ADR-E10 · The Creative Provenance Graph is append-only**
- No node is ever mutated after creation, except for the strictly-scoped append operations on `next_nodes` and `referenced_by`.
- GDPR "right to be forgotten" anonymizes `creator_id → REDACTED` and clears PII-bearing evidence URIs, but never deletes nodes or edges. Documented in the ecosystem privacy policy alongside ADR-E8.

---

## 13. Ownership of the Creative Provenance Service Itself

The Creative Provenance service is **platform infrastructure**, not a module.

- **Where it lives:** Shared platform service (adjacent to ANCRA, ANCRID). Deployed in the same Kubernetes cluster in production.
- **Who owns it:** Platform Engineering. Not owned by any content module.
- **Data store:** Dedicated database (recommended: append-only ledger DB such as Amazon QLDB, ImmuDB, or a Postgres deployment with cryptographic append constraints).
- **Backups:** Never mutable-restore. Backups are additive snapshots only.

Modules interact with the service through the API in §8. They do **not** hold private copies of the provenance graph.

---

## 14. Implementation Phases

### Phase 0 — Foundation inside INHEIRA (concurrent with CEI Phase 1)
- Introduce the provenance node schema inside INHEIRA's own database as `provenance_nodes` collection.
- Every existing INHEIRA event (Song DNA™ events, CEI ledger entries, VCAs, share links) writes a provenance node.
- Local `/api/inheira/provenance/*` endpoints expose the graph to INHEIRA's own UI.
- Success criterion: every artifact in INHEIRA is retrievable by provenance chain.

### Phase 1 — Platform Provenance service
- Extract the `provenance_nodes` collection into the standalone Creative Provenance service.
- Move endpoints from `/api/inheira/provenance/*` to platform-hosted `/api/provenance/*`.
- INHEIRA becomes the first client of the platform service.

### Phase 2 — Cross-module publishing
- As each subsequent module ships (Vaulta, ANCRSYNC, COHEIR, ANCRLAB, ANCRMEDIA, ANCRLaunch, CCDP, ANCRID), it publishes provenance nodes at every creative-artifact write.
- Full song graphs spanning multiple modules become queryable.

### Phase 3 — Provenance-driven visualizations
- Landing page's Life of a Song™ section (Chapter IX) becomes live-generated from real graphs.
- Every module's UI gains a "Provenance" panel showing the current artifact's chain across the ecosystem.

---

## 15. Relationship to Existing Specs

| Existing artifact | Becomes, under Creative Provenance™ |
|---|---|
| INHEIRA Song DNA™ event | A provenance node with `originating_module: inheira`, `artifact_type: event` |
| CEI Creative Contribution Ledger entry | A provenance node with `artifact_type: ledger_entry`, `derived_from` linking to the version that triggered it |
| Verified Contribution Agreement (VCA) | A provenance node with `legal_status: agreed` and signatures in `reviewer_activity[]` + `digital_signature` |
| INHEIRA share_link | A provenance node with `artifact_type: share_token` |
| Publishing identifier assignment (ISRC/UPC/ISWC) | Provenance node with `legal_status: registered` |
| ANCRA event | Mirrored as a provenance node with `originating_module: ancra`, `artifact_type: event`, for cross-module traceability |

**No existing artifact is deleted or replaced.** Creative Provenance™ *envelops* them — every existing entity becomes a node in the graph, retroactively.

Retroactive backfill runs once, at the Phase 0 → Phase 1 boundary. Backfilled nodes carry `audit.ingested_at ≠ created_at` and `human_verification_status = unverified` to distinguish them from natively-created nodes going forward.

---

## 16. Creator First™ Closing Principle

> Technology should never decide who deserves credit.
> Technology should preserve the complete truth of the creative journey.
> Every contribution deserves recognition.
> Every decision deserves documentation.
> Every creator deserves a verifiable history.
> Every story deserves a permanent provenance.

Creative Provenance™ is the invisible foundation that connects every idea, every revision, every collaborator, every release, and every legacy across the entire ANCR™ ecosystem — ensuring that nothing meaningful in the creative process is ever lost, overwritten, or disconnected from its origin.

---

*End of Creative Provenance™ Platform Specification v1.0.*
