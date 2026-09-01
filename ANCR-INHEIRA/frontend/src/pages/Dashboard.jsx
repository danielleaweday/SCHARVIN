import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import Nav from '@/components/Nav';
import ModuleLink from '@/components/ModuleLink';
import { DASHBOARD } from '@/constants/testIds';
import { CANONICAL_CAST, COLLABORATOR_PALETTE, colorForAncrId } from '@/lib/collaboratorColors';
import {
    Plus, ArrowUpRight, Sparkles, Users, Music, Coins, ShieldCheck,
    Mic, PenLine, Layers, Radio, Trophy, Infinity as InfinityIcon,
    Activity, Signal, MapPin, Play, Piano, Volume2,
} from 'lucide-react';

/*
 * INHEIRA — Creator Home
 * Phase 1 of the Experience Integration mandate. The inside of INHEIRA must
 * feel like the public website: chapter-based, cinematic, and inseparable
 * from Life of a Song™, Creative Evidence™, Song Intelligence™, and Writing Rooms.
 * No new features — every surface here maps to an existing capability.
 */

// 10-stage Life of a Song™ arc (mirrors Landing Chapter IX)
const LIFE_STAGES = [
    { key: 'idea',        label: 'Idea',        Icon: Sparkles },
    { key: 'lyrics',      label: 'Lyrics',      Icon: PenLine },
    { key: 'session',     label: 'Session',     Icon: Mic },
    { key: 'mix',         label: 'Mix',         Icon: Layers },
    { key: 'understood',  label: 'Understood',  Icon: Signal },
    { key: 'published',   label: 'Published',   Icon: ShieldCheck },
    { key: 'playlisted',  label: 'Playlisted',  Icon: Radio },
    { key: 'streams',     label: 'Streams',     Icon: Activity },
    { key: 'recognized',  label: 'Recognized',  Icon: Trophy },
    { key: 'legacy',      label: 'Legacy',      Icon: InfinityIcon },
];

// Writing Rooms — Live surface (subset of the WritingRooms.jsx canonical cast)
const LIVE_ROOMS = [
    { id: 'rm_atl_01', name: 'ATL · Fall Camp Room A',    city: 'Atlanta',   country: 'USA',    live: true,  rec: '01:14', wip: 'Skyline · V2 rewrite',       participants: ['ancr_marcus','ancr_chris','ancr_jimmie'] },
    { id: 'rm_lon_01', name: 'London · Kensington Studio', city: 'London',   country: 'UK',     live: true,  rec: '00:22', wip: 'Untitled · rough take',      participants: ['ancr_sarah','ancr_marcus'] },
    { id: 'rm_lag_01', name: 'Lagos · Camp Suite 1',       city: 'Lagos',    country: 'Nigeria', live: true,  rec: '00:47', wip: 'Afterglow · bridge',         participants: ['ancr_jimmie','ancr_sarah','ancr_danielle'] },
    { id: 'rm_nsh_01', name: 'Nashville · Room 3',         city: 'Nashville', country: 'USA',   live: false, rec: '2h ago', wip: 'Held Together · chorus',    participants: ['ancr_danielle','ancr_chris'] },
];

// Infer a Life of a Song stage index (1..10) from a session's state
function inferStage(s) {
    if (s.splits_status === 'finalized' && (s.total_earnings || 0) > 100) return 8;
    if (s.splits_status === 'finalized') return 6;
    if (s.splits_status === 'proposed')  return 5;
    if ((s.completion || 0) >= 60)       return 4;
    if ((s.collaborators || []).length > 0 && (s.contributions_count || 0) > 0) return 3;
    if ((s.lyrics_sections || []).length > 0 || (s.lyrics_line_count || 0) > 0) return 2;
    return 1;
}

