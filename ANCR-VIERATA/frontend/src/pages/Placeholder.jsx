import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Construction } from "lucide-react";

export default function Placeholder({ title, description, testid }) {
  const navigate = useNavigate();
  return (
    <div data-testid={testid || "placeholder-page"} className="fade-up">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <section className="glass rounded-3xl p-10 sm:p-14 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-30" style={{ background: "#9333EA" }} />
        <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full blur-3xl opacity-25" style={{ background: "#14B8A6" }} />
        <div className="relative">
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/45 mb-4">
            <Construction className="w-3.5 h-3.5" /> Coming soon
          </div>
          <h1 className="font-display text-4xl sm:text-5xl tracking-tight">
            <span className="viearta-gradient">{title}</span>
          </h1>
          <p className="mt-4 text-white/70 max-w-2xl">{description}</p>

          <p className="mt-8 text-[11px] uppercase tracking-[0.24em] text-white/35">
            Live Well · Perform Well · Create Forever
          </p>
        </div>
      </section>
    </div>
  );
}
