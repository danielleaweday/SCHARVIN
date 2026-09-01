import React, { useEffect, useRef, useState } from "react";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useRole } from "@/context/RoleContext";
import { API } from "@/lib/api";

function useContextualIntro(pathname, role) {
  const p = pathname === "/" ? "/dashboard" : pathname;
  if (role === "faculty") {
    if (p.startsWith("/faculty/curriculum")) return "Compose a new Studio Experience™ scaffold from a prompt.";
    if (p.startsWith("/faculty/approvals"))  return "Summarise this approvals queue by priority + risk.";
    if (p.startsWith("/faculty/analytics"))  return "Which cohort trend deserves attention this week?";
    if (p.startsWith("/faculty"))            return "Give me a briefing for today's cohort.";
  }
  if (p.startsWith("/lesson"))   return "Explain the prosody idea in this lesson using one of my songs.";
  if (p.startsWith("/song"))     return "Which 3 songs should I finish next to hit 15/30?";
  if (p.startsWith("/hub"))      return "What should I do in this module today?";
  return "What's the most valuable thing I can do next?";
}

export default function AIAHDock() {
  const loc = useLocation();
  const { role } = useRole();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const sessionId = useRef("aiah_" + Math.random().toString(36).slice(2)).current;
  const scrollRef = useRef(null);
  const intro = useContextualIntro(loc.pathname, role);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = async (textOverride) => {
    const text = (textOverride ?? input).trim();
    if (!text || streaming) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }, { role: "assistant", content: "" }]);
    setStreaming(true);
    try {
      const res = await fetch(`${API}/aiah/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          message: text,
          role,
          context: { page: loc.pathname },
        }),
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const payload = JSON.parse(line.slice(5).trim());
          if (payload.delta) {
            setMessages((m) => {
              const copy = [...m];
              copy[copy.length - 1] = { ...copy[copy.length - 1], content: copy[copy.length - 1].content + payload.delta };
              return copy;
            });
          }
        }
      }
    } catch (e) {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: "AIAH is offline. Try again in a moment." };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <>
      {/* Floating dock button */}
      <button
        data-testid="aiah-dock"
        onClick={() => setOpen(!open)}
        className={`fixed bottom-8 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/80 backdrop-blur-xl transition-transform hover:scale-105 aiah-pulse ${open ? "scale-95" : ""}`}
        aria-label="Open AIAH companion"
      >
        <Sparkles size={20} className="text-white" />
      </button>

      {/* Slide-in panel */}
      <div
        data-testid="aiah-panel"
        className={`fixed right-0 top-0 z-50 h-screen w-full sm:w-[440px] transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="ancr-glass-strong flex h-full flex-col border-l border-white/10">
          {/* header */}
          <div className="flex items-start justify-between border-b border-white/[0.06] p-6">
            <div>
              <div className="ancr-label mb-1">Intelligence Layer</div>
              <div className="font-serif text-2xl tracking-tight">AIAH<span className="text-[10px] align-top text-ancr-dim">™</span></div>
              <div className="mt-1 font-mono text-[10px] tracking-wider text-ancr-mute">
                Contextual · {role.toUpperCase()} · Claude Sonnet 4.5
              </div>
            </div>
            <button
              data-testid="aiah-close"
              onClick={() => setOpen(false)}
              className="rounded-full p-2 text-ancr-dim hover:bg-white/5 hover:text-white transition"
            ><X size={16} /></button>
          </div>

          {/* messages */}
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-6">
            {messages.length === 0 && (
              <div className="space-y-4">
                <div className="text-[15px] leading-relaxed text-ancr-dim">
                  I read the room. I know what you're studying, what you're building, and where your journey lives across the ecosystem. Ask me something specific.
                </div>
                <div className="ancr-label pt-2">Try</div>
                <div className="space-y-2">
                  {[
                    intro,
                    "Where is my portfolio weakest right now?",
                    "Suggest a next Master Session™ for me.",
                    role === "faculty" ? "Which student needs an intervention this week?" : "Draft an INHEIRA™ split note for Nightshift.",
                  ].map((s, i) => (
                    <button
                      key={i}
                      onClick={() => send(s)}
                      data-testid={`aiah-suggest-${i}`}
                      className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-left text-[13px] hover:border-white/20 hover:bg-white/[0.04] transition"
                    >{s}</button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex"}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${
                  m.role === "user"
                    ? "bg-white text-black"
                    : "border border-white/[0.06] bg-white/[0.02] text-ancr-text"
                }`}>
                  {m.role === "assistant" && !m.content && streaming ? (
                    <span className="flex items-center gap-2 text-ancr-dim"><Loader2 size={12} className="animate-spin" /> thinking</span>
                  ) : m.content}
                </div>
              </div>
            ))}
          </div>

          {/* composer */}
          <div className="border-t border-white/[0.06] p-4">
            <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2">
              <input
                data-testid="aiah-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                placeholder="Ask AIAH…"
                className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-ancr-mute"
              />
              <button
                data-testid="aiah-send"
                onClick={() => send()}
                disabled={streaming || !input.trim()}
                className="rounded-full bg-white p-2 text-black disabled:opacity-30"
              ><Send size={13} /></button>
            </div>
            <div className="mt-2 flex items-center justify-between px-1">
              <div className="font-mono text-[9px] tracking-wider text-ancr-mute uppercase">
                Contextual to · {loc.pathname === "/" ? "/dashboard" : loc.pathname}
              </div>
              <div className="font-mono text-[9px] text-ancr-mute">↵ send</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
