import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GraduationCap, X, BadgeCheck } from "lucide-react";
import api from "../lib/api";

const KINDS = [
  { key: "office_hours", label: "Faculty Office Hours" },
  { key: "portfolio_review", label: "Portfolio Review" },
  { key: "coaching", label: "Creative Coaching" },
  { key: "masterclass", label: "Masterclass" },
];

export default function Mentorship() {
  const [mentors, setMentors] = useState([]);
  const [open, setOpen] = useState(null);
  const [kind, setKind] = useState("office_hours");
  const [note, setNote] = useState("");

  useEffect(() => {
    api.get("/mentors").then((r) => setMentors(r.data));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/mentors/request", {
        mentor_id: open.id,
        kind,
        note,
      });
      toast.success(`Request sent to ${open.name}`);
      setOpen(null);
      setNote("");
    } catch {
      toast.error("Request failed");
    }
  };

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 glass-strong border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-overline text-zinc-500">
              Mentorship™
            </div>
            <div className="font-display text-2xl tracking-tight">
              Learn from the best
            </div>
          </div>
          <div className="text-xs text-zinc-500 flex items-center gap-2">
            <GraduationCap size={14} /> {mentors.length} mentors available
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mentors.map((m) => (
            <div
              key={m.id}
              data-testid={`mentor-${m.id}`}
              className="glass rounded-2xl p-6 hover:border-white/[0.14] transition-colors relative overflow-hidden"
            >
              <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-[#F59E0B]/10 blur-3xl" />
              <div className="relative flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center font-display text-lg">
                  {m.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <div className="font-display text-base text-zinc-50 truncate">
                      {m.name}
                    </div>
                    <BadgeCheck size={12} className="text-[#F59E0B] shrink-0" />
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate">
                    {m.role}
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Focus</span>
                  <span className="text-zinc-200">{m.focus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Rate</span>
                  <span className="text-zinc-200">{m.rate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Next available</span>
                  <span className="text-zinc-200 font-mono">{m.next}</span>
                </div>
              </div>
              <button
                onClick={() => setOpen(m)}
                data-testid={`request-mentor-${m.id}`}
                className="relative mt-5 w-full bg-[#007AFF] hover:bg-blue-500 text-white rounded-full py-2.5 text-xs font-medium accent-glow transition-colors"
              >
                Request session
              </button>
            </div>
          ))}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <form
            onSubmit={submit}
            className="glass-strong rounded-3xl p-8 w-full max-w-md relative"
          >
            <button
              type="button"
              onClick={() => setOpen(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X size={18} />
            </button>
            <div className="text-[10px] tracking-overline text-zinc-500">
              Request session with
            </div>
            <div className="font-display text-2xl mb-6 tracking-tight">
              {open.name}
            </div>
            <label className="block text-[11px] tracking-overline text-zinc-500 mb-2">
              Kind
            </label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              data-testid="mentor-kind-select"
              className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:border-[#007AFF] outline-none mb-4"
            >
              {KINDS.map((k) => (
                <option key={k.key} value={k.key} className="bg-zinc-900">
                  {k.label}
                </option>
              ))}
            </select>
            <label className="block text-[11px] tracking-overline text-zinc-500 mb-2">
              Message
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              data-testid="mentor-note-input"
              placeholder="What would you like to work on?"
              className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:border-[#007AFF] outline-none mb-6"
            />
            <button
              type="submit"
              data-testid="submit-mentor-request-btn"
              className="w-full bg-[#007AFF] hover:bg-blue-500 text-white rounded-full py-3 text-sm font-medium accent-glow"
            >
              Send request
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
