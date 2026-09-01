import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import TopBar from "@/components/cynaiah/TopBar";
import { TID } from "@/constants/testIds";
import { Star, Trash2, Plus } from "lucide-react";

export default function Portfolio() {
    const [items, setItems] = useState([]);
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        Promise.all([api.get("/portfolio"), api.get("/projects")]).then(
            ([p, pr]) => {
                setItems(p.data);
                setProjects(pr.data);
            },
        );
    }, []);

    const toggleFeature = async (id, next) => {
        const { data } = await api.patch(`/portfolio/${id}`, { featured: next });
        setItems((s) => s.map((x) => (x.id === id ? data : x)));
    };

    const remove = async (id) => {
        if (!window.confirm("Remove from portfolio?")) return;
        await api.delete(`/portfolio/${id}`);
        setItems((s) => s.filter((x) => x.id !== id));
    };

    const addFromProject = async (project) => {
        const payload = {
            id: crypto.randomUUID(),
            user_id: "",
            project_id: project.id,
            title: project.title,
            category:
                {
                    music_video: "Music Video",
                    lyric_video: "Lyric Video",
                    visualizer: "Visualizer",
                    short_film: "Short Film",
                    documentary: "Documentary",
                    commercial: "Commercial",
                    branded_content: "Branded",
                    animation: "Animation",
                    cgi_scene: "CGI",
                    social_campaign: "Social",
                    live_visuals: "Live Visuals",
                    custom: "Work",
                }[project.type] || "Work",
            thumbnail_url: project.thumbnail_url,
            description: project.objective || project.story_concept || "",
            featured: false,
            created_at: new Date().toISOString(),
        };
        const { data } = await api.post("/portfolio", payload);
        setItems((s) => [data, ...s]);
        toast.success("Added to portfolio");
    };

    return (
        <div>
            <TopBar
                subtitle="Portfolio"
                title="Your work, curated"
            />

            <section className="px-8 md:px-12 pt-6">
                <div className="text-[10px] uppercase tracking-[0.28em] text-white/40">
                    Your reel
                </div>
                <h3 className="font-heading text-2xl mt-1 mb-5">Featured & recent</h3>

                {items.length === 0 && (
                    <div className="glass rounded-xl p-10 text-center text-white/60">
                        No portfolio items yet. Add a project below.
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {items.map((p) => (
                        <div
                            key={p.id}
                            className="glass rounded-xl overflow-hidden lift glass-hover"
                        >
                            <div className="relative aspect-[4/3]">
                                <img
                                    src={p.thumbnail_url}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                {p.featured && (
                                    <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] uppercase tracking-[0.22em] bg-cynaiah-gold/20 border border-cynaiah-gold/40 text-cynaiah-gold">
                                        <Star size={10} /> Featured
                                    </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/70">
                                        {p.category}
                                    </div>
                                    <div className="font-heading text-lg text-white">
                                        {p.title}
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 flex items-center justify-between">
                                <button
                                    data-testid={TID.portfolioFeatureToggle}
                                    onClick={() => toggleFeature(p.id, !p.featured)}
                                    className="cyn-btn-ghost rounded-md px-3 py-1.5 text-xs flex items-center gap-2"
                                >
                                    <Star size={13} />
                                    {p.featured ? "Unfeature" : "Feature"}
                                </button>
                                <button
                                    onClick={() => remove(p.id)}
                                    className="p-1.5 rounded text-white/40 hover:text-red-300 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="px-8 md:px-12 py-12">
                <div className="text-[10px] uppercase tracking-[0.28em] text-white/40">
                    Available to add
                </div>
                <h3 className="font-heading text-xl mt-1 mb-5">
                    Your projects (not yet in portfolio)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects
                        .filter((p) => !items.some((i) => i.project_id === p.id))
                        .map((p) => (
                            <div
                                key={p.id}
                                className="glass rounded-xl p-4 flex items-center gap-4"
                            >
                                <img
                                    src={p.thumbnail_url}
                                    alt=""
                                    className="w-20 h-14 object-cover rounded-md border border-white/5"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm text-white truncate">
                                        {p.title}
                                    </div>
                                    <div className="text-[11px] text-white/45 uppercase tracking-[0.2em]">
                                        {p.type.replace("_", " ")}
                                    </div>
                                </div>
                                <button
                                    onClick={() => addFromProject(p)}
                                    className="cyn-btn-primary rounded-md px-3 py-1.5 text-xs flex items-center gap-1"
                                >
                                    <Plus size={13} /> Add
                                </button>
                            </div>
                        ))}
                </div>
            </section>
        </div>
    );
}
