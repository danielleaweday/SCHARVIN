import { useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Plus, Hash, GitBranch, Users, Layers, Music, Copy, MessageSquareQuote } from 'lucide-react';
import { toast } from 'sonner';
import { colorForAncrId } from '@/lib/collaboratorColors';
import { EVIDENCE_KIND_MAP, FAMILY_COLOR, completenessLabel } from './evidence';
import AcknowledgeSheet from './AcknowledgeSheet';
import AddEvidenceSheet from './AddEvidenceSheet';
import MciAnalysisPanel from './MciAnalysisPanel';

/*
 * INHEIRA — Version Detail
 * The full historical record of a single version, rendered as a cinematic
 * dossier — not a data table. Every section is a chapter of that moment.
 */

function Chip({ children, tone = 'zinc' }) {
    const tones = {
        zinc: 'border-zinc-800 text-zinc-400',
        indigo: 'border-indigo-400/40 bg-indigo-400/10 text-indigo-200',
        emerald: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200',
        amber: 'border-amber-400/40 bg-amber-400/10 text-amber-200',
        rose: 'border-rose-400/40 bg-rose-400/10 text-rose-200',
    };
    return <span className={`font-mono-metadata text-[10px] uppercase tracking-[0.3em] px-2.5 py-1 border ${tones[tone]}`}>{children}</span>;
}

function Section({ eyebrow, title, children }) {
    return (
        <section className="pt-8 mt-8 border-t border-zinc-900">
            <div className="font-mono-metadata text-[9px] uppercase tracking-[0.4em] text-zinc-500 mb-2">/ {eyebrow}</div>
            <h3 className="font-display font-bold text-xl tracking-tight text-white mb-4">{title}</h3>
            {children}
        </section>
    );
}

