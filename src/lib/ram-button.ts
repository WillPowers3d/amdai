/**
 * Map a page's "RAM needed at full context" kit size to a /go/ DDR5 product.
 * 48–64 GB → 64 GB search. 96 / 128 / 192 / 256 GB use the named kits.
 * Over 256 GB: no consumer AM5 kit — hide the RAM button.
 * No prices here.
 */

export const RAM_BUTTON_PRODUCTS = ['ddr5-kit', 'ddr5-96', 'ddr5-128', 'ddr5-192', 'ddr5-256'] as const;
export type RamButtonProduct = (typeof RAM_BUTTON_PRODUCTS)[number];

export type RamButtonPick = {
  productId: RamButtonProduct;
  kitGb: 64 | 96 | 128 | 192 | 256;
  label: string;
};

export function ramButtonForNeedGb(needFullGb: number | null | undefined): RamButtonPick | null {
  if (needFullGb == null || !Number.isFinite(needFullGb) || needFullGb <= 0) return null;
  if (needFullGb > 256) return null;
  if (needFullGb <= 64) {
    return { productId: 'ddr5-kit', kitGb: 64, label: 'Check 64 GB DDR5 kits at Newegg' };
  }
  if (needFullGb <= 96) {
    return { productId: 'ddr5-96', kitGb: 96, label: 'Check 96 GB DDR5 kits at Newegg' };
  }
  if (needFullGb <= 128) {
    return { productId: 'ddr5-128', kitGb: 128, label: 'Check 128 GB DDR5 kits at Newegg' };
  }
  if (needFullGb <= 192) {
    return { productId: 'ddr5-192', kitGb: 192, label: 'Check 192 GB DDR5 kits at Newegg' };
  }
  return { productId: 'ddr5-256', kitGb: 256, label: 'Check 256 GB DDR5 kits at Newegg' };
}
