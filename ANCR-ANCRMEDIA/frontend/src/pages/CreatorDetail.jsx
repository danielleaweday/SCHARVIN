import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/lib/api";
import { ShieldCheck, MapPin, Users, TrendingUp, Play } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { AlbumCard, VideoCard, TrackRow, SectionHeader } from "@/components/MediaCards";
import { fmtNum } from "@/lib/format";

export default function CreatorDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("music");
  const { play } = usePlayer();

  useEffect(() => {
    setData(null);
    api.get(`/creators/${id}`).then((r) => setData(r.data));
  }, [id]);

  if (!data) return <div className="p-16 text-white/40">Loading…</div>;
  const { creator, albums, videos, top_tracks } = data;

  return (
    <div data-testid="creator-page" className="pb-16">
      {/* Editorial cover */}
      <section className="relative h-[420px] overflow-hidden">
        <img src={creator.cover} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
        <div className="absolute inset-0 grain" />
      </section>

      {/* Profile card */}
      <div className="relative -mt-40 px-8 z-10">
        <div className="max-w-6xl">
          <div className="glass-strong rounded-3xl p-8 flex flex-col md:flex-row md:items-end gap-6">
            <img src={creator.avatar} alt={creator.name} className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover border border-white/10" />
            <div className="flex-1">
              <div className="text-[10px] tracking-[0.24em] uppercase text-white/50 flex items-center gap-2">
                <ShieldCheck size={11} className="text-[#0052FF]" /> Verified via ANCRID · {creator.role.toUpperCase()}
              </div>
              <h1 className="font-display text-4xl lg:text-5xl font-black tracking-tighter leading-tight mt-2">{creator.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-white/60">
                <span className="flex items-center gap-1"><MapPin size={11} />{creator.flag} {creator.city}, {creator.country}</span>
                <span className="text-white/30">·</span>
                <Link to={`/schools/${creator.institution_id}`} className="hover:text-white">{creator.institution_name}</Link>
                <span className="text-white/30">·</span>
                <span>{creator.discipline}</span>
                <span className="text-white/30">·</span>
                <span>Cohort {creator.cohort}</span>
              </div>
              <p className="mt-4 text-[14px] text-white/70 font-sans-alt max-w-2xl">{creator.bio}</p>
            </div>
            <div className="grid grid-cols-3 gap-6 md:min-w-[280px]">
              <Stat label="Followers" value={fmtNum(creator.followers)} />
              <Stat label="Following" value={fmtNum(creator.following)} />
              <Stat label="/mo Listeners" value={fmtNum(creator.monthly_listeners)} />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              data-testid="creator-play-top"
              onClick={() => top_tracks?.[0] && play(top_tracks[0], top_tracks)}
              className="inline-flex items-center gap-2 pl-1 pr-5 py-1 rounded-full bg-white text-black text-sm font-medium hover:scale-[1.02] transition-transform"
              disabled={!top_tracks?.length}
            >
              <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center"><Play size={13} className="ml-0.5" strokeWidth={2} /></span>
              Play Top Tracks
            </button>
            <button data-testid="creator-follow" className="px-5 py-2 rounded-full glass glass-hover text-sm">Follow</button>
            <div className="ml-auto flex items-center gap-2">
              <TabBtn active={tab === "music"} onClick={() => setTab("music")} label="Music" testid="creator-tab-music" />
              <TabBtn active={tab === "video"} onClick={() => setTab("video")} label="Video" testid="creator-tab-video" />
              <TabBtn active={tab === "about"} onClick={() => setTab("about")} label="About" testid="creator-tab-about" />
            </div>
          </div>

          {tab === "music" && (
            <div className="mt-10 space-y-12" data-testid="creator-music-tab">
              <section>
                <SectionHeader title="Top tracks" subtitle="Most streamed across ANCRWAV" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
                  {top_tracks.slice(0, 8).map((t, i) => (
                    <TrackRow key={t.id} track={t} index={i + 1} list={top_tracks} />
                  ))}
                </div>
              </section>
              <section>
                <SectionHeader title="Discography" subtitle="Albums, EPs, singles & projects" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                  {albums.map((a) => <AlbumCard key={a.id} album={a} />)}
                </div>
                {albums.length === 0 && <div className="text-white/40 text-sm">No releases yet.</div>}
              </section>
            </div>
          )}

          {tab === "video" && (
            <div className="mt-10" data-testid="creator-video-tab">
              <SectionHeader title="On ANCRVIEW" subtitle="Videos, live sessions & masterclasses" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((v) => <VideoCard key={v.id} video={v} />)}
              </div>
              {videos.length === 0 && <div className="text-white/40 text-sm">No video content yet.</div>}
            </div>
          )}

          {tab === "about" && (
            <div className="mt-10 grid md:grid-cols-2 gap-6" data-testid="creator-about-tab">
              <div className="glass p-6 rounded-2xl">
                <div className="text-[10px] tracking-[0.22em] uppercase text-white/50 mb-2">Bio</div>
                <p className="text-[14px] text-white/80 leading-relaxed font-sans-alt">{creator.bio}</p>
              </div>
              <div className="glass p-6 rounded-2xl">
                <div className="text-[10px] tracking-[0.22em] uppercase text-white/50 mb-3">Focus</div>
                <div className="flex flex-wrap gap-2">
                  {creator.genres?.map((g) => <span key={g} className="text-[11px] px-2 py-1 rounded-full glass">{g}</span>)}
                </div>
                <div className="mt-6 text-[10px] tracking-[0.22em] uppercase text-white/50 mb-2">Institution</div>
                <Link to={`/schools/${creator.institution_id}`} className="text-[14px] font-display hover:underline">{creator.institution_name}</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-white/45">{label}</div>
      <div className="font-display text-2xl mt-1 tabular-nums">{value}</div>
    </div>
  );
}
function TabBtn({ active, onClick, label, testid }) {
  return (
    <button
      onClick={onClick} data-testid={testid}
      className={`px-4 py-2 rounded-full text-[12px] font-sans-alt transition-colors ${active ? "bg-white text-black" : "glass glass-hover"}`}
    >{label}</button>
  );
}
