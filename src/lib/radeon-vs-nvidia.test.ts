import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DIMM_KIT_GB } from './calculator';
import { techArticleJsonLd } from './jsonld';
import { runs } from './run-card-data';
import { documentTitle, isSitemapExcluded, pageDescription, shouldNoindex } from './seo';
import { compareHubCards } from './local-desktop-compare';
import { COMPARE_Q3 } from './local-desktop-compare';
import {
  AMD_R9700_SPEC,
  NVIDIA_5090_SPEC,
  NVIDIA_SPEED_EMPTY,
  RADEON_VS_NVIDIA_NAME,
  RADEON_VS_NVIDIA_PATH,
  RADEON_VS_NVIDIA_PUBLISHED,
  REQUIRED_PAGE_HREFS,
  SPEC_ROWS,
  SPEED_NOTE,
  assertRadeonVsNvidiaValid,
  measuredSpeedRows,
  nvidiaProductIds,
  q3EstimateRam,
  radeonVsNvidiaBlob,
  radeonVsNvidiaHrefs,
  sixteenGbRamNeed,
} from './radeon-vs-nvidia';

describe('Radeon vs NVIDIA compare page', () => {
  it('cites vendor specs, measured R9700 rows, and empty NVIDIA speed', () => {
    assert.deepEqual(assertRadeonVsNvidiaValid(runs), []);
    assert.equal(RADEON_VS_NVIDIA_PATH, '/compare/radeon-vs-nvidia');
    assert.equal(RADEON_VS_NVIDIA_NAME, 'Radeon vs NVIDIA');
    assert.equal(RADEON_VS_NVIDIA_PUBLISHED, '2026-10-13');
    assert.equal(COMPARE_Q3, 'UD-Q3_K_XL');

    const hrefs = radeonVsNvidiaHrefs();
    for (const required of REQUIRED_PAGE_HREFS) {
      assert.ok(hrefs.includes(required), required);
    }
    assert.ok(hrefs.includes(AMD_R9700_SPEC));
    assert.ok(hrefs.includes(NVIDIA_5090_SPEC));

    const speed = measuredSpeedRows(runs);
    assert.equal(speed.length, 6);
    const ud4k = speed.find((row) => row.quant === 'UD-Q5_K_XL' && row.context === 4096);
    assert.equal(ud4k?.one.decode, '102.39 tok/s');
    assert.equal(ud4k?.both.decode, '82.78 tok/s');
    assert.ok(ud4k?.one.runIds.length);
    assert.equal(ud4k?.nvidia, NVIDIA_SPEED_EMPTY);
    assert.ok(speed.every((row) => row.nvidia === NVIDIA_SPEED_EMPTY));
    assert.ok(speed.some((row) => row.quant === 'Q5_K_M'));
    assert.ok(speed.some((row) => row.quant === 'Q4_K_M'));

    const r9700 = SPEC_ROWS.find((row) => row.id === 'r9700');
    assert.equal(r9700?.vram.value, '32 GB GDDR6');
    assert.equal(r9700?.bandwidth.value, '640 GB/s');
    assert.equal(r9700?.power.value, '300 W TBP');
    const ti16 = SPEC_ROWS.find((row) => row.id === 'rtx5060ti-16');
    assert.match(ti16?.vram.value ?? '', /16 GB/);
    assert.deepEqual(nvidiaProductIds(), [
      'rtx5090',
      'rtx4090',
      'rtx3090',
      'rtx5080',
      'rtx5070ti',
      'rtx5060ti-16',
    ]);

    const q3 = q3EstimateRam();
    const sixteen = sixteenGbRamNeed();
    assert.ok((DIMM_KIT_GB as readonly number[]).includes(q3.atSelected.kitGb));
    assert.ok((DIMM_KIT_GB as readonly number[]).includes(sixteen.atFullContext.kitGb));
    assert.equal(sixteen.atSelected.label, 'estimate');

    const blob = radeonVsNvidiaBlob(runs);
    assert.match(blob, /VRAM-per-dollar|VRAM class|Check price/i);
    assert.match(blob, /CUDA/);
    assert.match(blob, /vLLM/);
    assert.match(blob, /third-party/);
    assert.match(blob, /not apples-to-apples/);
    assert.match(blob, new RegExp(COMPARE_Q3));
    assert.match(blob, /estimate/i);
    assert.match(blob, /Minimum system RAM needed/);
    assert.match(blob, /RAM needed at full context/);
    assert.match(SPEED_NOTE, /no cited number yet/);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.doesNotMatch(blob, /\$\d|\bMSRP\b|\bUSD\b/);
    assert.doesNotMatch(blob, /floor is q4|q4 floor|q4 and up only/i);
  });

  it('is on the compare hub and has unique SEO without price JSON-LD', () => {
    assert.ok(compareHubCards().some((card) => card.href === RADEON_VS_NVIDIA_PATH));
    assert.equal(shouldNoindex(RADEON_VS_NVIDIA_PATH), false);
    assert.equal(isSitemapExcluded(RADEON_VS_NVIDIA_PATH), false);
    assert.ok(documentTitle(RADEON_VS_NVIDIA_PATH).endsWith(' · AMDai'));
    assert.ok(documentTitle(RADEON_VS_NVIDIA_PATH).length <= 60);
    assert.ok((pageDescription(RADEON_VS_NVIDIA_PATH)?.length ?? 0) >= 70);
    const ld = techArticleJsonLd({
      headline: RADEON_VS_NVIDIA_NAME,
      description: pageDescription(RADEON_VS_NVIDIA_PATH) ?? '',
      url: `https://amdai.net${RADEON_VS_NVIDIA_PATH}`,
      published: RADEON_VS_NVIDIA_PUBLISHED,
      modified: RADEON_VS_NVIDIA_PUBLISHED,
    });
    assert.equal(ld['@type'], 'TechArticle');
    assert.doesNotMatch(JSON.stringify(ld), /aggregateRating|offers|"price"/i);
  });
});
