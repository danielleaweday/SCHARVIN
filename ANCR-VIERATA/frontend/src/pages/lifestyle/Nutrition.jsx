import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, Plus, Copy, Bookmark, Droplets, Trash2, Search, Loader2, Info, ChevronDown, ScanLine } from "lucide-react";
import { ProgressBar } from "@/components/lifestyle/MacroRings";
import BarcodeScanner from "@/components/lifestyle/BarcodeScanner";

const MEAL_TYPES = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "dinner", label: "Dinner" },
  { key: "snack", label: "Snack" },
  { key: "pre_performance", label: "Pre-performance" },
  { key: "post_performance", label: "Post-performance" },
  { key: "studio", label: "Studio / rehearsal" },
  { key: "beverage", label: "Beverage" },
];

function today() { return new Date().toISOString().slice(0, 10); }

function totalsOf(items) {
  const t = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  for (const it of items) for (const k of Object.keys(t)) t[k] += Number(it[k] || 0);
  Object.keys(t).forEach((k) => (t[k] = Math.round(t[k] * 10) / 10));
  return t;
}

function scaleFood(f, grams) {
  const factor = grams / 100;
  return {
    food_id: f.id, name: f.name, grams,
    kcal: Math.round(f.kcal * factor * 10) / 10,
    protein: Math.round(f.protein * factor * 10) / 10,
    carbs: Math.round(f.carbs * factor * 10) / 10,
    fat: Math.round(f.fat * factor * 10) / 10,
    fiber: Math.round(f.fiber * factor * 10) / 10,
  };
}

