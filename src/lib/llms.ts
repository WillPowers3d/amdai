/**
 * /llms.txt and /llms-full.txt — machine-readable site summaries.
 * llmstxt.org layout. Directory URLs keep a trailing slash so crawlers skip a 308.
 * llms-full.txt is full text of key pages, not a second link list.
 * No Person data, invented prices, or invented tok/s.
 */

import { canRunSeoRows } from './can-run';
import { FAQ_ITEMS } from './faq';
import { GLOSSARY } from './glossary';
import { gpuCompareSeoRows } from './gpu-compare';
import { gpuPages } from './gpu-pages';
import { harnesses } from './harnesses-data';
import {
  LAB_LOG_MARKDOWN,
  LAB_LOG_PATH,
  labLogAsOfDay,
  loadLabLogFile,
  renderLabLogMarkdown,
} from './lab-log';
import { modelCompareSeoRows } from './model-compare';
import { PII_TEXT } from './pii-denylist';
import { liveRecipes } from './recipes';
import { recipes } from './recipes-data';
import { runs } from './run-card-data';
import { canonicalUrl, PAGE_DESCRIPTIONS, SITE_ORIGIN } from './seo';
import { BRAND, site } from './site';
import { SPONSOR_DESCRIPTION, SPONSOR_PATH } from './sponsor';

export type LlmsLink = { href: string; title: string; summary: string };

export type LlmsSection = {
  href: string;
  title: string;
  count: number;
  kind: 'pages' | 'cards' | 'entries';
  summary: string;
};

const SHORT: LlmsLink[] = [
  { href: '/', title: site.name, summary: site.description },
  {
    href: '/new-models',
    title: 'New models',
    summary: 'Daily Hugging Face Hub table of new open-weight text and vision releases. GGUF Q3–Q8. Runs-on from cited engine lists. Q4_K_M fit is a labeled estimate.',
  },
  {
    href: LAB_LOG_PATH,
    title: 'Lab log',
    summary: 'Results log of measured and cited findings, plus informative failures. Dual R9700 speed and the hourly Idea lab. No invented tok/s.',
  },
  {
    href: '/start',
    title: 'Getting started',
    summary: 'Check a rig or budget, first-run Ubuntu setup, then a measured 35B recipe.',
  },
  {
    href: '/setup',
    title: 'First-run setup',
    summary: 'Ubuntu 24.04+ to first token on a Radeon box. llama.cpp Vulkan first.',
  },
  {
    href: '/gpus',
    title: 'GPU directory',
    summary: 'Radeon cards with gfx IDs, VRAM, official ROCm rows, and tested recipes.',
  },
  {
    href: '/gpus/r9700',
    title: 'Radeon AI PRO R9700',
    summary: 'Measured 35B llama.cpp on the house 32 GB card — one GPU vs two.',
  },
  {
    href: '/backends',
    title: 'Inference engines',
    summary: 'llama.cpp first. Vulkan daily driver. Cited engines, no invented benches.',
  },
  {
    href: '/calculator',
    title: 'Quant + hardware calc',
    summary: 'Size a GGUF against Radeon VRAM. Estimates stay labeled. No prices.',
  },
  {
    href: '/benchmarks',
    title: 'Benchmarks',
    summary: 'Cited 35B llama.cpp matrix from local desktop amdai-bench/run@1 cards.',
  },
  {
    href: '/results',
    title: 'Official run cards',
    summary: 'amdai-bench/run@1 cards credited to AMDai, with the exact launch command.',
  },
  {
    href: '/methodology',
    title: 'How we test',
    summary: 'Measured vs estimate. Q3 is estimate-only. Q1/Q2 stay off.',
  },
  { href: '/faq', title: 'FAQ', summary: 'First-time Radeon questions. Points at measured pages.' },
  { href: '/glossary', title: 'Glossary', summary: 'Plain-English ROCm, GGUF, quant, and run-card terms.' },
  { href: '/about', title: 'About AMDai', summary: 'Independent notebook. Not an AMD publication.' },
  { href: '/newsletter', title: 'Lab Notes digest', summary: 'Email-only digest. Double opt-in. No tracking pixel.' },
  { href: SPONSOR_PATH, title: 'Sponsor', summary: SPONSOR_DESCRIPTION },
];

