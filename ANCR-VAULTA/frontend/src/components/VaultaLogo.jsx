export function VaultaLogo({ className = "", size = "default" }) {
  const wrapClass = size === "large" ? "h-20" : "h-12";
  return (
    <div className={`flex items-center gap-2.5 ${className}`} data-testid="vaulta-logo">
      <img
        src="/vualta-logo.png"
        alt="Vualta"
        className={`${wrapClass} object-contain`}
        style={{ filter: "invert(1) hue-rotate(180deg) saturate(1.15)" }}
      />
    </div>
  );
}

export function VaultaMark({ className = "" }) {
  return (
    <div className={`relative shrink-0 ${className}`} data-testid="vaulta-mark">
      <svg viewBox="0 0 40 40" width="100%" height="100%">
        <defs>
          <linearGradient id="vualtaV" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="35%" stopColor="#ff5f1f" />
            <stop offset="65%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <path
          d="M6 6L20 34L34 6"
          stroke="url(#vualtaV)"
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M20 34L26 22"
          stroke="url(#vualtaV)"
          strokeWidth="3.6"
          strokeLinecap="round"
          fill="none"
          opacity="0.55"
        />
      </svg>
    </div>
  );
}

export function AncrLogo({ className = "" }) {
  return (
    <div className={`flex items-center ${className}`} data-testid="ancr-logo">
      <img
        src="/ancr-logo.png"
        alt="ANCR — Discover. Develop. Deploy."
        className="h-10 object-contain opacity-90"
      />
    </div>
  );
}

export function AncrLogoTiny({ className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`} data-testid="ancr-logo-tiny">
      <img src="/ancr-logo.png" alt="ANCR" className="h-5 object-contain opacity-80" />
    </div>
  );
}
