import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { fmtNum } from "@/lib/format";

export function AlbumCard({ album, testid }) {
  return (
    <Link
      to={`/albums/${album.id}`}
      data-testid={testid || `album-card-${album.id}`}
      className="group block card-hover"
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/[0.06]">
        <img src={album.cover} alt={album.title} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 scrim-bottom opacity-70" />
        <div className="absolute inset-x-0 bottom-0 p-3">
          <div className="text-[10px] tracking-[0.18em] uppercase text-white/60">{album.kind || "Album"}</div>
        </div>
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all">
          <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
            <Play size={14} strokeWidth={2} className="ml-0.5" />
          </div>
        </div>
      </div>
      <div className="mt-3">
        <div className="font-display text-[15px] leading-tight truncate">{album.title}</div>
        <div className="text-[12px] text-white/55 truncate mt-0.5">{album.artist_name}</div>
      </div>
    </Link>
  );
}

export function TrackRow({ track, index, list, testid }) {
  const { play, current, playing } = usePlayer();
  const isCurrent = current?.id === track.id;
  return (
    <div
      data-testid={testid || `track-row-${track.id}`}
      className={`group grid grid-cols-[24px_44px_1fr_100px_60px] gap-3 items-center px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors ${
        isCurrent ? "bg-white/[0.05]" : ""
      }`}
    >
      <div className="text-[12px] text-white/40 tabular-nums text-center">{index}</div>
      <div className="relative">
        <img src={track.cover} alt="" className="w-10 h-10 rounded-md object-cover" />
        <button
          onClick={() => play(track, list)}
          data-testid={`play-track-${track.id}`}
          className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/55 rounded-md flex items-center justify-center transition-opacity"
          aria-label={`Play ${track.title}`}
        >
          <Play size={13} className="text-white ml-0.5" strokeWidth={2} />
        </button>
      </div>
      <div className="min-w-0">
        <div className={`text-[13.5px] font-display truncate ${isCurrent ? "gradient-text" : ""}`}>{track.title}</div>
        <Link to={`/creators/${track.artist_id}`} className="text-[11.5px] text-white/50 hover:text-white/80 truncate block" data-testid={`track-artist-${track.id}`}>
          {track.artist_name}
        </Link>
      </div>
      <div className="text-[12px] text-white/50 tabular-nums text-right">{fmtNum(track.streams)}</div>
      <div className="text-[11px] text-white/45 tabular-nums text-right">
        {Math.floor((track.duration_seconds || 0) / 60)}:{String((track.duration_seconds || 0) % 60).padStart(2, "0")}
      </div>
    </div>
  );
}

export function VideoCard({ video, testid }) {
  return (
    <Link
      to={`/videos/${video.id}`}
      data-testid={testid || `video-card-${video.id}`}
      className="group block card-hover"
    >
      <div className="relative aspect-video rounded-xl overflow-hidden border border-white/[0.06]">
        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 scrim-bottom opacity-80" />
        <div className="absolute top-3 left-3 text-[9px] tracking-[0.2em] uppercase px-2 py-1 rounded-md bg-black/70 backdrop-blur border border-white/10">
          {video.kind}
        </div>
        <div className="absolute bottom-3 right-3 text-[10px] tabular-nums px-1.5 py-0.5 rounded bg-black/70">
          {Math.floor((video.duration_seconds || 0) / 60)}:{String((video.duration_seconds || 0) % 60).padStart(2, "0")}
        </div>
      </div>
      <div className="mt-3">
        <div className="font-display text-[14px] leading-tight line-clamp-2">{video.title}</div>
        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-white/50">
          <span className="truncate">{video.artist_name}</span>
          <span className="text-white/30">·</span>
          <span className="tabular-nums">{fmtNum(video.views)} views</span>
        </div>
      </div>
    </Link>
  );
}

export function CreatorCard({ creator, testid }) {
  return (
    <Link
      to={`/creators/${creator.id}`}
      data-testid={testid || `creator-card-${creator.id}`}
      className="group block card-hover glass rounded-2xl p-4"
    >
      <div className="flex items-center gap-3">
        <img src={creator.avatar} alt={creator.name} className="w-14 h-14 rounded-full object-cover border border-white/10" />
        <div className="min-w-0">
          <div className="font-display text-[14px] truncate flex items-center gap-1">
            {creator.name}
            {creator.verified && <span className="text-[#0052FF] text-[11px]">◉</span>}
          </div>
          <div className="text-[11px] text-white/50 truncate">{creator.discipline}</div>
          <div className="text-[10px] text-white/40 tracking-wide truncate mt-0.5">{creator.flag} {creator.city}</div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06] text-[10px] uppercase tracking-wider text-white/45">
        <span>{fmtNum(creator.followers)} followers</span>
        <span>{fmtNum(creator.monthly_listeners)}/mo</span>
      </div>
    </Link>
  );
}

export function PlaylistCard({ playlist, testid }) {
  return (
    <Link
      to={`/playlists/${playlist.id}`}
      data-testid={testid || `playlist-card-${playlist.id}`}
      className="group block card-hover"
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/[0.06]">
        <img src={playlist.cover} alt={playlist.title} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 scrim-bottom opacity-80" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="text-[9px] tracking-[0.22em] uppercase text-white/70">{playlist.kind}</div>
          <div className="font-display text-lg leading-tight mt-1 line-clamp-2">{playlist.title}</div>
        </div>
      </div>
      <div className="mt-2 text-[11px] text-white/50 truncate">{playlist.curator_name}</div>
    </Link>
  );
}

export function SectionHeader({ title, subtitle, action, id }) {
  return (
    <div className="flex items-end justify-between mb-5" data-testid={id}>
      <div>
        <h2 className="font-display text-[22px] sm:text-[26px] font-medium tracking-tight leading-tight">{title}</h2>
        {subtitle && <p className="text-[12px] text-white/50 mt-1 font-sans-alt">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
