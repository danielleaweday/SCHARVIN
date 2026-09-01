import React from "react";

const LOGO_SRC = "/ancr-logo.png";

/** ANCR (parent ecosystem) logo — "Discover. Develop. Deploy." Blue/white mark on black.
 *  Used in the ANCR Ecosystem footer and any parent-ecosystem context. */
export default function AncrLogo({ className = "" }) {
  return (
    <img
      src={LOGO_SRC}
      alt="ANCR · Artist Discovery & Development Network"
      className={`w-auto object-contain ${className}`}
      style={{ objectPosition: "left center" }}
    />
  );
}
