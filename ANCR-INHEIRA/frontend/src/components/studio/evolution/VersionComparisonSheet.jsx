import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Loader2, GitCompareArrows, Plus, Minus, Equal, ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react';

/*
 * INHEIRA — Version Comparison Sheet
 *
 * Side-by-side documentary of two versions. Every statement is traceable
 * back to real evidence: artifact_id, ack_id, or event_id. The engine
 * NEVER infers change from silence — if there's no evidence, we show
 * "no documented change".
 */

function Head({ label, tone = 'zinc' }) {
    const tones = { zinc: 'text-zinc-400', added: 'text-emerald-200', removed: 'text-rose-200', equal: 'text-indigo-200' };
    return <div className={`font-mono-metadata text-[9px] uppercase tracking-[0.3em] mb-1 ${tones[tone] || 'text-zinc-400'}`}>{label}</div>;
}

function Scalar({ label, diff }) {
    return (
        <div className="grid grid-cols-2 gap-3 py-2">
            <div><Head label={label} tone={diff.equal ? 'equal' : 'zinc'} /><div className="text-sm text-zinc-200 whitespace-pre-wrap">{diff.a || <em className="text-zinc-600">Not documented</em>}</div></div>
            <div><Head label={diff.equal ? 'unchanged' : 'changed'} tone={diff.equal ? 'equal' : 'added'} /><div className="text-sm text-zinc-200 whitespace-pre-wrap">{diff.b || <em className="text-zinc-600">Not documented</em>}</div></div>
        </div>
    );
}

