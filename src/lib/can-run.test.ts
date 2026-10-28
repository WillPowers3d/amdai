import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compute, formatGiB } from './calculator';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { runs } from './run-card-data';
import { isSitemapExcluded, shouldNoindex } from './seo';
import { primaryNav } from './site';
import {
  CAN_RUN_ENGINE,
  CAN_RUN_GPU_IDS,
  CAN_RUN_HUB,
  CAN_RUN_MODEL_IDS,
  CAN_RUN_PUBLISHED,
  CAN_RUN_UNMEASURED,
  assertCanRunValid,
  canRunBlob,
  canRunCalcInput,
  canRunHubRows,
  canRunPairPage,
  canRunPairPages,
  canRunPairPath,
  canRunRedirects,
  canRunSeoRows,
  canRunVerdict,
  isCanRunPairPath,
  parseCanRunPicker,
  parseCanRunSlug,
} from './can-run';

const here = dirname(fileURLToPath(import.meta.url));

describe('can-run GPU × model fit', () => {
  it('covers cited sheets × cited models and keeps house rules', () => {
    assert.deepEqual(assertCanRunValid(runs), []);
    assert.equal(CAN_RUN_PUBLISHED, '2026-10-14');
    assert.equal(CAN_RUN_ENGINE, 'llama.cpp');
    assert.equal(CAN_RUN_HUB, '/can-run');
    assert.equal(canRunPairPages().length, CAN_RUN_MODEL_IDS.length * CAN_RUN_GPU_IDS.length);
    assert.equal(canRunPairPath('qwen36', 'rx7900xtx'), '/can-run/qwen36-35b-on-rx-7900-xtx');
    assert.deepEqual(parseCanRunSlug('qwen36-35b-on-rx-7900-xtx'), { modelId: 'qwen36', gpuId: 'rx7900xtx' });
    assert.deepEqual(parseCanRunSlug('flash-on-r9700'), { modelId: 'flash', gpuId: 'r9700' });
    assert.equal(parseCanRunSlug('not-a-pair'), null);
    assert.equal(isCanRunPairPath('/can-run/qwen36-35b-on-rx-7900-xtx'), true);
    assert.equal(isCanRunPairPath('/can-run'), false);
    assert.equal(canRunVerdict('qwen36', 'r9700'), 'fits-fully');
    assert.notEqual(canRunVerdict('flash', 'rx7800xt'), 'fits-fully');
  });

  it('reuses calculator fit cells and labels Q3', () => {
    const page = canRunPairPage('qwen36', 'rx7900xtx', runs);
    assert.equal(page.rows.length, 4);
    const q3 = page.rows.find((row) => row.step === 'Q3');
    assert.ok(q3);
    assert.equal(q3.kind, 'q3-estimate');
    for (const row of page.rows) {
      for (const cell of row.one) {
        const live = compute(canRunCalcInput(page.modelId, page.gpuId, row.quantId, cell.context, 1));
        assert.equal(cell.totalGb, `${formatGiB(live.totalGiB)} GB`);
        assert.equal(cell.verdict, live.verdict);
      }
    }
    const blob = canRunBlob(page);
    assert.ok(blob.includes(RAM_MIN_LABEL));
    assert.ok(blob.includes(RAM_FULL_LABEL));
    assert.ok(blob.includes(CAN_RUN_UNMEASURED));
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b\d+(?:\.\d+)?\s*tok\/s\b/i);
    assert.doesNotMatch(blob, /\$\d|\bMSRP\b/);
    const r9700 = canRunPairPage('qwen36', 'r9700', runs);
    const q5 = r9700.rows.find((row) => row.quant === 'UD-Q5_K_XL');
    const cell = q5?.one.find((item) => item.context === 4096);
    assert.match(cell?.speed ?? '', /tok\/s/);
    assert.equal(cell?.speedKind, 'measured');
    assert.ok(cell?.runIds.length);
  });

  it('wires the hub, sitemap, and picker', () => {
    const hub = readFileSync(join(here, '../pages/can-run/index.astro'), 'utf8');
    const pair = readFileSync(join(here, '../pages/can-run/[slug].astro'), 'utf8');
    const start = readFileSync(join(here, '../pages/start.astro'), 'utf8');
    const faq = readFileSync(join(here, './faq.ts'), 'utf8');
    assert.match(hub, /can-run-picker/);
    assert.match(hub, /canRunHubRows/);
    assert.match(hub, /NextSteps/);
    assert.match(pair, /canRunPairPage/);
    assert.match(pair, /SystemRamNeed/);
    assert.match(pair, /RAM_MIN_LABEL/);
    assert.match(hub, /RAM_MIN_LABEL/);
    assert.match(pair, /BuyButtons/);
    assert.match(pair, /NextStepBuyBox/);
    assert.match(pair, /CAN_RUN_NEXT_STEP_SRC/);
    assert.match(pair, /CAN_RUN_FOOTER_SRC/);
    assert.match(pair, /OpenInStackLab/);
    assert.doesNotMatch(hub, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(pair, /Qwen2\.5|Qwen3-8B/);
    assert.match(start, /\/can-run/);
    assert.match(faq, /\/can-run/);
    assert.equal(shouldNoindex('/can-run'), false);
    assert.equal(shouldNoindex('/can-run/qwen36-35b-on-rx-7900-xtx'), false);
    assert.equal(isSitemapExcluded('/can-run'), false);
    assert.equal(isSitemapExcluded('/can-run/qwen36-35b-on-rx-7900-xtx'), false);
    assert.ok(primaryNav.some((item) => item.href === '/can-run'));
    const grid = canRunHubRows();
    assert.equal(grid.length, CAN_RUN_MODEL_IDS.length);
    const picked = parseCanRunPicker('?model=qwen36&gpu=rx7900xtx');
    assert.equal(picked.href, '/can-run/qwen36-35b-on-rx-7900-xtx');
    const seo = canRunSeoRows();
    assert.ok(seo.some((row) => row.path === '/can-run'));
    assert.ok(seo.some((row) => row.path === '/can-run/qwen36-35b-on-rx-7900-xtx'));
    const redirects = canRunRedirects();
    assert.equal(redirects['/can-run/qwen36-on-rx-7900-xtx'], '/can-run/qwen36-35b-on-rx-7900-xtx');
  });
});
