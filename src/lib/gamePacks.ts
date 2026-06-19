import { parseGamePack, summarizePack } from './content';
import type { GamePack, PersistedEvent } from '../types';

export interface PackBundle {
  fileName: string;
  markdown: string;
  pack: GamePack;
  summary: string;
}

export interface BuiltInGamePackError {
  fileName: string;
  message: string;
  detail: string;
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

interface ErrorWithLocation {
  message?: string;
  linePos?: Array<{ line: number; col: number }>;
}

export function describePackParsingError(error: unknown): string {
  const fallback = 'Error desconocido al parsear el juego.';
  if (!(error instanceof Error)) {
    return fallback;
  }

  const locatedError = error as ErrorWithLocation;
  const summary = error.message.split('\n')[0]?.trim() || fallback;
  const position = locatedError.linePos?.[0];

  if (position) {
    return `Linea ${position.line}, columna ${position.col}. ${summary}`;
  }

  return summary;
}

function createEmptyPack(): GamePack {
  return {
    id: 'empty-pack',
    title: 'Sin juegos disponibles',
    locale: 'es',
    summary: 'Carga un archivo markdown valido para empezar.',
    rules: [],
    challenges: [],
    twists: [],
  };
}

export function createFallbackPackBundle(): PackBundle {
  const pack = createEmptyPack();

  return {
    fileName: 'fallback-pack.md',
    markdown: '',
    pack,
    summary: summarizePack(pack),
  };
}

export function parseBuiltInGamePacks(
  modules: Record<string, string>,
): { packs: PackBundle[]; errors: BuiltInGamePackError[] } {
  const packs: PackBundle[] = [];
  const errors: BuiltInGamePackError[] = [];

  Object.entries(modules).forEach(([path, markdown]) => {
    const fileName = getFileName(path);

    try {
      packs.push(createBundle(fileName, markdown));
    } catch (error) {
      errors.push({
        fileName,
        message: error instanceof Error ? error.message : 'Unknown pack parsing error.',
        detail: describePackParsingError(error),
      });
    }
  });

  return {
    packs: packs.sort((left, right) => left.pack.title.localeCompare(right.pack.title, 'es')),
    errors,
  };
}

const builtInPackRegistry = parseBuiltInGamePacks(rawPackModules);

export const builtInGamePacks: PackBundle[] = builtInPackRegistry.packs;
export const builtInGamePackErrors: BuiltInGamePackError[] = builtInPackRegistry.errors;

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
