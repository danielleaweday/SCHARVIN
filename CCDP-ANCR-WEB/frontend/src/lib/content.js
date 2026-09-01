// Central content for the CCDP institutional site — v2.0 narrative.
// Positioning: CCDP is a higher-education model, an education-technology company,
// an AI learning platform, a university partner, a creator operating system,
// a workforce-development platform, a global creative network, and a lifelong
// creator ecosystem — NOT a music school, course catalog, or list of majors.

export const NAV_LINKS = [
  { label: "About", hash: "#challenge" },
  { label: "The CCDP Solution", hash: "#learning-experience" },
  { label: "Schools & Pathways", path: "/framework" },
  { label: "Invest", path: "/invest" },
  { label: "Store", path: "/store" },
  { label: "Request Information", hash: "#contact" },
];

// Secondary / deeper links — surfaced in the "More" dropdown (desktop) and mobile sheet.
export const MORE_LINKS = [
  { label: "Technology Ecosystem", path: "/platform" },
  { label: "Institutional Value", hash: "#partnerships" },
  { label: "Leadership", hash: "#leadership" },
  { label: "Support Us", path: "/support" },
  { label: "Resources", path: "/resources" },
];

// Persistent contact / brand strip shown near the footer.
export const CONTACT_STRIP = [
  { label: "CCDPbyANCR.com", href: "https://ccdpbyancr.com", kind: "web" },
  { label: "AweDay.org", href: "https://aweday.org", kind: "web" },
  { label: "awe@aweday.org", href: "mailto:awe@aweday.org", kind: "mail" },
];

export const AUDIENCES = [
  "Universities & Colleges",
  "Foundations",
  "Corporate Sponsors",
  "EdTech Investors",
  "Government Agencies",
  "Workforce Organizations",
  "Industry Leaders",
];

// PART 1 — Why creative education must evolve (visionary, collaborative, forward-looking).
export const CHALLENGE = {
  overline: "Why Creative Education Must Evolve",
  heading: "The creative economy has transformed. Tomorrow's creators deserve tomorrow's education.",
  lead: "A generation ago, a creative career followed a predictable path. Today, creators build across disciplines, borders, and technologies — reinventing themselves faster than any fixed program can anticipate. Creative education must match how creators actually learn, work, and earn now — and the careers they will invent next.",
  items: [
    { icon: "Cpu", title: "How creators work has changed", desc: "New tools have rewritten how creative work is made, produced, and distributed." },
    { icon: "Rocket", title: "How creators earn has changed", desc: "Careers are increasingly built by founders, owners, collaborators, and enterprising creative professionals." },
    { icon: "Globe2", title: "Where creators work has changed", desc: "Creative work happens across borders, cultures, and disciplines — collaborative by default." },
    { icon: "Workflow", title: "How creators grow has changed", desc: "Learning, real experience, and income advance together throughout one continuous journey." },
  ],
  stat: { value: "The future.", label: "CCDP exists to help institutions prepare creators for the future they are entering — together." },
};

// PART 2 — Why CCDP is different (positive, integrative framing — one connected ecosystem).
export const SOLUTION = {
  overline: "One Integrated Model",
  heading: "CCDP brings together what creative education has never connected before.",
  lead: "A connected educational ecosystem where higher education, technology, industry, and career development operate as one continuous experience.",
  statement: "CCDP integrates academic excellence, artificial intelligence, studio learning, global collaboration, industry mentorship, and career development into one connected model designed for today's creative economy.",
  nodes: [
    { label: "Higher Education", icon: "GraduationCap" },
    { label: "Education Technology", icon: "MonitorSmartphone" },
    { label: "Artificial Intelligence", icon: "BrainCircuit" },
    { label: "Industry Mentorship", icon: "Briefcase" },
    { label: "Creative Workforce Development", icon: "Factory" },
    { label: "Global Creative Collaboration", icon: "Globe2" },
    { label: "Creator Infrastructure", icon: "Boxes" },
    { label: "Lifelong Career Development", icon: "Infinity" },
  ],
};

// Supporting concentrations — deliberately de-emphasized (no longer the main attraction).
export const CONCENTRATIONS = [
  "Music", "Film & Television", "Media & Content", "Design", "Writing",
  "Gaming", "Animation", "Photography", "Audio", "Emerging Creative Technology",
];

// PART 3 — The new creative degree: CCDP signature intellectual property.
// These proprietary experiences replace traditional majors and course lists.
export const SIGNATURE_EXPERIENCES = [
  { name: "Creative Identity™", icon: "Fingerprint", accent: "#2e7bff", desc: "Define your artistic voice, professional identity, and creative point of view from day one." },
  { name: "Creative Operating Systems™", icon: "Boxes", accent: "#7a3ff2", desc: "Build the personal systems, workflows, and tools that run a modern creative career." },
  { name: "RightPrint™", icon: "ShieldCheck", accent: "#06b6d4", desc: "Understand, register, and protect the rights to everything you create." },
  { name: "INHEIRA™", icon: "ScrollText", accent: "#7a8cff", desc: "Document, own, and protect everything you create — from the first idea through publishing, release, royalties, and legacy." },
  { name: "SongPrint™", icon: "AudioWaveform", accent: "#e0349e", desc: "Develop a signature songwriting craft and a recognizable sonic identity." },
  { name: "CommunityOS™", icon: "Users", accent: "#f97316", desc: "Build, grow, and lead creative communities and engaged audiences." },
  { name: "Creative Genome™", icon: "Dna", accent: "#a855f7", desc: "Map your creative strengths, influences, and personalized path to mastery." },
  { name: "Creator Finance™", icon: "Wallet", accent: "#10b981", desc: "Master the money behind a creative career — income, budgeting, taxes, and wealth." },
  { name: "RoyaltyOS™", icon: "Coins", accent: "#eab308", desc: "Track, manage, and grow royalty, licensing, and catalog income." },
  { name: "WorldStage™", icon: "Globe2", accent: "#3b82f6", desc: "Take your work to global audiences, international markets, and world stages." },
  { name: "Stage2Stream™", icon: "Radio", accent: "#f43f5e", desc: "Move seamlessly from live performance to streaming, distribution, and release." },
  { name: "DealMaker™", icon: "Handshake", accent: "#14b8a6", desc: "Negotiate contracts, deals, and partnerships with professional fluency." },
  { name: "Ecosystem Architect™", icon: "Network", accent: "#7a3ff2", desc: "Design the network of collaborators, platforms, and partners around your work." },
  { name: "LegacyBuild™", icon: "Landmark", accent: "#f59e0b", desc: "Build lasting creative assets, catalogs, and generational value." },
  { name: "TourBoss™", icon: "MapPinned", accent: "#ec4899", desc: "Plan, book, and run professional tours and live experiences." },
  { name: "BrandOS™", icon: "Sparkles", accent: "#2e7bff", desc: "Build and operate a personal and creative brand at scale." },
  { name: "Creative Incubator™", icon: "Rocket", accent: "#f97316", desc: "Launch creative ventures, products, and businesses." },
  { name: "CodeSwitch™", icon: "Code2", accent: "#06b6d4", desc: "Move fluently across technology, AI, and creative code — across every discipline." },
];

