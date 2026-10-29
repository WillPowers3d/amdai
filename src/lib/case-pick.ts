/**
 * Builder case step. 7-slot ATX is enough for two 2-slot R9700s on boards
 * with sourced 4-slot x8/x8 spacing. Unverified ProArt / X870E Taichi spacing
 * asks for 8+ slots. Case fans follow the GPUs. No prices.
 */

import { goPath } from './go-src';

export const R9700_MAX_MM = 271;
export const CARD_SLOTS = 2;
export const CASE_FAN_TEMP = {
  cpu_follow_c: 67,
  full_speed_c: 57,
  source_url: 'https://nicholasreese.com/guides/quad-r9700/quad-r9700-build-guide.md',
  as_of: '2026-10-28',
} as const;

export const VERIFIED_FOUR_SLOT = ['asrock-x870-taichi-creator', 'gigabyte-b850-ai-top'] as const;
export const UNVERIFIED_SPACING = [
  'asus-proart-x870e-creator',
  'asus-proart-x670e-creator',
  'asus-proart-b850-creator-wifi-neo',
  'asrock-x870e-taichi',
] as const;

export const UNVERIFIED_SLOT_WARNING =
  'Slot spacing for this board is not verified here: check its manual layout; an 8+ slot case is the safe choice.';

export const CASE_FAN_NOTE =
  'Blower R9700s push heat out the back; case fans cool the air the cards breathe. Point the case fans at the GPUs. A published 4-card build paused on a CPU-following curve when the card area hit 68 C; full-speed case fans cooled that area from 67 C to 57 C (GPU junction only 1–4 C).';

export type CaseId = 'fractal-torrent' | 'fractal-meshify-2' | 'phanteks-enthoo-pro-2-server';

export type CaseRow = {
  id: CaseId;
  name: string;
  slots: number;
  boards: readonly string[];
  gpu_max_mm: number;
  psu_max_mm: number;
  fans_included: string;
  role: string;
  product_id: string;
  src: string;
  radiator_360: readonly string[];
  cpu_cooler_max_mm: number;
  citation: { title: string; url: string; section: string; as_of: string };
};

export const CASES: readonly CaseRow[] = [
  {
    id: 'fractal-torrent',
    name: 'Fractal Design Torrent',
    slots: 7,
    boards: ['E-ATX', 'ATX', 'mATX', 'ITX'],
    gpu_max_mm: 461,
    psu_max_mm: 230,
    fans_included: '2x 180 mm front + 3x 140 mm bottom',
    role: 'Airflow pick: the most included intake, bottom fans blow straight at the cards.',
    product_id: 'fractal-design-torrent',
    src: 'builder-case-torrent',
    radiator_360: ['front', 'bottom'],
    cpu_cooler_max_mm: 188,
    citation: {
      title: 'Fractal Design Torrent',
      url: 'https://www.fractal-design.com/products/cases/torrent/torrent/black-solid/',
      section: '7 expansion slots; E-ATX; GPU 461 mm; PSU 230 mm; 2x 180 mm front + 3x 140 mm bottom included; 360 radiator front or bottom; CPU cooler 188 mm',
      as_of: '2026-10-28',
    },
  },
  {
    id: 'fractal-meshify-2',
    name: 'Fractal Design Meshify 2',
    slots: 7,
    boards: ['E-ATX', 'ATX', 'mATX', 'ITX'],
    gpu_max_mm: 470,
    psu_max_mm: 250,
    fans_included: '2x 140 mm front + 1x 140 mm rear',
    role: 'All-rounder: E-ATX room and storage; add a third front fan for two cards.',
    product_id: 'fractal-design-meshify-2',
    src: 'builder-case-meshify-2',
    radiator_360: ['top', 'front'],
    cpu_cooler_max_mm: 185,
    citation: {
      title: 'Fractal Design Meshify 2',
      url: 'https://www.fractal-design.com/products/cases/meshify/meshify-2/black-tg-dark-tint/',
      section: '7 expansion slots; E-ATX; GPU 470 mm; PSU 250 mm; 2x 140 mm front + 1x 140 mm rear included; 360 radiator top or front; CPU cooler 185 mm',
      as_of: '2026-10-28',
    },
  },
  {
    id: 'phanteks-enthoo-pro-2-server',
    name: 'Phanteks Enthoo Pro 2 Server Edition',
    slots: 11,
    boards: ['SSI-EEB', 'XL-ATX', 'E-ATX', 'ATX', 'mATX', 'ITX'],
    gpu_max_mm: 503,
    psu_max_mm: 240,
    fans_included: 'None listed as included on the product page',
    role: 'Room to grow: 11 slots and a side fan bracket for a third card or a riser; buy fans separately.',
    product_id: 'phanteks-enthoo-pro-2-server-edition',
    src: 'builder-case-enthoo',
    radiator_360: ['top', 'front', 'side'],
    cpu_cooler_max_mm: 195,
    citation: {
      title: 'Phanteks Enthoo Pro 2 Server Edition',
      url: 'https://phanteks.com/product/enthoo-pro-2-server-edition-tg/',
      section: '11 expansion slots; E-ATX / SSI-EEB; GPU 503 mm; PSU 240 mm; fans not listed as included; 360 radiator top, front or side; CPU cooler 195 mm',
      as_of: '2026-10-28',
    },
  },
];

