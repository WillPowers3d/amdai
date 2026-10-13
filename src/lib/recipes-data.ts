import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseRecipes, type Recipe } from './recipes';
import { measuredProofNumbers } from './run-card';
import { runs } from './run-card-data';

function walkJson(dir: string, out: { file: string; data: unknown }[] = []): { file: string; data: unknown }[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walkJson(full, out);
    else if (name.endsWith('.json')) {
      out.push({ file: full, data: JSON.parse(readFileSync(full, 'utf8')) });
    }
  }
  return out;
}

function fromFs(): { file: string; data: unknown }[] {
  const here = fileURLToPath(import.meta.url);
  const candidates = [
    join(dirname(here), '../data/recipes'),
    join(process.cwd(), 'src/data/recipes'),
  ];
  for (const root of candidates) {
    try {
      if (statSync(root).isDirectory()) return walkJson(root);
    } catch {
      /* next */
    }
  }
  return [];
}

function fromGlob(): { file: string; data: unknown }[] {
  const glob = (import.meta as ImportMeta & { glob?: (pattern: string, opts: { eager: boolean }) => Record<string, unknown> }).glob;
  if (typeof glob !== 'function') return [];
  const modules = glob('../data/recipes/**/*.json', { eager: true });
  return Object.entries(modules).map(([file, mod]) => ({
    file,
    data: mod && typeof mod === 'object' && 'default' in mod ? (mod as { default: unknown }).default : mod,
  }));
}

const raws = fromGlob();
const loaded = raws.length ? raws : fromFs();

/** Parsed at import. A bad recipe fails the build. Overnight run numbers are allowed. */
export const recipes: Recipe[] = parseRecipes(loaded, { extraProofNumbers: measuredProofNumbers(runs) });
