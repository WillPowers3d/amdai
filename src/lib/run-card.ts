/**
 * amdai-bench/run@1 — one test-run card.
 * Stack Lab and overnight local-desktop drops emit this object (one jsonl line).
 * Verified measured runs feed GPU / model / 35B tables. Do not invent numbers.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AmdaiBenchFile } from './results';
import { AMDAI_BENCH_SCHEMA, AMDAI_BENCH_VERSION, MEASURED_LABEL, hardwareFingerprint } from './results';
import type { BackendId, MeasuredRamHit, QuantId } from './calculator';

export const RUN_SCHEMA = 'amdai-bench/run@1' as const;
export const FLASH_Q3_EXCEPTION = 'flash-q3-measured-approved';
export const amdai = {
  handle: 'amdai',
  display: 'amdai',
  rig: 'local-desktop',
  verified: true,
} as const;

export const amdai = {
  handle: 'amdai',
  display: 'AMDai',
  rig: 'local-desktop',
  verified: true,
} as const;

/** Flash / Strata / Q3 were excluded from the 2026-10-13 35B drop after a RAM crash. */
export const FLASH_RERUN_NOTE =
  'Flash, Strata, and Q3 runs are pending a rerun after amdai stabilizes the DDR5.';

/** Whole 2026-10-12/13 35B llama.cpp sweep. All 33 cards predate the 00:14 CT oops. */
export const SWEEP_REVERIFY =
  'Measured, pending re-verify after RAM fix. DDR5-5200 later proved unstable; a kernel oops at 00:14 CT aborted the sweep. All 33 cards predate the oops. Each card already notes one transient bad read in earlier sha256 passes.';

/** Earlier isolated 4K pass. Kept on /results. Not the 35B table cell. */
export const Q6_4K_SUPERSEDED_RUN_ID = 'local-desktop-20261012-2326-35b-q6k-1gpu-4k-llamacpp-f16';
/** 4K point in the complete Q6_K single-GPU series (4K → 32K → 128K → 256K). */
export const Q6_4K_CANONICAL_RUN_ID = 'local-desktop-20261012-2355-35b-q6k-1gpu-4k-llamacpp-f16';

export const Q6_4K_VARIANCE_NOTE =
  'Q6_K single-GPU 4K table cell is 103.23 tok/s from the 23:55 card (the 4K point in the complete Q6_K single-GPU series). The earlier 23:26 card at 82.62 tok/s stays on /results and is not averaged into the cell.';

export const Q6_DDR5_NOTE =
  'Partly offloaded to DDR5 on one GPU (llama.cpp --fit-target 1024). Decode is not an in-VRAM figure.';

export const SWEEP_UPDATE_TITLE = 'Overnight sweep, 2026-10-12';

export const LAYOUTS = ['single', 'split', 'dual-instance', 'tensor-parallel'] as const;
export type RunLayout = (typeof LAYOUTS)[number];

export type RunSubmitter = {
  handle: string;
  display: string;
  rig: string;
  verified: boolean;
};

export type RunGpu = {
  model: string;
  gfx: string;
  vram_gb: number;
  pcie: string | null;
};

export type RunHardware = {
  gpus: RunGpu[];
  gpu_count_used: number;
  cpu: string | null;
  ram_kit_gb: number;
  ram_usable_gb: number | null;
  ram_speed_mts: number | null;
  motherboard: string | null;
  bios_version: string | null;
  resizable_bar: boolean | null;
};

export type RunSoftware = {
  os: string;
  kernel: string | null;
  mesa_or_vulkan_driver: string | null;
  rocm_version: string | null;
  backend: string;
  backend_version_or_commit: string | null;
  launch_command: string;
};

export type RunModel = {
  name: string;
  repo: string;
  file: string;
  quant: string;
  file_size_gb: number | null;
  sha256?: string | null;
};

export type RunOffload = {
  experts_to_ram: boolean;
  note: string;
};

export type RunConfig = {
  context_tokens: number;
  kv_type: string;
  layout: RunLayout;
  offload: RunOffload;
  concurrency: number;
  prompt_tokens: number | null;
  gen_tokens: number | null;
};

export type RunResults = {
  prefill_tps: number | null;
  decode_tps: number | null;
  aggregate_tps?: number | null;
  peak_vram_gb_per_gpu: number[];
  peak_vram_gb_total: number | null;
  peak_system_ram_gb: number | null;
  errors: number;
  duration_s: number | null;
};

