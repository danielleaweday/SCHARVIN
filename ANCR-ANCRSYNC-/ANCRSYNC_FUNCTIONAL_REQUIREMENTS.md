# ANCRSync™ Functional Requirements

## 0. Document Control

| Field | Value |
|---|---|
| Document ID | `ANCRSYNC-FR-1.0` |
| Product | ANCRSync™ |
| Parent platform | CCDP™, powered by ANCR™ |
| Document type | Canonical functional-requirements source |
| Version | 1.0 (draft baseline) |
| Status | Specification-derived; pending product-owner validation and implementation verification |
| Prepared | 2026-09-03 |
| Intended audience | Product, design, architecture, engineering, security, privacy, QA, and delivery |
| Requirement ID pattern | `REQ-ANCRSYNC-###` |

### 0.1 Authoritative source set

| Source ID | Source | Evidence used |
|---|---|---|
| `PS` | `ANCRSync_Product_Specification_v1_0 (1) (1).pdf` | v1.0, pp. 1–9; product purpose, ownership, navigation, functional areas, integrations, authentication, design language, engineering notes, and roadmap |
| `WF` | `ANCRSYNC_Workflow.pdf` | pp. 1–2; entry flow, primary areas, AIAH capabilities, ecosystem connections, verified-history write-back, and ownership boundaries |
| `TS` | `../ANCR-ANCRA1.1/docs/ANCRSync-Technical-Specification.md` | v1.0, §§1–16; narrower room/message/audio/split design, permissions, acceptance targets, security expectations, proposed interfaces, and stated prototype limitations |

The product PDF is the canonical product reference. The workflow PDF clarifies the end-to-end module role. The technical specification is supporting design evidence; where it is narrower or describes a future architecture, this document does not silently promote that material to verified implementation behavior.

### 0.2 Requirement interpretation

- Every requirement below is **SPEC-DERIVED** and **NOT IMPLEMENTATION-VERIFIED**.
- `P0`, `P1`, and `P2` reflect the product specification's engineering-roadmap priorities. `Unassigned` means the source defines the behavior but does not assign a delivery phase.
- Given/When/Then statements define testable intent, not evidence that a test or implementation exists.
- Product names, ownership boundaries, and trademarked labels are retained where they identify an authoritative ecosystem capability.
- No requirement is marked implemented, passed, covered, production-ready, or compliant.

## 1. Product Boundary and Entry

### REQ-ANCRSYNC-001 — Collaboration purpose

**Given** a verified creator needs to collaborate remotely, **when** the creator enters ANCRSync™, **then** the product shall provide a unified creative-collaboration environment spanning shared workspaces, creative studios, writing rooms, messaging, and live sessions.

**Source:** `PS` p. 2 §01. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-002 — ANCRID-only authentication

**Given** a user has authenticated through ANCRID™, **when** the user selects ANCRSync™ from the ANCR™ ecosystem, **then** ANCRSync™ shall admit the user without a second login.

**Source:** `PS` p. 7 §10; `WF` p. 1. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-003 — Inherited identity and permissions

**Given** an authenticated user enters ANCRSync™, **when** identity or authorization is evaluated, **then** ANCRSync™ shall use identity and permissions inherited from ANCRID™ rather than create an independent identity authority.

**Source:** `PS` p. 7 §§09–10; `WF` pp. 1–2. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-004 — Collaboration-only ownership

**Given** a workflow crosses ecosystem modules, **when** ANCRSync™ performs its role, **then** it shall own collaboration workflows only.

**Source:** `PS` p. 7 §12; `WF` p. 2. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-005 — External systems of record

**Given** collaboration requires identity, creative-project, publishing, finance, portfolio, or professional-network data, **when** ANCRSync™ accesses that data, **then** it shall reference the owning ecosystem module and shall not become the system of record for that domain.

**Source:** `PS` pp. 7–8 §§12; `WF` p. 2. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-006 — Supported user populations

