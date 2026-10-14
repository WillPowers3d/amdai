/**
 * Cited shopper hub: Mixture-of-Experts on a Radeon GPU.
 * Official cards only for param / active / VRAM listings.
 * Measured 35B cells come from existing local-desktop llama.cpp Vulkan cards.
 * Q3 is a labeled estimate. Nothing below Q3. No invented tok/s or prices.
 * llama.cpp first. Strata only on the house Flash path already cited.
 */

import { houseSystemRam } from './house-ram';
import { FLASH_OFFLOAD_KITS, LLAMA_EXPERT_OFFLOAD_LAUNCH, STRATA_EXPERT_OFFLOAD_LAUNCH } from './flash-ram-offload';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { officialLinks } from './site';
import { oneVsTwoRows, COMPARE_ENGINE, COMPARE_MODEL, COMPARE_Q3, COMPARE_Q3_CITE } from './local-desktop-compare';
import type { RunCard } from './run-card';

export const MOE_PUBLISHED = '2026-10-14';
export const MOE_PATH = '/moe';
export const MOE_CITED_LABEL = 'Cited model cards · measured 35B cells only';
export const MOE_UNMEASURED = 'not measured yet';
export const MOE_SPEED_LABEL = 'not yet measured by AMDai';

export type MoeLink = { href: string; label: string };

export type MoeSource = {
  id: string;
  title: string;
  href: string;
};

export type MoeFitStory = {
  id: string;
  title: string;
  kind: 'moe-in-vram' | 'dense' | 'moe-offload';
  params: string;
  paramsCite: string;
  pick: string;
  fit: string;
  offload: boolean;
  links: MoeLink[];
};

export type MoeQuantRow = {
  id: string;
  family: '35b' | 'dense-36' | 'dense-38' | 'flash';
  quant: string;
  kind: 'cited' | 'measured' | 'q3-estimate';
  kindLabel: string;
  size: string;
  vram: string;
  speed: string;
  note: string;
};

export type MoeFaq = {
  id: string;
  question: string;
  answer: string;
  links: MoeLink[];
};

export const MOE_TITLE = 'Mixture-of-Experts on a Radeon GPU';
export const MOE_DESCRIPTION =
  'Mixture-of-Experts on a Radeon GPU. Why 35B-A3B fits one 32 GB R9700 while dense 27B and Flash differ. llama.cpp first. Q3 is a labeled estimate.';

export const MOE_LEAD =
  `A mixture-of-experts (MoE) model keeps a large pile of expert weights on disk and activates only a slice per token. A dense model runs every parameter. That is why amdai’s daily driver — ${COMPARE_MODEL} — fits one 32 GB Radeon AI PRO R9700 at UD-Q5_K_XL, while the dense 27B rows on /qwen and Flash-class MoE are different fit stories. Official cards only for param / active / file figures. Measured decode and VRAM are the official local-desktop ${COMPARE_MODEL} ${COMPARE_ENGINE} Vulkan sweep. Empty cells stay ${MOE_UNMEASURED}. ${COMPARE_Q3} is a labeled estimate (${COMPARE_Q3_CITE}). Q1/Q2 stay off. llama.cpp first.`;

export const MOE_WHAT = `
  Think of MoE as a library of specialists and a small dispatcher. Each token
  wakes a few experts (the A3B in ${COMPARE_MODEL} names that active slice)
  instead of ringing every neuron. Dense 27B files on this site — Qwen3.6 27B
  and Qwen3.8 27B — run the whole 27B-class stack every token. VRAM follows
  the file you load plus KV, not the marketing “35B vs 27B” headline. Flash
  is still MoE, but a much larger one: official Qwen3.8-Flash-Next is 125B
  total / 6B active plus a 51B n-gram embedding llama.cpp can keep in system
  RAM. That file usually needs DDR5 expert offload, not a single 32 GB sticker.
`.replace(/\s+/g, ' ').trim();

