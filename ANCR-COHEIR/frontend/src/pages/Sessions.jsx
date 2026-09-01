import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { RoleChip } from "@/components/coheir/MentorCard";
import { Sparkles, CalendarDays, MapPin, Clock, ArrowRight } from "lucide-react";

const KINDS = [
  { v: "", l: "All" }, { v: "masterclass", l: "Masterclasses" }, { v: "writing_camp", l: "Writing Camps" },
  { v: "studio_session", l: "Studio Sessions" }, { v: "portfolio_review", l: "Portfolio Reviews" },
  { v: "office_hours", l: "Office Hours" }, { v: "panel", l: "Panels" },
  { v: "guest_lecture", l: "Guest Lectures" }, { v: "career_coaching", l: "Career Coaching" },
];

export default function Sessions() {
  const [kind, setKind] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    const url = kind ? `/sessions?kind=${kind}` : "/sessions";
    api.get(url).then(({ data }) => setItems(data));
  }, [kind]);

  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Industry Sessions</div>
        <h1 className="wordmark text-4xl md:text-5xl text-white">Masterclasses. Camps. Studio time.</h1>
      </header>

      <div className="glass-panel p-3 flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <button key={k.v} data-testid={`session-filter-${k.v || "all"}`} onClick={() => setKind(k.v)}
            className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest border transition-colors ${
              kind === k.v ? "bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30" :
              "bg-white/[0.03] text-zinc-400 border-white/[0.08] hover:text-white"
            }`}>{k.l}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((s) => (
          <Link key={s.id} to={`/sessions/${s.id}`} className="glass-interactive p-0 overflow-hidden group"
            data-testid={`session-card-${s.id}`}>
            <div className="h-36 relative overflow-hidden">
              {s.cover_image ? (
                <img src={s.cover_image} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : <div className="absolute inset-0 bg-gradient-cohesion opacity-60" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute top-3 left-3">
                <RoleChip tone={s.status === "live" ? "orange" : "blue"}>
                  {s.status === "live" ? "● Live" : s.kind.replace(/_/g, " ")}
                </RoleChip>
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <div className="wordmark text-white text-lg leading-tight">{s.title}</div>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <div className="text-zinc-400 text-xs line-clamp-2">{s.description}</div>
              <div className="flex flex-wrap items-center gap-3 text-zinc-500 text-xs">
                <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-[#00F0FF]" /> {s.host_name}</span>
                <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {new Date(s.start).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {s.duration_minutes}m</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="flex items-center gap-1 text-zinc-500 text-xs"><MapPin className="w-3 h-3" /> {s.location}</span>
                <span className="text-[#00F0FF] text-xs flex items-center gap-1">Details <ArrowRight className="w-3 h-3" /></span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
