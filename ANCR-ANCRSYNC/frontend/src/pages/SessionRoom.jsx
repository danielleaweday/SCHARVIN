import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Sparkles, Mic, Video, PlayCircle, Globe2 } from "lucide-react";
import api from "../lib/api";
import { CITIES, localTime } from "../components/GlobalPulse";

const geoFor = (seedStr, count = 4) => {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) h = (h * 31 + seedStr.charCodeAt(i)) >>> 0;
  const picked = [];
  const used = new Set();
  for (let i = 0; i < count; i++) {
    let idx = (h + i * 73) % CITIES.length;
    while (used.has(idx)) idx = (idx + 1) % CITIES.length;
    used.add(idx);
    picked.push(CITIES[idx]);
  }
  return picked;
};

export default function SessionRoom() {
  const { id } = useParams();
  const nav = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = () => api.get(`/sessions/${id}`).then((r) => setSession(r.data));
  useEffect(() => {
    load();
    api.post(`/sessions/${id}/join`).catch(() => {});
  }, [id]);

  const runSummary = async () => {
    setLoading(true);
    try {
      const r = await api.post(`/sessions/${id}/ai-summary`);
      toast.success("Summary generated");
      setSession({ ...session, recording_summary: r.data.summary, status: "completed" });
    } catch {
      toast.error("Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  if (!session)
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500 text-xs font-mono tracking-overline">
        Joining session…
      </div>
    );

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 glass-strong border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => nav("/sessions")}
              className="text-zinc-500 hover:text-white"
              data-testid="back-sessions"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="text-[10px] tracking-overline text-zinc-500">
                {new Date(session.start_time).toLocaleString()} ·{" "}
                {session.duration_minutes} min
              </div>
              <div className="font-display text-2xl tracking-tight">
                {session.title}
              </div>
            </div>
          </div>
          <button
            onClick={runSummary}
            disabled={loading}
            data-testid="session-ai-summary-btn"
            className="text-sm bg-[#007AFF] hover:bg-blue-500 text-white px-4 py-2 rounded-full accent-glow flex items-center gap-2 disabled:opacity-60"
          >
            <Sparkles size={14} /> {loading ? "Summarizing…" : "AI Summary"}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div
            className="rounded-2xl border border-white/[0.08] p-10 relative overflow-hidden aspect-video flex items-center justify-center"
            data-testid="session-stage"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(0,122,255,0.25), #000 70%)",
            }}
          >
            <div className="absolute inset-0 grain opacity-40" />
            <div className="text-center relative">
              <PlayCircle size={48} className="text-white/80 mx-auto" />
              <div className="font-display text-xl mt-4">
                Ready when you are
              </div>
              <div className="text-xs text-zinc-400 mt-1 font-mono">
                Session · {session.status}
              </div>
            </div>
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <div className="glass rounded-full px-3 py-1 text-xs flex items-center gap-2">
                <Mic size={12} /> Auto-transcribe
              </div>
              <div className="glass rounded-full px-3 py-1 text-xs flex items-center gap-2">
                <Video size={12} /> Auto-record
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="text-[10px] tracking-overline text-[#007AFF] mb-2 flex items-center gap-2">
              <Sparkles size={12} /> AI Meeting Assistant
            </div>
            {session.recording_summary ? (
              <div
                data-testid="session-summary"
                className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed"
              >
                {session.recording_summary}
              </div>
            ) : (
              <div className="text-sm text-zinc-500">
                Run the AI summary to generate action items, decisions, and
                blockers after the session.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl p-6">
            <div className="font-display text-lg mb-3">Participants</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-7 h-7 rounded-full bg-[#007AFF] text-black flex items-center justify-center text-xs font-medium">
                  {session.host_name?.[0]}
                </div>
                <span className="text-zinc-100">{session.host_name}</span>
                <span className="text-[10px] tracking-overline text-zinc-500 ml-auto">
                  Host
                </span>
              </div>
              {(session.invitees || []).map((e) => (
                <div key={e} className="flex items-center gap-2 text-sm">
                  <div className="w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center text-xs">
                    {e[0]?.toUpperCase()}
                  </div>
                  <span className="text-zinc-300 truncate">{e}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="font-display text-lg mb-3">Whiteboard</div>
            <div className="aspect-square border border-white/[0.08] rounded-xl grid grid-cols-6 grid-rows-6">
              {[...Array(36)].map((_, i) => (
                <div key={i} className="border border-white/[0.03]" />
              ))}
            </div>
            <div className="text-[10px] tracking-overline text-zinc-500 mt-3">
              Freehand · Real-time cursors
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
