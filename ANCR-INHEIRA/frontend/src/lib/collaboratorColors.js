// Canonical collaborator identity colors used across INHEIRA.
// Every collaborator's color appears on cursors, comments, contributions,
// Creative Evidence, timeline events, session activity, and version history.
// A creator instantly recognizes who contributed what without needing to read names.

export const COLLABORATOR_PALETTE = {
    blue:    { name: 'Blue',    hex: '#38BDF8', ring: 'ring-sky-400',      bg: 'bg-sky-400',      text: 'text-sky-400',      glow: 'rgba(56,189,248,0.55)' },
    purple:  { name: 'Purple',  hex: '#A78BFA', ring: 'ring-indigo-400',   bg: 'bg-indigo-400',   text: 'text-indigo-400',   glow: 'rgba(167,139,250,0.55)' },
    orange:  { name: 'Orange',  hex: '#FB923C', ring: 'ring-orange-400',   bg: 'bg-orange-400',   text: 'text-orange-400',   glow: 'rgba(251,146,60,0.55)' },
    magenta: { name: 'Magenta', hex: '#F472B6', ring: 'ring-pink-400',     bg: 'bg-pink-400',     text: 'text-pink-400',     glow: 'rgba(244,114,182,0.55)' },
    emerald: { name: 'Emerald', hex: '#34D399', ring: 'ring-emerald-400',  bg: 'bg-emerald-400',  text: 'text-emerald-400',  glow: 'rgba(52,211,153,0.55)' },
    amber:   { name: 'Amber',   hex: '#FBBF24', ring: 'ring-amber-400',    bg: 'bg-amber-400',    text: 'text-amber-400',    glow: 'rgba(251,191,36,0.55)' },
    rose:    { name: 'Rose',    hex: '#FB7185', ring: 'ring-rose-400',     bg: 'bg-rose-400',     text: 'text-rose-400',     glow: 'rgba(251,113,133,0.55)' },
    teal:    { name: 'Teal',    hex: '#2DD4BF', ring: 'ring-teal-400',     bg: 'bg-teal-400',     text: 'text-teal-400',     glow: 'rgba(45,212,191,0.55)' },
};

// Canonical demo cast used across Landing + Writing Rooms + Session Intelligence
export const CANONICAL_CAST = [
    { ancr_id: 'ancr_danielle', name: 'Danielle Stephens', role: 'Topline / Lyrics',      color: 'blue',    initials: 'DS' },
    { ancr_id: 'ancr_marcus',   name: 'Marcus Reyes',      role: 'Co-write / Bass',        color: 'purple',  initials: 'MR' },
    { ancr_id: 'ancr_chris',    name: 'Chris Ohara',       role: 'Production / Guitar',    color: 'orange',  initials: 'CO' },
    { ancr_id: 'ancr_sarah',    name: 'Sarah Bloom',       role: 'Production / Keys',      color: 'magenta', initials: 'SB' },
    { ancr_id: 'ancr_jimmie',   name: 'Jimmie Vaughn',     role: 'Beat / MPC',             color: 'emerald', initials: 'JV' },
];

// Deterministic assignment for anonymous collaborators (hash → palette slot).
export function colorForAncrId(ancr_id) {
    const known = CANONICAL_CAST.find((c) => c.ancr_id === ancr_id);
    if (known) return COLLABORATOR_PALETTE[known.color];
    const keys = Object.keys(COLLABORATOR_PALETTE);
    let h = 0;
    for (let i = 0; i < ancr_id.length; i++) h = (h * 31 + ancr_id.charCodeAt(i)) >>> 0;
    return COLLABORATOR_PALETTE[keys[h % keys.length]];
}
