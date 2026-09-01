import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, CheckCheck } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TID } from "@/constants/testIds";
import { api } from "@/lib/api";

const POLL_MS = 15000;

export default function TopBar({ title, subtitle, actions }) {
    const [notes, setNotes] = useState([]);
    const [q, setQ] = useState("");
    const navigate = useNavigate();

    const load = useCallback(() => {
        api.get("/notifications")
            .then((r) => setNotes(r.data))
            .catch(() => {});
    }, []);

    useEffect(() => {
        load();
        const t = setInterval(load, POLL_MS);
        const onFocus = () => load();
        window.addEventListener("focus", onFocus);
        return () => {
            clearInterval(t);
            window.removeEventListener("focus", onFocus);
        };
    }, [load]);

    const unread = notes.filter((n) => !n.read).length;

    const handleOpen = async (n) => {
        // Optimistic mark-as-read, then navigate to the deep link.
        if (!n.read) {
            setNotes((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
            api.post(`/notifications/${n.id}/read`).catch(() => {});
            window.dispatchEvent(new Event("cynaiah:notifications-changed"));
        }
        if (n.deep_link) navigate(n.deep_link);
    };

    const markAllRead = async () => {
        setNotes((prev) => prev.map((x) => ({ ...x, read: true })));
        try {
            await api.post("/notifications/read-all");
        } catch {
            /* silent — polling will reconcile */
        }
        window.dispatchEvent(new Event("cynaiah:notifications-changed"));
    };

    return (
        <div className="sticky top-0 z-20 backdrop-blur-xl bg-[#050506]/80 border-b border-white/[0.05]">
            <div className="flex items-center justify-between gap-6 px-8 py-4">
                <div className="min-w-0">
                    {subtitle && (
                        <div className="text-[10px] uppercase tracking-[0.28em] text-white/40">
                            {subtitle}
                        </div>
                    )}
                    <h1 className="font-heading text-2xl md:text-3xl font-light tracking-tight text-white mt-1 truncate">
                        {title}
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative hidden md:block">
                        <Search
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                        />
                        <input
                            data-testid={TID.topbarSearch}
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search projects, scripts, assets…"
                            className="w-[280px] rounded-md bg-white/[0.04] border border-white/[0.08] pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-cynaiah-cyan/50 focus:bg-white/[0.06] transition-colors"
                        />
                    </div>

                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                data-testid={TID.topbarNotifications}
                                className="relative p-2.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
                            >
                                <Bell size={15} />
                                {unread > 0 && (
                                    <span
                                        data-testid="notif-unread-badge"
                                        className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-semibold bg-cynaiah-magenta text-white flex items-center justify-center"
                                    >
                                        {unread}
                                    </span>
                                )}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent
                            align="end"
                            className="w-[380px] glass-strong border-white/10 text-white p-0"
                            data-testid="notif-popover"
                        >
                            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                                <div className="text-xs uppercase tracking-[0.22em] text-white/40">
                                    Notifications {unread > 0 && <span className="text-cynaiah-cyan ml-1">· {unread} new</span>}
                                </div>
                                {unread > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        data-testid="notif-mark-all-read"
                                        className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.22em] text-white/60 hover:text-white"
                                    >
                                        <CheckCheck size={11} /> Mark all read
                                    </button>
                                )}
                            </div>
                            <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                                {notes.length === 0 && (
                                    <div className="p-6 text-sm text-white/50" data-testid="notif-empty">
                                        No notifications yet.
                                    </div>
                                )}
                                {notes.map((n) => (
                                    <button
                                        key={n.id}
                                        onClick={() => handleOpen(n)}
                                        data-testid={`notif-item-${n.id}`}
                                        className={`w-full text-left px-4 py-3 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.03] transition-colors ${n.read ? "opacity-70" : ""}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span
                                                className={`mt-1.5 status-dot ${n.read ? "text-white/25" : "text-cynaiah-cyan animate-pulse-soft"}`}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm text-white/85 leading-snug">
                                                    {n.message}
                                                </div>
                                                {n.type === "review" && (
                                                    <div className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/45 flex-wrap">
                                                        <span className="text-cynaiah-cyan">{(n.review_kind || "review").replace("_", " ")}</span>
                                                        <span>·</span>
                                                        <span>{n.project_title}</span>
                                                        {n.ancr_ready && (
                                                            <>
                                                                <span>·</span>
                                                                <span
                                                                    data-testid={`notif-ancr-ready-${n.id}`}
                                                                    className="text-cynaiah-gold"
                                                                    title="Envelope is ANCR-integration ready. Local delivery today, ANCR bus when enabled."
                                                                >
                                                                    ANCR-ready
                                                                </span>
                                                            </>
                                                        )}
                                                        {n.deep_link && (
                                                            <>
                                                                <span>·</span>
                                                                <span className="text-white/80">Open →</span>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>

                    {actions}
                </div>
            </div>
        </div>
    );
}