const FULL_EXTRA: LlmsLink[] = [
  { href: '/setup/windows', title: 'Windows setup', summary: 'Cited llama.cpp Vulkan first-run on Windows.' },
  { href: '/compare', title: 'Compare 35B', summary: 'One GPU vs split, Q6/Q5/Q4 plus a labeled Q3 estimate.' },
  { href: '/compare/gpus', title: 'Compare GPUs', summary: 'Pick two Radeon sheets. Fit estimates. No invented prices.' },
  { href: '/compare/models', title: 'Compare models', summary: 'Pick two house or cited model sheets. No invented tok/s.' },
  { href: '/compare/radeon-vs-nvidia', title: 'Radeon vs NVIDIA', summary: 'Cited specs. Measured R9700 35B. No invented tok/s.' },
  { href: '/can-run', title: 'Can my Radeon run it?', summary: 'Model × GPU fit pages from the same sheets as the calculator.' },
  { href: '/harnesses', title: 'Harnesses', summary: 'Local frontends that talk to a Radeon llama.cpp or Strata server.' },
  { href: '/recipes', title: 'Recipes', summary: 'First-party launch recipes: one model on one card with a sourced proof.' },
  { href: '/models', title: 'Models', summary: 'House Qwen plus cited open-weight pages. Q3 is a labeled estimate.' },
  { href: '/quants', title: 'Quants Q3–Q8', summary: 'Why Q1/Q2 stay off this notebook. Unsloth UD is the house default.' },
  { href: '/stack-lab', title: 'Stack Lab', summary: 'Ubuntu 24.04+ companion. Packages not published yet.' },
  { href: '/guides/buying-used-radeon', title: 'Buying a used Radeon', summary: 'Cited shopper checklist. No invented street prices.' },
  { href: '/guides/quantize-gguf', title: 'Make GGUF quants', summary: 'Cited llama.cpp convert + imatrix + Q6/Q5/Q4 how-to.' },
  { href: '/guides/tool-calling', title: 'Tool calling', summary: 'Cited llama.cpp tools on a Radeon GPU.' },
  { href: '/rocm', title: 'What is ROCm', summary: 'Stack, gfx IDs, Vulkan vs HIP, versions.' },
  { href: '/rocm-problems', title: 'ROCm problems', summary: 'Cited consumer ROCm issues and workarounds.' },
  { href: '/multi-gpu', title: 'Dual / multi-GPU', summary: 'Two R9700s: one model split, or two copies. Measured cards only.' },
  { href: LAB_LOG_MARKDOWN, title: 'Lab log as Markdown', summary: 'Every lab-log entry with metrics and sources, no JavaScript.' },
  { href: '/contact', title: 'Contact', summary: 'Honest routes. No invented inbox.' },
  { href: '/disclosure', title: 'Affiliate disclosure', summary: 'Amazon Associates and other programs when IDs are set.' },
  { href: '/privacy', title: 'Privacy', summary: 'What optional accounts and the digest store. No tracking pixel.' },
  { href: '/llms.txt', title: 'llms.txt', summary: 'Short machine-readable map of the key AMDai pages.' },
];

export function abs(href: string): string {
  if (href.startsWith('http')) return href;
  return canonicalUrl(href, SITE_ORIGIN);
}

function renderSection(title: string, links: LlmsLink[]): string {
  const rows = links.map((link) => `- [${link.title}](${abs(link.href)}): ${link.summary}`);
  return [`## ${title}`, '', ...rows, ''].join('\n');
}

function preamble(): string[] {
  return [
    `# ${BRAND}`,
    '',
    `> ${site.tagline}`,
    '',
    `${site.description} Measured numbers come from amdai-bench/run@1 cards on a two-R9700 local desktop. Estimates stay labeled. Q3 is estimate-only. Q1/Q2 stay off. ${BRAND} is not an AMD publication.`,
    '',
  ];
}

export function llmsShortLinks(): LlmsLink[] {
  return [...SHORT];
}

