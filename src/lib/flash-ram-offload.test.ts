import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { NOT_MEASURED_ON_LOCAL_DESKTOP } from './flash-daily';
import { primaryNav } from './site';
import { runs } from './run-card-data';
import {
  FLASH_OFFLOAD_CONTEXTS,
  LLAMA_EXPERT_OFFLOAD_LAUNCH,
  STRATA_EXPERT_OFFLOAD_LAUNCH,
  dimmSpeedRows,
  flashDecodeCell,
  flashOffloadEmptyNotes,
  flashQuantShort,
  flashRamOffloadRows,
  flashRuns,
  flashSpeedGrid,
  kitRecommendations,
} from './flash-ram-offload';

describe('Flash RAM-offload page', () => {
  it('pulls DIMM-speed decode from Flash run cards and leaves the rest empty', () => {
    const flash = flashRuns(runs);
    assert.ok(flash.length >= 1);
    assert.ok(flash.every((card) => /flash/i.test(card.model.name)));
    const llama8k3600 = flashDecodeCell(runs, {
      quant: 'UD-Q6_K_XL',
      backend: 'llama.cpp',
      context: 8192,
      gpus: 2,
    });
    assert.match(llama8k3600.text, /15\.9/);
    assert.equal(llama8k3600.measured, true);
    const dimm = dimmSpeedRows(runs);
    const llama8k = dimm.find((row) => row.backend === 'llama.cpp' && row.context === 8192);
    const strata8k = dimm.find((row) => row.backend === 'Strata' && row.context === 8192);
    assert.equal(llama8k?.at3600.text, '15.9 tok/s');
    assert.equal(llama8k?.at5200.text, '18.5 tok/s');
    assert.equal(strata8k?.at3600.text, '32.0 tok/s');
    assert.equal(strata8k?.at5200.text, '32.8 tok/s');
    const strata32k3600 = dimm.find((row) => row.backend === 'Strata' && row.context === 32768);
    assert.equal(strata32k3600?.at3600.text, NOT_MEASURED_ON_LOCAL_DESKTOP);
  });

  it('keeps Q3/Q4/Q5, one-card, 4K, and 128K cells empty until jsonl lands', () => {
    const grid = flashSpeedGrid(runs);
    assert.equal(grid.length, 16);
    assert.deepEqual([...FLASH_OFFLOAD_CONTEXTS], [4096, 32768, 131072, 262144]);
    const q3 = grid.filter((row) => row.short === 'Q3');
    assert.ok(q3.every((row) => FLASH_OFFLOAD_CONTEXTS.every((ctx) => !row.cells[ctx].measured)));
    const q4 = grid.filter((row) => row.short === 'Q4');
    assert.ok(q4.every((row) => FLASH_OFFLOAD_CONTEXTS.every((ctx) => !row.cells[ctx].measured)));
    const q5 = grid.filter((row) => row.short === 'Q5');
    assert.ok(q5.every((row) => FLASH_OFFLOAD_CONTEXTS.every((ctx) => !row.cells[ctx].measured)));
    const oneCard = grid.filter((row) => row.cards === 1);
    assert.ok(oneCard.every((row) => FLASH_OFFLOAD_CONTEXTS.every((ctx) => !row.cells[ctx].measured)));
    assert.ok(grid.every((row) => !row.cells[4096].measured));
    assert.ok(grid.every((row) => !row.cells[131072].measured));
    const twoQ6Strata = grid.find((row) => row.short === 'Q6' && row.cards === 2 && row.backend === 'Strata');
    assert.equal(twoQ6Strata?.cells[262144].measured, true);
    assert.match(twoQ6Strata?.cells[262144].text ?? '', /32\.6/);
    const notes = flashOffloadEmptyNotes(grid);
    assert.ok(notes.some((note) => /Q3/.test(note)));
    assert.ok(notes.some((note) => /4K/.test(note)));
    assert.ok(notes.some((note) => /128K/.test(note)));
  });

  it('labels RAM kits as estimates and recommends 128 / 192 / 256 from the calculator', () => {
    const rows = flashRamOffloadRows();
    assert.equal(rows.length, 8);
    for (const row of rows) {
      assert.equal(row.ram.atSelected.label, 'estimate');
      assert.equal(row.ram.atFullContext.label, 'estimate');
      assert.ok(row.spillGiB > 0);
      assert.ok(row.ram.atFullContext.kitGb >= row.ram.atSelected.kitGb);
    }
    const twoQ6 = rows.find((row) => row.short === 'Q6' && row.cards === 2);
    const oneQ6 = rows.find((row) => row.short === 'Q6' && row.cards === 1);
    assert.ok(twoQ6 && oneQ6);
    assert.ok(oneQ6.spillGiB > twoQ6.spillGiB);
    const kits = kitRecommendations(rows);
    assert.deepEqual(
      kits.map((kit) => kit.kitGb),
      [128, 192, 256],
    );
    const k128 = kits.find((kit) => kit.kitGb === 128);
    const k192 = kits.find((kit) => kit.kitGb === 192);
    const k256 = kits.find((kit) => kit.kitGb === 256);
    assert.match(k128?.headline ?? '', /128/);
    assert.match(k192?.headline ?? '', /192/);
    assert.match(k256?.headline ?? '', /local desktop/);
    assert.ok(k128?.lines.some((line) => /Q6/.test(line) && /2×/.test(line)));
    assert.ok(k192?.headline.includes('estimate') || k192?.lines.some((line) => /estimate/.test(line)));
  });

  it('publishes expert-offload launch shapes without inventing flag values or a Q1/Q2', () => {
    assert.match(LLAMA_EXPERT_OFFLOAD_LAUNCH, /--n-cpu-moe not recorded/);
    assert.match(LLAMA_EXPERT_OFFLOAD_LAUNCH, /-ot not recorded/);
    assert.match(STRATA_EXPERT_OFFLOAD_LAUNCH, /expert-cache/);
    assert.doesNotMatch(LLAMA_EXPERT_OFFLOAD_LAUNCH, /GGML_VK_VISIBLE_DEVICES=/);
    assert.doesNotMatch(STRATA_EXPERT_OFFLOAD_LAUNCH, /HIP_VISIBLE_DEVICES=/);
    assert.equal(flashQuantShort('UD-Q3_K_XL'), 'Q3');
    assert.equal(flashQuantShort('Q2_K'), null);
    assert.ok(primaryNav.some((item) => item.href === '/flash-ram-offload'));
  });
});
