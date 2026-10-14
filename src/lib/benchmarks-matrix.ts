/**
 * Cited /benchmarks matrix from official amdai-bench/run@1 cards.
 * Same source as /results and /compare. Do not invent tok/s, VRAM, or flags.
 */

import {
  FLASH_RERUN_NOTE,
  Q6_4K_VARIANCE_NOTE,
  Q6_DDR5_NOTE,
  SWEEP_REVERIFY,
  cardPendingReverify,
  contextLabel,
  formatTokCell,
  formatVramCell,
  matchRuns,
  officialAmdaiRuns,
  runPath,
  type RunCard,
} from './run-card';
import {
  COMPARE_CONTEXTS,
  COMPARE_Q3,
  COMPARE_QUANTS,
  serializeCompareQuery,
  type CompareQuantId,
  oneVsTwoRows,
} from './local-desktop-compare';

export { COMPARE_CONTEXTS, COMPARE_QUANTS, FLASH_RERUN_NOTE, Q6_4K_VARIANCE_NOTE, Q6_DDR5_NOTE, SWEEP_REVERIFY };

export const MATRIX_MODEL = 'Qwen3.6-35B-A3B';
export const MATRIX_ENGINE = 'llama.cpp';
export const MATRIX_BACKEND = 'Vulkan';
export const MATRIX_KV = 'f16';
export const EXPECTED_MATRIX_CELLS = COMPARE_QUANTS.length * COMPARE_CONTEXTS.length * 2;

export const CONTEXT_DISPLAY: Record<number, string> = {
  4096: '4K',
  32768: '32K',
  131072: '128K',
  262144: '256K',
};

export type MatrixRow = {
  id: string;
  quant: (typeof COMPARE_QUANTS)[number];
  context: number;
  contextLabel: string;
  gpuCount: 1 | 2;
  layout: 'single' | 'split';
  decode: string;
  prefill: string;
  vramPerGpu: string;
  vramTotal: string;
  systemRam: string;
  runIds: string[];
  runHref: string;
  compareQuantHref: string;
  compareLayoutHref: string;
  pendingReverify: boolean;
  note?: string;
};

export type FlashCiteRow = {
  id: string;
  engine: string;
  context: number;
  contextLabel: string;
  decode: string;
  prefill: string;
  vram: string;
  ram: string;
  dimm: string;
  runHref: string;
  citedPair: boolean;
  note: string;
};

export type CitedLaunch = {
  command: string;
  vram4k: string;
  vram256k: string;
  ram4k: string;
  ram256k: string;
  runId: string;
  href: string;
  note: string;
};

export function displayContext(tokens: number): string {
  return CONTEXT_DISPLAY[tokens] ?? (contextLabel(tokens) === 'short' ? '4K' : contextLabel(tokens));
}

function compareHref(path: string, quant: CompareQuantId, context: number, gpuCount: 1 | 2 | null): string {
  const query = serializeCompareQuery({
    quants: [quant],
    contexts: [context],
    gpuCount,
  });
  return query ? `${path}?${query}` : path;
}

export function matrixRows(cards: RunCard[]): MatrixRow[] {
  const sides = oneVsTwoRows(cards);
  const rows: MatrixRow[] = [];
  for (const side of sides) {
    const quant = side.quant as (typeof COMPARE_QUANTS)[number];
    for (const gpuCount of [1, 2] as const) {
      const cell = gpuCount === 1 ? side.one : side.both;
      const hits = matchRuns(officialAmdaiRuns(cards), {
        model: 'qwen36',
        quant,
        backend: 'llama.cpp',
        context: side.context,
        layout: gpuCount === 1 ? 'single' : 'split',
        gpus: gpuCount,
      });
      const pending = hits.some(cardPendingReverify);
      const note =
        quant === 'Q6_K' && gpuCount === 1 && side.context === 4096
          ? Q6_4K_VARIANCE_NOTE
          : quant === 'Q6_K' && gpuCount === 1 && side.context >= 32768
            ? Q6_DDR5_NOTE
            : pending
              ? 'Pending re-verify after the RAM fix.'
              : undefined;
      rows.push({
        id: `${quant}-n${gpuCount}-c${side.context}`,
        quant,
        context: side.context,
        contextLabel: displayContext(side.context),
        gpuCount,
        layout: gpuCount === 1 ? 'single' : 'split',
        decode: cell.decode,
        prefill: cell.prefill,
        vramPerGpu: cell.vramPerGpu,
        vramTotal: cell.vramTotal,
        systemRam: cell.systemRam,
        runIds: cell.runIds,
        runHref: cell.href,
        compareQuantHref: compareHref('/compare/q4-q5-q6', quant, side.context, gpuCount),
        compareLayoutHref: compareHref('/compare/one-vs-two-gpu', quant, side.context, null),
        pendingReverify: pending,
        note,
      });
    }
  }
  return rows;
}

