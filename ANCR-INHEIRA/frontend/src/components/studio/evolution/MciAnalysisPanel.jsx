import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { colorForAncrId } from '@/lib/collaboratorColors';
import { Loader2, ShieldCheck, RefreshCw, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

/*
 * INHEIRA — Musical Contribution Intelligence™ (MCI) panel
 *
 * Renders inside the Version Detail Sheet so the analytical picture is
 * co-located with the record it describes. Reads from
 *   GET  /api/sessions/{sid}/mci
 *   POST /api/sessions/{sid}/mci/refresh
 *
 * Guardrail copy stays visible whenever we show contribution numbers:
 * MCI analyses documented contributions only. It does not determine legal
 * ownership and does not assign publishing splits.
 */

const TONE = {
    lyric: '#a78bfa', melody: '#38bdf8', harmony: '#f472b6',
    arrangement: '#f59e0b', production: '#4ade80',
    identifier: '#94a3b8', acknowledgement: '#34d399', voice_moment: '#fb7185',
};

export default function MciAnalysisPanel({ sessionId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = async () => {
        try {
            const { data } = await api.get(`/sessions/${sessionId}/mci`);
            setData(data);
        } catch {}
        finally { setLoading(false); }
    };
    useEffect(() => { load(); /* eslint-disable-next-line */ }, [sessionId]);

    const refresh = async () => {
        setRefreshing(true);
        try {
            const { data } = await api.post(`/sessions/${sessionId}/mci/refresh`);
            setData(data);
            toast.success('MCI analysis refreshed');
        } catch (e) {
            toast.error(e?.response?.data?.detail || 'Refresh failed');
        } finally { setRefreshing(false); }
    };

    if (loading) {
        return <div className="p-6 font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-600"><Loader2 className="w-3 h-3 inline mr-2 animate-spin" /> Loading MCI…</div>;
    }
    if (!data) return null;

    const disclaimer = (
        <div className="mt-4 border border-zinc-900 bg-black/50 p-3 flex items-start gap-2" data-testid="mci-disclaimer">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-300 mt-0.5 shrink-0" />
            <p className="text-[11px] leading-relaxed text-zinc-400">
                <span className="text-zinc-200">MCI analyses documented musical contributions only.</span> It does not
                determine legal ownership and does not assign publishing splits. Every attribution can be reviewed,
                disputed, or annotated by humans in the session.
            </p>
        </div>
    );

    if (data.status !== 'analyzed') {
        const r = data.reason || {};
        return (
            <div data-testid="mci-panel-awaiting" className="border border-amber-400/25 bg-amber-400/[0.03] p-5">
                <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-amber-200 border border-amber-400/40 bg-amber-400/[0.06] px-2.5 py-1">
                        MCI · Awaiting Musical Contribution Analysis
                    </span>
                    <Button size="sm" variant="ghost" onClick={refresh} disabled={refreshing} className="ml-auto text-zinc-400 hover:text-white hover:bg-zinc-900 h-7" data-testid="mci-refresh-btn">
                        {refreshing ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-1" />} Refresh
                    </Button>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">
                    Not enough documented evidence has been captured yet for the analysis to run.
                </p>
                <ul className="mt-3 space-y-1 text-sm">
                    {[['Submitted versions', r.versions], ['Documented events', r.events], ['Human-review signals', r.human_signals]].map(([label, obj]) => {
                        const have = obj?.have ?? 0, need = obj?.need ?? 0;
                        const met = have >= need;
                        return (
                            <li key={label} className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${met ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                <span className="text-zinc-300">{label}:</span>
                                <span className={`font-mono text-xs ${met ? 'text-emerald-200' : 'text-amber-200'}`}>{have} / {need}</span>
                            </li>
                        );
                    })}
                </ul>
                {disclaimer}
            </div>
        );
    }

    const { contributors, totals, confidence } = data;
    return (
        <div data-testid="mci-panel-analyzed" className="border border-zinc-900 bg-black/40 p-5">
            <div className="flex items-center gap-2 flex-wrap mb-4">
                <span className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-emerald-200 border border-emerald-400/40 bg-emerald-400/[0.06] px-2.5 py-1">
                    MCI · Analyzed
                </span>
                <span className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 border border-zinc-800 px-2.5 py-1">
                    {confidence?.label}
                </span>
                <span className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-600">
                    {totals.total_signals} signals · {totals.human_signals} human-in-the-loop
                </span>
                <Button size="sm" variant="ghost" onClick={refresh} disabled={refreshing} className="ml-auto text-zinc-400 hover:text-white hover:bg-zinc-900 h-7" data-testid="mci-refresh-btn">
                    {refreshing ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-1" />} Refresh
                </Button>
            </div>

            <div className="space-y-4">
                {contributors.map((c) => {
                    const col = c.color || colorForAncrId(c.user_id).hex;
                    const initials = (c.name || '?').split(' ').map((x) => x[0]).slice(0, 2).join('').toUpperCase();
                    const sharePct = Math.round((c.documentation_share || 0) * 100);
                    return (
                        <div key={c.user_id} className="border border-zinc-900 bg-zinc-950/40 p-4" data-testid={`mci-contributor-${c.user_id}`}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-black font-display font-bold text-[10px]" style={{ background: col, boxShadow: `0 0 12px ${col}66` }}>{initials}</div>
                                <div>
                                    <div className="font-display font-semibold text-white text-sm">{c.name}</div>
                                    <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500">
                                        {c.total_signals} documented signals
                                    </div>
                                </div>
                                <div className="ml-auto text-right">
                                    <div className="font-display font-bold text-white text-2xl tracking-tighter">{sharePct}<span className="text-zinc-500 text-sm">%</span></div>
                                    <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500">Documentation share</div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {Object.entries(c.categories).filter(([, v]) => v.count > 0).map(([k, v]) => (
                                    <span key={k} className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] border px-2 py-1"
                                        style={{ color: TONE[k] || '#94a3b8', borderColor: `${TONE[k] || '#94a3b8'}55`, background: `${TONE[k] || '#94a3b8'}0e` }}>
                                        {v.label} · {v.count}
                                    </span>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-5 text-[11px] text-zinc-500 flex items-start gap-2">
                <Info className="w-3 h-3 mt-0.5 shrink-0" />
                <span>
                    <span className="text-zinc-300">Documentation share</span> is the % of documented signals attributable to a
                    contributor — a documentation-density measure, not an ownership split.
                </span>
            </div>

            {disclaimer}
        </div>
    );
}
