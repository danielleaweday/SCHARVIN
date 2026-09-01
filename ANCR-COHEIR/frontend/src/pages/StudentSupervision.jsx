import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { RoleChip, VerifiedBadge } from "@/components/coheir/MentorCard";
import { motion } from "framer-motion";
import { Search, GraduationCap, MapPin, ChevronRight, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function StudentSupervision() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [scope, setScope] = useState(user?.role === "student" ? "all" : "mine");
  const [items, setItems] = useState([]);

  useEffect(() => {
    const url = scope === "mine" ? "/supervision/mine" : `/students?q=${encodeURIComponent(q)}`;
    api.get(url).then(({ data }) => setItems(data));
  }, [scope, q]);

  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Student Supervision</div>
        <h1 className="wordmark text-4xl md:text-5xl text-white">Students under your leadership.</h1>
        <p className="text-zinc-500 mt-2 max-w-2xl text-sm">
          Access ANCRID™, portfolios, courses, projects, achievements, timelines, and reviews — all in one supervision surface.
        </p>
      </header>

      <div className="glass-panel p-4 flex flex-wrap items-center gap-3">
        <label className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input data-testid="students-search-input" value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search students by name, program, skill, location…"
            className="w-full bg-white/[0.04] border border-white/[0.06] rounded-full pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none" />
        </label>
        {user?.role !== "student" && (
          <div className="flex gap-2">
            {["mine", "all"].map((s) => (
              <button key={s} data-testid={`students-scope-${s}`} onClick={() => setScope(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest border transition-colors ${
                  scope === s ? "bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30" :
                  "bg-white/[0.03] text-zinc-400 border-white/[0.08]"
                }`}>
                {s === "mine" ? "My Supervised" : "All Students"}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((s, i) => (
          <motion.div key={s.user_id}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="glass-interactive p-5 space-y-3"
            data-testid={`student-card-${s.user_id}`}>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl overflow-hidden ring-1 ring-white/10">
                {s.picture ? <img src={s.picture} alt={s.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-cohesion" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <div className="text-white font-semibold truncate">{s.name}</div>
                  {s.verified && <VerifiedBadge />}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {s.program}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(s.skills || []).slice(0, 4).map((sk) => <RoleChip key={sk} tone="zinc">{sk}</RoleChip>)}
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{s.location || "—"}</div>
              <div className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-[#00F0FF]" /> Readiness {s.career_readiness || 0}</div>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div className="h-full bg-gradient-cohesion" style={{ width: `${s.career_readiness || 0}%` }} />
            </div>
            <Link to={`/students/${s.user_id}`} className="btn-outline text-xs w-full flex items-center justify-center gap-1 py-2"
              data-testid={`student-open-${s.user_id}`}>
              Open Supervision Surface <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        ))}
      </div>
      {items.length === 0 && (
        <div className="glass-panel p-10 text-center text-zinc-500">
          {scope === "mine" ? "You don't have any supervised students yet." : "No students match your search."}
        </div>
      )}
    </div>
  );
}
