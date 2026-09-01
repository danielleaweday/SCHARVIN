import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import Nav from '@/components/Nav';
import { Download, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function SplitSheet() {
    const { id } = useParams();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get(`/sessions/${id}`);
                setSession(data);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const print = () => window.print();

    if (loading || !session) return <div className="min-h-screen bg-zinc-950"><Nav /></div>;
    const total = (session.splits || []).reduce((a, b) => a + b.percentage, 0);

    return (
        <div className="min-h-screen bg-zinc-950">
            <Nav />
            <div className="max-w-4xl mx-auto px-6 md:px-10 py-12">
                <div className="flex items-center justify-between mb-8 print:hidden">
                    <Link to={`/sessions/${id}`}>
                        <Button variant="ghost" className="text-zinc-400 hover:text-white">
                            <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={1.5} /> Back to session
                        </Button>
                    </Link>
                    <Button onClick={print} className="bg-white text-zinc-950 hover:bg-zinc-200 font-semibold">
                        <Download className="w-4 h-4 mr-2" strokeWidth={2} /> Print / Save PDF
                    </Button>
                </div>

                <div className="p-12 border border-zinc-900 bg-zinc-950 print:bg-white print:text-black print:border-black">
                    <div className="flex items-start justify-between mb-12 pb-8 border-b border-zinc-800 print:border-black">
                        <div>
                            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-3 print:text-black">/ SPLIT SHEET · INHEIRA™</div>
                            <h1 className="font-display font-black text-4xl md:text-5xl tracking-tighter text-white print:text-black">{session.title}</h1>
                            <div className="mt-3 font-mono-metadata text-xs text-zinc-500 print:text-black">
                                {session.working_title || session.project || 'Untitled project'} · {new Date(session.date).toLocaleDateString()}
                            </div>
                        </div>
                        <div className="text-right font-mono-metadata text-xs text-zinc-500 print:text-black">
                            <div className="uppercase tracking-[0.3em] mb-1">Session ID</div>
                            <div>{session.session_id}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-12 font-mono-metadata text-sm text-zinc-400 print:text-black">
                        <MetaRow label="Location" value={session.location || '—'} />
                        <MetaRow label="Context" value={session.context} />
                        <MetaRow label="Session type" value={session.session_type} />
                        <MetaRow label="Status" value={session.splits_status} />
                    </div>

                    <div className="mb-12">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-4 print:text-black">/ SPLITS</div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-800 print:border-black font-mono-metadata text-[10px] uppercase tracking-[0.2em] text-zinc-500 print:text-black">
                                    <th className="text-left py-3 font-normal">Writer</th>
                                    <th className="text-left py-3 font-normal">Role</th>
                                    <th className="text-left py-3 font-normal">Publisher</th>
                                    <th className="text-left py-3 font-normal">PRO / IPI</th>
                                    <th className="text-right py-3 font-normal">Split %</th>
                                </tr>
                            </thead>
                            <tbody className="text-white print:text-black">
                                {(session.splits || []).map((s, i) => (
                                    <tr key={i} className="border-b border-zinc-900 print:border-black">
                                        <td className="py-4">{s.name}</td>
                                        <td className="py-4 text-zinc-400 print:text-black">{s.role || 'Contributor'}</td>
                                        <td className="py-4 text-zinc-400 print:text-black font-mono-metadata">{s.publisher || '—'}</td>
                                        <td className="py-4 text-zinc-400 print:text-black font-mono-metadata">{s.pro || '—'} / {s.ipi || '—'}</td>
                                        <td className="py-4 text-right font-mono-metadata font-bold text-indigo-400 print:text-black">{s.percentage.toFixed(2)}%</td>
                                    </tr>
                                ))}
                                <tr className="font-mono-metadata font-bold">
                                    <td colSpan={4} className="py-4 text-right uppercase tracking-[0.2em] text-[10px] text-zinc-500 print:text-black">Total</td>
                                    <td className="py-4 text-right text-white print:text-black">{total.toFixed(2)}%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div>
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-4 print:text-black">/ SIGNATURES</div>
                        <div className="grid md:grid-cols-2 gap-6">
                            {(session.collaborators || []).map((c) => {
                                const sig = session.signatures?.[c.user_id];
                                return (
                                    <div key={c.user_id} className="border border-zinc-800 print:border-black p-6">
                                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 print:text-black mb-3">{c.role || 'Contributor'}</div>
                                        <div className="font-display font-semibold text-lg text-white print:text-black mb-2">{c.name}</div>
                                        {sig?.approved ? (
                                            <div className="flex items-center gap-2 text-indigo-400 print:text-black">
                                                <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
                                                <span className="font-mono-metadata text-xs">Signed · {new Date(sig.signed_at).toLocaleString()}</span>
                                            </div>
                                        ) : (
                                            <div className="text-xs text-zinc-500 print:text-black">Pending signature</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-zinc-800 print:border-black font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-600 print:text-black">
                        Generated by INHEIRA™ · From Creation to Legacy. · {new Date().toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetaRow({ label, value }) {
    return (
        <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 print:text-black mb-1">{label}</div>
            <div>{value}</div>
        </div>
    );
}
