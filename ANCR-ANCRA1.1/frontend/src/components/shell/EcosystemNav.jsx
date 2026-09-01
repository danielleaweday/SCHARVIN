import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home, GraduationCap, Waves, Users, Zap, Music, Coins, Rocket,
  Play, Radio, Fingerprint, Calendar, Library, Settings,
  Sparkles, Milestone, Award, MessageSquare, ClipboardList, Layers,
  Palette, PenLine, ListChecks, Wand2, Trophy, FolderOpen, UserCheck,
  BookOpen, ExternalLink,
} from "lucide-react";
import AncraLogo from "@/components/brand/AncraLogo";
import AncrLogo from "@/components/brand/AncrLogo";
import { useRole } from "@/context/RoleContext";
import { openModule } from "@/lib/modules";

const ECOSYSTEM = [
  { label: "Home",        icon: Home,          to: "/welcome",    sym: "" },
  { label: "ANCRA",       icon: GraduationCap, to: "/dashboard",  sym: "™" },
  { label: "ANCRLAB",     icon: Waves,         to: "/hub/ANCRLAB",   sym: "™" },
  { label: "ANCRSync",    icon: Users,         to: "/hub/ANCRSync",  sym: "™" },
  { label: "COHEIR",      icon: Zap,           to: "/hub/COHEIR",    sym: "™" },
  { label: "INHEIRA",     icon: Music,         to: "/hub/INHEIRA",   sym: "™" },
  { label: "Vaulta",      icon: Coins,         to: "/hub/Vaulta",    sym: "™" },
  { label: "ANCRLaunch",  icon: Rocket,        to: "/hub/ANCRLaunch", sym: "™" },
  { label: "ANCRVIEW",    icon: Play,          to: "/hub/ANCRVIEW", sym: "™" },
  { label: "ANCRWAV",     icon: Radio,         to: "/hub/ANCRWAV",  sym: "™" },
  { label: "ANCRID",      icon: Fingerprint,   to: "/hub/ANCRID",   sym: "™" },
];

const STUDENT_WORKSPACE = [
  { label: "Learning Journey", icon: Milestone,    to: "/journey" },
  { label: "Progress",         icon: Trophy,       to: "/progress" },
  { label: "Assignments",      icon: ClipboardList,to: "/assignments" },
  { label: "Projects",         icon: FolderOpen,   to: "/projects" },
  { label: "Peer Reviews",     icon: UserCheck,    to: "/peer-reviews" },
  { label: "30 Song™",         icon: Music,        to: "/thirty-song" },
  { label: "Capstones",        icon: Award,        to: "/capstones" },
  { label: "Portfolio Builder",icon: Palette,      to: "/portfolio-builder" },
  { label: "Teams",            icon: Users,        to: "/teams" },
  { label: "Messages",         icon: MessageSquare,to: "/messages" },
  { label: "AIAH Companion",   icon: Sparkles,     to: "/companion" },
  { label: "Graduation",       icon: GraduationCap,to: "/graduation" },
  { label: "Creator Passport", icon: Fingerprint,  to: "/passport" },
  { label: "Achievements",     icon: Award,        to: "/achievements" },
];

const FACULTY_WORKSPACE = [
  { label: "Command Center",       icon: GraduationCap, to: "/faculty" },
  { label: "Students",             icon: Users,         to: "/faculty/students" },
  { label: "Cohorts",              icon: Users,         to: "/faculty/cohorts" },
  { label: "Creative Teams",       icon: Users,         to: "/faculty/teams" },
  { label: "Approvals",            icon: ListChecks,    to: "/faculty/approvals" },
  { label: "Reviews",              icon: UserCheck,     to: "/faculty/reviews" },
  { label: "Grading",              icon: PenLine,       to: "/faculty/grading" },
  { label: "Rubrics",              icon: ClipboardList, to: "/faculty/rubrics" },
  { label: "Experience Builder",   icon: Layers,        to: "/faculty/experience-builder" },
  { label: "Curriculum Builder",   icon: Palette,       to: "/faculty/curriculum" },
  { label: "Lesson Builder",       icon: BookOpen,      to: "/faculty/lesson-builder" },
  { label: "Assignment Builder",   icon: PenLine,       to: "/faculty/assignment-builder" },
  { label: "AI Course Builder",    icon: Wand2,         to: "/faculty/ai-course-builder" },
  { label: "Analytics",            icon: Trophy,        to: "/faculty/analytics" },
];