**Given** access is provisioned through ANCRID™, **when** an eligible participant uses ANCRSync™, **then** the product shall support students, industry mentors, alumni, faculty, artists in residence, executives in residence, creative teams, institution administrators, and partner organizations.

**Source:** `PS` pp. 2–3 §04. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

## 2. Navigation and Collaboration Entry Points

### REQ-ANCRSYNC-007 — Primary navigation

**Given** a user is inside ANCRSync™, **when** primary navigation is displayed, **then** it shall provide access to Home, Dashboard, Workspaces, Discover, Global Map, Mentorship, Shared Studios, Shared Sessions, Writing Rooms, Messages, Communities, Creative Passport™, AI Intelligence, Notifications, and Settings.

**Source:** `PS` pp. 3–4 §06. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-008 — Immediate workspace entry

**Given** an authenticated user selects ANCRSync™, **when** entry completes, **then** the user shall be able to enter the collaborative workspace experience immediately without an additional authentication step.

**Source:** `WF` pp. 1–2. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-009 — Empty room state

**Given** a user has no available rooms, **when** the room list is displayed, **then** the interface shall present an empty state that invites the user to create a room.

**Source:** `TS` §06. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-010 — Loading and error feedback

**Given** room or thread data is being loaded or fails to load, **when** the interface awaits or cannot obtain the data, **then** it shall show a loading skeleton for the pending state and an error notification for the failure state.

**Source:** `TS` §06. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

## 3. Global Pulse™ and Global Discovery™

### REQ-ANCRSYNC-011 — Global activity pulse

**Given** a user opens Global Pulse™, **when** the view loads, **then** it shall display worldwide creator activity, live institution activity, active collaborations, recent sessions, global time zones, Passport activity, collaboration statistics, and suggested workspaces.

**Source:** `PS` p. 4 §07. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-012 — Global discovery

**Given** a user opens Global Discovery™, **when** discovery results are presented, **then** they shall include institutions, creators, cities, active collaborations, shared studios, communities, and a connection map.

**Source:** `PS` p. 5 §07. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

## 4. Creative Workspaces™

### REQ-ANCRSYNC-013 — Shared project workspace

**Given** collaborators create or enter a Creative Workspace™, **when** they organize work, **then** the workspace shall support shared projects, tasks, and milestones.

**Source:** `PS` p. 4 §07. **Priority:** P0 for workspace persistence; otherwise unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-014 — Workspace discussion and review

**Given** collaborators are working in a Creative Workspace™, **when** they discuss or assess project work, **then** the workspace shall support comments and creative reviews.

**Source:** `PS` p. 4 §07. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-015 — Shared workspace assets

**Given** a project includes collaborative files or media, **when** participants add or access them in a Creative Workspace™, **then** the workspace shall support shared assets.

**Source:** `PS` p. 4 §07 and p. 8 roadmap. **Priority:** P0 (shared asset storage). **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-016 — Workspace version history

**Given** collaborative work changes over time, **when** a participant reviews the Creative Workspace™ history, **then** the product shall provide version history for the work.

**Source:** `PS` p. 4 §07. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-017 — Workspace AI assistance

**Given** collaborators are working in a Creative Workspace™, **when** AI assistance is invoked, **then** the workspace shall support AI suggestions relevant to the collaboration.

**Source:** `PS` p. 4 §07. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-018 — Workspace persistence

**Given** a collaborative workspace has been created or updated, **when** participants leave and later return, **then** the workspace state shall persist.

**Source:** `PS` p. 8 roadmap. **Priority:** P0. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

## 5. Shared Studios™ and Writing Rooms™

### REQ-ANCRSYNC-019 — Creative-discipline studios

**Given** a creative team opens a Shared Studio™, **when** it selects its discipline, **then** the studio shall support songwriting, recording, production, film, photography, animation, podcasting, creative direction, and brand strategy workflows.

**Source:** `PS` p. 4 §07. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-020 — Room kinds

**Given** an authorized creator creates a collaboration room, **when** the room kind is selected, **then** the product shall support writing, production, and cross-cohort room kinds.

