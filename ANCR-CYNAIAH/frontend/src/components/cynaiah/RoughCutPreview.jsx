import { useEffect, useMemo, useRef, useState } from "react";
import { resolveAssetUrl } from "@/lib/api";
import { X, Play, Pause, Download, Volume2, VolumeX } from "lucide-react";

/** Rough-cut animatic player: chains cue visuals by timestamp with cross-fades.
 * If `track.music_url` is set, real audio plays in sync. Otherwise a silent
 * animatic runs on requestAnimationFrame at real time.
 */
export default function RoughCutPreview({ open, onClose, track, cues, project }) {
    const audioRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [t, setT] = useState(0);
    const [muted, setMuted] = useState(false);
    const duration = track?.duration_seconds || 180;
    const startRef = useRef(0);
    const rafRef = useRef(null);

    // Only cues with visuals form the animatic. Sort by timestamp.
    const timeline = useMemo(
        () =>
            (cues || [])
                .filter((c) => c.asset_url)
                .sort((a, b) => a.timestamp - b.timestamp),
        [cues],
    );

    // Current + next visual for cross-fade
    const activeIdx = useMemo(() => {
        if (!timeline.length) return -1;
        let i = 0;
        for (let k = 0; k < timeline.length; k++) {
            if (timeline[k].timestamp <= t) i = k;
        }
        return i;
    }, [t, timeline]);

    const cur = timeline[activeIdx];
    const next = timeline[activeIdx + 1];

    // Cross-fade progress within last 800ms of a segment
    const fadeAlpha = useMemo(() => {
        if (!cur || !next) return 0;
        const seg = next.timestamp - cur.timestamp;
        const dt = t - cur.timestamp;
        const remaining = seg - dt;
        if (remaining > 0.8 || remaining < 0) return 0;
        return Math.min(1, (0.8 - remaining) / 0.8);
    }, [cur, next, t]);

    // Reset when opened / closed
    useEffect(() => {
        if (!open) {
            setPlaying(false);
            setT(0);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        }
    }, [open]);

    // Playback loop
    useEffect(() => {
        if (!playing) return;
        const hasAudio = !!(track?.music_url && audioRef.current);
        startRef.current = performance.now() - t * 1000;
        if (hasAudio) {
            audioRef.current.currentTime = t;
            audioRef.current.muted = muted;
            audioRef.current.play().catch(() => {});
        }
        const loop = () => {
            const now = hasAudio
                ? audioRef.current.currentTime
                : (performance.now() - startRef.current) / 1000;
            if (now >= duration) {
                setT(duration);
                setPlaying(false);
                if (audioRef.current) audioRef.current.pause();
                return;
            }
            setT(now);
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
        return () => {
            cancelAnimationFrame(rafRef.current);
            if (audioRef.current) audioRef.current.pause();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playing]);

    const seek = (v) => {
        setT(v);
        if (audioRef.current) audioRef.current.currentTime = v;
        startRef.current = performance.now() - v * 1000;
    };

    const downloadReview = () => {
        const manifest = {
            format: "cynaiah.rough-cut.v1",
            generated_at: new Date().toISOString(),
            project: {
                id: project?.id,
                title: project?.title,
                type: project?.type,
                visual_style: project?.visual_style,
                story_concept: project?.story_concept,
            },
            music: {
                title: track?.title,
                artist: track?.artist,
                duration_seconds: track?.duration_seconds,
                ownership: track?.ownership,
                music_url: track?.music_url || null,
            },
            note: "Playable animatic assembled from CYNAIAH Sync Studio cue visuals. Timestamps are seconds. Cross-fade 0.8s between segments.",
            timeline: timeline.map((c) => ({
                timestamp: c.timestamp,
                type: c.type,
                label: c.label,
                image_url: c.asset_url,
                notes: c.notes || null,
            })),
        };
        const blob = new Blob([JSON.stringify(manifest, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${(project?.title || "cynaiah").replace(/\s+/g, "_")}_rough-cut.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (!open) return null;

    const fmt = (s) =>
        `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

    return (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col animate-fade-up">
            {/* header */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-white/[0.06]">
                <div>
                    <div className="text-[10px] uppercase tracking-[0.28em] text-cynaiah-cyan">
                        Rough Cut · Animatic Preview
                    </div>
                    <div className="font-heading text-xl text-white mt-1">
                        {project?.title} —{" "}
                        <span className="text-white/60 font-body text-base">
                            {track?.title} · {track?.artist}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={downloadReview}
                        className="cyn-btn-ghost rounded-md px-3 py-2 text-sm flex items-center gap-2"
                    >
                        <Download size={14} /> Download review (JSON)
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-md border border-white/10 text-white/70 hover:text-white"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* stage */}
            <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
                <div className="cyn-hero-glow opacity-40" />
                <div className="relative w-full max-w-6xl aspect-video rounded-xl border border-white/[0.06] overflow-hidden bg-black">
                    {timeline.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm">
                            No cue visuals attached. Attach visuals in Sync Studio to
                            build the animatic.
                        </div>
                    )}
                    {cur && (
                        <img
                            key={`cur-${cur.id}`}
                            src={resolveAssetUrl(cur.asset_url)}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover"
                            style={{ opacity: 1 - fadeAlpha, transition: "opacity 60ms linear" }}
                        />
                    )}
                    {next && (
                        <img
                            key={`nxt-${next.id}`}
                            src={resolveAssetUrl(next.asset_url)}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover"
                            style={{ opacity: fadeAlpha, transition: "opacity 60ms linear" }}
                        />
                    )}
                    {/* Lower-third */}
                    {cur && (
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/60 to-transparent">
                            <div className="text-[10px] uppercase tracking-[0.28em] text-cynaiah-cyan">
                                {cur.type} · {fmt(cur.timestamp)}
                            </div>
                            <div className="font-heading text-2xl md:text-3xl text-white mt-1">
                                {cur.label}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* transport */}
            <div className="px-8 py-5 border-t border-white/[0.06]">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setPlaying((p) => !p)}
                        className="cyn-btn-primary rounded-full w-12 h-12 flex items-center justify-center"
                    >
                        {playing ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button
                        onClick={() => setMuted((m) => !m)}
                        className="p-2 rounded-md border border-white/10 text-white/60 hover:text-white"
                        title={muted ? "Unmute" : "Mute"}
                    >
                        {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <div className="font-mono text-sm text-white/70 w-24">
                        {fmt(t)} / {fmt(duration)}
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={duration}
                        step={0.1}
                        value={t}
                        onChange={(e) => seek(parseFloat(e.target.value))}
                        className="flex-1 accent-cynaiah-cyan"
                    />
                </div>
                <div className="mt-3 text-[10px] uppercase tracking-[0.24em] text-white/40">
                    {timeline.length} cue visuals · 0.8s cross-fade ·{" "}
                    {track?.music_url ? "audio playing" : "silent preview (attach audio in ANCRLAB)"}
                </div>
            </div>

            {track?.music_url && (
                <audio ref={audioRef} src={track.music_url} preload="auto" />
            )}
        </div>
    );
}
