/** Pure /go/ href + retailer-order helpers. No YAML — tests can import this. */

import { flagOn } from './flags';

export const GO_SRC_PARAM = 'src';

/** Click-source tokens on /go/ links (`?src=`). Letters, numbers, hyphen. */
export function sanitizeGoSrc(src: string | undefined | null): string {
  if (!src) return '';
  const trimmed = src.trim();
  return /^[a-z0-9][a-z0-9-]*$/i.test(trimmed) ? trimmed : '';
}

export function goPath(retailerId: string, productId: string, src?: string): string {
  const path = `/go/${retailerId}/${productId}`;
  const tag = sanitizeGoSrc(src);
  return tag ? `${path}?${GO_SRC_PARAM}=${encodeURIComponent(tag)}` : path;
}

export function neweggFirstFromValue(value: string | undefined): boolean {
  return flagOn(value);
}

export function orderRetailers<T extends { id: string }>(list: readonly T[], neweggFirst: boolean): T[] {
  const rows = [...list];
  if (!neweggFirst) return rows;
  return [...rows.filter((row) => row.id === 'newegg'), ...rows.filter((row) => row.id !== 'newegg')];
}