**Source:** `TS` §02. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-021 — Real-time writing content

**Given** participants enter a Writing Room™, **when** they co-create written music content, **then** the room shall support real-time lyrics, shared chords, shared arrangements, and voice notes.

**Source:** `PS` p. 4 §07. **Priority:** P1 (collaborative editing). **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-022 — Writing-room collaboration record

**Given** participants collaborate in a Writing Room™, **when** room activity is reviewed, **then** the room shall support comments, a creative timeline, and version history.

**Source:** `PS` pp. 4–5 §07. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-023 — Shared whiteboards

**Given** collaborators need a visual ideation surface, **when** they open a whiteboard in a Writing Room™ or Shared Session™, **then** the product shall provide a shared whiteboard.

**Source:** `PS` pp. 5, 8 §07 and roadmap. **Priority:** P1. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-024 — Presence awareness

**Given** multiple collaborators are active in the same collaborative space, **when** their participation changes, **then** the product shall provide live presence awareness.

**Source:** `PS` pp. 7–8 §§11–12 and roadmap. **Priority:** P0. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-025 — Concurrent-edit conflict handling

**Given** multiple users edit shared content concurrently, **when** their changes conflict, **then** the product shall resolve the conflict without silently discarding collaborative work.

**Source:** `PS` pp. 7–8 §12 and roadmap. **Priority:** P2 for advanced conflict resolution. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-026 — Collaborative autosave

**Given** a participant changes shared collaborative content, **when** the change is accepted by the collaboration surface, **then** the product shall autosave it.

**Source:** `PS` p. 7 §12. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-027 — Late-joiner catch-up

**Given** a participant joins an active room after the session has begun, **when** the room opens, **then** the product shall restore sufficient current room state for that participant to catch up.

**Source:** `TS` §02. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

## 6. Studio Room™ and Shared Sessions™

### REQ-ANCRSYNC-028 — Live media collaboration

**Given** collaborators enter a Studio Room™, **when** a live session begins, **then** the room shall support video conferencing, audio, and screen sharing.

**Source:** `PS` p. 5 §07. **Priority:** P0 (LiveKit production deployment and WebRTC configuration). **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-029 — Live-session controls

**Given** a Studio Room™ session is being organized or conducted, **when** participants enter or present, **then** the room shall support a waiting room and presenter mode.

**Source:** `PS` p. 5 §07. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-030 — Live chat

**Given** a Studio Room™ live session is active, **when** a participant sends a text contribution, **then** the room shall provide live chat to session participants subject to room permissions.

**Source:** `PS` p. 5 §07; `TS` §02. **Priority:** P0 (real-time messaging). **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-031 — Session recording

**Given** an authorized live session is in progress, **when** recording is started and subsequently stopped, **then** the product shall retain a recording reference in the session recording history.

**Source:** `PS` p. 5 §07; `TS` §§02, 04, 09. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-032 — Transcription

**Given** a recorded or live Studio Room™ session contains speech, **when** transcription is enabled, **then** the product shall provide an automatic transcript of the session.

**Source:** `PS` p. 5 §07. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-033 — Session summary

**Given** a live session has sufficient session content, **when** an AI session summary is requested or generated, **then** the product shall provide a session summary and identified action items.

**Source:** `PS` pp. 5–6 §§07–08; `WF` p. 2. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-034 — Global session scheduling

**Given** collaborators need to plan a Shared Session™, **when** the organizer schedules it, **then** the product shall support invitations and time-zone-aware global scheduling.

**Source:** `PS` p. 5 §07. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-035 — Attendance and notes

**Given** a Shared Session™ occurs, **when** the session record is reviewed, **then** the product shall provide attendance and session notes.

**Source:** `PS` p. 5 §07. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

## 7. Creative Review™

### REQ-ANCRSYNC-036 — Media review

**Given** a participant opens an eligible creative asset for review, **when** the review surface loads, **then** it shall support asset, audio, video, and waveform review as applicable to the asset.

**Source:** `PS` p. 5 §07. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-037 — Timestamped comments

