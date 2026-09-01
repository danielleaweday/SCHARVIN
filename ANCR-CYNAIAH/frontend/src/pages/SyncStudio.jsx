import { useEffect, useState } from "react";
import { api, resolveAssetUrl } from "@/lib/api";
import { toast } from "sonner";
import TopBar from "@/components/cynaiah/TopBar";
import { TID } from "@/constants/testIds";
import {
    Plus,
    Trash2,
    Music,
    Play,
    Pause,
    ShieldCheck,
    Sparkles,
    ImagePlus,
    Loader2,
    X,
    Wand2,
    Film,
    Upload,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import RoughCutPreview from "@/components/cynaiah/RoughCutPreview";
import SyncAutopilotPanel from "@/components/cynaiah/SyncAutopilotPanel";

const CUE_TYPES = ["beat", "cut", "lyric", "emotion", "transition", "scene"];
const CUE_COLOR = {
    beat: "text-cynaiah-cyan",
    cut: "text-cynaiah-magenta",
    lyric: "text-cynaiah-gold",
    emotion: "text-cynaiah-violet",
    transition: "text-cynaiah-orange",
    scene: "text-white/80",
};

const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
};

export default function SyncStudio() {
    const [projects, setProjects] = useState([]);
    const [projectId, setProjectId] = useState("");
    const [track, setTrack] = useState(null);
    const [cues, setCues] = useState([]);
    const [assets, setAssets] = useState([]);
    const [playhead, setPlayhead] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [newLabel, setNewLabel] = useState("");
    const [newType, setNewType] = useState("beat");

    // Attach dialog
    const [attachFor, setAttachFor] = useState(null); // cue object
    const [aiPrompt, setAiPrompt] = useState("");
    const [aiBusy, setAiBusy] = useState(false);

    // Rough cut modal
    const [roughCutOpen, setRoughCutOpen] = useState(false);

    // Autopilot panel visibility
    const [autopilotOpen, setAutopilotOpen] = useState(false);

    const project = projects.find((p) => p.id === projectId);

    useEffect(() => {
        api.get("/projects").then((r) => {
            setProjects(r.data);
            const mv = r.data.find((p) => p.type === "music_video") || r.data[0];
            if (mv) setProjectId(mv.id);
        });
    }, []);

    useEffect(() => {
        if (!projectId) return;
        Promise.all([
            api.get(`/projects/${projectId}/music`),
            api.get(`/projects/${projectId}/cues`),
            api.get(`/assets?project_id=${projectId}`),
        ]).then(([m, c, a]) => {
            setTrack(m.data);
            setCues(c.data);
            setAssets(a.data);
            setPlayhead(0);
        });
    }, [projectId]);

    useEffect(() => {
        if (!playing || !track) return;
        const start = performance.now() - playhead * 1000;
        let raf;
        const step = () => {
            const t = (performance.now() - start) / 1000;
            if (t >= track.duration_seconds) {
                setPlaying(false);
                setPlayhead(track.duration_seconds);
                return;
            }
            setPlayhead(t);
            raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [playing, track]);

    const duration = track?.duration_seconds || 180;

    const addCue = async () => {
        if (!newLabel.trim()) return toast.error("Label required.");
        const { data } = await api.post("/cues", {
            project_id: projectId,
            timestamp: Math.min(playhead, duration - 0.1),
            label: newLabel,
            type: newType,
        });
        setCues((cs) => [...cs, data].sort((a, b) => a.timestamp - b.timestamp));
        setNewLabel("");
    };

    const delCue = async (id) => {
        await api.delete(`/cues/${id}`);
        setCues((cs) => cs.filter((c) => c.id !== id));
    };

    const attachAsset = async (cue, asset) => {
        const { data } = await api.patch(`/cues/${cue.id}`, {
            asset_id: asset.id,
            asset_url: asset.url,
        });
        setCues((cs) => cs.map((c) => (c.id === data.id ? data : c)));
        setAttachFor(null);
        toast.success("Visual attached.");
    };

    const detachAsset = async (cue) => {
        // send explicit nulls — backend PATCH skips None; use sentinel string trick: overwrite with empty
        // easier: patch to empty strings then treat as null in UI
        await api.patch(`/cues/${cue.id}`, { asset_id: "", asset_url: "" });
        setCues((cs) =>
            cs.map((c) => (c.id === cue.id ? { ...c, asset_id: null, asset_url: null } : c)),
        );
    };

    const generateForCue = async (cue) => {
        if (!aiPrompt.trim()) return toast.error("Describe the shot.");
        setAiBusy(true);
        try {
            const { data } = await api.post("/ai/image", {
                prompt: `${aiPrompt}. Sync moment: "${cue.label}" (${cue.type}) at ${fmt(cue.timestamp)}.`,
                style: "cinematic music-video still",
                save_as_asset: true,
                project_id: projectId,
                tags: ["sync-cue"],
            });
            const asset = data.saved_asset;
            if (asset) {
                setAssets((a) => [asset, ...a]);
                await attachAsset(cue, asset);
            }
            toast.success("Cue visual generated.");
            setAiPrompt("");
        } catch (e) {
            toast.error(e?.response?.data?.detail || "Generation failed");
        } finally {
            setAiBusy(false);
        }
    };

    const waveform = track?.waveform || [];

    return (
        <div>
            <TopBar
                subtitle="Sync Studio"
                title="Where music meets moving image"
                actions={
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setAutopilotOpen((s) => !s)}
                            className={`cyn-btn-ghost rounded-md px-3 py-2 text-sm flex items-center gap-2 ${autopilotOpen ? "border-cynaiah-cyan/50" : ""}`}
                        >
                            <Wand2 size={13} /> Autopilot
                        </button>
                        <button
                            onClick={() => setRoughCutOpen(true)}
                            disabled={!cues.some((c) => c.asset_url)}
                            className="cyn-btn-primary rounded-md px-3 py-2 text-sm flex items-center gap-2 disabled:opacity-50"
                            title="Play cue visuals in real time"
                        >
                            <Film size={13} /> Rough cut
                        </button>
                        <Select value={projectId} onValueChange={setProjectId}>
                            <SelectTrigger className="w-[220px] bg-white/[0.03] border-white/[0.08] text-white">
                                <SelectValue placeholder="Project" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0A0A0C] border-white/10 text-white">
                                {projects.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                }
            />

            <div className="px-8 md:px-12 py-8 space-y-6">
                {/* Autopilot */}
                {autopilotOpen && (
                    <SyncAutopilotPanel
                        projectId={projectId}
                        onAccepted={(cue) =>
                            setCues((cs) =>
                                [...cs, cue].sort((a, b) => a.timestamp - b.timestamp),
                            )
                        }
                    />
                )}

                {/* Track info */}
                <div className="glass rounded-xl p-6 flex flex-wrap items-center gap-6">
                    <div className="w-14 h-14 rounded-lg cyn-bg-gradient flex items-center justify-center">
                        <Music className="text-white" size={22} />
                    </div>
                    <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                            {track?.ownership} music · via ANCRLAB
                        </div>
                        <div className="font-heading text-2xl text-white mt-1">
                            {track?.title || "—"}
                        </div>
                        <div className="text-white/50 text-sm">{track?.artist}</div>
                        <div className="text-[10px] uppercase tracking-[0.22em] mt-1">
                            {track?.music_url ? (
                                <span className="text-emerald-300">Audio attached</span>
                            ) : (
                                <span className="text-cynaiah-orange">No audio — upload to enable playback</span>
                            )}
                        </div>
                    </div>
                    <div className="ml-auto text-right">
                        <div className="font-mono text-2xl text-white">
                            {fmt(playhead)}{" "}
                            <span className="text-white/40 text-base">
                                / {fmt(duration)}
                            </span>
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.22em] text-white/40 mt-1">
                            {cues.length} cues · {cues.filter((c) => c.asset_url).length} with visuals
                        </div>
                    </div>
                    <label className="cyn-btn-ghost rounded-md px-3 py-2 text-sm flex items-center gap-2 cursor-pointer">
                        <Upload size={13} /> Upload audio
                        <input
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file || !projectId) return;
                                const fd = new FormData();
                                fd.append("file", file);
                                try {
                                    const r = await fetch(
                                        `${process.env.REACT_APP_BACKEND_URL}/api/projects/${projectId}/music/upload`,
                                        {
                                            method: "POST",
                                            headers: { Authorization: `Bearer ${localStorage.getItem("cynaiah_token")}` },
                                            body: fd,
                                        },
                                    );
                                    if (!r.ok) throw new Error("upload failed");
                                    const data = await r.json();
                                    setTrack(data);
                                    toast.success("Audio uploaded. Ready for rough-cut playback.");
                                } catch (err) {
                                    toast.error("Audio upload failed");
                                }
                                e.target.value = "";
                            }}
                        />
                    </label>
                    <button
                        onClick={() => setPlaying((p) => !p)}
                        className="cyn-btn-primary rounded-full w-12 h-12 flex items-center justify-center"
                    >
                        {playing ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                </div>

                {/* Waveform */}
                <div className="glass rounded-xl p-6" data-testid={TID.syncWaveform}>
                    <div className="relative h-44 rounded-lg bg-black/50 border border-white/[0.06] overflow-hidden">
                        <div className="absolute inset-0 flex items-center gap-[2px] px-3">
                            {waveform.map((v, i) => (
                                <div
                                    key={i}
                                    className="flex-1 min-w-[2px] rounded-sm"
                                    style={{
                                        height: `${Math.max(6, v * 100)}%`,
                                        background: `linear-gradient(180deg,
                                            rgba(6,182,212,0.9) 0%,
                                            rgba(109,40,217,0.85) 60%,
                                            rgba(219,39,119,0.85) 100%)`,
                                        opacity:
                                            i / waveform.length <= playhead / duration ? 1 : 0.35,
                                    }}
                                />
                            ))}
                        </div>

                        {/* Cue markers */}
                        {cues.map((c) => {
                            const left = (c.timestamp / duration) * 100;
                            return (
                                <div
                                    key={c.id}
                                    className="absolute top-0 bottom-0 -translate-x-1/2 pointer-events-none"
                                    style={{ left: `${left}%` }}
                                >
                                    <div className="w-px h-full bg-white/50" />
                                    <div
                                        className={`absolute top-1 -translate-x-1/2 whitespace-nowrap text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded bg-black/70 border border-white/10 flex items-center gap-1 ${CUE_COLOR[c.type]}`}
                                    >
                                        {c.asset_url && (
                                            <img
                                                src={resolveAssetUrl(c.asset_url)}
                                                alt=""
                                                className="w-4 h-4 rounded-sm object-cover"
                                            />
                                        )}
                                        {c.label}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Playhead */}
                        <div
                            className="absolute top-0 bottom-0 w-0.5 bg-cynaiah-cyan shadow-[0_0_10px_rgba(6,182,212,0.7)]"
                            style={{ left: `${(playhead / duration) * 100}%` }}
                        />

                        {/* Click track */}
                        <div
                            className="absolute inset-0 cursor-pointer"
                            onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = (e.clientX - rect.left) / rect.width;
                                setPlayhead(Math.max(0, Math.min(duration, x * duration)));
                            }}
                        />
                    </div>
                </div>

                {/* Cue-visual storyboard strip */}
                {cues.length > 0 && (
                    <div className="glass rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                                Storyboard from music
                            </div>
                            <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                                {cues.filter((c) => c.asset_url).length} / {cues.length} with
                                visuals
                            </div>
                        </div>
                        <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2">
                            {cues.map((c) => (
                                <div
                                    key={c.id}
                                    className="shrink-0 w-44 rounded-md border border-white/[0.06] p-2 bg-white/[0.02] hover:border-white/20 transition-colors"
                                >
                                    <div className="aspect-[16/10] rounded bg-black/40 mb-2 relative overflow-hidden">
                                        {c.asset_url ? (
                                            <img
                                                src={resolveAssetUrl(c.asset_url)}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <button
                                                onClick={() => setAttachFor(c)}
                                                className="w-full h-full flex flex-col items-center justify-center gap-1 text-white/40 hover:text-cynaiah-cyan hover:bg-cynaiah-cyan/5 transition-colors"
                                            >
                                                <ImagePlus size={16} />
                                                <span className="text-[10px] uppercase tracking-[0.22em]">
                                                    Attach visual
                                                </span>
                                            </button>
                                        )}
                                        <div className="absolute bottom-1 left-1 font-mono text-[10px] px-1.5 py-0.5 bg-black/70 rounded text-white/80">
                                            {fmt(c.timestamp)}
                                        </div>
                                    </div>
                                    <div
                                        className={`text-[10px] uppercase tracking-[0.2em] ${CUE_COLOR[c.type]}`}
                                    >
                                        {c.type}
                                    </div>
                                    <div className="text-[12px] text-white/85 leading-tight line-clamp-2">
                                        {c.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Cue creator + list */}
                <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
                    <div className="glass rounded-xl p-5 h-fit">
                        <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                            Add cue at {fmt(playhead)}
                        </div>
                        <input
                            data-testid={TID.syncCueLabel}
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            placeholder="Label — e.g. 'Chorus enters'"
                            className="mt-3 w-full rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                        />
                        <label className="mt-3 block text-[11px] uppercase tracking-[0.22em] text-white/45">
                            Type
                        </label>
                        <Select value={newType} onValueChange={setNewType}>
                            <SelectTrigger
                                data-testid={TID.syncCueType}
                                className="mt-2 bg-white/[0.03] border-white/[0.08] text-white"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0A0A0C] border-white/10 text-white">
                                {CUE_TYPES.map((t) => (
                                    <SelectItem key={t} value={t}>
                                        {t}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <button
                            data-testid={TID.syncCueAdd}
                            onClick={addCue}
                            className="cyn-btn-primary mt-4 w-full rounded-md px-4 py-2.5 text-sm flex items-center justify-center gap-2"
                        >
                            <Plus size={14} /> Add cue
                        </button>

                        <div className="mt-6 rounded-md border border-cynaiah-gold/30 bg-cynaiah-gold/[0.06] p-3 flex items-start gap-2">
                            <ShieldCheck size={14} className="text-cynaiah-gold mt-0.5" />
                            <div className="text-xs text-white/70 leading-relaxed">
                                Sync also anchors your music rights. Log ownership under
                                Rights & Credits before submitting to INHEIRA.
                            </div>
                        </div>
                    </div>

                    <div className="glass rounded-xl p-5">
                        <div className="text-[10px] uppercase tracking-[0.24em] text-white/40 mb-3">
                            Cue sheet
                        </div>
                        <div className="max-h-[480px] overflow-y-auto custom-scrollbar">
                            {cues.length === 0 && (
                                <div className="text-white/50 text-sm py-8 text-center">
                                    No cues yet. Drop your first marker.
                                </div>
                            )}
                            {cues.map((c) => (
                                <div
                                    key={c.id}
                                    className="flex items-center gap-4 py-3 border-b border-white/[0.04] last:border-0"
                                >
                                    <div className="w-14 h-10 rounded-sm bg-black/40 border border-white/5 overflow-hidden shrink-0">
                                        {c.asset_url ? (
                                            <img
                                                src={resolveAssetUrl(c.asset_url)}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white/25">
                                                <ImagePlus size={12} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="font-mono text-[13px] w-14 text-white/70">
                                        {fmt(c.timestamp)}
                                    </div>
                                    <div
                                        className={`text-[10px] uppercase tracking-[0.22em] w-24 ${CUE_COLOR[c.type]}`}
                                    >
                                        {c.type}
                                    </div>
                                    <div className="flex-1 text-sm text-white/85 truncate">
                                        {c.label}
                                    </div>
                                    <button
                                        onClick={() => setPlayhead(c.timestamp)}
                                        className="text-[11px] uppercase tracking-[0.2em] text-white/50 hover:text-white"
                                    >
                                        Go
                                    </button>
                                    <button
                                        onClick={() => setAttachFor(c)}
                                        title="Attach or generate visual"
                                        className="text-white/50 hover:text-cynaiah-cyan"
                                    >
                                        <ImagePlus size={14} />
                                    </button>
                                    {c.asset_url && (
                                        <button
                                            onClick={() => detachAsset(c)}
                                            title="Detach visual"
                                            className="text-white/40 hover:text-white"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => delCue(c.id)}
                                        className="text-white/40 hover:text-red-300 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Attach dialog */}
            <Dialog open={!!attachFor} onOpenChange={(v) => !v && setAttachFor(null)}>
                <DialogContent className="glass-strong border-white/10 text-white max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="font-heading text-2xl">
                            Attach visual to cue
                        </DialogTitle>
                    </DialogHeader>
                    {attachFor && (
                        <div>
                            <div className="text-sm text-white/70">
                                <span
                                    className={`text-[10px] uppercase tracking-[0.22em] ${CUE_COLOR[attachFor.type]}`}
                                >
                                    {attachFor.type}
                                </span>{" "}
                                — {attachFor.label} · {fmt(attachFor.timestamp)}
                            </div>

                            {/* AI generate */}
                            <div className="mt-5 glass rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles size={14} className="text-cynaiah-cyan" />
                                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/50">
                                        Generate visual for this moment
                                    </div>
                                </div>
                                <textarea
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    rows={3}
                                    placeholder="Describe the shot for this musical moment."
                                    className="w-full rounded-md bg-black/40 border border-white/[0.08] px-3 py-3 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                                />
                                <button
                                    onClick={() => generateForCue(attachFor)}
                                    disabled={aiBusy}
                                    className="cyn-btn-primary mt-3 rounded-md px-5 py-2 text-sm flex items-center gap-2 disabled:opacity-60"
                                >
                                    {aiBusy ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <Sparkles size={14} />
                                    )}
                                    {aiBusy ? "Generating…" : "Generate with Nano Banana"}
                                </button>
                            </div>

                            {/* Existing asset picker */}
                            {assets.length > 0 && (
                                <div className="mt-5">
                                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/50 mb-3">
                                        Or pick from project assets
                                    </div>
                                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                        {assets.map((a) => (
                                            <button
                                                key={a.id}
                                                onClick={() => attachAsset(attachFor, a)}
                                                className="rounded-md overflow-hidden border border-white/[0.06] hover:border-cynaiah-cyan/60 transition-colors aspect-[16/10]"
                                            >
                                                <img
                                                    src={resolveAssetUrl(a.url)}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Rough Cut Preview */}
            <RoughCutPreview
                open={roughCutOpen}
                onClose={() => setRoughCutOpen(false)}
                track={track}
                cues={cues}
                project={project}
            />
        </div>
    );
}