export type RunEstimates = {
  decode_tps?: number;
  prefill_tps?: number;
  decode_tps_low?: number;
  decode_tps_high?: number;
  ram_gb?: number;
  note?: string;
};

export type RunCard = {
  schema: typeof RUN_SCHEMA;
  run_id: string;
  submitted_by: RunSubmitter;
  started_at: string | null;
  finished_at: string | null;
  hardware: RunHardware;
  software: RunSoftware;
  model: RunModel;
  config: RunConfig;
  results: RunResults;
  measured: boolean;
  estimates?: RunEstimates;
  notes?: string;
  exceptions?: string[];
  raw_log_path?: string | null;
};

const BANNED_MODEL = /Qwen2\.5|Qwen3-8B/i;
const FORBIDDEN_Q1Q2 = /\b(?:Q[12]|IQ[12])(?:_|\b)/i;
const REQUIRED_TOP = [
  'schema',
  'run_id',
  'submitted_by',
  'started_at',
  'finished_at',
  'hardware',
  'software',
  'model',
  'config',
  'results',
  'measured',
] as const;

export function schemaDocument(): Record<string, unknown> {
  const here = fileURLToPath(import.meta.url);
  const candidates = [
    join(process.cwd(), 'docs/amdai-bench-run.schema.json'),
    join(dirname(here), '../../docs/amdai-bench-run.schema.json'),
    join(dirname(here), '../../../docs/amdai-bench-run.schema.json'),
  ];
  for (const path of candidates) {
    try {
      return JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
    } catch {
      /* next */
    }
  }
  throw new Error('docs/amdai-bench-run.schema.json not found');
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNullString(value: unknown): string | null {
  if (value == null) return null;
  return typeof value === 'string' ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function asInt(value: unknown): number | null {
  const n = asNumber(value);
  return n != null && Number.isInteger(n) ? n : null;
}

function notesFromUnknown(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value;
  if (Array.isArray(value)) {
    const joined = value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).join(' · ');
    return joined || undefined;
  }
  return undefined;
}

export function houseHandle(handle: string): boolean {
  const normalized = handle.toLowerCase().replace(/[^a-z]/g, '');
  return normalized === amdai.handle || normalized === 'amdai';
}

export function isSweep35bCard(card: RunCard): boolean {
  return (
    card.submitted_by.rig === amdai.rig &&
    /35B/i.test(card.model.name) &&
    !/flash/i.test(card.model.name) &&
    card.software.backend.toLowerCase().includes('llama.cpp') &&
    /2026101[23]/.test(card.run_id)
  );
}

export function cardPendingReverify(card: RunCard): boolean {
  return /pending re-verify after RAM fix/i.test(card.notes ?? '');
}

export function parseRunCard(raw: unknown, file = 'run'): RunCard {
  if (!raw || typeof raw !== 'object') throw new Error(`${file}: not an object`);
  const rec = raw as Record<string, unknown>;
  const who = (rec.submitted_by ?? {}) as Record<string, unknown>;
  const hw = (rec.hardware ?? {}) as Record<string, unknown>;
  const sw = (rec.software ?? {}) as Record<string, unknown>;
  const model = (rec.model ?? {}) as Record<string, unknown>;
  const cfg = (rec.config ?? {}) as Record<string, unknown>;
  const off = (cfg.offload ?? {}) as Record<string, unknown>;
  const res = (rec.results ?? {}) as Record<string, unknown>;
  const gpusRaw = Array.isArray(hw.gpus) ? hw.gpus : [];
  const layout = asString(cfg.layout);
  const card: RunCard = {
    schema: RUN_SCHEMA,
    run_id: asString(rec.run_id),
    submitted_by: {
      handle: asString(who.handle),
      display: asString(who.display),
      rig: asString(who.rig),
      verified: Boolean(who.verified),
    },
    started_at: asNullString(rec.started_at),
    finished_at: asNullString(rec.finished_at),
    hardware: {
      gpus: gpusRaw.flatMap((row) => {
        if (!row || typeof row !== 'object') return [];
        const gpu = row as Record<string, unknown>;
        const vram = asNumber(gpu.vram_gb);
        if (vram == null) return [];
        return [{ model: asString(gpu.model), gfx: asString(gpu.gfx), vram_gb: vram, pcie: asNullString(gpu.pcie) }];
      }),
      gpu_count_used: asInt(hw.gpu_count_used) ?? 0,
      cpu: asNullString(hw.cpu),
      ram_kit_gb: asNumber(hw.ram_kit_gb) ?? 0,
      ram_usable_gb: asNumber(hw.ram_usable_gb),
      ram_speed_mts: asNumber(hw.ram_speed_mts),
      motherboard: asNullString(hw.motherboard),
      bios_version: asNullString(hw.bios_version),
      resizable_bar: typeof hw.resizable_bar === 'boolean' ? hw.resizable_bar : null,
    },
    software: {
      os: asString(sw.os),
      kernel: asNullString(sw.kernel),
      mesa_or_vulkan_driver: asNullString(sw.mesa_or_vulkan_driver),
      rocm_version: asNullString(sw.rocm_version),
      backend: asString(sw.backend),
      backend_version_or_commit: asNullString(sw.backend_version_or_commit),
      launch_command: asString(sw.launch_command),
    },
    model: {
      name: asString(model.name),
      repo: asString(model.repo),
      file: asString(model.file),
      quant: asString(model.quant),
      file_size_gb: asNumber(model.file_size_gb),
      sha256: asNullString(model.sha256),
    },
    config: {
      context_tokens: asInt(cfg.context_tokens) ?? 0,
      kv_type: asString(cfg.kv_type),
      layout: (LAYOUTS as readonly string[]).includes(layout) ? (layout as RunLayout) : 'single',
      offload: {
        experts_to_ram: Boolean(off.experts_to_ram),
        note: asString(off.note),
      },
      concurrency: asInt(cfg.concurrency) ?? 1,
      prompt_tokens: asInt(cfg.prompt_tokens),
      gen_tokens: asInt(cfg.gen_tokens),
    },
    results: {
      prefill_tps: asNumber(res.prefill_tps),
      decode_tps: asNumber(res.decode_tps),
      aggregate_tps: asNumber(res.aggregate_tps),
      peak_vram_gb_per_gpu: Array.isArray(res.peak_vram_gb_per_gpu)
        ? res.peak_vram_gb_per_gpu.filter((n): n is number => typeof n === 'number' && Number.isFinite(n))
        : [],
      peak_vram_gb_total: asNumber(res.peak_vram_gb_total),
      peak_system_ram_gb: asNumber(res.peak_system_ram_gb),
      errors: asInt(res.errors) ?? 0,
      duration_s: asNumber(res.duration_s),
    },
    measured: Boolean(rec.measured),
    notes: notesFromUnknown(rec.notes),
    exceptions: Array.isArray(rec.exceptions)
      ? rec.exceptions.filter((item): item is string => typeof item === 'string')
      : undefined,
    raw_log_path: asNullString(rec.raw_log_path),
  };
  if (rec.estimates && typeof rec.estimates === 'object') {
    const est = rec.estimates as Record<string, unknown>;
    card.estimates = {
      decode_tps: asNumber(est.decode_tps) ?? undefined,
      prefill_tps: asNumber(est.prefill_tps) ?? undefined,
      decode_tps_low: asNumber(est.decode_tps_low) ?? undefined,
      decode_tps_high: asNumber(est.decode_tps_high) ?? undefined,
      ram_gb: asNumber(est.ram_gb) ?? undefined,
      note: typeof est.note === 'string' ? est.note : undefined,
    };
  }
  const errors = assertRunValid(card, rec);
  if (errors.length) throw new Error(`${file}: ${errors.join('; ')}`);
  return card;
}

export function parseJsonl(text: string, file = 'runs.jsonl'): RunCard[] {
  const cards: RunCard[] = [];
  const lines = text.split(/\r?\n/);
  for (const [i, line] of lines.entries()) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    let raw: unknown;
    try {
      raw = JSON.parse(trimmed);
    } catch {
      throw new Error(`${file}:${i + 1}: invalid JSON`);
    }
    cards.push(parseRunCard(raw, `${file}:${i + 1}`));
  }
  return cards;
}

