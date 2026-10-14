/**
 * "Can my Radeon run it?" GPU × model fit pages under /can-run.
 * Fit / VRAM / RAM come from the existing calculator (compute, fitsInVram,
 * systemRamNeed). GPU sheets and /models pages are the cited catalogs.
 * Q3 is a labeled estimate. Q1/Q2 stay off. No invented tok/s or prices.
 *
 * Do not import model-pages or recipes-data — seo.ts / astro.config load this.
 */

import {
  DEFAULT_INPUT,
  GPU_PRESETS,
  MODEL_PRESETS,
  applyGpuPreset,
  applyModelPreset,
  compute,
  fitsInVram,
  formatCtx,
  formatGiB,
  inputToQuery,
  systemRamNeed,
  type GpuId,
  type ModelId,
  type QuantId,
  type SystemRamNeed,
  type Verdict,
} from './calculator';
import {
  GPU_COMPARE_IDS,
  GPU_COMPARE_PRODUCT,
  GPU_COMPARE_SHEET_PATH,
  GPU_COMPARE_SHORT,
  GPU_COMPARE_SLUG,
  type GpuCompareId,
} from './gpu-compare';
import { MODEL_PAGES } from './gpu-ids';
import {
  MODEL_COMPARE_IDS,
  MODEL_COMPARE_SHORT,
  type ModelCompareId,
} from './model-compare';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { officialLinks } from './site';
import { HOUSE_STACK_LAB, type StackLabOpenInput } from './stack-lab-open';
import { oneVsTwoRows } from './local-desktop-compare';
import type { RunCard } from './run-card';

export const CAN_RUN_PUBLISHED = '2026-10-14';
export const CAN_RUN_HUB = '/can-run';
export const CAN_RUN_ENGINE = 'llama.cpp';
export const CAN_RUN_UNMEASURED = 'not measured yet';
export const CAN_RUN_CONTEXTS = [4096, 32768] as const;
export const CAN_RUN_HEADLINE_CONTEXT = 4096;

export const CAN_RUN_MODEL_IDS = MODEL_COMPARE_IDS;
export type CanRunModelId = ModelCompareId;

export const CAN_RUN_GPU_IDS = GPU_COMPARE_IDS;
export type CanRunGpuId = GpuCompareId;

export const CAN_RUN_MODEL_SLUG: Record<CanRunModelId, string> = {
  qwen36: 'qwen36-35b',
  flash: 'flash',
  'gpt-oss-20b': 'gpt-oss-20b',
  'gemma3-27b': 'gemma3-27b',
  'llama33-70b': 'llama33-70b',
  'glm-53-flash': 'glm-53-flash',
  'qwen36-27b': 'qwen36-27b',
  'qwen38-27b': 'qwen38-27b',
};

export const CAN_RUN_MODEL_ALIASES: Record<string, CanRunModelId> = {
  qwen36: 'qwen36',
  'qwen36-35b': 'qwen36',
  'qwen3.6-35b': 'qwen36',
  flash: 'flash',
  'qwen38-flash': 'flash',
  'qwen-38-flash': 'flash',
  'gpt-oss-20b': 'gpt-oss-20b',
  'gemma3-27b': 'gemma3-27b',
  'llama33-70b': 'llama33-70b',
  'glm-53-flash': 'glm-53-flash',
  'qwen36-27b': 'qwen36-27b',
  'qwen38-27b': 'qwen38-27b',
};

export type CanRunQuantStep = 'Q6' | 'Q5' | 'Q4' | 'Q3';
export type CanRunFitKind = 'estimate' | 'q3-estimate' | 'measured';
export type CanRunVerdictId = 'fits-fully' | 'ram-offload' | 'needs-2-gpus' | 'does-not-fit';

export const CAN_RUN_VERDICT_LABEL: Record<CanRunVerdictId, string> = {
  'fits-fully': 'Fits fully on GPU',
  'ram-offload': 'Fits with RAM offload',
  'needs-2-gpus': 'Needs 2 GPUs',
  'does-not-fit': 'Does not fit',
};

type QuantSpec = {
  step: CanRunQuantStep;
  id: QuantId;
  label: string;
  kind: 'estimate' | 'q3-estimate';
};

