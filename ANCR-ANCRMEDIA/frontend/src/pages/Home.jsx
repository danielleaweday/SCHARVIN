import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Play, ArrowRight, Sparkles, Radio, Trophy, Zap, ChevronLeft, ChevronRight,
  GraduationCap, Star, Film, Trophy as TrophyIcon, Cpu, ShieldCheck,
} from "lucide-react";
import api from "@/lib/api";
import { usePlayer } from "@/context/PlayerContext";
import { fmtNum } from "@/lib/format";
import { BRAND } from "@/lib/brand";
import {
  AlbumCard, VideoCard, PlaylistCard, TrackRow, CreatorCard,
} from "@/components/MediaCards";

// ============ HERO ============
function AncrmediaHero() {
  return (
    <section
      data-testid="home-hero"
      className="relative overflow-hidden mx-6 mt-6 rounded-[28px] border border-white/[0.06]"
      style={{ minHeight: 340, background: "linear-gradient(180deg, #0E0E12 0%, #0B0B0D 100%)" }}
    >
      <div className="ambient-flow" />
      <div className="absolute inset-0 grain opacity-70 pointer-events-none" />
      <div className="streak" style={{ top: "38%", left: 0, right: 0, transform: "rotate(-6deg)" }} />
      <div className="streak" style={{ top: "62%", left: 0, right: 0, transform: "rotate(4deg)", opacity: 0.35 }} />
      <div className="relative z-10 flex flex-col items-center justify-center text-center py-14 px-8">
        <img
          src={BRAND.ANCRMEDIA}
          alt="ANCRMEDIA™"
          data-testid="hero-ancrmedia-logo"
          className="h-24 md:h-32 lg:h-36 w-auto object-contain drop-shadow-[0_20px_60px_rgba(112,0,255,0.35)]"
        />
        <div
          className="mt-5 text-[12px] md:text-[13px] tracking-[0.32em] uppercase font-sans-alt"
          style={{
            background: "linear-gradient(90deg, #4DA0FF 0%, #B26BFF 34%, #FF3B77 66%, #FFB061 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Distribute · Watch · Listen · Stream · Connect
        </div>
        <div className="mt-5 h-px w-40 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        <div className="mt-3 text-[11px] tracking-[0.28em] uppercase text-white/50">
          The Global Discover Feed · Curated for you
        </div>
      </div>
    </section>
  );
}

// ============ Panels (WAV + VIEW) ============
function AncrwavPanel({ tracks }) {
  const { play } = usePlayer();
  const [chip, setChip] = useState("Music");
  const chips = ["Music", "Albums", "Singles", "EPs", "Playlists", "Radio"];
  const items = tracks.slice(0, 4);
  return (
    <div
      data-testid="ancrwav-panel"
      className="relative rounded-[24px] overflow-hidden border border-white/[0.06] p-6"
      style={{ background: "linear-gradient(180deg, rgba(0,82,255,0.08) 0%, rgba(112,0,255,0.05) 55%, rgba(20,20,26,0.9) 100%)" }}
    >
      <div className="absolute -top-20 -left-10 w-72 h-72 rounded-full opacity-40 pointer-events-none"
        style={{ background: "radial-gradient(closest-side, rgba(0,82,255,0.55), transparent 70%)", filter: "blur(30px)" }} />
      <div className="relative flex items-center justify-between gap-4">
        <img src={BRAND.ANCRWAV} alt="ANCRWAV" className="h-12 md:h-14 w-auto object-contain" />
        <Link to="/wav" className="text-[11px] text-white/60 hover:text-white flex items-center gap-1">
          Enter ANCRWAV <ArrowRight size={11} />
        </Link>
      </div>
      <div className="relative mt-5 flex flex-wrap gap-2" data-testid="ancrwav-chips">
        {chips.map((c) => (
          <button key={c} onClick={() => setChip(c)} data-testid={`wav-chip-${c.toLowerCase()}`}
            className={`px-3.5 py-1.5 rounded-full text-[11.5px] font-sans-alt transition-colors ${chip === c ? "text-white" : "text-white/60 hover:text-white bg-white/[0.04] border border-white/[0.06]"}`}
            style={chip === c ? { background: "linear-gradient(135deg, rgba(0,82,255,0.9), rgba(112,0,255,0.9))", boxShadow: "0 8px 24px -8px rgba(0,82,255,0.5)" } : {}}>
            {c}
          </button>
        ))}
      </div>
      <div className="mt-5 text-[10px] tracking-[0.28em] uppercase text-white/50 mb-3">Recently Played</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((t) => (
          <button key={t.id} onClick={() => play(t, tracks)} data-testid={`wav-recent-${t.id}`} className="group relative text-left card-hover">
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/[0.06]">
              <img src={t.cover} alt={t.title} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute right-2.5 bottom-2.5 w-9 h-9 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all">
                <Play size={13} className="ml-0.5" strokeWidth={2} />
              </div>
            </div>
            <div className="mt-2 text-[12.5px] font-display truncate">{t.title}</div>
            <div className="text-[10.5px] text-white/50 truncate">{t.artist_name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function AncrviewPanel({ videos }) {
  const [chip, setChip] = useState("Videos");
  const chips = ["Videos", "Shows", "Podcasts", "Masterclasses", "Live", "Documentaries"];
  const items = videos.slice(0, 4);
  return (
    <div
      data-testid="ancrview-panel"
      className="relative rounded-[24px] overflow-hidden border border-white/[0.06] p-6"
      style={{ background: "linear-gradient(180deg, rgba(255,140,0,0.10) 0%, rgba(255,59,119,0.06) 55%, rgba(20,20,26,0.9) 100%)" }}
    >
      <div className="absolute -top-20 -right-10 w-72 h-72 rounded-full opacity-40 pointer-events-none"
        style={{ background: "radial-gradient(closest-side, rgba(255,90,50,0.55), transparent 70%)", filter: "blur(30px)" }} />
      <div className="relative flex items-center justify-between gap-4">
        <img src={BRAND.ANCRVIEW} alt="ANCRVIEW" className="h-12 md:h-14 w-auto object-contain" />
        <Link to="/view" className="text-[11px] text-white/60 hover:text-white flex items-center gap-1">
          Enter ANCRVIEW <ArrowRight size={11} />
        </Link>
      </div>
      <div className="relative mt-5 flex flex-wrap gap-2" data-testid="ancrview-chips">
        {chips.map((c) => (
          <button key={c} onClick={() => setChip(c)} data-testid={`view-chip-${c.toLowerCase()}`}
            className={`px-3.5 py-1.5 rounded-full text-[11.5px] font-sans-alt transition-colors ${chip === c ? "text-white" : "text-white/60 hover:text-white bg-white/[0.04] border border-white/[0.06]"}`}
            style={chip === c ? { background: "linear-gradient(135deg, rgba(255,138,0,0.95), rgba(255,59,119,0.9))", boxShadow: "0 8px 24px -8px rgba(255,90,50,0.55)" } : {}}>
            {c}
          </button>
        ))}
      </div>
      <div className="mt-5 text-[10px] tracking-[0.28em] uppercase text-white/50 mb-3">Continue Watching</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((v) => (
          <Link key={v.id} to={`/videos/${v.id}`} data-testid={`view-continue-${v.id}`} className="group relative block card-hover">
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/[0.06]">
              <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 scrim-bottom" />
              <div className="absolute left-3 right-3 bottom-3 h-1 rounded-full bg-white/20 overflow-hidden">
                <div className="h-full" style={{ width: `${20 + ((v.id.charCodeAt(v.id.length - 1) * 7) % 55)}%`, background: "linear-gradient(90deg, #FF8A00, #FF3B77)" }} />
              </div>
            </div>
            <div className="mt-2 text-[12.5px] font-display truncate">{v.title}</div>
            <div className="text-[10.5px] text-white/50 truncate">{v.kind}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ============ SECTION HEADER ============
function ShelfHeader({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <div className="text-[10px] tracking-[0.28em] uppercase text-white/45 flex items-center gap-2">
          {Icon && <Icon size={11} strokeWidth={1.6} />} {subtitle}
        </div>
        <div className="font-display text-[22px] sm:text-[24px] font-medium tracking-tight leading-tight mt-1">{title}</div>
      </div>
      {action}
    </div>
  );
}

function Section({ id, children }) {
  return <section className="mx-6 mt-12" data-testid={id}>{children}</section>;
}

// ============ LIVE NOW ============
function LiveNowShelf({ items }) {
  if (!items?.length) return null;
  return (
    <Section id="shelf-live-now">
      <ShelfHeader icon={Radio} subtitle="Live Now · Streaming across the CCDP" title="Broadcasting from every institution."
        action={<Link to="/live" className="text-[11px] text-white/60 hover:text-white flex items-center gap-1">All live <ArrowRight size={11} /></Link>} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.slice(0, 3).map((l) => (
          <Link key={l.id} to="/live" className="relative aspect-video rounded-2xl overflow-hidden card-hover border border-white/[0.06]">
            <img src={l.thumbnail} className="absolute inset-0 w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 scrim-bottom" />
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-600 text-[10px] font-bold tracking-widest">
              <span className="live-dot" /> LIVE
            </div>
            <div className="absolute top-3 right-3 text-[10px] uppercase tracking-widest text-white/80 bg-black/60 px-2 py-1 rounded-md">
              {fmtNum(l.viewers_now)} watching
            </div>
            <div className="absolute inset-x-0 bottom-0 p-4">
              <div className="text-[10px] tracking-[0.2em] uppercase text-white/70">{l.category} · {l.institution_name}</div>
              <div className="font-display text-lg leading-tight mt-1">{l.title}</div>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}

// ============ AIAH RECOMMENDED ============
function RecommendedShelf({ tracks, videos }) {
  const { play } = usePlayer();
  return (
    <Section id="shelf-recommended">
      <div className="relative rounded-3xl overflow-hidden border border-white/[0.06] p-6"
        style={{ background: "linear-gradient(135deg, rgba(0,82,255,0.10), rgba(112,0,255,0.10) 45%, rgba(255,59,119,0.10) 100%)" }}>
        <div className="absolute inset-0 grain opacity-40" />
        <div className="relative">
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="text-[10px] tracking-[0.28em] uppercase text-white/60 flex items-center gap-2">
                <Cpu size={11} strokeWidth={1.8} /> Recommended for you · Powered by AIAH™
              </div>
              <div className="font-display text-[24px] font-medium tracking-tight leading-tight mt-1">
                Made by the network, learned for you.
              </div>
              <div className="text-[12px] text-white/50 mt-1 max-w-xl">
                Mixed from your courses, listening history, collaborations, mentors, and every school you follow.
              </div>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full glass text-[10px] tracking-widest uppercase text-white/60">
              <ShieldCheck size={10} /> ANCRID Signal
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {tracks.slice(0, 5).map((t) => (
              <button key={t.id} onClick={() => play(t, tracks)} data-testid={`rec-track-${t.id}`} className="group text-left card-hover">
                <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/[0.06]">
                  <img src={t.cover} alt="" className="w-full h-full object-cover" />
                  <div className="absolute right-2.5 bottom-2.5 w-9 h-9 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all">
                    <Play size={13} className="ml-0.5" strokeWidth={2} />
                  </div>
                </div>
                <div className="mt-2 text-[12.5px] font-display truncate">{t.title}</div>
                <div className="text-[10.5px] text-white/50 truncate">{t.artist_name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

// ============ MAIN ============
export default function Home() {
  const [d, setD] = useState(null);
  useEffect(() => { api.get("/discover-feed").then((r) => setD(r.data)); }, []);

  if (!d) return <div className="p-16 text-white/40">Loading ANCRMEDIA…</div>;

  return (
    <div data-testid="home-page" className="pb-16">
      <AncrmediaHero />

      {/* Twin experience panels */}
      <div className="mx-6 mt-10 grid grid-cols-1 xl:grid-cols-2 gap-6" data-testid="home-two-panels">
        <AncrwavPanel tracks={d.trending_tracks || []} />
        <AncrviewPanel videos={d.latest_videos || []} />
      </div>

      {/* Live Now */}
      <LiveNowShelf items={d.live_now} />

      {/* Trending on ANCRWAV */}
      <Section id="shelf-trending-wav">
        <ShelfHeader icon={Zap} subtitle="Trending on ANCRWAV" title="What CCDP creators are streaming this week."
          action={<Link to="/trending" className="text-[11px] text-white/60 hover:text-white flex items-center gap-1">Global charts <ArrowRight size={11} /></Link>} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
          {(d.trending_tracks || []).slice(0, 8).map((t, i) => <TrackRow key={t.id} track={t} index={i + 1} list={d.trending_tracks} />)}
        </div>
      </Section>

      {/* New Releases */}
      <Section id="shelf-new-releases">
        <ShelfHeader icon={Sparkles} subtitle="New Releases" title="Fresh from the CCDP this week."
          action={<Link to="/new-releases" className="text-[11px] text-white/60 hover:text-white flex items-center gap-1">All releases <ArrowRight size={11} /></Link>} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {(d.new_releases || []).slice(0, 5).map((a) => <AlbumCard key={a.id} album={a} />)}
        </div>
      </Section>

      {/* Latest ANCRVIEW Episodes */}
      <Section id="shelf-latest-view">
        <ShelfHeader subtitle="Latest ANCRVIEW Episodes" title="Music videos, podcasts, sessions."
          action={<Link to="/videos" className="text-[11px] text-white/60 hover:text-white flex items-center gap-1">All videos <ArrowRight size={11} /></Link>} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {(d.latest_videos || []).slice(0, 4).map((v) => <VideoCard key={v.id} video={v} />)}
        </div>
      </Section>

      {/* Masterclasses */}
      {d.masterclasses?.length > 0 && (
        <Section id="shelf-masterclasses">
          <ShelfHeader icon={GraduationCap} subtitle="Masterclasses" title="Lessons from the faculty of every institution."
            action={<Link to="/videos" className="text-[11px] text-white/60 hover:text-white flex items-center gap-1">All classes <ArrowRight size={11} /></Link>} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {d.masterclasses.slice(0, 4).map((v) => <VideoCard key={v.id} video={v} />)}
          </div>
        </Section>
      )}

      {/* Student Spotlights */}
      <Section id="shelf-student-spotlights">
        <ShelfHeader icon={Star} subtitle="Student Spotlights" title="Meet the creators of the week."
          action={<Link to="/creators" className="text-[11px] text-white/60 hover:text-white flex items-center gap-1">All creators <ArrowRight size={11} /></Link>} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {(d.student_spotlights || []).slice(0, 6).map((c) => <CreatorCard key={c.id} creator={c} />)}
        </div>
      </Section>

      {/* Faculty & Industry Features */}
      {d.faculty_features?.length > 0 && (
        <Section id="shelf-faculty-features">
          <ShelfHeader icon={ShieldCheck} subtitle="Faculty & Industry Features" title="Verified voices from the CCDP."
            action={<Link to="/creators" className="text-[11px] text-white/60 hover:text-white flex items-center gap-1">All faculty <ArrowRight size={11} /></Link>} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {d.faculty_features.map((c) => <CreatorCard key={c.id} creator={c} />)}
          </div>
        </Section>
      )}

      {/* Upcoming Livestreams */}
      {d.upcoming_live?.length > 0 && (
        <Section id="shelf-upcoming-live">
          <ShelfHeader icon={Radio} subtitle="Upcoming Livestreams" title="Save the date."
            action={<Link to="/live" className="text-[11px] text-white/60 hover:text-white flex items-center gap-1">All upcoming <ArrowRight size={11} /></Link>} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {d.upcoming_live.slice(0, 4).map((l) => (
              <Link key={l.id} to="/live" className="glass rounded-2xl overflow-hidden card-hover">
                <img src={l.thumbnail} className="w-full aspect-video object-cover" alt="" />
                <div className="p-4">
                  <div className="text-[10px] uppercase tracking-widest text-white/50">{l.category}</div>
                  <div className="font-display text-[15px] mt-1 leading-tight">{l.title}</div>
                  <div className="text-[11px] text-white/50 mt-1">{l.institution_name}</div>
                  <div className="text-[11px] gradient-text mt-2 font-medium">{new Date(l.starts_at).toLocaleString()}</div>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Original Series (reserved) */}
      <Section id="shelf-originals">
        <div className="relative rounded-3xl overflow-hidden border border-white/[0.06] p-10 md:p-14"
          style={{ background: "linear-gradient(135deg, rgba(0,82,255,0.10), rgba(112,0,255,0.10) 45%, rgba(255,59,119,0.10) 100%)" }}>
          <div className="absolute inset-0 grain opacity-40" />
          <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="text-[10px] tracking-[0.24em] uppercase text-white/60 flex items-center gap-2"><Film size={12} /> ANCR Originals · Series</div>
              <div className="font-display text-3xl md:text-4xl tracking-tight leading-tight mt-2 max-w-xl">
                Original series produced by the network, for the network.
              </div>
            </div>
            <Link to="/originals" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:scale-[1.02] transition-transform">
              Explore Originals <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </Section>

      {/* Festival & Showcase Coverage */}
      {d.events?.length > 0 && (
        <Section id="shelf-festival">
          <ShelfHeader icon={TrophyIcon} subtitle="Festival & Showcase Coverage" title="From every stage on the calendar."
            action={<Link to="/events" className="text-[11px] text-white/60 hover:text-white flex items-center gap-1">All events <ArrowRight size={11} /></Link>} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {d.events.slice(0, 4).map((e) => (
              <div key={e.id} className="relative rounded-2xl overflow-hidden border border-white/[0.06] card-hover aspect-[4/3]">
                <img src={e.cover} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(11,11,13,0.2) 0%, rgba(11,11,13,0.8) 65%, rgba(11,11,13,0.95) 100%)" }} />
                <div className="relative z-10 h-full flex flex-col justify-end p-4">
                  <div className="text-[10px] tracking-[0.22em] uppercase text-white/70">{e.kind}</div>
                  <div className="font-display text-[15px] leading-tight mt-1">{e.title}</div>
                  <div className="text-[10.5px] text-white/60 mt-1">{e.city}, {e.country} · {new Date(e.starts_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Playlists */}
      <Section id="shelf-playlists">
        <ShelfHeader subtitle="Curated Playlists" title="Editorial and faculty-curated collections."
          action={<Link to="/playlists" className="text-[11px] text-white/60 hover:text-white flex items-center gap-1">All playlists <ArrowRight size={11} /></Link>} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {(d.playlists || []).slice(0, 6).map((p) => <PlaylistCard key={p.id} playlist={p} />)}
        </div>
      </Section>

      {/* Recommended for You (AIAH) — placed last as a rich CTA */}
      <RecommendedShelf tracks={d.recommended_tracks || []} videos={d.recommended_videos || []} />
    </div>
  );
}
