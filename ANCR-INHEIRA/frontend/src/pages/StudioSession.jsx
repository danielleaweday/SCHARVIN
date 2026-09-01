import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { moduleHref, getModule } from '@/lib/moduleRegistry';
import ModuleLink from '@/components/ModuleLink';
import { copyToClipboard } from '@/lib/clipboard';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { STUDIO } from '@/constants/testIds';
import { InheiraMark } from '@/components/BrandLogos';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, Tooltip as RTooltip } from 'recharts';
import SongJourney from '@/components/SongJourney';
import OwnershipDashboard from '@/components/OwnershipDashboard';
import GlobalCollaborationMap from '@/components/GlobalCollaborationMap';
import ConnectedServicesWidget from '@/components/ConnectedServicesWidget';
import EvolutionTab from '@/components/studio/EvolutionTab';
import { CCC, DNA as DNA_IDS, RELEASE as RELEASE_IDS } from '@/constants/testIds';
import { LIFE_STAGES, STUDIO_CHAPTERS, chapterForTab, inferSessionStage, stageMeta } from '@/lib/lifeOfSong';
import { colorForAncrId } from '@/lib/collaboratorColors';
import {
    LayoutDashboard, Music, Mic2, Users, ShieldCheck, Coins, Send, BarChart3, FileText, Settings,
    Plus, Share2, Download, Sparkles, MessageSquare, Send as SendIcon, ArrowRight, Circle, Check,
    Copy, Music2, Rocket, Lock, ChevronRight, Zap, Radio, Film, Building2, TrendingUp, Clock,
    ArrowUpRight, Pin, Type, ChevronLeft, Fingerprint, Piano, Guitar, Layers, Mic, Folder,
    Waves, Volume2, PlayCircle, Upload, Globe as GlobeIcon,
} from 'lucide-react';

const STATUS_COLORS = {
    complete: '#10B981',
    in_progress: '#8B5CF6',
    not_started: '#52525B',
    locked: '#3F3F46',
    incomplete: '#EF4444',
};

const CHECKLIST_ORDER = [
    { key: 'lyrics', label: 'Lyrics' },
    { key: 'melody', label: 'Melody' },
    { key: 'arrangement', label: 'Arrangement' },
    { key: 'production', label: 'Production' },
    { key: 'mix', label: 'Mix' },
    { key: 'master', label: 'Master' },
    { key: 'artwork', label: 'Artwork' },
    { key: 'metadata', label: 'Metadata' },
    { key: 'publishing', label: 'Publishing' },
    { key: 'distribution', label: 'Distribution' },
    { key: 'release', label: 'Release' },
];

const SECTIONS = ['Verse 1', 'Pre-Chorus', 'Chorus', 'Verse 2', 'Bridge', 'Outro'];

export default function StudioSession() {
    const { id } = useParams();
    const nav = useNavigate();
    const { user } = useAuth();
    const [session, setSession] = useState(null);
    const [lines, setLines] = useState([]);
    const [events, setEvents] = useState([]);
    const [contribs, setContribs] = useState([]);
    const [messages, setMessages] = useState([]);
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('workspace');
    const [showMeta, setShowMeta] = useState(false);

    const load = useCallback(async () => {
        try {
            const [s, l, e, c, m] = await Promise.all([
                api.get(`/sessions/${id}`),
                api.get(`/sessions/${id}/lyrics`),
                api.get(`/sessions/${id}/events`),
                api.get(`/sessions/${id}/contributions`),
                api.get(`/sessions/${id}/messages`),
            ]);
            setSession(s.data);
            setLines(l.data);
            setEvents(e.data);
            setContribs(c.data);
            setMessages(m.data);
        } catch (err) {
            toast.error('Failed to load session');
            nav('/sessions');
        } finally {
            setLoading(false);
        }
    }, [id, nav]);

    useEffect(() => { load(); }, [load]);

    // periodic light refresh for a "live" feel
    useEffect(() => {
        const t = setInterval(async () => {
            try {
                const [e, m] = await Promise.all([
                    api.get(`/sessions/${id}/events`),
                    api.get(`/sessions/${id}/messages`),
                ]);
                setEvents(e.data);
                setMessages(m.data);
            } catch { /* polling errors ignored */ }
        }, 10000);
        return () => clearInterval(t);
    }, [id]);

    if (loading || !session) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <span className="font-mono-metadata text-xs uppercase tracking-[0.3em] text-zinc-500">Loading Studio Session…</span>
            </div>
        );
    }

    const isOwner = session.owner_id === user?.user_id;

    return (
        <div data-testid={STUDIO.root} className="min-h-screen bg-zinc-950 text-zinc-100 flex">
            <StudioSidebar sessionId={session.session_id} />

            {/* MAIN */}
            <main className="flex-1 min-w-0 flex flex-col">
                <TopBar session={session} user={user} onEditMeta={() => setShowMeta(true)} refresh={load} />

                <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col">
                    <ChapterNav tab={tab} onTabChange={setTab} />
                    <SessionPulseRail session={session} events={events} contribs={contribs} lines={lines} />

                    <TabsContent value="overview" className="mt-0 flex-1">
                        <OverviewTab session={session} lines={lines} events={events} contribs={contribs} messages={messages} insights={insights} setInsights={setInsights} onRefresh={load} currentUser={user} />
                    </TabsContent>
                    <TabsContent value="lyrics" className="mt-0 flex-1">
                        <div className="px-6 md:px-10 py-10 space-y-6">
                            <LyricsEditor session={session} lines={lines} onRefresh={load} currentUser={user} />
                            <OwnershipDashboard session={session} lines={lines} contribs={contribs} />
                        </div>
                    </TabsContent>
                    <TabsContent value="melody" className="mt-0 flex-1">
                        <PlaceholderTab title="Melody" description="Record and version melodies. Import MIDI. Attach voice topline references." icon={Waves} sessionId={session.session_id} />
                    </TabsContent>
                    <TabsContent value="chords" className="mt-0 flex-1">
                        <ChordsTab session={session} />
                    </TabsContent>
                    <TabsContent value="arrangement" className="mt-0 flex-1">
                        <ArrangementTab session={session} lines={lines} />
                    </TabsContent>
                    <TabsContent value="evolution" className="mt-0 flex-1">
                        <EvolutionTab sessionId={session.session_id} />
                    </TabsContent>
                    <TabsContent value="voice" className="mt-0 flex-1">
                        <PlaceholderTab title="Voice Memos" description="Drop iPhone / DAW voice memos. Automatically time-stamped and linked to the session." icon={Mic} sessionId={session.session_id} />
                    </TabsContent>
                    <TabsContent value="files" className="mt-0 flex-1">
                        <PlaceholderTab title="Files" description="Audio demos, instrumentals, PDFs, chord charts, artwork, contracts — everything searchable." icon={Folder} sessionId={session.session_id} />
                    </TabsContent>
                    <TabsContent value="collaborators" className="mt-0 flex-1">
                        <CollaboratorsTab session={session} lines={lines} contribs={contribs} />
                    </TabsContent>
                    <TabsContent value="chat" className="mt-0 flex-1">
                        <div className="px-6 md:px-10 py-10 max-w-3xl">
                            <ChatPanel sessionId={session.session_id} messages={messages} onRefresh={load} currentUser={user} />
                        </div>
                    </TabsContent>
                    <TabsContent value="rights" className="mt-0 flex-1">
                        <RightsCenter session={session} isOwner={isOwner} onRefresh={load} />
                    </TabsContent>
                    <TabsContent value="publishing" className="mt-0 flex-1">
                        <PublishingCommandCenter session={session} onRefresh={load} />
                    </TabsContent>
                    <TabsContent value="analytics" className="mt-0 flex-1">
                        <MetricsView session={session} lines={lines} events={events} contribs={contribs} messages={messages} />
                    </TabsContent>
                </Tabs>
            </main>

            <SongMetaDialog open={showMeta} onOpenChange={setShowMeta} session={session} onSaved={load} />
        </div>
    );
}

