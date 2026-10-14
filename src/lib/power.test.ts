import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { isSitemapExcluded, shouldNoindex } from './seo';
import { primaryNav } from './site';
import {
  POWER_BOARD_ROWS,
  POWER_CITED_LABEL,
  POWER_DESCRIPTION,
  POWER_EMPTY,
  POWER_SEARCH_GUIDANCE,
  POWER_TITLE,
  POWER_UNRECORDED_ROWS,
  REQUIRED_POWER_HREFS,
  assertPowerValid,
  powerBlob,
  powerHrefs,
} from './power';

const here = dirname(fileURLToPath(import.meta.url));

describe('board power and PSU guide', () => {
  it('stays cited, lists TBP per GPU, and invents no dual-card watts', () => {
    assert.deepEqual(assertPowerValid(), []);
    assert.equal(POWER_TITLE, 'Board power and PSU on Radeon');
    assert.equal(POWER_CITED_LABEL, 'Cited, not measured on the local desktop');
    assert.ok(POWER_DESCRIPTION.length >= 70);
    assert.ok(POWER_DESCRIPTION.length <= 160);
    const blob = powerBlob();
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /300 W/);
    assert.match(blob, /750 W/);
    assert.match(blob, /355 W/);
    assert.match(blob, /315 W/);
    assert.match(blob, /263 W/);
    assert.match(blob, /12V-2x6/);
    assert.ok(blob.includes(POWER_EMPTY));
    assert.ok(blob.includes(POWER_SEARCH_GUIDANCE));
    assert.ok(blob.includes(RAM_MIN_LABEL));
    assert.ok(blob.includes(RAM_FULL_LABEL));
    assert.match(blob, /labeled estimate/);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /TODO|TBD|FIXME|coming soon/i);
    assert.doesNotMatch(blob, /\$\d|\bMSRP\b/);
    assert.doesNotMatch(blob, /floor is q4|q4 floor|q4 and up only/i);
    assert.ok(POWER_BOARD_ROWS.some((row) => row.id === 'r9700' && row.tbp === '300 W TBP'));
    assert.ok(POWER_UNRECORDED_ROWS.every((row) => row.tbp === POWER_EMPTY));
    const hrefs = powerHrefs();
    for (const required of REQUIRED_POWER_HREFS) {
      assert.ok(hrefs.some((href) => href === required || href.startsWith(`${required}/`)), required);
    }
  });

  it('wires the dedicated page and stays in the sitemap', () => {
    const page = readFileSync(join(here, '../pages/power.astro'), 'utf8');
    const hardware = readFileSync(join(here, '../content/guides/hardware.mdx'), 'utf8');
    assert.match(page, /NextSteps/);
    assert.match(page, /BuyButtons/);
    assert.match(page, /psu-1000w/);
    assert.match(page, /HowWeTest/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.doesNotMatch(page, /Qwen2\.5|Qwen3-8B/);
    assert.match(hardware, /\/power/);
    assert.equal(shouldNoindex('/power'), false);
    assert.equal(isSitemapExcluded('/power'), false);
    assert.ok(primaryNav.some((item) => item.href === '/power'));
  });
});
