import YAML from 'yaml';
import type {
  ChallengeCard,
  ChallengeCategory,
  ChallengePreQuestion,
  ChallengeMultipleChoice,
  ChallengeVariant,
  GamePack,
  TwistCard,
  TwistEffectType,
} from '../types';
import { DEFAULT_CHALLENGE_TIME_SECONDS } from './gameState';

interface FrontmatterShape {
  id: string;
  title: string;
  locale: 'es';
  summary?: string;
}

const challengePattern = /^- title:\s*(.+)$/gm;

interface ChallengeDocumentShape {
  title?: string;
  prompt?: string;
  rules?: string[];
  points?: number;
  time?: number;
  multipleChoice?: ChallengeMultipleChoiceShape;
  preQuestion?: {
    prompt?: string;
    options?: ChallengeOptionShape[];
  };
}

interface ChallengeOptionShape {
  label: string;
  challenge: ChallengeVariant;
}

interface ChallengeMultipleChoiceShape {
  options?: string[];
  answerIndex?: number;
  explanation?: string;
}

interface NormalizedChallengeFields {
  title: string;
  prompt: string;
  rules: string[];
  points: number;
  time: number;
  multipleChoice?: ChallengeMultipleChoice;
}

const categoryMap: Record<string, ChallengeCategory> = {
  trivia: 'trivia',
  skill: 'skill',
  creative: 'creative',
  duel: 'duel',
  chaos: 'chaos',
};

const twistMap: Record<string, TwistEffectType> = {
  steal_member: 'steal_member',
  bonus_points: 'bonus_points',
  swap_scores: 'swap_scores',
  double_round: 'double_round',
  skip_turn: 'skip_turn',
};

function parseFrontmatter(markdown: string): { data: FrontmatterShape; content: string } {
  const normalized = markdown.replace(/\r\n/g, '\n');

  if (!normalized.startsWith('---\n')) {
    throw new Error('Game pack frontmatter is missing.');
  }

  const closingDelimiterIndex = normalized.indexOf('\n---\n', 4);
  if (closingDelimiterIndex === -1) {
    throw new Error('Game pack frontmatter is not closed.');
  }

  const frontmatterBlock = normalized.slice(4, closingDelimiterIndex);
  const content = normalized.slice(closingDelimiterIndex + '\n---\n'.length);
  const data = (YAML.parse(frontmatterBlock) as FrontmatterShape | null) ?? ({} as FrontmatterShape);

  return { data, content };
}

function parseSectionBlocks(content: string): Record<string, string> {
  const sections = content.split(/^##\s+/m).filter(Boolean);
  const result: Record<string, string> = {};

  for (const section of sections) {
    const [heading, ...rest] = section.split('\n');
    result[heading.trim().toLowerCase()] = rest.join('\n').trim();
  }

  return result;
}

function parseListItems(block: string): string[] {
  return block
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => line.replace(/^- /, '').trim());
}

function isFinitePositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function normalizeVariant(base: ChallengeVariant, variant: ChallengeVariant): NormalizedChallengeFields {
  return {
    title: variant.title ?? base.title ?? '',
    prompt: variant.prompt,
    rules: variant.rules ?? base.rules ?? [],
    points: isFinitePositiveNumber(variant.points) ? Math.floor(variant.points) : base.points ?? 100,
    time: isFinitePositiveNumber(variant.time) ? Math.floor(variant.time) : base.time ?? DEFAULT_CHALLENGE_TIME_SECONDS,
    multipleChoice: variant.multipleChoice ?? base.multipleChoice,
  };
}

function parseMultipleChoice(
  parsed: ChallengeMultipleChoiceShape | undefined,
  challengeTitle: string,
): ChallengeMultipleChoice | undefined {
  if (!parsed) {
    return undefined;
  }

  const options = parsed.options ?? [];
  const answerIndex = parsed.answerIndex;

  if (!Array.isArray(options) || options.length !== 4) {
    throw new Error(`Challenge multiple choice for "${challengeTitle}" must have exactly four options.`);
  }

  if (
    typeof answerIndex !== 'number' ||
    !Number.isInteger(answerIndex) ||
    answerIndex < 0 ||
    answerIndex > 3
  ) {
    throw new Error(`Challenge multiple choice answer index for "${challengeTitle}" must be between 0 and 3.`);
  }

  return {
    options: options.map((option) => option.trim()),
    answerIndex,
    explanation: parsed.explanation?.trim() || undefined,
  };
}

