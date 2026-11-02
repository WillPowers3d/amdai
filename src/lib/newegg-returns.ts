/**
 * Honest Newegg returns line under buy buttons.
 * Never say "free returns" without a same-day product-tab read of the
 * Hassle-Free badge on a Sold-and-Shipped-by-Newegg offer.
 * Marketplace GPU listings use the seller's policy, not Newegg's.
 */

export const NEWEGG_RETURNS_CHECKED = '2026-10-30';

export function neweggReturnLine(productId?: string): string {
  if (productId === 'r9700') {
    return "Newegg's R9700 offers have been marketplace sellers (checked 2026-10-30), so that seller's return policy applies, not Newegg's. Open the listing's Warranty & Returns tab before you buy.";
  }
  return "Return terms vary by seller and item. Newegg's Hassle-Free page covers only Sold-and-Shipped-by-Newegg listings; marketplace items use the seller's policy. See the listing's Warranty & Returns tab.";
}
