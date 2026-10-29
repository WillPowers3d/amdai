import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PII_TEXT } from './pii-denylist';
import { runs } from './run-card-data';
import {
  SECOND_CARD_RAM_ID,
  SECOND_CARD_R9700_ID,
  SECOND_CARD_SRC,
  assertSecondCardValid,
  defaultSecondCardAnswers,
  flashEvidenceFromLabLog,
  secondCardClientPayload,
  secondCardVerdict,
  sweepCellsFromRuns,
  sweepHonesty,
  twoCardFlashStrataRows,
} from './second-card';

const here = dirname(fileURLToPath(import.meta.url));

describe('second R9700 honesty verdict', () => {
  it('derives the 16-row sweep from official cards and matches the draft self-test', () => {
    const cells = sweepCellsFromRuns(runs);
    assert.equal(cells.length, 16);
    const honesty = sweepHonesty(cells);
    assert.equal(honesty.oneDecodeWins, 12);
    assert.equal(honesty.splitDecodeWins, 4);
    assert.equal(honesty.udQ5OneDecodeWins, true);
    assert.deepEqual(honesty.q6SplitDecodeContexts, ['32K', '128K', '256K']);
    const prefill = Object.fromEntries(honesty.udQ5PrefillGains.map((row) => [row.ctx, row.pct]));
    assert.equal(prefill['128K'], 14);
    assert.equal(prefill['256K'], 29);
    assert.match(honesty.headline, /UD-Q5_K_XL/);
    assert.match(honesty.headline, /Q6_K/);
    assert.doesNotMatch(honesty.headline + honesty.detail, /\$\d|amazon/i);

    const cases = [
      [{}, false, 'keep one R9700'],
      [{ quant: 'Q4_K_M', ctx: '256K' }, false, 'keep one R9700'],
      [{ quant: 'Q6_K', ctx: '128K' }, false, 'UD-Q5_K_XL on the card you have'],
      [{ quant: 'UD-Q5_K_XL', ctx: '256K', longPrompts: true }, true, 'second R9700 (prompt speed only)'],
      [{ quant: 'Q4_K_M', ctx: 'short', longPrompts: true }, false, 'keep one R9700'],
      [{ model: 'flash' }, true, 'second R9700 + 256 GB DDR5'],
      [{ twoModels: true }, true, 'second R9700'],
      [{ ctxOver262k: true }, true, 'second R9700'],
    ];
    for (const [answers, wantBuy, pick] of cases) {
      const verdict = secondCardVerdict(answers, cells);
      assert.equal(verdict.buy, wantBuy, JSON.stringify(answers));
      assert.equal(Boolean(verdict.link), wantBuy, JSON.stringify(answers));
      assert.equal(verdict.pick, pick, JSON.stringify(answers));
      if (wantBuy) assert.match(verdict.link ?? '', /\/go\/newegg\/r9700/);
      else assert.equal(verdict.link, null);
    }
    const flash = secondCardVerdict({ model: 'flash' }, cells);
    assert.equal(flash.also, `/go/newegg/${SECOND_CARD_RAM_ID}?src=${SECOND_CARD_SRC}`);
    assert.deepEqual(assertSecondCardValid(runs), []);
  });

  it('pulls Flash two-card Strata rows from repo data instead of inventing them', () => {
    const rows = twoCardFlashStrataRows(runs);
    assert.ok(rows.length > 0, 'measured two-card Strata Flash rows exist in the repo');
    assert.ok(rows.some((row) => row.source === 'run-card' && /Q6/i.test(row.quant)));
    assert.ok(rows.every((row) => row.decode && row.href && row.quant && row.contextLabel));
    const evidence = flashEvidenceFromLabLog();
    if (evidence.storyTok != null) assert.equal(evidence.storyTok, 52);
    if (evidence.codeTok != null) assert.equal(evidence.codeTok, 65);
  });

  it('keeps Amazon and prices out of the compare page box', () => {
    const page = readFileSync(join(here, '../pages/compare/one-vs-two-gpu.astro'), 'utf8');
    const box = readFileSync(join(here, '../components/SecondCardBox.astro'), 'utf8');
    const lib = readFileSync(join(here, './second-card.ts'), 'utf8');
    assert.match(page, /SecondCardBox/);
    assert.match(page, /secondCardClientPayload/);
    assert.doesNotMatch(page, /NextStepBuyBox|ONE_VS_TWO_PICKS|Flash \/ Strata \/ Q3 pending|FLASH_RERUN_NOTE/);
    assert.match(page, /SWEEP_REVERIFY/);
    assert.match(page, /row\.flag/);
    assert.match(box, /AffiliateDisclosure/);
    assert.match(box, /data-pagefind-ignore/);
    assert.match(box, /Save your money/);
    assert.match(box, /\/go\/newegg|Check R9700 at Newegg/);
    assert.doesNotMatch(box, /amazon/i);
    assert.doesNotMatch(box, /\$\d|\bMSRP\b|hurry|limited time|act now|buy now/i);
    assert.equal(SECOND_CARD_SRC, 'second-card-verdict');
    assert.equal(SECOND_CARD_R9700_ID, 'r9700');
    assert.equal(SECOND_CARD_RAM_ID, 'ddr5-256');
    const payload = secondCardClientPayload(runs);
    assert.deepEqual(payload.defaultAnswers, defaultSecondCardAnswers());
    assert.equal(payload.defaultVerdict.buy, false);
    assert.equal(payload.defaultVerdict.pick, 'keep one R9700');
    assert.doesNotMatch(JSON.stringify(payload), /amazon/i);
    assert.doesNotMatch(JSON.stringify(payload), /\$\d/);
    for (const file of ['../pages/compare/one-vs-two-gpu.astro', '../components/SecondCardBox.astro', './second-card.ts']) {
      const text = readFileSync(join(here, file), 'utf8');
      assert.doesNotMatch(text, PII_TEXT, file);
      assert.doesNotMatch(text, /\/home\/|\/Users\//, file);
    }
    assert.doesNotMatch(lib, /102\.39,82\.78/);
  });
});
