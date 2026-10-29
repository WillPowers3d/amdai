import { bestQuant, calculatorShareUrl, cite, DEFAULT_BACKEND, isPublicQuant, listPublicQuants, planFit, SITE } from './api-fit.js';

function textResult(obj) {
  return {
    content: [{ type: 'text', text: JSON.stringify(obj, null, 2) }],
    structuredContent: obj,
  };
}

function gpuByToken(catalog, raw) {
  const token = String(raw ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
  const gpus = catalog.gpus?.gpus ?? [];
  if (!token) return gpus.find((row) => row.id === 'r9700') ?? gpus[0];
  return (
    gpus.find((row) => row.id.replace(/[^a-z0-9]/g, '') === token) ||
    gpus.find((row) => row.name.toLowerCase().replace(/[^a-z0-9]+/g, '').includes(token)) ||
    gpus.find((row) => row.id === 'r9700') ||
    gpus[0]
  );
}

function modelByToken(catalog, raw, { includeOlder = false } = {}) {
  const token = String(raw ?? '').toLowerCase();
  let models = catalog.models?.models ?? [];
  if (!includeOlder) models = models.filter((row) => !row.older);
  if (!token) return models.find((row) => row.id === 'qwen36') ?? models[0];
  return (
    models.find((row) => row.id === token) ||
    models.find((row) => row.name.toLowerCase().includes(token)) ||
    (catalog.models?.models ?? []).find((row) => row.id === token) ||
    models[0]
  );
}

export const TOOL_DEFS = [
  {
    name: 'list_quants',
    description: 'List Q4+ GGUF quants AMDai covers for a model. Qwen 35B default. Quants below Q4 are omitted.',
    inputSchema: {
      type: 'object',
      properties: {
        model: { type: 'string', description: 'Model id such as qwen36 or flash' },
        include_older: { type: 'boolean', description: 'Allow older catalog families' },
      },
    },
  },
  {
    name: 'plan_fit',
    description: 'Estimate whether a Q4+ quant fits a Radeon VRAM budget. Returns an amdai.net calculator share URL.',
    inputSchema: {
      type: 'object',
      properties: {
        model: { type: 'string' },
        quant: { type: 'string' },
        gpu: { type: 'string' },
        vram_gb: { type: 'number' },
        ram_gb: { type: 'number' },
        context: { type: 'number' },
      },
    },
  },
  {
    name: 'best_quant',
    description: 'Pick the highest Q4+ quant that fits. llama.cpp default. Includes a calculator share URL.',
    inputSchema: {
      type: 'object',
      properties: {
        model: { type: 'string' },
        gpu: { type: 'string' },
        vram_gb: { type: 'number' },
        ram_gb: { type: 'number' },
        context: { type: 'number' },
      },
    },
  },
  {
    name: 'radeon_measured',
    description: 'Measured lab-log runs from amdai.net. Optional GPU or text filter.',
    inputSchema: {
      type: 'object',
      properties: {
        gpu: { type: 'string' },
        query: { type: 'string' },
        limit: { type: 'number' },
      },
    },
  },
  {
    name: 'recommend_stack',
    description: 'Recommend a site stack: model, Q4+ quant, llama.cpp, and launch command for given GPUs/VRAM/RAM/goal.',
    inputSchema: {
      type: 'object',
      properties: {
        gpus: { type: 'array', items: { type: 'string' } },
        gpu: { type: 'string' },
        vram_gb: { type: 'number' },
        ram_gb: { type: 'number' },
        goal: { type: 'string', description: 'daily, agent, or serve' },
      },
    },
  },
  {
    name: 'compare_gpus',
    description: 'Compare two or more Radeon cards from the AMDai GPU directory (VRAM, bandwidth, dated prices).',
    inputSchema: {
      type: 'object',
      properties: {
        gpus: { type: 'array', items: { type: 'string' }, minItems: 2 },
      },
      required: ['gpus'],
    },
  },
  {
    name: 'gpu_prices',
    description: 'Dated street prices with source and affiliate buy links. Not live quotes.',
    inputSchema: {
      type: 'object',
      properties: {
        gpu: { type: 'string' },
      },
    },
  },
  {
    name: 'rocm_issue_lookup',
    description: 'Search the AMDai ROCm problem tracker by error text.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
      },
      required: ['query'],
    },
  },
  {
    name: 'list_models',
    description: 'List models AMDai covers. Qwen first. Older families behind include_older.',
    inputSchema: {
      type: 'object',
      properties: {
        include_older: { type: 'boolean' },
        query: { type: 'string' },
      },
    },
  },
];

