/**
 * Cited Ryzen AI Max / Strix Halo consumer guide at /gpus/strix-halo.
 * Shared system memory. Not measured on local-desktop. Calculator math only.
 * Do not invent tok/s, prices, bandwidth, or a Windows / Stack Lab package.
 */

import {
  DEFAULT_INPUT,
  DIMM_KIT_GB,
  GPU_PRESETS,
  OS_DESKTOP_BASELINE_GIB,
  RAM_HEADROOM_GIB,
  applyGpuPreset,
  applyModelPreset,
  compute,
  formatCtx,
  formatGiB,
  inputToQuery,
  type CalcInput,
  type ModelId,
  type QuantId,
  type Verdict,
} from './calculator';
import { gpuCardId } from './gpu-ids';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import type { GpuDirectory } from './status';
import { COMPARE_Q3, COMPARE_Q3_CITE } from './local-desktop-compare';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

export const STRIX_HALO_ID = 'strix-halo';
export const STRIX_HALO_PATH = '/gpus/strix-halo';
export const STRIX_HALO_PUBLISHED = '2026-10-13';
export const STRIX_HALO_CITED_LABEL = 'Cited, not measured on local-desktop';
export const STRIX_HALO_NAME = 'AMD Ryzen AI Max+ 395 (Radeon 8060S)';
export const STRIX_HALO_SHORT = 'Ryzen AI Max / Strix Halo';
export const STRIX_HALO_GFX = 'gfx1151';
export const STRIX_HALO_IGPU = 'Radeon 8060S';
export const STRIX_HALO_ARCH = 'RDNA 3.5';
export const STRIX_HALO_ENGINE = 'llama.cpp';
export const STRIX_HALO_USABLE_PCT = 70;
export const STRIX_HALO_KITS = [64, 128] as const;
export type StrixHaloKit = (typeof STRIX_HALO_KITS)[number];
export const STRIX_HALO_RAM_QUANT: QuantId = 'q4_k_m';
export const STRIX_HALO_RAM_QUANT_LABEL = 'Q4_K_M';
export const STRIX_HALO_RAM_CONTEXT = 32768;
export const STRIX_HALO_SPEED = 'no cited number';

export const STRIX_HALO_FIT_CONTEXTS = [4096, 32768] as const;

export const STRIX_HALO_FIT_QUANTS = [
  { id: 'q6_k' as const, label: 'Q6_K', kind: 'estimate' as const },
  { id: 'q5_k_m' as const, label: 'Q5_K_M', kind: 'estimate' as const },
  { id: 'q4_k_m' as const, label: 'Q4_K_M', kind: 'estimate' as const },
  { id: 'q3_k_xl' as const, label: COMPARE_Q3, kind: 'q3-estimate' as const },
];

export const STRIX_HALO_MODELS = [
  { id: 'qwen36' as const, name: 'Qwen3.6-35B-A3B' },
  { id: 'flash' as const, name: 'Qwen 3.8 Flash' },
] as const;

export const STRIX_HALO_SOURCES = [
  {
    id: 'product',
    title: 'AMD — Ryzen AI Max+ 395 product page',
    href: 'https://www.amd.com/en/products/processors/laptop/ryzen/ai-300-series/amd-ryzen-ai-max-plus-395.html',
  },
  {
    id: 'gpu-specs',
    title: 'AMD — ROCm 10.1.0 GPU specifications (Ryzen APUs; Dynamic + carveout)',
    href: 'https://rocm.docs.amd.com/en/docs-10.1.0/reference/gpu-specs.html',
  },
  {
    id: 'matrix',
    title: 'AMD — ROCm 10.1.0 compatibility matrix (Ryzen AI Max+ 395, gfx1151)',
    href: 'https://rocm.docs.amd.com/en/docs-10.1.0/compatibility/compatibility-matrix.html',
  },
  {
    id: 'rdna35',
    title: 'AMD — RDNA 3.5 system optimization (Ryzen AI Max kernel notes)',
    href: 'https://rocm.docs.amd.com/en/latest/reference/system-optimization/rdna3-5.html',
  },
  {
    id: 'mes-5590',
    title: 'ROCm #5590 — MES failed to respond to msg=REMOVE_QUEUE',
    href: 'https://github.com/ROCm/ROCm/issues/5590',
  },
  {
    id: 'mes-5724',
    title: 'ROCm #5724 — MES firmware hang / fault on Strix Halo',
    href: 'https://github.com/ROCm/ROCm/issues/5724',
  },
] as const;

