import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { RoleChip, VerifiedBadge } from "@/components/coheir/MentorCard";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { toast } from "sonner";

export default function SessionDetail() {
  const { sessionId } = useParams();
  const [s, setS] = useState(null);

  useEffect(() => { api.get(`/sessions/${sessionId}`).then(({ data }) => setS(data)); }, [sessionId]);

  if (!s) return <div className="text-zinc-500 font-mono text-xs">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl h-64">
        {s.cover_image && <img src={s.cover_image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="relative p-8 h-full flex flex-col justify-end">
          <div className="flex items-center gap-2 mb-3">
            <RoleChip tone={s.status === "live" ? "orange" : "blue"}>{s.status === "live" ? "● Live" : s.kind.replace(/_/g, " ")}</RoleChip>
            {(s.tags || []).map((t) => <RoleChip key={t} tone="zinc">{t}</RoleChip>)}
          </div>
          <h1 className="wordmark text-4xl md:text-5xl text-white leading-tight">{s.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-panel p-6 lg:col-span-2">
          <div className="wordmark text-xl text-white mb-3">About this Session</div>
          <div className="text-zinc-300 leading-relaxed">{s.description}</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <div className="glass-interactive p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Host</div>
              <div className="text-white text-sm mt-1">{s.host_name}</div>
            </div>
            <div className="glass-interactive p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">When</div>
              <div className="text-white text-sm mt-1 flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />{new Date(s.start).toLocaleString()}</div>
            </div>
            <div className="glass-interactive p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Duration</div>
              <div className="text-white text-sm mt-1 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{s.duration_minutes}m</div>
            </div>
            <div className="glass-interactive p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Location</div>
              <div className="text-white text-sm mt-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{s.location}</div>
            </div>
          </div>
        </div>
        <div className="glass-panel p-6">
          <div className="wordmark text-xl text-white mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-[#00F0FF]" /> Attendees</div>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {(s.attendees || []).map((a) => (
              <Link key={a.user_id} to={`/profile/${a.user_id}`} className="glass-interactive px-3 py-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  {a.picture ? <img src={a.picture} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-cohesion" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm truncate flex items-center gap-1">{a.name} {a.verified && <VerifiedBadge className="w-3 h-3" />}</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{a.role?.replace(/_/g, " ")}</div>
                </div>
              </Link>
            ))}
          </div>
          <button data-testid="session-join-live-btn" onClick={() => toast.success("Joining via ANCRSync™…")} className="btn-primary text-sm w-full mt-4">
            {s.status === "live" ? "Join Live Now" : "RSVP"}
          </button>
          <Link to="/integrations" className="btn-outline text-xs w-full mt-2 text-center block">
            Connect a Meeting Provider
          </Link>
        </div>
      </div>
    </div>
  );
}
