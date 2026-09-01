import { useEffect, useState } from "react";
import api from "@/lib/api";
import { PageHeader, GlassCard, SectionHeader, StatusPill } from "@/components/primitives";
import { Network, Circle } from "lucide-react";

const TONE = ["text-cyan-400", "text-violet-400", "text-orange-400", "text-emerald-400", "text-pink-400", "text-yellow-400", "text-blue-400", "text-fuchsia-400", "text-teal-400", "text-red-400"];

export default function Ecosystem() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api.get("/ecosystem/status").then((r) => setItems(r.data));
  }, []);

  return (
    <div className="space-y-8" data-testid="ecosystem-page">
      <PageHeader
        kicker="Ecosystem Integrations"
        title={<>One creator, <span className="gradient-text">one ecosystem.</span></>}
        subtitle="Vaulta connects to every module in the ANCR ecosystem. Identity, publishing, mentorship, budgets, streaming — all in sync."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" data-testid="ecosystem-cards">
        {items.map((e, i) => (
          <GlassCard key={e.name} hover className="relative overflow-hidden">
            <div className={`absolute top-0 left-0 h-[2px] w-16 ${TONE[i % TONE.length].replace('text-', 'bg-')}`} />
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Network size={14} className={TONE[i % TONE.length]} />
                <div className="font-display text-lg tracking-tight">{e.name}</div>
              </div>
              <StatusPill status={e.status} />
            </div>
            <div className="text-[10.5px] tracking-[0.22em] uppercase text-white/45">{e.tagline}</div>
            <div className="mt-3 pt-3 border-t border-white/[0.05] text-[12px] text-white/70 leading-relaxed">
              {e.detail}
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard testid="ecosystem-passport">
        <SectionHeader kicker="Passport" title="Unified Financial Record" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            ["Identity Verified", "ANCRID Level 3"],
            ["Songs Registered", "42 · INHEIRA"],
            ["Streaming Platforms", "Spotify · Apple · Tidal · Amazon"],
            ["Institutions Connected", "Berklee · NYU · UCLA"],
          ].map(([k, v]) => (
            <div key={k} className="p-4 rounded-lg border border-white/[0.06] bg-white/[0.02]">
              <div className="eyebrow mb-2">{k}</div>
              <div className="text-[13px] font-medium">{v}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
