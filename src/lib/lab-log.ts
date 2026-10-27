/**
 * Public results log. The repo snapshot at src/data/lab-log.json is rendered
 * into /lab-log/ at build time so AI crawlers that do not run JavaScript still
 * see entries. public/data/lab-log.json stays an empty seed: deploys keep the
 * server's live /data/ file, and the page fetches /data/lab-log.json in the
 * browser to pick up newer rows without a rebuild. loadLabLogFile() uses the
 * richest available copy (live /data/ wins when it has more rows).
 * Measured and cited findings plus informative failures. No invented tok/s.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PII_TEXT } from './pii-denylist';

export const LAB_LOG_PATH = '/lab-log';
export const LAB_LOG_JSON = '/data/lab-log.json';
export const LAB_LOG_MARKDOWN = '/lab-log.md';
export const LAB_LOG_FEED = '/lab-log/rss.xml';
export const LAB_LOG_PUBLISHED = '2026-10-23';
export const LAB_LOG_TITLE = 'Lab log';
export const LAB_LOG_H1 = 'Lab log';
export const LAB_LOG_KICKER = 'Local desktop · measured findings';
export const LAB_LOG_DESCRIPTION =
  'Public AMDai results log of measured and cited findings, plus informative failures. Dual R9700 speed and the hourly Idea lab. No invented tok/s.';

export const LAB_LOG_PROJECTS = {
  'dual-r9700': 'Dual R9700 speed',
  'idea-lab': 'Idea lab',
} as const;

export const LAB_LOG_KINDS = {
  result: 'Result',
  progress: 'Progress',
  failure: 'Failed',
} as const;

export type LabLogProjectId = keyof typeof LAB_LOG_PROJECTS | string;
export type LabLogKind = keyof typeof LAB_LOG_KINDS;

export type LabLogSetup = {
  model?: string;
  quant?: string;
  engine?: string;
  engine_version?: string;
  gpus?: string;
  context?: string;
  flags?: string;
  [key: string]: string | undefined;
};

export type LabLogMetric = {
  label: string;
  value: number | string;
  unit?: string;
};

export type LabLogEntry = {
  id: string;
  date: string;
  project: LabLogProjectId;
  kind: LabLogKind;
  title: string;
  summary: string;
  details?: string;
  setup?: LabLogSetup;
  metrics?: LabLogMetric[];
  sources?: string[];
  next?: string;
};

export type LabLogFile = {
  as_of: string;
  entries: LabLogEntry[];
};

export type LabLogDay = {
  date: string;
  entries: LabLogEntry[];
};

export const EMPTY_LAB_LOG: LabLogFile = {
  as_of: `${LAB_LOG_PUBLISHED}T00:00:00.000Z`,
  entries: [],
};

const BANNED_MODEL = /Qwen2\.5|Qwen3-8B/i;
const HOME_PATH = /\/home\/|\/Users\/|C:\\Users\\/i;
const Q1Q2_QUANT = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const GLUE_PERIOD = /([a-z]|\])\.[A-Z]/;
const Q4_FLOOR = new RegExp(
  `floor is q${'4'}|q${'4'} floor|q${'4'} and up only|never (?:go |drop )?below q${'4'}|do not drop below q${'4'}|why not below q${'4'}`,
  'i',
);
const KINDS = new Set<string>(Object.keys(LAB_LOG_KINDS));
const SETUP_ORDER = ['model', 'quant', 'engine', 'engine_version', 'gpus', 'context', 'flags'] as const;

export function projectLabel(id: string): string {
  return LAB_LOG_PROJECTS[id as keyof typeof LAB_LOG_PROJECTS] ?? id;
}

export function kindLabel(kind: string): string {
  return LAB_LOG_KINDS[kind as LabLogKind] ?? kind;
}

export function entryAnchor(id: string): string {
  return id.replaceAll('/', '--');
}

export function dayKey(iso: string): string {
  const match = iso.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1]!;
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return '';
  return new Date(parsed).toISOString().slice(0, 10);
}

export function sortEntriesNewestFirst(entries: LabLogEntry[]): LabLogEntry[] {
  return entries.slice().sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}

export function groupLabLogByDay(entries: LabLogEntry[]): LabLogDay[] {
  const map = new Map<string, LabLogEntry[]>();
  for (const entry of sortEntriesNewestFirst(entries)) {
    const day = dayKey(entry.date);
    if (!day) continue;
    const list = map.get(day) ?? [];
    list.push(entry);
    map.set(day, list);
  }
  return [...map.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, rows]) => ({ date, entries: rows }));
}

export function latestLabLogEntries(file: LabLogFile, n = 3): LabLogEntry[] {
  return sortEntriesNewestFirst(file.entries).slice(0, n);
}

export function projectsOf(file: LabLogFile): string[] {
  const known = Object.keys(LAB_LOG_PROJECTS);
  const extra = file.entries.map((entry) => entry.project).filter((id) => !known.includes(id));
  return [...known, ...[...new Set(extra)].sort((a, b) => a.localeCompare(b))];
}

function isIso(value: string): boolean {
  return Number.isFinite(Date.parse(value));
}

function normalizeEntry(raw: Partial<LabLogEntry>): LabLogEntry | null {
  if (!raw?.id || !raw.date || !raw.project || !raw.kind || !raw.title || !raw.summary) return null;
  if (!KINDS.has(raw.kind)) return null;
  const setup =
    raw.setup && typeof raw.setup === 'object'
      ? Object.fromEntries(
          Object.entries(raw.setup).filter(([, value]) => typeof value === 'string' && value.trim()),
        )
      : undefined;
  const metrics = Array.isArray(raw.metrics)
    ? raw.metrics.filter((row) => row && typeof row.label === 'string' && row.value != null)
    : undefined;
  const sources = Array.isArray(raw.sources)
    ? raw.sources.filter((href) => typeof href === 'string' && /^https?:\/\//i.test(href))
    : undefined;
  return {
    id: String(raw.id),
    date: String(raw.date),
    project: String(raw.project),
    kind: raw.kind,
    title: String(raw.title),
    summary: String(raw.summary),
    details: raw.details ? String(raw.details) : undefined,
    setup,
    metrics: metrics?.length ? metrics : undefined,
    sources: sources?.length ? sources : undefined,
    next: raw.next ? String(raw.next) : undefined,
  };
}

export function normalizeLabLog(raw: Partial<LabLogFile> | null | undefined): LabLogFile {
  if (!raw || !Array.isArray(raw.entries)) return { ...EMPTY_LAB_LOG };
  const entries = raw.entries.map(normalizeEntry).filter((row): row is LabLogEntry => row != null);
  return {
    as_of: typeof raw.as_of === 'string' && isIso(raw.as_of) ? raw.as_of : EMPTY_LAB_LOG.as_of,
    entries: sortEntriesNewestFirst(entries),
  };
}

export function labLogCandidates(cwd = process.cwd()): string[] {
  const here = dirname(fileURLToPath(import.meta.url));
  return [
    join(cwd, 'src/data/lab-log.json'),
    join(here, '../data/lab-log.json'),
    join(cwd, 'data/lab-log.json'),
    join(here, '../../data/lab-log.json'),
    join(cwd, 'public/data/lab-log.json'),
    join(here, '../../public/data/lab-log.json'),
  ];
}

export function loadLabLogFile(cwd = process.cwd()): LabLogFile {
  let best: LabLogFile = { ...EMPTY_LAB_LOG };
  const seen = new Set<string>();
  for (const file of labLogCandidates(cwd)) {
    if (seen.has(file) || !existsSync(file)) continue;
    seen.add(file);
    try {
      const parsed = normalizeLabLog(JSON.parse(readFileSync(file, 'utf8')) as Partial<LabLogFile>);
      if (parsed.entries.length > best.entries.length) best = parsed;
    } catch {
      /* ignore */
    }
  }
  return best;
}

