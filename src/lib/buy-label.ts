/** Shared buy-button wording. Visible text stays short; aria-label names the product. */

export function buyButtonLabel(retailerName: string): string {
  return `${retailerName}: check price`;
}

export function buyButtonAriaLabel(productName: string, retailerName: string): string {
  return `Check ${productName} price at ${retailerName} (opens in a new tab)`;
}

export function buyLinkRel(affiliate: boolean): string {
  return affiliate ? 'sponsored nofollow noopener' : 'noopener';
}