export function isFlashQ3(card: RunCard): boolean {
  return /flash/i.test(card.model.name) && /Q3/i.test(card.model.quant) && !FORBIDDEN_Q1Q2.test(card.model.quant);
}

export function isMeasuredFlashQ3(card: RunCard): boolean {
  return (
    card.measured &&
    isFlashQ3(card) &&
    (card.exceptions ?? []).includes(FLASH_Q3_EXCEPTION)
  );
}

export function assertRunValid(card: RunCard, raw?: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (card.schema !== RUN_SCHEMA) errors.push(`schema must be ${RUN_SCHEMA}`);
  if (raw && raw.schema !== RUN_SCHEMA) errors.push(`schema must be ${RUN_SCHEMA}`);
  if (!/^[a-z0-9][a-z0-9._-]+$/.test(card.run_id)) errors.push(`bad run_id ${card.run_id}`);
  if (raw) {
    for (const key of REQUIRED_TOP) {
      if (!(key in raw)) errors.push(`missing ${key}`);
    }
  }
  if (!card.submitted_by.handle || !card.submitted_by.display || !card.submitted_by.rig) {
    errors.push(`${card.run_id} incomplete submitted_by`);
  }
  if (!card.hardware.gpus.length) errors.push(`${card.run_id} needs a GPU`);
  if (card.hardware.gpu_count_used < 1) errors.push(`${card.run_id} bad gpu_count_used`);
  if (!(card.hardware.ram_kit_gb > 0)) errors.push(`${card.run_id} ram_kit_gb required`);
  if (!card.software.backend || !card.software.launch_command.trim()) {
    errors.push(`${card.run_id} missing backend or launch_command`);
  }
  if (!card.model.name || !card.model.quant) errors.push(`${card.run_id} incomplete model`);
  if (BANNED_MODEL.test(`${card.model.name} ${card.model.repo}`)) {
    errors.push(`${card.run_id} names a banned model`);
  }
  if (FORBIDDEN_Q1Q2.test(card.model.quant)) errors.push(`${card.run_id} is Q1/Q2`);
  if (!LAYOUTS.includes(card.config.layout)) errors.push(`${card.run_id} bad layout`);
  if (card.config.context_tokens < 1) errors.push(`${card.run_id} bad context`);
  if (card.results.errors < 0) errors.push(`${card.run_id} bad errors`);
  const hasResult =
    card.results.decode_tps != null ||
    card.results.prefill_tps != null ||
    card.results.aggregate_tps != null ||
    card.results.peak_vram_gb_total != null ||
    card.results.peak_system_ram_gb != null ||
    card.results.peak_vram_gb_per_gpu.length > 0 ||
    (card.estimates && (card.estimates.decode_tps_low != null || card.estimates.decode_tps != null));
  if (!hasResult) errors.push(`${card.run_id} has no result field`);
  if (card.measured && isFlashQ3(card) && !(card.exceptions ?? []).includes(FLASH_Q3_EXCEPTION)) {
    errors.push(`${card.run_id} measured Flash Q3 needs exceptions: ${FLASH_Q3_EXCEPTION}`);
  }
  if (/Q3/i.test(card.model.quant) && !card.measured && !isFlashQ3(card)) {
    const blob = `${card.notes ?? ''} ${card.estimates?.note ?? ''}`;
    if (!/estimate|community/i.test(blob)) {
      errors.push(`${card.run_id} Q3 must be estimate/community unless measured`);
    }
  }
  return errors;
}

