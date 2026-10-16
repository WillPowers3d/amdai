#!/usr/bin/env node
/**
 * Pull recently created/updated open-weight text models from the public
 * Hugging Face Hub API (no key) and write public/data/new-models.json.
 *
 * Cron (VPS, refresh the deployed static file without a rebuild):
 *   NEW_MODELS_OUT=/var/www/amdai.net/data/new-models.json \
 *     node /opt/amdai/scripts/new-models-sync.mjs
 *
 * Defaults write public/data/new-models.json relative to the repo root.
 * Never invents rows. Skips Qwen2.5 / Qwen3-8B. Never lists Q1/Q2 GGUF.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_OUT = join(ROOT, 'public/data/new-models.json');
const CATALOG_OUT = join(ROOT, 'src/data/engine-arch.json');
const HF = 'https://huggingface.co';
const API = `${HF}/api/models`;
const SCHEMA = 'amdai-new-models/1';
const WINDOW_DAYS = 90;
const Q4_BPW = 4.85;
const OVERHEAD_GIB = 1.5;
const UA = 'AMDai-new-models/1 (+https://amdai.net/new-models)';
const LLAMA_CONVERT = 'https://raw.githubusercontent.com/ggml-org/llama.cpp/master/conversion/__init__.py';
const VLLM_REGISTRY =
  'https://raw.githubusercontent.com/vllm-project/vllm/master/vllm/model_executor/models/registry.py';
const OLLAMA_LIBRARY = 'https://ollama.com/library';
const SGLANG_MODELS = 'https://api.github.com/repos/sgl-project/sglang/contents/python/sglang/srt/models';
const STRATA_FLASH = /qwen3\.8[-_ ]?flash/i;
const PIPELINES = new Set(['text-generation', 'image-text-to-text']);
const PACKAGERS = ['unsloth', 'bartowski', 'lmstudio-community', 'ggml-org'];
const BANNED_NAME = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12][_-]|Q[12][_-])/i;
const SPAM_NAME =
  /(?:-lora\b|-gguf\b|gguf-|merge|franken|abliterated|uncensored|nsfw|erp\b|roleplay)/i;
const FORMAT_DUMP =
  /(?:-gguf\b|gguf-|-mlx(?:-|\b)|-exl3|-awq\b|-gptq\b|-bnb-4bit|-hqq\b|-onnx\b|-int4\b|-fp8\b|-nvfp4\b|-bf16\b|-mxfp4\b|-dflash|-dspark|-extensor|-w8a8|_rai_|_npu|llmcompressor|-lilicorr|-mopd|-fp4-local|-24gb\b)/i;

const KNOWN_ORG_LIST = [
  'Qwen',
  'meta-llama',
  'google',
  'google-deepmind',
  'microsoft',
  'mistralai',
  'openai',
  'deepseek-ai',
  'moonshotai',
  'zai-org',
  'THUDM',
  '01-ai',
  'HuggingFaceTB',
  'HuggingFaceH4',
  'HuggingFaceM4',
  'allenai',
  'bigcode',
  'tiiuae',
  'CohereForAI',
  'CohereLabs',
  'nvidia',
  'ibm-granite',
  'ibm',
  'apple',
  'amazon',
  'stabilityai',
  'black-forest-labs',
  'MiniMaxAI',
  'inclusionAI',
  'internlm',
  'OpenGVLab',
  'stepfun-ai',
  'baichuan-inc',
  'LiquidAI',
  'togethercomputer',
  'mosaicml',
  'databricks',
  'Salesforce',
  'facebook',
  'openbmb',
  'BAAI',
  'Tencent-Hunyuan',
  'tencent',
  'ByteDance-Seed',
  'Alibaba-NLP',
  'alibaba-nlp',
  'meituan-longcat',
  'Kwai-Kwaipilot',
  'xiaomi',
  'XiaomiMiMo',
  'TinyLlama',
  'HuggingFace',
  'bigscience',
  'EleutherAI',
  'state-spaces',
  'ai21labs',
  'Writer',
  'upstage',
  'LGAI-EXAONE',
  'kakaocorp',
  'naver-hyperclovax',
  'skt',
  'amd',
  'AMD-AGI',
  'JetBrains',
  'Aleph-Alpha',
  'reflection',
];

const KNOWN_ORGS = new Set(KNOWN_ORG_LIST.map((s) => s.toLowerCase()));

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function dayKey(value) {
  const raw = String(value ?? '').trim();
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1] ?? null;
}

function cutoffDay(now = new Date()) {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() - WINDOW_DAYS);
  return d.toISOString().slice(0, 10);
}

function authorOf(row) {
  if (row?.author) return String(row.author);
  return String(row?.id || '').split('/')[0] || '';
}

async function textGet(url, attempt = 0) {
  const res = await fetch(url, {
    headers: { Accept: 'text/plain, application/json, text/html;q=0.9', 'User-Agent': UA },
  });
  if (res.status === 429 && attempt < 5) {
    const wait = Number(res.headers.get('retry-after') || 0) * 1000 || 1500 * (attempt + 1);
    await sleep(wait);
    return textGet(url, attempt + 1);
  }
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

function parseArchKeys(text) {
  const keys = new Set();
  if (!text) return keys;
  for (const match of text.matchAll(/"([A-Za-z][A-Za-z0-9_\.]*)"/g)) {
    const key = match[1];
    if (
      /(?:ForCausalLM|ForConditionalGeneration|LMHeadModel|ForMaskedLM|ForSequenceClassification|ForTokenClassification|ForRewardModel|ForProcessRewardModel)$/.test(
        key,
      ) ||
      /^(?:GritLM|Cheers|ColQwen3|ColQwen3_5|HF_ColBERT|Terratorch|CLIPModel|SiglipModel|GteModel|GteNewModel|PrithviGeoSpatialMAE|NeoBERT|RND1)$/.test(
        key,
      )
    ) {
      keys.add(key);
    }
  }
  return keys;
}

function parseOllamaSlugs(html) {
  const slugs = new Set();
  if (!html) return slugs;
  for (const match of html.matchAll(/href="\/library\/([a-z0-9][a-z0-9._-]*)"/gi)) {
    slugs.add(match[1].toLowerCase());
  }
  for (const match of html.matchAll(/^\s*-\s+([a-z0-9][a-z0-9._-]*)\s*$/gim)) {
    slugs.add(match[1].toLowerCase());
  }
  slugs.delete('library');
  return slugs;
}

const SIZE_TOKEN = /^(?:\d+(?:\.\d+)?B|A\d)/i;
const STOP_TOKEN = /^(instruct|chat|it|base|next|flash|thinking|coder|vl|vision|moe)$/i;

function ollamaFamilyCandidates(id, name) {
  const base = (name || String(id).split('/').pop() || id).trim();
  if (!base) return [];
  const tokens = base.split(/[-_]/).filter(Boolean);
  if (!tokens.length) return [];
  const kept = [];
  for (const tok of tokens) {
    if (SIZE_TOKEN.test(tok) || STOP_TOKEN.test(tok)) break;
    kept.push(tok);
  }
  if (!kept.length) kept.push(tokens[0]);
  const compact = kept.join('').toLowerCase();
  const dashed = kept.join('-').toLowerCase();
  const first = tokens[0].toLowerCase();
  return [...new Set([dashed, compact, first].filter(Boolean))];
}

function ollamaFamilySlug(id, name) {
  return ollamaFamilyCandidates(id, name)[0] || null;
}

function archInList(architecture, list) {
  const arch = String(architecture || '').trim();
  if (!arch || !list?.size) return false;
  if (list.has(arch)) return true;
  const lower = arch.toLowerCase();
  for (const item of list) {
    if (item.toLowerCase() === lower) return true;
  }
  return false;
}

function deriveRunsOn(row, catalogs) {
  const arch = row.architecture;
  const hasGguf = Array.isArray(row.gguf) && row.gguf.length > 0;
  const llamaArch = archInList(arch, catalogs.llamacpp);
  const vllmArch = archInList(arch, catalogs.vllm);
  const sglangArch = archInList(arch, catalogs.sglang);
  const ollamaSlug = ollamaFamilyCandidates(row.id, row.name).find((slug) => catalogs.ollama.has(slug));
  const ollamaYes = Boolean(ollamaSlug);
  const strata = STRATA_FLASH.test(`${row.id} ${row.name}`);
  const hit = (id, yes, evidence) => ({
    id,
    status: yes ? 'yes' : 'unknown',
    evidence: yes ? evidence : '',
  });
  return [
    hit('llamacpp', hasGguf || llamaArch, hasGguf ? 'gguf' : llamaArch ? 'llamacpp-arch' : ''),
    hit('strata', strata, strata ? 'backends-strata' : ''),
    hit('vllm', vllmArch, vllmArch ? 'vllm-arch' : ''),
    hit('ollama', ollamaYes, ollamaYes ? 'ollama-library' : ''),
    hit('lmstudio', hasGguf, hasGguf ? 'gguf' : ''),
    hit('lemonade', hasGguf, hasGguf ? 'gguf' : ''),
    hit('sglang', sglangArch, sglangArch ? 'sglang-arch' : ''),
  ];
}

function readCatalogSnapshot() {
  if (!existsSync(CATALOG_OUT)) {
    return { as_of: '', llamacpp: new Set(), vllm: new Set(), ollama: new Set(), sglang: new Set() };
  }
  try {
    const parsed = JSON.parse(readFileSync(CATALOG_OUT, 'utf8'));
    return {
      as_of: parsed.as_of || '',
      llamacpp: new Set(parsed.llamacpp || []),
      vllm: new Set(parsed.vllm || []),
      ollama: new Set(parsed.ollama || []),
      sglang: new Set(parsed.sglang || []),
    };
  } catch {
    return { as_of: '', llamacpp: new Set(), vllm: new Set(), ollama: new Set(), sglang: new Set() };
  }
}

async function fetchSglangArches() {
  const arches = new Set();
  let listing;
  try {
    listing = await hfGet(SGLANG_MODELS);
  } catch {
    return arches;
  }
  if (!Array.isArray(listing)) return arches;
  const files = listing.filter(
    (row) =>
      row?.type === 'file' &&
      typeof row.name === 'string' &&
      row.name.endsWith('.py') &&
      !['__init__.py', 'registry.py', 'utils.py'].includes(row.name) &&
      typeof row.download_url === 'string',
  );
  for (const file of files) {
    await sleep(40);
    try {
      const text = await textGet(file.download_url);
      if (!text) continue;
      for (const match of text.matchAll(/class\s+([A-Za-z][A-Za-z0-9_]*(?:ForCausalLM|ForConditionalGeneration|LMHeadModel))/g)) {
        arches.add(match[1]);
      }
      for (const match of text.matchAll(/EntryClass\s*=\s*([^\n]+)/g)) {
        for (const name of match[1].matchAll(/[A-Za-z][A-Za-z0-9_]+/g)) {
          if (/(?:ForCausalLM|ForConditionalGeneration|LMHeadModel)$/.test(name[0])) arches.add(name[0]);
        }
      }
    } catch {
      /* keep going */
    }
  }
  return arches;
}