**Given** an audio or video asset is open for review, **when** a reviewer posts a time-based comment, **then** the product shall associate the comment with the selected media timestamp and the reviewer's verified identity.

**Source:** `PS` p. 5 §07; `TS` §§01–02, 04. **Priority:** P1 (background media processing is P1; feature phase is otherwise not fixed by `PS`). **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-038 — Timestamp accuracy

**Given** a reviewer submits a timestamped audio comment, **when** the stored comment is replayed against the asset, **then** its timestamp shall be accurate to within plus or minus 100 milliseconds.

**Source:** `TS` §02 acceptance. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-039 — Approval tracking

**Given** a creative asset is under review, **when** an authorized reviewer records a review decision, **then** the product shall track the asset's approval state.

**Source:** `PS` p. 5 §07. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

## 8. Messaging™ and Communities™

### REQ-ANCRSYNC-040 — Direct and channel messaging

**Given** authorized participants need to communicate, **when** they choose a conversation, **then** Messaging™ shall support direct messages and group channels.

**Source:** `PS` p. 6 §07. **Priority:** P0 (real-time messaging). **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-041 — Message collaboration features

**Given** a participant is in a supported conversation, **when** they interact with a message or conversation, **then** Messaging™ shall support file sharing, collaboration requests, reactions, announcements, and read receipts.

**Source:** `PS` p. 6 §07. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-042 — Threads

**Given** a participant needs to respond to a specific conversation item, **when** the participant starts or opens a thread, **then** the product shall associate threaded replies with that originating item.

**Source:** `TS` §02. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-043 — Member posting access

**Given** a user attempts to post in a room, **when** room membership is checked, **then** the product shall accept the post only if the user is a room member.

**Source:** `TS` §08. **Priority:** P0 for ACLs per `TS` production-readiness notes. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-044 — Message delivery latency

**Given** an authorized room member submits a real-time message, **when** delivery latency is measured under the accepted test profile, **then** p95 message latency shall be less than 400 milliseconds.

**Source:** `TS` §02 acceptance. **Priority:** P0. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-045 — Message retry

**Given** a message cannot be delivered because of a transient connection failure, **when** connectivity is interrupted, **then** the product shall retain the message in a resend queue for a subsequent delivery attempt.

**Source:** `TS` §03. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-046 — Communities by practice

**Given** a user opens Communities™, **when** community categories are presented, **then** the product shall support communities for songwriters, producers, film, photography, animation, jazz, hip-hop, faculty, alumni, and creative entrepreneurs.

**Source:** `PS` pp. 5–6 §07. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

## 9. AIAH™ Collaboration Assistance

### REQ-ANCRSYNC-047 — Recommendations and matching

**Given** relevant collaboration and participant context is available, **when** AIAH™ assistance is presented, **then** it shall provide project recommendations, skill matching, and collaboration suggestions.

**Source:** `PS` p. 6 §08; `WF` p. 2. **Priority:** P2 for AI collaboration analytics; otherwise unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-048 — Meeting and session intelligence

**Given** sufficient meeting or session content is available, **when** AIAH™ processes the collaboration, **then** it shall provide meeting summaries, session summaries, and action items.

**Source:** `PS` p. 6 §08; `WF` p. 2. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-049 — Workspace guidance

**Given** a collaborator requests support inside a workspace, **when** AIAH™ responds, **then** it shall provide workspace guidance grounded in the available collaboration context.

**Source:** `PS` p. 6 §08; `WF` p. 2. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-050 — Creative and contribution insights

**Given** collaboration activity is available for analysis, **when** AIAH™ generates collaboration intelligence, **then** it shall provide creative insights and contribution analysis.

**Source:** `PS` p. 6 §08. **Priority:** P2. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

## 10. Collaboration Analytics™ and Verified History

### REQ-ANCRSYNC-051 — Collaboration analytics

**Given** authorized collaboration activity is available, **when** a user opens Collaboration Analytics™, **then** the product shall display active projects, team participation, collaboration hours, session activity, workspace growth, community engagement, and global participation.