function quantLadder(id: CanRunModelId): QuantSpec[] {
  if (id === 'qwen36') {
    return [
      { step: 'Q6', id: 'q6_k', label: 'Q6_K', kind: 'estimate' },
      { step: 'Q5', id: 'q5_k_m', label: 'UD-Q5_K_XL', kind: 'estimate' },
      { step: 'Q4', id: 'q4_k_m', label: 'Q4_K_M', kind: 'estimate' },
      { step: 'Q3', id: 'q3_k_xl', label: 'UD-Q3_K_XL', kind: 'q3-estimate' },
    ];
  }
  if (id === 'flash') {
    return [
      { step: 'Q6', id: 'q6_k', label: 'UD-Q6_K_XL', kind: 'estimate' },
      { step: 'Q5', id: 'q5_k_m', label: 'UD-Q5_K_XL', kind: 'estimate' },
      { step: 'Q4', id: 'q4_k_m', label: 'UD-Q4_K_XL', kind: 'estimate' },
      { step: 'Q3', id: 'q3_k_xl', label: 'UD-Q3_K_XL', kind: 'q3-estimate' },
    ];
  }
  if (id === 'glm-53-flash') {
    return [
      { step: 'Q6', id: 'q6_k', label: 'UD-Q6_K_XL', kind: 'estimate' },
      { step: 'Q5', id: 'q5_k_m', label: 'UD-Q5_K_XL', kind: 'estimate' },
      { step: 'Q4', id: 'q4_k_m', label: 'UD-Q4_K_XL', kind: 'estimate' },
      { step: 'Q3', id: 'q3_k_m', label: 'UD-Q3_K_XL', kind: 'q3-estimate' },
    ];
  }
  if (id === 'qwen38-27b') {
    return [
      { step: 'Q6', id: 'q6_k', label: 'UD-Q6_K', kind: 'estimate' },
      { step: 'Q5', id: 'q5_k_m', label: 'UD-Q5_K_M', kind: 'estimate' },
      { step: 'Q4', id: 'q4_k_m', label: 'UD-Q4_K_M', kind: 'estimate' },
      { step: 'Q3', id: 'q3_k_m', label: 'UD-Q3_K_XL', kind: 'q3-estimate' },
    ];
  }
  return [
    { step: 'Q6', id: 'q6_k', label: 'Q6_K', kind: 'estimate' },
    { step: 'Q5', id: 'q5_k_m', label: 'Q5_K_M', kind: 'estimate' },
    { step: 'Q4', id: 'q4_k_m', label: 'Q4_K_M', kind: 'estimate' },
    { step: 'Q3', id: 'q3_k_m', label: 'Q3_K_M', kind: 'q3-estimate' },
  ];
}

function shopperQuant(id: CanRunModelId): QuantId {
  if (id === 'qwen36') return 'q5_k_m';
  if (id === 'flash') return 'q6_k';
  return 'q4_k_m';
}

function shopperQuantLabel(id: CanRunModelId): string {
  return quantLadder(id).find((row) => row.id === shopperQuant(id))?.label ?? 'Q4_K_M';
}

const NATIVE_CONTEXT: Record<CanRunModelId, { tokens: number; label: string }> = {
  qwen36: { tokens: 262144, label: '262,144 tokens' },
  flash: { tokens: 262144, label: '262,144 tokens' },
  'gpt-oss-20b': { tokens: 131072, label: '131,072 tokens' },
  'gemma3-27b': { tokens: 128000, label: '128K tokens' },
  'llama33-70b': { tokens: 128000, label: '128K tokens' },
  'glm-53-flash': { tokens: 1048576, label: '1,048,576 tokens' },
  'qwen36-27b': { tokens: 262144, label: '262,144 tokens' },
  'qwen38-27b': { tokens: 262144, label: '262,144 tokens' },
};

const OFFICIAL_HF: Record<CanRunModelId, string> = {
  qwen36: officialLinks.qwen36,
  flash: officialLinks.qwenFlash,
  'gpt-oss-20b': officialLinks.gptOss20b,
  'gemma3-27b': officialLinks.gemma327b,
  'llama33-70b': officialLinks.llama3370b,
  'glm-53-flash': officialLinks.glm53Flash,
  'qwen36-27b': officialLinks.qwen36Dense,
  'qwen38-27b': officialLinks.qwen38,
};

const OFFICIAL_GGUF: Record<CanRunModelId, string> = {
  qwen36: officialLinks.qwen36Gguf,
  flash: officialLinks.qwenFlashGguf,
  'gpt-oss-20b': officialLinks.gptOss20bGguf,
  'gemma3-27b': officialLinks.gemma327bGguf,
  'llama33-70b': officialLinks.llama3370bGguf,
  'glm-53-flash': officialLinks.glm53FlashGguf,
  'qwen36-27b': officialLinks.qwen36DenseGguf,
  'qwen38-27b': officialLinks.qwen38Gguf,
};

const CITED_SHOPPER_FILE: Partial<Record<CanRunModelId, string>> = {
  qwen36: 'Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf',
  'gpt-oss-20b': 'gpt-oss-20b-Q4_K_M.gguf',
  'gemma3-27b': 'gemma-3-27b-it-Q4_K_M.gguf',
  'llama33-70b': 'Llama-3.3-70B-Instruct-Q4_K_M.gguf',
  'glm-53-flash': 'UD-Q4_K_XL/GLM-5.3-Flash-UD-Q4_K_XL-00001-of-00006.gguf',
  'qwen36-27b': 'Qwen3.6-27B-Q4_K_M.gguf',
  'qwen38-27b': 'Qwen3.8-27B-UD-Q4_K_M.gguf',
};

const GPU_SLUG_TO_ID = Object.fromEntries(
  (Object.entries(GPU_COMPARE_SLUG) as Array<[CanRunGpuId, string]>).map(([id, slug]) => [slug, id]),
) as Record<string, CanRunGpuId>;

export type CanRunFitCell = {
  context: number;
  contextLabel: string;
  totalGb: string;
  verdict: Verdict;
  verdictLabel: string;
  gpuCount: 1 | 2;
  speed: string;
  speedKind: CanRunFitKind;
  runIds: string[];
  note: string;
};

