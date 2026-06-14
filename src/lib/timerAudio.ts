type TimerCue = 'tick' | 'pressure' | 'end' | null;

const pressureThresholdSeconds = 15;
const defaultTimerVolume = 0.6;
const minimumGain = 0.0001;

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const AudioContextConstructor =
    window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextConstructor) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContextConstructor();
  }

  return audioContext;
}

function clampVolume(volume: number): number {
  return Math.min(1, Math.max(0, volume));
}

function playTone(
  frequency: number,
  durationSeconds: number,
  volume = 0.16,
  type: OscillatorType = 'square',
): void {
  const context = getAudioContext();
  if (!context || context.state === 'suspended') {
    return;
  }

  const normalizedVolume = Math.max(minimumGain, volume);

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const startAt = context.currentTime;

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(minimumGain, startAt);
  gain.gain.exponentialRampToValueAtTime(normalizedVolume, startAt + 0.015);
  gain.gain.exponentialRampToValueAtTime(minimumGain, startAt + durationSeconds);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + durationSeconds + 0.02);
  oscillator.onended = () => {
    oscillator.disconnect();
    gain.disconnect();
  };
}

export async function unlockTimerAudio(): Promise<void> {
  const context = getAudioContext();
  if (!context || context.state !== 'suspended') {
    return;
  }

  await context.resume();
}

export function getTimerCue(previousSecondsLeft: number, currentSecondsLeft: number): TimerCue {
  if (currentSecondsLeft <= 0 && previousSecondsLeft > 0) {
    return 'end';
  }

  if (currentSecondsLeft < previousSecondsLeft) {
    return currentSecondsLeft <= pressureThresholdSeconds ? 'pressure' : 'tick';
  }

  return null;
}

export function playTimerCue(cue: TimerCue, volume = defaultTimerVolume): void {
  if (!cue) {
    return;
  }

  const normalizedVolume = clampVolume(volume);
  if (normalizedVolume <= 0) {
    return;
  }

  const tickVolume = 0.08 * normalizedVolume;
  const pressureVolume = 0.12 * normalizedVolume;

  switch (cue) {
    case 'tick':
      playTone(880, 0.06, tickVolume, 'square');
      break;
    case 'pressure':
      playTone(1040, 0.05, pressureVolume, 'square');
      window.setTimeout(() => playTone(1320, 0.05, pressureVolume, 'square'), 110);
      break;
    case 'end':
      playTone(520, 0.14, 0.22 * normalizedVolume, 'square');
      window.setTimeout(() => playTone(392, 0.16, 0.24 * normalizedVolume, 'sawtooth'), 120);
      window.setTimeout(() => playTone(262, 0.22, 0.28 * normalizedVolume, 'sawtooth'), 240);
      break;
  }
}
