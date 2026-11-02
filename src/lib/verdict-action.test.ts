import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PII_TEXT } from './pii-denylist';
import {
  VERDICT_ACTION_SRC,
  VERDICT_ACTION_SRC_2X,
  assertVerdictActionValid,
  offloadModel,
  verdictAction,
} from './verdict-action';

const here = dirname(fileURLToPath(import.meta.url));

describe('calculator verdict action', () => {
  it('maps fits/tight to a setup step and overflow to a named buy', () => {
    assert.deepEqual(assertVerdictActionValid(), []);
    assert.equal(VERDICT_ACTION_SRC, 'calc-verdict');
    assert.equal(VERDICT_ACTION_SRC_2X, 'calc-verdict-2x');
    assert.equal(offloadModel('flash'), true);
    assert.equal(offloadModel('glm-53-flash'), true);
    assert.equal(offloadModel('qwen36'), false);
    const gpu = verdictAction({ fits: 'no', gpuVramGiB: 16, gpuCount: 1, totalGiB: 30.7 });
    assert.equal(gpu.kind, 'gpu');
    assert.match(gpu.link ?? '', /\/go\/newegg\/r9700\?src=calc-verdict$/);
    assert.match(gpu.buttonLabel ?? '', /Radeon AI PRO R9700/);
    assert.doesNotMatch(gpu.text, /\$\d|hurry|buy now/i);
  });

  it('keeps Flash offload RAM-aware at the house Q4 default', () => {
    const ram = verdictAction({
      fits: 'no',
      gpuVramGiB: 32,
      gpuCount: 2,
      totalGiB: 122,
      offloadOk: true,
      ramGiB: 32,
    });
    assert.equal(ram.kind, 'ram');
    assert.equal(ram.kitGB, 96);
    assert.match(ram.text, /96 GB/);
    assert.doesNotMatch(ram.text, /\bQ[123]\b/);
  });

  it('wires the box on the calculator page', () => {
    const page = readFileSync(join(here, '../pages/calculator.astro'), 'utf8');
    assert.match(page, /id="calc-form"/);
    assert.match(page, /id="calc-verdict-action"/);
    assert.match(page, /Complete the build/);
    assert.match(page, /verdictAction/);
    assert.match(page, /offloadModel/);
    assert.doesNotMatch(page, PII_TEXT);
  });
});
