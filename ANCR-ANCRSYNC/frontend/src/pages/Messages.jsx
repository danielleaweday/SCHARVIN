import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Send, Hash, Plus, X, Reply } from "lucide-react";
import api from "../lib/api";

const REACTIONS = ["👏", "🔥", "❤️"];

export default function Messages() {
  const [channels, setChannels] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    api.get("/channels").then((r) => {
      setChannels(r.data);
      if (r.data.length) setActive(r.data[0]);
    });
  }, []);

  useEffect(() => {
    if (!active) return;
    api.get(`/messages/${active.id}`).then((r) => setMessages(r.data));
  }, [active]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!body.trim() || !active) return;
    const r = await api.post("/messages", {
      channel_id: active.id,
      body,
      reply_to: replyTo?.id || null,
    });
    setMessages([...messages, r.data]);
    setBody("");
    setReplyTo(null);
  };

  const create = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const r = await api.post("/channels", {
      name: newName.startsWith("#") ? newName : `# ${newName}`,
      kind: "group",
    });
    setChannels([r.data, ...channels]);
    setActive(r.data);
    setNewName("");
    setShowNew(false);
    toast.success("Channel created");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="sticky top-0 z-30 glass-strong border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-overline text-zinc-500">
              Communication Layer™
            </div>
            <div className="font-display text-2xl tracking-tight">Messages</div>
          </div>
          <button
            onClick={() => setShowNew(true)}
            data-testid="new-channel-btn"
            className="text-sm bg-zinc-50 text-zinc-950 hover:bg-white px-4 py-2 rounded-full font-medium flex items-center gap-2"
          >
            <Plus size={14} /> New channel
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 p-8 min-h-0">
        {/* Channels */}
        <div className="glass rounded-2xl p-4 flex flex-col min-h-0">
          <div className="text-[10px] tracking-overline text-zinc-500 mb-2 px-2">
            Channels
          </div>
          <div className="overflow-y-auto flex-1 space-y-1">
            {channels.map((c) => (
              <button
                key={c.id}
                onClick={() => setActive(c)}
                data-testid={`channel-${c.id}`}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm flex items-center gap-2 transition-colors ${
                  active?.id === c.id
                    ? "bg-white/[0.06] text-zinc-50"
                    : "text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200"
                }`}
              >
                <Hash size={12} className="text-zinc-500" />
                <span className="truncate">{c.name.replace(/^#\s*/, "")}</span>
                {c.kind === "announcement" && (
                  <span className="ml-auto text-[9px] tracking-overline text-[#F59E0B]">
                    Broadcast
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Thread */}
        <div className="glass rounded-2xl md:col-span-3 flex flex-col overflow-hidden min-h-0">
          {active && (
            <div className="p-4 border-b border-white/[0.06] flex items-center gap-2">
              <Hash size={14} className="text-zinc-400" />
              <div>
                <div className="font-display text-base text-zinc-50">
                  {active.name.replace(/^#\s*/, "")}
                </div>
                <div className="text-[10px] tracking-overline text-zinc-500">
                  {active.topic}
                </div>
              </div>
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[400px]">
            {messages.length === 0 && (
              <div className="text-xs text-zinc-500 text-center py-10">
                No messages yet — start the conversation.
              </div>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className="flex items-start gap-3 group"
                data-testid={`message-${m.id}`}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0"
                  style={{ background: m.avatar_color, color: "#000" }}
                >
                  {m.author_name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-zinc-100">
                      {m.author_name}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {new Date(m.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="text-sm text-zinc-200 mt-0.5 leading-relaxed">
                    {m.body}
                  </div>
                </div>
                <button
                  onClick={() => setReplyTo(m)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-zinc-200 transition-opacity"
                >
                  <Reply size={14} />
                </button>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <form
            onSubmit={send}
            className="border-t border-white/[0.06] p-3 space-y-2"
          >
            {replyTo && (
              <div className="flex items-center justify-between glass rounded-xl px-3 py-2 text-xs">
                <div className="text-zinc-400 truncate">
                  Replying to{" "}
                  <span className="text-zinc-100">{replyTo.author_name}</span> ·{" "}
                  {replyTo.body}
                </div>
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="text-zinc-500 hover:text-white"
                >
                  <X size={12} />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 pr-1">
                {REACTIONS.slice(0, 3).map((r) => (
                  <span key={r} className="text-sm opacity-40">
                    {r}
                  </span>
                ))}
              </div>
              <input
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={
                  active ? `Message ${active.name}` : "Select a channel…"
                }
                data-testid="messages-input"
                className="flex-1 bg-zinc-950/60 border border-white/[0.08] rounded-full px-4 py-2.5 text-sm text-white focus:border-[#007AFF] outline-none"
              />
              <button
                type="submit"
                data-testid="messages-send-btn"
                className="bg-[#007AFF] text-white rounded-full w-10 h-10 flex items-center justify-center accent-glow"
              >
                <Send size={14} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <form
            onSubmit={create}
            className="glass-strong rounded-3xl p-8 w-full max-w-md relative"
          >
            <button
              type="button"
              onClick={() => setShowNew(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X size={18} />
            </button>
            <div className="font-display text-2xl mb-6 tracking-tight">
              New channel
            </div>
            <input
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              data-testid="new-channel-name-input"
              placeholder="# aurora-ep"
              className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:border-[#007AFF] outline-none mb-6"
            />
            <button
              type="submit"
              data-testid="submit-channel-btn"
              className="w-full bg-[#007AFF] hover:bg-blue-500 text-white rounded-full py-3 text-sm font-medium accent-glow"
            >
              Create channel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
