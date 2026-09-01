import React, { useState, useRef, useEffect } from "react";
import { X, Send, Bot, Sparkles } from "lucide-react";
import { API } from "@/lib/api";

const SUGGESTIONS = [
  "Who should I meet this week?",
  "Match me with a mentor for sync licensing",
  "Which collaborators fit my portfolio?",
  "Draft my weekly insights",
];

export default function AiahPanel({ open, onClose }) {
  const [messages, setMessages] = useState([
    { role: "aiah", content: "I am AIAH — the intelligence layer of the ANCR Ecosystem. Ask me anything about creators, collaborations, mentors, or opportunities." }
  ]);
  const [prompt, setPrompt] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  const ask = async (q) => {
    if (!q.trim() || streaming) return;
    setPrompt("");
    setMessages((m) => [...m, { role: "user", content: q }, { role: "aiah", content: "" }]);
    setStreaming(true);
    try {
      const token = localStorage.getItem("ancrd_token");
      const res = await fetch(`${API}/aiah/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt: q }),
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "aiah", content: acc };
          return copy;
        });
      }
    } catch (e) {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "aiah", content: "AIAH is temporarily unavailable." };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] z-50 glass-elev flex flex-col border-l border-white/10" data-testid="aiah-panel">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-sm bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center">
            <Bot className="h-3.5 w-3.5 text-[#00E5FF]" />
          </div>
          <div>
            <div className="font-display font-bold text-sm tracking-tight">AIAH<span className="text-[#00E5FF] text-[9px] align-super ml-0.5">™</span></div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-white/40">Ecosystem Intelligence · Claude Sonnet 4.5</div>
          </div>
        </div>
        <button data-testid="aiah-close" onClick={onClose} className="p-1 text-white/50 hover:text-white btn-cine">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
            <div className={`max-w-[85%] rounded-sm px-3 py-2 text-sm leading-relaxed ${m.role === "user" ? "bg-white text-black" : "bg-white/[0.04] border border-white/10 text-white/90"}`}>
              {m.role === "aiah" && m.content === "" && streaming ? (
                <span className="inline-flex gap-1"><span className="animate-pulse">◔</span><span className="animate-pulse" style={{animationDelay:'.1s'}}>◑</span><span className="animate-pulse" style={{animationDelay:'.2s'}}>◕</span></span>
              ) : (
                <div className="whitespace-pre-wrap">{m.content}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {messages.length <= 1 && (
        <div className="px-5 pb-3 grid grid-cols-1 gap-2">
          <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-1 flex items-center gap-1"><Sparkles className="h-3 w-3 text-[#00E5FF]" /> Suggested</div>
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              data-testid={`aiah-suggestion-${i}`}
              onClick={() => ask(s)}
              className="text-left text-xs px-3 py-2 border border-white/10 hover:border-[#00E5FF]/40 hover:bg-white/[0.03] btn-cine rounded-sm text-white/80"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); ask(prompt); }}
        className="p-4 border-t border-white/10 flex gap-2"
      >
        <input
          data-testid="aiah-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask AIAH…"
          className="flex-1 bg-black/40 border border-white/10 focus:border-[#00E5FF]/50 outline-none rounded-sm px-3 py-2 text-sm font-mono"
        />
        <button
          data-testid="aiah-send"
          type="submit"
          disabled={streaming}
          className="px-3 py-2 border border-white/15 hover:border-[#00E5FF]/60 hover:text-[#00E5FF] btn-cine rounded-sm disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
