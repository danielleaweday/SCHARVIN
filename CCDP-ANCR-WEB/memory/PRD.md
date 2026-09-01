# CCDP — Product Requirements Document

## Original Problem Statement
Premium, world-class website for the **Contemporary Creative Development Program (CCDP)**. Repositioned (per user) from a student-recruitment site into an **institutional fundraising, partnership, and engagement platform**. Must feel like a hybrid of an Ivy League university, a leading tech company, and a venture-backed edtech platform — not a traditional school/nonprofit template.

## Design System
- **Aesthetic:** Hybrid premium dark base (Black `#0a0a0b`, Charcoal `#141417`, Cream `#f4f1ea`, White) with the signature **CCDP gradient** (blue→purple→magenta→gold) used intentionally as accent.
- **Fonts:** Cabinet Grotesk (display) + Manrope (body).
- **Motion:** Framer Motion reveals/stagger, animated stat counters, marquee, glass sticky nav.
- Guidelines: `/app/design_guidelines.json`.

## Audiences
Universities & colleges, foundations, corporate sponsors, EdTech investors, government agencies, workforce-development orgs, creative-industry leaders, entertainment & tech companies.

## Architecture
- **Frontend:** React 19 (CRA/craco), Tailwind, shadcn/ui, framer-motion, sonner. Single-page homepage at `/`.
- **Backend:** Default FastAPI template — **not used** (site is static; forms are visual-only with toast feedback).
- Real brand assets stored in `/app/frontend/public/brand/` (ccdp-mark, ccdp-full, ccdp-dashboard, ancr, adca-logo, adca).

## Implemented (2026-07-04)
- Sticky glass **Navbar** (real CCDP logo, 8 nav links, "Schedule a Briefing" CTA, mobile sheet).
- **Hero** — repositioned institutional messaging + "Built for" audience strip; CTAs: Executive Briefing, Partnership Deck.
- **The Challenge** — problem framing (4 cards + 3× stat).
- **Our Solution** — 6 ecosystem pillars + 12 discipline chips.
- **Our Technology** — featured ANCR (real CCDP dashboard + ANCR logo), 7 module cards, ADCA highlight banner (real logo).
- **Institutional Partnerships** — 4 integration models + CTA.
- **Impact Metrics** — animated current counters + 2030 projections.
- **Investment Opportunity** — 4 value points + ways to engage + Deck/Invest CTAs.
- **Research & Innovation** — 4 focus areas.
- **Leadership** — team (gradient monograms) + advisory board (placeholder names).
- **Partners** — logo marquee + categories.
- **Final CTA** — 5 executive actions (Briefing, Partnerships, Deck, Leadership, Invest).
- **Footer** — logo, contact form (visual), socials, ecosystem/links, legal, CCDP watermark.
- Frontend tested (iteration_2): ~97%, all flows verified; 2 minor items fixed (mobile testid naming, branded email validation toast).

## Update (2026-07-04) — Platform Ecosystem Redesign
- Reframed ANCR from a product list into an **education operating system** of **13 platforms** (ANCR + ANCRA, ANCRLAB, ANCRSYNC, ANCRLaunch, ANCRMedia, ANCRLearn, ANCRID, Passport, COHEIR, Vaulta, Culta, ADCA) across 3 pillars (Education, Technology, Careers).
- Built a **signature interactive Ecosystem experience** (`components/ecosystem/EcosystemExperience.jsx`): CCDP→branch architecture, ANCR OS hub, 12 selectable nodes, branch filter, animated detail panel (description, benefits, screenshot). Uses real dashboard + 4 generated on-brand product mockups.
- Added **react-router** with a dedicated **/platform** page (`pages/Platform.jsx`): OS hero (13/3/1 stats), Microsoft-Office analogy framing, full interactive ecosystem, per-branch breakdown, dashboard showcase, CTAs. Nav "Technology" → **"Platform"** (route). `ScrollManager` handles cross-page hash scrolling.
- Applied newest **real logos** (CCDP mark, ANCR, ADCA) + newer real dashboard. Frontend tested (iteration_3): **100%** pass; fixed 2 minors (13-platforms metric, mobile sheet a11y title).

## Update (2026-07-04) — Pre-Launch Truthfulness & Facts Pass
- **No-hallucination enforced (verified 100%, iteration_4):** removed all fabricated data — invented metrics (50K/100/500/92%/3×), fake partner logos (Adobe/Spotify/etc.), and placeholder advisors. Impact now shows honest "Coming Soon" cards; Partners shows 8 category placeholders (Higher Education, Foundations, Technology, Entertainment, Government, Employers, Workforce Development, Philanthropy).
- **Real leadership:** Danielle McMillan (Founder & Executive Director), Earl Shimpan (COO), Aaron King (CTO), Scharvin Wilson (CPO), Denise Griffin (Chief of Staff); Senior Music: Jimmie Parker, Cameron Fletcher; + "Faculty, Educators & Industry Professionals" section (Coming Soon profiles).
- **Ecosystem hierarchy:** CCDP → ANCR (OS) → 12 modules: ANCRA, ANCRLAB, ANCRSYNC, ANCRLaunch, ANCRMedia, ANCRLearn, ANCRID, Passport, COHEIR, Vaulta, ADCA, **ANCRD** (added). **Culta removed.** ANCRMedia reframed as the media home; Vaulta broad positioning only. Each module has a unique **accent color** (interim identity until official logos).
- **New page + nav order:** added `/ecosystem` (org map). Sequence: Challenge → Solution → Ecosystem → Platform → Partnerships → Investment → Leadership → Contact. CTAs updated (Executive Briefing, Partnership Deck, Become a Founding Partner, Institutional Partnerships, Meet Leadership).

## Pending (awaiting user assets/decisions)
- **Official product logos** for ANCR OS + all factions (user will upload) — currently temporary icons + accent colors.
- **Horizontal/compact CCDP logo** for the nav (user will upload) — interim compact mark in use; official CCDP + ANCR logos must never be cropped/stretched/AI-recreated.
- **Per-module detail pages** (`/platform/:id`) — deferred until user provides each module's logo + copy.
- ANCRMedia sub-brands (ANCRWAV, ANCRView, ANCRD) relationship — ANCRD added as its own module per user; sub-hierarchy TBD.

## Update (2026-07-05) — Module list + official logos (batch 1)
- Ecosystem now: CCDP → ANCR (OS) → 14 modules. **Removed ANCRLearn.** **Added ANCRWAV, ANCRVIEW, SOVREIGN.** Full: ANCRA, ANCRLAB, ANCRSYNC, ANCRLaunch, ANCRMedia, ANCRID, Passport, COHEIR, Vaulta, ADCA, ANCRD, ANCRWAV, ANCRVIEW (soon), SOVREIGN (soon).
- **Official module logos wired** (batch 1 of ongoing): ANCRA, ANCRLAB, ANCRSYNC, ANCRLaunch, Vaulta (logo reads **VUALTA**), ANCRWAV — shown in the ecosystem detail panel on matched tiles. Others use accent-colored icons until logos arrive. Files in `/public/brand/modules/`.
- Platform count references now dynamic ("Unifies 14 platforms").
- Pending: remaining official logos (user feeding in batches of 5), ANCRVIEW/SOVREIGN copy, confirm "Vaulta" vs "VUALTA" spelling, per-module detail pages.

## Update (2026-07-07) — Final editorial pass + INHEIRA rename
- **Why CCDP** rewritten to answer "why the world needs a new model" (4 distinct forces; removed ecosystem/AI/platform repetition).
- **ANCR module taglines** made aspirational/transformational (Learn·Grow·Transform, Create·Build·Own, Launch·Work·Advance, Own·Build·Prosper, Write·Own·Protect, etc.).
- **Industry Mentorship** — added "they mentor, produce, develop, release, and launch alongside you" differentiator.
- **ANCR AI** — Eight Intelligence Systems reframed around the intelligence-layer statement (no bot lists).
- **Leadership** — one-line purpose for every executive; added **Tasha Harris — Chief Strategy Officer** (Commercial Strategy · Revenue). Team grid uses centered flex-wrap (no orphan cards).
- **Vision** — new closing section (`components/Vision.jsx`) before FinalCTA: "This is where creative education is going."
- **Grateful Music Initiative** flagship redesigned into a movement: opening statement + retitled "Creating a New Global Tradition of Gratitude / Powered by The Grateful Music Initiative™" + 8 initiative outcomes (replacing generic skill chips) + cinematic video background.
- **SONGRIGHT → INHEIRA rename (complete):** every visible instance replaced. Module `id: "inheira"`, name INHEIRA, tagline "From Creation to Legacy", accent #7a8cff, new generated logo `/brand/modules/inheira.png`. Updated in PLATFORMS, ANCR_OS_MODULES, Ecosystem ORBIT, and SIGNATURE_EXPERIENCES. Card desc + benefits per spec. NOTE: INHEIRA logo is a **generated placeholder** matching ecosystem style — swap for official logo when provided. "Launch INHEIRA" button NOT added (no module has launch buttons on the marketing site; needs an app URL to wire).


## Notes / Mocked
- **Added SONGRIGHT** (Write · Credit · Protect) as a full platform under ANCR with official logo + positioning/purpose. Wired **ANCRID** official logo. Now 15 modules ("Unifies 15 platforms").
- **POLARIS logo held** — not in the confirmed ecosystem list; awaiting user mapping.
- Official module logos wired so far: ANCRA, ANCRLAB, ANCRSYNC, ANCRLaunch, Vaulta(VUALTA), ANCRWAV, ANCRID, SONGRIGHT. Remaining use accent icons.
- **All forms are visual-only (MOCKED)** — no persistence.
- Ecosystem detail screenshots use the real CCDP dashboard + AI-generated generic UI mockups as placeholders (no fabricated product capabilities).

