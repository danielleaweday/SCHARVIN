import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, X, ArrowUpRight } from "lucide-react";
import api from "../lib/api";

const DISCIPLINES = [
  "Music",
  "Film",
  "Animation",
  "Photography",
  "Design",
  "Brand",
  "Podcast",
  "Innovation",
  "Multidisciplinary",
];

export default function Workspaces() {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    discipline: "Music",
  });

  const load = () => api.get("/workspaces").then((r) => setItems(r.data));
  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      const r = await api.post("/workspaces", form);
      toast.success("Workspace created");
      setOpen(false);
      setForm({ name: "", description: "", discipline: "Music" });
      nav(`/workspaces/${r.data.id}`);
    } catch (err) {
      toast.error("Failed to create");
    }
  };

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 glass-strong border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-overline text-zinc-500">
              Creative Workspaces
            </div>
            <div className="font-display text-2xl tracking-tight">
              Your projects
            </div>
          </div>
          <button
            onClick={() => setOpen(true)}
            data-testid="new-workspace-btn"
            className="text-sm bg-zinc-50 text-zinc-950 hover:bg-white px-4 py-2 rounded-full font-medium flex items-center gap-2"
          >
            <Plus size={14} /> New workspace
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {items.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center">
            <div className="font-display text-2xl mb-3">
              Start your first workspace
            </div>
            <p className="text-sm text-zinc-500 max-w-md mx-auto mb-8">
              Every project lives inside a dedicated workspace with tasks,
              files, timeline, and comments — connected.
            </p>
            <button
              onClick={() => setOpen(true)}
              data-testid="empty-new-workspace-btn"
              className="bg-[#007AFF] hover:bg-blue-500 text-white px-6 py-3 rounded-full text-sm font-medium accent-glow"
            >
              Create workspace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((w) => (
              <button
                key={w.id}
                onClick={() => nav(`/workspaces/${w.id}`)}
                data-testid={`workspace-item-${w.id}`}
                className="text-left glass rounded-2xl p-6 hover:border-white/[0.14] transition-colors group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] tracking-overline text-zinc-500">
                    {w.discipline}
                  </span>
                  <ArrowUpRight
                    size={14}
                    className="text-zinc-600 group-hover:text-white transition-colors"
                  />
                </div>
                <div className="font-display text-lg text-zinc-50">
                  {w.name}
                </div>
                <p className="text-xs text-zinc-500 mt-2 line-clamp-2">
                  {w.description || "No description yet."}
                </p>
                <div className="mt-6 flex items-center gap-4 text-[11px] text-zinc-500 font-mono">
                  <span>{w.tasks?.length || 0} tasks</span>
                  <span>
                    {w.milestones?.filter((m) => m.done).length || 0}/
                    {w.milestones?.length || 0} milestones
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <form
            onSubmit={create}
            data-testid="new-workspace-form"
            className="glass-strong rounded-3xl p-8 w-full max-w-md relative"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
              data-testid="close-new-workspace"
            >
              <X size={18} />
            </button>
            <div className="font-display text-2xl mb-6 tracking-tight">
              New Workspace
            </div>
            <label className="block text-[11px] tracking-overline text-zinc-500 mb-2">
              Name
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              data-testid="workspace-name-input"
              className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] outline-none mb-4"
              placeholder="Aurora EP"
            />
            <label className="block text-[11px] tracking-overline text-zinc-500 mb-2">
              Discipline
            </label>
            <select
              value={form.discipline}
              onChange={(e) =>
                setForm({ ...form, discipline: e.target.value })
              }
              data-testid="workspace-discipline-select"
              className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] outline-none mb-4"
            >
              {DISCIPLINES.map((d) => (
                <option key={d} value={d} className="bg-zinc-900">
                  {d}
                </option>
              ))}
            </select>
            <label className="block text-[11px] tracking-overline text-zinc-500 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              data-testid="workspace-description-input"
              className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] outline-none mb-6"
              placeholder="What are you creating?"
            />
            <button
              type="submit"
              data-testid="submit-workspace-btn"
              className="w-full bg-[#007AFF] hover:bg-blue-500 text-white rounded-full py-3 text-sm font-medium accent-glow"
            >
              Create workspace
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