async function loadEngineCatalogs() {
  const snapshot = readCatalogSnapshot();
  const catalogs = {
    as_of: new Date().toISOString(),
    llamacpp: new Set(snapshot.llamacpp),
    vllm: new Set(snapshot.vllm),
    ollama: new Set(snapshot.ollama),
    sglang: new Set(snapshot.sglang),
  };
  try {
    const llama = parseArchKeys(await textGet(LLAMA_CONVERT));
    if (llama.size) catalogs.llamacpp = llama;
  } catch (err) {
    console.warn(`llama.cpp arch list: ${err instanceof Error ? err.message : err}`);
  }
  try {
    const vllm = parseArchKeys(await textGet(VLLM_REGISTRY));
    if (vllm.size) catalogs.vllm = vllm;
  } catch (err) {
    console.warn(`vLLM arch list: ${err instanceof Error ? err.message : err}`);
  }
  try {
    const ollama = parseOllamaSlugs(await textGet(OLLAMA_LIBRARY));
    if (ollama.size) catalogs.ollama = ollama;
  } catch (err) {
    console.warn(`Ollama library: ${err instanceof Error ? err.message : err}`);
  }
  try {
    const sglang = await fetchSglangArches();
    if (sglang.size) catalogs.sglang = sglang;
  } catch (err) {
    console.warn(`SGLang arch list: ${err instanceof Error ? err.message : err}`);
  }
  const file = {
    as_of: catalogs.as_of,
    sources: {
      llamacpp: LLAMA_CONVERT,
      vllm: VLLM_REGISTRY,
      ollama: OLLAMA_LIBRARY,
      sglang: SGLANG_MODELS,
      strata: 'https://amdai.net/backends/strata',
    },
    llamacpp: [...catalogs.llamacpp].sort(),
    vllm: [...catalogs.vllm].sort(),
    ollama: [...catalogs.ollama].sort(),
    sglang: [...catalogs.sglang].sort(),
  };
  mkdirSync(dirname(CATALOG_OUT), { recursive: true });
  writeFileSync(CATALOG_OUT, `${JSON.stringify(file, null, 2)}\n`);
  console.log(
    `engine catalogs · llama.cpp ${file.llamacpp.length} · vLLM ${file.vllm.length} · Ollama ${file.ollama.length} · SGLang ${file.sglang.length}`,
  );
  return catalogs;
}

