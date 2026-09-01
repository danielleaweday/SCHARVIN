# ANCR™ / INHEIRA™ — Engineering Documents Index

This directory contains the canonical engineering specifications for the ANCR™ Ecosystem and the INHEIRA™ module. **The design phase is complete. All future work is engineering.**

## The complete platform stack

| Layer | Purpose | Grain | Canonical spec |
|---|---|---|---|
| **Creative Evidence™** | Records events — what happened | Per event | Implemented in every module; primary spec in `INHEIRA_Creative_Evidence_Intelligence_Spec_v1.0.md` |
| **Creative Provenance™** | Connects events into an immutable chain of history | Per artifact | `ANCR_Creative_Provenance_Platform_Spec_v1.0.md` |
| **Creator DNA™** | Connects every provenance chain into the lifelong story of the creator | Per creator, per lifetime | `ANCR_Creator_DNA_Platform_Spec_v1.0.md` |
| **Creative Interpretation Framework™** | Governs how any of the above is interpreted and rendered to a human | Every render path, ecosystem-wide | `INHEIRA_Creative_Interpretation_Framework_Spec_v1.0.md` |

## Reading order for new engineers

1. **`ANCR_Ecosystem_Architecture_v1.0.md`** — Master architecture doc. System-of-record ownership, cross-module references, federated identity (ANCRID), event bus (ANCRA), deployment topology, security model.
2. **`ANCR_Creative_Provenance_Platform_Spec_v1.0.md`** — Creative Provenance™ as a permanent ecosystem-wide architectural principle. Every module inherits it. `/api/provenance/*` service.
3. **`ANCR_Creator_DNA_Platform_Spec_v1.0.md`** — Creator DNA™ as the lifelong identity graph derived from Provenance. `/api/creator-dna/*`.
4. **`INHEIRA_Creative_Interpretation_Framework_Spec_v1.0.md`** — CIF as the philosophy layer over every data layer. Ten Principles. `/api/cif/*`.
5. **`INHEIRA_Technical_Specification_v1.0.md`** — The full 16-section production spec for INHEIRA (the first shipped module in the ecosystem).
6. **`INHEIRA_Creative_Evidence_Intelligence_Spec_v1.0.md`** — CEI as INHEIRA's implementation of Creative Provenance™ for songwriting and musical works.

## How the documents relate

```
                      ANCR_Ecosystem_Architecture_v1.0.md
                      (system-of-record ownership,
                       federated identity, event bus)
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
        ANCR_Creative_    ANCR_Creator_   INHEIRA_Creative_
        Provenance_       DNA_Platform_   Interpretation_
        Platform_Spec     Spec_v1.0       Framework_Spec_v1.0
        (per-artifact     (per-creator    (philosophy layer
         history)          lifetime)       over every render)
                    │            ▲            │
                    └────────────┼────────────┘
                                 │
                                 ▼
                    INHEIRA_Technical_Specification_v1.0
                                 │
                                 ▼
                    INHEIRA_Creative_Evidence_
                    Intelligence_Spec_v1.0
                    (INHEIRA's manifestation of
                     Creative Provenance™ for
                     songwriting + musical works)
```

## Ecosystem ADRs (canonical)

- **ADR-E1** · One system of record per canonical entity
- **ADR-E2** · Cross-module references, not copies
- **ADR-E3** · ANCRID as federated identity provider (OIDC)
- **ADR-E4** · Async state changes over ANCRA event bus
- **ADR-E5** · Creative Evidence™ never leaves INHEIRA
- **ADR-E6** · Legal firewall — CEI ≠ ownership
- **ADR-E7** · PII stays with the module that natively needs it
- **ADR-E8** · Immutable ledgers cannot be deleted, only anonymized
- **ADR-E9** · Creative Provenance™ is inherited by every module
- **ADR-E10** · The Creative Provenance graph is append-only ecosystem-wide
- **ADR-E11** · Creator DNA™ is a derived view over Provenance, inherited by every module
- **ADR-E12** · The Creative Interpretation Framework™ governs every render of creative evidence

## Forthcoming module specs (not yet written — each module gets its own 16-section technical spec)

- `ANCRID_Technical_Specification_v1.0.md` — federated identity provider
- `ANCRA_Technical_Specification_v1.0.md` — analytics event bus
- `Vaulta_Technical_Specification_v1.0.md` — royalty rail
- `ANCRSYNC_Technical_Specification_v1.0.md` — sync licensing catalog
- `COHEIR_Technical_Specification_v1.0.md` — estate planning + heirs
- `ANCRLAB_Technical_Specification_v1.0.md` — physical studios
- `ANCRMEDIA_Technical_Specification_v1.0.md` — editorial + creator profiles
- `ANCRLaunch_Technical_Specification_v1.0.md` — marketing / campaigns
- `CCDP_Technical_Specification_v1.0.md` — collegiate program

Every new module must pass:
- **Provenance Compliance Checklist** (ADR-E9)
- **CIF Integration Checklist** (ADR-E12)

Creator DNA™ enrichment happens automatically once a module emits Provenance (ADR-E11).

## Key principles that span every document

1. **One system of record per canonical entity.** No duplicated ownership.
2. **Cross-module references, not copies.** Data flows by canonical ID.
3. **Creative Provenance™ is inherited by every module.** (ADR-E9)
4. **The Creative Provenance graph is append-only ecosystem-wide.** (ADR-E10)
5. **Creator DNA™ is a derived view over Provenance, inherited by every module.** (ADR-E11)
6. **CIF governs every render of creative evidence.** (ADR-E12)
7. **The Legal Firewall is non-negotiable.** Documented Creative Contribution ≠ Agreed Legal Ownership.
8. **Creator First™.** Technology documents creativity; it never replaces the artist.
9. **Immutable ledgers.** Append-only history everywhere; GDPR is handled by anonymization, not deletion. (ADR-E8)

---

**The design phase closes here.** From this point forward:
- Demo Mode ships next.
- Then CEI Phase 1 + Provenance Phase 0 + Creator DNA Phase 0 + CIF Phase 0, all inside INHEIRA, all riding on the same write paths.
- Then platform extraction as the second module ships.
