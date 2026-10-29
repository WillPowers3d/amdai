/**
 * Builder RAM ask: named kits. 32 GB default, 192/256 GB when larger models
 * (or offload) are in play. Optional 128 GB 2x64 middle. No invented prices.
 * Sizes are written in GB.
 */

import { compute, systemRamNeed, type CalcInput } from './calculator';
import { goPath } from './go-src';

export const RAM_ASK_PARAM = 'bigmodels';

export const DEFAULT_BIG_MODELS = false;

export const RAM_32_PRODUCT = 'ddr5-32';
export const RAM_192_PRODUCT = 'ddr5-192';
export const RAM_256_PRODUCT = 'ddr5-256';
export const RAM_128_PRODUCT = 'ddr5-128';
export const RAM_32_SRC = 'builder-ram-32';
export const RAM_192_SRC = 'builder-ram-192';
export const RAM_256_SRC = 'builder-ram-256';
export const RAM_128_SRC = 'builder-ram-128';

export const SMALL_KIT_GB = 32;
export const LARGE_KIT_GB = [192, 256] as const;

export const REPLACE_KIT_NOTE =
  'You cannot top up a 2x16 kit later. 192 GB and 256 GB only exist as 4x48 or 4x64, and memory makers say do not mix kits — you would replace the 32 GB kit.';

export const OFFICIAL_SPEED_NOTE =
  'AMD’s official Ryzen 9000 memory speed is DDR5-5600 with 2 DIMMs and DDR5-3600 with 4 DIMMs (product pages). Running 4 DIMMs at 6000 is an overclock.';

export const DIMM_SPEED_NOTE = `${OFFICIAL_SPEED_NOTE} Four DIMMs usually run at a lower DDR5 speed than two. That is a bandwidth trade, not a capacity trade.`;

export const BIOS_2025_NOTE =
  'This 256 GB kit needs a 2025 or newer BIOS with 64 GB-module support (G.SKILL product page).';

export const RAM_ASK_COPY = {
  question: 'Will you run larger models later?',
  expensive:
    'DDR4 and DDR5 kits are very expensive right now. Buy the capacity you will actually use. A 2x16 kit cannot be topped up later — you would replace it.',
  no: {
    label: 'No — 32 GB is enough',
    lede:
      'Recommend the G.SKILL Flare X5 2x16 DDR5-6000 CL30 (32 GB). The GPU does the work on the in-VRAM path, so save the money on system RAM.',
  },
  yes: {
    label: 'Yes — go big now',
    lede:
      'Recommend 192 GB or 256 GB now (G.SKILL Flare X5 4x48 DDR5-6000 CL28, or Trident Z5 Neo 4x64 DDR5-6000). That lets big MoE models keep experts in RAM.',
  },
  offload:
    'This model and setup already need RAM offload, so the large kit is the recommendation even if you answered No. Experts and leftover weights land in system RAM, not in VRAM.',
};

export type NamedRamKitId = '32' | '128' | '192' | '256';

export type NamedRamKit = {
  id: NamedRamKitId;
  name: string;
  kit_gb: number;
  dimms: string;
  part: string;
  product_id: string;
  src: string;
  go_newegg: string;
  citation: { title: string; url: string; section: string; as_of: string };
  note: string;
  optional?: boolean;
};

export const NAMED_RAM_KITS: readonly NamedRamKit[] = [
  {
    id: '32',
    name: 'G.SKILL Flare X5 32 GB (2x16) DDR5-6000 CL30',
    kit_gb: 32,
    dimms: '2x16 DDR5',
    part: 'F5-6000J3038F16GX2-FX5',
    product_id: RAM_32_PRODUCT,
    src: RAM_32_SRC,
    go_newegg: goPath('newegg', RAM_32_PRODUCT, RAM_32_SRC),
    citation: {
      title: 'G.SKILL F5-6000J3038F16GX2-FX5 specification',
      url: 'https://www.gskill.com/specification/165/396/1673491242/F5-6000J3038F16GX2-FX5-Specification',
      section: '32GB (16GBx2); Tested Latency 30-38-38-96; Tested Voltage 1.35V; AMD EXPO; Do not mix memory kits',
      as_of: '2026-10-29',
    },
    note: REPLACE_KIT_NOTE,
  },
  {
    id: '128',
    name: 'Kingston FURY Beast 128 GB (2x64) DDR5-5600',
    kit_gb: 128,
    dimms: '2x64 DDR5',
    part: 'KF556C36BBEK2-128',
    product_id: RAM_128_PRODUCT,
    src: RAM_128_SRC,
    go_newegg: goPath('newegg', RAM_128_PRODUCT, RAM_128_SRC),
    citation: {
      title: 'Kingston KF556C36BBEK2-128',
      url: 'https://www.kingston.com/en/memory/search?partid=KF556C36BBEK2-128',
      section: '128GB (2x64GB) DDR5 5600MT/s CL36 FURY Beast Black EXPO',
      as_of: '2026-10-29',
    },
    note: 'Optional middle. Two DIMMs, so it stays inside AMD’s official 2-DIMM speed (DDR5-5600). Still not 192/256 — moving up later means replacing this kit.',
    optional: true,
  },
  {
    id: '192',
    name: 'G.SKILL Flare X5 192 GB (4x48) DDR5-6000 CL28',
    kit_gb: 192,
    dimms: '4x48 DDR5',
    part: 'F5-6000J2836G48GX4-FX5',
    product_id: RAM_192_PRODUCT,
    src: RAM_192_SRC,
    go_newegg: goPath('newegg', RAM_192_PRODUCT, RAM_192_SRC),
    citation: {
      title: 'G.SKILL F5-6000J2836G48GX4-FX5 specification',
      url: 'https://www.gskill.com/specification/165/396/1750729823/F5-6000J2836G48GX4-FX5-Specification',
      section: '192GB (48GBx4); Tested Latency 28-36-36-96; Tested Voltage 1.40V; AMD EXPO; Do not mix memory kits',
      as_of: '2026-10-29',
    },
    note: OFFICIAL_SPEED_NOTE,
  },
  {
    id: '256',
    name: 'G.SKILL Trident Z5 Neo 256 GB (4x64) DDR5-6000',
    kit_gb: 256,
    dimms: '4x64 DDR5',
    part: 'F5-6000J3644D64GX4-TZ5NR',
    product_id: RAM_256_PRODUCT,
    src: RAM_256_SRC,
    go_newegg: goPath('newegg', RAM_256_PRODUCT, RAM_256_SRC),
    citation: {
      title: 'G.SKILL F5-6000J3644D64GX4-TZ5NR',
      url: 'https://www.gskill.com/product/165/390/1750238051/F5-6000J3644D64GX4-TZ5NR',
      section: '256GB (4x64GB); CL36-44-44-96 1.25V AMD EXPO; Requires motherboard BIOS update, dated 2025 or newer with 64GB module support',
      as_of: '2026-10-29',
    },
    note: `${BIOS_2025_NOTE} ${OFFICIAL_SPEED_NOTE}`,
  },
];

