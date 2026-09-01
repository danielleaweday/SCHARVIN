import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import TopBar from "@/components/cynaiah/TopBar";
import { AncrMark, PoweredByAncr } from "@/components/cynaiah/Brand";
import { Star, ExternalLink } from "lucide-react";

export default function Showcase() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        api.get("/portfolio").then((r) => setItems(r.data));
    }, []);

    const featured = items.filter((i) => i.featured);
    const rest = items.filter((i) => !i.featured);

    return (
        <div>
            <TopBar
                subtitle="Showcase"
                title="Present your work to the world"
            />

            {/* Hero */}
            {featured[0] && (
                <div className="relative border-b border-white/[0.05] overflow-hidden cyn-noise">
                    <img
                        src={featured[0].thumbnail_url}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/70 to-transparent" />
                    <div className="cyn-hero-glow" />
                    <div className="relative px-8 md:px-12 py-16 max-w-3xl">
                        <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-cynaiah-gold">
                            <Star size={12} /> Featured reel
                        </div>
                        <h2 className="mt-3 font-heading text-4xl md:text-6xl font-light leading-[1.05] tracking-tight">
                            {featured[0].title}
                        </h2>
                        <p className="mt-4 text-white/60 max-w-xl">
                            {featured[0].description}
                        </p>
                        <button className="mt-6 cyn-btn-primary rounded-full px-6 py-3 text-sm inline-flex items-center gap-2">
                            <ExternalLink size={14} /> Publish to ANCRVIEW (coming)
                        </button>
                    </div>
                </div>
            )}

            {/* Grid */}
            <section className="px-8 md:px-12 py-10">
                <div className="text-[10px] uppercase tracking-[0.28em] text-white/40">
                    Public showcase
                </div>
                <h3 className="font-heading text-2xl mt-1 mb-5">The rest of the reel</h3>

                {items.length === 0 && (
                    <div className="glass rounded-xl p-10 text-center text-white/60">
                        Nothing in your portfolio yet. Curate one from Portfolio.
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[...(featured.length ? featured.slice(1) : []), ...rest].map(
                        (p) => (
                            <div
                                key={p.id}
                                className="relative rounded-xl overflow-hidden border border-white/[0.06] lift group"
                            >
                                <img
                                    src={p.thumbnail_url}
                                    alt=""
                                    className="aspect-[16/10] w-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                    <div className="text-[10px] uppercase tracking-[0.22em] text-white/60">
                                        {p.category}
                                    </div>
                                    <div className="font-heading text-xl text-white">
                                        {p.title}
                                    </div>
                                </div>
                            </div>
                        ),
                    )}
                </div>

                <div className="mt-16 glass rounded-xl p-6 flex items-center gap-6 flex-wrap">
                    <AncrMark size={26} className="opacity-90" />
                    <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase tracking-[0.28em] text-white/40">
                            Ecosystem
                        </div>
                        <div className="font-heading text-lg text-white">
                            Completed work will publish to ANCRVIEW and be credited via
                            ANCRID.
                        </div>
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                        Integration coming
                    </div>
                </div>
            </section>
        </div>
    );
}
