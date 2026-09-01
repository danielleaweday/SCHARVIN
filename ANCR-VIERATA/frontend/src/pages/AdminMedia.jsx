import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
import { FileVideo, Plus, Trash2, Loader2, Video, Music, ExternalLink, ListVideo, X } from "lucide-react";
import { MediaPlayer } from "@/components/media/MediaPlayer";

const CATEGORIES = [
  { key: "workshop", label: "Health workshop" },
  { key: "movement", label: "Movement / exercise" },
  { key: "lesson", label: "Lesson companion" },
  { key: "circle", label: "Circle event" },
  { key: "general", label: "General" },
];

const empty = {
  title: "", description: "", url: "",
  media_type: "video", category: "workshop", tags: [],
  linked_lesson_id: "", linked_movement_id: "", linked_circle_id: "",
};

export default function AdminMedia() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState([]);
  const [movements, setMovements] = useState([]);
  const [circles, setCircles] = useState([]);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("");
  const [playlists, setPlaylists] = useState([]);
  const [plTitle, setPlTitle] = useState("");
  const [plCat, setPlCat] = useState("workshop");
  const [plDesc, setPlDesc] = useState("");
  const [plSaving, setPlSaving] = useState(false);

  const loadPlaylists = () => api.get("/media/playlists").then(({ data }) => setPlaylists(data.items));

  useEffect(() => { if (user?.role === "admin") loadPlaylists(); }, [user]);

  const load = () => {
    api.get("/media").then(({ data }) => setItems(data.items));
    api.get("/lifestyle/movement/activities").then(({ data }) => setMovements(data.items));
    api.get("/circles").then(({ data }) => setCircles(data.items));
  };
  useEffect(() => { if (user?.role === "admin") load(); }, [user]);

  if (loading) return null;
  if (user?.role !== "admin") return <Navigate to="/" replace />;

  const save = async () => {
    if (!form.title.trim() || !form.url.trim()) { toast.message("Title and URL are required"); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        url: form.url.trim(),
        media_type: form.media_type,
        category: form.category,
        tags: form.tags,
        linked_lesson_id: form.linked_lesson_id || null,
        linked_movement_id: form.linked_movement_id || null,
        linked_circle_id: form.linked_circle_id || null,
      };
      await api.post("/media", payload);
      toast.success("Media added");
      setForm(empty);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.detail?.[0]?.msg || "Couldn't add media");
    } finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!window.confirm("Remove this media item?")) return;
    try { await api.delete(`/media/${id}`); load(); toast.success("Removed"); }
    catch { toast.error("Couldn't remove"); }
  };

  const filtered = items.filter((it) =>
    !filter || it.title.toLowerCase().includes(filter.toLowerCase()) ||
    (it.category || "").toLowerCase().includes(filter.toLowerCase())
  );

  const createPlaylist = async () => {
    if (!plTitle.trim()) { toast.message("Playlist title required"); return; }
    setPlSaving(true);
    try {
      await api.post("/media/playlists", { title: plTitle.trim(), category: plCat, description: plDesc.trim() || null, media_ids: [] });
      setPlTitle(""); setPlDesc("");
      toast.success("Playlist created");
      loadPlaylists();
    } catch { toast.error("Couldn't create playlist"); } finally { setPlSaving(false); }
  };

  const addToPlaylist = async (playlistId, mediaId) => {
    try { await api.post(`/media/playlists/${playlistId}/add`, { media_id: mediaId }); loadPlaylists(); toast.success("Added"); }
    catch { toast.error("Couldn't add"); }
  };

  const removeFromPlaylist = async (playlistId, mediaId) => {
    try { await api.post(`/media/playlists/${playlistId}/remove`, { media_id: mediaId }); loadPlaylists(); }
    catch { toast.error("Couldn't remove"); }
  };

  const deletePlaylist = async (playlistId) => {
    if (!window.confirm("Delete this playlist?")) return;
    try { await api.delete(`/media/playlists/${playlistId}`); loadPlaylists(); toast.success("Deleted"); }
    catch { toast.error("Couldn't delete"); }
  };

  return (
    <div className="fade-up" data-testid="admin-media">
      <section className="glass rounded-3xl p-6 sm:p-8 mb-6 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-30" style={{ background: "#9333EA" }} />
        <div className="relative">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/45 mb-2">
            <FileVideo className="w-3.5 h-3.5" /> Admin · Media library
          </div>
          <h1 className="font-display text-3xl tracking-tight">Videos, workshops & exercise media</h1>
          <p className="text-white/60 text-sm mt-2 max-w-2xl">Paste YouTube, Vimeo, or direct MP4/MP3 URLs. Link a media item to a lesson, a movement activity, or a Wellness Circle so it appears exactly where students need it.</p>
        </div>
      </section>

      <section className="glass rounded-3xl p-6 sm:p-8 mb-6">
        <h2 className="font-display text-2xl mb-4 inline-flex items-center gap-2"><Plus className="w-5 h-5 text-viearta-teal" /> Add media</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 block md:col-span-2">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/45">Title</div>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              data-testid="media-title"
              placeholder="e.g. Group Warm-Up · Full-body Mobility"
              className="w-full bg-transparent outline-none mt-1" />
          </label>

          <label className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 block md:col-span-2">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/45">Media URL</div>
            <input value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              data-testid="media-url"
              placeholder="YouTube, Vimeo, or direct .mp4 / .mp3 URL"
              className="w-full bg-transparent outline-none mt-1" />
          </label>

          <label className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 block">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/45">Category</div>
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              data-testid="media-category"
              className="w-full bg-transparent outline-none mt-1 text-white">
              {CATEGORIES.map((c) => <option key={c.key} value={c.key} className="bg-[#0a0a0a]">{c.label}</option>)}
            </select>
          </label>

          <label className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 block">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/45">Media type</div>
            <select value={form.media_type} onChange={(e) => setForm((f) => ({ ...f, media_type: e.target.value }))}
              data-testid="media-type"
              className="w-full bg-transparent outline-none mt-1 text-white">
              <option value="video" className="bg-[#0a0a0a]">Video</option>
              <option value="audio" className="bg-[#0a0a0a]">Audio</option>
            </select>
          </label>

          <label className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 block">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/45">Link to movement activity (optional)</div>
            <select value={form.linked_movement_id} onChange={(e) => setForm((f) => ({ ...f, linked_movement_id: e.target.value }))}
              data-testid="media-link-movement"
              className="w-full bg-transparent outline-none mt-1 text-white">
              <option value="" className="bg-[#0a0a0a]">— none —</option>
              {movements.map((m) => <option key={m.id} value={m.id} className="bg-[#0a0a0a]">{m.title}</option>)}
            </select>
          </label>

          <label className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 block">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/45">Link to Wellness Circle (optional)</div>
            <select value={form.linked_circle_id} onChange={(e) => setForm((f) => ({ ...f, linked_circle_id: e.target.value }))}
              data-testid="media-link-circle"
              className="w-full bg-transparent outline-none mt-1 text-white">
              <option value="" className="bg-[#0a0a0a]">— none —</option>
              {circles.map((c) => <option key={c.id} value={c.id} className="bg-[#0a0a0a]">{c.title}</option>)}
            </select>
          </label>

          <label className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 block md:col-span-2">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/45">Link to lesson id (optional)</div>
            <input value={form.linked_lesson_id} onChange={(e) => setForm((f) => ({ ...f, linked_lesson_id: e.target.value }))}
              data-testid="media-link-lesson"
              placeholder="e.g. ls_vocal_hydro"
              className="w-full bg-transparent outline-none mt-1" />
          </label>

          <label className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 block md:col-span-2">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/45">Description</div>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              data-testid="media-description"
              className="w-full bg-transparent outline-none mt-1 resize-none" />
          </label>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={save} disabled={saving} data-testid="media-save"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm bg-white text-black hover:bg-white/90 disabled:opacity-60">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Add to library
          </button>
        </div>
      </section>

      <section className="glass rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="font-display text-2xl">Library ({items.length})</h2>
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter…"
            data-testid="media-filter"
            className="bg-white/[0.03] border border-white/10 rounded-full px-4 py-2 text-sm placeholder:text-white/30 outline-none" />
        </div>
        {filtered.length === 0 ? (
          <div className="text-white/50 text-sm py-6 text-center border border-dashed border-white/10 rounded-2xl">
            No media yet. Add your first item above.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" data-testid="media-list">
            {filtered.map((m) => (
              <div key={m.id} data-testid={`media-item-${m.id}`}>
                <MediaPlayer item={m} compact />
                <div className="mt-2 flex items-center justify-between text-xs">
                  <div className="text-white/45">
                    {m.category} · {m.source || "external"}
                    {m.linked_movement_id && <> · movement: <span className="font-mono">{m.linked_movement_id}</span></>}
                    {m.linked_lesson_id && <> · lesson: <span className="font-mono">{m.linked_lesson_id}</span></>}
                    {m.linked_circle_id && <> · circle</>}
                  </div>
                  <button onClick={() => remove(m.id)} className="text-white/40 hover:text-white/80" title="Remove"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="glass rounded-3xl p-6 sm:p-8 mt-6" data-testid="admin-playlists">
        <h2 className="font-display text-2xl mb-3 inline-flex items-center gap-2"><ListVideo className="w-5 h-5 text-viearta-teal" /> Playlists</h2>
        <p className="text-white/60 text-sm mb-4">Organize media into structured collections. Students browse them at <span className="font-mono">/playlists</span>.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
          <input value={plTitle} onChange={(e) => setPlTitle(e.target.value)} placeholder="Playlist title" data-testid="pl-title"
            className="bg-white/[0.03] border border-white/10 rounded-full px-4 py-2 text-sm placeholder:text-white/30 outline-none" />
          <select value={plCat} onChange={(e) => setPlCat(e.target.value)} data-testid="pl-category"
            className="bg-white/[0.03] border border-white/10 rounded-full px-4 py-2 text-sm text-white outline-none">
            {CATEGORIES.map((c) => <option key={c.key} value={c.key} className="bg-[#0a0a0a]">{c.label}</option>)}
          </select>
          <button onClick={createPlaylist} disabled={plSaving} data-testid="pl-create"
            className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm bg-white text-black hover:bg-white/90 disabled:opacity-60">
            {plSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create playlist
          </button>
        </div>
        <input value={plDesc} onChange={(e) => setPlDesc(e.target.value)} placeholder="Optional description"
          className="w-full bg-white/[0.03] border border-white/10 rounded-full px-4 py-2 text-sm placeholder:text-white/30 outline-none mb-4" />
        {playlists.length === 0 ? (
          <div className="text-white/50 text-sm py-4 text-center border border-dashed border-white/10 rounded-2xl">No playlists yet.</div>
        ) : (
          <ul className="space-y-3" data-testid="pl-list">
            {playlists.map((p) => (
              <li key={p.id} data-testid={`pl-${p.id}`} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.22em] text-viearta-teal">{p.category}</div>
                    <div className="font-display text-lg">{p.title}</div>
                    <div className="text-xs text-white/50">{p.media_count} item{p.media_count === 1 ? "" : "s"}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <select onChange={(e) => { if (e.target.value) { addToPlaylist(p.id, e.target.value); e.target.value = ""; } }}
                      data-testid={`pl-add-${p.id}`}
                      className="bg-white/[0.03] border border-white/10 rounded-full px-3 py-1.5 text-xs text-white outline-none">
                      <option value="" className="bg-[#0a0a0a]">+ Add media…</option>
                      {items.filter((it) => !(p.media_ids || []).includes(it.id)).map((it) => (
                        <option key={it.id} value={it.id} className="bg-[#0a0a0a]">{it.title}</option>
                      ))}
                    </select>
                    <button onClick={() => deletePlaylist(p.id)} className="text-white/40 hover:text-white/80" title="Delete playlist"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                {p.media.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {p.media.map((m) => (
                      <li key={m.id} className="inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full border border-white/10">
                        <span className="text-white/75 truncate max-w-[220px]">{m.title}</span>
                        <button onClick={() => removeFromPlaylist(p.id, m.id)} className="text-white/40 hover:text-white/80"><X className="w-3 h-3" /></button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