export const MOE_SOURCES: MoeSource[] = [
  { id: 'qwen36-card', title: 'Qwen3.6-35B-A3B official model card', href: officialLinks.qwen36 },
  { id: 'qwen36-gguf', title: 'unsloth/Qwen3.6-35B-A3B-GGUF', href: officialLinks.qwen36Gguf },
  { id: 'qwen36-27b-card', title: 'Qwen3.6-27B official model card', href: officialLinks.qwen36Dense },
  { id: 'qwen36-27b-gguf', title: 'unsloth/Qwen3.6-27B-GGUF', href: officialLinks.qwen36DenseGguf },
  { id: 'qwen38-27b-card', title: 'Qwen3.8-27B official model card', href: officialLinks.qwen38 },
  { id: 'qwen38-27b-gguf', title: 'unsloth/Qwen3.8-27B-GGUF', href: officialLinks.qwen38Gguf },
  { id: 'flash-card', title: 'Qwen3.8-Flash-Next official model card', href: officialLinks.qwenFlash },
  { id: 'flash-gguf', title: 'unsloth/Qwen3.8-Flash-Next-GGUF', href: officialLinks.qwenFlashGguf },
  { id: 'llama', title: 'llama.cpp repository', href: officialLinks.llamaCpp },
  { id: 'flash-offload', title: 'AMDai — Flash RAM offload', href: '/flash-ram-offload' },
  { id: 'qwen', title: 'AMDai — Qwen compare', href: '/qwen' },
  { id: 'glossary-moe', title: 'AMDai — MoE vs dense', href: '/glossary#moe' },
];

export const MOE_FIT_STORIES: MoeFitStory[] = [
  {
    id: '35b-a3b',
    title: '35B-A3B on one 32 GB R9700',
    kind: 'moe-in-vram',
    params: '35B total / 3B active',
    paramsCite: 'Official Qwen/Qwen3.6-35B-A3B card',
    pick: 'House daily driver: UD-Q5_K_XL on llama.cpp Vulkan, -c 262144, f16 KV, -ngl 99.',
    fit: 'Publisher listing 26.6 GB (Hugging Face Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf). Official overnight card: 25.97 GB VRAM at 4K and 29.34 GB at 256K on one R9700 — in-VRAM. Peak system RAM on that card is 37.32 GB at 4K and 42.9 GB at 256K (Linux GB). That is not an offload story.',
    offload: false,
    links: [
      { href: '/gpus/r9700', label: 'R9700' },
      { href: '/models/qwen36', label: '35B model page' },
      { href: '/recipes/qwen36-35b.llamacpp-vulkan.262k', label: '35B recipe' },
      { href: '/benchmarks', label: 'Benchmarks' },
    ],
  },
  {
    id: 'dense-27b',
    title: 'Dense 27B is a different file',
    kind: 'dense',
    params: '27.78B / 27.8B all active',
    paramsCite: 'Official Qwen3.6-27B and Qwen3.8-27B cards',
    pick: 'Cite the 27B rows on /qwen. Do not reuse 35B-A3B VRAM as a 27B rule.',
    fit: 'Dense means every parameter runs. Official Unsloth listings: Qwen3.6-27B Q6_K 22.52 GB, Q5_K_M 19.51 GB, Q4_K_M 16.82 GB; Qwen3.8-27B UD-Q6_K 21.98 GB, UD-Q5_K_M 19.77 GB, UD-Q4_K_M 16.46 GB. Decode on those files is not yet measured by AMDai. Size KV on the calculator. Q3 stays a labeled estimate.',
    offload: false,
    links: [
      { href: '/qwen', label: 'Qwen compare' },
      { href: '/models/qwen36-27b', label: 'Qwen3.6 27B' },
      { href: '/models/qwen38-27b', label: 'Qwen3.8 27B' },
      { href: '/compare/models', label: 'Compare models' },
    ],
  },
  {
    id: 'flash-offload',
    title: 'Flash-class MoE usually needs DDR5',
    kind: 'moe-offload',
    params: '125B total / 6B active + 51B n-gram',
    paramsCite: 'Official Qwen/Qwen3.8-Flash-Next card',
    pick: 'House fast-agent: UD-Q6_K_XL on Strata after llama.cpp works. Expert offload on DDR5.',
    fit: `Publisher UD-Q6_K_XL folder ~169 GB; UD-Q5_K_XL 158.3 GB; UD-Q4_K_XL ~111 GB. UD-Q3_K_XL ~90 GB is a labeled estimate. That file does not sit in 32 GB VRAM. Expert offload parks experts in system RAM — read ${RAM_MIN_LABEL} and ${RAM_FULL_LABEL}. Shopper kits on /flash-ram-offload are 128 / 192 / 256 GB, labeled estimate until a card overlays the kit.`,
    offload: true,
    links: [
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
      { href: '/models/flash', label: 'Flash model page' },
      { href: '/flash-daily', label: 'Flash daily' },
      { href: '/backends/strata', label: 'Strata' },
    ],
  },
];