async function hfGet(url, attempt = 0) {
  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': UA },
  });
  if (res.status === 429 && attempt < 5) {
    const wait = Number(res.headers.get('retry-after') || 0) * 1000 || 1500 * (attempt + 1);
    await sleep(wait);
    return hfGet(url, attempt + 1);
  }
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

function knownOrg(author) {
  return KNOWN_ORGS.has(String(author || '').toLowerCase());
}

function isSpam(row) {
  const id = String(row.id || '');
  const name = id.split('/').pop() || id;
  if (BANNED_NAME.test(id) || BANNED_NAME.test(name)) return true;
  if (SPAM_NAME.test(id) || SPAM_NAME.test(name)) return true;
  if (FORMAT_DUMP.test(id) || FORMAT_DUMP.test(name)) return true;
  const tags = (row.tags || []).map(String);
  if (tags.includes('gguf') && !knownOrg(authorOf(row))) return true;
  return false;
}

function keepListing(row, trendingIds) {
  if (!row?.id) return false;
  const author = authorOf(row);
  if (!author) return false;
  if (isSpam(row)) return false;
  const pipeline = String(row.pipeline_tag || '');
  if (!PIPELINES.has(pipeline)) return false;
  const created = dayKey(row.createdAt);
  const updated = dayKey(row.lastModified || row.updatedAt);
  const cut = cutoffDay();
  if ((!created || created < cut) && (!updated || updated < cut)) return false;
  if (created && created < cut) return false;
  const known = knownOrg(author);
  const trending = trendingIds.has(row.id) || Number(row.trendingScore || 0) >= 5;
  const downloads = Number(row.downloads || 0);
  const likes = Number(row.likes || 0);
  if (known) return true;
  if (trending && (downloads >= 80 || likes >= 8)) return true;
  return false;
}

