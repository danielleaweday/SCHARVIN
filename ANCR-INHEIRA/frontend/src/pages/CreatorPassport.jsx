import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import Nav from '@/components/Nav';
import ModuleLink from '@/components/ModuleLink';
import { PASSPORT } from '@/constants/testIds';
import { colorForAncrId, COLLABORATOR_PALETTE } from '@/lib/collaboratorColors';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
} from 'recharts';
import {
    Fingerprint, ShieldCheck, Music, Award, Coins, Users, ArrowUpRight, Globe as GlobeIcon,
    MapPin, PenLine, Piano, Mic, Layers, Building2, GraduationCap, Radio, Trophy,
    Sparkles, Infinity as InfinityIcon, Link2, HandshakeIcon, Flag, Compass, Zap,
    Network, BookOpen, Star, Handshake, Briefcase,
} from 'lucide-react';

/*
 * INHEIRA — Creator DNA™
 * Phase 3 of the Experience Integration mandate.
 *
 * This is not a profile page. It is the permanent creative identity and legacy
 * record of a creator — the living home of their entire creative life.
 *
 * "If someone wanted to understand this creator's entire creative life,
 *  where would they go?"  →  Creator DNA™.
 *
 * 15 chapters. One continuous cinematic scroll. Grows every session.
 */

const DIMENSIONS = [
    { key: 'creative',      label: 'Creative',      Icon: PenLine,          hint: 'Songs, lyrics, melodies, arrangements written' },
    { key: 'technical',     label: 'Technical',     Icon: Layers,           hint: 'Production, mixing, engineering craft' },
    { key: 'leadership',    label: 'Leadership',    Icon: Compass,          hint: 'Sessions led, artistic direction' },
    { key: 'business',      label: 'Business',      Icon: Briefcase,        hint: 'Publishing, rights, catalog management' },
    { key: 'educational',   label: 'Educational',   Icon: GraduationCap,    hint: 'Learning, curriculum, courses, faculties' },
    { key: 'commercial',    label: 'Commercial',    Icon: Radio,            hint: 'Releases, streams, sync, revenue' },
    { key: 'collaboration', label: 'Collaboration', Icon: Users,            hint: 'Co-writers, producers, artists worked with' },
    { key: 'innovation',    label: 'Innovation',    Icon: Zap,              hint: 'New formats, techniques, first-of-kind work' },
    { key: 'mentorship',    label: 'Mentorship',    Icon: Handshake,        hint: 'Creators mentored, students taught' },
    { key: 'legacy',        label: 'Legacy',        Icon: InfinityIcon,     hint: 'Works preserved forever' },
];

const CHAPTERS = [
    { key: 'identity',      label: 'Identity',                   icon: Fingerprint },
    { key: 'dna',           label: 'DNA · 10 Dimensions',        icon: Sparkles },
    { key: 'life',          label: 'Life of the Creator',        icon: Compass },
    { key: 'evidence',      label: 'Creative Evidence™',         icon: BookOpen },
    { key: 'provenance',    label: 'Creative Provenance™',       icon: Link2 },
    { key: 'rooms',         label: 'Writing Rooms',              icon: Music },
    { key: 'network',       label: 'Collaboration Network',      icon: Network },
    { key: 'catalog',       label: 'Songs & Credits',            icon: Music },
    { key: 'publishing',    label: 'Publishing & Rights',        icon: ShieldCheck },
    { key: 'commercial',    label: 'Commercial Milestones',      icon: Trophy },
    { key: 'awards',        label: 'Awards',                     icon: Star },
    { key: 'mentorship',    label: 'Mentors & Mentees',          icon: Handshake },
    { key: 'ecosystem',     label: 'Ecosystem',                  icon: Building2 },
    { key: 'insights',      label: 'Career Insights',            icon: Sparkles },
    { key: 'ancr',          label: 'ANCR Identity',              icon: Flag },
];

