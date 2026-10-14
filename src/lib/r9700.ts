/**
 * Radeon AI PRO R9700 measured hero at /gpus/r9700.
 * Numbers come from validated amdai-bench/run@1 cards. Q3 is estimate only.
 * Do not invent tok/s, prices, or a Q3 local-desktop run.
 */

import { DIMM_KIT_GB } from './calculator';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import {
  COMPARE_CONTEXTS,
  COMPARE_ENGINE,
  COMPARE_MODEL,
  COMPARE_Q3,
  COMPARE_Q3_CITE,
  COMPARE_QUANTS,
  SWEEP_REVERIFY,
  assertCompareValid,
  oneVsTwoRows,
  quantCompareRows,
  type QuantColumn,
  type QuantCompareRow,
} from './local-desktop-compare';
import {
  FLASH_RERUN_NOTE,
  Q6_4K_VARIANCE_NOTE,
  Q6_DDR5_NOTE,
  officialAmdaiRuns,
  runPath,
  runsForGpu,
  verifiedMeasured,
  type Qwen36CompareRow,
  type Qwen36SideCell,
  type RunCard,
} from './run-card';

export const R9700_ID = 'r9700';
export const R9700_PATH = '/gpus/r9700';
export const R9700_NAME = 'AMD Radeon AI PRO R9700';
export const R9700_SHORT = 'Radeon AI PRO R9700';
export const R9700_VRAM = '32 GB';
export const R9700_GFX = 'gfx1201';
export const R9700_PUBLISHED = '2026-10-13';
export const R9700_DAILY_RECIPE = 'qwen36-35b.llamacpp-vulkan.262k';
export const R9700_FLASH_RECIPE = 'qwen38-flash.strata.262k';

export const R9700_DIGEST =
  'Measured 35B llama.cpp on the Radeon AI PRO R9700 — 32 GB VRAM, one GPU vs two, cited decode and prefill from local-desktop run cards.';

export type R9700Link = { href: string; label: string };

export const R9700_SECTIONS = [
  { id: 'what-it-is', label: 'What it is' },
  { id: 'start-here', label: 'Start here' },
  { id: 'measured', label: 'Measured 35B' },
  { id: 'system-ram', label: 'System RAM' },
  { id: 'q3-estimate', label: 'Q3 estimate' },
  { id: 'recipes', label: 'Recipes' },
  { id: 'more', label: 'More pages' },
] as const;

export const R9700_INTRO_LINKS: R9700Link[] = [
  { href: '/start', label: 'Start' },
  { href: '/setup', label: 'First-run setup' },
  { href: '/setup/multi-gpu', label: 'Multi-GPU how-to' },
  { href: `/recipes/${R9700_DAILY_RECIPE}`, label: 'Measured recipe' },
  { href: '/stack-lab', label: 'Stack Lab' },
];

export const R9700_PATH_STEPS = [
  {
    href: '/start',
    label: 'Start',
    body: 'Pick the card, then ROCm, then llama.cpp. Getting started is the map; this page is the measured R9700 sheet.',
  },
  {
    href: '/setup',
    label: 'First-run setup',
    body: 'Ubuntu 24.04+ is the measured path to a first token. Windows first-run lives on /setup/windows — cited, not measured on local-desktop.',
  },
  {
    href: `/recipes/${R9700_DAILY_RECIPE}`,
    label: 'Measured recipe',
    body: 'Daily driver: Qwen3.6-35B-A3B Unsloth UD-Q5_K_XL on one R9700, llama.cpp Vulkan, 262144 context, f16 KV. Open the recipe, then copy the launch.',
  },
  {
    href: '/stack-lab',
    label: 'Stack Lab',
    body: 'Ubuntu companion that applies that recipe and records an amdai-bench/run@1 card. Packages are not published yet.',
  },
] as const;