export function llmsFullLinks(): LlmsLink[] {
  const seen = new Set<string>();
  const out: LlmsLink[] = [];
  for (const link of [...SHORT, ...FULL_EXTRA]) {
    if (seen.has(link.href)) continue;
    seen.add(link.href);
    out.push(link);
  }
  return out;
}

export function llmsSections(): LlmsSection[] {
  const comparePages = 8 + gpuCompareSeoRows().length + modelCompareSeoRows().length;
  const canRunPages = 1 + canRunSeoRows().length;
  const harnessPages = 4 + harnesses().length;
  const gpuCount = gpuPages(recipes).length;
  const recipeCount = liveRecipes(recipes).length;
  const log = loadLabLogFile();
  return [
    {
      href: '/compare',
      title: 'Compare',
      count: comparePages,
      kind: 'pages',
      summary: '35B shopper questions, GPU-vs-GPU, and model-vs-model sheets.',
    },
    {
      href: '/can-run',
      title: 'Can my Radeon run it?',
      count: canRunPages,
      kind: 'pages',
      summary: 'Model × GPU fit from the same calculator sheets.',
    },
    {
      href: '/harnesses',
      title: 'Harnesses',
      count: harnessPages,
      kind: 'pages',
      summary: 'Local frontends, connect notes, quiz, and agent pages.',
    },
    {
      href: '/results',
      title: 'Official run cards',
      count: runs.length,
      kind: 'cards',
      summary: 'amdai-bench/run@1 cards credited to AMDai.',
    },
    {
      href: '/gpus',
      title: 'GPU directory',
      count: gpuCount,
      kind: 'pages',
      summary: 'Radeon sheets with gfx IDs, VRAM, and recipes.',
    },
    {
      href: '/recipes',
      title: 'Recipes',
      count: recipeCount,
      kind: 'pages',
      summary: 'First-party launch recipes with sourced proofs.',
    },
    {
      href: LAB_LOG_PATH,
      title: 'Lab log',
      count: log.entries.length,
      kind: 'entries',
      summary: `Measured and cited findings as of ${labLogAsOfDay(log)}.`,
    },
  ].filter((row) => row.count > 0);
}

function renderSections(): string {
  const rows = llmsSections().map(
    (row) => `- [${row.title}](${abs(row.href)}): ${row.count} ${row.kind} — ${row.summary}`,
  );
  return ['## Sections', '', ...rows, ''].join('\n');
}

function pageText(path: string, heading: string): string {
  const desc = PAGE_DESCRIPTIONS.get(path);
  if (!desc) return '';
  return [`### ${heading}`, '', desc, '', `Canonical: ${abs(path)}`, ''].join('\n');
}

function renderFaqText(): string {
  const rows = FAQ_ITEMS.flatMap((item) => [`### ${item.question}`, '', item.answer, '']);
  return ['## FAQ', '', ...rows, ''].join('\n');
}

function renderGlossaryText(): string {
  const rows = GLOSSARY.flatMap((entry) => [`### ${entry.term}`, '', entry.definition, '']);
  return ['## Glossary', '', ...rows, ''].join('\n');
}

function renderRecipesText(): string {
  const rows = liveRecipes(recipes).map((row) => {
    const proof = row.proof[0];
    const decode = proof?.decode != null ? `${proof.decode} tok/s` : 'decode not recorded';
    return `- [${row.model} on ${row.card}](${abs(`/recipes/${row.id}`)}): ${row.weights.quant}, ${row.backend}, ${row.ctx_label}, ${decode}.`;
  });
  return ['## Recipes', '', ...rows, ''].join('\n');
}

function renderRunCardsText(): string {
  const rows = runs.slice(0, 80).map((card) => {
    const decode = card.measured && card.results.decode_tps != null ? `${card.results.decode_tps} tok/s` : 'not a measured decode';
    return `- ${card.model.name} ${card.model.quant} · ${card.config.layout} · ${card.config.context_tokens} context · ${decode}`;
  });
  return ['## Official run cards', '', ...rows, ''].join('\n');
}