export type CanRunFitRow = {
  step: CanRunQuantStep;
  quant: string;
  quantId: QuantId;
  kind: 'estimate' | 'q3-estimate';
  kindLabel: string;
  weightsGb: string;
  weightsCite: string;
  one: CanRunFitCell[];
  two: CanRunFitCell[];
};

export type CanRunFile = {
  step: CanRunQuantStep;
  quant: string;
  quantId: QuantId;
  sizeGb: string;
  cite: string;
  kind: 'cited' | 'q3-estimate' | 'estimate';
};

export type CanRunLaunch = {
  href: string;
  label: string;
  backend: string;
  command: string;
  note: string;
};

export type CanRunFaq = {
  id: string;
  question: string;
  answer: string;
  links: { href: string; label: string }[];
};

export type CanRunPairPage = {
  slug: string;
  path: string;
  title: string;
  heading: string;
  description: string;
  lead: string;
  engine: string;
  modelId: CanRunModelId;
  gpuId: CanRunGpuId;
  modelName: string;
  modelShort: string;
  modelPath: string;
  modelRole: string;
  gpuName: string;
  gpuShort: string;
  gpuPath: string;
  vramLabel: string;
  gfx: string;
  productId: string;
  shopperQuant: string;
  headline: CanRunVerdictId;
  headlineLabel: string;
  q3: string;
  q3Cite: string;
  files: CanRunFile[];
  rows: CanRunFitRow[];
  contexts: number[];
  ramNeed: SystemRamNeed;
  ramQuant: string;
  showRam: boolean;
  launches: CanRunLaunch[];
  stackLab: StackLabOpenInput[];
  calculatorHref: string;
  hfHref: string;
  ggufHref: string;
  faq: CanRunFaq[];
};

export type CanRunGridCell = {
  href: string;
  verdict: CanRunVerdictId;
  label: string;
};

export type CanRunHubRow = {
  modelId: CanRunModelId;
  modelName: string;
  modelPath: string;
  cells: CanRunGridCell[];
};

function identity(id: CanRunModelId) {
  const row = MODEL_PAGES.find((model) => model.id === id);
  if (!row) throw new Error(`MODEL_PAGES missing ${id}`);
  const preset = MODEL_PRESETS.find((model) => model.id === id);
  if (!preset) throw new Error(`MODEL_PRESETS missing ${id}`);
  return { row, preset };
}

function gpuPreset(id: CanRunGpuId) {
  const preset = GPU_PRESETS.find((gpu) => gpu.id === id);
  if (!preset) throw new Error(`${id} is missing a calculator preset`);
  return preset;
}

export function isCanRunModelId(id: string): id is CanRunModelId {
  return (CAN_RUN_MODEL_IDS as readonly string[]).includes(id);
}

export function isCanRunGpuId(id: string): id is CanRunGpuId {
  return (CAN_RUN_GPU_IDS as readonly string[]).includes(id);
}

export function canRunModelIdFromInput(raw: string | null | undefined): CanRunModelId | null {
  if (!raw) return null;
  const key = raw.trim().toLowerCase();
  if (isCanRunModelId(key)) return key;
  return CAN_RUN_MODEL_ALIASES[key] ?? null;
}

export function canRunGpuIdFromInput(raw: string | null | undefined): CanRunGpuId | null {
  if (!raw) return null;
  const key = raw.trim().toLowerCase();
  if (isCanRunGpuId(key)) return key;
  return GPU_SLUG_TO_ID[key] ?? null;
}

export function canRunPairSlug(modelId: CanRunModelId, gpuId: CanRunGpuId): string {
  return `${CAN_RUN_MODEL_SLUG[modelId]}-on-${GPU_COMPARE_SLUG[gpuId]}`;
}

export function canRunPairPath(modelId: CanRunModelId, gpuId: CanRunGpuId): string {
  return `${CAN_RUN_HUB}/${canRunPairSlug(modelId, gpuId)}`;
}

export function parseCanRunSlug(slug: string): { modelId: CanRunModelId; gpuId: CanRunGpuId } | null {
  const marker = '-on-';
  const idx = slug.lastIndexOf(marker);
  if (idx <= 0) return null;
  const modelId = canRunModelIdFromInput(slug.slice(0, idx));
  const gpuId = canRunGpuIdFromInput(slug.slice(idx + marker.length));
  if (!modelId || !gpuId) return null;
  return { modelId, gpuId };
}

export function isCanRunPairPath(path: string): boolean {
  if (!path.startsWith(`${CAN_RUN_HUB}/`)) return false;
  return parseCanRunSlug(path.slice(`${CAN_RUN_HUB}/`.length)) !== null;
}

export function canRunCalcInput(
  modelId: CanRunModelId,
  gpuId: CanRunGpuId,
  quant: QuantId,
  context: number,
  gpuCount: 1 | 2 = 1,
) {
  let input = applyGpuPreset(gpuId as GpuId, { ...DEFAULT_INPUT, ramGb: 256, view: 'gpu' });
  input = applyModelPreset(modelId as ModelId, input);
  return {
    ...input,
    gpuId: gpuId as GpuId,
    quantId: quant,
    context,
    kvId: 'f16' as const,
    backendId: 'llamacpp' as const,
    pathId: 'vulkan' as const,
    gpuCount,
    split: gpuCount === 2,
    fileWeightGiB: null,
  };
}

