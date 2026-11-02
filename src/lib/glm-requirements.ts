/**
 * /models/glm-53-flash/requirements — GLM 5.3 Flash RAM / VRAM hub at 256K.
 * All RAM and speed figures are estimates. Nothing measured on the local desktop yet.
 */

import {
  BUYER_CHECKED,
  BUYER_PUBLISHED,
  FLASH_REQ_PATH,
  GLM_REQ_PATH,
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

export const GLM_REQ_TITLE = 'GLM 5.3 Flash hardware requirements on Radeon';
export const GLM_REQ_DESCRIPTION =
  'How much RAM and VRAM GLM 5.3 Flash needs at Q4, Q5 and Q6 with 256K context, on one or two Radeon cards, and when a cheaper model is the better buy.';
export const GLM_REQ_H1 = 'GLM 5.3 Flash VRAM, RAM and GPU requirements (256K context)';
export const GLM_REQ_KICKER = 'Requirements hub · estimate only · llama.cpp first';

export const GLM_Q4_GIB = 186.0;

export const GLM_REQ_LEAD =
  'GLM 5.3 Flash is a 320B-total, 18B-active MoE. Even at Q4 (UD-Q4_K_XL, 186.0 GiB of weights) it does not fit on any consumer Radeon, so most of the experts live in system RAM.';

export const GLM_REQ_ANSWER =
  'At 256K context you need a 192 GB DDR5 kit for Q4 (with one or two 24–32 GB cards) and 256 GB for Q5 on one card or Q6 on two R9700s. Expect single-digit to about 10 tokens per second on a desktop (estimate, not yet measured on the local desktop). If you do not specifically need GLM, Qwen 3.8 Flash at Q4 on two R9700s runs at 256K in a 96 GB kit, faster, for much less RAM.';

export const GLM_REQ_SOURCES: BuyerSource[] = [
  {
    id: 'S-HF',
    title: 'zai-org/GLM-5.3-Flash model card',
    href: officialLinks.glm53Flash,
    checked: BUYER_CHECKED,
    sourceDate: 'read 2026-11-02',
    thirdParty: true,
  },
  {
    id: 'S-GGUF',
    title: 'unsloth/GLM-5.3-Flash-GGUF — UD-Q4_K_XL 186.0 GiB',
    href: officialLinks.glm53FlashGguf,
    checked: BUYER_CHECKED,
    sourceDate: '199.71 decimal GB listing = 186.0 GiB',
    thirdParty: true,
  },
  {
    id: 'S-CALC',
    title: 'AMDai calculator RAM kits at 262K',
    href: '/calculator?model=glm-53-flash&ctx=262144',
    checked: BUYER_CHECKED,
    sourceDate: 'site calculator; KV ~5 GiB at 256K f16 (11 of 45 layers keep a growing cache)',
    thirdParty: false,
  },
];

export const GLM_REQ_HUB: BuyerLink[] = [
  { href: '/models/glm-53-flash', label: 'GLM 5.3 Flash' },
  { href: FLASH_REQ_PATH, label: 'Qwen 3.8 Flash requirements' },
  { href: QWEN36_REQ_PATH, label: '35B requirements' },
  { href: '/can-run', label: 'Can my Radeon run it?' },
  { href: '/compare/models/flash-vs-glm-53-flash', label: 'Flash vs GLM' },
  { href: '/gpus/r9700', label: 'R9700' },
];

export const GLM_REQ_SECTIONS: BuyerSection[] = [
  {
    id: 'table',
    title: 'RAM kit needed at 262,144 context (estimate)',
    body: 'Hugging Face file sizes, tensor groups from the GGUF headers, and the attention cache from the official config (only 11 of 45 layers keep a growing cache, so 256K costs about 5 GiB at f16). Assumes llama.cpp with experts offloaded to RAM. All estimates until a host-RAM run card exists. Q3 and below are not covered.',
    table: {
      caption: 'GLM 5.3 Flash RAM kits at 262K. Estimates. Not measured on the local desktop.',
      headers: ['Your GPU setup', 'UD-Q4_K_XL', 'UD-Q5_K_XL', 'UD-Q6_K_XL'],
      rows: [
        ['1× 16 GB card', '256 GB (needs ~190 GiB)', '256 GB (~228)', 'does not fit in 256 GB'],
        ['1× 24 GB card', '192 GB, very tight (~183, 3.7 spare)', '256 GB (~221)', 'does not fit'],
        ['1× R9700 (32 GB)', '192 GB (~175)', '256 GB (~213)', 'does not fit'],
        ['1× 48 GB (W7900)', '192 GB (~159)', '256 GB (~197)', '256 GB, tight (~245)'],
        ['2× R9700 (64 GB)', '192 GB (~147)', '192 GB tight (~184, 2.4 spare); 256 safer', '256 GB (~232)'],
      ],
    },
  },
  {
    id: 'speed',
    title: 'How fast? (estimate)',
    body: 'The token rate is set by how fast your RAM feeds the experts, not by the GPU. A bandwidth model puts two R9700s with DDR5 at a ceiling of about 10.7 / 8.8 / 7.1 tok/s for Q4 / Q5 / Q6. Real llama.cpp runs usually land well under the ceiling (about 4–7 tok/s for Q4 on a 192 GB, 4-stick kit). Four sticks on AM5 also run slower than two (AMD lists DDR5-3600 with 4 DIMMs vs 5600 with 2). Measured numbers will replace these when we have them on the local desktop.',
  },
  {
    id: 'worth',
    title: 'Is GLM 5.3 Flash worth the RAM?',
    body: 'Buy for GLM only if you want this specific model (for example its MIT-style license, see its Hugging Face card) and accept slow output. For a fast daily driver, the 35B on one R9700 (about 100 tok/s measured on the local desktop) or Qwen 3.8 Flash on two R9700s (96 GB) gets far more done. More RAM buys a bigger, smarter, much slower model.',
    links: [
      { href: FLASH_REQ_PATH, label: 'Flash at 96 GB' },
      { href: QWEN36_REQ_PATH, label: '35B at 32 GB VRAM' },
    ],
  },
  {
    id: 'nothing',
    title: 'Buy-nothing paths',
    body: 'Already have 128 GB? GLM at Q4+ will not fit at 256K; run Qwen 3.8 Flash UD-Q5 on two cards instead. Use a hosted GLM API for occasional long jobs and keep the desktop on the 35B. Strix Halo cannot run GLM at Q4+: its memory is soldered (max 128 GB) and the Q4 weights alone are 186 GiB.',
    links: [
      { href: '/models/glm-53-flash', label: 'GLM model page' },
      { href: '/gpus/strix-halo', label: 'Strix Halo' },
    ],
  },
];

export const GLM_REQ_FAQ: BuyerFaq[] = [
  {
    id: 'vram',
    question: 'How much VRAM does GLM 5.3 Flash need?',
    answer:
      'Any 16 GB+ card works as the attention-and-shared GPU; the experts go to system RAM. More VRAM only trims the RAM need (about 28 GiB less from one R9700 to two).',
    links: [{ href: GLM_REQ_PATH, label: 'GLM requirements' }],
  },
  {
    id: 'ram',
    question: 'How much RAM for GLM 5.3 Flash?',
    answer: '192 GB for Q4 at 256K, 256 GB for Q5 on one card or Q6 on two cards. Estimates. Not measured on the local desktop.',
    links: [{ href: '/calculator', label: 'Calculator' }],
  },
  {
    id: 'strix',
    question: 'Can Strix Halo run GLM 5.3 Flash?',
    answer: 'Not at Q4 or above: its 128 GB is soldered and the Q4 weights alone are 186 GiB.',
    links: [{ href: '/gpus/strix-halo', label: 'Strix Halo' }],
  },
  {
    id: '16gb',
    question: 'Can I run it with 16 GB VRAM?',
    answer: 'Yes at Q4 with a 256 GB kit, slowly. Estimate only.',
    links: [{ href: '/can-run', label: 'Can my Radeon run it?' }],
  },
];

export const GLM_REQ_PICK: BuyerPick = {
  title: 'Most readers should buy 96 GB for Qwen Flash instead',
  body: 'A 192 GB or 256 GB kit is the GLM path. We omit street prices unless we read the listing today. Most builds should stay on 96 GB DDR5 and Qwen 3.8 Flash Q4. Check current 192 GB kits only if you already know you want this model.',
  href: '/go/newegg/ddr5-192',
  label: 'Check 192 GB kits at Newegg',
  productId: 'ddr5-192',
};

export const REQUIRED_GLM_REQ_HREFS = [
  '/models/glm-53-flash',
  FLASH_REQ_PATH,
  QWEN36_REQ_PATH,
  '/can-run',
  '/calculator',
  '/gpus/r9700',
  '/gpus/strix-halo',
  '/disclosure',
] as const;

export function glmReqBlob(): string {
  return [
    GLM_REQ_TITLE,
    GLM_REQ_DESCRIPTION,
    GLM_REQ_H1,
    GLM_REQ_LEAD,
    GLM_REQ_ANSWER,
    ...GLM_REQ_SECTIONS.map((row) => `${row.title} ${row.body ?? ''}`),
    ...GLM_REQ_FAQ.map((row) => `${row.question} ${row.answer}`),
    GLM_REQ_PICK.body,
  ].join('\n');
}

export function glmReqHrefs(): string[] {
  return uniqueHrefs([
    ...GLM_REQ_HUB,
    ...GLM_REQ_SECTIONS.flatMap((row) => row.links ?? []),
    ...GLM_REQ_FAQ.flatMap((row) => row.links),
    { href: GLM_REQ_PICK.href, label: GLM_REQ_PICK.label },
    { href: '/disclosure', label: 'Disclosure' },
  ]);
}

export function assertGlmReqValid(): string[] {
  const errors = assertBuyerCopy(glmReqBlob(), 'GLM requirements');
  if (GLM_REQ_DESCRIPTION.length < 70 || GLM_REQ_DESCRIPTION.length > 160) {
    errors.push(`description length ${GLM_REQ_DESCRIPTION.length}`);
  }
  if (!/186/.test(glmReqBlob())) errors.push('must cite 186 GiB Q4');
  if (!/soldered/.test(glmReqBlob())) errors.push('must say Strix Halo is soldered');
  if (!/96 GB/.test(glmReqBlob())) errors.push('must point at 96 GB Flash');
  if (!/not yet measured|Not measured/.test(glmReqBlob())) errors.push('must label unmeasured');
  const hrefs = glmReqHrefs();
  for (const required of REQUIRED_GLM_REQ_HREFS) {
    if (!hrefs.includes(required)) errors.push(`missing href ${required}`);
  }
  return errors;
}

void BUYER_PUBLISHED;
void GLM_Q4_GIB;
