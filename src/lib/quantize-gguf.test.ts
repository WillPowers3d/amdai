import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { primaryNav } from './site';
import { isSitemapExcluded, shouldNoindex } from './seo';
import { COMPARE_Q3, COMPARE_Q3_CITE } from './local-desktop-compare';
import { runs } from './run-card-data';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import {
  BF16_CITE,
  BF16_GB_ESTIMATE,
  HF_SAFETENSORS_CITE,
  HF_SAFETENSORS_GB_ESTIMATE,
  QUANTIZE_GGUF_DESCRIPTION,
  QUANTIZE_GGUF_PATH,
  QUANTIZE_GGUF_PUBLISHED,
  QUANTIZE_GGUF_QUANT,
  QUANTIZE_GGUF_STEPS,
  QUANTIZE_GGUF_TITLE,
  REQUIRED_QUANTIZE_GGUF_HREFS,
  assertQuantizeGgufValid,
  quantizeConvertKitGb,
  quantizeGgufBlob,
  quantizeGgufHrefs,
  quantizeQualityRows,
} from './quantize-gguf';

const here = dirname(fileURLToPath(import.meta.url));

describe('Make your own GGUF quants for a Radeon GPU with llama.cpp', () => {
  it('keeps cited convert / imatrix / quantize steps and house rules', () => {
    assert.deepEqual(assertQuantizeGgufValid(runs), []);
    assert.equal(QUANTIZE_GGUF_PUBLISHED, '2026-10-14');
    assert.equal(QUANTIZE_GGUF_PATH, '/guides/quantize-gguf');
    assert.equal(QUANTIZE_GGUF_TITLE, 'Make your own GGUF quants for a Radeon GPU with llama.cpp');
    assert.ok(QUANTIZE_GGUF_DESCRIPTION.length <= 160);
    assert.ok(QUANTIZE_GGUF_STEPS.length >= 6);
    assert.equal(quantizeConvertKitGb(), 96);
    const blob = quantizeGgufBlob();
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /convert_hf_to_gguf/);
    assert.match(blob, /llama-quantize/);
    assert.match(blob, /llama-imatrix/);
    assert.match(blob, /llama-perplexity/);
    assert.match(blob, /Unsloth/);
    assert.match(blob, /does not reproduce/i);
    assert.match(blob, new RegExp(RAM_MIN_LABEL));
    assert.match(blob, new RegExp(RAM_FULL_LABEL));
    assert.match(blob, /NVMe/);
    assert.ok(blob.includes(COMPARE_Q3));
    assert.ok(blob.includes(COMPARE_Q3_CITE));
    assert.ok(blob.includes(HF_SAFETENSORS_GB_ESTIMATE));
    assert.ok(blob.includes(BF16_GB_ESTIMATE));
    assert.match(HF_SAFETENSORS_CITE, /estimate/i);
    assert.match(BF16_CITE, /estimate/i);
    assert.doesNotMatch(QUANTIZE_GGUF_QUANT, /Q3_K/);
    const hrefs = quantizeGgufHrefs();
    for (const required of REQUIRED_QUANTIZE_GGUF_HREFS) {
      assert.ok(
        hrefs.some((href) => href === required || href.startsWith(required)),
        required,
      );
    }
  });

  it('reuses measured 35B decode and keeps Q3 as a labeled estimate', () => {
    const rows = quantizeQualityRows(runs);
    const q5 = rows.find((row) => row.quant === 'UD-Q5_K_XL');
    const q3 = rows.find((row) => row.quant === COMPARE_Q3);
    assert.ok(q5);
    assert.match(q5!.decode4k, /102\.39/);
    assert.ok(q3?.estimate);
    assert.equal(q3?.decode4k, 'not measured on the local desktop');
    assert.match(q3!.size, /16\.8/);
  });

  it('wires the dedicated page and stays in the sitemap', () => {
    const page = readFileSync(join(here, '../pages/guides/quantize-gguf.astro'), 'utf8');
    const quants = readFileSync(join(here, '../pages/quants.astro'), 'utf8');
    const compare = readFileSync(join(here, '../pages/compare/q4-q5-q6.astro'), 'utf8');
    const models = readFileSync(join(here, '../pages/models/index.astro'), 'utf8');
    const tuning = readFileSync(join(here, '../pages/tuning.astro'), 'utf8');
    assert.match(page, /llama\.cpp/);
    assert.match(page, /QUANTIZE_GGUF_TITLE/);
    assert.match(page, /quantize-gguf/);
    assert.match(page, /NextSteps/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.doesNotMatch(page, /Qwen2\.5|Qwen3-8B/);
    assert.match(quants, /\/guides\/quantize-gguf/);
    assert.match(compare, /\/guides\/quantize-gguf/);
    assert.match(models, /\/guides\/quantize-gguf/);
    assert.match(tuning, /\/guides\/quantize-gguf/);
    assert.equal(shouldNoindex('/guides/quantize-gguf'), false);
    assert.equal(isSitemapExcluded('/guides/quantize-gguf'), false);
    assert.ok(primaryNav.some((item) => item.href === '/guides/quantize-gguf'));
  });
});