export function assertRunSetValid(cards: RunCard[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const card of cards) {
    if (ids.has(card.run_id)) errors.push(`duplicate run_id ${card.run_id}`);
    ids.add(card.run_id);
    errors.push(...assertRunValid(card));
  }
  const schema = schemaDocument();
  if (schema.const !== undefined && schema.properties && typeof schema.properties === 'object') {
    const props = schema.properties as Record<string, { const?: unknown }>;
    if (props.schema?.const !== RUN_SCHEMA) errors.push('docs schema const must be amdai-bench/run@1');
  }
  const required = (schema.required as string[] | undefined) ?? [];
  for (const key of REQUIRED_TOP) {
    if (!required.includes(key)) errors.push(`docs schema missing required ${key}`);
  }
  return errors;
}

export function verifiedMeasured(cards: RunCard[]): RunCard[] {
  return cards.filter((card) => card.measured && card.submitted_by.verified);
}

export function officialAmdaiRuns(cards: RunCard[]): RunCard[] {
  return verifiedMeasured(cards).filter(
    (card) => houseHandle(card.submitted_by.handle) && card.submitted_by.rig === amdai.rig,
  );
}

export type RunMatch = {
  model?: string;
  quant?: string;
  backend?: string;
  context?: number;
  layout?: RunLayout;
  gpus?: number;
  gfx?: string;
  gpuModel?: string;
};

