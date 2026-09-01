import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { RoleChip, VerifiedBadge } from "@/components/coheir/MentorCard";
import { Search } from "lucide-react";

export default function Employer() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  useEffect(() => { api.get(`/students?q=${encodeURIComponent(q)}`).then(({ data }) => setItems(data)); }, [q]);
  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Employer Portal</div>
        <h1 className="wordmark text-4xl md:text-5xl text-white">Discover verified emerging talent.</h1>
        <p className="text-zinc-500 mt-2 max-w-2xl text-sm">Search students, review portfolios, request interviews, contact faculty and mentors, request recommendations, track candidates.</p>
      </header>
      <div className="glass-panel p-4 flex gap-3 items-center">
        <label className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by skill, program, discipline…"
            className="w-full bg-white/[0.04] border border-white/[0.06] rounded-full pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none" />
        </label>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((s) => (
          <div key={s.user_id} className="glass-interactive p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 rounded-2xl overflow-hidden">
                {s.picture ? <img src={s.picture} alt={s.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-cohesion" />}
              </div>
              <div>
                <div className="text-white font-semibold flex items-center gap-1">{s.name} {s.verified && <VerifiedBadge className="w-3.5 h-3.5" />}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{s.program}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {(s.skills || []).slice(0, 4).map((sk) => <RoleChip key={sk} tone="zinc">{sk}</RoleChip>)}
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
              <span>Readiness</span>
              <span className="text-[#00F0FF] font-mono">{s.career_readiness || 0}/100</span>
            </div>
            <div className="flex gap-2">
              <Link to={`/students/${s.user_id}`} className="btn-outline text-xs flex-1 text-center">View Portfolio</Link>
              <button className="btn-primary text-xs">Request Interview</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