// -----------------------------------------------------------------------------
// SIDEBAR
// -----------------------------------------------------------------------------
function StudioSidebar({ sessionId }) {
    const [open, setOpen] = useState(false);
    const items = [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
        { icon: Music, label: 'Songs', to: '/sessions' },
        { icon: Music2, label: 'Studio', to: null, active: true },
        { icon: Fingerprint, label: 'Song DNA', to: `/sessions/${sessionId}/dna` },
        { icon: Rocket, label: 'Release', to: `/sessions/${sessionId}/release` },
        { icon: Sparkles, label: 'Intelligence', to: `/sessions/${sessionId}/intelligence` },
        // Sibling ecosystem module — routed through the registry so this
        // link automatically follows Vaulta's deployment (local today, its
        // own domain tomorrow). See /app/frontend/src/lib/moduleRegistry.js.
        (() => {
            const m = getModule('vaulta');
            return { icon: Coins, label: m?.display_name || 'Vaulta', to: moduleHref('vaulta'), external: !!m?.external_url };
        })(),
        { icon: Send, label: 'Integrations', to: '/settings/integrations' },
        { icon: Settings, label: 'Settings', to: '/profile' },
    ];
    return (
        <>
            <button
                onClick={() => setOpen(!open)}
                aria-label={open ? 'Close menu' : 'Open menu'}
                className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 border border-zinc-800 bg-zinc-950/90 backdrop-blur flex items-center justify-center"
            >
                <div className="w-4 h-3 flex flex-col justify-between">
                    <span className={`h-px bg-zinc-300 transition-transform ${open ? 'translate-y-[6px] rotate-45' : ''}`} />
                    <span className={`h-px bg-zinc-300 transition-opacity ${open ? 'opacity-0' : ''}`} />
                    <span className={`h-px bg-zinc-300 transition-transform ${open ? '-translate-y-[6px] -rotate-45' : ''}`} />
                </div>
            </button>
            {open && <div className="lg:hidden fixed inset-0 z-30 bg-black/60" onClick={() => setOpen(false)} />}
            <aside
                data-testid={STUDIO.sidebar}
                className={`fixed lg:sticky top-0 h-screen w-60 xl:w-64 border-r border-zinc-900 bg-zinc-950 flex flex-col flex-shrink-0 z-40 transition-transform ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
            <div className="px-5 py-6 border-b border-zinc-900">
                <Link to="/dashboard">
                    <InheiraMark className="h-14 w-auto" />
                </Link>
            </div>
            <nav className="flex-1 px-3 py-6 space-y-1 overflow-auto">
                {items.map((it) => {
                    const Icon = it.icon;
                    const inner = (
                        <div className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${it.active ? 'bg-indigo-400/10 text-indigo-400 border border-indigo-400/20' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}>
                            <Icon className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-mono-metadata text-xs uppercase tracking-[0.15em]">{it.label}</span>
                        </div>
                    );
                    return it.to
                        ? (it.external
                            ? <a key={it.label} href={it.to} target="_blank" rel="noreferrer">{inner}</a>
                            : <Link key={it.label} to={it.to}>{inner}</Link>)
                        : <div key={it.label} className="opacity-70">{inner}</div>;
                })}
            </nav>
            <div className="px-5 py-4 border-t border-zinc-900 font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-700">
                Powered by ANCR
            </div>
        </aside>
        </>
    );
}

// -----------------------------------------------------------------------------
// TOP BAR — cinematic studio header (matches Landing / Creator Home aesthetic)
// -----------------------------------------------------------------------------
function TopBar({ session, user, onEditMeta, refresh }) {
    const meta = session.song_meta || {};
    const [copied, setCopied] = useState(false);
    const copyInvite = async () => {
        const { ok } = await copyToClipboard(session.invite_code);
        setCopied(ok);
        setTimeout(() => setCopied(false), 1500);
        toast[ok ? 'success' : 'error'](ok ? 'Invite code copied' : `Invite code: ${session.invite_code}`);
    };
    const collaborators = session.collaborators || [];
    const stage = inferSessionStage(session);
    const stageInfo = stageMeta(stage);
    return (
        <div className="relative border-b border-zinc-900 bg-black overflow-hidden">
            {/* cinematic backdrop */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute -top-40 left-1/3 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-30" style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.16), transparent 65%)' }} />
                <div className="absolute -top-24 right-0 w-[600px] h-[400px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.14), transparent 65%)' }} />
            </div>

            <div className="relative px-6 md:px-10 py-10 md:py-12">
                <div className="grid md:grid-cols-12 gap-6">
                    <div className="md:col-span-7">
                        <div className="flex items-center gap-3 mb-4 flex-wrap">
                            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-slate-500 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Studio Session · Live
                            </div>
                            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-zinc-700">
                                / {session.session_id.slice(-6).toUpperCase()}
                            </div>
                            <div
                                data-testid="studio-documenting-indicator"
                                title="Every meaningful creative event is being documented automatically."
                                className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] flex items-center gap-1.5 text-indigo-200/80"
                            >
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-300 opacity-60" />
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-300" />
                                </span>
                                Documenting
                            </div>
                            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] flex items-center gap-1.5 text-indigo-300">
                                <stageInfo.Icon className="w-3 h-3" strokeWidth={1.5} />
                                Stage {String(stage).padStart(2,'0')} · {stageInfo.label}
                            </div>
                        </div>
                        <h1 data-testid={STUDIO.songTitle} className="font-display font-black text-5xl md:text-7xl tracking-tighter leading-[0.95] text-white">
                            <span className="bg-gradient-to-r from-white via-indigo-100 to-violet-200 bg-clip-text text-transparent">
                                {session.title}
                            </span>
                        </h1>
                        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono-metadata text-xs text-zinc-500">
                            <MetaChip label="Genre" value={meta.genre || '—'} />
                            <MetaChip label="Key" value={meta.key || '—'} />
                            <MetaChip label="Tempo" value={meta.tempo ? `${meta.tempo} BPM` : '—'} />
                            <MetaChip label="Time Sig" value={meta.time_signature || '4/4'} />
                            <MetaChip label="Language" value={meta.language || 'English'} />
                            <button onClick={onEditMeta} data-testid={STUDIO.editSongMetaBtn} className="text-indigo-300 hover:text-white transition-colors underline-offset-4 hover:underline">
                                Edit meta
                            </button>
                        </div>

                        {/* Persistent identity-color collaborator strip */}
                        {collaborators.length > 0 && (
                            <div className="mt-8 flex items-center gap-3 flex-wrap">
                                <div className="flex -space-x-2">
                                    {collaborators.slice(0, 6).map((c, i) => {
                                        const col = c.color || colorForAncrId(c.user_id || String(i)).hex;
                                        const initials = (c.name || '?').split(' ').map(x => x[0]).slice(0,2).join('').toUpperCase();
                                        return (
                                            <div key={c.user_id || i} title={c.name} className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-black font-display font-bold text-[10px]" style={{ background: col, boxShadow: `0 0 14px ${col}66` }}>
                                                {initials}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                                    {collaborators.length} {collaborators.length === 1 ? 'creator' : 'creators'} in the room
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="md:col-span-5 flex md:justify-end items-start gap-2 flex-wrap">
                        <Button
                            onClick={copyInvite}
                            data-testid={STUDIO.inviteBtn}
                            variant="outline"
                            className="border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 text-zinc-200 hover:text-white"
                        >
                            {copied ? <Check className="w-4 h-4 mr-2 text-emerald-400" /> : <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />}
                            Invite · {session.invite_code}
                        </Button>
                        <Button
                            data-testid={STUDIO.shareBtn}
                            variant="outline"
                            className="border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 text-zinc-200 hover:text-white"
                            onClick={async () => { const { ok } = await copyToClipboard(window.location.href); toast[ok ? 'success' : 'error'](ok ? 'Link copied' : 'Copy failed'); }}
                        >
                            <Share2 className="w-4 h-4 mr-2" strokeWidth={1.5} /> Share
                        </Button>
                        <Link to={`/sessions/${session.session_id}/intelligence`}>
                            <Button
                                variant="outline"
                                className="border-indigo-400/40 bg-indigo-400/[0.05] hover:bg-indigo-400/10 text-indigo-200 hover:text-white"
                            >
                                <Sparkles className="w-4 h-4 mr-2" strokeWidth={1.5} /> Intelligence Report™
                            </Button>
                        </Link>
                        <Link to={`/sessions/${session.session_id}/split-sheet`}>
                            <Button
                                data-testid={STUDIO.exportBtn}
                                variant="outline"
                                className="border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 text-zinc-200 hover:text-white"
                            >
                                <Download className="w-4 h-4 mr-2" strokeWidth={1.5} /> Export
                            </Button>
                        </Link>
                        <Link to={`/sessions/${session.session_id}/release`}>
                            <Button
                                data-testid={STUDIO.publishBtn}
                                disabled={releaseReadinessScore(session) < 100}
                                className="bg-white hover:bg-zinc-200 text-black font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <Rocket className="w-4 h-4 mr-2" strokeWidth={2} /> Publish
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Persistent Life of a Song™ spine */}
                <LifeSpine currentStage={stage} />
            </div>
        </div>
    );
}

function LifeSpine({ currentStage }) {
    return (
        <div className="mt-10 pt-8 border-t border-zinc-900">
            <div className="flex items-center justify-between mb-4">
                <div className="font-mono-metadata text-[9px] uppercase tracking-[0.4em] text-zinc-600">/ LIFE OF A SONG™</div>
                <div className="font-mono-metadata text-[9px] uppercase tracking-[0.4em] text-zinc-500">
                    Stage {String(currentStage).padStart(2,'0')} / 10
                </div>
            </div>
            <div className="relative h-10">
                <div className="absolute left-2 right-2 top-1/2 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
                <div className="absolute left-2 top-1/2 h-px bg-gradient-to-r from-indigo-400 to-sky-300" style={{ width: `calc(${((currentStage - 1) / (LIFE_STAGES.length - 1)) * 100}% - 4px)` }} />
                <div className="absolute inset-0 flex justify-between items-center">
                    {LIFE_STAGES.map((st, i) => {
                        const idx = i + 1;
                        const done = idx < currentStage;
                        const current = idx === currentStage;
                        return (
                            <div key={st.key} className="flex flex-col items-center gap-1.5" style={{ width: 60 }}>
                                <div className={`w-2.5 h-2.5 rounded-full border ${current ? 'bg-white border-white shadow-[0_0_16px_rgba(255,255,255,0.7)]' : done ? 'bg-indigo-400 border-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)]' : 'bg-zinc-900 border-zinc-800'}`} />
                                <div className={`font-mono-metadata text-[8px] uppercase tracking-[0.25em] whitespace-nowrap ${current ? 'text-white' : done ? 'text-indigo-300' : 'text-zinc-700'}`}>
                                    {String(idx).padStart(2,'0')} · {st.label}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------------
// CHAPTER NAV — the 12 tabs, grouped into 5 studio chapters
// Every existing tab value is preserved. Users select a chapter and then a tab.
// -----------------------------------------------------------------------------
const TAB_META = {
    overview:      { icon: LayoutDashboard, label: 'Overview',      testid: CCC.overview },
    lyrics:        { icon: Type,            label: 'Lyrics',        testid: CCC.lyrics },
    melody:        { icon: Waves,           label: 'Melody',        testid: CCC.melody },
    chords:        { icon: Piano,           label: 'Chords',        testid: CCC.chords },
    arrangement:   { icon: Layers,          label: 'Arrangement',   testid: CCC.arrangement },
    evolution:     { icon: Sparkles,        label: 'Evolution',     testid: 'studio-tab-evolution' },
    voice:         { icon: Mic,             label: 'Voice Memos',   testid: CCC.voice },
    files:         { icon: Folder,          label: 'Files',         testid: CCC.files },
    collaborators: { icon: Users,           label: 'Collaborators', testid: CCC.collaborators },
    chat:          { icon: MessageSquare,   label: 'Chat',          testid: CCC.chat },
    rights:        { icon: ShieldCheck,     label: 'Rights',        testid: STUDIO.tabRights },
    publishing:    { icon: Send,            label: 'Publishing',    testid: CCC.publishing },
    analytics:     { icon: BarChart3,       label: 'Analytics',     testid: STUDIO.tabAnalytics },
};

function ChapterNav({ tab, onTabChange }) {
    const activeChapter = chapterForTab(tab);
    const chapter = STUDIO_CHAPTERS.find((c) => c.key === activeChapter) || STUDIO_CHAPTERS[0];
    return (
        <div className="sticky top-0 z-30 bg-black/95 backdrop-blur border-b border-zinc-900">
            {/* Tier 1: Chapters */}
            <div className="px-6 md:px-10 py-4 border-b border-zinc-900/50 overflow-x-auto">
                <div className="flex items-center gap-1">
                    <div className="font-mono-metadata text-[9px] uppercase tracking-[0.4em] text-zinc-600 pr-4 whitespace-nowrap">/ CHAPTERS</div>
                    {STUDIO_CHAPTERS.map((c, i) => {
                        const isActive = c.key === activeChapter;
                        return (
                            <button
                                key={c.key}
                                data-testid={`studio-chapter-${c.key}`}
                                onClick={() => onTabChange(c.tabs[0])}
                                className={`group flex items-center gap-2 px-4 py-2 font-mono-metadata text-[10px] uppercase tracking-[0.3em] transition-all whitespace-nowrap ${isActive ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
                            >
                                <span className={`text-[9px] ${isActive ? 'text-indigo-300' : 'text-zinc-700 group-hover:text-zinc-500'}`}>{String(i + 1).padStart(2,'0')}</span>
                                <span>{c.label}</span>
                                {isActive && <span className="ml-1 w-1 h-1 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tier 2: Tabs of active chapter */}
            <div className="px-6 md:px-10 overflow-x-auto">
                <TabsList className="bg-transparent h-14 gap-1 justify-start">
                    {chapter.tabs.map((tk) => {
                        const meta = TAB_META[tk];
                        if (!meta) return null;
                        return <StudioTab key={tk} value={tk} testid={meta.testid} icon={meta.icon} label={meta.label} />;
                    })}
                </TabsList>
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------------
// SESSION PULSE RAIL — persistent under the chapter nav.
// Surfaces Song Intelligence™ + Creative Evidence™ everywhere, no matter which tab.
// -----------------------------------------------------------------------------
function SessionPulseRail({ session, events, contribs, lines }) {
    const recent = (events || []).slice(-3).reverse();
    const commercial = 55 + Math.min(35, (lines?.length || 0) * 2 + (contribs?.length || 0) * 3);
    const release = releaseReadinessScore(session);
    const sync = 50 + Math.min(40, (session.collaborators || []).length * 6);

    return (
        <div className="border-b border-zinc-900 bg-zinc-950/60">
            <div className="px-6 md:px-10 py-4 grid md:grid-cols-12 gap-4 items-center">
                {/* Song Intelligence pulse */}
                <div className="md:col-span-5 flex items-center gap-4 flex-wrap">
                    <div className="font-mono-metadata text-[9px] uppercase tracking-[0.4em] text-slate-500 flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-indigo-300" strokeWidth={1.5} />
                        Song Intelligence™
                    </div>
                    <PulseChip label="Commercial" value={Math.round(commercial)} />
                    <PulseChip label="Release" value={Math.round(release)} />
                    <PulseChip label="Sync" value={Math.round(sync)} />
                </div>

                {/* Creative Evidence recent strip */}
                <div className="md:col-span-7 flex items-center gap-3 flex-wrap justify-end">
                    <div className="font-mono-metadata text-[9px] uppercase tracking-[0.4em] text-slate-500 flex items-center gap-2 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Creative Evidence™
                    </div>
                    {recent.length === 0 ? (
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-600">Awaiting first move…</div>
                    ) : (
                        recent.map((e) => (
                            <div key={e.event_id} className="flex items-center gap-2 border border-zinc-800 bg-black px-2.5 py-1.5">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: e.color || '#8B5CF6', boxShadow: `0 0 8px ${e.color || '#8B5CF6'}80` }} />
                                <span className="font-mono-metadata text-[9px] uppercase tracking-[0.25em] text-zinc-600">{(e.kind || '').replace(/_/g, ' ')}</span>
                                <span className="text-[10px] text-zinc-300 truncate max-w-[160px]">{e.label}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function PulseChip({ label, value }) {
    return (
        <div className="flex items-center gap-2 border border-zinc-800 bg-black px-2.5 py-1.5">
            <span className="font-mono-metadata text-[9px] uppercase tracking-[0.25em] text-zinc-500">{label}</span>
            <span className="font-display font-bold text-xs text-white tabular-nums">{value}</span>
            <div className="w-12 h-1 bg-zinc-900 relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-sky-300 via-indigo-300 to-indigo-300" style={{ width: `${value}%` }} />
            </div>
        </div>
    );
}

function MetaChip({ label, value }) {
    return (
        <div className="flex items-baseline gap-2">
            <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-600">{label}</span>
            <span className="text-zinc-200">{value}</span>
        </div>
    );
}

// -----------------------------------------------------------------------------
// STUDIO TAB TRIGGER (compact style)
// -----------------------------------------------------------------------------
function StudioTab({ value, testid, icon: Icon, label }) {
    return (
        <TabsTrigger
            value={value}
            data-testid={testid}
            className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white text-zinc-500 font-mono-metadata text-[10px] uppercase tracking-[0.2em] whitespace-nowrap flex-shrink-0"
        >
            <Icon className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} /> {label}
        </TabsTrigger>
    );
}

// -----------------------------------------------------------------------------
// OVERVIEW TAB (Journey + Collaborators + Ownership + Timeline + Right rail)
// -----------------------------------------------------------------------------
function OverviewTab({ session, lines, events, contribs, messages, insights, setInsights, onRefresh, currentUser }) {
    return (
        <div className="px-6 md:px-10 py-10 space-y-6">
            <SongJourney session={session} />

            <div className="grid xl:grid-cols-12 gap-6">
                <div className="xl:col-span-8 space-y-6">
                    <CollaboratorsAndDonuts session={session} lines={lines} contribs={contribs} />
                    <OwnershipDashboard session={session} lines={lines} contribs={contribs} />
                    <SessionTimeline events={events} />
                </div>
                <div className="xl:col-span-4 space-y-6">
                    <CompletionPanel session={session} onRefresh={onRefresh} />
                    <ConnectedServicesWidget />
                    <InsightsPanel session={session} insights={insights} setInsights={setInsights} />
                    <ChatPanel sessionId={session.session_id} messages={messages} onRefresh={onRefresh} currentUser={currentUser} />
                </div>
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------------
// PLACEHOLDER TAB (Melody / Voice Memos / Files)
// -----------------------------------------------------------------------------
function PlaceholderTab({ title, description, icon: Icon, sessionId }) {
    return (
        <div className="px-6 md:px-10 py-10">
            <div className="border border-zinc-900 bg-zinc-950 p-16 text-center max-w-3xl mx-auto">
                <div className="w-16 h-16 border border-indigo-400/30 bg-indigo-400/5 flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-indigo-400" strokeWidth={1.5} />
                </div>
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-3">/ {title.toUpperCase()}</div>
                <h2 className="font-display font-bold text-3xl text-white tracking-tight mb-4">{title}</h2>
                <p className="text-zinc-500 max-w-lg mx-auto leading-relaxed">{description}</p>
                <div className="mt-8">
                    <Button disabled className="bg-indigo-400/40 text-zinc-950/60 h-11 px-6 cursor-not-allowed">
                        <Upload className="w-4 h-4 mr-2" strokeWidth={2} /> Upload {title} · coming soon
                    </Button>
                </div>
                <div className="mt-6 font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-600">
                    File-native evidence uploads land with the next release
                </div>
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------------
// CHORDS TAB
// -----------------------------------------------------------------------------
function ChordsTab({ session }) {
    const key = session.song_meta?.key || 'C Major';
    const suggested = key.toLowerCase().includes('minor')
        ? ['i', 'iv', 'v', 'VI', 'VII', 'III']
        : ['I', 'IV', 'V', 'vi', 'ii', 'iii'];
    const progression = key.toLowerCase().includes('minor')
        ? [{ chord: 'Em', beats: 4 }, { chord: 'C', beats: 4 }, { chord: 'G', beats: 4 }, { chord: 'D', beats: 4 }]
        : [{ chord: 'C', beats: 4 }, { chord: 'G', beats: 4 }, { chord: 'Am', beats: 4 }, { chord: 'F', beats: 4 }];
    return (
        <div className="px-6 md:px-10 py-10 space-y-6">
            <div className="border border-zinc-900 bg-zinc-950 p-8">
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-2">/ Chords</div>
                <h2 className="font-display font-bold text-3xl text-white tracking-tight mb-2">Progression in {key}.</h2>
                <p className="text-zinc-500 mb-8">Working progression for the song. Chord editor coming next.</p>

                {/* Progression display */}
                <div className="grid grid-cols-4 gap-3 mb-10">
                    {progression.map((p, i) => (
                        <div key={i} className="p-6 border border-zinc-800 bg-zinc-950 hover:border-indigo-400/40 transition-all text-center group">
                            <div className="font-display font-black text-4xl md:text-5xl text-white group-hover:text-indigo-400 transition-colors">{p.chord}</div>
                            <div className="mt-2 font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">{p.beats} beats</div>
                        </div>
                    ))}
                </div>

                {/* Suggested roman numerals */}
                <div>
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-3">Suggested degrees</div>
                    <div className="flex flex-wrap gap-2">
                        {suggested.map((s) => (
                            <span key={s} className="px-3 py-1.5 border border-zinc-800 font-mono-metadata text-sm text-zinc-300">{s}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------------
// ARRANGEMENT TAB
// -----------------------------------------------------------------------------
function ArrangementTab({ session, lines }) {
    const sections = ['Intro', 'Verse 1', 'Pre-Chorus', 'Chorus', 'Verse 2', 'Pre-Chorus', 'Chorus', 'Bridge', 'Chorus', 'Outro'];
    const linesBySection = {};
    for (const l of lines) linesBySection[l.section] = (linesBySection[l.section] || 0) + 1;
    return (
        <div className="px-6 md:px-10 py-10 space-y-6">
            <div className="border border-zinc-900 bg-zinc-950 p-8">
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-2">/ Arrangement</div>
                <h2 className="font-display font-bold text-3xl text-white tracking-tight mb-2">Song structure.</h2>
                <p className="text-zinc-500 mb-8">Section-by-section view of the current song. Live reordering lands with the next release.</p>
                <div className="space-y-2">
                    {sections.map((s, i) => {
                        const count = linesBySection[s] || 0;
                        return (
                            <div key={i} className="p-4 border border-zinc-900 bg-zinc-950 flex items-center gap-4 transition-all">
                                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-600 w-8">{String(i + 1).padStart(2, '0')}</div>
                                <div className="w-1 h-8 bg-indigo-400 rounded-full" style={{ opacity: 0.3 + Math.min(1, count / 4) * 0.7 }} />
                                <div className="flex-1">
                                    <div className="font-display font-semibold text-white">{s}</div>
                                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-500 mt-0.5">{count} lines</div>
                                </div>
                                <div className="font-mono-metadata text-xs text-zinc-500">{['8 bars', '16 bars', '8 bars', '16 bars', '16 bars', '8 bars', '16 bars', '8 bars', '16 bars', '8 bars'][i]}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------------
// COLLABORATORS TAB
// -----------------------------------------------------------------------------
function CollaboratorsTab({ session, lines, contribs }) {
    const collaborators = session.collaborators || [];
    return (
        <div className="px-6 md:px-10 py-10 space-y-6">
            <div className="border border-zinc-900 bg-zinc-950 p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-2">/ Room</div>
                        <h2 className="font-display font-bold text-3xl text-white tracking-tight">The people building this song.</h2>
                    </div>
                    <div className="hidden md:block font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                        Use the <span className="text-zinc-300">Invite · {session.invite_code}</span> button at the top of the studio to add collaborators.
                    </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {collaborators.map((c) => (
                        <ModuleLink key={c.user_id} module="ancrid" subpath={`/${c.user_id}`} className="p-6 border border-zinc-900 hover:border-zinc-700 bg-zinc-950 transition-all group relative overflow-hidden block">
                            <div className="absolute top-0 left-0 h-1 w-full" style={{ background: `linear-gradient(to right, ${c.color}, transparent)` }} />
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg border-2 flex-shrink-0" style={{ background: `${c.color}15`, borderColor: `${c.color}60`, color: c.color }}>
                                    {c.picture ? <img src={c.picture} alt="" className="w-full h-full rounded-full object-cover" /> : (c.name || '?').split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-white font-semibold truncate">{c.name}</div>
                                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-500 mt-0.5">{c.role}</div>
                                    <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono-metadata uppercase tracking-[0.2em]" style={{ color: c.color }}>
                                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: c.color }} /> Online
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-zinc-900 grid grid-cols-2 gap-3 font-mono-metadata">
                                <div>
                                    <div className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 mb-1">Lyrics</div>
                                    <div className="text-lg font-bold" style={{ color: c.color }}>{lines.filter((l) => l.user_id === c.user_id).length}</div>
                                </div>
                                <div>
                                    <div className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 mb-1">Contribs</div>
                                    <div className="text-lg font-bold" style={{ color: c.color }}>{contribs.filter((cc) => cc.user_id === c.user_id).length}</div>
                                </div>
                            </div>
                            <div className="mt-3 font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-indigo-400 flex items-center gap-1">
                                View Creator Passport™ <ArrowUpRight className="w-3 h-3" strokeWidth={2} />
                            </div>
                        </ModuleLink>
                    ))}
                </div>
            </div>

            <GlobalCollaborationMap collaborators={collaborators} />
        </div>
    );
}

// -----------------------------------------------------------------------------
// PUBLISHING COMMAND CENTER
// -----------------------------------------------------------------------------
function PublishingCommandCenter({ session, onRefresh }) {
    const rights = session.rights || {};
    const identifiers = rights.identifiers || {};
    const idScore = ['isrc', 'iswc', 'upc', 'song_id'].filter((k) => identifiers[k]).length;
    const doneChecks = Object.values(session.completion || {}).filter((v) => v === 'complete').length;
    const totalChecks = Object.keys(session.completion || {}).length;
    const score = releaseReadinessScore(session);

    const calendar = [
        { label: 'Pre-save live', date: '+2 weeks', done: score > 60 },
        { label: 'Artwork approved', date: '+3 weeks', done: session.completion?.artwork === 'complete' },
        { label: 'DSP delivery', date: '+4 weeks', done: session.completion?.distribution === 'complete' },
        { label: 'Release day', date: '+5 weeks', done: session.completion?.release === 'complete' },
    ];

    return (
        <div className="px-6 md:px-10 py-10 space-y-8">
            {/* Hero */}
            <div className="grid md:grid-cols-12 gap-6">
                <div className="md:col-span-8">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-3">/ PUBLISHING COMMAND CENTER</div>
                    <h2 className="font-display font-bold text-4xl md:text-5xl text-white tracking-tighter leading-[0.95]">Everything a publisher needs.</h2>
                    <p className="mt-4 text-zinc-500 max-w-2xl leading-relaxed">All identifiers, metadata, licensing and marketing assets in one pre-release command center. Nothing ships until every item is completed.</p>
                </div>
                <div className="md:col-span-4">
                    <div className="p-6 border border-indigo-400/30 bg-indigo-400/5 h-full flex flex-col justify-between">
                        <div>
                            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-3">/ RELEASE READINESS</div>
                            <div className="font-display font-black text-6xl text-white">{score}%</div>
                        </div>
                        <div className="mt-4 font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                            {doneChecks} of {totalChecks} milestones · {idScore} of 4 identifiers
                        </div>
                    </div>
                </div>
            </div>

            {/* Command grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                    { label: 'ISRC', value: identifiers.isrc, icon: Fingerprint },
                    { label: 'UPC', value: identifiers.upc, icon: Fingerprint },
                    { label: 'EAN', value: identifiers.ean, icon: Fingerprint },
                    { label: 'ISWC', value: identifiers.iswc, icon: Fingerprint },
                    { label: 'Song ID', value: identifiers.song_id, icon: Fingerprint },
                    { label: 'IPI / CAE', value: (session.collaborators || [])[0]?.ipi_number, icon: ShieldCheck },
                    { label: 'Publisher info', value: (session.collaborators || [])[0]?.publisher, icon: Building2 },
                    { label: 'PRO registration', value: Object.values(rights.pros || {}).some((s) => s === 'registered') ? 'Active' : null, icon: Radio },
                    { label: 'Copyright', value: session.rights?.documents?.copyright ? 'Filed' : null, icon: FileText },
                    { label: 'Mechanical licensing', value: null, icon: FileText },
                    { label: 'Neighboring rights', value: null, icon: Coins },
                    { label: 'Metadata validation', value: doneChecks === totalChecks ? 'Passed' : null, icon: ShieldCheck },
                    { label: 'DSP distribution', value: Object.values(rights.dsps || {}).filter((s) => s === 'connected').length ? `${Object.values(rights.dsps || {}).filter((s) => s === 'connected').length} connected` : null, icon: Send },
                    { label: 'Artwork approval', value: session.completion?.artwork === 'complete' ? 'Approved' : null, icon: FileText },
                    { label: 'Marketing assets', value: null, icon: FileText },
                ].map((it) => {
                    const Icon = it.icon;
                    const done = Boolean(it.value);
                    return (
                        <div key={it.label} className={`p-5 border ${done ? 'border-emerald-500/30 bg-emerald-500/[0.03]' : 'border-zinc-900'} bg-zinc-950`}>
                            <Icon className={`w-4 h-4 mb-3 ${done ? 'text-emerald-400' : 'text-zinc-500'}`} strokeWidth={1.5} />
                            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-2">{it.label}</div>
                            {done ? (
                                <div className="text-sm text-white font-medium truncate">{it.value}</div>
                            ) : (
                                <div className="text-sm text-zinc-600 italic">Incomplete</div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Release calendar */}
            <div className="border border-zinc-900 bg-zinc-950 p-8">
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-2">/ Release Calendar</div>
                <h3 className="font-display font-bold text-2xl text-white tracking-tight mb-6">Path to release day.</h3>
                <div className="relative">
                    <div className="absolute top-4 left-0 right-0 h-px bg-zinc-800" />
                    <div className="grid grid-cols-4 gap-4">
                        {calendar.map((c, i) => (
                            <div key={i} className="relative">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mb-4 mx-auto ${c.done ? 'border-indigo-400 bg-indigo-400/20' : 'border-zinc-800 bg-zinc-950'}`}>
                                    {c.done ? <Check className="w-4 h-4 text-indigo-400" strokeWidth={2.5} /> : <Circle className="w-3 h-3 text-zinc-600" strokeWidth={1.5} />}
                                </div>
                                <div className="text-center">
                                    <div className="font-display font-semibold text-sm text-white">{c.label}</div>
                                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-500 mt-1">{c.date}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-8 flex items-center justify-between p-4 border border-indigo-400/30 bg-indigo-400/5">
                    <div>
                        <div className="font-display font-semibold text-white">Ready for release?</div>
                        <div className="text-xs text-zinc-500 mt-1">Complete all commanded items to unlock publish.</div>
                    </div>
                    <Link to={`/sessions/${session.session_id}/release`}>
                        <Button disabled={score < 100} className="bg-indigo-400 hover:bg-indigo-500 text-zinc-950 font-bold h-11 shadow-[0_0_20px_rgba(139, 92, 246,0.3)] disabled:opacity-40">
                            <Rocket className="w-4 h-4 mr-2" strokeWidth={2} /> {score < 100 ? `${100 - score}% remaining` : 'Publish'}
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------------
// WORKSPACE VIEW (legacy — kept for backwards compat, no longer used)
// -----------------------------------------------------------------------------
function WorkspaceView({ session, lines, events, contribs, messages, insights, setInsights, currentUser, onRefresh }) {
    return (
        <div className="px-6 md:px-10 py-10 grid xl:grid-cols-12 gap-6">
            {/* LEFT — Collaborators + Lyrics */}
            <div className="xl:col-span-8 space-y-6">
                <CollaboratorsAndDonuts session={session} lines={lines} contribs={contribs} />
                <LyricsEditor session={session} lines={lines} onRefresh={onRefresh} currentUser={currentUser} />
                <SessionTimeline events={events} />
            </div>

            {/* RIGHT — Completion + AI + Chat */}
            <div className="xl:col-span-4 space-y-6">
                <CompletionPanel session={session} onRefresh={onRefresh} />
                <InsightsPanel session={session} insights={insights} setInsights={setInsights} />
                <ChatPanel sessionId={session.session_id} messages={messages} onRefresh={onRefresh} currentUser={currentUser} />
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------------
// COLLABORATORS PANEL + DONUT CHARTS
// -----------------------------------------------------------------------------
function CollaboratorsAndDonuts({ session, lines, contribs }) {
    const collaborators = useMemo(() => session.collaborators || [], [session.collaborators]);

    const lyricsData = useMemo(() => {
        const totals = {};
        for (const l of lines) totals[l.user_id] = (totals[l.user_id] || 0) + 1;
        const total = Object.values(totals).reduce((a, b) => a + b, 0) || 1;
        return collaborators.map((c) => ({
            name: c.name || c.user_id,
            color: c.color || '#8B5CF6',
            value: Math.round(((totals[c.user_id] || 0) / total) * 100),
        }));
    }, [collaborators, lines]);

    const producerData = useMemo(() => {
        const totals = {};
        for (const c of contribs) {
            if (['Production', 'Programming', 'Instrumentation', 'Engineering', 'Arrangement'].includes(c.role)) {
                totals[c.user_id] = (totals[c.user_id] || 0) + (c.weight || 1);
            }
        }
        const total = Object.values(totals).reduce((a, b) => a + b, 0) || 1;
        return collaborators.map((c) => ({
            name: c.name || c.user_id,
            color: c.color || '#8B5CF6',
            value: Math.round(((totals[c.user_id] || 0) / total) * 100),
        }));
    }, [collaborators, contribs]);

    const compositionData = useMemo(() => {
        const totals = {};
        for (const c of contribs) totals[c.user_id] = (totals[c.user_id] || 0) + (c.weight || 1);
        for (const l of lines) totals[l.user_id] = (totals[l.user_id] || 0) + 1;
        const total = Object.values(totals).reduce((a, b) => a + b, 0) || 1;
        return collaborators.map((c) => ({
            name: c.name || c.user_id,
            color: c.color || '#8B5CF6',
            value: Math.round(((totals[c.user_id] || 0) / total) * 100),
        }));
    }, [collaborators, contribs, lines]);

    return (
        <div className="border border-zinc-900 bg-zinc-950 p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-2">/ 01 — Collaborators &amp; Contributions</div>
                    <h2 className="font-display font-bold text-2xl text-white tracking-tight">Everyone in the room.</h2>
                </div>
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-600">
                    {collaborators.length} active
                </div>
            </div>

            {/* Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                {collaborators.map((c) => (
                    <CollaboratorCard key={c.user_id} c={c} lines={lines} contribs={contribs} />
                ))}
            </div>

            {/* Donuts */}
            <div className="grid md:grid-cols-3 gap-6">
                <DonutBlock testid={STUDIO.donutLyrics} title="Lyrics" data={lyricsData} />
                <DonutBlock testid={STUDIO.donutProducer} title="Producer Credits" data={producerData} />
                <DonutBlock testid={STUDIO.donutComposition} title="Composition" data={compositionData} />
            </div>
        </div>
    );
}

function CollaboratorCard({ c, lines, contribs }) {
    const lyricsCount = lines.filter((l) => l.user_id === c.user_id).length;
    const contribCount = contribs.filter((cc) => cc.user_id === c.user_id).length;
    const initials = (c.name || '?').split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
    return (
        <div
            data-testid={STUDIO.collaboratorCard}
            className="p-5 border border-zinc-900 bg-zinc-950 hover:border-zinc-700 transition-all group relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 h-1 w-full" style={{ background: `linear-gradient(to right, ${c.color}, transparent)` }} />
            <div className="flex items-start gap-3 mb-4">
                <div
                    className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm border-2 flex-shrink-0"
                    style={{ background: `${c.color}15`, borderColor: `${c.color}60`, color: c.color }}
                >
                    {c.picture ? <img src={c.picture} alt="" className="w-full h-full rounded-full object-cover" /> : initials}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-sm truncate">{c.name}</div>
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.2em] text-zinc-500 truncate">{c.role}</div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono-metadata uppercase tracking-[0.2em]" style={{ color: c.color }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: c.color }} /> Online
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3 font-mono-metadata">
                <MiniStat label="Lyrics" value={lyricsCount} color={c.color} />
                <MiniStat label="Contribs" value={contribCount} color={c.color} />
            </div>
        </div>
    );
}

function MiniStat({ label, value, color }) {
    return (
        <div className="p-3 border border-zinc-900 rounded-sm bg-zinc-950">
            <div className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 mb-1">{label}</div>
            <div className="text-lg font-bold" style={{ color }}>{value}</div>
        </div>
    );
}

function DonutBlock({ title, data, testid }) {
    return (
        <div data-testid={testid} className="p-5 border border-zinc-900 bg-zinc-950">
            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-4">{title}</div>
            <div className="h-40 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data} innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
                        </Pie>
                        <RTooltip
                            contentStyle={{ background: '#09090B', border: '1px solid #27272A', borderRadius: 4, fontSize: 12 }}
                            formatter={(v, n) => [`${v}%`, n]}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="font-display font-bold text-xl text-white">100%</div>
                    <div className="font-mono-metadata text-[9px] uppercase tracking-[0.2em] text-zinc-600">total</div>
                </div>
            </div>
            <div className="mt-4 space-y-1.5">
                {data.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                            <span className="text-zinc-400 truncate max-w-[110px]">{d.name}</span>
                        </div>
                        <span className="font-mono-metadata font-bold" style={{ color: d.color }}>{d.value}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------------
// LYRICS EDITOR
// -----------------------------------------------------------------------------
function LyricsEditor({ session, lines, onRefresh, currentUser }) {
    const [activeSection, setActiveSection] = useState(SECTIONS[0]);
    const [draft, setDraft] = useState('');

    const bySection = useMemo(() => {
        const map = {};
        for (const s of SECTIONS) map[s] = [];
        for (const l of lines) {
            if (!map[l.section]) map[l.section] = [];
            map[l.section].push(l);
        }
        return map;
    }, [lines]);

    const addLine = async () => {
        const text = draft.trim();
        if (!text) return;
        try {
            await api.post(`/sessions/${session.session_id}/lyrics`, { section: activeSection, text });
            setDraft('');
            onRefresh();
        } catch {
            toast.error('Failed to add line');
        }
    };

    const removeLine = async (line_id) => {
        try {
            await api.delete(`/sessions/${session.session_id}/lyrics/${line_id}`);
            onRefresh();
        } catch {
            toast.error('Failed to delete');
        }
    };

    return (
        <div data-testid={STUDIO.lyricsEditor} className="border border-zinc-900 bg-zinc-950">
            <div className="p-8 pb-4 flex items-center justify-between border-b border-zinc-900">
                <div>
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-2">/ 02 — Lyrics Editor</div>
                    <h2 className="font-display font-bold text-2xl text-white tracking-tight">Every line, credited.</h2>
                </div>
                <div className="flex items-center gap-2 font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-600">
                    <Type className="w-3.5 h-3.5" strokeWidth={1.5} /> <span>{lines.length} lines</span>
                </div>
            </div>

            {/* Section tabs */}
            <div className="flex gap-1 px-8 pt-4 border-b border-zinc-900 overflow-auto">
                {SECTIONS.map((s) => {
                    const active = activeSection === s;
                    return (
                        <button
                            key={s}
                            data-testid={`${STUDIO.lyricsSection}-${s.toLowerCase().replace(/\s+/g, '-')}`}
                            onClick={() => setActiveSection(s)}
                            className={`px-4 py-3 font-mono-metadata text-[10px] uppercase tracking-[0.25em] border-b-2 transition-all whitespace-nowrap ${active ? 'text-indigo-400 border-indigo-400' : 'text-zinc-500 border-transparent hover:text-white'}`}
                        >
                            {s} <span className="ml-2 text-zinc-600">{(bySection[s] || []).length}</span>
                        </button>
                    );
                })}
            </div>

            {/* Lines */}
            <div className="p-8 space-y-2 min-h-[240px]">
                {(bySection[activeSection] || []).length === 0 ? (
                    <div className="text-sm text-zinc-600 italic">No lines yet in {activeSection}. Write the first line below.</div>
                ) : (
                    (bySection[activeSection] || []).map((l) => (
                        <div key={l.line_id} className="group flex items-start gap-3 py-1.5 pr-2 pl-4 border-l-2 hover:bg-zinc-900/40 transition-colors" style={{ borderColor: l.color }}>
                            <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: l.color }} />
                            <div className="flex-1 min-w-0">
                                <div className="text-zinc-100">{l.text}</div>
                                <div className="mt-1 font-mono-metadata text-[10px] uppercase tracking-[0.2em]" style={{ color: l.color }}>
                                    {l.user_name} · {new Date(l.created_at).toLocaleTimeString()}
                                </div>
                            </div>
                            {l.user_id === currentUser?.user_id && (
                                <button onClick={() => removeLine(l.line_id)} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 text-xs">delete</button>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Composer */}
            <div className="p-6 border-t border-zinc-900 bg-zinc-900/30 flex items-center gap-3">
                <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            addLine();
                        }
                    }}
                    data-testid={STUDIO.lineInput}
                    rows={2}
                    placeholder={`Write a line in ${activeSection}… (Enter to save, Shift+Enter for new line)`}
                    className="bg-zinc-950 border-zinc-800 text-white focus:border-indigo-400 focus:ring-indigo-400 resize-none"
                />
                <Button
                    onClick={addLine}
                    disabled={!draft.trim()}
                    data-testid={STUDIO.addLineBtn}
                    className="bg-indigo-400 hover:bg-indigo-500 text-zinc-950 font-bold h-11 px-6 disabled:opacity-40"
                >
                    <SendIcon className="w-4 h-4" strokeWidth={2} />
                </Button>
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------------
// SESSION TIMELINE
// -----------------------------------------------------------------------------
function SessionTimeline({ events }) {
    return (
        <div data-testid={STUDIO.timeline} className="border border-zinc-900 bg-zinc-950 p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-2">/ 03 — Session Timeline</div>
                    <h2 className="font-display font-bold text-2xl text-white tracking-tight">Every move, verified.</h2>
                </div>
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-600">
                    {events.length} events
                </div>
            </div>
            <div className="relative border-l border-zinc-800 pl-6 space-y-4 max-h-[420px] overflow-auto pr-2">
                {events.length === 0 ? (
                    <div className="text-sm text-zinc-600 italic">No activity yet. Start writing to see the timeline light up.</div>
                ) : (
                    events.slice().reverse().map((e) => (
                        <div key={e.event_id} className="relative">
                            <span className="absolute -left-[calc(1.5rem+5px)] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-zinc-950" style={{ background: e.color || '#8B5CF6', boxShadow: `0 0 12px ${e.color || '#8B5CF6'}80` }} />
                            <div className="flex items-baseline gap-3">
                                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.2em] text-zinc-600 w-16 flex-shrink-0">
                                    {new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm text-zinc-200">{e.label}</div>
                                    {e.meta?.preview && (
                                        <div className="text-xs text-zinc-500 italic mt-0.5">&ldquo;{e.meta.preview}&rdquo;</div>
                                    )}
                                </div>
                                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.2em]" style={{ color: e.color || '#71717A' }}>
                                    {(e.kind || '').replace(/_/g, ' ')}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------------
// COMPLETION PANEL
// -----------------------------------------------------------------------------
function CompletionPanel({ session, onRefresh }) {
    const completion = session.completion || {};
    const doneCount = Object.values(completion).filter((v) => v === 'complete').length;
    const total = Object.keys(completion).length || 1;
    const pct = Math.round((doneCount / total) * 100);

    const setStatus = async (key, status) => {
        try {
            await api.patch(`/sessions/${session.session_id}`, { completion: { [key]: status } });
            onRefresh();
        } catch {
            toast.error('Failed to update');
        }
    };

    const nextStatus = (s) => {
        if (s === 'complete') return 'not_started';
        if (s === 'in_progress') return 'complete';
        if (s === 'not_started') return 'in_progress';
        return s; // locked stays locked
    };

    return (
        <div data-testid={STUDIO.completion} className="border border-zinc-900 bg-zinc-950 p-6">
            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-2">/ Song Completion</div>
            <div className="flex items-center gap-4 mb-6">
                <div className="relative w-20 h-20">
                    <svg className="w-full h-full -rotate-90">
                        <circle cx="40" cy="40" r="34" stroke="#27272A" strokeWidth="6" fill="none" />
                        <circle
                            cx="40" cy="40" r="34"
                            stroke="#8B5CF6"
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray={2 * Math.PI * 34}
                            strokeDashoffset={2 * Math.PI * 34 * (1 - pct / 100)}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-display font-bold text-lg text-white">{pct}%</div>
                </div>
                <div>
                    <div className="font-display font-bold text-white text-lg">Overall progress</div>
                    <div className="text-xs text-zinc-500 mt-1">{doneCount} of {total} milestones complete</div>
                </div>
            </div>
            <div className="space-y-1.5">
                {CHECKLIST_ORDER.map(({ key, label }) => {
                    const status = completion[key] || 'not_started';
                    const color = STATUS_COLORS[status] || '#52525B';
                    return (
                        <button
                            key={key}
                            data-testid={`${STUDIO.completionItem}-${key}`}
                            disabled={status === 'locked'}
                            onClick={() => setStatus(key, nextStatus(status))}
                            className="w-full flex items-center justify-between py-2 px-3 hover:bg-zinc-900 rounded-sm transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="flex items-center gap-3">
                                {status === 'complete' ? (
                                    <Check className="w-4 h-4" style={{ color }} strokeWidth={2} />
                                ) : status === 'locked' ? (
                                    <Lock className="w-3.5 h-3.5" style={{ color }} strokeWidth={1.5} />
                                ) : (
                                    <Circle className="w-3.5 h-3.5" style={{ color }} strokeWidth={status === 'in_progress' ? 2.5 : 1.5} fill={status === 'in_progress' ? color : 'none'} fillOpacity={0.3} />
                                )}
                                <span className="text-sm text-zinc-200 group-hover:text-white">{label}</span>
                            </div>
                            <span className="font-mono-metadata text-[9px] uppercase tracking-[0.25em]" style={{ color }}>
                                {(status || '').replace('_', ' ')}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------------
// INSIGHTS PANEL
// -----------------------------------------------------------------------------
function InsightsPanel({ session, insights, setInsights }) {
    const [loading, setLoading] = useState(false);
    const run = async () => {
        setLoading(true);
        try {
            const { data } = await api.post(`/sessions/${session.session_id}/insights`);
            setInsights(data);
            toast.success('INHEIRA Intelligence™ ready');
        } catch {
            toast.error('Failed to run insights');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div data-testid={STUDIO.insights} className="border border-indigo-400/20 bg-gradient-to-br from-indigo-400/[0.03] via-zinc-950 to-zinc-950 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" strokeWidth={1.5} />
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400">INHEIRA Intelligence™</div>
                </div>
                <Button size="sm" variant="ghost" onClick={run} disabled={loading} className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-400/10 text-xs h-7">
                    {loading ? 'Analyzing…' : insights ? 'Refresh' : 'Analyze'}
                </Button>
            </div>
            {!insights ? (
                <div className="text-sm text-zinc-500 py-4">
                    Analyze the session with Claude Sonnet 4.5 to reveal hit potential, writing balance, harmony ideas and the next-best action.
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <InsightStat label="Hit potential" value={`${insights.hit_potential_score ?? '—'}`} />
                        <InsightStat label="Commercial readiness" value={`${insights.commercial_readiness ?? '—'}%`} />
                        <InsightStat label="Genre confidence" value={`${Math.round((insights.genre_confidence || 0) * 100)}%`} />
                        <InsightStat label="Writing consistency" value={`${Math.round((insights.writing_consistency || 0) * 100)}%`} />
                    </div>
                    <div>
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-2">Most active</div>
                        <div className="text-sm text-white">{insights.most_active_collaborator || '—'}</div>
                    </div>
                    {insights.harmony_suggestions && (
                        <div>
                            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-2">Harmony suggestion</div>
                            <div className="text-sm text-zinc-300 italic leading-relaxed">{insights.harmony_suggestions}</div>
                        </div>
                    )}
                    {insights.suggested_next_task && (
                        <div className="p-3 border border-indigo-400/20 bg-indigo-400/5">
                            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-indigo-400 mb-1">Next task</div>
                            <div className="text-sm text-white font-medium">{insights.suggested_next_task}</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function InsightStat({ label, value }) {
    return (
        <div className="p-3 border border-zinc-900 bg-zinc-950">
            <div className="font-mono-metadata text-[9px] uppercase tracking-[0.25em] text-zinc-500 mb-1">{label}</div>
            <div className="text-lg font-bold text-white font-display">{value}</div>
        </div>
    );
}

// -----------------------------------------------------------------------------
// CHAT PANEL
// -----------------------------------------------------------------------------
function ChatPanel({ sessionId, messages, onRefresh, currentUser }) {
    const [text, setText] = useState('');
    const send = async () => {
        const t = text.trim();
        if (!t) return;
        try {
            await api.post(`/sessions/${sessionId}/messages`, { text: t, kind: 'text' });
            setText('');
            onRefresh();
        } catch {
            toast.error('Failed to send');
        }
    };
    return (
        <div data-testid={STUDIO.chat} className="border border-zinc-900 bg-zinc-950">
            <div className="p-5 border-b border-zinc-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-400" strokeWidth={1.5} />
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400">/ Session Chat</div>
                </div>
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-600">{messages.length} msgs</div>
            </div>
            <div className="p-5 space-y-3 max-h-[300px] overflow-auto">
                {messages.length === 0 ? (
                    <div className="text-sm text-zinc-600 italic">No messages yet. Say hi.</div>
                ) : (
                    messages.map((m) => (
                        <div key={m.message_id} className="flex items-start gap-3">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: `${m.color}20`, color: m.color, border: `1px solid ${m.color}60` }}>
                                {(m.user_name || '?').split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xs font-semibold" style={{ color: m.color }}>{m.user_name}</span>
                                    <span className="font-mono-metadata text-[9px] uppercase tracking-[0.2em] text-zinc-600">
                                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="text-sm text-zinc-300 mt-0.5 break-words">{m.text}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div className="p-3 border-t border-zinc-900 flex items-center gap-2">
                <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
                    data-testid={STUDIO.chatInput}
                    placeholder="Type a message…"
                    className="bg-zinc-900 border-zinc-800 text-white focus:border-indigo-400"
                />
                <Button onClick={send} disabled={!text.trim()} data-testid={STUDIO.chatSend} className="bg-indigo-400 hover:bg-indigo-500 text-zinc-950 font-bold">
                    <SendIcon className="w-4 h-4" strokeWidth={2} />
                </Button>
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------------
// METRICS VIEW
// -----------------------------------------------------------------------------
function MetricsView({ session, lines, events, contribs, messages }) {
    const words = lines.reduce((a, l) => a + (l.text || '').split(/\s+/).filter(Boolean).length, 0);
    const chars = lines.reduce((a, l) => a + (l.text || '').length, 0);
    const sections = new Set(lines.map((l) => l.section)).size;
    const collabs = (session.collaborators || []).length;
    const start = new Date(session.created_at).getTime();
    const hours = Math.max(0, (Date.now() - start) / 3600000).toFixed(1);
    const files = 0;
    const voiceNotes = messages.filter((m) => m.kind === 'voice').length;

    // Timeline chart data (events per hour bucket)
    const buckets = {};
    for (const e of events) {
        const d = new Date(e.created_at);
        const key = `${d.getHours().toString().padStart(2, '0')}:00`;
        buckets[key] = (buckets[key] || 0) + 1;
    }
    const chartData = Object.keys(buckets).sort().map((k) => ({ hour: k, events: buckets[k] }));

    return (
        <div data-testid={STUDIO.metrics} className="px-6 md:px-10 py-10 space-y-6">
            <div>
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-2">/ Song Metrics</div>
                <h2 className="font-display font-bold text-3xl text-white tracking-tight">Everything measured.</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
                <Metric label="Words" value={words} />
                <Metric label="Characters" value={chars} />
                <Metric label="Sections" value={sections} />
                <Metric label="Versions" value={lines.length} />
                <Metric label="Studio Hours" value={hours} />
                <Metric label="Collaborators" value={collabs} />
                <Metric label="Voice Notes" value={voiceNotes} />
                <Metric label="Files" value={files} />
                <Metric label="Events" value={events.length} />
                <Metric label="Contributions" value={contribs.length} />
                <Metric label="Messages" value={messages.length} />
                <Metric label="Completion" value={`${completionPct(session)}%`} accent />
            </div>

            <div className="border border-zinc-900 bg-zinc-950 p-6">
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-4">/ Activity Timeline</div>
                <div className="h-64">
                    {chartData.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-sm text-zinc-600">No activity yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <XAxis dataKey="hour" stroke="#52525B" fontSize={11} />
                                <RTooltip contentStyle={{ background: '#09090B', border: '1px solid #27272A', borderRadius: 4, fontSize: 12 }} />
                                <Line type="monotone" dataKey="events" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: '#8B5CF6', r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}

function Metric({ label, value, accent }) {
    return (
        <div className={`p-5 border bg-zinc-950 ${accent ? 'border-indigo-400/40 bg-indigo-400/5' : 'border-zinc-900'}`}>
            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-2">{label}</div>
            <div className={`font-display font-bold text-2xl ${accent ? 'text-indigo-400' : 'text-white'}`}>{value}</div>
        </div>
    );
}

// -----------------------------------------------------------------------------
// RIGHTS CENTER
// -----------------------------------------------------------------------------
function RightsCenter({ session, isOwner, onRefresh }) {
    const rights = session.rights || {};
    const identifiers = rights.identifiers || {};
    const pros = rights.pros || {};
    const dsps = rights.dsps || {};

    const generate = async (kind) => {
        try {
            await api.post(`/sessions/${session.session_id}/rights/generate/${kind}`);
            toast.success(`${kind.toUpperCase()} generated`);
            onRefresh();
        } catch {
            toast.error(`Failed to generate ${kind}`);
        }
    };

    const setPro = async (name, status) => {
        try {
            await api.patch(`/sessions/${session.session_id}`, { rights: { pros: { [name]: status } } });
            onRefresh();
        } catch { toast.error('Failed to update'); }
    };
    const setDsp = async (name, status) => {
        try {
            await api.patch(`/sessions/${session.session_id}`, { rights: { dsps: { [name]: status } } });
            onRefresh();
        } catch { toast.error('Failed to update'); }
    };

    const score = releaseReadinessScore(session);
    const remaining = releaseRemaining(session);

    return (
        <div data-testid={STUDIO.rightsRoot} className="px-6 md:px-10 py-10 space-y-8">
            <div className="grid xl:grid-cols-12 gap-6">
                <div className="xl:col-span-8 space-y-6">
                    {/* Identifiers */}
                    <div className="border border-zinc-900 bg-zinc-950 p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-2">/ IDENTIFIERS</div>
                                <h3 className="font-display font-bold text-2xl text-white tracking-tight">Verified codes for every registry.</h3>
                            </div>
                            <div className="flex items-center gap-2 font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-indigo-400">
                                <Fingerprint className="w-4 h-4" strokeWidth={1.5} />
                                RightPrint™ · Song DNA™
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                            <IdRow label="ISRC" value={identifiers.isrc} onGenerate={() => generate('isrc')} testid={STUDIO.generateIsrc} />
                            <IdRow label="UPC" value={identifiers.upc} onGenerate={() => generate('upc')} testid={STUDIO.generateUpc} />
                            <IdRow label="EAN" value={identifiers.ean} onGenerate={() => generate('ean')} />
                            <IdRow label="ISWC" value={identifiers.iswc} onGenerate={() => generate('iswc')} testid={STUDIO.generateIswc} />
                            <IdRow label="Song ID" value={identifiers.song_id} onGenerate={() => generate('song_id')} testid={STUDIO.generateSongId} />
                        </div>
                    </div>

                    {/* Writers */}
                    <div className="border border-zinc-900 bg-zinc-950 p-8">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-2">/ WRITERS</div>
                        <h3 className="font-display font-bold text-2xl text-white tracking-tight mb-6">Verified writers &amp; publishing.</h3>
                        <div className="border border-zinc-900">
                            {(session.collaborators || []).map((c) => (
                                <div key={c.user_id} className="grid grid-cols-12 items-center gap-4 p-4 border-b border-zinc-900 last:border-b-0">
                                    <div className="col-span-4 flex items-center gap-3">
                                        <div className="w-2 h-8 rounded-full" style={{ background: c.color }} />
                                        <div>
                                            <div className="text-white font-medium">{c.name}</div>
                                            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.2em] text-zinc-500">{c.role}</div>
                                        </div>
                                    </div>
                                    <div className="col-span-3 font-mono-metadata text-xs">
                                        <div className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 mb-1">IPI</div>
                                        <div className="text-zinc-300">{c.ipi_number || '—'}</div>
                                    </div>
                                    <div className="col-span-3 font-mono-metadata text-xs">
                                        <div className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 mb-1">Publisher</div>
                                        <div className="text-zinc-300">{c.publisher || '—'}</div>
                                    </div>
                                    <div className="col-span-2 flex justify-end">
                                        <span className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-emerald-400 flex items-center gap-1.5">
                                            <ShieldCheck className="w-3 h-3" strokeWidth={2} /> Verified
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* PROs */}
                    <div className="border border-zinc-900 bg-zinc-950 p-8">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-2">/ PERFORMANCE RIGHTS</div>
                        <h3 className="font-display font-bold text-2xl text-white tracking-tight mb-6">Register with every PRO.</h3>
                        <div className="grid md:grid-cols-2 gap-3">
                            {Object.entries(pros).map(([name, status]) => (
                                <StatusRow
                                    key={name}
                                    icon={Radio}
                                    label={name}
                                    status={status}
                                    action={status === 'unregistered' ? { label: 'Register', onClick: () => setPro(name, 'pending') } : status === 'pending' ? { label: 'Mark registered', onClick: () => setPro(name, 'registered') } : null}
                                />
                            ))}
                        </div>
                    </div>

                    {/* DSPs */}
                    <div className="border border-zinc-900 bg-zinc-950 p-8">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-2">/ DSP DELIVERY</div>
                        <h3 className="font-display font-bold text-2xl text-white tracking-tight mb-6">Distribution partners.</h3>
                        <div className="grid md:grid-cols-3 gap-3">
                            {Object.entries(dsps).map(([name, status]) => (
                                <DspCard key={name} name={name} status={status} onToggle={() => setDsp(name, status === 'not_connected' ? 'pending' : status === 'pending' ? 'connected' : 'ready')} />
                            ))}
                        </div>
                    </div>

                    {/* Copyright documents */}
                    <div className="border border-zinc-900 bg-zinc-950 p-8">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-2">/ COPYRIGHT &amp; DOCUMENTS</div>
                        <h3 className="font-display font-bold text-2xl text-white tracking-tight mb-6">One-click exports.</h3>
                        <div className="grid md:grid-cols-2 gap-3">
                            {[
                                'Copyright Registration', 'Split Sheet', 'Publishing Agreement', 'Mechanical License',
                                'Metadata Package', 'Label Copy', 'DDEX Package', 'Release Package',
                            ].map((d) => (
                                <div key={d} className="p-4 border border-zinc-900 hover:border-zinc-700 bg-zinc-950 transition-all flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-4 h-4 text-zinc-500" strokeWidth={1.5} />
                                        <span className="text-sm text-zinc-200">{d}</span>
                                    </div>
                                    <Link to={d === 'Split Sheet' ? `/sessions/${session.session_id}/split-sheet` : '#'}>
                                        <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-400/10 h-7 text-xs">
                                            Generate <ArrowUpRight className="w-3 h-3 ml-1" strokeWidth={2} />
                                        </Button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Release readiness sidebar */}
                <div className="xl:col-span-4 space-y-6">
                    <div className="border border-indigo-400/30 bg-gradient-to-br from-indigo-400/5 via-zinc-950 to-zinc-950 p-6 sticky top-24">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-2">/ RELEASE READINESS</div>
                        <div className="flex flex-col items-center py-4">
                            <div className="relative w-40 h-40" data-testid={STUDIO.releaseScore}>
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="80" cy="80" r="70" stroke="#27272A" strokeWidth="10" fill="none" />
                                    <circle
                                        cx="80" cy="80" r="70"
                                        stroke="#8B5CF6"
                                        strokeWidth="10"
                                        fill="none"
                                        strokeDasharray={2 * Math.PI * 70}
                                        strokeDashoffset={2 * Math.PI * 70 * (1 - score / 100)}
                                        strokeLinecap="round"
                                        style={{ transition: 'stroke-dashoffset 0.8s ease-out', filter: 'drop-shadow(0 0 12px rgba(139, 92, 246,0.6))' }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="font-display font-black text-5xl text-white">{score}%</div>
                                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-500 mt-1">Ready</div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-3">Remaining tasks</div>
                            {remaining.length === 0 ? (
                                <div className="text-sm text-emerald-400 flex items-center gap-2"><Check className="w-4 h-4" strokeWidth={2} /> All requirements complete</div>
                            ) : (
                                <div className="space-y-1.5">
                                    {remaining.map((r) => (
                                        <div key={r} className="flex items-center gap-2 text-sm text-zinc-400">
                                            <Circle className="w-3 h-3 text-zinc-600" strokeWidth={1.5} />
                                            <span className="capitalize">{r.replace(/_/g, ' ')}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <Button
                            data-testid={STUDIO.reviewPublishBtn}
                            disabled={score < 100}
                            className="w-full mt-6 h-12 bg-indigo-400 hover:bg-indigo-500 text-zinc-950 font-bold shadow-[0_0_30px_rgba(139, 92, 246,0.35)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            {score < 100 ? 'Complete requirements' : 'Review Everything & Publish'}
                            <ArrowRight className="w-4 h-4 ml-2" strokeWidth={2} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function IdRow({ label, value, onGenerate, testid }) {
    return (
        <div className="p-4 border border-zinc-900 hover:border-zinc-700 bg-zinc-950 flex items-center justify-between transition-all">
            <div>
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-1">{label}</div>
                {value ? (
                    <div className="font-mono-metadata text-sm text-white">{value}</div>
                ) : (
                    <div className="font-mono-metadata text-sm text-zinc-600 italic">Not generated</div>
                )}
            </div>
            <Button
                onClick={onGenerate}
                data-testid={testid}
                variant="outline"
                size="sm"
                className="border-zinc-800 bg-zinc-900 hover:bg-indigo-400 hover:text-zinc-950 hover:border-indigo-400 text-indigo-400 h-8 text-xs"
            >
                {value ? 'Re-generate' : 'Generate'}
            </Button>
        </div>
    );
}

function StatusRow({ icon: Icon, label, status, action }) {
    const isReg = status === 'registered' || status === 'connected' || status === 'ready';
    const isPend = status === 'pending';
    const color = isReg ? '#10B981' : isPend ? '#8B5CF6' : '#71717A';
    return (
        <div className="p-4 border border-zinc-900 hover:border-zinc-700 bg-zinc-950 flex items-center justify-between transition-all">
            <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" style={{ color }} strokeWidth={1.5} />
                <div>
                    <div className="text-white text-sm font-medium">{label}</div>
                    <div className="font-mono-metadata text-[9px] uppercase tracking-[0.25em]" style={{ color }}>{(status || '').replace(/_/g, ' ')}</div>
                </div>
            </div>
            {action && (
                <Button onClick={action.onClick} variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-400/10 h-7 text-xs">
                    {action.label}
                </Button>
            )}
        </div>
    );
}

function DspCard({ name, status, onToggle }) {
    const color = status === 'connected' || status === 'ready' ? '#10B981' : status === 'pending' ? '#8B5CF6' : '#71717A';
    return (
        <button onClick={onToggle} className="p-4 border border-zinc-900 hover:border-zinc-700 bg-zinc-950 text-left transition-all group">
            <div className="flex items-center justify-between mb-2">
                <div className="text-white text-sm font-medium">{name}</div>
                <span className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
            </div>
            <div className="font-mono-metadata text-[9px] uppercase tracking-[0.25em]" style={{ color }}>{(status || '').replace(/_/g, ' ')}</div>
        </button>
    );
}

// -----------------------------------------------------------------------------
// SONG META DIALOG
// -----------------------------------------------------------------------------
function SongMetaDialog({ open, onOpenChange, session, onSaved }) {
    const meta = session.song_meta || {};
    const [form, setForm] = useState({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { setForm({ ...meta }); }, [open]);
    const set = (k) => (e) => setForm({ ...form, [k]: e.target ? e.target.value : e });
    const save = async () => {
        try {
            await api.patch(`/sessions/${session.session_id}`, { song_meta: form });
            toast.success('Song info updated');
            onSaved();
            onOpenChange(false);
        } catch { toast.error('Failed to save'); }
    };
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl">Song info</DialogTitle>
                    <DialogDescription className="text-zinc-500">Set genre, key, tempo, time signature and status.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                    <MetaField label="Genre" value={form.genre} onChange={set('genre')} placeholder="e.g. R&B / Soul" />
                    <MetaField label="Key" value={form.key} onChange={set('key')} placeholder="e.g. E Minor" />
                    <MetaField label="Tempo (BPM)" value={form.tempo} onChange={set('tempo')} placeholder="124" />
                    <MetaField label="Time signature" value={form.time_signature} onChange={set('time_signature')} placeholder="4/4" />
                    <MetaField label="Language" value={form.language} onChange={set('language')} placeholder="English" />
                    <div>
                        <Label className="text-zinc-400 text-xs uppercase tracking-widest font-mono-metadata">Status</Label>
                        <Select value={form.status || 'Draft'} onValueChange={(v) => setForm({ ...form, status: v })}>
                            <SelectTrigger className="mt-2 bg-zinc-900 border-zinc-800"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                <SelectItem value="Draft">Draft</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Ready to Publish">Ready to Publish</SelectItem>
                                <SelectItem value="Published">Published</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Button onClick={save} className="w-full bg-indigo-400 hover:bg-indigo-500 text-zinc-950 font-bold mt-4">Save</Button>
            </DialogContent>
        </Dialog>
    );
}

function MetaField({ label, value, onChange, placeholder }) {
    return (
        <div>
            <Label className="text-zinc-400 text-xs uppercase tracking-widest font-mono-metadata">{label}</Label>
            <Input value={value || ''} onChange={onChange} placeholder={placeholder} className="mt-2 bg-zinc-900 border-zinc-800 text-white focus:border-indigo-400" />
        </div>
    );
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
function completionPct(session) {
    const c = session.completion || {};
    const done = Object.values(c).filter((v) => v === 'complete').length;
    const total = Object.keys(c).length || 1;
    return Math.round((done / total) * 100);
}

function releaseReadinessScore(session) {
    const c = session.completion || {};
    const rights = session.rights || {};
    const ids = rights.identifiers || {};
    const idFilled = ['isrc', 'iswc', 'song_id'].filter((k) => ids[k]).length;
    const doneCount = Object.values(c).filter((v) => v === 'complete').length;
    const total = Object.keys(c).length || 1;
    const completionWeight = (doneCount / total) * 70; // 70%
    const idsWeight = (idFilled / 3) * 20; // 20%
    const signedWeight = (session.splits_status === 'finalized') ? 10 : 0; // 10%
    return Math.min(100, Math.round(completionWeight + idsWeight + signedWeight));
}

function releaseRemaining(session) {
    const c = session.completion || {};
    const rights = session.rights || {};
    const ids = rights.identifiers || {};
    const remaining = [];
    for (const [k, v] of Object.entries(c)) {
        if (v !== 'complete' && v !== 'locked') remaining.push(k);
    }
    if (!ids.isrc) remaining.push('ISRC');
    if (!ids.iswc) remaining.push('ISWC');
    if (session.splits_status !== 'finalized') remaining.push('Splits signed');
    return remaining;
}
