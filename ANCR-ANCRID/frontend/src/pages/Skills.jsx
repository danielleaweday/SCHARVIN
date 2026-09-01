import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SectionTitle } from "@/components/GlassCard";

const LEVEL_TINT = { Expert: "#00e5ff", Advanced: "#8a2be2", Intermediate: "#ff6d00" };

export default function Skills() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/ancrid/skills").then(r => setItems(r.data.items)); }, []);

  return (
    <div className="space-y-8" data-testid="skills-page">
      <SectionTitle eyebrow="Skills · Verified Competencies" title="Proof of practice — with evidence." testid="skills-title" />

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((s, i) => (
          <div key={s.name} data-testid={`skill-${i}`} className="glass rounded-2xl p-5 hover-lift">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-display text-lg tracking-tight text-white">{s.name}</div>
                <div className="font-mono text-[10px] tracking-[0.22em] uppercase mt-1" style={{ color: LEVEL_TINT[s.level] || "#fff" }}>{s.level}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/40">Projects</div>
                <div className="font-mono text-white text-lg">{s.projects}</div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-2 gap-3">
              <div>
                <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/40">Experience</div>
                <div className="font-mono text-white text-xs mt-1">{s.experience_years} yrs</div>
              </div>
              <div>
                <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/40">Verified By</div>
                <div className="text-white text-xs mt-1">{s.verified_by}</div>
              </div>
            </div>
            {s.evidence && (
              <div className="mt-3 text-white/50 text-xs">
                Evidence: <span className="text-white/80">{s.evidence}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
