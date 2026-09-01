import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Sparkles, Loader2, Save, BookOpen, Wand2 } from "lucide-react";

const SECTIONS = [
    { key: "OPENING IMAGE", hint: "Set the tone in a single visual." },
    { key: "PROTAGONIST", hint: "Who are we with? What do they want?" },
    { key: "WORLD", hint: "Place, time, texture, atmosphere." },
    { key: "TENSION", hint: "The obstacle, the pressure, the stakes." },
    { key: "MOTIFS", hint: "Recurring visual and thematic ideas." },
    { key: "SONIC PALETTE", hint: "How does this piece sound?" },
    { key: "ARC", hint: "How does the protagonist / world change?" },
    { key: "CLOSING IMAGE", hint: "Land the emotion in one final visual." },
    { key: "COMPARABLES", hint: "Reference films / videos / campaigns." },
];

// Parse a treatment content into a map of section -> text
function parse(content) {
    const map = Object.fromEntries(SECTIONS.map((s) => [s.key, ""]));
    if (!content) return map;
    const re = /##\s*([^\n]+)\n([\s\S]*?)(?=\n##\s|$)/g;
    let m;
    while ((m = re.exec(content))) {
        const head = m[1].trim().toUpperCase();
        const body = m[2].trim();
        if (head in map) map[head] = body;
    }
    return map;
}

function assemble(map, title) {
    return SECTIONS.map((s) =>
        map[s.key] && map[s.key].trim() ? `## ${s.key}\n${map[s.key].trim()}` : "",
    )
        .filter(Boolean)
        .join("\n\n");
}

