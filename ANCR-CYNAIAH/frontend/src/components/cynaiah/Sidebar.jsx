import { NavLink, useNavigate } from "react-router-dom";
import { TID } from "@/constants/testIds";
import { CynaiahMark, PoweredByAncr } from "@/components/cynaiah/Brand";
import { useAuth } from "@/context/AuthContext";
import {
    Home,
    GraduationCap,
    Plus,
    Film,
    BookOpen,
    Sparkles,
    ClapperboardIcon,
    Scissors,
    AudioWaveform,
    Layers,
    Users,
    MessageSquareText,
    ShieldCheck,
    Sparkle,
    Briefcase,
    UserSquare2,
    Calendar as CalendarIcon,
    Mail,
    Settings as SettingsIcon,
    LogOut,
    UserCog,
} from "lucide-react";

const groups = [
    {
        label: "Studio",
        items: [
            { to: "/", label: "Home", icon: Home, tid: TID.navHome, end: true },
            { to: "/cyna", label: "Cyna", icon: Sparkles, tid: "nav-cyna" },
            { to: "/learn", label: "Learn", icon: GraduationCap, tid: TID.navLearn },
            { to: "/create", label: "Create", icon: Plus, tid: TID.navCreate },
            { to: "/projects", label: "Projects", icon: Film, tid: TID.navProjects },
        ],
    },
    {
        label: "Labs",
        items: [
            { to: "/story-lab", label: "Story Lab", icon: BookOpen, tid: TID.navStoryLab },
            { to: "/ai-visual-lab", label: "AI Visual Lab", icon: Sparkles, tid: TID.navAIVisualLab },
            { to: "/production-studio", label: "Production Studio", icon: ClapperboardIcon, tid: TID.navProductionStudio },
            { to: "/edit-finish", label: "Edit & Finish", icon: Scissors, tid: TID.navEditFinish },
            { to: "/sync-studio", label: "Sync Studio", icon: AudioWaveform, tid: TID.navSyncStudio },
        ],
    },
    {
        label: "Assets & Sync",
        items: [
            { to: "/assets", label: "Assets", icon: Layers, tid: TID.navAssets },
            { to: "/collaborators", label: "Collaborators", icon: Users, tid: TID.navCollaborators },
            { to: "/reviews", label: "Reviews", icon: MessageSquareText, tid: TID.navReviews },
            { to: "/rights-credits", label: "Rights & Credits", icon: ShieldCheck, tid: TID.navRightsCredits },
        ],
    },
    {
        label: "Network",
        items: [
            { to: "/showcase", label: "Showcase", icon: Sparkle, tid: TID.navShowcase },
            { to: "/opportunities", label: "Opportunities", icon: Briefcase, tid: TID.navOpportunities },
            { to: "/portfolio", label: "Portfolio", icon: UserSquare2, tid: TID.navPortfolio },
        ],
    },
    {
        label: "Platform",
        items: [
            { to: "/calendar", label: "Calendar", icon: CalendarIcon, tid: TID.navCalendar },
            { to: "/messages", label: "Messages", icon: Mail, tid: TID.navMessages },
            { to: "/settings", label: "Settings", icon: SettingsIcon, tid: TID.navSettings },
        ],
    },
];

const NavItem = ({ to, label, icon: Icon, tid, end }) => (
    <NavLink
        to={to}
        end={end}
        data-testid={tid}
        className={({ isActive }) =>
            [
                "group flex items-center gap-3 px-4 py-2 rounded-md text-[13px] font-medium",
                "transition-colors duration-200",
                isActive
                    ? "text-white bg-gradient-to-r from-cynaiah-violet/25 via-cynaiah-violet/5 to-transparent border-l-2 border-cynaiah-cyan"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04] border-l-2 border-transparent",
            ].join(" ")
        }
    >
        <Icon size={16} strokeWidth={1.6} className="opacity-90" />
        <span className="tracking-wide">{label}</span>
    </NavLink>
);

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const isFaculty = ["faculty", "admin", "mentor"].includes(user?.role);
    const displayGroups = isFaculty
        ? [
              ...groups.slice(0, 1),
              {
                  label: "Faculty",
                  items: [
                      { to: "/faculty", label: "Faculty Dashboard", icon: UserCog, tid: "nav-faculty-dashboard" },
                      { to: "/reviews", label: "Reviews", icon: MessageSquareText, tid: TID.navReviews },
                  ],
              },
              ...groups.slice(1),
          ]
        : groups;

    return (
        <aside
            data-testid={TID.sidebar}
            className="w-[264px] shrink-0 h-screen border-r border-white/[0.05] bg-[#050506] flex flex-col overflow-hidden"
        >
            <div className="px-5 pt-6 pb-5 border-b border-white/[0.05]">
                <CynaiahMark size={38} />
            </div>

            {/* Quick Create + Continue */}
            <div className="px-4 py-4 space-y-2 border-b border-white/[0.05]">
                <button
                    data-testid={TID.quickCreateBtn}
                    onClick={() => navigate("/create")}
                    className="cyn-btn-primary w-full rounded-md px-4 py-2.5 text-sm font-medium tracking-wide flex items-center justify-center gap-2"
                >
                    <Plus size={15} strokeWidth={2} /> Quick Create
                </button>
                <button
                    data-testid={TID.continueProjectBtn}
                    onClick={() => navigate("/projects")}
                    className="cyn-btn-ghost w-full rounded-md px-4 py-2.5 text-sm font-medium tracking-wide"
                >
                    Continue Project
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto custom-scrollbar px-2 py-4 space-y-6">
                {displayGroups.map((g) => (
                    <div key={g.label}>
                        <div className="px-4 pb-2 text-[10px] font-medium tracking-[0.24em] uppercase text-white/35">
                            {g.label}
                        </div>
                        <div className="space-y-0.5">
                            {g.items.map((it) => (
                                <NavItem key={it.to} {...it} />
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* User + ANCR */}
            <div className="border-t border-white/[0.05] p-4 space-y-3">
                <div className="flex items-center gap-3">
                    <img
                        src={
                            user?.avatar_url ||
                            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                        }
                        alt=""
                        className="w-9 h-9 rounded-full object-cover border border-white/10"
                    />
                    <div className="flex-1 min-w-0">
                        <div className="text-sm text-white truncate">{user?.name || "—"}</div>
                        <div className="text-[10px] uppercase tracking-[0.18em] text-white/40 truncate">
                            {user?.role?.replace("_", " ") || ""}
                        </div>
                    </div>
                    <button
                        data-testid={TID.logoutBtn}
                        onClick={logout}
                        title="Sign out"
                        className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <LogOut size={15} />
                    </button>
                </div>

                <PoweredByAncr className="justify-center pt-1" />
            </div>
        </aside>
    );
}
