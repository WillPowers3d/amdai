import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { primaryNav } from './site';
import { isSitemapExcluded, shouldNoindex } from './seo';
import { COMPARE_Q3 } from './local-desktop-compare';
import {
  REQUIRED_SETUP_WSL_HREFS,
  SETUP_WSL_CITED_LABEL,
  SETUP_WSL_HOUSE_FILE,
  SETUP_WSL_PUBLISHED,
  SETUP_WSL_QUANTS,
  SETUP_WSL_STEPS,
  SETUP_WSL_TRACKS,
  assertSetupWslValid,
  setupWslBlob,
  setupWslHrefs,
} from './setup-wsl';

const here = dirname(fileURLToPath(import.meta.url));

describe('WSL2 Radeon setup', () => {
  it('keeps native Linux first, preview WSL, and house rules', () => {
    assert.deepEqual(assertSetupWslValid(), []);
    assert.equal(SETUP_WSL_PUBLISHED, '2026-10-14');
    assert.equal(SETUP_WSL_CITED_LABEL, 'Cited, not measured on the local desktop');
    assert.equal(SETUP_WSL_TRACKS[0]?.id, 'linux');
    assert.equal(SETUP_WSL_TRACKS[0]?.recommend, true);
    assert.equal(SETUP_WSL_TRACKS[1]?.id, 'windows');
    assert.equal(SETUP_WSL_TRACKS[1]?.recommend, false);
    assert.equal(SETUP_WSL_TRACKS[2]?.id, 'wsl');
    assert.equal(SETUP_WSL_TRACKS[2]?.recommend, false);
    assert.equal(SETUP_WSL_HOUSE_FILE, 'Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf');
    assert.ok(SETUP_WSL_STEPS.length >= 8);
    assert.equal(SETUP_WSL_QUANTS.find((row) => row.quant === COMPARE_Q3)?.estimate, true);
    const blob = setupWslBlob();
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /GGML_HIP=ON/);
    assert.match(blob, /technical preview/i);
    assert.match(blob, /\/dev\/kfd/);
    assert.match(blob, /\/dev\/dxg/);
    assert.match(blob, /\.wslconfig/);
    assert.match(blob, /Minimum system RAM needed/);
    assert.match(blob, /RAM needed at full context/);
    assert.match(blob, /102\.39/);
    assert.match(blob, /not inside WSL/i);
    assert.match(blob, /26\.10\.41\.05/);
    const hrefs = setupWslHrefs();
    for (const required of REQUIRED_SETUP_WSL_HREFS) {
      assert.ok(
        hrefs.some((href) => href === required || href.startsWith(`${required}/`)),
        required,
      );
    }
  });

  it('wires the dedicated page and stays in the sitemap', () => {
    const page = readFileSync(join(here, '../pages/setup/wsl.astro'), 'utf8');
    const hub = readFileSync(join(here, '../pages/setup.astro'), 'utf8');
    assert.match(page, /llama\.cpp/);
    assert.match(page, /WSL2/);
    assert.match(page, /NextSteps/);
    assert.match(page, /Open in Stack Lab/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.doesNotMatch(page, /Qwen2\.5|Qwen3-8B/);
    assert.match(hub, /\/setup\/wsl/);
    assert.equal(shouldNoindex('/setup/wsl'), false);
    assert.equal(isSitemapExcluded('/setup/wsl'), false);
    assert.ok(primaryNav.some((item) => item.href === '/setup/wsl'));
  });
});
