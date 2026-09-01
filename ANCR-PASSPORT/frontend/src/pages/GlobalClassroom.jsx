import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  School, Users, Megaphone, Plus, CheckCircle2, Circle, AlertTriangle,
  GraduationCap, Calendar, X,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { PageHeader, GlassCard, Loader, Pill, Ring, fadeUp, staggerContainer } from "@/components/common";

const ROLE_VIEWS = ["Student", "Faculty", "Administrator", "Group Manager"];

export default function GlobalClassroom() {
  const { user, setRole } = useApp();
  const [data, setData] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", destination_id: "ghana", due: "" });

  const load = () => api.get("/classroom").then((r) => setData(r.data));
  useEffect(() => { load(); }, []);
  if (!data || !user) return <Loader label="Loading Global Classroom" />;

  const isStudent = user.role === "Student";

  const createAssignment = async () => {
    if (!form.title || !form.due) { toast.error("Add a title and due date"); return; }
    await api.post("/classroom/assignments", form);
    setShowCreate(false); setForm({ title: "", destination_id: "ghana", due: "" });
    load(); toast.success("Assignment created");
  };

  return (
    <div data-testid="global-classroom-page">
      <PageHeader eyebrow="Global Classroom" title="Institutional readiness, together"
        subtitle="Faculty, administrators and group managers coordinate global-readiness — connected conceptually to ANCRA."
        testid="classroom-header"
        action={
          <div className="flex flex-wrap gap-2" data-testid="role-view-switcher">
            {ROLE_VIEWS.map((r) => (
              <button key={r} onClick={() => { setRole(r); toast.success(`Viewing as ${r}`); }} data-testid={`classroom-role-${r.toLowerCase().replace(/\s+/g, "-")}`}
                className={`rounded-full px-3.5 py-1.5 text-xs font-600 transition ${user.role === r ? "bg-cyan/20 text-cyan border border-cyan/40" : "border border-white/10 bg-white/5 text-white/55 hover:text-white"}`}>{r}</button>
            ))}
          </div>
        }
      />

      <div className="mb-6 flex items-center gap-2 rounded-xl border border-violet/25 bg-violet/8 px-4 py-3 text-sm text-white/75">
        <School className="h-4 w-4 text-violet" /> Active role: <span className="font-600 text-violet">{user.role}</span> {isStudent && "— faculty tools are read-only in student view."}
      </div>

      {/* Sample assignment */}
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {data.assignments.map((a) => {
          const pct = Math.round((a.components.filter((c) => c.done).length / a.components.length) * 100);
          return (
            <motion.div key={a.id} variants={fadeUp}>
              <GlassCard className="overflow-hidden" data-testid={`assignment-${a.id}`}>
                <div className="relative h-36">
                  <img src={a.cover} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1021] to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                    <div><Pill tone="amber" className="mb-2">Assignment</Pill><h3 className="font-display text-xl font-600 text-white">{a.title}</h3></div>
                    <Ring value={pct} size={52} stroke={5} />
                  </div>
                </div>
                <div className="p-5">
                  <div className="mb-3 flex items-center gap-3 text-xs text-white/50"><Calendar className="h-3.5 w-3.5" /> Due {a.due} · {a.students_complete}/{a.students_total} complete</div>
                  <div className="space-y-1.5">
                    {a.components.map((c) => (
                      <div key={c.id} className="flex items-center gap-2 text-sm">
                        {c.done ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Circle className="h-4 w-4 text-white/25" />}
                        <span className={c.done ? "text-white/50 line-through" : "text-white/80"}>{c.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}

        {/* Faculty tools */}
        <motion.div variants={fadeUp}>
          <GlassCard className="h-full p-6" data-testid="faculty-tools">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl font-600 text-white">Faculty tools</h3>
              <button onClick={() => setShowCreate(true)} disabled={isStudent} data-testid="create-assignment-btn" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan to-violet px-4 py-2 text-xs font-600 text-white disabled:opacity-40"><Plus className="h-4 w-4" /> New assignment</button>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {["Assign destination study", "Track completion", "Manage travel roster", "Pre-departure announcements", "View missing requirements", "Schedule orientation", "Virtual international exchange", "Review readiness"].map((f) => (
                <button key={f} onClick={() => isStudent ? toast.error("Faculty-only tool") : toast.success(`${f} (demo)`)} data-testid={`faculty-tool-${f.toLowerCase().replace(/\s+/g, "-")}`} className="rounded-xl border border-white/8 bg-white/4 p-3 text-left text-xs font-500 text-white/75 transition hover:border-cyan/40">{f}</button>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>

      {/* Roster */}
      <GlassCard className="mb-6 p-6" data-testid="travel-roster">
        <div className="mb-4 flex items-center gap-2"><Users className="h-5 w-5 text-cyan" /><h3 className="font-display text-xl font-600 text-white">Group travel roster</h3></div>
        <div className="space-y-2.5">
          {data.roster.map((s) => (
            <div key={s.name} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/8 bg-white/4 p-4">
              <div className="min-w-[140px] font-600 text-white">{s.name}</div>
              <div className="flex-1 min-w-[160px]">
                <div className="h-2 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full" style={{ width: `${s.readiness}%`, background: "linear-gradient(90deg,#22d3ee,#8b5cf6)" }} /></div>
              </div>
              <span className="font-mono-p text-sm text-white/70">{s.readiness}%</span>
              <Pill tone={s.status === "Ready" ? "green" : s.status === "At risk" ? "magenta" : "cyan"}>{s.status}</Pill>
              {s.missing.length > 0 && <span className="flex items-center gap-1 text-xs text-amber/80"><AlertTriangle className="h-3.5 w-3.5" /> {s.missing.join(", ")}</span>}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Announcements */}
      <GlassCard className="p-6" data-testid="announcements">
        <div className="mb-4 flex items-center gap-2"><Megaphone className="h-5 w-5 text-amber" /><h3 className="font-display text-xl font-600 text-white">Pre-departure announcements</h3></div>
        {data.announcements.map((a) => (
          <div key={a.id} className="rounded-xl border border-white/8 bg-white/4 p-4"><div className="flex items-center justify-between"><div className="font-600 text-white">{a.title}</div><span className="font-mono-p text-xs text-white/45">{a.date}</span></div><p className="mt-1 text-sm text-white/60">{a.body}</p></div>
        ))}
      </GlassCard>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0B1021] p-6" data-testid="create-assignment-modal">
            <div className="mb-4 flex items-center justify-between"><h3 className="font-display text-xl font-600 text-white">Create global-readiness assignment</h3><button onClick={() => setShowCreate(false)} className="text-white/50"><X className="h-5 w-5" /></button></div>
            <div className="space-y-3">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Assignment title" data-testid="assignment-title" className="w-full rounded-xl border border-white/12 bg-black/30 p-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-cyan/40" />
              <select value={form.destination_id} onChange={(e) => setForm({ ...form, destination_id: e.target.value })} data-testid="assignment-destination" className="w-full rounded-xl border border-white/12 bg-black/30 p-3 text-sm text-white outline-none">
                {["ghana", "japan", "france", "brazil", "south-korea", "united-kingdom"].map((d) => <option key={d} value={d} className="bg-[#0B1021]">{d}</option>)}
              </select>
              <input type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} data-testid="assignment-due" className="w-full rounded-xl border border-white/12 bg-black/30 p-3 text-sm text-white outline-none" />
              <button onClick={createAssignment} data-testid="submit-assignment" className="w-full rounded-full bg-gradient-to-r from-cyan to-violet py-3 text-sm font-600 text-white"><GraduationCap className="mr-1 inline h-4 w-4" /> Create assignment</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
