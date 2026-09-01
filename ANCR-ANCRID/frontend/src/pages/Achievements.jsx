import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SectionTitle } from "@/components/GlassCard";
import { Trophy } from "lucide-react";

const TYPE_TINT = {
  Award: "#00e5ff", Scholarship: "#8a2be2", Fellowship: "#8a2be2",
  Competition: "#ff6d00", Certification: "#00e5ff", Release: "#ff6d00",
};

export default function Achievements() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/ancrid/achievements").then(r => setItems(r.data.items)); }, []);

  return (
    <div className="space-y-8" data-testid="achievements-page">
      <SectionTitle eyebrow="Achievements · Public Record" title="Recognition that carries with you." testid="achievements-title" />

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {items.map((a, i) => (
          <div key={i} data-testid={`achievement-${i}`} className="glass rounded-3xl p-6 hover-lift">
            <div className="flex items-start justify-between gap-3">
              <div className="w-11 h-11 rounded-2xl border border-white/10 bg-white/[0.03] flex items-center justify-center">
                <Trophy size={16} strokeWidth={1.6} style={{ color: TYPE_TINT[a.type] || "#fff" }} />
              </div>
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/60 bg-white/[0.05] border border-white/10 rounded-full px-2.5 py-1">
                {a.type}
              </span>
            </div>
            <div className="font-display text-lg tracking-tight text-white mt-5">{a.title}</div>
            <div className="text-white/50 text-sm mt-1">{a.issuer}</div>
            <div className="mt-4 pt-4 border-t border-white/5 font-mono text-[10px] tracking-[0.22em] uppercase text-white/40">
              {a.year}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
