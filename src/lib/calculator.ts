/**
 * Quant + Hardware Calculator — estimates only.
 *
 * Weights: total stored parameters × bits-per-weight / 8.
 * KV cache: 2 (K+V) × KV-growing layers × KV heads × head dim × context × bytes/element.
 * Hybrid Qwen cards (3.6 / 3.8 Flash) only grow KV on full-attention layers — that
 * count is taken from the public model card, not measured on our rig.
 *
 * GiB uses 1024³. Publisher Hugging Face “GB” listings are decimal (10⁹) and
 * converted here. Never treat a result as measured VRAM.
 */

export const GIB = 1024 ** 3;
export const DECIMAL_GB = 1e9;

export type QuantId = 'q4_k_m' | 'q5_k_m' | 'q6_k' | 'q8_0' | 'bf16';
export type KvId = 'f16' | 'q8_0' | 'q4_0';
export type ModelId = 'qwen36' | 'flash' | 'custom';
export type GpuId = 'r9700' | 'rx9070xt' | 'rx7900xtx' | 'rx7900xt' | 'rx7800xt' | 'custom';
export type Verdict = 'fits' | 'tight' | 'no';

export type Quant = {
  id: QuantId;
  label: string;
  short: string;
  bpw: number;
  bpwNote: string;
};

export type KvType = {
  id: KvId;
  label: string;
  bytes: number;
};

export type GpuPreset = {
  id: GpuId;
  name: string;
  vramGb: number;
  gfx: string;
};

export type ModelPreset = {
  id: ModelId;
  name: string;
  official: string;
  gguf: string;
  totalParamsB: number | null;
  activeParamsB: number | null;
  layers: number | null;
  kvLayers: number | null;
  kvHeads: number | null;
  headDim: number | null;
  defaultQuant: QuantId;
  defaultCtx: number;
  defaultKv: KvId;
  archNote: string;
  publisherFiles: Partial<Record<QuantId, { decimalGb: number; label: string }>>;
};

export type CalcInput = {
  gpuId: GpuId;
  vramGb: number;
  gpuCount: number;
  split: boolean;
  ramGb: number;
  modelId: ModelId;
  totalParamsB: number;
  activeParamsB: number;
  layers: number;
  kvLayers: number;
  kvHeads: number;
  headDim: number;
  quantId: QuantId;
  context: number;
  kvId: KvId;
  overheadGiB: number;
};

export type CalcResult = {
  weightsGiB: number;
  weightsSource: 'publisher' | 'formula';
  weightsNote: string;
  kvGiB: number;
  kvReady: boolean;
  kvNote: string;
  overheadGiB: number;
  totalGiB: number;
  availableVramGb: number;
  perGpuGiB: number;
  overflowGiB: number;
  overflowRamPct: number | null;
  verdict: Verdict;
  verdictLabel: string;
  bestQuant: Quant | null;
  maxContextAtBest: number | null;
  maxContextAtSelected: number | null;
  tested: { id: 'daily' | 'fast'; label: string } | null;
};

/** llama.cpp-family nominal bits-per-weight. Q1–Q3 / IQ1–IQ3 are intentionally absent. */
export const QUANTS: Quant[] = [
  { id: 'q4_k_m', label: 'Q4_K_M', short: 'Q4', bpw: 4.85, bpwNote: 'nominal GGUF Q4_K_M' },
  { id: 'q5_k_m', label: 'Q5_K_M / UD-Q5_K_XL', short: 'Q5', bpw: 5.69, bpwNote: 'nominal GGUF Q5_K_M; UD-Q5_K_XL uses the same bucket' },
  { id: 'q6_k', label: 'Q6_K / UD-Q6_K_XL', short: 'Q6', bpw: 6.56, bpwNote: 'nominal GGUF Q6_K; UD-Q6_K_XL uses the same bucket' },
  { id: 'q8_0', label: 'Q8_0', short: 'Q8', bpw: 8.5, bpwNote: 'nominal GGUF Q8_0' },
  { id: 'bf16', label: 'BF16', short: 'BF16', bpw: 16, bpwNote: '16-bit weights' },
];

