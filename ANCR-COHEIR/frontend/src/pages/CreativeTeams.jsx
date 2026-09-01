import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { RoleChip } from "@/components/coheir/MentorCard";

export default function CreativeTeams() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/creative-teams").then(({ data }) => setItems(data)); }, []);
  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Creative Teams</div>
        <h1 className="wordmark text-4xl md:text-5xl text-white">Professional teams shipping real work.</h1>
        <p className="text-zinc-500 mt-2 max-w-2xl text-sm">Connected directly to ANCRSync™ collaborative workspaces.</p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {items.map((t) => (
          <div key={t.id} className="glass-panel overflow-hidden">
            <div className="h-36 relative">
              {t.cover_image && <img src={t.cover_image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-300">{t.project}</div>
                <div className="wordmark text-2xl text-white leading-tight">{t.name}</div>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <div className="text-zinc-400 text-sm">{t.description}</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-[#00F0FF]">{t.ancrsync_workspace}</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {(t.members || []).map((m) => (
                  <div key={m.user_id} className="glass-interactive p-2 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      {m.avatar ? <img src={m.avatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-cohesion" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-white text-xs truncate">{m.name}</div>
                      <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 truncate">{m.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
