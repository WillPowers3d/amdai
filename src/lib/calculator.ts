/**
 * Quant + Hardware Calculator — estimates unless a first-party badge applies.
 *
 * Weights: publisher file listing when we have one, else params × bits-per-weight / 8.
 * KV: architecture-aware (full-attention layers, optional sliding window, optional MLA).
 * Overhead: backend floor + percent, labeled estimate (ROCm / Vulkan path). Not a bench.
 *
 * GiB uses 1024³. Publisher Hugging Face “GB” listings are decimal (10⁹) and
 * converted here. Never treat a result as measured VRAM unless the tested badge says so.
 */

export const GIB = 1024 ** 3;
export const DECIMAL_GB = 1e9;

export type QuantId = 'q3_k_s' | 'q3_k_m' | 'q3_k_xl' | 'iq3' | 'q4_k_m' | 'q5_k_m' | 'q6_k' | 'q8_0' | 'bf16';
export type KvId = 'f16' | 'q8_0' | 'q5_1' | 'q4_0';
export type ModelId =
  | 'qwen36'
  | 'flash'
  | 'qwen38-27b'
  | 'qwen36-27b'
  | 'qwen35-27b'
  | 'qwen35-9b'
  | 'qwen3-32b'
  | 'qwen3-14b'
  | 'qwen3-30b-a3b'
  | 'qwen3-235b-a22b'
  | 'llama33-70b'
  | 'llama31-70b'
  | 'llama31-8b'
  | 'gemma3-27b'
  | 'gemma4-31b'
  | 'gemma4-12b'
  | 'gpt-oss-20b'
  | 'gpt-oss-120b'
  | 'custom';
export type GpuId =
  | 'r9700'
  | 'rx9070xt'
  | 'rx9070'
  | 'rx9070gre'
  | 'rx9060xt'
  | 'rx7900xtx'
  | 'rx7900xt'
  | 'rx7900gre'
  | 'rx7800xt'
  | 'rx7700xt'
  | 'rx7600'
  | 'w7900'
  | 'w7800'
  | 'w6800'
  | 'unified'
  | 'custom';
export type BackendId = 'llamacpp' | 'strata' | 'ollama' | 'lmstudio' | 'vllm' | 'exllama';
export type PathId = 'vulkan' | 'hip';
export type CalcView = 'model' | 'gpu' | 'speed';
export type GpuKind = 'discrete' | 'unified';
export type Verdict = 'fits' | 'tight' | 'no';
export type KvKind = 'gqa' | 'mla';

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
  flag: string;
};

export type GpuPreset = {
  id: GpuId;
  name: string;
  vramGb: number;
  gfx: string;
  kind: GpuKind;
  /** AMD-published peak memory bandwidth (GB/s). 0 = not listed; user must enter. */
  bandwidthGBs: number;
  bandwidthNote: string;
};

export type ModelPreset = {
  id: ModelId;
  group: string;
  name: string;
  official: string;
  gguf: string;
  totalParamsB: number | null;
  activeParamsB: number | null;
  layers: number | null;
  kvLayers: number | null;
  kvHeads: number | null;
  headDim: number | null;
  kvKind: KvKind;
  mlaDim: number | null;
  mlaTensors: number;
  windowLayers: number | null;
  windowTokens: number | null;
  embedVocab: number | null;
  embedHidden: number | null;
  embedTied: boolean;
  separableParamsB: number | null;
  defaultQuant: QuantId;
  defaultCtx: number;
  defaultKv: KvId;
  archNote: string;
  publisherFiles: Partial<Record<QuantId, { decimalGb: number; label: string }>>;
};

export type BackendPreset = {
  id: BackendId;
  name: string;
  baseGiB: number;
  percent: number;
  kvPerSequence: boolean;
  quantCacheWork: boolean;
  note: string;
};

export const MEASURED_ON_OUR_RIG = 'Measured on our rig, 2026-10';

export type TestedId = 'daily' | 'fast' | 'q4' | 'q6';
export type TestedBadge = { id: TestedId; label: string };

/** First-party peak system RAM from an official 35B run card (Linux GiB labeled GB). */
export type MeasuredRamHit = {
  modelId: ModelId;
  quant: string;
  quantId: QuantId;
  context: number;
  gpuCount: number;
  split: boolean;
  backendId: BackendId;
  peakGb: number;
  runId: string;
};

export type CalcInput = {
  view: CalcView;
  gpuId: GpuId;
  vramGb: number;
  gpuCount: number;
  split: boolean;
  ramGb: number;
  kind: GpuKind;
  usablePct: number;
  bandwidthGBs: number;
  efficiency: number;
  desktopSpare: boolean;
  modelId: ModelId;
  totalParamsB: number;
  activeParamsB: number;
  layers: number;
  kvLayers: number;
  kvHeads: number;
  headDim: number;
  kvKind: KvKind;
  mlaDim: number;
  mlaTensors: number;
  windowLayers: number;
  windowTokens: number;
  embedVocab: number;
  embedHidden: number;
  embedTied: boolean;
  separableParamsB: number;
  separableEmbed: boolean;
  fileWeightGiB: number | null;
  quantId: QuantId;
  context: number;
  kvId: KvId;
  backendId: BackendId;
  pathId: PathId;
  batch: number;
  overheadGiB: number;
  overheadManual: boolean;
};

export type MatchingGpu = {
  id: GpuId;
  name: string;
  vramGb: number;
  gfx: string;
  neededGiB: number;
  verdict: Verdict;
};

export type GpuFitRow = {
  modelId: ModelId;
  name: string;
  quant: Quant;
  totalGiB: number;
  verdict: Verdict;
  tested: TestedBadge | null;
};

export type ContextSweepRow = {
  context: number;
  totalGiB: number;
  kvGiB: number;
  verdict: Verdict;
};

export type SpeedFloor = {
  offered: boolean;
  tokS: number | null;
  note: string;
  measured: TestedBadge | null;
};

/** Consumer DIMM kits we round the host-RAM estimate up to (module labels in GB). */
export const DIMM_KIT_GB = [16, 32, 48, 64, 96, 128, 192, 256, 384, 512, 768, 1024] as const;

/** OS + desktop idle estimate. Not measured on local-desktop. */
export const OS_DESKTOP_BASELINE_GIB = 8;

/** Spare so the box does not sit at 100% RAM. Estimate, not a bench. */
export const RAM_HEADROOM_GIB = 16;

/** local-desktop ships this kit. Measured process RSS is not recorded until Local AI numbers arrive. */
export const local-desktop_DDR5_GB = 256;
/** Linux-visible GiB on that 256 GB kit, labeled GB on this site. */
export const local-desktop_USABLE_RAM_GB = 249;
export const local-desktop_MEASURED_RAM_GIB: number | null = null;

export type SystemRamBreakdown = {
  offloadedWeightsGiB: number;
  separableEmbedGiB: number;
  kvInRamGiB: number;
  runtimeOverheadGiB: number;
  osDesktopGiB: number;
  headroomGiB: number;
};

export type SystemRamLine = {
  context: number;
  rawGiB: number;
  kitGb: number;
  measured: boolean;
  label: 'estimate' | 'measured';
  note: string;
  breakdown: SystemRamBreakdown;
  peakGbs?: number[];
  runIds?: string[];
};

export type SystemRamNeed = {
  atSelected: SystemRamLine;
  atFullContext: SystemRamLine;
  fullContext: number;
};

export type CalcResult = {
  weightsGiB: number;
  weightsSource: 'publisher' | 'file' | 'formula';
  weightsNote: string;
  kvGiB: number;
  kvReady: boolean;
  kvNote: string;
  overheadGiB: number;
  overheadNote: string;
  totalGiB: number;
  availableVramGb: number;
  usableVramGb: number;
  perGpuGiB: number;
  overflowGiB: number;
  overflowRamPct: number | null;
  spareFactor: number;
  verdict: Verdict;
  verdictLabel: string;
  bestQuant: Quant | null;
  maxContextAtBest: number | null;
  maxContextAtSelected: number | null;
  tested: TestedBadge | null;
  matching: MatchingGpu[];
  gpuFits: GpuFitRow[];
  gpuMisses: GpuFitRow[];
  sweep: ContextSweepRow[];
  speed: SpeedFloor;
  systemRam: SystemRamNeed;
};

