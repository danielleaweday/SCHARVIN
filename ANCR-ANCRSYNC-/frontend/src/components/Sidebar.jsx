import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Logo from "@/components/Logo";
import {
  LayoutDashboard, Gauge, BookOpen, FileText, Briefcase, GraduationCap,
  Mic2, Layers, Building2, ClipboardList, CalendarClock, Trophy,
  Sparkles, Settings, LogOut,
} from "lucide-react";

const NAV = [
  { to: "/dashboard", label: "Career Dashboard", icon: LayoutDashboard, tid: "nav-dashboard" },
  { to: "/readiness", label: "Career Readiness", icon: Gauge, tid: "nav-readiness" },
  { to: "/portfolio", label: "Portfolio", icon: BookOpen, tid: "nav-portfolio" },
  { to: "/resume", label: "Resume", icon: FileText, tid: "nav-resume" },
  { to: "/jobs", label: "Jobs", icon: Briefcase, tid: "nav-jobs" },
  { to: "/internships", label: "Internships", icon: GraduationCap, tid: "nav-internships" },
  { to: "/auditions", label: "Auditions", icon: Mic2, tid: "nav-auditions" },
  { to: "/projects", label: "Projects", icon: Layers, tid: "nav-projects" },
  { to: "/employer-network", label: "Employer Network", icon: Building2, tid: "nav-employer-network" },
  { to: "/applications", label: "Applications", icon: ClipboardList, tid: "nav-applications" },
  { to: "/interviews", label: "Interviews", icon: CalendarClock, tid: "nav-interviews" },
  { to: "/graduate-outcomes", label: "Graduate Outcomes", icon: Trophy, tid: "nav-outcomes" },
  { to: "/coach", label: "Career Coach (AIAH)", icon: Sparkles, tid: "nav-coach" },
  { to: "/settings", label: "Settings", icon: Settings, tid: "nav-settings" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  return (
    <aside
      data-testid="ecosystem-sidebar"
      className="hidden lg:flex fixed left-0 top-0 h-screen w-72 flex-col z-40 border-r hair"
      style={{ background: "#050505" }}
    >
      <div className="px-8 pt-8 pb-8">
        <NavLink to="/dashboard" className="flex items-center gap-3 group" data-testid="sidebar-logo">
          <Logo size={44} />
          <div className="flex items-baseline gap-1">
            <span className="font-display text-2xl tracking-tight leading-none">ANCR</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/60 pb-0.5">Launch™</span>
          </div>
        </NavLink>
        <p className="label-eyebrow mt-4">Learn. Graduate. Launch.</p>
      </div>

      <nav className="flex-1 px-4 overflow-y-auto pb-6">
        {NAV.map(({ to, label, icon: Icon, tid }) => (
          <NavLink
            key={to}
            to={to}
            data-testid={tid}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-3 mb-0.5 transition-colors relative
              ${isActive
                ? "text-white bg-white/5"
                : "text-white/50 hover:text-white hover:bg-white/[0.03]"}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    className="absolute left-0 top-1 bottom-1 w-[2px] grad-stroke"
                    aria-hidden
                  />
                )}
                <Icon strokeWidth={1.25} className="h-4 w-4 shrink-0" />
                <span className="text-[13px] font-body tracking-tight">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-5 border-t hair">
        {user && (
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 border hair-strong flex items-center justify-center font-mono text-[11px]">
              {(user.full_name || user.email).slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] truncate">{user.full_name}</div>
              <div className="label-eyebrow text-[9px]">{user.role.replace("_", " ")}</div>
            </div>
          </div>
        )}
        <button
          data-testid="btn-logout"
          onClick={logout}
          className="w-full flex items-center justify-between px-3 py-2 text-[11px] uppercase tracking-[0.2em] font-mono border hair hover:border-white/25 transition-colors"
        >
          <span>Sign out</span>
          <LogOut strokeWidth={1.25} className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
}
