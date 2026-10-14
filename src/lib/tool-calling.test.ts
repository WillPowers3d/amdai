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
  REQUIRED_TC_HREFS,
  TC_DESCRIPTION,
  TC_HEADING,
  TC_NAME,
  TC_PACK,
  TC_PATH,
  TC_PUBLISHED,
  TC_UNMEASURED,
  assertToolCallingValid,
  tcBlob,
  tcDailyRamNeed,
  tcFitRows,
  tcHrefs,
  tcMeasuredRows,
  tcOffloadRamNeed,
  tcQ3RamNeed,
} from './tool-calling';

const here = dirname(fileURLToPath(import.meta.url));

describe('tool calling guide', () => {
  it('stays cited, reuses existing pages, and invents no tool-call speeds', () => {
    assert.deepEqual(assertToolCallingValid(runs), []);
    assert.equal(TC_PATH, '/guides/tool-calling');
    assert.equal(TC_NAME, 'Tool calling on Radeon');
    assert.equal(TC_HEADING, 'Tool calling and structured JSON with llama.cpp on a Radeon GPU');
    assert.equal(TC_PUBLISHED, '2026-10-14');
    assert.ok(TC_DESCRIPTION.length >= 70);
    assert.ok(TC_DESCRIPTION.length <= 160);
    assert.equal(COMPARE_Q3, 'UD-Q3_K_XL');
    assert.match(TC_UNMEASURED, /not measured yet/);
    assert.equal(TC_PACK, 'grammar-ab/1');

    const blob = tcBlob(runs);
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /llama-server/);
    assert.match(blob, /--jinja/);
    assert.match(blob, /--chat-template/);
    assert.match(blob, /function-calling\.md/);
    assert.match(blob, /response_format/);
    assert.match(blob, /json_schema|--json-schema/);
    assert.match(blob, /GBNF/);
    assert.match(blob, /parallel_tool_calls/);
    assert.match(blob, /Generic/);
    assert.match(blob, /not verified/);
    assert.match(blob, /grammar-ab\/1/);
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
    assert.doesNotMatch(blob, /\/constrained-decoding/);
    assert.doesNotMatch(blob, /amdai-stack-lab:(?:\/\/)?[a-z]+\/grammar-ab/);

    const hrefs = tcHrefs();
    for (const required of REQUIRED_TC_HREFS) {
      assert.ok(hrefs.some((href) => href === required || href.startsWith(`${required}/`)), required);
    }

    const rows = tcMeasuredRows(runs);
    assert.equal(rows.length, 5);
    const q5 = rows.find((row) => row.quant === 'UD-Q5_K_XL');
    assert.equal(q5?.decode4k, '102.39 tok/s');
    assert.ok(q5?.runIds.length);
    const q3 = rows.find((row) => row.kind === 'q3-estimate');
    assert.equal(q3?.quant, COMPARE_Q3);
    assert.doesNotMatch(q3?.decode4k ?? '', /tok\/s/);

    const fit = tcFitRows();
    assert.equal(fit.length, 4);
    assert.equal(fit.find((row) => row.kind === 'q3-estimate')?.quant, COMPARE_Q3);

    const offload = tcOffloadRamNeed();
    const q3ram = tcQ3RamNeed();
    assert.ok((DIMM_KIT_GB as readonly number[]).includes(offload.atSelected.kitGb));
    assert.ok((DIMM_KIT_GB as readonly number[]).includes(q3ram.atFullContext.kitGb));
    assert.ok(tcDailyRamNeed());
  });

  it('is on nav with unique SEO and HowTo-safe JSON-LD', () => {
    assert.ok(primaryNav.some((item) => item.href === TC_PATH));
    assert.equal(shouldNoindex(TC_PATH), false);
    assert.equal(isSitemapExcluded(TC_PATH), false);
    assert.ok(documentTitle(TC_PATH).endsWith(' · AMDai'));
    assert.ok(documentTitle(TC_PATH).length <= 60);
    assert.ok((pageDescription(TC_PATH)?.length ?? 0) >= 70);
    const ld = techArticleJsonLd({
      headline: TC_NAME,
      description: pageDescription(TC_PATH) ?? '',
      url: `https://amdai.net${TC_PATH}`,
      published: TC_PUBLISHED,
      modified: TC_PUBLISHED,
    });
    assert.equal(ld['@type'], 'TechArticle');
    assert.doesNotMatch(JSON.stringify(ld), /aggregateRating|offers|"price"/i);
  });

  it('is a real page with NextSteps, Stack Lab, and both RAM labels', () => {
    const page = readFileSync(join(here, '../pages/guides/tool-calling.astro'), 'utf8');
    const start = readFileSync(join(here, '../pages/start.astro'), 'utf8');
    const faq = readFileSync(join(here, './faq.ts'), 'utf8');
    const coding = readFileSync(join(here, './setup-coding-assistant.ts'), 'utf8');
    const webui = readFileSync(join(here, './setup-open-webui.ts'), 'utf8');
    const harnesses = readFileSync(join(here, '../pages/harnesses/index.astro'), 'utf8');
    const backends = readFileSync(join(here, '../pages/backends/index.astro'), 'utf8');
    assert.match(page, /NextSteps/);
    assert.match(page, /HowWeTest/);
    assert.match(page, /OpenInStackLab/);
    assert.match(page, /HOUSE_STACK_LAB\.planner/);
    assert.match(page, /SystemRamNeed/);
    assert.match(page, /HouseRam/);
    assert.match(page, /TC_HEADING/);
    assert.match(page, /TC_TROUBLE/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.doesNotMatch(page, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(page, /\/constrained-decoding/);
    assert.match(start, /\/guides\/tool-calling/);
    assert.match(faq, /\/guides\/tool-calling/);
    assert.match(coding, /\/guides\/tool-calling/);
    assert.match(webui, /\/guides\/tool-calling/);
    assert.match(harnesses, /\/guides\/tool-calling/);
    assert.match(backends, /\/guides\/tool-calling/);
  });
});
