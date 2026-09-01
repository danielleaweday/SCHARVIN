import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import Nav from '@/components/Nav';
import { Button } from '@/components/ui/button';
import { DNA } from '@/constants/testIds';
import { Fingerprint, ArrowLeft, PenLine, Music2, Mic2, Sliders, Users, ShieldCheck, Rocket, FileSignature, Award, Layers, GitBranch, Radio, Coins, ArrowUpRight } from 'lucide-react';
import { CinematicHero, LifeSpine, ANCRFooter } from '@/components/cinematic';
import { inferSessionStage } from '@/lib/lifeOfSong';
import { colorForAncrId } from '@/lib/collaboratorColors';

const EVENT_TYPES = [
    { kind: 'session_created', label: 'Song Created', icon: GitBranch, color: '#818cf8' },
    { kind: 'collaborator_joined', label: 'Collaborator Joined', icon: Users, color: '#3B82F6' },
    { kind: 'lyric_line', label: 'Lyric Written', icon: PenLine, color: '#818cf8' },
    { kind: 'melody_added', label: 'Melody Recorded', icon: Music2, color: '#10B981' },
    { kind: 'arrangement_updated', label: 'Arrangement Updated', icon: Sliders, color: '#A855F7' },
    { kind: 'voice_memo', label: 'Voice Memo Added', icon: Mic2, color: '#EC4899' },
    { kind: 'contribution', label: 'Contribution Logged', icon: Layers, color: '#06B6D4' },
    { kind: 'splits_signed', label: 'Splits Signed', icon: FileSignature, color: '#10B981' },
    { kind: 'identifier_generated', label: 'Identifier Generated', icon: ShieldCheck, color: '#818cf8' },
    { kind: 'publishing_submitted', label: 'Publishing Submitted', icon: Award, color: '#818cf8' },
    { kind: 'dsp_delivered', label: 'DSP Delivered', icon: Radio, color: '#3B82F6' },
    { kind: 'released', label: 'Released', icon: Rocket, color: '#818cf8' },
    { kind: 'royalty', label: 'Royalty Recorded', icon: Coins, color: '#10B981' },
];

function iconFor(kind) {
    return EVENT_TYPES.find((e) => e.kind === kind) || { label: kind, icon: Layers, color: '#71717A' };
}

