# ANCRSync™ Technical Specification v1.0

**Document:** `ANCRSYNC-TS-1.0` · **Module role:** Collaboration (writing rooms + teams + timestamped critique) · **Status:** design-complete prototype

---

## 1. Executive Overview
**Purpose.** ANCRSync provides the realtime collaboration layer — writing rooms, production collectives, timestamped audio critique, and session recording — that auto-feeds ANCRID chemistry signals and INHEIRA splits.
**Business objective.** Replace Slack + Discord + Splice for creative teams.
**Personas.** Student, Faculty, Industry Pro (guest), Adjunct.
**Success criteria.** Two students can co-write a chorus in a room, drop timestamped notes on a shared audio, and have splits auto-drafted in INHEIRA.

## 2. PRD
**Functional.** Rooms (writing / production / cross-cohort); realtime chat + threads; audio playback + timestamped comments; live session recording (into ANCRVIEW); split auto-draft.
**User stories.** *As a student*, I want to invite Ava into a Writing Room. *As faculty*, I want to observe (not participate) a cohort's live session.
**Permissions.** Owner sets room privacy (open/cohort/invite). Faculty always has audit read.
**Workflows.** Create room → invite → collaborate → record → INHEIRA split proposal.
**Edge cases.** Concurrent typing indicators; audio buffer sync; late joiner catch-up.
**Acceptance.** Message latency < 400 ms p95; audio comments accurate to ±100 ms.

## 3. Technical Architecture
**Frontend.** `ModuleShell` at `/module/ANCRSync`. Rooms list + thread view.
**Backend.** FastAPI + Mongo for messages; **Redis pub/sub** for realtime fanout; **LiveKit** (or equivalent) for audio sync.
**Folder.** `/frontend/src/pages/modules/ANCRSync.jsx`; future `/backend/services/ancrsync/`.
**Data flow.** Client → WebSocket → Redis channel → all room subscribers. Persistence async to Mongo.
**State.** SWR for rooms; WebSocket-driven local reducer for messages.
**Auth.** JWT + per-room ACL check.
**Error.** Message resend queue; audio reconnect back-off.
**Logging.** Room events with `room_id`, `ancrid`.

## 4. Database Schema
```
rooms         { id, name, kind, privacy, project_ref, created_by, members[ancrid], chemistry:int }
messages      { id, room_id, ancrid, kind:"text"|"audio_stamp"|"ai", body, ts_ms?, created_at }
sessions      { id, room_id, started_at, ended_at, recording_uri? }
splits_drafts { id, room_id, song_id, proposals:[{ancrid,pct}], accepted:bool }
```
Indexes: `messages {room_id, created_at}`, `rooms {members: 1}`.

## 5. API Documentation
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/ancrsync/rooms` | GET/POST | List/create rooms |
| `/api/ancrsync/rooms/{id}` | GET/PATCH | Room detail |
| `/api/ancrsync/rooms/{id}/messages` | GET/POST | History / send |
| `/ws/ancrsync/{room_id}` | WS | Realtime channel |
| `/api/ancrsync/rooms/{id}/split_draft` | POST | Propose splits |

Errors: `403` not a member; `409` split draft already open.

## 6. UI Specification
Cinematic hero → New Writing Room / Join active. Left: room list with live badges. Right: thread with `me/other/ai` bubble variants. Composer at bottom.
Empty: "No rooms yet — create one." Loading: bubble skeleton. Error: toast.
A11y: message list is a `role=log`; audio stamps announce time.

## 7. Component Inventory
`RoomCard`, `Thread`, `MessageBubble` (variants), `AudioStampInput`, `SplitDraftPanel`. Reusable: `MessageBubble` in COHEIR mentor chat, in AIAH panel.

## 8. Business Rules
- Only room members can post.
- `chemistry` score = f(msgs, distinct authors, duration). Written back to ANCRID.
- Split drafts must sum to 100%.

## 9. Ecosystem Integration
- **ANCRID.** Room chemistry becomes a soft-signal on ANCRID.
- **ANCRA.** `session.completed` event fires when session ends.
- **ANCRLAB.** Rooms can attach a project; audio comes from ANCRLAB.
- **INHEIRA.** Split drafts auto-created on song emission.
- **COHEIR.** Faculty observer role.
- **ANCRVIEW.** Recorded sessions land here.

## 10. Security
- Rooms private by default.
- Audio streams DTLS-SRTP.
- Rate limit: 60 msgs/min/user.
- E2E encryption planned for Enterprise.

## 11. Testing
- Contract: split sum invariant.
- Integration: realtime fanout under 3-region simulated latency.
- Load: 200 concurrent rooms × 5 users.
- Known limitations (v1.0): no realtime — thread is static.

## 12. Deployment
Env vars: `MONGO_URL`, `REDIS_URL`, `LIVEKIT_URL`, `ANCRID_JWKS_URL`.
Services: FastAPI + Mongo + Redis + LiveKit. Blue/green.

## 13. Production Readiness
Completed: visual module page (rooms + thread + composer), AIAH message variant, chemistry bar.
Remaining: realtime engine, ACLs, audio comments, split-draft flow.
Mocked: entire message stream; chemistry number is static per room.
Debt: no per-message DB persistence in v1.

## 14. Roadmap
- **MVP** — visual prototype.
- **Phase 2** — Mongo persistence + WebSocket text.
- **Phase 3** — audio timestamped comments + LiveKit rooms.
- **Production** — split-draft flow + INHEIRA hand-off.
- **Enterprise** — E2E encryption + observer roles.

## 15. ADR
1. Redis pub/sub for fanout — dead simple horizontal scale.
2. LiveKit for audio — WebRTC-native, low latency.
3. Chemistry as a stat, not an event — it's derived, not authoritative.

## 16. Handoff
Realtime is the hard part. Persistence, ACL, and event-emission come first; realtime can be layered on. Do not attempt audio-stamp features before message basics are stable.
