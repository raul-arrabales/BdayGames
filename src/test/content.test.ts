import { describe, expect, it } from 'vitest';
import rawPack from '../content/fiesta-cumple.es.md?raw';
import rawSobriPack from '../content/Torneo_Sobri-Edad.md?raw';
import { createPackFromMarkdown } from '../lib/gamePacks';
import { parseGamePack, resolveChallengeCard } from '../lib/content';

describe('parseGamePack', () => {
  it('parses markdown game content into a typed pack', () => {
    const pack = parseGamePack(rawPack);
    const preQuestionChallenge = pack.challenges.find((challenge) => challenge.preQuestion);
    const automotiveChallenge = preQuestionChallenge ? resolveChallengeCard(preQuestionChallenge, 0) : null;
    const cybersecurityChallenge = preQuestionChallenge ? resolveChallengeCard(preQuestionChallenge, 1) : null;

    expect(pack.id).toBe('fiesta-cumple');
    expect(pack.locale).toBe('es');
    expect(pack.rules.length).toBeGreaterThan(0);
    expect(pack.challenges.some((challenge) => challenge.category === 'trivia')).toBe(true);
    expect(pack.challenges.every((challenge) => challenge.time > 0)).toBe(true);
    expect(preQuestionChallenge?.preQuestion?.options).toHaveLength(2);
    expect(preQuestionChallenge?.preQuestion?.options[0].label).toBe('(A) Mecánica del Automóvil');
    expect(preQuestionChallenge?.preQuestion?.options[0].challenge.multipleChoice?.options).toHaveLength(4);
    expect(preQuestionChallenge?.preQuestion?.options[1].challenge.multipleChoice?.options).toHaveLength(4);
    expect(automotiveChallenge?.prompt).toBe('¿Qué pieza del motor convierte el movimiento de los pistones en giro?');
    expect(automotiveChallenge?.multipleChoice?.answerIndex).toBe(0);
    expect(cybersecurityChallenge?.prompt).toBe(
      '¿Qué medida protege mejor una cuenta online frente a accesos no autorizados?',
    );
    expect(cybersecurityChallenge?.multipleChoice?.answerIndex).toBe(0);
    expect(pack.twists.some((twist) => twist.effectType === 'steal_member')).toBe(true);
    expect(pack.twists.some((twist) => twist.effectType === 'shift_round_leader')).toBe(true);
    const phasedDuel = pack.challenges.find((challenge) => challenge.title === 'Ingeniería Extrema');
    expect(phasedDuel?.phases).toHaveLength(6);
    expect(phasedDuel?.phases?.[0].title).toBe('Reclutamiento de Recursos');
    expect(phasedDuel?.phases?.[5].rules).toContain('Gana el equipo cuyo coche recorra la mayor distancia.');
  });

  it('parses YAML frontmatter without Node buffer helpers', () => {
    const crlfPack = rawPack.replace(/\n/g, '\r\n');
    const pack = parseGamePack(crlfPack);

    expect(pack.title).toBe('Fiesta Familiar de Cumpleanos');
    expect(pack.summary).toContain('retos');
  });

  it('parses multiple choice options containing colons as plain text', () => {
    const pack = parseGamePack(rawSobriPack);
    const lightningChallenge = pack.challenges.find((challenge) => challenge.title === 'Pon a prueba el conocimiento de tu equipo (VG/Met)');
    const meteorologyChallenge = lightningChallenge ? resolveChallengeCard(lightningChallenge, 1) : null;

    expect(meteorologyChallenge?.multipleChoice?.options[1]).toBe(
      'Depende: solo pueden caer dos veces si la segunda descarga ocurre antes de 30 segundos',
    );
  });

  it('rejects multiple choice options that are not plain text', () => {
    const invalidPack = `---
id: invalid-options
title: Pack inválido
locale: es
---

## Reglas
- Regla base

## Retos:trivia
- title: Opción rota
  prompt: Elige una.
  multipleChoice:
    options:
      - Bien
      - Mal: esto no va entre comillas
      - Otra
      - Última
    answerIndex: 0
  points: 100
  time: 60
`;

    expect(() => createPackFromMarkdown(invalidPack, 'invalid-options.md')).toThrow(/non-empty text options/i);
  });

  it('rejects phased challenges without required phase fields', () => {
    const invalidPack = `---
id: phased-invalid
title: Pack inválido
locale: es
---

## Reglas
- Regla base

## Retos:duel
- title: Fase rota
  prompt: Algo pasa.
  phases:
    - title: ""
      description: Sin título no vale.
  points: 100
  time: 60
`;

    expect(() => createPackFromMarkdown(invalidPack, 'invalid.md')).toThrow(/phase title/i);
  });
});