/** llama.cpp-family nominal bits-per-weight. Q1 / Q2 / IQ1–IQ2 stay absent. Q3 is listed. */
export const QUANTS: Quant[] = [
  { id: 'q3_k_s', label: 'Q3_K_S', short: 'Q3S', bpw: 3.5, bpwNote: 'nominal GGUF Q3_K_S — estimate unless a publisher listing is attached' },
  { id: 'q3_k_m', label: 'Q3_K_M', short: 'Q3', bpw: 3.91, bpwNote: 'nominal GGUF Q3_K_M — estimate unless a publisher listing is attached' },
  { id: 'q3_k_xl', label: 'UD-Q3_K_XL', short: 'Q3XL', bpw: 3.91, bpwNote: 'Unsloth UD Q3 bucket; uses Q3_K_M bpw unless a publisher file size is listed' },
  { id: 'iq3', label: 'IQ3 / UD-IQ3_S / UD-IQ3_XXS', short: 'IQ3', bpw: 3.44, bpwNote: 'nominal IQ3 bucket — only when the GGUF repo lists an IQ3 file (35B: UD-IQ3_S; Flash: UD-IQ3_XXS)' },
  { id: 'q4_k_m', label: 'Q4_K_M', short: 'Q4', bpw: 4.85, bpwNote: 'nominal GGUF Q4_K_M' },
  { id: 'q5_k_m', label: 'Q5_K_M / UD-Q5_K_XL', short: 'Q5', bpw: 5.69, bpwNote: 'nominal GGUF Q5_K_M; UD-Q5_K_XL uses the same bucket' },
  { id: 'q6_k', label: 'Q6_K / UD-Q6_K_XL', short: 'Q6', bpw: 6.56, bpwNote: 'nominal GGUF Q6_K; UD-Q6_K_XL uses the same bucket' },
  { id: 'q8_0', label: 'Q8_0', short: 'Q8', bpw: 8.5, bpwNote: 'nominal GGUF Q8_0' },
  { id: 'bf16', label: 'BF16', short: 'BF16', bpw: 16, bpwNote: '16-bit weights' },
];

export const KV_TYPES: KvType[] = [
  { id: 'f16', label: 'f16', bytes: 2, flag: 'default' },
  { id: 'q8_0', label: 'q8_0', bytes: 1.0625, flag: '-ctk / -ctv q8_0' },
  { id: 'q5_1', label: 'q5_1', bytes: 0.75, flag: '-ctk / -ctv q5_1' },
  { id: 'q4_0', label: 'q4_0', bytes: 0.5625, flag: '-ctk / -ctv q4_0' },
];

export const BACKENDS: BackendPreset[] = [
  {
    id: 'llamacpp',
    name: 'llama.cpp',
    baseGiB: 0.4,
    percent: 0.015,
    kvPerSequence: false,
    quantCacheWork: true,
    note: 'Consumer default on this site. Floor + 1.5% is a ROCm/Vulkan estimate, not measured on our rig.',
  },
  {
    id: 'strata',
    name: 'Strata',
    baseGiB: 0.6,
    percent: 0.02,
    kvPerSequence: false,
    quantCacheWork: false,
    note: 'First-party Flash path on our Pro rig. Overhead is an estimate; tok/s is measured only for the Flash Q6 badge.',
  },
  {
    id: 'ollama',
    name: 'Ollama',
    baseGiB: 0.9,
    percent: 0.03,
    kvPerSequence: true,
    quantCacheWork: false,
    note: 'Estimate. Ollama sizes KV per request. gfx1201 is still cited pain — see /backends/ollama.',
  },
  {
    id: 'lmstudio',
    name: 'LM Studio',
    baseGiB: 1,
    percent: 0.03,
    kvPerSequence: false,
    quantCacheWork: false,
    note: 'Estimate. Desktop wrapper around llama.cpp-class GGUF.',
  },
  {
    id: 'vllm',
    name: 'vLLM',
    baseGiB: 2,
    percent: 0.05,
    kvPerSequence: false,
    quantCacheWork: false,
    note: 'Estimate. Community try on this site; AMD 10.0 pin is 0.27 + PyTorch 2.13.',
  },
  {
    id: 'exllama',
    name: 'ExLlamaV2',
    baseGiB: 0.6,
    percent: 0.02,
    kvPerSequence: false,
    quantCacheWork: false,
    note: 'Estimate. Not the house daily driver. Confirm a gfx1201 HIP build before you trust a fit.',
  },
];

const AMD_BW = 'AMD-published peak memory bandwidth — not a measured tok/s.';

export const GPU_PRESETS: GpuPreset[] = [
  { id: 'r9700', name: 'Radeon AI PRO R9700', vramGb: 32, gfx: 'gfx1201', kind: 'discrete', bandwidthGBs: 640, bandwidthNote: AMD_BW },
  { id: 'rx9070xt', name: 'Radeon RX 9070 XT', vramGb: 16, gfx: 'gfx1201', kind: 'discrete', bandwidthGBs: 640, bandwidthNote: AMD_BW },
  { id: 'rx9070', name: 'Radeon RX 9070', vramGb: 16, gfx: 'gfx1201', kind: 'discrete', bandwidthGBs: 640, bandwidthNote: AMD_BW },
  { id: 'rx9070gre', name: 'Radeon RX 9070 GRE', vramGb: 12, gfx: 'gfx1201', kind: 'discrete', bandwidthGBs: 0, bandwidthNote: 'Confirm the SKU page — bandwidth is not listed here.' },
  { id: 'rx9060xt', name: 'Radeon RX 9060 XT 16GB', vramGb: 16, gfx: 'gfx1200', kind: 'discrete', bandwidthGBs: 0, bandwidthNote: 'Confirm the SKU page — 8 GB and 16 GB exist.' },
  { id: 'rx7900xtx', name: 'Radeon RX 7900 XTX', vramGb: 24, gfx: 'gfx1100', kind: 'discrete', bandwidthGBs: 960, bandwidthNote: AMD_BW },
  { id: 'rx7900xt', name: 'Radeon RX 7900 XT', vramGb: 20, gfx: 'gfx1100', kind: 'discrete', bandwidthGBs: 800, bandwidthNote: AMD_BW },
  { id: 'rx7900gre', name: 'Radeon RX 7900 GRE', vramGb: 16, gfx: 'gfx1100', kind: 'discrete', bandwidthGBs: 576, bandwidthNote: AMD_BW },
  { id: 'rx7800xt', name: 'Radeon RX 7800 XT', vramGb: 16, gfx: 'gfx1101', kind: 'discrete', bandwidthGBs: 624, bandwidthNote: AMD_BW },
  { id: 'rx7700xt', name: 'Radeon RX 7700 XT', vramGb: 12, gfx: 'gfx1101', kind: 'discrete', bandwidthGBs: 432, bandwidthNote: AMD_BW },
  { id: 'rx7600', name: 'Radeon RX 7600', vramGb: 8, gfx: 'gfx1102', kind: 'discrete', bandwidthGBs: 288, bandwidthNote: AMD_BW },
  { id: 'w7900', name: 'Radeon PRO W7900', vramGb: 48, gfx: 'gfx1100', kind: 'discrete', bandwidthGBs: 0, bandwidthNote: 'Workstation 48 GB. Enter bandwidth if you want a speed floor.' },
  { id: 'w7800', name: 'Radeon PRO W7800', vramGb: 32, gfx: 'gfx1100', kind: 'discrete', bandwidthGBs: 0, bandwidthNote: 'Confirm 32 GB vs 48 GB sticker.' },
  { id: 'w6800', name: 'Radeon PRO W6800', vramGb: 32, gfx: 'gfx1030', kind: 'discrete', bandwidthGBs: 512, bandwidthNote: AMD_BW },
  { id: 'unified', name: 'Unified memory (APU / iGPU)', vramGb: 32, gfx: '', kind: 'unified', bandwidthGBs: 0, bandwidthNote: 'macOS / Ryzen AI lend the GPU a slice of one pool. Default usable is 70% — an estimate, not a Metal reading.' },
  { id: 'custom', name: 'Custom GPU', vramGb: 24, gfx: '', kind: 'discrete', bandwidthGBs: 0, bandwidthNote: 'Enter VRAM and optional bandwidth from the product page.' },
];

