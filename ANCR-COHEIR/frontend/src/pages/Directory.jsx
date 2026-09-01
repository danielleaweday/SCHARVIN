import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { MentorCard, RoleChip } from "@/components/coheir/MentorCard";
import { Filter, Search } from "lucide-react";

const ROLES = [
  { v: "", l: "All Roles" },
  { v: "producer", l: "Producers" },
  { v: "songwriter", l: "Songwriters" },
  { v: "engineer", l: "Engineers" },
  { v: "creative_director", l: "Creative Directors" },
  { v: "attorney", l: "Attorneys" },
  { v: "publisher", l: "Publishers" },
  { v: "manager", l: "Managers" },
  { v: "employer", l: "Employers" },
  { v: "faculty", l: "Faculty" },
  { v: "department_chair", l: "Dept. Chairs" },
];

export default function Directory() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [role, setRole] = useState(params.get("role") || "");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (role) p.set("role", role);
    api.get(`/professionals?${p.toString()}`)
      .then(({ data }) => setItems(data))
      .finally(() => setLoading(false));
  };
  useEffect(load, [role]);

  const submit = (e) => { e.preventDefault(); setParams({ q, role }); load(); };

  const grouped = useMemo(() => {
    const g = {};
    for (const p of items) {
      const key = p.role || "other";
      g[key] = g[key] || [];
      g[key].push(p);
    }
    return g;
  }, [items]);

  return (
    <div className="space-y-8">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Industry Directory</div>
        <h1 className="wordmark text-4xl md:text-5xl text-white">Verified Industry Leaders.</h1>
        <p className="text-zinc-500 mt-2 max-w-2xl">
          Every professional in COHEIR™ is verified through ANCRID™. Search by discipline, role, expertise or location.
        </p>
      </header>

      <form onSubmit={submit} className="glass-panel p-4 flex flex-col md:flex-row items-stretch gap-3">
        <label className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            data-testid="directory-search-input"
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, expertise, company…"
            className="w-full bg-white/[0.04] border border-white/[0.06] focus:border-white/[0.18] rounded-full pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none"
          />
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-zinc-400 text-xs px-2"><Filter className="w-3.5 h-3.5" /> Filter</div>
          {ROLES.slice(0, 7).map((r) => (
            <button key={r.v} type="button"
              data-testid={`directory-filter-${r.v || "all"}`}
              onClick={() => setRole(r.v)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest border transition-colors ${
                role === r.v ? "bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30" :
                "bg-white/[0.03] text-zinc-400 border-white/[0.08] hover:text-white"
              }`}>
              {r.l}
            </button>
          ))}
        </div>
      </form>

      {loading ? (
        <div className="text-zinc-500 font-mono text-xs">Loading…</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="glass-panel p-10 text-center text-zinc-500">No professionals match your search.</div>
      ) : (
        Object.entries(grouped).map(([key, list]) => (
          <section key={key} className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="wordmark text-xl text-white capitalize">{key.replace(/_/g, " ")}s</div>
              <RoleChip tone="zinc">{list.length}</RoleChip>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {list.map((p, i) => <MentorCard key={p.user_id} p={p} index={i} />)}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
