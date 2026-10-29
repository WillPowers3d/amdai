/**
 * Builder CPU-cooler step. Ryzen 9000X chips ship with no cooler.
 * 65 W → Peerless Assassin 120 SE. 9900X / 9950X → NH-D15 G2.
 * Suggest a 360 AIO only when the chosen case has a top radiator mount.
 * No prices.
 */

import { goPath } from './go-src';
import { CASES, type CaseId } from './case-pick';
import { CPUS, type CpuId } from './cpu-pick';

export type CoolerId = 'pa120se' | 'nhd15g2' | 'lf3pro360';

export type CoolerRow = {
  id: CoolerId;
  name: string;
  type: 'air' | 'aio';
  height_mm: number | null;
  radiator: { size: 360; thick_mm: number; needs_clearance_mm: number } | null;
  product_id: string;
  src: string;
  note: string;
  citation: { title: string; url: string; section: string; as_of: string };
};

export const COOLERS: readonly CoolerRow[] = [
  {
    id: 'pa120se',
    name: 'Thermalright Peerless Assassin 120 SE',
    type: 'air',
    height_mm: 155,
    radiator: null,
    product_id: 'thermalright-peerless-assassin-120-se',
    src: 'builder-cooler-pa120se',
    note: 'Dual-tower 120 mm, 6 heatpipes. Maker says leave clearance for tall memory.',
    citation: {
      title: 'Thermalright Peerless Assassin 120 SE',
      url: 'https://www.thermalright.com/product/peerless-assassin-120-se/',
      section: 'Height 155 mm; dual-tower 120 mm; 6 heatpipes',
      as_of: '2026-10-28',
    },
  },
  {
    id: 'nhd15g2',
    name: 'Noctua NH-D15 G2',
    type: 'air',
    height_mm: 168,
    radiator: null,
    product_id: 'noctua-nh-d15-g2',
    src: 'builder-cooler-nhd15g2',
    note: 'Dual-tower 140 mm, 8 heatpipes, NSPR 228. No pump to fail on a 24/7 box.',
    citation: {
      title: 'Noctua NH-D15 G2 specification',
      url: 'https://noctua.at/en/nh-d15-g2/specification',
      section: 'Height 168 mm; dual-tower 140 mm; 8 heatpipes; NSPR 228',
      as_of: '2026-10-28',
    },
  },
  {
    id: 'lf3pro360',
    name: 'ARCTIC Liquid Freezer III Pro 360',
    type: 'aio',
    height_mm: null,
    radiator: { size: 360, thick_mm: 38, needs_clearance_mm: 63 },
    product_id: 'arctic-liquid-freezer-iii-pro-360',
    src: 'builder-cooler-lf3pro360',
    note: 'AM5 offset mount, VRM fan. Maker warns some boards’ oversized M.2_1 heatsinks clash (free replacement M.2 cooler offered).',
    citation: {
      title: 'ARCTIC Liquid Freezer III Pro 360',
      url: 'https://www.arctic.de/en/Liquid-Freezer-III-Pro-360/ACFRE00180A',
      section: '360 mm radiator, 38 mm thick, 63 mm clearance; AM5 offset; M.2_1 clash warning',
      as_of: '2026-10-28',
    },
  },
];

export const COOLER_GO_SLUGS = [
  'thermalright-peerless-assassin-120-se',
  'noctua-nh-d15-g2',
  'arctic-liquid-freezer-iii-pro-360',
] as const;

export const AMD_NO_BOX_COOLER =
  'AMD lists Thermal Solution (PIB): Not included on the 9600X, 9900X and 9950X product pages.';

export const MOE_OFFLOAD_NOTE =
  'MoE expert-offload decode is limited by memory and PCIe traffic, not CPU compute, so AMD’s liquid recommendation is about peak boost, not decode speed.';

export const RAM_HEIGHT_WARNING = 'Tall DIMM heatspreaders can hit the front fan; check RAM height against the cooler.';

export const M2_CLASH_WARNING =
  'Check the board’s M.2_1 heatsink against the pump block (ARCTIC lists some clashes and ships a free replacement M.2 cooler).';

export const INTAKE_AIO_WARNING =
  'This case only takes a 360 radiator in the front or bottom, which is the intake the R9700s breathe; air cooler picked instead.';

