import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import TopBar from "@/components/cynaiah/TopBar";
import ProjectCard from "@/components/cynaiah/ProjectCard";
import { PROJECT_TYPES, STATUSES, STATUS_LABEL, TYPE_LABEL } from "@/lib/constants";
import { TID } from "@/constants/testIds";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function Projects() {
    const nav = useNavigate();
    const [items, setItems] = useState([]);
    const [q, setQ] = useState("");
    const [type, setType] = useState("all");
    const [status, setStatus] = useState("all");

    useEffect(() => {
        api.get("/projects").then((r) => setItems(r.data));
    }, []);

    const filtered = useMemo(() => {
        return items.filter((p) => {
            if (type !== "all" && p.type !== type) return false;
            if (status !== "all" && p.status !== status) return false;
            if (q && !p.title.toLowerCase().includes(q.toLowerCase())) return false;
            return true;
        });
    }, [items, q, type, status]);

    return (
        <div>
            <TopBar
                subtitle="Studio"
                title="Projects"
                actions={
                    <button
                        onClick={() => nav("/create")}
                        className="cyn-btn-primary rounded-md px-4 py-2.5 text-sm font-medium flex items-center gap-2"
                    >
                        <Plus size={15} /> New
                    </button>
                }
            />

            <div className="px-8 md:px-12 pt-6 pb-4 flex flex-wrap gap-3 items-center">
                <div className="relative">
                    <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                    />
                    <input
                        data-testid={TID.projectSearch}
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search titles…"
                        className="w-[260px] rounded-md bg-white/[0.03] border border-white/[0.08] pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-cynaiah-cyan/50"
                    />
                </div>

                <Select value={type} onValueChange={setType}>
                    <SelectTrigger
                        data-testid={TID.projectFilterType}
                        className="w-[200px] bg-white/[0.03] border-white/[0.08] text-white"
                    >
                        <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0A0A0C] border-white/10 text-white">
                        <SelectItem value="all">All types</SelectItem>
                        {PROJECT_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                                {t.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger
                        data-testid={TID.projectFilterStatus}
                        className="w-[200px] bg-white/[0.03] border-white/[0.08] text-white"
                    >
                        <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0A0A0C] border-white/10 text-white">
                        <SelectItem value="all">All statuses</SelectItem>
                        {STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                                {STATUS_LABEL[s]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="ml-auto text-[11px] uppercase tracking-[0.24em] text-white/40">
                    {filtered.length} of {items.length}
                </div>
            </div>

            <div className="px-8 md:px-12 pb-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((p) => (
                    <ProjectCard key={p.id} project={p} />
                ))}
                {filtered.length === 0 && (
                    <div className="col-span-full py-20 text-center text-white/50">
                        No projects match your filters. Try{" "}
                        <button
                            onClick={() => nav("/create")}
                            className="text-white underline"
                        >
                            starting a new one
                        </button>
                        .
                    </div>
                )}
            </div>
        </div>
    );
}
