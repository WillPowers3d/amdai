import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  REPORT_HOWTO,
  REPORT_SCHEMA,
  REPORT_SCHEMA_HREF,
  applyIngest,
  assertReportHowtoValid,
  classifyReportCard,
  parseLabNotesReport,
  planIngest,
  reportHowtoBlob,
  reportSchemaDocument,
} from './lab-notes-report';
import { FLASH_Q3_EXCEPTION, RUN_SCHEMA, parseJsonl } from './run-card';
import { runs } from './run-card-data';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';

function cloneCard(runId: string, patch: Record<string, unknown> = {}) {
  const base = runs.find((card) => card.model.quant === 'UD-Q5_K_XL' && card.measured);
  assert.ok(base);
  return { ...structuredClone(base), run_id: runId, ...patch };
}

function pack(cards: unknown[], extra: Record<string, unknown> = {}) {
  return { schema: REPORT_SCHEMA, source: 'stack-lab', runs: cards, ...extra };
}

describe('lab-notes-report/1 ingest', () => {
  it('parses a Stack Lab pack as existing run@1 cards', () => {
    assert.deepEqual(assertReportHowtoValid(), []);
    const schema = reportSchemaDocument();
    const props = schema.properties as Record<string, { const?: unknown }>;
    assert.equal(props.schema?.const, REPORT_SCHEMA);
    assert.equal(schema.$id, 'https://amdai.net/amdai-bench/lab-notes-report@1.schema.json');

    const fresh = cloneCard('ingest-q5-32k-llamacpp');
    const parsed = parseLabNotesReport(pack([fresh]));
    assert.equal(parsed.schema, REPORT_SCHEMA);
    assert.equal(parsed.runs.length, 1);
    assert.equal(parsed.runs[0]?.schema, RUN_SCHEMA);
    assert.equal(parsed.runs[0]?.run_id, 'ingest-q5-32k-llamacpp');
    assert.equal(parsed.runs[0]?.results.decode_tps, fresh.results.decode_tps);

    const one = parseLabNotesReport(fresh);
    assert.equal(one.runs[0]?.run_id, 'ingest-q5-32k-llamacpp');

    const aliased = parseLabNotesReport({ schema: REPORT_SCHEMA, cards: [fresh] });
    assert.equal(aliased.runs[0]?.run_id, 'ingest-q5-32k-llamacpp');
  });

  it('refuses invalid packs, Q1/Q2, and banned models', () => {
    assert.throws(() => parseLabNotesReport({ schema: 'nope', runs: [] }), /lab-notes-report\/1/);
    assert.throws(() => parseLabNotesReport({ schema: REPORT_SCHEMA, runs: [] }), /no runs/);
    const q2 = cloneCard('ingest-q2-banned', { model: { ...cloneCard('x').model, quant: 'Q2_K' } });
    assert.throws(() => parseLabNotesReport(pack([q2])), /Q1\/Q2/);
    const banned = cloneCard('ingest-qwen25', {
      model: { ...cloneCard('y').model, name: 'Qwen2.5-32B', repo: 'example/Qwen2.5' },
    });
    assert.throws(() => parseLabNotesReport(pack([banned])), /banned model/);
  });

  it('merges verified Q4+ rows, skips existing ids, and labels Q3', () => {
    const fresh = cloneCard('ingest-q5-new');
    const existing = cloneCard(runs[0]!.run_id);
    const q3 = cloneCard('ingest-q3-estimate', {
      model: { ...cloneCard('z').model, quant: 'UD-Q3_K_XL' },
      notes: 'Q3 labeled estimate from a pack — not a house pick.',
    });
    const unverified = cloneCard('ingest-unverified', {
      submitted_by: { ...cloneCard('u').submitted_by, verified: false },
    });
    const parsed = parseLabNotesReport(pack([fresh, existing, q3, unverified]));
    const plan = planIngest(parsed, runs);
    assert.equal(plan.merge.map((card) => card.run_id).join(), 'ingest-q5-new');
    assert.ok(plan.skip.some((row) => row.runId === existing.run_id));
    assert.ok(plan.label.some((row) => row.runId === 'ingest-q3-estimate' && /labeled estimate/.test(row.reason)));
    assert.ok(plan.refuse.some((row) => row.runId === 'ingest-unverified'));

    const q3row = classifyReportCard(q3, new Set());
    assert.equal(q3row.decision, 'label');
    const flashOk = classifyReportCard(
      cloneCard('ingest-flash-q3-ok', {
        model: { ...cloneCard('f').model, name: 'Qwen 3.8 Flash', quant: 'Q3_K_M' },
        exceptions: [FLASH_Q3_EXCEPTION],
      }),
      new Set(),
    );
    assert.equal(flashOk.decision, 'merge');
  });

  it('appends merged cards to jsonl and refuses a write when a row is invalid', () => {
    const dir = mkdtempSync(join(tmpdir(), 'lab-notes-report-'));
    const out = join(dir, 'stack-lab-import.jsonl');
    const fresh = cloneCard('ingest-write-q5');
    const ok = planIngest(parseLabNotesReport(pack([fresh])), runs);
    const written = applyIngest(ok, out);
    assert.equal(written.appended, 1);
    const loaded = parseJsonl(readFileSync(out, 'utf8'), out);
    assert.equal(loaded[0]?.run_id, 'ingest-write-q5');
    assert.equal(loaded[0]?.schema, RUN_SCHEMA);

    const bad = planIngest(
      parseLabNotesReport(
        pack([
          cloneCard('ingest-write-unverified', {
            submitted_by: { ...cloneCard('u').submitted_by, verified: false },
          }),
        ]),
      ),
      runs,
    );
    assert.throws(() => applyIngest(bad, out), /refuse/);
    writeFileSync(join(dir, 'pack.json'), JSON.stringify(pack([cloneCard('ingest-cli-q5')])));
  });

  it('documents Import from Stack Lab without invented speeds or prices', () => {
    const blob = reportHowtoBlob();
    assert.equal(REPORT_HOWTO.title, 'Import from Stack Lab');
    assert.match(blob, /lab-notes-report\/1/);
    assert.match(blob, /amdai-bench\/run@1/);
    assert.match(blob, /llama\.cpp/);
    assert.ok(blob.includes(RAM_MIN_LABEL));
    assert.ok(blob.includes(RAM_FULL_LABEL));
    assert.ok(blob.includes(REPORT_SCHEMA_HREF));
    assert.match(blob, /ingest/);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\$\d|\bMSRP\b/);
    assert.doesNotMatch(blob, /\b\d+(?:\.\d+)?\s*tok\/s\b/i);
  });
});
