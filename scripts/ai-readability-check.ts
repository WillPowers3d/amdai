#!/usr/bin/env tsx
/**
 * Fetch built pages as a no-JS crawler would (read dist HTML, no browser).
 * Fails if lab-log entries, llms files, recipes index, or content-first
 * markup are missing. Run after astro build.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadLabLogFile, staticLabLogEntries, entryAnchor } from '../src/lib/lab-log';
import { renderLlmsFullTxt, renderLlmsTxt } from '../src/lib/llms';

const root = join(process.cwd(), process.argv[2] ?? 'dist');
const errors: string[] = [];

function read(rel: string): string {
  const file = join(root, rel);
  if (!existsSync(file)) {
    errors.push(`missing ${rel}`);
    return '';
  }
  return readFileSync(file, 'utf8');
}

function mainText(html: string): string {
  const main = html.match(/<main\b[\s\S]*?<\/main>/i)?.[0] ?? '';
  return main
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const labHtml = read('lab-log/index.html');
const file = loadLabLogFile();
const staticEntries = staticLabLogEntries(file);
if (!labHtml.includes('<main')) errors.push('lab-log missing <main>');
if (staticEntries.length < 10) errors.push(`expected static lab-log entries, got ${staticEntries.length}`);
for (const entry of staticEntries.slice(0, 12)) {
  const id = entryAnchor(entry.id);
  if (!labHtml.includes(`id="${id}"`)) errors.push(`lab-log missing article id=${id}`);
  if (!labHtml.includes(entry.title)) errors.push(`lab-log missing title ${entry.title}`);
}
const labMain = mainText(labHtml);
if (labMain.length < 8_000) errors.push(`lab-log <main> text is only ${labMain.length} chars`);

const headerIdx = labHtml.search(/<header\b/i);
const mainIdx = labHtml.search(/<main\b/i);
if (mainIdx < 0) errors.push('lab-log: no <main>');
if (headerIdx >= 0 && mainIdx > headerIdx) {
  errors.push('lab-log: <main> still follows <header> in source order');
}
if (!/class="skip-link"[^>]*href="#main"/.test(labHtml) && !/href="#main"[^>]*class="skip-link"/.test(labHtml)) {
  errors.push('lab-log missing skip link');
}

const llms = read('llms.txt') || renderLlmsTxt();
const llmsFull = read('llms-full.txt') || renderLlmsFullTxt();
if (!llms.includes('https://amdai.net/lab-log/')) errors.push('llms.txt missing trailing-slash lab-log URL');
if (!llms.includes('https://amdai.net/compare/')) errors.push('llms.txt missing /compare/');
if (!llmsFull.includes('# AMDai lab log')) errors.push('llms-full.txt is not full lab-log text');
if (llmsFull.length < 20_000) errors.push(`llms-full.txt is only ${llmsFull.length} bytes`);
for (const match of `${llms}\n${llmsFull}`.matchAll(/\]\((https:\/\/amdai\.net\/[^)\s]+)\)/g)) {
  const href = match[1]!;
  if (/\.(xml|txt|json|md|xsl|svg|png|jpe?g|webp)(?:[#?].*)?$/i.test(href)) continue;
  if (!href.endsWith('/')) errors.push(`llms link missing trailing slash: ${href}`);
}

const md = read('lab-log.md');
if (md && file.entries[0] && !md.includes(file.entries[0].title)) {
  errors.push('lab-log.md missing newest title');
}

const recipes = read('recipes/index.html');
if (!recipes.includes('<h1') || !/Recipes/i.test(recipes)) errors.push('recipes index missing heading');
if (!recipes.includes('/recipes/')) errors.push('recipes index missing recipe links');

const robots = read('robots.txt');
for (const bot of ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'PerplexityBot']) {
  if (!robots.includes(bot)) errors.push(`robots.txt missing ${bot}`);
}
if (!/sitemap:\s*https:\/\/amdai\.net\/sitemap/i.test(robots)) errors.push('robots.txt missing sitemap');
if (!robots.includes('https://amdai.net/llms.txt')) errors.push('robots.txt missing llms.txt');

const sitemap = read('sitemap-0.xml');
for (const loc of ['https://amdai.net/lab-log/', 'https://amdai.net/recipes/', 'https://amdai.net/compare/']) {
  if (sitemap && !sitemap.includes(`<loc>${loc}</loc>`)) errors.push(`sitemap missing ${loc}`);
}
if (sitemap && !/<lastmod>/.test(sitemap)) errors.push('sitemap missing lastmod');

if (errors.length) {
  console.error(`ai-readability-check: ${errors.length} issue(s)`);
  for (const row of errors) console.error(`- ${row}`);
  process.exit(1);
}

const beforeMain = headerIdx >= 0 ? Math.min(headerIdx, mainIdx) : mainIdx;
console.log(
  `ai-readability-check ok entries=${staticEntries.length} lab-main=${labMain.length}B llms-full=${llmsFull.length}B main-at=${mainIdx} chrome-at=${headerIdx < 0 ? 'n/a' : headerIdx} first-content=${beforeMain}`,
);
