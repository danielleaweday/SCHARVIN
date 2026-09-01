import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Volume2, VolumeX } from "lucide-react";

const VOLUME = 0.3;
const EVENTS = ["pointerdown", "keydown", "scroll", "touchstart"];

export const BackgroundAudio = () => {
  const { pathname } = useLocation();
  const audioRef = useRef(null);
  const [muted, setMuted] = useState(() => localStorage.getItem("ccdp-audio-muted") === "1");
  const [ready, setReady] = useState(false);
  const hidden = pathname.startsWith("/admin");

  // mount once: attempt autoplay, fall back to first user gesture
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = VOLUME;
    a.muted = muted;

    const start = () => a.play().then(() => setReady(true)).catch(() => {});
    start();

    const onGesture = () => {
      if (!audioRef.current.paused || localStorage.getItem("ccdp-audio-muted") === "1") return cleanup();
      audioRef.current.play().then(() => setReady(true)).catch(() => {});
      cleanup();
    };
    const cleanup = () => EVENTS.forEach((e) => window.removeEventListener(e, onGesture));
    EVENTS.forEach((e) => window.addEventListener(e, onGesture, { passive: true }));
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // pause on admin pages, resume on site
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (hidden) a.pause();
    else if (!muted) a.play().catch(() => {});
  }, [hidden, muted]);

  const toggle = () => {
    const a = audioRef.current;
    const next = !muted;
    setMuted(next);
    a.muted = next;
    localStorage.setItem("ccdp-audio-muted", next ? "1" : "0");
    if (!next) a.play().then(() => setReady(true)).catch(() => {});
  };

  return (
    <>
      <audio ref={audioRef} loop preload="auto">
        <source src="/audio/ambient.mp3" type="audio/mpeg" />
        <source src="/audio/ambient.m4a" type="audio/mp4" />
        <source src="/audio/ambient.ogg" type="audio/ogg" />
      </audio>
      {!hidden && (
        <button
          type="button"
          onClick={toggle}
          data-testid="audio-toggle-btn"
          aria-label={muted ? "Turn background music on" : "Turn background music off"}
          title={muted ? "Turn background music on" : "Turn background music off"}
          className="group fixed bottom-5 left-5 z-[70] flex items-center gap-2 rounded-full border border-white/12 bg-ccdp-charcoal/90 py-2 pl-2.5 pr-3.5 text-xs font-medium text-ccdp-cream/80 shadow-lg shadow-black/40 transition-all duration-300 hover:border-white/25 hover:text-ccdp-white"
        >
          <span
            className="grid h-6 w-6 place-items-center rounded-full text-white"
            style={{ background: muted ? "rgba(255,255,255,0.12)" : "linear-gradient(135deg,#2e7bff,#7a3ff2)" }}
          >
            {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </span>
          {muted ? "Music off" : "Music on"}
          {!muted && ready && (
            <span className="ml-0.5 flex items-end gap-[2px]" aria-hidden="true">
              <span className="h-2 w-[2px] animate-pulse rounded-full bg-ccdp-blue" style={{ animationDelay: "0ms" }} />
              <span className="h-3 w-[2px] animate-pulse rounded-full bg-ccdp-purple" style={{ animationDelay: "150ms" }} />
              <span className="h-1.5 w-[2px] animate-pulse rounded-full bg-ccdp-blue" style={{ animationDelay: "300ms" }} />
            </span>
          )}
        </button>
      )}
    </>
  );
};
