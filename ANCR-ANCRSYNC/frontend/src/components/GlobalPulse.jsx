import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Globe2, Users } from "lucide-react";
import api from "../lib/api";

// Global creative cities (deterministic — always shown)
const CITIES = [
  { name: "Chicago", flag: "🇺🇸", lat: 41.88, lng: -87.63, tz: "America/Chicago", role: "Producer" },
  { name: "London", flag: "🇬🇧", lat: 51.51, lng: -0.12, tz: "Europe/London", role: "Songwriter" },
  { name: "Accra", flag: "🇬🇭", lat: 5.6, lng: -0.19, tz: "Africa/Accra", role: "Vocalist" },
  { name: "Sydney", flag: "🇦🇺", lat: -33.87, lng: 151.21, tz: "Australia/Sydney", role: "Engineer" },
  { name: "Dubai", flag: "🇦🇪", lat: 25.2, lng: 55.27, tz: "Asia/Dubai", role: "Composer" },
  { name: "Toronto", flag: "🇨🇦", lat: 43.65, lng: -79.38, tz: "America/Toronto", role: "Student" },
  { name: "New York", flag: "🇺🇸", lat: 40.71, lng: -74.0, tz: "America/New_York", role: "Faculty" },
  { name: "Tokyo", flag: "🇯🇵", lat: 35.68, lng: 139.69, tz: "Asia/Tokyo", role: "Animator" },
  { name: "São Paulo", flag: "🇧🇷", lat: -23.55, lng: -46.63, tz: "America/Sao_Paulo", role: "Filmmaker" },
  { name: "Mumbai", flag: "🇮🇳", lat: 19.08, lng: 72.88, tz: "Asia/Kolkata", role: "Producer" },
  { name: "Berlin", flag: "🇩🇪", lat: 52.52, lng: 13.4, tz: "Europe/Berlin", role: "DJ" },
  { name: "Seoul", flag: "🇰🇷", lat: 37.57, lng: 126.98, tz: "Asia/Seoul", role: "Songwriter" },
];

// Live-linked sessions (arcs between cities)
const ROUTES = [
  [0, 1], // Chicago ↔ London
  [1, 2], // London ↔ Accra
  [2, 4], // Accra ↔ Dubai
  [4, 3], // Dubai ↔ Sydney
  [5, 0], // Toronto ↔ Chicago
  [6, 8], // NY ↔ São Paulo
  [7, 3], // Tokyo ↔ Sydney
  [9, 4], // Mumbai ↔ Dubai
];

const W = 900;
const H = 420;
const project = (lat, lng) => ({
  x: ((lng + 180) / 360) * W,
  y: ((90 - lat) / 180) * H,
});

const CONTINENTS = [
  { cx: 220, cy: 150, rx: 90, ry: 55 },
  { cx: 300, cy: 260, rx: 55, ry: 70 },
  { cx: 470, cy: 150, rx: 55, ry: 40 },
  { cx: 510, cy: 240, rx: 75, ry: 85 },
  { cx: 650, cy: 180, rx: 130, ry: 60 },
  { cx: 770, cy: 305, rx: 55, ry: 32 },
];

const localTime = (tz) =>
  new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
    hour12: false,
  });