export const KV_TYPES: KvType[] = [
  { id: 'f16', label: 'f16', bytes: 2 },
  { id: 'q8_0', label: 'q8_0', bytes: 1 },
  { id: 'q4_0', label: 'q4_0', bytes: 0.5 },
];

export const GPU_PRESETS: GpuPreset[] = [
  { id: 'r9700', name: 'Radeon AI PRO R9700', vramGb: 32, gfx: 'gfx1201' },
  { id: 'rx9070xt', name: 'Radeon RX 9070 XT', vramGb: 16, gfx: 'gfx1201' },
  { id: 'rx7900xtx', name: 'Radeon RX 7900 XTX', vramGb: 24, gfx: 'gfx1100' },
  { id: 'rx7900xt', name: 'Radeon RX 7900 XT', vramGb: 20, gfx: 'gfx1100' },
  { id: 'rx7800xt', name: 'Radeon RX 7800 XT', vramGb: 16, gfx: 'gfx1101' },
  { id: 'custom', name: 'Custom GPU', vramGb: 24, gfx: '' },
];

export const MODEL_PRESETS: ModelPreset[] = [
  {
    id: 'qwen36',
    name: 'Qwen3.6-35B-A3B',
    official: 'Qwen/Qwen3.6-35B-A3B',
    gguf: 'unsloth/Qwen3.6-35B-A3B-GGUF',
    totalParamsB: 35,
    activeParamsB: 3,
    layers: 40,
    kvLayers: 10,
    kvHeads: 2,
    headDim: 256,
    defaultQuant: 'q5_k_m',
    defaultCtx: 262144,
    defaultKv: 'f16',
    archNote:
      'Official card: 35B total / 3B active, 40 layers, 10 full-attention (GQA 2×256). Only those 10 layers grow a token-length KV cache.',
    publisherFiles: {
      q5_k_m: { decimalGb: 26.6, label: 'Hugging Face listing for Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf (26.6 GB)' },
    },
  },
  {
    id: 'flash',
    name: 'Qwen 3.8 Flash',
    official: 'Qwen/Qwen3.8-Flash-Next',
    gguf: 'unsloth/Qwen3.8-Flash-Next-GGUF',
    totalParamsB: 125,
    activeParamsB: 6,
    layers: 48,
    kvLayers: 12,
    kvHeads: 2,
    headDim: 256,
    defaultQuant: 'q6_k',
    defaultCtx: 262144,
    defaultKv: 'f16',
    archNote:
      'Official card (Qwen3.8-Flash-Next): 125B total / 6B active, plus 51B n-gram embedding not always in the param count. 48 layers, 12 sparse-attention layers (GQA 2×256). Publisher UD-Q6_K_XL folder lists ~169 GB.',
    publisherFiles: {
      q6_k: { decimalGb: 169, label: 'Hugging Face folder listing for UD-Q6_K_XL (~169 GB across 6 shards)' },
    },
  },
  {
    id: 'custom',
    name: 'Custom model',
    official: '',
    gguf: '',
    totalParamsB: 35,
    activeParamsB: 3,
    layers: 40,
    kvLayers: 40,
    kvHeads: 8,
    headDim: 128,
    defaultQuant: 'q5_k_m',
    defaultCtx: 32768,
    defaultKv: 'f16',
    archNote: 'Enter total / active params and KV dims from the model card. If every layer is full attention, set KV layers = hidden layers.',
    publisherFiles: {},
  },
];

export const CONTEXT_PRESETS = [4096, 8192, 16384, 32768, 65536, 131072, 262144] as const;

export const DEFAULT_INPUT: CalcInput = {
  gpuId: 'r9700',
  vramGb: 32,
  gpuCount: 1,
  split: false,
  ramGb: 256,
  modelId: 'qwen36',
  totalParamsB: 35,
  activeParamsB: 3,
  layers: 40,
  kvLayers: 10,
  kvHeads: 2,
  headDim: 256,
  quantId: 'q5_k_m',
  context: 262144,
  kvId: 'f16',
  overheadGiB: 1,
};

