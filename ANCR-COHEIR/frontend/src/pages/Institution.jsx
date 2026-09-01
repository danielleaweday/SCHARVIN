import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { RoleChip } from "@/components/coheir/MentorCard";
import { Building2, Users, GraduationCap, Sparkles, FlaskConical } from "lucide-react";

export default function Institution() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/institution/overview").then(({ data }) => setData(data)); }, []);
  if (!data) return <div className="text-zinc-500 font-mono text-xs">Loading…</div>;
  const cards = [
    { l: "Students", v: data.stats.students, i: GraduationCap },
    { l: "Faculty", v: data.stats.faculty, i: Building2 },
    { l: "Verified Mentors", v: data.stats.mentors, i: Users },
    { l: "Cohorts", v: data.stats.cohorts, i: FlaskConical },
    { l: "Upcoming Sessions", v: data.stats.sessions_upcoming, i: Sparkles },
    { l: "Open Opportunities", v: data.stats.opportunities_open, i: Sparkles },
    { l: "Reviews Logged", v: data.stats.reviews_logged, i: FlaskConical },
    { l: "Recommendations", v: data.stats.recommendations, i: Sparkles },
  ];
  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Institution Dashboard</div>
        <h1 className="wordmark text-4xl md:text-5xl text-white">CCDP — Program Intelligence.</h1>
      </header>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.l} className="glass-panel p-5">
            <c.i className="w-5 h-5 text-[#00F0FF] mb-3" />
            <div className="wordmark text-3xl text-white">{c.v}</div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{c.l}</div>
          </div>
        ))}
      </div>
      <div className="glass-panel p-6">
        <div className="wordmark text-xl text-white mb-4">Programs</div>
        <div className="flex flex-wrap gap-2">
          {data.programs.map((p) => <RoleChip key={p} tone="blue">{p}</RoleChip>)}
        </div>
      </div>
    </div>
  );
}