export function canRunContexts(modelId: CanRunModelId): number[] {
  const full = NATIVE_CONTEXT[modelId].tokens;
  const out = [...CAN_RUN_CONTEXTS];
  if (!out.includes(full as (typeof CAN_RUN_CONTEXTS)[number])) out.push(full);
  return out;
}

export function canRunVerdict(modelId: CanRunModelId, gpuId: CanRunGpuId): CanRunVerdictId {
  const quant = shopperQuant(modelId);
  if (fitsInVram(canRunCalcInput(modelId, gpuId, quant, CAN_RUN_HEADLINE_CONTEXT, 1))) {
    return 'fits-fully';
  }
  if (fitsInVram(canRunCalcInput(modelId, gpuId, quant, CAN_RUN_HEADLINE_CONTEXT, 2))) {
    return 'needs-2-gpus';
  }
  const ram = systemRamNeed(canRunCalcInput(modelId, gpuId, quant, CAN_RUN_HEADLINE_CONTEXT, 1));
  if (ram.atSelected.kitGb > 256) return 'does-not-fit';
  return 'ram-offload';
}

function kindLabel(kind: 'estimate' | 'q3-estimate'): string {
  return kind === 'q3-estimate' ? 'Q3 estimate' : 'Estimate';
}

function fileRow(id: CanRunModelId, spec: QuantSpec): CanRunFile {
  const { preset } = identity(id);
  const listed = preset.publisherFiles[spec.id];
  const weights = compute(canRunCalcInput(id, 'r9700', spec.id, CAN_RUN_HEADLINE_CONTEXT));
  if (listed) {
    return {
      step: spec.step,
      quant: spec.label,
      quantId: spec.id,
      sizeGb: `${listed.decimalGb} GB`,
      cite: listed.label,
      kind: spec.kind === 'q3-estimate' ? 'q3-estimate' : 'cited',
    };
  }
  return {
    step: spec.step,
    quant: spec.label,
    quantId: spec.id,
    sizeGb: `${formatGiB(weights.weightsGiB)} GB`,
    cite: `${weights.weightsNote} No listed publisher file size for this quant.`,
    kind: spec.kind === 'q3-estimate' ? 'q3-estimate' : 'estimate',
  };
}

function measuredDecode(
  modelId: CanRunModelId,
  gpuId: CanRunGpuId,
  spec: QuantSpec,
  context: number,
  gpuCount: 1 | 2,
  cards: RunCard[],
): { decode: string; kind: CanRunFitKind; runIds: string[]; note: string } {
  if (spec.kind === 'q3-estimate') {
    return {
      decode: CAN_RUN_UNMEASURED,
      kind: 'q3-estimate',
      runIds: [],
      note: `${spec.label} is a labeled estimate — not a local desktop run.`,
    };
  }
  if (modelId !== 'qwen36' || gpuId !== 'r9700') {
    return {
      decode: CAN_RUN_UNMEASURED,
      kind: 'estimate',
      runIds: [],
      note: 'No official local desktop cell for this model × card. Empty stays not measured yet.',
    };
  }
  const row = oneVsTwoRows(cards).find((item) => item.quant === spec.label && item.context === context);
  const cell = gpuCount === 2 ? row?.both : row?.one;
  const decode = cell?.decode ?? CAN_RUN_UNMEASURED;
  if (!row || !cell || decode === 'not measured' || decode === CAN_RUN_UNMEASURED) {
    return {
      decode: CAN_RUN_UNMEASURED,
      kind: 'estimate',
      runIds: [],
      note: 'No official local desktop cell for this quant × context. Empty stays not measured yet.',
    };
  }
  return {
    decode,
    kind: 'measured',
    runIds: cell.runIds,
    note: gpuCount === 2
      ? 'Official local desktop llama.cpp Vulkan split on two R9700s.'
      : 'Official local desktop llama.cpp Vulkan card on one R9700.',
  };
}

function fitCell(
  modelId: CanRunModelId,
  gpuId: CanRunGpuId,
  spec: QuantSpec,
  context: number,
  gpuCount: 1 | 2,
  cards: RunCard[],
): CanRunFitCell {
  const result = compute(canRunCalcInput(modelId, gpuId, spec.id, context, gpuCount));
  const measured = measuredDecode(modelId, gpuId, spec, context, gpuCount, cards);
  return {
    context,
    contextLabel: formatCtx(context),
    totalGb: `${formatGiB(result.totalGiB)} GB`,
    verdict: result.verdict,
    verdictLabel: result.verdictLabel,
    gpuCount,
    speed: measured.decode,
    speedKind: measured.kind,
    runIds: measured.runIds,
    note: measured.note,
  };
}

function llamaServerCommand(file: string | null, hip: boolean): string {
  const bin = hip ? './build-hip/bin/llama-server' : './build-vk/bin/llama-server';
  const note = hip
    ? '# HIP shape only — house 35B cards are Vulkan. HIP decode is not measured yet.'
    : '# llama.cpp Vulkan. House pin when a recipe exists; otherwise a shape only.';
  const weights = file
    ? `  -m ~/models/${file} \\`
    : '  -m ~/models/<cited-gguf-from-the-model-page> \\';
  return [
    note,
    `${bin} \\`,
    weights,
    '  -ngl 99 \\',
    '  -c 4096 \\',
    '  --cache-type-k f16 \\',
    '  --cache-type-v f16 \\',
    '  --host 127.0.0.1 --port 8080',
  ].join('\n');
}

