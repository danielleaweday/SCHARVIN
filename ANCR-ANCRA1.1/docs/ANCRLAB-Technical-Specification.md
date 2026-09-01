# ANCRLAB™ Technical Specification v1.0

**Document:** `ANCRLAB-TS-1.0` · **Module role:** Creative Studio (physical rooms + browser DAW + versioned stems) · **Status:** design-complete prototype

---

## 1. Executive Overview
**Purpose.** ANCRLAB is the studio layer where creative work actually gets made: physical rooms are booked, a browser DAW composes sessions, stems are versioned, and every mastered song exits into INHEIRA and ANCRWAV.
**Business objective.** Replace the fractured stack of DAW + booking + file-storage tools with a single ANCR-native studio.
**Personas.** Student · Faculty (session leader) · Adjunct producer · Studio manager (admin).
**Success criteria.** A student books a room, records, versions stems, and exports to INHEIRA in one uninterrupted flow.

## 2. PRD
**Functional.** Room booking (Studio A/B/Live), browser DAW (multi-track timeline + master bus meter), project versioning, stem uploads, collaborator invites, one-click "Export to INHEIRA™".
**User stories.** *As a student*, I want to see which rooms are free right now. *As faculty*, I want to review every take a student has recorded this week. *As producer*, I want to open a session and drop a stem.
**Permissions.** Student R/W own projects; Faculty R student projects; Admin R/W all.
**Workflows.** Book room → record → version stem → open in ANCRSync for critique → master → export → INHEIRA.
**Edge cases.** Concurrent room booking; session recovery after browser crash; large stem uploads (>500 MB).
**Acceptance.** Studio availability updates < 5 s; DAW can hold 24 tracks; export emits `song.mastered` event.

## 3. Technical Architecture
**Frontend.** React `ModuleShell` at `/module/ANCRLAB`. Pages: hub, room booking, project list, session view. Uses `EcosystemLauncher`, `CommandPalette`.
**Backend (target).** Python FastAPI + Mongo for metadata; **S3-compatible object store** for stems (versioned buckets); **WebAudio/WebMIDI + WebRTC** for DAW frontend.
**Folder.** Frontend: `/frontend/src/pages/modules/ANCRLAB.jsx`. Future backend: `/backend/services/ancrlab/`.
**Data flow.** Client (DAW) → chunked upload to object store → project doc updated in Mongo → event `stem.uploaded` published.
**State.** SWR for project lists; local WebAudio graph state; presence via WebSocket.
**API.** REST for CRUD; WebSocket `/ws/ancrlab/session/{id}` for realtime.
**Auth.** JWT (ANCRID); scoped `ancrlab:*` claims.
**Error.** Fallback to auto-save every 15s; reconciled server-side on reconnect.
**Logging.** Session events logged with `session_id` + `ancrid` correlation.

## 4. Database Schema (target)
```
studios       { id, name, capacity, equipment[], bookings[] }
rooms_bookings{ id, studio_id, ancrid, start, end, purpose, state }
projects      { id, ancrid_owner, title, kind, cover, collaborators[ancrid], updated_at }
sessions      { id, project_id, started_at, ended_at, snapshot_ref }
stems         { id, project_id, name, version, uri, size, sha256, kind, uploaded_by }
masters       { id, project_id, version, uri, lufs, sample_rate, exported_to[] }
```
Indexes: `bookings {studio_id, start}`, `stems {project_id, version}`, `projects {ancrid_owner}`.

## 5. API Documentation
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/ancrlab/studios` | GET | Room list + today's availability |
| `/api/ancrlab/bookings` | POST | Book a room `{studio_id,start,end}` |
| `/api/ancrlab/projects` | GET/POST | List/create projects |
| `/api/ancrlab/projects/{id}` | GET/PATCH | Project detail |
| `/api/ancrlab/projects/{id}/stems` | POST | Upload stem (multipart) |
| `/api/ancrlab/projects/{id}/master` | POST | Emit `song.mastered` + create Master |
| `/ws/ancrlab/session/{id}` | WS | Realtime DAW presence + control messages |

Errors: `409` concurrent booking, `413` stem too large, `422` invalid kind.

## 6. UI Specification
Cinematic hero → "Open the DAW" / "Upload stems". Live room activity (3 cards). Projects grid (aspect 16/10). DAW mock: track list · timeline · master bus. AIAH card advising LUFS. All screens use `ModuleShell` for identical chrome.
Empty: "No projects yet — book a room to begin." Loading: skeleton cards. Error: sonner toast.
A11y: color contrast on LUFS meter; drag handles have `aria-grabbed`.

## 7. Component Inventory
`RoomCard`, `ProjectTile`, `TrackListPanel`, `TimelineLane` (waveform bars), `MasterBusPanel`, `StemUploader`. Reusable: `StemUploader` (also usable in Grading).

## 8. Business Rules
- Only one booking per user per room per hour.
- Master can only be created from a project with ≥1 stem marked `role=vocal` **or** the project kind ≠ `song`.
- `song.mastered` event includes `lufs` and `sample_rate`; INHEIRA rejects if missing.

## 9. Ecosystem Integration
- **ANCRID.** All ownership by `ancrid`.
- **ANCRA.** Assignment kind `ancrlab` links to a specific project.
- **ANCRSync.** "Invite to critique" opens ANCRSync room with stem attached.
- **INHEIRA.** `song.mastered` triggers registration; project id becomes `Song.linked_projects[i]`.
- **COHEIR.** Faculty review references the master URI.
- **Vaulta.** Master metadata feeds royalty ledger.
- **ANCRWAV.** One-click release from Master.
- **ANCRVIEW.** Live session can be streamed.

## 10. Security
- Signed URLs (5 min TTL) for stem downloads.
- Content-hash (sha256) verified on upload.
- Rate limit: 20 uploads / hour / user.
- Rooms booking requires `ancrid.mobility` check for external users.

## 11. Testing
- Unit: hash validator, booking overlap algorithm.
- Integration: full round-trip from upload → master → INHEIRA registration.
- Load: 500 concurrent DAW sessions.
- Known limitations (v1.0): no real DAW engine — visual mock only.

## 12. Deployment
Env vars: `MONGO_URL`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `ANCRID_JWKS_URL`.
Services: FastAPI + Mongo + S3 + Redis (session locks). Rollback: prior tag redeploy.

## 13. Production Readiness
Completed: cinematic module page, room activity, projects grid, DAW visualization, AIAH card, Ecosystem Launcher.
Remaining: real DAW engine, real bookings/persistence, stem upload pipeline, WebSocket presence.
Mocked: all DAW audio, all persistence, master export.
Debt: mock timelines don't preserve state on reload.

## 14. Roadmap
- **MVP** — design prototype.
- **Phase 2** — real bookings + stem uploads (Mongo + S3).
- **Phase 3** — browser DAW engine (WebAudio) + presence.
- **Production** — collaborator ACLs, HDR waveforms, latency-optimised streaming.
- **Enterprise** — external studio integrations (Pro Tools, Logic sync).

## 15. ADR
1. Object store (S3) for stems, not Mongo GridFS — cheaper, CDN-friendly.
2. Sha256 content hashing — dedupe stems across teams.
3. WebSocket over long-poll — required for DAW presence.
4. LUFS enforcement at master export — protects downstream INHEIRA + ANCRWAV.

## 16. Handoff notes
The design prototype defines the visual + interaction language. Engineering priorities: (1) booking persistence, (2) stem upload pipeline, (3) master export event contract. Do **not** try to build the DAW engine before (1) and (2) are stable.
