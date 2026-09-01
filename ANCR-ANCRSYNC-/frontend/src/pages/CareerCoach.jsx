import { useEffect, useRef, useState } from "react";
import { API_BASE } from "@/lib/api";
import { PageHeader, Section, TagPill } from "@/components/Bits";
import { Sparkles, Send } from "lucide-react";
import { toast } from "sonner";

const QUICK = [
  "Review my resume from a hiring manager's perspective.",
  "How should I prepare for the Meridian Records interview?",
  "What salary should I negotiate for a staff composer role?",
  "Give me portfolio feedback based on my ANCRLAB projects.",
  "Help me plan the next 90 days of my career.",
  "What's my strongest personal branding angle?",
];

export default function CareerCoach() {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, streaming]);

  const send = async (prompt) => {
    const text = (prompt ?? input).trim();
    if (!text || streaming) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }, { role: "assistant", content: "", streaming: true }]);
    setStreaming(true);

    try {
      const token = localStorage.getItem("ancrid_token");
      const res = await fetch(`${API_BASE}/coach/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ session_id: sessionId, message: text }),
      });
      if (!res.ok || !res.body) throw new Error("Stream failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let currentEvent = null;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf("\n\n")) !== -1) {
          const chunk = buf.slice(0, idx);
          buf = buf.slice(idx + 2);
          const lines = chunk.split("\n");
          currentEvent = null;
          let dataStr = "";
          for (const l of lines) {
            if (l.startsWith("event:")) currentEvent = l.slice(6).trim();
            else if (l.startsWith("data:")) dataStr += l.slice(5).trim();
          }
          if (currentEvent === "session") {
            setSessionId(dataStr);
          } else if (currentEvent === "done") {
            // finalize
          } else if (currentEvent === "error") {
            toast.error(dataStr);
          } else if (dataStr) {
            const piece = dataStr.replace(/\\n/g, "\n");
            setMessages((m) => {
              const cp = [...m];
              const last = cp[cp.length - 1];
              if (last && last.role === "assistant") {
                cp[cp.length - 1] = { ...last, content: (last.content || "") + piece };
              }
              return cp;
            });
          }
        }
      }
    } catch (e) {
      toast.error("AIAH stream failed");
    } finally {
      setStreaming(false);
      setMessages((m) => {
        const cp = [...m];
        const last = cp[cp.length - 1];
        if (last && last.role === "assistant") cp[cp.length - 1] = { ...last, streaming: false };
        return cp;
      });
    }
  };

  return (
    <div data-testid="coach-page">
      <PageHeader
        eyebrow="AIAH™ Career Coach · Claude Sonnet 4.5"
        title={<>Your executive career advisor,<br /><span className="grad-text">live.</span></>}
        subtitle="AIAH consumes verified ecosystem data — your ANCRID identity, portfolio, publishing, reputation, and readiness — to advise you directly."
      />
      <Section className="pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Quick prompts */}
          <aside className="lg:col-span-4 space-y-3">
            <div className="label-eyebrow mb-4">Start With</div>
            {QUICK.map((q) => (
              <button
                key={q}
                data-testid={`quick-prompt`}
                onClick={() => send(q)}
                disabled={streaming}
                className="w-full text-left border hair p-4 hover:border-white/25 hover:bg-white/[0.02] transition-colors text-sm leading-relaxed"
              >
                {q}
              </button>
            ))}
            <div className="border hair p-4 mt-6 bg-[#050505]">
              <TagPill>Powered by Claude Sonnet 4.5</TagPill>
              <p className="mt-3 text-xs text-white/50 leading-relaxed">
                Model can be swapped to Gemini or GPT without changing this interface. Every response is grounded in your verified ANCR data.
              </p>
            </div>
          </aside>

          {/* Chat */}
          <div className="lg:col-span-8 border hair bg-[#050505] flex flex-col h-[70vh]">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6" data-testid="coach-messages">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center px-8">
                  <div className="h-20 w-20 rounded-full grad-stroke p-[1.5px]">
                    <div className="h-full w-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                      <img
                        src="/ancrlaunch-logo.png"
                        alt="ANCRLaunch"
                        className="h-16 w-16 object-contain"
                      />
                    </div>
                  </div>
                  <div className="font-display text-3xl mt-6 leading-tight">
                    Hello. I am AIAH<span className="align-super text-xs">™</span>.
                  </div>
                  <p className="mt-4 text-white/60 max-w-md text-sm leading-relaxed">
                    Ask about your resume, an interview, salary negotiation, portfolio positioning, or your next career move. I have full context from the ANCR ecosystem.
                  </p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} data-testid={`msg-${m.role}`} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] px-5 py-4 whitespace-pre-wrap leading-relaxed text-sm ${
                      m.role === "user"
                        ? "bg-white text-black"
                        : "border hair bg-black text-white/85"
                    }`}
                  >
                    {m.content}
                    {m.streaming && <span className="inline-block ml-1 w-2 h-4 bg-white/50 animate-pulse" />}
                  </div>
                </div>
              ))}
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="border-t hair p-5 flex items-center gap-4"
            >
              <input
                data-testid="coach-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AIAH…"
                disabled={streaming}
                className="flex-1 bg-transparent focus:outline-none font-body text-base"
              />
              <button
                data-testid="coach-send"
                type="submit"
                disabled={streaming || !input.trim()}
                className="inline-flex items-center gap-2 bg-white text-black px-5 py-3 font-mono text-[11px] uppercase tracking-[0.24em] disabled:opacity-50 hover:bg-white/90 transition-colors"
              >
                <Send strokeWidth={1.5} className="h-3.5 w-3.5" /> Send
              </button>
            </form>
          </div>
        </div>
      </Section>
    </div>
  );
}