export const MOE_QUANT_ROWS: MoeQuantRow[] = [
  {
    id: '35b-q6',
    family: '35b',
    quant: 'Q6_K',
    kind: 'measured',
    kindLabel: 'Measured',
    size: 'Publisher GB not listed on this row',
    vram: 'Overnight card — see measured table',
    speed: 'Overnight card — see measured table',
    note: 'Official local-desktop llama.cpp Vulkan sweep. No Hugging Face GB on this row — do not invent one.',
  },
  {
    id: '35b-q5xl',
    family: '35b',
    quant: 'UD-Q5_K_XL',
    kind: 'measured',
    kindLabel: 'Measured',
    size: '26.6 GB listing',
    vram: '25.97 GB at 4K · 29.34 GB at 256K',
    speed: 'Overnight card — see measured table',
    note: 'Hugging Face listing for Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf (26.6 GB). House daily driver.',
  },
  {
    id: '35b-q5',
    family: '35b',
    quant: 'Q5_K_M',
    kind: 'measured',
    kindLabel: 'Measured',
    size: 'Publisher GB not listed on this row',
    vram: 'Overnight card — see measured table',
    speed: 'Overnight card — see measured table',
    note: 'Official local-desktop llama.cpp Vulkan sweep. No Hugging Face GB on this row.',
  },
  {
    id: '35b-q4',
    family: '35b',
    quant: 'Q4_K_M',
    kind: 'measured',
    kindLabel: 'Measured',
    size: 'Publisher GB not listed on this row',
    vram: 'Overnight card — see measured table',
    speed: 'Overnight card — see measured table',
    note: 'Official local-desktop llama.cpp Vulkan sweep. No Hugging Face GB on this row.',
  },
  {
    id: '35b-q3',
    family: '35b',
    quant: COMPARE_Q3,
    kind: 'q3-estimate',
    kindLabel: 'Q3 estimate',
    size: '16.8 GB listing',
    vram: 'Estimate — not a local-desktop run',
    speed: MOE_UNMEASURED,
    note: `${COMPARE_Q3_CITE}. Q3 is a labeled estimate — not a local-desktop run. Q1/Q2 stay off.`,
  },
  {
    id: 'd36-q6',
    family: 'dense-36',
    quant: 'Q6_K',
    kind: 'cited',
    kindLabel: 'Cited',
    size: '22.52 GB listing',
    vram: 'Estimate — size on the calculator',
    speed: MOE_SPEED_LABEL,
    note: 'Hugging Face LFS size for unsloth/Qwen3.6-27B-GGUF Qwen3.6-27B-Q6_K.gguf (22.52 GB). Dense.',
  },
  {
    id: 'd36-q5',
    family: 'dense-36',
    quant: 'Q5_K_M',
    kind: 'cited',
    kindLabel: 'Cited',
    size: '19.51 GB listing',
    vram: 'Estimate — size on the calculator',
    speed: MOE_SPEED_LABEL,
    note: 'Hugging Face LFS size for unsloth/Qwen3.6-27B-GGUF Qwen3.6-27B-Q5_K_M.gguf (19.51 GB). Dense.',
  },
  {
    id: 'd36-q4',
    family: 'dense-36',
    quant: 'Q4_K_M',
    kind: 'cited',
    kindLabel: 'Cited',
    size: '16.82 GB listing',
    vram: 'Estimate — size on the calculator',
    speed: MOE_SPEED_LABEL,
    note: 'Hugging Face LFS size for unsloth/Qwen3.6-27B-GGUF Qwen3.6-27B-Q4_K_M.gguf (16.82 GB). Dense.',
  },
  {
    id: 'd36-q3',
    family: 'dense-36',
    quant: 'UD-Q3_K_XL',
    kind: 'q3-estimate',
    kindLabel: 'Q3 estimate',
    size: '14.47 GB listing',
    vram: 'Estimate — not a local-desktop run',
    speed: MOE_UNMEASURED,
    note: 'Hugging Face LFS size for unsloth/Qwen3.6-27B-GGUF Qwen3.6-27B-UD-Q3_K_XL.gguf (14.47 GB). Q3 is a labeled estimate.',
  },
  {
    id: 'd38-q6',
    family: 'dense-38',
    quant: 'UD-Q6_K',
    kind: 'cited',
    kindLabel: 'Cited',
    size: '21.98 GB listing',
    vram: 'Estimate — size on the calculator',
    speed: MOE_SPEED_LABEL,
    note: 'Hugging Face LFS size for unsloth/Qwen3.8-27B-GGUF Qwen3.8-27B-UD-Q6_K.gguf (21.98 GB). Dense.',
  },
  {
    id: 'd38-q5',
    family: 'dense-38',
    quant: 'UD-Q5_K_M',
    kind: 'cited',
    kindLabel: 'Cited',
    size: '19.77 GB listing',
    vram: 'Estimate — size on the calculator',
    speed: MOE_SPEED_LABEL,
    note: 'Hugging Face LFS size for unsloth/Qwen3.8-27B-GGUF Qwen3.8-27B-UD-Q5_K_M.gguf (19.77 GB). Dense.',
  },
  {
    id: 'd38-q4',
    family: 'dense-38',
    quant: 'UD-Q4_K_M',
    kind: 'cited',
    kindLabel: 'Cited',
    size: '16.46 GB listing',
    vram: 'Estimate — size on the calculator',
    speed: MOE_SPEED_LABEL,
    note: 'Hugging Face LFS size for unsloth/Qwen3.8-27B-GGUF Qwen3.8-27B-UD-Q4_K_M.gguf (16.46 GB). Dense.',
  },
  {
    id: 'd38-q3',
    family: 'dense-38',
    quant: 'UD-Q3_K_XL',
    kind: 'q3-estimate',
    kindLabel: 'Q3 estimate',
    size: '13.15 GB listing',
    vram: 'Estimate — not a local-desktop run',
    speed: MOE_UNMEASURED,
    note: 'Hugging Face LFS size for unsloth/Qwen3.8-27B-GGUF Qwen3.8-27B-UD-Q3_K_XL.gguf (13.15 GB). Q3 is a labeled estimate.',
  },
  {
    id: 'flash-q6',
    family: 'flash',
    quant: 'UD-Q6_K_XL',
    kind: 'cited',
    kindLabel: 'Cited',
    size: '~169 GB listing',
    vram: 'Does not fit 32 GB — expert offload',
    speed: 'Flash cards live on /flash-ram-offload',
    note: 'Hugging Face folder listing for UD-Q6_K_XL (~169 GB across 6 shards). House Flash file.',
  },
  {
    id: 'flash-q5',
    family: 'flash',
    quant: 'UD-Q5_K_XL',
    kind: 'cited',
    kindLabel: 'Cited',
    size: '158.3 GB listing',
    vram: 'Does not fit 32 GB — expert offload',
    speed: 'Flash cards live on /flash-ram-offload',
    note: 'Unsloth docs listing for UD-Q5_K_XL (158.3 GB). Hugging Face folder lists 158 GB across 6 shards.',
  },
  {
    id: 'flash-q4',
    family: 'flash',
    quant: 'UD-Q4_K_XL',
    kind: 'cited',
    kindLabel: 'Cited',
    size: '~111 GB listing',
    vram: 'Does not fit 32 GB — expert offload',
    speed: 'Flash cards live on /flash-ram-offload',
    note: 'Hugging Face folder listing for UD-Q4_K_XL (~111 GB across 4 shards).',
  },
  {
    id: 'flash-q3',
    family: 'flash',
    quant: 'UD-Q3_K_XL',
    kind: 'q3-estimate',
    kindLabel: 'Q3 estimate',
    size: '~90 GB listing',
    vram: 'Estimate — not a local-desktop run we treat as house',
    speed: MOE_UNMEASURED,
    note: 'Hugging Face folder listing for UD-Q3_K_XL (~90 GB across 3 shards; LFS sizes sum 89.99 GB). Q3 is a labeled estimate.',
  },
];

