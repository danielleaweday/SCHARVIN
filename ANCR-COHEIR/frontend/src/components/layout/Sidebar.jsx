import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home, Sparkles, FlaskConical, Users, Compass, Rocket, Fingerprint,
  BrainCircuit, Calendar, MessageSquare, Library as LibraryIcon,
  Settings as Cog, GraduationCap, Building2, Briefcase, LogOut,
  Upload, Plug, BarChart3, Share2, Users2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import CCDPLogo from "@/components/coheir/CCDPLogo";
import CoheirLogo from "@/components/coheir/CoheirLogo";
import AncrBadge from "@/components/coheir/AncrBadge";

const primaryNav = [
  { to: "/dashboard", label: "Home", icon: Home, testid: "nav-home-link" },
  { to: "/directory", label: "Industry Directory", icon: Compass, testid: "nav-directory-link" },
  { to: "/students", label: "Student Supervision", icon: GraduationCap, testid: "nav-students-link" },
  { to: "/alumni", label: "Alumni Network", icon: Users2, testid: "nav-alumni-link" },
  { to: "/sessions", label: "Industry Sessions", icon: Sparkles, testid: "nav-sessions-link" },
  { to: "/cohorts", label: "Cohorts", icon: Users, testid: "nav-cohorts-link" },
  { to: "/reviews", label: "Reviews", icon: FlaskConical, testid: "nav-reviews-link" },
  { to: "/opportunities", label: "Opportunities", icon: Briefcase, testid: "nav-opportunities-link" },
  { to: "/recommendations", label: "Recommendations", icon: Rocket, testid: "nav-recommendations-link" },
  { to: "/teams", label: "Creative Teams", icon: Users, testid: "nav-teams-link" },
  { to: "/portfolio", label: "Portfolio", icon: Upload, testid: "nav-portfolio-link" },
  { to: "/share-kits", label: "Share Kits", icon: Share2, testid: "nav-sharekits-link" },
];

const ecosystemNav = [
  { to: "/calendar", label: "Calendar", icon: Calendar, testid: "nav-calendar-link" },
  { to: "/messages", label: "Conversations", icon: MessageSquare, testid: "nav-messages-link" },
  { to: "/library", label: "Resource Library", icon: LibraryIcon, testid: "nav-library-link" },
  { to: "/aiah", label: "AIAH", icon: BrainCircuit, testid: "nav-aiah-link" },
  { to: "/ancrid", label: "ANCRID™", icon: Fingerprint, testid: "nav-ancrid-link" },
  { to: "/analytics", label: "Analytics", icon: BarChart3, testid: "nav-analytics-link" },
  { to: "/institution", label: "Institution", icon: Building2, testid: "nav-institution-link" },
  { to: "/employer", label: "Employer Portal", icon: Briefcase, testid: "nav-employer-link" },
  { to: "/integrations", label: "Integrations", icon: Plug, testid: "nav-integrations-link" },
  { to: "/settings", label: "Settings", icon: Cog, testid: "nav-settings-link" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const item = ({ isActive }) =>
    `group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${
      isActive
        ? "bg-white/[0.06] text-white border-l-2 border-[#00F0FF]"
        : "text-zinc-500 hover:text-white hover:bg-white/[0.03] border-l-2 border-transparent"
    }`;

  return (
    <aside data-testid="app-sidebar"
      className="fixed top-0 left-0 h-screen w-[260px] bg-black border-r border-white/[0.06] z-40 flex flex-col">
      <div className="px-4 pt-5 pb-4">
        <button
          data-testid="sidebar-logo-btn"
          onClick={() => navigate("/dashboard")}
          className="block w-full">
          <img
            src="https://customer-assets.emergentagent.com/job_creator-launch-20/artifacts/rtbzresi_414ED926-16C8-4B01-AA73-F39BF76E4088.PNG"
            alt="COHEIR™"
            className="w-full h-auto max-w-[220px] mx-auto"
          />
        </button>
        <div className="mt-3 space-y-2">
          <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-zinc-400 text-center">
            Industry Leadership Network
          </div>
          <div className="h-px bg-white/[0.08]" />
          <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-zinc-500 text-center">
            CCDP Program
          </div>
          <div className="h-px bg-white/[0.08]" />
          <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-zinc-500 text-center">
            Part of the <span className="text-white">ANCR Ecosystem</span>
          </div>
        </div>
      </div>

      <nav className="px-3 pt-2 pb-2 space-y-0.5 overflow-y-auto flex-1">
        <div className="px-3 pt-2 pb-1 font-mono text-[10px] tracking-widest text-zinc-600 uppercase">
          COHEIR
        </div>
        {primaryNav.map((n) => (
          <NavLink key={n.to} to={n.to} data-testid={n.testid} className={item}>
            <n.icon className="w-4 h-4" strokeWidth={1.7} />
            <span className="text-sm font-medium">{n.label}</span>
          </NavLink>
        ))}

        <div className="px-3 pt-4 pb-1 font-mono text-[10px] tracking-widest text-zinc-600 uppercase">
          Ecosystem
        </div>
        {ecosystemNav.map((n) => (
          <NavLink key={n.to} to={n.to} data-testid={n.testid} className={item}>
            <n.icon className="w-4 h-4" strokeWidth={1.7} />
            <span className="text-sm font-medium">{n.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-panel p-4 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-cohesion opacity-40 blur-2xl" />
          <div className="font-mono text-[10px] tracking-widest text-zinc-400 uppercase">Lifelong Network</div>
          <div className="wordmark text-white text-base leading-tight mt-1">
            One identity. One ecosystem. A career-long network.
          </div>
          <button
            data-testid="sidebar-cta-find-mentor"
            onClick={() => navigate("/directory")}
            className="btn-primary mt-3 text-xs px-4 py-2">
            Find a Mentor
          </button>
        </motion.div>
        <div className="mt-3 flex justify-center" data-testid="sidebar-ancr-badge">
          <AncrBadge variant="pill" />
        </div>
        {user && (
          <button
            data-testid="sidebar-logout-btn"
            onClick={async () => { await logout(); navigate("/"); }}
            className="mt-3 w-full flex items-center gap-2 text-xs text-zinc-500 hover:text-white px-3 py-2 rounded-lg hover:bg-white/[0.03]">
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        )}
      </div>
    </aside>
  );
}
