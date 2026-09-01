import { useEffect, useMemo, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { colorForAncrId } from '@/lib/collaboratorColors';
import { Radio, ShieldCheck, Lock, GitCommit, MessageSquare, Mic, FileText, Music, Layers, UserPlus, PenSquare, Award, Circle } from 'lucide-react';

/*
 * INHEIRA — Automatic Creative Documentation™ · Live Stream
 *
 * The passive evidence layer surfaced as a documentary. Every meaningful
 * creative act — lyric line written, chord change, chat message, approval,
 * file upload, identifier generated — flows into this view in real time.
 *
 * Two sensitivity classes are honored per the platform evidence standard:
 *   • CREATIVE events show their preview and full metadata.
 *   • SENSITIVE events (chat, ai, rights, approvals, acknowledgements) show
 *     only participants, timestamp, and a cryptographic hash. Content stays
 *     private in its native, permission-controlled collection — but the fact
 *     that it existed and its integrity are cryptographically provable here.
 */

const ICONS = {
    session_created: PenSquare,
    session_meta_updated: PenSquare,
    collaborator_joined: UserPlus,
    collaborator_left: UserPlus,
    lyric_line: FileText,
    lyric_line_edited: FileText,
    lyric_line_removed: FileText,
    lyric_section_completed: FileText,
    melody_recorded: Music,
    melody_changed: Music,
    chord_progression_changed: Music,
    arrangement_changed: Layers,
    voice_memo_recorded: Mic,
    file_uploaded: Layers,
    whiteboard_edited: Layers,
    contribution_logged: PenSquare,
    version_submitted: GitCommit,
    version_evidence_added: ShieldCheck,
    milestone_reached: Award,
    identifier_generated: ShieldCheck,
    rights_updated: ShieldCheck,
    rightprint_updated: ShieldCheck,
    publishing_registered: ShieldCheck,
    dsp_connected: Radio,
    released: Award,
    chat_message: MessageSquare,
    ai_interaction: MessageSquare,
    ai_generation_accepted: MessageSquare,
    rights_discussion: Lock,
    negotiation: Lock,
    approval_signed: Lock,
    acknowledgement_submitted: Lock,
    share_link_created: Lock,
};

function iconFor(kind) {
    return ICONS[kind] || Circle;
}

function formatKind(k) {
    return (k || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function LiveEvidenceStream({ sessionId, filter = 'all' }) {
    const [events, setEvents] = useState([]);
    const [openCheckpoint, setOpenCheckpoint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pulseKey, setPulseKey] = useState(0);
    const cursorRef = useRef(null);   // ISO of most recent event we've seen
    const timerRef = useRef(null);

    const load = async ({ initial = false } = {}) => {
        try {
            const q = cursorRef.current ? `?since=${encodeURIComponent(cursorRef.current)}` : '';
            const { data } = await api.get(`/sessions/${sessionId}/evidence${q}`);
            if (data && data.length) {
                cursorRef.current = data[data.length - 1].created_at;
                setEvents((prev) => (initial ? data : [...prev, ...data]));
                setPulseKey((k) => k + 1);
            }
            // Refresh checkpoint state
            const { data: cks } = await api.get(`/sessions/${sessionId}/evidence/checkpoints`);
            setOpenCheckpoint((cks || []).find((c) => c.status === 'open') || null);
        } catch { /* silent */ }
        finally { if (initial) setLoading(false); }
    };

    useEffect(() => {
        cursorRef.current = null;
        setEvents([]);
        load({ initial: true });
        timerRef.current = setInterval(() => load(), 8000);
        return () => clearInterval(timerRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId]);

    const filtered = useMemo(() => {
        if (filter === 'all') return events;
        if (filter === 'creative') return events.filter((e) => e.sensitivity === 'creative');
        if (filter === 'sensitive') return events.filter((e) => e.sensitivity === 'sensitive');
        return events;
    }, [events, filter]);

    // Newest at top
    const view = [...filtered].reverse();

    return (
        <div data-testid="live-evidence-stream" className="border border-zinc-900 bg-black">
            {/* Header ribbon */}
            <div className="border-b border-zinc-900 px-4 py-3 flex items-center gap-3 flex-wrap">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-400">
                    Documenting live · Automatic Creative Documentation™
                </div>
                <div className="ml-auto flex items-center gap-4">
                    {openCheckpoint && (
                        <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-indigo-200 border border-indigo-400/30 bg-indigo-400/[0.06] px-2 py-1">
                            Checkpoint · {openCheckpoint.event_count} event{openCheckpoint.event_count === 1 ? '' : 's'} in working memory
                        </div>
                    )}
                    <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-600">{events.length} events</div>
                </div>
            </div>

            {loading ? (
                <div className="p-10 text-center font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-600">Listening for creative activity…</div>
            ) : view.length === 0 ? (
                <div className="p-10 text-center">
                    <div className="font-display font-semibold text-lg text-zinc-300 mb-1">The room is silent.</div>
                    <div className="text-sm text-zinc-500">Every keystroke, chord change, upload, and approval will be documented here automatically.</div>
                </div>
            ) : (
                <ul className="divide-y divide-zinc-900">
                    {view.map((e, i) => {
                        const Icon = iconFor(e.kind);
                        const actor = e.actor || {};
                        const col = actor.color || (actor.id ? colorForAncrId(actor.id).hex : '#818cf8');
                        const isSensitive = e.sensitivity === 'sensitive';
                        const isNewest = i === 0;
                        return (
                            <li
                                key={e.event_id}
                                data-testid={`live-event-${e.event_id}`}
                                className={`px-4 py-3 flex items-start gap-3 transition-colors ${isNewest && pulseKey > 0 ? 'bg-indigo-400/[0.03]' : ''}`}
                            >
                                <div className="w-1 self-stretch rounded-full" style={{ background: col }} />
                                <div className="mt-0.5">
                                    <div className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center bg-zinc-950">
                                        <Icon className="w-3.5 h-3.5" style={{ color: col }} strokeWidth={1.8} />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-display font-semibold text-white text-sm">{actor.name || 'Someone'}</span>
                                        <span className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500">{formatKind(e.kind)}</span>
                                        {isSensitive && (
                                            <span className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-amber-200 border border-amber-400/30 bg-amber-400/[0.06] px-2 py-0.5 flex items-center gap-1">
                                                <Lock className="w-2.5 h-2.5" /> hash-only
                                            </span>
                                        )}
                                        {e.revision_count > 1 && (
                                            <span className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500 border border-zinc-800 px-2 py-0.5">
                                                rev ×{e.revision_count}
                                            </span>
                                        )}
                                        <span className="ml-auto font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-600 shrink-0">
                                            {new Date(e.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="mt-1 text-sm text-zinc-300 leading-relaxed">{e.label}</div>
                                    {!isSensitive && e.payload?.preview && (
                                        <div className="mt-1 text-xs text-zinc-500 italic truncate">"{e.payload.preview}"</div>
                                    )}
                                    {isSensitive && (
                                        <div className="mt-1 font-mono text-[10px] text-zinc-600 truncate select-all" title={e.content_hash}>
                                            sha256 · {e.content_hash?.slice(0, 24)}…
                                        </div>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