/** Maker-cited PSU lengths. Null means not on file — do not invent. */
export const PSU_LENGTH_MM: Record<string, number | null> = {
  'Corsair RM850x (2024, ATX 3.1)': null,
  'Thermaltake Toughpower GT 1200W': 140,
  'be quiet! Straight Power 12 1200W': null,
  'Thermaltake Toughpower TF3 1300W': 165,
  'Corsair HX1500i (2025)': 200,
};

export const PSU_LENGTH_SRC: Record<string, string> = {
  'Thermaltake Toughpower GT 1200W': 'https://www.thermaltake.com/toughpower-gt-1200w.html',
  'Thermaltake Toughpower TF3 1300W': 'https://lcgs.thermaltake.de/en/products/thermaltake-toughpower-tf3-1300-watt',
  'Corsair HX1500i (2025)': 'https://www.corsair.com/eu/en/explorer/diy-builder/power-supply-units/corsair-hxi-series-2025/',
};

export const CASE_GO_SLUGS = [
  'fractal-design-torrent',
  'fractal-design-meshify-2',
  'phanteks-enthoo-pro-2-server-edition',
] as const;

export const SPACING_SOURCES = [
  {
    title: 'Level1Techs: X870 Taichi Creator dual GPU',
    url: 'https://forum.level1techs.com/t/asrock-x870-taichi-creator-dual-gpu/243897',
    claim: 'Owner report: 4-slot spacing; bottom card ends at slot 7.',
  },
  {
    title: 'ASRock extra spacing for dual graphics',
    url: 'https://pg.asrock.com/general/news.us.asp?id=5643',
    claim: 'ASRock: extra spacing for dual graphics cards.',
  },
  {
    title: 'LocalLLaMA: consumer boards for 2x cards',
    url: 'https://www.reddit.com/r/LocalLLaMA/comments/1nqi0di/are_there_any_consumer_mobos_that_can_fit_2x/',
    claim: 'Owner reports of 4-slot spacing on the B850 AI TOP.',
  },
  {
    title: 'Published 4x R9700 build: case fans follow the GPUs',
    url: CASE_FAN_TEMP.source_url,
    claim: `Card area 67 C vs 57 C (CPU-following vs full-speed case fans).`,
  },
] as const;

export type CaseAsk = {
  boardId: string;
  formFactor: string;
  gpuCount: number;
  psuName: string;
  thirdLater?: boolean;
};

export type CasePickItem = {
  id: CaseId;
  name: string;
  role: string;
  fans: string;
  slots: number;
  product_id: string;
  src: string;
  spec: string;
  go: string;
  radiator_360: readonly string[];
  cpu_cooler_max_mm: number;
};

export type CaseRecommendation = {
  min_slots: number;
  primary: CasePickItem;
  picks: CasePickItem[];
  warnings: string[];
  notes: string[];
  why: string;
};

export function caseFormFactor(form: string): string {
  if (/micro|m-?atx/i.test(form)) return 'mATX';
  if (/e-?atx/i.test(form)) return 'E-ATX';
  return 'ATX';
}

