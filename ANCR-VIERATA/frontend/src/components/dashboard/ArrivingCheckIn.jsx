import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";

const AREAS = [
  { key: "body", label: "Body", hint: "How does your body feel today?" },
  { key: "mind", label: "Mind", hint: "How is your mental clarity?" },
  { key: "energy", label: "Energy", hint: "How is your baseline energy?" },
  { key: "creative_capacity", label: "Creative Capacity", hint: "How available is your craft?" },
  { key: "performance_readiness", label: "Performance Readiness", hint: "How prepared do you feel to perform?" },
];

const SCALE_LABELS = ["Very low", "Low", "Steady", "Good", "Excellent"];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function ArrivingCheckIn({ onSaved }) {
  const [values, setValues] = useState({ body: 3, mind: 3, energy: 3, creative_capacity: 3, performance_readiness: 3 });
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [existing, setExisting] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get("/checkins/today");
        if (!alive || !data) return;
        setExisting(data);
        if (data.arriving) {
          setValues({
            body: data.arriving.body,
            mind: data.arriving.mind,
            energy: data.arriving.energy,
            creative_capacity: data.arriving.creative_capacity,
            performance_readiness: data.arriving.performance_readiness,
          });
          setNote(data.arriving.note || "");
        }
      } catch {}
    })();
    return () => { alive = false; };
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      // Prefer merging on top of existing snapshot; else default snapshot from arriving values.
      const snapshot = existing?.snapshot || {
        energy_level: values.energy,
        sleep_hours: 7,
        hydration_glasses: 4,
        stress_level: 3,
        body_discomfort: 3,
        mood: 3,
        voice_condition: 3,
        hearing_condition: 3,
        creative_workload: 3,
      };
      const payload = {
        date: today(),
        arriving: { ...values, note: note || null },
        snapshot,
        creative_demand: existing?.creative_demand || [],
      };
      const { data } = await api.post("/checkins", payload);
      setExisting(data);
      setSavedAt(Date.now());
      toast.success("Check-in saved", { description: "Thank you for arriving with intention." });
      onSaved?.(data);
    } catch (e) {
      toast.error("We couldn't save that just now", { description: "Please try again in a moment." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section data-testid="arriving-checkin" className="glass rounded-3xl p-6 sm:p-8 glass-hover fade-up">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-3xl sm:text-4xl tracking-tight">How are you arriving today?</h2>
          <p className="text-white/55 mt-2 text-sm font-sans max-w-lg">
            A short, honest check-in helps VIEARTA tune today's recommendations to how you actually feel.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AREAS.map((a) => (
          <div key={a.key} data-testid={`arriving-area-${a.key}`} className="rounded-2xl p-4 border border-white/[0.07] bg-white/[0.02]">
            <div className="flex items-baseline justify-between">
              <div className="font-display text-xl">{a.label}</div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">{SCALE_LABELS[values[a.key] - 1]}</div>
            </div>
            <div className="text-xs text-white/45 mt-1">{a.hint}</div>
            <div className="mt-4 flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => {
                const active = values[a.key] === n;
                return (
                  <button
                    key={n}
                    type="button"
                    data-testid={`arriving-${a.key}-${n}`}
                    onClick={() => setValues((v) => ({ ...v, [a.key]: n }))}
                    aria-label={`${a.label} ${SCALE_LABELS[n - 1]}`}
                    className={`flex-1 h-10 rounded-full text-xs font-sans transition-all border ${
                      active
                        ? "bg-white/15 border-white/40 text-white"
                        : "border-white/10 text-white/50 hover:text-white/80 hover:border-white/25"
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <textarea
        data-testid="arriving-note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="A short note about how today feels (optional)"
        rows={2}
        className="mt-5 w-full bg-white/[0.03] border border-white/10 focus:border-white/25 rounded-2xl p-4 text-sm text-white/90 placeholder:text-white/30 outline-none resize-none font-sans"
      />

      <div className="mt-5 flex items-center justify-between flex-wrap gap-3">
        <div className="text-xs text-white/45">
          {existing ? "Today's arrival saved · you can update it any time" : "You haven't checked in yet today"}
        </div>
        <button
          onClick={save}
          disabled={saving}
          data-testid="arriving-save-btn"
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-sans bg-white text-black hover:bg-white/90 disabled:opacity-60 transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : savedAt ? <Check className="w-4 h-4" /> : null}
          Save arrival
        </button>
      </div>
    </section>
  );
}
