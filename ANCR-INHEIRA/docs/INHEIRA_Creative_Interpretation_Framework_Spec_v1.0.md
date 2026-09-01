# INHEIRA™ · Creative Interpretation Framework™ — Platform Specification v1.0

**Document owner:** Platform Engineering
**Audience:** CTO, every module engineering lead, product design, legal review
**Status:** Canonical · governs how every ANCR module interprets Creative Evidence™
**Created:** 2026-02-07
**Companion documents:**
- `ANCR_Ecosystem_Architecture_v1.0.md`
- `ANCR_Creative_Provenance_Platform_Spec_v1.0.md`
- `ANCR_Creator_DNA_Platform_Spec_v1.0.md`
- `INHEIRA_Technical_Specification_v1.0.md`
- `INHEIRA_Creative_Evidence_Intelligence_Spec_v1.0.md`

---

## 1. Purpose

The **Creative Interpretation Framework™ (CIF)** is the human-first decision framework that governs how the ANCR ecosystem documents, interprets, organizes, and presents Creative Evidence™.

CIF is **not** a feature and **not** a module. It is **the philosophy and rules that govern every conclusion the platform makes** — implemented as a shared service consumed by every module that interprets or renders creative evidence.

CIF does **not** determine ownership.
CIF does **not** determine royalties.
CIF does **not** determine legal rights.

CIF exists to help collaborators understand documented creative history through transparent, evidence-based interpretation.

---

## 2. Creator First™ Principle (Foundation)

> Human creativity is the source.
> Technology is the witness.
> Technology documents.
> Technology explains.
> Technology never replaces the creator.
> Technology never becomes the creator.

Every principle below is a direct consequence of this foundation.

---

## 3. The Ten Principles

Each principle is normative. Any implementation that violates a principle is a regression regardless of accuracy or performance gains.

### 3.1 Principle 1 — Document Before Interpretation
- CIF must **never interpret undocumented events.**
- Every interpretation must reference a documented Creative Evidence™ record (via `provenance_id`).
- If evidence does not exist:
  - Do **not** infer.
  - Do **not** speculate.
  - Do **not** estimate.
  - Render exactly: **"Insufficient Creative Evidence Available."**

### 3.2 Principle 2 — Separate Evidence from Interpretation
Every insight rendered by any module must contain **two independent, visually distinct sections**:

**A. Documented Creative Evidence** (facts only)
> *New chorus recorded · Session 4 · Piano added · Bass removed · New bridge created*

**B. Creative Interpretation** (what the evidence suggests)
> *"The documented evidence indicates that Danielle introduced the harmonic progression retained in the final chorus."*

