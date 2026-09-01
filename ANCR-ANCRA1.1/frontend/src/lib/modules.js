import React from "react";

/** Module identities — brand color per module. Keep unified aesthetic (dark). */
export const MODULES = {
  ANCRA:      { name: "ANCRA",      trademark: true, tag: "Learning OS",              color: "#F8F9FA", accent: "#E23A25", route: "/dashboard",          real: true,  role: "Creative Learning Operating System™" },
  ANCRLAB:    { name: "ANCRLAB",    trademark: true, tag: "Studio",                   color: "#38B6FF", accent: "#38B6FF", route: "/module/ANCRLAB",     real: true,  role: "The creative production studio for the ANCR ecosystem." },
  ANCRSync:   { name: "ANCRSync",   trademark: true, tag: "Collaboration",            color: "#8B5CF6", accent: "#8B5CF6", route: "/module/ANCRSync",    real: true,  role: "Writing rooms, teams, and creative collaboration across ANCR." },
  COHEIR:     { name: "COHEIR",     trademark: true, tag: "Mentorship & Industry",    color: "#F59E0B", accent: "#F59E0B", route: "/module/COHEIR",      real: true,  role: "Faculty, mentors, industry professionals, and residents." },
  INHEIRA:    { name: "INHEIRA",    trademark: true, tag: "Songs · Splits · Publishing", color: "#EC4899", accent: "#EC4899", route: "/module/INHEIRA",  real: true,  role: "Register songs, protect splits, unlock publishing." },
  ANCRID:     { name: "ANCRID",     trademark: true, tag: "Creator Identity",         color: "#10B981", accent: "#10B981", route: "/module/ANCRID",      real: true,  role: "One verified professional identity for every creator." },
  Vaulta:     { name: "Vaulta",     trademark: true, tag: "Royalties & Finance",      color: "#EAB308", accent: "#EAB308", route: "/module/Vaulta",      real: false, role: "The financial layer of the ANCR ecosystem." },
  ANCRLaunch: { name: "ANCRLaunch", trademark: true, tag: "Career & Placement",       color: "#F97316", accent: "#F97316", route: "/module/ANCRLaunch",  real: false, role: "From student to working professional." },
  ANCRVIEW:   { name: "ANCRVIEW",   trademark: true, tag: "Masterclasses & Showcases",color: "#EF4444", accent: "#EF4444", route: "/module/ANCRVIEW",    real: false, role: "Cinematic long-form video for the ecosystem." },
  ANCRWAV:    { name: "ANCRWAV",    trademark: true, tag: "Releases & Streaming",     color: "#06B6D4", accent: "#06B6D4", route: "/module/ANCRWAV",     real: false, role: "The release pipeline for every ANCR creator." },
};

export const MODULE_ORDER = ["ANCRA", "ANCRLAB", "ANCRSync", "COHEIR", "INHEIRA", "ANCRID", "Vaulta", "ANCRLaunch", "ANCRVIEW", "ANCRWAV"];

/** Open a module in a new tab (unless it's the current one). */
export function openModule(name) {
  const m = MODULES[name];
  if (!m) return;
  window.open(m.route, "_blank", "noopener,noreferrer");
}

const dummy = null; export default dummy;