function sizeFromId(id) {
  const moe = String(id).match(/(\d+(?:\.\d+)?)B-A(\d+(?:\.\d+)?)B/i);
  if (moe) return { total: Number(moe[1]), active: Number(moe[2]) };
  const dense = String(id).match(/(?:^|[-_\/])(\d+(?:\.\d+)?)B(?:[-_]|$)/i);
  return { total: dense ? Number(dense[1]) : null, active: null };
}

function paramsFromSafetensors(detail) {
  const total = detail?.safetensors?.total;
  if (typeof total === 'number' && total > 0) return Math.round((total / 1e9) * 100) / 100;
  return null;
}

function paramsPair(detail, config, id) {
  const fromId = sizeFromId(id);
  const fromSt = paramsFromSafetensors(detail);
  let total = fromSt;
  if (fromId.total != null) {
    if (fromSt == null || fromSt < fromId.total * 0.5 || fromSt > fromId.total * 1.6) {
      total = fromId.total;
    }
  }
  let active = fromId.active;
  if (active == null && total != null) {
    const experts = Number(config?.num_experts ?? config?.n_routed_experts ?? config?.num_local_experts ?? 0);
    const perTok = Number(config?.num_experts_per_tok ?? config?.moe_topk ?? 0);
    if (experts > 1 && perTok > 0 && perTok < experts) {
      active = Math.round(total * (perTok / experts) * 100) / 100;
    }
  }
  if (active == null) active = total;
  return { total, active };
}

