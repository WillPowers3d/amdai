/**
 * /qwen — one row per current Qwen 3.6 / 3.8 model × quant.
 * Measured tok/s only from verified amdai-bench/run@1 cards.
 * VRAM, fit, and offload reuse the calculator engine and are labeled estimate
 * unless a run card already recorded peak VRAM.
 */

import {
  DEFAULT_INPUT,
  DIMM_KIT_GB,
  applyModelPreset,
  compute,
  decimalGbToGiB,
  formatGiB,
  formulaWeightsGiB,
  modelById,
  quantById,
  queryToInput,
  type BackendId,
  type CalcInput,
  type ModelId,
  type QuantId,
  type Verdict,
} from './calculator';
import {
  contextLabel,
  isSupersededQ6k4k,
  matchRuns,
  runPath,
  verifiedMeasured,
  type RunCard,
} from './run-card';
import { officialLinks } from './site';

export const QWEN_COMPARE_NATIVE_CTX = 262144;
export const QWEN_COMPARE_CTX_32K = 32768;
export const QWEN_COMPARE_CTX_128K = 131072;
export const QWEN_MY_RIG_STORAGE_KEY = 'amdai-my-rig';
export const QWEN_COMPARE_BANNED = /Qwen2\.5|Qwen3-8B/i;

export const CODER390_HF =
  'https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-GGUF-NInfer';
export const CODER390_HF_GGUF = `${CODER390_HF}/tree/main/GGUF`;

/** Cited from the nerkyor GGUF folder listing (Hugging Face “Safe” sizes). No Q5 on the original. */
export const CODER390_FILES = [
  {
    quant: 'Q3 LynnStyle',
    quantId: 'q3_k_m' as const,
    decimalGb: 17.3,
    file: 'GGUF/Qwen3.8-27B-Coder390-EfficientThink-Q3LynnStyle-MTP.gguf',
    mtpNote: 'Built-in Q4 MTP head is in the filename. MTP is not a house recommendation.',
  },
  {
    quant: 'Q4 LynnStyle',
    quantId: 'q4_k_m' as const,
    decimalGb: 19.6,
    file: 'GGUF/Qwen3.8-27B-Coder390-EfficientThink-Q4LynnStyle-MTP.gguf',
    mtpNote: 'Built-in Q4 MTP head is in the filename. MTP is not a house recommendation.',
  },
  {
    quant: 'Q6_K-MTP',
    quantId: 'q6_k' as const,
    decimalGb: 23.2,
    file: 'GGUF/Qwen3.8-27B-Coder390-EfficientThink-Q6_K-MTP.gguf',
    mtpNote: 'Cited file size includes a built-in MTP head. MTP is not a house recommendation; Q2 MTP drafts stay off.',
  },
  {
    quant: 'Q8_0-MTP',
    quantId: 'q8_0' as const,
    decimalGb: 29.1,
    file: 'GGUF/Qwen3.8-27B-Coder390-EfficientThink-Q8_0-MTP.gguf',
    mtpNote: 'Cited file size includes a built-in MTP head. MTP is not a house recommendation; Q2 MTP drafts stay off.',
  },
] as const;

export const CODER390_CITED_REQUIRED = [
  { quant: 'Q4 LynnStyle', decimalGb: 19.6 },
  { quant: 'Q6_K-MTP', decimalGb: 23.2 },
  { quant: 'Q8_0-MTP', decimalGb: 29.1 },
] as const;

export type QwenFamily = '3.6' | '3.8';
export type QwenKind = 'dense' | 'MoE';
export type QwenEdition = 'original' | 'abliterated';
export type SizeSource = 'publisher' | 'cited' | 'formula';
export type QwenBackendId = Extract<BackendId, 'llamacpp' | 'strata' | 'vllm'>;
export type QwenGpuCount = 1 | 2;

export type QwenSpec = {
  id: string;
  family: QwenFamily;
  modelKey: string;
  model: string;
  short: string;
  calcModelId: ModelId;
  kind: QwenKind;
  totalParamsB: number;
  activeParamsB: number;
  nativeContext: number;
  quant: string;
  quantId: QuantId;
  runQuant: string;
  edition: QwenEdition;
  hfUrl: string;
  ggufUrl: string;
  citedDecimalGb: number | null;
  sizeCite: string;
  skipPublisher: boolean;
  note: string;
};

export type MeasuredCell = {
  value: number | null;
  context: number | null;
  runId: string | null;
  text: string;
};

export type EstimateCell = {
  gib: number;
  text: string;
  label: 'estimate' | 'measured';
  cite: string;
};

export type FitCell = {
  verdict: Verdict;
  text: string;
  overflowGiB: number;
  ramKitGb: number;
  totalGiB: number;
};