function dimmFromNotes(notes: string | undefined): string {
  const hit = notes?.match(/DDR5-\d+/);
  return hit?.[0] ?? 'not on the card';
}

export function flashCiteRows(cards: RunCard[]): FlashCiteRow[] {
  const hits = officialAmdaiRuns(cards).filter(
    (card) => /flash/i.test(card.model.name) && card.model.quant === 'UD-Q6_K_XL',
  );
  const rows = hits.map((card) => {
    const citedPair =
      card.run_id === 'local-desktop-flash-q6-strata-prior' || card.run_id === 'local-desktop-flash-q6-llamacpp-prior';
    return {
      id: card.run_id,
      engine: card.software.backend,
      context: card.config.context_tokens,
      contextLabel: displayContext(card.config.context_tokens),
      decode: formatTokCell(card.results.decode_tps),
      prefill: formatTokCell(card.results.prefill_tps),
      vram: formatVramCell(card.results.peak_vram_gb_total ?? card.results.peak_vram_gb_per_gpu[0] ?? null),
      ram: formatVramCell(card.results.peak_system_ram_gb),
      dimm: dimmFromNotes(card.notes),
      runHref: runPath(card.run_id),
      citedPair,
      note: citedPair
        ? 'Prior first-party Flash Q6 on local-desktop. Card count was not published; recorded on the two-R9700 host.'
        : FLASH_RERUN_NOTE,
    };
  });
  return rows.sort((a, b) => {
    if (a.citedPair !== b.citedPair) return a.citedPair ? -1 : 1;
    if (a.engine !== b.engine) return a.engine.localeCompare(b.engine);
    return a.context - b.context || a.id.localeCompare(b.id);
  });
}

export function flashCitedPair(rows: FlashCiteRow[]): FlashCiteRow[] {
  return rows.filter((row) => row.citedPair);
}

export function flashExtraRows(rows: FlashCiteRow[]): FlashCiteRow[] {
  return rows.filter((row) => !row.citedPair);
}

export function citedDailyLaunch(cards: RunCard[]): CitedLaunch | null {
  const four = matchRuns(officialAmdaiRuns(cards), {
    model: 'qwen36',
    quant: 'UD-Q5_K_XL',
    backend: 'llama.cpp',
    context: 4096,
    layout: 'single',
    gpus: 1,
  })[0];
  const long = matchRuns(officialAmdaiRuns(cards), {
    model: 'qwen36',
    quant: 'UD-Q5_K_XL',
    backend: 'llama.cpp',
    context: 262144,
    layout: 'single',
    gpus: 1,
  })[0];
  if (!four) return null;
  if (/TODO|TBD|FIXME/i.test(four.software.launch_command)) return null;
  return {
    command: four.software.launch_command,
    vram4k: formatVramCell(four.results.peak_vram_gb_total),
    vram256k: formatVramCell(long?.results.peak_vram_gb_total ?? null),
    ram4k: formatVramCell(four.results.peak_system_ram_gb),
    ram256k: formatVramCell(long?.results.peak_system_ram_gb ?? null),
    runId: four.run_id,
    href: runPath(four.run_id),
    note: 'This card recorded llama-bench, not llama-server. llama-server flags are not on the card.',
  };
}

function numbersIn(text: string): number[] {
  if (!text || text === 'not measured' || text === 'not on the card') return [];
  return [...text.matchAll(/(\d+(?:\.\d+)?)/g)].map((match) => Number(match[1]));
}