function launchesFor(modelId: CanRunModelId): CanRunLaunch[] {
  const file = CITED_SHOPPER_FILE[modelId] ?? null;
  const house =
    modelId === 'qwen36'
      ? {
          href: '/recipes/qwen36-35b.llamacpp-vulkan.262k',
          label: '35B llama.cpp Vulkan 262K',
          note: 'House daily-driver recipe. Copy the recipe page for the 262K pin.',
        }
      : modelId === 'flash'
        ? {
            href: '/models/flash',
            label: 'llama.cpp first (Flash)',
            note: 'Flash UD-Q6_K_XL is a sharded folder on the model page — do not invent a single filename. Strata is the house speed try on /backends.',
          }
        : {
            href: '/backends/llamacpp',
            label: `${MODEL_COMPARE_SHORT[modelId]} llama.cpp`,
            note: 'Shape only — not a measured local desktop recipe. Copy the cited GGUF name from the model page.',
          };
  return [
    {
      href: house.href,
      label: house.label,
      backend: 'llama.cpp Vulkan',
      command: llamaServerCommand(file, false),
      note: house.note,
    },
    {
      href: '/rocm/vulkan-hip',
      label: 'ROCm / HIP after rocminfo',
      backend: 'llama.cpp HIP',
      command: llamaServerCommand(file, true),
      note: 'HIP decode is not measured yet. Confirm gfx with rocminfo first.',
    },
  ];
}

function stackLabFor(modelId: CanRunModelId): StackLabOpenInput[] {
  const out: StackLabOpenInput[] = [HOUSE_STACK_LAB.doctor, HOUSE_STACK_LAB.planner];
  if (modelId === 'qwen36') out.push(HOUSE_STACK_LAB.daily, HOUSE_STACK_LAB.reliable);
  if (modelId === 'flash') out.push(HOUSE_STACK_LAB.flash, HOUSE_STACK_LAB.fastAgent);
  return out;
}

function pairDescription(modelShort: string, gpuShort: string, verdict: CanRunVerdictId): string {
  const fit = CAN_RUN_VERDICT_LABEL[verdict];
  const text = `Can ${gpuShort} run ${modelShort}? ${fit}. Q6/Q5/Q4 plus a labeled Q3 estimate. Measured cells only on R9700 35B.`;
  return text.length <= 160 ? text : text.slice(0, 157).replace(/\s+\S*$/, '') + '…';
}

function pairLead(
  modelShort: string,
  gpuShort: string,
  vramLabel: string,
  verdict: CanRunVerdictId,
  shopper: string,
): string {
  const fit = CAN_RUN_VERDICT_LABEL[verdict];
  return `${gpuShort} (${vramLabel}) × ${modelShort}. Shopper file is ${shopper} at 4K. Calculator verdict: ${fit.toLowerCase()}. llama.cpp first (Vulkan, then HIP). Q3 is a labeled estimate, not a house pick. Measured decode appears only where a local desktop card already exists. We do not invent a price.`;
}

function pairFaq(page: {
  path: string;
  modelShort: string;
  gpuShort: string;
  gpuPath: string;
  modelPath: string;
  headlineLabel: string;
  q3: string;
  shopperQuant: string;
}): CanRunFaq[] {
  return [
    {
      id: 'can-it-run',
      question: `Can ${page.gpuShort} run ${page.modelShort}?`,
      answer: `${page.headlineLabel} on the calculator at the shopper ${page.shopperQuant} file and 4K. Q6 / Q5 / Q4 are listed. ${page.q3} is a labeled estimate. llama.cpp first.`,
      links: [
        { href: page.path, label: 'This pair' },
        { href: page.gpuPath, label: page.gpuShort },
        { href: page.modelPath, label: page.modelShort },
        { href: '/calculator', label: 'Calculator' },
      ],
    },
    {
      id: 'which-quant',
      question: 'Which quant should I download?',
      answer: `Prefer the shopper ${page.shopperQuant} file when it still fits. Q6 / Q5 / Q4 are the listed shopper steps. ${page.q3} is a labeled estimate — not a house pick. Q1/Q2 stay off.`,
      links: [
        { href: '/quants', label: 'Quants' },
        { href: '/compare/q4-q5-q6', label: 'Q6 / Q5 / Q4 + Q3 estimate' },
      ],
    },
    {
      id: 'measured-speed',
      question: 'How fast is it?',
      answer: `Measured decode is only the official local desktop 35B llama.cpp Vulkan sweep on one or two R9700s. Every other model × card stays ${CAN_RUN_UNMEASURED}. Record a card with amdai-bench.`,
      links: [
        { href: '/contribute', label: 'Contribute' },
        { href: '/amdai-bench', label: 'amdai-bench' },
        { href: '/benchmarks', label: 'Benchmarks' },
      ],
    },
  ];
}

