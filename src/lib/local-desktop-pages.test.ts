import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { local-desktop_DDR5_GB, local-desktop_USABLE_RAM_GB } from './calculator';
import {
  ALLOWED_DUAL_NUMBERS,
  MEASURED_ON_OUR_RIG,
  assertDualValid,
  collectDualNumbers,
  parselocal-desktopDual,
} from './local-desktop-dual';
import {
  ALLOWED_FLASH_NUMBERS,
  FLASH_RAM_QUANTS,
  NOT_MEASURED_ON_local-desktop,
  assertFlashDailyValid,
  collectFlashMeasuredNumbers,
  flashRamTable,
  formatLinuxGb,
  parseFlashDaily,
} from './flash-daily';
import { assertStrataDeepValid, parseStrataDeep } from './strata-deep';
import { primaryNav } from './site';

const dual = parselocal-desktopDual(parse(readFileSync(new URL('../data/local-desktop-dual.yaml', import.meta.url), 'utf8')));
const flash = parseFlashDaily(parse(readFileSync(new URL('../data/flash-daily.yaml', import.meta.url), 'utf8')));
const strata = parseStrataDeep(parse(readFileSync(new URL('../data/strata-deep.yaml', import.meta.url), 'utf8')));

describe('local-desktop dual 35B page', () => {
  it('seeds only the measured two-card set and prefers two copies', () => {
    assert.deepEqual(assertDualValid(dual), []);
    assert.equal(dual.host, 'local-desktop');
    assert.equal(dual.label, MEASURED_ON_OUR_RIG);
    assert.equal(dual.split.single_request_tok_s, 42.03);
    assert.equal(dual.split.max_total_tok_s, 82.78);
    assert.equal(dual.copies.per_request_tok_s, 100);
    assert.equal(dual.copies.total_at_2_tok_s, 172);
    assert.equal(dual.copies.total_at_4_to_8_tok_s, 177);
    assert.equal(dual.copies.soak_requests, 423);
    assert.equal(dual.copies.soak_minutes, 20.6);
    assert.equal(dual.copies.soak_errors, 0);
    assert.deepEqual(dual.copies.peak_vram_gb, [27.7, 29.7]);
    assert.equal(dual.copies.ddr5_gb, 13);
    assert.match(dual.recommendation, /two single-card copies/i);
    assert.equal(dual.overnight_results_json_rows.length, 0);
    assert.equal(dual.kit.usable_gb, local-desktop_USABLE_RAM_GB);
    assert.equal(dual.kit.dimm_gb, local-desktop_DDR5_GB);
    assert.equal(dual.vllm.image, 'stilldeadcode/vllm-radiance:0.5.8');
    assert.equal(dual.vllm.tok_s_low, 50);
    assert.equal(dual.vllm.tok_s_high, 61);
    assert.equal(dual.vllm.used_on_our_rig_catalog, false);
    for (const n of collectDualNumbers(dual)) {
      if (n === 0) continue;
      assert.ok(
        ALLOWED_DUAL_NUMBERS.some((allowed) => Math.abs(allowed - n) < 1e-9),
        `unexpected dual figure ${n}`,
      );
    }
  });
});

