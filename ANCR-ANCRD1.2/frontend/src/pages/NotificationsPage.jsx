import React, { useEffect, useState } from "react";
import AppShell from "@/components/ancrd/AppShell";
import PageHeader from "@/components/ancrd/PageHeader";
import { api, timeAgo } from "@/lib/api";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/notifications").then(({data})=>setItems(data)); }, []);
  return (
    <AppShell>
      <PageHeader
        section="Notifications"
        kicker="Real-time activity across ANCRD and the ANCR Ecosystem"
        description="Reactions, mentions, mentor feedback, opportunity matches, and event reminders."
      />
      <div className="glass rounded-sm divide-y divide-white/5 stagger">
        {items.map(n => (
          <div key={n.id} data-testid={`notif-${n.id}`} className="p-4 flex items-center gap-3">
            <div className={`h-8 w-8 rounded-sm flex items-center justify-center border ${n.read ? "border-white/10 text-white/40" : "border-[#00E5FF]/40 text-[#00E5FF]"}`}>
              <Bell className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1">
              <div className="text-sm">{n.text}</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-white/40 mt-0.5">{n.kind} · {timeAgo(n.created_at)}</div>
            </div>
            {!n.read && <span className="h-2 w-2 rounded-full bg-[#00E5FF]" />}
          </div>
        ))}
        {items.length === 0 && <div className="p-6 font-mono text-xs text-white/40">No notifications yet.</div>}
      </div>
    </AppShell>
  );
}
