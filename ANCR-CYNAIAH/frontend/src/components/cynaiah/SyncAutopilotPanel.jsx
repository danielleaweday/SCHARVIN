import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Sparkles, Loader2, Check, X, Wand2 } from "lucide-react";

const CUE_COLOR = {
    beat: "text-cynaiah-cyan",
    cut: "text-cynaiah-magenta",
    lyric: "text-cynaiah-gold",
    emotion: "text-cynaiah-violet",
    transition: "text-cynaiah-orange",
    scene: "text-white/80",
};

const fmt = (s) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** Suggests cue markers; the student approves each one before it becomes real. */
export default function SyncAutopilotPanel({ projectId, onAccepted }) {
    const [busy, setBusy] = useState(false);
    const [items, setItems] = useState([]); // suggestions
    const [ranAt, setRanAt] = useState(null);

    const suggest = async () => {
        setBusy(true);
        try {
            const { data } = await api.post(
                `/projects/${projectId}/autopilot/suggest-cues`,
            );
            setItems(
                (data.cues || []).map((c) => ({
                    ...c,
                    _status: "pending", // pending | accepted | dismissed
                })),
            );
            setRanAt(new Date());
            toast.success(
                `Autopilot suggested ${data.count} markers. Approve the ones you like.`,
            );
        } catch (e) {
            toast.error(e?.response?.data?.detail || "Autopilot failed");
        } finally {
            setBusy(false);
        }
    };

    const accept = async (idx) => {
        const c = items[idx];
        try {
            const { data } = await api.post("/cues", {
                project_id: projectId,
                timestamp: c.timestamp,
                label: c.label,
                type: c.type,
            });
            setItems((it) =>
                it.map((x, i) => (i === idx ? { ...x, _status: "accepted" } : x)),
            );
            onAccepted?.(data);
        } catch (e) {
            toast.error("Failed to add cue");
        }
    };

    const dismiss = (idx) =>
        setItems((it) =>
            it.map((x, i) => (i === idx ? { ...x, _status: "dismissed" } : x)),
        );

    const acceptAll = async () => {
        for (let i = 0; i < items.length; i++) {
            if (items[i]._status === "pending") {
                // eslint-disable-next-line no-await-in-loop
                await accept(i);
            }
        }
        toast.success("Accepted all suggestions.");
    };

    return (
        <div className="glass rounded-xl p-5">
            <div className="flex items-center gap-2 flex-wrap">
                <Wand2 size={14} className="text-cynaiah-cyan" />
                <div className="text-[10px] uppercase tracking-[0.24em] text-white/50">
                    Sync Autopilot · Claude Sonnet 4.5
                </div>
                <span className="ml-auto text-[10px] uppercase tracking-[0.22em] text-white/40">
                    Suggests · you approve
                </span>
            </div>
            <p className="mt-2 text-xs text-white/60 leading-relaxed">
                Autopilot proposes musical section boundaries and cue placements
                based on the track and your visual style. It assists creative
                judgment — every marker only becomes a real cue when you accept it.
            </p>

            <div className="mt-4 flex gap-2 flex-wrap">
                <button
                    onClick={suggest}
                    disabled={busy}
                    className="cyn-btn-primary rounded-md px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-60"
                >
                    {busy ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        <Sparkles size={14} />
                    )}
                    {busy ? "Listening…" : items.length ? "Suggest again" : "Suggest cue markers"}
                </button>
                {items.some((c) => c._status === "pending") && (
                    <button
                        onClick={acceptAll}
                        className="cyn-btn-ghost rounded-md px-4 py-2 text-sm flex items-center gap-2"
                    >
                        <Check size={13} /> Accept all pending
                    </button>
                )}
            </div>

            {ranAt && (
                <div className="mt-4 text-[10px] uppercase tracking-[0.22em] text-white/40">
                    Suggested {items.length} · {items.filter((c) => c._status === "accepted").length} accepted
                </div>
            )}

            {items.length > 0 && (
                <div className="mt-3 space-y-2 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
                    {items.map((c, i) => (
                        <div
                            key={i}
                            className={`rounded-md border p-3 transition-colors ${
                                c._status === "accepted"
                                    ? "border-emerald-500/40 bg-emerald-500/[0.05]"
                                    : c._status === "dismissed"
                                    ? "border-white/[0.05] bg-white/[0.02] opacity-40"
                                    : "border-white/[0.06] bg-white/[0.02]"
                            }`}
                        >
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="font-mono text-[13px] text-white/70 w-14">
                                    {fmt(c.timestamp)}
                                </span>
                                <span
                                    className={`text-[10px] uppercase tracking-[0.22em] w-20 ${CUE_COLOR[c.type]}`}
                                >
                                    {c.type}
                                </span>
                                <span className="flex-1 min-w-0 text-sm text-white/90 truncate">
                                    {c.label}
                                </span>
                                {c._status === "pending" && (
                                    <>
                                        <button
                                            onClick={() => accept(i)}
                                            title="Accept & add cue"
                                            className="p-1.5 rounded-md border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
                                        >
                                            <Check size={13} />
                                        </button>
                                        <button
                                            onClick={() => dismiss(i)}
                                            title="Dismiss"
                                            className="p-1.5 rounded-md border border-white/10 text-white/60 hover:text-white"
                                        >
                                            <X size={13} />
                                        </button>
                                    </>
                                )}
                                {c._status === "accepted" && (
                                    <span className="text-[10px] uppercase tracking-[0.22em] text-emerald-300 flex items-center gap-1">
                                        <Check size={11} /> Added
                                    </span>
                                )}
                                {c._status === "dismissed" && (
                                    <span className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                                        Dismissed
                                    </span>
                                )}
                            </div>
                            {c.reason && (
                                <div className="mt-1 pl-[92px] text-[11px] text-white/50 leading-snug">
                                    {c.reason}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
