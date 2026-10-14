import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { DIMM_KIT_GB } from './calculator';
import { parseFlashDaily } from './flash-daily';
import { techArticleJsonLd } from './jsonld';
import {
  DESKTOP2_KIT_GB,
  MULTI_GPU_NAME,
  MULTI_GPU_OFFLOAD,
  MULTI_GPU_PATH,
  MULTI_GPU_PUBLISHED,
  REQUIRED_MULTI_GPU_HREFS,
  LOCAL_DESKTOP_KIT_GB,
  assertMultiGpuValid,
  multiGpuBlob,
  multiGpuDailyRow,
  multiGpuHrefs,
} from './multi-gpu';
import { runs } from './run-card-data';
import { documentTitle, isSitemapExcluded, pageDescription, shouldNoindex } from './seo';
import { primaryNav } from './site';
import { parseLocalDesktopDual } from './local-desktop-dual';

const here = dirname(fileURLToPath(import.meta.url));
const dual = parseLocalDesktopDual(parse(readFileSync(new URL('../data/local-desktop-dual.yaml', import.meta.url), 'utf8')));
const flash = parseFlashDaily(parse(readFileSync(new URL('../data/flash-daily.yaml', import.meta.url), 'utf8')));

describe('dual / multi-GPU guide', () => {
  it('cites only measured local desktop figures and keeps house rules', () => {
    assert.deepEqual(assertMultiGpuValid(runs, dual, flash), []);
    assert.equal(MULTI_GPU_PATH, '/multi-gpu');
    assert.equal(MULTI_GPU_NAME, 'Dual / multi-GPU');
    assert.equal(MULTI_GPU_PUBLISHED, '2026-10-13');
    assert.equal(DESKTOP2_KIT_GB, 192);
    assert.equal(LOCAL_DESKTOP_KIT_GB, 256);
    assert.ok((DIMM_KIT_GB as readonly number[]).includes(DESKTOP2_KIT_GB));

    const hrefs = multiGpuHrefs();
    for (const required of REQUIRED_MULTI_GPU_HREFS) {
      assert.ok(hrefs.includes(required), required);
    }

    const blob = multiGpuBlob();
    assert.match(blob, /--split-mode layer/);
    assert.match(blob, /--split-mode row/);
    assert.match(blob, /--tensor-split/);
    assert.match(blob, /--main-gpu/);
    assert.match(blob, /GGML_VK_VISIBLE_DEVICES/);
    assert.match(blob, /HIP_VISIBLE_DEVICES/);
    assert.match(blob, /ROCR_VISIBLE_DEVICES/);
    assert.match(blob, /Minimum system RAM needed/);
    assert.match(blob, /RAM needed at full context/);
    assert.match(blob, /300 W/);
    assert.match(blob, /750 W/);
    assert.match(blob, /1×16 or 2×8/);
    assert.match(blob, /UD-Q3_K_XL/);
    assert.match(blob, /planned/);
    assert.match(MULTI_GPU_OFFLOAD.desktop2, /not measured/i);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.doesNotMatch(blob, /coming soon/i);
    assert.doesNotMatch(blob, /\$\d/);

    const daily = multiGpuDailyRow(runs);
    assert.equal(daily?.one.decode, '102.39 tok/s');
    assert.equal(daily?.both.decode, '82.78 tok/s');
    assert.ok(daily?.one.runIds.length);
    assert.equal(dual.copies.per_request_tok_s, 100);
    assert.equal(flash.measured_q6_two_cards.strata_8k_tok_s, 32.8);
  });

  it('is findable in nav and has unique SEO without price JSON-LD', () => {
    assert.ok(primaryNav.some((item) => item.href === '/multi-gpu'));
    assert.equal(shouldNoindex('/multi-gpu'), false);
    assert.equal(isSitemapExcluded('/multi-gpu'), false);
    assert.ok(documentTitle('/multi-gpu').endsWith(' · AMDai'));
    assert.match(pageDescription('/multi-gpu'), /R9700/);
    assert.match(pageDescription('/multi-gpu'), /llama\.cpp/);
    const ld = techArticleJsonLd({
      headline: MULTI_GPU_NAME,
      description: 'When a second Radeon AI PRO R9700 helps or hurts.',
      url: 'https://amdai.net/multi-gpu',
      published: MULTI_GPU_PUBLISHED,
      modified: MULTI_GPU_PUBLISHED,
    });
    assert.equal(ld['@type'], 'TechArticle');
    assert.doesNotMatch(JSON.stringify(ld), /aggregateRating|offers|"price"/i);
  });

  it('is linked from the required inbound pages', () => {
    const files = [
      join(here, '../pages/gpus/r9700.astro'),
      join(here, 'setup.ts'),
      join(here, '../pages/backends/index.astro'),
      join(here, '../pages/calculator.astro'),
      join(here, '../pages/budget.astro'),
      join(here, 'glossary.ts'),
    ];
    for (const file of files) {
      assert.match(readFileSync(file, 'utf8'), /\/multi-gpu/, file);
    }
  });
});
