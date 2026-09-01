import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert, Phone, Building2, Users, LifeBuoy, MapPinned, FileText,
  Lock, ChevronRight, X,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { PageHeader, GlassCard, Loader, Pill, Disclaimer } from "@/components/common";
import { Switch } from "@/components/ui/switch";

export default function Safety() {
  const [d, setD] = useState(null);
  const [selectedHelp, setSelectedHelp] = useState(null);

  useEffect(() => { api.get("/safety").then((r) => setD(r.data)); }, []);
  if (!d) return <Loader label="Loading Safety Center" />;

  const toggleLocation = async (v) => {
    const { data } = await api.put("/safety/location-sharing", { enabled: v });
    setD((p) => ({ ...p, location_sharing: data.location_sharing }));
    toast[v ? "success" : "message"](v ? "Location sharing enabled — you control this anytime" : "Location sharing disabled");
  };

  return (
    <div data-testid="safety-page">
      <PageHeader eyebrow="Safety + Support" title="Prepared, protected, in control"
        subtitle="Your emergency plan, trusted contacts and destination resources — with privacy you control."
        testid="safety-header" />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <GlassCard className="border-amber/25 p-6" data-testid="safety-emergency-numbers">
          <div className="mb-3 flex items-center gap-2"><Phone className="h-5 w-5 text-amber" /><h3 className="font-display text-lg font-600 text-white">Destination emergency numbers</h3></div>
          <div className="flex flex-wrap gap-3">
            {d.emergency_numbers.map((e) => (
              <div key={e.label} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"><div className="text-[10px] uppercase tracking-widest text-white/40">{e.label}</div><div className="font-mono-p text-2xl font-600 text-amber">{e.number}</div></div>
            ))}
          </div>
        </GlassCard>
        <GlassCard className="p-6" data-testid="safety-embassy">
          <div className="mb-3 flex items-center gap-2"><Building2 className="h-5 w-5 text-cyan" /><h3 className="font-display text-lg font-600 text-white">Embassy & consular resources</h3></div>
          <p className="text-sm text-white/65">{d.embassy}</p>
        </GlassCard>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GlassCard className="p-6" data-testid="trusted-contacts">
          <div className="mb-3 flex items-center gap-2"><Users className="h-5 w-5 text-violet" /><h3 className="font-display text-lg font-600 text-white">Trusted contacts</h3></div>
          <div className="space-y-2.5">
            {[...d.trusted_contacts].map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/4 p-3">
                <div><div className="text-sm font-600 text-white">{c.name}</div><div className="text-xs text-white/50">{c.relationship}</div></div>
                <span className="font-mono-p text-xs text-white/60">{c.phone_masked}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6" data-testid="location-sharing">
          <div className="mb-3 flex items-center gap-2"><MapPinned className="h-5 w-5 text-cyan" /><h3 className="font-display text-lg font-600 text-white">Location sharing</h3></div>
          <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/4 p-4">
            <div className="pr-4"><div className="text-sm font-600 text-white">Share my location with trusted contacts</div><div className="mt-1 text-xs text-white/50">Permission-based, limited, always visible to you, and can be disabled anytime.</div></div>
            <Switch checked={d.location_sharing} onCheckedChange={toggleLocation} data-testid="location-toggle" />
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-white/50"><Lock className="h-4 w-4 text-emerald-400" /> {d.location_sharing ? "Sharing ON — only your trusted contacts can see it." : "Sharing OFF — no location is shared."}</div>
        </GlassCard>
      </div>

      {/* Help options */}
      <GlassCard className="mb-6 p-6" data-testid="help-options">
        <div className="mb-3 flex items-center gap-2"><LifeBuoy className="h-5 w-5 text-magenta" /><h3 className="font-display text-lg font-600 text-white">Get help</h3></div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {d.help_options.map((o) => (
            <button key={o.id} onClick={() => setSelectedHelp(o)} data-testid={`safety-help-${o.id}`} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/4 p-4 text-left text-sm font-500 text-white transition hover:border-magenta/40">{o.label} <ChevronRight className="h-4 w-4 text-white/40" /></button>
          ))}
        </div>
      </GlassCard>

      {/* Resources */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {d.resources.map((r) => (
          <GlassCard key={r.title} className="p-5"><div className="mb-2 flex items-center gap-2"><FileText className="h-4 w-4 text-cyan" /><h4 className="font-600 text-white">{r.title}</h4></div><p className="text-sm text-white/60">{r.body}</p></GlassCard>
        ))}
      </div>

      <Disclaimer text={d.disclaimer} />

      {selectedHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setSelectedHelp(null)}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0B1021] p-6" data-testid="safety-help-detail">
            <div className="mb-3 flex items-center justify-between"><Pill tone="magenta">{selectedHelp.label}</Pill><button onClick={() => setSelectedHelp(null)} className="text-white/50"><X className="h-5 w-5" /></button></div>
            <p className="text-sm leading-relaxed text-white/75">{selectedHelp.guidance}</p>
            <Disclaimer className="mt-4" text={d.disclaimer} />
          </motion.div>
        </div>
      )}
    </div>
  );
}
