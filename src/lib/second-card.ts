/**
 * Honest “should I buy a second R9700?” verdict for /compare/one-vs-two-gpu.
 * Decode / prefill come from official 35B llama.cpp cards via oneVsTwoRows.
 * Flash two-card Strata rows come from run cards plus lab-log metrics.
 * No invented tok/s or prices. Newegg /go/ stubs only.
 */

import { goPath } from './go-src';
import { LAB_LOG_PATH, entryAnchor, loadLabLogFile, type LabLogEntry, type LabLogFile } from './lab-log';
import { oneVsTwoRows } from './local-desktop-compare';
import { PII_TEXT } from './pii-denylist';
import {
  contextLabel,
  matchRuns,
  runPath,
  verifiedMeasured,
  type Qwen36CompareRow,
  type RunCard,
} from './run-card';

export const SECOND_CARD_SRC = 'second-card-verdict';
export const SECOND_CARD_R9700_ID = 'r9700';
export const SECOND_CARD_RAM_ID = 'ddr5-256';
export const SECOND_CARD_FLASH_LAB = '2026-10-23-measured-flash-q5-vs-q6-strata';
export const SECOND_CARD_CITED_LAB = '2026-10-26-strata-mtp-q2-only-second-card';

export const MEASURED_EVIDENCE = 'measured, pending re-verify after RAM fix';

export type SecondCardModel = '35b' | 'flash';
export type SecondCardCtx = 'short' | '32K' | '128K' | '256K';

export type SecondCardAnswers = {
  model?: SecondCardModel;
  quant?: string;
  ctx?: SecondCardCtx;
  longPrompts?: boolean;
  twoModels?: boolean;
  ctxOver262k?: boolean;
};

export type SecondCardVerdict = {
  buy: boolean;
  pick: string;
  why: string;
  evidence: string;
  link: string | null;
  also: string | null;
};

export type SweepCell = {
  quant: string;
  ctx: SecondCardCtx;
  context: number;
  contextLabel: string;
  oneDecode: number;
  splitDecode: number;
  onePrefill: number;
  splitPrefill: number;
  flag: string;
};

export type SweepHonesty = {
  total: number;
  oneDecodeWins: number;
  splitDecodeWins: number;
  ties: number;
  incomplete: number;
  udQ5OneDecodeWins: boolean;
  q6SplitDecodeContexts: SecondCardCtx[];
  udQ5PrefillGains: Array<{ ctx: SecondCardCtx; pct: number; one: number; split: number }>;
  headline: string;
  detail: string;
};

export type FlashStrataRow = {
  quant: string;
  contextLabel: string;
  decode: string;
  note: string;
  href: string;
  source: 'run-card' | 'lab-log';
};

export type FlashSecondCardEvidence = {
  storyTok: number | null;
  codeTok: number | null;
  citedOneStory: number | null;
  citedTwoStory: number | null;
  citedOneCode: number | null;
  citedTwoCode: number | null;
};

const CTX_FROM_TOKENS: Record<number, SecondCardCtx> = {
  4096: 'short',
  32768: '32K',
  131072: '128K',
  262144: '256K',
};

