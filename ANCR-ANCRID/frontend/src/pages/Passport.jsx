import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import GlassCard, { SectionTitle } from "@/components/GlassCard";
import { Globe2 } from "lucide-react";

export default function Passport() {
  const [data, setData] = useState({ countries: [], entries: [] });
  useEffect(() => { api.get("/ancrid/passport").then(r => setData(r.data)); }, []);

  return (
    <div className="space-y-8" data-testid="passport-page">
      <SectionTitle eyebrow="Passport · Global Record" title="Where your work has traveled." testid="passport-title" />

      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard testid="passport-countries">
          <div className="flex items-center gap-2 mb-4">
            <Globe2 size={14} className="text-[#00e5ff]" />
            <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-white/40">Countries</div>
          </div>
          <div className="font-display text-5xl tracking-tighter text-white">{data.countries.length}</div>
          <div className="text-white/50 text-sm mt-2">on record</div>
          <div className="mt-6 flex flex-wrap gap-2">
            {data.countries.map(c => (
              <span key={c} className="text-xs text-white/80 bg-white/[0.05] border border-white/10 rounded-full px-3 py-1.5">{c}</span>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-2" testid="passport-entries">
          <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-white/40 mb-4">Stamps · International Activity</div>
          <div className="divide-y divide-white/5">
            {data.entries.map((e, i) => (
              <div key={i} className="py-4 flex items-start gap-4">
                <div className="w-12 shrink-0 font-mono text-[10px] tracking-[0.22em] uppercase text-white/40 pt-1">{e.date}</div>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-white text-lg tracking-tight">{e.country}<span className="text-white/40"> · {e.city}</span></div>
                  <div className="text-white/60 text-sm">{e.purpose} — {e.project}</div>
                </div>
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/60 bg-white/[0.05] border border-white/10 rounded-full px-2.5 py-1 shrink-0">
                  {e.app}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
