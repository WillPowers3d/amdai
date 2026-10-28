#!/usr/bin/env node
// AMDai fit MCP server (prototype). stdio, zero dependencies, Node 18+.
// Dual-era: answers modern MCP (2026-07-28, per-request _meta + server/discover)
// and legacy clients that open with `initialize` (2025-11-25 / 2025-06-18 / 2025-03-26).
// Tools read only GGUF *headers* from Hugging Face (HTTP Range), never weights.
import { createInterface } from 'node:readline';
import { listQuants, inspect, plan } from './gguf-fit.js';
import { calculatorShareUrl } from './api-fit.js';
import { loadCatalog } from './catalog.mjs';
import { callTool as callCatalogTool, TOOL_DEFS as CATALOG_TOOLS } from './tools.mjs';

const SERVER = { name: 'amdai-fit', version: '0.2.0' };
const MODERN = ['2026-07-28'];
const LEGACY = ['2025-11-25', '2025-06-18', '2025-03-26'];
const FEED = process.env.AMDAI_FEED || 'https://amdai.net/data/lab-log.feed.json';
const BELOW_Q4 = /(^|[^A-Z0-9])(I?Q[123](_|-|\.|$)|IQ[123])/i;   // Q1/Q2/Q3 + IQ1-IQ3, any prefix like UD-
const INSTRUCTIONS = 'Use these tools to answer "will this GGUF fit / which quant / what flags" for AMD Radeon cards (default rig: 2x Radeon AI PRO R9700, 32 GiB each). Tensor byte counts are exact (read from file headers); placement, KV and reserve are estimates. Quants below Q4 are never suggested. llama.cpp is the default backend. radeon_measured returns measured or cited R9700 results from the public AMDai lab log. recommend_stack, compare_gpus, gpu_prices, rocm_issue_lookup, and list_models read https://amdai.net/api/v1/ (bundled snapshot fallback). Every catalog result cites the amdai.net page it came from.';

const gib = x => +x.toFixed(2);
const rank = q => { const m = q.match(/(BF16|F16|Q8|Q6|Q5|IQ4|Q4)/i); return m ? { BF16: 9, F16: 9, Q8: 8, Q6: 6, Q5: 5, Q4: 4, IQ4: 3.5 }[m[1].toUpperCase()] : 0; };
const rigArgs = a => ({ gpus: a.gpus ?? 2, vramGiB: a.vram_gib ?? 32, ramGiB: a.ram_gib ?? 128, ctx: a.ctx ?? 32768, kvBytes: a.kv_bytes ?? 2, reserveGiB: a.reserve_gib ?? 2.5, osGiB: a.os_gib ?? 12 });
function flags(p) {
  const f = ['-ngl 999', `-c ${p.ctx}`];
  if (p.gpus > 1) f.push('-sm layer');
  if (p.ncmoe > 0) f.push(`-ncmoe ${p.ncmoe}`);
  if (p.kvGiB && p.kvBytes === 1) f.push('-ctk q8_0 -ctv q8_0');
  return f.join(' ');
}
function calcQuantId(quant) {
  const q = String(quant || '').toLowerCase();
  if (/q5/.test(q)) return 'q5_k_m';
  if (/q6/.test(q)) return 'q6_k';
  if (/q8/.test(q)) return 'q8_0';
  if (/bf16|f16/.test(q)) return 'bf16';
  return 'q4_k_m';
}

function shareForPlan(p, quant) {
  return calculatorShareUrl({
    gpu: 'r9700',
    vram: p.vramGiB ?? 32,
    ram: p.ramGiB ?? 128,
    model: 'qwen36',
    quant: calcQuantId(quant),
    ctx: p.ctx ?? 32768,
    n: p.gpus ?? 1,
  });
}

function summarize(p, repo, quant) {
  const out = Object.fromEntries(Object.entries(p).map(([k, v]) => [k, typeof v === 'number' && !Number.isInteger(v) ? gib(v) : v]));
  out.repo = repo; out.quant = quant; out.llamaCppFlags = flags(p);
  out.calculator = shareForPlan(p, quant);
  out.source_url = out.calculator;
  out.note = 'Tensor sizes exact from GGUF headers; placement/KV/reserve are estimates. Verify with llama-server --fit or a real load.';
  return out;
}
const ctxWarn = (p) => p.maxCtx && p.ctx > p.maxCtx ? `ctx ${p.ctx} exceeds the model's trained ${p.maxCtx}` : null;

