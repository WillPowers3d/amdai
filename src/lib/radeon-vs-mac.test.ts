import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DIMM_KIT_GB } from './calculator';
import { techArticleJsonLd } from './jsonld';
import { runs } from './run-card-data';
import { documentTitle, isSitemapExcluded, pageDescription, shouldNoindex } from './seo';
import { primaryNav } from './site';
import { compareHubCards } from './local-desktop-compare';
import { COMPARE_Q3 } from './local-desktop-compare';
import {
  AMD_R9700_SPEC,
  APPLE_STUDIO_2025,
  APPLE_STUDIO_SPECS,
  MAC_SPEED_EMPTY,
  RADEON_VS_MAC_HEADING,
  RADEON_VS_MAC_NAME,
  RADEON_VS_MAC_PATH,
  RADEON_VS_MAC_PUBLISHED,
  REQUIRED_PAGE_HREFS,
  SPEC_ROWS,
  SPEED_NOTE,
  assertRadeonVsMacValid,
  dailyRamNeed,
  fitRows,
  measuredSpeedRows,
  q3EstimateRam,
  radeonProductIds,
  radeonVsMacBlob,
  radeonVsMacHrefs,
  strixRamNeed,
  xtxOffloadRamNeed,
} from './radeon-vs-mac';

const here = dirname(fileURLToPath(import.meta.url));

describe('Radeon vs Mac compare page', () => {
  it('cites vendor specs, measured R9700 rows, and empty Mac speed', () => {
    assert.deepEqual(assertRadeonVsMacValid(runs), []);
    assert.equal(RADEON_VS_MAC_PATH, '/compare/radeon-vs-mac');
    assert.equal(RADEON_VS_MAC_NAME, 'Radeon vs Mac');
    assert.equal(RADEON_VS_MAC_HEADING, 'Radeon vs Mac (Apple Silicon) for local LLMs');
    assert.equal(RADEON_VS_MAC_PUBLISHED, '2026-10-14');
    assert.equal(COMPARE_Q3, 'UD-Q3_K_XL');
    assert.equal(MAC_SPEED_EMPTY, 'not measured here');

    const hrefs = radeonVsMacHrefs();
    for (const required of REQUIRED_PAGE_HREFS) {
      assert.ok(hrefs.includes(required), required);
    }
    assert.ok(hrefs.includes(AMD_R9700_SPEC));
    assert.ok(hrefs.includes(APPLE_STUDIO_2025));
    assert.ok(hrefs.includes(APPLE_STUDIO_SPECS));

    const speed = measuredSpeedRows(runs);
    assert.equal(speed.length, 3);
    const ud4k = speed.find((row) => row.quant === 'UD-Q5_K_XL' && row.context === 4096);
    assert.equal(ud4k?.one.decode, '102.39 tok/s');
    assert.ok(ud4k?.one.runIds.length);
    assert.equal(ud4k?.mac, MAC_SPEED_EMPTY);
    assert.ok(speed.every((row) => row.mac === MAC_SPEED_EMPTY && row.strix === MAC_SPEED_EMPTY));
    assert.ok(speed.some((row) => row.quant === 'Q5_K_M'));
    assert.ok(speed.some((row) => row.quant === 'Q4_K_M'));

    const r9700 = SPEC_ROWS.find((row) => row.id === 'r9700');
    assert.equal(r9700?.memory.value, '32 GB GDDR6');
    assert.equal(r9700?.bandwidth.value, '640 GB/s');
    assert.equal(r9700?.power.value, '300 W TBP');
    const xtx = SPEC_ROWS.find((row) => row.id === 'rx7900xtx');
    assert.match(xtx?.memory.value ?? '', /24 GB/);
    const dual = SPEC_ROWS.find((row) => row.id === 'r9700-x2');
    assert.match(dual?.memory.value ?? '', /64 GB/);
    const m4 = SPEC_ROWS.find((row) => row.id === 'm4-max');
    assert.match(m4?.bandwidth.value ?? '', /410 GB\/s/);
    assert.deepEqual(radeonProductIds(), ['r9700', 'rx7900xtx', 'strix-halo']);

    const fit = fitRows();
    assert.equal(fit.length, 4);
    assert.equal(fit.find((row) => row.kind === 'q3-estimate')?.quant, COMPARE_Q3);

    const q3 = q3EstimateRam();
    const offload = xtxOffloadRamNeed();
    const strix = strixRamNeed();
    assert.ok((DIMM_KIT_GB as readonly number[]).includes(q3.atSelected.kitGb));
    assert.ok((DIMM_KIT_GB as readonly number[]).includes(offload.atFullContext.kitGb));
    assert.ok((DIMM_KIT_GB as readonly number[]).includes(strix.atSelected.kitGb));
    assert.ok(dailyRamNeed());

    const blob = radeonVsMacBlob(runs);
    assert.match(blob, /Mac Studio/);
    assert.match(blob, /M4 Max/);
    assert.match(blob, /Strix Halo/);
    assert.match(blob, /GGML_METAL/);
    assert.match(blob, /GGML_VULKAN/);
    assert.match(blob, /third-party/);
    assert.match(blob, /not measured here/);
    assert.match(blob, new RegExp(COMPARE_Q3));
    assert.match(blob, /estimate/i);
    assert.match(blob, /Minimum system RAM needed/);
    assert.match(blob, /RAM needed at full context/);
    assert.match(SPEED_NOTE, /not measured here/);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.doesNotMatch(blob, /\$\d|\bMSRP\b|\bUSD\b/);
    assert.doesNotMatch(blob, /floor is q4|q4 floor|q4 and up only/i);
  });

  it('is on the compare hub and has unique SEO without price JSON-LD', () => {
    assert.ok(compareHubCards().some((card) => card.href === RADEON_VS_MAC_PATH));
    assert.equal(shouldNoindex(RADEON_VS_MAC_PATH), false);
    assert.equal(isSitemapExcluded(RADEON_VS_MAC_PATH), false);
    assert.ok(primaryNav.some((item) => item.href === RADEON_VS_MAC_PATH));
    assert.ok(documentTitle(RADEON_VS_MAC_PATH).endsWith(' · AMDai'));
    assert.ok(documentTitle(RADEON_VS_MAC_PATH).length <= 60);
    assert.ok((pageDescription(RADEON_VS_MAC_PATH)?.length ?? 0) >= 70);
    const ld = techArticleJsonLd({
      headline: RADEON_VS_MAC_NAME,
      description: pageDescription(RADEON_VS_MAC_PATH) ?? '',
      url: `https://amdai.net${RADEON_VS_MAC_PATH}`,
      published: RADEON_VS_MAC_PUBLISHED,
      modified: RADEON_VS_MAC_PUBLISHED,
    });
    assert.equal(ld['@type'], 'TechArticle');
    assert.doesNotMatch(JSON.stringify(ld), /aggregateRating|offers|"price"/i);
  });

  it('is a real page with NextSteps and both RAM labels', () => {
    const page = readFileSync(join(here, '../pages/compare/radeon-vs-mac.astro'), 'utf8');
    assert.match(page, /NextSteps/);
    assert.match(page, /Radeon vs Mac \(Apple Silicon\) for local LLMs/);
    assert.match(page, /MAC_SPEED_EMPTY/);
    assert.match(page, /SystemRamNeed/);
    assert.match(page, /BuyButtons/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.doesNotMatch(page, /Qwen2\.5|Qwen3-8B/);
  });
});
