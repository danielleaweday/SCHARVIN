import { NavLink, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home, Radio, Star, TrendingUp, Users, Sparkles, ListMusic, Bookmark,
  Download, Clock, Heart, History, Search, Settings2, Compass, ChevronDown,
} from "lucide-react";
import { BRAND } from "@/lib/brand";
import { useAuth } from "@/context/AuthContext";

// Primary navigation as specified for ANCRMEDIA Home experience
const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/wav", label: "ANCRWAV™", icon: null, accent: "wav" },
  { to: "/view", label: "ANCRVIEW™", icon: null, accent: "view" },
  { to: "/live", label: "Live", icon: Radio, badge: "LIVE" },
  { to: "/featured", label: "Featured", icon: Star },
  { to: "/trending", label: "Trending", icon: TrendingUp },
  { to: "/creators", label: "Creators", icon: Users },
  { to: "/originals", label: "Originals", icon: Sparkles },
  { to: "/playlists", label: "Playlists", icon: ListMusic },
];

const LIBRARY = [
  { to: "/library", label: "Library", icon: Bookmark },
  { to: "/downloads", label: "Downloads", icon: Download },
  { to: "/watch-later", label: "Watch Later", icon: Clock },
  { to: "/liked", label: "Liked", icon: Heart },
  { to: "/history", label: "History", icon: History },
];

const UTIL = [
  { to: "/search", label: "Search", icon: Search },
  { to: "/settings", label: "Settings", icon: Settings2 },
];

function NavItem({ to, label, icon: Icon, badge, accent }) {
  const loc = useLocation();
  const active = to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(to);
  return (
    <NavLink
      to={to}
      data-testid={`nav-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
      className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg mx-1 my-[1px] transition-colors ${
        active ? "bg-white/[0.06] text-white" : "text-white/60 hover:text-white hover:bg-white/[0.03]"
      }`}
    >
      {active && (
        <motion.span
          layoutId="navActive"
          className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full"
          style={{
            background:
              accent === "wav"
                ? "linear-gradient(180deg, #0052FF, #7000FF)"
                : accent === "view"
                ? "linear-gradient(180deg, #FF8A00, #FF3B77)"
                : "linear-gradient(180deg, #0052FF, #7000FF, #FF6B00)",
          }}
        />
      )}
      {Icon ? (
        <Icon size={16} strokeWidth={1.6} className={active ? "text-white" : "text-white/60 group-hover:text-white"} />
      ) : accent === "wav" ? (
        <span className="w-4 h-4 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0052FF, #7000FF)" }}>
          <span className="text-[8px] font-black text-white">W</span>
        </span>
      ) : accent === "view" ? (
        <span className="w-4 h-4 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FF8A00, #FF3B77)" }}>
          <span className="text-[8px] font-black text-white">V</span>
        </span>
      ) : null}
      <span className="text-[13px] font-sans-alt tracking-tight">{label}</span>
      {badge && (
        <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/90 text-white tracking-wider">{badge}</span>
      )}
    </NavLink>
  );
}

function Group({ title, items }) {
  return (
    <div className="mb-5">
      <div className="px-3 pb-2 text-[10px] tracking-[0.22em] uppercase text-white/35 font-sans-alt font-medium">
        {title}
      </div>
      <div className="flex flex-col">{items.map((it) => <NavItem key={it.to} {...it} />)}</div>
    </div>
  );
}

export default function ANCRMediaNav() {
  const { user } = useAuth();
  return (
    <nav data-testid="ancrmedia-nav" className="h-full overflow-y-auto py-4 pr-1 flex flex-col">
      <Link to="/" data-testid="sidebar-ancrmedia-logo" className="px-3 pt-1 pb-4 flex items-center gap-2">
        <img src={BRAND.ANCRMEDIA} alt="ANCRMEDIA" className="h-7 w-auto object-contain" />
      </Link>
      <Group title="Navigate" items={NAV} />
      <Group title="Your Library" items={LIBRARY} />
      <Group title="Utility" items={UTIL} />
      {user && (
        <div className="mt-auto mx-3 mb-4 flex items-center gap-3 p-2.5 rounded-xl glass" data-testid="sidebar-user">
          {user.avatar ? (
            <img src={user.avatar} className="w-9 h-9 rounded-full object-cover border border-white/10" alt="" />
          ) : (
            <div className="w-9 h-9 rounded-full flex items-center justify-center gradient-progress font-display text-sm">
              {user.name?.[0]}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-[12.5px] font-display truncate leading-tight">{user.name}</div>
            <div className="text-[10px] uppercase tracking-widest text-white/45 leading-tight">CCDP {user.role}</div>
          </div>
        </div>
      )}
    </nav>
  );
}
