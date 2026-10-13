/**
 * Two-R9700 Qwen 3.6 35B page. Logic lives here so tests never import YAML via ?raw.
 * Allowed figures are the local-desktop dual-card set plus the cited single-card reference.
 */

export const MEASURED_ON_OUR_RIG = 'Measured on our rig, 2026-10';

/** tok/s, soak, and VRAM/RAM figures this page may print. */
export const ALLOWED_DUAL_NUMBERS = [
  42.03, 82.78, 100, 172, 177, 423, 20.6, 27.7, 29.7, 13, 50, 61, 102.39, 90.52, 66.43, 44.4,
  109.73, 117.69, 82.62, 103.23, 249, 256,
] as const;

export type DualSource = { title: string; href: string; date: string };

export type DualSingle = {
  quant: string;
  tok_s: number;
  context: string;
  note: string;
};

export type DualFile = {
  as_of: string;
  host: string;
  label: string;
  engine: string;
  quant: string;
  ddr5: string;
  gpus: string;
  recommendation: string;
  kit: { dimm_gb: number; usable_gb: number; usable_note: string };
  overnight_results_json_rows: unknown[];
  overnight_note: string;
  single_card: DualSingle[];
  split: {
    title: string;
    single_request_tok_s: number;
    max_total_tok_s: number;
    note: string;
  };
  copies: {
    title: string;
    per_request_tok_s: number;
    total_at_2_tok_s: number;
    total_at_4_to_8_tok_s: number;
    soak_requests: number;
    soak_minutes: number;
    soak_errors: number;
    peak_vram_gb: [number, number];
    ddr5_gb: number;
    note: string;
  };
  vllm: {
    used_on_our_rig_catalog: boolean;
    image: string;
    quant: string;
    cards: number;
    tok_s_low: number;
    tok_s_high: number;
    vs_llamacpp: string;
    community_table_note: string;
  };
  sources: DualSource[];
};

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : Number.NaN;
}

function asSources(value: unknown): DualSource[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((row) => {
    if (!row || typeof row !== 'object') return [];
    const rec = row as Record<string, unknown>;
    if (typeof rec.title !== 'string' || typeof rec.href !== 'string') return [];
    return [{ title: rec.title, href: rec.href, date: asString(rec.date) }];
  });
}

export function parselocal-desktopDual(raw: unknown): DualFile {
  const rec = (raw ?? {}) as Record<string, unknown>;
  const kit = (rec.kit ?? {}) as Record<string, unknown>;
  const split = (rec.split ?? {}) as Record<string, unknown>;
  const copies = (rec.copies ?? {}) as Record<string, unknown>;
  const vllm = (rec.vllm ?? {}) as Record<string, unknown>;
  const singles = Array.isArray(rec.single_card) ? rec.single_card : [];
  const vram = Array.isArray(copies.peak_vram_gb) ? copies.peak_vram_gb : [];
  const file: DualFile = {
    as_of: asString(rec.as_of),
    host: asString(rec.host),
    label: asString(rec.label),
    engine: asString(rec.engine),
    quant: asString(rec.quant),
    ddr5: asString(rec.ddr5),
    gpus: asString(rec.gpus),
    recommendation: asString(rec.recommendation),
    kit: {
      dimm_gb: asNumber(kit.dimm_gb),
      usable_gb: asNumber(kit.usable_gb),
      usable_note: asString(kit.usable_note),
    },
    overnight_results_json_rows: Array.isArray(rec.overnight_results_json_rows)
      ? rec.overnight_results_json_rows
      : [],
    overnight_note: asString(rec.overnight_note),
    single_card: singles.flatMap((row) => {
      if (!row || typeof row !== 'object') return [];
      const item = row as Record<string, unknown>;
      return [
        {
          quant: asString(item.quant),
          tok_s: asNumber(item.tok_s),
          context: asString(item.context),
          note: asString(item.note),
        },
      ];
    }),
    split: {
      title: asString(split.title),
      single_request_tok_s: asNumber(split.single_request_tok_s),
      max_total_tok_s: asNumber(split.max_total_tok_s),
      note: asString(split.note),
    },
    copies: {
      title: asString(copies.title),
      per_request_tok_s: asNumber(copies.per_request_tok_s),
      total_at_2_tok_s: asNumber(copies.total_at_2_tok_s),
      total_at_4_to_8_tok_s: asNumber(copies.total_at_4_to_8_tok_s),
      soak_requests: asNumber(copies.soak_requests),
      soak_minutes: asNumber(copies.soak_minutes),
      soak_errors: asNumber(copies.soak_errors),
      peak_vram_gb: [asNumber(vram[0]), asNumber(vram[1])],
      ddr5_gb: asNumber(copies.ddr5_gb),
      note: asString(copies.note),
    },
    vllm: {
      used_on_our_rig_catalog: Boolean(vllm.used_on_our_rig_catalog),
      image: asString(vllm.image),
      quant: asString(vllm.quant),
      cards: asNumber(vllm.cards),
      tok_s_low: asNumber(vllm.tok_s_low),
      tok_s_high: asNumber(vllm.tok_s_high),
      vs_llamacpp: asString(vllm.vs_llamacpp),
      community_table_note: asString(vllm.community_table_note),
    },
    sources: asSources(rec.sources),
  };
  const errors = assertDualValid(file);
  if (errors.length) throw new Error(`local-desktop-dual.yaml: ${errors.join('; ')}`);
  return file;
}