const PRICE = /\$\d|\bMSRP\b|\bUSD\b/i;
const URGENCY = /\b(?:hurry|limited time|act now|don't miss|dont miss|last chance|today only|deal ends|while supplies|buy now)\b/i;
const AMAZON = /amazon/i;

function decodeNumbers(text: string): number[] {
  if (!text || text === 'not measured') return [];
  return [...text.matchAll(/(\d+(?:\.\d+)?)/g)].map((match) => Number(match[1]));
}

function firstTok(text: string): number | null {
  const nums = decodeNumbers(text);
  return nums.length === 1 ? nums[0]! : null;
}

export function fmtTok(n: number): string {
  return String(n);
}

export function pctChange(from: number, to: number): number {
  if (!from) return 0;
  return ((to - from) / from) * 100;
}

export function r9700GoHref(): string {
  return goPath('newegg', SECOND_CARD_R9700_ID, SECOND_CARD_SRC);
}

export function ram256GoHref(): string {
  return goPath('newegg', SECOND_CARD_RAM_ID, SECOND_CARD_SRC);
}

export function sweepCellsFromRows(rows: Qwen36CompareRow[]): SweepCell[] {
  const cells: SweepCell[] = [];
  for (const row of rows) {
    const ctx = CTX_FROM_TOKENS[row.context];
    const oneDecode = firstTok(row.one.decode);
    const splitDecode = firstTok(row.both.decode);
    const onePrefill = firstTok(row.one.prefill);
    const splitPrefill = firstTok(row.both.prefill);
    if (!ctx || oneDecode == null || splitDecode == null || onePrefill == null || splitPrefill == null) {
      continue;
    }
    cells.push({
      quant: row.quant,
      ctx,
      context: row.context,
      contextLabel: row.contextLabel,
      oneDecode,
      splitDecode,
      onePrefill,
      splitPrefill,
      flag: row.flag ?? '',
    });
  }
  return cells;
}

export function sweepCellsFromRuns(cards: RunCard[]): SweepCell[] {
  return sweepCellsFromRows(oneVsTwoRows(cards));
}

export function findSweepCell(cells: SweepCell[], quant: string, ctx: SecondCardCtx): SweepCell | undefined {
  return cells.find((row) => row.quant === quant && row.ctx === ctx);
}

export function sweepHonesty(cells: SweepCell[]): SweepHonesty {
  let oneDecodeWins = 0;
  let splitDecodeWins = 0;
  let ties = 0;
  for (const row of cells) {
    const delta = row.oneDecode - row.splitDecode;
    if (Math.abs(delta) < 0.5) ties += 1;
    else if (delta > 0) oneDecodeWins += 1;
    else splitDecodeWins += 1;
  }
  const udQ5 = cells.filter((row) => row.quant === 'UD-Q5_K_XL');
  const udQ5OneDecodeWins = udQ5.length > 0 && udQ5.every((row) => row.oneDecode > row.splitDecode);
  const q6SplitDecodeContexts = cells
    .filter((row) => row.quant === 'Q6_K' && row.splitDecode > row.oneDecode)
    .map((row) => row.ctx);
  const udQ5PrefillGains = udQ5
    .filter((row) => row.ctx === '128K' || row.ctx === '256K')
    .map((row) => ({
      ctx: row.ctx,
      pct: Math.round(pctChange(row.onePrefill, row.splitPrefill)),
      one: row.onePrefill,
      split: row.splitPrefill,
    }));
  const prefillBits = udQ5PrefillGains.map((row) => `+${row.pct}% at ${row.ctx}`).join(' and ');
  const headline = udQ5OneDecodeWins
    ? `For the 35B (UD-Q5_K_XL), one card is faster at decode. A split only wins on decode for Q6_K past short context.`
    : `On this sweep, one R9700 decodes faster in ${oneDecodeWins} of ${cells.length} rows.`;
  const detail = [
    `Winner counts from the measured cards: one GPU ${oneDecodeWins} · split ${splitDecodeWins} · tie ${ties}.`,
    prefillBits
      ? `The split prefills long prompts faster (${prefillBits}, from the UD-Q5_K_XL cards).`
      : 'Long-prompt prefill is compared on the UD-Q5_K_XL cards when both sides are measured.',
    'A second card pays off for Flash-class models, for running two models at once, and for going beyond 262K context.',
  ].join(' ');
  return {
    total: cells.length,
    oneDecodeWins,
    splitDecodeWins,
    ties,
    incomplete: 0,
    udQ5OneDecodeWins,
    q6SplitDecodeContexts,
    udQ5PrefillGains,
    headline,
    detail,
  };
}

function parseArrowPair(value: string): { from: number; to: number } | null {
  const match = String(value).match(/(\d+(?:\.\d+)?)\s*(?:->|→|to)\s*(\d+(?:\.\d+)?)/);
  if (!match) return null;
  return { from: Number(match[1]), to: Number(match[2]) };
}

function metricValue(entry: LabLogEntry | undefined, label: RegExp): string | number | null {
  const hit = entry?.metrics?.find((row) => label.test(row.label));
  return hit?.value ?? null;
}

function asNumber(value: string | number | null): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && /^-?\d+(?:\.\d+)?$/.test(value.trim())) return Number(value);
  return null;
}

