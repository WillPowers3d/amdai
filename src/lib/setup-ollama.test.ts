import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { primaryNav } from './site';
import { isSitemapExcluded, shouldNoindex } from './seo';
import { COMPARE_Q3 } from './local-desktop-compare';
import {
  REQUIRED_SETUP_OLLAMA_HREFS,
  SETUP_OLLAMA_CITED_LABEL,
  SETUP_OLLAMA_HOUSE_FILE,
  SETUP_OLLAMA_LIBRARY_Q4,
  SETUP_OLLAMA_PUBLISHED,
  SETUP_OLLAMA_QUANTS,
  SETUP_OLLAMA_STEPS,
  SETUP_OLLAMA_TRACKS,
  SETUP_OLLAMA_V1,
  assertSetupOllamaValid,
  setupOllamaBlob,
  setupOllamaHrefs,
} from './setup-ollama';

const here = dirname(fileURLToPath(import.meta.url));

describe('Ollama Radeon setup', () => {
  it('keeps llama.cpp first, cited install, and house rules', () => {
    assert.deepEqual(assertSetupOllamaValid(), []);
    assert.equal(SETUP_OLLAMA_PUBLISHED, '2026-10-14');
    assert.equal(SETUP_OLLAMA_CITED_LABEL, 'Cited, not measured on the local desktop');
    assert.equal(SETUP_OLLAMA_TRACKS[0]?.id, 'llamacpp');
    assert.equal(SETUP_OLLAMA_TRACKS[1]?.recommend, false);
    assert.equal(SETUP_OLLAMA_HOUSE_FILE, 'Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf');
    assert.equal(SETUP_OLLAMA_LIBRARY_Q4, 'qwen3.6:35b-a3b-q4_K_M');
    assert.equal(SETUP_OLLAMA_V1, 'http://127.0.0.1:11434/v1');
    assert.ok(SETUP_OLLAMA_STEPS.length >= 7);
    assert.equal(SETUP_OLLAMA_QUANTS.find((row) => row.quant === COMPARE_Q3)?.estimate, true);
    const blob = setupOllamaBlob();
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /Minimum system RAM needed/);
    assert.match(blob, /RAM needed at full context/);
    assert.match(blob, /102\.39/);
    assert.match(blob, /not inside Ollama/i);
    assert.match(blob, /NVMe/);
    const hrefs = setupOllamaHrefs();
    for (const required of REQUIRED_SETUP_OLLAMA_HREFS) {
      assert.ok(
        hrefs.some((href) => href === required || href.startsWith(`${required}/`)),
        required,
      );
    }
  });

  it('wires the dedicated page and stays in the sitemap', () => {
    const page = readFileSync(join(here, '../pages/setup/ollama.astro'), 'utf8');
    const hub = readFileSync(join(here, '../pages/setup.astro'), 'utf8');
    assert.match(page, /llama\.cpp/);
    assert.match(page, /ollama ps/);
    assert.match(page, /NextSteps/);
    assert.match(page, /Open in Stack Lab/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.doesNotMatch(page, /Qwen2\.5|Qwen3-8B/);
    assert.match(hub, /\/setup\/ollama/);
    assert.equal(shouldNoindex('/setup/ollama'), false);
    assert.equal(isSitemapExcluded('/setup/ollama'), false);
    assert.ok(primaryNav.some((item) => item.href === '/setup/ollama'));
  });
});
