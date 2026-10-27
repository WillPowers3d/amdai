import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import {
  BACKENDS,
  DEFAULT_INPUT,
  GPU_PRESETS,
  KV_TYPES,
  DIMM_KIT_GB,
  MEASURED_ON_OUR_RIG,
  MODEL_PRESETS,
  QUANTS,
  LOCAL_DESKTOP_DDR5_GB,
  LOCAL_DESKTOP_USABLE_RAM_GB,
  roundUpToDimmKitGb,
  systemRamNeed,
  applyModelPreset,
  modelById,
  catalogGuardErrors,
  compute,
  contextSweep,
  exportEstimate,
  formatGiB,
  gpuCatalog,
  inputToQuery,
  kvCacheGiB,
  kdaLinearStateMiB,
  padKvCells,
  queryToInput,
  qwenLinearStateMiB,
  swaCellCount,
  testedBadge,
} from './calculator';
import { buildTestGguf, parseGgufHeader } from './gguf-header';
import type { StacksGuide } from './status';

describe('calculator tested badges', () => {
  it('labels the daily-driver 256K point with first-party 35B decode', () => {
    const badge = testedBadge(DEFAULT_INPUT);
    assert.equal(badge?.id, 'daily');
    assert.match(badge?.label ?? '', new RegExp(MEASURED_ON_OUR_RIG));
    assert.match(badge?.label ?? '', /44\.4 tok\/s at 256K/);
    assert.match(badge?.label ?? '', /102\.39/);
    assert.match(badge?.label ?? '', /109\.73 tok\/s \(24\.68 GB VRAM\)/);
  });

  it('labels the 32K and short-context UD-Q5 points', () => {
    const at32k = testedBadge({ ...DEFAULT_INPUT, context: 32768 });
    assert.equal(at32k?.id, 'daily');
    assert.match(at32k?.label ?? '', /90\.52 tok\/s at 32K/);
    const short = testedBadge({ ...DEFAULT_INPUT, context: 4096 });
    assert.equal(short?.id, 'daily');
    assert.match(short?.label ?? '', /102\.39 tok\/s at short context/);
  });

  it('labels Q4_K_M decode and 32K prefill', () => {
    const badge = testedBadge({ ...DEFAULT_INPUT, quantId: 'q4_k_m', context: 32768 });
    assert.equal(badge?.id, 'q4');
    assert.match(badge?.label ?? '', new RegExp(MEASURED_ON_OUR_RIG));
    assert.match(badge?.label ?? '', /117\.69 tok\/s/);
    assert.match(badge?.label ?? '', /1902\.1 tok\/s at 32K/);
  });

  it('does not badge a split or a non-R9700 card', () => {
    assert.equal(testedBadge({ ...DEFAULT_INPUT, split: true }), null);
    assert.equal(testedBadge({ ...DEFAULT_INPUT, gpuId: 'rx7900xtx', vramGb: 24 }), null);
  });
});

describe('stacks first-party 35B benches', () => {
  const file = parse(readFileSync(new URL('../data/stacks.yaml', import.meta.url), 'utf8')) as StacksGuide;

  it('labels every 35B row Measured on our rig, 2026-10 and uses GB', () => {
    assert.equal(file.qwen36_measured.label, MEASURED_ON_OUR_RIG);
    const quants = file.qwen36_measured.rows.map((row) => row.quant);
    assert.deepEqual(quants, ['UD-Q5_K_XL', 'Q5_K_M', 'Q4_K_M']);
    const ud = file.qwen36_measured.rows[0];
    assert.equal(ud.decode_short, '102.39 tok/s');
    assert.equal(ud.decode_32k, '90.52 tok/s');
    assert.equal(ud.decode_256k, '44.4 tok/s');
    const q5 = file.qwen36_measured.rows[1];
    assert.equal(q5.decode_short, '109.73 tok/s');
    assert.equal(q5.vram_gb, '24.68 GB');
    const q4 = file.qwen36_measured.rows[2];
    assert.equal(q4.decode_short, '117.69 tok/s');
    assert.equal(q4.prefill_32k, '1902.1 tok/s');
    const measured = file.stacks.find((stack) => stack.id === 'daily-driver')?.measured.join('\n') ?? '';
    assert.match(measured, /Measured on our rig, 2026-10/);
    assert.match(measured, /24\.68 GB/);
    assert.doesNotMatch(measured, /24\.68 GiB/);
  });
});

