import React from "react";

export const ANCRD_LOGO = "/brand/ancrd-logo.png";
export const ANCR_LOGO = "/brand/ancr-logo.png";

/* ANCRD gradient marker (blue → magenta → orange), used for accents */
export const ANCRD_GRAD = "linear-gradient(90deg, #4F46E5 0%, #A855F7 35%, #EC4899 65%, #F97316 100%)";
export const ANCR_GRAD  = "linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%)";

/**
 * BrandLogo — inline SVG ANCRD wordmark with orb+speech icon.
 * Compact, crisp at all sizes, uses gradient stroke matching the provided brand logo.
 */
export function BrandLogo({ size = "md", withMark = true, className = "" }) {
  const map = {
    xs: { icon: 20, text: "text-lg", tm: "text-[7px]" },
    sm: { icon: 26, text: "text-xl", tm: "text-[8px]" },
    md: { icon: 32, text: "text-2xl", tm: "text-[9px]" },
    lg: { icon: 48, text: "text-4xl", tm: "text-[11px]" },
    xl: { icon: 72, text: "text-6xl", tm: "text-sm" },
  };
  const s = map[size] || map.md;
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {withMark && (
        <svg width={s.icon} height={s.icon} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="ancrdGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="35%" stopColor="#A855F7" />
              <stop offset="65%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>
          </defs>
          {/* D shape with speech tail */}
          <path
            d="M18 8 h20 a18 18 0 0 1 18 18 v12 a18 18 0 0 1 -18 18 h-6 l-6 8 v-8 h-8 a18 18 0 0 1 -18 -18 v-12 A18 18 0 0 1 18 8 Z"
            stroke="url(#ancrdGrad)"
            strokeWidth="3"
            fill="none"
            strokeLinejoin="round"
          />
          {/* orbit ring */}
          <ellipse cx="24" cy="30" rx="17" ry="12" stroke="url(#ancrdGrad)" strokeWidth="1" fill="none" opacity="0.55" transform="rotate(-18 24 30)" />
          {/* orbit dots */}
          <circle cx="9" cy="24" r="1.6" fill="#60A5FA" />
          <circle cx="15" cy="42" r="1.4" fill="#A855F7" />
          <circle cx="40" cy="18" r="1.6" fill="#EC4899" />
          {/* speech dots */}
          <circle cx="30" cy="32" r="1.8" fill="#60A5FA" />
          <circle cx="36" cy="32" r="1.8" fill="#A855F7" />
          <circle cx="42" cy="32" r="1.8" fill="#F97316" />
        </svg>
      )}
      <span className="font-display font-black tracking-tighter leading-none">
        <span className={`${s.text} bg-clip-text text-transparent`} style={{ backgroundImage: "linear-gradient(90deg, #ffffff 0%, #ffffff 55%, #EC4899 80%, #F97316 100%)" }}>
          ANCRD
        </span>
        <span className={`${s.tm} align-super ml-0.5`} style={{ color: "#F97316" }}>™</span>
      </span>
    </div>
  );
}

/**
 * AncrEcosystemMark — small blue ANCR wordmark for footer references.
 */
export function AncrMark({ className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1 font-display font-black tracking-tighter ${className}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="ancrGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        <path d="M4 20 L12 4 L20 20 Z" stroke="url(#ancrGrad)" strokeWidth="2" fill="none" strokeLinejoin="round" />
        <path d="M8 16 L12 8 L16 16" stroke="#60A5FA" strokeWidth="1" fill="none" opacity="0.6" />
      </svg>
      <span style={{ backgroundImage: "linear-gradient(90deg, #ffffff, #60A5FA)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
        ANCR
      </span>
      <span className="text-[8px] align-super" style={{ color: "#60A5FA" }}>™</span>
    </span>
  );
}