export const R9700_WHAT = {
  lead:
    'The AMD Radeon AI PRO R9700 is a 32 GB workstation / local-AI card on RDNA 4 (gfx1201). AMDai measures local Qwen on this SKU. There is no consumer RX 9700 — the gaming sibling is the 16 GB RX 9070 series.',
  forWhom:
    'Buy this card when you want a 35B daily driver that stays in VRAM at full 262K on llama.cpp, or a second card for two copies / Flash offload. It is not Instinct, and it is not an automatic 2× decode when you seat two.',
  vram:
    'Published VRAM is 32 GB. That is the hardware label, the same units AMD prints. Measured peak VRAM on the overnight cards is lower than 32 GB for the daily-driver Q5 — read the cells, do not invent headroom.',
};

export type R9700MoreLink = {
  href: string;
  label: string;
  body: string;
};

export const R9700_MORE: R9700MoreLink[] = [
  {
    href: `/recipes/${R9700_DAILY_RECIPE}`,
    label: '35B daily-driver recipe',
    body: 'UD-Q5_K_XL on llama.cpp Vulkan, one card, 262K. Launch command and gates.',
  },
  {
    href: `/recipes/${R9700_FLASH_RECIPE}`,
    label: 'Flash recipe',
    body: 'Qwen 3.8 Flash on Strata. Fast-agent pin, not the 35B overnight matrix.',
  },
  {
    href: '/benchmarks',
    label: 'Benchmarks',
    body: '33-card local-desktop matrix. Every cell links a run card.',
  },
  {
    href: '/compare',
    label: 'Compare 35B',
    body: 'Cited decisions from the overnight cards — layout and quant.',
  },
  {
    href: '/compare/gpus',
    label: 'Compare GPUs',
    body: 'R9700 vs 9070 XT and the other published sheets. VRAM, fit estimates, labeled Q3. No invented prices.',
  },
  {
    href: '/compare/radeon-vs-nvidia',
    label: 'Radeon vs NVIDIA',
    body: 'Cited specs versus RTX 5090 / 4090 / 3090 / 5080 / 5070 Ti / 5060 Ti 16GB. NVIDIA speed stays empty until cited.',
  },
  {
    href: '/compare/one-vs-two-gpu',
    label: 'One vs two GPU',
    body: 'Same 35B, one R9700 versus a split. Decode winner per row.',
  },
  {
    href: '/results',
    label: 'Run cards',
    body: 'Official amdai-bench/run@1 pages. Every number on this sheet cites one.',
  },
  {
    href: '/methodology',
    label: 'How we test',
    body: 'amdai-bench/run@1 cards, labeled estimates, citations, corrections.',
  },
  {
    href: '/faq',
    label: 'FAQ',
    body: 'Which GPU, Ubuntu vs Windows, and when Q3 is only an estimate.',
  },
  {
    href: '/glossary',
    label: 'Glossary',
    body: 'Plain-English ROCm, GGUF, Q3–Q6, KV cache, run cards.',
  },
  {
    href: '/fine-tuning',
    label: 'Fine-tuning on Radeon',
    body: 'Cited LoRA / QLoRA, then export to llama.cpp. Speeds not yet measured on our R9700s. Q3 is a labeled estimate.',
  },
  {
    href: '/compare/q4-q5-q6',
    label: 'Q6 / Q5 / Q4 + Q3 estimate',
    body: 'Quant side-by-side. Q3 stays a labeled estimate.',
  },
  {
    href: '/multi-gpu',
    label: 'Dual / multi-GPU',
    body: 'When a second R9700 helps or hurts — llama.cpp flags, PCIe, PSU. Desktop 2 192 GB is planned, not measured.',
  },
  {
    href: '/setup/multi-gpu',
    label: 'Multi-GPU llama.cpp how-to',
    body: 'Hands-on --split-mode, --tensor-split, device pins, and two-server combo. 35B split measured on local-desktop.',
  },
  {
    href: '/two-r9700',
    label: 'Two R9700s',
    body: 'Split versus two copies. A split is not two chats.',
  },
  {
    href: '/flash-daily',
    label: 'Flash daily driver',
    body: 'Qwen 3.8 Flash VRAM and DDR5 offload at Q3–Q6.',
  },
  {
    href: '/qwen',
    label: 'Qwen compare',
    body: 'Every current 3.6 / 3.8 file × quant on this notebook.',
  },
  {
    href: '/stack-lab',
    label: 'Stack Lab',
    body: 'Ubuntu companion. Packages not published yet.',
  },
  {
    href: '/setup',
    label: 'First-run setup',
    body: 'Ubuntu 24.04+ to first token, plus an honest Windows path.',
  },
  {
    href: '/kv-cache',
    label: 'KV cache',
    body: 'f16 vs q8_0 vs q4_0. Measured 35B VRAM on this card. Estimates labeled.',
  },
  {
    href: '/out-of-vram',
    label: 'Out of VRAM',
    body: 'Cited llama.cpp Vulkan / HIP OOM strings. Cheapest fix first. Q3 is a labeled estimate.',
  },
  {
    href: '/calculator',
    label: 'Calculator',
    body: 'Size a GGUF against 32 GB. Client-side, no prices.',
  },
  {
    href: '/budget',
    label: 'Budget',
    body: 'Starter through two-R9700 builds. No invented prices.',
  },
];

