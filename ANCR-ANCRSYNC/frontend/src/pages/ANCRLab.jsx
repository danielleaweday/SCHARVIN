import { useEffect, useState, useMemo } from "react";
import {
  Play,
  Pause,
  Circle,
  Music2,
  Sparkles,
} from "lucide-react";
import api from "../lib/api";

// Deterministic waveform bars per track
const waveformFor = (seed, count = 80) => {
  const arr = [];
  let s = 0;
  for (let i = 0; i < seed.length; i++) s += seed.charCodeAt(i);
  for (let i = 0; i < count; i++) {
    s = (s * 9301 + 49297) % 233280;
    arr.push(0.15 + (s / 233280) * 0.85);
  }
  return arr;
};

const LIVE_CURSORS = [
  { name: "Aaron", color: "#F59E0B", pos: 34 },
  { name: "Nia", color: "#EC4899", pos: 58 },
  { name: "Kenji", color: "#10B981", pos: 12 },
];

export default function ANCRLab() {
  const [ws, setWs] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [wsId, setWsId] = useState("");
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(24);

  useEffect(() => {
    api.get("/workspaces").then((r) => {
      setWorkspaces(r.data);
      if (r.data.length) setWsId(r.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!wsId) return;
    api.get(`/ancrlab/${wsId}`).then((r) => setWs(r.data));
  }, [wsId]);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(
      () => setPlayhead((p) => (p >= 95 ? 5 : p + 0.8)),
      100
    );
    return () => clearInterval(t);
  }, [playing]);

  const toggleMute = async (t) => {
    const newVal = !t.muted;
    setWs({ ...ws, tracks: ws.tracks.map((x) => (x.id === t.id ? { ...x, muted: newVal } : x)) });
    api.post(`/ancrlab/${wsId}/track`, { track_id: t.id, muted: newVal });
  };

  const toggleSolo = async (t) => {
    const newVal = !t.solo;
    setWs({ ...ws, tracks: ws.tracks.map((x) => (x.id === t.id ? { ...x, solo: newVal } : x)) });
    api.post(`/ancrlab/${wsId}/track`, { track_id: t.id, solo: newVal });
  };

  const setVolume = (t, vol) => {
    setWs({ ...ws, tracks: ws.tracks.map((x) => (x.id === t.id ? { ...x, volume: vol } : x)) });
    api.post(`/ancrlab/${wsId}/track`, { track_id: t.id, volume: vol });
  };

  if (workspaces.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-3xl p-14 max-w-md text-center">
          <Music2 size={28} className="text-zinc-500 mx-auto mb-4" />
          <div className="font-display text-xl mb-3">Open a project first</div>
          <div className="text-sm text-zinc-500">
            Create a workspace to start collaborating inside ANCRLAB™.
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 glass-strong border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#007AFF] flex items-center justify-center accent-glow">
              <Music2 size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] tracking-overline text-zinc-500 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 dot-pulse" />
                ANCRLAB™ · Collaborative Session
              </div>
              <div className="font-display text-lg tracking-tight truncate">
                {workspaces.find((w) => w.id === wsId)?.name}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={wsId}
              onChange={(e) => setWsId(e.target.value)}
              data-testid="ancrlab-workspace-select"
              className="bg-zinc-950/60 border border-white/[0.08] rounded-full px-4 py-2 text-xs text-white focus:border-[#007AFF] outline-none"
            >
              {workspaces.map((w) => (
                <option key={w.id} value={w.id} className="bg-zinc-900">
                  {w.name}
                </option>
              ))}
            </select>
            <div className="flex -space-x-2">
              {LIVE_CURSORS.map((c) => (
                <div
                  key={c.name}
                  className="w-7 h-7 rounded-full border border-black text-[10px] font-medium flex items-center justify-center"
                  style={{ background: c.color, color: "#000" }}
                >
                  {c.name[0]}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {ws && (
        <div className="max-w-7xl mx-auto px-8 py-6 space-y-4">
          {/* Transport */}
          <div className="glass rounded-2xl p-4 flex items-center gap-6 flex-wrap">
            <button
              onClick={() => setPlaying(!playing)}
              data-testid="ancrlab-play-btn"
              className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-zinc-200"
            >
              {playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>
            <button
              data-testid="ancrlab-record-btn"
              className="w-10 h-10 rounded-full bg-red-500/90 text-white flex items-center justify-center hover:bg-red-500"
            >
              <Circle size={12} fill="currentColor" />
            </button>
            <div className="font-mono text-sm text-zinc-300">
              00:{String(Math.floor(playhead)).padStart(2, "0")}.{Math.floor((playhead % 1) * 10)}
            </div>
            <div className="flex items-center gap-4 ml-auto text-xs text-zinc-400">
              <div>
                <span className="text-zinc-500 mr-1">BPM</span>
                <span className="font-mono text-zinc-100">{ws.tempo}</span>
              </div>
              <div>
                <span className="text-zinc-500 mr-1">Key</span>
                <span className="font-mono text-zinc-100">{ws.key}</span>
              </div>
              <div>
                <span className="text-zinc-500 mr-1">Sig</span>
                <span className="font-mono text-zinc-100">{ws.signature}</span>
              </div>
            </div>
          </div>

          {/* Timeline ruler */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="relative border-b border-white/[0.06] h-6 flex">
              {[...Array(16)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 border-r border-white/[0.04] text-[9px] tracking-overline text-zinc-600 pl-1 pt-1 font-mono"
                >
                  {i + 1}
                </div>
              ))}
              {/* Playhead */}
              <div
                className="absolute top-0 bottom-0 w-[1px] bg-white/70 z-10"
                style={{ left: `${playhead}%` }}
              />
              {/* Live cursors */}
              {LIVE_CURSORS.map((c) => (
                <div
                  key={c.name}
                  className="absolute top-0 bottom-0 w-[1px]"
                  style={{ left: `${c.pos}%`, background: c.color }}
                >
                  <div
                    className="absolute -top-4 -translate-x-1/2 text-[9px] font-medium px-1 rounded"
                    style={{ background: c.color, color: "#000" }}
                  >
                    {c.name}
                  </div>
                </div>
              ))}
            </div>
            {/* Tracks */}
            {ws.tracks.map((t) => (
              <TrackRow
                key={t.id}
                track={t}
                toggleMute={() => toggleMute(t)}
                toggleSolo={() => toggleSolo(t)}
                setVolume={(v) => setVolume(t, v)}
                playhead={playhead}
              />
            ))}
          </div>

          <div className="glass rounded-2xl p-5 flex items-center gap-3 text-sm">
            <Sparkles size={16} className="text-[#007AFF]" />
            <div className="text-zinc-300">
              <span className="text-zinc-500">Live now:</span> Aaron adjusted{" "}
              <span className="text-zinc-100">Drums</span>, Nia added a{" "}
              <span className="text-zinc-100">harmony</span> at bar 34. Autosaved{" "}
              <span className="font-mono text-zinc-500">3s ago</span>.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const TrackRow = ({ track, toggleMute, toggleSolo, setVolume, playhead }) => {
  const wave = useMemo(() => waveformFor(track.id), [track.id]);
  return (
    <div
      className="flex items-stretch border-b border-white/[0.04] last:border-b-0"
      data-testid={`ancrlab-track-${track.id}`}
    >
      <div className="w-44 shrink-0 border-r border-white/[0.06] p-3 flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: track.color }}
          />
          <span className="text-sm font-medium text-zinc-100 truncate">
            {track.name}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={toggleMute}
            data-testid={`track-mute-${track.id}`}
            className={`w-7 h-7 rounded-md text-[10px] font-mono ${
              track.muted
                ? "bg-red-500/80 text-white"
                : "bg-white/10 text-zinc-300 hover:bg-white/20"
            }`}
          >
            M
          </button>
          <button
            onClick={toggleSolo}
            data-testid={`track-solo-${track.id}`}
            className={`w-7 h-7 rounded-md text-[10px] font-mono ${
              track.solo
                ? "bg-[#F59E0B] text-black"
                : "bg-white/10 text-zinc-300 hover:bg-white/20"
            }`}
          >
            S
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={track.volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="flex-1 accent-[#007AFF]"
          />
        </div>
      </div>
      <div className="flex-1 relative py-3 px-2">
        <div
          className="flex items-center h-16 gap-[2px]"
          style={{ opacity: track.muted ? 0.25 : 1 }}
        >
          {wave.map((v, i) => (
            <div
              key={i}
              className="flex-1"
              style={{
                height: `${v * 100}%`,
                background: `linear-gradient(180deg, ${track.color}dd, ${track.color}66)`,
                borderRadius: 2,
              }}
            />
          ))}
        </div>
        <div
          className="absolute top-0 bottom-0 w-[1px] bg-white/60"
          style={{ left: `${playhead}%` }}
        />
      </div>
    </div>
  );
};
