/**
 * /local-llm-pc-build — two fixed AM5 + R9700 builds.
 * Both builds use 96 GB DDR5 (house RAM). No street prices unless live-read today.
 */

import {
  BUYER_CHECKED,
  BUYER_PUBLISHED,
  BUY_R9700_HREF,
  FLASH_REQ_PATH,
  PC_BUILD_PATH,
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

export const PC_BUILD_TITLE = 'Best PC build for local LLMs: two AMD Radeon builds';
export const PC_BUILD_DESCRIPTION =
  'One R9700 runs Qwen3.6-35B at 256K (~100 tok/s measured). Two R9700s plus 96 GB DDR5 run Qwen 3.8 Flash Q4. Full parts lists; no invented prices.';
export const PC_BUILD_H1 = 'Best PC build for local LLMs';
export const PC_BUILD_KICKER = 'Two fixed builds · 96 GB DDR5 · llama.cpp first';

export const PC_BUILD_LEAD =
  'For most people, one AMD Radeon AI PRO R9700 (32 GB) in a normal AM5 PC. It holds Qwen3.6-35B-A3B at the full 256K context with nothing in system RAM, and we measured about 100 tok/s on short prompts (about 88 at 32K, about 50 near 256K) on the local desktop.';

export const PC_BUILD_ANSWER =
  'Want a bigger, smarter model and can accept slower answers? Add a second card. Both builds use 96 GB DDR5: dual R9700 runs Qwen 3.8 Flash Q4 at 256K, and extra RAM is already there if you later offload a larger file. More RAM buys a smarter but much slower model.';

export const PC_BUILD_PARTS = [
  { id: 'r9700', role: 'GPU', name: 'AMD Radeon AI PRO R9700 32 GB', why: '32 GB holds the 35B Q5 at 256K' },
  { id: 'asrock-x870-taichi-creator', role: 'Board', name: 'ASRock X870 Taichi Creator', why: 'x8/x8 slots, so a second card drops in later' },
  { id: 'amd-ryzen-7-9700x', role: 'CPU', name: 'Ryzen 7 9700X', why: 'The model lives on the GPU; 8 cores is plenty' },
  { id: 'ddr5-96', role: 'RAM', name: '96 GB (2×48) DDR5-5600 CL40, G.SKILL Flare X5', why: 'House size. Two sticks keep full DDR5-5600. Dual R9700 runs Flash Q4 at 256K' },
  { id: 'cp-9020270-na', role: 'PSU (one card)', name: 'Corsair RM850x (2024)', why: 'One native 12V-2x6; AMD asks 750 W minimum for one R9700' },
  { id: 'ps-tpt-1200fnfagu-3', role: 'PSU (two cards)', name: 'Thermaltake Toughpower GT 1200W', why: 'Two native 12V-2x6, one per card' },
  { id: 'mz-v9p2t0bw', role: 'SSD', name: 'Samsung 990 PRO 2 TB', why: 'Holds every Q4–Q6 of the house models' },
  { id: 'thermalright-peerless-assassin-120-se', role: 'Cooler', name: 'Thermalright Peerless Assassin 120 SE', why: 'Ryzen 9000X ships without a cooler' },
  { id: 'fractal-design-meshify-2', role: 'Case', name: 'Fractal Design Meshify 2', why: 'Airflow for a blower card' },
] as const;

export const PC_BUILD_SOURCES: BuyerSource[] = [
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
    title: 'AMD R9700 — 32 GB, 300 W TBP, launch MSRP',
    href: '/gpus/r9700',
    checked: BUYER_CHECKED,
    sourceDate: `MSRP ${R9700_MSRP} already on this site`,
    thirdParty: false,
  },
  {
    id: 'S-MB',
    title: 'AM5 x8/x8 motherboard notes',
    href: '/motherboards',
    checked: BUYER_CHECKED,
    sourceDate: 'site motherboard guide',
    thirdParty: false,
  },
];

