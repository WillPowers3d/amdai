import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  ALLOWED_DECODE,
  ALLOWED_PREFILL,
  ALLOWED_VRAM,
  assertAmdaiBenchValid,
  flattenResults,
} from './results';
import { amdaiBenchFile } from './results-data';
import {
  FLASH_Q3_EXCEPTION,
  Q6_4K_VARIANCE_NOTE,
  RUN_SCHEMA,
  SWEEP_REVERIFY,
  amdai,
  amdai,
  assertRunSetValid,
  deriveV1Catalog,
  flashQ3FromRuns,
  houseHandle,
  isFlashQ3,
  isSweep35bCard,
  measuredRamHitsFromRuns,
  officialAmdaiRuns,
  parseRunCard,
  qwen36TableFromRuns,
  schemaDocument,
  verifiedMeasured,
} from './run-card';
import { runs } from './run-card-data';

describe('amdai-bench/run@1', () => {
  it('publishes a schema whose const and required fields match the parser', () => {
    const schema = schemaDocument();
    const props = schema.properties as Record<string, { const?: unknown }>;
    assert.equal(props.schema?.const, RUN_SCHEMA);
    const required = schema.required as string[];
    for (const key of [
      'schema',
      'run_id',
      'submitted_by',
      'started_at',
      'finished_at',
      'hardware',
      'software',
      'model',
      'config',
      'results',
      'measured',
    ]) {
      assert.ok(required.includes(key), key);
    }
    assert.deepEqual(assertRunSetValid(runs), []);
  });

  it('credits every seeded card to verified amdai / amdai on local-desktop and keeps Flash Q3 empty', () => {
    assert.ok(runs.length >= 22);
    assert.equal(officialAmdaiRuns(runs).length, runs.length);
    assert.ok(runs.every((card) => card.schema === RUN_SCHEMA));
    assert.ok(runs.every((card) => houseHandle(card.submitted_by.handle)));
    assert.ok(runs.every((card) => card.submitted_by.rig === amdai.rig));
    assert.ok(runs.every((card) => card.submitted_by.verified));
    const sweep = runs.filter(isSweep35bCard);
    assert.equal(sweep.length, 33);
    assert.ok(sweep.every((card) => card.submitted_by.handle === amdai.handle));
    assert.ok(sweep.every((card) => card.submitted_by.display === amdai.display));
    assert.ok(sweep.every((card) => (card.notes ?? '').includes(SWEEP_REVERIFY)));
    const q6pair = sweep.filter(
      (card) => card.model.quant === 'Q6_K' && card.config.context_tokens === 4096 && card.hardware.gpu_count_used === 1,
    );
    assert.equal(q6pair.length, 2);
    const superseded = q6pair.find((card) => card.run_id === 'local-desktop-20261012-2326-35b-q6k-1gpu-4k-llamacpp-f16');
    const canonical = q6pair.find((card) => card.run_id === 'local-desktop-20261012-2355-35b-q6k-1gpu-4k-llamacpp-f16');
    assert.equal(superseded?.results.decode_tps, 82.62);
    assert.equal(canonical?.results.decode_tps, 103.23);
    assert.ok(!sweep.some((card) => /flash/i.test(card.model.name)));
    assert.ok(runs.every((card) => card.software.launch_command.trim().length > 0));
    assert.equal(flashQ3FromRuns(runs), null);
    assert.ok(!runs.some((card) => isFlashQ3(card)));
    assert.doesNotMatch(JSON.stringify(runs), /flash-q3-measured-approved/);
    assert.doesNotMatch(JSON.stringify(runs), /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(JSON.stringify(runs), /\b(?:Q[12]|IQ[12])(?:_|\b)/);
    assert.doesNotMatch(
      runs
        .filter((card) => !/llama-bench/.test(card.software.launch_command))
        .map((card) => card.software.launch_command)
        .join('\n'),
      /^(?!#).*GGML_VK_VISIBLE_DEVICES/m,
    );
  });

  it('feeds the 35B table and derived v1 catalog from verified single-card llama.cpp rows', () => {
    const table = qwen36TableFromRuns(runs);
    assert.equal(table.rows[0]?.decode_short, '102.39 tok/s');
    assert.equal(table.rows[0]?.decode_32k, '90.52 tok/s');
    assert.equal(table.rows[0]?.decode_128k, '66.43 tok/s');
    assert.equal(table.rows[0]?.decode_256k, '44.4 tok/s');
    assert.equal(table.rows[0]?.vram_gb, '25.97 GB');
    assert.equal(table.rows[1]?.decode_short, '109.73 tok/s');
    assert.equal(table.rows[1]?.vram_gb, '24.68 GB');
    assert.equal(table.rows[2]?.decode_short, '117.69 tok/s');
    assert.equal(table.rows[2]?.prefill_32k, '1902.1 tok/s');
    assert.equal(table.rows[3]?.quant, 'Q6_K');
    assert.equal(table.rows[3]?.decode_short, '103.23 tok/s');
    assert.match(table.rows[3]?.flag ?? '', /DDR5/);
    assert.ok(table.notes.some((note) => /pending a rerun/i.test(note)));
    assert.ok(table.notes.some((note) => /pending re-verify after RAM fix/i.test(note)));
    assert.equal(table.compare.length, 16);
    const ud4k = table.compare.find((row) => row.quant === 'UD-Q5_K_XL' && row.context === 4096);
    assert.equal(ud4k?.one.decode, '102.39 tok/s');
    assert.equal(ud4k?.both.decode, '82.78 tok/s');
    assert.equal(ud4k?.one.prefill, '2761.6 tok/s');
    assert.equal(ud4k?.one.vramPerGpu, '25.45 GB');
    assert.equal(ud4k?.one.vramTotal, '25.97 GB');
    assert.equal(ud4k?.one.systemRam, '37.32 GB');
    assert.equal(ud4k?.both.vramPerGpu, '13.28 / 13.11 GB');
    assert.ok(ud4k?.one.runIds.length);
    const q6short = table.compare.find((row) => row.quant === 'Q6_K' && row.context === 4096);
    assert.equal(q6short?.one.decode, '103.23 tok/s');
    assert.equal(q6short?.one.systemRam, '40.15 GB');
    assert.deepEqual(q6short?.one.runIds, ['local-desktop-20261012-2355-35b-q6k-1gpu-4k-llamacpp-f16']);
    assert.ok(table.notes.some((note) => note.includes(Q6_4K_VARIANCE_NOTE)));
    const ramHits = measuredRamHitsFromRuns(runs);
    assert.ok(ramHits.length >= 33);
    assert.ok(ramHits.every((hit) => hit.peakGb > 0 && hit.runId));

    const derived = deriveV1Catalog(runs);
    assert.deepEqual(assertAmdaiBenchValid(derived), []);
    assert.equal(amdaiBenchFile.schema, derived.schema);
    const blob = JSON.stringify(derived);
    assert.doesNotMatch(blob, /Flash/);
    assert.doesNotMatch(blob, /32\.6/);
    const rows = flattenResults(derived);
    for (const allowed of ALLOWED_DECODE) {
      assert.ok(rows.some((row) => row.decode != null && Math.abs(row.decode - allowed) < 1e-9), String(allowed));
    }
    for (const allowed of ALLOWED_PREFILL) {
      assert.ok(rows.some((row) => row.prefill != null && Math.abs(row.prefill - allowed) < 1e-9), String(allowed));
    }
    for (const allowed of ALLOWED_VRAM) {
      assert.ok(rows.some((row) => row.vramGb != null && Math.abs(row.vramGb - allowed) < 1e-9), String(allowed));
    }
  });

  it('rejects a measured Flash Q3 without the approved exception and accepts one with it', () => {
    const base = {
      ...runs.find((card) => card.run_id === 'local-desktop-flash-q6-strata-8k')!,
      run_id: 'local-desktop-flash-q3-probe',
      model: {
        name: 'Qwen 3.8 Flash',
        repo: 'unsloth/Qwen3.8-Flash-Next-GGUF',
        file: 'UD-Q3_K_XL (folder)',
        quant: 'UD-Q3_K_XL',
        file_size_gb: 90,
        sha256: null,
      },
      results: {
        prefill_tps: null,
        decode_tps: 12.3,
        peak_vram_gb_per_gpu: [],
        peak_vram_gb_total: null,
        peak_system_ram_gb: null,
        errors: 0,
        duration_s: null,
      },
      notes: 'probe only — not a published score',
    };
    assert.throws(() => parseRunCard({ ...base, measured: true, exceptions: [] }, 'flash-q3-bare'));
    const approved = parseRunCard(
      { ...base, measured: true, exceptions: [FLASH_Q3_EXCEPTION] },
      'flash-q3-ok',
    );
    assert.equal(approved.measured, true);
    assert.ok((approved.exceptions ?? []).includes(FLASH_Q3_EXCEPTION));
    assert.equal(flashQ3FromRuns([...runs, approved])?.run_id, 'local-desktop-flash-q3-probe');
  });

  it('refuses Q1/Q2 and banned models', () => {
    const good = runs[0]!;
    assert.throws(() =>
      parseRunCard({ ...good, run_id: 'bad-q2', model: { ...good.model, quant: 'Q2_K' } }, 'q2'),
    );
    assert.throws(() =>
      parseRunCard({ ...good, run_id: 'bad-qwen', model: { ...good.model, name: 'Qwen2.5-7B' } }, 'banned'),
    );
  });

  it('keeps the docs schema file in the repo', () => {
    const raw = readFileSync(new URL('../../docs/amdai-bench-run.schema.json', import.meta.url), 'utf8');
    assert.match(raw, /amdai-bench\/run@1/);
    assert.equal(verifiedMeasured(runs).length, runs.length);
  });
});
