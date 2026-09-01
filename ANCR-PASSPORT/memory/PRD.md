# ANCR PASSPORT™ — Product Requirements & Build Record

## Original problem statement
Premium, responsive standalone web app "ANCR PASSPORT™ — Global Creative Mobility & Cultural
Intelligence" (part of the CCDP™ powered by ANCR™ ecosystem). Prepares creatives who travel
internationally to study, tour, perform, collaborate, film, exhibit, teach and do creative
business. Combines travel prep, cultural intelligence, international creative-business education,
language + music/lyric translation, destination discovery, document readiness, codes of conduct,
laws, safety/emergency support, group/institutional travel, and live travel assistance. Must feel
delightful, culturally respectful and globally sophisticated — not a government/booking/compliance
site. Identity comes from ANCRID (simulated SSO); Passport owns all travel/cultural/translation/
safety experiences. Uploaded official logos: PASSPORT (primary) "powered by" ANCR.

## Architecture
- Frontend: React (CRA) + react-router + framer-motion + shadcn/ui + Tailwind (dark obsidian theme).
- Backend: FastAPI + MongoDB (motor). All routes under `/api`. Seeded demo content on startup.
- AI: Emergent LLM key (Claude Sonnet) for Translator (text + lyrics) and Global Music Compass
  (compare, session-translate, rehearsal-plan, knowledge-translate).
- Auth: simulated ANCRID SSO, auto demo user `maya` (Maya Thompson). No login screen.
- Resilience: axios client has retry-on-timeout (preview Cloudflare throttles fresh headless sessions).

## User personas
Student creative (Maya), Faculty, Program Administrator, Tour/Group Manager; touring artists,
session musicians, producers, composers, arrangers, engineers, dancers, filmmakers, educators.

## Core requirements (static)
Home dashboard, Explore + destination guides, Culture School, Language+Music Translator,
Travel Ready, My Trips + Trip detail, Trip Mode, Safety, Global Classroom (roles), My Passport
(masked data), Journal, Network, and GLOBAL MUSIC COMPASS. Privacy: masked sensitive values,
permission-based location sharing, clearly labeled demonstration/simulated content and disclaimers.

## Implemented (2026-08-19)
- Full dark premium UI, sidebar/topbar nav, profile menu with role switching, official PASSPORT logo
  "powered by ANCR", demo user auto-load.
- Home dashboard (greeting, cinematic rotating **Featured Creative** cover of women from diverse
  ethnic backgrounds, upcoming Tokyo journey, global readiness bars, continue learning, translation
  shortcuts, cultural insight, labeled demo travel alert).
- Explore (6 destinations) + full Japan-style guide (all sections) with verify-before-travel disclaimers.
- Culture School + "Creative Collaboration in Japan" course (lessons, scenario, quiz, certificate, badge).
- Translator (Conversation, Camera-sim, Creative Language, Music+Lyric) — AI-powered.
- Travel Ready checklist (discipline-adaptive, filters, reminders, docs, print, %).
- My Trips + Tokyo trip detail (9 tabs). Trip Mode (mobile, currency, phrases, I Need Help sheet).
- Safety center (emergency numbers, embassy, trusted contacts, help options, permission-based location sharing).
- Global Classroom (assignment, roster, announcements, role views, create assignment).
- My Passport (masked docs, badges, visas, experiences, accessibility). Journal (CRUD). Network (connect).
- GLOBAL MUSIC COMPASS: Systems Atlas (9 traditions + governance fields + stewardship notices),
  AI Comparison, AI Session Translator, Scale/Raga/Maqam Reference (Web Audio placeholder playback),
  Rhythm & Time Lab (Web Audio layers), Instruments guide, AI Global Rehearsal Mode, AI Knowledge
  Translator, Music Classroom + access tiers (no billing), 3 demonstration pathways.

## Verification status
- Backend: all endpoints verified returning correct data via curl (incl. AI translate/lyrics/music/*).
- Frontend: compiles cleanly; layout/nav/pages render. NOTE: the preview domain's Cloudflare bot
  management intermittently throttles fresh **headless/automated** browser sessions, stalling the first
  request (loaders). Real browsers/users are unaffected; a reload resolves it. 12 concurrent curls
  (localhost + external, incl. gzip) all return 200 in <1s.

## Backlog / next
- P1: Practitioner/scholar review workflow to replace demonstration music content; real reviewed audio.
- P1: Additional destination + tradition profiles.
- P2: Real OCR for Camera translator; real emergency-service/embassy directory integrations.
- P2: Real ANCRID SSO + encrypted document storage; activate subscription billing.