export const MOE_HOUSE_LAUNCH = [
  '# House daily-driver shape — /recipes/qwen36-35b.llamacpp-vulkan.262k',
  './build-vk/bin/llama-server \\',
  '  -m ~/models/Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf \\',
  '  -ngl 99 \\',
  '  -c 262144 \\',
  '  --cache-type-k f16 \\',
  '  --cache-type-v f16 \\',
  '  --host 127.0.0.1 --port 8080',
].join('\n');

export const MOE_EXPERT_OFFLOAD_LAUNCH = LLAMA_EXPERT_OFFLOAD_LAUNCH;
export const MOE_STRATA_OFFLOAD_LAUNCH = STRATA_EXPERT_OFFLOAD_LAUNCH;

export const MOE_OFFLOAD_NOTE = `
  Expert offload is an MoE-only lever: keep attention on the GPU and park
  expert tensors in system RAM. llama.cpp flags are -ot (tensor override regex)
  and --n-cpu-moe (how many experts stay on CPU). Exact regex and N from the
  rig owner are not recorded — copy the shape on /flash-ram-offload, do not
  invent values. Wherever offload appears, shopper lines stay
  ${RAM_MIN_LABEL} (full system estimate: offloaded weights + OS / cache /
  headroom, rounded up to a real kit such as 192 or 256 GB, labeled estimate
  until measured) and ${RAM_FULL_LABEL} (262K with cache; measured numbers
  only when a card exists). House 35B on one R9700 does not offload.
  Flash kits on this site are ${FLASH_OFFLOAD_KITS.join(' / ')} GB.
`.replace(/\s+/g, ' ').trim();

