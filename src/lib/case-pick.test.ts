import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import {
  CASE_FAN_NOTE,
  CASE_FAN_TEMP,
  CASE_GO_SLUGS,
  CASES,
  PSU_LENGTH_MM,
  R9700_MAX_MM,
  UNVERIFIED_SLOT_WARNING,
  UNVERIFIED_SPACING,
  VERIFIED_FOUR_SLOT,
  casePickPayload,
  caseRecommendation,
  needSlots,
} from './case-pick';

const here = dirname(fileURLToPath(import.meta.url));
const productsFile = parse(readFileSync(new URL('../data/products.yaml', import.meta.url), 'utf8')) as {
  products: Array<{ id: string; urls?: Record<string, string> }>;
};

function read(rel: string): string {
  return readFileSync(join(here, rel), 'utf8');
}

describe('builder case step', () => {
  it('fits two 2-slot R9700s in a 7-slot case on sourced 4-slot x8/x8 boards', () => {
    const taichi = caseRecommendation({
      boardId: 'asrock-x870-taichi-creator',
      formFactor: 'ATX',
      gpuCount: 2,
      psuName: 'Thermaltake Toughpower GT 1200W',
    });
    assert.equal(taichi.min_slots, 7);
    assert.equal(taichi.warnings.length, 0);
    assert.equal(taichi.picks.length, 3);
    assert.equal(taichi.primary.id, 'fractal-torrent');
    assert.equal(taichi.primary.go, '/go/newegg/fractal-design-torrent?src=builder-case-torrent');
    assert.match(taichi.why, /271/);
    assert.match(taichi.why, /67 C/);
    assert.match(taichi.why, /57 C/);
    assert.equal(needSlots('gigabyte-b850-ai-top', 2).slots, 7);
    assert.deepEqual([...VERIFIED_FOUR_SLOT], ['asrock-x870-taichi-creator', 'gigabyte-b850-ai-top']);
    assert.equal(R9700_MAX_MM, 271);
  });

  it('asks for 8+ slots on ProArt and X870E Taichi and warns', () => {
    for (const boardId of UNVERIFIED_SPACING) {
      const pick = caseRecommendation({
        boardId,
        formFactor: boardId === 'asrock-x870e-taichi' ? 'E-ATX' : 'ATX',
        gpuCount: 2,
        psuName: 'Thermaltake Toughpower GT 1200W',
      });
      assert.equal(pick.min_slots, 8, boardId);
      assert.ok(pick.warnings.includes(UNVERIFIED_SLOT_WARNING), boardId);
      assert.ok(pick.picks.every((row) => row.slots >= 8), boardId);
      assert.equal(pick.picks[0]?.id, 'phanteks-enthoo-pro-2-server');
    }
  });

  it('checks maker PSU lengths and does not invent missing ones', () => {
    assert.equal(PSU_LENGTH_MM['Thermaltake Toughpower GT 1200W'], 140);
    assert.equal(PSU_LENGTH_MM['Thermaltake Toughpower TF3 1300W'], 165);
    assert.equal(PSU_LENGTH_MM['Corsair HX1500i (2025)'], 200);
    assert.equal(PSU_LENGTH_MM['Corsair RM850x (2024, ATX 3.1)'], null);
    const unknown = caseRecommendation({
      boardId: 'asrock-x870-taichi-creator',
      formFactor: 'ATX',
      gpuCount: 1,
      psuName: 'Corsair RM850x (2024, ATX 3.1)',
    });
    assert.ok(unknown.notes.some((note) => /PSU length/.test(note)));
    const hx = caseRecommendation({
      boardId: 'asrock-x870-taichi-creator',
      formFactor: 'ATX',
      gpuCount: 2,
      psuName: 'Corsair HX1500i (2025)',
    });
    assert.ok(hx.picks.every((row) => CASES.find((c) => c.id === row.id)!.psu_max_mm >= 200));
    assert.match(CASE_FAN_NOTE, /67 C/);
    assert.match(CASE_FAN_NOTE, /57 C/);
    assert.equal(CASE_FAN_TEMP.cpu_follow_c, 67);
    assert.equal(CASE_FAN_TEMP.full_speed_c, 57);
    assert.doesNotMatch(JSON.stringify(unknown), /\$\d|\bMSRP\b/);
  });

  it('wires /go/newegg stubs, cites maker pages, and invents no prices', () => {
    assert.equal(CASE_GO_SLUGS.length, 3);
    for (const slug of CASE_GO_SLUGS) {
      const product = productsFile.products.find((row) => row.id === slug);
      assert.ok(product, slug);
      assert.match(product!.urls?.newegg ?? '', /^https:\/\/www\.newegg\.com\/p\/pl\?d=/);
      assert.doesNotMatch(product!.urls?.newegg ?? '', /[?&](tag|ranMID|irclickid)=|#src=/);
    }
    const payload = casePickPayload();
    assert.equal(payload.seven_slot.min_slots, 7);
    assert.equal(payload.eight_slot.min_slots, 8);
    assert.doesNotMatch(JSON.stringify(payload), /\$\d|\bMSRP\b/);
    assert.match(read('../pages/api/v1/pick.json.ts'), /casePickPayload/);
    assert.match(read('../pages/api/v1/pick/[gpu].json.ts'), /casePickPayload/);
    assert.match(read('../components/CasePick.astro'), /AffiliateDisclosure/);
    assert.match(read('../pages/budget.astro'), /CasePick/);
    assert.match(read('../pages/calculator.astro'), /CasePick/);
    assert.match(read('../components/RigWizard.astro'), /CasePick/);
    assert.doesNotMatch(read('../components/CasePick.astro'), /newegg\.com/);
  });
});
