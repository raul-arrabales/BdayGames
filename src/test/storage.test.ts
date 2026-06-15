import { afterEach, describe, expect, it, vi } from 'vitest';
import rawPack from '../content/fiesta-cumple.es.md?raw';
import { parseGamePack } from '../lib/content';
import { createInitialState } from '../lib/gameState';
import { PERSISTED_EVENT_VERSION, clearPersistedEvent, loadPersistedEvent, savePersistedEvent, STORAGE_KEY } from '../lib/storage';

describe('storage', () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('uses the shared storage key outside playtest mode', async () => {
    const { STORAGE_KEY } = await import('../lib/storage');

    expect(STORAGE_KEY).toBe('bday-games-event');
  });

  it('uses an isolated storage key in playtest mode', async () => {
    vi.stubEnv('MODE', 'playtest');

    const { STORAGE_KEY } = await import('../lib/storage');

    expect(STORAGE_KEY).toBe('bday-games-event:playtest');
  });

  it('loads older persisted events and preserves upgraded payloads', () => {
    const pack = parseGamePack(rawPack);
    const state = createInitialState(pack);

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        state,
        undoAction: null,
      }),
    );

    expect(loadPersistedEvent()).toMatchObject({
      version: PERSISTED_EVENT_VERSION,
      state: {
        gamePackId: 'fiesta-cumple',
        challengeAwarded: false,
        activeChallengeChoiceTeamId: null,
        activeChallengeChoiceOptionIndex: null,
        activeChallengeSolutionRevealed: false,
        challengeTimerDurationSeconds: 90,
        challengeTimerSecondsLeft: 90,
        challengeTimerRunning: false,
        currentRoundLeaderTeamId: null,
      },
    });

    savePersistedEvent({
      version: PERSISTED_EVENT_VERSION,
      state,
      undoAction: null,
      packMarkdown: rawPack,
      packFileName: 'fiesta-cumple.es.md',
    });

    expect(loadPersistedEvent()).toMatchObject({
      version: PERSISTED_EVENT_VERSION,
      packFileName: 'fiesta-cumple.es.md',
      packMarkdown: rawPack,
    });

    clearPersistedEvent();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