export function setupRows(setup?: LabLogSetup | null): Array<[string, string]> {
  if (!setup || typeof setup !== 'object') return [];
  const rows: Array<[string, string]> = [];
  const seen = new Set<string>();
  const preferred: Array<[string, string | undefined]> = [
    ['Model', setup.model],
    ['Quant', setup.quant],
    ['Engine', setup.engine],
    ['Engine version', setup.engine_version],
    ['GPUs', setup.gpus],
    ['Context', setup.context],
    ['Flags', setup.flags],
  ];
  for (const [label, value] of preferred) {
    if (!value) continue;
    rows.push([label, value]);
    seen.add(label.toLowerCase().replace(/\s+/g, '_'));
  }
  for (const key of Object.keys(setup)) {
    if ((SETUP_ORDER as readonly string[]).includes(key) || seen.has(key)) continue;
    const value = setup[key];
    if (!value) continue;
    const label = key.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    rows.push([label, value]);
    seen.add(key);
  }
  return rows;
}

function entryBlob(entry: LabLogEntry): string {
  return [
    entry.id,
    entry.title,
    entry.summary,
    entry.details ?? '',
    entry.next ?? '',
    JSON.stringify(entry.setup ?? {}),
    JSON.stringify(entry.metrics ?? []),
    (entry.sources ?? []).join(' '),
  ].join('\n');
}

/** Rows safe to bake into static HTML (site-qa forbids a few tokens in visible text). */
export function isLabLogHtmlSafe(entry: LabLogEntry): boolean {
  const blob = entryBlob(entry);
  if (BANNED_MODEL.test(blob)) return false;
  if (HOME_PATH.test(blob)) return false;
  if (PII_TEXT.test(blob)) return false;
  if (Q1Q2_QUANT.test(blob)) return false;
  if (GLUE_PERIOD.test(blob)) return false;
  if (Q4_FLOOR.test(blob)) return false;
  return true;
}

