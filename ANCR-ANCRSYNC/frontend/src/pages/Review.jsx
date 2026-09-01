import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Play, Pause, Plus } from "lucide-react";
import api from "../lib/api";
// Deterministic waveform bars
const wave = (seed, n = 140) => {
  const arr = [];
  let s = 0;
  for (let i = 0; i < seed.length; i++) s += seed.charCodeAt(i);
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280;
    arr.push(0.2 + (s / 233280) * 0.8);
  }
  return arr;
};

const fmt = (t) => {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

export default function Review() {
  const { id } = useParams();
  const nav = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [target, setTarget] = useState("Aurora_hook_v3.wav");
  const [assets, setAssets] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const total = 240;
  const [body, setBody] = useState("");
  const barsRef = useRef(null);
  const bars = wave(target);

  useEffect(() => {
    api.get(`/reviews/${id}`).then((r) => setReviews(r.data));
    api.get(`/assets/${id}`).then((r) => setAssets(r.data));
  }, [id]);

  useEffect(() => {
    if (!playing) return;
    const iv = setInterval(() => setT((v) => (v >= total ? 0 : v + 0.5)), 500);
    return () => clearInterval(iv);
  }, [playing]);

  const submit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    const r = await api.post("/reviews", {
      workspace_id: id,
      target,
      timestamp: t,
      body,
    });
    setReviews([...reviews, r.data].sort((a, b) => a.timestamp - b.timestamp));
    setBody("");
    toast.success(`Feedback added at ${fmt(t)}`);
  };

  const jump = (ts) => {
    setT(ts);
  };

  const filtered = reviews.filter((r) => r.target === target);

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 glass-strong border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => nav(`/workspaces/${id}`)}
            className="text-zinc-500 hover:text-white"
            data-testid="back-workspace"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="text-[10px] tracking-overline text-zinc-500">
              Creative Review™
            </div>
            <div className="font-display text-2xl tracking-tight">
              Timestamped feedback
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8 space-y-4">
        {/* Target selector */}
        <div className="flex flex-wrap gap-2">
          {assets.map((a) => (
            <button
              key={a.id}
              onClick={() => {
                setTarget(a.name);
                setT(0);
              }}
              data-testid={`review-target-${a.id}`}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                target === a.name
                  ? "bg-white text-black border-white"
                  : "border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
              }`}
            >
              {a.name}
            </button>
          ))}
        </div>

        {/* Player */}
        <div className="glass rounded-2xl p-6">
          <div className="text-[10px] tracking-overline text-zinc-500 mb-2">
            Now reviewing
          </div>
          <div className="font-display text-lg mb-4">{target}</div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPlaying(!playing)}
              data-testid="review-play-btn"
              className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-zinc-200"
            >
              {playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>
            <div className="font-mono text-sm text-zinc-300">
              {fmt(t)} <span className="text-zinc-500">/ {fmt(total)}</span>
            </div>
          </div>

          {/* Waveform */}
          <div
            ref={barsRef}
            className="relative mt-6 h-24 flex items-center gap-[2px] cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              setT(pct * total);
            }}
            data-testid="review-waveform"
          >
            {bars.map((v, i) => {
              const pct = i / bars.length;
              const past = pct * total <= t;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{
                    height: `${v * 100}%`,
                    background: past ? "#007AFF" : "rgba(255,255,255,0.15)",
                  }}
                />
              );
            })}
            {/* Markers */}
            {filtered.map((r) => (
              <button
                key={r.id}
                onClick={(e) => {
                  e.stopPropagation();
                  jump(r.timestamp);
                }}
                data-testid={`review-marker-${r.id}`}
                className="absolute -top-2 w-3 h-3 rounded-full ring-2 ring-black"
                style={{
                  left: `calc(${(r.timestamp / total) * 100}% - 6px)`,
                  background: r.avatar_color,
                }}
                title={`${fmt(r.timestamp)} — ${r.body}`}
              />
            ))}
            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-white/70"
              style={{ left: `${(t / total) * 100}%` }}
            />
          </div>

          {/* Add feedback */}
          <form onSubmit={submit} className="mt-6 flex gap-2">
            <div className="glass rounded-xl px-3 py-2 text-xs font-mono text-zinc-300">
              {fmt(t)}
            </div>
            <input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={`Feedback at ${fmt(t)}…`}
              data-testid="review-input"
              className="flex-1 bg-zinc-950/60 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#007AFF] outline-none"
            />
            <button
              type="submit"
              data-testid="review-submit-btn"
              className="bg-[#007AFF] hover:bg-blue-500 text-white rounded-xl px-4 accent-glow flex items-center gap-1"
            >
              <Plus size={14} /> Add
            </button>
          </form>
        </div>

        {/* Feedback list */}
        <div className="glass rounded-2xl p-6">
          <div className="font-display text-lg mb-4">All feedback</div>
          {filtered.length === 0 ? (
            <div className="text-xs text-zinc-500 text-center py-8">
              No timestamped feedback yet.
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((r) => (
                <button
                  key={r.id}
                  onClick={() => jump(r.timestamp)}
                  data-testid={`review-item-${r.id}`}
                  className="w-full text-left flex items-start gap-3 border border-white/[0.06] rounded-xl p-3 hover:bg-white/[0.02] transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0"
                    style={{ background: r.avatar_color, color: "#000" }}
                  >
                    {r.author_name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium text-zinc-100">
                        {r.author_name}
                      </span>
                      <span className="font-mono text-xs text-[#007AFF]">
                        {fmt(r.timestamp)}
                      </span>
                    </div>
                    <div className="text-sm text-zinc-200 mt-0.5">{r.body}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
