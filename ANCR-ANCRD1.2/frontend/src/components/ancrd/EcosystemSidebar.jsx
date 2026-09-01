import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home, GraduationCap, FlaskConical, Users2, Sparkles, Globe2,
  BookMarked, Wallet, PlayCircle, Rocket, IdCard, Bell, MessagesSquare,
  Compass, Calendar, Briefcase, Store, ShieldCheck, LogOut,
  Radio, UsersRound, Handshake, Building2, UserCircle, TargetIcon,
  Search as SearchIcon
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { BrandLogo, AncrMark, ANCRD_LOGO } from "./BrandLogo";

const ECOSYSTEM = [
  { to: "/feed", label: "ANCRD",     mark: "™", icon: Home,        active: true },
  { to: "/ancra", label: "ANCRA",    mark: "™", icon: GraduationCap },
  { to: "/ancrlab", label: "ANCRLAB", mark: "™", icon: FlaskConical },
  { to: "/ancrsync", label: "ANCRSync", mark: "™", icon: Users2 },
  { to: "/coheir", label: "COHEIR",  mark: "™", icon: Sparkles },
  { to: "/inheira", label: "INHEIRA", mark: "™", icon: BookMarked },
  { to: "/vaulta", label: "Vaulta",   mark: "™", icon: Wallet },
  { to: "/ancrmedia", label: "ANCRMEDIA", mark: "™", icon: PlayCircle },
  { to: "/ancrlaunch", label: "ANCRLaunch", mark: "™", icon: Rocket },
  { to: "/ancrid", label: "ANCRID",  mark: "™", icon: IdCard },
];

const APP_NAV_STATIC = [
  { to: "/feed",           label: "The Signal",     icon: Radio },
  { to: "/network",        label: "Network",        icon: UsersRound },
  { to: "/collaborations", label: "Collaborations", icon: Handshake },
  { to: "/opportunities",  label: "Opportunities",  icon: Briefcase },
  { to: "/events",         label: "Events",         icon: Calendar },
  { to: "/institutions",   label: "Institutions",   icon: Building2 },
  { to: "/discover",       label: "Discover",       icon: Globe2 },
  { to: "/messages",       label: "Messages",       icon: MessagesSquare },
  { to: "/notifications",  label: "Notifications",  icon: Bell },
];

export default function EcosystemSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  return (
    <aside data-testid="ecosystem-sidebar" className="hidden lg:flex flex-col w-[280px] shrink-0 h-screen sticky top-0 border-r border-white/5 bg-[#060608]">
      <div className="px-4 pt-6 pb-6 flex flex-col items-start" data-testid="sidebar-brand">
        <img
          src={ANCRD_LOGO}
          alt="ANCRD"
          data-testid="brand-logo-sidebar"
          className="w-[240px] h-auto select-none block"
          style={{ mixBlendMode: "screen" }}
          draggable="false"
        />
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mt-2 flex items-center gap-1 pl-1">
          Part of the <AncrMark /> Ecosystem
        </div>
      </div>

      <div className="px-4 pb-2">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30 px-2 mb-2">Modules</div>
        <nav className="space-y-0.5">
          {ECOSYSTEM.map((m) => {
            const Icon = m.icon;
            const isActive = m.to === "/feed" && (location.pathname === "/" || location.pathname.startsWith("/feed") || APP_NAV_STATIC.some(a=>location.pathname.startsWith(a.to)) || location.pathname.startsWith("/profile") || location.pathname.startsWith("/institutions") || location.pathname.startsWith("/network") || location.pathname.startsWith("/collaborations") || location.pathname.startsWith("/admin") || location.pathname.startsWith("/marketplace"));
            return (
              <NavLink
                key={m.label}
                to={m.to}
                data-testid={`nav-eco-${m.label.toLowerCase()}`}
                className={({ isActive: navActive }) => {
                  const on = m.to === "/feed" ? isActive : navActive;
                  return `group flex items-center gap-3 px-3 py-2 rounded-sm border ${on ? "bg-white/[0.04] border-white/10 text-white" : "border-transparent text-white/60 hover:text-white hover:bg-white/[0.03]"}`;
                }}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                <span className="font-display font-bold text-sm tracking-tight">{m.label}</span>
                <span className="text-[9px] font-mono" style={{ color: m.to === "/feed" ? "#F97316" : "rgba(255,255,255,0.35)" }}>{m.mark}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="px-4 pt-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30 px-2 mb-2">Network</div>
        <nav className="space-y-0.5">
          {APP_NAV_STATIC.map((n) => {
            const Icon = n.icon;
            return (
              <NavLink
                key={n.to}
                to={n.to}
                data-testid={`nav-${n.label.toLowerCase().replace(/\s+/g,'-')}`}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-sm text-sm ${isActive ? "bg-white/[0.05] text-white" : "text-white/55 hover:text-white hover:bg-white/[0.03]"}`
                }
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                <span>{n.label}</span>
              </NavLink>
            );
          })}
          {user && (
            <NavLink
              to={`/profile/${user.id}`}
              data-testid="nav-profile"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-sm text-sm ${isActive ? "bg-white/[0.05] text-white" : "text-white/55 hover:text-white hover:bg-white/[0.03]"}`
              }
            >
              <UserCircle className="h-4 w-4" strokeWidth={1.5} />
              <span>Profile</span>
            </NavLink>
          )}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-white/5">
        {user && (
          <NavLink to={`/profile/${user.id}`} data-testid="sidebar-user-card" className="flex items-center gap-3 p-2 rounded-sm hover:bg-white/[0.04]">
            <img src={user.avatar} alt="" className="h-9 w-9 object-cover rounded-sm" />
            <div className="min-w-0">
              <div className="font-display font-bold text-sm truncate">{user.name}</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-white/40 truncate">{user.role}</div>
            </div>
          </NavLink>
        )}
        <button
          data-testid="logout-btn"
          onClick={logout}
          className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-mono uppercase tracking-wider text-white/50 hover:text-white border border-white/10 hover:border-white/20 btn-cine rounded-sm"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>
    </aside>
  );
}
