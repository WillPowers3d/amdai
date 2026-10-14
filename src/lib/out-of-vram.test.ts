import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { primaryNav } from './site';
import { isSitemapExcluded, shouldNoindex } from './seo';
import {
  OOM_CITED_LABEL,
  OOM_DESCRIPTION,
  OOM_H1,
  OOM_HOUSE_FILE,
  OOM_PATH,
  OOM_PUBLISHED,
  OOM_QUANTS,
  OOM_SERVER,
  OOM_SOURCES,
  OOM_STEPS,
  OOM_SYMPTOMS,
  OOM_TITLE,
  REQUIRED_OOM_HREFS,
  assertOomValid,
  oomBlob,
  oomHrefs,
} from './out-of-vram';

const here = dirname(fileURLToPath(import.meta.url));

describe('Out of VRAM? Fix llama.cpp memory errors', () => {
  it('keeps cited OOM strings, cheapest-first ladder, and house rules', () => {
    assert.deepEqual(assertOomValid(), []);
    assert.equal(OOM_PATH, '/out-of-vram');
    assert.equal(OOM_PUBLISHED, '2026-10-14');
    assert.equal(OOM_TITLE, 'Out of VRAM? Fix llama.cpp memory errors');
    assert.equal(OOM_H1, 'Out of VRAM? Fix llama.cpp memory errors on a Radeon GPU');
    assert.ok(OOM_DESCRIPTION.length >= 70);
    assert.ok(OOM_DESCRIPTION.length <= 160);
    assert.equal(OOM_CITED_LABEL, 'Cited llama.cpp Vulkan / HIP OOM strings · cheapest fix first');
    assert.ok(OOM_STEPS.length >= 9);
    assert.ok(OOM_SYMPTOMS.length >= 8);
    assert.ok(OOM_SOURCES.every((row) => row.href.startsWith('https://')));
    assert.match(OOM_SERVER, /-c 8192/);
    assert.match(OOM_SERVER, /-fa on/);
    assert.match(OOM_SERVER, /q8_0/);
    assert.match(OOM_SERVER, new RegExp(OOM_HOUSE_FILE.replace(/\./g, '\\.')));
    assert.ok(OOM_QUANTS.some((row) => row.quant === 'UD-Q3_K_XL' && row.estimate));
    const blob = oomBlob();
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /AMDai/);
    assert.match(blob, /ErrorOutOfDeviceMemory/);
    assert.match(blob, /vk::Device::allocateMemory/);
    assert.match(blob, /failed to allocate Vulkan0 buffer/);
    assert.match(blob, /failed to allocate ROCm0 buffer/);
    assert.match(blob, /hipErrorOutOfMemory/);
    assert.match(blob, /model requires more system memory/);
    assert.match(blob, /LM Studio/);
    assert.match(blob, /--n-cpu-moe/);
    assert.match(blob, /not recorded/);
    assert.match(blob, /Minimum system RAM needed/);
    assert.match(blob, /RAM needed at full context/);
    assert.match(blob, /rocm-smi/);
    assert.match(blob, /amd-smi/);
    assert.match(blob, /radeontop/);
    assert.match(blob, /Q4 and up/);
    assert.match(blob, /do not download Q3/i);
    assert.match(blob, /cheapest/);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    const hrefs = oomHrefs();
    for (const required of REQUIRED_OOM_HREFS) {
      const path = required.split('#')[0] ?? required;
      assert.ok(hrefs.includes(path) || hrefs.includes(required), required);
    }
  });

  it('wires the dedicated page and stays in the sitemap', () => {
    const page = readFileSync(join(here, '../pages/out-of-vram.astro'), 'utf8');
    assert.match(page, /OOM_LEAD/);
    assert.match(page, /llama\.cpp/);
    assert.match(page, /Open in Stack Lab/);
    assert.match(page, /NextSteps/);
    assert.match(page, /HouseRam/);
    assert.match(page, /OOM_SYMPTOMS/);
    assert.match(page, /OOM_VRAM_CHECK/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.equal(shouldNoindex('/out-of-vram'), false);
    assert.equal(isSitemapExcluded('/out-of-vram'), false);
    assert.ok(primaryNav.some((item) => item.href === '/out-of-vram'));
  });
});