const UTILS = [
  { label: "Calendar", icon: Calendar, to: "/calendar" },
  { label: "Library",  icon: Library,  to: "/library" },
  { label: "Settings", icon: Settings, to: "/settings" },
];

function NavItem({ item, tone = "default" }) {
  const loc = useLocation();
  const Icon = item.icon;
  const isActive =
    (item.to === "/dashboard" && (loc.pathname === "/" || loc.pathname === "/dashboard")) ||
    (item.to === "/faculty" && loc.pathname === "/faculty") ||
    (item.to && item.to !== "/dashboard" && item.to !== "/faculty" && loc.pathname.startsWith(item.to) && item.to !== "/welcome");

  // Ecosystem module that opens externally (not ANCRA)
  const externalModule = item.moduleKey && item.moduleKey !== "ANCRA";

  if (externalModule) {
    return (
      <button
        onClick={() => openModule(item.moduleKey)}
        data-testid={`nav-${item.label.toLowerCase()}-link`}
        className="group relative flex items-center gap-3 rounded-lg px-3 py-1.5 text-[12.5px] text-ancr-dim hover:text-white hover:bg-white/[0.02] transition-all duration-200"
      >
        <Icon size={14} strokeWidth={1.5} />
        <span className="font-sans flex-1 text-left truncate">
          {item.label}
          {item.sym && <span className="ml-0.5 text-[9px] align-top text-ancr-mute">{item.sym}</span>}
        </span>
        <ExternalLink size={10} className="text-ancr-mute opacity-0 group-hover:opacity-100 transition" />
      </button>
    );
  }

  return (
    <NavLink
      to={item.to}
      data-testid={`nav-${item.label.toLowerCase().replace(/[^a-z0-9]/g, "-")}-link`}
      className={`group relative flex items-center gap-3 rounded-lg px-3 py-1.5 text-[12.5px] transition-all duration-200 ${
        isActive
          ? "bg-white/[0.05] text-white"
          : "text-ancr-dim hover:text-white hover:bg-white/[0.02]"
      }`}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r bg-[var(--ancra-accent)] shadow-[0_0_12px_var(--ancra-accent-glow)]" />
      )}
      <Icon size={14} strokeWidth={1.5} className={isActive ? "text-white" : ""} />
      <span className="font-sans truncate">
        {item.label}
        {item.sym && <span className="ml-0.5 text-[9px] align-top text-ancr-mute">{item.sym}</span>}
      </span>
    </NavLink>
  );
}

export default function EcosystemNav() {
  const { role } = useRole();
  const workspace = role === "faculty" ? FACULTY_WORKSPACE : STUDENT_WORKSPACE;
  return (
    <aside
      data-testid="ecosystem-nav"
      className="fixed left-0 top-0 z-40 hidden h-screen w-[248px] flex-col border-r border-white/[0.06] bg-black/70 backdrop-blur-2xl md:flex"
    >
      {/* Brand */}
      <div className="px-6 pb-5 pt-7">
        <div className="ancr-label mb-3">ANCR · Ecosystem OS</div>
        <div className="h-10 flex items-center">
          <AncraLogo />
        </div>
        <div className="mt-2 font-mono text-[9px] tracking-[0.22em] uppercase text-ancr-mute">
          v2.0 · Learning OS · CCDP
        </div>
      </div>

      {/* Scrollable rest */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="ancr-label px-3 pb-1.5">Ecosystem</div>
        <nav className="flex flex-col">
          {ECOSYSTEM.map((i) => <NavItem key={i.label} item={i} />)}
        </nav>

        <div className="ancr-label mt-5 px-3 pb-1.5">{role === "faculty" ? "Command Center" : "Studio"}</div>
        <nav className="flex flex-col">
          {workspace.map((i) => <NavItem key={i.label} item={i} />)}
        </nav>

        <div className="ancr-label mt-5 px-3 pb-1.5">Utility</div>
        <nav className="flex flex-col">
          {UTILS.map((i) => <NavItem key={i.label} item={i} />)}
        </nav>
      </div>

      {/* Footer — Part of the ANCR Ecosystem */}
      <div className="border-t border-white/[0.06] p-5">
        <div className="ancr-label mb-2 text-[9px]">Part of the</div>
        <div className="h-6 mb-2">
          <AncrLogo className="h-full" />
        </div>
        <div className="font-mono text-[8.5px] tracking-[0.22em] uppercase text-ancr-mute leading-relaxed">
          Artist Discovery<br />& Development Network
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
          <span className="font-mono text-[10px] tracking-wider text-ancr-dim">All systems online</span>
        </div>
      </div>
    </aside>
  );
}
