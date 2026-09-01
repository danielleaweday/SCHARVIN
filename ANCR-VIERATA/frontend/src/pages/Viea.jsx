import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import { Sparkles, Send, Loader2, Trash2, ArrowLeft, Info, RotateCcw, AlertTriangle, LifeBuoy, WifiOff } from "lucide-react";

// Client-side crisis language check. This is a safety-net UI hint —
// the backend also enforces guardrails. We never diagnose here.
const CRISIS_PATTERNS = [
  /\bsuicid/i, /\bkill (myself|me)\b/i, /\bend (my|it) (life|all)\b/i,
  /\bself[- ]?harm/i, /\bharm(ing)? myself\b/i, /\bhurt(ing)? myself\b/i,
  /\bcan'?t (go on|breathe)\b/i, /\bchest pain\b/i, /\bcan'?t breathe\b/i,
  /\boverdose|od'?ing\b/i, /\bemergenc(y|ies)\b/i,
];
const looksLikeCrisis = (t = "") => CRISIS_PATTERNS.some((r) => r.test(t));

const MAX_LEN = 4000;

export default function Viea() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  const [crisisShown, setCrisisShown] = useState(false);
  const listRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/viea/history");
      setMessages((data.items || []).map((m) => ({ ...m, status: "sent" })));
    } catch {
      // silent — first load failure will show empty state
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }); }, [messages, busy]);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const doSend = async (t, tempId) => {
    // mark pending
    setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, status: "pending" } : m)));
    setBusy(true);
    try {
      const { data } = await api.post("/viea/message", { text: t });
      setMessages((prev) => [
        ...prev.map((m) => (m.id === tempId ? { ...m, status: "sent" } : m)),
        { ...data, status: "sent" },
      ]);
    } catch (e) {
      setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, status: "failed" } : m)));
      toast.error("Viea couldn't respond just now. Tap retry to send again.");
    } finally {
      setBusy(false);
    }
  };

  const send = () => {
    const t = text.trim();
    if (!t || busy) return;
    if (t.length > MAX_LEN) { toast.error(`Message is too long (max ${MAX_LEN} chars).`); return; }
    if (!online) { toast.error("You're offline — reconnect and try again."); return; }
    if (looksLikeCrisis(t)) setCrisisShown(true);

    const tempId = `local-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempId, role: "user", text: t, created_at: new Date().toISOString(), status: "pending" },
    ]);
    setText("");
    doSend(t, tempId);
  };

  const retry = (m) => {
    if (busy) return;
    if (!online) { toast.error("You're offline — reconnect and try again."); return; }
    doSend(m.text, m.id);
  };

  const clear = async () => {
    if (!window.confirm("Clear your Viea conversation? This can't be undone.")) return;
    try { await api.delete("/viea/history"); setMessages([]); setCrisisShown(false); toast.success("Conversation cleared"); }
    catch { toast.error("Couldn't clear conversation"); }
  };

  const suggestions = [
    "How can I steady my nerves before a live show?",
    "What's a good pre-studio snack for a long session?",
    "I slept 5 hours — how do I get through rehearsal?",
    "Give me a two-minute reset I can do right now.",
  ];

  return (
    <div className="fade-up" data-testid="viea-page">
      <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-4" data-testid="viea-back-home">
        <ArrowLeft className="w-4 h-4" /> Home
      </button>

      <section className="glass rounded-3xl p-6 sm:p-8 mb-6 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-30" style={{ background: "#9333EA" }} />
        <div className="relative flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/45 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Viea · your VIEARTA companion
            </div>
            <h1 className="font-display text-3xl sm:text-4xl tracking-tight leading-[1.05]">
              Ask about your <span className="viearta-gradient">voice, body, mind, or day.</span>
            </h1>
            <p className="text-white/60 text-sm mt-2 max-w-2xl">
              Educational and supportive — never medical, therapeutic, or emergency care. Viea will guide you to a qualified professional when it matters.
            </p>
          </div>
          {messages.length > 0 && (
            <button onClick={clear} data-testid="viea-clear" className="inline-flex items-center gap-1.5 text-xs text-white/55 hover:text-white/85">
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {!online && (
          <div data-testid="viea-offline" className="relative mt-4 rounded-2xl border border-rose-400/25 bg-rose-500/10 text-rose-100/90 text-sm p-3 inline-flex items-center gap-2">
            <WifiOff className="w-4 h-4" /> You're offline. Messages will not send until you reconnect.
          </div>
        )}

        {crisisShown && (
          <div data-testid="viea-crisis-banner" role="alert" className="relative mt-4 rounded-2xl border border-amber-300/25 bg-amber-500/10 text-amber-50/95 text-sm p-4">
            <div className="inline-flex items-center gap-2 font-medium mb-1"><LifeBuoy className="w-4 h-4" /> If you're in crisis, please reach a human right now</div>
            <p className="text-amber-50/80">
              Viea isn't a substitute for emergency, medical, or mental-health care.
              In the US, call or text <span className="font-medium">988</span> (Suicide & Crisis Lifeline).
              For emergencies dial <span className="font-medium">911</span>.
              You can also open the <button onClick={() => navigate("/support")} className="underline hover:text-white">VIEARTA Support page</button> for professional resources.
            </p>
          </div>
        )}
      </section>

      <section className="glass rounded-3xl p-4 sm:p-6">
        <div ref={listRef} className="max-h-[55vh] overflow-y-auto pr-2 space-y-3" data-testid="viea-messages">
          {messages.length === 0 && !busy && (
            <div className="text-white/55 text-sm text-center py-8" data-testid="viea-empty-state">
              <div className="mb-4">Ask Viea anything about your voice, body, mind, or your creative day.</div>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => setText(s)} data-testid={`viea-suggest-${i}`}
                    className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-white/65 hover:text-white hover:border-white/25">{s}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
              <div data-testid={`viea-msg-${m.role}`}
                className={`max-w-[85%] rounded-2xl p-3 text-sm ${m.role === "user" ? "bg-white text-black" : "glass border border-white/10 text-white/90"} ${m.status === "pending" ? "opacity-70" : ""} ${m.status === "failed" ? "border-rose-400/50" : ""}`}>
                <div className="whitespace-pre-wrap">{m.text}</div>
              </div>
              {m.role === "user" && m.status === "pending" && (
                <div className="text-[11px] text-white/40 mt-1 inline-flex items-center gap-1" data-testid={`viea-msg-status-${m.id}`}>
                  <Loader2 className="w-3 h-3 animate-spin" /> Sending…
                </div>
              )}
              {m.role === "user" && m.status === "failed" && (
                <div className="text-[11px] text-rose-300/90 mt-1 inline-flex items-center gap-2" data-testid={`viea-msg-failed-${m.id}`}>
                  <AlertTriangle className="w-3 h-3" /> Didn't send.
                  <button onClick={() => retry(m)} data-testid={`viea-retry-${m.id}`} className="inline-flex items-center gap-1 underline hover:text-white">
                    <RotateCcw className="w-3 h-3" /> Retry
                  </button>
                </div>
              )}
            </div>
          ))}

          {busy && (
            <div className="mr-auto glass border border-white/10 rounded-2xl p-3 text-sm text-white/60 inline-flex items-center gap-2" data-testid="viea-thinking">
              <Loader2 className="w-4 h-4 animate-spin" /> Viea is thinking…
            </div>
          )}
        </div>

        <div className="mt-4 flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_LEN))}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={online ? "Talk to Viea…" : "Offline — reconnect to send"}
            rows={1}
            disabled={!online}
            data-testid="viea-input"
            className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl p-3 text-sm outline-none resize-none placeholder:text-white/30 disabled:opacity-50" />
          <button onClick={send} disabled={busy || !text.trim() || !online} data-testid="viea-send"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm bg-white text-black hover:bg-white/90 disabled:opacity-60">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send
          </button>
        </div>

        <p className="mt-3 text-[11px] text-white/40 inline-flex items-center gap-1.5">
          <Info className="w-3 h-3" /> Educational only — for medical, mental health, or emergency needs, see{" "}
          <button onClick={() => navigate("/support")} className="underline hover:text-white/80" data-testid="viea-support-link">Support</button>.
        </p>
      </section>
    </div>
  );
}