export type QwenCompareRow = {
  id: string;
  spec: QwenSpec;
  type: QwenKind;
  fileSizeGb: number | null;
  fileSizeText: string;
  sizeSource: SizeSource;
  vram32: EstimateCell;
  vram128: EstimateCell;
  vramFull: EstimateCell;
  fit1x: FitCell;
  fit2x: FitCell;
  offload1x: EstimateCell;
  decode: Record<QwenBackendId, MeasuredCell>;
  prefill: Record<QwenBackendId, MeasuredCell>;
  runIds: string[];
  runHref: string;
  fits: Record<QwenBackendId, Record<QwenGpuCount, FitCell>>;
};

export type QwenRigProfile = {
  gpuCount: QwenGpuCount;
  ramGb: number;
  backendId: QwenBackendId;
  vramGb: number;
  gpuId: 'r9700';
};

export type QwenCompareState = {
  gpuCount: QwenGpuCount | null;
  ramGb: number | null;
  backendId: QwenBackendId | null;
  fitsOnMyRig: boolean;
  family: QwenFamily | null;
  edition: QwenEdition | null;
  sort: string;
  dir: 'asc' | 'desc';
  cols: string[];
};

export const QWEN_RAM_KITS = [64, 128, 192, 256] as const;
export const QWEN_BACKENDS: { id: QwenBackendId; label: string }[] = [
  { id: 'llamacpp', label: 'llama.cpp' },
  { id: 'strata', label: 'Strata' },
  { id: 'vllm', label: 'vLLM' },
];

export const DEFAULT_QWEN_RIG: QwenRigProfile = {
  gpuCount: 1,
  ramGb: 256,
  backendId: 'llamacpp',
  vramGb: 32,
  gpuId: 'r9700',
};

export const DEFAULT_QWEN_COLS = [
  'family',
  'model',
  'type',
  'total',
  'active',
  'ctx',
  'quant',
  'size',
  'vram32',
  'vram128',
  'vramFull',
  'fit1',
  'fit2',
  'offload',
  'decodeLlama',
  'decodeStrata',
  'decodeVllm',
  'edition',
  'hf',
  'runs',
] as const;

export const QWEN_ALL_COLS = [
  ...DEFAULT_QWEN_COLS,
  'prefillLlama',
  'prefillStrata',
  'prefillVllm',
] as const;

export type QwenColId = (typeof QWEN_ALL_COLS)[number];

export const QWEN_COL_LABEL: Record<QwenColId, string> = {
  family: 'Family',
  model: 'Model',
  type: 'Type',
  total: 'Total params',
  active: 'Active params',
  ctx: 'Native context',
  quant: 'Quant',
  size: 'File size',
  vram32: 'VRAM @ 32K',
  vram128: 'VRAM @ 128K',
  vramFull: 'VRAM @ full',
  fit1: 'Fits 1× R9700',
  fit2: 'Fits 2× R9700',
  offload: 'DDR5 offload',
  decodeLlama: 'Decode llama.cpp',
  decodeStrata: 'Decode Strata',
  decodeVllm: 'Decode vLLM',
  prefillLlama: 'Prefill llama.cpp',
  prefillStrata: 'Prefill Strata',
  prefillVllm: 'Prefill vLLM',
  edition: 'Original / abliterated',
  hf: 'Hugging Face',
  runs: 'Run cards',
};

const BACKEND_RUN_NAME: Record<QwenBackendId, string> = {
  llamacpp: 'llama.cpp',
  strata: 'Strata',
  vllm: 'vLLM',
};

function kindOf(total: number, active: number): QwenKind {
  return active + 1e-9 < total ? 'MoE' : 'dense';
}

