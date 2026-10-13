/**
 * Shopper RAM lines. Same two labels on every RAM-offload surface.
 * GB matches hardware labels (Linux GiB printed as GB). No invented tok/s.
 */

export const RAM_MIN_LABEL = 'Minimum system RAM needed';
export const RAM_FULL_LABEL = 'RAM needed at full context';

/** Pages that talk about RAM offload or system RAM and must show both labels. */
export const RAM_OFFLOAD_SURFACES = [
  '/gpus/r9700',
  '/gpus/rx7900xtx',
  '/gpus/rx7900xt',
  '/gpus/rx7800xt',
  '/multi-gpu',
  '/compare',
  '/compare/one-vs-two-gpu',
  '/compare/q4-q5-q6',
  '/compare/radeon-vs-nvidia',
  '/calculator',
  '/budget',
  '/qwen',
  '/qwen36-dual',
  '/flash-daily',
  '/flash-ram-offload',
  '/backends',
  '/backends/llamacpp',
  '/backends/strata',
  '/setup',
  '/benchmarks',
  '/stacks',
  '/harnesses/hermes',
] as const;

export function isRamOffloadSurface(path: string): boolean {
  if ((RAM_OFFLOAD_SURFACES as readonly string[]).includes(path)) return true;
  return path.startsWith('/recipes/');
}

export function missingRamLabels(html: string): string[] {
  const missing: string[] = [];
  if (!html.includes(RAM_MIN_LABEL)) missing.push(RAM_MIN_LABEL);
  if (!html.includes(RAM_FULL_LABEL)) missing.push(RAM_FULL_LABEL);
  return missing;
}

export function assertRamSurfacesValid(): string[] {
  const errors: string[] = [];
  if (RAM_MIN_LABEL !== 'Minimum system RAM needed') errors.push('min label drifted');
  if (RAM_FULL_LABEL !== 'RAM needed at full context') errors.push('full label drifted');
  if (RAM_OFFLOAD_SURFACES.length < 10) errors.push('surface list too short');
  if (!RAM_OFFLOAD_SURFACES.includes('/gpus/r9700')) errors.push('missing /gpus/r9700');
  if (!RAM_OFFLOAD_SURFACES.includes('/gpus/rx7900xtx')) errors.push('missing /gpus/rx7900xtx');
  if (!RAM_OFFLOAD_SURFACES.includes('/gpus/rx7900xt')) errors.push('missing /gpus/rx7900xt');
  if (!RAM_OFFLOAD_SURFACES.includes('/gpus/rx7800xt')) errors.push('missing /gpus/rx7800xt');
  if (!RAM_OFFLOAD_SURFACES.includes('/compare/radeon-vs-nvidia')) errors.push('missing /compare/radeon-vs-nvidia');
  if (!RAM_OFFLOAD_SURFACES.includes('/calculator')) errors.push('missing /calculator');
  if (!isRamOffloadSurface('/recipes/qwen36-35b.llamacpp-vulkan.262k')) {
    errors.push('recipe pages must be RAM surfaces');
  }
  if (isRamOffloadSurface('/about')) errors.push('about is not a RAM-offload surface');
  return errors;
}