export function canRunPairPage(modelId: CanRunModelId, gpuId: CanRunGpuId, cards: RunCard[] = []): CanRunPairPage {
  const { row, preset } = identity(modelId);
  const gpu = gpuPreset(gpuId);
  const contexts = canRunContexts(modelId);
  const ladder = quantLadder(modelId);
  const files = ladder.map((spec) => fileRow(modelId, spec));
  const q3 = files.find((file) => file.step === 'Q3')!;
  const headline = canRunVerdict(modelId, gpuId);
  const shopper = shopperQuantLabel(modelId);
  const ramInput = canRunCalcInput(modelId, gpuId, shopperQuant(modelId), 32768, 1);
  const ramNeed = systemRamNeed(ramInput);
  const rows = ladder.map((spec) => {
    const weights = files.find((file) => file.step === spec.step)!;
    return {
      step: spec.step,
      quant: spec.label,
      quantId: spec.id,
      kind: spec.kind,
      kindLabel: kindLabel(spec.kind),
      weightsGb: weights.sizeGb,
      weightsCite: weights.cite,
      one: contexts.map((context) => fitCell(modelId, gpuId, spec, context, 1, cards)),
      two: contexts.map((context) => fitCell(modelId, gpuId, spec, context, 2, cards)),
    };
  });
  const showRam =
    headline === 'ram-offload' ||
    rows.some((row) => row.one.some((cell) => cell.verdict !== 'fits') || row.two.some((cell) => cell.verdict !== 'fits'));
  const slug = canRunPairSlug(modelId, gpuId);
  const path = `${CAN_RUN_HUB}/${slug}`;
  const modelShort = MODEL_COMPARE_SHORT[modelId];
  const gpuShort = GPU_COMPARE_SHORT[gpuId];
  const gpuPath = GPU_COMPARE_SHEET_PATH[gpuId];
  const modelPath = `/models/${modelId}`;
  const vramLabel = `${gpu.vramGb} GB`;
  const page = {
    slug,
    path,
    title: `Can ${gpuShort} run ${modelShort}?`,
    heading: `Can ${gpuShort} run ${modelShort}?`,
    description: pairDescription(modelShort, gpuShort, headline),
    lead: pairLead(modelShort, gpuShort, vramLabel, headline, shopper),
    engine: CAN_RUN_ENGINE,
    modelId,
    gpuId,
    modelName: row.name,
    modelShort,
    modelPath,
    modelRole: row.role,
    gpuName: gpu.name,
    gpuShort,
    gpuPath,
    vramLabel,
    gfx: gpu.gfx,
    productId: GPU_COMPARE_PRODUCT[gpuId],
    shopperQuant: shopper,
    headline,
    headlineLabel: CAN_RUN_VERDICT_LABEL[headline],
    q3: q3.quant,
    q3Cite: q3.cite,
    files,
    rows,
    contexts,
    ramNeed,
    ramQuant: shopper,
    showRam,
    launches: launchesFor(modelId),
    stackLab: stackLabFor(modelId),
    calculatorHref: `/calculator?${inputToQuery(ramInput)}`,
    hfHref: OFFICIAL_HF[modelId],
    ggufHref: OFFICIAL_GGUF[modelId],
    faq: [] as CanRunFaq[],
  };
  page.faq = pairFaq(page);
  void preset;
  return page;
}

export function canRunPairPages(cards: RunCard[] = []): CanRunPairPage[] {
  const pages: CanRunPairPage[] = [];
  for (const modelId of CAN_RUN_MODEL_IDS) {
    for (const gpuId of CAN_RUN_GPU_IDS) {
      pages.push(canRunPairPage(modelId, gpuId, cards));
    }
  }
  return pages;
}

export function canRunHubRows(): CanRunHubRow[] {
  return CAN_RUN_MODEL_IDS.map((modelId) => ({
    modelId,
    modelName: MODEL_COMPARE_SHORT[modelId],
    modelPath: `/models/${modelId}`,
    cells: CAN_RUN_GPU_IDS.map((gpuId) => {
      const verdict = canRunVerdict(modelId, gpuId);
      return {
        href: canRunPairPath(modelId, gpuId),
        verdict,
        label: CAN_RUN_VERDICT_LABEL[verdict],
      };
    }),
  }));
}

export function canRunGpuColumns(): Array<{ id: CanRunGpuId; label: string; href: string }> {
  return CAN_RUN_GPU_IDS.map((id) => ({
    id,
    label: GPU_COMPARE_SHORT[id],
    href: GPU_COMPARE_SHEET_PATH[id],
  }));
}

export function parseCanRunPicker(search: string): {
  model: CanRunModelId | null;
  gpu: CanRunGpuId | null;
  href: string | null;
} {
  const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const model = canRunModelIdFromInput(q.get('model'));
  const gpu = canRunGpuIdFromInput(q.get('gpu'));
  if (!model || !gpu) return { model, gpu, href: null };
  return { model, gpu, href: canRunPairPath(model, gpu) };
}

export function canRunLinksForModel(id: CanRunModelId): Array<{ href: string; label: string }> {
  const featured: CanRunGpuId[] = ['r9700', 'rx7900xtx', 'rx7800xt', 'rx7600'];
  return featured.filter(isCanRunGpuId).map((gpuId) => ({
    href: canRunPairPath(id, gpuId),
    label: `on ${GPU_COMPARE_SHORT[gpuId]}`,
  }));
}