function qwen36Specs(): QwenSpec[] {
  const preset = modelById('qwen36');
  const base = {
    family: '3.6' as const,
    modelKey: '35b-a3b',
    model: '35B-A3B',
    short: 'Qwen3.6-35B-A3B',
    calcModelId: 'qwen36' as const,
    kind: kindOf(preset.totalParamsB ?? 35, preset.activeParamsB ?? 3),
    totalParamsB: preset.totalParamsB ?? 35,
    activeParamsB: preset.activeParamsB ?? 3,
    nativeContext: QWEN_COMPARE_NATIVE_CTX,
    edition: 'original' as const,
    hfUrl: officialLinks.qwen36,
    ggufUrl: officialLinks.qwen36Gguf,
    note: 'House daily driver family. llama.cpp first.',
  };
  const rows: Array<Omit<QwenSpec, 'id'> & { slug: string }> = [
    {
      slug: 'udiq3s',
      quant: 'UD-IQ3_S',
      quantId: 'iq3',
      runQuant: 'UD-IQ3_S',
      citedDecimalGb: 13.7,
      sizeCite: 'Hugging Face listing for Qwen3.6-35B-A3B-UD-IQ3_S.gguf (13.7 GB)',
      skipPublisher: false,
    },
    {
      slug: 'udq3s',
      quant: 'UD-Q3_K_S',
      quantId: 'q3_k_s',
      runQuant: 'UD-Q3_K_S',
      citedDecimalGb: 15.4,
      sizeCite: 'Hugging Face listing for Qwen3.6-35B-A3B-UD-Q3_K_S.gguf (15.4 GB)',
      skipPublisher: false,
    },
    {
      slug: 'udq3m',
      quant: 'UD-Q3_K_M',
      quantId: 'q3_k_m',
      runQuant: 'UD-Q3_K_M',
      citedDecimalGb: 16.6,
      sizeCite: 'Hugging Face listing for Qwen3.6-35B-A3B-UD-Q3_K_M.gguf (16.6 GB)',
      skipPublisher: false,
    },
    {
      slug: 'udq3xl',
      quant: 'UD-Q3_K_XL',
      quantId: 'q3_k_xl',
      runQuant: 'UD-Q3_K_XL',
      citedDecimalGb: 16.8,
      sizeCite: 'Hugging Face listing for Qwen3.6-35B-A3B-UD-Q3_K_XL.gguf (16.8 GB)',
      skipPublisher: false,
    },
    {
      slug: 'q4km',
      quant: 'Q4_K_M',
      quantId: 'q4_k_m',
      runQuant: 'Q4_K_M',
      citedDecimalGb: null,
      sizeCite: 'Estimate: params × nominal Q4_K_M bpw. No publisher GB on this row.',
      skipPublisher: true,
    },
    {
      slug: 'q5km',
      quant: 'Q5_K_M',
      quantId: 'q5_k_m',
      runQuant: 'Q5_K_M',
      citedDecimalGb: null,
      sizeCite: 'Estimate: params × nominal Q5_K_M bpw. The 26.6 GB listing is UD-Q5_K_XL, not this file.',
      skipPublisher: true,
    },
    {
      slug: 'udq5xl',
      quant: 'UD-Q5_K_XL',
      quantId: 'q5_k_m',
      runQuant: 'UD-Q5_K_XL',
      citedDecimalGb: 26.6,
      sizeCite: 'Hugging Face listing for Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf (26.6 GB)',
      skipPublisher: false,
    },
    {
      slug: 'q6k',
      quant: 'Q6_K',
      quantId: 'q6_k',
      runQuant: 'Q6_K',
      citedDecimalGb: null,
      sizeCite: 'Estimate: params × nominal Q6_K bpw. No publisher GB on this row.',
      skipPublisher: true,
    },
    {
      slug: 'q80',
      quant: 'Q8_0',
      quantId: 'q8_0',
      runQuant: 'Q8_0',
      citedDecimalGb: null,
      sizeCite: 'Estimate: params × nominal Q8_0 bpw. No publisher GB on this row.',
      skipPublisher: true,
    },
  ];
  return rows.map((row) => ({
    id: `qwen36-35b-${row.slug}`,
    ...base,
    quant: row.quant,
    quantId: row.quantId,
    runQuant: row.runQuant,
    citedDecimalGb: row.citedDecimalGb,
    sizeCite: row.sizeCite,
    skipPublisher: row.skipPublisher,
  }));
}

function dense27bSpecs(opts: {
  family: QwenFamily;
  calcModelId: Extract<ModelId, 'qwen36-27b' | 'qwen38-27b'>;
  model: string;
  short: string;
  hfUrl: string;
  slug: string;
}): QwenSpec[] {
  const preset = modelById(opts.calcModelId);
  const base = {
    family: opts.family,
    modelKey: opts.slug,
    model: opts.model,
    short: opts.short,
    calcModelId: opts.calcModelId,
    kind: 'dense' as const,
    totalParamsB: preset.totalParamsB ?? 27.8,
    activeParamsB: preset.activeParamsB ?? 27.8,
    nativeContext: QWEN_COMPARE_NATIVE_CTX,
    edition: 'original' as const,
    hfUrl: opts.hfUrl,
    ggufUrl: opts.hfUrl,
    note: `${opts.short}. Official card lists 262K native. Default calculator context is 8K; this table uses native 262K for “full”.`,
  };
  const quants: Array<{ slug: string; quant: string; quantId: QuantId; runQuant: string }> = [
    { slug: 'q3s', quant: 'Q3_K_S', quantId: 'q3_k_s', runQuant: 'Q3_K_S' },
    { slug: 'q3m', quant: 'Q3_K_M', quantId: 'q3_k_m', runQuant: 'Q3_K_M' },
    { slug: 'q3xl', quant: 'UD-Q3_K_XL', quantId: 'q3_k_xl', runQuant: 'UD-Q3_K_XL' },
    { slug: 'q4km', quant: 'Q4_K_M', quantId: 'q4_k_m', runQuant: 'Q4_K_M' },
    { slug: 'q5km', quant: 'Q5_K_M', quantId: 'q5_k_m', runQuant: 'Q5_K_M' },
    { slug: 'q6k', quant: 'Q6_K', quantId: 'q6_k', runQuant: 'Q6_K' },
    { slug: 'q80', quant: 'Q8_0', quantId: 'q8_0', runQuant: 'Q8_0' },
  ];
  return quants.map((row) => ({
    id: `${opts.slug}-${row.slug}`,
    ...base,
    quant: row.quant,
    quantId: row.quantId,
    runQuant: row.runQuant,
    citedDecimalGb: null,
    sizeCite: `Estimate: ${base.totalParamsB}B × ${quantById(row.quantId).label} nominal bpw. No publisher GGUF GB on this official card.`,
    skipPublisher: true,
  }));
}

