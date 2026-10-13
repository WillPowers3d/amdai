import {
  abliteratedGuide,
  type AbliteratedFamily,
  type AbliteratedRow,
  type AbliteratedStatus,
} from './status';

export const NOT_DOCUMENTED = 'not documented by uploader';

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

export function listedQuants(row: AbliteratedRow): { label: string; note: string }[] {
  if (row.quants && row.quants.length) return row.quants;
  return [{ label: row.quant_example, note: 'From catalog quant_example. Q3 is estimate/community unless measured; Q1/Q2 stay off.' }];
}

export function fieldOrUnknown(value?: string | null): string {
  const text = value?.trim();
  return text ? text : NOT_DOCUMENTED;
}

export function catalogFamilies(): AbliteratedFamily[] {
  return abliteratedGuide.families ?? [];
}

export function familyById(id: string | undefined): AbliteratedFamily | undefined {
  if (!id) return undefined;
  return catalogFamilies().find((family) => family.id === id);
}

export function rowById(id: string): AbliteratedRow | undefined {
  return catalogRows().find((row) => row.id === id);
}