export const MODEL_PRESETS: ModelPreset[] = [
  {
    id: 'qwen36',
    group: 'Qwen (house)',
    name: 'Qwen3.6-35B-A3B',
    official: 'Qwen/Qwen3.6-35B-A3B',
    gguf: 'unsloth/Qwen3.6-35B-A3B-GGUF',
    totalParamsB: 35,
    activeParamsB: 3,
    layers: 40,
    kvLayers: 10,
    kvHeads: 2,
    headDim: 256,
    kvKind: 'gqa',
    mlaDim: null,
    mlaTensors: 1,
    windowLayers: null,
    windowTokens: null,
    embedVocab: 248320,
    embedHidden: 2048,
    embedTied: false,
    separableParamsB: null,
    defaultQuant: 'q5_k_m',
    defaultCtx: 262144,
    defaultKv: 'f16',
    archNote:
      'Official card: 35B total / 3B active, 40 layers, 10 full-attention (GQA 2×256). Only those 10 layers grow a token-length KV cache.',
    publisherFiles: {
      q3_k_s: { decimalGb: 15.4, label: 'Hugging Face listing for Qwen3.6-35B-A3B-UD-Q3_K_S.gguf (15.4 GB)' },
      q3_k_m: { decimalGb: 16.6, label: 'Hugging Face listing for Qwen3.6-35B-A3B-UD-Q3_K_M.gguf (16.6 GB)' },
      q3_k_xl: { decimalGb: 16.8, label: 'Hugging Face listing for Qwen3.6-35B-A3B-UD-Q3_K_XL.gguf (16.8 GB)' },
      iq3: { decimalGb: 13.7, label: 'Hugging Face listing for Qwen3.6-35B-A3B-UD-IQ3_S.gguf (13.7 GB)' },
      q5_k_m: { decimalGb: 26.6, label: 'Hugging Face listing for Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf (26.6 GB)' },
    },
  },
  {
    id: 'flash',
    group: 'Qwen (house)',
    name: 'Qwen 3.8 Flash',
    official: 'Qwen/Qwen3.8-Flash-Next',
    gguf: 'unsloth/Qwen3.8-Flash-Next-GGUF',
    totalParamsB: 125,
    activeParamsB: 6,
    layers: 48,
    kvLayers: 12,
    kvHeads: 2,
    headDim: 256,
    kvKind: 'gqa',
    mlaDim: null,
    mlaTensors: 1,
    windowLayers: null,
    windowTokens: null,
    embedVocab: 248320,
    embedHidden: 2560,
    embedTied: false,
    separableParamsB: 51.2,
    defaultQuant: 'q6_k',
    defaultCtx: 262144,
    defaultKv: 'f16',
    archNote:
      'Official card (Qwen3.8-Flash-Next): 125B total / 6B active, plus a 51B n-gram embedding llama.cpp can keep in system RAM. 48 layers, 12 sparse-attention layers (GQA 2×256). Publisher UD-Q6_K_XL folder lists ~169 GB.',
    publisherFiles: {
      q3_k_xl: {
        decimalGb: 90,
        label: 'Hugging Face folder listing for UD-Q3_K_XL (~90 GB across 3 shards; LFS sizes sum 89.99 GB)',
      },
      iq3: {
        decimalGb: 81.96,
        label: 'Hugging Face LFS sizes for UD-IQ3_XXS (81.96 GB across 3 shards). Estimate / community — not measured on local-desktop',
      },
      q4_k_m: {
        decimalGb: 111,
        label: 'Hugging Face folder listing for UD-Q4_K_XL (~111 GB across 4 shards). Unsloth docs list 111.3 GB (retrieved 2026-10-13)',
      },
      q5_k_m: {
        decimalGb: 158.3,
        label: 'Unsloth docs listing for UD-Q5_K_XL (158.3 GB). Hugging Face folder lists 158 GB across 6 shards (retrieved 2026-10-13)',
      },
      q6_k: { decimalGb: 169, label: 'Hugging Face folder listing for UD-Q6_K_XL (~169 GB across 6 shards)' },
    },
  },
  {
    id: 'qwen38-27b',
    group: 'Qwen',
    name: 'Qwen3.8 27B',
    official: 'Qwen/Qwen3.8-27B',
    gguf: '',
    totalParamsB: 27.8,
    activeParamsB: 27.8,
    layers: 64,
    kvLayers: 16,
    kvHeads: 4,
    headDim: 256,
    kvKind: 'gqa',
    mlaDim: null,
    mlaTensors: 1,
    windowLayers: null,
    windowTokens: null,
    embedVocab: 248320,
    embedHidden: 5120,
    embedTied: false,
    separableParamsB: null,
    defaultQuant: 'q4_k_m',
    defaultCtx: 8192,
    defaultKv: 'f16',
    archNote: 'Official card: 16 of 64 layers are full attention (GQA 4×256). The rest hold a fixed recurrent state, so KV grows on those 16 layers. 262K native.',
    publisherFiles: {},
  },
  {
    id: 'qwen36-27b',
    group: 'Qwen',
    name: 'Qwen3.6 27B',
    official: 'Qwen/Qwen3.6-27B',
    gguf: '',
    totalParamsB: 27.78,
    activeParamsB: 27.78,
    layers: 64,
    kvLayers: 16,
    kvHeads: 4,
    headDim: 256,
    kvKind: 'gqa',
    mlaDim: null,
    mlaTensors: 1,
    windowLayers: null,
    windowTokens: null,
    embedVocab: 248320,
    embedHidden: 5120,
    embedTied: false,
    separableParamsB: null,
    defaultQuant: 'q4_k_m',
    defaultCtx: 8192,
    defaultKv: 'f16',
    archNote: 'Official card: 16 of 64 layers full attention. Same hybrid KV idea as Qwen3.8 27B.',
    publisherFiles: {},
  },
  {
    id: 'qwen35-27b',
    group: 'Qwen',
    name: 'Qwen3.5 27B',
    official: 'Qwen/Qwen3.5-27B',
    gguf: '',
    totalParamsB: 27.78,
    activeParamsB: 27.78,
    layers: 64,
    kvLayers: 16,
    kvHeads: 4,
    headDim: 256,
    kvKind: 'gqa',
    mlaDim: null,
    mlaTensors: 1,
    windowLayers: null,
    windowTokens: null,
    embedVocab: 248320,
    embedHidden: 5120,
    embedTied: false,
    separableParamsB: null,
    defaultQuant: 'q4_k_m',
    defaultCtx: 8192,
    defaultKv: 'f16',
    archNote: 'Official card: 16 of 64 layers full attention (GQA 4×256).',
    publisherFiles: {},
  },
  {
    id: 'qwen35-9b',
    group: 'Qwen',
    name: 'Qwen3.5 9B',
    official: 'Qwen/Qwen3.5-9B',
    gguf: '',
    totalParamsB: 9.65,
    activeParamsB: 9.65,
    layers: 32,
    kvLayers: 8,
    kvHeads: 4,
    headDim: 256,
    kvKind: 'gqa',
    mlaDim: null,
    mlaTensors: 1,
    windowLayers: null,
    windowTokens: null,
    embedVocab: 248320,
    embedHidden: 4096,
    embedTied: false,
    separableParamsB: null,
    defaultQuant: 'q5_k_m',
    defaultCtx: 8192,
    defaultKv: 'f16',
    archNote: 'Official card: 8 of 32 layers full attention. Not an 8B Qwen 3.x dense — that older name is not on this site.',
    publisherFiles: {},
  },
  {
    id: 'qwen3-32b',
    group: 'Qwen',
    name: 'Qwen3 32B',
    official: 'Qwen/Qwen3-32B',
    gguf: '',
    totalParamsB: 32.5,
    activeParamsB: 32.5,
    layers: 64,
    kvLayers: 64,
    kvHeads: 8,
    headDim: 128,
    kvKind: 'gqa',
    mlaDim: null,
    mlaTensors: 1,
    windowLayers: null,
    windowTokens: null,
    embedVocab: 151936,
    embedHidden: 5120,
    embedTied: false,
    separableParamsB: null,
    defaultQuant: 'q4_k_m',
    defaultCtx: 8192,
    defaultKv: 'f16',
    archNote: 'Dense Qwen3 32B. Full-attention KV on every layer.',
    publisherFiles: {},
  },
  {
    id: 'qwen3-14b',
    group: 'Qwen',
    name: 'Qwen3 14B',
    official: 'Qwen/Qwen3-14B',
    gguf: '',
    totalParamsB: 14.77,
    activeParamsB: 14.77,
    layers: 40,
    kvLayers: 40,
    kvHeads: 8,
    headDim: 128,
    kvKind: 'gqa',
    mlaDim: null,
    mlaTensors: 1,
    windowLayers: null,
    windowTokens: null,
    embedVocab: 151936,
    embedHidden: 5120,
    embedTied: false,
    separableParamsB: null,
    defaultQuant: 'q5_k_m',
    defaultCtx: 8192,
    defaultKv: 'f16',
    archNote: 'Dense Qwen3 14B. Full-attention KV on every layer.',
    publisherFiles: {},
  },
  {
    id: 'qwen3-30b-a3b',
    group: 'Qwen',
    name: 'Qwen3 30B-A3B',
    official: 'Qwen/Qwen3-30B-A3B',
    gguf: '',
    totalParamsB: 30,
    activeParamsB: 3,
    layers: 48,
    kvLayers: 48,
    kvHeads: 4,
    headDim: 128,
    kvKind: 'gqa',
    mlaDim: null,
    mlaTensors: 1,
    windowLayers: null,
    windowTokens: null,
    embedVocab: 151936,
    embedHidden: 2048,
    embedTied: false,
    separableParamsB: null,
    defaultQuant: 'q4_k_m',
    defaultCtx: 8192,
    defaultKv: 'f16',
    archNote: 'MoE: 30B total / 3B active. Weights use the total; decode traffic uses the active count.',
    publisherFiles: {},
  },
  {
    id: 'qwen3-235b-a22b',
    group: 'Qwen',
    name: 'Qwen3 235B-A22B',
    official: 'Qwen/Qwen3-235B-A22B',
    gguf: '',
    totalParamsB: 235,
    activeParamsB: 22,
    layers: 94,
    kvLayers: 94,
    kvHeads: 4,
    headDim: 128,
    kvKind: 'gqa',
    mlaDim: null,
    mlaTensors: 1,
    windowLayers: null,
    windowTokens: null,
    embedVocab: 151936,
    embedHidden: 4096,
    embedTied: false,
    separableParamsB: null,
    defaultQuant: 'q4_k_m',
    defaultCtx: 8192,
    defaultKv: 'f16',
    archNote: 'Large MoE. Expect multi-GPU or RAM offload on consumer Radeon.',
    publisherFiles: {},
  },
  {
    id: 'llama33-70b',
    group: 'Llama',
    name: 'Llama 3.3 70B',
    official: 'meta-llama/Llama-3.3-70B-Instruct',
    gguf: '',
    totalParamsB: 70.6,
    activeParamsB: 70.6,
    layers: 80,
    kvLayers: 80,
    kvHeads: 8,
    headDim: 128,
    kvKind: 'gqa',
    mlaDim: null,
    mlaTensors: 1,
    windowLayers: null,
    windowTokens: null,
    embedVocab: 128256,
    embedHidden: 8192,
    embedTied: false,
    separableParamsB: null,
    defaultQuant: 'q4_k_m',
    defaultCtx: 8192,
    defaultKv: 'f16',
    archNote: 'Dense 70B, GQA 8×128, full-attention KV on 80 layers.',
    publisherFiles: {},
  },
  {
    id: 'llama31-70b',
    group: 'Llama',
    name: 'Llama 3.1 70B',
    official: 'meta-llama/Llama-3.1-70B-Instruct',
    gguf: '',
    totalParamsB: 70.6,
    activeParamsB: 70.6,
    layers: 80,
    kvLayers: 80,
    kvHeads: 8,
    headDim: 128,
    kvKind: 'gqa',
    mlaDim: null,
    mlaTensors: 1,
    windowLayers: null,
    windowTokens: null,
    embedVocab: 128256,
    embedHidden: 8192,
    embedTied: false,
    separableParamsB: null,
    defaultQuant: 'q4_k_m',
    defaultCtx: 8192,
    defaultKv: 'f16',
    archNote: 'Dense 70B, same GQA shape as Llama 3.3 70B.',
    publisherFiles: {},
  },
  {
    id: 'llama31-8b',
    group: 'Llama',
    name: 'Llama 3.1 8B',
    official: 'meta-llama/Llama-3.1-8B-Instruct',
    gguf: '',
    totalParamsB: 8.03,
    activeParamsB: 8.03,
    layers: 32,
    kvLayers: 32,
    kvHeads: 8,
    headDim: 128,
    kvKind: 'gqa',
    mlaDim: null,
    mlaTensors: 1,
    windowLayers: null,
    windowTokens: null,
    embedVocab: 128256,
    embedHidden: 4096,
    embedTied: false,
    separableParamsB: null,
    defaultQuant: 'q5_k_m',
    defaultCtx: 8192,
    defaultKv: 'f16',
    archNote: 'Dense 8B Llama — not an 8B Qwen 3.x dense. Q3 is an estimate unless a publisher file is listed.',
    publisherFiles: {},
  },
  {
    id: 'gemma3-27b',
    group: 'Gemma',
    name: 'Gemma 3 27B',
    official: 'google/gemma-3-27b-it',
    gguf: '',
    totalParamsB: 27.4,
    activeParamsB: 27.4,
    layers: 62,
    kvLayers: 10,
    kvHeads: 16,
    headDim: 128,
    kvKind: 'gqa',
    mlaDim: null,
    mlaTensors: 1,
    windowLayers: 52,
    windowTokens: 1024,
    embedVocab: 262208,
    embedHidden: 5376,
    embedTied: true,
    separableParamsB: null,
    defaultQuant: 'q4_k_m',
    defaultCtx: 8192,
    defaultKv: 'f16',
    archNote: 'Gemma 3 report: hybrid sliding window — 10 global layers, 52 cache a 1024-token window.',
    publisherFiles: {},
  },
  {
    id: 'gemma4-31b',
    group: 'Gemma',
    name: 'Gemma 4 31B',
    official: 'google/gemma-4-31b',
    gguf: '',
    totalParamsB: 31,
    activeParamsB: 31,
    layers: 60,
    kvLayers: 10,
    kvHeads: 4,
    headDim: 512,
    kvKind: 'gqa',
    mlaDim: null,
    mlaTensors: 1,
    windowLayers: 50,
    windowTokens: 1024,
    embedVocab: 262144,
    embedHidden: 5376,
    embedTied: true,
    separableParamsB: null,
    defaultQuant: 'q4_k_m',
    defaultCtx: 8192,
    defaultKv: 'f16',
    archNote: 'Official GGUF metadata: 10 global layers (4 KV heads × 512), 50 sliding-window layers at 1024 tokens.',
    publisherFiles: {},
  },
  {
    id: 'gemma4-12b',
    group: 'Gemma',
    name: 'Gemma 4 12B',
    official: 'google/gemma-4-12b',
    gguf: '',
    totalParamsB: 12.1,
    activeParamsB: 12.1,
    layers: 48,
    kvLayers: 8,
    kvHeads: 1,
    headDim: 512,
    kvKind: 'gqa',
    mlaDim: null,
    mlaTensors: 1,
    windowLayers: 40,
    windowTokens: 1024,
    embedVocab: 262144,
    embedHidden: 3840,
    embedTied: true,
    separableParamsB: null,
    defaultQuant: 'q5_k_m',
    defaultCtx: 8192,
    defaultKv: 'f16',
    archNote: 'Official GGUF metadata: 8 global layers (one 512-dim KV head), 40 layers cache a 1024-token window.',
    publisherFiles: {},
  },
  {
    id: 'gpt-oss-20b',
    group: 'gpt-oss',
    name: 'gpt-oss 20B',
    official: 'openai/gpt-oss-20b',
    gguf: '',
    totalParamsB: 21.5,
    activeParamsB: 3.6,
    layers: 24,
    kvLayers: 12,
    kvHeads: 8,
    headDim: 64,
    kvKind: 'gqa',
    mlaDim: null,
    mlaTensors: 1,
    windowLayers: 12,
    windowTokens: 128,
    embedVocab: 201088,
    embedHidden: 2880,
    embedTied: false,
    separableParamsB: null,
    defaultQuant: 'q4_k_m',
    defaultCtx: 8192,
    defaultKv: 'f16',
    archNote: 'MoE 21.5B / 3.6B active. Alternating attention: 12 full-context layers, 12 at a 128-token window. Native MXFP4 on disk is not a Q3; GGUF Q3 rows here are formula estimates.',
    publisherFiles: {},
  },
  {
    id: 'gpt-oss-120b',
    group: 'gpt-oss',
    name: 'gpt-oss 120B',
    official: 'openai/gpt-oss-120b',
    gguf: '',
    totalParamsB: 120.4,
    activeParamsB: 5.1,
    layers: 36,
    kvLayers: 18,
    kvHeads: 8,
    headDim: 64,
    kvKind: 'gqa',
    mlaDim: null,
    mlaTensors: 1,
    windowLayers: 18,
    windowTokens: 128,
    embedVocab: 201088,
    embedHidden: 2880,
    embedTied: false,
    separableParamsB: null,
    defaultQuant: 'q4_k_m',
    defaultCtx: 8192,
    defaultKv: 'f16',
    archNote: 'MoE 120B / 5.1B active. 18 full-context layers, 18 at a 128-token window.',
    publisherFiles: {},
  },
  {
    id: 'custom',
    group: 'Custom',
    name: 'Custom model',
    official: '',
    gguf: '',
    totalParamsB: 35,
    activeParamsB: 3,
    layers: 40,
    kvLayers: 40,
    kvHeads: 8,
    headDim: 128,
    kvKind: 'gqa',
    mlaDim: null,
    mlaTensors: 1,
    windowLayers: null,
    windowTokens: null,
    embedVocab: null,
    embedHidden: null,
    embedTied: true,
    separableParamsB: null,
    defaultQuant: 'q5_k_m',
    defaultCtx: 32768,
    defaultKv: 'f16',
    archNote: 'Enter total / active params and KV dims from the model card. If every layer is full attention, set KV layers = hidden layers. MLA: set kind to MLA and the compressed dim.',
    publisherFiles: {},
  },
];

