/**
 * Public results log. Entries come from public/data/lab-log.json so a VPS
 * cron can refresh /data/lab-log.json without a rebuild.
 * Measured and cited findings plus informative failures. No invented tok/s.
 * The shipped seed is empty so a live server file can replace it.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const LAB_LOG_PATH = '/lab-log';
export const LAB_LOG_JSON = '/data/lab-log.json';
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

const BANNED = /Qwen2\.5|Qwen3-8B|local-desktop|amdai|amdai/i;
const HOME_PATH = /\/home\/|\/Users\/|C:\\Users\\/i;
const Q1Q2 = /\b(?:IQ[12][_-]|Q[12][_-])/i;
const KINDS = new Set<string>(Object.keys(LAB_LOG_KINDS));

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
  const setup = raw.setup && typeof raw.setup === 'object' ? raw.setup : undefined;
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

export function loadLabLogFile(cwd = process.cwd()): LabLogFile {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    join(cwd, 'public/data/lab-log.json'),
    join(cwd, 'data/lab-log.json'),
    join(here, '../../public/data/lab-log.json'),
  ];
  for (const file of candidates) {
    if (!existsSync(file)) continue;
    try {
      const parsed = JSON.parse(readFileSync(file, 'utf8')) as Partial<LabLogFile>;
      return normalizeLabLog(parsed);
    } catch {
      /* ignore */
    }
  }
  return { ...EMPTY_LAB_LOG };
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
    if (BANNED.test(blob)) errors.push(`banned:${entry.id}`);
    if (HOME_PATH.test(blob)) errors.push(`home-path:${entry.id}`);
    if (Q1Q2.test(blob)) errors.push(`q1q2:${entry.id}`);
    if (/\$\d|\bMSRP\b/.test(blob)) errors.push(`price:${entry.id}`);
  }
  const whole = JSON.stringify(file);
  if (BANNED.test(whole)) errors.push('banned');
  if (HOME_PATH.test(whole)) errors.push('home-path');
  return [...new Set(errors)];
}
