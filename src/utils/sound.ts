let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(
  freq: number,
  duration: number,
  startOffset = 0,
  type: OscillatorType = 'sine',
  volume = 0.12
) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime + startOffset;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export function playCorrectSound(enabled: boolean) {
  if (!enabled) return;
  try {
    playTone(523.25, 0.14, 0, 'triangle', 0.14); // C5
    playTone(659.25, 0.16, 0.09, 'triangle', 0.14); // E5
    playTone(783.99, 0.24, 0.18, 'triangle', 0.14); // G5
  } catch {
    // Ignore audio errors
  }
}

export function playMilestoneSound(enabled: boolean) {
  if (!enabled) return;
  try {
    playTone(523.25, 0.12, 0, 'triangle', 0.14);
    playTone(659.25, 0.12, 0.09, 'triangle', 0.14);
    playTone(783.99, 0.12, 0.18, 'triangle', 0.14);
    playTone(1046.5, 0.32, 0.27, 'triangle', 0.16);
  } catch {
    // Ignore audio errors
  }
}

export function playWrongSound(enabled: boolean) {
  if (!enabled) return;
  try {
    playTone(300, 0.16, 0, 'sine', 0.1);
    playTone(230, 0.22, 0.12, 'sine', 0.1);
  } catch {
    // Ignore audio errors
  }
}
