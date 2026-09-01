import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  CheckCircle2,
  Circle,
  Plus,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  FileText,
  Music2,
  BadgeCheck,
  Share2,
} from "lucide-react";
import api from "../lib/api";

export default function WorkspaceDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [ws, setWs] = useState(null);
  const [newTask, setNewTask] = useState("");
  const [comment, setComment] = useState("");
  const [aiOut, setAiOut] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [inheira, setInheira] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const load = () => api.get(`/workspaces/${id}`).then((r) => setWs(r.data));
  useEffect(() => {
    load();
    api.get(`/inheira/sync/${id}`).then((r) => setInheira(r.data));
  }, [id]);

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    await api.post(`/workspaces/${id}/tasks`, { title: newTask });
    setNewTask("");
    load();
  };

  const toggleTask = async (tid) => {
    await api.post(`/workspaces/${id}/tasks/${tid}/toggle`);
    load();
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    await api.post(`/workspaces/${id}/comments`, { body: comment });
    setComment("");
    load();
  };

  const runAI = async () => {
    setAiLoading(true);
    setAiOut("");
    try {
      const prompt = `Project: ${ws.name}. Discipline: ${ws.discipline}. Description: ${
        ws.description || "N/A"
      }. Current tasks: ${(ws.tasks || [])
        .map((t) => `${t.title} (${t.status})`)
        .join(", ") || "none"}. Recommend concrete next moves.`;
      const r = await api.post("/ai/chat", {
        prompt,
        context: "recommend",
        session_id: `ws-${id}`,
      });
      setAiOut(r.data.response);
    } catch {
      toast.error("AI failed");
    } finally {
      setAiLoading(false);
    }
  };

  const syncInheira = async () => {
    setSyncing(true);
    try {
      const r = await api.post(`/inheira/sync/${id}`);
      setInheira(r.data);
      toast.success("Synced to INHEIRA™");
    } catch {
      toast.error("Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  if (!ws)
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500 text-xs font-mono tracking-overline">
        Loading workspace…
      </div>
    );

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 glass-strong border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => nav("/workspaces")}
              className="text-zinc-500 hover:text-white"
              data-testid="back-workspaces"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="text-[10px] tracking-overline text-zinc-500">
                {ws.discipline} · Workspace
              </div>
              <div className="font-display text-2xl tracking-tight">
                {ws.name}
              </div>
            </div>
          </div>
          <button
            onClick={runAI}
            disabled={aiLoading}
            data-testid="ws-ai-btn"
            className="text-xs bg-[#007AFF] hover:bg-blue-500 text-white px-4 py-2 rounded-full accent-glow flex items-center gap-2 disabled:opacity-60"
          >
            <Sparkles size={12} /> {aiLoading ? "Thinking…" : "AI Suggest"}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 pt-6 flex flex-wrap gap-2">
        <button
          onClick={() => nav(`/workspaces/${id}/creation`)}
          data-testid="open-creation-btn"
          className="flex items-center gap-2 glass rounded-full px-4 py-2 text-xs text-zinc-300 hover:text-white hover:border-white/[0.14] transition-colors"
        >
          <FileText size={12} className="text-[#007AFF]" /> Shared Creation™
        </button>
        <button
          onClick={() => nav(`/workspaces/${id}/review`)}
          data-testid="open-review-btn"
          className="flex items-center gap-2 glass rounded-full px-4 py-2 text-xs text-zinc-300 hover:text-white hover:border-white/[0.14] transition-colors"
        >
          <MessageSquare size={12} className="text-[#F59E0B]" /> Creative Review™
        </button>
        <button
          onClick={() => nav(`/ancrlab`)}
          data-testid="open-ancrlab-btn"
          className="flex items-center gap-2 glass rounded-full px-4 py-2 text-xs text-zinc-300 hover:text-white hover:border-white/[0.14] transition-colors"
        >
          <Music2 size={12} className="text-emerald-400" /> Open in ANCRLAB™
        </button>
        <button
          onClick={syncInheira}
          disabled={syncing}
          data-testid="inheira-sync-btn"
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs transition-colors disabled:opacity-60 ${
            inheira?.status === "synced"
              ? "bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B]"
              : "glass text-zinc-300 hover:text-white hover:border-white/[0.14]"
          }`}
        >
          {inheira?.status === "synced" ? (
            <BadgeCheck size={12} />
          ) : (
            <Share2 size={12} />
          )}
          {syncing
            ? "Syncing…"
            : inheira?.status === "synced"
            ? "Synced to INHEIRA™"
            : "Sync to INHEIRA™"}
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tasks */}
        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <div className="font-display text-lg mb-4">Tasks</div>
          <form onSubmit={addTask} className="flex gap-2 mb-4">
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a task…"
              data-testid="task-input"
              className="flex-1 bg-zinc-950/60 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#007AFF] outline-none"
            />
            <button
              type="submit"
              data-testid="add-task-btn"
              className="bg-white text-black rounded-xl px-3 flex items-center"
            >
              <Plus size={16} />
            </button>
          </form>
          <div className="space-y-2">
            {(ws.tasks || []).length === 0 && (
              <div className="text-xs text-zinc-500 py-6 text-center border border-dashed border-white/[0.08] rounded-xl">
                No tasks yet.
              </div>
            )}
            {(ws.tasks || []).map((t) => (
              <button
                key={t.id}
                onClick={() => toggleTask(t.id)}
                data-testid={`task-${t.id}`}
                className={`w-full flex items-center gap-3 border border-white/[0.06] rounded-xl px-4 py-3 text-left hover:bg-white/[0.02] transition-colors ${
                  t.status === "done" ? "opacity-60" : ""
                }`}
              >
                {t.status === "done" ? (
                  <CheckCircle2 size={16} className="text-[#007AFF]" />
                ) : (
                  <Circle size={16} className="text-zinc-500" />
                )}
                <span
                  className={`text-sm ${
                    t.status === "done"
                      ? "line-through text-zinc-500"
                      : "text-zinc-100"
                  }`}
                >
                  {t.title}
                </span>
                <span className="ml-auto text-[10px] tracking-overline text-zinc-500">
                  {t.assignee}
                </span>
              </button>
            ))}
          </div>

          {aiOut && (
            <div className="mt-6 border border-[#007AFF]/30 rounded-2xl p-5 bg-[#007AFF]/[0.04]">
              <div className="text-[10px] tracking-overline text-[#007AFF] mb-2 flex items-center gap-2">
                <Sparkles size={12} /> AI Suggestions
              </div>
              <div
                className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap"
                data-testid="ws-ai-output"
              >
                {aiOut}
              </div>
            </div>
          )}
        </div>

        {/* Milestones */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-6">
            <div className="font-display text-lg mb-4">Milestones</div>
            <div className="space-y-3">
              {ws.milestones.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 text-sm border-l-2 pl-3 py-1"
                  style={{
                    borderColor: m.done ? "#007AFF" : "rgba(255,255,255,0.1)",
                  }}
                >
                  {m.done ? (
                    <CheckCircle2 size={14} className="text-[#007AFF]" />
                  ) : (
                    <Circle size={14} className="text-zinc-600" />
                  )}
                  <span
                    className={m.done ? "text-zinc-300" : "text-zinc-500"}
                  >
                    {m.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={14} className="text-zinc-400" />
              <div className="font-display text-lg">Shared Feedback</div>
            </div>
            <form onSubmit={addComment} className="mb-4">
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Leave feedback…"
                data-testid="comment-input"
                className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white focus:border-[#007AFF] outline-none"
              />
              <button
                type="submit"
                data-testid="add-comment-btn"
                className="mt-2 w-full bg-white text-black rounded-xl py-2 text-xs font-medium"
              >
                Post
              </button>
            </form>
            <div className="space-y-3">
              {(ws.comments || []).length === 0 && (
                <div className="text-xs text-zinc-500 text-center">
                  No comments yet.
                </div>
              )}
              {(ws.comments || []).slice().reverse().map((c) => (
                <div key={c.id} className="flex items-start gap-2">
                  <div
                    className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-[11px] font-medium"
                    style={{ background: c.avatar_color, color: "#000" }}
                  >
                    {c.author_name[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-zinc-400">
                      {c.author_name}
                    </div>
                    <div className="text-sm text-zinc-100">{c.body}</div>
                    <div className="text-[10px] text-zinc-600 font-mono">
                      {new Date(c.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
