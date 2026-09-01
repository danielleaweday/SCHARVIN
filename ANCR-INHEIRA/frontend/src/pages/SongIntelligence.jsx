import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { copyToClipboard } from '@/lib/clipboard';
import Nav from '@/components/Nav';
import ModuleLink from '@/components/ModuleLink';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PITCH } from '@/constants/testIds';
import SongJourney from '@/components/SongJourney';
import OwnershipDashboard from '@/components/OwnershipDashboard';
import { InheiraMark, AncrMark } from '@/components/BrandLogos';
import {
    Sparkles, Fingerprint, ShieldCheck, Download, Share2, Link as LinkIcon, Lock, Check, Circle,
    TrendingUp, Radio, Film, Coins, Music, Users, Globe, MapPin, Rocket, ArrowLeft, ArrowUpRight,
    Copy, FileText, Play, Zap, Award, Building2, Briefcase, PenLine, Sliders, Mic, Layers, ArrowRight,
    BarChart3, CheckCircle2,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RTooltip, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function SongIntelligence() {
    const { id } = useParams();
    const [report, setReport] = useState(null);
    const [lines, setLines] = useState([]);
    const [contribs, setContribs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showShare, setShowShare] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const [r, l, c] = await Promise.all([
                    api.post(`/sessions/${id}/intelligence`),
                    api.get(`/sessions/${id}/lyrics`),
                    api.get(`/sessions/${id}/contributions`),
                ]);
                setReport(r.data);
                setLines(l.data);
                setContribs(c.data);
            } catch (e) {
                toast.error('Failed to generate report');
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading || !report) {
        return (
            <div className="min-h-screen bg-zinc-950">
                <Nav />
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-24 text-center">
                    <div className="inline-flex items-center gap-3 font-mono-metadata text-xs uppercase tracking-[0.3em] text-indigo-300 mb-6">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                        Compiling Song Intelligence Report™…
                    </div>
                    <div className="text-sm text-zinc-500">INHEIRA Intelligence™ is analyzing lyrics, contributions and market context.</div>
                </div>
            </div>
        );
    }

    const { session, stats, evidence, analysis, forecast, events_recent, generated_at } = report;
    const meta = session.song_meta || {};

    return (
        <div data-testid={PITCH.root} className="min-h-screen bg-zinc-950 print:bg-white">
            <div className="print:hidden">
                <Nav />
            </div>
            <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-12 print:py-0 print:px-4">
                {/* Back + actions */}
                <div className="flex items-center justify-between mb-8 print:hidden">
                    <Link to={`/sessions/${id}/studio`}>
                        <Button variant="ghost" className="text-zinc-500 hover:text-white -ml-4">
                            <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={1.5} /> Back to studio
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Button
                            data-testid={PITCH.shareBtn}
                            onClick={() => setShowShare(true)}
                            variant="outline"
                            className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white"
                        >
                            <Share2 className="w-4 h-4 mr-2" strokeWidth={1.5} /> Share
                        </Button>
                        <Button
                            data-testid={PITCH.downloadBtn}
                            onClick={() => window.print()}
                            className="bg-white text-zinc-950 hover:bg-zinc-200 font-semibold"
                        >
                            <Download className="w-4 h-4 mr-2" strokeWidth={2} /> Download PDF
                        </Button>
                    </div>
                </div>

                <ReportCover session={session} meta={meta} analysis={analysis} stats={stats} generatedAt={generated_at} />

                <ExecutiveSummarySection analysis={analysis} session={session} stats={stats} />

                <CreativeTeamSection collaborators={session.collaborators} evidence={evidence} />

                <CreativeJourneySection session={session} events={events_recent} />

                <CreativeEvidenceSection evidence={evidence} lines={lines} contribs={contribs} />

                <OwnershipSection session={session} lines={lines} contribs={contribs} />

                <PublishingPackageSection session={session} />

                <CommercialReadinessSection analysis={analysis} />

                <AudienceIntelligenceSection analysis={analysis} />

                <FinancialForecastSection forecast={forecast} />

                <ReleaseCenterSection session={session} />

                <ReportFooter generatedAt={generated_at} />
            </div>

            <ShareDialog open={showShare} onOpenChange={setShowShare} sessionId={id} />
        </div>
    );
}

