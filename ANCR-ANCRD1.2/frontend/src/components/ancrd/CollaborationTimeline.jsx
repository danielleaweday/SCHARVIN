import React from "react";
import {
  PenLine, Music2, Mic2, Plane, BookMarked, Trophy, Users, MapPin, CheckCircle2
} from "lucide-react";
import { timeAgo } from "@/lib/api";

const KINDS = {
  "writing-camp":  { icon: PenLine,   color: "#00E5FF", label: "Writing Camp" },
  "release":       { icon: Music2,    color: "#EC4899", label: "Release" },
  "performance":   { icon: Mic2,      color: "#F97316", label: "Performance" },
  "tour":          { icon: Plane,     color: "#A855F7", label: "Tour" },
  "publishing":    { icon: BookMarked, color: "#60A5FA", label: "Publishing" },
  "award":         { icon: Trophy,    color: "#D4AF37", label: "Award" },
  "collaboration": { icon: Users,     color: "#14b8a6", label: "Collaboration" },
  "residency":     { icon: MapPin,    color: "#ffffff", label: "Residency" },
};

export default function CollaborationTimeline({ entries = [] }) {
  if (!entries.length) return null;
  const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
  return (
    <div data-testid="collab-timeline" className="relative">
      <div
        className="absolute left-[11px] top-1 bottom-1 w-px"
        style={{
          background:
            "linear-gradient(180deg, rgba(59,130,246,0.35), rgba(168,85,247,0.35), rgba(236,72,153,0.35), rgba(249,115,22,0.35))",
        }}
        aria-hidden="true"
      />
      <ul className="space-y-4">
        {sorted.map((e, i) => {
          const meta = KINDS[e.kind] || KINDS.collaboration;
          const Icon = meta.icon;
          return (
            <li key={i} data-testid={`timeline-${e.kind}-${i}`} className="pl-9 relative">
              <div
                className="absolute left-0 top-0.5 h-[22px] w-[22px] rounded-sm flex items-center justify-center border"
                style={{
                  borderColor: `${meta.color}66`,
                  background: `${meta.color}18`,
                  color: meta.color,
                }}
              >
                <Icon className="h-3 w-3" strokeWidth={2} />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: meta.color }}>
                  {meta.label}
                </span>
                {e.verified && (
                  <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-white/40">
                    <CheckCircle2 className="h-2.5 w-2.5" style={{ color: "#F97316" }} /> Verified
                  </span>
                )}
                <span className="font-mono text-[10px] text-white/40">· {timeAgo(e.date)}</span>
              </div>
              <div className="font-body text-sm text-white/90 mt-0.5">{e.title}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
