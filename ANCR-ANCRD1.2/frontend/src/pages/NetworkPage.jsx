import React, { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/ancrd/AppShell";
import PageHeader from "@/components/ancrd/PageHeader";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";
import { Search, CheckCircle2 } from "lucide-react";

export default function NetworkPage() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [discipline, setDiscipline] = useState("");

  useEffect(() => {
    api.get("/users").then(({ data }) => setUsers(data));
  }, []);

  const roles = useMemo(() => [...new Set(users.map((u) => u.role))].sort(), [users]);
  const disciplines = useMemo(
    () => [...new Set(users.flatMap((u) => u.disciplines || []))].sort(),
    [users]
  );

  const filtered = useMemo(
    () =>
      users.filter((u) => {
        if (q && !u.name.toLowerCase().includes(q.toLowerCase())) return false;
        if (role && u.role !== role) return false;
        if (discipline && !u.disciplines?.includes(discipline)) return false;
        return true;
      }),
    [users, q, role, discipline]
  );

  return (
    <AppShell>
      <PageHeader
        section="Network"
        kicker="Verified members of the ANCRD Network"
        description="Every creator, faculty member, mentor, and industry partner in the CCDP ecosystem — authenticated through ANCRID."
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        <div className="md:col-span-6 relative">
          <Search className="h-4 w-4 absolute left-3 top-3 text-white/30" />
          <input
            data-testid="network-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name…"
            className="w-full pl-9 pr-3 py-2.5 bg-black/40 border border-white/10 focus:border-white/30 outline-none rounded-sm text-sm"
          />
        </div>
        <div className="md:col-span-3">
          <select
            data-testid="network-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-black/40 border border-white/10 focus:border-white/30 outline-none rounded-sm px-3 py-2.5 text-sm font-mono"
          >
            <option value="">All roles</option>
            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="md:col-span-3">
          <select
            data-testid="network-discipline"
            value={discipline}
            onChange={(e) => setDiscipline(e.target.value)}
            className="w-full bg-black/40 border border-white/10 focus:border-white/30 outline-none rounded-sm px-3 py-2.5 text-sm font-mono"
          >
            <option value="">All disciplines</option>
            {disciplines.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">
        {filtered.length} verified members
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger">
        {filtered.map((u) => (
          <Link
            key={u.id}
            to={`/profile/${u.id}`}
            data-testid={`network-card-${u.id}`}
            className="glass rounded-sm overflow-hidden group btn-cine hover:border-white/20 flex flex-col"
          >
            <div className="relative h-28 overflow-hidden">
              <img src={u.banner} className="w-full h-full object-cover opacity-60" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent" />
            </div>
            <div className="px-4 pb-4 -mt-8 relative">
              <img
                src={u.avatar}
                alt=""
                className="h-14 w-14 rounded-sm object-cover border-4 border-[#050505]"
              />
              <div className="mt-2 flex items-center gap-1.5">
                <div className="font-display font-black text-base truncate">{u.name}</div>
                {u.verified && (
                  <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "#F97316" }} />
                )}
              </div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-white/40 truncate">
                {u.role}
              </div>
              <div className="text-xs text-white/60 mt-1 truncate">
                {u.institution}
              </div>
              <div className="text-[10px] text-white/40 mt-0.5">{u.city}, {u.country}</div>
              <div className="mt-3 flex flex-wrap gap-1">
                {(u.disciplines || []).slice(0, 2).map((d) => (
                  <span
                    key={d}
                    className="px-1.5 py-0.5 border border-white/10 rounded-sm font-mono text-[9px] uppercase tracking-wider text-white/70"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
