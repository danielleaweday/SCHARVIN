import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "@/lib/api";
import { AlbumCard, VideoCard, PlaylistCard, CreatorCard, TrackRow, SectionHeader } from "@/components/MediaCards";

export default function Search() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const [term, setTerm] = useState(q);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!q) { setData(null); return; }
    api.get(`/search?q=${encodeURIComponent(q)}`).then((r) => setData(r.data));
  }, [q]);

  const submit = (e) => { e.preventDefault(); if (term.trim()) setParams({ q: term.trim() }); };

  return (
    <div className="px-8 py-10 pb-24" data-testid="search-page">
      <form onSubmit={submit} className="max-w-2xl">
        <div className="text-[10px] tracking-[0.28em] uppercase text-white/50 mb-3">Search ANCRMEDIA</div>
        <input
          data-testid="search-input"
          autoFocus
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search creators, songs, videos, institutions…"
          className="w-full px-5 py-4 rounded-2xl glass border border-white/[0.08] text-lg font-display"
        />
      </form>
      {!q && <div className="mt-16 text-white/40 text-center">Try “Berklee”, “Kingston”, “neo-soul”, or a creator name.</div>}
      {data && (
        <div className="mt-10 space-y-14">
          {data.creators?.length > 0 && (
            <section>
              <SectionHeader title={`Creators (${data.creators.length})`} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.creators.map((c) => <CreatorCard key={c.id} creator={c} />)}
              </div>
            </section>
          )}
          {data.tracks?.length > 0 && (
            <section>
              <SectionHeader title={`Tracks (${data.tracks.length})`} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
                {data.tracks.map((t, i) => <TrackRow key={t.id} track={t} index={i + 1} list={data.tracks} />)}
              </div>
            </section>
          )}
          {data.albums?.length > 0 && (
            <section>
              <SectionHeader title={`Albums (${data.albums.length})`} />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
                {data.albums.map((a) => <AlbumCard key={a.id} album={a} />)}
              </div>
            </section>
          )}
          {data.videos?.length > 0 && (
            <section>
              <SectionHeader title={`Videos (${data.videos.length})`} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {data.videos.map((v) => <VideoCard key={v.id} video={v} />)}
              </div>
            </section>
          )}
          {data.institutions?.length > 0 && (
            <section>
              <SectionHeader title={`Institutions (${data.institutions.length})`} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.institutions.map((i) => (
                  <Link key={i.id} to={`/schools/${i.id}`} className="glass rounded-2xl p-4 flex items-center gap-3 hover:bg-white/[0.05]">
                    <div className="text-3xl">{i.flag}</div>
                    <div>
                      <div className="font-display text-sm">{i.name}</div>
                      <div className="text-[11px] text-white/50">{i.city}, {i.country}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
          {data.playlists?.length > 0 && (
            <section>
              <SectionHeader title={`Playlists (${data.playlists.length})`} />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
                {data.playlists.map((p) => <PlaylistCard key={p.id} playlist={p} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