export const MOE_STACK_LAB_NOTE = `
  Open in Stack Lab is allowlisted only. House recipes on this page are the
  daily 35B llama.cpp Vulkan pin and the Flash Strata pin, plus doctor.
  There is no allowlisted Stack Lab screen for an amdai-bench MoE
  expert-offload A/B. Do not invent a deep link. Measure expert offload on
  your box from /stack-lab planner and /amdai-bench. The gap stays on /wanted
  until that screen exists.
`.replace(/\s+/g, ' ').trim();

export const MOE_SPLIT_NOTE = `
  A second card is a split or a second process, not a magic MoE switch.
  Mixing RDNA generations and two-card 35B vs Flash live on /multi-gpu and
  the cited how-to /setup/multi-gpu. We do not invent a combo-preset tok/s.
  House 35B already fits one 32 GB R9700 at UD-Q5_K_XL. Buy the second card
  for a file that does not fit, or to run two models.
`.replace(/\s+/g, ' ').trim();

export const MOE_FAQ: MoeFaq[] = [
  {
    id: 'moe-vs-dense',
    question: 'MoE vs dense — why does 35B fit 32 GB when 27B looks smaller?',
    answer:
      'MoE activates a slice. Official Qwen3.6-35B-A3B is 35B total / 3B active. Dense Qwen3.6 27B and Qwen3.8 27B run the whole 27B-class stack. File size plus KV is the VRAM question, not the headline parameter count. Official UD-Q5_K_XL 35B on one R9700 is 25.97 GB VRAM at 4K and 29.34 GB at 256K. Dense 27B listings live on /qwen. Decode on those 27B files is not yet measured by AMDai.',
    links: [
      { href: '/glossary#moe', label: 'MoE vs dense' },
      { href: '/qwen', label: 'Qwen compare' },
      { href: '/gpus/r9700', label: 'R9700' },
    ],
  },
  {
    id: 'which-quant',
    question: 'Which 35B quant should I start with?',
    answer: `House daily driver is UD-Q5_K_XL (26.6 GB listing). The overnight llama.cpp Vulkan sweep also recorded Q6_K, Q5_K_M, and Q4_K_M. ${COMPARE_Q3} (16.8 GB listing) is a labeled estimate — not a local-desktop run. Nothing below Q3. Size a different card on /can-run and the calculator.`,
    links: [
      { href: '/quants', label: 'Quants' },
      { href: '/compare/q4-q5-q6', label: 'Q6 / Q5 / Q4 + Q3 estimate' },
      { href: '/can-run', label: 'Can my Radeon run it?' },
      { href: '/calculator', label: 'Calculator' },
    ],
  },
  {
    id: 'flash-vs-35b',
    question: 'Is Flash just a bigger 35B?',
    answer:
      'No. Flash is a different MoE. Official Qwen3.8-Flash-Next is 125B total / 6B active plus a 51B n-gram embedding. Publisher UD-Q6_K_XL is ~169 GB and usually needs DDR5 expert offload. Strata is the house Flash try after llama.cpp works — that citation already lives on /flash-ram-offload. Do not reuse 35B VRAM as a Flash rule.',
    links: [
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
      { href: '/models/flash', label: 'Flash model page' },
      { href: '/glossary#expert-offload', label: 'Expert offload' },
    ],
  },
  {
    id: 'stack-lab-ab',
    question: 'Is there an Open in Stack Lab MoE expert-offload A/B?',
    answer:
      'No. That screen is not allowlisted. Do not invent a deep link. Open the daily 35B recipe, the Flash recipe, or doctor. Measure expert offload on your box with /stack-lab planner and an amdai-bench card. The gap is on /wanted.',
    links: [
      { href: '/stack-lab', label: 'Stack Lab' },
      { href: '/amdai-bench', label: 'amdai-bench' },
      { href: '/wanted', label: 'Wanted' },
    ],
  },
];

