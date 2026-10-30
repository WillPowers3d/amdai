/**
 * Builder RAM ask: named kits. 96 GB (2x48) is the headline pick for most builds.
 * 32 GB (2x16) is the 35B-only, one-card alternative. 128 / 192 / 256 GB are the
 * "more RAM" steps: larger, smarter models, but slower (see ram-worth.ts).
 * Only dated prices (with the date) — never a live or invented price. Sizes in GB.
 */

import { compute, systemRamNeed, type CalcInput } from './calculator';
import { goPath } from './go-src';
import { ramWorthPayload } from './ram-worth';

export const RAM_ASK_PARAM = 'bigmodels';

export const DEFAULT_BIG_MODELS = false;

export const RAM_32_PRODUCT = 'ddr5-32';
export const RAM_96_PRODUCT = 'ddr5-96';
export const RAM_96_FAST_PRODUCT = 'ddr5-96-fast';
export const RAM_192_PRODUCT = 'ddr5-192';
export const RAM_256_PRODUCT = 'ddr5-256';
export const RAM_128_PRODUCT = 'ddr5-128';
export const RAM_32_SRC = 'builder-ram-32';
export const RAM_96_SRC = 'builder-ram-96';
export const RAM_96_FAST_SRC = 'builder-ram-96-fast';
export const RAM_192_SRC = 'builder-ram-192';
export const RAM_256_SRC = 'builder-ram-256';
export const RAM_128_SRC = 'builder-ram-128';

export const RAM_96_PART = 'F5-5600J4040D48GX2-FX5';
export const RAM_96_FAST_PART = 'F5-6000J2836F48GX2-TZ5NR';

/** G.SKILL kit-side QVL for the Flare X5 96 GB pick. Absence = untested, not incompatible. */
export const RAM_96_QVL_BOARDS = [
  'ASRock X870E Taichi',
  'Gigabyte B850 AI TOP',
  'GIGABYTE X870E AORUS MASTER X3D',
] as const;

export const RAM_96_UNTESTED_SITE_BOARDS = [
  'ASRock X870 Taichi Creator',
  'ASUS ProArt X870E-CREATOR WIFI',
  'ASUS ProArt B850-CREATOR WIFI NEO',
] as const;

export const RAM_96_FAST_QVL_EXTRA = 'MSI MEG X870E GODLIKE';

export const SMALL_KIT_GB = 32;
export const DEFAULT_KIT_GB = 96;
export const MORE_RAM_KIT_GB = [128, 192, 256] as const;

export const REPLACE_KIT_NOTE =
  'You cannot top up a 2-DIMM kit later. Memory makers say do not mix kits, and 192 GB / 256 GB only exist as matched 4x48 or 4x64 sets — moving up means replacing the kit you bought.';

export const OFFICIAL_SPEED_NOTE =
  'AMD’s official Ryzen 9000 memory speed is DDR5-5600 with 2 DIMMs and DDR5-3600 with 4 DIMMs (product pages). Running 4 DIMMs at 6000 is an overclock.';

export const DIMM_SPEED_NOTE = `${OFFICIAL_SPEED_NOTE} Four DIMMs usually run at a lower DDR5 speed than two. That is a bandwidth trade, not a capacity trade.`;

export const BIOS_2025_NOTE =
  'This 256 GB kit needs a 2025 or newer BIOS with 64 GB-module support (G.SKILL product page).';

export const RAM_ASK_COPY = {
  question: 'Will you run larger models later?',
  expensive:
    'DDR5 kits are very expensive right now. Buy the capacity you will actually use. A 2-DIMM kit cannot be topped up later — you would replace it.',
  no: {
    label: 'No — just the 35B for now',
    lede:
      'We still recommend 96 GB (2x48 DDR5) for most builds, so Qwen 3.8 Flash stays an option. 32 GB (2x16) is enough only if you will run the 35B on one card and never want Flash.',
  },
  yes: {
    label: 'Yes — Qwen 3.8 Flash or bigger',
    lede:
      'Recommend 96 GB (2x48 DDR5). With two R9700s it runs Qwen 3.8 Flash Q4 at full 256K context (estimate: about 67 GB needed). 128–256 GB loads larger, smarter models but answers a lot slower — usually not worth it.',
  },
  offload:
    'This model and setup already need RAM offload, so plan on 96 GB or more. 96 GB covers two-card Flash Q4 at 256K (estimate); check Minimum system RAM needed on the calculator for this exact pick.',
};

/** Builder headline note, shown with every RAM pick. */
export const RAM_96_HEADLINE =
  'Recommend 96 GB (2x48 DDR5) for most builds. With two R9700s it runs Qwen 3.8 Flash Q4 at full 256K context (estimate: about 67 GB needed). Two DIMMs, so it stays at AMD’s official 2-DIMM speed.';

