import { useEffect, useState } from "react";
import api from "@/lib/api";
import WorldMap from "@/components/WorldMap";
import { Link } from "react-router-dom";
import { fmtNum } from "@/lib/format";

export default function Countries() {
  const [world, setWorld] = useState(null);
  useEffect(() => { api.get("/world").then((r) => setWorld(r.data)); }, []);
  if (!world) return <div className="p-16 text-white/40">Loading world…</div>;
  return (
    <div className="px-8 py-10 pb-24" data-testid="countries-page">
      <div className="mb-8">
        <div className="text-[10px] tracking-[0.28em] uppercase text-white/50">Global CCDP Community</div>
        <h1 className="font-display text-5xl font-black tracking-tighter leading-tight mt-2">The world <span className="gradient-text">is</span> the network.</h1>
        <p className="text-white/50 mt-3 font-sans-alt text-sm max-w-2xl">Every release, performance, and project appears here as a living node. Click any city to enter its institution.</p>
      </div>
      <WorldMap nodes={world.nodes} />
      <div className="mt-12">
        <div className="text-[10px] tracking-[0.28em] uppercase text-white/50">By country</div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {world.countries.map((c) => (
            <div key={c.country} className="glass rounded-2xl p-5" data-testid={`country-${c.country}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl">{c.flag}</div>
                  <div className="font-display text-xl mt-2">{c.country}</div>
                  <div className="text-[11px] text-white/50 mt-0.5">{c.cities.join(" · ")}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-widest text-white/40">Creators</div>
                  <div className="font-display text-2xl gradient-text">{fmtNum(c.creators)}</div>
                  <div className="text-[10px] text-white/40 mt-1">{fmtNum(c.releases)} releases</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
