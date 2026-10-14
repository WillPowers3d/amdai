import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { primaryNav } from './site';
import { isSitemapExcluded, shouldNoindex } from './seo';
import {
  REQUIRED_SETUP_WINDOWS_HREFS,
  SETUP_WINDOWS_CITED_LABEL,
  SETUP_WINDOWS_PUBLISHED,
  SETUP_WINDOWS_SOURCES,
  SETUP_WINDOWS_STEPS,
  SETUP_WINDOWS_TRACKS,
  assertSetupWindowsValid,
  setupWindowsBlob,
  setupWindowsHrefs,
} from './setup-windows';

const here = dirname(fileURLToPath(import.meta.url));

describe('Windows first-run setup', () => {
  it('keeps cited tracks, Vulkan first, and house rules', () => {
    assert.deepEqual(assertSetupWindowsValid(), []);
    assert.equal(SETUP_WINDOWS_PUBLISHED, '2026-10-13');
    assert.equal(SETUP_WINDOWS_CITED_LABEL, 'Cited, not measured on the local desktop');
    assert.equal(SETUP_WINDOWS_TRACKS[0]?.id, 'native');
    assert.equal(SETUP_WINDOWS_TRACKS[1]?.id, 'wsl');
    assert.equal(SETUP_WINDOWS_TRACKS[1]?.recommend, false);
    assert.ok(SETUP_WINDOWS_STEPS.length >= 6);
    assert.ok(SETUP_WINDOWS_SOURCES.every((row) => row.href.startsWith('https://')));
    const blob = setupWindowsBlob();
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.doesNotMatch(blob, /floor is q4|q4 floor|q4 and up only/i);
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /Vulkan first/);
    assert.match(blob, /Minimum system RAM needed/);
    assert.match(blob, /RAM needed at full context/);
    const hrefs = setupWindowsHrefs();
    for (const required of REQUIRED_SETUP_WINDOWS_HREFS) {
      assert.ok(
        hrefs.some((href) => href === required || href.startsWith(`${required}/`)),
        required,
      );
    }
  });

  it('wires the dedicated page and stays in the sitemap', () => {
    const page = readFileSync(join(here, '../pages/setup/windows.astro'), 'utf8');
    const hub = readFileSync(join(here, '../pages/setup.astro'), 'utf8');
    assert.match(page, /Cited, not measured on the local desktop/);
    assert.match(page, /llama\.cpp/);
    assert.match(page, /Open in Stack Lab/);
    assert.match(page, /NextSteps/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.match(hub, /\/setup\/windows/);
    assert.equal(shouldNoindex('/setup/windows'), false);
    assert.equal(isSitemapExcluded('/setup/windows'), false);
    assert.ok(primaryNav.some((item) => item.href === '/setup/windows'));
  });
});