/** Dated Newegg list price for the named 96 GB kit. Show only with its date. */
export const RAM_96_DATED_PRICE = {
  usd: 1479.99,
  label: '$1,479.99',
  as_of: '2026-10-30',
  as_of_label: 'Oct 30, 2026',
  source: 'Newegg listing sold by Newegg (list price on the search page, not a cart check)',
} as const;

/** Dated Newegg list price for the optional 6000 CL28 96 GB kit. White -TZ5NRW listing. */
export const RAM_96_FAST_DATED_PRICE = {
  usd: 2399.99,
  label: '$2,399.99',
  as_of: '2026-10-30',
  as_of_label: 'Oct 30, 2026',
  source: 'Newegg listing sold by Newegg for the white -TZ5NRW (list price on the search page, not a cart check)',
} as const;

export const RAM_96_NOTE =
  '96 GB (2x48 GB) DDR5, the right size for most builds. Our pick: G.SKILL Flare X5 96 GB DDR5-5600 (F5-5600J4040D48GX2-FX5), AMD EXPO + Intel XMP. On G.SKILL’s tested list for the ASRock X870E Taichi, Gigabyte B850 AI TOP, and GIGABYTE X870E AORUS MASTER X3D. Two sticks keep the full 5600 speed on Ryzen 9000; four sticks drop it. ASRock X870 Taichi Creator, ASUS ProArt X870E-CREATOR WIFI, and ASUS ProArt B850-CREATOR WIFI NEO are untested on the 96 GB QVLs we read — not proof they are incompatible. Want the fastest tested kit? The 6000 CL28 version is about $920 more for at most ~7% more memory bandwidth, so only worth it if you already run models out of system RAM all day. Prices change; check the listing.';

export const RAM_96_FAST_NOTE =
  'Fastest tested: G.SKILL Trident Z5 Neo RGB F5-6000J2836F48GX2-TZ5NR (Newegg sold the white -TZ5NRW). On G.SKILL’s list for the same three boards plus MSI MEG X870E GODLIKE. About $920 more for at most ~7% more theoretical bandwidth (89.6 → 96.0 GB/s).';

export type NamedRamKitId = '32' | '96' | '128' | '192' | '256';

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
  dated_price?: { label: string; as_of: string; as_of_label: string; source: string };
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
    id: '96',
    name: 'G.SKILL Flare X5 96 GB (2x48) DDR5-5600 CL40',
    kit_gb: 96,
    dimms: '2x48 DDR5',
    part: RAM_96_PART,
    product_id: RAM_96_PRODUCT,
    src: RAM_96_SRC,
    go_newegg: goPath('newegg', RAM_96_PRODUCT, RAM_96_SRC),
    citation: {
      title: 'G.SKILL F5-5600J4040D48GX2-FX5 specification',
      url: 'https://www.gskill.com/specification/165/396/1683011081/F5-5600J4040D48GX2-FX5-Specification',
      section:
        '96GB (48GBx2); Dual Channel Kit; AMD EXPO + Intel XMP; SPD Speed (Default) 5600 MT/s; Tested Latency 40-40-40-89; Do not mix memory kits',
      as_of: '2026-10-30',
    },
    note: RAM_96_NOTE,
    dated_price: {
      label: RAM_96_DATED_PRICE.label,
      as_of: RAM_96_DATED_PRICE.as_of,
      as_of_label: RAM_96_DATED_PRICE.as_of_label,
      source: RAM_96_DATED_PRICE.source,
    },
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
    note: 'More RAM: fits Qwen 3.8 Flash Q5/Q6 on two cards (estimate ~111–121 GB). Two DIMMs, so it stays inside AMD’s official 2-DIMM speed (DDR5-5600). Slower answers than Q4 on 96 GB.',
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

export function recommendLargeRam(ask: { bigModels: boolean; needsOffload: boolean; gpuCount?: number }): boolean {
  const gpuCount = Number.isFinite(ask.gpuCount) ? Math.round(ask.gpuCount ?? 1) : 1;
  return ask.bigModels || ask.needsOffload || gpuCount >= 2;
}

export type RamKitId = '32' | '96';

export type RamAsk = {
  bigModels: boolean;
  needsOffload: boolean;
  gpuCount?: number;
};

export type RamRecommendation = {
  kit: RamKitId;
  title: string;
  kit_gb: number;
  dimms: string;
  why: string;
  product_id: string;
  src: string;
  go_newegg: string;
  offload: boolean;
  primary: NamedRamKit;
  alternatives: NamedRamKit[];
  /** True when 32 GB is still a fair pick (one card, 35B only, no offload). */
  only_35b_ok: boolean;
  replace_note: string;
  official_speed_note: string;
};