export const REQUIRED_R9700_HREFS = [
  '/start',
  '/setup',
  `/recipes/${R9700_DAILY_RECIPE}`,
  '/stack-lab',
  '/benchmarks',
  '/compare',
  '/compare/gpus',
  '/compare/radeon-vs-nvidia',
  '/compare/one-vs-two-gpu',
  '/compare/q4-q5-q6',
  '/results',
  '/methodology',
  '/faq',
  '/glossary',
  '/multi-gpu',
  '/setup/multi-gpu',
  '/two-r9700',
  '/flash-daily',
  '/qwen',
  '/kv-cache',
  '/out-of-vram',
  '/calculator',
  '/budget',
  '/gpus',
  '/disclosure',
] as const;

const BANNED_VISIBLE = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function r9700OfficialRuns(cards: RunCard[]): RunCard[] {
  return officialAmdaiRuns(verifiedMeasured(runsForGpu(cards, R9700_ID)));
}

export function r9700OneVsTwo(cards: RunCard[]): Qwen36CompareRow[] {
  return oneVsTwoRows(cards);
}

export function r9700QuantRows(cards: RunCard[]): QuantCompareRow[] {
  return quantCompareRows(cards);
}

export function r9700DailyStrip(cards: RunCard[]): Qwen36CompareRow[] {
  return r9700OneVsTwo(cards).filter((row) => row.quant === 'UD-Q5_K_XL');
}

export function r9700RamKitRows(cards: RunCard[]): QuantCompareRow[] {
  return r9700QuantRows(cards).filter((row) => row.context === 262144 || row.context === 4096);
}

export type CitedFigure = {
  label: string;
  value: string;
  kind: 'measured' | 'estimate';
  runIds: string[];
  href: string;
};

function cellFigures(prefix: string, cell: Qwen36SideCell, kind: 'measured' | 'estimate'): CitedFigure[] {
  const fields = [
    ['decode', cell.decode],
    ['prefill', cell.prefill],
    ['VRAM/card', cell.vramPerGpu],
    ['VRAM total', cell.vramTotal],
    ['system RAM', cell.systemRam],
  ] as const;
  const out: CitedFigure[] = [];
  for (const [name, value] of fields) {
    if (!value || value === 'not measured') continue;
    out.push({
      label: `${prefix} ${name}`,
      value,
      kind,
      runIds: cell.runIds,
      href: cell.href,
    });
  }
  return out;
}

function columnFigures(row: QuantCompareRow, col: QuantColumn): CitedFigure[] {
  const prefix = `${col.quant} ${row.contextLabel} ${row.gpuCount === 1 ? '1×' : 'split'}`;
  const fields = [
    ['decode', col.decode],
    ['prefill', col.prefill],
    ['VRAM/card', col.vramPerGpu],
    ['VRAM total', col.vramTotal],
    ['system RAM', col.systemRam],
  ] as const;
  const out: CitedFigure[] = [];
  for (const [name, value] of fields) {
    if (!value || value === 'not measured') continue;
    out.push({
      label: `${prefix} ${name}`,
      value,
      kind: col.kind,
      runIds: col.runIds,
      href: col.href,
    });
  }
  return out;
}