// -----------------------------------------------------------------------------
// COVER
// -----------------------------------------------------------------------------
function ReportCover({ session, meta, analysis, stats, generatedAt }) {
    return (
        <div data-testid={PITCH.hero} className="relative border border-indigo-400/20 bg-gradient-to-br from-indigo-400/[0.05] via-zinc-950 to-zinc-950 p-8 md:p-12 mb-12 overflow-hidden print:bg-white print:border-black">
            <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle at 20% 30%, rgba(129,140,248,0.15), transparent 50%), radial-gradient(circle at 80% 70%, rgba(59,130,246,0.1), transparent 50%)' }} />

            <div className="relative grid md:grid-cols-12 gap-8">
                <div className="md:col-span-8">
                    <div className="flex items-center gap-3 mb-6 flex-wrap">
                        <InheiraMark className="h-10 w-auto print:hidden" />
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-300 flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} /> SONG INTELLIGENCE REPORT™
                        </div>
                    </div>
                    <h1 className="font-display font-black text-5xl md:text-7xl tracking-tighter text-white leading-[0.95] print:text-black">
                        {session.title}
                    </h1>
                    <div className="mt-4 font-mono-metadata text-xs text-zinc-500 print:text-zinc-800">
                        {session.working_title && <>{session.working_title} · </>}
                        {session.project || 'Untitled project'}
                    </div>

                    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <CoverMeta label="Genre" value={meta.genre || '—'} />
                        <CoverMeta label="Key" value={meta.key || '—'} />
                        <CoverMeta label="Tempo" value={meta.tempo ? `${meta.tempo} BPM` : '—'} />
                        <CoverMeta label="Time Sig" value={meta.time_signature || '4/4'} />
                        <CoverMeta label="Language" value={meta.language || 'English'} />
                        <CoverMeta label="Mood" value={analysis.mood || 'Introspective / Uplift'} />
                        <CoverMeta label="Duration" value={meta.duration || '3:24'} />
                        <CoverMeta label="Explicit" value={meta.explicit ? 'Yes' : 'No'} />
                    </div>

                    <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3">
                        <Verification label="Song DNA™" verified />
                        <Verification label="RightPrint™" verified />
                        <Verification label="Ownership" verified={session.splits_status === 'finalized'} />
                        <Verification label="Publishing" verified={session.completion?.publishing === 'complete'} />
                        <Verification label="ISRC" verified={Boolean(session.rights?.identifiers?.isrc)} />
                        <Verification label="ISWC" verified={Boolean(session.rights?.identifiers?.iswc)} />
                    </div>
                </div>

                <div className="md:col-span-4 flex flex-col gap-4">
                    <div className="p-6 border border-indigo-400/40 bg-indigo-400/[0.05] flex flex-col items-center text-center print:bg-white print:border-black">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-300 mb-3">RELEASE READINESS</div>
                        <div className="relative w-32 h-32">
                            <svg className="w-full h-full -rotate-90">
                                <circle cx="64" cy="64" r="56" stroke="#27272A" strokeWidth="8" fill="none" />
                                <circle
                                    cx="64" cy="64" r="56"
                                    stroke="#818cf8" strokeWidth="8" fill="none"
                                    strokeDasharray={2 * Math.PI * 56}
                                    strokeDashoffset={2 * Math.PI * 56 * (1 - stats.commercial_readiness / 100)}
                                    strokeLinecap="round"
                                    style={{ filter: 'drop-shadow(0 0 10px rgba(129,140,248,0.6))' }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="font-display font-black text-3xl text-white print:text-black">{stats.commercial_readiness}%</div>
                            </div>
                        </div>
                        <div className="mt-4 font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                            Commercial Readiness
                        </div>
                    </div>
                    <div className="p-4 border border-zinc-900 grid grid-cols-2 gap-3 font-mono-metadata text-xs print:border-black">
                        <div><span className="text-zinc-500 uppercase tracking-widest text-[9px] block mb-1">Writers</span><span className="text-white print:text-black font-bold">{session.collaborators?.length || 0}</span></div>
                        <div><span className="text-zinc-500 uppercase tracking-widest text-[9px] block mb-1">Events</span><span className="text-white print:text-black font-bold">{stats.total_events}</span></div>
                        <div><span className="text-zinc-500 uppercase tracking-widest text-[9px] block mb-1">Lines</span><span className="text-white print:text-black font-bold">{stats.total_lines}</span></div>
                        <div><span className="text-zinc-500 uppercase tracking-widest text-[9px] block mb-1">Words</span><span className="text-white print:text-black font-bold">{stats.total_words}</span></div>
                    </div>
                    <div className="p-3 border border-zinc-900 font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-500 print:border-black">
                        Generated · {new Date(generatedAt).toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
    );
}

function CoverMeta({ label, value }) {
    return (
        <div>
            <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-1">{label}</div>
            <div className="text-white text-sm print:text-black font-medium">{value}</div>
        </div>
    );
}