function contextFromConfig(config) {
  const keys = [
    'max_position_embeddings',
    'max_seq_len',
    'max_sequence_length',
    'seq_length',
    'model_max_length',
    'max_length',
    'n_positions',
  ];
  for (const key of keys) {
    const n = Number(config?.[key]);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

function architectureOf(detail, config) {
  const arch = config?.architectures?.[0] || config?.model_type || detail?.config?.model_type;
  return arch ? String(arch) : null;
}

function licenseOf(detail) {
  const card = detail?.cardData || {};
  const raw = card.license || card.license_name || detail?.license;
  return raw ? String(raw) : null;
}

function modalitiesOf(detail) {
  const tags = new Set((detail?.tags || []).map((t) => String(t).toLowerCase()));
  const out = new Set(['text']);
  if (detail?.pipeline_tag === 'image-text-to-text' || tags.has('image-text-to-text') || tags.has('vision')) {
    out.add('image');
  }
  if (tags.has('audio') || tags.has('speech')) out.add('audio');
  if (tags.has('video')) out.add('video');
  return [...out];
}

function quantLabel(filename) {
  const base = String(filename).split('/').pop() || '';
  if (!/\.gguf$/i.test(base)) return null;
  if (Q1Q2.test(base)) return null;
  const m = base.match(
    /\b(UD-)?(IQ3_[A-Z]+|Q8_0|Q6_K(?:_XL)?|Q5_K_(?:M|S|XL)|Q4_K_(?:M|S|XL)|Q3_K_(?:M|S|XL|L)|Q8|Q6|Q5|Q4|Q3)\b/i,
  );
  if (!m) return null;
  return `${m[1] ? 'UD-' : ''}${String(m[2]).toUpperCase()}`;
}

function estimateQ4(paramsB) {
  if (paramsB == null || paramsB <= 0) return null;
  const bytes = paramsB * 1e9 * (Q4_BPW / 8);
  return Math.round((bytes / 1024 ** 3) * 10) / 10;
}

function fitVerdict(q4Gib, vram) {
  if (q4Gib == null) return 'unknown';
  const need = q4Gib + OVERHEAD_GIB;
  if (need <= vram * 0.92) return 'fits';
  if (need <= vram) return 'tight';
  return 'no';
}

function sizeBand(paramsB) {
  if (paramsB == null || paramsB <= 0) return 'unknown';
  if (paramsB < 8) return '<8B';
  if (paramsB < 20) return '8-20B';
  if (paramsB < 40) return '20-40B';
  if (paramsB < 80) return '40-80B';
  return '80B+';
}

async function listUrl(url) {
  const rows = await hfGet(url);
  return Array.isArray(rows) ? rows : [];
}

async function listPipeline(pipeline, sort, limit) {
  return listUrl(
    `${API}?pipeline_tag=${encodeURIComponent(pipeline)}&sort=${encodeURIComponent(sort)}&direction=-1&limit=${limit}`,
  );
}

function listedQ4Size(siblings) {
  if (!Array.isArray(siblings)) return null;
  for (const sib of siblings) {
    const name = String(sib.rfilename || sib.path || '');
    const label = quantLabel(name);
    if (!label || !/Q4_K_M/i.test(label)) continue;
    const size = Number(sib.size);
    if (Number.isFinite(size) && size > 0) return Math.round((size / 1024 ** 3) * 10) / 10;
  }
  return null;
}

async function ggufFor(id) {
  const name = id.split('/')[1] || id;
  const packs = [];
  const seen = new Set();
  await sleep(80);
  let hits = [];
  try {
    hits = await listUrl(`${API}?search=${encodeURIComponent(`${name} GGUF`)}&limit=16`);
  } catch {
    return packs;
  }
  const matches = hits.filter((hit) => {
    const hid = String(hit.id || '');
    const org = authorOf(hit).toLowerCase();
    return PACKAGERS.includes(org) && hid.toLowerCase().includes(name.toLowerCase()) && /gguf/i.test(hid);
  });
  for (const match of matches) {
    if (!match?.id || seen.has(match.id)) continue;
    seen.add(match.id);
    await sleep(80);
    let detail = null;
    try {
      detail = await hfGet(`${API}/${match.id}`);
    } catch {
      continue;
    }
    const siblings = detail?.siblings || [];
    const quants = [];
    const qset = new Set();
    for (const sib of siblings) {
      const label = quantLabel(sib.rfilename);
      if (!label || qset.has(label)) continue;
      qset.add(label);
      quants.push(label);
    }
    if (!quants.length) continue;
    packs.push({
      org: authorOf(match),
      repo: match.id,
      href: `${HF}/${match.id}`,
      quants,
      q4Listed: listedQ4Size(siblings),
    });
  }
  return packs;
}

async function configJson(id) {
  const url = `${HF}/${id}/resolve/main/config.json`;
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': UA } });
    if (res.status === 429) {
      await sleep(1500);
      return configJson(id);
    }
    if (!res.ok) return {};
    const parsed = await res.json();
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function emptyFile() {
  return {
    schema: SCHEMA,
    as_of: new Date().toISOString(),
    source: API,
    window_days: WINDOW_DAYS,
    days: [],
  };
}

function readExisting(path) {
  if (!existsSync(path)) return emptyFile();
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8'));
    if (parsed?.schema === SCHEMA && Array.isArray(parsed.days)) return parsed;
  } catch {
    /* start clean */
  }
  return emptyFile();
}

function flatten(file) {
  return file.days.flatMap((day) => day.models || []);
}

function groupDays(models, cut) {
  const map = new Map();
  for (const row of models) {
    if (!row?.id || !row.released || row.released < cut) continue;
    if (BANNED_NAME.test(row.id) || BANNED_NAME.test(row.name || '')) continue;
    const list = map.get(row.released) ?? [];
    list.push(row);
    map.set(row.released, list);
  }
  return [...map.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, rows]) => ({
      date,
      models: rows.sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id)),
    }));
}

