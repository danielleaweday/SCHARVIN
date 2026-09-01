# INHEIRA™ Technical Specification v1.0

**Document:** `INHEIRA-TS-1.0` · **Module role:** Songs · Splits · Publishing · Copyright · **Status:** design-complete prototype

---

## 1. Executive Overview
**Purpose.** INHEIRA is the registry layer — every song a creator produces is registered here with authorship, splits, ownership, and a copyright certificate. It is the single source of truth for publisher inquiries and royalty flow into Vaulta.
**Business objective.** Give students professional-grade publishing infrastructure from day one.
**Personas.** Student (writer), Co-writer, Faculty (verifier), Publisher (external, view-only).
**Success criteria.** Any mastered song can go from ANCRLAB → registered in INHEIRA with a copyright certificate in under 90 seconds.

## 2. PRD
**Functional.** Song registration, split proposals, split verification, copyright certificate issuance, publisher inquiry inbox, publishing readiness dashboard, split-flow visualisation.
**User stories.** *As a writer*, I want to register "Cathedral in July" with a 60/40 split. *As a co-writer*, I want to accept or renegotiate the split. *As a publisher*, I want to verify authorship.
**Permissions.** Song owner initiates; every listed co-writer must accept for verification; Faculty read; Publisher (external) view-only via verify link.
**Workflows.** Song emitted from ANCRLAB → draft splits → co-writers verify → certificate issued → Vaulta royalty channel active.
**Edge cases.** Co-writer never accepts; retro splits after release; sample clearance.
**Acceptance.** Splits must sum to 100.00%; certificate is cryptographically signed.

## 3. Technical Architecture
**Frontend.** `ModuleShell` at `/module/INHEIRA` — songs catalogue, split flow visualisation, publisher inquiry inbox.
**Backend.** FastAPI + Mongo; KMS for certificates; event subscriber to `song.mastered` from ANCRLAB.
**Data flow.** ANCRLAB → `song.mastered` → INHEIRA creates draft → notifications to co-writers via ANCRSync → verification → certificate → `split.verified` event.
**Auth.** JWT + song-level ACL.

## 4. Database Schema
```
songs           { id, title, owner_ancrid, status:"draft"|"verifying"|"registered"|"released",
                  splits:[{ancrid,pct,accepted:bool,accepted_at}], created_at }
certificates    { id, song_id, uri, hash, signature, issued_at }
publisher_inq   { id, song_id, publisher_org, contact, state:"open"|"in_conv"|"closed" }
```
Indexes: `songs {owner_ancrid, status}`, `certificates {song_id}`.

## 5. API Documentation
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/inheira/songs` | GET/POST | List/register |
| `/api/inheira/songs/{id}` | GET/PATCH | Song detail |
| `/api/inheira/songs/{id}/splits` | POST | Propose/update splits |
| `/api/inheira/songs/{id}/verify` | POST | Co-writer accept |
| `/api/inheira/songs/{id}/certificate` | POST | Issue after verification |
| `/api/inheira/inquiries` | GET/POST | Publisher inbox |
| `/verify/{cert_id}` | GET | Public certificate verifier |

Errors: `422` splits do not sum to 100.00%; `409` certificate already issued.

## 6. UI Specification
Cinematic hero → "Register a song" / "Issue certificate". Stat row (Registered · Publisher inquiries · Splits verified · YTD royalties). Song grid (4-up cards with status chip + split + certificate state). Split-flow 5-step timeline. AIAH publishing card. Ecosystem Launcher.

## 7. Component Inventory
`SongCard`, `StatChip`, `SplitFlowStep`, `PublisherInquiryRow`, `CertificateBadge`.

## 8. Business Rules
- Splits precision: two decimals; total must equal 100.00%.
- A song cannot enter `released` state without certificate.
- Co-writers must each accept within 30 days or split reverts to owner.
- Retro splits require unanimous re-acceptance.

## 9. Ecosystem Integration
- **ANCRLAB.** Subscribes to `song.mastered`.
- **ANCRSync.** Notifies co-writers; can auto-populate splits from chemistry stats.
- **ANCRID.** Splits and certs feed Portfolio Score.
- **Vaulta.** `split.verified` opens royalty channel.
- **ANCRWAV.** Only released-certificate songs can distribute.
- **COHEIR.** Publisher inquiries route via COHEIR intros.

## 10. Security
- Certificate signature: Ed25519 by KMS.
- Public verify URL rate-limited (10 rpm/IP).
- Splits mutations audit-logged with `ancrid` actor.
- No PII outside owner + co-writers.

## 11. Testing
- Property: splits sum invariant across many mutations.
- Integration: `song.mastered` → draft → verify → cert.
- Load: 10k songs / user.

## 12. Deployment
Env: `MONGO_URL`, `KMS_KEY_ID`, `EVENT_BUS_URL`, `ANCRID_JWKS_URL`.

## 13. Production Readiness
Completed: registered-songs catalogue, split-flow visual, publisher inquiry card, AIAH card.
Remaining: real registration flow, split acceptance UI, certificate issuance, publisher verifier endpoint.
Mocked: all splits, all certificates, all inquiries.

## 14. Roadmap
- **MVP** — visual prototype.
- **Phase 2** — song CRUD + split proposals.
- **Phase 3** — certificate KMS + public verifier.
- **Production** — publisher CRM inbox + Vaulta royalty pipeline.
- **Enterprise** — international rights registration (BMI/ASCAP/PRS).

## 15. ADR
1. Percent as fixed-point (bp = basis points, int 0..10000) — avoid float drift.
2. Certificate is a JSON-LD envelope with signature — enables external verifiers.
3. INHEIRA is authoritative for song identity — every other module holds `song_id` FK.

## 16. Handoff
The invariants (splits = 100.00%, cert-required-for-release) are the whole product. Encode them at the database + API layer, not just the UI. Publisher verifier endpoint will be one of the most reputation-critical URLs in the ecosystem.
