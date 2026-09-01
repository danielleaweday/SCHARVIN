# INHEIRA v1.0 — Documentation Index

## Engineering specifications (`/app/docs/`)
Canonical architecture documents authored during the pre-Phase-1 planning:

| File | Purpose |
|---|---|
| `ANCR_Ecosystem_Architecture_v1.0.md` | 10-module architecture · 12 ADRs · federated identity · event bus |
| `INHEIRA_Technical_Specification_v1.0.md` | System-level technical spec for INHEIRA |
| `INHEIRA_Creative_Evidence_Intelligence_Spec_v1.0.md` | CEI — ingestion + comparison engine (v2 target) |
| `INHEIRA_Creative_Interpretation_Framework_Spec_v1.0.md` | 10 principles governing every render / decision |
| `ANCR_Creator_DNA_Platform_Spec_v1.0.md` | 10-dimension lifetime growth model — realized in Phase 3 |
| `ANCR_Creative_Provenance_Platform_Spec_v1.0.md` | Platform principle for immutable event provenance |
| `INHEIRA_Canonical_Restoration_Plan_v1.0.md` | Restoration plan used before the Phase 1–4 rebuild |
| `README.md` | Index of the specs directory |

## Memory / product documentation (`/app/memory/`)

| File | Purpose |
|---|---|
| `PRD.md` | Complete product requirements + phase-by-phase history |
| `PLATFORM_REVIEW.md` | Full end-of-Phase-4 audit with prioritized backlog |
| `test_credentials.md` | Test account creds for QA + testing agent |
| `v1.0/SNAPSHOT.md` | This preservation snapshot — top-level index |
| `v1.0/ROUTES.md` | Frontend + backend route inventory |
| `v1.0/COMPONENTS.md` | Component inventory |
| `v1.0/SCHEMA.md` | MongoDB schema snapshot |
| `v1.0/API.md` | REST endpoint inventory |
| `v1.0/DESIGN_SYSTEM.md` | Palette, typography, patterns, cinematic components |
| `v1.0/FEATURES.md` | Feature inventory |
| `v1.0/FILE_STRUCTURE.md` | Canonical project tree |
| `v1.0/DEPENDENCIES.md` | Frontend + backend package versions |
| `v1.0/CHANGELOG.md` | Complete change history |
| `v1.0/ARCHITECTURE.md` | System architecture snapshot |
| `v1.0/DOCS_INDEX.md` | This document |
| `v1.0/screenshots/` | Visual archive |

## Test reports (`/app/test_reports/`)

| Iteration | Milestone |
|---|---|
| `iteration_3.json` | Pre-Phase-1 baseline |
| `iteration_4.json` | Freeze audit — first pass (85%) |
| `iteration_5.json` | Freeze retest after palette + mobile fixes (92%) |
| `iteration_6.json` | **Freeze GREEN (100%)** — v1.0 frozen |

## Reading order for a new maintainer
1. `memory/v1.0/SNAPSHOT.md` — orient
2. `memory/v1.0/FEATURES.md` — understand what v1.0 does
3. `memory/v1.0/DESIGN_SYSTEM.md` — understand the aesthetic contract
4. `memory/v1.0/ARCHITECTURE.md` — understand the topology
5. `memory/v1.0/API.md` + `memory/v1.0/SCHEMA.md` — understand the data
6. `memory/v1.0/ROUTES.md` + `memory/v1.0/FILE_STRUCTURE.md` — understand the code layout
7. `memory/PRD.md` — read the phase history to understand how v1.0 was reached
8. `docs/*_v1.0.md` — read the canonical specs for the deeper vision (CEI, Provenance, DNA, Interpretation Framework, Ecosystem Architecture)
