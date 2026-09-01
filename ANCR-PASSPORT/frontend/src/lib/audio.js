// Lightweight Web Audio helpers for SYNTHESIZED PLACEHOLDER playback only.
let ctx;
const getCtx = () => {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
};

const midiFromTonicSemis = (tonicHz, semis) => tonicHz * Math.pow(2, semis / 12);

export const playTone = (freq, start, dur = 0.42, gain = 0.18) => {
  const ac = getCtx();
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(gain, start + 0.02);
  g.gain.linearRampToValueAtTime(0, start + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(start);
  osc.stop(start + dur + 0.05);
};

// semis: array of semitone offsets (can be fractional for quarter tones)
export const playScale = (semis, tonicHz = 261.63, noteDur = 0.42) => {
  const ac = getCtx();
  const t0 = ac.currentTime + 0.05;
  semis.forEach((s, i) => playTone(midiFromTonicSemis(tonicHz, s), t0 + i * noteDur, noteDur * 0.9));
  return semis.length * noteDur;
};

export const playPhrase = (semis, tonicHz = 261.63) => playScale(semis, tonicHz, 0.3);

// Percussion click for rhythm lab
const click = (start, accent) => {
  const ac = getCtx();
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = accent ? "square" : "triangle";
  osc.frequency.value = accent ? 220 : 440;
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(accent ? 0.32 : 0.16, start + 0.005);
  g.gain.exponentialRampToValueAtTime(0.001, start + 0.12);
  osc.connect(g).connect(ac.destination);
  osc.start(start);
  osc.stop(start + 0.14);
};

// layers: [{pattern:[0/1...]}], bpm, returns stop fn
export const playRhythm = (layers, cycle, bpm = 100) => {
  const ac = getCtx();
  const beat = 60 / bpm / 2; // subdivision
  let stopped = false;
  let step = 0;
  const startAt = ac.currentTime + 0.1;
  const tick = () => {
    if (stopped) return;
    const now = ac.currentTime;
    // schedule this step
    layers.forEach((L, li) => {
      if (L.pattern[step % cycle]) click(now + 0.02, li === 0);
    });
    step = (step + 1) % cycle;
    setTimeout(tick, beat * 1000);
  };
  setTimeout(tick, 100);
  return () => { stopped = true; };
};

export const NOTE_C4 = 261.63;
