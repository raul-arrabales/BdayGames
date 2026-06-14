import type { PersistedEvent } from '../types';

const storageNamespace = import.meta.env.MODE === 'playtest' ? 'playtest' : '';

export const STORAGE_KEY = storageNamespace ? `bday-games-event:${storageNamespace}` : 'bday-games-event';

export function loadPersistedEvent(): PersistedEvent | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as PersistedEvent;
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
