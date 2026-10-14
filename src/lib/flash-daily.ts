/**
 * Qwen 3.8 Flash daily-driver RAM + speed page.
 * RAM rows are calculator estimates (file size + KV). Speeds are measured or cited.
 */

import {
  DEFAULT_INPUT,
  LOCAL_DESKTOP_DDR5_GB,
  LOCAL_DESKTOP_USABLE_RAM_GB,
  applyModelPreset,
  compute,
  formatGiB,
  systemRamNeed,
  type CalcInput,
  type CalcResult,
  type QuantId,
  type SystemRamNeed,
} from './calculator';

export const MEASURED_ON_OUR_RIG = 'Measured on our rig, 2026-10';
export const NOT_MEASURED_ON_LOCAL_DESKTOP = 'not measured on the local desktop';

export const ALLOWED_FLASH_NUMBERS = [
  32.8, 31.8, 18.5, 18.2, 17.9, 15.9, 15.6, 15.3, 32.6, 16, 111, 169, 90, 158.3, 81.96, 249, 256, 9,
  20, 262144, 64, 32,
] as const;

export type FlashSource = { title: string; href: string; date: string };

export type FlashFileRow = {
  quant: string;
  short: string;
  file_gb: number;
  source: string;
  measured_speed: boolean;
};

export type FlashCommunity = {
  quant: string;
  label: string;
  note: string;
  figures: string;
  href: string;
  date: string;
};

export type FlashDailyFile = {
  as_of: string;
  host: string;
  label: string;
  model: string;
  gguf: string;
  official: string;
  full_context: number;
  gpus_two: string;
  gpus_one: string;
  kit: { dimm_gb: number; usable_gb: number; usable_note: string };
  overnight_results_json_rows: unknown[];
  overnight_note: string;
  files: FlashFileRow[];
  measured_q6_two_cards: {
    quant: string;
    cards: number;
    context: number;
    strata_8k_tok_s: number;
    strata_32k_tok_s: number;
    strata_100k_tok_s: number;
    llamacpp_ddr5_5200: [number, number, number];
    llamacpp_ddr5_3600: [number, number, number];
    strata_prefill_drop_pct_at_5200: [number, number];
    strata_prefill_note: string;
    prior_first_party: string;
  };
  community_speeds: FlashCommunity[];
  sources: FlashSource[];
};

export type FlashQuantShort = 'Q3' | 'Q4' | 'Q5' | 'Q6';

export const FLASH_RAM_QUANTS: { short: FlashQuantShort; quantId: QuantId; label: string }[] = [
  { short: 'Q3', quantId: 'q3_k_xl', label: 'UD-Q3_K_XL' },
  { short: 'Q4', quantId: 'q4_k_m', label: 'UD-Q4_K_XL' },
  { short: 'Q5', quantId: 'q5_k_m', label: 'UD-Q5_K_XL' },
  { short: 'Q6', quantId: 'q6_k', label: 'UD-Q6_K_XL' },
];

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : Number.NaN;
}

function trio(value: unknown): [number, number, number] {
  const list = Array.isArray(value) ? value.map(asNumber) : [Number.NaN, Number.NaN, Number.NaN];
  return [list[0], list[1], list[2]];
}

function pair(value: unknown): [number, number] {
  const list = Array.isArray(value) ? value.map(asNumber) : [Number.NaN, Number.NaN];
  return [list[0], list[1]];
}

