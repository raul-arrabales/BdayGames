import { describe, expect, it } from 'vitest';
import { builtInGamePacks, createPackFromMarkdown, findBuiltInGamePack } from '../lib/gamePacks';
import rawPrimaryPack from '../content/fiesta-cumple.es.md?raw';
import rawSecondaryPack from '../content/Cumple_A.es.md?raw';

describe('game pack registry', () => {
  it('discovers multiple built-in markdown packs', () => {
    expect(builtInGamePacks.length).toBeGreaterThanOrEqual(2);
    expect(builtInGamePacks.map((entry) => entry.pack.id)).toEqual(
      expect.arrayContaining(['fiesta-cumple', 'cumple-A']),
    );
  });

  it('can resolve a built-in pack by id', () => {
    const pack = findBuiltInGamePack('cumple-A');

    expect(pack?.pack.title).toBe('Cumpleaños de Raúl');
    expect(pack?.markdown).toBe(rawSecondaryPack);
  });

  it('can parse an uploaded markdown file into a pack bundle', () => {
    const pack = createPackFromMarkdown(rawPrimaryPack, 'custom.md');

    expect(pack.fileName).toBe('custom.md');
    expect(pack.pack.id).toBe('fiesta-cumple');
    expect(pack.markdown).toBe(rawPrimaryPack);
  });
});
