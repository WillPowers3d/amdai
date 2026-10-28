import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const LIVE_BASE = process.env.AMDAI_API_BASE || 'https://amdai.net/api/v1';
export const FETCH_TIMEOUT_MS = Number(process.env.AMDAI_API_TIMEOUT_MS || 2500);

const here = dirname(fileURLToPath(import.meta.url));
export const SNAPSHOT_DIR = join(here, 'snapshot');

const FILES = ['index', 'gpus', 'models', 'stacks', 'measured', 'rocm-issues', 'backends'];

export function readSnapshot(name) {
  return JSON.parse(readFileSync(join(SNAPSHOT_DIR, `${name}.json`), 'utf8'));
}

export function loadSnapshotCatalog() {
  const catalog = {};
  for (const name of FILES) catalog[name] = readSnapshot(name);
  catalog.source = 'snapshot';
  return catalog;
}

export async function fetchJson(name, { base = LIVE_BASE, timeoutMs = FETCH_TIMEOUT_MS, fetchImpl = fetch } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetchImpl(`${base.replace(/\/$/, '')}/${name}.json`, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function loadCatalog(opts = {}) {
  if (opts.catalog) return { ...opts.catalog, source: opts.catalog.source || 'injected' };
  if (opts.snapshotOnly) return loadSnapshotCatalog();
  if (process.env.AMDAI_SKIP_NETWORK === '1' || process.env.SKIP_NETWORK === '1') return loadSnapshotCatalog();
  const catalog = {};
  let live = 0;
  for (const name of FILES) {
    try {
      catalog[name] = await fetchJson(name, opts);
      live += 1;
    } catch {
      catalog[name] = readSnapshot(name);
    }
  }
  catalog.source = live === FILES.length ? 'live' : live ? 'mixed' : 'snapshot';
  return catalog;
}
