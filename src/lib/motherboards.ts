/**
 * Vetted motherboard catalog for dual x8/x8 matching.
 * Every dual-ready row cites a maker manual or spec page for a CPU-lane x8/x8
 * split. Cheap single-x16 rows are Minimum budget only. No invented prices.
 */

import { MULTI_GPU_HARDWARE } from './multi-gpu';

export const MOTHERBOARDS_PATH = '/motherboards';
export const MOTHERBOARDS_NAME = 'Dual x8/x8 motherboards';
export const MOTHERBOARDS_PUBLISHED = '2026-10-28';

export const MOTHERBOARDS_DIGEST =
  'AM5 boards whose maker manuals document a CPU-lane PCIe x8/x8 split for two full-length GPUs. Dual builds stay on that list. Minimum budget is the only path that may show a cheaper single-x16 board.';

export type BoardCitation = {
  title: string;
  url: string;
  section: string;
  as_of: string;
};

export type Motherboard = {
  id: string;
  name: string;
  maker: string;
  socket: string;
  chipset: string;
  form_factor: string;
  dual_ready: boolean;
  split: string;
  pcie_gen: string;
  slot_note: string;
  local_desktop: boolean;
  product_id: string;
  max_ram_gb: number;
  dimms: number;
  citation: BoardCitation;
  manual: BoardCitation;
};

export type MotherboardsFile = {
  as_of: string;
  boards: Motherboard[];
};

export type BudgetStance = 'recommended' | 'minimum';

export type MotherboardAsk = {
  gpuCount: number;
  minBudget: boolean;
  expandGpu: boolean;
};

export const DEFAULT_MIN_BUDGET = false;

export function defaultExpandGpu(minBudget: boolean): boolean {
  return !minBudget;
}

function searchParams(search: string): URLSearchParams {
  return new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
}

export function parseMinBudget(search: string): boolean {
  const raw = searchParams(search).get('minbudget');
  return raw === '1' || raw === 'true' || raw === 'minimum';
}

export function parseExpandGpu(search: string, minBudget = parseMinBudget(search)): boolean {
  const raw = searchParams(search).get('expandgpu');
  if (raw === '1' || raw === 'true' || raw === 'yes') return true;
  if (raw === '0' || raw === 'false' || raw === 'no') return false;
  return defaultExpandGpu(minBudget);
}

export function writeMotherboardAskParams(
  url: URL,
  ask: Pick<MotherboardAsk, 'minBudget' | 'expandGpu'>,
): void {
  url.searchParams.set('minbudget', ask.minBudget ? '1' : '0');
  url.searchParams.set('expandgpu', ask.expandGpu ? '1' : '0');
}

export const MIN_BUDGET_COPY = {
  label: 'Minimum budget',
  recommended: {
    label: 'Recommended board',
    short: 'Recommended',
    lede:
      'Default. Buy a board whose maker manual documents a CPU-lane x8/x8 split, even for one GPU. That keeps a later second card on matching CPU widths.',
  },
  minimum: {
    label: 'Minimum budget',
    short: 'Minimum budget',
    lede:
      'Only this choice may drop the dual x8/x8 requirement. A cheaper single-x16 board will run one card. It limits a later second GPU — the leftover slot is usually a chipset x4, not a matching CPU x8.',
  },
};

export const EXPAND_GPU_COPY = {
  question: 'Might you add a second GPU later?',
  yes: {
    label: 'Yes — keep x8/x8 open',
    lede:
      'A dual x8/x8 board now puts both cards on CPU lanes at the same width. Chipset leftover x4 slots are not the path AMD’s mGPU notes recommend.',
  },
  no: {
    label: 'No — one GPU is the plan',
    lede:
      'One card will run on a single x16 slot. If this is also Minimum budget, a cheaper single-x16 board is listed — that leftover x4 slot is a poor second-GPU path.',
  },
  push:
    'Unless you picked Minimum budget, the default is yes: buy the dual x8/x8 board now so a later card is not stuck on a chipset leftover.',
};

export const DUAL_BADGE = 'Dual x8/x8 ✓';

export const WHY_DUAL_X8X8 =
  'AMD’s AM5 chipset table lists CPU graphics as 1×16 or 2×8. ROCm on Radeon multi-GPU wants identical width on the slots the GPUs use (x16+x16 or x8+x8), on CPU-connected slots — not a chipset leftover x4.';

export const CHEAP_BOARD_NOTE =
  'This board will run one GPU. The second full-length slot is not a CPU-lane x8. Adding a later card here usually lands on a leftover x4 — we do not recommend that for a second Radeon.';

