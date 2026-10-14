import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { isSitemapExcluded, shouldNoindex } from './seo';
import { primaryNav } from './site';
import {
  KV_CACHE_DESCRIPTION,
  KV_CACHE_EMPTY,
  KV_CACHE_TITLE,
  REQUIRED_KV_CACHE_HREFS,
  assertKvCacheValid,
  kvCacheBlob,
  kvCacheHrefs,
  kvContextRows,
  kvFitRows,
} from './kv-cache';

const here = dirname(fileURLToPath(import.meta.url));

describe('KV cache guide', () => {
  it('stays cited, llama.cpp-first, and invents no KV quality or A/B link', () => {
    assert.deepEqual(assertKvCacheValid(), []);
    assert.equal(
      KV_CACHE_TITLE,
      'KV cache on a Radeon GPU: f16 vs q8_0 vs q4_0 and how much VRAM context costs',
    );
    assert.equal(KV_CACHE_EMPTY, 'not measured yet');
    assert.ok(KV_CACHE_DESCRIPTION.length >= 70);
    assert.ok(KV_CACHE_DESCRIPTION.length <= 160);
    const blob = kvCacheBlob();
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /--cache-type-k/);
    assert.match(blob, /--cache-type-v/);
    assert.match(blob, /quantized V cache/);
    assert.match(blob, /--parallel/);
    assert.match(blob, /262144/);
    assert.match(blob, /25\.97/);
    assert.match(blob, /29\.34/);
    assert.match(blob, /q8_0/);
    assert.match(blob, /q4_0/);
    assert.match(blob, /not measured yet/);
    assert.match(blob, /No Stack Lab KV A\/B/);
    assert.ok(blob.includes(RAM_MIN_LABEL));
    assert.ok(blob.includes(RAM_FULL_LABEL));
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /TODO|TBD|FIXME|coming soon/i);
    assert.doesNotMatch(blob, /\$\d|\bMSRP\b/);
    assert.doesNotMatch(blob, /floor is q4|q4 floor|q4 and up only/i);
    assert.doesNotMatch(blob, /\bmeasured q8_0 KV\b|\bq8_0 KV quality is\b/i);
    const hrefs = kvCacheHrefs();
    for (const required of REQUIRED_KV_CACHE_HREFS) {
      assert.ok(hrefs.some((href) => href === required || href.startsWith(`${required}`)), required);
    }
    const rows = kvContextRows();
    assert.equal(rows.length, 4);
    assert.ok(rows.every((row) => row.measured));
    assert.ok(rows.every((row) => row.kvF16.includes('estimate')));
    assert.ok(rows.every((row) => row.kvQ8.includes('estimate')));
    assert.ok(rows.every((row) => row.kvQ4.includes('estimate')));
    const fit = kvFitRows();
    assert.equal(fit.length, 6);
    assert.ok(fit.every((row) => row.q3.estimate));
    assert.match(fit.find((row) => row.id === '32gb')?.q5.text ?? '', /29\.34/);
  });

  it('wires the dedicated page and stays in the sitemap', () => {
    const page = readFileSync(join(here, '../pages/kv-cache.astro'), 'utf8');
    const start = readFileSync(join(here, '../pages/start.astro'), 'utf8');
    const faq = readFileSync(join(here, './faq.ts'), 'utf8');
    assert.match(page, /NextSteps/);
    assert.match(page, /HouseRam/);
    assert.match(page, /SystemRamNeed/);
    assert.match(page, /HowWeTest/);
    assert.doesNotMatch(page, /HOUSE_STACK_LAB|OpenInStackLab/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.doesNotMatch(page, /Qwen2\.5|Qwen3-8B/);
    assert.match(start, /\/kv-cache/);
    assert.match(faq, /\/kv-cache/);
    assert.equal(shouldNoindex('/kv-cache'), false);
    assert.equal(isSitemapExcluded('/kv-cache'), false);
    assert.ok(primaryNav.some((item) => item.href === '/kv-cache'));
  });
});
