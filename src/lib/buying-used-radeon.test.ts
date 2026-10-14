import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { primaryNav } from './site';
import { isSitemapExcluded, shouldNoindex } from './seo';
import { COMPARE_Q3 } from './local-desktop-compare';
import {
  BUYING_USED_CITED_LABEL,
  BUYING_USED_GO_PRODUCTS,
  BUYING_USED_PATH,
  BUYING_USED_PUBLISHED,
  BUYING_USED_SPEED_LABEL,
  BUYING_USED_STEPS,
  BUYING_USED_TITLE,
  REQUIRED_BUYING_USED_HREFS,
  assertBuyingUsedValid,
  buyingUsedBlob,
  buyingUsedHrefs,
  buyingUsedVramClasses,
} from './buying-used-radeon';

const here = dirname(fileURLToPath(import.meta.url));

describe('Buying a used Radeon for local AI', () => {
  it('keeps cited generations, VRAM picker, and house rules', () => {
    assert.deepEqual(assertBuyingUsedValid(), []);
    assert.equal(BUYING_USED_PUBLISHED, '2026-10-14');
    assert.equal(BUYING_USED_PATH, '/guides/buying-used-radeon');
    assert.equal(BUYING_USED_TITLE, 'Buying a used Radeon for local AI');
    assert.equal(BUYING_USED_CITED_LABEL, 'Cited, not measured on local-desktop');
    assert.equal(BUYING_USED_SPEED_LABEL, 'not measured');
    assert.ok(BUYING_USED_STEPS.length >= 8);
    const classes = buyingUsedVramClasses();
    assert.deepEqual(classes.map((row) => row.vramGb), [12, 16, 20, 24, 32]);
    assert.ok(classes.every((row) => row.quants.some((cell) => cell.quant === COMPARE_Q3 && cell.estimate)));
    const blob = buyingUsedBlob();
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /HSA_OVERRIDE_GFX_VERSION/);
    assert.match(blob, /Minimum system RAM needed/);
    assert.match(blob, /RAM needed at full context/);
    assert.match(blob, /not measured/);
    const hrefs = buyingUsedHrefs();
    for (const required of REQUIRED_BUYING_USED_HREFS) {
      assert.ok(
        hrefs.some((href) => href === required || href.startsWith(`${required}/`)),
        required,
      );
    }
    assert.ok(BUYING_USED_GO_PRODUCTS.includes('rx7900xtx'));
    assert.ok(BUYING_USED_GO_PRODUCTS.includes('rx6800xt'));
  });

  it('wires the dedicated page and stays in the sitemap', () => {
    const page = readFileSync(join(here, '../pages/guides/buying-used-radeon.astro'), 'utf8');
    const budget = readFileSync(join(here, '../pages/budget.astro'), 'utf8');
    const compare = readFileSync(join(here, '../pages/compare/gpus.astro'), 'utf8');
    const sheet = readFileSync(join(here, '../components/ConsumerGpuSheet.astro'), 'utf8');
    assert.match(page, /llama\.cpp/);
    assert.match(page, /BUYING_USED_TITLE/);
    assert.match(page, /Buying a used Radeon/);
    assert.match(page, /NextSteps/);
    assert.match(page, /BuyButtons/);
    assert.match(page, /AffiliateDisclosure/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.doesNotMatch(page, /Qwen2\.5|Qwen3-8B/);
    assert.match(budget, /\/guides\/buying-used-radeon/);
    assert.match(compare, /\/guides\/buying-used-radeon/);
    assert.match(sheet, /\/guides\/buying-used-radeon/);
    assert.equal(shouldNoindex('/guides/buying-used-radeon'), false);
    assert.equal(isSitemapExcluded('/guides/buying-used-radeon'), false);
    assert.ok(primaryNav.some((item) => item.href === '/guides/buying-used-radeon'));
  });
});
