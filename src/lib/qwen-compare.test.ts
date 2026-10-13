import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runs } from './run-card-data';
import { primaryNav } from './site';
import {
  CODER390_CITED_REQUIRED,
  CODER390_FILES,
  CODER390_HF,
  DEFAULT_QWEN_RIG,
  QWEN_COMPARE_BANNED,
  applyQwenCompare,
  coder390HasNoQ5,
  filterQwenRows,
  parseQwenCompareQuery,
  qwenCompareRows,
  qwenCompareSpecs,
  rowFitsRig,
  serializeQwenCompareQuery,
} from './qwen-compare';

const page = readFileSync(new URL('../pages/qwen.astro', import.meta.url), 'utf8');

describe('/qwen catalog', () => {
  it('lists only Qwen 3.6 and 3.8 families and never Qwen2.5 or Qwen3-8B', () => {
    const specs = qwenCompareSpecs();
    assert.ok(specs.length >= 20);
    assert.ok(specs.some((s) => s.family === '3.6' && s.model === '35B-A3B'));
    assert.ok(specs.some((s) => s.family === '3.6' && s.model === '27B'));
    assert.ok(specs.some((s) => s.family === '3.8' && s.model === 'Flash'));
    assert.ok(specs.some((s) => s.family === '3.8' && s.model === '27B'));
    assert.ok(specs.some((s) => s.model === 'Coder390'));
    assert.ok(specs.every((s) => s.family === '3.6' || s.family === '3.8'));
    assert.ok(specs.some((s) => /Q3/i.test(s.quant)));
    const blob = JSON.stringify(specs);
    assert.doesNotMatch(blob, QWEN_COMPARE_BANNED);
    assert.match(page, /Qwen compare|3\.6 and 3\.8|not listed/);
  });

  it('cites Coder390 nerkyor GGUF sizes and has no Q5 on the original', () => {
    const specs = qwenCompareSpecs().filter((s) => s.modelKey === 'coder390');
    assert.equal(coder390HasNoQ5(specs), true);
    for (const required of CODER390_CITED_REQUIRED) {
      const row = specs.find((s) => s.quant === required.quant);
      assert.ok(row, required.quant);
      assert.equal(row?.citedDecimalGb, required.decimalGb);
      assert.match(row?.sizeCite ?? '', /Hugging Face/);
      assert.match(row?.hfUrl ?? '', /nerkyor/);
    }
    assert.equal(
      CODER390_FILES.find((f) => f.quant === 'Q4 LynnStyle')?.decimalGb,
      19.6,
    );
    assert.equal(CODER390_HF.includes('nerkyor/Qwen3.8-27B-Coder390'), true);
    assert.ok(specs.every((s) => s.citedDecimalGb != null));
    assert.ok(!specs.some((s) => /Q5/i.test(s.quant)));
  });
});

