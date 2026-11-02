import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PII_TEXT } from './pii-denylist';
import { isSitemapExcluded, shouldNoindex } from './seo';
import { primaryNav } from './site';
import {
  BEST_GPU_PATH,
  BUYER_CHECKED,
  BUYER_PATHS,
  BUYER_REL,
  CODING_MODEL_PATH,
  FLASH_REQ_PATH,
  GLM_REQ_PATH,
  PC_BUILD_PATH,
  QWEN36_REQ_PATH,
  R9700_REVIEW_PATH,
} from './buyer-pages';
import { assertBestGpuValid, BEST_GPU_DESCRIPTION, BEST_GPU_TITLE } from './best-amd-gpu';
import { assertCodingValid, CODING_DESCRIPTION, CODING_TITLE } from './best-coding-model';
import { assertFlashReqValid, FLASH_Q4_GIB, FLASH_REQ_DESCRIPTION } from './flash-requirements';
import { assertGlmReqValid, GLM_Q4_GIB, GLM_REQ_DESCRIPTION } from './glm-requirements';
import { assertPcBuildValid, PC_BUILD_DESCRIPTION, pcBuildBlob } from './local-llm-pc-build';
import { assertQwen36ReqValid, QWEN36_REQ_DESCRIPTION } from './qwen36-requirements';
import { assertR9700ReviewValid, R9700_REVIEW_DESCRIPTION } from './r9700-review';

const here = dirname(fileURLToPath(import.meta.url));

describe('Buyer-query pages (PR B)', () => {
  it('keeps house rules on every hub', () => {
    assert.deepEqual(assertQwen36ReqValid(), []);
    assert.deepEqual(assertFlashReqValid(), []);
    assert.deepEqual(assertGlmReqValid(), []);
    assert.deepEqual(assertBestGpuValid(), []);
    assert.deepEqual(assertPcBuildValid(), []);
    assert.deepEqual(assertR9700ReviewValid(), []);
    assert.deepEqual(assertCodingValid(), []);
    assert.equal(BUYER_CHECKED, '2026-11-02');
    assert.equal(BUYER_REL, 'sponsored nofollow noopener');
    assert.equal(FLASH_Q4_GIB, 103.7);
    assert.equal(GLM_Q4_GIB, 186.0);
    assert.ok(QWEN36_REQ_DESCRIPTION.length >= 70 && QWEN36_REQ_DESCRIPTION.length <= 160);
    assert.ok(FLASH_REQ_DESCRIPTION.length >= 70 && FLASH_REQ_DESCRIPTION.length <= 160);
    assert.ok(GLM_REQ_DESCRIPTION.length >= 70 && GLM_REQ_DESCRIPTION.length <= 160);
    assert.ok(BEST_GPU_DESCRIPTION.length >= 70 && BEST_GPU_DESCRIPTION.length <= 160);
    assert.ok(PC_BUILD_DESCRIPTION.length >= 70 && PC_BUILD_DESCRIPTION.length <= 160);
    assert.ok(R9700_REVIEW_DESCRIPTION.length >= 70 && R9700_REVIEW_DESCRIPTION.length <= 160);
    assert.ok(CODING_DESCRIPTION.length >= 70 && CODING_DESCRIPTION.length <= 160);
    assert.match(pcBuildBlob(), /96 GB/);
    assert.doesNotMatch(pcBuildBlob(), /32 GB \(2x16\)|32 GB \(2×16\)/);
    assert.match(BEST_GPU_TITLE, /Best AMD GPU/);
    assert.match(CODING_TITLE, /coding model/);
  });

  it('wires dedicated pages, sitemap, and nav', () => {
    const pages: Array<[string, string]> = [
      [QWEN36_REQ_PATH, '../pages/models/qwen36/requirements.astro'],
      [FLASH_REQ_PATH, '../pages/models/flash/requirements.astro'],
      [GLM_REQ_PATH, '../pages/models/glm-53-flash/requirements.astro'],
      [BEST_GPU_PATH, '../pages/best-amd-gpu-for-llm.astro'],
      [PC_BUILD_PATH, '../pages/local-llm-pc-build.astro'],
      [R9700_REVIEW_PATH, '../pages/gpus/r9700/review.astro'],
      [CODING_MODEL_PATH, '../pages/best-local-coding-model-32gb.astro'],
    ];
    for (const [path, file] of pages) {
      const text = readFileSync(join(here, file), 'utf8');
      assert.match(text, /BuyerArticle/);
      assert.doesNotMatch(text, PII_TEXT);
      assert.equal(shouldNoindex(path), false);
      assert.equal(isSitemapExcluded(path), false);
      assert.ok(primaryNav.some((item) => item.href === path), path);
    }
    assert.equal(BUYER_PATHS.length, 7);
  });
});
