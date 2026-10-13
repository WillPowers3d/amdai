/**
 * Consumer GPU recipe sheets for cards shoppers buy next to the R9700.
 * Fit / VRAM / RAM come from the calculator and stay labeled Estimate.
 * Speed stays “not measured” — no first-party amdai-bench/run@1 cards on local-desktop.
 * Only add an id when gpus.yaml already has a cited row and GPU_PRESETS lists it.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import {
  DEFAULT_INPUT,
  DIMM_KIT_GB,
  GPU_PRESETS,
  applyGpuPreset,
  applyModelPreset,
  compute,
  formatCtx,
  formatGiB,
  inputToQuery,
  systemRamNeed,
  type CalcInput,
  type GpuId,
  type QuantId,
  type SystemRamNeed,
  type Verdict,
} from './calculator';
import { gpuCardId } from './gpu-ids';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import type { GpuDirectory } from './status';
import { COMPARE_MODEL, COMPARE_Q3, COMPARE_Q3_CITE } from './local-desktop-compare';

export const CONSUMER_RECIPE_IDS = ['rx7900xtx', 'rx7900xt', 'rx7800xt'] as const;
export type ConsumerRecipeId = (typeof CONSUMER_RECIPE_IDS)[number];

export const CONSUMER_PUBLISHED = '2026-10-13';
export const CONSUMER_MODEL = COMPARE_MODEL;
export const CONSUMER_ENGINE = 'llama.cpp';
export const CONSUMER_PATH_PREFIX = '/gpus';
export const CONSUMER_RAM_QUANT: QuantId = 'q4_k_m';
export const CONSUMER_RAM_QUANT_LABEL = 'Q4_K_M';
export const CONSUMER_RAM_CONTEXT = 32768;
export const CONSUMER_SHOPPER_RAM_GB = 64;
export const CONSUMER_SPEED = 'not measured';

export const CONSUMER_FIT_CONTEXTS = [4096, 32768] as const;

export const CONSUMER_FIT_QUANTS = [
  { id: 'q6_k' as const, label: 'Q6_K', kind: 'estimate' as const },
  { id: 'q5_k_m' as const, label: 'Q5_K_M', kind: 'estimate' as const },
  { id: 'q4_k_m' as const, label: 'Q4_K_M', kind: 'estimate' as const },
  { id: 'q3_k_xl' as const, label: COMPARE_Q3, kind: 'q3-estimate' as const },
];

export const CONSUMER_NAV_LINKS = [
  { href: '/gpus/rx7900xtx', label: 'RX 7900 XTX' },
  { href: '/gpus/rx7900xt', label: 'RX 7900 XT' },
  { href: '/gpus/rx7800xt', label: 'RX 7800 XT' },
] as const;

export const REQUIRED_CONSUMER_HREFS = [
  '/calculator',
  '/budget',
  '/benchmarks',
  '/setup',
  '/stack-lab',
  '/gpus',
  '/gpus/r9700',
  '/compare/radeon-vs-nvidia',
  '/backends/llamacpp',
  '/contribute',
  '/methodology',
  '/start',
] as const;

function readSrcData(name: string): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [join(here, '../data', name), join(process.cwd(), 'src/data', name)];
  for (const file of candidates) {
    if (existsSync(file)) return readFileSync(file, 'utf8');
  }
  throw new Error(`${name} missing`);
}

function loadGpuDirectory(): GpuDirectory {
  return parse(readSrcData('gpus.yaml')) as GpuDirectory;
}

function productAmdHref(id: ConsumerRecipeId): string | null {
  const file = parse(readSrcData('products.yaml')) as {
    products: Array<{ id: string; urls?: Partial<Record<string, string>> }>;
  };
  return file.products.find((row) => row.id === id)?.urls?.amd ?? null;
}

const gpuDirectory = loadGpuDirectory();

const SHORT_NAME: Record<ConsumerRecipeId, string> = {
  rx7900xtx: 'RX 7900 XTX',
  rx7900xt: 'RX 7900 XT',
  rx7800xt: 'RX 7800 XT',
};

const BUDGET_ANCHOR: Record<ConsumerRecipeId, { href: string; label: string }> = {
  rx7900xtx: { href: '/budget#mid', label: 'Mid budget tier' },
  rx7900xt: { href: '/budget#mid', label: 'Mid budget tier' },
  rx7800xt: { href: '/budget#starter', label: 'Starter budget tier' },
};

const LEAD: Record<ConsumerRecipeId, string> = {
  rx7900xtx:
    '24 GB RDNA 3 consumer card shoppers buy next to the R9700 when they want more VRAM than a 16 GB 9070-class SKU without the workstation card. gfx1100 — a different ROCm family package than the measured gfx1201 house box.',
  rx7900xt:
    '20 GB is a real VRAM bracket, not a rounding error. gfx1100. Size Qwen3.6-35B-A3B on the calculator before you assume a Q5 file sits in VRAM. Not a measured local-desktop card.',
  rx7800xt:
    '16 GB gfx1101. Official on the current ROCm matrix. House 35B Q4–Q6 GGUFs do not fit this VRAM on the calculator — expect RAM offload or a lighter listed Q3 file, both estimates.',
};

export type ConsumerFitKind = 'estimate' | 'q3-estimate';

export type ConsumerFitCell = {
  context: number;
  contextLabel: string;
  totalGb: string;
  verdict: Verdict;
  verdictLabel: string;
  speed: typeof CONSUMER_SPEED;
};

export type ConsumerFitRow = {
  quantId: QuantId;
  quant: string;
  kind: ConsumerFitKind;
  kindLabel: string;
  weightsGb: string;
  weightsNote: string;
  speed: typeof CONSUMER_SPEED;
  cells: ConsumerFitCell[];
  calculatorHref: string;
};

export type ConsumerStackTip = {
  title: string;
  body: string;
};

export type ConsumerRecipePage = {
  id: ConsumerRecipeId;
  path: string;
  name: string;
  shortName: string;
  title: string;
  description: string;
  family: string;
  arch: string;
  gfx: string;
  vramGb: number;
  vramLabel: string;
  support: 'official' | 'unofficial';
  rocmNote: string;
  hsaOverride: string;
  matrixHref: string;
  linuxReqsHref: string;
  productHref: string | null;
  lead: string;
  notMeasured: string;
  model: string;
  engine: string;
  q3: string;
  q3Cite: string;
  fitRows: ConsumerFitRow[];
  ramNeed: SystemRamNeed;
  ramQuant: string;
  ramContextLabel: string;
  ramNote: string;
  stack: ConsumerStackTip[];
  budget: { href: string; label: string };
  calculatorHref: string;
  siblings: { href: string; label: string }[];
};

export function isConsumerRecipeGpu(id: string): id is ConsumerRecipeId {
  return (CONSUMER_RECIPE_IDS as readonly string[]).includes(id);
}

export function consumerPath(id: ConsumerRecipeId): string {
  return `${CONSUMER_PATH_PREFIX}/${id}`;
}

export function consumerShortName(id: ConsumerRecipeId): string {
  return SHORT_NAME[id];
}

function directoryCard(id: ConsumerRecipeId) {
  const card = gpuDirectory.cards.find((row) => gpuCardId(row) === id);
  if (!card) throw new Error(`gpus.yaml has no cited row for ${id}`);
  if (card.vram_gb == null) throw new Error(`${id} is missing a published VRAM hardware label`);
  return card;
}

export function consumerCalcInput(id: ConsumerRecipeId, quant: QuantId, context: number): CalcInput {
  let input = applyGpuPreset(id as GpuId, {
    ...DEFAULT_INPUT,
    ramGb: CONSUMER_SHOPPER_RAM_GB,
    view: 'gpu',
  });
  input = applyModelPreset('qwen36', input);
  return {
    ...input,
    gpuId: id,
    quantId: quant,
    context,
    kvId: 'f16',
    backendId: 'llamacpp',
    pathId: 'vulkan',
    gpuCount: 1,
    split: false,
    fileWeightGiB: null,
  };
}

function kindLabel(kind: ConsumerFitKind): string {
  return kind === 'q3-estimate' ? 'Q3 estimate' : 'Estimate';
}

function fitRow(id: ConsumerRecipeId, spec: (typeof CONSUMER_FIT_QUANTS)[number]): ConsumerFitRow {
  const base = consumerCalcInput(id, spec.id, CONSUMER_FIT_CONTEXTS[0]);
  const weights = compute(base);
  const cells = CONSUMER_FIT_CONTEXTS.map((context) => {
    const result = compute(consumerCalcInput(id, spec.id, context));
    return {
      context,
      contextLabel: formatCtx(context),
      totalGb: `${formatGiB(result.totalGiB)} GB`,
      verdict: result.verdict,
      verdictLabel: result.verdictLabel,
      speed: CONSUMER_SPEED,
    };
  });
  return {
    quantId: spec.id,
    quant: spec.label,
    kind: spec.kind,
    kindLabel: kindLabel(spec.kind),
    weightsGb: `${formatGiB(weights.weightsGiB)} GB`,
    weightsNote: weights.weightsNote,
    speed: CONSUMER_SPEED,
    cells,
    calculatorHref: `/calculator?${inputToQuery(consumerCalcInput(id, spec.id, CONSUMER_RAM_CONTEXT))}`,
  };
}

export function consumerRecipePage(id: ConsumerRecipeId): ConsumerRecipePage {
  const card = directoryCard(id);
  const preset = GPU_PRESETS.find((gpu) => gpu.id === id);
  if (!preset) throw new Error(`${id} is missing a calculator preset`);
  const vramGb = card.vram_gb as number;
  const shortName = SHORT_NAME[id];
  const ramInput = consumerCalcInput(id, CONSUMER_RAM_QUANT, CONSUMER_RAM_CONTEXT);
  const ramNeed = systemRamNeed(ramInput);
  const productHref = productAmdHref(id);
  const siblings = CONSUMER_NAV_LINKS.filter((link) => link.href !== consumerPath(id));

  return {
    id,
    path: consumerPath(id),
    name: card.name,
    shortName,
    title: shortName,
    description: `${shortName} recipe sheet — ${vramGb} GB, ${card.gfx}, cited ROCm matrix row. 35B Q6/Q5/Q4 VRAM fit estimates; ${COMPARE_Q3} labeled estimate. Not measured on local-desktop.`,
    family: card.family,
    arch: card.arch,
    gfx: card.gfx,
    vramGb,
    vramLabel: `${vramGb} GB`,
    support: card.support,
    rocmNote: card.rocm_note,
    hsaOverride: card.hsa_override,
    matrixHref: gpuDirectory.matrix,
    linuxReqsHref: gpuDirectory.linux_reqs,
    productHref,
    lead: LEAD[id],
    notMeasured:
      'This SKU was not measured on local-desktop. The Radeon AI PRO R9700 remains the measured north star. Fit, VRAM, and system RAM below are calculator estimates. Speed cells stay not measured.',
    model: CONSUMER_MODEL,
    engine: CONSUMER_ENGINE,
    q3: COMPARE_Q3,
    q3Cite: COMPARE_Q3_CITE,
    fitRows: CONSUMER_FIT_QUANTS.map((spec) => fitRow(id, spec)),
    ramNeed,
    ramQuant: CONSUMER_RAM_QUANT_LABEL,
    ramContextLabel: formatCtx(CONSUMER_RAM_CONTEXT),
    ramNote: `${RAM_MIN_LABEL} and ${RAM_FULL_LABEL} for ${CONSUMER_MODEL} on ${CONSUMER_ENGINE} at ${CONSUMER_RAM_QUANT_LABEL}, ${formatCtx(CONSUMER_RAM_CONTEXT)} selected and the model’s full context. Estimate until a first-party amdai-bench/run@1 card exists for this SKU. Rounded up to a real DIMM kit.`,
    stack: [
      {
        title: 'llama.cpp first',
        body: 'Vulkan is the consumer default on this site. HIP when rocminfo lists this gfx. Ollama and vLLM are not the house path for this card.',
      },
      {
        title: 'Family package',
        body: `${card.gfx} needs the gfx110x ROCm family package, not the gfx1201 pin used on the measured R9700. Re-check the cited matrix before you install.`,
      },
      {
        title: 'Size before you download',
        body: 'Open the calculator with this GPU preset. Empty speed cells stay not measured. We do not invent a daily-driver pick for this SKU.',
      },
      {
        title: 'Setup, then Stack Lab notes',
        body: 'First-run setup is Ubuntu. Stack Lab packages are not published yet. House daily and Flash profiles are R9700 / local-desktop — they do not apply to this card. There is no Open in Stack Lab handoff here.',
      },
    ],
    budget: BUDGET_ANCHOR[id],
    calculatorHref: `/calculator?${inputToQuery(ramInput)}`,
    siblings,
  };
}

export function consumerRecipePages(): ConsumerRecipePage[] {
  return CONSUMER_RECIPE_IDS.map((id) => consumerRecipePage(id));
}

export function consumerHrefs(page: ConsumerRecipePage): string[] {
  return [
    page.path,
    page.calculatorHref.split('?')[0] ?? '/calculator',
    page.budget.href.split('#')[0] ?? '/budget',
    page.matrixHref,
    page.linuxReqsHref,
    ...page.siblings.map((link) => link.href),
    ...REQUIRED_CONSUMER_HREFS,
  ];
}

export function consumerBlob(page: ConsumerRecipePage): string {
  return [
    page.name,
    page.shortName,
    page.title,
    page.description,
    page.lead,
    page.notMeasured,
    page.rocmNote,
    page.hsaOverride,
    page.ramNote,
    page.q3,
    page.q3Cite,
    page.stack.map((tip) => `${tip.title} ${tip.body}`).join('\n'),
    page.fitRows.map((row) => `${row.quant} ${row.kindLabel} ${row.weightsNote}`).join('\n'),
  ].join('\n');
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');
const HOUSE_STACK_LAB = /qwen-reliable|qwen-fast-agent|qwen36-35b\.llamacpp-vulkan\.262k|qwen38-flash\.strata/;

export function assertConsumerGpuValid(pages: ConsumerRecipePage[] = consumerRecipePages()): string[] {
  const errors: string[] = [];
  const ids = pages.map((page) => page.id);
  if (ids.join(',') !== CONSUMER_RECIPE_IDS.join(',')) {
    errors.push(`expected ${CONSUMER_RECIPE_IDS.join(', ')}; got ${ids.join(', ')}`);
  }

  const yamlIds = new Set(gpuDirectory.cards.map((card) => gpuCardId(card)));
  const presetIds = new Set(GPU_PRESETS.map((gpu) => gpu.id));

  for (const page of pages) {
    if (!yamlIds.has(page.id)) errors.push(`${page.id} missing gpus.yaml row`);
    if (!presetIds.has(page.id)) errors.push(`${page.id} missing calculator preset`);
    if (page.vramGb <= 0) errors.push(`${page.id} missing VRAM hardware label`);
    if (page.support !== 'official') errors.push(`${page.id} invented unofficial support`);
    if (!page.matrixHref.startsWith('https://rocm.docs.amd.com/')) errors.push(`${page.id} matrix href`);
    if (!page.linuxReqsHref.startsWith('https://rocm.docs.amd.com/')) errors.push(`${page.id} linux_reqs href`);
    if (!/not measured on local-desktop/i.test(page.notMeasured)) errors.push(`${page.id} must say not measured on local-desktop`);
    if (!/Radeon AI PRO R9700/.test(page.notMeasured)) errors.push(`${page.id} must name the measured R9700`);

    const quants = page.fitRows.map((row) => row.quant);
    if (!quants.includes('Q6_K')) errors.push(`${page.id} missing Q6_K`);
    if (!quants.includes('Q5_K_M')) errors.push(`${page.id} missing Q5_K_M`);
    if (!quants.includes('Q4_K_M')) errors.push(`${page.id} missing Q4_K_M`);
    if (!quants.includes(COMPARE_Q3)) errors.push(`${page.id} missing ${COMPARE_Q3}`);

    for (const row of page.fitRows) {
      if (row.speed !== CONSUMER_SPEED) errors.push(`${page.id} ${row.quant} invented speed`);
      for (const cell of row.cells) {
        if (cell.speed !== CONSUMER_SPEED) errors.push(`${page.id} ${row.quant} ${cell.contextLabel} invented tok/s`);
        if (!cell.totalGb.endsWith(' GB')) errors.push(`${page.id} ${row.quant} VRAM missing GB label`);
        if (!cell.verdictLabel) errors.push(`${page.id} ${row.quant} empty verdict`);
      }
      if (row.kind === 'q3-estimate') {
        if (row.quant !== COMPARE_Q3) errors.push(`${page.id} Q3 row is not ${COMPARE_Q3}`);
        if (!/estimate/i.test(row.kindLabel)) errors.push(`${page.id} Q3 unlabeled`);
      }
      const live = compute(consumerCalcInput(page.id, row.quantId, row.cells[0]!.context));
      if (`${formatGiB(live.weightsGiB)} GB` !== row.weightsGb) {
        errors.push(`${page.id} ${row.quant} weights drifted from calculator`);
      }
      if (live.tested) errors.push(`${page.id} ${row.quant} must not attach a measured badge`);
    }

    if (page.ramNeed.atSelected.label !== 'estimate') errors.push(`${page.id} min RAM must stay estimate`);
    if (page.ramNeed.atFullContext.label !== 'estimate') errors.push(`${page.id} full RAM must stay estimate`);
    if (!(DIMM_KIT_GB as readonly number[]).includes(page.ramNeed.atSelected.kitGb)) {
      errors.push(`${page.id} min kit ${page.ramNeed.atSelected.kitGb} is not a real DIMM size`);
    }
    if (!(DIMM_KIT_GB as readonly number[]).includes(page.ramNeed.atFullContext.kitGb)) {
      errors.push(`${page.id} full kit ${page.ramNeed.atFullContext.kitGb} is not a real DIMM size`);
    }
    if (page.ramNeed.atSelected.measured || page.ramNeed.atFullContext.measured) {
      errors.push(`${page.id} must not overlay local-desktop measured RAM`);
    }

    const blob = consumerBlob(page);
    if (!blob.includes(RAM_MIN_LABEL)) errors.push(`${page.id} missing ${RAM_MIN_LABEL}`);
    if (!blob.includes(RAM_FULL_LABEL)) errors.push(`${page.id} missing ${RAM_FULL_LABEL}`);
    if (BANNED.test(blob)) errors.push(`${page.id} banned model`);
    if (Q4_FLOOR.test(blob)) errors.push(`${page.id} Q4-floor phrase`);
    if (Q1Q2.test(blob)) errors.push(`${page.id} lists Q1/Q2`);
    if (/\$\d|\bMSRP\b|\bUSD\b/i.test(blob)) errors.push(`${page.id} invented price`);
    if (HOUSE_STACK_LAB.test(blob)) errors.push(`${page.id} house Stack Lab profile does not apply`);
    if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push(`${page.id} leftover copy`);
    if (/\b\d+(?:\.\d+)?\s*tok\/s\b/i.test(blob)) errors.push(`${page.id} invented tok/s`);
  }

  return [...new Set(errors)];
}
