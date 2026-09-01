import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, MessageSquare, ChevronDown, BadgeCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export default function TopBar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    api.get("/notifications").then(({ data }) => {
      setNotifCount(data.filter((n) => !n.read).length);
    }).catch(() => {});
  }, []);

  return (
    <header data-testid="app-topbar"
      className="fixed top-0 right-0 left-[260px] h-[72px] z-30 header-glass flex items-center px-6 gap-4">
      <div className="flex-1 max-w-2xl">
        <label className="relative block">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"><Search className="w-4 h-4" /></span>
          <input
            data-testid="global-search-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && q.trim()) navigate(`/directory?q=${encodeURIComponent(q.trim())}`); }}
            placeholder="Search COHEIR…"
            className="w-full bg-white/[0.04] border border-white/[0.06] focus:border-white/[0.18] focus:bg-white/[0.06] transition-colors rounded-full pl-11 pr-16 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[10px] text-zinc-500 border border-white/10 px-1.5 py-0.5 rounded">⌘ K</span>
        </label>
      </div>
      <button data-testid="topbar-notif-btn" className="relative w-10 h-10 rounded-full grid place-items-center bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06]">
        <Bell className="w-4 h-4 text-zinc-400" />
        {notifCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F97316] text-[10px] font-bold grid place-items-center text-black">{notifCount}</span>
        )}
      </button>
      <button data-testid="topbar-msg-btn" onClick={() => navigate("/messages")} className="relative w-10 h-10 rounded-full grid place-items-center bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06]">
        <MessageSquare className="w-4 h-4 text-zinc-400" />
      </button>
      {user && (
        <button data-testid="topbar-profile-btn"
          onClick={() => navigate(`/profile/${user.user_id}`)}
          className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] transition-colors">
          <div className="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-white/10">
            {user.picture ? <img src={user.picture} alt={user.name} className="w-full h-full object-cover" /> :
              <div className="w-full h-full bg-gradient-cohesion" />}
          </div>
          <div className="text-left leading-tight">
            <div className="text-white text-sm font-semibold flex items-center gap-1">
              {user.name}
              {user.verified && <BadgeCheck className="w-3.5 h-3.5 text-[#00F0FF] verified-dot" />}
            </div>
            <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
              {user.role?.replace("_", " ")}
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-zinc-500" />
        </button>
      )}
    </header>
  );
}