export const PC_BUILD_HUB: BuyerLink[] = [
  { href: '/budget', label: 'Setup by budget' },
  { href: '/gpus/r9700', label: 'R9700' },
  { href: QWEN36_REQ_PATH, label: '35B requirements' },
  { href: FLASH_REQ_PATH, label: 'Flash requirements' },
  { href: '/motherboards', label: 'Motherboards' },
  { href: '/power', label: 'Power and PSU' },
];

export const PC_BUILD_SECTIONS: BuyerSection[] = [
  {
    id: 'build-1',
    title: 'Build 1: one R9700, the 35B at full context',
    body: 'Skip a part if you have it. Already own an AM5 PC with an 850 W PSU? You only need the card. 96 GB is the house RAM even on the one-card build: nothing is offloaded for the 35B, but the kit is the same one you keep when you add Flash later. We omit row prices unless we read the retailer today.',
    table: {
      caption: 'Build 1 parts. Check-price hops only. No invented totals.',
      headers: ['Part', 'Pick', 'Why'],
      rows: [
        ['GPU', 'AMD Radeon AI PRO R9700 32 GB', '32 GB holds the 35B Q5 at 256K'],
        ['Board', 'ASRock X870 Taichi Creator', 'x8/x8 slots, so a second card drops in later'],
        ['CPU', 'Ryzen 7 9700X', 'The model lives on the GPU; 8 cores is plenty'],
        ['RAM', '96 GB (2×48) DDR5-5600 CL40, G.SKILL Flare X5', 'House size for most users'],
        ['PSU', 'Corsair RM850x (2024)', 'One native 12V-2x6; AMD asks 750 W minimum'],
        ['SSD', 'Samsung 990 PRO 2 TB', 'Holds every Q4–Q6 of the house models'],
        ['Cooler', 'Thermalright Peerless Assassin 120 SE', 'Ryzen 9000X ships without a cooler'],
        ['Case', 'Fractal Design Meshify 2', 'Airflow for a blower card'],
      ],
    },
    links: [
      { href: '/go/newegg/r9700', label: 'R9700' },
      { href: '/go/newegg/asrock-x870-taichi-creator', label: 'Board' },
      { href: '/go/newegg/amd-ryzen-7-9700x', label: '9700X' },
      { href: '/go/newegg/ddr5-96', label: '96 GB RAM' },
      { href: '/go/newegg/cp-9020270-na', label: '850 W PSU' },
      { href: '/go/newegg/mz-v9p2t0bw', label: '2 TB SSD' },
      { href: '/go/newegg/thermalright-peerless-assassin-120-se', label: 'Cooler' },
      { href: '/go/newegg/fractal-design-meshify-2', label: 'Case' },
    ],
  },
  {
    id: 'build-2',
    title: 'Build 2: two R9700s + 96 GB, for Qwen 3.8 Flash',
    body: 'Same board, CPU, RAM, SSD, cooler and case. Swap the PSU for 1200 W with two native 12V-2x6 cables, and add the second card. Flash Q4 at 256K is an estimate of roughly 27–33 tok/s (llama.cpp-class, not yet measured on the local desktop). That is about a third of the 35B’s speed: more RAM and a bigger file buy a smarter model, not a faster one.',
    table: {
      caption: 'Build 2 deltas. Same 96 GB kit as Build 1.',
      headers: ['Part', 'Pick', 'Why'],
      rows: [
        ['GPU', '2× R9700 32 GB', '64 GB VRAM holds the trunk and part of the experts'],
        ['RAM', '96 GB (2×48) DDR5-5600 CL40, G.SKILL Flare X5', 'The rest of Flash Q4 at 256K lives here; two sticks keep full speed'],
        ['PSU', 'Thermaltake Toughpower GT 1200W', 'Two native 12V-2x6, one per card'],
      ],
    },
    links: [
      { href: '/go/newegg/r9700', label: 'Second R9700' },
      { href: '/go/newegg/ps-tpt-1200fnfagu-3', label: '1200 W PSU' },
      { href: FLASH_REQ_PATH, label: 'Flash requirements' },
    ],
  },
  {
    id: 'which',
    title: 'Which one?',
    body: 'Coding agent, chat, long documents: Build 1. The 35B is the site default for a reason. Maximum intelligence at home, slower answers are fine: Build 2. Not sure: start with Build 1 on this board; it takes a second card later. No Q3 or lower. No invented prices.',
    links: [
      { href: '/best-local-coding-model-32gb', label: 'Best local coding model' },
      { href: QWEN36_REQ_PATH, label: '35B requirements' },
    ],
  },
];