export const ANY_BOARD_NOTE =
  'One GPU will run on a CPU x16 slot. The vetted dual x8/x8 list is still the default unless you explicitly pick Minimum budget.';

export const STRIX_CAUTION = {
  title: 'ROG Strix X870E-E is not dual x8/x8',
  body:
    'ASUS ROG Strix X870E-E Gaming WiFi7 NEO is a flagship X870E board, but it is not a dual x8/x8 board. The maker spec lists one CPU PCIe 5.0 x16 slot in x16 mode, plus a chipset PCIe 4.0 x16 slot at x4. That leftover x4 is not a matching CPU-lane second GPU.',
  url: 'https://rog.asus.com/us/motherboards/rog-strix/rog-strix-x870e-e-gaming-wifi7-neo/spec/',
  section: 'Expansion Slots — AMD Ryzen 9000 & 7000: 1 x PCIe 5.0 x16 slot (supports x16 mode). AMD X870E Chipset: 1 x PCIe 4.0 x16 slot (supports x4 mode)',
  as_of: '2026-10-28',
};

export function parseMotherboards(raw: unknown): MotherboardsFile {
  const file = raw as MotherboardsFile;
  if (!file || typeof file.as_of !== 'string' || !Array.isArray(file.boards)) {
    throw new Error('motherboards.yaml: missing as_of or boards');
  }
  return {
    as_of: file.as_of,
    boards: file.boards.map((row) => ({
      ...row,
      dual_ready: Boolean(row.dual_ready),
      local_desktop: Boolean(row.local_desktop),
      max_ram_gb: Number(row.max_ram_gb),
      dimms: Number(row.dimms),
    })),
  };
}

export function citationOf(board: Motherboard): BoardCitation {
  return board.citation;
}

export function dualReadyBoards(boards: Motherboard[]): Motherboard[] {
  return boards.filter((board) => board.dual_ready);
}

export function singleCapableBoards(boards: Motherboard[]): Motherboard[] {
  return boards.filter((board) => !board.dual_ready);
}

/** Dual x8/x8 unless the reader picked Minimum budget and will not add a second GPU. Two-GPU builds always stay on x8/x8. */
export function recommendDualX8X8(ask: MotherboardAsk): boolean {
  const gpuCount = Number.isFinite(ask.gpuCount) ? Math.max(1, Math.round(ask.gpuCount)) : 1;
  if (gpuCount >= 2) return true;
  if (!ask.minBudget) return true;
  return ask.expandGpu;
}

export function boardsForAsk(boards: Motherboard[], ask: MotherboardAsk): Motherboard[] {
  const dual = recommendDualX8X8(ask);
  return boards.filter((board) => (dual ? board.dual_ready : !board.dual_ready));
}

export function recommendationNote(ask: MotherboardAsk): string {
  if (ask.gpuCount >= 2) {
    return 'Two GPUs: only boards whose maker docs show a CPU-lane x8/x8 split. Chipset x4 leftovers stay off this list.';
  }
  if (recommendDualX8X8(ask)) {
    return ask.minBudget
      ? 'Minimum budget, but you said a second GPU might come later — keep the dual x8/x8 board.'
      : 'Default is a dual x8/x8 board, including for one GPU, so a later card can sit on matching CPU lanes.';
  }
  return CHEAP_BOARD_NOTE;
}

export function motherboardPayload(file: MotherboardsFile) {
  return {
    as_of: file.as_of,
    path: MOTHERBOARDS_PATH,
    note: 'Cited maker manuals only. No live or invented prices. Dual x8/x8 is the default unless minbudget=1 and expandgpu=0.',
    why: WHY_DUAL_X8X8,
    am5: MULTI_GPU_HARDWARE.pcie,
    boards: file.boards.map((board) => ({
      id: board.id,
      name: board.name,
      maker: board.maker,
      socket: board.socket,
      chipset: board.chipset,
      form_factor: board.form_factor,
      dual_ready: board.dual_ready,
      split: board.split,
      pcie_gen: board.pcie_gen,
      slot_note: board.slot_note || null,
      local_desktop: board.local_desktop,
      product_id: board.product_id,
      max_ram_gb: board.max_ram_gb,
      dimms: board.dimms,
      can_take_256: board.max_ram_gb >= 256,
      citation: board.citation,
      manual: board.manual,
    })),
  };
}

const HTTPS = /^https:\/\//;
const AS_OF = /^\d{4}-\d{2}-\d{2}$/;
const BANNED = /Qwen2\.5|Qwen3-8B|\$\d|\bMSRP\b|TODO|TBD|FIXME|lorem ipsum|coming soon/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;

