/**
 * /gpus/r9700/review — local-LLM review from existing run cards.
 * No Review/Offer/price schema. Street prices omitted unless live-read today.
 */

import {
  BUYER_CHECKED,
  BUYER_PUBLISHED,
  BUY_R9700_HREF,
  FLASH_REQ_PATH,
  QWEN36_REQ_PATH,
  R9700_MSRP,
  R9700_REVIEW_PATH,
  assertBuyerCopy,
  uniqueHrefs,
  type BuyerFaq,
  type BuyerLink,
  type BuyerPick,
  type BuyerSection,
  type BuyerSource,
} from './buyer-pages';

export const R9700_REVIEW_TITLE = 'Radeon AI PRO R9700 review for local LLMs';
export const R9700_REVIEW_DESCRIPTION =
  'One R9700 runs Qwen3.6-35B-A3B at about 102 tok/s and holds 262K in 32 GB. A second card does not speed that model up. Measured on the local desktop.';
export const R9700_REVIEW_H1 = 'Radeon AI PRO R9700 review for local LLMs';
export const R9700_REVIEW_KICKER = 'Measured review · llama.cpp · 256K context';

export const R9700_REVIEW_LEAD =
  'If you want the best local model that fits on one AMD card at full context, the R9700 is the card to buy: 32 GB holds Qwen3.6-35B-A3B at Q5 with the whole 262K context, and it decodes at about 100 tok/s on short prompts on the local desktop.';

export const R9700_REVIEW_ANSWER =
  'Do not buy it for gaming, do not pay a marketplace markup without checking the seller, and do not buy a second one expecting the 35B to get faster. Two cards are for running two copies at once or for big Flash-class models with DDR5 offload. Every number below is from our own run cards on the local desktop (llama.cpp Vulkan).';

export const R9700_REVIEW_SOURCES: BuyerSource[] = [
  {
    id: 'S-RESULTS',
    title: 'Official amdai-bench/run@1 cards',
    href: '/results',
    checked: BUYER_CHECKED,
    sourceDate: 'Local desktop llama.cpp Vulkan sweep',
    thirdParty: false,
  },
  {
    id: 'S-COMPARE',
    title: 'One GPU vs two — 35B matrix',
    href: '/compare',
    checked: BUYER_CHECKED,
    sourceDate: 'Rendered from the same run cards',
    thirdParty: false,
  },
  {
    id: 'S-METHOD',
    title: 'How we test',
    href: '/methodology',
    checked: BUYER_CHECKED,
    sourceDate: 'amdai-bench/run@1',
    thirdParty: false,
  },
];

export const R9700_REVIEW_HUB: BuyerLink[] = [
  { href: '/gpus/r9700', label: 'R9700 sheet' },
  { href: '/best-amd-gpu-for-llm', label: 'Best AMD GPU' },
  { href: QWEN36_REQ_PATH, label: '35B requirements' },
  { href: FLASH_REQ_PATH, label: 'Flash requirements' },
  { href: '/compare/one-vs-two-gpu', label: 'One vs two GPUs' },
  { href: '/results', label: 'Run cards' },
  { href: '/methodology', label: 'How we test' },
];

export const R9700_REVIEW_SECTIONS: BuyerSection[] = [
  {
    id: 'runs',
    title: 'What it runs (measured)',
    body: 'One R9700, Qwen3.6-35B-A3B, llama.cpp Vulkan, f16 KV, local desktop. Decode (prefill stays on the run cards). The site default, UD-Q5_K_XL, fits at 262K on one card with about 3 GB to spare (28.7 GB peak). Long context costs speed: decode falls from about 102 tok/s at a short prompt to about 44 tok/s with 262K tokens already in the cache. Prefill is about 2,700 tok/s short and about 520 tok/s at 262K depth — agent turns that resend a big prompt wait on this number.',
    table: {
      caption: 'Local desktop 35B decode tok/s on one R9700. llama.cpp Vulkan.',
      headers: ['Quant', '4K', '32K', '128K', '262K'],
      rows: [
        ['Q4_K_M', '117.7', '101.9', '72.5', '47.8'],
        ['UD-Q5_K_XL', '102.4', '90.5', '66.4', '44.4'],
        ['Q6_K', '103.2', '71.2', '54.5', '37.8'],
      ],
    },
    links: [
      { href: '/benchmarks', label: 'Full matrix' },
      { href: '/results', label: 'Run cards' },
    ],
  },
  {
    id: 'second',
    title: 'Does a second R9700 help?',
    body: 'Not for one 35B chat: splitting it across two cards is slower at every depth we measured (Q4_K_M 117.7 vs 93.3 at 4K, 47.8 vs 42.9 at 262K; UD-Q5_K_XL 102.4 vs 82.8, 44.4 vs 42.0). A second card earns its place two ways: two independent 35B copies (172–177 tok/s combined) or a much bigger model (Qwen 3.8 Flash UD-Q6_K_XL, two cards plus DDR5) at 32.6 tok/s on Strata vs 16 on llama.cpp at 262K. “35B on two cards” means one full copy per card.',
    table: {
      caption: 'One card vs layer-split on two R9700s. Local desktop.',
      headers: ['Quant × context', 'One card', 'Split across two'],
      rows: [
        ['Q4_K_M · 4K', '117.7', '93.3'],
        ['Q4_K_M · 262K', '47.8', '42.9'],
        ['UD-Q5_K_XL · 4K', '102.4', '82.8'],
        ['UD-Q5_K_XL · 262K', '44.4', '42.0'],
      ],
    },
    links: [
      { href: '/qwen36-dual', label: '35B on two cards' },
      { href: '/compare/one-vs-two-gpu', label: 'Is a second R9700 worth it?' },
    ],
  },
  {
    id: 'downsides',
    title: 'The downsides, plainly',
    body: `Price: AMD’s launch MSRP is ${R9700_MSRP}. We omit today’s street ask. If the only offer is a big marketplace markup, wait. Blower noise and heat: all board-partner cards are 2-slot blowers. Software lags NVIDIA in places — llama.cpp’s newest MoE prefill fusion and sparse flash attention for Flash-class models are on for NVIDIA (and AMD Instinct) but not for RDNA4 yet. Windows is second-class; Linux with ROCm or Vulkan is the supported path. It works as a display card, but the desktop takes some VRAM (about 0.5 GB on the local desktop) that the 262K fit needs.`,
    links: [
      { href: '/gpus/r9700', label: 'Which R9700 model' },
      { href: '/lab-log', label: 'Lab log' },
      { href: '/rocm-problems', label: 'ROCm problems' },
    ],
  },
  {
    id: 'who',
    title: 'Who should buy one',
    table: {
      caption: 'Who should buy an R9700. Buy-nothing paths first.',
      headers: ['You have', 'Our call'],
      rows: [
        ['A 24–32 GB Radeon or NVIDIA card already', 'Try the 35B on it first. Buy nothing yet.'],
        ['A 16 GB card and want the 35B at full speed and full context', 'One R9700.'],
        ['One R9700 and want it faster', 'A second card will not speed up the 35B. Buy it only for two users or for Flash with DDR5.'],
        ['A gaming-first build', 'Not this card.'],
      ],
    },
    links: [{ href: QWEN36_REQ_PATH, label: '35B requirements' }],
  },
  {
    id: 'skus',
    title: 'Board-partner cards in one place',
    body: 'ASRock Creator, ASUS Turbo, Gigabyte AI TOP, Sapphire, and XFX all ship 2-slot blowers. Length, power connector, and outputs live on the R9700 sheet. We do not invent a temperature or noise figure that is not already cited there.',
    links: [{ href: '/gpus/r9700', label: 'SKU notes on the R9700 sheet' }],
  },
];