// PART 4 — ANCR Education Operating System: the Eight Intelligence Systems.
// Every AI capability nests under one of these eight flagship systems.
export const INTELLIGENCE_SYSTEMS = [
  { name: "Learning Intelligence™", icon: "GraduationCap", accent: "#2e7bff", desc: "Adaptive, personalized learning that meets every creator exactly where they are — and guides where they're going." },
  { name: "Creative Intelligence™", icon: "Sparkles", accent: "#a855f7", desc: "AI creative collaboration for ideation, feedback, and craft across every discipline." },
  { name: "Studio Intelligence™", icon: "AudioWaveform", accent: "#e0349e", desc: "Production and studio assistance for music, media, design, and content." },
  { name: "Career Intelligence™", icon: "Rocket", accent: "#f59e0b", desc: "Career guidance, opportunity matching, and real-time readiness insights." },
  { name: "Collaboration Intelligence™", icon: "Users", accent: "#f97316", desc: "Connecting creators, mentors, and teams around shared projects and goals." },
  { name: "Faculty Intelligence™", icon: "BookOpen", accent: "#06b6d4", desc: "Tools that extend faculty capacity, enrich instruction, and scale great teaching." },
  { name: "Institution Intelligence™", icon: "LayoutDashboard", accent: "#10b981", desc: "Analytics and dashboards that power institutional decisions and student success." },
  { name: "Creator Intelligence™", icon: "Infinity", accent: "#7a3ff2", desc: "Lifelong intelligence that grows with the creator through every stage of their career." },
];

// PART 5 — Shared global collaboration (a signature CCDP differentiator).
export const SHARED_COLLAB = [
  { name: "Shared Studio Sessions™", icon: "Mic2" },
  { name: "Shared Writing Rooms™", icon: "PenLine" },
  { name: "Shared Production Labs™", icon: "SlidersHorizontal" },
  { name: "Shared Creative Challenges™", icon: "Trophy" },
  { name: "Shared Artist Development™", icon: "Sparkles" },
  { name: "Shared Industry Projects™", icon: "Briefcase" },
  { name: "Shared Portfolio Reviews™", icon: "FolderCheck" },
  { name: "Shared Global Collaborations™", icon: "Globe2" },
  { name: "Shared Release Campaigns™", icon: "Rocket" },
  { name: "Shared Mentorship™", icon: "HeartHandshake" },
  { name: "Shared Creative Teams™", icon: "Users" },
];

// PART 6 — University partnerships (CCDP plugs into universities; it does not replace them).
export const UNIVERSITY = {
  overline: "University Partnerships",
  heading: "CCDP complements and strengthens your institution.",
  lead: "CCDP is an educational infrastructure partner. Institutions keep everything that makes them a university — and gain a modern creative education operating system on top of it.",
  retain: [
    "Accreditation",
    "Faculty",
    "General Education",
    "Institutional Identity",
    "Student Experience",
  ],
  provide: [
    "Licensed Curriculum",
    "ANCR Education Operating System",
    "Learning Management Integration",
    "AI Learning Infrastructure",
    "Creative Career Development",
    "Faculty Enablement",
    "Creative Workforce Alignment",
    "Industry Partnerships",
    "Global Collaboration",
    "Career Ecosystem",
    "Technology Infrastructure",
  ],
};

// FLAGSHIP — Signature Industry Initiatives™ (real initiatives with lasting impact).
export const INITIATIVES_FEATURED = {
  opening: "Every graduating class leaves the world with more gratitude than it found it.",
  title: "Creating a New Global Tradition of Gratitude",
  poweredBy: "Powered by The Grateful Music Initiative™",
  image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?crop=entropy&cs=srgb&fm=jpg&w=1600&q=85",
  video: "https://videos.pexels.com/video-files/7086275/7086275-sd_960_506_25fps.mp4",
  body: [
    "Every year, students from CCDP and partner institutions come together to create, record, publish, and release original gratitude music that becomes part of a growing global collection celebrating thankfulness, hope, family, service, faith, generosity, and community.",
    "More than an annual project, this initiative is building a new creative tradition that invites future generations of creators around the world to contribute their voices through music.",
  ],
  outcomesLabel: "Through The Grateful Music Initiative™, students…",
  outcomes: [
    { icon: "Globe2", text: "Build a growing global catalog of gratitude music." },
    { icon: "Handshake", text: "Collaborate with creators across institutions and countries." },
    { icon: "Music", text: "Write original songs that become part of a permanent annual collection." },
    { icon: "Mic", text: "Produce and release commercially distributed recordings." },
    { icon: "Heart", text: "Use music to strengthen families, communities, and cultures." },
    { icon: "BookOpen", text: "Preserve stories of gratitude for future generations." },
    { icon: "Landmark", text: "Help establish gratitude music as an enduring creative tradition." },
    { icon: "Sparkles", text: "Leave a cultural legacy that continues long after graduation." },
  ],
};

