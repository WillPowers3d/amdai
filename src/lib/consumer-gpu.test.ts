import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DIMM_KIT_GB, GPU_PRESETS, compute, formatGiB } from './calculator';
import { gpuCardId } from './gpu-ids';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import type { GpuDirectory } from './status';
import { COMPARE_Q3, COMPARE_Q3_CITE } from './local-desktop-compare';
import {
  CONSUMER_ENGINE,
  CONSUMER_FIT_CONTEXTS,
  CONSUMER_MODEL,
  CONSUMER_NAV_LINKS,
  CONSUMER_PUBLISHED,
  CONSUMER_RECIPE_IDS,
  CONSUMER_SPEED,
  REQUIRED_CONSUMER_HREFS,
  assertConsumerGpuValid,
  consumerBlob,
  consumerCalcInput,
  consumerHrefs,
  consumerPath,
  consumerRecipeIdFromPage,
  consumerRecipePage,
  consumerRecipePages,
  consumerShortName,
  gpuDirectoryHref,
  isConsumerRecipeGpu,
} from './consumer-gpu';
import { documentTitle, isSitemapExcluded, pageDescription, shouldNoindex } from './seo';

describe('consumer GPU recipe sheets', () => {
  it('covers only cited directory SKUs and keeps house rules', () => {
    const pages = consumerRecipePages();
    assert.deepEqual(assertConsumerGpuValid(pages), []);
    assert.deepEqual([...CONSUMER_RECIPE_IDS], ['rx7900xtx', 'rx7900xt', 'rx7800xt', 'rx9070xt', 'rx9060xt', 'rx7900gre', 'rx7700xt', 'rx7600xt', 'rx7600', 'rx6800xt', 'rx6700xt', 'rx9070', 'rx9070gre', 'rx6950xt']);
    assert.equal(CONSUMER_PUBLISHED, '2026-10-13');
    assert.equal(CONSUMER_MODEL, 'Qwen3.6-35B-A3B');
    assert.equal(CONSUMER_ENGINE, 'llama.cpp');
    assert.equal(COMPARE_Q3, 'UD-Q3_K_XL');
    assert.match(COMPARE_Q3_CITE, /16\.8 GB/);

    const gpuDirectory = parse(readFileSync(new URL('../data/gpus.yaml', import.meta.url), 'utf8')) as GpuDirectory;
    const yamlIds = new Set(gpuDirectory.cards.map((card) => gpuCardId(card)));
    const presetIds = new Set(GPU_PRESETS.map((gpu) => gpu.id));
    for (const id of CONSUMER_RECIPE_IDS) {
      assert.ok(yamlIds.has(id), id);
      assert.ok(presetIds.has(id), id);
      assert.equal(isConsumerRecipeGpu(id), true);
    }
    assert.equal(consumerPath('rx7900xtx'), '/gpus/rx-7900-xtx');
    assert.equal(consumerPath('rx7900xt'), '/gpus/rx-7900-xt');
    assert.equal(consumerPath('rx7800xt'), '/gpus/rx-7800-xt');
    assert.equal(consumerPath('rx9070xt'), '/gpus/rx-9070-xt');
    assert.equal(consumerPath('rx9060xt'), '/gpus/rx-9060-xt');
    assert.equal(consumerPath('rx7900gre'), '/gpus/rx-7900-gre');
    assert.equal(consumerPath('rx7700xt'), '/gpus/rx-7700-xt');
    assert.equal(consumerPath('rx7600xt'), '/gpus/rx-7600-xt');
    assert.equal(consumerPath('rx7600'), '/gpus/rx-7600');
    assert.equal(consumerPath('rx6800xt'), '/gpus/rx-6800-xt');
    assert.equal(consumerPath('rx6700xt'), '/gpus/rx-6700-xt');
    assert.equal(consumerPath('rx9070'), '/gpus/rx-9070');
    assert.equal(consumerPath('rx9070gre'), '/gpus/rx-9070-gre');
    assert.equal(consumerPath('rx6950xt'), '/gpus/rx-6950-xt');
    assert.equal(isConsumerRecipeGpu('r9700'), false);
    assert.equal(isConsumerRecipeGpu('rx9070xt'), true);
    assert.equal(isConsumerRecipeGpu('rx-9070-xt'), true);
    assert.equal(isConsumerRecipeGpu('rx9060xt'), true);
    assert.equal(isConsumerRecipeGpu('rx-9060-xt'), true);
    assert.equal(isConsumerRecipeGpu('rx7900gre'), true);
    assert.equal(isConsumerRecipeGpu('rx-7900-gre'), true);
    assert.equal(isConsumerRecipeGpu('rx7700xt'), true);
    assert.equal(isConsumerRecipeGpu('rx-7700-xt'), true);
    assert.equal(isConsumerRecipeGpu('rx7700'), false);
    assert.equal(isConsumerRecipeGpu('rx7600xt'), true);
    assert.equal(isConsumerRecipeGpu('rx-7600-xt'), true);
    assert.equal(isConsumerRecipeGpu('rx7600'), true);
    assert.equal(isConsumerRecipeGpu('rx-7600'), true);
    assert.equal(isConsumerRecipeGpu('rx7600-8gb'), true);
    assert.equal(isConsumerRecipeGpu('rx6800xt'), true);
    assert.equal(isConsumerRecipeGpu('rx-6800-xt'), true);
    assert.equal(isConsumerRecipeGpu('rx6800-xt'), true);
    assert.equal(isConsumerRecipeGpu('rx6700xt'), true);
    assert.equal(isConsumerRecipeGpu('rx-6700-xt'), true);
    assert.equal(isConsumerRecipeGpu('rx6700-xt'), true);
    assert.equal(isConsumerRecipeGpu('rx9070'), true);
    assert.equal(isConsumerRecipeGpu('rx-9070'), true);
    assert.equal(isConsumerRecipeGpu('rx9070gre'), true);
    assert.equal(isConsumerRecipeGpu('rx-9070-gre'), true);
    assert.equal(isConsumerRecipeGpu('rx6950xt'), true);
    assert.equal(isConsumerRecipeGpu('rx-6950-xt'), true);
    assert.equal(isConsumerRecipeGpu('rx-6900-xt'), true);
    assert.equal(isConsumerRecipeGpu('rx-7900-xtx'), true);
    assert.equal(isConsumerRecipeGpu('rx7900-xtx'), true);
    assert.equal(isConsumerRecipeGpu('rx-7900-xt'), true);
    assert.equal(isConsumerRecipeGpu('rx7900-xt'), true);
    assert.equal(isConsumerRecipeGpu('rx-7800-xt'), true);
    assert.equal(isConsumerRecipeGpu('rx7800-xt'), true);

    assert.equal(consumerShortName('rx7900xtx'), 'RX 7900 XTX');
    assert.equal(pages[0]?.vramLabel, '24 GB');
    assert.equal(pages[0]?.path, '/gpus/rx-7900-xtx');
    assert.equal(pages[0]?.support, 'official');
    assert.match(pages[0]?.lead ?? '', /355 W/);
    assert.match(pages[0]?.stack.map((tip) => tip.body).join('\n') ?? '', /Stack Lab doctor/);
    assert.doesNotMatch(pages[0]?.stack.map((tip) => tip.body).join('\n') ?? '', /no Open in Stack Lab handoff/);
    assert.equal(pages[1]?.vramLabel, '20 GB');
    assert.equal(pages[1]?.path, '/gpus/rx-7900-xt');
    assert.match(pages[1]?.lead ?? '', /315 W/);
    assert.equal(pages[2]?.vramLabel, '16 GB');
    assert.equal(pages[2]?.path, '/gpus/rx-7800-xt');
    assert.match(pages[2]?.lead ?? '', /263 W/);
    assert.equal(pages[3]?.vramLabel, '16 GB');
    assert.equal(pages[0]?.gfx, 'gfx1100');
    assert.equal(pages[1]?.gfx, 'gfx1100');
    assert.equal(pages[2]?.gfx, 'gfx1101');
    assert.equal(pages[3]?.gfx, 'gfx1201');
    assert.equal(pages[3]?.path, '/gpus/rx-9070-xt');
    assert.match(pages[3]?.lead ?? '', /gfx1201/);
    assert.doesNotMatch(pages[3]?.stack.map((tip) => tip.body).join('\n') ?? '', /gfx110x ROCm family package/);
    assert.equal(pages[4]?.vramLabel, '16 GB');
    assert.equal(pages[4]?.gfx, 'gfx1200');
    assert.equal(pages[4]?.path, '/gpus/rx-9060-xt');
    assert.match(pages[4]?.lead ?? '', /8 GB XT LP/);
    assert.match(pages[4]?.stack.map((tip) => tip.body).join('\n') ?? '', /gfx1200/);
    assert.equal(pages[5]?.vramLabel, '16 GB');
    assert.equal(pages[5]?.gfx, 'gfx1100');
    assert.equal(pages[5]?.path, '/gpus/rx-7900-gre');
    assert.match(pages[5]?.lead ?? '', /7900 XT/);
    assert.equal(pages[6]?.vramLabel, '12 GB');
    assert.equal(pages[6]?.gfx, 'gfx1101');
    assert.equal(pages[6]?.path, '/gpus/rx-7700-xt');
    assert.match(pages[6]?.lead ?? '', /7800 XT/);
    assert.equal(pages[7]?.vramLabel, '16 GB');
    assert.equal(pages[7]?.gfx, 'gfx1102');
    assert.equal(pages[7]?.path, '/gpus/rx-7600-xt');
    assert.match(pages[7]?.lead ?? '', /8 GB RX 7600/);
    assert.equal(pages[8]?.vramLabel, '8 GB');
    assert.equal(pages[8]?.gfx, 'gfx1102');
    assert.equal(pages[8]?.path, '/gpus/rx-7600');
    assert.match(pages[8]?.lead ?? '', /16 GB RX 7600 XT/);
    assert.equal(pages[9]?.vramLabel, '16 GB');
    assert.equal(pages[9]?.gfx, 'gfx1030');
    assert.equal(pages[9]?.path, '/gpus/rx-6800-xt');
    assert.equal(pages[9]?.support, 'unofficial');
    assert.match(pages[9]?.lead ?? '', /W6800/);
    assert.equal(pages[10]?.vramLabel, '12 GB');
    assert.equal(pages[10]?.gfx, 'gfx1031');
    assert.equal(pages[10]?.path, '/gpus/rx-6700-xt');
    assert.equal(pages[10]?.support, 'unofficial');
    assert.match(pages[10]?.lead ?? '', /230 W/);
    assert.equal(pages[11]?.vramLabel, '16 GB');
    assert.equal(pages[11]?.gfx, 'gfx1201');
    assert.equal(pages[11]?.path, '/gpus/rx-9070');
    assert.equal(pages[11]?.support, 'official');
    assert.match(pages[11]?.lead ?? '', /220 W/);
    assert.equal(pages[12]?.vramLabel, '12 GB');
    assert.equal(pages[12]?.gfx, 'gfx1201');
    assert.equal(pages[12]?.path, '/gpus/rx-9070-gre');
    assert.match(pages[12]?.lead ?? '', /432 GB/);
    assert.equal(pages[13]?.vramLabel, '16 GB');
    assert.equal(pages[13]?.gfx, 'gfx1030');
    assert.equal(pages[13]?.path, '/gpus/rx-6950-xt');
    assert.equal(pages[13]?.support, 'unofficial');
    assert.match(pages[13]?.lead ?? '', /335 W/);
    assert.match(pages[13]?.lead ?? '', /6900 XT/);
  });

  it('uses calculator estimates and leaves speed not measured', () => {
    for (const page of consumerRecipePages()) {
      assert.equal(page.fitRows.length, 4);
      const q3 = page.fitRows.find((row) => row.quant === COMPARE_Q3);
      assert.ok(q3);
      assert.equal(q3.kind, 'q3-estimate');
      assert.match(q3.kindLabel, /estimate/i);
      assert.equal(q3.speed, CONSUMER_SPEED);
      for (const row of page.fitRows) {
        assert.equal(row.cells.length, CONSUMER_FIT_CONTEXTS.length);
        for (const cell of row.cells) {
          assert.equal(cell.speed, 'not measured');
          const live = compute(consumerCalcInput(page.id, row.quantId, cell.context));
          assert.equal(cell.totalGb, `${formatGiB(live.totalGiB)} GB`);
          assert.equal(cell.verdict, live.verdict);
          assert.equal(live.tested, null);
        }
      }
      assert.equal(page.ramNeed.atSelected.label, 'estimate');
      assert.equal(page.ramNeed.atFullContext.label, 'estimate');
      assert.ok((DIMM_KIT_GB as readonly number[]).includes(page.ramNeed.atSelected.kitGb));
      assert.ok((DIMM_KIT_GB as readonly number[]).includes(page.ramNeed.atFullContext.kitGb));
      assert.equal(page.ramNeed.atSelected.measured, false);

      const blob = consumerBlob(page);
      assert.match(blob, /not measured on the local desktop/i);
      assert.match(blob, /Radeon AI PRO R9700/);
      assert.ok(blob.includes(RAM_MIN_LABEL));
      assert.ok(blob.includes(RAM_FULL_LABEL));
      assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
      assert.doesNotMatch(blob, /\$\d|\bMSRP\b/);
      assert.doesNotMatch(blob, /qwen-reliable|qwen-fast-agent/);
      assert.doesNotMatch(blob, /\btok\/s\b/);

      const hrefs = consumerHrefs(page);
      for (const required of REQUIRED_CONSUMER_HREFS) {
        assert.ok(hrefs.includes(required), `${page.id} ${required}`);
      }
      assert.ok(page.matrixHref.includes('compatibility-matrix'));
    }

    const xtx4kQ4 = compute(consumerCalcInput('rx7900xtx', 'q4_k_m', 4096));
    const xt16Q4 = compute(consumerCalcInput('rx7800xt', 'q4_k_m', 4096));
    const xt9070 = compute(consumerCalcInput('rx9070xt', 'q4_k_m', 4096));
    const xt9060 = compute(consumerCalcInput('rx9060xt', 'q4_k_m', 4096));
    assert.ok(xt16Q4.verdict === 'no');
    assert.ok(xt9070.verdict === 'no');
    assert.ok(xt9060.verdict === 'no');
    assert.equal(consumerRecipeIdFromPage('rx-9060-xt'), 'rx9060xt');
    assert.equal(gpuDirectoryHref('rx9060xt'), '/gpus/rx-9060-xt');
    assert.equal(consumerRecipeIdFromPage('rx-7900-gre'), 'rx7900gre');
    assert.equal(gpuDirectoryHref('rx7900gre'), '/gpus/rx-7900-gre');
    assert.equal(consumerRecipeIdFromPage('rx-7700-xt'), 'rx7700xt');
    assert.equal(gpuDirectoryHref('rx7700xt'), '/gpus/rx-7700-xt');
    assert.equal(consumerRecipeIdFromPage('rx-7600-xt'), 'rx7600xt');
    assert.equal(gpuDirectoryHref('rx7600xt'), '/gpus/rx-7600-xt');
    assert.equal(consumerRecipeIdFromPage('rx-7600'), 'rx7600');
    assert.equal(gpuDirectoryHref('rx7600'), '/gpus/rx-7600');
    const xt7600q4 = compute(consumerCalcInput('rx7600xt', 'q4_k_m', 4096));
    assert.ok(xt7600q4.verdict === 'no');
    const bare7600q4 = compute(consumerCalcInput('rx7600', 'q4_k_m', 4096));
    assert.ok(bare7600q4.verdict === 'no');
    const xt7700 = compute(consumerCalcInput('rx7700xt', 'q4_k_m', 4096));
    assert.ok(xt7700.verdict === 'no');
    assert.equal(consumerRecipeIdFromPage('rx-6800-xt'), 'rx6800xt');
    assert.equal(gpuDirectoryHref('rx6800xt'), '/gpus/rx-6800-xt');
    const xt6800 = compute(consumerCalcInput('rx6800xt', 'q4_k_m', 4096));
    assert.ok(xt6800.verdict === 'no');
    assert.equal(consumerRecipeIdFromPage('rx-6700-xt'), 'rx6700xt');
    assert.equal(gpuDirectoryHref('rx6700xt'), '/gpus/rx-6700-xt');
    const xt6700 = compute(consumerCalcInput('rx6700xt', 'q4_k_m', 4096));
    assert.ok(xt6700.verdict === 'no');
    assert.equal(consumerRecipeIdFromPage('rx-9070'), 'rx9070');
    assert.equal(gpuDirectoryHref('rx9070'), '/gpus/rx-9070');
    const bare9070 = compute(consumerCalcInput('rx9070', 'q4_k_m', 4096));
    assert.ok(bare9070.verdict === 'no');
    assert.equal(consumerRecipeIdFromPage('rx-9070-gre'), 'rx9070gre');
    assert.equal(gpuDirectoryHref('rx9070gre'), '/gpus/rx-9070-gre');
    const gre9070 = compute(consumerCalcInput('rx9070gre', 'q4_k_m', 4096));
    assert.ok(gre9070.verdict === 'no');
    assert.equal(consumerRecipeIdFromPage('rx-6900-xt'), 'rx6950xt');
    assert.equal(gpuDirectoryHref('rx6950xt'), '/gpus/rx-6950-xt');
    const xt6950 = compute(consumerCalcInput('rx6950xt', 'q4_k_m', 4096));
    assert.ok(xt6950.verdict === 'no');
    const gre4k = compute(consumerCalcInput('rx7900gre', 'q4_k_m', 4096));
    assert.ok(gre4k.verdict === 'no');
    assert.ok(xtx4kQ4.weightsGiB > 0);
    assert.ok(CONSUMER_NAV_LINKS.every((link) => link.href.startsWith('/gpus/')));
    assert.equal(consumerRecipeIdFromPage('rx-9070-xt'), 'rx9070xt');
    assert.equal(gpuDirectoryHref('rx9070xt'), '/gpus/rx-9070-xt');
    assert.equal(consumerRecipeIdFromPage('rx-7900-xtx'), 'rx7900xtx');
    assert.equal(gpuDirectoryHref('rx7900xtx'), '/gpus/rx-7900-xtx');
    assert.equal(consumerRecipeIdFromPage('rx-7900-xt'), 'rx7900xt');
    assert.equal(gpuDirectoryHref('rx7900xt'), '/gpus/rx-7900-xt');
    assert.equal(consumerRecipeIdFromPage('rx-7800-xt'), 'rx7800xt');
    assert.equal(gpuDirectoryHref('rx7800xt'), '/gpus/rx-7800-xt');
  });

  it('has unique SEO without pretending the cards were measured', () => {
    for (const page of consumerRecipePages()) {
      assert.equal(shouldNoindex(page.path), false);
      assert.equal(isSitemapExcluded(page.path), false);
      assert.ok(documentTitle(page.path).endsWith(' · AMDai'));
      const desc = pageDescription(page.path);
      assert.match(desc, /estimate/i);
      assert.match(desc, /not measured on the local desktop/i);
      assert.doesNotMatch(desc, /tok\/s/);
    }
  });
});
