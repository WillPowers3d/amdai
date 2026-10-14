/**
 * Consumer compare pages for the official local-desktop 35B llama.cpp sweep.
 * Numbers come from validated amdai-bench/run@1 cards. Q3 is estimate only.
 */

import {
  DEFAULT_INPUT,
  applyModelPreset,
  compute,
  formatGiB,
  formatKitGb,
  systemRamNeed,
  type QuantId,
} from './calculator';
import {
  Q6_4K_VARIANCE_NOTE,
  Q6_DDR5_NOTE,
  SWEEP_REVERIFY,
  contextLabel,
  measuredRamHitsFromRuns,
  qwen36TableFromRuns,
  type Qwen36CompareRow,
  type Qwen36SideCell,
  type RunCard,
} from './run-card';

export { SWEEP_REVERIFY };

export const COMPARE_MODEL = 'Qwen3.6-35B-A3B';
export const COMPARE_ENGINE = 'llama.cpp';
export const COMPARE_QUANTS = ['UD-Q5_K_XL', 'Q5_K_M', 'Q4_K_M', 'Q6_K'] as const;
export const COMPARE_CONTEXTS = [4096, 32768, 131072, 262144] as const;
export const COMPARE_Q3 = 'UD-Q3_K_XL';
export const COMPARE_Q3_CITE = 'Hugging Face listing for Qwen3.6-35B-A3B-UD-Q3_K_XL.gguf (16.8 GB)';

export type CompareQuantId = (typeof COMPARE_QUANTS)[number] | typeof COMPARE_Q3;
export type CompareGpuCount = 1 | 2;

export const QUANT_FILTER_KEYS = {
  q6: 'Q6_K',
  q5xl: 'UD-Q5_K_XL',
  q5: 'Q5_K_M',
  q4: 'Q4_K_M',
  q3: COMPARE_Q3,
} as const;

export const CONTEXT_FILTER_KEYS = {
  '4k': 4096,
  '32k': 32768,
  '128k': 131072,
  '256k': 262144,
} as const;

const QUANT_TO_CALC: Record<CompareQuantId, QuantId> = {
  'UD-Q5_K_XL': 'q5_k_m',
  Q5_K_M: 'q5_k_m',
  Q4_K_M: 'q4_k_m',
  Q6_K: 'q6_k',
  'UD-Q3_K_XL': 'q3_k_xl',
};

export type CompareState = {
  quants: CompareQuantId[];
  contexts: number[];
  gpuCount: CompareGpuCount | null;
};

export function defaultCompareState(): CompareState {
  return { quants: [], contexts: [], gpuCount: null };
}

function parseList(raw: string | null): string[] {
  return (raw ?? '')
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
}

export function parseCompareQuery(search: string): CompareState {
  const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const state = defaultCompareState();
  const n = q.get('n');
  if (n === '1' || n === '2') state.gpuCount = Number(n) as CompareGpuCount;
  const quants: CompareQuantId[] = [];
  for (const key of parseList(q.get('q'))) {
    const mapped = QUANT_FILTER_KEYS[key as keyof typeof QUANT_FILTER_KEYS];
    if (mapped) quants.push(mapped);
    const exact = [...COMPARE_QUANTS, COMPARE_Q3].find((name) => name.toLowerCase() === key);
    if (exact) quants.push(exact);
  }
  state.quants = [...new Set(quants)];
  const contexts: number[] = [];
  for (const key of parseList(q.get('c'))) {
    const mapped = CONTEXT_FILTER_KEYS[key as keyof typeof CONTEXT_FILTER_KEYS];
    if (mapped) contexts.push(mapped);
  }
  state.contexts = [...new Set(contexts)];
  return state;
}

export function serializeCompareQuery(state: CompareState): string {
  const q = new URLSearchParams();
  if (state.gpuCount) q.set('n', String(state.gpuCount));
  if (state.quants.length) {
    const keys = state.quants.map((quant) => {
      const found = Object.entries(QUANT_FILTER_KEYS).find(([, name]) => name === quant);
      return found?.[0] ?? quant;
    });
    q.set('q', keys.join(','));
  }
  if (state.contexts.length) {
    const keys = state.contexts.map((ctx) => {
      const found = Object.entries(CONTEXT_FILTER_KEYS).find(([, n]) => n === ctx);
      return found?.[0] ?? String(ctx);
    });
    q.set('c', keys.join(','));
  }
  return q.toString();
}

