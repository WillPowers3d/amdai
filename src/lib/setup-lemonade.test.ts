import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { primaryNav } from './site';
import { isSitemapExcluded, shouldNoindex } from './seo';
import { COMPARE_Q3 } from './local-desktop-compare';
import {
  REQUIRED_SETUP_LEMONADE_HREFS,
  SETUP_LEMONADE_CITED_LABEL,
  SETUP_LEMONADE_HOUSE_FILE,
  SETUP_LEMONADE_PUBLISHED,
  SETUP_LEMONADE_PULL_Q5,
  SETUP_LEMONADE_QUANTS,
  SETUP_LEMONADE_RELEASE,
  SETUP_LEMONADE_STEPS,
  SETUP_LEMONADE_TITLE,
  SETUP_LEMONADE_TRACKS,
  SETUP_LEMONADE_V1,
  assertSetupLemonadeValid,
  setupLemonadeBlob,
  setupLemonadeHrefs,
} from './setup-lemonade';

const here = dirname(fileURLToPath(import.meta.url));

describe('Lemonade Server Radeon setup', () => {
  it('keeps llama.cpp first, cited install, and house rules', () => {
    assert.deepEqual(assertSetupLemonadeValid(), []);
    assert.equal(SETUP_LEMONADE_PUBLISHED, '2026-10-14');
    assert.equal(SETUP_LEMONADE_CITED_LABEL, 'Cited, not measured on local-desktop');
    assert.equal(SETUP_LEMONADE_TITLE, 'Lemonade Server on a Radeon GPU');
    assert.equal(SETUP_LEMONADE_TRACKS[0]?.id, 'llamacpp');
    assert.equal(SETUP_LEMONADE_TRACKS[1]?.recommend, false);
    assert.equal(SETUP_LEMONADE_HOUSE_FILE, 'Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf');
    assert.equal(SETUP_LEMONADE_PULL_Q5, 'unsloth/Qwen3.6-35B-A3B-GGUF:UD-Q5_K_XL');
    assert.equal(SETUP_LEMONADE_V1, 'http://127.0.0.1:13305/api/v1');
    assert.equal(SETUP_LEMONADE_RELEASE, 'v2026.41.1');
    assert.ok(SETUP_LEMONADE_STEPS.length >= 8);
    assert.equal(SETUP_LEMONADE_QUANTS.find((row) => row.quant === COMPARE_Q3)?.estimate, true);
    const blob = setupLemonadeBlob();
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.doesNotMatch(blob, /floor is q4|q4 floor|q4 and up only/i);
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /Minimum system RAM needed/);
    assert.match(blob, /RAM needed at full context/);
    assert.match(blob, /102\.39/);
    assert.match(blob, /not inside Lemonade/i);
    assert.match(blob, /NVMe/);
    assert.match(blob, /llamacpp:vulkan/);
    assert.match(blob, /gfx120X/);
    const hrefs = setupLemonadeHrefs();
    for (const required of REQUIRED_SETUP_LEMONADE_HREFS) {
      assert.ok(
        hrefs.some((href) => href === required || href.startsWith(`${required}/`)),
        required,
      );
    }
  });

  it('wires the dedicated page and stays in the sitemap', () => {
    const page = readFileSync(join(here, '../pages/setup/lemonade.astro'), 'utf8');
    const hub = readFileSync(join(here, '../pages/setup.astro'), 'utf8');
    assert.match(page, /llama\.cpp/);
    assert.match(page, /SETUP_LEMONADE_TITLE/);
    assert.match(page, /NextSteps/);
    assert.match(page, /Open in Stack Lab/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.doesNotMatch(page, /Qwen2\.5|Qwen3-8B/);
    assert.match(hub, /\/setup\/lemonade/);
    assert.equal(shouldNoindex('/setup/lemonade'), false);
    assert.equal(isSitemapExcluded('/setup/lemonade'), false);
    assert.ok(primaryNav.some((item) => item.href === '/setup/lemonade'));
  });
});
