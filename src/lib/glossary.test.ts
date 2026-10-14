import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { gluedSentenceHits } from './html-text';
import {
  GLOSSARY,
  REQUIRED_GLOSSARY_IDS,
  activeLetters,
  assertGlossaryValid,
  entryById,
  filterGlossary,
  glossaryHaystack,
  groupByLetter,
  parseGlossaryQuery,
} from './glossary';
import { allNav, primaryNav } from './site';

const ALLOWED_HREFS = new Set([
  '/abliterated',
  '/backends',
  '/backends/llamacpp',
  '/backends/lmstudio',
  '/backends/strata',
  '/backends/vllm',
  '/harnesses/lm-studio',
  '/benchmarks',
  '/bios',
  '/budget',
  '/compare/one-vs-two-gpu',
  '/compare/q4-q5-q6',
  '/compare/gpus',
  '/compare/models',
  '/compare/vulkan-vs-rocm',
  '/compare/radeon-vs-mac',
  '/calculator',
  '/credits',
  '/faq',
  '/flash-daily',
  '/flash-ram-offload',
  '/gpus',
  '/gpus/r9700',
  '/gpus/strix-halo',
  '/gpus/ryzen-igpu',
  '/gpus/rx-7900-xtx',
  '/gpus/rx-7900-xt',
  '/gpus/rx-7800-xt',
  '/gpus/rx-9070-xt',
  '/gpus/rx-6800-xt',
  '/hardware',
  '/models',
  '/models/flash',
  '/models/gemma3-27b',
  '/models/gpt-oss-20b',
  '/models/llama33-70b',
  '/models/glm-53-flash',
  '/models/qwen36',
  '/models/qwen36-27b',
  '/models/qwen38-27b',
  '/multi-gpu',
  '/quants',
  '/qwen',
  '/qwen36-dual',
  '/recipes/qwen36-35b.llamacpp-vulkan.262k',
  '/recipes/qwen38-flash.strata.262k',
  '/results',
  '/rocm',
  '/rocm/glossary',
  '/software',
  '/setup',
  '/setup/windows',
  '/setup/fedora',
  '/setup/arch',
  '/setup/docker',
  '/setup/lm-studio',
  '/setup/coding-assistant',
  '/setup/ollama',
  '/setup/open-webui',
  '/setup/wsl',
  '/setup/comfyui',
  '/setup/multi-gpu',
  '/guides/buying-used-radeon',
  '/image-gen',
  '/harnesses/image',
  '/rocm-problems/windows-wsl-preview',
  '/harnesses/open-webui',
  '/backends/ollama',
  '/rocm-problems/ollama-gfx1201-tensile',
  '/harnesses/aider',
  '/harnesses/cline',
  '/harnesses/continue',
  '/stack-lab',
  '/troubleshoot/errors',
  '/stacks',
  '/start',
  '/tutorials/install-rocm',
  '/tutorials/run-local-llm',
  '/tutorials/serve-qwen',
  '/tutorials/verify-rocm',
  '/vision',
  '/fine-tuning',
  '/tuning',
  '/moe',
  '/can-run',
]);

describe('consumer glossary', () => {
  it('covers the required terms with valid cross-links', () => {
    assert.deepEqual(assertGlossaryValid(), []);
    for (const id of REQUIRED_GLOSSARY_IDS) {
      assert.ok(entryById(id), id);
    }
    assert.ok(GLOSSARY.length >= REQUIRED_GLOSSARY_IDS.length);
    for (const entry of GLOSSARY) {
      for (const link of entry.links) {
        const path = link.href.split('#')[0] ?? link.href;
        assert.ok(ALLOWED_HREFS.has(path), `${entry.id} unexpected href ${link.href}`);
      }
    }
  });

  it('filters, shares ?q=, and groups A–Z', () => {
    assert.equal(parseGlossaryQuery('?q=kv+cache'), 'kv cache');
    assert.equal(parseGlossaryQuery(new URLSearchParams('q=ROCm')), 'ROCm');
    assert.equal(parseGlossaryQuery(''), '');
    const kv = filterGlossary('kv cache');
    assert.ok(kv.some((row) => row.id === 'kv-cache'));
    const ot = filterGlossary('-ot');
    assert.ok(ot.some((row) => row.id === 'expert-offload'));
    assert.equal(filterGlossary('zzzz-no-such-term').length, 0);
    assert.equal(filterGlossary('').length, GLOSSARY.length);
    assert.ok(glossaryHaystack(entryById('quant')!).includes('q3'));
    assert.ok(entryById('rebar'));
    assert.ok(filterGlossary('resizable bar').some((row) => row.id === 'rebar'));
    assert.ok(filterGlossary('mmio').some((row) => row.id === 'rebar'));
    assert.ok((entryById('llamacpp')?.deeper ?? '').includes('c060ca974'));
    const groups = groupByLetter();
    assert.equal(groups.length, 26);
    assert.ok(groups.find((g) => g.letter === 'R')?.entries.some((e) => e.id === 'rocm'));
    assert.equal(groups.find((g) => g.letter === 'X')?.entries.length, 0);
    assert.ok(activeLetters().has('R'));
    assert.ok(!activeLetters().has('X'));
  });

  it('keeps house rules, brand, and measured-only figures', () => {
    const blob = GLOSSARY.map((row) => `${row.term}\n${row.definition}\n${row.why}\n${row.deeper ?? ''}`).join('\n');
    assert.match(blob, /AMDai/);
    assert.match(blob, /amdai-bench\/run@1/);
    assert.doesNotMatch(blob, /AMDAI-BENCH|Amdai-Bench/);
    assert.match(blob, /Vulkan first/i);
    assert.match(blob, /not the daily driver/i);
    assert.match(blob, /estimate/i);
    assert.match(blob, /Q1\/Q2 stay off/);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.doesNotMatch(blob, /floor is q4|q4 floor|q4 and up only/i);
    assert.match(blob, /102\.39/);
    assert.match(blob, /42\.9/);
    assert.match(blob, /82\.78/);
    assert.ok(primaryNav.some((item) => item.href === '/glossary'));
    assert.ok(allNav.some((item) => item.href === '/glossary'));
    assert.match(primaryNav.find((item) => item.href === '/glossary')?.description ?? '', /ROCm|jargon|KV/i);
    assert.ok(GLOSSARY.filter((row) => row.deeper).length >= 12);
    for (const entry of GLOSSARY) {
      const hits = gluedSentenceHits(`${entry.definition} ${entry.why} ${entry.deeper ?? ''}`);
      assert.deepEqual(hits, [], `${entry.id} glue ${hits[0]?.snippet ?? ''}`);
    }
  });
});