export default function TreatmentBuilder({ projectId }) {
    const [treatments, setTreatments] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [title, setTitle] = useState("");
    const [sections, setSections] = useState(parse(""));
    const [busy, setBusy] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!projectId) return;
        api
            .get(`/projects/${projectId}/scripts`)
            .then((r) => {
                const ts = r.data.filter((s) => s.kind === "treatment");
                setTreatments(ts);
                if (ts[0]) {
                    setActiveId(ts[0].id);
                    setTitle(ts[0].title);
                    setSections(parse(ts[0].content));
                } else {
                    setActiveId(null);
                    setTitle("Untitled treatment");
                    setSections(parse(""));
                }
            });
    }, [projectId]);

    const load = (t) => {
        setActiveId(t.id);
        setTitle(t.title);
        setSections(parse(t.content));
    };

    const newTreatment = () => {
        setActiveId(null);
        setTitle("Untitled treatment");
        setSections(parse(""));
    };

    const save = async () => {
        if (!projectId) return toast.error("Pick a project first.");
        setSaving(true);
        const content = assemble(sections);
        try {
            if (activeId) {
                const { data } = await api.patch(`/scripts/${activeId}`, {
                    title,
                    content,
                    kind: "treatment",
                });
                setTreatments((s) => s.map((x) => (x.id === data.id ? data : x)));
                toast.success("Treatment saved.");
            } else {
                const { data } = await api.post("/scripts", {
                    project_id: projectId,
                    title,
                    content,
                    kind: "treatment",
                });
                setTreatments((s) => [data, ...s]);
                setActiveId(data.id);
                toast.success("Treatment created.");
            }
        } catch (e) {
            toast.error("Save failed");
        } finally {
            setSaving(false);
        }
    };

    const aiAssistSection = async (sectionKey) => {
        setBusy(true);
        try {
            const context = Object.entries(sections)
                .filter(([k, v]) => v && k !== sectionKey)
                .map(([k, v]) => `${k}: ${v}`)
                .join("\n\n");
            const prompt = `Write the "${sectionKey}" section of a cinematic treatment. Keep it 60-120 words, vivid, imagistic, no filler. Context so far:\n${context || "(none yet — this is the first section written)"}\nOnly return the paragraph for ${sectionKey}, no heading, no preamble.`;
            const { data } = await api.post("/ai/script", {
                prompt,
                kind: "treatment",
                tone: "cinematic",
            });
            setSections((s) => ({ ...s, [sectionKey]: data.content.trim() }));
            toast.success(`AI drafted "${sectionKey}".`);
        } catch (e) {
            toast.error("AI section draft failed");
        } finally {
            setBusy(false);
        }
    };

    if (!projectId) {
        return (
            <div className="px-8 md:px-12 py-12 text-white/60">
                Select a project to build its treatment.
            </div>
        );
    }

    return (
        <div className="px-8 md:px-12 py-8 grid grid-cols-1 xl:grid-cols-[240px_1fr] gap-6">
            <div className="glass rounded-xl p-4 h-fit">
                <div className="flex items-center justify-between mb-3">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                        Treatments
                    </div>
                    <button
                        onClick={newTreatment}
                        className="text-[11px] uppercase tracking-[0.22em] text-white/60 hover:text-white"
                    >
                        + New
                    </button>
                </div>
                <div className="space-y-1">
                    {treatments.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => load(t)}
                            className={`w-full text-left rounded-md px-3 py-2 border transition-colors ${
                                activeId === t.id
                                    ? "bg-white/[0.06] border-white/[0.14]"
                                    : "bg-transparent border-transparent hover:bg-white/[0.03]"
                            }`}
                        >
                            <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                                treatment · v{t.version}
                            </div>
                            <div className="text-sm text-white truncate">{t.title}</div>
                        </button>
                    ))}
                    {treatments.length === 0 && (
                        <div className="text-white/45 text-sm py-4 text-center">
                            No treatments yet.
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-5">
                <div className="glass rounded-xl p-5 flex items-center gap-3 flex-wrap">
                    <BookOpen size={16} className="text-cynaiah-cyan" />
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="flex-1 min-w-[200px] bg-transparent font-heading text-2xl text-white focus:outline-none border-b border-transparent focus:border-white/10 py-1"
                        placeholder="Treatment title"
                    />
                    <button
                        onClick={save}
                        disabled={saving}
                        className="cyn-btn-primary rounded-md px-5 py-2 text-sm flex items-center gap-2"
                    >
                        {saving ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Save size={14} />
                        )}
                        Save treatment
                    </button>
                </div>

                <div className="space-y-4">
                    {SECTIONS.map((s) => (
                        <div
                            key={s.key}
                            className="glass rounded-xl p-5 animate-fade-up"
                        >
                            <div className="flex items-center justify-between gap-3 mb-2">
                                <div>
                                    <div className="text-[10px] uppercase tracking-[0.28em] text-cynaiah-cyan">
                                        {s.key}
                                    </div>
                                    <div className="text-[11px] text-white/45 mt-0.5">
                                        {s.hint}
                                    </div>
                                </div>
                                <button
                                    onClick={() => aiAssistSection(s.key)}
                                    disabled={busy}
                                    className="cyn-btn-ghost rounded-md px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {busy ? (
                                        <Loader2 size={12} className="animate-spin" />
                                    ) : (
                                        <Wand2 size={12} />
                                    )}
                                    AI draft
                                </button>
                            </div>
                            <textarea
                                value={sections[s.key] || ""}
                                onChange={(e) =>
                                    setSections((v) => ({ ...v, [s.key]: e.target.value }))
                                }
                                rows={s.key === "COMPARABLES" ? 2 : 4}
                                placeholder={s.hint}
                                className="w-full rounded-md bg-black/40 border border-white/[0.06] px-4 py-3 text-[14px] leading-[1.65] text-white/90 focus:outline-none focus:border-white/15"
                            />
                        </div>
                    ))}
                </div>

                <div className="glass rounded-xl p-5 border-cynaiah-gold/30 bg-cynaiah-gold/[0.04]">
                    <div className="flex items-start gap-3 text-sm text-white/75">
                        <Sparkles size={14} className="text-cynaiah-gold mt-0.5" />
                        <div>
                            Every AI-drafted section is a starting point. You&apos;re the
                            author. Log AI assistance under{" "}
                            <span className="text-cynaiah-gold">Rights & Credits</span>{" "}
                            before submitting for review or INHEIRA clearance.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
