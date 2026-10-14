import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { primaryNav } from './site';
import { isSitemapExcluded, shouldNoindex } from './seo';
import {
  CT_CITED_LABEL,
  CT_DESCRIPTION,
  CT_H1,
  CT_HOUSE,
  CT_HOUSE_FILE,
  CT_HOUSE_SERVER_FLAGS,
  LLAMA_PIN,
  LLAMA_PIN_SHORT,
  CT_PATH,
  CT_PUBLISHED,
  CT_QUANTS,
  CT_SOURCES,
  CT_STEPS,
  CT_SYMPTOMS,
  CT_TITLE,
  CT_UNMEASURED,
  REQUIRED_CT_HREFS,
  assertCtValid,
  ctBlob,
  ctHrefs,
} from './chat-templates';

const here = dirname(fileURLToPath(import.meta.url));

describe('chat templates and --jinja on Radeon', () => {
  it('keeps cited --jinja flags, GGUF key, and house rules', () => {
    assert.deepEqual(assertCtValid(), []);
    assert.equal(CT_PATH, '/chat-templates');
    assert.equal(CT_PUBLISHED, '2026-10-14');
    assert.equal(CT_TITLE, 'Chat templates on Radeon');
    assert.ok(CT_DESCRIPTION.length >= 70);
    assert.ok(CT_DESCRIPTION.length <= 160);
    assert.equal(
      CT_CITED_LABEL,
      'Cited llama.cpp --jinja · GGUF tokenizer.chat_template · house recipes pass --jinja',
    );
    assert.equal(CT_UNMEASURED, 'not yet measured');
    assert.ok(CT_STEPS.length >= 5);
    assert.ok(CT_SYMPTOMS.length >= 5);
    assert.ok(CT_SOURCES.every((row) => row.href.startsWith('https://')));
    assert.match(CT_HOUSE, new RegExp(CT_HOUSE_SERVER_FLAGS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(CT_HOUSE, /--jinja/);
    const houseFlags = CT_HOUSE.split('\n').filter((line) => !line.startsWith('#')).join('\n');
    assert.doesNotMatch(houseFlags, /--chat-template-file/);
    assert.match(CT_HOUSE, new RegExp(CT_HOUSE_FILE.replace(/\./g, '\\.')));
    assert.ok(CT_QUANTS.some((row) => row.quant === 'UD-Q3_K_XL' && row.estimate));
    const blob = ctBlob();
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /AMDai/);
    assert.match(blob, /--jinja/);
    assert.match(blob, /tokenizer\.chat_template/);
    assert.match(blob, new RegExp(LLAMA_PIN_SHORT));
    assert.ok(CT_SOURCES.some((row) => row.href.includes(LLAMA_PIN)));
    assert.ok(CT_SOURCES.every((row) => !row.href.includes('/blob/master/')));
    assert.match(blob, /--chat-template-kwargs/);
    assert.match(blob, /--reasoning-format/);
    assert.match(blob, /Minimum system RAM needed/);
    assert.match(blob, /RAM needed at full context/);
    assert.match(blob, /Q4 and up/);
    assert.match(blob, /do not download Q3/i);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    const hrefs = ctHrefs();
    for (const required of REQUIRED_CT_HREFS) {
      const path = required.split('#')[0] ?? required;
      assert.ok(hrefs.includes(path) || hrefs.includes(required), required);
    }
  });

  it('wires the dedicated page and stays in the sitemap', () => {
    const page = readFileSync(join(here, '../pages/chat-templates.astro'), 'utf8');
    assert.match(page, /CT_LEAD/);
    assert.match(page, /llama\.cpp/);
    assert.match(page, /Open in Stack Lab/);
    assert.match(page, /NextSteps/);
    assert.match(page, /HouseRam/);
    assert.match(page, /CT_H1/);
    assert.match(page, /What a chat template is/);
    assert.match(page, /Symptom to fix/);
    assert.equal(CT_H1.includes('Radeon GPU with llama.cpp'), true);
    assert.doesNotMatch(page, /coming soon/i);
    assert.equal(shouldNoindex('/chat-templates'), false);
    assert.equal(isSitemapExcluded('/chat-templates'), false);
    assert.ok(primaryNav.some((item) => item.href === '/chat-templates'));
  });
});
