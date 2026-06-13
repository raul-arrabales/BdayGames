import YAML from 'yaml';
import type {
  ChallengeCard,
  ChallengeCategory,
  GamePack,
  TwistCard,
  TwistEffectType,
} from '../types';

interface FrontmatterShape {
  id: string;
  title: string;
  locale: 'es';
  summary?: string;
}

const challengePattern = /^- title:\s*(.+)$/gm;

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

function parseChallenges(block: string, category: ChallengeCategory): ChallengeCard[] {
  const normalized = block.trim();
  if (!normalized) {
    return [];
  }

  const documents = (YAML.parse(normalized) as Array<{
    title: string;
    prompt: string;
    rules?: string[];
    points?: number;
  }>) ?? [];

  return documents.map((parsed, index) => {
    return {
      id: `${category}-${index + 1}`,
      category,
      title: parsed.title,
      prompt: parsed.prompt,
      rules: parsed.rules ?? [],
      points: parsed.points ?? 100,
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
