import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DIMM_KIT_GB, compute, formatGiB } from './calculator';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { runs } from './run-card-data';
import { documentTitle, isSitemapExcluded, pageDescription, shouldNoindex } from './seo';
import { COMPARE_Q3, COMPARE_Q3_CITE } from './local-desktop-compare';
import {
  GPU_COMPARE_ENGINE,
  GPU_COMPARE_FEATURED_PAIRS,
  GPU_COMPARE_HUB,
  GPU_COMPARE_HUB_LEAD,
  GPU_COMPARE_IDS,
  GPU_COMPARE_MODEL,
  GPU_COMPARE_PUBLISHED,
  assertGpuCompareValid,
  canonicalizeGpuComparePair,
  gpuCompareBlob,
  gpuCompareCalcInput,
  gpuCompareFeaturedPages,
  gpuCompareHrefs,
  gpuCompareIdFromInput,
  gpuCompareLinksFor,
  gpuComparePairPage,
  gpuComparePairPages,
  gpuComparePairPath,
  gpuCompareRedirects,
  gpuCompareSeoRows,
  isFeaturedGpuComparePair,
  isGpuComparePairPath,
  parseGpuComparePicker,
  parseGpuCompareSlug,
} from './gpu-compare';

describe('GPU vs GPU compare', () => {
  it('covers the sheet catalog and keeps house rules', () => {
    assert.deepEqual(assertGpuCompareValid(runs), []);
    assert.deepEqual(
      [...GPU_COMPARE_IDS],
      ['r9700', 'rx7900xtx', 'rx7900xt', 'rx9070xt', 'rx9060xt', 'rx7900gre', 'rx7800xt', 'rx7700xt', 'rx7600xt', 'rx7600', 'rx6800xt', 'rx6700xt', 'strix-halo'],
    );
    assert.equal(GPU_COMPARE_PUBLISHED, '2026-10-14');
    assert.equal(GPU_COMPARE_MODEL, 'Qwen3.6-35B-A3B');
    assert.equal(GPU_COMPARE_ENGINE, 'llama.cpp');
    assert.equal(COMPARE_Q3, 'UD-Q3_K_XL');
    assert.match(COMPARE_Q3_CITE, /16\.8 GB/);
    assert.equal(GPU_COMPARE_HUB, '/compare/gpus');
    assert.equal(gpuComparePairPages().length, 78);
    assert.equal(gpuCompareFeaturedPages().length, GPU_COMPARE_FEATURED_PAIRS.length);
    assert.equal(gpuComparePairPath('r9700', 'rx9070xt'), '/compare/r9700-vs-rx-9070-xt');
    assert.equal(gpuComparePairPath('rx9070xt', 'r9700'), '/compare/r9700-vs-rx-9070-xt');
    assert.equal(gpuComparePairPath('r9700', 'rx7900xtx'), '/compare/r9700-vs-rx-7900-xtx');
    assert.equal(gpuComparePairPath('rx7900xtx', 'rx7900xt'), '/compare/rx-7900-xtx-vs-rx-7900-xt');
    assert.equal(gpuComparePairPath('rx7800xt', 'rx7700xt'), '/compare/rx-7800-xt-vs-rx-7700-xt');
    assert.equal(gpuComparePairPath('rx7900gre', 'rx9070xt'), '/compare/rx-9070-xt-vs-rx-7900-gre');
    assert.equal(gpuComparePairPath('rx6800xt', 'rx7700xt'), '/compare/rx-7700-xt-vs-rx-6800-xt');
    assert.deepEqual(canonicalizeGpuComparePair('rx9070xt', 'r9700'), ['r9700', 'rx9070xt']);
    assert.deepEqual(parseGpuCompareSlug('r9700-vs-rx-9070-xt'), ['r9700', 'rx9070xt']);
    assert.equal(parseGpuCompareSlug('gpus'), null);
    assert.equal(isGpuComparePairPath('/compare/r9700-vs-rx-9070-xt'), true);
    assert.equal(isGpuComparePairPath('/compare/gpus'), false);
    assert.equal(isGpuComparePairPath('/compare/radeon-vs-nvidia'), false);
    assert.equal(gpuCompareIdFromInput('rx-9070-xt'), 'rx9070xt');
    assert.equal(gpuCompareIdFromInput('r9700'), 'r9700');
    assert.equal(isFeaturedGpuComparePair('r9700', 'rx9070xt'), true);
  });

  it('uses calculator estimates, labels Q3, and cites R9700 measured cells only', () => {
    const pages = gpuComparePairPages(runs);
    for (const page of pages) {
      assert.equal(page.fitRows.length, 4);
      const q3 = page.fitRows.find((row) => row.quant === COMPARE_Q3);
      assert.ok(q3);
      assert.equal(q3.kind, 'q3-estimate');
      assert.match(q3.kindLabel, /estimate/i);
      for (const row of page.fitRows) {
        assert.equal(row.left.length, 2);
        assert.equal(row.right.length, 2);
        for (const cell of [...row.left, ...row.right]) {
          const side = row.left.includes(cell) ? page.left : page.right;
          const live = compute(gpuCompareCalcInput(side.id, row.quantId, cell.context));
          assert.equal(cell.totalGb, `${formatGiB(live.totalGiB)} GB`);
          assert.equal(cell.verdict, live.verdict);
        }
      }
      assert.ok((DIMM_KIT_GB as readonly number[]).includes(page.left.ramNeed.atSelected.kitGb));
      assert.ok((DIMM_KIT_GB as readonly number[]).includes(page.right.ramNeed.atFullContext.kitGb));

      const blob = gpuCompareBlob(page);
      assert.ok(blob.includes(RAM_MIN_LABEL));
      assert.ok(blob.includes(RAM_FULL_LABEL));
      assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
      assert.doesNotMatch(blob, /\$\d|\bMSRP\b/);
      assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
      assert.match(blob, /llama\.cpp/i);

      const hrefs = gpuCompareHrefs(page);
      assert.ok(hrefs.includes(GPU_COMPARE_HUB));
      assert.ok(hrefs.includes(page.left.path));
      assert.ok(hrefs.includes(page.right.path));
    }

    const r9700vs9070 = gpuComparePairPage('r9700', 'rx9070xt', runs);
    const q5 = r9700vs9070.fitRows.find((row) => row.quant === 'Q5_K_M');
    const q3 = r9700vs9070.fitRows.find((row) => row.quant === COMPARE_Q3);
    const r9700q5 = q5?.left.find((cell) => cell.context === 4096);
    assert.equal(r9700q5?.speedKind, 'measured');
    assert.match(r9700q5?.speed ?? '', /tok\/s/);
    assert.ok(r9700q5?.runIds.length);
    assert.equal(q3?.left[0]?.speed, 'not measured');
    assert.match(q3?.left[0]?.note ?? '', /estimate/i);
    assert.ok(q5?.right.every((cell) => cell.speed === 'not measured'));
    assert.equal(r9700vs9070.left.vramLabel, '32 GB');
    assert.equal(r9700vs9070.right.vramLabel, '16 GB');
    assert.equal(r9700vs9070.left.gfx, 'gfx1201');
    assert.equal(r9700vs9070.right.gfx, 'gfx1201');
    assert.equal(r9700vs9070.left.bandwidthLabel, '640 GB/s');
    assert.equal(r9700vs9070.right.offload, true);

    const gre = gpuComparePairPage('rx7900gre', 'rx9070xt');
    assert.equal(gre.path, '/compare/rx-9070-xt-vs-rx-7900-gre');
    assert.equal(gre.left.bandwidthLabel, '640 GB/s');
    assert.equal(gre.right.bandwidthLabel, '576 GB/s');

    const halo = gpuComparePairPage('r9700', 'strix-halo');
    assert.equal(halo.right.kind, 'unified');
    assert.match(halo.right.vramLabel, /shared/i);
    assert.equal(halo.right.bandwidthLabel, 'not listed here');

    const xtx = gpuComparePairPage('rx7900xtx', 'rx7900xt');
    assert.equal(xtx.path, '/compare/rx-7900-xtx-vs-rx-7900-xt');
    assert.equal(xtx.left.vramLabel, '24 GB');
    assert.equal(xtx.right.vramLabel, '20 GB');
    assert.equal(xtx.left.gfx, 'gfx1100');
    assert.equal(xtx.right.gfx, 'gfx1100');
    assert.equal(xtx.left.support, 'official');
    assert.equal(xtx.left.bandwidthLabel, '960 GB/s');
    assert.equal(xtx.right.bandwidthLabel, '800 GB/s');

    const xt16 = gpuComparePairPage('rx7800xt', 'rx7700xt');
    assert.equal(xt16.path, '/compare/rx-7800-xt-vs-rx-7700-xt');
    assert.equal(xt16.left.vramLabel, '16 GB');
    assert.equal(xt16.right.vramLabel, '12 GB');
    assert.equal(xt16.left.gfx, 'gfx1101');
    assert.equal(xt16.left.bandwidthLabel, '624 GB/s');

    const used = gpuComparePairPage('rx6700xt', 'rx6800xt');
    assert.equal(used.left.id, 'rx6800xt');
    assert.equal(used.right.id, 'rx6700xt');
    assert.equal(used.left.support, 'unofficial');
    assert.equal(used.right.support, 'unofficial');
    assert.equal(used.left.bandwidthLabel, '512 GB/s');
    assert.equal(used.right.bandwidthLabel, 'not listed here');
  });

  it('builds picker query, reverse redirects, SEO, and Compare with links', () => {
    assert.deepEqual(parseGpuComparePicker('?a=r9700&b=rx-9070-xt'), {
      a: 'r9700',
      b: 'rx9070xt',
      href: '/compare/r9700-vs-rx-9070-xt',
    });
    assert.equal(parseGpuComparePicker('?a=r9700&b=r9700').href, null);
    const redirects = gpuCompareRedirects();
    assert.equal(redirects['/compare/rx-9070-xt-vs-r9700'], '/compare/r9700-vs-rx-9070-xt');
    assert.equal(redirects['/compare/rx-7900-gre-vs-rx-9070-xt'], '/compare/rx-9070-xt-vs-rx-7900-gre');
    assert.equal(redirects['/compare/rx-6800-xt-vs-rx-7700-xt'], '/compare/rx-7700-xt-vs-rx-6800-xt');

    const links = gpuCompareLinksFor('r9700');
    assert.equal(links.length, GPU_COMPARE_IDS.length - 1);
    assert.ok(links.some((link) => link.href === '/compare/r9700-vs-rx-9070-xt' && link.featured));
    assert.ok(links.every((link) => link.href.startsWith('/compare/')));

    const seo = gpuCompareSeoRows();
    assert.ok(seo.some((row) => row.path === GPU_COMPARE_HUB));
    assert.equal(seo.length, 79);
    for (const row of seo) {
      assert.equal(shouldNoindex(row.path), false);
      assert.equal(isSitemapExcluded(row.path), false);
      assert.ok(documentTitle(row.path).endsWith(' · AMDai'));
      const desc = pageDescription(row.path);
      assert.ok(desc.length >= 70);
      assert.ok(desc.length <= 160);
      assert.match(desc, /estimate/i);
      assert.doesNotMatch(desc, /\$\d|\bMSRP\b/);
      assert.doesNotMatch(desc, /Qwen2\.5|Qwen3-8B/);
    }
    assert.match(GPU_COMPARE_HUB_LEAD, /llama\.cpp/);
    assert.ok(GPU_COMPARE_HUB_LEAD.includes(RAM_MIN_LABEL));
    assert.ok(GPU_COMPARE_HUB_LEAD.includes(RAM_FULL_LABEL));
  });
});
