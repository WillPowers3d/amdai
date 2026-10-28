import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runs } from './run-card-data';
import { allNav, primaryNav } from './site';
import {
  COMPARE_Q3,
  assertCompareValid,
  decodeWinner,
  defaultCompareState,
  filterOneVsTwo,
  filterQuantRows,
  oneVsTwoRows,
  parseCompareQuery,
  quantCompareRows,
  serializeCompareQuery,
  winnerSummary,
} from './local-desktop-compare';

describe('local desktop compare tables', () => {
  it('builds 1-vs-2 and Q4/Q5/Q6 tables from official cards only', () => {
    assert.deepEqual(assertCompareValid(runs), []);
    const rows = oneVsTwoRows(runs);
    assert.equal(rows.length, 16);
    const ud4k = rows.find((row) => row.quant === 'UD-Q5_K_XL' && row.context === 4096);
    assert.equal(ud4k?.one.decode, '102.39 tok/s');
    assert.equal(ud4k?.both.decode, '82.78 tok/s');
    assert.equal(decodeWinner(ud4k!).winner, 'one');
    const q6 = rows.find((row) => row.quant === 'Q6_K' && row.context === 4096);
    assert.equal(decodeWinner(q6!).winner, 'one');
    assert.equal(q6?.one.decode, '103.23 tok/s');
    const summary = winnerSummary(rows);
    assert.ok(summary.one >= 1);
    assert.match(summary.headline, /one R9700|split|mixed/i);

    const quants = quantCompareRows(runs);
    assert.equal(quants.length, 8);
    const one4k = quants.find((row) => row.gpuCount === 1 && row.context === 4096);
    assert.ok(one4k);
    assert.equal(one4k?.columns.at(-1)?.quant, COMPARE_Q3);
    assert.equal(one4k?.columns.at(-1)?.kind, 'estimate');
    assert.equal(one4k?.columns.at(-1)?.decode, 'not measured');
    assert.match(one4k?.columns.at(-1)?.note ?? '', /estimate/i);
    assert.match(one4k?.columns.at(-1)?.ramMin.text ?? '', /estimate/i);
    const q5 = one4k?.columns.find((col) => col.quant === 'UD-Q5_K_XL');
    assert.equal(q5?.kind, 'measured');
    assert.match(q5?.decode ?? '', /102\.39/);
    assert.ok(q5?.runIds.length);
    assert.match(q5?.ramFull.text ?? '', /measured|estimate/);
    assert.ok((q5?.ramFull.kitGb ?? 0) >= 32);
  });

  it('shares ?q= / ?n= / ?c= and never invents a Q3 speed', () => {
    const parsed = parseCompareQuery('?q=q5xl,q3&n=1&c=4k,256k');
    assert.deepEqual(parsed.quants, ['UD-Q5_K_XL', 'UD-Q3_K_XL']);
    assert.equal(parsed.gpuCount, 1);
    assert.deepEqual(parsed.contexts, [4096, 262144]);
    assert.equal(serializeCompareQuery(parsed), 'n=1&q=q5xl%2Cq3&c=4k%2C256k');
    assert.deepEqual(parseCompareQuery(''), defaultCompareState());

    const layout = filterOneVsTwo(oneVsTwoRows(runs), parsed);
    assert.ok(layout.every((row) => row.quant === 'UD-Q5_K_XL'));
    assert.ok(layout.every((row) => row.context === 4096 || row.context === 262144));

    const filtered = filterQuantRows(quantCompareRows(runs), parsed);
    assert.ok(filtered.every((row) => row.gpuCount === 1));
    assert.ok(filtered.every((row) => row.columns.every((col) => col.quant === 'UD-Q5_K_XL' || col.quant === COMPARE_Q3)));
    assert.ok(filtered.some((row) => row.columns.some((col) => col.quant === COMPARE_Q3 && col.decode === 'not measured')));
  });

  it('lists /compare in nav and keeps house rules', () => {
    assert.ok(primaryNav.some((item) => item.href === '/compare'));
    assert.ok(allNav.some((item) => item.href === '/compare'));
    assert.match(primaryNav.find((item) => item.href === '/compare')?.description ?? '', /35B|one vs two|Q3/i);
    const blob = JSON.stringify(quantCompareRows(runs));
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /floor is q4|q4 floor|q4 and up only/i);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.match(blob, /Q3/);
  });

  it('puts a next-step buy box on the one-vs-two-GPU page', () => {
    const page = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), '../pages/compare/one-vs-two-gpu.astro'),
      'utf8',
    );
    assert.match(page, /NextStepBuyBox/);
    assert.match(page, /ONE_VS_TWO_PICKS/);
    assert.match(page, /ONE_VS_TWO_SRC/);
  });
});
