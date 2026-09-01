import { useEffect, useState } from "react";
import { Compass, Search } from "lucide-react";
import api from "../lib/api";

const ROLES = [
  "All",
  "Producer",
  "Songwriter",
  "Engineer",
  "Faculty",
  "Filmmaker",
  "Designer",
  "Animator",
  "Photographer",
];

const AVAILABILITIES = ["All", "Available", "Booked"];

export default function Discover() {
  const [creators, setCreators] = useState([]);
  const [role, setRole] = useState("All");
  const [availability, setAvailability] = useState("All");
  const [q, setQ] = useState("");

  useEffect(() => {
    api.get("/discover").then((r) => setCreators(r.data));
  }, []);

  const filtered = creators.filter((c) => {
    if (role !== "All" && !c.role.includes(role)) return false;
    if (availability !== "All" && c.availability !== availability) return false;
    if (q && !`${c.name} ${c.role} ${c.discipline} ${c.city}`.toLowerCase().includes(q.toLowerCase()))
      return false;
    return true;
  });

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 glass-strong border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-overline text-zinc-500">
              Creator Discovery™
            </div>
            <div className="font-display text-2xl tracking-tight">
              Find collaborators
            </div>
          </div>
          <div className="text-xs text-zinc-500 flex items-center gap-2">
            <Compass size={14} /> {filtered.length} results
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8 space-y-4">
        {/* Search + filters */}
        <div className="glass rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, role, city…"
              data-testid="discover-search"
              className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-full pl-9 pr-4 py-2.5 text-sm text-white focus:border-[#007AFF] outline-none"
            />
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            data-testid="discover-role-select"
            className="bg-zinc-950/60 border border-white/[0.08] rounded-full px-4 py-2.5 text-sm text-white focus:border-[#007AFF] outline-none"
          >
            {ROLES.map((r) => (
              <option key={r} value={r} className="bg-zinc-900">
                Role: {r}
              </option>
            ))}
          </select>
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            data-testid="discover-availability-select"
            className="bg-zinc-950/60 border border-white/[0.08] rounded-full px-4 py-2.5 text-sm text-white focus:border-[#007AFF] outline-none"
          >
            {AVAILABILITIES.map((a) => (
              <option key={a} value={a} className="bg-zinc-900">
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              data-testid={`discover-creator-${c.id}`}
              className="glass rounded-2xl p-5 hover:border-white/[0.14] transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center font-display text-base">
                  {c.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-base text-zinc-50 truncate">
                    {c.name}
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate">
                    {c.role} · {c.discipline}
                  </div>
                </div>
                <span
                  className={`text-[10px] tracking-overline px-2 py-1 rounded-full ${
                    c.availability === "Available"
                      ? "text-emerald-300 bg-emerald-500/10"
                      : "text-zinc-500 bg-white/[0.03]"
                  }`}
                >
                  {c.availability}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(c.skills || []).slice(0, 3).map((s) => (
                  <span
                    key={s}
                    className="text-[10px] px-2 py-1 rounded-full bg-white/[0.04] text-zinc-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>
                  {c.city}, {c.country}
                </span>
                <span>{c.experience}y</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
