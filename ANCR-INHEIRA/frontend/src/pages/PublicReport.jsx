import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { InheiraMark, AncrMark } from '@/components/BrandLogos';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Lock, ShieldCheck } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function PublicReport() {
    const { token } = useParams();
    const [params] = useSearchParams();
    const [report, setReport] = useState(null);
    const [needsPassword, setNeedsPassword] = useState(false);
    const [password, setPassword] = useState(params.get('p') || '');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const fetch = async (pw) => {
        setLoading(true);
        setError('');
        try {
            const url = `${BACKEND_URL}/api/report/${token}${pw ? `?password=${encodeURIComponent(pw)}` : ''}`;
            const { data } = await axios.get(url);
            setReport(data);
        } catch (e) {
            if (e?.response?.status === 401) {
                setNeedsPassword(true);
            } else if (e?.response?.status === 410) {
                setError('This link has expired.');
            } else {
                setError(e?.response?.data?.detail || 'Report not found.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetch(password);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500 font-mono-metadata text-xs uppercase tracking-[0.3em]">Loading Song Intelligence Report…</div>;

    if (error) return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
            <div className="text-center max-w-md">
                <InheiraMark className="h-16 w-auto mx-auto mb-8" />
                <div className="font-display font-bold text-2xl text-white mb-2">{error}</div>
                <div className="text-sm text-zinc-500">Contact the sender for a new link.</div>
            </div>
        </div>
    );

    if (needsPassword) return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
            <div className="max-w-sm w-full">
                <InheiraMark className="h-16 w-auto mx-auto mb-8" />
                <div className="p-6 border border-indigo-400/20 bg-indigo-400/5">
                    <Lock className="w-5 h-5 text-indigo-400 mb-3" strokeWidth={1.5} />
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-2">/ PASSWORD REQUIRED</div>
                    <div className="font-display font-bold text-white text-lg mb-4">This report is password protected.</div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') fetch(password); }}
                        placeholder="Enter password"
                        className="w-full h-10 bg-zinc-900 border border-zinc-800 px-3 text-white focus:border-indigo-400 outline-none font-mono-metadata text-sm mb-3"
                    />
                    <Button onClick={() => fetch(password)} className="w-full bg-indigo-400 hover:bg-indigo-500 text-zinc-950 font-bold">Unlock</Button>
                </div>
            </div>
        </div>
    );

    const { session, evidence, audience, lines_count, events } = report;
    const meta = session.song_meta || {};

    return (
        <div className="min-h-screen bg-zinc-950">
            <header className="border-b border-zinc-900 sticky top-0 z-40 bg-zinc-950/95 backdrop-blur">
                <div className="max-w-[1200px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
                    <InheiraMark className="h-10 w-auto" />
                    <div className="flex items-center gap-4 font-mono-metadata text-[10px] uppercase tracking-[0.3em]">
                        <span className="text-emerald-400 flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} /> VIEW-ONLY · SHARED WITH {audience.toUpperCase()}</span>
                    </div>
                </div>
            </header>
            <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-12">
                {/* Cover */}
                <div className="border border-indigo-400/30 bg-gradient-to-br from-indigo-400/[0.05] via-zinc-950 to-zinc-950 p-8 md:p-12 mb-10">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-4">/ SONG INTELLIGENCE REPORT™</div>
                    <h1 className="font-display font-black text-5xl md:text-7xl tracking-tighter text-white leading-[0.95]">{session.title}</h1>
                    <div className="mt-4 font-mono-metadata text-xs text-zinc-500">{session.working_title || session.project}</div>
                    <div className="mt-8 grid grid-cols-4 gap-4 font-mono-metadata text-xs">
                        <Meta label="Genre" value={meta.genre} />
                        <Meta label="Key" value={meta.key} />
                        <Meta label="Tempo" value={meta.tempo ? `${meta.tempo} BPM` : null} />
                        <Meta label="Writers" value={session.collaborators?.length} />
                    </div>
                </div>

                {/* Team */}
                <section className="mb-10">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-3">/ CREATIVE TEAM</div>
                    <h2 className="font-display font-bold text-3xl text-white tracking-tight mb-6">Verified contributors</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(session.collaborators || []).map((c) => {
                            const ev = evidence.find((e) => e.user_id === c.user_id) || {};
                            return (
                                <div key={c.user_id} className="p-6 border border-zinc-900 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 h-1 w-full" style={{ background: `linear-gradient(to right, ${c.color}, transparent)` }} />
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold" style={{ background: `${c.color}15`, borderColor: `${c.color}60`, color: c.color }}>
                                            {(c.name || '?').split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-white font-semibold">{c.name}</div>
                                            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-500">{c.role}</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 text-center pt-3 border-t border-zinc-900">
                                        <MetaMini label="Lines" value={ev.lyric_lines || 0} color={c.color} />
                                        <MetaMini label="Contribs" value={ev.contributions || 0} color={c.color} />
                                        <MetaMini label="Weight" value={ev.total_weight || 0} color={c.color} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Publishing overview */}
                <section className="mb-10">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-3">/ PUBLISHING</div>
                    <h2 className="font-display font-bold text-3xl text-white tracking-tight mb-6">Publishing package</h2>
                    <div className="grid md:grid-cols-3 gap-3 font-mono-metadata text-xs">
                        <Meta label="ISRC" value={session.rights?.identifiers?.isrc} />
                        <Meta label="ISWC" value={session.rights?.identifiers?.iswc} />
                        <Meta label="UPC" value={session.rights?.identifiers?.upc} />
                        <Meta label="Publisher" value={session.collaborators?.[0]?.publisher} />
                        <Meta label="PRO" value={session.collaborators?.[0]?.pro} />
                        <Meta label="IPI" value={session.collaborators?.[0]?.ipi_number} />
                    </div>
                </section>

                {/* Signals */}
                <section className="mb-10 grid md:grid-cols-3 gap-4">
                    <StatBig label="Verified events" value={events?.length || 0} />
                    <StatBig label="Lyric lines" value={lines_count} />
                    <StatBig label="Writers" value={session.collaborators?.length || 0} />
                </section>

                {/* Footer */}
                <div className="mt-12 p-8 border border-zinc-900 flex items-center justify-between">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                        INHEIRA™ · Verified creative history · View-only report
                    </div>
                    <AncrMark className="h-8 w-auto opacity-90" />
                </div>
            </div>
        </div>
    );
}

function Meta({ label, value }) {
    return (
        <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-1">{label}</div>
            <div className={`${value ? 'text-white' : 'text-zinc-600 italic'} font-medium`}>{value || '—'}</div>
        </div>
    );
}

function MetaMini({ label, value, color }) {
    return (
        <div>
            <div className="font-display font-bold text-lg" style={{ color }}>{value}</div>
            <div className="font-mono-metadata text-[9px] uppercase tracking-[0.2em] text-zinc-500">{label}</div>
        </div>
    );
}

function StatBig({ label, value }) {
    return (
        <div className="p-6 border border-zinc-900">
            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-2">{label}</div>
            <div className="font-display font-black text-4xl text-white">{value}</div>
        </div>
    );
}
