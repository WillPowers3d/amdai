import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import {
  REQUIRED_CHIPSETS,
  REQUIRED_SETTING_IDS,
  assertBiosValid,
  boardsForChipset,
  claimIsGrounded,
  parseBios,
} from './bios';
import { primaryNav } from './site';

const raw = readFileSync(new URL('../data/bios.yaml', import.meta.url), 'utf8');
const file = parseBios(parse(raw));

describe('bios catalog', () => {
  it('validates every claim and keeps the required chipsets and settings', () => {
    assert.deepEqual(assertBiosValid(file), []);
    for (const id of REQUIRED_CHIPSETS) {
      assert.ok(file.chipsets.some((chipset) => chipset.id === id), id);
    }
    for (const id of REQUIRED_SETTING_IDS) {
      assert.ok(file.settings.some((setting) => setting.id === id), id);
    }
    assert.match(file.rule, /citation|not recorded/i);
  });

  it('grounds every claim and uses https sources only', () => {
    for (const setting of file.settings) {
      for (const claim of setting.claims) {
        assert.equal(claimIsGrounded(claim), true, setting.id);
      }
    }
    for (const chipset of file.chipsets) {
      for (const note of chipset.notes) {
        assert.equal(claimIsGrounded(note), true, chipset.id);
      }
    }
    for (const source of Object.values(file.sources)) {
      assert.match(source.href, /^https:\/\//);
    }
  });

  it('does not invent per-board notes or a local-desktop motherboard', () => {
    assert.deepEqual(file.boards, []);
    for (const id of REQUIRED_CHIPSETS) {
      assert.deepEqual(boardsForChipset(file, id), []);
    }
    const blob = JSON.stringify(file);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:100\.8|32\.6|1814)\b/);
    assert.match(file.submit.forum, /hardware-builds/);
    assert.ok(primaryNav.some((item) => item.href === '/bios'));
  });

  it('states the official AM5 1×16 or 2×8 split and the Intel leftover-x4 config', () => {
    const x870e = file.chipsets.find((row) => row.id === 'x870e');
    const b650 = file.chipsets.find((row) => row.id === 'b650');
    const z890 = file.chipsets.find((row) => row.id === 'z890');
    assert.match(x870e?.graphics ?? '', /1×16 or 2×8 PCIe 5\.0/);
    assert.match(b650?.graphics ?? '', /1×16 or 2×8 PCIe 4\.0/);
    assert.match(z890?.graphics ?? '', /1×16\+1×4/);
    const lanes = file.settings.find((row) => row.id === 'pcie-gen-bifurcation');
    assert.ok(lanes?.claims.some((claim) => /x16\+x16 or x8\+x8/.test(claim.text)));
    assert.ok(lanes?.claims.some((claim) => claim.cite === 'rocm_mgpu'));
  });
});