export const INITIATIVES = [
  { name: "Shared Global Creation™", icon: "Globe2", accent: "#2e7bff", image: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?crop=entropy&cs=srgb&fm=jpg&w=900&q=85",
    desc: "Creators collaborate across universities, countries, cultures, and disciplines through shared writing sessions, production labs, innovation studios, and collaborative creative projects powered by ANCR." },
  { name: "Professional Production™", icon: "Clapperboard", accent: "#e0349e", image: "https://images.unsplash.com/photo-1518972559570-7cc1309f3229?crop=entropy&cs=srgb&fm=jpg&w=900&q=85",
    desc: "Students work in multidisciplinary teams to develop professional-quality releases, films, campaigns, podcasts, performances, digital experiences, and portfolio-ready creative assets." },
  { name: "Creator Incubator™", icon: "Rocket", accent: "#f59e0b", image: "https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?crop=entropy&cs=srgb&fm=jpg&w=900&q=85",
    desc: "Students develop labels, startups, creative agencies, productions, technologies, intellectual property, and entrepreneurial ventures with guidance from faculty, AI learning intelligence, and industry mentors." },
  { name: "Industry Research & Innovation™", icon: "FlaskConical", accent: "#a855f7", image: "https://images.unsplash.com/photo-1671124739629-0583d5c856a2?crop=entropy&cs=srgb&fm=jpg&w=900&q=85",
    desc: "Students participate in research exploring artificial intelligence, creative education, creator economics, workforce development, emerging technologies, and the future of the global creative industries." },
  { name: "Global Showcase™", icon: "Sparkles", accent: "#10b981", image: "https://images.unsplash.com/photo-1515175192010-cf3250992719?crop=entropy&cs=srgb&fm=jpg&w=900&q=85",
    desc: "Annual exhibitions, performances, portfolio showcases, premieres, demonstrations, and capstone experiences where students present their work to employers, investors, foundations, university partners, and industry leaders." },
];

// PART 7 — Career outcomes now live in the Industry Mentorship flagship (MENTORSHIP.output).

// PART 8 — The lifelong creator ecosystem.
export const LIFECYCLE = ["Discover", "Learn", "Create", "Collaborate", "Build", "Launch", "Work", "Lead", "Teach", "Mentor", "Innovate", "Transform"];

// FLAGSHIP — Industry Mentorship & Studio Leadership.
// CCDP is an industry apprenticeship embedded within higher education — not self-paced online learning.
export const MENTORSHIP = {
  overline: "Industry Mentorship & Studio Leadership",
  heading: "You build alongside the industry, from day one.",
  lead: "Every creator develops inside a collaborative studio environment led by working professionals actively shaping today's creative industries — an industry apprenticeship embedded within higher education.",
  mentors: [
    "University Faculty", "Academic Advisors", "Industry Professionals", "Award-Winning Artists",
    "Songwriters", "Producers", "Engineers", "Creative Directors", "Entertainment Executives",
    "Entrepreneurs", "Technologists", "Brand Strategists", "Financial Experts",
    "Publishing Professionals", "Marketing Leaders", "Media Executives", "Creative Coaches",
    "Career Advisors", "International Creators",
  ],
  verbsStatement: "And they don't simply teach. They mentor, produce, develop, release, and launch original work alongside you.",
  studioModel: [
    { name: "Creative Labs™", icon: "FlaskConical", accent: "#a855f7" },
    { name: "Studio Sessions™", icon: "Mic2", accent: "#e0349e" },
    { name: "Writing Camps™", icon: "PenLine", accent: "#2e7bff" },
    { name: "Production Intensives™", icon: "SlidersHorizontal", accent: "#06b6d4" },
    { name: "Innovation Labs™", icon: "Lightbulb", accent: "#14b8a6" },
    { name: "Creative Sprints™", icon: "Zap", accent: "#eab308" },
    { name: "Industry Challenges™", icon: "Trophy", accent: "#f59e0b" },
    { name: "Professional Residencies™", icon: "Landmark", accent: "#7a3ff2" },
    { name: "Capstone Experiences™", icon: "GraduationCap", accent: "#3b82f6" },
    { name: "Portfolio Showcases™", icon: "FolderCheck", accent: "#10b981" },
    { name: "Release Teams™", icon: "Rocket", accent: "#f97316" },
    { name: "Global Studios™", icon: "Globe2", accent: "#ec4899" },
    { name: "Professional Production™", icon: "Clapperboard", accent: "#f43f5e" },
  ],
  output: [
    "Professional Portfolio", "Published Creative Work", "Personal Brand", "Professional Website",
    "Media Kit", "Resume", "Industry Experience", "Global Collaborations", "Professional Network",
    "Business Systems", "Financial Literacy", "Technology Fluency", "AI Fluency", "Career Readiness",
    "Revenue Strategy", "Intellectual Property Portfolio",
  ],
  outcome: {
    stat: "~30",
    statLabel: "professionally developed original creative works",
    body: "Every student graduates with a substantial body of professional work — produced through collaborative studio experiences and industry mentorship. The emphasis is on graduating with a significant, professional body of work.",
    examples: ["Songs", "Films", "Animation projects", "Design systems", "Campaigns", "Podcasts", "Publications", "Software", "Performances"],
  },
  team: [
    { label: "Faculty Mentors", icon: "GraduationCap" },
    { label: "Industry Mentors", icon: "Briefcase" },
    { label: "Creative Coaches", icon: "Sparkles" },
    { label: "AI Learning Intelligence", icon: "BrainCircuit" },
    { label: "AI Studio Intelligence", icon: "AudioWaveform" },
    { label: "Career Advisors", icon: "Compass" },
    { label: "Peer Collaborators", icon: "Users" },
    { label: "Studio Teams", icon: "Mic2" },
    { label: "Professional Alumni", icon: "Award" },
    { label: "Industry Partners", icon: "Handshake" },
    { label: "Global Creative Community", icon: "Globe2" },
  ],
  positioning: {
    eyebrow: "Education. Creation. Ownership. Opportunity.",
    headline: "Creative education, connected from learning to livelihood.",
    body: "CCDP™ powered by ANCR™ brings academic learning, creative production, technology, collaboration, mentorship, business development, wellness, ownership, and career preparation into one professionally guided experience.",
    supporting: "Students develop their craft while building real bodies of work, professional relationships, verified experience, and sustainable pathways into the creative industries.",
    emphasis: "They do more than prepare for graduation. They begin building what comes after it.",
  },
};