function kitById(id: NamedRamKitId): NamedRamKit {
  const row = NAMED_RAM_KITS.find((kit) => kit.id === id);
  if (!row) throw new Error(`unknown RAM kit ${id}`);
  return row;
}

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

export type RamAsk = {
  bigModels: boolean;
  needsOffload: boolean;
  gpuCount?: number;
};

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
  primary: NamedRamKit;
  alternatives: NamedRamKit[];
  replace_note: string;
  official_speed_note: string;
};

export function ramRecommendation(ask: RamAsk): RamRecommendation {
  const large = recommendLargeRam(ask);
  const gpuCount = Number.isFinite(ask.gpuCount) ? Math.max(1, Math.round(ask.gpuCount ?? 1)) : 1;
  if (large) {
    const primaryId: NamedRamKitId = gpuCount >= 2 ? '256' : '192';
    const altId: NamedRamKitId = gpuCount >= 2 ? '192' : '256';
    const primary = kitById(primaryId);
    const why =
      ask.needsOffload && !ask.bigModels
        ? RAM_ASK_COPY.offload
        : gpuCount >= 2
          ? 'Two cards plus 256 GB is the layout our measured Flash Q6 runs use. 192 GB is the alternate 4-DIMM size.'
          : RAM_ASK_COPY.yes.lede;
    return {
      kit: '256',
      title: '192 GB or 256 GB DDR5 (4x48 or 4x64)',
      kit_gb: LARGE_KIT_GB,
      dimms: '4x48 or 4x64 DDR5',
      why,
      product_id: primary.product_id,
      src: primary.src,
      go_newegg: primary.go_newegg,
      offload: ask.needsOffload,
      primary,
      alternatives: [kitById(altId), kitById('128')],
      replace_note: REPLACE_KIT_NOTE,
      official_speed_note: OFFICIAL_SPEED_NOTE,
    };
  }
  const primary = kitById('32');
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
    primary,
    alternatives: [kitById('128')],
    replace_note: REPLACE_KIT_NOTE,
    official_speed_note: OFFICIAL_SPEED_NOTE,
  };
}

export function ramCapFlag(maxRamGb: number): string | null {
  if (!Number.isFinite(maxRamGb) || maxRamGb >= 256) return null;
  return `Maker spec max is ${maxRamGb} GB — this board cannot take 256 GB. A ${maxRamGb} GB kit is the large path here.`;
}

export function ramPickPayload() {
  const small = ramRecommendation({ bigModels: false, needsOffload: false });
  const large = ramRecommendation({ bigModels: true, needsOffload: false, gpuCount: 1 });
  const two = ramRecommendation({ bigModels: true, needsOffload: false, gpuCount: 2 });
  return {
    param: RAM_ASK_PARAM,
    default: DEFAULT_BIG_MODELS ? '1' : '0',
    dimm_speed_note: DIMM_SPEED_NOTE,
    replace_note: REPLACE_KIT_NOTE,
    official_speed_note: OFFICIAL_SPEED_NOTE,
    note:
      'No live or invented prices. Query strings are not evaluated on this host. Share param bigmodels=1 selects the large kit. If a pick already needs RAM offload, use the large kit. Named kits only — no invented prices.',
    small: {
      kit_gb: small.kit_gb,
      dimms: small.dimms,
      product_id: small.product_id,
      src: small.src,
      go: small.go_newegg,
      name: small.primary.name,
      part: small.primary.part,
      when: 'bigmodels=0 and the file fits in VRAM',
    },
    large: {
      kit_gb: large.kit_gb,
      dimms: large.dimms,
      product_id: large.product_id,
      src: large.src,
      go: large.go_newegg,
      name: large.primary.name,
      part: large.primary.part,
      two_gpu_name: two.primary.name,
      when: 'bigmodels=1 or the setup already needs RAM offload; two GPUs prefer 256 GB',
    },
    kits: NAMED_RAM_KITS.map((kit) => ({
      id: kit.id,
      name: kit.name,
      kit_gb: kit.kit_gb,
      part: kit.part,
      product_id: kit.product_id,
      src: kit.src,
      go: kit.go_newegg,
      citation: kit.citation,
    })),
  };
}
