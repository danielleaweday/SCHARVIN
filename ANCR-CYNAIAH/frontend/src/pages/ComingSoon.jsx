import TopBar from "@/components/cynaiah/TopBar";
import { Sparkles, CircleDashed } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ComingSoon({ title, subtitle, lines = [] }) {
    const nav = useNavigate();
    return (
        <div>
            <TopBar subtitle={subtitle} title={title} />

            <div className="px-8 md:px-12 py-10 max-w-4xl">
                <div className="glass rounded-2xl p-10 relative overflow-hidden">
                    <div className="cyn-hero-glow opacity-40" />
                    <div className="relative">
                        <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-cynaiah-cyan">
                            <CircleDashed size={12} /> Structural preview
                        </div>
                        <h2 className="mt-3 font-heading text-4xl font-light tracking-tight">
                            {title}
                            <span className="ml-3 text-white/40 text-base font-mono align-middle">
                                v0
                            </span>
                        </h2>
                        <p className="mt-3 text-white/60 max-w-2xl">
                            This workspace is scaffolded in CYNAIAH&apos;s architecture and
                            will be fully wired in an upcoming iteration. Below is what
                            you&apos;ll find here.
                        </p>

                        <ul className="mt-6 space-y-2">
                            {lines.map((l) => (
                                <li
                                    key={l}
                                    className="flex items-start gap-3 text-white/80"
                                >
                                    <span className="mt-2 w-1.5 h-1.5 rounded-full cyn-bg-gradient shrink-0" />
                                    <span>{l}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <button
                                onClick={() => nav("/create")}
                                className="cyn-btn-primary rounded-full px-5 py-2.5 text-sm flex items-center gap-2"
                            >
                                <Sparkles size={14} /> Start a project
                            </button>
                            <button
                                onClick={() => nav("/projects")}
                                className="cyn-btn-ghost rounded-full px-5 py-2.5 text-sm"
                            >
                                Open Projects
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
