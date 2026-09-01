import { useState } from 'react';
import { api } from '@/lib/api';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Sparkles, ShieldCheck, X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { ROLES } from './evidence';

/*
 * INHEIRA — Document Version
 * An 8-step cinematic capture flow. This is NOT a form. It's a guided
 * documentary interview that turns a creative moment into a permanent
 * Creative Evidence™ record.
 *
 * Steps:
 *   1. The Moment       – title, purpose, date/time, location, writing room
 *   2. Who Was In The Room – participants, roles, RightPrint™ IDs
 *   3. The Objective    – objectives, what changed, why
 *   4. Decisions & Questions – decisions reached / deferred, open questions, disagreements, rights
 *   5. Environment      – DAW, software, hardware, instruments
 *   6. Continuity       – parent version (from prior list) & links
 *   7. AI session summary – optional prose summary
 *   8. Immortalize      – integrity summary, then submit (immutable)
 */

const STEPS = [
    { key: 'moment',      title: 'The Moment',            hint: 'When and where did this creative moment happen?' },
    { key: 'people',      title: 'Who Was In The Room',   hint: 'Everyone present. Their role. Their RightPrint™ identity.' },
    { key: 'objective',   title: 'The Objective',         hint: 'What were you trying to achieve — and what actually changed?' },
    { key: 'decisions',   title: 'Decisions & Questions', hint: 'What was decided, deferred, disputed, or left unanswered.' },
    { key: 'environment', title: 'Environment',           hint: 'DAW, software, hardware, instruments. The physical fingerprint.' },
    { key: 'continuity',  title: 'Continuity',            hint: 'Which prior version this branched from, and where else it lives.' },
    { key: 'summary',     title: 'AI Session Summary',    hint: 'A prose summary of the session, attached to this version forever.' },
    { key: 'seal',        title: 'Immortalize',           hint: 'Once submitted, this record becomes permanent Creative Evidence™.' },
];