async function enrich(listing, trendingIds) {
  const detail = await hfGet(`${API}/${listing.id}`);
  if (!detail) return null;
  const released = dayKey(detail.createdAt || listing.createdAt);
  if (!released || released < cutoffDay()) return null;
  if (BANNED_NAME.test(detail.id || listing.id)) return null;
  await sleep(60);
  const fileConfig = await configJson(listing.id);
  const apiConfig = detail.config && typeof detail.config === 'object' ? detail.config : {};
  const config = { ...apiConfig, ...fileConfig };
  const { total: paramsB, active } = paramsPair(detail, config, listing.id);
  if (paramsB == null && !architectureOf(detail, config) && contextFromConfig(config) == null) {
    return null;
  }
  const packs = await ggufFor(listing.id);
  const listed = packs.map((p) => p.q4Listed).find((n) => n != null) ?? null;
  const q4 = listed ?? estimateQ4(paramsB);
  const kind = listed != null ? 'listed' : q4 != null ? 'estimate' : 'unknown';
  const gguf = packs.map(({ org, repo, href, quants }) => ({ org, repo, href, quants }));
  const author = authorOf(detail) || authorOf(listing);
  return {
    id: listing.id,
    name: listing.id.split('/')[1] || listing.id,
    href: `${HF}/${listing.id}`,
    maker: author,
    released,
    updated: dayKey(detail.lastModified || listing.lastModified) || released,
    params_b: paramsB,
    active_params_b: active,
    architecture: architectureOf(detail, config),
    context: contextFromConfig(config),
    license: licenseOf(detail),
    modalities: modalitiesOf(detail),
    pipeline: String(detail.pipeline_tag || listing.pipeline_tag || 'text-generation'),
    downloads: Number(detail.downloads ?? listing.downloads ?? 0),
    likes: Number(detail.likes ?? listing.likes ?? 0),
    trending: trendingIds.has(listing.id),
    known_org: knownOrg(author),
    gguf,
    q4_k_m_gib: q4,
    q4_k_m_kind: kind,
    fit: {
      16: fitVerdict(q4, 16),
      24: fitVerdict(q4, 24),
      32: fitVerdict(q4, 32),
      '2x32': fitVerdict(q4, 64),
    },
    size_band: sizeBand(paramsB),
    runs_on: [],
  };
}

