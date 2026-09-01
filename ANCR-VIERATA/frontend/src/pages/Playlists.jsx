import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/lib/api";
import { ArrowLeft, ListVideo, Play } from "lucide-react";
import { MediaPlayer, MediaPlaceholder } from "@/components/media/MediaPlayer";

const CATEGORIES = [
  { key: "", label: "All" },
  { key: "workshop", label: "Health workshops" },
  { key: "movement", label: "Movement" },
  { key: "lesson", label: "Lesson companions" },
  { key: "circle", label: "Circle" },
  { key: "general", label: "General" },
];

export default function Playlists() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [detail, setDetail] = useState(null);
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (id) {
      api.get(`/media/playlists/${id}`).then(({ data }) => setDetail(data));
    } else {
      setDetail(null);
      const q = category ? `?category=${category}` : "";
      api.get(`/media/playlists${q}`).then(({ data }) => setItems(data.items));
    }
  }, [id, category]);

  if (id) {
    return (
      <div className="fade-up" data-testid="playlist-detail">
        <button onClick={() => navigate("/playlists")} className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Playlists
        </button>

        {detail ? (
          <>
            <section className="glass rounded-3xl p-6 sm:p-8 mb-6">
              <div className="text-[11px] uppercase tracking-[0.22em] text-viearta-teal">{detail.category}</div>
              <h1 className="font-display text-3xl sm:text-4xl tracking-tight mt-1">{detail.title}</h1>
              {detail.description && <p className="text-white/65 mt-2 max-w-2xl">{detail.description}</p>}
              <div className="mt-3 text-xs text-white/50">{detail.media_count} media item{detail.media_count === 1 ? "" : "s"}</div>
            </section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="playlist-media">
              {detail.media.length === 0 ? <MediaPlaceholder /> : detail.media.map((m) => <MediaPlayer key={m.id} item={m} />)}
            </div>
          </>
        ) : <div className="text-white/50 text-sm">Loading…</div>}
      </div>
    );
  }

  return (
    <div className="fade-up" data-testid="playlists-page">
      <section className="glass rounded-3xl p-6 sm:p-10 mb-6 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-30" style={{ background: "#9333EA" }} />
        <div className="relative">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/45 mb-2">
            <ListVideo className="w-3.5 h-3.5" /> Media playlists
          </div>
          <h1 className="font-display text-4xl sm:text-5xl tracking-tight leading-[1.05]">
            Curated collections of <span className="viearta-gradient">workshops, sessions and exercises.</span>
          </h1>
          <p className="text-white/65 mt-3 max-w-2xl text-sm">Organized by the VIEARTA program team. Open a playlist to watch each item in order.</p>
        </div>
      </section>

      <div className="flex flex-wrap gap-2 mb-4">
        {CATEGORIES.map((c) => (
          <button key={c.key || "all"} onClick={() => setCategory(c.key)} data-testid={`pl-cat-${c.key || "all"}`}
            className={`px-3 py-1.5 rounded-full text-xs border ${category === c.key ? "bg-white/10 border-white/40" : "border-white/10 text-white/55 hover:text-white/85"}`}>{c.label}</button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="glass rounded-3xl p-8 text-center text-white/60" data-testid="playlists-empty">
          <ListVideo className="w-6 h-6 mx-auto mb-2 opacity-60" />
          No playlists yet. Your VIEARTA program team will publish curated collections here.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="playlists-grid">
          {items.map((p) => (
            <button key={p.id} onClick={() => navigate(`/playlists/${p.id}`)} data-testid={`playlist-${p.id}`}
              className="text-left glass rounded-3xl p-6 glass-hover">
              <div className="text-[11px] uppercase tracking-[0.22em] text-viearta-teal">{p.category}</div>
              <h3 className="font-display text-xl mt-1">{p.title}</h3>
              {p.description && <p className="text-white/60 text-sm mt-1 line-clamp-2">{p.description}</p>}
              <div className="mt-3 text-xs text-white/50 inline-flex items-center gap-2">
                <Play className="w-3.5 h-3.5" /> {p.media_count} item{p.media_count === 1 ? "" : "s"}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
