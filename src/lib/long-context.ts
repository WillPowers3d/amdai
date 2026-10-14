/**
 * Cited consumer guide for long context (128K–262K) on Radeon.
 * Numbers come from existing local-desktop amdai-bench/run@1 cards only.
 * Empty cells stay “not measured yet.” Q3 is a labeled estimate.
 */

import { GATE_COPY } from './recipes';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import {
  FLASH_OFFLOAD_CONTEXT_LABEL,
  FLASH_OFFLOAD_CONTEXTS,
  dimmSpeedRows,
  flashSpeedGrid,
  type DimmSpeedRow,
  type FlashSpeedRow,
} from './flash-ram-offload';
import { runs } from './run-card-data';
import {
  COMPARE_CONTEXTS,
  COMPARE_ENGINE,
  COMPARE_MODEL,
  COMPARE_Q3,
  COMPARE_Q3_CITE,
  COMPARE_QUANTS,
  SWEEP_REVERIFY,
  quantCompareRows,
  type QuantColumn,
  type QuantCompareRow,
} from './local-desktop-compare';

export const LONG_CONTEXT_PUBLISHED = '2026-10-13';
export const LONG_CONTEXT_EMPTY = 'not measured yet';
export const LONG_CONTEXT_TITLE = 'Long context on Radeon';
export const LONG_CONTEXT_DESCRIPTION =
  'Run 128K–262K locally on Radeon. Measured 35B llama.cpp cards from local-desktop. f16 KV default. Empty cells stay not measured yet.';

export type LongContextLink = { href: string; label: string };

export const LONG_CONTEXT_LEAD = `
  Context length is how many tokens of prompt plus chat the model can keep.
  That memory is the KV cache — it grows as the window fills, so VRAM rises
  and decode usually falls. On AMDai the measured house path is
  ${COMPARE_MODEL} on ${COMPARE_ENGINE} Vulkan, f16 KV, one R9700.
  Empty cells stay ${LONG_CONTEXT_EMPTY}. Q3 is a labeled estimate.
  llama.cpp stays first.
`.replace(/\s+/g, ' ').trim();

export const LONG_CONTEXT_GLOSSARY: LongContextLink[] = [
  { href: '/glossary#context-length', label: 'Context length' },
  { href: '/glossary#kv-cache', label: 'KV cache' },
  { href: '/glossary#prefill-decode', label: 'Prefill vs decode' },
  { href: '/glossary#offload', label: 'Offload' },
];

export const LONG_CONTEXT_SOURCES: Array<{ id: string; title: string; href: string }> = [
  {
    id: 'qwen36-card',
    title: 'Qwen3.6-35B-A3B model card (262144 native context)',
    href: 'https://huggingface.co/Qwen/Qwen3.6-35B-A3B',
  },
  {
    id: 'unsloth-35b',
    title: 'Unsloth Qwen3.6-35B-A3B GGUF (UD-Q5_K_XL / UD-Q3_K_XL listings)',
    href: 'https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF/tree/main',
  },
  {
    id: 'lost-middle',
    title: 'Lost in the Middle (Liu et al., 2023) — long-context recall drops in the middle',
    href: 'https://arxiv.org/abs/2307.03172',
  },
  {
    id: 'llamacpp',
    title: 'llama.cpp repository (Vulkan, HIP, cache-type flags)',
    href: 'https://github.com/ggml-org/llama.cpp',
  },
  {
    id: 'methodology',
    title: 'AMDai long-context gate — stated context ran; no planted-token score',
    href: '/benchmarks/methodology',
  },
];

