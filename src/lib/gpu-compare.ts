/**
 * Head-to-head GPU compare under /compare.
 * Built only from calculator presets, gpus.yaml, consumer sheets, and
 * existing R9700 run-card helpers. Q3 is a labeled estimate. Q1/Q2 stay off.
 * No invented prices or tok/s.
 */

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
  type QuantId,
  type SystemRamNeed,
  type Verdict,
} from './calculator';
import {
  CONSUMER_FIT_QUANTS,
  CONSUMER_SHOPPER_RAM_GB,
  consumerCalcInput,
  consumerPath,
  type ConsumerRecipeId,
} from './consumer-gpu';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { gpuCardId } from './gpu-ids';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { STRIX_HALO_PATH, STRIX_HALO_USABLE_PCT, strixCalcInput } from './strix-halo';
import type { GpuDirectory } from './status';
import { oneVsTwoRows } from './local-desktop-compare';
import { COMPARE_ENGINE, COMPARE_MODEL, COMPARE_Q3, COMPARE_Q3_CITE } from './local-desktop-compare';
import type { RunCard } from './run-card';

function readSrcData(name: string): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [join(here, '../data', name), join(process.cwd(), 'src/data', name)];
  for (const file of candidates) {
    if (existsSync(file)) return readFileSync(file, 'utf8');
  }
  throw new Error(`${name} missing`);
}

const gpuDirectory = parse(readSrcData('gpus.yaml')) as GpuDirectory;

export const GPU_COMPARE_PUBLISHED = '2026-10-14';
export const GPU_COMPARE_HUB = '/compare/gpus';
export const GPU_COMPARE_ENGINE = COMPARE_ENGINE;
export const GPU_COMPARE_MODEL = COMPARE_MODEL;
export const GPU_COMPARE_CONTEXTS = [4096, 32768] as const;
export const GPU_COMPARE_RAM_QUANT: QuantId = 'q4_k_m';
export const GPU_COMPARE_RAM_QUANT_LABEL = 'Q4_K_M';
export const GPU_COMPARE_RAM_CONTEXT = 32768;

export const GPU_COMPARE_IDS = [
  'r9700',
  'rx7900xtx',
  'rx7900xt',
  'rx9070xt',
  'rx9060xt',
  'rx7900gre',
  'rx7800xt',
  'rx7700xt',
  'rx7600xt',
  'rx7600',
  'rx6800xt',
  'rx6700xt',
  'strix-halo',
] as const;

export type GpuCompareId = (typeof GPU_COMPARE_IDS)[number];

export const GPU_COMPARE_SLUG: Record<GpuCompareId, string> = {
  r9700: 'r9700',
  rx7900xtx: 'rx-7900-xtx',
  rx7900xt: 'rx-7900-xt',
  rx9070xt: 'rx-9070-xt',
  rx9060xt: 'rx-9060-xt',
  rx7900gre: 'rx-7900-gre',
  rx7800xt: 'rx-7800-xt',
  rx7700xt: 'rx-7700-xt',
  rx7600xt: 'rx-7600-xt',
  rx7600: 'rx-7600',
  rx6800xt: 'rx-6800-xt',
  rx6700xt: 'rx-6700-xt',
  'strix-halo': 'strix-halo',
};

export const GPU_COMPARE_SHORT: Record<GpuCompareId, string> = {
  r9700: 'R9700',
  rx7900xtx: 'RX 7900 XTX',
  rx7900xt: 'RX 7900 XT',
  rx9070xt: 'RX 9070 XT',
  rx9060xt: 'RX 9060 XT',
  rx7900gre: 'RX 7900 GRE',
  rx7800xt: 'RX 7800 XT',
  rx7700xt: 'RX 7700 XT',
  rx7600xt: 'RX 7600 XT',
  rx7600: 'RX 7600',
  rx6800xt: 'RX 6800 XT',
  rx6700xt: 'RX 6700 XT',
  'strix-halo': 'Strix Halo',
};

export const GPU_COMPARE_PRODUCT: Record<GpuCompareId, string> = {
  r9700: 'r9700',
  rx7900xtx: 'rx7900xtx',
  rx7900xt: 'rx7900xt',
  rx9070xt: 'rx9070xt',
  rx9060xt: 'rx9060xt',
  rx7900gre: 'rx7900gre',
  rx7800xt: 'rx7800xt',
  rx7700xt: 'rx7700xt',
  rx7600xt: 'rx7600xt',
  rx7600: 'rx7600',
  rx6800xt: 'rx6800xt',
  rx6700xt: 'rx6700xt',
  'strix-halo': 'strix-halo',
};