export default function Dashboard() {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [royalties, setRoyalties] = useState({ works: [], total_earnings: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [s, r] = await Promise.all([api.get('/sessions'), api.get('/royalties')]);
                setSessions(s.data || []);
                setRoyalties(r.data || { works: [], total_earnings: 0 });
            } catch (e) {
                // ignore
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const active = useMemo(() => sessions.filter((s) => s.status === 'active' || s.splits_status !== 'finalized'), [sessions]);
    const catalog = useMemo(() => sessions.filter((s) => s.splits_status === 'finalized'), [sessions]);
    const collaboratorCount = useMemo(
        () => new Set(sessions.flatMap((s) => (s.collaborators || []).map((c) => c.user_id))).size,
        [sessions]
    );

    // Evidence feed: derived from recent session events (fallback to canonical if empty)
    const evidenceFeed = useMemo(() => buildEvidenceFeed(sessions, user), [sessions, user]);

    // Intelligence pulse: aggregated across active sessions
    const pulse = useMemo(() => buildPulse(active), [active]);

    const firstName = user?.name?.split(' ')[0] || 'Creator';

    return (
        <div className="min-h-screen bg-black text-white">
            <Nav />

            {/* HERO — Editorial full-bleed cinematic environment */}
            <CreatorHomeHero user={user} firstName={firstName} sessions={sessions} collaboratorCount={collaboratorCount} royalties={royalties} />

            {/* CHAPTER I — LIFE OF A SONG */}
            <ChapterSection eyebrow="/ CHAPTER I · WHERE EVERY SONG LIVES" title="Life of a Song™">
                <p className="text-zinc-400 max-w-2xl text-sm leading-relaxed mb-10">
                    Every song you create moves along the same ten stages — from bedroom voice memo to worldwide legacy. Here's where each of yours stands right now.
                </p>
                <LifeOfSongBoard sessions={active.slice(0, 4)} loading={loading} />
            </ChapterSection>

            {/* CHAPTER II — WRITING ROOMS LIVE */}
            <ChapterSection eyebrow="/ CHAPTER II · WORLDWIDE" title="Writing Rooms · Live now" right={
                <Link to="/writing-rooms" className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-colors flex items-center gap-2">
                    All rooms <ArrowUpRight className="w-3 h-3" strokeWidth={1.5} />
                </Link>
            }>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {LIVE_ROOMS.map((r) => <LiveRoomCard key={r.id} room={r} />)}
                </div>
            </ChapterSection>

            {/* CHAPTER III — ACTIVE SESSIONS */}
            <ChapterSection eyebrow="/ CHAPTER III · IN THE ROOM" title="Active sessions" right={
                <Link to="/sessions" className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-colors flex items-center gap-2">
                    All sessions <ArrowUpRight className="w-3 h-3" strokeWidth={1.5} />
                </Link>
            }>
                <div data-testid={DASHBOARD.activeSessions} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loading ? (
                        <div className="col-span-full text-center py-16 text-zinc-600 font-mono-metadata text-xs uppercase tracking-[0.3em]">Loading…</div>
                    ) : active.length === 0 ? (
                        <EmptyCard title="No active sessions yet" hint="Start one or step into a writing room to begin." />
                    ) : (
                        active.slice(0, 6).map((s) => <SessionCinematicCard key={s.session_id} s={s} />)
                    )}
                </div>
            </ChapterSection>

            {/* CHAPTER IV — CREATIVE EVIDENCE FEED + INTELLIGENCE PULSE */}
            <ChapterSection eyebrow="/ CHAPTER IV · DOCUMENTED" title="Creative Evidence™ · Live feed">
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 min-w-0">
                        <EvidenceFeed items={evidenceFeed} />
                    </div>
                    <div className="min-w-0">
                        <IntelligencePulseCard pulse={pulse} />
                    </div>
                </div>
            </ChapterSection>

            {/* CHAPTER V — CREATOR PASSPORT PREVIEW + RELEASE PATH */}
            <ChapterSection eyebrow="/ CHAPTER V · WHO YOU ARE BECOMING" title="Your Creator Passport™">
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 min-w-0">
                        <PassportPreview user={user} sessions={sessions} earnings={royalties.total_earnings || 0} />
                    </div>
                    <div className="min-w-0">
                        <ReleasePathCard sessions={sessions} />
                    </div>
                </div>
            </ChapterSection>

            {/* CHAPTER VI — CATALOG */}
            <ChapterSection eyebrow="/ CHAPTER VI · YOUR LEGACY" title="Finalized works">
                <div data-testid={DASHBOARD.catalog} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {catalog.length === 0 ? (
                        <EmptyCard title="No finalized works yet" hint="Complete a session and lock splits to build your catalog." />
                    ) : (
                        catalog.slice(0, 6).map((s) => <SessionCinematicCard key={s.session_id} s={s} finalized />)
                    )}
                </div>
            </ChapterSection>

            {/* FOOTER SIGNATURE — mirrors Landing */}
            <footer className="border-t border-zinc-900 bg-black">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-12 flex flex-wrap items-center justify-between gap-4">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-zinc-600">Powered by ANCR™</div>
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-zinc-600">INHEIRA™ · From Creation to Legacy</div>
                </div>
            </footer>
        </div>
    );
}

/* ---------- Cinematic Creator Home Hero ---------- */
// Authentic, diverse songwriting session photography — Black & Brown creators collaborating.
// TODO: swap for commissioned Chicago-session shots when brand photography ships.
const HERO_IMG      = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?crop=entropy&cs=srgb&fm=jpg&w=2400&q=85'; // Black producer at recording console (mid-session)
const HERO_IMG_ALT  = 'https://images.unsplash.com/photo-1508737027454-e6454ef45afd?crop=entropy&cs=srgb&fm=jpg&w=2400&q=85'; // Black artist in studio (people-first layer)
const HERO_IMG_CITY = 'https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?crop=entropy&cs=srgb&fm=jpg&w=2400&q=85'; // chicago-style skyline at night (window layer)

function CreatorHomeHero({ user, firstName, sessions, collaboratorCount, royalties }) {
    return (
        <section data-testid={DASHBOARD.root} className="relative border-b border-zinc-900 bg-black overflow-hidden">
            {/* Layer 0 · Distant Chicago-style skyline (window-behind-the-studio) */}
            <div className="absolute inset-0" aria-hidden="true">
                <img src={HERO_IMG_CITY} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
            </div>

            {/* Layer 1 · Primary — Black & Brown creators in session */}
            <div className="absolute inset-0" aria-hidden="true">
                <img src={HERO_IMG} alt="" className="absolute inset-0 w-full h-full object-cover object-center scale-110" style={{ opacity: 0.82, filter: 'saturate(1.05)' }} />
            </div>

            {/* Layer 2 · Second creator blended for depth */}
            <div className="absolute inset-0" aria-hidden="true">
                <img src={HERO_IMG_ALT} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-soft-light" />
            </div>

            {/* Layer 3 · Cinematic grading (subtle darkening — favors legibility on the left) */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
                 style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.05) 100%)' }} />
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
                 style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.20) 0%, transparent 25%, transparent 70%, rgba(0,0,0,0.95) 100%)' }} />

            {/* Layer 4 · Glass-into-the-room frame — subtle inner glow suggesting looking through glass */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
                 style={{ boxShadow: 'inset 0 0 200px 40px rgba(0,0,0,0.6)' }} />

            {/* Layer 5 · INHEIRA identity glow + fine noise texture */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute -top-32 -right-32 w-[900px] h-[700px] rounded-full opacity-35" style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.20), transparent 65%)' }} />
                <div className="absolute -bottom-40 left-1/4 w-[700px] h-[500px] rounded-full opacity-25" style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.18), transparent 65%)' }} />
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.35) 1px, transparent 1px)', backgroundSize: '3px 3px' }} />
            </div>

            {/* Content */}
            <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 pt-16 md:pt-28 pb-16 md:pb-20 min-h-[calc(100vh-100px)] md:min-h-[780px] flex flex-col justify-between">
                {/* Header eyebrow row */}
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-slate-100 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                        Session in progress · Chicago
                    </div>
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-zinc-300">
                        / RIGHTPRINT · {user?.verification_status?.toUpperCase() || 'PENDING'}
                    </div>
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-zinc-400">
                        · {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </div>
                </div>

                {/* Hero copy — biased left so creators on the right stay the emotional center */}
                <div className="mt-16 md:mt-24 max-w-2xl">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.5em] text-slate-200 mb-6">
                        THE PERMANENT RECORD OF EVERY SONG YOU'VE HELPED CREATE
                    </div>
                    <h1 className="font-display font-black text-6xl md:text-8xl tracking-tighter leading-[0.88] text-white" style={{ textShadow: '0 4px 40px rgba(0,0,0,0.6)' }}>
                        Welcome home,
                        <br />
                        <span className="bg-gradient-to-r from-sky-100 via-indigo-100 to-violet-200 bg-clip-text text-transparent">{firstName}.</span>
                    </h1>
                    <p className="mt-8 text-zinc-100 max-w-xl text-base md:text-lg leading-relaxed" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.6)' }}>
                        Your collaborators, your contributions, your creative history — documented forever. Pick up where you left off. Your next song begins here.
                    </p>

                    <div className="mt-10 flex flex-wrap items-center gap-4">
                        <Link to="/sessions/new">
                            <Button data-testid={DASHBOARD.createSessionBtn} size="lg" className="bg-white hover:bg-zinc-200 text-black font-bold h-12 px-6 shadow-2xl">
                                <Plus className="w-4 h-4 mr-2" strokeWidth={2} /> Begin a new session
                            </Button>
                        </Link>
                        <Link to="/writing-rooms" className="group inline-flex items-center gap-2 h-12 px-5 border border-white/20 bg-white/[0.06] backdrop-blur-2xl hover:bg-white/10 transition-colors font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-white">
                            Step into a writing room <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" strokeWidth={2} />
                        </Link>
                    </div>
                </div>

                {/* Floating glass metric strip — feels like reading data through a frosted panel */}
                <div className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-3">
                    <GlassMetric testid={DASHBOARD.rightprint} icon={ShieldCheck} label="RightPrint" value={user?.verification_status === 'verified' ? 'Verified' : 'Pending'} accent={user?.verification_status === 'verified'} />
                    <GlassMetric icon={Music} label="Songs documented" value={sessions.length} />
                    <GlassMetric icon={Users} label="Collaborators on record" value={collaboratorCount} />
                    <GlassMetric testid={DASHBOARD.royaltyCard} icon={Coins} label="Est. earnings" value={`$${(royalties.total_earnings || 0).toFixed(2)}`} />
                </div>
            </div>
        </section>
    );
}

