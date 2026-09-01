import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, Square, Upload, X, AlertTriangle, ShieldCheck, Plus } from 'lucide-react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { toast } from 'sonner';

/*
 * INHEIRA — Voice Booth
 *
 * In-browser voice capture using MediaRecorder. On stop, the entire recording
 * is uploaded and INHEIRA transcribes (Whisper) + classifies meaningful
 * creative moments (Claude Sonnet 5) in the background.
 *
 * The booth is intentionally minimal — a cinematic capture surface, not a
 * DAW. Speaker identification is honest about its limits: the primary
 * speaker is whoever hit record. Additional speakers can be tagged before
 * stopping so the record carries every person in the room.
 */

const MAX_MINUTES = 60;

export default function VoiceBooth({ open, onOpenChange, sessionId, onUploaded }) {
    const [state, setState] = useState('idle');       // 'idle' | 'recording' | 'paused' | 'uploading'
    const [elapsed, setElapsed] = useState(0);
    const [level, setLevel] = useState(0);            // 0..1 audio level
    const [error, setError] = useState(null);
    const [location, setLocation] = useState('');
    const [speakers, setSpeakers] = useState([]);
    const [speakerDraft, setSpeakerDraft] = useState('');

    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);
    const audioCtxRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);
    const rafRef = useRef(null);
    const startedAtRef = useRef(null);

    // Cleanup on close
    useEffect(() => {
        if (!open) {
            teardown();
            setElapsed(0); setLevel(0); setSpeakers([]); setSpeakerDraft(''); setLocation(''); setError(null); setState('idle');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const teardown = () => {
        try { mediaRecorderRef.current?.stop(); } catch {}
        streamRef.current?.getTracks?.().forEach((t) => t.stop());
        audioCtxRef.current?.close?.().catch(() => {});
        clearInterval(timerRef.current);
        cancelAnimationFrame(rafRef.current);
        mediaRecorderRef.current = null;
        streamRef.current = null;
        audioCtxRef.current = null;
        chunksRef.current = [];
        timerRef.current = null;
        rafRef.current = null;
    };

    const start = async () => {
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
            streamRef.current = stream;
            const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'].find((m) => MediaRecorder.isTypeSupported(m)) || '';
            const mr = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 96000 } : undefined);
            chunksRef.current = [];
            mr.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
            mr.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' });
                const durationSec = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
                await upload(blob, durationSec, mr.mimeType || 'audio/webm');
                teardown();
            };
            mr.start(1000);
            mediaRecorderRef.current = mr;
            startedAtRef.current = Date.now();

            // Waveform / level
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioContext();
            audioCtxRef.current = ctx;
            const src = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            src.connect(analyser);
            const data = new Uint8Array(analyser.frequencyBinCount);
            const tick = () => {
                analyser.getByteTimeDomainData(data);
                let peak = 0;
                for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i] - 128) / 128);
                setLevel(peak);
                rafRef.current = requestAnimationFrame(tick);
            };
            tick();

            timerRef.current = setInterval(() => {
                const secs = Math.round((Date.now() - startedAtRef.current) / 1000);
                setElapsed(secs);
                if (secs >= MAX_MINUTES * 60) {
                    toast.info(`Reached the ${MAX_MINUTES}-minute cap · stopping automatically`);
                    stop();
                }
            }, 500);

            setState('recording');
        } catch (e) {
            setError(e?.message || 'Microphone access denied');
            setState('idle');
        }
    };

    const stop = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            setState('uploading');
            try { mediaRecorderRef.current.stop(); } catch {}
        }
    };

    const cancel = () => {
        chunksRef.current = [];
        teardown();
        setState('idle');
        setElapsed(0);
    };

    const addSpeaker = () => {
        const name = speakerDraft.trim();
        if (!name) return;
        setSpeakers([...speakers, { name }]);
        setSpeakerDraft('');
    };

    const removeSpeaker = (i) => setSpeakers(speakers.filter((_, ix) => ix !== i));

    const upload = async (blob, durationSec, mimeType) => {
        try {
            const form = new FormData();
            const ext = mimeType.includes('webm') ? 'webm' : mimeType.includes('mp4') || mimeType.includes('m4a') ? 'm4a' : 'wav';
            form.append('file', blob, `voice-${Date.now()}.${ext}`);
            form.append('duration_sec', String(durationSec));
            if (location.trim()) form.append('location', location.trim());
            if (speakers.length) form.append('additional_speakers', JSON.stringify(speakers));
            const { data } = await api.post(`/sessions/${sessionId}/voice`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success('Voice memo captured · transcribing in the background…');
            onUploaded?.(data);
            onOpenChange(false);
        } catch (e) {
            toast.error(e?.response?.data?.detail || 'Upload failed');
            setState('idle');
        }
    };

    const mmss = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;
    const nearCap = elapsed > MAX_MINUTES * 60 * 0.9;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-black border-zinc-900 text-white max-w-xl p-0 overflow-hidden" data-testid="voice-booth">
                <VisuallyHidden.Root><DialogTitle>Voice Booth</DialogTitle></VisuallyHidden.Root>

                {/* Cinematic head */}
                <div className="relative border-b border-zinc-900 bg-gradient-to-br from-rose-500/10 via-black to-black px-8 py-7 overflow-hidden">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-rose-200 flex items-center gap-2 mb-2">
                        <Mic className="w-3 h-3" strokeWidth={1.5} /> VOICE BOOTH · CAPTURING CREATIVE EVIDENCE™
                    </div>
                    <h2 className="font-display font-black text-3xl tracking-tighter">
                        <span className="bg-gradient-to-r from-white to-rose-100 bg-clip-text text-transparent">
                            Every voice belongs to the record.
                        </span>
                    </h2>
                    <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                        Hum a melody, capture a spontaneous idea, or narrate a decision. On stop, INHEIRA
                        transcribes and identifies meaningful creative moments — you review each one before
                        it counts.
                    </p>
                </div>

                {/* Body */}
                <div className="px-8 py-8 space-y-6">
                    {/* Timer + waveform */}
                    <div className="text-center">
                        <div className={`font-display font-black text-6xl tracking-tighter ${state === 'recording' ? 'text-rose-200' : 'text-white'}`} data-testid="voice-timer">
                            {mmss}
                        </div>
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-zinc-500 mt-1">
                            of {MAX_MINUTES}:00 max · {state === 'recording' ? 'Recording live' : state === 'uploading' ? 'Sealing evidence…' : 'Ready'}
                        </div>
                        {/* Waveform bars */}
                        <div className="mt-6 flex items-end justify-center gap-1.5 h-16" aria-hidden>
                            {Array.from({ length: 24 }).map((_, i) => {
                                const height = state === 'recording' ? Math.min(1, level * (0.5 + Math.sin(i / 3 + Date.now() / 200) * 0.4 + 0.4)) : 0.08;
                                return (
                                    <div
                                        key={i}
                                        className={`w-1.5 rounded-sm transition-all ${state === 'recording' ? 'bg-rose-300' : 'bg-zinc-800'}`}
                                        style={{ height: `${Math.max(4, height * 64)}px` }}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {nearCap && (
                        <div className="border border-amber-400/30 bg-amber-400/[0.06] p-3 flex items-start gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-300 mt-0.5" />
                            <div className="text-xs text-amber-100">Approaching the {MAX_MINUTES}-minute cap. Recording will stop automatically.</div>
                        </div>
                    )}

                    {/* Metadata (only editable while idle) */}
                    {state === 'idle' && (
                        <div className="space-y-3 border-t border-zinc-900 pt-6">
                            <div>
                                <label className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">Location (optional)</label>
                                <Input data-testid="voice-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Studio, home, writing room…" className="mt-2 bg-black border-zinc-800 text-white focus:border-rose-400 focus:ring-rose-400" />
                            </div>
                            <div>
                                <label className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">Other speakers in the room (optional)</label>
                                <div className="mt-2 flex gap-2">
                                    <Input value={speakerDraft} onChange={(e) => setSpeakerDraft(e.target.value)}
                                        placeholder="Name — press Enter to add"
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSpeaker(); } }}
                                        className="bg-black border-zinc-800 text-white" data-testid="voice-speaker-input" />
                                    <Button onClick={addSpeaker} variant="outline" className="border-zinc-800 text-white hover:bg-zinc-900"><Plus className="w-4 h-4" /></Button>
                                </div>
                                {speakers.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1.5" data-testid="voice-speaker-chips">
                                        {speakers.map((s, i) => (
                                            <span key={i} className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-300 border border-zinc-800 px-2 py-1 inline-flex items-center gap-1.5">
                                                {s.name}
                                                <button onClick={() => removeSpeaker(i)} aria-label="Remove"><X className="w-3 h-3 text-zinc-500 hover:text-white" /></button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <p className="mt-2 text-[11px] text-zinc-600 leading-relaxed flex items-start gap-1.5">
                                    <ShieldCheck className="w-3 h-3 mt-0.5 shrink-0 text-emerald-300" />
                                    We tag the primary speaker as whoever hit record. Additional speakers can be added here so the record credits everyone in the room.
                                </p>
                            </div>
                        </div>
                    )}

                    {error && <div className="border border-rose-400/40 bg-rose-400/[0.06] p-3 text-sm text-rose-200">{error}</div>}
                </div>

                {/* Actions */}
                <div className="border-t border-zinc-900 bg-zinc-950/60 px-8 py-4 flex items-center justify-between gap-3">
                    {state === 'idle' && (
                        <>
                            <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-400 hover:text-white hover:bg-zinc-900">Cancel</Button>
                            <Button onClick={start} className="bg-rose-500 hover:bg-rose-400 text-black font-bold" data-testid="voice-start-btn">
                                <Mic className="w-4 h-4 mr-2" /> Start recording
                            </Button>
                        </>
                    )}
                    {state === 'recording' && (
                        <>
                            <Button variant="ghost" onClick={cancel} className="text-zinc-400 hover:text-white hover:bg-zinc-900" data-testid="voice-cancel-btn">
                                <MicOff className="w-4 h-4 mr-2" /> Discard
                            </Button>
                            <Button onClick={stop} className="bg-white hover:bg-zinc-200 text-black font-bold" data-testid="voice-stop-btn">
                                <Square className="w-4 h-4 mr-2 fill-black" /> Stop &amp; seal
                            </Button>
                        </>
                    )}
                    {state === 'uploading' && (
                        <div className="w-full flex items-center justify-center gap-2 py-1">
                            <Upload className="w-4 h-4 text-rose-300 animate-pulse" />
                            <span className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-300">Uploading &amp; sealing evidence…</span>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
