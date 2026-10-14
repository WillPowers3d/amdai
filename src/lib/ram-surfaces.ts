/**
 * Shopper RAM lines. Same two labels on every RAM-offload surface.
 * GB matches hardware labels (Linux GiB printed as GB). No invented tok/s.
 */

export const RAM_MIN_LABEL = 'Minimum system RAM needed';
export const RAM_FULL_LABEL = 'RAM needed at full context';

/** Pages that talk about RAM offload or system RAM and must show both labels. */
export const RAM_OFFLOAD_SURFACES = [
  '/gpus/r9700',
  '/gpus/strix-halo',
  '/gpus/rx-7900-xtx',
  '/gpus/rx-7900-xt',
  '/gpus/rx-7800-xt',
  '/gpus/rx-9070-xt',
  '/gpus/rx-9060-xt',
  '/gpus/rx-7900-gre',
  '/gpus/rx-7700-xt',
  '/gpus/rx-7600-xt',
  '/gpus/rx-7600',
  '/gpus/rx-6800-xt',
  '/gpus/rx-6700-xt',
  '/gpus/w7900',
  '/gpus/w7800',
  '/gpus/w7700',
  '/gpus/w6800',
  '/multi-gpu',
  '/compare',
  '/compare/gpus',
  '/compare/models',
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
  '/setup/windows',
  '/image-gen',
  '/speech',
  '/long-context',
  '/rag',
  '/vision',
  '/power',
  '/fine-tuning',
  '/benchmarks',
  '/stacks',
  '/harnesses/hermes',
  '/models/qwen36',
  '/models/flash',
  '/models/gpt-oss-20b',
  '/models/gemma3-27b',
  '/models/llama33-70b',
  '/models/glm-53-flash',
  '/models/qwen36-27b',
  '/models/qwen38-27b',
] as const;

export function isRamOffloadSurface(path: string): boolean {
  if ((RAM_OFFLOAD_SURFACES as readonly string[]).includes(path)) return true;
  if (path.startsWith('/recipes/')) return true;
  return path.startsWith('/compare/') && path.includes('-vs-');
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
  if (!RAM_OFFLOAD_SURFACES.includes('/gpus/rx-7900-xtx')) errors.push('missing /gpus/rx-7900-xtx');
  if (!RAM_OFFLOAD_SURFACES.includes('/gpus/rx-7900-xt')) errors.push('missing /gpus/rx-7900-xt');
  if (!RAM_OFFLOAD_SURFACES.includes('/gpus/rx-7800-xt')) errors.push('missing /gpus/rx-7800-xt');
  if (!RAM_OFFLOAD_SURFACES.includes('/gpus/rx-9070-xt')) errors.push('missing /gpus/rx-9070-xt');
  if (!RAM_OFFLOAD_SURFACES.includes('/gpus/rx-9060-xt')) errors.push('missing /gpus/rx-9060-xt');
  if (!RAM_OFFLOAD_SURFACES.includes('/gpus/rx-7900-gre')) errors.push('missing /gpus/rx-7900-gre');
  if (!RAM_OFFLOAD_SURFACES.includes('/gpus/rx-7700-xt')) errors.push('missing /gpus/rx-7700-xt');
  if (!RAM_OFFLOAD_SURFACES.includes('/gpus/rx-7600-xt')) errors.push('missing /gpus/rx-7600-xt');
  if (!RAM_OFFLOAD_SURFACES.includes('/gpus/rx-7600')) errors.push('missing /gpus/rx-7600');
  if (!RAM_OFFLOAD_SURFACES.includes('/gpus/rx-6800-xt')) errors.push('missing /gpus/rx-6800-xt');
  if (!RAM_OFFLOAD_SURFACES.includes('/gpus/rx-6700-xt')) errors.push('missing /gpus/rx-6700-xt');
  if (!RAM_OFFLOAD_SURFACES.includes('/gpus/w7900')) errors.push('missing /gpus/w7900');
  if (!RAM_OFFLOAD_SURFACES.includes('/gpus/w7800')) errors.push('missing /gpus/w7800');
  if (!RAM_OFFLOAD_SURFACES.includes('/gpus/w7700')) errors.push('missing /gpus/w7700');
  if (!RAM_OFFLOAD_SURFACES.includes('/gpus/w6800')) errors.push('missing /gpus/w6800');
  if (!RAM_OFFLOAD_SURFACES.includes('/compare/radeon-vs-nvidia')) errors.push('missing /compare/radeon-vs-nvidia');
  if (!RAM_OFFLOAD_SURFACES.includes('/compare/gpus')) errors.push('missing /compare/gpus');
  if (!RAM_OFFLOAD_SURFACES.includes('/compare/models')) errors.push('missing /compare/models');
  if (!isRamOffloadSurface('/compare/models/qwen36-vs-glm-53-flash')) errors.push('model pair pages must be RAM surfaces');
  if (!isRamOffloadSurface('/compare/r9700-vs-rx-9070-xt')) errors.push('pair pages must be RAM surfaces');
  if (!RAM_OFFLOAD_SURFACES.includes('/models/qwen36')) errors.push('missing /models/qwen36');
  if (!RAM_OFFLOAD_SURFACES.includes('/models/flash')) errors.push('missing /models/flash');
  if (!RAM_OFFLOAD_SURFACES.includes('/models/gpt-oss-20b')) errors.push('missing /models/gpt-oss-20b');
  if (!RAM_OFFLOAD_SURFACES.includes('/models/gemma3-27b')) errors.push('missing /models/gemma3-27b');
  if (!RAM_OFFLOAD_SURFACES.includes('/models/llama33-70b')) errors.push('missing /models/llama33-70b');
  if (!RAM_OFFLOAD_SURFACES.includes('/models/glm-53-flash')) errors.push('missing /models/glm-53-flash');
  if (!RAM_OFFLOAD_SURFACES.includes('/models/qwen36-27b')) errors.push('missing /models/qwen36-27b');
  if (!RAM_OFFLOAD_SURFACES.includes('/models/qwen38-27b')) errors.push('missing /models/qwen38-27b');
  if (!RAM_OFFLOAD_SURFACES.includes('/calculator')) errors.push('missing /calculator');
  if (!RAM_OFFLOAD_SURFACES.includes('/image-gen')) errors.push('missing /image-gen');
  if (!RAM_OFFLOAD_SURFACES.includes('/speech')) errors.push('missing /speech');
  if (!RAM_OFFLOAD_SURFACES.includes('/long-context')) errors.push('missing /long-context');
  if (!RAM_OFFLOAD_SURFACES.includes('/rag')) errors.push('missing /rag');
  if (!RAM_OFFLOAD_SURFACES.includes('/vision')) errors.push('missing /vision');
  if (!RAM_OFFLOAD_SURFACES.includes('/power')) errors.push('missing /power');
  if (!RAM_OFFLOAD_SURFACES.includes('/fine-tuning')) errors.push('missing /fine-tuning');
  if (!isRamOffloadSurface('/recipes/qwen36-35b.llamacpp-vulkan.262k')) {
    errors.push('recipe pages must be RAM surfaces');
  }
  if (isRamOffloadSurface('/about')) errors.push('about is not a RAM-offload surface');
  return errors;
}
