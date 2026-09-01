import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { AlbumCard, VideoCard, PlaylistCard, TrackRow, SectionHeader, CreatorCard } from "@/components/MediaCards";
import { BRAND } from "@/lib/brand";
import { Sparkles, Download, Clock, Heart, History as HistoryIcon, Star } from "lucide-react";

function ExperienceHero({ variant, title, subtitle }) {
  const isWav = variant === "wav";
  return (
    <section
      className="relative overflow-hidden rounded-[24px] border border-white/[0.06] mx-6 mt-6 py-12 px-8"
      style={{
        background: isWav
          ? "linear-gradient(180deg, rgba(0,82,255,0.14) 0%, rgba(112,0,255,0.10) 60%, #0B0B0D 100%)"
          : "linear-gradient(180deg, rgba(255,140,0,0.14) 0%, rgba(255,59,119,0.10) 60%, #0B0B0D 100%)",
      }}
      data-testid={`hero-${variant}`}
    >
      <div className={`ambient-flow ${variant}`} />
      <div className="absolute inset-0 grain opacity-60" />
      <div className="relative z-10 flex flex-col items-start">
        <img src={isWav ? BRAND.ANCRWAV : BRAND.ANCRVIEW} alt="" className="h-20 md:h-24 w-auto object-contain" />
        <div className="text-[11px] tracking-[0.28em] uppercase text-white/60 mt-6">{subtitle}</div>
        <h1 className="font-display text-4xl md:text-5xl font-black tracking-tighter leading-tight mt-2 max-w-3xl">{title}</h1>
      </div>
    </section>
  );
}

// ---------- ANCRWAV Home ----------
export function WavHome() {
  const [data, setData] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [creators, setCreators] = useState([]);
  useEffect(() => {
    api.get("/home").then((r) => setData(r.data));
    api.get("/playlists?limit=6").then((r) => setPlaylists(r.data));
    api.get("/charts/top-artists?limit=6").then((r) => setCreators(r.data));
  }, []);
  if (!data) return <div className="p-16 text-white/40">Loading…</div>;
  return (
    <div data-testid="wav-home" className="pb-16">
      <ExperienceHero variant="wav" subtitle="ANCRWAV™ · Where Music Lives" title="Every song, album, and session across the CCDP." />
      <div className="px-6 mt-10 space-y-12">
        <section>
          <SectionHeader title="Trending on ANCRWAV" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
            {(data.trending_tracks || []).slice(0, 10).map((t, i) => <TrackRow key={t.id} track={t} index={i + 1} list={data.trending_tracks} />)}
          </div>
        </section>
        <section>
          <SectionHeader title="New releases" action={<Link to="/new-releases" className="text-[12px] text-white/60 hover:text-white">All →</Link>} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
            {(data.new_releases || []).slice(0, 6).map((a) => <AlbumCard key={a.id} album={a} />)}
          </div>
        </section>
        <section>
          <SectionHeader title="Playlists" action={<Link to="/playlists" className="text-[12px] text-white/60 hover:text-white">All →</Link>} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
            {playlists.map((p) => <PlaylistCard key={p.id} playlist={p} />)}
          </div>
        </section>
        <section>
          <SectionHeader title="Top artists" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {creators.slice(0, 6).map((c) => <CreatorCard key={c.id} creator={c} />)}
          </div>
        </section>
      </div>
    </div>
  );
}