export type CoolerAsk = {
  cpuId: CpuId;
  caseId: CaseId;
  gpuCount: number;
  preferAio?: boolean;
};

export type CoolerRecommendation = {
  id: CoolerId;
  name: string;
  type: 'air' | 'aio';
  why: string;
  product_id: string;
  src: string;
  spec: string;
  go: string;
  warnings: string[];
  alt: CoolerRecommendation | null;
};

function byId(id: CoolerId): CoolerRow {
  const row = COOLERS.find((cooler) => cooler.id === id);
  if (!row) throw new Error(`unknown cooler ${id}`);
  return row;
}

function caseById(id: CaseId) {
  const row = CASES.find((item) => item.id === id);
  if (!row) throw new Error(`unknown case ${id}`);
  return row;
}

function wrap(row: CoolerRow, why: string, warnings: string[]): CoolerRecommendation {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    why,
    product_id: row.product_id,
    src: row.src,
    spec: row.citation.url,
    go: goPath('newegg', row.product_id, row.src),
    warnings,
    alt: null,
  };
}

export function caseHasTop360(caseId: CaseId): boolean {
  return caseById(caseId).radiator_360.includes('top');
}

export function coolerRecommendation(ask: CoolerAsk): CoolerRecommendation {
  const cpuId = ask.cpuId;
  const cs = caseById(ask.caseId);
  const tdp = CPUS.find((cpu) => cpu.id === cpuId)?.tdp_w ?? 170;
  const base = `The ${cpuId.toUpperCase()} ships with no cooler (${AMD_NO_BOX_COOLER})`;
  const warnings: string[] = [];

  if (tdp <= 65) {
    const row = byId('pa120se');
    const why = `${base} At 65 W a dual-tower air cooler is plenty; AMD recommends a premium air cooler.`;
    warnings.push(RAM_HEIGHT_WARNING);
    if (row.height_mm && row.height_mm > cs.cpu_cooler_max_mm) {
      warnings.push(`${row.name} is ${row.height_mm} mm, taller than this case’s ${cs.cpu_cooler_max_mm} mm limit.`);
    }
    return wrap(row, why, warnings);
  }

  const top = cs.radiator_360.includes('top');
  const air = byId('nhd15g2');
  const airWhy = `${base} AMD recommends liquid for best boost, but ${MOE_OFFLOAD_NOTE} A big dual-tower air cooler is the simpler 24/7 choice (no pump).`;
  const airWarn = [RAM_HEIGHT_WARNING];
  if (air.height_mm && air.height_mm > cs.cpu_cooler_max_mm) {
    airWarn.push(`${air.name} is ${air.height_mm} mm, taller than this case’s ${cs.cpu_cooler_max_mm} mm limit.`);
  }
  if (ask.preferAio && !top) airWarn.push(INTAKE_AIO_WARNING);

  if (ask.preferAio && top) {
    const aio = byId('lf3pro360');
    const why = `${base} AMD recommends liquid for this chip; mount the 360 radiator on top as exhaust so the cards keep cool front intake.`;
    const picked = wrap(aio, why, [M2_CLASH_WARNING]);
    picked.alt = wrap(air, airWhy, airWarn);
    return picked;
  }

  const picked = wrap(air, airWhy, airWarn);
  if (top) {
    const aio = byId('lf3pro360');
    picked.alt = wrap(
      aio,
      'Suggest a 360 AIO only because this case has a top radiator mount (exhaust). Keep the radiator off the front or bottom intake the blowers breathe.',
      [M2_CLASH_WARNING],
    );
  }
  return picked;
}

export function coolerPickPayload() {
  const air65 = coolerRecommendation({ cpuId: '9600x', caseId: 'fractal-torrent', gpuCount: 1 });
  const air120 = coolerRecommendation({ cpuId: '9900x', caseId: 'fractal-torrent', gpuCount: 2 });
  const aioSuggest = coolerRecommendation({ cpuId: '9900x', caseId: 'fractal-meshify-2', gpuCount: 2 });
  return {
    note: 'No live or invented prices. Every Newegg href is /go/newegg/<slug>. 65 W → PA120 SE; 9900X/9950X → NH-D15 G2; 360 AIO only when the case has a top mount.',
    air_65w: air65,
    air_120w: air120,
    aio_when_top: aioSuggest,
    slugs: COOLER_GO_SLUGS,
  };
}
