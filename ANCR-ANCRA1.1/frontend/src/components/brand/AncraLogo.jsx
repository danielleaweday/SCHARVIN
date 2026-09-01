import React from "react";

const LOGO_SRC = "/ancra-logo.png";

/** ANCRA official logo. Do not recreate or restyle — this is the brand asset.
 *  Use `variant="mark"` for the roundel-only mark, `variant="full"` for the full wordmark with tagline. */
export default function AncraLogo({
  variant = "wordmark",
  className = "",
  tagline = false,
  invert = false,
}) {
  // The provided asset is transparent PNG, wordmark including glyph + word + ™.
  // We render it as-is and let container control its size.
  if (variant === "mark") {
    return (
      <img
        src={LOGO_SRC}
        alt="ANCRA"
        className={`h-full w-auto object-contain ${invert ? "invert" : ""} ${className}`}
        style={{ objectPosition: "left center", clipPath: "inset(0 74% 0 0)" }}
      />
    );
  }
  return (
    <div className={`flex flex-col ${className}`}>
      <img
        src={LOGO_SRC}
        alt="ANCRA — Learn. Create. Own your future."
        className={`h-full w-auto object-contain ${invert ? "invert" : ""}`}
        style={{ objectPosition: "left center" }}
      />
      {tagline && (
        <div className="mt-1 font-mono text-[9px] tracking-[0.28em] uppercase text-ancr-dim">
          Learn · Create · Own your future
        </div>
      )}
    </div>
  );
}
