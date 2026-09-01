import React from "react";
import { motion } from "framer-motion";
import { Type, Zap, Globe, Bell, Shield } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { PageHeader, GlassCard, Pill } from "@/components/common";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
  const { user, reducedMotion, setReducedMotion, textScale, setTextScale } = useApp();

  const applyReducedMotion = (v) => {
    setReducedMotion(v);
    document.documentElement.style.setProperty("scroll-behavior", v ? "auto" : "smooth");
    toast[v ? "success" : "message"](v ? "Reduced motion enabled" : "Reduced motion disabled");
  };

  return (
    <div data-testid="settings-page">
      <PageHeader eyebrow="Settings" title="Preferences & accessibility"
        subtitle="Tune your experience for comfort and accessibility. Built to WCAG 2.2 AA principles."
        testid="settings-header" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard className="p-6" data-testid="accessibility-settings">
          <div className="mb-4 flex items-center gap-2"><Type className="h-5 w-5 text-cyan" /><h3 className="font-display text-lg font-600 text-white">Accessibility</h3></div>
          <div className="space-y-4">
            <div>
              <div className="mb-2 text-sm font-500 text-white">Text size</div>
              <div className="flex gap-2">
                {["small", "normal", "large"].map((s) => (
                  <button key={s} onClick={() => { setTextScale(s); toast.success(`Text size: ${s}`); }} data-testid={`text-size-${s}`} className={`rounded-full px-4 py-2 text-xs font-600 capitalize transition ${textScale === s ? "bg-cyan/20 text-cyan border border-cyan/40" : "border border-white/10 bg-white/5 text-white/55"}`}>{s}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/4 p-4">
              <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-violet" /><div><div className="text-sm font-500 text-white">Reduced motion</div><div className="text-xs text-white/50">Minimize animations across the app</div></div></div>
              <Switch checked={reducedMotion} onCheckedChange={applyReducedMotion} data-testid="reduced-motion-toggle" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6" data-testid="general-settings">
          <div className="mb-4 flex items-center gap-2"><Globe className="h-5 w-5 text-violet" /><h3 className="font-display text-lg font-600 text-white">General</h3></div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/4 p-4"><div className="flex items-center gap-2"><Globe className="h-4 w-4 text-cyan" /><div className="text-sm font-500 text-white">Preferred language</div></div><Pill tone="cyan">{user?.preferred_language}</Pill></div>
            <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/4 p-4"><div className="flex items-center gap-2"><Bell className="h-4 w-4 text-amber" /><div className="text-sm font-500 text-white">Trip notifications</div></div><Switch defaultChecked data-testid="notifications-toggle" /></div>
            <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/4 p-4"><div className="flex items-center gap-2"><Shield className="h-4 w-4 text-emerald-400" /><div className="text-sm font-500 text-white">Mask sensitive data by default</div></div><Switch defaultChecked disabled data-testid="mask-toggle" /></div>
          </div>
          <p className="mt-4 text-xs text-white/40">Identity, role and language are provided by ANCRID. Change them in your ANCRID account.</p>
        </GlassCard>
      </div>
    </div>
  );
}