export const LONG_CONTEXT_FAQ = [
  {
    id: 'what-is-context',
    question: 'What is context length, and what is the KV cache?',
    answer:
      'Context length is the token window of prompt plus conversation. The KV cache is the key/value attention memory that grows with that window. It is separate from the GGUF. House daily driver is 262144 tokens, f16 KV. See the glossary entries.',
    links: LONG_CONTEXT_GLOSSARY,
  },
  {
    id: 'why-slower',
    question: 'Why does VRAM rise and decode fall as the context fills?',
    answer:
      'Each new token adds to the KV cache. Official UD-Q5_K_XL on one R9700 is 102.39 tok/s at 4K and 44.4 tok/s at 256K — same file, f16 KV. Prefill is the burst that reads the prompt; decode is the streaming rate. Quote the run card, not a blend.',
    links: [
      { href: '/compare/one-vs-two-gpu', label: 'One vs split' },
      { href: '/results', label: 'Run cards' },
    ],
  },
  {
    id: 'kv-type',
    question: 'Should I switch from f16 KV to q8_0 to fit more context?',
    answer:
      'House default is f16 KV. q8_0 KV is about one byte per element instead of two, so the cache is smaller. That quality trade is not measured on local-desktop — treat any q8_0 KV speed or recall claim as a labeled estimate. Do not confuse q8_0 KV with Q8 weights.',
    links: [
      { href: '/quants', label: 'Quants · KV types' },
      { href: '/calculator', label: 'Calculator' },
    ],
  },
  {
    id: 'q3-fit',
    question: 'Can I drop to Q3 so a 16 GB card holds 262K?',
    answer:
      'Q3 is a listed option and a labeled estimate. Nothing on our rig runs below Q4. Do not treat Q3 as runnable advice. Size Q6 / Q5 / Q4 on the calculator first. Q1 and Q2 stay off.',
    links: [
      { href: '/quants', label: 'Quants' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/compare/q4-q5-q6', label: 'Q6 vs Q5 vs Q4' },
    ],
  },
  {
    id: 'recall',
    question: 'Does a 262K window mean the model still finds a fact from the start of the prompt?',
    answer:
      'No score on this site answers that. The long-context gate means the stated window actually ran — not a planted-token recall percentage. Liu et al. 2023 (Lost in the Middle) document that many models miss the middle of a long prompt. We have not run that test on local-desktop.',
    links: [
      { href: '/benchmarks/methodology', label: 'Methodology' },
      { href: 'https://arxiv.org/abs/2307.03172', label: 'Lost in the Middle' },
    ],
  },
];

export const LONG_CONTEXT_ENGINE = [
  {
    id: 'context-flag',
    title: '-c sets the window',
    body: 'House daily driver is -c 262144. Size that number on the calculator before you copy it. A 16 GB card that loads at 4K can still OOM at 128K because KV grew.',
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/troubleshoot#oom-context', label: 'OOM at long context' },
    ],
  },
  {
    id: 'kv-flags',
    title: '--cache-type-k/v (house default f16)',
    body: 'Overnight 35B llama-bench cards recorded -ctk f16 -ctv f16 (same as --cache-type-k/v f16). That is the AMDai default. q8_0 is the smaller KV type the calculator lists. Quality and tok/s for q8_0 KV are not measured yet.',
    links: [
      { href: '/quants', label: 'KV types' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
    ],
  },
  {
    id: 'flash-attn',
    title: '-fa 1 on the overnight cards',
    body: 'The same llama-bench line recorded -fa 1 (flash attention). llama-server flags are not on that card — do not invent a server pin. Copy -fa only when your build documents it.',
    links: [
      { href: '/results', label: 'Run cards' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
    ],
  },
  {
    id: 'split',
    title: 'Two GPUs: --split-mode layer',
    body: 'Overnight 35B split used -sm layer (--split-mode layer), the documented llama.cpp multi-GPU default. On this 35B, one card usually decodes faster than the split. --split-mode row is documented and not measured on local-desktop. Read Dual / multi-GPU before you split.',
    links: [
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
      { href: '/compare/one-vs-two-gpu', label: 'One vs split' },
    ],
  },
  {
    id: 'backends',
    title: 'Vulkan first. HIP, Strata, vLLM second',
    body: 'llama.cpp Vulkan is the consumer default. HIP when rocminfo lists the gfx. Strata is the house Flash speed path with DDR5 expert offload — see Flash RAM offload. vLLM is a try, not the house long-context path. We do not invent a vLLM 262K tok/s.',
    links: [
      { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP' },
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
      { href: '/backends', label: 'Backends' },
    ],
  },
];

export const LONG_CONTEXT_TIERS = [
  {
    id: '16gb',
    title: '16 GB discrete',
    body: 'House 35B Q4–Q6 files do not sit in 16 GB on the calculator at long context. Expect RAM offload or a shorter window. Q3 is a labeled estimate, not runnable advice. Size the file before you set -c 131072.',
    hrefs: [
      { href: '/calculator?model=qwen36&quant=q4_k_m&ctx=131072&gpu=rx7800xt', label: 'Calculator · 16 GB · 128K' },
      { href: '/gpus/rx7800xt', label: 'RX 7800 XT sheet' },
      { href: '/gpus/rx-9070-xt', label: 'RX 9070 XT sheet' },
      { href: '/gpus/rx-7600-xt', label: 'RX 7600 XT sheet' },
      { href: '/gpus/rx-6800-xt', label: 'RX 6800 XT sheet' },
    ],
  },
  {
    id: '24gb',
    title: '24 GB discrete',
    body: 'More VRAM than the 16 GB class. Q4 may fit at a shorter window; Q5 at 262K still needs the calculator. Speed on this class is not measured yet on local-desktop.',
    hrefs: [
      { href: '/calculator?model=qwen36&quant=q4_k_m&ctx=131072&gpu=rx7900xtx', label: 'Calculator · 24 GB · 128K' },
      { href: '/gpus/rx7900xtx', label: 'RX 7900 XTX sheet' },
    ],
  },
  {
    id: '32gb',
    title: '32 GB (R9700)',
    body: 'Measured house card. UD-Q5_K_XL, llama.cpp Vulkan, f16 KV, 262K, 0% RAM offload. Official 1-GPU decode: 102.39 tok/s at 4K, 90.52 at 32K, 66.43 at 128K, 44.4 at 256K.',
    hrefs: [
      { href: '/calculator?model=qwen36&quant=q5_k_m&ctx=262144&gpu=r9700', label: 'Calculator · R9700 · 262K' },
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/models/qwen36', label: '35B model page' },
    ],
  },
  {
    id: '2x32',
    title: '2×32 GB',
    body: 'A split of the same 35B often decodes slower than one card at short context. Two copies serve two chats. Flash Q6 at 262K is the measured DDR5-offload job — not a free 2× of the 35B.',
    hrefs: [
      { href: '/calculator?model=qwen36&quant=q5_k_m&ctx=262144&n=2&split=1&gpu=r9700', label: 'Calculator · split 262K' },
      { href: '/calculator?model=flash&quant=q6_k&ctx=262144&n=2&split=1', label: 'Calculator · Flash 262K' },
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
    ],
  },
];

export const LONG_CONTEXT_SECTIONS = [
  { id: 'what-it-is', label: 'What it is' },
  { id: 'measured', label: 'Measured 35B' },
  { id: 'flash', label: 'Flash cards' },
  { id: 'kv', label: 'f16 vs q8_0 KV' },
  { id: 'quants', label: 'Q6 / Q5 / Q4 / Q3' },
  { id: 'engine', label: 'Engine flags' },
  { id: 'tiers', label: 'By VRAM' },
  { id: 'recall', label: 'Recall honesty' },
  { id: 'faq', label: 'FAQ' },
  { id: 'sources', label: 'Sources' },
] as const;

export const LONG_CONTEXT_HUB: LongContextLink[] = [
  { href: '/compare', label: 'Compare 35B' },
  { href: '/compare/one-vs-two-gpu', label: 'One vs split' },
  { href: '/compare/q4-q5-q6', label: 'Q6 vs Q5 vs Q4' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/benchmarks', label: 'Benchmarks' },
  { href: '/models/qwen36', label: '35B model' },
  { href: '/models/flash', label: 'Flash model' },
  { href: '/gpus/r9700', label: 'R9700' },
  { href: '/multi-gpu', label: 'Dual / multi-GPU' },
  { href: '/flash-ram-offload', label: 'Flash RAM offload' },
  { href: '/troubleshoot#oom-context', label: 'Long-context OOM' },
];

export const LONG_CONTEXT_FLASH_GAPS = [
  `Flash Q3 / Q4 / Q5 decode stays ${LONG_CONTEXT_EMPTY}.`,
  `One-card Flash decode stays ${LONG_CONTEXT_EMPTY}.`,
  `4K and 128K Flash decode stay ${LONG_CONTEXT_EMPTY}. Do not map the 100K cards onto 128K.`,
  '8K and 100K Q6 two-card decode sit on the DIMM-speed table — those are the Flash cards we have.',
];

export const REQUIRED_LONG_CONTEXT_HREFS = [
  '/glossary#context-length',
  '/glossary#kv-cache',
  '/glossary#prefill-decode',
  '/glossary#offload',
  '/calculator',
  '/models/qwen36',
  '/models/flash',
  '/multi-gpu',
  '/flash-ram-offload',
  '/benchmarks',
  '/benchmarks/methodology',
  '/troubleshoot#oom-context',
  '/compare/one-vs-two-gpu',
  '/compare/q4-q5-q6',
  '/gpus/r9700',
  '/backends/llamacpp',
  '/quants',
  '/results',
] as const;

function emptyCell(text: string): string {
  if (!text || text === 'not measured' || text === 'not measured on local-desktop') return LONG_CONTEXT_EMPTY;
  return text;
}

export function longContextQuantRows(): QuantCompareRow[] {
  return quantCompareRows(runs).map((row) => ({
    ...row,
    columns: row.columns.map((col) => ({
      ...col,
      decode: emptyCell(col.decode),
      prefill: emptyCell(col.prefill),
      vramPerGpu: emptyCell(col.vramPerGpu),
      vramTotal: emptyCell(col.vramTotal),
      systemRam: emptyCell(col.systemRam),
    })),
  }));
}

function remapFlashCell<T extends { text: string }>(cell: T): T {
  return { ...cell, text: emptyCell(cell.text) };
}

export function longContextFlashRows(): FlashSpeedRow[] {
  return flashSpeedGrid(runs).map((row) => ({
    ...row,
    cells: Object.fromEntries(
      FLASH_OFFLOAD_CONTEXTS.map((ctx) => [ctx, remapFlashCell(row.cells[ctx])]),
    ) as FlashSpeedRow['cells'],
  }));
}

/** Rows with at least one measured cell — the sparse 4K/32K/128K/256K Flash grid. */
export function longContextFlashMeasuredRows(): FlashSpeedRow[] {
  return longContextFlashRows().filter((row) =>
    FLASH_OFFLOAD_CONTEXTS.some((ctx) => row.cells[ctx].measured),
  );
}

export function longContextDimmRows(): DimmSpeedRow[] {
  return dimmSpeedRows(runs).map((row) => ({
    ...row,
    at3600: remapFlashCell(row.at3600),
    at5200: remapFlashCell(row.at5200),
  }));
}

export const LONG_CONTEXT_RECALL = `
  ${GATE_COPY.long_context.meaning} We do not publish a planted-token percentage.
  The daily-driver and Flash recipes mark the long-context gate as pass when
  the stated 262144 window actually ran — that is not a recall score. Liu et
  al., 2023 (Lost in the Middle) show many models miss facts in the middle of
  a long prompt. The Qwen3.6-35B-A3B card lists 262144 native context. Neither
  source is an AMDai needle-in-haystack number.
`.replace(/\s+/g, ' ').trim();

export const LONG_CONTEXT_KV = `
  House default is f16 KV (2 bytes). Overnight 35B cards recorded -ctk f16
  -ctv f16. q8_0 KV is the smaller type the calculator lists (~1 byte). That
  trade — less VRAM, unknown quality — is not measured yet on local-desktop. q8_0 as
  cache is not “running Q8 weights.” ${RAM_MIN_LABEL} and ${RAM_FULL_LABEL}
  stay the shopper RAM lines when offload or long context appears.
`.replace(/\s+/g, ' ').trim();

export const LONG_CONTEXT_QUANTS = `
  Measured 35B llama.cpp quants on local-desktop: ${COMPARE_QUANTS.join(', ')}.
  ${COMPARE_Q3} is a labeled estimate (${COMPARE_Q3_CITE}) — decode stays
  ${LONG_CONTEXT_EMPTY}. Prefer Q5 over Q4 when the file still fits.
  Q1 and Q2 stay off. Nothing below Q4 runs on our rig.
`.replace(/\s+/g, ' ').trim();

export function longContextBlob(): string {
  return [
    LONG_CONTEXT_TITLE,
    LONG_CONTEXT_DESCRIPTION,
    LONG_CONTEXT_LEAD,
    LONG_CONTEXT_RECALL,
    LONG_CONTEXT_KV,
    LONG_CONTEXT_QUANTS,
    SWEEP_REVERIFY,
    GATE_COPY.long_context.meaning,
    ...LONG_CONTEXT_FAQ.map((row) => `${row.question} ${row.answer}`),
    ...LONG_CONTEXT_ENGINE.map((row) => `${row.title} ${row.body}`),
    ...LONG_CONTEXT_TIERS.map((row) => `${row.title} ${row.body}`),
    ...LONG_CONTEXT_FLASH_GAPS,
  ].join('\n');
}

export function longContextHrefs(): string[] {
  const links: LongContextLink[] = [
    ...LONG_CONTEXT_HUB,
    ...LONG_CONTEXT_GLOSSARY,
    ...LONG_CONTEXT_SOURCES.map((row) => ({ href: row.href, label: row.title })),
    ...LONG_CONTEXT_FAQ.flatMap((row) => row.links ?? []),
    ...LONG_CONTEXT_ENGINE.flatMap((row) => row.links),
    ...LONG_CONTEXT_TIERS.flatMap((row) => row.hrefs),
  ];
  return [...new Set(links.map((link) => link.href))];
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function assertLongContextValid(): string[] {
  const errors: string[] = [];
  const blob = longContextBlob();
  const hrefs = longContextHrefs();
  if (LONG_CONTEXT_EMPTY !== 'not measured yet') errors.push('empty-cell label drifted');
  if (!blob.includes(LONG_CONTEXT_EMPTY)) errors.push('must say not measured yet');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) errors.push('RAM lines missing');
  if (!/llama\.cpp/i.test(blob)) errors.push('must keep llama.cpp first');
  if (!/f16 KV/.test(blob)) errors.push('must name f16 KV default');
  if (!/-c 262144/.test(blob)) errors.push('must cite -c 262144');
  if (!/--cache-type-k\/v/.test(blob) && !/-ctk f16/.test(blob)) errors.push('must cite cache-type flags');
  if (!/--split-mode layer/.test(blob)) errors.push('must cite split-mode layer');
  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');
  if (!/Lost in the Middle/.test(blob)) errors.push('must cite Lost in the Middle');
  if (!/not publish a planted-token/.test(blob) && !/planted-token recall/.test(blob)) {
    errors.push('must refuse a planted-token score');
  }
  for (const required of REQUIRED_LONG_CONTEXT_HREFS) {
    if (!hrefs.some((href) => href === required || href.startsWith(`${required}`))) {
      errors.push(`missing required href ${required}`);
    }
  }
  const rows = longContextQuantRows();
  if (!rows.length) errors.push('35B table empty');
  const quants = new Set(rows.flatMap((row) => row.columns.map((col) => col.quant)));
  for (const quant of [...COMPARE_QUANTS, COMPARE_Q3]) {
    if (!quants.has(quant)) errors.push(`missing quant column ${quant}`);
  }
  const q3 = rows.flatMap((row) => row.columns).filter((col) => col.quant === COMPARE_Q3);
  if (!q3.length || q3.some((col) => col.kind !== 'estimate' || col.decode !== LONG_CONTEXT_EMPTY)) {
    errors.push('Q3 must stay a labeled estimate with empty decode');
  }
  const flash = longContextFlashRows();
  if (!flash.some((row) => FLASH_OFFLOAD_CONTEXTS.some((ctx) => row.cells[ctx].measured))) {
    errors.push('Flash table must include at least one measured cell');
  }
  if (!longContextFlashMeasuredRows().length) errors.push('Flash measured-row filter empty');
  if (!longContextDimmRows().some((row) => row.at3600.measured || row.at5200.measured)) {
    errors.push('DIMM-speed Flash table must include at least one measured cell');
  }
  if (!blob.includes('100K')) errors.push('must name the 100K Flash cards');
  return [...new Set(errors)];
}

export { COMPARE_CONTEXTS, COMPARE_ENGINE, COMPARE_MODEL, COMPARE_Q3, COMPARE_QUANTS, SWEEP_REVERIFY };
export { FLASH_OFFLOAD_CONTEXTS, FLASH_OFFLOAD_CONTEXT_LABEL };
export type { QuantColumn, QuantCompareRow, FlashSpeedRow, DimmSpeedRow };
