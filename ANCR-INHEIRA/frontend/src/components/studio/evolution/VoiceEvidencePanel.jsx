import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { colorForAncrId } from '@/lib/collaboratorColors';
import { Mic, ShieldCheck, Loader2, Play, Pause, Check, X, MessageSquareQuote, Sparkles, Lock, RotateCw } from 'lucide-react';
import { toast } from 'sonner';

/*
 * INHEIRA — Voice Evidence Panel
 *
 * First-class Creative Evidence™ objects. Each voice record is a permanent
 * audit-grade artefact carrying: audio, transcript, timestamped segments,
 * cryptographic hash, linked contributors, RightPrint™ identities, and a
 * list of system-detected creative moments awaiting human review.
 *
 * Guardrail (from the spec): every detected moment is a SYSTEM OBSERVATION.
 * It has confidence, rationale, and a review lifecycle (confirm / correct /
 * dispute / annotate). Only human-actioned moments propagate downstream.
 */

const MOMENT_LABELS = {
    lyric_idea: 'Lyric idea',
    melody_idea: 'Melody idea',
    harmony_idea: 'Harmony idea',
    arrangement_discussion: 'Arrangement discussion',
    split_conversation: 'Split conversation',
    production_decision: 'Production decision',
    rights_discussion: 'Rights discussion',
    creative_disagreement: 'Creative disagreement',
    final_approval: 'Final approval',
};

const MOMENT_TONE = {
    lyric_idea: 'indigo', melody_idea: 'sky', harmony_idea: 'pink',
    arrangement_discussion: 'amber', production_decision: 'emerald',
    final_approval: 'emerald', split_conversation: 'rose',
    rights_discussion: 'rose', creative_disagreement: 'rose',
};

const TONES = {
    indigo: 'border-indigo-400/40 bg-indigo-400/[0.06] text-indigo-200',
    sky: 'border-sky-400/40 bg-sky-400/[0.06] text-sky-200',
    pink: 'border-pink-400/40 bg-pink-400/[0.06] text-pink-200',
    amber: 'border-amber-400/40 bg-amber-400/[0.06] text-amber-200',
    emerald: 'border-emerald-400/40 bg-emerald-400/[0.06] text-emerald-200',
    rose: 'border-rose-400/40 bg-rose-400/[0.06] text-rose-200',
    zinc: 'border-zinc-800 bg-zinc-950/40 text-zinc-400',
};

const HUMAN_STATUS_LABEL = {
    unconfirmed: 'Awaiting human review',
    confirmed: 'Confirmed by human',
    corrected: 'Corrected by human',
    disputed: 'Disputed',
    annotated: 'Annotated',
};

const HUMAN_STATUS_TONE = {
    unconfirmed: 'zinc', confirmed: 'emerald', corrected: 'amber',
    disputed: 'rose', annotated: 'sky',
};

function StatusChip({ tone = 'zinc', children }) {
    return <span className={`font-mono-metadata text-[9px] uppercase tracking-[0.3em] border px-2 py-0.5 ${TONES[tone]}`}>{children}</span>;
}

/* -------------------- Authed audio player -------------------- */
function VoicePlayer({ recordingId }) {
    const [src, setSrc] = useState(null);
    const [playing, setPlaying] = useState(false);
    const [loading, setLoading] = useState(false);
    const [audio, setAudio] = useState(null);

    const load = async () => {
        setLoading(true);
        try {
            // Ask the authed endpoint for the raw bytes, wrap in a blob URL so <audio> plays it.
            const resp = await api.get(`/voice/${recordingId}/audio`, { responseType: 'blob' });
            const url = URL.createObjectURL(resp.data);
            const el = new Audio(url);
            el.onended = () => setPlaying(false);
            setAudio(el);
            setSrc(url);
            el.play();
            setPlaying(true);
        } catch (e) {
            toast.error('Playback failed');
        } finally { setLoading(false); }
    };

    const toggle = async () => {
        if (!audio) return load();
        if (playing) { audio.pause(); setPlaying(false); } else { audio.play(); setPlaying(true); }
    };

    useEffect(() => () => { if (src) URL.revokeObjectURL(src); audio?.pause?.(); }, [src, audio]);

    return (
        <Button
            onClick={toggle}
            variant="outline"
            size="sm"
            className="border-rose-400/40 text-rose-100 hover:bg-rose-400/10"
            data-testid={`voice-play-${recordingId}`}
        >
            {loading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : playing ? <Pause className="w-3.5 h-3.5 mr-1.5" /> : <Play className="w-3.5 h-3.5 mr-1.5" />}
            {playing ? 'Pause' : audio ? 'Resume' : 'Play'}
        </Button>
    );
}

