import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Users2 } from "lucide-react";
import api from "../lib/api";

export default function Communities() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("All");
  const [joined, setJoined] = useState({});

  useEffect(() => {
    api.get("/communities").then((r) => setItems(r.data));
  }, []);

  const kinds = ["All", ...Array.from(new Set(items.map((i) => i.kind)))];
  const filtered = filter === "All" ? items : items.filter((c) => c.kind === filter);

  const join = async (id, name) => {
    await api.post(`/communities/${id}/join`);
    setJoined({ ...joined, [id]: true });
    toast.success(`Joined ${name}`);
  };

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 glass-strong border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-overline text-zinc-500">
              Creative Communities™
            </div>
            <div className="font-display text-2xl tracking-tight">
              Find your people
            </div>
          </div>
          <div className="text-xs text-zinc-500 flex items-center gap-2">
            <Users2 size={14} /> {items.length} communities
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {kinds.map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              data-testid={`community-filter-${k}`}
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
          {filtered.map((c) => (
            <div
              key={c.id}
              data-testid={`community-${c.id}`}
              className="glass rounded-2xl p-6 hover:border-white/[0.14] transition-colors relative overflow-hidden"
            >
              <div
                className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-30"
                style={{ background: c.color }}
              />
              <div className="relative">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center font-display text-lg font-medium"
                    style={{ background: c.color, color: "#000" }}
                  >
                    {c.name[0]}
                  </div>
                  <div>
                    <div className="font-display text-base text-zinc-50">
                      {c.name}
                    </div>
                    <div className="text-[11px] tracking-overline text-zinc-500">
                      {c.kind}
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <div className="text-xs font-mono text-zinc-500">
                    {c.members.toLocaleString()} members
                  </div>
                  <button
                    onClick={() => join(c.id, c.name)}
                    disabled={joined[c.id]}
                    data-testid={`join-community-${c.id}`}
                    className={`text-xs px-4 py-1.5 rounded-full font-medium transition-colors ${
                      joined[c.id]
                        ? "bg-white/10 text-zinc-400"
                        : "bg-white text-black hover:bg-zinc-200"
                    }`}
                  >
                    {joined[c.id] ? "Joined" : "Join"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
