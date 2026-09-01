import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const STATUS_DOT = {
  connected: "dot-pulse",
  idle: "dot-pulse idle",
};

export default function EcosystemStatus({ items: presetItems }) {
  const [items, setItems] = useState(presetItems || []);
  useEffect(() => {
    if (presetItems) return;
    api.get("/ancrid/ecosystem").then(({ data }) => setItems(data.items || [])).catch(() => {});
  }, [presetItems]);

  return (
    <section
      data-testid="ecosystem-status"
      className="glass-strong rounded-3xl px-6 md:px-8 py-6 md:py-7 fade-up"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <div>
          <div className="font-mono text-[11px] tracking-[0.32em] uppercase text-white/40">Ecosystem Status</div>
          <div className="font-display text-2xl md:text-3xl tracking-tight text-white mt-1">
            Connected through your <span className="ancr-gradient-text">ANCRID™</span>
          </div>
        </div>
        <div className="font-mono text-[11px] tracking-[0.2em] text-white/40 uppercase">
          {items.filter(i => i.status === "connected").length} of {items.length} live
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-9 gap-3">
        {items.map((m) => (
          <div
            key={m.code}
            data-testid={`ecosystem-${m.code}`}
            className="hover-lift group border border-white/5 rounded-2xl bg-white/[0.02] px-4 py-4 flex flex-col gap-2 min-w-0"
          >
            <div className="flex items-center gap-2">
              <span className={STATUS_DOT[m.status] || "dot-pulse idle"} />
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-white/50 truncate">{m.code}</span>
            </div>
            <div className="text-white text-sm truncate">{m.name}</div>
            <div className="text-white/40 text-[11px] leading-snug">{m.purpose}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
