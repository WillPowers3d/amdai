import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { primaryNav } from './site';
import { isSitemapExcluded, shouldNoindex } from './seo';
import { PII_TEXT } from './pii-denylist';
import {
  REQUIRED_SERVING_HREFS,
  SERVING_CHECKED,
  SERVING_CITED_LABEL,
  SERVING_DESCRIPTION,
  SERVING_FIGURES,
  SERVING_H1,
  SERVING_HOUSE_FILE,
  SERVING_LAB_35B,
  SERVING_LAB_FLASH_LLAMA,
  SERVING_LAB_FLASH_STRATA,
  SERVING_LAYER,
  SERVING_ONE,
  SERVING_OTHER,
  SERVING_PATH,
  SERVING_PROJECT_HEADING,
  SERVING_PUBLISHED,
  SERVING_SLOTS,
  SERVING_SOURCES,
  SERVING_STEPS,
  SERVING_TENSOR,
  SERVING_TITLE,
  assertServingValid,
  buildServingPayload,
  servingBlob,
  servingHrefs,
} from './serving';

const here = dirname(fileURLToPath(import.meta.url));

describe('Serving many users on two Radeon cards', () => {
  it('keeps cited flags, our-lab cells, and house rules', () => {
    assert.deepEqual(assertServingValid(), []);
    assert.equal(SERVING_PATH, '/serving');
    assert.equal(SERVING_PUBLISHED, '2026-10-28');
    assert.equal(SERVING_CHECKED, '2026-10-28');
    assert.equal(SERVING_TITLE, 'Serve many users on two Radeon cards');
    assert.ok(SERVING_DESCRIPTION.length >= 70);
    assert.ok(SERVING_DESCRIPTION.length <= 160);
    assert.match(SERVING_H1, /Serving many users on two Radeon cards/);
    assert.equal(SERVING_CITED_LABEL, 'Cited multi-user serving · llama.cpp first');
    assert.equal(SERVING_PROJECT_HEADING, 'Open project: dual-Radeon serving kit (coming soon)');
    assert.ok(SERVING_STEPS.length >= 6);
    assert.ok(SERVING_SOURCES.every((row) => row.href.startsWith('http') || row.href.startsWith('/')));
    assert.ok(SERVING_SOURCES.every((row) => row.checked && row.sourceDate));
    assert.match(SERVING_ONE, /-np 1/);
    assert.match(SERVING_SLOTS, /--kv-unified-per-slot/);
    assert.match(SERVING_LAYER, /--split-mode layer/);
    assert.match(SERVING_TENSOR, /--split-mode tensor/);
    assert.match(SERVING_ONE, new RegExp(SERVING_HOUSE_FILE.replace(/\./g, '\\.')));
    assert.equal(SERVING_LAB_35B, 102.39);
    assert.equal(SERVING_LAB_FLASH_STRATA, 32.6);
    assert.equal(SERVING_LAB_FLASH_LLAMA, 16);
    assert.ok(SERVING_FIGURES.some((row) => row.ourLab && row.value.includes('102.39')));
    assert.ok(SERVING_FIGURES.every((row) => row.ourLab !== row.thirdParty));
    assert.ok(!SERVING_OTHER.some((row) => /tgi|aphrodite/i.test(`${row.engine} ${row.radeon}`)));
    const blob = servingBlob();
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /AMDai/);
    assert.match(blob, /--parallel/);
    assert.match(blob, /--split-mode/);
    assert.match(blob, /our lab/i);
    assert.match(blob, /third-party/i);
    assert.match(blob, /TTFT/);
    assert.match(blob, /coming soon/i);
    assert.match(blob, /router/);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.doesNotMatch(blob, /needs? re-?measure/i);
    assert.doesNotMatch(blob, /Aphrodite/i);
    assert.doesNotMatch(blob, PII_TEXT);
    const hrefs = servingHrefs();
    for (const required of REQUIRED_SERVING_HREFS) {
      assert.ok(hrefs.includes(required), required);
    }
  });

  it('ships a public API summary and wires the dedicated page', () => {
    const payload = buildServingPayload();
    assert.equal(payload.schema_version, '1.0');
    assert.equal(payload.href, 'https://amdai.net/serving');
    assert.equal(payload.project.repository, null);
    assert.equal(payload.project.status, 'coming soon');
    assert.ok(payload.our_lab.length >= 2);
    assert.ok(payload.third_party.length >= 8);
    assert.ok(payload.sources.every((row) => row.checked && row.href));
    assert.doesNotMatch(JSON.stringify(payload), PII_TEXT);

    const page = readFileSync(join(here, '../pages/serving.astro'), 'utf8');
    assert.match(page, /SERVING_LEAD/);
    assert.match(page, /llama\.cpp/);
    assert.match(page, /NextSteps/);
    assert.match(page, /SERVING_PROJECT_HEADING/);
    assert.match(page, /third-party/i);
    assert.doesNotMatch(page, /Aphrodite/i);
    assert.doesNotMatch(page, /needs? re-?measure/i);
    assert.equal(shouldNoindex('/serving'), false);
    assert.equal(isSitemapExcluded('/serving'), false);
    assert.ok(primaryNav.some((item) => item.href === '/serving'));

    const apiPage = readFileSync(join(here, '../pages/api/index.astro'), 'utf8');
    assert.match(apiPage, /curl -s https:\/\/amdai\.net\/api\/v1\/backends\.json\ncurl -s https:\/\/amdai\.net\/api\/v1\/serving\.json/);
    assert.match(apiPage, /id="api-preview"/);
  });
});
