import { useEffect, useRef } from "react";
import { MicOff, VideoOff, Wifi } from "lucide-react";

// Renders a single LiveKit participant's tile (attaches video track to a video element).
export default function LiveKitTile({ participant }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const track = participant.videoTrack;
    if (track && videoRef.current) {
      track.attach(videoRef.current);
      return () => {
        track.detach(videoRef.current);
      };
    }
  }, [participant.videoTrack]);

  const initial = (participant.name || participant.identity || "?")[0].toUpperCase();

  return (
    <div
      className={`relative aspect-video rounded-xl overflow-hidden border transition-all ${
        participant.isSpeaking
          ? "border-emerald-400 ring-2 ring-emerald-400/40"
          : "border-white/[0.08]"
      } bg-black`}
      data-testid={`lk-tile-${participant.identity}`}
    >
      {participant.videoTrack ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={participant.isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
          <div className="w-16 h-16 rounded-full bg-[#007AFF] text-black flex items-center justify-center font-display text-2xl">
            {initial}
          </div>
        </div>
      )}
      <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between gap-1">
        <div className="glass rounded-full px-2 py-0.5 text-[10px] text-zinc-100 truncate max-w-[70%] flex items-center gap-1">
          <Wifi size={9} className="text-emerald-400" />
          {participant.name}
          {participant.isLocal && " (You)"}
        </div>
        <div className="flex items-center gap-1">
          {!participant.videoTrack && (
            <div className="bg-zinc-800 rounded-full w-5 h-5 flex items-center justify-center">
              <VideoOff size={9} className="text-zinc-300" />
            </div>
          )}
          {participant.isSpeaking && (
            <div className="bg-emerald-400 rounded-full w-2 h-2 dot-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
