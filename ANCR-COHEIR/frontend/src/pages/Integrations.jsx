import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { RoleChip } from "@/components/coheir/MentorCard";
import { toast } from "sonner";
import { Video, CalendarDays, CheckCircle2, Plug } from "lucide-react";

export default function Integrations() {
  const [video, setVideo] = useState([]);
  const [cal, setCal] = useState([]);

  const load = () => Promise.all([
    api.get("/providers/video").then(({ data }) => setVideo(data)),
    api.get("/providers/calendar").then(({ data }) => setCal(data)),
  ]);
  useEffect(() => { load(); }, []);

  const request = async (provider_id, kind) => {
    await api.post("/providers/request-connection", { provider_id, kind });
    toast.success(`Connection request logged for ${provider_id}. An admin will provision credentials.`);
  };

  const Card = ({ p, kind, Icon }) => (
    <div className="glass-interactive p-5" data-testid={`provider-${kind}-${p.id}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl grid place-items-center"
          style={{ background: `${p.color}22`, border: `1px solid ${p.color}55` }}>
          <Icon className="w-4 h-4" style={{ color: p.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="wordmark text-white text-base leading-tight">{p.name}</div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            {p.connected ? "Connected" : p.future ? "Coming soon" : "Not connected"}
          </div>
        </div>
        {p.connected && <CheckCircle2 className="w-4 h-4 text-[#00F0FF]" />}
      </div>
      <div className="text-zinc-400 text-xs mb-3 min-h-[36px]">{p.description}</div>
      {p.env_vars.length > 0 && (
        <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-3">
          Requires: {p.env_vars.join(" · ")}
        </div>
      )}
      <button
        data-testid={`provider-connect-${p.id}`}
        onClick={() => request(p.id, kind)}
        disabled={p.future}
        className={p.connected ? "btn-outline text-xs w-full" : "btn-primary text-xs w-full"}>
        {p.future ? "Coming soon" : p.connected ? "Manage" : "Connect"}
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2 flex items-center gap-2">
          <Plug className="w-3.5 h-3.5" /> Interchangeable Providers
        </div>
        <h1 className="wordmark text-4xl md:text-5xl text-white">Integrations & Meeting Providers.</h1>
        <p className="text-zinc-500 mt-2 max-w-2xl text-sm">
          COHEIR™ is architected so any video or calendar provider can be swapped in without changing session
          or calendar code. Connect your preferred stack today; extend it tomorrow.
        </p>
      </header>

      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Video Providers</div>
            <h2 className="wordmark text-2xl text-white flex items-center gap-2"><Video className="w-5 h-5 text-[#00F0FF]" /> Studio Sessions & Meetings</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {video.map((p) => <Card key={p.id} p={p} kind="video" Icon={Video} />)}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Calendar Providers</div>
            <h2 className="wordmark text-2xl text-white flex items-center gap-2"><CalendarDays className="w-5 h-5 text-[#00F0FF]" /> Calendars & Scheduling</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {cal.map((p) => <Card key={p.id} p={p} kind="calendar" Icon={CalendarDays} />)}
        </div>
      </section>
    </div>
  );
}
