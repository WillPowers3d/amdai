import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import {
  RAG_CITED_LABEL,
  RAG_DESCRIPTION,
  RAG_FIT_BANDS,
  RAG_FIT_ROWS,
  RAG_MODELS,
  RAG_PUBLISHED,
  RAG_SPEED_LABEL,
  RAG_TITLE,
  assertRagValid,
  ragBlob,
  ragHrefs,
} from './rag';

const here = dirname(fileURLToPath(import.meta.url));

describe('local RAG guide', () => {
  it('stays cited, llama.cpp-first, and invents no retrieval scores', () => {
    assert.deepEqual(assertRagValid(), []);
    assert.equal(RAG_TITLE, 'Local RAG on Radeon');
    assert.equal(RAG_CITED_LABEL, 'Cited, not measured on local-desktop');
    assert.equal(RAG_SPEED_LABEL, 'not yet measured by AMDai');
    assert.equal(RAG_PUBLISHED, '2026-10-14');
    assert.ok(RAG_DESCRIPTION.length >= 70);
    assert.ok(RAG_DESCRIPTION.length <= 160);
    const blob = ragBlob();
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /--embeddings/);
    assert.match(blob, /108 MiB/);
    assert.match(blob, /95 MiB/);
    assert.match(blob, /81 MiB/);
    assert.match(blob, /140 MiB/);
    assert.match(blob, /262 MiB/);
    assert.match(blob, /not yet measured by AMDai/);
    assert.match(blob, /labeled estimate/);
    assert.ok(blob.includes(RAM_MIN_LABEL));
    assert.ok(blob.includes(RAM_FULL_LABEL));
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /TODO|TBD|FIXME|coming soon/i);
    assert.doesNotMatch(blob, /\$\d|\bMSRP\b/);
    assert.doesNotMatch(blob, /floor is q4|q4 floor|q4 and up only/i);
    const hrefs = ragHrefs();
    for (const href of ['/setup', '/setup/windows', '/harnesses/anythingllm', '/long-context', '/wanted']) {
      assert.ok(hrefs.includes(href), href);
    }
    assert.deepEqual(RAG_FIT_BANDS.map((row) => row.quant), ['Q6_K', 'Q5_K_M', 'Q4_K_M', 'Q3_K_M']);
    assert.equal(RAG_FIT_BANDS.find((row) => row.quant === 'Q3_K_M')?.kind, 'q3-estimate');
    assert.ok(RAG_FIT_ROWS.every((row) => row.speed === RAG_SPEED_LABEL && row.pick));
    assert.ok(RAG_FIT_ROWS.filter((row) => row.offload).every((row) => row.fit.includes(RAM_MIN_LABEL) && row.fit.includes(RAM_FULL_LABEL)));
    assert.ok(RAG_MODELS.some((row) => row.id === 'nomic-q6' && row.size === '108 MiB'));
    assert.ok(RAG_MODELS.some((row) => row.id === 'nomic-q3' && row.kind === 'estimate'));
  });

  it('is a real page with NextSteps and no house Stack Lab profile', () => {
    const page = readFileSync(join(here, '../pages/rag.astro'), 'utf8');
    assert.match(page, /NextSteps/);
    assert.match(page, /href="\/stack-lab"/);
    assert.match(page, /RAG_FIT_BANDS/);
    assert.match(page, /Pick by VRAM/);
    assert.match(page, /RAM_MIN_LABEL/);
    assert.match(page, /RAM_FULL_LABEL/);
    assert.doesNotMatch(page, /HOUSE_STACK_LAB|OpenInStackLab/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.doesNotMatch(page, /Qwen2\.5|Qwen3-8B/);
  });
});