export function flashEvidenceFromLabLog(file: LabLogFile = loadLabLogFile()): FlashSecondCardEvidence {
  const measured = file.entries.find((entry) => entry.id === SECOND_CARD_FLASH_LAB);
  const cited = file.entries.find((entry) => entry.id === SECOND_CARD_CITED_LAB);
  const codeArrow = parseArrowPair(String(metricValue(cited, /UD-Q5 1\s*->\s*2 R9700 code/i) ?? ''));
  const storyFromDetails = cited?.details?.match(/UD-Q5\s+(\d+(?:\.\d+)?)\s+to\s+(\d+(?:\.\d+)?)\s+and\s+(\d+(?:\.\d+)?)\s+to\s+(\d+(?:\.\d+)?)/);
  return {
    storyTok: asNumber(metricValue(measured, /short story/i)),
    codeTok: asNumber(metricValue(measured, /decode, code/i)),
    citedOneStory: storyFromDetails ? Number(storyFromDetails[1]) : null,
    citedTwoStory: storyFromDetails ? Number(storyFromDetails[2]) : null,
    citedOneCode: codeArrow?.from ?? (storyFromDetails ? Number(storyFromDetails[3]) : null),
    citedTwoCode: codeArrow?.to ?? (storyFromDetails ? Number(storyFromDetails[4]) : null),
  };
}

function flashWhy(evidence: FlashSecondCardEvidence): string {
  const bits = [
    'A Flash-class model does not fit one 32 GB card at Q4+, so the RAM is the must-buy and the second card is the speed add-on.',
  ];
  if (evidence.storyTok != null && evidence.codeTok != null) {
    bits.push(
      `Measured here: two R9700s + DDR5 on Strata, UD-Q5_K_XL, ${fmtTok(evidence.storyTok)} tok/s story / ${fmtTok(evidence.codeTok)} code.`,
    );
  }
  if (
    evidence.citedOneStory != null &&
    evidence.citedTwoStory != null &&
    evidence.citedOneCode != null &&
    evidence.citedTwoCode != null
  ) {
    bits.push(
      `Cited (maintainer, MTP on, experts in RAM): one card UD-Q5 ${fmtTok(evidence.citedOneStory)}/${fmtTok(evidence.citedOneCode)} tok/s, two cards ${fmtTok(evidence.citedTwoStory)}/${fmtTok(evidence.citedTwoCode)}.`,
    );
  }
  return bits.join(' ');
}

function flashEvidenceLine(evidence: FlashSecondCardEvidence): string {
  if (evidence.citedOneStory != null && evidence.citedTwoStory != null && evidence.citedOneCode != null && evidence.citedTwoCode != null) {
    const story = pctChange(evidence.citedOneStory, evidence.citedTwoStory);
    const code = pctChange(evidence.citedOneCode, evidence.citedTwoCode);
    return `measured + cited; second card adds ~${Math.round(story)}% story, ~${Math.round(code)}% code decode on Strata`;
  }
  return 'measured + cited';
}

