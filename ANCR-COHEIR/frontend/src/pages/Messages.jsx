import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { RoleChip } from "@/components/coheir/MentorCard";
import { Send } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function Messages() {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");

  const loadThreads = async () => {
    let { data } = await api.get("/threads");
    if (data.length === 0) {
      const r = await api.get("/threads/all");
      data = r.data;
    }
    setThreads(data);
    if (data[0] && !active) select(data[0]);
  };
  const select = async (t) => {
    setActive(t);
    const { data } = await api.get(`/threads/${t.id}/messages`);
    setMessages(data);
  };
  useEffect(() => { loadThreads(); }, []);

  const send = async () => {
    if (!body.trim() || !active) return;
    await api.post("/threads/messages", { thread_id: active.id, body });
    setBody("");
    select(active);
    loadThreads();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-4 h-[calc(100vh-140px)]">
      <aside className="glass-panel p-3 overflow-y-auto">
        <div className="wordmark text-lg text-white mb-3 px-2">Conversations</div>
        <div className="space-y-1">
          {threads.map((t) => (
            <button key={t.id} onClick={() => select(t)}
              data-testid={`thread-${t.id}`}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                active?.id === t.id ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
              }`}>
              <div className="flex items-center justify-between mb-1">
                <div className="text-white text-sm font-semibold truncate">{t.title}</div>
                <RoleChip tone="zinc">{t.kind}</RoleChip>
              </div>
              <div className="text-zinc-500 text-xs truncate">{t.last_message}</div>
            </button>
          ))}
        </div>
      </aside>
      <section className="glass-panel flex flex-col">
        <div className="p-4 border-b border-white/[0.05]">
          <div className="wordmark text-lg text-white">{active?.title || "—"}</div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((m) => {
            const mine = m.sender_id === user.user_id;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-md px-4 py-2.5 rounded-2xl ${
                  mine ? "bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-white" :
                  "bg-white/[0.04] border border-white/[0.06] text-zinc-200"
                }`}>
                  {!mine && <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{m.sender_name}</div>}
                  <div className="text-sm leading-relaxed">{m.body}</div>
                </div>
              </div>
            );
          })}
          {messages.length === 0 && <div className="text-zinc-500 text-sm text-center py-10">Select or start a conversation.</div>}
        </div>
        <div className="p-3 border-t border-white/[0.05] flex gap-2">
          <input value={body} onChange={(e) => setBody(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
            data-testid="msg-input"
            placeholder="Write a message…"
            className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-full px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none" />
          <button onClick={send} data-testid="msg-send-btn" className="btn-primary text-sm flex items-center gap-2"><Send className="w-4 h-4" /> Send</button>
        </div>
      </section>
    </div>
  );
}