export const BRANCHES = [
  { id: "education", label: "Education", desc: "Learn, create, and earn real credentials.", color: "#2e7bff" },
  { id: "technology", label: "Technology", desc: "The intelligent systems that power it all.", color: "#7a3ff2" },
  { id: "careers", label: "Creative Economy", desc: "From portfolio to profession, publishing, and beyond.", color: "#e0349e" },
];

// The ANCR operating system + the platforms it unifies.
export const PLATFORMS = [
  { id: "ancr", name: "ANCR", branch: "technology", icon: "Boxes", os: true, shot: "dashboard", accent: "#7a3ff2", logo: "/brand/modules/ancr.png", logoBg: "#05060a",
    tagline: "The operating system", short: "The operating system powering the entire ecosystem.",
    desc: "ANCR is the intelligent operating system that unifies every CCDP platform into one connected experience — a single identity, one dataset, and a continuous journey from a learner's first lesson to a thriving career.",
    benefits: ["Unifies every platform into one experience", "One identity and record across the journey", "Built to scale across institutions"] },
  { id: "ancra", name: "ANCRA", branch: "education", icon: "GraduationCap", shot: "learn", accent: "#3b82f6", logo: "/brand/modules/ancra.png", logoBg: "#000000",
    tagline: "Learn · Grow · Transform", short: "AI powered learning and coaching.",
    desc: "An AI-powered learning assistant that personalizes education, delivers real-time coaching, and guides each learner with adaptive feedback and career guidance.",
    benefits: ["Personalized learning paths", "24/7 AI coaching & feedback", "Adaptive skill assessment"] },
  { id: "ancrlab", name: "ANCRLAB", branch: "education", icon: "FlaskConical", shot: "dashboard", accent: "#a855f7",
    logo: "/brand/modules/ancrlab.png", logoBg: "#000000",
    tagline: "Create · Build · Own", short: "Project creation, experimentation, and portfolio development.",
    desc: "A studio-grade collaborative workspace where creators build real projects, experiment with professional tools, and develop portfolios that get them hired.",
    benefits: ["Studio-grade project workspace", "Build a professional portfolio", "Experiment with real industry tools"] },
  { id: "ancrsync", name: "ANCRSYNC", branch: "technology", icon: "Workflow", shot: "dashboard", accent: "#06b6d4", logo: "/brand/modules/ancrsync.png", logoBg: "#ffffff",
    tagline: "Connect · Collaborate · Ship", short: "Collaboration and workflow across the ecosystem.",
    desc: "The collaboration and workflow layer connecting students, educators, mentors, and industry professionals around shared projects and goals.",
    benefits: ["Real-time collaboration", "Connect students, mentors & pros", "Streamlined project workflows"] },
  { id: "ancrlaunch", name: "ANCRLaunch", branch: "careers", icon: "Rocket", shot: "dashboard", accent: "#f59e0b", logo: "/brand/modules/ancrlaunch.png", logoBg: "#000000",
    tagline: "Launch · Work · Advance", short: "Career readiness and employment.",
    desc: "A career readiness and opportunity platform that moves creators into internships, employment, entrepreneurship, and industry partnerships.",
    benefits: ["Internship & job pipelines", "Direct employer partnerships", "Entrepreneurship pathways"] },
  { id: "ancrid", name: "ANCRID", branch: "technology", icon: "BadgeCheck", shot: "dashboard", accent: "#14b8a6", logo: "/brand/modules/ancrid.png", logoBg: "#000000",
    tagline: "Verified · Trusted · Yours", short: "Verified digital creative identity.",
    desc: "A verified digital creative identity that showcases credentials, achievements, certifications, and professional work — trusted by institutions and employers.",
    benefits: ["Verified credentials & work", "A portable creative identity", "Trusted by employers"] },
  { id: "passport", name: "Passport", branch: "technology", icon: "IdCard", shot: "dashboard", accent: "#eab308", logo: "/brand/modules/passport.png", logoBg: "#ffffff",
    tagline: "Learner profile & wallet", short: "Lifelong learner profile and credential wallet.",
    desc: "A lifelong learner profile and credential wallet that tracks progress, skills, certifications, milestones, and career development across the ecosystem.",
    benefits: ["A lifelong record of growth", "Portable credential wallet", "Follows learners anywhere"] },
  { id: "coheir", name: "COHEIR", branch: "technology", icon: "Users", shot: "community", accent: "#ec4899", logo: "/brand/modules/coheir.png", logoBg: "#000000",
    tagline: "Connect · Mentor · Belong", short: "Community, mentorship, networking, and collaboration.",
    desc: "The relationship platform that fosters mentorship, networking, collaboration, and lifelong creative connection.",
    benefits: ["Mentor matching", "A lifelong creative network", "Peer collaboration"] },
  { id: "vaulta", name: "VAULTA", branch: "careers", icon: "Wallet", shot: "finance", accent: "#10b981", logo: "/brand/modules/vaulta.png", logoBg: "#000000",
    tagline: "Own · Build · Prosper", short: "A financial wellness platform for creatives.",
    desc: "A financial wellness platform designed for creatives. Full capabilities and positioning are being finalized.",
    benefits: ["Financial wellness built for creatives", "Detailed capabilities coming soon"] },
  { id: "adca", name: "ADCA", branch: "education", icon: "Palette", shot: "learn", accent: "#f97316", logo: "/brand/modules/adca.png", logoBg: "#000000",
    tagline: "Discover · Create · Lead", short: "Introducing youth to creativity and technology.",
    desc: "Awe Day Creative Arts introduces younger students to creativity, technology, innovation, and leadership through immersive learning experiences.",
    benefits: ["Youth creative development", "Early exposure to tech & arts", "Leadership & innovation"] },
  { id: "ancrd", name: "ANCRD", branch: "careers", icon: "Radar", shot: "community", accent: "#f97316", logo: "/brand/modules/ancrd.png", logoBg: "#ffffff",
    tagline: "Discover · Develop · Advance", short: "Artist Discovery & Development Network.",
    desc: "The Artist Discovery & Development Network — creator discovery, talent development, scouting, and artist incubation across the ecosystem.",
    benefits: ["Creator discovery & scouting", "Talent development & incubation", "Artist career advancement"] },
  { id: "ancrwav", name: "ANCRWAV", branch: "careers", icon: "Radio", shot: "media", accent: "#f43f5e", logo: "/brand/modules/ancrwav.png", logoBg: "#000000",
    tagline: "Discover · Stream · Amplify", short: "Audio, streaming & music ecosystem services.",
    desc: "Audio, streaming, distribution, audience engagement, creator publishing, and music ecosystem services across the network.",
    benefits: ["Audio streaming & distribution", "Creator publishing & audience engagement", "Music ecosystem services"] },
  { id: "ancrview", name: "ANCRVIEW", branch: "careers", icon: "Eye", shot: "media", accent: "#f59e0b", logo: "/brand/modules/ancrview.png", logoBg: "#000000",
    tagline: "Watch · Learn · Discover", short: "Video streaming & educational media network.",
    desc: "Video streaming, educational media, live broadcasts, events, documentaries, original programming, and visual content delivery across the ecosystem.",
    benefits: ["Video streaming & original programming", "Live broadcasts, events & documentaries", "Educational media & visual content delivery"] },
  { id: "inheira", name: "INHEIRA", branch: "careers", icon: "ScrollText", shot: "dashboard", accent: "#7a8cff", logo: "/brand/modules/inheira.png", logoBg: "#05060a",
    tagline: "From Creation to Legacy", short: "Document every creative contribution from the first idea through ownership, publishing, release, royalties, and legacy.",
    desc: "The creative ownership platform that preserves every idea, every collaborator, and every contribution from creation to legacy.",
    benefits: ["Preserve every idea and collaborator", "Track ownership, publishing, release & royalties", "From the first idea to a lasting legacy"] },
  { id: "ancrmedia", name: "ANCRMEDIA", branch: "careers", icon: "PlayCircle", shot: "media", accent: "#8b5cf6", logo: "/brand/modules/ancrmedia.png", logoBg: "transparent",
    tagline: "Distribute \u00b7 Watch \u00b7 Listen \u00b7 Stream \u00b7 Connect", short: "Media distribution and streaming across the ecosystem.",
    desc: "The media network for the ecosystem \u2014 distribute, watch, listen, stream, and connect across audio and video experiences.",
    benefits: ["Distribute and stream creative work", "Watch and listen across the network", "Connect creators with their audiences"] },
  { id: "cynaiah", name: "CYNAIAH", branch: "technology", icon: "Sparkles", accent: "#a855f7", logo: "/brand/modules/cynaiah.png", logoBg: "transparent", comingSoon: true,
    tagline: "In the CCDP ecosystem", short: "Part of the CCDP powered by ANCR ecosystem.",
    desc: "CYNAIAH is part of the CCDP\u2122 powered by ANCR\u2122 ecosystem. Full capabilities and positioning are being finalized." },
  { id: "viearta", name: "VIEARTA", branch: "careers", icon: "Palette", accent: "#f472b6", logo: "/brand/modules/viearta.png", logoBg: "#000000", comingSoon: true,
    tagline: "In the CCDP ecosystem", short: "Part of the CCDP powered by ANCR ecosystem.",
    desc: "VIEARTA is part of the CCDP\u2122 powered by ANCR\u2122 ecosystem. Full capabilities and positioning are being finalized." },
  { id: "sovreign", name: "SOVREIGN", branch: "careers", icon: "Crown", accent: "#eab308", logo: "/brand/modules/sovreign.png", logoBg: "#000000", comingSoon: true,
    tagline: "Lead · Own · Reign", short: "From education to ownership, leadership, enterprise, and legacy.",
    desc: "The lifelong career, leadership, enterprise, and wealth building platform where creators transition from education to ownership, executive leadership, business creation, and lasting legacy." },
];

