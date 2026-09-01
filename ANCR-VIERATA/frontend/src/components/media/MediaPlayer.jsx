import React from "react";
import { Video, Music, ExternalLink } from "lucide-react";

/**
 * Media URL detection.
 * Returns { kind: "youtube"|"vimeo"|"direct_video"|"direct_audio"|"other", embed: string }.
 */
export function detectMedia(url) {
  if (!url) return { kind: "none", embed: null };
  const u = url.trim();
  // YouTube
  const yt1 = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{6,20})/);
  if (yt1) return { kind: "youtube", embed: `https://www.youtube.com/embed/${yt1[1]}?rel=0&modestbranding=1` };
  // Vimeo
  const vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { kind: "vimeo", embed: `https://player.vimeo.com/video/${vm[1]}` };
  // Direct media
  const low = u.toLowerCase();
  if (low.endsWith(".mp4") || low.endsWith(".webm") || low.endsWith(".mov")) return { kind: "direct_video", embed: u };
  if (low.endsWith(".mp3") || low.endsWith(".ogg") || low.endsWith(".wav") || low.endsWith(".m4a")) return { kind: "direct_audio", embed: u };
  return { kind: "other", embed: u };
}

/**
 * MediaPlayer — renders a real player only when a valid URL is present.
 * If no URL, shows a friendly "Video coming from your VIEARTA team" placeholder.
 * Never fakes a player.
 */
export function MediaPlayer({ item, compact = false }) {
  if (!item || !item.url) return <MediaPlaceholder mediaType={item?.media_type} />;
  const m = detectMedia(item.url);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden" data-testid={`media-player-${item.id || ""}`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/45 inline-flex items-center gap-1.5">
              {(item.media_type || "video") === "audio" ? <Music className="w-3 h-3" /> : <Video className="w-3 h-3" />}
              {item.category || "media"}
            </div>
            <div className="font-display text-lg mt-0.5">{item.title}</div>
            {item.description && !compact && <p className="text-sm text-white/60 mt-1">{item.description}</p>}
          </div>
        </div>
      </div>
      <div className="bg-black">
        {m.kind === "youtube" || m.kind === "vimeo" ? (
          <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
            <iframe
              src={m.embed}
              title={item.title}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        ) : m.kind === "direct_video" ? (
          <video src={m.embed} controls playsInline className="w-full h-auto" />
        ) : m.kind === "direct_audio" ? (
          <div className="p-4">
            <audio src={m.embed} controls className="w-full" />
          </div>
        ) : (
          <div className="p-4 flex items-center justify-between">
            <span className="text-sm text-white/70">External media</span>
            <a href={m.embed} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-viearta-teal hover:text-white">
              Open <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export function MediaPlaceholder({ mediaType = "video" }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.02] p-6 text-center" data-testid="media-placeholder">
      <div className="mx-auto w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center mb-3">
        {mediaType === "audio" ? <Music className="w-4 h-4 text-white/50" /> : <Video className="w-4 h-4 text-white/50" />}
      </div>
      <div className="text-sm text-white/70">Video coming from your VIEARTA team</div>
      <div className="text-xs text-white/45 mt-1">Written guidance is available below. Your team can add media at any time.</div>
    </div>
  );
}