export function staticLabLogEntries(file: LabLogFile): LabLogEntry[] {
  return file.entries.filter(isLabLogHtmlSafe);
}

export function labLogAsOfDay(file: LabLogFile): string {
  const fromAsOf = dayKey(file.as_of);
  const latest = file.entries[0] ? dayKey(file.entries[0].date) : '';
  return latest && latest > fromAsOf ? latest : fromAsOf || LAB_LOG_PUBLISHED;
}

export function formatMetric(row: LabLogMetric): string {
  return `${row.label}: ${row.value}${row.unit ? ` ${row.unit}` : ''}`.trim();
}

export function renderLabLogMarkdown(file: LabLogFile = loadLabLogFile(), origin = 'https://amdai.net'): string {
  const base = origin.replace(/\/$/, '');
  const lines = [
    '# AMDai lab log',
    '',
    '> Measured and cited findings on consumer Radeon (R9700) local AI, plus informative failures. Newest first.',
    '',
    `${file.entries.length} findings · as of ${labLogAsOfDay(file)}. Full HTML with anchors: ${base}${LAB_LOG_PATH}/`,
    '',
  ];
  for (const entry of file.entries) {
    const slug = entryAnchor(entry.id);
    lines.push(`## ${entry.title}`, '');
    lines.push(
      `${dayKey(entry.date)} · ${projectLabel(entry.project)} · ${kindLabel(entry.kind)} · ${base}${LAB_LOG_PATH}/#${slug}`,
      '',
      entry.summary,
      '',
    );
    if (entry.details) lines.push(entry.details, '');
    const setup = setupRows(entry.setup);
    if (setup.length) {
      for (const [label, value] of setup) lines.push(`- ${label}: ${value}`);
      lines.push('');
    }
    if (entry.metrics?.length) {
      for (const row of entry.metrics) lines.push(`- ${formatMetric(row)}`);
      lines.push('');
    }
    if (entry.sources?.length) {
      lines.push(`Sources: ${entry.sources.map((href) => `[${href}](${href})`).join(', ')}`, '');
    }
    if (entry.next) lines.push(`Next: ${entry.next}`, '');
  }
  return `${lines.join('\n').trim()}\n`;
}

export type LabLogFeedItem = {
  title: string;
  href: string;
  guid: string;
  date: string;
  description: string;
};

export function labLogFeedItems(file: LabLogFile, origin = 'https://amdai.net'): LabLogFeedItem[] {
  const base = origin.replace(/\/$/, '');
  return file.entries.slice(0, 40).map((entry) => ({
    title: entry.title,
    href: `${base}${LAB_LOG_PATH}/#${entryAnchor(entry.id)}`,
    guid: entry.id,
    date: dayKey(entry.date) || LAB_LOG_PUBLISHED,
    description: entry.summary,
  }));
}

export function renderLabLogRss(file: LabLogFile = loadLabLogFile(), origin = 'https://amdai.net'): string {
  const base = origin.replace(/\/$/, '');
  const escape = (value: string) =>
    value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
  const items = labLogFeedItems(file, origin)
    .map(
      (item) => `    <item>
      <title>${escape(item.title)}</title>
      <link>${escape(item.href)}</link>
      <guid isPermaLink="false">${escape(item.guid)}</guid>
      <pubDate>${new Date(`${item.date}T12:00:00.000Z`).toUTCString()}</pubDate>
      <description>${escape(item.description)}</description>
    </item>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape('AMDai lab log')}</title>
    <link>${escape(`${base}${LAB_LOG_PATH}/`)}</link>
    <description>${escape(LAB_LOG_DESCRIPTION)}</description>
    <language>en-US</language>
    <atom:link href="${escape(`${base}${LAB_LOG_FEED}`)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
}

export function assertLabLogValid(file: LabLogFile): string[] {
  const errors: string[] = [];
  if (!file || !Array.isArray(file.entries)) return ['entries'];
  if (!isIso(file.as_of)) errors.push('as_of');
  const ids = new Set<string>();
  for (const entry of file.entries) {
    if (!entry.id) errors.push('id');
    if (ids.has(entry.id)) errors.push(`dup:${entry.id}`);
    ids.add(entry.id);
    if (!isIso(entry.date)) errors.push(`date:${entry.id}`);
    if (!entry.project) errors.push(`project:${entry.id}`);
    if (!KINDS.has(entry.kind)) errors.push(`kind:${entry.id}`);
    if (!entry.title) errors.push(`title:${entry.id}`);
    if (!entry.summary) errors.push(`summary:${entry.id}`);
    const blob = JSON.stringify(entry);
    if (PII_TEXT.test(blob)) errors.push(`banned:${entry.id}`);
    if (HOME_PATH.test(blob)) errors.push(`home-path:${entry.id}`);
  }
  const whole = JSON.stringify(file);
  if (PII_TEXT.test(whole)) errors.push('banned');
  if (HOME_PATH.test(whole)) errors.push('home-path');
  return [...new Set(errors)];
}
