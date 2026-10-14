import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { primaryNav } from './site';
import { isSitemapExcluded, shouldNoindex } from './seo';
import { COMPARE_Q3 } from './local-desktop-compare';
import {
  REQUIRED_SETUP_CODING_HREFS,
  SETUP_CODING_CITED_LABEL,
  SETUP_CODING_CLIENTS,
  SETUP_CODING_HOUSE_FILE,
  SETUP_CODING_PUBLISHED,
  SETUP_CODING_QUANTS,
  SETUP_CODING_SERVER,
  SETUP_CODING_SERVER_CMD,
  SETUP_CODING_SOURCES,
  SETUP_CODING_STEPS,
  SETUP_CODING_TRACKS,
  assertSetupCodingValid,
  setupCodingBlob,
  setupCodingHrefs,
} from './setup-coding-assistant';

const here = dirname(fileURLToPath(import.meta.url));

describe('local coding assistant setup', () => {
  it('keeps llama.cpp first, cited clients, and house rules', () => {
    assert.deepEqual(assertSetupCodingValid(), []);
    assert.equal(SETUP_CODING_PUBLISHED, '2026-10-14');
    assert.equal(SETUP_CODING_CITED_LABEL, 'Cited attach; llama.cpp measured on local-desktop');
    assert.equal(SETUP_CODING_TRACKS[0]?.id, 'llamacpp');
    assert.equal(SETUP_CODING_TRACKS[1]?.recommend, false);
    assert.equal(SETUP_CODING_HOUSE_FILE, 'Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf');
    assert.equal(SETUP_CODING_SERVER, 'http://127.0.0.1:8080/v1');
    assert.match(SETUP_CODING_SERVER_CMD, /-ngl 99/);
    assert.match(SETUP_CODING_SERVER_CMD, /262144/);
    assert.match(SETUP_CODING_SERVER_CMD, /--port 8080/);
    assert.ok(SETUP_CODING_STEPS.length >= 6);
    assert.equal(SETUP_CODING_CLIENTS.map((row) => row.id).join(','), 'aider,cline,continue');
    assert.equal(SETUP_CODING_QUANTS.find((row) => row.quant === COMPARE_Q3)?.estimate, true);
    assert.ok(SETUP_CODING_SOURCES.every((row) => row.href.startsWith('https://')));
    const blob = setupCodingBlob();
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /Minimum system RAM needed/);
    assert.match(blob, /RAM needed at full context/);
    assert.match(blob, /102\.39/);
    assert.match(blob, /openai\//);
    const hrefs = setupCodingHrefs();
    for (const required of REQUIRED_SETUP_CODING_HREFS) {
      assert.ok(
        hrefs.some((href) => href === required || href.startsWith(`${required}/`)),
        required,
      );
    }
  });

  it('wires the dedicated page and stays in the sitemap', () => {
    const page = readFileSync(join(here, '../pages/setup/coding-assistant.astro'), 'utf8');
    const hub = readFileSync(join(here, '../pages/setup.astro'), 'utf8');
    assert.match(page, /llama\.cpp/);
    assert.match(page, /Aider/);
    assert.match(page, /Cline/);
    assert.match(page, /Continue/);
    assert.match(page, /NextSteps/);
    assert.match(page, /Open in Stack Lab/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.doesNotMatch(page, /Qwen2\.5|Qwen3-8B/);
    assert.match(hub, /\/setup\/coding-assistant/);
    assert.equal(shouldNoindex('/setup/coding-assistant'), false);
    assert.equal(isSitemapExcluded('/setup/coding-assistant'), false);
    assert.ok(primaryNav.some((item) => item.href === '/setup/coding-assistant'));
  });
});
