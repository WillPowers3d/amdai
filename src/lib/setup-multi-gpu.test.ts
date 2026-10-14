import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { primaryNav } from './site';
import { isSitemapExcluded, shouldNoindex } from './seo';
import { COMPARE_Q3 } from './local-desktop-compare';
import {
  REQUIRED_SETUP_MULTI_GPU_HREFS,
  SETUP_MULTI_GPU_CITED_LABEL,
  SETUP_MULTI_GPU_ONE_4K,
  SETUP_MULTI_GPU_PUBLISHED,
  SETUP_MULTI_GPU_QUANTS,
  SETUP_MULTI_GPU_SPLIT_4K,
  SETUP_MULTI_GPU_STEPS,
  SETUP_MULTI_GPU_TRACKS,
  assertSetupMultiGpuValid,
  setupMultiGpuBlob,
  setupMultiGpuHrefs,
} from './setup-multi-gpu';

const here = dirname(fileURLToPath(import.meta.url));

describe('llama.cpp multi-GPU setup', () => {
  it('keeps official flags, two patterns, and house rules', () => {
    assert.deepEqual(assertSetupMultiGpuValid(), []);
    assert.equal(SETUP_MULTI_GPU_PUBLISHED, '2026-10-14');
    assert.equal(SETUP_MULTI_GPU_CITED_LABEL, 'Cited how-to; 35B split measured on local-desktop');
    assert.equal(SETUP_MULTI_GPU_TRACKS[0]?.id, 'split');
    assert.equal(SETUP_MULTI_GPU_TRACKS[1]?.recommend, false);
    assert.ok(SETUP_MULTI_GPU_STEPS.length >= 9);
    assert.equal(SETUP_MULTI_GPU_QUANTS.find((row) => row.quant === COMPARE_Q3)?.estimate, true);
    const blob = setupMultiGpuBlob();
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.doesNotMatch(blob, /\/two-r9700/);
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /--split-mode/);
    assert.match(blob, /--tensor-split/);
    assert.match(blob, /--main-gpu/);
    assert.match(blob, /--device/);
    assert.match(blob, /GGML_VK_VISIBLE_DEVICES/);
    assert.match(blob, /HIP_VISIBLE_DEVICES/);
    assert.match(blob, /ROCR_VISIBLE_DEVICES/);
    assert.match(blob, /Minimum system RAM needed/);
    assert.match(blob, /RAM needed at full context/);
    assert.match(blob, new RegExp(String(SETUP_MULTI_GPU_ONE_4K)));
    assert.match(blob, new RegExp(String(SETUP_MULTI_GPU_SPLIT_4K)));
    assert.match(blob, /amdai-bench/);
    assert.match(blob, /ExecStart=/);
    const hrefs = setupMultiGpuHrefs();
    for (const required of REQUIRED_SETUP_MULTI_GPU_HREFS) {
      assert.ok(
        hrefs.some((href) => href === required || href.startsWith(`${required}/`)),
        required,
      );
    }
  });

  it('wires the dedicated page and stays in the sitemap', () => {
    const page = readFileSync(join(here, '../pages/setup/multi-gpu.astro'), 'utf8');
    const hub = readFileSync(join(here, '../pages/setup.astro'), 'utf8');
    assert.match(page, /llama\.cpp/);
    assert.match(page, /NextSteps/);
    assert.match(page, /Open in Stack Lab/);
    assert.match(page, /\/troubleshoot\/errors/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.doesNotMatch(page, /Qwen2\.5|Qwen3-8B/);
    assert.match(hub, /\/setup\/multi-gpu/);
    assert.equal(shouldNoindex('/setup/multi-gpu'), false);
    assert.equal(isSitemapExcluded('/setup/multi-gpu'), false);
    assert.ok(primaryNav.some((item) => item.href === '/setup/multi-gpu'));
  });
});