export function assertMatrixValid(cards: RunCard[]): string[] {
  const errors: string[] = [];
  const rows = matrixRows(cards);
  if (rows.length !== EXPECTED_MATRIX_CELLS) {
    errors.push(`expected ${EXPECTED_MATRIX_CELLS} matrix rows, got ${rows.length}`);
  }
  for (const quant of COMPARE_QUANTS) {
    for (const context of COMPARE_CONTEXTS) {
      for (const gpuCount of [1, 2] as const) {
        const row = rows.find((item) => item.quant === quant && item.context === context && item.gpuCount === gpuCount);
        if (!row) {
          errors.push(`missing ${quant} ${context} ${gpuCount}-GPU`);
          continue;
        }
        if (!row.runIds.length) errors.push(`${row.id} has no run ids`);
        if (row.decode === 'not measured') errors.push(`${row.id} missing decode`);
        if (row.prefill === 'not measured') errors.push(`${row.id} missing prefill`);
        const hits = matchRuns(officialAmdaiRuns(cards), {
          model: 'qwen36',
          quant,
          backend: 'llama.cpp',
          context,
          layout: gpuCount === 1 ? 'single' : 'split',
          gpus: gpuCount,
        });
        const allowed = new Set<number>();
        for (const card of hits) {
          if (card.results.decode_tps != null) allowed.add(card.results.decode_tps);
          if (card.results.prefill_tps != null) allowed.add(card.results.prefill_tps);
          if (card.results.peak_vram_gb_total != null) allowed.add(card.results.peak_vram_gb_total);
          if (card.results.peak_system_ram_gb != null) allowed.add(card.results.peak_system_ram_gb);
          for (const n of card.results.peak_vram_gb_per_gpu) allowed.add(n);
        }
        for (const n of [...numbersIn(row.decode), ...numbersIn(row.prefill), ...numbersIn(row.vramPerGpu), ...numbersIn(row.vramTotal), ...numbersIn(row.systemRam)]) {
          if (![...allowed].some((value) => Math.abs(value - n) < 1e-9)) {
            errors.push(`${row.id} invented ${n}`);
          }
        }
      }
    }
  }
  const q6 = rows.find((row) => row.quant === 'Q6_K' && row.context === 4096 && row.gpuCount === 1);
  if (!q6?.decode.includes('103.23') || q6.decode.includes('82.62')) {
    errors.push('Q6 4K 1-GPU must show the 103.23 cell, not the superseded 82.62 pass');
  }
  if (q6 && /92\.9|93\./.test(q6.decode)) errors.push('Q6 4K 1-GPU looks averaged');
  if (rows.some((row) => row.quant === COMPARE_Q3 || /Q3/i.test(row.quant))) {
    errors.push('Q3 must not appear as a measured matrix row');
  }
  const flash = flashCiteRows(cards);
  const pair = flashCitedPair(flash);
  if (!pair.some((row) => row.engine.toLowerCase().includes('strata') && row.decode.includes('32.6'))) {
    errors.push('missing cited Strata 32.6');
  }
  if (!pair.some((row) => row.engine.toLowerCase().includes('llama.cpp') && /^16(\.0)? tok\/s$/.test(row.decode))) {
    errors.push('missing cited llama.cpp 16');
  }
  for (const row of flash) {
    const card = officialAmdaiRuns(cards).find((item) => item.run_id === row.id);
    if (!card) {
      errors.push(`flash ${row.id} missing card`);
      continue;
    }
    if (card.results.decode_tps != null && !row.decode.includes(String(card.results.decode_tps))) {
      errors.push(`flash ${row.id} decode mismatch`);
    }
  }
  const launch = citedDailyLaunch(cards);
  if (!launch) errors.push('missing cited llama-bench launch');
  else if (/TODO|TBD|FIXME/i.test(launch.command)) errors.push('cited launch contains leftover copy');
  const blob = JSON.stringify({ rows, flash, launch, q3: COMPARE_Q3 });
  if (/Qwen2\.5|Qwen3-8B/.test(blob)) errors.push('banned model');
  if (/\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/.test(blob)) errors.push('Q1/Q2 listed');
  return errors;
}