describe('Flash daily-driver page', () => {
  it('keeps Q6 measured, Q3/Q5 community, and RAM as estimates against 249 usable', () => {
    assert.deepEqual(assertFlashDailyValid(flash), []);
    assert.equal(flash.overnight_results_json_rows.length, 0);
    assert.equal(flash.kit.usable_gb, 249);
    assert.equal(flash.measured_q6_two_cards.strata_8k_tok_s, 32.8);
    assert.equal(flash.measured_q6_two_cards.strata_32k_tok_s, 32.8);
    assert.equal(flash.measured_q6_two_cards.strata_100k_tok_s, 31.8);
    assert.deepEqual(flash.measured_q6_two_cards.llamacpp_ddr5_5200, [18.5, 18.2, 17.9]);
    assert.deepEqual(flash.measured_q6_two_cards.llamacpp_ddr5_3600, [15.9, 15.6, 15.3]);
    assert.deepEqual(flash.measured_q6_two_cards.strata_prefill_drop_pct_at_5200, [9, 20]);
    assert.match(flash.measured_q6_two_cards.strata_prefill_note, /DDR5-5200/);
    assert.match(flash.measured_q6_two_cards.prior_first_party, /32\.6/);
    const q4 = flash.files.find((row) => row.short === 'Q4');
    assert.equal(q4?.file_gb, 111);
    assert.equal(FLASH_RAM_QUANTS.length, 4);
    const table = flashRamTable(flash);
    assert.equal(table.length, 8);
    for (const row of table) {
      assert.equal(row.labelKind, 'estimate');
      assert.ok(row.ram.atFullContext.rawGiB > 0);
      assert.ok(row.ram.atSelected.kitGb >= 16);
      assert.match(row.kitVsUsable, /249/);
      assert.match(formatLinuxGb(row.weightsGiB), /GB/);
      if (row.short === 'Q3' || row.short === 'Q5') {
        assert.ok(row.offloadedWeightsGiB > 0);
      }
    }
    const twoQ6 = table.find((row) => row.short === 'Q6' && row.cards === 2);
    const oneQ6 = table.find((row) => row.short === 'Q6' && row.cards === 1);
    assert.ok(twoQ6 && oneQ6);
    assert.ok(oneQ6.offloadedWeightsGiB > twoQ6.offloadedWeightsGiB);
    assert.ok(twoQ6.ram.atFullContext.kitGb <= 256);
    for (const n of collectFlashMeasuredNumbers(flash)) {
      assert.ok(
        ALLOWED_FLASH_NUMBERS.some((allowed) => Math.abs(allowed - n) < 1e-9),
        `unexpected flash figure ${n}`,
      );
    }
    for (const row of flash.community_speeds) {
      assert.equal(row.label, NOT_MEASURED_ON_local-desktop);
    }
    const q5 = flash.community_speeds.find((row) => row.quant === 'Q5');
    assert.equal(q5?.figures, '');
    assert.ok(flash.community_speeds.some((row) => row.note.includes('#1638')));
    assert.ok(flash.sources.some((row) => row.title.includes('#1638')));
  });
});

describe('Strata deep dive', () => {
  it('cites dated sources, keeps MTP off, and does not invent tok/s', () => {
    assert.deepEqual(assertStrataDeepValid(strata), []);
    assert.equal(strata.pin, 'v0.1.42');
    assert.equal(strata.pin_date, '2026-10-10');
    assert.match(strata.why_faster, /32\.6/);
    assert.match(strata.why_faster, /32\.8/);
    assert.match(strata.x_search, /X \/ Twitter/);
    assert.match(strata.x_search, /No post we can cite/);
    assert.ok(strata.limits.some((row) => /MTP/i.test(row.title) && /49\.5/.test(row.body)));
    assert.match(strata.we_dont_use_q2, /stay off/);
    assert.ok(strata.community.some((row) => row.href.includes('issues/1910') && row.title.includes('#1910')));
    assert.ok(strata.community.some((row) => row.href.includes('pulls/1381') && row.title.includes('#1381')));
    assert.ok(strata.community.some((row) => row.href.includes('releases/v0.1.42')));
    assert.ok(strata.community.some((row) => row.title.includes('#1638')));
    for (const row of strata.community) {
      assert.match(row.href, /^https:\/\//);
      assert.ok(row.date.length > 0);
    }
  });
});

describe('nav for the new pages', () => {
  it('lists /qwen36-dual and /flash-daily', () => {
    assert.ok(primaryNav.some((item) => item.href === '/qwen36-dual'));
    assert.ok(primaryNav.some((item) => item.href === '/multi-gpu'));
    assert.ok(primaryNav.some((item) => item.href === '/flash-daily'));
    assert.ok(primaryNav.some((item) => item.href === '/flash-ram-offload'));
    assert.ok(primaryNav.some((item) => item.href === '/glossary'));
    assert.ok(primaryNav.some((item) => item.href === '/compare'));
  });
});
