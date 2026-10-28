import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { bestQuant, calculatorShareUrl, isPublicQuant, listPublicQuants, planFit } from '../api-fit.js';

const qwen = {
  id: 'qwen36',
  total_params_b: 35,
  kv_layers: 10,
  kv_heads: 2,
  head_dim: 256,
  quants: [
    { id: 'q4_k_m', label: 'Q4_K_M', bpw: 4.85, publisher_decimal_gb: 21.4 },
    { id: 'q5_k_m', label: 'Q5_K_M', bpw: 5.69, publisher_decimal_gb: 26.6 },
    { id: 'q6_k', label: 'Q6_K', bpw: 6.56 },
  ],
};

describe('gguf-fit', () => {
  it('rejects quants below Q4', () => {
    assert.equal(isPublicQuant('q3_k_m'), false);
    assert.equal(isPublicQuant('IQ2_XXS'), false);
    assert.equal(isPublicQuant('Q4_K_M'), true);
    assert.equal(isPublicQuant('UD-Q5_K_XL'), true);
  });

  it('plans a fit and builds a calculator share URL', () => {
    const plan = planFit({ model: qwen, quant: qwen.quants[1], vramGb: 32, context: 4096 });
    assert.equal(plan.verdict, 'fits');
    assert.ok(plan.total_gib < 32);
    const url = calculatorShareUrl({ gpu: 'r9700', model: 'qwen36', quant: 'q5_k_m', ctx: 4096 });
    assert.match(url, /^https:\/\/amdai\.net\/calculator\?/);
    assert.match(url, /quant=q5_k_m/);
  });

  it('picks a Q4+ quant that fits 16 GB', () => {
    const best = bestQuant({ model: qwen, vramGb: 16, context: 4096 });
    assert.ok(isPublicQuant(best.quant.id));
    assert.ok(best.verdict === 'fits' || best.verdict === 'tight' || best.verdict === 'no');
    assert.ok(listPublicQuants(qwen).every((row) => isPublicQuant(row.id)));
  });
});