export function oneVsTwoRows(cards: RunCard[]): Qwen36CompareRow[] {
  return qwen36TableFromRuns(cards).compare;
}

export function filterOneVsTwo(rows: Qwen36CompareRow[], state: CompareState): Qwen36CompareRow[] {
  return rows.filter((row) => {
    if (state.quants.length && !state.quants.includes(row.quant as CompareQuantId)) return false;
    if (state.contexts.length && !state.contexts.includes(row.context)) return false;
    return true;
  });
}

function decodeNumbers(text: string): number[] {
  if (!text || text === 'not measured') return [];
  return [...text.matchAll(/(\d+(?:\.\d+)?)/g)].map((match) => Number(match[1]));
}

export type GpuWinner = 'one' | 'two' | 'tie' | 'incomplete';

export type WinnerCall = {
  winner: GpuWinner;
  delta: number | null;
  note: string;
};

export function decodeWinner(row: Qwen36CompareRow): WinnerCall {
  const one = decodeNumbers(row.one.decode);
  const two = decodeNumbers(row.both.decode);
  if (!one.length || !two.length) {
    return { winner: 'incomplete', delta: null, note: 'Need both sides measured — we will not invent a winner.' };
  }
  if (one.length > 1 || two.length > 1) {
    return {
      winner: 'incomplete',
      delta: null,
      note: 'More than one decode on a side; AMDai does not average repeats. See the run cards.',
    };
  }
  const delta = one[0]! - two[0]!;
  if (Math.abs(delta) < 0.5) {
    return { winner: 'tie', delta, note: 'Decode is within 0.5 tok/s — treat as a tie.' };
  }
  if (delta > 0) {
    return {
      winner: 'one',
      delta,
      note: `One R9700 decodes faster by ${delta.toFixed(2)} tok/s.`,
    };
  }
  return {
    winner: 'two',
    delta: -delta,
    note: `Split across both cards decodes faster by ${(-delta).toFixed(2)} tok/s.`,
  };
}

export function winnerSummary(rows: Qwen36CompareRow[]): { one: number; two: number; tie: number; incomplete: number; headline: string } {
  let one = 0;
  let two = 0;
  let tie = 0;
  let incomplete = 0;
  for (const row of rows) {
    const call = decodeWinner(row);
    if (call.winner === 'one') one += 1;
    else if (call.winner === 'two') two += 1;
    else if (call.winner === 'tie') tie += 1;
    else incomplete += 1;
  }
  const headline =
    one > two
      ? 'On this sweep, one R9700 usually decodes faster than a split of the same 35B. Split still cuts VRAM per card.'
      : two > one
        ? 'On this sweep, split decode wins more cells than one card. Still read the caveats — Q6 1-GPU is partly on DDR5 at 32K and up.'
        : 'Decode winners are mixed or incomplete. Read each row and the run card.';
  return { one, two, tie, incomplete, headline };
}

export type RamKitLine = {
  text: string;
  kitGb: number;
  label: 'measured' | 'estimate';
  peakGb: number | null;
  runIds: string[];
};

export type QuantColumn = {
  quant: CompareQuantId;
  kind: 'measured' | 'estimate';
  decode: string;
  prefill: string;
  vramPerGpu: string;
  vramTotal: string;
  systemRam: string;
  ramMin: RamKitLine;
  ramFull: RamKitLine;
  href: string;
  runIds: string[];
  note?: string;
};

export type QuantCompareRow = {
  id: string;
  context: number;
  contextLabel: string;
  gpuCount: CompareGpuCount;
  layout: 'single' | 'split';
  columns: QuantColumn[];
};

function calcInput(quant: CompareQuantId, context: number, gpuCount: CompareGpuCount) {
  const preset = applyModelPreset('qwen36', {
    ...DEFAULT_INPUT,
    backendId: 'llamacpp',
    pathId: 'vulkan',
    kvId: 'f16',
    gpuId: 'r9700',
    ramGb: 256,
  });
  return {
    ...preset,
    quantId: QUANT_TO_CALC[quant],
    context,
    gpuCount,
    split: gpuCount === 2,
  };
}

