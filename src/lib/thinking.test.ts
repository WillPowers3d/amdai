import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { primaryNav } from './site';
import { isSitemapExcluded, shouldNoindex } from './seo';
import {
  REQUIRED_THINK_HREFS,
  THINK_CITED_LABEL,
  THINK_DESCRIPTION,
  THINK_HOUSE_FILE,
  THINK_PATH,
  THINK_PUBLISHED,
  THINK_SOURCES,
  THINK_STEPS,
  THINK_TITLE,
  THINK_OFF,
  assertThinkValid,
  thinkBlob,
  thinkHrefs,
} from './thinking';

const here = dirname(fileURLToPath(import.meta.url));

describe('Thinking / reasoning mode on Radeon', () => {
  it('keeps cited flags, Qwen3.6 default, and house rules', () => {
    assert.deepEqual(assertThinkValid(), []);
    assert.equal(THINK_PATH, '/thinking');
    assert.equal(THINK_PUBLISHED, '2026-10-14');
    assert.equal(THINK_TITLE, 'Thinking / reasoning mode on Radeon');
    assert.ok(THINK_DESCRIPTION.length >= 70);
    assert.ok(THINK_DESCRIPTION.length <= 160);
    assert.equal(THINK_CITED_LABEL, 'Cited llama.cpp + Qwen3.6 card · tokens not measured on the local desktop');
    assert.ok(THINK_STEPS.length >= 7);
    assert.ok(THINK_SOURCES.every((row) => row.href.startsWith('https://')));
    assert.match(THINK_OFF, /--reasoning off/);
    assert.match(THINK_OFF, new RegExp(THINK_HOUSE_FILE.replace(/\./g, '\\.')));
    const blob = thinkBlob();
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /AMDai/);
    assert.match(blob, /enable_thinking/);
    assert.match(blob, /Minimum system RAM needed/);
    assert.match(blob, /RAM needed at full context/);
    assert.match(blob, /not measured/);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.doesNotMatch(blob, /floor is q4|q4 floor|q4 and up only/i);
    const hrefs = thinkHrefs();
    for (const required of REQUIRED_THINK_HREFS) {
      assert.ok(hrefs.includes(required), required);
    }
  });

  it('wires the dedicated page and stays in the sitemap', () => {
    const page = readFileSync(join(here, '../pages/thinking.astro'), 'utf8');
    assert.match(page, /THINK_LEAD/);
    assert.match(page, /llama\.cpp/);
    assert.match(page, /Open in Stack Lab/);
    assert.match(page, /NextSteps/);
    assert.match(page, /HouseRam/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.equal(shouldNoindex('/thinking'), false);
    assert.equal(isSitemapExcluded('/thinking'), false);
    assert.ok(primaryNav.some((item) => item.href === '/thinking'));
  });
});
