import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import { Waves, Clock, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { ActivityTimer } from "@/components/lifestyle/ActivityTimer";

const KIND_LABEL = { mindfulness: "Mindfulness", movement: "Movement", nutrition: "Nutrition" };
const KIND_COLOR = { mindfulness: "#9333EA", movement: "#14B8A6", nutrition: "#EA580C" };

export default function Recovery() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [recent, setRecent] = useState([]);
  const [active, setActive] = useState(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [note, setNote] = useState("");
  const [mindActs, setMindActs] = useState([]);
  const [moveActs, setMoveActs] = useState([]);

  const load = async () => {
    const [{ data: r }, { data: m }, { data: v }] = await Promise.all([
      api.get("/recovery/sessions"),
      api.get("/lifestyle/mindfulness/activities"),
      api.get("/lifestyle/movement/activities"),
    ]);
    setTemplates(r.templates); setRecent(r.recent);
    setMindActs(m.items); setMoveActs(v.items);
  };
  useEffect(() => { load(); }, []);

  const start = (t) => { setActive(t); setStepIdx(0); setNote(""); };

  const step = active?.steps?.[stepIdx];
  const content = (() => {
    if (!step) return null;
    if (step.kind === "mindfulness") return mindActs.find((x) => x.id === step.ref);
    if (step.kind === "movement") return moveActs.find((x) => x.id === step.ref);
    return null;
  })();

  const complete = async () => {
    try {
      await api.post("/recovery/sessions/complete", { session_id: active.id, note: note || null });
      toast.success("Recovery logged. Well done.");
      setActive(null); setStepIdx(0); setNote(""); load();
    } catch { toast.error("Couldn't log"); }
  };

  if (active) {
    const total = active.steps.length;
    return (
      <div className="fade-up" data-testid="recovery-runner">
        <button onClick={() => setActive(null)} className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-4"><ArrowLeft className="w-4 h-4" /> Back</button>
        <section className="glass rounded-3xl p-6 sm:p-8">
          <div className="text-[11px] uppercase tracking-[0.22em] text-viearta-teal">{active.title}</div>
          <div className="mt-2 flex items-center gap-3">
            <div className="text-white/50 text-xs">Step {stepIdx + 1} of {total}</div>
            <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full viearta-gradient-bg" style={{ width: `${((stepIdx + 1) / total) * 100}%` }} />
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: KIND_COLOR[step.kind] }}>{KIND_LABEL[step.kind]}</div>
            <h2 className="font-display text-2xl mt-1">{content?.title || step.ref}</h2>
            {step.note && <p className="text-white/60 text-sm mt-1">{step.note}</p>}
            {content?.duration_seconds && (
              <div className="mt-4"><ActivityTimer durationSeconds={content.duration_seconds} testidPrefix="rec-timer" /></div>
            )}
            {content?.steps && (
              <ol className="mt-4 text-sm text-white/80 space-y-1">
                {content.steps.map((s, i) => <li key={i}>{i + 1}. {s}</li>)}
              </ol>
            )}
            {step.kind === "nutrition" && (
              <button onClick={() => navigate("/lifestyle/nutrition")} className="mt-3 rounded-full px-4 py-2 text-sm border border-white/15 hover:border-white/30">Open Nutrition</button>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
            <button disabled={stepIdx === 0} onClick={() => setStepIdx((i) => Math.max(0, i - 1))} className="rounded-full px-4 py-2 text-sm border border-white/10 disabled:opacity-40">Previous</button>
            {stepIdx < total - 1 ? (
              <button onClick={() => setStepIdx((i) => i + 1)} data-testid="rec-next" className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm bg-white text-black hover:bg-white/90">Next step <ArrowRight className="w-4 h-4" /></button>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note" data-testid="rec-note"
                  className="bg-white/[0.03] border border-white/10 rounded-full px-4 py-2 text-sm placeholder:text-white/30 outline-none" />
                <button onClick={complete} data-testid="rec-complete" className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm bg-white text-black hover:bg-white/90"><CheckCircle2 className="w-4 h-4" /> Complete</button>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="fade-up" data-testid="recovery-page">
      <section className="glass rounded-3xl p-6 sm:p-10 mb-6 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-30" style={{ background: "#EA580C" }} />
        <div className="relative">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/45 mb-2">
            <Waves className="w-3.5 h-3.5" /> Recovery Center
          </div>
          <h1 className="font-display text-4xl sm:text-5xl tracking-tight leading-[1.05]">
            Where <span className="viearta-gradient">next month's work</span> is quietly built.
          </h1>
          <p className="text-white/65 mt-4 max-w-2xl">Short, guided recoveries for after shows, tours, long studio days and rehearsals.</p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="recovery-templates">
        {templates.map((t) => (
          <button key={t.id} onClick={() => start(t)} data-testid={`recovery-${t.id}`}
            className="text-left glass rounded-3xl p-6 glass-hover">
            <div className="text-[11px] uppercase tracking-[0.22em] text-viearta-teal">{t.for.replace(/_/g, " ")}</div>
            <h3 className="font-display text-2xl mt-1">{t.title}</h3>
            <p className="text-white/60 text-sm mt-1">{t.summary}</p>
            <div className="mt-3 text-xs text-white/50 inline-flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {t.total_minutes} min · {t.steps.length} steps</div>
          </button>
        ))}
      </div>

      {recent.length > 0 && (
        <section className="glass rounded-3xl p-6 sm:p-8 mt-6">
          <h2 className="font-display text-xl mb-3">Recent recoveries</h2>
          <ul className="space-y-2">
            {recent.map((r) => {
              const t = templates.find((tt) => tt.id === r.session_id);
              return <li key={r.id} className="flex items-center justify-between text-sm rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2">
                <span>{t?.title || r.session_id}</span>
                <span className="text-white/45 text-xs">{r.date}</span>
              </li>;
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
