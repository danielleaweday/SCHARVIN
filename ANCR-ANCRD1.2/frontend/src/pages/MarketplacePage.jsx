import React, { useEffect, useState } from "react";
import AppShell from "@/components/ancrd/AppShell";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Star } from "lucide-react";

export default function MarketplacePage() {
  const [items, setItems] = useState([]);
  const load = () => api.get("/marketplace").then(({data})=>setItems(data));
  useEffect(() => { load(); }, []);
  const book = async (id) => { await api.post(`/marketplace/${id}/book`); toast.success("Booking request sent"); };

  return (
    <AppShell>
      <div className="mb-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">Creator Marketplace</div>
        <h1 className="font-display text-5xl font-black tracking-tighter mt-1">The Gallery</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
        {items.map(m => (
          <div key={m.id} data-testid={`mkt-${m.id}`} className="glass rounded-sm p-5 flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <img src={m.provider_avatar} className="h-10 w-10 rounded-sm object-cover" alt="" />
              <div className="min-w-0">
                <div className="font-display font-bold text-sm truncate">{m.provider_name}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">{m.category}</div>
              </div>
            </div>
            <div className="font-display font-black text-xl tracking-tighter">{m.title}</div>
            <p className="text-sm text-white/60 mt-1 flex-1">{m.description}</p>
            <div className="mt-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-white/70"><Star className="h-3 w-3 text-[#D4AF37]" fill="#D4AF37" /> {m.rating} <span className="text-white/40">({m.reviews})</span></div>
              <div className="font-mono text-white/70">{m.price}</div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#00E5FF]">{m.availability}</span>
              <button data-testid={`book-${m.id}`} onClick={()=>book(m.id)} className="px-3 py-1.5 border border-white/15 hover:border-[#00E5FF]/50 hover:text-[#00E5FF] btn-cine rounded-sm font-mono text-[10px] uppercase tracking-widest">Book</button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
