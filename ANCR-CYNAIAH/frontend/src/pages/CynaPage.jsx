import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import TopBar from "@/components/cynaiah/TopBar";
import { CynaChat } from "@/components/cynaiah/CynaChat";
import { Sparkles, Plus, Trash2 } from "lucide-react";

export default function CynaPage() {
    const [sessions, setSessions] = useState([]);
    const [sessionId, setSessionId] = useState(null);
    const [projectId, setProjectId] = useState("");
    const [projects, setProjects] = useState([]);

    const loadSessions = async () => {
        const { data } = await api.get("/cyna/sessions");
        setSessions(data);
        if (!sessionId && data[0]) setSessionId(data[0].id);
    };

    useEffect(() => {
        loadSessions();
        api.get("/projects").then((r) => {
            setProjects(r.data);
            if (r.data[0]) setProjectId(r.data[0].id);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const newSession = async () => {
        const { data } = await api.post("/cyna/sessions", { project_id: projectId || null });
        setSessionId(data.id);
        loadSessions();
    };

    const remove = async (id) => {
        if (!window.confirm("Delete this conversation?")) return;
        await api.delete(`/cyna/sessions/${id}`);
        if (sessionId === id) setSessionId(null);
        loadSessions();
    };

    return (
        <div>
            <TopBar
                subtitle="Cyna"
                title="Your CYNAIAH mentor"
                actions={
                    <div className="flex items-center gap-2">
                        <select
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                            data-testid="cyna-project-select"
                            className="rounded-md bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 text-xs text-white/85"
                        >
                            <option value="">No project</option>
                            {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                        </select>
                        <button onClick={newSession} data-testid="cyna-new-session-btn" className="cyn-btn-primary rounded-md px-3 py-1.5 text-xs uppercase tracking-[0.22em] inline-flex items-center gap-1.5">
                            <Plus size={12} /> New chat
                        </button>
                    </div>
                }
            />

            <div className="px-8 md:px-12 py-6 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6" style={{ height: "calc(100vh - 130px)" }}>
                <div className="glass rounded-xl p-3 overflow-y-auto custom-scrollbar">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/40 px-2 py-2 flex items-center gap-1.5">
                        <Sparkles size={11} className="text-cynaiah-gold" /> Conversations
                    </div>
                    {sessions.length === 0 && (
                        <div className="px-2 text-white/50 text-sm">No conversations yet. Say hi.</div>
                    )}
                    {sessions.map((s) => (
                        <div
                            key={s.id}
                            className={`group flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer text-sm ${
                                sessionId === s.id ? "bg-white/[0.06] text-white" : "text-white/70 hover:bg-white/[0.03]"
                            }`}
                            onClick={() => setSessionId(s.id)}
                            data-testid={`cyna-session-${s.id}`}
                        >
                            <div className="flex-1 truncate">{s.title || "Conversation"}</div>
                            <button
                                onClick={(e) => { e.stopPropagation(); remove(s.id); }}
                                className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-300"
                                title="Delete"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="glass rounded-xl overflow-hidden min-h-0">
                    <CynaChat sessionId={sessionId} onSessionChange={(id) => { setSessionId(id); loadSessions(); }} projectId={projectId || null} />
                </div>
            </div>
        </div>
    );
}
