import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SectionTitle } from "@/components/GlassCard";

export default function History() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/ancrid/history").then(r => setItems(r.data.items)); }, []);

  return (
    <div className="space-y-8" data-testid="history-page">
      <SectionTitle eyebrow="Professional History" title="Every role. Kept on record." testid="history-title" />

      <div className="glass rounded-3xl overflow-hidden">
        <div className="divide-y divide-white/5">
          {items.map((h, i) => (
            <div key={i} data-testid={`history-${i}`} className="grid grid-cols-12 gap-4 px-6 py-5 hover:bg-white/[0.02] transition-colors">
              <div className="col-span-3 md:col-span-2 font-mono text-[11px] tracking-[0.2em] uppercase text-white/40">{h.years}</div>
              <div className="col-span-9 md:col-span-6">
                <div className="text-white text-base">{h.role}</div>
                <div className="text-white/60 text-sm">{h.organization}</div>
              </div>
              <div className="col-span-12 md:col-span-4 md:text-right">
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/70 bg-white/[0.05] border border-white/10 rounded-full px-3 py-1.5">
                  {h.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
