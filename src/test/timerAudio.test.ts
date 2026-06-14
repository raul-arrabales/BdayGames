import { describe, expect, it } from 'vitest';
import { getTimerCue } from '../lib/timerAudio';

describe('timer audio cues', () => {
  it('uses a normal tick above the pressure threshold', () => {
    expect(getTimerCue(42, 41)).toBe('tick');
  });

  it('plays an ending cue when the timer reaches zero', () => {
    expect(getTimerCue(1, 0)).toBe('end');
  });

  it('switches to a pressure cue at 15 seconds or below', () => {
    expect(getTimerCue(16, 15)).toBe('pressure');
    expect(getTimerCue(15, 14)).toBe('pressure');
  });

  it('stays silent when time does not move backward', () => {
    expect(getTimerCue(12, 12)).toBeNull();
    expect(getTimerCue(10, 11)).toBeNull();
  });
});
