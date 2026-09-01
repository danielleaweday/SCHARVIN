import React from "react";

const COHEIR_ASSET = "https://customer-assets.emergentagent.com/job_creator-launch-20/artifacts/rtbzresi_414ED926-16C8-4B01-AA73-F39BF76E4088.PNG";

/**
 * Official COHEIR™ brand asset.
 * `variant="mark"` — small square monogram only (crops to logo).
 * `variant="full"` — full artwork with wordmark + tagline (landscape).
 * `variant="wordmark"` — inline mini wordmark + small mark, for headers.
 */
export default function CoheirLogo({ variant = "wordmark", size = 40, className = "", alt = "COHEIR™" }) {
  if (variant === "full") {
    return (
      <img
        src={COHEIR_ASSET}
        alt={alt}
        className={`w-full h-auto max-w-[520px] mix-blend-screen ${className}`}
        style={{ imageRendering: "auto" }}
      />
    );
  }

  if (variant === "mark") {
    // Crop the top ~45% of the artwork to isolate the interlocking-C monogram.
    return (
      <div
        className={className}
        style={{ width: size, height: size, overflow: "hidden", position: "relative" }}
        aria-label={alt}>
        <img
          src={COHEIR_ASSET}
          alt=""
          style={{
            position: "absolute",
            width: `${size * 3.2}px`,
            height: "auto",
            left: `${-size * 1.1}px`,
            top: `${-size * 0.15}px`,
            mixBlendMode: "screen",
          }}
        />
      </div>
    );
  }

  // wordmark — inline compact
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        style={{ width: size, height: size, overflow: "hidden", position: "relative", flexShrink: 0 }}
        aria-label={alt}>
        <img
          src={COHEIR_ASSET}
          alt=""
          style={{
            position: "absolute",
            width: `${size * 3.2}px`,
            height: "auto",
            left: `${-size * 1.1}px`,
            top: `${-size * 0.15}px`,
            mixBlendMode: "screen",
          }}
        />
      </div>
      <div className="flex flex-col leading-none">
        <span className="wordmark text-white text-xl tracking-[0.02em]">
          <span className="text-[#F97316]">CO</span>
          <span className="text-white">HEIR</span>
          <sup className="text-[9px] text-zinc-500 ml-0.5 font-mono">™</sup>
        </span>
        <span className="font-mono text-[8px] tracking-[0.35em] text-zinc-500 uppercase mt-0.5">
          Educators. Leaders. Partners.
        </span>
      </div>
    </div>
  );
}
