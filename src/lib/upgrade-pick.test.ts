import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CAN_RUN_GPU_IDS, CAN_RUN_MODEL_IDS, canRunPairPages, canRunVerdict } from './can-run';
import { PII_TEXT } from './pii-denylist';
import {
  CAN_RUN_FOOTER_SRC,
  CAN_RUN_NEXT_STEP_ALT_SRC,
  CAN_RUN_NEXT_STEP_SRC,
  ONE_VS_TWO_PICKS,
  ONE_VS_TWO_SRC,
  allUpgradePickTsvRows,
  assertUpgradePicksValid,
  diffUpgradePicks,
  loadExpectedUpgradePicks,
  nextStepPicks,
  upgradePickCounts,
} from './upgrade-pick';

const here = dirname(fileURLToPath(import.meta.url));

describe('can-run next-step upgrade picks', () => {
  it('matches upgrade-picks.tsv for every pair page', () => {
    const expected = loadExpectedUpgradePicks();
    assert.equal(expected.length, CAN_RUN_MODEL_IDS.length * CAN_RUN_GPU_IDS.length);
    assert.deepEqual(diffUpgradePicks(expected, allUpgradePickTsvRows()), []);
    assert.deepEqual(assertUpgradePicksValid(), []);
  });

  it('keeps house rules: Q4+ shopper, no upsell when it fits, existing /go/ products', () => {
    const pages = canRunPairPages();
    assert.equal(pages.length, 160);
    for (const page of pages) {
      const picks = nextStepPicks(page.modelId, page.gpuId);
      const verdict = canRunVerdict(page.modelId, page.gpuId);
      if (verdict === 'fits-fully') {
        assert.equal(picks[0]?.kind, 'keep');
        assert.equal(picks.some((pick) => pick.kind === 'primary'), false);
      } else if (verdict === 'ram-offload') {
        assert.equal(picks[0]?.productId, 'ddr5-kit');
      } else if (verdict === 'needs-2-gpus') {
        assert.ok(picks[0]?.productId);
      }
      for (const pick of picks) {
        if (pick.productId) assert.ok(pick.productId.length > 0);
        assert.doesNotMatch(pick.label, /\$\d|\bMSRP\b/);
        assert.doesNotMatch(pick.label, /\bQ[123]\b|Q3_/);
      }
    }
    const source = readFileSync(join(here, './can-run.ts'), 'utf8');
    const shopper = source.match(/function shopperQuant\([\s\S]*?\n\}/);
    assert.ok(shopper);
    assert.match(shopper[0], /q5_k_m|q6_k|q4_k_m/);
    assert.doesNotMatch(shopper[0], /q3_|q2_|q1_/);
  });

  it('counts each primary pick and pages that gain a new product path', () => {
    const counts = upgradePickCounts();
    assert.equal(counts.pages, 160);
    assert.equal(counts.keep + counts.ddr5 + counts.oneR9700 + counts.secondCard, 160);
    assert.equal(counts.boxShown, counts.pages - counts.keep);
    assert.equal(counts.keep, 44);
    assert.equal(counts.ddr5, 61);
    assert.equal(counts.oneR9700, 51);
    assert.equal(counts.secondCard, 4);
    assert.equal(counts.addsNewProduct, 115);
  });

  it('wires the box under the verdict and tags /go/ clicks', () => {
    const pair = readFileSync(join(here, '../pages/can-run/[slug].astro'), 'utf8');
    const box = readFileSync(join(here, '../components/NextStepBuyBox.astro'), 'utf8');
    const compare = readFileSync(join(here, '../pages/compare/one-vs-two-gpu.astro'), 'utf8');
    const hop = readFileSync(join(here, '../pages/go/[retailer]/[product].astro'), 'utf8');
    assert.match(pair, /NextStepBuyBox/);
    assert.match(pair, /headlineLabel/);
    assert.match(pair, /CAN_RUN_NEXT_STEP_SRC/);
    assert.match(pair, /CAN_RUN_FOOTER_SRC/);
    assert.match(box, /AffiliateDisclosure/);
    assert.match(box, /data-pagefind-ignore/);
    assert.match(box, /goPath/);
    assert.match(box, /Check price at/);
    assert.doesNotMatch(box, /\$\d|\bMSRP\b|hurry|limited time|act now|buy now/i);
    assert.equal(CAN_RUN_NEXT_STEP_SRC, 'canrun-nextstep');
    assert.equal(CAN_RUN_NEXT_STEP_ALT_SRC, 'canrun-nextstep-alt');
    assert.equal(CAN_RUN_FOOTER_SRC, 'canrun-footer');
    assert.equal(ONE_VS_TWO_SRC, 'one-vs-two');
    assert.equal(ONE_VS_TWO_PICKS[0]?.productId, 'r9700');
    assert.match(compare, /SecondCardBox/);
    assert.doesNotMatch(compare, /NextStepBuyBox/);
    assert.match(hop, /location\.search/);
    assert.match(hop, /src/);
    for (const file of [
      '../components/NextStepBuyBox.astro',
      './upgrade-pick.ts',
      '../pages/can-run/[slug].astro',
      '../pages/compare/one-vs-two-gpu.astro',
      '../data/upgrade-picks.tsv',
    ]) {
      const text = readFileSync(join(here, file), 'utf8');
      assert.doesNotMatch(text, PII_TEXT, file);
      assert.doesNotMatch(text, /\/home\/|\/Users\//, file);
    }
  });
});
