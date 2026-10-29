/**
 * Builder PSU step. One card and no second-GPU plan: ~850 W with one native
 * 12V-2x6. Two cards, or “second GPU later?” = yes: 1200 W+ with two native
 * 12V-2x6 cables. R9700 watts come from the AMD product page. No invented prices.
 */

import { goPath } from './go-src';

export const R9700_TBP_W = 300;
export const R9700_MIN_PSU_W = 750;
export const DUAL_PLUS_9950X_EST_W = 1100;
export const AMD_R9700_SPEC =
  'https://www.amd.com/en/products/graphics/workstations/radeon-ai-pro/ai-9000-series/amd-radeon-ai-pro-r9700.html';

export const R9700_POWER_CITE = {
  title: 'AMD Radeon AI PRO R9700 product page',
  url: AMD_R9700_SPEC,
  section: 'Total Board Power (TBP) 300W; Minimum PSU Recommendation 750W; External Power Connectors 12V-2x6',
  as_of: '2026-10-29',
};

export const PSU_NATIVE_CABLE_NOTE =
  'The R9700 takes a 12V-2x6 connector (AMD product page). Buy one native 12V-2x6 cable per card. Many 1000 W units ship only one.';

export type PsuId = 'rm850x' | 'tt-gt-1200' | 'bequiet-sp12-1200' | 'tt-tf3-1300' | 'hx1500i';

export type PsuRow = {
  id: PsuId;
  name: string;
  part: string;
  watts: number;
  native_12v2x6: number;
  atx: string;
  for_gpus: readonly number[];
  product_id: string;
  src: string;
  note: string;
  citation: { title: string; url: string; section: string; as_of: string };
};

export const PSUS: readonly PsuRow[] = [
  {
    id: 'rm850x',
    name: 'Corsair RM850x (2024, ATX 3.1)',
    part: 'CP-9020270-NA',
    watts: 850,
    native_12v2x6: 1,
    atx: '3.1',
    for_gpus: [1],
    product_id: 'corsair-rm850x',
    src: 'builder-psu-850',
    note: 'One native 12V-2x6 cable: right for one R9700. A second card would need an adapter, and 850 W is too small for two.',
    citation: {
      title: 'Corsair RM850x (2024) product page',
      url: 'https://www.corsair.com/us/en/p/psu/cp-9020270-na/rmx-series-rm850x-fully-modular-power-supply-cp-9020270-na',
      section: 'Continuous Power 850 Watts; ATX 3.1; Native 12V-2x6 GPU cable included',
      as_of: '2026-10-29',
    },
  },
  {
    id: 'tt-gt-1200',
    name: 'Thermaltake Toughpower GT 1200W',
    part: 'PS-TPT-1200FNFAGU-3',
    watts: 1200,
    native_12v2x6: 2,
    atx: '3.1',
    for_gpus: [1, 2],
    product_id: 'thermaltake-toughpower-gt-1200',
    src: 'builder-psu-1200',
    note: 'Two native 12V-2x6 cables (each up to 600 W). Value pick for two R9700s.',
    citation: {
      title: 'Thermaltake Toughpower GT 1200W',
      url: 'https://www.thermaltake.com/toughpower-gt-1200w.html',
      section: 'PCIe (12+4Pin) 600W × 2 cables; ATX 3.1; 80 PLUS Gold; 1200 W',
      as_of: '2026-10-29',
    },
  },
  {
    id: 'bequiet-sp12-1200',
    name: 'be quiet! Straight Power 12 1200W',
    part: 'BN517',
    watts: 1200,
    native_12v2x6: 2,
    atx: '3.1',
    for_gpus: [1, 2],
    product_id: 'bequiet-straight-power-12-1200',
    src: 'builder-psu-1200',
    note: 'Two native 12V-2x6 cables. Combined 12V-2x6 limit is 800 W: fine at 300 W TBP per card, tight if both cards spike together.',
    citation: {
      title: 'be quiet! Straight Power 12 1200W',
      url: 'https://www.bequiet.com/en/powersupply/4108',
      section: '12V-2x6 cables 2; Max. combined power 12V-2x6 800 W; ATX 3.1; 80 PLUS Platinum',
      as_of: '2026-10-29',
    },
  },
  {
    id: 'tt-tf3-1300',
    name: 'Thermaltake Toughpower TF3 1300W',
    part: 'PS-TPD-1300FNFATU-1',
    watts: 1300,
    native_12v2x6: 2,
    atx: '3.1',
    for_gpus: [2],
    product_id: 'thermaltake-tf3-1300',
    src: 'builder-psu-1300',
    note: 'Two native 12V-2x6 cables included. Headroom pick for two R9700s.',
    citation: {
      title: 'Thermaltake Toughpower TF3 1300W',
      url: 'https://www.thermaltake.com/toughpower-tf3-1300w-tt-premium-edition.html',
      section: 'Dual native 12V-2x6 connectors; two PCIe 12+4 pin cables; 80 PLUS Titanium; 1300 W',
      as_of: '2026-10-29',
    },
  },
  {
    id: 'hx1500i',
    name: 'Corsair HX1500i (2025)',
    part: 'CP-9020309-NA',
    watts: 1500,
    native_12v2x6: 2,
    atx: '3.1',
    for_gpus: [2],
    product_id: 'corsair-hx1500i',
    src: 'builder-psu-1500',
    note: 'Two 12V-2x6 GPU cables. Rated 1500 W at 115–240 V but 1200 W at 100–115 V, so on a weak 120 V outlet plan on 1200 W.',
    citation: {
      title: 'Corsair HX1500i (2025) product page',
      url: 'https://www.corsair.com/us/en/p/psu/cp-9020309-na/hx1500i-fully-modular-ultra-low-noise-platinum-atx-1500-watt-pc-power-supply-cp-9020309-na',
      section: 'Dual 12V-2x6 cables; TOTAL POWER 1200W (100V - 115V) 1500W (115V - 240V); ATX 3.1',
      as_of: '2026-10-29',
    },
  },
];

