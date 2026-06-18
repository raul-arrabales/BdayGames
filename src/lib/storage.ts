import type { PersistedEvent } from '../types';
import { APP_STATE_VERSION, DEFAULT_CHALLENGE_TIME_SECONDS } from './gameState';

const storageNamespace = import.meta.env.MODE === 'playtest' ? 'playtest' : '';
export const PERSISTED_EVENT_VERSION = 9;

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
  const hasValidLeader =
    typeof state.currentRoundLeaderTeamId === 'string' &&
    state.teams.some((team) => team.id === state.currentRoundLeaderTeamId);

  return {
    ...persisted,
    version: PERSISTED_EVENT_VERSION,
    state: {
      ...state,
      version: Number.isFinite(state.version) ? Math.max(APP_STATE_VERSION, Math.floor(state.version)) : APP_STATE_VERSION,
      activeChallengePhaseIndex:
        typeof state.activeChallengeId === 'string' &&
        typeof state.activeChallengePhaseIndex === 'number' &&
        Number.isFinite(state.activeChallengePhaseIndex)
          ? Math.max(0, Math.floor(state.activeChallengePhaseIndex))
          : null,
      activeChallengeChoiceTeamId:
        typeof state.activeChallengeChoiceTeamId === 'string' ? state.activeChallengeChoiceTeamId : null,
      activeChallengeChoiceOptionIndex:
        typeof state.activeChallengeChoiceOptionIndex === 'number' && Number.isFinite(state.activeChallengeChoiceOptionIndex)
          ? Math.max(0, Math.floor(state.activeChallengeChoiceOptionIndex))
          : null,
      activeChallengeSolutionRevealed: Boolean(state.activeChallengeSolutionRevealed),
      challengeAwarded: Boolean(state.activeChallengeId && state.challengeAwarded),
      challengeTimerDurationSeconds: duration,
      challengeTimerSecondsLeft: Math.min(secondsLeft, duration),
      challengeTimerRunning: Boolean(state.challengeTimerRunning) && secondsLeft > 0,
      currentRoundLeaderTeamId:
        hasValidLeader ? state.currentRoundLeaderTeamId : null,
      pendingInitialRoundLeaderReveal: Boolean(state.pendingInitialRoundLeaderReveal) && !hasValidLeader,
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
