/**
 * /flash-ram-offload — Flash on DDR5 offload.
 * Speeds come from verified Flash run cards. RAM kits are calculator estimates.
 * Empty cells stay not measured. Do not invent tok/s or flag values.
 */

import {
  flashRamInput,
  formatLinuxGb,
  FLASH_RAM_QUANTS,
  MEASURED_ON_OUR_RIG,
  NOT_MEASURED_ON_local-desktop,
  type FlashQuantShort,
} from './flash-daily';
import { formatGiB, systemRamNeed, type SystemRamNeed } from './calculator';
import {
  formatTokCell,
  matchRuns,
  runPath,
  verifiedMeasured,
  type RunCard,
} from './run-card';

export const FLASH_OFFLOAD_CONTEXTS = [4096, 32768, 131072, 262144] as const;
export const FLASH_OFFLOAD_CONTEXT_LABEL: Record<(typeof FLASH_OFFLOAD_CONTEXTS)[number], string> = {
  4096: '4K',
  32768: '32K',
  131072: '128K',
  262144: '256K',
};
export const FLASH_OFFLOAD_BACKENDS = ['llama.cpp', 'Strata'] as const;
export const FLASH_OFFLOAD_KITS = [128, 192, 256] as const;
export const FLASH_OFFLOAD_QUANTS = ['UD-Q3_K_XL', 'UD-Q4_K_XL', 'UD-Q5_K_XL', 'UD-Q6_K_XL'] as const;

export const LLAMA_EXPERT_OFFLOAD_LAUNCH = [
  '# Shape only — exact -ot tensor regex and --n-cpu-moe N are not recorded from the rig owner.',
  '# After --list-devices, exclude the iGPU if two Vulkan devices appear.',
  './build-vk/bin/llama-server \\',
  '  -m ~/models/UD-Q6_K_XL \\',
  '  -ngl 99 \\',
  '  -c 262144 \\',
  '  --n-cpu-moe not recorded \\',
  '  -ot not recorded \\',
  '  --cache-type-k f16 \\',
  '  --cache-type-v f16 \\',
  '  --host 127.0.0.1 --port 8080',
].join('\n');

export const STRATA_EXPERT_OFFLOAD_LAUNCH = [
  '# Shape only — exact expert-cache / RAM / SSD-tier flags not recorded. No MTP.',
  '# After rocminfo, exclude the iGPU if a second HIP device appears.',
  '# This site’s convention: 127.0.0.1:8083 so llama-server can keep :8080.',
  'curl -s http://127.0.0.1:8083/v1/models',
].join('\n');

export function flashQuantShort(quant: string): FlashQuantShort | null {
  if (/\b(?:UD-)?IQ3|\b(?:UD-)?Q3/i.test(quant)) return 'Q3';
  if (/\b(?:UD-)?Q4/i.test(quant)) return 'Q4';
  if (/\b(?:UD-)?Q5/i.test(quant)) return 'Q5';
  if (/\b(?:UD-)?Q6/i.test(quant)) return 'Q6';
  return null;
}

export function flashRuns(cards: RunCard[]): RunCard[] {
  return verifiedMeasured(cards).filter((card) => /flash/i.test(card.model.name));
}

export type FlashSpeedCell = {
  text: string;
  measured: boolean;
  href: string | null;
};

export function flashDecodeCell(
  cards: RunCard[],
  query: { quant: string; backend: string; context: number; gpus: number },
): FlashSpeedCell {
  const hits = matchRuns(flashRuns(cards), {
    model: 'flash',
    quant: query.quant,
    backend: query.backend,
    context: query.context,
    gpus: query.gpus,
  }).filter((card) => card.results.decode_tps != null);
  if (!hits.length) return { text: NOT_MEASURED_ON_local-desktop, measured: false, href: null };
  const text = hits
    .map((card) => {
      const speed = card.hardware.ram_speed_mts;
      const tok = formatTokCell(card.results.decode_tps);
      return speed != null ? `${tok} @${speed}` : tok;
    })
    .join(' · ');
  return { text, measured: true, href: runPath(hits[0]!.run_id) };
}

