import React from "react";

/**
 * PageHeader — consistent masthead pattern across all ANCRD experiences.
 *
 * Renders:
 *  - Small kicker showing the current experience (e.g., "The Signal · Global activity feed")
 *  - Product masthead: ANCRD™ (gradient wordmark)
 *  - Subtitle: "Global Creator Network"
 *  - Optional description line
 */
export default function PageHeader({ section, kicker, description, right = null }) {
  return (
    <header data-testid="ancrd-page-header" className="mb-10">
      {section && (
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3 flex items-center gap-2">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: "#F97316", boxShadow: "0 0 8px #F97316" }}
            aria-hidden="true"
          />
          <span data-testid="page-section-label">{section}</span>
          {kicker && (
            <>
              <span className="text-white/25">·</span>
              <span className="text-white/60">{kicker}</span>
            </>
          )}
        </div>
      )}
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h1
            data-testid="page-masthead"
            className="font-display font-black tracking-tighter leading-none text-5xl md:text-6xl"
          >
            <span
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #ffffff 0%, #ffffff 45%, #A855F7 65%, #EC4899 82%, #F97316 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              ANCRD
            </span>
            <span
              className="text-xs md:text-sm align-super ml-1"
              style={{ color: "#F97316" }}
            >
              ™
            </span>
          </h1>
          <div className="mt-2 font-body text-white/60 text-base md:text-lg">
            Global Creator Network
          </div>
          {description && (
            <div className="mt-1 font-body text-white/45 text-sm max-w-2xl">
              {description}
            </div>
          )}
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>
      <div
        className="mt-6 h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, rgba(59,130,246,0.35) 0%, rgba(168,85,247,0.35) 30%, rgba(236,72,153,0.35) 60%, rgba(249,115,22,0.35) 90%, transparent 100%)",
        }}
        aria-hidden="true"
      />
    </header>
  );
}