function GlassMetric({ icon: Icon, label, value, accent, testid }) {
    return (
        <div data-testid={testid} className="relative border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-5 md:p-6 overflow-hidden group hover:bg-white/[0.06] transition-colors">
            <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%)' }} />
            <Icon className={`relative w-4 h-4 mb-4 ${accent ? 'text-emerald-300' : 'text-indigo-200'}`} strokeWidth={1.5} />
            <div className="relative font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-300 mb-2">{label}</div>
            <div className="relative font-display font-bold text-2xl md:text-3xl text-white tracking-tight tabular-nums truncate">{value}</div>
        </div>
    );
}

/* ---------- Section wrapper ---------- */
function ChapterSection({ eyebrow, title, right, children }) {
    return (
        <section className="border-b border-zinc-900 bg-black">
            <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16 md:py-20">
                <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
                    <div>
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-3">{eyebrow}</div>
                        <h2 className="font-display font-black text-3xl md:text-5xl tracking-tighter text-white leading-[0.95]">{title}</h2>
                    </div>
                    {right}
                </div>
                {children}
            </div>
        </section>
    );
}

/* ---------- Metric tile ---------- */
function MetricTile({ icon: Icon, label, value, accent, testid }) {
    return (
        <div data-testid={testid} className="p-6 bg-black">
            <Icon className={`w-4 h-4 mb-4 ${accent ? 'text-emerald-400' : 'text-zinc-600'}`} strokeWidth={1.5} />
            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-2">{label}</div>
            <div className="font-display font-bold text-2xl text-white tracking-tight">{value}</div>
        </div>
    );
}