export function callTool(name, args = {}, catalog) {
  switch (name) {
    case 'list_quants':
      return listQuantsTool(args, catalog);
    case 'plan_fit':
      return planFitTool(args, catalog);
    case 'best_quant':
      return bestQuantTool(args, catalog);
    case 'radeon_measured':
      return measuredTool(args, catalog);
    case 'recommend_stack':
      return recommendStackTool(args, catalog);
    case 'compare_gpus':
      return compareGpusTool(args, catalog);
    case 'gpu_prices':
      return gpuPricesTool(args, catalog);
    case 'rocm_issue_lookup':
      return rocmLookupTool(args, catalog);
    case 'list_models':
      return listModelsTool(args, catalog);
    default:
      throw new Error(`unknown tool ${name}`);
  }
}

function listQuantsTool(args, catalog) {
  const model = modelByToken(catalog, args.model, { includeOlder: Boolean(args.include_older) });
  const quants = listPublicQuants(model);
  return textResult({
    model: model?.id,
    name: model?.name,
    quants,
    backend: DEFAULT_BACKEND,
    source_url: model?.href || cite('/quants'),
  });
}

function planFitTool(args, catalog) {
  const model = modelByToken(catalog, args.model);
  const gpu = gpuByToken(catalog, args.gpu);
  const vram = Number(args.vram_gb) || gpu?.vram_gb || 32;
  const wanted = String(args.quant ?? model?.default_quant ?? 'q4_k_m');
  const quant = listPublicQuants(model).find((row) => row.id === wanted || row.label.toLowerCase() === wanted.toLowerCase()) ?? {
    id: 'q4_k_m',
    label: 'Q4_K_M',
    bpw: 4.85,
  };
  const plan = planFit({
    model,
    quant,
    vramGb: vram,
    context: Number(args.context) || model?.default_ctx || 4096,
    ramGb: Number(args.ram_gb) || 64,
  });
  const calculator = calculatorShareUrl({
    gpu: gpu?.id,
    vram,
    ram: args.ram_gb ?? 256,
    model: model?.id,
    quant: plan.quant.id,
    ctx: plan.context,
  });
  return textResult({
    ...plan,
    gpu: gpu?.id,
    model: model?.id,
    backend: DEFAULT_BACKEND,
    calculator,
    source_url: calculator,
  });
}

function bestQuantTool(args, catalog) {
  const model = modelByToken(catalog, args.model);
  const gpu = gpuByToken(catalog, args.gpu);
  const vram = Number(args.vram_gb) || gpu?.vram_gb || 32;
  const plan = bestQuant({
    model,
    vramGb: vram,
    context: Number(args.context) || model?.default_ctx || 4096,
    ramGb: Number(args.ram_gb) || 64,
  });
  const calculator = calculatorShareUrl({
    gpu: gpu?.id,
    vram,
    ram: args.ram_gb ?? 256,
    model: model?.id,
    quant: plan.quant.id,
    ctx: plan.context,
  });
  return textResult({
    ...plan,
    gpu: gpu?.id,
    model: model?.id,
    backend: DEFAULT_BACKEND,
    calculator,
    source_url: calculator,
  });
}

function measuredTool(args, catalog) {
  const query = String(args.query ?? args.gpu ?? '').toLowerCase();
  const limit = Math.min(20, Math.max(1, Number(args.limit) || 8));
  const runs = (catalog.measured?.runs ?? []).filter((row) => {
    if (!query) return true;
    const blob = `${row.title} ${row.summary} ${JSON.stringify(row.setup ?? {})}`.toLowerCase();
    return blob.includes(query);
  });
  return textResult({
    source_url: cite('/lab-log/'),
    runs: runs.slice(0, limit),
  });
}

