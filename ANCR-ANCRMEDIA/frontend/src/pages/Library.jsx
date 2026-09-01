import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { AlbumCard, VideoCard, PlaylistCard, TrackRow, CreatorCard, SectionHeader } from "@/components/MediaCards";
import { Bookmark, Heart, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function Library() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/library").then((r) => setData(r.data)); }, []);
  if (!user) {
    return (
      <div className="p-16 text-center" data-testid="library-page">
        <Bookmark size={28} className="mx-auto text-white/40 mb-4" />
        <div className="text-white/60">Sign in to save tracks, videos, and creators.</div>
        <Link to="/login" className="mt-6 inline-block px-5 py-2 rounded-full bg-white text-black text-sm font-medium">Sign in</Link>
      </div>
    );
  }
  const empty = data && Object.values(data).every((v) => v.length === 0);
  return (
    <div className="px-8 py-10 pb-24" data-testid="library-page">
      <div className="mb-8">
        <div className="text-[10px] tracking-[0.28em] uppercase text-white/50">Library</div>
        <h1 className="font-display text-5xl font-black tracking-tighter leading-tight mt-2">Your ANCRMEDIA.</h1>
        <p className="text-white/50 mt-2 font-sans-alt text-sm">Everything you've liked, saved, and followed.</p>
      </div>
      {empty && (
        <div className="glass rounded-3xl p-12 text-center">
          <Sparkles size={22} className="mx-auto text-white/40 mb-3" />
          <div className="text-white/60">You haven't saved anything yet.</div>
          <Link to="/discover" className="mt-6 inline-block px-5 py-2 rounded-full bg-white text-black text-sm font-medium">Start discovering</Link>
        </div>
      )}
      {data?.tracks?.length > 0 && (
        <section className="mb-12">
          <SectionHeader title="Liked tracks" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
            {data.tracks.map((t, i) => <TrackRow key={t.id} track={t} index={i + 1} list={data.tracks} />)}
          </div>
        </section>
      )}
      {data?.albums?.length > 0 && (
        <section className="mb-12">
          <SectionHeader title="Saved albums" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {data.albums.map((a) => <AlbumCard key={a.id} album={a} />)}
          </div>
        </section>
      )}
      {data?.videos?.length > 0 && (
        <section className="mb-12">
          <SectionHeader title="Watch later" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {data.videos.map((v) => <VideoCard key={v.id} video={v} />)}
          </div>
        </section>
      )}
      {data?.playlists?.length > 0 && (
        <section className="mb-12">
          <SectionHeader title="Followed playlists" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {data.playlists.map((p) => <PlaylistCard key={p.id} playlist={p} />)}
          </div>
        </section>
      )}
      {data?.creators?.length > 0 && (
        <section>
          <SectionHeader title="Following" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.creators.map((c) => <CreatorCard key={c.id} creator={c} />)}
          </div>
        </section>
      )}
    </div>
  );
}
