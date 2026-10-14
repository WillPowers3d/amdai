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
import {
  COMPARE_Q3,
  REQUIRED_SPEC_HREFS,
  SPEC_DESCRIPTION,
  SPEC_DRAFT_RULE,
  SPEC_HEADING,
  SPEC_NAME,
  SPEC_PATH,
  SPEC_PUBLISHED,
  SPEC_UNMEASURED,
  assertSpecValid,
  specBlob,
  specDailyRamNeed,
  specFitRows,
  specHrefs,
  specMeasuredRows,
  specOffloadRamNeed,
  specQ3RamNeed,
} from './speculative-decoding';

const here = dirname(fileURLToPath(import.meta.url));

describe('speculative decoding guide', () => {
  it('stays cited, reuses existing pages, and invents no draft speeds', () => {
    assert.deepEqual(assertSpecValid(runs), []);
    assert.equal(SPEC_PATH, '/speculative-decoding');
    assert.equal(SPEC_NAME, 'Speculative decoding on Radeon');
    assert.equal(SPEC_HEADING, 'Speculative decoding on a Radeon GPU with llama.cpp');
    assert.equal(SPEC_PUBLISHED, '2026-10-14');
    assert.ok(SPEC_DESCRIPTION.length >= 70);
    assert.ok(SPEC_DESCRIPTION.length <= 160);
    assert.equal(COMPARE_Q3, 'UD-Q3_K_XL');
    assert.match(SPEC_UNMEASURED, /not measured yet on local-desktop/);
    assert.match(SPEC_DRAFT_RULE, /Q4 and up/);

    const blob = specBlob(runs);
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /llama-server/);
    assert.match(blob, /-md /);
    assert.match(blob, /--model-draft/);
    assert.match(blob, /--spec-draft-n-max/);
    assert.match(blob, /--spec-draft-n-min/);
    assert.match(blob, /-ngld/);
    assert.match(blob, /--device-draft/);
    assert.match(blob, /Q6_K/);
    assert.match(blob, /Q5_K_M/);
    assert.match(blob, /Q4_K_M/);
    assert.match(blob, new RegExp(COMPARE_Q3));
    assert.match(blob, /labeled estimate/);
    assert.match(blob, /Minimum system RAM needed/);
    assert.match(blob, /RAM needed at full context/);
    assert.match(blob, /no MTP/);
    assert.match(blob, /32\.6/);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.doesNotMatch(blob, /\$\d|\bMSRP\b/);
    assert.doesNotMatch(blob, /floor is q4|q4 floor|q4 and up only/i);
    assert.doesNotMatch(blob, /fim-qwen/i);

    const hrefs = specHrefs();
    for (const required of REQUIRED_SPEC_HREFS) {
      assert.ok(hrefs.some((href) => href === required || href.startsWith(`${required}/`)), required);
    }

    const rows = specMeasuredRows(runs);
    assert.equal(rows.length, 5);
    const q5 = rows.find((row) => row.quant === 'UD-Q5_K_XL');
    assert.equal(q5?.decode4k, '102.39 tok/s');
    assert.ok(q5?.runIds.length);
    const q3 = rows.find((row) => row.kind === 'q3-estimate');
    assert.equal(q3?.quant, COMPARE_Q3);
    assert.doesNotMatch(q3?.decode4k ?? '', /tok\/s/);

    const fit = specFitRows();
    assert.equal(fit.length, 4);
    assert.equal(fit.find((row) => row.kind === 'q3-estimate')?.quant, COMPARE_Q3);

    const offload = specOffloadRamNeed();
    const q3ram = specQ3RamNeed();
    assert.ok((DIMM_KIT_GB as readonly number[]).includes(offload.atSelected.kitGb));
    assert.ok((DIMM_KIT_GB as readonly number[]).includes(q3ram.atFullContext.kitGb));
    assert.ok(specDailyRamNeed());
  });

  it('is on nav with unique SEO and HowTo-safe JSON-LD', () => {
    assert.ok(primaryNav.some((item) => item.href === SPEC_PATH));
    assert.equal(shouldNoindex(SPEC_PATH), false);
    assert.equal(isSitemapExcluded(SPEC_PATH), false);
    assert.ok(documentTitle(SPEC_PATH).endsWith(' · AMDai'));
    assert.ok(documentTitle(SPEC_PATH).length <= 60);
    assert.ok((pageDescription(SPEC_PATH)?.length ?? 0) >= 70);
    const ld = techArticleJsonLd({
      headline: SPEC_NAME,
      description: pageDescription(SPEC_PATH) ?? '',
      url: `https://amdai.net${SPEC_PATH}`,
      published: SPEC_PUBLISHED,
      modified: SPEC_PUBLISHED,
    });
    assert.equal(ld['@type'], 'TechArticle');
    assert.doesNotMatch(JSON.stringify(ld), /aggregateRating|offers|"price"/i);
  });

  it('is a real page with NextSteps, Stack Lab, and both RAM labels', () => {
    const page = readFileSync(join(here, '../pages/speculative-decoding.astro'), 'utf8');
    const start = readFileSync(join(here, '../pages/start.astro'), 'utf8');
    const faq = readFileSync(join(here, './faq.ts'), 'utf8');
    const tuning = readFileSync(join(here, './tuning.ts'), 'utf8');
    assert.match(page, /NextSteps/);
    assert.match(page, /HowWeTest/);
    assert.match(page, /OpenInStackLab/);
    assert.match(page, /HOUSE_STACK_LAB\.planner/);
    assert.match(page, /SystemRamNeed/);
    assert.match(page, /HouseRam/);
    assert.match(page, /SPEC_HEADING/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.doesNotMatch(page, /Qwen2\.5|Qwen3-8B/);
    assert.match(start, /\/speculative-decoding/);
    assert.match(faq, /\/speculative-decoding/);
    assert.match(tuning, /\/speculative-decoding/);
  });
});