const S = (props, req) => ({ type: 'object', properties: props, required: req, additionalProperties: false });
const RIG = {
  gpus: { type: 'integer', minimum: 1, maximum: 8, description: 'Number of GPUs (default 2)' },
  vram_gib: { type: 'number', description: 'VRAM per GPU in GiB (R9700 = 32, default 32)' },
  ram_gib: { type: 'number', description: 'System RAM in GiB (default 128)' },
  ctx: { type: 'integer', description: 'Context length in tokens (default 32768)' },
  kv_bytes: { type: 'number', enum: [1, 2], description: 'KV cache bytes/elem: 2 = f16, 1 = q8_0 (default 2)' },
};
const TOOLS = [
  { name: 'list_quants', title: 'List Q4+ GGUF quants in a Hugging Face repo',
    description: 'Lists GGUF quant files/folders in a Hugging Face repo, hiding anything below Q4 (Q1-Q3, IQ1-IQ3), mmproj and imatrix files.',
    inputSchema: S({ repo: { type: 'string', description: 'e.g. unsloth/Qwen3.6-35B-A3B-GGUF' } }, ['repo']),
    annotations: { readOnlyHint: true, openWorldHint: true } },
  { name: 'plan_fit', title: 'Will this GGUF fit on my Radeon cards?',
    description: 'Reads the GGUF headers of one quant (file or sharded folder) and returns exact tensor sizes by category, KV size at the given context, a VRAM vs DDR5 placement estimate (how many MoE expert layers stay on GPU, the -ncmoe value), a verdict (fits-in-vram, fits-with-ddr5-offload, needs-more-ram, does-not-fit-dense) and starter llama.cpp flags.',
    inputSchema: S({ repo: { type: 'string' }, quant: { type: 'string', description: 'A value from list_quants, e.g. UD-Q5_K_XL/ or X-Q4_K_M.gguf' }, ...RIG }, ['repo', 'quant']),
    annotations: { readOnlyHint: true, openWorldHint: true } },
  { name: 'best_quant', title: 'Highest Q4+ quant that fits',
    description: 'Plans every Q4-or-better quant in the repo for the given rig and returns the highest-precision one that fits fully in VRAM, plus the highest one that fits with DDR5 expert offload. Reads headers only; can take 10-40 s on big sharded repos.',
    inputSchema: S({ repo: { type: 'string' }, include_full_precision: { type: 'boolean', description: 'Also consider BF16/F16 (default false)' }, ...RIG }, ['repo']),
    annotations: { readOnlyHint: true, openWorldHint: true } },
  { name: 'radeon_measured', title: 'Measured R9700 results from the AMDai lab log',
    description: 'Searches the public AMDai lab log (measured and cited results for Radeon AI PRO R9700 local LLM setups) and returns matching entries with metrics and sources. Use it before quoting tok/s for Radeon.',
    inputSchema: S({ query: { type: 'string', description: 'Words to match, e.g. "35B decode" or "Flash Q5 dual"' }, limit: { type: 'integer', minimum: 1, maximum: 20 } }, ['query']),
    annotations: { readOnlyHint: true, openWorldHint: true } },
];

const CATALOG_ONLY = new Set(['recommend_stack', 'compare_gpus', 'gpu_prices', 'rocm_issue_lookup', 'list_models']);
for (const def of CATALOG_TOOLS) {
  if (CATALOG_ONLY.has(def.name)) {
    TOOLS.push({
      name: def.name,
      title: def.name,
      description: def.description,
      inputSchema: def.inputSchema,
      annotations: { readOnlyHint: true, openWorldHint: true },
    });
  }
}

