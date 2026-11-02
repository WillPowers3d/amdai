/**
 * Honest per-page modified dates for programmatic buyer pages.
 * Dates move only when the committed manifest hash of <main> changes.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export type PageHashRow = {
  hash: string;
  modified: string;
};

export type PageHashManifest = Record<string, PageHashRow>;

/** Last content-changing commit before this PR (96 GB RAM pick, 6750977). */
export const BUYER_PAGE_BASELINE = '2026-10-30';

function readManifest(): PageHashManifest {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    join(here, '../data/page-hashes.json'),
    join(process.cwd(), 'src/data/page-hashes.json'),
  ];
  for (const file of candidates) {
    if (!existsSync(file)) continue;
    try {
      const parsed = JSON.parse(readFileSync(file, 'utf8')) as PageHashManifest;
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
}

export const pageHashes: PageHashManifest = readManifest();

function lookupHash(path: string): PageHashRow | undefined {
  const trimmed = path !== '/' && path.endsWith('/') ? path.slice(0, -1) : path;
  return pageHashes[trimmed] ?? pageHashes[`${trimmed}/`] ?? pageHashes[path];
}

export function pageHashModified(path: string, published: string): string {
  const row = lookupHash(path);
  if (row?.modified && /^\d{4}-\d{2}-\d{2}$/.test(row.modified)) return row.modified;
  if (path.startsWith('/can-run') || path.startsWith('/compare/')) return BUYER_PAGE_BASELINE;
  return published;
}
