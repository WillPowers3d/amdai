import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { PII_TEXT } from './pii-denylist';
import { assertBuyingUsedValid } from './buying-used-radeon';
import {
  R9700_STREET_CHEAPEST,
  R9700_STREET_CHECKED,
  R9700_STREET_LOG_HREF,
  R9700_STREET_MSRP,
  R9700_STREET_NEWEGG,
  R9700_STREET_POLICY,
  R9700_STREET_SNAPSHOT,
  assertR9700StreetPriceValid,
  formatUsd,
  r9700BudgetBandLabel,
  r9700StreetPrice,
  streetBandForTier,
} from './r9700-street-price';

const here = dirname(fileURLToPath(import.meta.url));

function read(rel: string): string {
  return readFileSync(join(here, rel), 'utf8');
}

describe('R9700 cited street snapshot', () => {
  it('keeps the 2026-10-27 brief figures and never rounds the cheapest new card', () => {
    assert.deepEqual(assertR9700StreetPriceValid(), []);
    assert.equal(R9700_STREET_CHECKED, '2026-10-27');
    assert.equal(r9700StreetPrice.cheapest_new.usd, '1949.99');
    assert.equal(r9700StreetPrice.cheapest_new.retailer, 'Micro Center');
    assert.equal(r9700StreetPrice.newegg.usd, '1999.99');
    assert.equal(r9700StreetPrice.newegg.retailer, 'Newegg');
    assert.equal(r9700StreetPrice.amd_msrp_usd, '1299');
    assert.equal(R9700_STREET_CHEAPEST, '$1,949.99');
    assert.equal(R9700_STREET_NEWEGG, '$1,999.99');
    assert.equal(R9700_STREET_MSRP, '$1,299');
    assert.equal(formatUsd('1949.99'), '$1,949.99');
    assert.doesNotMatch(R9700_STREET_SNAPSHOT, /\$1,900\b/);
    assert.match(R9700_STREET_SNAPSHOT, /GPU only/);
    assert.match(R9700_STREET_SNAPSHOT, /before tax/);
    assert.match(R9700_STREET_SNAPSHOT, /Oct 27, 2026/);
    assert.match(R9700_STREET_SNAPSHOT, /Micro Center/);
    assert.match(R9700_STREET_SNAPSHOT, /Newegg/);
    assert.match(R9700_STREET_POLICY, /dated, sourced snapshot only/);
    assert.match(R9700_STREET_POLICY, /invented/);
    assert.equal(R9700_STREET_LOG_HREF, '/lab-log');
    const one = r9700BudgetBandLabel('one');
    const two = r9700BudgetBandLabel('two');
    assert.match(one, /One R9700 ≈ \$1,950–\$2,000/);
    assert.match(two, /Two R9700s ≈ \$3,900–\$4,000/);
    assert.match(one, /GPU only/);
    assert.match(one, /before tax/);
    assert.match(one, /2026-10-27/);
    assert.match(two, /GPU only/);
    assert.match(two, /before tax/);
  });

  it('fills Enthusiast and Pro budget bands from that file and leaves Starter / Mid not recorded', () => {
    const yaml = parse(read('../data/budget-tiers.yaml')) as {
      as_of: string;
      tiers: Array<{ id: string; usd_band: { status: string; usd_low: number | null; usd_high: number | null; label: string } }>;
    };
    assert.equal(yaml.as_of, R9700_STREET_CHECKED);
    const byId = Object.fromEntries(yaml.tiers.map((tier) => [tier.id, tier]));
    assert.equal(byId.starter?.usd_band.status, 'todo');
    assert.equal(byId.mid?.usd_band.status, 'todo');
    assert.equal(byId.enthusiast?.usd_band.status, 'cited');
    assert.equal(byId.pro?.usd_band.status, 'cited');
    const one = streetBandForTier('enthusiast');
    const two = streetBandForTier('pro');
    assert.equal(one?.usd_low, r9700StreetPrice.bands.one_card.usd_low);
    assert.equal(one?.usd_high, r9700StreetPrice.bands.one_card.usd_high);
    assert.equal(two?.usd_low, r9700StreetPrice.bands.two_cards.usd_low);
    assert.equal(two?.usd_high, r9700StreetPrice.bands.two_cards.usd_high);
    assert.equal(byId.enthusiast?.usd_band.usd_low, one?.usd_low);
    assert.equal(byId.pro?.usd_band.usd_high, two?.usd_high);
    assert.match(one?.label ?? '', /GPU only/);
    assert.match(two?.label ?? '', /GPU only/);
    assert.match(one?.label ?? '', /before tax/);
    assert.equal(streetBandForTier('starter'), undefined);
    const budget = read('./budget.ts');
    assert.match(budget, /streetBandForTier/);
    assert.match(budget, /hasCitedBands/);
    assert.match(budget, /bandsReady/);
  });

  it('wires the dated snapshot on the R9700 sheet, budget page, and hardware guide', () => {
    const r9700 = read('../pages/gpus/r9700.astro');
    const budget = read('../pages/budget.astro');
    const hardware = read('../content/guides/hardware.mdx');
    assert.match(r9700, /R9700_STREET_SNAPSHOT/);
    assert.match(r9700, /R9700_STREET_POLICY/);
    assert.match(r9700, /\/lab-log/);
    assert.doesNotMatch(r9700, /No live or invented prices\./);
    assert.match(budget, /hasCitedBands/);
    assert.match(budget, /dated, sourced GPU street snapshots only/);
    assert.match(budget, /R9700 GPU-only US street bands are a dated, sourced snapshot/);
    assert.match(hardware, /R9700_STREET_SNAPSHOT/);
    assert.match(hardware, /R9700_STREET_POLICY/);
    assert.match(hardware, /\/lab-log/);
    assert.doesNotMatch(hardware, /we do not list them/);
    assert.doesNotMatch(hardware, /^No live prices\./m);
  });

  it('leaves the used-Radeon guide without a dollar figure', () => {
    assert.deepEqual(assertBuyingUsedValid(), []);
    const page = read('../pages/guides/buying-used-radeon.astro');
    assert.doesNotMatch(page, /\$\d/);
  });

  it('keeps changed sources free of host names and personal paths', () => {
    const files = [
      '../data/r9700-street-price.yaml',
      '../data/budget-tiers.yaml',
      './r9700-street-price.ts',
      './budget.ts',
      '../pages/budget.astro',
      '../pages/gpus/r9700.astro',
      '../content/guides/hardware.mdx',
      '../components/BuyButtons.astro',
      '../components/AffiliateDisclosure.astro',
    ];
    for (const file of files) {
      const text = read(file);
      assert.doesNotMatch(text, PII_TEXT, file);
      assert.doesNotMatch(text, /\/home\/|\/Users\//, file);
    }
  });
});
