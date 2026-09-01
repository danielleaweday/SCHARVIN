import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, CheckCircle2 } from "lucide-react";

function fmt(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function ActivityTimer({ durationSeconds, onComplete, testidPrefix = "timer" }) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setRemaining(durationSeconds);
    setDone(false);
    setRunning(false);
  }, [durationSeconds]);

  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(ref.current);
          setRunning(false);
          setDone(true);
          onComplete?.();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [running, onComplete]);

  const pct = 1 - remaining / durationSeconds;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 flex items-center gap-6 flex-wrap">
      <div className="relative w-28 h-28 shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="45" fill="none" stroke="#14B8A6" strokeWidth="6"
            strokeLinecap="round" strokeDasharray={2 * Math.PI * 45}
            strokeDashoffset={2 * Math.PI * 45 * (1 - pct)}
            style={{ transition: "stroke-dashoffset 300ms linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-display text-2xl" data-testid={`${testidPrefix}-display`}>
          {fmt(remaining)}
        </div>
      </div>

      <div className="flex-1 min-w-[200px] flex items-center gap-2 flex-wrap">
        {!done && !running && (
          <button data-testid={`${testidPrefix}-start`} onClick={() => setRunning(true)}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm bg-white text-black hover:bg-white/90">
            <Play className="w-4 h-4" /> Start
          </button>
        )}
        {running && (
          <button data-testid={`${testidPrefix}-pause`} onClick={() => setRunning(false)}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm bg-white/10 border border-white/15 hover:bg-white/15">
            <Pause className="w-4 h-4" /> Pause
          </button>
        )}
        {!done && !running && remaining < durationSeconds && (
          <button data-testid={`${testidPrefix}-resume`} onClick={() => setRunning(true)}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm bg-white text-black hover:bg-white/90">
            <Play className="w-4 h-4" /> Resume
          </button>
        )}
        <button data-testid={`${testidPrefix}-reset`}
          onClick={() => { setRunning(false); setRemaining(durationSeconds); setDone(false); }}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm text-white/60 hover:text-white">
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
        {done && (
          <span data-testid={`${testidPrefix}-done`} className="inline-flex items-center gap-2 text-sm text-viearta-teal">
            <CheckCircle2 className="w-4 h-4" /> Complete
          </span>
        )}
      </div>
    </div>
  );
}
