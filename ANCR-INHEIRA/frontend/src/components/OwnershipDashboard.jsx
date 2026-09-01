import { useMemo, useState } from 'react';
import { OWNERSHIP } from '@/constants/testIds';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RTooltip } from 'recharts';

const LENSES = [
    { key: 'lyrics', label: 'Lyrics', reason: 'Based on the number of lyric lines written per contributor.' },
    { key: 'composition', label: 'Composition', reason: 'Weighted by lyric lines + creative composition contributions.' },
    { key: 'publishing', label: 'Publishing', reason: 'Mirrors composition unless overridden by explicit publishing agreements.' },
    { key: 'master', label: 'Master', reason: 'Held by the label or artist entity — configurable per session.' },
    { key: 'producer', label: 'Producer Credits', reason: 'Production, Programming, Instrumentation, Arrangement and Engineering contributions.' },
    { key: 'performance', label: 'Performance', reason: 'Vocalists, session musicians and any recorded performance role.' },
];

function computeSplits(collaborators, lines, contribs, lens) {
    const totals = {};
    for (const c of collaborators) totals[c.user_id] = 0;

    if (lens === 'lyrics') {
        for (const l of lines) totals[l.user_id] = (totals[l.user_id] || 0) + 1;
    } else if (lens === 'composition' || lens === 'publishing') {
        for (const l of lines) totals[l.user_id] = (totals[l.user_id] || 0) + 1;
        for (const c of contribs) {
            if (['Melody', 'Harmony', 'Hook', 'Topline', 'Bridge', 'Creative Direction', 'Concept'].includes(c.role)) {
                totals[c.user_id] = (totals[c.user_id] || 0) + (c.weight || 1);
            }
        }
    } else if (lens === 'producer') {
        for (const c of contribs) {
            if (['Production', 'Programming', 'Instrumentation', 'Engineering', 'Arrangement'].includes(c.role)) {
                totals[c.user_id] = (totals[c.user_id] || 0) + (c.weight || 1);
            }
        }
    } else if (lens === 'performance') {
        for (const c of contribs) {
            if (['Instrumentation', 'Topline', 'Melody'].includes(c.role)) {
                totals[c.user_id] = (totals[c.user_id] || 0) + (c.weight || 1);
            }
        }
    } else if (lens === 'master') {
        // Default: session owner holds master
        totals[collaborators[0]?.user_id] = 1;
    }

    const total = Object.values(totals).reduce((a, b) => a + b, 0);
    return collaborators.map((c) => ({
        name: c.name || c.user_id,
        color: c.color || '#8B5CF6',
        value: total > 0 ? Math.round((totals[c.user_id] / total) * 100) : Math.round(100 / collaborators.length),
        raw: totals[c.user_id] || 0,
    }));
}

export default function OwnershipDashboard({ session, lines, contribs }) {
    const [lens, setLens] = useState('lyrics');
    const collaborators = useMemo(() => session.collaborators || [], [session.collaborators]);
    const data = useMemo(() => computeSplits(collaborators, lines, contribs, lens), [collaborators, lines, contribs, lens]);
    const current = LENSES.find((l) => l.key === lens);

    return (
        <div data-testid={OWNERSHIP.root} className="border border-zinc-900 bg-zinc-950 p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-2">/ Interactive Ownership</div>
                    <h2 className="font-display font-bold text-2xl text-white tracking-tight">Every credit, explained.</h2>
                </div>
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-500">{collaborators.length} contributors</div>
            </div>
            {/* Lens selector */}
            <div className="flex flex-wrap gap-2 mb-6">
                {LENSES.map((l) => (
                    <button
                        key={l.key}
                        data-testid={`${OWNERSHIP.lens}-${l.key}`}
                        onClick={() => setLens(l.key)}
                        className={`px-4 py-2 font-mono-metadata text-[10px] uppercase tracking-[0.25em] border transition-all ${lens === l.key ? 'border-indigo-400 bg-indigo-400/10 text-indigo-400' : 'border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700'}`}
                    >
                        {l.label}
                    </button>
                ))}
            </div>
            <div className="grid md:grid-cols-12 gap-8 items-center">
                {/* Chart */}
                <div className="md:col-span-5">
                    <div className="h-56 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={data} innerRadius={70} outerRadius={100} paddingAngle={2} dataKey="value" stroke="none" isAnimationActive animationDuration={800}>
                                    {data.map((d, i) => <Cell key={i} fill={d.color} />)}
                                </Pie>
                                <RTooltip contentStyle={{ background: '#09090B', border: '1px solid #27272A', fontSize: 12 }} formatter={(v, n) => [`${v}%`, n]} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <div className="font-display font-bold text-3xl text-white">{current.label}</div>
                            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.2em] text-zinc-500 mt-1">Ownership</div>
                        </div>
                    </div>
                </div>
                {/* Breakdown & reasoning */}
                <div className="md:col-span-7 space-y-3">
                    {data.map((d, i) => (
                        <div key={i} className="p-4 border border-zinc-900 bg-zinc-950 hover:border-zinc-700 transition-all">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                                    <span className="text-white font-medium">{d.name}</span>
                                </div>
                                <div className="font-mono-metadata font-bold text-lg" style={{ color: d.color }}>{d.value}%</div>
                            </div>
                            <div className="relative h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700" style={{ width: `${d.value}%`, background: d.color, boxShadow: `0 0 12px ${d.color}` }} />
                            </div>
                        </div>
                    ))}
                    <div className="mt-4 p-4 border border-indigo-400/20 bg-indigo-400/5">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-indigo-400 mb-2">Why these numbers?</div>
                        <p className="text-sm text-zinc-300 leading-relaxed">{current.reason}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