// Module logos shown in the ANCR OS grid.
export const ANCR_OS_MODULES = ["passport", "ancrid", "ancrsync", "ancrlaunch", "vaulta", "inheira", "ancrview", "ancrwav", "ancrmedia", "ancrd", "adca", "cynaiah", "viearta", "sovreign"];

export const PARTNERSHIP_MODELS = [
  { icon: "FileBadge", title: "Curriculum Licensing", desc: "License CCDP's signature curriculum and intellectual property into existing creative and media programs." },
  { icon: "Cpu", title: "ANCR OS Deployment", desc: "Deploy the ANCR Education Operating System — AI learning infrastructure, dashboards, and analytics — on top of your systems." },
  { icon: "Briefcase", title: "Creative Workforce Development", desc: "Power workforce development and reskilling aligned to real creative-industry demand." },
  { icon: "LineChart", title: "Student Success & Retention", desc: "Improve engagement, outcomes, and retention with student analytics and institution intelligence." },
];

export const IMPACT_PLACEHOLDERS = [
  { title: "Metrics Coming Soon", desc: "Verified outcome data will be published as our pilot programs report results.", icon: "BarChart3" },
  { title: "Pilot Institutions", desc: "Founding university and college partners are being onboarded now.", icon: "Building2" },
  { title: "Early Partnership Opportunities", desc: "Strategic partner and employer positions are open for our first cohort.", icon: "Handshake" },
  { title: "Research In Progress", desc: "Studies on AI-enabled creative learning are actively underway.", icon: "FlaskConical" },
  { title: "Growth Targets Under Development", desc: "Our expansion roadmap and projections are being finalized with partners.", icon: "TrendingUp" },
];