function ListBlock({ items, empty = 'None recorded.', tone = 'zinc' }) {
    if (!items || !items.length) return <div className="text-sm text-zinc-600 italic">{empty}</div>;
    const dot = { zinc: 'bg-zinc-600', indigo: 'bg-indigo-300', emerald: 'bg-emerald-300', rose: 'bg-rose-300', amber: 'bg-amber-300' }[tone];
    return (
        <ul className="space-y-2">
            {items.map((it, i) => (
                <li key={i} className="flex gap-3 items-start text-sm text-zinc-300 leading-relaxed">
                    <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${dot}`} />
                    <span>{it}</span>
                </li>
            ))}
        </ul>
    );
}

function Prose({ text, muted }) {
    if (!text) return <div className="text-sm text-zinc-600 italic">{muted || 'Not documented.'}</div>;
    return <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{text}</p>;
}

function EvidenceCard({ a }) {
    const meta = EVIDENCE_KIND_MAP[a.kind] || { label: a.kind, family: 'writing' };
    const col = FAMILY_COLOR[meta.family] || '#a78bfa';
    return (
        <div className="border border-zinc-900 hover:border-zinc-700 transition-colors bg-black/60 p-4" data-testid={`evidence-card-${a.artifact_id}`}>
            <div className="flex items-center justify-between mb-2">
                <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em]" style={{ color: col }}>{meta.label}</div>
                <div className="font-mono-metadata text-[8px] uppercase tracking-[0.3em] text-zinc-600">{new Date(a.created_at).toLocaleDateString()}</div>
            </div>
            <div className="font-display font-semibold text-white text-sm">{a.title}</div>
            {a.description && <div className="mt-1 text-xs text-zinc-500 leading-relaxed">{a.description}</div>}
            {a.content && <pre className="mt-3 text-xs text-zinc-300 font-mono whitespace-pre-wrap bg-zinc-950/60 border border-zinc-900 p-3 max-h-32 overflow-y-auto">{a.content}</pre>}
            {a.cloud_link_url && <a href={a.cloud_link_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs text-sky-300 hover:text-sky-200 underline underline-offset-2">Open cloud link ↗</a>}
            {a.file_url && <a href={a.file_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs text-sky-300 hover:text-sky-200 underline underline-offset-2">Open file ↗</a>}
            <div className="mt-3 font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-600">Added by {a.added_by_name}</div>
        </div>
    );
}

function AckCard({ ack }) {
    const col = ack.collaborator_color || colorForAncrId(ack.collaborator_id).hex;
    const initials = (ack.collaborator_name || '?').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
    return (
        <div className="border border-zinc-900 bg-zinc-950/40 p-5" data-testid={`ack-card-${ack.ack_id}`}>
            <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-black font-display font-bold text-[10px]" style={{ background: col, boxShadow: `0 0 12px ${col}66` }}>{initials}</div>
                <div>
                    <div className="text-white font-display font-semibold">{ack.collaborator_name}{ack.on_behalf_of_name ? ` (logged by ${ack.collaborator_name})` : ''}</div>
                    <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500">
                        {ack.role || 'contributor'} · {ack.kind.replace('_', ' ')} · {new Date(ack.created_at).toLocaleString()}
                    </div>
                </div>
                <div className="ml-auto">
                    {ack.agrees_with_version === true && <Chip tone="emerald">Agrees</Chip>}
                    {ack.agrees_with_version === false && <Chip tone="rose">Does not agree</Chip>}
                </div>
            </div>
            {ack.contribution_statement && (
                <div className="mt-3">
                    <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-1">Contributed</div>
                    <p className="text-sm text-zinc-300 leading-relaxed">{ack.contribution_statement}</p>
                </div>
            )}
            {ack.observations && (
                <div className="mt-3">
                    <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-1">Observed of others</div>
                    <p className="text-sm text-zinc-300 leading-relaxed">{ack.observations}</p>
                </div>
            )}
            {ack.disputes && (
                <div className="mt-3 border border-rose-400/30 bg-rose-400/[0.05] p-3">
                    <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-rose-200 mb-1">Disputes / concerns</div>
                    <p className="text-sm text-zinc-300 leading-relaxed">{ack.disputes}</p>
                </div>
            )}
            {ack.media_url && (
                <a href={ack.media_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs text-sky-300 hover:text-sky-200 underline underline-offset-2">Open acknowledgement media ↗</a>
            )}
        </div>
    );
}

export default function VersionDetailSheet({ version, onClose, onRefresh }) {
    const [ackOpen, setAckOpen] = useState(false);
    const [evOpen, setEvOpen] = useState(false);

    if (!version) return null;
    const col = version.submitter_color || colorForAncrId(version.submitter_id).hex;
    const completeness = version.completeness || { filled: 0, total: 12, ratio: 0 };

    const copyHash = async () => {
        if (!version.integrity_hash) return;
        try {
            await navigator.clipboard?.writeText(version.integrity_hash);
            toast.success('Integrity hash copied');
        } catch (e) {
            // Clipboard permission may be blocked (headless / preview environments)
            toast.error('Clipboard blocked — hash shown above for manual copy');
        }
    };

    return (
        <Sheet open={!!version} onOpenChange={(v) => !v && onClose?.()}>
            <SheetContent side="right" className="bg-black border-l border-zinc-900 text-white w-full sm:max-w-2xl p-0 overflow-y-auto" data-testid="version-detail-sheet">
                {/* Cinematic head */}
                <div className="relative border-b border-zinc-900 overflow-hidden">
                    <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: `radial-gradient(circle at 20% 0%, ${col}22, transparent 60%)` }} />
                    <div className="relative px-8 py-8">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-2 mb-3">
                            <Hash className="w-3 h-3" strokeWidth={1.5} /> {version.version_id}
                        </div>
                        <h2 className="font-display font-black text-3xl md:text-4xl tracking-tighter leading-[0.95]">
                            <span className="bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent">{version.title || version.label}</span>
                        </h2>
                        {version.purpose && <p className="mt-3 text-sm text-zinc-400 leading-relaxed max-w-xl">{version.purpose}</p>}
                        <div className="mt-4 flex items-center gap-2 flex-wrap">
                            <Chip tone="indigo">Confidence · Awaiting Evidence Analysis</Chip>
                            <Chip tone="amber">MCI · Awaiting Musical Contribution Analysis</Chip>
                            <Chip>{completenessLabel(completeness.ratio)} · {completeness.filled}/{completeness.total} sections</Chip>
                        </div>
                        {/* Completeness ring bar */}
                        <div className="mt-5">
                            <div className="h-[3px] w-full bg-zinc-900 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-300 transition-all" style={{ width: `${completeness.ratio * 100}%` }} />
                            </div>
                            <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-600 mt-2">
                                / Documentation completeness — NOT a contribution score
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="px-8 pb-12">
                    <Section eyebrow="THE MOMENT" title="When and where">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="border border-zinc-900 p-3">
                                <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500">Date & time</div>
                                <div className="text-zinc-200 mt-1">{new Date(version.moment_at || version.created_at).toLocaleString()}</div>
                            </div>
                            <div className="border border-zinc-900 p-3">
                                <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500">Location</div>
                                <div className="text-zinc-200 mt-1">{version.location || <span className="text-zinc-600 italic">Not recorded</span>}</div>
                            </div>
                            <div className="border border-zinc-900 p-3">
                                <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500">Writing room</div>
                                <div className="text-zinc-200 mt-1">{version.writing_room || <span className="text-zinc-600 italic">Not recorded</span>}</div>
                            </div>
                            <div className="border border-zinc-900 p-3">
                                <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500">Submitted by</div>
                                <div className="text-zinc-200 mt-1" style={{ color: col }}>{version.submitter_name}</div>
                            </div>
                        </div>
                    </Section>

                    <Section eyebrow="WHO WAS IN THE ROOM" title="Participants">
                        {(!version.participants || !version.participants.length) ? (
                            <div className="text-sm text-zinc-600 italic">No participants recorded on this version yet.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {version.participants.map((p, i) => {
                                    const pc = p.color || colorForAncrId(p.rightprint_id || p.name || String(i)).hex;
                                    const pi = (p.name || '?').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
                                    return (
                                        <div key={i} className="flex items-center gap-3 border border-zinc-900 bg-zinc-950/40 p-3">
                                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-black font-display font-bold text-[10px]" style={{ background: pc, boxShadow: `0 0 10px ${pc}66` }}>{pi}</div>
                                            <div>
                                                <div className="text-white font-display font-semibold text-sm">{p.name}</div>
                                                <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500">
                                                    {p.role || 'contributor'}{p.rightprint_id ? ` · RP ${p.rightprint_id}` : ''}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Section>

                    <Section eyebrow="WHAT & WHY" title="Objectives and changes">
                        <div className="space-y-4">
                            <div>
                                <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-1">Objectives</div>
                                <Prose text={version.objectives} />
                            </div>
                            <div>
                                <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-1">What changed</div>
                                <Prose text={version.what_changed} />
                            </div>
                            <div>
                                <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-1">Why it changed</div>
                                <Prose text={version.why_changed} />
                            </div>
                        </div>
                    </Section>

                    <Section eyebrow="DECISIONS & QUESTIONS" title="What was decided, deferred, disputed">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-emerald-200 mb-2">Decisions reached</div>
                                <ListBlock items={version.decisions_reached} tone="emerald" />
                            </div>
                            <div>
                                <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-amber-200 mb-2">Decisions deferred</div>
                                <ListBlock items={version.decisions_deferred} tone="amber" />
                            </div>
                            <div>
                                <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-indigo-200 mb-2">Open questions</div>
                                <ListBlock items={version.open_questions} tone="indigo" />
                            </div>
                            <div>
                                <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-rose-200 mb-2">Creative disagreements</div>
                                <ListBlock items={version.disagreements} tone="rose" />
                            </div>
                        </div>
                        {version.rights_discussions && version.rights_discussions.length > 0 && (
                            <div className="mt-5">
                                <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-400 mb-2">Rights / ownership discussions</div>
                                <ListBlock items={version.rights_discussions} tone="indigo" />
                            </div>
                        )}
                    </Section>

                    <Section eyebrow="EVIDENCE ARTIFACTS" title={<span className="flex items-center gap-3">Attached evidence <span className="text-zinc-500 text-sm font-mono">{version.evidence_artifacts?.length || 0}</span></span>}>
                        <Button size="sm" variant="outline" onClick={() => setEvOpen(true)} className="border-sky-400/40 text-sky-100 hover:bg-sky-400/10 mb-4" data-testid="add-evidence-btn">
                            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add evidence
                        </Button>
                        {(!version.evidence_artifacts || !version.evidence_artifacts.length) ? (
                            <div className="text-sm text-zinc-600 italic">No evidence attached yet. Every artifact you add here becomes part of this version forever.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {version.evidence_artifacts.map((a) => <EvidenceCard key={a.artifact_id} a={a} />)}
                            </div>
                        )}
                    </Section>

                    <Section eyebrow="ACKNOWLEDGEMENTS" title={<span className="flex items-center gap-3">Human testimony <span className="text-zinc-500 text-sm font-mono">{version.acknowledgements?.length || 0}</span></span>}>
                        <Button size="sm" variant="outline" onClick={() => setAckOpen(true)} className="border-emerald-400/40 text-emerald-100 hover:bg-emerald-400/10 mb-4" data-testid="add-ack-btn">
                            <MessageSquareQuote className="w-3.5 h-3.5 mr-1.5" /> Add acknowledgement
                        </Button>
                        {(!version.acknowledgements || !version.acknowledgements.length) ? (
                            <div className="text-sm text-zinc-600 italic">No acknowledgements yet. Every collaborator's testimony belongs to this record.</div>
                        ) : (
                            <div className="space-y-3">
                                {version.acknowledgements.map((k) => <AckCard key={k.ack_id} ack={k} />)}
                            </div>
                        )}
                    </Section>

                    {version.ai_session_summary && (
                        <Section eyebrow="AI SESSION SUMMARY" title="Prose narrative attached to this version">
                            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{version.ai_session_summary}</p>
                        </Section>
                    )}

                    {version.environment && Object.values(version.environment).some((v) => (Array.isArray(v) ? v.length : v)) && (
                        <Section eyebrow="ENVIRONMENT" title="The physical fingerprint">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                {version.environment.daw && (
                                    <div className="border border-zinc-900 p-3">
                                        <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-1 flex items-center gap-1.5"><Layers className="w-3 h-3" /> DAW</div>
                                        <div className="text-zinc-200">{version.environment.daw}</div>
                                    </div>
                                )}
                                {version.environment.software_versions?.length > 0 && (
                                    <div className="border border-zinc-900 p-3">
                                        <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-1">Software</div>
                                        <div className="text-zinc-200">{version.environment.software_versions.join(' · ')}</div>
                                    </div>
                                )}
                                {version.environment.hardware?.length > 0 && (
                                    <div className="border border-zinc-900 p-3">
                                        <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-1">Hardware</div>
                                        <div className="text-zinc-200">{version.environment.hardware.join(' · ')}</div>
                                    </div>
                                )}
                                {version.environment.instruments?.length > 0 && (
                                    <div className="border border-zinc-900 p-3">
                                        <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-1 flex items-center gap-1.5"><Music className="w-3 h-3" /> Instruments</div>
                                        <div className="text-zinc-200">{version.environment.instruments.join(' · ')}</div>
                                    </div>
                                )}
                            </div>
                        </Section>
                    )}

                    <Section eyebrow="CONTINUITY" title="Lineage & links">
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2">
                                <GitBranch className="w-3.5 h-3.5 text-zinc-500" />
                                <span className="text-zinc-400">Parent version:</span>
                                <span className="text-zinc-200 font-mono text-xs">{version.parent_version_id || 'None (root version)'}</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <Users className="w-3.5 h-3.5 text-zinc-500 mt-1" />
                                <span className="text-zinc-400">Child versions:</span>
                                <span className="text-zinc-200 font-mono text-xs">{version.child_version_ids?.length ? version.child_version_ids.join(' · ') : 'None yet'}</span>
                            </div>
                            {version.links && (['sessions', 'writing_rooms', 'projects']).map((k) => (
                                version.links[k]?.length > 0 && (
                                    <div key={k} className="text-zinc-400">
                                        Linked {k.replace('_', ' ')}: <span className="text-zinc-200">{version.links[k].join(', ')}</span>
                                    </div>
                                )
                            ))}
                        </div>
                    </Section>

                    <Section eyebrow="MUSICAL CONTRIBUTION INTELLIGENCE™" title="Analytical picture of documented musical contributions">
                        <MciAnalysisPanel sessionId={version.session_id} />
                    </Section>

                    <Section eyebrow="INTEGRITY" title="Sealed for the future">
                        <div className="border border-indigo-400/30 bg-indigo-400/[0.04] p-4 flex items-start gap-3">
                            <ShieldCheck className="w-4 h-4 text-indigo-200 mt-0.5 shrink-0" strokeWidth={1.5} />
                            <div className="text-[11px] text-zinc-300 leading-relaxed">
                                <div className="mb-1">This record was sealed with a SHA-256 integrity hash at the moment of creation. If any byte
                                of the canonical record were altered, this hash would no longer match.</div>
                                <div className="mt-3 font-mono text-[10px] break-all text-zinc-400 select-all">
                                    {version.integrity_hash || 'legacy · not sealed'}
                                </div>
                                {version.integrity_hash && (
                                    <Button size="sm" variant="ghost" onClick={copyHash} className="mt-2 h-7 text-indigo-200 hover:text-white hover:bg-indigo-400/10" data-testid="copy-hash-btn">
                                        <Copy className="w-3 h-3 mr-1.5" /> Copy hash
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Section>
                </div>

                <AcknowledgeSheet
                    open={ackOpen} onOpenChange={setAckOpen}
                    sessionId={version.session_id} versionId={version.version_id}
                    versionTitle={version.title || version.label}
                    onCreated={() => onRefresh?.()}
                />
                <AddEvidenceSheet
                    open={evOpen} onOpenChange={setEvOpen}
                    sessionId={version.session_id} versionId={version.version_id}
                    onCreated={() => onRefresh?.()}
                />
            </SheetContent>
        </Sheet>
    );
}