/* ---------- Life of a Song™ board ---------- */
function LifeOfSongBoard({ sessions, loading }) {
    // Always render the 10-stage spine, plot each session as a moving node.
    return (
        <div className="relative border border-zinc-900 bg-zinc-950/40 p-6 md:p-8 overflow-hidden">
            {/* Spine — scrollable on mobile so 10-node strip doesn't force page overflow */}
            <div className="relative h-16 mb-6 overflow-x-auto">
                <div className="relative h-full" style={{ minWidth: 640 }}>
                    <div className="absolute left-4 right-4 top-1/2 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
                    <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 flex justify-between">
                        {LIFE_STAGES.map((st, i) => (
                            <div key={st.key} className="flex flex-col items-center gap-2" style={{ width: 60 }}>
                                <div className="w-3 h-3 rounded-full bg-zinc-800 border border-zinc-700 shadow-[0_0_10px_rgba(129,140,248,0.15)]" />
                                <div className="font-mono-metadata text-[8px] uppercase tracking-[0.25em] text-zinc-600 whitespace-nowrap">
                                    {String(i + 1).padStart(2, '0')} · {st.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-8 text-zinc-600 font-mono-metadata text-xs uppercase tracking-[0.3em]">Loading…</div>
            ) : sessions.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-sm">Every song you create appears here — from the first idea to its lasting legacy.</div>
            ) : (
                <div className="space-y-3">
                    {sessions.map((s) => <SongLifeRow key={s.session_id} s={s} />)}
                </div>
            )}
        </div>
    );
}

function SongLifeRow({ s }) {
    const stage = inferStage(s);
    const stageMeta = LIFE_STAGES[stage - 1];
    const collabs = (s.collaborators || []).slice(0, 4);
    return (
        <Link to={`/sessions/${s.session_id}/studio`} className="group grid grid-cols-12 gap-3 items-center px-3 py-3 border border-zinc-900 hover:border-zinc-700 bg-black/40 transition-colors">
            <div className="col-span-4 min-w-0">
                <div className="text-white font-display font-semibold text-base truncate">{s.title}</div>
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-500 truncate">{s.working_title || s.project || 'Untitled project'}</div>
            </div>
            <div className="col-span-5 relative h-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-px bg-zinc-800" />
                </div>
                <div className="absolute inset-y-0 left-0 flex items-center" style={{ width: `${((stage - 1) / 9) * 100}%` }}>
                    <div className="h-px w-full bg-gradient-to-r from-indigo-400 to-sky-300" />
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: `${((stage - 1) / 9) * 100}%` }}>
                    <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.6)]" />
                </div>
            </div>
            <div className="col-span-2 flex items-center gap-2">
                <stageMeta.Icon className="w-3.5 h-3.5 text-indigo-300" strokeWidth={1.5} />
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-300">{stageMeta.label}</div>
            </div>
            <div className="col-span-1 flex justify-end -space-x-2">
                {collabs.map((c, i) => {
                    const p = colorForAncrId(c.user_id || String(i));
                    const initials = (c.name || '?').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
                    return (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-black flex items-center justify-center text-black font-display font-bold text-[9px]" style={{ background: p.hex, boxShadow: `0 0 10px ${p.glow}` }}>{initials}</div>
                    );
                })}
            </div>
        </Link>
    );
}