describe('calculator catalog guards', () => {
  it('lists Q3 options, rejects Q1/Q2, and keeps banned Qwen out', () => {
    assert.deepEqual(catalogGuardErrors(), []);
    const ids = QUANTS.map((q) => q.id);
    for (const required of ['q3_k_s', 'q3_k_m', 'q3_k_xl', 'iq3', 'q4_k_m'] as const) {
      assert.ok(ids.includes(required), required);
    }
    assert.ok(QUANTS.every((q) => q.bpw >= 3.4));
    assert.ok(!QUANTS.some((q) => /q[12]/i.test(q.id) && !/q3|q4|q5|q6|q8/.test(q.id)));
    const blob = MODEL_PRESETS.map((m) => `${m.id} ${m.name} ${m.official}`).join('\n');
    assert.doesNotMatch(blob, /Qwen2\.5/);
    assert.doesNotMatch(blob, /Qwen3-8B/);
    assert.ok(BACKENDS[0].id === 'llamacpp');
    assert.ok(GPU_PRESETS[0].id === 'r9700');
    const flash = MODEL_PRESETS.find((m) => m.id === 'flash');
    assert.equal(flash?.publisherFiles.q3_k_xl?.decimalGb, 90);
    assert.equal(flash?.publisherFiles.iq3?.decimalGb, 81.96);
    assert.equal(flash?.publisherFiles.q4_k_m?.decimalGb, 111);
    assert.equal(flash?.publisherFiles.q5_k_m?.decimalGb, 158.3);
    const qwen36 = MODEL_PRESETS.find((m) => m.id === 'qwen36');
    assert.equal(qwen36?.publisherFiles.q3_k_s?.decimalGb, 15.4);
    assert.equal(qwen36?.publisherFiles.q3_k_m?.decimalGb, 16.6);
    assert.equal(qwen36?.publisherFiles.q3_k_xl?.decimalGb, 16.8);
    assert.equal(qwen36?.publisherFiles.iq3?.decimalGb, 13.7);
    const gptOss = MODEL_PRESETS.find((m) => m.id === 'gpt-oss-20b');
    assert.equal(gptOss?.publisherFiles.q6_k?.decimalGb, 12.04);
    assert.equal(gptOss?.publisherFiles.q4_k_m?.decimalGb, 11.62);
    assert.equal(gptOss?.publisherFiles.q3_k_m?.decimalGb, 11.51);
    const gemma = MODEL_PRESETS.find((m) => m.id === 'gemma3-27b');
    assert.equal(gemma?.publisherFiles.q6_k?.decimalGb, 22.17);
    assert.equal(gemma?.publisherFiles.q4_k_m?.decimalGb, 16.55);
    assert.equal(gemma?.publisherFiles.q3_k_m?.decimalGb, 13.44);
    const llama = MODEL_PRESETS.find((m) => m.id === 'llama33-70b');
    assert.equal(llama?.publisherFiles.q6_k?.decimalGb, 57.89);
    assert.equal(llama?.publisherFiles.q4_k_m?.decimalGb, 42.52);
    assert.equal(llama?.publisherFiles.q3_k_m?.decimalGb, 34.27);
    const glm = MODEL_PRESETS.find((m) => m.id === 'glm-53-flash');
    assert.equal(glm?.publisherFiles.q6_k?.decimalGb, 291.83);
    assert.equal(glm?.publisherFiles.q4_k_m?.decimalGb, 199.71);
    assert.equal(glm?.publisherFiles.q3_k_m?.decimalGb, 147.54);
    const qwen36Dense = MODEL_PRESETS.find((m) => m.id === 'qwen36-27b');
    assert.equal(qwen36Dense?.publisherFiles.q6_k?.decimalGb, 22.52);
    assert.equal(qwen36Dense?.publisherFiles.q4_k_m?.decimalGb, 16.82);
    assert.equal(qwen36Dense?.publisherFiles.q3_k_m?.decimalGb, 13.59);
    const qwen38Dense = MODEL_PRESETS.find((m) => m.id === 'qwen38-27b');
    assert.equal(qwen38Dense?.publisherFiles.q6_k?.decimalGb, 21.98);
    assert.equal(qwen38Dense?.publisherFiles.q4_k_m?.decimalGb, 16.46);
    assert.equal(qwen38Dense?.publisherFiles.q3_k_m?.decimalGb, 13.15);
  });

  it('keeps house models and a custom row', () => {
    const ids = MODEL_PRESETS.map((m) => m.id);
    assert.ok(ids.includes('qwen36'));
    assert.ok(ids.includes('flash'));
    assert.ok(ids.includes('custom'));
    assert.ok(ids.includes('qwen38-27b'));
    assert.ok(ids.includes('qwen36-27b'));
    assert.ok(ids.includes('glm-53-flash'));
    assert.ok(ids.includes('llama33-70b'));
  });
});

