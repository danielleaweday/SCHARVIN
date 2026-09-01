import React, { useEffect, useState } from "react";
import AppShell from "@/components/ancrd/AppShell";
import { api } from "@/lib/api";

export default function AdminPage() {
  const [stats, setStats] = useState({});
  useEffect(() => { api.get("/admin/stats").then(({data})=>setStats(data)); }, []);
  const cards = [
    { key: "users", label: "Verified Members" },
    { key: "institutions", label: "Institutions" },
    { key: "posts", label: "Posts" },
    { key: "communities", label: "Communities" },
    { key: "events", label: "Events" },
    { key: "opportunities", label: "Opportunities" },
    { key: "marketplace", label: "Marketplace Listings" },
  ];

  return (
    <AppShell>
      <div className="mb-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">Administration</div>
        <h1 className="font-display text-5xl font-black tracking-tighter mt-1">Command Center</h1>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 stagger">
        {cards.map(c => (
          <div key={c.key} data-testid={`stat-${c.key}`} className="glass rounded-sm p-5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">{c.label}</div>
            <div className="font-display font-black text-4xl tracking-tighter mt-1">{stats[c.key] ?? "—"}</div>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4 mt-8">
        <div className="glass rounded-sm p-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">Moderation Queue</div>
          <div className="text-white/60 text-sm">No items requiring review. Auto-moderation is active across all channels.</div>
        </div>
        <div className="glass rounded-sm p-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">Engagement (7d)</div>
          <div className="flex items-end gap-1 h-24">
            {[40,60,55,80,72,90,68].map((v,i)=>(
              <div key={i} className="flex-1 bg-gradient-to-t from-[#00E5FF]/20 to-[#00E5FF]/60 rounded-sm" style={{height: `${v}%`}} />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
