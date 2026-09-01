import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import api from "../lib/api";

const STUDIO_KINDS = [
  "Songwriting",
  "Recording",
  "Production",
  "Film",
  "Animation",
  "Photography",
  "Podcast",
  "Brand",
  "Creative Strategy",
  "Innovation",
];

export default function Studios() {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    kind: "Songwriting",
    description: "",
  });

  const load = () => api.get("/studios").then((r) => setItems(r.data));
  useEffect(() => {
    load();
  }, []);

  const filtered =
    filter === "All" ? items : items.filter((s) => s.kind === filter);

  const create = async (e) => {
    e.preventDefault();
    try {
      const r = await api.post("/studios", form);
      toast.success("Studio launched");
      setOpen(false);
      setForm({ name: "", kind: "Songwriting", description: "" });
      nav(`/studios/${r.data.id}`);
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 glass-strong border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-overline text-zinc-500">
              Shared Studios™
            </div>
            <div className="font-display text-2xl tracking-tight">
              Live creative rooms
            </div>
          </div>
          <button
            onClick={() => setOpen(true)}
            data-testid="new-studio-btn"
            className="text-sm bg-zinc-50 text-zinc-950 hover:bg-white px-4 py-2 rounded-full font-medium flex items-center gap-2"
          >
            <Plus size={14} /> New studio
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {["All", ...STUDIO_KINDS].map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              data-testid={`studio-filter-${k}`}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors border ${
                filter === k
                  ? "bg-white text-black border-white"
                  : "border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <button
              key={s.id}
              onClick={() => nav(`/studios/${s.id}`)}
              data-testid={`studio-${s.id}`}
              className="text-left glass rounded-2xl p-6 hover:border-white/[0.14] transition-colors relative overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#007AFF]/10 blur-3xl" />
              <div className="flex items-center gap-2 text-[10px] tracking-overline mb-3 relative">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    s.activity === "Live"
                      ? "bg-[#007AFF] dot-pulse"
                      : s.activity === "Scheduled"
                      ? "bg-[#F59E0B]"
                      : "bg-zinc-500"
                  }`}
                />
                <span className="text-zinc-400">
                  {s.activity} · {s.kind}
                </span>
              </div>
              <div className="font-display text-xl text-zinc-50 relative">
                {s.name}
              </div>
              <p className="text-xs text-zinc-500 mt-2 line-clamp-2 relative">
                {s.description}
              </p>
              <div className="mt-6 flex items-center justify-between relative">
                <div className="flex -space-x-2">
                  {[...Array(Math.min(4, s.member_count || 3))].map((_, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full border border-black"
                      style={{
                        background: [
                          "#007AFF",
                          "#F59E0B",
                          "#10B981",
                          "#EC4899",
                        ][i % 4],
                      }}
                    />
                  ))}
                </div>
                <div className="text-[11px] font-mono text-zinc-500">
                  {s.member_count} members
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <form
            onSubmit={create}
            data-testid="new-studio-form"
            className="glass-strong rounded-3xl p-8 w-full max-w-md relative"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X size={18} />
            </button>
            <div className="font-display text-2xl mb-6 tracking-tight">
              Launch Studio
            </div>
            <label className="block text-[11px] tracking-overline text-zinc-500 mb-2">
              Name
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              data-testid="studio-name-input"
              className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:border-[#007AFF] outline-none mb-4"
              placeholder="e.g. The Chorus Room"
            />
            <label className="block text-[11px] tracking-overline text-zinc-500 mb-2">
              Kind
            </label>
            <select
              value={form.kind}
              onChange={(e) => setForm({ ...form, kind: e.target.value })}
              data-testid="studio-kind-select"
              className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:border-[#007AFF] outline-none mb-4"
            >
              {STUDIO_KINDS.map((k) => (
                <option key={k} value={k} className="bg-zinc-900">
                  {k}
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
              data-testid="studio-description-input"
              className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:border-[#007AFF] outline-none mb-6"
            />
            <button
              type="submit"
              data-testid="submit-studio-btn"
              className="w-full bg-[#007AFF] hover:bg-blue-500 text-white rounded-full py-3 text-sm font-medium accent-glow"
            >
              Launch
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
