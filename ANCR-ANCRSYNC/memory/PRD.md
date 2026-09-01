# ANCRSync™ — Product Requirements Document

## Original problem statement
Build ANCRSync™, "the world's first Creative Collaboration Operating System." Tagline: **Connect. Collaborate. Create.** A premium SaaS platform for creators, educators, institutions, and industry professionals to collaborate across the creative lifecycle. Not Dropbox, Slack, Zoom, or Google Drive — it's an OS for creative collaboration inside the broader ANCR ecosystem. Signature feature: **Creative Passport™** — a verified log of every collaboration, mentorship, project, studio, institution, etc.

## User choices captured
- Scope: agent-picked focused MVP subset, then Phase 2 expansion into Global Creative Collaboration Network
- AI: Claude Sonnet 4.5 (via Emergent LLM key)
- Auth: JWT email/password
- Sessions: mocked video/audio (no real WebRTC)
- Design: agent-picked distinctive dark premium aesthetic

## Architecture
- **Backend:** FastAPI + MongoDB (motor) + JWT + bcrypt + `emergentintegrations` for Claude Sonnet 4.5
- **Frontend:** React 19 + React Router + framer-motion + lucide-react + Tailwind + Shadcn primitives, custom dark premium design (Cabinet Grotesk / Satoshi / JetBrains Mono)

## Phase 1 (shipped)
Landing, JWT auth, Dashboard, Creative Workspaces, Shared Studios, Shared Sessions, Global Map, Creative Passport™, AI Assistant, dark premium design system, ecosystem footer with ANCRSync + ANCR logos.

## Phase 2 — Global Creative Collaboration Network (shipped 2026-07-07)

### 1. Live Creative Collaboration™ — enhanced Studio Room
- Host toolbar: mic, cam, screen share, presenter mode, recording toggle, invite, leave
- Speaking indicators (rotating for demo)
- Waiting room with Admit / Deny
- Presenter/screen-share stage
- Live auto-transcript panel
- AI Session Intelligence™ button generates contribution + decision summary

### 2. Shared ANCRLAB™ — collaborative DAW mock
- 6 seeded tracks (Vocal Lead, Harmony, Piano, Bass, Drums, Synth Pad)
- Transport (play/pause/record), tempo/key/signature display
- Timeline ruler with playhead + 3 live collaborator cursors
- Per-track mute / solo / volume with backend persistence
- Deterministic waveforms per track
- Autosave activity feed

### 3. Shared Creation™ — tabbed workspace
Route: `/workspaces/:id/creation`
- **Shared Lyrics™** — persistent textarea (mono, blur-save)
- **Shared Arrangement™** — drag-visual section blocks (Intro/Verse/Pre-Chorus/Chorus/Bridge/Outro) with add
- **Shared Chords™** — mono chord sheet
- **Shared Whiteboard™** — moodboard sticky notes with add-note
- **Shared Assets™** — seeded files (audio/stems/lyrics/image) with kind/size/version/uploader

### 4. Communication Layer™ — `/messages`
- Channels (announcement/group/dm) — 4 seeded defaults
- Persistent messages per channel with avatars, timestamps
- Reply-to indicator, reaction preview
- Create new channel dialog

### 5. Mentorship™ — `/mentorship`
- 6 seeded mentors (Songwriter, Producer, A&R, Faculty, Engineer, Creative Director)
- Focus, rate, next-available
- Request session dialog (Office Hours / Portfolio Review / Coaching / Masterclass)
- Auto-logs mentorship entry in Passport

### 6. Creative Review™ — `/workspaces/:id/review`
- Timestamped feedback on assets
- Playhead + interactive waveform with markers
- Click-to-jump to timestamp
- Feedback list sorted by time

### 7. AI Session Intelligence™
- New context modes added to `/api/ai/chat`
- `/api/sessions/{id}/ai-summary` still active
- Studio room now has integrated AI Summary button

### 8. Creator Discovery™ — `/discover`
- Search by name/role/city
- Filter by role + availability
- Skill chips, experience years, availability badge
- Merges seeded creators + real users

### 9. Creative Communities™ — `/communities`
- 14 seeded communities (Songwriters, Film, Animation, Photography, Jazz, Gospel, Hip-Hop, EDM, Publishing, Faculty, Alumni, Women in Music, Creative Entrepreneurs, Students)
- Kind filter chips
- Join button auto-logs in Passport

