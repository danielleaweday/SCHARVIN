import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  FileText,
  ListMusic,
  Music,
  StickyNote,
  Folder,
  Plus,
  Save,
} from "lucide-react";
import api from "../lib/api";
const TABS = [
  { key: "lyrics", label: "Lyrics", icon: FileText },
  { key: "arrangement", label: "Arrangement", icon: ListMusic },
  { key: "chords", label: "Chords", icon: Music },
  { key: "whiteboard", label: "Whiteboard", icon: StickyNote },
  { key: "assets", label: "Assets", icon: Folder },
];

export default function SharedCreation() {
  const { id } = useParams();
  const nav = useNavigate();
  const [tab, setTab] = useState("lyrics");
  const [data, setData] = useState(null);
  const [assets, setAssets] = useState([]);
  const [lyrics, setLyrics] = useState("");
  const [chords, setChords] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/creation/${id}`).then((r) => {
      setData(r.data);
      setLyrics(r.data.lyrics);
      setChords(r.data.chords);
    });
    api.get(`/assets/${id}`).then((r) => setAssets(r.data));
  }, [id]);

  const save = async (kind, val) => {
    setSaving(true);
    try {
      await api.post(`/creation/${id}`, { kind, data: val });
      toast.success("Saved");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const updateArrangement = async (next) => {
    setData({ ...data, arrangement: next });
    await api.post(`/creation/${id}`, { kind: "arrangement", data: next });
  };

  const addWhiteboardNote = async () => {
    const body = window.prompt("New idea / note:");
    if (!body) return;
    const next = [...data.whiteboard, { id: crypto.randomUUID(), kind: "idea", body }];
    setData({ ...data, whiteboard: next });
    await api.post(`/creation/${id}`, { kind: "whiteboard", data: next });
  };

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500 text-xs font-mono tracking-overline">
        Loading Shared Creation…
      </div>
    );

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 glass-strong border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => nav(`/workspaces/${id}`)}
            className="text-zinc-500 hover:text-white"
            data-testid="back-workspace"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="text-[10px] tracking-overline text-zinc-500">
              Shared Creation™
            </div>
            <div className="font-display text-2xl tracking-tight">
              Workspace Creation
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-8 pb-3 flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              data-testid={`tab-${t.key}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-colors ${
                tab === t.key
                  ? "bg-white/[0.08] text-zinc-50 border border-white/[0.1]"
                  : "text-zinc-400 hover:text-zinc-200 border border-transparent"
              }`}
            >
              <t.icon size={12} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {tab === "lyrics" && (
          <div className="glass rounded-2xl p-6" data-testid="lyrics-panel">
            <div className="flex items-center justify-between mb-4">
              <div className="font-display text-lg">Shared Lyrics™</div>
              <button
                onClick={() => save("lyrics", lyrics)}
                disabled={saving}
                data-testid="save-lyrics-btn"
                className="text-xs bg-[#007AFF] hover:bg-blue-500 text-white px-4 py-2 rounded-full accent-glow flex items-center gap-2 disabled:opacity-60"
              >
                <Save size={12} /> {saving ? "Saving…" : "Save"}
              </button>
            </div>
            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              onBlur={() => save("lyrics", lyrics)}
              data-testid="lyrics-textarea"
              rows={22}
              placeholder="Verse 1…"
              className="w-full bg-zinc-950/60 border border-white/[0.06] rounded-xl px-5 py-4 text-base text-zinc-100 focus:border-[#007AFF] outline-none font-mono leading-relaxed"
            />
          </div>
        )}

        {tab === "arrangement" && (
          <div className="glass rounded-2xl p-6" data-testid="arrangement-panel">
            <div className="font-display text-lg mb-4">Shared Arrangement™</div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {data.arrangement.map((s, i) => (
                <div
                  key={s.id}
                  className="shrink-0 rounded-xl p-4 min-w-[120px] cursor-grab active:cursor-grabbing"
                  style={{
                    background: `${s.color}22`,
                    border: `1px solid ${s.color}55`,
                  }}
                  data-testid={`arrangement-section-${s.id}`}
                >
                  <div className="text-[10px] tracking-overline text-zinc-400 mb-1">
                    #{i + 1}
                  </div>
                  <div className="font-display text-sm text-zinc-50">
                    {s.section}
                  </div>
                  <div className="text-[11px] font-mono text-zinc-500 mt-2">
                    {s.bars} bars
                  </div>
                </div>
              ))}
              <button
                onClick={() => {
                  const label = window.prompt("Section label:");
                  if (!label) return;
                  updateArrangement([
                    ...data.arrangement,
                    {
                      id: crypto.randomUUID(),
                      section: label,
                      bars: 8,
                      color: "#22D3EE",
                    },
                  ]);
                }}
                data-testid="add-arrangement-section"
                className="shrink-0 min-w-[120px] border border-dashed border-white/10 rounded-xl p-4 text-zinc-500 hover:text-zinc-200 hover:border-white/20 flex flex-col items-center justify-center gap-1"
              >
                <Plus size={14} />
                <span className="text-[10px] tracking-overline">Add section</span>
              </button>
            </div>
            <div className="mt-6 text-[11px] font-mono text-zinc-500">
              Drag sections to rearrange · updates propagate to all collaborators
            </div>
          </div>
        )}

        {tab === "chords" && (
          <div className="glass rounded-2xl p-6" data-testid="chords-panel">
            <div className="flex items-center justify-between mb-4">
              <div className="font-display text-lg">Shared Chords™</div>
              <button
                onClick={() => save("chords", chords)}
                disabled={saving}
                data-testid="save-chords-btn"
                className="text-xs bg-[#007AFF] hover:bg-blue-500 text-white px-4 py-2 rounded-full accent-glow flex items-center gap-2 disabled:opacity-60"
              >
                <Save size={12} /> {saving ? "Saving…" : "Save"}
              </button>
            </div>
            <textarea
              value={chords}
              onChange={(e) => setChords(e.target.value)}
              onBlur={() => save("chords", chords)}
              data-testid="chords-textarea"
              rows={16}
              className="w-full bg-zinc-950/60 border border-white/[0.06] rounded-xl px-5 py-4 text-lg text-zinc-100 focus:border-[#007AFF] outline-none font-mono leading-loose"
            />
          </div>
        )}

        {tab === "whiteboard" && (
          <div data-testid="whiteboard-panel">
            <div className="flex items-center justify-between mb-4">
              <div className="font-display text-lg">Shared Whiteboard™</div>
              <button
                onClick={addWhiteboardNote}
                data-testid="add-whiteboard-note"
                className="text-xs bg-[#007AFF] hover:bg-blue-500 text-white px-4 py-2 rounded-full accent-glow flex items-center gap-2"
              >
                <Plus size={12} /> Add note
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.whiteboard.map((n) => (
                <div
                  key={n.id}
                  className="glass rounded-2xl p-5"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(24,24,27,0.6))",
                  }}
                >
                  <div className="text-[10px] tracking-overline text-[#F59E0B] mb-2">
                    {n.kind}
                  </div>
                  <div className="text-sm text-zinc-100 leading-relaxed">
                    {n.body}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "assets" && (
          <div className="glass rounded-2xl p-6" data-testid="assets-panel">
            <div className="font-display text-lg mb-4">Shared Assets™</div>
            <div className="divide-y divide-white/[0.05]">
              {assets.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-4 py-3"
                  data-testid={`asset-${a.id}`}
                >
                  <div className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center text-xs font-mono text-zinc-400">
                    {a.kind[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-zinc-100 truncate">
                      {a.name}
                    </div>
                    <div className="text-[11px] font-mono text-zinc-500">
                      {a.kind} · {a.size} · {a.version} · {a.uploaded_by}
                    </div>
                  </div>
                  <button className="text-xs text-zinc-400 hover:text-white">
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