export const INVESTMENT = {
  overline: "Investment Opportunity",
  heading: "A scalable platform for a new category of higher education.",
  lead: "CCDP combines the durability of higher education with the scalability of technology — a mission-aligned, revenue-generating model positioned for national expansion.",
  points: [
    { icon: "Globe2", title: "Large, growing market", desc: "A large and growing creative-education and workforce-development opportunity." },
    { icon: "Repeat", title: "Recurring institutional revenue", desc: "Durable partnerships with universities, employers, and workforce agencies." },
    { icon: "Cpu", title: "Technology-enabled scale", desc: "The ANCR operating system drives efficient, measurable growth across markets." },
    { icon: "HeartHandshake", title: "Mission-aligned impact", desc: "Measurable outcomes for learners, employers, and communities." },
  ],
  ways: ["Strategic Investment", "Philanthropic Support", "Corporate Sponsorship", "Institutional Collaboration"],
};

export const RESEARCH = {
  overline: "Research & Innovation",
  heading: "Building a new category of creative education.",
  lead: "CCDP operates at the intersection of learning science, artificial intelligence, and the creative industries.",
  areas: [
    { icon: "BrainCircuit", title: "AI in Creative Learning", desc: "Personalized instruction, coaching, and assessment powered by responsible AI." },
    { icon: "Factory", title: "Workforce Innovation", desc: "New models connecting education directly to employment and economic mobility." },
    { icon: "MonitorSmartphone", title: "Educational Technology", desc: "An integrated operating system advancing engagement, outcomes, and accessibility." },
    { icon: "Handshake", title: "Industry Collaboration", desc: "Labs and partnerships that keep learning aligned with real-world practice." },
  ],
};

export const LEADERSHIP = {
  heading: "Our Leadership & Academic Team",
  founder: {
    name: "Danielle Nichol Stephens McMillan",
    role: "Founder & President, CCDP™",
    role2: "Executive Director, Awe Day Creative Arts, Inc.",
    initials: "DM",
    photo: "/team/danielle-mcmillan.png",
    email: "danielle@aweday.org",
    linkedinName: "Danielle Stephens McMillan",
    statement: "I founded CCDP because I believe creative talent deserves an education system built for today's world, not yesterday's. CCDP was created to bridge education, technology, and industry — equipping creators with the knowledge, tools, mentorship, and professional opportunities needed to build sustainable careers. Through CCDP powered by ANCR, our mission is to help develop the next generation of creative leaders while expanding access to meaningful pathways across the global creative economy.",
  },
  executive: [
    { name: "Earl Shipman", role: "Chief Operating Officer", initials: "ES", purpose: "Leads day-to-day operations and execution across CCDP." },
    { name: "Scharvin Wilson", role: "Chief Product Officer", initials: "SW", purpose: "Guides product direction across the CCDP and ANCR experience." },
    { name: "Aaron King", role: "Chief Technology Officer", initials: "AK", purpose: "Leads the technology and engineering behind the ANCR foundation." },
    { name: "Tasha Harris", role: "Chief Commercial Strategy Officer", initials: "TH", purpose: "Leads commercial strategy, partnerships, and revenue." },
    { name: "Dr. Milton Ruffin", role: "Chief Academic Innovation Officer", initials: "MR", purpose: "Advances academic innovation and curriculum quality." },
    { name: "Rashad Shipman", role: "VP, Technology Strategy & Systems Integration", initials: "RS", purpose: "Aligns technology strategy and systems integration across the ecosystem." },
  ],
  councilIntro: "The CCDP Academic Leadership Council provides perspective on curriculum, academic quality, creative practice, artist development, industry preparation, and institutional relevance.",
  academicCouncil: [
    { name: "Dr. Jennifer Floyd", role: "Senior Advisor, Academic Leadership & Institutional Strategy", initials: "JF" },
    { name: "Jimmie Parker", role: "Senior Advisor, Traditional Music & Artist Development", initials: "JP" },
    { name: "Cameron \u201CCam\u201D Fletcher", role: "Senior Advisor, Contemporary Music & Creative Practice", initials: "CF" },
    { name: "Armand Hutton", role: "Senior Advisor, Academic Programs & Industry Preparation", initials: "AH" },
  ],
  administration: [
    { name: "Denise Griffin", role: "Chief of Staff", initials: "DG", purpose: "Aligns people, priorities, and execution." },
    { name: "Jessica Tate", role: "Program Operations Coordinator", initials: "JT", purpose: "Coordinates program operations and day-to-day delivery." },
  ],
};

