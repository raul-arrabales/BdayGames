import type { PersistedEvent } from '../types';

const storageNamespace = import.meta.env.MODE === 'playtest' ? 'playtest' : '';
export const PERSISTED_EVENT_VERSION = 2;

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

export function loadPersistedEvent(): PersistedEvent | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as unknown;
    return isPersistedEvent(parsed) ? parsed : null;
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