export type FlashSpeedRow = {
  quant: string;
  short: FlashQuantShort;
  cards: 1 | 2;
  backend: (typeof FLASH_OFFLOAD_BACKENDS)[number];
  cells: Record<(typeof FLASH_OFFLOAD_CONTEXTS)[number], FlashSpeedCell>;
};

export function flashSpeedGrid(cards: RunCard[]): FlashSpeedRow[] {
  const rows: FlashSpeedRow[] = [];
  for (const quant of FLASH_OFFLOAD_QUANTS) {
    const short = flashQuantShort(quant);
    if (!short) continue;
    for (const cardsUsed of [1, 2] as const) {
      for (const backend of FLASH_OFFLOAD_BACKENDS) {
        const cells = {} as FlashSpeedRow['cells'];
        for (const context of FLASH_OFFLOAD_CONTEXTS) {
          cells[context] = flashDecodeCell(cards, { quant, backend, context, gpus: cardsUsed });
        }
        rows.push({ quant, short, cards: cardsUsed, backend, cells });
      }
    }
  }
  return rows;
}

export type FlashRamOffloadRow = {
  short: FlashQuantShort;
  label: string;
  cards: 1 | 2;
  vramPoolGb: number;
  fileGb: number;
  ram: SystemRamNeed;
  spillGiB: number;
  spillLabel: string;
};

export function flashRamOffloadRows(): FlashRamOffloadRow[] {
  const rows: FlashRamOffloadRow[] = [];
  for (const spec of FLASH_RAM_QUANTS) {
    const listed = spec.short === 'Q3' ? 90 : spec.short === 'Q4' ? 111 : spec.short === 'Q5' ? 158.3 : 169;
    for (const cards of [1, 2] as const) {
      const input = { ...flashRamInput(spec.quantId, cards), context: 4096 };
      const ram = systemRamNeed(input);
      const spillGiB = ram.atFullContext.breakdown.offloadedWeightsGiB + ram.atFullContext.breakdown.kvInRamGiB;
      rows.push({
        short: spec.short,
        label: spec.label,
        cards,
        vramPoolGb: cards === 2 ? 64 : 32,
        fileGb: listed,
        ram,
        spillGiB,
        spillLabel: `${formatLinuxGb(spillGiB)} est.`,
      });
    }
  }
  return rows;
}

export type KitRec = {
  kitGb: number;
  headline: string;
  lines: string[];
};

export function kitRecommendations(rows: FlashRamOffloadRow[]): KitRec[] {
  return FLASH_OFFLOAD_KITS.map((kitGb) => {
    const full = rows.filter((row) => kitGb + 1e-9 >= row.ram.atFullContext.kitGb);
    const shortOnly = rows.filter(
      (row) => kitGb + 1e-9 >= row.ram.atSelected.kitGb && kitGb + 1e-9 < row.ram.atFullContext.kitGb,
    );
    const tooSmall = rows.filter((row) => kitGb + 1e-9 < row.ram.atSelected.kitGb);
    const twoQ6 = full.some((row) => row.short === 'Q6' && row.cards === 2);
    const oneQ6 = full.some((row) => row.short === 'Q6' && row.cards === 1);
    let headline = `${kitGb} GB kit — estimate only.`;
    if (kitGb === 256 && twoQ6) {
      headline = '256 GB is the local-desktop kit. Two-card Q6 at 262K is the measured house fast-agent.';
    } else if (kitGb === 192 && oneQ6) {
      headline = '192 GB covers one-card Q6 at 262K on the calculator estimate. Speeds for that card count are not measured.';
    } else if (kitGb === 128 && twoQ6) {
      headline = '128 GB covers two-card Q5/Q6 at 262K on the calculator estimate. One-card Q5/Q6 does not.';
    }
    const lines = [
      full.length
        ? `At 262K this kit covers: ${full.map((row) => `${row.label} · ${row.cards}×R9700`).join('; ')} (estimate).`
        : 'At 262K this kit covers no listed Flash quant (estimate).',
      shortOnly.length
        ? `Short context only: ${shortOnly.map((row) => `${row.label} · ${row.cards}×`).join('; ')} (estimate).`
        : '',
      tooSmall.length
        ? `Too small for: ${tooSmall.map((row) => `${row.label} · ${row.cards}×`).join('; ')} (estimate).`
        : '',
    ].filter(Boolean);
    return { kitGb, headline, lines };
  });
}

