export const PROJECT_TYPES = [
    { value: "music_video", label: "Music Video", blurb: "Sync-driven visual story built around a song." },
    { value: "lyric_video", label: "Lyric Video", blurb: "Typographic + visual companion to a track." },
    { value: "visualizer", label: "Visualizer", blurb: "Loop-friendly abstract or motion piece." },
    { value: "short_film", label: "Short Film", blurb: "Narrative film under 20 minutes." },
    { value: "documentary", label: "Documentary", blurb: "Nonfiction storytelling and portraits." },
    { value: "commercial", label: "Commercial", blurb: "Brand or product film with a clear CTA." },
    { value: "branded_content", label: "Branded Content", blurb: "Story-first brand collaboration." },
    { value: "animation", label: "Animation", blurb: "2D or 3D animated short." },
    { value: "cgi_scene", label: "CGI Scene", blurb: "Environments, characters, virtual production." },
    { value: "social_campaign", label: "Social Campaign", blurb: "Multi-format short-form pieces." },
    { value: "live_visuals", label: "Live Visuals", blurb: "Concert / stage / event visuals." },
    { value: "custom", label: "Custom Project", blurb: "Design your own project brief." },
];

export const STATUSES = [
    "concept",
    "preproduction",
    "production",
    "post_production",
    "review",
    "rights_clearance",
    "completed",
    "archived",
];

export const STATUS_LABEL = {
    concept: "Concept",
    preproduction: "Preproduction",
    production: "Production",
    post_production: "Post-Production",
    review: "In Review",
    rights_clearance: "Rights Clearance",
    completed: "Completed",
    archived: "Archived",
};

export const STATUS_TONE = {
    concept: "text-cynaiah-cyan",
    preproduction: "text-cynaiah-blue",
    production: "text-cynaiah-magenta",
    post_production: "text-cynaiah-violet",
    review: "text-cynaiah-orange",
    rights_clearance: "text-cynaiah-gold",
    completed: "text-emerald-400",
    archived: "text-white/40",
};

export const TYPE_LABEL = Object.fromEntries(PROJECT_TYPES.map((t) => [t.value, t.label]));

export const ROLES = [
    { value: "student", label: "Student Creator" },
    { value: "faculty", label: "Faculty Member" },
    { value: "mentor", label: "Mentor / Industry" },
    { value: "collaborator", label: "Collaborator" },
    { value: "institutional_admin", label: "Institutional Admin" },
    { value: "platform_admin", label: "Platform Admin" },
];
