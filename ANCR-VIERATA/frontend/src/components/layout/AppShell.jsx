import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/brand/Logo";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import {
  Home, HeartPulse, Activity, Sparkles, Waves,
  BookOpen, Users, LifeBuoy, LineChart, LogOut, ArrowUpRight, Menu, X, Leaf, Shield, FileVideo,
} from "lucide-react";
import { useState } from "react";

const NAV = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/check-in", label: "Daily Check-In", icon: HeartPulse },
  { to: "/wellness", label: "My Wellness", icon: Activity },
  { to: "/lifestyle", label: "Lifestyle", icon: Leaf },
  { to: "/performance", label: "Performance", icon: Sparkles },
  { to: "/recovery", label: "Recovery", icon: Waves },
  { to: "/learning", label: "Learning", icon: BookOpen },
  { to: "/circle", label: "Wellness Circle", icon: Users },
  { to: "/support", label: "Support", icon: LifeBuoy },
  { to: "/progress", label: "My Progress", icon: LineChart },
];

const ADMIN_NAV_ITEMS = [
  { to: "/admin", label: "Staff Dashboard", icon: Shield },
  { to: "/admin/media", label: "Media Library", icon: FileVideo },
];

function NavList({ onNavigate, isAdmin }) {
  const items = isAdmin ? [...NAV, ...ADMIN_NAV_ITEMS] : NAV;
  return (
    <nav className="flex flex-col gap-1" data-testid="primary-nav">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            data-testid={`nav-${item.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-sans transition-all ${
                isActive
                  ? "bg-white/[0.07] border border-white/15 text-white"
                  : "text-white/60 border border-transparent hover:text-white hover:bg-white/[0.04]"
              }`
            }
          >
            <Icon className="w-4 h-4" strokeWidth={1.6} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = `${user?.first_name?.[0] || ""}${user?.last_name?.[0] || ""}`.toUpperCase();

  return (
    <div className="min-h-screen relative text-white">
      <AmbientBackground />

      {/* Header */}
      <header
        className="sticky top-0 z-40 w-full"
        style={{ backdropFilter: "blur(18px)", background: "rgba(5,5,5,0.72)" }}
        data-testid="app-header"
      >
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-6">
            <button
              className="lg:hidden text-white/70"
              onClick={() => setMobileOpen(true)}
              data-testid="mobile-menu-btn"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Logo />
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://ancr.example.com"
              onClick={(e) => e.preventDefault()}
              data-testid="return-to-ancr-btn"
              className="hidden sm:inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/70 hover:text-white px-4 py-2 rounded-full border border-white/10 hover:border-white/25 transition-colors"
              title="Return to ANCR"
            >
              Return to ANCR <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            {user && (
              <div className="flex items-center gap-3" data-testid="ancrid-profile">
                <div className="text-right hidden sm:block leading-tight">
                  <div className="text-sm font-medium">{user.first_name} {user.last_name}</div>
                  <div className="text-[11px] text-white/50 font-mono">{user.ancrid}</div>
                </div>
                <div className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center font-display text-sm bg-white/[0.04]">
                  {initials || "V"}
                </div>
                <button
                  onClick={async () => { await logout(); navigate("/login"); }}
                  data-testid="logout-btn"
                  title="Sign out"
                  className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 pt-8 pb-24 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        {/* Desktop nav */}
        <aside className="hidden lg:block sticky top-24 self-start">
          <div className="glass rounded-3xl p-4">
            <NavList isAdmin={user?.role === "admin"} />
          </div>

          {user?.is_demo && (
            <div className="mt-4 glass rounded-3xl p-4" data-testid="demo-indicator-side">
              <div className="text-[10px] uppercase tracking-[0.2em] text-viearta-teal mb-1">Demo Experience</div>
              <div className="text-sm text-white/80">You are exploring VIEARTA with the seeded student profile.</div>
            </div>
          )}
        </aside>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-[280px] bg-[#0a0a0a] border-r border-white/10 p-5">
              <div className="flex items-center justify-between mb-6">
                <Logo />
                <button onClick={() => setMobileOpen(false)} data-testid="mobile-menu-close" className="text-white/70">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <NavList onNavigate={() => setMobileOpen(false)} isAdmin={user?.role === "admin"} />
            </div>
          </div>
        )}

        <main className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
