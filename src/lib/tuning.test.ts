import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { runs } from './run-card-data';
import { isSitemapExcluded, shouldNoindex } from './seo';
import { primaryNav } from './site';
import {
  COMPARE_Q3,
  REQUIRED_TUNING_HREFS,
  TUNING_DESCRIPTION,
  TUNING_TITLE,
  TUNING_UNMEASURED,
  assertTuningValid,
  tuningBlob,
  tuningHrefs,
  tuningMeasuredRows,
} from './tuning';

const here = dirname(fileURLToPath(import.meta.url));

describe('llama.cpp tuning guide', () => {
  it('stays cited, reuses existing pages, and invents no speeds in lib copy', () => {
    assert.deepEqual(assertTuningValid(runs), []);
    assert.equal(TUNING_TITLE, 'Speed up llama.cpp on Radeon');
    assert.ok(TUNING_DESCRIPTION.length >= 70);
    assert.ok(TUNING_DESCRIPTION.length <= 160);
    const blob = tuningBlob();
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /llama-server/);
    assert.match(blob, /-ngl/);
    assert.match(blob, /--threads-batch/);
    assert.match(blob, /-fa 1/);
    assert.match(blob, /--split-mode layer/);
    assert.match(blob, /Q6_K/);
    assert.match(blob, /Q5_K_M/);
    assert.match(blob, /Q4_K_M/);
    assert.match(blob, new RegExp(COMPARE_Q3));
    assert.match(blob, /labeled estimate/);
    assert.ok(blob.includes(RAM_MIN_LABEL));
    assert.ok(blob.includes(RAM_FULL_LABEL));
    assert.ok(blob.includes(TUNING_UNMEASURED));
    assert.match(blob, /\/long-context/);
    assert.match(blob, /\/multi-gpu/);
    assert.match(blob, /\/power/);
    assert.match(blob, /\/flash-ram-offload/);
    assert.match(blob, /\/backends/);
    assert.match(blob, /\/rocm\/vulkan-hip/);
    assert.match(blob, /\/stack-lab/);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /TODO|TBD|FIXME|coming soon/i);
    assert.doesNotMatch(blob, /\$\d|\bMSRP\b/);
    assert.doesNotMatch(blob, /\b\d+(?:\.\d+)?\s*tok\/s\b/i);
    assert.doesNotMatch(blob, /floor is q4|q4 floor|q4 and up only/i);
    const hrefs = tuningHrefs();
    for (const required of REQUIRED_TUNING_HREFS) {
      assert.ok(hrefs.some((href) => href === required || href.startsWith(`${required}/`)), required);
    }
    const rows = tuningMeasuredRows(runs);
    assert.equal(rows.length, 5);
    const q5 = rows.find((row) => row.quant === 'UD-Q5_K_XL');
    assert.match(q5?.decode4k ?? '', /tok\/s/);
    assert.ok(q5?.runIds.length);
    const q3 = rows.find((row) => row.quant === COMPARE_Q3);
    assert.equal(q3?.decode4k, TUNING_UNMEASURED);
    assert.match(q3?.note ?? '', /estimate/i);
  });

  it('wires the dedicated page and stays in the sitemap', () => {
    const page = readFileSync(join(here, '../pages/tuning.astro'), 'utf8');
    const start = readFileSync(join(here, '../pages/start.astro'), 'utf8');
    const faq = readFileSync(join(here, './faq.ts'), 'utf8');
    assert.match(page, /NextSteps/);
    assert.match(page, /HowWeTest/);
    assert.match(page, /OpenInStackLab/);
    assert.match(page, /HOUSE_STACK_LAB\.doctor/);
    assert.match(page, /HOUSE_STACK_LAB\.planner/);
    assert.match(page, /tuningMeasuredRows/);
    assert.match(page, /SystemRamNeed/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.doesNotMatch(page, /Qwen2\.5|Qwen3-8B/);
    assert.match(start, /\/tuning/);
    assert.match(faq, /\/tuning/);
    assert.equal(shouldNoindex('/tuning'), false);
    assert.equal(isSitemapExcluded('/tuning'), false);
    assert.ok(primaryNav.some((item) => item.href === '/tuning'));
  });
});
