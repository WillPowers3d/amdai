import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import {
  BACKEND_FLOWCHART,
  assertBackendsValid,
  backendPath,
  parseBackends,
  usedOnOurRig,
  type Backend,
} from './backends';

const raw = readFileSync(new URL('../data/backends.yaml', import.meta.url), 'utf8');
const file = parseBackends(parse(raw));
const list: Backend[] = file.engines;

describe('inference engine catalog', () => {
  it('seeds unique cited engines and defaults to llama.cpp', () => {
    assert.ok(file.as_of);
    assert.equal(file.default_id, 'llamacpp');
    assert.ok(list.length >= 10);
    assert.deepEqual(assertBackendsValid(file), []);
    const ids = list.map((row) => row.id);
    for (const id of [
      'llamacpp',
      'strata',
      'vllm',
      'ollama',
      'lmstudio',
      'sglang',
      'exllama',
      'mlc',
      'ktransformers',
      'pytorch',
    ]) {
      assert.ok(ids.includes(id), id);
    }
    assert.equal(backendPath('llamacpp'), '/backends/llamacpp');
  });

  it('only cites http(s) sources and marks llama.cpp + Strata as used on our rig', () => {
    assert.deepEqual(
      usedOnOurRig(list).map((row) => row.id),
      ['llamacpp', 'strata'],
    );
    for (const row of list) {
      assert.ok(row.sources.length, row.id);
      for (const source of row.sources) {
        assert.match(source.href, /^https:\/\//, `${row.id} ${source.title}`);
      }
    }
  });

  it('keeps Flash and 35B figures first-party and labeled', () => {
    const strata = list.find((row) => row.id === 'strata')!;
    const llama = list.find((row) => row.id === 'llamacpp')!;
    const blob = `${strata.choose} ${strata.well} ${strata.short}`;
    assert.match(blob, /32\.6/);
    assert.match(blob, /16/);
    const llamaBlob = `${llama.moe} ${llama.choose} ${llama.context}`;
    assert.match(llamaBlob, /102\.39/);
    assert.match(llamaBlob, /109\.73/);
    assert.match(llamaBlob, /117\.69/);
    assert.match(llamaBlob, /1902\.1/);
    assert.match(llamaBlob, /24\.68 GB/);
    assert.match(llamaBlob, /Measured on our rig, 2026-10/);
    const others = list
      .filter((row) => row.id !== 'llamacpp')
      .map((row) => `${row.what} ${row.run} ${row.choose}`)
      .join('\n');
    assert.doesNotMatch(others, /102\.39/);
    assert.doesNotMatch(others, /109\.73/);
    assert.doesNotMatch(others, /117\.69/);
  });

  it('lists Q3 or says Q1/Q2 stay off, and keeps the flowchart on llama.cpp', () => {
    for (const row of list) {
      assert.match(row.quants, /Q3|Q1\s*\/\s*Q2|Q1 and Q2/i, row.id);
    }
    assert.match(BACKEND_FLOWCHART, /llama\.cpp/);
    assert.match(BACKEND_FLOWCHART, /32\.6/);
    assert.ok(file.flowchart_fallback[0]?.includes('llama.cpp'));
  });
});
