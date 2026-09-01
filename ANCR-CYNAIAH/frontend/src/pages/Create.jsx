import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";
import TopBar from "@/components/cynaiah/TopBar";
import { PROJECT_TYPES } from "@/lib/constants";
import { TID } from "@/constants/testIds";
import {
    ArrowLeft,
    ArrowRight,
    Loader2,
    Sparkles,
    Music,
    Palette,
    Users,
    Wand2,
    Clock,
    DollarSign,
    ShieldCheck,
} from "lucide-react";

const AI_OPTIONS = [
    { value: "traditional", label: "Traditional", blurb: "No AI in final output" },
    { value: "hybrid", label: "Hybrid", blurb: "AI-assisted with human craft" },
    { value: "ai_assisted", label: "AI-assisted", blurb: "AI-forward pipeline" },
];

const STYLES = [
    "Cinematic naturalism",
    "Neon noir",
    "Documentary vérité",
    "Editorial fashion",
    "Anime / 2D",
    "CGI hyperreal",
    "Analog film grain",
    "Retrofuturist",
];

export default function Create() {
    const nav = useNavigate();
    const [step, setStep] = useState(0);
    const [busy, setBusy] = useState(false);
    const [form, setForm] = useState({
        type: "",
        title: "",
        objective: "",
        audience: "",
        format: "16:9",
        visual_style: "",
        music_selection: "",
        story_concept: "",
        production_approach: "",
        ai_workflow: "hybrid",
        budget: "",
        timeline: "",
        disclosure_notes: "",
    });

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const submit = async () => {
        setBusy(true);
        try {
            const payload = {
                ...form,
                budget: form.budget ? Number(form.budget) : null,
            };
            const { data } = await api.post("/projects", payload);
            toast.success("Project created.");
            nav(`/projects/${data.id}`);
        } catch (e) {
            toast.error(e?.response?.data?.detail || "Failed to create project");
        } finally {
            setBusy(false);
        }
    };

    // Step 0 — What are you creating?
    if (step === 0) {
        return (
            <div>
                <TopBar
                    subtitle="Create"
                    title="What are you creating?"
                />
                <div className="px-8 md:px-12 py-8">
                    <p className="text-white/60 max-w-2xl text-sm">
                        Pick a starting point. Every project supports the full CYNAIAH
                        workflow — from idea to distribution.
                    </p>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {PROJECT_TYPES.map((t) => (
                            <button
                                key={t.value}
                                data-testid={TID.createTypeOption(t.value)}
                                onClick={() => {
                                    set("type", t.value);
                                    setStep(1);
                                }}
                                className={`text-left glass rounded-xl p-6 glass-hover lift ${form.type === t.value ? "border-cynaiah-cyan/50" : ""}`}
                            >
                                <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                                    Project type
                                </div>
                                <div className="font-heading text-xl mt-2">
                                    {t.label}
                                </div>
                                <div className="text-white/55 text-sm mt-2 leading-relaxed">
                                    {t.blurb}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Steps 1..N — brief details
    const totalSteps = 4;
    return (
        <div>
            <TopBar
                subtitle={`Step ${step} of ${totalSteps}`}
                title="Shape the brief"
                actions={
                    <button
                        onClick={() => (step > 1 ? setStep(step - 1) : setStep(0))}
                        data-testid={TID.createStepBack}
                        className="cyn-btn-ghost rounded-md px-3 py-2 text-sm flex items-center gap-2"
                    >
                        <ArrowLeft size={14} /> Back
                    </button>
                }
            />

            <div className="px-8 md:px-12 py-8 max-w-4xl">
                <div className="mb-8 h-1 rounded-full bg-white/[0.05] overflow-hidden">
                    <div
                        className="h-full cyn-bg-gradient"
                        style={{ width: `${(step / totalSteps) * 100}%` }}
                    />
                </div>

                {step === 1 && (
                    <div className="space-y-6 animate-fade-up">
                        <SectionLabel icon={Sparkles} label="Concept" />
                        <Field label="Project title" required>
                            <input
                                data-testid={TID.createTitleInput}
                                value={form.title}
                                onChange={(e) => set("title", e.target.value)}
                                placeholder="e.g. Neon Heart"
                                className="w-full rounded-md bg-white/[0.03] border border-white/[0.08] px-4 py-3 text-lg text-white placeholder:text-white/30 focus:outline-none focus:border-cynaiah-cyan/60"
                            />
                        </Field>
                        <Field label="Creative objective">
                            <textarea
                                value={form.objective}
                                onChange={(e) => set("objective", e.target.value)}
                                rows={3}
                                placeholder="What is this piece for? What must it achieve emotionally?"
                                className="w-full rounded-md bg-white/[0.03] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cynaiah-cyan/60"
                            />
                        </Field>
                        <Field label="Story / concept">
                            <textarea
                                value={form.story_concept}
                                onChange={(e) => set("story_concept", e.target.value)}
                                rows={5}
                                placeholder="One paragraph. A hook and a world."
                                className="w-full rounded-md bg-white/[0.03] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cynaiah-cyan/60"
                            />
                        </Field>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-fade-up">
                        <SectionLabel icon={Palette} label="Audience & format" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Audience">
                                <input
                                    value={form.audience}
                                    onChange={(e) => set("audience", e.target.value)}
                                    placeholder="18-34, festival circuit, TikTok…"
                                    className="w-full rounded-md bg-white/[0.03] border border-white/[0.08] px-4 py-3 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                                />
                            </Field>
                            <Field label="Format & platform">
                                <input
                                    value={form.format}
                                    onChange={(e) => set("format", e.target.value)}
                                    placeholder="16:9 / 9:16 / 2.39:1 anamorphic"
                                    className="w-full rounded-md bg-white/[0.03] border border-white/[0.08] px-4 py-3 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                                />
                            </Field>
                        </div>
                        <Field label="Visual style">
                            <div className="flex flex-wrap gap-2 mt-2">
                                {STYLES.map((s) => (
                                    <button
                                        type="button"
                                        key={s}
                                        onClick={() => set("visual_style", s)}
                                        className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                                            form.visual_style === s
                                                ? "bg-cynaiah-cyan/20 border-cynaiah-cyan/50 text-white"
                                                : "border-white/10 text-white/70 hover:border-white/25"
                                        }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                            <input
                                value={form.visual_style}
                                onChange={(e) => set("visual_style", e.target.value)}
                                placeholder="Describe further…"
                                className="mt-3 w-full rounded-md bg-white/[0.03] border border-white/[0.08] px-4 py-3 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                            />
                        </Field>
                        <Field label="Music or audio">
                            <input
                                value={form.music_selection}
                                onChange={(e) => set("music_selection", e.target.value)}
                                placeholder="Original score, licensed track, ANCRLAB collab…"
                                className="w-full rounded-md bg-white/[0.03] border border-white/[0.08] px-4 py-3 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                            />
                        </Field>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-fade-up">
                        <SectionLabel icon={Wand2} label="Approach" />
                        <Field label="Production approach">
                            <textarea
                                value={form.production_approach}
                                onChange={(e) => set("production_approach", e.target.value)}
                                rows={3}
                                placeholder="Location shoot, virtual production, hybrid pipeline…"
                                className="w-full rounded-md bg-white/[0.03] border border-white/[0.08] px-4 py-3 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                            />
                        </Field>
                        <Field label="AI workflow">
                            <div className="grid grid-cols-3 gap-3 mt-2">
                                {AI_OPTIONS.map((opt) => (
                                    <button
                                        type="button"
                                        key={opt.value}
                                        onClick={() => set("ai_workflow", opt.value)}
                                        className={`text-left p-4 rounded-lg border transition-colors ${
                                            form.ai_workflow === opt.value
                                                ? "border-cynaiah-cyan/60 bg-white/[0.04]"
                                                : "border-white/[0.08] bg-white/[0.02] hover:border-white/20"
                                        }`}
                                    >
                                        <div className="text-white text-sm">{opt.label}</div>
                                        <div className="text-white/50 text-xs mt-1">
                                            {opt.blurb}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </Field>
                        <Field
                            label={
                                <span className="inline-flex items-center gap-2">
                                    <ShieldCheck size={13} className="text-cynaiah-cyan" />
                                    AI disclosure & rights notes
                                </span>
                            }
                        >
                            <textarea
                                value={form.disclosure_notes}
                                onChange={(e) => set("disclosure_notes", e.target.value)}
                                rows={3}
                                placeholder="What AI tools, if any, will you use? What is human vs AI-generated?"
                                className="w-full rounded-md bg-white/[0.03] border border-white/[0.08] px-4 py-3 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                            />
                        </Field>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-6 animate-fade-up">
                        <SectionLabel icon={Users} label="Logistics" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field
                                label={
                                    <span className="inline-flex items-center gap-2">
                                        <DollarSign size={13} /> Budget (USD)
                                    </span>
                                }
                            >
                                <input
                                    type="number"
                                    value={form.budget}
                                    onChange={(e) => set("budget", e.target.value)}
                                    placeholder="e.g. 4800"
                                    className="w-full rounded-md bg-white/[0.03] border border-white/[0.08] px-4 py-3 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                                />
                            </Field>
                            <Field
                                label={
                                    <span className="inline-flex items-center gap-2">
                                        <Clock size={13} /> Timeline
                                    </span>
                                }
                            >
                                <input
                                    value={form.timeline}
                                    onChange={(e) => set("timeline", e.target.value)}
                                    placeholder="e.g. 6 weeks"
                                    className="w-full rounded-md bg-white/[0.03] border border-white/[0.08] px-4 py-3 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                                />
                            </Field>
                        </div>
                    </div>
                )}

                <div className="mt-10 flex justify-between">
                    <button
                        onClick={() => setStep(step - 1)}
                        className="cyn-btn-ghost rounded-md px-5 py-2.5 text-sm flex items-center gap-2"
                    >
                        <ArrowLeft size={14} /> Back
                    </button>
                    {step < totalSteps ? (
                        <button
                            data-testid={TID.createStepNext}
                            disabled={step === 1 && !form.title}
                            onClick={() => setStep(step + 1)}
                            className="cyn-btn-primary rounded-md px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            Next <ArrowRight size={14} />
                        </button>
                    ) : (
                        <button
                            data-testid={TID.createSubmit}
                            onClick={submit}
                            disabled={busy || !form.title}
                            className="cyn-btn-primary rounded-md px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            {busy ? <Loader2 size={14} className="animate-spin" /> : null}
                            Create project <ArrowRight size={14} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

const SectionLabel = ({ icon: Icon, label }) => (
    <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-cynaiah-cyan">
            <Icon size={16} />
        </div>
        <div className="text-[10px] uppercase tracking-[0.32em] text-white/50">
            {label}
        </div>
    </div>
);

const Field = ({ label, required, children }) => (
    <div>
        <label className="text-[11px] uppercase tracking-[0.24em] text-white/45 flex items-center gap-1">
            {label} {required && <span className="text-cynaiah-magenta">*</span>}
        </label>
        <div className="mt-2">{children}</div>
    </div>
);
