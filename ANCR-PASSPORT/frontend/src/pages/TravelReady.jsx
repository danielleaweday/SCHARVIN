import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Printer, Bell, Calendar, Filter, Paperclip } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { PageHeader, GlassCard, Loader, Pill, Ring, Disclaimer } from "@/components/common";

const PRIORITIES = ["all", "urgent", "required", "recommended", "completed"];
const toneFor = (p) => ({ urgent: "magenta", required: "cyan", recommended: "violet" }[p] || "muted");

export default function TravelReady() {
  const [data, setData] = useState(null);
  const [discipline, setDiscipline] = useState(null);
  const [filter, setFilter] = useState("all");

  const load = (disc) => api.get("/checklist", { params: disc ? { discipline: disc } : {} }).then((r) => { setData(r.data); setDiscipline(r.data.discipline); });
  useEffect(() => { load(); }, []);
  if (!data) return <Loader label="Loading your checklist" />;

  const patch = async (item, changes) => {
    await api.patch(`/checklist/${item.id}`, changes);
    load(discipline); // refresh items + percent
  };

  const changeDiscipline = (d) => { setData(null); load(d); toast.success(`Checklist adapted for ${d}`); };

  const visible = data.items.filter((i) => {
    if (filter === "all") return true;
    if (filter === "completed") return i.done;
    return i.priority === filter && !i.done;
  });

  const byCategory = {};
  visible.forEach((i) => { (byCategory[i.category] ||= []).push(i); });

  return (
    <div data-testid="travel-ready-page">
      <PageHeader eyebrow="Travel Ready" title="Your preparation, orchestrated"
        subtitle="A personalized readiness center that adapts to your creative discipline. Track documents, deadlines and cultural prep in one place."
        testid="travel-ready-header"
        action={
          <button onClick={() => { window.print(); toast("Generating printable summary"); }} data-testid="print-summary-btn" className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-5 py-2.5 text-sm font-600 text-white transition hover:border-cyan/50">
            <Printer className="h-4 w-4" /> Printable summary
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
        <GlassCard className="flex items-center gap-5 p-6 lg:col-span-1">
          <Ring value={data.percent} size={84} sub="ready" />
          <div>
            <div className="font-mono-p text-sm text-white/60">{data.done}/{data.total} complete</div>
            <div className="mt-1 text-xs text-white/40">for {discipline}</div>
          </div>
        </GlassCard>
        <GlassCard className="p-6 lg:col-span-3">
          <div className="mb-2 text-xs uppercase tracking-widest text-white/40">Creative discipline profile</div>
          <div className="flex flex-wrap gap-2" data-testid="discipline-picker">
            {data.disciplines.map((d) => (
              <button key={d} onClick={() => changeDiscipline(d)} data-testid={`discipline-${d.toLowerCase().replace(/\s+/g, "-")}`}
                className={`rounded-full px-3.5 py-1.5 text-xs font-600 transition ${discipline === d ? "bg-cyan/20 text-cyan border border-cyan/40" : "border border-white/10 bg-white/5 text-white/55 hover:text-white"}`}>{d}</button>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="mb-6 flex items-center gap-2 overflow-x-auto no-scrollbar" data-testid="priority-filter">
        <Filter className="h-4 w-4 text-white/40" />
        {PRIORITIES.map((p) => (
          <button key={p} onClick={() => setFilter(p)} data-testid={`filter-${p}`}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-600 capitalize transition ${filter === p ? "bg-white/15 text-white" : "border border-white/10 bg-white/5 text-white/50 hover:text-white"}`}>{p}</button>
        ))}
      </div>

      <div className="space-y-6">
        {Object.entries(byCategory).map(([cat, items]) => (
          <motion.div key={cat} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="mb-3 font-display text-lg font-600 text-white">{cat}</h3>
            <div className="space-y-2.5">
              {items.map((it) => (
                <GlassCard key={it.id} className="p-4" data-testid={`checklist-item-${it.id}`}>
                  <div className="flex items-start gap-3">
                    <button onClick={() => patch(it, { done: !it.done })} data-testid={`toggle-${it.id}`} className="mt-0.5 shrink-0">
                      {it.done ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <Circle className="h-5 w-5 text-white/30" />}
                    </button>
                    <div className="flex-1">
                      <div className={`text-sm font-500 ${it.done ? "text-white/40 line-through" : "text-white"}`}>{it.title}</div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <Pill tone={toneFor(it.priority)} className="capitalize">{it.priority}</Pill>
                        {it.discipline && <Pill tone="muted">{it.discipline}</Pill>}
                        {it.due_date && <span className="font-mono-p text-[11px] text-white/45">Due {it.due_date}</span>}
                        {it.reminder && <Pill tone="amber"><Bell className="h-3 w-3" /> Reminder</Pill>}
                        {it.document && <Pill tone="green"><Paperclip className="h-3 w-3" /> {it.document}</Pill>}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <label className="cursor-pointer rounded-full border border-white/10 bg-white/5 p-2 text-white/50 transition hover:text-cyan" title="Add due date">
                        <Calendar className="h-4 w-4" />
                        <input type="date" className="hidden" onChange={(e) => patch(it, { due_date: e.target.value })} data-testid={`due-${it.id}`} />
                      </label>
                      <button onClick={() => patch(it, { reminder: !it.reminder })} data-testid={`reminder-${it.id}`} className={`rounded-full border p-2 transition ${it.reminder ? "border-amber/40 text-amber" : "border-white/10 bg-white/5 text-white/50 hover:text-amber"}`}><Bell className="h-4 w-4" /></button>
                      <button onClick={() => patch(it, { document: "Uploaded.pdf" })} data-testid={`doc-${it.id}`} className="rounded-full border border-white/10 bg-white/5 p-2 text-white/50 transition hover:text-violet" title="Link document"><Paperclip className="h-4 w-4" /></button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        ))}
        {visible.length === 0 && <div className="py-16 text-center text-white/45">No items match this filter.</div>}
      </div>

      <Disclaimer className="mt-8" text={data.disclaimer} />
    </div>
  );
}