export function secondCardVerdict(
  answers: SecondCardAnswers,
  cells: SweepCell[],
  evidence: FlashSecondCardEvidence = flashEvidenceFromLabLog(),
): SecondCardVerdict {
  const model = answers.model === 'flash' ? 'flash' : '35b';
  const quant = answers.quant || 'UD-Q5_K_XL';
  const ctx = answers.ctx || 'short';
  const longPrompts = Boolean(answers.longPrompts);
  const twoModels = Boolean(answers.twoModels);
  const ctxOver262k = Boolean(answers.ctxOver262k);
  const r9700 = r9700GoHref();
  const ram = ram256GoHref();

  if (twoModels) {
    return {
      buy: true,
      pick: 'second R9700',
      why: 'Running the 35B on one card and a second model on the other is the cleanest reason to own two cards: neither model is split, so neither loses speed.',
      evidence: 'layout reason, no speed claim',
      link: r9700,
      also: null,
    };
  }
  if (model === 'flash') {
    return {
      buy: true,
      pick: 'second R9700 + 256 GB DDR5',
      why: flashWhy(evidence),
      evidence: flashEvidenceLine(evidence),
      link: r9700,
      also: ram,
    };
  }
  if (ctxOver262k) {
    return {
      buy: true,
      pick: 'second R9700',
      why: 'Past 262K on the 35B (YaRN to ~1M) needs two cards at f16 KV by our KV math; one card reaches 524K only at UD-Q5 with q8_0 KV.',
      evidence: 'estimate from GGUF KV sizes',
      link: r9700,
      also: null,
    };
  }

  const row = findSweepCell(cells, quant, ctx);
  if (!row) {
    return {
      buy: false,
      pick: 'keep one R9700',
      why: 'No measured one-vs-split cell for that filter. We will not invent a tok/s.',
      evidence: MEASURED_EVIDENCE,
      link: null,
      also: null,
    };
  }

  const dec = pctChange(row.oneDecode, row.splitDecode);
  const pre = pctChange(row.onePrefill, row.splitPrefill);
  if (longPrompts && pre >= 10) {
    return {
      buy: true,
      pick: 'second R9700 (prompt speed only)',
      why: `At ${row.contextLabel} the split reads prompts ${Math.round(pre)}% faster (${fmtTok(row.onePrefill)} -> ${fmtTok(row.splitPrefill)} tok/s) while decode changes ${dec >= 0 ? '+' : ''}${Math.round(dec)}%. Worth it only if long documents are your main workload.`,
      evidence: MEASURED_EVIDENCE,
      link: r9700,
      also: null,
    };
  }
  if (dec > 0 && quant === 'Q6_K') {
    const udShort = findSweepCell(cells, 'UD-Q5_K_XL', 'short');
    const q6Short = findSweepCell(cells, 'Q6_K', 'short');
    const ud128 = findSweepCell(cells, 'UD-Q5_K_XL', '128K');
    const q6_128 = findSweepCell(cells, 'Q6_K', '128K');
    const ud256 = findSweepCell(cells, 'UD-Q5_K_XL', '256K');
    const q6_256 = findSweepCell(cells, 'Q6_K', '256K');
    const beats: string[] = [];
    if (udShort && q6Short) beats.push(`${fmtTok(udShort.oneDecode)} vs ${fmtTok(q6Short.splitDecode)} short`);
    if (ud128 && q6_128) beats.push(`${fmtTok(ud128.oneDecode)} vs ${fmtTok(q6_128.splitDecode)} at 128K`);
    if (ud256 && q6_256) beats.push(`${fmtTok(ud256.oneDecode)} vs ${fmtTok(q6_256.splitDecode)} at 256K`);
    const beatBit = beats.length ? ` UD-Q5_K_XL on one card beats the Q6_K split at every measured context (${beats.join(', ')}) and costs nothing.` : '';
    return {
      buy: false,
      pick: 'UD-Q5_K_XL on the card you have',
      why: `Q6_K on one card spills into DDR5 past short context, so a split wins by ${Math.round(dec)}% (${fmtTok(row.oneDecode)} -> ${fmtTok(row.splitDecode)} tok/s).${beatBit}`,
      evidence: MEASURED_EVIDENCE,
      link: null,
      also: null,
    };
  }
  return {
    buy: false,
    pick: 'keep one R9700',
    why: `Measured: one card decodes ${fmtTok(row.oneDecode)} tok/s, a split of the same file ${fmtTok(row.splitDecode)} (${dec >= 0 ? '+' : ''}${Math.round(dec)}%). A second card does not make the 35B faster here.`,
    evidence: MEASURED_EVIDENCE,
    link: null,
    also: null,
  };
}

export function defaultSecondCardAnswers(): Required<SecondCardAnswers> {
  return {
    model: '35b',
    quant: 'UD-Q5_K_XL',
    ctx: 'short',
    longPrompts: false,
    twoModels: false,
    ctxOver262k: false,
  };
}

export function twoCardFlashStrataFromRuns(cards: RunCard[]): FlashStrataRow[] {
  const hits = matchRuns(verifiedMeasured(cards), {
    model: 'flash',
    backend: 'Strata',
    gpus: 2,
  }).filter((card) => card.results.decode_tps != null);
  const rows = hits
    .slice()
    .sort((a, b) => a.config.context_tokens - b.config.context_tokens || a.run_id.localeCompare(b.run_id))
    .map((card) => ({
      quant: card.model.quant,
      contextLabel: contextLabel(card.config.context_tokens),
      decode: `${fmtTok(card.results.decode_tps!)} tok/s`,
      note: card.notes || 'Two-card Flash on Strata.',
      href: runPath(card.run_id),
      source: 'run-card' as const,
    }));
  return rows;
}

