import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const OPTIONS = [
  { key: "class", label: "Class" },
  { key: "writing", label: "Writing session" },
  { key: "studio", label: "Studio recording" },
  { key: "rehearsal", label: "Rehearsal" },
  { key: "live_performance", label: "Live performance" },
  { key: "audition", label: "Audition" },
  { key: "shoot", label: "Shoot / production" },
  { key: "editing", label: "Editing" },
  { key: "travel", label: "Travel" },
  { key: "rest", label: "Rest day" },
  { key: "other", label: "Other" },
];

function today() { return new Date().toISOString().slice(0, 10); }

export function CreativeDemand({ checkin, onSaved }) {
  const [selected, setSelected] = useState(new Set(checkin?.creative_demand || []));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSelected(new Set(checkin?.creative_demand || []));
  }, [checkin]);

  const toggle = (key) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const save = async () => {
    if (!checkin) {
      toast.message("Save your arrival first", { description: "That will unlock personalized demand tracking." });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        date: today(),
        arriving: checkin.arriving,
        snapshot: checkin.snapshot,
        creative_demand: Array.from(selected),
      };
      const { data } = await api.post("/checkins", payload);
      onSaved?.(data);
      toast.success("Today's creative demand updated");
    } catch {
      toast.error("Couldn't update creative demand");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section data-testid="creative-demand" className="glass rounded-3xl p-6 sm:p-8 fade-up glass-hover">
      <div className="mb-4">
        <h2 className="font-display text-2xl sm:text-3xl tracking-tight">Today's creative demand</h2>
        <p className="text-white/55 mt-1 text-sm">Tell us what your day involves so we can shape today's preparation and recovery.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((o) => {
          const active = selected.has(o.key);
          return (
            <button
              key={o.key}
              onClick={() => toggle(o.key)}
              data-testid={`demand-${o.key}`}
              type="button"
              className={`px-4 py-2 rounded-full text-sm font-sans border transition-all ${
                active
                  ? "bg-white/10 border-white/45 text-white"
                  : "border-white/15 text-white/65 hover:text-white hover:border-white/30"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-end">
        <button
          onClick={save}
          disabled={saving}
          data-testid="demand-save-btn"
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-sans bg-white/10 border border-white/15 hover:bg-white/15 disabled:opacity-60 transition-colors"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Update demand
        </button>
      </div>
    </section>
  );
}