describe('/qwen measured vs estimate', () => {
  const rows = qwenCompareRows(runs);

  it('fills decode/prefill only from verified jsonl and leaves Coder390 blank', () => {
    const udq5 = rows.find((r) => r.spec.modelKey === '35b-a3b' && r.spec.quant === 'UD-Q5_K_XL');
    assert.ok(udq5);
    assert.equal(udq5?.decode.llamacpp.value, 102.39);
    assert.match(udq5?.decode.llamacpp.text ?? '', /102\.39/);
    assert.ok(udq5?.decode.llamacpp.runId);
    assert.equal(udq5?.decode.vllm.value, null);
    assert.equal(udq5?.decode.vllm.text, '');

    const flash = rows.find((r) => r.spec.modelKey === 'flash' && r.spec.quant === 'UD-Q6_K_XL');
    assert.ok(flash);
    assert.ok(flash?.decode.strata.value != null);
    assert.ok((flash?.decode.strata.value ?? 0) >= 32);
    assert.ok(flash?.decode.llamacpp.value != null);

    const q4 = rows.find((r) => r.spec.modelKey === '35b-a3b' && r.spec.quant === 'Q4_K_M');
    assert.equal(q4?.prefill.llamacpp.value, 2733.9);

    const q6 = rows.find((r) => r.spec.modelKey === '35b-a3b' && r.spec.quant === 'Q6_K');
    assert.match(q6?.decode.llamacpp.text ?? '', /82\.62 \/ 103\.23 @ 4K \(two repeats\)/);

    const coder = rows.filter((r) => r.spec.modelKey === 'coder390');
    assert.ok(coder.length >= 3);
    assert.ok(coder.every((r) => r.decode.llamacpp.value == null && r.prefill.llamacpp.value == null));
    assert.ok(coder.every((r) => r.decode.strata.text === '' && r.decode.vllm.text === ''));

    const flashQ3 = rows.find((r) => r.spec.modelKey === 'flash' && /Q3/i.test(r.spec.quant));
    assert.equal(flashQ3?.decode.llamacpp.value, null);
    assert.equal(flashQ3?.decode.strata.value, null);
  });

  it('labels VRAM and offload as estimates unless a run recorded peak VRAM', () => {
    const udq5 = rows.find((r) => r.spec.modelKey === '35b-a3b' && r.spec.quant === 'UD-Q5_K_XL');
    assert.ok(udq5);
    assert.equal(udq5?.vram32.text, '26.7 GB');
    assert.equal(udq5?.vram32.label, 'measured');
    assert.equal(udq5?.vram128.text, '28.82 GB');
    assert.equal(udq5?.vramFull.text, '29.34 GB');
    assert.notEqual(udq5?.vramFull.text, '57.4 GB');
    assert.match(udq5?.fit1x.text ?? '', /est\./);
    assert.match(udq5?.offload1x.text ?? '', /est\./);
    const coder = rows.find((r) => r.spec.quant === 'Q4 LynnStyle');
    assert.equal(coder?.fileSizeText, '19.6 GB');
    assert.equal(coder?.sizeSource, 'cited');
    assert.equal(coder?.vram32.label, 'estimate');
  });

  it('reuses the calculator for fits-on-my-rig against the My Rig profile', () => {
    const udq5 = rows.find((r) => r.spec.modelKey === '35b-a3b' && r.spec.quant === 'UD-Q5_K_XL');
    const flashQ6 = rows.find((r) => r.spec.modelKey === 'flash' && r.spec.quant === 'UD-Q6_K_XL');
    assert.ok(udq5 && flashQ6);
    assert.equal(rowFitsRig(udq5, DEFAULT_QWEN_RIG), true);
    assert.equal(rowFitsRig(udq5, { ...DEFAULT_QWEN_RIG, gpuCount: 2 }), true);
    const tiny = { ...DEFAULT_QWEN_RIG, ramGb: 64, gpuCount: 1 as const };
    assert.equal(rowFitsRig(flashQ6, tiny), false);
    assert.equal(rowFitsRig(flashQ6, { ...DEFAULT_QWEN_RIG, gpuCount: 2, ramGb: 256 }), true);

    const fitted = filterQwenRows(rows, {
      ...parseQwenCompareQuery('n=1&ram=64&be=llamacpp&fit=1'),
      fitsOnMyRig: true,
    });
    assert.ok(fitted.some((r) => r.spec.quant === 'UD-Q5_K_XL'));
    assert.ok(!fitted.some((r) => r.spec.modelKey === 'flash' && r.spec.quant === 'UD-Q6_K_XL'));
  });

  it('round-trips shareable URL state', () => {
    const raw = 'n=2&ram=192&be=strata&fit=1&family=3.8&sort=vramFull&dir=desc';
    const state = parseQwenCompareQuery(raw);
    assert.equal(state.gpuCount, 2);
    assert.equal(state.ramGb, 192);
    assert.equal(state.backendId, 'strata');
    assert.equal(state.fitsOnMyRig, true);
    assert.equal(state.family, '3.8');
    assert.equal(state.sort, 'vramFull');
    assert.equal(state.dir, 'desc');
    const again = parseQwenCompareQuery(serializeQwenCompareQuery(state));
    assert.deepEqual(again, state);
    const visible = applyQwenCompare(rows, state);
    assert.ok(visible.every((r) => r.spec.family === '3.8'));
  });
});

describe('/qwen nav', () => {
  it('is in the top nav', () => {
    const item = primaryNav.find((nav) => nav.href === '/qwen');
    assert.ok(item);
    assert.match(item?.label ?? '', /Qwen/i);
  });
});
