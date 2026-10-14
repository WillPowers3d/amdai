/**
 * Head-to-head model compare under /compare/models.
 * Built only from cited /models pages, calculator presets, GPU sheets,
 * and existing R9700 run-card helpers. Q3 is a labeled estimate. Q1/Q2 stay off.
 * No invented prices or tok/s. Never recommend Qwen2.5 or Qwen3-8B.
 *
 * Do not import model-pages (recipes-data glob) — this module is loaded from
 * seo.ts and astro.config.mjs.
 */

import {
  DEFAULT_INPUT,
  DIMM_KIT_GB,
  GPU_PRESETS,
  MODEL_PRESETS,
  applyGpuPreset,
  applyModelPreset,
  compute,
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
import { MODEL_PAGES } from './gpu-ids';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { officialLinks } from './site';
import { HOUSE_STACK_LAB, type StackLabOpenInput } from './stack-lab-open';
import { oneVsTwoRows } from './local-desktop-compare';
import type { RunCard } from './run-card';

export const MODEL_COMPARE_PUBLISHED = '2026-10-14';
export const MODEL_COMPARE_HUB = '/compare/models';
export const MODEL_COMPARE_ENGINE = 'llama.cpp';
export const MODEL_COMPARE_CONTEXTS = [4096, 32768] as const;
export const MODEL_COMPARE_RAM_CONTEXT = 32768;

export const MODEL_COMPARE_IDS = [
  'qwen36',
  'flash',
  'gpt-oss-20b',
  'gemma3-27b',
  'llama33-70b',
  'glm-53-flash',
  'qwen36-27b',
  'qwen38-27b',
] as const;

export type ModelCompareId = (typeof MODEL_COMPARE_IDS)[number];

export const MODEL_COMPARE_SLUG: Record<ModelCompareId, string> = {
  qwen36: 'qwen36',
  flash: 'flash',
  'gpt-oss-20b': 'gpt-oss-20b',
  'gemma3-27b': 'gemma3-27b',
  'llama33-70b': 'llama33-70b',
  'glm-53-flash': 'glm-53-flash',
  'qwen36-27b': 'qwen36-27b',
  'qwen38-27b': 'qwen38-27b',
};

export const MODEL_COMPARE_SHORT: Record<ModelCompareId, string> = {
  qwen36: 'Qwen3.6-35B',
  flash: 'Qwen 3.8 Flash',
  'gpt-oss-20b': 'gpt-oss 20B',
  'gemma3-27b': 'Gemma 3 27B',
  'llama33-70b': 'Llama 3.3 70B',
  'glm-53-flash': 'GLM 5.3 Flash',
  'qwen36-27b': 'Qwen3.6 27B',
  'qwen38-27b': 'Qwen3.8 27B',
};

/** Shopper-useful pairs on the picker. Canonical href still uses catalog order. */
export const MODEL_COMPARE_FEATURED_PAIRS = [
  ['qwen36', 'glm-53-flash'],
  ['qwen36', 'flash'],
  ['qwen36', 'gemma3-27b'],
  ['qwen36', 'llama33-70b'],
  ['qwen36', 'gpt-oss-20b'],
  ['qwen36', 'qwen36-27b'],
  ['flash', 'glm-53-flash'],
  ['gemma3-27b', 'qwen36-27b'],
  ['gemma3-27b', 'qwen38-27b'],
  ['qwen36-27b', 'qwen38-27b'],
  ['llama33-70b', 'glm-53-flash'],
  ['gpt-oss-20b', 'gemma3-27b'],
] as const satisfies ReadonlyArray<readonly [ModelCompareId, ModelCompareId]>;

export const MODEL_COMPARE_FIT_GPUS = ['r9700', 'rx7900xtx', 'rx7900xt', 'rx7800xt'] as const;
export type ModelCompareFitGpuId = (typeof MODEL_COMPARE_FIT_GPUS)[number];

const FIT_GPU_PATH: Record<ModelCompareFitGpuId, string> = {
  r9700: '/gpus/r9700',
  rx7900xtx: '/gpus/rx-7900-xtx',
  rx7900xt: '/gpus/rx-7900-xt',
  rx7800xt: '/gpus/rx-7800-xt',
};

const FIT_GPU_SHORT: Record<ModelCompareFitGpuId, string> = {
  r9700: 'R9700',
  rx7900xtx: 'RX 7900 XTX',
  rx7900xt: 'RX 7900 XT',
  rx7800xt: 'RX 7800 XT',
};

const NATIVE_CONTEXT: Record<ModelCompareId, { tokens: number; label: string }> = {
  qwen36: { tokens: 262144, label: '262,144 tokens' },
  flash: { tokens: 262144, label: '262,144 tokens' },
  'gpt-oss-20b': { tokens: 131072, label: '131,072 tokens' },
  'gemma3-27b': { tokens: 128000, label: '128K tokens' },
  'llama33-70b': { tokens: 128000, label: '128K tokens' },
  'glm-53-flash': { tokens: 1048576, label: '1,048,576 tokens' },
  'qwen36-27b': { tokens: 262144, label: '262,144 tokens' },
  'qwen38-27b': { tokens: 262144, label: '262,144 tokens' },
};

const OFFICIAL_HF: Record<ModelCompareId, string> = {
  qwen36: officialLinks.qwen36,
  flash: officialLinks.qwenFlash,
  'gpt-oss-20b': officialLinks.gptOss20b,
  'gemma3-27b': officialLinks.gemma327b,
  'llama33-70b': officialLinks.llama3370b,
  'glm-53-flash': officialLinks.glm53Flash,
  'qwen36-27b': officialLinks.qwen36Dense,
  'qwen38-27b': officialLinks.qwen38,
};

const OFFICIAL_GGUF: Record<ModelCompareId, string> = {
  qwen36: officialLinks.qwen36Gguf,
  flash: officialLinks.qwenFlashGguf,
  'gpt-oss-20b': officialLinks.gptOss20bGguf,
  'gemma3-27b': officialLinks.gemma327bGguf,
  'llama33-70b': officialLinks.llama3370bGguf,
  'glm-53-flash': officialLinks.glm53FlashGguf,
  'qwen36-27b': officialLinks.qwen36DenseGguf,
  'qwen38-27b': officialLinks.qwen38Gguf,
};

const CITED_Q4_FILE: Partial<Record<ModelCompareId, string>> = {
  'gpt-oss-20b': 'gpt-oss-20b-Q4_K_M.gguf',
  'gemma3-27b': 'gemma-3-27b-it-Q4_K_M.gguf',
  'llama33-70b': 'Llama-3.3-70B-Instruct-Q4_K_M.gguf',
  'glm-53-flash': 'UD-Q4_K_XL/GLM-5.3-Flash-UD-Q4_K_XL-00001-of-00006.gguf',
  'qwen36-27b': 'Qwen3.6-27B-Q4_K_M.gguf',
  'qwen38-27b': 'Qwen3.8-27B-UD-Q4_K_M.gguf',
};

const HOUSE_LAUNCH: Partial<Record<ModelCompareId, ModelCompareLaunch[]>> = {
  qwen36: [
    {
      href: '/recipes/qwen36-35b.llamacpp-vulkan.262k',
      label: '35B llama.cpp Vulkan 262K',
      backend: 'llama.cpp',
      command: null,
    },
  ],
  flash: [
    {
      href: '/backends/llamacpp',
      label: 'llama.cpp first',
      backend: 'llama.cpp',
      command: null,
    },
    {
      href: '/recipes/qwen38-flash.strata.262k',
      label: 'Flash Strata 262K',
      backend: 'Strata',
      command: null,
    },
  ],
};

export type ModelCompareQuantStep = 'Q6' | 'Q5' | 'Q4' | 'Q3';
export type ModelCompareFitKind = 'estimate' | 'q3-estimate' | 'measured';

type QuantSpec = {
  step: ModelCompareQuantStep;
  id: QuantId;
  label: string;
  kind: 'estimate' | 'q3-estimate';
};

function quantLadder(id: ModelCompareId): QuantSpec[] {
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

function shopperQuant(id: ModelCompareId): QuantId {
  if (id === 'qwen36') return 'q5_k_m';
  if (id === 'flash') return 'q6_k';
  return 'q4_k_m';
}

function shopperQuantLabel(id: ModelCompareId): string {
  return quantLadder(id).find((row) => row.id === shopperQuant(id))?.label ?? 'Q4_K_M';
}

const SLUG_TO_ID = Object.fromEntries(
  (Object.entries(MODEL_COMPARE_SLUG) as Array<[ModelCompareId, string]>).map(([id, slug]) => [slug, id]),
) as Record<string, ModelCompareId>;

export type ModelCompareFitCell = {
  context: number;
  contextLabel: string;
  totalGb: string;
  verdict: Verdict;
  verdictLabel: string;
  speed: string;
  speedKind: ModelCompareFitKind;
  runIds: string[];
  note: string;
};

export type ModelCompareFitRow = {
  step: ModelCompareQuantStep;
  leftQuant: string;
  rightQuant: string;
  leftQuantId: QuantId;
  rightQuantId: QuantId;
  kind: 'estimate' | 'q3-estimate';
  kindLabel: string;
  leftWeightsGb: string;
  rightWeightsGb: string;
  leftWeightsNote: string;
  rightWeightsNote: string;
  left: ModelCompareFitCell[];
  right: ModelCompareFitCell[];
};

export type ModelCompareGpuBlock = {
  gpuId: ModelCompareFitGpuId;
  gpuName: string;
  gpuHref: string;
  vramLabel: string;
  rows: ModelCompareFitRow[];
};

export type ModelCompareFile = {
  step: ModelCompareQuantStep;
  quant: string;
  quantId: QuantId;
  sizeGb: string;
  cite: string;
  kind: 'cited' | 'q3-estimate' | 'estimate';
};

export type ModelCompareLaunch = {
  href: string;
  label: string;
  backend: string;
  command: string | null;
};

export type ModelCompareSide = {
  id: ModelCompareId;
  slug: string;
  path: string;
  name: string;
  shortName: string;
  role: string;
  official: string;
  hf: string;
  ggufName: string;
  ggufHref: string;
  paramsLine: string;
  totalParams: string;
  activeParams: string;
  contextLabel: string;
  contextTokens: number;
  contextCite: string;
  archNote: string;
  files: ModelCompareFile[];
  launches: ModelCompareLaunch[];
  house: boolean;
  measured: boolean;
  calculatorHref: string;
  ramNeed: SystemRamNeed;
  ramQuant: string;
  offload: boolean;
};

export type ModelCompareUseCase = {
  id: 'chat' | 'coding' | 'long-context' | 'size';
  title: string;
  body: string;
};

export type ModelComparePairPage = {
  slug: string;
  path: string;
  left: ModelCompareSide;
  right: ModelCompareSide;
  title: string;
  heading: string;
  description: string;
  lead: string;
  engine: string;
  q3Left: string;
  q3Right: string;
  q3CiteLeft: string;
  q3CiteRight: string;
  gpuBlocks: ModelCompareGpuBlock[];
  useCases: ModelCompareUseCase[];
  stackLab: StackLabOpenInput[];
  featured: boolean;
};

export type ModelCompareLink = {
  href: string;
  label: string;
  featured: boolean;
};

export type ModelCompareHubCard = {
  href: string;
  title: string;
  kicker: string;
  body: string;
};

function identity(id: ModelCompareId) {
  const row = MODEL_PAGES.find((model) => model.id === id);
  if (!row) throw new Error(`MODEL_PAGES missing ${id}`);
  const preset = MODEL_PRESETS.find((model) => model.id === id);
  if (!preset) throw new Error(`MODEL_PRESETS missing ${id}`);
  return { row, preset };
}

function gpuPreset(id: ModelCompareFitGpuId) {
  const preset = GPU_PRESETS.find((gpu) => gpu.id === id);
  if (!preset) throw new Error(`${id} is missing a calculator preset`);
  return preset;
}

export function isModelCompareId(id: string): id is ModelCompareId {
  return (MODEL_COMPARE_IDS as readonly string[]).includes(id);
}

export function modelCompareIdFromInput(raw: string | null | undefined): ModelCompareId | null {
  if (!raw) return null;
  const key = raw.trim().toLowerCase();
  if (isModelCompareId(key)) return key;
  return SLUG_TO_ID[key] ?? null;
}

export function canonicalizeModelComparePair(
  a: ModelCompareId,
  b: ModelCompareId,
): [ModelCompareId, ModelCompareId] {
  const ia = MODEL_COMPARE_IDS.indexOf(a);
  const ib = MODEL_COMPARE_IDS.indexOf(b);
  if (ia < 0 || ib < 0) throw new Error(`unknown model compare id ${a} / ${b}`);
  return ia <= ib ? [a, b] : [b, a];
}

export function modelComparePairSlug(a: ModelCompareId, b: ModelCompareId): string {
  const [left, right] = canonicalizeModelComparePair(a, b);
  return `${MODEL_COMPARE_SLUG[left]}-vs-${MODEL_COMPARE_SLUG[right]}`;
}

export function modelComparePairPath(a: ModelCompareId, b: ModelCompareId): string {
  return `${MODEL_COMPARE_HUB}/${modelComparePairSlug(a, b)}`;
}

export function parseModelCompareSlug(slug: string): [ModelCompareId, ModelCompareId] | null {
  const parts = slug.split('-vs-');
  if (parts.length !== 2) return null;
  const a = modelCompareIdFromInput(parts[0]);
  const b = modelCompareIdFromInput(parts[1]);
  if (!a || !b || a === b) return null;
  return [a, b];
}

export function isModelComparePairPath(path: string): boolean {
  if (!path.startsWith(`${MODEL_COMPARE_HUB}/`)) return false;
  return parseModelCompareSlug(path.slice(`${MODEL_COMPARE_HUB}/`.length)) !== null;
}

export function isFeaturedModelComparePair(a: ModelCompareId, b: ModelCompareId): boolean {
  return MODEL_COMPARE_FEATURED_PAIRS.some(
    ([left, right]) => (left === a && right === b) || (left === b && right === a),
  );
}

export function modelCompareRedirects(): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < MODEL_COMPARE_IDS.length; i += 1) {
    for (let j = i + 1; j < MODEL_COMPARE_IDS.length; j += 1) {
      const left = MODEL_COMPARE_IDS[i]!;
      const right = MODEL_COMPARE_IDS[j]!;
      const canonical = modelComparePairPath(left, right);
      const reverse = `${MODEL_COMPARE_HUB}/${MODEL_COMPARE_SLUG[right]}-vs-${MODEL_COMPARE_SLUG[left]}`;
      out[reverse] = canonical;
    }
  }
  return out;
}

