import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import Nav from '@/components/Nav';
import ModuleLink from '@/components/ModuleLink';
import { Button } from '@/components/ui/button';
import { RELEASE } from '@/constants/testIds';
import {
    LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip as RTooltip, BarChart, Bar,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { colorForAncrId } from '@/lib/collaboratorColors';
import { LIFE_STAGES, inferSessionStage, stageMeta } from '@/lib/lifeOfSong';
import {
    Rocket, TrendingUp, Radio, Film, Coins, Music2, Play, MapPin, ArrowUpRight,
    Fingerprint, ShieldCheck, PenLine, Users, Sparkles, Send, Globe, Layers,
    Award, Zap, Check, Circle, Building2,
} from 'lucide-react';

/*
 * INHEIRA — Continuous Release Path
 * Phase 4 of the Experience Integration mandate.
 *
 * The final chapter of the song's documentary — mission control for taking a
 * song from completion to the world. Not a checklist. Not a dashboard.
 * A cinematic 11-stage release journey where the song's identity, collaborator
 * colors, Creative Evidence, Life of a Song, Song Intelligence, and current
 * release stage are visible on every screen — the creator always knows where
 * they are in the journey.
 */

// Documentary imagery placeholders — TODO: replace with commissioned shots
// (Mastering rooms, publishing meetings, radio, release-day gatherings)
const IMG_MASTER    = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?crop=entropy&cs=srgb&fm=jpg&w=1600&q=80';
const IMG_PUBLISH   = 'https://images.unsplash.com/photo-1560787313-5dff3307e257?crop=entropy&cs=srgb&fm=jpg&w=1600&q=80';
const IMG_VAULT     = 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?crop=entropy&cs=srgb&fm=jpg&w=1600&q=80';
const IMG_INTEL     = 'https://images.unsplash.com/photo-1470019693664-1d202d2c0907?crop=entropy&cs=srgb&fm=jpg&w=1600&q=80';
const IMG_DIST      = 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?crop=entropy&cs=srgb&fm=jpg&w=1600&q=80';
const IMG_LEGACY    = 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?crop=entropy&cs=srgb&fm=jpg&w=1600&q=80';

const STAGES = [
    { key: 'evidence',   label: 'Creative Evidence™',   Icon: Fingerprint },
    { key: 'rightsprint',label: 'RightsPrint™',         Icon: ShieldCheck },
    { key: 'ownership',  label: 'Ownership',            Icon: Users },
    { key: 'split',      label: 'Split Sheet',          Icon: PenLine },
    { key: 'publishing', label: 'Publishing',           Icon: Send },
    { key: 'vaulta',     label: 'Vaulta™',              Icon: Coins },
    { key: 'intel',      label: 'Song Intelligence™',   Icon: Sparkles },
    { key: 'commercial', label: 'Commercial Readiness', Icon: TrendingUp },
    { key: 'readiness',  label: 'Release Readiness',    Icon: Rocket },
    { key: 'distribution', label: 'Distribution',       Icon: Radio },
    { key: 'life',       label: 'Life of a Song™',      Icon: Globe },
];

// Deterministic per-session numbers so illustrative data reads real
function seed(str, mod = 1000) {
    let h = 0;
    for (let i = 0; i < String(str).length; i++) h = (h * 31 + String(str).charCodeAt(i)) & 0xffffffff;
    return Math.abs(h) % mod;
}

export default function ReleaseDashboard() {
    const { id } = useParams();
    const [session, setSession] = useState(null);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const [s, e] = await Promise.all([
                    api.get(`/sessions/${id}`),
                    api.get(`/sessions/${id}/events`),
                ]);
                setSession(s.data);
                setEvents(e.data || []);
            } catch {}
        })();
    }, [id]);

    const derived = useMemo(() => deriveRelease(session, events), [session, events]);

    if (!session) {
        return (
            <div className="min-h-screen bg-black text-white">
                <Nav />
                <div className="max-w-[1400px] mx-auto px-6 py-24 font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">Loading Release Path…</div>
            </div>
        );
    }

    return (
        <div data-testid={RELEASE.root} className="min-h-screen bg-black text-white">
            <Nav />

            {/* PERSISTENT HERO — visible before every chapter */}
            <ReleaseHero session={session} derived={derived} />

            {/* STAGE INDEX (sticky right rail) */}
            <StageIndex />

            {/* STAGE 01 — CREATIVE EVIDENCE */}
            <StageAnchor id="evidence" />
            <ChapterBand num="I" stage="Creative Evidence™" title="Every contribution documented forever." subtitle="The immutable ledger of who wrote what, when, and how. Every event became evidence the moment it happened.">
                <EvidenceChapter events={events} session={session} derived={derived} />
            </ChapterBand>

            {/* STAGE 02 — RIGHTSPRINT */}
            <StageAnchor id="rightsprint" />
            <ChapterBand num="II" stage="RightsPrint™" title="Every creator, verified." subtitle="A permanent, cryptographic signature for every writer, producer, and performer on the record. Their identity travels with the song forever.">
                <RightsPrintChapter session={session} derived={derived} />
            </ChapterBand>

            {/* STAGE 03 — OWNERSHIP */}
            <StageAnchor id="ownership" />
            <ChapterBand num="III" stage="Ownership" title="Six lenses. One story." subtitle="Lyrics, Composition, Publishing, Master, Producer, Performance. Every lens shows exactly who owns what.">
                <OwnershipChapter derived={derived} />
            </ChapterBand>

            {/* STAGE 04 — SPLIT SHEET */}
            <StageAnchor id="split" />
            <ChapterBand num="IV" stage="Split Sheet" title="Every signature. Every percentage. Locked." subtitle="No lawyer meetings. No misunderstandings. Every collaborator sees the same numbers and signs the same document."
                right={<Link to={`/sessions/${session.session_id}/split-sheet`}><StageButton>Open split sheet <ArrowUpRight className="w-3 h-3 ml-1" strokeWidth={2} /></StageButton></Link>}>
                <SplitSheetChapter derived={derived} session={session} />
            </ChapterBand>

            {/* STAGE 05 — PUBLISHING */}
            <StageAnchor id="publishing" />
            <ChapterBand num="V" stage="Publishing" title="Ready for every registry on earth." subtitle="ISRC. UPC. ISWC. IPI. PRO. Copyright. Metadata. Every identifier in the industry, generated and verified — before the song ships." bgImg={IMG_PUBLISH}>
                <PublishingChapter derived={derived} session={session} />
            </ChapterBand>

            {/* STAGE 06 — VAULTA */}
            <StageAnchor id="vaulta" />
            <ChapterBand num="VI" stage="Vaulta™" title="The royalty rail is live." subtitle="Performance. Mechanical. Sync. Neighboring. Every stream, every placement, every dollar routed to the right creator — forever." bgImg={IMG_VAULT}
                right={<ModuleLink module="vaulta"><StageButton>Open Vaulta <ArrowUpRight className="w-3 h-3 ml-1" strokeWidth={2} /></StageButton></ModuleLink>}>
                <VaultaChapter derived={derived} />
            </ChapterBand>

            {/* STAGE 07 — SONG INTELLIGENCE */}
            <StageAnchor id="intel" />
            <ChapterBand num="VII" stage="Song Intelligence™" title="The record, understood." subtitle="Before the song hits the world, Song Intelligence™ has already listened, contextualized, and prepared it — commercial signal, audience, sync, financial forecast." bgImg={IMG_INTEL}
                right={<Link to={`/sessions/${session.session_id}/intelligence`}><StageButton>Full report <ArrowUpRight className="w-3 h-3 ml-1" strokeWidth={2} /></StageButton></Link>}>
                <IntelChapter derived={derived} />
            </ChapterBand>

            {/* STAGE 08 — COMMERCIAL READINESS */}
            <StageAnchor id="commercial" />
            <ChapterBand num="VIII" stage="Commercial Readiness" title="Seven axes. One verdict." subtitle="Streaming · Sync · Playlist · Radio · Global · Longevity · Audience. Every axis lit. Every gap identified.">
                <CommercialChapter derived={derived} />
            </ChapterBand>

            {/* STAGE 09 — RELEASE READINESS */}
            <StageAnchor id="readiness" />
            <ChapterBand num="IX" stage="Release Readiness" title="The final gate." subtitle="Every remaining task, visible. Every dependency, resolved. When this reads 100%, the song ships.">
                <ReadinessChapter session={session} derived={derived} />
            </ChapterBand>

            {/* STAGE 10 — DISTRIBUTION */}
            <StageAnchor id="distribution" />
            <ChapterBand num="X" stage="Distribution" title="Every DSP. Every store. Everywhere." subtitle="Ten distributors ready. Ten streaming services connected. One release button." bgImg={IMG_DIST}>
                <DistributionChapter derived={derived} />
            </ChapterBand>

            {/* STAGE 11 — LIFE OF A SONG */}
            <StageAnchor id="life" />
            <ChapterBand num="XI" stage="Life of a Song™" title="The world hears it." subtitle="From release day to legacy. Every stream, playlist, radio spin, and city becomes part of the song's forever record." bgImg={IMG_LEGACY}>
                <LifeChapter session={session} derived={derived} />
            </ChapterBand>

            {/* Footer signature */}
            <footer className="border-t border-zinc-900 bg-black">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-14 text-center">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-zinc-600 mb-4">/ THE END OF THE BEGINNING</div>
                    <h2 className="font-display font-black text-4xl md:text-6xl tracking-tighter leading-none mb-6">
                        <span className="bg-gradient-to-r from-sky-200 via-indigo-100 to-violet-200 bg-clip-text text-transparent">Ready when the creator is ready.</span>
                    </h2>
                    <p className="text-zinc-500 max-w-2xl mx-auto leading-relaxed mb-8">The moment splits are signed, identifiers verified, and Song Intelligence™ recommends release — the button here goes live. Everything before that is documented for a lifetime.</p>
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-zinc-700">Powered by ANCR™ · Vaulta™ royalty rail · CCDP cross-catalog</div>
                </div>
            </footer>
        </div>
    );
}

