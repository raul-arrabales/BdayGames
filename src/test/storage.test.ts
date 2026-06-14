import { afterEach, describe, expect, it, vi } from 'vitest';

describe('storage', () => {
  afterEach(() => {
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
});
