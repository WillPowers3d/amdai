/**
 * House rule: never store or recommend a quant below Q4
 * (no Q1/Q2/Q3, no IQ1–IQ3).
 */

const FORBIDDEN = /\b(iq?[123](?:[_-]|$)|q[123](?:[_-]|$))/i;

export function isQuantAllowed(quant: string): boolean {
  const q = quant.trim();
  if (!q) return false;
  if (FORBIDDEN.test(q)) return false;
  const lower = q.toLowerCase();
  return (
    lower.includes('q4') ||
    lower.includes('q5') ||
    lower.includes('q6') ||
    lower.includes('q8') ||
    lower.includes('bf16') ||
    lower === 'f16' ||
    lower.includes('fp16')
  );
}

export function assertQuantAllowed(quant: string): string {
  const trimmed = quant.trim();
  if (!isQuantAllowed(trimmed)) {
    throw new Error(`Quant "${quant}" is below Q4 or not recognized. Floor is Q4.`);
  }
  return trimmed;
}