export function canRunLinksForGpu(id: CanRunGpuId): Array<{ href: string; label: string }> {
  const featured: CanRunModelId[] = ['qwen36', 'flash', 'glm-53-flash', 'llama33-70b'];
  return featured.filter(isCanRunModelId).map((modelId) => ({
    href: canRunPairPath(modelId, id),
    label: MODEL_COMPARE_SHORT[modelId],
  }));
}

export function canRunRedirects(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const modelId of CAN_RUN_MODEL_IDS) {
    for (const gpuId of CAN_RUN_GPU_IDS) {
      const canonical = canRunPairPath(modelId, gpuId);
      const aliases = Object.entries(CAN_RUN_MODEL_ALIASES)
        .filter(([, id]) => id === modelId)
        .map(([slug]) => slug);
      const gpuAliases = [
        GPU_COMPARE_SLUG[gpuId],
        gpuId,
        gpuId.replaceAll('rx', 'rx-'),
      ];
      for (const modelSlug of aliases) {
        for (const gpuSlug of gpuAliases) {
          const href = `${CAN_RUN_HUB}/${modelSlug}-on-${gpuSlug}`;
          if (href !== canonical) out[href] = canonical;
        }
      }
    }
  }
  return out;
}

export function canRunSeoRows(): Array<{ path: string; title: string; description: string; published: string }> {
  const hub = {
    path: CAN_RUN_HUB,
    title: 'Can my Radeon run it?',
    description:
      'Pick a cited Radeon sheet and a cited /models page. Q6/Q5/Q4 fit plus a labeled Q3 estimate. No invented speeds.',
    published: CAN_RUN_PUBLISHED,
  };
  return [
    hub,
    ...CAN_RUN_MODEL_IDS.flatMap((modelId) =>
      CAN_RUN_GPU_IDS.map((gpuId) => {
        const modelShort = MODEL_COMPARE_SHORT[modelId];
        const gpuShort = GPU_COMPARE_SHORT[gpuId];
        const verdict = canRunVerdict(modelId, gpuId);
        return {
          path: canRunPairPath(modelId, gpuId),
          title: `Can ${gpuShort} run ${modelShort}?`,
          description: pairDescription(modelShort, gpuShort, verdict),
          published: CAN_RUN_PUBLISHED,
        };
      }),
    ),
  ];
}

export const CAN_RUN_HUB_LEAD =
  `Search “can RX 7900 XTX run Qwen3.6-35B” or “GLM 5.3 Flash on 16 GB Radeon.” Each pair uses the calculator already on AMDai — the same VRAM math as /calculator, the cited /gpus sheets, and the cited /models pages. Q6 / Q5 / Q4 plus a labeled Q3 estimate. Measured decode is only the official local desktop 35B llama.cpp Vulkan sweep on R9700. Everything else stays ${CAN_RUN_UNMEASURED}. llama.cpp first. We do not invent a price.`;

