import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { compute, formatGiB, GPU_PRESETS } from './calculator';
import { gpuCardId } from './gpu-ids';
import { primaryNav } from './site';
import { isSitemapExcluded, shouldNoindex } from './seo';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import type { GpuDirectory } from './status';
import { COMPARE_Q3 } from './local-desktop-compare';
import {
  REQUIRED_STRIX_HALO_HREFS,
  STRIX_HALO_CITED_LABEL,
  STRIX_HALO_ID,
  STRIX_HALO_PATH,
  STRIX_HALO_PUBLISHED,
  STRIX_HALO_SPEED,
  STRIX_HALO_USABLE_PCT,
  assertStrixHaloValid,
  strixCalcInput,
  strixHaloBlob,
  strixHaloHrefs,
  strixHaloPage,
} from './strix-halo';

const here = dirname(fileURLToPath(import.meta.url));

describe('Strix Halo / Ryzen AI Max guide', () => {
  it('keeps cited shared-memory math and house rules', () => {
    const page = strixHaloPage();
    assert.deepEqual(assertStrixHaloValid(page), []);
    assert.equal(STRIX_HALO_PUBLISHED, '2026-10-13');
    assert.equal(STRIX_HALO_CITED_LABEL, 'Cited, not measured on local-desktop');
    assert.equal(STRIX_HALO_PATH, '/gpus/strix-halo');
    assert.equal(page.gfx, 'gfx1151');
    assert.equal(page.usablePct, 70);
    assert.equal(STRIX_HALO_USABLE_PCT, 70);
    const yaml = parse(readFileSync(join(here, '../data/gpus.yaml'), 'utf8')) as GpuDirectory;
    assert.ok(yaml.cards.some((card) => gpuCardId(card) === STRIX_HALO_ID));
    const preset = GPU_PRESETS.find((gpu) => gpu.id === STRIX_HALO_ID);
    assert.equal(preset?.kind, 'unified');
    assert.equal(preset?.gfx, 'gfx1151');
    const blob = strixHaloBlob(page);
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /Vulkan/);
    assert.match(blob, /Dynamic \+ carveout/);
    assert.match(blob, /Minimum system RAM needed/);
    assert.match(blob, /RAM needed at full context/);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /floor is q4|q4 floor|q4 and up only/i);
    assert.doesNotMatch(blob, /\b\d+(?:\.\d+)?\s*tok\/s\b/i);
    const q3 = page.fitRows.filter((row) => row.quant === COMPARE_Q3);
    assert.equal(q3.length, 2);
    assert.ok(q3.every((row) => row.kind === 'q3-estimate'));
    for (const row of page.fitRows) {
      assert.equal(row.speed, STRIX_HALO_SPEED);
      for (const cell of row.kits) {
        const input = strixCalcInput(row.modelId, row.quantId, row.context, cell.kitGb);
        const live = compute(input);
        assert.equal(input.kind, 'unified');
        assert.equal(cell.totalGb, `${formatGiB(live.totalGiB)} GB`);
        assert.ok(Math.abs(live.usableVramGb - cell.kitGb * 0.7) < 0.05);
      }
    }
    assert.equal(page.ramMin.label, RAM_MIN_LABEL);
    assert.equal(page.ramFull.label, RAM_FULL_LABEL);
    const hrefs = strixHaloHrefs(page);
    for (const required of REQUIRED_STRIX_HALO_HREFS) {
      assert.ok(
        hrefs.some((href) => href === required || href.startsWith(`${required}/`)),
        required,
      );
    }
  });

  it('wires the dedicated page and stays in the sitemap', () => {
    const page = readFileSync(join(here, '../pages/gpus/strix-halo.astro'), 'utf8');
    const hub = readFileSync(join(here, '../content/guides/gpus.mdx'), 'utf8');
    assert.match(page, /Cited, not measured on local-desktop/);
    assert.match(page, /llama\.cpp/);
    assert.match(page, /NextSteps/);
    assert.match(page, /Minimum system RAM needed/);
    assert.match(page, /RAM needed at full context/);
    assert.doesNotMatch(page, /Open in Stack Lab/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.match(hub, /\/gpus\/strix-halo/);
    assert.equal(shouldNoindex('/gpus/strix-halo'), false);
    assert.equal(isSitemapExcluded('/gpus/strix-halo'), false);
    assert.ok(primaryNav.some((item) => item.href === '/gpus/strix-halo'));
  });
});
