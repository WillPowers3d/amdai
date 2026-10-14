import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { primaryNav } from './site';
import { isSitemapExcluded, shouldNoindex } from './seo';
import {
  MM_CITED_LABEL,
  MM_DESCRIPTION,
  MM_DOCS,
  MM_H1,
  MM_HOUSE,
  MM_HOUSE_FILE,
  MM_HOUSE_SERVER_FLAGS,
  MM_MLOCK,
  MM_NO_MMAP,
  MM_PACK,
  MM_PATH,
  MM_PUBLISHED,
  MM_QUANTS,
  MM_RUN_IT,
  MM_SOURCES,
  MM_STEPS,
  MM_TITLE,
  MM_UNMEASURED,
  REQUIRED_MM_HREFS,
  assertMmValid,
  mmBlob,
  mmHrefs,
} from './mmap';

const here = dirname(fileURLToPath(import.meta.url));

describe('mmap vs --no-mmap vs --mlock on Radeon', () => {
  it('keeps cited --load-mode flags, Model loading A/B, and house rules', () => {
    assert.deepEqual(assertMmValid(), []);
    assert.equal(MM_PATH, '/mmap');
    assert.equal(MM_PUBLISHED, '2026-10-14');
    assert.equal(MM_TITLE, 'mmap vs --no-mmap vs --mlock on Radeon');
    assert.ok(MM_DESCRIPTION.length >= 70);
    assert.ok(MM_DESCRIPTION.length <= 160);
    assert.equal(
      MM_CITED_LABEL,
      'Cited llama.cpp --load-mode · mmap / --no-mmap / --mlock RAM not yet measured',
    );
    assert.equal(MM_PACK, 'Model loading A/B');
    assert.equal(MM_UNMEASURED, 'not yet measured');
    assert.ok(MM_STEPS.length >= 5);
    assert.ok(MM_SOURCES.every((row) => row.href.startsWith('https://')));
    assert.match(MM_HOUSE, new RegExp(MM_HOUSE_SERVER_FLAGS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    const houseFlags = MM_HOUSE.split('\n').filter((line) => !line.startsWith('#')).join('\n');
    assert.doesNotMatch(houseFlags, /--load-mode/);
    assert.doesNotMatch(houseFlags, /--no-mmap/);
    assert.doesNotMatch(houseFlags, /--mlock/);
    assert.match(MM_DOCS, /--load-mode auto/);
    assert.match(MM_NO_MMAP, /--load-mode none/);
    assert.match(MM_MLOCK, /--load-mode mlock/);
    assert.match(MM_RUN_IT, /Model loading A\/B/);
    assert.match(MM_RUN_IT, /amdai-bench\.ts ingest/);
    assert.match(MM_HOUSE, new RegExp(MM_HOUSE_FILE.replace(/\./g, '\\.')));
    assert.ok(MM_QUANTS.some((row) => row.quant === 'UD-Q3_K_XL' && row.estimate));
    assert.ok(MM_QUANTS.every((row) => row.load === MM_UNMEASURED));
    const blob = mmBlob();
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /AMDai/);
    assert.match(blob, /--load-mode/);
    assert.match(blob, /--no-mmap/);
    assert.match(blob, /--mlock/);
    assert.match(blob, /Model loading A\/B/);
    assert.match(blob, /Minimum system RAM needed/);
    assert.match(blob, /RAM needed at full context/);
    assert.match(blob, /not yet measured/);
    assert.match(blob, /Q4 and up/);
    assert.match(blob, /do not download Q3/i);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.doesNotMatch(blob, /amdai-stack-lab:(?:\/\/)?(?:mmap|model-loading)/);
    const hrefs = mmHrefs();
    for (const required of REQUIRED_MM_HREFS) {
      const path = required.split('#')[0] ?? required;
      assert.ok(hrefs.includes(path) || hrefs.includes(required), required);
    }
  });

  it('wires the dedicated page and stays in the sitemap', () => {
    const page = readFileSync(join(here, '../pages/mmap.astro'), 'utf8');
    assert.match(page, /MM_LEAD/);
    assert.match(page, /llama\.cpp/);
    assert.match(page, /Open in Stack Lab/);
    assert.match(page, /Run it yourself/);
    assert.match(page, /NextSteps/);
    assert.match(page, /HouseRam/);
    assert.match(page, /MM_H1/);
    assert.match(page, /mmap, --no-mmap, and --mlock/);
    assert.equal(MM_H1.includes('Radeon GPU with llama.cpp'), true);
    assert.doesNotMatch(page, /coming soon/i);
    assert.doesNotMatch(page, /amdai-stack-lab:mmap/);
    assert.equal(shouldNoindex('/mmap'), false);
    assert.equal(isSitemapExcluded('/mmap'), false);
    assert.ok(primaryNav.some((item) => item.href === '/mmap'));
  });
});
