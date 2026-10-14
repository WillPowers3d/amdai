#!/usr/bin/env tsx
/**
 * Fail the build if dist still contains scrubbed PII
 * (local-desktop, amdai, amdai — case-insensitive).
 * Run after astro build + pagefind.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const FORBIDDEN = /local-desktop|amdai|amdai/i;
const BINARY_EXT = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.ico',
  '.woff',
  '.woff2',
  '.ttf',
  '.otf',
  '.eot',
  '.pdf',
  '.wasm',
  '.bin',
  '.mp4',
  '.webm',
  '.zip',
  '.gz',
  '.br',
]);

function isLegacyResultStub(rel: string): boolean {
  return /(?:^|\/)results\/local-desktop-/.test(rel.replaceAll('\\', '/'));
}

function walk(dir: string, files: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

const root = join(process.cwd(), process.argv[2] ?? 'dist');
if (!existsSync(join(root, 'index.html'))) {
  console.error(`pii QA: ${root}/index.html missing. Run astro build first.`);
  process.exit(1);
}

const hits: string[] = [];
for (const file of walk(root)) {
  const rel = relative(root, file);
  if (isLegacyResultStub(rel)) continue;
  if (BINARY_EXT.has(extname(file).toLowerCase())) continue;
  const buf = readFileSync(file);
  if (buf.includes(0)) continue;
  const text = buf.toString('utf8');
  if (!FORBIDDEN.test(text)) continue;
  const line = text.split(/\r?\n/).findIndex((row) => FORBIDDEN.test(row));
  hits.push(line >= 0 ? `${rel}:${line + 1}` : rel);
}

if (hits.length) {
  console.error(`pii QA: ${hits.length} file(s) still contain local-desktop / amdai / amdai:`);
  for (const hit of hits.slice(0, 80)) console.error(`  ${hit}`);
  if (hits.length > 80) console.error(`  … ${hits.length - 80} more`);
  process.exitCode = 1;
} else {
  console.log('pii QA: dist is clean');
}
