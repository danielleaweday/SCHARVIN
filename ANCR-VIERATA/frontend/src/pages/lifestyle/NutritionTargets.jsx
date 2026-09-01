import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Info } from "lucide-react";

const OBJECTIVES = [
  { key: "everyday_energy", label: "Maintain everyday energy" },
  { key: "support_demanding_schedule", label: "Support a demanding creative schedule" },
  { key: "support_performance_preparation", label: "Support performance preparation" },
  { key: "support_recovery", label: "Support recovery" },
  { key: "consistent_habits", label: "Build consistent nourishment habits" },
  { key: "hydration_awareness", label: "Improve hydration awareness" },
  { key: "professional_plan", label: "Follow a professional's existing plan" },
];

export default function NutritionTargets() {
  const navigate = useNavigate();
  const [t, setT] = useState({ calories: 2400, protein_g: 130, carbs_g: 300, fat_g: 75, fiber_g: 30, water_ml: 2500, objective: "everyday_energy" });
  const [estInputs, setEstInputs] = useState({ age: 22, activity: "moderate", discipline: "", objective: "everyday_energy" });
  const [estimate, setEstimate] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/lifestyle/targets").then(({ data }) => setT(data));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/lifestyle/targets", t);
      toast.success("Targets updated");
      navigate("/lifestyle/nutrition");
    } catch { toast.error("Couldn't save targets"); } finally { setSaving(false); }
  };

  const runEstimate = async () => {
    try {
      const { data } = await api.post("/lifestyle/targets/estimate", estInputs);
      if (data.blocked) { setEstimate({ blocked: true, reason: data.reason }); return; }
      setEstimate(data);
    } catch { toast.error("Couldn't estimate right now"); }
  };

  const applyEstimate = () => {
    if (!estimate?.estimate) return;
    setT((prev) => ({ ...prev, ...estimate.estimate }));
    toast.success("Applied educational estimate — review and adjust");
  };

  return (
    <div className="fade-up" data-testid="targets-page">
      <button onClick={() => navigate("/lifestyle/nutrition")} className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-4">
        <ArrowLeft className="w-4 h-4" /> Nutrition
      </button>

      <section className="glass rounded-3xl p-6 sm:p-8 mb-6">
        <h1 className="font-display text-3xl tracking-tight">Personal targets</h1>
        <p className="text-white/55 text-sm mt-1 max-w-2xl">Enter targets you feel steady with, or use the educational estimator below. These are not medical prescriptions.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
          {[
            ["Calories", "calories", "kcal", 1200, 6000],
            ["Protein", "protein_g", "g", 20, 400],
            ["Carbohydrates", "carbs_g", "g", 50, 800],
            ["Fat", "fat_g", "g", 15, 300],
            ["Fiber", "fiber_g", "g", 10, 100],
            ["Water", "water_ml", "ml", 500, 6000],
          ].map(([label, key, unit, min, max]) => (
            <div key={key} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/45">{label}</div>
              <div className="mt-1 flex items-baseline gap-2">
                <input type="number" min={min} max={max} value={t[key]}
                  data-testid={`t-${key}`}
                  onChange={(e) => setT((p) => ({ ...p, [key]: Number(e.target.value) }))}
                  className="w-full bg-transparent text-2xl font-display outline-none" />
                <span className="text-white/40 text-sm">{unit}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 mt-3">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/45 mb-2">Objective</div>
          <div className="flex flex-wrap gap-2">
            {OBJECTIVES.map((o) => (
              <button key={o.key} onClick={() => setT((p) => ({ ...p, objective: o.key }))}
                data-testid={`obj-${o.key}`}
                className={`px-3 py-1.5 rounded-full text-xs border ${t.objective === o.key ? "bg-white/10 border-white/40" : "border-white/10 text-white/60 hover:text-white/85"}`}>{o.label}</button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={save} disabled={saving} data-testid="t-save"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm bg-white text-black hover:bg-white/90 disabled:opacity-60">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save targets
          </button>
        </div>
      </section>

      <section className="glass rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/45 mb-3">
          <Info className="w-3.5 h-3.5" /> Educational estimator
        </div>
        <p className="text-white/60 text-sm max-w-2xl mb-4">
          A general starting point based on your creative context. This is not medical advice.
          For students under 18, pregnancy, an eating-disorder history, or a chronic condition, please work with a qualified professional instead.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 block">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/45">Age</div>
            <input type="number" value={estInputs.age} onChange={(e) => setEstInputs((p) => ({ ...p, age: Number(e.target.value) }))}
              data-testid="est-age" className="w-full bg-transparent outline-none mt-1" />
          </label>
          <label className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 block">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/45">Activity level</div>
            <select value={estInputs.activity} data-testid="est-activity"
              onChange={(e) => setEstInputs((p) => ({ ...p, activity: e.target.value }))}
              className="w-full bg-transparent outline-none mt-1 text-white">
              <option value="low" className="bg-[#0a0a0a]">Low</option>
              <option value="moderate" className="bg-[#0a0a0a]">Moderate</option>
              <option value="high" className="bg-[#0a0a0a]">High</option>
            </select>
          </label>
          <label className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 block md:col-span-2">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/45">Creative discipline</div>
            <input type="text" value={estInputs.discipline} placeholder="e.g. Producer, Dancer, Vocalist"
              onChange={(e) => setEstInputs((p) => ({ ...p, discipline: e.target.value }))}
              data-testid="est-discipline" className="w-full bg-transparent outline-none mt-1" />
          </label>
          <label className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 block md:col-span-2">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/45">Objective</div>
            <select value={estInputs.objective} data-testid="est-objective"
              onChange={(e) => setEstInputs((p) => ({ ...p, objective: e.target.value }))}
              className="w-full bg-transparent outline-none mt-1 text-white">
              {OBJECTIVES.map((o) => <option key={o.key} value={o.key} className="bg-[#0a0a0a]">{o.label}</option>)}
            </select>
          </label>
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={runEstimate} data-testid="est-run"
            className="rounded-full px-5 py-2.5 text-sm border border-white/15 hover:border-white/30">Generate estimate</button>
        </div>

        {estimate && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-4" data-testid="est-result">
            {estimate.blocked ? (
              <p className="text-white/80">{estimate.reason}</p>
            ) : (
              <>
                <div className="text-[11px] uppercase tracking-[0.22em] text-viearta-teal mb-2">Educational estimate</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  <div>Calories: <span className="font-mono">{estimate.estimate.calories}</span></div>
                  <div>Protein: <span className="font-mono">{estimate.estimate.protein_g}g</span></div>
                  <div>Carbs: <span className="font-mono">{estimate.estimate.carbs_g}g</span></div>
                  <div>Fat: <span className="font-mono">{estimate.estimate.fat_g}g</span></div>
                  <div>Fiber: <span className="font-mono">{estimate.estimate.fiber_g}g</span></div>
                  <div>Water: <span className="font-mono">{estimate.estimate.water_ml} ml</span></div>
                </div>
                <p className="text-[11px] text-white/45 mt-3">{estimate.disclaimer}</p>
                <div className="mt-3 flex justify-end">
                  <button onClick={applyEstimate} data-testid="est-apply"
                    className="rounded-full px-4 py-2 text-sm bg-white/10 border border-white/15 hover:bg-white/15">Apply to my targets</button>
                </div>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
