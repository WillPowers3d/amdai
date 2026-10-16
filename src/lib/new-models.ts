/**
 * Daily open-weight release table. Rows come from public/data/new-models.json
 * (Hugging Face Hub API). Fit and Q4 size stay labeled estimates. Q1/Q2 stay off.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const NEW_MODELS_PATH = '/new-models';
export const NEW_MODELS_JSON = '/data/new-models.json';
export const NEW_MODELS_FEED = '/new-models/rss.xml';
export const NEW_MODELS_SCHEMA = 'amdai-new-models/1';
export const NEW_MODELS_WINDOW_DAYS = 90;
export const NEW_MODELS_PUBLISHED = '2026-10-16';
export const NEW_MODELS_TITLE = 'New open-weight models';
export const NEW_MODELS_H1 = 'New open-weight models';
export const NEW_MODELS_KICKER = 'Daily Hub scan · 90-day window';
export const NEW_MODELS_DESCRIPTION =
  'Daily table of new open-weight text and vision models from the Hugging Face Hub. Known labs plus trending. GGUF Q3–Q8. Q4_K_M fit is a labeled estimate.';
export const NEW_MODELS_MEASUREMENT =
  'Hugging Face Hub public /api/models listings plus model-card safetensors and config metadata. GGUF filenames from unsloth, bartowski, lmstudio-community, and ggml-org. Not llama-bench.';

export const Q4_K_M_BPW = 4.85;
export const FIT_OVERHEAD_GIB = 1.5;
export const FIT_VRAM = { '16': 16, '24': 24, '32': 32, '2x32': 64 } as const;

export const ALLOWED_QUANT_BANDS = ['Q8', 'Q6', 'Q5', 'Q4', 'Q3'] as const;
export const GGUF_PACKAGERS = ['unsloth', 'bartowski', 'lmstudio-community', 'ggml-org'] as const;

export type FitKey = keyof typeof FIT_VRAM;
export type FitVerdict = 'fits' | 'tight' | 'no' | 'unknown';
export type SizeBand = '<8B' | '8-20B' | '20-40B' | '40-80B' | '80B+' | 'unknown';

export type NewModelGguf = {
  org: string;
  repo: string;
  href: string;
  quants: string[];
};

export type NewModelRow = {
  id: string;
  name: string;
  href: string;
  maker: string;
  released: string;
  updated: string;
  params_b: number | null;
  active_params_b: number | null;
  architecture: string | null;
  context: number | null;
  license: string | null;
  modalities: string[];
  pipeline: string;
  downloads: number;
  likes: number;
  trending: boolean;
  known_org: boolean;
  gguf: NewModelGguf[];
  q4_k_m_gib: number | null;
  q4_k_m_kind: 'listed' | 'estimate' | 'unknown';
  fit: Record<FitKey, FitVerdict>;
  size_band: SizeBand;
};

export type NewModelsDay = {
  date: string;
  models: NewModelRow[];
};

export type NewModelsFile = {
  schema: typeof NEW_MODELS_SCHEMA;
  as_of: string;
  source: string;
  window_days: number;
  days: NewModelsDay[];
};

export const EMPTY_NEW_MODELS: NewModelsFile = {
  schema: NEW_MODELS_SCHEMA,
  as_of: `${NEW_MODELS_PUBLISHED}T00:00:00.000Z`,
  source: 'https://huggingface.co/api/models',
  window_days: NEW_MODELS_WINDOW_DAYS,
  days: [],
};

const BANNED_NAME = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12][_-]|Q[12][_-])/i;
const FORBIDDEN_PII = /local-desktop|amdai|amdai/i;

export function sizeBand(paramsB: number | null): SizeBand {
  if (paramsB == null || !Number.isFinite(paramsB) || paramsB <= 0) return 'unknown';
  if (paramsB < 8) return '<8B';
  if (paramsB < 20) return '8-20B';
  if (paramsB < 40) return '20-40B';
  if (paramsB < 80) return '40-80B';
  return '80B+';
}

export function estimateQ4KMGIB(paramsB: number | null): number | null {
  if (paramsB == null || !Number.isFinite(paramsB) || paramsB <= 0) return null;
  const bytes = paramsB * 1e9 * (Q4_K_M_BPW / 8);
  return Math.round((bytes / 1024 ** 3) * 10) / 10;
}

export function fitVerdict(q4Gib: number | null, vramGb: number): FitVerdict {
  if (q4Gib == null || !Number.isFinite(q4Gib) || q4Gib <= 0) return 'unknown';
  const need = q4Gib + FIT_OVERHEAD_GIB;
  if (need <= vramGb * 0.92) return 'fits';
  if (need <= vramGb) return 'tight';
  return 'no';
}

export function fitForQ4(q4Gib: number | null): Record<FitKey, FitVerdict> {
  return {
    '16': fitVerdict(q4Gib, FIT_VRAM['16']),
    '24': fitVerdict(q4Gib, FIT_VRAM['24']),
    '32': fitVerdict(q4Gib, FIT_VRAM['32']),
    '2x32': fitVerdict(q4Gib, FIT_VRAM['2x32']),
  };
}

export function quantBand(label: string): (typeof ALLOWED_QUANT_BANDS)[number] | null {
  const upper = label.toUpperCase();
  if (Q1Q2.test(upper)) return null;
  if (/\bQ8/.test(upper)) return 'Q8';
  if (/\bQ6/.test(upper)) return 'Q6';
  if (/\bQ5/.test(upper)) return 'Q5';
  if (/\bQ4/.test(upper)) return 'Q4';
  if (/\bIQ3|\bQ3/.test(upper)) return 'Q3';
  return null;
}

export function allowedQuants(labels: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const label of labels) {
    const band = quantBand(label);
    if (!band) continue;
    if (seen.has(label)) continue;
    seen.add(label);
    out.push(label);
  }
  return out;
}

export function rowAnchor(id: string): string {
  return id.replaceAll('/', '--');
}

export function flattenModels(file: NewModelsFile): NewModelRow[] {
  return file.days.flatMap((day) => day.models);
}

export function groupByDay(models: NewModelRow[]): NewModelsDay[] {
  const map = new Map<string, NewModelRow[]>();
  for (const row of models) {
    const day = row.released;
    const list = map.get(day) ?? [];
    list.push(row);
    map.set(day, list);
  }
  return [...map.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, rows]) => ({
      date,
      models: rows.sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id)),
    }));
}

export function makersOf(file: NewModelsFile): string[] {
  return [...new Set(flattenModels(file).map((row) => row.maker))].sort((a, b) => a.localeCompare(b));
}

export function loadNewModelsFile(cwd = process.cwd()): NewModelsFile {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    join(cwd, 'public/data/new-models.json'),
    join(cwd, 'data/new-models.json'),
    join(here, '../../public/data/new-models.json'),
  ];
  for (const file of candidates) {
    if (!existsSync(file)) continue;
    try {
      const parsed = JSON.parse(readFileSync(file, 'utf8')) as NewModelsFile;
      if (parsed?.schema === NEW_MODELS_SCHEMA && Array.isArray(parsed.days)) return parsed;
    } catch {
      /* ignore */
    }
  }
  return EMPTY_NEW_MODELS;
}

