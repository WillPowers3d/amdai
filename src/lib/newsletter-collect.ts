/**
 * Collect digest items from this repo. Dates come from cards and frontmatter.
 * Do not invent tok/s.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { dayKey, type DigestSourceItem } from './newsletter-digest';
import type { NewsletterTopicId } from './newsletter';
import { STACK_LAB_DIGEST, STACK_LAB_NAME, STACK_LAB_PUBLISHED } from './stack-lab';

function walk(dir: string, out: string[] = []): string[] {
  try {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full, out);
      else if (/\.(md|mdx|jsonl|yaml|yml)$/.test(name)) out.push(full);
    }
  } catch {
    /* missing dir */
  }
  return out;
}

function frontmatter(text: string): Record<string, unknown> {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  try {
    return (parse(match[1]!) as Record<string, unknown>) ?? {};
  } catch {
    return {};
  }
}

function item(topic: NewsletterTopicId, title: string, href: string, date: string | null, summary: string): DigestSourceItem | null {
  const day = dayKey(date);
  if (!day || !title) return null;
  return { topic, title, href, date: day, summary };
}

export function collectDigestItems(root = process.cwd()): DigestSourceItem[] {
  const items: DigestSourceItem[] = [];
  const content = join(root, 'src/content');

  for (const file of walk(join(content, 'guides'))) {
    const fm = frontmatter(readFileSync(file, 'utf8'));
    const id = file.split('/').pop()?.replace(/\.mdx?$/, '') ?? '';
    if (id === 'stack-lab') continue;
    const href = id === 'start' ? '/start' : `/${id}`;
    const row = item('guides', String(fm.title ?? ''), href, String(fm.updated ?? ''), String(fm.description ?? ''));
    if (row) items.push(row);
  }
  const stackLab = item('stack-lab', STACK_LAB_NAME, '/stack-lab', STACK_LAB_PUBLISHED, STACK_LAB_DIGEST);
  if (stackLab) items.push(stackLab);
  for (const file of walk(join(content, 'tutorials'))) {
    const fm = frontmatter(readFileSync(file, 'utf8'));
    const id = file.split('/').pop()?.replace(/\.mdx?$/, '') ?? '';
    const row = item('guides', String(fm.title ?? ''), `/tutorials/${id}`, String(fm.updated ?? ''), String(fm.description ?? ''));
    if (row) items.push(row);
  }
  for (const file of walk(join(content, 'blog'))) {
    const fm = frontmatter(readFileSync(file, 'utf8'));
    const id = file.split('/').pop()?.replace(/\.mdx?$/, '') ?? '';
    const row = item('guides', String(fm.title ?? ''), `/blog/${id}`, String(fm.updated ?? fm.pubDate ?? ''), String(fm.description ?? ''));
    if (row) items.push(row);
  }
  for (const file of walk(join(content, 'updates'))) {
    const fm = frontmatter(readFileSync(file, 'utf8'));
    const id = file.split('/').pop()?.replace(/\.mdx?$/, '') ?? '';
    const row = item('guides', String(fm.title ?? ''), `/updates#${id}`, String(fm.date ?? ''), String(fm.summary ?? ''));
    if (row) items.push(row);
  }

  const problemsPath = join(root, 'src/data/rocm-problems.yaml');
  try {
    const file = parse(readFileSync(problemsPath, 'utf8')) as {
      problems?: Array<{ id: string; title: string; summary: string; last_checked?: string; todo?: boolean }>;
    };
    for (const problem of file.problems ?? []) {
      if (problem.todo) continue;
      const row = item('problems', problem.title, `/rocm-problems/${problem.id}`, problem.last_checked ?? null, problem.summary);
      if (row) items.push(row);
    }
  } catch {
    /* skip */
  }

  for (const file of walk(join(root, 'data/runs'))) {
    if (!file.endsWith('.jsonl')) continue;
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      let raw: Record<string, unknown>;
      try {
        raw = JSON.parse(trimmed) as Record<string, unknown>;
      } catch {
        continue;
      }
      const id = typeof raw.run_id === 'string' ? raw.run_id : '';
      const finished = typeof raw.finished_at === 'string' ? raw.finished_at : null;
      const model = raw.model && typeof raw.model === 'object' ? (raw.model as Record<string, unknown>) : {};
      const name = typeof model.name === 'string' ? model.name : 'run card';
      const quant = typeof model.quant === 'string' ? model.quant : '';
      const row = item(
        'runs',
        `${name}${quant ? ` · ${quant}` : ''} · ${id}`,
        `/results/${id}`,
        finished,
        'Official amdai-bench/run@1 card.',
      );
      if (row) items.push(row);
    }
  }
  return items;
}
