import React from "react";

const CCDP_ASSET = "https://customer-assets.emergentagent.com/job_creator-launch-20/artifacts/6ut9997i_CCDP_MULTI_BLK_BG.png";

/**
 * Official CCDP brand asset (Contemporary Creative Development Program).
 * `variant="mark"` — right-side interlocking-plus circle only.
 * `variant="wordmark"` — inline compact CCDP wordmark + mark for sidebar/header.
 * `variant="full"` — full artwork (landscape) for institution/program surfaces.
 */
export default function CCDPLogo({ variant = "wordmark", size = 40, className = "", alt = "CCDP" }) {
  if (variant === "full") {
    return (
      <img src={CCDP_ASSET} alt={alt} className={`w-full h-auto max-w-[520px] ${className}`} />
    );
  }

  if (variant === "mark") {
    // Crop the right ~35% of the artwork to isolate the circular monogram.
    return (
      <div className={className} style={{ width: size, height: size, overflow: "hidden", position: "relative" }} aria-label={alt}>
        <img
          src={CCDP_ASSET}
          alt=""
          style={{
            position: "absolute",
            height: `${size * 1.5}px`,
            width: "auto",
            right: `${-size * 0.08}px`,
            top: `${-size * 0.25}px`,
          }}
        />
      </div>
    );
  }

  // wordmark — compact for sidebar
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        style={{ width: size, height: size, overflow: "hidden", position: "relative", flexShrink: 0 }}
        aria-label={alt}>
        <img
          src={CCDP_ASSET}
          alt=""
          style={{
            position: "absolute",
            height: `${size * 1.5}px`,
            width: "auto",
            right: `${-size * 0.08}px`,
            top: `${-size * 0.25}px`,
          }}
        />
      </div>
      <div className="flex flex-col leading-none">
        <span
          className="wordmark text-xl tracking-[0.02em]"
          style={{
            background: "linear-gradient(90deg,#60A5FA 0%,#8B5CF6 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            WebkitTextFillColor: "transparent",
          }}>
          CCDP
        </span>
        <span className="font-mono text-[8px] tracking-[0.35em] text-zinc-500 uppercase mt-0.5">
          Creative Development
        </span>
      </div>
    </div>
  );
}
