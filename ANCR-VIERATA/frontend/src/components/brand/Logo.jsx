import React from "react";

const LOGO_SRC = "/brand/viearta-logo.png";

/**
 * Logo — uses the official VIEARTA™ artwork.
 *  - variant="mark": shows just the emblem (top portion of the artwork)
 *  - variant="full": shows the full official lockup (emblem + wordmark + descriptor + tagline)
 *  - variant="header": emblem + wordmark text side-by-side (compact for app header)
 */
export function Logo({ variant = "header", className = "" }) {
  if (variant === "full") {
    return (
      <img
        src={LOGO_SRC}
        alt="VIEARTA™ — Creative Health, Wellness & Human Performance. Live Well · Perform Well · Create Forever."
        className={`select-none ${className}`}
        draggable={false}
      />
    );
  }

  if (variant === "mark") {
    // Show only the emblem — top ~55% of the artwork — via object-position crop.
    return (
      <div
        aria-label="VIEARTA emblem"
        className={`relative overflow-hidden ${className}`}
        style={{ aspectRatio: "1 / 1" }}
      >
        <img
          src={LOGO_SRC}
          alt=""
          draggable={false}
          className="absolute inset-0 w-full h-auto select-none"
          style={{ top: "-4%", transform: "scale(1.55)", transformOrigin: "50% 22%" }}
        />
      </div>
    );
  }

  // Header variant — emblem crop + wordmark text
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        aria-hidden
        className="w-11 h-11 rounded-xl border border-white/10 bg-black shrink-0"
        style={{
          backgroundImage: `url(${LOGO_SRC})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "50% 14%",
          backgroundSize: "360% auto",
        }}
      />
      <div className="leading-tight">
        <div className="font-display text-xl tracking-wide">
          <span className="viearta-gradient font-semibold">VIEARTA</span>
          <sup className="text-white/50 text-[10px] ml-0.5">™</sup>
        </div>
        <div className="text-[10px] uppercase tracking-[0.22em] text-white/45 font-sans">
          Creative Health · Wellness · Performance
        </div>
      </div>
    </div>
  );
}
