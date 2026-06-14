import { describe, expect, it } from 'vitest';
import rawPack from '../content/fiesta-cumple.es.md?raw';
import { parseGamePack } from '../lib/content';

describe('parseGamePack', () => {
  it('parses markdown game content into a typed pack', () => {
    const pack = parseGamePack(rawPack);

    expect(pack.id).toBe('fiesta-cumple');
    expect(pack.locale).toBe('es');
    expect(pack.rules.length).toBeGreaterThan(0);
    expect(pack.challenges.some((challenge) => challenge.category === 'trivia')).toBe(true);
    expect(pack.challenges.every((challenge) => challenge.time > 0)).toBe(true);
    expect(pack.challenges[0].multipleChoice?.options).toHaveLength(4);
    expect(pack.challenges[0].multipleChoice?.answerIndex).toBe(0);
    expect(pack.challenges[0].preQuestion?.options).toHaveLength(2);
    expect(pack.challenges[0].preQuestion?.options[0].label).toBe('Ciencias');
    expect(pack.twists.some((twist) => twist.effectType === 'steal_member')).toBe(true);
  });

  it('parses YAML frontmatter without Node buffer helpers', () => {
    const crlfPack = rawPack.replace(/\n/g, '\r\n');
    const pack = parseGamePack(crlfPack);

    expect(pack.title).toBe('Fiesta Familiar de Cumpleanos');
    expect(pack.summary).toContain('retos');
  });
});
