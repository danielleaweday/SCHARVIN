import React from "react";

const ANCR_ASSET = "https://customer-assets.emergentagent.com/job_creator-launch-20/artifacts/u6eshpyh_ChatGPT%20Image%20Jul%204%2C%202026%2C%2007_42_00%20PM.png";

/**
 * Ecosystem attribution — "Part of the ANCR ecosystem".
 * Used in footers, public share view, sidebar bottom, ecosystem strips.
 *
 * `variant="pill"` — inline pill (default)
 * `variant="block"` — larger stacked block for hero footers
 * `variant="mark"` — just the ANCR mark
 */
export default function AncrBadge({ variant = "pill", size = 22, className = "" }) {
  const Mark = () => (
    <div style={{ width: size, height: size, overflow: "hidden", position: "relative", flexShrink: 0 }} aria-label="ANCR">
      <img
        src={ANCR_ASSET}
        alt=""
        style={{
          position: "absolute",
          height: `${size * 2.6}px`,
          width: "auto",
          left: `${-size * 0.6}px`,
          top: `${-size * 0.65}px`,
        }}
      />
    </div>
  );

  if (variant === "mark") return <Mark />;

  if (variant === "block") {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Mark />
        <div className="flex flex-col leading-none">
          <span className="font-mono text-[9px] tracking-[0.3em] text-zinc-500 uppercase">Part of the</span>
          <span className="wordmark text-white text-lg tracking-tight mt-0.5">ANCR Ecosystem</span>
          <span className="font-mono text-[8px] tracking-[0.3em] text-zinc-600 uppercase mt-0.5">Discover. Develop. Deploy.</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] ${className}`}
      data-testid="ancr-ecosystem-badge">
      <Mark />
      <span className="font-mono text-[9px] tracking-[0.3em] text-zinc-400 uppercase">
        Part of the <span className="text-white">ANCR ecosystem</span>
      </span>
    </div>
  );
}
