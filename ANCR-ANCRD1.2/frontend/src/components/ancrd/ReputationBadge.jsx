import React from "react";
import {
  ShieldCheck, Check, TrendingUp, GraduationCap, Briefcase, Crown,
  PenLine, Users, Trophy, Sparkles, Award
} from "lucide-react";

/**
 * Reputation badges — earned, not follower-based.
 * Each kind has a distinct icon + accent color pulling from the ANCRD gradient palette.
 */
const KINDS = {
  "verified-collaborator": { label: "Verified Collaborator", icon: ShieldCheck, color: "#60A5FA", bg: "rgba(96,165,250,0.12)" },
  "reliable":              { label: "Reliable",              icon: Check,       color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  "top-contributor":       { label: "Top Contributor",       icon: TrendingUp,  color: "#F97316", bg: "rgba(249,115,22,0.14)" },
  "faculty-recommended":   { label: "Faculty Recommended",   icon: GraduationCap, color: "#A855F7", bg: "rgba(168,85,247,0.14)" },
  "industry-recommended":  { label: "Industry Recommended",  icon: Briefcase,   color: "#EC4899", bg: "rgba(236,72,153,0.14)" },
  "creative-leader":       { label: "Creative Leader",       icon: Crown,       color: "#D4AF37", bg: "rgba(212,175,55,0.16)" },
  "writing-camp-veteran":  { label: "Writing Camp Veteran",  icon: PenLine,     color: "#00E5FF", bg: "rgba(0,229,255,0.14)" },
  "community-builder":     { label: "Community Builder",     icon: Users,       color: "#14b8a6", bg: "rgba(20,184,166,0.14)" },
  "challenge-winner":      { label: "Challenge Winner",      icon: Trophy,      color: "#F97316", bg: "rgba(249,115,22,0.18)" },
  "top-mentor":            { label: "Top Mentor",            icon: Sparkles,    color: "#ffffff", bg: "rgba(255,255,255,0.10)" },
};

export function ReputationBadge({ kind, label, size = "md", showLabel = true }) {
  const meta = KINDS[kind] || { label: label || kind, icon: Award, color: "#ffffff", bg: "rgba(255,255,255,0.08)" };
  const Icon = meta.icon;
  const px = size === "sm" ? "px-2 py-1" : "px-2.5 py-1.5";
  const ic = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
  return (
    <span
      data-testid={`badge-${kind}`}
      className={`inline-flex items-center gap-1.5 ${px} rounded-sm border font-mono text-[10px] uppercase tracking-widest`}
      style={{ borderColor: `${meta.color}55`, background: meta.bg, color: meta.color }}
      title={meta.label}
    >
      <Icon className={ic} strokeWidth={2} />
      {showLabel && <span>{meta.label}</span>}
    </span>
  );
}

export function ReputationRow({ badges = [], max = null }) {
  const shown = max ? badges.slice(0, max) : badges;
  if (!shown.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5" data-testid="reputation-row">
      {shown.map((b, i) => (
        <ReputationBadge key={`${b.kind}-${i}`} kind={b.kind} label={b.label} />
      ))}
    </div>
  );
}

export default ReputationBadge;