export const GLOBAL_ADOPTION = {
  eyebrow: "Global Adoption",
  headline: "Creative education without creative borders.",
  subhead: "One program. A world of collaborators.",
  body: [
    "CCDP™ powered by ANCR™ is designed to connect students, faculty, mentors, and creative communities across institutions, disciplines, cities, and cultures.",
    "A student in Lagos can develop an idea with a collaborator in Toronto, receive guidance from a mentor in Amsterdam, and share work with a creative community in New York through connected learning, production, feedback, and portfolio tools.",
    "The result is a global creative-learning experience where location expands perspective rather than limiting opportunity.",
  ],
  features: [
    { icon: "Users", title: "Global Creative Teams", desc: "Students can form interdisciplinary teams across participating institutions, cities, concentrations, and creative practices." },
    { icon: "LayoutGrid", title: "Connected Workspaces", desc: "ANCR-powered tools support shared projects, creative assets, feedback, production planning, and continued project development." },
    { icon: "Radio", title: "Live & Asynchronous Collaboration", desc: "Students can contribute in real time or continue the work across schedules, locations, and time zones." },
    { icon: "GraduationCap", title: "Faculty & Mentor Access", desc: "Participating institutions can connect students with educators, mentors, and professional perspectives beyond a single physical campus." },
    { icon: "Globe2", title: "Cross-Cultural Creative Exchange", desc: "Students encounter new ideas, traditions, markets, audiences, and creative approaches through meaningful collaboration." },
    { icon: "Fingerprint", title: "Portable Creator Identity", desc: "ANCRID and PASSPORT are designed to help participants carry identity, progress, experience, and verified accomplishments throughout the connected CCDP experience." },
    { icon: "Infinity", title: "Continuity Beyond Graduation", desc: "The tools, relationships, records, and creative work developed through CCDP are designed to support continued professional growth after program completion." },
  ],
  cities: [
    { name: "Toronto", x: 24, y: 34, role: "Build production, arrangement, and collaborative assets." },
    { name: "New York", x: 29, y: 41, role: "Prepare presentation, industry strategy, and audience engagement." },
    { name: "Amsterdam", x: 51, y: 30, role: "Contribute visual direction, design, or mentor feedback." },
    { name: "Lagos", x: 52, y: 57, role: "Develop the rhythm, cultural context, and musical foundation." },
  ],
  cta: {
    headline: "Bring your institution into a connected creative future.",
    body: "Explore how CCDP™ powered by ANCR™ can support local implementation while opening pathways to broader collaboration, creative exchange, and global opportunity.",
    primary: "Discuss Institutional Partnership",
    secondary: "Request a Demonstration",
  },
  institutional: {
    paragraph: "CCDP's connected structure gives institutions the opportunity to participate in a broader creative-learning network. Schools can preserve their own identity and academic strengths while creating opportunities for cross-campus projects, shared creative experiences, faculty exchange, mentorship, and global cultural engagement.",
    benefits: [
      "Expand student collaboration beyond the physical campus",
      "Create distinctive international and cross-institutional experiences",
      "Connect local creative education with global perspectives and professional practice",
    ],
  },
};

export const VISION = {
  overline: "The Vision",
  heading: "This is where creative education is going.",
  statement: "CCDP is building more than a degree. We are building the future infrastructure for creative education, creator development, and the global creative economy. Through higher education, technology, industry, artificial intelligence, and worldwide collaboration, we are creating a model designed not only for today's creators, but for generations to come.",
};

export const CTAS = [
  { title: "Schedule an Executive Briefing", desc: "Meet our team for a private walkthrough of the CCDP model.", icon: "CalendarClock", intent: "briefing" },
  { title: "Request the Partnership Deck", desc: "Get the full overview and opportunity in one document.", icon: "FileText", intent: "deck" },
  { title: "Become a Founding Partner", desc: "Help shape the future infrastructure of creative education.", icon: "Handshake", intent: "partner" },
  { title: "Explore University Partnerships", desc: "See how CCDP plugs into your institution.", icon: "Building2", intent: "partnership" },
  { title: "Meet with Our Leadership Team", desc: "Connect directly with CCDP leadership.", icon: "Users", intent: "leadership" },
];

export const PARTNER_CATEGORIES = [
  "Higher Education", "Foundations", "Technology", "Entertainment", "Government", "Employers", "Workforce Development", "Philanthropy",
];

export const FRAMEWORK_HERO = "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/139788fa248c8a941d9a8202d0524033be0114ea205e8ceb8f02663221f06b48.png";

export const FRAMEWORK_PILLARS = [
  { n: "01", title: "Creative Arts", icon: "Music", accent: "#a855f7",
    image: "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/b54dcae17b0b30b408e2830454be6053b0be73ddc07956c51a488cabb4d6d76e.png",
    desc: "Developing artistic excellence across music, media, film, entertainment, design, writing, gaming, and emerging creative disciplines." },
  { n: "02", title: "Technology & Innovation", icon: "Cpu", accent: "#2e7bff",
    image: "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/8f29a91ef5b7c803e3a33fd4e3c493bb5695ac618b0e9794d46bc7fcd3ffd029.png",
    desc: "Preparing students to create, build, and lead with AI, software, creative technology, data, and digital tools through the ANCR ecosystem." },
  { n: "03", title: "Business & Entrepreneurship", icon: "Briefcase", accent: "#10b981",
    image: "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/5b197b7cd8a8d43e450d590e0a52b2a21265692b462cc32a98219cbfc1f9d41c.png",
    desc: "Teaching creatives how to build sustainable careers through finance, branding, intellectual property, leadership, and business strategy." },
  { n: "04", title: "Career & Workforce Development", icon: "Users", accent: "#f97316",
    image: "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/3b8be37a68127984f701bcc52005f55b1fb0eb2dabb1d7a28cff81c4e85c5b76.png",
    desc: "Connecting education directly to employment, entrepreneurship, internships, mentorship, industry partnerships, and professional readiness." },
  { n: "05", title: "Leadership & Human Development", icon: "Compass", accent: "#e0349e",
    image: "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/f2d811a72dfd1e8607f77bd0066922323cded861c6fbb3c6c65839bc5815727c.png",
    desc: "Developing ethical leaders through communication, collaboration, wellness, purpose, global awareness, and lifelong learning." },
  { n: "06", title: "Global Exchange & Reach", icon: "Globe2", accent: "#06b6d4",
    image: "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/9a4afdc8ddfa44a435276842192fc4f92ca99eddbb0f497dfe8f82c88aecf8d0.png",
    desc: "Expanding access and opportunity through global partnerships, cultural exchange, international collaboration, and worldwide creative impact." },
];

