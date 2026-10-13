/**
 * Stack Lab amdai-bench v1. Logic lives here so tests never import JSON via ?raw.
 * Seed only first-party 35B numbers. Empty cells stay null / not measured.
 */

export const AMDAI_BENCH_SCHEMA = 'amdai-bench' as const;
export const AMDAI_BENCH_VERSION = 1 as const;
export const MEASURED_LABEL = 'Measured on our rig, 2026-10';

/** Headline 35B decode from the 2026-10-13 official llama.cpp cards (1 GPU). */
export const ALLOWED_DECODE = [102.39, 90.52, 66.43, 44.4, 109.73, 117.69, 82.62, 103.23] as const;
/** Headline 35B prefill from those cards. */
export const ALLOWED_PREFILL = [1937.9, 1902.1, 1683] as const;
/** Headline 35B VRAM GB from those cards. */
export const ALLOWED_VRAM = [25.97, 24.68, 21.43, 29.32] as const;

export const TRUST_VALUES = ['verified', 'submitted'] as const;
export type Trust = (typeof TRUST_VALUES)[number];

const BANNED_MODEL = /Qwen2\.5|Qwen3-8B|Flash/i;
const FORBIDDEN_Q1Q2 = /\b(?:Q[12]|IQ[12])(?:_|\b)/i;

export type HardwareFingerprint = {
  fingerprint: string;
  host: string;
  gpu: string;
  gpu_id: string;
  gfx: string;
  gpu_count: number;
  gpus_used: number;
  vram_gb_each: number;
  ram_gb: number;
};

export type BenchPins = {
  model: string;
  official: string;
  gguf: string;
  quant: string;
  backend: string;
  runtime: string;
  kv: string;
  offload: string;
  mtp: boolean;
  threads: number | null;
  recipe: string | null;
};

export type BenchContext = {
  tokens: number;
  label: string;
  prefill_tok_s: number | null;
  decode_tok_s: number | null;
  vram_gb: number | null;
};

export type BenchResult = {
  id: string;
  trust: Trust;
  hardware: HardwareFingerprint;
  pins: BenchPins;
  contexts: BenchContext[];
};

export type AmdaiBenchFile = {
  schema: typeof AMDAI_BENCH_SCHEMA;
  version: typeof AMDAI_BENCH_VERSION;
  as_of: string;
  label: string;
  source: string;
  results: BenchResult[];
};

export type ResultFilters = {
  gpu?: string;
  gpus?: number;
  backend?: string;
  quant?: string;
  context?: number;
  trust?: Trust;
};

export type ResultRow = {
  id: string;
  resultId: string;
  trust: Trust;
  host: string;
  gpu: string;
  gpuId: string;
  gfx: string;
  gpusUsed: number;
  backend: string;
  runtime: string;
  quant: string;
  model: string;
  contextTokens: number;
  contextLabel: string;
  prefill: number | null;
  decode: number | null;
  vramGb: number | null;
  kv: string;
};

export function hardwareFingerprint(h: Omit<HardwareFingerprint, 'fingerprint'>): string {
  return [h.host, h.gpu_id, h.gfx, h.vram_gb_each, h.ram_gb, h.gpu_count].join('|');
}

function isAllowed(list: readonly number[], n: number): boolean {
  return list.some((allowed) => Math.abs(allowed - n) < 1e-9);
}

export function formatTokS(n: number | null): string {
  if (n == null) return 'not measured';
  return `~${n} tok/s`;
}

export function formatVram(n: number | null): string {
  if (n == null) return 'not measured';
  return `${n} GB`;
}

export function trustLabel(trust: Trust): string {
  return trust === 'verified' ? 'Verified' : 'Submitted';
}

export function flattenResults(file: AmdaiBenchFile): ResultRow[] {
  const rows: ResultRow[] = [];
  for (const result of file.results) {
    for (const ctx of result.contexts) {
      rows.push({
        id: `${result.id}:${ctx.tokens}:${ctx.decode_tok_s ?? ctx.prefill_tok_s ?? 'x'}`,
        resultId: result.id,
        trust: result.trust,
        host: result.hardware.host,
        gpu: result.hardware.gpu,
        gpuId: result.hardware.gpu_id,
        gfx: result.hardware.gfx,
        gpusUsed: result.hardware.gpus_used,
        backend: result.pins.backend,
        runtime: result.pins.runtime,
        quant: result.pins.quant,
        model: result.pins.model,
        contextTokens: ctx.tokens,
        contextLabel: ctx.label,
        prefill: ctx.prefill_tok_s,
        decode: ctx.decode_tok_s,
        vramGb: ctx.vram_gb,
        kv: result.pins.kv,
      });
    }
  }
  return rows;
}

export function filterResultRows(rows: ResultRow[], filters: ResultFilters): ResultRow[] {
  return rows.filter((row) => {
    if (filters.gpu && row.gpuId !== filters.gpu) return false;
    if (filters.gpus != null && row.gpusUsed !== filters.gpus) return false;
    if (filters.backend && row.backend !== filters.backend) return false;
    if (filters.quant && row.quant !== filters.quant) return false;
    if (filters.context != null && row.contextTokens !== filters.context) return false;
    if (filters.trust && row.trust !== filters.trust) return false;
    return true;
  });
}

