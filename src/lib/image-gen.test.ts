import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  IMAGE_GEN_CITED_LABEL,
  IMAGE_GEN_DESCRIPTION,
  IMAGE_GEN_FIT_ROWS,
  IMAGE_GEN_SPEED_LABEL,
  IMAGE_GEN_TITLE,
  assertImageGenValid,
  imageGenBlob,
  imageGenHrefs,
} from './image-gen';

const here = dirname(fileURLToPath(import.meta.url));

describe('local image-gen guide', () => {
  it('stays cited, ComfyUI-first, and invents no speeds', () => {
    assert.deepEqual(assertImageGenValid(), []);
    assert.equal(IMAGE_GEN_TITLE, 'Local image gen on Radeon');
    assert.equal(IMAGE_GEN_CITED_LABEL, 'Cited, not measured on local-desktop');
    assert.equal(IMAGE_GEN_SPEED_LABEL, 'not yet measured by AMDai');
    assert.ok(IMAGE_GEN_DESCRIPTION.length >= 70);
    assert.ok(IMAGE_GEN_DESCRIPTION.length <= 160);
    const blob = imageGenBlob();
    assert.match(blob, /ComfyUI/);
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /not yet measured by AMDai/);
    assert.match(blob, /estimate/i);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /TODO|TBD|FIXME|coming soon/i);
    assert.doesNotMatch(blob, /\$\d|\bMSRP\b/);
    const hrefs = imageGenHrefs();
    for (const href of ['/gpus/r9700', '/gpus/strix-halo', '/harnesses/image', '/multi-gpu', '/calculator', '/stack-lab']) {
      assert.ok(hrefs.includes(href), href);
    }
    assert.ok(IMAGE_GEN_FIT_ROWS.every((row) => row.speed === IMAGE_GEN_SPEED_LABEL));
  });

  it('is a real page wired from harnesses, not a house Stack Lab profile', () => {
    const page = readFileSync(join(here, '../pages/image-gen.astro'), 'utf8');
    const harness = readFileSync(join(here, '../pages/harnesses/image.astro'), 'utf8');
    assert.match(page, /NextSteps/);
    assert.match(page, /href="\/stack-lab"/);
    assert.doesNotMatch(page, /HOUSE_STACK_LAB|OpenInStackLab/);
    assert.match(harness, /\/image-gen/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.doesNotMatch(page, /Qwen2\.5|Qwen3-8B/);
  });
});
