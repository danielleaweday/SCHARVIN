import React, { useEffect, useState } from "react";
import AppShell from "@/components/ancrd/AppShell";
import PageHeader from "@/components/ancrd/PageHeader";
import { api } from "@/lib/api";
import { Calendar, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function EventsPage() {
  const [items, setItems] = useState([]);
  const load = () => api.get("/events").then(({data})=>setItems(data));
  useEffect(() => { load(); }, []);
  const rsvp = async (id) => { await api.post(`/events/${id}/rsvp`); toast.success("RSVP confirmed"); load(); };

  return (
    <AppShell>
      <PageHeader
        section="Events"
        kicker="Masterclasses, camps, showcases, panels"
        description="Programmed experiences hosted by CCDP institutions, mentors, and industry partners around the world."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
        {items.map(e => (
          <div key={e.id} data-testid={`event-${e.id}`} className="glass rounded-sm overflow-hidden">
            <div className="relative h-40">
              <img src={e.banner} className="w-full h-full object-cover opacity-70" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] to-transparent" />
              <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/60 backdrop-blur border border-white/10 rounded-sm font-mono text-[10px] uppercase tracking-widest text-[#00E5FF]">{e.kind}</div>
            </div>
            <div className="p-5">
              <div className="font-display font-black text-2xl tracking-tighter">{e.title}</div>
              <div className="mt-2 flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-white/50">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(e.date).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {e.location}</span>
              </div>
              <p className="text-sm text-white/60 mt-3">{e.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">{e.attendees?.length || 0} attending</div>
                <button data-testid={`rsvp-${e.id}`} onClick={()=>rsvp(e.id)} className="px-3 py-1.5 bg-white text-black font-mono text-[10px] uppercase tracking-widest rounded-sm btn-cine hover:bg-[#00E5FF]">RSVP</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