function flashSpecs(): QwenSpec[] {
  const preset = modelById('flash');
  const base = {
    family: '3.8' as const,
    modelKey: 'flash',
    model: 'Flash',
    short: 'Qwen 3.8 Flash',
    calcModelId: 'flash' as const,
    kind: kindOf(preset.totalParamsB ?? 125, preset.activeParamsB ?? 6),
    totalParamsB: preset.totalParamsB ?? 125,
    activeParamsB: preset.activeParamsB ?? 6,
    nativeContext: QWEN_COMPARE_NATIVE_CTX,
    edition: 'original' as const,
    hfUrl: officialLinks.qwenFlash,
    ggufUrl: officialLinks.qwenFlashGguf,
    note: 'House fast-agent family. Strata first on local-desktop. File sizes are Unsloth folder listings.',
  };
  const rows: Array<Omit<QwenSpec, 'id'> & { slug: string }> = [
    {
      slug: 'udiq3',
      quant: 'UD-IQ3_XXS',
      quantId: 'iq3',
      runQuant: 'UD-IQ3_XXS',
      citedDecimalGb: 81.96,
      sizeCite: 'Hugging Face LFS sizes for UD-IQ3_XXS (81.96 GB across 3 shards). Estimate / community — not measured on local-desktop',
      skipPublisher: false,
    },
    {
      slug: 'udq3xl',
      quant: 'UD-Q3_K_XL',
      quantId: 'q3_k_xl',
      runQuant: 'UD-Q3_K_XL',
      citedDecimalGb: 90,
      sizeCite: 'Hugging Face folder listing for UD-Q3_K_XL (~90 GB across 3 shards; LFS sizes sum 89.99 GB)',
      skipPublisher: false,
    },
    {
      slug: 'udq4xl',
      quant: 'UD-Q4_K_XL',
      quantId: 'q4_k_m',
      runQuant: 'UD-Q4_K_XL',
      citedDecimalGb: 111,
      sizeCite: 'Hugging Face folder listing for UD-Q4_K_XL (~111 GB across 4 shards)',
      skipPublisher: false,
    },
    {
      slug: 'udq5xl',
      quant: 'UD-Q5_K_XL',
      quantId: 'q5_k_m',
      runQuant: 'UD-Q5_K_XL',
      citedDecimalGb: 158.3,
      sizeCite: 'Unsloth docs listing for UD-Q5_K_XL (158.3 GB)',
      skipPublisher: false,
    },
    {
      slug: 'udq6xl',
      quant: 'UD-Q6_K_XL',
      quantId: 'q6_k',
      runQuant: 'UD-Q6_K_XL',
      citedDecimalGb: 169,
      sizeCite: 'Hugging Face folder listing for UD-Q6_K_XL (~169 GB across 6 shards)',
      skipPublisher: false,
    },
  ];
  return rows.map((row) => ({
    id: `qwen38-flash-${row.slug}`,
    ...base,
    quant: row.quant,
    quantId: row.quantId,
    runQuant: row.runQuant,
    citedDecimalGb: row.citedDecimalGb,
    sizeCite: row.sizeCite,
    skipPublisher: row.skipPublisher,
  }));
}

function coder390Specs(): QwenSpec[] {
  const preset = modelById('qwen38-27b');
  return CODER390_FILES.map((file) => ({
    id: `qwen38-coder390-${file.quantId}`,
    family: '3.8' as const,
    modelKey: 'coder390',
    model: 'Coder390',
    short: 'Qwen3.8-27B Coder390',
    calcModelId: 'qwen38-27b' as const,
    kind: 'dense' as const,
    totalParamsB: preset.totalParamsB ?? 27.8,
    activeParamsB: preset.activeParamsB ?? 27.8,
    nativeContext: QWEN_COMPARE_NATIVE_CTX,
    quant: file.quant,
    quantId: file.quantId,
    runQuant: file.quant,
    edition: 'original' as const,
    hfUrl: CODER390_HF,
    ggufUrl: CODER390_HF_GGUF,
    citedDecimalGb: file.decimalGb,
    sizeCite: `Hugging Face GGUF folder listing for ${file.file} (${file.decimalGb} GB) on nerkyor/Qwen3.8-27B-Coder390-…-GGUF-NInfer`,
    skipPublisher: true,
    note: `${file.mtpNote} No Q5 GGUF on the original nerkyor package.`,
  }));
}