export default function SongDNA() {
    const { id } = useParams();
    const [session, setSession] = useState(null);
    const [events, setEvents] = useState([]);
    const [contribs, setContribs] = useState([]);
    const [lines, setLines] = useState([]);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        (async () => {
            try {
                const [s, e, c, l] = await Promise.all([
                    api.get(`/sessions/${id}`),
                    api.get(`/sessions/${id}/events`),
                    api.get(`/sessions/${id}/contributions`),
                    api.get(`/sessions/${id}/lyrics`),
                ]);
                setSession(s.data);
                setEvents(e.data);
                setContribs(c.data);
                setLines(l.data);
            } catch {}
        })();
    }, [id]);

    // Synthesize a unified DNA feed from events + contribs (so we cover everything ever recorded).
    const feed = useMemo(() => {
        const items = [];
        for (const e of events) items.push({ ...e, source: 'event' });
        for (const c of contribs) {
            items.push({
                event_id: c.contribution_id,
                kind: 'contribution',
                label: `${c.user_name} contributed ${c.role}`,
                meta: { description: c.description, weight: c.weight, role: c.role },
                user_name: c.user_name,
                user_id: c.user_id,
                color: '#06B6D4',
                created_at: c.created_at,
            });
        }
        return items.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }, [events, contribs]);

    const filtered = filter === 'all' ? feed : feed.filter((f) => f.kind === filter);

    if (!session) return <div className="min-h-screen bg-black"><Nav /></div>;

    // Group by day
    const byDay = {};
    for (const f of filtered) {
        const d = new Date(f.created_at).toDateString();
        if (!byDay[d]) byDay[d] = [];
        byDay[d].push(f);
    }

    const version = Math.max(1, Math.floor(events.length / 5));
    const stage = inferSessionStage(session);
    const collaborators = session.collaborators || [];

    return (
        <div data-testid={DNA.root} className="min-h-screen bg-black text-white">
            <Nav />

            <CinematicHero
                eyebrow={<span className="flex items-center gap-2"><Fingerprint className="w-3 h-3 text-indigo-300" strokeWidth={1.5} /> SONG DNA™ · IMMUTABLE HISTORY · {session.session_id.slice(-6).toUpperCase()}</span>}
                title={session.title}
                subtitle={<>Every creative move on this song, permanently recorded. Nothing is ever deleted. This is the definitive record of how <span className="text-white">{session.title}</span> came into being.</>}
                right={(
                    <div className="border border-indigo-400/30 bg-indigo-400/[0.05] p-6 min-w-[260px]">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-200 mb-3">/ SIGNATURE</div>
                        <div className="font-mono-metadata text-xs text-zinc-500 mb-1">Events</div>
                        <div className="font-display font-bold text-3xl text-white tabular-nums">{feed.length}</div>
                        <div className="mt-4 font-mono-metadata text-xs text-zinc-500 mb-1">Version</div>
                        <div className="font-mono-metadata font-bold text-indigo-300">v{version}.0</div>
                    </div>
                )}
                extraBottom={(
                    <>
                        {collaborators.length > 0 && (
                            <div className="mt-10 flex items-center gap-3 flex-wrap">
                                <div className="flex -space-x-2">
                                    {collaborators.slice(0, 6).map((c, i) => {
                                        const col = c.color || colorForAncrId(c.user_id || String(i)).hex;
                                        const initials = (c.name || '?').split(' ').map(x => x[0]).slice(0,2).join('').toUpperCase();
                                        return <div key={c.user_id || i} title={c.name} className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-black font-display font-bold text-[10px]" style={{ background: col, boxShadow: `0 0 14px ${col}66` }}>{initials}</div>;
                                    })}
                                </div>
                                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">{collaborators.length} verified {collaborators.length === 1 ? 'creator' : 'creators'}</div>
                            </div>
                        )}
                        <LifeSpine currentStage={stage} />
                    </>
                )}
            />

            <section className="border-b border-zinc-900 bg-black">
                <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-16">
                    <Link to={`/sessions/${id}/studio`}>
                        <Button variant="ghost" className="text-zinc-500 hover:text-white mb-8 -ml-4">
                            <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={1.5} /> Back to studio
                        </Button>
                    </Link>

                    <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
                        <div>
                            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-3">/ CHAPTER I · EVERY EVENT · IMMUTABLE</div>
                            <h2 className="font-display font-black text-3xl md:text-5xl tracking-tighter text-white leading-[0.95]">The permanent record.</h2>
                        </div>
                        <Link to={`/sessions/${id}/release`} className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-colors flex items-center gap-2">
                            Continue to Release Path <ArrowUpRight className="w-3 h-3" strokeWidth={1.5} />
                        </Link>
                    </div>

                    {/* Filters */}
                    <div data-testid={DNA.filter} className="flex flex-wrap gap-2 mb-8">
                        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label={`All · ${feed.length}`} />
                        {EVENT_TYPES.map((t) => {
                            const count = feed.filter((f) => f.kind === t.kind).length;
                            if (count === 0) return null;
                            return <FilterChip key={t.kind} active={filter === t.kind} onClick={() => setFilter(t.kind)} label={`${t.label} · ${count}`} color={t.color} />;
                        })}
                    </div>

                {/* Timeline */}
                <div className="space-y-10">
                    {Object.keys(byDay).length === 0 ? (
                        <div className="p-16 border border-dashed border-zinc-800 text-center">
                            <div className="font-display font-semibold text-xl text-zinc-400 mb-2">No history yet</div>
                            <div className="text-sm text-zinc-600">As you work on this song, every action is permanently recorded here.</div>
                        </div>
                    ) : (
                        Object.entries(byDay).map(([day, items]) => (
                            <section key={day}>
                                <div className="mb-6 flex items-baseline gap-4">
                                    <div className="font-display font-bold text-xl text-white">{new Date(day).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-600">{items.length} events</div>
                                </div>
                                <div className="relative border-l border-zinc-800 pl-8 space-y-4">
                                    {items.map((f) => {
                                        const meta = iconFor(f.kind);
                                        const Icon = meta.icon;
                                        const color = f.color || meta.color;
                                        return (
                                            <div key={f.event_id} data-testid={DNA.event} className="relative">
                                                <span className="absolute -left-[calc(2rem+7px)] top-4 w-3.5 h-3.5 rounded-full border-2 border-zinc-950 flex items-center justify-center" style={{ background: `${color}20`, boxShadow: `0 0 12px ${color}80` }}>
                                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                                                </span>
                                                <div className="p-5 border border-zinc-900 hover:border-zinc-700 bg-zinc-950 transition-all">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-9 h-9 border flex items-center justify-center flex-shrink-0" style={{ borderColor: `${color}60`, background: `${color}10` }}>
                                                            <Icon className="w-4 h-4" style={{ color }} strokeWidth={1.5} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-baseline justify-between gap-3">
                                                                <div className="font-display font-semibold text-white">{meta.label}</div>
                                                                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-600 flex-shrink-0">
                                                                    {new Date(f.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                                </div>
                                                            </div>
                                                            <div className="mt-1 text-sm text-zinc-400">{f.label}</div>
                                                            {f.meta?.preview && <div className="mt-2 text-xs text-zinc-500 italic border-l-2 pl-3" style={{ borderColor: color }}>"{f.meta.preview}"</div>}
                                                            {f.meta?.description && <div className="mt-2 text-xs text-zinc-500 leading-relaxed">{f.meta.description}</div>}
                                                            <div className="mt-3 flex flex-wrap items-center gap-3 font-mono-metadata text-[9px] uppercase tracking-[0.25em]">
                                                                <span style={{ color }}>{f.user_name || 'System'}</span>
                                                                {f.meta?.role && <span className="text-zinc-500">Role · {f.meta.role}</span>}
                                                                {f.meta?.section && <span className="text-zinc-500">Section · {f.meta.section}</span>}
                                                                {f.meta?.weight && <span className="text-zinc-500">Weight · {f.meta.weight}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        ))
                    )}
                </div>

                <div className="mt-16 p-6 border border-zinc-900 bg-zinc-950 font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-600 flex items-center justify-between">
                    <span>Song DNA™ · Permanent creative history · Immutable</span>
                    <span>© INHEIRA · A flagship of ANCR</span>
                </div>
                </div>
            </section>
            <ANCRFooter left="Song DNA™ · Immutable" right="INHEIRA™ · From Creation to Legacy" />
        </div>
    );
}

function FilterChip({ active, onClick, label, color = '#A1A1AA' }) {
    return (
        <button
            onClick={onClick}
            className={`px-3.5 py-1.5 font-mono-metadata text-[10px] uppercase tracking-[0.25em] border transition-all ${active ? 'bg-indigo-400/10 border-indigo-400 text-indigo-300' : 'border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700'}`}
            style={active ? {} : { color }}
        >
            {label}
        </button>
    );
}
