import React, { useState } from "react";

const HOOK = "/ancr-hook.png";
const PASSPORT = "/passport-logo.png";

const WordmarkFallback = () => (
  <div className="leading-none">
    <div className="font-display text-xl font-700 tracking-tight text-white">
      ANCR <span className="grad-text">PASSPORT</span>
      <span className="align-super text-[9px] text-white/50 ml-0.5">™</span>
    </div>
  </div>
);

export const Logo = ({ compact = false, className = "" }) => {
  const [hookErr, setHookErr] = useState(false);
  const [passErr, setPassErr] = useState(false);

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`} data-testid="app-logo">
        {hookErr ? <WordmarkFallback /> : <img src={HOOK} onError={() => setHookErr(true)} alt="ANCR" className="h-7 w-auto object-contain" />}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2.5 ${className}`} data-testid="app-logo">
      {passErr ? (
        <div className="leading-none">
          <div className="font-display text-2xl font-700 tracking-tight text-white">ANCR <span className="grad-text">PASSPORT</span>™</div>
        </div>
      ) : (
        <img src={PASSPORT} onError={() => setPassErr(true)} alt="ANCR PASSPORT — Culture · Language · Music · Movement" className="w-full max-w-[210px] h-auto object-contain drop-shadow-[0_2px_14px_rgba(0,0,0,0.6)]" />
      )}
      <div className="flex items-center gap-2 pl-1">
        <span className="text-[10px] uppercase tracking-[0.22em] text-white/45 font-sans">Powered by</span>
        {hookErr ? (
          <span className="font-display text-xs font-700 text-white">ANCR</span>
        ) : (
          <img src={HOOK} onError={() => setHookErr(true)} alt="ANCR" className="h-6 w-auto object-contain drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
        )}
      </div>
    </div>
  );
};
