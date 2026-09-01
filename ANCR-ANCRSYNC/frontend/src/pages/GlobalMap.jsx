import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Globe2 } from "lucide-react";
import api from "../lib/api";

// Equirectangular projection helpers
const project = (lat, lng, w, h) => {
  const x = ((lng + 180) / 360) * w;
  const y = ((90 - lat) / 180) * h;
  return { x, y };
};

const W = 960;
const H = 480;

export default function GlobalMap() {
  const [creators, setCreators] = useState([]);
  const [users, setUsers] = useState([]);
  const [active, setActive] = useState(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    api.get("/global/creators").then((r) => {
      setCreators(r.data.sample || []);
      setUsers(r.data.users || []);
    });
  }, []);

  const disciplines = ["All", ...Array.from(new Set(creators.map((c) => c.discipline)))];
  const filtered = filter === "All" ? creators : creators.filter((c) => c.discipline === filter);

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 glass-strong border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-overline text-zinc-500">
              Global Collaboration™
            </div>
            <div className="font-display text-2xl tracking-tight">
              World of creators
            </div>
          </div>
          <div className="text-xs text-zinc-500 flex items-center gap-2">
            <Globe2 size={14} /> {creators.length} creators · {users.length}{" "}
            members
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8 space-y-4">
        <div className="flex flex-wrap gap-2">
          {disciplines.map((d) => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              data-testid={`global-filter-${d}`}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors border ${
                filter === d
                  ? "bg-white text-black border-white"
                  : "border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="glass rounded-2xl p-6 relative overflow-hidden">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto"
            style={{ background: "radial-gradient(circle at 50% 50%, #0a0f1a 0%, #000 70%)" }}
          >
            {/* Grid latitudes */}
            {[15, 30, 45, 60, 75].flatMap((deg) => [
              <line
                key={`n${deg}`}
                x1={0}
                x2={W}
                y1={((90 - deg) / 180) * H}
                y2={((90 - deg) / 180) * H}
                stroke="rgba(255,255,255,0.04)"
              />,
              <line
                key={`s${deg}`}
                x1={0}
                x2={W}
                y1={((90 + deg) / 180) * H}
                y2={((90 + deg) / 180) * H}
                stroke="rgba(255,255,255,0.04)"
              />,
            ])}
            {/* Longitudes */}
            {Array.from({ length: 12 }).map((_, i) => (
              <line
                key={`l${i}`}
                x1={(i / 12) * W}
                x2={(i / 12) * W}
                y1={0}
                y2={H}
                stroke="rgba(255,255,255,0.04)"
              />
            ))}
            {/* Equator */}
            <line
              x1={0}
              x2={W}
              y1={H / 2}
              y2={H / 2}
              stroke="rgba(255,255,255,0.08)"
            />
            {/* Continents (very simplified blobs) */}
            {CONTINENT_BLOBS.map((c, i) => (
              <ellipse
                key={i}
                cx={c.cx}
                cy={c.cy}
                rx={c.rx}
                ry={c.ry}
                fill="rgba(255,255,255,0.03)"
                stroke="rgba(255,255,255,0.06)"
              />
            ))}
            {/* Arcs between random creators */}
            {filtered.slice(0, 4).map((c, i) => {
              const a = project(c.lat, c.lng, W, H);
              const b = project(
                filtered[(i + 3) % filtered.length]?.lat || 0,
                filtered[(i + 3) % filtered.length]?.lng || 0,
                W,
                H
              );
              const mx = (a.x + b.x) / 2;
              const my = Math.min(a.y, b.y) - 60;
              return (
                <path
                  key={`arc-${i}`}
                  d={`M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`}
                  stroke="rgba(0,122,255,0.5)"
                  strokeWidth="1"
                  fill="none"
                  strokeDasharray="3 5"
                />
              );
            })}
            {/* Creator dots */}
            {filtered.map((c) => {
              const { x, y } = project(c.lat, c.lng, W, H);
              const isActive = active?.name === c.name;
              return (
                <g
                  key={c.name}
                  onMouseEnter={() => setActive(c)}
                  className="cursor-pointer"
                  data-testid={`creator-pin-${c.name}`}
                >
                  <circle cx={x} cy={y} r={isActive ? 8 : 5} fill="#007AFF" opacity="0.3" />
                  <circle cx={x} cy={y} r={2.5} fill="#007AFF" />
                </g>
              );
            })}
          </svg>
          {active && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-6 left-6 glass-strong rounded-xl p-4 min-w-[220px]"
              data-testid="creator-info"
            >
              <div className="font-display text-base text-zinc-50">
                {active.name}
              </div>
              <div className="text-xs text-zinc-400">
                {active.role} · {active.discipline}
              </div>
              <div className="text-[11px] font-mono text-zinc-500 mt-2">
                {active.city}, {active.country}
              </div>
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div
              key={c.name}
              onMouseEnter={() => setActive(c)}
              data-testid={`creator-card-${c.name}`}
              className="glass rounded-2xl p-5 hover:border-white/[0.14] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium">
                  {c.name[0]}
                </div>
                <div className="min-w-0">
                  <div className="font-display text-sm text-zinc-50 truncate">
                    {c.name}
                  </div>
                  <div className="text-[11px] text-zinc-500 truncate">
                    {c.role} · {c.discipline}
                  </div>
                </div>
              </div>
              <div className="mt-4 text-[11px] font-mono text-zinc-500">
                {c.city}, {c.country}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const CONTINENT_BLOBS = [
  { cx: 250, cy: 170, rx: 90, ry: 55 }, // North America
  { cx: 320, cy: 300, rx: 55, ry: 70 }, // South America
  { cx: 490, cy: 165, rx: 55, ry: 40 }, // Europe
  { cx: 540, cy: 260, rx: 75, ry: 90 }, // Africa
  { cx: 680, cy: 200, rx: 130, ry: 65 }, // Asia
  { cx: 800, cy: 340, rx: 55, ry: 35 }, // Oceania
];