function recommendStackTool(args, catalog) {
  const token = args.gpu || (Array.isArray(args.gpus) ? args.gpus[0] : undefined);
  const gpu = gpuByToken(catalog, token);
  const vram = Number(args.vram_gb) || gpu?.vram_gb || 32;
  const ram = Number(args.ram_gb) || 256;
  const goal = String(args.goal ?? 'daily').toLowerCase();
  const stacks = catalog.stacks?.stacks ?? [];
  let stack = stacks.find((row) => row.id === 'daily-driver') ?? stacks[0];
  let modelId = 'qwen36';
  if (/agent|flash|fast/.test(goal) && vram >= 32 && ram >= 64) {
    stack = stacks.find((row) => row.id === 'fast-agent') ?? stack;
    modelId = 'flash';
  } else if (/vllm|serv|batch/.test(goal)) {
    stack = stacks.find((row) => row.id === 'vllm-try') ?? stack;
  }
  const model = modelByToken(catalog, modelId, { includeOlder: true });
  const plan = bestQuant({ model, vramGb: vram, context: Number(stack?.context) || 4096, ramGb: ram });
  const launch = stack?.launch?.lines?.join('\n') || 'Compile llama.cpp with Vulkan and serve on 127.0.0.1:8080.';
  const calculator = calculatorShareUrl({
    gpu: gpu?.id,
    vram,
    ram,
    model: model?.id,
    quant: plan.quant.id,
    ctx: plan.context,
  });
  const gpuCount = Array.isArray(args.gpus) ? Math.max(1, args.gpus.length) : 1;
  const offload = modelId === 'flash' || plan.verdict === 'no' || /agent|flash/.test(goal);
  const dualPsu = gpuCount >= 2;
  return textResult({
    stack_id: stack?.id,
    title: stack?.title,
    model: stack?.model ?? model?.name,
    quant: plan.quant.label,
    backend: DEFAULT_BACKEND,
    launch,
    calculator,
    verdict: plan.verdict,
    source_url: cite('/stacks/'),
    note: 'llama.cpp is the default backend recommendation. Quants below Q4 are omitted.',
    ram: {
      kit_gb: offload || ram >= 192 ? [192, 256] : 32,
      title: offload || ram >= 192 ? 'G.SKILL Flare X5 192 GB or Trident Z5 Neo 256 GB' : 'G.SKILL Flare X5 32 GB (2x16) DDR5-6000 CL30',
    },
    cpu: {
      title: offload ? 'AMD Ryzen 9 9900X' : 'AMD Ryzen 5 9600X',
      why: offload
        ? 'DDR5 expert offload: two chiplets. Fabric GB/s figures are theoretical spec numbers, not measurements.'
        : 'The model fits in VRAM. The 9600X is enough. Any Ryzen 9000 has 24 usable PCIe 5.0 lanes.',
    },
    psu: {
      watts: dualPsu ? 1200 : 850,
      title: dualPsu ? 'Thermaltake Toughpower GT 1200W' : 'Corsair RM850x (2024, ATX 3.1)',
      why: dualPsu
        ? 'Two cards need 1200 W or more with two native 12V-2x6 cables. Two cards plus a 9950X can reach about 1,100 W. AMD lists 300 W TBP per R9700.'
        : 'One card: about 850 W with one native 12V-2x6. AMD lists 300 W TBP and a 750 W minimum PSU.',
    },
    storage: {
      tb: offload || ram >= 192 ? 4 : 2,
      gen: 4,
      title: offload || ram >= 192 ? 'Samsung 990 PRO 4TB (MZ-V9P4T0BW)' : 'Samsung 990 PRO 2TB (MZ-V9P2T0BW)',
      go: offload || ram >= 192 ? '/go/newegg/mz-v9p4t0bw' : '/go/newegg/mz-v9p2t0bw',
      why:
        offload || ram >= 192
          ? '4 TB when larger models later or a fourth Flash-class family is in the plan. Gen4 TLC with DRAM. Datasheet 7,450 MB/s, 2,400 TBW.'
          : '2 TB holds every Q4–Q6 of Qwen3.6-35B, Qwen3.8-Flash-Next and GLM-5.3-Flash with headroom. Gen4 TLC with DRAM. Datasheet 7,450 MB/s, 1,200 TBW.',
    },
    parts: {
      answers: {
        gpus: gpuCount,
        later_big: offload || ram >= 192,
        offload: offload || ram >= 192 ? 'yes' : 'no',
        min_budget: false,
        expand_gpu: dualPsu,
        cold_load: false,
      },
      warnings: [],
      items: [
        { role: 'GPU', part: `AMD Radeon AI PRO R9700 32GB x${gpuCount}`, go: '/go/newegg/r9700' },
        { role: 'Motherboard', part: 'ASRock X870 Taichi Creator', go: '/go/newegg/asrock-x870-taichi-creator' },
        {
          role: 'CPU',
          part: offload ? 'AMD Ryzen 9 9900X' : 'AMD Ryzen 5 9600X',
          go: offload ? '/go/newegg/ryzen-9-9900x' : '/go/newegg/amd-ryzen-5-9600x',
        },
        {
          role: 'RAM',
          part: offload || ram >= 192 ? 'G.SKILL Trident Z5 Neo 256 GB (4x64) DDR5-6000' : 'G.SKILL Flare X5 32 GB (2x16) DDR5-6000 CL30',
          go: offload || ram >= 192 ? '/go/newegg/f5-6000j3644d64gx4-tz5nr' : '/go/newegg/f5-6000j3038f16gx2-fx5',
        },
        {
          role: 'PSU',
          part: dualPsu ? 'Thermaltake Toughpower GT 1200W' : 'Corsair RM850x (2024, ATX 3.1)',
          go: dualPsu ? '/go/newegg/ps-tpt-1200fnfagu-3' : '/go/newegg/cp-9020270-na',
        },
        {
          role: 'Storage',
          part: offload || ram >= 192 ? 'Samsung 990 PRO 4TB (MZ-V9P4T0BW)' : 'Samsung 990 PRO 2TB (MZ-V9P2T0BW)',
          go: offload || ram >= 192 ? '/go/newegg/mz-v9p4t0bw' : '/go/newegg/mz-v9p2t0bw',
        },
      ],
    },
  });
}