export function uniqueFilterValues(rows: ResultRow[]): {
  gpu: string[];
  gpus: number[];
  backend: string[];
  quant: string[];
  context: number[];
  trust: Trust[];
} {
  const gpu = [...new Set(rows.map((row) => row.gpuId))].sort();
  const gpus = [...new Set(rows.map((row) => row.gpusUsed))].sort((a, b) => a - b);
  const backend = [...new Set(rows.map((row) => row.backend))].sort();
  const quant = [...new Set(rows.map((row) => row.quant))].sort();
  const context = [...new Set(rows.map((row) => row.contextTokens))].sort((a, b) => a - b);
  const trust = TRUST_VALUES.filter((value) => rows.some((row) => row.trust === value));
  return { gpu, gpus, backend, quant, context, trust };
}

export function parseAmdaiBench(raw: unknown): AmdaiBenchFile {
  const file = raw as AmdaiBenchFile;
  const errors = assertAmdaiBenchValid(file);
  if (errors.length) throw new Error(`amdai-bench.v1.json: ${errors.join('; ')}`);
  return file;
}

export function assertAmdaiBenchValid(file: AmdaiBenchFile): string[] {
  const errors: string[] = [];
  if (file?.schema !== AMDAI_BENCH_SCHEMA) errors.push(`schema must be ${AMDAI_BENCH_SCHEMA}`);
  if (file?.version !== AMDAI_BENCH_VERSION) errors.push(`version must be ${AMDAI_BENCH_VERSION}`);
  if (!file?.as_of) errors.push('missing as_of');
  if (file?.label !== MEASURED_LABEL) errors.push(`label must be ${MEASURED_LABEL}`);
  if (!file?.source || !/local-desktop/.test(file.source)) errors.push('source must name local-desktop');
  if (!Array.isArray(file?.results) || file.results.length === 0) errors.push('no results');

  const ids = new Set<string>();
  for (const result of file.results ?? []) {
    if (!result.id || ids.has(result.id)) errors.push(`bad or duplicate id ${result.id}`);
    ids.add(result.id);
    if (!TRUST_VALUES.includes(result.trust)) errors.push(`${result.id} bad trust`);
    const hw = result.hardware;
    if (!hw?.host || !hw.gpu || !hw.gpu_id || !hw.gfx) errors.push(`${result.id} incomplete hardware`);
    if (hw) {
      const expected = hardwareFingerprint({
        host: hw.host,
        gpu: hw.gpu,
        gpu_id: hw.gpu_id,
        gfx: hw.gfx,
        gpu_count: hw.gpu_count,
        gpus_used: hw.gpus_used,
        vram_gb_each: hw.vram_gb_each,
        ram_gb: hw.ram_gb,
      });
      if (hw.fingerprint !== expected) errors.push(`${result.id} fingerprint mismatch`);
      if (!Number.isInteger(hw.gpu_count) || hw.gpu_count < 1) errors.push(`${result.id} bad gpu_count`);
      if (!Number.isInteger(hw.gpus_used) || hw.gpus_used < 1 || hw.gpus_used > hw.gpu_count) {
        errors.push(`${result.id} bad gpus_used`);
      }
    }
    const pins = result.pins;
    const blob = `${pins?.model} ${pins?.official} ${pins?.gguf}`;
    if (BANNED_MODEL.test(blob)) errors.push(`${result.id} names a banned or unseeded model`);
    if (FORBIDDEN_Q1Q2.test(pins?.quant ?? '')) errors.push(`${result.id} is Q1/Q2`);
    if (pins?.mtp) errors.push(`${result.id} must not use MTP`);
    if (!pins?.backend) errors.push(`${result.id} missing backend`);
    if (!result.contexts?.length) errors.push(`${result.id} has no contexts`);
    for (const ctx of result.contexts ?? []) {
      if (!Number.isInteger(ctx.tokens) || ctx.tokens < 1) errors.push(`${result.id} bad context tokens`);
      if (ctx.decode_tok_s != null && !Number.isFinite(ctx.decode_tok_s)) {
        errors.push(`${result.id} bad decode ${ctx.decode_tok_s}`);
      }
      if (ctx.prefill_tok_s != null && !Number.isFinite(ctx.prefill_tok_s)) {
        errors.push(`${result.id} bad prefill ${ctx.prefill_tok_s}`);
      }
      if (ctx.vram_gb != null && !Number.isFinite(ctx.vram_gb)) {
        errors.push(`${result.id} bad VRAM ${ctx.vram_gb}`);
      }
      if (ctx.decode_tok_s == null && ctx.prefill_tok_s == null && ctx.vram_gb == null) {
        errors.push(`${result.id} context ${ctx.tokens} has no measured field`);
      }
    }
  }

  for (const allowed of ALLOWED_DECODE) {
    const found = (file.results ?? []).some((result) =>
      result.contexts.some((ctx) => ctx.decode_tok_s != null && Math.abs(ctx.decode_tok_s - allowed) < 1e-9),
    );
    if (!found) errors.push(`missing allowed decode ${allowed}`);
  }
  for (const allowed of ALLOWED_PREFILL) {
    const found = (file.results ?? []).some((result) =>
      result.contexts.some((ctx) => ctx.prefill_tok_s != null && Math.abs(ctx.prefill_tok_s - allowed) < 1e-9),
    );
    if (!found) errors.push(`missing allowed prefill ${allowed}`);
  }
  for (const allowed of ALLOWED_VRAM) {
    const found = (file.results ?? []).some((result) =>
      result.contexts.some((ctx) => ctx.vram_gb != null && Math.abs(ctx.vram_gb - allowed) < 1e-9),
    );
    if (!found) errors.push(`missing allowed VRAM ${allowed}`);
  }

  return errors;
}
