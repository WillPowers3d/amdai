/**
 * Honest "next step" buy pick for /can-run pair pages.
 * Built from the site's own canRunVerdict matrix (shopper file is Q4+).
 * Fits fully → no upsell. RAM offload → DDR5 kit. Needs 2 GPUs → one R9700
 * when that card fits fully, else a second of the same card.
 * No prices. Existing /go/ product ids only.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import {
  CAN_RUN_GPU_IDS,
  CAN_RUN_MODEL_IDS,
  CAN_RUN_VERDICT_LABEL,
  canRunPairPath,
  canRunVerdict,
  type CanRunGpuId,
  type CanRunModelId,
  type CanRunVerdictId,
} from './can-run';
import { GPU_COMPARE_PRODUCT, GPU_COMPARE_SLUG } from './gpu-compare';

export const CAN_RUN_NEXT_STEP_SRC = 'canrun-nextstep';
export const CAN_RUN_NEXT_STEP_ALT_SRC = 'canrun-nextstep-alt';
export const CAN_RUN_FOOTER_SRC = 'canrun-footer';
export const ONE_VS_TWO_SRC = 'one-vs-two';

export const UPGRADE_PICKS_TSV = 'upgrade-picks.tsv';

export type UpgradePickKind = 'keep' | 'primary' | 'alt';

export type UpgradePick = {
  kind: UpgradePickKind;
  label: string;
  productId: string | null;
};

export type UpgradePickTsvRow = {
  url: string;
  verdict: string;
  currentBuy: string;
  primaryPick: string;
  neweggRoute: string;
};

function readData(name: string): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [join(here, '../data', name), join(process.cwd(), 'src/data', name)];
  for (const file of candidates) {
    if (existsSync(file)) return readFileSync(file, 'utf8');
  }
  throw new Error(`${name} missing`);
}

function catalogProductIds(): Set<string> {
  const file = parse(readData('products.yaml')) as { products?: Array<{ id?: string }> };
  return new Set((file.products ?? []).map((row) => row.id).filter((id): id is string => Boolean(id)));
}

export function tsvVerdictLabel(verdict: CanRunVerdictId): string {
  return CAN_RUN_VERDICT_LABEL[verdict].toLowerCase();
}

export function nextStepPicks(modelId: CanRunModelId, gpuId: CanRunGpuId): UpgradePick[] {
  const verdict = canRunVerdict(modelId, gpuId);
  const gpuSlug = GPU_COMPARE_SLUG[gpuId];
  const productId = GPU_COMPARE_PRODUCT[gpuId];
  const oneR9700 = canRunVerdict(modelId, 'r9700') === 'fits-fully';

  if (verdict === 'fits-fully') {
    return [{ kind: 'keep', label: 'current card box unchanged', productId: null }];
  }

  if (verdict === 'needs-2-gpus') {
    if (oneR9700 && gpuId !== 'r9700') {
      return [
        {
          kind: 'primary',
          label: 'One Radeon AI PRO R9700 (32 GB) fits this model fully on one card',
          productId: 'r9700',
        },
        {
          kind: 'alt',
          label: `Or add a second ${gpuSlug} (see the 2x columns)`,
          productId,
        },
      ];
    }
    const primary: UpgradePick =
      gpuId === 'r9700'
        ? { kind: 'primary', label: 'A second R9700 (2x 32 GB)', productId: 'r9700' }
        : { kind: 'primary', label: `A second ${gpuSlug} for the 2x columns`, productId };
    return gpuId === 'r9700'
      ? [primary]
      : [primary, { kind: 'alt', label: 'Or a pair of R9700s (64 GB)', productId: 'r9700' }];
  }

  if (verdict === 'ram-offload') {
    const picks: UpgradePick[] = [
      { kind: 'primary', label: 'More DDR5 for the offloaded experts', productId: 'ddr5-kit' },
    ];
    if (oneR9700 && gpuId !== 'r9700') {
      picks.push({ kind: 'alt', label: 'One R9700 (32 GB) runs it fully', productId: 'r9700' });
    }
    return picks;
  }

  return [{ kind: 'keep', label: 'current card box unchanged', productId: null }];
}

export function upgradePickTsvRow(modelId: CanRunModelId, gpuId: CanRunGpuId): UpgradePickTsvRow {
  const picks = nextStepPicks(modelId, gpuId);
  const primary = picks[0];
  return {
    url: `${canRunPairPath(modelId, gpuId)}/`,
    verdict: tsvVerdictLabel(canRunVerdict(modelId, gpuId)),
    currentBuy: GPU_COMPARE_PRODUCT[gpuId],
    primaryPick: primary?.label ?? '',
    neweggRoute: primary?.productId ? `/go/newegg/${primary.productId}` : '',
  };
}

export function allUpgradePickTsvRows(): UpgradePickTsvRow[] {
  const rows: UpgradePickTsvRow[] = [];
  for (const modelId of CAN_RUN_MODEL_IDS) {
    for (const gpuId of CAN_RUN_GPU_IDS) {
      rows.push(upgradePickTsvRow(modelId, gpuId));
    }
  }
  return rows;
}

export function parseUpgradePicksTsv(text: string): UpgradePickTsvRow[] {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.length > 0);
  const header = lines[0]?.split('\t');
  if (!header || header[0] !== 'url' || header.length < 5) {
    throw new Error('upgrade-picks.tsv header');
  }
  return lines.slice(1).map((line) => {
    const [url, verdict, currentBuy, primaryPick, neweggRoute] = line.split('\t');
    return {
      url: (url ?? '').trim(),
      verdict: (verdict ?? '').trim(),
      currentBuy: (currentBuy ?? '').trim(),
      primaryPick: (primaryPick ?? '').trim(),
      neweggRoute: (neweggRoute ?? '').trim(),
    };
  });
}

export function loadExpectedUpgradePicks(): UpgradePickTsvRow[] {
  return parseUpgradePicksTsv(readData(UPGRADE_PICKS_TSV));
}

export function normPickUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed === '/' || trimmed === '') return '/';
  return trimmed.replace(/\/+$/, '');
}

export function diffUpgradePicks(
  expected: UpgradePickTsvRow[] = loadExpectedUpgradePicks(),
  actual: UpgradePickTsvRow[] = allUpgradePickTsvRows(),
): string[] {
  const byUrl = new Map(actual.map((row) => [normPickUrl(row.url), row]));
  const diffs: string[] = [];
  if (expected.length !== actual.length) {
    diffs.push(`count expected ${expected.length} got ${actual.length}`);
  }
  const seen = new Set<string>();
  for (const exp of expected) {
    const key = normPickUrl(exp.url);
    seen.add(key);
    const got = byUrl.get(key);
    if (!got) {
      diffs.push(`missing ${key}`);
      continue;
    }
    const fields: Array<keyof UpgradePickTsvRow> = [
      'verdict',
      'currentBuy',
      'primaryPick',
      'neweggRoute',
    ];
    for (const field of fields) {
      if (got[field] !== exp[field]) {
        diffs.push(`${key} ${field}: expected ${JSON.stringify(exp[field])} got ${JSON.stringify(got[field])}`);
      }
    }
  }
  for (const url of byUrl.keys()) {
    if (!seen.has(url)) diffs.push(`extra ${url}`);
  }
  return diffs;
}

export type UpgradePickCounts = {
  pages: number;
  keep: number;
  ddr5: number;
  oneR9700: number;
  secondCard: number;
  boxShown: number;
  addsNewProduct: number;
};

export function upgradePickCounts(): UpgradePickCounts {
  const counts: UpgradePickCounts = {
    pages: 0,
    keep: 0,
    ddr5: 0,
    oneR9700: 0,
    secondCard: 0,
    boxShown: 0,
    addsNewProduct: 0,
  };
  for (const modelId of CAN_RUN_MODEL_IDS) {
    for (const gpuId of CAN_RUN_GPU_IDS) {
      counts.pages += 1;
      const current = GPU_COMPARE_PRODUCT[gpuId];
      const picks = nextStepPicks(modelId, gpuId);
      const primary = picks[0];
      if (!primary?.productId) {
        counts.keep += 1;
        continue;
      }
      counts.boxShown += 1;
      if (primary.productId === 'ddr5-kit') counts.ddr5 += 1;
      else if (primary.label.startsWith('One Radeon')) counts.oneR9700 += 1;
      else counts.secondCard += 1;
      if (picks.some((pick) => pick.productId && pick.productId !== current)) {
        counts.addsNewProduct += 1;
      }
    }
  }
  return counts;
}

export const ONE_VS_TWO_PICKS: UpgradePick[] = [
  { kind: 'primary', label: 'A second R9700 (2x 32 GB)', productId: 'r9700' },
];

const BANNED_QUANT = /\b(?:IQ[12]_[A-Z0-9]+|Q[123]_[A-Z0-9]+|Q[123]\b)/;
const PRICE = /\$\d|\bMSRP\b|\bUSD\b/i;
const URGENCY = /\b(?:hurry|limited time|act now|don't miss|dont miss|last chance|today only|deal ends|while supplies|buy now)\b/i;

export function assertUpgradePicksValid(
  rows: UpgradePickTsvRow[] = allUpgradePickTsvRows(),
): string[] {
  const errors: string[] = [];
  const products = catalogProductIds();
  const expected = CAN_RUN_MODEL_IDS.length * CAN_RUN_GPU_IDS.length;
  if (rows.length !== expected) errors.push(`expected ${expected} pick rows; got ${rows.length}`);
  for (const modelId of CAN_RUN_MODEL_IDS) {
    for (const gpuId of CAN_RUN_GPU_IDS) {
      const picks = nextStepPicks(modelId, gpuId);
      const path = canRunPairPath(modelId, gpuId);
      if (!picks.length) errors.push(`${path} empty picks`);
      for (const pick of picks) {
        if (pick.productId) {
          if (!products.has(pick.productId)) errors.push(`${path} unknown product ${pick.productId}`);
        }
        if (BANNED_QUANT.test(pick.label)) errors.push(`${path} pick recommends a quant below Q4`);
        if (PRICE.test(pick.label)) errors.push(`${path} pick prints a price`);
        if (URGENCY.test(pick.label)) errors.push(`${path} pick uses urgency copy`);
      }
      const verdict = canRunVerdict(modelId, gpuId);
      const primary = picks.find((pick) => pick.kind === 'primary');
      if (verdict === 'fits-fully' && picks.some((pick) => pick.kind === 'primary')) {
        errors.push(`${path} must not upsell when it fits fully`);
      }
      if (verdict !== 'fits-fully' && verdict !== 'does-not-fit' && !primary?.productId) {
        errors.push(`${path} missing primary product`);
      }
    }
  }
  errors.push(...diffUpgradePicks());
  return [...new Set(errors)];
}
