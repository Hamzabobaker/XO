// src/utils/sound.ts
export type SoundId = 'tap' | 'move' | 'win' | 'lose' | 'draw' | 'error' | 'start' | 'warning' | 'line';

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let masterComp: DynamicsCompressorNode | null = null;
let lastTapAtMs = 0;
const TAP_SOUND_MIN_INTERVAL_MS = 35;

const getContext = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  if (audioCtx && !masterGain) {
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 2.2;
    masterComp = audioCtx.createDynamicsCompressor();
    masterComp.threshold.value = -16;
    masterComp.knee.value = 12;
    masterComp.ratio.value = 6;
    masterComp.attack.value = 0.003;
    masterComp.release.value = 0.12;
    masterGain.connect(masterComp);
    masterComp.connect(audioCtx.destination);
  }
  return audioCtx;
};

const playTone = (
  ctx: AudioContext,
  frequency: number,
  duration: number,
  volume: number,
  type: OscillatorType,
  startAt: number
) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const safeVolume = Math.min(volume, 1.6);
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, safeVolume), startAt + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.connect(gain);
  if (masterGain) {
    gain.connect(masterGain);
  } else {
    gain.connect(ctx.destination);
  }
  osc.start(startAt);
  osc.stop(startAt + duration + 0.02);
};

const playSequence = (
  ctx: AudioContext,
  notes: Array<{ freq: number; dur: number; type?: OscillatorType }>,
  volume: number,
  startAt: number
) => {
  let t = startAt;
  for (const n of notes) {
    playTone(ctx, n.freq, n.dur, volume, n.type ?? 'sine', t);
    t += n.dur + 0.02;
  }
};

export const playSound = (sound: SoundId, volume = 0.2) => {
  if (sound === 'tap') {
    const nowMs =
      typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? performance.now()
        : Date.now();
    if (nowMs - lastTapAtMs < TAP_SOUND_MIN_INTERVAL_MS) return;
    lastTapAtMs = nowMs;
  }

  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  if (sound === 'tap') {
    playTone(ctx, 460, 0.06, volume * 0.9, 'sine', now);
    return;
  }
  if (sound === 'move') {
    playTone(ctx, 360, 0.06, volume * 0.45, 'sine', now);
    playTone(ctx, 520, 0.05, volume * 0.18, 'sine', now + 0.03);
    return;
  }
  if (sound === 'start') {
    playTone(ctx, 520, 0.08, volume * 1.1, 'sine', now);
    playTone(ctx, 660, 0.08, volume * 1.1, 'sine', now + 0.09);
    return;
  }
  if (sound === 'win') {
    playSequence(
      ctx,
      [
        { freq: 523, dur: 0.16, type: 'triangle' },
        { freq: 659, dur: 0.16, type: 'triangle' },
        { freq: 784, dur: 0.18, type: 'triangle' },
        { freq: 1047, dur: 0.24, type: 'triangle' },
      ],
      volume * 1.2,
      now
    );
    playTone(ctx, 1319, 0.28, volume * 0.5, 'triangle', now + 0.54);
    return;
  }
  if (sound === 'lose') {
    playSequence(
      ctx,
      [
        { freq: 370, dur: 0.18, type: 'triangle' },
        { freq: 294, dur: 0.2, type: 'triangle' },
        { freq: 220, dur: 0.24, type: 'triangle' },
        { freq: 174, dur: 0.28, type: 'triangle' },
      ],
      volume * 1.1,
      now
    );
    return;
  }
  if (sound === 'draw') {
    playTone(ctx, 420, 0.1, volume * 1.1, 'sine', now);
    playTone(ctx, 420, 0.1, volume * 1.1, 'sine', now + 0.14);
    return;
  }
  if (sound === 'error') {
    playTone(ctx, 180, 0.12, volume * 1.2, 'square', now);
    return;
  }
  if (sound === 'warning') {
    playTone(ctx, 520, 0.12, volume * 1.05, 'sine', now);
    playTone(ctx, 390, 0.14, volume * 1.05, 'sine', now + 0.14);
    return;
  }
  if (sound === 'line') {
    playTone(ctx, 140, 0.32, volume * 0.32, 'triangle', now);
    playTone(ctx, 220, 0.26, volume * 0.22, 'triangle', now + 0.06);
  }
};
