import { Play, Pause, SkipBack, SkipForward, Volume2, ListMusic, Heart } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { fmtDuration } from "@/lib/format";

export default function AudioPlayerBar() {
  const { current, playing, progress, duration, toggle, next, prev, seek, volume, setVolume } = usePlayer();

  const pct = duration ? (progress / duration) * 100 : 0;

  return (
    <div
      data-testid="audio-player"
      className="fixed left-[68px] right-0 bottom-0 z-40 border-t border-white/[0.05] bg-[#08080A]/95 backdrop-blur-2xl"
    >
      {/* Progress bar (top edge) */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] bg-white/[0.06] cursor-pointer group"
        onClick={(e) => {
          if (!duration) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const p = (e.clientX - rect.left) / rect.width;
          seek(p * duration);
        }}
        data-testid="player-progress"
      >
        <div className="h-full gradient-progress relative" style={{ width: `${pct}%` }}>
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_rgba(255,255,255,0.6)]" />
        </div>
      </div>

      <div className="h-[76px] px-5 flex items-center gap-4">
        {/* Now playing */}
        <div className="flex items-center gap-3 min-w-0 w-72">
          {current ? (
            <>
              <img src={current.cover} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-[13px] font-display font-medium truncate">{current.title}</div>
                <div className="text-[11px] text-white/50 truncate">{current.artist_name}</div>
              </div>
              <button data-testid="player-like" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/[0.06] text-white/60">
                <Heart size={14} strokeWidth={1.6} />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <img src="https://customer-assets.emergentagent.com/job_global-studio-4/artifacts/wunokaj7_ChatGPT%20Image%20Jul%208%2C%202026%2C%2010_38_08%20PM.png" alt="ANCRWAV" className="h-8 w-auto object-contain opacity-70" data-testid="player-ancrwav-mark" />
              <div className="text-[11px] text-white/40 font-sans-alt tracking-wide leading-tight">
                <div className="text-white/60">ANCRWAV™ ready</div>
                <div>Press ▶ on any track to begin</div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <button onClick={prev} data-testid="player-prev" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/[0.06] text-white/70 disabled:opacity-30" disabled={!current}>
              <SkipBack size={16} strokeWidth={1.6} />
            </button>
            <button
              onClick={toggle}
              data-testid="player-toggle"
              className="w-11 h-11 flex items-center justify-center rounded-full text-white hover:scale-105 transition-transform disabled:opacity-40 relative"
              disabled={!current}
              style={{
                background: "radial-gradient(circle at 30% 30%, #1a1a20, #0e0e12)",
                boxShadow: "0 0 0 2px rgba(112,0,255,0.6), 0 0 24px rgba(112,0,255,0.35)",
              }}
            >
              {playing ? <Pause size={15} strokeWidth={2} /> : <Play size={15} strokeWidth={2} className="ml-0.5" />}
            </button>
            <button onClick={next} data-testid="player-next" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/[0.06] text-white/70 disabled:opacity-30" disabled={!current}>
              <SkipForward size={16} strokeWidth={1.6} />
            </button>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-white/50 w-full max-w-xl">
            <span className="w-10 text-right tabular-nums">{fmtDuration(progress)}</span>
            <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full gradient-progress" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-10 tabular-nums">{fmtDuration(duration || current?.duration_seconds || 0)}</span>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 w-72 justify-end">
          <button data-testid="player-queue" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/[0.06] text-white/60">
            <ListMusic size={15} strokeWidth={1.6} />
          </button>
          <div className="flex items-center gap-2 pl-3 border-l border-white/[0.06]">
            <Volume2 size={14} className="text-white/50" strokeWidth={1.6} />
            <input
              data-testid="player-volume"
              type="range" min="0" max="1" step="0.02"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-24 accent-white h-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
