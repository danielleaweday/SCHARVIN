import { useEffect, useState } from "react";
import { api, resolveAssetUrl } from "@/lib/api";
import { toast } from "sonner";
import {
    Plus,
    Trash2,
    Sparkles,
    Loader2,
    UserSquare2,
    ImagePlus,
    X,
    Save,
    ScanEye,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const FIELDS = [
    ["role_in_story", "Role in story"],
    ["age", "Age"],
    ["gender", "Gender presentation"],
    ["hair", "Hair"],
    ["skin_tone", "Skin tone"],
    ["eye_color", "Eye color"],
    ["wardrobe", "Wardrobe"],
    ["visual_style", "Visual style / framing"],
    ["locked_details", "Locked details (must not change)"],
];

const EMPTY = {
    name: "",
    role_in_story: "",
    description: "",
    age: "",
    gender: "",
    hair: "",
    skin_tone: "",
    eye_color: "",
    wardrobe: "",
    visual_style: "",
    locked_details: "",
    reference_image_urls: [],
    notes: "",
};

export default function CharacterManager({ projectId }) {
    const [characters, setCharacters] = useState([]);
    const [selected, setSelected] = useState(null);
    const [creating, setCreating] = useState(false);
    const [draft, setDraft] = useState({ ...EMPTY });
    const [busy, setBusy] = useState(false);
    const [addUrlOpen, setAddUrlOpen] = useState(false);
    const [refUrl, setRefUrl] = useState("");
    const [diffOpen, setDiffOpen] = useState(false);
    const [diffPick, setDiffPick] = useState({ a: null, b: null });
    const [diffBusy, setDiffBusy] = useState(false);
    const [diffReport, setDiffReport] = useState(null);

    const load = async () => {
        if (!projectId) return;
        const { data } = await api.get(`/projects/${projectId}/characters`);
        setCharacters(data);
    };

    useEffect(() => {
        load();
        setSelected(null);
        setCreating(false);
    }, [projectId]);

    const create = async () => {
        if (!draft.name.trim()) return toast.error("Name required.");
        const { data } = await api.post("/characters", {
            ...draft,
            project_id: projectId,
        });
        setCharacters((c) => [...c, data]);
        setSelected(data);
        setCreating(false);
        setDraft({ ...EMPTY });
        toast.success("Character added.");
    };

    const saveEdit = async () => {
        if (!selected) return;
        const { data } = await api.patch(`/characters/${selected.id}`, {
            ...selected,
        });
        setCharacters((c) => c.map((x) => (x.id === data.id ? data : x)));
        setSelected(data);
        toast.success("Saved.");
    };

    const remove = async (id) => {
        if (!window.confirm("Delete this character?")) return;
        await api.delete(`/characters/${id}`);
        setCharacters((c) => c.filter((x) => x.id !== id));
        if (selected?.id === id) setSelected(null);
    };

    const addRefUrl = () => {
        if (!selected || !refUrl.trim()) return;
        setSelected((s) => ({
            ...s,
            reference_image_urls: [...(s.reference_image_urls || []), refUrl.trim()],
        }));
        setRefUrl("");
        setAddUrlOpen(false);
    };

    const removeRef = (url) => {
        setSelected((s) => ({
            ...s,
            reference_image_urls: (s.reference_image_urls || []).filter((u) => u !== url),
        }));
    };

    const generateReference = async () => {
        if (!selected) return;
        setBusy(true);
        try {
            const { data } = await api.post(
                `/characters/${selected.id}/generate-reference`,
                {
                    style: "identity reference portrait, neutral lighting, clean background, sharp focus",
                },
            );
            setCharacters((c) => c.map((x) => (x.id === data.id ? data : x)));
            setSelected(data);
            toast.success("Reference image generated.");
        } catch (e) {
            toast.error(e?.response?.data?.detail || "Generation failed");
        } finally {
            setBusy(false);
        }
    };

    const runDiff = async () => {
        if (!selected || !diffPick.a || !diffPick.b) {
            toast.error("Pick two reference images to compare.");
            return;
        }
        if (diffPick.a === diffPick.b) {
            toast.error("Pick two different images.");
            return;
        }
        setDiffBusy(true);
        setDiffReport(null);
        try {
            const { data } = await api.post(
                `/characters/${selected.id}/continuity-diff`,
                { image_a_url: diffPick.a, image_b_url: diffPick.b },
            );
            setDiffReport(data);
            toast.success("Continuity report ready — you make the final call.");
        } catch (e) {
            toast.error(e?.response?.data?.detail || "Continuity check failed");
        } finally {
            setDiffBusy(false);
        }
    };

    if (!projectId) {
        return (
            <div className="px-8 md:px-12 py-12 text-white/60">
                Select a project to manage its cast.
            </div>
        );
    }

    return (
        <div className="px-8 md:px-12 py-8 grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-6">
            <div className="glass rounded-xl p-4 h-fit">
                <div className="flex items-center justify-between mb-3">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                        Cast
                    </div>
                    <button
                        onClick={() => {
                            setCreating(true);
                            setSelected(null);
                            setDraft({ ...EMPTY });
                        }}
                        className="text-[11px] uppercase tracking-[0.22em] text-white/60 hover:text-white"
                    >
                        + New
                    </button>
                </div>
                <div className="space-y-1">
                    {characters.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => {
                                setSelected(c);
                                setCreating(false);
                            }}
                            className={`w-full text-left rounded-md px-3 py-2.5 border transition-colors flex items-center gap-3 ${
                                selected?.id === c.id
                                    ? "bg-white/[0.06] border-white/[0.14]"
                                    : "bg-transparent border-transparent hover:bg-white/[0.03]"
                            }`}
                        >
                            <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 bg-black/40 shrink-0">
                                {c.reference_image_urls?.[0] ? (
                                    <img
                                        src={resolveAssetUrl(c.reference_image_urls[0])}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/30">
                                        <UserSquare2 size={14} />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <div className="text-sm text-white truncate">
                                    {c.name}
                                </div>
                                <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 truncate">
                                    {c.role_in_story || "—"}
                                </div>
                            </div>
                        </button>
                    ))}
                    {characters.length === 0 && (
                        <div className="text-white/45 text-sm py-4 text-center">
                            No cast yet.
                        </div>
                    )}
                </div>

                <div className="mt-4 rounded-md border border-cynaiah-cyan/25 bg-cynaiah-cyan/[0.05] p-3 text-[11px] text-white/70 leading-relaxed">
                    Character references are the provider-native identity system
                    used by Gemini Nano Banana. When you generate visuals, the
                    reference images and locked details are sent along with your
                    prompt so appearance stays consistent — this is <em>not</em> a
                    fine-tuned LoRA.
                </div>
            </div>

            <div className="space-y-4">
                {!selected && !creating && (
                    <div className="glass rounded-xl p-10 text-center text-white/60">
                        Pick a character on the left, or{" "}
                        <button
                            onClick={() => setCreating(true)}
                            className="text-white underline"
                        >
                            create a new one
                        </button>
                        .
                    </div>
                )}

                {creating && (
                    <div className="glass rounded-xl p-6 animate-fade-up">
                        <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                            New character
                        </div>
                        <input
                            value={draft.name}
                            onChange={(e) =>
                                setDraft((d) => ({ ...d, name: e.target.value }))
                            }
                            placeholder="Name (e.g. Nova K.)"
                            className="mt-3 w-full rounded-md bg-white/[0.03] border border-white/[0.08] px-4 py-3 text-lg text-white focus:outline-none focus:border-cynaiah-cyan/60"
                        />
                        <textarea
                            value={draft.description}
                            onChange={(e) =>
                                setDraft((d) => ({ ...d, description: e.target.value }))
                            }
                            rows={3}
                            placeholder="One-paragraph description — psychology, tone, presence."
                            className="mt-3 w-full rounded-md bg-white/[0.03] border border-white/[0.08] px-4 py-3 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                        />
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                            {FIELDS.map(([k, label]) => (
                                <div key={k}>
                                    <label className="text-[10px] uppercase tracking-[0.22em] text-white/45">
                                        {label}
                                    </label>
                                    <input
                                        value={draft[k]}
                                        onChange={(e) =>
                                            setDraft((d) => ({
                                                ...d,
                                                [k]: e.target.value,
                                            }))
                                        }
                                        className="mt-1 w-full rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="mt-5 flex gap-3">
                            <button
                                onClick={create}
                                className="cyn-btn-primary rounded-md px-5 py-2.5 text-sm flex items-center gap-2"
                            >
                                <Plus size={14} /> Add to cast
                            </button>
                            <button
                                onClick={() => setCreating(false)}
                                className="cyn-btn-ghost rounded-md px-4 py-2.5 text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {selected && !creating && (
                    <div className="glass rounded-xl p-6 animate-fade-up">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <input
                                value={selected.name}
                                onChange={(e) =>
                                    setSelected((s) => ({ ...s, name: e.target.value }))
                                }
                                className="flex-1 min-w-[200px] bg-transparent font-heading text-2xl text-white focus:outline-none border-b border-transparent focus:border-white/10 py-1"
                            />
                            <button
                                onClick={saveEdit}
                                className="cyn-btn-primary rounded-md px-4 py-2 text-sm flex items-center gap-2"
                            >
                                <Save size={14} /> Save
                            </button>
                            <button
                                onClick={() => remove(selected.id)}
                                className="p-2 rounded-md border border-white/10 text-white/60 hover:text-red-300 hover:border-red-500/40 transition-colors"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>

                        {/* Reference images */}
                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                                    Identity references ({selected.reference_image_urls?.length || 0})
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setDiffOpen(true);
                                            setDiffPick({ a: null, b: null });
                                            setDiffReport(null);
                                        }}
                                        className="cyn-btn-ghost rounded-md px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] flex items-center gap-1.5"
                                    >
                                        <ScanEye size={12} /> Continuity diff
                                    </button>
                                    <button
                                        onClick={() => setAddUrlOpen(true)}
                                        className="cyn-btn-ghost rounded-md px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] flex items-center gap-1.5"
                                    >
                                        <ImagePlus size={12} /> Add URL
                                    </button>
                                    <button
                                        onClick={generateReference}
                                        disabled={busy}
                                        className="cyn-btn-primary rounded-md px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] flex items-center gap-1.5 disabled:opacity-60"
                                    >
                                        {busy ? (
                                            <Loader2 size={12} className="animate-spin" />
                                        ) : (
                                            <Sparkles size={12} />
                                        )}
                                        Generate ref
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {(selected.reference_image_urls || []).map((url) => (
                                    <div
                                        key={url}
                                        className="relative rounded-md overflow-hidden border border-white/[0.06] aspect-[3/4] group"
                                    >
                                        <img
                                            src={resolveAssetUrl(url)}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={() => removeRef(url)}
                                            className="absolute top-1 right-1 p-1 rounded-full bg-black/70 border border-white/10 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                                {(selected.reference_image_urls || []).length === 0 && (
                                    <div className="col-span-full text-white/45 text-sm py-6 text-center border border-dashed border-white/10 rounded-md">
                                        No references yet. Add a URL or generate one.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Locked attributes */}
                        <div className="mt-6">
                            <div className="text-[10px] uppercase tracking-[0.24em] text-white/40 mb-3">
                                Locked attributes
                            </div>
                            <textarea
                                value={selected.description || ""}
                                onChange={(e) =>
                                    setSelected((s) => ({
                                        ...s,
                                        description: e.target.value,
                                    }))
                                }
                                rows={3}
                                placeholder="Description — psychology, tone, presence."
                                className="w-full rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                            />
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                                {FIELDS.map(([k, label]) => (
                                    <div key={k}>
                                        <label className="text-[10px] uppercase tracking-[0.22em] text-white/45">
                                            {label}
                                        </label>
                                        <input
                                            value={selected[k] || ""}
                                            onChange={(e) =>
                                                setSelected((s) => ({
                                                    ...s,
                                                    [k]: e.target.value,
                                                }))
                                            }
                                            className="mt-1 w-full rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Dialog open={addUrlOpen} onOpenChange={setAddUrlOpen}>
                <DialogContent className="glass-strong border-white/10 text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-heading text-xl">
                            Add reference image URL
                        </DialogTitle>
                    </DialogHeader>
                    <input
                        value={refUrl}
                        onChange={(e) => setRefUrl(e.target.value)}
                        placeholder="https://…"
                        className="w-full rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-2.5 text-sm text-white"
                    />
                    <button
                        onClick={addRefUrl}
                        className="cyn-btn-primary rounded-md px-4 py-2 text-sm mt-2"
                    >
                        Add
                    </button>
                </DialogContent>
            </Dialog>

            {/* Continuity Diff dialog */}
            <Dialog open={diffOpen} onOpenChange={setDiffOpen}>
                <DialogContent className="glass-strong border-white/10 text-white max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="font-heading text-2xl">
                            Continuity diff · {selected?.name}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="text-xs text-white/60">
                        Pick two frames of this character. Claude Sonnet 4.5 will suggest
                        possible drift — <span className="text-cynaiah-cyan">you make the final call</span>.
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        {["a", "b"].map((slot) => (
                            <div key={slot}>
                                <div className="text-[10px] uppercase tracking-[0.24em] text-white/40 mb-2">
                                    Frame {slot.toUpperCase()}
                                </div>
                                <div className="grid grid-cols-3 gap-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                                    {(selected?.reference_image_urls || []).map((url) => (
                                        <button
                                            key={url}
                                            onClick={() => setDiffPick((p) => ({ ...p, [slot]: url }))}
                                            className={`rounded overflow-hidden border-2 transition-colors aspect-[3/4] ${
                                                diffPick[slot] === url
                                                    ? "border-cynaiah-cyan"
                                                    : "border-white/[0.06] hover:border-white/25"
                                            }`}
                                        >
                                            <img
                                                src={resolveAssetUrl(url)}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={runDiff}
                        disabled={diffBusy || !diffPick.a || !diffPick.b}
                        className="cyn-btn-primary rounded-md px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-60 mt-3"
                    >
                        {diffBusy ? <Loader2 size={14} className="animate-spin" /> : <ScanEye size={14} />}
                        {diffBusy ? "Analyzing…" : "Run continuity diff"}
                    </button>

                    {diffReport?.report && (
                        <div className="mt-5 space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                            <div className="glass rounded-md p-3">
                                <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                                    Summary · confidence: {diffReport.report.confidence}
                                </div>
                                <div className="mt-1 text-sm text-white/90">{diffReport.report.summary}</div>
                            </div>
                            {(diffReport.report.differences || []).map((d, i) => (
                                <div key={i} className="rounded-md border border-white/[0.06] p-3">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[10px] uppercase tracking-[0.22em] text-cynaiah-cyan">{d.category}</span>
                                        <span className={`text-[10px] uppercase tracking-[0.22em] ${
                                            d.severity === "major" ? "text-cynaiah-magenta" : d.severity === "notable" ? "text-cynaiah-orange" : "text-white/50"
                                        }`}>
                                            {d.severity}
                                        </span>
                                    </div>
                                    <div className="text-sm text-white/85 mt-1">{d.detail}</div>
                                </div>
                            ))}
                            {(diffReport.report.questions_for_student || []).length > 0 && (
                                <div className="rounded-md border border-cynaiah-gold/30 bg-cynaiah-gold/[0.05] p-3">
                                    <div className="text-[10px] uppercase tracking-[0.24em] text-cynaiah-gold mb-2">Questions for you</div>
                                    <ul className="space-y-1 text-sm text-white/85">
                                        {diffReport.report.questions_for_student.map((q, i) => (
                                            <li key={i}>· {q}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