export const MOE_SECTIONS = [
  { id: 'what-it-is', label: 'MoE vs dense' },
  { id: 'three-fits', label: 'Three fit stories' },
  { id: 'quants', label: 'Quant ladder' },
  { id: 'measured', label: 'Measured 35B' },
  { id: 'offload', label: 'Expert offload' },
  { id: 'stack-lab', label: 'Stack Lab' },
  { id: 'split', label: 'Two cards' },
  { id: 'faq', label: 'FAQ' },
  { id: 'sources', label: 'Sources' },
] as const;

export const MOE_HUB: MoeLink[] = [
  { href: '/flash-ram-offload', label: 'Flash RAM offload' },
  { href: '/gpus/r9700', label: 'R9700' },
  { href: '/qwen', label: 'Qwen compare' },
  { href: '/models', label: 'Models' },
  { href: '/glossary#moe', label: 'MoE vs dense' },
  { href: '/glossary#expert-offload', label: 'Expert offload' },
  { href: '/multi-gpu', label: 'Dual / multi-GPU' },
  { href: '/setup/multi-gpu', label: 'Multi-GPU how-to' },
  { href: '/tuning', label: 'Speed up llama.cpp' },
  { href: '/out-of-vram', label: 'Out of VRAM' },
  { href: '/constrained-decoding', label: 'Constrained decoding' },
  { href: '/can-run', label: 'Can my Radeon run it?' },
  { href: '/compare/models', label: 'Compare models' },
  { href: '/benchmarks', label: 'Benchmarks' },
];

export const REQUIRED_MOE_HREFS = [
  '/flash-ram-offload',
  '/gpus/r9700',
  '/qwen',
  '/models',
  '/glossary#moe',
  '/glossary#expert-offload',
  '/multi-gpu',
  '/setup/multi-gpu',
  '/tuning',
  '/out-of-vram',
  '/constrained-decoding',
  '/can-run',
  '/compare/models',
  '/benchmarks',
  '/models/qwen36',
  '/models/flash',
  '/models/qwen36-27b',
  '/models/qwen38-27b',
  '/calculator',
  '/stack-lab',
  '/amdai-bench',
  '/backends/llamacpp',
  '/backends/strata',
  '/wanted',
  '/faq',
  '/recipes/qwen36-35b.llamacpp-vulkan.262k',
] as const;

export const MOE_HOWTO_STEPS = [
  {
    name: 'Read MoE vs dense',
    text: 'MoE activates a slice per token. Dense runs every parameter. Official Qwen3.6-35B-A3B is 35B total / 3B active. Dense 27B rows on /qwen are a different file.',
  },
  {
    name: 'Start with the 35B daily driver',
    text: 'House path is Qwen3.6-35B-A3B UD-Q5_K_XL on llama.cpp Vulkan, one R9700, -c 262144, f16 KV. Official listing 26.6 GB. Measured peak VRAM 25.97 GB at 4K and 29.34 GB at 256K.',
  },
  {
    name: 'Size dense 27B separately',
    text: 'Cite official Qwen3.6-27B and Qwen3.8-27B listings. Do not reuse 35B-A3B VRAM. Decode on those files is not yet measured by AMDai. Q3 stays a labeled estimate.',
  },
  {
    name: 'Treat Flash as expert offload',
    text: 'Official Flash is 125B / 6B plus a 51B n-gram embedding. Publisher UD-Q6_K_XL ~169 GB. Copy the llama.cpp expert-offload shape on /flash-ram-offload. Print both RAM lines. Strata is the house Flash try.',
  },
  {
    name: 'Measure on your box',
    text: 'Open the allowlisted daily or Flash Stack Lab recipe, or doctor. There is no allowlisted MoE expert-offload A/B screen. Record an amdai-bench card.',
  },
];

export type MoeMeasuredRow = {
  quant: string;
  kind: 'measured' | 'q3-estimate';
  decode4k: string;
  decode32k: string;
  note: string;
  runIds: string[];
};

