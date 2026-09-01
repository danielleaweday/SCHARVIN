import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Plus, MapPin, Trash2, X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { PageHeader, GlassCard, Loader, Pill, fadeUp, staggerContainer } from "@/components/common";

const MOODS = ["Inspired", "Curious", "Grateful", "Reflective", "Excited", "Homesick"];

export default function Journal() {
  const [entries, setEntries] = useState(null);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", location: "Tokyo, Japan", mood: "Inspired" });

  const load = () => api.get("/journal").then((r) => setEntries(r.data));
  useEffect(() => { load(); }, []);
  if (!entries) return <Loader label="Loading your journal" />;

  const add = async () => {
    if (!form.title || !form.body) { toast.error("Add a title and a few words"); return; }
    await api.post("/journal", { ...form, trip_id: "tokyo-creative-exchange" });
    setShow(false); setForm({ title: "", body: "", location: "Tokyo, Japan", mood: "Inspired" });
    load(); toast.success("Journal entry saved");
  };

  const remove = async (id) => { await api.delete(`/journal/${id}`); load(); toast("Entry deleted"); };

  return (
    <div data-testid="journal-page">
      <PageHeader eyebrow="Travel Journal" title="Capture the journey"
        subtitle="A private space to reflect on your creative travels — moments, lessons and inspiration along the way."
        testid="journal-header"
        action={<button onClick={() => setShow(true)} data-testid="new-entry-btn" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan to-violet px-5 py-2.5 text-sm font-600 text-white transition hover:brightness-110"><Plus className="h-4 w-4" /> New entry</button>}
      />

      {entries.length === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center py-20 text-center" data-testid="journal-empty">
          <BookOpen className="h-12 w-12 text-white/25" strokeWidth={1.4} />
          <p className="mt-4 text-white/55">Your journal is empty. Start writing your first entry.</p>
        </GlassCard>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {entries.map((e) => (
            <motion.div key={e.id} variants={fadeUp}>
              <GlassCard className="group p-6" data-testid={`journal-entry-${e.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone="violet"><Sparkles className="h-3 w-3" /> {e.mood}</Pill>
                    {e.location && <Pill tone="cyan"><MapPin className="h-3 w-3" /> {e.location}</Pill>}
                  </div>
                  <button onClick={() => remove(e.id)} data-testid={`delete-entry-${e.id}`} className="text-white/25 opacity-0 transition group-hover:opacity-100 hover:text-magenta"><Trash2 className="h-4 w-4" /></button>
                </div>
                <h3 className="mt-3 font-display text-xl font-600 text-white">{e.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{e.body}</p>
                <div className="mt-3 font-mono-p text-[11px] text-white/35">{new Date(e.created_at).toLocaleString()}</div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      )}

      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setShow(false)}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0B1021] p-6" data-testid="journal-modal">
            <div className="mb-4 flex items-center justify-between"><h3 className="font-display text-xl font-600 text-white">New journal entry</h3><button onClick={() => setShow(false)} className="text-white/50"><X className="h-5 w-5" /></button></div>
            <div className="space-y-3">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" data-testid="entry-title" className="w-full rounded-xl border border-white/12 bg-black/30 p-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-cyan/40" />
              <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={5} placeholder="What happened today?" data-testid="entry-body" className="w-full resize-none rounded-xl border border-white/12 bg-black/30 p-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-cyan/40" />
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" data-testid="entry-location" className="w-full rounded-xl border border-white/12 bg-black/30 p-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-cyan/40" />
              <div className="flex flex-wrap gap-2">{MOODS.map((m) => (<button key={m} onClick={() => setForm({ ...form, mood: m })} data-testid={`mood-${m.toLowerCase()}`} className={`rounded-full px-3 py-1.5 text-xs font-600 transition ${form.mood === m ? "bg-violet/20 text-violet border border-violet/40" : "border border-white/10 bg-white/5 text-white/55"}`}>{m}</button>))}</div>
              <button onClick={add} data-testid="save-entry" className="w-full rounded-full bg-gradient-to-r from-cyan to-violet py-3 text-sm font-600 text-white">Save entry</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
