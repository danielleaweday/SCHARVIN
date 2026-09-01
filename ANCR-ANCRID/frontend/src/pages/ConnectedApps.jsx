import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SectionTitle } from "@/components/GlassCard";

const STATUS_DOT = { connected: "dot-pulse", idle: "dot-pulse idle" };

export default function ConnectedApps() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/ancrid/ecosystem").then(r => setItems(r.data.items)); }, []);

  return (
    <div className="space-y-8" data-testid="connected-page">
      <SectionTitle eyebrow="Connected Ecosystem" title="Your ecosystem, live." testid="connected-title" />

      {/* Ecosystem visualization */}
      <div className="glass-strong rounded-3xl p-8 md:p-12 relative overflow-hidden" data-testid="ecosystem-visual">
        <div className="relative flex items-center justify-center min-h-[300px]">
          <div className="absolute w-[420px] h-[420px] rounded-full border border-white/10" />
          <div className="absolute w-[280px] h-[280px] rounded-full border border-white/5" />
          <div className="relative z-10 text-center">
            <div className="w-24 h-24 rounded-3xl ancr-gradient-bg mx-auto flex items-center justify-center">
              <div className="w-[86px] h-[86px] rounded-[20px] bg-[#050505] flex items-center justify-center">
                <div className="font-display text-xl tracking-tighter text-white">ANCRID</div>
              </div>
            </div>
            <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-white/40 mt-3">Identity Provider</div>
          </div>

          {items.map((m, i) => {
            const angle = (i / items.length) * 2 * Math.PI - Math.PI / 2;
            const r = 190;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            return (
              <div
                key={m.code}
                data-testid={`ecosystem-node-${m.code}`}
                className="absolute w-32 md:w-36 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
              >
                <div className="glass rounded-2xl px-3 py-2.5 text-center hover-lift">
                  <div className="flex items-center justify-center gap-2">
                    <span className={STATUS_DOT[m.status] || "dot-pulse idle"} />
                    <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/70">{m.code}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {items.map((m) => (
          <div key={m.code} data-testid={`app-card-${m.code}`} className="glass rounded-3xl p-6 hover-lift">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/40">{m.code}</div>
                <div className="font-display text-xl tracking-tight text-white mt-1">{m.name}</div>
                <div className="text-white/50 text-sm mt-1">{m.purpose}</div>
              </div>
              <span className={STATUS_DOT[m.status] || "dot-pulse idle"} />
            </div>
            <div className="mt-5 pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
              <div>
                <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/40">Last Activity</div>
                <div className="text-white text-xs mt-1">{m.last_activity}</div>
              </div>
              <div>
                <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/40">Recent</div>
                <div className="text-white text-xs mt-1">{m.recent}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