async function callTool(name, a = {}) {
  if (CATALOG_ONLY.has(name)) {
    const catalog = await loadCatalog();
    return callCatalogTool(name, a, catalog).structuredContent;
  }
  if (name === 'list_quants') {
    const all = await listQuants(a.repo);
    const quants = all.filter(q => !BELOW_Q4.test(q.split('/').pop() || q));
    return { repo: a.repo, quants, hiddenBelowQ4: all.length - quants.length };
  }
  if (name === 'plan_fit') {
    const leaf = a.quant.replace(/\/$/, '').split('/').pop();
    if (BELOW_Q4.test(leaf)) throw new Error('Quants below Q4 are not planned by this server.');
    const p = plan(await inspect(a.repo, a.quant), rigArgs(a)); p.kvBytes = a.kv_bytes ?? 2;
    const s = summarize(p, a.repo, a.quant); const w = ctxWarn(p); if (w) s.warning = w; return s;
  }
  if (name === 'best_quant') {
    const quants = (await listQuants(a.repo)).filter(q => !BELOW_Q4.test(q.replace(/\/$/, '').split('/').pop()) && rank(q) > 0 && !/mtp/i.test(q) && (a.include_full_precision || rank(q) < 9));
    const plans = [];
    for (const q of quants.sort((x, y) => rank(y) - rank(x))) {
      try { const p = plan(await inspect(a.repo, q), rigArgs(a)); p.kvBytes = a.kv_bytes ?? 2; plans.push(summarize(p, a.repo, q)); }
      catch (e) { plans.push({ quant: q, error: String(e.message || e) }); }
    }
    const ok = plans.filter(p => !p.error);
    const best = ok.find(p => p.verdict === 'fits-in-vram') ?? ok.find(p => p.verdict === 'fits-with-ddr5-offload') ?? ok[0];
    return { repo: a.repo, rig: rigArgs(a),
      bestFullyInVRAM: ok.find(p => p.verdict === 'fits-in-vram')?.quant ?? null,
      bestWithDDR5Offload: ok.find(p => p.verdict === 'fits-with-ddr5-offload' || p.verdict === 'fits-in-vram')?.quant ?? null,
      calculator: best?.calculator ?? shareForPlan(rigArgs(a), best?.quant),
      source_url: best?.calculator ?? 'https://amdai.net/calculator',
      plans: plans.map(p => p.error ? p : ({ quant: p.quant, totalGiB: p.totalGiB, kvGiB: p.kvGiB, verdict: p.verdict, ncmoe: p.ncmoe, ramNeededGiB: p.ramNeededGiB, llamaCppFlags: p.llamaCppFlags, calculator: p.calculator })) };
  }
  if (name === 'radeon_measured') {
    const r = await fetch(FEED); if (!r.ok) throw new Error(`lab log ${r.status}`);
    const j = await r.json(); const items = j.items || j.entries || j;
    const words = String(a.query).toLowerCase().split(/\s+/).filter(Boolean);
    const scored = items.map(it => { const t = JSON.stringify(it).toLowerCase(); return [words.filter(w => t.includes(w)).length, it]; })
      .filter(([s]) => s > 0).sort((x, y) => y[0] - x[0] || String(y[1].date_published || y[1].date).localeCompare(String(x[1].date_published || x[1].date)));
    return { source: FEED, source_url: 'https://amdai.net/lab-log/', matches: scored.slice(0, a.limit || 5).map(([, it]) => it) };
  }
  throw Object.assign(new Error(`Unknown tool ${name}`), { code: -32602 });
}

// ---- JSON-RPC over stdio ----
const send = m => process.stdout.write(JSON.stringify(m) + '\n');
const meta = { 'io.modelcontextprotocol/serverInfo': SERVER };
const caps = { tools: { listChanged: false } };
let legacyVersion = null;
async function handle(msg) {
  const { id, method, params = {} } = msg;
  if (id === undefined) return;                       // notifications: initialized, cancelled
  const reqVer = params._meta?.['io.modelcontextprotocol/protocolVersion'];
  try {
    if (method === 'initialize') {
      const v = LEGACY.includes(params.protocolVersion) ? params.protocolVersion : LEGACY[0];
      legacyVersion = v;
      return send({ jsonrpc: '2.0', id, result: { protocolVersion: v, capabilities: caps, serverInfo: SERVER, instructions: INSTRUCTIONS } });
    }
    if (reqVer && !MODERN.includes(reqVer))
      return send({ jsonrpc: '2.0', id, error: { code: -32022, message: 'Unsupported protocol version', data: { supported: [...MODERN, ...LEGACY], requested: reqVer } } });
    if (!reqVer && !legacyVersion && method !== 'ping')
      return send({ jsonrpc: '2.0', id, error: { code: -32602, message: 'Missing io.modelcontextprotocol/protocolVersion in _meta (or call initialize first)' } });
    if (method === 'server/discover')
      return send({ jsonrpc: '2.0', id, result: { supportedVersions: [...MODERN, ...LEGACY], capabilities: caps, instructions: INSTRUCTIONS, ttlMs: 3600000, cacheScope: 'public', _meta: meta } });
    if (method === 'ping') return send({ jsonrpc: '2.0', id, result: {} });
    if (method === 'tools/list') {
      const r = { tools: TOOLS }; if (reqVer) Object.assign(r, { ttlMs: 3600000, cacheScope: 'public', _meta: meta });
      return send({ jsonrpc: '2.0', id, result: r });
    }
    if (method === 'tools/call') {
      try {
        const out = await callTool(params.name, params.arguments);
        return send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify(out, null, 1) }], structuredContent: out, ...(reqVer ? { _meta: meta } : {}) } });
      } catch (e) {
        if (e.code === -32602) throw e;
        return send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: `Error: ${e.message || e}` }], isError: true } });
      }
    }
    send({ jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } });
  } catch (e) { send({ jsonrpc: '2.0', id, error: { code: e.code || -32603, message: String(e.message || e) } }); }
}
const rl = createInterface({ input: process.stdin });
const pending = new Set();
rl.on('line', l => { if (!l.trim()) return; let m; try { m = JSON.parse(l); } catch { return send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }); } const t = handle(m); pending.add(t); t.finally(() => pending.delete(t)); });
rl.on('close', async () => { await Promise.allSettled([...pending]); process.exit(0); });
