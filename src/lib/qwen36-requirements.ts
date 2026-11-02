/**
 * /models/qwen36/requirements — Qwen3.6-35B-A3B VRAM / GPU hub at 256K.
 * Numbers: calculator estimates already on the site, plus local desktop 35B cards.
 */

import {
  BUYER_CHECKED,
  BUYER_PUBLISHED,
  BUY_R9700_HREF,
  QWEN36_REQ_PATH,
  assertBuyerCopy,
  uniqueHrefs,
  type BuyerFaq,
  type BuyerLink,
  type BuyerPick,
  type BuyerSection,
  type BuyerSource,
} from './buyer-pages';
import { officialLinks } from './site';

export const QWEN36_REQ_TITLE = 'Qwen3.6-35B VRAM and GPU requirements on Radeon';
export const QWEN36_REQ_DESCRIPTION =
  'How much VRAM Qwen3.6-35B-A3B needs at 256K for Q6, Q5 and Q4, which Radeon cards run it fully, and when RAM offload is enough.';
export const QWEN36_REQ_H1 = 'Qwen3.6-35B-A3B VRAM and GPU requirements (256K context)';
export const QWEN36_REQ_KICKER = 'Requirements hub · llama.cpp first · 256K';

export const QWEN36_REQ_LEAD =
  'At 256K context with f16 KV, Qwen3.6-35B-A3B needs about 32.7 GB for Q6_K, 30.7 GB for UD-Q5_K_XL, and 25.6 GB for Q4_K_M (calculator estimates: weights + KV + runtime). A 32 GB card runs the Q5 fully on the GPU.';

export const QWEN36_REQ_ANSWER =
  'We measured about 102 tok/s decode on one Radeon AI PRO R9700 (llama.cpp Vulkan, short prompt) on the local desktop and run UD-Q5_K_XL daily at the full 262K context. Cards with 24 GB or less still run it by keeping some MoE experts in system RAM, but slower. Two R9700s are not needed for this model: “35B on two cards” means one full copy per card.';

export const QWEN36_REQ_LAUNCH_32 =
  `./build-vk/bin/llama-server \\
  -m /path/to/nvme/Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf \\
  -ngl 99 -c 262144 --cache-type-k f16 --cache-type-v f16 --jinja \\
  --host 127.0.0.1 --port 8080`;

export const QWEN36_REQ_LAUNCH_OFFLOAD =
  `./build-vk/bin/llama-server \\
  -m /path/to/nvme/Qwen3.6-35B-A3B-Q4_K_M.gguf \\
  -ngl 99 --n-cpu-moe 24 -c 262144 -t <physical-cores> \\
  --cache-type-k f16 --cache-type-v f16 --jinja \\
  --host 127.0.0.1 --port 8080`;

export const QWEN36_REQ_SOURCES: BuyerSource[] = [
  {
    id: 'S-CALC',
    title: 'AMDai calculator — 35B Q6/Q5/Q4 totals at 256K',
    href: '/calculator?model=qwen36&ctx=262144',
    checked: BUYER_CHECKED,
    sourceDate: 'site calculator',
    thirdParty: false,
  },
  {
    id: 'S-LAB',
    title: 'Local desktop 35B llama.cpp Vulkan cards',
    href: '/benchmarks',
    checked: BUYER_CHECKED,
    sourceDate: 'Measured on the local desktop',
    thirdParty: false,
  },
  {
    id: 'S-HF',
    title: 'Qwen3.6-35B-A3B model card',
    href: officialLinks.qwen36,
    checked: BUYER_CHECKED,
    sourceDate: 'read 2026-11-02',
    thirdParty: true,
  },
  {
    id: 'S-GGUF',
    title: 'Unsloth Qwen3.6-35B-A3B GGUF listing',
    href: officialLinks.qwen36Gguf,
    checked: BUYER_CHECKED,
    sourceDate: 'read 2026-11-02',
    thirdParty: true,
  },
];

