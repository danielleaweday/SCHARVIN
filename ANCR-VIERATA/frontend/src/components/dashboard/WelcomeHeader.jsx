import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Sparkles } from "lucide-react";

export function WelcomeHeader() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");

  useEffect(() => {
    let alive = true;
    api.get("/rotating-message").then(({ data }) => { if (alive) setMessage(data.message); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <section
      data-testid="welcome-header"
      className="relative overflow-hidden rounded-3xl p-8 sm:p-10 glass fade-up"
    >
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl opacity-40" style={{ background: "#9333EA" }} />
      <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full blur-3xl opacity-30" style={{ background: "#14B8A6" }} />

      <div className="relative z-10">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/50 mb-3">
          <span>{today}</span>
          {user?.is_demo && (
            <span
              data-testid="demo-experience-badge"
              className="ml-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-viearta-teal/30 bg-viearta-teal/10 text-viearta-teal normal-case tracking-normal text-[10px]"
            >
              <Sparkles className="w-3 h-3" /> Demo Experience
            </span>
          )}
        </div>

        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight">
          {greeting},{" "}
          <span className="viearta-gradient">{user?.first_name || "Creator"}</span>
        </h1>

        <p className="mt-3 text-white/70 max-w-2xl font-sans text-base">
          {user?.discipline} · <span className="font-mono text-white/50 text-sm">{user?.ancrid}</span>
        </p>

        {message && (
          <p className="mt-6 text-white/75 italic font-display text-xl sm:text-2xl max-w-3xl leading-snug">
            "{message}"
          </p>
        )}

        <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-white/40">
          Live Well · Perform Well · Create Forever
        </p>
      </div>
    </section>
  );
}
