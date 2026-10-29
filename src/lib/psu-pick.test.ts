import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import {
  DUAL_PLUS_9950X_EST_W,
  PSUS,
  R9700_MIN_PSU_W,
  R9700_TBP_W,
  psuPickPayload,
  psuRecommendation,
  sizeForGpus,
} from './psu-pick';

const here = dirname(fileURLToPath(import.meta.url));
const productsFile = parse(readFileSync(new URL('../data/products.yaml', import.meta.url), 'utf8')) as {
  products: Array<{ id: string; urls?: Record<string, string> }>;
};
const budget = parse(readFileSync(new URL('../data/budget-tiers.yaml', import.meta.url), 'utf8')) as {
  tiers: Array<{ id: string; psu: string; parts: string[] }>;
  upgrade: { products: string[]; steps: string[] };
};

function read(rel: string): string {
  return readFileSync(join(here, rel), 'utf8');
}

describe('builder PSU step', () => {
  it('sizes 850 W for one card and 1200 W+ when a second GPU is in play', () => {
    const one = psuRecommendation({ gpuCount: 1, expandGpu: false });
    assert.equal(one.gpus_sized_for, 1);
    assert.equal(one.picks[0]?.watts, 850);
    assert.equal(one.picks[0]?.src, 'builder-psu-850');
    assert.equal(one.picks[0]?.go_newegg, '/go/newegg/corsair-rm850x?src=builder-psu-850');
    assert.match(one.why, /300 W TBP/);
    assert.match(one.why, /750 W/);
    assert.equal(one.r9700_tbp_w, R9700_TBP_W);
    assert.equal(one.r9700_min_psu_w, R9700_MIN_PSU_W);

    const two = psuRecommendation({ gpuCount: 2, expandGpu: false });
    assert.equal(two.gpus_sized_for, 2);
    assert.ok(two.picks.length >= 3);
    assert.ok(two.picks.every((row) => row.watts >= 1200 && row.native_12v2x6 >= 2));
    assert.match(two.why, /1,100 W/);
    assert.equal(two.dual_plus_9950x_est_w, DUAL_PLUS_9950X_EST_W);

    const later = psuRecommendation({ gpuCount: 1, expandGpu: true });
    assert.equal(later.gpus_sized_for, 2);
    assert.match(later.why, /second GPU might come later/);
    assert.equal(sizeForGpus({ gpuCount: 1, expandGpu: false }), 1);
    assert.equal(sizeForGpus({ gpuCount: 1, expandGpu: true }), 2);
  });

  it('cites maker pages, names the 12V-2x6 notes, and invents no prices', () => {
    const bequiet = PSUS.find((row) => row.id === 'bequiet-sp12-1200');
    assert.match(bequiet?.note ?? '', /800 W/);
    const hx = PSUS.find((row) => row.id === 'hx1500i');
    assert.match(hx?.note ?? '', /1200 W at 100–115 V/);
    for (const psu of PSUS) {
      assert.match(psu.citation.url, /^https:\/\//);
      assert.match(psu.citation.as_of, /^\d{4}-\d{2}-\d{2}$/);
      const product = productsFile.products.find((row) => row.id === psu.product_id);
      assert.ok(product, psu.id);
      assert.ok(product.urls?.newegg, psu.id);
      assert.doesNotMatch(product.urls?.newegg ?? '', /[?&](tag|ranMID|irclickid)=/);
      assert.doesNotMatch(`${psu.note} ${psu.citation.section}`, /\$\d|\bMSRP\b/);
    }
    const blob = JSON.stringify(psuPickPayload());
    assert.doesNotMatch(blob, /\$\d|\bMSRP\b/);
    assert.match(blob, /builder-psu-850/);
    assert.match(blob, /builder-psu-1200/);
  });

  it('replaces 1000W-class lines on budget tiers and wires the pick boxes', () => {
    const yaml = read('../data/budget-tiers.yaml');
    assert.doesNotMatch(yaml, /1000W-class/);
    assert.ok(budget.tiers.every((tier) => !/1000W-class/.test(tier.psu)));
    assert.ok(!budget.tiers.some((tier) => tier.parts.includes('psu-1000w')));
    const enthusiast = budget.tiers.find((tier) => tier.id === 'enthusiast');
    assert.match(enthusiast?.psu ?? '', /850 W/);
    assert.match(enthusiast?.psu ?? '', /300 W TBP/);
    const pro = budget.tiers.find((tier) => tier.id === 'pro');
    assert.match(pro?.psu ?? '', /1200 W/);
    assert.match(pro?.psu ?? '', /1,100 W/);
    assert.match(read('../pages/api/v1/pick.json.ts'), /psuPickPayload/);
    assert.match(read('../pages/budget.astro'), /PsuPick/);
    assert.match(read('../pages/calculator.astro'), /PsuPick/);
    assert.match(read('../components/PsuPick.astro'), /AffiliateDisclosure/);
    assert.match(read('../components/RigWizard.astro'), /PsuPick/);
  });
});