### 10. Live Presence™
- Sidebar "Live now" widget shows 4 users with colored activity dots
- Deterministic activities: writing lyrics / mixing / editing MIDI / mentoring / reviewing edits / etc.

### 11. Deep INHEIRA™ Integration (mock)
- "Sync to INHEIRA™" button on workspace detail
- Records ownership + contributors + credits + publishing info
- Persists sync status; badge shows Synced state
- Auto-logs achievement in Passport

### 12. Deep ANCRID™ Integration
- Every action (create/join/sync/request) writes a Passport entry
- Passport is the ANCRID™ ledger

### 13. Navigation
- Sidebar reorganized into three sections: **Workspace** (Dashboard, Workspaces, Studios, Sessions, ANCRLAB™) · **Network** (Messages, Discover, Communities, Mentorship, Global Map) · **Identity** (Creative Passport, AI Intelligence)

## Phase 3 — ANCRID Identity Layer, Real Geo, LiveKit, Federated SSO (shipped 2026-07-08)

### 1. Cross-product ANCRID Verify
- New `/api/ancrid/verify` returns cross-product identity payload:
  - `products.ancrsync` — workspaces + sessions counts
  - `products.ancrlab` — projects + tracks
  - `products.inheira` — works registered + credits
  - `products.vaulta` — balance_usd + royalties_pending
  - `products.ancrlaunch` — releases + campaigns
  - `products.ancra` — courses + completed
  - `geo` — user's resolved city/country/lat/lng/flag
- Frontend ANCRIDVerify shows real Ecosystem Snapshot panel next to the animated steps

### 2. Federated SSO
- `POST /api/ancrid/federated` — accepts `source` (ancrlab/inheira/vaulta/ancrlaunch/ancra), email, display_name, role, discipline, city, country. Provisions ANCRID if new, returns JWT.
- Login page has 5 branded SSO icons; clicking auto-provisions and routes to ancrid-verify.
- `auth.federated(source)` context helper.

### 3. Real user geo
- `GEO_LOOKUP` map with ~60 cities + country fallbacks (US, UK, DE, FR, IT, ES, NL, BR, NG, GH, ZA, KE, EG, UAE, IN, JP, KR, CN, AU, etc.)
- Signup now captures **city** field.
- `resolve_geo()` runs on signup, federated login, and manual `/api/me/geo` update.
- Stored on user: `lat`, `lng`, `flag`, `city`.
- `/api/global/creators/v2` returns users with real coordinates.
- GlobalPulse Dashboard globe overlays gold dots for real signed-up users on top of the seeded blue city pulses.

### 4. LiveKit WebRTC (production-ready scaffold)
- Backend `livekit-api==1.1.1` installed. Frontend `livekit-client` installed.
- `GET /api/livekit/config` — reports enabled=true only when LIVEKIT_URL/API_KEY/API_SECRET env vars are set.
- `POST /api/livekit/token` — issues JWT via LiveKit AccessToken with room join + publish + subscribe grants. Returns 501 if keys missing.
- New `useLiveKit(roomName)` React hook manages Room, participants, mic/cam/screen share, active speakers.
- New `LiveKitTile` component renders video tracks with speaking ring + name badge.
- StudioRoom: shows "Mock (no LiveKit keys)" chip when disabled; "Go Live" button when configured. When connected, real video tiles replace mock grid.

### Deploy to enable real WebRTC
Add to `/app/backend/.env`:
```
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=xxxxxxxx
LIVEKIT_API_SECRET=xxxxxxxx
```

## Known mocks (transparent)
- Cross-product data is **simulated** (Vaulta balance, ANCRLaunch releases, ANCRA courses) — real backends would replace these
- LiveKit is fully wired; needs cloud keys to go live
- Live cursors on ANCRLAB™ and speaking indicators (non-LiveKit) remain visual

## Prioritized backlog

### P1
- Real WebRTC (LiveKit / Daily / Agora)
- Real-time collaborative editing (Yjs / Automerge) for Shared Creation
- File upload to S3-compatible object storage
- Notifications inbox
- Team invites + workspace membership management

### P2
- ANCRA™ learning integration
- Actual DAW backend integration (Ableton Link, Web Audio timeline)
- Sovreign™ integration
- Shareable public Passport link
- University LMS (Canvas/Moodle) connectors
- Enterprise/label multi-tenant admin
