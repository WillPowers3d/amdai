import type { AstroIntegration } from 'astro';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertHtmlTextSeparated, insertBlockSeparators } from './html-text';

function walkHtml(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'pagefind' || name === '_astro') continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walkHtml(full, out);
    else if (name.endsWith('.html')) out.push(full);
  }
  return out;
}

export function applyHtmlSeparators(root: string): string[] {
  const errors: string[] = [];
  for (const file of walkHtml(root)) {
    const raw = readFileSync(file, 'utf8');
    const next = insertBlockSeparators(raw);
    if (next !== raw) writeFileSync(file, next);
    errors.push(...assertHtmlTextSeparated(next, file));
  }
  return errors;
}

export function htmlSeparators(): AstroIntegration {
  return {
    name: 'html-separators',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const root = fileURLToPath(dir);
        const errors = applyHtmlSeparators(root);
        if (errors.length) {
          throw new Error(`Glued sentences in dist HTML:\n${errors.slice(0, 40).join('\n')}`);
        }
      },
    },
  };
}