export function parseFlashDaily(raw: unknown): FlashDailyFile {
  const rec = (raw ?? {}) as Record<string, unknown>;
  const kit = (rec.kit ?? {}) as Record<string, unknown>;
  const q6 = (rec.measured_q6_two_cards ?? {}) as Record<string, unknown>;
  const files = Array.isArray(rec.files) ? rec.files : [];
  const community = Array.isArray(rec.community_speeds) ? rec.community_speeds : [];
  const sources = Array.isArray(rec.sources) ? rec.sources : [];
  const file: FlashDailyFile = {
    as_of: asString(rec.as_of),
    host: asString(rec.host),
    label: asString(rec.label),
    model: asString(rec.model),
    gguf: asString(rec.gguf),
    official: asString(rec.official),
    full_context: asNumber(rec.full_context),
    gpus_two: asString(rec.gpus_two),
    gpus_one: asString(rec.gpus_one),
    kit: {
      dimm_gb: asNumber(kit.dimm_gb),
      usable_gb: asNumber(kit.usable_gb),
      usable_note: asString(kit.usable_note),
    },
    overnight_results_json_rows: Array.isArray(rec.overnight_results_json_rows)
      ? rec.overnight_results_json_rows
      : [],
    overnight_note: asString(rec.overnight_note),
    files: files.flatMap((row) => {
      if (!row || typeof row !== 'object') return [];
      const item = row as Record<string, unknown>;
      return [
        {
          quant: asString(item.quant),
          short: asString(item.short),
          file_gb: asNumber(item.file_gb),
          source: asString(item.source),
          measured_speed: Boolean(item.measured_speed),
        },
      ];
    }),
    measured_q6_two_cards: {
      quant: asString(q6.quant),
      cards: asNumber(q6.cards),
      context: asNumber(q6.context),
      strata_8k_tok_s: asNumber(q6.strata_8k_tok_s),
      strata_32k_tok_s: asNumber(q6.strata_32k_tok_s),
      strata_100k_tok_s: asNumber(q6.strata_100k_tok_s),
      llamacpp_ddr5_5200: trio(q6.llamacpp_ddr5_5200),
      llamacpp_ddr5_3600: trio(q6.llamacpp_ddr5_3600),
      strata_prefill_drop_pct_at_5200: pair(q6.strata_prefill_drop_pct_at_5200),
      strata_prefill_note: asString(q6.strata_prefill_note),
      prior_first_party: asString(q6.prior_first_party),
    },
    community_speeds: community.flatMap((row) => {
      if (!row || typeof row !== 'object') return [];
      const item = row as Record<string, unknown>;
      return [
        {
          quant: asString(item.quant),
          label: asString(item.label),
          note: asString(item.note),
          figures: asString(item.figures),
          href: asString(item.href),
          date: asString(item.date),
        },
      ];
    }),
    sources: sources.flatMap((row) => {
      if (!row || typeof row !== 'object') return [];
      const item = row as Record<string, unknown>;
      if (typeof item.title !== 'string' || typeof item.href !== 'string') return [];
      return [{ title: item.title, href: item.href, date: asString(item.date) }];
    }),
  };
  const errors = assertFlashDailyValid(file);
  if (errors.length) throw new Error(`flash-daily.yaml: ${errors.join('; ')}`);
  return file;
}

function isAllowed(n: number): boolean {
  return ALLOWED_FLASH_NUMBERS.some((allowed) => Math.abs(allowed - n) < 1e-9);
}

export function collectFlashMeasuredNumbers(file: FlashDailyFile): number[] {
  const q6 = file.measured_q6_two_cards;
  return [
    q6.strata_8k_tok_s,
    q6.strata_32k_tok_s,
    q6.strata_100k_tok_s,
    ...q6.llamacpp_ddr5_5200,
    ...q6.llamacpp_ddr5_3600,
    ...q6.strata_prefill_drop_pct_at_5200,
    q6.context,
    file.full_context,
    file.kit.dimm_gb,
    file.kit.usable_gb,
    ...file.files.map((row) => row.file_gb),
  ];
}