export function temporalCoverage(file: NewModelsFile): string {
  const dates = file.days.map((day) => day.date).filter((day) => /^\d{4}-\d{2}-\d{2}$/.test(day));
  const asOf = (file.as_of || '').slice(0, 10);
  if (!dates.length) return asOf && /^\d{4}-\d{2}-\d{2}$/.test(asOf) ? `${asOf}/${asOf}` : `${NEW_MODELS_PUBLISHED}/${NEW_MODELS_PUBLISHED}`;
  const start = dates[dates.length - 1]!;
  const end = dates[0]!;
  return `${start}/${end}`;
}

export type NewModelsFeedItem = {
  title: string;
  href: string;
  guid: string;
  date: string;
  description: string;
};

export function newModelsFeedItems(file: NewModelsFile, origin = 'https://amdai.net'): NewModelsFeedItem[] {
  const base = origin.replace(/\/$/, '');
  return flattenModels(file)
    .slice()
    .sort((a, b) => b.released.localeCompare(a.released) || b.updated.localeCompare(a.updated))
    .slice(0, 40)
    .map((row) => {
      const params = row.params_b != null ? `${row.params_b}B` : 'params not listed';
      const active = row.active_params_b != null && row.active_params_b !== row.params_b ? ` (${row.active_params_b}B active)` : '';
      const gguf = row.gguf.length ? `GGUF: ${[...new Set(row.gguf.flatMap((pack) => pack.quants))].join(', ')}.` : 'No public GGUF pack listed yet.';
      const q4 = row.q4_k_m_gib != null ? `Q4_K_M ${row.q4_k_m_kind} ${row.q4_k_m_gib} GiB.` : 'Q4_K_M size unknown.';
      return {
        title: `${row.name} · ${row.maker}`,
        href: `${base}${NEW_MODELS_PATH}#${rowAnchor(row.id)}`,
        guid: row.id,
        date: row.released,
        description: `${row.released}. ${params}${active}. ${row.architecture ?? 'architecture not listed'}. ${q4} ${gguf} Fit estimates: 16 ${row.fit['16']}, 24 ${row.fit['24']}, 32 ${row.fit['32']}, 2×32 ${row.fit['2x32']}.`,
      };
    });
}