**Source:** `PS` p. 6 §07. **Priority:** P2 for AI collaboration analytics; otherwise unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-052 — Verified Passport history

**Given** a meaningful collaboration activity is completed, **when** the activity is recorded for professional history, **then** ANCRSync™ shall write a verified Passport™ event to ANCRID™ rather than maintain a competing professional-history record.

**Source:** `PS` pp. 2, 7–8 §§02, 09, 12; `WF` pp. 1–2. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-053 — Chemistry soft signal

**Given** eligible room collaboration activity can be evaluated, **when** a chemistry signal is derived, **then** ANCRSync™ shall write the room chemistry result to ANCRID™ as a soft signal rather than treat it as authoritative identity data.

**Source:** `TS` §§01, 08–09, 15. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

## 11. Ecosystem Integrations

### REQ-ANCRSYNC-054 — ANCRA™ learning context

**Given** collaboration originates from learning activity, **when** ANCRSync™ needs academic context, **then** it shall consume courses, assignments, and learning-team information from ANCRA™ without assuming ownership of it.

**Source:** `PS` pp. 3, 6–7 §§05, 09; `WF` p. 2. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-055 — ANCRLAB™ project attachment

**Given** collaborators associate a room or workspace with a creative project, **when** project or studio assets are needed, **then** ANCRSync™ shall reference creative projects, DAW sessions/integration, and studio files owned by ANCRLAB™.

**Source:** `PS` pp. 3, 7 §§05, 09; `TS` §09; `WF` p. 2. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-056 — COHEIR™ mentorship context

**Given** a collaboration includes mentorship or professional review, **when** mentor context is needed, **then** ANCRSync™ shall consume mentorship, office-hour, portfolio-review, and professional-guidance information from COHEIR™.

**Source:** `PS` pp. 3, 7 §§05, 09; `TS` §09; `WF` p. 2. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-057 — INHEIRA™ contributor and rights handoff

**Given** a collaboration produces publishing-relevant output, **when** contributor, rights, Creative Evidence™, or publishing data is needed, **then** ANCRSync™ shall hand off to or consume that data from INHEIRA™ without becoming its system of record.

**Source:** `PS` pp. 3, 7 §§05, 09, 12; `WF` p. 2. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-058 — Split draft validation

**Given** a song collaboration results in a proposed contributor split, **when** ANCRSync™ creates a split draft for INHEIRA™, **then** the proposed contributor percentages shall total exactly 100 percent.

**Source:** `TS` §§01–02, 08–09. **Priority:** Production phase in `TS`; not assigned in `PS`. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-059 — Duplicate open split error

**Given** a split draft is already open for the applicable collaboration, **when** another split-draft creation is attempted, **then** the product shall reject the attempt as a conflict rather than create a second open draft.

**Source:** `TS` §05 (`409` for an already-open split draft). **Priority:** Production phase in `TS`; not assigned in `PS`. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-060 — VAULTA™ finance boundary

**Given** a collaboration requires project-budget, shared-expense, or financial-tracking context, **when** ANCRSync™ presents that context, **then** the financial data shall remain owned by VAULTA™.

**Source:** `PS` pp. 3, 7 §§05, 09; `WF` p. 2. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-061 — ANCRMEDIA™ media handoff

**Given** a collaboration produces a release, livestream, or creator-channel media output, **when** publication or media ownership is required, **then** ANCRSync™ shall hand off to ANCRMEDIA™.

**Source:** `PS` pp. 3, 7 §§05, 09; `WF` p. 2. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-062 — ANCRD™ and ANCRLAUNCH™ boundaries

**Given** collaboration contributes to networking, reputation, career readiness, or verified collaboration history, **when** those professional outcomes are presented or consumed, **then** ANCRSync™ shall rely on ANCRD™ for professional networking/community/reputation and ANCRLAUNCH™ for career-readiness use.

**Source:** `PS` pp. 3, 7 §§05, 09, 12; `WF` p. 2. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

## 12. Access Control, Privacy, Security, and Reliability