export function r9700CitedFigures(cards: RunCard[]): CitedFigure[] {
  const figures: CitedFigure[] = [];
  for (const row of r9700OneVsTwo(cards)) {
    const ctx = `${row.quant} ${row.contextLabel}`;
    figures.push(...cellFigures(`${ctx} 1×`, row.one, 'measured'));
    figures.push(...cellFigures(`${ctx} split`, row.both, 'measured'));
  }
  for (const row of r9700QuantRows(cards)) {
    for (const col of row.columns) {
      figures.push(...columnFigures(row, col));
    }
  }
  return figures;
}

function numbersFromText(text: string): number[] {
  if (!text || text === 'not measured') return [];
  return [...text.matchAll(/(\d+(?:\.\d+)?)/g)].map((match) => Number(match[1]));
}

function cardNumbers(card: RunCard): number[] {
  const nums: number[] = [];
  const add = (n: number | null | undefined) => {
    if (n != null) nums.push(n);
  };
  add(card.results.decode_tps);
  add(card.results.prefill_tps);
  add(card.results.aggregate_tps);
  add(card.results.peak_vram_gb_total);
  add(card.results.peak_system_ram_gb);
  for (const n of card.results.peak_vram_gb_per_gpu) add(n);
  return nums;
}

function figureResolves(figure: CitedFigure, byId: Map<string, RunCard>): string | null {
  if (figure.kind === 'estimate') {
    if (figure.runIds.length) return `${figure.label} estimate cites a run`;
    return null;
  }
  if (!figure.runIds.length) return `${figure.label} measured value has no run id`;
  const pool: number[] = [];
  for (const id of figure.runIds) {
    const card = byId.get(id);
    if (!card) return `${figure.label} missing run ${id}`;
    pool.push(...cardNumbers(card));
  }
  for (const n of numbersFromText(figure.value)) {
    if (!pool.some((hit) => Math.abs(hit - n) < 1e-9)) {
      return `${figure.label} ${n} does not appear on ${figure.runIds.join(', ')}`;
    }
  }
  return null;
}

export function r9700Blob(): string {
  const parts = [
    R9700_NAME,
    R9700_SHORT,
    R9700_VRAM,
    R9700_DIGEST,
    R9700_WHAT.lead,
    R9700_WHAT.forWhom,
    R9700_WHAT.vram,
    ...R9700_PATH_STEPS.map((step) => `${step.label} ${step.body}`),
    ...R9700_MORE.map((row) => `${row.label} ${row.body}`),
    COMPARE_MODEL,
    COMPARE_ENGINE,
    COMPARE_Q3,
    COMPARE_Q3_CITE,
    SWEEP_REVERIFY,
    FLASH_RERUN_NOTE,
    Q6_4K_VARIANCE_NOTE,
    Q6_DDR5_NOTE,
    RAM_MIN_LABEL,
    RAM_FULL_LABEL,
  ];
  return parts.join('\n');
}