export default function GlobalPulse({ compact = false }) {
  const [tick, setTick] = useState(0);
  const [realUsers, setRealUsers] = useState([]);

  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    api
      .get("/global/creators/v2")
      .then((r) => {
        const withGeo = (r.data.users || []).filter(
          (u) => u.lat !== 0 || u.lng !== 0
        );
        setRealUsers(withGeo.slice(0, 20));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="glass rounded-2xl overflow-hidden relative" data-testid="global-pulse">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 left-1/3 w-96 h-96 rounded-full bg-[#007AFF]/10 blur-[100px]" />
      </div>

      <div className="relative p-6 pb-2">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="text-[10px] tracking-overline text-zinc-500 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 dot-pulse" />
              Live · Creators online worldwide
            </div>
            <h2 className="font-display text-2xl sm:text-3xl tracking-tight font-medium mt-1">
              A worldwide creative campus
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Follow-the-sun collaboration across {CITIES.length} cities and{" "}
              {ROUTES.length} active sessions
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Stat icon={<Globe2 size={13} />} value={CITIES.length} label="cities" />
            <Stat icon={<Users size={13} />} value="4.2k" label="online" />
            <Stat value={ROUTES.length} label="live sessions" />
          </div>
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className={`w-full h-auto ${compact ? "max-h-[280px]" : ""}`}
          style={{ background: "transparent" }}
        >
          {/* Grid */}
          {[15, 30, 45, 60, 75].flatMap((deg) => [
            <line
              key={`n${deg}`}
              x1={0}
              x2={W}
              y1={((90 - deg) / 180) * H}
              y2={((90 - deg) / 180) * H}
              stroke="rgba(255,255,255,0.03)"
            />,
            <line
              key={`s${deg}`}
              x1={0}
              x2={W}
              y1={((90 + deg) / 180) * H}
              y2={((90 + deg) / 180) * H}
              stroke="rgba(255,255,255,0.03)"
            />,
          ])}
          {Array.from({ length: 12 }).map((_, i) => (
            <line
              key={`l${i}`}
              x1={(i / 12) * W}
              x2={(i / 12) * W}
              y1={0}
              y2={H}
              stroke="rgba(255,255,255,0.03)"
            />
          ))}
          {/* Continents */}
          {CONTINENTS.map((c, i) => (
            <ellipse
              key={i}
              cx={c.cx}
              cy={c.cy}
              rx={c.rx}
              ry={c.ry}
              fill="rgba(255,255,255,0.025)"
              stroke="rgba(255,255,255,0.05)"
            />
          ))}
          {/* Arcs */}
          {ROUTES.map(([a, b], i) => {
            const p1 = project(CITIES[a].lat, CITIES[a].lng);
            const p2 = project(CITIES[b].lat, CITIES[b].lng);
            const mx = (p1.x + p2.x) / 2;
            const my = Math.min(p1.y, p2.y) - 80;
            return (
              <g key={`arc-${i}`}>
                <path
                  d={`M ${p1.x} ${p1.y} Q ${mx} ${my} ${p2.x} ${p2.y}`}
                  stroke="url(#arcGrad)"
                  strokeWidth={1.4}
                  fill="none"
                  strokeDasharray="4 6"
                  opacity={0.9}
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="-30"
                    dur={`${3 + (i % 3)}s`}
                    repeatCount="indefinite"
                  />
                </path>
              </g>
            );
          })}
          <defs>
            <linearGradient id="arcGrad" x1="0" x2="1">
              <stop offset="0%" stopColor="#007AFF" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          {/* City dots */}
          {CITIES.map((c, i) => {
            const { x, y } = project(c.lat, c.lng);
            return (
              <g key={c.name} data-testid={`globe-city-${c.name}`}>
                <circle
                  cx={x}
                  cy={y}
                  r="7"
                  fill="#007AFF"
                  opacity="0.25"
                >
                  <animate
                    attributeName="r"
                    values="7;12;7"
                    dur={`${2 + (i % 3)}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.25;0;0.25"
                    dur={`${2 + (i % 3)}s`}
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx={x} cy={y} r="2.5" fill="#FAFAFA" />
              </g>
            );
          })}
          {/* Real user dots (from actual signups) */}
          {realUsers.map((u, i) => {
            const { x, y } = project(u.lat, u.lng);
            return (
              <g key={`real-${i}`} data-testid={`globe-user-${i}`}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#F59E0B"
                  opacity="0.35"
                >
                  <animate
                    attributeName="r"
                    values="4;8;4"
                    dur="2.5s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx={x} cy={y} r="1.5" fill="#F59E0B" />
              </g>
            );
          })}
        </svg>
      </div>

      {/* City strip */}
      <div className="relative border-t border-white/[0.06] p-3 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {CITIES.slice(0, 8).map((c) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] text-xs whitespace-nowrap"
              data-testid={`city-chip-${c.name}`}
            >
              <span className="text-sm leading-none">{c.flag}</span>
              <span className="text-zinc-100 font-medium">{c.name}</span>
              <span className="text-zinc-500 font-mono">{localTime(c.tz)}</span>
              <span className="w-1 h-1 rounded-full bg-emerald-400 dot-pulse" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

const Stat = ({ icon, value, label }) => (
  <div className="flex items-center gap-1.5">
    {icon && <span className="text-zinc-500">{icon}</span>}
    <span className="font-display text-base text-zinc-50">{value}</span>
    <span className="text-[10px] tracking-overline text-zinc-500">{label}</span>
  </div>
);

export { CITIES, localTime };