export function modelCompareCalcInput(
  modelId: ModelCompareId,
  gpuId: ModelCompareFitGpuId,
  quant: QuantId,
  context: number,
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
    gpuCount: 1 as const,
    split: false,
    fileWeightGiB: null,
  };
}

function kindLabel(kind: 'estimate' | 'q3-estimate'): string {
  return kind === 'q3-estimate' ? 'Q3 estimate' : 'Estimate';
}

function paramsLine(total: number | null | undefined, active: number | null | undefined): string {
  if (total == null) return 'see official card';
  if (active != null && active !== total) return `${total}B total / ${active}B active`;
  return `${total}B`;
}

function fileRow(id: ModelCompareId, spec: QuantSpec): ModelCompareFile {
  const { preset } = identity(id);
  const listed = preset.publisherFiles[spec.id];
  const weights = compute(modelCompareCalcInput(id, 'r9700', spec.id, MODEL_COMPARE_CONTEXTS[0]));
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

function launchesFor(id: ModelCompareId): ModelCompareLaunch[] {
  const house = HOUSE_LAUNCH[id];
  if (house?.length) return house;
  const file = CITED_Q4_FILE[id];
  const { preset } = identity(id);
  if (!file) return [];
  const quant = shopperQuantLabel(id);
  return [
    {
      href: '/backends/llamacpp',
      label: `${MODEL_COMPARE_SHORT[id]} llama.cpp ${quant}`,
      backend: 'llama.cpp',
      command: [
        '# Shape only — not a measured local desktop recipe.',
        './build-vk/bin/llama-server \\',
        `  -m ~/models/${file} \\`,
        '  -ngl 99 \\',
        `  -c ${preset.defaultCtx} \\`,
        '  --cache-type-k f16 \\',
        '  --cache-type-v f16 \\',
        '  --host 127.0.0.1 --port 8080',
      ].join('\n'),
    },
  ];
}

function stackLabFor(left: ModelCompareId, right: ModelCompareId): StackLabOpenInput[] {
  const ids = [left, right];
  const out: StackLabOpenInput[] = [HOUSE_STACK_LAB.doctor];
  if (ids.includes('qwen36')) {
    out.push(HOUSE_STACK_LAB.daily, HOUSE_STACK_LAB.reliable);
  }
  if (ids.includes('flash')) {
    out.push(HOUSE_STACK_LAB.flash, HOUSE_STACK_LAB.fastAgent);
  }
  return out;
}

function sideOffload(id: ModelCompareId): boolean {
  const quant = shopperQuant(id);
  return MODEL_COMPARE_FIT_GPUS.some((gpuId) =>
    MODEL_COMPARE_CONTEXTS.some((context) => {
      const result = compute(modelCompareCalcInput(id, gpuId, quant, context));
      return result.verdict !== 'fits';
    }),
  );
}

export function modelCompareSide(id: ModelCompareId): ModelCompareSide {
  const { row, preset } = identity(id);
  const native = NATIVE_CONTEXT[id];
  const ramInput = modelCompareCalcInput(id, 'r9700', shopperQuant(id), MODEL_COMPARE_RAM_CONTEXT);
  const ramNeed = systemRamNeed(ramInput);
  const total = preset.totalParamsB;
  const active = preset.activeParamsB;
  return {
    id,
    slug: MODEL_COMPARE_SLUG[id],
    path: `/models/${id}`,
    name: row.name,
    shortName: MODEL_COMPARE_SHORT[id],
    role: row.role,
    official: row.official,
    hf: OFFICIAL_HF[id],
    ggufName: row.gguf,
    ggufHref: OFFICIAL_GGUF[id],
    paramsLine: paramsLine(total, active),
    totalParams: total != null ? `${total}B total` : 'see official card',
    activeParams: active != null ? `${active}B active` : 'see official card',
    contextLabel: native.label,
    contextTokens: native.tokens,
    contextCite: `Official card context claim: ${native.label}.`,
    archNote: preset.archNote,
    files: quantLadder(id).map((spec) => fileRow(id, spec)),
    launches: launchesFor(id),
    house: id === 'qwen36' || id === 'flash',
    measured: id === 'qwen36',
    calculatorHref: `/calculator?${inputToQuery(ramInput)}`,
    ramNeed,
    ramQuant: shopperQuantLabel(id),
    offload: sideOffload(id),
  };
}

function r9700MeasuredDecode(
  modelId: ModelCompareId,
  gpuId: ModelCompareFitGpuId,
  spec: QuantSpec,
  context: number,
  cards: RunCard[],
): { decode: string; kind: ModelCompareFitKind; runIds: string[]; note: string } {
  if (spec.kind === 'q3-estimate') {
    return {
      decode: 'not measured',
      kind: 'q3-estimate',
      runIds: [],
      note: `${spec.label} is a labeled estimate — not a local desktop run.`,
    };
  }
  if (modelId !== 'qwen36' || gpuId !== 'r9700') {
    return {
      decode: 'not measured',
      kind: 'estimate',
      runIds: [],
      note: 'No official local desktop cell for this model × card. Empty stays not measured.',
    };
  }
  const row = oneVsTwoRows(cards).find((item) => item.quant === spec.label && item.context === context);
  const decode = row?.one.decode ?? 'not measured';
  if (!row || decode === 'not measured') {
    return {
      decode: 'not measured',
      kind: 'estimate',
      runIds: [],
      note: 'No official local desktop cell for this quant × context. Empty stays not measured.',
    };
  }
  return {
    decode,
    kind: 'measured',
    runIds: row.one.runIds,
    note: 'Official local desktop llama.cpp Vulkan card on one R9700.',
  };
}

function fitCell(
  modelId: ModelCompareId,
  gpuId: ModelCompareFitGpuId,
  spec: QuantSpec,
  context: number,
  cards: RunCard[],
): ModelCompareFitCell {
  const result = compute(modelCompareCalcInput(modelId, gpuId, spec.id, context));
  const measured = r9700MeasuredDecode(modelId, gpuId, spec, context, cards);
  return {
    context,
    contextLabel: formatCtx(context),
    totalGb: `${formatGiB(result.totalGiB)} GB`,
    verdict: result.verdict,
    verdictLabel: result.verdictLabel,
    speed: measured.decode,
    speedKind: measured.kind,
    runIds: measured.runIds,
    note: measured.note,
  };
}

function gpuBlocks(left: ModelCompareId, right: ModelCompareId, cards: RunCard[]): ModelCompareGpuBlock[] {
  const leftLadder = quantLadder(left);
  const rightLadder = quantLadder(right);
  return MODEL_COMPARE_FIT_GPUS.map((gpuId) => {
    const gpu = gpuPreset(gpuId);
    return {
      gpuId,
      gpuName: FIT_GPU_SHORT[gpuId],
      gpuHref: FIT_GPU_PATH[gpuId],
      vramLabel: `${gpu.vramGb} GB`,
      rows: leftLadder.map((leftSpec, index) => {
        const rightSpec = rightLadder[index]!;
        const leftWeights = compute(modelCompareCalcInput(left, gpuId, leftSpec.id, MODEL_COMPARE_CONTEXTS[0]));
        const rightWeights = compute(modelCompareCalcInput(right, gpuId, rightSpec.id, MODEL_COMPARE_CONTEXTS[0]));
        const q3 = leftSpec.kind === 'q3-estimate' || rightSpec.kind === 'q3-estimate';
        return {
          step: leftSpec.step,
          leftQuant: leftSpec.label,
          rightQuant: rightSpec.label,
          leftQuantId: leftSpec.id,
          rightQuantId: rightSpec.id,
          kind: q3 ? 'q3-estimate' : 'estimate',
          kindLabel: kindLabel(q3 ? 'q3-estimate' : 'estimate'),
          leftWeightsGb: `${formatGiB(leftWeights.weightsGiB)} GB`,
          rightWeightsGb: `${formatGiB(rightWeights.weightsGiB)} GB`,
          leftWeightsNote: leftWeights.weightsNote,
          rightWeightsNote: rightWeights.weightsNote,
          left: MODEL_COMPARE_CONTEXTS.map((context) => fitCell(left, gpuId, leftSpec, context, cards)),
          right: MODEL_COMPARE_CONTEXTS.map((context) => fitCell(right, gpuId, rightSpec, context, cards)),
        };
      }),
    };
  });
}

function q4Fits(id: ModelCompareId, gpuId: ModelCompareFitGpuId, context: number): boolean {
  const spec = quantLadder(id).find((row) => row.step === 'Q4');
  if (!spec) return false;
  return compute(modelCompareCalcInput(id, gpuId, spec.id, context)).verdict === 'fits';
}

function pairLead(left: ModelCompareSide, right: ModelCompareSide): string {
  const sizeBit = `${left.shortName} is ${left.paramsLine}, ${left.contextLabel} on the official card. ${right.shortName} is ${right.paramsLine}, ${right.contextLabel}.`;
  const quantBit =
    `Q6 / Q5 / Q4 file sizes come from the listed GGUFs on each /models page, or a calculator estimate when a listing is missing. ${left.files.find((file) => file.step === 'Q3')?.quant} and ${right.files.find((file) => file.step === 'Q3')?.quant} are labeled estimates.`;
  const leftFit = q4Fits(left.id, 'r9700', 4096);
  const rightFit = q4Fits(right.id, 'r9700', 4096);
  const fitBit =
    leftFit && rightFit
      ? `Shopper Q4 files fit one R9700 at 4K on the calculator for both sides.`
      : leftFit && !rightFit
        ? `Shopper Q4 fits ${left.shortName} on one R9700 at 4K and spills on ${right.shortName}.`
        : !leftFit && rightFit
          ? `Shopper Q4 fits ${right.shortName} on one R9700 at 4K and spills on ${left.shortName}.`
          : `Shopper Q4 does not sit in one R9700 VRAM on either side — expect RAM offload.`;
  const measuredBit = left.measured
    ? `${left.shortName} has measured llama.cpp cells on the local desktop. ${right.shortName} speed stays not measured.`
    : right.measured
      ? `${right.shortName} has measured llama.cpp cells on the local desktop. ${left.shortName} speed stays not measured.`
      : `Neither model was measured on the local desktop. Fit numbers are calculator estimates.`;
  return `${sizeBit} ${quantBit} ${fitBit} ${measuredBit} llama.cpp first.`;
}

function pairDescription(left: ModelCompareSide, right: ModelCompareSide): string {
  return `${left.shortName} vs ${right.shortName} on Radeon — sizes, cited context, Q6/Q5/Q4 fit estimates, labeled Q3. No invented prices.`;
}

function useCases(left: ModelCompareSide, right: ModelCompareSide): ModelCompareUseCase[] {
  const leftQ4 = q4Fits(left.id, 'r9700', 4096);
  const rightQ4 = q4Fits(right.id, 'r9700', 4096);
  const leftQ432 = q4Fits(left.id, 'r9700', 32768);
  const rightQ432 = q4Fits(right.id, 'r9700', 32768);
  const measured = left.measured ? left : right.measured ? right : null;
  const other = measured?.id === left.id ? right : left;

  const chat =
    leftQ4 && rightQ4
      ? `Both models hold a shopper Q4 file on one R9700 at 4K on the calculator. ${measured ? `${measured.shortName} is the measured local desktop side — read those cards, do not copy a decode figure onto ${other.shortName}.` : 'Neither side has a local desktop decode cell. Pick on size, active params, and VRAM headroom, not a speed we invent.'}`
      : leftQ4 !== rightQ4
        ? `${leftQ4 ? left.shortName : right.shortName} holds shopper Q4 on one R9700 at 4K. ${leftQ4 ? right.shortName : left.shortName} needs RAM offload or its listed Q3 file — that Q3 is a labeled estimate.`
        : `Neither model holds shopper Q4 in one R9700 VRAM on the calculator. Chat still works with RAM offload — read ${RAM_MIN_LABEL} and ${RAM_FULL_LABEL} below — or a listed Q3 estimate.`;

  const coding =
    measured && measured.id === 'qwen36'
      ? `Coding agents want the file in VRAM and a stable llama.cpp server. The house daily-driver recipe is measured on the R9700 for ${measured.shortName}. ${other.shortName} is ${other.paramsLine} — size Q4 on the calculator before you assume that recipe applies. We do not invent an agent decode figure for ${other.shortName}.`
      : leftQ4 || rightQ4
        ? `Keep llama.cpp first. The side that holds Q4 in VRAM (${leftQ4 ? left.shortName : ''}${leftQ4 && rightQ4 ? ' and ' : ''}${rightQ4 ? right.shortName : ''}) is the less painful coding-agent host. House Flash / agent pins stay R9700 / local desktop — they do not transfer. No invented agent speed.`
        : `Both sides offload shopper Q4 on one R9700. A coding agent will share that RAM spill. ${RAM_MIN_LABEL} and ${RAM_FULL_LABEL} are the shopper lines. We do not invent a tokens-per-tool figure.`;

  const longCtx = `Cited context is ${left.contextLabel} vs ${right.contextLabel}. KV grows with context. Q4 at 32K ${leftQ432 ? `fits ${left.shortName}` : `spills on ${left.shortName}`} and ${rightQ432 ? `fits ${right.shortName}` : `spills on ${right.shortName}`} on one R9700. Read /long-context for measured R9700 35B 128K–262K cards. We do not invent a 128K decode figure here.`;

  const size = `${left.shortName} files: ${left.files.map((file) => `${file.quant} ${file.sizeGb}`).join(', ')}. ${right.shortName} files: ${right.files.map((file) => `${file.quant} ${file.sizeGb}`).join(', ')}. Q3 rows are labeled estimates. Fit on the four existing GPU sheets below. Empty speed cells stay not measured.`;

  return [
    { id: 'chat', title: 'Chat', body: chat },
    { id: 'coding', title: 'Coding agents', body: coding },
    { id: 'long-context', title: 'Long context', body: longCtx },
    { id: 'size', title: 'Size and VRAM', body: size },
  ];
}

export function modelComparePairPage(
  a: ModelCompareId,
  b: ModelCompareId,
  cards: RunCard[] = [],
): ModelComparePairPage {
  if (a === b) throw new Error('cannot compare a model with itself');
  const [leftId, rightId] = canonicalizeModelComparePair(a, b);
  const left = modelCompareSide(leftId);
  const right = modelCompareSide(rightId);
  const slug = modelComparePairSlug(leftId, rightId);
  const q3Left = left.files.find((file) => file.step === 'Q3')!;
  const q3Right = right.files.find((file) => file.step === 'Q3')!;
  return {
    slug,
    path: `${MODEL_COMPARE_HUB}/${slug}`,
    left,
    right,
    title: `${left.shortName} vs ${right.shortName}`,
    heading: `${left.shortName} vs ${right.shortName} for Radeon`,
    description: pairDescription(left, right),
    lead: pairLead(left, right),
    engine: MODEL_COMPARE_ENGINE,
    q3Left: q3Left.quant,
    q3Right: q3Right.quant,
    q3CiteLeft: q3Left.cite,
    q3CiteRight: q3Right.cite,
    gpuBlocks: gpuBlocks(leftId, rightId, cards),
    useCases: useCases(left, right),
    stackLab: stackLabFor(leftId, rightId),
    featured: isFeaturedModelComparePair(leftId, rightId),
  };
}

export function modelComparePairPages(cards: RunCard[] = []): ModelComparePairPage[] {
  const pages: ModelComparePairPage[] = [];
  for (let i = 0; i < MODEL_COMPARE_IDS.length; i += 1) {
    for (let j = i + 1; j < MODEL_COMPARE_IDS.length; j += 1) {
      pages.push(modelComparePairPage(MODEL_COMPARE_IDS[i]!, MODEL_COMPARE_IDS[j]!, cards));
    }
  }
  return pages;
}

export function modelCompareFeaturedPages(cards: RunCard[] = []): ModelComparePairPage[] {
  const seen = new Set<string>();
  const pages: ModelComparePairPage[] = [];
  for (const [a, b] of MODEL_COMPARE_FEATURED_PAIRS) {
    const page = modelComparePairPage(a, b, cards);
    if (seen.has(page.path)) continue;
    seen.add(page.path);
    pages.push(page);
  }
  return pages;
}

export function modelCompareLinksFor(id: ModelCompareId): ModelCompareLink[] {
  return MODEL_COMPARE_IDS.filter((other) => other !== id)
    .map((other) => ({
      href: modelComparePairPath(id, other),
      label: MODEL_COMPARE_SHORT[other],
      featured: isFeaturedModelComparePair(id, other),
    }))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.label.localeCompare(b.label));
}

