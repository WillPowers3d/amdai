import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { primaryNav } from './site';
import { isSitemapExcluded, shouldNoindex } from './seo';
import { COMPARE_Q3 } from './local-desktop-compare';
import {
  REQUIRED_SETUP_COMFYUI_HREFS,
  SETUP_COMFYUI_CITED_LABEL,
  SETUP_COMFYUI_PUBLISHED,
  SETUP_COMFYUI_QUANTS,
  SETUP_COMFYUI_SPEED_LABEL,
  SETUP_COMFYUI_STEPS,
  SETUP_COMFYUI_TRACKS,
  SETUP_COMFYUI_UI,
  assertSetupComfyuiValid,
  setupComfyuiBlob,
  setupComfyuiHrefs,
} from './setup-comfyui';

const here = dirname(fileURLToPath(import.meta.url));

describe('ComfyUI Radeon setup', () => {
  it('keeps Linux first, cited install, and house rules', () => {
    assert.deepEqual(assertSetupComfyuiValid(), []);
    assert.equal(SETUP_COMFYUI_PUBLISHED, '2026-10-14');
    assert.equal(SETUP_COMFYUI_CITED_LABEL, 'Cited, not measured on local-desktop');
    assert.equal(SETUP_COMFYUI_SPEED_LABEL, 'not yet measured by AMDai');
    assert.equal(SETUP_COMFYUI_TRACKS[0]?.id, 'linux');
    assert.equal(SETUP_COMFYUI_TRACKS[1]?.recommend, false);
    assert.equal(SETUP_COMFYUI_UI, 'http://127.0.0.1:8188');
    assert.ok(SETUP_COMFYUI_STEPS.length >= 9);
    assert.equal(SETUP_COMFYUI_QUANTS.find((row) => row.quant === COMPARE_Q3)?.estimate, true);
    const blob = setupComfyuiBlob();
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /ComfyUI/);
    assert.match(blob, /Minimum system RAM needed/);
    assert.match(blob, /RAM needed at full context/);
    assert.match(blob, /not yet measured by AMDai/);
    assert.match(blob, /does not speak/);
    assert.match(blob, /NVMe/);
    assert.match(blob, /\/mnt\/bulk/);
    const hrefs = setupComfyuiHrefs();
    for (const required of REQUIRED_SETUP_COMFYUI_HREFS) {
      assert.ok(
        hrefs.some((href) => href === required || href.startsWith(`${required}/`)),
        required,
      );
    }
  });

  it('wires the dedicated page and stays in the sitemap', () => {
    const page = readFileSync(join(here, '../pages/setup/comfyui.astro'), 'utf8');
    const hub = readFileSync(join(here, '../pages/setup.astro'), 'utf8');
    assert.match(page, /llama\.cpp/);
    assert.match(page, /ComfyUI/);
    assert.match(page, /NextSteps/);
    assert.match(page, /Open in Stack Lab/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.doesNotMatch(page, /Qwen2\.5|Qwen3-8B/);
    assert.match(hub, /\/setup\/comfyui/);
    assert.equal(shouldNoindex('/setup/comfyui'), false);
    assert.equal(isSitemapExcluded('/setup/comfyui'), false);
    assert.ok(primaryNav.some((item) => item.href === '/setup/comfyui'));
  });
});
