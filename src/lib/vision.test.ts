import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { isSitemapExcluded, shouldNoindex } from './seo';
import { primaryNav } from './site';
import {
  REQUIRED_VISION_HREFS,
  VISION_CITED_LABEL,
  VISION_DESCRIPTION,
  VISION_FIT_ROWS,
  VISION_SPEED_LABEL,
  VISION_TITLE,
  assertVisionValid,
  visionBlob,
  visionHrefs,
} from './vision';

const here = dirname(fileURLToPath(import.meta.url));

describe('local vision guide', () => {
  it('stays cited, llama.cpp mmproj-first, and invents no speeds', () => {
    assert.deepEqual(assertVisionValid(), []);
    assert.equal(VISION_TITLE, 'Local vision on Radeon');
    assert.equal(VISION_CITED_LABEL, 'Cited, not measured on the local desktop');
    assert.equal(VISION_SPEED_LABEL, 'not yet measured by AMDai');
    assert.ok(VISION_DESCRIPTION.length >= 70);
    assert.ok(VISION_DESCRIPTION.length <= 160);
    const blob = visionBlob();
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /--mmproj/);
    assert.match(blob, /llama-mtmd-cli/);
    assert.match(blob, /llama-server/);
    assert.match(blob, /--no-mmproj-offload/);
    assert.match(blob, /two GGUF/);
    assert.match(blob, /labeled estimate/);
    assert.match(blob, /retired Qwen/);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.ok(blob.includes(RAM_MIN_LABEL));
    assert.ok(blob.includes(RAM_FULL_LABEL));
    assert.ok(blob.includes(VISION_SPEED_LABEL));
    assert.doesNotMatch(blob, /TODO|TBD|FIXME|coming soon/i);
    assert.doesNotMatch(blob, /\$\d|\bMSRP\b/);
    assert.doesNotMatch(blob, /\b\d+(?:\.\d+)?\s*tok\/s\b/i);
    assert.doesNotMatch(blob, /floor is q4|q4 floor|q4 and up only/i);
    assert.ok(VISION_FIT_ROWS.every((row) => row.speed === VISION_SPEED_LABEL));
    const hrefs = visionHrefs();
    for (const required of REQUIRED_VISION_HREFS) {
      assert.ok(hrefs.some((href) => href === required || href.startsWith(`${required}/`)), required);
    }
  });

  it('wires the dedicated page and stays in the sitemap', () => {
    const page = readFileSync(join(here, '../pages/vision.astro'), 'utf8');
    const start = readFileSync(join(here, '../pages/start.astro'), 'utf8');
    assert.match(page, /NextSteps/);
    assert.match(page, /HowWeTest/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.doesNotMatch(page, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(page, /OpenInStackLab/);
    assert.match(start, /\/vision/);
    assert.equal(shouldNoindex('/vision'), false);
    assert.equal(isSitemapExcluded('/vision'), false);
    assert.ok(primaryNav.some((item) => item.href === '/vision'));
  });
});
