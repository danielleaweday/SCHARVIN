import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import {
  LayoutDashboard,
  FolderKanban,
  Radio,
  CalendarClock,
  Globe2,
  BadgeCheck,
  Sparkles,
  LogOut,
  MessageSquare,
  Music2,
  GraduationCap,
  Users2,
  Compass,
} from "lucide-react";
const NavItem = ({ to, icon: Icon, children, testId }) => (
  <NavLink
    to={to}
    data-testid={testId}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm ${
        isActive
          ? "bg-white/[0.06] text-zinc-50 border border-white/[0.08]"
          : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03] border border-transparent"
      }`
    }
  >
    <Icon size={16} strokeWidth={1.6} />
    <span>{children}</span>
  </NavLink>
);

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [presence, setPresence] = useState([]);

  useEffect(() => {
    api
      .get("/presence")
      .then((r) => setPresence(r.data.slice(0, 4)))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-black text-zinc-50 flex relative z-[2]">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-white/[0.06] bg-[#050505] p-4 sticky top-0 h-screen">
        <div
          className="flex items-center gap-2 px-1 py-3 mb-4 cursor-pointer"
          onClick={() => navigate("/dashboard")}
          data-testid="sidebar-logo"
        >
          <div className="bg-black border border-white/10 rounded-xl px-2 py-1.5 flex items-center">
            <img
              src="https://customer-assets.emergentagent.com/job_creative-sync-14/artifacts/5qxf1erx_ChatGPT%20Image%20Jul%206%2C%202026%2C%2009_34_29%20PM.png"
              alt="ANCRSync"
              className="h-7 w-auto object-contain"
            />
          </div>
        </div>

        <div className="text-[10px] tracking-overline text-zinc-600 px-3 mt-2 mb-2">
          Workspace
        </div>
        <nav className="flex flex-col gap-1">
          <NavItem to="/dashboard" icon={LayoutDashboard} testId="nav-dashboard">
            Dashboard
          </NavItem>
          <NavItem to="/workspaces" icon={FolderKanban} testId="nav-workspaces">
            Workspaces
          </NavItem>
          <NavItem to="/studios" icon={Radio} testId="nav-studios">
            Shared Studios
          </NavItem>
          <NavItem to="/sessions" icon={CalendarClock} testId="nav-sessions">
            Shared Sessions
          </NavItem>
          <NavItem to="/ancrlab" icon={Music2} testId="nav-ancrlab">
            ANCRLAB™
          </NavItem>
        </nav>

        <div className="text-[10px] tracking-overline text-zinc-600 px-3 mt-6 mb-2">
          Network
        </div>
        <nav className="flex flex-col gap-1">
          <NavItem to="/messages" icon={MessageSquare} testId="nav-messages">
            Messages
          </NavItem>
          <NavItem to="/discover" icon={Compass} testId="nav-discover">
            Discover
          </NavItem>
          <NavItem to="/communities" icon={Users2} testId="nav-communities">
            Communities
          </NavItem>
          <NavItem to="/mentorship" icon={GraduationCap} testId="nav-mentorship">
            Mentorship
          </NavItem>
          <NavItem to="/global" icon={Globe2} testId="nav-global">
            Global Map
          </NavItem>
        </nav>

        <div className="text-[10px] tracking-overline text-zinc-600 px-3 mt-6 mb-2">
          Identity
        </div>
        <nav className="flex flex-col gap-1">
          <NavItem to="/passport" icon={BadgeCheck} testId="nav-passport">
            Creative Passport
          </NavItem>
          <NavItem to="/ai" icon={Sparkles} testId="nav-ai">
            AI Intelligence
          </NavItem>
        </nav>

        {presence.length > 0 && (
          <div className="mt-6 px-1" data-testid="sidebar-presence">
            <div className="text-[10px] tracking-overline text-zinc-600 mb-2">
              Live now
            </div>
            <div className="space-y-2">
              {presence.map((p) => (
                <div
                  key={p.user_id}
                  className="flex items-center gap-2 text-[11px] text-zinc-500"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full dot-pulse"
                    style={{ background: p.color }}
                  />
                  <span className="text-zinc-300 truncate flex-1">
                    {p.name.split(" ")[0]}
                  </span>
                  <span className="text-zinc-500 truncate">{p.activity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto">
          <div className="glass rounded-xl p-3 mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                style={{
                  background: user?.avatar_color || "#007AFF",
                  color: "#000",
                }}
                data-testid="sidebar-avatar"
              >
                {user?.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] truncate font-medium">
                  {user?.name}
                </div>
                <div className="text-[10px] text-zinc-500 truncate">
                  {user?.role} · {user?.discipline}
                </div>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-white/[0.04] flex items-center gap-1.5">
              <span className="text-[9px] tracking-overline text-zinc-600">
                ANCRID
              </span>
              <span className="text-[10px] font-mono text-[#007AFF] truncate">
                {user?.id ? `ANCR-${user.id.slice(0, 8).toUpperCase()}` : ""}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            data-testid="logout-btn"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03] transition-colors"
          >
            <LogOut size={14} /> Sign out
          </button>

          <div
            className="mt-4 pt-4 border-t border-white/[0.04] text-center opacity-40 hover:opacity-70 transition-opacity"
            data-testid="sidebar-powered-by"
          >
            <img
              src="https://customer-assets.emergentagent.com/job_creative-sync-14/artifacts/xhovgcty_ChatGPT%20Image%20Jul%204%2C%202026%2C%2007_42_00%20PM.png"
              alt="ANCR"
              className="h-4 w-auto object-contain mx-auto mb-1.5"
            />
            <div className="text-[8px] tracking-[0.25em] uppercase text-zinc-600">
              Discover · Develop · Deploy
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
