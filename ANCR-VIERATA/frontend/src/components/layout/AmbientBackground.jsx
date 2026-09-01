import React from "react";

export function AmbientBackground() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-[#050505]">
      <div className="orb" style={{ top: "-8rem", left: "-6rem", width: "36rem", height: "36rem", background: "#14B8A6" }} />
      <div className="orb" style={{ top: "20%", right: "-10rem", width: "40rem", height: "40rem", background: "#9333EA", opacity: 0.5 }} />
      <div className="orb" style={{ bottom: "-14rem", left: "20%", width: "42rem", height: "42rem", background: "#E11D48", opacity: 0.35 }} />
      <div className="orb" style={{ bottom: "10%", right: "10%", width: "28rem", height: "28rem", background: "#D97706", opacity: 0.32 }} />
      <div className="absolute inset-0" style={{
        background: "radial-gradient(1200px 600px at 50% -10%, rgba(255,255,255,0.05), transparent)"
      }} />
      <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay" style={{
        backgroundImage:
          'url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22140%22 height=%22140%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>")',
      }} />
    </div>
  );
}
