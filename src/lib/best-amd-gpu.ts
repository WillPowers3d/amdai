/**
 * /best-amd-gpu-for-llm — buyer pick page.
 * No live street prices on this ship (omit unless read today). AMD MSRP is already on site.
 */

import {
  BEST_GPU_PATH,
  BUYER_CHECKED,
  BUYER_PUBLISHED,
  BUY_R9700_HREF,
  FLASH_REQ_PATH,
  QWEN36_REQ_PATH,
  R9700_MSRP,
  assertBuyerCopy,
  uniqueHrefs,
  type BuyerFaq,
  type BuyerLink,
  type BuyerPick,
  type BuyerSection,
  type BuyerSource,
} from './buyer-pages';
import { officialLinks } from './site';

export const BEST_GPU_TITLE = 'Best AMD GPU for local LLMs (2026)';
export const BEST_GPU_DESCRIPTION =
  'Which Radeon to buy for running LLMs at home, judged at 256K context on the models people actually run. One pick per role, and when to buy nothing.';
export const BEST_GPU_H1 = 'Best AMD GPU for local LLMs';
export const BEST_GPU_KICKER = 'Buyer pick · 256K context · llama.cpp first';

export const BEST_GPU_LEAD =
  'The Radeon AI PRO R9700 (32 GB) is the cheapest new Radeon that holds our default model, Qwen3.6-35B-A3B, entirely in VRAM at its full 262K context. We measured about 102 tok/s decode at short prompts and about 44 tok/s at 262K on one card (UD-Q5_K_XL, llama.cpp) on the local desktop.';

export const BEST_GPU_ANSWER =
  'We judge every card at 256K context, because a local model with a short memory is not worth running. If a 32 GB workstation card is too much, a 16 GB RX 9060 XT runs the same 35B with part of it in system RAM. It is slower, but it works. 96 GB DDR5 is the house RAM size for most builds.';

export const BEST_GPU_SOURCES: BuyerSource[] = [
  {
    id: 'S-LAB',
    title: 'Local desktop 35B llama.cpp cards',
    href: '/benchmarks',
    checked: BUYER_CHECKED,
    sourceDate: 'Measured on the local desktop',
    thirdParty: false,
  },
  {
    id: 'S-AMD',
    title: 'AMD Radeon AI PRO R9700 product page — 32 GB, 640 GB/s, launch MSRP',
    href: officialLinks.product,
    checked: BUYER_CHECKED,
    sourceDate: `AMD launch MSRP ${R9700_MSRP}`,
    thirdParty: true,
  },
  {
    id: 'S-35B',
    title: '35B requirements at 256K',
    href: QWEN36_REQ_PATH,
    checked: BUYER_CHECKED,
    sourceDate: 'site hub',
    thirdParty: false,
  },
];

export const BEST_GPU_HUB: BuyerLink[] = [
  { href: '/gpus/r9700', label: 'R9700 sheet' },
  { href: '/gpus/r9700/review', label: 'R9700 review' },
  { href: QWEN36_REQ_PATH, label: '35B requirements' },
  { href: FLASH_REQ_PATH, label: 'Flash requirements' },
  { href: '/can-run', label: 'Can my Radeon run it?' },
  { href: '/guides/buying-used-radeon', label: 'Buying used Radeon' },
];

export const BEST_GPU_SECTIONS: BuyerSection[] = [
  {
    id: 'picks',
    title: 'The picks',
    body: `Street prices change. We omit today’s asking prices unless we read the retailer on ${BUYER_CHECKED}. AMD’s R9700 launch MSRP is ${R9700_MSRP}. Bandwidth figures are AMD specs.`,
    table: {
      caption: 'Best AMD GPU roles for local LLMs at 256K. No live street prices on this page.',
      headers: ['Role', 'Card', 'VRAM', 'What it runs at 256K'],
      rows: [
        ['Best overall', 'Radeon AI PRO R9700', '32 GB, 640 GB/s', '35B fully on the card (measured on the local desktop)'],
        ['Budget', 'RX 9060 XT 16GB', '16 GB, 320 GB/s', '35B Q4 with experts in DDR5'],
        ['Middle / also game', 'RX 9070 XT', '16 GB, 640 GB/s', '35B Q4 with experts in DDR5'],
        ['48 GB', 'Radeon PRO W7900', '48 GB, 864 GB/s', '35B Q6 fully on the card (calculator)'],
      ],
    },
  },
  {
    id: '9070',
    title: 'Why the RX 9070 XT is not the middle pick for most people',
    body: 'It shares the R9700’s chip family and 640 GB/s bandwidth but has half the VRAM. The 35B does not fit, so the card spends time waiting on system RAM. Two 9070 XTs give you 32 GB split across two cards, need an x8/x8 board, and splitting a model across cards was slower than one card in every row we measured on two R9700s on the local desktop. Buy the 9070 XT if you also game. For LLMs only, the 9060 XT gets you the same offload setup for less.',
    links: [
      { href: '/gpus/rx-9070-xt', label: 'RX 9070 XT' },
      { href: '/gpus/rx-9060-xt', label: 'RX 9060 XT' },
      { href: '/compare/one-vs-two-gpu', label: 'One vs two GPUs' },
    ],
  },
  {
    id: 'w7800',
    title: 'The W7800 question',
    body: 'The Radeon PRO W7800 is another 32 GB Radeon, on older RDNA 3, with 576 GB/s (AMD spec) versus the R9700’s 640 GB/s. Get it only if you need a particular seller’s own-stock return policy or cannot find an R9700. Otherwise the R9700 is the better card for this job. We do not print a street comparison here.',
    links: [{ href: '/gpus/w7800', label: 'PRO W7800' }],
  },
  {
    id: 'skip',
    title: 'Cards to skip new',
    body: 'The RX 7900 XTX, 7900 XT, 7900 GRE and 7600 XT are last-generation for this job. Prefer used or skip them. See Buying used Radeon.',
    links: [{ href: '/guides/buying-used-radeon', label: 'Buying used Radeon' }],
  },
  {
    id: 'nothing',
    title: 'Buy nothing if…',
    body: 'You already have a 16 GB or larger Radeon and at least 64 GB of RAM — try expert offload first. You want the bigger Qwen 3.8 Flash — that is mostly a RAM decision (two R9700s plus 96 GB runs Q4 at 256K).',
    links: [
      { href: '/can-run', label: 'Can my Radeon run it?' },
      { href: FLASH_REQ_PATH, label: 'Flash requirements' },
    ],
  },
];