export function quantById(id: QuantId): Quant {
  return QUANTS.find((q) => q.id === id) ?? QUANTS[1];
}

export function kvById(id: KvId): KvType {
  return KV_TYPES.find((k) => k.id === id) ?? KV_TYPES[0];
}

export function gpuById(id: GpuId): GpuPreset {
  return GPU_PRESETS.find((g) => g.id === id) ?? GPU_PRESETS[0];
}

export function modelById(id: ModelId): ModelPreset {
  return MODEL_PRESETS.find((m) => m.id === id) ?? MODEL_PRESETS[2];
}

export function decimalGbToGiB(decimalGb: number): number {
  return (decimalGb * DECIMAL_GB) / GIB;
}

export function formulaWeightsGiB(totalParamsB: number, bpw: number): number {
  if (!(totalParamsB > 0) || !(bpw > 0)) return 0;
  return (totalParamsB * 1e9 * (bpw / 8)) / GIB;
}

export function formulaKvGiB(kvLayers: number, kvHeads: number, headDim: number, context: number, bytes: number): number {
  if (!(kvLayers > 0) || !(kvHeads > 0) || !(headDim > 0) || !(context > 0) || !(bytes > 0)) return 0;
  return (2 * kvLayers * kvHeads * headDim * context * bytes) / GIB;
}

function weightsFor(input: CalcInput): { gib: number; source: 'publisher' | 'formula'; note: string } {
  const quant = quantById(input.quantId);
  const model = modelById(input.modelId);
  const listed = input.modelId !== 'custom' ? model.publisherFiles[input.quantId] : undefined;
  if (listed) {
    return {
      gib: decimalGbToGiB(listed.decimalGb),
      source: 'publisher',
      note: `${listed.label}. Converted ${listed.decimalGb} × 10⁹ bytes → GiB. Not measured VRAM.`,
    };
  }
  return {
    gib: formulaWeightsGiB(input.totalParamsB, quant.bpw),
    source: 'formula',
    note: `Estimate: total_params × ${quant.bpw} bpw (${quant.bpwNote}) / 8. Active params do not shrink the file.`,
  };
}

export function applyModelPreset(id: ModelId, current: CalcInput): CalcInput {
  const model = modelById(id);
  return {
    ...current,
    modelId: id,
    totalParamsB: model.totalParamsB ?? current.totalParamsB,
    activeParamsB: model.activeParamsB ?? current.activeParamsB,
    layers: model.layers ?? current.layers,
    kvLayers: model.kvLayers ?? current.kvLayers,
    kvHeads: model.kvHeads ?? current.kvHeads,
    headDim: model.headDim ?? current.headDim,
    quantId: id === 'custom' ? current.quantId : model.defaultQuant,
    context: id === 'custom' ? current.context : model.defaultCtx,
    kvId: id === 'custom' ? current.kvId : model.defaultKv,
  };
}

export function applyGpuPreset(id: GpuId, current: CalcInput): CalcInput {
  const gpu = gpuById(id);
  return {
    ...current,
    gpuId: id,
    vramGb: id === 'custom' ? current.vramGb : gpu.vramGb,
  };
}

function kvReady(input: CalcInput): boolean {
  return input.kvLayers > 0 && input.kvHeads > 0 && input.headDim > 0 && input.context > 0;
}

function totalFor(input: CalcInput): { weights: ReturnType<typeof weightsFor>; kvGiB: number; totalGiB: number } {
  const weights = weightsFor(input);
  const kv = kvReady(input) ? formulaKvGiB(input.kvLayers, input.kvHeads, input.headDim, input.context, kvById(input.kvId).bytes) : 0;
  return { weights, kvGiB: kv, totalGiB: weights.gib + kv + Math.max(0, input.overheadGiB) };
}

function overflowOf(input: CalcInput, totalGiB: number): { available: number; perGpu: number; overflow: number } {
  const n = Math.min(4, Math.max(1, Math.round(input.gpuCount)));
  const available = input.split ? input.vramGb * n : input.vramGb;
  const perGpu = input.split ? totalGiB / n : totalGiB;
  return { available, perGpu, overflow: Math.max(0, totalGiB - available) };
}