export function renderNewModelsRss(file: NewModelsFile, origin = 'https://amdai.net'): string {
  const base = origin.replace(/\/$/, '');
  const escape = (value: string) =>
    value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
  const items = newModelsFeedItems(file, origin)
    .map((item) => {
      const link = item.href.startsWith('http') ? item.href : `${base}${item.href}`;
      return `    <item>
      <title>${escape(item.title)}</title>
      <link>${escape(link)}</link>
      <guid isPermaLink="false">${escape(item.guid)}</guid>
      <pubDate>${new Date(`${item.date}T12:00:00.000Z`).toUTCString()}</pubDate>
      <description>${escape(item.description)}</description>
    </item>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape('AMDai new open-weight models')}</title>
    <link>${escape(`${base}${NEW_MODELS_PATH}`)}</link>
    <description>${escape(NEW_MODELS_DESCRIPTION)}</description>
    <language>en-US</language>
    <atom:link href="${escape(`${base}${NEW_MODELS_FEED}`)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
}

export function assertNewModelsValid(file: NewModelsFile = loadNewModelsFile()): string[] {
  const errors: string[] = [];
  if (file.schema !== NEW_MODELS_SCHEMA) errors.push('schema');
  if (file.window_days !== NEW_MODELS_WINDOW_DAYS) errors.push('window_days');
  if (!file.source.includes('huggingface.co/api/models')) errors.push('source');
  const ids = new Set<string>();
  const blob = JSON.stringify(file);
  if (BANNED_NAME.test(blob)) errors.push('banned model');
  if (FORBIDDEN_PII.test(blob)) errors.push('scrubbed PII');
  if (/\$\d|\bMSRP\b/.test(blob)) errors.push('invented price');
  for (const day of file.days) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day.date)) errors.push(`bad day ${day.date}`);
    for (const row of day.models) {
      if (ids.has(row.id)) errors.push(`duplicate ${row.id}`);
      ids.add(row.id);
      if (row.released !== day.date) errors.push(`${row.id} day mismatch`);
      if (!row.href.startsWith('https://huggingface.co/')) errors.push(`${row.id} href`);
      if (BANNED_NAME.test(`${row.id} ${row.name}`)) errors.push(`${row.id} banned`);
      for (const pack of row.gguf) {
        if (!GGUF_PACKAGERS.includes(pack.org as (typeof GGUF_PACKAGERS)[number])) {
          errors.push(`${row.id} unexpected packager ${pack.org}`);
        }
        if (pack.quants.some((q) => !quantBand(q) || Q1Q2.test(q))) {
          errors.push(`${row.id} bad quant ${pack.quants.join(',')}`);
        }
      }
      if (row.q4_k_m_kind === 'estimate' && row.q4_k_m_gib == null) errors.push(`${row.id} estimate without size`);
    }
  }
  return [...new Set(errors)];
}
