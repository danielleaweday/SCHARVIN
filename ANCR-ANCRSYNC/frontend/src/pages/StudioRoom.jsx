import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  Send,
  Users,
  ScreenShare,
  ScreenShareOff,
  Presentation,
  Sparkles,
  UserPlus,
  Shield,
  Circle,
  Radio as RadioIcon,
  Wifi,
  WifiOff,
} from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useLiveKit } from "../hooks/useLiveKit";
import LiveKitTile from "../components/LiveKitTile";

const INITIAL_PARTICIPANTS = [
  { id: "p1", name: "Ayaan R.", color: "#007AFF", role: "Producer", speaking: false },
  { id: "p2", name: "Nia O.", color: "#F59E0B", role: "Songwriter", speaking: true },
  { id: "p3", name: "Kenji W.", color: "#10B981", role: "Animator", speaking: false },
  { id: "p4", name: "Emma L.", color: "#EC4899", role: "Designer", speaking: false },
];

const WAITING_ROOM_QUEUE = [
  { id: "w1", name: "Malik J.", color: "#8B5CF6", role: "Creative Director" },
  { id: "w2", name: "Chloé M.", color: "#22D3EE", role: "Producer" },
];

export default function StudioRoom() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [studio, setStudio] = useState(null);
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [screenShare, setScreenShare] = useState(false);
  const [recording, setRecording] = useState(false);
  const [presenter, setPresenter] = useState(null); // participant id
  const [participants, setParticipants] = useState(INITIAL_PARTICIPANTS);
  const [waiting, setWaiting] = useState(WAITING_ROOM_QUEUE);
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([
    { who: "Ayaan R.", body: "Loving the tempo — let's push chorus at 82 BPM." },
    { who: "Nia O.", body: "Trying a new hook. One sec." },
  ]);
  const [transcript, setTranscript] = useState([
    { who: "Nia O.", body: "…what if we start the bridge on the 4 chord?", time: "00:14" },
    { who: "Ayaan R.", body: "That'd give us room for the harmony you were humming.", time: "00:22" },
  ]);
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const chatEnd = useRef(null);
  const lk = useLiveKit(`studio-${id}`);

  useEffect(() => {
    // Check config once so we can offer "Go Live" button
    api.get("/livekit/config").catch(() => {});
  }, []);

  useEffect(() => {
    api.get("/studios").then((r) => {
      const s = r.data.find((x) => x.id === id);
      if (!s) return nav("/studios");
      setStudio(s);
      api.post(`/studios/${id}/join`).catch(() => {});
    });
  }, [id]);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // Rotate speaking indicator every 3s for demo
  useEffect(() => {
    const iv = setInterval(() => {
      setParticipants((ps) => {
        const idx = ps.findIndex((p) => p.speaking);
        const next = (idx + 1) % ps.length;
        return ps.map((p, i) => ({ ...p, speaking: i === next }));
      });
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  const send = (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    setChat([...chat, { who: "You", body: msg }]);
    setTranscript((t) => [...t, { who: "You", body: msg, time: "live" }]);
    setMsg("");
    setTimeout(() => {
      setChat((c) => [
        ...c,
        {
          who: participants[Math.floor(Math.random() * participants.length)].name,
          body: [
            "Nice — trying that now.",
            "Adding a layer.",
            "Let's run it once more.",
            "🔥 keep going.",
          ][Math.floor(Math.random() * 4)],
        },
      ]);
    }, 900);
  };

  const admit = (w) => {
    setWaiting(waiting.filter((x) => x.id !== w.id));
    setParticipants([...participants, { ...w, speaking: false }]);
    toast.success(`${w.name} admitted`);
  };

  const deny = (w) => {
    setWaiting(waiting.filter((x) => x.id !== w.id));
    toast.info(`${w.name} denied`);
  };

  const genSummary = async () => {
    setAiLoading(true);
    setAiSummary("");
    try {
      const prompt = `Studio: ${studio.name} (${studio.kind}). Live transcript so far: ${transcript
        .map((t) => `${t.who}: ${t.body}`)
        .join(" | ")}. Give a 4-bullet contribution + decision summary.`;
      const r = await api.post("/ai/chat", {
        prompt,
        context: "summary",
        session_id: `studio-${id}`,
      });
      setAiSummary(r.data.response);
    } catch {
      toast.error("AI failed");
    } finally {
      setAiLoading(false);
    }
  };

  if (!studio)
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500 text-xs font-mono tracking-overline">
        Entering studio…
      </div>
    );

  const featured = presenter
    ? participants.find((p) => p.id === presenter)
    : null;

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="sticky top-0 z-30 glass-strong border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => nav("/studios")}
              className="text-zinc-500 hover:text-white"
              data-testid="back-studios"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <div className="text-[10px] tracking-overline text-zinc-500 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF] dot-pulse" />
                Live · {studio.kind}
                {recording && (
                  <span className="ml-2 flex items-center gap-1 text-red-400">
                    <Circle size={8} fill="currentColor" /> REC
                  </span>
                )}
              </div>
              <div className="font-display text-xl tracking-tight truncate">
                {studio.name}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lk.status === "connected" ? (
              <span
                className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full"
                data-testid="lk-status-connected"
              >
                <Wifi size={11} /> LiveKit · Real WebRTC
              </span>
            ) : lk.status === "unavailable" ? (
              <span
                className="flex items-center gap-1.5 text-[11px] text-zinc-500 bg-white/[0.03] border border-white/[0.06] px-2.5 py-1 rounded-full"
                data-testid="lk-status-unavailable"
                title="Set LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET in backend/.env"
              >
                <WifiOff size={11} /> Mock (no LiveKit keys)
              </span>
            ) : (
              <button
                onClick={() => lk.connect()}
                disabled={lk.status === "connecting" || lk.status === "checking"}
                data-testid="lk-go-live-btn"
                className="text-[11px] bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1 rounded-full font-medium flex items-center gap-1.5 disabled:opacity-60"
              >
                <Wifi size={11} />
                {lk.status === "connecting" || lk.status === "checking"
                  ? "Connecting…"
                  : "Go Live"}
              </button>
            )}
            <button
              onClick={genSummary}
              disabled={aiLoading}
              data-testid="studio-ai-summary-btn"
              className="text-xs bg-[#007AFF]/10 border border-[#007AFF]/30 text-[#007AFF] hover:bg-[#007AFF]/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 disabled:opacity-60"
            >
              <Sparkles size={12} /> {aiLoading ? "…" : "AI Summary"}
            </button>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Users size={14} />{" "}
              {lk.status === "connected"
                ? lk.participants.length
                : participants.length + 1}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4 p-6">
        {/* Video area */}
        <div className="lg:col-span-3 space-y-3">
          {/* Presenter / screen share stage */}
          {(featured || screenShare) && (
            <div
              className="rounded-2xl border border-white/[0.08] overflow-hidden relative aspect-video"
              data-testid="presenter-stage"
              style={{
                background: featured
                  ? `radial-gradient(circle at 30% 40%, ${featured.color}55, #000)`
                  : "linear-gradient(135deg, #0a0a0a, #1a1a2e)",
              }}
            >
              {screenShare ? (
                <div className="absolute inset-0 flex flex-col p-6">
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mb-3">
                    <ScreenShare size={12} /> You are sharing a browser tab ·
                    Aurora_arrangement.pdf
                  </div>
                  <div className="flex-1 bg-white/[0.05] rounded-lg grid grid-cols-8 grid-rows-6">
                    {[...Array(48)].map((_, i) => (
                      <div key={i} className="border border-white/[0.02]" />
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="w-32 h-32 rounded-full flex items-center justify-center font-display text-5xl font-medium"
                      style={{ background: featured.color, color: "#000" }}
                    >
                      {featured.name[0]}
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 glass rounded-full px-3 py-1 text-xs flex items-center gap-2">
                    <Presentation size={12} className="text-[#F59E0B]" />
                    {featured.name} · Presenting
                  </div>
                </>
              )}
            </div>
          )}

          {/* Participant grid */}
          {lk.status === "connected" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3" data-testid="lk-grid">
              {lk.participants.map((p) => (
                <LiveKitTile key={p.identity} participant={p} />
              ))}
              {lk.participants.length === 0 && (
                <div className="col-span-full text-center text-xs text-zinc-500 py-8 border border-dashed border-white/[0.06] rounded-xl">
                  Waiting for participants to join {`studio-${id}`}…
                </div>
              )}
            </div>
          ) : (
            <div
              className={`grid gap-3 ${
                featured || screenShare
                  ? "grid-cols-2 md:grid-cols-5"
                  : "grid-cols-2 md:grid-cols-3"
              }`}
            >
            <Tile
              name="You"
              color="#007AFF"
              role="Host"
              camOn={cam && !screenShare}
              micOn={mic}
              speaking={false}
              small={!!(featured || screenShare)}
              testId="tile-you"
            />
            {participants.map((p) => (
              <Tile
                key={p.id}
                {...p}
                camOn
                micOn={!p.muted}
                speaking={p.speaking}
                small={!!(featured || screenShare)}
                onDoubleClick={() =>
                  setPresenter(presenter === p.id ? null : p.id)
                }
                testId={`tile-${p.id}`}
              />
            ))}
          </div>
          )}

          {/* AI Summary panel */}
          {aiSummary && (
            <div className="glass rounded-2xl p-5 border border-[#007AFF]/30 bg-[#007AFF]/[0.04]">
              <div className="text-[10px] tracking-overline text-[#007AFF] mb-2 flex items-center gap-2">
                <Sparkles size={12} /> AI Session Intelligence™
              </div>
              <div
                className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed"
                data-testid="studio-ai-summary"
              >
                {aiSummary}
              </div>
            </div>
          )}
        </div>

        {/* Right rail */}
        <div className="space-y-3">
          {/* Waiting room */}
          {waiting.length > 0 && (
            <div className="glass rounded-2xl p-4" data-testid="waiting-room">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={12} className="text-[#F59E0B]" />
                <div className="text-[10px] tracking-overline text-[#F59E0B]">
                  Waiting room · {waiting.length}
                </div>
              </div>
              <div className="space-y-2">
                {waiting.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center gap-2"
                    data-testid={`waiting-${w.id}`}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0"
                      style={{ background: w.color, color: "#000" }}
                    >
                      {w.name[0]}
                    </div>
                    <div className="text-xs text-zinc-100 truncate flex-1">
                      {w.name}
                    </div>
                    <button
                      onClick={() => admit(w)}
                      data-testid={`admit-${w.id}`}
                      className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full hover:bg-emerald-500/30"
                    >
                      Admit
                    </button>
                    <button
                      onClick={() => deny(w)}
                      className="text-[10px] text-zinc-500 hover:text-red-400"
                    >
                      Deny
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live transcript */}
          <div className="glass rounded-2xl overflow-hidden flex flex-col">
            <div className="p-3 border-b border-white/[0.06] flex items-center gap-2">
              <RadioIcon size={12} className="text-zinc-400" />
              <span className="text-xs font-medium">Live transcript</span>
              <span className="ml-auto text-[9px] tracking-overline text-emerald-400">
                AUTO
              </span>
            </div>
            <div className="p-3 space-y-2 max-h-[180px] overflow-y-auto text-xs">
              {transcript.map((t, i) => (
                <div key={i}>
                  <span className="font-mono text-[10px] text-zinc-500 mr-2">
                    {t.time}
                  </span>
                  <span className="text-zinc-400 mr-1">{t.who}:</span>
                  <span className="text-zinc-200">{t.body}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="glass rounded-2xl flex flex-col overflow-hidden">
            <div className="p-3 border-b border-white/[0.06] flex items-center gap-2">
              <MessageSquare size={12} className="text-zinc-400" />
              <span className="text-xs font-medium">Chat</span>
            </div>
            <div className="flex-1 min-h-[180px] overflow-y-auto p-3 space-y-2">
              {chat.map((c, i) => (
                <div key={i} className="text-xs">
                  <span className="text-[10px] tracking-overline text-zinc-500 mr-2">
                    {c.who}
                  </span>
                  <span className="text-zinc-100">{c.body}</span>
                </div>
              ))}
              <div ref={chatEnd} />
            </div>
            <form
              onSubmit={send}
              className="p-2 border-t border-white/[0.06] flex gap-1"
            >
              <input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Message…"
                data-testid="studio-chat-input"
                className="flex-1 bg-zinc-950/60 border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#007AFF] outline-none"
              />
              <button
                type="submit"
                data-testid="studio-chat-send"
                className="bg-white text-black rounded-lg px-2"
              >
                <Send size={12} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Floating host toolbar */}
      <div className="sticky bottom-6 flex justify-center pointer-events-none z-40 pb-2">
        <div className="glass-strong rounded-full px-3 py-2 flex items-center gap-1.5 pointer-events-auto">
          <ToolbarBtn
            active={mic}
            onClick={() => setMic(!mic)}
            testId="toolbar-mic"
            iconOn={<Mic size={16} />}
            iconOff={<MicOff size={16} />}
          />
          <ToolbarBtn
            active={cam}
            onClick={() => setCam(!cam)}
            testId="toolbar-cam"
            iconOn={<Video size={16} />}
            iconOff={<VideoOff size={16} />}
          />
          <ToolbarBtn
            active={!screenShare}
            onClick={() => setScreenShare(!screenShare)}
            testId="toolbar-screen"
            iconOn={<ScreenShare size={16} />}
            iconOff={<ScreenShareOff size={16} />}
            trueLabel="off"
          />
          <button
            onClick={() => setPresenter(presenter ? null : participants[0]?.id)}
            data-testid="toolbar-presenter"
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
              presenter
                ? "bg-[#F59E0B] text-black"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <Presentation size={16} />
          </button>
          <button
            onClick={() => {
              setRecording(!recording);
              toast[recording ? "info" : "success"](
                recording ? "Recording stopped" : "Recording started"
              );
            }}
            data-testid="toolbar-record"
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
              recording
                ? "bg-red-500 text-white"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <Circle size={12} fill={recording ? "currentColor" : "none"} />
          </button>
          <button
            data-testid="toolbar-invite"
            onClick={() => toast.info("Invite link copied")}
            className="w-11 h-11 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <UserPlus size={16} />
          </button>
          <div className="w-px h-6 bg-white/10 mx-1" />
          <button
            onClick={() => nav("/studios")}
            data-testid="toolbar-leave"
            className="bg-red-500 hover:bg-red-400 text-white rounded-full px-5 py-2.5 text-xs font-medium"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
}

const ToolbarBtn = ({ active, onClick, testId, iconOn, iconOff }) => (
  <button
    onClick={onClick}
    data-testid={testId}
    className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
      active ? "bg-white/10 text-white hover:bg-white/20" : "bg-red-500/80 text-white"
    }`}
  >
    {active ? iconOn : iconOff}
  </button>
);

const Tile = ({ name, color, role, camOn, micOn, speaking, small, testId, onDoubleClick }) => (
  <div
    onDoubleClick={onDoubleClick}
    className={`relative rounded-xl overflow-hidden border transition-all ${
      speaking
        ? "border-emerald-400 ring-2 ring-emerald-400/40"
        : "border-white/[0.08]"
    } ${small ? "aspect-video" : "aspect-[4/3]"}`}
    data-testid={testId}
    style={{
      background: camOn
        ? `radial-gradient(circle at 30% 40%, ${color}44, #000)`
        : "#0a0a0a",
    }}
  >
    {camOn ? (
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`rounded-full flex items-center justify-center font-display font-medium ${
            small ? "w-10 h-10 text-base" : "w-16 h-16 text-2xl"
          }`}
          style={{ background: color, color: "#000" }}
        >
          {name[0]}
        </div>
      </div>
    ) : (
      <div className="absolute inset-0 flex items-center justify-center">
        <VideoOff size={20} className="text-zinc-600" />
      </div>
    )}
    <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between gap-1">
      <div className="glass rounded-full px-2 py-0.5 text-[10px] text-zinc-100 truncate max-w-[70%]">
        {name}
      </div>
      <div className="flex items-center gap-1">
        {!micOn && (
          <div className="bg-red-500/80 rounded-full w-5 h-5 flex items-center justify-center">
            <MicOff size={9} className="text-white" />
          </div>
        )}
        {speaking && (
          <div className="bg-emerald-400 rounded-full w-2 h-2 dot-pulse" />
        )}
      </div>
    </div>
  </div>
);