export const QWEN36_REQ_HUB: BuyerLink[] = [
  { href: '/models/qwen36', label: '35B model page' },
  { href: '/can-run', label: 'Can my Radeon run it?' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/gpus/r9700', label: 'R9700' },
  { href: '/qwen36-dual', label: '35B on two cards' },
  { href: '/flash-ram-offload', label: 'Flash RAM offload' },
];

export const QWEN36_REQ_SECTIONS: BuyerSection[] = [
  {
    id: 'table',
    title: 'Every Radeon we cover, at 256K',
    body: 'Sizes are Linux GiB, shown as GB. Fit is a calculator estimate at 262,144 tokens with f16 KV. Q4 and up. Q3 is a labeled estimate on the can-run leaves, not a house pick.',
    table: {
      caption: 'Qwen3.6-35B-A3B at 256K on published Radeon sheets. Checked 2026-11-02.',
      headers: ['VRAM', 'Cards', 'At 256K', 'Best Q4+ file', 'What to do'],
      rows: [
        ['48–64 GB', 'W7900, Strix Halo', 'Fits fully', 'Q6_K', 'Keep it'],
        ['32 GB', 'R9700, W7800, W6800', 'Fits fully', 'UD-Q5_K_XL', 'Keep it'],
        ['24 GB', 'RX 7900 XTX', 'Fits fully at 32K; 256K needs a few experts in RAM', 'Q4_K_M', 'Keep it; add a 32 GB card only if you want Q5 at 256K at full speed'],
        ['16–20 GB', '7900 XT, 9070 XT, 9070, 9060 XT, 7900 GRE, 7800 XT, 7600 XT, 6950 XT, 6800 XT, W7700', 'Expert offload', 'Q4_K_M', 'Works now with --n-cpu-moe if you have the RAM'],
        ['8–12 GB', '9070 GRE, 7700 XT, 6700 XT, 7600', 'Expert offload (heavier)', 'Q4_K_M', 'Works, slowest tier'],
      ],
    },
  },
  {
    id: 'offload',
    title: 'How fast is offload?',
    body: 'One 16 GB RX 9070 XT, Q4_K_M, ROCm, DDR4-3200: 31.8 to 43.9 tok/s decode as --n-cpu-moe goes 40 to 16 (community report; third-party). One R9700 with everything in VRAM on the local desktop: 117.7 tok/s Q4_K_M, 102.4 tok/s UD-Q5_K_XL. Different hosts, so treat the gap as an estimate.',
    links: [
      { href: '/can-run/qwen36-35b-on-rx-9070-xt', label: '35B on RX 9070 XT' },
      { href: '/out-of-vram', label: 'Out of VRAM' },
      { href: '/moe', label: 'MoE' },
    ],
  },
  {
    id: 'honest',
    title: 'The honest pick',
    body: 'Already have 32 GB or more: buy nothing. 16–24 GB and at least 64 GB RAM: try offload first. 16–24 GB and under 64 GB RAM: a DDR5 kit is the cheaper fix. Want the full-speed, full-context Q5: one 32 GB R9700. Two R9700s are not needed for this model; the second card is for Flash-class models. 96 GB DDR5 is the house RAM size for most builds.',
    links: [
      { href: BUY_R9700_HREF, label: 'R9700 listings' },
      { href: '/go/newegg/ddr5-96', label: '96 GB DDR5 kit' },
      { href: '/compare/one-vs-two-gpu', label: 'One vs two GPUs' },
    ],
  },
  {
    id: 'launch',
    title: 'Launch lines (Q4+, 256K)',
    body: '32 GB cards use the house UD-Q5_K_XL file. 16–24 GB cards start --n-cpu-moe at 24 and lower it until the load fits. llama.cpp first.',
    code: `${QWEN36_REQ_LAUNCH_32}\n\n# 16–24 GB expert offload\n${QWEN36_REQ_LAUNCH_OFFLOAD}`,
    links: [
      { href: '/recipes/qwen36-35b.llamacpp-vulkan.262k', label: 'House 35B recipe' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
    ],
  },
];

export const QWEN36_REQ_FAQ: BuyerFaq[] = [
  {
    id: 'how-much-vram',
    question: 'How much VRAM does Qwen3.6-35B-A3B need?',
    answer:
      'At 256K context with f16 KV: about 32.7 GB for Q6_K, 30.7 GB for UD-Q5_K_XL, and 25.6 GB for Q4_K_M (calculator estimates). A 32 GB Radeon holds the Q5 fully. llama.cpp first.',
    links: [
      { href: QWEN36_REQ_PATH, label: '35B requirements' },
      { href: '/calculator', label: 'Calculator' },
    ],
  },
  {
    id: '16gb',
    question: 'Can a 16 GB GPU run Qwen3.6-35B?',
    answer:
      'Yes, with expert offload and enough system RAM. Use Q4_K_M and --n-cpu-moe. It is slower than a 32 GB card that holds Q5 in VRAM. Third-party 9070 XT reports land around 32–44 tok/s. Not measured on the local desktop for that card.',
    links: [
      { href: '/can-run/qwen36-35b-on-rx-9060-xt', label: '35B on RX 9060 XT' },
      { href: '/out-of-vram', label: 'Out of VRAM' },
    ],
  },
  {
    id: 'two-gpus',
    question: 'Do I need two GPUs for Qwen3.6-35B?',
    answer:
      'No. One 32 GB card holds the Q5 at 256K. “35B on two cards” on this site means one full copy per card, not a split. A split was slower than one card at every depth we measured on the local desktop.',
    links: [
      { href: '/qwen36-dual', label: '35B on two cards' },
      { href: '/compare/one-vs-two-gpu', label: 'One vs two GPUs' },
    ],
  },
];

export const QWEN36_REQ_PICK: BuyerPick = {
  title: 'Where to look',
  body: 'If you want the full-speed Q5 at 256K and you do not already have a 32 GB card, check current R9700 listings. We do not print a street price here. AMD’s launch MSRP is $1,299. 96 GB DDR5 is the house RAM pick for most builds.',
  href: BUY_R9700_HREF,
  label: 'Check R9700 listings',
};

export const REQUIRED_QWEN36_REQ_HREFS = [
  '/models/qwen36',
  '/can-run',
  '/calculator',
  '/gpus/r9700',
  '/qwen36-dual',
  '/compare/one-vs-two-gpu',
  '/recipes/qwen36-35b.llamacpp-vulkan.262k',
  '/backends/llamacpp',
  '/disclosure',
] as const;

export function qwen36ReqBlob(): string {
  return [
    QWEN36_REQ_TITLE,
    QWEN36_REQ_DESCRIPTION,
    QWEN36_REQ_H1,
    QWEN36_REQ_LEAD,
    QWEN36_REQ_ANSWER,
    ...QWEN36_REQ_SECTIONS.map((row) => `${row.title} ${row.body ?? ''} ${row.code ?? ''}`),
    ...QWEN36_REQ_FAQ.map((row) => `${row.question} ${row.answer}`),
    QWEN36_REQ_PICK.body,
  ].join('\n');
}

export function qwen36ReqHrefs(): string[] {
  return uniqueHrefs([
    ...QWEN36_REQ_HUB,
    ...QWEN36_REQ_SECTIONS.flatMap((row) => row.links ?? []),
    ...QWEN36_REQ_FAQ.flatMap((row) => row.links),
    { href: QWEN36_REQ_PICK.href, label: QWEN36_REQ_PICK.label },
    { href: '/disclosure', label: 'Disclosure' },
  ]);
}

export function assertQwen36ReqValid(): string[] {
  const errors = assertBuyerCopy(qwen36ReqBlob(), '35B requirements');
  if (QWEN36_REQ_DESCRIPTION.length < 70 || QWEN36_REQ_DESCRIPTION.length > 160) {
    errors.push(`description length ${QWEN36_REQ_DESCRIPTION.length}`);
  }
  if (!/256K|262/.test(qwen36ReqBlob())) errors.push('must say 256K');
  if (!/one full copy/.test(qwen36ReqBlob())) errors.push('must explain two-card copies');
  if (!/96 GB/.test(qwen36ReqBlob())) errors.push('must recommend 96 GB');
  const hrefs = qwen36ReqHrefs();
  for (const required of REQUIRED_QWEN36_REQ_HREFS) {
    if (!hrefs.includes(required)) errors.push(`missing href ${required}`);
  }
  return errors;
}

void BUYER_PUBLISHED;
