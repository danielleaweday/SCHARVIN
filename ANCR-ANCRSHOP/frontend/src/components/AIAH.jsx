import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import PlaceholderMedia from "@/components/PlaceholderMedia";
import api, { formatPrice } from "@/lib/api";

const SUGGESTIONS = [
  "I'm starting a podcast under $1,000",
  "I'm a first-semester CCDP film student",
  "Build me a $2,000 home studio",
  "What should every creator own?",
];

export default function AIAH({ open, setOpen }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I'm AIAH — your personal shopping concierge. Tell me your goal, discipline, or budget and I'll build the perfect kit from across the ANCR ecosystem.",
      products: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((p) => [...p, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const { data } = await api.post("/aiah/chat", {
        message: msg,
        session_id: sessionId,
        history,
      });
      setSessionId(data.session_id);
      setMessages((p) => [
        ...p,
        {
          role: "assistant",
          content: data.reply,
          products: data.products || [],
          note: data.bundle_note,
        },
      ]);
    } catch {
      setMessages((p) => [
        ...p,
        { role: "assistant", content: "Something went wrong reaching me. Please try again.", products: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open AIAH concierge"
        data-testid="aiah-fab"
        className="aiah-pulse fixed bottom-6 right-6 z-[75] flex h-14 w-14 items-center justify-center rounded-full bg-ccdp-gradient shadow-lg transition-transform hover:scale-105"
      >
        <Sparkles size={22} className="text-white" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[85] bg-black/50 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed bottom-0 right-0 z-[90] flex h-[85vh] w-full flex-col border-l border-t border-white/10 bg-[#0a0a0a] md:bottom-6 md:right-6 md:h-[640px] md:w-[420px] md:rounded-3xl md:border"
              data-testid="aiah-panel"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ccdp-gradient">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-head text-sm font-bold leading-none">AIAH</p>
                    <p className="mt-1 font-body text-[11px] text-white/40">Creator shopping concierge</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} aria-label="Close AIAH" data-testid="aiah-close">
                  <X size={20} className="text-white/60 hover:text-white" />
                </button>
              </div>

              <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                {messages.map((m, i) => (
                  <div key={i}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 font-body text-sm leading-relaxed ${
                        m.role === "user"
                          ? "ml-auto bg-[#0a44ff] text-white"
                          : "border border-white/10 bg-white/5 text-white/90"
                      }`}
                    >
                      {m.content}
                      {m.note && <p className="mt-2 text-xs text-white/50">{m.note}</p>}
                    </div>
                    {m.products?.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {m.products.map((p) => (
                          <Link
                            key={p.slug}
                            to={`/product/${p.slug}`}
                            onClick={() => setOpen(false)}
                            data-testid={`aiah-rec-${p.slug}`}
                            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-2 transition-colors hover:bg-white/[0.07]"
                          >
                            <PlaceholderMedia icon={p.icon} accent={p.accent} className="h-12 w-12 rounded-lg" iconClassName="!size-5" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-head text-xs font-medium">{p.name}</p>
                              <p className="font-body text-[11px] text-white/40">{p.brand}</p>
                            </div>
                            <span className="font-head text-xs">{formatPrice(p.price)}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-2 text-white/50">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="font-body text-sm">AIAH is curating…</span>
                  </div>
                )}
                {messages.length === 1 && (
                  <div className="space-y-2 pt-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="block w-full rounded-full border border-white/10 px-4 py-2.5 text-left font-body text-xs text-white/70 transition-colors hover:border-white/30 hover:text-white"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
                className="flex items-center gap-2 border-t border-white/10 px-4 py-3"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask AIAH anything…"
                  data-testid="aiah-input"
                  className="flex-1 bg-transparent font-body text-sm text-white placeholder:text-white/30 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  aria-label="Send"
                  data-testid="aiah-send"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-ccdp-gradient disabled:opacity-40"
                >
                  <Send size={15} className="text-white" />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
