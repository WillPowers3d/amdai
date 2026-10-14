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
  CD_DESCRIPTION,
  CD_HEADING,
  CD_NAME,
  CD_PACK,
  CD_PATH,
  CD_PUBLISHED,
  CD_UNMEASURED,
  COMPARE_Q3,
  REQUIRED_CD_HREFS,
  assertConstrainedValid,
  cdBlob,
  cdDailyRamNeed,
  cdFitRows,
  cdHrefs,
  cdMeasuredRows,
  cdOffloadRamNeed,
  cdQ3RamNeed,
} from './constrained-decoding';

const here = dirname(fileURLToPath(import.meta.url));

describe('constrained decoding guide', () => {
  it('stays cited, reuses existing pages, and invents no grammar speeds', () => {
    assert.deepEqual(assertConstrainedValid(runs), []);
    assert.equal(CD_PATH, '/constrained-decoding');
    assert.equal(CD_NAME, 'Constrained decoding on Radeon');
    assert.equal(CD_HEADING, 'Constrained decoding (JSON / GBNF) on a Radeon GPU with llama.cpp');
    assert.equal(CD_PUBLISHED, '2026-10-14');
    assert.ok(CD_DESCRIPTION.length >= 70);
    assert.ok(CD_DESCRIPTION.length <= 160);
    assert.equal(COMPARE_Q3, 'UD-Q3_K_XL');
    assert.match(CD_UNMEASURED, /grammar-ab\/1/);
    assert.equal(CD_PACK, 'grammar-ab/1');

    const blob = cdBlob(runs);
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /llama-server/);
    assert.match(blob, /--grammar/);
    assert.match(blob, /--grammar-file/);
    assert.match(blob, /--json-schema/);
    assert.match(blob, /--json-schema-file/);
    assert.match(blob, /json_schema/);
    assert.match(blob, /response_format/);
    assert.match(blob, /GBNF/);
    assert.match(blob, /#4218/);
    assert.match(blob, /Q6_K/);
    assert.match(blob, /Q5_K_M/);
    assert.match(blob, /Q4_K_M/);
    assert.match(blob, new RegExp(COMPARE_Q3));
    assert.match(blob, /labeled estimate/);
    assert.match(blob, /Minimum system RAM needed/);
    assert.match(blob, /RAM needed at full context/);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.doesNotMatch(blob, /\$\d|\bMSRP\b/);
    assert.doesNotMatch(blob, /floor is q4|q4 floor|q4 and up only/i);
    assert.doesNotMatch(blob, /\/speculative-decoding/);
    assert.doesNotMatch(blob, /amdai-stack-lab:[^\s]*grammar-ab/);

    const hrefs = cdHrefs();
    for (const required of REQUIRED_CD_HREFS) {
      assert.ok(hrefs.some((href) => href === required || href.startsWith(`${required}/`)), required);
    }

    const rows = cdMeasuredRows(runs);
    assert.equal(rows.length, 5);
    const q5 = rows.find((row) => row.quant === 'UD-Q5_K_XL');
    assert.equal(q5?.decode4k, '102.39 tok/s');
    assert.ok(q5?.runIds.length);
    const q3 = rows.find((row) => row.kind === 'q3-estimate');
    assert.equal(q3?.quant, COMPARE_Q3);
    assert.doesNotMatch(q3?.decode4k ?? '', /tok\/s/);

    const fit = cdFitRows();
    assert.equal(fit.length, 4);
    assert.equal(fit.find((row) => row.kind === 'q3-estimate')?.quant, COMPARE_Q3);

    const offload = cdOffloadRamNeed();
    const q3ram = cdQ3RamNeed();
    assert.ok((DIMM_KIT_GB as readonly number[]).includes(offload.atSelected.kitGb));
    assert.ok((DIMM_KIT_GB as readonly number[]).includes(q3ram.atFullContext.kitGb));
    assert.ok(cdDailyRamNeed());
  });

  it('is on nav with unique SEO and HowTo-safe JSON-LD', () => {
    assert.ok(primaryNav.some((item) => item.href === CD_PATH));
    assert.equal(shouldNoindex(CD_PATH), false);
    assert.equal(isSitemapExcluded(CD_PATH), false);
    assert.ok(documentTitle(CD_PATH).endsWith(' · AMDai'));
    assert.ok(documentTitle(CD_PATH).length <= 60);
    assert.ok((pageDescription(CD_PATH)?.length ?? 0) >= 70);
    const ld = techArticleJsonLd({
      headline: CD_NAME,
      description: pageDescription(CD_PATH) ?? '',
      url: `https://amdai.net${CD_PATH}`,
      published: CD_PUBLISHED,
      modified: CD_PUBLISHED,
    });
    assert.equal(ld['@type'], 'TechArticle');
    assert.doesNotMatch(JSON.stringify(ld), /aggregateRating|offers|"price"/i);
  });

  it('is a real page with NextSteps, Stack Lab, and both RAM labels', () => {
    const page = readFileSync(join(here, '../pages/constrained-decoding.astro'), 'utf8');
    const start = readFileSync(join(here, '../pages/start.astro'), 'utf8');
    const faq = readFileSync(join(here, './faq.ts'), 'utf8');
    const tuning = readFileSync(join(here, './tuning.ts'), 'utf8');
    assert.match(page, /NextSteps/);
    assert.match(page, /HowWeTest/);
    assert.match(page, /OpenInStackLab/);
    assert.match(page, /HOUSE_STACK_LAB\.planner/);
    assert.match(page, /HOUSE_STACK_LAB\.doctor/);
    assert.match(page, /SystemRamNeed/);
    assert.match(page, /HouseRam/);
    assert.match(page, /CD_HEADING/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.doesNotMatch(page, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(page, /\/speculative-decoding/);
    assert.match(start, /\/constrained-decoding/);
    assert.match(faq, /\/constrained-decoding/);
    assert.match(tuning, /\/constrained-decoding/);
  });
});
