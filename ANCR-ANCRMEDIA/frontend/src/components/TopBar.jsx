import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function TopBar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [menu, setMenu] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header
      data-testid="topbar"
      className="sticky top-0 z-30 h-16 flex items-center px-6 border-b border-white/[0.05] bg-[#0A0A0A]/70 backdrop-blur-2xl"
    >
      <Link to="/" className="flex items-center gap-2 mr-6" data-testid="topbar-brand">
        <div className="font-display text-[19px] font-black tracking-tight leading-none">
          <span className="text-white">ANCR</span>
          <span className="gradient-text">MEDIA</span>
          <span className="text-white/40 text-[13px] ml-1 align-top">™</span>
        </div>
        <div className="hidden md:block text-[10px] tracking-[0.28em] text-white/40 uppercase pl-3 border-l border-white/10 ml-1">
          Global Creative Network · CCDP
        </div>
      </Link>

      <form onSubmit={submit} className="flex-1 max-w-2xl mx-auto relative" data-testid="topbar-search-form">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" strokeWidth={1.6} />
        <input
          data-testid="topbar-search-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search creators, songs, videos, institutions…"
          className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] focus:border-white/25 focus:bg-white/[0.06] text-sm font-sans-alt placeholder:text-white/35 transition-colors"
        />
      </form>

      <div className="flex items-center gap-2 ml-6">
        <button data-testid="notifications-btn" className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/[0.06] text-white/70 transition-colors">
          <Bell size={16} strokeWidth={1.6} />
        </button>
        {user ? (
          <div className="relative">
            <button
              data-testid="user-menu-btn"
              onClick={() => setMenu(!menu)}
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full glass glass-hover"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden bg-white/10">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UserIcon size={14} className="text-white/70" />
                  </div>
                )}
              </div>
              <div className="text-[12px] font-sans-alt hidden sm:block">
                <div className="leading-none">{user.name}</div>
                <div className="text-[10px] text-white/40 leading-none mt-0.5 tracking-wide uppercase">{user.role}</div>
              </div>
            </button>
            {menu && (
              <div className="absolute right-0 top-full mt-2 w-56 glass-strong rounded-xl overflow-hidden">
                <Link
                  to="/library"
                  data-testid="menu-library"
                  className="block px-4 py-2.5 text-sm hover:bg-white/[0.06] font-sans-alt"
                  onClick={() => setMenu(false)}
                >
                  My Library
                </Link>
                <Link
                  to="/analytics"
                  data-testid="menu-analytics"
                  className="block px-4 py-2.5 text-sm hover:bg-white/[0.06] font-sans-alt"
                  onClick={() => setMenu(false)}
                >
                  Analytics
                </Link>
                <Link
                  to="/settings"
                  data-testid="menu-settings"
                  className="block px-4 py-2.5 text-sm hover:bg-white/[0.06] font-sans-alt"
                  onClick={() => setMenu(false)}
                >
                  Settings
                </Link>
                <div className="h-px bg-white/[0.06]" />
                <button
                  data-testid="menu-logout"
                  onClick={async () => { await logout(); setMenu(false); nav("/login"); }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/[0.06] flex items-center gap-2 text-white/80 font-sans-alt"
                >
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" data-testid="topbar-signin" className="text-sm font-sans-alt px-4 py-2 rounded-full glass glass-hover">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
