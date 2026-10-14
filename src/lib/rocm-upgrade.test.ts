import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isSitemapExcluded, shouldNoindex } from './seo';
import { rocmPage, rocmPages } from './rocm-guide';
import {
  ROCM_UPGRADE_DESCRIPTION,
  ROCM_UPGRADE_HEADINGS,
  ROCM_UPGRADE_PATH,
  ROCM_UPGRADE_PUBLISHED,
  ROCM_UPGRADE_SOURCES,
  ROCM_UPGRADE_TITLE,
  assertRocmUpgradeValid,
  rocmUpgradeBlob,
  rocmUpgradeHrefs,
} from './rocm-upgrade';

const here = dirname(fileURLToPath(import.meta.url));

describe('ROCm upgrade guide', () => {
  it('keeps cited upgrade / pin / reinstall copy and house rules', () => {
    assert.deepEqual(assertRocmUpgradeValid(), []);
    assert.equal(ROCM_UPGRADE_PATH, '/rocm/upgrade');
    assert.equal(ROCM_UPGRADE_PUBLISHED, '2026-10-14');
    assert.equal(ROCM_UPGRADE_TITLE, 'Upgrade, pin, or reinstall ROCm');
    assert.ok(ROCM_UPGRADE_DESCRIPTION.length >= 70);
    assert.ok(ROCM_UPGRADE_DESCRIPTION.length <= 160);
    assert.equal(rocmPage('upgrade').href, '/rocm/upgrade');
    assert.ok(rocmPages.some((page) => page.id === 'upgrade'));
    assert.ok(ROCM_UPGRADE_HEADINGS.some((row) => row.slug === 'check'));
    assert.ok(ROCM_UPGRADE_HEADINGS.some((row) => row.slug === 'recovery'));
    assert.ok(ROCM_UPGRADE_SOURCES.some((row) => row.id === 'apt-mark' && !row.official));
    const blob = rocmUpgradeBlob();
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /Vulkan/);
    assert.match(blob, /unofficial/);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.doesNotMatch(blob, /floor is q4|q4 floor|q4 and up only/i);
    assert.doesNotMatch(blob, /\b\d+(?:\.\d+)?\s*tok\/s\b/i);
    const hrefs = rocmUpgradeHrefs();
    assert.ok(hrefs.includes('/compare/vulkan-vs-rocm'));
    assert.ok(hrefs.includes('/setup/fedora'));
    assert.ok(hrefs.includes('/rocm-problems/ubuntu-rocm-package-shadow'));
  });

  it('wires the RocmGuide chapter and stays in the sitemap', () => {
    const page = readFileSync(join(here, '../pages/rocm/upgrade.astro'), 'utf8');
    const guide = readFileSync(join(here, './rocm-guide.ts'), 'utf8');
    assert.match(page, /RocmGuide/);
    assert.match(page, /page="upgrade"/);
    assert.match(page, /ROCM_UPGRADE_LEAD/);
    assert.match(page, /\/compare\/vulkan-vs-rocm/);
    assert.match(page, /\/setup\/fedora/);
    assert.match(page, /\/setup\/arch/);
    assert.match(guide, /id: 'upgrade'/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.equal(shouldNoindex('/rocm/upgrade'), false);
    assert.equal(isSitemapExcluded('/rocm/upgrade'), false);
  });
});