export const BEST_GPU_FAQ: BuyerFaq[] = [
  {
    id: 'amd-good',
    question: 'Is AMD good for local LLMs in 2026?',
    answer:
      'Yes for inference on Linux with llama.cpp (ROCm or Vulkan). Some NVIDIA-only kernels are still missing on RDNA 4. See the lab log. Measured 35B numbers on this site come from the local desktop R9700.',
    links: [
      { href: '/lab-log', label: 'Lab log' },
      { href: '/compare/radeon-vs-nvidia', label: 'Radeon vs NVIDIA' },
    ],
  },
  {
    id: '16gb',
    question: 'Is 16 GB enough?',
    answer:
      'For MoE models like Qwen3.6-35B, yes with expert offload and 64 GB or more of RAM, at lower speed. Not for fully on-GPU 256K.',
    links: [{ href: QWEN36_REQ_PATH, label: '35B requirements' }],
  },
  {
    id: 'r9700-or-9070',
    question: 'R9700 or 9070 XT?',
    answer:
      'Same chip family and bandwidth; the R9700 has twice the VRAM, and that is what decides LLM fit.',
    links: [
      { href: '/gpus/r9700', label: 'R9700' },
      { href: '/gpus/rx-9070-xt', label: '9070 XT' },
    ],
  },
];

export const BEST_GPU_PICK: BuyerPick = {
  title: 'Our pick: Radeon AI PRO R9700 (32 GB)',
  body: `AMD launch MSRP is ${R9700_MSRP}. We omit today’s street ask. Newegg listings are often marketplace sellers — that seller’s warranty and return policy apply. Check the listing before you buy.`,
  href: BUY_R9700_HREF,
  label: 'Check R9700 listings',
};

export const REQUIRED_BEST_GPU_HREFS = [
  '/gpus/r9700',
  '/gpus/r9700/review',
  QWEN36_REQ_PATH,
  FLASH_REQ_PATH,
  '/can-run',
  '/guides/buying-used-radeon',
  '/compare/gpus',
  '/disclosure',
] as const;

export function bestGpuBlob(): string {
  return [
    BEST_GPU_TITLE,
    BEST_GPU_DESCRIPTION,
    BEST_GPU_H1,
    BEST_GPU_LEAD,
    BEST_GPU_ANSWER,
    ...BEST_GPU_SECTIONS.map((row) => `${row.title} ${row.body ?? ''}`),
    ...BEST_GPU_FAQ.map((row) => `${row.question} ${row.answer}`),
    BEST_GPU_PICK.body,
  ].join('\n');
}

export function bestGpuHrefs(): string[] {
  return uniqueHrefs([
    ...BEST_GPU_HUB,
    ...BEST_GPU_SECTIONS.flatMap((row) => row.links ?? []),
    ...BEST_GPU_FAQ.flatMap((row) => row.links),
    { href: BEST_GPU_PICK.href, label: BEST_GPU_PICK.label },
    { href: '/compare/gpus', label: 'Compare GPUs' },
    { href: '/disclosure', label: 'Disclosure' },
  ]);
}

export function assertBestGpuValid(): string[] {
  const errors = assertBuyerCopy(bestGpuBlob(), 'best AMD GPU');
  if (BEST_GPU_DESCRIPTION.length < 70 || BEST_GPU_DESCRIPTION.length > 160) {
    errors.push(`description length ${BEST_GPU_DESCRIPTION.length}`);
  }
  if (!/R9700/.test(bestGpuBlob())) errors.push('must pick R9700');
  if (!/256K|262/.test(bestGpuBlob())) errors.push('must judge at 256K');
  const hrefs = bestGpuHrefs();
  for (const required of REQUIRED_BEST_GPU_HREFS) {
    if (!hrefs.includes(required)) errors.push(`missing href ${required}`);
  }
  return errors;
}

void BEST_GPU_PATH;
void BUYER_PUBLISHED;