export const CAN_RUN_HUB_FAQ: CanRunFaq[] = [
  {
    id: 'what-is-can-run',
    question: 'What does “can my Radeon run it” mean here?',
    answer:
      'A calculator verdict on a cited GPU sheet × a cited /models page. Fits fully on GPU, fits with RAM offload, needs 2 GPUs, or does not fit. Shopper files stay Q4 and up. Q3 is a labeled estimate.',
    links: [
      { href: CAN_RUN_HUB, label: 'Can my Radeon run it?' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/models', label: 'Models' },
    ],
  },
  {
    id: 'is-q3-runnable',
    question: 'Should I download the Q3 file?',
    answer:
      'Q3 rows are labeled estimates from the publisher listing. This site does not recommend a Q3 as the shopper file. Q1/Q2 stay off.',
    links: [
      { href: '/quants', label: 'Quants' },
      { href: '/compare/q4-q5-q6', label: 'Q6 / Q5 / Q4 + Q3 estimate' },
    ],
  },
];

export function canRunHubFaq(): CanRunFaq[] {
  return CAN_RUN_HUB_FAQ;
}

export function canRunBlob(page: CanRunPairPage): string {
  return [
    page.title,
    page.heading,
    page.description,
    page.lead,
    page.headlineLabel,
    page.q3,
    page.q3Cite,
    page.files.map((file) => `${file.quant} ${file.sizeGb} ${file.cite}`).join('\n'),
    page.rows.map((row) => `${row.quant} ${row.kindLabel} ${row.weightsCite}`).join('\n'),
    page.launches.map((row) => `${row.label} ${row.backend} ${row.command} ${row.note}`).join('\n'),
    page.faq.map((row) => `${row.question} ${row.answer}`).join('\n'),
    RAM_MIN_LABEL,
    RAM_FULL_LABEL,
    CAN_RUN_UNMEASURED,
  ].join('\n');
}

export function canRunHrefs(page: CanRunPairPage): string[] {
  return [
    page.path,
    CAN_RUN_HUB,
    page.modelPath,
    page.gpuPath,
    page.calculatorHref.split('?')[0] ?? '/calculator',
    '/backends/llamacpp',
    '/rocm/vulkan-hip',
    '/stack-lab',
    '/amdai-bench',
    '/contribute',
    '/benchmarks',
    '/quants',
    '/compare/q4-q5-q6',
    '/multi-gpu',
    '/flash-ram-offload',
    '/faq',
  ];
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function assertCanRunValid(cards: RunCard[] = []): string[] {
  const errors: string[] = [];
  const expected = CAN_RUN_MODEL_IDS.length * CAN_RUN_GPU_IDS.length;
  const pages = canRunPairPages(cards);
  if (pages.length !== expected) errors.push(`expected ${expected} pair pages; got ${pages.length}`);
  if (canRunPairPath('qwen36', 'rx7900xtx') !== '/can-run/qwen36-35b-on-rx-7900-xtx') {
    errors.push('house pair slug drifted');
  }
  const parsed = parseCanRunSlug('qwen36-35b-on-rx-7900-xtx');
  if (!parsed || parsed.modelId !== 'qwen36' || parsed.gpuId !== 'rx7900xtx') errors.push('parse house slug');
  const pageIds = new Set(MODEL_PAGES.map((model) => model.id));
  const presetIds = new Set(MODEL_PRESETS.map((model) => model.id));
  const gpuIds = new Set(GPU_PRESETS.map((gpu) => gpu.id));
  for (const id of CAN_RUN_MODEL_IDS) {
    if (!pageIds.has(id)) errors.push(`${id} missing MODEL_PAGES`);
    if (!presetIds.has(id)) errors.push(`${id} missing MODEL_PRESETS`);
  }
  for (const id of CAN_RUN_GPU_IDS) {
    if (!gpuIds.has(id)) errors.push(`${id} missing GPU_PRESETS`);
    if (!GPU_COMPARE_SHEET_PATH[id]) errors.push(`${id} missing cited sheet`);
  }
  const house = pages.find((page) => page.modelId === 'qwen36' && page.gpuId === 'r9700');
  if (!house || house.headline !== 'fits-fully') errors.push('R9700 × 35B must fit fully at shopper Q5');
  const flash16 = pages.find((page) => page.modelId === 'flash' && page.gpuId === 'rx7800xt');
  if (!flash16 || flash16.headline === 'fits-fully') errors.push('Flash on 16 GB must not claim in-VRAM');
  for (const page of pages) {
    if (page.description.length < 70 || page.description.length > 160) {
      errors.push(`${page.path} description length ${page.description.length}`);
    }
    const blob = canRunBlob(page);
    if (BANNED.test(blob)) errors.push(`${page.path} banned model`);
    if (Q1Q2.test(blob)) errors.push(`${page.path} Q1/Q2`);
    if (Q4_FLOOR.test(blob)) errors.push(`${page.path} Q4-floor phrase`);
    if (/\$\d|\bMSRP\b/i.test(blob)) errors.push(`${page.path} invented price`);
    if (/\b\d+(?:\.\d+)?\s*tok\/s\b/i.test(blob)) errors.push(`${page.path} tok/s must stay in measured cells`);
    if (!blob.includes(page.q3)) errors.push(`${page.path} missing Q3 label`);
    if (!/labeled estimate|Q3 estimate/.test(blob)) errors.push(`${page.path} Q3 must stay a labeled estimate`);
    if (!/llama\.cpp/i.test(blob)) errors.push(`${page.path} llama.cpp first`);
    if (page.rows.length !== 4) errors.push(`${page.path} must list Q6/Q5/Q4 + Q3`);
    const q3 = page.rows.find((row) => row.step === 'Q3');
    if (!q3 || q3.kind !== 'q3-estimate') errors.push(`${page.path} Q3 row kind`);
    if (page.showRam && (!page.ramNeed.atSelected.kitGb || !page.ramNeed.atFullContext.kitGb)) {
      errors.push(`${page.path} RAM lines missing kits`);
    }
    if (page.launches.length < 2) errors.push(`${page.path} need Vulkan and HIP launches`);
    if (!page.launches.some((row) => row.backend.includes('Vulkan'))) errors.push(`${page.path} missing Vulkan`);
    if (!page.faq.some((row) => row.id === 'can-it-run')) errors.push(`${page.path} missing verdict FAQ`);
    if (cards.length && page.modelId === 'qwen36' && page.gpuId === 'r9700') {
      const q5 = page.rows.find((row) => row.quant === 'UD-Q5_K_XL');
      const cell = q5?.one.find((item) => item.context === 4096);
      if (!cell || cell.speedKind !== 'measured' || !/tok\/s/.test(cell.speed)) {
        errors.push('R9700 35B UD-Q5 4K must keep the measured cell');
      }
    }
  }
  const grid = canRunHubRows();
  if (grid.length !== CAN_RUN_MODEL_IDS.length) errors.push('hub grid model count');
  if (grid[0]?.cells.length !== CAN_RUN_GPU_IDS.length) errors.push('hub grid gpu count');
  return [...new Set(errors)];
}

export {
  GPU_COMPARE_SHORT as CAN_RUN_GPU_SHORT,
  GPU_COMPARE_SLUG as CAN_RUN_GPU_SLUG,
  GPU_COMPARE_SHEET_PATH as CAN_RUN_GPU_PATH,
  MODEL_COMPARE_SHORT as CAN_RUN_MODEL_SHORT,
  RAM_FULL_LABEL,
  RAM_MIN_LABEL,
};
