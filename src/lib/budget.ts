import { parse } from 'yaml';
import budgetRaw from '../data/budget-tiers.yaml?raw';

export type UsdBand = {
  status: 'todo' | 'cited';
  label: string;
  usd_low: number | null;
  usd_high: number | null;
};

export type FitRow = {
  model: string;
  quant: string;
  note: string;
  calculator: string;
  tested: false | 'daily' | 'fast';
  /** Omit to show for both priorities. */
  show?: Array<'size' | 'speed'>;
};

export type PriorityCopy = {
  verdict: string;
  give_up: string;
};

export type BudgetTier = {
  id: string;
  name: string;
  order: number;
  slider: number;
  tagline: string;
  vram_note: string;
  usd_band: UsdBand;
  gpus: string[];
  parts: string[];
  ram: string;
  nvme: string;
  psu: string;
  backend: string;
  give_up: string;
  size: PriorityCopy;
  speed: PriorityCopy;
  tested_rig?: boolean;
  fits: FitRow[];
};

export function fitsForPriority(tier: BudgetTier, priority: 'size' | 'speed'): FitRow[] {
  return tier.fits.filter((row) => !row.show || row.show.includes(priority));
}

export function copyForPriority(tier: BudgetTier, priority: 'size' | 'speed'): PriorityCopy {
  return tier[priority];
}

export type UpgradePath = {
  title: string;
  lede: string;
  steps: string[];
  products: string[];
};

export type BudgetFile = {
  as_of: string;
  price_label: string;
  tiers: BudgetTier[];
  upgrade: UpgradePath;
};

export const budgetFile = parse(budgetRaw) as BudgetFile;
export const budgetTiers = [...budgetFile.tiers].sort((a, b) => a.order - b.order);

export function tierBySlider(value: number): BudgetTier {
  return budgetTiers.find((tier) => tier.slider === value) ?? budgetTiers[0];
}

export function tierById(id: string): BudgetTier | undefined {
  return budgetTiers.find((tier) => tier.id === id);
}

/** Only matches when both band ends are real numbers. Unset bands never match a dollar input. */
export function tierForUsd(usd: number): BudgetTier | undefined {
  if (!Number.isFinite(usd) || usd <= 0) return undefined;
  return budgetTiers.find((tier) => {
    const { usd_low, usd_high, status } = tier.usd_band;
    if (status !== 'cited' || usd_low == null || usd_high == null) return false;
    return usd >= usd_low && usd <= usd_high;
  });
}

export function bandsReady(): boolean {
  return budgetTiers.every((tier) => tier.usd_band.status === 'cited' && tier.usd_band.usd_low != null && tier.usd_band.usd_high != null);
}