export function moeMeasuredRows(cards: RunCard[]): MoeMeasuredRow[] {
  const table = oneVsTwoRows(cards);
  const quants = ['Q6_K', 'UD-Q5_K_XL', 'Q5_K_M', 'Q4_K_M'] as const;
  const rows: MoeMeasuredRow[] = quants.map((quant) => {
    const at4k = table.find((row) => row.quant === quant && row.context === 4096);
    const at32k = table.find((row) => row.quant === quant && row.context === 32768);
    const decode4k = at4k?.one.decode ?? MOE_UNMEASURED;
    const decode32k = at32k?.one.decode ?? MOE_UNMEASURED;
    const runIds = [...new Set([...(at4k?.one.runIds ?? []), ...(at32k?.one.runIds ?? [])])];
    return {
      quant,
      kind: 'measured',
      decode4k,
      decode32k,
      note: 'Official local-desktop llama.cpp Vulkan, one R9700.',
      runIds,
    };
  });
  rows.push({
    quant: COMPARE_Q3,
    kind: 'q3-estimate',
    decode4k: MOE_UNMEASURED,
    decode32k: MOE_UNMEASURED,
    note: `${COMPARE_Q3_CITE}. Q3 is a labeled estimate — not a local-desktop run.`,
    runIds: [],
  });
  return rows;
}

export function moeDailyRamNeed() {
  return houseSystemRam('daily');
}

export function moeFlashRamNeed() {
  return houseSystemRam('flash');
}

export function moeBlob(): string {
  return [
    MOE_TITLE,
    MOE_DESCRIPTION,
    MOE_LEAD,
    MOE_CITED_LABEL,
    MOE_UNMEASURED,
    MOE_SPEED_LABEL,
    MOE_WHAT,
    MOE_OFFLOAD_NOTE,
    MOE_STACK_LAB_NOTE,
    MOE_SPLIT_NOTE,
    MOE_HOUSE_LAUNCH,
    MOE_EXPERT_OFFLOAD_LAUNCH,
    MOE_STRATA_OFFLOAD_LAUNCH,
    ...MOE_FIT_STORIES.map((row) => `${row.title} ${row.params} ${row.paramsCite} ${row.pick} ${row.fit}`),
    ...MOE_QUANT_ROWS.map((row) => `${row.quant} ${row.kindLabel} ${row.size} ${row.vram} ${row.speed} ${row.note}`),
    ...MOE_FAQ.map((row) => `${row.question} ${row.answer}`),
    ...MOE_HOWTO_STEPS.map((row) => `${row.name} ${row.text}`),
    COMPARE_Q3,
    COMPARE_Q3_CITE,
    RAM_MIN_LABEL,
    RAM_FULL_LABEL,
  ].join('\n');
}

