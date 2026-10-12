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

  it('keeps the Flash figure first-party and does not invent 35B tok/s', () => {
    const strata = list.find((row) => row.id === 'strata')!;
    const blob = `${strata.choose} ${strata.well} ${strata.short}`;
    assert.match(blob, /32\.6/);
    assert.match(blob, /16/);
    const joined = list.map((row) => `${row.what} ${row.run} ${row.choose}`).join('\n');
    assert.doesNotMatch(joined, /100\.8/);
    assert.doesNotMatch(joined, /108\.3/);
    assert.doesNotMatch(joined, /116\.5/);
  });

  it('states the Q4 floor and keeps the flowchart on llama.cpp', () => {
    for (const row of list) {
      assert.match(row.quants, /Q4/i, row.id);
    }
    assert.match(BACKEND_FLOWCHART, /llama\.cpp/);
    assert.match(BACKEND_FLOWCHART, /32\.6/);
    assert.ok(file.flowchart_fallback[0]?.includes('llama.cpp'));
  });
});
