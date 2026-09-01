import React, { useEffect, useState } from "react";
import EcosystemNav from "@/components/shell/EcosystemNav";
import TopBar from "@/components/shell/TopBar";
import AIAHDock from "@/components/shell/AIAHDock";
import CommandPalette from "@/components/shell/CommandPalette";

export default function AppShell({ children }) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    const openHandler = () => setPaletteOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("ancra:open-palette", openHandler);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("ancra:open-palette", openHandler);
    };
  }, []);

  return (
    <div className="ancr-film-grain relative min-h-screen bg-[var(--ancra-bg)] text-white overflow-hidden">
      {/* Ambient ANCR brand glows — soft, faint, black-first */}
      <div className="pointer-events-none fixed -left-40 top-[10%] h-[520px] w-[520px] rounded-full opacity-[0.10]" style={{ background: "radial-gradient(circle, #38B6FF 0%, transparent 70%)", filter: "blur(120px)" }} />
      <div className="pointer-events-none fixed -right-40 top-[60%] h-[520px] w-[520px] rounded-full opacity-[0.08]" style={{ background: "radial-gradient(circle, #9333EA 0%, transparent 70%)", filter: "blur(140px)" }} />
      <div className="pointer-events-none fixed left-1/2 bottom-[-20%] h-[420px] w-[820px] -translate-x-1/2 rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, #E23A25 0%, transparent 70%)", filter: "blur(120px)" }} />

      <EcosystemNav />
      <TopBar onOpenPalette={() => setPaletteOpen(true)} />
      <main className="md:pl-[248px] pt-[72px] relative z-10">
        <div className="min-h-[calc(100vh-72px)]">{children}</div>
      </main>
      <AIAHDock />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
