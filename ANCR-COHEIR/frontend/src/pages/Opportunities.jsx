import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { RoleChip } from "@/components/coheir/MentorCard";
import { toast } from "sonner";
import { MapPin, DollarSign, CalendarDays } from "lucide-react";

export default function Opportunities() {
  const [items, setItems] = useState([]);
  const [kind, setKind] = useState("");
  const load = () => api.get(kind ? `/opportunities?kind=${kind}` : "/opportunities").then(({ data }) => setItems(data));
  useEffect(() => { load(); }, [kind]);
  const apply = async (id) => {
    await api.post("/opportunities/apply", { opportunity_id: id });
    toast.success("Application submitted");
    load();
  };
  const kinds = [
    { v: "", l: "All" }, { v: "internship", l: "Internships" }, { v: "employment", l: "Employment" },
    { v: "session_work", l: "Session Work" }, { v: "artist_development", l: "Artist Development" },
    { v: "publishing", l: "Publishing" }, { v: "scholarship", l: "Scholarships" },
    { v: "assistant", l: "Assistant" }, { v: "film_project", l: "Film Projects" },
  ];
  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Opportunities</div>
        <h1 className="wordmark text-4xl md:text-5xl text-white">Real work. Real careers.</h1>
      </header>
      <div className="glass-panel p-3 flex flex-wrap gap-2">
        {kinds.map((k) => (
          <button key={k.v} onClick={() => setKind(k.v)} data-testid={`opp-filter-${k.v || "all"}`}
            className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest border transition-colors ${
              kind === k.v ? "bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30" :
              "bg-white/[0.03] text-zinc-400 border-white/[0.08] hover:text-white"
            }`}>{k.l}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((o) => (
          <div key={o.id} className="glass-panel p-6" data-testid={`opp-card-${o.id}`}>
            <div className="flex items-center gap-2 mb-2">
              <RoleChip tone="orange">{o.kind.replace(/_/g, " ")}</RoleChip>
              <RoleChip tone="zinc">{o.company}</RoleChip>
            </div>
            <div className="wordmark text-2xl text-white leading-tight mb-2">{o.title}</div>
            <div className="text-zinc-400 text-sm">{o.description}</div>
            <div className="grid grid-cols-3 gap-3 mt-4 text-xs">
              <div className="text-zinc-500 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {o.location}</div>
              <div className="text-zinc-500 flex items-center gap-1.5"><DollarSign className="w-3 h-3" /> {o.compensation || "—"}</div>
              <div className="text-zinc-500 flex items-center gap-1.5"><CalendarDays className="w-3 h-3" /> {o.deadline ? new Date(o.deadline).toLocaleDateString() : "—"}</div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                Posted by {o.posted_by_name} · {(o.applicant_ids || []).length} applicants
              </div>
              <button data-testid={`opp-apply-${o.id}`} onClick={() => apply(o.id)} className="btn-primary text-xs">Apply Now</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
