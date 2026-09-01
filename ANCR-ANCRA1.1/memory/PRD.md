# ANCRA™ v2.0 — Creative Learning Operating System™

## Original Problem Statement
Redesign ANCRA™ (the ANCR ecosystem's Learning Experience Platform) so it stops resembling any traditional LMS and becomes the definitive product specification for the Contemporary Creative Development Program (CCDP). Focus: **design/UX first — every screen production-quality, fully interconnected, ready to hand to engineering.**

## Design language
- Official ANCRA™ logo (`/frontend/public/ancra-logo.png`) used across nav + landing. Do not restyle.
- Premium dark cinematic UI + Studio/technical density hybrid (Apple + Figma + Arc + Linear + Notion + MasterClass + Adobe CC).
- Typefaces: Playfair Display (serif, learning-mode), JetBrains Mono (technical/UI), Instrument Sans (body).
- Film-grain overlay + glassmorphism + accent-red glow.

## What's implemented (Feb 2026, session 2)

### Permanent Shell
- `AncraLogo` component for consistent brand use.
- EcosystemNav — role-aware: **Ecosystem** (10 modules) + **Studio/Command Center** (role-specific workspaces) + **Utility**. Footer "Part of the ANCR Ecosystem".
- TopBar with role switcher, search, notifications, avatar.
- AIAHDock — floating contextual streaming panel (Claude Sonnet 4.5) on every route.

### Student Experience (17 screens)
Dashboard, Learning Journey™, Progress Journey, Studio Experience detail, Cinematic Lesson Player, Assignments (kanban), Creative Projects, Peer Reviews (tabs: received / to-review / given), Portfolio (grid), Portfolio Builder (drag composer), 30 Song Progress™, Capstones™, Creative Teams, Messages, Calendar, Achievements, Creator Passport, Graduation Dashboard, **dedicated AI Learning Companion page**.

### Faculty Command Center (14 screens)
Command Center, Students, Cohorts, Creative Team Management, Approvals, Reviews, **Grading (rubric + waveform)**, **Rubrics library**, **Studio Experience Builder** (Notion-density week composer), **Curriculum Builder**, **Lesson Builder** (cinematic composer), **Assignment Builder**, **AI Course Builder** (draft-generator), Analytics.

### Ecosystem Launch Hubs (10)
- Every `/hub/:module` renders a unified launch experience with: cinematic hero + live metrics + Recent Activity + Current Assignments tied to module + Related Lessons + AIAH insight + `Continue where I left off` + `Open full {Module}™` CTAs + return-to-ANCRA foot.
- **COHEIR Suite** (dedicated) — tabbed workflows: Live Industry Sessions, Office Hours booking, Mentor Reviews, Recommendations, Portfolio Critiques, Residents & Adjuncts (AiR / EiR / Adjunct).

### AIAH Intelligence Layer
- Global dock (contextual to route + role).
- Dedicated page (/companion) — ecosystem context panel showing what AIAH sees (ANCRA / ANCRLAB / ANCRSync / INHEIRA / COHEIR / Vaulta / ANCRLaunch / ANCRID), themed prompt starters, streaming conversation.
- AI helpers embedded on Lesson Builder, Assignment Builder, Rubrics, Studio Experience Builder, Grading, Portfolio Builder, Curriculum Builder, Analytics, ecosystem hubs.

## Backlog (engineering handoff — do NOT build now)
- Writing Room real-time
- INHEIRA registration flows (persistence)
- Curriculum + Rubric persistence
- Authentication + multi-persona permissions
- Media pipelines (Lesson Builder + Grading submissions)

## Status
**Version 1.0 of the ANCRA product specification is COMPLETE.** No further backend persistence, authentication infrastructure, database engineering, media pipelines, or production services should be built inside this project. Emergent's role is design/specification; Aaron's role is production engineering.

## Personas (single-seat demo)
- **Student** — Maya Ellis · Songwriting & Production · Fall 2025 Cohort 07 · Portfolio 87.
- **Faculty** — Prof. Terrence Bloom · Studio Director · Artist in Residence.

## Env
- Backend: `MONGO_URL`, `DB_NAME`, `EMERGENT_LLM_KEY`.
- Frontend: `REACT_APP_BACKEND_URL`.
