import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "@/components/ancrd/AppShell";
import PageHeader from "@/components/ancrd/PageHeader";
import { api } from "@/lib/api";
import { Users2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function CommunitiesPage() {
  const [items, setItems] = useState([]);
  const load = () => api.get("/communities").then(({data})=>setItems(data));
  useEffect(() => { load(); }, []);
  const join = async (id, e) => {
    e.preventDefault(); e.stopPropagation();
    await api.post(`/communities/${id}/join`);
    toast.success("Joined collaboration");
    load();
  };

  return (
    <AppShell>
      <PageHeader
        section="Collaborations"
        kicker="Private circles inside the ANCRD Network"
        description="Genre-specific rooms, identity communities, writing camps, and cohort groups. Invitation-only. Verified only."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
        {items.map(c => (
          <Link
            key={c.id}
            to={`/collaborations/${c.id}`}
            data-testid={`community-${c.id}`}
            className="glass rounded-sm overflow-hidden group flex flex-col btn-cine hover:border-white/20"
          >
            <div className="relative h-32 overflow-hidden">
              <img src={c.banner} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent" />
              <div className="absolute bottom-2 left-3 font-mono text-[10px] uppercase tracking-widest" style={{ color: "#F97316" }}>{c.category}</div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="font-display font-black text-xl tracking-tighter">{c.name}</div>
              <p className="text-sm text-white/60 mt-1 line-clamp-2 flex-1">{c.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-white/50">
                  <Users2 className="h-3 w-3" /> {c.members?.length || 0} members
                </div>
                <div className="flex items-center gap-2">
                  <button
                    data-testid={`join-${c.id}`}
                    onClick={(e)=>join(c.id, e)}
                    className="px-3 py-1.5 border border-white/15 hover:border-[#F97316]/60 hover:text-[#F97316] btn-cine rounded-sm font-mono text-[10px] uppercase tracking-widest"
                  >
                    Join
                  </button>
                  <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-white/40 group-hover:text-white">
                    Open <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
