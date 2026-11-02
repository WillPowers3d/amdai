/**
 * /where-to-buy-r9700 — dated Newegg listings read 2026-11-02.
 * Street prices appear only when we opened the retailer the same day.
 * Micro Center was not re-checked; that column stays without a dollar amount.
 * No marketplace-vs-Newegg-sold claim we did not verify. No pressure copy.
 */

export const WHERE_TO_BUY_PATH = '/where-to-buy-r9700';
export const WHERE_TO_BUY_PUBLISHED = '2026-11-02';
export const WHERE_TO_BUY_CHECKED = '2026-11-02';
export const WHERE_TO_BUY_CHECKED_LABEL = 'Nov 2, 2026';
export const WHERE_TO_BUY_CHECKED_WHEN = 'Nov 2, 2026';

export const WHERE_TO_BUY_TITLE = 'Where to buy the Radeon AI PRO R9700';
export const WHERE_TO_BUY_HEADING = 'Where to buy the Radeon AI PRO R9700';
export const WHERE_TO_BUY_DESCRIPTION =
  'Which US stores list the 32 GB Radeon AI PRO R9700, with Newegg prices dated Nov 2, 2026. Check the seller before you buy.';

export const WHERE_TO_BUY_NEWEGG_SRC = 'where-to-buy';
export const WHERE_TO_BUY_MICRO_SRC = 'where-to-buy';

export const WHERE_TO_BUY_LEAD =
  `Prices below are a dated snapshot from Newegg’s GPU-filtered search on ${WHERE_TO_BUY_CHECKED_LABEL}. They change; open the store before you buy. We do not invent a figure.`;

export const WHERE_TO_BUY_NEWEGG_NOTE =
  'Newegg GPU-category search (filter N=100007709): Gigabyte AI TOP listed at $2,799.99, with more options from $2,079.97–$3,290.00. ASRock Creator out of stock (last sold $1,699.99). Confirm who ships the card and the current price on the listing.';

export const WHERE_TO_BUY_MICRO_NOTE =
  'Micro Center was not re-checked on Nov 2, 2026. No Micro Center price on this page.';

export const WHERE_TO_BUY_PICK =
  'Prefer a new card sold by the store itself, not a third-party marketplace listing, so the store return policy and the maker warranty apply. We do not call a “fair” price. Check the listing.';

export const WHERE_TO_BUY_FITS =
  'What fits on one R9700: Qwen3.6-35B-A3B at Q5 with the full 256K context, measured at about 100 tok/s (see /results/).';

export const WHERE_TO_BUY_MSRP_NOTE =
  'AMD’s published launch price for this SKU is $1,299. That is the manufacturer figure already cited on this site, not a street quote.';

export type WhereToBuyRow = {
  store: string;
  found: string;
  price: string;
};

export const WHERE_TO_BUY_ROWS: WhereToBuyRow[] = [
  {
    store: 'Newegg',
    found: 'Gigabyte AI TOP in the GPU-filtered search. ASRock Creator listed out of stock.',
    price: '$2,799.99 (Gigabyte list); more options $2,079.97–$3,290.00; ASRock last sold $1,699.99',
  },
  {
    store: 'Micro Center',
    found: 'Search link only. We did not open Micro Center on Nov 2, 2026.',
    price: 'No price on this page',
  },
];
