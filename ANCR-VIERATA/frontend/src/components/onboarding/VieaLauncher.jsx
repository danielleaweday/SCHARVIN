import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";

/**
 * VieaLauncher — a floating button pinned to the bottom-right that opens the Viea chat.
 * Hidden on /login and /viea itself.
 */
export function VieaLauncher() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  if (pathname === "/login" || pathname === "/viea") return null;
  return (
    <button
      onClick={() => navigate("/viea")}
      data-testid="viea-launcher"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm text-white shadow-xl border border-white/15 hover:border-white/35 transition-all"
      style={{ background: "linear-gradient(95deg,#14B8A6 0%,#9333EA 55%,#E11D48 100%)" }}
      title="Ask Viea"
    >
      <Sparkles className="w-4 h-4" /> Ask Viea
    </button>
  );
}
