import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { primaryNav } from './site';
import { isSitemapExcluded, shouldNoindex } from './seo';
import {
  PP_BENCH,
  PP_CITED_LABEL,
  PP_DESCRIPTION,
  PP_DOCS,
  PP_FLASH,
  PP_HOUSE,
  PP_HOUSE_BENCH,
  PP_HOUSE_FILE,
  PP_HOUSE_SERVER_FLAGS,
  PP_PACK,
  PP_PATH,
  PP_PREFILL_CELLS,
  PP_PUBLISHED,
  PP_QUANTS,
  PP_SOURCES,
  PP_STEPS,
  PP_TITLE,
  PP_UNMEASURED,
  REQUIRED_PP_HREFS,
  assertPpValid,
  ppBlob,
  ppHrefs,
} from './prefill';

const here = dirname(fileURLToPath(import.meta.url));

describe('Faster prompt processing (prefill) on Radeon', () => {
  it('keeps cited -b / -ub flags, Stack Lab pack, and house rules', () => {
    assert.deepEqual(assertPpValid(), []);
    assert.equal(PP_PATH, '/prefill');
    assert.equal(PP_PUBLISHED, '2026-10-14');
    assert.equal(PP_TITLE, 'Faster prompt processing (prefill) on Radeon');
    assert.ok(PP_DESCRIPTION.length >= 70);
    assert.ok(PP_DESCRIPTION.length <= 160);
    assert.equal(
      PP_CITED_LABEL,
      'Cited llama.cpp --batch-size / --ubatch-size · llama-server -b / -ub not measured',
    );
    assert.equal(PP_PACK, 'prefill-ab/1');
    assert.match(PP_UNMEASURED, /amdai-bench ab-prefill/);
    assert.ok(PP_STEPS.length >= 6);
    assert.ok(PP_SOURCES.every((row) => row.href.startsWith('https://')));
    assert.match(PP_HOUSE, new RegExp(PP_HOUSE_SERVER_FLAGS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    const houseFlags = PP_HOUSE.split('\n').filter((line) => !line.startsWith('#')).join('\n');
    assert.doesNotMatch(houseFlags, /-b 2048/);
    assert.doesNotMatch(houseFlags, /-ub 512/);
    assert.match(PP_DOCS, /-b 2048/);
    assert.match(PP_DOCS, /-ub 512/);
    assert.match(PP_BENCH, new RegExp(PP_HOUSE_BENCH.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(PP_FLASH, /--n-cpu-moe not recorded/);
    assert.match(PP_FLASH, /-ot not recorded/);
    assert.match(PP_HOUSE, new RegExp(PP_HOUSE_FILE.replace(/\./g, '\\.')));
    assert.ok(PP_QUANTS.some((row) => row.quant === 'UD-Q3_K_XL' && row.estimate));
    assert.ok(PP_PREFILL_CELLS.some((row) => row.quant === 'UD-Q5_K_XL' && row.at4k === '2761.6'));
    const blob = ppBlob();
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /AMDai/);
    assert.match(blob, /--batch-size/);
    assert.match(blob, /--ubatch-size/);
    assert.match(blob, /ab-prefill/);
    assert.match(blob, /Minimum system RAM needed/);
    assert.match(blob, /RAM needed at full context/);
    assert.match(blob, /not measured yet, run amdai-bench ab-prefill/);
    assert.match(blob, /Q4 and up/);
    assert.match(blob, /do not download Q3/i);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.doesNotMatch(blob, /amdai-stack-lab:(?:\/\/)?prefill/);
    const hrefs = ppHrefs();
    for (const required of REQUIRED_PP_HREFS) {
      assert.ok(hrefs.includes(required), required);
    }
  });

  it('wires the dedicated page and stays in the sitemap', () => {
    const page = readFileSync(join(here, '../pages/prefill.astro'), 'utf8');
    assert.match(page, /PP_LEAD/);
    assert.match(page, /llama\.cpp/);
    assert.match(page, /Open in Stack Lab/);
    assert.match(page, /NextSteps/);
    assert.match(page, /HouseRam/);
    assert.match(page, /batch \(-b\) and micro-batch \(-ub\)/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.doesNotMatch(page, /amdai-stack-lab:prefill/);
    assert.equal(shouldNoindex('/prefill'), false);
    assert.equal(isSitemapExcluded('/prefill'), false);
    assert.ok(primaryNav.some((item) => item.href === '/prefill'));
  });
});
