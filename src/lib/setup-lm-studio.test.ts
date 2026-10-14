import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { primaryNav } from './site';
import { isSitemapExcluded, shouldNoindex } from './seo';
import { COMPARE_Q3 } from './local-desktop-compare';
import {
  REQUIRED_SETUP_LM_STUDIO_HREFS,
  SETUP_LM_STUDIO_CITED_LABEL,
  SETUP_LM_STUDIO_HOUSE_FILE,
  SETUP_LM_STUDIO_LOAD,
  SETUP_LM_STUDIO_PUBLISHED,
  SETUP_LM_STUDIO_QUANTS,
  SETUP_LM_STUDIO_SERVER,
  SETUP_LM_STUDIO_SOURCES,
  SETUP_LM_STUDIO_STEPS,
  SETUP_LM_STUDIO_TRACKS,
  assertSetupLmStudioValid,
  setupLmStudioBlob,
  setupLmStudioHrefs,
} from './setup-lm-studio';

const here = dirname(fileURLToPath(import.meta.url));

describe('LM Studio Radeon setup', () => {
  it('keeps cited runtimes, house 35B, and house rules', () => {
    assert.deepEqual(assertSetupLmStudioValid(), []);
    assert.equal(SETUP_LM_STUDIO_PUBLISHED, '2026-10-14');
    assert.equal(SETUP_LM_STUDIO_CITED_LABEL, 'Cited, not measured on local-desktop');
    assert.equal(SETUP_LM_STUDIO_TRACKS[0]?.id, 'vulkan');
    assert.equal(SETUP_LM_STUDIO_TRACKS[1]?.id, 'rocm');
    assert.equal(SETUP_LM_STUDIO_TRACKS[1]?.recommend, false);
    assert.equal(SETUP_LM_STUDIO_HOUSE_FILE, 'Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf');
    assert.equal(SETUP_LM_STUDIO_SERVER, 'http://127.0.0.1:1234/v1');
    assert.match(SETUP_LM_STUDIO_LOAD, /--gpu max/);
    assert.match(SETUP_LM_STUDIO_LOAD, /262144/);
    assert.ok(SETUP_LM_STUDIO_STEPS.length >= 8);
    assert.equal(SETUP_LM_STUDIO_QUANTS.map((row) => row.quant).join(','), `Q6_K,UD-Q5_K_XL,Q4_K_M,${COMPARE_Q3}`);
    assert.equal(SETUP_LM_STUDIO_QUANTS.find((row) => row.quant === COMPARE_Q3)?.estimate, true);
    assert.ok(SETUP_LM_STUDIO_SOURCES.every((row) => row.href.startsWith('https://')));
    const blob = setupLmStudioBlob();
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.doesNotMatch(blob, /floor is q4|q4 floor|q4 and up only/i);
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /not measured on local-desktop/i);
    assert.match(blob, /not inside LM Studio/);
    assert.match(blob, /Minimum system RAM needed/);
    assert.match(blob, /RAM needed at full context/);
    assert.match(blob, /AppImage/);
    assert.match(blob, /libfuse2/);
    assert.match(blob, /When to move to plain llama\.cpp/);
    assert.match(blob, /102\.39/);
    const hrefs = setupLmStudioHrefs();
    for (const required of REQUIRED_SETUP_LM_STUDIO_HREFS) {
      assert.ok(
        hrefs.some((href) => href === required || href.startsWith(`${required}/`)),
        required,
      );
    }
  });

  it('wires the dedicated page and stays in the sitemap', () => {
    const page = readFileSync(join(here, '../pages/setup/lm-studio.astro'), 'utf8');
    const hub = readFileSync(join(here, '../pages/setup.astro'), 'utf8');
    assert.match(page, /not measured on local-desktop/i);
    assert.match(page, /llama\.cpp/);
    assert.match(page, /not inside LM Studio/);
    assert.match(page, /Open in Stack Lab/);
    assert.match(page, /NextSteps/);
    assert.match(page, /SETUP_LM_STUDIO_QUANTS/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.doesNotMatch(page, /Qwen2\.5|Qwen3-8B/);
    assert.match(hub, /\/setup\/lm-studio/);
    assert.equal(shouldNoindex('/setup/lm-studio'), false);
    assert.equal(isSitemapExcluded('/setup/lm-studio'), false);
    assert.ok(primaryNav.some((item) => item.href === '/setup/lm-studio'));
  });
});