describe('calculator math and modes', () => {
  it('labels backend overhead as an estimate and prefers Vulkan on llama.cpp', () => {
    const result = compute(DEFAULT_INPUT);
    assert.match(result.overheadNote, /estimate/i);
    assert.match(result.overheadNote, /Vulkan|ROCm/);
    assert.ok(result.overheadGiB > 0);
    const hip = compute({ ...DEFAULT_INPUT, pathId: 'hip', overheadManual: false });
    assert.ok(hip.overheadGiB > result.overheadGiB);
  });

  it('grows KV with context and less so on a sliding-window model', () => {
    const daily = compute(DEFAULT_INPUT);
    const short = compute({ ...DEFAULT_INPUT, context: 8192 });
    assert.ok(daily.kvGiB > short.kvGiB);
    const gemma = applyModelPreset('gemma3-27b', DEFAULT_INPUT);
    const gLong = kvCacheGiB({ ...gemma, context: 131072, kvId: 'f16' });
    const dense = kvCacheGiB({
      ...gemma,
      windowLayers: 0,
      windowTokens: 0,
      kvLayers: gemma.layers,
      context: 131072,
      kvId: 'f16',
    });
    assert.ok(gLong.gib < dense.gib);
  });

  it('multiplies KV on Ollama concurrent sequences only', () => {
    const one = kvCacheGiB({ ...DEFAULT_INPUT, backendId: 'ollama', batch: 1 });
    const four = kvCacheGiB({ ...DEFAULT_INPUT, backendId: 'ollama', batch: 4 });
    assert.ok(Math.abs(four.gib / one.gib - 4) < 0.2);
    const shared = kvCacheGiB({ ...DEFAULT_INPUT, backendId: 'llamacpp', batch: 4 });
    assert.ok(Math.abs(shared.gib - one.gib) < one.gib);
  });

  it('marks overflow to system RAM and withholds a speed floor', () => {
    const flash = compute(applyModelPreset('flash', { ...DEFAULT_INPUT, gpuCount: 1, split: false }));
    assert.ok(flash.overflowGiB > 1);
    assert.equal(flash.speed.offered, false);
    assert.match(flash.speed.note, /withheld|offload/i);
  });

  it('offers a labeled speed-floor estimate only when the file fits', () => {
    const result = compute({ ...DEFAULT_INPUT, context: 8192, bandwidthGBs: 640, efficiency: 0.75 });
    assert.equal(result.speed.offered, true);
    assert.ok((result.speed.tokS ?? 0) > 0);
    assert.match(result.speed.note, /Estimate only/);
    assert.ok(result.tested);
  });

  it('lists matching Radeon cards smallest-first and a GPU-first catalog', () => {
    const result = compute({ ...DEFAULT_INPUT, context: 8192 });
    assert.ok(result.matching.length >= 8);
    const vrams = result.matching.map((g) => g.vramGb);
    assert.deepEqual(vrams, [...vrams].sort((a, b) => a - b));
    assert.ok(result.matching.every((g) => g.gfx.startsWith('gfx')));
    const catalog = gpuCatalog({ ...DEFAULT_INPUT, context: 8192, gpuId: 'r9700', vramGb: 32 });
    assert.ok(catalog.fits.some((row) => row.modelId === 'qwen36'));
    assert.ok(catalog.fits.every((row) => row.quant.bpw >= 3.4));
    assert.ok(!catalog.fits.some((row) => /Qwen2\.5|Qwen3-8B/.test(row.name)));
  });

  it('builds a context sweep chart series and a JSON export', () => {
    const sweep = contextSweep(DEFAULT_INPUT);
    assert.ok(sweep.length >= 7);
    assert.ok(sweep[sweep.length - 1].kvGiB >= sweep[0].kvGiB);
    const json = exportEstimate(DEFAULT_INPUT, compute(DEFAULT_INPUT));
    const parsed = JSON.parse(json) as { kind: string; site: string };
    assert.match(parsed.site, /amdai\.net/);
    assert.match(parsed.kind, /estimate/);
  });

  it('round-trips share query keys for backend, path, batch, and view', () => {
    const input = {
      ...DEFAULT_INPUT,
      view: 'gpu' as const,
      backendId: 'strata' as const,
      pathId: 'hip' as const,
      batch: 3,
      separableEmbed: true,
      desktopSpare: false,
    };
    const back = queryToInput(inputToQuery(input, { priority: 'speed' }));
    assert.equal(back.view, 'gpu');
    assert.equal(back.backendId, 'strata');
    assert.equal(back.pathId, 'hip');
    assert.equal(back.batch, 3);
    assert.equal(back.separableEmbed, true);
    assert.equal(back.desktopSpare, false);
  });

  it('uses 70% usable pool on unified memory', () => {
    const unified = compute({
      ...DEFAULT_INPUT,
      gpuId: 'unified',
      kind: 'unified',
      vramGb: 32,
      usablePct: 70,
      context: 8192,
    });
    assert.ok(Math.abs(unified.usableVramGb - 22.4) < 0.05);
  });

  it('formats GiB without inventing a unit mix', () => {
    assert.equal(formatGiB(0), '0');
    assert.match(formatGiB(28.5), /28\.5/);
  });

  it('reports Flash host RAM as a kit with a breakdown, not a bare offload figure', () => {
    const flash = compute(
      applyModelPreset('flash', { ...DEFAULT_INPUT, gpuCount: 1, split: false, context: 32768, backendId: 'strata' }),
    );
    assert.ok(flash.overflowGiB > 1);
    const ram = flash.systemRam;
    assert.ok(ram.atSelected.kitGb >= 192);
    assert.ok(ram.atFullContext.kitGb >= ram.atSelected.kitGb);
    assert.equal(ram.atSelected.label, 'estimate');
    assert.equal(ram.atFullContext.label, 'estimate');
    assert.equal(ram.fullContext, 262144);
    assert.ok(ram.atSelected.breakdown.offloadedWeightsGiB > 100);
    assert.ok(ram.atFullContext.breakdown.kvInRamGiB >= ram.atSelected.breakdown.kvInRamGiB);
    assert.ok(ram.atSelected.breakdown.osDesktopGiB > 0);
    assert.ok(ram.atSelected.breakdown.headroomGiB > 0);
    assert.ok(ram.atSelected.breakdown.runtimeOverheadGiB > 0);
    assert.match(ram.atSelected.note, /Estimate/i);
    assert.match(ram.atSelected.note, /256 GB DDR5/);
    assert.ok((DIMM_KIT_GB as readonly number[]).includes(ram.atSelected.kitGb));
    assert.ok((DIMM_KIT_GB as readonly number[]).includes(ram.atFullContext.kitGb));
    assert.ok(ram.atSelected.rawGiB < ram.atSelected.kitGb + 1e-9);
    assert.equal(LOCAL_DESKTOP_DDR5_GB, 256);
    assert.equal(LOCAL_DESKTOP_USABLE_RAM_GB, 249);
  });

  it('rounds host RAM up to a real DIMM kit', () => {
    assert.equal(roundUpToDimmKitGb(1), 16);
    assert.equal(roundUpToDimmKitGb(64), 64);
    assert.equal(roundUpToDimmKitGb(64.1), 96);
    assert.equal(roundUpToDimmKitGb(169), 192);
    assert.equal(roundUpToDimmKitGb(193), 256);
    const daily = systemRamNeed(DEFAULT_INPUT);
    assert.ok(daily.atSelected.kitGb <= 64);
    assert.equal(daily.atSelected.label, 'estimate');
  });

  it('overlays official 35B peak system RAM and keeps uncovered lines as estimates', async () => {
    const { measuredRamHitsFromRuns } = await import('./run-card');
    const { runs } = await import('./run-card-data');
    const hits = measuredRamHitsFromRuns(runs);
    const daily = systemRamNeed(DEFAULT_INPUT, hits);
    assert.equal(daily.atSelected.label, 'measured');
    assert.deepEqual(daily.atSelected.peakGbs, [42.9]);
    assert.ok(daily.atSelected.runIds?.[0]);
    assert.match(daily.atSelected.note, /pending re-verify after RAM fix/);
    const short = systemRamNeed({ ...DEFAULT_INPUT, context: 4096 }, hits);
    assert.deepEqual(short.atSelected.peakGbs, [37.32]);
    const split = systemRamNeed({ ...DEFAULT_INPUT, context: 4096, gpuCount: 2, split: true }, hits);
    assert.deepEqual(split.atSelected.peakGbs, [37.6]);
    const q6 = systemRamNeed({ ...DEFAULT_INPUT, quantId: 'q6_k', context: 4096 }, hits);
    assert.deepEqual(q6.atSelected.peakGbs, [40.91, 40.15]);
    const missed = systemRamNeed({ ...DEFAULT_INPUT, context: 8192 }, hits);
    assert.equal(missed.atSelected.label, 'estimate');
    assert.equal(missed.atSelected.peakGbs, undefined);
  });
});

