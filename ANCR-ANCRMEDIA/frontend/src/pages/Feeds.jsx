import { useEffect, useState } from "react";
import api from "@/lib/api";
import { AlbumCard, VideoCard, TrackRow, PlaylistCard, CreatorCard, SectionHeader } from "@/components/MediaCards";
import { TrendingUp, Sparkles, Trophy, Video as VideoIcon, ListMusic, Music4 } from "lucide-react";
import { Link } from "react-router-dom";
import { fmtNum } from "@/lib/format";
import { BRAND } from "@/lib/brand";

// ---------- Discover ----------
export function Discover() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/discover").then((r) => setData(r.data)); }, []);
  if (!data) return <div className="p-16 text-white/40">Loading…</div>;
  return (
    <div className="px-8 py-10 pb-24 space-y-14" data-testid="discover-page">
      <div>
        <div className="text-[10px] tracking-[0.28em] uppercase text-white/50">Discover</div>
        <h1 className="font-display text-5xl font-black tracking-tighter leading-tight mt-2">Made for you. Made by peers.</h1>
        <p className="text-white/50 mt-2 max-w-2xl font-sans-alt text-sm">Recommendations pulled from your courses, listening history, collaborations, and the global CCDP graph.</p>
      </div>
      <section>
        <SectionHeader title="Trending tracks" action={<Link to="/trending" className="text-[12px] text-white/60 hover:text-white flex items-center gap-1">See charts <TrendingUp size={12} /></Link>} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
          {data.trending_tracks.slice(0, 10).map((t, i) => <TrackRow key={t.id} track={t} index={i + 1} list={data.trending_tracks} />)}
        </div>
      </section>
      <section>
        <SectionHeader title="Faculty picks" subtitle="Curated by faculty across all CCDP schools" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
          {data.faculty_picks.map((p) => <PlaylistCard key={p.id} playlist={p} />)}
        </div>
      </section>
      <section>
        <SectionHeader title="Fresh releases" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {data.new_releases.slice(0, 10).map((a) => <AlbumCard key={a.id} album={a} />)}
        </div>
      </section>
      <section>
        <SectionHeader title="Institutions to explore" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {data.institutions.map((i) => (
            <Link key={i.id} to={`/schools/${i.id}`} data-testid={`disc-school-${i.id}`} className="glass rounded-xl p-4 hover:bg-white/[0.05] transition-colors">
              <div className="text-2xl">{i.flag}</div>
              <div className="font-display text-sm mt-2 line-clamp-2">{i.name}</div>
              <div className="text-[10px] text-white/50 mt-1">{i.city}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

// ---------- Trending / Charts ----------
export function Trending() {
  const [tab, setTab] = useState("songs");
  const [items, setItems] = useState([]);
  useEffect(() => {
    const map = { songs: "/charts/top-songs", videos: "/charts/top-videos", schools: "/charts/top-schools", producers: "/charts/top-producers", artists: "/charts/top-artists" };
    api.get(map[tab]).then((r) => setItems(r.data));
  }, [tab]);
  const tabs = [
    { k: "songs", label: "Top Songs" },
    { k: "videos", label: "Top Videos" },
    { k: "artists", label: "Top Artists" },
    { k: "producers", label: "Top Producers" },
    { k: "schools", label: "Top Schools" },
  ];
  const logo = tab === "videos" ? BRAND.ANCRVIEW : BRAND.ANCRWAV;
  return (
    <div className="px-8 py-10 pb-24" data-testid="trending-page">
      <div className="mb-6">
        <img src={logo} alt="" className="h-12 w-auto object-contain mb-4 opacity-90" data-testid="trending-experience-logo" />
        <div className="text-[10px] tracking-[0.28em] uppercase text-white/50">Global Charts · Week of Feb 26</div>
        <h1 className="font-display text-5xl font-black tracking-tighter leading-tight mt-2">Trending on the network.</h1>
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((t) => (
          <button key={t.k} data-testid={`chart-tab-${t.k}`} onClick={() => setTab(t.k)}
            className={`px-4 py-2 rounded-full text-[12px] font-sans-alt transition-colors ${tab === t.k ? "bg-white text-black" : "glass glass-hover"}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "songs" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
          {items.map((t, i) => <TrackRow key={t.id} track={t} index={i + 1} list={items} />)}
        </div>
      )}
      {tab === "videos" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((v) => <VideoCard key={v.id} video={v} />)}
        </div>
      )}
      {(tab === "artists" || tab === "producers") && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((c) => <CreatorCard key={c.id} creator={c} />)}
        </div>
      )}
      {tab === "schools" && (
        <div className="space-y-2" data-testid="chart-schools-list">
          {items.map((s, i) => (
            <Link key={s.id} to={`/schools/${s.id}`} className="glass glass-hover rounded-2xl p-5 flex items-center gap-5">
              <div className="w-8 text-center font-display text-2xl text-white/60 tabular-nums">{i + 1}</div>
              <img src={s.cover} alt="" className="w-16 h-16 rounded-xl object-cover" />
              <div className="flex-1">
                <div className="font-display text-lg">{s.name}</div>
                <div className="text-[11px] text-white/50">{s.flag} {s.city} · {s.creator_count} creators</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-widest text-white/40">Streams</div>
                <div className="font-display text-xl gradient-text tabular-nums">{fmtNum(s.total_streams)}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- New releases (simple) ----------
export function NewReleases() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/albums?limit=40").then((r) => setItems(r.data)); }, []);
  return (
    <div className="px-8 py-10 pb-24" data-testid="new-releases-page">
      <div className="mb-8">
        <div className="text-[10px] tracking-[0.28em] uppercase text-white/50">New releases</div>
        <h1 className="font-display text-5xl font-black tracking-tighter leading-tight mt-2">Fresh from the CCDP.</h1>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
        {items.map((a) => <AlbumCard key={a.id} album={a} />)}
      </div>
    </div>
  );
}

// ---------- Videos ----------
export function Videos() {
  const [items, setItems] = useState([]);
  const [kind, setKind] = useState("");
  useEffect(() => {
    const q = kind ? `?kind=${encodeURIComponent(kind)}` : "";
    api.get(`/videos${q}`).then((r) => setItems(r.data));
  }, [kind]);
  const kinds = ["", "Music Video", "Live Performance", "Masterclass", "Podcast", "Short Film", "Documentary", "Interview", "Behind The Scenes", "Capstone Project"];
  return (
    <div className="px-8 py-10 pb-24" data-testid="videos-page">
      <div className="mb-6">
        <img src={BRAND.ANCRVIEW} alt="ANCRVIEW" className="h-16 w-auto object-contain mb-4" data-testid="videos-ancrview-logo" />
        <div className="text-[10px] tracking-[0.28em] uppercase text-white/50">Video Network · The Broadcast Home of CCDP</div>
        <h1 className="font-display text-5xl font-black tracking-tighter leading-tight mt-2">See beyond. Share impact.</h1>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {kinds.map((k) => (
          <button key={k || "all"} data-testid={`video-kind-${k || "all"}`} onClick={() => setKind(k)}
            className={`px-3 py-1.5 rounded-full text-[11.5px] font-sans-alt transition-colors ${kind === k ? "bg-white text-black" : "glass glass-hover"}`}>
            {k || "All"}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {items.map((v) => <VideoCard key={v.id} video={v} />)}
      </div>
    </div>
  );
}

// ---------- Live ----------
export function Live() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/livestreams").then((r) => setItems(r.data)); }, []);
  const liveNow = items.filter((l) => l.is_live_now);
  const upcoming = items.filter((l) => !l.is_live_now);
  return (
    <div className="px-8 py-10 pb-24" data-testid="live-page">
      <div className="mb-8">
        <div className="text-[10px] tracking-[0.28em] uppercase text-white/50 flex items-center gap-2"><span className="live-dot" /> Live</div>
        <h1 className="font-display text-5xl font-black tracking-tighter leading-tight mt-2">Broadcasts across the CCDP.</h1>
      </div>
      {liveNow.length > 0 && (
        <section className="mb-12" data-testid="live-now-section">
          <SectionHeader title="Live right now" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {liveNow.map((l) => (
              <div key={l.id} className="relative aspect-video rounded-2xl overflow-hidden card-hover border border-white/[0.06]">
                <img src={l.thumbnail} className="absolute inset-0 w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 scrim-bottom" />
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-600 text-[10px] font-bold tracking-widest">
                  <span className="live-dot" /> LIVE · {fmtNum(l.viewers_now)}
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="text-[10px] uppercase tracking-widest text-white/70">{l.category} · {l.institution_name}</div>
                  <div className="font-display text-2xl leading-tight mt-1">{l.title}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      <section data-testid="live-upcoming-section">
        <SectionHeader title="Upcoming broadcasts" subtitle="Concerts, writing camps, masterclasses, and graduations" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcoming.map((l) => (
            <div key={l.id} className="glass rounded-2xl overflow-hidden card-hover">
              <img src={l.thumbnail} className="w-full aspect-video object-cover" alt="" />
              <div className="p-4">
                <div className="text-[10px] uppercase tracking-widest text-white/50">{l.category}</div>
                <div className="font-display text-lg mt-1">{l.title}</div>
                <div className="text-[11px] text-white/50 mt-1">{l.institution_name}</div>
                <div className="text-[11px] gradient-text mt-2 font-medium">{new Date(l.starts_at).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ---------- Playlists ----------
export function Playlists() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/playlists").then((r) => setItems(r.data)); }, []);
  return (
    <div className="px-8 py-10 pb-24" data-testid="playlists-page">
      <div className="mb-8">
        <div className="text-[10px] tracking-[0.28em] uppercase text-white/50">Playlists</div>
        <h1 className="font-display text-5xl font-black tracking-tighter leading-tight mt-2">Curated collections.</h1>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
        {items.map((p) => <PlaylistCard key={p.id} playlist={p} />)}
      </div>
    </div>
  );
}

// ---------- Genres ----------
export function Genres() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/genres").then((r) => setItems(r.data)); }, []);
  const palette = ["#0052FF", "#7000FF", "#FF6B00", "#00C2FF", "#FF3B77", "#3EE3B2", "#FFD166", "#8A8AFF"];
  return (
    <div className="px-8 py-10 pb-24" data-testid="genres-page">
      <div className="mb-8">
        <div className="text-[10px] tracking-[0.28em] uppercase text-white/50">Genres</div>
        <h1 className="font-display text-5xl font-black tracking-tighter leading-tight mt-2">By sound.</h1>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((g, i) => (
          <Link key={g.name} to={`/genres/${encodeURIComponent(g.name)}`} className="relative aspect-[3/2] rounded-2xl overflow-hidden card-hover border border-white/[0.06] flex items-end p-5" style={{ background: `linear-gradient(135deg, ${palette[i % palette.length]}44, #0A0A0A 90%)` }}>
            <div>
              <Music4 size={16} className="mb-2 text-white/70" strokeWidth={1.6} />
              <div className="font-display text-2xl tracking-tight leading-tight">{g.name}</div>
              <div className="text-[11px] text-white/50 mt-1">{g.track_count} tracks</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ---------- Challenges ----------
export function Challenges() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/challenges").then((r) => setItems(r.data)); }, []);
  return (
    <div className="px-8 py-10 pb-24" data-testid="challenges-page">
      <div className="mb-8">
        <div className="text-[10px] tracking-[0.28em] uppercase text-white/50 flex items-center gap-2"><Trophy size={11} /> Creative Challenges · February</div>
        <h1 className="font-display text-5xl font-black tracking-tighter leading-tight mt-2">Compete. Collaborate. Get featured.</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((c) => (
          <div key={c.id} className="relative overflow-hidden rounded-2xl border border-white/[0.06] card-hover" data-testid={`challenge-${c.id}`}>
            <img src={c.cover} className="absolute inset-0 w-full h-full object-cover" alt="" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,10,10,0.15) 0%, rgba(10,10,10,0.85) 65%, #0A0A0A 100%)" }} />
            <div className="relative z-10 p-6 min-h-[240px] flex flex-col justify-end">
              <div className="text-[10px] uppercase tracking-widest text-white/60">{c.kind} · Sponsor: {c.sponsor}</div>
              <div className="font-display text-2xl mt-2 tracking-tight leading-tight">{c.title}</div>
              <div className="text-[13px] text-white/70 mt-2 font-sans-alt max-w-lg">{c.description}</div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-white/70">
                <span className="px-2 py-1 rounded-md glass">Prize: {c.prize}</span>
                <span className="text-white/50">Deadline: {new Date(c.deadline).toLocaleDateString()}</span>
                <span className="text-white/50">·</span>
                <span>{fmtNum(c.submissions)} submissions</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Events ----------
export function Events() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/events").then((r) => setItems(r.data)); }, []);
  return (
    <div className="px-8 py-10 pb-24" data-testid="events-page">
      <div className="mb-8">
        <div className="text-[10px] tracking-[0.28em] uppercase text-white/50">Ecosystem events</div>
        <h1 className="font-display text-5xl font-black tracking-tighter leading-tight mt-2">Where the community meets.</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((e) => (
          <div key={e.id} className="glass rounded-2xl overflow-hidden card-hover">
            <img src={e.cover} className="w-full aspect-[4/3] object-cover" alt="" />
            <div className="p-5">
              <div className="text-[10px] uppercase tracking-widest text-white/50">{e.kind}</div>
              <div className="font-display text-lg mt-1">{e.title}</div>
              <div className="text-[11px] text-white/60 mt-2">{e.institution_name} · {e.city}, {e.country}</div>
              <div className="text-[12px] gradient-text mt-2">{new Date(e.starts_at).toLocaleString()}</div>
              <div className="text-[10px] text-white/50 mt-1">{fmtNum(e.rsvp_count)} RSVPs</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Podcasts ----------
export function Podcasts() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/podcasts").then((r) => setItems(r.data)); }, []);
  return (
    <div className="px-8 py-10 pb-24" data-testid="podcasts-page">
      <div className="mb-8">
        <div className="text-[10px] tracking-[0.28em] uppercase text-white/50">Podcasts</div>
        <h1 className="font-display text-5xl font-black tracking-tighter leading-tight mt-2">Voices of the CCDP.</h1>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
        {items.map((p) => (
          <div key={p.id} className="card-hover" data-testid={`podcast-${p.id}`}>
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/[0.06]">
              <img src={p.cover} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="mt-3">
              <div className="font-display text-sm">{p.title}</div>
              <div className="text-[11px] text-white/50">{p.host_name} · {p.episodes} eps</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
