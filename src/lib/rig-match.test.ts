import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { normalizeUpdate, updateMatchesRig, updatesForRig, type SavedRigMatch, type StackUpdate } from './rig-match';
import { isQuantAllowed } from './quant-guard';
import { shareToRigDraft } from './share-to-rig';

const raw = readFileSync(new URL('../data/stack-updates.yaml', import.meta.url), 'utf8');
const file = parse(raw) as { updates: Array<Parameters<typeof normalizeUpdate>[0]> };
const updates: StackUpdate[] = file.updates.map((row) => normalizeUpdate(row));

const r9700Vulkan: SavedRigMatch = {
  name: 'local-desktop daily',
  gpu: 'Radeon AI PRO R9700',
  gfx: 'gfx1201',
  rocmVersion: '10.1.0',
  backend: 'llama.cpp',
  models: [{ name: 'Qwen3.6-35B-A3B', quant: 'UD-Q5_K_XL' }],
  os: 'Linux',
  distro: 'Ubuntu',
};

const ollamaWindows: SavedRigMatch = {
  name: 'windows box',
  gpu: 'R9700',
  gfx: 'gfx1201',
  backend: 'ollama',
  os: 'Windows',
};

const rx7900: SavedRigMatch = {
  name: '7900',
  gpu: 'Radeon RX 7900 XTX',
  gfx: 'gfx1100',
  backend: 'llama.cpp',
  os: 'Linux',
};

describe('quant guard', () => {
  it('allows Q3 and up', () => {
    assert.equal(isQuantAllowed('Q3_K_M'), true);
    assert.equal(isQuantAllowed('Q3_K_S'), true);
    assert.equal(isQuantAllowed('UD-Q3_K_XL'), true);
    assert.equal(isQuantAllowed('UD-IQ3_S'), true);
    assert.equal(isQuantAllowed('Q4_K_M'), true);
    assert.equal(isQuantAllowed('UD-Q5_K_XL'), true);
    assert.equal(isQuantAllowed('bf16'), true);
  });
  it('rejects Q1/Q2', () => {
    assert.equal(isQuantAllowed('IQ2_M'), false);
    assert.equal(isQuantAllowed('Q2_K'), false);
    assert.equal(isQuantAllowed('Q1_K'), false);
    assert.equal(isQuantAllowed('IQ1_S'), false);
  });
});

describe('updateMatchesRig', () => {
  it('matches ROCm 10.1 on an R9700 gfx1201 rig', () => {
    const update = updates.find((u) => u.id === 'rocm-10-1-0-r9700');
    assert.ok(update);
    const result = updateMatchesRig(update, r9700Vulkan);
    assert.equal(result.matched, true);
  });

  it('does not match ROCm 10.1 against a gfx1100 7900', () => {
    const update = updates.find((u) => u.id === 'rocm-10-1-0-r9700');
    assert.ok(update);
    assert.equal(updateMatchesRig(update, rx7900).matched, false);
  });

  it('matches Ollama Windows HSA override only on Ollama + Windows + R9700', () => {
    const update = updates.find((u) => u.id === 'ollama-hsa-override-r9700-windows');
    assert.ok(update);
    assert.equal(updateMatchesRig(update, ollamaWindows).matched, true);
    assert.equal(updateMatchesRig(update, r9700Vulkan).matched, false);
  });

  it('matches hipErrorNoBinary for llama.cpp gfx1201', () => {
    const update = updates.find((u) => u.id === 'hip-no-binary-for-gpu');
    assert.ok(update);
    assert.equal(updateMatchesRig(update, r9700Vulkan).matched, true);
    assert.equal(updateMatchesRig(update, rx7900).matched, false);
  });

  it('still matches TODO rows so the account panel can label them', () => {
    const update = updates.find((u) => u.id === 'rocm-10-0-finetune-reset-r9700');
    assert.ok(update);
    assert.equal(update.todo, true);
    assert.equal(updateMatchesRig(update, { ...r9700Vulkan, rocmVersion: '10.0.0' }).matched, true);
  });

  it('rejects a version miss on ROCm 10.1 when the rig pins 7.14', () => {
    const update = updates.find((u) => u.id === 'rocm-10-1-0-r9700');
    assert.ok(update);
    const old = { ...r9700Vulkan, rocmVersion: '7.14.1' };
    assert.equal(updateMatchesRig(update, old).matched, false);
  });
});

describe('updatesForRig', () => {
  it('returns only matching rows', () => {
    const hits = updatesForRig(r9700Vulkan, updates).map((u) => u.id);
    assert.ok(hits.includes('rocm-10-1-0-r9700'));
    assert.ok(!hits.includes('ollama-hsa-override-r9700-windows'));
  });
});

describe('shareToRigDraft', () => {
  it('reads a calculator share link', () => {
    const draft = shareToRigDraft(
      'gpu=r9700&vram=32&n=1&split=0&ram=256&model=qwen36&quant=q5_k_m&ctx=262144&priority=speed&usage=local&style=standard',
      'calculator',
    );
    assert.equal(draft.gpuCount, 1);
    assert.equal(draft.vramGb, 32);
    assert.equal(draft.backend, 'llama.cpp');
    assert.equal(draft.priority, 'speed');
    assert.ok(isQuantAllowed(draft.models[0].quant));
  });

  it('maps a budget tier share', () => {
    const draft = shareToRigDraft('tier=pro&priority=size&usage=local&style=standard', 'budget');
    assert.equal(draft.gpuCount, 2);
    assert.equal(draft.ramGb, 256);
  });
});