export function twoCardFlashStrataFromLabLog(file: LabLogFile = loadLabLogFile()): FlashStrataRow[] {
  const entry = file.entries.find((row) => row.id === SECOND_CARD_FLASH_LAB);
  if (!entry?.metrics?.length) return [];
  const href = `${LAB_LOG_PATH}/#${entryAnchor(entry.id)}`;
  const rows: FlashStrataRow[] = [];
  for (const metric of entry.metrics) {
    if (!/Strata UD-Q5/i.test(metric.label) || !metric.unit || !/tok\/s/i.test(metric.unit)) continue;
    if (/prefill/i.test(metric.label)) continue;
    rows.push({
      quant: 'UD-Q5_K_XL',
      contextLabel: /131K/.test(metric.label) ? '128K' : /36K/.test(metric.label) ? '36K' : 'short',
      decode: `${metric.value} ${metric.unit}`.trim(),
      note: metric.label,
      href,
      source: 'lab-log',
    });
  }
  return rows;
}

export function twoCardFlashStrataRows(
  cards: RunCard[],
  file: LabLogFile = loadLabLogFile(),
): FlashStrataRow[] {
  return [...twoCardFlashStrataFromRuns(cards), ...twoCardFlashStrataFromLabLog(file)];
}

export type SecondCardClientPayload = {
  cells: SweepCell[];
  honesty: SweepHonesty;
  flash: FlashSecondCardEvidence;
  defaultAnswers: Required<SecondCardAnswers>;
  defaultVerdict: SecondCardVerdict;
  r9700Href: string;
  ramHref: string;
};

export function secondCardClientPayload(cards: RunCard[]): SecondCardClientPayload {
  const cells = sweepCellsFromRuns(cards);
  const flash = flashEvidenceFromLabLog();
  const defaultAnswers = defaultSecondCardAnswers();
  return {
    cells,
    honesty: sweepHonesty(cells),
    flash,
    defaultAnswers,
    defaultVerdict: secondCardVerdict(defaultAnswers, cells, flash),
    r9700Href: r9700GoHref(),
    ramHref: ram256GoHref(),
  };
}

export function assertSecondCardValid(
  cards: RunCard[],
  verdicts: SecondCardVerdict[] = [
    secondCardVerdict(defaultSecondCardAnswers(), sweepCellsFromRuns(cards)),
    secondCardVerdict({ model: 'flash' }, sweepCellsFromRuns(cards)),
    secondCardVerdict({ twoModels: true }, sweepCellsFromRuns(cards)),
    secondCardVerdict({ ctxOver262k: true }, sweepCellsFromRuns(cards)),
    secondCardVerdict({ quant: 'Q6_K', ctx: '128K' }, sweepCellsFromRuns(cards)),
    secondCardVerdict({ quant: 'UD-Q5_K_XL', ctx: '256K', longPrompts: true }, sweepCellsFromRuns(cards)),
  ],
): string[] {
  const errors: string[] = [];
  const cells = sweepCellsFromRuns(cards);
  if (cells.length !== 16) errors.push(`expected 16 measured one-vs-two cells, got ${cells.length}`);
  const honesty = sweepHonesty(cells);
  if (honesty.oneDecodeWins + honesty.splitDecodeWins + honesty.ties !== cells.length) {
    errors.push('winner counts do not cover every cell');
  }
  for (const verdict of verdicts) {
    const blob = `${verdict.pick} ${verdict.why} ${verdict.evidence} ${verdict.link ?? ''} ${verdict.also ?? ''}`;
    if (PRICE.test(blob)) errors.push('verdict prints a price');
    if (URGENCY.test(blob)) errors.push('verdict uses urgency copy');
    if (AMAZON.test(blob)) errors.push('verdict mentions Amazon');
    if (PII_TEXT.test(blob)) errors.push('verdict has banned PII');
    if (verdict.buy && !verdict.link) errors.push(`${verdict.pick} buy without a Newegg stub`);
    if (!verdict.buy && verdict.link) errors.push(`${verdict.pick} save-money still has a buy link`);
    if (verdict.link && !verdict.link.startsWith('/go/newegg/')) errors.push(`${verdict.pick} link is not a Newegg stub`);
    if (verdict.also && !verdict.also.startsWith('/go/newegg/')) errors.push(`${verdict.pick} RAM link is not a Newegg stub`);
  }
  const keep = secondCardVerdict(defaultSecondCardAnswers(), cells);
  if (keep.buy) errors.push('default 35B short UD-Q5 must not sell a second card');
  return [...new Set(errors)];
}
