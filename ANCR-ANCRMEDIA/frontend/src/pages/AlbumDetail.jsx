import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, Clock, Users, Globe2, ShieldCheck, Heart, Share2, Download, Music4 } from "lucide-react";
import api from "@/lib/api";
import { usePlayer } from "@/context/PlayerContext";
import { fmtDate, fmtNum, fmtDuration } from "@/lib/format";
import { BRAND } from "@/lib/brand";

export default function AlbumDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const { play, current, playing, toggle } = usePlayer();

  useEffect(() => {
    setData(null);
    api.get(`/albums/${id}`).then((r) => setData(r.data)).catch(() => {});
  }, [id]);

  if (!data) return <div className="p-16 text-white/40">Loading…</div>;

  const { album, tracks, artist } = data;
  const playAll = () => tracks[0] && play(tracks[0], tracks);

  return (
    <div data-testid="album-page" className="pb-16">
      {/* Hero */}
      <section className="relative min-h-[420px] px-8 pt-10 pb-10 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ backgroundImage: `url(${album.cover})`, backgroundSize: "cover", backgroundPosition: "center", filter: "blur(60px) saturate(1.2)", transform: "scale(1.35)", opacity: 0.6 }}
        />
        <div className="absolute inset-0 scrim-both" />
        <div className="relative z-10 flex items-end gap-8 max-w-6xl">
          <img src={album.cover} alt={album.title} className="w-56 h-56 rounded-2xl object-cover shadow-[0_30px_80px_-20px_rgba(112,0,255,0.5)] border border-white/10" />
          <div className="pb-3 flex-1">
            <div className="flex items-center gap-3">
              <img src={BRAND.ANCRWAV} alt="ANCRWAV" className="h-5 w-auto object-contain opacity-80" data-testid="album-ancrwav-mark" />
              <div className="text-[10px] tracking-[0.24em] uppercase text-white/60">{album.kind} · {album.institution_name}</div>
            </div>
            <h1 className="font-display text-5xl lg:text-6xl font-black tracking-tighter leading-[0.95] mt-3">{album.title}</h1>
            <div className="mt-4 flex items-center gap-3">
              {artist && (
                <Link to={`/creators/${artist.id}`} className="flex items-center gap-2 hover:opacity-80" data-testid="album-artist-link">
                  <img src={artist.avatar} alt="" className="w-8 h-8 rounded-full border border-white/10" />
                  <span className="text-[14px] font-display">{artist.name}</span>
                  {artist.verified && <ShieldCheck size={13} className="text-[#0052FF]" />}
                </Link>
              )}
              <span className="text-white/40">·</span>
              <span className="text-[12px] text-white/60">{fmtDate(album.release_date)}</span>
              <span className="text-white/40">·</span>
              <span className="text-[12px] text-white/60">{album.track_count} tracks · {Math.floor(album.duration_seconds / 60)} min</span>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button
                data-testid="album-play"
                onClick={playAll}
                className="inline-flex items-center gap-2 pl-1 pr-5 py-1 rounded-full bg-white text-black font-sans-alt text-sm font-medium hover:scale-[1.02] transition-transform"
              >
                <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
                  <Play size={13} className="ml-0.5" strokeWidth={2} />
                </span>
                Play Album
              </button>
              <button data-testid="album-like" className="p-2.5 rounded-full glass glass-hover"><Heart size={15} strokeWidth={1.6} /></button>
              <button data-testid="album-share" className="p-2.5 rounded-full glass glass-hover"><Share2 size={15} strokeWidth={1.6} /></button>
              <button data-testid="album-download" className="p-2.5 rounded-full glass glass-hover"><Download size={15} strokeWidth={1.6} /></button>
            </div>
          </div>
        </div>
      </section>

      <div className="px-8 grid lg:grid-cols-[1fr_320px] gap-10">
        {/* Tracks */}
        <div>
          <div className="grid grid-cols-[24px_44px_1fr_100px_60px] gap-3 px-3 py-2 text-[10px] uppercase tracking-widest text-white/40 border-b border-white/[0.06]">
            <div className="text-center">#</div><div></div><div>Title</div><div className="text-right">Streams</div><div className="text-right"><Clock size={11} /></div>
          </div>
          <div className="mt-2">
            {tracks.map((t, i) => {
              const isCurrent = current?.id === t.id;
              return (
                <div key={t.id} className={`group grid grid-cols-[24px_44px_1fr_100px_60px] gap-3 items-center px-3 py-2.5 rounded-lg hover:bg-white/[0.04] transition-colors ${isCurrent ? "bg-white/[0.05]" : ""}`}>
                  <div className="text-[12px] text-white/40 tabular-nums text-center">{i + 1}</div>
                  <div className="relative">
                    <img src={t.cover} alt="" className="w-10 h-10 rounded-md object-cover" />
                    <button
                      data-testid={`play-track-${t.id}`}
                      onClick={() => (isCurrent ? toggle() : play(t, tracks))}
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/55 rounded-md flex items-center justify-center transition-opacity"
                    >
                      <Play size={13} className="text-white ml-0.5" strokeWidth={2} />
                    </button>
                  </div>
                  <div className="min-w-0">
                    <div className={`text-[14px] font-display truncate ${isCurrent ? "gradient-text" : ""}`}>{t.title}</div>
                    <div className="text-[11px] text-white/50 truncate">{t.artist_name}</div>
                  </div>
                  <div className="text-[12px] text-white/50 tabular-nums text-right">{fmtNum(t.streams)}</div>
                  <div className="text-[11px] text-white/45 tabular-nums text-right">{fmtDuration(t.duration_seconds)}</div>
                </div>
              );
            })}
          </div>

          {/* Credits */}
          <div className="mt-10 grid md:grid-cols-2 gap-6" data-testid="album-credits">
            <div className="p-5 rounded-2xl glass">
              <div className="text-[10px] tracking-[0.22em] uppercase text-white/50 mb-3">Credits</div>
              {tracks[0] && (
                <div className="space-y-2 text-[13px] font-sans-alt">
                  <div className="flex justify-between"><span className="text-white/50">Producers</span><span className="text-white">{tracks[0].producers?.join(", ")}</span></div>
                  <div className="flex justify-between"><span className="text-white/50">Songwriters</span><span className="text-white text-right">{tracks[0].songwriters?.join(", ")}</span></div>
                  <div className="flex justify-between"><span className="text-white/50">Publishing</span><span className="text-white text-right">{tracks[0].publishing}</span></div>
                  <div className="flex justify-between"><span className="text-white/50">ISRC</span><span className="text-white/70 font-mono text-[11px]">{tracks[0].isrc}</span></div>
                </div>
              )}
              <div className="text-[11px] text-white/40 mt-4 pt-4 border-t border-white/[0.06]">{album.credits_note}</div>
            </div>

            <div className="p-5 rounded-2xl glass">
              <div className="text-[10px] tracking-[0.22em] uppercase text-white/50 mb-3">Publishing Splits</div>
              {tracks[0]?.splits?.map((s, i) => (
                <div key={i} className="mb-3 last:mb-0">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-white/70">{s.name} <span className="text-white/40">· {s.role}</span></span>
                    <span className="tabular-nums">{s.pct}%</span>
                  </div>
                  <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden mt-1">
                    <div className="h-full gradient-progress" style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {tracks[0]?.lyrics && (
            <div className="mt-6 p-5 rounded-2xl glass" data-testid="album-lyrics">
              <div className="text-[10px] tracking-[0.22em] uppercase text-white/50 mb-3">Lyrics · {tracks[0].title}</div>
              <pre className="whitespace-pre-wrap font-sans-alt text-[13.5px] leading-relaxed text-white/85">{tracks[0].lyrics}</pre>
            </div>
          )}
        </div>

        {/* Right stats rail */}
        <aside className="space-y-4">
          <div className="p-5 rounded-2xl glass">
            <div className="text-[10px] tracking-[0.22em] uppercase text-white/50 mb-3">Reach</div>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Streams" value={fmtNum(album.streams)} />
              <Stat label="Listeners" value={fmtNum(tracks.reduce((s, t) => s + (t.listeners || 0), 0))} />
              <Stat label="Countries" icon={<Globe2 size={11} />} value={Math.max(...tracks.map((t) => t.countries_count || 0))} />
              <Stat label="Schools" icon={<Users size={11} />} value={Math.max(...tracks.map((t) => t.schools_count || 0))} />
            </div>
          </div>
          <div className="p-5 rounded-2xl glass">
            <div className="text-[10px] tracking-[0.22em] uppercase text-white/50 mb-3">About</div>
            <div className="text-[13px] text-white/70 leading-relaxed font-sans-alt">{album.description}</div>
          </div>
          <div className="p-5 rounded-2xl glass">
            <div className="text-[10px] tracking-[0.22em] uppercase text-white/50 mb-3">Genres</div>
            <div className="flex flex-wrap gap-2">
              {album.genres?.map((g) => (
                <Link key={g} to={`/genres/${encodeURIComponent(g)}`} className="text-[11px] px-2 py-1 rounded-full glass glass-hover"><Music4 size={9} className="inline mr-1" />{g}</Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value, icon }) {
  return (
    <div className="p-3 rounded-lg bg-white/[0.03]">
      <div className="text-[9px] uppercase tracking-widest text-white/45 flex items-center gap-1">{icon}{label}</div>
      <div className="font-display text-lg mt-1 tabular-nums">{value}</div>
    </div>
  );
}