export function matchRuns(cards: RunCard[], query: RunMatch): RunCard[] {
  return cards.filter((card) => {
    if (query.model && !card.model.name.toLowerCase().includes(query.model.toLowerCase()) && !query.model.toLowerCase().includes(card.model.name.toLowerCase())) {
      if (query.model === 'qwen36' && !/35B/i.test(card.model.name)) return false;
      if (query.model === 'flash' && !/flash/i.test(card.model.name)) return false;
      if (query.model !== 'qwen36' && query.model !== 'flash') return false;
    }
    if (query.quant && card.model.quant !== query.quant) return false;
    if (query.backend && !card.software.backend.toLowerCase().includes(query.backend.toLowerCase())) return false;
    if (query.context != null && card.config.context_tokens !== query.context) return false;
    if (query.layout && card.config.layout !== query.layout) return false;
    if (query.gpus != null && card.hardware.gpu_count_used !== query.gpus) return false;
    if (query.gfx && !card.hardware.gpus.some((gpu) => gpu.gfx === query.gfx)) return false;
    if (query.gpuModel && !card.hardware.gpus.some((gpu) => gpu.model.toLowerCase().includes(query.gpuModel!.toLowerCase()))) {
      return false;
    }
    return true;
  });
}

export function bestMeasuredDecode(cards: RunCard[], query: RunMatch): number | null {
  const hits = matchRuns(verifiedMeasured(cards), query).filter((card) => card.results.decode_tps != null);
  if (!hits.length) return null;
  return hits[0]!.results.decode_tps;
}

export function bestMeasuredPrefill(cards: RunCard[], query: RunMatch): number | null {
  const hits = matchRuns(verifiedMeasured(cards), query).filter((card) => card.results.prefill_tps != null);
  return hits[0]?.results.prefill_tps ?? null;
}

export function formatTokCell(n: number | null, approx = false): string {
  if (n == null) return 'not measured';
  return approx ? `~${n} tok/s` : `${n} tok/s`;
}

export function formatVramCell(n: number | null): string {
  if (n == null) return 'not measured';
  return `${n} GB`;
}

export type Qwen36Row = {
  quant: string;
  decode_short: string;
  decode_32k: string;
  decode_128k: string;
  decode_256k: string;
  prefill_32k: string;
  vram_gb: string;
  flag?: string;
};

export type Qwen36SideCell = {
  prefill: string;
  decode: string;
  vramPerGpu: string;
  vramTotal: string;
  systemRam: string;
  runIds: string[];
  href: string;
};

export type Qwen36CompareRow = {
  quant: string;
  context: number;
  contextLabel: string;
  one: Qwen36SideCell;
  both: Qwen36SideCell;
  flag?: string;
};

const QWEN36_TABLE_CONTEXTS = [4096, 32768, 131072, 262144] as const;
const QWEN36_TABLE_QUANTS = ['UD-Q5_K_XL', 'Q5_K_M', 'Q4_K_M', 'Q6_K'] as const;

function joinMeasured(values: Array<number | null | undefined>, unit: 'tok/s' | 'GB'): string {
  const nums = values.filter((n): n is number => n != null);
  if (!nums.length) return 'not measured';
  const unique = [...new Set(nums)];
  return `${unique.join(' / ')} ${unit}`;
}

function sideCell(hits: RunCard[]): Qwen36SideCell {
  const ids = hits.map((card) => card.run_id);
  return {
    prefill: joinMeasured(
      hits.map((card) => card.results.prefill_tps),
      'tok/s',
    ),
    decode: joinMeasured(
      hits.map((card) => card.results.decode_tps),
      'tok/s',
    ),
    vramPerGpu: joinMeasured(
      hits.flatMap((card) => card.results.peak_vram_gb_per_gpu),
      'GB',
    ),
    vramTotal: joinMeasured(
      hits.map((card) => card.results.peak_vram_gb_total),
      'GB',
    ),
    systemRam: joinMeasured(
      hits.map((card) => card.results.peak_system_ram_gb),
      'GB',
    ),
    runIds: ids,
    href: ids.length === 1 ? runPath(ids[0]!) : ids.length ? `/results?quant=${encodeURIComponent(hits[0]!.model.quant)}` : '/results',
  };
}

