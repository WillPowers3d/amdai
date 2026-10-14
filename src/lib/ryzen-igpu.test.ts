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
  REQUIRED_RYZEN_IGPU_HREFS,
  RYZEN_IGPU_CITED_LABEL,
  RYZEN_IGPU_HEADING,
  RYZEN_IGPU_ID,
  RYZEN_IGPU_PATH,
  RYZEN_IGPU_PUBLISHED,
  RYZEN_IGPU_SPEED,
  RYZEN_IGPU_USABLE_PCT,
  assertRyzenIgpuValid,
  ryzenIgpuBlob,
  ryzenIgpuCalcInput,
  ryzenIgpuHrefs,
  ryzenIgpuPage,
} from './ryzen-igpu';

const here = dirname(fileURLToPath(import.meta.url));

describe('Ryzen iGPU guide', () => {
  it('keeps cited shared-memory math and house rules', () => {
    const page = ryzenIgpuPage();
    assert.deepEqual(assertRyzenIgpuValid(page), []);
    assert.equal(RYZEN_IGPU_PUBLISHED, '2026-10-14');
    assert.equal(RYZEN_IGPU_CITED_LABEL, 'Cited, not measured on local-desktop');
    assert.equal(RYZEN_IGPU_PATH, '/gpus/ryzen-igpu');
    assert.equal(RYZEN_IGPU_HEADING, 'Local AI on a Ryzen iGPU (Radeon 780M, 880M, 890M)');
    assert.equal(page.gfx, 'gfx1103 / gfx1150');
    assert.equal(page.usablePct, 70);
    assert.equal(RYZEN_IGPU_USABLE_PCT, 70);
    const yaml = parse(readFileSync(join(here, '../data/gpus.yaml'), 'utf8')) as GpuDirectory;
    assert.ok(yaml.cards.some((card) => gpuCardId(card) === RYZEN_IGPU_ID));
    const preset = GPU_PRESETS.find((gpu) => gpu.id === RYZEN_IGPU_ID);
    assert.equal(preset?.kind, 'unified');
    assert.equal(preset?.gfx, 'gfx1103');
    const blob = ryzenIgpuBlob(page);
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /Vulkan/);
    assert.match(blob, /Dynamic \+ carveout/);
    assert.match(blob, /Minimum system RAM needed/);
    assert.match(blob, /RAM needed at full context/);
    assert.match(blob, /8700G is not named/);
    assert.match(blob, /HSA_OVERRIDE_GFX_VERSION is unofficial/);
    assert.match(blob, /\/gpus\/strix-halo/);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /floor is q4|q4 floor|q4 and up only/i);
    assert.doesNotMatch(blob, /\b\d+(?:\.\d+)?\s*tok\/s\b/i);
    const q3 = page.fitRows.filter((row) => row.quant === COMPARE_Q3);
    assert.equal(q3.length, 2);
    assert.ok(q3.every((row) => row.kind === 'q3-estimate'));
    for (const row of page.fitRows) {
      assert.equal(row.speed, RYZEN_IGPU_SPEED);
      for (const cell of row.kits) {
        const input = ryzenIgpuCalcInput(row.modelId, row.quantId, row.context, cell.kitGb);
        const live = compute(input);
        assert.equal(input.kind, 'unified');
        assert.equal(cell.totalGb, `${formatGiB(live.totalGiB)} GB`);
        assert.ok(Math.abs(live.usableVramGb - cell.kitGb * 0.7) < 0.05);
      }
    }
    assert.equal(page.ramMin.label, RAM_MIN_LABEL);
    assert.equal(page.ramFull.label, RAM_FULL_LABEL);
    const hrefs = ryzenIgpuHrefs(page);
    for (const required of REQUIRED_RYZEN_IGPU_HREFS) {
      assert.ok(
        hrefs.some((href) => href === required || href.startsWith(`${required}/`)),
        required,
      );
    }
  });

  it('wires the dedicated page and stays in the sitemap', () => {
    const page = readFileSync(join(here, '../pages/gpus/ryzen-igpu.astro'), 'utf8');
    const hub = readFileSync(join(here, '../content/guides/gpus.mdx'), 'utf8');
    const halo = readFileSync(join(here, '../pages/gpus/strix-halo.astro'), 'utf8');
    assert.match(page, /Cited, not measured on local-desktop/);
    assert.match(page, /llama\.cpp/);
    assert.match(page, /NextSteps/);
    assert.match(page, /Minimum system RAM needed/);
    assert.match(page, /RAM needed at full context/);
    assert.match(page, /\/gpus\/strix-halo/);
    assert.doesNotMatch(page, /Open in Stack Lab/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.match(hub, /\/gpus\/ryzen-igpu/);
    assert.match(halo, /\/gpus\/ryzen-igpu/);
    assert.equal(shouldNoindex('/gpus/ryzen-igpu'), false);
    assert.equal(isSitemapExcluded('/gpus/ryzen-igpu'), false);
    assert.ok(primaryNav.some((item) => item.href === '/gpus/ryzen-igpu'));
  });
});