/** Shopper-useful pairs highlighted on the picker. Canonical href still uses catalog order. */
export const GPU_COMPARE_FEATURED_PAIRS = [
  ['r9700', 'rx9070xt'],
  ['r9700', 'rx7900xtx'],
  ['rx7900xtx', 'rx7900xt'],
  ['rx7900xtx', 'rx9070xt'],
  ['rx9070xt', 'rx9060xt'],
  ['r9700', 'strix-halo'],
  ['rx7900gre', 'rx9070xt'],
  ['rx7900xt', 'rx7900gre'],
  ['rx6800xt', 'rx7700xt'],
  ['rx7800xt', 'rx7700xt'],
  ['rx7800xt', 'rx9070xt'],
  ['rx7600xt', 'rx7600'],
  ['rx6700xt', 'rx7700xt'],
  ['r9700', 'rx9060xt'],
  ['rx6800xt', 'rx7600xt'],
  ['rx9070xt', 'strix-halo'],
  ['rx6700xt', 'rx6800xt'],
  ['rx9060xt', 'rx7600xt'],
] as const satisfies ReadonlyArray<readonly [GpuCompareId, GpuCompareId]>;

export const GPU_COMPARE_SHEET_PATH: Record<GpuCompareId, string> = {
  r9700: '/gpus/r9700',
  rx7900xtx: consumerPath('rx7900xtx'),
  rx7900xt: consumerPath('rx7900xt'),
  rx9070xt: consumerPath('rx9070xt'),
  rx9060xt: consumerPath('rx9060xt'),
  rx7900gre: consumerPath('rx7900gre'),
  rx7800xt: consumerPath('rx7800xt'),
  rx7700xt: consumerPath('rx7700xt'),
  rx7600xt: consumerPath('rx7600xt'),
  rx7600: consumerPath('rx7600'),
  rx6800xt: consumerPath('rx6800xt'),
  rx6700xt: consumerPath('rx6700xt'),
  'strix-halo': STRIX_HALO_PATH,
};

const SLUG_TO_ID = Object.fromEntries(
  (Object.entries(GPU_COMPARE_SLUG) as Array<[GpuCompareId, string]>).map(([id, slug]) => [slug, id]),
) as Record<string, GpuCompareId>;

export type GpuCompareFitKind = 'estimate' | 'q3-estimate' | 'measured';

export type GpuCompareFitCell = {
  context: number;
  contextLabel: string;
  totalGb: string;
  verdict: Verdict;
  verdictLabel: string;
  speed: string;
  speedKind: GpuCompareFitKind;
  runIds: string[];
  note: string;
};

export type GpuCompareFitRow = {
  quantId: QuantId;
  quant: string;
  kind: GpuCompareFitKind;
  kindLabel: string;
  weightsGb: string;
  weightsNote: string;
  left: GpuCompareFitCell[];
  right: GpuCompareFitCell[];
};

export type GpuCompareSide = {
  id: GpuCompareId;
  slug: string;
  path: string;
  name: string;
  shortName: string;
  productId: string;
  family: string;
  arch: string;
  gfx: string;
  vramGb: number;
  vramLabel: string;
  vramNote: string;
  bandwidthGBs: number;
  bandwidthLabel: string;
  bandwidthNote: string;
  support: 'official' | 'unofficial';
  rocmNote: string;
  hsaOverride: string;
  measured: boolean;
  kind: 'discrete' | 'unified';
  matrixHref: string;
  linuxReqsHref: string;
  calculatorHref: string;
  ramNeed: SystemRamNeed;
  offload: boolean;
};

export type GpuCompareUseCase = {
  id: 'chat' | 'coding' | 'long-context' | 'image-gen';
  title: string;
  body: string;
};

export type GpuComparePairPage = {
  slug: string;
  path: string;
  left: GpuCompareSide;
  right: GpuCompareSide;
  title: string;
  heading: string;
  description: string;
  lead: string;
  model: string;
  engine: string;
  q3: string;
  q3Cite: string;
  fitRows: GpuCompareFitRow[];
  supportNotes: { title: string; body: string }[];
  useCases: GpuCompareUseCase[];
  productIds: string[];
  featured: boolean;
};

export type GpuCompareLink = {
  href: string;
  label: string;
  featured: boolean;
};

export type GpuCompareHubCard = {
  href: string;
  title: string;
  kicker: string;
  body: string;
};

function directoryCard(id: GpuCompareId) {
  const card = gpuDirectory.cards.find((row) => gpuCardId(row) === id);
  if (!card) throw new Error(`gpus.yaml has no cited row for ${id}`);
  return card;
}

function presetFor(id: GpuCompareId) {
  const preset = GPU_PRESETS.find((gpu) => gpu.id === id);
  if (!preset) throw new Error(`${id} is missing a calculator preset`);
  return preset;
}

export function isGpuCompareId(id: string): id is GpuCompareId {
  return (GPU_COMPARE_IDS as readonly string[]).includes(id);
}

export function gpuCompareIdFromInput(raw: string | null | undefined): GpuCompareId | null {
  if (!raw) return null;
  const key = raw.trim().toLowerCase();
  if (isGpuCompareId(key)) return key;
  return SLUG_TO_ID[key] ?? null;
}

export function canonicalizeGpuComparePair(a: GpuCompareId, b: GpuCompareId): [GpuCompareId, GpuCompareId] {
  const ia = GPU_COMPARE_IDS.indexOf(a);
  const ib = GPU_COMPARE_IDS.indexOf(b);
  if (ia < 0 || ib < 0) throw new Error(`unknown GPU compare id ${a} / ${b}`);
  return ia <= ib ? [a, b] : [b, a];
}