/**
 * 96 GB is the headline for every build. One-card, 35B-only answers also see the
 * 32 GB card as the alternative; everyone else sees the 128 / 192 / 256 "more RAM" steps.
 */
export function ramRecommendation(ask: RamAsk): RamRecommendation {
  const gpuCount = Number.isFinite(ask.gpuCount) ? Math.max(1, Math.round(ask.gpuCount ?? 1)) : 1;
  const large = recommendLargeRam({ ...ask, gpuCount });
  const primary = kitById('96');
  const why =
    ask.needsOffload && !ask.bigModels
      ? RAM_ASK_COPY.offload
      : large
        ? RAM_ASK_COPY.yes.lede
        : RAM_ASK_COPY.no.lede;
  const alternatives = large ? MORE_RAM_KIT_GB.map((gb) => kitById(String(gb) as NamedRamKitId)) : [kitById('32')];
  return {
    kit: '96',
    title: '96 GB DDR5 (2x48)',
    kit_gb: DEFAULT_KIT_GB,
    dimms: '2x48 DDR5',
    why,
    product_id: primary.product_id,
    src: primary.src,
    go_newegg: primary.go_newegg,
    offload: ask.needsOffload,
    primary,
    alternatives,
    only_35b_ok: !large,
    replace_note: REPLACE_KIT_NOTE,
    official_speed_note: OFFICIAL_SPEED_NOTE,
  };
}

export function ramCapFlag(maxRamGb: number): string | null {
  if (!Number.isFinite(maxRamGb) || maxRamGb >= 256) return null;
  return `Maker spec max is ${maxRamGb} GB — this board cannot take 256 GB. A ${maxRamGb} GB kit is the large path here.`;
}

export function ramPickPayload() {
  const small = kitById('32');
  const rec = ramRecommendation({ bigModels: false, needsOffload: false, gpuCount: 1 });
  const big = ramRecommendation({ bigModels: true, needsOffload: false, gpuCount: 2 });
  return {
    param: RAM_ASK_PARAM,
    default: DEFAULT_BIG_MODELS ? '1' : '0',
    headline: RAM_96_HEADLINE,
    dimm_speed_note: DIMM_SPEED_NOTE,
    replace_note: REPLACE_KIT_NOTE,
    official_speed_note: OFFICIAL_SPEED_NOTE,
    note:
      'Query strings are not evaluated on this host. 96 GB (2x48) is the pick for most builds. bigmodels=0 on one card also shows 32 GB as the 35B-only option; bigmodels=1, two GPUs, or RAM offload show the 128 / 192 / 256 GB "more RAM" steps. Dated list prices carry their date — no live or invented prices.',
    recommended: {
      kit_gb: rec.kit_gb,
      dimms: rec.dimms,
      product_id: rec.product_id,
      src: rec.src,
      go: rec.go_newegg,
      name: rec.primary.name,
      part: rec.primary.part,
      dated_price: RAM_96_DATED_PRICE,
      qvl_boards: [...RAM_96_QVL_BOARDS],
      untested_site_boards: [...RAM_96_UNTESTED_SITE_BOARDS],
      when: 'most builds; two R9700s run Qwen 3.8 Flash Q4 at 256K (estimate ~67 GB needed)',
    },
    fastest_tested: {
      name: 'G.SKILL Trident Z5 Neo RGB 96 GB (2x48) DDR5-6000 CL28',
      part: RAM_96_FAST_PART,
      product_id: RAM_96_FAST_PRODUCT,
      src: RAM_96_FAST_SRC,
      go: goPath('newegg', RAM_96_FAST_PRODUCT, RAM_96_FAST_SRC),
      dated_price: RAM_96_FAST_DATED_PRICE,
      qvl_extra_board: RAM_96_FAST_QVL_EXTRA,
      note: RAM_96_FAST_NOTE,
    },
    small: {
      kit_gb: small.kit_gb,
      dimms: small.dimms,
      product_id: small.product_id,
      src: small.src,
      go: small.go_newegg,
      name: small.name,
      part: small.part,
      when: 'one card, 35B only, never Qwen 3.8 Flash',
    },
    more_ram: big.alternatives.map((kit) => ({
      kit_gb: kit.kit_gb,
      name: kit.name,
      part: kit.part,
      product_id: kit.product_id,
      src: kit.src,
      go: kit.go_newegg,
    })),
    more_ram_worth_it: ramWorthPayload(),
    kits: NAMED_RAM_KITS.map((kit) => ({
      id: kit.id,
      name: kit.name,
      kit_gb: kit.kit_gb,
      part: kit.part,
      product_id: kit.product_id,
      src: kit.src,
      go: kit.go_newegg,
      citation: kit.citation,
      ...(kit.dated_price ? { dated_price: kit.dated_price } : {}),
    })),
  };
}
