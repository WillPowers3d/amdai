/**
 * Open Graph / Twitter share cards.
 * 1200×630 PNGs in public/og/. Numbers come from official run cards only.
 */

import { oneVsTwoRows } from './local-desktop-compare';
import { type RunCard } from './run-card';

/** Public origin for absolute og:image URLs. Keep in sync with SITE_ORIGIN. */
export const OG_ORIGIN = 'https://amdai.net';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
export const OG_DIR = '/og';

export type OgCard = {
  slug: string;
  title: string;
  lede: string;
  alt: string;
  /** When true, replace lede with a cited UD-Q5 1× 4K headline if a card exists. */
  measured?: boolean;
};

export const OG_CARDS: OgCard[] = [
  {
    slug: 'home',
    title: 'Local Qwen on a R9700. Reliably.',
    lede: 'Independent consumer notes for Radeon AI',
    alt: 'AMDai — Local Qwen on a R9700. Reliably.',
    measured: true,
  },
  {
    slug: 'calculator',
    title: 'Quant + Hardware Calculator',
    lede: 'Weights, KV, and overhead vs card VRAM',
    alt: 'AMDai Quant + Hardware Calculator — estimates, not a bench',
  },
  {
    slug: 'budget',
    title: 'Setup by budget',
    lede: 'Starter through the two-R9700 Pro rig',
    alt: 'AMDai setup by budget — no invented prices',
  },
  {
    slug: 'abliterated',
    title: 'Abliterated models',
    lede: 'Educational catalog. Official instruct first.',
    alt: 'AMDai abliterated models — educational catalog',
  },
  {
    slug: 'stacks',
    title: 'Recommended stacks',
    lede: 'Daily driver and fast agent from our rig',
    alt: 'AMDai recommended stacks from the R9700 rig',
  },
  {
    slug: 'backends',
    title: 'Which backend?',
    lede: 'llama.cpp first. Strata when you need speed.',
    alt: 'AMDai backends — llama.cpp first',
  },
  {
    slug: 'gpus',
    title: 'GPU directory',
    lede: 'Radeon cards, gfx IDs, official ROCm rows',
    alt: 'AMDai GPU directory — Radeon cards and gfx IDs',
  },
  {
    slug: 'gpus-r9700',
    title: 'Radeon AI PRO R9700',
    lede: '32 GB measured 35B. One GPU vs two.',
    alt: 'AMDai Radeon AI PRO R9700 — 32 GB measured 35B',
    measured: true,
  },
  {
    slug: 'gpus-strix-halo',
    title: 'Ryzen AI Max / Strix Halo',
    lede: 'Cited shared-memory APU. Not measured on local-desktop',
    alt: 'AMDai Strix Halo — cited Ryzen AI Max+ 395 guide, not measured on local-desktop',
  },
  {
    slug: 'gpus-rx-9070-xt',
    title: 'Radeon RX 9070 XT',
    lede: '16 GB gfx1201 estimates. Not measured on local-desktop',
    alt: 'AMDai RX 9070 XT — 16 GB gfx1201 recipe sheet, not measured on local-desktop',
  },
  {
    slug: 'gpus-rx-9060-xt',
    title: 'Radeon RX 9060 XT',
    lede: '16 GB gfx1200 estimates. Not measured on local-desktop',
    alt: 'AMDai RX 9060 XT — 16 GB gfx1200 recipe sheet, not measured on local-desktop',
  },
  {
    slug: 'gpus-rx-7900-gre',
    title: 'Radeon RX 7900 GRE',
    lede: '16 GB gfx1100 estimates. Not measured on local-desktop',
    alt: 'AMDai RX 7900 GRE — 16 GB gfx1100 recipe sheet, not measured on local-desktop',
  },
  {
    slug: 'rocm',
    title: 'What is ROCm',
    lede: 'The open compute stack, in plain English',
    alt: 'AMDai — what is ROCm',
  },
  {
    slug: 'forum',
    title: 'Forum',
    lede: 'Community threads — off on this static build',
    alt: 'AMDai forum — off on this static build',
  },
  {
    slug: 'start',
    title: 'Getting started',
    lede: 'GPU → ROCm → llama.cpp → harness',
    alt: 'AMDai getting started — GPU, ROCm, llama.cpp',
  },
  {
    slug: 'setup',
    title: 'First-run setup',
    lede: 'Ubuntu 24.04+ to first token',
    alt: 'AMDai first-run setup — Ubuntu 24.04+ measured path',
  },
  {
    slug: 'setup-windows',
    title: 'Windows first-run setup',
    lede: 'Cited llama.cpp Vulkan. Not measured on local-desktop',
    alt: 'AMDai Windows setup — cited, not measured on local-desktop',
  },
  {
    slug: 'stack-lab',
    title: 'Radeon Stack Lab',
    lede: 'Packages not published yet',
    alt: 'AMDai Radeon Stack Lab — packages not published yet',
  },
  {
    slug: 'faq',
    title: 'FAQ',
    lede: 'First-time Radeon local-LLM answers',
    alt: 'AMDai FAQ — first-time Radeon local-LLM answers',
  },
  {
    slug: 'account',
    title: 'Saved rigs',
    lede: 'Optional accounts. Off unless enabled.',
    alt: 'AMDai saved rigs — optional accounts',
  },
  {
    slug: 'search',
    title: 'Search',
    lede: 'Pagefind over the living notes',
    alt: 'AMDai search',
  },
  {
    slug: 'glossary',
    title: 'Glossary',
    lede: 'Plain-English jargon for a home Radeon box',
    alt: 'AMDai glossary',
  },
  {
    slug: 'compare',
    title: 'Compare 35B',
    lede: 'One GPU vs split, and Q6 / Q5 / Q4 plus a Q3 estimate',
    alt: 'AMDai compare 35B — measured llama.cpp cards',
    measured: true,
  },
  {
    slug: 'compare-one-vs-two-gpu',
    title: 'One R9700 vs two',
    lede: 'Split across both cards — from official run cards',
    alt: 'AMDai one R9700 vs two — from official run cards',
    measured: true,
  },
  {
    slug: 'compare-q4-q5-q6',
    title: 'Q6 vs Q5 vs Q4',
    lede: 'Same 35B quants. Q3 is a labeled estimate',
    alt: 'AMDai Q6 vs Q5 vs Q4 — Q3 is a labeled estimate',
  },
  {
    slug: 'compare-radeon-vs-nvidia',
    title: 'Radeon vs NVIDIA',
    lede: 'Cited specs. Measured R9700. Empty RTX speed',
    alt: 'AMDai Radeon vs NVIDIA — cited specs, measured R9700',
    measured: true,
  },
  {
    slug: 'results',
    title: 'Official run cards',
    lede: 'amdai-bench/run@1 from amdai on local-desktop',
    alt: 'AMDai official run cards — amdai-bench/run@1',
  },
  {
    slug: 'bios',
    title: 'BIOS for local AI',
    lede: 'Above 4G, ReBAR/SAM, CSM, x8/x8 vs x16/x4',
    alt: 'AMDai BIOS for local AI',
  },
  {
    slug: 'qwen',
    title: 'Qwen 3.6 / 3.8',
    lede: 'Every current file × quant. Measured cells from cards',
    alt: 'AMDai Qwen 3.6 / 3.8 compare',
  },
  {
    slug: 'flash-ram-offload',
    title: 'Flash on DDR5',
    lede: 'Experts on system RAM. Measured DIMM speed',
    alt: 'AMDai Flash on DDR5 — measured DIMM speed',
  },
  {
    slug: 'flash-daily',
    title: 'Flash daily driver',
    lede: 'Q3–Q6 VRAM + DDR5 offload at full 262K',
    alt: 'AMDai Flash daily driver — Q3–Q6 VRAM and RAM',
  },
  {
    slug: 'qwen36-dual',
    title: '35B on two cards',
    lede: 'Split vs two copies of UD-Q5 on two R9700s',
    alt: 'AMDai 35B on two R9700s — split vs two copies',
  },
  {
    slug: 'models-qwen36',
    title: 'Qwen3.6-35B-A3B',
    lede: 'UD-Q5 on llama.cpp Vulkan. One R9700, 262K',
    alt: 'AMDai Qwen3.6-35B-A3B — measured daily driver on one R9700',
    measured: true,
  },
  {
    slug: 'models-flash',
    title: 'Qwen 3.8 Flash',
    lede: 'UD-Q6_K_XL. Strata 32.6 vs llama.cpp 16',
    alt: 'AMDai Qwen 3.8 Flash — cited Strata vs llama.cpp pair',
  },
  {
    slug: 'models',
    title: 'House models',
    lede: 'Qwen files we actually run. Contribute the rest',
    alt: 'AMDai house models — Qwen files we actually run',
  },
  {
    slug: 'multi-gpu',
    title: 'Dual / multi-GPU',
    lede: 'When a second R9700 helps. llama.cpp first',
    alt: 'AMDai dual / multi-GPU — when a second R9700 helps',
  },
  {
    slug: 'troubleshoot',
    title: 'Troubleshoot',
    lede: 'Symptom-first fixes. Cited commands only',
    alt: 'AMDai troubleshoot — symptom-first Radeon local-AI fixes',
  },
  {
    slug: 'labs',
    title: 'Community labs',
    lede: 'Cited write-ups. Not measured by AMDai',
    alt: 'AMDai community labs — cited, not measured',
  },
  {
    slug: 'labs-shannon',
    title: 'Shannon’s lab',
    lede: 'How I run my Lab. Cited, not measured by AMDai',
    alt: 'AMDai Shannon lab — cited How I run my Lab',
  },
  {
    slug: 'secure-lab',
    title: 'Secure home lab',
    lede: 'Isolated enclave. Cited, not measured by AMDai',
    alt: 'AMDai secure home lab — cited Shannon layout',
  },
  {
    slug: 'autoresearch',
    title: 'Autoresearch idea',
    lede: 'Container per GPU. Cited, not measured by AMDai',
    alt: 'AMDai autoresearch idea — cited Shannon layout',
  },
  {
    slug: 'about',
    title: 'About AMDai',
    lede: 'Independent Radeon notes. amdai on local-desktop',
    alt: 'AMDai about — independent Radeon notes from local-desktop',
  },
  {
    slug: 'methodology',
    title: 'How we test',
    lede: 'amdai-bench/run@1 cards. Estimates stay labeled',
    alt: 'AMDai how we test — amdai-bench run cards',
  },
  {
    slug: 'contact',
    title: 'Contact',
    lede: 'Honest routes. No invented inbox',
    alt: 'AMDai contact — honest routes only',
  },
  {
    slug: 'terms',
    title: 'Terms of use',
    lede: 'Informational. No warranty. You own the box',
    alt: 'AMDai terms of use',
  },
  {
    slug: 'benchmarks',
    title: 'R9700 benchmarks',
    lede: 'First-party tok/s. No leaderboard spam',
    alt: 'AMDai R9700 benchmarks — first-party tok/s',
    measured: true,
  },
  {
    slug: 'default',
    title: 'AMDai',
    lede: 'Independent Radeon AI notes. Not affiliated with AMD.',
    alt: 'AMDai — independent Radeon AI notes. Not affiliated with AMD.',
  },
];

