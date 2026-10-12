import { GPU_PRESETS, MODEL_PRESETS, QUANTS, queryToInput, type QuantId } from './calculator';
import { assertQuantAllowed } from './quant-guard';
import type { Priority } from './priority';
import type { Style, Usage } from './ask';
import type { RigModel } from './rig-match';

function parseAskLite(search: string): { priority: Priority; usage: Usage; style: Style } {
  const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  return {
    priority: q.get('priority') === 'size' ? 'size' : 'speed',
    usage: q.get('usage') === 'hybrid' ? 'hybrid' : 'local',
    style: q.get('style') === 'abliterated' ? 'abliterated' : 'standard',
  };
}

export type RigDraft = {
  name: string;
  gpu: string;
  gpuCount: number;
  vramGb: number;
  ramGb: number;
  gfx: string;
  cpu: string;
  os: string;
  distro: string;
  rocmVersion: string;
  backend: string;
  backendVersion: string;
  models: RigModel[];
  context: number;
  priority: Priority;
  usage: Usage;
  style: Style;
  shareQuery: string;
};

const TIER_DEFAULTS: Record<string, { gpu: string; vramGb: number; gpuCount: number; ramGb: number; gfx: string }> = {
  starter: { gpu: 'Radeon RX 9070 XT', vramGb: 16, gpuCount: 1, ramGb: 64, gfx: 'gfx1201' },
  mid: { gpu: 'Radeon RX 7900 XTX', vramGb: 24, gpuCount: 1, ramGb: 64, gfx: 'gfx1100' },
  enthusiast: { gpu: 'Radeon AI PRO R9700', vramGb: 32, gpuCount: 1, ramGb: 64, gfx: 'gfx1201' },
  pro: { gpu: 'Radeon AI PRO R9700', vramGb: 32, gpuCount: 2, ramGb: 256, gfx: 'gfx1201' },
};

function quantLabel(id: QuantId): string {
  return QUANTS.find((q) => q.id === id)?.label ?? id;
}

export function shareToRigDraft(search: string, source: 'calculator' | 'budget' = 'calculator'): RigDraft {
  const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const ask = parseAskLite(search);

  if (source === 'budget' && q.has('tier')) {
    const tier = q.get('tier') ?? 'enthusiast';
    const defaults = TIER_DEFAULTS[tier] ?? TIER_DEFAULTS.enthusiast;
    return {
      name: `${defaults.gpu} · ${tier}`,
      gpu: defaults.gpu,
      gpuCount: defaults.gpuCount,
      vramGb: defaults.vramGb,
      ramGb: defaults.ramGb,
      gfx: defaults.gfx,
      cpu: '',
      os: '',
      distro: '',
      rocmVersion: '',
      backend: 'llama.cpp',
      backendVersion: '',
      models: [{ name: 'Qwen3.6-35B-A3B', quant: 'Q5_K_M / UD-Q5_K_XL' }],
      context: 262144,
      priority: ask.priority,
      usage: ask.usage,
      style: ask.style,
      shareQuery: q.toString(),
    };
  }

  const input = queryToInput(search);
  const gpu = GPU_PRESETS.find((g) => g.id === input.gpuId);
  const model = MODEL_PRESETS.find((m) => m.id === input.modelId);
  const quant = quantLabel(input.quantId);
  assertQuantAllowed(quant);

  return {
    name: `${gpu?.name ?? 'Custom GPU'} · ${model?.name ?? 'custom'}`,
    gpu: gpu?.name ?? 'Custom',
    gpuCount: input.gpuCount,
    vramGb: input.vramGb,
    ramGb: input.ramGb,
    gfx: gpu?.gfx ?? '',
    cpu: '',
    os: '',
    distro: '',
    rocmVersion: '',
    backend: 'llama.cpp',
    backendVersion: '',
    models: [{ name: model?.name ?? 'Custom', quant }],
    context: input.context,
    priority: ask.priority,
    usage: ask.usage,
    style: ask.style,
    shareQuery: q.toString(),
  };
}