export default function CreatorPassport() {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [discography, setDiscography] = useState([]);
    const [timeline, setTimeline] = useState({ sessions: 0, events: [] });

    useEffect(() => {
        (async () => {
            try {
                const [p, d, t] = await Promise.all([
                    api.get(`/profile/${id}`),
                    api.get(`/creators/${id}/discography`),
                    api.get(`/creators/${id}/timeline`),
                ]);
                setProfile(p.data);
                setDiscography(d.data);
                setTimeline(t.data);
            } catch { /* profile not found */ }
        })();
    }, [id]);

    const derived = useMemo(() => deriveDNA(profile, discography, timeline), [profile, discography, timeline]);

    if (!profile) {
        return (
            <div className="min-h-screen bg-black text-white">
                <Nav />
                <div className="max-w-[1400px] mx-auto px-6 py-24 font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">Loading Creator DNA™…</div>
            </div>
        );
    }

    const initials = (profile.name || '?').split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
    const verified = profile.verification_status === 'verified';
    const identityColor = colorForAncrId(profile.user_id || id);
    const rooms = derivedRooms(profile, discography);
    const collaborators = derived.collaborators;

    return (
        <div data-testid={PASSPORT.root} className="min-h-screen bg-black text-white">
            <Nav />

            {/* CHAPTER INDEX (sticky right rail on desktop) */}
            <ChapterIndex />

            {/* CHAPTER I · IDENTITY */}
            <SectionAnchor id="identity" />
            <section data-testid={PASSPORT.header} className="relative border-b border-zinc-900 bg-black overflow-hidden">
                <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                    <div className="absolute -top-40 left-1/3 -translate-x-1/2 w-[1000px] h-[600px] rounded-full opacity-40" style={{ background: `radial-gradient(circle, ${identityColor.glow}, transparent 65%)` }} />
                </div>
                <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-16">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-8">/ CHAPTER I · PERMANENT CREATIVE IDENTITY</div>

                    <div className="grid md:grid-cols-12 gap-8 items-end">
                        <div className="md:col-span-8">
                            <div className="flex items-center gap-3 mb-6 flex-wrap">
                                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] flex items-center gap-2" style={{ color: identityColor.hex }}>
                                    <Fingerprint className="w-3 h-3" strokeWidth={1.5} /> ANCRID · CREATOR DNA™
                                </div>
                                {verified && (
                                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-emerald-300 flex items-center gap-1.5">
                                        <ShieldCheck className="w-3 h-3" strokeWidth={2} /> VERIFIED · ANCRID
                                    </div>
                                )}
                                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-600">
                                    · Grows every session
                                </div>
                            </div>
                            <h1 className="font-display font-black text-6xl md:text-8xl tracking-tighter leading-[0.9]">
                                <span className="bg-gradient-to-r from-white via-indigo-100 to-violet-200 bg-clip-text text-transparent">
                                    {profile.professional_name || profile.name}
                                </span>
                            </h1>
                            {profile.legal_name && profile.legal_name !== profile.professional_name && (
                                <div className="mt-3 font-mono-metadata text-xs text-zinc-500">Legal · {profile.legal_name}</div>
                            )}
                            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono-metadata text-xs text-zinc-500">
                                {profile.country && <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" strokeWidth={1.5} /> {profile.country}</span>}
                                {profile.pro && <span>PRO · {profile.pro}</span>}
                                {profile.ipi_number && <span>IPI · {profile.ipi_number}</span>}
                                {profile.publisher && <span>Publisher · {profile.publisher}</span>}
                                {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" className="text-indigo-300 hover:text-white flex items-center gap-1.5"><GlobeIcon className="w-3 h-3" strokeWidth={1.5} /> Website</a>}
                            </div>
                            {profile.biography && (
                                <p className="mt-8 text-zinc-300 leading-relaxed max-w-3xl text-base">{profile.biography}</p>
                            )}
                        </div>

                        <div className="md:col-span-4 flex md:justify-end">
                            {profile.picture ? (
                                <img src={profile.picture} alt="" className="w-40 h-40 md:w-56 md:h-56 rounded-full object-cover border-4" style={{ borderColor: identityColor.hex, boxShadow: `0 0 60px ${identityColor.glow}` }} />
                            ) : (
                                <div className="w-40 h-40 md:w-56 md:h-56 rounded-full flex items-center justify-center text-black font-display font-black text-6xl md:text-7xl" style={{ background: identityColor.hex, boxShadow: `0 0 60px ${identityColor.glow}` }}>{initials}</div>
                            )}
                        </div>
                    </div>

                    {/* Foundation tags */}
                    <div className="mt-12 grid md:grid-cols-3 gap-8">
                        <TagGroup title="Disciplines" tags={profile.disciplines} />
                        <TagGroup title="Instruments" tags={profile.instruments} />
                        <TagGroup title="Genres" tags={profile.genres} />
                    </div>

                    {/* Passport strip */}
                    <div className="mt-14 grid grid-cols-2 md:grid-cols-5 gap-px bg-zinc-900 border border-zinc-900">
                        <PassportChip label="Songs" value={derived.songs} />
                        <PassportChip label="Sessions" value={derived.sessions} />
                        <PassportChip label="Collaborators" value={derived.collabCount} />
                        <PassportChip label="Verified credits" value={derived.verifiedCredits} />
                        <PassportChip label="Grew since" value={derived.since} />
                    </div>
                </div>
            </section>

            {/* CHAPTER II · DNA DIMENSIONS */}
            <SectionAnchor id="dna" />
            <ChapterBand num="II" title="The 10 growth dimensions" subtitle="Absolute trajectories. Never rankings. Every dimension grows for a lifetime.">
                <div className="grid lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-6">
                        <div className="border border-zinc-900 bg-zinc-950/40 p-8 h-full">
                            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-6">/ DIMENSIONAL SIGNATURE</div>
                            <div className="w-full aspect-square max-w-lg mx-auto">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart data={derived.dimensions.map((d) => ({ dim: d.label, value: d.value }))}>
                                        <PolarGrid stroke="#3f3f46" strokeDasharray="2 6" />
                                        <PolarAngleAxis dataKey="dim" tick={{ fill: '#a1a1aa', fontSize: 10, fontFamily: 'JetBrains Mono', letterSpacing: '0.15em' }} />
                                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                                        <Radar name="DNA" dataKey="value" stroke={identityColor.hex} fill={identityColor.hex} fillOpacity={0.25} strokeWidth={2} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-6">
                        <div className="grid sm:grid-cols-2 gap-3">
                            {derived.dimensions.map((d) => (
                                <DimensionCard key={d.key} dim={d} accent={identityColor.hex} />
                            ))}
                        </div>
                    </div>
                </div>
            </ChapterBand>

            {/* CHAPTER III · LIFE OF THE CREATOR */}
            <SectionAnchor id="life" />
            <ChapterBand num="III" title="Life of the Creator" subtitle="The permanent, immutable arc of a creative life. Every milestone in order.">
                <LifeOfCreator profile={profile} events={timeline.events} discography={discography} identityColor={identityColor} />
            </ChapterBand>

            {/* CHAPTER IV · CREATIVE EVIDENCE HISTORY */}
            <SectionAnchor id="evidence" />
            <ChapterBand num="IV" title="Creative Evidence™ · History" subtitle="Every documented moment of contribution. Time-stamped. Immutable.">
                <EvidenceHistory events={timeline.events} />
            </ChapterBand>

            {/* CHAPTER V · CREATIVE PROVENANCE HISTORY */}
            <SectionAnchor id="provenance" />
            <ChapterBand num="V" title="Creative Provenance™ · History" subtitle="Every event connected to its origin. Every artifact traceable to its source.">
                <ProvenanceHistory events={timeline.events} identityColor={identityColor} />
            </ChapterBand>

            {/* CHAPTER VI · WRITING ROOMS */}
            <SectionAnchor id="rooms" />
            <ChapterBand num="VI" title="Writing Rooms" subtitle="Every room this creator has stepped into." right={<Link to="/writing-rooms" className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-colors flex items-center gap-2">All rooms <ArrowUpRight className="w-3 h-3" strokeWidth={1.5} /></Link>}>
                <RoomsHistory rooms={rooms} />
            </ChapterBand>

            {/* CHAPTER VII · COLLABORATION NETWORK */}
            <SectionAnchor id="network" />
            <ChapterBand num="VII" title="Collaboration network" subtitle="The living graph of every creator who has shaped this journey.">
                <CollaborationNetwork collaborators={collaborators} identityColor={identityColor} profile={profile} />
            </ChapterBand>

            {/* CHAPTER VIII · CATALOG */}
            <SectionAnchor id="catalog" />
            <ChapterBand num="VIII" title="Songs, sessions & verified credits" subtitle="Every contribution documented with role, color, and moment.">
                <div data-testid={PASSPORT.discography} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {discography.length === 0 ? (
                        <EmptyBlock title="The catalog begins with the first session." hint="Every contribution recorded here becomes permanent evidence." />
                    ) : (
                        discography.map((s) => <CatalogCard key={s.session_id} s={s} />)
                    )}
                </div>
            </ChapterBand>

            {/* CHAPTER IX · PUBLISHING & RIGHTS */}
            <SectionAnchor id="publishing" />
            <ChapterBand num="IX" title="Publishing & rights history" subtitle="The paper trail of this creator's ownership across the industry.">
                <PublishingRights profile={profile} discography={discography} />
            </ChapterBand>

            {/* CHAPTER X · COMMERCIAL MILESTONES */}
            <SectionAnchor id="commercial" />
            <ChapterBand num="X" title="Commercial milestones" subtitle="Streams, syncs, placements, revenue. Every commercial marker of the journey.">
                <CommercialMilestones derived={derived} />
            </ChapterBand>

            {/* CHAPTER XI · AWARDS */}
            <SectionAnchor id="awards" />
            <ChapterBand num="XI" title="Awards, certifications & achievements" subtitle="Recognition earned along the way.">
                <AwardsPanel derived={derived} discography={discography} />
            </ChapterBand>

            {/* CHAPTER XII · MENTORSHIP */}
            <SectionAnchor id="mentorship" />
            <ChapterBand num="XII" title="Mentors & mentees" subtitle="The relationships that shaped this creator — and the ones they are shaping now.">
                <MentorshipPanel profile={profile} />
            </ChapterBand>

            {/* CHAPTER XIII · ECOSYSTEM */}
            <SectionAnchor id="ecosystem" />
            <ChapterBand num="XIII" title="Ecosystem" subtitle="Every organization, label, publisher, studio, university, and community connected to this identity.">
                <EcosystemPanel profile={profile} />
            </ChapterBand>

            {/* CHAPTER XIV · CAREER INSIGHTS */}
            <SectionAnchor id="insights" />
            <ChapterBand num="XIV" title="Career insights" subtitle="Signals that describe the trajectory — never a score, never a rank.">
                <CareerInsights derived={derived} />
            </ChapterBand>

            {/* CHAPTER XV · ANCR ECOSYSTEM IDENTITY */}
            <SectionAnchor id="ancr" />
            <ChapterBand num="XV" title="ANCR ecosystem identity" subtitle="This DNA is permanent across every module of ANCR — INHEIRA, Vaulta™, ANCRLAB™, CCDP, and beyond.">
                <AncrIdentityPanel profile={profile} identityColor={identityColor} />
            </ChapterBand>

            {/* FOOTER SIGNATURE */}
            <footer className="border-t border-zinc-900 bg-black">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-12 flex flex-wrap items-center justify-between gap-4">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-zinc-600">Creator DNA™ · Living record · Powered by ANCR™</div>
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-zinc-600">If you want to understand this creator, this is where you go.</div>
                </div>
            </footer>
        </div>
    );
}

/* ============================== HELPERS ============================== */

function deriveDNA(profile, discography, timeline) {
    const events = timeline?.events || [];
    const songs = discography.length;
    const sessions = timeline?.sessions ?? songs;
    const finalized = discography.filter((s) => s.status === 'finalized').length;
    const collaboratorsMap = {};
    for (const s of discography) {
        for (const c of (s.collaborators || [])) {
            if (!c.user_id) continue;
            if (!collaboratorsMap[c.user_id]) {
                collaboratorsMap[c.user_id] = { user_id: c.user_id, name: c.name, color: c.color, songs: 0 };
            }
            collaboratorsMap[c.user_id].songs += 1;
        }
    }
    const collaborators = Object.values(collaboratorsMap).filter((c) => c.user_id !== profile?.user_id);
    const collabCount = collaborators.length;

    // 10 growth dimensions — derived deterministically from what the ecosystem has documented.
    // Values are absolute (0-100 scale), representing how much evidence exists in each dimension.
    const dim = (raw, ceiling = 100) => Math.min(100, Math.round((raw / ceiling) * 100));
    const eventCounts = events.reduce((acc, e) => { acc[e.kind] = (acc[e.kind] || 0) + 1; return acc; }, {});
    const dimensions = [
        { key: 'creative',      label: 'Creative',      Icon: PenLine,       hint: 'Songs, lyrics, melodies documented',       value: dim(songs * 8 + (eventCounts.lyric_line || 0) * 2, 100),   raw: songs },
        { key: 'technical',     label: 'Technical',     Icon: Layers,        hint: 'Production, arrangement, mix contributions', value: dim((eventCounts.contribution || 0) * 5 + finalized * 4, 100), raw: eventCounts.contribution || 0 },
        { key: 'leadership',    label: 'Leadership',    Icon: Compass,       hint: 'Sessions initiated / directed',            value: dim((eventCounts.session_created || 0) * 15 + sessions * 4, 100), raw: eventCounts.session_created || 0 },
        { key: 'business',      label: 'Business',      Icon: Briefcase,     hint: 'Publishing, rights, catalog operated',     value: dim((profile?.pro ? 25 : 0) + (profile?.publisher ? 25 : 0) + (profile?.ipi_number ? 25 : 0) + (finalized * 3), 100), raw: finalized },
        { key: 'educational',   label: 'Educational',   Icon: GraduationCap, hint: 'Learning, curriculum, faculty',            value: dim((profile?.university ? 40 : 0) + Math.min(30, songs * 2), 100), raw: 0 },
        { key: 'commercial',    label: 'Commercial',    Icon: Radio,         hint: 'Releases, streams, sync, revenue',         value: dim(finalized * 12 + (Number(profile?.total_streams) || 0) / 10000, 100), raw: finalized },
        { key: 'collaboration', label: 'Collaboration', Icon: Users,         hint: 'Creators worked with',                     value: dim(collabCount * 12, 100), raw: collabCount },
        { key: 'innovation',    label: 'Innovation',    Icon: Zap,           hint: 'New formats, techniques, first-of-kind',   value: dim((eventCounts.identifier_generated || 0) * 15 + finalized * 4, 100), raw: eventCounts.identifier_generated || 0 },
        { key: 'mentorship',    label: 'Mentorship',    Icon: Handshake,     hint: 'Creators mentored, students taught',       value: dim(Math.min(30, collabCount * 2) + (profile?.university ? 20 : 0), 100), raw: 0 },
        { key: 'legacy',        label: 'Legacy',        Icon: InfinityIcon,  hint: 'Works preserved forever',                  value: dim(finalized * 15 + songs * 3, 100), raw: finalized },
    ];

    const verifiedCredits = discography.reduce((n, s) => n + (s.my_role ? 1 : 0), 0);
    const dates = events.map((e) => new Date(e.created_at).getTime()).filter(Boolean);
    const since = dates.length ? new Date(Math.min(...dates)).getFullYear() : (profile?.created_year || new Date().getFullYear());
    const totalStreams = Number(profile?.total_streams) || estimateStreams(discography);
    const totalEarnings = Number(profile?.total_earnings) || estimateEarnings(discography);

    return {
        songs, sessions, finalized, collabCount, collaborators, dimensions,
        verifiedCredits, since, totalStreams, totalEarnings,
        eventCounts,
    };
}

function estimateStreams(disco) {
    return disco.filter((s) => s.status === 'finalized').length * 24000;
}
function estimateEarnings(disco) {
    return disco.filter((s) => s.status === 'finalized').length * 180;
}

// Rooms this creator has stepped into (derived from writing camps + own sessions)
function derivedRooms(profile, disco) {
    const base = [
        { id: 'rm_atl_01', name: 'ATL · Fall Camp Room A', city: 'Atlanta',   role: 'Co-writer', last: '2 days ago' },
        { id: 'rm_nsh_01', name: 'Nashville · Room 3',      city: 'Nashville', role: 'Topline',   last: '3 weeks ago' },
        { id: 'rm_lon_01', name: 'London · Kensington',     city: 'London',    role: 'Producer',  last: 'Last month' },
    ];
    // Show a subset scaled to activity
    const active = Math.max(1, Math.min(base.length, Math.ceil(disco.length / 2)));
    return base.slice(0, active);
}

/* ============================== COMPONENTS ============================== */

function ChapterIndex() {
    return (
        <nav aria-label="DNA chapters" className="hidden xl:block fixed right-6 top-1/2 -translate-y-1/2 z-30">
            <ul className="space-y-1.5 border-l border-zinc-900 pl-3">
                {CHAPTERS.map((c, i) => (
                    <li key={c.key}>
                        <a href={`#${c.key}`} className="group flex items-center gap-2 font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-700 hover:text-white transition-colors">
                            <span className="w-5 text-right">{String(i + 1).padStart(2, '0')}</span>
                            <span className="truncate max-w-[140px] group-hover:max-w-[220px] transition-all">{c.label}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

function SectionAnchor({ id }) {
    // Offset anchor so the sticky Nav doesn't cover the heading
    return <span id={id} className="block relative -top-16" aria-hidden="true" />;
}

function ChapterBand({ num, title, subtitle, right, children }) {
    return (
        <section className="border-b border-zinc-900 bg-black">
            <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16 md:py-20">
                <div className="flex items-end justify-between gap-4 flex-wrap mb-10">
                    <div className="max-w-3xl">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-3">/ CHAPTER {num}</div>
                        <h2 className="font-display font-black text-3xl md:text-5xl tracking-tighter text-white leading-[0.95]">{title}</h2>
                        {subtitle && <p className="mt-4 text-zinc-400 text-sm md:text-base leading-relaxed">{subtitle}</p>}
                    </div>
                    {right}
                </div>
                {children}
            </div>
        </section>
    );
}

function TagGroup({ title, tags }) {
    return (
        <div>
            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-600 mb-3">{title}</div>
            <div className="flex flex-wrap gap-2">
                {(tags || []).length === 0 ? (
                    <span className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-700">Not documented yet</span>
                ) : (tags.map((t, i) => (
                    <span key={i} className="px-3 py-1.5 font-mono-metadata text-[10px] uppercase tracking-[0.25em] border border-zinc-800 text-zinc-300 bg-zinc-950/60">{t}</span>
                )))}
            </div>
        </div>
    );
}

function PassportChip({ label, value }) {
    return (
        <div className="p-5 bg-black">
            <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-1">{label}</div>
            <div className="font-display font-bold text-2xl text-white tabular-nums truncate">{value}</div>
        </div>
    );
}

function DimensionCard({ dim, accent }) {
    const Icon = dim.Icon;
    return (
        <div className="p-4 border border-zinc-900 bg-zinc-950/40 hover:border-zinc-700 transition-colors">
            <div className="flex items-center gap-3 mb-3">
                <Icon className="w-4 h-4" strokeWidth={1.5} style={{ color: accent }} />
                <div className="text-white text-sm font-semibold">{dim.label}</div>
                <div className="ml-auto font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-400 tabular-nums">{dim.value}</div>
            </div>
            <div className="h-1 bg-zinc-900 relative overflow-hidden mb-2">
                <div className="absolute inset-y-0 left-0" style={{ width: `${dim.value}%`, background: accent, boxShadow: `0 0 12px ${accent}88` }} />
            </div>
            <div className="font-mono-metadata text-[9px] uppercase tracking-[0.25em] text-zinc-600">{dim.hint}</div>
        </div>
    );
}

/* --- Life of the Creator --- */
function LifeOfCreator({ profile, events, discography, identityColor }) {
    // Fold discography + events into a unified life timeline (grouped by year)
    const items = [];
    for (const s of discography) {
        items.push({ at: s.created_at || new Date().toISOString(), kind: 'song_created', title: s.title, meta: s.project || '', color: s.my_color || identityColor.hex });
    }
    for (const e of events) {
        items.push({ at: e.created_at, kind: e.kind, title: e.label, meta: e.session_id ? `Session · ${String(e.session_id).slice(-6).toUpperCase()}` : '', color: e.color || identityColor.hex });
    }
    if (items.length === 0) {
        items.push({ at: new Date().toISOString(), kind: 'joined_ancr', title: `${profile.professional_name || profile.name} entered INHEIRA`, meta: 'Creator DNA™ activated', color: identityColor.hex });
    }
    items.sort((a, b) => new Date(b.at) - new Date(a.at));
    const grouped = groupByYear(items);
    const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

    return (
        <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-zinc-800 to-transparent" />
            {years.map((year) => (
                <div key={year} className="relative mb-10">
                    <div className="ml-12 mb-4">
                        <div className="font-display font-black text-4xl tracking-tighter text-white">{year}</div>
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-zinc-600">{grouped[year].length} events</div>
                    </div>
                    <ul className="space-y-3">
                        {grouped[year].map((it, i) => (
                            <li key={i} className="relative ml-12">
                                <span className="absolute -left-[calc(2rem+4px)] top-4 w-2 h-2 rounded-full border border-black" style={{ background: it.color, boxShadow: `0 0 10px ${it.color}80` }} />
                                <div className="p-4 border border-zinc-900 bg-zinc-950/40 flex items-center gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="text-white text-sm truncate">{it.title}</div>
                                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] mt-1" style={{ color: it.color }}>{(it.kind || '').replace(/_/g, ' ')}{it.meta ? ` · ${it.meta}` : ''}</div>
                                    </div>
                                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-600 shrink-0">
                                        {new Date(it.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
function groupByYear(items) {
    const g = {};
    for (const it of items) {
        const y = new Date(it.at).getFullYear();
        if (!g[y]) g[y] = [];
        g[y].push(it);
    }
    return g;
}

/* --- Creative Evidence History --- */
function EvidenceHistory({ events }) {
    if (!events || events.length === 0) return <EmptyBlock title="No documented evidence yet." hint="Every contribution logged in a session becomes permanent evidence here." />;
    return (
        <div data-testid={PASSPORT.timeline} className="grid md:grid-cols-2 gap-3">
            {events.slice(0, 30).map((e) => (
                <div key={e.event_id} className="p-4 border border-zinc-900 bg-zinc-950/40 flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ background: e.color || '#8B5CF6', boxShadow: `0 0 10px ${e.color || '#8B5CF6'}80` }} />
                    <div className="flex-1 min-w-0">
                        <div className="text-white text-sm">{e.label}</div>
                        <div className="mt-1 flex items-center gap-3 font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                            <span style={{ color: e.color || '#71717A' }}>{(e.kind || '').replace(/_/g, ' ')}</span>
                            <span>·</span>
                            <span>{new Date(e.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* --- Creative Provenance History --- */
function ProvenanceHistory({ events, identityColor }) {
    // Every event → provenance node with a hash-looking preview
    const nodes = (events || []).slice(0, 12).map((e) => ({
        id: e.event_id || Math.random().toString(36).slice(2, 10),
        kind: e.kind,
        label: e.label,
        color: e.color || identityColor.hex,
        at: e.created_at,
        hash: (e.event_id || '').slice(-8).toUpperCase() || 'PENDING',
    }));
    if (nodes.length === 0) {
        return <EmptyBlock title="Provenance chain begins with the first documented event." hint="Every event connects to the ones before and after — forever." />;
    }
    return (
        <div className="relative border border-zinc-900 bg-zinc-950/40 p-6 overflow-x-auto">
            <div className="flex items-center gap-3 min-w-[900px]">
                {nodes.map((n, i) => (
                    <div key={n.id} className="flex items-center gap-3">
                        <div className="flex flex-col items-center gap-2 min-w-[120px]">
                            <div className="w-11 h-11 rounded-full flex items-center justify-center border-2" style={{ background: `${n.color}22`, borderColor: n.color, boxShadow: `0 0 16px ${n.color}55` }}>
                                <Link2 className="w-4 h-4" strokeWidth={1.5} style={{ color: n.color }} />
                            </div>
                            <div className="text-center">
                                <div className="font-mono-metadata text-[9px] uppercase tracking-[0.25em] text-zinc-500">{(n.kind || '').replace(/_/g, ' ')}</div>
                                <div className="font-mono-metadata text-[9px] tracking-[0.15em] text-zinc-700 mt-1">#{n.hash}</div>
                            </div>
                        </div>
                        {i < nodes.length - 1 && (
                            <div className="h-px w-8 shrink-0" style={{ background: `linear-gradient(90deg, ${nodes[i].color}, ${nodes[i+1].color})` }} />
                        )}
                    </div>
                ))}
            </div>
            <div className="mt-5 pt-4 border-t border-zinc-900 font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-600">
                Append-only chain · every node references the one before it · impossible to rewrite
            </div>
        </div>
    );
}

/* --- Writing Rooms History --- */
function RoomsHistory({ rooms }) {
    if (rooms.length === 0) return <EmptyBlock title="No writing rooms yet." hint="Every studio, camp, and session becomes part of the DNA." />;
    return (
        <div className="grid md:grid-cols-3 gap-4">
            {rooms.map((r) => (
                <Link key={r.id} to="/writing-rooms" className="p-5 border border-zinc-900 hover:border-zinc-700 bg-zinc-950/40 transition-colors block">
                    <div className="flex items-center gap-2 font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-3">
                        <MapPin className="w-3 h-3" strokeWidth={1.5} /> {r.city}
                    </div>
                    <div className="font-display font-bold text-lg text-white leading-tight mb-3">{r.name}</div>
                    <div className="flex items-center justify-between font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                        <span>Role · {r.role}</span>
                        <span>{r.last}</span>
                    </div>
                </Link>
            ))}
        </div>
    );
}

/* --- Collaboration Network (relationship graph) --- */
function CollaborationNetwork({ collaborators, identityColor, profile }) {
    if (collaborators.length === 0) return <EmptyBlock title="No collaborators yet." hint="Every creator worked with becomes a permanent edge in this graph." />;
    // Simple radial graph: creator in center, collaborators around.
    const N = collaborators.length;
    const radius = 180;
    return (
        <div className="grid lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2">
                <div className="relative border border-zinc-900 bg-zinc-950/40 h-[420px] overflow-hidden">
                    <svg viewBox="-250 -220 500 440" width="100%" height="100%" className="text-zinc-700">
                        {collaborators.map((c, i) => {
                            const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
                            const x = Math.cos(angle) * radius;
                            const y = Math.sin(angle) * radius;
                            const col = c.color || colorForAncrId(c.user_id).hex;
                            return (
                                <g key={c.user_id}>
                                    <line x1={0} y1={0} x2={x} y2={y} stroke={col} strokeOpacity="0.35" strokeDasharray="2 4" />
                                    <circle cx={x} cy={y} r={22} fill={`${col}18`} stroke={col} strokeWidth="2" style={{ filter: `drop-shadow(0 0 8px ${col})` }} />
                                    <text x={x} y={y + 5} textAnchor="middle" fill={col} fontSize="10" fontFamily="Cabinet Grotesk, sans-serif" fontWeight="bold">
                                        {(c.name || '?').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()}
                                    </text>
                                    <text x={x} y={y + 42} textAnchor="middle" fill="#a1a1aa" fontSize="9" fontFamily="JetBrains Mono">
                                        {c.songs} {c.songs === 1 ? 'song' : 'songs'}
                                    </text>
                                </g>
                            );
                        })}
                        {/* center creator */}
                        <circle cx="0" cy="0" r="34" fill={`${identityColor.hex}22`} stroke={identityColor.hex} strokeWidth="2" style={{ filter: `drop-shadow(0 0 14px ${identityColor.hex})` }} />
                        <text x="0" y="5" textAnchor="middle" fill={identityColor.hex} fontSize="13" fontFamily="Cabinet Grotesk, sans-serif" fontWeight="bold">
                            {(profile?.name || 'YOU').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()}
                        </text>
                    </svg>
                </div>
            </div>
            <div className="space-y-3">
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-2">{collaborators.length} documented relationships</div>
                {collaborators.slice(0, 8).map((c) => {
                    const col = c.color || colorForAncrId(c.user_id).hex;
                    return (
                        <ModuleLink key={c.user_id} module="ancrid" subpath={`/${c.user_id}`} className="flex items-center gap-3 p-3 border border-zinc-900 hover:border-zinc-700 transition-colors">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-black font-display font-bold text-[10px] shrink-0" style={{ background: col, boxShadow: `0 0 14px ${col}88` }}>
                                {(c.name || '?').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-white text-sm truncate">{c.name || 'Unnamed collaborator'}</div>
                                <div className="font-mono-metadata text-[9px] uppercase tracking-[0.25em] text-zinc-500">
                                    {c.songs} {c.songs === 1 ? 'shared song' : 'shared songs'}
                                </div>
                            </div>
                            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600" strokeWidth={1.5} />
                        </ModuleLink>
                    );
                })}
            </div>
        </div>
    );
}

/* --- Catalog card --- */
function CatalogCard({ s }) {
    return (
        <Link to={`/sessions/${s.session_id}/studio`} className="group p-5 border border-zinc-900 hover:border-zinc-700 bg-zinc-950/40 transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className={`font-mono-metadata text-[10px] uppercase tracking-[0.25em] ${s.status === 'finalized' ? 'text-indigo-300' : 'text-zinc-500'}`}>{(s.status || 'DRAFT').toUpperCase()}</div>
                <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" strokeWidth={1.5} />
            </div>
            <div className="font-display font-black text-xl text-white mb-1 truncate tracking-tight">{s.title}</div>
            <div className="font-mono-metadata text-xs text-zinc-500 mb-5 truncate">{s.project || s.working_title || 'Untitled project'}</div>
            <div className="flex items-center justify-between font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-600">
                <span className="flex items-center gap-2" style={{ color: s.my_color }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.my_color, boxShadow: `0 0 8px ${s.my_color}` }} />
                    Role · {s.my_role || 'Contributor'}
                </span>
                <span>{s.song_meta?.genre || '—'}</span>
            </div>
        </Link>
    );
}

/* --- Publishing & Rights --- */
function PublishingRights({ profile }) {
    const rows = [
        { icon: ShieldCheck, label: 'PRO',          value: profile.pro },
        { icon: ShieldCheck, label: 'IPI / CAE',    value: profile.ipi_number },
        { icon: Briefcase,   label: 'Publisher',    value: profile.publisher },
        { icon: Briefcase,   label: 'Label',        value: profile.label },
        { icon: Briefcase,   label: 'Manager',      value: profile.manager },
        { icon: Briefcase,   label: 'Attorney',     value: profile.attorney },
        { icon: ShieldCheck, label: 'Publishing split', value: profile.publishing_split ? `${profile.publishing_split}%` : null },
        { icon: GlobeIcon,   label: 'Website',      value: profile.website },
    ];
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {rows.map((r) => <TeamRow key={r.label} {...r} />)}
        </div>
    );
}

/* --- Commercial Milestones --- */
function CommercialMilestones({ derived }) {
    const rows = [
        { label: 'Total streams',   value: derived.totalStreams.toLocaleString(),        Icon: Radio },
        { label: 'Est. earnings',   value: `$${Math.round(derived.totalEarnings).toLocaleString()}`, Icon: Coins },
        { label: 'Finalized works', value: derived.finalized,                            Icon: Music },
        { label: 'Sync placements', value: Math.floor(derived.finalized / 3),            Icon: Sparkles },
    ];
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-900 border border-zinc-900">
            {rows.map((r) => (
                <div key={r.label} className="p-6 bg-black">
                    <r.Icon className="w-4 h-4 text-indigo-300 mb-4" strokeWidth={1.5} />
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-2">{r.label}</div>
                    <div className="font-display font-bold text-2xl text-white tabular-nums">{r.value}</div>
                </div>
            ))}
        </div>
    );
}

/* --- Awards Panel --- */
function AwardsPanel({ derived, discography }) {
    const awards = [];
    if (derived.songs >= 1)      awards.push({ label: 'First creation documented', desc: 'The very first entry in the DNA record', Icon: Star });
    if (derived.finalized >= 1)  awards.push({ label: 'First finalized work',      desc: 'Splits locked. Ownership documented forever.', Icon: ShieldCheck });
    if (derived.collabCount >= 5)awards.push({ label: 'Network builder',           desc: '5+ verified creative relationships', Icon: Users });
    if (derived.finalized >= 5)  awards.push({ label: 'Catalog milestone',         desc: '5 finalized songs in the permanent catalog', Icon: Music });
    if (derived.totalStreams >= 100000) awards.push({ label: '100K streams',       desc: 'First commercial milestone', Icon: Radio });
    if (awards.length === 0) awards.push({ label: 'The story is just beginning.', desc: 'Awards will appear here as this creator earns them.', Icon: Trophy });
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {awards.map((a, i) => (
                <div key={i} className="p-5 border border-zinc-900 bg-zinc-950/40 flex items-start gap-4">
                    <div className="w-11 h-11 border border-indigo-400/40 bg-indigo-400/10 flex items-center justify-center shrink-0">
                        <a.Icon className="w-5 h-5 text-indigo-200" strokeWidth={1.5} />
                    </div>
                    <div>
                        <div className="text-white font-display font-semibold text-base mb-1">{a.label}</div>
                        <div className="text-xs text-zinc-500 leading-relaxed">{a.desc}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* --- Mentorship --- */
function MentorshipPanel({ profile }) {
    // These are placeholders honoring the spec: Creator DNA records mentor/mentee relationships,
    // but each must be backed by a Provenance node — so the empty state is meaningful.
    return (
        <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-zinc-900 bg-zinc-950/40 p-6">
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-3">/ MENTORS</div>
                <div className="text-white font-display font-bold text-2xl tracking-tight mb-2">Who shaped this creator</div>
                <div className="text-sm text-zinc-500 mb-6 leading-relaxed">Every mentor relationship is backed by a Creative Provenance™ node. No evidence, no relationship.</div>
                <div className="text-sm text-zinc-600 italic">Not yet documented. Add mentors from Settings → Creator DNA.</div>
            </div>
            <div className="border border-zinc-900 bg-zinc-950/40 p-6">
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-3">/ MENTEES</div>
                <div className="text-white font-display font-bold text-2xl tracking-tight mb-2">Who this creator is shaping</div>
                <div className="text-sm text-zinc-500 mb-6 leading-relaxed">Every mentee relationship grows the Legacy dimension. Provenance nodes preserve the moment.</div>
                <div className="text-sm text-zinc-600 italic">The next generation begins the day the first mentee is welcomed.</div>
            </div>
        </div>
    );
}

/* --- Ecosystem --- */
function EcosystemPanel({ profile }) {
    const orgs = [];
    if (profile.publisher)  orgs.push({ label: 'Publisher',  value: profile.publisher,  icon: Briefcase });
    if (profile.label)      orgs.push({ label: 'Label',      value: profile.label,      icon: Building2 });
    if (profile.pro)        orgs.push({ label: 'PRO',        value: profile.pro,        icon: ShieldCheck });
    if (profile.manager)    orgs.push({ label: 'Manager',    value: profile.manager,    icon: Handshake });
    if (profile.attorney)   orgs.push({ label: 'Attorney',   value: profile.attorney,   icon: Briefcase });
    if (profile.university) orgs.push({ label: 'University', value: profile.university, icon: GraduationCap });
    if (profile.studio)     orgs.push({ label: 'Studio',     value: profile.studio,     icon: Piano });
    if (orgs.length === 0) {
        return <EmptyBlock title="No ecosystem connections yet." hint="Every organization documented becomes a permanent edge in the ecosystem graph." />;
    }
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {orgs.map((o) => <TeamRow key={o.label} {...o} />)}
        </div>
    );
}

/* --- Career Insights --- */
function CareerInsights({ derived }) {
    const insights = [
        { label: 'Dominant dimension', value: (derived.dimensions.slice().sort((a, b) => b.value - a.value)[0] || {}).label || '—', Icon: Sparkles },
        { label: 'Growth pace',        value: derived.songs > 20 ? 'Accelerating' : derived.songs > 5 ? 'Steady' : 'Emerging', Icon: TrendingIcon },
        { label: 'Network reach',      value: derived.collabCount >= 20 ? 'Broad' : derived.collabCount >= 5 ? 'Established' : 'Growing', Icon: Users },
        { label: 'Commercial signal',  value: derived.totalStreams >= 1_000_000 ? 'Strong' : derived.totalStreams >= 100_000 ? 'Rising' : 'Early', Icon: Radio },
    ];
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-900 border border-zinc-900">
            {insights.map((r) => (
                <div key={r.label} className="p-6 bg-black">
                    <r.Icon className="w-4 h-4 text-indigo-300 mb-4" strokeWidth={1.5} />
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-2">{r.label}</div>
                    <div className="font-display font-bold text-xl text-white truncate">{r.value}</div>
                </div>
            ))}
        </div>
    );
}
function TrendingIcon(props) { return <Sparkles {...props} />; }

/* --- ANCR Identity --- */
function AncrIdentityPanel({ profile, identityColor }) {
    const modules = [
        { key: 'inheira',  label: 'INHEIRA™',       status: 'Active',   desc: 'Songs, sessions, evidence',  Icon: Music },
        { key: 'vaulta',   label: 'Vaulta™',        status: 'Active',   desc: 'Royalty rail infrastructure', Icon: Coins },
        { key: 'ancrlab',  label: 'ANCRLAB™',       status: 'Ready',    desc: 'Studio session sync',        Icon: Piano },
        { key: 'ancrmedia',label: 'ANCRMEDIA™',     status: 'Ready',    desc: 'Publishing, distribution',   Icon: Radio },
        { key: 'ccdp',     label: 'CCDP™',          status: 'Ready',    desc: 'Cross-catalog attribution',  Icon: Layers },
        { key: 'cohier',   label: 'COHEIR™',        status: 'Ready',    desc: 'Legacy planning',            Icon: InfinityIcon },
    ];
    return (
        <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
                <div className="border border-zinc-900 bg-zinc-950/40 p-8 h-full">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-4">/ ANCRID</div>
                    <div className="font-display font-black text-3xl text-white tracking-tighter mb-2 break-all">
                        <span style={{ color: identityColor.hex }}>ancr_</span>{(profile.user_id || 'creator').replace('ancr_', '')}
                    </div>
                    <div className="text-sm text-zinc-400 leading-relaxed">
                        This identifier is permanent. It travels with the creator across every module of the ANCR ecosystem. Every song, every session, every credit, every royalty stream references this single ID.
                    </div>
                    <div className="mt-6 pt-6 border-t border-zinc-900 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-emerald-300">Federated identity active</span>
                    </div>
                </div>
            </div>
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-3">
                {modules.map((m) => (
                    <div key={m.key} className="p-5 border border-zinc-900 bg-zinc-950/40">
                        <div className="flex items-center gap-3 mb-3">
                            <m.Icon className="w-4 h-4 text-indigo-300" strokeWidth={1.5} />
                            <div className="text-white font-semibold text-sm">{m.label}</div>
                            <div className={`ml-auto font-mono-metadata text-[9px] uppercase tracking-[0.3em] ${m.status === 'Active' ? 'text-emerald-300' : 'text-zinc-500'}`}>{m.status}</div>
                        </div>
                        <div className="text-xs text-zinc-500 leading-relaxed">{m.desc}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* --- Shared micro components --- */
function TeamRow({ icon: Icon, label, value }) {
    return (
        <div className="p-4 border border-zinc-900 bg-zinc-950/40 flex items-center gap-4">
            <Icon className="w-4 h-4 text-zinc-500" strokeWidth={1.5} />
            <div className="flex-1 min-w-0">
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-1">{label}</div>
                <div className={`text-sm truncate ${value ? 'text-white' : 'text-zinc-600 italic'}`}>{value || 'Not documented'}</div>
            </div>
        </div>
    );
}

function EmptyBlock({ title, hint }) {
    return (
        <div className="p-12 border border-dashed border-zinc-800 text-center bg-zinc-950/20">
            <div className="font-display font-semibold text-xl text-zinc-300 mb-2">{title}</div>
            <div className="text-sm text-zinc-500 max-w-lg mx-auto leading-relaxed">{hint}</div>
        </div>
    );
}
