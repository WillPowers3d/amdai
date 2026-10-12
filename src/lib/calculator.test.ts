import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import {
  BACKENDS,
  DEFAULT_INPUT,
  GPU_PRESETS,
  KV_TYPES,
  MEASURED_ON_OUR_RIG,
  MODEL_PRESETS,
  QUANTS,
  applyModelPreset,
  catalogGuardErrors,
  compute,
  contextSweep,
  exportEstimate,
  formatGiB,
  gpuCatalog,
  inputToQuery,
  kvCacheGiB,
  queryToInput,
  testedBadge,
} from './calculator';
import { buildTestGguf, parseGgufHeader } from './gguf-header';
import type { StacksGuide } from './status';

describe('calculator tested badges', () => {
  it('labels the daily-driver 256K point with first-party 35B decode', () => {
    const badge = testedBadge(DEFAULT_INPUT);
    assert.equal(badge?.id, 'daily');
    assert.match(badge?.label ?? '', new RegExp(MEASURED_ON_OUR_RIG));
    assert.match(badge?.label ?? '', /~50 tok\/s at 256K/);
    assert.match(badge?.label ?? '', /100\.8/);
    assert.match(badge?.label ?? '', /108\.3 tok\/s \(28\.5 GB VRAM\)/);
  });

  it('labels the 32K and short-context UD-Q5 points', () => {
    const at32k = testedBadge({ ...DEFAULT_INPUT, context: 32768 });
    assert.equal(at32k?.id, 'daily');
    assert.match(at32k?.label ?? '', /~88 tok\/s at 32K/);
    const short = testedBadge({ ...DEFAULT_INPUT, context: 4096 });
    assert.equal(short?.id, 'daily');
    assert.match(short?.label ?? '', /100\.8 tok\/s at short context/);
  });

  it('labels Q4_K_M decode and 32K prefill', () => {
    const badge = testedBadge({ ...DEFAULT_INPUT, quantId: 'q4_k_m', context: 32768 });
    assert.equal(badge?.id, 'q4');
    assert.match(badge?.label ?? '', new RegExp(MEASURED_ON_OUR_RIG));
    assert.match(badge?.label ?? '', /116\.5 tok\/s/);
    assert.match(badge?.label ?? '', /1814 tok\/s at 32K/);
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
    assert.equal(ud.decode_short, '100.8 tok/s');
    assert.equal(ud.decode_32k, '~88 tok/s');
    assert.equal(ud.decode_256k, '~50 tok/s');
    const q5 = file.qwen36_measured.rows[1];
    assert.equal(q5.decode_short, '108.3 tok/s');
    assert.equal(q5.vram_gb, '28.5 GB');
    const q4 = file.qwen36_measured.rows[2];
    assert.equal(q4.decode_short, '116.5 tok/s');
    assert.equal(q4.prefill_32k, '1814 tok/s');
    const measured = file.stacks.find((stack) => stack.id === 'daily-driver')?.measured.join('\n') ?? '';
    assert.match(measured, /Measured on our rig, 2026-10/);
    assert.match(measured, /28\.5 GB/);
    assert.doesNotMatch(measured, /28\.5 GiB/);
  });
});

describe('calculator catalog guards', () => {
  it('never lists a quant below Q4 or a banned Qwen', () => {
    assert.deepEqual(catalogGuardErrors(), []);
    assert.ok(QUANTS.every((q) => q.bpw >= 4.85));
    assert.ok(!KV_TYPES.some((k) => /q[123]_/i.test(k.id) && k.id.startsWith('q2')));
    const blob = MODEL_PRESETS.map((m) => `${m.id} ${m.name} ${m.official}`).join('\n');
    assert.doesNotMatch(blob, /Qwen2\.5/);
    assert.doesNotMatch(blob, /Qwen3-8B/);
    assert.ok(BACKENDS[0].id === 'llamacpp');
    assert.ok(GPU_PRESETS[0].id === 'r9700');
  });

  it('keeps house models and a custom row', () => {
    const ids = MODEL_PRESETS.map((m) => m.id);
    assert.ok(ids.includes('qwen36'));
    assert.ok(ids.includes('flash'));
    assert.ok(ids.includes('custom'));
    assert.ok(ids.includes('qwen38-27b'));
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
    assert.ok(catalog.fits.every((row) => row.quant.bpw >= 4.85));
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
