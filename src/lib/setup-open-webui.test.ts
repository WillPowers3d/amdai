import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { primaryNav } from './site';
import { isSitemapExcluded, shouldNoindex } from './seo';
import { COMPARE_Q3 } from './local-desktop-compare';
import {
  REQUIRED_SETUP_OPEN_WEBUI_HREFS,
  SETUP_OPEN_WEBUI_CITED_LABEL,
  SETUP_OPEN_WEBUI_HOUSE_FILE,
  SETUP_OPEN_WEBUI_LLAMA,
  SETUP_OPEN_WEBUI_PUBLISHED,
  SETUP_OPEN_WEBUI_QUANTS,
  SETUP_OPEN_WEBUI_STEPS,
  SETUP_OPEN_WEBUI_TRACKS,
  assertSetupOpenWebuiValid,
  setupOpenWebuiBlob,
  setupOpenWebuiHrefs,
} from './setup-open-webui';

const here = dirname(fileURLToPath(import.meta.url));

describe('Open WebUI Radeon setup', () => {
  it('keeps llama.cpp first, cited install, and house rules', () => {
    assert.deepEqual(assertSetupOpenWebuiValid(), []);
    assert.equal(SETUP_OPEN_WEBUI_PUBLISHED, '2026-10-14');
    assert.equal(SETUP_OPEN_WEBUI_CITED_LABEL, 'Cited, not measured on local-desktop');
    assert.equal(SETUP_OPEN_WEBUI_TRACKS[0]?.id, 'llamacpp');
    assert.equal(SETUP_OPEN_WEBUI_TRACKS[1]?.recommend, false);
    assert.equal(SETUP_OPEN_WEBUI_HOUSE_FILE, 'Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf');
    assert.equal(SETUP_OPEN_WEBUI_LLAMA, 'http://127.0.0.1:8080/v1');
    assert.ok(SETUP_OPEN_WEBUI_STEPS.length >= 7);
    assert.equal(SETUP_OPEN_WEBUI_QUANTS.find((row) => row.quant === COMPARE_Q3)?.estimate, true);
    const blob = setupOpenWebuiBlob();
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /Minimum system RAM needed/);
    assert.match(blob, /RAM needed at full context/);
    assert.match(blob, /102\.39/);
    assert.match(blob, /not inside Open WebUI/i);
    assert.match(blob, /NVMe/);
    assert.match(blob, /\/mnt\/bulk/);
    const hrefs = setupOpenWebuiHrefs();
    for (const required of REQUIRED_SETUP_OPEN_WEBUI_HREFS) {
      assert.ok(
        hrefs.some((href) => href === required || href.startsWith(`${required}/`)),
        required,
      );
    }
  });

  it('wires the dedicated page and stays in the sitemap', () => {
    const page = readFileSync(join(here, '../pages/setup/open-webui.astro'), 'utf8');
    const hub = readFileSync(join(here, '../pages/setup.astro'), 'utf8');
    assert.match(page, /llama\.cpp/);
    assert.match(page, /Open WebUI/);
    assert.match(page, /NextSteps/);
    assert.match(page, /Open in Stack Lab/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.doesNotMatch(page, /Qwen2\.5|Qwen3-8B/);
    assert.match(hub, /\/setup\/open-webui/);
    assert.equal(shouldNoindex('/setup/open-webui'), false);
    assert.equal(isSitemapExcluded('/setup/open-webui'), false);
    assert.ok(primaryNav.some((item) => item.href === '/setup/open-webui'));
  });
});