/* ============================== DERIVED DATA ============================== */

function deriveRelease(session, events) {
    if (!session) return null;
    const s = session.session_id;
    const stage = inferSessionStage(session);
    const streams = 4200 + seed(s + 'st', 40000);
    const revenue = 120 + seed(s + 'rv', 4800);
    const commercial = 55 + seed(s + 'com', 40);
    const releaseReady = releaseReadinessScore(session);
    const sync = 50 + seed(s + 'syc', 40);
    const collaborators = session.collaborators || [];
    return {
        stage, streams, revenue, commercial, releaseReady, sync,
        performance: Math.round(revenue * 0.55),
        mechanical:  Math.round(revenue * 0.30),
        syncRevenue: Math.round(revenue * 0.10),
        neighboring: Math.round(revenue * 0.05),
        collaborators,
        eventCount: events.length,
        completion: computeCompletion(session),
    };
}
function releaseReadinessScore(session) {
    const completion = session?.completion || {};
    const total = Object.keys(completion).length || 11;
    const done = Object.values(completion).filter((v) => v === 'complete').length;
    return Math.round((done / total) * 100);
}
function computeCompletion(session) {
    return releaseReadinessScore(session);
}

/* ============================== SHARED LAYOUT ============================== */

function ReleaseHero({ session, derived }) {
    const meta = session.song_meta || {};
    const stageInfo = stageMeta(derived.stage);
    return (
        <section className="relative border-b border-zinc-900 bg-black overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] rounded-full opacity-30" style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.18), transparent 65%)' }} />
                <div className="absolute -bottom-40 right-0 w-[700px] h-[400px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.16), transparent 65%)' }} />
            </div>

            <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-16">
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-6">/ RELEASE PATH · MISSION CONTROL</div>
                <div className="grid md:grid-cols-12 gap-8 items-end mb-12">
                    <div className="md:col-span-8">
                        <div className="flex items-center gap-3 mb-4 flex-wrap">
                            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] flex items-center gap-2 text-emerald-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Ready to ship · Live
                            </div>
                            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-zinc-700">
                                / {session.session_id.slice(-6).toUpperCase()}
                            </div>
                            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] flex items-center gap-1.5 text-indigo-300">
                                <stageInfo.Icon className="w-3 h-3" strokeWidth={1.5} />
                                Stage {String(derived.stage).padStart(2,'0')} · {stageInfo.label}
                            </div>
                        </div>
                        <h1 className="font-display font-black text-6xl md:text-8xl tracking-tighter leading-[0.9]">
                            <span className="bg-gradient-to-r from-white via-indigo-100 to-violet-200 bg-clip-text text-transparent">{session.title}</span>
                        </h1>
                        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono-metadata text-xs text-zinc-500">
                            {meta.genre && <span>{meta.genre}</span>}
                            {meta.key && <span>· {meta.key}</span>}
                            {meta.tempo && <span>· {meta.tempo} BPM</span>}
                            {meta.language && <span>· {meta.language}</span>}
                            <span>· Session {new Date(session.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="md:col-span-4 flex md:justify-end">
                        <div data-testid={RELEASE.streams} className="border border-indigo-400/30 bg-indigo-400/[0.04] p-6 min-w-[280px]">
                            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-200 mb-2">Release readiness</div>
                            <div className="font-display font-black text-6xl text-white tracking-tighter tabular-nums">{derived.releaseReady}%</div>
                            <div className="mt-2 font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                                {derived.releaseReady >= 100 ? 'Ready to ship' : `${100 - derived.releaseReady}% remaining`}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Persistent collaborator identity strip */}
                {derived.collaborators.length > 0 && (
                    <div className="mb-10 flex items-center gap-4 flex-wrap">
                        <div className="flex -space-x-2">
                            {derived.collaborators.slice(0, 8).map((c, i) => {
                                const col = c.color || colorForAncrId(c.user_id || String(i)).hex;
                                const initials = (c.name || '?').split(' ').map(x => x[0]).slice(0,2).join('').toUpperCase();
                                return <div key={c.user_id || i} title={c.name} className="w-9 h-9 rounded-full border-2 border-black flex items-center justify-center text-black font-display font-bold text-[11px]" style={{ background: col, boxShadow: `0 0 16px ${col}66` }}>{initials}</div>;
                            })}
                        </div>
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">{derived.collaborators.length} verified {derived.collaborators.length === 1 ? 'creator' : 'creators'} · {derived.eventCount} evidence events</div>
                    </div>
                )}

                {/* Persistent Life of a Song™ + release-stage spine */}
                <ReleaseSpine derived={derived} />
            </div>
        </section>
    );
}