export function r9700Hrefs(): string[] {
  const links = [
    ...R9700_INTRO_LINKS,
    ...R9700_PATH_STEPS.map((step) => ({ href: step.href, label: step.label })),
    ...R9700_MORE.map((row) => ({ href: row.href, label: row.label })),
    { href: '/gpus', label: 'GPU directory' },
    { href: '/disclosure', label: 'Disclosure' },
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

export function assertR9700Valid(cards: RunCard[]): string[] {
  const errors: string[] = [...assertCompareValid(cards)];
  const blob = r9700Blob();
  const hrefs = new Set(r9700Hrefs());
  const byId = new Map(cards.map((card) => [card.run_id, card]));
  const figures = r9700CitedFigures(cards);
  const rows = r9700OneVsTwo(cards);
  const quants = r9700QuantRows(cards);

  if (rows.length !== COMPARE_QUANTS.length * COMPARE_CONTEXTS.length) {
    errors.push(`expected ${COMPARE_QUANTS.length * COMPARE_CONTEXTS.length} one-vs-two rows`);
  }
  if (!rows.some((row) => row.quant === 'UD-Q5_K_XL')) errors.push('missing UD-Q5_K_XL');
  if (!rows.some((row) => row.quant === 'Q5_K_M')) errors.push('missing Q5_K_M');
  if (!rows.some((row) => row.quant === 'Q4_K_M')) errors.push('missing Q4_K_M');
  if (!rows.some((row) => row.quant === 'Q6_K')) errors.push('missing Q6_K');

  if (!figures.length) errors.push('no cited figures');
  for (const figure of figures) {
    const miss = figureResolves(figure, byId);
    if (miss) errors.push(miss);
  }

  for (const row of quants) {
    const q3 = row.columns.find((col) => col.quant === COMPARE_Q3);
    if (!q3 || q3.kind !== 'estimate') errors.push(`${row.id} missing Q3 estimate`);
    if (q3 && q3.decode !== 'not measured') errors.push(`${row.id} invented Q3 tok/s`);
    if (q3 && !/estimate/i.test(q3.note ?? '')) errors.push(`${row.id} Q3 unlabeled`);
    for (const col of row.columns) {
      if (!(DIMM_KIT_GB as readonly number[]).includes(col.ramMin.kitGb)) {
        errors.push(`${row.id} ${col.quant} min kit ${col.ramMin.kitGb} is not a real DIMM size`);
      }
      if (!(DIMM_KIT_GB as readonly number[]).includes(col.ramFull.kitGb)) {
        errors.push(`${row.id} ${col.quant} full kit ${col.ramFull.kitGb} is not a real DIMM size`);
      }
      if (col.kind === 'measured' && !col.runIds.length && col.decode !== 'not measured') {
        errors.push(`${row.id} ${col.quant} measured decode without a run`);
      }
    }
  }

  if (!/32 GB/.test(blob)) errors.push('must say 32 GB');
  if (!blob.includes(RAM_MIN_LABEL)) errors.push(`missing ${RAM_MIN_LABEL}`);
  if (!blob.includes(RAM_FULL_LABEL)) errors.push(`missing ${RAM_FULL_LABEL}`);
  if (!R9700_PATH_STEPS.some((step) => step.href === '/start')) errors.push('path missing Start');
  if (!R9700_PATH_STEPS.some((step) => step.href === '/setup')) errors.push('path missing /setup');
  if (!R9700_PATH_STEPS.some((step) => step.href.includes(R9700_DAILY_RECIPE))) {
    errors.push('path missing measured recipe');
  }
  if (!R9700_PATH_STEPS.some((step) => step.href === '/stack-lab')) errors.push('path missing Stack Lab');
  if (BANNED_VISIBLE.test(blob)) errors.push('banned model');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/\$\d|\bUSD\b|\bMSRP\b/i.test(blob)) errors.push('invented price');
  if (/\bQ1\b|\bQ2\b/.test(blob) && Q1Q2.test(blob)) errors.push('Q1/Q2 visible');

  for (const required of REQUIRED_R9700_HREFS) {
    if (![...hrefs].some((href) => href === required || href.startsWith(`${required}/`))) {
      errors.push(`missing required href ${required}`);
    }
  }

  const figureBlob = JSON.stringify(figures);
  if (BANNED_VISIBLE.test(figureBlob)) errors.push('banned model in figures');
  return [...new Set(errors)];
}

export { COMPARE_CONTEXTS, COMPARE_ENGINE, COMPARE_MODEL, COMPARE_Q3, COMPARE_Q3_CITE, COMPARE_QUANTS, FLASH_RERUN_NOTE, Q6_4K_VARIANCE_NOTE, Q6_DDR5_NOTE, SWEEP_REVERIFY, runPath };
