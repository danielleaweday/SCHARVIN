import React, { useState } from "react";
import EcosystemSidebar from "./EcosystemSidebar";
import AiahPanel from "./AiahPanel";
import EcosystemFooter from "./EcosystemFooter";
import { Bot } from "lucide-react";

export default function AppShell({ children, right = true }) {
  const [aiOpen, setAiOpen] = useState(false);
  return (
    <div className="grain min-h-screen flex bg-[#050505] text-white">
      <EcosystemSidebar />
      <main className="flex-1 min-w-0 relative z-[2] flex flex-col">
        <div className="max-w-[1400px] w-full mx-auto px-4 md:px-8 py-6 flex-1">
          {children}
        </div>
        <EcosystemFooter />
      </main>
      {right && <AiahPanel open={aiOpen} onClose={() => setAiOpen(false)} />}
      {right && (
        <button
          data-testid="aiah-fab"
          onClick={() => setAiOpen(true)}
          className="fixed bottom-24 right-6 z-[60] flex items-center gap-2 px-4 py-3 rounded-full glass-elev btn-cine hover:border-[#EC4899]/50"
          style={{ boxShadow: "0 0 40px rgba(236,72,153,0.25)", borderColor: "rgba(236,72,153,0.35)" }}
        >
          <Bot className="h-4 w-4" style={{ color: "#F97316" }} />
          <span className="font-mono text-[11px] uppercase tracking-widest">AIAH</span>
        </button>
      )}
    </div>
  );
}
