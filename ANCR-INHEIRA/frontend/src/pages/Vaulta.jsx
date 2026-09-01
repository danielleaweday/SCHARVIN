import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import Nav from '@/components/Nav';
import { moduleHref } from '@/lib/moduleRegistry';
import { VAULTA } from '@/constants/testIds';
import { Coins, TrendingUp, Radio, Film, DollarSign, ArrowUpRight, Music } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer } from 'recharts';
import { CinematicHero, ANCRFooter, EmptyBlock } from '@/components/cinematic';
import { colorForAncrId } from '@/lib/collaboratorColors';
import { LIFE_STAGES, inferSessionStage } from '@/lib/lifeOfSong';

const IMG_VAULT = 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?crop=entropy&cs=srgb&fm=jpg&w=1800&q=80';

export default function Vaulta() {
    const [data, setData] = useState({ works: [], total_earnings: 0 });
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [r, s] = await Promise.all([api.get('/royalties'), api.get('/sessions')]);
                setData(r.data || { works: [], total_earnings: 0 });
                setSessions(s.data || []);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // 10-year revenue forecast — deterministic curve so it feels real
    const forecast = useMemo(() => {
        const y0 = new Date().getFullYear();
        const base = Math.max(data.total_earnings || 0, 100);
        return Array.from({ length: 10 }).map((_, i) => ({
            year: `${y0 + i}`,
            revenue: Math.round(base * (1 + i * 0.35) * (1 - Math.max(0, i - 5) * 0.05)),
        }));
    }, [data.total_earnings]);

    const nextPayout = 90; // days
    const sessionById = useMemo(() => {
        const m = {};
        for (const s of sessions) m[s.session_id] = s;
        return m;
    }, [sessions]);

    return (
        <div data-testid={VAULTA.root} className="min-h-screen bg-black text-white">
            <Nav />

            <CinematicHero
                eyebrow={<span className="flex items-center gap-2"><Coins className="w-3 h-3 text-indigo-300" strokeWidth={1.5} /> VAULTA · ROYALTY INFRASTRUCTURE</span>}
                title={<>Every work,<br />every stream,<br /><span className="bg-gradient-to-r from-sky-200 via-indigo-100 to-violet-200 bg-clip-text text-transparent">every dollar.</span></>}
                subtitle="Every finalized INHEIRA™ work automatically connects to a lifelong royalty rail — performance, mechanical, sync, and neighboring rights."
                right={(
                    <div data-testid={VAULTA.totalEarnings} className="border border-indigo-400/30 bg-indigo-400/[0.05] p-6 min-w-[280px]">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-200 mb-2">Estimated earnings</div>
                        <div className="font-display font-black text-5xl text-white tabular-nums">${data.total_earnings.toFixed(2)}</div>
                        <div className="mt-2 font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">across {data.works.length} works</div>
                        <div className="mt-4 pt-4 border-t border-zinc-900 flex items-center justify-between">
                            <span className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500">Next payout</span>
                            <span className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-emerald-300">~{nextPayout} days</span>
                        </div>
                    </div>
                )}
            />

            {/* Revenue breakdown */}
            <section className="border-b border-zinc-900 bg-black">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16">
                    <div className="mb-8">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-3">/ CHAPTER I · FOUR RIGHTS · ONE RAIL</div>
                        <h2 className="font-display font-black text-3xl md:text-5xl tracking-tighter text-white leading-[0.95]">Where the dollars come from.</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <StatCard icon={TrendingUp} label="Performance" value="$0.00" hint="ASCAP · BMI · SESAC · GMR" />
                        <StatCard icon={Radio}      label="Mechanical"  value="$0.00" hint="DSP streaming platforms" />
                        <StatCard icon={Film}       label="Sync"        value="$0.00" hint="TV · Film · Ads · Games" />
                        <StatCard icon={Coins}      label="Neighboring" value="$0.00" hint="Master · Broadcast" />
                    </div>
                </div>
            </section>

            {/* Works list — with Life of a Song stage + identity color chips */}
            <section className="relative border-b border-zinc-900 bg-black overflow-hidden">
                <div className="absolute inset-0 opacity-[0.10] pointer-events-none" style={{ backgroundImage: `url(${IMG_VAULT})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.70), rgba(0,0,0,0.92))' }} />
                <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 py-16">
                    <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
                        <div>
                            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-3">/ CHAPTER II · YOUR WORKS</div>
                            <h2 className="font-display font-black text-3xl md:text-5xl tracking-tighter text-white leading-[0.95]">On the rail forever.</h2>
                        </div>
                        <Link to="/sessions" className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-colors flex items-center gap-2">
                            All sessions <ArrowUpRight className="w-3 h-3" strokeWidth={1.5} />
                        </Link>
                    </div>
                    {loading ? (
                        <div className="p-12 text-center text-zinc-600 font-mono-metadata text-xs uppercase tracking-[0.3em]">Loading works…</div>
                    ) : data.works.length === 0 ? (
                        <EmptyBlock title="No finalized works on the rail yet." hint="Complete a session and lock splits — the work will appear here forever." />
                    ) : (
                        <div className="space-y-2">
                            {data.works.map((w) => {
                                const s = sessionById[w.session_id];
                                const stage = s ? inferSessionStage(s) : 6;
                                const stageInfo = LIFE_STAGES[stage - 1];
                                const StageIcon = stageInfo.Icon;
                                const collabs = (s?.collaborators || []).slice(0, 4);
                                return (
                                    <Link
                                        key={w.royalty_id}
                                        to={w.session_id ? `/sessions/${w.session_id}/release` : (moduleHref('vaulta') || '#')}
                                        data-testid={VAULTA.workRow}
                                        className="group grid grid-cols-12 gap-4 items-center px-5 py-4 border border-zinc-900 hover:border-zinc-700 bg-black/40 transition-colors"
                                    >
                                        <div className="col-span-4 min-w-0">
                                            <div className="text-white font-display font-semibold truncate">{w.title}</div>
                                            <div className="mt-1 font-mono-metadata text-[9px] uppercase tracking-[0.25em] text-zinc-500 flex items-center gap-2">
                                                <StageIcon className="w-3 h-3 text-indigo-300" strokeWidth={1.5} />
                                                {stageInfo.label}
                                            </div>
                                        </div>
                                        <div className="col-span-2 flex -space-x-2">
                                            {collabs.length === 0 ? (
                                                <span className="font-mono-metadata text-[9px] uppercase tracking-[0.25em] text-zinc-700">Solo</span>
                                            ) : collabs.map((c, i) => {
                                                const col = c.color || colorForAncrId(c.user_id || String(i)).hex;
                                                const initials = (c.name || '?').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
                                                return <div key={c.user_id || i} title={c.name} className="w-6 h-6 rounded-full border-2 border-black flex items-center justify-center text-black font-display font-bold text-[9px]" style={{ background: col, boxShadow: `0 0 8px ${col}66` }}>{initials}</div>;
                                            })}
                                        </div>
                                        <div className="col-span-2 font-mono-metadata text-sm text-indigo-300 font-bold tabular-nums">{w.percentage.toFixed(2)}%</div>
                                        <div className="col-span-2 font-mono-metadata text-sm text-zinc-400 tabular-nums">{w.streams.toLocaleString()} streams</div>
                                        <div className="col-span-2 text-right font-mono-metadata text-white font-bold tabular-nums">${w.earnings.toFixed(2)}</div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* 10-year forecast */}
            <section className="border-b border-zinc-900 bg-black">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16">
                    <div className="mb-8">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-3">/ CHAPTER III · TEN YEARS FROM NOW</div>
                        <h2 className="font-display font-black text-3xl md:text-5xl tracking-tighter text-white leading-[0.95]">Your rail, projected.</h2>
                        <p className="mt-4 text-zinc-400 max-w-xl text-sm">A rough forecast of your Vaulta™ rail over the next decade based on your current catalog. Not a prediction. A trajectory.</p>
                    </div>
                    <div className="border border-zinc-900 bg-zinc-950/40 p-6">
                        <div className="h-72">
                            <ResponsiveContainer>
                                <LineChart data={forecast}>
                                    <XAxis dataKey="year" stroke="#52525B" fontSize={11} />
                                    <YAxis stroke="#52525B" fontSize={11} tickFormatter={(v) => `$${v}`} />
                                    <RTooltip contentStyle={{ background: '#09090B', border: '1px solid #27272A' }} formatter={(v) => `$${v}`} />
                                    <Line type="monotone" dataKey="revenue" stroke="#818cf8" strokeWidth={2.5} dot={{ fill: '#818cf8', r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </section>

            {/* Note strip */}
            <section className="border-b border-zinc-900 bg-black">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10 flex items-start gap-4">
                    <DollarSign className="w-5 h-5 text-indigo-300 mt-1" strokeWidth={1.5} />
                    <div>
                        <div className="font-display font-semibold text-base text-white mb-2">Illustrative rail — live income sources connect in v2.</div>
                        <div className="text-sm text-zinc-500 leading-relaxed max-w-3xl">
                            In the next release, connect PRO accounts (ASCAP, BMI, SESAC, GMR), publisher administration systems, and streaming distribution to see real-time performance, mechanical, sync, and neighboring income by work.
                        </div>
                    </div>
                </div>
            </section>

            <ANCRFooter left="Vaulta™ · Lifelong royalty rail" right="Powered by ANCR™" />
        </div>
    );
}

function StatCard({ icon: Icon, label, value, hint }) {
    return (
        <div className="border border-zinc-900 bg-zinc-950/40 p-6">
            <Icon className="w-4 h-4 text-indigo-300 mb-4" strokeWidth={1.5} />
            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-2">{label}</div>
            <div className="font-display font-bold text-2xl text-white tabular-nums">{value}</div>
            <div className="mt-2 font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-600">{hint}</div>
        </div>
    );
}
