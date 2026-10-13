import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { runs } from './run-card-data';
import { DIMM_KIT_GB } from './calculator';
import { COMPARE_Q3 } from './local-desktop-compare';
import { primaryNav } from './site';
import { documentTitle, isSitemapExcluded, pageDescription, shouldNoindex } from './seo';
import { techArticleJsonLd } from './jsonld';
import {
  REQUIRED_R9700_HREFS,
  R9700_DAILY_RECIPE,
  R9700_NAME,
  R9700_PATH,
  R9700_PATH_STEPS,
  R9700_PUBLISHED,
  R9700_SHORT,
  R9700_VRAM,
  assertR9700Valid,
  r9700Blob,
  r9700CitedFigures,
  r9700Hrefs,
  r9700OneVsTwo,
  r9700QuantRows,
} from './r9700';

describe('R9700 measured hero', () => {
  it('cites only real run-card figures and keeps house rules', () => {
    assert.deepEqual(assertR9700Valid(runs), []);
    assert.equal(R9700_NAME, 'AMD Radeon AI PRO R9700');
    assert.equal(R9700_SHORT, 'Radeon AI PRO R9700');
    assert.equal(R9700_VRAM, '32 GB');
    assert.equal(R9700_PUBLISHED, '2026-10-13');
    assert.equal(R9700_PATH, '/gpus/r9700');
    assert.equal(R9700_DAILY_RECIPE, 'qwen36-35b.llamacpp-vulkan.262k');

    const hrefs = r9700Hrefs();
    for (const required of REQUIRED_R9700_HREFS) {
      assert.ok(hrefs.includes(required), required);
    }
    assert.ok(R9700_PATH_STEPS.some((step) => step.href === '/start'));
    assert.ok(R9700_PATH_STEPS.some((step) => step.href === '/setup'));
    assert.ok(R9700_PATH_STEPS.some((step) => step.href.includes(R9700_DAILY_RECIPE)));
    assert.ok(R9700_PATH_STEPS.some((step) => step.href === '/stack-lab'));

    const blob = r9700Blob();
    assert.match(blob, /32 GB/);
    assert.match(blob, /Minimum system RAM needed/);
    assert.match(blob, /RAM needed at full context/);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /coming soon/i);
    assert.doesNotMatch(blob, /\$\d/);

    const rows = r9700OneVsTwo(runs);
    const ud4k = rows.find((row) => row.quant === 'UD-Q5_K_XL' && row.context === 4096);
    assert.equal(ud4k?.one.decode, '102.39 tok/s');
    assert.ok(ud4k?.one.runIds.length);
    const figures = r9700CitedFigures(runs);
    assert.ok(figures.some((fig) => fig.value.includes('102.39') && fig.runIds.length));
    const q3 = r9700QuantRows(runs)
      .flatMap((row) => row.columns)
      .filter((col) => col.quant === COMPARE_Q3);
    assert.ok(q3.length);
    assert.ok(q3.every((col) => col.kind === 'estimate' && col.decode === 'not measured'));
    for (const col of r9700QuantRows(runs).flatMap((row) => row.columns)) {
      assert.ok((DIMM_KIT_GB as readonly number[]).includes(col.ramMin.kitGb));
      assert.ok((DIMM_KIT_GB as readonly number[]).includes(col.ramFull.kitGb));
    }
  });

  it('is findable in nav and has unique SEO without price JSON-LD', () => {
    assert.ok(primaryNav.some((item) => item.href === '/gpus/r9700'));
    assert.equal(shouldNoindex('/gpus/r9700'), false);
    assert.equal(isSitemapExcluded('/gpus/r9700'), false);
    assert.ok(documentTitle('/gpus/r9700').endsWith(' · AMDai'));
    assert.match(pageDescription('/gpus/r9700'), /32 GB/);
    assert.match(pageDescription('/gpus/r9700'), /measured|local-desktop/i);
    const ld = techArticleJsonLd({
      headline: R9700_SHORT,
      description: 'Measured 35B llama.cpp on the Radeon AI PRO R9700.',
      url: 'https://amdai.net/gpus/r9700',
      published: R9700_PUBLISHED,
      modified: R9700_PUBLISHED,
    });
    assert.equal(ld['@type'], 'TechArticle');
    assert.doesNotMatch(JSON.stringify(ld), /aggregateRating|offers|"price"/i);
  });

  it('is linked from budget, calculator, and hardware', () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const files = [
      join(here, '../pages/budget.astro'),
      join(here, '../pages/calculator.astro'),
      join(here, '../content/guides/hardware.mdx'),
    ];
    for (const file of files) {
      assert.match(readFileSync(file, 'utf8'), /\/gpus\/r9700/, file);
    }
    for (const required of ['/compare', '/results', '/faq', '/glossary']) {
      assert.ok(r9700Hrefs().includes(required), required);
    }
  });
});