function huihui38Specs(): QwenSpec[] {
  const preset = modelById('qwen38-27b');
  const hf = 'https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated';
  const quants: Array<{ slug: string; quant: string; quantId: QuantId }> = [
    { slug: 'q3m', quant: 'Q3_K_M', quantId: 'q3_k_m' },
    { slug: 'q4km', quant: 'Q4_K_M', quantId: 'q4_k_m' },
    { slug: 'q5km', quant: 'Q5_K_M', quantId: 'q5_k_m' },
    { slug: 'q6k', quant: 'Q6_K', quantId: 'q6_k' },
  ];
  return quants.map((item) => ({
    id: `qwen38-huihui-${item.slug}`,
    family: '3.8' as const,
    modelKey: '27b-huihui',
    model: '27B Huihui',
    short: 'Huihui-Qwen3.8-27B-abliterated',
    calcModelId: 'qwen38-27b' as const,
    kind: 'dense' as const,
    totalParamsB: preset.totalParamsB ?? 27.8,
    activeParamsB: preset.activeParamsB ?? 27.8,
    nativeContext: QWEN_COMPARE_NATIVE_CTX,
    quant: item.quant,
    quantId: item.quantId,
    runQuant: item.quant,
    edition: 'abliterated' as const,
    hfUrl: hf,
    ggufUrl: hf,
    citedDecimalGb: null,
    sizeCite: 'No publisher GB listing in the abliterated catalog. File size is a params × bpw estimate.',
    skipPublisher: true,
    note: 'Educational only. Not a house default. Same 27B envelope as official Qwen3.8-27B.',
  }));
}

export function qwenCompareSpecs(): QwenSpec[] {
  const specs = [
    ...qwen36Specs(),
    ...dense27bSpecs({
      family: '3.6',
      calcModelId: 'qwen36-27b',
      model: '27B',
      short: 'Qwen3.6-27B',
      hfUrl: 'https://huggingface.co/Qwen/Qwen3.6-27B',
      slug: 'qwen36-27b',
    }),
    ...flashSpecs(),
    ...dense27bSpecs({
      family: '3.8',
      calcModelId: 'qwen38-27b',
      model: '27B',
      short: 'Qwen3.8-27B',
      hfUrl: 'https://huggingface.co/Qwen/Qwen3.8-27B',
      slug: 'qwen38-27b',
    }),
    ...coder390Specs(),
    ...huihui38Specs(),
  ];
  for (const spec of specs) {
    const blob = `${spec.short} ${spec.model} ${spec.id}`;
    if (QWEN_COMPARE_BANNED.test(blob)) {
      throw new Error(`/qwen catalog must not include ${blob}`);
    }
  }
  return specs;
}

export function qwenCalcInput(
  spec: QwenSpec,
  opts: {
    gpuCount: number;
    backendId: QwenBackendId;
    context: number;
    ramGb: number;
    vramGb?: number;
    split?: boolean;
  },
): CalcInput {
  const preset = applyModelPreset(spec.calcModelId, { ...DEFAULT_INPUT });
  const quant = quantById(spec.quantId);
  let fileWeightGiB: number | null = null;
  if (spec.citedDecimalGb != null && spec.skipPublisher) {
    fileWeightGiB = decimalGbToGiB(spec.citedDecimalGb);
  } else if (spec.skipPublisher) {
    fileWeightGiB = formulaWeightsGiB(spec.totalParamsB, quant.bpw);
  }
  return {
    ...preset,
    quantId: spec.quantId,
    context: opts.context,
    gpuCount: opts.gpuCount,
    split: opts.split ?? opts.gpuCount > 1,
    backendId: opts.backendId,
    ramGb: opts.ramGb,
    vramGb: opts.vramGb ?? 32,
    gpuId: 'r9700',
    fileWeightGiB,
    kvId: 'f16',
    pathId: 'vulkan',
    desktopSpare: true,
  };
}

function emptyMeasured(): MeasuredCell {
  return { value: null, context: null, runId: null, text: '' };
}

