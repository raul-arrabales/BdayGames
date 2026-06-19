import { describe, expect, it } from 'vitest';
import {
  builtInGamePacks,
  createPackFromMarkdown,
  describePackParsingError,
  findBuiltInGamePack,
  parseBuiltInGamePacks,
} from '../lib/gamePacks';
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

  it('skips invalid built-in packs and records a recoverable error', () => {
    const invalidPack = `---
id: invalid-pack
title: Pack roto
locale: es
---

## Reglas
- Regla base

## Retos:trivia
- title:
`;

    const registry = parseBuiltInGamePacks({
      '../content/fiesta-cumple.es.md': rawPrimaryPack,
      '../content/invalido.md': invalidPack,
    });

    expect(registry.packs).toHaveLength(1);
    expect(registry.packs[0]?.pack.id).toBe('fiesta-cumple');
    expect(registry.errors).toEqual([
      expect.objectContaining({
        fileName: 'invalido.md',
        detail: expect.stringContaining('Challenge "1" is missing required fields.'),
      }),
    ]);
  });

  it('includes line and column details for YAML parser failures', () => {
    expect(describePackParsingError(new Error('placeholder'))).toBe('placeholder');

    try {
      createPackFromMarkdown(
        `---
id: yaml-roto
title: Pack roto
locale: es
---

## Reglas
- Base

## Retos:trivia
- title: Pregunta rota
  prompt: Hola
  multipleChoice:
    options:
      - Bien
      - [Mal
      - Otra
      - Ultima
    answerIndex: 0
`,
        'yaml-roto.md',
      );
      throw new Error('Expected parsing to fail');
    } catch (error) {
      expect(describePackParsingError(error)).toMatch(/Linea \d+, columna \d+\./);
    }
  });
});
