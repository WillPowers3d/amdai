/**
 * First-mention auto-links for glossary terms, backends, models, and the house GPU.
 * Once per page. Never inside headings, code, links, nav, header, or footer.
 */

import { loadBackendsFromFs } from './backends';
import { MODEL_PAGES } from './gpu-ids';
import { GLOSSARY } from './glossary';
import { fileToUrlPath, urlPath } from './site-qa';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export type AutolinkPhrase = {
  phrase: string;
  href: string;
  id: string;
};

const SKIP_GLOSSARY_IDS = new Set([
  'amdai',
  'backend',
  'context-length',
  'quant',
  'offload',
  'prefill-decode',
  'toks',
  'house-rules',
  'instruct',
  'daily-driver',
  'fast-agent',
  'nvme',
]);

const SKIP_ALIASES = /^(engine|context|dense|split|SSD|HDD|pp|tg|Q[3-8]|bpw|32 GB|4K|32K|128K|256K|262K)$/i;

const SKIP_TAGS =
  /<(h[1-6]|a|code|pre|script|style|textarea|svg|title|header|footer|nav|head|summary|button|label)\b[^>]*>[\s\S]*?<\/\1>/gi;

function skipAlias(alias: string): boolean {
  if (alias.length < 4) return true;
  if (/^-\w/.test(alias)) return true;
  if (/^\d/.test(alias)) return true;
  if (SKIP_ALIASES.test(alias)) return true;
  return false;
}

function escapeRe(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function autolinkPhrases(): AutolinkPhrase[] {
  const out: AutolinkPhrase[] = [];
  const claimed = new Set<string>();
  const seenPhrase = new Set<string>();

  const push = (phrase: AutolinkPhrase) => {
    const key = phrase.phrase.toLowerCase();
    if (!phrase.phrase.trim() || seenPhrase.has(key)) return;
    seenPhrase.add(key);
    out.push(phrase);
  };

  for (const row of loadBackendsFromFs()) {
    const id = `backend:${row.id}`;
    push({ phrase: row.name, href: `/backends/${row.id}`, id });
    claimed.add(row.id);
    claimed.add(row.name.toLowerCase());
  }
  push({ phrase: 'llama.cpp', href: '/backends/llamacpp', id: 'backend:llamacpp' });

  for (const model of MODEL_PAGES) {
    push({ phrase: model.name, href: `/models/${model.id}`, id: `model:${model.id}` });
    claimed.add(model.id);
  }

  push({ phrase: 'Radeon AI PRO R9700', href: '/gpus/r9700', id: 'gpu:r9700' });
  push({ phrase: 'R9700', href: '/gpus/r9700', id: 'gpu:r9700' });
  claimed.add('r9700');

  for (const entry of GLOSSARY) {
    if (SKIP_GLOSSARY_IDS.has(entry.id)) continue;
    if (claimed.has(entry.id)) continue;
    const id = `glossary:${entry.id}`;
    push({ phrase: entry.term, href: `/glossary#${entry.id}`, id });
    for (const alias of entry.aliases) {
      if (skipAlias(alias)) continue;
      if (claimed.has(alias.toLowerCase())) continue;
      push({ phrase: alias, href: `/glossary#${entry.id}`, id });
    }
  }

  return out.sort((a, b) => b.phrase.length - a.phrase.length);
}

function linkPlainText(text: string, phrases: AutolinkPhrase[], used: Set<string>): string {
  for (const phrase of phrases) {
    if (used.has(phrase.id)) continue;
    const re = new RegExp(`(^|[^\\w/#-])(${escapeRe(phrase.phrase)})(?![\\w/#-])`);
    const match = re.exec(text);
    if (!match) continue;
    used.add(phrase.id);
    const before = text.slice(0, match.index) + match[1];
    const after = text.slice(match.index + match[0].length);
    const link = `<a class="autolink" href="${phrase.href}" data-autolink="${phrase.id}">${match[2]}</a>`;
    return `${linkPlainText(before, phrases, used)}${link}${linkPlainText(after, phrases, used)}`;
  }
  return text;
}

export function autolinkHtml(html: string, pagePath: string): string {
  const path = urlPath(pagePath);
  const phrases = autolinkPhrases().filter((phrase) => {
    const dest = urlPath(phrase.href.split('#')[0] || phrase.href);
    if (dest === path) return false;
    if (path === '/glossary' && phrase.id.startsWith('glossary:')) return false;
    return true;
  });

  const stash: string[] = [];
  let body = html.replace(SKIP_TAGS, (chunk) => {
    stash.push(chunk);
    return `\u0000S${stash.length - 1}\u0000`;
  });

  const used = new Set<string>();
  body = body.replace(/>([^<]+)</g, (_chunk, text: string) => `>${linkPlainText(text, phrases, used)}<`);

  return body.replace(/\u0000S(\d+)\u0000/g, (_, i) => stash[Number(i)] ?? '');
}

function walkHtml(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'pagefind' || name === '_astro') continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walkHtml(full, out);
    else if (name.endsWith('.html')) out.push(full);
  }
  return out;
}

export function applyAutolinks(root: string): number {
  let changed = 0;
  for (const file of walkHtml(root)) {
    const path = fileToUrlPath(root, file);
    const raw = readFileSync(file, 'utf8');
    const next = autolinkHtml(raw, path);
    if (next !== raw) {
      writeFileSync(file, next);
      changed += 1;
    }
  }
  return changed;
}
