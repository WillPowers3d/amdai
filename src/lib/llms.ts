/**
 * /llms.txt and /llms-full.txt — machine-readable site summaries.
 * llmstxt.org layout. No Person data, prices, or invented tok/s.
 */

import { SITE_ORIGIN } from './seo';
import { BRAND, site } from './site';
import { SPONSOR_DESCRIPTION, SPONSOR_PATH } from './sponsor';

export type LlmsLink = { href: string; title: string; summary: string };

const SHORT: LlmsLink[] = [
  { href: '/', title: site.name, summary: site.description },
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
  { href: '/compare/radeon-vs-nvidia', title: 'Radeon vs NVIDIA', summary: 'Cited specs. Measured R9700 35B. No invented tok/s.' },
  { href: '/models', title: 'Models', summary: 'House Qwen plus cited open-weight pages. Q3 is a labeled estimate.' },
  { href: '/quants', title: 'Quants Q3–Q8', summary: 'Why Q1/Q2 stay off this notebook. Unsloth UD is the house default.' },
  { href: '/stack-lab', title: 'Stack Lab', summary: 'Ubuntu 24.04+ companion. Packages not published yet.' },
  { href: '/guides/buying-used-radeon', title: 'Buying a used Radeon', summary: 'Cited shopper checklist. No invented street prices.' },
  { href: '/guides/quantize-gguf', title: 'Make GGUF quants', summary: 'Cited llama.cpp convert + imatrix + Q6/Q5/Q4 how-to.' },
  { href: '/guides/tool-calling', title: 'Tool calling', summary: 'Cited llama.cpp tools on a Radeon GPU.' },
  { href: '/rocm', title: 'What is ROCm', summary: 'Stack, gfx IDs, Vulkan vs HIP, versions.' },
  { href: '/rocm-problems', title: 'ROCm problems', summary: 'Cited consumer ROCm issues and workarounds.' },
  { href: '/contact', title: 'Contact', summary: 'Honest routes. No invented inbox.' },
  { href: '/disclosure', title: 'Affiliate disclosure', summary: 'Amazon Associates and other programs when IDs are set.' },
  { href: '/privacy', title: 'Privacy', summary: 'What optional accounts and the digest store. No tracking pixel.' },
  { href: '/llms.txt', title: 'llms.txt', summary: 'Short machine-readable map of the key AMDai pages.' },
];

function abs(href: string): string {
  if (href.startsWith('http')) return href;
  return href === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${href}`;
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

export function renderLlmsTxt(): string {
  return [...preamble(), renderSection('Docs', SHORT), ''].join('\n').trim() + '\n';
}

export function renderLlmsFullTxt(): string {
  return [...preamble(), renderSection('Docs', llmsFullLinks()), ''].join('\n').trim() + '\n';
}

const BANNED = /Qwen2\.5|Qwen3-8B|local-desktop|amdai|amdai/i;

export function assertLlmsValid(): string[] {
  const errors: string[] = [];
  const short = renderLlmsTxt();
  const full = renderLlmsFullTxt();
  if (!short.startsWith(`# ${BRAND}`)) errors.push('llms.txt must name AMDai');
  if (!full.includes('/gpus')) errors.push('llms-full missing GPU directory');
  if (!short.includes(SPONSOR_PATH)) errors.push('llms.txt missing /sponsor');
  if (!full.includes('/llms.txt')) errors.push('llms-full should point at llms.txt');
  if (short.length >= full.length) errors.push('llms-full must be longer than llms.txt');
  for (const blob of [short, full]) {
    if (BANNED.test(blob)) errors.push('banned model or scrubbed PII');
    if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');
    if (/TODO|TBD|FIXME|lorem ipsum/i.test(blob)) errors.push('leftover copy');
    if (/"@type"\s*:\s*"Person"/i.test(blob)) errors.push('Person data');
  }
  return [...new Set(errors)];
}
