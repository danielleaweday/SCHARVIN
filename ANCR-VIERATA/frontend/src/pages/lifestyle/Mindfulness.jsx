import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, Bookmark, BookmarkCheck, Heart, Search, Sparkles, MessageCircle } from "lucide-react";
import { ActivityTimer } from "@/components/lifestyle/ActivityTimer";

function AffirmationsTab() {
  const [items, setItems] = useState([]);
  const [themes, setThemes] = useState([]);
  const [activeTheme, setActiveTheme] = useState("");
  const [query, setQuery] = useState("");
  const [reflectingFor, setReflectingFor] = useState(null);
  const [reflectionText, setReflectionText] = useState("");
  const [favs, setFavs] = useState([]);

  const load = async () => {
    const params = new URLSearchParams();
    if (activeTheme) params.set("theme", activeTheme);
    if (query) params.set("q", query);
    const { data } = await api.get(`/lifestyle/affirmations?${params.toString()}`);
    setItems(data.items);
    setThemes(data.themes);
    const { data: f } = await api.get("/lifestyle/affirmations/favorites");
    setFavs(f.items);
  };
  useEffect(() => { load(); }, [activeTheme]);
  useEffect(() => { const t = setTimeout(load, 200); return () => clearTimeout(t); }, [query]);

  const toggle = async (id) => {
    try {
      const { data } = await api.post(`/lifestyle/affirmations/${id}/favorite`);
      setItems((prev) => prev.map((a) => (a.id === id ? { ...a, favorited: data.favorited } : a)));
      toast.success(data.favorited ? "Saved to favorites" : "Removed");
      const { data: f } = await api.get("/lifestyle/affirmations/favorites");
      setFavs(f.items);
    } catch { toast.error("Couldn't update"); }
  };

  const saveReflection = async () => {
    if (!reflectingFor) return;
    try {
      await api.post("/lifestyle/affirmations/reflection", { affirmation_id: reflectingFor, note: reflectionText });
      setReflectingFor(null); setReflectionText("");
      toast.success("Reflection saved privately");
      const { data: f } = await api.get("/lifestyle/affirmations/favorites");
      setFavs(f.items);
    } catch { toast.error("Couldn't save reflection"); }
  };

  return (
    <div data-testid="affirmations-tab">
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-4 h-4 text-white/45" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search affirmations…"
          data-testid="aff-search"
          className="flex-1 bg-transparent border-b border-white/10 focus:border-white/30 outline-none py-2 text-sm placeholder:text-white/30" />
      </div>
      <div className="flex flex-wrap gap-2 mb-5">
        <button onClick={() => setActiveTheme("")} data-testid="aff-theme-all"
          className={`px-3 py-1.5 rounded-full text-xs border ${!activeTheme ? "bg-white/10 border-white/40" : "border-white/10 text-white/55 hover:text-white/85"}`}>All</button>
        {themes.map((th) => (
          <button key={th} onClick={() => setActiveTheme(th)} data-testid={`aff-theme-${th}`}
            className={`px-3 py-1.5 rounded-full text-xs border ${activeTheme === th ? "bg-white/10 border-white/40" : "border-white/10 text-white/55 hover:text-white/85"}`}>{th.replace(/_/g, " ")}</button>
        ))}
      </div>

      {favs.length > 0 && (
        <section className="mb-6">
          <div className="text-[11px] uppercase tracking-[0.22em] text-viearta-teal mb-2">Your favorites</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {favs.map((a) => (
              <div key={`fav-${a.id}`} data-testid={`fav-${a.id}`} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">{a.theme.replace(/_/g, " ")}</div>
                <p className="mt-1 font-display text-lg leading-snug">"{a.text}"</p>
                {a.reflection && <p className="mt-2 text-xs text-white/60 italic">— {a.reflection}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((a) => (
          <div key={a.id} data-testid={`aff-${a.id}`} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <span className="text-[10px] uppercase tracking-[0.22em] text-white/40">{a.theme.replace(/_/g, " ")}</span>
              <button onClick={() => toggle(a.id)} data-testid={`aff-fav-${a.id}`} className="text-white/50 hover:text-white">
                {a.favorited ? <BookmarkCheck className="w-4 h-4 text-viearta-teal" /> : <Bookmark className="w-4 h-4" />}
              </button>
            </div>
            <p className="mt-2 font-display text-lg leading-snug">"{a.text}"</p>
            <button onClick={() => { setReflectingFor(a.id); setReflectionText(""); }} data-testid={`aff-reflect-${a.id}`}
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-white/55 hover:text-white self-start">
              <MessageCircle className="w-3.5 h-3.5" /> Add a private reflection
            </button>
          </div>
        ))}
      </div>

      {reflectingFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="reflection-dialog">
          <div className="absolute inset-0 bg-black/70" onClick={() => setReflectingFor(null)} />
          <div className="relative w-full max-w-md glass rounded-3xl p-6 border border-white/10">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/45 mb-2">Private reflection</div>
            <textarea rows={4} value={reflectionText} onChange={(e) => setReflectionText(e.target.value)} autoFocus
              data-testid="reflection-text"
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-3 text-sm outline-none resize-none placeholder:text-white/30"
              placeholder="What is this affirmation asking of you today?" />
            <div className="mt-4 flex items-center justify-end gap-2">
              <button onClick={() => setReflectingFor(null)} className="text-white/60 hover:text-white text-sm">Cancel</button>
              <button onClick={saveReflection} data-testid="reflection-save"
                className="rounded-full px-5 py-2.5 text-sm bg-white text-black hover:bg-white/90">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActivitiesTab() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    api.get("/lifestyle/mindfulness/activities").then(({ data }) => setItems(data.items));
  }, []);

  const complete = async () => {
    try {
      await api.post("/lifestyle/mindfulness/complete", {
        activity_id: selected.id, duration_seconds: selected.duration_seconds,
        reflection: note || null,
      });
      toast.success("Nicely done. Session logged.");
      setNote(""); setSelected(null);
    } catch { toast.error("Couldn't log completion"); }
  };

  if (selected) {
    return (
      <div data-testid="mindfulness-activity">
        <button onClick={() => setSelected(null)} className="text-white/60 hover:text-white text-sm mb-4 inline-flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Back</button>
        <h3 className="font-display text-2xl">{selected.title}</h3>
        <p className="text-white/60 text-sm mt-1">{selected.purpose}</p>
        <div className="mt-4">
          <ActivityTimer durationSeconds={selected.duration_seconds} testidPrefix="mf-timer" />
        </div>
        <ol className="mt-5 space-y-2 text-sm text-white/80">
          {selected.steps.map((s, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="text-white/40 font-mono text-xs mt-0.5">{i + 1}.</span> {s}
            </li>
          ))}
        </ol>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional reflection" rows={2}
          data-testid="mf-reflection"
          className="mt-5 w-full bg-white/[0.03] border border-white/10 rounded-2xl p-3 text-sm outline-none resize-none placeholder:text-white/30" />
        <div className="mt-4 flex justify-end">
          <button onClick={complete} data-testid="mf-complete"
            className="rounded-full px-5 py-2.5 text-sm bg-white text-black hover:bg-white/90">Mark complete</button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3" data-testid="mindfulness-list">
      {items.map((a) => (
        <button key={a.id} onClick={() => setSelected(a)} data-testid={`mf-${a.id}`}
          className="text-left rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 glass-hover">
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">{a.category.replace(/_/g, " ")}</div>
          <div className="font-display text-lg mt-1">{a.title}</div>
          <div className="text-sm text-white/60 mt-1">{a.purpose}</div>
          <div className="mt-2 text-[11px] text-white/45">{Math.round(a.duration_seconds / 60)} min</div>
        </button>
      ))}
    </div>
  );
}

export default function Mindfulness() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("affirmations");

  return (
    <div className="fade-up" data-testid="mindfulness-page">
      <button onClick={() => navigate("/lifestyle")} className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-4">
        <ArrowLeft className="w-4 h-4" /> Lifestyle
      </button>

      <section className="glass rounded-3xl p-6 sm:p-8 mb-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-10 w-64 h-64 rounded-full blur-3xl opacity-30" style={{ background: "#9333EA" }} />
        <div className="relative">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/45 mb-2">
            <Heart className="w-3.5 h-3.5" /> Mindfulness
          </div>
          <h1 className="font-display text-3xl sm:text-4xl tracking-tight">Space to reset, ground, and stay present.</h1>
          <p className="text-white/60 text-sm mt-2 max-w-2xl">Curated affirmations and short practices. Private by default.</p>
        </div>
      </section>

      <div className="flex gap-2 mb-5">
        {[
          ["affirmations", "Affirmations", Sparkles],
          ["activities", "Practices", Heart],
        ].map(([k, label, Icon]) => (
          <button key={k} onClick={() => setTab(k)} data-testid={`tab-${k}`}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm border ${tab === k ? "bg-white/10 border-white/40" : "border-white/10 text-white/60 hover:text-white/85"}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {tab === "affirmations" ? <AffirmationsTab /> : <ActivitiesTab />}
    </div>
  );
}