/* ---------- Live Room Card ---------- */
function LiveRoomCard({ room }) {
    return (
        <Link to="/writing-rooms" className="group border border-zinc-900 hover:border-zinc-700 bg-zinc-950 transition-colors overflow-hidden block">
            <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                    <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" strokeWidth={1.5} />
                        {room.city} · {room.country}
                    </div>
                    <div className={`flex items-center gap-1.5 font-mono-metadata text-[9px] uppercase tracking-[0.3em] ${room.live ? 'text-emerald-300' : 'text-zinc-500'}`}>
                        {room.live && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                        {room.live ? `Live · ${room.rec}` : room.rec}
                    </div>
                </div>
                <div className="font-display font-bold text-base text-white leading-tight mb-2">{room.name}</div>
                <div className="text-xs text-zinc-500 mb-4 truncate">{room.wip}</div>
                <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                        {room.participants.map((pid) => {
                            const c = CANONICAL_CAST.find(x => x.ancr_id === pid);
                            if (!c) return null;
                            const p = COLLABORATOR_PALETTE[c.color];
                            return (
                                <div key={pid} title={c.name} className="w-6 h-6 rounded-full border-2 border-zinc-950 flex items-center justify-center text-black font-display font-bold text-[9px]" style={{ background: p.hex, boxShadow: `0 0 10px ${p.glow}` }}>{c.initials}</div>
                            );
                        })}
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-mono-metadata uppercase tracking-[0.3em] text-zinc-600">
                        <Piano className="w-2.5 h-2.5" strokeWidth={1.5} />
                        <Mic className="w-2.5 h-2.5" strokeWidth={1.5} />
                        <Volume2 className="w-2.5 h-2.5" strokeWidth={1.5} />
                    </div>
                </div>
            </div>
        </Link>
    );
}

/* ---------- Cinematic Session Card ---------- */
function SessionCinematicCard({ s, finalized }) {
    const stage = inferStage(s);
    const stageMeta = LIFE_STAGES[stage - 1];
    const collabs = (s.collaborators || []).slice(0, 5);
    const rawCompletion = Number(s.completion);
    const completion = Math.round(Number.isFinite(rawCompletion) && rawCompletion > 0 ? rawCompletion : stage * 10);
    return (
        <Link to={`/sessions/${s.session_id}/studio`} className="group relative border border-zinc-900 hover:border-zinc-700 bg-zinc-950 transition-colors block overflow-hidden">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ background: 'radial-gradient(circle at top, rgba(129,140,248,0.06), transparent 60%)' }} />
            <div className="relative p-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
                        <stageMeta.Icon className="w-3 h-3 text-indigo-300" strokeWidth={1.5} />
                        <span className="text-indigo-300">{finalized ? 'FINALIZED' : stageMeta.label}</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" strokeWidth={1.5} />
                </div>
                <div className="font-display font-black text-2xl text-white tracking-tighter mb-1 truncate leading-tight">{s.title}</div>
                <div className="font-mono-metadata text-xs text-zinc-500 mb-6 truncate">{s.working_title || s.project || 'Untitled project'}</div>

                {/* Life of a Song mini-bar */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-600">Life of a Song</span>
                        <span className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500">{completion}%</span>
                    </div>
                    <div className="h-1 bg-zinc-900 relative overflow-hidden">
                        <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-400 to-sky-300" style={{ width: `${completion}%` }} />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                        {collabs.map((c, i) => {
                            const p = colorForAncrId(c.user_id || String(i));
                            const initials = (c.name || '?').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
                            return (
                                <div key={i} className="w-7 h-7 rounded-full border-2 border-zinc-950 flex items-center justify-center text-black font-display font-bold text-[10px]" style={{ background: p.hex, boxShadow: `0 0 12px ${p.glow}` }}>{initials}</div>
                            );
                        })}
                    </div>
                    <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-600">
                        {new Date(s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                </div>
            </div>
        </Link>
    );
}

