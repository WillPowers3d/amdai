import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { primaryNav } from './site';
import { isSitemapExcluded, shouldNoindex } from './seo';
import {
  FA_AB,
  FA_BENCH,
  FA_CITED_LABEL,
  FA_DESCRIPTION,
  FA_HOUSE_BENCH,
  FA_HOUSE_FILE,
  FA_PATH,
  FA_PREFILL_AB,
  FA_PUBLISHED,
  FA_QUANTS,
  FA_SERVER,
  FA_SOURCES,
  FA_STEPS,
  FA_TITLE,
  FA_UNMEASURED,
  REQUIRED_FA_HREFS,
  assertFaValid,
  faBlob,
  faHrefs,
} from './flash-attention';

const here = dirname(fileURLToPath(import.meta.url));

describe('Flash Attention (-fa) on Radeon', () => {
  it('keeps cited -fa flags, Stack Lab A/Bs, and house rules', () => {
    assert.deepEqual(assertFaValid(), []);
    assert.equal(FA_PATH, '/flash-attention');
    assert.equal(FA_PUBLISHED, '2026-10-14');
    assert.equal(FA_TITLE, 'Flash Attention (-fa) on Radeon');
    assert.ok(FA_DESCRIPTION.length >= 70);
    assert.ok(FA_DESCRIPTION.length <= 160);
    assert.equal(FA_CITED_LABEL, 'Cited llama.cpp --flash-attn · llama-server FA on/off not measured');
    assert.equal(FA_AB, 'Flash Attention A/B');
    assert.equal(FA_PREFILL_AB, 'Prefill tuning A/B');
    assert.match(FA_UNMEASURED, /Flash Attention A\/B/);
    assert.ok(FA_STEPS.length >= 5);
    assert.ok(FA_SOURCES.every((row) => row.href.startsWith('https://')));
    assert.match(FA_BENCH, /-fa 1/);
    assert.match(FA_BENCH, new RegExp(FA_HOUSE_BENCH.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(FA_SERVER, /-fa on/);
    assert.match(FA_SERVER, /262144/);
    assert.match(FA_BENCH, new RegExp(FA_HOUSE_FILE.replace(/\./g, '\\.')));
    assert.ok(FA_QUANTS.some((row) => row.quant === 'UD-Q3_K_XL' && row.estimate));
    const blob = faBlob();
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /AMDai/);
    assert.match(blob, /--flash-attn/);
    assert.match(blob, /on\|off\|auto/);
    assert.match(blob, /Flash Attention A\/B/);
    assert.match(blob, /Prefill tuning A\/B/);
    assert.match(blob, /Minimum system RAM needed/);
    assert.match(blob, /RAM needed at full context/);
    assert.match(blob, /not measured/);
    assert.match(blob, /quantized V cache/);
    assert.match(blob, /Q4 and up/);
    assert.match(blob, /do not download Q3/i);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.doesNotMatch(blob, /amdai-stack-lab:(?:\/\/)?flash-attn/);
    const hrefs = faHrefs();
    for (const required of REQUIRED_FA_HREFS) {
      assert.ok(hrefs.includes(required), required);
    }
  });

  it('wires the dedicated page and stays in the sitemap', () => {
    const page = readFileSync(join(here, '../pages/flash-attention.astro'), 'utf8');
    assert.match(page, /FA_LEAD/);
    assert.match(page, /llama\.cpp/);
    assert.match(page, /Open in Stack Lab/);
    assert.match(page, /NextSteps/);
    assert.match(page, /HouseRam/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.doesNotMatch(page, /amdai-stack-lab:flash-attn/);
    assert.equal(shouldNoindex('/flash-attention'), false);
    assert.equal(isSitemapExcluded('/flash-attention'), false);
    assert.ok(primaryNav.some((item) => item.href === '/flash-attention'));
  });
});
