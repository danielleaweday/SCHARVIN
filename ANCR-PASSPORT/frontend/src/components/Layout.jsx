import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home, Compass, GraduationCap, Languages, ClipboardCheck, Briefcase,
  Plane, ShieldAlert, School, IdCard, BookOpen, Users2, Menu, X, Bell,
  Search, ChevronDown, User, FileText, Gauge, Settings, LogOut, Music2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/Logo";
import { useApp } from "@/context/AppContext";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const NAV = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/culture-school", label: "Culture School", icon: GraduationCap },
  { to: "/translator", label: "Translator", icon: Languages, signature: true },
  { to: "/music-compass", label: "Music Compass", icon: Music2, signature: true },
  { to: "/travel-ready", label: "Travel Ready", icon: ClipboardCheck },
  { to: "/trips", label: "My Trips", icon: Briefcase },
  { to: "/trip-mode", label: "Trip Mode", icon: Plane },
  { to: "/safety", label: "Safety", icon: ShieldAlert },
  { to: "/global-classroom", label: "Global Classroom", icon: School },
  { to: "/network", label: "Network", icon: Users2 },
  { to: "/journal", label: "Journal", icon: BookOpen },
  { to: "/passport", label: "My Passport", icon: IdCard },
];

const NavItems = ({ onClick }) => (
  <nav className="flex flex-col gap-1 px-3" data-testid="sidebar-nav">
    {NAV.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        onClick={onClick}
        data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
        className={({ isActive }) =>
          `group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-500 transition-all duration-300 ${
            isActive
              ? "bg-white/8 text-white"
              : "text-white/55 hover:text-white hover:bg-white/5"
          }`
        }
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <motion.span
                layoutId="nav-active"
                className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full"
                style={{ background: "linear-gradient(#22d3ee,#d946ef)" }}
              />
            )}
            <item.icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
            <span>{item.label}</span>
            {item.signature && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-magenta shadow-[0_0_8px_#d946ef]" />
            )}
          </>
        )}
      </NavLink>
    ))}
  </nav>
);

export const Layout = ({ children }) => {
  const { user } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const onSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/explore?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/8 bg-[#070912]/80 backdrop-blur-xl lg:flex">
        <div className="px-5 py-6">
          <Logo />
        </div>
        <div className="no-scrollbar flex-1 overflow-y-auto pb-6">
          <NavItems />
        </div>
        <div className="border-t border-white/8 px-5 py-4 text-[10px] leading-relaxed text-white/30">
          Part of the CCDP™ powered by ANCR™ ecosystem. Demonstration build.
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/8 bg-[#070912] lg:hidden"
            >
              <div className="flex items-center justify-between px-5 py-6">
                <Logo />
                <button onClick={() => setMobileOpen(false)} data-testid="close-mobile-nav" className="text-white/60">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pb-6">
                <NavItems onClick={() => setMobileOpen(false)} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-white/8 bg-[#05050A]/75 backdrop-blur-xl">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button onClick={() => setMobileOpen(true)} data-testid="open-mobile-nav" className="text-white/70 lg:hidden">
              <Menu className="h-6 w-6" />
            </button>
            <form onSubmit={onSearch} className="relative hidden max-w-md flex-1 sm:block" data-testid="global-search-form">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a country or city"
                data-testid="global-search-input"
                className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-cyan/50 focus:bg-white/8"
              />
            </form>
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <button data-testid="notifications-btn" onClick={() => navigate("/passport")} className="relative rounded-full border border-white/10 bg-white/5 p-2.5 text-white/70 transition hover:text-white hover:border-white/20">
                <Bell className="h-[18px] w-[18px]" strokeWidth={1.6} />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-magenta shadow-[0_0_8px_#d946ef]" />
              </button>
              <ProfileMenu user={user} />
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

const ProfileMenu = ({ user }) => {
  const navigate = useNavigate();
  const { setRole } = useApp();
  if (!user) return null;
  const items = [
    { label: "My Profile", icon: User, to: "/passport" },
    { label: "Documents", icon: FileText, to: "/documents" },
    { label: "Readiness", icon: Gauge, to: "/readiness" },
    { label: "Settings", icon: Settings, to: "/settings" },
  ];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button data-testid="profile-menu-trigger" className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-2.5 transition hover:border-white/20">
          <img src={user.avatar} alt={user.name} className="h-7 w-7 rounded-full object-cover" />
          <span className="hidden text-sm font-500 text-white/85 sm:block">{user.first_name}</span>
          <ChevronDown className="h-4 w-4 text-white/50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 border-white/10 bg-[#0B1021]/95 backdrop-blur-xl text-white">
        <DropdownMenuLabel>
          <div className="flex items-center gap-3">
            <img src={user.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
            <div>
              <div className="text-sm font-600">{user.name}</div>
              <div className="text-[11px] text-white/45">{user.discipline} · {user.role}</div>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <div className="px-2 py-1.5">
          <div className="mb-1.5 text-[10px] uppercase tracking-widest text-white/35">Active role (ANCRID)</div>
          <div className="flex flex-wrap gap-1.5">
            {user.available_roles.map((r) => (
              <button
                key={r}
                data-testid={`role-switch-${r.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => { setRole(r); toast.success(`Switched to ${r} view`); }}
                className={`rounded-full px-2.5 py-1 text-[11px] transition ${user.role === r ? "bg-cyan/20 text-cyan border border-cyan/40" : "bg-white/5 text-white/55 border border-white/10 hover:text-white"}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <DropdownMenuSeparator className="bg-white/10" />
        {items.map((it) => (
          <DropdownMenuItem key={it.label} data-testid={`profile-menu-${it.label.toLowerCase().replace(/\s+/g, "-")}`} onClick={() => navigate(it.to)} className="cursor-pointer gap-2.5 focus:bg-white/8 focus:text-white">
            <it.icon className="h-4 w-4 text-white/60" strokeWidth={1.6} /> {it.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem data-testid="profile-menu-sign-out" onClick={() => toast("Sign out is disabled in this demonstration build.")} className="cursor-pointer gap-2.5 text-magenta focus:bg-white/8 focus:text-magenta">
          <LogOut className="h-4 w-4" strokeWidth={1.6} /> Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
