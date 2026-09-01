import { useEffect, useState } from "react";
import { BadgeCheck, Layers, Radio, CalendarClock, Users, Award } from "lucide-react";
import api from "../lib/api";

const KIND_META = {
  project: { icon: Layers, label: "Project", color: "#007AFF" },
  studio: { icon: Radio, label: "Studio", color: "#EC4899" },
  session: { icon: CalendarClock, label: "Session", color: "#F59E0B" },
  collaboration: { icon: Users, label: "Collaboration", color: "#10B981" },
  mentorship: { icon: BadgeCheck, label: "Mentorship", color: "#8B5CF6" },
  achievement: { icon: Award, label: "Achievement", color: "#FAFAFA" },
};

const StatCard = ({ label, value }) => (
  <div className="glass rounded-2xl p-5">
    <div className="font-display text-3xl">{value}</div>
    <div className="text-[10px] tracking-overline text-zinc-500 mt-1">
      {label}
    </div>
  </div>
);

export default function CreativePassport() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/passport").then((r) => setData(r.data));
  }, []);

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500 text-xs font-mono tracking-overline">
        Loading passport…
      </div>
    );

  const { user, entries, stats } = data;

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 glass-strong border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-overline text-zinc-500">
              Creative Passport™
            </div>
            <div className="font-display text-2xl tracking-tight">
              Your verified history
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] tracking-overline text-[#F59E0B]">
            <BadgeCheck size={14} /> Verified ledger
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8 space-y-6">
        {/* Profile */}
        <div className="glass rounded-3xl p-8 flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#F59E0B]/10 blur-3xl" />
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center font-display text-3xl font-medium relative"
            style={{ background: user.avatar_color, color: "#000" }}
          >
            {user.name[0]?.toUpperCase()}
          </div>
          <div className="relative flex-1 min-w-0">
            <div className="font-display text-3xl tracking-tight">
              {user.name}
            </div>
            <div className="text-sm text-zinc-400 mt-1">
              {user.role} · {user.discipline} · {user.country}
            </div>
            <div className="text-[11px] font-mono text-zinc-500 mt-1">
              Since {new Date(user.created_at).toLocaleDateString()}
            </div>
          </div>
          <div className="relative text-right">
            <div className="text-[10px] tracking-overline text-zinc-500">
              Passport ID
            </div>
            <div className="font-mono text-sm text-[#F59E0B] break-all max-w-[220px]">
              ANCR-{user.id.slice(0, 8).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <StatCard label="Collaborations" value={stats.collaborations} />
          <StatCard label="Projects" value={stats.projects} />
          <StatCard label="Studios" value={stats.studios} />
          <StatCard label="Sessions" value={stats.sessions} />
          <StatCard label="Mentorship" value={stats.mentorship} />
          <StatCard label="Achievements" value={stats.achievements} />
        </div>

        {/* Timeline */}
        <div className="glass rounded-2xl p-6">
          <div className="font-display text-lg mb-6">Timeline</div>
          {entries.length === 0 ? (
            <div className="text-xs text-zinc-500 text-center py-8">
              No entries yet. Start collaborating.
            </div>
          ) : (
            <div className="relative pl-6">
              <div className="absolute top-0 bottom-0 left-2 w-[1px] bg-gradient-to-b from-[#007AFF]/60 via-white/10 to-transparent" />
              <div className="space-y-6">
                {entries.map((e) => {
                  const meta = KIND_META[e.kind] || KIND_META.achievement;
                  const Icon = meta.icon;
                  return (
                    <div
                      key={e.id}
                      className="relative"
                      data-testid={`passport-entry-${e.id}`}
                    >
                      <div
                        className="absolute -left-[18px] top-1 w-4 h-4 rounded-full flex items-center justify-center border border-black"
                        style={{ background: meta.color }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-black" />
                      </div>
                      <div className="flex items-start gap-3">
                        <Icon
                          size={16}
                          strokeWidth={1.6}
                          className="text-zinc-400 mt-0.5"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="font-display text-base text-zinc-50">
                              {e.title}
                            </div>
                            {e.verified && (
                              <span className="inline-flex items-center gap-1 text-[10px] tracking-overline text-[#F59E0B]">
                                <BadgeCheck size={11} /> Verified
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-zinc-500 mt-0.5">
                            {e.detail}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-600 mt-1">
                            {new Date(e.created_at).toLocaleString()} ·{" "}
                            {meta.label} · {e.id.slice(0, 8)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
