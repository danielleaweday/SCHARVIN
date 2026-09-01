# ANCRID™ Technical Specification v1.0

**Document:** `ANCRID-TS-1.0` · **Module role:** Creator Identity · Passport™ · Portfolio Score · **Status:** design-complete prototype (source of truth for identity across the ecosystem)

---

## 1. Executive Overview
**Purpose.** ANCRID is the identity system of the ANCR ecosystem. It owns every creator's verified professional identity — profile, skills, portfolio score, Creator Mobility™, and the Professional Booking Packet™ — and provides SSO to every other module.
**Business objective.** Give each creator a portable, verifiable identity that they take from CCDP to the industry.
**Personas.** Every persona (Student, Faculty, Industry Pro, Admin).
**Success criteria.** ANCRID is the single sign-on; every module reads/writes to ANCRID; a Booking Packet is a first-class shareable object.

## 2. PRD
**Functional.** Identity + verification (email, biometric-lite), profile, skills catalog (verified per skill), Portfolio Score (computed), Creator Mobility™ (regions cleared), Professional Booking Packet™ (auto-assembled artefact), verifier endpoints for external orgs.
**User stories.** *As a student*, I want a QR code employers can scan to verify me. *As a publisher*, I want to verify a signed recommendation against ANCRID's key.
**Permissions.** Owner R/W; other modules R (via events); Admin R/W.
**Workflows.** Onboarding → identity verified → skills catalogued → score computed → Booking Packet issued → sharable link.
**Edge cases.** Multiple identities merged; deletion right-to-be-forgotten; disputed skill verifications.
**Acceptance.** Every JWT issued signs against a rotating key set; Booking Packet is a versioned artefact.

## 3. Technical Architecture
**Frontend.** `ModuleShell` at `/module/ANCRID` — Passport card, Verifications grid, Booking Packet CTA, Creator Mobility panel.
**Backend.** FastAPI + Mongo; **KMS** for signing keys; **OIDC provider** (Ory/Keycloak or in-house).
**Auth.** ANCRID issues JWT for the ecosystem. Public JWKS at `/well-known/jwks.json`. RS256 with 90-day rotation.
**Score computation.** Async job — consumes `session.completed`, `review.signed`, `song.mastered`, `royalty.received` events; recomputes on each.
**Auth flow.** Standard OIDC authorisation-code + refresh token.

## 4. Database Schema
```
creators        { ancrid, handle, display_name, avatar, cohort, concentrations[],
                  portfolio_score, graduation_readiness, mobility[], roles[],
                  booking_packet_version, created_at, updated_at }
skills          { ancrid, name, level, verified_by:ancrid, verified_at }
sessions_auth   { id, ancrid, ip, ua, issued_at, expires_at }
booking_packets { version, ancrid, assembled_at, artefact_uri, hash, signature }
audit           { ts, actor, subject, verb, module, correlation_id }
score_history   { ancrid, ts, score, delta, reason }
```
Indexes: `creators {handle}` unique, `sessions_auth {ancrid, expires_at}`, `audit {subject, ts}`.

## 5. API Documentation
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/ancrid/creators/{ancrid}` | GET | Public profile |
| `/api/ancrid/me` | GET | Own record (authenticated) |
| `/api/ancrid/me/skills` | GET/POST | Skill catalogue |
| `/api/ancrid/me/booking-packet` | POST | Assemble a new version |
| `/api/ancrid/verify/{signature_id}` | GET | External verifier (public) |
| `/oidc/authorize` `/oidc/token` `/oidc/userinfo` | | Standard OIDC endpoints |
| `/well-known/jwks.json` | GET | Public JWKS |

Errors: `401` unauthenticated, `403` forbidden, `409` duplicate handle.

## 6. UI Specification
Passport card (avatar + verifications + QR). Verifications grid (identity/skills/portfolio/copyright/financial/mobility). Booking Packet card with `Send Packet` CTA. Creator Mobility panel. Ecosystem Launcher.
Empty: freshly created identity shows "welcome" state. Loading: skeleton. Error: toast.
A11y: QR has alt text; verify buttons keyboard-reachable.

## 7. Component Inventory
`PassportCard`, `VerificationCell`, `BookingPacketCard`, `MobilityPanel`, `SkillTag`.

## 8. Business Rules
- ANCRID handles are lowercase, unique, immutable once verified.
- Portfolio score recomputation is idempotent and reproducible from `score_history`.
- Booking Packet is versioned and signed; older versions can be revoked.
- Verifications are attested by another `ancrid`; self-attestation not accepted for score.
- Right-to-be-forgotten cascades a tombstone event through the bus; other modules preserve `ancrid` reference but redact PII.

## 9. Ecosystem Integration
- **ALL modules** verify JWTs against ANCRID.
- **ANCRA** reads: score, readiness, mobility. Writes: `session.completed`.
- **COHEIR** writes `review.signed` and `recommendation.signed`.
- **ANCRLAB** writes: skills verified (e.g., "Mix Engineering").
- **ANCRSync** writes: `chemistry` (soft signal).
- **INHEIRA** writes: verified splits (feed authorship signal).
- **Vaulta** writes: `royalty.received` (financial readiness).
- **ANCRLaunch** reads: readiness + Booking Packet.
- **ANCRVIEW / ANCRWAV** attach media to Booking Packet.

## 10. Security
- OIDC + PKCE.
- JWT rotation 90d, revocation list published.
- Refresh tokens rotated per use.
- Rate limits: 5 login attempts / IP / minute; verify endpoint 30 rpm.
- Encryption at rest (Mongo) and in transit (TLS 1.3).
- KMS-backed signing keys; never in application memory beyond a minute.
- Audit log immutable (append-only + retention 12 months).
- Privacy controls: data export, targeted deletion.

## 11. Testing
- Contract: JWT verification against JWKS.
- Integration: score recompute after event stream.
- Security: OWASP ASVS L2 baseline.
- Known limitations (v1.0): OIDC not implemented — role switch via localStorage.

## 12. Deployment
Env: `MONGO_URL`, `KMS_KEY_ID`, `OIDC_ISSUER`, `SESSION_KEY`. Services: FastAPI + Mongo + KMS + Redis (sessions). Blue/green.

## 13. Production Readiness
Completed: Passport card, Verifications grid, Booking Packet UI, Mobility, Ecosystem Launcher.
Remaining: OIDC issuer, JWKS endpoint, score compute pipeline, packet assembly job, external verify endpoint.
Mocked: all verifications, packet artefact, mobility.

## 14. Roadmap
- **MVP** — visual prototype.
- **Phase 2** — OIDC issuer + JWT to ANCRA.
- **Phase 3** — score pipeline + Booking Packet assembly.
- **Production** — external verifier + PDF/JSON-LD packet + KMS rotation.
- **Enterprise** — SCIM provisioning + white-label per institution.

## 15. ADR
1. RS256 with JWKS — industry standard, easy for external verifiers.
2. Score is derived + versioned — auditability without freezing recomputation.
3. Booking Packet is signed + immutable per version — trust anchor for external orgs.
4. Right-to-be-forgotten preserves the `ancrid` FK but redacts PII — protects ecosystem integrity while honouring user privacy.

## 16. Handoff
ANCRID is the **most important module to build first**. Every other module depends on it. Do OIDC + JWKS + `Creator` schema first; everything else is layered on. Do not cut corners on key management.
