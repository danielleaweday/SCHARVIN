import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { CalendarClock, MapPin, Mic, Music, Users, GraduationCap } from "lucide-react";

const ICONS = {
  performance: Mic,
  session: Music,
  circle: Users,
  workshop: GraduationCap,
  office_hours: CalendarClock,
};

function fmt(d) {
  const dt = new Date(d);
  return dt.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function UpcomingEvents() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api.get("/events/upcoming")
      .then(({ data }) => { if (alive) setItems(data.items || []); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  return (
    <section data-testid="upcoming-events" className="glass rounded-3xl p-6 sm:p-8 fade-up glass-hover">
      <h2 className="font-display text-2xl tracking-tight mb-4">Upcoming</h2>
      {loading ? (
        <div className="text-white/50 text-sm">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-white/50 text-sm">Nothing on the calendar just yet.</div>
      ) : (
        <ul className="space-y-3">
          {items.map((e) => {
            const Icon = ICONS[e.kind] || CalendarClock;
            return (
              <li key={e.id} data-testid={`event-${e.id}`} className="flex items-start gap-3 p-3 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 bg-white/[0.03] shrink-0">
                  <Icon className="w-4 h-4 text-white/75" strokeWidth={1.7} />
                </div>
                <div className="min-w-0">
                  <div className="font-sans text-sm text-white/90 truncate">{e.title}</div>
                  <div className="text-[11px] text-white/50 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>{fmt(e.starts_at)}</span>
                    {e.location && <><span className="text-white/25">·</span><span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{e.location}</span></>}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
