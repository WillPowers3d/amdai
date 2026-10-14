import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DIMM_KIT_GB, GPU_PRESETS, compute, formatGiB } from './calculator';
import { gpuCardId } from './gpu-ids';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import type { GpuDirectory } from './status';
import { COMPARE_Q3, COMPARE_Q3_CITE } from './local-desktop-compare';
import { documentTitle, isSitemapExcluded, pageDescription, shouldNoindex } from './seo';
import {
  AMD_W7800_48,
  AMD_W7900,
  REQUIRED_WORKSTATION_HREFS,
  WORKSTATION_ENGINE,
  WORKSTATION_FIT_CONTEXTS,
  WORKSTATION_MODEL_IDS,
  WORKSTATION_NAV_LINKS,
  WORKSTATION_PUBLISHED,
  WORKSTATION_RECIPE_IDS,
  WORKSTATION_SPEED,
  assertWorkstationGpuValid,
  isWorkstationRecipeGpu,
  workstationBlob,
  workstationCalcInput,
  workstationHrefs,
  workstationPath,
  workstationRecipeIdFromPage,
  workstationRecipePage,
  workstationRecipePages,
  workstationShortName,
} from './workstation-gpu';

describe('workstation PRO GPU recipe sheets', () => {
  it('covers the four cited directory SKUs and keeps house rules', () => {
    const pages = workstationRecipePages();
    assert.deepEqual(assertWorkstationGpuValid(pages), []);
    assert.deepEqual([...WORKSTATION_RECIPE_IDS], ['w7900', 'w7800', 'w7700', 'w6800']);
    assert.equal(WORKSTATION_PUBLISHED, '2026-10-14');
    assert.equal(WORKSTATION_ENGINE, 'llama.cpp');
    assert.equal(COMPARE_Q3, 'UD-Q3_K_XL');
    assert.match(COMPARE_Q3_CITE, /16\.8 GB/);

    const gpuDirectory = parse(readFileSync(new URL('../data/gpus.yaml', import.meta.url), 'utf8')) as GpuDirectory;
    const yamlIds = new Set(gpuDirectory.cards.map((card) => gpuCardId(card)));
    const presetIds = new Set(GPU_PRESETS.map((gpu) => gpu.id));
    for (const id of WORKSTATION_RECIPE_IDS) {
      assert.ok(yamlIds.has(id), id);
      assert.ok(presetIds.has(id), id);
      assert.equal(isWorkstationRecipeGpu(id), true);
    }
    assert.equal(workstationPath('w7900'), '/gpus/w7900');
    assert.equal(workstationPath('w7800'), '/gpus/w7800');
    assert.equal(workstationPath('w7700'), '/gpus/w7700');
    assert.equal(workstationPath('w6800'), '/gpus/w6800');
    assert.equal(isWorkstationRecipeGpu('r9700'), false);
    assert.equal(isWorkstationRecipeGpu('rx6800xt'), false);
    assert.equal(isWorkstationRecipeGpu('w-7900'), true);
    assert.equal(isWorkstationRecipeGpu('radeon-pro-w6800'), true);
    assert.equal(workstationRecipeIdFromPage('pro-w7700'), 'w7700');
    assert.equal(workstationShortName('w7900'), 'PRO W7900');

    assert.equal(pages[0]?.vramLabel, '48 GB');
    assert.equal(pages[0]?.gfx, 'gfx1100');
    assert.equal(pages[0]?.bandwidthLabel, '864 GB/s');
    assert.match(pages[0]?.lead ?? '', /295 W/);
    assert.match(pages[0]?.lead ?? '', /triple-slot/);
    assert.equal(pages[1]?.vramLabel, '32 GB');
    assert.equal(pages[1]?.gfx, 'gfx1100');
    assert.equal(pages[1]?.bandwidthLabel, '576 GB/s');
    assert.match(pages[1]?.lead ?? '', /260 W/);
    assert.match(pages[1]?.variantNote ?? '', /48 GB/);
    assert.equal(pages[1]?.variantHref, AMD_W7800_48);
    assert.equal(pages[2]?.vramLabel, '16 GB');
    assert.equal(pages[2]?.gfx, 'gfx1101');
    assert.equal(pages[2]?.bandwidthLabel, '576 GB/s');
    assert.match(pages[2]?.lead ?? '', /190 W/);
    assert.equal(pages[3]?.vramLabel, '32 GB');
    assert.equal(pages[3]?.gfx, 'gfx1030');
    assert.equal(pages[3]?.bandwidthLabel, '512 GB/s');
    assert.match(pages[3]?.lead ?? '', /250 W/);
    assert.equal(pages[0]?.productHref, AMD_W7900);
    assert.ok(WORKSTATION_NAV_LINKS.every((link) => link.href.startsWith('/gpus/w')));
  });

  it('uses calculator estimates on 1 and 2 GPUs for every cited model', () => {
    for (const page of workstationRecipePages()) {
      assert.deepEqual(
        page.models.map((model) => model.modelId),
        [...WORKSTATION_MODEL_IDS],
      );
      for (const model of page.models) {
        assert.equal(model.rows.length, 4);
        const q3 = model.rows.find((row) => row.quant === COMPARE_Q3);
        assert.ok(q3);
        assert.equal(q3.kind, 'q3-estimate');
        assert.match(q3.kindLabel, /estimate/i);
        assert.equal(q3.speed, WORKSTATION_SPEED);
        for (const row of model.rows) {
          assert.equal(row.cells.length, WORKSTATION_FIT_CONTEXTS.length * 2);
          for (const cell of row.cells) {
            assert.equal(cell.speed, WORKSTATION_SPEED);
            const live = compute(workstationCalcInput(page.id, model.modelId, row.quantId, cell.context, cell.gpuCount));
            assert.equal(cell.totalGb, `${formatGiB(live.totalGiB)} GB`);
            assert.equal(cell.perGpuGb, `${formatGiB(live.perGpuGiB)} GB`);
            assert.equal(cell.verdict, live.verdict);
            assert.equal(live.tested, null);
          }
        }
      }
      assert.equal(page.ramNeed.atSelected.label, 'estimate');
      assert.equal(page.ramNeed.atFullContext.label, 'estimate');
      assert.ok((DIMM_KIT_GB as readonly number[]).includes(page.ramNeed.atSelected.kitGb));
      assert.ok((DIMM_KIT_GB as readonly number[]).includes(page.ramNeed.atFullContext.kitGb));

      const blob = workstationBlob(page);
      assert.match(blob, /not yet measured on our R9700s/i);
      assert.match(blob, /Radeon AI PRO R9700/);
      assert.ok(blob.includes(RAM_MIN_LABEL));
      assert.ok(blob.includes(RAM_FULL_LABEL));
      assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
      assert.doesNotMatch(blob, /\$\d|\bMSRP\b/);
      assert.doesNotMatch(blob, /qwen-reliable|qwen-fast-agent/);
      assert.doesNotMatch(blob, /\btok\/s\b/);

      const hrefs = workstationHrefs(page);
      for (const required of REQUIRED_WORKSTATION_HREFS) {
        assert.ok(hrefs.includes(required), `${page.id} ${required}`);
      }
    }

    const w7900q4 = compute(workstationCalcInput('w7900', 'qwen36', 'q4_k_m', 4096, 1));
    assert.ok(w7900q4.verdict === 'fits' || w7900q4.verdict === 'tight');
    const w7700q4 = compute(workstationCalcInput('w7700', 'qwen36', 'q4_k_m', 4096, 1));
    assert.equal(w7700q4.verdict, 'no');
    const split = compute(workstationCalcInput('w7900', 'llama33-70b', 'q4_k_m', 4096, 2));
    assert.equal(split.gpuCount > 1 || split.perGpuGiB > 0, true);
  });

  it('has unique SEO without pretending the cards were measured', () => {
    for (const page of workstationRecipePages()) {
      assert.equal(shouldNoindex(page.path), false);
      assert.equal(isSitemapExcluded(page.path), false);
      assert.ok(documentTitle(page.path).endsWith(' · AMDai'));
      const desc = pageDescription(page.path);
      assert.match(desc, /estimate/i);
      assert.match(desc, /not measured on local-desktop/i);
      assert.doesNotMatch(desc, /tok\/s/);
    }
  });
});