export function assertFlashDailyValid(file: FlashDailyFile): string[] {
  const errors: string[] = [];
  if (file.host !== 'local desktop') errors.push('host must be local desktop');
  if (file.label !== MEASURED_ON_OUR_RIG) errors.push('label must be the house measured string');
  if (file.full_context !== 262144) errors.push('full context must be 262144');
  if (file.kit.dimm_gb !== LOCAL_DESKTOP_DDR5_GB) errors.push('kit must be 256 GB');
  if (file.kit.usable_gb !== LOCAL_DESKTOP_USABLE_RAM_GB) errors.push('usable must be 249');
  if (!Array.isArray(file.overnight_results_json_rows)) errors.push('overnight rows missing');
  const shorts = file.files.map((row) => row.short);
  for (const required of ['Q3', 'Q4', 'Q5', 'Q6']) {
    if (!shorts.includes(required)) errors.push(`missing file row ${required}`);
  }
  const q4 = file.files.find((row) => row.short === 'Q4');
  if (q4 && Math.abs(q4.file_gb - 111) > 1e-9) errors.push('Q4 file must be about 111 GB');
  const q6file = file.files.find((row) => row.short === 'Q6');
  if (q6file && !q6file.measured_speed) errors.push('Q6 must be the measured speed row');
  for (const row of file.files) {
    if (row.short !== 'Q6' && row.measured_speed) errors.push(`${row.short} must not claim measured speed`);
  }
  for (const n of collectFlashMeasuredNumbers(file)) {
    if (!Number.isFinite(n)) errors.push('non-finite flash figure');
    else if (!isAllowed(n)) errors.push(`unsourced flash figure ${n}`);
  }
  for (const row of file.community_speeds) {
    if (row.label !== NOT_MEASURED_ON_LOCAL_DESKTOP) {
      errors.push(`${row.quant} community row must say ${NOT_MEASURED_ON_LOCAL_DESKTOP}`);
    }
    if (!/^https:\/\//.test(row.href)) errors.push(`community ${row.quant} needs https`);
  }
  const q5 = file.community_speeds.find((row) => row.quant === 'Q5');
  if (q5 && q5.figures.trim()) errors.push('Q5 must not invent a community tok/s');
  if (!/DDR5-5200/.test(file.measured_q6_two_cards.strata_prefill_note)) {
    errors.push('DDR5-5200 must be a visible prefill factor');
  }
  for (const source of file.sources) {
    if (!/^https:\/\//.test(source.href)) errors.push(`non-https ${source.href}`);
  }
  return errors;
}

export function flashRamInput(quantId: QuantId, cards: 1 | 2): CalcInput {
  const seeded = applyModelPreset('flash', {
    ...DEFAULT_INPUT,
    gpuId: 'r9700',
    vramGb: 32,
    gpuCount: cards,
    split: cards === 2,
    ramGb: LOCAL_DESKTOP_DDR5_GB,
    backendId: 'strata',
    pathId: 'hip',
    context: 262144,
    kvId: 'f16',
  });
  return { ...seeded, quantId };
}

export type FlashRamRow = {
  short: FlashQuantShort;
  label: string;
  cards: 1 | 2;
  fileGb: number;
  weightsGiB: number;
  kvGiB: number;
  overflowGiB: number;
  vramPoolGb: number;
  offloadedWeightsGiB: number;
  kvInRamGiB: number;
  ram: SystemRamNeed;
  result: CalcResult;
  labelKind: 'estimate';
  kitVsUsable: string;
};

export function flashRamRow(short: FlashQuantShort, cards: 1 | 2, fileGb: number): FlashRamRow {
  const spec = FLASH_RAM_QUANTS.find((row) => row.short === short);
  if (!spec) throw new Error(`unknown flash quant ${short}`);
  const input = flashRamInput(spec.quantId, cards);
  const result = compute(input);
  const ram = systemRamNeed(input);
  const vramPoolGb = cards === 2 ? 64 : 32;
  return {
    short,
    label: spec.label,
    cards,
    fileGb,
    weightsGiB: result.weightsGiB,
    kvGiB: result.kvGiB,
    overflowGiB: result.overflowGiB,
    vramPoolGb,
    offloadedWeightsGiB: ram.atFullContext.breakdown.offloadedWeightsGiB,
    kvInRamGiB: ram.atFullContext.breakdown.kvInRamGiB,
    ram,
    result,
    labelKind: 'estimate',
    kitVsUsable: `${LOCAL_DESKTOP_DDR5_GB} GB kit · about ${LOCAL_DESKTOP_USABLE_RAM_GB} GB usable (Linux GiB labeled GB)`,
  };
}

export function flashRamTable(file: FlashDailyFile): FlashRamRow[] {
  const rows: FlashRamRow[] = [];
  for (const spec of FLASH_RAM_QUANTS) {
    const listed = file.files.find((row) => row.short === spec.short);
    const fileGb = listed?.file_gb ?? Number.NaN;
    rows.push(flashRamRow(spec.short, 2, fileGb));
    rows.push(flashRamRow(spec.short, 1, fileGb));
  }
  return rows;
}

export function formatLinuxGb(n: number): string {
  return `${formatGiB(n)} GB`;
}
