import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { primaryNav } from './site';
import { isSitemapExcluded, shouldNoindex } from './seo';
import {
  REQUIRED_SAM_HREFS,
  SAM_CARDS,
  SAM_CITED_LABEL,
  SAM_CURL_CARD,
  SAM_DESCRIPTION,
  SAM_DOCS,
  SAM_FLASH,
  SAM_FLASH_FILE,
  SAM_HOUSE,
  SAM_HOUSE_FILE,
  SAM_HOUSE_SERVER_FLAGS,
  SAM_PATH,
  SAM_PUBLISHED,
  SAM_QUANTS,
  SAM_TITLE,
  SAM_UNMEASURED,
  assertSamValid,
  samBlob,
  samHrefs,
} from './sampling';

const here = dirname(fileURLToPath(import.meta.url));

describe('Sampling settings on Radeon', () => {
  it('keeps cited sampler flags, card-only values, and house rules', () => {
    assert.deepEqual(assertSamValid(), []);
    assert.equal(SAM_PATH, '/sampling');
    assert.equal(SAM_PUBLISHED, '2026-10-14');
    assert.equal(SAM_TITLE, 'Sampling settings on Radeon');
    assert.ok(SAM_DESCRIPTION.length >= 70);
    assert.ok(SAM_DESCRIPTION.length <= 160);
    assert.equal(
      SAM_CITED_LABEL,
      'Cited llama.cpp --temp / --top-p / --min-p · sampler speed not measured',
    );
    assert.equal(SAM_UNMEASURED, 'not measured yet');
    assert.match(SAM_HOUSE, new RegExp(SAM_HOUSE_SERVER_FLAGS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    const houseFlags = SAM_HOUSE.split('\n').filter((line) => !line.startsWith('#')).join('\n');
    assert.doesNotMatch(houseFlags, /--temp/);
    assert.doesNotMatch(houseFlags, /--top-p/);
    assert.doesNotMatch(houseFlags, /--min-p/);
    assert.doesNotMatch(houseFlags, /--samplers/);
    const flashFlags = SAM_FLASH.split('\n').filter((line) => !line.startsWith('#')).join('\n');
    assert.doesNotMatch(flashFlags, /--temp/);
    assert.match(SAM_DOCS, /--temp 0\.80/);
    assert.match(SAM_DOCS, /--top-p 0\.95/);
    assert.match(SAM_DOCS, /--min-p 0\.05/);
    assert.match(SAM_CURL_CARD, /"temperature": 1\.0/);
    assert.match(SAM_HOUSE, new RegExp(SAM_HOUSE_FILE.replace(/\./g, '\\.')));
    assert.match(SAM_FLASH, new RegExp(SAM_FLASH_FILE.replace(/\./g, '\\.')));
    assert.ok(SAM_QUANTS.some((row) => row.quant === 'UD-Q3_K_XL' && row.estimate));
    assert.ok(SAM_QUANTS.every((row) => row.speed === SAM_UNMEASURED));
    assert.ok(SAM_CARDS.some((row) => row.id === 'qwen36-think' && row.onCard));
    assert.ok(SAM_CARDS.some((row) => row.id === 'gpt-oss' && !row.onCard));
    const blob = samBlob();
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /AMDai/);
    assert.match(blob, /--temp/);
    assert.match(blob, /--top-p/);
    assert.match(blob, /--min-p/);
    assert.match(blob, /--samplers/);
    assert.match(blob, /DRY/);
    assert.match(blob, /XTC/);
    assert.match(blob, /Minimum system RAM needed/);
    assert.match(blob, /RAM needed at full context/);
    assert.match(blob, /not measured yet/);
    assert.match(blob, /Q4 and up/);
    assert.match(blob, /do not download Q3/i);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.doesNotMatch(blob, /amdai-stack-lab:(?:\/\/)?sampl/);
    const hrefs = samHrefs();
    for (const required of REQUIRED_SAM_HREFS) {
      assert.ok(hrefs.includes(required), required);
    }
  });

  it('wires the dedicated page and stays in the sitemap', () => {
    const page = readFileSync(join(here, '../pages/sampling.astro'), 'utf8');
    assert.match(page, /SAM_LEAD/);
    assert.match(page, /llama\.cpp/);
    assert.match(page, /Open in Stack Lab/);
    assert.match(page, /NextSteps/);
    assert.match(page, /HouseRam/);
    assert.match(page, /SAM_H1/);
    assert.match(page, /temperature, top-p, top-k, and min-p/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.doesNotMatch(page, /amdai-stack-lab:sampl/);
    assert.equal(shouldNoindex('/sampling'), false);
    assert.equal(isSitemapExcluded('/sampling'), false);
    assert.ok(primaryNav.some((item) => item.href === '/sampling'));
  });
});