/* -------------------- Moment review row -------------------- */
function MomentRow({ moment, recordingId, onReviewed }) {
    const [reviewing, setReviewing] = useState(false);
    const [showCorrect, setShowCorrect] = useState(false);
    const [correctKind, setCorrectKind] = useState(moment.kind);
    const [correctExcerpt, setCorrectExcerpt] = useState(moment.excerpt || '');
    const [note, setNote] = useState('');

    const submit = async (action, correction = null) => {
        setReviewing(true);
        try {
            const { data } = await api.post(`/voice/${recordingId}/moments/${moment.moment_id}/review`, {
                action, correction, note: note.trim() || null,
            });
            const kindLabel = MOMENT_LABELS[data.kind] || data.kind;
            toast.success(`${kindLabel} — ${action}${data.propagated_event_kind ? ` · promoted to platform evidence` : ''}`);
            onReviewed?.(data);
            setShowCorrect(false); setNote('');
        } catch (e) {
            toast.error(e?.response?.data?.detail || 'Review failed');
        } finally { setReviewing(false); }
    };

    const tone = MOMENT_TONE[moment.kind] || 'zinc';
    const statusTone = HUMAN_STATUS_TONE[moment.human_status] || 'zinc';
    const isDone = moment.human_status !== 'unconfirmed';

    return (
        <div className="border border-zinc-900 bg-black/50 p-4" data-testid={`moment-${moment.moment_id}`}>
            <div className="flex items-center gap-2 flex-wrap mb-2">
                <StatusChip tone={tone}>{MOMENT_LABELS[moment.kind] || moment.kind}</StatusChip>
                <StatusChip tone={statusTone}>{HUMAN_STATUS_LABEL[moment.human_status]}</StatusChip>
                <span className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500">
                    confidence {(moment.confidence * 100).toFixed(0)}%
                </span>
                {moment.start_sec != null && (
                    <span className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500">
                        @ {Math.floor(moment.start_sec / 60)}:{String(Math.floor(moment.start_sec % 60)).padStart(2, '0')}
                    </span>
                )}
                {moment.propagated_event_kind && (
                    <StatusChip tone="emerald">Promoted · {moment.propagated_event_kind.replace(/_/g, ' ')}</StatusChip>
                )}
            </div>
            {moment.excerpt && <div className="text-sm text-zinc-200 leading-relaxed italic">"{moment.excerpt}"</div>}
            {moment.rationale && <div className="mt-2 text-[11px] text-zinc-500 leading-relaxed">{moment.rationale}</div>}
            {moment.human_note && (
                <div className="mt-3 border-l-2 border-zinc-700 pl-3 text-xs text-zinc-400 italic">"{moment.human_note}"</div>
            )}

            {!isDone && !showCorrect && (
                <div className="mt-3 flex items-center gap-2 flex-wrap" data-testid={`moment-actions-${moment.moment_id}`}>
                    <Button disabled={reviewing} onClick={() => submit('confirmed')} size="sm" variant="outline" className="border-emerald-400/40 text-emerald-100 hover:bg-emerald-400/10" data-testid={`moment-confirm-${moment.moment_id}`}>
                        <Check className="w-3 h-3 mr-1" /> Confirm
                    </Button>
                    <Button disabled={reviewing} onClick={() => setShowCorrect(true)} size="sm" variant="outline" className="border-amber-400/40 text-amber-100 hover:bg-amber-400/10" data-testid={`moment-correct-${moment.moment_id}`}>
                        <RotateCw className="w-3 h-3 mr-1" /> Correct
                    </Button>
                    <Button disabled={reviewing} onClick={() => submit('disputed')} size="sm" variant="outline" className="border-rose-400/40 text-rose-100 hover:bg-rose-400/10" data-testid={`moment-dispute-${moment.moment_id}`}>
                        <X className="w-3 h-3 mr-1" /> Dispute
                    </Button>
                    <Button disabled={reviewing} onClick={() => submit('annotated')} size="sm" variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-900" data-testid={`moment-annotate-${moment.moment_id}`}>
                        <MessageSquareQuote className="w-3 h-3 mr-1" /> Annotate only
                    </Button>
                    <Textarea rows={1} placeholder="Optional note…" value={note} onChange={(e) => setNote(e.target.value)} className="bg-black border-zinc-800 text-white text-xs flex-1 min-w-[180px]" data-testid={`moment-note-${moment.moment_id}`} />
                </div>
            )}

            {showCorrect && (
                <div className="mt-4 space-y-3 border border-amber-400/30 bg-amber-400/[0.04] p-3">
                    <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-amber-200">/ CORRECTION</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <Select value={correctKind} onValueChange={setCorrectKind}>
                            <SelectTrigger className="bg-black border-zinc-800 text-white"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                                {Object.entries(MOMENT_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Textarea rows={1} value={correctExcerpt} onChange={(e) => setCorrectExcerpt(e.target.value)} className="md:col-span-2 bg-black border-zinc-800 text-white text-xs" data-testid={`moment-correct-excerpt-${moment.moment_id}`} />
                    </div>
                    <Textarea rows={1} placeholder="Optional context…" value={note} onChange={(e) => setNote(e.target.value)} className="bg-black border-zinc-800 text-white text-xs" />
                    <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setShowCorrect(false)} className="text-zinc-400 hover:text-white hover:bg-zinc-900">Cancel</Button>
                        <Button disabled={reviewing} size="sm" className="bg-white hover:bg-zinc-200 text-black font-bold" onClick={() => submit('corrected', { kind: correctKind, excerpt: correctExcerpt })} data-testid={`moment-correct-submit-${moment.moment_id}`}>
                            Save correction &amp; promote
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

/* -------------------- One voice record card -------------------- */
function VoiceRecordCard({ record, onReviewed, onReclassify }) {
    const [expanded, setExpanded] = useState(false);
    const [reclassifying, setReclassifying] = useState(false);
    const col = record.recorded_by_color || colorForAncrId(record.recorded_by_id).hex;
    const initials = (record.recorded_by_name || '?').split(' ').map((x) => x[0]).slice(0, 2).join('').toUpperCase();
    const pending = record.transcription_status === 'pending' || record.transcription_status === 'transcribing';
    const classifying = record.moments_status === 'classifying' || (record.transcription_status === 'done' && record.moments_status === 'pending');
    const failed = record.transcription_status === 'failed' || record.moments_status === 'failed';
    const moments = record.detected_moments || [];

    const doReclassify = async () => {
        setReclassifying(true);
        try { await onReclassify?.(record.recording_id); } finally { setReclassifying(false); }
    };

    return (
        <div className="border border-zinc-900 bg-zinc-950/40 hover:border-zinc-800 transition-colors" data-testid={`voice-record-${record.recording_id}`}>
            {/* Head */}
            <div className="p-5">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-black font-display font-bold text-[10px]" style={{ background: col, boxShadow: `0 0 12px ${col}66` }}>{initials}</div>
                    <div>
                        <div className="font-display font-semibold text-white text-sm">{record.recorded_by_name}</div>
                        <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500">
                            Voice memo · {new Date(record.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                            {record.duration_sec ? ` · ${Math.floor(record.duration_sec / 60)}:${String(Math.round(record.duration_sec % 60)).padStart(2, '0')}` : ''}
                            {record.location ? ` · ${record.location}` : ''}
                        </div>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5 flex-wrap">
                        {pending && <StatusChip tone="sky"><Loader2 className="w-2.5 h-2.5 inline mr-1 animate-spin" />Transcribing</StatusChip>}
                        {classifying && <StatusChip tone="indigo"><Sparkles className="w-2.5 h-2.5 inline mr-1" />Classifying</StatusChip>}
                        {!pending && !classifying && !failed && moments.length > 0 && <StatusChip tone="emerald">{moments.length} moment{moments.length === 1 ? '' : 's'} detected</StatusChip>}
                        {!pending && !classifying && !failed && moments.length === 0 && record.transcript && <StatusChip tone="zinc">No meaningful moments detected</StatusChip>}
                        {failed && <StatusChip tone="rose">Pipeline failed</StatusChip>}
                        <VoicePlayer recordingId={record.recording_id} />
                    </div>
                </div>

                {/* Transcript preview */}
                {record.transcript && (
                    <div className="mt-4 border-l-2 border-zinc-800 pl-4">
                        <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-1">Transcript{record.language ? ` · ${record.language.toUpperCase()}` : ''}</div>
                        <p className="text-sm text-zinc-300 leading-relaxed">
                            {expanded || record.transcript.length < 240 ? record.transcript : record.transcript.slice(0, 240) + '…'}
                        </p>
                        {record.transcript.length > 240 && (
                            <button onClick={() => setExpanded(!expanded)} className="mt-1 text-[11px] text-zinc-500 hover:text-white underline underline-offset-2">
                                {expanded ? 'Collapse' : 'Expand'}
                            </button>
                        )}
                    </div>
                )}

                {/* Integrity + linked context */}
                <div className="mt-4 flex items-center gap-2 flex-wrap text-[10px] font-mono-metadata text-zinc-600 uppercase tracking-[0.3em]">
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> sha256 · {record.content_hash?.slice(0, 12)}…</span>
                    {record.linked_version_id && <span>· linked to version {record.linked_version_id}</span>}
                    {record.linked_checkpoint_id && <span>· checkpoint {record.linked_checkpoint_id.slice(-6)}</span>}
                    {record.additional_speakers?.length > 0 && <span>· {record.additional_speakers.length} additional speaker{record.additional_speakers.length === 1 ? '' : 's'}</span>}
                </div>
            </div>

            {/* Moments */}
            {(moments.length > 0 || record.transcript) && (
                <div className="border-t border-zinc-900 px-5 py-4 bg-black/40">
                    <div className="flex items-center justify-between mb-3">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
                            <Lock className="w-3 h-3" /> System-detected observations · human review required
                        </div>
                        {record.transcript && (
                            <Button variant="ghost" size="sm" onClick={doReclassify} disabled={reclassifying} className="text-zinc-500 hover:text-white hover:bg-zinc-900 h-7" data-testid={`voice-reclassify-${record.recording_id}`}>
                                {reclassifying ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <RotateCw className="w-3 h-3 mr-1" />} Re-scan
                            </Button>
                        )}
                    </div>
                    {moments.length === 0 ? (
                        <div className="text-xs text-zinc-600 italic">No meaningful creative moments detected in this recording.</div>
                    ) : (
                        <div className="space-y-3">
                            {moments.map((m) => (
                                <MomentRow key={m.moment_id} moment={m} recordingId={record.recording_id} onReviewed={onReviewed} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/* -------------------- Panel -------------------- */
export default function VoiceEvidencePanel({ sessionId, onOpenBooth }) {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const load = async () => {
        try {
            const { data } = await api.get(`/sessions/${sessionId}/voice`);
            setRecords(data || []);
        } catch {}
        finally { setLoading(false); }
    };
    useEffect(() => { load(); /* eslint-disable-next-line */ }, [sessionId]);

    // Poll while any record is pending, transcribing, or classifying
    const anyPending = useMemo(() => records.some((r) =>
        ['pending', 'transcribing', 'classifying'].includes(r.transcription_status) ||
        (r.transcription_status === 'done' && r.moments_status !== 'done' && r.moments_status !== 'failed')
    ), [records]);
    useEffect(() => {
        if (!anyPending) return;
        const t = setInterval(load, 6000);
        return () => clearInterval(t);
        // eslint-disable-next-line
    }, [anyPending]);

    const onReviewed = (updated) => {
        setRecords((prev) => prev.map((r) => {
            if (!(r.detected_moments || []).some((m) => m.moment_id === updated.moment_id)) return r;
            return { ...r, detected_moments: r.detected_moments.map((m) => (m.moment_id === updated.moment_id ? updated : m)) };
        }));
    };
    const reclassify = async (rid) => {
        try {
            await api.post(`/voice/${rid}/reclassify`);
            toast.success('Re-scan complete');
            await load();
        } catch (e) { toast.error(e?.response?.data?.detail || 'Re-scan failed'); }
    };

    return (
        <div className="mt-6 border border-zinc-900 bg-black" data-testid="voice-evidence-panel">
            <div className="border-b border-zinc-900 px-5 py-4 flex items-center gap-3 flex-wrap">
                <Mic className="w-4 h-4 text-rose-300" strokeWidth={1.5} />
                <div>
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-rose-200">/ VOICE EVIDENCE LAYER</div>
                    <div className="font-display font-semibold text-white text-sm">Every voice in the room · first-class Creative Evidence™</div>
                </div>
                <Button onClick={onOpenBooth} className="ml-auto bg-rose-500 hover:bg-rose-400 text-black font-bold" data-testid="voice-booth-open">
                    <Mic className="w-4 h-4 mr-2" /> Record voice memo
                </Button>
            </div>
            {loading ? (
                <div className="p-10 text-center font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-600">Loading voice evidence…</div>
            ) : records.length === 0 ? (
                <div className="p-10 text-center">
                    <div className="font-display font-semibold text-lg text-zinc-300 mb-1">No voice evidence yet.</div>
                    <div className="text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
                        Hum a melody. Narrate a decision. Capture the disagreement in the room. INHEIRA will
                        transcribe it, identify meaningful creative moments, and hold them for your review.
                    </div>
                </div>
            ) : (
                <div className="p-5 space-y-4">
                    {records.map((r) => <VoiceRecordCard key={r.recording_id} record={r} onReviewed={onReviewed} onReclassify={reclassify} />)}
                </div>
            )}
        </div>
    );
}
