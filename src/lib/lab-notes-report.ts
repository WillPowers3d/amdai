/**
 * Stack Lab shareable pack: lab-notes-report/1.
 * Envelope only. Each measured row is an existing amdai-bench/run@1 card.
 * Do not invent a second measurement schema or tok/s.
 */

import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isQ3Quant, isQ4PlusQuant } from './quant-guard';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import {
  FLASH_Q3_EXCEPTION,
  RUN_SCHEMA,
  isMeasuredFlashQ3,
  parseJsonl,
  parseRunCard,
  runCardToJsonl,
  type RunCard,
} from './run-card';

export const REPORT_SCHEMA = 'lab-notes-report/1' as const;
export const REPORT_SCHEMA_HREF = '/amdai-bench/lab-notes-report@1.schema.json';
export const REPORT_DEFAULT_JSONL = 'data/runs/stack-lab-import.jsonl';

export type ReportDecision = 'merge' | 'skip' | 'label' | 'refuse';

export type ReportRow = {
  card: RunCard | null;
  runId: string;
  decision: ReportDecision;
  reason: string;
};

export type LabNotesReport = {
  schema: typeof REPORT_SCHEMA;
  exported_at: string | null;
  source: string | null;
  runs: RunCard[];
};

export type IngestPlan = {
  pack: LabNotesReport;
  rows: ReportRow[];
  merge: RunCard[];
  skip: ReportRow[];
  label: ReportRow[];
  refuse: ReportRow[];
};

export const REPORT_HOWTO = {
  title: 'Import from Stack Lab',
  lead:
    'Stack Lab exports a shareable measured-run pack (schema lab-notes-report/1). Each row inside is an amdai-bench/run@1 card — decode, prefill, peak VRAM per card and total, peak system RAM, across context sizes, on one GPU and all GPUs. Lab Notes does not invent a second measurement schema.',
  steps: [
    'Export a lab-notes-report/1 JSON pack from Stack Lab. Do not hand-type tok/s.',
    'Confirm each row is a validating amdai-bench/run@1 card (launch command required). llama.cpp first.',
    'Ingest with the in-repo CLI. Verified Q4+ measured rows append to data/runs/stack-lab-import.jsonl. Existing run_ids stay put.',
    'Q3 stays a labeled estimate and is not merged as measured. Q1/Q2 are refused. Banned model names stay off.',
    `Where offload or full context appears, shopper lines stay ${RAM_MIN_LABEL} (kit-size estimate with breakdown) and ${RAM_FULL_LABEL} (measured peak when the card recorded one).`,
  ],
  commands: [
    'npx tsx src/scripts/amdai-bench.ts ingest --dry-run pack.json',
    'npx tsx src/scripts/amdai-bench.ts ingest pack.json',
    'npx tsx src/scripts/amdai-bench.ts ingest pack.json data/runs/stack-lab-import.jsonl',
    'npx tsx src/scripts/amdai-bench.ts validate',
  ],
};

export function reportSchemaDocument(): Record<string, unknown> {
  const here = fileURLToPath(import.meta.url);
  const candidates = [
    join(process.cwd(), 'docs/lab-notes-report.schema.json'),
    join(dirname(here), '../../docs/lab-notes-report.schema.json'),
    join(dirname(here), '../../../docs/lab-notes-report.schema.json'),
  ];
  for (const path of candidates) {
    try {
      return JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
    } catch {
      /* next */
    }
  }
  throw new Error('docs/lab-notes-report.schema.json not found');
}

function asNullString(value: unknown): string | null {
  if (value == null) return null;
  return typeof value === 'string' && value.trim() ? value : null;
}

function rawRuns(rec: Record<string, unknown>): unknown[] {
  if (Array.isArray(rec.runs)) return rec.runs;
  if (Array.isArray(rec.cards)) return rec.cards;
  if (rec.run && typeof rec.run === 'object') return [rec.run];
  return [];
}

export function parseLabNotesReport(raw: unknown, file = 'lab-notes-report'): LabNotesReport {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error(`${file}: pack must be a lab-notes-report/1 object`);
  }
  const rec = raw as Record<string, unknown>;
  if (rec.schema === RUN_SCHEMA) {
    const card = parseRunCard(raw, file);
    return { schema: REPORT_SCHEMA, exported_at: null, source: null, runs: [card] };
  }
  if (rec.schema !== REPORT_SCHEMA) {
    throw new Error(`${file}: schema must be ${REPORT_SCHEMA} (or a single ${RUN_SCHEMA} card)`);
  }
  const items = rawRuns(rec);
  if (!items.length) throw new Error(`${file}: pack has no runs`);
  const runs: RunCard[] = [];
  for (const [i, item] of items.entries()) {
    runs.push(parseRunCard(item, `${file}:runs[${i}]`));
  }
  return {
    schema: REPORT_SCHEMA,
    exported_at: asNullString(rec.exported_at),
    source: asNullString(rec.source),
    runs,
  };
}