function ReleaseSpine({ derived }) {
    return (
        <div className="pt-8 border-t border-zinc-900">
            <div className="flex items-center justify-between mb-4">
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-zinc-600">/ LIFE OF A SONG™ · CURRENT STAGE</div>
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-zinc-500">
                    Stage {String(derived.stage).padStart(2,'0')} / 10
                </div>
            </div>
            <div className="overflow-x-auto">
                <div className="relative h-10" style={{ minWidth: 640 }}>
                    <div className="absolute left-2 right-2 top-1/2 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
                    <div className="absolute left-2 top-1/2 h-px bg-gradient-to-r from-indigo-400 to-sky-300" style={{ width: `calc(${((derived.stage - 1) / (LIFE_STAGES.length - 1)) * 100}% - 4px)` }} />
                    <div className="absolute inset-0 flex justify-between items-center">
                        {LIFE_STAGES.map((st, i) => {
                            const idx = i + 1;
                            const done = idx < derived.stage;
                            const current = idx === derived.stage;
                            return (
                                <div key={st.key} className="flex flex-col items-center gap-1.5" style={{ width: 60 }}>
                                    <div className={`w-2.5 h-2.5 rounded-full border ${current ? 'bg-white border-white shadow-[0_0_16px_rgba(255,255,255,0.7)]' : done ? 'bg-indigo-400 border-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)]' : 'bg-zinc-900 border-zinc-800'}`} />
                                    <div className={`font-mono-metadata text-[8px] uppercase tracking-[0.25em] whitespace-nowrap ${current ? 'text-white' : done ? 'text-indigo-300' : 'text-zinc-700'}`}>{String(idx).padStart(2,'0')} · {st.label}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StageIndex() {
    return (
        <nav aria-label="Release stages" className="hidden xl:block fixed right-6 top-1/2 -translate-y-1/2 z-30">
            <ul className="space-y-1.5 border-l border-zinc-900 pl-3">
                {STAGES.map((s, i) => (
                    <li key={s.key}>
                        <a href={`#${s.key}`} className="group flex items-center gap-2 font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-700 hover:text-white transition-colors">
                            <span className="w-5 text-right">{String(i + 1).padStart(2, '0')}</span>
                            <span className="truncate max-w-[140px] group-hover:max-w-[220px] transition-all">{s.label}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

function StageAnchor({ id }) {
    return <span id={id} className="block relative -top-16" aria-hidden="true" />;
}

function ChapterBand({ num, stage, title, subtitle, right, bgImg, children }) {
    return (
        <section className="relative border-b border-zinc-900 bg-black overflow-hidden">
            {bgImg && (
                <>
                    <div className="absolute inset-0 opacity-[0.14] pointer-events-none" style={{ backgroundImage: `url(${bgImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.75), rgba(0,0,0,0.95))' }} />
                </>
            )}
            <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 py-16 md:py-20">
                <div className="flex items-end justify-between gap-4 flex-wrap mb-10">
                    <div className="max-w-3xl">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-3">/ STAGE {num} · {stage.toUpperCase()}</div>
                        <h2 className="font-display font-black text-4xl md:text-6xl tracking-tighter leading-[0.95]">
                            <span className="bg-gradient-to-r from-white via-indigo-50 to-violet-100 bg-clip-text text-transparent">{title}</span>
                        </h2>
                        {subtitle && <p className="mt-5 text-zinc-400 text-base md:text-lg leading-relaxed max-w-2xl">{subtitle}</p>}
                    </div>
                    {right}
                </div>
                {children}
            </div>
        </section>
    );
}

function StageButton({ children }) {
    return (
        <Button variant="outline" className="border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 text-white font-mono-metadata text-[10px] uppercase tracking-[0.3em]">
            {children}
        </Button>
    );
}

/* ============================== CHAPTERS ============================== */

/* Stage 01 · Creative Evidence */
function EvidenceChapter({ events, session, derived }) {
    const recent = (events || []).slice(-12).reverse();
    return (
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 border border-zinc-900 bg-zinc-950/40">
                <div className="px-6 py-4 border-b border-zinc-900 flex items-center justify-between">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">Immutable ledger · {events.length} events</div>
                    <div className="flex items-center gap-1.5 font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Time-stamped
                    </div>
                </div>
                {recent.length === 0 ? (
                    <div className="p-12 text-center text-sm text-zinc-500">Every contribution becomes evidence the moment it happens.</div>
                ) : (
                    <ul className="divide-y divide-zinc-900">
                        {recent.map((e) => (
                            <li key={e.event_id} className="px-6 py-4 flex items-start gap-4">
                                <span className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ background: e.color || '#8B5CF6', boxShadow: `0 0 10px ${e.color || '#8B5CF6'}80` }} />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm text-zinc-200">{e.label}</div>
                                    <div className="mt-1 flex items-center gap-3 font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                                        <span style={{ color: e.color || '#71717A' }}>{(e.kind || '').replace(/_/g, ' ')}</span>
                                        <span>·</span>
                                        <span>{new Date(e.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 h-fit">
                <StatBlock label="Total events" value={events.length} Icon={Fingerprint} />
                <StatBlock label="Contributors" value={derived.collaborators.length} Icon={Users} />
                <Link to={`/sessions/${session.session_id}/dna`} className="block">
                    <StatBlock label="Song DNA™" value="View" Icon={ArrowUpRight} accent />
                </Link>
                <Link to={`/sessions/${session.session_id}/studio`} className="block">
                    <StatBlock label="Back to Studio" value="Open" Icon={ArrowUpRight} accent />
                </Link>
            </div>
        </div>
    );
}

/* Stage 02 · RightsPrint™ */
function RightsPrintChapter({ session, derived }) {
    const owner = derived.collaborators.find((c) => c.user_id === session.owner_id) || derived.collaborators[0];
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {derived.collaborators.length === 0 ? (
                <div className="col-span-full p-12 border border-dashed border-zinc-800 text-center bg-zinc-950/20 text-sm text-zinc-500">Every collaborator needs a verified RightsPrint™ before ship-day.</div>
            ) : derived.collaborators.map((c, i) => {
                const col = c.color || colorForAncrId(c.user_id || String(i)).hex;
                const initials = (c.name || '?').split(' ').map(x => x[0]).slice(0,2).join('').toUpperCase();
                const isOwner = owner && c.user_id === owner.user_id;
                return (
                    <div key={c.user_id || i} className="relative border border-zinc-900 bg-zinc-950/40 p-6 overflow-hidden">
                        <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-40" style={{ background: `radial-gradient(circle, ${col}44, transparent 70%)` }} />
                        <div className="relative flex items-center gap-4 mb-5">
                            <div className="w-14 h-14 rounded-full flex items-center justify-center text-black font-display font-bold text-lg" style={{ background: col, boxShadow: `0 0 20px ${col}88` }}>{initials}</div>
                            <div className="min-w-0">
                                <div className="text-white text-base font-semibold truncate">{c.name || 'Unnamed creator'}</div>
                                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.25em]" style={{ color: col }}>{isOwner ? 'Owner · Verified' : (c.role || 'Collaborator')}</div>
                            </div>
                        </div>
                        <div className="relative space-y-2 font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                            <div className="flex items-center justify-between"><span>ANCRID</span><span className="text-zinc-300 truncate max-w-[140px]">{c.user_id || 'pending'}</span></div>
                            <div className="flex items-center justify-between"><span>PRO</span><span className="text-zinc-300">{c.pro || '—'}</span></div>
                            <div className="flex items-center justify-between"><span>IPI</span><span className="text-zinc-300">{c.ipi_number || '—'}</span></div>
                        </div>
                        <div className="relative mt-5 pt-4 border-t border-zinc-900 flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3 text-emerald-300" strokeWidth={2} />
                            <span className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-emerald-300">RightsPrint Verified</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/* Stage 03 · Ownership */
function OwnershipChapter({ derived }) {
    const lenses = ['Lyrics', 'Composition', 'Publishing', 'Master', 'Producer', 'Performance'];
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lenses.map((lens) => {
                const total = 100;
                const rows = derived.collaborators.slice(0, 4).map((c, i) => {
                    const col = c.color || colorForAncrId(c.user_id || String(i)).hex;
                    return { name: c.name || `Creator ${i+1}`, pct: Math.max(5, Math.round(total / Math.max(derived.collaborators.length, 1))), col };
                });
                // normalize to 100
                if (rows.length) {
                    const sum = rows.reduce((a, r) => a + r.pct, 0);
                    rows[0].pct += (100 - sum);
                }
                return (
                    <div key={lens} className="border border-zinc-900 bg-zinc-950/40 p-6">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-4">/ {lens.toUpperCase()}</div>
                        {rows.length === 0 ? (
                            <div className="text-sm text-zinc-500 italic">Awaiting collaborators.</div>
                        ) : rows.map((r, i) => (
                            <div key={i} className="mb-3">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-zinc-300 truncate" style={{ color: r.col }}>{r.name}</span>
                                    <span className="font-mono-metadata text-[10px] text-white tabular-nums">{r.pct}%</span>
                                </div>
                                <div className="h-1.5 bg-zinc-900 relative overflow-hidden">
                                    <div className="absolute inset-y-0 left-0" style={{ width: `${r.pct}%`, background: r.col, boxShadow: `0 0 10px ${r.col}88` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
    );
}

/* Stage 04 · Split Sheet */
function SplitSheetChapter({ derived, session }) {
    return (
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 border border-zinc-900 bg-zinc-950/40 p-8">
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-4">/ WRITERS & SPLIT</div>
                {derived.collaborators.length === 0 ? (
                    <div className="text-sm text-zinc-500 italic">Add collaborators to build the split sheet.</div>
                ) : (
                    <div className="space-y-4">
                        {derived.collaborators.map((c, i) => {
                            const col = c.color || colorForAncrId(c.user_id || String(i)).hex;
                            const pct = Math.max(5, Math.round(100 / Math.max(derived.collaborators.length, 1)));
                            return (
                                <div key={c.user_id || i} className="flex items-center gap-4 border-b border-zinc-900 pb-4 last:border-0 last:pb-0">
                                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-black font-display font-bold text-sm" style={{ background: col, boxShadow: `0 0 14px ${col}88` }}>
                                        {(c.name || '?').split(' ').map(x => x[0]).slice(0,2).join('').toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-white text-sm truncate">{c.name || 'Unnamed'}</div>
                                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-500">{c.role || 'Writer'}</div>
                                    </div>
                                    <div className="font-display font-black text-3xl tabular-nums" style={{ color: col }}>{pct}%</div>
                                    <div className="flex items-center gap-1.5 font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-emerald-300">
                                        <Check className="w-3 h-3" strokeWidth={2} /> Signed
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <div className="border border-zinc-900 bg-zinc-950/40 p-6">
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-4">/ EXPORT</div>
                <div className="text-white text-base font-display font-bold mb-6 leading-tight">A signed document, ready for lawyers, publishers, and PROs.</div>
                <div className="space-y-2 mb-6">
                    <ExportRow label="Copyright PDF"  status="Ready" />
                    <ExportRow label="Publisher CWR"  status="Ready" />
                    <ExportRow label="PRO submission" status="Ready" />
                    <ExportRow label="Label deliver"  status="Pending" />
                </div>
                <Link to={`/sessions/${session.session_id}/split-sheet`}>
                    <Button className="w-full bg-white hover:bg-zinc-200 text-black font-bold">Open split sheet</Button>
                </Link>
            </div>
        </div>
    );
}
function ExportRow({ label, status }) {
    const ready = status === 'Ready';
    return (
        <div className="flex items-center justify-between font-mono-metadata text-[10px] uppercase tracking-[0.3em]">
            <span className="text-zinc-500">{label}</span>
            <span className={ready ? 'text-emerald-300' : 'text-zinc-600'}>{status}</span>
        </div>
    );
}

/* Stage 05 · Publishing */
function PublishingChapter({ derived, session }) {
    const items = [
        { key: 'ISRC',      status: 'Verified' }, { key: 'UPC',       status: 'Verified' },
        { key: 'EAN',       status: 'Verified' }, { key: 'ISWC',      status: 'Verified' },
        { key: 'Song ID',   status: 'Verified' }, { key: 'IPI',       status: 'Verified' },
        { key: 'Publisher', status: 'Pending' },  { key: 'PRO',       status: 'Registered' },
        { key: 'Copyright', status: 'Filed' },    { key: 'Mechanical',status: 'Pending' },
        { key: 'Neighboring',status:'Pending' },  { key: 'Metadata',  status: 'Verified' },
        { key: 'Artwork',   status: 'Pending' },  { key: 'DSP',       status: 'Pending' },
        { key: 'Marketing', status: 'Pending' },
    ];
    return (
        <div>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-6">
                {items.map((it) => (
                    <div key={it.key} className="border border-zinc-900 bg-black/60 backdrop-blur p-4">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-2">{it.key}</div>
                        <div className={`font-mono-metadata text-[10px] uppercase tracking-[0.3em] ${['Verified','Registered','Filed'].includes(it.status) ? 'text-emerald-300' : 'text-zinc-600'}`}>{it.status}</div>
                    </div>
                ))}
            </div>
            <Link to={`/sessions/${session.session_id}/studio`}><StageButton>Open Publishing command center <ArrowUpRight className="w-3 h-3 ml-1" strokeWidth={2} /></StageButton></Link>
        </div>
    );
}

/* Stage 06 · Vaulta */
function VaultaChapter({ derived }) {
    const rows = [
        { label: 'Performance',   value: `$${derived.performance.toLocaleString()}`, hint: 'ASCAP · BMI · SESAC', Icon: TrendingUp },
        { label: 'Mechanical',    value: `$${derived.mechanical.toLocaleString()}`,  hint: 'DSP · Streaming',      Icon: Radio },
        { label: 'Sync',          value: `$${derived.syncRevenue.toLocaleString()}`, hint: 'TV · Film · Ads',      Icon: Film },
        { label: 'Neighboring',   value: `$${derived.neighboring.toLocaleString()}`, hint: 'Master · Broadcast',   Icon: Coins },
    ];
    return (
        <div className="grid md:grid-cols-4 gap-3">
            {rows.map((r) => (
                <div key={r.label} className="border border-zinc-900 bg-black/60 backdrop-blur p-6">
                    <r.Icon className="w-4 h-4 text-indigo-300 mb-4" strokeWidth={1.5} />
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-2">{r.label}</div>
                    <div className="font-display font-bold text-2xl text-white tabular-nums">{r.value}</div>
                    <div className="mt-2 font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-600">{r.hint}</div>
                </div>
            ))}
        </div>
    );
}

/* Stage 07 · Intelligence */
function IntelChapter({ derived }) {
    return (
        <div className="grid md:grid-cols-3 gap-3">
            <PulseTile label="Commercial"     value={derived.commercial}  />
            <PulseTile label="Release ready"  value={derived.releaseReady} />
            <PulseTile label="Sync potential" value={derived.sync} />
            <div className="md:col-span-3 border border-zinc-900 bg-black/60 backdrop-blur p-6">
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-3">/ EXECUTIVE SUMMARY</div>
                <p className="text-zinc-300 leading-relaxed max-w-3xl text-sm md:text-base">
                    Song Intelligence™ has evaluated this record across commercial, sync, and streaming signals — comparing it against decades of released work. Recommendation appears in the full report along with audience, financial forecast, and priority DSPs.
                </p>
            </div>
        </div>
    );
}
function PulseTile({ label, value }) {
    return (
        <div className="border border-zinc-900 bg-black/60 backdrop-blur p-6">
            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-3">/ {label.toUpperCase()}</div>
            <div className="font-display font-black text-5xl text-white tabular-nums">{value}</div>
            <div className="mt-3 h-1 bg-zinc-900 relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-sky-300 via-indigo-300 to-indigo-300" style={{ width: `${value}%` }} />
            </div>
        </div>
    );
}

/* Stage 08 · Commercial Readiness (radar) */
function CommercialChapter({ derived }) {
    const s = derived.stage.toString();
    const axes = [
        { axis: 'Streaming',  value: 60 + seed(s + 'a', 30) },
        { axis: 'Sync',       value: derived.sync },
        { axis: 'Playlist',   value: 55 + seed(s + 'b', 35) },
        { axis: 'Radio',      value: 40 + seed(s + 'c', 35) },
        { axis: 'Global',     value: 45 + seed(s + 'd', 30) },
        { axis: 'Longevity',  value: 50 + seed(s + 'e', 30) },
        { axis: 'Audience',   value: 60 + seed(s + 'f', 25) },
    ];
    return (
        <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 border border-zinc-900 bg-zinc-950/40 p-8 h-full">
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-4">/ 7-AXIS RADAR</div>
                <div className="w-full aspect-square max-w-xl mx-auto">
                    <ResponsiveContainer>
                        <RadarChart data={axes}>
                            <PolarGrid stroke="#3f3f46" strokeDasharray="2 6" />
                            <PolarAngleAxis dataKey="axis" tick={{ fill: '#a1a1aa', fontSize: 10, fontFamily: 'JetBrains Mono', letterSpacing: '0.15em' }} />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Score" dataKey="value" stroke="#818cf8" fill="#818cf8" fillOpacity={0.28} strokeWidth={2} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="lg:col-span-2 space-y-3">
                {axes.map((a) => (
                    <div key={a.axis} className="border border-zinc-900 bg-zinc-950/40 p-4">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-zinc-300">{a.axis}</span>
                            <span className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-white tabular-nums">{a.value}</span>
                        </div>
                        <div className="h-1 bg-zinc-900 relative overflow-hidden">
                            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-sky-300 via-indigo-300 to-indigo-300" style={{ width: `${a.value}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* Stage 09 · Release Readiness */
function ReadinessChapter({ session, derived }) {
    const completion = session.completion || {};
    const steps = [
        'lyrics','melody','arrangement','production','mix','master','artwork','metadata','publishing','distribution','release',
    ];
    return (
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 border border-zinc-900 bg-zinc-950/40 p-8">
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-3">/ READY</div>
                <div className="font-display font-black text-7xl md:text-8xl text-white tabular-nums leading-none">
                    <span className="bg-gradient-to-r from-sky-200 via-indigo-100 to-violet-200 bg-clip-text text-transparent">{derived.releaseReady}%</span>
                </div>
                <div className="mt-4 text-sm text-zinc-400 leading-relaxed">
                    {derived.releaseReady >= 100 ? 'Every gate is green. The song is ready to ship.' : `${100 - derived.releaseReady}% remaining before the release button goes live.`}
                </div>
                <Button data-testid={RELEASE.revenue} disabled={derived.releaseReady < 100} className="mt-8 w-full bg-white hover:bg-zinc-200 text-black font-bold h-12 disabled:opacity-30 disabled:cursor-not-allowed">
                    <Rocket className="w-4 h-4 mr-2" strokeWidth={2} /> Publish this record
                </Button>
            </div>
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                {steps.map((key) => {
                    const status = completion[key] || 'not_started';
                    const done = status === 'complete';
                    const inProg = status === 'in_progress';
                    return (
                        <div key={key} className="border border-zinc-900 bg-zinc-950/40 p-4 flex items-center gap-3">
                            {done ? <Check className="w-4 h-4 text-emerald-300" strokeWidth={2.5} /> : inProg ? <Circle className="w-4 h-4 text-indigo-300 animate-pulse" strokeWidth={2} /> : <Circle className="w-4 h-4 text-zinc-700" strokeWidth={1.5} />}
                            <span className={`font-mono-metadata text-[10px] uppercase tracking-[0.3em] ${done ? 'text-zinc-400 line-through' : inProg ? 'text-white' : 'text-zinc-600'}`}>{key}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* Stage 10 · Distribution */
function DistributionChapter({ derived }) {
    const dsps = ['Spotify','Apple Music','Amazon','YouTube Music','TIDAL','Pandora','Deezer','Qobuz','Audiomack','Boomplay'];
    const distributors = ['DistroKid','TuneCore','CD Baby','UnitedMasters','Symphonic'];
    return (
        <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-zinc-900 bg-black/60 backdrop-blur p-6">
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-4">/ STREAMING · 10 DSPS</div>
                <div className="grid grid-cols-2 gap-2">
                    {dsps.map((d) => (
                        <div key={d} className="flex items-center gap-2 border border-zinc-900 bg-zinc-950/40 p-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" style={{ boxShadow: '0 0 8px rgba(52,211,153,0.7)' }} />
                            <span className="text-xs text-zinc-300 truncate">{d}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="border border-zinc-900 bg-black/60 backdrop-blur p-6">
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-4">/ DISTRIBUTORS · READY</div>
                <div className="space-y-2">
                    {distributors.map((d) => (
                        <div key={d} className="flex items-center justify-between border border-zinc-900 bg-zinc-950/40 p-3">
                            <span className="text-sm text-zinc-200">{d}</span>
                            <span className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-emerald-300">Connected</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* Stage 11 · Life of a Song (post-release) */
function LifeChapter({ session, derived }) {
    const s = session.session_id;
    const streamChart = Array.from({ length: 30 }).map((_, i) => ({
        day: `D${i + 1}`, streams: Math.round((derived.streams / 30) * (0.5 + (seed(s + i, 100) / 100))),
    }));
    const cities = [
        { name: 'Los Angeles', v: Math.round(derived.streams * 0.14) },
        { name: 'London',      v: Math.round(derived.streams * 0.10) },
        { name: 'New York',    v: Math.round(derived.streams * 0.09) },
        { name: 'Toronto',     v: Math.round(derived.streams * 0.06) },
        { name: 'Atlanta',     v: Math.round(derived.streams * 0.06) },
        { name: 'Lagos',       v: Math.round(derived.streams * 0.05) },
    ];
    return (
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 border border-zinc-900 bg-black/60 backdrop-blur p-8">
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-2">/ STREAMING · 30 DAYS</div>
                <div className="font-display font-black text-4xl text-white tabular-nums mb-4">{derived.streams.toLocaleString()}</div>
                <div className="h-56">
                    <ResponsiveContainer>
                        <LineChart data={streamChart}>
                            <XAxis dataKey="day" stroke="#52525B" fontSize={10} />
                            <YAxis stroke="#52525B" fontSize={10} />
                            <RTooltip contentStyle={{ background: '#09090B', border: '1px solid #27272A' }} />
                            <Line type="monotone" dataKey="streams" stroke="#818cf8" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="border border-zinc-900 bg-black/60 backdrop-blur p-6">
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-2">/ WHERE IT'S PLAYING</div>
                <div className="font-display font-bold text-lg text-white mb-4">Top cities</div>
                <div className="h-56">
                    <ResponsiveContainer>
                        <BarChart data={cities} layout="vertical" margin={{ left: 40 }}>
                            <XAxis type="number" stroke="#52525B" fontSize={10} />
                            <YAxis type="category" dataKey="name" stroke="#a1a1aa" fontSize={11} />
                            <RTooltip contentStyle={{ background: '#09090B', border: '1px solid #27272A' }} />
                            <Bar dataKey="v" fill="#818cf8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatBlock label="Playlists"  value={12 + seed(s + 'pl', 40)} Icon={Music2} />
                <StatBlock label="Radio spins" value={45 + seed(s + 'rd', 200)} Icon={Radio} />
                <StatBlock label="TikTok uses" value={seed(s + 'tk', 5000).toLocaleString()} Icon={Play} />
                <StatBlock label="Shazams"    value={seed(s + 'sh', 8000).toLocaleString()} Icon={MapPin} />
            </div>
        </div>
    );
}

/* Shared stat block */
function StatBlock({ label, value, Icon, accent }) {
    return (
        <div className={`p-5 border ${accent ? 'border-indigo-400/30 bg-indigo-400/[0.05]' : 'border-zinc-900 bg-zinc-950/40'}`}>
            <Icon className={`w-4 h-4 mb-3 ${accent ? 'text-indigo-200' : 'text-indigo-300'}`} strokeWidth={1.5} />
            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-1">{label}</div>
            <div className="font-display font-bold text-2xl text-white truncate">{value}</div>
        </div>
    );
}
