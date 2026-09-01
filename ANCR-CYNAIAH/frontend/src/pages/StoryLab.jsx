import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";
import TopBar from "@/components/cynaiah/TopBar";
import { TID } from "@/constants/testIds";
import {
    Sparkles,
    Loader2,
    Save,
    Trash2,
    FileText,
    Wand2,
    LayoutGrid,
    BookOpen,
    UserSquare2,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import StoryboardBuilder from "@/components/cynaiah/StoryboardBuilder";
import TreatmentBuilder from "@/components/cynaiah/TreatmentBuilder";
import CharacterManager from "@/components/cynaiah/CharacterManager";

const KINDS = [
    { value: "screenplay", label: "Screenplay scene" },
    { value: "treatment", label: "Treatment" },
    { value: "logline", label: "Logline" },
    { value: "shotlist", label: "Shot list" },
    { value: "storyboard_beats", label: "Storyboard beats" },
];

const TABS = [
    { key: "docs", label: "Documents", icon: FileText },
    { key: "storyboard", label: "Storyboard", icon: LayoutGrid },
    { key: "treatment", label: "Treatment Builder", icon: BookOpen },
    { key: "characters", label: "Characters", icon: UserSquare2 },
];

export default function StoryLab() {
    const [tab, setTab] = useState("docs");
    const [projects, setProjects] = useState([]);
    const [projectId, setProjectId] = useState("");
    const [params] = useSearchParams();
    const highlightFrame = params.get("frame") || "";

    useEffect(() => {
        api.get("/projects").then((r) => {
            setProjects(r.data);
            const wantedProject = params.get("project");
            const match = wantedProject && r.data.find((p) => p.id === wantedProject);
            if (match) {
                setProjectId(match.id);
                if (highlightFrame) setTab("storyboard");
            } else if (r.data.length > 0 && !projectId) {
                setProjectId(r.data[0].id);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params]);

    return (
        <div>
            <TopBar
                subtitle="Story Lab"
                title="Write, treat, and blueprint the story"
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

            {/* Tabs */}
            <div className="px-8 md:px-12 pt-6">
                <div className="inline-flex glass rounded-full p-1 gap-1">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            data-testid={`storylab-tab-${t.key}`}
                            onClick={() => setTab(t.key)}
                            className={`px-4 py-2 rounded-full text-xs uppercase tracking-[0.22em] flex items-center gap-2 transition-colors ${
                                tab === t.key
                                    ? "bg-white/10 text-white"
                                    : "text-white/50 hover:text-white/80"
                            }`}
                        >
                            <t.icon size={13} />
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {tab === "docs" && <DocumentsTab projectId={projectId} />}
            {tab === "storyboard" && <StoryboardBuilder projectId={projectId} highlightFrameId={highlightFrame} />}
            {tab === "treatment" && <TreatmentBuilder projectId={projectId} />}
            {tab === "characters" && <CharacterManager projectId={projectId} />}
        </div>
    );
}

function DocumentsTab({ projectId }) {
    const [scripts, setScripts] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [draft, setDraft] = useState({ title: "", content: "", kind: "treatment" });
    const [aiPrompt, setAiPrompt] = useState("");
    const [aiKind, setAiKind] = useState("treatment");
    const [busy, setBusy] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!projectId) return;
        api.get(`/projects/${projectId}/scripts`).then((r) => {
            setScripts(r.data);
            if (r.data.length > 0) {
                setActiveId(r.data[0].id);
                setDraft({
                    title: r.data[0].title,
                    content: r.data[0].content,
                    kind: r.data[0].kind,
                });
            } else {
                setActiveId(null);
                setDraft({ title: "", content: "", kind: "treatment" });
            }
        });
    }, [projectId]);

    const selectScript = (s) => {
        setActiveId(s.id);
        setDraft({ title: s.title, content: s.content, kind: s.kind });
    };
    const newDoc = () => {
        setActiveId(null);
        setDraft({ title: "Untitled document", content: "", kind: "treatment" });
    };

    const save = async () => {
        if (!projectId) return toast.error("Pick a project first.");
        setSaving(true);
        try {
            if (activeId) {
                const { data } = await api.patch(`/scripts/${activeId}`, draft);
                setScripts((s) => s.map((x) => (x.id === data.id ? data : x)));
                toast.success("Saved.");
            } else {
                const { data } = await api.post("/scripts", { ...draft, project_id: projectId });
                setScripts((s) => [data, ...s]);
                setActiveId(data.id);
                toast.success("Created.");
            }
        } catch (e) {
            toast.error("Save failed");
        } finally {
            setSaving(false);
        }
    };

    const remove = async (id) => {
        if (!window.confirm("Delete this document?")) return;
        await api.delete(`/scripts/${id}`);
        setScripts((s) => s.filter((x) => x.id !== id));
        if (activeId === id) newDoc();
    };

    const generate = async () => {
        if (!aiPrompt.trim()) return toast.error("Describe what to generate.");
        setBusy(true);
        try {
            const { data } = await api.post("/ai/script", {
                prompt: aiPrompt,
                kind: aiKind,
                tone: "cinematic",
                project_id: projectId || null,
            });
            setDraft({ title: `AI Draft — ${aiKind}`, content: data.content, kind: aiKind });
            setActiveId(null);
            if (data.saved_script) {
                setScripts((s) => [data.saved_script, ...s]);
                setActiveId(data.saved_script.id);
            }
            toast.success("AI draft ready · Claude Sonnet 4.5.");
        } catch (e) {
            toast.error(e?.response?.data?.detail || "AI generation failed");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="px-8 md:px-12 py-8 grid grid-cols-1 xl:grid-cols-[280px_1fr_320px] gap-6">
            <div className="glass rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                        Documents
                    </div>
                    <button
                        onClick={newDoc}
                        className="text-[11px] uppercase tracking-[0.22em] text-white/60 hover:text-white"
                    >
                        + New
                    </button>
                </div>
                <div className="space-y-1 max-h-[65vh] overflow-y-auto custom-scrollbar pr-1">
                    {scripts.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => selectScript(s)}
                            className={`w-full text-left rounded-md px-3 py-2 border transition-colors ${
                                activeId === s.id
                                    ? "bg-white/[0.06] border-white/[0.14]"
                                    : "bg-transparent border-transparent hover:bg-white/[0.03]"
                            }`}
                        >
                            <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                                {s.kind} · v{s.version}
                            </div>
                            <div className="text-sm text-white truncate">{s.title}</div>
                        </button>
                    ))}
                    {scripts.length === 0 && (
                        <div className="text-white/45 text-sm py-6 text-center">
                            No documents.
                        </div>
                    )}
                </div>
            </div>

            <div className="glass rounded-xl p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <input
                        value={draft.title}
                        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                        className="flex-1 min-w-[200px] bg-transparent font-heading text-2xl text-white focus:outline-none border-b border-transparent focus:border-white/10 py-1"
                        placeholder="Untitled document"
                    />
                    <Select
                        value={draft.kind}
                        onValueChange={(v) => setDraft({ ...draft, kind: v })}
                    >
                        <SelectTrigger
                            data-testid={TID.scriptKindSelect}
                            className="w-[180px] bg-white/[0.03] border-white/[0.08] text-white"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0A0A0C] border-white/10 text-white">
                            {KINDS.map((k) => (
                                <SelectItem key={k.value} value={k.value}>
                                    {k.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <button
                        data-testid={TID.scriptSave}
                        onClick={save}
                        disabled={saving}
                        className="cyn-btn-primary rounded-md px-4 py-2 text-sm flex items-center gap-2"
                    >
                        {saving ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Save size={14} />
                        )}
                        Save
                    </button>
                    {activeId && (
                        <button
                            onClick={() => remove(activeId)}
                            className="p-2 rounded-md border border-white/10 text-white/60 hover:text-red-300 hover:border-red-500/40 transition-colors"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
                <textarea
                    data-testid={TID.scriptEditor}
                    value={draft.content}
                    onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                    placeholder="Start writing. Use standard screenplay format or narrative prose."
                    className="flex-1 min-h-[60vh] bg-black/40 border border-white/[0.06] rounded-lg p-6 text-[15px] leading-[1.7] text-white/90 focus:outline-none focus:border-white/15 font-mono"
                />
            </div>

            <div className="glass rounded-xl p-5 h-fit">
                <div className="flex items-center gap-2 mb-3">
                    <Wand2 size={14} className="text-cynaiah-cyan" />
                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/50">
                        AI writing partner
                    </div>
                </div>
                <div className="text-[11px] text-white/45 mb-4">
                    Claude Sonnet 4.5 · script co-writer
                </div>

                <label className="text-[11px] uppercase tracking-[0.22em] text-white/45">
                    Kind
                </label>
                <Select value={aiKind} onValueChange={setAiKind}>
                    <SelectTrigger className="mt-2 bg-white/[0.03] border-white/[0.08] text-white">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0A0A0C] border-white/10 text-white">
                        {KINDS.map((k) => (
                            <SelectItem key={k.value} value={k.value}>
                                {k.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <label className="mt-4 block text-[11px] uppercase tracking-[0.22em] text-white/45">
                    Brief
                </label>
                <textarea
                    data-testid={TID.scriptAIPrompt}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={6}
                    placeholder="Describe the story, characters, tone, world. Give references."
                    className="mt-2 w-full rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-3 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                />

                <button
                    data-testid={TID.scriptAIGenerate}
                    onClick={generate}
                    disabled={busy}
                    className="cyn-btn-primary mt-4 w-full rounded-md px-4 py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                    {busy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    {busy ? "Generating…" : "Generate draft"}
                </button>

                <div className="mt-4 text-[10px] text-white/40 leading-relaxed border-t border-white/[0.05] pt-3">
                    AI drafts are starting points. You remain the author of record. Log
                    AI usage under Rights & Credits.
                </div>
            </div>
        </div>
    );
}
