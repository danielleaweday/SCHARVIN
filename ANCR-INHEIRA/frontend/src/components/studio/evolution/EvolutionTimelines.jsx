import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { colorForAncrId } from '@/lib/collaboratorColors';
import { EVIDENCE_KIND_MAP, FAMILY_COLOR, completenessLabel } from './evidence';
import { GitCommit, FileText, ShieldCheck, Users, ArrowRight, Circle, Radio } from 'lucide-react';

/*
 * INHEIRA — Adaptive timeline visualisations.
 * Every mode below is a different lens onto THE SAME underlying Creative
 * Evidence™ event model. Which lens is chosen is a storytelling decision.
 *
 *   1. DocumentaryTimeline   – vertical narrative of the life of the song
 *   2. Filmstrip             – horizontal cinema-reel for rapid version scan
 *   3. EvidenceGraph         – nodes + relationships between contributors, versions, evidence
 *   4. SessionActivityTimeline – minute-by-minute recording/writing session events
 */

/* ============================================================
 *  1 · DOCUMENTARY  — vertical scroll, chapter-per-version
 * ============================================================ */
export function DocumentaryTimeline({ versions, onOpen }) {
    if (!versions.length) return null;
    return (
        <div className="relative">
            <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-zinc-800 to-transparent" />
            <ul className="space-y-4">
                {versions.map((v, i) => {
                    const col = v.submitter_color || colorForAncrId(v.submitter_id).hex;
                    const initials = (v.submitter_name || '?').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
                    const artifactCount = v.evidence_artifacts?.length || 0;
                    const ackCount = v.acknowledgements?.length || 0;
                    const parts = v.participants?.length || 0;
                    const completeness = v.completeness || { ratio: 0, filled: 0, total: 12 };
                    return (
                        <li key={v.version_id} data-testid={`evolution-version-${v.version_id}`}>
                            <button
                                onClick={() => onOpen?.(v)}
                                className="w-full text-left ml-12 border border-zinc-900 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-950/60 transition-all group relative block"
                            >
                                <span className="absolute -left-[calc(2rem+8px)] top-6 w-4 h-4 rounded-full border-2 border-black flex items-center justify-center" style={{ background: col, boxShadow: `0 0 14px ${col}88` }}>
                                    <GitCommit className="w-2.5 h-2.5 text-black" strokeWidth={2.5} />
                                </span>
                                <div className="p-5">
                                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-black font-display font-bold text-[10px]" style={{ background: col, boxShadow: `0 0 12px ${col}66` }}>{initials}</div>
                                            <div>
                                                <div className="font-display font-semibold" style={{ color: col }}>{v.submitter_name}</div>
                                                <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500">
                                                    v{i + 1} · {new Date(v.moment_at || v.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                                    {v.location ? ` · ${v.location}` : ''}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {i === 0 && (
                                                <span className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-200 border border-indigo-400/40 bg-indigo-400/10 px-2.5 py-1">
                                                    Baseline · 100% documented material
                                                </span>
                                            )}
                                            <span className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500 border border-zinc-900 px-2.5 py-1">
                                                {completenessLabel(completeness.ratio)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-xl text-white font-display font-bold tracking-tight mt-3 group-hover:text-indigo-100 transition-colors">{v.title || v.label}</div>
                                    {(v.purpose || v.notes) && <div className="mt-2 text-sm text-zinc-400 leading-relaxed">{v.purpose || v.notes}</div>}

                                    {/* Evidence chip strip */}
                                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                                        {Object.entries(v.artifact_counts || {}).map(([k, c]) => {
                                            const meta = EVIDENCE_KIND_MAP[k];
                                            const fc = meta ? FAMILY_COLOR[meta.family] : '#94a3b8';
                                            return (
                                                <span key={k} className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] border px-2 py-1" style={{ color: fc, borderColor: `${fc}66`, background: `${fc}0d` }}>
                                                    {meta?.label || k} × {c}
                                                </span>
                                            );
                                        })}
                                        {parts > 0 && (
                                            <span className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] border border-zinc-800 text-zinc-400 px-2 py-1 flex items-center gap-1.5">
                                                <Users className="w-3 h-3" /> {parts} participant{parts === 1 ? '' : 's'}
                                            </span>
                                        )}
                                        {ackCount > 0 && (
                                            <span className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] border border-emerald-400/30 text-emerald-200 bg-emerald-400/[0.06] px-2 py-1 flex items-center gap-1.5">
                                                <ShieldCheck className="w-3 h-3" /> {ackCount} acknowledgement{ackCount === 1 ? '' : 's'}
                                            </span>
                                        )}
                                        {artifactCount === 0 && ackCount === 0 && (
                                            <span className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] border border-dashed border-zinc-800 text-zinc-600 px-2 py-1">
                                                No evidence attached yet
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-600">
                                            {v.version_id}{v.parent_version_id ? ` ← ${v.parent_version_id}` : ''}
                                        </div>
                                        <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-1 group-hover:text-white transition-colors">
                                            Open the record <ArrowRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

/* ============================================================
 *  2 · FILMSTRIP  — horizontal reel, one frame per version
 * ============================================================ */
export function FilmstripTimeline({ versions, onOpen }) {
    if (!versions.length) return null;
    return (
        <div className="border border-zinc-900 bg-black" data-testid="filmstrip-timeline">
            <div className="border-b border-zinc-900 px-4 py-2 flex items-center gap-2">
                <Radio className="w-3 h-3 text-zinc-600" />
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">/ FILMSTRIP · SCRUB ALL VERSIONS</div>
                <div className="ml-auto font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-600">{versions.length} frames</div>
            </div>
            <div className="overflow-x-auto">
                <div className="flex gap-3 p-4" style={{ minWidth: 'min-content' }}>
                    {versions.map((v, i) => {
                        const col = v.submitter_color || colorForAncrId(v.submitter_id).hex;
                        const artifactCount = v.evidence_artifacts?.length || 0;
                        const ackCount = v.acknowledgements?.length || 0;
                        return (
                            <button
                                key={v.version_id}
                                onClick={() => onOpen?.(v)}
                                className="shrink-0 w-64 border border-zinc-900 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-950/70 transition-all text-left relative overflow-hidden"
                                data-testid={`filmstrip-frame-${v.version_id}`}
                            >
                                <div className="absolute top-0 left-0 right-0 h-1" style={{ background: col }} />
                                <div className="absolute top-0 bottom-0 left-0 w-1 border-l border-dashed border-zinc-800 -ml-2" />
                                {/* film perforations */}
                                <div className="absolute top-0 bottom-0 -left-3 w-3 flex flex-col justify-between py-2">
                                    {Array.from({ length: 6 }).map((_, k) => <div key={k} className="w-1.5 h-1.5 bg-zinc-800 rounded-sm mx-auto" />)}
                                </div>
                                <div className="p-4">
                                    <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-2">
                                        FRAME {String(i + 1).padStart(2, '0')} · {new Date(v.moment_at || v.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="font-display font-bold text-white text-sm leading-tight line-clamp-2 min-h-[36px]">{v.title || v.label}</div>
                                    <div className="mt-3 font-mono-metadata text-[9px] uppercase tracking-[0.3em]" style={{ color: col }}>{v.submitter_name}</div>
                                    <div className="mt-3 grid grid-cols-3 gap-1 text-center">
                                        <div className="border border-zinc-900 py-1">
                                            <div className="text-white font-display font-bold text-sm">{artifactCount}</div>
                                            <div className="font-mono-metadata text-[8px] uppercase tracking-[0.3em] text-zinc-500">evidence</div>
                                        </div>
                                        <div className="border border-zinc-900 py-1">
                                            <div className="text-white font-display font-bold text-sm">{ackCount}</div>
                                            <div className="font-mono-metadata text-[8px] uppercase tracking-[0.3em] text-zinc-500">acks</div>
                                        </div>
                                        <div className="border border-zinc-900 py-1">
                                            <div className="text-white font-display font-bold text-sm">{v.participants?.length || 0}</div>
                                            <div className="font-mono-metadata text-[8px] uppercase tracking-[0.3em] text-zinc-500">people</div>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

/* ============================================================
 *  3 · EVIDENCE GRAPH — nodes + edges (versions, people, artifacts)
 * ============================================================ */
export function EvidenceGraph({ versions, onOpen }) {
    // Simple, deterministic radial layout. Not a physics engine — we want
    // clarity, not simulation. Versions on inner ring, participants outer.
    const layout = useMemo(() => {
        const n = versions.length || 1;
        const cx = 400, cy = 260, r1 = 150, r2 = 240;
        const vs = versions.map((v, i) => {
            const a = (Math.PI * 2 * i) / n - Math.PI / 2;
            return { ...v, _x: cx + r1 * Math.cos(a), _y: cy + r1 * Math.sin(a) };
        });
        // Unique participants
        const people = {};
        versions.forEach((v) => (v.participants || []).forEach((p) => {
            const key = p.rightprint_id || p.name;
            if (!key) return;
            people[key] = people[key] || { key, name: p.name, role: p.role, rightprint_id: p.rightprint_id, versionIds: [] };
            people[key].versionIds.push(v.version_id);
        }));
        const ppl = Object.values(people);
        const pm = ppl.length || 1;
        const p2 = ppl.map((p, i) => {
            const a = (Math.PI * 2 * i) / pm - Math.PI / 2;
            return { ...p, _x: cx + r2 * Math.cos(a), _y: cy + r2 * Math.sin(a) };
        });
        return { vs, ppl: p2, cx, cy };
    }, [versions]);

    if (!versions.length) return null;

    const w = 800, h = 520;

    return (
        <div className="border border-zinc-900 bg-black" data-testid="evidence-graph">
            <div className="border-b border-zinc-900 px-4 py-2 flex items-center gap-2">
                <Circle className="w-3 h-3 text-zinc-600" />
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">/ EVIDENCE GRAPH · CONNECTIONS BETWEEN VERSIONS, PEOPLE, ARTIFACTS</div>
            </div>
            <div className="overflow-x-auto">
                <svg viewBox={`0 0 ${w} ${h}`} className="w-full min-w-[720px]">
                    {/* radial background */}
                    <defs>
                        <radialGradient id="egglow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#000" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                    <rect width={w} height={h} fill="url(#egglow)" />
                    {/* lineage edges */}
                    {layout.vs.map((v) => {
                        if (!v.parent_version_id) return null;
                        const p = layout.vs.find((x) => x.version_id === v.parent_version_id);
                        if (!p) return null;
                        return <line key={`e-${v.version_id}`} x1={p._x} y1={p._y} x2={v._x} y2={v._y} stroke="#818cf8" strokeOpacity="0.5" strokeDasharray="3 3" />;
                    })}
                    {/* participant-to-version edges */}
                    {layout.ppl.map((p) => (
                        p.versionIds.map((vid) => {
                            const v = layout.vs.find((x) => x.version_id === vid);
                            if (!v) return null;
                            return <line key={`p-${p.key}-${vid}`} x1={p._x} y1={p._y} x2={v._x} y2={v._y} stroke="#334155" strokeOpacity="0.6" />;
                        })
                    ))}
                    {/* version nodes */}
                    {layout.vs.map((v) => {
                        const col = v.submitter_color || colorForAncrId(v.submitter_id).hex;
                        return (
                            <g key={v.version_id} onClick={() => onOpen?.(v)} className="cursor-pointer" data-testid={`graph-node-${v.version_id}`}>
                                <circle cx={v._x} cy={v._y} r="18" fill={col} opacity="0.15" />
                                <circle cx={v._x} cy={v._y} r="10" fill={col} stroke="#000" strokeWidth="2" />
                                <text x={v._x} y={v._y + 34} textAnchor="middle" fill="#e5e7eb" fontSize="10" fontFamily="ui-monospace, monospace" style={{ textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                                    {(v.title || v.label || '').slice(0, 18)}
                                </text>
                            </g>
                        );
                    })}
                    {/* people nodes */}
                    {layout.ppl.map((p) => (
                        <g key={p.key}>
                            <circle cx={p._x} cy={p._y} r="6" fill="#0ea5e9" stroke="#000" strokeWidth="2" opacity="0.9" />
                            <text x={p._x} y={p._y + 20} textAnchor="middle" fill="#93c5fd" fontSize="9" fontFamily="ui-monospace, monospace" style={{ letterSpacing: '0.1em' }}>
                                {p.name?.slice(0, 20)}
                            </text>
                        </g>
                    ))}
                    {/* legend */}
                    <g transform={`translate(20, ${h - 40})`}>
                        <circle cx="6" cy="6" r="6" fill="#818cf8" />
                        <text x="20" y="10" fill="#a5b4fc" fontSize="10" fontFamily="ui-monospace, monospace">version</text>
                        <circle cx="90" cy="6" r="4" fill="#0ea5e9" />
                        <text x="102" y="10" fill="#7dd3fc" fontSize="10" fontFamily="ui-monospace, monospace">participant</text>
                        <line x1="180" y1="6" x2="210" y2="6" stroke="#818cf8" strokeDasharray="3 3" />
                        <text x="216" y="10" fill="#a5b4fc" fontSize="10" fontFamily="ui-monospace, monospace">lineage</text>
                    </g>
                </svg>
            </div>
        </div>
    );
}

/* ============================================================
 *  4 · SESSION ACTIVITY TIMELINE
 * ============================================================ */
export function SessionActivityTimeline({ sessionId, versions, onOpen }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const { data } = await api.get(`/sessions/${sessionId}/events`);
                if (alive) setEvents(data || []);
            } catch { /* silent */ }
            finally { if (alive) setLoading(false); }
        })();
        return () => { alive = false; };
    }, [sessionId]);

    // Merge session events + version submissions into a single time-ordered stream.
    const stream = useMemo(() => {
        const s = [
            ...events.map((e) => ({ ...e, _kind: 'event', _ts: e.created_at })),
            ...versions.map((v) => ({ ...v, _kind: 'version', _ts: v.moment_at || v.created_at })),
        ];
        return s.sort((a, b) => new Date(a._ts) - new Date(b._ts));
    }, [events, versions]);

    if (loading) return <div className="p-8 font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-600">Loading session activity…</div>;
    if (!stream.length) return <div className="p-8 font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-600">No session activity yet.</div>;

    return (
        <div className="border border-zinc-900 bg-black" data-testid="session-activity-timeline">
            <div className="border-b border-zinc-900 px-4 py-2 flex items-center gap-2">
                <Radio className="w-3 h-3 text-zinc-600" />
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">/ SESSION ACTIVITY · MINUTE-BY-MINUTE</div>
            </div>
            <ul className="divide-y divide-zinc-900">
                {stream.map((item, i) => {
                    const col = item.color || item.submitter_color || colorForAncrId(item.user_id || item.submitter_id || String(i)).hex;
                    const ts = new Date(item._ts).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
                    const isVersion = item._kind === 'version';
                    return (
                        <li
                            key={item.event_id || item.version_id}
                            className={`px-4 py-3 flex items-center gap-4 ${isVersion ? 'cursor-pointer hover:bg-zinc-950/40' : ''}`}
                            onClick={isVersion ? () => onOpen?.(item) : undefined}
                        >
                            <div className="w-1 h-8" style={{ background: col }} />
                            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-600 w-40 shrink-0">{ts}</div>
                            <div className="flex-1 flex items-center gap-2 min-w-0">
                                {isVersion
                                    ? <FileText className="w-3.5 h-3.5 shrink-0" style={{ color: col }} />
                                    : <Circle className="w-2.5 h-2.5 shrink-0" style={{ color: col }} />
                                }
                                <span className="text-white text-sm truncate">{isVersion ? `Version submitted · ${item.title || item.label}` : item.label}</span>
                            </div>
                            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 truncate">
                                {isVersion ? item.submitter_name : item.user_name}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
