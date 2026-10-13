/**
 * Consumer FAQ for /faq. Parsed from the same MDX the page renders.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

function slugQuestion(question: string, used: Set<string>): string {
  const base =
    question
      .toLowerCase()
      .replace(/[`"'“”]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48) || 'question';
  let id = base;
  let n = 2;
  while (used.has(id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  used.add(id);
  return id;
}

export function parseFaqMarkdown(markdown: string): FaqItem[] {
  const body = markdown.replace(/^---[\s\S]*?---\n/, '').trim();
  const chunks = body.split(/^\*\*(.+?)\*\*\s*$/m);
  const items: FaqItem[] = [];
  const used = new Set<string>();
  for (let i = 1; i < chunks.length; i += 2) {
    const question = (chunks[i] ?? '').replace(/\s+/g, ' ').trim();
    const answer = (chunks[i + 1] ?? '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*_`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!question || !answer) continue;
    items.push({ id: slugQuestion(question, used), question, answer });
  }
  return items;
}

function loadFaqSource(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    join(here, '../content/guides/faq.mdx'),
    join(process.cwd(), 'src/content/guides/faq.mdx'),
  ];
  for (const file of candidates) {
    if (existsSync(file)) return readFileSync(file, 'utf8');
  }
  throw new Error('faq.mdx missing');
}

export const FAQ_ITEMS: FaqItem[] = parseFaqMarkdown(loadFaqSource());