const CALC_QUANT_FOR_RUN: Record<string, QuantId> = {
  'UD-Q5_K_XL': 'q5_k_m',
  Q5_K_M: 'q5_k_m',
  Q4_K_M: 'q4_k_m',
  Q6_K: 'q6_k',
};

export function measuredRamHitsFromRuns(cards: RunCard[]): MeasuredRamHit[] {
  const hits: MeasuredRamHit[] = [];
  for (const card of officialAmdaiRuns(cards)) {
    if (!isSweep35bCard(card)) continue;
    if (card.results.peak_system_ram_gb == null) continue;
    if (!card.software.backend.toLowerCase().includes('llama.cpp')) continue;
    const quantId = CALC_QUANT_FOR_RUN[card.model.quant];
    if (!quantId) continue;
    hits.push({
      modelId: 'qwen36',
      quant: card.model.quant,
      quantId,
      context: card.config.context_tokens,
      gpuCount: card.hardware.gpu_count_used,
      split: card.config.layout === 'split',
      backendId: 'llamacpp' as BackendId,
      peakGb: card.results.peak_system_ram_gb,
      runId: card.run_id,
    });
  }
  return hits;
}

export function isSupersededQ6k4k(card: RunCard): boolean {
  return card.run_id === Q6_4K_SUPERSEDED_RUN_ID;
}

export function tableMeasured(cards: RunCard[]): RunCard[] {
  return verifiedMeasured(cards).filter((card) => !isSupersededQ6k4k(card));
}

export function q6OneGpu4kPair(cards: RunCard[]): { low: number; high: number } | null {
  const hits = matchRuns(verifiedMeasured(cards), {
    model: 'qwen36',
    quant: 'Q6_K',
    backend: 'llama.cpp',
    context: 4096,
    layout: 'single',
    gpus: 1,
  })
    .map((card) => card.results.decode_tps)
    .filter((n): n is number => n != null)
    .sort((a, b) => a - b);
  if (!hits.length) return null;
  return { low: hits[0]!, high: hits[hits.length - 1]! };
}