function verdictOf(perGpuGiB: number, vramGb: number): { verdict: Verdict; label: string } {
  if (perGpuGiB > vramGb + 1e-9) return { verdict: 'no', label: 'Does not fit this GPU' };
  if (perGpuGiB > vramGb * 0.9) return { verdict: 'tight', label: 'Tight — little headroom' };
  return { verdict: 'fits', label: 'Fits in VRAM (estimate)' };
}

export function fitsInVram(input: CalcInput): boolean {
  const { totalGiB } = totalFor(input);
  return overflowOf(input, totalGiB).overflow <= 1e-6;
}

function fitsVram(input: CalcInput): boolean {
  return fitsInVram(input);
}

export function bestQuantThatFits(input: CalcInput): Quant | null {
  const ranked = [...QUANTS].sort((a, b) => b.bpw - a.bpw);
  for (const quant of ranked) {
    if (fitsVram({ ...input, quantId: quant.id })) return quant;
  }
  return null;
}

export function maxContextThatFits(input: CalcInput, cap = 262144): number | null {
  if (!kvReady(input)) return null;
  if (!fitsVram({ ...input, context: 4096 })) return null;
  let lo = 4096;
  let hi = cap;
  let best = 4096;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (fitsVram({ ...input, context: mid })) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return best;
}

export function testedBadge(input: CalcInput): { id: 'daily' | 'fast'; label: string } | null {
  const r9700 = input.gpuId === 'r9700' && input.vramGb === 32;
  if (!r9700 || input.context !== 262144 || input.kvId !== 'f16') return null;
  if (input.modelId === 'qwen36' && input.quantId === 'q5_k_m' && input.gpuCount === 1 && !input.split) {
    return { id: 'daily', label: 'Tested on our rig — daily driver (1× R9700, Vulkan llama.cpp, 262K, f16 KV)' };
  }
  if (input.modelId === 'flash' && input.quantId === 'q6_k') {
    return { id: 'fast', label: 'Tested on our rig — fast agent (Strata v0.1.42, 262K; tok/s measured, VRAM not)' };
  }
  return null;
}

export function compute(input: CalcInput): CalcResult {
  const { weights, kvGiB, totalGiB } = totalFor(input);
  const { available, perGpu, overflow } = overflowOf(input, totalGiB);
  const { verdict, label } = verdictOf(perGpu, input.vramGb);
  const ready = kvReady(input);
  const best = bestQuantThatFits(input);
  const ramPct = input.ramGb > 0 ? (overflow / input.ramGb) * 100 : null;

  return {
    weightsGiB: weights.gib,
    weightsSource: weights.source,
    weightsNote: weights.note,
    kvGiB,
    kvReady: ready,
    kvNote: ready
      ? `Estimate: 2 × ${input.kvLayers} KV layers × ${input.kvHeads} heads × ${input.headDim} dim × ${input.context} tokens × ${kvById(input.kvId).bytes} B.`
      : 'Enter KV layers, heads, and head dim for a KV estimate. Weights still compute.',
    overheadGiB: Math.max(0, input.overheadGiB),
    totalGiB,
    availableVramGb: available,
    perGpuGiB: perGpu,
    overflowGiB: overflow,
    overflowRamPct: ramPct,
    verdict,
    verdictLabel: label,
    bestQuant: best,
    maxContextAtBest: best ? maxContextThatFits({ ...input, quantId: best.id }) : null,
    maxContextAtSelected: maxContextThatFits(input),
    tested: testedBadge(input),
  };
}

export function formatGiB(n: number): string {
  if (!Number.isFinite(n)) return '—';
  if (n === 0) return '0';
  if (n < 0.05) return n.toFixed(3);
  if (n < 10) return n.toFixed(2);
  return n.toFixed(1);
}

