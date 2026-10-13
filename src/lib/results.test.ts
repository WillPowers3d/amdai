import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  ALLOWED_DECODE,
  ALLOWED_PREFILL,
  ALLOWED_VRAM,
  AMDAI_BENCH_SCHEMA,
  AMDAI_BENCH_VERSION,
  MEASURED_LABEL,
  assertAmdaiBenchValid,
  filterResultRows,
  flattenResults,
  formatTokS,
  formatVram,
  hardwareFingerprint,
  parseAmdaiBench,
  uniqueFilterValues,
} from './results';
import { primaryNav } from './site';
import { amdaiBenchFile } from './results-data';

const raw = readFileSync(new URL('../data/amdai-bench.v1.json', import.meta.url), 'utf8');
const snapshot = parseAmdaiBench(JSON.parse(raw));
const file = amdaiBenchFile;

describe('amdai-bench v1 catalog', () => {
  it('is version 1 and seeds only the cited 35B local-desktop numbers', () => {
    assert.deepEqual(assertAmdaiBenchValid(file), []);
    assert.equal(file.schema, AMDAI_BENCH_SCHEMA);
    assert.equal(file.version, AMDAI_BENCH_VERSION);
    assert.equal(file.label, MEASURED_LABEL);
    assert.match(file.source, /local-desktop/);
    assert.ok(file.results.every((result) => result.trust === 'verified'));
    assert.ok(file.results.every((result) => result.pins.model.includes('35B')));
  });

  it('never invents Flash scores, banned Qwen, or Q1/Q2', () => {
    const blob = JSON.stringify(file);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B|Flash/);
    assert.doesNotMatch(blob, /\b(?:Q[12]|IQ[12])(?:_|\b)/);
    assert.doesNotMatch(blob, /32\.6/);
    for (const result of file.results) {
      assert.equal(result.pins.mtp, false);
      assert.equal(
        result.hardware.fingerprint,
        hardwareFingerprint({
          host: result.hardware.host,
          gpu: result.hardware.gpu,
          gpu_id: result.hardware.gpu_id,
          gfx: result.hardware.gfx,
          gpu_count: result.hardware.gpu_count,
          gpus_used: result.hardware.gpus_used,
          vram_gb_each: result.hardware.vram_gb_each,
          ram_gb: result.hardware.ram_gb,
        }),
      );
    }
  });

  it('publishes every allowed 35B decode, the Q4 prefill, and Q5_K_M VRAM', () => {
    const rows = flattenResults(file);
    const decodes = rows.map((row) => row.decode).filter((n): n is number => n != null);
    const prefills = rows.map((row) => row.prefill).filter((n): n is number => n != null);
    const vrams = rows.map((row) => row.vramGb).filter((n): n is number => n != null);
    for (const allowed of ALLOWED_DECODE) {
      assert.ok(decodes.some((n) => Math.abs(n - allowed) < 1e-9), String(allowed));
    }
    for (const allowed of ALLOWED_PREFILL) {
      assert.ok(prefills.some((n) => Math.abs(n - allowed) < 1e-9), String(allowed));
    }
    for (const allowed of ALLOWED_VRAM) {
      assert.ok(vrams.some((n) => Math.abs(n - allowed) < 1e-9), String(allowed));
    }
    const q4 = rows.find((row) => row.quant === 'Q4_K_M' && row.contextTokens === 32768);
    assert.equal(q4?.prefill, 1814);
    assert.equal(q4?.decode, null);
    assert.equal(formatTokS(null), 'not measured');
    assert.equal(formatVram(28.5), '28.5 GB');
  });

  it('filters by GPU, GPU count, backend, quant, context, and trust', () => {
    const rows = flattenResults(file);
    const options = uniqueFilterValues(rows);
    assert.deepEqual(options.gpu, ['r9700']);
    assert.deepEqual(options.gpus, [1]);
    assert.deepEqual(options.backend, ['llama.cpp']);
    assert.ok(options.quant.includes('UD-Q5_K_XL'));
    assert.ok(options.context.includes(262144));
    assert.deepEqual(options.trust, ['verified']);

    const daily = filterResultRows(rows, {
      gpu: 'r9700',
      gpus: 1,
      backend: 'llama.cpp',
      quant: 'UD-Q5_K_XL',
      context: 262144,
      trust: 'verified',
    });
    assert.equal(daily.length, 1);
    assert.equal(daily[0]?.decode, 50);

    const submitted = filterResultRows(rows, { trust: 'submitted' });
    assert.equal(submitted.length, 0);

    const missingGpu = filterResultRows(rows, { gpu: 'rx9070xt' });
    assert.equal(missingGpu.length, 0);
    assert.ok(primaryNav.some((item) => item.href === '/results'));
    assert.match(primaryNav.find((item) => item.href === '/results')?.description ?? '', /run@1/);
    assert.equal(snapshot.schema, file.schema);
    assert.equal(snapshot.version, file.version);
  });
});