## Update (2026-07-07) — Cinematic visual pass (humanity)
- **Vision section** rebuilt into a cinematic split (`components/Vision.jsx`): left statement + "One World. One Creative Ecosystem." pill; right a custom generated Earth-at-night ecosystem viz (`/brand/world-ecosystem.jpg`) with animated pulsing collaboration nodes + glass caption. Replaces the previous empty-space centered layout.
- **Mentorship humanity band** added to `MentorshipStudio.jsx`: 3 cinematic people-focused photos (Studio Sessions, Writing & Collaboration, Live Performance) to shift imagery toward people over interface.
- **ANCRID logo** updated to newest uploaded version (`/brand/modules/ancrid.png`).
- PENDING (broader imagery pass, user-requested): add cinematic people imagery to ANCRSync™, ANCRLAB™, INHEIRA™, Shared Global Creation™, Professional Mentorship (faculty + pros), Capstone™ (album release), Global Showcase™ (stage/audience). Prioritize authentic creative-work photography over generic stock.


## Backlog / Next
- **P1:** Build out dedicated pages (About, Programs, full Technology, Partnerships, Investment/Deck request, Contact) — currently single-page.
- **P1:** Wire real forms (Executive Briefing scheduler, Partnership Deck request) to a backend + email (e.g., Resend) with DB storage.
- **P2:** Real leadership bios/photos, verified metrics, partner logos.
- **P2:** CMS-backed News & Insights / thought leadership.
- **P2:** SEO polish (sitemap, structured data), analytics.

## Update (2026-08-01) — Hero "Creative Threshold" + header/nav
- **Hero rebuilt** (`Hero.jsx` `ThresholdBackdrop`): removed the portal/atom ring. New "Creative Threshold" — nested spectrum archways (blue→violet→magenta→orange→gold) forming an architectural doorway with luminous opening, floor reflection, converging lines, and four animated spectrum currents (Create/Collaborate/Develop/Propel) carrying abstract signals (waveform, film timeline ticks, ownership trace). Bigger headline (lg:text-[5.5rem]), new body copy, supporting line "Build the work. Own the future.", CTAs (Schedule an Executive Briefing / Request the Partnership Deck), integrated CREATE→COLLABORATE→DEVELOP→PROPEL progression + "From first idea to professional momentum.", downward scroll cue. 48/52 grid, framer-motion + useReducedMotion.
- **Header/nav**: logo enlarged (md h-98 ≈ 248px, still complete/uncropped). Navbar min-h raised to 112/128. NAV_LINKS simplified to 7 items (About, The CCDP Solution, Schools & Pathways, Technology Ecosystem, Institutional Value, Leadership, Request Information) mapped to existing working targets; removed Why CCDP/New Degree/Ecosystem/Partnerships/Investment/Resources/Contact top-level clutter.


## Update (2026-08-01) — Hero rebuild + header logo
- **Hero (Change 1)**: Removed the studio photo (`ASSETS.hero`). `Hero.jsx` now renders a fully code-based cinematic CCDP backdrop (`HeroBackdrop`): radial convergence/portal ring, spectrum arcs (blue→violet→magenta→orange→gold), animated waveform lines, glowing discipline nodes, film timeline markers, faint tech grid, SVG grain. Motion via framer-motion with `useReducedMotion` (respects prefers-reduced-motion). New copy: eyebrow, headline (white "A New Category of" + spectrum "Creative Education."), approved body ("CCDP™ powered by ANCR™ is a comprehensive creative-education solution…"), supporting line "Built to strengthen institutions. Designed to prepare creators.", buttons "Schedule an Executive Briefing" + "Request the Partnership Deck". Removed the old "one connected institution" sentence and the bottom "Built for" audiences strip. Left-aligned editorial; hero pt increased (pt-40/44) for clear space under the taller header.
- **Header logo (Change 2)**: `Logo.jsx` now renders ONE intact `<img>` of the complete official lockup at `/brand/ccdp-header-full.png` (derived from CCDP_MULTI_BLK_BG, auto-trimmed black padding → 1379×544, ratio 2.53; artwork unmodified). Shows wordmark + emblem + "Contemporary Creative Development Program" + "Create • Collaborate • Develop • Propel". object-contain, h-68/80/90 → widths ~172/202/228 desktop, 194.8px at 390px mobile. Navbar height raised to min-h-104/112, overflow-visible. Alt text per spec. NOTE: exact "CCDP LOGO TRANS(2).png" was never uploaded; used the complete official CCDP_MULTI_BLK_BG lockup instead (all elements visible, on black which blends with the dark header).


