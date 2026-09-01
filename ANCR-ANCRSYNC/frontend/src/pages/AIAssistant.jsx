import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Send, Loader2 } from "lucide-react";
import api from "../lib/api";

const CONTEXTS = [
  { key: "recommend", label: "Recommendations" },
  { key: "skill_match", label: "Skill match" },
  { key: "summary", label: "Session summary" },
  { key: "action_items", label: "Action items" },
  { key: "general", label: "General" },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Welcome. I'm ANCRSync AI — the intelligence layer of your Creative OS. Ask me to summarize a session, extract action items, recommend next moves, or match you with collaborators.",
    },
  ]);
  const [context, setContext] = useState("recommend");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    const userMsg = { role: "user", content: prompt };
    setMessages((m) => [...m, userMsg]);
    setPrompt("");
    setLoading(true);
    try {
      const r = await api.post("/ai/chat", {
        prompt: userMsg.content,
        context,
        session_id: "ai-assistant",
      });
      setMessages((m) => [...m, { role: "assistant", content: r.data.response }]);
    } catch (err) {
      toast.error("AI failed");
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Sorry — something went wrong reaching the AI. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="sticky top-0 z-30 glass-strong border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-8 py-5 flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-overline text-zinc-500">
              AI Collaboration Intelligence™
            </div>
            <div className="font-display text-2xl tracking-tight flex items-center gap-2">
              <Sparkles size={18} className="text-[#007AFF]" /> ANCRSync AI
            </div>
          </div>
          <select
            value={context}
            onChange={(e) => setContext(e.target.value)}
            data-testid="ai-context-select"
            className="bg-zinc-950/60 border border-white/[0.08] rounded-full px-4 py-2 text-xs text-white focus:border-[#007AFF] outline-none"
          >
            {CONTEXTS.map((c) => (
              <option key={c.key} value={c.key} className="bg-zinc-900">
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-8 py-8 space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            data-testid={`msg-${m.role}-${i}`}
            className={`rounded-2xl p-5 ${
              m.role === "user"
                ? "bg-[#007AFF]/10 border border-[#007AFF]/25 ml-auto max-w-2xl"
                : "glass max-w-2xl"
            }`}
          >
            <div className="text-[10px] tracking-overline text-zinc-500 mb-1">
              {m.role === "user" ? "You" : "ANCRSync AI"}
            </div>
            <div className="text-sm text-zinc-100 whitespace-pre-wrap leading-relaxed">
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="glass rounded-2xl p-5 max-w-2xl flex items-center gap-2 text-sm text-zinc-400">
            <Loader2 size={14} className="animate-spin" /> Thinking…
          </div>
        )}
      </div>

      <form
        onSubmit={send}
        className="sticky bottom-0 glass-strong border-t border-white/[0.06]"
      >
        <div className="max-w-4xl mx-auto px-8 py-4 flex items-center gap-2">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask ANCRSync AI…"
            data-testid="ai-prompt-input"
            className="flex-1 bg-zinc-950/60 border border-white/[0.08] rounded-full px-5 py-3 text-sm text-white focus:border-[#007AFF] outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            data-testid="ai-send-btn"
            className="bg-[#007AFF] hover:bg-blue-500 text-white rounded-full w-11 h-11 flex items-center justify-center accent-glow disabled:opacity-60"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
