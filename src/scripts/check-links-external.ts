#!/usr/bin/env tsx
/**
 * Check outbound citation and retailer URLs. Not part of the default build.
 * Flags dead, redirected, and slow links. Does not remove citations.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  classifyExternalResult,
  extractExternalHrefs,
  formatExternalReport,
  indexDist,
  SITE_ORIGIN_DEFAULT,
  writeDatedReport,
  type ExternalLinkRow,
} from '../lib/site-qa';

const DELAY_MS = 350;
const TIMEOUT_MS = 12000;
const SLOW_MS = 2500;
const RETRIES = 3;

const root = join(process.cwd(), process.argv[2] ?? 'dist');
const origin = process.env.SITE_URL || SITE_ORIGIN_DEFAULT;
const config = readFileSync(join(process.cwd(), 'astro.config.mjs'), 'utf8');
const index = indexDist(root, origin, config);
const hrefs = extractExternalHrefs(index);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchOnce(href: string): Promise<{ status: number | null; finalUrl: string | null; ms: number; error?: string }> {
  const started = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    let res = await fetch(href, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal, headers: { 'user-agent': 'amdai-link-check/1' } });
    if (res.status === 405 || res.status === 501 || res.status === 403) {
      res = await fetch(href, { method: 'GET', redirect: 'follow', signal: ctrl.signal, headers: { 'user-agent': 'amdai-link-check/1' } });
    }
    return { status: res.status, finalUrl: res.url, ms: Date.now() - started };
  } catch (err) {
    return { status: null, finalUrl: null, ms: Date.now() - started, error: err instanceof Error ? err.message : String(err) };
  } finally {
    clearTimeout(timer);
  }
}

async function checkHref(href: string): Promise<ReturnType<typeof classifyExternalResult>> {
  let last = await fetchOnce(href);
  for (let attempt = 1; attempt < RETRIES && (last.error || (last.status != null && last.status >= 500)); attempt += 1) {
    await sleep(400 * 2 ** attempt);
    last = await fetchOnce(href);
  }
  return classifyExternalResult({
    ok: !last.error && last.status != null && last.status < 400,
    status: last.status,
    finalUrl: last.finalUrl,
    requested: href,
    ms: last.ms,
    error: last.error,
    slowMs: SLOW_MS,
  });
}

const rows: ExternalLinkRow[] = [];
for (const item of hrefs) {
  const result = await checkHref(item.href);
  rows.push({ href: item.href, pages: item.pages, ...result });
  const mark = result.status === 'ok' ? 'ok' : result.status;
  console.log(`${mark.padEnd(10)} ${item.href}`);
  await sleep(DELAY_MS);
}

const asOf = new Date().toISOString().slice(0, 10);
const report = formatExternalReport(rows, asOf);
for (const path of writeDatedReport('external', report, asOf)) {
  console.log(`wrote ${path}`);
}
const flagged = rows.filter((row) => row.status !== 'ok').length;
console.log(`checked ${rows.length}, flagged ${flagged}`);