export const REQUIRED_OG_SLUGS = [
  'home',
  'gpus-r9700',
  'benchmarks',
  'compare',
  'calculator',
  'budget',
  'setup',
  'stack-lab',
  'faq',
  'default',
] as const;

const SLUGS = new Set(OG_CARDS.map((card) => card.slug));

export function ogCardBySlug(slug: string): OgCard {
  return OG_CARDS.find((card) => card.slug === slug) ?? OG_CARDS.find((card) => card.slug === 'default')!;
}

export function ogSlug(pathname: string): string {
  if (!pathname || pathname === '/') return 'home';
  const slug = pathname.replace(/^\//, '').replace(/\/+$/, '').replace(/\//g, '-') || 'home';
  if (slug === 'rocm' || slug.startsWith('rocm-')) return 'rocm';
  if (slug === 'forum' || slug.startsWith('forum-')) return 'forum';
  if (slug === 'harnesses' || slug.startsWith('harnesses-')) return 'stacks';
  if (slug === 'backends' || slug.startsWith('backends-')) return 'backends';
  if (slug === 'results' || slug.startsWith('results-')) return 'results';
  if (slug === 'benchmarks' || slug.startsWith('benchmarks-')) return 'benchmarks';
  if (slug === 'compare' || slug.startsWith('compare-')) {
    return SLUGS.has(slug) ? slug : 'compare';
  }
  if (slug === 'gpus-r9700') return 'gpus-r9700';
  if (slug === 'gpus-strix-halo') return 'gpus-strix-halo';
  if (slug === 'gpus-rx-9070-xt') return 'gpus-rx-9070-xt';
  if (slug === 'gpus-rx-9060-xt') return 'gpus-rx-9060-xt';
  if (slug === 'gpus-rx-7900-gre') return 'gpus-rx-7900-gre';
  if (slug === 'models' || slug === 'models-qwen36' || slug === 'models-flash') return slug;
  if (slug.startsWith('models-') || slug.startsWith('gpus-') || slug.startsWith('recipes-')) {
    return 'gpus';
  }
  return SLUGS.has(slug) ? slug : 'default';
}

export function ogImagePath(pathname: string): string {
  return `${OG_DIR}/${ogSlug(pathname)}.png`;
}

export function ogImageUrl(pathname: string, origin = OG_ORIGIN): string {
  return `${origin.replace(/\/$/, '')}${ogImagePath(pathname)}`;
}

export function ogImageAlt(pathname: string): string {
  return ogCardBySlug(ogSlug(pathname)).alt;
}

function udq5OneVsTwo(cards: RunCard[]) {
  return oneVsTwoRows(cards).find((row) => row.quant === 'UD-Q5_K_XL' && row.context === 4096);
}

/** Cited UD-Q5 1× 4K headline, or null if that card is missing. Never invents tok/s. */
export function measuredOgHeadline(cards: RunCard[]): string | null {
  const row = udq5OneVsTwo(cards);
  if (!row || row.one.decode === 'not measured' || !row.one.runIds.length) return null;
  return `UD-Q5 1× 4K ${row.one.decode}`;
}

export function ogLede(slug: string, cards: RunCard[] = []): string {
  const card = ogCardBySlug(slug);
  if (!card.measured) return card.lede;
  const row = udq5OneVsTwo(cards);
  if (!row || row.one.decode === 'not measured' || !row.one.runIds.length) return card.lede;
  if (slug === 'compare' || slug === 'compare-one-vs-two-gpu') {
    if (row.both.decode !== 'not measured' && row.both.runIds.length) {
      return `UD-Q5 1× ${row.one.decode} vs split ${row.both.decode}`;
    }
  }
  if (slug === 'gpus-r9700') return `32 GB. UD-Q5 1× 4K ${row.one.decode}`;
  return `UD-Q5 1× 4K ${row.one.decode}`;
}

export function renderOgCards(cards: RunCard[] = []): Array<OgCard & { lede: string }> {
  return OG_CARDS.map((card) => ({ ...card, lede: ogLede(card.slug, cards) }));
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function assertOgValid(cards: RunCard[] = []): string[] {
  const errors: string[] = [];
  const slugs = new Set<string>();
  for (const card of OG_CARDS) {
    if (slugs.has(card.slug)) errors.push(`duplicate OG slug ${card.slug}`);
    slugs.add(card.slug);
    const blob = `${card.title} ${card.lede} ${card.alt}`;
    if (BANNED.test(blob)) errors.push(`${card.slug} banned model`);
    if (Q1Q2.test(blob)) errors.push(`${card.slug} lists Q1/Q2`);
    if (Q4_FLOOR.test(blob)) errors.push(`${card.slug} Q4-floor phrase`);
    if (/\$\d|\bMSRP\b/i.test(blob)) errors.push(`${card.slug} invented price`);
    if (!card.alt.startsWith('AMDai')) errors.push(`${card.slug} alt must start with AMDai`);
  }
  for (const required of REQUIRED_OG_SLUGS) {
    if (!slugs.has(required)) errors.push(`missing required OG slug ${required}`);
  }
  const headline = measuredOgHeadline(cards);
  if (cards.length && !headline) errors.push('missing cited UD-Q5 1× 4K decode for measured OG ledes');
  if (headline) {
    for (const slug of ['home', 'gpus-r9700', 'benchmarks', 'compare'] as const) {
      const lede = ogLede(slug, cards);
      if (!lede.includes(headline) && !/\d+(?:\.\d+)? tok\/s/.test(lede)) {
        errors.push(`${slug} measured lede missing cited tok/s`);
      }
    }
  }
  return [...new Set(errors)];
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/** 1200×630 dark ember card. Used by `npm run og`. */
export function ogCardHtml(input: { title: string; lede: string; fontHref: string }): string {
  const title = escapeHtml(input.title);
  const lede = escapeHtml(input.lede);
  const font = escapeHtml(input.fontHref);
  return `<!doctype html>
<html><head><meta charset="utf-8">
<style>
@font-face{font-family:Geist;src:url('${font}') format('woff2');font-weight:100 900;font-display:block}
body{margin:0;width:1200px;height:630px;background:#08080b;color:#f4efe8;font-family:Geist,ui-sans-serif,system-ui,sans-serif;overflow:hidden}
.grid{position:absolute;inset:0;background-image:linear-gradient(to right,#2c2724 1px,transparent 1px),linear-gradient(to bottom,#2c2724 1px,transparent 1px);background-size:40px 40px;mask-image:radial-gradient(ellipse at 80% 30%,#000 10%,transparent 70%);opacity:.7}
.glow{position:absolute;right:40px;top:40px;width:420px;height:420px;background:radial-gradient(circle,rgba(226,74,47,.28),transparent 68%)}
.inner{position:relative;padding:64px 72px}
.mark{display:flex;align-items:center;gap:14px;font-size:28px;letter-spacing:-.04em;font-weight:560}
.chip{width:28px;height:28px;border:1.6px solid #e24a2f;border-radius:6px}
.ai{color:#e24a2f}
h1{margin:48px 0 0;font-size:68px;letter-spacing:-.04em;line-height:1.02;max-width:14ch;font-weight:560}
p{margin:22px 0 0;font-size:26px;color:#b9b1a7;max-width:28ch}
.foot{position:absolute;left:72px;bottom:48px;font-size:16px;color:#7d766d}
</style></head>
<body>
<div class="grid"></div><div class="glow"></div>
<div class="inner">
  <div class="mark"><span class="chip"></span>AMD<span class="ai">ai</span></div>
  <h1>${title}</h1>
  <p>${lede}</p>
</div>
<div class="foot">Independent, not affiliated with AMD · amdai.net</div>
</body></html>`;
}