Interpretation must **never** be presented as fact. Interpretation blocks in every UI carry the label "Interpretation" and are visually differentiated from Evidence blocks (typographic, color, or layout — implementer's choice; separation is non-negotiable).

### 3.3 Principle 3 — Creative Influence™
Creative Contribution and Creative Influence are **different concepts**.

| Concept | What it documents |
|---|---|
| **Creative Contribution™** | *What* was created — the documented material |
| **Creative Influence™** | *How significantly* that creation shaped the final work |

Example rendering:
```
Documented Contribution   14%
Creative Influence        High
Reason                    Introduced the signature vocal hook retained throughout the final master.
```

Influence is **descriptive** — never legal, never financial. Influence is expressed on a qualitative scale: `Low · Medium · High · Foundational`. It is never converted to a percentage.

### 3.4 Principle 4 — Contribution Classification™
Rather than labeling every change as a generic "modification," classify creative actions. Canonical vocabulary (extensible):

- Created · Expanded · Refined · Edited · Adapted · Simplified
- Reharmonized · Rearranged · Reorchestrated · Replaced · Removed
- Inspired · Referenced · Restored

Every contribution retains its **original classification permanently.** Classifications never change on later versions — new versions produce new classifications, side by side.

### 3.5 Principle 5 — Evidence Confidence™
Every conclusion must display an **Evidence Confidence Level**.

| Level | Definition |
|---|---|
| **High** | Supported by multiple verified evidence sources |
| **Medium** | Supported by partial evidence requiring review |
| **Low** | Limited supporting evidence |
| **Unknown** | Unable to verify |

Confidence reflects the **evidence** — never the contributor. A contributor is never labeled "low-confidence."

### 3.6 Principle 6 — Creative Intent™
Contributors may **optionally** explain their decisions in plain language.

Examples stored verbatim:
- *"Needed stronger harmony."*
- *"Simplified for live performance."*
- *"Producer requested shorter intro."*
- *"Expanded bridge for emotional impact."*

Creative Intent becomes part of the permanent Creative Evidence™ timeline. Intent is **never inferred by AI** — it is only recorded when the contributor supplies it.

### 3.7 Principle 7 — Creative Narratives™
Every major revision generates a **human-readable narrative** summarizing documented evidence.

Example:
> *"During Session 5, Marcus established the foundational bass arrangement. Danielle later introduced a new harmonic progression that replaced portions of the original chorus. Chris subsequently expanded the bridge with a new guitar arrangement retained in the final master."*

Narratives must:
- Summarize documented evidence only.
- Cite the underlying `provenance_id` references in a companion payload (users can click through to raw evidence).
- Never create new information.
- Never assign emotional or subjective valence beyond what the contributor supplied via Creative Intent™.

### 3.8 Principle 8 — Preserve Rejected Creativity™
Not every idea survives. Every documented idea still matters.

The platform stores:
- Accepted Ideas
- Rejected Ideas
- Experimental Versions
- Alternate Arrangements
- Unused Sections

All rejected creativity is **searchable** throughout Life of a Song™ and Creator DNA™. Rejection does not erase provenance.

### 3.9 Principle 9 — Human Review Always Wins™
Whenever CIF produces an interpretation, collaborators must be able to:

- Approve
- Modify
- Dispute
- Add Context
- Request Review

The platform stores **all three** side by side, forever:
- The Original Interpretation
- The Human Decisions on that interpretation
- The Final Agreement

**Nothing is overwritten.** The three-way record is the load-bearing evidence trail.

### 3.10 Principle 10 — Legal Firewall™
CIF must never render:
- *"You own…"*
- *"You deserve…"*
- *"This is the correct split…"*

CIF always renders, in this order:
1. Documented Creative Evidence
2. Creative Interpretation
3. Documented Contribution
4. Creative Influence
5. Evidence Confidence
6. Final Agreed Ownership

**Ownership remains a human and legal determination.** CIF outputs are inputs to that determination — never conclusions.

---

## 4. CIF as a Shared Service

CIF is implemented as a platform-side shared service consumed by every module that renders or reasons about creative evidence.

### 4.1 Consuming modules (required)
- **Creative Evidence™** (recording layer)
- **Creative Provenance™** (chain layer)
- **Creator DNA™** (lifetime layer)
- **Creative Evidence Intelligence™** (analysis layer — INHEIRA)
- **Song Intelligence™** (report layer — INHEIRA)
- **Ownership Dashboard™** (INHEIRA)
- **Session Intelligence™** (real-time — INHEIRA/ANCRLAB)
- **Life of a Song™** (timeline layer — INHEIRA)

Every future module that renders creative evidence inherits the same obligation automatically.

### 4.2 What the service does
The CIF service provides:
- **Interpretation renderer** — given a set of `provenance_id`s + context, returns a structured payload following the Ten Principles.
- **Confidence scorer** — computes Evidence Confidence Level from provenance node counts, verification statuses, and comparison confidence.
- **Classifier** — maps raw change taxonomy (`added`, `replaced`, `reharmonized`, …) to the human-facing Contribution Classification™ vocabulary.
- **Narrative generator** — grounded LLM prompt that produces a Creative Narrative™ referencing only supplied `provenance_id`s (never hallucinating names, dates, or contributions).
- **Firewall validator** — inspects any UI payload before render and rejects strings that violate Principle 10.

### 4.3 What the service does not do
- Does not produce percentages that aren't already in Provenance/CEI.
- Does not persist its own creative history — it is a pure interpretation function over Provenance.
- Does not sign anything. Signatures remain in Verified Contribution Agreements.

---

## 5. Data Model

CIF is stateless with respect to creative history. It maintains only two lightweight append-only collections for auditability:

### 5.1 `cif_interpretations`
| Field | Type |
|---|---|
| `interpretation_id` | string PK (`cif_<hex14>`) |
| `subject_provenance_ids` | array of `provenance_id` |
| `evidence_block` | array of {`provenance_id`, `label`} |
| `interpretation_block` | string (LLM-grounded narrative or rule-generated) |
| `contribution_pct` | float \| null (mirrored from CEI, never recomputed here) |
| `creative_influence` | enum `Low · Medium · High · Foundational` |
| `influence_reason` | string |
| `evidence_confidence` | enum `High · Medium · Low · Unknown` |
| `classification` | enum (Contribution Classification™ vocabulary) |
| `rendered_by_module` | string |
| `rendered_at` | ISO |
| `firewall_validation` | `{passed: bool, violations: [...]}` |

Never mutated.

### 5.2 `cif_human_decisions`
| Field | Type |
|---|---|
| `decision_id` | string PK (`cifd_<hex14>`) |
| `interpretation_id` | FK |
| `actor_ancr_id` | FK |
| `action` | enum `approved · modified · disputed · added_context · requested_review` |
| `modification_payload` | object \| null |
| `notes` | string |
| `at` | ISO |

Append-only. Preserves the three-way record required by Principle 9.

---

## 6. API Surface

`/api/cif/*` — platform service. ANCRID service-account auth for module callers.

| Method | Route | Purpose |
|---|---|---|
| POST | `/cif/interpret` | Body: `{subject_provenance_ids, module_context}` — returns a full interpretation payload following the Ten Principles |
| POST | `/cif/narrative` | Body: `{subject_provenance_ids, style?}` — returns a grounded Creative Narrative™ + citation refs |
| POST | `/cif/classify` | Body: `{comparison_result}` — maps to Contribution Classification™ vocabulary |
| POST | `/cif/confidence` | Body: `{subject_provenance_ids}` — returns Evidence Confidence Level + supporting refs |
| POST | `/cif/validate` | Body: `{rendered_payload}` — inspects for Principle 10 violations; returns pass/fail |
| POST | `/cif/decisions` | Body: `{interpretation_id, action, ...}` — records a human decision on an interpretation |
| GET | `/cif/interpretations/{interpretation_id}` | Fetch interpretation + all human decisions |
| GET | `/cif/interpretations?subject={provenance_id}` | List every interpretation ever produced for a subject |

### 6.1 Validation contract
`POST /cif/validate` is the platform-wide firewall. Any module about to render a creative-evidence payload to a user **must** pass it through this endpoint. Violations of Principle 10 (ownership statements without a signed agreement, split proposals rendered as fact, etc.) return `422 CIF_FIREWALL_VIOLATION` with the offending strings identified.

Compliance gate: **new modules cannot ship to production without CIF validation on every creative-evidence render path.** Enforced by the Provenance Compliance Checklist (see ADR-E9 addendum below).

---

## 7. AI Responsibilities Inside CIF

CIF is where LLMs are used most heavily (narrative generation). The AI rules from Creative Provenance™ and Creator DNA™ are reinforced here:

**AI may:**
- Assemble narratives grounded in supplied `provenance_id`s
- Classify comparison results using the fixed vocabulary
- Score confidence based on provenance signals

**AI must never:**
- Reference a `provenance_id` that wasn't supplied in the request
- Insert a contributor name, date, or contribution that isn't in the supplied evidence
- Assign creative influence beyond `Low · Medium · High · Foundational`
- Produce percentages
- Produce ownership statements

Any narrative returned to a caller must be **traceable back to its supplied evidence set.** The `/cif/narrative` response always includes `evidence_citations: [{provenance_id, cited_span}]`.

**Confidence gating:** when `evidence_confidence == "Low" | "Unknown"`, the narrative response is prefixed with the standard disclaimer:
> *"The available evidence is limited. The following interpretation should be reviewed by the collaborators before it informs any decision."*

---

## 8. Ownership of the CIF Service

CIF is **platform infrastructure**, adjacent to ANCRID, ANCRA, Creative Provenance™, and Creator DNA™.

- No content module owns CIF.
- Every content module consumes CIF at render time.
- CIF has no private copy of the Provenance graph; every call reads Provenance live.

---

## 9. Relationship to the Rest of the Platform Stack

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
Creative Interpretation    governs how any of the above is interpreted and rendered
Framework™                 to a human — the philosophy layer over the data layers
```

CIF is the philosophy layer over the data layers. It enforces the Ten Principles at every render site, ecosystem-wide.

---

## 10. Engineering Principle

Codified as ecosystem ADR-E12 (added to `ANCR_Ecosystem_Architecture_v1.0.md §16`):

**ADR-E12 · The Creative Interpretation Framework™ governs every render of creative evidence**
- No module renders creative-evidence UI payloads without passing them through `POST /cif/validate`.
- No module produces creative narratives without calling `POST /cif/narrative` (grounded LLM only).
- The Legal Firewall (Principle 10) is enforced by the CIF service at render time — modules cannot bypass it.
- New-module admission to production requires **both** the Provenance Compliance Checklist (ADR-E9) **and** a CIF Integration Checklist confirming every user-facing render path calls `/cif/validate`.

---

## 11. Implementation Phases

### Phase 0 — Local CIF inside INHEIRA (concurrent with CEI Phase 1)
- Implement the Ten Principles as a library inside INHEIRA (`/app/backend/cif/`).
- Every CEI render surface (Ownership Dashboard "Composition (CEI)" lens, Song Intelligence Report™ Creative Evidence™ block, Verified Contribution Agreement panels, Studio "Compare Versions" tab) calls the local CIF library.
- Firewall validator runs on every server-rendered payload before the response is returned to the client.

### Phase 1 — Extract to platform service
- Move the CIF library into a standalone service.
- Migrate INHEIRA to be the first client of `/api/cif/*`.

### Phase 2 — Cross-module adoption
- As Song Intelligence, Session Intelligence, Life of a Song, ANCRSYNC, and Creator DNA renderers ship, each integrates CIF at every user-facing render path.
- Every new module's Compliance Checklist audits CIF coverage before production sign-off.

### Phase 3 — Continuous refinement
- Narrative quality iteration (better grounded-LLM prompting, deeper motif references from Creator DNA™).
- Firewall validator vocabulary expands as legal counsel refines banned phrasings.

---

## 12. Success Criteria

- Every user-facing render of creative evidence across every module passes through `/cif/validate`.
- Zero production ownership statements produced by AI without a signed Verified Contribution Agreement backing them.
- Every Creative Narrative™ traces to its supplied `provenance_id` set via `evidence_citations`.
- Every rejected creative idea is retrievable throughout Life of a Song™.
- Every interpretation carries all six required blocks: Documented Creative Evidence → Creative Interpretation → Documented Contribution → Creative Influence → Evidence Confidence → Final Agreed Ownership.
- Firewall violation rate in production trending toward zero across releases.

---

## 13. Final Vision

The Creative Interpretation Framework™ establishes that INHEIRA — and every module in the ANCR ecosystem — is **not an artificial creator**. It is **a trusted historian of human creativity.**

By separating documented evidence, thoughtful interpretation, and human decision-making, the platform preserves the integrity of every creative journey while ensuring that creators remain at the center of every outcome.

CIF is the philosophy of the platform, made executable.

---

*End of Creative Interpretation Framework™ Specification v1.0. This is the final canonical platform specification of the design phase. From here, execution.*
