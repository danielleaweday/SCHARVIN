import React from "react";
import { useNavigate } from "react-router-dom";
import { MODULES, MODULE_ORDER, openModule } from "@/lib/modules";
import AncraLogo from "@/components/brand/AncraLogo";
import AncrLogo from "@/components/brand/AncrLogo";
import {
  Home, GraduationCap, Waves, Users, Zap, Music, Coins, Rocket, Play, Radio, Fingerprint,
  Calendar, Library, Settings, Search, Command, Bell, ExternalLink,
} from "lucide-react";
import CommandPalette from "@/components/shell/CommandPalette";

const ICON_BY_MODULE = {
  ANCRA: GraduationCap, ANCRLAB: Waves, ANCRSync: Users, COHEIR: Zap, INHEIRA: Music,
  Vaulta: Coins, ANCRLaunch: Rocket, ANCRVIEW: Play, ANCRWAV: Radio, ANCRID: Fingerprint,
};

/**
 * ModuleShell — a fully consistent chrome used by every standalone module page
 * (ANCRLAB, ANCRSync, COHEIR, INHEIRA, ANCRID + Coming-Soon modules).
 * Guarantees identical header hierarchy, nav, footer, typography, search, profile,
 * and navigation behavior across every ANCR module.
 */
export default function ModuleShell({ current, children }) {
  const meta = MODULES[current];
  const [paletteOpen, setPaletteOpen] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="ancr-film-grain relative min-h-screen bg-[var(--ancra-bg)] text-white overflow-hidden">
      {/* Ambient brand-tinted glow, matched to the current module */}
      <div
        className="pointer-events-none fixed -left-40 top-[10%] h-[520px] w-[520px] rounded-full opacity-[0.10]"
        style={{ background: `radial-gradient(circle, ${meta?.accent || "#38B6FF"} 0%, transparent 70%)`, filter: "blur(120px)" }}
      />
      <div className="pointer-events-none fixed -right-40 top-[60%] h-[520px] w-[520px] rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, #9333EA 0%, transparent 70%)", filter: "blur(140px)" }} />

      {/* LEFT NAV — standardized across modules */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[248px] flex-col border-r border-white/[0.06] bg-black/70 backdrop-blur-2xl md:flex">
        {/* Brand — module wordmark */}
        <div className="px-6 pb-5 pt-7">
          <div className="ancr-label mb-3">ANCR · Ecosystem OS</div>
          {current === "ANCRA" ? (
            <div className="h-10 flex items-center"><AncraLogo /></div>
          ) : (
            <div>
              <div className="font-serif text-3xl leading-none tracking-tight" style={{ color: meta?.color }}>
                {meta?.name}<span className="text-[10px] align-top text-ancr-dim">™</span>
              </div>
            </div>
          )}
          <div className="mt-2 font-mono text-[9px] tracking-[0.22em] uppercase text-ancr-mute">
            {meta?.tag}
          </div>
        </div>

        {/* Ecosystem list — clicks open other modules in new tabs, current is highlighted */}
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <div className="ancr-label px-3 pb-1.5">Ecosystem</div>
          <nav className="flex flex-col">
            {MODULE_ORDER.map((m) => {
              const active = m === current;
              const modMeta = MODULES[m];
              const Icon = ICON_BY_MODULE[m] || Home;
              const openHere = () => {
                if (active) return;
                openModule(m);
              };
              return (
                <button
                  key={m}
                  onClick={openHere}
                  data-testid={`module-nav-${m}`}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-1.5 text-[12.5px] transition-all duration-200 ${
                    active ? "bg-white/[0.05] text-white" : "text-ancr-dim hover:text-white hover:bg-white/[0.02]"
                  }`}
                >
                  {active && (
                    <span
                      className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r"
                      style={{ background: modMeta.color, boxShadow: `0 0 10px ${modMeta.color}` }}
                    />
                  )}
                  <Icon size={14} strokeWidth={1.5} className={active ? "text-white" : ""} />
                  <span className="font-sans flex-1 text-left truncate">
                    {modMeta.name}<span className="ml-0.5 text-[9px] align-top text-ancr-mute">™</span>
                  </span>
                  {!active && <ExternalLink size={10} className="text-ancr-mute opacity-0 group-hover:opacity-100 transition" />}
                </button>
              );
            })}
          </nav>

          <div className="ancr-label mt-5 px-3 pb-1.5">Utility</div>
          <nav className="flex flex-col">
            {[
              { label: "Calendar", icon: Calendar },
              { label: "Library",  icon: Library },
              { label: "Settings", icon: Settings },
            ].map((u) => {
              const Icon = u.icon;
              return (
                <div key={u.label} className="flex items-center gap-3 rounded-lg px-3 py-1.5 text-[12.5px] text-ancr-mute cursor-default">
                  <Icon size={14} strokeWidth={1.5} />
                  <span className="font-sans">{u.label}</span>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer — Part of the ANCR Ecosystem */}
        <div className="border-t border-white/[0.06] p-5">
          <div className="ancr-label mb-2 text-[9px]">Part of the</div>
          <div className="h-6 mb-2"><AncrLogo className="h-full" /></div>
          <div className="font-mono text-[8.5px] tracking-[0.22em] uppercase text-ancr-mute leading-relaxed">
            Artist Discovery<br />& Development Network
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
            <span className="font-mono text-[10px] tracking-wider text-ancr-dim">All systems online</span>
          </div>
        </div>
      </aside>

      {/* TOP BAR — standardized */}
      <header className="fixed left-0 md:left-[248px] right-0 top-0 z-30 h-[72px] border-b border-white/[0.06] bg-black/60 backdrop-blur-2xl">
        <div className="flex h-full items-center justify-between gap-6 px-6 md:px-8">
          <div className="flex items-center gap-3 min-w-0">
            <div className="ancr-label">{meta?.tag}</div>
            <span className="h-4 w-px bg-white/10" />
            <div className="font-mono text-[11px] text-white truncate">{meta?.name}™</div>
          </div>

          <button
            data-testid="module-search"
            onClick={() => setPaletteOpen(true)}
            className="hidden lg:flex flex-1 max-w-md items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2 text-left transition hover:border-white/25 hover:bg-white/[0.04]"
          >
            <Search size={14} className="text-ancr-mute" />
            <span className="flex-1 text-[13px] text-ancr-mute">Search across the ANCR ecosystem…</span>
            <div className="flex items-center gap-1 rounded border border-white/10 px-1.5 py-0.5 font-mono text-[9px] text-ancr-dim">
              <Command size={9} /> K
            </div>
          </button>

          <div className="flex items-center gap-4">
            <button className="relative rounded-full border border-white/[0.08] p-2 text-ancr-dim hover:text-white hover:border-white/20 transition">
              <Bell size={15} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full" style={{ background: meta?.color, boxShadow: `0 0 8px ${meta?.color}` }} />
            </button>
            <div className="h-9 w-9 overflow-hidden rounded-full border border-white/10">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop" alt="" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </header>

      <main className="md:pl-[248px] pt-[72px] relative z-10">
        <div className="min-h-[calc(100vh-72px)]">{children}</div>
      </main>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