export const PC_BUILD_FAQ: BuyerFaq[] = [
  {
    id: 'one-or-two',
    question: 'Do I need two GPUs for a local LLM PC?',
    answer:
      'Not for the house 35B. One R9700 holds Q5 at 256K. Two cards are for a second 35B copy or for Flash-class models with 96 GB of DDR5.',
    links: [{ href: '/compare/one-vs-two-gpu', label: 'One vs two GPUs' }],
  },
  {
    id: 'why-96',
    question: 'Why 96 GB of RAM on the one-card build?',
    answer:
      'The 35B does not need it. 96 GB is the house size so the same kit runs Qwen 3.8 Flash Q4 at 256K when you add a second card. Dual R9700 plus 96 GB is the reference Flash setup.',
    links: [{ href: FLASH_REQ_PATH, label: 'Flash requirements' }],
  },
];

export const PC_BUILD_PICK: BuyerPick = {
  title: 'Start with the card',
  body: `If the rest of the PC already exists, the GPU is the only buy. AMD launch MSRP is ${R9700_MSRP}. We omit today’s street ask.`,
  href: BUY_R9700_HREF,
  label: 'Check R9700 listings',
};

export const REQUIRED_PC_BUILD_HREFS = [
  '/budget',
  '/gpus/r9700',
  QWEN36_REQ_PATH,
  FLASH_REQ_PATH,
  '/motherboards',
  '/power',
  '/disclosure',
] as const;

export function pcBuildBlob(): string {
  return [
    PC_BUILD_TITLE,
    PC_BUILD_DESCRIPTION,
    PC_BUILD_H1,
    PC_BUILD_LEAD,
    PC_BUILD_ANSWER,
    ...PC_BUILD_SECTIONS.map((row) => `${row.title} ${row.body ?? ''}`),
    ...PC_BUILD_FAQ.map((row) => `${row.question} ${row.answer}`),
    PC_BUILD_PICK.body,
    ...PC_BUILD_PARTS.map((row) => `${row.name} ${row.why}`),
  ].join('\n');
}

export function pcBuildHrefs(): string[] {
  return uniqueHrefs([
    ...PC_BUILD_HUB,
    ...PC_BUILD_SECTIONS.flatMap((row) => row.links ?? []),
    ...PC_BUILD_FAQ.flatMap((row) => row.links),
    { href: PC_BUILD_PICK.href, label: PC_BUILD_PICK.label },
    { href: '/disclosure', label: 'Disclosure' },
  ]);
}

export function assertPcBuildValid(): string[] {
  const errors = assertBuyerCopy(pcBuildBlob(), 'PC build');
  if (PC_BUILD_DESCRIPTION.length < 70 || PC_BUILD_DESCRIPTION.length > 160) {
    errors.push(`description length ${PC_BUILD_DESCRIPTION.length}`);
  }
  if (!/96 GB/.test(pcBuildBlob())) errors.push('must use 96 GB on the builds');
  if (/32 GB \(2x16\)|32 GB \(2×16\)/.test(pcBuildBlob())) errors.push('must not use 32 GB RAM on Build 1');
  const hrefs = pcBuildHrefs();
  for (const required of REQUIRED_PC_BUILD_HREFS) {
    if (!hrefs.includes(required)) errors.push(`missing href ${required}`);
  }
  return errors;
}

void PC_BUILD_PATH;
void BUYER_PUBLISHED;
