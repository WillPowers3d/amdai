/**
 * Builder RAM ask: 32 GB default, 192/256 GB when larger models (or offload) are in play.
 * No invented prices. Sizes are written in GB.
 */

import { compute, systemRamNeed, type CalcInput } from './calculator';
import { goPath } from './go-src';

export const RAM_ASK_PARAM = 'bigmodels';

export const DEFAULT_BIG_MODELS = false;

export const RAM_32_PRODUCT = 'ddr5-32';
export const RAM_256_PRODUCT = 'ddr5-256';
export const RAM_32_SRC = 'builder-ram-32';
export const RAM_256_SRC = 'builder-ram-256';

export const SMALL_KIT_GB = 32;
export const LARGE_KIT_GB = [192, 256] as const;

export const DIMM_SPEED_NOTE =
  'Four DIMMs usually run at a lower DDR5 speed than two. That is a bandwidth trade, not a capacity trade.';

export const RAM_ASK_COPY = {
  question: 'Will you run larger models later?',
  expensive:
    'DDR4 and DDR5 kits are very expensive right now. Buy the capacity you will actually use.',
  no: {
    label: 'No — 32 GB is enough',
    lede:
      'Recommend 32 GB (2x16 DDR5). The GPU does the work on the in-VRAM path, so save the money on system RAM.',
  },
  yes: {
    label: 'Yes — go big now',
    lede:
      'Recommend 192 GB or 256 GB now (4x48 or 4x64 DDR5). That lets big MoE models keep experts in RAM. Adding a matched kit later is harder and usually costs more.',
  },
  offload:
    'This model and setup already need RAM offload, so the large kit is the recommendation even if you answered No. Experts and leftover weights land in system RAM, not in VRAM.',
};

function searchParams(search: string): URLSearchParams {
  return new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
}

export function parseBigModels(search: string): boolean {
  const raw = searchParams(search).get(RAM_ASK_PARAM);
  if (raw === '1' || raw === 'true' || raw === 'yes') return true;
  if (raw === '0' || raw === 'false' || raw === 'no') return false;
  return DEFAULT_BIG_MODELS;
}

export function writeRamAskParams(url: URL, ask: { bigModels: boolean }): void {
  url.searchParams.set(RAM_ASK_PARAM, ask.bigModels ? '1' : '0');
}

export function setupNeedsRamOffload(input: CalcInput): boolean {
  const result = compute(input);
  if (result.verdict === 'no' || result.overflowGiB > 1) return true;
  return systemRamNeed(input).atSelected.breakdown.offloadedWeightsGiB > 1;
}

export function recommendLargeRam(ask: { bigModels: boolean; needsOffload: boolean }): boolean {
  return ask.bigModels || ask.needsOffload;
}

export type RamKitId = '32' | '256';

export type RamRecommendation = {
  kit: RamKitId;
  title: string;
  kit_gb: number | readonly number[];
  dimms: string;
  why: string;
  product_id: string;
  src: string;
  go_newegg: string;
  offload: boolean;
};

export function ramRecommendation(ask: { bigModels: boolean; needsOffload: boolean }): RamRecommendation {
  const large = recommendLargeRam(ask);
  if (large) {
    return {
      kit: '256',
      title: '192 GB or 256 GB DDR5 (4x48 or 4x64)',
      kit_gb: LARGE_KIT_GB,
      dimms: '4x48 or 4x64 DDR5',
      why: ask.needsOffload && !ask.bigModels ? RAM_ASK_COPY.offload : RAM_ASK_COPY.yes.lede,
      product_id: RAM_256_PRODUCT,
      src: RAM_256_SRC,
      go_newegg: goPath('newegg', RAM_256_PRODUCT, RAM_256_SRC),
      offload: ask.needsOffload,
    };
  }
  return {
    kit: '32',
    title: '32 GB DDR5 (2x16)',
    kit_gb: SMALL_KIT_GB,
    dimms: '2x16 DDR5',
    why: RAM_ASK_COPY.no.lede,
    product_id: RAM_32_PRODUCT,
    src: RAM_32_SRC,
    go_newegg: goPath('newegg', RAM_32_PRODUCT, RAM_32_SRC),
    offload: false,
  };
}

export function ramCapFlag(maxRamGb: number): string | null {
  if (!Number.isFinite(maxRamGb) || maxRamGb >= 256) return null;
  return `Maker spec max is ${maxRamGb} GB — this board cannot take 256 GB. A ${maxRamGb} GB kit is the large path here.`;
}

export function ramPickPayload() {
  const small = ramRecommendation({ bigModels: false, needsOffload: false });
  const large = ramRecommendation({ bigModels: true, needsOffload: false });
  return {
    param: RAM_ASK_PARAM,
    default: DEFAULT_BIG_MODELS ? '1' : '0',
    dimm_speed_note: DIMM_SPEED_NOTE,
    note:
      'No live or invented prices. Query strings are not evaluated on this host. Share param bigmodels=1 selects the large kit. If a pick already needs RAM offload, use the large kit.',
    small: {
      kit_gb: small.kit_gb,
      dimms: small.dimms,
      product_id: small.product_id,
      src: small.src,
      go: small.go_newegg,
      when: 'bigmodels=0 and the file fits in VRAM',
    },
    large: {
      kit_gb: large.kit_gb,
      dimms: large.dimms,
      product_id: large.product_id,
      src: large.src,
      go: large.go_newegg,
      when: 'bigmodels=1 or the setup already needs RAM offload',
    },
  };
}
