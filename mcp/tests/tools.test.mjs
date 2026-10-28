import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { loadSnapshotCatalog } from '../catalog.mjs';
import { callTool, TOOL_DEFS } from '../tools.mjs';
import { isPublicQuant } from '../api-fit.js';

const NEW_TOOLS = ['recommend_stack', 'compare_gpus', 'gpu_prices', 'rocm_issue_lookup', 'list_models'];
const OLD_TOOLS = ['list_quants', 'plan_fit', 'best_quant', 'radeon_measured'];

describe('amdai-fit-mcp tools', () => {
  const catalog = loadSnapshotCatalog();

  it('lists every advertised tool', () => {
    const names = TOOL_DEFS.map((row) => row.name);
    for (const name of [...OLD_TOOLS, ...NEW_TOOLS]) {
      assert.ok(names.includes(name), name);
    }
  });

  it('list_quants returns Q4+ only and cites a page', () => {
    const out = callTool('list_quants', { model: 'qwen36' }, catalog).structuredContent;
    assert.ok(out.quants.length > 0);
    assert.ok(out.quants.every((row) => isPublicQuant(row.id)));
    assert.match(out.source_url, /^https:\/\/amdai\.net\//);
  });

  it('plan_fit and best_quant return calculator share URLs', () => {
    const plan = callTool('plan_fit', { model: 'qwen36', gpu: 'r9700', quant: 'q5_k_m', context: 4096 }, catalog)
      .structuredContent;
    assert.ok(isPublicQuant(plan.quant.id));
    assert.match(plan.calculator, /\/calculator\?/);
    assert.match(plan.source_url, /\/calculator\?/);
    const best = callTool('best_quant', { model: 'qwen36', gpu: 'r9700', context: 4096 }, catalog).structuredContent;
    assert.ok(isPublicQuant(best.quant.id));
    assert.match(best.calculator, /\/calculator\?/);
  });

  it('radeon_measured cites the lab log', () => {
    const out = callTool('radeon_measured', { query: 'R9700' }, catalog).structuredContent;
    assert.match(out.source_url, /\/lab-log/);
    assert.ok(Array.isArray(out.runs));
  });

  it('recommend_stack returns llama.cpp and a Q4+ launch', () => {
    const out = callTool(
      'recommend_stack',
      { gpus: ['r9700'], vram_gb: 32, ram_gb: 256, goal: 'daily' },
      catalog,
    ).structuredContent;
    assert.equal(out.backend, 'llama.cpp');
    assert.ok(isPublicQuant(out.quant));
    assert.ok(out.launch);
    assert.match(out.source_url, /\/stacks/);
    assert.match(out.calculator, /\/calculator\?/);
  });

  it('compare_gpus cites the compare page', () => {
    const out = callTool('compare_gpus', { gpus: ['r9700', 'rx7900xtx'] }, catalog).structuredContent;
    assert.equal(out.gpus.length, 2);
    assert.match(out.source_url, /\/compare\/gpus/);
    assert.ok(out.gpus[0].vram_gb);
  });

  it('gpu_prices labels affiliate links and includes the date', () => {
    const out = callTool('gpu_prices', { gpu: 'r9700' }, catalog).structuredContent;
    assert.match(out.disclosure, /affiliate/i);
    assert.ok(out.gpus[0].prices.length >= 1);
    assert.match(out.gpus[0].prices[0].date, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(out.gpus[0].prices[0].affiliate_note, /dated/i);
    assert.match(out.source_url, /\/gpus/);
  });

  it('rocm_issue_lookup finds the Windows Ollama row', () => {
    const out = callTool('rocm_issue_lookup', { query: 'Ollama ROCm R9700 Windows' }, catalog).structuredContent;
    assert.ok(out.issues.length >= 1);
    assert.match(out.issues[0].href, /\/rocm-problems\//);
    assert.match(out.source_url, /\/rocm-problems/);
  });

  it('list_models defaults to Qwen and hides older unless asked', () => {
    const current = callTool('list_models', {}, catalog).structuredContent;
    assert.ok(current.models.length > 0);
    assert.match(current.models[0].name, /Qwen/i);
    assert.ok(current.models.every((row) => row.older === false));
    const older = callTool('list_models', { include_older: true }, catalog).structuredContent;
    assert.ok(older.models.some((row) => row.older === true));
    assert.match(current.source_url, /\/models/);
  });
});
