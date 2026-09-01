import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

const AREAS = [
  ["body", "Body"],
  ["mind", "Mind"],
  ["energy", "Energy"],
  ["creative_capacity", "Creative Capacity"],
  ["performance_readiness", "Performance Readiness"],
];

function today() { return new Date().toISOString().slice(0, 10); }

export default function DailyCheckIn() {
  const navigate = useNavigate();
  const [arriving, setArriving] = useState({ body: 3, mind: 3, energy: 3, creative_capacity: 3, performance_readiness: 3, note: "" });
  const [snapshot, setSnapshot] = useState({
    energy_level: 3, sleep_hours: 7, hydration_glasses: 4, stress_level: 3, body_discomfort: 3, mood: 3,
    voice_condition: 3, hearing_condition: 3, creative_workload: 3,
  });
  const [demand, setDemand] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/checkins/today").then(({ data }) => {
      if (data) {
        setArriving({ ...data.arriving, note: data.arriving.note || "" });
        setSnapshot(data.snapshot);
        setDemand(data.creative_demand || []);
      }
    }).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.post("/checkins", {
        date: today(),
        arriving: { ...arriving, note: arriving.note || null },
        snapshot,
        creative_demand: demand,
      });
      toast.success("Full check-in saved");
      navigate("/");
    } catch {
      toast.error("Couldn't save just now");
    } finally { setSaving(false); }
  };

  const Row = ({ label, value, onChange, min = 1, max = 5, step = 1, hint }) => (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="flex items-center justify-between">
        <div className="font-display text-xl">{label}</div>
        <div className="text-sm text-white/60 font-mono">{value}</div>
      </div>
      {hint && <div className="text-xs text-white/45 mb-2">{hint}</div>}
      <input
        type="range" min={min} max={max} step={step} value={value}
        data-testid={`checkin-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
        onChange={(e) => onChange(step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value, 10))}
        className="mt-2 w-full accent-white"
      />
    </div>
  );

  return (
    <div className="fade-up">
      <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to home
      </button>

      <section className="glass rounded-3xl p-6 sm:p-8">
        <h1 className="font-display text-4xl tracking-tight">Daily Check-In</h1>
        <p className="text-white/60 mt-1">A more detailed check-in for the day. Use whatever feels honest.</p>

        <h2 className="font-display text-2xl mt-8 mb-3">How you are arriving</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {AREAS.map(([k, label]) => (
            <Row key={k} label={label} value={arriving[k]} onChange={(v) => setArriving((a) => ({ ...a, [k]: v }))} />
          ))}
        </div>

        <textarea
          data-testid="checkin-note"
          value={arriving.note}
          onChange={(e) => setArriving((a) => ({ ...a, note: e.target.value }))}
          placeholder="A short note about today (optional)"
          rows={2}
          className="mt-4 w-full bg-white/[0.03] border border-white/10 focus:border-white/25 rounded-2xl p-4 text-sm text-white/90 placeholder:text-white/30 outline-none resize-none"
        />

        <h2 className="font-display text-2xl mt-8 mb-3">Wellness snapshot</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Row label="Energy level" value={snapshot.energy_level} onChange={(v) => setSnapshot((s) => ({ ...s, energy_level: v }))} />
          <Row label="Sleep hours" value={snapshot.sleep_hours} min={0} max={12} step={0.5} onChange={(v) => setSnapshot((s) => ({ ...s, sleep_hours: v }))} />
          <Row label="Hydration (glasses)" value={snapshot.hydration_glasses} min={0} max={12} onChange={(v) => setSnapshot((s) => ({ ...s, hydration_glasses: v }))} />
          <Row label="Stress level" value={snapshot.stress_level} onChange={(v) => setSnapshot((s) => ({ ...s, stress_level: v }))} />
          <Row label="Body discomfort" value={snapshot.body_discomfort} onChange={(v) => setSnapshot((s) => ({ ...s, body_discomfort: v }))} />
          <Row label="Mood" value={snapshot.mood} onChange={(v) => setSnapshot((s) => ({ ...s, mood: v }))} />
          <Row label="Voice condition" value={snapshot.voice_condition} onChange={(v) => setSnapshot((s) => ({ ...s, voice_condition: v }))} />
          <Row label="Hearing condition" value={snapshot.hearing_condition} onChange={(v) => setSnapshot((s) => ({ ...s, hearing_condition: v }))} />
          <Row label="Creative workload" value={snapshot.creative_workload} onChange={(v) => setSnapshot((s) => ({ ...s, creative_workload: v }))} />
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={save}
            disabled={saving}
            data-testid="checkin-save-btn"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm bg-white text-black hover:bg-white/90 disabled:opacity-60"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save today's check-in
          </button>
        </div>
      </section>
    </div>
  );
}
