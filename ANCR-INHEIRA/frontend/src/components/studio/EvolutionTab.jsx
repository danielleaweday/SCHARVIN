import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles, ShieldCheck, Info, Film, LayoutList, Network, Radio, Zap, Mic } from 'lucide-react';
import DocumentVersionModal from './evolution/DocumentVersionModal';
import VersionDetailSheet from './evolution/VersionDetailSheet';
import LiveEvidenceStream from './evolution/LiveEvidenceStream';
import VoiceBooth from './evolution/VoiceBooth';
import VoiceEvidencePanel from './evolution/VoiceEvidencePanel';
import VersionComparisonSheet from './evolution/VersionComparisonSheet';
import { DocumentaryTimeline, FilmstripTimeline, EvidenceGraph, SessionActivityTimeline } from './evolution/EvolutionTimelines';

/*
 * INHEIRA — Creative Evidence Intelligence™ · Evolution surface
 *
 * The Evolution tab is not a version list. It is a documentary of the song's life.
 * Every version is a complete Creative Evidence™ package: what changed, why,
 * who was in the room, what they contributed, what was decided, and the
 * artifacts that survived the moment.
 *
 * The interface adapts its visualisation to the question being asked:
 *   · Documentary — the narrative (default)
 *   · Filmstrip   — rapid comparison across versions
 *   · Graph       — relationships between contributors, versions, evidence
 *   · Session     — minute-by-minute activity of the recording moment
 *
 * All four modes render the same underlying event model. They are lenses,
 * not separate systems.
 */

const BASELINE_CLARIFICATION = 'A baseline contributor beginning at 100% represents 100% of the documented creative material contained in that baseline version being analyzed. It does not represent 100% legal ownership of the composition, publishing, master or any other right.';

const VIEWS = [
    { key: 'live',        label: 'Live',        icon: Zap,        hint: 'Documenting now' },
    { key: 'documentary', label: 'Documentary', icon: LayoutList, hint: 'The narrative' },
    { key: 'filmstrip',   label: 'Filmstrip',   icon: Film,       hint: 'Compare frames' },
    { key: 'graph',       label: 'Evidence Graph', icon: Network, hint: 'See connections' },
    { key: 'session',     label: 'Session',     icon: Radio,      hint: 'Minute by minute' },
];

