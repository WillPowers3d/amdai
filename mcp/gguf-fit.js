// AMDai GGUF fit checker: reads only GGUF headers from Hugging Face with HTTP Range requests
// (HF allows browser CORS range reads), sums real tensor bytes by category, and estimates
// VRAM/DDR5 placement for N Radeon cards. Works in browsers and Node 18+ (global fetch).
// All placement math is an ESTIMATE; tensor byte counts are exact from the file headers.
const GiB = 2 ** 30;
const SZ = {0:1,1:1,2:2,3:2,4:4,5:4,6:4,7:1,10:8,11:8,12:8};
export async function listGGUF(repo, dir = '') {
  const r = await fetch(`https://huggingface.co/api/models/${repo}/tree/main${dir ? '/' + dir : ''}`);
  if (!r.ok) throw new Error(`HF tree ${r.status}`);
  const items = await r.json();
  return items.filter(f => f.type === 'file' && f.path.endsWith('.gguf'));
}
export async function listQuants(repo) {
  const r = await fetch(`https://huggingface.co/api/models/${repo}/tree/main`);
  const items = await r.json(); const q = new Set();
  for (const f of items) {
    if (f.type === 'directory') q.add(f.path + '/');
    else if (f.path.endsWith('.gguf') && !/mmproj|imatrix/i.test(f.path)) q.add(f.path.replace(/-\d{5}-of-\d{5}\.gguf$/, '.gguf'));
  }
  return [...q];
}
async function range(repo, path, n) {
  const r = await fetch(`https://huggingface.co/${repo}/resolve/main/${path}`, { headers: { Range: `bytes=0-${n - 1}` } });
  if (r.status !== 206 && r.status !== 200) throw new Error(`range ${r.status}`);
  return new Uint8Array(await r.arrayBuffer());
}
class Short extends Error {}
export function parseHeader(buf, fileSize) {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength); let p = 0; const td = new TextDecoder();
  const need = n => { if (p + n > buf.length) throw new Short(); };
  const u32 = () => { need(4); const v = dv.getUint32(p, true); p += 4; return v; };
  const u64 = () => { need(8); const v = Number(dv.getBigUint64(p, true)); p += 8; return v; };
  const str = () => { const n = u64(); need(n); const s = td.decode(buf.subarray(p, p + n)); p += n; return s; };
  const scalar = t => { need(SZ[t]); let v;
    switch (t) { case 0: v = dv.getUint8(p); break; case 1: v = dv.getInt8(p); break; case 2: v = dv.getUint16(p, true); break;
      case 3: v = dv.getInt16(p, true); break; case 4: v = dv.getUint32(p, true); break; case 5: v = dv.getInt32(p, true); break;
      case 6: v = dv.getFloat32(p, true); break; case 7: v = !!dv.getUint8(p); break; case 10: v = Number(dv.getBigUint64(p, true)); break;
      case 11: v = Number(dv.getBigInt64(p, true)); break; case 12: v = dv.getFloat64(p, true); break; }
    p += SZ[t]; return v; };
  const val = t => { if (t === 8) return str();
    if (t === 9) { const at = u32(), n = u64();
      if (at in SZ) { if (n <= 64) { const a = []; for (let i = 0; i < n; i++) a.push(scalar(at)); return a; } need(SZ[at] * n); p += SZ[at] * n; return { len: n }; }
      const a = []; for (let i = 0; i < n; i++) { const v = val(at); if (i < 4) a.push(v); } return a; }
    return scalar(t); };
  need(4); if (td.decode(buf.subarray(0, 4)) !== 'GGUF') throw new Error('not GGUF'); p = 4;
  u32(); const nt = u64(), nk = u64(); const kv = {};
  for (let i = 0; i < nk; i++) { const k = str(); kv[k] = val(u32()); }
  const ts = [];
  for (let i = 0; i < nt; i++) { const name = str(); const nd = u32(); const dims = []; for (let j = 0; j < nd; j++) dims.push(u64()); const type = u32(); const off = u64(); ts.push({ name, dims, type, off }); }
  const al = kv['general.alignment'] || 32; const dataStart = Math.ceil(p / al) * al;
  ts.sort((a, b) => a.off - b.off);
  ts.forEach((t, i) => { t.bytes = (i + 1 < ts.length ? ts[i + 1].off : fileSize - dataStart) - t.off; });
  return { kv, tensors: ts };
}
export function category(n) {
  if (/ple_|per_layer_token_embd|ngram/.test(n)) return 'ngram_table';
  if (/ffn_gate_inp/.test(n)) return 'router';
  if (/_exps/.test(n)) return 'routed_experts';
  if (/_shexp/.test(n)) return 'shared_expert';
  if (/^token_embd/.test(n)) return 'token_embedding';
  if (/^output/.test(n)) return 'lm_head';
  if (/mtp|nextn/.test(n)) return 'mtp_head';
  return 'dense_other';  // attention, SSM/DeltaNet, norms, dense FFN
}
export async function inspect(repo, quant, onProgress = () => {}) {
  let files;
  if (quant.endsWith('/')) files = await listGGUF(repo, quant.slice(0, -1));
  else { const all = await listGGUF(repo); const stem = quant.replace(/\.gguf$/, '');
    files = all.filter(f => f.path === quant || f.path.startsWith(stem + '-0')); }
  if (!files.length) throw new Error('no GGUF files for ' + quant);
  const cats = {}; let kv = {}; let layers = new Set(); const perLayerExp = {};
  for (const [i, f] of files.entries()) {
    let n = 4 << 20, h;
    for (;;) { const b = await range(repo, f.path, n);
      try { h = parseHeader(b, f.size); break; } catch (e) { if (!(e instanceof Short) || n > 512 << 20) throw e; n *= 2; } }
    if (i === 0 || !kv['general.architecture']) kv = { ...h.kv, ...kv };
    for (const t of h.tensors) { const c = category(t.name); cats[c] = (cats[c] || 0) + t.bytes;
      const m = t.name.match(/^blk\.(\d+)\./); if (m) { layers.add(+m[1]); if (c === 'routed_experts') perLayerExp[m[1]] = (perLayerExp[m[1]] || 0) + t.bytes; } }
    onProgress(i + 1, files.length);
  }
  return { repo, quant, files: files.map(f => f.path), fileBytes: files.reduce((s, f) => s + f.size, 0), kv, cats, perLayerExp };
}
// KV per token for standard attention layers. Hybrid models (DeltaNet/SSM) only cache every
// full_attention_interval-th layer; SSM state is small and folded into the compute reserve.
export function kvBytesPerToken(kv, kvBytes = 2) {
  const a = kv['general.architecture']; const g = k => kv[`${a}.${k}`];
  const L = g('block_count') || 0; const fai = g('full_attention_interval');
  const attnLayers = fai ? Math.ceil(L / fai) : L;
  let hkv = g('attention.head_count_kv'); if (Array.isArray(hkv)) hkv = Math.max(...hkv); hkv = hkv || g('attention.head_count') || 0;
  const emb = g('embedding_length'), hc = g('attention.head_count');
  const kl = g('attention.key_length') || (emb && hc ? emb / hc : 128), vl = g('attention.value_length') || kl;
  const mla = g('attention.kv_lora_rank');
  if (mla) return attnLayers * (mla + (g('rope.dimension_count') || 64)) * kvBytes;  // MLA latent cache
  return attnLayers * hkv * (kl + vl) * kvBytes;
}
export function plan(info, { gpus = 2, vramGiB = 32, ramGiB = 256, ctx = 262144, kvBytes = 2, reserveGiB = 2.5, osGiB = 12 } = {}) {
  const c = info.cats, a = info.kv['general.architecture'];
  const L = info.kv[`${a}.block_count`] || 1, maxCtx = info.kv[`${a}.context_length`];
  const exps = c.routed_experts || 0, cpuOnly = (c.ngram_table || 0) + (c.token_embedding || 0);
  const dense = Object.entries(c).filter(([k]) => !['routed_experts', 'ngram_table', 'token_embedding'].includes(k)).reduce((s, [, v]) => s + v, 0);
  const kvB = kvBytesPerToken(info.kv, kvBytes) * ctx;
  const free = gpus * (vramGiB - reserveGiB) * GiB - dense - kvB;
  const layersWithExp = Object.keys(info.perLayerExp).length || L; const perLayer = exps / layersWithExp;
  let gpuExpLayers = exps ? Math.max(0, Math.min(layersWithExp, Math.floor(free / perLayer))) : 0;
  const ncmoe = exps ? layersWithExp - gpuExpLayers : 0;
  const ramResident = cpuOnly + ncmoe * perLayer;
  const fitsVRAM = free >= exps;
  const ramNeeded = ramResident + osGiB * GiB;
  return { arch: a, maxCtx, ctx, gpus, vramGiB, totalGiB: info.fileBytes / GiB, expertsGiB: exps / GiB, denseGiB: dense / GiB,
    cpuOnlyGiB: cpuOnly / GiB, kvGiB: kvB / GiB, gpuExpLayers, ncmoe, layersWithExp,
    ramResidentGiB: ramResident / GiB, ramNeededGiB: ramNeeded / GiB, fitsAllInVRAM: fitsVRAM && free >= 0,
    verdict: free < 0 ? 'does-not-fit-dense' : fitsVRAM ? 'fits-in-vram' : (ramNeeded <= ramGiB * GiB ? 'fits-with-ddr5-offload' : 'needs-more-ram') };
}
