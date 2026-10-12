import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import {
  ALLOWED_TOK_S,
  MEASURED_LABEL,
  assertBenchmarksValid,
  compareRows,
  formatTokS,
  parseBenchmarks,
} from './benchmarks';

const raw = readFileSync(new URL('../data/benchmarks.yaml', import.meta.url), 'utf8');
const file = parseBenchmarks(parse(raw));

describe('benchmarks catalog', () => {
  it('seeds only the allowed first-party tok/s and labels them', () => {
    assert.deepEqual(assertBenchmarksValid(file), []);
    assert.equal(file.label, MEASURED_LABEL);
    assert.match(file.source, /local-desktop/);
    const values = file.runs.map((run) => run.tok_s).filter((n): n is number => n != null);
    for (const n of values) {
      assert.ok(ALLOWED_TOK_S.includes(n as (typeof ALLOWED_TOK_S)[number]), String(n));
    }
    for (const allowed of ALLOWED_TOK_S) {
      assert.ok(values.some((n) => Math.abs(n - allowed) < 1e-9), String(allowed));
    }
  });

  it('never invents a number, never drops below Q4, never names banned Qwen', () => {
    const blob = JSON.stringify(file);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:Q[123]|IQ[123])(?:_|\b)/);
    assert.doesNotMatch(blob, /1814/);
    for (const run of file.runs) {
      assert.equal(run.mtp, false);
      if (run.tok_s == null) {
        assert.equal(formatTokS(run.tok_s), 'not measured');
      }
    }
  });

  it('builds compare rows with calculator share links for existing stacks', () => {
    const rows = compareRows(file);
    assert.equal(rows.length, file.runs.length);
    assert.ok(rows.every((row) => row.tok_s.startsWith('~') || row.tok_s === 'not measured'));
    const daily = file.runs.find((run) => run.id === 'qwen36-ud-q5-256k');
    assert.match(daily?.calculator ?? '', /quant=q5_k_m/);
    assert.match(daily?.calculator ?? '', /ctx=262144/);
    const flash = file.runs.find((run) => run.id === 'flash-strata-262k');
    assert.match(flash?.calculator ?? '', /model=flash/);
    assert.equal(flash?.recipe, 'strata-flash-q6');
  });

  it('only cites http(s) word sources and keeps llama.cpp first', () => {
    assert.ok(file.runs[0]?.engine.includes('llama.cpp'));
    for (const source of file.word_sources) {
      assert.match(source.href, /^https:\/\//);
    }
  });
});
