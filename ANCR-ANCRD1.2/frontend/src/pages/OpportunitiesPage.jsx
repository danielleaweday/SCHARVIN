import React, { useEffect, useState } from "react";
import AppShell from "@/components/ancrd/AppShell";
import PageHeader from "@/components/ancrd/PageHeader";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { MapPin, Coins, Clock } from "lucide-react";

export default function OpportunitiesPage() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("");
  const load = () => api.get("/opportunities").then(({data})=>setItems(data));
  useEffect(() => { load(); }, []);
  const apply = async (id) => { await api.post(`/opportunities/${id}/apply`); toast.success("Application submitted"); load(); };

  const kinds = [...new Set(items.map(i => i.kind))];
  const shown = filter ? items.filter(i => i.kind === filter) : items;

  return (
    <AppShell>
      <PageHeader
        section="Opportunities"
        kicker="Jobs, grants, sync placements, residencies"
        description="Verified opportunities surfaced by industry partners, labels, publishers, and CCDP institutions."
      />
      <div className="mb-6 flex flex-wrap gap-2">
        <button onClick={()=>setFilter("")} className={`px-3 py-1.5 rounded-sm font-mono text-[10px] uppercase tracking-widest border ${!filter ? "bg-white text-black border-white" : "border-white/10 hover:border-white/30"}`}>All</button>
        {kinds.map(k => (
          <button key={k} data-testid={`opp-filter-${k.toLowerCase().replace(/\s+/g,'-')}`} onClick={()=>setFilter(k)} className={`px-3 py-1.5 rounded-sm font-mono text-[10px] uppercase tracking-widest border ${filter === k ? "bg-white text-black border-white" : "border-white/10 hover:border-white/30"}`}>{k}</button>
        ))}
      </div>
      <div className="space-y-3 stagger">
        {shown.map(o => (
          <div key={o.id} data-testid={`opp-${o.id}`} className="glass rounded-sm p-5 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#00E5FF]">{o.kind}</span>
                <span className="font-mono text-[10px] text-white/40">·</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-white/60">{o.company}</span>
              </div>
              <div className="font-display font-black text-xl tracking-tighter mt-1">{o.title}</div>
              <p className="text-sm text-white/60 mt-1">{o.description}</p>
              <div className="mt-2 flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-widest text-white/50">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {o.location}</span>
                <span className="flex items-center gap-1"><Coins className="h-3 w-3" /> {o.compensation}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> by {new Date(o.deadline).toLocaleDateString()}</span>
              </div>
            </div>
            <button data-testid={`apply-${o.id}`} onClick={()=>apply(o.id)} className="px-4 py-2 bg-white text-black font-mono text-[11px] uppercase tracking-widest rounded-sm btn-cine hover:bg-[#00E5FF]">Apply</button>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
