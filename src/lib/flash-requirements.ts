/**
 * /models/flash/requirements — Qwen 3.8 Flash RAM / VRAM hub at 256K.
 * File sizes are the Hugging Face GiB figures from the 10-30-15 draft.
 */

import {
  BUYER_CHECKED,
  BUYER_PUBLISHED,
  FLASH_REQ_PATH,
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

export const FLASH_REQ_TITLE = 'Qwen 3.8 Flash RAM and VRAM requirements on Radeon';
export const FLASH_REQ_DESCRIPTION =
  'How much system RAM and VRAM Qwen 3.8 Flash needs at 256K for Q4, Q5 and Q6, what two R9700s plus 96 GB run, and when more RAM is worth it.';
export const FLASH_REQ_H1 = 'Qwen 3.8 Flash RAM and VRAM requirements (256K context)';
export const FLASH_REQ_KICKER = 'Requirements hub · 96 GB story · llama.cpp first';

export const FLASH_Q4_GIB = 103.7;
export const FLASH_Q5_GIB = 147.4;
export const FLASH_Q6_GIB = 157.5;

export const FLASH_REQ_LEAD =
  'With two 32 GB Radeon AI PRO R9700s, Qwen 3.8 Flash at Q4 (UD-Q4_K_XL) runs at the full 256K context with a 96 GB DDR5 kit (about 74 GB of system RAM needed, estimate).';

export const FLASH_REQ_ANSWER =
  'The model is a 125B-total / 6B-active MoE. The smallest file we recommend is 103.7 GB, so no single Radeon holds it. The busiest layers sit in VRAM, the rest of the experts sit in system RAM, and RAM is the part you size. More RAM buys a bigger, smarter, much slower model.';

export const FLASH_REQ_LAUNCH =
  `./build-vk/bin/llama-server \\
  -m /path/to/nvme/Qwen3.8-Flash-Next-UD-Q4_K_XL-00001-of-00004.gguf \\
  -c 262144 --cache-type-k f16 --cache-type-v f16 -ngl 99 --fit on \\
  -t <physical-cores> --host 127.0.0.1 --port 8080`;

export const FLASH_REQ_SOURCES: BuyerSource[] = [
  {
    id: 'S-HF-TREE',
    title: 'unsloth/Qwen3.8-Flash-Next-GGUF file sizes (GiB)',
    href: officialLinks.qwenFlashGguf,
    checked: BUYER_CHECKED,
    sourceDate: 'HF tree, UD-Q4_K_XL 103.7 / UD-Q5_K_XL 147.4 / UD-Q6_K_XL 157.5 GiB',
    thirdParty: true,
  },
  {
    id: 'S-IQ4',
    title: 'UD-IQ4_XS GGUF header — mostly IQ3_S experts',
    href: officialLinks.qwenFlashGguf,
    checked: BUYER_CHECKED,
    sourceDate: 'header read 2026-10-30; 31.56 of 55.43 GiB of routed experts are IQ3_S',
    thirdParty: true,
  },
  {
    id: 'S-LAB',
    title: 'Local desktop Flash Q6 pair — Strata vs llama.cpp',
    href: '/models/flash',
    checked: BUYER_CHECKED,
    sourceDate: 'Measured on the local desktop',
    thirdParty: false,
  },
  {
    id: 'S-OFFLOAD',
    title: 'Flash RAM offload kits',
    href: '/flash-ram-offload',
    checked: BUYER_CHECKED,
    sourceDate: 'site calculator + measured DIMM pair',
    thirdParty: false,
  },
];

export const FLASH_REQ_HUB: BuyerLink[] = [
  { href: '/models/flash', label: 'Flash model page' },
  { href: '/flash-ram-offload', label: 'Flash RAM offload' },
  { href: '/can-run', label: 'Can my Radeon run it?' },
  { href: '/calculator?model=flash&ctx=262144', label: 'Calculator at 256K' },
  { href: QWEN36_REQ_PATH, label: '35B requirements' },
  { href: '/gpus/r9700', label: 'R9700' },
];

export const FLASH_REQ_SECTIONS: BuyerSection[] = [
  {
    id: 'table',
    title: 'What each setup needs at 256K',
    body: 'Sizes are Linux GiB, shown as GB. File sizes from the Hugging Face listing: Q4 103.7, Q5 147.4, Q6 157.5 GB. RAM numbers are calculator estimates: the part of the file that does not fit in VRAM, plus about 7.6 GB KV at 262,144 tokens (f16), runtime, 8 GB OS, and 16 GB headroom. Q4, Q5 and Q6 only. Strix Halo memory is soldered — a DDR5 kit will not help, and a 64 GB Halo cannot hold the Q4 file.',
    table: {
      caption: 'Qwen 3.8 Flash RAM kits at 262K. Estimates. Checked 2026-11-02.',
      headers: ['Setup', '96 GB', '128 GB', '192 GB', '256 GB', 'Speed'],
      rows: [
        ['2× R9700 (64 GB VRAM)', 'Q4 (~74 GB)', 'Q5 (~119 GB)', 'Q6 (~129 GB)', 'Q6, room to spare', 'Q6 measured: 32.8 tok/s Strata at 8K, 31.8 at 100K; llama.cpp 18.5 / 17.9. Q4 estimate ~27–33 tok/s'],
        ['1× R9700 (32 GB)', 'Not enough (~106 GB)', 'Q4', 'Q6 (~160 GB)', 'Q6', 'Not measured on the local desktop'],
        ['1× 48 GB or 2× 24 GB', 'Q4 (~90 GB, tight)', 'Q4', 'Q6 (~145 GB)', 'Q6', 'Not measured'],
        ['1× 24 GB', 'Not enough', 'Q4 (~114 GB)', 'Q6', 'Q6', 'Not measured'],
        ['1× 16–20 GB', 'Not enough', 'Q4 (~118–122 GB)', 'Q6', 'Q6', 'Not measured'],
        ['1× 12 GB', 'Not enough', 'Q4 (~126 GB, tight)', 'Q6', 'Q6', 'Not measured'],
        ['Strix Halo 64 GB', 'No. Memory is soldered and Q4 is 103.7 GB', '—', '—', '—', 'Will not fit at Q4+'],
        ['Strix Halo 128 GB', 'Q4 might load (file + KV ~111 GB of a 128 GB shared pool), tight', 'Memory cannot be upgraded', '—', '—', 'Not measured'],
      ],
    },
  },
  {
    id: 'vram',
    title: 'How much VRAM does it need?',
    body: 'No single card holds it: Q4 is 103.7 GB plus 7.6 GB of KV cache at 256K. VRAM decides how much of the model runs at GPU speed (an R9700 reads its memory at 640 GB/s, AMD spec). System RAM holds the rest. Two 32 GB cards are the reference setup. 128 GB on two R9700s can load Q6 with about 4 GB spare on a leaner estimate; we size Q6 at 192 GB so you are not running at the edge.',
    links: [
      { href: '/gpus/r9700', label: 'R9700' },
      { href: '/compare/one-vs-two-gpu', label: 'One vs two GPUs' },
    ],
  },
  {
    id: 'more-ram',
    title: 'Is more RAM worth it?',
    body: 'For most people, no. 96 GB runs Q4 at full context on two R9700s. More RAM buys a larger, higher-precision file (Q5/Q6, or a bigger model like GLM 5.3 Flash at 192 GB), but more of it lives in system RAM, so it answers more slowly (estimates: Q5 ~21–25 tok/s, Q6 ~19–23 on two sticks, vs ~27–33 for Q4). Get more only if you want the most capable model you can run at home and you are fine with it being slower. 192 and 256 GB need four sticks. Ryzen 9000 is rated for DDR5-5600 with two sticks and DDR5-3600 with four (AMD spec). On the local desktop four-stick rig, llama.cpp dropped from 18.5 to 15.9 tok/s going from DDR5-5200 to 3600 (Strata 32.8 to 32.0).',
    links: [
      { href: '/flash-ram-offload#more-ram', label: 'Full offload table' },
      { href: '/models/glm-53-flash/requirements', label: 'GLM 5.3 Flash requirements' },
    ],
  },
  {
    id: 'iq4',
    title: 'Why we skip the IQ4_XS file',
    body: 'The unsloth listing also has a UD-IQ4_XS file at 87.2 GB, which looks like a cheaper 4-bit option for 64–96 GB machines. Its GGUF header says otherwise: 31.6 of its 55.4 GB of routed experts are IQ3_S (3-bit) and the 26.8 GB n-gram table is IQ4_NL. Most of the model is below 4-bit, so it falls under our Q4-and-up rule. That is a header read, not a quality test.',
    links: [{ href: '/quants', label: 'Quants' }],
  },
  {
    id: 'honest',
    title: 'The honest pick',
    body: 'Already have two 32 GB cards and 96 GB or more RAM: buy nothing. Run UD-Q4_K_XL at 262,144. One R9700 and 64 GB or less: buy nothing yet — run the 35B instead. It fits fully on one card at 256K and decodes about 100 tok/s on the local desktop. Flash on one card needs a 128 GB kit and we have not measured its speed. 16–24 GB with 128 GB already: Q4 should load with expert offload; it is slow and not measured here. Building a two-R9700 rig for Flash: size RAM at 96 GB (2×48) so two sticks keep full DDR5-5600 speed. No GPU buy button on this page.',
    links: [
      { href: '/go/newegg/ddr5-96', label: '96 GB Flare X5 kit' },
      { href: QWEN36_REQ_PATH, label: 'Run the 35B instead' },
      { href: '/motherboards', label: 'Motherboards' },
    ],
  },
  {
    id: 'launch',
    title: 'Launch line (Q4+, 256K, two cards)',
    body: '--fit places as many expert layers on the two cards as fit and keeps the rest in RAM. Faster engine on the same files: Strata.',
    code: FLASH_REQ_LAUNCH,
    links: [
      { href: '/recipes/qwen38-flash.llamacpp.262k', label: 'llama.cpp Flash recipe' },
      { href: '/backends', label: 'Backends' },
    ],
  },
];

export const FLASH_REQ_FAQ: BuyerFaq[] = [
  {
    id: 'how-much-ram',
    question: 'How much RAM does Qwen 3.8 Flash need?',
    answer:
      'At 256K on two 32 GB R9700s, Q4 needs about 74 GB of system RAM (estimate), so a 96 GB DDR5 kit. Q5 needs about 119 GB (128 GB kit) and Q6 about 129 GB (192 GB kit). With one 32 GB card, Q4 needs a 128 GB kit.',
    links: [
      { href: FLASH_REQ_PATH, label: 'Flash requirements' },
      { href: '/flash-ram-offload', label: 'Offload table' },
    ],
  },
  {
    id: 'how-much-vram',
    question: 'How much VRAM does Qwen 3.8 Flash need?',
    answer:
      'No single Radeon holds it: the Q4 file is 103.7 GB plus 7.6 GB of KV at 256K. It runs with the busiest layers in VRAM and the remaining experts in system RAM. Two 32 GB cards are the reference setup.',
    links: [{ href: '/gpus/r9700', label: 'R9700' }],
  },
  {
    id: '64gb',
    question: 'Can I run Qwen 3.8 Flash with 64 GB of RAM?',
    answer:
      'Not at Q4 or above with full 256K on Radeon cards up to 2×32 GB: two R9700s need about 74 GB of system RAM for Q4. Below Q4 the quality drops and we do not recommend it. With 64 GB, run Qwen3.6-35B, which fits fully on one 32 GB card.',
    links: [{ href: QWEN36_REQ_PATH, label: '35B requirements' }],
  },
  {
    id: 'more-than-96',
    question: 'Is more than 96 GB of RAM worth it for Qwen 3.8 Flash?',
    answer:
      'Usually not. 128–256 GB lets you load Q5/Q6 or a larger model, but more of it sits in system RAM, so it runs slower. It is worth it only if you want the most capable model you can run and accept the slower speed.',
    links: [{ href: '/flash-ram-offload', label: 'Flash RAM offload' }],
  },
];

export const FLASH_REQ_PICK: BuyerPick = {
  title: 'Our RAM pick',
  body: 'G.SKILL Flare X5 96 GB (2×48 GB) DDR5-5600 CL40, F5-5600J4040D48GX2-FX5. AMD EXPO. Two sticks keep the rated DDR5-5600. We omit a street price unless we read the listing today. Paid link: we may earn a commission if you buy through it, at no extra cost to you.',
  href: '/go/newegg/ddr5-96',
  label: 'Check the 96 GB kit at Newegg',
  productId: 'ddr5-96',
};

export const REQUIRED_FLASH_REQ_HREFS = [
  '/models/flash',
  '/flash-ram-offload',
  '/can-run',
  '/calculator',
  QWEN36_REQ_PATH,
  '/gpus/r9700',
  '/quants',
  '/backends',
  '/disclosure',
] as const;

export function flashReqBlob(): string {
  return [
    FLASH_REQ_TITLE,
    FLASH_REQ_DESCRIPTION,
    FLASH_REQ_H1,
    FLASH_REQ_LEAD,
    FLASH_REQ_ANSWER,
    ...FLASH_REQ_SECTIONS.map((row) => `${row.title} ${row.body ?? ''} ${row.code ?? ''}`),
    ...FLASH_REQ_FAQ.map((row) => `${row.question} ${row.answer}`),
    FLASH_REQ_PICK.body,
  ].join('\n');
}

export function flashReqHrefs(): string[] {
  return uniqueHrefs([
    ...FLASH_REQ_HUB,
    ...FLASH_REQ_SECTIONS.flatMap((row) => row.links ?? []),
    ...FLASH_REQ_FAQ.flatMap((row) => row.links),
    { href: FLASH_REQ_PICK.href, label: FLASH_REQ_PICK.label },
    { href: '/disclosure', label: 'Disclosure' },
  ]);
}

export function assertFlashReqValid(): string[] {
  const errors = assertBuyerCopy(flashReqBlob(), 'Flash requirements');
  if (FLASH_REQ_DESCRIPTION.length < 70 || FLASH_REQ_DESCRIPTION.length > 160) {
    errors.push(`description length ${FLASH_REQ_DESCRIPTION.length}`);
  }
  if (!/96 GB/.test(flashReqBlob())) errors.push('must recommend 96 GB');
  if (!/soldered/.test(flashReqBlob())) errors.push('must say Strix Halo is soldered');
  if (!/IQ3_S/.test(flashReqBlob())) errors.push('must explain IQ4_XS');
  if (!String(FLASH_Q4_GIB).length) errors.push('q4 size');
  const hrefs = flashReqHrefs();
  for (const required of REQUIRED_FLASH_REQ_HREFS) {
    if (!hrefs.includes(required)) errors.push(`missing href ${required}`);
  }
  return errors;
}

void BUYER_PUBLISHED;
void FLASH_Q5_GIB;
void FLASH_Q6_GIB;
