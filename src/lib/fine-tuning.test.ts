import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { isSitemapExcluded, shouldNoindex } from './seo';
import { primaryNav } from './site';
import {
  FINE_TUNING_CITED_LABEL,
  FINE_TUNING_DESCRIPTION,
  FINE_TUNING_EXPORT,
  FINE_TUNING_FIT_ROWS,
  FINE_TUNING_SPEED_LABEL,
  FINE_TUNING_TITLE,
  REQUIRED_FINE_TUNING_HREFS,
  assertFineTuningValid,
  fineTuningBlob,
  fineTuningHrefs,
} from './fine-tuning';

const here = dirname(fileURLToPath(import.meta.url));

describe('fine-tuning guide', () => {
  it('stays cited, llama.cpp-first after export, and invents no speeds', () => {
    assert.deepEqual(assertFineTuningValid(), []);
    assert.equal(FINE_TUNING_TITLE, 'Fine-tuning on Radeon');
    assert.equal(FINE_TUNING_CITED_LABEL, 'Cited, not measured on local-desktop');
    assert.equal(FINE_TUNING_SPEED_LABEL, 'not yet measured on our R9700s');
    assert.ok(FINE_TUNING_DESCRIPTION.length >= 70);
    assert.ok(FINE_TUNING_DESCRIPTION.length <= 160);
    const blob = fineTuningBlob();
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /llama-server/);
    assert.match(blob, /convert_hf_to_gguf/);
    assert.match(blob, /llama-quantize/);
    assert.match(blob, /Q6_K/);
    assert.match(blob, /Q5_K_M/);
    assert.match(blob, /Q4_K_M/);
    assert.match(blob, /Q3_K_M/);
    assert.match(blob, /labeled estimate/);
    assert.match(blob, /unsloth\[amd\]/);
    assert.match(blob, /TORCH_BLAS_PREFER_HIPBLASLT=0/);
    assert.match(blob, /not verified on Radeon/);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.ok(blob.includes(RAM_MIN_LABEL));
    assert.ok(blob.includes(RAM_FULL_LABEL));
    assert.ok(blob.includes(FINE_TUNING_SPEED_LABEL));
    assert.match(FINE_TUNING_EXPORT.serve, /llama-server/);
    assert.doesNotMatch(blob, /TODO|TBD|FIXME|coming soon/i);
    assert.doesNotMatch(blob, /\$\d|\bMSRP\b/);
    assert.doesNotMatch(blob, /\b\d+(?:\.\d+)?\s*tok\/s\b/i);
    assert.doesNotMatch(blob, /floor is q4|q4 floor|q4 and up only/i);
    assert.ok(FINE_TUNING_FIT_ROWS.every((row) => row.speed === FINE_TUNING_SPEED_LABEL));
    const hrefs = fineTuningHrefs();
    for (const required of REQUIRED_FINE_TUNING_HREFS) {
      assert.ok(hrefs.some((href) => href === required || href.startsWith(`${required}/`)), required);
    }
  });

  it('wires the dedicated page and stays in the sitemap', () => {
    const page = readFileSync(join(here, '../pages/fine-tuning.astro'), 'utf8');
    const start = readFileSync(join(here, '../pages/start.astro'), 'utf8');
    const faq = readFileSync(join(here, './faq.ts'), 'utf8');
    assert.match(page, /NextSteps/);
    assert.match(page, /HowWeTest/);
    assert.match(page, /OpenInStackLab/);
    assert.match(page, /HOUSE_STACK_LAB\.doctor/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.doesNotMatch(page, /Qwen2\.5|Qwen3-8B/);
    assert.match(start, /\/fine-tuning/);
    assert.match(faq, /\/fine-tuning/);
    assert.equal(shouldNoindex('/fine-tuning'), false);
    assert.equal(isSitemapExcluded('/fine-tuning'), false);
    assert.ok(primaryNav.some((item) => item.href === '/fine-tuning'));
  });
});
