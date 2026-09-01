import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import TopBar from "@/components/cynaiah/TopBar";
import { MessageSquareText, CheckCircle2, Clock3, RotateCcw, GraduationCap } from "lucide-react";

const STATUS_TONE = {
    open: { label: "Open", cls: "bg-white/[0.06] text-white/70 border-white/10" },
    revision_requested: { label: "Revision requested", cls: "bg-cynaiah-orange/15 text-cynaiah-orange border-cynaiah-orange/30" },
    approved: { label: "Approved", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30" },
    final: { label: "Final", cls: "bg-cynaiah-cyan/15 text-cynaiah-cyan border-cynaiah-cyan/30" },
};

export default function FacultyDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/faculty/dashboard").then((r) => setData(r.data)).catch(() => setData({ projects: [] }));
    }, []);

    if (!data) return <TopBar subtitle="Faculty Dashboard" title="Loading…" />;

    const totalProjects = data.projects.length;
    const openCount = data.projects.filter((p) => p.status === "revision_requested" || p.status === "open").length;
    const approvedCount = data.projects.filter((p) => p.status === "approved" || p.status === "final").length;

    if (user && !["faculty", "admin", "mentor"].includes(user.role)) {
        return (
            <div>
                <TopBar subtitle="Faculty Dashboard" title="Faculty view" />
                <div className="px-8 md:px-12 py-10 text-white/70 max-w-xl">
                    This dashboard is available to CYNAIAH faculty and mentors. Sign in with a faculty account to review student productions.
                </div>
            </div>
        );
    }

    return (
        <div>
            <TopBar
                subtitle="Faculty Dashboard"
                title={user?.name ? `Studio of ${user.name.split(" ").slice(-1)[0]}` : "Faculty studio"}
            />

            {/* Stats */}
            <div className="px-8 md:px-12 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Assigned productions" value={totalProjects} icon={GraduationCap} tone="text-cynaiah-cyan" tid="faculty-stat-assigned" />
                <StatCard label="Open / Revision" value={openCount} icon={RotateCcw} tone="text-cynaiah-orange" tid="faculty-stat-open" />
                <StatCard label="Approved / Final" value={approvedCount} icon={CheckCircle2} tone="text-emerald-300" tid="faculty-stat-approved" />
                <StatCard label="Reviews on record" value={data.projects.reduce((s, p) => s + (p.review_count || 0), 0)} icon={MessageSquareText} tone="text-cynaiah-violet" tid="faculty-stat-reviews" />
            </div>

            <div className="px-8 md:px-12 pb-12">
                <div className="text-[10px] uppercase tracking-[0.24em] text-white/40 mb-3">Assigned productions</div>
                {data.projects.length === 0 && (
                    <div className="glass rounded-xl p-8 text-white/60 text-center">
                        You have no assigned productions yet.
                    </div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {data.projects.map((tile) => {
                        const tone = STATUS_TONE[tile.status] || STATUS_TONE.open;
                        return (
                            <button
                                key={tile.project.id}
                                onClick={() => navigate(`/faculty/projects/${tile.project.id}`)}
                                data-testid={`faculty-project-card-${tile.project.id}`}
                                className="text-left glass rounded-xl overflow-hidden group hover:border-white/20 transition-colors"
                            >
                                <div className="relative h-40 overflow-hidden">
                                    <img
                                        src={tile.project.thumbnail_url || "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1200"}
                                        alt=""
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                    <div className={`absolute top-3 left-3 text-[10px] uppercase tracking-[0.22em] px-2.5 py-1 rounded-full border ${tone.cls}`}>
                                        {tone.label}
                                    </div>
                                    <div className="absolute bottom-3 left-3 right-3">
                                        <div className="font-heading text-lg text-white leading-tight">{tile.project.title}</div>
                                        <div className="text-[11px] uppercase tracking-[0.22em] text-white/60">
                                            {(tile.project.type || "").replace("_", " ")} · {tile.student.name}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 flex items-center justify-between text-[11px] text-white/60">
                                    <div className="flex items-center gap-2">
                                        <MessageSquareText size={13} /> {tile.review_count} note{tile.review_count === 1 ? "" : "s"}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock3 size={13} />
                                        {tile.last_review_at ? new Date(tile.last_review_at).toLocaleDateString() : "No feedback yet"}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, tone, tid }) {
    return (
        <div className="glass rounded-xl p-5" data-testid={tid}>
            <div className="flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">{label}</div>
                <Icon size={14} className={tone} />
            </div>
            <div className={`font-heading text-3xl font-light mt-2 ${tone}`}>{value}</div>
        </div>
    );
}
