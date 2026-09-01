import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SectionTitle } from "@/components/GlassCard";
import { ShieldCheck, Link2 } from "lucide-react";

const filters = ["All", "Music", "Film", "Photography", "Writing", "Design"];

export default function Portfolio() {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("All");
  useEffect(() => { api.get("/ancrid/portfolio").then(r => setItems(r.data.items)); }, []);
  const shown = tab === "All" ? items : items.filter(i => i.medium === tab);

  return (
    <div className="space-y-8" data-testid="portfolio-page">
      <SectionTitle
        eyebrow="Portfolio · Verified Works"
        title="Every piece, verifiable and owned."
        testid="portfolio-title"
        right={
          <div className="flex flex-wrap gap-1.5">
            {filters.map(f => (
              <button
                key={f}
                data-testid={`portfolio-filter-${f.toLowerCase()}`}
                onClick={() => setTab(f)}
                className={`text-xs font-mono tracking-[0.18em] uppercase px-3 py-1.5 rounded-full border transition-colors ${
                  tab === f ? "border-white/40 bg-white/[0.08] text-white" : "border-white/10 text-white/50 hover:text-white hover:border-white/20"
                }`}
              >{f}</button>
            ))}
          </div>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {shown.map((p) => (
          <div key={p.id} data-testid={`portfolio-item-${p.id}`} className="glass rounded-3xl overflow-hidden hover-lift group">
            <div className="relative h-52 overflow-hidden">
              <img src={p.cover} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute top-3 left-3 font-mono text-[10px] tracking-[0.22em] uppercase text-white/80 bg-black/50 backdrop-blur rounded-full px-2.5 py-1 border border-white/10">
                {p.medium}
              </div>
              {p.verified && (
                <div className="absolute top-3 right-3 inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.18em] uppercase text-[#00e5ff] bg-[#00e5ff]/10 border border-[#00e5ff]/40 rounded-full px-2.5 py-1">
                  <ShieldCheck size={11} /> Verified
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="font-display text-lg tracking-tight text-white">{p.title}</div>
              <div className="text-white/50 text-xs mt-1">{p.role} · {p.year}</div>
              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/40 inline-flex items-center gap-1.5">
                  <Link2 size={11} /> {p.connected_app}
                </span>
                <button className="text-xs text-white/70 hover:text-white">Open</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
