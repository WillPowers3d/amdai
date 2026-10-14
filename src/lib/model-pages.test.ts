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
  CITED_MODEL_IDS,
  CONTRIBUTE_MODELS,
  HOUSE_MODEL_IDS,
  MODEL_PAGE_IDS,
  MODEL_PUBLISHED,
  NOT_YET_MEASURED,
  NO_DATA_CONTRIBUTE,
  REQUIRED_MODEL_HREFS,
  assertModelPagesValid,
  houseModelPage,
  houseModelPages,
  isCitedModelId,
  isHouseModelId,
  modelBlob,
  modelHrefs,
  modelPath,
} from './model-pages';

describe('per-model recipe pages', () => {
  it('covers house models plus cited pages and keeps contribute empty', () => {
    const pages = houseModelPages(runs);
    assert.deepEqual(assertModelPagesValid(pages), []);
    assert.deepEqual([...HOUSE_MODEL_IDS], ['qwen36', 'flash']);
    assert.deepEqual(
      [...CITED_MODEL_IDS],
      ['gpt-oss-20b', 'gemma3-27b', 'llama33-70b', 'glm-53-flash', 'qwen36-27b', 'qwen38-27b'],
    );
    assert.deepEqual(
      [...MODEL_PAGE_IDS],
      ['qwen36', 'flash', 'gpt-oss-20b', 'gemma3-27b', 'llama33-70b', 'glm-53-flash', 'qwen36-27b', 'qwen38-27b'],
    );
    assert.equal(MODEL_PUBLISHED, '2026-10-13');
    assert.equal(pages[0]?.name, 'Qwen3.6-35B-A3B');
    assert.equal(pages[1]?.name, 'Qwen 3.8 Flash');
    assert.equal(pages[2]?.name, 'gpt-oss 20B');
    assert.equal(pages[3]?.name, 'Gemma 3 27B');
    assert.equal(pages[4]?.name, 'Llama 3.3 70B');
    assert.equal(pages[5]?.name, 'GLM 5.3 Flash');
    assert.equal(pages[6]?.name, 'Qwen3.6 27B');
    assert.equal(pages[7]?.name, 'Qwen3.8 27B');
    assert.equal(isHouseModelId('qwen36'), true);
    assert.equal(isCitedModelId('gpt-oss-20b'), true);
    assert.equal(isCitedModelId('glm-53-flash'), true);
    assert.equal(isHouseModelId('glm-53-flash'), false);
    assert.equal(modelPath('qwen36'), '/models/qwen36');
    assert.equal(modelPath('flash'), '/models/flash');
    assert.equal(modelPath('gpt-oss-20b'), '/models/gpt-oss-20b');
    assert.equal(modelPath('glm-53-flash'), '/models/glm-53-flash');
    assert.equal(modelPath('qwen36-27b'), '/models/qwen36-27b');
    assert.equal(modelPath('qwen38-27b'), '/models/qwen38-27b');
    assert.equal(CONTRIBUTE_MODELS.length, 0);
    assert.deepEqual(
      MODEL_PAGES.map((row) => row.id),
      [...MODEL_PAGE_IDS],
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
      assert.equal(page.fitBadges.length, 8);
    }
  });

  it('builds cited estimate pages without invented tok/s', () => {
    for (const id of CITED_MODEL_IDS) {
      const page = houseModelPage(id, runs);
      assert.equal(page.pageKind, 'cited');
      assert.equal(page.quantFiles.length, 4);
      assert.ok(page.quantFiles.some((row) => row.kind === 'q3-estimate'));
      assert.ok(page.launches[0]?.command?.includes('llama-server'));
      assert.equal(page.launches[0]?.backend, 'llamacpp');
      assert.equal(page.ramKind, null);
      assert.ok(page.ramNeed);
      assert.ok((DIMM_KIT_GB as readonly number[]).includes(page.ramNeed.atSelected.kitGb));
      assert.ok((DIMM_KIT_GB as readonly number[]).includes(page.ramNeed.atFullContext.kitGb));
      assert.ok(page.q3Ram);
      assert.equal(page.stackLab.screen, 'doctor');
      assert.ok(page.configRows.every((row) => row.decode === NOT_YET_MEASURED));
      assert.ok(page.configRows.some((row) => row.quantKind === 'q3-estimate'));
      assert.ok(page.fitBadges.some((row) => row.gpuCount === 1));
      assert.ok(page.fitBadges.some((row) => row.gpuCount === 2));
      const blob = modelBlob(page);
      assert.ok(blob.includes(NOT_YET_MEASURED));
      assert.ok(blob.includes(RAM_MIN_LABEL));
      assert.ok(blob.includes(RAM_FULL_LABEL));
      assert.doesNotMatch(blob, /\d+(?:\.\d+)? tok\/s/);
      assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
      assert.doesNotMatch(blob, /\$\d|\bMSRP\b/);
      assert.doesNotMatch(blob, /Apache-2\.0/);
      assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
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
