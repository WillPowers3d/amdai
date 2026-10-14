import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { primaryNav } from './site';
import { isSitemapExcluded, shouldNoindex } from './seo';
import {
  CX_BENCH_ID,
  CX_CITED_LABEL,
  CX_DESCRIPTION,
  CX_H1,
  CX_HOUSE,
  CX_HOUSE_FILE,
  CX_HOUSE_SERVER_FLAGS,
  CX_LEAN,
  CX_PACK,
  CX_PATH,
  CX_PUBLISHED,
  CX_QUANTS,
  CX_RUN_IT,
  CX_SOURCES,
  CX_STEPS,
  CX_TITLE,
  CX_UI,
  CX_UNMEASURED,
  REQUIRED_CX_HREFS,
  assertCxValid,
  cxBlob,
  cxHrefs,
} from './context-ceiling';

const here = dirname(fileURLToPath(import.meta.url));

describe('context ceiling on Radeon', () => {
  it('keeps cited ctx-ceiling/1, house 262K, and both RAM labels', () => {
    assert.deepEqual(assertCxValid(), []);
    assert.equal(CX_PATH, '/context-ceiling');
    assert.equal(CX_PUBLISHED, '2026-10-14');
    assert.equal(CX_TITLE, 'Biggest context on Radeon');
    assert.ok(CX_DESCRIPTION.length >= 70);
    assert.ok(CX_DESCRIPTION.length <= 160);
    assert.equal(
      CX_CITED_LABEL,
      'Cited Stack Lab ctx-ceiling/1 · house 262K llama-bench · finder not yet ingested',
    );
    assert.equal(CX_PACK, 'ctx-ceiling/1');
    assert.equal(CX_BENCH_ID, 'ab-ctx-ceiling');
    assert.equal(CX_UI, '#ctx-ceiling');
    assert.equal(CX_UNMEASURED, 'not yet measured');
    assert.ok(CX_STEPS.length >= 5);
    assert.ok(CX_SOURCES.every((row) => row.href.startsWith('/') || row.href.startsWith('https://')));
    assert.match(CX_HOUSE, new RegExp(CX_HOUSE_SERVER_FLAGS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(CX_LEAN, /-c 4096/);
    assert.match(CX_RUN_IT, /amdai-bench ab-ctx-ceiling/);
    assert.match(CX_RUN_IT, /amdai-bench\.ts ingest/);
    assert.match(CX_HOUSE, new RegExp(CX_HOUSE_FILE.replace(/\./g, '\\.')));
    assert.ok(CX_QUANTS.some((row) => row.quant === 'UD-Q3_K_XL' && row.estimate));
    assert.ok(CX_QUANTS.every((row) => row.ceiling === CX_UNMEASURED));
    const blob = cxBlob();
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /AMDai/);
    assert.match(blob, /ctx-ceiling\/1/);
    assert.match(blob, /ab-ctx-ceiling/);
    assert.match(blob, /docs\/ctx-ceiling\.md/);
    assert.match(blob, /Minimum system RAM needed/);
    assert.match(blob, /RAM needed at full context/);
    assert.match(blob, /not yet measured/);
    assert.match(blob, /Q4 and up/);
    assert.match(blob, /do not download Q3/i);
    assert.match(blob, /lean/);
    assert.match(blob, /native max/);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.doesNotMatch(blob, /amdai-stack-lab:(?:\/\/)?(?:context-ceiling|max-context|ctx-ceiling)/);
    const hrefs = cxHrefs();
    for (const required of REQUIRED_CX_HREFS) {
      const path = required.split('#')[0] ?? required;
      assert.ok(hrefs.includes(path) || hrefs.includes(required), required);
    }
  });

  it('wires the dedicated page and stays in the sitemap', () => {
    const page = readFileSync(join(here, '../pages/context-ceiling.astro'), 'utf8');
    assert.match(page, /CX_LEAD/);
    assert.match(page, /llama\.cpp/);
    assert.match(page, /Open in Stack Lab/);
    assert.match(page, /Run it yourself/);
    assert.match(page, /NextSteps/);
    assert.match(page, /HouseRam/);
    assert.match(page, /CX_H1/);
    assert.match(page, /Native max vs the real ceiling/);
    assert.equal(CX_H1.includes('Radeon GPU with llama.cpp'), true);
    assert.doesNotMatch(page, /coming soon/i);
    assert.doesNotMatch(page, /amdai-stack-lab:context-ceiling/);
    assert.equal(shouldNoindex('/context-ceiling'), false);
    assert.equal(isSitemapExcluded('/context-ceiling'), false);
    assert.ok(primaryNav.some((item) => item.href === '/context-ceiling'));
  });
});
