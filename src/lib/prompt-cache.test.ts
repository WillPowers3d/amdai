import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { primaryNav } from './site';
import { isSitemapExcluded, shouldNoindex } from './seo';
import {
  PC_CITED_LABEL,
  PC_DESCRIPTION,
  PC_DOCS,
  PC_HOUSE,
  PC_HOUSE_FILE,
  PC_HOUSE_SERVER_FLAGS,
  PC_PACK,
  PC_PATH,
  PC_PUBLISHED,
  PC_QUANTS,
  PC_RUN_IT,
  PC_SLOT_SAVE,
  PC_SOURCES,
  PC_STEPS,
  PC_TITLE,
  PC_UNMEASURED,
  REQUIRED_PC_HREFS,
  assertPcValid,
  pcBlob,
  pcHrefs,
} from './prompt-cache';

const here = dirname(fileURLToPath(import.meta.url));

describe('Prompt / prefix cache on Radeon', () => {
  it('keeps cited cache flags, Stack Lab pack, and house rules', () => {
    assert.deepEqual(assertPcValid(), []);
    assert.equal(PC_PATH, '/prompt-cache');
    assert.equal(PC_PUBLISHED, '2026-10-14');
    assert.equal(PC_TITLE, 'Prompt / prefix cache on Radeon');
    assert.ok(PC_DESCRIPTION.length >= 70);
    assert.ok(PC_DESCRIPTION.length <= 160);
    assert.equal(
      PC_CITED_LABEL,
      'Cited llama.cpp --cache-prompt / --cache-reuse · llama-server TTFT not yet measured',
    );
    assert.equal(PC_PACK, 'prompt-cache-ab/1');
    assert.equal(PC_UNMEASURED, 'not yet measured');
    assert.ok(PC_STEPS.length >= 5);
    assert.ok(PC_SOURCES.every((row) => row.href.startsWith('https://')));
    assert.match(PC_HOUSE, new RegExp(PC_HOUSE_SERVER_FLAGS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    const houseFlags = PC_HOUSE.split('\n').filter((line) => !line.startsWith('#')).join('\n');
    assert.doesNotMatch(houseFlags, /--cache-reuse/);
    assert.doesNotMatch(houseFlags, /--cache-ram/);
    assert.doesNotMatch(houseFlags, /--slot-save-path/);
    assert.match(PC_DOCS, /--cache-prompt/);
    assert.match(PC_DOCS, /--cache-reuse 0/);
    assert.match(PC_DOCS, /--cache-ram 8192/);
    assert.match(PC_SLOT_SAVE, /--slot-save-path/);
    assert.match(PC_RUN_IT, /amdai-bench ab-prompt-cache/);
    assert.match(PC_RUN_IT, /amdai-bench\.ts ingest/);
    assert.match(PC_HOUSE, new RegExp(PC_HOUSE_FILE.replace(/\./g, '\\.')));
    assert.ok(PC_QUANTS.some((row) => row.quant === 'UD-Q3_K_XL' && row.estimate));
    assert.ok(PC_QUANTS.every((row) => row.ttft === PC_UNMEASURED));
    const blob = pcBlob();
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /AMDai/);
    assert.match(blob, /--cache-prompt/);
    assert.match(blob, /--cache-reuse/);
    assert.match(blob, /--cache-ram/);
    assert.match(blob, /--slot-save-path/);
    assert.match(blob, /ab-prompt-cache/);
    assert.match(blob, /Minimum system RAM needed/);
    assert.match(blob, /RAM needed at full context/);
    assert.match(blob, /not yet measured/);
    assert.match(blob, /Q4 and up/);
    assert.match(blob, /do not download Q3/i);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.doesNotMatch(blob, /amdai-stack-lab:(?:\/\/)?prompt-cache/);
    const hrefs = pcHrefs();
    for (const required of REQUIRED_PC_HREFS) {
      assert.ok(hrefs.includes(required), required);
    }
  });

  it('wires the dedicated page and stays in the sitemap', () => {
    const page = readFileSync(join(here, '../pages/prompt-cache.astro'), 'utf8');
    assert.match(page, /PC_LEAD/);
    assert.match(page, /llama\.cpp/);
    assert.match(page, /Open in Stack Lab/);
    assert.match(page, /Run it yourself/);
    assert.match(page, /NextSteps/);
    assert.match(page, /HouseRam/);
    assert.match(page, /Prompt \/ prefix cache on a Radeon GPU with llama\.cpp/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.doesNotMatch(page, /amdai-stack-lab:prompt-cache/);
    assert.equal(shouldNoindex('/prompt-cache'), false);
    assert.equal(isSitemapExcluded('/prompt-cache'), false);
    assert.ok(primaryNav.some((item) => item.href === '/prompt-cache'));
  });
});
