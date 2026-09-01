import { useEffect, useState } from "react";
import { api, API, resolveAssetUrl, getToken } from "@/lib/api";
import { toast } from "sonner";
import TopBar from "@/components/cynaiah/TopBar";
import {
    Film,
    Upload,
    Captions as CaptionsIcon,
    List,
    Palette,
    Package,
    CheckCircle2,
    Circle,
    Loader2,
    Send,
    ShieldCheck,
    AlertTriangle,
    Trash2,
    Plus,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const TABS = [
    { key: "versions", label: "Versions", icon: Film },
    { key: "captions", label: "Captions & A11y", icon: CaptionsIcon },
    { key: "credits", label: "Credits", icon: List },
    { key: "finishing", label: "Finishing Notes", icon: Palette },
    { key: "delivery", label: "Delivery", icon: Package },
];

const STAGE_TONE = {
    rough_cut: { label: "Rough cut", cls: "bg-white/[0.06] text-white/75 border-white/10" },
    fine_cut: { label: "Fine cut", cls: "bg-cynaiah-cyan/15 text-cynaiah-cyan border-cynaiah-cyan/30" },
    picture_lock: { label: "Picture lock", cls: "bg-cynaiah-violet/15 text-cynaiah-violet border-cynaiah-violet/30" },
    final: { label: "Final", cls: "bg-cynaiah-gold/15 text-cynaiah-gold border-cynaiah-gold/30" },
};

const APPROVAL_TONE = {
    draft: { label: "Draft", cls: "bg-white/[0.05] text-white/60" },
    submitted: { label: "Submitted", cls: "bg-cynaiah-cyan/15 text-cynaiah-cyan" },
    changes_requested: { label: "Changes requested", cls: "bg-cynaiah-orange/15 text-cynaiah-orange" },
    approved: { label: "Approved", cls: "bg-emerald-500/15 text-emerald-300" },
};

const fmtDuration = (t) => {
    if (!t && t !== 0) return "—";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
};

export default function EditFinish() {
    const [projects, setProjects] = useState([]);
    const [projectId, setProjectId] = useState("");
    const [data, setData] = useState(null);
    const [tab, setTab] = useState("versions");

    useEffect(() => {
        api.get("/projects").then((r) => {
            setProjects(r.data);
            if (!projectId && r.data[0]) setProjectId(r.data[0].id);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const load = async () => {
        if (!projectId) return;
        try {
            const { data } = await api.get(`/projects/${projectId}/finish/overview`);
            setData(data);
        } catch (e) {
            toast.error(e?.response?.data?.detail || "Could not load Edit & Finish");
        }
    };

    useEffect(() => { load(); /* eslint-disable-next-line */ }, [projectId]);

    if (!projectId) return <TopBar subtitle="Edit & Finish" title="Loading…" />;
    if (!data) return <TopBar subtitle="Edit & Finish" title="Loading…" />;

    return (
        <div>
            <TopBar
                subtitle="Edit & Finish"
                title={data.project.title}
                actions={
                    <Select value={projectId} onValueChange={setProjectId}>
                        <SelectTrigger className="w-[240px] bg-white/[0.04] border-white/[0.08] text-white/85 h-9" data-testid="ef-project-select">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {projects.map((p) => (
                                <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                }
            />

            <div className="px-8 md:px-12 pt-6 overflow-x-auto">
                <div className="inline-flex glass rounded-full p-1 gap-1 whitespace-nowrap">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            data-testid={`ef-tab-${t.key}`}
                            className={`px-4 py-2 rounded-full text-xs uppercase tracking-[0.22em] flex items-center gap-2 transition-colors ${
                                tab === t.key ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80"
                            }`}
                        >
                            <t.icon size={13} /> {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {tab === "versions" && <VersionsTab data={data} projectId={projectId} onChange={load} />}
            {tab === "captions" && <CaptionsAccessibilityTab data={data} projectId={projectId} onChange={load} />}
            {tab === "credits" && <CreditsTab data={data} projectId={projectId} onChange={load} />}
            {tab === "finishing" && <FinishingTab data={data} projectId={projectId} onChange={load} />}
            {tab === "delivery" && <DeliveryTab data={data} projectId={projectId} onChange={load} />}
        </div>
    );
}

/* ---------------- Versions ---------------- */
function VersionsTab({ data, projectId, onChange }) {
    const [adding, setAdding] = useState(false);
    const [form, setForm] = useState({ title: "", stage: "rough_cut", notes: "" });
    const [uploadingId, setUploadingId] = useState(null);

    const create = async () => {
        if (!form.title.trim()) return toast.error("Title required");
        try {
            await api.post(`/projects/${projectId}/finish/version`, form);
            toast.success("Version created");
            setAdding(false); setForm({ title: "", stage: "rough_cut", notes: "" });
            onChange();
        } catch (e) { toast.error(e?.response?.data?.detail || "Could not create version"); }
    };

    const uploadVideo = async (versionId, file) => {
        setUploadingId(versionId);
        const fd = new FormData(); fd.append("file", file);
        try {
            const res = await fetch(`${API}/finish/version/${versionId}/upload`, {
                method: "POST",
                headers: { Authorization: `Bearer ${getToken()}` },
                body: fd,
            });
            if (!res.ok) throw new Error((await res.json())?.detail || "upload failed");
            toast.success("Video uploaded");
            onChange();
        } catch (e) { toast.error(e.message); }
        finally { setUploadingId(null); }
    };

    const remove = async (id) => {
        if (!window.confirm("Delete this version?")) return;
        await api.delete(`/finish/${'version'}/${id}`);
        toast.success("Version deleted");
        onChange();
    };

    return (
        <div className="px-8 md:px-12 py-6 space-y-4">
            <div className="flex justify-between items-center">
                <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                    {data.versions.length} version{data.versions.length === 1 ? "" : "s"}
                </div>
                <button
                    onClick={() => setAdding((v) => !v)}
                    data-testid="ef-version-add-btn"
                    className="cyn-btn-primary rounded-md px-4 py-2 text-xs uppercase tracking-[0.22em] inline-flex items-center gap-2"
                >
                    <Plus size={12} /> {adding ? "Cancel" : "New version"}
                </button>
            </div>

            {adding && (
                <div className="glass rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                        value={form.title}
                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                        placeholder="Version title"
                        data-testid="ef-version-title-input"
                        className="rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-2 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                    />
                    <select
                        value={form.stage}
                        onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value }))}
                        data-testid="ef-version-stage-select"
                        className="rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-2 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                    >
                        {data.stages.map((s) => <option key={s} value={s}>{STAGE_TONE[s]?.label || s}</option>)}
                    </select>
                    <button onClick={create} data-testid="ef-version-submit-btn" className="cyn-btn-primary rounded-md px-4 py-2 text-xs uppercase tracking-[0.22em]">
                        Create
                    </button>
                    <textarea
                        value={form.notes}
                        onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                        placeholder="Notes (optional)"
                        rows={2}
                        className="md:col-span-3 rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-2 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                    />
                </div>
            )}

            {data.versions.length === 0 && !adding && (
                <div className="glass rounded-xl p-10 text-center text-white/55">
                    No versions yet. Start with a rough cut.
                </div>
            )}

            <div className="space-y-3">
                {data.versions.map((v) => {
                    const stage = STAGE_TONE[v.stage] || STAGE_TONE.rough_cut;
                    const appr = APPROVAL_TONE[v.approval_status] || APPROVAL_TONE.draft;
                    return (
                        <div key={v.id} data-testid={`ef-version-${v.id}`} className="glass rounded-xl p-5">
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-[11px] text-white/45">v{v.version_number}</span>
                                        <span className={`text-[10px] uppercase tracking-[0.22em] px-2.5 py-1 rounded-full border ${stage.cls}`}>{stage.label}</span>
                                        <span className={`text-[10px] uppercase tracking-[0.22em] px-2.5 py-1 rounded-full ${appr.cls}`}>{appr.label}</span>
                                    </div>
                                    <div className="font-heading text-lg text-white mt-1">{v.title}</div>
                                    {v.notes && <div className="text-white/60 text-sm mt-1">{v.notes}</div>}
                                    {v.approval_message && (
                                        <div className="text-cynaiah-cyan/85 text-[12px] mt-1">Faculty: {v.approval_message}</div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-white/80 hover:bg-white/[0.06] cursor-pointer">
                                        {uploadingId === v.id ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
                                        {v.video_url ? "Replace" : "Upload"}
                                        <input
                                            type="file"
                                            accept="video/mp4,video/quicktime,video/webm"
                                            className="hidden"
                                            data-testid={`ef-version-upload-${v.id}`}
                                            onChange={(e) => e.target.files?.[0] && uploadVideo(v.id, e.target.files[0])}
                                        />
                                    </label>
                                    <button onClick={() => remove(v.id)} className="text-white/30 hover:text-red-300 p-1.5" title="Delete">
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                            {v.video_url && (
                                <video
                                    controls
                                    src={resolveAssetUrl(v.video_url)}
                                    className="mt-3 w-full rounded-lg border border-white/[0.06] max-h-[380px] bg-black"
                                    data-testid={`ef-version-player-${v.id}`}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Faculty time-coded reviews on the latest version */}
            {data.time_coded_reviews.length > 0 && (
                <div className="glass rounded-xl p-5" data-testid="ef-time-coded-reviews">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/40 mb-2">Faculty time-coded reviews</div>
                    <div className="space-y-2">
                        {data.time_coded_reviews.map((r) => (
                            <div key={r.id} className={`text-sm flex items-start gap-3 ${r.superseded_by ? "text-white/40 line-through" : "text-white/85"}`}>
                                <span className="font-mono text-cynaiah-cyan w-14">{fmtDuration(r.timestamp_seconds)}</span>
                                <span>{r.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ---------------- Captions & Accessibility ---------------- */
function CaptionsAccessibilityTab({ data, projectId, onChange }) {
    const [form, setForm] = useState({ language: "en", filename: "", url: "", format: "srt" });
    const [busy, setBusy] = useState(false);

    const addCaption = async () => {
        if (!form.filename || !form.url) return toast.error("Filename + URL required");
        setBusy(true);
        try { await api.post(`/projects/${projectId}/finish/caption`, form); toast.success("Caption logged"); setForm({ language: "en", filename: "", url: "", format: "srt" }); onChange(); }
        catch (e) { toast.error(e?.response?.data?.detail || "Failed"); }
        finally { setBusy(false); }
    };

    const removeCaption = async (id) => {
        await api.delete(`/finish/caption/${id}`); onChange();
    };

    return (
        <div className="px-8 md:px-12 py-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="space-y-3">
                <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">Caption files</div>
                <div className="glass rounded-xl p-4 grid grid-cols-4 gap-2">
                    <input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} placeholder="lang" className="rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-2 text-sm text-white" />
                    <input value={form.filename} onChange={(e) => setForm({ ...form, filename: e.target.value })} placeholder="filename.srt" className="col-span-2 rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-2 text-sm text-white" />
                    <select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })} className="rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-2 text-sm text-white">
                        <option value="srt">SRT</option><option value="vtt">VTT</option>
                    </select>
                    <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="URL or path" className="col-span-3 rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-2 text-sm text-white" />
                    <button onClick={addCaption} disabled={busy} data-testid="ef-caption-add-btn" className="cyn-btn-primary rounded-md px-3 py-2 text-xs uppercase tracking-[0.22em]">
                        {busy ? <Loader2 size={12} className="animate-spin" /> : "Add"}
                    </button>
                </div>
                {data.captions.length === 0 && <div className="text-white/50 text-sm">No caption files yet.</div>}
                {data.captions.map((c) => (
                    <div key={c.id} className="glass rounded-md p-3 flex items-center justify-between" data-testid={`ef-caption-${c.id}`}>
                        <div>
                            <div className="text-white/85 text-sm">{c.filename}</div>
                            <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">{c.language} · {c.format}</div>
                        </div>
                        <button onClick={() => removeCaption(c.id)} className="text-white/30 hover:text-red-300 p-1"><Trash2 size={13} /></button>
                    </div>
                ))}
            </div>
            <ChecklistCard title="Accessibility checklist" kind="accessibility" projectId={projectId} initial={data.accessibility} onChange={onChange} />
        </div>
    );
}

/* ---------------- Credits ---------------- */
function CreditsTab({ data, projectId, onChange }) {
    return (
        <div className="px-8 md:px-12 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <CreditsSection title="Opening credits" section="opening" projectId={projectId} credits={data.credits} onChange={onChange} />
            <CreditsSection title="Closing credits" section="closing" projectId={projectId} credits={data.credits} onChange={onChange} />
        </div>
    );
}

function CreditsSection({ title, section, projectId, credits, onChange }) {
    const rows = credits.filter((c) => c.section === section);
    const [form, setForm] = useState({ name: "", role: "", notes: "" });
    const add = async () => {
        if (!form.name || !form.role) return toast.error("Name + role required");
        await api.post(`/projects/${projectId}/finish/credit`, { ...form, section, position: rows.length });
        setForm({ name: "", role: "", notes: "" });
        onChange();
    };
    const remove = async (id) => { await api.delete(`/finish/credit/${id}`); onChange(); };
    return (
        <div className="glass rounded-xl p-5" data-testid={`ef-credits-${section}`}>
            <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">{title}</div>
            <div className="mt-3 grid grid-cols-3 gap-2">
                <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Role" className="rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-2 text-sm text-white" />
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-2 text-sm text-white" />
                <button onClick={add} data-testid={`ef-credit-add-${section}`} className="cyn-btn-primary rounded-md px-3 py-2 text-xs uppercase tracking-[0.22em]">Add</button>
                <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes (optional)" className="col-span-3 rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-2 text-sm text-white" />
            </div>
            <div className="mt-3 space-y-1.5">
                {rows.length === 0 && <div className="text-white/50 text-sm">No credits yet.</div>}
                {rows.map((c) => (
                    <div key={c.id} className="flex items-center justify-between text-sm">
                        <div className="text-white/70 flex-1 pr-2"><span className="text-white/45 uppercase text-[10px] tracking-[0.22em] mr-3">{c.role}</span><span className="text-white/85">{c.name}</span></div>
                        <button onClick={() => remove(c.id)} className="text-white/30 hover:text-red-300"><Trash2 size={13} /></button>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ---------------- Finishing ---------------- */
function FinishingTab({ data, projectId, onChange }) {
    const [form, setForm] = useState({ category: "color", body: "" });
    const add = async () => {
        if (!form.body.trim()) return toast.error("Write a note first");
        await api.post(`/projects/${projectId}/finish/note`, form);
        setForm({ category: "color", body: "" });
        onChange();
    };
    const toggleResolved = async (n) => { await api.patch(`/finish/note/${n.id}`, { resolved: !n.resolved }); onChange(); };
    const remove = async (id) => { await api.delete(`/finish/note/${id}`); onChange(); };
    const buckets = ["color", "sound", "vfx", "general"];
    return (
        <div className="px-8 md:px-12 py-6 space-y-4">
            <div className="glass rounded-xl p-5 grid grid-cols-4 gap-2">
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} data-testid="ef-finishing-category" className="rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-2 text-sm text-white">
                    {buckets.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                <input value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="e.g. Push warmth on scene 2 exteriors" data-testid="ef-finishing-body" className="col-span-2 rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-2 text-sm text-white" />
                <button onClick={add} data-testid="ef-finishing-add-btn" className="cyn-btn-primary rounded-md px-3 py-2 text-xs uppercase tracking-[0.22em]">Add note</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {buckets.map((b) => {
                    const rows = data.finishing_notes.filter((n) => n.category === b);
                    return (
                        <div key={b} className="glass rounded-xl p-4" data-testid={`ef-finishing-bucket-${b}`}>
                            <div className="text-[10px] uppercase tracking-[0.24em] text-white/40 mb-2">{b} ({rows.length})</div>
                            <div className="space-y-2">
                                {rows.length === 0 && <div className="text-white/50 text-sm">—</div>}
                                {rows.map((n) => (
                                    <div key={n.id} className={`text-sm ${n.resolved ? "text-white/40 line-through" : "text-white/85"} flex items-start gap-2`}>
                                        <button onClick={() => toggleResolved(n)} className="mt-0.5">
                                            {n.resolved ? <CheckCircle2 size={14} className="text-emerald-300" /> : <Circle size={14} className="text-white/40" />}
                                        </button>
                                        <div className="flex-1">{n.body}</div>
                                        <button onClick={() => remove(n.id)} className="text-white/30 hover:text-red-300"><Trash2 size={12} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ---------------- Delivery ---------------- */
function DeliveryTab({ data, projectId, onChange }) {
    const [gate, setGate] = useState(null);
    useEffect(() => { api.get(`/projects/${projectId}/finish/final-gate`).then((r) => setGate(r.data)); }, [projectId, data]);
    return (
        <div className="px-8 md:px-12 py-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ChecklistCard title="Final delivery checklist" kind="delivery" projectId={projectId} initial={data.delivery} onChange={onChange} />
            <div className="glass rounded-xl p-5" data-testid="ef-final-gate">
                <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className={gate?.ok ? "text-emerald-300" : "text-cynaiah-orange"} />
                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">Final approval gate</div>
                </div>
                <div className="mt-2 text-white/85 text-sm">
                    {gate === null && "Checking…"}
                    {gate?.ok && (
                        <span className="text-emerald-300">
                            Ready for final faculty approval. Rights + accessibility + delivery all clear.
                        </span>
                    )}
                    {gate && !gate.ok && (
                        <div>
                            <div className="text-cynaiah-orange flex items-center gap-1.5 text-[11px] uppercase tracking-[0.22em]">
                                <AlertTriangle size={12} /> Final approval blocked
                            </div>
                            <ul className="mt-2 space-y-1 list-disc list-inside text-white/80">
                                {gate.blockers.map((b, i) => <li key={i}>{b}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
                <div className="mt-4 text-[10px] uppercase tracking-[0.22em] text-white/40">
                    Rights, accessibility, and delivery must all be complete before faculty may approve any `final` version.
                </div>
            </div>
        </div>
    );
}

/* ---------------- Checklist card shared ---------------- */
function ChecklistCard({ title, kind, projectId, initial, onChange }) {
    const [items, setItems] = useState(initial.items);
    useEffect(() => { setItems(initial.items); }, [initial]);
    const toggle = async (it) => {
        const next = !it.done;
        setItems((arr) => arr.map((x) => (x.key === it.key ? { ...x, done: next } : x)));
        try { await api.patch(`/projects/${projectId}/finish/checklist/${kind}`, { key: it.key, done: next }); onChange(); }
        catch { setItems((arr) => arr.map((x) => (x.key === it.key ? { ...x, done: !next } : x))); toast.error("Failed to update"); }
    };
    const complete = items.filter((x) => x.done).length;
    return (
        <div className="glass rounded-xl p-5" data-testid={`ef-checklist-${kind}`}>
            <div className="flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">{title}</div>
                <div className="text-[10px] font-mono text-white/60">{complete}/{items.length}</div>
            </div>
            <div className="mt-3 space-y-2">
                {items.map((it) => (
                    <button key={it.key} onClick={() => toggle(it)} data-testid={`ef-checklist-${kind}-${it.key}`} className="w-full text-left flex items-start gap-2.5 group">
                        {it.done ? <CheckCircle2 size={14} className="text-emerald-300 mt-0.5" /> : <Circle size={14} className="text-white/35 mt-0.5 group-hover:text-white/60" />}
                        <span className={`text-sm ${it.done ? "text-white/50 line-through" : "text-white/85"}`}>{it.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
