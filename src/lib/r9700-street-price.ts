/**
 * Dated, sourced R9700 street snapshot. Numbers come only from
 * src/data/r9700-street-price.yaml. Never invent a figure.
 * Logic lives here so tests never import YAML via ?raw.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

function readStreetPriceRaw(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    join(here, '../data/r9700-street-price.yaml'),
    join(process.cwd(), 'src/data/r9700-street-price.yaml'),
  ];
  for (const file of candidates) {
    if (existsSync(file)) return readFileSync(file, 'utf8');
  }
  throw new Error('r9700-street-price.yaml missing');
}

export type StreetQuote = {
  usd: string;
  retailer: string;
  listing: string;
};

export type StreetBand = {
  usd_low: number;
  usd_high: number;
};

export type R9700StreetPriceFile = {
  checked: string;
  region: string;
  condition: string;
  tax: string;
  scope: string;
  amd_msrp_usd: string;
  cheapest_new: StreetQuote;
  newegg: StreetQuote;
  bands: {
    one_card: StreetBand;
    two_cards: StreetBand;
  };
};

export const r9700StreetPrice = parse(readStreetPriceRaw()) as R9700StreetPriceFile;

export const R9700_STREET_CHECKED = r9700StreetPrice.checked;
export const R9700_STREET_LOG_HREF = '/lab-log';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

export function checkedDisplay(iso = R9700_STREET_CHECKED): string {
  const [year, month, day] = iso.split('-').map((part) => Number(part));
  const label = month != null ? MONTHS[month - 1] : undefined;
  if (!year || !label || !day) return iso;
  return `${label} ${day}, ${year}`;
}

export function formatUsd(amount: string | number): string {
  const raw = typeof amount === 'number' ? String(amount) : amount.trim();
  const negative = raw.startsWith('-');
  const unsigned = negative ? raw.slice(1) : raw;
  const [whole = '0', frac] = unsigned.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const body = frac != null && frac.length ? `${grouped}.${frac}` : grouped;
  return `${negative ? '-' : ''}$${body}`;
}

export function formatUsdWhole(n: number): string {
  return formatUsd(Math.trunc(n));
}

export function formatUsdRange(low: number, high: number): string {
  return `${formatUsdWhole(low)}–${formatUsdWhole(high)}`;
}

export const R9700_STREET_MSRP = formatUsd(r9700StreetPrice.amd_msrp_usd);
export const R9700_STREET_CHEAPEST = formatUsd(r9700StreetPrice.cheapest_new.usd);
export const R9700_STREET_NEWEGG = formatUsd(r9700StreetPrice.newegg.usd);
export const R9700_STREET_CHEAPEST_RETAILER = r9700StreetPrice.cheapest_new.retailer;
export const R9700_STREET_NEWEGG_RETAILER = r9700StreetPrice.newegg.retailer;

export const R9700_STREET_PRICE_LABEL =
  'approximate GPU-only US street, before tax — dated snapshot, not a live quote';

/** Visible line on the R9700 sheet and the hardware guide. */
export const R9700_STREET_SNAPSHOT = `US street price, GPU only, new, before tax, checked ${checkedDisplay()}: cheapest new ${R9700_STREET_CHEAPEST} at ${R9700_STREET_CHEAPEST_RETAILER}; ${R9700_STREET_NEWEGG_RETAILER} ${R9700_STREET_NEWEGG} (AMD MSRP ${R9700_STREET_MSRP}).`;

export const R9700_STREET_POLICY = 'No live or invented prices — dated, sourced snapshot only.';

export function r9700BudgetBandLabel(kind: 'one' | 'two'): string {
  const band = kind === 'one' ? r9700StreetPrice.bands.one_card : r9700StreetPrice.bands.two_cards;
  const who = kind === 'one' ? 'One R9700' : 'Two R9700s';
  const msrp = kind === 'one' ? `AMD MSRP ${R9700_STREET_MSRP}` : `AMD MSRP ${R9700_STREET_MSRP} each`;
  return `${who} ≈ ${formatUsdRange(band.usd_low, band.usd_high)} (GPU only, US street, new, before tax, checked ${R9700_STREET_CHECKED}; ${msrp})`;
}

export function streetBandForTier(id: string): { status: 'cited'; label: string; usd_low: number; usd_high: number } | undefined {
  if (id === 'enthusiast') {
    const band = r9700StreetPrice.bands.one_card;
    return { status: 'cited', label: r9700BudgetBandLabel('one'), usd_low: band.usd_low, usd_high: band.usd_high };
  }
  if (id === 'pro') {
    const band = r9700StreetPrice.bands.two_cards;
    return { status: 'cited', label: r9700BudgetBandLabel('two'), usd_low: band.usd_low, usd_high: band.usd_high };
  }
  return undefined;
}

function digitsOf(amount: string): string {
  return amount.replace(/[^\d.]/g, '');
}

export function assertR9700StreetPriceValid(): string[] {
  const errors: string[] = [];
  const file = r9700StreetPrice;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(file.checked)) errors.push('checked date');
  if (file.region !== 'US') errors.push('region');
  if (file.condition !== 'new') errors.push('condition');
  if (file.tax !== 'before tax') errors.push('tax');
  if (file.scope !== 'GPU only') errors.push('scope');
  if (!/^\d+(?:\.\d{1,2})?$/.test(file.amd_msrp_usd)) errors.push('msrp');
  if (!/^\d+\.\d{2}$/.test(file.cheapest_new.usd)) errors.push('cheapest must keep cents');
  if (!file.cheapest_new.retailer) errors.push('cheapest retailer');
  if (!/^\d+\.\d{2}$/.test(file.newegg.usd)) errors.push('newegg must keep cents');
  if (!file.newegg.retailer) errors.push('newegg retailer');
  const one = file.bands.one_card;
  const two = file.bands.two_cards;
  if (!Number.isInteger(one.usd_low) || !Number.isInteger(one.usd_high) || one.usd_low > one.usd_high) {
    errors.push('one-card band');
  }
  if (!Number.isInteger(two.usd_low) || !Number.isInteger(two.usd_high) || two.usd_low > two.usd_high) {
    errors.push('two-card band');
  }
  if (digitsOf(R9700_STREET_CHEAPEST) !== file.cheapest_new.usd) errors.push('cheapest rounded');
  if (digitsOf(R9700_STREET_NEWEGG) !== file.newegg.usd) errors.push('newegg rounded');
  if (digitsOf(R9700_STREET_MSRP) !== file.amd_msrp_usd) errors.push('msrp rounded');
  if (/\$1,900\b/.test(R9700_STREET_SNAPSHOT) && file.cheapest_new.usd !== '1900') {
    errors.push('rounded cheapest to $1,900');
  }
  for (const blob of [R9700_STREET_SNAPSHOT, r9700BudgetBandLabel('one'), r9700BudgetBandLabel('two')]) {
    if (!/GPU only/.test(blob)) errors.push('missing GPU only');
    if (!/before tax/.test(blob)) errors.push('missing before tax');
    if (!blob.includes(file.checked) && !blob.includes(checkedDisplay())) errors.push('missing checked date');
  }
  if (!/invented/.test(R9700_STREET_POLICY)) errors.push('policy must forbid invented prices');
  return [...new Set(errors)];
}
