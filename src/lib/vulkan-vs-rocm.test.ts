import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { runs } from './run-card-data';
import { isSitemapExcluded, shouldNoindex } from './seo';
import { primaryNav } from './site';
import { compareHubCards } from './local-desktop-compare';
import {
  COMPARE_Q3,
  VULKAN_VS_ROCM_CITED_LABEL,
  VULKAN_VS_ROCM_DESCRIPTION,
  VULKAN_VS_ROCM_PATH,
  VULKAN_VS_ROCM_PENDING,
  VULKAN_VS_ROCM_PUBLISHED,
  VULKAN_VS_ROCM_TITLE,
  VULKAN_VS_ROCM_UNMEASURED,
  assertVulkanVsRocmValid,
  vulkanVsRocmBlob,
  vulkanVsRocmHrefs,
  vulkanVsRocmMeasuredRows,
} from './vulkan-vs-rocm';

const here = dirname(fileURLToPath(import.meta.url));

describe('Vulkan vs ROCm compare page', () => {
  it('stays cited, llama.cpp-first, and keeps HIP pending', () => {
    assert.deepEqual(assertVulkanVsRocmValid(runs), []);
    assert.equal(VULKAN_VS_ROCM_PATH, '/compare/vulkan-vs-rocm');
    assert.equal(VULKAN_VS_ROCM_TITLE, 'llama.cpp on Radeon: Vulkan vs ROCm (HIP)');
    assert.equal(VULKAN_VS_ROCM_CITED_LABEL, 'Cited llama.cpp + AMD docs · measured 35B Vulkan cells only');
    assert.equal(VULKAN_VS_ROCM_PENDING, 'pending — not measured on the local desktop');
    assert.equal(VULKAN_VS_ROCM_PUBLISHED, '2026-10-14');
    assert.ok(VULKAN_VS_ROCM_DESCRIPTION.length >= 70);
    assert.ok(VULKAN_VS_ROCM_DESCRIPTION.length <= 160);
    const blob = vulkanVsRocmBlob();
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /GGML_VULKAN=ON/);
    assert.match(blob, /GGML_HIP=ON/);
    assert.match(blob, /HSA_OVERRIDE_GFX_VERSION/);
    assert.match(blob, /Mesa RADV/);
    assert.match(blob, /pending — not measured on the local desktop/);
    assert.match(blob, /labeled estimate/);
    assert.ok(blob.includes(RAM_MIN_LABEL));
    assert.ok(blob.includes(RAM_FULL_LABEL));
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /TODO|TBD|FIXME|coming soon/i);
    assert.doesNotMatch(blob, /\$\d|\bMSRP\b/);
    assert.doesNotMatch(blob, /floor is q4|q4 floor|q4 and up only/i);
    assert.doesNotMatch(blob, /\b\d+(?:\.\d+)?\s*tok\/s\b/i);
    const hrefs = vulkanVsRocmHrefs();
    for (const href of [
      '/compare',
      '/backends/llamacpp',
      '/rocm',
      '/rocm/vulkan-hip',
      '/setup',
      '/setup/windows',
      '/setup/wsl',
      '/amdai-bench',
      '/stack-lab',
    ]) {
      assert.ok(hrefs.includes(href), href);
    }
    const measured = vulkanVsRocmMeasuredRows(runs);
    assert.equal(measured.length, 5);
    assert.equal(measured.find((row) => row.kind === 'q3-estimate')?.quant, COMPARE_Q3);
    assert.equal(measured.find((row) => row.kind === 'q3-estimate')?.vulkan4k, VULKAN_VS_ROCM_UNMEASURED);
    assert.match(measured.find((row) => row.quant === 'UD-Q5_K_XL')?.vulkan4k ?? '', /tok\/s/);
    assert.ok(measured.filter((row) => row.kind === 'measured').every((row) => row.hip === VULKAN_VS_ROCM_PENDING));
    assert.ok(compareHubCards().some((card) => card.href === VULKAN_VS_ROCM_PATH));
  });

  it('is a real page with NextSteps and allowlisted Stack Lab only', () => {
    const page = readFileSync(join(here, '../pages/compare/vulkan-vs-rocm.astro'), 'utf8');
    assert.match(page, /NextSteps/);
    assert.match(page, /HOUSE_STACK_LAB\.planner/);
    assert.match(page, /HOUSE_STACK_LAB\.daily/);
    assert.match(page, /HOUSE_STACK_LAB\.doctor/);
    assert.match(page, /llama\.cpp on Radeon: Vulkan vs ROCm \(HIP\)/);
    assert.match(page, /VULKAN_VS_ROCM_PENDING/);
    assert.match(page, /RAM_MIN_LABEL/);
    assert.match(page, /RAM_FULL_LABEL/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.doesNotMatch(page, /Qwen2\.5|Qwen3-8B/);
  });

  it('wires the dedicated page and stays in the sitemap', () => {
    assert.equal(shouldNoindex('/compare/vulkan-vs-rocm'), false);
    assert.equal(isSitemapExcluded('/compare/vulkan-vs-rocm'), false);
    assert.ok(primaryNav.some((item) => item.href === '/compare/vulkan-vs-rocm'));
  });
});
