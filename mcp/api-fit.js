/**
 * Compact GGUF fit planner for the AMDai MCP server.
 * Q4 and up only. llama.cpp default. Estimates unless a publisher listing exists.
 */

export const SITE = 'https://amdai.net';
export const DEFAULT_BACKEND = 'llama.cpp';
const GIB = 1024 ** 3;
const DECIMAL_GB = 1e9;
const SUB_Q4 = /(?:^|[^a-z0-9])(?:ud-)?(?:iq[123]|q[123])(?:[_-]|$)/i;

const BPW = {
  q4_k_m: 4.85,
  q5_k_m: 5.69,
  q6_k: 6.56,
  q8_0: 8.5,
  bf16: 16,
};

export function isPublicQuant(quant) {
  const q = String(quant ?? '').trim();
  if (!q) return false;
  if (SUB_Q4.test(q)) return false;
  return /(?:^|[^a-z0-9])(?:ud-)?(?:iq[4-8]|q[4-8]|bf16|f16|fp16|fp8|awq)(?:[_-]|$)/i.test(q);
}

export function calculatorShareUrl({ gpu = 'r9700', vram, ram = 256, model = 'qwen36', quant = 'q5_k_m', ctx = 262144, n = 1 } = {}) {
  const q = isPublicQuant(quant) ? quant : 'q4_k_m';
  const params = new URLSearchParams({
    gpu,
    vram: String(vram ?? 32),
    n: String(n),
    split: '0',
    ram: String(ram),
    model,
    quant: q,
    ctx: String(ctx),
    kv: 'f16',
    be: 'llamacpp',
    path: 'vulkan',
  });
  return `${SITE}/calculator?${params.toString()}`;
}

export function listPublicQuants(model) {
  const rows = (model?.quants ?? []).filter((row) => isPublicQuant(row.id) || isPublicQuant(row.label));
  return rows.length ? rows : Object.entries(BPW).map(([id, bpw]) => ({ id, label: id.toUpperCase(), bpw }));
}

function weightsGiB(model, quant) {
  const row = listPublicQuants(model).find((item) => item.id === quant.id);
  if (row?.publisher_decimal_gb) return (row.publisher_decimal_gb * DECIMAL_GB) / GIB;
  const params = Number(model?.total_params_b) || 35;
  const bpw = Number(row?.bpw ?? quant.bpw ?? 4.85);
  return (params * 1e9 * (bpw / 8)) / GIB;
}

function kvGiB(model, context) {
  const layers = Number(model?.kv_layers) || 10;
  const heads = Number(model?.kv_heads) || 2;
  const dim = Number(model?.head_dim) || 256;
  return (layers * heads * dim * context * 2 * 2) / GIB;
}

export function planFit({ model, quant, vramGb, context = 4096, ramGb = 64 }) {
  const q = quant && isPublicQuant(quant.id || quant) ? quant : listPublicQuants(model).find((row) => row.id === 'q4_k_m') ?? { id: 'q4_k_m', label: 'Q4_K_M', bpw: 4.85 };
  const weights = weightsGiB(model, q);
  const kv = kvGiB(model, context);
  const overhead = 0.4 + 0.015 * (weights + kv);
  const total = weights + kv + overhead;
  const available = Number(vramGb) || 0;
  const spare = total * 1.05;
  let verdict = 'no';
  if (available > 0 && spare <= available) verdict = 'fits';
  else if (available > 0 && total <= available) verdict = 'tight';
  return {
    quant: q,
    weights_gib: Number(weights.toFixed(2)),
    kv_gib: Number(kv.toFixed(2)),
    overhead_gib: Number(overhead.toFixed(2)),
    total_gib: Number(total.toFixed(2)),
    vram_gb: available,
    ram_gb: ramGb,
    context,
    verdict,
    note: 'Estimate unless a publisher listing is attached. llama.cpp overhead floor is labeled, not measured.',
  };
}

export function bestQuant({ model, vramGb, context = 4096, ramGb = 64 }) {
  const ranked = listPublicQuants(model).slice().sort((a, b) => (b.bpw ?? 0) - (a.bpw ?? 0));
  for (const quant of ranked) {
    const plan = planFit({ model, quant, vramGb, context, ramGb });
    if (plan.verdict === 'fits' || plan.verdict === 'tight') return plan;
  }
  return planFit({ model, quant: ranked[ranked.length - 1], vramGb, context, ramGb });
}

export function cite(path) {
  if (!path) return `${SITE}/`;
  if (String(path).startsWith('http')) return path;
  return `${SITE}${path.startsWith('/') ? path : `/${path}`}`;
}