export function modelCompareHubCards(): ModelCompareHubCard[] {
  return modelCompareFeaturedPages().map((page) => ({
    href: page.path,
    title: page.title,
    kicker: `${page.left.paramsLine} vs ${page.right.paramsLine}`,
    body: page.lead,
  }));
}

export function parseModelComparePicker(search: string): {
  a: ModelCompareId | null;
  b: ModelCompareId | null;
  href: string | null;
} {
  const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const a = modelCompareIdFromInput(q.get('a'));
  const b = modelCompareIdFromInput(q.get('b'));
  if (!a || !b || a === b) return { a, b, href: null };
  return { a, b, href: modelComparePairPath(a, b) };
}

export function modelCompareSeoRows(): Array<{ path: string; title: string; description: string; published: string }> {
  const hub = {
    path: MODEL_COMPARE_HUB,
    title: 'Compare models',
    description:
      'Pick two cited AMDai model pages. Compare sizes, cited context, Q6/Q5/Q4 fit, and a labeled Q3 estimate. No invented prices.',
    published: MODEL_COMPARE_PUBLISHED,
  };
  return [
    hub,
    ...modelComparePairPages().map((page) => ({
      path: page.path,
      title: page.title,
      description: page.description,
      published: MODEL_COMPARE_PUBLISHED,
    })),
  ];
}

