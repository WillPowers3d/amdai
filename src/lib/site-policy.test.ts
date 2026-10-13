import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { parse } from 'yaml';
import { QUANTS } from './calculator';

const ROOT = new URL('../..', import.meta.url);
const SITE_DIRS = ['src/pages', 'src/components', 'src/data', 'src/content', 'src/lib'];
const SITE_EXTS = new Set(['.ts', '.astro', '.yaml', '.yml', '.md', '.mdx', '.mjs']);
const SKIP = new Set(['site-policy.test.ts', 'site-qa.ts', 'site-qa.test.ts']);

const FORBIDDEN = [
  /floor is q4/i,
  /q4 floor/i,
  /q4 and up only/i,
  /never (?:go |drop )?below q4/i,
  /do not drop below q4/i,
  /why not below q4/i,
];

function walk(dir: string, out: string[] = []): string[] {
  const abs = join(ROOT.pathname, dir);
  for (const name of readdirSync(abs)) {
    if (name === 'node_modules' || name === 'dist' || SKIP.has(name)) continue;
    const full = join(abs, name);
    const rel = join(dir, name);
    if (statSync(full).isDirectory()) walk(rel, out);
    else if (SITE_EXTS.has(extname(name)) && !name.endsWith('.test.ts')) out.push(rel);
  }
  return out;
}

describe('site quant policy', () => {
  it('never uses the old Q4-floor phrases on the site', () => {
    const files = ['README.md', ...SITE_DIRS.flatMap((dir) => walk(dir))];
    const hits: string[] = [];
    for (const file of files) {
      const text = readFileSync(join(ROOT.pathname, file), 'utf8');
      for (const [i, line] of text.split('\n').entries()) {
        for (const pat of FORBIDDEN) {
          if (pat.test(line)) hits.push(`${file}:${i + 1}:${line.trim()}`);
        }
      }
    }
    assert.deepEqual(hits, []);
  });

  it('lists Q3 options on the calculator and on every budget comparison', () => {
    const ids = QUANTS.map((q) => q.id);
    for (const required of ['q3_k_s', 'q3_k_m', 'q3_k_xl', 'iq3'] as const) {
      assert.ok(ids.includes(required), required);
    }
    const budget = parse(readFileSync(new URL('../data/budget-tiers.yaml', import.meta.url), 'utf8')) as {
      tiers: Array<{ fits: Array<{ quant: string; note: string }> }>;
    };
    const blob = JSON.stringify(budget);
    assert.match(blob, /UD-Q3_K_XL/);
    assert.match(blob, /Q3_K_M/);
    assert.match(blob, /estimate \/ community/i);
    assert.ok(budget.tiers.some((tier) => tier.fits.some((row) => /Q3/i.test(row.quant))));
  });
});
