import { useEffect, useState } from "react";
import { api, API, getToken } from "@/lib/api";
import { toast } from "sonner";
import TopBar from "@/components/cynaiah/TopBar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Users,
    MapPin,
    Package,
    Film,
    ClipboardList,
    DollarSign,
    StickyNote,
    FileCheck2,
    Plus,
    Trash2,
    Download,
    Sparkles,
    Loader2,
    HelpCircle,
    ThumbsUp,
    AlertTriangle,
} from "lucide-react";

const TABS = [
    { key: "overview", label: "Overview", icon: Film },
    { key: "crew", label: "Cast & Crew", icon: Users, singular: "crew" },
    { key: "scenes", label: "Scenes & Shots", icon: ClipboardList },
    { key: "locations", label: "Locations", icon: MapPin, singular: "location" },
    { key: "equipments", label: "Equipment", icon: Package, singular: "equipment" },
    { key: "callsheets", label: "Call Sheets", icon: FileCheck2, singular: "callsheet" },
    { key: "budgets", label: "Budget", icon: DollarSign, singular: "budget" },
    { key: "notes", label: "Daily Notes", icon: StickyNote, singular: "note" },
    { key: "releases", label: "Releases", icon: FileCheck2, singular: "release" },
];

const SHOT_STATUS = ["planned", "scheduled", "in_progress", "shot", "wrapped"];