### REQ-ANCRSYNC-063 — Private-by-default rooms

**Given** a room is newly created, **when** no explicit privacy choice has been applied, **then** the room shall be private.

**Source:** `TS` §10. **Priority:** P0 for ACLs per `TS`. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-064 — Room privacy selection

**Given** a room owner configures room access, **when** the owner selects a privacy mode, **then** the product shall support open, cohort, and invite-only room privacy.

**Source:** `TS` §02. **Priority:** P0 for ACLs per `TS`. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-065 — Faculty audit-read access

**Given** faculty is assigned to observe a cohort's collaboration, **when** the faculty user accesses the live session or its record, **then** the user shall have audit-read access without gaining participant posting rights solely from the observer role.

**Source:** `TS` §02. **Priority:** Enterprise phase in `TS`; not assigned in `PS`. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-066 — Unauthorized room response

**Given** a user is not authorized for a restricted room, **when** the user requests the room or its protected content, **then** the product shall deny access with a forbidden response.

**Source:** `TS` §03, 05 (`403` for not a member). **Priority:** P0 for ACLs per `TS`. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-067 — Audio transport protection

**Given** audio is transmitted during a live collaboration, **when** the stream traverses the network, **then** the audio stream shall be protected using DTLS-SRTP.

**Source:** `TS` §10. **Priority:** P0 (WebRTC configuration). **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-068 — Message rate limit

**Given** a user posts messages, **when** message volume reaches the configured security limit, **then** the product shall enforce a maximum of 60 messages per minute for that user.

**Source:** `TS` §10. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-069 — Audio reconnection

**Given** a live audio connection is interrupted, **when** the client attempts to restore the stream, **then** reconnection attempts shall use back-off behavior.

**Source:** `TS` §03. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-070 — Offline synchronization

**Given** a collaborator makes supported changes while connectivity is unavailable, **when** connectivity returns, **then** the product shall synchronize those changes according to the collaboration conflict-resolution rules.

**Source:** `PS` p. 8 roadmap. **Priority:** P1. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

## 13. Accessibility and Experience

### REQ-ANCRSYNC-071 — Accessible message log

**Given** assistive technology encounters the message list, **when** new messages appear, **then** the message list shall expose log semantics so that message updates can be interpreted as an ongoing conversation.

**Source:** `TS` §06 (`role=log`). **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-072 — Accessible audio timestamps

**Given** an audio-stamped comment is presented to a screen-reader user, **when** focus reaches the comment, **then** the interface shall announce the associated media time.

**Source:** `TS` §06. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

### REQ-ANCRSYNC-073 — Production design language

**Given** a production ANCRSync™ interface is rendered, **when** users navigate collaboration workflows, **then** it shall preserve the prototype's premium dark visual language, obsidian foundation, electric blue/violet/magenta/amber accents, glassmorphism, editorial hierarchy, spacious workspaces, motion-rich interactions, live presence indicators, and shared ANCR™ navigation while allowing engineering flexibility behind the interface.

**Source:** `PS` pp. 7–9 §§11–13. **Priority:** Unassigned. **Status:** SPEC-DERIVED / NOT IMPLEMENTATION-VERIFIED.

## 14. Validation and Error Expectations

The source set defines only a limited error contract. The following expectations are supported and ready to be elaborated after product decisions:

| Concern | Requirement evidence | Expected result | Verification state |
|---|---|---|---|
| Non-member room access | REQ-ANCRSYNC-066 | Forbidden; `TS` proposes HTTP 403 | Not tested |
| Split total | REQ-ANCRSYNC-058 | Contributor percentages equal 100% | Not tested |
| Duplicate open split | REQ-ANCRSYNC-059 | Conflict; `TS` proposes HTTP 409 | Not tested |
| Transient message failure | REQ-ANCRSYNC-045 | Queue for resend | Not tested |
| Live-audio interruption | REQ-ANCRSYNC-069 | Reconnect with back-off | Not tested |
| Concurrent changes | REQ-ANCRSYNC-025, -070 | Apply conflict-resolution behavior; detailed policy is open | Not tested |
| Pending/failed room data | REQ-ANCRSYNC-010 | Loading skeleton / error notification | Not tested |