/* ---------- Creative Evidence feed ---------- */
function buildEvidenceFeed(sessions, user) {
    const rows = [];
    // Prefer real events if backend exposes them; fallback to a cinematic canonical feed
    for (const s of sessions.slice(0, 5)) {
        const events = s.events || [];
        for (const ev of events.slice(-3).reverse()) {
            rows.push({
                session_id: s.session_id,
                title: s.title,
                type: ev.type || 'contribution',
                who: ev.by_name || user?.name || 'You',
                who_id: ev.by || (user?.user_id || 'ancr_self'),
                text: ev.text || ev.description || 'Contribution logged',
                at: ev.at || s.updated_at || s.created_at,
            });
        }
    }
    if (rows.length === 0) {
        // Fallback demo evidence pulled from canonical cast — same feel as Landing Ch. V
        return [
            { session_id: null, title: 'Skyline',       type: 'lyric_line',       who: 'Danielle Stephens', who_id: 'ancr_danielle', text: '“What if we open with — every light in the city was ours…”' , at: nowMinus(6) },
            { session_id: null, title: 'Skyline',       type: 'melody',           who: 'Chris Ohara',       who_id: 'ancr_chris',    text: 'Melody line locked · Chorus A (F#m → D → A → E)',                       at: nowMinus(24) },
            { session_id: null, title: 'Held Together', type: 'contribution',     who: 'Marcus Reyes',      who_id: 'ancr_marcus',   text: 'Added bass counter-melody · Verse 2',                                   at: nowMinus(90) },
            { session_id: null, title: 'Afterglow',     type: 'voice_memo',       who: 'Jimmie Vaughn',     who_id: 'ancr_jimmie',   text: 'Voice memo · 1m 12s (bridge idea)',                                     at: nowMinus(180) },
            { session_id: null, title: 'City Lights',   type: 'arrangement',      who: 'Sarah Bloom',       who_id: 'ancr_sarah',    text: 'Arrangement · added a pre-chorus lift',                                 at: nowMinus(360) },
            { session_id: null, title: 'Skyline',       type: 'split_modified',   who: 'Danielle Stephens', who_id: 'ancr_danielle', text: 'Proposed split · 45 / 30 / 25',                                          at: nowMinus(600) },
        ];
    }
    // Sort newest first, limit
    return rows.sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 6);
}
function nowMinus(mins) { return new Date(Date.now() - mins * 60 * 1000).toISOString(); }

