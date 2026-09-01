import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";
import TopBar from "@/components/cynaiah/TopBar";
import {
    ArrowLeft,
    MessageSquareText,
    Timer,
    Star,
    CheckCircle2,
    RotateCcw,
    Lock,
    Sparkles,
    ClapperboardIcon,
    ShieldCheck,
    DollarSign,
    Loader2,
    History as HistoryIcon,
} from "lucide-react";

const STATUS_TONE = {
    open: { label: "Open", cls: "bg-white/[0.06] text-white/70 border-white/10" },
    revision_requested: { label: "Revision requested", cls: "bg-cynaiah-orange/15 text-cynaiah-orange border-cynaiah-orange/30" },
    approved: { label: "Approved", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30" },
    final: { label: "Final (locked)", cls: "bg-cynaiah-cyan/15 text-cynaiah-cyan border-cynaiah-cyan/30" },
};

const KIND_TONE = {
    written: { label: "Written note", cls: "text-white/85", icon: MessageSquareText },
    time_coded: { label: "Time-coded", cls: "text-cynaiah-cyan", icon: Timer },
    coverage_response: { label: "Coverage response", cls: "text-cynaiah-gold", icon: Sparkles },
    rubric: { label: "Rubric", cls: "text-cynaiah-violet", icon: Star },
    status: { label: "Status change", cls: "text-cynaiah-orange", icon: RotateCcw },
};

const TABS = [
    { key: "reviews", label: "Feedback", icon: MessageSquareText },
    { key: "treatment", label: "Treatment", icon: MessageSquareText },
    { key: "storyboard", label: "Storyboard", icon: Sparkles },
    { key: "shots", label: "Shot list", icon: ClapperboardIcon },
    { key: "rough_cut", label: "Rough cut", icon: Timer },
    { key: "rights", label: "Rights", icon: ShieldCheck },
    { key: "budget", label: "Budget", icon: DollarSign },
];

const money = (n) =>
    (Number(n) || 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const fmtTime = (t) => {
    if (t === null || t === undefined) return "—";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
};

export default function FacultyProject() {
    const { id } = useParams();
    const nav = useNavigate();
    const [data, setData] = useState(null);
    const [tab, setTab] = useState("reviews");

    const load = async () => {
        try {
            const { data } = await api.get(`/faculty/projects/${id}`);
            setData(data);
        } catch (e) {
            if (e?.response?.status === 403) toast.error("You are not assigned to this project.");
            else toast.error("Could not load project");
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const submit = async (payload) => {
        try {
            await api.post(`/faculty/projects/${id}/reviews`, payload);
            toast.success("Feedback recorded (append-only)");
            await load();
        } catch (e) {
            toast.error(e?.response?.data?.detail || "Could not save feedback");
        }
    };

    if (!data) return <TopBar subtitle="Faculty" title="Loading…" />;

    const { project, student, latest_status, reviews } = data;
    const tone = STATUS_TONE[latest_status] || STATUS_TONE.open;

    return (
        <div>
            <TopBar
                subtitle={`Faculty review · ${student.name}`}
                title={project.title}
                actions={
                    <div className="flex items-center gap-3">
                        <div className={`text-[10px] uppercase tracking-[0.22em] px-3 py-1.5 rounded-full border ${tone.cls}`}
                             data-testid="faculty-project-status-pill">
                            {tone.label}
                        </div>
                        <button
                            onClick={() => nav("/faculty")}
                            className="cyn-btn-ghost rounded-md px-3 py-1.5 text-xs uppercase tracking-[0.22em] inline-flex items-center gap-2"
                        >
                            <ArrowLeft size={13} /> Back
                        </button>
                    </div>
                }
            />

            {/* Tabs */}
            <div className="px-8 md:px-12 pt-6 overflow-x-auto">
                <div className="inline-flex glass rounded-full p-1 gap-1 whitespace-nowrap">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            data-testid={`faculty-tab-${t.key}`}
                            className={`px-4 py-2 rounded-full text-xs uppercase tracking-[0.22em] flex items-center gap-2 transition-colors ${
                                tab === t.key ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80"
                            }`}
                        >
                            <t.icon size={13} /> {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {tab === "reviews" && <ReviewsTab data={data} onSubmit={submit} />}
            {tab === "treatment" && <TreatmentTab scripts={data.scripts} />}
            {tab === "storyboard" && <StoryboardTab frames={data.storyboard_frames} reviews={reviews} onSubmit={submit} />}
            {tab === "shots" && <ShotsTab scenes={data.scenes} shots={data.shots} />}
            {tab === "rough_cut" && <RoughCutTab music={data.music} cues={data.cues} reviews={reviews} onSubmit={submit} />}
            {tab === "rights" && <RightsTab rights={data.rights} />}
            {tab === "budget" && <BudgetTab budget={data.budget} />}
        </div>
    );
}

// ------------------- Reviews Tab -------------------
function ReviewsTab({ data, onSubmit }) {
    const [msg, setMsg] = useState("");
    const [saving, setSaving] = useState(false);
    return (
        <div className="px-8 md:px-12 py-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-4">
                <div className="glass rounded-xl p-5">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/40 mb-2">Add a written note</div>
                    <textarea
                        value={msg}
                        onChange={(e) => setMsg(e.target.value)}
                        placeholder="What's landing? What would you push? Every note is preserved."
                        data-testid="faculty-review-message-input"
                        className="w-full min-h-[90px] rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-2 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                    />
                    <div className="mt-3 flex items-center justify-between">
                        <div className="text-[10px] uppercase tracking-[0.22em] text-white/45 flex items-center gap-2">
                            <Lock size={11} /> Append-only. Never silently overwritten.
                        </div>
                        <button
                            onClick={async () => {
                                if (!msg.trim()) return toast.error("Write something first");
                                setSaving(true);
                                await onSubmit({ kind: "written", message: msg });
                                setSaving(false);
                                setMsg("");
                            }}
                            data-testid="faculty-review-submit-btn"
                            className="cyn-btn-primary rounded-md px-4 py-2 text-xs uppercase tracking-[0.22em] inline-flex items-center gap-2"
                        >
                            {saving ? <Loader2 size={12} className="animate-spin" /> : <MessageSquareText size={12} />}
                            Post note
                        </button>
                    </div>
                </div>

                <StatusCard latestStatus={data.latest_status} onSubmit={onSubmit} />
                <RubricCard latestRubric={data.latest_rubric} rubric={data.rubric} onSubmit={onSubmit} />

                <History reviews={data.reviews} />
            </div>

            <div className="space-y-4">
                <CoverageResponsesCard reviews={data.reviews} onSubmit={onSubmit} />
                <CoheirCard />
            </div>
        </div>
    );
}

function StatusCard({ latestStatus, onSubmit }) {
    const [note, setNote] = useState("");
    const options = ["open", "revision_requested", "approved", "final"];
    return (
        <div className="glass rounded-xl p-5">
            <div className="text-[10px] uppercase tracking-[0.24em] text-white/40 mb-3">Milestone status</div>
            <div className="flex flex-wrap gap-2">
                {options.map((s) => {
                    const tone = STATUS_TONE[s];
                    const active = latestStatus === s;
                    return (
                        <button
                            key={s}
                            onClick={async () => {
                                if (!window.confirm(`Change status to ${tone.label}?`)) return;
                                await onSubmit({ kind: "status", status_value: s, message: note || null });
                                setNote("");
                            }}
                            data-testid={`faculty-status-${s}-btn`}
                            className={`text-[10px] uppercase tracking-[0.22em] px-3 py-1.5 rounded-full border ${tone.cls} ${active ? "ring-1 ring-white/20" : "opacity-70 hover:opacity-100"}`}
                        >
                            {tone.label}
                        </button>
                    );
                })}
            </div>
            <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional message for the status change"
                className="mt-3 w-full rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-2 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
            />
        </div>
    );
}

function RubricCard({ latestRubric, rubric, onSubmit }) {
    const initial = useMemo(() => {
        const base = {};
        (rubric?.competencies || []).forEach((c) => {
            base[c.key] = latestRubric?.rubric_scores?.[c.key] ?? 0;
        });
        return base;
    }, [rubric, latestRubric]);
    const [scores, setScores] = useState(initial);
    const [note, setNote] = useState(latestRubric?.message || "");
    useEffect(() => { setScores(initial); }, [initial]);

    const submit = async () => {
        const missing = (rubric?.competencies || []).find((c) => !scores[c.key]);
        if (missing) return toast.error(`Score every competency (missing: ${missing.label})`);
        await onSubmit({
            kind: "rubric",
            rubric_scores: scores,
            message: note || null,
            supersedes: latestRubric?.id || null,
        });
    };

    return (
        <div className="glass rounded-xl p-5" data-testid="faculty-rubric-card">
            <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">Rubric (1–5)</div>
                {latestRubric && <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Previous rubric will be preserved in history</div>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(rubric?.competencies || []).map((c) => (
                    <div key={c.key} className="flex items-center justify-between gap-3">
                        <div className="text-sm text-white/85">{c.label}</div>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button
                                    key={n}
                                    onClick={() => setScores((s) => ({ ...s, [c.key]: n }))}
                                    data-testid={`faculty-rubric-${c.key}-${n}`}
                                    className={`w-7 h-7 rounded-md text-xs font-medium border transition-colors ${
                                        scores[c.key] === n
                                            ? "bg-cynaiah-cyan text-black border-cynaiah-cyan"
                                            : "border-white/10 text-white/60 hover:border-white/30"
                                    }`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Rubric comment (optional)"
                className="mt-3 w-full rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-2 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
            />
            <div className="mt-3 flex items-center justify-end">
                <button
                    onClick={submit}
                    data-testid="faculty-rubric-submit-btn"
                    className="cyn-btn-primary rounded-md px-4 py-2 text-xs uppercase tracking-[0.22em] inline-flex items-center gap-2"
                >
                    <Star size={12} /> Save rubric
                </button>
            </div>
        </div>
    );
}

function CoverageResponsesCard({ reviews, onSubmit }) {
    const [target, setTarget] = useState("1");
    const [msg, setMsg] = useState("");
    const previous = reviews.filter((r) => r.kind === "coverage_response");
    return (
        <div className="glass rounded-xl p-5" data-testid="faculty-coverage-response-card">
            <div className="flex items-center gap-2 mb-3">
                <Sparkles size={12} className="text-cynaiah-gold" />
                <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">Respond to Coverage Coach</div>
            </div>
            <div className="text-sm text-white/70 mb-3">
                Every AI suggestion becomes a mentored conversation. Attach your response to a scene number.
            </div>
            <div className="flex items-center gap-2">
                <input
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="Scene #"
                    className="w-20 rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-2 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                />
                <input
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    placeholder="Your take on the AI's suggestion…"
                    data-testid="faculty-coverage-response-input"
                    className="flex-1 rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-2 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                />
                <button
                    onClick={async () => {
                        if (!msg.trim() || !target.trim()) return toast.error("Add scene # and message");
                        await onSubmit({
                            kind: "coverage_response",
                            message: msg,
                            target_ref: target,
                            target_type: "coverage_scene",
                        });
                        setMsg("");
                    }}
                    data-testid="faculty-coverage-response-submit"
                    className="cyn-btn-primary rounded-md px-3 py-2 text-xs uppercase tracking-[0.22em]"
                >
                    Post
                </button>
            </div>
            {previous.length > 0 && (
                <div className="mt-4 space-y-2">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Previous coverage notes</div>
                    {previous.slice(0, 4).map((r) => (
                        <div key={r.id} className={`text-sm ${r.superseded_by ? "text-white/40 line-through" : "text-white/80"}`}>
                            <span className="text-cynaiah-gold mr-2">SC {r.target_ref}</span> {r.message}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function CoheirCard() {
    return (
        <div className="glass rounded-xl p-5">
            <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">Mentor review</div>
            <div className="mt-2 text-sm text-white/70">
                External industry mentors will co-review here via <span className="text-white">COHEIR</span> once the integration spec ships. Every response will land in this same immutable log.
            </div>
            <div className="mt-3 text-[10px] uppercase tracking-[0.22em] text-white/40">Integration-ready · COHEIR</div>
        </div>
    );
}

function History({ reviews }) {
    if (!reviews || reviews.length === 0) {
        return (
            <div className="glass rounded-xl p-6 text-center text-white/55" data-testid="faculty-history-empty">
                No feedback yet. Your first note will become part of the immutable record.
            </div>
        );
    }
    return (
        <div className="glass rounded-xl p-5" data-testid="faculty-history">
            <div className="flex items-center gap-2 mb-3">
                <HistoryIcon size={13} className="text-white/60" />
                <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">Feedback history — append-only</div>
            </div>
            <div className="space-y-3">
                {reviews.map((r) => <ReviewRow key={r.id} r={r} />)}
            </div>
        </div>
    );
}

function ReviewRow({ r }) {
    const kt = KIND_TONE[r.kind] || KIND_TONE.written;
    const superseded = !!r.superseded_by;
    return (
        <div
            data-testid={`faculty-review-${r.id}`}
            className={`rounded-lg border p-3 ${superseded ? "border-white/[0.03] bg-white/[0.01] opacity-60" : "border-white/[0.06] bg-white/[0.02]"}`}
        >
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em]">
                <div className={`flex items-center gap-1.5 ${kt.cls}`}>
                    <kt.icon size={11} /> {kt.label}
                    {r.kind === "time_coded" && r.timestamp_seconds !== null && (
                        <span className="text-white/50">· {fmtTime(r.timestamp_seconds)}</span>
                    )}
                    {r.kind === "coverage_response" && r.target_ref && (
                        <span className="text-white/50">· SC {r.target_ref}</span>
                    )}
                    {r.kind === "status" && r.status_value && (
                        <span className="text-white/50">· {r.status_value.replace("_", " ")}</span>
                    )}
                </div>
                <div className="text-white/40">{new Date(r.created_at).toLocaleString()}</div>
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

// ------------------- Other Tabs (read-only for faculty) -------------------
function TreatmentTab({ scripts }) {
    const treatment = scripts.find((s) => s.kind === "treatment") || scripts.find((s) => s.kind === "logline") || scripts[0];
    return (
        <div className="px-8 md:px-12 py-6">
            {!treatment && <EmptyPanel label="No treatment yet." />}
            {treatment && (
                <div className="glass rounded-xl p-6">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">{treatment.kind}</div>
                    <div className="font-heading text-2xl text-white mt-1">{treatment.title}</div>
                    <div className="mt-4 whitespace-pre-wrap text-white/85 leading-relaxed font-mono text-sm">{treatment.content}</div>
                </div>
            )}
        </div>
    );
}

function StoryboardTab({ frames, reviews, onSubmit }) {
    if (!frames || frames.length === 0) return <div className="px-8 md:px-12 py-6"><EmptyPanel label="Storyboard empty." /></div>;
    const notesByFrame = (reviews || []).reduce((acc, r) => {
        if (r.kind !== "frame_feedback" || !r.target_ref) return acc;
        (acc[r.target_ref] ||= []).push(r);
        return acc;
    }, {});
    return (
        <div className="px-8 md:px-12 py-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {frames.map((f) => (
                <FacultyFrameCard
                    key={f.id}
                    frame={f}
                    notes={notesByFrame[f.id] || []}
                    onSubmit={onSubmit}
                />
            ))}
        </div>
    );
}

function FacultyFrameCard({ frame, notes, onSubmit }) {
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState("");
    const [saving, setSaving] = useState(false);
    const activeNotes = notes.filter((n) => !n.superseded_by);
    return (
        <div className="glass rounded-xl overflow-hidden" data-testid={`faculty-frame-${frame.id}`}>
            <div className="aspect-video bg-black overflow-hidden relative">
                {frame.image_url && <img src={frame.image_url} alt="" className="w-full h-full object-cover" />}
                {activeNotes.length > 0 && (
                    <div
                        className="absolute top-2 right-2 rounded-full bg-cynaiah-gold/90 text-black text-[10px] px-2 py-0.5 font-medium"
                        data-testid={`faculty-frame-note-count-${frame.id}`}
                    >
                        {activeNotes.length} note{activeNotes.length === 1 ? "" : "s"}
                    </div>
                )}
            </div>
            <div className="p-3">
                <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Frame {frame.order}</div>
                <div className="text-sm text-white/85 mt-1 line-clamp-2">{frame.description || frame.prompt || "—"}</div>

                {activeNotes.length > 0 && (
                    <div className="mt-3 space-y-1.5" data-testid={`faculty-frame-notes-${frame.id}`}>
                        {activeNotes.slice(0, 3).map((n) => (
                            <div key={n.id} className="text-[11px] text-white/70 border-l-2 border-cynaiah-gold/50 pl-2">
                                {n.message}
                            </div>
                        ))}
                    </div>
                )}

                {!open ? (
                    <button
                        onClick={() => setOpen(true)}
                        data-testid={`faculty-frame-note-btn-${frame.id}`}
                        className="mt-3 w-full text-center text-[10px] uppercase tracking-[0.22em] py-2 rounded-md border border-white/[0.08] bg-white/[0.03] text-white/75 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                        + Pin a note to this frame
                    </button>
                ) : (
                    <div className="mt-3">
                        <textarea
                            value={msg}
                            onChange={(e) => setMsg(e.target.value)}
                            placeholder="What should the student notice about this frame?"
                            data-testid={`faculty-frame-note-input-${frame.id}`}
                            className="w-full min-h-[70px] rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-2 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                        />
                        <div className="mt-2 flex items-center justify-end gap-2">
                            <button
                                onClick={() => { setOpen(false); setMsg(""); }}
                                className="text-[10px] uppercase tracking-[0.22em] text-white/50 hover:text-white px-3 py-1.5"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    if (!msg.trim()) return toast.error("Write something first");
                                    setSaving(true);
                                    await onSubmit({
                                        kind: "frame_feedback",
                                        message: msg,
                                        target_ref: frame.id,
                                        target_type: "storyboard_frame",
                                    });
                                    setSaving(false);
                                    setMsg("");
                                    setOpen(false);
                                }}
                                data-testid={`faculty-frame-note-submit-${frame.id}`}
                                className="cyn-btn-primary rounded-md px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] inline-flex items-center gap-1.5"
                            >
                                {saving ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                                Pin note
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ShotsTab({ scenes, shots }) {
    if (!scenes || scenes.length === 0) return <div className="px-8 md:px-12 py-6"><EmptyPanel label="No scenes logged." /></div>;
    return (
        <div className="px-8 md:px-12 py-6 space-y-4">
            {scenes.map((s) => {
                const sh = shots.filter((x) => x.scene_id === s.id);
                return (
                    <div key={s.id} className="glass rounded-xl p-5">
                        <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">Scene {s.number}</div>
                        <div className="font-heading text-lg text-white">{s.title}</div>
                        <div className="text-white/55 text-sm">{s.location || "—"} · {s.description || "—"}</div>
                        <div className="mt-3 rounded-md border border-white/[0.06] overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-white/[0.02] text-[10px] uppercase tracking-[0.22em] text-white/45">
                                    <tr>
                                        <th className="text-left px-3 py-2">#</th>
                                        <th className="text-left px-3 py-2">Size</th>
                                        <th className="text-left px-3 py-2">Move</th>
                                        <th className="text-left px-3 py-2">Description</th>
                                        <th className="text-left px-3 py-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sh.map((x) => (
                                        <tr key={x.id} className="border-t border-white/[0.04]">
                                            <td className="px-3 py-2 text-white/70 font-mono text-xs">{x.number}</td>
                                            <td className="px-3 py-2 text-white/85">{x.shot_size}</td>
                                            <td className="px-3 py-2 text-white/60">{x.camera_move}</td>
                                            <td className="px-3 py-2 text-white/85">{x.description}</td>
                                            <td className="px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-white/60">{x.status || "planned"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function RoughCutTab({ music, cues, reviews, onSubmit }) {
    const [ts, setTs] = useState(0);
    const [msg, setMsg] = useState("");
    const duration = music?.duration_seconds || 180;
    const timeCoded = reviews.filter((r) => r.kind === "time_coded");
    return (
        <div className="px-8 md:px-12 py-6 space-y-4">
            <div className="glass rounded-xl p-5">
                <div className="text-[10px] uppercase tracking-[0.24em] text-white/40 mb-3">Rough cut — {music?.title || "no track uploaded"}</div>
                <input
                    type="range"
                    min={0}
                    max={duration}
                    step={0.5}
                    value={ts}
                    onChange={(e) => setTs(parseFloat(e.target.value))}
                    data-testid="faculty-rough-cut-playhead"
                    className="w-full accent-cynaiah-cyan"
                />
                <div className="text-[11px] font-mono text-white/60 mt-1">Playhead {fmtTime(ts)} / {fmtTime(duration)}</div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <input
                        value={msg}
                        onChange={(e) => setMsg(e.target.value)}
                        placeholder="Time-coded note at current playhead…"
                        data-testid="faculty-time-coded-input"
                        className="flex-1 min-w-[260px] rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-2 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                    />
                    <button
                        onClick={async () => {
                            if (!msg.trim()) return toast.error("Write something first");
                            await onSubmit({ kind: "time_coded", message: msg, timestamp_seconds: ts, target_ref: "sync-studio", target_type: "rough_cut" });
                            setMsg("");
                        }}
                        data-testid="faculty-time-coded-submit"
                        className="cyn-btn-primary rounded-md px-4 py-2 text-xs uppercase tracking-[0.22em] inline-flex items-center gap-2"
                    >
                        <Timer size={12} /> Post at {fmtTime(ts)}
                    </button>
                </div>
            </div>

            <div className="glass rounded-xl p-5">
                <div className="text-[10px] uppercase tracking-[0.24em] text-white/40 mb-3">Time-coded notes so far</div>
                {timeCoded.length === 0 && <div className="text-white/55 text-sm">No time-coded notes yet.</div>}
                <div className="space-y-2">
                    {timeCoded.map((r) => (
                        <div key={r.id} className={`flex items-start gap-3 text-sm ${r.superseded_by ? "text-white/40 line-through" : "text-white/85"}`}>
                            <button
                                onClick={() => setTs(r.timestamp_seconds || 0)}
                                className="font-mono text-cynaiah-cyan hover:text-white transition-colors w-14 shrink-0"
                            >
                                {fmtTime(r.timestamp_seconds)}
                            </button>
                            <div>{r.message}</div>
                        </div>
                    ))}
                </div>
            </div>

            {cues && cues.length > 0 && (
                <div className="glass rounded-xl p-5">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/40 mb-3">Student's sync cues (read-only)</div>
                    <div className="space-y-1.5">
                        {cues.map((c) => (
                            <div key={c.id} className="flex items-center gap-3 text-sm text-white/80">
                                <span className="font-mono text-white/50 w-14">{fmtTime(c.timestamp)}</span>
                                <span className="uppercase text-[10px] tracking-[0.22em] text-cynaiah-cyan w-16">{c.type}</span>
                                <span>{c.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function RightsTab({ rights }) {
    return (
        <div className="px-8 md:px-12 py-6">
            {(!rights || rights.length === 0) && <EmptyPanel label="No rights records yet." />}
            <div className="glass rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-white/[0.03] text-[10px] uppercase tracking-[0.22em] text-white/45">
                        <tr>
                            <th className="text-left px-4 py-3">Contributor</th>
                            <th className="text-left px-4 py-3">Role</th>
                            <th className="text-left px-4 py-3">Ownership</th>
                            <th className="text-left px-4 py-3">Consent</th>
                            <th className="text-left px-4 py-3">AI disclosure</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rights.map((r) => (
                            <tr key={r.id} className="border-t border-white/[0.04]">
                                <td className="px-4 py-3 text-white/85">{r.contributor_name || r.name}</td>
                                <td className="px-4 py-3 text-white/70">{r.role}</td>
                                <td className="px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-cynaiah-violet">{r.ownership_type}</td>
                                <td className="px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-emerald-300">{r.consent_recorded ? "yes" : "—"}</td>
                                <td className="px-4 py-3 text-white/70">{r.ai_disclosure || "—"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function BudgetTab({ budget }) {
    const total = (budget || []).reduce((s, i) => s + Number(i.amount || 0), 0);
    const spent = (budget || []).reduce((s, i) => s + Number(i.spent || 0), 0);
    return (
        <div className="px-8 md:px-12 py-6 space-y-4">
            <div className="glass rounded-xl p-5 flex flex-wrap items-center gap-6">
                <div>
                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">Planned</div>
                    <div className="font-heading text-2xl text-white">{money(total)}</div>
                </div>
                <div>
                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">Spent</div>
                    <div className="font-heading text-2xl text-cynaiah-orange">{money(spent)}</div>
                </div>
                <div className="flex-1 min-w-[220px]">
                    <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                        <div className="h-full cyn-bg-gradient" style={{ width: `${total ? Math.min(100, (spent / total) * 100) : 0}%` }} />
                    </div>
                </div>
            </div>
            {(budget || []).length === 0 && <EmptyPanel label="Budget not started." />}
            {(budget || []).length > 0 && (
                <div className="glass rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-white/[0.03] text-[10px] uppercase tracking-[0.22em] text-white/45">
                            <tr>
                                <th className="text-left px-4 py-3">Line</th>
                                <th className="text-left px-4 py-3">Category</th>
                                <th className="text-left px-4 py-3">Vendor</th>
                                <th className="text-right px-4 py-3">Planned</th>
                                <th className="text-right px-4 py-3">Spent</th>
                            </tr>
                        </thead>
                        <tbody>
                            {budget.map((b) => (
                                <tr key={b.id} className="border-t border-white/[0.04]">
                                    <td className="px-4 py-3 text-white/85">{b.line}</td>
                                    <td className="px-4 py-3 text-white/70">{b.category || "—"}</td>
                                    <td className="px-4 py-3 text-white/70">{b.vendor || "—"}</td>
                                    <td className="px-4 py-3 text-right text-white/85">{money(b.amount)}</td>
                                    <td className="px-4 py-3 text-right text-cynaiah-orange">{money(b.spent)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function EmptyPanel({ label }) {
    return <div className="glass rounded-xl p-10 text-center text-white/55">{label}</div>;
}
