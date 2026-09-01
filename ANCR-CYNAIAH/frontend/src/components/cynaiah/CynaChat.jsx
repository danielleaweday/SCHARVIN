import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Send, Sparkles, CheckCircle2, X as XIcon } from "lucide-react";

const KIND_LABEL = {
    draft_script: "Draft a script document",
    add_finishing_note: "Add a finishing note",
    add_shot: "Add a shot",
};

export function CynaChat({ sessionId, onSessionChange, projectId, className = "" }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [session, setSession] = useState(null);
    const listRef = useRef(null);

    const loadSession = async (id) => {
        if (!id) { setMessages([]); setSession(null); return; }
        const { data } = await api.get(`/cyna/sessions/${id}/messages`);
        setSession(data.session);
        setMessages(data.messages);
    };

    useEffect(() => { loadSession(sessionId); }, [sessionId]);

    useEffect(() => {
        if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [messages]);

    const ensureSession = async () => {
        if (sessionId) return sessionId;
        const { data } = await api.post("/cyna/sessions", { project_id: projectId || null });
        onSessionChange?.(data.id);
        setSession(data);
        return data.id;
    };

    const send = async () => {
        const msg = input.trim();
        if (!msg || sending) return;
        setSending(true);
        try {
            const sid = await ensureSession();
            setMessages((m) => [...m, { id: `local-${Date.now()}`, role: "user", content: msg, created_at: new Date().toISOString() }]);
            setInput("");
            const { data } = await api.post(`/cyna/sessions/${sid}/chat`, { message: msg, project_id: projectId || null });
            setMessages((m) => [
                ...m.filter((x) => !x.id.startsWith("local-")),
                data.user_message,
                data.assistant_message,
            ]);
        } catch (e) {
            toast.error(e?.response?.data?.detail || "Cyna is quiet — try again");
        } finally {
            setSending(false);
        }
    };

    const approveAction = async (action) => {
        if (!projectId) return toast.error("Select a project first — Cyna needs somewhere to add this.");
        try {
            await api.post("/cyna/actions/execute", { project_id: projectId, action });
            toast.success(`${KIND_LABEL[action.kind] || action.kind} — added`);
        } catch (e) { toast.error(e?.response?.data?.detail || "Could not apply"); }
    };

    return (
        <div className={`flex flex-col h-full min-h-0 ${className}`} data-testid="cyna-chat">
            {session && (
                <div className="px-4 py-2 border-b border-white/[0.06] text-[10px] uppercase tracking-[0.22em] text-white/40 flex items-center gap-2">
                    <Sparkles size={11} className="text-cynaiah-gold" />
                    {session.title || "Conversation"}
                </div>
            )}

            <div ref={listRef} className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-white/55 text-sm">
                        Hi — I'm Cyna, your CYNAIAH mentor. Ask me about your treatment, shot list, or how to strengthen a scene. I read what's on your project so my notes are grounded in your real work.
                    </div>
                )}
                {messages.map((m) => (
                    <div key={m.id} data-testid={`cyna-msg-${m.role}`}>
                        <div className="text-[9px] uppercase tracking-[0.24em] text-white/40 mb-1">
                            {m.role === "user" ? "You" : "Cyna"}
                        </div>
                        <div className={`whitespace-pre-wrap text-sm leading-relaxed ${m.role === "user" ? "text-white/90" : "text-white/85"}`}>
                            {m.content}
                        </div>
                        {(m.proposed_actions || []).length > 0 && (
                            <div className="mt-3 space-y-2" data-testid="cyna-proposed-actions">
                                {m.proposed_actions.map((a, i) => (
                                    <div key={i} className="glass rounded-md p-3 border border-cynaiah-gold/25 flex items-start gap-2">
                                        <Sparkles size={14} className="text-cynaiah-gold mt-0.5" />
                                        <div className="flex-1 text-[12px] text-white/80">
                                            <div className="text-[10px] uppercase tracking-[0.22em] text-cynaiah-gold mb-1">
                                                {KIND_LABEL[a.kind] || a.kind}
                                            </div>
                                            <div className="whitespace-pre-wrap">
                                                {a.title || a.body || a.description || a.content || "—"}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => approveAction(a)}
                                            data-testid="cyna-approve-btn"
                                            className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-white/80 hover:bg-white/[0.06] hover:text-white transition-colors"
                                        >
                                            <CheckCircle2 size={11} /> Approve
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                {sending && (
                    <div className="text-[10px] uppercase tracking-[0.22em] text-white/40 flex items-center gap-2">
                        <Loader2 size={11} className="animate-spin" /> Cyna is thinking…
                    </div>
                )}
            </div>

            <div className="border-t border-white/[0.06] p-3 flex items-end gap-2">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                    rows={2}
                    placeholder="Ask Cyna anything…"
                    data-testid="cyna-input"
                    className="flex-1 rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-2 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60 resize-none"
                />
                <button
                    onClick={send}
                    disabled={sending || !input.trim()}
                    data-testid="cyna-send-btn"
                    className="cyn-btn-primary rounded-md px-3 py-2 text-xs uppercase tracking-[0.22em] disabled:opacity-40 inline-flex items-center gap-1.5"
                >
                    {sending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                    Send
                </button>
            </div>
        </div>
    );
}

/* Floating bubble — global on every page except /auth */
export function CynaBubble() {
    const [open, setOpen] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [projectId, setProjectId] = useState(null);
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        if (!open || projects.length > 0) return;
        api.get("/projects").then((r) => {
            setProjects(r.data);
            if (!projectId && r.data[0]) setProjectId(r.data[0].id);
        }).catch(() => {});
    }, [open, projects.length, projectId]);

    const startFresh = async () => {
        const { data } = await api.post("/cyna/sessions", { project_id: projectId });
        setSessionId(data.id);
    };

    return (
        <>
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    data-testid="cyna-bubble-open"
                    className="fixed bottom-5 right-5 z-40 rounded-full p-3.5 cyn-btn-primary shadow-[0_0_24px_rgba(255,205,102,0.35)] hover:scale-105 transition-transform"
                    title="Chat with Cyna"
                >
                    <Sparkles size={18} />
                </button>
            )}
            {open && (
                <div
                    className="fixed bottom-5 right-5 z-40 w-[380px] max-w-[92vw] h-[560px] max-h-[80vh] flex flex-col glass-strong rounded-xl overflow-hidden border border-white/[0.08] shadow-2xl"
                    data-testid="cyna-bubble-panel"
                >
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
                        <div className="flex items-center gap-2">
                            <Sparkles size={13} className="text-cynaiah-gold" />
                            <div className="font-heading text-sm text-white">Cyna</div>
                            <span className="text-[9px] uppercase tracking-[0.22em] text-white/40">mentor · advisory</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={projectId || ""}
                                onChange={(e) => setProjectId(e.target.value || null)}
                                className="bg-transparent text-[10px] uppercase tracking-[0.2em] text-white/70 border border-white/[0.08] rounded px-1.5 py-1 max-w-[130px]"
                            >
                                <option value="">No project</option>
                                {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                            </select>
                            <button onClick={startFresh} title="New chat" className="text-[10px] uppercase tracking-[0.22em] text-white/50 hover:text-white">
                                New
                            </button>
                            <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white" data-testid="cyna-bubble-close">
                                <XIcon size={14} />
                            </button>
                        </div>
                    </div>
                    <CynaChat sessionId={sessionId} onSessionChange={setSessionId} projectId={projectId} />
                </div>
            )}
        </>
    );
}