export const CONTEXT_PRESETS = [2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288] as const;

export const DEFAULT_INPUT: CalcInput = {
  view: 'model',
  gpuId: 'r9700',
  vramGb: 32,
  gpuCount: 1,
  split: false,
  ramGb: 256,
  kind: 'discrete',
  usablePct: 100,
  bandwidthGBs: 640,
  efficiency: 0.75,
  desktopSpare: true,
  modelId: 'qwen36',
  totalParamsB: 35,
  activeParamsB: 3,
  layers: 40,
  kvLayers: 10,
  kvHeads: 2,
  headDim: 256,
  kvKind: 'gqa',
  mlaDim: 0,
  mlaTensors: 1,
  windowLayers: 0,
  windowTokens: 0,
  embedVocab: 248320,
  embedHidden: 2048,
  embedTied: false,
  separableParamsB: 0,
  separableEmbed: false,
  fileWeightGiB: null,
  quantId: 'q5_k_m',
  context: 262144,
  kvId: 'f16',
  backendId: 'llamacpp',
  pathId: 'vulkan',
  batch: 1,
  overheadGiB: 1,
  overheadManual: false,
};

const MODEL_IDS = MODEL_PRESETS.map((m) => m.id);
const GPU_IDS = GPU_PRESETS.map((g) => g.id);
const QUANT_IDS = QUANTS.map((q) => q.id);
const KV_IDS = KV_TYPES.map((k) => k.id);
const BACKEND_IDS = BACKENDS.map((b) => b.id);

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
  return MODEL_PRESETS.find((m) => m.id === id) ?? MODEL_PRESETS[MODEL_PRESETS.length - 1];
}

