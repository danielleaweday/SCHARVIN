import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { VaultaLogo, AncrLogo } from "@/components/VaultaLogo";
import {
  LayoutDashboard, TrendingUp, Receipt, PiggyBank, Music2, BookOpen, FileText,
  FileSignature, Landmark, Building2, Sparkles, BarChart3, Lock, Settings as SettingsIcon,
  Bot, Network, LogOut, Bell, Search, Route
} from "lucide-react";

const NAV_MAIN = [
  { to: "/",           label: "Overview",   icon: LayoutDashboard, testid: "sidebar-nav-overview" },
  { to: "/income",     label: "Income",     icon: TrendingUp,      testid: "sidebar-nav-income" },
  { to: "/expenses",   label: "Expenses",   icon: Receipt,         testid: "sidebar-nav-expenses" },
  { to: "/budget",     label: "Budget",     icon: PiggyBank,       testid: "sidebar-nav-budget" },
  { to: "/royalties",  label: "Royalties",  icon: Music2,          testid: "sidebar-nav-royalties" },
  { to: "/publishing", label: "Publishing", icon: BookOpen,        testid: "sidebar-nav-publishing" },
  { to: "/contracts",  label: "Contracts",  icon: FileSignature,   testid: "sidebar-nav-contracts" },
  { to: "/invoices",   label: "Invoices",   icon: FileText,        testid: "sidebar-nav-invoices" },
  { to: "/projects",   label: "Projects P&L", icon: Route,         testid: "sidebar-nav-projects" },
  { to: "/taxes",      label: "Taxes",      icon: Landmark,        testid: "sidebar-nav-taxes" },
  { to: "/business",   label: "Business",   icon: Building2,       testid: "sidebar-nav-business" },
  { to: "/funding",    label: "Grants & Funding", icon: Sparkles,  testid: "sidebar-nav-funding" },
  { to: "/reports",    label: "Reports",    icon: BarChart3,       testid: "sidebar-nav-reports" },
  { to: "/vault",      label: "Vault",      icon: Lock,            testid: "sidebar-nav-vault" },
];

const NAV_SECONDARY = [
  { to: "/aiah",       label: "AIAH — Advisor", icon: Bot,      testid: "sidebar-nav-aiah" },
  { to: "/ecosystem",  label: "Ecosystem",       icon: Network,  testid: "sidebar-nav-ecosystem" },
  { to: "/settings",   label: "Settings",        icon: SettingsIcon, testid: "sidebar-nav-settings" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-[#050505] text-white relative z-10">
      {/* Sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-[260px] flex-col bg-[#040404] border-r border-white/[0.06] z-40">
        <div className="px-6 pt-7 pb-6">
          <VaultaLogo size="large" />
          <div className="text-[10px] tracking-[0.28em] text-white/35 mt-3 font-semibold">
            FINANCIAL OS
          </div>
        </div>

        <div className="px-4 flex-1 overflow-y-auto pb-6">
          <div className="eyebrow px-3 mb-2">Command</div>
          <nav className="flex flex-col gap-0.5">
            {NAV_MAIN.map(({ to, label, icon: Icon, testid }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                data-testid={testid}
                className={({ isActive }) =>
                  `group flex items-center gap-3 pl-3 pr-3 py-2 text-[13px] rounded-md
                   ${isActive
                    ? "nav-active text-white"
                    : "text-white/55 hover:text-white hover:bg-white/[0.03]"}`
                }
              >
                <Icon size={15} strokeWidth={1.8} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="eyebrow px-3 mt-6 mb-2">Systems</div>
          <nav className="flex flex-col gap-0.5">
            {NAV_SECONDARY.map(({ to, label, icon: Icon, testid }) => (
              <NavLink
                key={to}
                to={to}
                data-testid={testid}
                className={({ isActive }) =>
                  `group flex items-center gap-3 pl-3 pr-3 py-2 text-[13px] rounded-md
                   ${isActive
                    ? "nav-active text-white"
                    : "text-white/55 hover:text-white hover:bg-white/[0.03]"}`
                }
              >
                <Icon size={15} strokeWidth={1.8} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mx-4 mb-4 p-3 rounded-lg glass" data-testid="sidebar-user-card">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full gradient-bar flex items-center justify-center text-[11px] font-bold text-black">
              {user?.name?.[0] || "V"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium truncate">{user?.name}</div>
              <div className="text-[10px] tracking-[0.22em] uppercase text-white/40">{user?.role}</div>
            </div>
            <button
              onClick={handleLogout}
              data-testid="sidebar-logout-btn"
              className="text-white/50 hover:text-white p-1"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>

        <div className="px-6 pb-5 pt-3 border-t border-white/[0.05] flex items-center justify-center">
          <AncrLogo />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:pl-[260px]">
        <div className="sticky top-0 z-30 backdrop-blur-xl bg-[#050505]/70 border-b border-white/[0.05]">
          <div className="flex items-center justify-between px-6 lg:px-10 h-16">
            <div className="flex items-center gap-3">
              <div className="lg:hidden">
                <VaultaLogo />
              </div>
              <div className="hidden md:flex items-center gap-2 pl-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
                <div className="text-[10px] tracking-[0.28em] uppercase text-white/45 font-semibold">Live · Vaulta Terminal</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md border border-white/[0.06] bg-white/[0.02] text-[12px] text-white/50 w-64">
                <Search size={13} />
                <span>Search invoices, songs, contracts…</span>
                <span className="ml-auto text-[10px] text-white/30 border border-white/10 rounded px-1.5">⌘K</span>
              </div>
              <button className="text-white/55 hover:text-white p-2 rounded-md hover:bg-white/[0.03]" data-testid="topbar-notifications">
                <Bell size={16} />
              </button>
            </div>
          </div>
        </div>
        <div className="px-6 lg:px-10 py-8 lg:py-10 max-w-[1680px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
