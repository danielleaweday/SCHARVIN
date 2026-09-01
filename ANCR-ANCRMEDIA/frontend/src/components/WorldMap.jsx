import { useState } from "react";
import { Link } from "react-router-dom";
import { fmtNum } from "@/lib/format";

// Equirectangular projection: lat [-90, 90] -> y, lon [-180, 180] -> x
const project = (lat, lon) => ({
  x: ((lon + 180) / 360) * 100,
  y: ((90 - lat) / 180) * 100,
});

// Ambient world map using pure CSS gradients (no external image)

export default function WorldMap({ nodes = [], compact = false }) {
  const [active, setActive] = useState(null);
  const activeNode = active && nodes.find((n) => n.id === active);

  return (
    <div
      data-testid="world-map"
      className={`relative w-full rounded-2xl overflow-hidden glass ${compact ? "aspect-[21/9]" : "aspect-[2/1]"}`}
      style={{
        background:
          "radial-gradient(1200px 500px at 20% 20%, rgba(0,82,255,0.15), transparent 60%), radial-gradient(900px 400px at 80% 70%, rgba(255,107,0,0.12), transparent 55%), #08080B",
      }}
    >
      {/* Ambient continents suggested by radial gradients + noise */}
      <div className="absolute inset-0 grain opacity-40" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(300px 200px at 27% 45%, rgba(255,255,255,0.06), transparent 60%)," +
            "radial-gradient(360px 220px at 50% 52%, rgba(255,255,255,0.05), transparent 60%)," +
            "radial-gradient(240px 200px at 82% 60%, rgba(255,255,255,0.055), transparent 60%)," +
            "radial-gradient(220px 220px at 30% 76%, rgba(255,255,255,0.045), transparent 60%)," +
            "radial-gradient(220px 180px at 55% 78%, rgba(255,255,255,0.045), transparent 60%)",
        }}
      />
      {/* Grid overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-25" preserveAspectRatio="none" viewBox="0 0 100 50">
        {Array.from({ length: 12 }, (_, i) => (
          <line key={`v${i}`} x1={i * 100 / 12} x2={i * 100 / 12} y1="0" y2="50" stroke="white" strokeWidth="0.05" />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <line key={`h${i}`} x1="0" x2="100" y1={i * 50 / 6} y2={i * 50 / 6} stroke="white" strokeWidth="0.05" />
        ))}
      </svg>

      {/* Nodes */}
      {nodes.map((n) => {
        const p = project(n.coords[0], n.coords[1]);
        return (
          <button
            key={n.id}
            data-testid={`map-node-${n.id}`}
            onClick={() => setActive(n.id)}
            onMouseEnter={() => setActive(n.id)}
            className="map-node"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            aria-label={`${n.city}, ${n.country}`}
          />
        );
      })}

      {/* City labels */}
      {nodes.map((n) => {
        const p = project(n.coords[0], n.coords[1]);
        return (
          <div
            key={`lbl-${n.id}`}
            className="absolute text-[9px] tracking-[0.18em] uppercase text-white/60 font-sans-alt pointer-events-none whitespace-nowrap"
            style={{ left: `calc(${p.x}% + 12px)`, top: `calc(${p.y}% - 6px)` }}
          >
            {n.city}
          </div>
        );
      })}

      {/* Corner overlays */}
      <div className="absolute top-4 left-4 text-[10px] tracking-[0.28em] uppercase text-white/50">
        Global CCDP Network · Live
      </div>
      <div className="absolute bottom-4 left-4 text-[10px] tracking-[0.28em] uppercase text-white/40">
        {nodes.length} Institutions · {nodes.reduce((s, n) => s + n.creators, 0)} Creators
      </div>

      {/* Info card */}
      {activeNode && (
        <div className="absolute top-4 right-4 w-72 glass-strong rounded-xl p-4 fade-in-up" data-testid="map-info-card">
          <div className="text-[10px] tracking-[0.22em] uppercase text-white/50">{activeNode.flag} {activeNode.country}</div>
          <div className="font-display text-lg mt-1 leading-tight">{activeNode.name}</div>
          <div className="text-[11px] text-white/50 mt-0.5">{activeNode.city}</div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-white/40">Creators</div>
              <div className="font-display text-xl mt-0.5 gradient-text">{fmtNum(activeNode.creators)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-white/40">Releases</div>
              <div className="font-display text-xl mt-0.5">{fmtNum(activeNode.releases)}</div>
            </div>
          </div>
          <Link
            to={`/schools/${activeNode.id}`}
            data-testid={`map-open-${activeNode.id}`}
            className="mt-4 block text-center py-2 rounded-lg bg-white text-black font-sans-alt text-[12px] font-medium hover:bg-white/90 transition-colors"
          >
            Enter Institution →
          </Link>
        </div>
      )}
    </div>
  );
}
