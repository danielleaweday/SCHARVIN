import { createContext, useContext, useRef, useState, useEffect, useCallback } from "react";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  const [current, setCurrent] = useState(null); // { id, title, artist_name, artist_avatar, cover, audio_url, duration_seconds }
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);

  useEffect(() => {
    if (!audioRef.current) audioRef.current = new Audio();
    const a = audioRef.current;
    a.volume = volume;
    const onTime = () => setProgress(a.currentTime);
    const onLoaded = () => setDuration(a.duration || 0);
    const onEnd = () => next();
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("ended", onEnd);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("ended", onEnd);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const play = useCallback((track, list = null) => {
    if (!track) return;
    if (list && list.length) {
      const idx = list.findIndex((t) => t.id === track.id);
      setQueue(list);
      setQueueIndex(idx >= 0 ? idx : 0);
    } else {
      setQueue([track]);
      setQueueIndex(0);
    }
    setCurrent(track);
    const a = audioRef.current;
    a.src = track.audio_url;
    a.play().catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a || !current) return;
    if (a.paused) a.play(); else a.pause();
  }, [current]);

  const next = useCallback(() => {
    if (!queue.length) return;
    const nextIdx = (queueIndex + 1) % queue.length;
    setQueueIndex(nextIdx);
    const t = queue[nextIdx];
    setCurrent(t);
    audioRef.current.src = t.audio_url;
    audioRef.current.play().catch(() => {});
  }, [queue, queueIndex]);

  const prev = useCallback(() => {
    if (!queue.length) return;
    const nextIdx = (queueIndex - 1 + queue.length) % queue.length;
    setQueueIndex(nextIdx);
    const t = queue[nextIdx];
    setCurrent(t);
    audioRef.current.src = t.audio_url;
    audioRef.current.play().catch(() => {});
  }, [queue, queueIndex]);

  const seek = useCallback((sec) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = sec;
    setProgress(sec);
  }, []);

  return (
    <PlayerContext.Provider value={{ current, queue, queueIndex, playing, progress, duration, volume, setVolume, play, toggle, next, prev, seek }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}