function kitLineFromNeed(
  need: ReturnType<typeof systemRamNeed>,
  which: 'atSelected' | 'atFullContext',
): RamKitLine {
  const line = need[which];
  const peak = line.peakGbs?.length ? Math.max(...line.peakGbs) : null;
  const kitGb = line.kitGb;
  const label = line.measured ? 'measured' : 'estimate';
  const peakBit = peak != null ? ` · ${[...new Set(line.peakGbs ?? [])].join(' / ')} GB peak` : '';
  return {
    text: `${formatKitGb(kitGb)} (${label}${peakBit})`,
    kitGb,
    label,
    peakGb: peak,
    runIds: line.runIds ?? [],
  };
}

function estimateColumn(quant: typeof COMPARE_Q3, context: number, gpuCount: CompareGpuCount): QuantColumn {
  const selected = calcInput(quant, context, gpuCount);
  const result = compute(selected);
  const need = systemRamNeed(selected);
  const vram = `${formatGiB(gpuCount === 2 ? result.perGpuGiB : result.totalGiB)} GB`;
  const total = `${formatGiB(result.totalGiB)} GB`;
  return {
    quant,
    kind: 'estimate',
    decode: 'not measured',
    prefill: 'not measured',
    vramPerGpu: `${vram} (estimate)`,
    vramTotal: `${total} (estimate)`,
    systemRam: `${formatKitGb(need.atSelected.kitGb)} (estimate)`,
    ramMin: kitLineFromNeed(need, 'atSelected'),
    ramFull: kitLineFromNeed(need, 'atFullContext'),
    href: '/calculator',
    runIds: [],
    note: `${COMPARE_Q3_CITE}. Q3 is an option labeled estimate — not a local-desktop run.`,
  };
}

function measuredColumn(
  cell: Qwen36SideCell,
  quant: (typeof COMPARE_QUANTS)[number],
  context: number,
  gpuCount: CompareGpuCount,
  cards: RunCard[],
): QuantColumn {
  const hits = measuredRamHitsFromRuns(cards);
  const selected = calcInput(quant, context, gpuCount);
  const full = { ...selected, context: 262144 };
  const need = systemRamNeed(selected, hits);
  const needFull = systemRamNeed(full, hits);
  const note =
    quant === 'Q6_K' && gpuCount === 1 && context === 4096
      ? Q6_4K_VARIANCE_NOTE
      : quant === 'Q6_K' && gpuCount === 1 && context >= 32768
        ? Q6_DDR5_NOTE
        : undefined;
  return {
    quant,
    kind: 'measured',
    decode: cell.decode,
    prefill: cell.prefill,
    vramPerGpu: cell.vramPerGpu,
    vramTotal: cell.vramTotal,
    systemRam: cell.systemRam,
    ramMin: kitLineFromNeed(need, 'atSelected'),
    ramFull: kitLineFromNeed(needFull, 'atFullContext'),
    href: cell.href,
    runIds: cell.runIds,
    note,
  };
}

export function quantCompareRows(cards: RunCard[]): QuantCompareRow[] {
  const sides = oneVsTwoRows(cards);
  const rows: QuantCompareRow[] = [];
  for (const gpuCount of [1, 2] as const) {
    for (const context of COMPARE_CONTEXTS) {
      const columns: QuantColumn[] = [];
      for (const quant of COMPARE_QUANTS) {
        const side = sides.find((row) => row.quant === quant && row.context === context);
        const cell = gpuCount === 1 ? side?.one : side?.both;
        if (!cell) continue;
        columns.push(measuredColumn(cell, quant, context, gpuCount, cards));
      }
      columns.push(estimateColumn(COMPARE_Q3, context, gpuCount));
      rows.push({
        id: `n${gpuCount}-c${context}`,
        context,
        contextLabel: contextLabel(context),
        gpuCount,
        layout: gpuCount === 1 ? 'single' : 'split',
        columns,
      });
    }
  }
  return rows;
}

export function filterQuantRows(rows: QuantCompareRow[], state: CompareState): QuantCompareRow[] {
  return rows
    .filter((row) => {
      if (state.gpuCount && row.gpuCount !== state.gpuCount) return false;
      if (state.contexts.length && !state.contexts.includes(row.context)) return false;
      return true;
    })
    .map((row) => ({
      ...row,
      columns: state.quants.length
        ? row.columns.filter((col) => state.quants.includes(col.quant))
        : row.columns,
    }))
    .filter((row) => row.columns.length > 0);
}