export default function EvolutionTab({ sessionId }) {
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDoc, setOpenDoc] = useState(false);
    const [openBooth, setOpenBooth] = useState(false);
    const [selected, setSelected] = useState(null);
    const [cmpA, setCmpA] = useState('');
    const [cmpB, setCmpB] = useState('');
    const [cmpOpen, setCmpOpen] = useState(false);
    const [view, setView] = useState('documentary');

    const load = async () => {
        try {
            const { data } = await api.get(`/sessions/${sessionId}/versions`);
            setVersions(data || []);
            // If a version detail is open, refresh its data too.
            if (selected) {
                const fresh = (data || []).find((v) => v.version_id === selected.version_id);
                if (fresh) setSelected(fresh);
            }
        } catch { /* silent */ }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); /* eslint-disable-next-line */ }, [sessionId]);

    const totals = {
        versions: versions.length,
        artifacts: versions.reduce((s, v) => s + (v.evidence_artifacts?.length || 0), 0),
        acks: versions.reduce((s, v) => s + (v.acknowledgements?.length || 0), 0),
        participants: new Set(versions.flatMap((v) => (v.participants || []).map((p) => p.rightprint_id || p.name)).filter(Boolean)).size,
    };

    return (
        <div data-testid="evolution-tab" className="p-6 md:p-10 max-w-[1300px] mx-auto">
            {/* Chapter eyebrow */}
            <div className="flex items-end justify-between gap-4 flex-wrap mb-10">
                <div>
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-3 flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-indigo-300" strokeWidth={1.5} />
                        CREATIVE EVIDENCE INTELLIGENCE™ · THE LIFE OF THIS SONG
                    </div>
                    <h2 className="font-display font-black text-3xl md:text-5xl tracking-tighter text-white leading-[0.95]">
                        <span className="bg-gradient-to-r from-white via-indigo-50 to-violet-100 bg-clip-text text-transparent">
                            Every moment. Every voice. Immutable. Forever.
                        </span>
                    </h2>
                    <p className="mt-4 text-zinc-400 text-sm max-w-2xl leading-relaxed">
                        Each version below is a permanent historical snapshot — a complete Creative Evidence™ package
                        containing what changed, why, who was in the room, the artifacts that survived, and the human
                        testimony that accompanies them. Nothing here is ever overwritten.
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        data-testid="evolution-voice-btn"
                        onClick={() => setOpenBooth(true)}
                        variant="outline"
                        className="border-rose-400/40 text-rose-100 hover:bg-rose-400/10 h-11 px-4"
                    >
                        <Mic className="w-4 h-4 mr-2" strokeWidth={1.8} /> Record voice memo
                    </Button>
                    <Button
                        data-testid="evolution-submit-btn"
                        onClick={() => setOpenDoc(true)}
                        className="bg-white hover:bg-zinc-200 text-black font-bold h-11 px-5"
                    >
                        <Plus className="w-4 h-4 mr-2" strokeWidth={2} /> Document a new version
                    </Button>
                </div>
            </div>

            {/* Live counters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {[
                    { label: 'Versions', value: totals.versions },
                    { label: 'Evidence artifacts', value: totals.artifacts },
                    { label: 'Acknowledgements', value: totals.acks },
                    { label: 'Contributors', value: totals.participants },
                ].map((s) => (
                    <div key={s.label} className="border border-zinc-900 bg-zinc-950/40 p-4">
                        <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500">{s.label}</div>
                        <div className="mt-1 font-display font-black text-3xl tracking-tighter text-white">{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Baseline clarification — spec §2.1 */}
            <div data-testid="evolution-baseline-clarification" className="mb-8 border border-indigo-400/25 bg-indigo-400/[0.04] p-5">
                <div className="flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 text-indigo-200 mt-0.5 shrink-0" strokeWidth={1.5} />
                    <div>
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-200 mb-2">/ BASELINE CLARIFICATION</div>
                        <p className="text-sm text-zinc-300 leading-relaxed">{BASELINE_CLARIFICATION}</p>
                    </div>
                </div>
            </div>

            {/* Analytical status – always visible, never estimated */}
            <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border border-zinc-900 bg-black/60 p-4 flex items-start gap-3">
                    <Info className="w-4 h-4 text-indigo-200 mt-0.5 shrink-0" strokeWidth={1.5} />
                    <div>
                        <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-1">Creative Evidence™ Confidence</div>
                        <div className="text-sm text-indigo-200 italic">Awaiting Evidence Analysis</div>
                        <p className="mt-1 text-[11px] text-zinc-500 leading-relaxed">Computed by the Creative Evidence Intelligence™ engine once the evidence is analyzed. Never estimated from documentation completeness.</p>
                    </div>
                </div>
                <div className="border border-zinc-900 bg-black/60 p-4 flex items-start gap-3">
                    <Info className="w-4 h-4 text-amber-200 mt-0.5 shrink-0" strokeWidth={1.5} />
                    <div>
                        <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-1">MCI Status</div>
                        <div className="text-sm text-amber-200 italic">Awaiting Musical Contribution Analysis</div>
                        <p className="mt-1 text-[11px] text-zinc-500 leading-relaxed">Musical Contribution Intelligence™ examines the recorded material itself. It is never user-editable.</p>
                    </div>
                </div>
            </div>

            {/* View switcher */}
            <div className="mb-6 flex items-center gap-2 flex-wrap" data-testid="evolution-view-switcher">
                {VIEWS.map((v) => {
                    const Icon = v.icon;
                    const active = view === v.key;
                    return (
                        <button
                            key={v.key}
                            data-testid={`view-${v.key}`}
                            onClick={() => setView(v.key)}
                            className={`flex items-center gap-2 px-3 py-2 border transition-colors ${active
                                ? 'border-white bg-white text-black'
                                : 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white'}`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            <div>
                                <div className="font-display font-semibold text-sm leading-none">{v.label}</div>
                                <div className={`font-mono-metadata text-[8px] uppercase tracking-[0.3em] mt-0.5 ${active ? 'text-black/60' : 'text-zinc-600'}`}>{v.hint}</div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Body */}
            {loading ? (
                <div className="p-12 text-center font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-600">Loading the life of this song…</div>
            ) : versions.length === 0 && view !== 'live' ? (
                <div className="p-12 border border-dashed border-zinc-800 text-center bg-zinc-950/40">
                    <div className="font-display font-semibold text-xl text-zinc-300 mb-2">The story hasn't been told yet.</div>
                    <div className="text-sm text-zinc-500 max-w-xl mx-auto leading-relaxed">
                        The <button onClick={() => setView('live')} className="text-indigo-200 underline underline-offset-4 hover:text-white transition-colors">Live</button> stream is already documenting every moment automatically.
                        Document your first version to open the official evidence ledger — every subsequent version becomes part of an unbroken chain of evidence, people, decisions, and testimony.
                    </div>
                    <Button onClick={() => setOpenDoc(true)} className="mt-6 bg-white text-black hover:bg-zinc-200 font-bold" data-testid="evolution-empty-cta">
                        <Plus className="w-4 h-4 mr-2" /> Document the first version
                    </Button>
                </div>
            ) : view === 'live' ? (
                <>
                    <LiveEvidenceStream sessionId={sessionId} />
                    <VoiceEvidencePanel sessionId={sessionId} onOpenBooth={() => setOpenBooth(true)} key={openBooth ? 'panel-open' : 'panel-closed'} />
                </>
            ) : view === 'documentary' ? (
                <>
                    {versions.length >= 2 && (
                        <div className="mb-4 border border-zinc-900 bg-zinc-950/40 p-4 flex items-center gap-3 flex-wrap" data-testid="comparison-picker">
                            <span className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">/ COMPARE TWO VERSIONS</span>
                            <select data-testid="compare-a" value={cmpA} onChange={(e) => setCmpA(e.target.value)} className="bg-black border border-zinc-800 text-white text-xs px-2 py-1.5">
                                <option value="">Version A…</option>
                                {versions.map((v) => <option key={v.version_id} value={v.version_id}>{v.title || v.label}</option>)}
                            </select>
                            <span className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-600">vs</span>
                            <select data-testid="compare-b" value={cmpB} onChange={(e) => setCmpB(e.target.value)} className="bg-black border border-zinc-800 text-white text-xs px-2 py-1.5">
                                <option value="">Version B…</option>
                                {versions.map((v) => <option key={v.version_id} value={v.version_id}>{v.title || v.label}</option>)}
                            </select>
                            <Button
                                data-testid="compare-run"
                                onClick={() => setCmpOpen(true)}
                                disabled={!cmpA || !cmpB || cmpA === cmpB}
                                className="bg-white text-black hover:bg-zinc-200 font-bold h-8 px-4 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Compare
                            </Button>
                        </div>
                    )}
                    <DocumentaryTimeline versions={versions} onOpen={setSelected} />
                </>
            ) : view === 'filmstrip' ? (
                <FilmstripTimeline versions={versions} onOpen={setSelected} />
            ) : view === 'graph' ? (
                <EvidenceGraph versions={versions} onOpen={setSelected} />
            ) : (
                <SessionActivityTimeline sessionId={sessionId} versions={versions} onOpen={setSelected} />
            )}

            {/* Modals */}
            <DocumentVersionModal
                open={openDoc}
                onOpenChange={setOpenDoc}
                sessionId={sessionId}
                priorVersions={versions}
                onCreated={() => load()}
            />
            <VersionDetailSheet
                version={selected}
                onClose={() => setSelected(null)}
                onRefresh={() => load()}
            />
            <VoiceBooth
                open={openBooth}
                onOpenChange={setOpenBooth}
                sessionId={sessionId}
                onUploaded={() => { /* panel polls on mount + polls while pending */ }}
            />
            <VersionComparisonSheet
                sessionId={cmpOpen ? sessionId : null}
                versionAId={cmpOpen ? cmpA : null}
                versionBId={cmpOpen ? cmpB : null}
                onClose={() => setCmpOpen(false)}
            />
        </div>
    );
}
