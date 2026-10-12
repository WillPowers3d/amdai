import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { DEFAULT_INPUT, MEASURED_ON_OUR_RIG, testedBadge } from './calculator';
import type { StacksGuide } from './status';

describe('calculator tested badges', () => {
  it('labels the daily-driver 256K point with first-party 35B decode', () => {
    const badge = testedBadge(DEFAULT_INPUT);
    assert.equal(badge?.id, 'daily');
    assert.match(badge?.label ?? '', new RegExp(MEASURED_ON_OUR_RIG));
    assert.match(badge?.label ?? '', /~50 tok\/s at 256K/);
    assert.match(badge?.label ?? '', /100\.8/);
    assert.match(badge?.label ?? '', /108\.3 tok\/s \(28\.5 GB VRAM\)/);
  });

  it('labels the 32K and short-context UD-Q5 points', () => {
    const at32k = testedBadge({ ...DEFAULT_INPUT, context: 32768 });
    assert.equal(at32k?.id, 'daily');
    assert.match(at32k?.label ?? '', /~88 tok\/s at 32K/);
    const short = testedBadge({ ...DEFAULT_INPUT, context: 4096 });
    assert.equal(short?.id, 'daily');
    assert.match(short?.label ?? '', /100\.8 tok\/s at short context/);
  });

  it('labels Q4_K_M decode and 32K prefill', () => {
    const badge = testedBadge({ ...DEFAULT_INPUT, quantId: 'q4_k_m', context: 32768 });
    assert.equal(badge?.id, 'q4');
    assert.match(badge?.label ?? '', new RegExp(MEASURED_ON_OUR_RIG));
    assert.match(badge?.label ?? '', /116\.5 tok\/s/);
    assert.match(badge?.label ?? '', /1814 tok\/s at 32K/);
  });

  it('does not badge a split or a non-R9700 card', () => {
    assert.equal(testedBadge({ ...DEFAULT_INPUT, split: true }), null);
    assert.equal(testedBadge({ ...DEFAULT_INPUT, gpuId: 'rx7900xtx', vramGb: 24 }), null);
  });
});

describe('stacks first-party 35B benches', () => {
  const file = parse(readFileSync(new URL('../data/stacks.yaml', import.meta.url), 'utf8')) as StacksGuide;

  it('labels every 35B row Measured on our rig, 2026-10 and uses GB', () => {
    assert.equal(file.qwen36_measured.label, MEASURED_ON_OUR_RIG);
    const quants = file.qwen36_measured.rows.map((row) => row.quant);
    assert.deepEqual(quants, ['UD-Q5_K_XL', 'Q5_K_M', 'Q4_K_M']);
    const ud = file.qwen36_measured.rows[0];
    assert.equal(ud.decode_short, '100.8 tok/s');
    assert.equal(ud.decode_32k, '~88 tok/s');
    assert.equal(ud.decode_256k, '~50 tok/s');
    const q5 = file.qwen36_measured.rows[1];
    assert.equal(q5.decode_short, '108.3 tok/s');
    assert.equal(q5.vram_gb, '28.5 GB');
    const q4 = file.qwen36_measured.rows[2];
    assert.equal(q4.decode_short, '116.5 tok/s');
    assert.equal(q4.prefill_32k, '1814 tok/s');
    const measured = file.stacks.find((stack) => stack.id === 'daily-driver')?.measured.join('\n') ?? '';
    assert.match(measured, /Measured on our rig, 2026-10/);
    assert.match(measured, /28\.5 GB/);
    assert.doesNotMatch(measured, /28\.5 GiB/);
  });
});
