import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DIMM_KIT_GB } from './calculator';
import { MODEL_PAGES } from './gpu-ids';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { runs } from './run-card-data';
import { documentTitle, isSitemapExcluded, pageDescription, shouldNoindex } from './seo';
import { HOUSE_STACK_LAB } from './stack-lab-open';
import { COMPARE_Q3 } from './local-desktop-compare';
import {
  CONTRIBUTE_MODELS,
  HOUSE_MODEL_IDS,
  MODEL_PUBLISHED,
  NO_DATA_CONTRIBUTE,
  REQUIRED_MODEL_HREFS,
  assertModelPagesValid,
  houseModelPage,
  houseModelPages,
  isHouseModelId,
  modelBlob,
  modelHrefs,
  modelPath,
} from './model-pages';

describe('per-model recipe pages', () => {
  it('covers only house models with cited data and lists the rest as contribute', () => {
    const pages = houseModelPages(runs);
    assert.deepEqual(assertModelPagesValid(pages), []);
    assert.deepEqual([...HOUSE_MODEL_IDS], ['qwen36', 'flash']);
    assert.equal(MODEL_PUBLISHED, '2026-10-13');
    assert.equal(pages[0]?.name, 'Qwen3.6-35B-A3B');
    assert.equal(pages[1]?.name, 'Qwen 3.8 Flash');
    assert.equal(isHouseModelId('qwen36'), true);
    assert.equal(isHouseModelId('glm-53-flash'), false);
    assert.equal(modelPath('qwen36'), '/models/qwen36');
    assert.equal(modelPath('flash'), '/models/flash');
    assert.ok(CONTRIBUTE_MODELS.some((row) => row.id === 'glm-53-flash'));
    assert.ok(CONTRIBUTE_MODELS.every((row) => !isHouseModelId(row.id)));
    assert.deepEqual(
      MODEL_PAGES.map((row) => row.id),
      [...HOUSE_MODEL_IDS],
    );
  });

  it('builds config tables from run cards and leaves untested cells contribute', () => {
    const qwen36 = houseModelPage('qwen36', runs);
    const flash = houseModelPage('flash', runs);
    const daily = qwen36.configRows.find(
      (row) => row.quant === 'UD-Q5_K_XL' && row.gpuCount === 1 && row.context === 262144,
    );
    assert.ok(daily);
    assert.equal(daily.kind, 'measured');
    assert.match(daily.decode, /\d/);
    assert.ok(daily.runIds.length);

    const q3 = qwen36.configRows.filter((row) => row.quant === COMPARE_Q3);
    assert.ok(q3.length);
    for (const row of q3) {
      assert.equal(row.quantKind, 'q3-estimate');
      assert.match(row.note ?? '', /estimate/i);
      assert.equal(row.decode, NO_DATA_CONTRIBUTE);
      assert.match(row.systemRam, /estimate/i);
    }

    assert.ok(qwen36.configRows.some((row) => row.kind === 'empty' || row.decode === NO_DATA_CONTRIBUTE));
    assert.ok(flash.configRows.some((row) => row.decode === NO_DATA_CONTRIBUTE));
    assert.ok(flash.citedPair.some((row) => row.decode.includes('32.6')));
    assert.ok(flash.citedPair.some((row) => row.decode.includes('16')));
    assert.equal(flash.launches[0]?.backend, 'llamacpp');
    assert.ok(flash.launches.some((row) => row.backend === 'strata'));
    assert.equal(qwen36.launches[0]?.backend, 'llamacpp');
    assert.ok(!qwen36.launches.some((row) => row.backend === 'strata'));
    assert.equal(qwen36.stackLab.id, HOUSE_STACK_LAB.daily.id);
    assert.equal(flash.stackLab.id, HOUSE_STACK_LAB.flash.id);
    assert.ok(qwen36.ramNeed);
    assert.ok((DIMM_KIT_GB as readonly number[]).includes(qwen36.ramNeed.atSelected.kitGb));
    assert.ok((DIMM_KIT_GB as readonly number[]).includes(qwen36.ramNeed.atFullContext.kitGb));
    assert.ok(flash.flashRam.length);

    for (const page of [qwen36, flash]) {
      const blob = modelBlob(page);
      assert.ok(blob.includes(RAM_MIN_LABEL));
      assert.ok(blob.includes(RAM_FULL_LABEL));
      assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
      assert.doesNotMatch(blob, /\$\d|\bMSRP\b/);
      assert.doesNotMatch(blob, /Apache-2\.0/);
      assert.doesNotMatch(blob, /floor is q4/i);
      const hrefs = modelHrefs(page);
      for (const required of REQUIRED_MODEL_HREFS) {
        assert.ok(hrefs.includes(required), `${page.id} ${required}`);
      }
      assert.ok(page.fitBadges.every((badge) => badge.href.startsWith('/gpus/')));
    }
  });

  it('has unique SEO without fake ratings or invented speed', () => {
    for (const page of houseModelPages(runs)) {
      assert.equal(shouldNoindex(page.path), false);
      assert.equal(isSitemapExcluded(page.path), false);
      assert.ok(documentTitle(page.path).endsWith(' · AMDai'));
      const desc = pageDescription(page.path);
      assert.match(desc, /estimate/i);
      assert.doesNotMatch(desc, /Qwen2\.5|Qwen3-8B/);
      assert.doesNotMatch(desc, /\$\d/);
    }
  });
});
