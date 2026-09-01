import React, { useEffect, useState } from "react";
import AppShell from "@/components/ancrd/AppShell";
import PageHeader from "@/components/ancrd/PageHeader";
import { api, timeAgo } from "@/lib/api";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function MessagesPage() {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [active, setActive] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");

  const loadThreads = () => api.get("/messages/threads").then(({data})=>{ setThreads(data); if (!active && data[0]) setActive(data[0]); });
  useEffect(() => { loadThreads(); }, []);
  useEffect(() => {
    if (!active) return;
    api.get(`/messages/${active.id}`).then(({data})=>setMsgs(data));
  }, [active]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !active) return;
    await api.post("/messages", { to_user_id: active.other.id, content: text });
    setText("");
    const { data } = await api.get(`/messages/${active.id}`);
    setMsgs(data);
    loadThreads();
  };

  return (
    <AppShell right={false}>
      <PageHeader
        section="Messages"
        kicker="Direct line across the ANCRD Network"
        description="Private conversations with verified creators, mentors, faculty, and institutional partners."
      />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[70vh]">
        <div className="md:col-span-4 glass rounded-sm overflow-hidden flex flex-col" data-testid="threads-list">
          <div className="px-4 py-3 border-b border-white/10 font-mono text-[10px] uppercase tracking-widest text-white/40">Threads</div>
          <div className="flex-1 overflow-y-auto">
            {threads.map(t => (
              <button key={t.id} onClick={()=>setActive(t)} data-testid={`thread-${t.id}`}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-white/5 ${active?.id === t.id ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"}`}>
                <img src={t.other?.avatar} className="h-10 w-10 rounded-sm object-cover" alt="" />
                <div className="min-w-0 flex-1">
                  <div className="font-display font-bold text-sm truncate">{t.other?.name}</div>
                  <div className="text-xs text-white/50 truncate">{t.last_message}</div>
                </div>
                <div className="font-mono text-[10px] text-white/40">{timeAgo(t.updated_at)}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="md:col-span-8 glass rounded-sm flex flex-col">
          {active ? (
            <>
              <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
                <img src={active.other?.avatar} className="h-9 w-9 rounded-sm object-cover" alt="" />
                <div>
                  <div className="font-display font-bold text-sm">{active.other?.name}</div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-white/40">{active.other?.role}</div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {msgs.map(m => {
                  const me = m.from_user_id === user?.id;
                  return (
                    <div key={m.id} className={`flex ${me ? "justify-end" : ""}`}>
                      <div className={`max-w-[75%] px-3 py-2 rounded-sm text-sm ${me ? "bg-white text-black" : "bg-white/[0.04] border border-white/10"}`}>
                        {m.content}
                      </div>
                    </div>
                  );
                })}
              </div>
              <form onSubmit={send} className="p-3 border-t border-white/10 flex gap-2">
                <input data-testid="msg-input" value={text} onChange={(e)=>setText(e.target.value)} placeholder="Write a message…"
                  className="flex-1 bg-black/40 border border-white/10 focus:border-white/30 outline-none rounded-sm px-3 py-2 text-sm" />
                <button data-testid="msg-send" className="px-3 border border-white/15 hover:border-white/30 btn-cine rounded-sm"><Send className="h-4 w-4" /></button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center font-mono text-xs text-white/40">Select a thread</div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
