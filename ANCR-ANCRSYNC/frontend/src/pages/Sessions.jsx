import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, X, Calendar, Globe2 } from "lucide-react";
import api from "../lib/api";
import { CITIES, localTime } from "../components/GlobalPulse";

// Deterministic city assignment for each session (until real geo)
const geoFor = (seedStr, count = 4) => {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) h = (h * 31 + seedStr.charCodeAt(i)) >>> 0;
  const picked = [];
  const used = new Set();
  for (let i = 0; i < count; i++) {
    let idx = (h + i * 73) % CITIES.length;
    while (used.has(idx)) idx = (idx + 1) % CITIES.length;
    used.add(idx);
    picked.push(CITIES[idx]);
  }
  return picked;
};

const pad = (n) => String(n).padStart(2, "0");
const nowInputValue = () => {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function Sessions() {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    start_time: nowInputValue(),
    duration_minutes: 60,
    invitees_raw: "",
  });

  const load = () => api.get("/sessions").then((r) => setItems(r.data));
  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        start_time: new Date(form.start_time).toISOString(),
        duration_minutes: Number(form.duration_minutes),
        invitees: form.invitees_raw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const r = await api.post("/sessions", payload);
      toast.success("Session scheduled");
      setOpen(false);
      setForm({
        title: "",
        start_time: nowInputValue(),
        duration_minutes: 60,
        invitees_raw: "",
      });
      nav(`/sessions/${r.data.id}`);
    } catch {
      toast.error("Failed to schedule");
    }
  };

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 glass-strong border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-overline text-zinc-500">
              Shared Sessions™
            </div>
            <div className="font-display text-2xl tracking-tight">
              Creative calendar
            </div>
          </div>
          <button
            onClick={() => setOpen(true)}
            data-testid="new-session-btn"
            className="text-sm bg-zinc-50 text-zinc-950 hover:bg-white px-4 py-2 rounded-full font-medium flex items-center gap-2"
          >
            <Plus size={14} /> Schedule
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {items.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center">
            <Calendar size={24} className="text-zinc-500 mx-auto mb-4" />
            <div className="font-display text-2xl mb-3">
              No sessions scheduled
            </div>
            <p className="text-sm text-zinc-500 max-w-md mx-auto mb-8">
              Schedule collaborative sessions with video, whiteboard, chat, and
              AI-generated summaries.
            </p>
            <button
              onClick={() => setOpen(true)}
              data-testid="empty-new-session-btn"
              className="bg-[#007AFF] hover:bg-blue-500 text-white px-6 py-3 rounded-full text-sm font-medium accent-glow"
            >
              Schedule session
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((s) => {
              const cities = geoFor(s.id, 4);
              return (
                <button
                  key={s.id}
                  onClick={() => nav(`/sessions/${s.id}`)}
                  data-testid={`session-${s.id}`}
                  className="w-full text-left glass rounded-2xl p-5 flex items-start gap-4 hover:border-white/[0.14] transition-colors"
                >
                  <div className="text-center border-r border-white/[0.06] pr-4">
                    <div className="font-mono text-xs text-zinc-500">
                      {new Date(s.start_time).toLocaleDateString(undefined, {
                        month: "short",
                      })}
                    </div>
                    <div className="font-display text-2xl">
                      {new Date(s.start_time).getDate()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] tracking-overline text-zinc-500 flex items-center gap-2">
                      <Globe2 size={10} /> Creative Session · {s.status} · {s.duration_minutes} min
                    </div>
                    <div className="font-display text-lg truncate mt-0.5">
                      {s.title}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {cities.map((c) => (
                        <span
                          key={c.name}
                          className="inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full border border-white/[0.06] bg-white/[0.02]"
                        >
                          <span className="leading-none">{c.flag}</span>
                          <span className="text-zinc-200">{c.name}</span>
                          <span className="font-mono text-zinc-500">
                            {localTime(c.tz)}
                          </span>
                        </span>
                      ))}
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-2 font-mono">
                      Host {s.host_name} · {cities.length} collaborators ·{" "}
                      {new Date(s.start_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-1 text-[11px] text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 dot-pulse" />
                    Live
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <form
            onSubmit={create}
            data-testid="new-session-form"
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
              Schedule Session
            </div>
            <label className="block text-[11px] tracking-overline text-zinc-500 mb-2">
              Title
            </label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              data-testid="session-title-input"
              className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:border-[#007AFF] outline-none mb-4"
              placeholder="Aurora writing session"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] tracking-overline text-zinc-500 mb-2">
                  Start
                </label>
                <input
                  type="datetime-local"
                  value={form.start_time}
                  onChange={(e) =>
                    setForm({ ...form, start_time: e.target.value })
                  }
                  data-testid="session-start-input"
                  className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:border-[#007AFF] outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] tracking-overline text-zinc-500 mb-2">
                  Duration (min)
                </label>
                <input
                  type="number"
                  min={15}
                  step={15}
                  value={form.duration_minutes}
                  onChange={(e) =>
                    setForm({ ...form, duration_minutes: e.target.value })
                  }
                  data-testid="session-duration-input"
                  className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:border-[#007AFF] outline-none"
                />
              </div>
            </div>
            <label className="block text-[11px] tracking-overline text-zinc-500 mb-2 mt-4">
              Invitees (comma-separated emails)
            </label>
            <input
              value={form.invitees_raw}
              onChange={(e) =>
                setForm({ ...form, invitees_raw: e.target.value })
              }
              data-testid="session-invitees-input"
              className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:border-[#007AFF] outline-none mb-6"
              placeholder="ayaan@ancr.co, nia@ancr.co"
            />
            <button
              type="submit"
              data-testid="submit-session-btn"
              className="w-full bg-[#007AFF] hover:bg-blue-500 text-white rounded-full py-3 text-sm font-medium accent-glow"
            >
              Schedule
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