function Verification({ label, verified }) {
    return (
        <div className={`p-3 border flex items-center justify-between ${verified ? 'border-emerald-500/40 bg-emerald-500/[0.03]' : 'border-zinc-800 bg-zinc-950'}`}>
            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-400">{label}</div>
            {verified ? <CheckCircle2 className="w-4 h-4 text-emerald-400" strokeWidth={2} /> : <Circle className="w-3 h-3 text-zinc-600" strokeWidth={1.5} />}
        </div>
    );
}

// -----------------------------------------------------------------------------
// EXECUTIVE SUMMARY
// -----------------------------------------------------------------------------
function ExecutiveSummarySection({ analysis, session, stats }) {
    return (
        <Section number="01" title="Executive Summary" subtitle="A one-page briefing for label leadership.">
            <div className="grid md:grid-cols-12 gap-6">
                <div className="md:col-span-8">
                    <div className="p-8 border border-zinc-900 bg-zinc-950 print:border-black">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-300 mb-4 flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} /> AI-generated executive briefing
                        </div>
                        <p className="text-lg text-zinc-200 leading-relaxed print:text-black">{analysis.executive_summary}</p>
                        <div className="mt-6 pt-6 border-t border-zinc-900 print:border-black">
                            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-300 mb-3">Release Recommendation</div>
                            <p className="text-sm text-zinc-300 leading-relaxed print:text-black">{analysis.release_recommendation}</p>
                        </div>
                    </div>
                </div>
                <div className="md:col-span-4 space-y-3">
                    <ScoreCard label="Commercial potential" value={analysis.commercial_potential} />
                    <ScoreCard label="Streaming potential" value={analysis.streaming_potential} />
                    <ScoreCard label="Sync potential" value={analysis.sync_potential} />
                    <ScoreCard label="Playlist potential" value={analysis.playlist_potential} />
                </div>
            </div>
        </Section>
    );
}

