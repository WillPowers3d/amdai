/**
 * First-party benches. Logic lives here so tests never import YAML via ?raw.
 * Allowed tok/s are the local-desktop set only. null = not measured.
 */

export const MEASURED_LABEL = 'Measured on our rig, 2026-10';

/** tok/s published for this hub. Anything else is a validation error. */
export const ALLOWED_TOK_S = [100.8, 88, 50, 108.3, 116.5, 32.6, 16] as const;

const BANNED_MODEL = /Qwen2\.5|Qwen3-8B/i;
const BELOW_Q4 = /\b(?:Q[123]|IQ[123])(?:_|\b)/i;

export type BenchMetric = 'tg' | 'pp';

export type BenchRun = {
  id: string;
  model: string;
  official: string;
  gguf: string;
  quant: string;
  engine: string;
  backend: string;
  recipe: string | null;
  kv: string;
  gpus: number;
  offload: string;
  mtp: boolean;
  threads: number | null;
  context_label: string;
  context_tokens: number | null;
  metric: BenchMetric;
  tok_s: number | null;
  calculator: string | null;
  notes: string;
};

export type BenchSource = {
  title: string;
  href: string;
};

export type BenchmarksFile = {
  as_of: string;
  label: string;
  source: string;
  test_rig: {
    label: string;
    host: string;
    gpus: string;
    ram: string;
    note: string;
  };
  runs: BenchRun[];
  word_sources: BenchSource[];
};

export type CompareRow = {
  id: string;
  engine: string;
  quant: string;
  context: string;
  metric: string;
  tok_s: string;
  calculator: string | null;
  notes: string;
};

function isAllowedTok(n: number): boolean {
  return ALLOWED_TOK_S.some((allowed) => Math.abs(allowed - n) < 1e-9);
}

export function parseBenchmarks(raw: unknown): BenchmarksFile {
  const file = raw as BenchmarksFile;
  const errors = assertBenchmarksValid(file);
  if (errors.length) {
    throw new Error(`benchmarks.yaml: ${errors.join('; ')}`);
  }
  return file;
}

export function formatTokS(n: number | null): string {
  if (n == null) return 'not measured';
  return `~${n} tok/s`;
}

export function metricLabel(metric: BenchMetric): string {
  return metric === 'pp' ? 'pp (prefill)' : 'tg (decode)';
}

export function compareRows(file: BenchmarksFile): CompareRow[] {
  return file.runs.map((run) => ({
    id: run.id,
    engine: run.threads != null ? `${run.engine} (${run.threads} threads)` : run.engine,
    quant: run.quant,
    context: run.context_label,
    metric: metricLabel(run.metric),
    tok_s: formatTokS(run.tok_s),
    calculator: run.calculator,
    notes: run.notes,
  }));
}

export function assertBenchmarksValid(file: BenchmarksFile): string[] {
  const errors: string[] = [];
  if (!file?.as_of) errors.push('missing as_of');
  if (file?.label !== MEASURED_LABEL) errors.push(`label must be ${MEASURED_LABEL}`);
  if (!file?.source) errors.push('missing source');
  if (!file?.test_rig?.gpus || !file.test_rig.ram) errors.push('missing test_rig');
  if (!file?.runs?.length) errors.push('no runs');

  const ids = new Set<string>();
  for (const run of file.runs ?? []) {
    if (!run.id || ids.has(run.id)) errors.push(`bad or duplicate id ${run.id}`);
    ids.add(run.id);
    if (BANNED_MODEL.test(`${run.model} ${run.official} ${run.gguf}`)) {
      errors.push(`${run.id} names a banned model`);
    }
    if (BELOW_Q4.test(run.quant)) errors.push(`${run.id} is below Q4`);
    if (run.mtp) errors.push(`${run.id} must not use MTP`);
    if (run.metric !== 'tg' && run.metric !== 'pp') errors.push(`${run.id} bad metric`);
    if (run.tok_s != null && !isAllowedTok(run.tok_s)) {
      errors.push(`${run.id} has unsourced tok/s ${run.tok_s}`);
    }
    if (run.calculator && !run.calculator.startsWith('/calculator?')) {
      errors.push(`${run.id} calculator must be a /calculator share link`);
    }
  }

  for (const allowed of ALLOWED_TOK_S) {
    if (!(file.runs ?? []).some((run) => run.tok_s != null && Math.abs(run.tok_s - allowed) < 1e-9)) {
      errors.push(`missing allowed figure ${allowed}`);
    }
  }

  for (const source of file.word_sources ?? []) {
    if (!/^https:\/\//.test(source.href)) errors.push(`non-https ${source.href}`);
  }

  return errors;
}
