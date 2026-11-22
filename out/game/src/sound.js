// Ember Court — tiny WebAudio bleeps, synthesized in the browser.
// One file, one job: sound. No audio files, no network, nothing to load.
let audio = null;
let muted = false;

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

function context() {
  if (!audio) {
    const Ctor = window.AudioContext ?? window.webkitAudioContext;
    if (!Ctor) return null;
    audio = new Ctor();
  }
  if (audio.state === 'suspended') void audio.resume();
  return audio;
}

function tone(freq, when, dur, type, gain) {
  const ctx = context();
  if (!ctx || muted) return;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + when);
  amp.gain.setValueAtTime(0.0001, ctx.currentTime + when);
  amp.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + when + 0.02);
  amp.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + when + dur);
  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.start(ctx.currentTime + when);
  osc.stop(ctx.currentTime + when + dur + 0.05);
}

export function playSound(kind) {
  if (muted) return;
  if (kind === 'select') tone(660, 0, 0.08, 'sine', 0.12);
  else if (kind === 'play') { tone(392, 0, 0.12, 'triangle', 0.16); tone(523, 0.07, 0.14, 'triangle', 0.16); }
  else if (kind === 'hit') { tone(180, 0, 0.16, 'sawtooth', 0.14); tone(120, 0.05, 0.18, 'sawtooth', 0.12); }
  else if (kind === 'draw') tone(880, 0, 0.06, 'sine', 0.08);
  else if (kind === 'resonance') { tone(523, 0, 0.1, 'sine', 0.14); tone(659, 0.08, 0.1, 'sine', 0.14); tone(784, 0.16, 0.18, 'sine', 0.16); }
  else if (kind === 'win') [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.13, 0.22, 'triangle', 0.16));
  else if (kind === 'lose') [392, 330, 262, 196].forEach((f, i) => tone(f, i * 0.16, 0.24, 'sine', 0.14));
  else if (kind === 'turn') tone(440, 0, 0.1, 'triangle', 0.1);
}