export function backendById(id: BackendId): BackendPreset {
  return BACKENDS.find((b) => b.id === id) ?? BACKENDS[0];
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

export function formulaMlaGiB(layers: number, dim: number, tensors: number, context: number, bytes: number): number {
  if (!(layers > 0) || !(dim > 0) || !(tensors > 0) || !(context > 0) || !(bytes > 0)) return 0;
  return (layers * dim * tensors * context * bytes) / GIB;
}

function pathAddGiB(pathId: PathId): number {
  return pathId === 'hip' ? 0.1 : 0;
}

export function backendOverheadGiB(input: CalcInput, weightsGiB: number, kvGiB: number): { gib: number; note: string } {
  const backend = backendById(input.backendId);
  const base = backend.baseGiB + pathAddGiB(input.pathId);
  const gib = base + backend.percent * (weightsGiB + kvGiB);
  const path = input.backendId === 'llamacpp' ? ` · ${input.pathId === 'hip' ? 'HIP' : 'Vulkan'} path` : '';
  return {
    gib,
    note: `${backend.name}${path}: ${base.toFixed(2)} GiB + ${(backend.percent * 100).toFixed(1)}% of weights+KV. ${backend.note}`,
  };
}

function embedTableGiB(input: CalcInput): number {
  const quant = quantById(input.quantId);
  if (input.separableParamsB > 0) {
    return formulaWeightsGiB(input.separableParamsB, quant.bpw);
  }
  if (input.embedTied || !(input.embedVocab > 0) || !(input.embedHidden > 0)) return 0;
  return (input.embedVocab * input.embedHidden * (quant.bpw / 8)) / GIB;
}

function weightsFor(input: CalcInput): { gib: number; source: 'publisher' | 'file' | 'formula'; note: string } {
  const quant = quantById(input.quantId);
  if (input.fileWeightGiB != null && input.fileWeightGiB > 0) {
    let gib = input.fileWeightGiB;
    let note = `GGUF file size on disk (${formatGiB(gib)} GiB). Header only was read; the file stayed on this machine.`;
    if (input.separableEmbed) {
      const table = embedTableGiB(input);
      if (table > 0) {
        gib = Math.max(0, gib - table);
        note += ` Separable table hosted in RAM (estimate −${formatGiB(table)} GiB).`;
      }
    }
    return { gib, source: 'file', note };
  }
  const model = modelById(input.modelId);
  const listed = input.modelId !== 'custom' ? model.publisherFiles[input.quantId] : undefined;
  if (listed) {
    let gib = decimalGbToGiB(listed.decimalGb);
    let note = `${listed.label}. Converted ${listed.decimalGb} × 10⁹ bytes → GiB. Not measured VRAM.`;
    if (input.separableEmbed) {
      const table = embedTableGiB(input);
      if (table > 0) {
        gib = Math.max(0, gib - table);
        note += ` Separable table hosted in RAM (estimate −${formatGiB(table)} GiB).`;
      }
    }
    return { gib, source: 'publisher', note };
  }
  let gib = formulaWeightsGiB(input.totalParamsB, quant.bpw);
  let note = `Estimate: total_params × ${quant.bpw} bpw (${quant.bpwNote}) / 8. Active params do not shrink the file.`;
  if (input.separableEmbed) {
    const table = embedTableGiB(input);
    if (table > 0) {
      gib = Math.max(0, gib - table);
      note += ` Separable table hosted in RAM (estimate −${formatGiB(table)} GiB).`;
    }
  }
  return { gib, source: 'formula', note };
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
    kvKind: model.kvKind,
    mlaDim: model.mlaDim ?? 0,
    mlaTensors: model.mlaTensors,
    windowLayers: model.windowLayers ?? 0,
    windowTokens: model.windowTokens ?? 0,
    embedVocab: model.embedVocab ?? 0,
    embedHidden: model.embedHidden ?? 0,
    embedTied: model.embedTied,
    separableParamsB: model.separableParamsB ?? 0,
    fileWeightGiB: id === 'custom' ? current.fileWeightGiB : null,
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
    vramGb: id === 'custom' || id === 'unified' ? current.vramGb : gpu.vramGb,
    kind: gpu.kind,
    usablePct: gpu.kind === 'unified' ? (current.gpuId === 'unified' ? current.usablePct : 70) : 100,
    bandwidthGBs: gpu.bandwidthGBs || current.bandwidthGBs,
  };
}

function kvReady(input: CalcInput): boolean {
  if (input.kvKind === 'mla') return input.kvLayers > 0 && input.mlaDim > 0 && input.context > 0;
  return input.kvLayers > 0 && input.kvHeads > 0 && input.headDim > 0 && input.context > 0;
}

export function kvCacheGiB(input: CalcInput): { gib: number; note: string } {
  const kv = kvById(input.kvId);
  const backend = backendById(input.backendId);
  const sequences = backend.kvPerSequence ? Math.max(1, Math.round(input.batch)) : 1;
  let gib = 0;
  const parts: string[] = [];

  if (input.kvKind === 'mla') {
    const one = formulaMlaGiB(input.kvLayers, input.mlaDim, Math.max(1, input.mlaTensors), input.context, kv.bytes);
    gib += one * sequences;
    parts.push(`MLA ${input.kvLayers} × ${input.mlaDim} × ${Math.max(1, input.mlaTensors)} × ${input.context} × ${kv.bytes} B`);
  } else {
    const full = formulaKvGiB(input.kvLayers, input.kvHeads, input.headDim, input.context, kv.bytes);
    gib += full * sequences;
    parts.push(`2 × ${input.kvLayers} full layers × ${input.kvHeads} × ${input.headDim} × ${input.context} × ${kv.bytes} B`);
    if (input.windowLayers > 0 && input.windowTokens > 0) {
      const win = formulaKvGiB(
        input.windowLayers,
        input.kvHeads,
        input.headDim,
        Math.min(input.context, input.windowTokens),
        kv.bytes,
      );
      gib += win * sequences;
      parts.push(`2 × ${input.windowLayers} window layers × min(${input.context}, ${input.windowTokens})`);
    }
  }

  if (backend.quantCacheWork && input.kvId !== 'f16' && input.kvLayers > 0) {
    const work =
      input.kvKind === 'mla'
        ? formulaMlaGiB(1, input.mlaDim, Math.max(1, input.mlaTensors), input.context, 2)
        : formulaKvGiB(1, input.kvHeads, input.headDim, input.context, 2);
    gib += work;
    parts.push('llama.cpp working layer at f16 (estimate)');
  }

  if (backend.kvPerSequence && input.batch > 1) {
    parts.push(`${input.batch} concurrent sequences (this backend sizes KV per request)`);
  } else if (input.batch > 1) {
    parts.push(`${input.batch} sequences share one pool at this context`);
  }

  return { gib, note: `Estimate: ${parts.join(' + ')}.` };
}