## Update (2026-08-01) — Three targeted changes
- **Change 1 — Positive positioning**: Removed the "This is not a classroom / online course / traditional music degree" strikethrough block. Replaced with affirmative section (`MentorshipStudio.jsx` `positioning-section`): eyebrow "Education. Creation. Ownership. Opportunity.", headline "Creative education, connected from learning to livelihood.", body/supporting/emphasis, buttons "Explore the CCDP Solution" (→ #learning-experience) + "Schedule an Executive Briefing" (→ inquiry). Global negative-language audit done: removed "This is not / not simply / doesn't replace / more than just / You don't learn alone" (Hero heading, verbs line, studio head, content.js MENTORSHIP + UNIVERSITY, Partnerships.jsx). grep confirms none remain.
- **Change 2 — Global Adoption**: New `GlobalAdoption.jsx` on Home (after Partnerships). Eyebrow/headline/subhead/body, custom dark world-map visual (`/brand/global-map.jpg`, generated) with 4 illustrative city nodes (Toronto, New York, Amsterdam, Lagos) + spectrum arcs + interactive selector (click city → role text) + "Illustrative Global Collaboration" label. 7 feature cards. Global CTA band (both buttons → existing inquiry via openBriefing). Reduced-motion handled (motion-safe/motion-reduce on pulses). Institutional-version data (`GLOBAL_ADOPTION.institutional`) staged in content.js for the future Institutional Value page.
- **Change 3 — Header logo: BLOCKED**. "CCDP LOGO TRANS(2).png" not uploaded to assets yet. No changes made to the header logo. Awaiting the official transparent file to fix the clipped logo per spec.
- Backend inquiry routing (awe@aweday.org), forms, DB, admin, export all preserved/untouched.


## MAJOR REBUILD IN PROGRESS (2026-08-01) — "CCDP powered by ANCR" institutional overhaul
Full 25-section spec provided by user. Staged execution. Preserve all backend/forms/auth/admin.

### DONE & verified this session
- **Backend**: inquiry notifications now route to `awe@aweday.org` (`backend/.env` INQUIRY_RECIPIENT). Form/DB/admin/export untouched. (curl-verified /api/health, env load)
- **Official logos saved** to `/app/frontend/public/brand/modules/`: ancr, ancra (white bg), ancrd (white bg), ancrid (+ancrid-transparent), ancrlab, ancrlaunch, ancrmedia, ancrsync, ancrview, ancrwav, coheir, cynaiah, inheira (official, replaced generated placeholder), passport, sovreign, viearta. Also `/brand/ancr-ddd.png` (ANCR "Discover·Develop·Deploy" variant — placement TBC).
- **POLARIS removed** everywhere (PLATFORMS, ANCR_OS_MODULES, Ecosystem ORBIT).
- **Earl Shimpan → Earl Shipman**; **Vaulta → VAULTA** (name text).
- **Leadership fully rebuilt** (`content.js` LEADERSHIP + `Leadership.jsx`): founder (Danielle, correct titles, sized photo), Executive Leadership (6, incl. Dr. Milton Ruffin, Rashad Shipman, Tasha as Chief Commercial Strategy Officer), Academic Leadership Council (Floyd, Parker, Fletcher, Hutton), Administration (Griffin, Jessica Tate = Program Operations Coordinator). Only Danielle has a photo.

### STILL MISSING (user uploading)
- Corrected **VAULTA** logo (current art reads "VUALTA" — not displayed as wordmark per rules; interim keeps vaulta.png, must swap).
- **Awe Day Creative Arts, Inc.** parent-org logo (needed for About + footer lockup).

### REMAINING STAGES (not yet done)
- **Nav restructure** to: Home, About CCDP, The CCDP Solution, Schools & Pathways, Technology Ecosystem, Institutional Value, Leadership, Request Information. CTAs: Request Information / Request a Demonstration. (NAV_LINKS + Navbar + App.js routes.)
- **New pages**: About CCDP, The CCDP Solution, Schools & Pathways (ANCRA portal, CYNAIAH, VIEARTA), Technology Ecosystem (product profiles w/ official logos; ANCRMEDIA houses ANCRVIEW+ANCRWAV; ANCRLAUNCH transition role), Institutional Value, Request Information.
- **Beyond CCDP / SOVREIGN** section ("From education to market", status: Commercial continuation in development).
- **Home restructure**: hero "A New Category of Creative Education" (CCDP powered by ANCR), Create/Collaborate/Develop/Propel pillars, Discover→...→Continue journey, institutional value, ecosystem preview, final CTA.
- **Brand hierarchy strings** ("CCDP™ powered by ANCR™", parent-org statement) site-wide.
- **Footer** restructure (CCDP logo + Powered by ANCR + Awe Day logo + links + privacy/terms/trademark + aweday.org). Privacy/Terms pages.
- **Metadata/SEO** (Seo.jsx): titles/descriptions, domain ccdpbyancr.com, parent aweday.org, social image.
- **Accessibility pass**: focus states, alt text, reduced motion, semantic headings, labels.
- **Product profile pages** per section 10/16 (logo, purpose, users, problem, 3-6 capabilities, CCDP/ANCR relationship, status label, Request a Demonstration). No private links / no fake dashboards.
- **Status labels** (Internally Developed / In Active Development / etc.).
- Full regression testing (frontend + backend) + responsive review.


## Update (2026-07-05) — Official architecture + logos (batch 2)
- **Ecosystem realigned to official public architecture (3 pillars):**
  - Education (4): ANCRA, ANCRLAB, ANCRLearn (Coming Soon), ADCA
  - Technology (5): ANCR (OS), ANCRSYNC, ANCRID, Passport, COHEIR
  - Creative Economy (7): ANCRLaunch, ANCRMedia, ANCRVIEW, ANCRWAV, SONGRIGHT, ANCRD, Vaulta
  - **Removed SOVREIGN** (not in official list). **Re-added ANCRLearn** (education, Coming Soon). Total = 16 platforms incl. ANCR OS.
  - Renamed 3rd pillar "Careers" → "Creative Economy".
- **New official logos wired** (trimmed, transparent, native aspect ratio): ANCR (blue wordmark, OS), ADCA (white outline), ANCRD (`ANCR_LOGO.png` was actually ANCRD), ANCRVIEW. Files in `/public/brand/modules/`.
- **ANCRVIEW no longer "Coming Soon"** — official copy applied. Updated official copy for SONGRIGHT, ANCRWAV, ANCRD.
- **CCDP navbar mark kept** — new uploads (black-bg / full-tagline lockups) not better proportioned for compact nav.
- **POLARIS held** (user: do not add until positioning finalized).
- Verified via screenshot: pillar counts 4/5/7, all logos render crisp on dark chips, no distortion.

## Update (2026-07-05) — Batch 3
- **Removed ANCRLEARN and ANCRMEDIA** (not real modules per user). Ecosystem now 14 platforms (13 modules + ANCR OS).
  - Education (3): ANCRA, ANCRLAB, ADCA
  - Technology (5): ANCR (OS), ANCRSYNC, ANCRID, Passport, COHEIR
  - Creative Economy (6): ANCRLaunch, ANCRVIEW, ANCRWAV, SONGRIGHT, ANCRD, Vaulta
- **Newest official ANCR logo** wired site-wide: `/brand/modules/ancr.png` + `/brand/ancr.png`; now displayed in the ecosystem OS hub node (replaced the generic Boxes icon).
- **New official logos wired**: COHEIR, PASSPORT, ANCRLaunch (black-bg lockups → made transparent, trimmed, native aspect ratio).
- Verified via screenshot: counts 3/5/6, "Unifies 13 platforms", all new logos render crisp on dark chips.

## Update (2026-07-05) — Lead-generation system (production-ready)
- **Backend** (`/app/backend/inquiries.py`): `POST /api/inquiries` (validates, stores in Mongo `inquiries`, sends 2 branded emails), `GET /api/config` (returns configurable `schedulingUrl` + `emailEnabled`). Router registered in `server.py`.
- **Email (Resend)**: internal notification to danielle@aweday.org (subject `New CCDP Partnership Inquiry — {org}`) + confirmation to submitter (subject `Thank You for Contacting CCDP`, 1–2 business days, Danielle Stephens McMillan signature, deck note if requested). **Graceful: if `RESEND_API_KEY` empty, inquiry is still stored (`email_status: skipped`); emails auto-send once key is pasted.**
- **Env keys** in `backend/.env`: `RESEND_API_KEY` (EMPTY — user pastes after verifying aweday.org), `SENDER_EMAIL`, `INQUIRY_RECIPIENT`, `SCHEDULING_URL` (EMPTY — user pastes Google Calendar link post-deploy).
- **Spam protection**: honeypot field (`company`) + per-IP rate limit (6 / 15 min). **Validation**: zod (frontend) + Pydantic/EmailStr (backend).
- **Frontend**: `InquiryProvider` context + shared `InquiryDialog` (react-hook-form + zod, branded dark UI, success state). All CTAs wired via intents: Hero, Navbar (desktop+mobile), Platform hero, Partnerships, Investment (deck + invest), FinalCTA (5 CTAs), Footer newsletter (opens general inquiry prefilled with email).
- **Schedule a Briefing** = opens `SCHEDULING_URL` in new tab if set, else falls back to the briefing inquiry form. **Partnership Deck** is gated behind the form ("deck being finalized — we'll email it").
- Verified: full e2e submit (form→API→Mongo storage), honeypot block, invalid-email rejection, briefing fallback. **Emails NOT yet live (awaiting Resend key).**

## Pending on user (to go fully live)
- Paste Resend API key into `backend/.env` `RESEND_API_KEY` (after verifying aweday.org domain in Resend) → restart backend.
- Provide Google Calendar scheduling URL → set `SCHEDULING_URL` in `backend/.env`.
- Provide Partnership Deck PDF when ready (currently "being finalized" flow).

## Update (2026-07-05) — Institutional Relationship Management (CRM) system
- **Data model** (`inquiries` collection): Inquiry ID, created_at, organization, first/last name, jobTitle, email, phone, website, organizationType (University/Foundation/Investor/Employer/Government/Nonprofit/Other), areaOfInterest (Executive Briefing/Partnership/Investment/Degree Program/Technology Platform/General Inquiry), message, source, requestedDeck, **status** (New/Contacted/Meeting Scheduled/Proposal Sent/Closed), **assignedTo**, **internalNotes**, **lastContactedDate**, **nextFollowUpDate**, email_status. CRM-agnostic (HubSpot/Salesforce/Airtable can map later). Inquiries **upsert by email**.
- **Admin auth** (`auth.py`): JWT (Bearer), bcrypt, admin seeded from env (ADMIN_EMAIL/ADMIN_PASSWORD), brute-force lockout. Endpoints: POST /api/auth/login, GET /api/auth/me.
- **Admin CRM API** (protected): GET /api/admin/inquiries (search/status/institutionType/date filters + byStatus counts), PATCH /api/admin/inquiries/{id}, GET /api/admin/inquiries/export (CSV, respects filters).
- **Dashboard** `/admin/inquiries` (+ `/admin/login`): stats, filters, table, detail editor (status/assignee/notes/dates), mark-follow-up-complete, export filtered + export all, mailto + scheduler links, Sheets-status badge.
- **Google Sheets live backup** (`google_sheets.py`): service-account upsert-by-ID; **gated** on GOOGLE_SERVICE_ACCOUNT_JSON + GOOGLE_SHEET_ID (auto-activates when set). Called on inquiry create + admin update.
- **Resources page** `/resources`: 6 gated resources (Partnership Deck, Executive Brief, Institutional Overview, Degree Program Overview, ANCR Platform Overview, Press Kit) + FAQ. Each request opens the inquiry form and creates/updates a CRM lead with the mapped Interest Type. Added "Resources" to nav.
- **Tested**: testing_agent iteration_5 — backend 100% (13/13), frontend 100%, no blocking issues. Test data cleared (CRM starts empty).

## Pending on user (to go fully live)
- `RESEND_API_KEY` (after verifying aweday.org) → live emails.
- `GOOGLE_SERVICE_ACCOUNT_JSON` + `GOOGLE_SHEET_ID` (share sheet w/ service-account email) → live Sheets backup.
- `SCHEDULING_URL` → Executive Briefing opens Google Calendar booking.
- Partnership Deck / Executive Brief / etc. PDFs → switch Resources from "we'll email it" to instant download.
- Admin creds in /app/memory/test_credentials.md (change ADMIN_PASSWORD in backend/.env for production).

## Update (2026-07-05) — Production deployment prep + hardening + logos on tiles
- **Logos surfaced**: official module logos now render on the ecosystem node tiles AND the per-branch breakdown (dark chips on the light section), plus the ANCR wordmark in the OS hub — not just the detail panel.
- **Backend hardened**: removed dev boilerplate (`/api/status`, "Hello World") → added `GET /api/health`; `JWT_SECRET` now required (no insecure fallback); configurable `LOG_LEVEL`; rotated dev admin password + JWT secret (new creds in test_credentials.md).
- **Production readiness review PASSED**: no hardcoded secrets, no console.log/print, no lorem/TODO, no test accounts. Admin fully env-configured (seeded on startup). `.gitignore` updated to exclude `.env` (keep `.env.example`); `backend/.env` untracked.
- **Deliverables created**: `DEPLOYMENT.md`, `ARCHITECTURE.md`, `PRODUCTION_READINESS.md`, `backend/.env.example`, `frontend/.env.example`, `backend/Dockerfile`, `frontend/Dockerfile` (+ `nginx.conf`), root `docker-compose.yml`, `.dockerignore` files.
- Production build runs inside the frontend Dockerfile at deploy time (not in preview — building here hit the memory limit). App verified running via supervisor (health/config/login OK).

## Update (2026-07-05) — "Our Educational Framework" page
- New route `/framework` + nav link "Framework" (between Ecosystem & Platform).
- Content: FIVE pillars per user's written spec (Creative Arts, Technology & Innovation, Business & Entrepreneurship, Career & Workforce Development, Leadership & Human Development) — the example image's 6th "Global Exchange" was NOT added (not in spec, no-hallucination).
- Sections: hero ("Five Pillars. One Purpose." + CCDP|ANCR lockup + generated montage), five accent-coded pillar cards with AI-generated cinematic imagery + "Integrated across CCDP + ANCR" tags, CCDP↔∞↔ANCR ecosystem-connection band, and a Schedule-an-Executive-Briefing CTA (openBriefing).
- Data in content.js: FRAMEWORK_PILLARS + FRAMEWORK_HERO. Images generated (Gemini) + hosted. Verified via screenshots; compiles clean.

## Update (2026-07-05b) — Framework promoted to flagship page (6 pillars)
- Added 6th pillar **"Global Exchange & Reach"** (icon Globe2, accent #06b6d4) with generated cinematic image. Hero copy: "Five Pillars" → "Six Pillars"; intro heading "Six pillars. One integrated future."
- Rebalanced to an even **6-card grid** (sm:2 / lg:3). Cards: image w/ number watermark, icon chip, accent hover glow.
- Cinematic motion (index.css keyframes): parallax hero (framer-motion useScroll/useTransform on image + text), ambient animated gradient orbs (`animate-drift`), flowing SVG connection line in ecosystem band (`flow-line`), abstract **animated global network globe** (pulsing nodes `node-pulse` + drawing arcs `arc-draw`) in new "Built for global scale" section. Respects prefers-reduced-motion.
- Added concluding institutional statement section (`framework-statement`) before CTA, per user's exact wording.
- Navigation (content.js NAV_LINKS): "Framework" → **"Educational Framework"**, "Ecosystem" → **"ANCR Ecosystem"**; Educational Framework placed immediately before ANCR Ecosystem (desktop + mobile). No "Academics" item created (deferred by user).
- Verified via screenshots (hero/pillars/global/statement); compiles clean. Frontend-only, no backend change.

## Update (2026-07-05c) — Added POLARIS & SOVEREIGN platform chips
- Downloaded official logos to `public/brand/modules/polaris.png` and `sovreign.png` (both on black bg, logoBg #000000, undistorted).
- content.js PLATFORMS +2 entries → 16 total (15 modules unified by ANCR):
  - **POLARIS** (branch: technology, icon Compass, accent #2e7bff): tagline "Navigate · Connect · Advance"; desc = AI-powered guidance for learning/career pathways/opportunities/personalized growth — the intelligence layer across ANCR; 3 benefits. Uses dashboard shot.
  - **SOVEREIGN** (branch: careers/Creative Economy, icon Crown, accent #eab308): `comingSoon: true`, no desc/benefits invented (renders "Coming Soon" placeholder per no-hallucination).
- EcosystemExperience.jsx: guarded `(selected.benefits || [])` so comingSoon platforms don't crash. Platform.jsx hero stat "14" → "16".
- ASSUMPTION FLAGGED: user's branch answer "Creative Economy; Technology" was ambiguous vs POLARIS's described AI-intelligence-layer role; placed POLARIS→Technology, SOVEREIGN→Creative Economy. Easily swappable. Screenshot-verified on /platform.

## FINAL HANDOFF — 2026-07-05 (feature-complete, approved by user)
- POLARIS (Technology · "Navigate · Connect · Advance") & SOVREIGN (Creative Economy · "Lead · Own · Reign") APPROVED as **Coming Soon** with official logos + confirmed descriptions; branches confirmed by user (POLARIS→Technology, SOVREIGN→Creative Economy). Keep as Coming Soon until products are built.
- Resend API key + Google Service Account JSON to be added at deployment; email confirmations + Sheets sync remain ENV-GATED by design (no keys in repo).
- Status: FEATURE-COMPLETE. No new features/pages/recommendations to be added unless explicitly requested in future releases.
- Health: backend/frontend/mongodb RUNNING; frontend compiles clean. Production docs present (README, DEPLOYMENT, ARCHITECTURE, API_REFERENCE, DATABASE, ADMIN_GUIDE, PRODUCTION_READINESS).

## Update (2026-07-05d) — Framework page REDESIGNED to match user's example mockup (ex1.png)
- User was dissatisfied; matched their sent example: generated cinematic HERO MONTAGE (globe network + singer/coders/business/concert composite + neon light arc) → new FRAMEWORK_HERO.
- Pillar cards rebuilt as HORIZONTAL layout: glowing accent icon circle top-left, colored numbered title ("1. Creative Arts"), description, "Learn more →" (opens briefing), photo feathered in from the right via left-to-right gradient. 3×2 grid, per-accent glow borders.
- Section heading "Six Pillars. One Integrated Future." + example subtitle. Ecosystem band now has glowing neon infinity ring. Removed the custom SVG globe section. CTA band: globe montage bg + "Let's build the future together." Concluding statement retained.
- Pillar copy aligned to example (Creative Arts, Technology, Global Exchange descriptions). Screenshot-verified all sections.

## Update (2026-07-05e) — Framework page elevated to FLAGSHIP visual execution
- Same structure/content; upgraded presentation per user: 4-color ambient gradient field (blue/purple/orange/gold), premium glassmorphism (cards, logo lockup, statement, ecosystem panel).
- Pillar cards: glass surface, per-accent top gradient bar, rotating conic gradient icon rings (IconRing, animate-spin-slow), brand duotone photo overlay, glow-on-hover.
- Added generated dotted WORLD MAP (world_map_clean) as faint watermark behind pillars + full map in ecosystem band (mask-fade-edges).
- New PillarConvergence component: six pillar icon chips with flowing dashed lines (flow-line) converging into the glowing infinity hub, flanked by CCDP (left) + ANCR (right) logos as anchors — visually shows pillars feeding both ecosystems.
- Hero: gradient glow frame on montage + gradient underline. CSS added: spin-slow, mask-fade-edges. Screenshot-verified all sections.

## Update (2026-07-06) — Site-wide background music
- Added user's uploaded track to /frontend/public/audio/ (ambient.m4a original + ffmpeg-generated ambient.mp3 & ambient.ogg for universal browser support; ~97s loop).
- New global component `BackgroundAudio.jsx` mounted in App.js inside BrowserRouter (persists across route changes, no restart). Autoplay attempt on load + first-gesture fallback (browsers block unmuted autoplay), loops, volume 0.3.
- Floating bottom-left "Music on/off" toggle (data-testid audio-toggle-btn) with animated equalizer; mute state persisted in localStorage ('ccdp-audio-muted'). Silenced on /admin routes.
- Verified in browser: plays on gesture (mp3), toggle mutes, state persists across navigation to /framework.

## Update (2026-07-06b) — Background music swapped to cinematic
- Replaced user track with cinematic "Reawakening" by Kevin MacLeod (incompetech), CC BY 4.0, 3:34, self-hosted at /audio/ambient.{mp3,m4a,ogg}.
- Attribution added as tooltip (title) on the audio toggle in BackgroundAudio.jsx. Verified playing in browser (loops, plays on first gesture).
- NOTE: CC BY requires visible-ish credit; offered footer credit option OR swap to no-attribution Pixabay track if user uploads one.

## Update (2026-07-06c) — FINAL background music
- Replaced with user-uploaded "tunetank-soft-corporate-background-music" (~84s loop) at /audio/ambient.{mp3,m4a,ogg}. Removed Kevin MacLeod attribution tooltip (user owns track). Verified playing in browser.

## Update (2026-07-06d) — Ecosystem page redesigned to "The Creative Lifecycle"
- Rebuilt /ecosystem (Ecosystem.jsx) as a 5-stage narrative: Discover, Develop (6 pillars), Connect (ANCR network), Deploy (11 modules orbiting ANCR; Polaris/Sovereign "Soon"; hover descriptions), Thrive; + final "One Ecosystem. One Journey. One Future." with CCDP-infinity-ANCR.
- Continuous glowing timeline spine (flow-dot), horizontal stage rail in hero, premium glass/gradients/motion preserved. CSS added: orbit-spin, flow-down. Verified render across stages.
- Background music LEFT AS-IS per user (no pulse/tooltip). Site declared feature-complete by user.

## Update (2026-07-06e) — Footer colored logo + "CCDP Learning Experience" section
- Footer: swapped grey wordmark for full COLORED logo (cropped CCDP_MULTI_BLK_BG -> /brand/ccdp-colored.png, black bg blends with footer). Verified saturated (not grey); user was seeing cache.
- Replaced light "12 creative disciplines" catalog chips (removed from Solution.jsx) with new premium DARK component LearningExperience.jsx placed after Solution on Home.
- 8 connected learning-domain cards (LEARNING_DOMAINS in content.js): Creative Disciplines, Professional Development, Business & Creative Enterprise (Vaulta), Technology & AI (ANCR), Creative Collaboration (ANCRSync), Career Development (ANCRLaunch), Global Creative Perspective (Passport), AI-Powered Learning (ANCR AI). Glass cards, rotating gradient icon rings, accent bars, item chips, Powered-by badges, hover glow. Verified 8 cards render.
- Background music untouched per user.

## Update (2026-07-06f) — "The Future of Creative Education" flagship section
- Rebuilt LearningExperience.jsx (on Home, id=learning-experience) from 8-card catalog into a 6-section flagship: Hero (One Degree/Platform/Ecosystem); 01 Creative Economy (3 feature cards); AI Learning Intelligence flagship panel (32 ANCR AI capabilities); 02 Career Dev (Powered by Vaulta+ANCRLaunch); 03 Studio-Based Learning; 04 ANCR Education OS (12 platform logos equal, Polaris/Sovereign Soon); 05 12 integrated domains; 06 Institution Partnerships; final lifecycle (Discover..Transform) + infinity.
- Data in content.js FUTURE_EDU. Premium dark glass, rotating gradient icon rings, accent bars, chips, powered-by badges. Verified render + 12 OS logos. No compile errors. Music untouched.

## Update (2026-07-06g) — CCDP Website Rewrite v2.0 + GLOBAL SCROLL BUG FIX (tested iteration_6, 100%)
- **P0.1 SCROLL BUG FIXED (root cause):** `.glass` used `backdrop-filter: blur(20px)` on the STICKY navbar — WebKit/Chrome dropped composited layers on scroll → content blanked/flashed. Replaced `.glass` with a solid `rgba(10,10,11,0.88)` background (index.css). Removed remaining `backdrop-blur` from Hero deck button + Admin sticky header. Verified across /, /framework, /ecosystem, /platform, /resources on desktop/tablet/mobile + /#challenge direct-load — NO disappearing content.
- **P0.2 v2.0 REWRITE (content.js fully rewritten):** Eliminated academic language (majors/course catalog only appear in intentional "CCDP is not" strikethrough). New data + narrative:
  - Hero → "A New Category of Creative Education." (higher-ed model / AI platform / creator OS / global network positioning).
  - Solution → "Why CCDP is different": `SOLUTION.isNot` (strikethrough chips) + `SOLUTION.is` (8 identity cards).
  - LearningExperience → "The New Creative Degree": 18 `SIGNATURE_EXPERIENCES` (Creative Identity™, RightPrint™, SONGRIGHT™, RoyaltyOS™, Stage2Stream™, DealMaker™, etc.), de-emphasized `CONCENTRATIONS`, `INTELLIGENCE_SYSTEMS` (Eight flagship systems replacing 30+ AI assistants), `SHARED_COLLAB` (Shared Studio Sessions™ etc.), `STUDENT_OUTCOMES`, `LIFECYCLE`.
  - Partnerships → "CCDP doesn't replace universities. It plugs into them.": `UNIVERSITY.retain` vs `UNIVERSITY.provide` grids.
  - Framework/Resources copy aligned (no "degree program/disciplines" catalog language).
- Inquiry/lead flow re-verified end-to-end (POST /api/inquiries 200). Testing agent added 1-line testid forwarding to LearningExperience GlassPanel.

## Update (2026-07-06h) — NEW FLAGSHIP: Industry Mentorship & Studio Leadership
- Added `MentorshipStudio.jsx` (Home, id=mentorship, between LearningExperience and Ecosystem) + `MENTORSHIP` data in content.js. Positions CCDP as an industry apprenticeship embedded in higher ed (not self-paced online learning).
- Subsections: intro; "Students learn directly from" (mentor types); The Studio Learning Model (Studio X™); Professional Creative Output (~30 works highlight w/ discipline examples + output checklist); "Every student is surrounded by a team"; positioning statement (strikethrough "This is not a classroom/online course/traditional music degree" → "They build a career before they graduate.") + Executive Briefing CTA.
- Verified via screenshots (desktop + mobile) + all data-testids present, no console errors. Premium dark glass, gradient accents, safe motion (no backdrop-filter). Music untouched, logos untouched.

## Update (2026-07-06i) — FINAL V1.0 EDITORIAL/STORYTELLING PASS (content locked)
- Editorial-only pass (no redesign / no new pages / no new features). Removed cross-section redundancy so each homepage scroll advances a unique message:
  - Eight Intelligence Systems now appear ONLY in the ANCR OS block (LearningExperience Part 4). Removed the duplicate module-logo grid from LearningExperience — the Ecosystem section owns the platform suite (headline changed to "One operating system. A connected suite of platforms.").
  - Removed the duplicate "Career Outcomes" block from LearningExperience (STUDENT_OUTCOMES export deleted); professional outcomes now live ONLY in the Industry Mentorship flagship (MENTORSHIP.output).
  - Removed duplicate "future of creative education" headline from Investment ("A scalable model for a new category of higher education") and Research ("Advancing the science of creative learning").
  - Solution.lead reworded so it no longer re-lists the four identities from the Hero (now states WHY CCDP is different).
- Aligned data to user's final refined lists: MENTORSHIP.mentors (19), MENTORSHIP.studioModel (13 incl. Capstone Experiences™/Portfolio Showcases™/Global Studios™/Professional Production™), MENTORSHIP.output (16, discipline-agnostic), UNIVERSITY.retain (5: +Institutional Identity, +Student Experience), UNIVERSITY.provide (11: +Learning Management Integration/Creative Career Development/Creative Workforce Alignment/Industry Partnerships/Career Ecosystem/Technology Infrastructure).
- 18 SIGNATURE_EXPERIENCES (proprietary IP) + Shared Global Creation (11 Shared X™) confirmed intact. Compiles clean; verified via screenshots (Ecosystem headline + University retain/provide). **Version 1.0 content LOCKED / production-ready.**

## Update (2026-07-06j) — FINAL TECHNICAL POLISH: SEO & social metadata (V1.0 locked)
- Lightweight, dependency-free SEO only (no analytics/tracking/cookies; no design/content change).
- `public/index.html`: upgraded meta description (v2.0 positioning), keywords, Open Graph (type/site_name/title/description/image + width/height/alt), Twitter/X `summary_large_image` (title/description/image). Added favicon links (`.ico` + 16/32 png), `apple-touch-icon` (180). OG image = real hero photo (no logo re-creation).
- **Favicons generated** from real `ccdp-official.png` padded square on brand-black (no crop/distortion): `favicon.ico` (16/32/48/64), `favicon-32x32.png`, `favicon-16x16.png`, `apple-touch-icon.png`. All serve HTTP 200.
- New `components/Seo.jsx` (no library): sets per-page `document.title` (`{Page} — CCDP`), meta description, canonical, og:title/description/url, twitter:title/description/image, and `robots`. og:url + canonical are dynamic via `window.location.origin` (works on any deploy domain).
- Wired into all pages: Home ("A New Category of Creative Education"), Framework ("Educational Framework"), Ecosystem ("The ANCR Ecosystem"), Platform ("The ANCR Platform"), Resources ("Resources"). Admin pages (Login/Inquiries) set `robots=noindex, nofollow`.
- Verified at runtime across routes: titles/canonical/og:url/robots all correct; admin = noindex. Compiles clean. **VERSION 1.0 COMPLETE — ready for CTO handoff.**

## Update (2026-07-06k) — Solution section reframed as connected-ecosystem network viz
- Removed the "CCDP IS NOT" comparison + red strike-through styling (negative framing) per user. No positioning by contrast against traditional education.
- Rebuilt `Solution.jsx` as a premium NETWORK VISUALIZATION: a glowing central **CCDP** core (conic-gradient ring + gradient glow) with 8 floating glass chips orbiting on subtle animated connecting lines (SVG + `flow-line`). Desktop = radial constellation (absolute positioning via computed angles); mobile = core + wrapped chips fallback.
- New copy (SOLUTION in content.js): overline "One Integrated Model"; headline "CCDP brings together what creative education has never connected before."; subhead about one continuous experience; 8 nodes (Higher Education, Education Technology, Artificial Intelligence, Industry Mentorship, Creative Workforce Development, Global Creative Collaboration, Creator Infrastructure, Lifelong Career Development); integration statement below. Removed unused SOLUTION.isNot/is.
- Section switched cream→dark to support the glowing core/glassmorphism. Verified via screenshots (full constellation + statement), data-testids present (ecosystem-core + ecosystem-node-*), compiles clean, no console errors.

## Update (2026-07-06l) — Global layout polish: no more orphan rows
- Layout-only pass (no color/type/branding/content/animation/nav/logo/audio changes). Fixed every incomplete/orphan grid row to center intentionally using a `flex flex-wrap justify-center` pattern with exact responsive widths (calc), replacing plain CSS grids that left-aligned partial final rows.
- Fixed: ImpactMetrics (5 → 3+2 centered), LearningExperience Shared Global Creation (11 → 4+4+3 centered), MentorshipStudio Studio Model (13 → 4+4+3) & Team (11 → 4+4+3), MentorshipStudio mentors chip cloud (19 → centered, label centered), Partnerships "CCDP provides" (11 → last item centered), Partners (8 → balanced). Leadership team is 4 (already balanced) — left as-is.
- Verified via screenshots across all affected sections. Balanced grids that already divided evenly (Signature Experiences 18/3-col, Intelligence Systems 8/4-col, Framework pillars 6/3-col, Investment/Research 4) were left untouched.

## Update (2026-07-06m) — NEW FLAGSHIP: Signature Industry Initiatives™ (with cinematic imagery)
- Added `SignatureInitiatives.jsx` rendered inside MentorshipStudio, between Professional Studio Learning and Professional Outcomes. Data in content.js: `INITIATIVES_FEATURED` (The Grateful Music Initiative™ — positioned as a timeless, non-seasonal cultural movement; 14 skills; belief line) + `INITIATIVES` (Shared Global Creation™, Professional Production™, Creator Incubator™, Industry Research & Innovation™, Global Showcase™).
- Layout: featured = FULL-WIDTH cinematic background image (recording-studio collaboration) with left→right dark overlay + copy on top; 5 cards with photo headers (auto-centered 3+2 via flex justify-center); full-width closing statement.
- Imagery: premium rights-cleared Unsplash photos of diverse creators in action (sourced via image_selector). Featured kept non-seasonal per user (did NOT use the "Grateful & Merry / Indie Holiday" logo attachment). All 6 images live in content.js (INITIATIVES_FEATURED.image + INITIATIVES[].image) — swap-ready for final branded photography.
- Verified via screenshots (featured background + card headers render, images load). Compiles clean, no console errors. Dark design language/glassmorphism/motion preserved.

## Update (2026-08-01) — Creative Threshold hero refinement
- Replaced dashed travel-map currents with 4 continuous luminous spectrum currents (waveform, collaboration branch, film-timeline w/ subtle notches, career pathway) + drifting light motes. No dots/city markers.
- Deeper threshold: 6 nested arches, larger scale, inner white light spill, reflective floor + spectrum reflection, haze, light rays.
- Headline forced to 2 lines (block spans). Body max-w-520 contrast /85. Buttons single row (h-12, px-6, text-13, whitespace-nowrap). Header logo md h-100 (~250px). Layout 44/56, brought forward, vertically centered. Verified desktop 1440 (buttons same row, h1 144px).

## Update (2026-08-01b) — Hero motion restored + deployment/preview verification
- Restored visible, elegant motion to the Creative Threshold hero (no redesign): animated spectrum currents (waveform y-wobble), traveling highlight strokes along currents + outer arch, breathing threshold glow/core, drifting light motes flowing toward the threshold, subtle desktop cursor parallax on nested arches. All gated behind `useReducedMotion` — reduced-motion users get a complete static visual.
- Investigated user report of "old studio-photo version" on public preview. FINDING: preview URL (studio-ancr.preview.emergentagent.com) serves the live dev server directly — commit HEAD `a7a0474` on `main`, working tree = latest code. No service worker, no cached JS in /public, no stale build artifact. Root cause of "old version" = client-side browser cache on viewer's end; a fresh cacheless session confirms the newest Creative Threshold build is live.
- Verified via testing_agent (iteration_7): backend 13/13 pytest pass; frontend 100% — motion active (17 animated elements), reduced-motion static render OK, full CCDP logo intact at desktop/tablet/mobile, nav + CTAs work, inquiry form submits (200, email skipped by design), admin login + dashboard OK, no console errors, no overlap with music control.
- Fixed doc drift: /app/memory/test_credentials.md admin password updated to real backend/.env value (QnCggaMbqI4PjUl8XiisRrhW).

## Update (2026-08-01c) — Header fix + hero simplification + homepage tightening (5 approved refinements)
- HEADER (Navbar.jsx + Logo.jsx): logo given its own reserved space (shrink-0), nav restructured so links never overlap the logo; nav text 13px→14px with more spacing; added a divider + larger gap before the "Schedule a Briefing" CTA. Verified: full CCDP logo unobstructed, no overlap with first nav link at 1920/1440/768/390.
- HERO SIMPLIFIED: CREATE→COLLABORATE→DEVELOP→PROPEL journey moved OUT of the hero's left column into a new slim full-width transition band (HeroTransition.jsx, data-testid hero-transition-band + hero-pillars) placed directly below the hero, bridging into the Challenge section. Hero concept + motion unchanged.
- NEGATIVE COPY REMOVED: "You don't declare a major"→"You build a career from the first day."; "Not thirty scattered assistants"→"Eight intelligence systems, working as one."; "not just a transcript"→"a career-ready body of work that speaks for itself."; softened "replaces the traditional course catalog"→"built around signature learning experiences".
- HOMEPAGE TIGHTENED: home Ecosystem section (Ecosystem.jsx) rewritten as concise preview (3-stat strip + two link cards → /platform and /ecosystem); the 8 Intelligence Systems on the homepage condensed from full cards to chips + "Explore the ANCR platform" link (→ /platform). Full detail retained on dedicated pages.
- Verified via testing_agent (iteration_8): backend 13/13, frontend 100% (11/11 items) across 4 breakpoints + normal/reduced motion; inquiry submit, admin login/dashboard, and all dedicated pages (/platform, /ecosystem, /framework, /resources) pass with zero console errors.

## Update (2026-08-01d) — Desktop layout-density refinement (6 targeted improvements)
- Widened major homepage containers 1400px→1500px (Challenge, Solution, LearningExperience, MentorshipStudio, Ecosystem, Vision) and trimmed excessive vertical padding (py-24/36 → py-20/28).
- Integrated Model diagram (Solution.jsx) enlarged ~40% (h-600→760, max-w-4xl→6xl), strengthened glowing connecting lines (lineGlow filter), added restrained spectrum radial glow behind the CCDP core; RX=42/RY=43 so no chips clip.
- Eight Intelligence Systems (LearningExperience.jsx) rebuilt from chips into a balanced 4×2 GlassPanel card grid (lg:grid-cols-4) with hover glow + retained "Explore the ANCR platform" link → /platform.
- Studio Sessions / Writing & Collaboration / Live Performance (MentorshipStudio.jsx) enlarged into a wider cinematic triptych (taller aspect, lifted center card, spectrum top border + hover glow).
- Vision "The Future" (Vision.jsx) REBUILT as a full-width 1fr/1fr split: statement text left, a code-built Creative Threshold PATHWAY visual right (nested receding arches, vanishing-point glow). Old globe image fully removed (zero <img> tags) per "no globes" rule.
- Added subtle full-width background continuity via new .bg-grid utility (fine architectural grid, radial-masked) + existing spectrum glows across Challenge/Solution/LearningExperience/MentorshipStudio/Vision.
- Verified via testing_agent (iteration_9): backend 13/13; frontend 100% (11/11) across 5 breakpoints (1440/1024/768/390/360) + reduced motion; no header overlap, no horizontal overflow, images not broken, hero + CTAs + ecosystem previews + dedicated pages + admin auth all intact; zero console errors.

## Update (2026-08-01e) — Diverse people imagery to fill wide dead space
- Per user request for Black people imagery alongside other diverse races, added dignified creator photography in 3 places:
  1. MentorshipStudio triptych rebuilt to feature three Black creators — "In the Studio" (painter), "On Stage" (singer, lifted center), "On Set" (filmmaker).
  2. LearningExperience "New Creative Degree" intro converted to an editorial 2-col split with a diverse group-of-creators image on the right (fills prior dead space).
  3. "Shared Global Creation" chips wrapped in a full-width cinematic people band (diverse group image + dark overlay + heading + chips on top).
- All images are real Unsplash photos (verified 200/image-jpeg). Leadership photo rule preserved (only Danielle has a leadership photo — these are general creator/lifestyle imagery, not leadership).
- Verified via testing_agent (iteration_10, frontend-only): 100% — all images load (naturalWidth>0), text legible over the band, no horizontal overflow at 1440/1024/768/390/360, hero + inquiry modal + admin login + all routes intact, zero console errors.

## Update (2026-08-01f) — Sticky-header offset + Challenge transitional composition + section seams
- STICKY-HEADER FIX (recurring): added `html{scroll-padding-top:132px}` and `section[id]{scroll-margin-top:132px}` in index.css so anchor navigation never hides content under the fixed navbar. Verified section heading top >= nav bottom at 1440/1280/1024/768/390/360.
- CHALLENGE ("Why Creative Education Must Evolve") rebuilt into a wide transitional composition: statement left, architectural Creative-Threshold visual right (data-testid='challenge-threshold') with "The future." integrated INTO the visual (no longer a small isolated card), and the 4 supporting cards in a full-width lg:grid-cols-4 row beneath. Reduced padding (py-16 md:py-24). Eliminates the empty vertical area.
- SECTION CONTINUITY: added subtle spectrum gradient seams at the tops of Challenge/Solution/LearningExperience/Mentorship for a continuous experience.
- Verified via testing_agent (iteration_11, frontend-only): 100% — sticky-header offset works at all 6 breakpoints, Challenge composition + 4 cards render, no horizontal overflow, reduced motion OK, music control no overlap, zero console errors, hero + inquiry + admin + ecosystem previews + all routes preserved.

## Update (2026-08-01g) — URGENT: restored homepage ecosystem/logo grid + added CYNAIAH & VIEARTA
- ROOT CAUSE: the earlier user-approved "homepage tightening" had replaced the full EcosystemExperience (all official product logos) on the HOMEPAGE with a 2-card preview → logos vanished from homepage (they remained on /platform).
- FIX: Ecosystem.jsx restored to render <EcosystemExperience /> (ANCR OS hub + full module node grid + interactive detail panel + all official logos) with heading "One operating system. A connected suite of platforms." and an "Explore the full Technology Ecosystem" link → /platform. Kept wider container (1500) + reduced padding + section seam.
- ADDED CYNAIAH (/brand/modules/cynaiah.png) and VIEARTA (/brand/modules/viearta.png) to PLATFORMS using their official uploaded logos, as honest placeholders (comingSoon: true, "Full capabilities and positioning are being finalized." — no invented functionality). Added both to ANCR_OS_MODULES.
- No logo was redrawn/renamed/recolored/cropped/substituted/generated. /platform page unchanged. Hierarchy preserved: CCDP™ powered by ANCR™, ANCR as OS foundation. All preserved: ANCRA, ANCRLAB, ANCRSYNC, ANCRLaunch, ANCRID, PASSPORT, COHEIR, VAULTA, ADCA, ANCRD, ANCRWAV, ANCRVIEW, INHEIRA, SOVREIGN + ANCR OS.
- Verified via testing_agent (iteration_12, frontend-only): 100% — full grid restored, all module logos load (naturalWidth>0) incl node-cynaiah + node-viearta, detail panel + branch filters + explore→/platform work, no broken images, no console errors, no horizontal overflow, hero/inquiry/admin/routes all intact. (Note: node-ancr renders twice — hub + approved grid chip — intentional, previously approved.)

## Update (2026-08-01h) — Added ANCRMEDIA back to ecosystem
- Added PLATFORMS entry id='ancrmedia' (branch 'careers', shot 'media') with official logo /brand/modules/ancrmedia.png (black-bg artwork) and official tagline "Distribute · Watch · Listen · Stream · Connect". Added to ANCR_OS_MODULES. Full entry (not comingSoon).
- Verified via testing_agent (iteration_13, frontend-only): 100% — node-ancrmedia renders, logo loads (1536×1024), detail panel shows full entry + tagline, no regressions to cynaiah/viearta/ancr nodes, no console errors, no horizontal overflow.

## Update (2026-08-01i) — Transparent logos for CYNAIAH & ANCRMEDIA
- These two were the only module PNGs with solid (black) backgrounds (showing boxes in the node grid). Audited all module logos: every other one already transparent.
- Downloaded the user's official TRANSPARENT overlays (CYNAIAH-TRANSPARENT-OVERLAY, ANCR-MEDIA-TRANSPARENT-OVERLAY) and overwrote cynaiah.png + ancrmedia.png (confirmed alpha 0-255). Set both logoBg to 'transparent'.
- Verified via testing_agent (iteration_14): 100% — both render transparent (computed bg rgba(0,0,0,0), no box), logos load, detail panels correct, no regressions/console errors/overflow.

## Update (2026-08-01j) — 3 final corrections
1. Schools & Pathways (/framework): added a featured "Schools & Pathways" section above the six pillars presenting ANCRA (Learn · Grow · Transform), CYNAIAH (School of Film, Visual Storytelling & Emerging Media; Vision · Story · Impact — from official logo), and VIEARTA (details being finalized) with their official logos (data-testid school-ancra/school-cynaiah/school-viearta).
2. Footer email changed danielle@aweday.org → awe@aweday.org (org inquiry address); also updated the inquiry error-fallback text. Leadership founder card intentionally keeps danielle@aweday.org (her personal card).
3. Removed 2 returned negative-comparison statements: "CCDP is not one school, one app, or one degree." (Platform → "CCDP unites schools, platforms, and credentials into one comprehensive ecosystem…") and "ANCR doesn't add AI to education." (homepage → "ANCR embeds intelligence into every stage…").
- Verified via testing_agent (iteration_15, frontend-only): 100% — schools cards + logos load, footer=awe@aweday.org (no danielle in footer), both negative phrases gone, no regressions/console errors/overflow.

## Update (2026-08-01k) — Restored per-platform interface mockups (Technology Ecosystem)
- The ecosystem detail panel previously showed only 5 shared/generic mock images (reused across platforms) and a blank "Coming Soon" placeholder for in-development modules.
- Built PlatformMock.jsx — a code-based (div/SVG, no screenshots, never blank) component with a KIND map by platform id and distinct representative UI renderers: os, learn, studio(DAW), collab, career, identity, passport, network, finance, rights(splits), music, video, mediahub, film, wellness, market, feed. Each renders a styled app window (title bar w/ platform name + nav rail + purpose-specific content) themed to the platform accent.
- Wired into EcosystemExperience detail panel (replaces SHOT image); coming-soon modules (CYNAIAH/VIEARTA/SOVREIGN) now show their representative mock + a "Coming Soon" badge. No logos/structure/names/branding changed.
- Verified via testing_agent (iteration_16, frontend-only): 100% — all 18 platform mocks render non-blank with matching headers, coming-soon show mock+badge, /platform page also updated, no console errors, no horizontal overflow.

## Update (2026-08-01l) — Premium cinematic product previews in ecosystem panel
- Replaced the code-based/generic previews with 18 distinct, high-fidelity cinematic 3D product renders (Gemini image gen), one per platform, themed to each app's purpose + CCDP spectrum lighting (device renders, glass panels, depth/glow, no readable text/gibberish, no people/logos in render).
- Added PLATFORM_PREVIEWS map (id→url) in content.js; EcosystemExperience detail panel renders <img src={PLATFORM_PREVIEWS[id]}> (PlatformMock kept only as fallback). Coming-Soon badge retained on cynaiah/viearta/sovreign. Official logo/name/desc/capabilities in the body unchanged.
- Verified via testing_agent (iteration_17): 100% — all 18 previews load (naturalWidth=1264), all 18 URLs DISTINCT (no repeats), correct logo/name/desc/benefits per product, coming-soon badges, filters + explore→/platform + /platform page all pass, reduced-motion OK, no console errors, no overflow. (Note: node-ancr testid appears twice — hub + approved grid chip — intentional/previously approved.)

## Update (2026-08-01m) — Selector/panel match + consistent platform count
- FIX 1 (mismatch): removed AnimatePresence mode='wait' (0.4s exit held the old panel, causing e.g. VAULTA highlighted while panel showed CYNAIAH). Now a keyed motion.div (entrance-only) remounts synchronously on selection → panel ALWAYS matches the highlighted card immediately.
- FIX 2 (count): single source of truth = non-OS platforms = 17. Platform.jsx stat now computed (PLATFORMS.filter(!os).length) instead of hardcoded 16; branch tile counts use coreModules (exclude OS) so Education 3 + Technology 5 + Creative Economy 9 = 17 = "Unifies 17 platforms".
- Verified via testing_agent (iteration_18): 100% — all 18 nodes match panel instantly (incl CYNAIAH→VAULTA repro + rapid clicks), previews unique per product, count=17 consistent everywhere, coming-soon badges, no console errors, no overflow. Known LOW/non-blocking: duplicate node-ancr testid (hub + previously-approved grid chip) — left as-is per "don't redesign".

## Update (2026-08-07) — RELEASE 1: Site expansion (Invest, Support Us, Store, nav/footer)
Additive expansion (no redesign of existing pages). All prior pages/routes/CRM/admin preserved.

### New public pages
- **/invest** (`pages/Invest.jsx`) — "Invest in the Future of Creative Education." Sections: hero with the exact "Too many talented creators…" copy, Why CCDP powered by ANCR exists (3), Market opportunity, What investment supports (4), Partnerships/investor audiences (Angels, VC, Institutional/Corporate/Strategic, Family Offices), contact CTA → inquiry dialog `invest` intent.
- **/support** (`pages/SupportUs.jsx`) — Awe Day Creative Arts nonprofit: mission, scholarships/tech/community pillars, donor audiences (Individual Donors, Foundations, Philanthropies, Scholarship Sponsors, Corporate Sponsors, Community Partners), CTA → new `support` inquiry intent.

### Store (real Stripe) — `/store` + subroutes
- **Catalog** (`store_catalog.py`): 10 collections (CCDP, ANCR, CYNAIAH, VIEARTA, COHEIR, ANCRLAB, VAULTA, **THE RLMG**, **Nu RENSSNCE**, STOUT), 12 product types, **96 products**. Prices server-side (source of truth). 12 premium generated brand-aesthetic mockup images (NO logos on merch, per logo rules).
- **Frontend pages**: Store (catalog + collection/category filters), ProductDetail (`/store/product/:id`, size/qty/add/buy-now + related), Cart (`/store/cart`, qty/remove/guest-email/checkout), OrderSuccess (`/store/order/success`, polls status, clears cart), StoreLogin (`/store/login`, email/password + Google + guest), Account (`/store/account`: orders/wishlist/addresses/profile).
- **StoreProvider** (`context/StoreProvider.jsx`): cart in localStorage `ccdp-cart`, customer token `ccdp-store-token`, catalog fetch, Google session_id exchange.
- **Backend** (`store.py`): customer auth — email/password (bcrypt + JWT role=customer) AND Google Sign-In via Emergent Auth (issues our own customer JWT); guest checkout supported. Endpoints: /catalog, /auth/{register,login,google,me}, /account, /addresses (CRUD), /wishlist/{id} toggle, /checkout (multi-item Stripe Checkout via price_data, automatic tax w/ graceful fallback, shipping+phone collection), /checkout/status/{id}, /orders, /orders/{id}. Fulfillment provider-agnostic (orders store full line items + shipping → Printful can be added later).
- **Stripe**: claimable sandbox (test mode), Flow A. Tax = Stripe-calculates-only (automatic tax; head office set to Chicago, IL). Webhook at /api/stripe/webhook (idempotent). Onboarding URL available for the user to claim → live keys on deploy.
- **Admin orders** (`pages/AdminOrders.jsx`, `/admin/orders`): stats (total/paid/revenue), order table, fulfillment status (Literal enum: unfulfilled|processing|shipped|delivered|cancelled). Linked from admin header alongside Inquiries.

### Nav + footer
- Nav (`content.js` NAV_LINKS/MORE_LINKS/CONTACT_STRIP, `Navbar.jsx`): kept existing labels; added **Invest**, **Store**, a **More** dropdown (Technology Ecosystem, Institutional Value, Leadership, Support Us, Resources), a cart button with count badge, and an account button. Mobile sheet includes all.
- Footer (`Footer.jsx`): added websites ccdpbyancr.com + aweday.org, kept awe@aweday.org, added persistent **contact strip** (Visit CCDPbyANCR.com / AweDay.org / email).

### Testing
- Verified via testing_agent (iteration_20): backend **100% (25/25)** store tests + frontend 100% of tested flows (Stripe hosted-payment completion intentionally skipped/BEST-EFFORT). Fixed 2 minor items after: fulfillment_status now Literal enum (422 on bad value) and StoreLogin redirect moved into useEffect (no setState-in-render warning)

## Update (2026-06) — ANCR Shop "The Collections" grid: full ecosystem, grouped, logo-led
- Per user direction, the ANCR Shop "The Collections" section (`pages/Store.jsx`, `shop-lineup`) now presents the **complete ecosystem grouped into 4 divisions**, each card showing the **official logo as primary identifier + collection name underneath + "Coming Soon" badge**, premium editorial dark cards (accent wash, top hairline, hover lift/scale).
  - **Education:** CCDP, ANCRA, ADCA
  - **Technology:** ANCR, ANCRLAB, ANCRSYNC, ANCRVIEW, ANCRID, ANCRWAV, CYNAIAH, INHEIRA, VAULTA, PASSPORT
  - **Lifestyle & Wellness:** VIEARTA, COHEIR
  - **Music & Culture:** THE RLMG, Nu RENSSNCE, STOUT
- Logos served from local official brand assets (`/brand/modules/*.png`, `/brand/ccdp-colored.png`) — never recreated/recolored. White-background logos (ANCRSYNC, PASSPORT) rendered on a clean white plate for legibility on dark cards.
- **THE RLMG, Nu RENSSNCE, STOUT have no official logo** → rendered as premium typographic placeholders (styled brand name), per no-logo-generation rule. Swap to official logos when the user uploads them.
- Removed the earlier external-CDN logo URLs and the old flat 10-item grid. Featured Campaigns editorial section left untouched (user confirmed).
- New data-testids: `collection-group-{education|technology|lifestyle-wellness|music-culture}`, `collection-{id}` for all 18.
- **Verification:** frontend compiles clean; all 15 referenced logo files confirmed present on disk. NOTE: could not capture a scrolled screenshot of the grid (screenshot tool returned top viewport only) — grid render is agent-code-verified, not yet visually confirmed by screenshot/user.

## Update (2026-06b) — ANCR Shop: removed 3 non-ecosystem collections + logo fixes
- Per user, **removed the entire "Music & Culture" group** (STOUT, THE RLMG, Nu RENSSNCE). Shop now shows **15 collections across 3 divisions** (Education 3, Technology 10, Lifestyle & Wellness 2). No typographic placeholders remain — every card uses an official logo.
- Fixed PASSPORT + ANCRSYNC logos: they are transparent PNGs with colored artwork, so removed the white-plate treatment — both now render directly on the dark cards (no white boxes).

## Update (2026-06c) — ANCR Shop: cinematic luxury lookbook enhancement (tested 100%, iteration_25)
- Whole-Store visual enhancement (no layout/nav/type/animation redesign — inherits Home's design language). Addressed user complaint that the Store had gone flat.
- **Downloaded 9 REAL approved campaign posters** to `/app/frontend/public/brand/store/` (CCDP Paramount Fashion Line, VIEARTA, INHEIRA, ANCRSYNC, The Hat Collection + clean model shots ANCRLAB/ANCRID/ANCRA/CCDP hero). All feature diverse models; no stock/AI imagery used (custom brand assets take priority).
- **New `Atmosphere` component** (layered spectrum glow orbs + `.bg-grid` texture + gradient top-seams) applied to every section → eliminates flat black, adds cinematic depth. Sections use gradient dark↔charcoal blends for smooth transitions.
- **New sections:** `shop-paramount` (immersive Paramount Fashion Line feature), `shop-lookbook` (4 full campaign posters: VIEARTA, INHEIRA, ANCRSYNC, full-width Hat Collection). Founder's Collection rebuilt as a 2-col editorial split with the INHEIRA campaign. Featured Campaigns spotlights = ANCRLAB/ANCRID/ANCRA (clean model shots).
- Collections grid kept (grouped, logo-led) with richer card gradients/accent hairlines.
- **Verified via testing_agent (iteration_25): 100%** — all 8 sections render, all 27 images load, waitlist submit works (real POST /api/waitlist), zero console errors, zero horizontal overflow at 1440px & 390px.
- **Design decisions locked (via ask_human):** keep 15 collections (STOUT/RLMG/Nu RENSSNCE stay removed); OK to use diverse editorial stock (Unsplash/Pexels) elsewhere, no AI people, custom assets always override; **Home page is the design benchmark** — enhance remaining pages one at a time to match, enhance-only (no redesign).

## Update (2026-06d) — Site-wide cinematic visual enhancement pass (tested 100%, iteration_26)
Enhance-only pass per user's comprehensive brief (preserve all layouts/nav/typography/animations/content). Addressed "flat black" + "abrupt dark↔light transitions".
- **New CSS utilities** (`index.css`): `.section-rich` (dark base + 3 layered spectrum radial glows) and `.section-rich-alt` (charcoal variant). Applied as `background-image` so glows always paint behind content — zero z-index risk.
- **New component** `components/Atmosphere.jsx` → `LightSeam` (top/bottom dark gradient fade that blends cream sections into their dark neighbours).
- **Home:** smoothed the two cream sections (`Partnerships`, `Research`) with `LightSeam` + `overflow-hidden` + content `relative z-10`. Home's dark sections already carry bg-grid/glows (benchmark) — left intact.
- **Rich backgrounds applied** to all flat dark sections on: Invest, SupportUs, Framework, Ecosystem, Platform, Resources (swapped `bg-ccdp-black`/`bg-ccdp-charcoal` section backgrounds → `section-rich`/`section-rich-alt`). Platform's cream per-branch section also got `LightSeam`.
- **Diverse editorial photography bands** added additively (new full-width sections, existing layouts untouched) to the two most image-empty pages: `invest-editorial-band` (diverse studio collaboration) and `support-editorial-band` (diverse creative community). Brand duotone spectrum overlay + short on-tone headline, matching Home's people-band aesthetic. Real Unsplash editorial photos (200 OK), no AI people; custom assets take priority elsewhere.
- **Verified via testing_agent (iteration_26): 100%** across all 8 public routes at 1440px & 390px — zero console errors, zero horizontal overflow, cream sections fully readable above LightSeam, all content/data-testids intact, inquiry dialog opens. Editorial bands (added post-test) compile clean, images 200, SupportUs band screenshot-confirmed.
- **Remaining for next pass (optional):** deeper photography on Framework/Ecosystem interior panels; Home benchmark micro-polish if user wants more depth on specific sections.

## Update (2026-06e) — Eliminated all bright cream/white sections (tested 100%, iteration_27)
- User: the cream sections were "too bright/jarring." Converted the four remaining light sections fully to the dark cinematic treatment (edge-fade LightSeam wasn't enough) while preserving all layout/content/testids:
  - Home: `Partnerships.jsx`, `Research.jsx`, `Partners.jsx` (bg-ccdp-cream → `section-rich`/`section-rich-alt`; text flipped to ccdp-white/cream; cards → white/[0.03] dark glass; CTAs → gradient).
  - Platform: per-branch breakdown section → `section-rich-alt` dark.
- The whole public site now reads as one cohesive dark cinematic experience — **no bright cream/white full-width sections remain** anywhere. `LightSeam` is now unused (kept in Atmosphere.jsx, harmless).
- **Verified via testing_agent (iteration_27): 100%** — all sections dark + readable (white headings, cream/55% body), all testids/counts intact (retain 5, provide 11, models 4, research 4, partner-category 8, branch-platform 18, all 18 logos load), CTAs open dialog, zero console errors, zero overflow at 1440px & 390px.

## Update (2026-06f) — Photography correction + motion/animation restore
- **Editorial band photos corrected:** user noted the band people weren't right (white men, not musicians). Swapped both to authentic **Black musicians in the studio** — Invest band → `photo-1763480521691` (producer at keyboard), Support band → `photo-1772419168102` (guitarist). Verified 200 + screenshot-confirmed on Invest.
- **Globe & lights "stopped moving" — root cause found:** the Ecosystem orbit-ring globe (`.animate-orbit/.animate-orbit-rev`) and the GlobalAdoption pulsing city lights (`motion-safe:animate-ping motion-reduce:hidden`) were being frozen/hidden by the site's `@media (prefers-reduced-motion: reduce)` rule whenever a device has "Reduce Motion" enabled. Not a code regression — a device setting.
  - Fix (owner wants a motion-driven brand): relaxed the reduce-motion media query to only calm `scroll-behavior` (no longer freezes keyframe animations), and removed `motion-safe/motion-reduce:hidden` gating on the city lights so the globe orbit + city lights **always animate** regardless of device setting.
- Compile clean; self-tested (compile + image 200s + screenshot).

## Update (2026-06g) — Framework hero globe: subtle premium motion
- Overlaid elegant motion on the existing Framework hero image (image/layout untouched): slow orbital rings (`.animate-orbit`/`.animate-orbit-rev`, 90s), one orbiting "satellite" light on the outer ring, and a gently breathing blue ambient glow (new `.animate-breathe`, `soft-breathe` 9s ease-in-out). Faint, non-distracting, matches Ecosystem/Global Adoption motion language. Pure CSS transforms, lightweight. Compile clean + screenshot-confirmed render.

## Update (2026-06h) — Store campaigns + parallax + Black/Brown interior photography (tested 100%, iteration_28)
- **Store campaigns added** (real approved posters, local `/brand/store/`): CYNAIAH, ANCRD, and the ANCR Media Network triptych (ANCRMEDIA/ANCRWAV/ANCRVIEW) → new Lookbook cards (`lookbook-cynaiah`, `lookbook-ancrd`, `lookbook-ancrmedianetwork`). Lookbook now 7 posters.
- **Collection grid** Technology group gained `collection-ancrmedia` and `collection-ancrd` (official logos `/brand/modules/ancrmedia.png`, `ancrd.png`).
- **Scroll parallax:** new reusable `components/ParallaxBand.jsx` (framer-motion useScroll/useTransform, subtle ±10% y, image scaled 124% so no edge reveal). Applied to Invest + SupportUs bands.
- **Interior photography (Black & Brown, per user emphasis):** new parallax bands on Framework (`framework-editorial-band`, creative students) and Ecosystem (`ecosystem-editorial-band`, creative team). Diverse Black/Brown US creatives; custom brand assets still take priority.
- **Verified via testing_agent (iteration_28): 100%** — all 7 lookbook posters + new grid cards + 4 parallax bands render with images loading, waitlist still submits, zero console errors, zero overflow at 1440px & 390px.
- **Email system:** remains fully built and held (no further prompts) until user provides Resend key + verified aweday.org domain at launch.

## Update (2026-06i) — ANCR flagship campaign + larger "Launching Soon"
- Added the **ANCR flagship** collection campaign (`/brand/store/ancr-flagship.jpg`, from `Ancr3.jpg`) as the **first, full-width** Lookbook poster (tag "Flagship Collection", "Built for the culture…" / "Discover. Develop. Deploy."). (CCDP×ANCR grid `Ancr1.jpg` NOT added — user said "ADD ANCR" only.)
- **"Launching Soon" made much larger:** now a massive gradient display `<h2>` (text-5xl→text-9xl, uppercase), on `section-rich` with py-28/md:py-44, bigger glow, dev note as large subheading, + new `launching-join-waitlist` CTA. Mobile-safe base size (no overflow).
- Compile clean; flagship image saved. NOTE: app is now deployed to production (ccdpbyancr.com); preview changes require user redeploy to go live..

### Pending / user to complete
- **Claim the Stripe sandbox** (onboarding URL) to go live; platform swaps to live keys on deploy after KYC.
- **Release 2** (paused for user review): Printful/Printify fulfillment integration + automated shipping/inventory; optional richer per-product branded imagery.
- Payment settlement not exercised end-to-end in automation (no paid orders yet); test card 4242 works on the hosted page.

## Update (2026-08-07b) — Test purchase verified + transactional emails + password reset + order tracking
- **COMPLETE test purchase verified** (testing_agent iteration_21): real Stripe hosted-checkout payment with test card 4242 → order `ord_e6586a7ccc53` PAID $68.00, appears in `/admin/orders` (paidCount=1, revenue=$68), confirmation page renders. Backend 11/11 + prior 25/25.
- **Branded transactional emails** (`backend/store_email.py`, gated on RESEND_API_KEY, premium dark CCDP-powered-by-ANCR template with CCDPbyANCR.com / AweDay.org / awe@aweday.org footer): Welcome (on register), Order Confirmation + receipt (on first paid transition, idempotent via order.email_status), Shipping (w/ tracking), Delivery, Status Update — wired into register, `_sync_paid`, and admin fulfillment PATCH. All non-blocking; skipped gracefully until Resend key is set.
- **Password reset flow**: POST /api/store/auth/forgot (no account-existence leak) + /api/store/auth/reset (hashed token in `store_password_resets`, 60-min expiry). Frontend `/store/forgot` + `/store/reset` pages, "Forgot your password?" link on login. Reset email gated on Resend.
- **Admin order tracking**: OrderStatusBody now strict `Literal` (422 on bad value); added optional `tracking_number`; AdminOrders UI has per-order tracking input; setting status→shipped/delivered/processing/cancelled triggers the matching customer email.
- Fixed carryover: StoreLogin redirect moved into useEffect (no setState-in-render).

### STILL NEEDS USER INPUT to complete the approved items
- **Resend API key** → activates all the branded emails above (built & ready).
- **Printful (Release 2)** → needs Printful account + API key; provider-agnostic order model already stores line items + shipping + tracking.
- **Official logo files per collection** → to replace the current premium placeholder merch mockups with logo-bearing product art (logos must be official uploaded artwork, never recreated).

## Update (2026-08-07c) — PIVOT: ANCR Shop = luxury preview + waitlist (functional store now dormant)
Per user direction, the public **/store** is no longer a functional ecommerce store. It is a premium "coming soon" brand preview with a waitlist. No fake products/prices/cart/checkout/inventory/reviews shown publicly.
- **`Store.jsx` rewritten** → ANCR Shop preview: hero ("ANCR Shop" / "The Official Merchandise of the ANCR Ecosystem" + Join the Waitlist / Explore Collections), Featured Collections (10 premium "Collection Coming Soon" cards — CCDP, ANCR, CYNAIAH, VIEARTA, COHEIR, ANCRLAB, VAULTA, THE RLMG, Nu RENSSNCE, STOUT; no mockups uploaded yet so all show Coming Soon), Founder's Collection, Waitlist signup (Name + Email), Launching Soon callout.
- **Waitlist backend**: POST /api/store/waitlist (public, upsert by email, gated confirmation email) + GET /api/store/admin/waitlist (admin). Stored in `db.store_waitlist`. Admin page **`/admin/waitlist`** (`AdminWaitlist.jsx`) with CSV export + total; linked in all admin headers.
- **Navbar**: removed cart + account buttons (no public ecommerce affordances). Store link + More dropdown retained. Other pages untouched.
- **App.js**: removed public ecommerce routes (product/cart/order-success/login/forgot/reset/account) and StoreProvider; added `/store/*` → /store and `*` → / redirects so old URLs don't dead-end.
- **Dormant (kept for future conversion, NOT publicly linked)**: full Stripe checkout, customer accounts, cart, orders, and 306-SKU inventory backend + admin Orders/Inventory pages. Can be re-activated to convert the preview into a real store without redesigning the page.
- Verified via testing_agent (iteration_23): 100% (backend 6/6 + all frontend). Preview sections, 10 Coming-Soon collections, waitlist submit→admin, no cart/account, other pages regression-clean.
- No merchandise mockups uploaded yet → every collection correctly shows "Collection Coming Soon". Only logo/brand assets exist in the asset library; no apparel mockups.