export function formatCtx(n: number | null): string {
  if (n == null) return '—';
  if (n >= 1024 && n % 1024 === 0) return `${n / 1024}K`;
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return String(n);
}

const QUERY_KEYS = [
  'gpu',
  'vram',
  'n',
  'split',
  'ram',
  'model',
  'tp',
  'ap',
  'layers',
  'kvl',
  'kvh',
  'hd',
  'quant',
  'ctx',
  'kv',
  'oh',
  'priority',
] as const;

function num(value: string | null, fallback: number): number {
  if (value == null || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function inputToQuery(input: CalcInput, extras?: { priority?: string; usage?: string; style?: string }): string {
  const params = new URLSearchParams({
    gpu: input.gpuId,
    vram: String(input.vramGb),
    n: String(input.gpuCount),
    split: input.split ? '1' : '0',
    ram: String(input.ramGb),
    model: input.modelId,
    tp: String(input.totalParamsB),
    ap: String(input.activeParamsB),
    layers: String(input.layers),
    kvl: String(input.kvLayers),
    kvh: String(input.kvHeads),
    hd: String(input.headDim),
    quant: input.quantId,
    ctx: String(input.context),
    kv: input.kvId,
    oh: String(input.overheadGiB),
  });
  if (extras?.priority) params.set('priority', extras.priority);
  if (extras?.usage) params.set('usage', extras.usage);
  if (extras?.style) params.set('style', extras.style);
  return params.toString();
}

export function queryToInput(search: string): CalcInput {
  const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const has = QUERY_KEYS.some((key) => q.has(key));
  if (!has) return { ...DEFAULT_INPUT };

  const gpuId = (['r9700', 'rx9070xt', 'rx7900xtx', 'rx7900xt', 'rx7800xt', 'custom'] as GpuId[]).includes(q.get('gpu') as GpuId)
    ? (q.get('gpu') as GpuId)
    : DEFAULT_INPUT.gpuId;
  const modelId = (['qwen36', 'flash', 'custom'] as ModelId[]).includes(q.get('model') as ModelId)
    ? (q.get('model') as ModelId)
    : DEFAULT_INPUT.modelId;
  const quantId = (['q4_k_m', 'q5_k_m', 'q6_k', 'q8_0', 'bf16'] as QuantId[]).includes(q.get('quant') as QuantId)
    ? (q.get('quant') as QuantId)
    : DEFAULT_INPUT.quantId;
  const kvId = (['f16', 'q8_0', 'q4_0'] as KvId[]).includes(q.get('kv') as KvId)
    ? (q.get('kv') as KvId)
    : DEFAULT_INPUT.kvId;

  const gpuCount = Math.min(4, Math.max(1, Math.round(num(q.get('n'), DEFAULT_INPUT.gpuCount))));
  const context = Math.min(262144, Math.max(4096, Math.round(num(q.get('ctx'), DEFAULT_INPUT.context))));

  return {
    gpuId,
    vramGb: Math.max(1, num(q.get('vram'), gpuById(gpuId).vramGb)),
    gpuCount,
    split: q.get('split') === '1' || q.get('split') === 'true',
    ramGb: Math.max(0, num(q.get('ram'), DEFAULT_INPUT.ramGb)),
    modelId,
    totalParamsB: Math.max(0, num(q.get('tp'), DEFAULT_INPUT.totalParamsB)),
    activeParamsB: Math.max(0, num(q.get('ap'), DEFAULT_INPUT.activeParamsB)),
    layers: Math.max(0, Math.round(num(q.get('layers'), DEFAULT_INPUT.layers))),
    kvLayers: Math.max(0, Math.round(num(q.get('kvl'), DEFAULT_INPUT.kvLayers))),
    kvHeads: Math.max(0, Math.round(num(q.get('kvh'), DEFAULT_INPUT.kvHeads))),
    headDim: Math.max(0, Math.round(num(q.get('hd'), DEFAULT_INPUT.headDim))),
    quantId,
    context,
    kvId,
    overheadGiB: Math.max(0, num(q.get('oh'), DEFAULT_INPUT.overheadGiB)),
  };
}
