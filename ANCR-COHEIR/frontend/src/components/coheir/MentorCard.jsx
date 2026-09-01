import React from "react";
import { BadgeCheck, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export function RoleChip({ children, tone = "blue" }) {
  const tones = {
    blue: "bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/25",
    violet: "bg-[#8B5CF6]/10 text-[#C4B5FD] border-[#8B5CF6]/25",
    orange: "bg-[#F97316]/10 text-[#FDBA74] border-[#F97316]/30",
    zinc: "bg-white/[0.05] text-zinc-300 border-white/10",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest border ${tones[tone] || tones.zinc}`}>
      {children}
    </span>
  );
}

export function VerifiedBadge({ className = "" }) {
  return <BadgeCheck className={`w-4 h-4 text-[#00F0FF] verified-dot ${className}`} data-testid="profile-verified-badge" />;
}

const ROLE_TONE = {
  producer: "orange", songwriter: "violet", engineer: "blue",
  creative_director: "violet", attorney: "zinc", publisher: "orange",
  manager: "blue", agent: "zinc", employer: "orange",
  artist: "violet", faculty: "blue", department_chair: "blue",
  adjunct_faculty: "blue", mentor: "violet", researcher: "zinc",
  guest_lecturer: "zinc",
};

export function MentorCard({ p, index = 0 }) {
  const navigate = useNavigate();
  const roleLabel = (p.title || p.role || "").toString().replace(/_/g, " ");
  const tone = ROLE_TONE[p.role] || "blue";
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.35) }}
      className="glass-interactive p-5 flex flex-col gap-4 relative overflow-hidden"
      data-testid={`mentor-card-${p.user_id}`}>
      <div className="flex items-start justify-between">
        <RoleChip tone={tone}>{p.role?.replace("_", " ")}</RoleChip>
        <button className="text-zinc-500 hover:text-white text-xs">Save</button>
      </div>
      <div className="flex flex-col items-center text-center gap-2">
        <div className="w-24 h-24 rounded-full overflow-hidden ring-1 ring-white/10 mb-1 relative">
          {p.picture ? (
            <img src={p.picture} alt={p.name} className="w-full h-full object-cover" />
          ) : <div className="w-full h-full bg-gradient-cohesion" />}
          <div className="absolute inset-0 rounded-full ring-[3px] ring-transparent hover:ring-[#00F0FF]/40 transition-all" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="wordmark text-white text-lg leading-tight">{p.name}</div>
          {p.verified && <VerifiedBadge />}
        </div>
        <div className="text-zinc-400 text-sm">{roleLabel}</div>
        <div className="font-mono text-[10px] text-zinc-500 tracking-wider uppercase">
          {(p.disciplines || []).slice(0, 3).join(" · ")}
        </div>
        {p.location && (
          <div className="flex items-center gap-1 text-zinc-500 text-xs">
            <MapPin className="w-3 h-3" /> {p.location}
          </div>
        )}
      </div>
      <button
        data-testid={`mentor-card-view-${p.user_id}`}
        onClick={() => navigate(`/profile/${p.user_id}`)}
        className="btn-outline mt-auto text-xs py-2">
        View Profile
      </button>
    </motion.div>
  );
}