export function gpuComparePairSlug(a: GpuCompareId, b: GpuCompareId): string {
  const [left, right] = canonicalizeGpuComparePair(a, b);
  return `${GPU_COMPARE_SLUG[left]}-vs-${GPU_COMPARE_SLUG[right]}`;
}

export function gpuComparePairPath(a: GpuCompareId, b: GpuCompareId): string {
  return `/compare/${gpuComparePairSlug(a, b)}`;
}

export function parseGpuCompareSlug(slug: string): [GpuCompareId, GpuCompareId] | null {
  const parts = slug.split('-vs-');
  if (parts.length !== 2) return null;
  const a = gpuCompareIdFromInput(parts[0]);
  const b = gpuCompareIdFromInput(parts[1]);
  if (!a || !b || a === b) return null;
  return [a, b];
}

export function isGpuComparePairPath(path: string): boolean {
  if (!path.startsWith('/compare/')) return false;
  return parseGpuCompareSlug(path.slice('/compare/'.length)) !== null;
}

export function isFeaturedGpuComparePair(a: GpuCompareId, b: GpuCompareId): boolean {
  return GPU_COMPARE_FEATURED_PAIRS.some(
    ([left, right]) => (left === a && right === b) || (left === b && right === a),
  );
}

export function gpuCompareRedirects(): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < GPU_COMPARE_IDS.length; i += 1) {
    for (let j = i + 1; j < GPU_COMPARE_IDS.length; j += 1) {
      const left = GPU_COMPARE_IDS[i]!;
      const right = GPU_COMPARE_IDS[j]!;
      const canonical = gpuComparePairPath(left, right);
      const reverse = `/compare/${GPU_COMPARE_SLUG[right]}-vs-${GPU_COMPARE_SLUG[left]}`;
      out[reverse] = canonical;
    }
  }
  return out;
}

