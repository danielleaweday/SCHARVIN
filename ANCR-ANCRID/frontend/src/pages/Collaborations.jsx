import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SectionTitle } from "@/components/GlassCard";
import { ShieldCheck, Link2 } from "lucide-react";

export default function Collaborations() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/ancrid/collaborations").then(r => setItems(r.data.items)); }, []);

  return (
    <div className="space-y-8" data-testid="collaborations-page">
      <SectionTitle eyebrow="Collaborations · Auto-Generated" title="Who you've built with — verified." testid="collaborations-title" />

      <div className="grid md:grid-cols-2 gap-6">
        {items.map((c, i) => (
          <div key={i} data-testid={`collab-${i}`} className="glass rounded-3xl p-7 hover-lift">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/40">{c.date} · {c.institution}</div>
                <div className="font-display text-2xl tracking-tight text-white mt-1">{c.collaborator}</div>
                <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-white/50 mt-1">{c.role}</div>
              </div>
              {c.verified && (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.18em] uppercase text-[#00e5ff] bg-[#00e5ff]/10 border border-[#00e5ff]/30 rounded-full px-2.5 py-1 shrink-0">
                  <ShieldCheck size={11} /> Verified
                </span>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/40">Project</div>
              <div className="text-white text-sm mt-1">{c.project}</div>
              <div className="text-white/60 text-sm mt-2">{c.contribution}</div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Link2 size={11} className="text-white/40" />
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/50">Linked · {c.app}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
