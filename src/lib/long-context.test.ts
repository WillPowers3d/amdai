import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import {
  COMPARE_Q3,
  LONG_CONTEXT_DESCRIPTION,
  LONG_CONTEXT_EMPTY,
  LONG_CONTEXT_TITLE,
  assertLongContextValid,
  longContextBlob,
  longContextFlashRows,
  longContextHrefs,
  longContextQuantRows,
} from './long-context';

const here = dirname(fileURLToPath(import.meta.url));

describe('long-context guide', () => {
  it('stays cited, llama.cpp-first, and invents no empty-cell numbers', () => {
    assert.deepEqual(assertLongContextValid(), []);
    assert.equal(LONG_CONTEXT_TITLE, 'Long context on Radeon');
    assert.equal(LONG_CONTEXT_EMPTY, 'not measured yet');
    assert.ok(LONG_CONTEXT_DESCRIPTION.length >= 70);
    assert.ok(LONG_CONTEXT_DESCRIPTION.length <= 160);
    const blob = longContextBlob();
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /f16 KV/);
    assert.match(blob, /not measured yet/);
    assert.match(blob, /Lost in the Middle/);
    assert.ok(blob.includes(RAM_MIN_LABEL));
    assert.ok(blob.includes(RAM_FULL_LABEL));
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /TODO|TBD|FIXME|coming soon/i);
    assert.doesNotMatch(blob, /\$\d|\bMSRP\b/);
    assert.doesNotMatch(blob, /floor is q4|q4 floor|q4 and up only/i);
    const hrefs = longContextHrefs();
    for (const href of ['/glossary#kv-cache', '/calculator', '/multi-gpu', '/flash-ram-offload', '/troubleshoot#oom-context']) {
      assert.ok(hrefs.includes(href), href);
    }
    const q3 = longContextQuantRows().flatMap((row) => row.columns).filter((col) => col.quant === COMPARE_Q3);
    assert.ok(q3.every((col) => col.kind === 'estimate' && col.decode === LONG_CONTEXT_EMPTY));
    assert.ok(longContextFlashRows().some((row) => Object.values(row.cells).some((cell) => cell.measured)));
    assert.match(blob, /100K/);
    assert.ok(hrefs.includes('/models/flash'));
  });

  it('is a real page with NextSteps and no house Stack Lab profile', () => {
    const page = readFileSync(join(here, '../pages/long-context.astro'), 'utf8');
    assert.match(page, /NextSteps/);
    assert.match(page, /HouseRam/);
    assert.doesNotMatch(page, /HOUSE_STACK_LAB|OpenInStackLab/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.doesNotMatch(page, /Qwen2\.5|Qwen3-8B/);
  });
});