export type DimmSpeedRow = {
  backend: string;
  context: number;
  contextLabel: string;
  at3600: FlashSpeedCell;
  at5200: FlashSpeedCell;
};

export function dimmSpeedRows(cards: RunCard[]): DimmSpeedRow[] {
  const contexts = [
    { context: 8192, label: '8K' },
    { context: 32768, label: '32K' },
    { context: 100000, label: '100K' },
  ] as const;
  const rows: DimmSpeedRow[] = [];
  for (const backend of FLASH_OFFLOAD_BACKENDS) {
    for (const ctx of contexts) {
      const hits = matchRuns(flashRuns(cards), {
        model: 'flash',
        quant: 'UD-Q6_K_XL',
        backend,
        context: ctx.context,
        gpus: 2,
      }).filter((card) => card.results.decode_tps != null);
      const at = (mts: number): FlashSpeedCell => {
        const hit = hits.find((card) => card.hardware.ram_speed_mts === mts);
        if (!hit || hit.results.decode_tps == null) {
          return { text: NOT_MEASURED_ON_local-desktop, measured: false, href: null };
        }
        return {
          text: `${hit.results.decode_tps.toFixed(1)} tok/s`,
          measured: true,
          href: runPath(hit.run_id),
        };
      };
      rows.push({
        backend,
        context: ctx.context,
        contextLabel: ctx.label,
        at3600: at(3600),
        at5200: at(5200),
      });
    }
  }
  return rows;
}

export function flashOffloadEmptyNotes(grid: FlashSpeedRow[]): string[] {
  const notes: string[] = [];
  const any = (pred: (cell: FlashSpeedCell, row: FlashSpeedRow) => boolean) =>
    grid.some((row) => FLASH_OFFLOAD_CONTEXTS.some((ctx) => pred(row.cells[ctx], row)));
  if (!any((cell, row) => cell.measured && row.short === 'Q3')) {
    notes.push('No Flash Q3 decode in data/runs yet. When the approved measured card lands, this grid will show it.');
  }
  if (!any((cell, row) => cell.measured && row.short === 'Q4')) notes.push('Flash Q4 decode is not measured on local-desktop.');
  if (!any((cell, row) => cell.measured && row.short === 'Q5')) notes.push('Flash Q5 decode is not measured on local-desktop.');
  if (!any((_cell, row) => row.cards === 1 && FLASH_OFFLOAD_CONTEXTS.some((ctx) => row.cells[ctx].measured))) {
    notes.push('One-card Flash decode cells are empty. Prior 32.6 / 16 points recorded card count as unpublished.');
  }
  if (!grid.some((row) => row.cells[4096].measured)) {
    notes.push('4K Flash decode is not in the jsonl yet.');
  }
  if (!grid.some((row) => row.cells[131072].measured)) {
    notes.push('128K Flash decode is not in the jsonl yet.');
  }
  return notes;
}

export function formatEstimateGiB(n: number): string {
  return `${formatGiB(n)} GB est.`;
}

export { MEASURED_ON_OUR_RIG, NOT_MEASURED_ON_local-desktop, formatLinuxGb };
