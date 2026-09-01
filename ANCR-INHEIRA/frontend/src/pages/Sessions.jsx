import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Nav from '@/components/Nav';
import { SESSION_UI } from '@/constants/testIds';
import { Plus, ArrowUpRight, Hash, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { CinematicHero, ANCRFooter, EmptyBlock } from '@/components/cinematic';
import { LIFE_STAGES, inferSessionStage } from '@/lib/lifeOfSong';
import { colorForAncrId } from '@/lib/collaboratorColors';

export default function Sessions() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [code, setCode] = useState('');
    const nav = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get('/sessions');
                setSessions(data);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const join = async () => {
        if (!code.trim()) return;
        try {
            const { data } = await api.post(`/sessions/join-by-code/${code.trim()}`);
            toast.success('Joined session');
            nav(`/sessions/${data.session_id}/studio`);
        } catch (e) {
            toast.error(e?.response?.data?.detail || 'Invalid invite code');
        }
    };

    return (
        <div data-testid={SESSION_UI.listRoot} className="min-h-screen bg-black text-white">
            <Nav />

            <CinematicHero
                eyebrow="/ SESSIONS · EVERY MOMENT VERIFIED"
                title={<>Every session,<br />verified.</>}
                subtitle="Every idea documented from the first voice memo to the final signature. Step into an active session or start a new one."
                right={(
                    <div className="flex flex-col gap-3 md:items-end">
                        <Link to="/sessions/new">
                            <Button className="bg-white text-black hover:bg-zinc-200 font-bold h-12 px-6">
                                <Plus className="w-4 h-4 mr-2" strokeWidth={2} /> Begin a new session
                            </Button>
                        </Link>
                        <Link to="/writing-rooms" className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-colors flex items-center gap-2">
                            Or enter a writing room <ArrowUpRight className="w-3 h-3" strokeWidth={1.5} />
                        </Link>
                    </div>
                )}
            >
                {/* Join by invite code */}
                <div className="mt-12 grid md:grid-cols-12 gap-4">
                    <div className="md:col-span-6 lg:col-span-5 border border-zinc-900 bg-zinc-950/40 p-6">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-3">/ JOIN AN EXISTING SESSION</div>
                        <div className="text-sm text-zinc-500 mb-4">Enter the invite code shared by a collaborator.</div>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" strokeWidth={1.5} />
                                <Input
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    data-testid={SESSION_UI.joinCode}
                                    placeholder="INVITECODE"
                                    className="pl-9 bg-black border-zinc-800 text-white font-mono-metadata uppercase focus:border-indigo-400 focus:ring-indigo-400"
                                />
                            </div>
                            <Button onClick={join} data-testid={SESSION_UI.joinBtn} className="bg-white text-black hover:bg-zinc-200 font-bold">Join</Button>
                        </div>
                    </div>
                </div>
            </CinematicHero>

            {/* Session grid */}
            <section className="border-b border-zinc-900 bg-black">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16 md:py-20">
                    <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
                        <div>
                            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-3">/ CHAPTER I · YOUR ACTIVE ROOM</div>
                            <h2 className="font-display font-black text-3xl md:text-5xl tracking-tighter text-white">Sessions in progress.</h2>
                        </div>
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                            {sessions.length} total · {sessions.filter(s => s.splits_status === 'finalized').length} finalized
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {loading ? (
                            <div className="col-span-full text-center py-16 text-zinc-600 font-mono-metadata text-xs uppercase tracking-[0.3em]">Loading sessions…</div>
                        ) : sessions.length === 0 ? (
                            <div className="col-span-full">
                                <EmptyBlock title="No sessions yet." hint="Start a session or step into a writing room to begin your first documented moment." />
                            </div>
                        ) : (
                            sessions.map((s) => <SessionCinematicCard key={s.session_id} s={s} />)
                        )}
                    </div>
                </div>
            </section>

            <ANCRFooter />
        </div>
    );
}

function SessionCinematicCard({ s }) {
    const stage = inferSessionStage(s);
    const stageInfo = LIFE_STAGES[stage - 1];
    const StageIcon = stageInfo.Icon;
    const collabs = (s.collaborators || []).slice(0, 5);
    const collabCount = (s.collaborators || []).length;
    const finalized = s.splits_status === 'finalized';
    return (
        <Link
            to={`/sessions/${s.session_id}/studio`}
            className="group relative border border-zinc-900 hover:border-zinc-700 bg-zinc-950 transition-all overflow-hidden block"
        >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ background: 'radial-gradient(circle at top, rgba(129,140,248,0.06), transparent 60%)' }} />
            <div className="relative p-6">
                <div className="flex items-start justify-between mb-5">
                    <div className={`font-mono-metadata text-[10px] uppercase tracking-[0.3em] flex items-center gap-2 ${finalized ? 'text-indigo-300' : 'text-zinc-500'}`}>
                        <StageIcon className="w-3 h-3" strokeWidth={1.5} />
                        {finalized ? 'FINALIZED' : stageInfo.label}
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" strokeWidth={1.5} />
                </div>
                <div className="font-display font-black text-2xl text-white tracking-tighter mb-1 truncate leading-tight">{s.title}</div>
                <div className="font-mono-metadata text-xs text-zinc-500 mb-5 truncate">{s.working_title || s.project || 'Untitled project'}</div>

                {/* Life of a Song mini-bar */}
                <div className="mb-5">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-600">Life of a Song</span>
                        <span className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500">Stage {String(stage).padStart(2,'0')}/10</span>
                    </div>
                    <div className="h-1 bg-zinc-900 relative overflow-hidden">
                        <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-400 to-sky-300" style={{ width: `${(stage / 10) * 100}%` }} />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                        {collabs.length === 0 ? (
                            <span className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-700">Solo</span>
                        ) : (
                            collabs.map((c, i) => {
                                const p = c.color || colorForAncrId(c.user_id || String(i)).hex;
                                const initials = (c.name || '?').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
                                return (
                                    <div key={c.user_id || i} title={c.name} className="w-7 h-7 rounded-full border-2 border-zinc-950 flex items-center justify-center text-black font-display font-bold text-[10px]" style={{ background: p, boxShadow: `0 0 12px ${p}66` }}>{initials}</div>
                                );
                            })
                        )}
                        {collabCount > 5 && (
                            <div className="w-7 h-7 rounded-full border-2 border-zinc-950 bg-zinc-900 flex items-center justify-center text-zinc-400 font-mono-metadata text-[9px]">+{collabCount - 5}</div>
                        )}
                    </div>
                    <div className="text-right">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">{collabCount} {collabCount === 1 ? 'creator' : 'creators'}</div>
                        <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-700 mt-0.5">{new Date(s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