async function collectListings() {
  const trendingIds = new Set();
  const listings = new Map();

  for (const pipeline of PIPELINES) {
    await sleep(80);
    const created = await listPipeline(pipeline, 'createdAt', 100);
    for (const row of created) if (row?.id) listings.set(row.id, row);
    await sleep(80);
    const trending = await listPipeline(pipeline, 'trendingScore', 60);
    for (const row of trending) {
      if (!row?.id) continue;
      trendingIds.add(row.id);
      listings.set(row.id, { ...listings.get(row.id), ...row });
    }
  }

  for (const org of KNOWN_ORG_LIST) {
    await sleep(70);
    try {
      const rows = await listUrl(`${API}?author=${encodeURIComponent(org)}&sort=createdAt&direction=-1&limit=16`);
      for (const row of rows) {
        if (!row?.id) continue;
        listings.set(row.id, { ...row, author: row.author || org });
      }
    } catch (err) {
      console.warn(`skip org ${org}: ${err instanceof Error ? err.message : err}`);
    }
  }

  return { listings, trendingIds };
}

async function main() {
  const out = resolve(process.env.NEW_MODELS_OUT || DEFAULT_OUT);
  const existingPath = resolve(process.env.NEW_MODELS_EXISTING || out);
  const existing = readExisting(existingPath);
  const byId = new Map(flatten(existing).map((row) => [row.id, row]));
  const catalogs = await loadEngineCatalogs();
  const cap = Number(process.env.NEW_MODELS_MAX || 80);
  const skipHub = Number.isFinite(cap) && cap === 0;

  let fetched = 0;
  let candidates = [];
  if (!skipHub) {
    const { listings, trendingIds } = await collectListings();
    candidates = [...listings.values()]
      .filter((row) => keepListing(row, trendingIds))
      .sort((a, b) => {
        const knownDelta = Number(knownOrg(authorOf(b))) - Number(knownOrg(authorOf(a)));
        if (knownDelta) return knownDelta;
        return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
      });

    const picked = candidates.slice(0, Number.isFinite(cap) && cap > 0 ? cap : 80);
    for (const listing of picked) {
      await sleep(90);
      try {
        const row = await enrich(listing, trendingIds);
        if (row) {
          byId.set(row.id, row);
          fetched += 1;
          console.log(`kept ${row.id}`);
        }
      } catch (err) {
        console.warn(`skip ${listing.id}: ${err instanceof Error ? err.message : err}`);
      }
    }
  }

  for (const [id, row] of byId) {
    byId.set(id, { ...row, runs_on: deriveRunsOn(row, catalogs) });
  }

  const file = {
    schema: SCHEMA,
    as_of: new Date().toISOString(),
    source: API,
    window_days: WINDOW_DAYS,
    days: groupDays([...byId.values()], cutoffDay()),
  };
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify(file, null, 2)}\n`);
  const count = flatten(file).length;
  console.log(
    `wrote ${out} · ${count} models · ${file.days.length} days · fetched ${fetched} · candidates ${candidates.length}`,
  );
  if (!count) {
    console.warn('no models kept — Hub may have rate-limited or the 90-day window is empty');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