function totalFor(input: CalcInput): {
  weights: ReturnType<typeof weightsFor>;
  kv: ReturnType<typeof kvCacheGiB>;
  overhead: { gib: number; note: string };
  totalGiB: number;
} {
  const weights = weightsFor(input);
  const kv = kvReady(input) ? kvCacheGiB(input) : { gib: 0, note: 'Enter KV layers, heads, and head dim for a KV estimate. Weights still compute.' };
  const overhead = input.overheadManual
    ? { gib: Math.max(0, input.overheadGiB), note: 'Manual overhead override. Still an estimate unless a tested badge applies.' }
    : backendOverheadGiB(input, weights.gib, kv.gib);
  return { weights, kv, overhead, totalGiB: weights.gib + kv.gib + overhead.gib };
}

export function spareFactor(input: CalcInput): number {
  if (!input.desktopSpare) return 1;
  const n = Math.min(4, Math.max(1, Math.round(input.gpuCount)));
  if (!input.split || n === 1) return 1.05;
  if (input.vramGb <= 16) return n === 2 ? 1.15 : 1.35;
  if (input.vramGb <= 23) return n === 2 ? 1.15 : 1.2;
  if (n === 2) return 1.1;
  if (n === 3) return 1.15;
  return 1.18;
}

function usablePoolGb(input: CalcInput): { available: number; usable: number; perGpu: number; overflow: number } {
  const n = Math.min(4, Math.max(1, Math.round(input.gpuCount)));
  const slice = input.kind === 'unified' ? input.vramGb * (Math.min(100, Math.max(10, input.usablePct)) / 100) : input.vramGb;
  const available = input.split ? slice * n : slice;
  return { available, usable: slice, perGpu: 0, overflow: 0 };
}

function overflowOf(input: CalcInput, totalGiB: number): { available: number; usable: number; perGpu: number; overflow: number } {
  const n = Math.min(4, Math.max(1, Math.round(input.gpuCount)));
  const pool = usablePoolGb(input);
  const perGpu = input.split ? totalGiB / n : totalGiB;
  return { ...pool, perGpu, overflow: Math.max(0, totalGiB - pool.available) };
}

export function roundUpToDimmKitGb(rawGiB: number): number {
  if (!(rawGiB > 0)) return DIMM_KIT_GB[0];
  for (const kit of DIMM_KIT_GB) {
    if (kit + 1e-9 >= rawGiB) return kit;
  }
  return DIMM_KIT_GB[DIMM_KIT_GB.length - 1];
}

export function modelFullContext(input: CalcInput): number {
  const model = modelById(input.modelId);
  if (input.modelId !== 'custom' && model.defaultCtx > 0) return model.defaultCtx;
  return Math.max(input.context, 262144);
}

function systemRamLine(input: CalcInput): SystemRamLine {
  const { weights, kv, overhead } = totalFor(input);
  const { available } = usablePoolGb(input);
  const embedRam = input.separableEmbed ? embedTableGiB(input) : 0;
  let vramLeft = Math.max(0, available);
  const weightsOnGpu = Math.min(weights.gib, vramLeft);
  vramLeft -= weightsOnGpu;
  const kvOnGpu = Math.min(kv.gib, vramLeft);
  vramLeft -= kvOnGpu;

  const breakdown: SystemRamBreakdown = {
    offloadedWeightsGiB: weights.gib - weightsOnGpu,
    separableEmbedGiB: embedRam,
    kvInRamGiB: kv.gib - kvOnGpu,
    runtimeOverheadGiB: overhead.gib,
    osDesktopGiB: OS_DESKTOP_BASELINE_GIB,
    headroomGiB: RAM_HEADROOM_GIB,
  };
  const rawGiB =
    breakdown.offloadedWeightsGiB +
    breakdown.separableEmbedGiB +
    breakdown.kvInRamGiB +
    breakdown.runtimeOverheadGiB +
    breakdown.osDesktopGiB +
    breakdown.headroomGiB;
  const kitGb = roundUpToDimmKitGb(rawGiB);
  const measured = local-desktop_MEASURED_RAM_GIB != null;
  const local-desktop =
    kitGb === local-desktop_DDR5_GB || rawGiB > 128
      ? ` local-desktop ships ${local-desktop_DDR5_GB} GB DDR5; measured host-RAM usage is not recorded until Local AI numbers arrive.`
      : '';
  return {
    context: input.context,
    rawGiB,
    kitGb,
    measured,
    label: measured ? 'measured' : 'estimate',
    note: measured
      ? `Measured on our rig — ${local-desktop_MEASURED_RAM_GIB} GiB used on the ${local-desktop_DDR5_GB} GB DDR5 kit.`
      : `Estimate. Offloaded weights + KV in RAM + runtime + OS/desktop + headroom, rounded up to a ${kitGb} GB DIMM kit.${local-desktop}`,
    breakdown,
  };
}

const CALC_QUANT_TO_RUN: Partial<Record<QuantId, string[]>> = {
  q5_k_m: ['UD-Q5_K_XL', 'Q5_K_M'],
  q4_k_m: ['Q4_K_M'],
  q6_k: ['Q6_K'],
};

export function matchMeasuredRam(input: CalcInput, hits: MeasuredRamHit[]): MeasuredRamHit[] {
  if (input.modelId !== 'qwen36') return [];
  if (input.backendId !== 'llamacpp') return [];
  if (input.kvId !== 'f16') return [];
  if (input.gpuId !== 'r9700') return [];
  if (input.pathId !== 'vulkan') return [];
  if (input.gpuCount > 1 && !input.split) return [];
  const split = Boolean(input.split && input.gpuCount > 1);
  const gpuCount = split ? Math.min(4, Math.max(1, Math.round(input.gpuCount))) : 1;
  const quants = CALC_QUANT_TO_RUN[input.quantId] ?? [];
  const pool = hits.filter(
    (hit) =>
      hit.context === input.context &&
      hit.gpuCount === gpuCount &&
      hit.split === split &&
      hit.backendId === input.backendId &&
      quants.includes(hit.quant),
  );
  for (const quant of quants) {
    const found = pool.filter((hit) => hit.quant === quant);
    if (found.length) return found;
  }
  return [];
}

export function applyMeasuredRamLine(line: SystemRamLine, hits: MeasuredRamHit[]): SystemRamLine {
  if (!hits.length) return line;
  const peakGbs = hits.map((hit) => hit.peakGb);
  const runIds = hits.map((hit) => hit.runId);
  const shown = [...new Set(peakGbs)].join(' / ');
  return {
    ...line,
    measured: true,
    label: 'measured',
    rawGiB: peakGbs[0]!,
    kitGb: roundUpToDimmKitGb(Math.max(...peakGbs)),
    peakGbs,
    runIds,
    note: `Measured peak system RAM on local-desktop: ${shown} GB (Linux GiB labeled GB). Measured, pending re-verify after RAM fix.`,
  };
}

export function systemRamNeed(input: CalcInput, hits: MeasuredRamHit[] = []): SystemRamNeed {
  const fullContext = modelFullContext(input);
  const selectedInput = input;
  const fullInput = { ...input, context: fullContext };
  return {
    atSelected: applyMeasuredRamLine(systemRamLine(selectedInput), matchMeasuredRam(selectedInput, hits)),
    atFullContext: applyMeasuredRamLine(systemRamLine(fullInput), matchMeasuredRam(fullInput, hits)),
    fullContext,
  };
}

export function formatKitGb(n: number): string {
  return `${n} GB kit`;
}

function verdictOf(totalGiB: number, available: number, factor: number): { verdict: Verdict; label: string } {
  if (totalGiB > available + 1e-9) return { verdict: 'no', label: 'Does not fit this GPU' };
  if (totalGiB * factor > available + 1e-9) return { verdict: 'tight', label: 'Tight — little desktop headroom' };
  return { verdict: 'fits', label: 'Fits in VRAM (estimate)' };
}

