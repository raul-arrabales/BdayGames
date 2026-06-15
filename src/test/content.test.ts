import { describe, expect, it } from 'vitest';
import rawPack from '../content/fiesta-cumple.es.md?raw';
import { parseGamePack, resolveChallengeCard } from '../lib/content';

describe('parseGamePack', () => {
  it('parses markdown game content into a typed pack', () => {
    const pack = parseGamePack(rawPack);
    const preQuestionChallenge = pack.challenges.find((challenge) => challenge.preQuestion);
    const resolvedChallenge = preQuestionChallenge ? resolveChallengeCard(preQuestionChallenge, 0) : null;

    expect(pack.id).toBe('fiesta-cumple');
    expect(pack.locale).toBe('es');
    expect(pack.rules.length).toBeGreaterThan(0);
    expect(pack.challenges.some((challenge) => challenge.category === 'trivia')).toBe(true);
    expect(pack.challenges.every((challenge) => challenge.time > 0)).toBe(true);
    expect(preQuestionChallenge?.preQuestion?.options).toHaveLength(2);
    expect(preQuestionChallenge?.preQuestion?.options[0].label).toBe('(A) Mecánica del Automóvil');
    expect(resolvedChallenge?.prompt).toBe('Que planeta se conoce como el planeta rojo?');
    expect(resolvedChallenge?.time).toBe(60);
    expect(pack.twists.some((twist) => twist.effectType === 'steal_member')).toBe(true);
    expect(pack.twists.some((twist) => twist.effectType === 'shift_round_leader')).toBe(true);
  });

  it('parses YAML frontmatter without Node buffer helpers', () => {
    const crlfPack = rawPack.replace(/\n/g, '\r\n');
    const pack = parseGamePack(crlfPack);

    expect(pack.title).toBe('Fiesta Familiar de Cumpleanos');
    expect(pack.summary).toContain('retos');
  });
});