export const STRIX_HALO_SECTIONS = [
  { id: 'what-it-is', label: 'What it is' },
  { id: 'support', label: 'Support status' },
  { id: 'what-fits', label: 'What fits' },
  { id: 'speeds', label: 'Speeds' },
  { id: 'vs-r9700', label: 'vs R9700' },
] as const;

export const REQUIRED_STRIX_HALO_HREFS = [
  '/calculator',
  '/bios',
  '/gpus',
  '/gpus/r9700',
  '/compare',
  '/compare/gpus',
  '/compare/radeon-vs-mac',
  '/multi-gpu',
  '/budget',
  '/rocm-problems/strix-halo-mes-remove-queue',
  '/backends/llamacpp',
  '/faq',
  '/glossary',
  '/setup',
  '/stack-lab',
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

const gpuDirectory = loadGpuDirectory();

export type StrixFitKind = 'estimate' | 'q3-estimate';

export type StrixKitCell = {
  kitGb: StrixHaloKit;
  sliceGb: string;
  totalGb: string;
  leftoverGb: string;
  leftoverNote: string;
  verdict: Verdict;
  verdictLabel: string;
  speed: typeof STRIX_HALO_SPEED;
  calculatorHref: string;
};

export type StrixFitRow = {
  modelId: ModelId;
  model: string;
  quantId: QuantId;
  quant: string;
  kind: StrixFitKind;
  kindLabel: string;
  context: number;
  contextLabel: string;
  weightsGb: string;
  weightsNote: string;
  speed: typeof STRIX_HALO_SPEED;
  kits: StrixKitCell[];
};

export type StrixRamLine = {
  label: typeof RAM_MIN_LABEL | typeof RAM_FULL_LABEL;
  context: number;
  contextLabel: string;
  rawGiB: string;
  kitLabel: string;
  leftover64: string;
  leftover128: string;
  note: string;
};

export function strixCalcInput(modelId: ModelId, quant: QuantId, context: number, kitGb: StrixHaloKit): CalcInput {
  let input = applyGpuPreset('strix-halo', {
    ...DEFAULT_INPUT,
    ramGb: kitGb,
    vramGb: kitGb,
    kind: 'unified',
    usablePct: STRIX_HALO_USABLE_PCT,
    view: 'gpu',
  });
  input = applyModelPreset(modelId, input);
  return {
    ...input,
    gpuId: 'strix-halo',
    vramGb: kitGb,
    ramGb: kitGb,
    kind: 'unified',
    usablePct: STRIX_HALO_USABLE_PCT,
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

function kindLabel(kind: StrixFitKind): string {
  return kind === 'q3-estimate' ? 'Q3 estimate' : 'Estimate';
}

function leftoverAfterModel(kitGb: number, totalGiB: number): number {
  return kitGb - totalGiB;
}

function leftoverAfterShare(kitGb: number): number {
  return kitGb * (1 - STRIX_HALO_USABLE_PCT / 100);
}

function kitNeedGiB(input: CalcInput): number {
  const result = compute(input);
  return result.totalGiB + OS_DESKTOP_BASELINE_GIB + RAM_HEADROOM_GIB;
}

function shopperKitLabel(needGiB: number): string {
  if (needGiB <= 64 + 1e-9) return '64 GB kit';
  if (needGiB <= 128 + 1e-9) return '128 GB kit';
  return 'Does not fit a 128 GB kit';
}

function fitRow(modelId: ModelId, spec: (typeof STRIX_HALO_FIT_QUANTS)[number], context: number): StrixFitRow {
  const base = strixCalcInput(modelId, spec.id, context, 64);
  const weights = compute(base);
  const modelName = STRIX_HALO_MODELS.find((row) => row.id === modelId)?.name ?? modelId;
  return {
    modelId,
    model: modelName,
    quantId: spec.id,
    quant: spec.label,
    kind: spec.kind,
    kindLabel: kindLabel(spec.kind),
    context,
    contextLabel: formatCtx(context),
    weightsGb: `${formatGiB(weights.weightsGiB)} GB`,
    weightsNote: weights.weightsNote,
    speed: STRIX_HALO_SPEED,
    kits: STRIX_HALO_KITS.map((kitGb) => {
      const input = strixCalcInput(modelId, spec.id, context, kitGb);
      const result = compute(input);
      const leftover = leftoverAfterModel(kitGb, result.totalGiB);
      return {
        kitGb,
        sliceGb: `${formatGiB(result.usableVramGb)} GB`,
        totalGb: `${formatGiB(result.totalGiB)} GB`,
        leftoverGb: `${formatGiB(leftover)} GB`,
        leftoverNote:
          leftover >= 0
            ? `Left in the ${kitGb} GB kit after weights + KV + overhead.`
            : `The ${kitGb} GB kit is short of weights + KV + overhead.`,
        verdict: result.verdict,
        verdictLabel: result.verdictLabel,
        speed: STRIX_HALO_SPEED,
        calculatorHref: `/calculator?${inputToQuery(input)}`,
      };
    }),
  };
}

function ramLine(
  label: typeof RAM_MIN_LABEL | typeof RAM_FULL_LABEL,
  context: number,
): StrixRamLine {
  const input64 = strixCalcInput('qwen36', STRIX_HALO_RAM_QUANT, context, 64);
  const need = kitNeedGiB(input64);
  const left64 = leftoverAfterModel(64, compute(input64).totalGiB);
  const left128 = leftoverAfterModel(128, compute(strixCalcInput('qwen36', STRIX_HALO_RAM_QUANT, context, 128)).totalGiB);
  return {
    label,
    context,
    contextLabel: formatCtx(context),
    rawGiB: `${formatGiB(need)} GB`,
    kitLabel: shopperKitLabel(need),
    leftover64: `${formatGiB(left64)} GB`,
    leftover128: `${formatGiB(left128)} GB`,
    note: `${label} for Qwen3.6-35B-A3B on llama.cpp at ${STRIX_HALO_RAM_QUANT_LABEL}, ${formatCtx(context)}. One shared pool: model total plus the calculator OS/desktop (${OS_DESKTOP_BASELINE_GIB} GB) and headroom (${RAM_HEADROOM_GIB} GB). Estimate. AMD lists max memory 128 GB — we do not invent a larger Strix Halo kit.`,
  };
}

export function strixHaloPage() {
  const card = gpuDirectory.cards.find((row) => gpuCardId(row) === STRIX_HALO_ID);
  if (!card) throw new Error('gpus.yaml has no cited Strix Halo row');
  const preset = GPU_PRESETS.find((gpu) => gpu.id === STRIX_HALO_ID);
  if (!preset || preset.kind !== 'unified') throw new Error('strix-halo calculator preset must be unified');

  const fitRows = STRIX_HALO_MODELS.flatMap((model) =>
    STRIX_HALO_FIT_QUANTS.map((spec) => fitRow(model.id, spec, STRIX_HALO_RAM_CONTEXT)),
  );
  const ramMin = ramLine(RAM_MIN_LABEL, STRIX_HALO_RAM_CONTEXT);
  const ramFull = ramLine(RAM_FULL_LABEL, 262144);
  const calc64 = `/calculator?${inputToQuery(strixCalcInput('qwen36', STRIX_HALO_RAM_QUANT, STRIX_HALO_RAM_CONTEXT, 64))}`;
  const calc128 = `/calculator?${inputToQuery(strixCalcInput('qwen36', STRIX_HALO_RAM_QUANT, STRIX_HALO_RAM_CONTEXT, 128))}`;

  return {
    id: STRIX_HALO_ID,
    path: STRIX_HALO_PATH,
    name: STRIX_HALO_NAME,
    shortName: STRIX_HALO_SHORT,
    title: 'Ryzen AI Max / Strix Halo',
    description:
      'Cited Ryzen AI Max+ 395 (Radeon 8060S, gfx1151) local-AI guide. Shared system memory, llama.cpp Vulkan first. Not measured on local-desktop.',
    family: card.family,
    arch: card.arch,
    gfx: card.gfx,
    support: card.support,
    rocmNote: card.rocm_note,
    matrixHref: gpuDirectory.matrix,
    linuxReqsHref: gpuDirectory.linux_reqs,
    citedLabel: STRIX_HALO_CITED_LABEL,
    lead:
      'Strix Halo is an APU: CPU and GPU live on one chip and share one memory pool. There is no discrete VRAM sticker. Mini-PCs and laptops built on Ryzen AI Max+ 395 with Radeon 8060S (gfx1151) are the shopper box. AMD lists max system memory 128 GB (256-bit LPDDR5x). We size two kits — 64 GB and 128 GB — as calculator estimates.',
    uma:
      'BIOS UMA / VRAM carve-out is a reserved slice the firmware hands the iGPU at boot. GTT / dynamic allocation lets the driver grow into the rest of the same kit. AMD’s ROCm 10.1.0 GPU table prints VRAM for this SKU as Dynamic + carveout — not a 32 GB card. A large carve-out leaves less for the OS; a tiny carve-out leans on GTT. Check the board menu on /bios. We do not pin a megabyte number.',
    supportBody:
      'ROCm 10.1.0 lists AMD Ryzen AI Max+ 395 (Radeon 8060S) as gfx1151 on the Ryzen APU table. That is official support on the cited matrix, not a tok/s card. llama.cpp Vulkan is the AMDai first token — same rule as other consumer Radeon pages. HIP / ROCm is second, and only after rocminfo lists gfx1151. RDNA 3.5 notes add kernel-version caveats for Ryzen AI Max. The known MES queue-removal hang lives on /rocm-problems — this page does not retell it.',
    speedsBody:
      'No cited tok/s on this page. local-desktop has no Strix Halo card, and this repo has no third-party Strix Halo 64 GB or 128 GB speed row we can quote. Empty stays empty. Do not reuse R9700 numbers.',
    vsR9700:
      'Capacity versus bandwidth. Strix Halo can address a much larger shared pool (AMD max 128 GB). The R9700 is a 32 GB discrete card we actually measured, with a cited 640 GB/s figure. We do not invent an LPDDR5x GB/s number for the APU. Buy the APU when the file is bigger than 32 GB and you accept shared-memory speed. Buy the R9700 when you want the measured 35B in-VRAM path, or a second card. Two discrete cards are a different layout — see /multi-gpu. Against a Mac Studio, the shopper compare is /compare/radeon-vs-mac.',
    stackLab:
      'Radeon Stack Lab house profiles are the Ubuntu R9700 recipes. There is no Strix Halo package and no public download. Open in Stack Lab is not on this page because those profiles do not apply.',
    q3: COMPARE_Q3,
    q3Cite: COMPARE_Q3_CITE,
    usablePct: STRIX_HALO_USABLE_PCT,
    shareNote: `The calculator’s unified default is ${STRIX_HALO_USABLE_PCT}% of the kit as the GPU slice — an estimate, not a BIOS reading. A 64 GB kit yields ${formatGiB(64 * (STRIX_HALO_USABLE_PCT / 100))} GB; a 128 GB kit yields ${formatGiB(128 * (STRIX_HALO_USABLE_PCT / 100))} GB. Left for the OS after that slice is ${formatGiB(leftoverAfterShare(64))} GB and ${formatGiB(leftoverAfterShare(128))} GB.`,
    fitRows,
    ramMin,
    ramFull,
    ramNote: `${RAM_MIN_LABEL} and ${RAM_FULL_LABEL} below are the same two shopper labels as the rest of AMDai, adapted for one shared pool.`,
    calc64,
    calc128,
    sources: STRIX_HALO_SOURCES,
  };
}

export type StrixHaloPage = ReturnType<typeof strixHaloPage>;

export function strixHaloBlob(page: StrixHaloPage = strixHaloPage()): string {
  return [
    page.name,
    page.shortName,
    page.title,
    page.description,
    page.lead,
    page.uma,
    page.supportBody,
    page.speedsBody,
    page.vsR9700,
    page.stackLab,
    page.shareNote,
    page.ramNote,
    page.ramMin.note,
    page.ramFull.note,
    page.q3,
    page.q3Cite,
    page.rocmNote,
    page.fitRows.map((row) => `${row.model} ${row.quant} ${row.kindLabel} ${row.weightsNote}`).join('\n'),
  ].join('\n');
}

export function strixHaloHrefs(page: StrixHaloPage = strixHaloPage()): string[] {
  const extras = [
    page.path,
    page.calc64.split('?')[0] ?? '/calculator',
    page.matrixHref,
    page.linuxReqsHref,
    ...page.sources.map((source) => source.href),
    ...REQUIRED_STRIX_HALO_HREFS,
  ];
  return [...new Set(extras.map((href) => (href.split('?')[0] ?? href).split('#')[0] ?? href))];
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function assertStrixHaloValid(page: StrixHaloPage = strixHaloPage()): string[] {
  const errors: string[] = [];
  const blob = strixHaloBlob(page);
  const yamlIds = new Set(gpuDirectory.cards.map((card) => gpuCardId(card)));
  if (!yamlIds.has(STRIX_HALO_ID)) errors.push('missing gpus.yaml row');
  const preset = GPU_PRESETS.find((gpu) => gpu.id === STRIX_HALO_ID);
  if (!preset) errors.push('missing calculator preset');
  if (preset && preset.kind !== 'unified') errors.push('preset must be unified memory');
  if (page.citedLabel !== STRIX_HALO_CITED_LABEL) errors.push('cited label drifted');
  if (page.support !== 'official') errors.push('invented unofficial support');
  if (!page.matrixHref.startsWith('https://rocm.docs.amd.com/')) errors.push('matrix href');
  if (!/not measured on local-desktop/i.test(blob)) errors.push('must say not measured on local-desktop');
  if (!/llama\.cpp/i.test(blob)) errors.push('must say llama.cpp');
  if (!/Vulkan/i.test(blob)) errors.push('must say Vulkan');
  if (!/Dynamic \+ carveout/.test(blob)) errors.push('must cite Dynamic + carveout');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) errors.push('RAM labels missing');
  if (!/no cited (tok\/s|number)/i.test(blob)) errors.push('must refuse a missing speed');
  if (!/no Strix Halo package/i.test(blob)) errors.push('Stack Lab must stay unpublished for this SKU');
  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/\$\d|\bMSRP\b|\bUSD\b/i.test(blob)) errors.push('invented price');
  if (/\b\d+(?:\.\d+)?\s*tok\/s\b/i.test(blob)) errors.push('invented tok/s');
  if (page.fitRows.length !== STRIX_HALO_MODELS.length * STRIX_HALO_FIT_QUANTS.length) {
    errors.push('fit grid size drifted');
  }
  for (const row of page.fitRows) {
    if (row.speed !== STRIX_HALO_SPEED) errors.push(`${row.quant} invented speed`);
    if (row.kind === 'q3-estimate' && row.quant !== COMPARE_Q3) errors.push('Q3 row drifted');
    if (row.kind === 'q3-estimate' && !/estimate/i.test(row.kindLabel)) errors.push('Q3 unlabeled');
    for (const cell of row.kits) {
      if (cell.speed !== STRIX_HALO_SPEED) errors.push(`${row.quant} ${cell.kitGb} invented tok/s`);
      const live = compute(strixCalcInput(row.modelId, row.quantId, row.context, cell.kitGb));
      if (`${formatGiB(live.totalGiB)} GB` !== cell.totalGb) errors.push(`${row.model} ${row.quant} ${cell.kitGb} drifted`);
      if (live.tested) errors.push(`${row.quant} must not attach a measured badge`);
    }
  }
  if (!STRIX_HALO_KITS.every((kit) => (DIMM_KIT_GB as readonly number[]).includes(kit))) {
    errors.push('kit sizes are not real DIMM sizes');
  }
  if (page.ramMin.label !== RAM_MIN_LABEL || page.ramFull.label !== RAM_FULL_LABEL) {
    errors.push('RAM line labels drifted');
  }
  const hrefs = new Set(strixHaloHrefs(page));
  for (const required of REQUIRED_STRIX_HALO_HREFS) {
    if (![...hrefs].some((href) => href === required || href.startsWith(`${required}/`))) {
      errors.push(`missing required href ${required}`);
    }
  }
  for (const source of page.sources) {
    if (!source.href.startsWith('https://')) errors.push(`source ${source.id} must be https`);
  }
  return [...new Set(errors)];
}