export function fitsInVram(input: CalcInput): boolean {
  const { totalGiB } = totalFor(input);
  const { available } = overflowOf(input, totalGiB);
  return totalGiB * spareFactor(input) <= available + 1e-6;
}

function fitsVram(input: CalcInput): boolean {
  return fitsInVram(input);
}

export function bestQuantThatFits(input: CalcInput): Quant | null {
  const ranked = [...QUANTS].sort((a, b) => b.bpw - a.bpw);
  for (const quant of ranked) {
    if (fitsVram({ ...input, quantId: quant.id, fileWeightGiB: input.modelId === 'custom' ? input.fileWeightGiB : null })) {
      return quant;
    }
  }
  return null;
}

export function maxContextThatFits(input: CalcInput, cap = 524288): number | null {
  if (!kvReady(input)) return null;
  const loStart = 2048;
  if (!fitsVram({ ...input, context: loStart })) return null;
  let lo = loStart;
  let hi = cap;
  let best = loStart;
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

export function testedBadge(input: CalcInput): TestedBadge | null {
  const r9700 = input.gpuId === 'r9700' && input.vramGb === 32;
  if (!r9700 || input.kvId !== 'f16') return null;

  if (input.modelId === 'flash' && input.quantId === 'q6_k' && input.context === 262144) {
    return {
      id: 'fast',
      label: `${MEASURED_ON_OUR_RIG} — fast agent (Strata v0.1.42, 262K; ~32.6 tok/s vs llama.cpp ~16; VRAM not measured)`,
    };
  }

  if (input.modelId !== 'qwen36' || input.gpuCount !== 1 || input.split) return null;

  if (input.quantId === 'q5_k_m') {
    let focus: string;
    if (input.context === 262144) {
      focus = 'UD-Q5_K_XL decode 44.4 tok/s at 256K (also 102.39 at short context, 90.52 at 32K, 66.43 at 128K)';
    } else if (input.context === 131072) {
      focus = 'UD-Q5_K_XL decode 66.43 tok/s at 128K (also 102.39 at short context, 90.52 at 32K, 44.4 at 256K)';
    } else if (input.context === 32768) {
      focus = 'UD-Q5_K_XL decode 90.52 tok/s at 32K (also 102.39 at short context, 66.43 at 128K, 44.4 at 256K)';
    } else if (input.context <= 8192) {
      focus = 'UD-Q5_K_XL decode 102.39 tok/s at short context (also 90.52 at 32K, 66.43 at 128K, 44.4 at 256K)';
    } else {
      focus = 'UD-Q5_K_XL decode 102.39 tok/s short / 90.52 at 32K / 66.43 at 128K / 44.4 at 256K (this exact context was not a bench point)';
    }
    return {
      id: 'daily',
      label: `${MEASURED_ON_OUR_RIG} — ${focus}. Q5_K_M sibling 109.73 tok/s (24.68 GB VRAM). One R9700, llama.cpp, f16 KV.`,
    };
  }

  if (input.quantId === 'q4_k_m') {
    return {
      id: 'q4',
      label: `${MEASURED_ON_OUR_RIG} — Q4_K_M decode 117.69 tok/s; prefill 1902.1 tok/s at 32K. One R9700, llama.cpp, f16 KV.`,
    };
  }

  if (input.quantId === 'q6_k') {
    return {
      id: 'q6',
      label: `${MEASURED_ON_OUR_RIG} — Q6_K 4K decode 82.62 / 103.23 tok/s (two repeats, flagged for re-run). 32K+ is partly offloaded to DDR5. One R9700, llama.cpp, f16 KV.`,
    };
  }

  return null;
}

function matchingGpus(input: CalcInput, totalGiB: number): MatchingGpu[] {
  const rows: MatchingGpu[] = [];
  for (const gpu of GPU_PRESETS) {
    if (gpu.id === 'custom' || gpu.id === 'unified') continue;
    const probe: CalcInput = { ...input, gpuId: gpu.id, vramGb: gpu.vramGb, kind: 'discrete', usablePct: 100 };
    const factor = spareFactor(probe);
    const needed = totalGiB * factor;
    const { verdict } = verdictOf(totalGiB, gpu.vramGb, factor);
    rows.push({ id: gpu.id, name: gpu.name, vramGb: gpu.vramGb, gfx: gpu.gfx, neededGiB: needed, verdict });
  }
  return rows.sort((a, b) => a.vramGb - b.vramGb || a.name.localeCompare(b.name));
}

export function gpuCatalog(input: CalcInput): { fits: GpuFitRow[]; misses: GpuFitRow[] } {
  const fits: GpuFitRow[] = [];
  const misses: GpuFitRow[] = [];
  for (const model of MODEL_PRESETS) {
    if (model.id === 'custom') continue;
    const seeded = applyModelPreset(model.id, { ...input, fileWeightGiB: null });
    const best = bestQuantThatFits(seeded);
    if (best) {
      const run = { ...seeded, quantId: best.id };
      const { totalGiB } = totalFor(run);
      const { available } = overflowOf(run, totalGiB);
      const { verdict } = verdictOf(totalGiB, available, spareFactor(run));
      fits.push({ modelId: model.id, name: model.name, quant: best, totalGiB, verdict, tested: testedBadge(run) });
    } else {
      const lightest = QUANTS.reduce((a, b) => (a.bpw <= b.bpw ? a : b));
      const { totalGiB } = totalFor({ ...seeded, quantId: lightest.id });
      misses.push({
        modelId: model.id,
        name: model.name,
        quant: lightest,
        totalGiB,
        verdict: 'no',
        tested: null,
      });
    }
  }
  fits.sort((a, b) => b.totalGiB - a.totalGiB);
  misses.sort((a, b) => a.totalGiB - b.totalGiB);
  return { fits, misses };
}

export function contextSweep(input: CalcInput): ContextSweepRow[] {
  return CONTEXT_PRESETS.map((context) => {
    const run = { ...input, context };
    const { kv, totalGiB } = totalFor(run);
    const { available } = overflowOf(run, totalGiB);
    const { verdict } = verdictOf(totalGiB, available, spareFactor(run));
    return { context, totalGiB, kvGiB: kv.gib, verdict };
  });
}

export function speedFloor(input: CalcInput, overflowGiB: number, tested: TestedBadge | null): SpeedFloor {
  if (overflowGiB > 0.05) {
    return {
      offered: false,
      tokS: null,
      note: 'Speed floor is withheld when weights spill to system RAM. Offload speed is a CPU / DIMM / PCIe story, not a card story. We do not invent that number.',
      measured: tested,
    };
  }
  if (!(input.bandwidthGBs > 0) || !(input.activeParamsB > 0)) {
    return {
      offered: false,
      tokS: null,
      note: 'Enter AMD-published bandwidth (GB/s) and active params for a decode-floor estimate. No number is invented.',
      measured: tested,
    };
  }
  const bpw = quantById(input.quantId).bpw;
  const bytesPerToken = input.activeParamsB * 1e9 * (bpw / 8);
  const delivered = input.bandwidthGBs * 1e9 * Math.min(1, Math.max(0.2, input.efficiency));
  const tokS = delivered / bytesPerToken;
  return {
    offered: true,
    tokS,
    note: `Estimate only: (published bandwidth × ${Math.round(input.efficiency * 100)}% controller) / (active params × ${bpw} bpw / 8). Prefill, speculation, and MTP are ignored. Not a bench.`,
    measured: tested,
  };
}

export function compute(input: CalcInput): CalcResult {
  const { weights, kv, overhead, totalGiB } = totalFor(input);
  const { available, usable, perGpu, overflow } = overflowOf(input, totalGiB);
  const factor = spareFactor(input);
  const { verdict, label } = verdictOf(totalGiB, available, factor);
  const ready = kvReady(input);
  const best = bestQuantThatFits(input);
  const ramPct = input.ramGb > 0 ? (overflow / input.ramGb) * 100 : null;
  const tested = testedBadge(input);
  const catalog = gpuCatalog(input);

  return {
    weightsGiB: weights.gib,
    weightsSource: weights.source,
    weightsNote: weights.note,
    kvGiB: kv.gib,
    kvReady: ready,
    kvNote: kv.note,
    overheadGiB: overhead.gib,
    overheadNote: overhead.note,
    totalGiB,
    availableVramGb: available,
    usableVramGb: usable,
    perGpuGiB: perGpu,
    overflowGiB: overflow,
    overflowRamPct: ramPct,
    spareFactor: factor,
    verdict,
    verdictLabel: label,
    bestQuant: best,
    maxContextAtBest: best ? maxContextThatFits({ ...input, quantId: best.id }) : null,
    maxContextAtSelected: maxContextThatFits(input),
    tested,
    matching: matchingGpus(input, totalGiB),
    gpuFits: catalog.fits,
    gpuMisses: catalog.misses,
    sweep: contextSweep(input),
    speed: speedFloor(input, overflow, tested),
    systemRam: systemRamNeed(input),
  };
}

export function applyMeasuredSystemRam(result: CalcResult, hits: MeasuredRamHit[], input: CalcInput): CalcResult {
  return { ...result, systemRam: systemRamNeed(input, hits) };
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

export function formatTokS(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return '—';
  if (n >= 100) return n.toFixed(0);
  return n.toFixed(1);
}

export function exportEstimate(input: CalcInput, result: CalcResult): string {
  return JSON.stringify(
    {
      site: 'https://amdai.net/calculator',
      kind: result.tested ? 'measured-badge-plus-estimate' : 'estimate',
      measured: result.tested?.label ?? null,
      input,
      totals: {
        weightsGiB: result.weightsGiB,
        kvGiB: result.kvGiB,
        overheadGiB: result.overheadGiB,
        totalGiB: result.totalGiB,
        overflowGiB: result.overflowGiB,
        verdict: result.verdict,
        systemRam: {
          minKitGb: result.systemRam.atSelected.kitGb,
          fullContextKitGb: result.systemRam.atFullContext.kitGb,
          fullContext: result.systemRam.fullContext,
          label: result.systemRam.atSelected.label,
          breakdown: result.systemRam.atSelected.breakdown,
        },
      },
      notes: {
        weights: result.weightsNote,
        kv: result.kvNote,
        overhead: result.overheadNote,
        speed: result.speed.note,
      },
    },
    null,
    2,
  );
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
  'view',
  'be',
  'path',
  'batch',
  'sep',
  'spare',
  'bw',
  'eff',
  'kind',
  'use',
  'mla',
  'mlad',
  'win',
  'wint',
  'ohm',
] as const;

function num(value: string | null, fallback: number): number {
  if (value == null || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function isModelId(value: string | null): value is ModelId {
  return !!value && (MODEL_IDS as string[]).includes(value);
}
function isGpuId(value: string | null): value is GpuId {
  return !!value && (GPU_IDS as string[]).includes(value);
}
function isQuantId(value: string | null): value is QuantId {
  return !!value && (QUANT_IDS as string[]).includes(value);
}
function isKvId(value: string | null): value is KvId {
  return !!value && (KV_IDS as string[]).includes(value);
}
function isBackendId(value: string | null): value is BackendId {
  return !!value && (BACKEND_IDS as string[]).includes(value);
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
    view: input.view,
    be: input.backendId,
    path: input.pathId,
    batch: String(input.batch),
    sep: input.separableEmbed ? '1' : '0',
    spare: input.desktopSpare ? '1' : '0',
    bw: String(input.bandwidthGBs),
    eff: String(input.efficiency),
    kind: input.kind,
    use: String(input.usablePct),
    mla: input.kvKind,
    mlad: String(input.mlaDim),
    win: String(input.windowLayers),
    wint: String(input.windowTokens),
    ohm: input.overheadManual ? '1' : '0',
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

  const gpuId = isGpuId(q.get('gpu')) ? (q.get('gpu') as GpuId) : DEFAULT_INPUT.gpuId;
  const modelId = isModelId(q.get('model')) ? (q.get('model') as ModelId) : DEFAULT_INPUT.modelId;
  const quantId = isQuantId(q.get('quant')) ? (q.get('quant') as QuantId) : DEFAULT_INPUT.quantId;
  const kvId = isKvId(q.get('kv')) ? (q.get('kv') as KvId) : DEFAULT_INPUT.kvId;
  const backendId = isBackendId(q.get('be')) ? (q.get('be') as BackendId) : DEFAULT_INPUT.backendId;
  const gpu = gpuById(gpuId);
  const model = modelById(modelId);
  const gpuCount = Math.min(4, Math.max(1, Math.round(num(q.get('n'), DEFAULT_INPUT.gpuCount))));
  const context = Math.min(1048576, Math.max(2048, Math.round(num(q.get('ctx'), DEFAULT_INPUT.context))));
  const view = q.get('view');
  const kind = q.get('kind') === 'unified' || gpu.kind === 'unified' ? 'unified' : 'discrete';

  return {
    view: view === 'gpu' || view === 'speed' || view === 'model' ? view : DEFAULT_INPUT.view,
    gpuId,
    vramGb: Math.max(1, num(q.get('vram'), gpu.vramGb)),
    gpuCount,
    split: q.get('split') === '1' || q.get('split') === 'true',
    ramGb: Math.max(0, num(q.get('ram'), DEFAULT_INPUT.ramGb)),
    kind,
    usablePct: Math.min(100, Math.max(10, num(q.get('use'), kind === 'unified' ? 70 : 100))),
    bandwidthGBs: Math.max(0, num(q.get('bw'), gpu.bandwidthGBs)),
    efficiency: Math.min(1, Math.max(0.2, num(q.get('eff'), DEFAULT_INPUT.efficiency))),
    desktopSpare: q.has('spare') ? q.get('spare') === '1' || q.get('spare') === 'true' : true,
    modelId,
    totalParamsB: Math.max(0, num(q.get('tp'), model.totalParamsB ?? DEFAULT_INPUT.totalParamsB)),
    activeParamsB: Math.max(0, num(q.get('ap'), model.activeParamsB ?? DEFAULT_INPUT.activeParamsB)),
    layers: Math.max(0, Math.round(num(q.get('layers'), model.layers ?? DEFAULT_INPUT.layers))),
    kvLayers: Math.max(0, Math.round(num(q.get('kvl'), model.kvLayers ?? DEFAULT_INPUT.kvLayers))),
    kvHeads: Math.max(0, Math.round(num(q.get('kvh'), model.kvHeads ?? DEFAULT_INPUT.kvHeads))),
    headDim: Math.max(0, Math.round(num(q.get('hd'), model.headDim ?? DEFAULT_INPUT.headDim))),
    kvKind: q.get('mla') === 'mla' ? 'mla' : 'gqa',
    mlaDim: Math.max(0, Math.round(num(q.get('mlad'), model.mlaDim ?? 0))),
    mlaTensors: 1,
    windowLayers: Math.max(0, Math.round(num(q.get('win'), model.windowLayers ?? 0))),
    windowTokens: Math.max(0, Math.round(num(q.get('wint'), model.windowTokens ?? 0))),
    embedVocab: model.embedVocab ?? 0,
    embedHidden: model.embedHidden ?? 0,
    embedTied: model.embedTied,
    separableParamsB: model.separableParamsB ?? 0,
    separableEmbed: q.get('sep') === '1' || q.get('sep') === 'true',
    fileWeightGiB: null,
    quantId,
    context,
    kvId,
    backendId,
    pathId: q.get('path') === 'hip' ? 'hip' : 'vulkan',
    batch: Math.min(16, Math.max(1, Math.round(num(q.get('batch'), 1)))),
    overheadGiB: Math.max(0, num(q.get('oh'), DEFAULT_INPUT.overheadGiB)),
    overheadManual: q.get('ohm') === '1' || q.get('ohm') === 'true',
  };
}

export function catalogGuardErrors(): string[] {
  const errors: string[] = [];
  const banned = /Qwen2\.5|Qwen3-8B/i;
  const q1q2 = /\b(?:Q[12]|IQ[12])(?:_|\b)/i;
  for (const model of MODEL_PRESETS) {
    const blob = `${model.id} ${model.name} ${model.official}`;
    if (banned.test(blob)) errors.push(`banned model text: ${model.id}`);
  }
  const ids = new Set(QUANTS.map((q) => q.id));
  for (const required of ['q3_k_s', 'q3_k_m', 'q3_k_xl', 'iq3', 'q4_k_m'] as const) {
    if (!ids.has(required)) errors.push(`missing quant ${required}`);
  }
  for (const quant of QUANTS) {
    if (q1q2.test(quant.label) || quant.bpw < 3) errors.push(`Q1/Q2 quant listed: ${quant.id}`);
  }
  const modelIds = new Set(MODEL_PRESETS.map((m) => m.id));
  if (modelIds.size !== MODEL_PRESETS.length) errors.push('duplicate model id');
  return errors;
}

export function systemRamNeedFromQuery(search: string, hits: MeasuredRamHit[] = []): SystemRamNeed {
  return systemRamNeed(queryToInput(search.startsWith('/calculator') ? search.replace(/^\/calculator/, '') : search), hits);
}
