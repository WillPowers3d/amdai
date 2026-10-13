/**
 * Symptom-first consumer troubleshooter.
 * Logic lives here so tests never import YAML via ?raw.
 * needs_source rows are parsed, then excluded from the published list.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

export const TROUBLESHOOT_PUBLISHED = '2026-10-13';

export type TroubleshootLink = { href: string; label: string };

export type TroubleshootCheck = {
  command: string;
  good: string;
};

export type TroubleshootCitation = {
  href: string;
  label: string;
};

export type TroubleshootGroup = {
  id: string;
  label: string;
  description: string;
};

export type TroubleshootSymptom = {
  id: string;
  group: string;
  title: string;
  symptom: string;
  checks: TroubleshootCheck[];
  causes: string[];
  fix: string;
  links: TroubleshootLink[];
  citations: TroubleshootCitation[];
  needs_source?: boolean;
};

export type TroubleshootFile = {
  as_of: string;
  rule: string;
  groups: TroubleshootGroup[];
  symptoms: TroubleshootSymptom[];
};

export const TROUBLESHOOT_GROUP_IDS = [
  'gpu-not-detected',
  'install',
  'wont-load',
  'slow',
  'crashes',
  'windows',
] as const;

export const FIRST_PARTY_CITES = [
  '/methodology',
  '/benchmarks',
  '/calculator',
  '/multi-gpu',
  '/compare',
  '/compare/one-vs-two-gpu',
  '/flash-ram-offload',
  '/results',
] as const;

export const REQUIRED_TROUBLE_HREFS = [
  '/setup',
  '/bios',
  '/rocm/versions',
  '/rocm/vulkan-hip',
  '/rocm-problems',
  '/rocm-problems/report',
  '/calculator',
  '/flash-ram-offload',
  '/multi-gpu',
  '/backends',
  '/gpus/r9700',
  '/glossary',
  '/faq',
  '/troubleshoot/errors',
  '/troubleshooting',
  '/stack-lab',
] as const;

export const TROUBLESHOOT_HUB_LINKS: TroubleshootLink[] = [
  { href: '/troubleshoot/errors', label: 'Error paste' },
  { href: '/troubleshooting', label: 'Troubleshooting guide' },
  { href: '/setup', label: 'First-run setup' },
  { href: '/rocm-problems', label: 'ROCm problems' },
  { href: '/rocm-problems/report', label: 'Write a report' },
  { href: '/bios', label: 'BIOS' },
  { href: '/faq', label: 'FAQ' },
  { href: '/glossary', label: 'Glossary' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/stack-lab', label: 'Stack Lab' },
];

export const TROUBLESHOOT_HOWTO_STEPS = [
  { name: 'Name the symptom', text: 'Start from what you see — GPU missing, install, load, speed, hang, or Windows — not from a guessed package name.' },
  { name: 'Run the quick checks', text: 'Use the exact commands on that symptom. Compare the output to the good-output note. Work top down.' },
  { name: 'Apply the ranked fix', text: 'Likely causes are listed in order. Follow the fix. llama.cpp first. Do not invent a Q3 to make a file fit.' },
  { name: 'Paste the log if you have an error string', text: 'The error matcher at /troubleshoot/errors compares against cited patterns only. A miss is a miss.' },
  { name: 'Still stuck', text: 'File a cited report at /rocm-problems/report. The forum link respects FORUM_ENABLED.' },
];

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => asString(item)).filter((item) => item.length > 0);
}

function asLinks(value: unknown): TroubleshootLink[] {
  if (!Array.isArray(value)) return [];
  const links: TroubleshootLink[] = [];
  for (const row of value) {
    const rec = asRecord(row);
    const href = asString(rec.href);
    const label = asString(rec.label);
    if (!href || !label) continue;
    links.push({ href, label });
  }
  return links;
}

function asChecks(value: unknown): TroubleshootCheck[] {
  if (!Array.isArray(value)) return [];
  const checks: TroubleshootCheck[] = [];
  for (const row of value) {
    const rec = asRecord(row);
    const command = asString(rec.command);
    const good = asString(rec.good);
    if (!command || !good) continue;
    checks.push({ command, good });
  }
  return checks;
}

function asCitations(value: unknown): TroubleshootCitation[] {
  if (!Array.isArray(value)) return [];
  const citations: TroubleshootCitation[] = [];
  for (const row of value) {
    const rec = asRecord(row);
    const href = asString(rec.href);
    const label = asString(rec.label);
    if (!href || !label) continue;
    citations.push({ href, label });
  }
  return citations;
}

function firstExisting(candidates: string[]): string {
  for (const file of candidates) {
    if (existsSync(file)) return file;
  }
  throw new Error(`missing ${candidates[0]}`);
}

export function loadTroubleshootRaw(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return readFileSync(
    firstExisting([
      join(process.cwd(), 'src/data/troubleshoot.yaml'),
      join(here, '../data/troubleshoot.yaml'),
    ]),
    'utf8',
  );
}

export function citationIsGrounded(href: string): boolean {
  if (href.startsWith('https://')) return true;
  const path = href.split('#')[0] ?? href;
  return (FIRST_PARTY_CITES as readonly string[]).includes(path);
}

export function isPublished(row: TroubleshootSymptom): boolean {
  return row.needs_source !== true;
}

export function parseTroubleshoot(raw: unknown): TroubleshootFile {
  const rec = asRecord(raw);
  const groups: TroubleshootGroup[] = [];
  if (Array.isArray(rec.groups)) {
    for (const row of rec.groups) {
      const item = asRecord(row);
      const id = asString(item.id);
      const label = asString(item.label);
      const description = asString(item.description);
      if (!id || !label) continue;
      groups.push({ id, label, description });
    }
  }

  const symptoms: TroubleshootSymptom[] = [];
  if (Array.isArray(rec.symptoms)) {
    for (const row of rec.symptoms) {
      const item = asRecord(row);
      const id = asString(item.id);
      const title = asString(item.title);
      if (!id || !title) continue;
      symptoms.push({
        id,
        group: asString(item.group),
        title,
        symptom: asString(item.symptom),
        checks: asChecks(item.checks),
        causes: asStringList(item.causes),
        fix: asString(item.fix),
        links: asLinks(item.links),
        citations: asCitations(item.citations),
        needs_source: Boolean(item.needs_source),
      });
    }
  }

  const file: TroubleshootFile = {
    as_of: asString(rec.as_of),
    rule: asString(rec.rule),
    groups,
    symptoms,
  };
  const errors = assertTroubleshootValid(file);
  if (errors.length) throw new Error(`troubleshoot.yaml: ${errors.join('; ')}`);
  return file;
}

let cached: TroubleshootFile | null = null;

export function loadTroubleshootFile(): TroubleshootFile {
  if (cached) return cached;
  cached = parseTroubleshoot(parse(loadTroubleshootRaw()));
  return cached;
}

export function publishedSymptoms(file: TroubleshootFile = loadTroubleshootFile()): TroubleshootSymptom[] {
  return file.symptoms.filter(isPublished);
}

export function symptomHaystack(item: TroubleshootSymptom, group?: TroubleshootGroup): string {
  return [
    item.id,
    item.title,
    item.symptom,
    item.fix,
    item.causes.join(' '),
    item.checks.map((check) => `${check.command} ${check.good}`).join(' '),
    group?.label,
    group?.description,
    ...item.links.map((link) => `${link.label} ${link.href}`),
    ...item.citations.map((cite) => `${cite.label} ${cite.href}`),
  ]
    .join(' ')
    .toLowerCase();
}

export function parseTroubleshootQuery(raw: string | URLSearchParams): string {
  const q =
    typeof raw === 'string'
      ? new URLSearchParams(raw.startsWith('?') ? raw.slice(1) : raw).get('q')
      : raw.get('q');
  return (q ?? '').trim();
}

export function filterSymptoms(
  query: string,
  items: TroubleshootSymptom[] = publishedSymptoms(),
  groups: TroubleshootGroup[] = loadTroubleshootFile().groups,
): TroubleshootSymptom[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => {
    const group = groups.find((row) => row.id === item.group);
    return symptomHaystack(item, group).includes(q);
  });
}

export function groupSymptoms(
  items: TroubleshootSymptom[] = publishedSymptoms(),
  groups: TroubleshootGroup[] = loadTroubleshootFile().groups,
): { group: TroubleshootGroup; items: TroubleshootSymptom[] }[] {
  return groups
    .map((group) => ({
      group,
      items: items.filter((item) => item.group === group.id),
    }))
    .filter((row) => row.items.length > 0);
}

export function troubleshootFaqItems(
  items: TroubleshootSymptom[] = publishedSymptoms(),
): { question: string; answer: string; links: TroubleshootLink[] }[] {
  return items.map((item) => ({
    question: item.title,
    answer: item.fix,
    links: item.links,
  }));
}

export function troubleshootBlob(file: TroubleshootFile = loadTroubleshootFile()): string {
  const published = publishedSymptoms(file);
  return [
    file.rule,
    ...file.groups.map((group) => `${group.label} ${group.description}`),
    ...published.map(
      (item) =>
        `${item.title} ${item.symptom} ${item.fix} ${item.causes.join(' ')} ${item.checks.map((check) => `${check.command} ${check.good}`).join(' ')}`,
    ),
    ...TROUBLESHOOT_HOWTO_STEPS.map((step) => `${step.name} ${step.text}`),
    ...TROUBLESHOOT_HUB_LINKS.map((link) => `${link.label} ${link.href}`),
  ].join('\n');
}

export function troubleshootHrefs(file: TroubleshootFile = loadTroubleshootFile()): string[] {
  const hrefs = new Set<string>();
  for (const link of TROUBLESHOOT_HUB_LINKS) hrefs.add(link.href.split('#')[0] ?? link.href);
  for (const item of publishedSymptoms(file)) {
    for (const link of item.links) hrefs.add((link.href.split('#')[0] ?? link.href).split('?')[0] ?? link.href);
  }
  return [...hrefs];
}

export function assertTroubleshootValid(file: TroubleshootFile): string[] {
  const errors: string[] = [];
  if (!file.as_of) errors.push('missing as_of');
  if (!file.rule) errors.push('missing rule');
  if (!/citation|source/i.test(file.rule)) errors.push('rule must mention citations or sources');

  const groupIds = new Set<string>();
  for (const group of file.groups) {
    if (!group.id || groupIds.has(group.id)) errors.push(`bad or duplicate group ${group.id}`);
    groupIds.add(group.id);
    if (!group.label) errors.push(`${group.id} missing label`);
  }
  for (const required of TROUBLESHOOT_GROUP_IDS) {
    if (!groupIds.has(required)) errors.push(`missing group ${required}`);
  }

  const ids = new Set<string>();
  const published = file.symptoms.filter(isPublished);
  const excluded = file.symptoms.filter((row) => row.needs_source);
  if (published.length < 12) errors.push(`expected at least 12 published symptoms, got ${published.length}`);
  if (!excluded.length) errors.push('expected at least one needs_source row to prove exclusion');

  for (const item of file.symptoms) {
    if (!item.id || ids.has(item.id)) errors.push(`bad or duplicate symptom ${item.id}`);
    ids.add(item.id);
    if (!groupIds.has(item.group)) errors.push(`${item.id} unknown group ${item.group}`);
  }

  for (const item of published) {
    if (!item.symptom) errors.push(`${item.id} missing symptom`);
    if (!item.fix) errors.push(`${item.id} missing fix`);
    if (!item.checks.length) errors.push(`${item.id} needs a command`);
    if (!item.causes.length) errors.push(`${item.id} needs ranked causes`);
    if (!item.links.some((link) => link.href.startsWith('/'))) {
      errors.push(`${item.id} needs an internal link`);
    }
    if (!item.citations.some((cite) => citationIsGrounded(cite.href))) {
      errors.push(`${item.id} needs a grounded citation`);
    }
    for (const check of item.checks) {
      if (!check.command.trim()) errors.push(`${item.id} empty command`);
      if (!check.good.trim()) errors.push(`${item.id} missing good output`);
    }
    for (const cite of item.citations) {
      if (!citationIsGrounded(cite.href)) errors.push(`${item.id} ungrounded cite ${cite.href}`);
    }
    const blob = `${item.title} ${item.symptom} ${item.fix} ${item.causes.join(' ')}`;
    if (BANNED.test(blob)) errors.push(`${item.id} banned model`);
    if (Q1Q2.test(blob)) errors.push(`${item.id} lists Q1/Q2`);
    if (Q4_FLOOR.test(blob)) errors.push(`${item.id} Q4-floor phrase`);
    if (/\$\d|\bMSRP\b/i.test(blob)) errors.push(`${item.id} invented price`);
    if (/\bTODO\b|\bTBD\b|\bFIXME\b/i.test(blob)) errors.push(`${item.id} leftover copy`);
  }

  for (const item of excluded) {
    if (published.some((row) => row.id === item.id)) errors.push(`${item.id} needs_source leaked into published`);
  }

  const hrefs = new Set<string>();
  for (const link of TROUBLESHOOT_HUB_LINKS) hrefs.add(link.href.split('#')[0] ?? link.href);
  for (const item of published) {
    for (const link of item.links) hrefs.add((link.href.split('#')[0] ?? link.href).split('?')[0] ?? link.href);
  }
  for (const required of REQUIRED_TROUBLE_HREFS) {
    const hit = [...hrefs].some((href) => href === required || href.startsWith(`${required}/`) || href.startsWith(`${required}#`));
    if (!hit) errors.push(`missing required href ${required}`);
  }

  const blob = troubleshootBlob(file);
  if (BANNED.test(blob)) errors.push('banned model in troubleshoot');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');
  if (!/Q3 is a labeled estimate/i.test(blob)) errors.push('Q3 must stay a labeled estimate');

  return [...new Set(errors)];
}
