import { STATUS_LABEL, STATUS_TONE, TYPE_LABEL } from "@/lib/constants";
import { TID } from "@/constants/testIds";
import { Link } from "react-router-dom";
import { Users, Clock } from "lucide-react";

export default function ProjectCard({ project }) {
    return (
        <Link
            to={`/projects/${project.id}`}
            data-testid={TID.projectCard}
            className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#0C0C10] lift block"
        >
            <div className="aspect-[16/10] w-full overflow-hidden bg-black">
                <img
                    src={project.thumbnail_url}
                    alt={project.title}
                    loading="lazy"
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-[1.03] transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/40 to-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span
                        className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] px-2 py-1 rounded-full bg-black/40 backdrop-blur border border-white/10 ${STATUS_TONE[project.status] || "text-white/70"}`}
                    >
                        <span className="status-dot" />
                        {STATUS_LABEL[project.status] || project.status}
                    </span>
                </div>
                <div className="absolute top-3 right-3">
                    <span className="text-[10px] uppercase tracking-[0.22em] px-2 py-1 rounded-full bg-black/50 backdrop-blur border border-white/10 text-white/80">
                        {TYPE_LABEL[project.type] || project.type}
                    </span>
                </div>
            </div>

            <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="font-heading text-lg text-white leading-tight tracking-tight line-clamp-1">
                        {project.title}
                    </h3>
                    <span className="font-mono text-[11px] text-white/45 shrink-0">
                        {project.progress}%
                    </span>
                </div>
                <p className="text-[13px] text-white/55 line-clamp-2 min-h-[36px]">
                    {project.objective || project.story_concept || "—"}
                </p>

                <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
                    <div
                        className="h-full cyn-bg-gradient"
                        style={{ width: `${project.progress}%` }}
                    />
                </div>

                <div className="flex items-center justify-between text-[11px] text-white/40 pt-1">
                    <span className="inline-flex items-center gap-1.5">
                        <Users size={12} />
                        {project.collaborators?.length || 0} collab
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <Clock size={12} />
                        {project.timeline || "—"}
                    </span>
                </div>
            </div>
        </Link>
    );
}