export function compareHubCards() {
  return [
    {
      href: '/compare/gpus',
      kicker: 'GPUs',
      title: 'R9700 vs 9070 XT (and other cards)',
      body: 'Head-to-head from the published sheets: VRAM, bandwidth, which 35B Q6/Q5/Q4 files fit, a labeled Q3 estimate, and a plain-English pick per job. No invented prices or tok/s.',
    },
    {
      href: '/gpus/r9700',
      kicker: 'This card',
      title: 'Radeon AI PRO R9700',
      body: 'One cited page for the 32 GB SKU: what it is for, Start → setup → recipe → Stack Lab, and the measured 35B tables.',
    },
    {
      href: '/compare/one-vs-two-gpu',
      kicker: 'Layout',
      title: 'One R9700 vs two (split)',
      body: 'Qwen3.6-35B-A3B on llama.cpp Vulkan: UD-Q5_K_XL, Q5_K_M, Q4_K_M, and Q6_K at 4K / 32K / 128K / 256K. Decode, prefill, VRAM, and system RAM from the overnight cards.',
    },
    {
      href: '/compare/q4-q5-q6',
      kicker: 'Quant',
      title: 'Q6 vs Q5 vs Q4 — plus a Q3 estimate',
      body: 'Same 35B family, 1-GPU or split. Quality vs speed vs VRAM. Q3 is a labeled estimate (Unsloth UD-Q3_K_XL listing), not a local-desktop run.',
    },
    {
      href: '/compare/radeon-vs-nvidia',
      kicker: 'Camp',
      title: 'Radeon vs NVIDIA',
      body: 'Cited specs and an honest software split for shoppers picking an R9700 / RX 7900-class card versus an RTX 5090, 4090, 3090, 5080, 5070 Ti, or 5060 Ti 16GB. Measured R9700 tok/s; NVIDIA speed stays empty until a cited figure exists.',
    },
    {
      href: '/long-context',
      kicker: 'Context',
      title: 'Long context on Radeon',
      body: '128K–262K from local-desktop 35B llama.cpp cards. f16 KV default. Empty cells stay not measured yet. Q3 is a labeled estimate. No planted-token recall score.',
    },
  ];
}

/** Labeled Q3 kit pair for pages that show Q6/Q5/Q4 RAM. Decode stays not measured. */
export function q3RamNeed(gpuCount: CompareGpuCount = 1): ReturnType<typeof systemRamNeed> {
  return systemRamNeed(calcInput(COMPARE_Q3, 4096, gpuCount));
}

export function assertCompareValid(cards: RunCard[]): string[] {
  const errors: string[] = [];
  const rows = oneVsTwoRows(cards);
  if (rows.length !== COMPARE_QUANTS.length * COMPARE_CONTEXTS.length) {
    errors.push(`expected ${COMPARE_QUANTS.length * COMPARE_CONTEXTS.length} one-vs-two rows`);
  }
  const quants = quantCompareRows(cards);
  if (quants.length !== 2 * COMPARE_CONTEXTS.length) errors.push('expected 8 quant-compare rows');
  for (const row of quants) {
    const q3 = row.columns.find((col) => col.quant === COMPARE_Q3);
    if (!q3 || q3.kind !== 'estimate') errors.push(`${row.id} missing Q3 estimate`);
    if (q3 && q3.decode !== 'not measured') errors.push(`${row.id} invented Q3 tok/s`);
    if (q3 && !/estimate/i.test(q3.note ?? '')) errors.push(`${row.id} Q3 unlabeled`);
    for (const col of row.columns) {
      if (/\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/.test(`${col.decode} ${col.note ?? ''}`)) {
        errors.push(`${row.id} ${col.quant} lists a Q1/Q2 quant`);
      }
    }
  }
  const blob = JSON.stringify({ rows, quants, notes: [SWEEP_REVERIFY] });
  if (/Qwen2\.5|Qwen3-8B/.test(blob)) errors.push('banned model');
  return errors;
}

export { measuredRamHitsFromRuns as compareRamHits };
