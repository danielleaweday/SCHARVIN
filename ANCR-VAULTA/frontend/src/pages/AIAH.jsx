import { useEffect, useState, useRef } from "react";
import api, { API } from "@/lib/api";
import { PageHeader, GlassCard } from "@/components/primitives";
import { Bot, Send, Sparkles, Loader2 } from "lucide-react";

const PROMPTS = [
  "Forecast my cash flow for the next 6 months.",
  "Which royalty statement is missing and where do I chase it?",
  "Should I file quarterly taxes now, and how much?",
  "What grants am I best positioned to win in Q1 2026?",
  "Is my tour budget on track? Where can I cut without hurting production?",
  "Compare LLC vs S-Corp for my current revenue.",
];

export default function AIAH() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello. I'm AIAH — Vaulta's AI Financial Advisor. I have live access to your income, expenses, royalties, and forecasts. What decision are we thinking through today?" },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  const send = async (msg) => {
    const text = (msg || input).trim();
    if (!text || streaming) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }, { role: "assistant", content: "" }]);
    setStreaming(true);

    try {
      const res = await fetch(`${API}/aiah/chat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, session_id: sessionId }),
      });
      if (!res.ok || !res.body) throw new Error("stream failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          try {
            const data = JSON.parse(line.slice(5).trim());
            if (data.delta) {
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1].content += data.delta;
                return copy;
              });
            }
            if (data.error) {
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1].content = "AIAH is unavailable right now. Please retry in a moment.";
                return copy;
              });
            }
          } catch {}
        }
      }
    } catch (e) {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1].content = "AIAH is unavailable right now. Please retry in a moment.";
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="aiah-page">
      <PageHeader
        kicker="AIAH · AI Financial Advisor"
        title={<>Your creator <span className="gradient-text">CFO on demand.</span></>}
        subtitle="Cash flow forecasts, royalty predictions, budget recommendations, tax strategy, grant intelligence — grounded in your live Vaulta numbers."
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <GlassCard className="xl:col-span-3 flex flex-col h-[640px]" testid="aiah-chat-panel">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg gradient-bar flex items-center justify-center">
              <Bot size={14} className="text-black" />
            </div>
            <div>
              <div className="text-[13px] font-medium">AIAH</div>
              <div className="text-[10px] tracking-[0.22em] uppercase text-white/40">Claude Sonnet 4.5 · Live</div>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-[10.5px] text-emerald-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" /> Online
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2" data-testid="aiah-messages">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${m.role === "user" ? "bg-white/[0.06]" : "gradient-bar"}`}>
                  {m.role === "user"
                    ? <span className="text-[11px] font-bold text-white">You</span>
                    : <Bot size={13} className="text-black" />
                  }
                </div>
                <div className={`max-w-[80%] p-3.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-white/[0.04] border border-white/[0.06]"
                    : "bg-white/[0.02] border border-white/[0.06]"
                }`}>
                  {m.content || (streaming && i === messages.length - 1 && (
                    <span className="inline-flex items-center gap-2 text-white/50">
                      <Loader2 size={12} className="animate-spin" /> thinking…
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="mt-4 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AIAH anything about your finances…"
              data-testid="aiah-input"
              className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3 text-[13px] outline-none focus:border-cyan-400/50"
              disabled={streaming}
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              data-testid="aiah-send"
              className="gradient-border rounded-lg disabled:opacity-50"
            >
              <div className="px-4 py-3 rounded-lg bg-[#0a0a0a] hover:bg-[#111] flex items-center gap-1.5 text-[12px] font-semibold">
                {streaming ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                Send
              </div>
            </button>
          </form>
        </GlassCard>

        <GlassCard testid="aiah-prompts">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={13} className="text-orange-400" />
            <div className="eyebrow">Suggested Prompts</div>
          </div>
          <div className="space-y-2">
            {PROMPTS.map((p, i) => (
              <button
                key={i}
                onClick={() => send(p)}
                disabled={streaming}
                data-testid={`aiah-prompt-${i}`}
                className="w-full text-left p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] text-[12px] leading-snug text-white/75 hover:text-white disabled:opacity-40"
              >
                {p}
              </button>
            ))}
          </div>

          <div className="mt-5 p-3 rounded-lg gradient-border">
            <div className="eyebrow mb-1">CFO Mode</div>
            <div className="text-[11.5px] text-white/60 leading-relaxed">
              AIAH is grounded in your live Vaulta data. Answers reference actual dollar amounts, dates, and categories from your ledger.
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
