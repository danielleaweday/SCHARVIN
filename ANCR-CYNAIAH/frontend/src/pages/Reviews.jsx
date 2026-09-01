import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import TopBar from "@/components/cynaiah/TopBar";
import { MessageSquareText, Timer, Star, Sparkles, RotateCcw, Lock, History as HistoryIcon } from "lucide-react";

const STATUS_TONE = {
    open: { label: "Open", cls: "bg-white/[0.06] text-white/70 border-white/10" },
    revision_requested: { label: "Revision requested", cls: "bg-cynaiah-orange/15 text-cynaiah-orange border-cynaiah-orange/30" },
    approved: { label: "Approved", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30" },
    final: { label: "Final", cls: "bg-cynaiah-cyan/15 text-cynaiah-cyan border-cynaiah-cyan/30" },
};
const KIND_TONE = {
    written: { label: "Written note", cls: "text-white/85", icon: MessageSquareText },
    time_coded: { label: "Time-coded", cls: "text-cynaiah-cyan", icon: Timer },
    coverage_response: { label: "Coverage response", cls: "text-cynaiah-gold", icon: Sparkles },
    rubric: { label: "Rubric", cls: "text-cynaiah-violet", icon: Star },
    status: { label: "Status change", cls: "text-cynaiah-orange", icon: RotateCcw },
};
const fmtTime = (t) => {
    if (t === null || t === undefined) return "";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
};

export default function Reviews() {
    const [data, setData] = useState(null);
    const [selected, setSelected] = useState(null);
    const [params] = useSearchParams();
    const nav = useNavigate();

    useEffect(() => {
        api.get("/student/reviews-summary").then((r) => {
            setData(r.data);
            const wantedProject = params.get("project");
            const match = wantedProject
                ? r.data.projects.find((p) => p.project.id === wantedProject)
                : null;
            if (match) setSelected(match);
            else if (r.data.projects.length > 0) setSelected(r.data.projects[0]);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params]);

    const highlightReviewId = params.get("review");

    if (!data) return <TopBar subtitle="Reviews" title="Loading…" />;

    return (
        <div>
            <TopBar subtitle="Reviews" title="Faculty & mentor feedback" />

            <div className="px-8 md:px-12 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: project list */}
                <div className="space-y-2 lg:col-span-1">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/40 mb-1">Your productions</div>
                    {data.projects.length === 0 && (
                        <div className="glass rounded-xl p-6 text-white/60 text-sm">
                            No feedback yet. Once faculty leaves a note it will appear here.
                        </div>
                    )}
                    {data.projects.map((p) => {
                        const tone = STATUS_TONE[p.status] || STATUS_TONE.open;
                        const active = selected?.project?.id === p.project.id;
                        return (
                            <button
                                key={p.project.id}
                                onClick={() => setSelected(p)}
                                data-testid={`student-review-project-${p.project.id}`}
                                className={`w-full text-left glass rounded-xl p-4 transition-colors ${active ? "border-white/25" : "hover:border-white/15"}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0">
                                        <div className="font-heading text-base text-white truncate">{p.project.title}</div>
                                        <div className="text-[10px] uppercase tracking-[0.22em] text-white/50">
                                            {(p.project.type || "").replace("_", " ")}
                                        </div>
                                    </div>
                                    <div className={`text-[10px] uppercase tracking-[0.22em] px-2 py-0.5 rounded-full border ${tone.cls}`}>
                                        {tone.label}
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center justify-between text-[11px] text-white/55">
                                    <span>{p.review_count} note{p.review_count === 1 ? "" : "s"}</span>
                                    <span>{p.latest_review_at ? new Date(p.latest_review_at).toLocaleDateString() : "—"}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Right: selected timeline */}
                <div className="lg:col-span-2 space-y-4">
                    {!selected && <div className="glass rounded-xl p-10 text-center text-white/55">Select a project on the left.</div>}
                    {selected && <SelectedProject p={selected} highlightId={highlightReviewId} onOpen={() => nav(`/projects/${selected.project.id}`)} />}
                </div>
            </div>
        </div>
    );
}

function SelectedProject({ p, onOpen, highlightId }) {
    const tone = STATUS_TONE[p.status] || STATUS_TONE.open;
    useEffect(() => {
        if (!highlightId) return;
        const el = document.querySelector(`[data-testid="student-review-${highlightId}"]`);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [highlightId, p.project.id]);
    return (
        <>
            <div className="glass rounded-xl p-5" data-testid="student-review-header">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">Milestone status</div>
                        <div className="font-heading text-xl text-white">{p.project.title}</div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`text-[10px] uppercase tracking-[0.22em] px-3 py-1.5 rounded-full border ${tone.cls}`}>{tone.label}</div>
                        <button
                            onClick={onOpen}
                            className="cyn-btn-ghost rounded-md px-3 py-1.5 text-xs uppercase tracking-[0.22em]"
                        >
                            Open project
                        </button>
                    </div>
                </div>
                <div className="mt-3 text-[10px] uppercase tracking-[0.22em] text-white/45 flex items-center gap-2">
                    <Lock size={11} /> Every note is preserved — nothing is silently overwritten.
                </div>
            </div>

            {p.reviews.length === 0 && (
                <div className="glass rounded-xl p-10 text-center text-white/55" data-testid="student-review-empty">
                    No feedback on this project yet.
                </div>
            )}

            <div className="glass rounded-xl p-5" data-testid="student-review-timeline">
                <div className="flex items-center gap-2 mb-3">
                    <HistoryIcon size={13} className="text-white/60" />
                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">Feedback timeline</div>
                </div>
                <div className="space-y-3">
                    {p.reviews.map((r) => <ReviewRow key={r.id} r={r} highlighted={r.id === highlightId} />)}
                </div>
            </div>
        </>
    );
}

function ReviewRow({ r, highlighted }) {
    const kt = KIND_TONE[r.kind] || KIND_TONE.written;
    const superseded = !!r.superseded_by;
    return (
        <div
            data-testid={`student-review-${r.id}`}
            className={`rounded-lg border p-3 transition-all ${
                highlighted
                    ? "border-cynaiah-cyan/60 bg-cynaiah-cyan/10 ring-1 ring-cynaiah-cyan/40"
                    : superseded
                    ? "border-white/[0.03] bg-white/[0.01] opacity-60"
                    : "border-white/[0.06] bg-white/[0.02]"
            }`}
        >
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em]">
                <div className={`flex items-center gap-1.5 ${kt.cls}`}>
                    <kt.icon size={11} /> {kt.label}
                    {r.kind === "time_coded" && r.timestamp_seconds !== null && (
                        <span className="text-white/50">· {fmtTime(r.timestamp_seconds)}</span>
                    )}
                    {r.kind === "coverage_response" && r.target_ref && <span className="text-white/50">· SC {r.target_ref}</span>}
                    {r.kind === "status" && r.status_value && (
                        <span className="text-white/50">· {r.status_value.replace("_", " ")}</span>
                    )}
                </div>
                <div className="flex items-center gap-2 text-white/40">
                    {r.author?.name && <span className="normal-case tracking-normal text-white/55">{r.author.name}</span>}
                    <span>{new Date(r.created_at).toLocaleString()}</span>
                </div>
            </div>
            {r.message && (
                <div className={`mt-2 text-sm ${superseded ? "line-through text-white/50" : "text-white/85"}`}>
                    {r.message}
                </div>
            )}
            {r.kind === "rubric" && r.rubric_scores && (
                <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
                    {Object.entries(r.rubric_scores).map(([k, v]) => (
                        <div key={k} className="text-white/70">
                            <span className="text-white/50 uppercase tracking-[0.14em] text-[9px]">{k.replace("_", " ")}</span>
                            <span className="ml-1.5 text-cynaiah-cyan">{v}/5</span>
                        </div>
                    ))}
                </div>
            )}
            {superseded && (
                <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-cynaiah-orange/80">
                    Superseded by a newer note — kept in history
                </div>
            )}
        </div>
    );
}