export function boardSpacingSlots(boardId: string): number | null {
  if ((VERIFIED_FOUR_SLOT as readonly string[]).includes(boardId)) return 4;
  return null;
}

export function needSlots(boardId: string, gpuCount: number, thirdLater = false): { slots: number; warning: string | null } {
  if (thirdLater) return { slots: Math.max(8, gpuCount >= 2 && boardSpacingSlots(boardId) == null ? 8 : 8), warning: gpuCount >= 2 && boardSpacingSlots(boardId) == null ? UNVERIFIED_SLOT_WARNING : null };
  if (gpuCount < 2) return { slots: 7, warning: null };
  const spacing = boardSpacingSlots(boardId);
  if (spacing == null) return { slots: 8, warning: UNVERIFIED_SLOT_WARNING };
  const worst = 2 + spacing + CARD_SLOTS - 1;
  return { slots: Math.max(7, worst), warning: null };
}

function toItem(row: CaseRow): CasePickItem {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    fans: row.fans_included,
    slots: row.slots,
    product_id: row.product_id,
    src: row.src,
    spec: row.citation.url,
    go: goPath('newegg', row.product_id, row.src),
    radiator_360: row.radiator_360,
    cpu_cooler_max_mm: row.cpu_cooler_max_mm,
  };
}

export function caseRecommendation(ask: CaseAsk): CaseRecommendation {
  const gpuCount = Number.isFinite(ask.gpuCount) ? Math.max(1, Math.min(4, Math.round(ask.gpuCount))) : 1;
  const { slots, warning } = needSlots(ask.boardId, gpuCount, ask.thirdLater);
  const form = caseFormFactor(ask.formFactor);
  const psuLen = PSU_LENGTH_MM[ask.psuName];
  const picks = CASES.filter((row) => {
    if (!row.boards.includes(form)) return false;
    if (row.slots < slots) return false;
    if (row.gpu_max_mm < R9700_MAX_MM) return false;
    if (psuLen != null && row.psu_max_mm < psuLen) return false;
    return true;
  }).map(toItem);
  if (ask.thirdLater) picks.sort((a, b) => b.slots - a.slots);
  const primary = picks[0] ?? toItem(CASES[2]!);
  const notes = [CASE_FAN_NOTE];
  if (gpuCount >= 2) {
    notes.push(
      'Use two cards of the same model. ASUS Turbo cards may choke without a slot gap; on 4-slot-spacing boards there is a 2-slot gap.',
    );
  }
  if (psuLen == null) {
    notes.push(`PSU length for ${ask.psuName} is not on file: check it against the case PSU max (Torrent 230 mm, Meshify 2 250 mm, Enthoo 240 mm).`);
  }
  const why =
    gpuCount >= 2 && boardSpacingSlots(ask.boardId) === 4
      ? `Two 2-slot R9700s (max 271 mm) on a sourced 4-slot-spacing x8/x8 board end by slot 7. A 7-slot ATX case is enough. ${CASE_FAN_NOTE}`
      : gpuCount >= 2
        ? `Two cards: this board’s slot spacing is not verified here, so the picker asks for 8+ slots. ${CASE_FAN_NOTE}`
        : `One card: any of the three maker-checked ATX cases fit a 271 mm R9700. ${CASE_FAN_NOTE}`;
  return {
    min_slots: slots,
    primary,
    picks,
    warnings: warning ? [warning] : [],
    notes,
    why,
  };
}

export function casePickPayload() {
  const seven = caseRecommendation({
    boardId: 'asrock-x870-taichi-creator',
    formFactor: 'ATX',
    gpuCount: 2,
    psuName: 'Thermaltake Toughpower GT 1200W',
  });
  const eight = caseRecommendation({
    boardId: 'asus-proart-x870e-creator',
    formFactor: 'ATX',
    gpuCount: 2,
    psuName: 'Thermaltake Toughpower GT 1200W',
  });
  return {
    note: 'No live or invented prices. Every Newegg href is /go/newegg/<slug>. Case fans follow the GPUs (67 C vs 57 C, published).',
    seven_slot: seven,
    eight_slot: eight,
    slugs: CASE_GO_SLUGS,
  };
}