function pickMeasured(cards: RunCard[], spec: QwenSpec, backend: QwenBackendId, kind: 'decode' | 'prefill'): MeasuredCell {
  const pool = matchRuns(verifiedMeasured(cards), {
    quant: spec.runQuant,
    backend: BACKEND_RUN_NAME[backend],
  }).filter((card) => {
    if (isSupersededQ6k4k(card)) return false;
    const name = card.model.name;
    if (spec.modelKey === '35b-a3b') return /35B/i.test(name) && !/flash/i.test(name);
    if (spec.modelKey === 'flash') return /flash/i.test(name);
    if (spec.modelKey === 'coder390') return /coder390/i.test(name);
    if (spec.modelKey === '27b-huihui') return /huihui/i.test(name);
    if (spec.modelKey === 'qwen36-27b') return /3\.6-27B|3\.6 27B/i.test(name);
    if (spec.modelKey === 'qwen38-27b') return /3\.8-27B|3\.8 27B/i.test(name) && !/coder390|huihui|flash/i.test(name);
    return name.toLowerCase().includes(spec.short.toLowerCase());
  });
  const scored = pool
    .map((card) => ({
      card,
      value: kind === 'decode' ? card.results.decode_tps : card.results.prefill_tps,
    }))
    .filter((row) => row.value != null)
    .sort((a, b) => {
      const aSingle = a.card.config.layout === 'single' && a.card.hardware.gpu_count_used === 1 ? 0 : 1;
      const bSingle = b.card.config.layout === 'single' && b.card.hardware.gpu_count_used === 1 ? 0 : 1;
      if (aSingle !== bSingle) return aSingle - bSingle;
      return (b.value ?? 0) - (a.value ?? 0);
    });
  const hit = scored[0];
  if (!hit || hit.value == null) return emptyMeasured();
  const text =
    spec.modelKey === '35b-a3b' && spec.runQuant === 'Q6_K' && kind === 'decode' && hit.card.config.context_tokens === 4096
      ? `${hit.value} @ 4K`
      : `${hit.value} @ ${contextLabel(hit.card.config.context_tokens)}`;
  return {
    value: hit.value,
    context: hit.card.config.context_tokens,
    runId: hit.card.run_id,
    text,
  };
}

function estimateVram(spec: QwenSpec, context: number, cards: RunCard[]): EstimateCell {
  const measured = matchRuns(verifiedMeasured(cards), {
    quant: spec.runQuant,
    context,
    layout: 'single',
    gpus: 1,
  }).find((card) => {
    if (card.results.peak_vram_gb_total == null && !card.results.peak_vram_gb_per_gpu.length) return false;
    const name = card.model.name;
    if (spec.modelKey === '35b-a3b') return /35B/i.test(name) && !/flash/i.test(name);
    if (spec.modelKey === 'flash') return /flash/i.test(name);
    return false;
  });
  if (measured) {
    const gb = measured.results.peak_vram_gb_total ?? measured.results.peak_vram_gb_per_gpu[0] ?? null;
    if (gb != null) {
      return {
        gib: gb,
        text: `${gb} GB`,
        label: 'measured',
        cite: `Measured peak VRAM on ${measured.run_id}`,
      };
    }
  }
  const result = compute(
    qwenCalcInput(spec, {
      gpuCount: 1,
      backendId: 'llamacpp',
      context,
      ramGb: 256,
      split: false,
    }),
  );
  return {
    gib: result.totalGiB,
    text: `${formatGiB(result.totalGiB)} GiB est.`,
    label: 'estimate',
    cite: result.weightsNote,
  };
}

function fitAt(spec: QwenSpec, gpuCount: QwenGpuCount, backendId: QwenBackendId, ramGb = 256): FitCell {
  const result = compute(
    qwenCalcInput(spec, {
      gpuCount,
      backendId,
      context: QWEN_COMPARE_NATIVE_CTX,
      ramGb,
      split: gpuCount > 1,
    }),
  );
  const word = result.verdict === 'fits' ? 'yes' : result.verdict === 'tight' ? 'tight' : 'no';
  return {
    verdict: result.verdict,
    text: `${word} · est.`,
    overflowGiB: result.overflowGiB,
    ramKitGb: result.systemRam.atSelected.kitGb,
    totalGiB: result.totalGiB,
  };
}

function fileSizeFor(spec: QwenSpec): { gb: number | null; text: string; source: SizeSource } {
  if (spec.citedDecimalGb != null) {
    return {
      gb: spec.citedDecimalGb,
      text: `${spec.citedDecimalGb} GB`,
      source: spec.skipPublisher && spec.modelKey === 'coder390' ? 'cited' : spec.skipPublisher ? 'cited' : 'publisher',
    };
  }
  const quant = quantById(spec.quantId);
  const gib = formulaWeightsGiB(spec.totalParamsB, quant.bpw);
  return { gb: null, text: `${formatGiB(gib)} GiB est.`, source: 'formula' };
}

