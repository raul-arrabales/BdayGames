import type { PersistedEvent } from '../types';
import { APP_STATE_VERSION, DEFAULT_CHALLENGE_TIME_SECONDS } from './gameState';

const storageNamespace = import.meta.env.MODE === 'playtest' ? 'playtest' : '';
export const PERSISTED_EVENT_VERSION = 3;

export const STORAGE_KEY = storageNamespace ? `bday-games-event:${storageNamespace}` : 'bday-games-event';

function isPersistedEvent(value: unknown): value is PersistedEvent {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<PersistedEvent> & { state?: { gamePackId?: unknown; screen?: unknown } };

  return (
    typeof candidate.version === 'number' &&
    typeof candidate.state?.gamePackId === 'string' &&
    typeof candidate.state?.screen === 'string'
  );
}

function normalizePersistedState(persisted: PersistedEvent): PersistedEvent {
  const state = persisted.state;
  const duration = Number.isFinite(state.challengeTimerDurationSeconds)
    ? Math.max(1, Math.floor(state.challengeTimerDurationSeconds))
    : DEFAULT_CHALLENGE_TIME_SECONDS;
  const secondsLeft = Number.isFinite(state.challengeTimerSecondsLeft)
    ? Math.max(0, Math.floor(state.challengeTimerSecondsLeft))
    : duration;

  return {
    ...persisted,
    version: PERSISTED_EVENT_VERSION,
    state: {
      ...state,
      version: Number.isFinite(state.version) ? Math.max(APP_STATE_VERSION, Math.floor(state.version)) : APP_STATE_VERSION,
      challengeTimerDurationSeconds: duration,
      challengeTimerSecondsLeft: Math.min(secondsLeft, duration),
      challengeTimerRunning: Boolean(state.challengeTimerRunning) && secondsLeft > 0,
    },
  };
}

export function loadPersistedEvent(): PersistedEvent | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as unknown;
    return isPersistedEvent(parsed) ? normalizePersistedState(parsed) : null;
  } catch {
    return null;
  }
}

export function savePersistedEvent(payload: PersistedEvent): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearPersistedEvent(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}