export function renderLlmsTxt(): string {
  return (
    [...preamble(), renderSection('Docs', SHORT), renderSections(), '## Full text', '', `- [Lab log as Markdown](${abs(LAB_LOG_MARKDOWN)}): every lab-log entry with metrics and sources.`, `- [llms-full.txt](${abs('/llms-full.txt')}): full text of key pages.`, '', '']
      .join('\n')
      .trim() + '\n'
  );
}

export function renderLlmsFullTxt(): string {
  const log = loadLabLogFile();
  return (
    [
      ...preamble(),
      renderSection('Docs', llmsFullLinks()),
      renderSections(),
      '## Key pages',
      '',
      pageText('/', site.name),
      pageText('/start', 'Getting started'),
      pageText('/setup', 'First-run setup'),
      pageText('/methodology', 'How we test'),
      pageText('/about', 'About AMDai'),
      pageText('/gpus', 'GPU directory'),
      pageText('/results', 'Official run cards'),
      pageText('/compare', 'Compare'),
      pageText('/can-run', 'Can my Radeon run it?'),
      pageText('/harnesses', 'Harnesses'),
      pageText('/recipes', 'Recipes'),
      renderFaqText(),
      renderGlossaryText(),
      renderRecipesText(),
      renderRunCardsText(),
      '## Lab log',
      '',
      `${log.entries.length} findings · as of ${labLogAsOfDay(log)}.`,
      '',
      renderLabLogMarkdown(log, SITE_ORIGIN),
      '',
    ]
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim() + '\n'
  );
}

const BANNED = new RegExp(`Qwen2\\.5|Qwen3-8B|${PII_TEXT.source}`, 'i');

function hrefsMissingSlash(text: string): string[] {
  const hits: string[] = [];
  for (const match of text.matchAll(/\]\((https:\/\/amdai\.net\/[^)\s]+)\)/g)) {
    const href = match[1]!;
    if (FILE_KEEP.test(href)) continue;
    if (!href.endsWith('/')) hits.push(href);
  }
  return hits;
}

const FILE_KEEP = /\.(xml|txt|json|md|xsl|svg|png|jpe?g|webp|avif|gif|ico|woff2?|ttf|css|js|mjs|html|webmanifest)(?:[#?].*)?$/i;

export function assertLlmsValid(): string[] {
  const errors: string[] = [];
  const short = renderLlmsTxt();
  const full = renderLlmsFullTxt();
  if (!short.startsWith(`# ${BRAND}`)) errors.push('llms.txt must name AMDai');
  if (!full.includes('/gpus')) errors.push('llms-full missing GPU directory');
  if (!short.includes(SPONSOR_PATH)) errors.push('llms.txt missing /sponsor');
  if (!full.includes('/llms.txt')) errors.push('llms-full should point at llms.txt');
  if (!short.includes('/compare')) errors.push('llms.txt missing /compare');
  if (!short.includes('/can-run') && !full.includes('/can-run')) errors.push('llms files missing /can-run');
  if (!full.includes('/harnesses')) errors.push('llms-full missing /harnesses');
  if (!full.includes('/recipes')) errors.push('llms-full missing /recipes');
  if (!full.includes('# AMDai lab log')) errors.push('llms-full must include the lab log text');
  if (short.length >= full.length) errors.push('llms-full must be longer than llms.txt');
  if (full.length < 20_000) errors.push('llms-full must be real full text, not a link list');
  for (const href of hrefsMissingSlash(`${short}\n${full}`)) {
    errors.push(`missing trailing slash: ${href}`);
  }
  for (const blob of [short, full]) {
    if (BANNED.test(blob) && PII_TEXT.test(blob)) errors.push('banned model or scrubbed PII');
    if (/\$\d|\bMSRP\b/i.test(blob) && /MSRP/i.test(blob)) errors.push('invented price');
    if (/TODO|TBD|FIXME|lorem ipsum/i.test(blob)) errors.push('leftover copy');
    if (/"@type"\s*:\s*"Person"/i.test(blob)) errors.push('Person data');
  }
  if (PII_TEXT.test(short) || PII_TEXT.test(full)) errors.push('scrubbed PII');
  return [...new Set(errors)];
}