function EvidenceFeed({ items }) {
    return (
        <div className="border border-zinc-900 bg-zinc-950/40">
            <div className="px-6 py-4 border-b border-zinc-900 flex items-center justify-between">
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">Immutable · Time-stamped</div>
                <div className="flex items-center gap-1.5 font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                </div>
            </div>
            <ul className="divide-y divide-zinc-900">
                {items.map((it, idx) => {
                    const c = colorForAncrId(it.who_id);
                    const initials = (it.who || '?').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
                    return (
                        <li key={idx} className="px-6 py-4 flex items-start gap-4">
                            <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-black font-display font-bold text-[10px]" style={{ background: c.hex, boxShadow: `0 0 14px ${c.glow}` }}>{initials}</div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-white text-sm font-semibold truncate" style={{ color: c.hex }}>{it.who}</span>
                                    <span className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-600 truncate">{prettyType(it.type)}</span>
                                    <span className="ml-auto font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-600 shrink-0">{timeAgo(it.at)}</span>
                                </div>
                                <div className="text-sm text-zinc-300 leading-relaxed truncate">{it.text}</div>
                                {it.title && (
                                    <div className="mt-1 font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-600">on · {it.title}</div>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
function prettyType(t) { return String(t).replace(/_/g, ' '); }
function timeAgo(iso) {
    const d = new Date(iso);
    const mins = Math.round((Date.now() - d.getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.round(hrs / 24);
    return `${days}d`;
}

/* ---------- Intelligence Pulse ---------- */
function buildPulse(sessions) {
    if (sessions.length === 0) {
        return { commercial: 74, releaseReady: 62, sync: 58, nextAction: 'Log a lyric contribution on your next session.' };
    }
    // Derive rough numbers from completion / collaborators (not persisted)
    const nums = sessions.map((s) => {
        const n = Number(s.completion);
        return Number.isFinite(n) && n > 0 ? n : 40;
    });
    const avg = Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
    return {
        commercial: Math.min(95, avg + 22),
        releaseReady: avg,
        sync: Math.min(90, avg + 8),
        nextAction: avg < 60 ? 'Add lyric evidence to your top session.' : 'Lock splits on your highest-completion session.',
    };
}
function IntelligencePulseCard({ pulse }) {
    return (
        <div className="border border-zinc-900 bg-zinc-950/40 p-6 h-full">
            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-4">/ SONG INTELLIGENCE™ · PULSE</div>
            <div className="text-white text-lg font-display font-bold tracking-tight mb-6 leading-tight">Aggregated across your active sessions.</div>
            <div className="space-y-4 mb-6">
                <ScoreRow label="Commercial" value={pulse.commercial} />
                <ScoreRow label="Release ready" value={pulse.releaseReady} />
                <ScoreRow label="Sync potential" value={pulse.sync} />
            </div>
            <div className="border-t border-zinc-900 pt-5">
                <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-2">Next best action</div>
                <div className="text-sm text-zinc-200 leading-relaxed">{pulse.nextAction}</div>
            </div>
        </div>
    );
}
function ScoreRow({ label, value }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-zinc-400">{label}</span>
                <span className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-white">{value}</span>
            </div>
            <div className="h-1 bg-zinc-900 relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-sky-300 via-indigo-300 to-indigo-300" style={{ width: `${value}%` }} />
            </div>
        </div>
    );
}

/* ---------- Passport Preview ---------- */
function PassportPreview({ user, sessions, earnings }) {
    const initials = (user?.name || '?').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
    const color = colorForAncrId(user?.user_id || 'self');
    const passportId = user?.user_id || 'ancr_self';
    return (
        <div className="relative border border-zinc-900 bg-gradient-to-br from-zinc-950 via-black to-zinc-950 overflow-hidden">
            <div className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full opacity-30" style={{ background: `radial-gradient(circle, ${color.glow}, transparent 65%)` }} />
            <div className="relative p-8 md:p-10">
                <div className="flex items-start gap-6 mb-8">
                    {user?.picture ? (
                        <img src={user.picture} alt="" className="w-20 h-20 rounded-full border-2" style={{ borderColor: color.hex, boxShadow: `0 0 28px ${color.glow}` }} />
                    ) : (
                        <div className="w-20 h-20 rounded-full flex items-center justify-center text-black font-display font-black text-2xl" style={{ background: color.hex, boxShadow: `0 0 28px ${color.glow}` }}>{initials}</div>
                    )}
                    <div className="min-w-0">
                        <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-1">Creator Passport™ · Living identity</div>
                        <div className="font-display font-black text-3xl md:text-4xl text-white tracking-tighter leading-none">{user?.name || 'Creator'}</div>
                        <div className="mt-2 flex items-center gap-3 font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                            <span>{user?.professional_name || user?.email || ''}</span>
                            {user?.verification_status === 'verified' && <span className="text-emerald-300">· Verified</span>}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-900">
                    <PassportStat label="Songs" value={sessions.length} />
                    <PassportStat label="Collaborators" value={new Set(sessions.flatMap(s => (s.collaborators || []).map(c => c.user_id))).size} />
                    <PassportStat label="Publishing" value={user?.publisher || 'Self'} />
                    <PassportStat label="Est. Earnings" value={`$${earnings.toFixed(0)}`} />
                </div>

                <div className="mt-8 flex items-center justify-between">
                    <div className="flex items-center gap-4 font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                        <span>Creator DNA™ · 10 dimensions</span>
                        <span>·</span>
                        <span>Grows every session</span>
                    </div>
                    <ModuleLink module="ancrid" subpath={`/${passportId}`} className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-white hover:text-indigo-300 transition-colors flex items-center gap-2">
                        Open passport <ArrowUpRight className="w-3 h-3" strokeWidth={1.5} />
                    </ModuleLink>
                </div>
            </div>
        </div>
    );
}
function PassportStat({ label, value }) {
    return (
        <div className="bg-black p-4">
            <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-1">{label}</div>
            <div className="font-display font-bold text-lg text-white tracking-tight truncate">{value}</div>
        </div>
    );
}

/* ---------- Release Path preview ---------- */
function ReleasePathCard({ sessions }) {
    // Pick the session closest to release
    const target = [...sessions].sort((a, b) => (b.completion || 0) - (a.completion || 0))[0];
    const steps = ['Rights', 'Split Sheet', 'Publishing', 'Vaulta', 'Release'];
    const stage = target ? inferStage(target) : 3;
    const activeStep = Math.min(steps.length - 1, Math.max(0, stage - 4));

    return (
        <div className="border border-zinc-900 bg-zinc-950/40 p-6 h-full">
            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-4">/ CONTINUOUS RELEASE PATH</div>
            <div className="text-white text-base font-display font-bold tracking-tight mb-1 leading-tight truncate">{target?.title || 'Your next release'}</div>
            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-6 truncate">{target?.working_title || target?.project || 'When splits lock, the release path begins.'}</div>

            <ol className="space-y-3">
                {steps.map((label, i) => {
                    const done = i < activeStep;
                    const current = i === activeStep;
                    return (
                        <li key={label} className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full border flex items-center justify-center font-mono-metadata text-[9px] ${done ? 'bg-emerald-400/20 border-emerald-400 text-emerald-300' : current ? 'bg-indigo-400/20 border-indigo-400 text-indigo-200 shadow-[0_0_14px_rgba(129,140,248,0.5)]' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>{i + 1}</div>
                            <span className={`text-sm ${done ? 'text-zinc-400 line-through' : current ? 'text-white' : 'text-zinc-500'}`}>{label}</span>
                        </li>
                    );
                })}
            </ol>

            {target && (
                <Link to={`/sessions/${target.session_id}/studio`} className="mt-6 inline-flex items-center gap-2 font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-white hover:text-indigo-300 transition-colors">
                    <Play className="w-3 h-3" strokeWidth={1.5} /> Continue release
                </Link>
            )}
        </div>
    );
}

/* ---------- Empty state ---------- */
function EmptyCard({ title, hint }) {
    return (
        <div className="col-span-full p-12 border border-dashed border-zinc-800 text-center bg-zinc-950/30">
            <div className="font-display font-semibold text-xl text-zinc-400 mb-2">{title}</div>
            <div className="text-sm text-zinc-600">{hint}</div>
        </div>
    );
}
