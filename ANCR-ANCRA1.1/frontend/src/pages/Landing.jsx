import React from "react";
import { Link } from "react-router-dom";
import AncraLogo from "@/components/brand/AncraLogo";

export default function Landing() {
  return (
    <div className="ancr-film-grain relative min-h-screen bg-black text-white overflow-hidden">
      <div className="ancr-halo ancr-halo-accent -left-40 top-1/3 h-[520px] w-[520px]" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-[520px]">
          <AncraLogo />
        </div>
        <div className="mt-6 font-mono text-[10px] tracking-[0.32em] uppercase text-ancr-dim">
          Learn · Create · Own your future
        </div>
        <div className="mt-14 max-w-xl text-center font-serif text-2xl italic leading-snug text-ancr-dim">
          The Creative Learning Operating System<span className="not-italic text-ancr-mute">™</span> for the Contemporary Creative Development Program.
        </div>
        <Link
          to="/dashboard"
          data-testid="enter-ancra"
          className="ancr-btn ancr-btn-primary mt-10"
        >
          Enter ANCRA™
        </Link>
      </div>
    </div>
  );
}
