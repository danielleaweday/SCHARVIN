import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useRole } from "@/context/RoleContext";
import { Search, Command, Bell } from "lucide-react";

export default function TopBar({ onOpenPalette }) {
  const { role, setRole } = useRole();
  const loc = useLocation();

  // Derive a contextual breadcrumb
  const path = loc.pathname === "/" ? "/dashboard" : loc.pathname;
  const crumbs = path.split("/").filter(Boolean);

  return (
    <header
      data-testid="topbar"
      className="fixed left-0 md:left-[248px] right-0 top-0 z-30 h-[72px] border-b border-white/[0.06] bg-black/60 backdrop-blur-2xl"
    >
      <div className="flex h-full items-center justify-between gap-6 px-6 md:px-8">
        {/* Crumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="ancr-label">
            {role === "faculty" ? "Command Center" : "Learning OS"}
          </div>
          <span className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2 font-mono text-[11px] text-ancr-dim truncate">
            {crumbs.length ? crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-ancr-mute">/</span>}
                <span className={i === crumbs.length - 1 ? "text-white" : ""}>{c}</span>
              </span>
            )) : <span>dashboard</span>}
          </div>
        </div>

        {/* Search */}
        <button
          data-testid="topbar-search"
          onClick={() => onOpenPalette?.()}
          className="hidden lg:flex flex-1 max-w-md items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2 text-left transition hover:border-white/25 hover:bg-white/[0.04]"
        >
          <Search size={14} className="text-ancr-mute" />
          <span className="flex-1 text-[13px] text-ancr-mute">Search experiences, students, songs…</span>
          <div className="flex items-center gap-1 rounded border border-white/10 px-1.5 py-0.5 font-mono text-[9px] text-ancr-dim">
            <Command size={9} /> K
          </div>
        </button>

        {/* Role switcher + notif */}
        <div className="flex items-center gap-4">
          <div
            data-testid="role-switcher"
            className="relative flex rounded-full border border-white/[0.10] bg-white/[0.02] p-1 font-mono text-[10px] tracking-[0.18em] uppercase"
          >
            <span
              className={`absolute top-1 bottom-1 rounded-full bg-white transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                role === "student" ? "left-1 right-[calc(50%+2px)]" : "left-[calc(50%+2px)] right-1"
              }`}
            />
            <button
              data-testid="role-student"
              onClick={() => setRole("student")}
              className={`relative z-10 px-4 py-1.5 transition-colors duration-300 ${
                role === "student" ? "text-black" : "text-ancr-dim hover:text-white"
              }`}
            >Student</button>
            <button
              data-testid="role-faculty"
              onClick={() => setRole("faculty")}
              className={`relative z-10 px-4 py-1.5 transition-colors duration-300 ${
                role === "faculty" ? "text-black" : "text-ancr-dim hover:text-white"
              }`}
            >Faculty</button>
          </div>

          <button data-testid="topbar-bell" className="relative rounded-full border border-white/[0.08] p-2 text-ancr-dim hover:text-white hover:border-white/20 transition">
            <Bell size={15} />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--ancra-accent)] shadow-[0_0_8px_var(--ancra-accent-glow)]" />
          </button>

          <Link to="/settings" data-testid="topbar-avatar" className="h-9 w-9 overflow-hidden rounded-full border border-white/10 hover:border-white/30 transition">
            <img
              src={role === "faculty"
                ? "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop"
                : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"}
              alt=""
              className="h-full w-full object-cover"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