const money = (n) =>
    (n || 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function ProductionStudio() {
    const [projects, setProjects] = useState([]);
    const [projectId, setProjectId] = useState("");
    const [data, setData] = useState(null);
    const [tab, setTab] = useState("overview");
    const [coverage, setCoverage] = useState(null);
    const [coverageLoading, setCoverageLoading] = useState(false);

    const load = async (pid = projectId) => {
        if (!pid) return;
        const { data } = await api.get(`/projects/${pid}/production/overview`);
        setData(data);
    };

    useEffect(() => {
        api.get("/projects").then((r) => {
            setProjects(r.data);
            const mv = r.data.find((p) => p.type === "music_video") || r.data[0];
            if (mv) {
                setProjectId(mv.id);
                load(mv.id);
            }
        });
    }, []);

    useEffect(() => {
        if (projectId) load(projectId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    const add = async (kind, payload) => {
        await api.post(`/projects/${projectId}/production/${kind}`, payload);
        await load();
    };

    const remove = async (kind, id) => {
        if (!window.confirm("Delete this item?")) return;
        await api.delete(`/production/${kind}/${id}`);
        await load();
    };

    const patch = async (kind, id, upd) => {
        await api.patch(`/production/${kind}/${id}`, upd);
        await load();
    };

    const downloadCallSheet = async (callsheetId) => {
        try {
            const res = await fetch(`${API}/production/callsheet/${callsheetId}/pdf`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (!res.ok) throw new Error("Could not generate PDF");
            const blob = await res.blob();
            const disp = res.headers.get("Content-Disposition") || "";
            const m = /filename="?([^";]+)"?/.exec(disp);
            const filename = m ? m[1] : `CallSheet_${callsheetId}.pdf`;
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            toast.success("Call sheet PDF downloaded");
        } catch (e) {
            toast.error(e.message || "Download failed");
        }
    };

    const runCoverageCoach = async () => {
        if (!projectId) return;
        setCoverageLoading(true);
        setCoverage(null);
        try {
            const { data } = await api.post(`/projects/${projectId}/production/coverage-coach`);
            setCoverage(data);
            toast.success("Coverage Coach ready");
        } catch (e) {
            toast.error(e?.response?.data?.detail || "Coverage Coach unavailable");
        } finally {
            setCoverageLoading(false);
        }
    };

    if (!data) {
        return (
            <div>
                <TopBar subtitle="Production Studio" title="Loading…" />
            </div>
        );
    }
    const { project, stats } = data;

    return (
        <div>
            <TopBar
                subtitle="Production Studio"
                title={project?.title || "Production Studio"}
                actions={
                    <Select value={projectId} onValueChange={setProjectId}>
                        <SelectTrigger className="w-[240px] bg-white/[0.03] border-white/[0.08] text-white">
                            <SelectValue />
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
            <div className="px-8 md:px-12 pt-6 overflow-x-auto">
                <div className="inline-flex glass rounded-full p-1 gap-1 whitespace-nowrap">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`px-4 py-2 rounded-full text-xs uppercase tracking-[0.22em] flex items-center gap-2 transition-colors ${
                                tab === t.key
                                    ? "bg-white/10 text-white"
                                    : "text-white/50 hover:text-white/80"
                            }`}
                        >
                            <t.icon size={13} /> {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {tab === "overview" && (
                <div className="px-8 md:px-12 py-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        ["Cast & crew", stats.crew_count, "text-cynaiah-cyan"],
                        ["Locations", stats.locations, "text-cynaiah-violet"],
                        ["Equipment", stats.equipment, "text-cynaiah-magenta"],
                        ["Scenes", stats.scenes, "text-cynaiah-orange"],
                        ["Shots (total)", stats.shots_total, "text-white/80"],
                        ["Shots scheduled", stats.shots_scheduled, "text-cynaiah-cyan"],
                        ["Shots completed", stats.shots_completed, "text-emerald-300"],
                        ["Call sheets", stats.callsheets, "text-cynaiah-gold"],
                    ].map(([label, value, tone]) => (
                        <div key={label} className="glass rounded-xl p-5">
                            <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">{label}</div>
                            <div className={`font-heading text-3xl font-light mt-2 ${tone}`}>{value}</div>
                        </div>
                    ))}
                    <div className="glass rounded-xl p-5 col-span-2 md:col-span-4">
                        <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">Budget</div>
                        <div className="mt-2 flex items-end gap-4">
                            <div className="font-heading text-3xl text-white">{money(stats.budget_spent)}</div>
                            <div className="text-white/50 pb-1">of {money(stats.budget_total)} planned</div>
                        </div>
                        <div className="mt-3 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                            <div
                                className="h-full cyn-bg-gradient"
                                style={{
                                    width: `${stats.budget_total ? Math.min(100, (stats.budget_spent / stats.budget_total) * 100) : 0}%`,
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {tab === "crew" && <CrewTab items={data.crews} onAdd={(p) => add("crew", p)} onDelete={(id) => remove("crew", id)} />}
            {tab === "locations" && <LocationsTab items={data.locations} onAdd={(p) => add("location", p)} onDelete={(id) => remove("location", id)} />}
            {tab === "equipments" && <EquipmentTab items={data.equipments} onAdd={(p) => add("equipment", p)} onDelete={(id) => remove("equipment", id)} />}
            {tab === "scenes" && <ScenesTab scenes={data.scenes} shots={data.shots} onAddScene={(p) => add("scene", p)} onAddShot={(p) => add("shot", p)} onDeleteScene={(id) => remove("scene", id)} onDeleteShot={(id) => remove("shot", id)} onPatchShot={(id, upd) => patch("shot", id, upd)} coverage={coverage} coverageLoading={coverageLoading} onRunCoverage={runCoverageCoach} />}
            {tab === "callsheets" && <CallSheetsTab items={data.callsheets} onAdd={(p) => add("callsheet", p)} onDelete={(id) => remove("callsheet", id)} onDownload={downloadCallSheet} />}
            {tab === "budgets" && <BudgetTab items={data.budgets} onAdd={(p) => add("budget", p)} onDelete={(id) => remove("budget", id)} />}
            {tab === "notes" && <NotesTab items={data.notes} onAdd={(p) => add("note", p)} onDelete={(id) => remove("note", id)} />}
            {tab === "releases" && <ReleasesTab items={data.releases} onAdd={(p) => add("release", p)} onDelete={(id) => remove("release", id)} />}
        </div>
    );
}

// -------- Tab components --------
function Table({ columns, items, onDelete, empty, actions }) {
    return (
        <div className="px-8 md:px-12 py-6">
            {actions && <div className="mb-4">{actions}</div>}
            <div className="glass rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-white/[0.03] text-[10px] uppercase tracking-[0.22em] text-white/45">
                        <tr>
                            {columns.map((c) => (
                                <th key={c.key} className="text-left px-4 py-3">{c.label}</th>
                            ))}
                            <th className="w-10" />
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={columns.length + 1} className="text-center text-white/50 py-10">
                                    {empty}
                                </td>
                            </tr>
                        )}
                        {items.map((it) => (
                            <tr key={it.id} className="border-t border-white/[0.04] hover:bg-white/[0.02]">
                                {columns.map((c) => (
                                    <td key={c.key} className="px-4 py-3 text-white/85">
                                        {c.render ? c.render(it) : it[c.key] ?? "—"}
                                    </td>
                                ))}
                                <td className="px-2">
                                    <button
                                        onClick={() => onDelete(it.id)}
                                        className="text-white/30 hover:text-red-300 p-1"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function QuickAdd({ fields, onAdd, cta = "Add" }) {
    const [form, setForm] = useState(Object.fromEntries(fields.map((f) => [f.name, ""])));
    const submit = async () => {
        if (fields[0].required && !form[fields[0].name]) {
            toast.error(`${fields[0].label} required`);
            return;
        }
        await onAdd(form);
        setForm(Object.fromEntries(fields.map((f) => [f.name, ""])));
    };
    return (
        <div className="glass rounded-xl p-4 flex flex-wrap items-end gap-3">
            {fields.map((f) => (
                <div key={f.name} className={f.wide ? "flex-1 min-w-[200px]" : "min-w-[140px]"}>
                    <label className="text-[10px] uppercase tracking-[0.22em] text-white/45">{f.label}</label>
                    <input
                        value={form[f.name]}
                        onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                        placeholder={f.placeholder || ""}
                        className="mt-1 w-full rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-2 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                    />
                </div>
            ))}
            <button onClick={submit} className="cyn-btn-primary rounded-md px-4 py-2 text-sm flex items-center gap-2">
                <Plus size={13} /> {cta}
            </button>
        </div>
    );
}

const CrewTab = ({ items, onAdd, onDelete }) => (
    <Table
        columns={[
            { key: "name", label: "Name" },
            { key: "role", label: "Role" },
            { key: "department", label: "Department" },
            { key: "call_time", label: "Call time" },
            { key: "email", label: "Email" },
        ]}
        items={items}
        onDelete={onDelete}
        empty="No crew yet."
        actions={
            <QuickAdd
                fields={[
                    { name: "name", label: "Name", wide: true, required: true },
                    { name: "role", label: "Role", wide: true },
                    { name: "department", label: "Department" },
                    { name: "call_time", label: "Call time" },
                    { name: "email", label: "Email" },
                ]}
                onAdd={onAdd}
                cta="Add crew"
            />
        }
    />
);

const LocationsTab = ({ items, onAdd, onDelete }) => (
    <Table
        columns={[
            { key: "name", label: "Name" },
            { key: "address", label: "Address" },
            { key: "hours", label: "Hours" },
            { key: "release_status", label: "Release", render: (it) => (
                <span className={`text-[10px] uppercase tracking-[0.22em] ${it.release_status === "signed" ? "text-emerald-300" : "text-cynaiah-orange"}`}>{it.release_status || "—"}</span>
            )},
        ]}
        items={items}
        onDelete={onDelete}
        empty="No locations."
        actions={<QuickAdd fields={[{ name: "name", label: "Name", wide: true, required: true }, { name: "address", label: "Address", wide: true }, { name: "hours", label: "Hours" }, { name: "release_status", label: "Release (signed/pending)" }]} onAdd={onAdd} cta="Add location" />}
    />
);

const EquipmentTab = ({ items, onAdd, onDelete }) => (
    <Table
        columns={[
            { key: "name", label: "Item" },
            { key: "category", label: "Category" },
            { key: "quantity", label: "Qty" },
            { key: "vendor", label: "Vendor" },
            { key: "day_rate", label: "Day rate", render: (it) => money(Number(it.day_rate || 0)) },
        ]}
        items={items}
        onDelete={onDelete}
        empty="No equipment listed."
        actions={<QuickAdd fields={[{ name: "name", label: "Item", wide: true, required: true }, { name: "category", label: "Category" }, { name: "quantity", label: "Qty" }, { name: "vendor", label: "Vendor" }, { name: "day_rate", label: "Day rate" }]} onAdd={onAdd} cta="Add" />}
    />
);

function ScenesTab({ scenes, shots, onAddScene, onAddShot, onDeleteScene, onDeleteShot, onPatchShot, coverage, coverageLoading, onRunCoverage }) {
    return (
        <div className="px-8 md:px-12 py-6 space-y-4">
            <CoveragePanel
                coverage={coverage}
                loading={coverageLoading}
                onRun={onRunCoverage}
                scenesCount={scenes.length}
                shotsCount={shots.length}
            />
            <QuickAdd fields={[{ name: "number", label: "#" }, { name: "title", label: "Title", wide: true, required: true }, { name: "location", label: "Location" }, { name: "description", label: "Description", wide: true }]} onAdd={onAddScene} cta="Add scene" />
            {scenes.map((s) => {
                const sceneShots = shots.filter((sh) => sh.scene_id === s.id);
                return (
                    <div key={s.id} className="glass rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">Scene {s.number || "—"}</div>
                                <div className="font-heading text-xl text-white mt-0.5">{s.title}</div>
                                <div className="text-white/55 text-sm">{s.location || "—"} · {s.description || "—"}</div>
                            </div>
                            <button onClick={() => onDeleteScene(s.id)} className="text-white/30 hover:text-red-300 p-1"><Trash2 size={13} /></button>
                        </div>
                        <div className="rounded-md border border-white/[0.06] overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-white/[0.02] text-[10px] uppercase tracking-[0.22em] text-white/45">
                                    <tr>
                                        <th className="text-left px-3 py-2">#</th>
                                        <th className="text-left px-3 py-2">Size</th>
                                        <th className="text-left px-3 py-2">Move</th>
                                        <th className="text-left px-3 py-2">Description</th>
                                        <th className="text-left px-3 py-2">Status</th>
                                        <th />
                                    </tr>
                                </thead>
                                <tbody>
                                    {sceneShots.map((sh) => (
                                        <tr key={sh.id} className="border-t border-white/[0.04]">
                                            <td className="px-3 py-2 text-white/70 font-mono text-xs">{sh.number}</td>
                                            <td className="px-3 py-2 text-white/85">{sh.shot_size}</td>
                                            <td className="px-3 py-2 text-white/60">{sh.camera_move}</td>
                                            <td className="px-3 py-2 text-white/85">{sh.description}</td>
                                            <td className="px-3 py-2">
                                                <select value={sh.status || "planned"} onChange={(e) => onPatchShot(sh.id, { status: e.target.value })} className="bg-white/[0.03] border border-white/[0.08] rounded px-2 py-1 text-xs text-white">
                                                    {SHOT_STATUS.map((x) => <option key={x} value={x}>{x}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-2"><button onClick={() => onDeleteShot(sh.id)} className="text-white/30 hover:text-red-300 p-1"><Trash2 size={13} /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-3">
                            <QuickAdd
                                fields={[{ name: "number", label: "#" }, { name: "shot_size", label: "Size" }, { name: "camera_move", label: "Move" }, { name: "description", label: "Description", wide: true, required: true }]}
                                onAdd={(payload) => onAddShot({ ...payload, scene_id: s.id, status: "planned" })}
                                cta="Add shot"
                            />
                        </div>
                    </div>
                );
            })}
            {scenes.length === 0 && <div className="text-white/50 text-center py-8">No scenes yet.</div>}
        </div>
    );
}

function CoveragePanel({ coverage, loading, onRun, scenesCount, shotsCount }) {
    const disabled = loading || scenesCount === 0 || shotsCount === 0;
    return (
        <div className="glass rounded-xl p-5" data-testid="coverage-coach-panel">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/40 flex items-center gap-2">
                        <Sparkles size={12} className="text-cynaiah-gold" /> Coverage Coach — advisory only
                    </div>
                    <div className="text-white/85 mt-1 text-sm max-w-2xl">
                        Ask an AI film-school coach to review your scenes and shots for possibly-missing coverage.
                        It offers questions and suggestions — <span className="text-white">the director makes the final call.</span>
                    </div>
                </div>
                <button
                    onClick={onRun}
                    disabled={disabled}
                    data-testid="coverage-coach-run-btn"
                    className="inline-flex items-center gap-2 cyn-btn-primary rounded-md px-4 py-2 text-xs uppercase tracking-[0.22em] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                    {loading ? "Analysing…" : "Run Coverage Coach"}
                </button>
            </div>

            {scenesCount === 0 || shotsCount === 0 ? (
                <div className="mt-3 text-[11px] uppercase tracking-[0.22em] text-cynaiah-orange/90 flex items-center gap-2">
                    <AlertTriangle size={12} /> Add at least one scene and one shot to enable analysis.
                </div>
            ) : null}

            {coverage && (
                <div className="mt-5 space-y-3" data-testid="coverage-coach-results">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">
                        {coverage.note || "Advisory. The director makes the final call."}
                    </div>
                    {(coverage.scenes || []).length === 0 && (
                        <div className="text-white/60 text-sm">No suggestions returned.</div>
                    )}
                    {(coverage.scenes || []).map((s, idx) => (
                        <div key={idx} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4" data-testid={`coverage-scene-${s.scene_number || idx}`}>
                            <div className="flex items-baseline gap-3">
                                <div className="font-mono text-[11px] text-white/45">SC {s.scene_number || "—"}</div>
                                <div className="font-heading text-base text-white">{s.scene_title || "—"}</div>
                            </div>

                            {Array.isArray(s.possibly_missing) && s.possibly_missing.length > 0 && (
                                <div className="mt-3">
                                    <div className="text-[10px] uppercase tracking-[0.22em] text-cynaiah-orange/90 flex items-center gap-1.5">
                                        <AlertTriangle size={11} /> Possibly missing
                                    </div>
                                    <ul className="mt-1.5 space-y-1">
                                        {s.possibly_missing.map((m, i) => (
                                            <li key={i} className="text-sm text-white/80">
                                                <span className="text-white/55 mr-2 uppercase text-[10px] tracking-[0.2em]">{m.kind || "note"}</span>
                                                {m.note}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {Array.isArray(s.questions_for_student) && s.questions_for_student.length > 0 && (
                                <div className="mt-3">
                                    <div className="text-[10px] uppercase tracking-[0.22em] text-cynaiah-cyan/90 flex items-center gap-1.5">
                                        <HelpCircle size={11} /> Questions for you
                                    </div>
                                    <ul className="mt-1.5 space-y-1 list-disc list-inside">
                                        {s.questions_for_student.map((q, i) => (
                                            <li key={i} className="text-sm text-white/80">{q}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {Array.isArray(s.compliments) && s.compliments.length > 0 && (
                                <div className="mt-3">
                                    <div className="text-[10px] uppercase tracking-[0.22em] text-emerald-300/90 flex items-center gap-1.5">
                                        <ThumbsUp size={11} /> What already works
                                    </div>
                                    <ul className="mt-1.5 space-y-1">
                                        {s.compliments.map((c, i) => (
                                            <li key={i} className="text-sm text-white/80">{c}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const CallSheetsTab = ({ items, onAdd, onDelete, onDownload }) => (
    <div className="px-8 md:px-12 py-6 space-y-4">
        <QuickAdd
            fields={[
                { name: "date", label: "Date (YYYY-MM-DD)", required: true },
                { name: "call_time", label: "Call time" },
                { name: "location", label: "Location", wide: true },
                { name: "weather", label: "Weather" },
                { name: "notes", label: "Notes", wide: true },
            ]}
            onAdd={onAdd}
            cta="Add call sheet"
        />
        <div className="glass rounded-xl overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-white/[0.03] text-[10px] uppercase tracking-[0.22em] text-white/45">
                    <tr>
                        <th className="text-left px-4 py-3">Date</th>
                        <th className="text-left px-4 py-3">Call</th>
                        <th className="text-left px-4 py-3">Location</th>
                        <th className="text-left px-4 py-3">Weather</th>
                        <th className="text-left px-4 py-3">Notes</th>
                        <th className="text-right px-4 py-3 w-52">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.length === 0 && (
                        <tr>
                            <td colSpan={6} className="text-center text-white/50 py-10">No call sheets.</td>
                        </tr>
                    )}
                    {items.map((it) => (
                        <tr key={it.id} className="border-t border-white/[0.04] hover:bg-white/[0.02]">
                            <td className="px-4 py-3 text-white/85">{it.date || "—"}</td>
                            <td className="px-4 py-3 text-white/85">{it.call_time || "—"}</td>
                            <td className="px-4 py-3 text-white/85">{it.location || "—"}</td>
                            <td className="px-4 py-3 text-white/85">{it.weather || "—"}</td>
                            <td className="px-4 py-3 text-white/70">{it.notes || "—"}</td>
                            <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => onDownload(it.id)}
                                        data-testid={`callsheet-download-pdf-${it.id}`}
                                        className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-white/80 hover:bg-white/[0.06] hover:text-white transition-colors"
                                    >
                                        <Download size={12} /> PDF
                                    </button>
                                    <button
                                        onClick={() => onDelete(it.id)}
                                        className="text-white/30 hover:text-red-300 p-1"
                                        aria-label="Delete call sheet"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const BudgetTab = ({ items, onAdd, onDelete }) => {
    const total = items.reduce((s, i) => s + Number(i.amount || 0), 0);
    const spent = items.reduce((s, i) => s + Number(i.spent || 0), 0);
    return (
        <div className="px-8 md:px-12 py-6 space-y-4">
            <div className="glass rounded-xl p-5 flex flex-wrap items-center gap-6">
                <div>
                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">Planned</div>
                    <div className="font-heading text-2xl text-white">{money(total)}</div>
                </div>
                <div>
                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">Spent</div>
                    <div className="font-heading text-2xl text-cynaiah-orange">{money(spent)}</div>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                        <div className="h-full cyn-bg-gradient" style={{ width: `${total ? Math.min(100, (spent / total) * 100) : 0}%` }} />
                    </div>
                </div>
            </div>
            <Table
                columns={[
                    { key: "line", label: "Line item" },
                    { key: "category", label: "Category" },
                    { key: "vendor", label: "Vendor" },
                    { key: "amount", label: "Planned", render: (it) => money(Number(it.amount || 0)) },
                    { key: "spent", label: "Spent", render: (it) => money(Number(it.spent || 0)) },
                ]}
                items={items}
                onDelete={onDelete}
                empty="No budget lines."
                actions={<QuickAdd fields={[{ name: "line", label: "Line", wide: true, required: true }, { name: "category", label: "Category" }, { name: "vendor", label: "Vendor" }, { name: "amount", label: "Planned $" }, { name: "spent", label: "Spent $" }]} onAdd={onAdd} cta="Add line" />}
            />
        </div>
    );
};

const NotesTab = ({ items, onAdd, onDelete }) => (
    <div className="px-8 md:px-12 py-6 space-y-4">
        <QuickAdd fields={[{ name: "date", label: "Date" }, { name: "author", label: "Author" }, { name: "message", label: "Note", wide: true, required: true }]} onAdd={onAdd} cta="Log note" />
        <div className="space-y-3">
            {items.map((n) => (
                <div key={n.id} className="glass rounded-xl p-4 flex gap-4">
                    <div className="font-mono text-[11px] text-white/50 w-24 shrink-0">{n.date}</div>
                    <div className="flex-1 min-w-0">
                        <div className="text-white/85 text-sm">{n.message}</div>
                        <div className="text-[10px] uppercase tracking-[0.22em] text-white/40 mt-1">— {n.author}</div>
                    </div>
                    <button onClick={() => onDelete(n.id)} className="text-white/30 hover:text-red-300"><Trash2 size={13} /></button>
                </div>
            ))}
            {items.length === 0 && <div className="text-white/50 text-center py-8">No daily notes yet.</div>}
        </div>
    </div>
);

const ReleasesTab = ({ items, onAdd, onDelete }) => (
    <Table
        columns={[
            { key: "party", label: "Party" },
            { key: "kind", label: "Kind" },
            { key: "status", label: "Status", render: (it) => (
                <span className={`text-[10px] uppercase tracking-[0.22em] ${it.status === "signed" ? "text-emerald-300" : "text-cynaiah-orange"}`}>{it.status}</span>
            )},
            { key: "notes", label: "Notes" },
        ]}
        items={items}
        onDelete={onDelete}
        empty="No releases logged."
        actions={<QuickAdd fields={[{ name: "party", label: "Party", wide: true, required: true }, { name: "kind", label: "Kind (location/talent/model)" }, { name: "status", label: "Status" }, { name: "notes", label: "Notes", wide: true }]} onAdd={onAdd} cta="Add release" />}
    />
);
