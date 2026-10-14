/**
 * Radeon PRO workstation recipe sheets (W7900 / W7800 / W7700 / W6800).
 * Fit / VRAM / RAM come from the calculator and stay labeled Estimate.
 * Speed stays “not yet measured on our R9700s” — no first-party amdai-bench/run@1 cards.
 * Official AMD product-page cites only. 48 GB variants only when AMD lists them.
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
  type ModelId,
  type QuantId,
  type SystemRamNeed,
  type Verdict,
} from './calculator';
import { CONSUMER_NAV_LINKS } from './consumer-gpu';
import { gpuCardId, MODEL_PAGES } from './gpu-ids';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import type { GpuDirectory } from './status';
import { COMPARE_Q3, COMPARE_Q3_CITE } from './local-desktop-compare';

export const WORKSTATION_RECIPE_IDS = ['w7900', 'w7800', 'w7700', 'w6800'] as const;
export type WorkstationRecipeId = (typeof WORKSTATION_RECIPE_IDS)[number];

export const WORKSTATION_PAGE_SLUG: Record<WorkstationRecipeId, string> = {
  w7900: 'w7900',
  w7800: 'w7800',
  w7700: 'w7700',
  w6800: 'w6800',
};

export const WORKSTATION_PAGE_ALIASES: Record<string, WorkstationRecipeId> = {
  w7900: 'w7900',
  'w-7900': 'w7900',
  'radeon-pro-w7900': 'w7900',
  'pro-w7900': 'w7900',
  w7800: 'w7800',
  'w-7800': 'w7800',
  'radeon-pro-w7800': 'w7800',
  'pro-w7800': 'w7800',
  w7700: 'w7700',
  'w-7700': 'w7700',
  'radeon-pro-w7700': 'w7700',
  'pro-w7700': 'w7700',
  w6800: 'w6800',
  'w-6800': 'w6800',
  'radeon-pro-w6800': 'w6800',
  'pro-w6800': 'w6800',
};

export const WORKSTATION_PUBLISHED = '2026-10-14';
export const WORKSTATION_ENGINE = 'llama.cpp';
export const WORKSTATION_PATH_PREFIX = '/gpus';
export const WORKSTATION_RAM_QUANT: QuantId = 'q4_k_m';
export const WORKSTATION_RAM_QUANT_LABEL = 'Q4_K_M';
export const WORKSTATION_RAM_CONTEXT = 32768;
export const WORKSTATION_SHOPPER_RAM_GB = 64;
export const WORKSTATION_SPEED = 'not yet measured on our R9700s';

export const WORKSTATION_FIT_CONTEXTS = [4096, 32768] as const;
export const WORKSTATION_FIT_GPUS = [1, 2] as const;

export const WORKSTATION_MODEL_IDS = MODEL_PAGES.map((row) => row.id);
export type WorkstationModelId = (typeof MODEL_PAGES)[number]['id'];

export const WORKSTATION_FIT_QUANTS = [
  { id: 'q6_k' as const, label: 'Q6_K', kind: 'estimate' as const },
  { id: 'q5_k_m' as const, label: 'Q5_K_M', kind: 'estimate' as const },
  { id: 'q4_k_m' as const, label: 'Q4_K_M', kind: 'estimate' as const },
  { id: 'q3_k_xl' as const, label: COMPARE_Q3, kind: 'q3-estimate' as const },
];

export const AMD_W7900 = 'https://www.amd.com/en/products/graphics/workstations/radeon-pro/w7900.html';
export const AMD_W7900_DS =
  'https://www.amd.com/content/dam/amd/en/documents/products/graphics/workstation/radeon-pro-w7900-datasheet.pdf';
export const AMD_W7800 = 'https://www.amd.com/en/products/graphics/workstations/radeon-pro/w7800.html';
export const AMD_W7800_48 = 'https://www.amd.com/en/products/graphics/workstations/radeon-pro/w7800-48gb.html';
export const AMD_W7800_DS =
  'https://www.amd.com/content/dam/amd/en/documents/products/graphics/workstation/radeon-pro-w7800-datasheet.pdf';
export const AMD_W7700 = 'https://www.amd.com/en/products/graphics/workstations/radeon-pro/w7700.html';
export const AMD_W6800 = 'https://www.amd.com/en/products/graphics/workstations/radeon-pro/w6800.html';

export const WORKSTATION_NAV_LINKS = [
  { href: '/gpus/w7900', label: 'PRO W7900' },
  { href: '/gpus/w7800', label: 'PRO W7800' },
  { href: '/gpus/w7700', label: 'PRO W7700' },
  { href: '/gpus/w6800', label: 'PRO W6800' },
] as const;

export const REQUIRED_WORKSTATION_HREFS = [
  '/calculator',
  '/budget',
  '/benchmarks',
  '/setup',
  '/stack-lab',
  '/amdai-bench',
  '/gpus',
  '/gpus/r9700',
  '/compare/gpus',
  '/compare/radeon-vs-nvidia',
  '/backends/llamacpp',
  '/contribute',
  '/methodology',
  '/start',
  '/faq',
  '/models',
  '/models/qwen36',
  '/models/flash',
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

function productAmdHref(id: WorkstationRecipeId): string | null {
  const file = parse(readSrcData('products.yaml')) as {
    products: Array<{ id: string; urls?: Partial<Record<string, string>> }>;
  };
  return file.products.find((row) => row.id === id)?.urls?.amd ?? null;
}

const gpuDirectory = loadGpuDirectory();

const SHORT_NAME: Record<WorkstationRecipeId, string> = {
  w7900: 'PRO W7900',
  w7800: 'PRO W7800',
  w7700: 'PRO W7700',
  w6800: 'PRO W6800',
};

export type WorkstationSpec = {
  vramGb: number;
  bandwidthGBs: number;
  bandwidthCite: string;
  tbp: string;
  tbpCite: string;
  form: string;
  formCite: string;
  variantNote: string;
  productHref: string;
};

export const WORKSTATION_SPEC: Record<WorkstationRecipeId, WorkstationSpec> = {
  w7900: {
    vramGb: 48,
    bandwidthGBs: 864,
    bandwidthCite: 'AMD W7900 product page — peak memory bandwidth 864 GB/s',
    tbp: '295 W TBP',
    tbpCite: 'AMD W7900 product page — Total Board Power 295 W; 2×8-pin; 750 W minimum PSU',
    form: 'Active cooler, full-height triple-slot, 11 in / 280 mm',
    formCite: 'AMD W7900 datasheet — Active, 11” (280 mm), Triple Slot, Full Height',
    variantNote:
      'AMD lists a Dual Slot sibling in the same 48 GB class. This sheet sizes the standard W7900, not that dual-slot board.',
    productHref: AMD_W7900,
  },
  w7800: {
    vramGb: 32,
    bandwidthGBs: 576,
    bandwidthCite: 'AMD W7800 product page — peak memory bandwidth 576 GB/s (32 GB SKU)',
    tbp: '260 W TBP',
    tbpCite: 'AMD W7800 product page — Total Board Power 260 W; 2×8-pin',
    form: 'Active cooler, full-height double-slot, 11 in / 280 mm',
    formCite: 'AMD W7800 datasheet — Active, 11” (280 mm), Double Slot, Full Height',
    variantNote:
      'AMD lists a separate W7800 48 GB SKU (48 GB GDDR6, 864 GB/s, 260 W TBP). Read the sticker. This sheet sizes the 32 GB W7800.',
    productHref: AMD_W7800,
  },
  w7700: {
    vramGb: 16,
    bandwidthGBs: 576,
    bandwidthCite: 'AMD W7700 product page — peak memory bandwidth 576 GB/s',
    tbp: '190 W TBP',
    tbpCite: 'AMD W7700 product page — Total Board Power 190 W; 1×8-pin',
    form: 'PCIe add-in card; AMD product page lists 1×8-pin',
    formCite: 'AMD W7700 product page — GPU form factor PCIe add-in card',
    variantNote: 'AMD does not list a 48 GB W7700 on the cited product page.',
    productHref: AMD_W7700,
  },
  w6800: {
    vramGb: 32,
    bandwidthGBs: 512,
    bandwidthCite: 'AMD W6800 product page — peak memory bandwidth 512 GB/s',
    tbp: '250 W TBP',
    tbpCite: 'AMD W6800 product page — Total Board Power 250 W',
    form: 'PCIe add-in card (AMD product page)',
    formCite: 'AMD W6800 product page — GPU form factor PCIe add-in card',
    variantNote: 'AMD does not list a 48 GB W6800 on the cited product page. 32 GB GDDR6 is the listed SKU.',
    productHref: AMD_W6800,
  },
};

const LEAD: Record<WorkstationRecipeId, string> = {
  w7900:
    '48 GB gfx1100 RDNA 3 workstation — the W7900, not the 32 GB W7800 and not two consumer 24 GB cards. AMD product page cites 48 GB GDDR6, 864 GB/s peak bandwidth, and 295 W TBP; the datasheet lists an active triple-slot 11 in / 280 mm board. Official on the cited ROCm 10.1 matrix as gfx1100. llama.cpp first (Vulkan and ROCm/HIP). Fit tables below cover house 35B, Flash, and the cited /models pages on 1 GPU and 2 GPUs. Speeds are not yet measured on our R9700s.',
  w7800:
    '32 GB gfx1100 RDNA 3 workstation — the W7800, not the 48 GB W7800 SKU and not the 48 GB W7900. AMD product page cites 32 GB GDDR6, 576 GB/s peak bandwidth, and 260 W TBP; the datasheet lists an active double-slot 11 in / 280 mm board. AMD also lists a separate 48 GB W7800 (864 GB/s, 260 W). Official on the cited ROCm 10.1 matrix as gfx1100. llama.cpp first. Fit tables cover 35B, Flash, and the cited /models pages on 1 GPU and 2 GPUs. Speeds are not yet measured on our R9700s.',
  w7700:
    '16 GB gfx1101 RDNA 3 workstation — the W7700, not the 12 GB consumer 7700 XT and not the 32 GB W7800. AMD product page cites 16 GB GDDR6, 576 GB/s peak bandwidth, 190 W TBP, and a PCIe add-in card with 1×8-pin. Official on the cited ROCm 10.1 matrix as gfx1101. llama.cpp first. House 35B Q4–Q6 files do not sit in 16 GB on the calculator — expect RAM offload or a listed Q3 file, both estimates. Speeds are not yet measured on our R9700s.',
  w6800:
    '32 GB gfx1030 RDNA 2 workstation — the W6800, not the 16 GB consumer 6800 XT. AMD product page cites 32 GB GDDR6, 512 GB/s peak bandwidth, and 250 W TBP. Official on the cited ROCm 10.1 matrix as gfx1030 — the current Radeon official RDNA 2 row, unlike the unofficial 6800 XT. llama.cpp first (Vulkan and ROCm/HIP). Fit tables cover 35B, Flash, and the cited /models pages on 1 GPU and 2 GPUs. Speeds are not yet measured on our R9700s.',
};

const VS_CONSUMER: Record<WorkstationRecipeId, { title: string; body: string }[]> = {
  w7900: [
    {
      title: '48 GB sticker vs two consumer cards',
      body: 'One W7900 is 48 GB GDDR6 (AMD product page). Two RX 7900 XTX cards are also 48 GB (24 + 24) on the same gfx1100 family, each citing 960 GB/s and 355 W typical board power. That is two boards, two coolers, and two consumer TBP envelopes — not one 48 GB workstation sticker. We do not invent a decode winner.',
    },
    {
      title: 'W7900 vs the measured R9700',
      body: 'The R9700 is the measured 32 GB gfx1201 north star (640 GB/s, 300 W TBP on its product page). The W7900 is 48 GB gfx1100, 864 GB/s, 295 W TBP, official on the cited ROCm 10.1 row — and not measured on local-desktop. More VRAM on the sticker is not a measured decode claim.',
    },
    {
      title: 'Dual Slot sibling',
      body: 'AMD lists a Dual Slot W7900 sibling in the same 48 GB class. This sheet sizes the standard triple-slot 11 in board from the datasheet. Confirm the cooler you are buying.',
    },
  ],
  w7800: [
    {
      title: '32 GB W7800 vs the 48 GB W7800 SKU',
      body: 'This sheet sizes the 32 GB W7800 (576 GB/s, 260 W TBP). AMD’s separate W7800 48 GB page cites 48 GB GDDR6, 864 GB/s, and the same 260 W TBP. Read the sticker. Do not use these 32 GB fit rows for the 48 GB SKU.',
    },
    {
      title: 'W7800 vs the measured R9700',
      body: 'Both are 32 GB workstation stickers. The R9700 is gfx1201, 640 GB/s, 300 W TBP, and measured on local-desktop. The W7800 is gfx1100, 576 GB/s, 260 W TBP, official on the cited ROCm 10.1 row — not measured. Same VRAM class is not the same LLVM target.',
    },
    {
      title: 'W7800 vs consumer gfx1100',
      body: 'The RX 7900 XT is 20 GB gfx1100 at 315 W typical board power. The W7800 is 32 GB gfx1100 at 260 W TBP. More VRAM on the workstation sticker; different cooler and driver SKU. We do not invent a price or a decode gap.',
    },
  ],
  w7700: [
    {
      title: '16 GB W7700 vs the 12 GB 7700 XT',
      body: 'Same gfx1101 family. AMD cites 16 GB / 576 GB/s / 190 W TBP on the W7700 product page. The consumer 7700 XT directory row is 12 GB. Four GB more on the workstation sticker is not a measured decode claim.',
    },
    {
      title: 'W7700 vs the 16 GB 7800 XT',
      body: 'Both are 16 GB gfx1101. The consumer 7800 XT product page cites 16 GB GDDR6, 624 GB/s, and 263 W typical board power. The W7700 cites 576 GB/s and 190 W TBP. Same VRAM class, different envelope. We do not invent a decode winner.',
    },
    {
      title: 'W7700 vs the measured R9700',
      body: 'The R9700 is 32 GB gfx1201 and measured. The W7700 is 16 GB gfx1101, official on the cited ROCm row, and not measured on local-desktop. House 35B Q4–Q6 files do not sit in 16 GB on the calculator.',
    },
  ],
  w6800: [
    {
      title: '32 GB W6800 vs the 16 GB 6800 XT',
      body: 'Same gfx1030 LLVM target. AMD cites 32 GB GDDR6, 512 GB/s, and 250 W TBP on the W6800 product page. The consumer 6800 XT is 16 GB and unofficial on the current Radeon ROCm row — the official RDNA 2 listing is this W6800. Double the sticker VRAM is not a measured decode claim.',
    },
    {
      title: 'W6800 vs the measured R9700',
      body: 'Both are 32 GB workstation stickers. The R9700 is gfx1201 RDNA 4, 640 GB/s, 300 W TBP, measured on local-desktop. The W6800 is gfx1030 RDNA 2, 512 GB/s, 250 W TBP, still listed on the cited 10.1 matrix — not measured. Same VRAM class, older architecture.',
    },
    {
      title: 'W6800 vs the 32 GB W7800',
      body: 'Both are 32 GB PRO cards. W7800 is gfx1100 RDNA 3 at 576 GB/s and 260 W TBP. W6800 is gfx1030 RDNA 2 at 512 GB/s and 250 W TBP. Do not mix those family packages.',
    },
  ],
};

export type WorkstationFitKind = 'estimate' | 'q3-estimate';

export type WorkstationFitCell = {
  gpuCount: 1 | 2;
  context: number;
  contextLabel: string;
  layoutLabel: string;
  totalGb: string;
  perGpuGb: string;
  verdict: Verdict;
  verdictLabel: string;
  speed: typeof WORKSTATION_SPEED;
};

export type WorkstationFitRow = {
  quantId: QuantId;
  quant: string;
  kind: WorkstationFitKind;
  kindLabel: string;
  weightsGb: string;
  weightsNote: string;
  speed: typeof WORKSTATION_SPEED;
  cells: WorkstationFitCell[];
  calculatorHref: string;
};

export type WorkstationFitModel = {
  modelId: WorkstationModelId;
  model: string;
  href: string;
  q3Cite: string;
  rows: WorkstationFitRow[];
  ramNeed: SystemRamNeed;
  ramNeedSplit: SystemRamNeed;
  offload: boolean;
  offloadSplit: boolean;
};

export type WorkstationStackTip = {
  title: string;
  body: string;
};

export type WorkstationRecipePage = {
  id: WorkstationRecipeId;
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
  bandwidthGBs: number;
  bandwidthLabel: string;
  bandwidthCite: string;
  tbp: string;
  tbpCite: string;
  form: string;
  formCite: string;
  variantNote: string;
  support: 'official' | 'unofficial';
  rocmNote: string;
  hsaOverride: string;
  matrixHref: string;
  linuxReqsHref: string;
  productHref: string;
  datasheetHref: string | null;
  variantHref: string | null;
  lead: string;
  notMeasured: string;
  vsConsumer: { title: string; body: string }[];
  engine: string;
  q3: string;
  q3Cite: string;
  models: WorkstationFitModel[];
  ramNeed: SystemRamNeed;
  ramQuant: string;
  ramContextLabel: string;
  ramNote: string;
  stack: WorkstationStackTip[];
  budget: { href: string; label: string };
  calculatorHref: string;
  siblings: { href: string; label: string }[];
};

export function workstationRecipeIdFromPage(id: string): WorkstationRecipeId | null {
  return WORKSTATION_PAGE_ALIASES[id] ?? null;
}

export function isWorkstationRecipeGpu(id: string): boolean {
  return workstationRecipeIdFromPage(id) !== null;
}

export function workstationPath(id: WorkstationRecipeId): string {
  return `${WORKSTATION_PATH_PREFIX}/${WORKSTATION_PAGE_SLUG[id]}`;
}

export function workstationShortName(id: WorkstationRecipeId): string {
  return SHORT_NAME[id];
}

function directoryCard(id: WorkstationRecipeId) {
  const card = gpuDirectory.cards.find((row) => gpuCardId(row) === id);
  if (!card) throw new Error(`gpus.yaml has no cited row for ${id}`);
  if (card.vram_gb == null) throw new Error(`${id} is missing a published VRAM hardware label`);
  return card;
}

export function workstationCalcInput(
  id: WorkstationRecipeId,
  modelId: ModelId,
  quant: QuantId,
  context: number,
  gpuCount: 1 | 2 = 1,
): CalcInput {
  let input = applyGpuPreset(id, {
    ...DEFAULT_INPUT,
    ramGb: WORKSTATION_SHOPPER_RAM_GB,
    view: 'gpu',
  });
  input = applyModelPreset(modelId, input);
  return {
    ...input,
    gpuId: id,
    quantId: quant,
    context,
    kvId: 'f16',
    backendId: 'llamacpp',
    pathId: 'vulkan',
    gpuCount,
    split: gpuCount === 2,
    fileWeightGiB: null,
  };
}

function kindLabel(kind: WorkstationFitKind): string {
  return kind === 'q3-estimate' ? 'Q3 estimate' : 'Estimate';
}

function modelName(id: WorkstationModelId): string {
  return MODEL_PAGES.find((row) => row.id === id)?.name ?? id;
}

function modelHref(id: WorkstationModelId): string {
  return `/models/${id}`;
}

function stackTips(id: WorkstationRecipeId, gfx: string): WorkstationStackTip[] {
  if (id === 'w7900') {
    return [
      {
        title: 'llama.cpp first',
        body: 'Vulkan and ROCm/HIP are both in scope on this official gfx1100 workstation row. HIP when rocminfo lists gfx1100. Ollama and vLLM are secondary — not the house path for this card.',
      },
      {
        title: 'gfx1100 family package',
        body: `${gfx} needs the gfx110x ROCm family package, same pin as the W7800 and the consumer 7900 XTX / XT / GRE. Do not mix a gfx1201 (R9700 / 9070 XT) or gfx1030 (W6800) install. Re-check the cited matrix before you install.`,
      },
      {
        title: '48 GB W7900, not two 24 GB cards',
        body: 'This sheet sizes the 48 GB workstation sticker. AMD product page: 48 GB GDDR6, 864 GB/s, 295 W TBP. Two consumer 7900 XTX cards are a different layout. Size the file on the calculator before you download.',
      },
      {
        title: 'Setup, then Stack Lab doctor',
        body: 'First-run setup is Ubuntu. Open Stack Lab doctor for the gfx110x install family, then record an amdai-bench/run@1 card if you measure this SKU. House daily and Flash profiles are R9700 / local-desktop — they do not apply here. Packages are not published yet.',
      },
    ];
  }
  if (id === 'w7800') {
    return [
      {
        title: 'llama.cpp first',
        body: 'Vulkan and ROCm/HIP are both in scope on this official gfx1100 workstation row. HIP when rocminfo lists gfx1100. Ollama and vLLM are secondary — not the house path for this card.',
      },
      {
        title: 'gfx1100 family package',
        body: `${gfx} needs the gfx110x ROCm family package, same pin as the W7900. Do not mix a gfx1201 (R9700 / 9070 XT) or gfx1101 (W7700 / 7800 XT) install. Re-check the cited matrix before you install.`,
      },
      {
        title: '32 GB sheet, 48 GB SKU exists',
        body: 'This sheet sizes the 32 GB W7800. AMD product page: 32 GB GDDR6, 576 GB/s, 260 W TBP. The 48 GB W7800 is a different listing (864 GB/s, 260 W). Read the sticker and open the calculator before you download.',
      },
      {
        title: 'Setup, then Stack Lab doctor',
        body: 'First-run setup is Ubuntu. Open Stack Lab doctor for the gfx110x install family, then record an amdai-bench/run@1 card if you measure this SKU. House daily and Flash profiles are R9700 / local-desktop — they do not apply here. Packages are not published yet.',
      },
    ];
  }
  if (id === 'w7700') {
    return [
      {
        title: 'llama.cpp first',
        body: 'Vulkan and ROCm/HIP are both in scope on this official gfx1101 workstation row. HIP when rocminfo lists gfx1101. Ollama and vLLM are secondary — not the house path for this card.',
      },
      {
        title: 'gfx1101 family package',
        body: `${gfx} needs the gfx110x ROCm family package, same pin as the consumer 7800 XT / 7700 XT. Do not mix a gfx1100 (W7900 / W7800 / 7900 XTX) or gfx1201 (R9700) install. Re-check the cited matrix before you install.`,
      },
      {
        title: '16 GB workstation, not the 12 GB 7700 XT',
        body: 'This sheet sizes the 16 GB W7700. AMD product page: 16 GB GDDR6, 576 GB/s, 190 W TBP. House 35B Q4–Q6 files do not fit this VRAM — expect RAM offload or a listed Q3 file, both estimates. Size the file on the calculator before you download.',
      },
      {
        title: 'Setup, then Stack Lab doctor',
        body: 'First-run setup is Ubuntu. Open Stack Lab doctor for the gfx110x install family, then record an amdai-bench/run@1 card if you measure this SKU. House daily and Flash profiles are R9700 / local-desktop — they do not apply here. Packages are not published yet.',
      },
    ];
  }
  return [
    {
      title: 'llama.cpp first',
      body: 'Vulkan and ROCm/HIP are both in scope on this official gfx1030 workstation row. The current Radeon official RDNA 2 listing is W6800, not the consumer 6800 XT. HIP when rocminfo lists gfx1030. Ollama and vLLM are secondary — not the house path for this card.',
    },
    {
      title: 'gfx1030 family package',
      body: `${gfx} is the same LLVM target as the unofficial 16 GB 6800 XT. Do not mix a gfx110x (W7900 / W7800 / 7900) or gfx1201 (R9700) install. Re-check the cited matrix before you install.`,
    },
    {
      title: '32 GB W6800, not the 16 GB 6800 XT',
      body: 'This sheet sizes the 32 GB PRO W6800. AMD product page: 32 GB GDDR6, 512 GB/s, 250 W TBP. The 16 GB consumer 6800 XT is a different listing and unofficial on the current Radeon ROCm row. Size the file on the calculator before you download.',
    },
    {
      title: 'Setup, then Stack Lab doctor',
      body: 'First-run setup is Ubuntu. Open Stack Lab doctor for the install family rocminfo actually prints, then record an amdai-bench/run@1 card if you measure this SKU. House daily and Flash profiles are R9700 / local-desktop — they do not apply here. Packages are not published yet.',
    },
  ];
}

function fitRow(
  id: WorkstationRecipeId,
  modelId: WorkstationModelId,
  spec: (typeof WORKSTATION_FIT_QUANTS)[number],
): WorkstationFitRow {
  const base = workstationCalcInput(id, modelId, spec.id, WORKSTATION_FIT_CONTEXTS[0], 1);
  const weights = compute(base);
  const cells = WORKSTATION_FIT_GPUS.flatMap((gpuCount) =>
    WORKSTATION_FIT_CONTEXTS.map((context) => {
      const result = compute(workstationCalcInput(id, modelId, spec.id, context, gpuCount));
      return {
        gpuCount,
        context,
        contextLabel: formatCtx(context),
        layoutLabel: gpuCount === 1 ? '1 GPU' : '2 GPUs',
        totalGb: `${formatGiB(result.totalGiB)} GB`,
        perGpuGb: `${formatGiB(result.perGpuGiB)} GB`,
        verdict: result.verdict,
        verdictLabel: result.verdictLabel,
        speed: WORKSTATION_SPEED,
      };
    }),
  );
  return {
    quantId: spec.id,
    quant: spec.label,
    kind: spec.kind,
    kindLabel: kindLabel(spec.kind),
    weightsGb: `${formatGiB(weights.weightsGiB)} GB`,
    weightsNote: weights.weightsNote,
    speed: WORKSTATION_SPEED,
    cells,
    calculatorHref: `/calculator?${inputToQuery(workstationCalcInput(id, modelId, spec.id, WORKSTATION_RAM_CONTEXT, 1))}`,
  };
}

function fitModel(id: WorkstationRecipeId, modelId: WorkstationModelId): WorkstationFitModel {
  const rows = WORKSTATION_FIT_QUANTS.map((spec) => fitRow(id, modelId, spec));
  const q3 = rows.find((row) => row.kind === 'q3-estimate');
  const ramNeed = systemRamNeed(workstationCalcInput(id, modelId, WORKSTATION_RAM_QUANT, WORKSTATION_RAM_CONTEXT, 1));
  const ramNeedSplit = systemRamNeed(workstationCalcInput(id, modelId, WORKSTATION_RAM_QUANT, WORKSTATION_RAM_CONTEXT, 2));
  const offload = rows.some((row) => row.cells.some((cell) => cell.gpuCount === 1 && cell.verdict !== 'fits'));
  const offloadSplit = rows.some((row) => row.cells.some((cell) => cell.gpuCount === 2 && cell.verdict !== 'fits'));
  return {
    modelId,
    model: modelName(modelId),
    href: modelHref(modelId),
    q3Cite: modelId === 'qwen36' ? COMPARE_Q3_CITE : (q3?.weightsNote ?? COMPARE_Q3_CITE),
    rows,
    ramNeed,
    ramNeedSplit,
    offload,
    offloadSplit,
  };
}

function datasheetHref(id: WorkstationRecipeId): string | null {
  if (id === 'w7900') return AMD_W7900_DS;
  if (id === 'w7800') return AMD_W7800_DS;
  return null;
}

function variantHref(id: WorkstationRecipeId): string | null {
  if (id === 'w7800') return AMD_W7800_48;
  return null;
}

export function workstationRecipePage(id: WorkstationRecipeId): WorkstationRecipePage {
  const card = directoryCard(id);
  const preset = GPU_PRESETS.find((gpu) => gpu.id === id);
  if (!preset) throw new Error(`${id} is missing a calculator preset`);
  const spec = WORKSTATION_SPEC[id];
  const vramGb = card.vram_gb as number;
  const shortName = SHORT_NAME[id];
  const ramInput = workstationCalcInput(id, 'qwen36', WORKSTATION_RAM_QUANT, WORKSTATION_RAM_CONTEXT, 1);
  const ramNeed = systemRamNeed(ramInput);
  const productHref = productAmdHref(id) ?? spec.productHref;
  const siblings = [
    ...WORKSTATION_NAV_LINKS.filter((link) => link.href !== workstationPath(id)),
    ...CONSUMER_NAV_LINKS,
  ];

  return {
    id,
    path: workstationPath(id),
    name: card.name,
    shortName,
    title: shortName,
    description: `${shortName} recipe sheet — ${vramGb} GB, ${card.gfx}, cited ROCm matrix row. Q6/Q5/Q4 plus labeled ${COMPARE_Q3}; 1 and 2 GPU estimates. Not measured on local-desktop.`,
    family: card.family,
    arch: card.arch,
    gfx: card.gfx,
    vramGb,
    vramLabel: `${vramGb} GB`,
    bandwidthGBs: spec.bandwidthGBs,
    bandwidthLabel: `${spec.bandwidthGBs} GB/s`,
    bandwidthCite: spec.bandwidthCite,
    tbp: spec.tbp,
    tbpCite: spec.tbpCite,
    form: spec.form,
    formCite: spec.formCite,
    variantNote: spec.variantNote,
    support: card.support,
    rocmNote: card.rocm_note,
    hsaOverride: card.hsa_override,
    matrixHref: gpuDirectory.matrix,
    linuxReqsHref: gpuDirectory.linux_reqs,
    productHref,
    datasheetHref: datasheetHref(id),
    variantHref: variantHref(id),
    lead: LEAD[id],
    notMeasured:
      'This SKU was not yet measured on our R9700s. The Radeon AI PRO R9700 remains the measured north star. Fit, VRAM, and system RAM below are calculator estimates. Speed cells stay not yet measured on our R9700s. Record an amdai-bench/run@1 card, or open Stack Lab doctor.',
    vsConsumer: VS_CONSUMER[id],
    engine: WORKSTATION_ENGINE,
    q3: COMPARE_Q3,
    q3Cite: COMPARE_Q3_CITE,
    models: WORKSTATION_MODEL_IDS.map((modelId) => fitModel(id, modelId)),
    ramNeed,
    ramQuant: WORKSTATION_RAM_QUANT_LABEL,
    ramContextLabel: formatCtx(WORKSTATION_RAM_CONTEXT),
    ramNote: `${RAM_MIN_LABEL} and ${RAM_FULL_LABEL} for Qwen3.6-35B-A3B on ${WORKSTATION_ENGINE} at ${WORKSTATION_RAM_QUANT_LABEL}, ${formatCtx(WORKSTATION_RAM_CONTEXT)} selected and the model’s full context. Estimate until a first-party amdai-bench/run@1 card exists for this SKU. Rounded up to a real DIMM kit. Offload rows on the other /models tables repeat both labels.`,
    stack: stackTips(id, card.gfx),
    budget: { href: '/budget#pro', label: 'Pro budget tier' },
    calculatorHref: `/calculator?${inputToQuery(ramInput)}`,
    siblings,
  };
}

export function workstationRecipePages(): WorkstationRecipePage[] {
  return WORKSTATION_RECIPE_IDS.map((id) => workstationRecipePage(id));
}

export function workstationHrefs(page: WorkstationRecipePage): string[] {
  return [
    page.path,
    page.calculatorHref.split('?')[0] ?? '/calculator',
    page.budget.href.split('#')[0] ?? '/budget',
    page.matrixHref,
    page.linuxReqsHref,
    page.productHref,
    ...page.models.map((model) => model.href),
    ...page.siblings.map((link) => link.href),
    ...REQUIRED_WORKSTATION_HREFS,
  ];
}

export function workstationBlob(page: WorkstationRecipePage): string {
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
    page.tbp,
    page.tbpCite,
    page.bandwidthCite,
    page.form,
    page.formCite,
    page.variantNote,
    page.q3,
    page.q3Cite,
    page.vsConsumer.map((row) => `${row.title} ${row.body}`).join('\n'),
    page.stack.map((tip) => `${tip.title} ${tip.body}`).join('\n'),
    page.models.map((model) => `${model.model} ${model.q3Cite}`).join('\n'),
    page.models.flatMap((model) => model.rows.map((row) => `${row.quant} ${row.kindLabel} ${row.weightsNote}`)).join('\n'),
  ].join('\n');
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');
const HOUSE_STACK_LAB = /qwen-reliable|qwen-fast-agent|qwen36-35b\.llamacpp-vulkan\.262k|qwen38-flash\.strata/;

export function assertWorkstationGpuValid(pages: WorkstationRecipePage[] = workstationRecipePages()): string[] {
  const errors: string[] = [];
  const ids = pages.map((page) => page.id);
  if (ids.join(',') !== WORKSTATION_RECIPE_IDS.join(',')) {
    errors.push(`expected ${WORKSTATION_RECIPE_IDS.join(', ')}; got ${ids.join(', ')}`);
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
    if (!page.productHref.startsWith('https://www.amd.com/')) errors.push(`${page.id} product href`);
    if (!/not yet measured on our R9700s/i.test(page.notMeasured)) {
      errors.push(`${page.id} must say not yet measured on our R9700s`);
    }
    if (!/Radeon AI PRO R9700/.test(page.notMeasured)) errors.push(`${page.id} must name the measured R9700`);
    if (!/amdai-bench/.test(page.notMeasured)) errors.push(`${page.id} must name amdai-bench`);
    if (page.models.map((model) => model.modelId).join(',') !== WORKSTATION_MODEL_IDS.join(',')) {
      errors.push(`${page.id} missing a covered /models page`);
    }

    for (const model of page.models) {
      const quants = model.rows.map((row) => row.quant);
      if (!quants.includes('Q6_K')) errors.push(`${page.id} ${model.modelId} missing Q6_K`);
      if (!quants.includes('Q5_K_M')) errors.push(`${page.id} ${model.modelId} missing Q5_K_M`);
      if (!quants.includes('Q4_K_M')) errors.push(`${page.id} ${model.modelId} missing Q4_K_M`);
      if (!quants.includes(COMPARE_Q3)) errors.push(`${page.id} ${model.modelId} missing ${COMPARE_Q3}`);
      for (const row of model.rows) {
        if (row.speed !== WORKSTATION_SPEED) errors.push(`${page.id} ${model.modelId} ${row.quant} invented speed`);
        const ones = row.cells.filter((cell) => cell.gpuCount === 1);
        const twos = row.cells.filter((cell) => cell.gpuCount === 2);
        if (ones.length !== WORKSTATION_FIT_CONTEXTS.length) errors.push(`${page.id} ${model.modelId} missing 1 GPU cells`);
        if (twos.length !== WORKSTATION_FIT_CONTEXTS.length) errors.push(`${page.id} ${model.modelId} missing 2 GPU cells`);
        for (const cell of row.cells) {
          if (cell.speed !== WORKSTATION_SPEED) errors.push(`${page.id} ${row.quant} invented tok/s`);
          if (!cell.totalGb.endsWith(' GB')) errors.push(`${page.id} ${row.quant} VRAM missing GB label`);
          if (!cell.verdictLabel) errors.push(`${page.id} ${row.quant} empty verdict`);
        }
        if (row.kind === 'q3-estimate') {
          if (row.quant !== COMPARE_Q3) errors.push(`${page.id} Q3 row is not ${COMPARE_Q3}`);
          if (!/estimate/i.test(row.kindLabel)) errors.push(`${page.id} Q3 unlabeled`);
        }
        const live = compute(workstationCalcInput(page.id, model.modelId, row.quantId, row.cells[0]!.context, 1));
        if (`${formatGiB(live.weightsGiB)} GB` !== row.weightsGb) {
          errors.push(`${page.id} ${model.modelId} ${row.quant} weights drifted from calculator`);
        }
        if (live.tested) errors.push(`${page.id} ${model.modelId} ${row.quant} must not attach a measured badge`);
      }
      if (model.offload || model.offloadSplit) {
        if (model.ramNeed.atSelected.label !== 'estimate') errors.push(`${page.id} ${model.modelId} min RAM must stay estimate`);
        if (model.ramNeed.atFullContext.label !== 'estimate') {
          errors.push(`${page.id} ${model.modelId} full RAM must stay estimate`);
        }
      }
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

    const blob = workstationBlob(page);
    if (!blob.includes(RAM_MIN_LABEL)) errors.push(`${page.id} missing ${RAM_MIN_LABEL}`);
    if (!blob.includes(RAM_FULL_LABEL)) errors.push(`${page.id} missing ${RAM_FULL_LABEL}`);
    if (BANNED.test(blob)) errors.push(`${page.id} banned model`);
    if (Q4_FLOOR.test(blob)) errors.push(`${page.id} Q4-floor phrase`);
    if (Q1Q2.test(blob)) errors.push(`${page.id} lists Q1/Q2`);
    if (/\$\d|\bMSRP\b|\bUSD\b/i.test(blob)) errors.push(`${page.id} invented price`);
    if (HOUSE_STACK_LAB.test(blob)) errors.push(`${page.id} house Stack Lab profile does not apply`);
    if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push(`${page.id} leftover copy`);
    if (/\b\d+(?:\.\d+)?\s*tok\/s\b/i.test(blob)) errors.push(`${page.id} invented tok/s`);
    if (page.id === 'w7800' && !/48 GB/.test(blob)) errors.push('w7800 must note the AMD-listed 48 GB SKU');
    if (page.id === 'w7900' && !/Dual Slot/.test(blob)) errors.push('w7900 must note the Dual Slot sibling');
    if ((page.id === 'w7700' || page.id === 'w6800') && !/does not list a 48 GB/.test(page.variantNote)) {
      errors.push(`${page.id} must say AMD does not list a 48 GB variant`);
    }
  }

  return [...new Set(errors)];
}
