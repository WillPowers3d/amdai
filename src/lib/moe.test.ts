import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { runs } from './run-card-data';
import {
  COMPARE_Q3,
  FLASH_OFFLOAD_KITS,
  MOE_CITED_LABEL,
  MOE_DESCRIPTION,
  MOE_FIT_STORIES,
  MOE_PUBLISHED,
  MOE_QUANT_ROWS,
  MOE_SPEED_LABEL,
  MOE_TITLE,
  MOE_UNMEASURED,
  assertMoeValid,
  moeBlob,
  moeDailyRamNeed,
  moeFlashRamNeed,
  moeHrefs,
  moeMeasuredRows,
} from './moe';

const here = dirname(fileURLToPath(import.meta.url));

describe('MoE shopper hub', () => {
  it('stays cited, llama.cpp-first, and invents no tok/s', () => {
    assert.deepEqual(assertMoeValid(runs), []);
    assert.equal(MOE_TITLE, 'Mixture-of-Experts on a Radeon GPU');
    assert.equal(MOE_CITED_LABEL, 'Cited model cards · measured 35B cells only');
    assert.equal(MOE_UNMEASURED, 'not measured yet');
    assert.equal(MOE_SPEED_LABEL, 'not yet measured by AMDai');
    assert.equal(MOE_PUBLISHED, '2026-10-14');
    assert.ok(MOE_DESCRIPTION.length >= 70);
    assert.ok(MOE_DESCRIPTION.length <= 160);
    const blob = moeBlob();
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /35B total \/ 3B active/);
    assert.match(blob, /125B total \/ 6B active/);
    assert.match(blob, /26\.6 GB/);
    assert.match(blob, /16\.8 GB/);
    assert.match(blob, /169 GB/);
    assert.match(blob, /labeled estimate/);
    assert.match(blob, /not yet measured by AMDai/);
    assert.ok(blob.includes(RAM_MIN_LABEL));
    assert.ok(blob.includes(RAM_FULL_LABEL));
    assert.deepEqual([...FLASH_OFFLOAD_KITS], [128, 192, 256]);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /TODO|TBD|FIXME|coming soon/i);
    assert.doesNotMatch(blob, /\$\d|\bMSRP\b/);
    assert.doesNotMatch(blob, /floor is q4|q4 floor|q4 and up only/i);
    assert.doesNotMatch(blob, /\b\d+(?:\.\d+)?\s*tok\/s\b/i);
    const hrefs = moeHrefs();
    for (const href of [
      '/flash-ram-offload',
      '/gpus/r9700',
      '/qwen',
      '/models',
      '/glossary#moe',
      '/glossary#expert-offload',
      '/multi-gpu',
      '/setup/multi-gpu',
      '/tuning',
      '/can-run',
      '/compare/models',
      '/benchmarks',
    ]) {
      assert.ok(hrefs.includes(href), href);
    }
    assert.ok(MOE_FIT_STORIES.some((row) => row.id === '35b-a3b' && !row.offload));
    assert.ok(MOE_FIT_STORIES.filter((row) => row.offload).every((row) => row.fit.includes(RAM_MIN_LABEL) && row.fit.includes(RAM_FULL_LABEL)));
    assert.ok(MOE_QUANT_ROWS.some((row) => row.quant === COMPARE_Q3 && row.kind === 'q3-estimate'));
    assert.ok(moeDailyRamNeed());
    assert.ok(moeFlashRamNeed());
    const measured = moeMeasuredRows(runs);
    assert.equal(measured.length, 5);
    assert.equal(measured.find((row) => row.kind === 'q3-estimate')?.decode4k, MOE_UNMEASURED);
    assert.match(measured.find((row) => row.quant === 'UD-Q5_K_XL')?.decode4k ?? '', /tok\/s/);
  });

  it('is a real page with NextSteps and allowlisted Stack Lab only', () => {
    const page = readFileSync(join(here, '../pages/moe.astro'), 'utf8');
    assert.match(page, /NextSteps/);
    assert.match(page, /HOUSE_STACK_LAB\.daily/);
    assert.match(page, /HOUSE_STACK_LAB\.flash/);
    assert.match(page, /HOUSE_STACK_LAB\.doctor/);
    assert.match(page, /OpenInStackLab/);
    assert.match(page, /SystemRamNeed/);
    assert.match(page, /RAM_MIN_LABEL/);
    assert.match(page, /RAM_FULL_LABEL/);
    assert.match(page, /Mixture-of-Experts/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.doesNotMatch(page, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(page, /HOUSE_STACK_LAB\.moe/);
    assert.match(page, /no allowlisted Stack Lab MoE expert-offload A\/B/);
  });
});
