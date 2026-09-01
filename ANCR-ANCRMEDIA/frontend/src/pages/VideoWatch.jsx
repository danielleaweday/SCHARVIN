import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/lib/api";
import { Play, Pause, Volume2, Maximize2, Heart, Share2, Bookmark } from "lucide-react";
import { fmtNum, fmtDate, fmtDuration } from "@/lib/format";
import { VideoCard } from "@/components/MediaCards";
import { BRAND } from "@/lib/brand";

export default function VideoWatch() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setData(null);
    api.get(`/videos/${id}`).then((r) => setData(r.data));
  }, [id]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onT = () => setProgress(v.currentTime);
    const onL = () => setDuration(v.duration);
    const onP = () => setPlaying(true);
    const onPa = () => setPlaying(false);
    v.addEventListener("timeupdate", onT);
    v.addEventListener("loadedmetadata", onL);
    v.addEventListener("play", onP);
    v.addEventListener("pause", onPa);
    return () => { v.removeEventListener("timeupdate", onT); v.removeEventListener("loadedmetadata", onL); v.removeEventListener("play", onP); v.removeEventListener("pause", onPa); };
  }, [data]);

  if (!data) return <div className="p-16 text-white/40">Loading…</div>;
  const { video, related } = data;
  const pct = duration ? (progress / duration) * 100 : 0;

  const toggle = () => {
    const v = videoRef.current;
    if (v.paused) v.play(); else v.pause();
  };

  return (
    <div data-testid="video-watch-page" className="pb-16 px-6 pt-8 grid xl:grid-cols-[1fr_360px] gap-8 max-w-[1500px] mx-auto">
      <div>
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/[0.06] group">
          <video
            ref={videoRef}
            data-testid="watch-video"
            src={video.video_url}
            poster={video.thumbnail}
            className="w-full h-full object-cover"
            onClick={toggle}
          />
          {!playing && (
            <button
              data-testid="watch-play-big"
              onClick={toggle}
              className="absolute inset-0 flex items-center justify-center bg-black/40"
            >
              <span className="w-20 h-20 rounded-full bg-white/95 text-black flex items-center justify-center">
                <Play size={26} className="ml-1" strokeWidth={2} />
              </span>
            </button>
          )}
          <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)" }}>
            <div
              className="h-1 bg-white/20 rounded-full cursor-pointer relative"
              onClick={(e) => {
                if (!duration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const p = (e.clientX - rect.left) / rect.width;
                videoRef.current.currentTime = p * duration;
              }}
            >
              <div className="h-full gradient-progress" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-3 flex items-center gap-3 text-white">
              <button data-testid="watch-toggle" onClick={toggle} className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center">
                {playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
              </button>
              <Volume2 size={16} className="text-white/70" />
              <div className="text-[11px] tabular-nums font-mono text-white/70">{fmtDuration(progress)} / {fmtDuration(duration)}</div>
              <button className="ml-auto text-white/70 hover:text-white"><Maximize2 size={14} /></button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center gap-3">
            <img src={BRAND.ANCRVIEW} alt="ANCRVIEW" className="h-6 w-auto object-contain opacity-80" data-testid="watch-ancrview-mark" />
            <div className="text-[10px] tracking-[0.22em] uppercase text-white/60">{video.kind} · {video.institution_name}</div>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-medium tracking-tight leading-tight mt-2">{video.title}</h1>
          <div className="mt-3 flex items-center gap-3">
            <Link to={`/creators/${video.artist_id}`} className="flex items-center gap-2 hover:opacity-80" data-testid="watch-creator-link">
              <img src={video.artist_avatar} alt="" className="w-10 h-10 rounded-full border border-white/10" />
              <div>
                <div className="text-[13px] font-display">{video.artist_name}</div>
                <div className="text-[11px] text-white/50">{fmtNum(video.subscribers)} subscribers</div>
              </div>
            </Link>
            <button data-testid="watch-subscribe" className="ml-4 px-4 py-2 rounded-full bg-white text-black text-sm font-medium">Subscribe</button>
            <div className="ml-auto flex items-center gap-2">
              <button className="p-2 rounded-full glass glass-hover"><Heart size={14} /></button>
              <button className="p-2 rounded-full glass glass-hover"><Bookmark size={14} /></button>
              <button className="p-2 rounded-full glass glass-hover"><Share2 size={14} /></button>
            </div>
          </div>
          <div className="mt-4 p-4 glass rounded-2xl text-[13px] font-sans-alt text-white/70">
            <div className="flex items-center gap-3 text-[11px] text-white/50 mb-2">
              <span>{fmtNum(video.views)} views</span>
              <span>·</span>
              <span>{fmtDate(video.release_date)}</span>
              {video.series && <><span>·</span><span>Series: {video.series}</span></>}
            </div>
            {video.description}
          </div>
        </div>
      </div>

      <aside data-testid="watch-related">
        <div className="text-[10px] tracking-[0.22em] uppercase text-white/50 mb-4">More on ANCRVIEW</div>
        <div className="space-y-4">
          {related.map((v) => (
            <Link key={v.id} to={`/videos/${v.id}`} className="flex gap-3 group" data-testid={`related-${v.id}`}>
              <div className="relative w-40 flex-shrink-0 aspect-video rounded-lg overflow-hidden border border-white/[0.06]">
                <img src={v.thumbnail} className="w-full h-full object-cover" alt="" />
                <div className="absolute bottom-1 right-1 text-[9px] tabular-nums px-1.5 py-0.5 rounded bg-black/70">
                  {fmtDuration(v.duration_seconds)}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-display leading-tight line-clamp-2 group-hover:gradient-text transition-colors">{v.title}</div>
                <div className="text-[11px] text-white/50 mt-1 truncate">{v.artist_name}</div>
                <div className="text-[10px] text-white/40 tabular-nums mt-0.5">{fmtNum(v.views)} views</div>
              </div>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}
