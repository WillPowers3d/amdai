import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { primaryNav } from './site';
import { isSitemapExcluded, shouldNoindex } from './seo';
import {
  REQUIRED_SETUP_SERVER_HREFS,
  SETUP_SERVER_CITED_LABEL,
  SETUP_SERVER_DESCRIPTION,
  SETUP_SERVER_HOUSE_FILE,
  SETUP_SERVER_PATH,
  SETUP_SERVER_PUBLISHED,
  SETUP_SERVER_SOURCES,
  SETUP_SERVER_STEPS,
  SETUP_SERVER_TITLE,
  SETUP_SERVER_UNIT,
  assertSetupServerValid,
  setupServerBlob,
  setupServerHrefs,
} from './setup-server';

const here = dirname(fileURLToPath(import.meta.url));

describe('Always-on llama-server (systemd)', () => {
  it('keeps cited unit, loopback default, and house rules', () => {
    assert.deepEqual(assertSetupServerValid(), []);
    assert.equal(SETUP_SERVER_PATH, '/setup/server');
    assert.equal(SETUP_SERVER_PUBLISHED, '2026-10-14');
    assert.equal(SETUP_SERVER_TITLE, 'Always-on llama-server (systemd)');
    assert.ok(SETUP_SERVER_DESCRIPTION.length >= 70);
    assert.ok(SETUP_SERVER_DESCRIPTION.length <= 160);
    assert.equal(SETUP_SERVER_CITED_LABEL, 'Cited llama.cpp + systemd · not a measured service card');
    assert.ok(SETUP_SERVER_STEPS.length >= 8);
    assert.ok(SETUP_SERVER_SOURCES.every((row) => row.href.startsWith('https://')));
    assert.match(SETUP_SERVER_UNIT, /Type=simple/);
    assert.match(SETUP_SERVER_UNIT, /127\.0\.0\.1/);
    assert.match(SETUP_SERVER_UNIT, new RegExp(SETUP_SERVER_HOUSE_FILE.replace(/\./g, '\\.')));
    const blob = setupServerBlob();
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /AMDai/);
    assert.match(blob, /Minimum system RAM needed/);
    assert.match(blob, /RAM needed at full context/);
    assert.match(blob, /\/setup\/multi-gpu/);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.doesNotMatch(blob, /floor is q4|q4 floor|q4 and up only/i);
    const hrefs = setupServerHrefs();
    for (const required of REQUIRED_SETUP_SERVER_HREFS) {
      assert.ok(hrefs.includes(required), required);
    }
  });

  it('wires the dedicated page and stays in the sitemap', () => {
    const page = readFileSync(join(here, '../pages/setup/server.astro'), 'utf8');
    const hub = readFileSync(join(here, '../pages/setup.astro'), 'utf8');
    assert.match(page, /SETUP_SERVER_LEAD/);
    assert.match(page, /llama\.cpp/);
    assert.match(page, /Open in Stack Lab/);
    assert.match(page, /NextSteps/);
    assert.match(page, /HouseRam/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.match(hub, /\/setup\/server/);
    assert.equal(shouldNoindex('/setup/server'), false);
    assert.equal(isSitemapExcluded('/setup/server'), false);
    assert.ok(primaryNav.some((item) => item.href === '/setup/server'));
  });
});