The sources do **not** define field-level validation messages, maximum asset sizes, supported file types, retention periods, invitation expiry, scheduling-conflict rules, deletion/recovery semantics, moderation flows, consent language, or a complete API error envelope. Those details remain open rather than inferred here.

## 15. Traceability and Test Readiness

### 15.1 Functional-area traceability

| Functional area | Requirement IDs | Primary evidence | Test-readiness note |
|---|---|---|---|
| Product boundary and entry | 001–006 | `PS` §§01–05, 09–12; `WF` pp. 1–2 | Acceptance tests require an actual ANCRID integration contract |
| Navigation | 007–010 | `PS` §06; `WF` p. 1; `TS` §06 | Route and UI-state tests can be designed after IA confirmation |
| Pulse and discovery | 011–012 | `PS` §07 | Display requirements are known; data definitions and permissions are open |
| Workspaces | 013–018 | `PS` §07 and roadmap | Core scenarios are testable; persistence/version semantics need definition |
| Studios and writing rooms | 019–027 | `PS` §07, 12; `TS` §02 | Multi-user tests need conflict and catch-up policies |
| Live sessions | 028–035 | `PS` §07; `TS` §02, 04, 09 | Media, recording, consent, and retention criteria remain incomplete |
| Creative review | 036–039 | `PS` §07; `TS` §02 | Timestamp tolerance is testable; approval state model is open |
| Messaging and communities | 040–046 | `PS` §07; `TS` §02–03, 08 | Latency and membership tests are testable; delivery semantics are open |
| AIAH™ | 047–050 | `PS` §08; `WF` p. 2 | Requires quality, safety, provenance, and human-review criteria |
| Analytics/history | 051–053 | `PS` §07, 12; `WF` p. 2; `TS` §08–09 | Event taxonomy and chemistry formula are open |
| Ecosystem integrations | 054–062 | `PS` §05, 09, 12; `WF` p. 2; `TS` §09 | Requires versioned contracts and ownership approvals |
| Security/reliability | 063–070 | `TS` §§02–03, 10; `PS` roadmap | Several explicit checks exist; broader privacy/security model is incomplete |
| Accessibility/experience | 071–073 | `TS` §06; `PS` §11–13 | Two concrete a11y checks exist; no full conformance target is specified |

### 15.2 Coverage statement

- Requirements captured: **73**.
- Source-derived requirements: **73**.
- Implementation-verified requirements: **0**.
- Requirements with test evidence: **0**.
- Passing acceptance tests claimed by this document: **0**.
- Quantitative acceptance criteria captured: message latency `< 400 ms p95`, audio-comment accuracy `±100 ms`, message rate `60 messages/minute/user`, and split total `100%`.

No test file, test report, prototype behavior, or implementation result was used as proof of ANCRSync™ conformance. A requirement becomes implementation-verified only after the ANCRSync codebase is correctly identified and direct evidence is reviewed. A requirement becomes test-covered only after an executable test is mapped to it and its result is recorded.

### 15.3 Proposed verification classes (not existing coverage)

| Class | Candidate requirements |
|---|---|
| Contract/integration | 002–005, 052–062, 066–067 |
| Functional UI/API | 007–043, 046–051, 063–065, 071–073 |
| Multi-user concurrency | 021–027, 030, 040–045, 070 |
| Performance | 038, 044 |
| Security/privacy | 003–005, 043, 052–053, 057–068 |
| Accessibility | 071–072 |
| Resilience/recovery | 025–027, 045, 069–070 |

## 16. Implementation Mismatch Notice

The current `ANCR-ANCRSYNC-` folder does not provide a trustworthy ANCRSync™ implementation baseline. Its existing `FUNCTIONAL_REQUIREMENTS.md` audits the application code in the folder and records that the code identifies itself as **ANCRLaunch™**, with career-readiness, resume, opportunity, application, interview, employer, graduate-outcome, and career-coach workflows. Those are ANCRLaunch™ behaviors, not the collaboration behaviors specified here.