function citationErrors(label: string, cite: BoardCitation | undefined): string[] {
  const errors: string[] = [];
  if (!cite) {
    errors.push(`${label} missing citation`);
    return errors;
  }
  if (!cite.url || !HTTPS.test(cite.url)) errors.push(`${label} citation URL must be https`);
  if (!cite.section?.trim()) errors.push(`${label} citation needs a page/section`);
  if (!cite.as_of || !AS_OF.test(cite.as_of)) errors.push(`${label} citation needs as_of YYYY-MM-DD`);
  if (!cite.title?.trim()) errors.push(`${label} citation needs a title`);
  return errors;
}

export function assertMotherboardsValid(file: MotherboardsFile): string[] {
  const errors: string[] = [];
  if (!AS_OF.test(file.as_of)) errors.push('file as_of must be YYYY-MM-DD');
  if (!file.boards.length) errors.push('no boards');

  const ids = new Set<string>();
  let duals = 0;
  let cheap = 0;
  let local = 0;

  for (const board of file.boards) {
    if (!board.id) errors.push('board missing id');
    if (ids.has(board.id)) errors.push(`duplicate ${board.id}`);
    ids.add(board.id);
    if (!board.name?.trim()) errors.push(`${board.id} missing name`);
    if (!board.chipset?.trim()) errors.push(`${board.id} missing chipset`);
    if (!board.form_factor?.trim()) errors.push(`${board.id} missing form factor`);
    if (!board.pcie_gen?.trim()) errors.push(`${board.id} missing PCIe gen`);
    if (!board.split?.trim()) errors.push(`${board.id} missing split`);
    if (!board.product_id?.trim()) errors.push(`${board.id} missing product_id`);
    if (!Number.isFinite(board.max_ram_gb) || board.max_ram_gb < 32) {
      errors.push(`${board.id} missing cited max_ram_gb`);
    }
    if (!Number.isFinite(board.dimms) || board.dimms < 2) {
      errors.push(`${board.id} missing dimms`);
    }
    if (board.max_ram_gb < 256 && !new RegExp(String(board.max_ram_gb)).test(board.citation.section)) {
      errors.push(`${board.id} citation must quote the maker max RAM`);
    }
    if (board.socket !== 'AM5' && board.socket !== 'sTR5' && board.socket !== 'sWRX9') {
      errors.push(`${board.id} unexpected socket ${board.socket}`);
    }
    errors.push(...citationErrors(board.id, board.citation));
    errors.push(...citationErrors(`${board.id} manual`, board.manual));
    if (board.dual_ready) {
      duals += 1;
      if (!/x8\s*\/\s*x8/i.test(board.split) && !/x8\/x8/.test(board.citation.section + board.manual.section)) {
        errors.push(`${board.id} dual-ready without an x8/x8 cite`);
      }
    } else {
      cheap += 1;
    }
    if (board.local_desktop) local += 1;
    const blob = `${board.name} ${board.slot_note} ${board.citation.section} ${board.manual.section}`;
    if (BANNED.test(blob)) errors.push(`${board.id} banned copy`);
    if (Q1Q2.test(blob)) errors.push(`${board.id} lists Q1/Q2`);
  }

  if (duals < 1) errors.push('need at least one dual-ready board');
  if (cheap < 1) errors.push('need at least one cited single-x16 board for Minimum budget');
  if (local !== 1) errors.push('exactly one board must be the local desktop board');
  const taichi = file.boards.find((board) => board.id === 'asrock-x870-taichi-creator');
  if (!taichi?.dual_ready || !taichi.local_desktop) {
    errors.push('ASRock X870 Taichi Creator must be the local desktop dual-ready board');
  }

  const why = `${WHY_DUAL_X8X8} ${MULTI_GPU_HARDWARE.pcie}`;
  if (!/1×16 or 2×8/.test(why)) errors.push('must cite AM5 1×16 or 2×8');
  if (!/chipset/i.test(why)) errors.push('must mention chipset leftovers');
  if (BANNED.test(why)) errors.push('why copy banned');

  return [...new Set(errors)];
}

export function motherboardsBlob(file: MotherboardsFile): string {
  return [
    MOTHERBOARDS_NAME,
    MOTHERBOARDS_DIGEST,
    WHY_DUAL_X8X8,
    MULTI_GPU_HARDWARE.pcie,
    CHEAP_BOARD_NOTE,
    ANY_BOARD_NOTE,
    STRIX_CAUTION.body,
    MIN_BUDGET_COPY.minimum.lede,
    EXPAND_GPU_COPY.push,
    ...file.boards.map((board) => `${board.name} ${board.citation.url} ${board.citation.section}`),
  ].join('\n');
}
