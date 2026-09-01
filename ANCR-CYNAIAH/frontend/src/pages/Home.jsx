import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import TopBar from "@/components/cynaiah/TopBar";
import ProjectCard from "@/components/cynaiah/ProjectCard";
import { TID } from "@/constants/testIds";
import { PoweredByAncr } from "@/components/cynaiah/Brand";
import {
    Sparkles,
    Film,
    GraduationCap,
    Bell,
    Award,
    Plus,
    ArrowRight,
    MessageSquareText,
    CalendarDays,
} from "lucide-react";

const HERO_IMAGE =
    "https://images.pexels.com/photos/10395639/pexels-photo-10395639.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1600";

const Stat = ({ icon: Icon, label, value, tone, tid }) => (
    <div
        data-testid={tid}
        className="glass rounded-xl p-5 flex items-start justify-between glass-hover"
    >
        <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                {label}
            </div>
            <div className="mt-2 font-heading text-3xl text-white font-light">
                {value}
            </div>
        </div>
        <div
            className={`w-10 h-10 rounded-md flex items-center justify-center ${tone}`}
        >
            <Icon size={18} strokeWidth={1.5} />
        </div>
    </div>
);

export default function Home() {
    const [data, setData] = useState(null);
    const nav = useNavigate();

    useEffect(() => {
        const load = () => api.get("/dashboard/summary").then((r) => setData(r.data));
        load();
        // Refresh KPIs when the bell popover marks things read.
        const onNoteChange = () => load();
        window.addEventListener("cynaiah:notifications-changed", onNoteChange);
        return () => window.removeEventListener("cynaiah:notifications-changed", onNoteChange);
    }, []);

    if (!data) {
        return (
            <div className="p-10 text-white/60 animate-pulse">
                Loading dashboard…
            </div>
        );
    }
    const { user, counts, active_projects, courses, upcoming_events, recent_feedback, portfolio_preview } = data;

    return (
        <div>
            <TopBar
                subtitle={`Welcome back, ${user.name?.split(" ")[0]}`}
                title="Studio dashboard"
                actions={
                    <button
                        onClick={() => nav("/create")}
                        className="cyn-btn-primary rounded-md px-4 py-2.5 text-sm font-medium flex items-center gap-2"
                    >
                        <Plus size={15} /> New project
                    </button>
                }
            />

            {/* Cinematic hero */}
            <section
                data-testid={TID.homeHero}
                className="relative overflow-hidden border-b border-white/[0.05] cyn-noise"
            >
                <img
                    src={HERO_IMAGE}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/70 to-[#030303]/30" />
                <div className="cyn-hero-glow animate-beam-drift" />

                <div className="relative px-8 md:px-12 py-14 md:py-20 max-w-5xl">
                    <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.32em] text-white/50 flex-wrap">
                        <span>School of Film · Visual Storytelling · Emerging Media</span>
                        <span className="text-white/20">·</span>
                        <PoweredByAncr />
                    </div>
                    <h2 className="mt-4 font-heading text-4xl md:text-6xl font-light tracking-tight leading-[1.05] max-w-3xl">
                        Hello {user.name?.split(" ")[0]}, <br />
                        <span className="cyn-text-gradient">let&apos;s make something worth watching.</span>
                    </h2>
                    <p className="mt-6 text-white/60 text-base md:text-lg max-w-2xl leading-relaxed">
                        {user.bio ||
                            "Turn your ideas into music videos, films, animations, CGI worlds, and AI-assisted visual stories — all inside one cinematic studio."}
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <button
                            onClick={() => nav("/create")}
                            className="cyn-btn-primary rounded-full px-6 py-3 text-sm font-medium flex items-center gap-2"
                        >
                            <Sparkles size={16} /> Start a new project
                        </button>
                        <button
                            onClick={() => nav("/projects")}
                            className="cyn-btn-ghost rounded-full px-6 py-3 text-sm font-medium flex items-center gap-2"
                        >
                            <Film size={16} /> Continue a project
                        </button>
                        <button
                            onClick={() => nav("/ai-visual-lab")}
                            className="cyn-btn-ghost rounded-full px-6 py-3 text-sm font-medium flex items-center gap-2"
                        >
                            <Sparkles size={16} /> Open AI Visual Lab
                        </button>
                    </div>
                </div>
            </section>

            {/* Stats grid */}
            <section className="px-8 md:px-12 pt-10 grid grid-cols-2 md:grid-cols-4 gap-5">
                <Stat
                    tid={TID.homeStatActiveProjects}
                    icon={Film}
                    label="Active productions"
                    value={counts.active_projects}
                    tone="bg-cynaiah-violet/20 text-cynaiah-violet"
                />
                <Stat
                    tid={TID.homeStatCourses}
                    icon={GraduationCap}
                    label="Courses in progress"
                    value={counts.courses_in_progress}
                    tone="bg-cynaiah-cyan/15 text-cynaiah-cyan"
                />
                <Stat
                    tid={TID.homeStatPortfolio}
                    icon={Award}
                    label="Portfolio items"
                    value={counts.portfolio_items}
                    tone="bg-cynaiah-orange/15 text-cynaiah-orange"
                />
                <Stat
                    tid={TID.homeStatNotifications}
                    icon={Bell}
                    label="Unread notifications"
                    value={counts.unread_notifications}
                    tone="bg-cynaiah-magenta/15 text-cynaiah-magenta"
                />
            </section>

            {/* Active productions */}
            <section className="px-8 md:px-12 pt-12">
                <div className="flex items-end justify-between mb-5">
                    <div>
                        <div className="text-[10px] uppercase tracking-[0.28em] text-white/40">
                            In your studio right now
                        </div>
                        <h3 className="font-heading text-2xl font-normal mt-1">
                            Active productions
                        </h3>
                    </div>
                    <button
                        onClick={() => nav("/projects")}
                        className="text-[12px] uppercase tracking-[0.24em] text-white/50 hover:text-white flex items-center gap-2 transition-colors"
                    >
                        All projects <ArrowRight size={13} />
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {active_projects.slice(0, 6).map((p) => (
                        <ProjectCard key={p.id} project={p} />
                    ))}
                </div>
            </section>

            {/* Two-column: Courses + Feedback / Calendar */}
            <section className="px-8 md:px-12 py-12 grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="glass rounded-xl p-6 xl:col-span-2">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <div className="text-[10px] uppercase tracking-[0.28em] text-white/40">
                                Curriculum
                            </div>
                            <h3 className="font-heading text-xl mt-1">Your courses</h3>
                        </div>
                        <button
                            onClick={() => nav("/learn")}
                            className="text-[12px] uppercase tracking-[0.24em] text-white/50 hover:text-white flex items-center gap-2"
                        >
                            Open Learn <ArrowRight size={13} />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {courses.map((c) => (
                            <div
                                key={c.id}
                                className="flex items-center gap-4 p-3 rounded-lg border border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.02] transition-colors"
                            >
                                <img
                                    src={c.thumbnail_url}
                                    alt=""
                                    className="w-20 h-14 object-cover rounded-md border border-white/5"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                                        {c.category} · {c.level}
                                    </div>
                                    <div className="text-white text-sm mt-0.5 truncate">
                                        {c.title}
                                    </div>
                                    <div className="mt-2 h-1 rounded bg-white/[0.05] overflow-hidden">
                                        <div
                                            className="h-full cyn-bg-gradient"
                                            style={{ width: `${c.progress}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="font-mono text-[11px] text-white/50 w-10 text-right">
                                    {c.progress}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <CalendarDays size={14} className="text-cynaiah-cyan" />
                            <h3 className="font-heading text-lg">Upcoming</h3>
                        </div>
                        <div className="space-y-3">
                            {upcoming_events.slice(0, 5).map((e) => (
                                <div
                                    key={e.id}
                                    className="flex gap-3 text-sm border-l-2 border-cynaiah-cyan/40 pl-3"
                                >
                                    <div className="font-mono text-[11px] text-white/45 w-20 shrink-0">
                                        {new Date(e.date).toLocaleDateString(undefined, {
                                            month: "short",
                                            day: "2-digit",
                                        })}
                                    </div>
                                    <div className="text-white/80">{e.title}</div>
                                </div>
                            ))}
                            {upcoming_events.length === 0 && (
                                <div className="text-white/50 text-sm">Nothing scheduled.</div>
                            )}
                        </div>
                    </div>

                    <div className="glass rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <MessageSquareText size={14} className="text-cynaiah-magenta" />
                            <h3 className="font-heading text-lg">Recent feedback</h3>
                        </div>
                        <div className="space-y-3">
                            {recent_feedback.map((f) => (
                                <div
                                    key={f.id}
                                    className="rounded-md bg-white/[0.02] border border-white/[0.05] p-3 text-sm"
                                >
                                    <div className="text-white/80 leading-snug">
                                        “{f.message}”
                                    </div>
                                    <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
                                        — {f.author_name} · {f.author_role}
                                    </div>
                                </div>
                            ))}
                            {recent_feedback.length === 0 && (
                                <div className="text-white/50 text-sm">
                                    No feedback yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Portfolio strip */}
            {portfolio_preview.length > 0 && (
                <section className="px-8 md:px-12 pb-14">
                    <div className="flex items-end justify-between mb-5">
                        <div>
                            <div className="text-[10px] uppercase tracking-[0.28em] text-white/40">
                                Portfolio in progress
                            </div>
                            <h3 className="font-heading text-2xl mt-1">
                                Curated for your reel
                            </h3>
                        </div>
                        <button
                            onClick={() => nav("/portfolio")}
                            className="text-[12px] uppercase tracking-[0.24em] text-white/50 hover:text-white flex items-center gap-2"
                        >
                            Open portfolio <ArrowRight size={13} />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {portfolio_preview.map((p) => (
                            <div
                                key={p.id}
                                className="relative rounded-lg overflow-hidden border border-white/[0.05] group lift"
                            >
                                <img
                                    src={p.thumbnail_url}
                                    alt=""
                                    className="aspect-[4/3] w-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-70" />
                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                    <div className="text-[10px] uppercase tracking-[0.22em] text-white/60">
                                        {p.category}
                                    </div>
                                    <div className="text-sm text-white truncate">
                                        {p.title}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