// ---------- ANCRVIEW Home ----------
export function ViewHome() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/home").then((r) => setData(r.data)); }, []);
  if (!data) return <div className="p-16 text-white/40">Loading…</div>;
  return (
    <div data-testid="view-home" className="pb-16">
      <ExperienceHero variant="view" subtitle="ANCRVIEW™ · See beyond. Share impact." title="Music videos, masterclasses, films, and live." />
      <div className="px-6 mt-10 space-y-12">
        <section>
          <SectionHeader title="Continue watching" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(data.videos || []).slice(0, 4).map((v) => <VideoCard key={v.id} video={v} />)}
          </div>
        </section>
        <section>
          <SectionHeader title="Fresh drops on ANCRVIEW" action={<Link to="/videos" className="text-[12px] text-white/60 hover:text-white">All →</Link>} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(data.videos || []).slice(4, 12).map((v) => <VideoCard key={v.id} video={v} />)}
          </div>
        </section>
        {data.live_now?.length > 0 && (
          <section>
            <SectionHeader title="Live now" action={<Link to="/live" className="text-[12px] text-white/60 hover:text-white">All →</Link>} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.live_now.slice(0, 3).map((l) => (
                <Link key={l.id} to="/live" className="relative aspect-video rounded-2xl overflow-hidden card-hover border border-white/[0.06]">
                  <img src={l.thumbnail} className="absolute inset-0 w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 scrim-bottom" />
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-red-600 text-[10px] font-bold tracking-widest flex items-center gap-1.5"><span className="live-dot" /> LIVE</div>
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <div className="text-[10px] uppercase tracking-widest text-white/70">{l.category}</div>
                    <div className="font-display text-lg leading-tight">{l.title}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ---------- Featured ----------
export function Featured() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/discover").then((r) => setData(r.data)); }, []);
  if (!data) return <div className="p-16 text-white/40">Loading…</div>;
  return (
    <div className="px-6 py-10 pb-24" data-testid="featured-page">
      <div className="mb-8">
        <div className="text-[10px] tracking-[0.28em] uppercase text-white/50 flex items-center gap-2"><Star size={11} /> Featured on ANCRMEDIA</div>
        <h1 className="font-display text-5xl font-black tracking-tighter leading-tight mt-2">Editors' picks.</h1>
      </div>
      <section className="mb-14">
        <SectionHeader title="Faculty picks" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
          {data.faculty_picks?.map((p) => <PlaylistCard key={p.id} playlist={p} />)}
        </div>
      </section>
      <section className="mb-14">
        <SectionHeader title="Featured releases" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {data.new_releases?.slice(0, 10).map((a) => <AlbumCard key={a.id} album={a} />)}
        </div>
      </section>
      <section>
        <SectionHeader title="Featured on ANCRVIEW" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {data.trending_videos?.map((v) => <VideoCard key={v.id} video={v} />)}
        </div>
      </section>
    </div>
  );
}

// ---------- Originals ----------
export function Originals() {
  return (
    <div className="px-6 py-10 pb-24" data-testid="originals-page">
      <div className="mb-8">
        <div className="text-[10px] tracking-[0.28em] uppercase text-white/50 flex items-center gap-2"><Sparkles size={11} /> ANCR Originals</div>
        <h1 className="font-display text-5xl font-black tracking-tighter leading-tight mt-2">Produced by the network.</h1>
        <p className="text-white/50 mt-3 font-sans-alt text-sm max-w-2xl">Concerts, festivals, documentaries, premieres, and learning media — all produced by CCDP creators for the ANCRMEDIA global audience.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {["Concerts","Festivals","Premieres","Documentaries","Awards","Learning Media","Radio","News","Creator Channels"].map((t, i) => (
          <div key={t} data-testid={`original-${t.toLowerCase()}`} className="relative overflow-hidden rounded-2xl border border-white/[0.06] aspect-[3/2] card-hover"
            style={{
              background:
                i % 3 === 0 ? "linear-gradient(135deg, rgba(0,82,255,0.18), rgba(112,0,255,0.12))"
                : i % 3 === 1 ? "linear-gradient(135deg, rgba(255,140,0,0.18), rgba(255,59,119,0.12))"
                : "linear-gradient(135deg, rgba(112,0,255,0.18), rgba(255,59,119,0.12))",
            }}>
            <div className="absolute inset-0 grain opacity-40" />
            <div className="relative z-10 h-full flex flex-col justify-end p-6">
              <div className="text-[10px] tracking-[0.24em] uppercase text-white/60">ANCR Originals · Reserved</div>
              <div className="font-display text-2xl mt-2 tracking-tight">{t}</div>
              <div className="text-[11px] text-white/50 mt-1">Programming pipeline · 2026</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Library-derived surfaces ----------
function LibrarySurface({ id, title, icon: Icon, kind }) {
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/library").then((r) => setData(r.data)); }, []);
  const items = data?.[kind] || [];
  return (
    <div className="px-6 py-10 pb-24" data-testid={id}>
      <div className="mb-8">
        <div className="text-[10px] tracking-[0.28em] uppercase text-white/50 flex items-center gap-2"><Icon size={11} /> {title}</div>
        <h1 className="font-display text-5xl font-black tracking-tighter leading-tight mt-2">{title}.</h1>
      </div>
      {items.length === 0 && <div className="glass rounded-3xl p-12 text-center text-white/50">Nothing here yet. Save items from around ANCRMEDIA to see them here.</div>}
      {kind === "videos" && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((v) => <VideoCard key={v.id} video={v} />)}
        </div>
      )}
      {kind === "tracks" && items.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
          {items.map((t, i) => <TrackRow key={t.id} track={t} index={i + 1} list={items} />)}
        </div>
      )}
    </div>
  );
}

export const Downloads = () => <LibrarySurface id="downloads-page" title="Downloads" icon={Download} kind="tracks" />;
export const WatchLater = () => <LibrarySurface id="watch-later-page" title="Watch Later" icon={Clock} kind="videos" />;
export const Liked = () => <LibrarySurface id="liked-page" title="Liked" icon={Heart} kind="tracks" />;
export const HistoryPage = () => <LibrarySurface id="history-page" title="History" icon={HistoryIcon} kind="tracks" />;
