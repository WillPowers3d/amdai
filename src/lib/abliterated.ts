import { abliteratedGuide, type AbliteratedRow, type AbliteratedStatus } from './status';

export const TIER_KEYS = ['starter', 'mid', 'enthusiast', 'pro'] as const;
export type TierKey = (typeof TIER_KEYS)[number];

export const TIER_LABEL: Record<TierKey, string> = {
  starter: 'Starter · 16 GB',
  mid: 'Mid · 20–24 GB',
  enthusiast: 'Enthusiast · 32 GB',
  pro: 'Pro · 2×32 GB',
};

export function statusLabel(status: AbliteratedStatus | undefined): string {
  if (status === 'tested') return 'Tested on our rig';
  if (status === 'community') return 'Community';
  if (status === 'untested') return 'Untested';
  return 'being reworked';
}

export function testedPickLabel(): string {
  return abliteratedGuide.tested_pick || 'being reworked';
}

export function catalogRows(): AbliteratedRow[] {
  return abliteratedGuide.rows;
}

export function q4PlusQuants(row: AbliteratedRow): { label: string; note: string }[] {
  if (row.quants && row.quants.length) return row.quants;
  return [{ label: row.quant_example, note: 'From catalog quant_example. Floor is Q4.' }];
}