function MealLogger({ open, onClose, onLogged, savedMeals, prefill }) {
  const [mealType, setMealType] = useState("breakfast");
  const [query, setQuery] = useState("");
  const [library, setLibrary] = useState([]);
  const [items, setItems] = useState([]);
  const [note, setNote] = useState("");
  const [felt, setFelt] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveAs, setSaveAs] = useState("");

  useEffect(() => {
    if (!open) return;
    if (prefill) {
      setMealType(prefill.meal_type || "snack");
      setItems(prefill.items || []);
    } else {
      setMealType("breakfast"); setItems([]); setNote(""); setFelt(null); setSaveAs("");
    }
    api.get(`/lifestyle/foods?q=${encodeURIComponent(query)}`).then(({ data }) => setLibrary(data.library || []));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      api.get(`/lifestyle/foods?q=${encodeURIComponent(query)}`).then(({ data }) => setLibrary(data.library || []));
    }, 200);
    return () => clearTimeout(t);
  }, [query, open]);

  if (!open) return null;

  const totals = totalsOf(items);

  const addFood = (f, grams = f.ref || 100) => {
    setItems((prev) => [...prev, scaleFood(f, grams)]);
  };

  const updateGrams = (idx, grams) => {
    setItems((prev) => prev.map((it, i) => {
      if (i !== idx) return it;
      const ratio = grams / (it.grams || 100);
      return {
        ...it, grams,
        kcal: Math.round(it.kcal * ratio * 10) / 10,
        protein: Math.round(it.protein * ratio * 10) / 10,
        carbs: Math.round(it.carbs * ratio * 10) / 10,
        fat: Math.round(it.fat * ratio * 10) / 10,
        fiber: Math.round(it.fiber * ratio * 10) / 10,
      };
    }));
  };

  const save = async () => {
    if (!items.length) { toast.message("Add at least one food"); return; }
    setSaving(true);
    try {
      const payload = { date: today(), meal_type: mealType, items, note: note || null, felt_after: felt };
      const { data } = await api.post("/lifestyle/meals", payload);
      if (saveAs.trim()) {
        await api.post("/lifestyle/saved-meals", { name: saveAs.trim(), meal_type: mealType, items });
      }
      onLogged?.(data);
      toast.success("Meal logged");
      onClose();
    } catch { toast.error("Couldn't save meal"); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" data-testid="meal-logger">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto glass rounded-3xl p-6 sm:p-8 border border-white/10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-display text-2xl tracking-tight">Log a meal</h3>
            <p className="text-white/50 text-sm">Add foods and adjust the grams as needed.</p>
          </div>
          <button onClick={onClose} data-testid="meal-logger-close" className="text-white/60 hover:text-white">Close</button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {MEAL_TYPES.map((m) => (
            <button key={m.key} onClick={() => setMealType(m.key)}
              data-testid={`ml-type-${m.key}`}
              className={`px-3 py-1.5 rounded-full text-xs border transition-all ${mealType === m.key ? "bg-white/10 border-white/40 text-white" : "border-white/10 text-white/55 hover:text-white/85"}`}>{m.label}</button>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-white/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search foods…"
              data-testid="ml-food-search"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/30"
            />
          </div>
          <div className="max-h-40 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {library.map((f) => (
              <button key={f.id} onClick={() => addFood(f, f.ref)}
                data-testid={`ml-food-${f.id}`}
                className="text-left rounded-xl px-3 py-2 hover:bg-white/5 border border-white/[0.05] flex items-center justify-between text-sm">
                <span className="truncate">{f.name}</span>
                <span className="text-white/40 text-xs">{f.kcal} kcal / 100g</span>
              </button>
            ))}
          </div>
          {savedMeals?.length > 0 && (
            <details className="mt-3">
              <summary className="text-xs text-white/50 cursor-pointer inline-flex items-center gap-1"><ChevronDown className="w-3 h-3" /> Saved meals</summary>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {savedMeals.map((s) => (
                  <button key={s.id} onClick={() => { setMealType(s.meal_type); setItems(s.items); }}
                    className="text-left rounded-xl px-3 py-2 hover:bg-white/5 border border-white/[0.05] text-sm">
                    <div className="text-white/90">{s.name}</div>
                    <div className="text-[11px] text-white/45">{Math.round(s.totals?.kcal || 0)} kcal · {s.items.length} items</div>
                  </button>
                ))}
              </div>
            </details>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 mb-4">
          <div className="text-xs uppercase tracking-[0.22em] text-white/45 mb-2">Selected foods</div>
          {items.length === 0 ? (
            <div className="text-white/40 text-sm py-4 text-center">Pick foods above to build this meal.</div>
          ) : (
            <ul className="space-y-2">
              {items.map((it, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{it.name}</div>
                    <div className="text-[11px] text-white/45">{Math.round(it.kcal)} kcal · P{Math.round(it.protein)} · C{Math.round(it.carbs)} · F{Math.round(it.fat)}</div>
                  </div>
                  <input type="number" min="1" value={it.grams}
                    onChange={(e) => updateGrams(i, Number(e.target.value) || 1)}
                    className="w-20 bg-white/[0.03] border border-white/10 rounded-xl px-2 py-1 text-sm text-right" />
                  <span className="text-xs text-white/40">g</span>
                  <button onClick={() => setItems((p) => p.filter((_, j) => j !== i))} className="text-white/45 hover:text-white/80">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-wrap gap-4 text-sm text-white/70">
            <span data-testid="ml-total-kcal">Total: <span className="font-mono text-white/95">{totals.kcal} kcal</span></span>
            <span>P {totals.protein}g</span><span>C {totals.carbs}g</span><span>F {totals.fat}g</span><span>Fiber {totals.fiber}g</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <textarea
            data-testid="ml-note" value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="Private note (optional)"
            className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 text-sm placeholder:text-white/30 outline-none min-h-[68px]"
          />
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/45 mb-2">How you felt afterward</div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} data-testid={`ml-felt-${n}`} onClick={() => setFelt(n)}
                  className={`flex-1 h-9 rounded-full text-xs border ${felt === n ? "bg-white/10 border-white/40" : "border-white/10 text-white/50 hover:text-white/85"}`}>{n}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Bookmark className="w-4 h-4 text-white/45" />
          <input
            placeholder="Save this as a favorite meal (optional name)"
            value={saveAs} onChange={(e) => setSaveAs(e.target.value)}
            data-testid="ml-save-as"
            className="flex-1 bg-transparent border-b border-white/10 focus:border-white/30 outline-none py-2 text-sm placeholder:text-white/30"
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-full px-4 py-2 text-sm text-white/70 hover:text-white">Cancel</button>
          <button onClick={save} disabled={saving} data-testid="ml-save"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm bg-white text-black hover:bg-white/90 disabled:opacity-60">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save meal
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Nutrition() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [saved, setSaved] = useState([]);
  const [loggerOpen, setLoggerOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [reflection, setReflection] = useState({ nourished: 3, energy_steadiness: 3, affected_focus: "", tomorrow_intention: "" });
  const [savingRef, setSavingRef] = useState(false);

  const load = () => {
    api.get("/lifestyle/nutrition/today").then(({ data }) => setData(data));
    api.get("/lifestyle/saved-meals").then(({ data }) => setSaved(data.items || []));
    api.get(`/lifestyle/nutrition/reflection?date=${today()}`).then(({ data }) => { if (data) setReflection({ nourished: data.nourished, energy_steadiness: data.energy_steadiness, affected_focus: data.affected_focus || "", tomorrow_intention: data.tomorrow_intention || "" }); });
  };
  useEffect(() => { load(); }, []);

  const logWater = async (ml) => {
    try { await api.post("/lifestyle/hydration", { date: today(), ml }); load(); toast.success(`Added ${ml} ml`); }
    catch { toast.error("Couldn't log water"); }
  };

  const removeMeal = async (id) => {
    if (!window.confirm("Remove this meal?")) return;
    try { await api.delete(`/lifestyle/meals/${id}`); load(); toast.success("Removed"); } catch { toast.error("Couldn't remove"); }
  };

  const copyYesterday = async () => {
    try { const { data } = await api.post("/lifestyle/meals/copy-yesterday"); load(); toast.success(`Copied ${data.copied} meal${data.copied === 1 ? "" : "s"} from yesterday`); }
    catch { toast.error("Couldn't copy"); }
  };

  const saveReflection = async () => {
    setSavingRef(true);
    try {
      await api.post("/lifestyle/nutrition/reflection", {
        date: today(), nourished: reflection.nourished, energy_steadiness: reflection.energy_steadiness,
        affected_focus: reflection.affected_focus || null, tomorrow_intention: reflection.tomorrow_intention || null,
      });
      toast.success("Reflection saved");
    } catch { toast.error("Couldn't save reflection"); } finally { setSavingRef(false); }
  };

  const t = data?.totals || { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  const tgt = data?.targets || {};
  const meals = data?.meals || [];

  return (
    <div className="fade-up" data-testid="nutrition-page">
      <button onClick={() => navigate("/lifestyle")} className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-4">
        <ArrowLeft className="w-4 h-4" /> Lifestyle
      </button>

      <section className="glass rounded-3xl p-6 sm:p-8 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-2">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl tracking-tight">Nutrition</h1>
            <p className="text-white/60 text-sm mt-1">Fuel that may support your energy, focus and recovery. Educational — not medical.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => navigate("/lifestyle/nutrition/targets")} data-testid="nutrition-targets-btn"
              className="rounded-full px-4 py-2 text-sm border border-white/15 hover:border-white/30">Targets</button>
            <button onClick={copyYesterday} data-testid="nutrition-copy-yday-btn"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm border border-white/15 hover:border-white/30"><Copy className="w-4 h-4" /> Copy yesterday</button>
            <button onClick={() => setScannerOpen(true)} data-testid="nutrition-scan-btn"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm border border-white/15 hover:border-white/30"><ScanLine className="w-4 h-4" /> Scan barcode</button>
            <button onClick={() => setLoggerOpen(true)} data-testid="nutrition-log-btn"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm bg-white text-black hover:bg-white/90"><Plus className="w-4 h-4" /> Log meal</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
          <ProgressBar testid="pb-kcal" label="Calories" value={t.kcal} target={tgt.calories || 2400} unit=" kcal" color="#EA580C" />
          <ProgressBar testid="pb-water" label="Hydration" value={data?.water_ml || 0} target={tgt.water_ml || 2500} unit=" ml" color="#14B8A6" />
          <ProgressBar testid="pb-protein" label="Protein" value={t.protein} target={tgt.protein_g || 130} unit=" g" color="#9333EA" />
          <ProgressBar testid="pb-carbs" label="Carbs" value={t.carbs} target={tgt.carbs_g || 300} unit=" g" color="#D97706" />
          <ProgressBar testid="pb-fat" label="Fat" value={t.fat} target={tgt.fat_g || 75} unit=" g" color="#E11D48" />
          <ProgressBar testid="pb-fiber" label="Fiber" value={t.fiber} target={tgt.fiber_g || 30} unit=" g" color="#14B8A6" />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {[250, 350, 500].map((ml) => (
            <button key={ml} onClick={() => logWater(ml)} data-testid={`water-${ml}`}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm border border-white/10 hover:border-white/25">
              <Droplets className="w-4 h-4 text-viearta-teal" /> +{ml} ml
            </button>
          ))}
        </div>

        <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-white/35 inline-flex items-center gap-1.5">
          <Info className="w-3 h-3" /> No shame. No red warnings. Adjust with a qualified professional if needed.
        </p>
      </section>

      <section className="glass rounded-3xl p-6 sm:p-8 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl tracking-tight">Today's meals</h2>
          <span className="text-xs text-white/45">{meals.length} entries</span>
        </div>
        {meals.length === 0 ? (
          <div className="text-white/50 text-sm text-center py-8 border border-dashed border-white/10 rounded-2xl">
            No meals logged yet today. Tap "Log meal" to begin.
          </div>
        ) : (
          <ul className="space-y-3">
            {meals.map((m) => (
              <li key={m.id} data-testid={`meal-${m.id}`} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-viearta-teal">{m.meal_type.replace(/_/g, " ")}</div>
                  <div className="text-sm text-white/90 mt-0.5">{m.items.map((i) => i.name).join(" · ")}</div>
                  <div className="text-xs text-white/50 mt-1">{Math.round(m.totals?.kcal || 0)} kcal · P{Math.round(m.totals?.protein || 0)}g · C{Math.round(m.totals?.carbs || 0)}g · F{Math.round(m.totals?.fat || 0)}g · Fiber {Math.round(m.totals?.fiber || 0)}g</div>
                  {m.note && <div className="text-xs text-white/55 mt-1 italic">"{m.note}"</div>}
                </div>
                <button onClick={() => removeMeal(m.id)} className="text-white/45 hover:text-white/85" title="Remove"><Trash2 className="w-4 h-4" /></button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="glass rounded-3xl p-6 sm:p-8">
        <h2 className="font-display text-2xl tracking-tight mb-3">Daily nutrition reflection</h2>
        <p className="text-white/55 text-sm mb-5">A short reflection to notice the pattern — not to grade the day.</p>

        {[
          ["Did you feel adequately nourished today?", "nourished"],
          ["How steady was your energy?", "energy_steadiness"],
        ].map(([label, key]) => (
          <div key={key} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 mb-3">
            <div className="text-sm">{label}</div>
            <div className="mt-2 flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} data-testid={`refl-${key}-${n}`} onClick={() => setReflection((r) => ({ ...r, [key]: n }))}
                  className={`flex-1 h-9 rounded-full text-xs border ${reflection[key] === n ? "bg-white/10 border-white/40" : "border-white/10 text-white/50 hover:text-white/85"}`}>{n}</button>
              ))}
            </div>
          </div>
        ))}

        <textarea data-testid="refl-focus" value={reflection.affected_focus} onChange={(e) => setReflection((r) => ({ ...r, affected_focus: e.target.value }))}
          placeholder="Did anything affect your focus or performance?" rows={2}
          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-3 text-sm placeholder:text-white/30 outline-none resize-none mb-3" />
        <textarea data-testid="refl-tomorrow" value={reflection.tomorrow_intention} onChange={(e) => setReflection((r) => ({ ...r, tomorrow_intention: e.target.value }))}
          placeholder="What would you like to prepare differently tomorrow?" rows={2}
          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-3 text-sm placeholder:text-white/30 outline-none resize-none" />

        <div className="mt-4 flex items-center justify-end">
          <button onClick={saveReflection} disabled={savingRef} data-testid="refl-save"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm bg-white/10 border border-white/15 hover:bg-white/15 disabled:opacity-60">
            {savingRef && <Loader2 className="w-4 h-4 animate-spin" />} Save reflection
          </button>
        </div>
      </section>

      <MealLogger open={loggerOpen} onClose={() => setLoggerOpen(false)} onLogged={load} savedMeals={saved} />
      <BarcodeScanner open={scannerOpen} onClose={() => setScannerOpen(false)} onLogged={load} />
    </div>
  );
}