export const ECOSYSTEM_ORG = [
  { id: "academy", name: "The Academy", kind: "Education", icon: "GraduationCap", desc: "Signature creative education built on CCDP intellectual property, combining higher-education faculty with active industry professionals." },
  { id: "ancr", name: "ANCR", kind: "Technology", icon: "Boxes", desc: "The education operating system unifying learning, collaboration, identity, and career readiness across the ecosystem.", to: "/platform" },
  { id: "adca", name: "ADCA", kind: "Youth Initiative", icon: "Palette", desc: "Awe Day Creative Arts introduces younger students to creativity, technology, innovation, and leadership." },
  { id: "vaulta", name: "Vaulta", kind: "Financial Wellness", icon: "Wallet", desc: "A financial wellness platform designed for creatives. Positioning being finalized." },
];

export const PLATFORM_PREVIEWS = {
  ancr: "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/65b1c9f918db7908235b351cec592271da5eb7b9d8fd50c507ff2de2f774f85b.jpeg",
  ancra: "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/d28821abb82291d7e2d0b8e78a431fb1ad0db830c533d434dd666ef7a91fe1ee.jpeg",
  ancrlab: "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/bec5ceb48845a63f02b9158ea039fe6a0f7b4061304038dba0c24945c9b0c816.jpeg",
  ancrsync: "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/bc6c2d494f36b152bcab6c86d0bee8cabe859cd055f84a7c877307f281cf00e8.jpeg",
  ancrlaunch: "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/2e5b402d72f5e213a33e2e1958a6a2722e3b30fb652482ceb9aa46a96b339152.jpeg",
  ancrid: "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/725a55daf947f4e7af06fdaa4b513031fc3cf19107688b3a6e6a3c945cd58795.jpeg",
  passport: "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/ca9c046f991213f9caca831f2df1ec9c513ec49d8cf87362a8f8249811bc4fef.jpeg",
  coheir: "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/435c2c18ae70882360c51689290dc6e017a4019dec483e0ea7e5a38c92a0d4f4.jpeg",
  vaulta: "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/b3f4ae4357ce6156f23aafc582e6cac616f76a25c064e657da3f8d80decac89d.jpeg",
  adca: "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/8466708d4a027d183f0adf4401c8362b9d93271cf5175d261e7a2353d1c60c0d.jpeg",
  ancrd: "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/d409eb964727dbe8548b6c76c6a02a2fec9e09d91d79883c1cc4faa1c81d4473.jpeg",
  ancrwav: "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/f037126e46b1cdae0b905403719fc1f7d225ea955c4039f1f6f87e1658de2a3f.jpeg",
  ancrview: "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/629a8b78cce25da8a8278aa8da1333a87ab82b8c1073dcf63b40d6a627403afa.jpeg",
  inheira: "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/9ca4b7dc3f4d55d0d6112e28509a827537a31c44b4dd1e1080a4e60f6da6b023.jpeg",
  ancrmedia: "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/833a90f23f7653fb73ce2df44f937909f6774d66669c99fb61d0bb70b89fd349.jpeg",
  cynaiah: "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/4c59722f6f4d79dce5d42247fe2910baf066fc7ca7196928da872d8482b7e4e7.jpeg",
  viearta: "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/233c1bbbea9a2a7df809e6c7108c019973859445af42a5ef3e493b2443a5c32f.jpeg",
  sovreign: "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/37a60ab8c0656354c9f9edf3332e73fd6d46de4a9d7c0ee1bf2e73bbc42a883b.jpeg",
};

export const ASSETS = {
  hero: "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/ff9e4b55e3ce932c328b940eb6fcfd3989adbed4ba7fd0492597005a9cbb0cdc.png",
  dashboard: "/brand/ccdp-dashboard.png",
  adca: "/brand/adca.png",
  adcaLogo: "/brand/adca-logo.png",
  ancr: "/brand/ancr.png",
  ccdpMark: "/brand/ccdp-mark.png",
  ccdpOfficial: "/brand/ccdp-official.png",
  ccdpFull: "/brand/ccdp-full.png",
  mockLearn: "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/772c62e7e0ae205ced807e1fb758a372517aee82df29b9a24846789befb09e67.png",
  mockMedia: "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/437cf38b567e44710c04e56c36a3a1d67b0846738c701951c1fc2280586904d2.png",
  mockFinance: "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/e38390dce64e618a670edb4aafd15c22d6fa2cda580e248ab4880bf78748a741.png",
  mockCommunity: "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/d88d8bcca1b8c28737044becc8981bc7f1b0f6c28a07cb52a21754a6bb7e7ce5.png",
  mesh: "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/d0d24846e39c914e10e2fb141fec362c0f413daba08b2c61df3564ac4b198239.png",
};