function ListEditor({ label, items, setItems, placeholder }) {
    const [draft, setDraft] = useState('');
    return (
        <div>
            <label className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">{label}</label>
            <div className="mt-2 flex gap-2">
                <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={placeholder}
                    onKeyDown={(e) => { if (e.key === 'Enter' && draft.trim()) { setItems([...items, draft.trim()]); setDraft(''); } }}
                    className="bg-black border-zinc-800 text-white focus:border-indigo-400 focus:ring-indigo-400"
                    data-testid={`docver-list-input-${label.replace(/\s+/g,'-').toLowerCase()}`}
                />
                <Button onClick={() => { if (draft.trim()) { setItems([...items, draft.trim()]); setDraft(''); } }} variant="outline" className="border-zinc-800 text-white hover:bg-zinc-900">
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
            {items.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                    {items.map((it, i) => (
                        <li key={i} className="flex items-center justify-between border border-zinc-900 bg-black/60 px-3 py-2 text-sm text-zinc-300">
                            <span>{it}</span>
                            <button onClick={() => setItems(items.filter((_, ix) => ix !== i))} className="text-zinc-600 hover:text-white" aria-label="Remove">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function ParticipantEditor({ participants, setParticipants }) {
    const [draft, setDraft] = useState({ name: '', role: '', rightprint_id: '' });
    const add = () => {
        if (!draft.name.trim()) return;
        setParticipants([...participants, { ...draft, name: draft.name.trim() }]);
        setDraft({ name: '', role: '', rightprint_id: '' });
    };
    return (
        <div>
            <label className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">Participants</label>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input placeholder="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="bg-black border-zinc-800 text-white" data-testid="docver-participant-name" />
                <Select value={draft.role} onValueChange={(v) => setDraft({ ...draft, role: v })}>
                    <SelectTrigger className="bg-black border-zinc-800 text-white" data-testid="docver-participant-role">
                        <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                        {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                </Select>
                <div className="flex gap-2">
                    <Input placeholder="RightPrint™ ID (optional)" value={draft.rightprint_id} onChange={(e) => setDraft({ ...draft, rightprint_id: e.target.value })} className="bg-black border-zinc-800 text-white" data-testid="docver-participant-rightprint" />
                    <Button onClick={add} variant="outline" className="border-zinc-800 text-white hover:bg-zinc-900" data-testid="docver-participant-add"><Plus className="w-4 h-4" /></Button>
                </div>
            </div>
            {participants.length > 0 && (
                <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {participants.map((p, i) => (
                        <li key={i} className="flex items-center justify-between border border-zinc-900 bg-black/60 px-3 py-2">
                            <div>
                                <div className="text-white text-sm font-display font-semibold">{p.name}</div>
                                <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500">
                                    {p.role || 'contributor'}{p.rightprint_id ? ` · RP ${p.rightprint_id}` : ''}
                                </div>
                            </div>
                            <button onClick={() => setParticipants(participants.filter((_, ix) => ix !== i))} className="text-zinc-600 hover:text-white" aria-label="Remove"><X className="w-3.5 h-3.5" /></button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function DocumentVersionModal({ open, onOpenChange, sessionId, priorVersions = [], onCreated }) {
    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const [populating, setPopulating] = useState(false);
    const [populatedFrom, setPopulatedFrom] = useState(null);   // {counts, source_event_ids, source_checkpoint_ids, total_events}
    const [f, setF] = useState({
        title: '',
        purpose: '',
        moment_at: new Date().toISOString().slice(0, 16),
        location: '',
        writing_room: '',
        participants: [],
        objectives: '',
        what_changed: '',
        why_changed: '',
        decisions_reached: [],
        decisions_deferred: [],
        open_questions: [],
        disagreements: [],
        rights_discussions: [],
        environment: { daw: '', software_versions: [], hardware: [], instruments: [] },
        parent_version_id: '',
        links: { sessions: [], writing_rooms: [], projects: [] },
        ai_session_summary: '',
    });

    const reset = () => {
        setStep(0);
        setPopulatedFrom(null);
        setF({
            title: '', purpose: '', moment_at: new Date().toISOString().slice(0, 16), location: '', writing_room: '',
            participants: [], objectives: '', what_changed: '', why_changed: '',
            decisions_reached: [], decisions_deferred: [], open_questions: [], disagreements: [], rights_discussions: [],
            environment: { daw: '', software_versions: [], hardware: [], instruments: [] },
            parent_version_id: '', links: { sessions: [], writing_rooms: [], projects: [] }, ai_session_summary: '',
        });
    };

    /**
     * Automatic Creative Documentation™ · "Populate from evidence"
     *
     * Ask the backend for every passive event captured since the parent
     * version (or the most recent version) and pre-fill this form. Nothing
     * is lost — the returned event/checkpoint IDs are linked to the version
     * we're about to create, preserving the complete chain.
     */
    const populateFromEvidence = async () => {
        setPopulating(true);
        try {
            const q = f.parent_version_id ? `?parent_version_id=${encodeURIComponent(f.parent_version_id)}` : '';
            const { data } = await api.get(`/sessions/${sessionId}/evidence/populate-since${q}`);
            setPopulatedFrom(data);
            setF((prev) => ({
                ...prev,
                // Merge participants (deduplicated by user_id / name)
                participants: (() => {
                    const seen = new Set(prev.participants.map((p) => p.user_id || p.name));
                    const merged = [...prev.participants];
                    (data.participants || []).forEach((p) => {
                        const key = p.user_id || p.name;
                        if (!seen.has(key)) { merged.push(p); seen.add(key); }
                    });
                    return merged;
                })(),
                what_changed: prev.what_changed
                    ? prev.what_changed + (data.what_changed?.length ? '\n\nAuto-documented since last version:\n· ' + data.what_changed.join('\n· ') : '')
                    : (data.what_changed?.length ? 'Auto-documented since last version:\n· ' + data.what_changed.join('\n· ') : ''),
                decisions_reached: [...prev.decisions_reached, ...(data.decisions_reached || [])],
                open_questions: [...prev.open_questions, ...(data.open_questions || [])],
            }));
            if (data.total_events === 0) {
                toast.info('No passive evidence has been captured yet since the last version.');
            } else {
                toast.success(`Populated from ${data.total_events} evidence event${data.total_events === 1 ? '' : 's'}`);
            }
        } catch (e) {
            toast.error(e?.response?.data?.detail || 'Failed to populate from evidence');
        } finally {
            setPopulating(false);
        }
    };

    const submit = async () => {
        if (!f.title.trim()) { toast.error('Version title is required'); setStep(0); return; }
        setSaving(true);
        try {
            const payload = {
                ...f,
                parent_version_id: f.parent_version_id || null,
                moment_at: f.moment_at ? new Date(f.moment_at).toISOString() : null,
                source_event_ids: populatedFrom?.source_event_ids || [],
                source_checkpoint_ids: populatedFrom?.source_checkpoint_ids || [],
            };
            const { data } = await api.post(`/sessions/${sessionId}/versions`, payload);
            toast.success('Version immortalized · permanent Creative Evidence™');
            onCreated?.(data);
            reset();
            onOpenChange(false);
        } catch (e) {
            toast.error(e?.response?.data?.detail || 'Failed to submit version');
        } finally {
            setSaving(false);
        }
    };

    const stepMeta = STEPS[step];

    return (
        <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
            <DialogContent className="bg-black border-zinc-900 text-white max-w-3xl p-0 overflow-hidden" data-testid="document-version-modal">
                <VisuallyHidden.Root>
                    <DialogTitle>Document a new version — {stepMeta.title}</DialogTitle>
                </VisuallyHidden.Root>
                {/* Cinematic header */}
                <div className="relative border-b border-zinc-900 bg-gradient-to-br from-indigo-500/10 via-black to-black px-8 py-7">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-indigo-200 flex items-center gap-2 mb-3">
                        <Sparkles className="w-3 h-3" strokeWidth={1.5} />
                        DOCUMENT VERSION · STEP {String(step + 1).padStart(2, '0')} / 08
                    </div>
                    <h3 className="font-display font-black text-3xl tracking-tighter text-white">{stepMeta.title}</h3>
                    <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{stepMeta.hint}</p>
                    {/* Progress ribbon */}
                    <div className="mt-6 grid grid-cols-8 gap-1">
                        {STEPS.map((s, i) => (
                            <div key={s.key} className={`h-[3px] transition-colors ${i <= step ? 'bg-indigo-300' : 'bg-zinc-800'}`} />
                        ))}
                    </div>
                </div>

                {/* Step body */}
                <div className="px-8 py-8 max-h-[60vh] overflow-y-auto">
                    {step === 0 && (
                        <div className="space-y-5">
                            {/* Automatic Creative Documentation™ — populate from evidence */}
                            <div className="border border-indigo-400/30 bg-gradient-to-br from-indigo-500/10 via-black to-black p-5">
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                    <div>
                                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-200 flex items-center gap-2 mb-1">
                                            <Sparkles className="w-3 h-3" strokeWidth={1.5} />
                                            AUTOMATIC CREATIVE DOCUMENTATION™
                                        </div>
                                        <div className="font-display font-semibold text-white text-lg">Populate from passive evidence</div>
                                        <p className="mt-1 text-xs text-zinc-400 leading-relaxed max-w-md">
                                            INHEIRA has been documenting every meaningful creative event automatically. Pull the record of what happened since the last version into this form — nothing is lost, everything is linked.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={populateFromEvidence}
                                        disabled={populating}
                                        variant="outline"
                                        className="border-indigo-400/40 text-indigo-100 hover:bg-indigo-400/10 shrink-0"
                                        data-testid="docver-populate-btn"
                                    >
                                        {populating ? 'Reading evidence…' : populatedFrom ? 'Refresh from evidence' : 'Populate from evidence'}
                                    </Button>
                                </div>
                                {populatedFrom && (
                                    <div className="mt-4 flex items-center gap-2 flex-wrap" data-testid="docver-populated-summary">
                                        <span className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-200 border border-indigo-400/40 bg-indigo-400/10 px-2.5 py-1">
                                            {populatedFrom.total_events} events linked
                                        </span>
                                        {populatedFrom.source_checkpoint_ids?.length > 0 && (
                                            <span className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-400 border border-zinc-800 px-2.5 py-1">
                                                {populatedFrom.source_checkpoint_ids.length} checkpoint{populatedFrom.source_checkpoint_ids.length === 1 ? '' : 's'}
                                            </span>
                                        )}
                                        {Object.entries(populatedFrom.counts || {}).slice(0, 6).map(([k, n]) => (
                                            <span key={k} className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500 border border-zinc-800 px-2 py-1">
                                                {k.replace(/_/g,' ')} × {n}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">Version title *</label>
                                <Input data-testid="docver-title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Bridge rewrite · take 3" className="mt-2 bg-black border-zinc-800 text-white focus:border-indigo-400 focus:ring-indigo-400" />
                            </div>
                            <div>
                                <label className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">Purpose</label>
                                <Textarea data-testid="docver-purpose" value={f.purpose} onChange={(e) => setF({ ...f, purpose: e.target.value })} rows={3} placeholder="Why was this version made?" className="mt-2 bg-black border-zinc-800 text-white focus:border-indigo-400 focus:ring-indigo-400" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">Date & time</label>
                                    <Input type="datetime-local" data-testid="docver-moment" value={f.moment_at} onChange={(e) => setF({ ...f, moment_at: e.target.value })} className="mt-2 bg-black border-zinc-800 text-white" />
                                </div>
                                <div>
                                    <label className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">Location</label>
                                    <Input data-testid="docver-location" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} placeholder="Studio, city" className="mt-2 bg-black border-zinc-800 text-white" />
                                </div>
                            </div>
                            <div>
                                <label className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">Writing room</label>
                                <Input data-testid="docver-writing-room" value={f.writing_room} onChange={(e) => setF({ ...f, writing_room: e.target.value })} placeholder="Which room / space?" className="mt-2 bg-black border-zinc-800 text-white" />
                            </div>
                        </div>
                    )}

                    {step === 1 && <ParticipantEditor participants={f.participants} setParticipants={(p) => setF({ ...f, participants: p })} />}

                    {step === 2 && (
                        <div className="space-y-5">
                            <div>
                                <label className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">Version objectives</label>
                                <Textarea data-testid="docver-objectives" rows={3} value={f.objectives} onChange={(e) => setF({ ...f, objectives: e.target.value })} placeholder="What were you attempting?" className="mt-2 bg-black border-zinc-800 text-white focus:border-indigo-400 focus:ring-indigo-400" />
                            </div>
                            <div>
                                <label className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">What changed from the prior version</label>
                                <Textarea data-testid="docver-what-changed" rows={3} value={f.what_changed} onChange={(e) => setF({ ...f, what_changed: e.target.value })} className="mt-2 bg-black border-zinc-800 text-white focus:border-indigo-400 focus:ring-indigo-400" />
                            </div>
                            <div>
                                <label className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">Why those changes were made</label>
                                <Textarea data-testid="docver-why-changed" rows={3} value={f.why_changed} onChange={(e) => setF({ ...f, why_changed: e.target.value })} className="mt-2 bg-black border-zinc-800 text-white focus:border-indigo-400 focus:ring-indigo-400" />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-5">
                            <ListEditor label="Decisions reached" items={f.decisions_reached} setItems={(v) => setF({ ...f, decisions_reached: v })} placeholder="Type and press Enter" />
                            <ListEditor label="Decisions deferred" items={f.decisions_deferred} setItems={(v) => setF({ ...f, decisions_deferred: v })} placeholder="Type and press Enter" />
                            <ListEditor label="Open questions" items={f.open_questions} setItems={(v) => setF({ ...f, open_questions: v })} placeholder="Type and press Enter" />
                            <ListEditor label="Creative disagreements" items={f.disagreements} setItems={(v) => setF({ ...f, disagreements: v })} placeholder="Type and press Enter" />
                            <ListEditor label="Rights / ownership discussions" items={f.rights_discussions} setItems={(v) => setF({ ...f, rights_discussions: v })} placeholder="Type and press Enter" />
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-5">
                            <div>
                                <label className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">DAW</label>
                                <Input data-testid="docver-daw" value={f.environment.daw} onChange={(e) => setF({ ...f, environment: { ...f.environment, daw: e.target.value } })} placeholder="Logic Pro, Pro Tools, Ableton..." className="mt-2 bg-black border-zinc-800 text-white" />
                            </div>
                            <ListEditor label="Software versions" items={f.environment.software_versions} setItems={(v) => setF({ ...f, environment: { ...f.environment, software_versions: v } })} placeholder="e.g. Logic 11.0.1" />
                            <ListEditor label="Hardware" items={f.environment.hardware} setItems={(v) => setF({ ...f, environment: { ...f.environment, hardware: v } })} placeholder="Mic, interface, monitors..." />
                            <ListEditor label="Instruments" items={f.environment.instruments} setItems={(v) => setF({ ...f, environment: { ...f.environment, instruments: v } })} placeholder="Rhodes, D-28, 808..." />
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-5">
                            <div>
                                <label className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">Parent version (this branched from)</label>
                                <Select value={f.parent_version_id || 'none'} onValueChange={(v) => setF({ ...f, parent_version_id: v === 'none' ? '' : v })}>
                                    <SelectTrigger className="mt-2 bg-black border-zinc-800 text-white" data-testid="docver-parent">
                                        <SelectValue placeholder="None — this is a fresh start" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                                        <SelectItem value="none">None — this is a fresh start</SelectItem>
                                        {priorVersions.map((v) => (
                                            <SelectItem key={v.version_id} value={v.version_id}>{v.title || v.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <ListEditor label="Linked sessions" items={f.links.sessions} setItems={(v) => setF({ ...f, links: { ...f.links, sessions: v } })} placeholder="Session ID or name" />
                            <ListEditor label="Linked writing rooms" items={f.links.writing_rooms} setItems={(v) => setF({ ...f, links: { ...f.links, writing_rooms: v } })} placeholder="Writing room name" />
                            <ListEditor label="Linked projects" items={f.links.projects} setItems={(v) => setF({ ...f, links: { ...f.links, projects: v } })} placeholder="Project name" />
                        </div>
                    )}

                    {step === 6 && (
                        <div>
                            <label className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">AI session summary</label>
                            <Textarea data-testid="docver-ai-summary" rows={10} value={f.ai_session_summary} onChange={(e) => setF({ ...f, ai_session_summary: e.target.value })} placeholder="Paste or write a prose summary of the session. This becomes permanent narrative evidence attached to this version." className="mt-2 bg-black border-zinc-800 text-white focus:border-indigo-400 focus:ring-indigo-400" />
                        </div>
                    )}

                    {step === 7 && (
                        <div className="space-y-6">
                            <div className="border border-indigo-400/30 bg-indigo-400/[0.04] p-5">
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="w-4 h-4 text-indigo-200 mt-0.5 shrink-0" strokeWidth={1.5} />
                                    <div>
                                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-200 mb-2">/ IMMUTABILITY NOTICE</div>
                                        <p className="text-sm text-zinc-300 leading-relaxed">
                                            Once submitted, this record becomes permanent Creative Evidence™ — sealed with a
                                            SHA-256 integrity hash. It cannot be edited or deleted. Only superseded by a newer
                                            version. Acknowledgements and additional evidence artifacts can still be appended
                                            afterwards; the historical record itself is frozen.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="border border-zinc-900 bg-zinc-950/40 p-4">
                                    <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500">Title</div>
                                    <div className="text-white font-display font-semibold mt-1">{f.title || <span className="text-red-400">Required</span>}</div>
                                </div>
                                <div className="border border-zinc-900 bg-zinc-950/40 p-4">
                                    <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500">Moment</div>
                                    <div className="text-white text-sm mt-1">{new Date(f.moment_at).toLocaleString()}</div>
                                </div>
                                <div className="border border-zinc-900 bg-zinc-950/40 p-4">
                                    <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500">Participants</div>
                                    <div className="text-white text-sm mt-1">{f.participants.length || 0}</div>
                                </div>
                                <div className="border border-zinc-900 bg-zinc-950/40 p-4">
                                    <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500">Parent version</div>
                                    <div className="text-white text-sm mt-1">{f.parent_version_id ? priorVersions.find(v => v.version_id === f.parent_version_id)?.title : 'None'}</div>
                                </div>
                            </div>
                            <div className="border border-zinc-900 bg-black/60 p-4">
                                <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-2">/ ANALYTICAL STATUS</div>
                                <div className="text-sm text-zinc-400 leading-relaxed">
                                    <span className="text-zinc-200">Creative Evidence™ Confidence:</span> <em className="text-indigo-200 not-italic">Awaiting Evidence Analysis</em><br/>
                                    <span className="text-zinc-200">MCI Status:</span> <em className="text-indigo-200 not-italic">Awaiting Musical Contribution Analysis</em>
                                </div>
                                <p className="mt-2 text-[11px] text-zinc-500 leading-relaxed">
                                    These are analytical conclusions of the Creative Evidence Intelligence™ and Musical
                                    Contribution Intelligence™ engines. They are never estimated from field completeness
                                    or entered manually.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <div className="border-t border-zinc-900 bg-zinc-950/60 px-8 py-4 flex items-center justify-between">
                    <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)} className="text-zinc-400 hover:text-white hover:bg-zinc-900" data-testid="docver-prev">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                    {step < STEPS.length - 1 ? (
                        <Button onClick={() => setStep(step + 1)} className="bg-white text-black hover:bg-zinc-200 font-bold" data-testid="docver-next">
                            Continue <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    ) : (
                        <Button onClick={submit} disabled={saving || !f.title.trim()} className="bg-white text-black hover:bg-zinc-200 font-bold" data-testid="docver-submit">
                            {saving ? 'Sealing…' : 'Immortalize this version'}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