export type PsuAsk = {
  gpuCount: number;
  expandGpu: boolean;
};

export type PsuPickItem = {
  id: PsuId;
  name: string;
  watts: number;
  native_12v2x6: number;
  note: string;
  product_id: string;
  src: string;
  go_newegg: string;
  citation: PsuRow['citation'];
};

export type PsuRecommendation = {
  gpus_sized_for: 1 | 2;
  why: string;
  r9700_tbp_w: number;
  r9700_min_psu_w: number;
  dual_plus_9950x_est_w: number | null;
  cable_note: string;
  r9700_cite: typeof R9700_POWER_CITE;
  picks: PsuPickItem[];
};

export function sizeForGpus(ask: PsuAsk): 1 | 2 {
  const gpuCount = Number.isFinite(ask.gpuCount) ? Math.max(1, Math.round(ask.gpuCount)) : 1;
  if (gpuCount >= 2 || ask.expandGpu) return 2;
  return 1;
}

function toItem(row: PsuRow): PsuPickItem {
  return {
    id: row.id,
    name: row.name,
    watts: row.watts,
    native_12v2x6: row.native_12v2x6,
    note: row.note,
    product_id: row.product_id,
    src: row.src,
    go_newegg: goPath('newegg', row.product_id, row.src),
    citation: row.citation,
  };
}

export function psuRecommendation(ask: PsuAsk): PsuRecommendation {
  const g = sizeForGpus(ask);
  const floor = g === 1 ? 850 : 1200;
  const rows = PSUS.filter((p) => p.native_12v2x6 >= g && p.watts >= floor && p.for_gpus.includes(g)).slice();
  rows.sort((a, b) => a.watts - b.watts);
  const picks = (g === 1 ? rows.slice(0, 1) : rows).map(toItem);

  let why =
    g === 1
      ? `Sized for one R9700. AMD lists ${R9700_TBP_W} W TBP and a ${R9700_MIN_PSU_W} W minimum PSU (product page). About 850 W with one native 12V-2x6 cable.`
      : `Sized for two R9700s. AMD lists ${R9700_TBP_W} W TBP per card (product page). Two cards plus a 9950X can reach about ${DUAL_PLUS_9950X_EST_W.toLocaleString('en-US')} W. Two native 12V-2x6 cables, one per card.`;
  if (ask.gpuCount < 2 && ask.expandGpu) {
    why += ' You said a second GPU might come later, so this skips the 850 W step and buys the PSU once.';
  }

  return {
    gpus_sized_for: g,
    why,
    r9700_tbp_w: R9700_TBP_W,
    r9700_min_psu_w: R9700_MIN_PSU_W,
    dual_plus_9950x_est_w: g === 2 ? DUAL_PLUS_9950X_EST_W : null,
    cable_note: PSU_NATIVE_CABLE_NOTE,
    r9700_cite: R9700_POWER_CITE,
    picks,
  };
}

export function psuPickPayload() {
  const one = psuRecommendation({ gpuCount: 1, expandGpu: false });
  const two = psuRecommendation({ gpuCount: 2, expandGpu: true });
  const later = psuRecommendation({ gpuCount: 1, expandGpu: true });
  return {
    note:
      'No live or invented prices. R9700 300 W TBP and 750 W minimum PSU are from the AMD product page. Two cards plus a 9950X can reach about 1,100 W. Named units replace the old 1000W-class search line on /budget.',
    r9700: R9700_POWER_CITE,
    cable_note: PSU_NATIVE_CABLE_NOTE,
    one_gpu: {
      gpus_sized_for: one.gpus_sized_for,
      src: one.picks[0]?.src ?? 'builder-psu-850',
      picks: one.picks.map((p) => ({ id: p.id, name: p.name, watts: p.watts, product_id: p.product_id, src: p.src, go: p.go_newegg })),
      when: 'one GPU and expandgpu=0',
    },
    two_gpu: {
      gpus_sized_for: two.gpus_sized_for,
      src: 'builder-psu-1200',
      picks: two.picks.map((p) => ({ id: p.id, name: p.name, watts: p.watts, product_id: p.product_id, src: p.src, go: p.go_newegg })),
      when: 'two GPUs, or expandgpu=1',
    },
    later: {
      gpus_sized_for: later.gpus_sized_for,
      when: 'one GPU and expandgpu=1 — same 1200 W+ list as two GPUs',
    },
  };
}