function ListDiff({ label, diff }) {
    const rows = [
        ...(diff.removed || []).map((s) => ({ kind: 'removed', text: s })),
        ...(diff.unchanged || []).map((s) => ({ kind: 'unchanged', text: s })),
        ...(diff.added || []).map((s) => ({ kind: 'added', text: s })),
    ];
    if (!rows.length) return null;
    return (
        <div className="py-2">
            <Head label={label} />
            <ul className="space-y-1">
                {rows.map((r, i) => {
                    const Icon = r.kind === 'added' ? Plus : r.kind === 'removed' ? Minus : Equal;
                    const cls = r.kind === 'added' ? 'text-emerald-300' : r.kind === 'removed' ? 'text-rose-300' : 'text-zinc-500';
                    return (
                        <li key={i} className={`text-sm flex items-start gap-2 ${cls}`}>
                            <Icon className="w-3 h-3 mt-1 shrink-0" />
                            <span className={r.kind === 'removed' ? 'line-through' : ''}>{r.text}</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <section className="border-t border-zinc-900 pt-6 mt-6">
            <div className="font-mono-metadata text-[9px] uppercase tracking-[0.4em] text-zinc-500 mb-2">/ {title}</div>
            {children}
        </section>
    );
}

export default function VersionComparisonSheet({ sessionId, versionAId, versionBId, onClose }) {
    const open = !!(sessionId && versionAId && versionBId);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!open) return;
        setLoading(true); setData(null); setError(null);
        (async () => {
            try {
                const { data } = await api.get(`/sessions/${sessionId}/comparison`, { params: { a: versionAId, b: versionBId } });
                setData(data);
            } catch (e) {
                const status = e?.response?.status;
                const detail = e?.response?.data?.detail;
                let title = 'Comparison unavailable';
                let description;
                if (status === 404) {
                    title = 'Version not found';
                    description = typeof detail === 'string' ? detail : 'One of the selected versions could not be located in this session.';
                } else if (status === 422) {
                    title = 'Invalid comparison request';
                    description = 'The selected versions could not be compared. Please pick two different documented versions.';
                } else if (status === 403) {
                    title = 'Not authorised';
                    description = 'You do not have access to this session.';
                } else {
                    description = typeof detail === 'string' ? detail : 'Something went wrong while reading the evidence. Please try again.';
                }
                setError({ status, title, description });
                toast.error(title, { description, duration: 6000 });
            }
            finally { setLoading(false); }
        })();
    }, [open, sessionId, versionAId, versionBId]);

    return (
        <Sheet open={open} onOpenChange={(v) => !v && onClose?.()}>
            <SheetContent side="right" className="bg-black border-l border-zinc-900 text-white w-full sm:max-w-4xl p-0 overflow-y-auto" data-testid="version-comparison-sheet">
                <VisuallyHidden.Root>
                    <SheetTitle>
                        {data ? `Comparing ${data.a?.title || data.a?.version_id} with ${data.b?.title || data.b?.version_id}` : 'Version comparison'}
                    </SheetTitle>
                    <SheetDescription>
                        Evidence-based side-by-side comparison of two documented versions. Every statement is traceable back to Creative Evidence™ records. This is a documentation and analysis tool — it does not determine legal ownership and does not assign publishing splits.
                    </SheetDescription>
                </VisuallyHidden.Root>
                <div className="border-b border-zinc-900 px-8 py-6 bg-gradient-to-br from-indigo-500/10 via-black to-black">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-indigo-200 flex items-center gap-2 mb-3">
                        <GitCompareArrows className="w-3 h-3" strokeWidth={1.5} /> VERSION COMPARISON · EVIDENCE-BASED
                    </div>
                    {data && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-white font-display font-bold text-lg tracking-tight">{data.a.title}</div>
                                <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500">{data.a.version_id} · {new Date(data.a.created_at).toLocaleString()}</div>
                            </div>
                            <div>
                                <div className="text-white font-display font-bold text-lg tracking-tight">{data.b.title}</div>
                                <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500">{data.b.version_id} · {new Date(data.b.created_at).toLocaleString()}</div>
                            </div>
                        </div>
                    )}
                    {data && (
                        <div className="mt-4 flex items-center gap-2 flex-wrap">
                            <span className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500 border border-zinc-800 px-2 py-1">
                                lineage · {data.lineage.relationship.replace(/_/g, ' ')}
                            </span>
                            <span className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500 border border-zinc-800 px-2 py-1">
                                {data.between_event_count} documented events between
                            </span>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="p-12 text-center font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-600"><Loader2 className="w-3 h-3 inline mr-2 animate-spin" /> Reading evidence…</div>
                ) : error ? (
                    <div className="p-12" data-testid="comparison-error">
                        <div className="border border-rose-400/25 bg-rose-400/[0.05] p-6 flex items-start gap-3 max-w-xl mx-auto">
                            <AlertTriangle className="w-5 h-5 text-rose-300 mt-0.5 shrink-0" />
                            <div>
                                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-rose-200 mb-2">
                                    {error.status ? `ERROR · ${error.status}` : 'ERROR'}
                                </div>
                                <div className="text-white font-display font-bold text-lg tracking-tight mb-2" data-testid="comparison-error-title">{error.title}</div>
                                <div className="text-sm text-zinc-300 leading-relaxed" data-testid="comparison-error-description">{error.description}</div>
                            </div>
                        </div>
                    </div>
                ) : !data ? (
                    <div className="p-12 text-center text-zinc-400">Comparison unavailable.</div>
                ) : (
                    <div className="px-8 pb-12">
                        <Section title="METADATA">
                            {Object.entries(data.metadata).map(([k, v]) => <Scalar key={k} label={k.replace(/_/g, ' ')} diff={v} />)}
                        </Section>

                        <Section title="WHAT & WHY">
                            {Object.entries(data.prose).map(([k, v]) => <Scalar key={k} label={k.replace(/_/g, ' ')} diff={v} />)}
                        </Section>

                        <Section title="DECISIONS · QUESTIONS · DISAGREEMENTS · RIGHTS">
                            {Object.entries(data.decisions).map(([k, v]) => <ListDiff key={k} label={k.replace(/_/g, ' ')} diff={v} />)}
                            {Object.values(data.decisions).every((v) => !(v.added?.length || v.removed?.length || v.unchanged?.length)) && (
                                <div className="text-sm text-zinc-600 italic">No decision-layer changes documented between these versions.</div>
                            )}
                        </Section>

                        <Section title="PARTICIPANTS · RIGHTPRINT™ IDENTITIES">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Head label="Removed / only in A" tone="removed" />
                                    {(data.participants.removed || []).map((p, i) => <div key={i} className="text-sm text-rose-200">{p.name}{p.rightprint_id ? ` · RP ${p.rightprint_id}` : ''}</div>)}
                                    {(data.participants.removed || []).length === 0 && <div className="text-xs text-zinc-600 italic">None</div>}
                                </div>
                                <div>
                                    <Head label="Added / only in B" tone="added" />
                                    {(data.participants.added || []).map((p, i) => <div key={i} className="text-sm text-emerald-200">{p.name}{p.rightprint_id ? ` · RP ${p.rightprint_id}` : ''}</div>)}
                                    {(data.participants.added || []).length === 0 && <div className="text-xs text-zinc-600 italic">None</div>}
                                </div>
                            </div>
                            {(data.participants.in_both || []).length > 0 && (
                                <div className="mt-3"><Head label="In both" tone="equal" />
                                    <div className="flex flex-wrap gap-1.5">
                                        {data.participants.in_both.map((p, i) => <span key={i} className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-400 border border-zinc-800 px-2 py-0.5">{p.name}</span>)}
                                    </div>
                                </div>
                            )}
                        </Section>

                        <Section title={`EVIDENCE ARTIFACTS · +${data.evidence_artifacts.added.length} / -${data.evidence_artifacts.removed.length} / ${data.evidence_artifacts.in_both.length} shared`}>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Head label={`Removed / only in A · ${data.evidence_artifacts.removed.length}`} tone="removed" />
                                    {data.evidence_artifacts.removed.map((a) => <div key={a.artifact_id} className="text-sm text-rose-200">{a.title}<span className="text-zinc-600"> · {a.kind}</span></div>)}
                                </div>
                                <div>
                                    <Head label={`Added / only in B · ${data.evidence_artifacts.added.length}`} tone="added" />
                                    {data.evidence_artifacts.added.map((a) => <div key={a.artifact_id} className="text-sm text-emerald-200">{a.title}<span className="text-zinc-600"> · {a.kind}</span></div>)}
                                </div>
                            </div>
                        </Section>

                        <Section title={`ACKNOWLEDGEMENTS · +${data.acknowledgements.added.length} / -${data.acknowledgements.removed.length}`}>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Head label="Removed / only in A" tone="removed" />
                                    {data.acknowledgements.removed.map((a) => <div key={a.ack_id} className="text-sm text-rose-200">{a.collaborator_name}<span className="text-zinc-600"> · {a.kind}</span></div>)}
                                </div>
                                <div>
                                    <Head label="Added / only in B" tone="added" />
                                    {data.acknowledgements.added.map((a) => <div key={a.ack_id} className="text-sm text-emerald-200">{a.collaborator_name}<span className="text-zinc-600"> · {a.kind}</span></div>)}
                                </div>
                            </div>
                        </Section>

                        <Section title={`BETWEEN-WINDOW · ${data.between_event_count} DOCUMENTED EVENTS`}>
                            {data.between_events.length === 0 ? (
                                <div className="text-sm text-zinc-600 italic">No documented Creative Evidence™ events between these versions.</div>
                            ) : (
                                <ul className="space-y-1 max-h-72 overflow-y-auto pr-2">
                                    {data.between_events.slice(0, 200).map((e) => (
                                        <li key={e.event_id} className="text-xs text-zinc-400 flex items-center gap-2">
                                            <span className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-600 w-24 shrink-0">{new Date(e.created_at).toLocaleTimeString()}</span>
                                            <span className={`font-mono-metadata text-[9px] uppercase tracking-[0.3em] px-1.5 py-0.5 border ${e.sensitivity === 'sensitive' ? 'border-amber-400/30 bg-amber-400/[0.06] text-amber-200' : 'border-zinc-800 text-zinc-400'}`}>{e.kind}</span>
                                            <span className="text-zinc-300 truncate">{e.label}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Section>

                        <Section title="VOICE EVIDENCE (LINKED TO EACH VERSION)">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <Head label={`A · ${data.voice_evidence.a?.length || 0} recording(s)`} />
                                    {(data.voice_evidence.a || []).map((r) => <div key={r.recording_id} className="text-zinc-300">{new Date(r.created_at).toLocaleDateString()} · {r.transcription_status}</div>)}
                                </div>
                                <div>
                                    <Head label={`B · ${data.voice_evidence.b?.length || 0} recording(s)`} />
                                    {(data.voice_evidence.b || []).map((r) => <div key={r.recording_id} className="text-zinc-300">{new Date(r.created_at).toLocaleDateString()} · {r.transcription_status}</div>)}
                                </div>
                            </div>
                        </Section>

                        <Section title="MCI · SESSION-LEVEL ANALYSIS">
                            <div className="text-sm text-zinc-400 leading-relaxed">MCI reads session-wide evidence and is not per-version. See it in either version's detail sheet. <span className="text-zinc-600">({data.mci.read_via})</span></div>
                        </Section>

                        <Section title="INTEGRITY">
                            <div className="grid grid-cols-2 gap-3 text-[11px] font-mono text-zinc-500">
                                <div className="break-all"><ShieldCheck className="w-3 h-3 inline mr-1 text-emerald-300" /> {data.a.integrity_hash || 'legacy · not sealed'}</div>
                                <div className="break-all"><ShieldCheck className="w-3 h-3 inline mr-1 text-emerald-300" /> {data.b.integrity_hash || 'legacy · not sealed'}</div>
                            </div>
                        </Section>

                        <div className="mt-8 border border-amber-400/25 bg-amber-400/[0.03] p-4 flex items-start gap-3" data-testid="comparison-disclaimer">
                            <AlertTriangle className="w-4 h-4 text-amber-300 mt-0.5 shrink-0" />
                            <p className="text-[11px] text-zinc-300 leading-relaxed">{data.disclaimer}</p>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