function compareGpusTool(args, catalog) {
  const ids = Array.isArray(args.gpus) ? args.gpus : [];
  const gpus = ids.map((id) => gpuByToken(catalog, id)).filter(Boolean);
  return textResult({
    source_url: cite('/compare/gpus/'),
    gpus: gpus.map((gpu) => ({
      id: gpu.id,
      name: gpu.name,
      vram_gb: gpu.vram_gb,
      bandwidth_gbs: gpu.bandwidth_gbs,
      href: gpu.href,
      prices: gpu.prices,
    })),
  });
}

function gpuPricesTool(args, catalog) {
  const all = catalog.gpus?.gpus ?? [];
  const gpus = args.gpu ? [gpuByToken(catalog, args.gpu)].filter(Boolean) : all.filter((row) => row.prices?.length);
  return textResult({
    source_url: cite('/gpus/'),
    disclosure:
      'Dated snapshot, not a live quote. Buy links that say Check price may be affiliate links. A commission does not change the price you pay.',
    gpus: gpus.map((gpu) => ({
      id: gpu.id,
      name: gpu.name,
      href: gpu.href,
      prices: (gpu.prices ?? []).map((price) => ({
        ...price,
        affiliate_note: price.buy?.affiliate
          ? `Affiliate link (${price.buy.label}), dated ${price.date}.`
          : `Dated ${price.date}.`,
      })),
      buy: gpu.buy,
    })),
  });
}

function rocmLookupTool(args, catalog) {
  const needle = String(args.query ?? '').toLowerCase();
  const parts = needle.split(/\s+/).filter((part) => part.length > 2);
  const issues = (catalog['rocm-issues']?.issues ?? []).filter((row) => {
    const blob = [row.id, row.title, row.summary, row.impact, row.workaround, ...(row.affected_gpus ?? []), ...(row.affected_gfx ?? [])]
      .join(' ')
      .toLowerCase();
    return parts.length ? parts.every((part) => blob.includes(part)) : blob.includes(needle);
  });
  return textResult({
    source_url: cite('/rocm-problems/'),
    query: args.query,
    issues,
  });
}

function listModelsTool(args, catalog) {
  const includeOlder = Boolean(args.include_older);
  const query = String(args.query ?? '').toLowerCase();
  let models = catalog.models?.models ?? [];
  if (!includeOlder) models = models.filter((row) => !row.older);
  if (query) models = models.filter((row) => `${row.id} ${row.name} ${row.official}`.toLowerCase().includes(query));
  return textResult({
    source_url: cite('/models/'),
    include_older: includeOlder,
    models: models.map((row) => ({
      id: row.id,
      name: row.name,
      older: row.older,
      official: row.official,
      href: row.href,
      default_quant: row.default_quant,
    })),
  });
}

export { isPublicQuant, SITE };
