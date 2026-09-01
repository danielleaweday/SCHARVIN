import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Compass, IdCard, Layers, History as HistoryIcon, Globe2, Users2, GraduationCap, Briefcase, Award, Shield, Boxes, Search, Settings as SettingsIcon, Sparkles, LogOut, Trophy, KeyRound, Plane } from "lucide-react";

const items = [
  { to: "/app/overview",       label: "Overview",         icon: Compass },
  { to: "/app/identity",       label: "Identity",         icon: IdCard },
  { to: "/app/portfolio",      label: "Portfolio",        icon: Layers },
  { to: "/app/timeline",       label: "Creator Journey",  icon: HistoryIcon },
  { to: "/app/passport",       label: "Passport",         icon: Globe2 },
  { to: "/app/mobility",       label: "Creator Mobility", icon: Plane },
  { to: "/app/collaborations", label: "Collaborations",   icon: Users2 },
  { to: "/app/education",      label: "Education",        icon: GraduationCap },
  { to: "/app/history",        label: "Professional",     icon: Briefcase },
  { to: "/app/skills",         label: "Skills",           icon: Sparkles },
  { to: "/app/achievements",   label: "Achievements",     icon: Trophy },
  { to: "/app/credentials",    label: "Credentials",      icon: Shield },
  { to: "/app/connected",      label: "Connected Ecosystem", icon: Boxes },
  { to: "/app/sso",            label: "SSO Handshake",    icon: KeyRound },
  { to: "/app/network",        label: "Network",          icon: Search },
  { to: "/app/settings",       label: "Settings",         icon: SettingsIcon },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="hidden lg:flex flex-col w-[264px] shrink-0 border-r border-white/5 bg-black/40 backdrop-blur-xl min-h-screen sticky top-0" data-testid="sidebar">
      <div className="px-6 pt-8 pb-6">
        <NavLink to="/" className="flex items-center gap-3" data-testid="sidebar-brand">
          <img src="https://customer-assets.emergentagent.com/job_digital-identity-128/artifacts/yayjbryc_ChatGPT%20Image%20Jul%207%2C%202026%2C%2004_45_47%20PM.png"
               alt="ANCRID" className="w-10 h-10 rounded-xl object-cover" />
          <div>
            <div className="font-display text-xl tracking-tighter text-white leading-none">ANCRID<span className="text-white/40 align-super text-[10px]">™</span></div>
            <div className="font-mono text-[9px] tracking-[0.28em] uppercase text-white/40 mt-1">Part of the ANCR Ecosystem</div>
          </div>
        </NavLink>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto pb-6">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 ${
                isActive
                  ? "bg-white/[0.06] text-white border border-white/10"
                  : "text-white/55 hover:text-white hover:bg-white/[0.03] border border-transparent"
              }`
            }
          >
            <Icon size={16} strokeWidth={1.6} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="glass rounded-2xl p-3 flex items-center gap-3" data-testid="sidebar-user">
          <div className="w-9 h-9 rounded-full ancr-gradient-bg shrink-0 flex items-center justify-center text-black text-xs font-mono font-bold">
            {(user?.professional_name || user?.email || "A").slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-white truncate">{user?.professional_name || user?.email}</div>
            <div className="font-mono text-[10px] tracking-[0.16em] text-white/40 uppercase truncate">{user?.identity?.ancrid_number || "ANCRID"}</div>
          </div>
          <button
            data-testid="logout-btn"
            onClick={async () => { await logout(); navigate("/"); }}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Log out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
