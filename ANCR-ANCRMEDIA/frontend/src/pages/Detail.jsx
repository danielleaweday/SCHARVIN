import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/lib/api";
import { Play } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { TrackRow, CreatorCard } from "@/components/MediaCards";
import { fmtNum, fmtDuration } from "@/lib/format";

export function PlaylistDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const { play } = usePlayer();
  useEffect(() => { setData(null); api.get(`/playlists/${id}`).then((r) => setData(r.data)); }, [id]);
  if (!data) return <div className="p-16 text-white/40">Loading…</div>;
  const { playlist, tracks } = data;
  return (
    <div className="pb-24" data-testid="playlist-page">
      <section className="relative min-h-[340px] px-8 pt-10 pb-10 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: `url(${playlist.cover})`, backgroundSize: "cover", backgroundPosition: "center", filter: "blur(48px) saturate(1.2)", transform: "scale(1.3)", opacity: 0.5 }} />
        <div className="absolute inset-0 scrim-both" />
        <div className="relative z-10 flex items-end gap-8">
          <img src={playlist.cover} className="w-48 h-48 rounded-2xl object-cover border border-white/10 shadow-[0_20px_60px_-20px_rgba(0,82,255,0.5)]" alt="" />
          <div className="pb-3">
            <div className="text-[10px] tracking-[0.24em] uppercase text-white/60">Playlist · {playlist.kind}</div>
            <h1 className="font-display text-5xl lg:text-6xl font-black tracking-tighter leading-[0.95] mt-3">{playlist.title}</h1>
            <div className="mt-3 text-[13px] text-white/70 max-w-xl">{playlist.description}</div>
            <div className="mt-4 text-[12px] text-white/50">Curated by {playlist.curator_name} · {tracks.length} tracks · {fmtNum(playlist.followers)} followers</div>
            <div className="mt-4 flex items-center gap-3">
              <button data-testid="playlist-play" onClick={() => tracks[0] && play(tracks[0], tracks)} className="inline-flex items-center gap-2 pl-1 pr-5 py-1 rounded-full bg-white text-black text-sm font-medium hover:scale-[1.02] transition-transform">
                <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center"><Play size={13} className="ml-0.5" strokeWidth={2} /></span>
                Play
              </button>
            </div>
          </div>
        </div>
      </section>
      <div className="px-8 grid grid-cols-1 lg:grid-cols-2 gap-x-8">
        {tracks.map((t, i) => <TrackRow key={t.id} track={t} index={i + 1} list={tracks} />)}
      </div>
    </div>
  );
}

export function GenreDetail() {
  const { name } = useParams();
  const [data, setData] = useState(null);
  useEffect(() => { setData(null); api.get(`/genres/${encodeURIComponent(name)}`).then((r) => setData(r.data)); }, [name]);
  if (!data) return <div className="p-16 text-white/40">Loading…</div>;
  return (
    <div className="px-8 py-10 pb-24" data-testid="genre-page">
      <div className="mb-8">
        <div className="text-[10px] tracking-[0.28em] uppercase text-white/50">Genre</div>
        <h1 className="font-display text-5xl font-black tracking-tighter leading-tight mt-2">{data.name}</h1>
      </div>
      <div className="mb-14">
        <div className="text-[11px] uppercase tracking-widest text-white/50 mb-3">Top tracks</div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
          {data.tracks.map((t, i) => <TrackRow key={t.id} track={t} index={i + 1} list={data.tracks} />)}
        </div>
      </div>
      <div>
        <div className="text-[11px] uppercase tracking-widest text-white/50 mb-3">Creators in this genre</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.creators.map((c) => <CreatorCard key={c.id} creator={c} />)}
        </div>
      </div>
    </div>
  );
}