export const R9700_REVIEW_FAQ: BuyerFaq[] = [
  {
    id: 'good',
    question: 'Is the R9700 good for local LLMs?',
    answer:
      'Yes for 32B–35B-class models at full context on one card: measured 102 tok/s (UD-Q5_K_XL, short prompt) and 44 tok/s at 262K on the local desktop.',
    links: [{ href: R9700_REVIEW_PATH, label: 'This review' }],
  },
  {
    id: 'fast',
    question: 'How fast is the R9700 in llama.cpp?',
    answer:
      '4K / 262K decode: Q4_K_M 118 / 48, UD-Q5_K_XL 102 / 44, Q6_K 103 / 38 tok/s (Vulkan, one card, local desktop).',
    links: [{ href: '/benchmarks', label: 'Benchmarks' }],
  },
  {
    id: 'two',
    question: 'Is two R9700s faster?',
    answer:
      'Not for one 35B. Yes for two concurrent copies (172–177 tok/s combined) or for bigger models with DDR5 offload.',
    links: [{ href: '/compare/one-vs-two-gpu', label: 'One vs two GPUs' }],
  },
];

export const R9700_REVIEW_PICK: BuyerPick = {
  title: 'Where to buy',
  body: `Check current stock. AMD launch MSRP is ${R9700_MSRP}. Marketplace listings use that seller’s return policy. We may earn a commission if you buy through a retailer hop; it never changes the verdict.`,
  href: BUY_R9700_HREF,
  label: 'Check R9700 listings',
};

export const REQUIRED_R9700_REVIEW_HREFS = [
  '/gpus/r9700',
  '/results',
  '/benchmarks',
  '/compare/one-vs-two-gpu',
  '/methodology',
  QWEN36_REQ_PATH,
  '/disclosure',
] as const;

export function r9700ReviewBlob(): string {
  return [
    R9700_REVIEW_TITLE,
    R9700_REVIEW_DESCRIPTION,
    R9700_REVIEW_H1,
    R9700_REVIEW_LEAD,
    R9700_REVIEW_ANSWER,
    ...R9700_REVIEW_SECTIONS.map((row) => `${row.title} ${row.body ?? ''}`),
    ...R9700_REVIEW_FAQ.map((row) => `${row.question} ${row.answer}`),
    R9700_REVIEW_PICK.body,
  ].join('\n');
}

export function r9700ReviewHrefs(): string[] {
  return uniqueHrefs([
    ...R9700_REVIEW_HUB,
    ...R9700_REVIEW_SECTIONS.flatMap((row) => row.links ?? []),
    ...R9700_REVIEW_FAQ.flatMap((row) => row.links),
    { href: R9700_REVIEW_PICK.href, label: R9700_REVIEW_PICK.label },
    { href: '/disclosure', label: 'Disclosure' },
  ]);
}

export function assertR9700ReviewValid(): string[] {
  const errors = assertBuyerCopy(r9700ReviewBlob(), 'R9700 review');
  if (R9700_REVIEW_DESCRIPTION.length < 70 || R9700_REVIEW_DESCRIPTION.length > 160) {
    errors.push(`description length ${R9700_REVIEW_DESCRIPTION.length}`);
  }
  if (!/one full copy/.test(r9700ReviewBlob())) errors.push('must explain two-card copies');
  if (!/102/.test(r9700ReviewBlob())) errors.push('must cite measured 102');
  const hrefs = r9700ReviewHrefs();
  for (const required of REQUIRED_R9700_REVIEW_HREFS) {
    if (!hrefs.includes(required)) errors.push(`missing href ${required}`);
  }
  return errors;
}

void BUYER_PUBLISHED;
