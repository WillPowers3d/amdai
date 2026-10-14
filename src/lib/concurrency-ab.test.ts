import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { primaryNav } from './site';
import { isSitemapExcluded, shouldNoindex } from './seo';
import {
  NP_CITED_LABEL,
  NP_DESCRIPTION,
  NP_HOUSE_FILE,
  NP_ONE,
  NP_PACK,
  NP_PATH,
  NP_PUBLISHED,
  NP_QUANTS,
  NP_SHARED,
  NP_SOURCES,
  NP_STEPS,
  NP_TITLE,
  NP_UNMEASURED,
  REQUIRED_NP_HREFS,
  assertNpValid,
  npBlob,
  npHrefs,
} from './concurrency-ab';

const here = dirname(fileURLToPath(import.meta.url));

describe('Parallel slots (-np) on Radeon', () => {
  it('keeps cited -np flags, Stack Lab pack, and house rules', () => {
    assert.deepEqual(assertNpValid(), []);
    assert.equal(NP_PATH, '/concurrency-ab');
    assert.equal(NP_PUBLISHED, '2026-10-14');
    assert.equal(NP_TITLE, 'Parallel slots (-np) on Radeon');
    assert.ok(NP_DESCRIPTION.length >= 70);
    assert.ok(NP_DESCRIPTION.length <= 160);
    assert.equal(NP_CITED_LABEL, 'Cited llama.cpp --parallel · slots not measured on local-desktop');
    assert.equal(NP_PACK, 'concurrency-ab/1');
    assert.match(NP_UNMEASURED, /concurrency-ab\/1/);
    assert.ok(NP_STEPS.length >= 6);
    assert.ok(NP_SOURCES.every((row) => row.href.startsWith('https://')));
    assert.match(NP_ONE, /-np 1/);
    assert.match(NP_SHARED, /--kv-unified-per-slot/);
    assert.match(NP_ONE, new RegExp(NP_HOUSE_FILE.replace(/\./g, '\\.')));
    assert.ok(NP_QUANTS.some((row) => row.quant === 'UD-Q3_K_XL' && row.estimate));
    const blob = npBlob();
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /AMDai/);
    assert.match(blob, /--parallel/);
    assert.match(blob, /ab-concurrency/);
    assert.match(blob, /Minimum system RAM needed/);
    assert.match(blob, /RAM needed at full context/);
    assert.match(blob, /not measured/);
    assert.match(blob, /TTFT/);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.doesNotMatch(blob, /amdai-stack-lab:(?:\/\/)?concurrency-ab/);
    const hrefs = npHrefs();
    for (const required of REQUIRED_NP_HREFS) {
      assert.ok(hrefs.includes(required), required);
    }
  });

  it('wires the dedicated page and stays in the sitemap', () => {
    const page = readFileSync(join(here, '../pages/concurrency-ab.astro'), 'utf8');
    assert.match(page, /NP_LEAD/);
    assert.match(page, /llama\.cpp/);
    assert.match(page, /Open in Stack Lab/);
    assert.match(page, /NextSteps/);
    assert.match(page, /HouseRam/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.doesNotMatch(page, /amdai-stack-lab:concurrency-ab/);
    assert.equal(shouldNoindex('/concurrency-ab'), false);
    assert.equal(isSitemapExcluded('/concurrency-ab'), false);
    assert.ok(primaryNav.some((item) => item.href === '/concurrency-ab'));
  });
});
