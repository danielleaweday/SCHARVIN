import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users2, MapPin, Search, UserPlus, UserCheck, BadgeCheck, Music, Store, Ticket } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { PageHeader, GlassCard, Loader, Pill, fadeUp, staggerContainer } from "@/components/common";

const TYPES = ["All", "Musician", "Store", "Show"];
const iconFor = (t) => ({ Musician: Music, Store: Store, Show: Ticket }[t] || Users2);

export default function Network() {
  const [items, setItems] = useState(null);
  const [type, setType] = useState("All");
  const [q, setQ] = useState("");

  const load = (t, query) => api.get("/network", { params: { ...(t && t !== "All" ? { type: t } : {}), ...(query ? { q: query } : {}) } }).then((r) => setItems(r.data));
  useEffect(() => { load("All", ""); }, []);
  if (!items) return <Loader label="Finding your global network" />;

  const connect = async (id) => {
    const { data } = await api.post(`/network/${id}/connect`);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, connected: data.connected } : i)));
    toast[data.connected ? "success" : "message"](data.connected ? "Connected — introduction sent (demo)" : "Connection removed");
  };

  return (
    <div data-testid="network-page">
      <PageHeader eyebrow="Network" title="Connect with local creatives"
        subtitle="Find and connect with musicians, stores and shows around the world — build your creative network before you arrive."
        testid="network-header" />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input value={q} onChange={(e) => { setQ(e.target.value); load(type, e.target.value); }} placeholder="Search by name, city, genre" data-testid="network-search" className="w-full rounded-full border border-white/12 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/40 outline-none focus:border-cyan/50" />
        </div>
        <div className="flex gap-2" data-testid="network-type-filter">
          {TYPES.map((t) => (<button key={t} onClick={() => { setType(t); load(t, q); }} data-testid={`network-type-${t.toLowerCase()}`} className={`rounded-full px-4 py-2 text-xs font-600 transition ${type === t ? "bg-cyan/20 text-cyan border border-cyan/40" : "border border-white/10 bg-white/5 text-white/55 hover:text-white"}`}>{t}</button>))}
        </div>
      </div>

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((n) => {
          const Icon = iconFor(n.type);
          return (
            <motion.div key={n.id} variants={fadeUp}>
              <GlassCard hover className="h-full p-5" data-testid={`network-card-${n.id}`}>
                <div className="flex items-start gap-4">
                  <img src={n.avatar} alt={n.name} className="h-14 w-14 rounded-xl object-cover" />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5"><h3 className="font-600 text-white">{n.name}</h3>{n.verified && <BadgeCheck className="h-4 w-4 text-cyan" />}</div>
                    <div className="text-xs text-white/55">{n.role}</div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-white/45"><MapPin className="h-3 w-3" /> {n.city}, {n.country}</div>
                  </div>
                  <Pill tone="violet"><Icon className="h-3 w-3" /> {n.type}</Pill>
                </div>
                <p className="mt-3 text-sm text-white/60">{n.bio}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">{n.genres.map((g) => <Pill key={g} tone="muted">{g}</Pill>)}</div>
                <button onClick={() => connect(n.id)} data-testid={`connect-${n.id}`} className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-600 transition ${n.connected ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "bg-gradient-to-r from-cyan to-violet text-white hover:brightness-110"}`}>
                  {n.connected ? <><UserCheck className="h-4 w-4" /> Connected</> : <><UserPlus className="h-4 w-4" /> Connect</>}
                </button>
              </GlassCard>
            </motion.div>
          );
        })}
      </motion.div>
      {items.length === 0 && <div className="py-16 text-center text-white/45">No matches found. Try a different search.</div>}
    </div>
  );
}
