#!/usr/bin/env tsx
/**
 * Fail the build if dist still contains scrubbed PII
 * (local-desktop, amdai, amdai — case-insensitive), including file/dir names
 * that contain local-desktop. Run after astro build + pagefind.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const FORBIDDEN = /local-desktop|amdai|amdai/i;
const FORBIDDEN_NAME = /local-desktop/i;
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

const root = join(process.cwd(), process.argv[2] ?? 'dist');
if (!existsSync(join(root, 'index.html'))) {
  console.error(`pii QA: ${root}/index.html missing. Run astro build first.`);
  process.exit(1);
}

const hits: string[] = [];

function walk(dir: string): void {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const rel = relative(root, full).replaceAll('\\', '/');
    if (FORBIDDEN_NAME.test(name) || FORBIDDEN_NAME.test(rel)) {
      hits.push(`path ${rel}`);
    }
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full);
      continue;
    }
    if (BINARY_EXT.has(extname(full).toLowerCase())) continue;
    const buf = readFileSync(full);
    if (buf.includes(0)) continue;
    const text = buf.toString('utf8');
    if (!FORBIDDEN.test(text)) continue;
    const line = text.split(/\r?\n/).findIndex((row) => FORBIDDEN.test(row));
    hits.push(line >= 0 ? `${rel}:${line + 1}` : rel);
  }
}

walk(root);

if (hits.length) {
  console.error(`pii QA: ${hits.length} hit(s) for local-desktop / amdai / amdai:`);
  for (const hit of hits.slice(0, 80)) console.error(`  ${hit}`);
  if (hits.length > 80) console.error(`  … ${hits.length - 80} more`);
  process.exitCode = 1;
} else {
  console.log('pii QA: dist is clean');
}
