import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { RoleChip, VerifiedBadge } from "@/components/coheir/MentorCard";

export default function CohortDetail() {
  const { cohortId } = useParams();
  const [c, setC] = useState(null);
  useEffect(() => { api.get(`/cohorts/${cohortId}`).then(({ data }) => setC(data)); }, [cohortId]);
  if (!c) return <div className="text-zinc-500 font-mono text-xs">Loading cohort…</div>;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl h-64">
        {c.cover_image && <img src={c.cover_image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-55" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="relative p-8 h-full flex flex-col justify-end">
          <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-2">{c.program}</div>
          <h1 className="wordmark text-5xl text-white leading-tight">{c.name}</h1>
          <p className="text-zinc-300 mt-3 max-w-2xl">{c.description}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-panel p-6">
          <div className="wordmark text-xl text-white mb-4">Mentors</div>
          <div className="space-y-2">
            {(c.mentors || []).map((m) => (
              <Link key={m.user_id} to={`/profile/${m.user_id}`} className="glass-interactive p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  {m.picture ? <img src={m.picture} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-cohesion" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm truncate flex items-center gap-1">{m.name} {m.verified && <VerifiedBadge className="w-3 h-3" />}</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{m.title || m.role?.replace(/_/g, " ")}</div>
                </div>
                <RoleChip tone="violet">{m.role?.replace(/_/g, " ")}</RoleChip>
              </Link>
            ))}
          </div>
        </div>
        <div className="glass-panel p-6">
          <div className="wordmark text-xl text-white mb-4">Students</div>
          <div className="space-y-2">
            {(c.students || []).map((s) => (
              <Link key={s.user_id} to={`/students/${s.user_id}`} className="glass-interactive p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  {s.picture ? <img src={s.picture} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-cohesion" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm truncate">{s.name}</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{s.program}</div>
                </div>
                <div className="font-mono text-[10px] text-[#00F0FF]">{s.career_readiness || 0}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
