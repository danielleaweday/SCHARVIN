import React from "react";
import useSWR from "swr";
import { get } from "@/lib/api";
import { Section, Chip } from "@/components/common/Primitives";

export default function CalendarPage() {
  const { data } = useSWR("/student/calendar", get);
  const events = data?.events || [];

  // group by date
  const grouped = events.reduce((acc, e) => {
    (acc[e.date] = acc[e.date] || []).push(e);
    return acc;
  }, {});
  const dates = Object.keys(grouped).sort();

  return (
    <div className="px-6 md:px-10 py-10 ancr-reveal">
      <Section
        eyebrow="Creative Calendar"
        title={<span><em className="italic text-ancr-dim">Your</em> next two weeks</span>}
      />
      <div className="mt-10 space-y-8">
        {dates.map((d) => {
          const date = new Date(d);
          const isToday = d === new Date().toISOString().slice(0, 10);
          return (
            <div key={d} className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="lg:col-span-2">
                <div className={`ancr-label ${isToday ? "text-[var(--ancra-accent)]" : ""}`}>{isToday ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" })}</div>
                <div className="mt-1 font-serif text-4xl leading-none tracking-tight">{date.getDate()}</div>
                <div className="mt-1 font-mono text-[10px] text-ancr-mute uppercase tracking-wider">
                  {date.toLocaleDateString("en-US", { month: "short" })}
                </div>
              </div>
              <div className="lg:col-span-10 space-y-2">
                {grouped[d].map((e) => (
                  <div key={e.id} className="flex items-center gap-4 rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 transition hover:border-white/15">
                    <div className="w-16 font-mono text-[11px] leading-tight">
                      <div>{e.start}</div>
                      <div className="text-ancr-mute text-[9px]">{e.end}</div>
                    </div>
                    <div className="h-8 w-px bg-white/10" />
                    <div className="flex-1 text-[14px]">{e.title}</div>
                    <Chip>{e.module}</Chip>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