export function qwen36TableFromRuns(cards: RunCard[]): {
  label: string;
  engine: string;
  gpu: string;
  kv: string;
  notes: string[];
  rows: Qwen36Row[];
  compare: Qwen36CompareRow[];
} {
  const pool = tableMeasured(cards);
  const hitsFor = (quant: string, context: number, layout: RunLayout, gpus: number) =>
    matchRuns(pool, {
      model: 'qwen36',
      quant,
      backend: 'llama.cpp',
      context,
      layout,
      gpus,
    });
  const cell = (quant: string, context: number, kind: 'decode' | 'prefill' | 'vram'): string => {
    const hits = hitsFor(quant, context, 'single', 1);
    if (kind === 'decode') {
      const values = hits.map((c) => c.results.decode_tps).filter((n): n is number => n != null);
      if (values.length > 1) return `${values.sort((a, b) => a - b).join(' / ')} tok/s`;
      return formatTokCell(values[0] ?? null);
    }
    if (kind === 'prefill') return formatTokCell(hits.find((c) => c.results.prefill_tps != null)?.results.prefill_tps ?? null);
    const vram = hits.find((c) => c.results.peak_vram_gb_total != null || c.results.peak_vram_gb_per_gpu.length)?.results;
    const n = vram?.peak_vram_gb_total ?? vram?.peak_vram_gb_per_gpu[0] ?? null;
    return formatVramCell(n);
  };
  const q6off = (context: number) =>
    context >= 32768 ? 'Partly offloaded to DDR5 on 1 GPU' : undefined;
  const compare: Qwen36CompareRow[] = [];
  for (const quant of QWEN36_TABLE_QUANTS) {
    for (const context of QWEN36_TABLE_CONTEXTS) {
      const oneHits = hitsFor(quant, context, 'single', 1);
      const bothHits = hitsFor(quant, context, 'split', 2);
      compare.push({
        quant,
        context,
        contextLabel: contextLabel(context),
        one: sideCell(oneHits),
        both: sideCell(bothHits),
        flag: quant === 'Q6_K' && context >= 32768 ? q6off(context) : undefined,
      });
    }
  }
  return {
    label: MEASURED_LABEL,
    engine: 'llama.cpp',
    gpu: 'one R9700 vs both R9700s',
    kv: 'f16',
    notes: [
      'Cells come from verified amdai-bench/run@1 cards on local-desktop (overnight sweep 2026-10-12, llama.cpp c060ca974 Vulkan). A blank stays not measured. GB is the Linux GiB value.',
      'Side by side: prefill, decode, VRAM per card, VRAM total, and peak system RAM. At short context one R9700 decodes faster than splitting the same 35B across both cards (UD-Q5_K_XL 102.39 vs 82.78 tok/s at 4K).',
      SWEEP_REVERIFY,
      Q6_4K_VARIANCE_NOTE,
      'Q6_K at 32K and up on one GPU is partly offloaded to DDR5.',
      FLASH_RERUN_NOTE,
    ],
    rows: [
      {
        quant: 'UD-Q5_K_XL',
        decode_short: cell('UD-Q5_K_XL', 4096, 'decode'),
        decode_32k: cell('UD-Q5_K_XL', 32768, 'decode'),
        decode_128k: cell('UD-Q5_K_XL', 131072, 'decode'),
        decode_256k: cell('UD-Q5_K_XL', 262144, 'decode'),
        prefill_32k: cell('UD-Q5_K_XL', 32768, 'prefill'),
        vram_gb: cell('UD-Q5_K_XL', 4096, 'vram'),
      },
      {
        quant: 'Q5_K_M',
        decode_short: cell('Q5_K_M', 4096, 'decode'),
        decode_32k: cell('Q5_K_M', 32768, 'decode'),
        decode_128k: cell('Q5_K_M', 131072, 'decode'),
        decode_256k: cell('Q5_K_M', 262144, 'decode'),
        prefill_32k: cell('Q5_K_M', 32768, 'prefill'),
        vram_gb: cell('Q5_K_M', 4096, 'vram'),
      },
      {
        quant: 'Q4_K_M',
        decode_short: cell('Q4_K_M', 4096, 'decode'),
        decode_32k: cell('Q4_K_M', 32768, 'decode'),
        decode_128k: cell('Q4_K_M', 131072, 'decode'),
        decode_256k: cell('Q4_K_M', 262144, 'decode'),
        prefill_32k: cell('Q4_K_M', 32768, 'prefill'),
        vram_gb: cell('Q4_K_M', 4096, 'vram'),
      },
      {
        quant: 'Q6_K',
        decode_short: cell('Q6_K', 4096, 'decode'),
        decode_32k: cell('Q6_K', 32768, 'decode'),
        decode_128k: cell('Q6_K', 131072, 'decode'),
        decode_256k: cell('Q6_K', 262144, 'decode'),
        prefill_32k: cell('Q6_K', 32768, 'prefill'),
        vram_gb: cell('Q6_K', 4096, 'vram'),
        flag: q6off(32768),
      },
    ],
    compare,
  };
}

export function flashQ3FromRuns(cards: RunCard[]): RunCard | null {
  return verifiedMeasured(cards).find((card) => isMeasuredFlashQ3(card)) ?? null;
}

export function runsForGpu(cards: RunCard[], gfxOrId: string): RunCard[] {
  const needle = gfxOrId.toLowerCase();
  return cards.filter((card) =>
    card.hardware.gpus.some((gpu) => {
      if (gpu.gfx.toLowerCase() === needle || gpu.model.toLowerCase().includes(needle)) return true;
      if (needle === 'r9700') return gpu.gfx === 'gfx1201' || /r9700/i.test(gpu.model);
      return false;
    }),
  );
}

export function runsForModelName(cards: RunCard[], modelId: string): RunCard[] {
  if (modelId === 'qwen36') return cards.filter((card) => /35B/i.test(card.model.name) && !/flash/i.test(card.model.name));
  if (modelId === 'flash') return cards.filter((card) => /flash/i.test(card.model.name));
  return cards.filter((card) => card.model.name.toLowerCase().includes(modelId.toLowerCase()));
}

export function runPath(id: string): string {
  return `/results/${id}`;
}

export function emitRunCard(partial: Omit<RunCard, 'schema'> & { schema?: string }): RunCard {
  const card = parseRunCard({ ...partial, schema: RUN_SCHEMA }, 'emit');
  return card;
}

export function runCardToJsonl(card: RunCard): string {
  return `${JSON.stringify(card)}\n`;
}