export function modelCompareBlob(page: ModelComparePairPage): string {
  return [
    page.title,
    page.heading,
    page.description,
    page.lead,
    page.q3Left,
    page.q3Right,
    page.q3CiteLeft,
    page.q3CiteRight,
    page.left.archNote,
    page.right.archNote,
    page.left.contextCite,
    page.right.contextCite,
    page.left.files.map((file) => `${file.quant} ${file.sizeGb} ${file.cite}`).join('\n'),
    page.right.files.map((file) => `${file.quant} ${file.sizeGb} ${file.cite}`).join('\n'),
    page.useCases.map((row) => `${row.title} ${row.body}`).join('\n'),
    page.gpuBlocks
      .flatMap((block) => block.rows.map((row) => `${row.leftQuant} ${row.rightQuant} ${row.kindLabel} ${row.leftWeightsNote} ${row.rightWeightsNote}`))
      .join('\n'),
    page.left.launches.map((row) => `${row.label} ${row.backend} ${row.command ?? ''}`).join('\n'),
    page.right.launches.map((row) => `${row.label} ${row.backend} ${row.command ?? ''}`).join('\n'),
    RAM_MIN_LABEL,
    RAM_FULL_LABEL,
  ].join('\n');
}

export const MODEL_COMPARE_HUB_LEAD =
  `Pick two models that already have cited AMDai /models pages — Qwen3.6-35B, Qwen 3.8 Flash, gpt-oss 20B, Gemma 3 27B, Llama 3.3 70B, GLM 5.3 Flash, Qwen3.6 27B, and Qwen3.8 27B. Each pair page uses official-card sizes and context claims, calculator fit on the existing R9700 / RX 7900 XTX / RX 7900 XT / RX 7800 XT sheets at Q6 / Q5 / Q4 plus a labeled Q3 estimate, and llama.cpp-first commands already on those model pages. Measured decode appears only from existing local desktop run cards. We do not invent a price or a benchmark. ${RAM_MIN_LABEL} and ${RAM_FULL_LABEL} print wherever a file spills to system RAM.`;