export function gpuCompareCalcInput(id: GpuCompareId, quant: QuantId, context: number): CalcInput {
  if (id === 'strix-halo') return strixCalcInput('qwen36', quant, context, 64);
  if (id === 'r9700') {
    let input = applyGpuPreset('r9700', {
      ...DEFAULT_INPUT,
      ramGb: CONSUMER_SHOPPER_RAM_GB,
      view: 'gpu',
    });
    input = applyModelPreset('qwen36', input);
    return {
      ...input,
      gpuId: 'r9700',
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
  return consumerCalcInput(id as ConsumerRecipeId, quant, context);
}

function kindLabel(kind: GpuCompareFitKind): string {
  if (kind === 'q3-estimate') return 'Q3 estimate';
  if (kind === 'measured') return 'Measured';
  return 'Estimate';
}

function vramLabelFor(id: GpuCompareId, vramGb: number): string {
  if (id === 'strix-halo') return '64 GB shared kit';
  return `${vramGb} GB`;
}

function vramNoteFor(id: GpuCompareId): string {
  if (id === 'strix-halo') {
    return `Unified LPDDR5x, not a discrete sticker. ${STRIX_HALO_USABLE_PCT}% usable is a house estimate so the OS keeps a slice. A 128 GB kit exists — size it on the Strix Halo sheet.`;
  }
  if (id === 'r9700') return 'Cited 32 GB workstation sticker. Measured north star on local-desktop.';
  return 'Cited AMD-published SKU size, not a bench.';
}

function bandwidthLabel(bandwidthGBs: number): string {
  if (bandwidthGBs > 0) return `${bandwidthGBs} GB/s`;
  return 'not listed here';
}

function sideOffload(id: GpuCompareId): boolean {
  return GPU_COMPARE_CONTEXTS.some((context) => {
    const result = compute(gpuCompareCalcInput(id, GPU_COMPARE_RAM_QUANT, context));
    return result.verdict !== 'fits';
  });
}

export function gpuCompareSide(id: GpuCompareId): GpuCompareSide {
  const card = directoryCard(id);
  const preset = presetFor(id);
  const vramGb = id === 'strix-halo' ? 64 : (card.vram_gb ?? preset.vramGb);
  if (!(vramGb > 0)) throw new Error(`${id} is missing a published VRAM hardware label`);
  const ramInput = gpuCompareCalcInput(id, GPU_COMPARE_RAM_QUANT, GPU_COMPARE_RAM_CONTEXT);
  const ramNeed = systemRamNeed(ramInput);
  return {
    id,
    slug: GPU_COMPARE_SLUG[id],
    path: GPU_COMPARE_SHEET_PATH[id],
    name: card.name,
    shortName: GPU_COMPARE_SHORT[id],
    productId: GPU_COMPARE_PRODUCT[id],
    family: card.family,
    arch: card.arch,
    gfx: card.gfx,
    vramGb,
    vramLabel: vramLabelFor(id, vramGb),
    vramNote: vramNoteFor(id),
    bandwidthGBs: preset.bandwidthGBs,
    bandwidthLabel: bandwidthLabel(preset.bandwidthGBs),
    bandwidthNote: preset.bandwidthNote,
    support: card.support,
    rocmNote: card.rocm_note,
    hsaOverride: card.hsa_override,
    measured: id === 'r9700',
    kind: preset.kind === 'unified' ? 'unified' : 'discrete',
    matrixHref: gpuDirectory.matrix,
    linuxReqsHref: gpuDirectory.linux_reqs,
    calculatorHref: `/calculator?${inputToQuery(ramInput)}`,
    ramNeed,
    offload: sideOffload(id),
  };
}

function r9700MeasuredDecode(
  cards: RunCard[],
  quant: string,
  context: number,
): { decode: string; kind: GpuCompareFitKind; runIds: string[]; note: string } {
  if (quant === COMPARE_Q3) {
    return {
      decode: 'not measured',
      kind: 'q3-estimate',
      runIds: [],
      note: `${COMPARE_Q3_CITE}. Q3 is an option labeled estimate — not a local-desktop run.`,
    };
  }
  const row = oneVsTwoRows(cards).find((item) => item.quant === quant && item.context === context);
  const decode = row?.one.decode ?? 'not measured';
  if (!row || decode === 'not measured') {
    return {
      decode: 'not measured',
      kind: 'estimate',
      runIds: [],
      note: 'No official local-desktop cell for this quant × context. Empty stays not measured.',
    };
  }
  return {
    decode,
    kind: 'measured',
    runIds: row.one.runIds,
    note: 'Official local-desktop llama.cpp Vulkan card on one R9700.',
  };
}

function fitCell(
  id: GpuCompareId,
  spec: (typeof CONSUMER_FIT_QUANTS)[number],
  context: number,
  cards: RunCard[],
): GpuCompareFitCell {
  const result = compute(gpuCompareCalcInput(id, spec.id, context));
  const measured =
    id === 'r9700' ? r9700MeasuredDecode(cards, spec.label, context) : null;
  const q3 = spec.kind === 'q3-estimate';
  return {
    context,
    contextLabel: formatCtx(context),
    totalGb: `${formatGiB(result.totalGiB)} GB`,
    verdict: result.verdict,
    verdictLabel: result.verdictLabel,
    speed: measured?.decode ?? (id === 'r9700' ? 'not measured' : 'not measured'),
    speedKind: measured?.kind ?? (q3 ? 'q3-estimate' : 'estimate'),
    runIds: measured?.runIds ?? [],
    note: measured?.note ?? (q3 ? `${COMPARE_Q3_CITE}. Q3 is an option labeled estimate.` : 'Calculator estimate. Not measured on local-desktop.'),
  };
}

function fitRows(left: GpuCompareId, right: GpuCompareId, cards: RunCard[]): GpuCompareFitRow[] {
  return CONSUMER_FIT_QUANTS.map((spec) => {
    const weights = compute(gpuCompareCalcInput(left, spec.id, GPU_COMPARE_CONTEXTS[0]));
    return {
      quantId: spec.id,
      quant: spec.label,
      kind: spec.kind,
      kindLabel: kindLabel(spec.kind),
      weightsGb: `${formatGiB(weights.weightsGiB)} GB`,
      weightsNote: weights.weightsNote,
      left: GPU_COMPARE_CONTEXTS.map((context) => fitCell(left, spec, context, cards)),
      right: GPU_COMPARE_CONTEXTS.map((context) => fitCell(right, spec, context, cards)),
    };
  });
}

function q4Fits(id: GpuCompareId, context: number): boolean {
  return compute(gpuCompareCalcInput(id, 'q4_k_m', context)).verdict === 'fits';
}

function pairLead(left: GpuCompareSide, right: GpuCompareSide): string {
  const sameGfx = left.gfx === right.gfx;
  const gfxBit = sameGfx
    ? `Same ${left.gfx} family package.`
    : `${left.shortName} is ${left.gfx}; ${right.shortName} is ${right.gfx} — do not mix those ROCm pins.`;
  const vramBit = `${left.shortName} is ${left.vramLabel}; ${right.shortName} is ${right.vramLabel}.`;
  const leftFit = q4Fits(left.id, 4096);
  const rightFit = q4Fits(right.id, 4096);
  const fitBit =
    leftFit && rightFit
      ? `House 35B Q4_K_M fits both at 4K on the calculator.`
      : leftFit && !rightFit
        ? `House 35B Q4–Q6 files fit ${left.shortName} at 4K on the calculator and spill on ${right.shortName}.`
        : !leftFit && rightFit
          ? `House 35B Q4–Q6 files fit ${right.shortName} at 4K on the calculator and spill on ${left.shortName}.`
          : `House 35B Q4–Q6 files do not sit in either VRAM on the calculator — expect RAM offload or a listed Q3 file, both estimates.`;
  const measuredBit = left.measured
    ? `${left.shortName} has measured 35B llama.cpp cards on local-desktop. ${right.shortName} speed stays not measured.`
    : right.measured
      ? `${right.shortName} has measured 35B llama.cpp cards on local-desktop. ${left.shortName} speed stays not measured.`
      : `Neither card was measured on local-desktop. Fit numbers are calculator estimates.`;
  return `${gfxBit} ${vramBit} ${fitBit} ${measuredBit} llama.cpp first.`;
}

function supportNotes(left: GpuCompareSide, right: GpuCompareSide): { title: string; body: string }[] {
  const sameGfx = left.gfx === right.gfx;
  const vulkanFirst =
    left.support === 'unofficial' || right.support === 'unofficial'
      ? 'Consumer RDNA 2 on this list is unofficial on the current Radeon ROCm row (W6800 gfx1030 is the official workstation listing). Prefer Vulkan llama.cpp if HIP is angry.'
      : 'Vulkan llama.cpp is the consumer default. HIP when rocminfo lists the gfx on this page.';
  return [
    {
      title: 'llama.cpp first',
      body: `${vulkanFirst} Ollama and vLLM are not the house path on these sheets.`,
    },
    {
      title: sameGfx ? `Same ${left.gfx} pin` : 'Different gfx family packages',
      body: sameGfx
        ? `Both cards share ${left.gfx}. Install that family package. Re-check the cited ROCm matrix before you mix a build.`
        : `${left.shortName} needs the ${left.gfx} family package (${left.rocmNote}) ${right.shortName} needs ${right.gfx} (${right.rocmNote}) Do not mix those pins.`,
    },
    {
      title: 'Cited support rows',
      body: `${left.shortName}: ${left.support} — ${left.rocmNote} ${right.shortName}: ${right.support} — ${right.rocmNote}`,
    },
  ];
}

function moreVram(left: GpuCompareSide, right: GpuCompareSide): GpuCompareSide {
  if (left.kind === 'unified' && right.kind !== 'unified') return left.vramGb >= right.vramGb ? left : right;
  if (right.kind === 'unified' && left.kind !== 'unified') return right.vramGb >= left.vramGb ? right : left;
  if (left.vramGb !== right.vramGb) return left.vramGb > right.vramGb ? left : right;
  return left.measured ? left : right.measured ? right : left;
}

function useCases(left: GpuCompareSide, right: GpuCompareSide): GpuCompareUseCase[] {
  const leftQ4 = q4Fits(left.id, 4096);
  const rightQ4 = q4Fits(right.id, 4096);
  const leftQ432 = q4Fits(left.id, 32768);
  const rightQ432 = q4Fits(right.id, 32768);
  const bigger = moreVram(left, right);
  const smaller = bigger.id === left.id ? right : left;
  const measured = left.measured ? left : right.measured ? right : null;

  const chat =
    leftQ4 && rightQ4
      ? `Both cards hold house 35B Q4_K_M at 4K on the calculator. ${measured ? `${measured.shortName} is the measured local-desktop card — read those tok/s, do not copy them onto ${smaller.shortName}.` : 'Neither side has a local-desktop tok/s. Pick on VRAM headroom and the gfx package you can install, not a speed we invent.'}`
      : leftQ4 !== rightQ4
        ? `${leftQ4 ? left.shortName : right.shortName} holds house 35B Q4 at 4K in the calculator VRAM pool. ${leftQ4 ? right.shortName : left.shortName} needs RAM offload or a listed ${COMPARE_Q3} file — that Q3 is a labeled estimate (${COMPARE_Q3_CITE}).`
        : `Neither card holds house 35B Q4–Q6 in VRAM on the calculator. Chat still works with RAM offload — read ${RAM_MIN_LABEL} and ${RAM_FULL_LABEL} below — or a listed ${COMPARE_Q3} estimate. ${bigger.shortName} has the larger memory class on this pair.`;

  const coding =
    measured && measured.id === 'r9700'
      ? `Coding agents want the file in VRAM and a stable llama.cpp server. The house daily-driver and agent recipes are measured on the R9700. ${smaller.shortName} is ${smaller.vramLabel} — size Q4 on the calculator before you assume that recipe applies. We do not invent an agent tok/s for ${smaller.shortName}.`
      : leftQ4 || rightQ4
        ? `Keep llama.cpp first. The side that holds Q4 in VRAM (${leftQ4 ? left.shortName : ''}${leftQ4 && rightQ4 ? ' and ' : ''}${rightQ4 ? right.shortName : ''}) is the less painful coding-agent host. House Flash / agent pins stay R9700 / local-desktop — they do not transfer. No invented agent speed.`
        : `Both sides offload house 35B Q4. A coding agent will share that RAM spill. ${RAM_MIN_LABEL} and ${RAM_FULL_LABEL} are the shopper lines. We do not invent a tokens-per-tool figure.`;

  const longCtx =
    measured && measured.id === 'r9700'
      ? `Long context is a KV-cache problem. Measured 128K–262K 35B llama.cpp cards live on the R9700 page and /long-context. ${smaller.shortName} has less headroom — Q4 at 32K is ${right.id === 'r9700' ? (leftQ432 ? 'a calculator fit' : 'a calculator spill') : rightQ432 ? 'a calculator fit' : 'a calculator spill'} on that card. Empty speed cells stay not measured.`
      : `KV grows with context. Q4 at 32K ${leftQ432 ? `fits ${left.shortName}` : `spills on ${left.shortName}`} and ${rightQ432 ? `fits ${right.shortName}` : `spills on ${right.shortName}`} on the calculator. Read the long-context guide for the measured R9700 128K–262K cards. We do not invent a 128K tok/s here.`;

  const imageLeft = imageGenClass(left);
  const imageRight = imageGenClass(right);
  const image = `Image gen on AMDai is ComfyUI / HIP PyTorch, not llama.cpp. ${left.shortName} is the ${imageLeft} class; ${right.shortName} is the ${imageRight} class. Seconds-per-image stay not yet measured by AMDai. Start smaller (SD 1.5) on 8 / 12 / 16 GB class cards. Flux-class is tighter than SDXL. Size the checkpoint on the image-gen guide — do not copy a tok/s from the LLM table.`;

  return [
    { id: 'chat', title: 'Chat', body: chat },
    { id: 'coding', title: 'Coding agents', body: coding },
    { id: 'long-context', title: 'Long context', body: longCtx },
    { id: 'image-gen', title: 'Image gen', body: image },
  ];
}

function imageGenClass(side: GpuCompareSide): string {
  if (side.kind === 'unified') return 'shared-memory (Strix Halo) — not a 32 GB discrete sticker';
  if (side.vramGb >= 32) return '32 GB discrete';
  if (side.vramGb >= 16) return '16 GB discrete';
  if (side.vramGb >= 12) return '12 GB discrete';
  return '8 GB discrete';
}

function pairDescription(left: GpuCompareSide, right: GpuCompareSide): string {
  return `${left.shortName} vs ${right.shortName} for local AI — ${left.vramLabel} vs ${right.vramLabel}, ${left.gfx} vs ${right.gfx}. 35B Q6/Q5/Q4 fit estimates; ${COMPARE_Q3} labeled estimate. No invented prices.`;
}

export function gpuComparePairPage(a: GpuCompareId, b: GpuCompareId, cards: RunCard[] = []): GpuComparePairPage {
  if (a === b) throw new Error('cannot compare a GPU with itself');
  const [leftId, rightId] = canonicalizeGpuComparePair(a, b);
  const left = gpuCompareSide(leftId);
  const right = gpuCompareSide(rightId);
  const slug = gpuComparePairSlug(leftId, rightId);
  return {
    slug,
    path: `/compare/${slug}`,
    left,
    right,
    title: `${left.shortName} vs ${right.shortName}`,
    heading: `${left.shortName} vs ${right.shortName} for local AI`,
    description: pairDescription(left, right),
    lead: pairLead(left, right),
    model: GPU_COMPARE_MODEL,
    engine: GPU_COMPARE_ENGINE,
    q3: COMPARE_Q3,
    q3Cite: COMPARE_Q3_CITE,
    fitRows: fitRows(leftId, rightId, cards),
    supportNotes: supportNotes(left, right),
    useCases: useCases(left, right),
    productIds: [left.productId, right.productId],
    featured: isFeaturedGpuComparePair(leftId, rightId),
  };
}

export function gpuComparePairPages(cards: RunCard[] = []): GpuComparePairPage[] {
  const pages: GpuComparePairPage[] = [];
  for (let i = 0; i < GPU_COMPARE_IDS.length; i += 1) {
    for (let j = i + 1; j < GPU_COMPARE_IDS.length; j += 1) {
      pages.push(gpuComparePairPage(GPU_COMPARE_IDS[i]!, GPU_COMPARE_IDS[j]!, cards));
    }
  }
  return pages;
}

export function gpuCompareFeaturedPages(cards: RunCard[] = []): GpuComparePairPage[] {
  const seen = new Set<string>();
  const pages: GpuComparePairPage[] = [];
  for (const [a, b] of GPU_COMPARE_FEATURED_PAIRS) {
    const page = gpuComparePairPage(a, b, cards);
    if (seen.has(page.path)) continue;
    seen.add(page.path);
    pages.push(page);
  }
  return pages;
}

export function gpuCompareLinksFor(id: GpuCompareId): GpuCompareLink[] {
  return GPU_COMPARE_IDS.filter((other) => other !== id)
    .map((other) => ({
      href: gpuComparePairPath(id, other),
      label: GPU_COMPARE_SHORT[other],
      featured: isFeaturedGpuComparePair(id, other),
    }))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.label.localeCompare(b.label));
}

export function gpuCompareHubCards(): GpuCompareHubCard[] {
  return gpuCompareFeaturedPages().map((page) => ({
    href: page.path,
    title: page.title,
    kicker: `${page.left.vramLabel} vs ${page.right.vramLabel}`,
    body: page.lead,
  }));
}

export function parseGpuComparePicker(search: string): {
  a: GpuCompareId | null;
  b: GpuCompareId | null;
  href: string | null;
} {
  const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const a = gpuCompareIdFromInput(q.get('a'));
  const b = gpuCompareIdFromInput(q.get('b'));
  if (!a || !b || a === b) return { a, b, href: null };
  return { a, b, href: gpuComparePairPath(a, b) };
}

export function gpuCompareSeoRows(): Array<{ path: string; title: string; description: string; published: string }> {
  const hub = {
    path: GPU_COMPARE_HUB,
    title: 'Compare AMD GPUs',
    description:
      'Pick two Radeon GPUs that already have AMDai sheets. Compare VRAM, bandwidth, 35B Q6/Q5/Q4 fit estimates, and a labeled Q3 estimate. No invented prices.',
    published: GPU_COMPARE_PUBLISHED,
  };
  return [
    hub,
    ...gpuComparePairPages().map((page) => ({
      path: page.path,
      title: page.title,
      description: page.description,
      published: GPU_COMPARE_PUBLISHED,
    })),
  ];
}

export function gpuCompareBlob(page: GpuComparePairPage): string {
  return [
    page.title,
    page.heading,
    page.description,
    page.lead,
    page.q3,
    page.q3Cite,
    page.left.rocmNote,
    page.right.rocmNote,
    page.left.vramNote,
    page.right.vramNote,
    page.left.bandwidthNote,
    page.right.bandwidthNote,
    page.supportNotes.map((note) => `${note.title} ${note.body}`).join('\n'),
    page.useCases.map((row) => `${row.title} ${row.body}`).join('\n'),
    page.fitRows.map((row) => `${row.quant} ${row.kindLabel} ${row.weightsNote}`).join('\n'),
    RAM_MIN_LABEL,
    RAM_FULL_LABEL,
  ].join('\n');
}

export const GPU_COMPARE_HUB_LEAD =
  `Pick two Radeon GPUs that already have AMDai sheets — R9700, RX 9070 XT, RX 9060 XT, RX 7900 GRE, RX 7700 XT, RX 7600 XT, RX 7600, RX 6800 XT, RX 6700 XT, and Strix Halo. Each pair page uses VRAM and bandwidth from the existing GPU data, calculator fit for ${COMPARE_MODEL} on ${COMPARE_ENGINE} at Q6 / Q5 / Q4 plus a labeled ${COMPARE_Q3} estimate, and ROCm notes from the cited gfx rows. Measured tok/s appear only on the R9700 side. We do not invent a price. ${RAM_MIN_LABEL} and ${RAM_FULL_LABEL} print wherever a file spills to system RAM.`;

export function gpuCompareHrefs(page: GpuComparePairPage): string[] {
  return [
    page.path,
    GPU_COMPARE_HUB,
    '/compare',
    page.left.path,
    page.right.path,
    page.left.calculatorHref.split('?')[0] ?? '/calculator',
    '/gpus/r9700',
    '/compare/radeon-vs-nvidia',
    '/long-context',
    '/image-gen',
    '/backends/llamacpp',
    '/calculator',
    '/faq',
    '/methodology',
    '/disclosure',
  ];
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');
const PRICE = /\$\d|\bMSRP\b|\bUSD\b/i;

export function assertGpuCompareValid(cards: RunCard[] = []): string[] {
  const errors: string[] = [];
  const expected = (GPU_COMPARE_IDS.length * (GPU_COMPARE_IDS.length - 1)) / 2;
  const pages = gpuComparePairPages(cards);
  if (pages.length !== expected) errors.push(`expected ${expected} pair pages; got ${pages.length}`);

  const ids = [...GPU_COMPARE_IDS];
  if (ids.join(',') !== 'r9700,rx7900xtx,rx7900xt,rx9070xt,rx9060xt,rx7900gre,rx7800xt,rx7700xt,rx7600xt,rx7600,rx6800xt,rx6700xt,strix-halo') {
    errors.push(`catalog drifted: ${ids.join(', ')}`);
  }

  const yamlIds = new Set(gpuDirectory.cards.map((card) => gpuCardId(card)));
  const presetIds = new Set(GPU_PRESETS.map((gpu) => gpu.id));
  for (const id of GPU_COMPARE_IDS) {
    if (!yamlIds.has(id)) errors.push(`${id} missing gpus.yaml row`);
    if (!presetIds.has(id)) errors.push(`${id} missing calculator preset`);
  }

  const seen = new Set<string>();
  for (const page of pages) {
    if (seen.has(page.path)) errors.push(`duplicate ${page.path}`);
    seen.add(page.path);
    if (!page.path.startsWith('/compare/')) errors.push(`${page.path} not under /compare`);
    if (page.left.id === page.right.id) errors.push(`${page.path} compared a card to itself`);
    if (GPU_COMPARE_IDS.indexOf(page.left.id) >= GPU_COMPARE_IDS.indexOf(page.right.id)) {
      errors.push(`${page.path} is not catalog-canonical`);
    }

    const quants = page.fitRows.map((row) => row.quant);
    if (!quants.includes('Q6_K')) errors.push(`${page.path} missing Q6_K`);
    if (!quants.includes('Q5_K_M')) errors.push(`${page.path} missing Q5_K_M`);
    if (!quants.includes('Q4_K_M')) errors.push(`${page.path} missing Q4_K_M`);
    if (!quants.includes(COMPARE_Q3)) errors.push(`${page.path} missing ${COMPARE_Q3}`);

    for (const row of page.fitRows) {
      if (row.kind === 'q3-estimate') {
        if (row.quant !== COMPARE_Q3) errors.push(`${page.path} Q3 row is not ${COMPARE_Q3}`);
        if (!/estimate/i.test(row.kindLabel)) errors.push(`${page.path} Q3 unlabeled`);
      }
      for (const cell of [...row.left, ...row.right]) {
        if (!cell.totalGb.endsWith(' GB')) errors.push(`${page.path} ${row.quant} missing GB label`);
        if (row.kind === 'q3-estimate' && !/estimate/i.test(cell.note)) {
          errors.push(`${page.path} Q3 cell unlabeled`);
        }
      }
      for (const cell of row.right) {
        if (page.right.id !== 'r9700' && cell.speed !== 'not measured') {
          errors.push(`${page.path} invented ${page.right.shortName} tok/s`);
        }
        if (cell.speedKind === 'measured') errors.push(`${page.path} measured badge on the right`);
      }
      for (const cell of row.left) {
        if (page.left.id !== 'r9700' && cell.speed !== 'not measured') {
          errors.push(`${page.path} invented ${page.left.shortName} tok/s`);
        }
        if (page.left.id !== 'r9700' && cell.speedKind === 'measured') {
          errors.push(`${page.path} measured badge on a non-R9700 side`);
        }
        if (page.left.id === 'r9700' && row.quant === COMPARE_Q3 && cell.speed !== 'not measured') {
          errors.push(`${page.path} invented Q3 tok/s`);
        }
      }
    }

    if (page.left.offload || page.right.offload) {
      if (page.left.offload && page.left.ramNeed.atSelected.label !== 'estimate' && !page.left.measured) {
        errors.push(`${page.path} ${page.left.id} RAM must stay estimate`);
      }
      if (page.right.offload && page.right.ramNeed.atSelected.label !== 'estimate') {
        errors.push(`${page.path} ${page.right.id} RAM must stay estimate`);
      }
    }
    for (const side of [page.left, page.right]) {
      if (!(DIMM_KIT_GB as readonly number[]).includes(side.ramNeed.atSelected.kitGb)) {
        errors.push(`${page.path} ${side.id} min kit ${side.ramNeed.atSelected.kitGb} is not a real DIMM size`);
      }
      if (!(DIMM_KIT_GB as readonly number[]).includes(side.ramNeed.atFullContext.kitGb)) {
        errors.push(`${page.path} ${side.id} full kit ${side.ramNeed.atFullContext.kitGb} is not a real DIMM size`);
      }
    }

    const blob = gpuCompareBlob(page);
    if (!blob.includes(RAM_MIN_LABEL)) errors.push(`${page.path} missing ${RAM_MIN_LABEL}`);
    if (!blob.includes(RAM_FULL_LABEL)) errors.push(`${page.path} missing ${RAM_FULL_LABEL}`);
    if (!blob.includes(COMPARE_Q3)) errors.push(`${page.path} missing Q3 name`);
    if (!/estimate/i.test(blob)) errors.push(`${page.path} missing estimate label`);
    if (!/llama\.cpp/i.test(blob)) errors.push(`${page.path} missing llama.cpp`);
    if (BANNED.test(blob)) errors.push(`${page.path} banned model`);
    if (Q1Q2.test(blob)) errors.push(`${page.path} lists Q1/Q2`);
    if (Q4_FLOOR.test(blob)) errors.push(`${page.path} Q4-floor phrase`);
    if (PRICE.test(blob)) errors.push(`${page.path} invented price`);
    if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push(`${page.path} leftover copy`);
  }

  const featured = gpuCompareFeaturedPages();
  if (featured.length !== GPU_COMPARE_FEATURED_PAIRS.length) {
    errors.push(`featured count ${featured.length} != ${GPU_COMPARE_FEATURED_PAIRS.length}`);
  }
  for (const href of [
    '/compare/r9700-vs-rx-9070-xt',
    '/compare/rx-9070-xt-vs-rx-9060-xt',
    '/compare/r9700-vs-strix-halo',
    '/compare/rx-9070-xt-vs-rx-7900-gre',
    '/compare/rx-7700-xt-vs-rx-6800-xt',
  ]) {
    if (!pages.some((page) => page.path === href)) errors.push(`missing featured canonical ${href}`);
  }

  const redirects = gpuCompareRedirects();
  if (redirects['/compare/rx-7900-gre-vs-rx-9070-xt'] !== '/compare/rx-9070-xt-vs-rx-7900-gre') {
    errors.push('7900 GRE vs 9070 XT reverse redirect drifted');
  }
  if (redirects['/compare/rx-6800-xt-vs-rx-7700-xt'] !== '/compare/rx-7700-xt-vs-rx-6800-xt') {
    errors.push('6800 XT vs 7700 XT reverse redirect drifted');
  }
  if (Object.keys(redirects).length !== expected) errors.push('redirect count drifted');

  const hub = GPU_COMPARE_HUB_LEAD;
  if (!hub.includes(RAM_MIN_LABEL) || !hub.includes(RAM_FULL_LABEL)) errors.push('hub missing RAM labels');
  if (BANNED.test(hub) || PRICE.test(hub) || Q1Q2.test(hub)) errors.push('hub copy breaks house rules');

  if (!GPU_COMPARE_HUB_LEAD.includes('llama.cpp')) errors.push('hub must say llama.cpp');

  return [...new Set(errors)];
}

export { COMPARE_Q3, COMPARE_Q3_CITE, RAM_FULL_LABEL, RAM_MIN_LABEL };
