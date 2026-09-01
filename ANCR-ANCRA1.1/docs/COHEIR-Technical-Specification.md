# COHEIR™ Technical Specification v1.0

**Document:** `COHEIR-TS-1.0` · **Module role:** Mentorship & Industry (working professionals inside the ecosystem) · **Status:** design-complete prototype

---

## 1. Executive Overview
**Purpose.** COHEIR is the mentorship layer connecting students with faculty, executives-in-residence, artists-in-residence, adjuncts, and external industry professionals. It hosts live industry sessions, office-hours booking, portfolio critiques, and signed recommendations.
**Business objective.** Institutionalise access to industry — every ANCR creator has a working professional on their team.
**Personas.** Student · Faculty · Artist in Residence · Executive in Residence · Adjunct · Industry Pro (guest).
**Success criteria.** A student can book a 1:1 with a working A&R inside 5 minutes; a faculty rec letter arrives at Sony signed and verified via ANCRID.

## 2. PRD
**Functional.** Live industry sessions (RSVP + livestream to ANCRVIEW), office-hours calendars, mentor reviews (signed), signed recommendations (letters), portfolio critiques (live panels), residents & adjuncts directory.
**User stories.** *As a student*, I want to book Prof. Bloom Thursday 15:00. *As faculty*, I want to sign a recommendation for Ava that Sony can verify.
**Permissions.** Students can request; Faculty/Pros can accept + sign; Admin manages catalog.
**Workflows.** Session → RSVP → attend → recording to ANCRVIEW; recommendation → draft → sign → target.
**Edge cases.** Double-booking, no-shows, panel with mixed roles.
**Acceptance.** Signature is cryptographically verifiable via ANCRID public key.

## 3. Technical Architecture
**Frontend.** `ModuleShell` at `/module/COHEIR`. Tabs: Live Industry Sessions · Office Hours · Mentor Reviews · Recommendations · Portfolio Critiques · Residents & Adjuncts.
**Backend.** FastAPI + Mongo; **Ed25519** signing via ANCRID KMS for recommendation letters; livestream out via ANCRVIEW.
**Folder.** `/frontend/src/pages/modules/COHEIR.jsx` + `/pages/hubs/COHEIRSuite.jsx` inside ANCRA.
**Data flow.** Booking → Mongo → calendar sync to ANCRA. Signed rec letter → KMS → verifiable JSON.
**State.** SWR.
**Auth.** JWT + `role ∈ {faculty, air, eir, adjunct, industry_pro}` for sign actions.

## 4. Database Schema
```
pros            { ancrid, role:"air"|"eir"|"adjunct"|"faculty"|"guest", specialization, office_hours[] }
sessions        { id, title, guest_ancrid, when, kind:"master"|"industry"|"critique", live:bool, ancrview_ref? }
bookings        { id, pro_ancrid, student_ancrid, slot, purpose, state }
reviews         { id, pro_ancrid, student_ancrid, artefact_ref, notes, signature, signed_at }
recommendations { id, pro_ancrid, student_ancrid, target, letter_uri, signature, state:"draft"|"signed"|"sent" }
critiques       { id, panel:[ancrid], student_ancrid, work_ref, when, notes[] }
```
Indexes: `bookings {pro_ancrid, slot}`, `recommendations {student_ancrid}`.

## 5. API Documentation
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/coheir/pros` | GET | Directory |
| `/api/coheir/sessions` | GET/POST | Sessions + RSVP |
| `/api/coheir/bookings` | POST | Book office hour |
| `/api/coheir/reviews` | POST | Sign a review |
| `/api/coheir/recommendations` | POST/PATCH | Draft/sign/send letter |
| `/api/coheir/critiques` | GET/POST | Portfolio panels |

Errors: `403` role-gated; `409` slot taken; `422` unsigned recommendation cannot be sent.

## 6. UI Specification
Cinematic hero. Tab strip below sticky. Cards for sessions (with live pulse). Office-hour slot grid. Signed-recommendation rows. Reused `ModuleShell` + `EcosystemLauncher`.

## 7. Component Inventory
`SessionCard`, `SlotGrid`, `RecommendationRow`, `CritiquePanelCard`, `ProCard`. All layout-consistent with ANCRA.

## 8. Business Rules
- Only `pro` roles can sign reviews / recommendations.
- Recommendations are immutable once signed; a new letter must be drafted for changes.
- Live sessions must be linked to ANCRVIEW for recording (unless "private").

## 9. Ecosystem Integration
- **ANCRID.** Signatures use ANCRID keys; verifier is ANCRID's public JWKS.
- **ANCRA.** Feedback + reviews rendered in ANCRA Reviews/Approvals.
- **ANCRLAB.** Critique artefacts point to ANCRLAB masters.
- **INHEIRA.** Publisher intros routed through COHEIR.
- **ANCRVIEW.** Session recordings archived.
- **ANCRLaunch.** Signed recommendations improve placement.

## 10. Security
- Signature envelope: `Ed25519(sha256(letter_body))`.
- All bookings enforce role check on `pro_ancrid`.
- Rate limit on RSVPs: 30/day/user.
- Audit trail on every signed artefact.

## 11. Testing
- Contract: signature verify round-trip.
- Integration: booking → calendar sync → attendance.
- Known limitations (v1.0): all sessions/bookings/pros are seeded static.

## 12. Deployment
Env: `MONGO_URL`, `ANCRID_JWKS_URL`, `ANCRVIEW_INGEST_URL`, `KMS_KEY_ID`. Services: FastAPI + Mongo + KMS.

## 13. Production Readiness
Completed: full tabbed suite (sessions, office hours, reviews, recs, critiques, residents).
Remaining: signature pipeline, real bookings, ANCRVIEW ingest, letter PDF renderer.
Mocked: signatures, letter authoring.

## 14. Roadmap
- **MVP** — design prototype.
- **Phase 2** — real bookings + calendar sync.
- **Phase 3** — signature pipeline + PDF renderer.
- **Production** — ANCRVIEW recording ingest.
- **Enterprise** — external verifier API (labels/publishers can verify).

## 15. ADR
1. Ed25519 signatures — small, fast, standards-based.
2. Signed artefacts immutable — protects trust guarantee.
3. Directory is denormalised — read-heavy.

## 16. Handoff
The trust anchor of the module is signatures. Do that piece with extreme care and get it audited before shipping. Everything else is CRUD.
