import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { RoleChip } from "@/components/coheir/MentorCard";
import { CalendarDays, Clock, MapPin } from "lucide-react";

export default function CalendarPage() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/calendar").then(({ data }) => setItems(data)); }, []);

  const byDate = items.reduce((acc, e) => {
    const key = new Date(e.start).toDateString();
    (acc[key] = acc[key] || []).push(e);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Calendar</div>
        <h1 className="wordmark text-4xl md:text-5xl text-white">Office hours. Studio sessions. Portfolio reviews.</h1>
      </header>
      <div className="space-y-6">
        {Object.entries(byDate).map(([day, events]) => (
          <div key={day} className="glass-panel p-6">
            <div className="wordmark text-lg text-white flex items-center gap-2"><CalendarDays className="w-4 h-4 text-[#00F0FF]" /> {day}</div>
            <div className="mt-4 space-y-2">
              {events.map((e) => (
                <div key={e.id} className="glass-interactive p-3 flex items-start gap-3">
                  <div className="font-mono text-xs text-white bg-white/[0.05] border border-white/[0.08] rounded-md px-2 py-1 min-w-[80px] text-center">
                    {new Date(e.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-semibold">{e.title}</div>
                    <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {e.location}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {Math.round((new Date(e.end) - new Date(e.start)) / 60000)}m</span>
                    </div>
                  </div>
                  <RoleChip tone="blue">{e.kind.replace(/_/g, " ")}</RoleChip>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