export function qwenCompareRows(cards: RunCard[]): QwenCompareRow[] {
  return qwenCompareSpecs().map((spec) => {
    const size = fileSizeFor(spec);
    const backends = QWEN_BACKENDS.map((b) => b.id);
    const decode = Object.fromEntries(backends.map((id) => [id, pickMeasured(cards, spec, id, 'decode')])) as Record<
      QwenBackendId,
      MeasuredCell
    >;
    const prefill = Object.fromEntries(backends.map((id) => [id, pickMeasured(cards, spec, id, 'prefill')])) as Record<
      QwenBackendId,
      MeasuredCell
    >;
    const runIds = [
      ...new Set(
        [...Object.values(decode), ...Object.values(prefill)]
          .map((cell) => cell.runId)
          .filter((id): id is string => !!id),
      ),
    ];
    const fits = Object.fromEntries(
      backends.map((id) => [id, { 1: fitAt(spec, 1, id), 2: fitAt(spec, 2, id) }]),
    ) as Record<QwenBackendId, Record<QwenGpuCount, FitCell>>;
    const fit1x = fits.llamacpp[1];
    const offload: EstimateCell = {
      gib: fit1x.overflowGiB,
      text: fit1x.overflowGiB < 0.05 ? 'none · est.' : `${formatGiB(fit1x.overflowGiB)} GiB est.`,
      label: 'estimate',
      cite: 'Calculator overflow at native 262K, one R9700, llama.cpp, f16 KV.',
    };
    return {
      id: spec.id,
      spec,
      type: spec.kind,
      fileSizeGb: size.gb,
      fileSizeText: size.text,
      sizeSource: spec.modelKey === 'coder390' && spec.citedDecimalGb != null ? 'cited' : size.source,
      vram32: estimateVram(spec, QWEN_COMPARE_CTX_32K, cards),
      vram128: estimateVram(spec, QWEN_COMPARE_CTX_128K, cards),
      vramFull: estimateVram(spec, QWEN_COMPARE_NATIVE_CTX, cards),
      fit1x,
      fit2x: fits.llamacpp[2],
      offload1x: offload,
      decode,
      prefill,
      runIds,
      runHref: runIds.length === 1 ? runPath(runIds[0]!) : `/results?model=${encodeURIComponent(spec.short)}`,
      fits,
    };
  });
}

export function rowFitsRig(row: QwenCompareRow, rig: QwenRigProfile): boolean {
  const n: QwenGpuCount = rig.gpuCount === 2 ? 2 : 1;
  const pre = row.fits[rig.backendId][n];
  if (rig.vramGb === 32) {
    if (pre.verdict !== 'no') return true;
    return pre.ramKitGb <= rig.ramGb;
  }
  const result = compute(
    qwenCalcInput(row.spec, {
      gpuCount: n,
      backendId: rig.backendId,
      context: QWEN_COMPARE_NATIVE_CTX,
      ramGb: rig.ramGb,
      vramGb: rig.vramGb,
      split: n > 1,
    }),
  );
  if (result.verdict !== 'no') return true;
  return result.systemRam.atSelected.kitGb <= rig.ramGb;
}

export function rigFromState(state: QwenCompareState, fallback = DEFAULT_QWEN_RIG): QwenRigProfile {
  return {
    gpuCount: state.gpuCount ?? fallback.gpuCount,
    ramGb: state.ramGb ?? fallback.ramGb,
    backendId: state.backendId ?? fallback.backendId,
    vramGb: fallback.vramGb,
    gpuId: 'r9700',
  };
}

export function rigFromCalculatorSearch(search: string): QwenRigProfile {
  const input = queryToInput(search);
  const backend: QwenBackendId =
    input.backendId === 'strata' ? 'strata' : input.backendId === 'vllm' ? 'vllm' : 'llamacpp';
  const ram = DIMM_KIT_GB.find((kit) => kit >= input.ramGb) ?? input.ramGb;
  return {
    gpuCount: input.gpuCount >= 2 ? 2 : 1,
    ramGb: ram,
    backendId: backend,
    vramGb: input.vramGb || 32,
    gpuId: 'r9700',
  };
}

const COL_SET = new Set<string>(QWEN_ALL_COLS);

export function defaultQwenState(): QwenCompareState {
  return {
    gpuCount: null,
    ramGb: null,
    backendId: null,
    fitsOnMyRig: false,
    family: null,
    edition: null,
    sort: 'model',
    dir: 'asc',
    cols: [...DEFAULT_QWEN_COLS],
  };
}