export function modelCompareHrefs(page: ModelComparePairPage): string[] {
  return [
    page.path,
    MODEL_COMPARE_HUB,
    '/compare',
    page.left.path,
    page.right.path,
    page.left.calculatorHref.split('?')[0] ?? '/calculator',
    '/gpus/r9700',
    '/gpus/rx-7900-xtx',
    '/gpus/rx-7900-xt',
    '/gpus/rx-7800-xt',
    '/compare/gpus',
    '/benchmarks',
    '/stack-lab',
    '/backends/llamacpp',
    '/calculator',
    '/faq',
    '/methodology',
    '/long-context',
  ];
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');
const PRICE = /\$\d|\bMSRP\b|\bUSD\b/i;

export function assertModelCompareValid(cards: RunCard[] = []): string[] {
  const errors: string[] = [];
  const expected = (MODEL_COMPARE_IDS.length * (MODEL_COMPARE_IDS.length - 1)) / 2;
  const pages = modelComparePairPages(cards);
  if (pages.length !== expected) errors.push(`expected ${expected} pair pages; got ${pages.length}`);

  const ids = [...MODEL_COMPARE_IDS];
  if (ids.join(',') !== 'qwen36,flash,gpt-oss-20b,gemma3-27b,llama33-70b,glm-53-flash,qwen36-27b,qwen38-27b') {
    errors.push(`catalog drifted: ${ids.join(', ')}`);
  }

  const pageIds = new Set(MODEL_PAGES.map((model) => model.id));
  const presetIds = new Set(MODEL_PRESETS.map((model) => model.id));
  for (const id of MODEL_COMPARE_IDS) {
    if (!pageIds.has(id)) errors.push(`${id} missing MODEL_PAGES row`);
    if (!presetIds.has(id)) errors.push(`${id} missing calculator preset`);
  }

  const seen = new Set<string>();
  for (const page of pages) {
    if (seen.has(page.path)) errors.push(`duplicate ${page.path}`);
    seen.add(page.path);
    if (!page.path.startsWith(`${MODEL_COMPARE_HUB}/`)) errors.push(`${page.path} not under ${MODEL_COMPARE_HUB}`);
    if (page.left.id === page.right.id) errors.push(`${page.path} compared a model to itself`);
    if (MODEL_COMPARE_IDS.indexOf(page.left.id) >= MODEL_COMPARE_IDS.indexOf(page.right.id)) {
      errors.push(`${page.path} is not catalog-canonical`);
    }

    if (page.gpuBlocks.length !== MODEL_COMPARE_FIT_GPUS.length) {
      errors.push(`${page.path} missing GPU fit blocks`);
    }
    for (const block of page.gpuBlocks) {
      const steps = block.rows.map((row) => row.step);
      if (!steps.includes('Q6')) errors.push(`${page.path} ${block.gpuId} missing Q6`);
      if (!steps.includes('Q5')) errors.push(`${page.path} ${block.gpuId} missing Q5`);
      if (!steps.includes('Q4')) errors.push(`${page.path} ${block.gpuId} missing Q4`);
      if (!steps.includes('Q3')) errors.push(`${page.path} ${block.gpuId} missing Q3`);
      for (const row of block.rows) {
        if (row.step === 'Q3') {
          if (row.kind !== 'q3-estimate') errors.push(`${page.path} Q3 row unlabeled`);
          if (!/estimate/i.test(row.kindLabel)) errors.push(`${page.path} Q3 kind unlabeled`);
        }
        for (const cell of [...row.left, ...row.right]) {
          if (!cell.totalGb.endsWith(' GB')) errors.push(`${page.path} ${row.step} missing GB label`);
          if (row.kind === 'q3-estimate' && !/estimate/i.test(cell.note)) {
            errors.push(`${page.path} Q3 cell unlabeled`);
          }
        }
        const leftMeasuredOk = page.left.id === 'qwen36' && block.gpuId === 'r9700' && row.step !== 'Q3';
        const rightMeasuredOk = page.right.id === 'qwen36' && block.gpuId === 'r9700' && row.step !== 'Q3';
        for (const cell of row.left) {
          if (!leftMeasuredOk && cell.speed !== 'not measured') {
            errors.push(`${page.path} invented ${page.left.shortName} tok/s on ${block.gpuId}`);
          }
          if (!leftMeasuredOk && cell.speedKind === 'measured') {
            errors.push(`${page.path} measured badge on a non-card side`);
          }
          if (row.step === 'Q3' && cell.speed !== 'not measured') {
            errors.push(`${page.path} invented Q3 tok/s`);
          }
        }
        for (const cell of row.right) {
          if (!rightMeasuredOk && cell.speed !== 'not measured') {
            errors.push(`${page.path} invented ${page.right.shortName} tok/s on ${block.gpuId}`);
          }
          if (!rightMeasuredOk && cell.speedKind === 'measured') {
            errors.push(`${page.path} measured badge on the right`);
          }
        }
      }
    }

    for (const side of [page.left, page.right]) {
      if (side.files.length !== 4) errors.push(`${page.path} ${side.id} missing quant files`);
      if (!(DIMM_KIT_GB as readonly number[]).includes(side.ramNeed.atSelected.kitGb)) {
        errors.push(`${page.path} ${side.id} min kit ${side.ramNeed.atSelected.kitGb} is not a real DIMM size`);
      }
      if (!(DIMM_KIT_GB as readonly number[]).includes(side.ramNeed.atFullContext.kitGb)) {
        errors.push(`${page.path} ${side.id} full kit ${side.ramNeed.atFullContext.kitGb} is not a real DIMM size`);
      }
      if (!side.launches.some((row) => /llama\.cpp/i.test(row.backend) || /llama\.cpp/i.test(row.label))) {
        errors.push(`${page.path} ${side.id} missing llama.cpp launch`);
      }
    }

    const houseProfiles = page.stackLab.filter(
      (row) => row.screen === 'profile' || (row.screen === 'recipes' && row.id),
    );
    const houseOk = page.left.house || page.right.house;
    if (!page.stackLab.some((row) => row.screen === 'doctor')) {
      errors.push(`${page.path} missing Stack Lab doctor`);
    }
    if (!houseOk && houseProfiles.length) {
      errors.push(`${page.path} house Stack Lab profile does not apply`);
    }

    const blob = modelCompareBlob(page);
    if (!blob.includes(RAM_MIN_LABEL)) errors.push(`${page.path} missing ${RAM_MIN_LABEL}`);
    if (!blob.includes(RAM_FULL_LABEL)) errors.push(`${page.path} missing ${RAM_FULL_LABEL}`);
    if (!/estimate/i.test(blob)) errors.push(`${page.path} missing estimate label`);
    if (!/llama\.cpp/i.test(blob)) errors.push(`${page.path} missing llama.cpp`);
    if (BANNED.test(blob)) errors.push(`${page.path} banned model`);
    if (Q1Q2.test(blob)) errors.push(`${page.path} lists Q1/Q2`);
    if (Q4_FLOOR.test(blob)) errors.push(`${page.path} Q4-floor phrase`);
    if (PRICE.test(blob)) errors.push(`${page.path} invented price`);
    if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push(`${page.path} leftover copy`);
    if (page.description.length < 70 || page.description.length > 160) {
      errors.push(`${page.path} description length ${page.description.length}`);
    }
  }

  const featured = modelCompareFeaturedPages();
  if (featured.length !== MODEL_COMPARE_FEATURED_PAIRS.length) {
    errors.push(`featured count ${featured.length} != ${MODEL_COMPARE_FEATURED_PAIRS.length}`);
  }
  for (const href of [
    '/compare/models/qwen36-vs-glm-53-flash',
    '/compare/models/qwen36-vs-flash',
    '/compare/models/qwen36-vs-gemma3-27b',
    '/compare/models/qwen36-vs-llama33-70b',
    '/compare/models/gpt-oss-20b-vs-gemma3-27b',
    '/compare/models/qwen36-27b-vs-qwen38-27b',
  ]) {
    if (!pages.some((page) => page.path === href)) errors.push(`missing featured canonical ${href}`);
  }

  const redirects = modelCompareRedirects();
  if (redirects['/compare/models/glm-53-flash-vs-qwen36'] !== '/compare/models/qwen36-vs-glm-53-flash') {
    errors.push('GLM vs 35B reverse redirect drifted');
  }
  if (redirects['/compare/models/flash-vs-qwen36'] !== '/compare/models/qwen36-vs-flash') {
    errors.push('Flash vs 35B reverse redirect drifted');
  }
  if (Object.keys(redirects).length !== expected) errors.push('redirect count drifted');

  const hub = MODEL_COMPARE_HUB_LEAD;
  if (!hub.includes(RAM_MIN_LABEL) || !hub.includes(RAM_FULL_LABEL)) errors.push('hub missing RAM labels');
  if (BANNED.test(hub) || PRICE.test(hub) || Q1Q2.test(hub)) errors.push('hub copy breaks house rules');
  if (!MODEL_COMPARE_HUB_LEAD.includes('llama.cpp')) errors.push('hub must say llama.cpp');

  const seo = modelCompareSeoRows();
  if (seo.length !== expected + 1) errors.push(`SEO rows ${seo.length} != ${expected + 1}`);
  for (const row of seo) {
    if (row.description.length < 70 || row.description.length > 160) {
      errors.push(`${row.path} SEO description length ${row.description.length}`);
    }
  }

  return [...new Set(errors)];
}

export { RAM_FULL_LABEL, RAM_MIN_LABEL };
