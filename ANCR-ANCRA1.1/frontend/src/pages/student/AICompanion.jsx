import React from "react";
import { useLocation } from "react-router-dom";
import { Section, Chip } from "@/components/common/Primitives";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { API } from "@/lib/api";
import { useRole } from "@/context/RoleContext";

const THEMES = [
  { id: "gap", title: "Portfolio gap analysis", prompt: "Analyse gaps in my current portfolio and suggest the exact next 3 pieces I should submit." },
  { id: "song", title: "Which songs to finish next", prompt: "Given my 30 Song Progress, which 3 songs should I finish next to maximise release velocity?" },
  { id: "grow", title: "Career readiness signal", prompt: "What single move would most increase my ANCRLaunch™ graduation readiness this month?" },
  { id: "collab", title: "Best next collaboration", prompt: "Given my Nightshift + Lo-Fi Society activity, which peer collaboration should I prioritise?" },
];

export default function AICompanion() {
  const { role } = useRole();
  const loc = useLocation();
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState("");
  const [streaming, setStreaming] = React.useState(false);
  const [session] = React.useState("aiah_dedicated_" + Math.random().toString(36).slice(2));
  const scrollRef = React.useRef(null);

  React.useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  // Palette prefill hook: if command palette dispatches a prompt, immediately send it.
  React.useEffect(() => {
    const handler = (e) => {
      const p = e?.detail?.prompt;
      if (p) send(p);
    };
    window.addEventListener("aiah:prefill", handler);
    return () => window.removeEventListener("aiah:prefill", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || streaming) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: msg }, { role: "assistant", content: "" }]);
    setStreaming(true);
    try {
      const res = await fetch(`${API}/aiah/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: session, message: msg, role, context: { page: loc.pathname, dedicated: true } }),
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const parts = buf.split("\n\n");
        buf = parts.pop();
        for (const p of parts) {
          if (!p.startsWith("data:")) continue;
          const pl = JSON.parse(p.slice(5).trim());
          if (pl.delta) {
            setMessages((m) => { const c = [...m]; c[c.length - 1] = { ...c[c.length - 1], content: c[c.length - 1].content + pl.delta }; return c; });
          }
        }
      }
    } catch {
      setMessages((m) => { const c = [...m]; c[c.length - 1] = { role: "assistant", content: "AIAH is offline." }; return c; });
    } finally { setStreaming(false); }
  };

  return (
    <div className="px-6 md:px-10 py-10 ancr-reveal">
      <Section
        eyebrow="AIAH™ · Intelligence Layer"
        title={<span><em className="italic text-ancr-dim">Contextual</em> AI Learning Companion</span>}
        sub="AIAH is not a chatbot. It reads the entire ANCR ecosystem — your lessons, portfolio, INHEIRA™ splits, ANCRSync™ collaborations, COHEIR™ feedback, Vaulta™ finances — and reasons across them to give you actionable, next-step guidance."
      />

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: context awareness */}
        <div className="lg:col-span-4 space-y-4">
          <div className="ancr-card p-6">
            <div className="ancr-label mb-4">What AIAH sees right now</div>
            <div className="space-y-3 font-mono text-[11px] text-ancr-dim">
              <ContextLine label="ANCRA" text="Semester 3 · 41% journey · 4 Studio Experiences™ active" />
              <ContextLine label="ANCRLAB" text="3 studio projects · 42h this month" />
              <ContextLine label="ANCRSync" text="Nightshift · 2 rooms · 4 unread" />
              <ContextLine label="INHEIRA" text="13/30 registered · 2 pending splits" />
              <ContextLine label="COHEIR" text="1 feedback waiting · Thu office hours" />
              <ContextLine label="Vaulta" text="$1,204 YTD · 3 budget assignments" />
              <ContextLine label="ANCRLaunch" text="74% graduation readiness · 12 employer views" />
              <ContextLine label="ANCRID" text="Portfolio 87 · Passport v2 ready" />
            </div>
          </div>

          <div className="ancr-card p-6">
            <div className="ancr-label mb-4">Try a theme</div>
            <div className="space-y-2">
              {THEMES.map((t) => (
                <button key={t.id} data-testid={`aiah-theme-${t.id}`} onClick={() => send(t.prompt)} className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-left text-[13px] hover:border-white/20 hover:bg-white/[0.04] transition">
                  {t.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: conversation */}
        <div className="lg:col-span-8">
          <div className="ancr-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-[var(--ancra-accent)]" />
                <div>
                  <div className="ancr-label">AIAH™</div>
                  <div className="mt-0.5 font-mono text-[10px] text-ancr-mute">Claude Sonnet 4.5 · streaming · role · {role}</div>
                </div>
              </div>
              <Chip tone="accent">contextual</Chip>
            </div>

            <div ref={scrollRef} className="min-h-[420px] max-h-[60vh] space-y-4 overflow-y-auto p-6">
              {messages.length === 0 && (
                <div className="font-serif text-2xl leading-snug tracking-tight text-ancr-dim">
                  I have read your entire journey. Ask me anything — I'll ground every answer in what's actually happening across your ecosystem.
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : "flex"}>
                  <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-[14px] leading-relaxed ${
                    m.role === "user" ? "bg-white text-black" : "border border-white/[0.06] bg-white/[0.02] text-ancr-text"
                  }`}>
                    {m.role === "assistant" && !m.content && streaming
                      ? <span className="flex items-center gap-2 text-ancr-dim"><Loader2 size={12} className="animate-spin" /> reasoning across the ecosystem</span>
                      : m.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/[0.06] p-4">
              <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2">
                <input
                  data-testid="aiah-page-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Ask AIAH about your journey…"
                  className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-ancr-mute"
                />
                <button
                  data-testid="aiah-page-send"
                  onClick={() => send()}
                  disabled={streaming || !input.trim()}
                  className="rounded-full bg-white p-2 text-black disabled:opacity-30"
                ><Send size={13} /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContextLine({ label, text }) {
  return (
    <div className="flex gap-3">
      <div className="w-20 flex-shrink-0 uppercase tracking-widest text-[9px] text-[var(--ancra-accent)]">{label}™</div>
      <div className="flex-1 text-ancr-dim">{text}</div>
    </div>
  );
}