describe('llama.cpp KV allocation', () => {
  const CTX = 262144;
  const F16 = 2;

  function f16Kv(id: Parameters<typeof applyModelPreset>[0], context = CTX) {
    return kvCacheGiB({
      ...applyModelPreset(id, DEFAULT_INPUT),
      context,
      kvId: 'f16',
      backendId: 'llamacpp',
      batch: 1,
    }).gib;
  }

  it('pads SWA cells the way llama.cpp ISWA does', () => {
    assert.equal(padKvCells(0), 0);
    assert.equal(padKvCells(1024), 1024);
    assert.equal(padKvCells(640), 768);
    assert.equal(swaCellCount(262144, 1024, 1, 512), 1536);
    assert.equal(swaCellCount(262144, 128, 1, 512), 768);
    assert.equal(swaCellCount(1024, 1024, 1, 512), 1024);
  });

  it('matches llama.cpp for GLM 5.3 Flash (11 MLA layers + indexer + KDA state)', () => {
    const glm = applyModelPreset('glm-53-flash', DEFAULT_INPUT);
    assert.equal(glm.kvLayers, 11);
    assert.equal(glm.mlaDim, 512);
    assert.equal(glm.indexerLayers, 11);
    assert.equal(glm.indexerDim, 384);
    const mla = (11 * 512 * 1 * CTX * F16) / (1024 ** 3);
    const indexer = (11 * 384 * CTX * F16) / (1024 ** 3);
    const fixed = kdaLinearStateMiB(34, 64, 128, 4) / 1024;
    const expected = mla + indexer + fixed;
    assert.ok(Math.abs(f16Kv('glm-53-flash') - expected) < 1e-9);
    assert.ok(Math.abs(f16Kv('glm-53-flash') - 4.95) < 0.02);
    assert.match(modelById('glm-53-flash').archNote, /11 of 45/);
    assert.match(modelById('glm-53-flash').archNote, /34 linear/);
  });

  it('matches llama.cpp for Qwen 3.8 Flash (GQA + 12×256 indexer + linear state)', () => {
    const flash = applyModelPreset('flash', DEFAULT_INPUT);
    assert.equal(flash.kvLayers, 12);
    assert.equal(flash.indexerLayers, 12);
    assert.equal(flash.indexerDim, 256);
    const gqa = (2 * 12 * 2 * 256 * CTX * F16) / (1024 ** 3);
    const indexer = (12 * 256 * CTX * F16) / (1024 ** 3);
    const fixed = qwenLinearStateMiB(36, 16, 48, 128, 4) / 1024;
    const expected = gqa + indexer + fixed;
    assert.ok(Math.abs(f16Kv('flash') - expected) < 1e-9);
    assert.ok(Math.abs(f16Kv('flash') - 7.61) < 0.02);
    assert.match(modelById('flash').archNote, /12×256 indexer/);
  });

  it('matches llama.cpp for Gemma 4 window heads and pad256(window+ubatch)', () => {
    const g31 = applyModelPreset('gemma4-31b', DEFAULT_INPUT);
    const g12 = applyModelPreset('gemma4-12b', DEFAULT_INPUT);
    assert.equal(g31.windowKvHeads, 16);
    assert.equal(g31.windowHeadDim, 256);
    assert.equal(g12.windowKvHeads, 8);
    assert.equal(g12.windowHeadDim, 256);
    const cells = swaCellCount(CTX, 1024, 1, 512);
    const g31Expected =
      (2 * 10 * 4 * 512 * CTX * F16) / (1024 ** 3) + (2 * 50 * 16 * 256 * cells * F16) / (1024 ** 3);
    const g12Expected =
      (2 * 8 * 1 * 512 * CTX * F16) / (1024 ** 3) + (2 * 40 * 8 * 256 * cells * F16) / (1024 ** 3);
    assert.ok(Math.abs(f16Kv('gemma4-31b') - g31Expected) < 1e-9);
    assert.ok(Math.abs(f16Kv('gemma4-12b') - g12Expected) < 1e-9);
    assert.ok(Math.abs(f16Kv('gemma4-31b') - 21.17) < 0.02);
    assert.ok(Math.abs(f16Kv('gemma4-12b') - 4.47) < 0.02);
    assert.match(modelById('gemma4-31b').archNote, /16×256/);
    assert.match(modelById('gemma4-12b').archNote, /8×256/);
  });

  it('keeps dense and hybrid presets within 2% of llama.cpp f16 at 256K', () => {
    const expected: Record<string, number> = {
      qwen36: 5.06,
      flash: 7.61,
      'qwen38-27b': 16.15,
      'qwen36-27b': 16.15,
      'qwen35-27b': 16.15,
      'qwen35-9b': 8.05,
      'qwen3-32b': 64,
      'qwen3-14b': 40,
      'qwen3-30b-a3b': 24,
      'qwen3-235b-a22b': 47,
      'llama33-70b': 80,
      'llama31-70b': 80,
      'llama31-8b': 32,
      'gemma3-27b': 20.61,
      'gemma4-31b': 21.17,
      'gemma4-12b': 4.47,
      'gpt-oss-20b': 6.02,
      'glm-53-flash': 4.95,
      'gpt-oss-120b': 9.03,
    };
    for (const [id, llama] of Object.entries(expected)) {
      const got = f16Kv(id as Parameters<typeof applyModelPreset>[0]);
      const ratio = got / llama;
      assert.ok(Math.abs(ratio - 1) < 0.02, `${id}: ${got.toFixed(3)} vs ${llama}`);
    }
  });

  it('round-trips indexer, window-head, and fixed-state query keys', () => {
    const input = applyModelPreset('gemma4-31b', applyModelPreset('flash', DEFAULT_INPUT));
    const back = queryToInput(inputToQuery(input));
    assert.equal(back.windowKvHeads, 16);
    assert.equal(back.windowHeadDim, 256);
    const flash = queryToInput(inputToQuery(applyModelPreset('flash', DEFAULT_INPUT)));
    assert.equal(flash.indexerLayers, 12);
    assert.equal(flash.indexerDim, 256);
    assert.ok(flash.fixedStateMiB > 100);
    const glm = queryToInput(inputToQuery(applyModelPreset('glm-53-flash', DEFAULT_INPUT)));
    assert.equal(glm.kvLayers, 11);
    assert.equal(glm.indexerDim, 384);
  });
});

