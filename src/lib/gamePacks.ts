import { parseGamePack, summarizePack } from './content';
import type { GamePack, PersistedEvent } from '../types';

export interface PackBundle {
  fileName: string;
  markdown: string;
  pack: GamePack;
  summary: string;
}

const rawPackModules = import.meta.glob<string>('../content/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

function getFileName(path: string): string {
  return path.split('/').pop() ?? path;
}

function createBundle(fileName: string, markdown: string): PackBundle {
  const pack = parseGamePack(markdown);

  return {
    fileName,
    markdown,
    pack,
    summary: summarizePack(pack),
  };
}

export const builtInGamePacks: PackBundle[] = Object.entries(rawPackModules)
  .map(([path, markdown]) => createBundle(getFileName(path), markdown))
  .sort((left, right) => left.pack.title.localeCompare(right.pack.title, 'es'));

export function findBuiltInGamePack(packId: string): PackBundle | null {
  return builtInGamePacks.find((entry) => entry.pack.id === packId) ?? null;
}

export function createPackFromMarkdown(markdown: string, fileName = 'custom-pack.md'): PackBundle {
  return createBundle(fileName, markdown);
}

export function resolvePersistedPack(persisted: PersistedEvent): PackBundle | null {
  if (persisted.packMarkdown) {
    try {
      return createPackFromMarkdown(persisted.packMarkdown, persisted.packFileName ?? 'saved-pack.md');
    } catch {
      // Fall through to the built-in registry below.
    }
  }

  return findBuiltInGamePack(persisted.state.gamePackId);
}