export function parseQwenCompareQuery(search: string): QwenCompareState {
  const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const state = defaultQwenState();
  const n = q.get('n');
  if (n === '1' || n === '2') state.gpuCount = Number(n) as QwenGpuCount;
  const ram = Number(q.get('ram') ?? '');
  if (QWEN_RAM_KITS.includes(ram as (typeof QWEN_RAM_KITS)[number])) state.ramGb = ram;
  const be = q.get('be');
  if (be === 'llamacpp' || be === 'strata' || be === 'vllm') state.backendId = be;
  if (q.get('fit') === '1' || q.get('fit') === 'yes') state.fitsOnMyRig = true;
  const family = q.get('family');
  if (family === '3.6' || family === '3.8') state.family = family;
  const edition = q.get('edition');
  if (edition === 'original' || edition === 'abliterated') state.edition = edition;
  const sort = q.get('sort');
  if (sort && (COL_SET.has(sort) || sort === 'model' || sort === 'quant')) state.sort = sort;
  if (q.get('dir') === 'desc' || q.get('dir') === 'asc') state.dir = q.get('dir') as 'asc' | 'desc';
  const cols = (q.get('cols') ?? '')
    .split(',')
    .map((c) => c.trim())
    .filter((c) => COL_SET.has(c));
  if (cols.length) state.cols = cols;
  return state;
}

export function serializeQwenCompareQuery(state: QwenCompareState): string {
  const q = new URLSearchParams();
  if (state.gpuCount) q.set('n', String(state.gpuCount));
  if (state.ramGb) q.set('ram', String(state.ramGb));
  if (state.backendId) q.set('be', state.backendId);
  if (state.fitsOnMyRig) q.set('fit', '1');
  if (state.family) q.set('family', state.family);
  if (state.edition) q.set('edition', state.edition);
  if (state.sort && state.sort !== 'model') q.set('sort', state.sort);
  if (state.dir === 'desc') q.set('dir', 'desc');
  const cols = state.cols.join(',');
  if (cols && cols !== DEFAULT_QWEN_COLS.join(',')) q.set('cols', cols);
  return q.toString();
}

export function filterQwenRows(rows: QwenCompareRow[], state: QwenCompareState, rig?: QwenRigProfile): QwenCompareRow[] {
  const profile = rig ?? rigFromState(state);
  return rows.filter((row) => {
    if (state.family && row.spec.family !== state.family) return false;
    if (state.edition && row.spec.edition !== state.edition) return false;
    if (state.fitsOnMyRig && !rowFitsRig(row, profile)) return false;
    return true;
  });
}

function sortValue(row: QwenCompareRow, key: string): string | number {
  switch (key) {
    case 'family':
      return row.spec.family;
    case 'model':
      return `${row.spec.family} ${row.spec.model} ${row.spec.quant}`;
    case 'type':
      return row.type;
    case 'total':
      return row.spec.totalParamsB;
    case 'active':
      return row.spec.activeParamsB;
    case 'ctx':
      return row.spec.nativeContext;
    case 'quant':
      return quantById(row.spec.quantId).bpw;
    case 'size':
      return row.fileSizeGb ?? decimalGbToGiB(0) + (row.vramFull.gib || 0);
    case 'vram32':
      return row.vram32.gib;
    case 'vram128':
      return row.vram128.gib;
    case 'vramFull':
      return row.vramFull.gib;
    case 'fit1':
      return row.fit1x.verdict === 'fits' ? 0 : row.fit1x.verdict === 'tight' ? 1 : 2;
    case 'fit2':
      return row.fit2x.verdict === 'fits' ? 0 : row.fit2x.verdict === 'tight' ? 1 : 2;
    case 'offload':
      return row.offload1x.gib;
    case 'decodeLlama':
      return row.decode.llamacpp.value ?? -1;
    case 'decodeStrata':
      return row.decode.strata.value ?? -1;
    case 'decodeVllm':
      return row.decode.vllm.value ?? -1;
    case 'prefillLlama':
      return row.prefill.llamacpp.value ?? -1;
    case 'prefillStrata':
      return row.prefill.strata.value ?? -1;
    case 'prefillVllm':
      return row.prefill.vllm.value ?? -1;
    case 'edition':
      return row.spec.edition;
    default:
      return row.spec.model;
  }
}

export function sortQwenRows(rows: QwenCompareRow[], state: QwenCompareState): QwenCompareRow[] {
  const dir = state.dir === 'desc' ? -1 : 1;
  return [...rows].sort((a, b) => {
    const av = sortValue(a, state.sort);
    const bv = sortValue(b, state.sort);
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
    return String(av).localeCompare(String(bv)) * dir;
  });
}

export function applyQwenCompare(rows: QwenCompareRow[], state: QwenCompareState, rig?: QwenRigProfile): QwenCompareRow[] {
  return sortQwenRows(filterQwenRows(rows, state, rig), state);
}

export function coder390HasNoQ5(specs = qwenCompareSpecs()): boolean {
  return specs
    .filter((spec) => spec.modelKey === 'coder390' && spec.edition === 'original')
    .every((spec) => !/Q5/i.test(spec.quant));
}