describe('GGUF header reader', () => {
  it('reads architecture fields from a local header and never invents tok/s', () => {
    const buf = buildTestGguf({
      'general.architecture': 'qwen3',
      'general.name': 'Qwen3.6-35B-A3B',
      'general.parameter_count': 35_000_000_000,
      'qwen3.block_count': 40,
      'qwen3.embedding_length': 2048,
      'qwen3.attention.head_count': 16,
      'qwen3.attention.head_count_kv': 2,
      'qwen3.attention.key_length': 256,
    });
    const parsed = parseGgufHeader(buf, 26.6 * 1e9);
    assert.equal(parsed.ok, true);
    if (parsed.ok) {
      assert.equal(parsed.meta.layers, 40);
      assert.equal(parsed.meta.kvHeads, 2);
      assert.equal(parsed.meta.headDim, 256);
      assert.ok(parsed.meta.fileBytes > 1e9);
    }
  });

  it('refuses Qwen2.5 and Qwen3-8B filenames', () => {
    const banned = parseGgufHeader(
      buildTestGguf({
        'general.architecture': 'qwen2',
        'general.name': 'Qwen2.5-7B',
      }),
    );
    assert.equal(banned.ok, false);
    const eight = parseGgufHeader(
      buildTestGguf({
        'general.architecture': 'qwen3',
        'general.name': 'Qwen3-8B',
      }),
    );
    assert.equal(eight.ok, false);
  });
});
