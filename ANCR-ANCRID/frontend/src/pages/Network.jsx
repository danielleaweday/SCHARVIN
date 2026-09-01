import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { SectionTitle } from "@/components/GlassCard";
import { Search as SearchIcon, ShieldCheck } from "lucide-react";

const DISCIPLINES = ["All", "Music", "Film", "Photography", "Writing", "Design", "Direction"];
const COUNTRIES = ["All", "USA", "France", "Morocco", "United Kingdom", "Nigeria", "Japan"];

export default function Network() {
  const [q, setQ] = useState("");
  const [discipline, setDiscipline] = useState("All");
  const [country, setCountry] = useState("All");
  const [items, setItems] = useState([]);

  useEffect(() => {
    const params = {};
    if (q) params.q = q;
    if (discipline !== "All") params.discipline = discipline;
    if (country !== "All") params.country = country;
    api.get("/ancrid/network", { params }).then(r => setItems(r.data.items));
  }, [q, discipline, country]);

  return (
    <div className="space-y-8" data-testid="network-page">
      <SectionTitle eyebrow="Network · Discover Creators" title="Every verified creator, searchable." testid="network-title" />

      <div className="glass rounded-3xl p-5 md:p-6">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              data-testid="network-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, institution, skill…"
              className="w-full bg-white/[0.03] border border-white/10 focus:border-white/40 outline-none rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder-white/30"
            />
          </div>
          <select
            data-testid="filter-discipline"
            value={discipline} onChange={(e) => setDiscipline(e.target.value)}
            className="bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3.5 text-white outline-none focus:border-white/40"
          >
            {DISCIPLINES.map(d => <option key={d} className="bg-[#0a0a0a]">{d}</option>)}
          </select>
          <select
            data-testid="filter-country"
            value={country} onChange={(e) => setCountry(e.target.value)}
            className="bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3.5 text-white outline-none focus:border-white/40"
          >
            {COUNTRIES.map(d => <option key={d} className="bg-[#0a0a0a]">{d}</option>)}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {items.map((p, i) => (
          <div key={p.name} data-testid={`creator-${i}`} className="glass rounded-3xl p-5 hover-lift">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                {p.avatar && <img src={p.avatar} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="font-display text-white text-base tracking-tight truncate">{p.name}</div>
                  {p.verified && <ShieldCheck size={12} className="text-[#00e5ff] shrink-0" />}
                </div>
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-white/50 mt-0.5 truncate">{p.role}</div>
              </div>
            </div>
            <div className="mt-4 text-xs text-white/60">{p.institution} · {p.country}</div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.skills.map(s => (
                <span key={s} className="text-[11px] text-white/70 bg-white/[0.05] border border-white/10 rounded-full px-2.5 py-1">{s}</span>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: p.available ? "#00e5ff" : "rgba(255,255,255,0.4)" }}>
                {p.available ? "Available" : "Busy"}
              </span>
              <button className="text-xs text-white/70 hover:text-white">View</button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full text-center text-white/40 py-16 font-mono text-xs tracking-[0.2em] uppercase" data-testid="network-empty">
            No creators match the filter.
          </div>
        )}
      </div>
    </div>
  );
}
