/**
 * Allow Q3 and up (Q3_K_M / Q3_K_S / UD-Q3_K_XL / IQ3).
 * Reject Q1 / Q2 and IQ1 / IQ2, including draft heads.
 * Unsourced numbers stay a separate check.
 */

const FORBIDDEN = /(?:^|[^a-z0-9])(?:ud-)?(?:iq[12]|q[12])(?:[_-]|$)/i;
const RECOGNIZED = /(?:^|[^a-z0-9])(?:ud-)?(?:iq[34]|q[3-8]|bf16|f16|fp16)/i;

export function isQuantAllowed(quant: string): boolean {
  const q = quant.trim();
  if (!q) return false;
  if (FORBIDDEN.test(q)) return false;
  return RECOGNIZED.test(q);
}

export function assertQuantAllowed(quant: string): string {
  const trimmed = quant.trim();
  if (!isQuantAllowed(trimmed)) {
    throw new Error(`Quant "${quant}" is Q1/Q2 or not recognized. Q3 and up are listed; Q1/Q2 stay off this site.`);
  }
  return trimmed;
}

export function isQ3Quant(quant: string): boolean {
  return /(?:^|[^a-z0-9])(?:ud-)?(?:iq3|q3)(?:[_-]|$)/i.test(quant);
}

/** Stack Lab handoff and /recipes.json: Q4+ recipes. Q3 stays on compare pages as a labeled estimate. */
export function isQ4PlusQuant(quant: string): boolean {
  return isQuantAllowed(quant) && !isQ3Quant(quant);
}
