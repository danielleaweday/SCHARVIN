import { useEffect, useState } from "react";
import { api, resolveAssetUrl } from "@/lib/api";
import { toast } from "sonner";
import {
    Plus,
    Sparkles,
    Loader2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Wand2,
    X,
    UserSquare2,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const SHOT_TYPES = ["EWS", "WS", "MS", "MCU", "CU", "ECU", "OTS", "POV", "insert"];

export default function StoryboardBuilder({ projectId, highlightFrameId = "" }) {
    const [frames, setFrames] = useState([]);
    const [characters, setCharacters] = useState([]);
    const [selected, setSelected] = useState(null); // frame being edited
    const [busy, setBusy] = useState(false);
    const [frameNotes, setFrameNotes] = useState({}); // frame_id -> [reviews]

    // New-frame form
    const [addOpen, setAddOpen] = useState(false);
    const [form, setForm] = useState({
        caption: "",
        shot_type: "MS",
        notes: "",
        prompt: "",
        generate_with_ai: true,
        character_ids: [],
    });

    const load = async () => {
        if (!projectId) return;
        const [f, c] = await Promise.all([
            api.get(`/projects/${projectId}/storyboard-frames`),
            api.get(`/projects/${projectId}/characters`),
        ]);
        setFrames(f.data);
        setCharacters(c.data);
        // Best-effort fetch of frame-pinned reviews. 403 for non-owners is fine.
        try {
            const r = await api.get(`/projects/${projectId}/reviews`);
            const map = {};
            for (const rv of r.data.reviews || []) {
                if (rv.kind === "frame_feedback" && rv.target_ref) {
                    (map[rv.target_ref] ||= []).push(rv);
                }
            }
            setFrameNotes(map);
        } catch {
            setFrameNotes({});
        }
    };

    useEffect(() => {
        load();
        setSelected(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    // Scroll + highlight the requested frame after data loads.
    useEffect(() => {
        if (!highlightFrameId || frames.length === 0) return;
        const target = frames.find((f) => f.id === highlightFrameId);
        if (target) setSelected(target);
        const el = document.querySelector(`[data-testid="storyboard-frame-${highlightFrameId}"]`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, [highlightFrameId, frames]);

    const addFrame = async () => {
        if (form.generate_with_ai && !form.prompt.trim())
            return toast.error("Prompt required for AI generation.");
        setBusy(true);
        try {
            const { data } = await api.post("/storyboard-frames", {
                project_id: projectId,
                caption: form.caption,
                shot_type: form.shot_type,
                notes: form.notes,
                prompt: form.prompt,
                generate_with_ai: form.generate_with_ai,
                style: "cinematic storyboard frame, filmic composition, moody light",
                character_ids: form.character_ids,
            });
            setFrames((f) => [...f, data]);
            setForm({
                caption: "",
                shot_type: "MS",
                notes: "",
                prompt: "",
                generate_with_ai: true,
                character_ids: [],
            });
            setAddOpen(false);
            toast.success(
                form.character_ids.length
                    ? `Frame generated with ${form.character_ids.length} character lock${form.character_ids.length > 1 ? "s" : ""}.`
                    : form.generate_with_ai
                    ? "Frame generated."
                    : "Frame added.",
            );
        } catch (e) {
            toast.error(e?.response?.data?.detail || "Failed to add frame");
        } finally {
            setBusy(false);
        }
    };

    const saveEdit = async () => {
        if (!selected) return;
        const { data } = await api.patch(`/storyboard-frames/${selected.id}`, {
            caption: selected.caption,
            shot_type: selected.shot_type,
            notes: selected.notes,
        });
        setFrames((f) => f.map((x) => (x.id === data.id ? data : x)));
        setSelected(data);
        toast.success("Frame saved.");
    };

    const remove = async (id) => {
        if (!window.confirm("Delete this frame?")) return;
        await api.delete(`/storyboard-frames/${id}`);
        setFrames((f) => f.filter((x) => x.id !== id));
        if (selected?.id === id) setSelected(null);
    };

    const move = async (id, delta) => {
        const idx = frames.findIndex((f) => f.id === id);
        if (idx < 0) return;
        const newOrder = Math.max(0, Math.min(frames.length - 1, idx + delta));
        if (newOrder === idx) return;
        await api.post(`/storyboard-frames/${id}/reorder`, { new_order: newOrder });
        await load();
        setSelected((s) => (s ? frames.find((x) => x.id === s.id) || s : null));
    };

    if (!projectId) {
        return (
            <div className="px-8 md:px-12 py-12 text-white/60">
                Select a project to build its storyboard.
            </div>
        );
    }

    return (
        <div className="px-8 md:px-12 py-8 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                            Storyboard
                        </div>
                        <div className="font-heading text-2xl text-white mt-1">
                            {frames.length} frame{frames.length !== 1 && "s"}
                        </div>
                    </div>
                    <button
                        onClick={() => setAddOpen((s) => !s)}
                        className="cyn-btn-primary rounded-md px-4 py-2 text-sm flex items-center gap-2"
                    >
                        <Plus size={14} /> Add frame
                    </button>
                </div>

                {/* Add form */}
                {addOpen && (
                    <div className="glass rounded-xl p-5 animate-fade-up">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                                New frame
                            </div>
                            <button
                                onClick={() => setAddOpen(false)}
                                className="text-white/40 hover:text-white"
                            >
                                <X size={14} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-3">
                            <input
                                value={form.caption}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, caption: e.target.value }))
                                }
                                placeholder="Caption — one line about this frame"
                                className="rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                            />
                            <Select
                                value={form.shot_type}
                                onValueChange={(v) => setForm((f) => ({ ...f, shot_type: v }))}
                            >
                                <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0A0A0C] border-white/10 text-white">
                                    {SHOT_TYPES.map((s) => (
                                        <SelectItem key={s} value={s}>
                                            {s}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <textarea
                            value={form.prompt}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, prompt: e.target.value }))
                            }
                            rows={3}
                            placeholder="Image prompt — describe the shot in cinematic terms (lens, mood, palette, subject action)"
                            className="mt-3 w-full rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-3 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                        />
                        <label className="mt-3 inline-flex items-center gap-2 text-xs text-white/70">
                            <input
                                type="checkbox"
                                checked={form.generate_with_ai}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        generate_with_ai: e.target.checked,
                                    }))
                                }
                                className="w-4 h-4 accent-cynaiah-cyan"
                            />
                            <Sparkles size={12} className="text-cynaiah-cyan" />
                            Generate with Gemini Nano Banana
                        </label>

                        {/* Character consistency selector */}
                        {form.generate_with_ai && characters.length > 0 && (
                            <div className="mt-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <UserSquare2 size={12} className="text-cynaiah-magenta" />
                                    <div className="text-[10px] uppercase tracking-[0.22em] text-white/50">
                                        Character consistency
                                    </div>
                                    {form.character_ids.length > 0 && (
                                        <span className="text-[10px] uppercase tracking-[0.2em] text-cynaiah-cyan">
                                            {form.character_ids.length} locked
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {characters.map((c) => {
                                        const active = form.character_ids.includes(c.id);
                                        return (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() =>
                                                    setForm((f) => ({
                                                        ...f,
                                                        character_ids: active
                                                            ? f.character_ids.filter((x) => x !== c.id)
                                                            : [...f.character_ids, c.id],
                                                    }))
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
                                                            src={resolveAssetUrl(c.reference_image_urls[0])}
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
                                <div className="mt-2 text-[10px] uppercase tracking-[0.22em] text-white/35">
                                    Reference images and locked attributes are sent with the prompt
                                </div>
                            </div>
                        )}

                        <button
                            onClick={addFrame}
                            disabled={busy}
                            className="cyn-btn-primary mt-4 rounded-md px-5 py-2.5 text-sm flex items-center gap-2 disabled:opacity-60"
                        >
                            {busy ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <Wand2 size={14} />
                            )}
                            {busy ? "Working…" : "Add frame"}
                        </button>
                    </div>
                )}

                {/* Frames grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {frames.map((f, i) => {
                        const isHighlighted = f.id === highlightFrameId;
                        const notes = (frameNotes[f.id] || []).filter((n) => !n.superseded_by);
                        return (
                            <button
                                key={f.id}
                                onClick={() => setSelected(f)}
                                data-testid={`storyboard-frame-${f.id}`}
                                className={`text-left rounded-lg overflow-hidden border transition-all glass-hover lift ${
                                    isHighlighted
                                        ? "border-cynaiah-cyan ring-2 ring-cynaiah-cyan/50 shadow-[0_0_24px_rgba(56,189,248,0.35)]"
                                        : selected?.id === f.id
                                        ? "border-cynaiah-cyan/60"
                                        : "border-white/[0.06]"
                                } bg-[#0C0C10]`}
                            >
                                <div className="aspect-[16/10] relative bg-black">
                                    {f.image_url ? (
                                        <img
                                            src={resolveAssetUrl(f.image_url)}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/25 text-xs">
                                            No image
                                        </div>
                                    )}
                                    <div className="absolute top-2 left-2 font-mono text-[10px] uppercase tracking-[0.2em] px-1.5 py-0.5 rounded bg-black/70 border border-white/10 text-white/80">
                                        #{String(i + 1).padStart(2, "0")} · {f.shot_type}
                                    </div>
                                    {notes.length > 0 && (
                                        <div
                                            data-testid={`storyboard-frame-note-badge-${f.id}`}
                                            className="absolute bottom-2 left-2 text-[9px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded bg-cynaiah-gold/90 text-black font-medium"
                                            title={`${notes.length} faculty note${notes.length === 1 ? "" : "s"}`}
                                        >
                                            {notes.length} note{notes.length === 1 ? "" : "s"}
                                        </div>
                                    )}
                                    {f.source === "ai_generated" && (
                                        <div className="absolute top-2 right-2 text-[9px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded bg-cynaiah-magenta/25 border border-cynaiah-magenta/40 text-cynaiah-magenta">
                                            AI
                                    </div>
                                )}
                            </div>
                            <div className="p-3">
                                <div className="text-[13px] text-white/85 line-clamp-2 leading-snug">
                                    {f.caption || "—"}
                                </div>
                            </div>
                        </button>
                        );
                    })}
                    {frames.length === 0 && (
                        <div className="col-span-full py-16 text-center text-white/50">
                            No frames yet. Add your first — or generate one with AI.
                        </div>
                    )}
                </div>
            </div>

            {/* Right rail — edit selected frame */}
            <div className="glass rounded-xl p-5 h-fit sticky top-6">
                {!selected && (
                    <div className="text-sm text-white/50">
                        Tap a frame to edit it here.
                    </div>
                )}
                {selected && (
                    <div>
                        <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                            Frame #
                            {String(
                                frames.findIndex((x) => x.id === selected.id) + 1,
                            ).padStart(2, "0")}
                        </div>

                        <div className="mt-3 rounded-lg overflow-hidden border border-white/[0.06] aspect-[16/10] bg-black">
                            {selected.image_url && (
                                <img
                                    src={resolveAssetUrl(selected.image_url)}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>

                        <label className="mt-4 block text-[11px] uppercase tracking-[0.22em] text-white/45">
                            Caption
                        </label>
                        <textarea
                            value={selected.caption || ""}
                            onChange={(e) =>
                                setSelected((s) => ({ ...s, caption: e.target.value }))
                            }
                            rows={2}
                            className="mt-2 w-full rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                        />

                        {(frameNotes[selected.id] || []).length > 0 && (
                            <div
                                className="mt-4 rounded-md border border-cynaiah-gold/30 bg-cynaiah-gold/[0.05] p-3"
                                data-testid={`storyboard-frame-notes-panel-${selected.id}`}
                            >
                                <div className="text-[10px] uppercase tracking-[0.22em] text-cynaiah-gold mb-2">
                                    Faculty notes on this frame
                                </div>
                                <div className="space-y-2">
                                    {(frameNotes[selected.id] || []).map((n) => (
                                        <div
                                            key={n.id}
                                            className={`text-[12px] leading-snug ${
                                                n.superseded_by ? "text-white/40 line-through" : "text-white/85"
                                            }`}
                                        >
                                            <span className="text-white/50 mr-1.5">
                                                {n.author?.name || "Faculty"}:
                                            </span>
                                            {n.message}
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-2 text-[9px] uppercase tracking-[0.22em] text-white/40">
                                    Append-only — nothing is silently overwritten.
                                </div>
                            </div>
                        )}

                        <label className="mt-3 block text-[11px] uppercase tracking-[0.22em] text-white/45">
                            Shot type
                        </label>
                        <Select
                            value={selected.shot_type}
                            onValueChange={(v) =>
                                setSelected((s) => ({ ...s, shot_type: v }))
                            }
                        >
                            <SelectTrigger className="mt-2 bg-white/[0.03] border-white/[0.08] text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0A0A0C] border-white/10 text-white">
                                {SHOT_TYPES.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <label className="mt-3 block text-[11px] uppercase tracking-[0.22em] text-white/45">
                            Notes
                        </label>
                        <textarea
                            value={selected.notes || ""}
                            onChange={(e) =>
                                setSelected((s) => ({ ...s, notes: e.target.value }))
                            }
                            rows={3}
                            placeholder="Camera, lens, blocking, coverage…"
                            className="mt-2 w-full rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                        />

                        <div className="mt-4 flex items-center gap-2">
                            <button
                                onClick={saveEdit}
                                className="cyn-btn-primary rounded-md px-4 py-2 text-sm flex-1"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => move(selected.id, -1)}
                                title="Move earlier"
                                className="p-2 rounded-md border border-white/10 text-white/60 hover:text-white"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            <button
                                onClick={() => move(selected.id, 1)}
                                title="Move later"
                                className="p-2 rounded-md border border-white/10 text-white/60 hover:text-white"
                            >
                                <ChevronRight size={14} />
                            </button>
                            <button
                                onClick={() => remove(selected.id)}
                                className="p-2 rounded-md border border-white/10 text-white/60 hover:text-red-300 hover:border-red-500/40 transition-colors"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