function parsePreQuestion(
  parsed: ChallengeDocumentShape,
  baseChallenge: ChallengeVariant,
): ChallengePreQuestion | undefined {
  if (!parsed.preQuestion) {
    return undefined;
  }

  const prompt = parsed.preQuestion.prompt?.trim();
  const options = parsed.preQuestion.options ?? [];

  if (!prompt) {
    throw new Error('Challenge pre-question prompt is missing.');
  }

  if (!Array.isArray(options) || options.length === 0) {
    throw new Error(`Challenge pre-question options are missing for "${baseChallenge.title}".`);
  }

  return {
    prompt,
    options: options.map((option, index) => {
      const label = option.label?.trim();
      const optionChallenge = option.challenge;

      if (!label) {
        throw new Error(`Challenge pre-question option label is missing at index ${index}.`);
      }

      if (!optionChallenge?.prompt?.trim()) {
        throw new Error(`Challenge pre-question option "${label}" is missing a prompt.`);
      }

      return {
        label,
        challenge: normalizeVariant(baseChallenge, optionChallenge),
      };
    }),
  };
}

function parseChallenges(block: string, category: ChallengeCategory): ChallengeCard[] {
  const normalized = block.trim();
  if (!normalized) {
    return [];
  }

  const documents = (YAML.parse(normalized) as ChallengeDocumentShape[]) ?? [];

  return documents.map((parsed, index) => {
    if (!parsed.title?.trim() || !parsed.prompt?.trim()) {
      throw new Error(`Challenge "${index + 1}" is missing required fields.`);
    }

    const challenge: ChallengeVariant = {
      title: parsed.title.trim(),
      prompt: parsed.prompt.trim(),
      rules: parsed.rules ?? [],
      points: parsed.points,
      time: parsed.time,
      multipleChoice: parseMultipleChoice(parsed.multipleChoice, parsed.title.trim()),
    };
    const normalizedChallenge = normalizeVariant(challenge, challenge);

    return {
      id: `${category}-${index + 1}`,
      category,
      title: normalizedChallenge.title,
      prompt: normalizedChallenge.prompt,
      rules: normalizedChallenge.rules,
      points: normalizedChallenge.points,
      time: normalizedChallenge.time,
      multipleChoice: normalizedChallenge.multipleChoice,
      preQuestion: parsePreQuestion(parsed, normalizedChallenge),
    };
  });
}

function parseTwists(block: string): TwistCard[] {
  const normalized = block.trim();
  if (!normalized) {
    return [];
  }

  const documents = (YAML.parse(normalized) as Array<{
    title: string;
    description: string;
    effectType: TwistEffectType;
    value?: number;
  }>) ?? [];

  return documents.map((parsed, index) => {
    if (!(parsed.effectType in twistMap)) {
      throw new Error(`Unsupported twist effect: ${parsed.effectType}`);
    }

    return {
      id: `twist-${index + 1}`,
      title: parsed.title,
      description: parsed.description,
      effectType: parsed.effectType,
      value: parsed.value,
    };
  });
}

export function parseGamePack(markdown: string): GamePack {
  const { data, content } = parseFrontmatter(markdown);
  const frontmatter = data as FrontmatterShape;

  if (!frontmatter.id || !frontmatter.title || !frontmatter.locale) {
    throw new Error('Game pack frontmatter is missing required fields.');
  }

  const sections = parseSectionBlocks(content);

  const rules = parseListItems(sections['reglas'] ?? '');
  const challenges = Object.entries(categoryMap).flatMap(([key, category]) =>
    parseChallenges(sections[`retos:${key}`] ?? '', category),
  );
  const twists = parseTwists(sections['sorpresas'] ?? '');

  return {
    id: frontmatter.id,
    title: frontmatter.title,
    locale: frontmatter.locale,
    summary: frontmatter.summary,
    rules,
    challenges,
    twists,
  };
}

export function summarizePack(pack: GamePack): string {
  return `${pack.title} · ${pack.challenges.length} retos · ${pack.twists.length} sorpresas`;
}

export function hasChallenges(markdown: string): boolean {
  return challengePattern.test(markdown);
}

export function resolveChallengeCard(challenge: ChallengeCard, optionIndex: number | null): ChallengeCard {
  if (optionIndex === null || !challenge.preQuestion) {
    return challenge;
  }

  const selectedOption = challenge.preQuestion.options[optionIndex];
  if (!selectedOption) {
    return challenge;
  }

  return {
    ...challenge,
    ...selectedOption.challenge,
    preQuestion: undefined,
    title: selectedOption.challenge.title ?? challenge.title,
    prompt: selectedOption.challenge.prompt,
    rules: selectedOption.challenge.rules ?? challenge.rules,
    points: selectedOption.challenge.points ?? challenge.points,
    time: selectedOption.challenge.time ?? challenge.time,
    multipleChoice: selectedOption.challenge.multipleChoice ?? challenge.multipleChoice,
  };
}
