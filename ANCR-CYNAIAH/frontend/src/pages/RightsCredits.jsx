import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import TopBar from "@/components/cynaiah/TopBar";
import { TID } from "@/constants/testIds";
import { ShieldCheck, Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const OWNERSHIP = ["owner", "contributor", "licensor", "ai_tool"];

const OWNERSHIP_LABEL = {
    owner: "Owner",
    contributor: "Contributor",
    licensor: "Licensor",
    ai_tool: "AI Tool",
};

const OWNERSHIP_TONE = {
    owner: "text-emerald-300",
    contributor: "text-cynaiah-cyan",
    licensor: "text-cynaiah-gold",
    ai_tool: "text-cynaiah-magenta",
};

const CHECKLIST = [
    "Contributor credits listed",
    "Music ownership confirmed",
    "Visual-asset ownership confirmed",
    "Model / actor releases on file",
    "Location releases on file",
    "AI tools disclosed",
    "Consent records logged",
    "Commercial-use restrictions noted",
];

export default function RightsCredits() {
    const [projects, setProjects] = useState([]);
    const [projectId, setProjectId] = useState("");
    const [rights, setRights] = useState([]);
    const [form, setForm] = useState({
        contributor_name: "",
        role: "",
        ownership_type: "contributor",
        ai_disclosure: "",
        licensing_notes: "",
        consent_recorded: false,
        commercial_use: true,
    });
    const [checks, setChecks] = useState({});

    useEffect(() => {
        api.get("/projects").then((r) => {
            setProjects(r.data);
            if (r.data[0]) setProjectId(r.data[0].id);
        });
    }, []);

    useEffect(() => {
        if (!projectId) return;
        api.get(`/projects/${projectId}/rights`).then((r) => setRights(r.data));
    }, [projectId]);

    const add = async () => {
        if (!form.contributor_name || !form.role)
            return toast.error("Name and role required.");
        const { data } = await api.post("/rights", {
            id: crypto.randomUUID(),
            project_id: projectId,
            ...form,
            created_at: new Date().toISOString(),
        });
        setRights((r) => [...r, data]);
        setForm({
            contributor_name: "",
            role: "",
            ownership_type: "contributor",
            ai_disclosure: "",
            licensing_notes: "",
            consent_recorded: false,
            commercial_use: true,
        });
        toast.success("Rights record added.");
    };

    const remove = async (id) => {
        await api.delete(`/rights/${id}`);
        setRights((r) => r.filter((x) => x.id !== id));
    };

    return (
        <div>
            <TopBar
                subtitle="Rights & Credits"
                title="Ownership, consent, and AI transparency"
                actions={
                    <Select value={projectId} onValueChange={setProjectId}>
                        <SelectTrigger className="w-[240px] bg-white/[0.03] border-white/[0.08] text-white">
                            <SelectValue placeholder="Project" />
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

            <div className="px-8 md:px-12 py-8 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
                <div className="space-y-6">
                    <div className="glass rounded-xl p-6">
                        <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                            Contributors
                        </div>
                        <div className="mt-3 divide-y divide-white/[0.04]">
                            {rights.length === 0 && (
                                <div className="py-8 text-center text-white/50 text-sm">
                                    No rights records yet.
                                </div>
                            )}
                            {rights.map((r) => (
                                <div key={r.id} className="py-3 flex items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-white font-medium">
                                                {r.contributor_name}
                                            </span>
                                            <span
                                                className={`text-[10px] uppercase tracking-[0.22em] ${OWNERSHIP_TONE[r.ownership_type]}`}
                                            >
                                                {OWNERSHIP_LABEL[r.ownership_type]}
                                            </span>
                                            {r.consent_recorded && (
                                                <span className="text-[10px] uppercase tracking-[0.22em] text-emerald-300 inline-flex items-center gap-1">
                                                    <CheckCircle2 size={11} /> Consent
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-white/70 mt-1">
                                            {r.role}
                                        </div>
                                        {r.ai_disclosure && (
                                            <div className="mt-2 text-xs text-cynaiah-magenta/90 bg-cynaiah-magenta/10 border border-cynaiah-magenta/20 rounded px-2 py-1 inline-block">
                                                AI disclosure: {r.ai_disclosure}
                                            </div>
                                        )}
                                        {r.licensing_notes && (
                                            <div className="mt-1 text-xs text-white/50">
                                                {r.licensing_notes}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => remove(r.id)}
                                        className="text-white/30 hover:text-red-300 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass rounded-xl p-6">
                        <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                            Add contributor
                        </div>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                data-testid={TID.rightsContributor}
                                value={form.contributor_name}
                                onChange={(e) =>
                                    setForm({ ...form, contributor_name: e.target.value })
                                }
                                placeholder="Name (person, entity, or AI tool)"
                                className="rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                            />
                            <input
                                value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value })}
                                placeholder="Role (Director, Composer, AI tool…)"
                                className="rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                            />
                            <Select
                                value={form.ownership_type}
                                onValueChange={(v) => setForm({ ...form, ownership_type: v })}
                            >
                                <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0A0A0C] border-white/10 text-white">
                                    {OWNERSHIP.map((o) => (
                                        <SelectItem key={o} value={o}>
                                            {OWNERSHIP_LABEL[o]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <label className="flex items-center gap-2 text-sm text-white/70">
                                <input
                                    type="checkbox"
                                    checked={form.consent_recorded}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            consent_recorded: e.target.checked,
                                        })
                                    }
                                    className="w-4 h-4 accent-cynaiah-cyan"
                                />
                                Consent / release on file
                            </label>
                            <input
                                value={form.ai_disclosure}
                                onChange={(e) =>
                                    setForm({ ...form, ai_disclosure: e.target.value })
                                }
                                placeholder="AI disclosure (if AI tool)"
                                className="md:col-span-2 rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                            />
                            <textarea
                                value={form.licensing_notes}
                                onChange={(e) =>
                                    setForm({ ...form, licensing_notes: e.target.value })
                                }
                                rows={2}
                                placeholder="Licensing notes"
                                className="md:col-span-2 rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                            />
                        </div>
                        <button
                            data-testid={TID.rightsAdd}
                            onClick={add}
                            className="cyn-btn-primary mt-5 rounded-md px-5 py-2.5 text-sm flex items-center gap-2"
                        >
                            <Plus size={14} /> Add contributor
                        </button>
                    </div>
                </div>

                <div className="glass rounded-xl p-5 h-fit">
                    <div className="flex items-center gap-2 mb-4">
                        <ShieldCheck size={14} className="text-cynaiah-gold" />
                        <div className="text-[10px] uppercase tracking-[0.24em] text-white/50">
                            Clearance checklist
                        </div>
                    </div>
                    <div className="space-y-2">
                        {CHECKLIST.map((c) => (
                            <label
                                key={c}
                                className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0 cursor-pointer"
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        setChecks((s) => ({ ...s, [c]: !s[c] }))
                                    }
                                    className="text-cynaiah-cyan"
                                >
                                    {checks[c] ? (
                                        <CheckCircle2 size={16} />
                                    ) : (
                                        <Circle size={16} className="text-white/30" />
                                    )}
                                </button>
                                <span
                                    className={`text-sm ${checks[c] ? "text-white/50 line-through" : "text-white/85"}`}
                                >
                                    {c}
                                </span>
                            </label>
                        ))}
                    </div>
                    <div className="mt-5 text-[10px] uppercase tracking-[0.22em] text-white/40 leading-relaxed">
                        Ready for INHEIRA rights review when every item is checked.
                    </div>
                </div>
            </div>
        </div>
    );
}
