/**
 * Lab Notes RSS: blog posts, dated updates, and official run cards.
 * Dates and tok/s come from frontmatter and amdai-bench/run@1 only.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { RUN_SCHEMA, type RunCard } from './run-card';
import { BRAND } from './site';

export const LAB_NOTES_FEED = '/rss.xml';
export const LAB_NOTES_FEED_TITLE = `${BRAND} Lab Notes`;

export type FeedItem = {
  title: string;
  href: string;
  guid: string;
  date: string;
  description: string;
  kind: 'post' | 'update' | 'run';
};

function walk(dir: string, out: string[] = []): string[] {
  try {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full, out);
      else if (/\.(md|mdx)$/.test(name)) out.push(full);
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

function isoDate(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return value.toISOString().slice(0, 10);
  }
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  const day = raw.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  return day;
}

function slugFrom(file: string): string {
  return file.split('/').pop()?.replace(/\.mdx?$/, '') ?? '';
}

function measuredLine(card: RunCard): string {
  const bits = [
    `${card.model.name} ${card.model.quant}`,
    `${card.config.layout}`,
    `${card.config.context_tokens} context`,
    `${card.hardware.gpu_count_used} GPU`,
  ];
  if (card.measured && card.results.decode_tps != null) bits.push(`decode ${card.results.decode_tps} tok/s`);
  if (card.measured && card.results.prefill_tps != null) bits.push(`prefill ${card.results.prefill_tps} tok/s`);
  if (card.measured && card.results.peak_vram_gb_total != null) {
    bits.push(`peak VRAM ${card.results.peak_vram_gb_total} GB`);
  }
  if (card.measured && card.results.peak_system_ram_gb != null) {
    bits.push(`peak system RAM ${card.results.peak_system_ram_gb} GB`);
  }
  if (!card.measured) bits.push('not a measured decode');
  return `${RUN_SCHEMA} · ${bits.join(' · ')}`;
}

export function collectPostItems(root = process.cwd()): FeedItem[] {
  const items: FeedItem[] = [];
  for (const file of walk(join(root, 'src/content/blog'))) {
    const fm = frontmatter(readFileSync(file, 'utf8'));
    const id = slugFrom(file);
    const date = isoDate(fm.updated) ?? isoDate(fm.pubDate);
    if (!id || !date || !fm.title) continue;
    items.push({
      title: String(fm.title),
      href: `/blog/${id}`,
      guid: `/blog/${id}`,
      date,
      description: String(fm.description ?? ''),
      kind: 'post',
    });
  }
  for (const file of walk(join(root, 'src/content/updates'))) {
    const fm = frontmatter(readFileSync(file, 'utf8'));
    const id = slugFrom(file);
    const date = isoDate(fm.date);
    if (!id || !date || !fm.title) continue;
    items.push({
      title: String(fm.title),
      href: `/updates#${id}`,
      guid: `/updates#${id}`,
      date,
      description: String(fm.summary ?? ''),
      kind: 'update',
    });
  }
  return items;
}

export function collectRunItems(cards: RunCard[]): FeedItem[] {
  return cards
    .filter((card) => card.submitted_by.verified && card.run_id)
    .map((card) => {
      const date = isoDate(card.finished_at) ?? isoDate(card.started_at) ?? isoDate(card.run_id.slice(0, 8));
      const fallback = card.run_id.match(/^(\d{4})(\d{2})(\d{2})/);
      const day = date ?? (fallback ? `${fallback[1]}-${fallback[2]}-${fallback[3]}` : null);
      if (!day) return null;
      return {
        title: `${RUN_SCHEMA} ${card.model.name} ${card.model.quant} · ${card.config.layout} · ${card.config.context_tokens}`,
        href: `/results/${card.run_id}`,
        guid: `/results/${card.run_id}`,
        date: day,
        description: measuredLine(card),
        kind: 'run' as const,
      };
    })
    .filter((item): item is FeedItem => item !== null);
}

export function collectFeedItems(cards: RunCard[], root = process.cwd()): FeedItem[] {
  return [...collectPostItems(root), ...collectRunItems(cards)].sort((a, b) => {
    if (a.date === b.date) return a.href.localeCompare(b.href);
    return a.date < b.date ? 1 : -1;
  });
}

export function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function rfc822(day: string): string {
  return new Date(`${day}T12:00:00.000Z`).toUTCString();
}

export function renderRss(items: FeedItem[], origin = 'https://amdai.net'): string {
  const base = origin.replace(/\/$/, '');
  const rows = items
    .map((item) => {
      const link = item.href.startsWith('http') ? item.href : `${base}${item.href}`;
      const guid = item.guid.startsWith('http') ? item.guid : `${base}${item.guid}`;
      return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(guid)}</guid>
      <pubDate>${rfc822(item.date)}</pubDate>
      <description>${escapeXml(item.description)}</description>
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(LAB_NOTES_FEED_TITLE)}</title>
    <link>${escapeXml(`${base}/`)}</link>
    <description>Lab Notes posts, dated updates, and official amdai-bench/run@1 cards. Independent consumer notes. Not affiliated with AMD.</description>
    <language>en-US</language>
    <atom:link href="${escapeXml(`${base}${LAB_NOTES_FEED}`)}" rel="self" type="application/rss+xml"/>
${rows}
  </channel>
</rss>
`;
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function assertFeedValid(xml: string, items: FeedItem[]): string[] {
  const errors: string[] = [];
  if (!xml.startsWith('<?xml')) errors.push('feed must be XML');
  if (!/<rss version="2.0"/.test(xml)) errors.push('feed must be RSS 2.0');
  if (!/<atom:link[^>]+rel="self"/.test(xml)) errors.push('feed must have atom self link');
  if (!xml.includes(LAB_NOTES_FEED_TITLE)) errors.push('feed must name AMDai Lab Notes');
  if (!items.some((item) => item.kind === 'post')) errors.push('feed missing blog posts');
  if (!items.some((item) => item.kind === 'update')) errors.push('feed missing updates');
  if (!items.some((item) => item.kind === 'run' && item.href.startsWith('/results/'))) {
    errors.push('feed missing run cards');
  }
  const blob = `${xml}\n${items.map((item) => `${item.title} ${item.description}`).join('\n')}`;
  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');
  if (/TODO|TBD|FIXME|lorem ipsum/i.test(blob)) errors.push('leftover copy');
  for (const item of items) {
    if (!item.title || !item.href || !item.date) errors.push(`incomplete item ${item.guid}`);
  }
  return [...new Set(errors)];
}
