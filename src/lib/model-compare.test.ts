import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DIMM_KIT_GB, compute, formatGiB } from './calculator';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { runs } from './run-card-data';
import { documentTitle, isSitemapExcluded, pageDescription, shouldNoindex } from './seo';
import {
  MODEL_COMPARE_ENGINE,
  MODEL_COMPARE_FEATURED_PAIRS,
  MODEL_COMPARE_FIT_GPUS,
  MODEL_COMPARE_HUB,
  MODEL_COMPARE_HUB_LEAD,
  MODEL_COMPARE_IDS,
  MODEL_COMPARE_PUBLISHED,
  assertModelCompareValid,
  canonicalizeModelComparePair,
  modelCompareBlob,
  modelCompareCalcInput,
  modelCompareFeaturedPages,
  modelCompareHrefs,
  modelCompareIdFromInput,
  modelCompareLinksFor,
  modelComparePairPage,
  modelComparePairPages,
  modelComparePairPath,
  modelCompareRedirects,
  modelCompareSeoRows,
  isFeaturedModelComparePair,
  isModelComparePairPath,
  parseModelComparePicker,
  parseModelCompareSlug,
} from './model-compare';

describe('model vs model compare', () => {
  it('covers the cited /models catalog and keeps house rules', () => {
    assert.deepEqual(assertModelCompareValid(runs), []);
    assert.deepEqual(
      [...MODEL_COMPARE_IDS],
      ['qwen36', 'flash', 'gpt-oss-20b', 'gemma3-27b', 'llama33-70b', 'glm-53-flash', 'qwen36-27b', 'qwen38-27b'],
    );
    assert.equal(MODEL_COMPARE_PUBLISHED, '2026-10-14');
    assert.equal(MODEL_COMPARE_ENGINE, 'llama.cpp');
    assert.equal(MODEL_COMPARE_HUB, '/compare/models');
    assert.equal(modelComparePairPages().length, 28);
    assert.equal(modelCompareFeaturedPages().length, MODEL_COMPARE_FEATURED_PAIRS.length);
    assert.equal(modelComparePairPath('qwen36', 'glm-53-flash'), '/compare/models/qwen36-vs-glm-53-flash');
    assert.equal(modelComparePairPath('glm-53-flash', 'qwen36'), '/compare/models/qwen36-vs-glm-53-flash');
    assert.equal(modelComparePairPath('qwen36', 'flash'), '/compare/models/qwen36-vs-flash');
    assert.equal(modelComparePairPath('qwen36-27b', 'qwen38-27b'), '/compare/models/qwen36-27b-vs-qwen38-27b');
    assert.deepEqual(canonicalizeModelComparePair('glm-53-flash', 'qwen36'), ['qwen36', 'glm-53-flash']);
    assert.deepEqual(parseModelCompareSlug('qwen36-vs-glm-53-flash'), ['qwen36', 'glm-53-flash']);
    assert.equal(parseModelCompareSlug('models'), null);
    assert.equal(isModelComparePairPath('/compare/models/qwen36-vs-flash'), true);
    assert.equal(isModelComparePairPath('/compare/models'), false);
    assert.equal(isModelComparePairPath('/compare/qwen36-vs-flash'), false);
    assert.equal(modelCompareIdFromInput('glm-53-flash'), 'glm-53-flash');
    assert.equal(modelCompareIdFromInput('qwen36'), 'qwen36');
    assert.equal(isFeaturedModelComparePair('qwen36', 'glm-53-flash'), true);
  });

  it('uses calculator estimates, labels Q3, and cites R9700 35B cells only', () => {
    const pages = modelComparePairPages(runs);
    for (const page of pages) {
      assert.equal(page.gpuBlocks.length, MODEL_COMPARE_FIT_GPUS.length);
      for (const block of page.gpuBlocks) {
        assert.equal(block.rows.length, 4);
        const q3 = block.rows.find((row) => row.step === 'Q3');
        assert.ok(q3);
        assert.equal(q3.kind, 'q3-estimate');
        assert.match(q3.kindLabel, /estimate/i);
        for (const row of block.rows) {
          assert.equal(row.left.length, 2);
          assert.equal(row.right.length, 2);
          for (const cell of row.left) {
            const live = compute(modelCompareCalcInput(page.left.id, block.gpuId, row.leftQuantId, cell.context));
            assert.equal(cell.totalGb, `${formatGiB(live.totalGiB)} GB`);
            assert.equal(cell.verdict, live.verdict);
          }
          for (const cell of row.right) {
            const live = compute(modelCompareCalcInput(page.right.id, block.gpuId, row.rightQuantId, cell.context));
            assert.equal(cell.totalGb, `${formatGiB(live.totalGiB)} GB`);
            assert.equal(cell.verdict, live.verdict);
          }
        }
      }
      assert.ok((DIMM_KIT_GB as readonly number[]).includes(page.left.ramNeed.atSelected.kitGb));
      assert.ok((DIMM_KIT_GB as readonly number[]).includes(page.right.ramNeed.atFullContext.kitGb));

      const blob = modelCompareBlob(page);
      assert.ok(blob.includes(RAM_MIN_LABEL));
      assert.ok(blob.includes(RAM_FULL_LABEL));
      assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
      assert.doesNotMatch(blob, /\$\d|\bMSRP\b/);
      assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
      assert.match(blob, /llama\.cpp/i);
      assert.doesNotMatch(blob, /floor is q4/i);

      const hrefs = modelCompareHrefs(page);
      assert.ok(hrefs.includes(MODEL_COMPARE_HUB));
      assert.ok(hrefs.includes(page.left.path));
      assert.ok(hrefs.includes(page.right.path));
      assert.ok(hrefs.includes('/benchmarks'));
      assert.ok(hrefs.includes('/stack-lab'));
    }

    const qwenVsGlm = modelComparePairPage('qwen36', 'glm-53-flash', runs);
    assert.equal(qwenVsGlm.path, '/compare/models/qwen36-vs-glm-53-flash');
    assert.equal(qwenVsGlm.left.paramsLine, '35B total / 3B active');
    assert.equal(qwenVsGlm.right.paramsLine, '320B total / 18B active');
    assert.equal(qwenVsGlm.left.contextTokens, 262144);
    assert.equal(qwenVsGlm.right.contextTokens, 1048576);
    assert.equal(qwenVsGlm.q3Left, 'UD-Q3_K_XL');
    assert.equal(qwenVsGlm.q3Right, 'UD-Q3_K_XL');
    const r9700 = qwenVsGlm.gpuBlocks.find((block) => block.gpuId === 'r9700');
    const q5 = r9700?.rows.find((row) => row.step === 'Q5');
    const q3 = r9700?.rows.find((row) => row.step === 'Q3');
    const r9700q5 = q5?.left.find((cell) => cell.context === 4096);
    assert.equal(r9700q5?.speedKind, 'measured');
    assert.match(r9700q5?.speed ?? '', /tok\/s/);
    assert.ok(r9700q5?.runIds.length);
    assert.equal(q3?.left[0]?.speed, 'not measured');
    assert.match(q3?.left[0]?.note ?? '', /estimate/i);
    assert.ok(q5?.right.every((cell) => cell.speed === 'not measured'));
    assert.ok(qwenVsGlm.right.offload);

    const flash = modelComparePairPage('qwen36', 'flash', runs);
    assert.equal(flash.path, '/compare/models/qwen36-vs-flash');
    assert.equal(flash.right.paramsLine, '125B total / 6B active');
    assert.ok(flash.left.launches.some((row) => row.href.includes('/recipes/')));
    assert.ok(flash.stackLab.some((row) => row.screen === 'doctor'));
    assert.ok(flash.stackLab.some((row) => row.id === 'qwen-reliable'));

    const cited = modelComparePairPage('gpt-oss-20b', 'gemma3-27b');
    assert.equal(cited.path, '/compare/models/gpt-oss-20b-vs-gemma3-27b');
    assert.ok(cited.left.launches.some((row) => row.command?.includes('llama-server')));
    assert.ok(cited.stackLab.every((row) => row.screen === 'doctor'));
    assert.ok(cited.gpuBlocks.every((block) => block.rows.every((row) => row.left.every((cell) => cell.speed === 'not measured'))));
  });

  it('builds picker query, reverse redirects, SEO, and Compare with links', () => {
    assert.deepEqual(parseModelComparePicker('?a=qwen36&b=glm-53-flash'), {
      a: 'qwen36',
      b: 'glm-53-flash',
      href: '/compare/models/qwen36-vs-glm-53-flash',
    });
    assert.equal(parseModelComparePicker('?a=qwen36&b=qwen36').href, null);
    const redirects = modelCompareRedirects();
    assert.equal(redirects['/compare/models/glm-53-flash-vs-qwen36'], '/compare/models/qwen36-vs-glm-53-flash');
    assert.equal(redirects['/compare/models/flash-vs-qwen36'], '/compare/models/qwen36-vs-flash');

    const links = modelCompareLinksFor('qwen36');
    assert.equal(links.length, MODEL_COMPARE_IDS.length - 1);
    assert.ok(links.some((link) => link.href === '/compare/models/qwen36-vs-glm-53-flash' && link.featured));
    assert.ok(links.every((link) => link.href.startsWith('/compare/models/')));

    const seo = modelCompareSeoRows();
    assert.ok(seo.some((row) => row.path === MODEL_COMPARE_HUB));
    assert.equal(seo.length, 29);
    for (const row of seo) {
      assert.equal(shouldNoindex(row.path), false);
      assert.equal(isSitemapExcluded(row.path), false);
      assert.ok(documentTitle(row.path).endsWith(' · AMDai'));
      const desc = pageDescription(row.path);
      assert.ok(desc.length >= 70, `${row.path} ${desc.length}`);
      assert.ok(desc.length <= 160, `${row.path} ${desc.length}`);
      assert.match(desc, /estimate/i);
      assert.doesNotMatch(desc, /\$\d|\bMSRP\b/);
      assert.doesNotMatch(desc, /Qwen2\.5|Qwen3-8B/);
    }
    assert.match(MODEL_COMPARE_HUB_LEAD, /llama\.cpp/);
    assert.ok(MODEL_COMPARE_HUB_LEAD.includes(RAM_MIN_LABEL));
    assert.ok(MODEL_COMPARE_HUB_LEAD.includes(RAM_FULL_LABEL));
  });
});
