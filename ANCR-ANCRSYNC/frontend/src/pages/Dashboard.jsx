import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import api from "../lib/api";
import {
  FolderKanban,
  CalendarClock,
  BadgeCheck,
  Radio,
  ArrowUpRight,
  Sparkles,
  Bell,
  Activity,
} from "lucide-react";
import GlobalPulse from "../components/GlobalPulse";

const PageHeader = ({ title, subtitle, right }) => (
  <div className="sticky top-0 z-30 glass-strong border-b border-white/[0.06]">
    <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
      <div>
        <div className="text-[10px] tracking-overline text-zinc-500">
          {subtitle}
        </div>
        <div className="font-display text-2xl tracking-tight">{title}</div>
      </div>
      {right}
    </div>
  </div>
);

const KindDot = ({ kind }) => {
  const map = {
    project: "bg-[#007AFF]",
    session: "bg-[#F59E0B]",
    collaboration: "bg-emerald-400",
    studio: "bg-pink-400",
    mentorship: "bg-violet-300",
    achievement: "bg-zinc-100",
  };
  return (
    <span className={`w-1.5 h-1.5 rounded-full ${map[kind] || "bg-zinc-400"}`} />
  );
};

export default function Dashboard() {
  const nav = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    api
      .get("/dashboard")
      .then((r) => setData(r.data))
      .catch(() => toast.error("Failed to load dashboard"));
  }, []);

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500 text-xs font-mono tracking-overline">
        Loading…
      </div>
    );

  const stats = [
    {
      label: "Workspaces",
      value: data.workspaces_count,
      icon: FolderKanban,
      to: "/workspaces",
    },
    {
      label: "Sessions",
      value: data.sessions_count,
      icon: CalendarClock,
      to: "/sessions",
    },
    {
      label: "Studios",
      value: data.studios?.length || 0,
      icon: Radio,
      to: "/studios",
    },
    {
      label: "Passport",
      value: data.passport_count,
      icon: BadgeCheck,
      to: "/passport",
    },
  ];

  return (
    <div className="min-h-screen">
      <PageHeader
        subtitle="Command Center"
        title="Dashboard"
        right={
          <div className="flex items-center gap-2">
            <button
              onClick={() => nav("/ai")}
              data-testid="dashboard-ai-btn"
              className="text-sm bg-[#007AFF] hover:bg-blue-500 text-white px-4 py-2 rounded-full accent-glow flex items-center gap-2 transition-colors"
            >
              <Sparkles size={14} /> AI Assistant
            </button>
            <button className="w-9 h-9 rounded-full glass flex items-center justify-center text-zinc-300 hover:text-white">
              <Bell size={14} />
            </button>
          </div>
        }
      />

      <div className="max-w-6xl mx-auto px-8 py-8 space-y-6">
        {/* Global creative campus hero */}
        <GlobalPulse />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.button
              key={s.label}
              onClick={() => nav(s.to)}
              data-testid={`stat-${s.label.toLowerCase()}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-5 text-left hover:border-white/[0.14] transition-colors group"
            >
              <div className="flex items-center justify-between mb-4">
                <s.icon size={16} strokeWidth={1.6} className="text-zinc-400" />
                <ArrowUpRight
                  size={14}
                  className="text-zinc-600 group-hover:text-white transition-colors"
                />
              </div>
              <div className="font-display text-3xl tracking-tight">
                {s.value}
              </div>
              <div className="text-[11px] tracking-overline text-zinc-500 mt-1">
                {s.label}
              </div>
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Active workspaces */}
          <div className="glass rounded-2xl p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[10px] tracking-overline text-zinc-500">
                  Creative Workspaces
                </div>
                <div className="font-display text-lg">Active projects</div>
              </div>
              <button
                onClick={() => nav("/workspaces")}
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
                data-testid="view-all-workspaces"
              >
                View all <ArrowUpRight size={12} />
              </button>
            </div>
            {data.workspaces.length === 0 ? (
              <EmptyState
                text="No workspaces yet — create one to start collaborating."
                cta="Create workspace"
                onClick={() => nav("/workspaces")}
                testId="empty-workspaces-cta"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.workspaces.map((w) => (
                  <button
                    key={w.id}
                    data-testid={`workspace-card-${w.id}`}
                    onClick={() => nav(`/workspaces/${w.id}`)}
                    className="text-left border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.16] hover:bg-white/[0.02] transition-all"
                  >
                    <div className="text-[10px] tracking-overline text-zinc-500 mb-1">
                      {w.discipline}
                    </div>
                    <div className="font-display text-base text-zinc-50">
                      {w.name}
                    </div>
                    <div className="text-xs text-zinc-500 mt-2 line-clamp-2">
                      {w.description || "No description yet."}
                    </div>
                    <div className="flex items-center gap-3 mt-3 text-[11px] text-zinc-500">
                      <span>{w.tasks?.length || 0} tasks</span>
                      <span>·</span>
                      <span>
                        {w.milestones?.filter((m) => m.done).length || 0}/
                        {w.milestones?.length || 0} milestones
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Recent activity */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={14} className="text-zinc-400" />
              <div className="font-display text-lg">Recent Passport™</div>
            </div>
            {data.recent_activity.length === 0 ? (
              <div className="text-xs text-zinc-500">
                Your creative history will appear here.
              </div>
            ) : (
              <div className="space-y-3">
                {data.recent_activity.map((r) => (
                  <div key={r.id} className="flex items-start gap-3">
                    <div className="mt-2">
                      <KindDot kind={r.kind} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm text-zinc-100 truncate">
                        {r.title}
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono">
                        {new Date(r.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Studios grid */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[10px] tracking-overline text-zinc-500">
                Shared Studios
              </div>
              <div className="font-display text-lg">Drop in</div>
            </div>
            <button
              onClick={() => nav("/studios")}
              data-testid="view-all-studios"
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
            >
              Browse all <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.studios.slice(0, 4).map((s) => (
              <button
                key={s.id}
                data-testid={`studio-card-${s.id}`}
                onClick={() => nav(`/studios/${s.id}`)}
                className="text-left border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.16] hover:bg-white/[0.02] transition-all"
              >
                <div className="flex items-center gap-2 text-[10px] tracking-overline text-zinc-500 mb-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      s.activity === "Live"
                        ? "bg-[#007AFF] dot-pulse"
                        : "bg-zinc-500"
                    }`}
                  />
                  {s.activity}
                </div>
                <div className="font-display text-sm text-zinc-50 truncate">
                  {s.name}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">{s.kind}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const EmptyState = ({ text, cta, onClick, testId }) => (
  <div className="text-center py-10 border border-dashed border-white/[0.08] rounded-xl">
    <p className="text-sm text-zinc-500 mb-4">{text}</p>
    <button
      onClick={onClick}
      data-testid={testId}
      className="text-xs bg-zinc-50 text-zinc-950 hover:bg-white px-4 py-2 rounded-full font-medium"
    >
      {cta}
    </button>
  </div>
);