Consequences:

1. This document does not map the folder's current endpoints, components, or tests to the requirements above.
2. The existing `FUNCTIONAL_REQUIREMENTS.md` remains an implementation audit and is not replaced by this canonical ANCRSync™ specification source.
3. No absence in the current mismatched code is interpreted as an approved removal from ANCRSync™ scope.
4. Before implementation verification begins, the actual ANCRSync™ repository/build must be identified or the current folder must be corrected and explicitly re-baselined.

## 17. Open Questions and Decisions Required

1. **Repository identity:** Where is the actual ANCRSync™ implementation, and should the current ANCRLaunch™ code be moved to a correctly named product folder?
2. **Release scope:** Which unassigned capabilities belong in MVP, and are the `PS` roadmap priorities authoritative over the narrower `TS` roadmap?
3. **Room model:** Are writing, production, and cross-cohort the complete room-kind set? Who may create, archive, restore, transfer, or delete a room?
4. **Permissions:** How do open, cohort, invite-only, member, owner, presenter, observer, faculty-audit, institution-admin, and partner-organization permissions compose?
5. **Faculty access:** Does "faculty always has audit read" apply to every room, only assigned cohorts, or only institution-scoped rooms, and what privacy notice is required?
6. **Privacy and consent:** What consent, participant notification, retention, deletion, export, legal-hold, and access-log rules apply to recordings, transcripts, messages, presence, analytics, and AI processing?
7. **Verified history:** Which activities are "meaningful" enough to become ANCRID™ Passport™ events, and what event schema, verification authority, correction, and revocation rules apply?
8. **Chemistry:** What is the approved chemistry formula, explainability model, bias review, visibility, appeal process, and write-back cadence?
9. **Split drafts:** What triggers a draft, who may edit/accept/reject it, what identifies the single open draft, and what happens if contributors do not reach 100%?
10. **Collaborative editing:** What conflict strategy, version granularity, undo/restore behavior, autosave interval, and offline merge policy are required?
11. **Messaging:** What are delivery, ordering, duplication, editing, deletion, moderation, blocking, reporting, attachment, and read-receipt rules?
12. **Live sessions:** Who may record, where recordings are stored, what reaches ANCRVIEW™, and what are the retention and failure-recovery rules?
13. **Discovery:** Which identity/profile fields may appear in discovery, maps, pulse views, communities, recommendations, and connection graphs for each audience?
14. **AIAH™:** What data may AIAH™ process, what content is retained, how generated suggestions are labeled, and which quality/safety/human-review thresholds apply?
15. **Analytics:** Define each metric, its source events, time window, aggregation level, authorization, and privacy threshold.
16. **Files and media:** Define supported types, size/duration limits, malware scanning, transcoding, quotas, version semantics, and failed-upload recovery.
17. **Accessibility:** What formal conformance target and supported assistive-technology/browser matrix apply beyond the two concrete `TS` requirements?
18. **Performance/load:** Confirm the measurement profile for `<400 ms p95` and whether the `TS` load target of 200 concurrent rooms × 5 users is still authoritative.
19. **Regional operation:** What residency, cross-region, latency, and institutional-control requirements govern global collaboration?
20. **Public interfaces:** Are the routes and schemas proposed in `TS` §05 normative contracts or illustrative architecture only?

## 18. Baseline Exit Criteria

This draft is ready to become an approved functional baseline only after:

1. Product ownership resolves the open scope and terminology questions.
2. Security and privacy owners approve access, recording, AI-processing, analytics, and retention behavior.
3. Ecosystem owners approve each data-ownership boundary and versioned integration contract.
4. Quantitative criteria receive named measurement profiles.
5. Requirements are assigned release priorities and acceptance owners.
6. The correct ANCRSync™ implementation is identified for traceability.
7. Tests are authored and mapped without converting planned coverage into claimed coverage.
