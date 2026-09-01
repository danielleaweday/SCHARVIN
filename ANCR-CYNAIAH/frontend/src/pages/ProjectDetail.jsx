import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, resolveAssetUrl } from "@/lib/api";
import { toast } from "sonner";
import TopBar from "@/components/cynaiah/TopBar";
import { TID } from "@/constants/testIds";
import { STATUS_LABEL, STATUS_TONE, STATUSES, TYPE_LABEL } from "@/lib/constants";
import {
    Users,
    Clock,
    DollarSign,
    Wand2,
    BookOpen,
    Sparkles,
    ShieldCheck,
    AudioWaveform,
    ArrowLeft,
    Trash2,
    Film,
    Layers,
    ClipboardList,
    CalendarDays,
    MessageSquareText,
    Music,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const QuickLink = ({ to, icon: Icon, label, blurb, tone = "text-cynaiah-cyan" }) => {
    const nav = useNavigate();
    return (
        <button
            onClick={() => nav(to)}
            className="glass rounded-xl p-5 lift glass-hover flex items-start gap-4 text-left w-full"
        >
            <div className={`w-10 h-10 rounded-md bg-white/[0.05] flex items-center justify-center ${tone}`}>
                <Icon size={18} />
            </div>
            <div className="min-w-0">
                <div className="text-white font-heading text-base">{label}</div>
                <div className="text-white/50 text-xs mt-1">{blurb}</div>
            </div>
        </button>
    );
};

const CountTile = ({ icon: Icon, label, value, tone }) => (
    <div className="glass rounded-xl p-4 flex items-start justify-between glass-hover">
        <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                {label}
            </div>
            <div className="mt-1 font-heading text-2xl text-white">{value}</div>
        </div>
        <div className={`w-9 h-9 rounded-md flex items-center justify-center ${tone}`}>
            <Icon size={16} strokeWidth={1.5} />
        </div>
    </div>
);

export default function ProjectDetail() {
    const { id } = useParams();
    const nav = useNavigate();
    const [data, setData] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.post(`/projects/${id}/command-center`);
                setData(data);
            } catch (e) {
                toast.error("Could not load project");
                nav("/projects");
            }
        })();
    }, [id, nav]);

    if (!data)
        return <div className="p-10 text-white/60 animate-pulse">Loading command center…</div>;

    const {
        project,
        scripts,
        storyboard_frames,
        mood_board,
        rights,
        feedback,
        sync_cues,
        music,
        events,
        counts,
    } = data;

    const updateStatus = async (status) => {
        const { data } = await api.patch(`/projects/${id}`, { status });
        setData((s) => ({ ...s, project: data }));
        toast.success(`Status updated to ${STATUS_LABEL[status]}`);
    };

    const remove = async () => {
        if (!window.confirm(`Delete “${project.title}”?`)) return;
        await api.delete(`/projects/${id}`);
        toast.success("Project deleted");
        nav("/projects");
    };

    return (
        <div data-testid={TID.projectDetail}>
            <TopBar
                subtitle={`${TYPE_LABEL[project.type]} · Command Center`}
                title={project.title}
                actions={
                    <button
                        onClick={() => nav("/projects")}
                        className="cyn-btn-ghost rounded-md px-3 py-2 text-sm flex items-center gap-2"
                    >
                        <ArrowLeft size={14} /> All projects
                    </button>
                }
            />

            {/* Hero */}
            <div className="relative border-b border-white/[0.05] cyn-noise">
                <img
                    src={project.thumbnail_url}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-45"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/70 to-transparent" />
                <div className="cyn-hero-glow animate-beam-drift" />

                <div className="relative px-8 md:px-12 py-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-end">
                    <div className="max-w-2xl">
                        <div
                            className={`flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] ${STATUS_TONE[project.status]}`}
                        >
                            <span className="status-dot" />
                            {STATUS_LABEL[project.status]}
                        </div>
                        <p className="mt-4 text-white/80 text-base md:text-lg leading-relaxed">
                            {project.story_concept || project.objective}
                        </p>
                        <div className="mt-6 flex flex-wrap gap-4 text-xs text-white/65">
                            <span className="inline-flex items-center gap-1.5">
                                <Users size={13} />
                                {project.collaborators?.join(", ") || "Solo"}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <Clock size={13} /> {project.timeline || "—"}
                            </span>
                            {project.budget && (
                                <span className="inline-flex items-center gap-1.5">
                                    <DollarSign size={13} /> ${project.budget.toLocaleString()}
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1.5">
                                <Wand2 size={13} />
                                {(project.ai_workflow || "hybrid").replace("_", " ")}
                            </span>
                        </div>
                    </div>

                    <div className="glass rounded-xl p-5 min-w-[260px]">
                        <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                            Progress
                        </div>
                        <div className="font-heading text-4xl font-light mt-1 mb-3">
                            {project.progress}%
                        </div>
                        <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                            <div
                                className="h-full cyn-bg-gradient"
                                style={{ width: `${project.progress}%` }}
                            />
                        </div>
                        <Select value={project.status} onValueChange={updateStatus}>
                            <SelectTrigger className="mt-4 bg-white/[0.03] border-white/[0.08] text-white text-sm h-9">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0A0A0C] border-white/10 text-white">
                                {STATUSES.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {STATUS_LABEL[s]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Counts strip */}
            <div className="px-8 md:px-12 pt-6 grid grid-cols-2 md:grid-cols-6 gap-3">
                <CountTile icon={ClipboardList} label="Scripts" value={counts.scripts} tone="bg-cynaiah-cyan/15 text-cynaiah-cyan" />
                <CountTile icon={Film} label="Storyboard frames" value={counts.frames} tone="bg-cynaiah-violet/20 text-cynaiah-violet" />
                <CountTile icon={Layers} label="Assets" value={counts.assets} tone="bg-cynaiah-magenta/15 text-cynaiah-magenta" />
                <CountTile icon={AudioWaveform} label="Sync cues" value={counts.cues} tone="bg-cynaiah-orange/15 text-cynaiah-orange" />
                <CountTile icon={ShieldCheck} label="Rights" value={counts.rights} tone="bg-cynaiah-gold/15 text-cynaiah-gold" />
                <CountTile icon={Users} label="Collaborators" value={counts.collaborators} tone="bg-emerald-500/15 text-emerald-300" />
            </div>

            {/* Command Center quick links */}
            <div className="px-8 md:px-12 pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickLink to="/story-lab" icon={BookOpen} label="Story Lab" blurb="Treatments · scripts · storyboards" />
                <QuickLink to="/ai-visual-lab" icon={Sparkles} label="AI Visual Lab" blurb="Text-to-image · mood boards" tone="text-cynaiah-magenta" />
                <QuickLink to="/sync-studio" icon={AudioWaveform} label="Sync Studio" blurb="Waveform · cues · beats" tone="text-cynaiah-violet" />
                <QuickLink to="/rights-credits" icon={ShieldCheck} label="Rights & Credits" blurb="Contributors · AI · licensing" tone="text-cynaiah-gold" />
            </div>

            {/* Storyboard strip */}
            {storyboard_frames?.length > 0 && (
                <section className="px-8 md:px-12 pt-10">
                    <div className="flex items-end justify-between mb-4">
                        <div>
                            <div className="text-[10px] uppercase tracking-[0.28em] text-white/40">
                                Storyboard
                            </div>
                            <h3 className="font-heading text-xl mt-1">
                                {storyboard_frames.length} frame{storyboard_frames.length !== 1 && "s"}
                            </h3>
                        </div>
                        <button
                            onClick={() => nav("/story-lab")}
                            className="text-[12px] uppercase tracking-[0.22em] text-white/50 hover:text-white"
                        >
                            Open in Story Lab →
                        </button>
                    </div>
                    <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-3 -mx-8 px-8 md:-mx-12 md:px-12">
                        {storyboard_frames.map((f) => (
                            <div
                                key={f.id}
                                className="shrink-0 w-56 rounded-lg overflow-hidden border border-white/[0.06] bg-black/40 hover:border-cynaiah-cyan/50 transition-colors"
                            >
                                <div className="aspect-[16/10] bg-black/40 relative">
                                    {f.image_url ? (
                                        <img
                                            src={resolveAssetUrl(f.image_url)}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">
                                            No image
                                        </div>
                                    )}
                                    <div className="absolute top-2 left-2 text-[10px] uppercase tracking-[0.2em] px-1.5 py-0.5 rounded bg-black/70 border border-white/10 text-white/70 font-mono">
                                        #{String(f.order + 1).padStart(2, "0")} · {f.shot_type}
                                    </div>
                                </div>
                                <div className="p-3">
                                    <div className="text-[13px] text-white/85 line-clamp-2">
                                        {f.caption}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Sync + Music */}
            {music && sync_cues?.length > 0 && (
                <section className="px-8 md:px-12 pt-10">
                    <div className="glass rounded-xl p-5">
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="w-10 h-10 rounded-md cyn-bg-gradient flex items-center justify-center">
                                <Music className="text-white" size={16} />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                                    {music.ownership} music · via ANCRLAB
                                </div>
                                <div className="font-heading text-lg text-white">
                                    {music.title} · <span className="text-white/60">{music.artist}</span>
                                </div>
                            </div>
                            <div className="ml-auto text-[11px] uppercase tracking-[0.22em] text-white/50">
                                {sync_cues.length} cues
                            </div>
                            <button
                                onClick={() => nav("/sync-studio")}
                                className="cyn-btn-ghost rounded-md px-3 py-2 text-xs"
                            >
                                Open Sync Studio
                            </button>
                        </div>
                        <div className="mt-4 flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                            {sync_cues.map((c) => (
                                <div
                                    key={c.id}
                                    className="shrink-0 w-40 rounded-md border border-white/[0.06] p-2 bg-white/[0.02]"
                                >
                                    <div className="aspect-[16/10] rounded bg-black/40 mb-2 relative overflow-hidden">
                                        {c.asset_url ? (
                                            <img
                                                src={resolveAssetUrl(c.asset_url)}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white/25 text-[10px]">
                                                — no visual —
                                            </div>
                                        )}
                                        <div className="absolute bottom-1 left-1 font-mono text-[10px] px-1.5 py-0.5 bg-black/70 rounded text-white/80">
                                            {Math.floor(c.timestamp / 60)}:
                                            {String(Math.floor(c.timestamp % 60)).padStart(2, "0")}
                                        </div>
                                    </div>
                                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                                        {c.type}
                                    </div>
                                    <div className="text-[12px] text-white/85 leading-tight line-clamp-2">
                                        {c.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Two-col: brief + right rail */}
            <div className="px-8 md:px-12 py-10 grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    <div className="glass rounded-xl p-6">
                        <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                            Creative brief
                        </div>
                        <dl className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            {[
                                ["Objective", project.objective],
                                ["Audience", project.audience],
                                ["Format", project.format],
                                ["Visual style", project.visual_style],
                                ["Music", project.music_selection],
                                ["Approach", project.production_approach],
                                ["AI workflow", project.ai_workflow],
                                ["AI disclosure", project.disclosure_notes],
                            ].map(([k, v]) => (
                                <div
                                    key={k}
                                    className="border-b border-white/[0.05] pb-2 last:border-0"
                                >
                                    <dt className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                                        {k}
                                    </dt>
                                    <dd className="text-white/85 mt-1">{v || "—"}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    {/* Mood board strip */}
                    {mood_board?.length > 0 && (
                        <div className="glass rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                                        Mood board
                                    </div>
                                    <h3 className="font-heading text-lg mt-1">
                                        {mood_board.length} references
                                    </h3>
                                </div>
                                <button
                                    onClick={() => nav("/ai-visual-lab")}
                                    className="text-[12px] uppercase tracking-[0.22em] text-white/50 hover:text-white"
                                >
                                    Add via AI Visual Lab →
                                </button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {mood_board.slice(0, 8).map((a) => (
                                    <div
                                        key={a.id}
                                        className="relative rounded-md overflow-hidden border border-white/[0.06] aspect-[4/3] group"
                                    >
                                        <img
                                            src={resolveAssetUrl(a.url)}
                                            alt=""
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        {a.source === "ai_generated" && (
                                            <div className="absolute top-1 left-1 text-[9px] uppercase tracking-[0.18em] px-1 py-0.5 rounded bg-cynaiah-magenta/25 border border-cynaiah-magenta/40 text-cynaiah-magenta">
                                                AI
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right rail */}
                <div className="space-y-6">
                    <div className="glass rounded-xl p-6">
                        <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                            Story documents
                        </div>
                        <div className="mt-3 space-y-2">
                            {scripts.length === 0 && (
                                <div className="text-white/50 text-sm">No documents yet.</div>
                            )}
                            {scripts.map((s) => (
                                <div
                                    key={s.id}
                                    className="rounded-md border border-white/[0.05] p-3 bg-white/[0.02]"
                                >
                                    <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                                        {s.kind} · v{s.version}
                                    </div>
                                    <div className="text-white text-sm truncate">{s.title}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-3">
                            <CalendarDays size={13} className="text-cynaiah-cyan" />
                            <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                                On the calendar
                            </div>
                        </div>
                        <div className="space-y-2">
                            {events.length === 0 && (
                                <div className="text-white/50 text-sm">
                                    Nothing scheduled.
                                </div>
                            )}
                            {events.map((e) => (
                                <div
                                    key={e.id}
                                    className="text-sm border-l-2 border-cynaiah-cyan/40 pl-3 py-1"
                                >
                                    <div className="font-mono text-[11px] text-white/50">
                                        {new Date(e.date).toLocaleDateString(undefined, {
                                            month: "short",
                                            day: "2-digit",
                                        })}{" "}
                                        · {e.kind}
                                    </div>
                                    <div className="text-white/85">{e.title}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-3">
                            <ShieldCheck size={13} className="text-cynaiah-gold" />
                            <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                                Rights snapshot
                            </div>
                        </div>
                        <div className="space-y-2">
                            {rights.slice(0, 5).map((r) => (
                                <div
                                    key={r.id}
                                    className="flex items-center justify-between text-sm border-b border-white/[0.04] pb-2 last:border-0"
                                >
                                    <span className="text-white/80 truncate mr-2">
                                        {r.contributor_name}
                                    </span>
                                    <span
                                        className={`text-[10px] uppercase tracking-[0.2em] ${
                                            r.ownership_type === "ai_tool"
                                                ? "text-cynaiah-magenta"
                                                : "text-white/45"
                                        }`}
                                    >
                                        {r.ownership_type}
                                    </span>
                                </div>
                            ))}
                            {rights.length === 0 && (
                                <div className="text-white/50 text-sm">None logged.</div>
                            )}
                        </div>
                    </div>

                    <div className="glass rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-3">
                            <MessageSquareText
                                size={13}
                                className="text-cynaiah-magenta"
                            />
                            <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                                Feedback
                            </div>
                        </div>
                        <div className="space-y-3">
                            {feedback.length === 0 && (
                                <div className="text-white/50 text-sm">No feedback yet.</div>
                            )}
                            {feedback.map((f) => (
                                <div
                                    key={f.id}
                                    className="rounded-md bg-white/[0.02] border border-white/[0.05] p-3"
                                >
                                    <div className="text-sm text-white/85 leading-snug">
                                        “{f.message}”
                                    </div>
                                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 mt-1.5">
                                        — {f.author_name} · {f.author_role}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={remove}
                        className="w-full rounded-md border border-red-500/30 bg-red-500/10 hover:bg-red-500/15 text-red-300 py-2.5 text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                        <Trash2 size={14} /> Delete project
                    </button>
                </div>
            </div>
        </div>
    );
}
