/**
 * Load official run cards from data/runs/*.jsonl.
 * A bad line fails the build. Vite cannot glob jsonl — walk the filesystem.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertRunSetValid, parseJsonl, type RunCard } from './run-card';

function walkJsonl(dir: string, out: { file: string; text: string }[] = []): { file: string; text: string }[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walkJsonl(full, out);
    else if (name.endsWith('.jsonl')) out.push({ file: full, text: readFileSync(full, 'utf8') });
  }
  return out;
}

function fromFs(): { file: string; text: string }[] {
  const here = fileURLToPath(import.meta.url);
  const candidates = [join(dirname(here), '../../data/runs'), join(process.cwd(), 'data/runs')];
  for (const root of candidates) {
    try {
      if (statSync(root).isDirectory()) return walkJsonl(root);
    } catch {
      /* next */
    }
  }
  return [];
}

const loaded = fromFs();
const parsed: RunCard[] = [];
for (const row of loaded) {
  parsed.push(...parseJsonl(row.text, row.file));
}

const errors = assertRunSetValid(parsed);
if (errors.length) throw new Error(`data/runs: ${errors.join('; ')}`);

/** Parsed at import. A bad run card fails the build. */
export const runs: RunCard[] = parsed;