function isAllowed(n: number): boolean {
  return ALLOWED_DUAL_NUMBERS.some((allowed) => Math.abs(allowed - n) < 1e-9);
}

export function collectDualNumbers(file: DualFile): number[] {
  return [
    file.split.single_request_tok_s,
    file.split.max_total_tok_s,
    file.copies.per_request_tok_s,
    file.copies.total_at_2_tok_s,
    file.copies.total_at_4_to_8_tok_s,
    file.copies.soak_requests,
    file.copies.soak_minutes,
    file.copies.soak_errors,
    ...file.copies.peak_vram_gb,
    file.copies.ddr5_gb,
    file.vllm.tok_s_low,
    file.vllm.tok_s_high,
    file.kit.dimm_gb,
    file.kit.usable_gb,
    ...file.single_card.map((row) => row.tok_s),
  ];
}

export function assertDualValid(file: DualFile): string[] {
  const errors: string[] = [];
  if (file.host !== 'local-desktop') errors.push('host must be local-desktop');
  if (file.label !== MEASURED_ON_OUR_RIG) errors.push('label must be the house measured string');
  if (!/llama\.cpp/.test(file.engine)) errors.push('engine must be llama.cpp');
  if (!/UD-Q5_K_XL/.test(file.quant)) errors.push('quant must be UD-Q5_K_XL');
  if (!/5200/.test(file.ddr5)) errors.push('DDR5-5200 must be named');
  if (!/two single-card copies/i.test(file.recommendation)) {
    errors.push('recommendation must prefer two single-card copies');
  }
  if (file.kit.dimm_gb !== 256) errors.push('kit must be 256 GB');
  if (file.kit.usable_gb !== 249) errors.push('usable must be 249 GB');
  if (!Array.isArray(file.overnight_results_json_rows)) errors.push('overnight rows missing');
  if (file.vllm.used_on_our_rig_catalog) errors.push('vLLM must stay unused on the engine catalog');
  if (file.vllm.image !== 'stilldeadcode/vllm-radiance:0.5.8') errors.push('vLLM image pin');
  if (file.copies.soak_errors !== 0) errors.push('soak must be 0 errors');
  for (const n of collectDualNumbers(file)) {
    if (!Number.isFinite(n)) errors.push(`non-finite dual figure`);
    else if (n !== 0 && !isAllowed(n)) errors.push(`unsourced dual figure ${n}`);
  }
  for (const source of file.sources) {
    if (!/^https:\/\//.test(source.href)) errors.push(`non-https ${source.href}`);
  }
  if (!file.sources.length) errors.push('sources required');
  return errors;
}