export function moeHrefs(): string[] {
  const links: MoeLink[] = [
    ...MOE_HUB,
    ...MOE_FIT_STORIES.flatMap((row) => row.links),
    ...MOE_FAQ.flatMap((row) => row.links),
    ...MOE_SOURCES.map((source) => ({ href: source.href, label: source.title })),
    { href: '/faq', label: 'FAQ' },
    { href: '/wanted', label: 'Wanted' },
    { href: '/stack-lab', label: 'Stack Lab' },
    { href: '/amdai-bench', label: 'amdai-bench' },
    { href: '/backends/llamacpp', label: 'llama.cpp' },
    { href: '/calculator', label: 'Calculator' },
  ];
  return [...new Set(links.map((link) => link.href))];
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function assertMoeValid(cards: RunCard[] = []): string[] {
  const errors: string[] = [];
  const blob = moeBlob();
  const hrefs = moeHrefs();
  if (MOE_TITLE !== 'Mixture-of-Experts on a Radeon GPU') errors.push('title drifted');
  if (MOE_DESCRIPTION.length < 70 || MOE_DESCRIPTION.length > 160) errors.push('description length');
  if (MOE_CITED_LABEL !== 'Cited model cards · measured 35B cells only') errors.push('cited label drifted');
  if (MOE_UNMEASURED !== 'not measured yet') errors.push('empty-cell label drifted');
  if (!/llama\.cpp/i.test(blob)) errors.push('must keep llama.cpp first');
  if (!/35B total \/ 3B active/.test(blob)) errors.push('must cite official 35B / 3B');
  if (!/125B total \/ 6B active/.test(blob)) errors.push('must cite official Flash 125B / 6B');
  if (!/27\.78B/.test(blob) || !/27\.8B/.test(blob)) errors.push('must cite official dense 27B params');
  if (!/26\.6 GB/.test(blob)) errors.push('must cite official UD-Q5 listing');
  if (!/25\.97 GB/.test(blob) || !/29\.34 GB/.test(blob)) errors.push('must cite measured 35B VRAM');
  if (!/16\.8 GB/.test(blob)) errors.push('must cite official Q3 listing');
  if (!/169 GB/.test(blob)) errors.push('must cite official Flash Q6 listing');
  if (!/22\.52 GB/.test(blob) || !/21\.98 GB/.test(blob)) errors.push('must cite official dense 27B Q6 listings');
  if (!/labeled estimate/.test(blob)) errors.push('Q3 must stay a labeled estimate');
  if (!blob.includes(COMPARE_Q3)) errors.push('must list Q3 estimate');
  if (!/Q6_K/.test(blob) || !/Q5_K_M/.test(blob) || !/Q4_K_M/.test(blob)) errors.push('must list Q6/Q5/Q4');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) errors.push('RAM lines missing');
  if (!/192/.test(blob) || !/256/.test(blob)) errors.push('must name 192 and 256 GB kits');
  if (!/--n-cpu-moe not recorded/.test(blob) || !/-ot not recorded/.test(blob)) {
    errors.push('must keep expert-offload flags unrecorded');
  }
  if (!/no allowlisted/.test(blob) && !/not allowlisted/.test(blob)) {
    errors.push('must refuse an invented Stack Lab expert-offload A/B');
  }
  if (!/Strata/.test(blob) || !/\/flash-ram-offload/.test(blob)) {
    errors.push('Strata must stay on the house Flash path');
  }
  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');
  if (/\b\d+(?:\.\d+)?\s*tok\/s\b/i.test(blob)) errors.push('tok/s must come from the measured table, not lib copy');
  if (MOE_FIT_STORIES.some((row) => row.offload && (!row.fit.includes(RAM_MIN_LABEL) || !row.fit.includes(RAM_FULL_LABEL)))) {
    errors.push('offload stories must show both RAM lines');
  }
  const families = new Set(MOE_QUANT_ROWS.map((row) => row.family));
  if (![...families].every((id) => ['35b', 'dense-36', 'dense-38', 'flash'].includes(id))) {
    errors.push('quant families drifted');
  }
  if (!MOE_QUANT_ROWS.some((row) => row.kind === 'q3-estimate' && row.quant === COMPARE_Q3)) {
    errors.push('35B Q3 must stay a labeled estimate');
  }
  if (MOE_QUANT_ROWS.filter((row) => row.kind === 'q3-estimate').some((row) => row.speed !== MOE_UNMEASURED && row.speed !== MOE_SPEED_LABEL)) {
    errors.push('Q3 rows must not invent speed');
  }
  const daily = moeDailyRamNeed();
  const flash = moeFlashRamNeed();
  if (!daily) errors.push('daily house RAM missing');
  if (!flash) errors.push('flash house RAM missing');
  for (const required of REQUIRED_MOE_HREFS) {
    if (!hrefs.some((href) => href === required || href.startsWith(`${required}`))) {
      errors.push(`missing required href ${required}`);
    }
  }
  if (cards.length) {
    const rows = moeMeasuredRows(cards);
    if (rows.length !== 5) errors.push('measured table must be Q6/Q5xl/Q5/Q4 + Q3');
    const q3 = rows.find((row) => row.kind === 'q3-estimate');
    if (!q3 || q3.decode4k !== MOE_UNMEASURED) errors.push('Q3 row must stay unmeasured');
    const q5 = rows.find((row) => row.quant === 'UD-Q5_K_XL');
    if (!q5 || q5.decode4k === MOE_UNMEASURED) errors.push('UD-Q5_K_XL 4K must stay a measured cell');
    if (!/tok\/s/.test(q5?.decode4k ?? '')) errors.push('measured cell must keep tok/s from the card');
    for (const row of rows) {
      if (row.kind === 'measured' && row.decode4k !== MOE_UNMEASURED && !row.runIds.length) {
        errors.push(`${row.quant} measured cell missing run ids`);
      }
    }
  }
  return [...new Set(errors)];
}

export { COMPARE_Q3, COMPARE_Q3_CITE, COMPARE_MODEL, RAM_FULL_LABEL, RAM_MIN_LABEL, FLASH_OFFLOAD_KITS };