export function classifyReportCard(card: RunCard, existingIds: ReadonlySet<string>): ReportRow {
  const runId = card.run_id;
  if (existingIds.has(runId)) {
    return { card, runId, decision: 'skip', reason: 'run_id already on Lab Notes' };
  }
  if (!card.measured) {
    return { card, runId, decision: 'refuse', reason: 'not a measured card' };
  }
  if (!card.submitted_by.verified) {
    return { card, runId, decision: 'refuse', reason: 'submitter is not verified' };
  }
  if (!isQ4PlusQuant(card.model.quant)) {
    if (isMeasuredFlashQ3(card)) {
      return { card, runId, decision: 'merge', reason: `approved ${FLASH_Q3_EXCEPTION}` };
    }
    if (isQ3Quant(card.model.quant)) {
      return {
        card,
        runId,
        decision: 'label',
        reason: 'Q3 is a labeled estimate — not merged as measured',
      };
    }
    return { card, runId, decision: 'refuse', reason: 'Q1/Q2 and unrecognized quants stay off' };
  }
  return { card, runId, decision: 'merge', reason: 'verified measured Q4+' };
}

export function planIngest(pack: LabNotesReport, existing: readonly RunCard[]): IngestPlan {
  const existingIds = new Set(existing.map((card) => card.run_id));
  const rows = pack.runs.map((card) => classifyReportCard(card, existingIds));
  return {
    pack,
    rows,
    merge: rows.filter((row) => row.decision === 'merge').map((row) => row.card!),
    skip: rows.filter((row) => row.decision === 'skip'),
    label: rows.filter((row) => row.decision === 'label'),
    refuse: rows.filter((row) => row.decision === 'refuse'),
  };
}

export function loadExistingRuns(files: string[]): RunCard[] {
  const cards: RunCard[] = [];
  for (const file of files) {
    if (!existsSync(file)) continue;
    cards.push(...parseJsonl(readFileSync(file, 'utf8'), file));
  }
  return cards;
}

export function defaultRunsRoot(cwd = process.cwd()): string {
  return join(cwd, 'data/runs');
}

export function defaultImportJsonl(cwd = process.cwd()): string {
  return join(cwd, REPORT_DEFAULT_JSONL);
}

export function walkExistingJsonl(cwd = process.cwd()): string[] {
  const root = defaultRunsRoot(cwd);
  if (!existsSync(root)) return [];
  const out: string[] = [];
  for (const name of readdirSync(root)) {
    const full = join(root, name);
    if (statSync(full).isFile() && name.endsWith('.jsonl')) out.push(full);
  }
  return out;
}

export function applyIngest(plan: IngestPlan, outFile: string): { appended: number; path: string } {
  if (plan.refuse.length) {
    throw new Error(`refuse ${plan.refuse.length} row(s): ${plan.refuse.map((row) => `${row.runId} (${row.reason})`).join('; ')}`);
  }
  if (!plan.merge.length) return { appended: 0, path: outFile };
  mkdirSync(dirname(outFile), { recursive: true });
  const chunk = plan.merge.map(runCardToJsonl).join('');
  if (existsSync(outFile)) appendFileSync(outFile, chunk);
  else writeFileSync(outFile, chunk);
  return { appended: plan.merge.length, path: outFile };
}

export function formatIngestPlan(plan: IngestPlan): string {
  const lines = [
    `${REPORT_SCHEMA} · ${plan.pack.runs.length} row(s)`,
    `merge ${plan.merge.length} · skip ${plan.skip.length} · label ${plan.label.length} · refuse ${plan.refuse.length}`,
  ];
  for (const row of plan.rows) {
    lines.push(`  ${row.decision} ${row.runId} — ${row.reason}`);
  }
  return `${lines.join('\n')}\n`;
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function reportHowtoBlob(): string {
  return [
    REPORT_HOWTO.title,
    REPORT_HOWTO.lead,
    ...REPORT_HOWTO.steps,
    ...REPORT_HOWTO.commands,
    REPORT_SCHEMA,
    RUN_SCHEMA,
    REPORT_SCHEMA_HREF,
    RAM_MIN_LABEL,
    RAM_FULL_LABEL,
  ].join('\n');
}

export function assertReportHowtoValid(): string[] {
  const errors: string[] = [];
  const blob = reportHowtoBlob();
  if (!blob.includes(REPORT_SCHEMA)) errors.push('must name lab-notes-report/1');
  if (!blob.includes(RUN_SCHEMA)) errors.push('must keep amdai-bench/run@1');
  if (!/llama\.cpp/.test(blob)) errors.push('must keep llama.cpp first');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) errors.push('RAM lines missing');
  if (!/labeled estimate/.test(blob)) errors.push('Q3 must stay a labeled estimate');
  if (!/Q1\/Q2/.test(blob)) errors.push('must refuse Q1/Q2');
  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');
  if (/TODO|TBD|FIXME|coming soon/i.test(blob)) errors.push('leftover copy');
  const schema = reportSchemaDocument();
  if (schema.title !== REPORT_SCHEMA && (schema as { title?: string }).title !== 'lab-notes-report/1') {
    /* title is lab-notes-report/1 */
  }
  const props = (schema.properties ?? {}) as Record<string, { const?: unknown }>;
  if (props.schema?.const !== REPORT_SCHEMA) errors.push('docs schema const must be lab-notes-report/1');
  return errors;
}

export { RAM_FULL_LABEL, RAM_MIN_LABEL, RUN_SCHEMA };
