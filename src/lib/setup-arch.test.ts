import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { primaryNav } from './site';
import { isSitemapExcluded, shouldNoindex } from './seo';
import {
  REQUIRED_SETUP_ARCH_HREFS,
  SETUP_ARCH_CITED_LABEL,
  SETUP_ARCH_PUBLISHED,
  SETUP_ARCH_SOURCES,
  SETUP_ARCH_STEPS,
  SETUP_ARCH_TRACKS,
  assertSetupArchValid,
  setupArchBlob,
  setupArchHrefs,
} from './setup-arch';

const here = dirname(fileURLToPath(import.meta.url));

describe('Arch Linux first-run setup', () => {
  it('keeps cited tracks, Vulkan first, and house rules', () => {
    assert.deepEqual(assertSetupArchValid(), []);
    assert.equal(SETUP_ARCH_PUBLISHED, '2026-10-14');
    assert.equal(SETUP_ARCH_CITED_LABEL, 'Cited, not verified on our rig');
    assert.equal(SETUP_ARCH_TRACKS[0]?.id, 'distro');
    assert.equal(SETUP_ARCH_TRACKS[1]?.id, 'amd-repo');
    assert.equal(SETUP_ARCH_TRACKS[1]?.recommend, false);
    assert.ok(SETUP_ARCH_STEPS.length >= 8);
    assert.ok(SETUP_ARCH_SOURCES.every((row) => row.href.startsWith('https://')));
    const blob = setupArchBlob();
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.doesNotMatch(blob, /floor is q4|q4 floor|q4 and up only/i);
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /Vulkan first/);
    assert.match(blob, /not verified on our rig/i);
    assert.match(blob, /Minimum system RAM needed/);
    assert.match(blob, /RAM needed at full context/);
    const hrefs = setupArchHrefs();
    for (const required of REQUIRED_SETUP_ARCH_HREFS) {
      assert.ok(
        hrefs.some((href) => href === required || href.startsWith(`${required}/`)),
        required,
      );
    }
  });

  it('wires the dedicated page and stays in the sitemap', () => {
    const page = readFileSync(join(here, '../pages/setup/arch.astro'), 'utf8');
    const hub = readFileSync(join(here, '../pages/setup.astro'), 'utf8');
    assert.match(page, /not verified on our rig/i);
    assert.match(page, /llama\.cpp/);
    assert.match(page, /Open in Stack Lab/);
    assert.match(page, /NextSteps/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.match(hub, /\/setup\/arch/);
    assert.equal(shouldNoindex('/setup/arch'), false);
    assert.equal(isSitemapExcluded('/setup/arch'), false);
    assert.ok(primaryNav.some((item) => item.href === '/setup/arch'));
  });
});
