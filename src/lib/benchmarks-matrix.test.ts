import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runs } from './run-card-data';
import { COMPARE_Q3, parseCompareQuery } from './local-desktop-compare';
import {
  COMPARE_CONTEXTS,
  COMPARE_QUANTS,
  EXPECTED_MATRIX_CELLS,
  assertMatrixValid,
  citedDailyLaunch,
  flashCitedPair,
  flashCiteRows,
  flashExtraRows,
  matrixRows,
} from './benchmarks-matrix';

describe('benchmarks matrix from run cards', () => {
  it('covers every 35B llama.cpp cell without inventing a number', () => {
    assert.deepEqual(assertMatrixValid(runs), []);
    const rows = matrixRows(runs);
    assert.equal(rows.length, EXPECTED_MATRIX_CELLS);
    assert.equal(COMPARE_QUANTS.length * COMPARE_CONTEXTS.length * 2, 32);
    const ud4k = rows.find((row) => row.quant === 'UD-Q5_K_XL' && row.context === 4096 && row.gpuCount === 1);
    assert.equal(ud4k?.decode, '102.39 tok/s');
    assert.equal(ud4k?.prefill, '2761.6 tok/s');
    assert.equal(ud4k?.vramTotal, '25.97 GB');
    assert.equal(ud4k?.systemRam, '37.32 GB');
    assert.ok(ud4k?.pendingReverify);
    assert.match(ud4k?.runHref ?? '', /\/results\//);
    assert.match(ud4k?.compareQuantHref ?? '', /\/compare\/q4-q5-q6\?/);
    assert.match(ud4k?.compareLayoutHref ?? '', /\/compare\/one-vs-two-gpu\?/);
    const split = rows.find((row) => row.quant === 'UD-Q5_K_XL' && row.context === 4096 && row.gpuCount === 2);
    assert.equal(split?.decode, '82.78 tok/s');
    const q6 = rows.find((row) => row.quant === 'Q6_K' && row.context === 4096 && row.gpuCount === 1);
    assert.equal(q6?.decode, '103.23 tok/s');
    assert.doesNotMatch(q6?.decode ?? '', /92\.|93\./);
    assert.ok(!rows.some((row) => row.quant === COMPARE_Q3));
    assert.ok(rows.every((row) => row.decode !== 'not measured'));
    assert.ok(rows.every((row) => row.runIds.length > 0));
  });

  it('keeps the cited Flash Strata vs llama.cpp pair and extra card rows', () => {
    const flash = flashCiteRows(runs);
    const pair = flashCitedPair(flash);
    assert.equal(pair.length, 2);
    assert.ok(pair.some((row) => row.engine.includes('Strata') && row.decode === '32.6 tok/s'));
    assert.ok(pair.some((row) => row.engine.includes('llama.cpp') && row.decode === '16 tok/s'));
    for (const row of pair) {
      assert.equal(row.vram, 'not measured');
      assert.equal(row.ram, 'not measured');
    }
    const extra = flashExtraRows(flash);
    assert.ok(extra.length >= 1);
    assert.ok(extra.every((row) => row.decode !== 'not measured'));
    const blob = JSON.stringify(flash);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /TODO|upcoming/i);
  });

  it('shares ?q= / ?n= / ?c= like /compare and cites llama-bench from the card', () => {
    const parsed = parseCompareQuery('?q=q5xl&n=1&c=4k');
    assert.deepEqual(parsed.quants, ['UD-Q5_K_XL']);
    assert.equal(parsed.gpuCount, 1);
    assert.deepEqual(parsed.contexts, [4096]);
    const launch = citedDailyLaunch(runs);
    assert.ok(launch);
    assert.match(launch.command, /llama-bench/);
    assert.doesNotMatch(launch.command, /TODO|TBD|FIXME/);
    assert.equal(launch.vram4k, '25.97 GB');
    assert.equal(launch.vram256k, '29.34 GB');
    assert.match(launch.note, /not on the card/);
  });
});