export function deriveV1Catalog(cards: RunCard[]): AmdaiBenchFile {
  const pool = matchRuns(verifiedMeasured(cards), { model: 'qwen36', backend: 'llama.cpp', layout: 'single', gpus: 1 });
  const groups = new Map<string, RunCard[]>();
  for (const card of pool) {
    const key = card.model.quant;
    const list = groups.get(key) ?? [];
    list.push(card);
    groups.set(key, list);
  }
  const results = [...groups.entries()].map(([quant, list]) => {
    const first = list[0]!;
    const gpu = first.hardware.gpus[0]!;
    const host = first.submitted_by.rig;
    const hw = {
      host,
      gpu: gpu.model,
      gpu_id: gpu.gfx === 'gfx1201' ? 'r9700' : gpu.gfx,
      gfx: gpu.gfx,
      gpu_count: first.hardware.gpus.length,
      gpus_used: first.hardware.gpu_count_used,
      vram_gb_each: gpu.vram_gb,
      ram_gb: first.hardware.ram_kit_gb,
    };
    return {
      id: `local-desktop-qwen36-${quant.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      trust: 'verified' as const,
      hardware: { ...hw, fingerprint: hardwareFingerprint(hw) },
      pins: {
        model: first.model.name,
        official: first.model.repo.includes('/') ? first.model.repo.replace(/-GGUF$/, '') : first.model.repo,
        gguf: first.model.repo,
        quant,
        backend: first.software.backend,
        runtime: /vulkan/i.test(first.software.launch_command) || /Vulkan/i.test(first.notes ?? '') ? 'Vulkan' : first.software.backend,
        kv: first.config.kv_type,
        offload: first.config.offload.note,
        mtp: false,
        threads: null,
        recipe: null,
      },
      contexts: list.map((card) => ({
        tokens: card.config.context_tokens,
        label: contextLabel(card.config.context_tokens),
        prefill_tok_s: card.results.prefill_tps,
        decode_tok_s: card.results.decode_tps,
        vram_gb: card.results.peak_vram_gb_total ?? card.results.peak_vram_gb_per_gpu[0] ?? null,
      })),
    };
  });
  return {
    schema: AMDAI_BENCH_SCHEMA,
    version: AMDAI_BENCH_VERSION,
    as_of: '2026-10-13',
    label: MEASURED_LABEL,
    source: 'local-desktop official run cards (amdai-bench/run@1)',
    results,
  };
}

export function contextLabel(tokens: number): string {
  if (tokens === 4096 || tokens <= 2048) return 'short';
  if (tokens === 8192) return '8K';
  if (tokens === 32768) return '32K';
  if (tokens === 100000) return '100K';
  if (tokens === 131072) return '128K';
  if (tokens === 262144) return '256K';
  if (tokens >= 1024 && tokens % 1024 === 0) return `${tokens / 1024}K`;
  return `${tokens}`;
}

export function measuredProofNumbers(cards: RunCard[]): number[] {
  const nums: number[] = [];
  for (const card of verifiedMeasured(cards)) {
    if (card.results.decode_tps != null) nums.push(card.results.decode_tps);
    if (card.results.prefill_tps != null) nums.push(card.results.prefill_tps);
    if (card.results.aggregate_tps != null) nums.push(card.results.aggregate_tps);
  }
  return nums;
}

export function uniqueRunFilters(cards: RunCard[]): {
  gpu: string[];
  gpus: number[];
  backend: string[];
  quant: string[];
  context: number[];
  model: string[];
  verified: boolean[];
} {
  return {
    gpu: [...new Set(cards.map((card) => gpuIdFromRun(card)))].sort(),
    gpus: [...new Set(cards.map((card) => card.hardware.gpu_count_used))].sort((a, b) => a - b),
    backend: [...new Set(cards.map((card) => card.software.backend))].sort(),
    quant: [...new Set(cards.map((card) => card.model.quant))].sort(),
    context: [...new Set(cards.map((card) => card.config.context_tokens))].sort((a, b) => a - b),
    model: [...new Set(cards.map((card) => card.model.name))].sort(),
    verified: [true, false].filter((value) => cards.some((card) => card.submitted_by.verified === value)),
  };
}

export function formatNullable(value: string | number | boolean | null | undefined, empty = 'not recorded'): string {
  if (value == null || value === '') return empty;
  if (typeof value === 'boolean') return value ? 'yes' : 'no';
  return String(value);
}

export function gpuIdFromRun(card: RunCard): string {
  const gfx = card.hardware.gpus[0]?.gfx;
  if (gfx === 'gfx1201') return 'r9700';
  return gfx ?? 'unknown';
}
