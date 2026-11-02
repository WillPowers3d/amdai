/**
 * /best-local-coding-model-32gb — Qwen3.6-35B-A3B Q5 on one 32 GB card.
 * Coding scores are from the official Qwen model card (third-party). Speeds from local desktop cards.
 */

import {
  BUYER_CHECKED,
  BUYER_PUBLISHED,
  BUY_R9700_HREF,
  CODING_MODEL_PATH,
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

export const CODING_TITLE = 'Best local coding model for a 32 GB AMD GPU';
export const CODING_DESCRIPTION =
  'Qwen3.6-35B-A3B at Q5 on one Radeon AI PRO R9700 holds the full 262K context. Official coding scores plus local desktop llama.cpp speed.';
export const CODING_H1 = 'Best local coding model for a 32 GB AMD GPU';
export const CODING_KICKER = 'Coding agents · 32 GB · 256K context';

export const CODING_LEAD =
  'Qwen3.6-35B-A3B at Q5 (Unsloth UD-Q5_K_XL) on one Radeon AI PRO R9700 (32 GB). It holds the model’s full 262,144-token context on the card with f16 KV and nothing offloaded.';

export const CODING_ANSWER =
  'We measured about 100 tok/s on short prompts, about 88 tok/s at 32K and about 50 tok/s at 256K (llama.cpp, Vulkan, one card) on the local desktop. Qwen’s card says to keep at least 128K context. Coding agents send large system prompts and whole files. A setup that only fits 8K–32K will fit the model but not the job.';

export const CODING_SOURCES: BuyerSource[] = [
  {
    id: 'S-CARD',
    title: 'Qwen3.6-35B-A3B model card — SWE-bench, Terminal-Bench, LiveCodeBench',
    href: officialLinks.qwen36,
    checked: BUYER_CHECKED,
    sourceDate: 'read 2026-10-31; SWE at 200K, Terminal-Bench at 256K',
    thirdParty: true,
  },
  {
    id: 'S-LAB',
    title: 'Local desktop 35B llama.cpp Vulkan cards',
    href: '/benchmarks',
    checked: BUYER_CHECKED,
    sourceDate: 'Measured on the local desktop',
    thirdParty: false,
  },
];

export const CODING_HUB: BuyerLink[] = [
  { href: '/setup/coding-assistant', label: 'Coding assistant setup' },
  { href: '/harnesses', label: 'Harnesses' },
  { href: QWEN36_REQ_PATH, label: '35B requirements' },
  { href: '/gpus/r9700', label: 'R9700' },
  { href: '/harnesses/claude-code', label: 'Claude Code' },
  { href: '/harnesses/cline', label: 'Cline' },
];

export const CODING_SECTIONS: BuyerSection[] = [
  {
    id: 'why',
    title: 'Why this model for coding agents',
    body: 'Published by Qwen on the model card (their own agent scaffold, not our measurement): SWE-bench Verified 73.4, SWE-bench Pro 49.5, Terminal-Bench 2.0 51.5, LiveCodeBench v6 80.4. The dense 27B scores about the same on SWE-bench, but it reads all ~27B weights for every token while the 35B-A3B reads ~3B active, so on the same card the 35B should decode several times faster (estimate, not measured here). In an agent loop that speed is the difference between waiting seconds and waiting minutes per step.',
    table: {
      caption: 'Official Qwen model-card scores. Third-party. Read 2026-10-31.',
      headers: ['Benchmark', 'Qwen3.6-35B-A3B', 'Qwen3.5-27B (dense)', 'Gemma 4 31B', 'Gemma 4 26B-A4B'],
      rows: [
        ['SWE-bench Verified', '73.4', '75.0', '52.0', '17.4'],
        ['SWE-bench Pro', '49.5', '51.2', '35.7', '13.8'],
        ['Terminal-Bench 2.0', '51.5', '41.6', '42.9', '34.2'],
        ['LiveCodeBench v6', '80.4', '80.7', '80.0', '77.1'],
      ],
    },
    links: [{ href: officialLinks.qwen36, label: 'Qwen model card' }],
  },
  {
    id: 'context',
    title: 'Why context decides the card',
    body: 'Qwen’s card says to keep at least 128K context to preserve thinking capabilities. SWE-bench runs used a 200K window; Terminal-Bench used 256K. One 32 GB R9700 holds the Q5 at 262K on the local desktop. A 24 GB or 16 GB card must spill experts to system RAM. Two R9700s fit, but for one user a split is slower than one card; a second card is for a second 35B copy (two agents at once).',
    table: {
      caption: '35B-A3B Q5 at 262K, all on GPU?',
      headers: ['Card', 'Fits fully at 262K?'],
      rows: [
        ['1× 32 GB (R9700)', 'Yes (local desktop daily setup)'],
        ['1× 24 GB', 'No: experts spill to system RAM; slower'],
        ['1× 16 GB', 'No: experts in RAM'],
        ['2× R9700', 'Fits as two copies; a split is slower for one user'],
      ],
    },
    links: [
      { href: QWEN36_REQ_PATH, label: '35B requirements' },
      { href: '/long-context', label: 'Long context' },
    ],
  },
  {
    id: 'connect',
    title: 'Connect it',
    body: 'Point Claude Code, Cline, OpenCode, Aider, Continue, or Codex CLI at llama-server /v1. The house file is Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf at -c 262144. Attach steps live on the coding-assistant setup page. Most readers do not need more RAM for this model, because it never leaves the card. 96 GB DDR5 is still the house kit if you later add Flash.',
    links: [
      { href: '/setup/coding-assistant', label: 'Coding assistant setup' },
      { href: '/harnesses/aider', label: 'Aider' },
      { href: '/harnesses/continue', label: 'Continue' },
      { href: '/harnesses/opencode', label: 'OpenCode' },
    ],
  },
];

export const CODING_FAQ: BuyerFaq[] = [
  {
    id: 'best',
    question: 'What is the best local coding model for 32GB VRAM?',
    answer:
      'Qwen3.6-35B-A3B at Q5 (UD-Q5_K_XL) on one 32 GB Radeon. It holds 262K context on the card. Official coding scores are on the Qwen card. Speed is measured on the local desktop with llama.cpp.',
    links: [{ href: CODING_MODEL_PATH, label: 'This page' }],
  },
  {
    id: 'one-gpu',
    question: 'Can Qwen3.6 35B run on one GPU with full context?',
    answer: 'Yes on 32 GB. The local desktop daily driver is one R9700, UD-Q5_K_XL, 262K, f16 KV.',
    links: [{ href: '/gpus/r9700', label: 'R9700' }],
  },
  {
    id: 'how-much-ctx',
    question: 'How much context do coding agents need?',
    answer:
      'Qwen recommends at least 128K. The published SWE and Terminal-Bench numbers used 200K–256K. Size the server at 262,144 when the card holds it.',
    links: [{ href: '/setup/coding-assistant', label: 'Coding assistant setup' }],
  },
];

export const CODING_PICK: BuyerPick = {
  title: 'What to buy',
  body: 'One R9700 is the whole GPU answer for a single coder. We omit a street price. Check the seller on marketplace listings.',
  href: BUY_R9700_HREF,
  label: 'Where to buy an R9700',
};

export const REQUIRED_CODING_HREFS = [
  '/setup/coding-assistant',
  '/harnesses',
  QWEN36_REQ_PATH,
  '/gpus/r9700',
  '/disclosure',
] as const;

export function codingBlob(): string {
  return [
    CODING_TITLE,
    CODING_DESCRIPTION,
    CODING_H1,
    CODING_LEAD,
    CODING_ANSWER,
    ...CODING_SECTIONS.map((row) => `${row.title} ${row.body ?? ''}`),
    ...CODING_FAQ.map((row) => `${row.question} ${row.answer}`),
    CODING_PICK.body,
  ].join('\n');
}

export function codingHrefs(): string[] {
  return uniqueHrefs([
    ...CODING_HUB,
    ...CODING_SECTIONS.flatMap((row) => row.links ?? []),
    ...CODING_FAQ.flatMap((row) => row.links),
    { href: CODING_PICK.href, label: CODING_PICK.label },
    { href: '/disclosure', label: 'Disclosure' },
  ]);
}

export function assertCodingValid(): string[] {
  const errors = assertBuyerCopy(codingBlob(), 'coding model');
  if (CODING_DESCRIPTION.length < 70 || CODING_DESCRIPTION.length > 160) {
    errors.push(`description length ${CODING_DESCRIPTION.length}`);
  }
  if (!/73\.4/.test(codingBlob())) errors.push('must cite SWE-bench 73.4');
  if (!/128K/.test(codingBlob())) errors.push('must cite 128K advice');
  const hrefs = codingHrefs();
  for (const required of REQUIRED_CODING_HREFS) {
    if (!hrefs.includes(required)) errors.push(`missing href ${required}`);
  }
  return errors;
}

void BUYER_PUBLISHED;
