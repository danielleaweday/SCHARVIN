import React from "react";
import { MODULE_ORDER, MODULES, openModule } from "@/lib/modules";

/**
 * ANCR ECOSYSTEM launcher — a compact chip strip shown on every module homepage.
 * The current module is highlighted; every other module opens in a new tab.
 */
export default function EcosystemLauncher({ current }) {
  return (
    <section data-testid="ecosystem-launcher" className="ancr-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-3">
        <div className="ancr-label">ANCR · Ecosystem</div>
        <div className="font-mono text-[10px] tracking-widest uppercase text-ancr-mute">
          {MODULE_ORDER.length} modules · one operating system
        </div>
      </div>
      <div className="grid grid-cols-2 gap-[1px] bg-white/[0.04] sm:grid-cols-5 lg:grid-cols-10">
        {MODULE_ORDER.map((m) => {
          const meta = MODULES[m];
          const active = m === current;
          const clickable = !active;
          const El = clickable ? "button" : "div";
          return (
            <El
              key={m}
              data-testid={`launch-${m}`}
              onClick={clickable ? () => openModule(m) : undefined}
              className={`group relative flex flex-col items-start gap-2 bg-black p-4 text-left transition ${
                clickable ? "hover:bg-white/[0.03] cursor-pointer" : "cursor-default"
              }`}
            >
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{
                  background: meta.color,
                  boxShadow: active ? `0 0 12px ${meta.color}` : "none",
                }}
              />
              <div className="min-w-0">
                <div className={`font-serif text-[13.5px] leading-tight ${active ? "text-white" : "text-ancr-dim group-hover:text-white transition"}`}>
                  {meta.name}<span className="text-[8px] align-top text-ancr-mute">™</span>
                </div>
                <div className="mt-0.5 font-mono text-[8.5px] uppercase tracking-widest text-ancr-mute leading-relaxed">
                  {active ? "you are here" : (meta.real ? "open" : "coming soon")}
                </div>
              </div>
            </El>
          );
        })}
      </div>
    </section>
  );
}