function ScoreCard({ label, value }) {
    return (
        <div className="p-4 border border-zinc-900 bg-zinc-950 flex items-center justify-between print:border-black">
            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">{label}</div>
            <div className="flex items-center gap-3">
                <div className="w-24 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${value}%`, boxShadow: '0 0 8px rgba(129,140,248,0.6)' }} />
                </div>
                <div className="font-display font-bold text-white w-8 text-right print:text-black">{value}</div>
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------------
// CREATIVE TEAM
// -----------------------------------------------------------------------------
function CreativeTeamSection({ collaborators, evidence }) {
    return (
        <Section number="02" title="Creative Team" subtitle="Verified contributors with RightPrint™ passports.">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(collaborators || []).map((c) => {
                    const ev = evidence.find((e) => e.user_id === c.user_id) || {};
                    const initials = (c.name || '?').split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
                    return (
                        <ModuleLink key={c.user_id} module="ancrid" subpath={`/${c.user_id}`} className="p-6 border border-zinc-900 hover:border-zinc-700 bg-zinc-950 transition-all relative overflow-hidden group block print:border-black">
                            <div className="absolute top-0 left-0 h-1 w-full" style={{ background: `linear-gradient(to right, ${c.color}, transparent)` }} />
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg border-2 flex-shrink-0" style={{ background: `${c.color}15`, borderColor: `${c.color}60`, color: c.color }}>
                                    {c.picture ? <img src={c.picture} alt="" className="w-full h-full rounded-full object-cover" /> : initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-white font-semibold print:text-black">{c.name}</div>
                                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-500 mt-0.5">{c.role}</div>
                                    <div className="mt-2 flex items-center gap-1.5 text-[9px] font-mono-metadata uppercase tracking-[0.2em] text-emerald-400">
                                        <ShieldCheck className="w-3 h-3" strokeWidth={2} /> Verified · RightPrint™
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-zinc-900 print:border-black">
                                <MiniStat label="Lines" value={ev.lyric_lines || 0} color={c.color} />
                                <MiniStat label="Contribs" value={ev.contributions || 0} color={c.color} />
                                <MiniStat label="Weight" value={ev.total_weight || 0} color={c.color} />
                            </div>
                            <div className="mt-3 font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-indigo-300 flex items-center gap-1 group-hover:text-indigo-200">
                                Creator Passport <ArrowUpRight className="w-3 h-3" strokeWidth={2} />
                            </div>
                        </ModuleLink>
                    );
                })}
            </div>
        </Section>
    );
}

function MiniStat({ label, value, color }) {
    return (
        <div className="text-center">
            <div className="font-display font-bold text-lg" style={{ color }}>{value}</div>
            <div className="font-mono-metadata text-[9px] uppercase tracking-[0.2em] text-zinc-500">{label}</div>
        </div>
    );
}

// -----------------------------------------------------------------------------
// CREATIVE JOURNEY
// -----------------------------------------------------------------------------
function CreativeJourneySection({ session, events }) {
    return (
        <Section number="03" title="Creative Journey" subtitle="From idea to royalties.">
            <SongJourney session={session} />
            <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div className="p-6 border border-zinc-900 bg-zinc-950 print:border-black">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-300 mb-3">Milestone Contributors</div>
                    <div className="space-y-2 text-sm">
                        <MilestoneLine label="Session Created" contributor={session.collaborators?.[0]?.name || 'Owner'} color={session.collaborators?.[0]?.color} date={session.created_at} />
                        <MilestoneLine label="First Line Written" contributor={events?.[0]?.user_name || '—'} color={events?.[0]?.color} date={events?.[0]?.created_at} />
                        <MilestoneLine label="Latest Activity" contributor={events?.[events.length - 1]?.user_name || '—'} color={events?.[events.length - 1]?.color} date={events?.[events.length - 1]?.created_at} />
                    </div>
                </div>
                <div className="p-6 border border-zinc-900 bg-zinc-950 print:border-black">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-300 mb-3">Session Signature</div>
                    <div className="grid grid-cols-2 gap-4 font-mono-metadata text-sm">
                        <div>
                            <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-1">Session ID</div>
                            <div className="text-zinc-300 break-all print:text-black">{session.session_id}</div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-1">Verified events</div>
                            <div className="text-white font-bold print:text-black">{events?.length || 0}</div>
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    );
}

function MilestoneLine({ label, contributor, color, date }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full" style={{ background: color || '#71717A' }} />
                <span className="text-zinc-400 print:text-black">{label}</span>
            </div>
            <div className="text-right">
                <div className="text-white print:text-black text-xs">{contributor}</div>
                <div className="font-mono-metadata text-[9px] uppercase tracking-[0.2em] text-zinc-500">{date ? new Date(date).toLocaleDateString() : '—'}</div>
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------------
// CREATIVE EVIDENCE — the differentiator
// -----------------------------------------------------------------------------
function CreativeEvidenceSection({ evidence, lines, contribs }) {
    return (
        <Section number="04" title="Creative Evidence" subtitle="Not just percentages — proof. Every credit backed by verifiable activity.">
            <div className="p-6 border border-indigo-400/20 bg-indigo-400/[0.03] mb-6 print:border-black">
                <div className="flex items-start gap-4">
                    <Zap className="w-5 h-5 text-indigo-300 mt-1 flex-shrink-0" strokeWidth={1.5} />
                    <div>
                        <div className="font-display font-semibold text-white mb-2 print:text-black">A transparent activity record — one input for split conversations.</div>
                        <p className="text-sm text-zinc-400 leading-relaxed print:text-black">
                            INHEIRA™ does not automatically determine ownership. Splits remain the collaborators' decision.
                            This evidence record shows exactly what each contributor did, so those conversations are informed and fair.
                        </p>
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                {evidence.map((ev) => {
                    const evLines = lines.filter((l) => l.user_id === ev.user_id);
                    const evContribs = contribs.filter((c) => c.user_id === ev.user_id);
                    return (
                        <div key={ev.user_id} className="p-6 border border-zinc-900 bg-zinc-950 print:border-black">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-900 print:border-black">
                                <div className="flex items-center gap-4">
                                    <div className="w-3 h-12 rounded-full" style={{ background: ev.color, boxShadow: `0 0 12px ${ev.color}80` }} />
                                    <div>
                                        <div className="font-display font-bold text-2xl text-white print:text-black">{ev.name}</div>
                                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-500">{ev.role}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-4 gap-4 mb-6">
                                <EvBigStat label="Lyric lines" value={ev.lyric_lines} color={ev.color} />
                                <EvBigStat label="Sections touched" value={ev.sections_touched?.length || 0} color={ev.color} />
                                <EvBigStat label="Revisions" value={ev.revisions || 0} color={ev.color} />
                                <EvBigStat label="Contributions" value={ev.contributions} color={ev.color} />
                            </div>
                            {ev.sections_touched?.length > 0 && (
                                <div className="mb-4">
                                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-2">Sections</div>
                                    <div className="flex flex-wrap gap-2">
                                        {ev.sections_touched.map((s) => (
                                            <span key={s} className="px-3 py-1 border font-mono-metadata text-[10px] uppercase tracking-[0.2em]" style={{ borderColor: `${ev.color}60`, color: ev.color, background: `${ev.color}10` }}>
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {ev.role_counts && Object.keys(ev.role_counts).length > 0 && (
                                <div className="mb-4">
                                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-2">Contribution roles</div>
                                    <div className="grid md:grid-cols-3 gap-2">
                                        {Object.entries(ev.role_counts).map(([role, count]) => (
                                            <div key={role} className="p-2 border border-zinc-900 text-xs flex justify-between print:border-black">
                                                <span className="text-zinc-300 print:text-black">{role}</span>
                                                <span className="font-mono-metadata font-bold" style={{ color: ev.color }}>×{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Sample lines */}
                            {evLines.length > 0 && (
                                <div>
                                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-2">Sample lines</div>
                                    <div className="space-y-1">
                                        {evLines.slice(0, 3).map((l) => (
                                            <div key={l.line_id} className="pl-3 border-l-2 text-xs text-zinc-400 italic print:text-black" style={{ borderColor: ev.color }}>
                                                "{l.text}" <span className="text-zinc-600 not-italic ml-2">— {l.section}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </Section>
    );
}

function EvBigStat({ label, value, color }) {
    return (
        <div className="p-4 border border-zinc-900 print:border-black">
            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-2">{label}</div>
            <div className="font-display font-black text-4xl" style={{ color }}>{value}</div>
        </div>
    );
}

// -----------------------------------------------------------------------------
// OWNERSHIP
// -----------------------------------------------------------------------------
function OwnershipSection({ session, lines, contribs }) {
    return (
        <Section number="05" title="Ownership Summary" subtitle="Explore ownership across every lens.">
            <OwnershipDashboard session={session} lines={lines} contribs={contribs} />
        </Section>
    );
}

// -----------------------------------------------------------------------------
// PUBLISHING PACKAGE
// -----------------------------------------------------------------------------
function PublishingPackageSection({ session }) {
    const rights = session.rights || {};
    const identifiers = rights.identifiers || {};
    const items = [
        { label: 'ISRC', value: identifiers.isrc },
        { label: 'UPC', value: identifiers.upc },
        { label: 'EAN', value: identifiers.ean },
        { label: 'ISWC', value: identifiers.iswc },
        { label: 'Song ID', value: identifiers.song_id },
        { label: 'IPI / CAE', value: session.collaborators?.[0]?.ipi_number },
        { label: 'Publisher', value: session.collaborators?.[0]?.publisher },
        { label: 'PRO', value: Object.entries(rights.pros || {}).find(([, s]) => s === 'registered')?.[0] },
        { label: 'Copyright', value: session.completion?.publishing === 'complete' ? 'Filed' : null },
        { label: 'Mechanical', value: null },
        { label: 'Neighboring rights', value: null },
        { label: 'Metadata', value: session.completion?.metadata === 'complete' ? 'Validated' : null },
        { label: 'Artwork', value: session.completion?.artwork === 'complete' ? 'Approved' : null },
        { label: 'DSP delivery', value: Object.values(rights.dsps || {}).filter((s) => s === 'connected').length ? 'Ready' : null },
        { label: 'Marketing assets', value: null },
    ];
    return (
        <Section number="06" title="Publishing Package" subtitle="Every item required to release.">
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-3">
                {items.map((it) => {
                    const done = Boolean(it.value);
                    return (
                        <div key={it.label} className={`p-4 border ${done ? 'border-emerald-500/40 bg-emerald-500/[0.04]' : 'border-zinc-900'} bg-zinc-950 print:border-black`}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-500">{it.label}</div>
                                {done ? <CheckCircle2 className="w-4 h-4 text-emerald-400" strokeWidth={2} /> : <Circle className="w-3 h-3 text-zinc-600" strokeWidth={1.5} />}
                            </div>
                            <div className={`text-sm font-mono-metadata ${done ? 'text-white print:text-black' : 'text-zinc-600 italic'}`}>{it.value || 'Incomplete'}</div>
                        </div>
                    );
                })}
            </div>
        </Section>
    );
}

// -----------------------------------------------------------------------------
// COMMERCIAL READINESS
// -----------------------------------------------------------------------------
function CommercialReadinessSection({ analysis }) {
    const radar = [
        { subject: 'Streaming', A: analysis.streaming_potential },
        { subject: 'Sync', A: analysis.sync_potential },
        { subject: 'Playlist', A: analysis.playlist_potential },
        { subject: 'Radio', A: analysis.radio_potential },
        { subject: 'Global', A: analysis.international_potential },
        { subject: 'Longevity', A: analysis.catalog_longevity },
        { subject: 'Audience', A: analysis.audience_fit },
    ];
    return (
        <Section number="07" title="Commercial Readiness" subtitle="A holistic view of commercial fit.">
            <div className="grid lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 p-6 border border-zinc-900 bg-zinc-950 print:border-black">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-300 mb-2">Multi-axis fit</div>
                    <div className="h-72">
                        <ResponsiveContainer>
                            <RadarChart data={radar} outerRadius={90}>
                                <PolarGrid stroke="#27272A" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#A1A1AA', fontSize: 11 }} />
                                <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#52525B', fontSize: 9 }} stroke="#27272A" />
                                <Radar dataKey="A" stroke="#818cf8" fill="#818cf8" fillOpacity={0.3} strokeWidth={2} />
                                <RTooltip contentStyle={{ background: '#09090B', border: '1px solid #27272A' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="lg:col-span-6 space-y-4">
                    <div className="p-6 border border-emerald-500/20 bg-emerald-500/[0.03] print:border-black">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-emerald-400 mb-3 flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5" strokeWidth={1.5} /> Strengths</div>
                        <ul className="space-y-2 text-sm text-zinc-300 print:text-black">
                            {(analysis.strengths || []).map((s, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" strokeWidth={2} /> <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="p-6 border border-indigo-400/20 bg-indigo-400/[0.03] print:border-black">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-300 mb-3 flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} /> Potential improvements</div>
                        <ul className="space-y-2 text-sm text-zinc-300 print:text-black">
                            {(analysis.improvements || []).map((s, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <ArrowRight className="w-4 h-4 text-indigo-300 mt-0.5 flex-shrink-0" strokeWidth={2} /> <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="p-6 border border-zinc-900 bg-zinc-950 print:border-black">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-3">Comparable records</div>
                        <div className="flex flex-wrap gap-2">
                            {(analysis.comparable_records || []).map((c, i) => (
                                <span key={i} className="px-3 py-1.5 border border-zinc-800 text-xs text-zinc-300 print:border-black print:text-black">{c}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    );
}

// -----------------------------------------------------------------------------
// AUDIENCE INTELLIGENCE
// -----------------------------------------------------------------------------
function AudienceIntelligenceSection({ analysis }) {
    return (
        <Section number="08" title="Audience Intelligence" subtitle="Where this song will live.">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="p-6 border border-zinc-900 bg-zinc-950 print:border-black">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-300 mb-3">Primary audience</div>
                    <div className="text-lg text-white leading-relaxed print:text-black">{analysis.primary_audience}</div>
                </div>
                <div className="p-6 border border-zinc-900 bg-zinc-950 print:border-black">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-300 mb-3">Secondary audience</div>
                    <div className="text-lg text-white leading-relaxed print:text-black">{analysis.secondary_audience}</div>
                </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
                <ListCard icon={Globe} title="Top countries" items={analysis.top_countries || []} />
                <ListCard icon={MapPin} title="Top cities" items={analysis.top_cities || []} />
                <ListCard icon={Play} title="Priority DSPs" items={analysis.top_dsps || []} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                <ListCard icon={Award} title="Festival opportunities" items={analysis.festival_opportunities || []} />
                <ListCard icon={Briefcase} title="Brand partnerships" items={analysis.brand_partnerships || []} />
            </div>
        </Section>
    );
}

function ListCard({ icon: Icon, title, items }) {
    return (
        <div className="p-5 border border-zinc-900 bg-zinc-950 print:border-black">
            <div className="flex items-center gap-2 mb-3">
                <Icon className="w-3.5 h-3.5 text-indigo-300" strokeWidth={1.5} />
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-300">{title}</div>
            </div>
            <div className="space-y-1.5">
                {items.map((it, i) => (
                    <div key={i} className="text-sm text-zinc-300 flex items-center gap-2 print:text-black">
                        <span className="w-1 h-1 rounded-full bg-indigo-400 flex-shrink-0" /> {it}
                    </div>
                ))}
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------------
// FINANCIAL FORECAST
// -----------------------------------------------------------------------------
function FinancialForecastSection({ forecast }) {
    const years = Array.from({ length: 10 }).map((_, i) => {
        const y = i + 1;
        const decay = 0.75 + 0.25 * Math.exp(-y * 0.15);
        return { year: `Y${y}`, streaming: Math.round(forecast.streaming_yr * decay * (i === 0 ? 1 : 0.7)), publishing: Math.round(forecast.publishing_yr * decay) };
    });

    return (
        <Section number="09" title="Financial Forecast" subtitle="Illustrative projections based on completion, ownership and comparable catalog.">
            <div className="grid md:grid-cols-4 gap-4 mb-6">
                <FinancialCard icon={Play} label="Streaming (Yr 1)" value={forecast.streaming_yr?.toLocaleString()} />
                <FinancialCard icon={Coins} label="Publishing (Yr 1)" value={`$${forecast.publishing_yr?.toLocaleString()}`} />
                <FinancialCard icon={TrendingUp} label="Performance (Yr 1)" value={`$${forecast.performance_yr?.toLocaleString()}`} />
                <FinancialCard icon={Radio} label="Mechanical (Yr 1)" value={`$${forecast.mechanical_yr?.toLocaleString()}`} />
                <FinancialCard icon={Music} label="Neighboring (Yr 1)" value={`$${forecast.neighboring_yr?.toLocaleString()}`} />
                <FinancialCard icon={Film} label="Sync potential" value={`$${forecast.sync_potential?.toLocaleString()}`} />
                <FinancialCard icon={BarChart3} label="5-year projection" value={`$${forecast.five_year_projection?.toLocaleString()}`} accent />
                <FinancialCard icon={Award} label="10-year projection" value={`$${forecast.ten_year_projection?.toLocaleString()}`} accent />
            </div>

            <div className="p-6 border border-zinc-900 bg-zinc-950 print:border-black">
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-300 mb-4">10-year revenue trajectory</div>
                <div className="h-64">
                    <ResponsiveContainer>
                        <LineChart data={years}>
                            <XAxis dataKey="year" stroke="#52525B" fontSize={11} />
                            <YAxis stroke="#52525B" fontSize={10} />
                            <RTooltip contentStyle={{ background: '#09090B', border: '1px solid #27272A' }} />
                            <Line type="monotone" dataKey="streaming" stroke="#818cf8" strokeWidth={2} dot={{ fill: '#818cf8', r: 3 }} />
                            <Line type="monotone" dataKey="publishing" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 flex items-center gap-6 font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-400" /> Streaming</span>
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" /> Publishing</span>
                </div>
            </div>

            <div className="mt-4 p-4 border border-zinc-800 bg-zinc-950 font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-500 print:border-black print:text-zinc-800">
                Illustrative model — real values compute after PRO / DSP integrations in v2. Catalog value estimate: <span className="text-indigo-300">${forecast.catalog_value?.toLocaleString()}</span>.
            </div>
        </Section>
    );
}

function FinancialCard({ icon: Icon, label, value, accent }) {
    return (
        <div className={`p-5 border bg-zinc-950 ${accent ? 'border-indigo-400/40 bg-indigo-400/[0.03]' : 'border-zinc-900'} print:border-black`}>
            <Icon className={`w-4 h-4 mb-3 ${accent ? 'text-indigo-300' : 'text-zinc-500'}`} strokeWidth={1.5} />
            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-1">{label}</div>
            <div className={`font-display font-bold text-xl ${accent ? 'text-indigo-300' : 'text-white print:text-black'}`}>{value}</div>
        </div>
    );
}

// -----------------------------------------------------------------------------
// RELEASE CENTER
// -----------------------------------------------------------------------------
function ReleaseCenterSection({ session }) {
    const timeline = [
        { label: 'Pre-Save', date: 'Week 1', icon: Rocket, done: session.completion?.publishing === 'complete' },
        { label: 'Editorial Pitch', date: 'Week 2', icon: FileText, done: false },
        { label: 'Marketing Campaign', date: 'Week 2-3', icon: Sparkles, done: false },
        { label: 'Press', date: 'Week 3', icon: FileText, done: false },
        { label: 'Video / Content', date: 'Week 3', icon: Play, done: false },
        { label: 'Playlist Pitch', date: 'Week 4', icon: Music, done: false },
        { label: 'Radio', date: 'Week 4', icon: Radio, done: false },
        { label: 'Influencers / TikTok', date: 'Week 4', icon: Zap, done: false },
        { label: 'Release day', date: 'Week 5', icon: Rocket, done: session.completion?.release === 'complete' },
    ];
    return (
        <Section number="10" title="Release Center" subtitle="A go-to-market blueprint.">
            <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-3">
                {timeline.map((t, i) => {
                    const Icon = t.icon;
                    return (
                        <div key={i} className={`p-5 border ${t.done ? 'border-emerald-500/40 bg-emerald-500/[0.03]' : 'border-zinc-900'} bg-zinc-950 print:border-black`}>
                            <div className="flex items-center justify-between mb-3">
                                <Icon className={`w-4 h-4 ${t.done ? 'text-emerald-400' : 'text-indigo-300'}`} strokeWidth={1.5} />
                                {t.done ? <CheckCircle2 className="w-4 h-4 text-emerald-400" strokeWidth={2} /> : <Circle className="w-3 h-3 text-zinc-600" strokeWidth={1.5} />}
                            </div>
                            <div className="font-display font-semibold text-white text-sm print:text-black">{t.label}</div>
                            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-500 mt-1">{t.date}</div>
                        </div>
                    );
                })}
            </div>
        </Section>
    );
}

// -----------------------------------------------------------------------------
// FOOTER
// -----------------------------------------------------------------------------
function ReportFooter({ generatedAt }) {
    return (
        <div className="mt-16 p-8 border border-zinc-900 bg-zinc-950 print:border-black">
            <div className="grid md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-8">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-300 mb-3">/ VERIFIED · IMMUTABLE · SIGNED</div>
                    <div className="text-sm text-zinc-400 leading-relaxed print:text-black">
                        This Song Intelligence Report™ is generated by INHEIRA™ from the permanent creative history of the session.
                        Every metric is derived from time-stamped, verifiable activity by verified RightPrint™ collaborators.
                        This report is a definitive briefing artifact for labels, publishers, managers, A&amp;R teams, sync agencies, attorneys and investors.
                    </div>
                    <div className="mt-4 font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-600">
                        Generated · {new Date(generatedAt).toLocaleString()}
                    </div>
                </div>
                <div className="md:col-span-4 flex md:justify-end items-center gap-4">
                    <InheiraMark className="h-10 w-auto print:hidden" />
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-600 text-right">
                        Powered by<br /> ANCR Ecosystem
                    </div>
                </div>
            </div>
        </div>
    );
}

function Section({ number, title, subtitle, children }) {
    return (
        <section className="mb-16">
            <div className="mb-8 pb-4 border-b border-zinc-900 print:border-black">
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-300 mb-2">/ {number} — {title.toUpperCase()}</div>
                <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tighter text-white print:text-black">{title}</h2>
                {subtitle && <div className="mt-2 text-sm text-zinc-500 print:text-zinc-800">{subtitle}</div>}
            </div>
            {children}
        </section>
    );
}

// -----------------------------------------------------------------------------
// SHARE DIALOG
// -----------------------------------------------------------------------------
function ShareDialog({ open, onOpenChange, sessionId }) {
    const [audience, setAudience] = useState('label');
    const [password, setPassword] = useState('');
    const [link, setLink] = useState(null);
    const [loading, setLoading] = useState(false);

    const create = async () => {
        setLoading(true);
        try {
            const { data } = await api.post(`/sessions/${sessionId}/share`, { audience, password: password || null, ttl_days: 30 });
            const url = `${window.location.origin}/report/${data.token}`;
            setLink(url);
            const { ok } = await copyToClipboard(url);
            if (ok) toast.success('Share link copied');
            else toast.success('Share link ready — copy from below');
        } catch {
            toast.error('Failed to create link');
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur flex items-center justify-center p-4" onClick={() => onOpenChange(false)}>
            <div className="max-w-lg w-full bg-zinc-950 border border-zinc-800 p-8" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-300 mb-2">/ SHARE</div>
                        <div className="font-display font-bold text-2xl text-white">Send this report.</div>
                    </div>
                </div>
                <div className="mb-4">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-2">Audience</div>
                    <div className="grid grid-cols-3 gap-2">
                        {['label', 'publisher', 'manager', 'attorney', 'investor', 'sync'].map((a) => (
                            <button
                                key={a}
                                onClick={() => setAudience(a)}
                                className={`px-3 py-2 border font-mono-metadata text-[10px] uppercase tracking-[0.25em] transition-all ${audience === a ? 'bg-indigo-400 text-zinc-950 border-indigo-400' : 'border-zinc-800 text-zinc-400 hover:text-white'}`}
                            >
                                {a}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mb-4">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-2">Password (optional)</div>
                    <input
                        type="text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Leave blank for open link"
                        className="w-full h-10 bg-zinc-900 border border-zinc-800 px-3 text-white focus:border-indigo-400 outline-none font-mono-metadata text-sm"
                    />
                </div>
                <Button onClick={create} disabled={loading} className="w-full bg-indigo-400 hover:bg-indigo-500 text-zinc-950 font-bold h-11">
                    <LinkIcon className="w-4 h-4 mr-2" strokeWidth={2} /> {loading ? 'Generating…' : 'Generate share link'}
                </Button>
                {link && (
                    <div className="mt-4 p-3 border border-emerald-500/40 bg-emerald-500/5 font-mono-metadata text-xs text-emerald-400 flex items-center gap-2 break-all">
                        <Check className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
                        <span className="flex-1 min-w-0 truncate">{link}</span>
                        <button onClick={async () => { const { ok } = await copyToClipboard(link); toast[ok ? 'success' : 'error'](ok ? 'Copied' : 'Copy failed — select the link manually'); }} className="hover:text-white flex-shrink-0" aria-label="Copy share link"><Copy className="w-3.5 h-3.5" /></button>
                    </div>
                )}
                <div className="mt-4 font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-600">
                    Link expires in 30 days · view-only report · no editing
                </div>
                <button onClick={() => onOpenChange(false)} className="mt-6 w-full text-sm text-zinc-500 hover:text-white transition-colors">Close</button>
            </div>
        </div>
    );
}
