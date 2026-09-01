import { useEffect, useState } from "react";
import { api, resolveAssetUrl } from "@/lib/api";
import { toast } from "sonner";
import TopBar from "@/components/cynaiah/TopBar";
import { TID } from "@/constants/testIds";
import {
    Sparkles,
    Loader2,
    Video,
    Users2,
    Palette,
    Wand2,
    Layers,
    UploadCloud,
    Timer,
    Radio,
    ScanText,
    Volume2,
    Repeat2,
    ImageIcon,
    Boxes,
    LineChart,
    LayoutGrid,
    BookmarkPlus,
    UserSquare2,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const STYLE_PRESETS = [
    "cinematic film still",
    "neon noir",
    "editorial fashion",
    "anamorphic wide shot",
    "documentary photograph",
    "concept art painting",
    "vintage 35mm",
    "CGI hyperreal",
];

const FUTURE_TOOLS = [
    { icon: Video, label: "Text-to-video", blurb: "Sora-class motion generation" },
    { icon: ImageIcon, label: "Image-to-image", blurb: "Restyle and variation" },
    { icon: Users2, label: "Character consistency", blurb: "Locked identity across shots" },
    { icon: Boxes, label: "CGI environments", blurb: "Explorable worlds & sets" },
    { icon: Palette, label: "Color & lighting", blurb: "Cinematic LUT + look dev" },
    { icon: ScanText, label: "Inpainting / extension", blurb: "Cleanplates & scene extension" },
    { icon: Volume2, label: "Voice & dialogue", blurb: "Casting AI voices + lip sync" },
    { icon: Repeat2, label: "Style transfer", blurb: "Reference-driven look transfer" },
    { icon: LineChart, label: "Upscaling & restoration", blurb: "Deliverable-ready quality" },
    { icon: Radio, label: "Music-responsive visuals", blurb: "Beat-locked motion" },
    { icon: Timer, label: "Render queue", blurb: "Batch and prioritize" },
    { icon: UploadCloud, label: "Export management", blurb: "Deliverables per platform" },
];

export default function AIVisualLab() {
    const [projects, setProjects] = useState([]);
    const [projectId, setProjectId] = useState("");
    const [prompt, setPrompt] = useState(
        "Neon-noir music video still: singer in wine-red coat under magenta signage, wet street reflections, anamorphic lens, cinematic depth.",
    );
    const [style, setStyle] = useState("cinematic film still");
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [projectMoodBoard, setProjectMoodBoard] = useState([]);
    const [characters, setCharacters] = useState([]);
    const [selectedCharacters, setSelectedCharacters] = useState([]);

    useEffect(() => {
        api.get("/projects").then((r) => {
            setProjects(r.data);
            if (r.data[0]) setProjectId(r.data[0].id);
        });
    }, []);

    useEffect(() => {
        if (!projectId) {
            setCharacters([]);
            setSelectedCharacters([]);
            setProjectMoodBoard([]);
            return;
        }
        Promise.all([
            api.get(`/assets?project_id=${projectId}`),
            api.get(`/projects/${projectId}/characters`),
        ]).then(([a, c]) => {
            setProjectMoodBoard(a.data);
            setCharacters(c.data);
            setSelectedCharacters([]);
        });
    }, [projectId, result?.saved_asset?.id]);

    const generate = async (tags = []) => {
        if (!prompt.trim()) return toast.error("Describe what to visualize.");
        setBusy(true);
        setResult(null);
        try {
            const { data } = await api.post("/ai/image", {
                prompt,
                style,
                save_as_asset: true,
                project_id: projectId || null,
                tags,
                character_ids: selectedCharacters,
            });
            const url = resolveAssetUrl(data.url);
            const record = { ...data, url, prompt, style };
            setResult(record);
            setHistory((h) => [record, ...h].slice(0, 12));
            const locked = data.character_reference_count || 0;
            toast.success(
                locked > 0
                    ? `Image generated with ${locked} identity reference${locked > 1 ? "s" : ""}.`
                    : "Image generated · Gemini Nano Banana.",
            );
        } catch (e) {
            toast.error(e?.response?.data?.detail || "Image generation failed");
        } finally {
            setBusy(false);
        }
    };

    const addToStoryboard = async () => {
        if (!result || !projectId) return;
        try {
            await api.post("/storyboard-frames", {
                project_id: projectId,
                caption: result.prompt.slice(0, 120),
                shot_type: "MS",
                notes: `Style: ${result.style}`,
                image_url: result.url.replace(window.location.origin, "").replace(
                    process.env.REACT_APP_BACKEND_URL,
                    "",
                ),
                generate_with_ai: false,
            });
            toast.success("Added to storyboard.");
        } catch (e) {
            toast.error("Failed to add to storyboard");
        }
    };

    return (
        <div>
            <TopBar
                subtitle="AI Visual Lab"
                title="Direct visuals with your AI cinematographer"
                actions={
                    <Select value={projectId} onValueChange={setProjectId}>
                        <SelectTrigger className="w-[240px] bg-white/[0.03] border-white/[0.08] text-white">
                            <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0A0A0C] border-white/10 text-white">
                            {projects.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                    {p.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                }
            />

            <div className="px-8 md:px-12 py-8 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
                <div className="space-y-6">
                    <div className="glass rounded-xl p-6">
                        <div className="flex items-center gap-2">
                            <Wand2 size={14} className="text-cynaiah-cyan" />
                            <div className="text-[10px] uppercase tracking-[0.24em] text-white/50">
                                Text-to-image · Gemini Nano Banana
                            </div>
                            <span className="ml-auto text-[10px] uppercase tracking-[0.22em] text-emerald-300/80 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">
                                Live
                            </span>
                        </div>

                        <label className="mt-5 block text-[11px] uppercase tracking-[0.22em] text-white/45">
                            Prompt
                        </label>
                        <textarea
                            data-testid={TID.aiImagePrompt}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={4}
                            className="mt-2 w-full rounded-md bg-black/40 border border-white/[0.08] px-4 py-3 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                        />

                        <label className="mt-4 block text-[11px] uppercase tracking-[0.22em] text-white/45">
                            Style preset
                        </label>
                        <div className="mt-2 flex flex-wrap gap-2" data-testid={TID.aiImageStyle}>
                            {STYLE_PRESETS.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStyle(s)}
                                    className={`px-3 py-1.5 rounded-full text-[11px] uppercase tracking-[0.18em] border transition-colors ${
                                        style === s
                                            ? "bg-cynaiah-cyan/20 border-cynaiah-cyan/50 text-white"
                                            : "border-white/10 text-white/60 hover:border-white/25"
                                    }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

                        <div className="mt-5 flex flex-wrap gap-3">
                            <button
                                data-testid={TID.aiImageGenerate}
                                onClick={() => generate([])}
                                disabled={busy}
                                className="cyn-btn-primary rounded-md px-6 py-3 text-sm font-medium flex items-center gap-2 disabled:opacity-60"
                            >
                                {busy ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <Sparkles size={14} />
                                )}
                                {busy ? "Generating…" : "Generate"}
                            </button>
                            <button
                                onClick={() => generate(["mood-board"])}
                                disabled={busy}
                                className="cyn-btn-ghost rounded-md px-5 py-3 text-sm flex items-center gap-2 disabled:opacity-60"
                            >
                                <Layers size={14} /> Generate → Mood board
                            </button>
                        </div>

                        {/* Character consistency */}
                        {characters.length > 0 && (
                            <div className="mt-5 border-t border-white/[0.05] pt-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <UserSquare2
                                        size={13}
                                        className="text-cynaiah-magenta"
                                    />
                                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/50">
                                        Character consistency
                                    </div>
                                    {selectedCharacters.length > 0 && (
                                        <span className="text-[10px] uppercase tracking-[0.2em] text-cynaiah-cyan">
                                            {selectedCharacters.length} locked
                                        </span>
                                    )}
                                    <span className="ml-auto text-[10px] uppercase tracking-[0.2em] text-white/35">
                                        Provider-native (Gemini)
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {characters.map((c) => {
                                        const active = selectedCharacters.includes(c.id);
                                        return (
                                            <button
                                                key={c.id}
                                                onClick={() =>
                                                    setSelectedCharacters((s) =>
                                                        active
                                                            ? s.filter((x) => x !== c.id)
                                                            : [...s, c.id],
                                                    )
                                                }
                                                className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border transition-colors ${
                                                    active
                                                        ? "bg-cynaiah-magenta/15 border-cynaiah-magenta/50 text-white"
                                                        : "border-white/10 text-white/60 hover:border-white/25"
                                                }`}
                                            >
                                                <span className="w-6 h-6 rounded-full overflow-hidden border border-white/10 bg-black/40">
                                                    {c.reference_image_urls?.[0] && (
                                                        <img
                                                            src={resolveAssetUrl(
                                                                c.reference_image_urls[0],
                                                            )}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    )}
                                                </span>
                                                <span className="text-[11px] uppercase tracking-[0.16em]">
                                                    {c.name}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Result */}
                    <div
                        data-testid={TID.aiImageResult}
                        className="glass rounded-xl p-6 min-h-[420px] relative overflow-hidden"
                    >
                        <div className="text-[10px] uppercase tracking-[0.24em] text-white/40 mb-4">
                            Latest generation
                        </div>
                        {busy && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur">
                                <div className="text-center">
                                    <Loader2 className="animate-spin mx-auto text-cynaiah-cyan" size={28} />
                                    <div className="mt-3 text-white/70 text-sm">
                                        Rendering cinematic frame…
                                    </div>
                                </div>
                            </div>
                        )}
                        {!result && !busy && (
                            <div className="h-[360px] flex flex-col items-center justify-center text-center px-8">
                                <Sparkles className="text-white/25" size={40} />
                                <div className="mt-4 font-heading text-xl text-white/70">
                                    Your first frame appears here
                                </div>
                                <p className="mt-2 text-white/40 max-w-md text-sm">
                                    Describe a shot in cinematic terms — lens, mood, palette,
                                    subject action. The image is saved as a project asset.
                                </p>
                            </div>
                        )}
                        {result && (
                            <div>
                                <div className="rounded-lg overflow-hidden border border-white/[0.08]">
                                    <img
                                        src={result.url}
                                        alt="generated"
                                        className="w-full object-cover"
                                    />
                                </div>
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-white/70">
                                    <div className="rounded-md border border-white/[0.06] p-3">
                                        <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                                            Provider
                                        </div>
                                        <div className="mt-1">{result.provider}</div>
                                    </div>
                                    <div className="rounded-md border border-white/[0.06] p-3">
                                        <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                                            Style
                                        </div>
                                        <div className="mt-1">{result.style}</div>
                                    </div>
                                    <div className="rounded-md border border-white/[0.06] p-3">
                                        <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                                            Saved as
                                        </div>
                                        <div className="mt-1">Project asset · AI generated</div>
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <button
                                        onClick={addToStoryboard}
                                        className="cyn-btn-ghost rounded-md px-4 py-2 text-xs flex items-center gap-2"
                                    >
                                        <LayoutGrid size={13} /> Add to storyboard
                                    </button>
                                    <a
                                        href={result.url}
                                        download
                                        className="cyn-btn-ghost rounded-md px-4 py-2 text-xs flex items-center gap-2"
                                    >
                                        <BookmarkPlus size={13} /> Download PNG
                                    </a>
                                </div>
                                <div className="mt-3 text-[10px] uppercase tracking-[0.22em] text-cynaiah-gold">
                                    Remember to log AI usage under Rights & Credits.
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Project mood board */}
                    {projectMoodBoard.length > 0 && (
                        <div className="glass rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                                        Project mood board
                                    </div>
                                    <div className="font-heading text-lg mt-1">
                                        {projectMoodBoard.length} references
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {projectMoodBoard.slice(0, 8).map((a) => (
                                    <div
                                        key={a.id}
                                        className="relative rounded-md overflow-hidden border border-white/[0.06] aspect-[4/3]"
                                    >
                                        <img
                                            src={resolveAssetUrl(a.url)}
                                            alt=""
                                            className="w-full h-full object-cover"
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

                    {/* Integration-ready panels */}
                    <div className="glass rounded-xl p-6">
                        <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                            Integration-ready tools
                        </div>
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                            {FUTURE_TOOLS.map((t) => (
                                <div
                                    key={t.label}
                                    className="rounded-md border border-white/[0.06] bg-white/[0.02] p-3 flex items-start gap-3"
                                >
                                    <div className="w-8 h-8 rounded bg-white/[0.04] flex items-center justify-center text-cynaiah-violet">
                                        <t.icon size={14} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-white text-sm truncate">
                                            {t.label}
                                        </div>
                                        <div className="text-white/45 text-[11px] mt-0.5">
                                            {t.blurb}
                                        </div>
                                        <div className="mt-1.5 inline-block text-[9px] uppercase tracking-[0.22em] text-white/40 border border-white/10 rounded-full px-1.5 py-0.5">
                                            Integration-ready
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="glass rounded-xl p-5">
                        <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                            Recent renders
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            {history.length === 0 && (
                                <div className="col-span-2 text-white/45 text-sm py-6 text-center">
                                    Nothing yet.
                                </div>
                            )}
                            {history.map((h, i) => (
                                <button
                                    key={i}
                                    onClick={() => setResult(h)}
                                    className="rounded-md overflow-hidden border border-white/[0.06] hover:border-cynaiah-cyan/60 transition-colors"
                                >
                                    <img
                                        src={h.url}
                                        alt=""
                                        className="w-full aspect-[16/10] object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="glass rounded-xl p-5">
                        <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                            AI ethics on-set
                        </div>
                        <ul className="mt-3 space-y-2 text-[13px] text-white/70 leading-relaxed">
                            <li>· Disclose AI-generated media on every deliverable.</li>
                            <li>· Do not train on unlicensed likeness or voice.</li>
                            <li>· Log models and prompts under Rights & Credits.</li>
                            <li>· AI is a tool — you remain the author.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
