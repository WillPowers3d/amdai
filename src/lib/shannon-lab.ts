/**
 * Shannon (@iamMrDuncan) community lab write-up.
 * Load YAML from fs so tests never import ?raw.
 * Every published claim stays cited, not measured by AMDai.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

export const SHANNON_PUBLISHED = '2026-10-13';
export const SHANNON_CITED_LABEL = 'Cited, not measured by AMDai';

export type ShannonLink = { href: string; label: string };

export type ShannonSource = {
  title: string;
  href: string;
};

export type ShannonIdea = {
  id: string;
  group: string;
  title: string;
  body: string;
};

export type ShannonP100 = {
  title: string;
  date: string;
  href: string;
  model: string;
  decode: string;
  extras: string;
  device: string;
  note: string;
};

export type ShannonFile = {
  as_of: string;
  cited_label: string;
  author: string;
  handle: string;
  article: { title: string; date: string; href: string };
  p100_post: ShannonP100;
  sources: Record<string, ShannonSource>;
  ideas: ShannonIdea[];
};

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function firstExisting(candidates: string[]): string {
  for (const file of candidates) {
    if (existsSync(file)) return file;
  }
  throw new Error(`missing ${candidates[0]}`);
}

export function loadShannonRaw(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return readFileSync(
    firstExisting([
      join(process.cwd(), 'src/data/shannon-lab.yaml'),
      join(here, '../data/shannon-lab.yaml'),
    ]),
    'utf8',
  );
}

function asSource(value: unknown): ShannonSource {
  const rec = asRecord(value);
  return { title: asString(rec.title), href: asString(rec.href) };
}

export function parseShannonLab(raw: unknown): ShannonFile {
  const rec = asRecord(raw);
  const article = asRecord(rec.article);
  const p100 = asRecord(rec.p100_post);
  const sourcesRaw = asRecord(rec.sources);
  const sources: Record<string, ShannonSource> = {};
  for (const [id, value] of Object.entries(sourcesRaw)) {
    sources[id] = asSource(value);
  }
  const ideas: ShannonIdea[] = [];
  if (Array.isArray(rec.ideas)) {
    for (const row of rec.ideas) {
      const item = asRecord(row);
      const id = asString(item.id);
      const title = asString(item.title);
      if (!id || !title) continue;
      ideas.push({
        id,
        group: asString(item.group),
        title,
        body: asString(item.body),
      });
    }
  }
  const file: ShannonFile = {
    as_of: asString(rec.as_of),
    cited_label: asString(rec.cited_label),
    author: asString(rec.author),
    handle: asString(rec.handle),
    article: {
      title: asString(article.title),
      date: asString(article.date),
      href: asString(article.href),
    },
    p100_post: {
      title: asString(p100.title),
      date: asString(p100.date),
      href: asString(p100.href),
      model: asString(p100.model),
      decode: asString(p100.decode),
      extras: asString(p100.extras),
      device: asString(p100.device),
      note: asString(p100.note),
    },
    sources,
    ideas,
  };
  const errors = assertShannonLabValid(file);
  if (errors.length) throw new Error(`shannon-lab.yaml: ${errors.join('; ')}`);
  return file;
}

let cached: ShannonFile | null = null;

export function loadShannonLab(): ShannonFile {
  if (cached) return cached;
  cached = parseShannonLab(parse(loadShannonRaw()));
  return cached;
}

export function shannonIdeas(group?: string, file: ShannonFile = loadShannonLab()): ShannonIdea[] {
  return group ? file.ideas.filter((row) => row.group === group) : file.ideas;
}

export function shannonIdea(id: string, file: ShannonFile = loadShannonLab()): ShannonIdea | undefined {
  return file.ideas.find((row) => row.id === id);
}

export function shannonBlob(file: ShannonFile = loadShannonLab()): string {
  return [
    file.cited_label,
    file.article.title,
    ...file.ideas.map((row) => `${row.title} ${row.body}`),
    `${file.p100_post.model} ${file.p100_post.decode} ${file.p100_post.note}`,
  ].join('\n');
}

export const SHANNON_HUB_LINKS: ShannonLink[] = [
  { href: '/harnesses', label: 'Harnesses' },
  { href: '/harnesses/hermes', label: 'amdai’s Hermes' },
  { href: '/harnesses/herdr', label: 'Herdr' },
  { href: '/harnesses/coolify', label: 'Coolify' },
  { href: '/hardware', label: 'Hardware' },
  { href: '/secure-lab', label: 'Secure home lab' },
  { href: '/autoresearch', label: 'Autoresearch idea' },
  { href: '/amdai-bench', label: 'amdai-bench' },
  { href: '/credits', label: 'Credits' },
];

export const REQUIRED_SHANNON_HREFS = [
  '/harnesses',
  '/harnesses/hermes',
  '/harnesses/herdr',
  '/harnesses/coolify',
  '/hardware',
  '/secure-lab',
  '/autoresearch',
  '/amdai-bench',
  '/credits',
] as const;

export function assertShannonLabValid(file: ShannonFile): string[] {
  const errors: string[] = [];
  if (file.cited_label !== SHANNON_CITED_LABEL) errors.push('cited label drifted');
  if (file.author !== 'Shannon') errors.push('author must be Shannon');
  if (file.handle !== 'iamMrDuncan') errors.push('handle must be iamMrDuncan');
  if (!file.article.href.includes('iamMrDuncan/status/2109744566001938923')) {
    errors.push('article href must be the Oct 12 X post');
  }
  if (!file.p100_post.href.includes('iamMrDuncan/status/2107109051301568582')) {
    errors.push('P100 href must be the Oct 5 X post');
  }
  if (file.p100_post.model !== 'Qwen 3.8 27B') errors.push('P100 model must stay Qwen 3.8 27B');
  if (file.p100_post.decode !== '~33 tok/s') errors.push('P100 decode must stay the cited ~33 tok/s');
  if (!/NVIDIA/i.test(file.p100_post.device) || !/P100/.test(file.p100_post.device)) {
    errors.push('P100 device must stay NVIDIA P100');
  }
  if (!/not measured/i.test(file.p100_post.note)) errors.push('P100 note must say not measured');
  if (!/NVIDIA/i.test(file.p100_post.note)) errors.push('P100 note must say NVIDIA context');

  const ids = new Set<string>();
  const required = ['herdr', 'coolify', 'hermes-profiles', 'radeon-vii', 'p100-context', 'secure-lab', 'thermite', 'autoresearch'];
  for (const idea of file.ideas) {
    if (!idea.id || ids.has(idea.id)) errors.push(`bad or duplicate idea ${idea.id}`);
    ids.add(idea.id);
    if (!idea.body) errors.push(`${idea.id} missing body`);
  }
  for (const id of required) {
    if (!ids.has(id)) errors.push(`missing idea ${id}`);
  }

  for (const [id, source] of Object.entries(file.sources)) {
    if (!source.title) errors.push(`source ${id} missing title`);
    if (!/^https:\/\//.test(source.href)) errors.push(`source ${id} must be https`);
  }
  for (const key of ['article', 'p100', 'herdr', 'coolify', 'hermes']) {
    if (!file.sources[key]) errors.push(`missing source ${key}`);
  }

  const blob = shannonBlob(file);
  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('lists Q1/Q2');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');
  if (/coming soon/i.test(blob)) errors.push('coming-soon phrase');
  if (/\bTODO\b|\bTBD\b|\bFIXME\b/i.test(blob)) errors.push('leftover copy');
  if (!/Q3 stays a labeled estimate/i.test(blob)) errors.push('Q3 must stay a labeled estimate');
  if (!/llama\.cpp first/i.test(blob)) errors.push('must say llama.cpp first');
  if (/github\.com\/.*thermite/i.test(blob)) errors.push('do not invent a Thermite repo');

  return [...new Set(errors)];
}
